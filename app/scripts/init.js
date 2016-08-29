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
	if (isNaN(parseInt(source, 10)) === false) {
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

function _stringToBoolean(string, defaultValue) {
	if (string === "true") {
		return true;
	}
	if (string === "false") {
		return false;
	}
	return defaultValue;
}

function _stringToInt(string, defaultValue) {
	if (parseInt(string, 10)) {
		return parseInt(string, 10);
	}
	return defaultValue;
}

function initializeStoredVariables() {
	return new Promise(function(resolve) {
		// localStorage.accurateTracking = _checkValue(localStorage.accurateTracking, _checkBoolean, "false");
		localStorage.accurateTracking = "false";
		// localStorage.activeType = _checkValue(localStorage.activeType, _checkActiveType, "psn");
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
		// localStorage.track3oC = _checkValue(localStorage.track3oC, _checkBoolean, "true");
		localStorage.uniqueId = _checkValue(localStorage.uniqueId, _checkLength, "false");
		// localStorage.autoLock = _checkValue(localStorage.autoLock, _checkBoolean, "false");
		// localStorage.autoMoveToVault = _checkValue(localStorage.autoMoveToVault, _checkBoolean, "false");
		// localStorage.minQuality = _checkValue(localStorage.minQuality, _checkNumber, 90);
		// localStorage.minLight = _checkValue(localStorage.minLight, _checkNumber, 335);
		// localStorage.minMaterialStacks = _checkValue(localStorage.minMaterialStacks, _checkNumber, 1);
		// localStorage.minConsumableStacks = _checkValue(localStorage.minConsumableStacks, _checkNumber, 1);
		// localStorage.autoMoveItemsToVault = _checkValue(localStorage.autoMoveItemsToVault, _checkJSON, JSON.stringify([]));
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
		chrome.storage.sync.get(null, function(options) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			var newOptions = {
				activeType: "psn",
				autoLock: false,
				track3oC: true,
				keepSingleStackItems: [],
				autoMoveItemsToVault: [],
				minQuality: 90,
				minLight: 335
			};
			for (var option in options) {
				newOptions[option] = options[option];
			}
			if (localStorage.activeType) {
				if (localStorage.activeType === "xbl") {
					newOptions.activeType = "xbl";
				}
				if (localStorage.activeType === "psn") {
					newOptions.activeType = "psn";
				}
				localStorage.removeItem("activeType");
			}
			if (localStorage.autoLock) {
				newOptions.autoLock = _stringToBoolean(localStorage.autoLock, newOptions.autoLock);
				localStorage.removeItem("autoLock");
			}
			if (localStorage.track3oC) {
				newOptions.track3oC = _stringToBoolean(localStorage.track3oC, newOptions.track3oC);
				localStorage.removeItem("track3oC");
			}
			if (localStorage.minConsumableStacks && localStorage.autoMoveItemsToVault) {
				var json;
				try {
					json = JSON.parse(localStorage.autoMoveItemsToVault);

				} catch (e) {

				}
				if (json) {
					for (var item of json) {
						var itemDef = getItemDefinition(item);
						if (localStorage.minConsumableStacks === "1" && itemDef.bucketTypeHash === 1469714392 && newOptions.keepSingleStackItems.indexOf(item) === -1) {
							newOptions.keepSingleStackItems.push(item);
						} else if (localStorage.minConsumableStacks === "0" && itemDef.bucketTypeHash === 1469714392 && newOptions.autoMoveItemsToVault.indexOf(item) === -1) {
							newOptions.autoMoveItemsToVault.push(item);
						}
					}
				}
				localStorage.removeItem("minConsumableStacks");
			}
			if (localStorage.minMaterialStacks && localStorage.autoMoveItemsToVault) {
				var json;
				try {
					json = JSON.parse(localStorage.autoMoveItemsToVault);

				} catch (e) {

				}
				if (json) {
					for (var item of json) {
						var itemDef = getItemDefinition(item);
						if (localStorage.minMaterialStacks === "1" && itemDef.bucketTypeHash === 3865314626 && newOptions.keepSingleStackItems.indexOf(item) === -1) {
							newOptions.keepSingleStackItems.push(item);
						} else if (localStorage.minMaterialStacks === "0" && itemDef.bucketTypeHash === 3865314626 && newOptions.autoMoveItemsToVault.indexOf(item) === -1) {
							newOptions.autoMoveItemsToVault.push(item);
						}
					}
				}
				localStorage.removeItem("minMaterialStacks");
			}
			if (localStorage.minQuality) {
				newOptions.minQuality = _stringToInt(localStorage.minQuality, newOptions.minQuality);
				localStorage.removeItem("minQuality");
			}
			if (localStorage.minLight) {
				newOptions.minLight = _stringToInt(localStorage.minLight, newOptions.minLight);
				localStorage.removeItem("minLight");
			}
			if (localStorage.autoMoveItemsToVault) {
				localStorage.removeItem("autoMoveItemsToVault");
			}
			chrome.storage.sync.set(newOptions, function() {
				if (chrome.runtime.lastError) {
					logger.error(chrome.runtime.lastError);
				}
				resolve();
			});
		});
		chrome.storage.local.get(null, function(data) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
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
				if (chrome.runtime.lastError) {
					logger.error(chrome.runtime.lastError);
				}
				resolve();
			});
		});
	});
}