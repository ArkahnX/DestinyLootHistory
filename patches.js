for (var diff of data.itemChanges) {
	if (diff.progression) {
		for (var progress of diff.progression) {
			if (progress.icon) {
				delete progress.icon;
			}
			if (progress.name) {
				delete progress.name;
			}
			if (progress.description) {
				delete progress.description;
			}
			if (progress.currentProgress) {
				delete progress.currentProgress;
			}
			for (var faction of DestinyFactionDefinition) {
				if (faction.progressionHash === progress.progressionHash) {
					progress.factionHash = faction.factionHash;
				}
			}
			for (var progressData of data.progression[diff.characterId].progressions) {
				if (progressData.progressionHash === progress.progressionHash) {
					progress.progressToNextLevel = progressData.progressToNextLevel;
				}
			}
		}
	}
}

for (var diff of data.itemChanges) {
	if (diff.progression) {
		for (var i = diff.progression.length; i > -1; i--) {
			if (diff.progression[i] === null || diff.progression[i] === "null" || diff.progression[i] === undefined) {
				diff.progression.splice(i, 1);
			}
		}
		if (diff.progression.length === 0) {
			delete diff.progression;
		}
	}
}


sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
	// console.log(newProgression);
	chrome.storage.local.set({
		"progression": newProgression
	}, function() {})
});
(function() {
	var index = 0;
	for (var item of data.itemChanges) {
		item.id = index;
		index++;
	}
	chrome.storage.local.set(data);
}());

var stop = true;
var oldInventoryLength = 0;
var oldFactionRep = 0;

function checkInventory() {
	console.time("Inventory")

	bungie.inventory("2305843009221440972", function(result) {
		var date = new Date();
		var data = result.data;
		var length = 0;
		for (var attr in data.buckets) {
			for (var i = 0; i < data.buckets[attr].length; i++) {
				for (var e = 0; e < data.buckets[attr][i].items.length; e++) {
					length += data.buckets[attr][i].items[e].stackSize || 1;
				}
				// length += data.buckets[attr][i].items.length;
			}
		}
		if (length !== oldInventoryLength) {
			console.log(length, date)
		}
		oldInventoryLength = length;
		if (!stop) {
			console.timeEnd("Inventory")
			checkInventory()
		} else {
			console.log("STOPPING")
		}
	})
}

var oldFactionProgress = 0;
var dirtyTimeout = null;

function dirtyItemCheck() {
	var factionProgress = 0;
	sequence(characterIdList, function(item, resolve) {
		if (item !== "vault") {
			bungie.factions(item, resolve);
		} else {
			resolve();
		}
	}, function(result, item, index) {
		if (result) {
			var data = result.data;
			for (var i = 0; i < data.progressions.length; i++) {
				factionProgress += data.progressions[i].currentProgress;
			}
		}
	}).then(function() {
		if (factionProgress !== oldFactionProgress) {
			console.log(factionProgress, oldFactionProgress)
			oldFactionProgress = factionProgress;
		}
		dirtyTimeout = setTimeout(dirtyItemCheck,1000*10);
	});
}

stop = false;
checkFactions();
checkInventory();

stop = true;

for (var itemDiff of data.itemChanges) {
	for (i = 0; i < itemDiff.added.length; i++) {
		var item = buildCompactItem(JSON.parse(itemDiff.added[i]));
		itemDiff.added[i] = JSON.stringify(item);
	}
	for (i = 0; i < itemDiff.removed.length; i++) {
		var item = buildCompactItem(JSON.parse(itemDiff.removed[i]));
		itemDiff.removed[i] = JSON.stringify(item);
	}
	for (i = 0; i < itemDiff.transferred.length; i++) {
		var item = buildCompactItem(JSON.parse(itemDiff.transferred[i].item));
		itemDiff.transferred[i].item = JSON.stringify(item);
	}
	if (itemDiff.progression) {
		for (i = 0; i < itemDiff.progression.length; i++) {
			var item = JSON.parse(itemDiff.progression[i]);
			if (item.itemHash) {
				itemDiff.progression[i] = JSON.stringify(buildCompactItem(item));
			}
		}
	}
}

for (var itemDiff of data.itemChanges) {
	if (itemDiff.added.length > 10) {
		console.log(data.itemChanges.indexOf(itemDiff), itemDiff)
	}
}

for (var i = data.itemChanges.length - 1; i > -1; i--) {
	var itemDiff = data.itemChanges[i];
	if (itemDiff.added.length === 0 && itemDiff.removed.length === 0 && itemDiff.transferred.length === 0 && !itemDiff.progression) {
		data.itemChanges.splice(i, 1);
	}
}
chrome.storage.local.set(data, function() {})