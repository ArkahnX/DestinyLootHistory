function processDifference(currentDateString) {
	console.time("Process Difference");
	var previousItem = data.itemChanges[data.itemChanges.length - 1];
	var uniqueIndex = 0;
	if (previousItem) {
		uniqueIndex = previousItem.id + 1;
	}
	var previousItemDate = new Date(currentDateString);
	if (previousItem) {
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
				added: checkDiff(newInventories[characterId], oldInventories[characterId]),
				removed: checkDiff(oldInventories[characterId], newInventories[characterId])
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
				progress: checkFactionDiff(oldProgression[characterId].progressions, newProgression[characterId].progressions)
			};
			// for (var attr in newProgression[characterId].levelProgression) {
			// 	diff.level[attr] = newProgression[characterId].levelProgression[attr];
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
	for (var characterId in newInventories) {
		var diff = {
			light: characterDescriptions.light,
			removed: [],
			added: [],
			transferred: [],
			id: uniqueIndex,
			characterId: characterId,
			secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
			timestamp: currentDateString
		};
		if (newProgression[characterId]) {
			// diff.level = newProgression[characterId].levelProgression;
			for (var progress of progression) {
				if (progress.characterId === characterId) {
					if (!diff.progression) {
						diff.progression = [];
					}
					diff.progression.push(progress.item);
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
		if (diff.removed.length || diff.added.length || diff.transferred.length) {
			if (diff.progression && diff.progression.length) {
				oldProgression[characterId] = newProgression[characterId];
				data.progression[characterId] = newProgression[characterId];
			} else {
				oldProgression[characterId] = oldProgression[characterId];
				data.progression[characterId] = oldProgression[characterId];
			}
			finalChanges.push(diff);
		} else {
			oldProgression[characterId] = oldProgression[characterId];
			data.progression[characterId] = oldProgression[characterId];
		}
	}
	if (additions.length || removals.length || transfers.length || progression.length) {
		trackIdle();
		// console.log(currentDateString, "\nAdditions:", additions, "\nRemovals:", removals, "\nTransfers:", transfers, "\nChanges:", changes, "\nFinal Changes:", finalChanges);
	}
	Array.prototype.push.apply(data.itemChanges, finalChanges);
	// Array.prototype.push.apply(data.factionChanges, changes);
	// Array.prototype.push.apply(additions, checkDiff(newInventories[characterId], oldInventories[characterId]));
	// Array.prototype.push.apply(removals, checkDiff(oldInventories[characterId], newInventories[characterId]));
	oldInventories = newInventories;
	data.inventories = newInventories;

	chrome.storage.local.set(data, function() {

	});
	console.timeEnd("Process Difference");
	getLocalMatches().then(getRemoteMatches).then(applyMatchData).then(displayResults);
}