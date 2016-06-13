var transferQ = [];

function processDifference(currentDateString, resolve) {
	transferQ.length = 0;
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
		for (var character in oldInventories) {
			var diff = {
				timestamp: currentDateString,
				secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
				characterId: character,
				added: checkDiff(newInventories[character], oldInventories[character]),
				removed: checkDiff(oldInventories[character], newInventories[character])
			};
			if (diff.added.length || diff.removed.length) {
				diffs.push(diff);
			}
		}
	}
	if (diffs.length) {
		for (var diffObject of diffs) {
			for (var addition of diffObject.added) {
				if (addition) {
					var itemData = JSON.parse(addition);
					var itemDefinition = DestinyCompactItemDefinition[itemData.itemHash];
					if (itemDefinition.bucketTypeHash === 2197472680 || itemDefinition.bucketTypeHash === 1801258597 || itemData.objectives) {
						if (parseInt(itemData.stackSize, 10) > 0) {
							console.log("passed to progression");
							progression.push({
								characterId: diffObject.characterId,
								item: addition
							});
						} else {
							additions.push({
								characterId: diffObject.characterId,
								item: addition
							});
						}
					} else {
						additions.push({
							characterId: diffObject.characterId,
							item: addition
						});
					}
				}
			}
			for (var removal of diffObject.removed) {
				if (removal) {
					var localDefinition = JSON.parse(removal);
					var databaseDefinition = DestinyCompactItemDefinition[localDefinition.itemHash];
					if (databaseDefinition.bucketTypeHash === 2197472680 || databaseDefinition.bucketTypeHash === 1801258597 || localDefinition.objectives) {
						var found = false;
						for (var progress of progression) {
							progress = JSON.parse(progress.item);
							if (localDefinition.itemInstanceId === progress.itemInstanceId && localDefinition.stackSize !== progress.stackSize) {
								console.log(progress);
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
								if (localDefinition.itemInstanceId === added.itemInstanceId && localDefinition.stackSize !== added.stackSize) {
									console.log(added);
									if (parseInt(added.stackSize, 10) >= 100) {
										forceupdate = true;
									}
									found = true;
									break;
								}
							}
						}
						console.log(found);
						if (found === false) {
							removals.push({
								characterId: diffObject.characterId,
								item: removal
							});
						}
					} else {
						removals.push({
							characterId: diffObject.characterId,
							item: removal
						});
					}
				}
			}
		}
		for (var i = additions.length - 1; i >= 0; i--) {
			var addedItem = additions[i];
			for (var e = removals.length - 1; e >= 0; e--) {
				var removedItem = removals[e];
				if (addedItem.characterId !== removedItem.characterId) {
					if (isSameItem(addedItem.item, removedItem.item)) {
						var movedItem = additions.splice(i, 1)[0];
						removals.splice(e, 1);
						if (JSON.parse(addedItem.item).itemHash !== parseInt(localStorage.transferMaterial)) {
							var TQTemp = {
								from: removedItem.characterId,
								to: addedItem.characterId,
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
						}
						break;
					}
				}
			}
		}
	}
	if (oldProgression) {
		for (let characterId in oldProgression) {
			let diff = {
				characterId: characterId,
				progress: checkFactionDiff(oldProgression[characterId].progressions, newProgression[characterId].progressions)
			};
			// for (var attr in newProgression[characterId].levelProgression) {
			// 	diff.level[attr] = newProgression[characterId].levelProgression[attr];
			// }
			if (diff.progress.length > 0) {
				for (let progress of diff.progress) {
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
	for (let characterId in newInventories) {
		let diff = {
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
			for (let progress of progression) {
				if (progress.characterId === characterId) {
					if (!diff.progression) {
						diff.progression = [];
					}
					diff.progression.push(progress.item);
				}
			}
		}
		for (let addition of additions) {
			if (addition.characterId === characterId) {
				diff.added.push(addition.item);
			}
		}
		for (let removal of removals) {
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
			localStorage.flag = "true";
			// console.log(diff, transferQ);
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
			var _inventories = {};
			for (let bucket in data.inventories) {
				_inventories[bucket] = 0;
				for (let item of data.inventories[bucket]) {
					if (typeof item.stackSize !== "number") {
						_inventories[bucket] += 1;
					} else {
						_inventories[bucket] += item.stackSize || 1;
					}
				}
			}
			var _inventories2 = {};
			for (let bucket in newInventories) {
				_inventories2[bucket] = 0;
				for (let item of newInventories[bucket]) {
					if (typeof item.stackSize !== "number") {
						_inventories2[bucket] += 1;
					} else {
						_inventories2[bucket] += item.stackSize || 1;
					}
				}
			}
			// console.log(_inventories,_inventories2);
			console.log(`Vault ${_inventories.vault}/${_inventories2.vault}/${inventories.vault} Char1 ${_inventories[characterIdList[1]]}/${_inventories2[characterIdList[1]]}/${inventories[characterIdList[1]]} Char2 ${_inventories[characterIdList[2]]}/${_inventories2[characterIdList[2]]}/${inventories[characterIdList[2]]} Char3 ${_inventories[characterIdList[3]]}/${_inventories2[characterIdList[3]]}/${inventories[characterIdList[3]]} TRANSFER ${transferQ.length}`)
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
	console.time("grab matches");
	getLocalMatches().then(getRemoteMatches).then(applyMatchData).then(resolve);
}