function _defaultCheck(source, alt) {
	if (typeof source === "object" && source !== null) {
		for (var item of source) {
			if (Array.isArray(item) && item.length === 0) {
				return alt;
			}
		}
	}
	if (Array.isArray(source) && Array.isArray(alt) === false) {
		return alt;
	}
	if (Array.isArray(source) && source.length === 0) {
		return alt;
	}
	if (typeof source !== "undefined") {
		if (typeof source === "string" && source.charAt(0) === "{" || source.charAt(0) === "[") {
			return JSON.parse(source);
		}
		return source;
	}
	return alt;
}

function _checkBoolean(source, alt) {
	if (source === "false" || source === "true") {
		return source;
	}
	return alt;
}

function _checkNumber(source, alt) {
	if (parseInt(source, 10)) {
		return source;
	}
	return alt;
}

function _checkJSON(source, alt) {
	try {
		JSON.parse(source);
	} catch (e) {
		return alt;
	}
	return source;
}

function _checkActiveType(source, alt) {
	if (source === "psn" || source === "xbl") {
		return source;
	}
	return alt;
}

function _checkLength(source, alt) {
	if (source && source.length > 0) {
		return source;
	}
	return alt;
}

function _checkValue(value, expectedFunction, fallback) {
	if (!fallback) {
		fallback = expectedFunction;
		expectedFunction = _defaultCheck;
	}
	return expectedFunction(value, fallback);
}

function initializeStoredVariables() {
	return new Promise(function(resolve) {
		// localStorage.accurateTracking = _checkValue(localStorage.accurateTracking, _checkBoolean, "false");
		localStorage.accurateTracking = "false";
		localStorage.activeType = _checkValue(localStorage.activeType, _checkActiveType, "psn");
		localStorage.characterDescriptions = _checkValue(localStorage.characterDescriptions, _checkJSON, "{}");
		// localStorage.allowTracking = _checkValue(localStorage.allowTracking, _checkJSON, JSON.stringify({
		// 	"allow_tracking": 0,
		// 	"tracking_message": "Tracking is disabled by request from Bungie. A resolution is being implemented."
		// }));
		localStorage.error = _checkValue(localStorage.error, _checkBoolean, "false");
		localStorage.errorMessage = _checkValue(localStorage.errorMessage, "");
		localStorage.itemChangeDetected = _checkValue(localStorage.itemChangeDetected, _checkBoolean, "false");
		localStorage.listening = _checkValue(localStorage.listening, _checkBoolean, "false");
		localStorage.manual = _checkValue(localStorage.manual, _checkBoolean, "false");
		localStorage.move3oC = _checkValue(localStorage.move3oC, _checkBoolean, "false");
		localStorage.move3oCCooldown = _checkValue(localStorage.move3oCCooldown, _checkBoolean, "false");
		localStorage.newestCharacter = _checkValue(localStorage.newestCharacter, _checkNumber, "vault");
		localStorage.notificationClosed = _checkValue(localStorage.notificationClosed, _checkBoolean, "false");
		localStorage.track3oC = _checkValue(localStorage.track3oC, _checkBoolean, "true");
		localStorage.uniqueId = _checkValue(localStorage.uniqueId, _checkLength, "false");
		localStorage.autoLock = _checkValue(localStorage.autoLock, _checkBoolean, "false");
		localStorage.minQuality = _checkValue(localStorage.minQuality, _checkNumber, 90);
		localStorage.minLight = _checkValue(localStorage.minLight, _checkNumber, 335);
		if (localStorage.allowTracking) {
			localStorage.removeItem("allowTracking");
			localStorage.perkSets = JSON.stringify([]);
		}
		localStorage.perkSets = _checkValue(localStorage.perkSets, _checkJSON, JSON.stringify([]));
		localStorage.systems = _checkValue(localStorage.systems, _checkJSON, JSON.stringify({}));
		var manifest = chrome.runtime.getManifest();
		if (!localStorage.version) {
			localStorage.version = manifest.version;
			localStorage.notificationClosed = "false";
		}
		var localVersion = localStorage.version.split(".");
		var manifestVersion = manifest.version.split(".");
		if (localVersion[0] !== manifestVersion[0] || localVersion[1] !== manifestVersion[1]) {
			localStorage.notificationClosed = "false";
		}
		localStorage.version = manifest.version;
		localStorage.newInventory = JSON.stringify({});
		localStorage.oldInventory = JSON.stringify({});
		tracker.sendEvent('Backend Initialized', `No Issues`, `version ${localStorage.version}, systems ${localStorage.systems}`);
		chrome.storage.local.get(null, function(data) {
			var newData = {};
			if (!data.currencies) {
				newData.currencies = [];
			} else {
				newData.currencies = data.currencies;
			}
			if (!data.inventories) {
				newData.inventories = {};
			} else {
				newData.inventories = data.inventories;
			}
			if (!data.progression) {
				newData.progression = {};
			} else {
				newData.progression = data.progression;
			}
			if (!data.itemChanges) {
				newData.itemChanges = [];
			} else {
				newData.itemChanges = data.itemChanges;
			}
			if (!data.logger) {
				newData.logger = {
					currentLog: null,
					logList: []
				};
			} else {
				newData.logger = data.logger;
			}
			if (!data.matches) {
				newData.matches = [];
			} else {
				newData.matches = data.matches;
			}
			chrome.storage.local.set(newData, function() {
				resolve();
			});
		});
	});
}