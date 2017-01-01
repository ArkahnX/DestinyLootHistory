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

var goodStorageValues = ["characterDescriptions", "error", "errorMessage", "itemChangeDetected", "listening", "move3oC", "move3oCCooldown", "newestCharacter", "notificationClosed", "disableQuality", "autoLockHighLight", "systems", "version", "threeOfCoinsProgress", "coolDowns"];

function initializeStoredVariables() {
	return new Promise(function(resolve) {
		localStorage.characterDescriptions = _checkValue(localStorage.characterDescriptions, _checkJSON, "{}");
		localStorage.error = _checkValue(localStorage.error, _checkBoolean, "false");
		localStorage.errorMessage = _checkValue(localStorage.errorMessage, "");
		localStorage.itemChangeDetected = _checkValue(localStorage.itemChangeDetected, _checkBoolean, "false");
		localStorage.listening = _checkValue(localStorage.listening, _checkBoolean, "false");
		localStorage.move3oC = _checkValue(localStorage.move3oC, _checkBoolean, "false");
		localStorage.move3oCCooldown = _checkValue(localStorage.move3oCCooldown, _checkBoolean, "false");
		localStorage.coolDowns = JSON.stringify({});
		localStorage.newestCharacter = _checkValue(localStorage.newestCharacter, _checkNumber, "vault");
		localStorage.notificationClosed = _checkValue(localStorage.notificationClosed, _checkBoolean, "false");
		localStorage.autoLockHighLight = _checkValue(localStorage.autoLockHighLight, _checkBoolean, "false");
		localStorage.updateUI = _checkValue(localStorage.updateUI, _checkBoolean, "true");
		localStorage.systems = _checkValue(localStorage.systems, _checkJSON, JSON.stringify({}));
		localStorage.threeOfCoinsProgress = _checkValue(localStorage.threeOfCoinsProgress, _checkJSON, JSON.stringify({}));
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
		tracker.sendEvent('Backend Initialized', `No Issues`, `version ${localStorage.version}, systems ${localStorage.systems}`);
		chrome.storage.sync.get(null, function(options) {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError);
			}
			var newOptions = {
				options: {}, // used for exporting, eventually
				activeType: "psn",
				authCode:"",
				accessToken:"",
				refreshToken:"",
				autoLock: false,
				track3oC: true,
				trackBoosters: true,
				obeyCooldowns: true,
				relativeDates: true,
				pgcrImage: false,
				showQuality: true,
				lockHighLight: false,
				useGuardianLight: true,
				debugLogging: false,
				keepSingleStackItems: [],
				autoMoveItemsToVault: [],
				highValuePerks:[],
				midValuePerks:[],
				lowValuePerks:[],
				qualitySortOrder: [],
				perkSortOrder: [],
				rewardSources: [],
				minQuality: 90,
				minLight: 350,
				tags1psn: [],
				tags2psn: [],
				tags3psn: [],
				tagHashes1psn: [],
				tagHashes2psn: [],
				tagHashes3psn: [],
				tagComments1psn: [],
				tagComments2psn: [],
				tagComments3psn: [],
				tags1xbl: [],
				tags2xbl: [],
				tags3xbl: [],
				tagHashes1xbl: [],
				tagHashes2xbl: [],
				tagHashes3xbl: [],
				tagComments1xbl: [],
				tagComments2xbl: [],
				tagComments3xbl: []
			};
			var badOptions = [];
			for (var option in options) {
				if (typeof newOptions[option] !== "undefined") {
					newOptions[option] = options[option];
				} else {
					badOptions.push(option);
				}
			}
			if (badOptions.length) {
				chrome.storage.sync.remove(badOptions);
			}
			var dateObj = new Date();
			var month = dateObj.getUTCMonth() + 1;
			var day = dateObj.getUTCDate();

			if (localStorage.autoLockHighLight === "false") {
				localStorage.autoLockHighLight = "true";
				newOptions.lockHighLight = newOptions.autoLock;
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
				let json;
				try {
					json = JSON.parse(localStorage.autoMoveItemsToVault);

				} catch (e) {

				}
				if (json) {
					for (let item of json) {
						let itemDef = getItemDefinition(item);
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
			for (let item in localStorage) {
				if (goodStorageValues.indexOf(item) === -1) {
					localStorage.removeItem(item);
				}
			}
			chrome.storage.sync.set(newOptions, function() {
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
				}
				// resolve();
			});

			chrome.storage.local.get(null, function(data) {
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
				}
				var newData = {};
				if (data.currencies) {
					newData.currencies = data.currencies;
				}
				if (data.inventories) {
					let newInventories = [];
					for (let characterId in data.inventories) {
						if (Array.isArray(data.inventories[characterId])) {
							newInventories.push({
								characterId: characterId,
								inventory: data.inventories[characterId]
							});
						}
					}
					if (newInventories.length) {
						newData.inventories = newInventories;
					} else {
						newData.inventories = data.inventories;
					}
				}
				if (data.progression) {
					let newProgression = [];
					for (let characterId in data.progression) {
						if (data.progression[characterId].baseCharacterLevel) {
							newProgression.push({
								characterId: characterId,
								progression: data.progression[characterId]
							});
						}
					}
					if (newProgression.length) {
						newData.progression = newProgression;
					} else {
						newData.progression = data.progression;
					}
				}
				if (data.itemChanges) {
					newData.itemChanges = data.itemChanges;
				}
				if (data.matches) {
					newData.matches = data.matches;
				}
				console.log(newData);
				chrome.storage.local.set(newData, function() {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
					}
					database.open().then(function() { // database update only runs if the database version was 0, aka fresh install, otherwise it just passes through
						database.update(newData).then(resolve);
					});
				});
			});
		});
	});
}