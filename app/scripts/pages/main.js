tracker.sendAppView('MainScreen');
if (localStorage.characterDescriptions) {
	characterDescriptions = JSON.parse(localStorage.characterDescriptions);
	jsonCharacterDescriptions = localStorage.characterDescriptions;
}

chrome.storage.local.get(null, function(result) {
	if (chrome.runtime.lastError) {
		logger.error(chrome.runtime.lastError);
	}
	console.log(result);
});

logger.disable();
document.addEventListener("DOMContentLoaded", function() {
	initUi();
}, false);

var jsonCharacterDescriptions = "";
var notificationCooldown = 0;

function frontEndUpdate() {
	if (elements.toggleSystem) {
		if (localStorage.activeType === "xbl" && elements.toggleSystem.value !== "Swap to PSN") {
			elements.toggleSystem.value = "Swap to PSN";
			elements.toggleSystem.classList.remove("green");
		}
		if (localStorage.activeType === "psn" && elements.toggleSystem.value !== "Swap to XBOX") {
			elements.toggleSystem.value = "Swap to XBOX";
			elements.toggleSystem.classList.add("green");
		}
	}
	if (localStorage.error === "true") {
		if (notificationCooldown === 0) {
			notification.show();
			elements.status.classList.add("active", "error");
			elements.status.classList.remove("idle");
			elements.startTracking.setAttribute("value", "Begin Tracking");
			localStorage.listening = "false";
		}
	} else {
		if (localStorage.notificationClosed === "false") {
			notification.show(notification.changelog);
		} else {
			notification.hide();
		}
		if (localStorage.listening === "false" && elements.startTracking.value !== "Begin Tracking") {
			elements.status.classList.add("idle");
			elements.status.classList.remove("active", "error");
			elements.startTracking.setAttribute("value", "Begin Tracking");
			localStorage.listening = "false";
		} else if (localStorage.listening === "true" && elements.startTracking.value !== "Stop Tracking") {
			elements.status.classList.remove("idle", "error");
			elements.status.classList.add("active");
			elements.startTracking.setAttribute("value", "Stop Tracking");
		}
	}
	if (notificationCooldown === 0) {
		var timestamps = document.querySelectorAll(".timestamp");
		for (var item of timestamps) {
			var localTime = moment.utc(item.dataset.timestamp).tz(timezone);
			item.textContent = localTime.fromNow() + item.dataset.activity;
			item.setAttribute("title", localTime.format("ddd[,] ll LTS"));
		}
		chrome.storage.local.get("itemChanges", function chromeStorageGet(localData) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			if (currentItemSet.length !== localData.itemChanges.length) {
				currentItemSet = localData.itemChanges;
				displayResults().then(function() {

				});
			}
		});
	}
	notificationCooldown++;
	if (notificationCooldown > 500) {
		notificationCooldown = 0;
	}
	if (jsonCharacterDescriptions !== localStorage.characterDescriptions) {
		characterDescriptions = JSON.parse(localStorage.characterDescriptions);
		jsonCharacterDescriptions = localStorage.characterDescriptions;
	}
	window.requestAnimationFrame(frontEndUpdate);
}

frontEndUpdate();