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
					var itemDefinition = getItemDefinition(itemData.itemHash);
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
					var databaseDefinition = getItemDefinition(localDefinition.itemHash);
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
						if (JSON.parse(movedItem.item).itemHash !== parseInt(localStorage.transferMaterial) && JSON.parse(movedItem.item).itemHash !== parseInt(localStorage.oldTransferMaterial)) {
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
	let localCharacter = localStorage.newestCharacter;
	let finalDiff = {
		light: characterDescriptions[localCharacter].light,
		removed: [],
		added: [],
		id: uniqueIndex,
		characterId: localCharacter,
		secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
		timestamp: currentDateString
	};
	var addedCharacters = [];
	var removedCharacters = [];
	var transferredCharacters = [];
	var progressionCharacters = [];
	for (let characterId in newInventories) {
		if (newProgression[characterId]) {
			// finalDiff.level = newProgression[characterId].levelProgression;
			for (let progress of progression) {
				if (progress.characterId === characterId) {
					if (!finalDiff.progression) {
						finalDiff.progression = [];
					}
					finalDiff.progression.push(progress.item);
					progressionCharacters.push(characterId);
				}
			}
		}
		for (let addition of additions) {
			if (addition.characterId === characterId) {
				finalDiff.added.push(addition.item);
				addedCharacters.push(characterId);
			}
		}
		for (let removal of removals) {
			if (removal.characterId === characterId) {
				finalDiff.removed.push(removal.item);
				removedCharacters.push(characterId);
			}
		}
		// if (finalDiff.added.length || finalDiff.removed.length) {
		// 	for (var q = transferQ.length - 1; q > -1; q--) {
		// 		// var transfer = transferQ[q];
		// 		if (!finalDiff.transferred) {
		// 			finalDiff.transferred = [];
		// 		}
		// 		finalDiff.transferred.push(transferQ.splice(q, 1)[0]);
		// 		transferredCharacters.push(characterId);
		// 	}
		// }
	}
	for (let transfer of transferQ) {
		if (!finalDiff.transferred) {
			finalDiff.transferred = [];
		}
		finalDiff.transferred.push(Object.assign({}, transfer));
	}
	if (finalDiff.removed.length || finalDiff.added.length /* || (transferQ.length) || (finalDiff.progression && finalDiff.progression.length)*/ ) {
		localStorage.flag = "true";
		// console.log(finalDiff, transferQ);
	}
	if (idleTimer > 13) {
		forceupdate = true;
	}
	console.log(`idleTimer ${idleTimer}, forceUpdate ${forceupdate}, removed ${finalDiff.removed.length}, added ${finalDiff.added.length}, transferred ${(finalDiff.transferred && finalDiff.transferred.length && forceupdate)}, transferQ ${(transferQ.length && forceupdate)}, progression ${(finalDiff.progression && finalDiff.progression.length && forceupdate)}`);
	if (finalDiff.removed.length || finalDiff.added.length || (finalDiff.transferred && finalDiff.transferred.length && forceupdate) || (transferQ.length && forceupdate) || (finalDiff.progression && finalDiff.progression.length && forceupdate)) {
		if (finalDiff.progression && finalDiff.progression.length) {
			for (let characterId of progressionCharacters) {
				oldProgression[characterId] = newProgression[characterId];
				data.progression[characterId] = newProgression[characterId];
			}
			oldInventories = newInventories;
			data.inventories = newInventories;
		} else {
			oldProgression = oldProgression;
			data.progression = oldProgression;
			oldInventories = newInventories;
			data.inventories = newInventories;
		}
		finalChanges.push(finalDiff);
		transferQ.length = 0;
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
		console.log(`Vault ${_inventories.vault}/${_inventories2.vault}/${inventories.vault} Char1 ${_inventories[characterIdList[1]]}/${_inventories2[characterIdList[1]]}/${inventories[characterIdList[1]]} Char2 ${_inventories[characterIdList[2]]}/${_inventories2[characterIdList[2]]}/${inventories[characterIdList[2]]} Char3 ${_inventories[characterIdList[3]]}/${_inventories2[characterIdList[3]]}/${inventories[characterIdList[3]]} TRANSFER ${transferQ.length}`);
		oldProgression = oldProgression;
		data.progression = oldProgression;
		oldInventories = oldInventories;
		data.inventories = oldInventories;
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