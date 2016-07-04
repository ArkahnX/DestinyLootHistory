var dirtyTimeout = null;
var oldFactionProgress = 0;
var listenLoop = null;
var stopLoop = null;


/**
 * Do a rough faction check to see if the player has played recently. Can be replaced with lastPlayedDate.
 */
function dirtyItemCheck() {
	logger.startLogging("timers");
	logger.log("dirtyItemCheck");
	logger.saveData();
	allowBungieTracking().then(function(allowTracking) {
		logger.startLogging("timers");
		if (allowTracking.allow_tracking) {
			if (localStorage.error === "false") {
				chrome.browserAction.setBadgeText({
					text: ""
				});
				clearTimeout(dirtyTimeout);
				var oldCharacterDates = 0;
				var newCharacterDates = 0;
				for (var character in characterDescriptions) {
					if (character.dateLastPlayed) {
						oldCharacterDates += new Date(character.dateLastPlayed).getTime();
					}
				}
				initItems(function() {
					for (var character in characterDescriptions) {
						if (character.dateLastPlayed) {
							newCharacterDates += new Date(character.dateLastPlayed).getTime();
						}
					}
					logger.startLogging("Timers");
					if (newCharacterDates !== oldCharacterDates) { // if new character dates is not equal to old character dates
						logger.log("Beginning tracking");
						localStorage.listening = "true";
						recursiveIdleTracking(); // found in this script.
					}
					if (localStorage.listening === "false") {
						dirtyTimeout = setTimeout(dirtyItemCheck, 1000 * 60); // check 60 seconds later
					}
				});
			} else {
				chrome.browserAction.setBadgeText({
					text: "!"
				});
				dirtyTimeout = setTimeout(dirtyItemCheck, 1000 * 60);
			}
			logger.saveData();
		} else {
			beginBackendTracking(allowTracking);
		}
	});
}

var updateTimeout = null;

function checkForUpdates() {
	logger.startLogging("timers");
	logger.log("checkForUpdates");
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
	logger.startLogging("timers");
	logger.log("trackIdle");
	if (stopLoop !== null) {
		clearInterval(stopLoop);
	}
	stopLoop = setInterval(function() {
		stopListening();
	}, 1000 * 60 * 30);
}

var checkInterval = null;


/**
 * STEP 2
 * Check to see if we should force run, or if we are allowed to run
 */
function beginBackendTracking(allowTracking) {
	logger.startLogging("timers");
	logger.log("beginBackendTracking");
	// logger.log("Arrived at beginBackendTracking");
	// If we have an error, throw an exclamation mark on the extension icon.
	clearInterval(checkInterval);
	clearInterval(listenLoop);
	listenLoop = null;
	clearInterval(stopLoop);
	stopLoop = null;
	if ((allowTracking.allow_tracking === 1 && localStorage.itemError === "false") || !chrome.runtime.getManifest().key) {
		localStorage.manual = "false";
		localStorage.listening = "true";
		recursiveIdleTracking(); // found in this script.
	} else {
		if (localStorage.error === "false") {
			localStorage.error = "true";
			localStorage.errorMessage = allowTracking.tracking_message;
		}
		localStorage.flag = "false";
		localStorage.listening = "false";
		localStorage.manual = "false";
	}
	clearTimeout(checkInterval);
	// this timer checks if "start tracking" was pressed, but only if we aren't already tracking.
	checkInterval = setTimeout(apiCheck, 1000);
}
var runningCheck = false;

function apiCheck() {
	// logger.log("Arrived at apiCheck");
	// console.log(localStorage.manual, runningCheck)
	logger.startLogging("Timers");
	if (localStorage.manual === "true" && runningCheck === false) {
		allowBungieTracking().then(function(allowTracking) {
			initItems(function() {
				if (allowTracking.allow_tracking === 1 || !chrome.runtime.getManifest().key) {
					localStorage.manual = "false";
					localStorage.listening = "true";
					logger.log("Forcing check now");
					recursiveIdleTracking(); // found in this script.
				} else {
					if (localStorage.error === "false") {
						localStorage.error = "true";
						localStorage.errorMessage = allowTracking.tracking_message;
					}
					localStorage.flag = "false";
					localStorage.listening = "false";
					localStorage.manual = "false";
					checkInterval = setTimeout(apiCheck, 1000);
				}
			});
		});
	} else {
		checkInterval = setTimeout(apiCheck, 1000);
	}
}

var idleTimer = 0;
var timeoutTracker = null;


/**
 * STEP 3
 * main inventory checker. 
 */
function recursiveIdleTracking() {
	logger.startLogging("timers");
	logger.log("recursiveIdleTracking")
		// logger.log("Arrived at recursiveIdleTracking");
	logger.saveData();
	var startTime = window.performance.now();
	runningCheck = true;
	clearTimeout(timeoutTracker);
	clearTimeout(dirtyTimeout);
	timeoutTracker = null;
	chrome.browserAction.setBadgeText({
		text: ""
	});
	allowBungieTracking().then(function(allowTracking) {
		if (allowTracking.allow_tracking || !chrome.runtime.getManifest().key) {
			checkInventory().then(function() { // found in items.js
				logger.startLogging("timers");
				logger.log("recursiveIdleTracking2");
				tracker.sendEvent('Passed BungieTracking and CheckInventory', `No Issues`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
				// _gaq.push(['_trackEvent', 'Tracking', `Passed BungieTracking and CheckInventory.`, "", `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
				// reset a bunch of variables
				logger.startLogging("Timers");
				var endTime = window.performance.now();
				var resultTime = Math.floor(endTime - startTime);
				if (localStorage.itemChangeDetected === "false") {
					idleTimer++;
				}
				if (localStorage.itemChangeDetected === "true") {
					idleTimer = 0;
				}
				if (localStorage.error === "true") { // if we have an error
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
				} else if (localStorage.itemChangeDetected === "true" || (localStorage.listening === "true" && idleTimer < 6)) { // If we are tracking
					logger.log(`${6 - idleTimer} checks remaining.`);
					localStorage.listening = "true";
					localStorage.itemChangeDetected = "false";
					logger.log(`Scheduling check for ${moment().add(((60 * 1000) - resultTime) / 1000,"s").format("dddd, MMMM Do YYYY, h:mm:ss a")} or ${((60 * 1000) - resultTime) / 1000} seconds`);
					timeoutTracker = setTimeout(recursiveIdleTracking, (60 * 1000) - resultTime);
				} else { // tracking timed out, check much later as they likely aren't actively playing
					idleTimer = 0;
					localStorage.listening = "false";
					logger.log(`Scheduling check for ${moment().add(((10 * 60 * 1000) - resultTime) / 1000,"s").format("dddd, MMMM Do YYYY, h:mm:ss a")} or ${((10 * 60 * 1000) - resultTime) / 1000} seconds`);
					timeoutTracker = setTimeout(recursiveIdleTracking, (10 * 60 * 1000) - resultTime);
					dirtyItemCheck(); // found in this file
				}
				logger.saveData(); // save logs
				runningCheck = false;
			}).catch(function() {
				runningCheck = false;
				beginBackendTracking(allowTracking);
			});
		} else {
			runningCheck = false;
			beginBackendTracking(allowTracking);
		}
	});
}