var data = {
	inventories: [],
	progression: [],
	itemChanges: [],
	matches: [],
	currencies: []
};
var oldInventories = [];
var oldProgression = [];
var newProgression = [];
var newInventories = [];
var relevantStats = ["itemHash", "itemInstanceId", "stackSize", "damageTypeHash", "talentGridHash", "isGridComplete", "state", "equipRequiredLevel"];
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
	logger.log("initItems");
	// logger.log("Arrived at initItems");
	logger.time("load Bungie Data");
	getOption("activeType").then(bungie.setActive);
	bungie.user().then(function() {
		chrome.browserAction.setBadgeText({
			text: ""
		});
		bungie.search().then(function(e) {
			var avatars = e.data.characters;
			var newestCharacter = "vault";
			var newestDate = 0;
			var maxLight = globalOptions.minLight;
			for (let avatar of avatars) {
				if (!characterDescriptions[avatar.characterBase.characterId]) {
					characterDescriptions[avatar.characterBase.characterId] = {
						name: DestinyClassDefinition[avatar.characterBase.classHash].className,
						gender: DestinyGenderDefinition[avatar.characterBase.genderHash].genderName,
						level: avatar.baseCharacterLevel,
						light: avatar.characterBase.powerLevel,
						race: DestinyRaceDefinition[avatar.characterBase.raceHash].raceName,
						dateLastPlayed: avatar.characterBase.dateLastPlayed,
						currentActivityHash: avatar.characterBase.currentActivityHash
					};
				} else { // we already have set these characters so just update their data.
					characterDescriptions[avatar.characterBase.characterId].level = avatar.baseCharacterLevel;
					characterDescriptions[avatar.characterBase.characterId].light = avatar.characterBase.powerLevel;
					characterDescriptions[avatar.characterBase.characterId].dateLastPlayed = avatar.characterBase.dateLastPlayed;
					characterDescriptions[avatar.characterBase.characterId].currentActivityHash = avatar.characterBase.currentActivityHash;
				}
				if (avatar.characterBase.powerLevel > maxLight) {
					maxLight = avatar.characterBase.powerLevel;
				}
				if (new Date(avatar.characterBase.dateLastPlayed).getTime() > new Date(newestDate).getTime()) { // set newest character for 3oC reminder
					newestDate = avatar.characterBase.dateLastPlayed;
					newestCharacter = avatar.characterBase.characterId;
				}
				if (characterIdList.indexOf(avatar.characterBase.characterId) === -1) {
					characterIdList.push(avatar.characterBase.characterId);
				}
			}
			localStorage.newestCharacter = newestCharacter;
			localStorage.characterDescriptions = JSON.stringify(characterDescriptions);
			if (globalOptions.useGuardianLight && maxLight !== globalOptions.minLight) {
				setOption("minLight", maxLight);
			}
			logger.timeEnd("load Bungie Data");
			if (typeof callback === "function") {
				callback();
			}
		}).catch(function(err) {
			if (typeof callback === "function") {
				callback();
			}
			if (err) {
				logger.error(err);
			}
		});
	}).catch(function(err) {
		if (typeof callback === "function") {
			callback();
		}
		if (err) {
			logger.error(err);
		}
	});
}

var inventories = {};
var oldCurrencies = [];
var newCurrencies = [];

function itemNetworkTask(characterId, callback) {
	logger.startLogging("items");
	logger.time("itemTask");
	if (characterId === "vault") {
		bungie.vault().catch(function(err) {
			if (err) {
				logger.error(err);
			}
			callback(false);
		}).then(callback);
	} else {
		bungie.inventory(characterId).catch(function(err) {
			if (err) {
				logger.error(err);
			}
			callback(false);
		}).then(callback);
	}
}

function factionNetworkTask(characterId, callback) {
	logger.startLogging("items");
	logger.time("factionTask");
	if (characterId !== "vault") {
		bungie.factions(characterId).catch(function(err) {
			if (err) {
				logger.error(err);
			}
			callback(false);
		}).then(callback);
	} else {
		callback();
	}
}

function itemResultTask(result, characterId) {
	logger.startLogging("items");
	logger.timeEnd("itemTask");
	if (result) {
		var dataInventory = findInArray(data.inventories, "characterId", characterId);
		var newInventory = findInArray(newInventories, "characterId", characterId);
		if (!dataInventory.inventory) {
			dataInventory = {
				characterId: characterId,
				inventory: []
			};
			data.inventories.push(dataInventory);
		}
		if (!newInventory.inventory) {
			newInventory = {
				characterId: characterId,
				inventory: []
			};
			newInventories.push(newInventory);
		}
		if (result.data.currencies) {
			newCurrencies = result.data.currencies;
		}
		newInventory.inventory = concatItems(result.data.buckets);

		if (newInventories.length === 0) {
			if (result.data) {
				if (result.data.buckets) {
					logger.error(result.data.buckets);
				} else {
					logger.error(result.data);
				}
			} else {
				logger.error(result);
			}
		}
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
		var dataProgress = findInArray(data.progression, "characterId", characterId);
		var newProgress = findInArray(newProgression, "characterId", characterId);
		if (!dataProgress.progression) {
			dataProgress = {
				characterId: characterId,
				progression: []
			};
			data.progression.push(dataProgress);
		}
		if (!newProgress.progression) {
			newProgress = {
				characterId: characterId,
				progression: []
			};
			newProgression.push(newProgress);
		}
		newProgress.progression = result.data;
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
				if (sourceArray[i].primaryStat && newArray[e].primaryStat && sourceArray[i].primaryStat.value > newArray[e].primaryStat.value) {
					itemsRemovedFromSource.push(JSON.stringify(sourceArray[i]));
				} else if (newArray[e].stackSize !== sourceArray[i].stackSize) {
					var newItem = JSON.parse(JSON.stringify(sourceArray[i]));
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
		if (found === false) {
			itemsRemovedFromSource.push(JSON.stringify(sourceArray[i]));
		}
	}
	return itemsRemovedFromSource;
}

function checkThreeOfCoinsXp(track3oC, characterId) {
	if (track3oC === true) {
		logger.startLogging("3oC");
		var threeOfCoinsProgress = JSON.parse(localStorage.threeOfCoinsProgress);
		var old3oCProgress = parseInt(threeOfCoinsProgress[characterId], 10);
		if (localStorage.move3oCCooldown === "true") {
			if (characterDescriptions[characterId].currentActivityHash !== old3oCProgress) {
				localStorage.move3oCCooldown = "false";
			}
		}
		if (localStorage.move3oCCooldown === "false") {
			console.log(characterId, characterDescriptions[characterId], threeOfCoinsProgress[characterId])
			localStorage.move3oC = "true";
			localStorage.move3oCCooldown = "true";
		}
		threeOfCoinsProgress[characterId] = characterDescriptions[characterId].currentActivityHash;
		localStorage.threeOfCoinsProgress = JSON.stringify(threeOfCoinsProgress);
	}
}

function checkFactionDiff(sourceArray, newArray, characterId) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		for (var e = 0; e < newArray.length; e++) {
			var diff = false;
			if (newArray[e].progressionHash == sourceArray[i].progressionHash && newArray[e].progressionHash === 3298204156) {
				var characterDisplayXp = newArray[e];
				var currentProgress = sourceArray[i];
			} else if (newArray[e].progressionHash == sourceArray[i].progressionHash && newArray[e].currentProgress !== sourceArray[i].currentProgress) {
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
/**
 * STEP 4
 * grabs guardian inventories. Accurate tracking is off by default, so by default we finish this function and then grabRemoteInventory and head back to step 3 in timers.js
 */
function checkInventory() {
	logger.startLogging("items");
	logger.log("checkInventory");
	return new Promise(function(resolve, reject) {
		grabRemoteInventory(resolve, reject);
	});
}

/**
 * Step 5
 */

function afterAdvisors(advisorData, resolve, currentDateString) {
	if (advisorData) {
		var recordBooks = advisorData.data.recordBooks;
		for (var recordBook of recordBooks) {
			for (var characterInventory of newInventories) {
				for (var inventoryItem of characterInventory.inventory) {
					var itemDefinition = getItemDefinition(inventoryItem.itemHash);
					if (itemDefinition.recordBookHash === recordBook.bookHash) {
						var completed = 0;
						var completionValue = 0;
						for (var record of recordBook.records) {
							for (var objective of record.objectives) {
								if (!inventoryItem.objectives) {
									inventoryItem.objectives = [];
								}
								inventoryItem.objectives.push({
									objectiveHash: objective.objectiveHash,
									progress: objective.progress
								});
								completed += objective.progress;
								completionValue += DestinyObjectiveDefinition[objective.objectiveHash].completionValue;
							}
						}
						if (completed === completionValue) {
							inventoryItem.isGridComplete = true;
						}
						inventoryItem.stackSize = Math.round(((completed / completionValue) * 100)) + "%";
						break;
					}
				}
			}
		}
	}
	logger.timeEnd("Bungie Advisors");
	logger.time("Local Inventory");
	// get old data saved from the last pass
	database.getMultipleStores(["itemChanges", "progression", "currencies", "inventories"]).then(function afterStorageGet(result) {
		// chrome.storage.local.get(["itemChanges", "progression", "currencies", "inventories"], function afterStorageGet(result) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		// check if data is valid. If not, use newly grabbed data instead.
		data.itemChanges = handleInput(result.itemChanges, data.itemChanges);
		data.factionChanges = handleInput(result.factionChanges, data.factionChanges);
		oldProgression = handleInput(result.progression, newProgression);
		for (var attr in result.progression) {
			oldProgression[attr] = handleInput(result.progression[attr], newProgression[attr]);
		}
		oldInventories = handleInput(result.inventories, newInventories);
		oldCurrencies = handleInput(result.currencies, newCurrencies);
		logger.timeEnd("Local Inventory");
		// itemDiff.js
		processDifference(currentDateString, resolve);
	});
}

function grabRemoteInventory(resolve, reject) {
	logger.startLogging("items");
	logger.log("grabRemoteInventory");
	// logger.log("Arrived at grabRemoteInventory");
	logger.time("Bungie Search");
	var currentDateString = moment().utc().format();
	getOption("activeType").then(bungie.setActive);
	// found in bungie.js
	bungie.user().then(function afterBungieUser() {
		bungie.search().then(function afterBungieSearch(guardian) {
			logger.timeEnd("Bungie Search");
			let characters = guardian.data.characters;
			var newestDate = 0;
			var maxLight = globalOptions.minLight;
			// record some descriptors for each character
			for (let avatar of characters) {
				if (!characterDescriptions[avatar.characterBase.characterId]) {
					characterDescriptions[avatar.characterBase.characterId] = {
						name: DestinyClassDefinition[avatar.characterBase.classHash].className,
						gender: DestinyGenderDefinition[avatar.characterBase.genderHash].genderName,
						level: avatar.baseCharacterLevel,
						light: avatar.characterBase.powerLevel,
						race: DestinyRaceDefinition[avatar.characterBase.raceHash].raceName,
						dateLastPlayed: avatar.characterBase.dateLastPlayed,
						currentActivityHash: avatar.characterBase.currentActivityHash
					};
				} else { // we already have set these characters so just update their data.
					characterDescriptions[avatar.characterBase.characterId].level = avatar.baseCharacterLevel;
					characterDescriptions[avatar.characterBase.characterId].light = avatar.characterBase.powerLevel;
					characterDescriptions[avatar.characterBase.characterId].dateLastPlayed = avatar.characterBase.dateLastPlayed;
					characterDescriptions[avatar.characterBase.characterId].currentActivityHash = avatar.characterBase.currentActivityHash;
				}
				if (avatar.characterBase.powerLevel > maxLight) {
					maxLight = avatar.characterBase.powerLevel;
				}
				if (new Date(avatar.characterBase.dateLastPlayed).getTime() > new Date(newestDate).getTime()) { // set newest character for 3oC reminder
					newestDate = avatar.characterBase.dateLastPlayed;
					newestCharacter = avatar.characterBase.characterId;
				}
				if (characterIdList.indexOf(avatar.characterBase.characterId) === -1) {
					characterIdList.push(avatar.characterBase.characterId);
				}
			}
			localStorage.newestCharacter = newestCharacter;
			localStorage.characterDescriptions = JSON.stringify(characterDescriptions);
			if (globalOptions.useGuardianLight && maxLight !== globalOptions.minLight) {
				setOption("minLight", maxLight);
			}
			logger.time("Bungie Items");
			// Loop through all found characters and save their new Item data to newInventories
			logger.info("Character List", characterIdList);
			sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
				logger.timeEnd("Bungie Items");
				logger.time("Bungie Faction");
				// loop through all characters and save their new Faction data to newProgression
				sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
					logger.timeEnd("Bungie Faction");
					logger.time("Bungie Advisors");
					bungie.advisorsForAccount().catch(function(err) {
						if (err) {
							logger.error(err);
						}
						afterAdvisors(false, resolve, currentDateString);
					}).then(function(advisorData) {
						afterAdvisors(advisorData, resolve, currentDateString);
					});
				});
			});
		}).catch(function() {
			// logger.log("left at grabRemoteInventory");
			reject();
		});
	}).catch(function() {
		// logger.log("left at grabRemoteInventory");
		reject();
	});
}

function hasInventorySpace(characterId, itemHash) {
	if (!characterId || !itemHash) {
		return false;
	}
	let itemBucketHash = getItemDefinition(itemHash).bucketTypeHash;
	let bucketHash = itemBucketHash;
	if (characterId === "vault") {
		bucketHash = 138197802;
	}
	let vaultSize = DestinyInventoryBucketDefinition[bucketHash].itemCount;
	var totalStackSize = 0;
	var characterInventory = findInArray(newInventories, "characterId", characterId);
	for (let item of characterInventory.inventory) {
		let itemDef = getItemDefinition(item.itemHash);
		if (itemDef.bucketTypeHash === 4023194814 || itemDef.bucketTypeHash === 434908299 || itemDef.bucketTypeHash === 2973005342 || itemDef.bucketTypeHash === 1469714392 || itemDef.bucketTypeHash === 3865314626 || itemDef.bucketTypeHash === 284967655 || itemDef.bucketTypeHash === 4274335291 || itemDef.bucketTypeHash === 3796357825 || itemDef.bucketTypeHash === 2025709351 || itemDef.bucketTypeHash === 3054419239) {
			if (itemDef.bucketTypeHash === itemBucketHash || characterId === "vault") {
				let itemStackSize = parseInt(item.stackSize, 10);
				if (item.objectives) {
					itemStackSize = 1;
				}
				let stacks = Math.ceil(itemStackSize / itemDef.maxStackSize);
				totalStackSize += stacks;
			}
		}
	}
	return totalStackSize < vaultSize;
}

function findThreeOfCoins(characterId, checkAllCharacters) {
	var found = false;
	if (checkAllCharacters === true) {
		found = findThreeOfCoins(characterId);
		if (found) {
			return found;
		}
		for (var character of newInventories) {
			if (character.characterId !== characterId) {
				found = findThreeOfCoins(character.characterId);
				if (found) {
					return found;
				}
			}
		}
		return found;
	} else {
		var characterInventory = findInArray(newInventories, "characterId", characterId);
		if (characterInventory.inventory) {
			for (let item of characterInventory.inventory) {
				if (item.itemHash === 417308266) {
					return characterId;
				}
			}
		}
	}
	logger.log("Unable to find 3oC on " + characterId);
	return false;
}

function check3oC() {
	return new Promise(function(resolve) {
		logger.startLogging("3oC");
		getOption("track3oC").then(function(track3oC) {
			if (track3oC !== true) {
				logger.log("We are NOT tracking 3oC");
				resolve();
				return false;
			}
			checkThreeOfCoinsXp(track3oC, localStorage.newestCharacter);
			logger.log("We ARE tracking 3oC");
			if (localStorage.move3oC && localStorage.move3oC === "true") { // we have just completed an activity, remind the User about Three of Coins
				if (localStorage.newestCharacter) {
					localStorage.move3oC = "false";
					var threeOfCoinsCharacter = findThreeOfCoins(localStorage.newestCharacter, true);
					logger.log("Sending 3oC from " + threeOfCoinsCharacter);
					if (threeOfCoinsCharacter && hasInventorySpace("vault", 417308266)) {
						setTimeout(function() {
							bungie.transfer(threeOfCoinsCharacter, "0", 417308266, 1, true).then(function(response) {
								console.log(response);
								bungie.transfer(localStorage.newestCharacter, "0", 417308266, 1, false).then(function(response) {
									logger.log("three of coins reminder sent");
									console.log(response);
								});
							});
						}, 5000);
					} else {
						logger.log("three of coins reminder sent, but no space in vault.");
					}
					resolve();
				} else {
					logger.warn("Unable to determine 3oC target.");
					resolve(); // we don't know who you are playing :(
				}
			} else {
				logger.log(`We cannot move 3oC because move3oC = ${localStorage.move3oC}`);
				resolve();
			}
		});
	});
}

function lockByLightLevel(options, item, characterId) {
	if (item.primaryStat.value >= options.minLight) {
		bungie.lock(characterId, item.itemInstanceId).then(function(response) {
			logger.log(response);
		});
		return true;
	}
	logger.info("Failed Light Check.");
	return false;
}

function lockByQualityLevel(options, item, characterId) {
	var qualityLevel = parseItemQuality(item);
	if (qualityLevel.min >= (options.minQuality || 90) && hasQuality(item)) {
		bungie.lock(characterId, item.itemInstanceId).then(function(response) {
			logger.log(response);
		});
		return true;
	}
	logger.info("Failed Quality Check.");
	return false;
}

function eligibleToLock(item, characterId) {
	let itemDef = getItemDefinition(item.itemHash);
	getAllOptions().then(function(options) {
		if ((options.autoLock === false || options.showQuality === false) && options.lockHighLight === false) {
			logger.info(`Failing autoLock on options. showQuality: ${options.showQuality} autoLock: ${options.autoLock} lockHighLight: ${options.lockHighLight}`);
			return false;
		}
		if (!item.stats || !item.primaryStat || (item.primaryStat.statHash !== 368428387 && item.primaryStat.statHash !== 3897883278)) {
			logger.info("Failing autoLock on item type for " + itemDef.itemName);
			return false;
		}
		if ((options.autoLock === false || options.showQuality === false) && options.lockHighLight === true) {
			// light level only
			logger.info("Checking Light Only for " + itemDef.itemName);
			return lockByLightLevel(options, item, characterId);
		}
		if (options.autoLock === true && options.showQuality === true && options.lockHighLight === false) {
			// quality level only
			logger.info("Checking Quality Only for " + itemDef.itemName);
			if (item.primaryStat.statHash === 3897883278) {
				return lockByQualityLevel(options, item, characterId);
			}
		}
		if (options.autoLock === true && options.showQuality === true && options.lockHighLight === true) {
			// light level and quality level
			logger.info("Checking Quality and Light for " + itemDef.itemName);
			if (item.primaryStat.statHash === 3897883278) {
				if (!lockByQualityLevel(options, item, characterId)) {
					return lockByLightLevel(options, item, characterId);
				}
			} else {
				return lockByLightLevel(options, item, characterId);
			}
		}
	});
}

function autoMoveToVault(item, characterId) {
	getAllOptions().then(function(options) {
		var itemDef = getItemDefinition(item.itemHash);
		var singleStackItem = options.keepSingleStackItems.indexOf("" + itemDef.itemHash) > -1;
		var zeroStackItem = options.autoMoveItemsToVault.indexOf("" + itemDef.itemHash) > -1;
		var quantity = 0;
		var transferQuantity = 0;
		var characterInventory = findInArray(newInventories, "characterId", characterId);
		if (singleStackItem) {
			var minStacks = 1;
			for (let newItem of characterInventory.inventory) {
				if (newItem.itemHash === item.itemHash) {
					quantity = newItem.stackSize;
					transferQuantity = quantity - (itemDef.maxStackSize * minStacks);
					break;
				}
			}
		}
		if (zeroStackItem) {
			var minStacks = 0;
			for (let newItem of characterInventory.inventory) {
				if (newItem.itemHash === item.itemHash) {
					quantity = newItem.stackSize;
					transferQuantity = quantity - (itemDef.maxStackSize * minStacks);
					break;
				}
			}
		}
		if (transferQuantity < 1) {
			return false;
		}
		logger.log(`name:${itemDef.itemName}, transferQuantity:${transferQuantity}, quantity:${quantity}, minStacks:${minStacks}, stackSize:${itemDef.maxStackSize}, singleStack:${singleStackItem}, zeroStack:${zeroStackItem}`);
		bungie.transfer(characterId, "0", item.itemHash, transferQuantity, true).then(function(response) {
			logger.log(response);
		});
	});
}

function buildFakeNodes(talentGridHash) {
	var nodes = [];
	var talentGridDef = DestinyCompactTalentDefinition[talentGridHash];
	for(var i=0;i<talentGridDef.nodes.length;i++) {
		nodes.push({
			isActivated:false,
			stepIndex:0,
			nodeHash:i,
			state:7
		});
	}
	return nodes;
}