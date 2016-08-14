var matchIdList = [];

function getLocalMatches() {
	return new Promise(function(resolve, reject) {
		logger.startLogging("matches");
		logger.time("Local Matches");
		chrome.storage.local.get(["matches"], function(result) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			data.matches = handleInput(result.matches, data.matches);
			for (var activity of data.matches) {
				if (matchIdList.indexOf(activity.characterId + "-" + activity.activityInstance) === -1) {
					matchIdList.push(activity.characterId + "-" + activity.activityInstance);
				}
			}
			logger.timeEnd("Local Matches");
			resolve(data);
		});
	});
}

function getRemoteMatches() {
	return new Promise(function(resolve, reject) {
		logger.startLogging("matches");
		logger.time("Remote Matches");
		if (data.itemChanges[0]) {
			sequence(characterIdList, getBungieMatchData, function() {}).then(function() {
				data.matches.sort(function(a, b) {
					return new Date(a.timestamp) - new Date(b.timestamp);
				});
				logger.timeEnd("Remote Matches");
				resolve();
			});
		} else {
			resolve();
		}
		// resolve();
	});
}

function deleteMatchData() {}

function getBungieMatchData(characterId, resolve) {
	var firstDateString = data.itemChanges[0].timestamp;
	if (characterId !== "vault") {
		_remoteMatch(0, firstDateString, characterId, resolve);
	} else {
		resolve();
	}
}

function _remoteMatch(page, firstDateString, characterId, resolve) {
	logger.startLogging("matches");
	logger.time("Look Up Match");
	bungie.activity(characterId, "None", 10, page).then(function(result) {
		var foundOldDate = false;
		if (result.data && result.data.activities.length) {
			for (var activity of result.data.activities) {
				if (new Date(activity.period) >= new Date(firstDateString)) {
					if (matchIdList.indexOf(characterId + "-" + activity.activityDetails.instanceId) === -1) {
						matchIdList.push(characterId + "-" + activity.activityDetails.instanceId);
						data.matches.push(compactMatch(activity, characterId));
					} else {
						foundOldDate = true;
						break;
					}
				} else {
					foundOldDate = true;
					break;
				}
			}
			logger.timeEnd("Look Up Match");
			if (!foundOldDate) {
				_remoteMatch(page + 1, firstDateString, characterId, resolve);
			} else {
				resolve();
			}
		}
	}).catch(function(err) {
		if (err) {
			logger.error(err);
		}
		resolve();
	});
}

function compactMatch(activity, characterId) {
	return {
		timestamp: activity.period,
		activityHash: activity.activityDetails.referenceId,
		activityInstance: activity.activityDetails.instanceId,
		activityTypeHashOverride: activity.activityDetails.activityTypeHashOverride,
		activityTime: activity.values.activityDurationSeconds.basic.value,
		characterId: characterId
	};
}

function applyMatchData() {
	return new Promise(function(resolve, reject) {
		logger.startLogging("matches");
		logger.time("Match Data");
		var results = 0;
		let i = data.itemChanges.length;
		while (i--) {
			var itemDiff = data.itemChanges[i];
			if (itemDiff.match) {
				results++;
			}
			if (results > 5) {
				break;
			}
			var timestamp = new Date(itemDiff.timestamp).getTime();
			let e = data.matches.length;
			while (e--) {
				var match = data.matches[e];
				var minTime = new Date(match.timestamp).getTime();
				var maxTime = minTime + ((match.activityTime + 120) * 1000);
				if (timestamp >= minTime && maxTime >= timestamp) {
					itemDiff.match = JSON.stringify(match);
					break;
				}
			}
		}
		chrome.storage.local.set({
			inventories: data.inventories,
			itemChanges: CLEANUP(data.itemChanges),
			progression: data.progression,
			matches: data.matches,
			currencies: data.currencies
		}, function() {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			logger.timeEnd("Match Data");
			resolve();
		});
	});
}

function constructMatchInterface() {
	var nodes = document.querySelectorAll(".timestamp");
	for (var node of nodes) {
		if (node.dataset.activity === "") {
			var index = parseInt(node.dataset.index, 10);
			for (var itemDiff of data.itemChanges) {
				if (itemDiff.id === index) {
					if (itemDiff.match) {
						var match = JSON.parse(itemDiff.match);
						var activityTypeData = DestinyActivityDefinition[match.activityHash];
						node.dataset.activity = " " + activityTypeData.activityName;
					}
					break;
				}
			}
		}
	}
}

function CLEANUP(itemSet) {
	let i = itemSet.length;
	while (i--) {
		let itemDiff = itemSet[i];
		let previousItemSet = itemSet[i - 1];
		if (previousItemSet) {
			if (!itemDiff.added.length && !itemDiff.removed.length && (!itemDiff.progression || !itemDiff.progression.length) && (!itemDiff.transferred || !itemDiff.transferred.length)) {
				itemSet.splice(i, 1);
			} else if ((itemDiff.added.length && previousItemSet.removed.length) || (previousItemSet.added.length && itemDiff.removed.length)) {
				var changes = compareItemDiffs(itemDiff, previousItemSet);
				itemSet[i] = changes.current;
				itemSet[i - 1] = changes.other;
			}
		}
	}
	return itemSet;
}

function compareItemDiffs(currentItemDiff, otherItemDiff) {
	let a1 = currentItemDiff.added.length;
	while (a1--) {
		let r1 = otherItemDiff.removed.length;
		while (r1--) {
			let addedData = currentItemDiff.added[a1];
			let removedData = otherItemDiff.removed[r1];
			let removedCharacter = removedData.characterId || otherItemDiff.characterId;
			let addedCharacter = addedData.characterId || currentItemDiff.characterId;
			let addedItem = addedData;
			let removedItem = removedData;
			if (addedData.item) {
				addedItem = addedData.item;
			}
			if (removedData.item) {
				removedItem = removedData.item;
			}
			addedItem = JSON.parse(addedItem);
			removedItem = JSON.parse(removedItem);
			if (addedItem.itemHash === removedItem.itemHash && addedItem.itemInstanceId === removedItem.itemInstanceId) {
				// if()
				if (addedItem.stackSize === removedItem.stackSize) {
					if (!otherItemDiff.transferred) {
						otherItemDiff.transferred = [];
					}
					let newData = {
						from: removedCharacter,
						to: addedCharacter,
						item: JSON.stringify(addedItem)
					};
					otherItemDiff.transferred.push(newData);
					currentItemDiff.added.splice(a1, 1);
					otherItemDiff.removed.splice(r1, 1);
					break;
				}
			}
		}
	}
	let a = currentItemDiff.removed.length;
	while (a--) {
		let r = otherItemDiff.added.length;
		while (r--) {
			let currentData = currentItemDiff.removed[a];
			let otherData = otherItemDiff.added[r];
			let otherCharacter = otherData.characterId || otherItemDiff.characterId;
			let currentCharacter = currentData.characterId || currentItemDiff.characterId;
			let currentItem = currentData;
			let otherItem = otherData;
			if (currentData.item) {
				currentItem = currentData.item;
			}
			if (otherData.item) {
				otherItem = otherData.item;
			}
			currentItem = JSON.parse(currentItem);
			otherItem = JSON.parse(otherItem);
			if (currentItem.itemHash === otherItem.itemHash && currentItem.itemInstanceId === otherItem.itemInstanceId && currentCharacter !== otherCharacter) {
				// if()
				if (currentItem.stackSize === otherItem.stackSize) {
					if (!otherItemDiff.transferred) {
						otherItemDiff.transferred = [];
					}
					let newData = {
						from: currentCharacter,
						to: otherCharacter,
						item: JSON.stringify(currentItem)
					};
					otherItemDiff.transferred.push(newData);
					currentItemDiff.removed.splice(a, 1);
					otherItemDiff.added.splice(r, 1);
					break;
				}
			}
		}
	}
	return {
		current: currentItemDiff,
		other: otherItemDiff
	};
}