var transferQ = [];
var addedCurrencyQ = [];
var removedCurrencyQ = [];
var trackingTimer = 0;

function processDifference(currentDateString, resolve) {
	// reset variables
	FINALCHANGESHUGE = false;
	transferQ.length = 0;
	addedCurrencyQ.length = 0;
	removedCurrencyQ.length = 0;
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
	if (oldInventories) {
		for (let oldInventory of oldInventories) {
			// build diffs for each character, comparing old inventory vs new inventory
			var newInventory = findInArray(newInventories, "characterId", oldInventory.characterId);
			var diff = {
				timestamp: currentDateString,
				secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
				characterId: oldInventory.characterId,
				added: checkDiff(newInventory.inventory, oldInventory.inventory),
				removed: checkDiff(oldInventory.inventory, newInventory.inventory)
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
					// combine all additions. Useful for transfers. Keep unique
					let parsedItem = JSON.parse(addition);
					let itemId = parsedItem.itemHash + "-" + parsedItem.itemInstanceId + "-" + diffObject.characterId;
					if (tempAdditions[itemId]) {
						console.error("Invalid duplicate of item", parsedItem, itemId, tempAdditions[itemId], addition, diffObject);
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
					console.error("This is an incorrectly logged item.", diffObject.added, addition);
				}
			}
			for (var removal of diffObject.removed) {
				if (removal) {
					// combine all removals. Character irrelevant
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
					console.error("This is an incorrectly logged item.", diffObject.removed, removal);
				}
			}
		}
	}
	var diffCharacterId = localStorage.newestCharacter;
	for (let tempAddition of tempAdditions) {
		var foundAddition = false;
		let localDefinition = JSON.parse(tempAddition.item);
		let databaseDefinition = getItemDefinition(localDefinition.itemHash);
		if (databaseDefinition.bucketTypeHash !== 2197472680 && databaseDefinition.bucketTypeHash !== 1801258597 && !localDefinition.objectives) {
			for (let tempRemoval of tempRemovals) { // figure out transfers
				/**
				 * Item Transfers
				 * If we have a removal and an addition with the same itemHash and instanceId its probably a transfer
				 * We check the stackSize of the items to confirm how much of the item was transferred.
				 */
				if (tempAddition.itemHash === tempRemoval.itemHash && tempAddition.itemInstanceId === tempRemoval.itemInstanceId) { // same items
					foundAddition = true;
					var stackSizeResult = tempAddition.stackSize - tempRemoval.stackSize; // 0 = full transfer, >0 some added, <0 means some removed
					if (stackSizeResult === 0) { // transfer
						let TQTemp = {
							from: tempRemoval.characterId,
							to: tempAddition.characterId,
							item: tempAddition.item
						};
						transferQ.push(TQTemp);
						tempRemoval.stackSize = 0;
					} else if (stackSizeResult > 0) { // partial transfer with additions
						let parsedItem1 = JSON.parse(tempAddition.item);
						parsedItem1.stackSize = tempRemoval.stackSize;
						let TQTemp = {
							from: tempRemoval.characterId,
							to: tempAddition.characterId,
							item: JSON.stringify(parsedItem1)
						};
						transferQ.push(TQTemp);
						tempRemoval.stackSize = 0;
						let parsedItem = JSON.parse(tempAddition.item);
						parsedItem.stackSize = stackSizeResult;
						additions.push({
							characterId: tempAddition.characterId,
							item: JSON.stringify(parsedItem)
						});
					} else if (stackSizeResult < 0) { // partial transfer with removals
						console.log(`Stacksize ${stackSizeResult}, addition stack ${tempAddition.stackSize}, removal stack ${tempRemoval.stackSize}`);
						let parsedItem1 = JSON.parse(tempAddition.item);
						parsedItem1.stackSize = Math.abs(tempAddition.stackSize);
						let TQTemp = {
							from: tempRemoval.characterId,
							to: tempAddition.characterId,
							item: JSON.stringify(parsedItem1)
						};
						transferQ.push(TQTemp);
						tempRemoval.stackSize = tempRemoval.stackSize - tempAddition.stackSize;
						console.log(`${tempRemoval.itemHash} partial transfer with removals ${tempRemoval.stackSize} stack remaining`);
						let parsedItem = JSON.parse(tempRemoval.item);
						parsedItem.stackSize = tempRemoval.stackSize;
						tempRemoval.item = JSON.stringify(parsedItem);
						// removals.push({
						// 	characterId: tempRemoval.characterId,
						// 	item: JSON.stringify(parsedItem)
						// });
					} else {
						console.error("Unhandled state", stackSizeResult, tempAddition, tempRemoval);
					}
					break;
				}
			}
		}
		/**
		 * If this was not a transfer, but it was removed, then its a bounty change of sorts.
		 */
		if (!foundAddition) {
			if ((databaseDefinition.bucketTypeHash === 2197472680 || databaseDefinition.bucketTypeHash === 1801258597 || localDefinition.objectives) && parseInt(localDefinition.stackSize, 10) > 0) {
				console.log("passed to progression");
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
						// console.log(progress);
						if (parseInt(progress.stackSize, 10) >= 100) {
							forceupdate = true;
						}
						found = true;
						break;
					}
				}
				// if (!found) {
				// 	console.error("Unable to locate progression item.", tempRemoval, progression, tempAdditions, additions);
				// }
				/**
				 * Bounty was probably completed
				 */
				if (found === false) {
					removals.push({
						characterId: tempRemoval.characterId,
						item: tempRemoval.item
					});
					setRepBoosterCooldown(tempRemoval.item);
				}
			} else {
				removals.push({
					characterId: tempRemoval.characterId,
					item: tempRemoval.item
				});
				setRepBoosterCooldown(tempRemoval.item);
			}
		}
	}

	if (oldProgression) {
		for (let oldCharacterProgression of oldProgression) {
			var newCharacterProgression = findInArray(newProgression, "characterId", oldCharacterProgression.characterId);
			var progressDiff = checkFactionDiff(oldCharacterProgression.progression.progressions, newCharacterProgression.progression.progressions, oldCharacterProgression.characterId);
			for (let progress of progressDiff) {
				if (progress) {
					progression.push({
						characterId: oldCharacterProgression.characterId,
						item: progress
					});

				} else {
					console.error("This is an incorrectly logged item.", progressDiff, progress);
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
	/**
	 * Track currency Diffs
	 */
	if (oldCurrencies) {
		for (var oldCurrency of oldCurrencies) {
			for (var newCurrency of newCurrencies) {
				if (newCurrency.itemHash === oldCurrency.itemHash) {
					if (newCurrency.value > oldCurrency.value) {
						let tempItem = JSON.stringify({
							itemHash: newCurrency.itemHash,
							stackSize: newCurrency.value - oldCurrency.value,
							maxStackSize: newCurrency.value
						});
						addedCurrencyQ.push({
							characterId: diffCharacterId,
							item: tempItem
						});
					} else if (newCurrency.value < oldCurrency.value) {
						let tempItem = JSON.stringify({
							itemHash: newCurrency.itemHash,
							stackSize: oldCurrency.value - newCurrency.value,
							maxStackSize: newCurrency.value
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
	var progressionCharacters = [];
	for (let addition of additions) {
		var parsedItemHash = JSON.parse(addition.item).itemHash;
		if (addition.characterId === diffCharacterId) {
			finalDiff.added.push(addition.item);
		} else {
			if (addition.characterId !== "vault") {
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
			if (progressionCharacters.indexOf(diffCharacterId) === -1) {
				progressionCharacters.push(diffCharacterId);
			}
		} else {
			finalDiff.progression.push(progress);
			if (progressionCharacters.indexOf(progress.characterId) === -1) {
				progressionCharacters.push(progress.characterId);
			}
		}
	}
	for (let transfer of transferQ) {
		if (!finalDiff.transferred) {
			finalDiff.transferred = [];
		}
		finalDiff.transferred.push(Object.assign({}, transfer));
	}
	console.log(`FINAL DIFF INFO`, finalDiff)
	if (finalDiff.removed.length || finalDiff.added.length || (transferQ.length) || (finalDiff.progression && finalDiff.progression.length)) {
		localStorage.itemChangeDetected = "true";
		// console.log(finalDiff, transferQ);
	}
	if (trackingTimer > 15) {
		forceupdate = true;
		trackingTimer = 0;
	}
	console.log(`forceUpdate ${forceupdate}, removed ${finalDiff.removed.length}, added ${finalDiff.added.length}, transferred ${(finalDiff.transferred && finalDiff.transferred.length && forceupdate)}, transferQ ${(transferQ.length && forceupdate)}, progression ${(finalDiff.progression && finalDiff.progression.length && forceupdate)} tracking timer ${trackingTimer}`);
	console.log(progressionCharacters, finalDiff.progression)
	console.log(finalDiff.removed.length, finalDiff.added.length, (finalDiff.transferred && finalDiff.transferred.length && forceupdate), (transferQ.length && forceupdate), (finalDiff.progression && finalDiff.progression.length && forceupdate), finalDiff.removed.length || finalDiff.added.length || (finalDiff.transferred && finalDiff.transferred.length && forceupdate) || (transferQ.length && forceupdate) || (finalDiff.progression && finalDiff.progression.length && forceupdate))
	if (finalDiff.removed.length || finalDiff.added.length || (finalDiff.transferred && finalDiff.transferred.length && forceupdate) || (transferQ.length && forceupdate) || (finalDiff.progression && finalDiff.progression.length && forceupdate)) {
		for (var addedQ of addedCurrencyQ) {
			finalDiff.added.push(addedQ.item);
		}
		for (var removedQ of removedCurrencyQ) {
			finalDiff.removed.push(removedQ.item);
		}
		console.log(finalDiff.progression && finalDiff.progression.length)
		if (finalDiff.progression && finalDiff.progression.length) {
			// for (var i = 0; i < newProgression.length; i++) {
			// 	for (let characterId of progressionCharacters) {
			// 		if (newProgression[i].characterId === characterId) {
			// 			for (let e = 0; e < oldProgression.length; e++) {
			// 				if (oldProgression[e].characterId === characterId) {
			// 					oldProgression[e].progression = newProgression[i].progression;
			// 					break;
			// 				}
			// 			}
			// 			for (let e = 0; e < data.progression.length; e++) {
			// 				if (data.progression[e].characterId === characterId) {
			// 					data.progression[e].progression = newProgression[i].progression;
			// 					break;
			// 				}
			// 			}
			// 		}
			// 	}
			// }
			oldProgression = newProgression;
			data.progression = newProgression;
			oldInventories = newInventories;
			if (Object.keys(oldInventories).length === 0) {
				console.error(newInventories);
				tracker.sendEvent('error', `inventory`, JSON.stringify(Object.keys(newInventories)));
			}
			data.inventories = newInventories;
			oldCurrencies = newCurrencies;
			data.currencies = newCurrencies;
		} else {
			oldProgression = oldProgression;
			data.progression = oldProgression;
			oldInventories = newInventories;
			if (Object.keys(oldInventories).length === 0) {
				console.error(newInventories);
				tracker.sendEvent('error', `inventory`, JSON.stringify(Object.keys(newInventories)));
			}
			data.inventories = newInventories;
			oldCurrencies = newCurrencies;
			data.currencies = newCurrencies;
		}
		if (finalDiff.added.length < 50 && finalDiff.removed.length < 50) {
			finalChanges.push(finalDiff);
		} else {
			FINALCHANGESHUGE = true;
			// tracker.sendEvent('finalChanges Huge', `Added ${finalDiff.added.length}, Removed ${finalDiff.removed.length}, Progression ${finalDiff.progression && finalDiff.progression.length || 0}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
			tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, localStorage.version);
			// console.warn(`bungie systems ${JSON.stringify(bungie.getMemberships())}, bungie active ${JSON.stringify(bungie.getActive())}`);
		}
		for (var itemDiff of finalDiff.added) {
			var localCharacterId = finalDiff.characterId;
			var itemData = itemDiff;
			if (itemData.item) {
				itemData = itemData.item;
			}
			if (itemDiff.characterId) {
				localCharacterId = itemDiff.characterId || finalDiff.characterId;
			}
			eligibleToLock(JSON.parse(itemData), localCharacterId);
			autoMoveToVault(JSON.parse(itemData), localCharacterId);
		}
		transferQ.length = 0;
		trackingTimer = 0;
		addedCurrencyQ.length = 0;
		removedCurrencyQ.length = 0;
		if (FINALCHANGESHUGE) {
			tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, "Finished Scope");
		}
	} else {
		// var _inventories = {};
		// for (let bucket of data.inventories) {
		// 	_inventories[bucket.characterId] = 0;
		// 	for (let item of bucket.inventories) {
		// 		if (typeof item.stackSize !== "number") {
		// 			_inventories[bucket.characterId] += 1;
		// 		} else {
		// 			_inventories[bucket.characterId] += item.stackSize || 1;
		// 		}
		// 	}
		// }
		// var _inventories2 = {};
		// for (let bucket of newInventories) {
		// 	_inventories2[bucket.characterId] = 0;
		// 	for (let item of bucket.inventories) {
		// 		if (typeof item.stackSize !== "number") {
		// 			_inventories2[bucket.characterId] += 1;
		// 		} else {
		// 			_inventories2[bucket.characterId] += item.stackSize || 1;
		// 		}
		// 	}
		// }
		// // console.log(_inventories,_inventories2);
		// console.log(`Vault ${_inventories.vault}/${_inventories2.vault}/${inventories.vault} Char1 ${_inventories[characterIdList[1]]}/${_inventories2[characterIdList[1]]}/${inventories[characterIdList[1]]} Char2 ${_inventories[characterIdList[2]]}/${_inventories2[characterIdList[2]]}/${inventories[characterIdList[2]]} Char3 ${_inventories[characterIdList[3]]}/${_inventories2[characterIdList[3]]}/${inventories[characterIdList[3]]} TRANSFER ${transferQ.length}`);
		// console.log(`GLIMMER ${oldCurrencies[0].value}/${newCurrencies[0].value}` + ` LEGENDARY MARKS ${oldCurrencies[1].value}/${newCurrencies[1].value}` + ` SILVER ${oldCurrencies[2].value}/${newCurrencies[2].value}`);
		if (Object.keys(oldInventories).length === 0) {
			oldInventories = newInventories;
		}
		if (Object.keys(oldProgression).length === 0) {
			oldProgression = newProgression;
		}
		if (oldCurrencies.length === 0) {
			oldCurrencies = newCurrencies;
		}
		oldProgression = oldProgression;
		data.progression = oldProgression;
		oldInventories = oldInventories;
		data.inventories = oldInventories;
		data.currencies = oldCurrencies;
		oldCurrencies = oldCurrencies;
	}
	if (additions.length || removals.length || transfers.length || progression.length) {
		// trackIdle();
		// console.log(currentDateString, "\nAdditions:", additions, "\nRemovals:", removals, "\nTransfers:", transfers, "\nChanges:", changes, "\nFinal Changes:", finalChanges);
	}
	Array.prototype.push.apply(data.itemChanges, finalChanges);
	console.timeEnd("Process Difference");
	console.time("grab matches");
	trackingTimer++;

	getLocalMatches().then(getRemoteMatches).catch(function (err) {
		if (FINALCHANGESHUGE) {
			tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, "Remote Matches Error");
		}
		if (err) {
			console.error(err);
		}
		if (resolve) {
			resolve();
		}
	}).then(check3oC).then(applyMatchData).then(resolve);
}