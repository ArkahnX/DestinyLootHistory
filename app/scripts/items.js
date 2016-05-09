Object.prototype[Symbol.iterator] = function() {
	var keyList = Object.keys(this);
	let index = 0;
	return {
		next: () => {
			let value = this[keyList[index]];
			let done = index >= keyList.length;
			index++;
			return {
				value,
				done
			};
		}
	};
};

var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: [],
	matches: []
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

function recursive(index, array, networkTask, resultTask, endRecursion) {
	if (array[index]) {
		new Promise(function(resolve, reject) {
			// console.time("sequence")
			networkTask(array[index], resolve, index);
		}).then(function(result) {
			// console.timeEnd("sequence")
			resultTask(result, array[index], index);
			recursive(index + 1, array, networkTask, resultTask, endRecursion);
		});
	} else {
		endRecursion();
	}
}

function sequence(array, networkTask, resultTask) {
	return new Promise(function(resolve, reject) {
		recursive(0, array, networkTask, resultTask, resolve);
	});
}

function initItems(callback) {
	console.time("load Bungie Data");
	bungie.user(function(u) {
		bungie.search(function(e) {

			var avatars = e.data.characters;
			for (var c = 0; c < avatars.length; c++) {
				characterDescriptions[avatars[c].characterBase.characterId] = {
					name: DestinyClassDefinition[avatars[c].characterBase.classHash].className,
					gender: DestinyGenderDefinition[avatars[c].characterBase.genderHash].genderName,
					level: avatars[c].baseCharacterLevel,
					light: avatars[c].characterBase.powerLevel,
					race: DestinyRaceDefinition[avatars[c].characterBase.raceHash].raceName
				};
				characterIdList.push(avatars[c].characterBase.characterId);
			}
			localStorage["characterDescriptions"] = JSON.stringify(characterDescriptions);
			console.timeEnd("load Bungie Data");
			callback();
		});
	});
}

function itemNetworkTask(characterId, callback) {
	console.time("itemTask")
	if (characterId === "vault") {
		bungie.vault(callback);
	} else {
		bungie.inventory(characterId, callback);
	}
}

function factionNetworkTask(characterId, callback) {
	console.time("factionTask")
	if (characterId !== "vault") {
		bungie.factions(characterId, callback);
	} else {
		callback();
	}
}

function itemResultTask(result, characterId) {
	console.timeEnd("itemTask")
	if (result) {
		if (!data.inventories[characterId]) {
			data.inventories[characterId] = [];
			newInventories[characterId] = [];
		}
		newInventories[characterId] = result.data.buckets;
	}
}

function factionResultTask(result, characterId) {
	console.timeEnd("factionTask")
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
				console.log(itemData, itemData.nodes, itemData.nodes.length)
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
	if (typeof source !== "undefined") {
		if (typeof source === "string") {
			return JSON.parse(source);
		}
		return source;
	}
	return alt;
}

function checkDiff(sourceArray, newArray) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		var found = false;
		for (var e = 0; e < newArray.length; e++) {
			if (sourceArray[i].bucketHash === 2197472680 && newArray[e].itemInstanceId === sourceArray[i].itemInstanceId) {
				if (sourceArray[i].stackSize !== newArray[e].stackSize) {
					// console.log(sourceArray[i], newArray[e]);
					// console.log(newArray[e].itemInstanceId === sourceArray[i].itemInstanceId && newArray[e].itemHash === sourceArray[i].itemHash, newArray[e].stackSize !== sourceArray[i].stackSize)
				}
			}
			if (newArray[e].itemInstanceId === sourceArray[i].itemInstanceId && newArray[e].itemHash === sourceArray[i].itemHash) {
				found = true;
				if (newArray[e].stackSize !== sourceArray[i].stackSize) {
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


var listenLoop = null;
var stopLoop = null;

function checkInventory() {
	return new Promise(function(resolve, reject) {
		console.time("Bungie Search");
		var currentDateString = moment().utc().format();
		bungie.search(function(e) {
			console.timeEnd("Bungie Search");
			var avatars = e.data.characters;
			for (var c = 0; c < avatars.length; c++) {
				characterDescriptions[avatars[c].characterBase.characterId].light = avatars[c].characterBase.powerLevel;
			}
			console.time("Bungie Items");
			sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
				console.timeEnd("Bungie Items");
				console.time("Bungie Faction");
				sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
					console.timeEnd("Bungie Faction");
					console.time("Local Inventory");
					chrome.storage.local.get(["itemChanges", "progression", "factionChanges", "inventories"], function(result) {
						data.itemChanges = handleInput(result.itemChanges, data.itemChanges);
						data.factionChanges = handleInput(result.factionChanges, data.factionChanges);
						// data.progression = handleInput(result.progression, data.progression);
						// data.inventories = handleInput(result.inventories, data.inventories);
						oldProgression = handleInput(result.progression, newProgression);
						oldInventories = handleInput(result.inventories, newInventories);
						console.timeEnd("Local Inventory");
						processDifference(currentDateString, resolve);
					});
				});
			});
		});
	});
}