tracker.sendAppView('MainScreen');
if (localStorage.characterDescriptions) {
	characterDescriptions = JSON.parse(localStorage.characterDescriptions);
	jsonCharacterDescriptions = localStorage.characterDescriptions;
}
var DEBUG = false;
var manifest = chrome.runtime.getManifest();
if (!manifest.key) {
	DEBUG = true;
}
var debugMessage = `Destiny Loot History V${chrome.runtime.getManifest().version}
GitHub: https://github.com/ArkahnX/DestinyLootHistory
Gallery: http://imgur.com/a/QGLZf
Reddit: https://www.reddit.com/message/compose/?to=ArkahnX`;
console.log(debugMessage);

logger.disable();
document.addEventListener("DOMContentLoaded", function() {
	initUi(elements.container);
}, false);

var jsonCharacterDescriptions = "";
var notificationCooldown = 0;
var globalOptions = {};

function frontEndUpdate() {
	getAllOptions().then(function(options) {
		globalOptions = options;
	});
	if (elements.toggleSystem) {
		getOption("activeType").then(function(activeType) {
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
			notification.show();
			elements.status.classList.add("active", "error");
			elements.status.classList.remove("idle");
			localStorage.listening = "false";
		}
	} else {
		if (localStorage.notificationClosed === "false") {
			notification.show(notification.changelog);
		} else {
			notification.hide();
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
			if (item.dataset.activity) {
				var activityDef = DestinyActivityDefinition[item.dataset.activity];
				var activityTypeDef = DestinyActivityTypeDefinition[item.dataset.activityType];
				if (activityDef && activityTypeDef) {
					var activityName = activityDef.activityName;
					var activityTypeName = activityTypeDef.activityTypeName;
					activityString = activityTypeName + " - " + activityName;
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
				item.innerHTML = localTime.fromNow() + "<br>" + activityString;
			} else {
				item.innerHTML = localTime.format("ddd[,] ll LTS") + "<br>" + activityString;
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
			newInventories = localData.inventories;
			console.time("UpdateUI");
			newDisplayResults().then(function() {
				postDisplay();
				console.timeEnd("UpdateUI");
				window.requestAnimationFrame(frontEndUpdate);
			});
		});
	} else {
		window.requestAnimationFrame(frontEndUpdate);
	}
}
getAllOptions().then(function(options) {
	globalOptions = options;
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			localStorage.updateUI = "true";
			frontEndUpdate();
			// chrome.storage.local.get(null, function(result) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			console.log(result);
		});
	});
});