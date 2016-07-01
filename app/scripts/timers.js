var dirtyTimeout = null;
var oldFactionProgress = 0;
var listenLoop = null;
var stopLoop = null;

function dirtyItemCheck() {
	logger.saveData();
	if (localStorage.error === "false") {
		chrome.browserAction.setBadgeText({
			text: ""
		});
		var factionProgress = 0;
		clearTimeout(dirtyTimeout);
		bungie.setActive(localStorage.activeType);
		sequence(characterIdList, function(item, resolve) {
			if (item !== "vault") {
				bungie.factions(item).then(resolve);
			} else {
				resolve();
			}
		}, function(result, item, index) {
			if (result) {
				var data = result.data;
				for (var i = 0; i < data.progressions.length; i++) {
					factionProgress += data.progressions[i].currentProgress;
				}
			}
		}).then(function() {
			logger.startLogging("Timers");
			if (factionProgress !== oldFactionProgress) {
				logger.log("Beginning tracking again.");
				recursiveIdleTracking();
				oldFactionProgress = factionProgress;
			}
			if (localStorage.listening === "false") {
				dirtyTimeout = setTimeout(dirtyItemCheck, 1000 * 60);
			}
		});
	} else {
		chrome.browserAction.setBadgeText({
			text: "!"
		});
		dirtyTimeout = setTimeout(dirtyItemCheck, 1000 * 60);
	}
	logger.saveData();
}

function checkForUpdates() {
	clearTimeout(updateTimeout);
	var header = document.querySelector("#status");
	var element = document.querySelector("#startTracking");
	if (localStorage.error === "true") {
		notification.show();
		header.classList.add("active", "error");
		header.classList.remove("idle");
		characterDescriptions = JSON.parse(localStorage.characterDescriptions);
	} else {
		notification.hide();
		if (!localStorage.listening || localStorage.listening === "false") {
			header.classList.add("idle");
			header.classList.remove("active", "error");
			element.setAttribute("value", "Begin Tracking");
		}
		if (localStorage.listening === "true") {
			header.classList.remove("idle", "error");
			header.classList.add("active");
			element.setAttribute("value", "Stop Tracking");
		}
	}
	chrome.storage.local.get(null, function(localData) {
		data = localData;
		displayResults().then(function() {
			updateTimeout = setTimeout(checkForUpdates, 5000);
		});
	});
}

var updateTimeout = null;

function startListening() {
	if (listenLoop === null) {
		localStorage.listening = "true";
		trackIdle();

		checkInventory();
		listenLoop = setInterval(function() {
			checkInventory();
			if (localStorage.listening === "false") {
				stopListening();
			}
		}, 20000);
	}
}

function stopListening() {
	if (listenLoop !== null) {
		localStorage.listening = "false";

		clearInterval(listenLoop);
		listenLoop = null;
		clearInterval(stopLoop);
		stopLoop = null;
	}
}

function trackIdle() {
	if (stopLoop !== null) {
		clearInterval(stopLoop);
	}
	stopLoop = setInterval(function() {
		stopListening();
	}, 1000 * 60 * 30);
}

function allowBungieTracking() {
	return new Promise(function(resolve, reject) {
		var r = new XMLHttpRequest();
		r.open("GET", "http://arkahnx.technology/loot.php", true);
		r.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				resolve(JSON.parse(this.response));
			}
		};
		r.send();
	});
}

var checkInterval = null;

function beginBackendTracking() {
	clearInterval(checkInterval);
	setInterval(function() {
		if (localStorage.error === "true") {
			chrome.browserAction.setBadgeText({
				text: "!"
			});
		} else {
			chrome.browserAction.setBadgeText({
				text: ""
			});
		}
	}, 1000);
	allowBungieTracking().then(function(allowTracking) {
		if (allowTracking.allow_tracking === 1) {
			localStorage.listening = "true";
			clearInterval(listenLoop);
			listenLoop = null;
			clearInterval(stopLoop);
			stopLoop = null;
			recursiveIdleTracking();
			clearInterval(checkInterval);
			checkInterval = setInterval(function() {
				logger.startLogging("Timers");
				if (localStorage.manual === "true" && runningCheck === false) {
					localStorage.manual = "false";
					localStorage.listening = "true";
					logger.log("Forcing check now");
					recursiveIdleTracking();
				}
			}, 1000);
		} else {
			localStorage.error = "true";
			localStorage.errorMessage = allowTracking.tracking_message;
			clearInterval(checkInterval);
			checkInterval = setInterval(function() {
				beginBackendTracking();
			}, 30000);
		}
	});
}

var runningCheck = false;
var idleTimer = 0;
var timeoutTracker = null;

function recursiveIdleTracking() {
	logger.saveData();
	var startTime = window.performance.now();
	runningCheck = true;
	clearTimeout(timeoutTracker);
	clearTimeout(dirtyTimeout);
	timeoutTracker = null;
	chrome.browserAction.setBadgeText({
		text: ""
	});
	checkInventory().then(function() {
		logger.startLogging("Timers");
		var endTime = window.performance.now();
		var resultTime = Math.floor(endTime - startTime);
		if (localStorage.flag === "false") {
			idleTimer++;
		}
		if (localStorage.flag === "true") {
			idleTimer = 0;
		}
		if (localStorage.error === "true") {
			chrome.browserAction.setBadgeText({
				text: "!"
			});
			idleTimer = 0;
			localStorage.listening = "true";
			let endTime = window.performance.now();
			let resultTime = Math.floor(endTime - startTime);
			logger.log(`Scheduling check for ${moment().add(((60 * 1000) - resultTime) / 1000,"s").format("dddd, MMMM Do YYYY, h:mm:ss a")} or ${((60 * 1000) - resultTime) / 1000} seconds`);
			timeoutTracker = setTimeout(recursiveIdleTracking, (60 * 1000) - resultTime);
			dirtyItemCheck();
			runningCheck = false;
		} else if (localStorage.flag === "true" || (localStorage.listening === "true" && idleTimer < 15)) {
			logger.log(`${15 - idleTimer} checks remaining.`);
			localStorage.listening = "true";
			localStorage.flag = "false";
			logger.log(`Scheduling check for ${moment().add(((60 * 1000) - resultTime) / 1000,"s").format("dddd, MMMM Do YYYY, h:mm:ss a")} or ${((60 * 1000) - resultTime) / 1000} seconds`);
			timeoutTracker = setTimeout(recursiveIdleTracking, (60 * 1000) - resultTime);
		} else {
			idleTimer = 0;
			localStorage.listening = "false";
			logger.log(`Scheduling check for ${moment().add(((5 * 60 * 1000) - resultTime) / 1000,"s").format("dddd, MMMM Do YYYY, h:mm:ss a")} or ${((5 * 60 * 1000) - resultTime) / 1000} seconds`);
			timeoutTracker = setTimeout(recursiveIdleTracking, (5 * 60 * 1000) - resultTime);
			dirtyItemCheck();
		}
		logger.saveData();
		runningCheck = false;
	});
}