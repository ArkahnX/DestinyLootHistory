tracker.sendAppView('MainScreen');
var jsonCharacterDescriptions = "";
if (localStorage.characterDescriptions) {
	characterDescriptions = JSON.parse(localStorage.characterDescriptions);
	jsonCharacterDescriptions = localStorage.characterDescriptions;
}
var debugMessage = `Destiny Loot History V${chrome.runtime.getManifest().version}
GitHub: https://github.com/ArkahnX/DestinyLootHistory
Gallery: http://imgur.com/a/QGLZf
Reddit: https://www.reddit.com/message/compose/?to=ArkahnX`;
console.log(debugMessage);

document.addEventListener("DOMContentLoaded", function () {
	initUi(document.body);
}, false);

var notificationCooldown = 0;

function frontEndUpdate() {
	getAllOptions().then(function (options) {
		globalOptions = options;
		tags.update();
	});
	if (location.hash === "#notifications") {
		window.location.hash = "";
		notification.show();
	}
	if (elements.toggleSystem) {
		getOption("activeType").then(function (activeType) {
			if (activeType === "xbl" && elements.toggleSystem.value !== "Swap to PSN") {
				elements.toggleSystem.value = "Swap to PSN";
				elements.toggleSystem.classList.remove("green");
			}
			if (activeType === "psn" && elements.toggleSystem.value !== "Swap to XBOX") {
				elements.toggleSystem.value = "Swap to XBOX";
				elements.toggleSystem.classList.add("green");
			}
		});
	}
	if (localStorage.error === "true") {
		if (notificationCooldown === 0) {
			elements.status.classList.add("active", "error");
			elements.status.classList.remove("idle");
			localStorage.listening = "false";
		}
	} else {
		if (localStorage.notificationClosed === "false") {
			notification.update();
		} else {
			// notification.hide();
		}
		if (localStorage.listening === "false") {
			elements.status.classList.add("idle");
			elements.status.classList.remove("active", "error");
			localStorage.listening = "false";
		} else if (localStorage.listening === "true") {
			elements.status.classList.remove("idle", "error");
			elements.status.classList.add("active");
		}
	}
	if (notificationCooldown % 500 === 0) {
		var timestamps = document.querySelectorAll(".timestamp");
		for (var item of timestamps) {
			var localTime = moment.utc(item.dataset.timestamp).tz(timezone);
			var activityString = "";
			var link1 = "";
			var link2 = "";
			if (item.dataset.activity) {
				var activityDef = DestinyActivityDefinition[item.dataset.activity];
				var activityTypeDef = DestinyActivityTypeDefinition[item.dataset.activityType];
				if (activityDef && activityTypeDef) {
					var activityName = activityDef.activityName;
					var activityTypeName = activityTypeDef.activityTypeName;
					activityString = activityTypeName + " - " + activityName;
					link1 = `<a href="http://destinytracker.com/dg/${item.dataset.instance}" target='_blank'>`;
					link2 = "</a>";
				}
				if (globalOptions.pgcrImage) {
					item.style.backgroundImage = `url(https://www.bungie.net${activityDef.pgcrImage})`;
					item.classList.add("bg");
				} else {
					item.style.backgroundImage = "";
					item.classList.remove("bg");
				}
			}
			if (globalOptions.relativeDates) {
				item.innerHTML = link1 + localTime.fromNow() + "<br>" + activityString + link2;
			} else {
				item.innerHTML = link1 + localTime.format("ddd[,] ll LTS") + "<br>" + activityString + link2;
			}
			item.setAttribute("title", localTime.format("ddd[,] ll LTS") + "\n" + activityString);
		}
	}
	notificationCooldown++;
	if (notificationCooldown > 7200) {
		notificationCooldown = 0;
		if (jsonCharacterDescriptions !== localStorage.characterDescriptions) {
			characterDescriptions = JSON.parse(localStorage.characterDescriptions);
			jsonCharacterDescriptions = localStorage.characterDescriptions;
		}
	}
	if (localStorage.updateUI === "true" || notificationCooldown === 0 || pageNumber !== oldPageNumber) {
		localStorage.updateUI = "false";
		database.getMultipleStores(["itemChanges", "inventories"]).then(function chromeStorageGet(localData) {
			currentItemSet = localData.itemChanges;
			if (!currentItemSet || !currentItemSet.length && localStorage.error === "false") {
				document.getElementById("noItemOverlay").classList.remove("hidden");
			} else {
				document.getElementById("noItemOverlay").classList.add("hidden");
			}
			newInventories = localData.inventories;
			tags.cleanup(newInventories);
			console.time("UpdateUI");
			newDisplayResults().then(function () {
				postDisplay();
				console.timeEnd("UpdateUI");
				window.requestAnimationFrame(frontEndUpdate);
			});
		});
	} else {
		window.requestAnimationFrame(frontEndUpdate);
	}
}

chrome.storage.sync.get(["authCode", "accessToken", "refreshToken"], function (tokens) {
	if (chrome.runtime.lastError) {
		console.error(chrome.runtime.lastError);
	}
	if (Object.keys(tokens).length === 0) {
		window.location.href = "auth.html";
	} else {
		getAllOptions().then(function (options) {
			globalOptions = options;
			database.open().then(function () {
				database.getMultipleStores(database.allStores).then(function (result) {
					localStorage.updateUI = "true";
					frontEndUpdate();
					console.log(result);
				});
			});
		});
	}
});