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
var relevantStats = ["itemHash", "itemInstanceId", "stackSize", "damageTypeHash", "talentGridHash", "isGridComplete", "state"];
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
	bungie.setActive(localStorage.activeType);
	bungie.user().then(function() {
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
				if (characterIdList.indexOf(avatars[c].characterBase.characterId) === -1) {
					characterIdList.push(avatars[c].characterBase.characterId);
				}
			}
			localStorage.newestCharacter = newestCharacter;
			localStorage.characterDescriptions = JSON.stringify(characterDescriptions);
			logger.timeEnd("load Bungie Data");
			if (typeof callback === "function") {
				callback();
			}
		}).catch(function(err) {
			if (typeof callback === "function") {
				callback();
			}
			// console.log(err, err.stack)
		});
	}).catch(function(err) {
		if (typeof callback === "function") {
			callback();
		}
		// console.log(err, err.stack)
	});
}

var inventories = {};
var oldCurrencies = [];
var newCurrencies = [];

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
		newInventories[characterId] = concatItems(result.data.buckets);
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
	if (typeof source === "object") {
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

function checkFactionDiff(sourceArray, newArray, characterId) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		for (var e = 0; e < newArray.length; e++) {
			var diff = false;
			if (newArray[e].progressionHash == sourceArray[i].progressionHash && newArray[e].progressionHash === 3298204156) {
				if (localStorage.track3oC === "true") {
					logger.startLogging("3oC");
					if (!localStorage[`old3oCProgress${characterId}`]) {
						localStorage[`old3oCProgress${characterId}`] = sourceArray[i].currentProgress;
					}
					var old3oCProgress = parseInt(localStorage[`old3oCProgress${characterId}`], 10);
					var progressChange = newArray[e].currentProgress - old3oCProgress;
					if (!localStorage.move3oCCooldown) {
						localStorage.move3oCCooldown = "false";
					}
					if (!localStorage.move3oC) {
						localStorage.move3oC = "false";
					}
					if (localStorage.move3oCCooldown === "true") {
						if (newArray[e].currentProgress > 0 && progressChange > 0) {
							localStorage.move3oCCooldown = "false";
						}
					}
					// logger.log(`Progress === 0 = ${newArray[e].currentProgress} && progressChange < 0 = ${newArray[e].currentProgress} && move3oCCooldown === "false" ${localStorage.move3oCCooldown}`);
					if (newArray[e].currentProgress === 0 && progressChange < 0 && localStorage.move3oCCooldown === "false") {
						localStorage.move3oC = "true";
						localStorage.move3oCCooldown = "true";
						// forceupdate = true;
					}
					localStorage[`old3oCProgress${characterId}`] = newArray[e].currentProgress;
				}
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
	logger.log("checkInventory")
	return new Promise(function(resolve, reject) {
		// grabRemoteInventory(function() {
		// 	if (localStorage.accurateTracking === "true") {
		// 		findHighestMaterial().then(resolve, reject);
		// 	} else {
		// 		resolve();
		// 	}
		// });
		grabRemoteInventory(resolve, reject);
	});
}

/**
 * Step 5
 */

function grabRemoteInventory(resolve, reject) {
	logger.startLogging("items");
	logger.log("grabRemoteInventory")
		// logger.log("Arrived at grabRemoteInventory");
	logger.time("Bungie Search");
	var currentDateString = moment().utc().format();
	bungie.setActive(localStorage.activeType);
	// found in bungie.js
	bungie.user().then(function() {
		bungie.search().then(function(guardian) {
			logger.timeEnd("Bungie Search");
			let characters = guardian.data.characters;
			var newestDate = 0;
			// record some descriptors for each character
			for (let avatar of characters) {
				if (!characterDescriptions[avatar.characterBase.characterId]) {
					characterDescriptions[avatar.characterBase.characterId] = {
						name: DestinyClassDefinition[avatar.characterBase.classHash].className,
						gender: DestinyGenderDefinition[avatar.characterBase.genderHash].genderName,
						level: avatar.baseCharacterLevel,
						light: avatar.characterBase.powerLevel,
						race: DestinyRaceDefinition[avatar.characterBase.raceHash].raceName,
						dateLastPlayed: avatar.characterBase.dateLastPlayed
					};
				} else { // we already have set these characters so just update their data.
					characterDescriptions[avatar.characterBase.characterId].level = avatar.baseCharacterLevel;
					characterDescriptions[avatar.characterBase.characterId].light = avatar.characterBase.powerLevel;
					characterDescriptions[avatar.characterBase.characterId].dateLastPlayed = avatar.characterBase.dateLastPlayed;
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
					bungie.advisorsForAccount().then(function(advisorData) {
						var recordBooks = advisorData.data.recordBooks;
						for (var recordBook of recordBooks) {
							for (var characterInventory of newInventories) {
								for (var inventoryItem of characterInventory) {
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
						logger.timeEnd("Bungie Advisors");
						logger.time("Local Inventory");
						// get old data saved from the last pass
						chrome.storage.local.get(["itemChanges", "progression", "currencies", "inventories"], function(result) {
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
	for (let item of newInventories[characterId]) {
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

function moveLargestItemTo(characterId) {
	let largestItem = null;
	for (let item of newInventories.vault) {
		let itemDef = getItemDefinition(item.itemHash);
		if (item.itemHash !== 342707700 && item.itemHash !== 342707701 && item.itemHash !== 342707703 && item.itemHash !== 142694124 && item.itemHash !== 3881084295 && item.itemHash !== 1565194903 && item.itemHash !== 3026483582 && item.itemHash !== 1027379218 && item.itemHash !== 1556533319 && (itemDef.bucketTypeHash === 1469714392 || itemDef.bucketTypeHash === 3865314626)) {
			if (!localStorage.oldTransferMaterial || (localStorage.oldTransferMaterial && parseInt(localStorage.oldTransferMaterial) !== item.itemHash)) {
				logger.log(item.itemHash, localStorage.oldTransferMaterial)
				if (!largestItem) {
					largestItem = item;
				}
				if (parseInt(item.stackSize) > parseInt(largestItem.stackSize)) {
					largestItem = item;
				}
			}
		}
	}
	if (largestItem) {
		let localDescription = characterDescriptions[characterId];
		if (hasInventorySpace(characterId, largestItem.itemHash)) {
			logger.log(`Moved ${largestItem.stackSize} ${getItemDefinition(largestItem.itemHash).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (${findQuantityIn("vault", largestItem.itemHash)} in Vault)`);
			logger.info(`Bungie Transfer to character: ${characterId}, material: ${largestItem.itemHash}, quantity: ${largestItem.stackSize}, vaultQuantity: ${findQuantityIn("vault", largestItem.itemHash)}`);
			localStorage.oldTransferMaterial = "null";
			localStorage.transferMaterial = largestItem.itemHash;
			localStorage.transferMaterialStack = largestItem.stackSize;
			localStorage.transferQuantity = 0;
			return bungie.transfer(characterId, "0", largestItem.itemHash, largestItem.stackSize, false);
		} else {
			logger.info(`No Space to move to character`);
			return new Promise(function(resolve) {
				resolve();
			});
		}
	}
	return largestItem;
}

function findQuantityIn(characterId, item) {
	if (characterId && item) {
		if (localStorage.transferMaterial !== "null") {
			for (let item of newInventories[characterId]) {
				if (item.itemHash === parseInt(localStorage.transferMaterial)) {
					return item.stackSize;
				}
			}
		}
	}
	return 0;
}

var findHighestMaterial = (function() {
	var newestCharacterDate = null;
	var reset = true;
	if (!localStorage.transferMaterial) {
		localStorage.transferMaterial = "null";
	}
	if (!localStorage.newestCharacter) {
		localStorage.newestCharacter = "null";
	}
	if (!localStorage.transferQuantity) {
		localStorage.transferQuantity = 0;
	}
	return function() {
		logger.startLogging("items");
		logger.time("bigmat");
		var itemQuantity = findQuantityIn(localStorage.newestCharacter, parseInt(localStorage.transferMaterial));
		var vaultQuantity = findQuantityIn("vault", parseInt(localStorage.transferMaterial));
		if ((localStorage.transferMaterial !== "null" && localStorage.newestCharacter !== "null" && parseInt(localStorage.transferQuantity) > 0) && (reset || parseInt(localStorage.transferQuantity) > itemQuantity)) {
			if (vaultQuantity !== 0) {
				let localCharacter = localStorage.newestCharacter;
				let localMaterial = parseInt(localStorage.transferMaterial);
				let localTransferQuantity = parseInt(localStorage.transferQuantity);
				if (localTransferQuantity > vaultQuantity) {
					localTransferQuantity = vaultQuantity;
				}
				let localDescription = characterDescriptions[localCharacter];
				if (hasInventorySpace(localCharacter, localMaterial)) {
					logger.log(`Moved ${localTransferQuantity} ${getItemDefinition(localMaterial).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (${vaultQuantity} in Vault)`);
					logger.info(`Bungie Transfer to character: ${localCharacter}, material: ${localMaterial}, quantity: ${localTransferQuantity}, vaultQuantity: ${findQuantityIn("vault", parseInt(localStorage.transferMaterial))}`);
					bungie.transfer(localCharacter, "0", localMaterial, localTransferQuantity, false);
				} else {
					logger.info(`No Space to move to character`);
					return new Promise(function(resolve) {
						resolve();
					});
				}
			} else {
				let localDescription = characterDescriptions[localStorage.newestCharacter];
				logger.info(`Skipped moving ${localStorage.transferQuantity} ${getItemDefinition(parseInt(localStorage.transferMaterial)).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (Reason: 0 in Vault)`);
			}
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
				if ((!localStorage.newestCharacter || localStorage.newestCharacter === "null") || date > newestCharacterDate) {
					if (localStorage.newestCharacter !== characterId || new Date().getTime() > date.getTime() + (1000 * 60 * 10)) {
						if (parseInt(localStorage.transferQuantity) > 0 && localStorage.transferMaterial !== "null") {
							if (vaultQuantity !== 0) {
								let localCharacter = localStorage.newestCharacter;
								let localMaterial = parseInt(localStorage.transferMaterial);
								let localTransferQuantity = parseInt(localStorage.transferQuantity);
								if (localTransferQuantity > vaultQuantity) {
									localTransferQuantity = vaultQuantity;
								}
								let localDescription = characterDescriptions[localCharacter];
								if (hasInventorySpace(localCharacter, localMaterial)) {
									logger.log(`Moved ${localTransferQuantity} ${getItemDefinition(localMaterial).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (${vaultQuantity} in Vault)`);
									logger.info(`Bungie Transfer to character: ${localCharacter}, material: ${localMaterial}, quantity: ${localTransferQuantity}, vaultQuantity: ${findQuantityIn("vault", parseInt(localStorage.transferMaterial))}`);
									bungie.transfer(localCharacter, "0", localMaterial, localTransferQuantity, false);
								} else {
									logger.info(`No Space to move to character`);
									return new Promise(function(resolve) {
										resolve();
									});
								}
							} else {
								let localDescription = characterDescriptions[localStorage.newestCharacter];
								logger.info(`Skipped moving ${localStorage.transferQuantity} ${getItemDefinition(parseInt(localStorage.transferMaterial)).itemName} to ${localDescription.race} ${localDescription.gender} ${localDescription.name} (Reason: 0 in Vault)`);
							}
						}
						localStorage.newestCharacter = characterId;
						localStorage.transferQuantity = 0;
						if (localStorage.transferMaterial) {
							localStorage.oldTransferMaterial = localStorage.transferMaterial;
						}
						localStorage.transferMaterial = null;
						localStorage.transferMaterialStack = 0;
					}
					newestCharacterDate = date;
				}
			}
		}
		logger.timeEnd("char");
		if (!localStorage.transferMaterial || localStorage.transferMaterial === "null") {
			logger.time("mats");
			for (let item of newInventories[localStorage.newestCharacter]) {
				let itemDefinition = getItemDefinition(item.itemHash);
				if (itemDefinition.bucketTypeHash === 3865314626 || itemDefinition.bucketTypeHash === 1469714392) {
					if (item.itemHash !== 342707700 && item.itemHash !== 342707701 && item.itemHash !== 342707703 && item.itemHash !== 142694124 && item.itemHash !== 3881084295 && item.itemHash !== 1565194903 && item.itemHash !== 3026483582 && item.itemHash !== 1027379218 && item.itemHash !== 1556533319 && item.itemHash !== 937555249 && ((!localStorage.transferMaterial || localStorage.transferMaterial === "null") || item.stackSize > parseInt(localStorage.transferMaterialStack)) && item.stackSize > 199) {
						localStorage.oldTransferMaterial = localStorage.transferMaterial;
						localStorage.transferMaterial = item.itemHash;
						localStorage.transferMaterialStack = item.stackSize;
					}
				}
			}
			logger.timeEnd("mats");
		}
		if (localStorage.transferMaterial === "null") {
			logger.error("no valid materials on guardian");
			// moveLargestItemTo(localStorage.newestCharacter);
		}
		localStorage.transferQuantity = parseInt(localStorage.transferQuantity) + 1;
		logger.timeEnd("bigmat");
		if (hasInventorySpace("vault", parseInt(localStorage.transferMaterial, 10))) {
			if (hasInventorySpace(localStorage.newestCharacter, parseInt(localStorage.transferMaterial, 10))) {
				logger.log(`Moved 1 ${getItemDefinition(localStorage.transferMaterial).itemName} to Vault (${vaultQuantity} in Vault)`);
				logger.info(`Bungie Transfer to vault from: ${localStorage.newestCharacter}, material: ${localStorage.transferMaterial}, quantity: 1, guardianQuantity: ${findQuantityIn(localStorage.newestCharacter, parseInt(localStorage.transferMaterial))}`);
				return bungie.transfer(localStorage.newestCharacter, "0", localStorage.transferMaterial, 1, true);
			} else {
				logger.info(`No Space to move to character`);
				return new Promise(function(resolve) {
					resolve();
				});
			}
		} else {
			logger.info(`No Space to move to vault`);
			return new Promise(function(resolve) {
				resolve();
			});
		}
	};
}());

function findThreeOfCoins(characterId) {
	if (newInventories && newInventories[characterId]) {
		for (let item of newInventories[characterId]) {
			if (item.itemHash === 417308266) {
				return characterId;
			}
		}
		// for (let character in newInventories) {
		// 	for (let item of newInventories[character]) {
		// 		if (item.itemHash === 417308266) {
		// 			return character;
		// 		}
		// 	}
		// }
	}
	return false;
}

function check3oC() {
	return new Promise(function(resolve) {
		logger.startLogging("3oC")
		if (!localStorage.track3oC) {
			localStorage.track3oC = "true";
		}
		if (localStorage.track3oC === "true") {
			logger.log("We ARE tracking 3oC");
			if (localStorage.move3oC && localStorage.move3oC === "true") { // we have just completed an activity, remind the User about Three of Coins
				if (localStorage.newestCharacter) {
					logger.log("three of coins reminder sent");
					var threeOfCoinsCharacter = findThreeOfCoins(localStorage.newestCharacter);
					if (threeOfCoinsCharacter && hasInventorySpace("vault", 417308266)) {
						setTimeout(function() {
							bungie.transfer(threeOfCoinsCharacter, "0", 417308266, 1, true).then(function() {
								bungie.transfer(threeOfCoinsCharacter, "0", 417308266, 1, false);
							});
						}, 5000);
					} else {
						logger.log("three of coins reminder sent, but no space in vault.");
					}
					localStorage.move3oC = "false";
					resolve();
				} else {
					logger.warn("Unable to determine 3oC target.");
					resolve(); // we don't know who you are playing :(
				}
			} else {
				logger.log(`We cannot move 3oC because move3oC = ${localStorage.move3oC}`);
				resolve();
			}
		} else {
			logger.log("We are NOT tracking 3oC");
			resolve();
		}
	});
}

function eligibleToLock(item, characterId) {
	if(hasQuality(item) && item.primaryStat.value > 334) {
		var qualityLevel = parseItemQuality(item);
		if(qualityLevel.min > 94) {
			bungie.lock(characterId, item.itemInstanceId);
		}
	}
}