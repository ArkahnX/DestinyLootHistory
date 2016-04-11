var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: []
};
var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete"];
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

function handleInput(source, alt) {
	if (typeof source !== "undefined") {
		if (typeof source === "string") {
			return JSON.parse(source);
		}
		return source;
	}
	return alt;
}