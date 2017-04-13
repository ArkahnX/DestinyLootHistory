function organizeInventories() {
	let progressionBucketHashes = [2197472680, 1801258597];
	let organizedInventories = {
		new: {
			progression: {},
			stackable: {},
			unique: {},
			currency: {}
		},
		old: {
			progression: {},
			stackable: {},
			unique: {},
			currency: {}
		},
		newKeys: {
			progression: [],
			stackable: [],
			unique: [],
			currency: []
		},
		oldKeys: {
			progression: [],
			stackable: [],
			unique: [],
			currency: []
		},
	};
	let arrays = [
		[newInventories, "new"],
		[currentInventories, "old"]
	];
	for (let currency of newCurrencies) {
		organizedInventories.new.currency[currency.itemHash] = currency.value;
	}
	for (let currency of currentCurrencies) {
		organizedInventories.old.currency[currency.itemHash] = currency.value;
	}
	for (let array of arrays) {
		for (let character of array[0]) {
			for (let item of character.inventory) {
				if (progressionBucketHashes.indexOf(item.bucketTypeHash) > -1 || item.objectives) {
					if (organizedInventories[array[1]].progression[`${item.itemHash}-${item.itemInstanceId}`]) {
						console.error("Conflict", `${item.itemHash}-${item.itemInstanceId}`);
						debugger;
					}
					organizedInventories[array[1]].progression[`${item.itemHash}-${item.itemInstanceId}`] = {
						characterId: character.characterId,
						percent: item.stackSize,
						item: JSON.stringify(item)
					}
				} else if (getItemDefinition(item.itemHash).maxStackSize > 1 || item.itemInstanceId === "0") {
					if (!organizedInventories[array[1]].stackable[item.itemHash]) {
						organizedInventories[array[1]].stackable[item.itemHash] = {};
						for (let temp of newInventories) {
							organizedInventories[array[1]].stackable[item.itemHash][temp.characterId] = 0;
						}
					}
					if (!organizedInventories[array[1]].stackable[item.itemHash].total) {
						organizedInventories[array[1]].stackable[item.itemHash].total = 0;
					}
					organizedInventories[array[1]].stackable[item.itemHash][character.characterId] += item.stackSize;
					organizedInventories[array[1]].stackable[item.itemHash].total += item.stackSize;
				} else {
					if (organizedInventories[array[1]].unique[`${item.itemHash}-${item.itemInstanceId}`]) {
						console.error("Conflict", `${item.itemHash}-${item.itemInstanceId}`, array[1], organizedInventories[array[1]].unique[`${item.itemHash}-${item.itemInstanceId}`], item, character.characterId);
						// debugger;
					}
					organizedInventories[array[1]].unique[`${item.itemHash}-${item.itemInstanceId}`] = {
						characterId: character.characterId,
						light:item.primaryStat && item.primaryStat.value || 0,
						item: JSON.stringify(item)
					}
				}
			}
		}
		for (let property of Object.keys(organizedInventories[array[1]])) {
			organizedInventories[`${array[1]}Keys`][property] = Object.keys(organizedInventories[array[1]][property]);
		}
	}

	return organizedInventories;
}

function difference(array1, array2) {
	let a = new Set(array1);
	let b = new Set(array2);
	return [...a].filter(x => !b.has(x));
}

function matching(array1, array2) {
	let a = new Set(array1);
	let b = new Set(array2);
	return [...a].filter(x => b.has(x));
}

function repair() {
	for (let itemChange of itemChanges) {
		if (itemChange.progression) {
			let newProgression = [];
			for (let item of itemChange.progression) {
				if(item.character || typeof item.characterId === "undefined") {
					newProgression.push(item.item);
				} else {
					newProgression.push(item);
				}
			}
			itemChange.progression = newProgression;
		}
		if (itemChange.added.length) {
		let newAdded = [];
			for (let item of itemChange.added) {
				if(item.character || typeof item.characterId === "undefined") {
					newAdded.push(item.item);
				} else {
					newAdded.push(item);
				}
			}
			itemChange.added = newAdded;
		}
		if (itemChange.removed.length) {
		let newRemoved = [];
			for (let item of itemChange.removed) {
				if(item.character || typeof item.characterId === "undefined") {
					newRemoved.push(item.item);
				} else {
					newRemoved.push(item);
				}
			}
			itemChange.removed = newRemoved;
		}
	}
}

function diffInventories(currentDateString, resolve) {
	console.time("===========NEW DIFF===============");
	let parkedAddedCurrency = [];
	let parkedRemovedCurrency = [];
	let parkedTransfers = [];
	let parkedProgression = [];
	let FINALCHANGESHUGE = false;
	let primaryCharacter = localStorage.newestCharacter;
	let organizedInventories = organizeInventories();
	let temporary = {
		removedKeys: {},
		addedKeys: {},
		matchingKeys: {}
	}
	let previousItem = itemChanges[itemChanges.length - 1];
	let previousItemDate = new Date(currentDateString);
	let uniqueIndex = 0;
	if (previousItem) {
		previousItemDate = new Date(previousItem.timestamp);
		uniqueIndex = previousItem.id + 1;
	}
	let diffedInventory = {
		light: characterDescriptions[primaryCharacter].light,
		id: uniqueIndex,
		characterId: primaryCharacter,
		secondsSinceLastDiff: (new Date(currentDateString) - previousItemDate) / 1000,
		timestamp: currentDateString,
		removed: [],
		added: []
	};
	temporary.removedKeys.unique = difference(organizedInventories.oldKeys.unique, organizedInventories.newKeys.unique);
	temporary.addedKeys.unique = difference(organizedInventories.newKeys.unique, organizedInventories.oldKeys.unique);
	temporary.matchingKeys.unique = matching(organizedInventories.newKeys.unique, organizedInventories.oldKeys.unique);

	temporary.removedKeys.progression = difference(organizedInventories.oldKeys.progression, organizedInventories.newKeys.progression);
	temporary.addedKeys.progression = difference(organizedInventories.newKeys.progression, organizedInventories.oldKeys.progression);
	temporary.matchingKeys.progression = matching(organizedInventories.newKeys.progression, organizedInventories.oldKeys.progression);

	temporary.removedKeys.stackable = difference(organizedInventories.oldKeys.stackable, organizedInventories.newKeys.stackable);
	temporary.addedKeys.stackable = difference(organizedInventories.newKeys.stackable, organizedInventories.oldKeys.stackable);
	temporary.matchingKeys.stackable = matching(organizedInventories.newKeys.stackable, organizedInventories.oldKeys.stackable);

	for (let key of temporary.matchingKeys.unique) {
		let oldItem = organizedInventories.old.unique[key];
		let newItem = organizedInventories.new.unique[key];
		if (oldItem.characterId !== newItem.characterId) {
			parkedTransfers.push({
				from: oldItem.characterId,
				to: newItem.characterId,
				item: newItem.item
			});
		}
	}
	for (let key of temporary.addedKeys.unique) {
		let item = organizedInventories.new.unique[key];
		let result = item.item;
		if (item.characterId !== primaryCharacter) {
			result = {};
			result.characterId = item.characterId;
			result.item = item.item;
		}
		diffedInventory.added.push(result);
	}
	for (let key of temporary.removedKeys.unique) {
		let item = organizedInventories.old.unique[key];
		let result = item.item;
		if (item.characterId !== primaryCharacter) {
			result = {};
			result.characterId = item.characterId;
			result.item = item.item;
		}
		diffedInventory.removed.push(result);
	}
	for (let key of temporary.addedKeys.progression) {
		let item = organizedInventories.new.progression[key];
		let result = item.item;
		if (item.characterId !== primaryCharacter) {
			result = {};
			result.characterId = item.characterId;
			result.item = item.item;
		}
		diffedInventory.added.push(result);
	}
	for (let key of temporary.removedKeys.progression) {
		let item = organizedInventories.old.progression[key];
		let result = item.item;
		if (item.characterId !== primaryCharacter) {
			result = {};
			result.characterId = item.characterId;
			result.item = item.item;
		}
		diffedInventory.removed.push(result);
	}
	for (let key of temporary.matchingKeys.progression) {
		let oldItem = organizedInventories.old.progression[key];
		let newItem = organizedInventories.new.progression[key];
		if (oldItem.percent !== newItem.percent) {
			let result = newItem.item;
			if (newItem.characterId !== primaryCharacter) {
				result = {};
				result.characterId = newItem.characterId;
				result.item = newItem.item;
			}
			parkedProgression.push(result);
		}
	}
	for (let key of temporary.matchingKeys.stackable) {
		let oldItem = organizedInventories.old.stackable[key];
		let newItem = organizedInventories.new.stackable[key];
		let fromIds = [];
		let toIds = [];
		let fromQuantities = [];
		let toQuantities = [];
		for (let characterId of Object.keys(newItem)) {
			if (characterId !== "total" && newItem[characterId] < oldItem[characterId]) {
				fromIds.push(characterId);
				fromQuantities.push(oldItem[characterId] - newItem[characterId]);
			} else if (characterId !== "total" && newItem[characterId] > oldItem[characterId]) {
				toIds.push(characterId);
				toQuantities.push(newItem[characterId] - oldItem[characterId]);
			}
		}
		if (toIds.length || fromIds.length) {
			// console.log(fromQuantities, toQuantities);
			for (let i = 0; i < toIds.length; i++) {
				for (let e = 0; e < fromIds.length; e++) {
					if (toQuantities[i] - fromQuantities[e] > 0 && fromQuantities[e] > 0) {
						parkedTransfers.push({
							from: fromIds[e],
							to: toIds[i],
							item: JSON.stringify({
								itemHash: parseInt(key, 10),
								itemInstanceId: "0",
								stackSize: fromQuantities[e]
							})
						});
						toQuantities[i] = toQuantities[i] - fromQuantities[e];
						fromQuantities[e] = 0;
					} else if (toQuantities[i] - fromQuantities[e] === 0 && fromQuantities[e] > 0) {
						parkedTransfers.push({
							from: fromIds[e],
							to: toIds[i],
							item: JSON.stringify({
								itemHash: parseInt(key, 10),
								itemInstanceId: "0",
								stackSize: fromQuantities[e]
							})
						});
						toQuantities[i] = 0;
						fromQuantities[e] = 0;
						break;
					} else if (toQuantities[i] - fromQuantities[e] < 0 && fromQuantities[e] > 0) {
						parkedTransfers.push({
							from: fromIds[e],
							to: toIds[i],
							item: JSON.stringify({
								itemHash: parseInt(key, 10),
								itemInstanceId: "0",
								stackSize: toQuantities[i]
							})
						});
						fromQuantities[e] = fromQuantities[e] - toQuantities[i];
						toQuantities[i] = 0;
						break;
					}
				}
			}
			// console.log(fromQuantities, toQuantities);
			for (let i = 0; i < fromIds.length; i++) {
				if (fromQuantities[i] > 0) {
					let result = JSON.stringify({
						itemHash: parseInt(key, 10),
						itemInstanceId: "0",
						stackSize: fromQuantities[i]
					});
					if (fromIds[i] !== primaryCharacter) {
						result = {};
						result.characterId = fromIds[i];
						result.item = JSON.stringify({
							itemHash: parseInt(key, 10),
							itemInstanceId: "0",
							stackSize: fromQuantities[i]
						});
					}
					diffedInventory.removed.push(result);
				}
			}
			for (let i = 0; i < toIds.length; i++) {
				if (toQuantities[i] > 0) {
					let result = JSON.stringify({
						itemHash: parseInt(key, 10),
						itemInstanceId: "0",
						stackSize: toQuantities[i]
					});
					if (toIds[i] !== primaryCharacter) {
						result = {};
						result.characterId = toIds[i];
						result.item = JSON.stringify({
							itemHash: parseInt(key, 10),
							itemInstanceId: "0",
							stackSize: toQuantities[i]
						});
					}
					diffedInventory.added.push(result);
				}
			}
		}
	}
	for (let key of organizedInventories.newKeys.currency) {
		let oldItem = organizedInventories.old.currency[key];
		let newItem = organizedInventories.new.currency[key];
		if (oldItem && oldItem < newItem) {
			parkedAddedCurrency.push(JSON.stringify({
				itemHash: parseInt(key, 10),
				stackSize: newItem - oldItem,
				maxStackSize: newItem
			}));
		} else if (oldItem && oldItem > newItem) {
			parkedRemovedCurrency.push(JSON.stringify({
				itemHash: parseInt(key, 10),
				stackSize: oldItem - newItem,
				maxStackSize: newItem
			}));
		}
	}
	if (currentProgression) {
		for (let oldCharacterProgression of currentProgression) {
			let newCharacterProgression = findInArray(newProgression, "characterId", oldCharacterProgression.characterId);
			let progressDiff = checkFactionDiff(oldCharacterProgression.progression.progressions, newCharacterProgression.progression.progressions, oldCharacterProgression.characterId);
			for (let progress of progressDiff) {
				if (progress) {
					parkedProgression.push({
						characterId: oldCharacterProgression.characterId,
						item: progress
					});

				} else {
					console.error("This is an incorrectly logged item.", progressDiff, progress);
				}
			}
		}
	}
	for (let itemDiff of diffedInventory.added) {
		let localCharacterId = diffedInventory.characterId;
		let itemData = itemDiff;
		if (itemData.item) {
			itemData = itemData.item;
		}
		if (itemDiff.characterId) {
			localCharacterId = itemDiff.characterId || diffedInventory.characterId;
		}
		eligibleToLock(JSON.parse(itemData), localCharacterId);
		autoMoveToVault(JSON.parse(itemData), localCharacterId);
	}
	console.log(diffedInventory, parkedAddedCurrency, parkedRemovedCurrency, parkedTransfers, parkedProgression);
	if (diffedInventory.added.length || diffedInventory.removed.length) {
		for (let added of parkedAddedCurrency) {
			diffedInventory.added.push(added);
		}
		for (let removed of parkedRemovedCurrency) {
			diffedInventory.removed.push(removed);
		}
		if (parkedTransfers.length) {
			diffedInventory.transferred = [];
		}
		for (let transfer of parkedTransfers) {
			diffedInventory.transferred.push(transfer);
		}
		if (parkedProgression.length) {
			diffedInventory.progression = [];
		}
		for (let progression of parkedProgression) {
			diffedInventory.progression.push(progression);
		}
		if (diffedInventory.progression && diffedInventory.progression.length) {
			currentProgression = newProgression;
			currentInventories = newInventories;
			currentCurrencies = newCurrencies;
		} else {
			currentInventories = newInventories;
			currentCurrencies = newCurrencies;
		}
		if (diffedInventory.added.length < 50 && diffedInventory.removed.length < 50) {
			itemChanges.push(diffedInventory);
		} else {
			FINALCHANGESHUGE = true;
		}
		if (FINALCHANGESHUGE) {
			tracker.sendEvent('Inventory Error', bungie.getCurrentAccount().displayName, "Finished Scope");
		}
	}
	console.timeEnd("===========NEW DIFF===============");
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