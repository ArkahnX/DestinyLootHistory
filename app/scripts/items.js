var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	matches: [],
	currencies: []
};
var oldInventories = {};
var oldProgression = {};
var newProgression = {};
var newInventories = {};
var relevantStats = ["itemHash", "itemInstanceId", "itemInstanceId", "stackSize", "equipRequiredLevel", "damageTypeHash", "talentGridHash", "isGridComplete"];
var characterIdList = ["vault"];
var characterDescriptions = {
	"vault": {
		name: "Vault",
		gender: "",
		level: "0"
	}
};

function initItems(callback) {
	logger.startLogging("items");
	logger.time("load Bungie Data");
	bungie.user().then(function(u) {
		if (u.error) {
			localStorage.listening = "false";
			chrome.browserAction.setBadgeText({
				text: "!"
			});
			setTimeout(function() {
				initItems(callback);
			}, 1000 * 5);
		} else {
			localStorage.error = "false";
			chrome.browserAction.setBadgeText({
				text: ""
			});
			bungie.search().then(function(e) {

				var avatars = e.data.characters;
				var newestCharacter = "vault";
				var newestDate = 0;
				for (var c = 0; c < avatars.length; c++) {
					characterDescriptions[avatars[c].characterBase.characterId] = {
						name: DestinyClassDefinition[avatars[c].characterBase.classHash].className,
						gender: DestinyGenderDefinition[avatars[c].characterBase.genderHash].genderName,
						level: avatars[c].baseCharacterLevel,
						light: avatars[c].characterBase.powerLevel,
						race: DestinyRaceDefinition[avatars[c].characterBase.raceHash].raceName,
						dateLastPlayed: avatars[c].characterBase.dateLastPlayed
					};
					if (new Date(avatars[c].characterBase.dateLastPlayed).getTime() > new Date(newestDate).getTime()) {
						newestDate = avatars[c].characterBase.dateLastPlayed;
						newestCharacter = avatars[c].characterBase.characterId;
					}
					characterIdList.push(avatars[c].characterBase.characterId);
				}
				localStorage.newestCharacter = newestCharacter;
				localStorage.characterDescriptions = JSON.stringify(characterDescriptions);
				logger.timeEnd("load Bungie Data");
				callback();
			});
		}
	});
}

var inventories = {};
var oldCurrencies = [];
var newCurrencies = [];
var currencyTotal = 0;

function itemNetworkTask(characterId, callback) {
	logger.startLogging("items");
	logger.time("itemTask");
	if (characterId === "vault") {
		bungie.vault().then(callback);
	} else {
		bungie.inventory(characterId).then(callback);
	}
}

function factionNetworkTask(characterId, callback) {
	logger.startLogging("items");
	logger.time("factionTask");
	if (characterId !== "vault") {
		bungie.factions(characterId).then(callback);
	} else {
		callback();
	}
}

function itemResultTask(result, characterId) {
	logger.startLogging("items");
	logger.timeEnd("itemTask");
	if (result) {
		if (!data.inventories[characterId]) {
			data.inventories[characterId] = [];
			newInventories[characterId] = [];
		}
		if (result.data.currencies) {
			newCurrencies = result.data.currencies;
		}
		newInventories[characterId] = result.data.buckets;
	}
	inventories[characterId] = 0;
	if (result) {
		if (Array.isArray(result.data.buckets)) {
			for (var bucket of result.data.buckets) {
				for (var i = 0; i < bucket.items.length; i++) {
					inventories[characterId] += bucket.items[i].stackSize || 1;
				}
			}
		} else {
			for (var attr in result.data.buckets) {
				for (var i = 0; i < result.data.buckets[attr].length; i++) {
					for (var e = 0; e < result.data.buckets[attr][i].items.length; e++) {
						inventories[characterId] += result.data.buckets[attr][i].items[e].stackSize || 1;
					}
				}
			}
		}
	}
}

function factionResultTask(result, characterId) {
	logger.startLogging("items");
	logger.timeEnd("factionTask");
	if (result) {
		if (!data.progression[characterId]) {
			data.progression[characterId] = [];
			newProgression[characterId] = [];
		}
		newProgression[characterId] = result.data;
	}
}

function _concat(list, sortedItems) {
	for (var item of list) {
		if (!sortedItems[item.itemInstanceId + "-" + item.itemHash]) {
			sortedItems[item.itemInstanceId + "-" + item.itemHash] = buildCompactItem(item);
		} else {
			sortedItems[item.itemInstanceId + "-" + item.itemHash].stackSize += item.stackSize;
		}
	}
	return sortedItems;
}

function concatItems(itemBucketList) {
	var sortedItems = {};
	var unsortedItems = [];
	for (var category of itemBucketList) {
		if (category.items) {
			sortedItems = _concat(category.items, sortedItems);
		} else {
			for (var bucket of category) {
				if (bucket.items) {
					sortedItems = _concat(bucket.items, sortedItems);
				}
			}
		}
	}
	for (var item of sortedItems) {
		unsortedItems.push(item);
	}
	return unsortedItems;
}

function buildCompactItem(itemData) {
	logger.startLogging("items");
	var newItemData = {};
	var hash = itemData.itemHash;
	for (var i = 0; i < relevantStats.length; i++) {
		if (itemData[relevantStats[i]]) {
			if (typeof itemData[relevantStats[i]].length === "number") {
				if (itemData[relevantStats[i]].length > 0) {
					newItemData[relevantStats[i]] = itemData[relevantStats[i]];
				}
			} else {
				newItemData[relevantStats[i]] = itemData[relevantStats[i]];
			}
		}
	}
	if (itemData.stats && itemData.stats.length) {
		newItemData.stats = [];
		for (var e = 0; e < itemData.stats.length; e++) {
			newItemData.stats[e] = {
				statHash: itemData.stats[e].statHash,
				value: itemData.stats[e].value
			};
		}
	}
	if (itemData.objectives && itemData.objectives.length) {
		var completed = 0;
		var completionValue = 0;
		newItemData.objectives = [];
		for (var l = 0; l < itemData.objectives.length; l++) {
			newItemData.objectives[l] = {
				objectiveHash: itemData.objectives[l].objectiveHash,
				progress: itemData.objectives[l].progress
			};
			completed += newItemData.objectives[l].progress;
			completionValue += DestinyObjectiveDefinition[itemData.objectives[l].objectiveHash].completionValue;
		}
		if (completed === completionValue) {
			newItemData.isGridComplete = true;
		}
		newItemData.stackSize = Math.round(((completed / completionValue) * 100)) + "%";
	}
	if (itemData.primaryStat) {
		newItemData.primaryStat = {
			statHash: itemData.primaryStat.statHash,
			value: itemData.primaryStat.value
		};
	}
	if (itemData.nodes && itemData.nodes.length) {
		newItemData.nodes = [];
		for (var node of itemData.nodes) {
			if (!node) {
				logger.info(itemData, itemData.nodes, itemData.nodes.length);
			}
			if (node && !node.hidden) {
				newItemData.nodes.push({
					isActivated: node.isActivated,
					stepIndex: node.stepIndex,
					nodeHash: node.nodeHash,
					state: node.state
				});
			}
		}
	}
	return newItemData;
}

function handleInput(source, alt) {
	if (Array.isArray(source) && Array.isArray(alt) === false) {
		return alt;
	}
	if (typeof source !== "undefined") {
		if (typeof source === "string") {
			return JSON.parse(source);
		}
		return source;
	}
	return alt;
}

function checkDiff(sourceArray, newArray) {
	logger.startLogging("items");
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		var found = false;
		for (var e = 0; e < newArray.length; e++) {
			if (sourceArray[i].bucketHash === 2197472680 && newArray[e].itemInstanceId === sourceArray[i].itemInstanceId) {
				if (sourceArray[i].stackSize !== newArray[e].stackSize) {
					// logger.log(sourceArray[i], newArray[e]);
					// logger.log(newArray[e].itemInstanceId === sourceArray[i].itemInstanceId && newArray[e].itemHash === sourceArray[i].itemHash, newArray[e].stackSize !== sourceArray[i].stackSize)
				}
			}
			if (newArray[e].itemInstanceId === sourceArray[i].itemInstanceId && newArray[e].itemHash === sourceArray[i].itemHash) {
				found = true;
				if (newArray[e].stackSize !== sourceArray[i].stackSize) {
					var newItem = JSON.parse(JSON.stringify(sourceArray[i]));
					if (newItem.primaryStat && newItem.primaryStat.value !== sourceArray[i].primaryStat.value) {
						itemsRemovedFromSource.push(JSON.stringify(newItem));
					} else {
						if (typeof sourceArray[i].stackSize === "number") {
							newItem.stackSize = sourceArray[i].stackSize - newArray[e].stackSize;
							if (newItem.stackSize > 0) {
								itemsRemovedFromSource.push(JSON.stringify(newItem));
							}
						} else {
							newItem.stackSize = sourceArray[i].stackSize;
							if (parseInt(newArray[e].stackSize, 10) !== parseInt(sourceArray[i].stackSize, 10)) {
								itemsRemovedFromSource.push(JSON.stringify(newItem));
							}
						}
					}
				}
			}
		}
		if (found === false) {
			itemsRemovedFromSource.push(JSON.stringify(sourceArray[i]));
		}
	}
	return itemsRemovedFromSource;
}

function checkFactionDiff(sourceArray, newArray) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		for (var e = 0; e < newArray.length; e++) {
			var diff = false;
			if (newArray[e].progressionHash !== 3298204156) { // strip character_display_xp
				if (newArray[e].progressionHash == sourceArray[i].progressionHash && newArray[e].currentProgress !== sourceArray[i].currentProgress) {
					var newItem = {
						progressionHash: newArray[e].progressionHash,
						level: newArray[e].level,
						progressToNextLevel: newArray[e].progressToNextLevel,
						progressChange: newArray[e].currentProgress - sourceArray[i].currentProgress,
						currentProgress: newArray[e].currentProgress,
						nextLevelAt: newArray[e].nextLevelAt,
						name: DestinyProgressionDefinition[newArray[e].progressionHash].name
					};
					for (var faction of DestinyFactionDefinition) {
						if (faction.progressionHash === newArray[e].progressionHash) {
							newItem.factionHash = faction.factionHash;
						}
					}
					itemsRemovedFromSource.push(JSON.stringify(newItem));
				}
			}
		}
	}
	return itemsRemovedFromSource;
}

function isSameItem(item1, item2) {
	if (item1 === item2) {
		return true;
	}
	if (typeof item1 === "string") {
		item1 = JSON.parse(item1);
	}
	if (typeof item2 === "string") {
		item2 = JSON.parse(item2);
	}
	if (item1.itemHash === item2.itemHash) {
		if (item1.stackSize === item2.stackSize) {
			if (item1.itemInstanceId === item2.itemInstanceId) {
				return true;
			}
		}
	}
	return false;
}

function checkInventory() {
	return new Promise(function(resolve) {
		grabRemoteInventory(function() {
			findHighestMaterial().then(resolve);
		});
	});
}

function grabRemoteInventory(resolve) {
	logger.startLogging("items");
	logger.time("Bungie Search");
	var currentDateString = moment().utc().format();
	bungie.search().then(function(guardian) {
		logger.timeEnd("Bungie Search");
		let characters = guardian.data.characters;
		for (let character of characters) {
			characterDescriptions[character.characterBase.characterId].light = character.characterBase.powerLevel;
			characterDescriptions[character.characterBase.characterId].dateLastPlayed = character.characterBase.dateLastPlayed;
		}
		logger.time("Bungie Items");
		sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
			logger.timeEnd("Bungie Items");
			logger.time("Bungie Faction");
			sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
				logger.timeEnd("Bungie Faction");
				logger.time("Local Inventory");
				chrome.storage.local.get(["itemChanges", "progression", "currencies", "inventories"], function(result) {
					data.itemChanges = handleInput(result.itemChanges, data.itemChanges);
					data.factionChanges = handleInput(result.factionChanges, data.factionChanges);
					// data.progression = handleInput(result.progression, data.progression);
					// data.inventories = handleInput(result.inventories, data.inventories);
					oldProgression = handleInput(result.progression, newProgression);
					for (var attr in result.progression) {
						oldProgression[attr] = handleInput(result.progression[attr], newProgression[attr]);
					}
					oldInventories = handleInput(result.inventories, newInventories);
					oldCurrencies = handleInput(result.currencies, newCurrencies);
					logger.timeEnd("Local Inventory");
					processDifference(currentDateString, resolve);
				});
			});
		});
	});
}

var findHighestMaterial = (function() {
	var newestCharacterDate = null;
	var reset = true;
	// localStorage.transferMaterial = null;
	// localStorage.newestCharacter = null;
	return function() {
	logger.startLogging("items");
		logger.time("bigmat");
		var itemQuantity = 0;
		if (localStorage.transferMaterial && localStorage.transferMaterial !== "null") {
			for (let item of newInventories[localStorage.newestCharacter]) {
				if (item.itemHash === parseInt(localStorage.transferMaterial)) {
					itemQuantity = item.stackSize;
				}
			}
		}
		var vaultQuantity = 0;
		if (localStorage.transferMaterial && localStorage.transferMaterial !== "null") {
			for (let item of newInventories.vault) {
				if (item.itemHash === parseInt(localStorage.transferMaterial)) {
					vaultQuantity = item.stackSize;
				}
			}
		}
		// logger.log(localStorage.transferMaterial, itemQuantity)
		// logger.log(localStorage.transferMaterial !== "null" && localStorage.newestCharacter !== "null" && parseInt(localStorage.transferQuantity) > 0, reset, parseInt(localStorage.transferQuantity) > itemQuantity)
		if ((localStorage.transferMaterial !== "null" && localStorage.newestCharacter !== "null" && parseInt(localStorage.transferQuantity) > 0) && (reset || parseInt(localStorage.transferQuantity) > itemQuantity)) {
			let localCharacter = localStorage.newestCharacter;
			let localMaterial = parseInt(localStorage.transferMaterial);
			let localTransferQuantity = parseInt(localStorage.transferQuantity);
			if (localTransferQuantity > vaultQuantity) {
				localTransferQuantity = vaultQuantity;
			}
			let localDescription = characterDescriptions[localCharacter];
			logger.log(`Moved ${localTransferQuantity} ${getItemDefinition(localMaterial).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (${vaultQuantity} in Vault)`);
			bungie.transfer(localCharacter, "0", localMaterial, localTransferQuantity, false);
			localStorage.oldTransferMaterial = localStorage.transferMaterial;
			localStorage.transferMaterial = null;
			localStorage.transferMaterialStack = 0;
			localStorage.newestCharacter = null;
			localStorage.transferQuantity = 0;
			reset = false;
		}

		logger.time("char");
		for (let characterId of characterIdList) {
			if (characterId !== "vault") {
				var date = new Date(characterDescriptions[characterId].dateLastPlayed);
				// logger.log(characterDescriptions[characterId], date > newestCharacterDate, characterId, localStorage.newestCharacter);
				if ((!localStorage.newestCharacter || localStorage.newestCharacter === "null") || date > newestCharacterDate) {
					if (localStorage.newestCharacter !== characterId || new Date().getTime() > date.getTime() + (1000 * 60 * 10)) {
						// logger.log(characterId, localStorage.newestCharacter)
						if (parseInt(localStorage.transferQuantity) > 0 && localStorage.transferMaterial !== "null") {
							let localCharacter = localStorage.newestCharacter;
							let localMaterial = parseInt(localStorage.transferMaterial);
							let localTransferQuantity = parseInt(localStorage.transferQuantity);
							if (localTransferQuantity > vaultQuantity) {
								localTransferQuantity = vaultQuantity;
							}
							let localDescription = characterDescriptions[localCharacter];
							logger.log(`Moved ${localTransferQuantity} ${getItemDefinition(localMaterial).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (${vaultQuantity} in Vault)`);
							bungie.transfer(localCharacter, "0", localMaterial, localTransferQuantity, false);
						}
						localStorage.newestCharacter = characterId;
						localStorage.transferQuantity = 0;
						localStorage.oldTransferMaterial = localStorage.transferMaterial;
						localStorage.transferMaterial = null;
						localStorage.transferMaterialStack = 0;
					}
					newestCharacterDate = date;
				}
			}
		}
		logger.timeEnd("char");
		// logger.log(localStorage.transferMaterial, !localStorage.transferMaterial, localStorage.transferMaterial === "null")
		if (!localStorage.transferMaterial || localStorage.transferMaterial === "null") {
			logger.time("mats");
			for (let item of newInventories[localStorage.newestCharacter]) {
				let itemDefinition = getItemDefinition(item.itemHash);
				if (itemDefinition.bucketTypeHash === 3865314626 || itemDefinition.bucketTypeHash === 1469714392) {
					// logger.log(!localStorage.transferMaterial, item.stackSize > transferMaterial.stackSize)
					if ((!localStorage.transferMaterial || localStorage.transferMaterial === "null") || item.stackSize > parseInt(localStorage.transferMaterialStack)) {
						localStorage.oldTransferMaterial = localStorage.transferMaterial;
						localStorage.transferMaterial = item.itemHash;
						localStorage.transferMaterialStack = item.stackSize;
					}
				}
			}
			logger.timeEnd("mats");
		}
		logger.log(`Moved 1 ${getItemDefinition(localStorage.transferMaterial).itemName} to Vault (${vaultQuantity} in Vault)`);
		// logger.log(localStorage.transferMaterial)
		localStorage.transferQuantity = parseInt(localStorage.transferQuantity) + 1;
		logger.timeEnd("bigmat");
		// logger.log(localStorage.newestCharacter, "0", localStorage.transferMaterial, 1, true, localStorage);
		// logger.error("HERERERER")
		return bungie.transfer(localStorage.newestCharacter, "0", localStorage.transferMaterial, 1, true);
	};
}());

function check3oC() {
	return new Promise(function(resolve) {
		if(localStorage.move3oC && localStorage.move3oC === "true") { // we have just completed an activity, remind the User about Three of Coins
			if(localStorage.newestCharacter) {
				resolve();
			} else {
				logger.warn("Unable to determine 3oC target.");
				resolve(); // we don't know who you are playing :(
			}
		}
	});
}