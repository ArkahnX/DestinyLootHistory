var matchIdList = [];

function getLocalMatches() {
	return new Promise(function (resolve, reject) {
		console.time("Local Matches");
		database.getAllEntries("matches").then(function (result) {
			// chrome.storage.local.get(["matches"], function(result) {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError);
			}
			matches = handleInput(result.matches, matches);
			for (var activity of matches) {
				if (matchIdList.indexOf(activity.characterId + "-" + activity.activityInstance) === -1) {
					matchIdList.push(activity.characterId + "-" + activity.activityInstance);
				}
			}
			console.timeEnd("Local Matches");
			resolve();
		});
	});
}

function getRemoteMatches() {
	return new Promise(function (resolve, reject) {
		console.time("Remote Matches");
		if (itemChanges[0]) {
			sequence(characterIdList, getBungieMatchData, function () {}).then(function () {
				matches.sort(function (a, b) {
					return new Date(a.timestamp) - new Date(b.timestamp);
				});
				console.timeEnd("Remote Matches");
				if (FINALCHANGESHUGE) {
					tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, "Resolve Remote Matches");
				}
				resolve();
			});
		} else {
			if (FINALCHANGESHUGE) {
				tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, "Resolve Remote Matches");
			}
			resolve();
		}
		// resolve();
	});
}

function deleteMatchData() {}

function getBungieMatchData(characterId, resolve) {
	var firstDateString = itemChanges[0].timestamp;
	if (characterId !== "vault") {
		_remoteMatch(0, firstDateString, characterId, resolve);
	} else {
		resolve();
	}
}

function _remoteMatch(page, firstDateString, characterId, resolve) {
	console.time("Look Up Match");
	bungie.activity(characterId, "None", 10, page).then(function (result) {
		var foundOldDate = false;
		if (result.data && result.data.activities.length) {
			for (var activity of result.data.activities) {
				if (new Date(activity.period) >= new Date(firstDateString)) {
					if (matchIdList.indexOf(characterId + "-" + activity.activityDetails.instanceId) === -1) {
						matchIdList.push(characterId + "-" + activity.activityDetails.instanceId);
						matches.push(compactMatch(activity, characterId));
					} else {
						foundOldDate = true;
						break;
					}
				} else {
					foundOldDate = true;
					break;
				}
			}
			console.timeEnd("Look Up Match");
			if (!foundOldDate) {
				_remoteMatch(page + 1, firstDateString, characterId, resolve);
			} else {
				resolve();
			}
		}
	}).catch(function (err) {
		if (err) {
			console.error(err);
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
	return new Promise(function (resolve, reject) {
		console.time("Match Data");
		var results = 0;
		let i = itemChanges.length;
		while (i--) {
			var itemDiff = itemChanges[i];
			if (itemDiff.match) {
				results++;
			}
			if (results > 5) {
				break;
			}
			var timestamp = new Date(itemDiff.timestamp).getTime();
			let e = matches.length;
			while (e--) {
				var match = matches[e];
				var minTime = new Date(match.timestamp).getTime();
				var maxTime = minTime + ((match.activityTime + 120) * 1000);
				if (timestamp < minTime) {
					break;
				}
				if (timestamp >= minTime && maxTime >= timestamp) {
					itemDiff.match = JSON.stringify(match);
					break;
				}
			}
		}
		var newData = {
			inventories: currentInventories,
			itemChanges: itemChanges,
			progression: currentProgression,
			matches: matches,
			currencies: currentCurrencies
		};
		database.addFromObject(newData).then(function () {
			if (FINALCHANGESHUGE) {
				tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, "Data Saved");
			}
			console.timeEnd("Match Data");
			localStorage.updateUI = "true";
			resolve();
		});
	});
}

function constructMatchInterface() {
	var nodes = document.querySelectorAll(".timestamp");
	for (var node of nodes) {
		if (node.dataset.activity === "") {
			var index = parseInt(node.dataset.index, 10);
			for (var itemDiff of itemChanges) {
				if (itemDiff.id === index) {
					if (itemDiff.match) {
						var match = JSON.parse(itemDiff.match);
						var activityData = DestinyActivityDefinition[match.activityHash];
						var activityTypeData = DestinyActivityTypeDefinition[match.activityHash];
						// node.dataset.activity = activityData.activityName;
						// node.dataset.activityType = activityTypeData.activityTypeName;
					}
					break;
				}
			}
		}
	}
}

function CLEANUP(itemSet) {
	console.time("cleanup")
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
	console.timeEnd("cleanup")
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