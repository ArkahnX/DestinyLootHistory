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
	var progression = [];
	var finalChanges = [];
	if (oldInventories) {
		for (var characterId in oldInventories) {
			var diff = {
				timestamp: currentDateString,
				secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
				characterId: characterId,
				added: checkDiff(data.inventories[characterId], oldInventories[characterId]),
				removed: checkDiff(oldInventories[characterId], data.inventories[characterId])
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
				characterId: characterId,
				progress: checkFactionDiff(oldProgression[characterId].progressions, data.progression[characterId].progressions),
			};
			// for (var attr in data.progression[characterId].levelProgression) {
			// 	diff.level[attr] = data.progression[characterId].levelProgression[attr];
			// }
			if (diff.progress.length > 0) {
				for (var progress of diff.progress) {
					if (progress) {
						progression.push({
							characterId: diff.characterId,
							item: progress
						});
					}
				}
			}
		}
	}
	for (var characterId in data.inventories) {
		var diff = {
			timestamp: currentDateString,
			secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
			characterId: characterId,
			light: characterDescriptions.light,
			removed: [],
			added: [],
			transferred: []
		};
		if (data.progression[characterId]) {
			// diff.level = data.progression[characterId].levelProgression;
			for (var progress of progression) {
				if (progress.characterId === characterId) {
					if (!diff.progression) {
						diff.progression = [];
					}
					diff.progression.push(progress.progress);
				}
			}
		}
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
				diff.transferred.push(transfer);
			}
		}
		if (diff.removed.length || diff.added.length || diff.transferred.length || (diff.progression && diff.progression.length)) {
			finalChanges.push(diff);
		}
	}
	if (additions.length || removals.length || transfers.length || progression.length) {
		trackIdle();
		// console.log(currentDateString, "\nAdditions:", additions, "\nRemovals:", removals, "\nTransfers:", transfers, "\nChanges:", changes, "\nFinal Changes:", finalChanges);
	}
	Array.prototype.push.apply(data.itemChanges, finalChanges);
	// Array.prototype.push.apply(data.factionChanges, changes);
	// Array.prototype.push.apply(additions, checkDiff(data.inventories[characterId], oldInventories[characterId]));
	// Array.prototype.push.apply(removals, checkDiff(oldInventories[characterId], data.inventories[characterId]));
	oldProgression = data.progression;
	oldInventories = data.inventories;
	chrome.storage.local.set(data, function() {

	});
	console.timeEnd("Process Difference");
	displayResults();
}