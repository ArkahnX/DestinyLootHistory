
var newInventories = {};
var newProgression = {};











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





function calculateDifference(characterId, callback) {
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