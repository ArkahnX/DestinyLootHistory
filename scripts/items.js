Object.prototype[Symbol.iterator] = function() {
	var keyList = Object.keys(this);
	let index = 0;
	return {
		next: () => {
			let value = this[keyList[index]];
			let done = index >= keyList.length;
			index++;
			return {
				value, done
			};
		}
	};
};

var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: []
};
var oldInventories = {};
var oldProgression = {};
var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete"];
var characterIdList = ["vault"];

function recursive(index, array, networkTask, resultTask, endRecursion) {
	if (array[index]) {
		new Promise(function(resolve, reject) {
			networkTask(array[index], resolve);
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
	console.time("load Bungie Data")
	bungie.user(function(u) {
		bungie.search(function(e) {

			var avatars = e.data.characters;

			for (var c = 0; c < avatars.length; c++) {
				characterIdList.push(avatars[c].characterBase.characterId);
			}

			console.timeEnd("load Bungie Data")
			processInventory(callback);
		});
	});
}

function processInventory(callback) {
	console.time("Process Inventory")
	sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
		sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
			chrome.storage.local.get(["itemChanges", "progression", "factionChanges", "inventories"], function(result) {
				data.itemChanges = handleInput(result.itemChanges, data.itemChanges);
				data.factionChanges = handleInput(result.factionChanges, data.factionChanges);
				// data.progression = handleInput(result.progression, data.progression);
				// data.inventories = handleInput(result.inventories, data.inventories);
				oldProgression = handleInput(result.progression, data.progression);
				oldInventories = handleInput(result.inventories, data.inventories);
				console.timeEnd("Process Inventory")
				processDifference();
				callback();
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

function _concat(list, bucketHash, sortedItems) {
	for (var item of list) {
		if (!sortedItems[item.itemHash]) {
			sortedItems[item.itemHash] = buildCompactItem(item, bucketHash);
			sortedItems[item.itemHash].bucketHash = bucketHash;
		} else {
			sortedItems[item.itemHash].stackSize += item.stackSize;
		}
	}
	return sortedItems;
}

function concatItems(itemBucketList) {
	var sortedItems = {};
	var unsortedItems = [];
	for (var category of itemBucketList) {
		// console.log(category)
		if (category.items) {
			sortedItems = _concat(category.items, category.bucketHash, sortedItems);
		} else {
			for (var bucket of category) {
				if (bucket.items) {
					sortedItems = _concat(bucket.items, bucket.bucketHash, sortedItems);
				}
			}
		}
	}
	for (var item of sortedItems) {
		unsortedItems.push(item);
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
	newItemData.itemName = DestinyCompactItemDefinition[hash].itemName;
	newItemData.itemTypeName = DestinyCompactItemDefinition[hash].itemTypeName;
	newItemData.tierTypeName = DestinyCompactItemDefinition[hash].tierTypeName;
	newItemData.bucketHash = bucketHash;
	newItemData.bucketName = DestinyInventoryBucketDefinition[bucketHash].bucketName;
	if (newItemData.stats) {
		for (var e = 0; e < newItemData.stats.length; e++) {
			newItemData.stats[e].statName = DestinyStatDefinition[newItemData.stats[e].statHash].statName;
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
		for (var r = 0; r < newItemData.nodes.length; r++) {
			var newNode = newItemData.nodes[r];
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

function checkDiff(sourceArray, newArray) {
	var itemsRemovedFromSource = [];
	for (var i = 0; i < sourceArray.length; i++) {
		var found = false;
		for (var e = 0; e < newArray.length; e++) {
			if ((newArray[e].itemInstanceId !== "0" && newArray[e].itemInstanceId == sourceArray[i].itemInstanceId) || newArray[e].itemHash == sourceArray[i].itemHash) {
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

function isSameItem(item1, item2) {
	if (item1 === item2) {
		return true;
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

function processDifference() {
	console.time("Process Difference");
	var d = new Date();
	d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
	var currentDateString = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
	var previousFaction = data.factionChanges[data.factionChanges.length - 1];
	var previousItem = data.itemChanges[data.itemChanges.length - 1];
	var previousFactionDate = new Date(currentDateString);
	var previousItemDate = new Date(currentDateString);
	if (typeof previousFaction === "string") {
		previousFactionDate = new Date(previousFaction.timestamp);
	}
	if (typeof previousItem === "string") {
		previousItemDate = new Date(previousItem.timestamp);
	}
	var diffs = [];
	var additions = [];
	var removals = [];
	var transfers = [];
	var changes = [];
	var finalChanges = [];
	if (oldInventories) {
		for (var characterId in oldInventories) {
			var diff = {
				timestamp: currentDateString,
				secondsSinceLastDiff: previousItemDate,
				characterId: characterId,
				removed: checkDiff(oldInventories[characterId], data.inventories[characterId]),
				added: checkDiff(data.inventories[characterId], oldInventories[characterId])
			};
			if (diff.added.length || diff.removed.length) {
				diffs.push(diff);
			}
		}
	}
	if (diffs.length) {
		for (var diff of diffs) {
			for (var addition of diff.added) {
				if (addition) {
					additions.push({
						characterId: diff.characterId,
						item: addition
					});
				}
			}
			for (var removal of diff.removed) {
				if (removal) {
					removals.push({
						characterId: diff.characterId,
						item: removal
					});
				}
			}
		}
		for (var i = additions.length - 1; i >= 0; i--) {
			var addition = additions[i];
			for (var e = removals.length - 1; e >= 0; e--) {
				var removal = removals[e];
				if (addition.characterId !== removal.characterId) {
					if (isSameItem(addition.item, removal.item)) {
						var movedItem = additions.splice(i, 1)[0];
						removals.splice(e, 1);
						transfers.push({
							from: removal.characterId,
							to: addition.characterId,
							item: movedItem.item
						});
						break;
					}
				}
			}
		}
	}
	if (oldProgression) {
		for (var characterId in oldProgression) {
			var diff = {
				timestamp: currentDateString,
				secondsSinceLastDiff: (new Date(currentDateString) - previousFactionDate) / 1000,
				characterId: characterId,
				changes: checkFactionDiff(oldProgression[characterId].progressions, data.progression[characterId].progressions),
				level: null
			};
			for(var attr in data.progression[characterId].levelProgression) {
				diff.level[attr] = data.progression[characterId].levelProgression[attr];
			}
			if (diff.changes.length > 0) {
				changes.push(diff);
			}
		}
	}
	for (var characterId in data.inventories) {
		var diff = {
			timestamp: currentDateString,
			secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
			characterId: characterId,
			removed: [],
			added: [],
			transfered: []
		};
		// if (data.progression[characterId]) {
		// 	diff.level = data.progression[characterId].levelProgression;
		// 	diff.changed = [];
		// 	for (var change of changes) {
		// 		if (change.characterId === characterId) {
		// 			diff.changed.push(change.item);
		// 		}
		// 	}
		// }
		for (var addition of additions) {
			if (addition.characterId === characterId) {
				diff.added.push(addition.item);
			}
		}
		for (var removal of removals) {
			if (removal.characterId === characterId) {
				diff.removed.push(removal.item);
			}
		}
		for (var transfer of transfers) {
			if (transfer.to === characterId) {
				diff.transfered.push(transfer);
			}
		}
		if (diff.removed.length || diff.added.length || diff.transfered.length || (diff.changed && diff.changed.length)) {
			finalChanges.push(diff);
		}
	}
	if (additions.length || removals.length || transfers.length || changes.length) {
		console.log(currentDateString, "\nAdditions:", additions, "\nRemovals:", removals, "\nTransfers:", transfers, "\nChanges:", changes, "\nFinal Changes:", finalChanges);
	}
	Array.prototype.push.apply(data.itemChanges, finalChanges);
	Array.prototype.push.apply(data.factionChanges, changes);
	// Array.prototype.push.apply(additions, checkDiff(data.inventories[characterId], oldInventories[characterId]));
	// Array.prototype.push.apply(removals, checkDiff(oldInventories[characterId], data.inventories[characterId]));
	oldProgression = data.progression;
	oldInventories = data.inventories;
	chrome.storage.local.set(data, function() {
		var itemBlob = new Blob([JSON.stringify(data.itemChanges)], {
			type: 'application/json'
		});

		var url = window.URL;
		var a = document.getElementById('link1');
		a.download = 'itemChanges.json';
		a.href = url.createObjectURL(itemBlob);
		a.textContent = 'Download Item Change Data';
		a.dataset.downloadurl = ['json', a.download, a.href].join(':');
		var factionBlob = new Blob([JSON.stringify(data.factionChanges)], {
			type: 'application/json'
		});

		var a2 = document.getElementById('link2');
		a2.download = 'factionChanges.json';
		a2.href = url.createObjectURL(factionBlob);
		a2.textContent = 'Download Faction Change Data';
		a2.dataset.downloadurl = ['json', a2.download, a2.href].join(':');
	});
	console.timeEnd("Process Difference");
}


var listenLoop = null;
var stopLoop = null;

function checkInventory() {
	sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
		sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
			chrome.storage.local.get(["itemChanges", "progression", "factionChanges", "inventories"], function(result) {
				data.itemChanges = handleInput(result.itemChanges, data.itemChanges);
				data.factionChanges = handleInput(result.factionChanges, data.factionChanges);
				// data.progression = handleInput(result.progression, data.progression);
				// data.inventories = handleInput(result.inventories, data.inventories);
				oldProgression = handleInput(result.progression, data.progression);
				oldInventories = handleInput(result.inventories, data.inventories);
				processDifference();
				trackIdle();
			});
		});
	});
	// sequence(characterIdList, calculateDifference, parseNewItems).then(function() {
	// sequence(characterIdList, calculateDifference, _internalDiffCheck).then(function() {
	// 	sequence(characterIdList, checkFactionRank, factionRepChanges).then(function() {
	// 		chrome.storage.local.set(data);
	// 		// loadGameData();
	// 	});
	// });
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