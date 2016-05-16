var transferQ = [];

function processDifference(currentDateString, resolve) {
	console.time("Process Difference");
	var previousItem = data.itemChanges[data.itemChanges.length - 1];
	var uniqueIndex = 0;
	var forceupdate = false;
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
	console.time("Concat New Items");
	for (var characterId of characterIdList) {
		newInventories[characterId] = concatItems(newInventories[characterId]);
	}
	console.timeEnd("Concat New Items");
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
					var itemData = JSON.parse(addition);
					var itemDefinition = DestinyCompactItemDefinition[itemData.itemHash];
					if (itemDefinition.bucketTypeHash === 2197472680 || itemDefinition.bucketTypeHash === 1801258597 || itemData.objectives) {
						if (parseInt(itemData.stackSize, 10) > 0) {
							console.log("passed to progression")
							progression.push({
								characterId: diff.characterId,
								item: addition
							});
						} else {
							additions.push({
								characterId: diff.characterId,
								item: addition
							});
						}
					} else {
						additions.push({
							characterId: diff.characterId,
							item: addition
						});
					}
				}
			}
			for (var removal of diff.removed) {
				if (removal) {
					var itemData = JSON.parse(removal);
					var itemDefinition = DestinyCompactItemDefinition[itemData.itemHash];
					if (itemDefinition.bucketTypeHash === 2197472680 || itemDefinition.bucketTypeHash === 1801258597 || itemData.objectives) {
						var found = false;
						for (var progress of progression) {
							progress = JSON.parse(progress.item);
							if (itemData.itemInstanceId === progress.itemInstanceId && itemData.stackSize !== progress.stackSize) {
								console.log(progress)
								if (parseInt(progress.stackSize, 10) >= 100) {
									forceupdate = true;
								}
								found = true;
								break;
							}
						}
						if (!found) {
							for (var added of additions) {
								added = JSON.parse(added.item);
								if (itemData.itemInstanceId === added.itemInstanceId && itemData.stackSize !== added.stackSize) {
									console.log(added)
									if (parseInt(added.stackSize, 10) >= 100) {
										forceupdate = true;
									}
									found = true;
									break;
								}
							}
						}
						console.log(found)
						if (found === false) {
							removals.push({
								characterId: diff.characterId,
								item: removal
							});
						}
					} else {
						removals.push({
							characterId: diff.characterId,
							item: removal
						});
					}
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
						var TQTemp = {
							from: removal.characterId,
							to: addition.characterId,
							item: movedItem.item
						};
						var isUnique = true;
						for (var item of transferQ) {
							if (JSON.stringify(item) === JSON.stringify(TQTemp)) {
								isUnique = false;
								break;
							}
						}
						if (isUnique) {
							transferQ.push(TQTemp);
						}
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
			light: characterDescriptions[characterId].light,
			removed: [],
			added: [],
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
		if (diff.added.length || diff.removed.length) {
			for (var q = transferQ.length - 1; q > -1; q--) {
				var transfer = transferQ[q];
				if (!diff.transferred) {
					diff.transferred = [];
				}
				diff.transferred.push(transferQ.splice(q, 1)[0]);
			}
		}
		// for (var transfer of transferQ) {
		// 	if (transfer.to === characterId || transfer.from === characterId) {
		// 		if (!diff.transferred) {
		// 			diff.transferred = [];
		// 		}
		// 		diff.transferred.push(transfer);
		// 	}
		// }
		if (diff.removed.length || diff.added.length || (transferQ.length) || (diff.progression && diff.progression.length)) {
			localStorage["flag"] = "true";
			console.log(diff, transferQ)
		}
		if (diff.removed.length || diff.added.length || (diff.transferred && diff.transferred.length && forceupdate) || (diff.progression && diff.progression.length && forceupdate)) {
			if (diff.progression && diff.progression.length) {
				oldProgression[characterId] = newProgression[characterId];
				data.progression[characterId] = newProgression[characterId];
				oldInventories = newInventories;
				data.inventories = newInventories;
			} else {
				oldProgression[characterId] = oldProgression[characterId];
				data.progression[characterId] = oldProgression[characterId];
				oldInventories = newInventories;
				data.inventories = newInventories;
			}
			finalChanges.push(diff);
		} else {
			oldProgression[characterId] = oldProgression[characterId];
			data.progression[characterId] = oldProgression[characterId];
			oldInventories = oldInventories;
			data.inventories = oldInventories;
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
	// oldInventories = newInventories;
	// data.inventories = newInventories;

	chrome.storage.local.set({
		inventories: data.inventories,
		itemChanges: data.itemChanges,
		progression: data.progression
	}, function() {});
	console.timeEnd("Process Difference");
	console.time("grab matches")
	getLocalMatches().then(getRemoteMatches).then(applyMatchData).then(resolve);
}