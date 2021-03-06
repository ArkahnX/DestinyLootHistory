var oldCharacterDates = 0;
var timers = {};

function stopTimer(name) {
	clearTimeout(timers[name].id);
	timers[name].id = -1;
}

function startTimer(name, customTime) {
	// console.log(`Queing timer ${name} for ${customTime || timers[name].time}`)
	stopTimer(name);
	timers[name].lastPing = moment().format();
	timers[name].id = setTimeout(timers[name].fn, customTime || timers[name].time);
}

function extensionIcon() {
	if (localStorage.error === "true") {
		chrome.browserAction.setBadgeText({
			text: "!"
		});
	} else {
		chrome.browserAction.setBadgeText({
			text: ""
		});
	}
	startTimer("extensionIcon");
}

function activityTracker() {
	console.log("activityTracker");
	getAllOptions().then(function (options) {
		globalOptions = options;
		refreshCharacterData().then(function afterInitItems() {
			if (localStorage.error === "true") {
				console.log("Extension has an error.");
				localStorage.listening = "false";
				startTimer("activityTracker");
			} else {
				var newCharacterDates = 0;
				for (var character of characterDescriptions) {
					if (character.dateLastPlayed) {
						newCharacterDates += new Date(character.dateLastPlayed).getTime();
					}
				}
				if (newCharacterDates !== oldCharacterDates) { // if new character dates is not equal to old character dates
					console.log("Player character has been played.");
					console.log(`Beginning tracking because character dates "${newCharacterDates} !== ${oldCharacterDates}"`);
					localStorage.listening = "true";
					oldCharacterDates = newCharacterDates;
					startTimer("inventoryCheck", 50);
				} else {
					console.log("Nothing of interest.");
					startTimer("activityTracker");
				}
			}
		});
	});
}

function inventoryCheck() {
	console.log("inventoryCheck");
	var startTime = window.performance.now();
	checkInventory().then(function afterInventoryCheck() { // found in items.js
		console.log("afterInventoryCheck");
		console.log(`Error: ${localStorage.error}, Listening: ${localStorage.listening}, Item Change: ${localStorage.itemChangeDetected}`);
		var endTime = window.performance.now();
		var resultTime = Math.floor(endTime - startTime);
		// tracker.sendEvent('Passed BungieTracking and CheckInventory', `No Issues`, `version ${localStorage.version}, systems ${localStorage.systems}`, resultTime);
		// localStorage.listening = "false";
		console.log(`Scheduling check for ${moment().add(((20 * 60 * 1000) - resultTime) / 1000,"s").format("dddd, MMMM Do YYYY, h:mm:ss a")} or ${((20 * 60 * 1000) - resultTime) / 1000} seconds`);
		startTimer("inventoryCheck", (20 * 60 * 1000) - resultTime);
		startTimer("activityTracker");
	}).catch(function (e) {
		if (e) {
			console.error(e);
		}
		startTimer("activityTracker");
	});
}

timers.extensionIcon = {
	id: -1,
	time: 2000,
	fn: extensionIcon,
	lastPing: moment().format()
};
timers.activityTracker = {
	id: -1,
	time: 10000,
	fn: activityTracker,
	lastPing: moment().format()
};
timers.inventoryCheck = {
	id: -1,
	time: 20 * 60 * 1000,
	fn: inventoryCheck,
	lastPing: moment().format()
};