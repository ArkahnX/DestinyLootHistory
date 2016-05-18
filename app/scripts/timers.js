var dirtyTimeout = null;
var oldFactionProgress = 0;

function dirtyItemCheck() {
	if (localStorage.error === "false") {
		chrome.browserAction.setBadgeText({
			text: ""
		});
		var factionProgress = 0;
		clearTimeout(dirtyTimeout);
		sequence(characterIdList, function(item, resolve) {
			if (item !== "vault") {
				bungie.factions(item, resolve);
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
			if (factionProgress !== oldFactionProgress) {
				console.log("Beginning tracking again.");
				recursiveIdleTracking();
				oldFactionProgress = factionProgress;
			}
			if (localStorage.listening === "false") {
				dirtyTimeout = setTimeout(dirtyItemCheck, 1000 * 10);
			}
		});
	} else {
		chrome.browserAction.setBadgeText({
			text: "!"
		});
		dirtyTimeout = setTimeout(dirtyItemCheck, 1000 * 10);
	}
}

function checkForUpdates() {
	var header = document.querySelector("#status");
	var element = document.querySelector("#startTracking");
	if (localStorage.error === "true") {
		header.classList.add("active", "error");
		header.classList.remove("idle");
		characterDescriptions = JSON.parse(localStorage.characterDescriptions);
	} else {
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
			setTimeout(checkForUpdates, 5000);
		});
	});
}

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

function beginBackendTracking() {
	localStorage.listening = "true";
	clearInterval(listenLoop);
	listenLoop = null;
	clearInterval(stopLoop);
	stopLoop = null;
	recursiveIdleTracking();
	setInterval(function() {
		if (localStorage.manual === "true" && runningCheck === false) {
			localStorage.manual = "false";
			localStorage.listening = "true";
			console.log("Forcing check now");
			recursiveIdleTracking();
		}
	}, 1000);
}

var runningCheck = false;
var idleTimer = 0;
var timeoutTracker = null;

function recursiveIdleTracking() {
	var startTime = window.performance.now();
	runningCheck = true;
	clearTimeout(timeoutTracker);
	clearTimeout(dirtyTimeout);
	timeoutTracker = null;
	chrome.browserAction.setBadgeText({
		text: ""
	});
	checkInventory().then(function() {
		var endTime = window.performance.now();
		var resultTime = Math.floor(endTime - startTime);
		if (localStorage.flag === "false") {
			idleTimer++;
		}
		if (localStorage.flag === "true") {
			idleTimer = 0;
		}
		console.log(moment().utc().format());
		if (localStorage.error === "true") {
			chrome.browserAction.setBadgeText({
				text: "!"
			});
			idleTimer = 0;
			localStorage.listening = "true";
			let endTime = window.performance.now();
			let resultTime = Math.floor(endTime - startTime);
			console.log("Scheduling check for ", ((5 * 1000) - resultTime) / 1000, "s from now.");
			timeoutTracker = setTimeout(recursiveIdleTracking, (5 * 1000) - resultTime);
			dirtyItemCheck();
			runningCheck = false;
		} else if (localStorage.flag === "true" || (localStorage.listening === "true" && idleTimer < 15)) {
			console.log(15 - idleTimer, "checks remaining.");
			localStorage.listening = "true";
			localStorage.flag = "false";
			console.log("Scheduling check for ", ((20 * 1000) - resultTime) / 1000, "s from now.");
			timeoutTracker = setTimeout(recursiveIdleTracking, (20 * 1000) - resultTime);
		} else {
			idleTimer = 0;
			localStorage.listening = "false";
			console.log("Scheduling check for ", ((5 * 60 * 1000) - resultTime) / 1000, "s from now.");
			timeoutTracker = setTimeout(recursiveIdleTracking, (5 * 60 * 1000) - resultTime);
			dirtyItemCheck();
		}
		runningCheck = false;
	});
}