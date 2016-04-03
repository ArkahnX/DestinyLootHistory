var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: []
};
var newInventories = {};
var newProgression = {};
var characterIdList = ["vault"];

function recursive(index, array, networkTask, resultTask, endRecursion) {
	if (array[index]) {
		new Promise(function(resolve, reject) {
			networkTask(array[index], resolve)
		}).then(function(result) {
			resultTask(result, array[index]);
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

function handleInput(source, alt) {
	if (typeof source !== "undefined") {
		if (typeof source === "string") {
			return JSON.parse(source);
		}
		return source;
	}
	return alt;
}


function initItems(callback) {
	bungie.user(function(u) {
		bungie.search(function(e) {

			var avatars = e.data.characters;

			for (var c = 0; c < avatars.length; c++) {
				characterIdList.push(avatars[c].characterBase.characterId);
			}

			sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
				sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
					chrome.storage.local.get(["itemData", "itemChanges", "progression", "factionChanges", "inventories"], function(result) {
						data.itemChanges = handleInput(result.itemData, data.itemChanges);
						data.itemChanges = handleInput(result.itemChanges, data.itemChanges);
						data.factionChanges = handleInput(result.factionChanges, data.factionChanges);
						data.progression = handleInput(result.progression, data.progression);
						data.inventories = handleInput(result.inventories, data.inventories);
					});
					callback();
				});
			});
		});
	});
}

function itemNetworkTask(characterId, callback) {
	if (characterId === "vault") {
		bungie.vault(callback);
	} else {
		bungie.inventory(characterId, callback);
	}
}

function factionNetworkTask(characterId, callback) {
	if (characterId !== "vault") {
		bungie.factions(characterId, callback);
	} else {
		callback();
	}
}

function itemResultTask(result, characterId) {
	if (result) {
		if (!data.inventories[characterId]) {
			data.inventories[characterId] = [];
		}
		data.inventories[characterId] = concatItems(result.data.buckets);
	}
}

function factionResultTask(result, characterId) {
	if (result) {
		if (!data.progression[characterId]) {
			data.progression[characterId] = [];
		}
		data.progression[characterId] = result.data;
	}
}

function saveInventory(characterId) {

}

function checkDiff(sourceArray, newArray) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		var found = false;
		for (var e = 0; e < newArray.length; e++) {
			if ((newArray[e].itemInstanceId != 0 && newArray[e].itemInstanceId == sourceArray[i].itemInstanceId) || newArray[e].itemHash == sourceArray[i].itemHash) {
				found = true;
				if (newArray[e].stackSize !== sourceArray[i].stackSize) {
					var newItem = JSON.parse(JSON.stringify(sourceArray[i]));
					newItem.stackSize = sourceArray[i].stackSize - newArray[e].stackSize;
					if (newItem.stackSize > 0) {
						itemsRemovedFromSource.push(newItem);
					}
				}
			}
		}
		if (found === false) {
			itemsRemovedFromSource.push(sourceArray[i]);
		}
	}
	return itemsRemovedFromSource;
}

var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete"];

function concatItems(itemBucketList) {
	var sortedItems = {};
	var unsortedItems = [];
	if (Array.isArray(itemBucketList)) {
		for (var i = 0; i < itemBucketList.length; i++) {
			var bucket = itemBucketList[i];
			for (var e = 0; e < bucket.items.length; e++) {
				var item = bucket.items[e];
				if (!sortedItems[item.itemHash]) {
					sortedItems[item.itemHash] = buildCompactItem(item, bucket.bucketHash);
					sortedItems[item.itemHash].bucketHash = bucket.bucketHash;
				} else {
					sortedItems[item.itemHash].stackSize += item.stackSize;
				}
			}
		}
	} else {
		for (var attr in itemBucketList) {
			var bucketList = itemBucketList[attr];
			for (var i = 0; i < bucketList.length; i++) {
				var bucket = bucketList[i];
				for (var e = 0; e < bucket.items.length; e++) {
					var item = bucket.items[e];
					if (!sortedItems[item.itemHash]) {
						sortedItems[item.itemHash] = buildCompactItem(item, bucket.bucketHash);
						sortedItems[item.itemHash].bucketHash = bucket.bucketHash;
					} else {
						sortedItems[item.itemHash].stackSize += item.stackSize;
					}
				}
			}
		}
	}
	for (var attr in sortedItems) {
		unsortedItems.push(sortedItems[attr]);
	}
	return unsortedItems;
}

function buildCompactItem(itemData, bucketHash) {
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
	newItemData.itemName = DestinyInventoryItemDefinition[hash].itemName;
	newItemData.itemTypeName = DestinyInventoryItemDefinition[hash].itemTypeName;
	newItemData.tierTypeName = DestinyInventoryItemDefinition[hash].tierTypeName;
	newItemData.bucketHash = bucketHash;
	newItemData.bucketName = DestinyInventoryBucketDefinition[bucketHash].bucketName;
	if (newItemData.stats) {
		for (var i = 0; i < newItemData.stats.length; i++) {
			newItemData.stats[i].statName = DestinyStatDefinition[newItemData.stats[i].statHash].statName;
		}
	}
	if (newItemData.damageTypeHash) {
		newItemData.damageTypeName = DestinyDamageTypeDefinition[newItemData.damageTypeHash].damageTypeName;
	}
	if (newItemData.primaryStat) {
		newItemData.primaryStat.statName = DestinyStatDefinition[newItemData.primaryStat.statHash].statName;
	}
	if (newItemData.nodes) {
		var sortedNodes = [];
		for (var i = 0; i < newItemData.nodes.length; i++) {
			var newNode = newItemData.nodes[i];
			if (newNode.hidden === false) {
				var nodeHash = newNode.nodeHash;
				var stepIndex = newNode.stepIndex;
				newNode.nodeStepName = DestinyTalentGridDefinition[newItemData.talentGridHash].nodes[nodeHash].steps[stepIndex].nodeStepName;
				sortedNodes.push(newNode);
			}
		}
		if (sortedNodes.length === 0) {
			delete newItemData.nodes;
		} else {
			newItemData.nodes = sortedNodes;
		}
	}
	return newItemData;
}

function calculateDifference(characterId, callback) {
	// if (characterId === "vault") {
	// 	bungie.vault(function(itemData) {
	// 		_internalDiffCheck(itemData, characterId, callback);
	// 	});
	// } else {
	// 	bungie.inventory(characterId, function(itemData) {
	// 		_internalDiffCheck(itemData, characterId, callback);
	// 	});
	// }
	if (characterId === "vault") {
		bungie.vault(callback);
	} else {
		bungie.inventory(characterId, callback);
	}
}

function checkFactionRank(characterId, callback) {
	if (characterId !== "vault") {
		bungie.factions(characterId, callback);
	} else {
		callback();
	}
}

function parseNewItems(itemData, characterId) {
	var newItems = concatItems(itemData.data.buckets);
	newInventories[characterId] = newItems;
}

function _internalDiffCheck(itemData, characterId) {
	var newItems = concatItems(itemData.data.buckets);
	var d = new Date();
	d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
	var currentDate = new Date(d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2));
	var previous = data.itemChanges[data.itemChanges.length - 1]
	if (previous) {
		var oldDate = new Date(previous.timestamp) || currentDate;
	} else {
		var oldDate = currentDate;
	}
	var diff = {
		destinyGameId: 0,
		timestamp: currentDate,
		secondsSinceLastDiff: (currentDate - oldDate) / 1000,
		characterId: characterId,
		removed: checkDiff(data.inventories[characterId], newItems),
		added: checkDiff(newItems, data.inventories[characterId]),
		transfered: []
	};
	data.inventories[characterId] = newItems;
	if (diff.added.length > 0 || diff.removed.length > 0) {
		trackIdle();
		data.itemChanges.push(diff);
		console.log(diff)
	} else {
		// console.log("No Changes For", characterId)
	}
}

function checkFactionDiff(sourceArray, newArray) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		for (var e = 0; e < newArray.length; e++) {
			var diff = false;
			if (newArray[e].progressionHash == sourceArray[i].progressionHash) {
				var newItem = {
					progressionHash: newArray[e].progressionHash,
					name: DestinyProgressionDefinition[newArray[e].progressionHash].name
				};
				for (var attr in newArray[e]) {
					if (newArray[e][attr] !== sourceArray[i][attr]) {
						diff = true;
						newItem[attr] = sourceArray[i][attr] - newArray[e][attr];
					}
				}
				if (diff) {
					itemsRemovedFromSource.push(newItem);
				}
			}
		}
	}
	return itemsRemovedFromSource;
}

function factionRepChanges(factionRep, characterId) {
	if (factionRep) {
		var newRep = factionRep.data;
		var d = new Date();
		d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
		var currentDate = new Date(d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2));
		var previous = data.factionChanges[data.factionChanges.length-1];
		if (previous) {
			var oldDate = new Date(previous.timestamp) || currentDate;
		} else {
			var oldDate = currentDate;
		}
		var diff = {
			destinyGameId: 0,
			timestamp: currentDate,
			secondsSinceLastDiff: (currentDate - oldDate) / 1000,
			characterId: characterId,
			changes: checkFactionDiff(newRep.progressions, data.progression[characterId].progressions),
			level: newRep.levelProgression
		};
		data.progression[characterId] = newRep;
		if (diff.changes.length > 0) {
			trackIdle();
			data.factionChanges.push(diff);
			console.log(diff)
		} else {
			// console.log("No Changes For", characterId)
		}
	}
}

// function checkDiffs

var listenLoop = null;
var stopLoop = null;

function checkInventory() {
	// sequence(characterIdList, calculateDifference, parseNewItems).then(function() {
	sequence(characterIdList, calculateDifference, _internalDiffCheck).then(function() {
		sequence(characterIdList, checkFactionRank, factionRepChanges).then(function() {
			chrome.storage.local.set(data);
			// loadGameData();
		});
	});
	// for (var c = 0; c < avatars.length; c++) {
	// 	if (avatars[c] === "vault") {
	// 		calculateDifference("vault", callback);
	// 	} else {
	// 		calculateDifference(avatars[c].characterBase.characterId, callback);
	// 	}
	// }
}

function startListening() {
	if (listenLoop === null) {
		trackIdle();
		var element = document.querySelector("#startTracking");
		element.setAttribute("value", "Stop Tracking");
		listenLoop = setInterval(function() {
			checkInventory();
		}, 15000);
	}
}

function stopListening() {
	if (listenLoop !== null) {
		var element = document.querySelector("#startTracking");
		element.setAttribute("value", "Begin Tracking");
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