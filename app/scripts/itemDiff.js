var transferQ = [];
var addedCurrencyQ = [];
var removedCurrencyQ = [];

function processDifference(currentDateString, resolve) {
	logger.startLogging("itemDiff");
	transferQ.length = 0;
	addedCurrencyQ.length = 0;
	removedCurrencyQ.length = 0;
	logger.time("Process Difference");
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
	logger.time("Concat New Items");
	for (var characterId of characterIdList) {
		newInventories[characterId] = concatItems(newInventories[characterId]);
	}
	logger.timeEnd("Concat New Items");
	if (oldInventories) {
		for (let characterId in oldInventories) {
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
	var tempAdditions = {};
	var tempRemovals = {};
	if (diffs.length) {
		for (var diffObject of diffs) {
			for (var addition of diffObject.added) {
				if (addition) {
					let parsedItem = JSON.parse(addition);
					let itemId = parsedItem.itemHash + "-" + parsedItem.itemInstanceId + "-" + diffObject.characterId;
					if (tempAdditions[itemId]) {
						logger.error("Invalid duplicate of item", parsedItem, itemId, tempAdditions[itemId],addition,diffObject);
					} else {
						tempAdditions[itemId] = {
							characterId: diffObject.characterId,
							item: addition,
							stackSize: parsedItem.stackSize,
							itemInstanceId: parsedItem.itemInstanceId,
							itemHash: parsedItem.itemHash,
							type: "add"
						};
					}
				} else {
					logger.error("This is an incorrectly logged item.", diffObject.added, addition);
				}
			}
			for (var removal of diffObject.removed) {
				if (removal) {
					let parsedItem = JSON.parse(removal);
					let itemId = parsedItem.itemHash + "-" + parsedItem.itemInstanceId;
					if (tempRemovals[itemId]) {
						if (tempRemovals[itemId].stackSize < parsedItem.stackSize) {
							tempRemovals[itemId].characterId = diffObject.characterId;
						}
						tempRemovals[itemId].stackSize += parsedItem.stackSize;
					} else {
						tempRemovals[itemId] = {
							characterId: diffObject.characterId,
							item: removal,
							stackSize: parsedItem.stackSize,
							itemInstanceId: parsedItem.itemInstanceId,
							itemHash: parsedItem.itemHash,
							type: "remove"
						};
					}
				} else {
					logger.error("This is an incorrectly logged item.", diffObject.removed, removal);
				}
			}
		}
	}
	logger.startLogging("itemDiff");
	var diffCharacterId = localStorage.newestCharacter;
	for (let tempAddition of tempAdditions) {
		var foundAddition = false;
		let localDefinition = JSON.parse(tempAddition.item);
		let databaseDefinition = getItemDefinition(localDefinition.itemHash);
		if (databaseDefinition.bucketTypeHash !== 2197472680 && databaseDefinition.bucketTypeHash !== 1801258597 && !localDefinition.objectives) {
			for (let tempRemoval of tempRemovals) {
				if (tempAddition.itemHash === tempRemoval.itemHash && tempAddition.itemInstanceId === tempRemoval.itemInstanceId) { // same items
					foundAddition = true;
					var stackSizeResult = tempAddition.stackSize - tempRemoval.stackSize; // 0 = full transfer, >0 some added, <0 means some removed
					if (stackSizeResult === 0) { // transfer
						if (tempAddition.itemHash !== parseInt(localStorage.transferMaterial) && tempAddition.itemHash !== parseInt(localStorage.oldTransferMaterial)) {
							let TQTemp = {
								from: tempRemoval.characterId,
								to: tempAddition.characterId,
								item: tempAddition.item
							};
							transferQ.push(TQTemp);
						}
						tempRemoval.stackSize = 0;
					} else if (stackSizeResult > 0) { // partial transfer with additions
						if (tempAddition.itemHash !== parseInt(localStorage.transferMaterial) && tempAddition.itemHash !== parseInt(localStorage.oldTransferMaterial)) {
							let parsedItem = JSON.parse(tempAddition.item);
							parsedItem.stackSize = tempRemoval.stackSize;
							let TQTemp = {
								from: tempRemoval.characterId,
								to: tempAddition.characterId,
								item: JSON.stringify(parsedItem)
							};
							transferQ.push(TQTemp);
						}
						tempRemoval.stackSize = 0;
						let parsedItem = JSON.parse(tempAddition.item);
						parsedItem.stackSize = stackSizeResult;
						additions.push({
							characterId: tempAddition.characterId,
							item: JSON.stringify(parsedItem)
						});
					} else if (stackSizeResult < 0) { // partial transfer with removals
						logger.log(`Stacksize ${stackSizeResult}, addition stack ${tempAddition.stackSize}, removal stack ${tempRemoval.stackSize}`);
						if (tempAddition.itemHash !== parseInt(localStorage.transferMaterial) && tempAddition.itemHash !== parseInt(localStorage.oldTransferMaterial)) {
							let parsedItem = JSON.parse(tempAddition.item);
							parsedItem.stackSize = Math.abs(tempAddition.stackSize);
							let TQTemp = {
								from: tempRemoval.characterId,
								to: tempAddition.characterId,
								item: JSON.stringify(parsedItem)
							};
							transferQ.push(TQTemp);
						}
						tempRemoval.stackSize = tempRemoval.stackSize - tempAddition.stackSize;
						logger.log(`${tempRemoval.itemHash} partial transfer with removals ${tempRemoval.stackSize} stack remaining`);
						let parsedItem = JSON.parse(tempRemoval.item);
						parsedItem.stackSize = tempRemoval.stackSize;
						tempRemoval.item = JSON.stringify(parsedItem);
						// removals.push({
						// 	characterId: tempRemoval.characterId,
						// 	item: JSON.stringify(parsedItem)
						// });
					} else {
						logger.error("Unhandled state", stackSizeResult, tempAddition, tempRemoval);
					}
					break;
				}
			}
		}
		if (!foundAddition) {
			if ((databaseDefinition.bucketTypeHash === 2197472680 || databaseDefinition.bucketTypeHash === 1801258597 || localDefinition.objectives) && parseInt(localDefinition.stackSize, 10) > 0) {
				logger.log("passed to progression");
				if (parseInt(localDefinition.stackSize, 10) >= 100) {
					forceupdate = true;
				}
				progression.push({
					characterId: tempAddition.characterId,
					item: tempAddition.item
				});
			} else {
				additions.push({
					characterId: tempAddition.characterId,
					item: tempAddition.item
				});
			}
		}
	}
	logger.startLogging("itemDiff");
	for (let tempRemoval of tempRemovals) {
		var foundRemoval = false;
		for (let tempAddition of tempAdditions) {
			if (tempAddition.itemHash === tempRemoval.itemHash && tempAddition.itemInstanceId === tempRemoval.itemInstanceId) { // same items
				if (tempRemoval.stackSize < 1) {
					foundRemoval = true;
				}
			}
		}
		if (!foundRemoval) {
			let localDefinition = JSON.parse(tempRemoval.item);
			let databaseDefinition = getItemDefinition(localDefinition.itemHash);
			if (databaseDefinition.bucketTypeHash === 2197472680 || databaseDefinition.bucketTypeHash === 1801258597 || localDefinition.objectives) {
				var found = false;
				for (var progress of progression) {
					progress = JSON.parse(progress.item);
					if (localDefinition.itemInstanceId === progress.itemInstanceId && localDefinition.stackSize !== progress.stackSize) {
						// logger.log(progress);
						if (parseInt(progress.stackSize, 10) >= 100) {
							forceupdate = true;
						}
						found = true;
						break;
					}
				}
				// if (!found) {
				// 	logger.error("Unable to locate progression item.", tempRemoval, progression, tempAdditions, additions);
				// }
				if (found === false) {
					removals.push({
						characterId: tempRemoval.characterId,
						item: tempRemoval.item
					});
				}
			} else {
				removals.push({
					characterId: tempRemoval.characterId,
					item: tempRemoval.item
				});
			}
		}
	}

	if (oldProgression) {
		for (let characterId in oldProgression) {
			var progressDiff = checkFactionDiff(oldProgression[characterId].progressions, newProgression[characterId].progressions);
			for (let progress of progressDiff) {
				if (progress) {
					progression.push({
						characterId: characterId,
						item: progress
					});
				} else {
					logger.error("This is an incorrectly logged item.", progressDiff, progress);
				}
			}
		}
	}
	let finalDiff = {
		light: characterDescriptions[diffCharacterId].light,
		removed: [],
		added: [],
		id: uniqueIndex,
		characterId: diffCharacterId,
		secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
		timestamp: currentDateString
	};
	if (oldCurrencies) {
		for (var oldCurrency of oldCurrencies) {
			for (var newCurrency of newCurrencies) {
				if (newCurrency.itemHash === oldCurrency.itemHash) {
					if (newCurrency.value > oldCurrency.value) {
						let tempItem = JSON.stringify({
							itemHash: newCurrency.itemHash,
							stackSize: newCurrency.value - oldCurrency.value
						});
						addedCurrencyQ.push({
							characterId: diffCharacterId,
							item: tempItem
						});
					} else if (newCurrency.value < oldCurrency.value) {
						let tempItem = JSON.stringify({
							itemHash: newCurrency.itemHash,
							stackSize: oldCurrency.value - newCurrency.value
						});
						removedCurrencyQ.push({
							characterId: diffCharacterId,
							item: tempItem
						});
					}
				}
			}
		}
	}
	logger.startLogging("itemDiff");
	var progressionCharacters = [];
	for (let addition of additions) {
		var parsedItemHash = JSON.parse(addition.item).itemHash;
		logger.log(`%c ${addition.characterId} === vault, ${parsedItemHash} !== ${parseInt(localStorage.transferMaterial)}, ${parsedItemHash} !== ${parseInt(localStorage.oldTransferMaterial)}`, "font-weight:bold;color:red;");
		if (addition.characterId === diffCharacterId) {
			finalDiff.added.push(addition.item);
		} else {
			if (addition.characterId === "vault" && parsedItemHash !== parseInt(localStorage.transferMaterial) && parsedItemHash !== parseInt(localStorage.oldTransferMaterial)) {
				finalDiff.added.push(addition);
			} else if (addition.characterId !== "vault") {
				finalDiff.added.push(addition);
			}
		}
	}
	for (let removal of removals) {
		if (removal.characterId === diffCharacterId) {
			finalDiff.removed.push(removal.item);
		} else {
			finalDiff.removed.push(removal);
		}
	}
	// finalDiff.level = newProgression[characterId].levelProgression;
	for (let progress of progression) {
		if (!finalDiff.progression) {
			finalDiff.progression = [];
		}
		if (progress.characterId === diffCharacterId) {
			finalDiff.progression.push(progress.item);
			progressionCharacters.push(diffCharacterId);
		} else {
			finalDiff.progression.push(progress);
			progressionCharacters.push(progress.characterId);
		}
	}
	for (let transfer of transferQ) {
		if (!finalDiff.transferred) {
			finalDiff.transferred = [];
		}
		finalDiff.transferred.push(Object.assign({}, transfer));
	}
	logger.log(`FINAL DIFF INFO`, finalDiff)
	if (finalDiff.removed.length || finalDiff.added.length || (transferQ.length) || (finalDiff.progression && finalDiff.progression.length)) {
		localStorage.flag = "true";
		// logger.log(finalDiff, transferQ);
	}
	if (trackingTimer > 45) {
		forceupdate = true;
		trackingTimer = 0;
	}
	logger.log(`idleTimer ${idleTimer}, forceUpdate ${forceupdate}, removed ${finalDiff.removed.length}, added ${finalDiff.added.length}, transferred ${(finalDiff.transferred && finalDiff.transferred.length && forceupdate)}, transferQ ${(transferQ.length && forceupdate)}, progression ${(finalDiff.progression && finalDiff.progression.length && forceupdate)} tracking timer ${trackingTimer}`);
	if (finalDiff.removed.length || finalDiff.added.length || (finalDiff.transferred && finalDiff.transferred.length && forceupdate) || (transferQ.length && forceupdate) || (finalDiff.progression && finalDiff.progression.length && forceupdate)) {
		for (var addedQ of addedCurrencyQ) {
			finalDiff.added.push(addedQ.item);
		}
		for (var removedQ of removedCurrencyQ) {
			finalDiff.removed.push(removedQ.item);
		}
		if (finalDiff.progression && finalDiff.progression.length) {
			for (let characterId of progressionCharacters) {
				oldProgression[characterId] = newProgression[characterId];
				data.progression[characterId] = newProgression[characterId];
			}
			oldInventories = newInventories;
			data.inventories = newInventories;
			oldCurrencies = newCurrencies;
			data.currencies = newCurrencies;

		} else {
			oldProgression = oldProgression;
			data.progression = oldProgression;
			oldInventories = newInventories;
			data.inventories = newInventories;
			oldCurrencies = newCurrencies;
			data.currencies = newCurrencies;
		}
		finalChanges.push(finalDiff);
		transferQ.length = 0;
		trackingTimer = 0;
		addedCurrencyQ.length = 0;
		removedCurrencyQ.length = 0;
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
		// logger.log(_inventories,_inventories2);
		logger.log(`Vault ${_inventories.vault}/${_inventories2.vault}/${inventories.vault} Char1 ${_inventories[characterIdList[1]]}/${_inventories2[characterIdList[1]]}/${inventories[characterIdList[1]]} Char2 ${_inventories[characterIdList[2]]}/${_inventories2[characterIdList[2]]}/${inventories[characterIdList[2]]} Char3 ${_inventories[characterIdList[3]]}/${_inventories2[characterIdList[3]]}/${inventories[characterIdList[3]]} TRANSFER ${transferQ.length}`);
		logger.log(`GLIMMER ${oldCurrencies[0].value}/${newCurrencies[0].value}` + ` LEGENDARY MARKS ${oldCurrencies[1].value}/${newCurrencies[1].value}` + ` SILVER ${oldCurrencies[2].value}/${newCurrencies[2].value}`);
		oldProgression = oldProgression;
		data.progression = oldProgression;
		oldInventories = oldInventories;
		data.inventories = oldInventories;
		data.currencies = oldCurrencies;
		oldCurrencies = oldCurrencies;
	}
	if (additions.length || removals.length || transfers.length || progression.length) {
		trackIdle();
		// logger.log(currentDateString, "\nAdditions:", additions, "\nRemovals:", removals, "\nTransfers:", transfers, "\nChanges:", changes, "\nFinal Changes:", finalChanges);
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
		progression: data.progression,
		currencies: data.currencies
	}, function() {});
	logger.timeEnd("Process Difference");
	logger.time("grab matches");
	trackingTimer++;
	getLocalMatches().then(getRemoteMatches).then(applyMatchData).then(resolve);
}

var trackingTimer = 0;