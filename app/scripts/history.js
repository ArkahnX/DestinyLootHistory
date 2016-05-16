Object.prototype[Symbol.iterator] = function() {
	var keyList = Object.keys(this);
	let index = 0;
	return {
		next: () => {
			let value = this[keyList[index]];
			let done = index >= keyList.length;
			index++;
			return {
				value,
				done
			};
		}
	};
};

var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: []
};
var oldInventories = {};
var oldProgression = {};
var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete", "objectives"];
var characterIdList = ["vault"];
var characterDescriptions = {
	"vault": {
		name: "Vault",
		gender: "",
		level: "0",
		race: "",
		light: ""
	}
};

function recursive(index, array, networkTask, resultTask, endRecursion) {
	if (array[index]) {
		new Promise(function(resolve, reject) {
			networkTask(array[index], resolve, index);
		}).then(function(result) {
			resultTask(result, array[index], index);
			recursive(index + 1, array, networkTask, resultTask, endRecursion);
		});
	} else {
		endRecursion();
	}
}

function sequence(array, networkTask, resultTask) {
	return new Promise(function(resolve, reject) {
		recursive(0, array, networkTask, resultTask, resolve);
	});
}

function initItems(callback) {
	var optionsLink = document.querySelector("#closeHistory");
	optionsLink.addEventListener("click", function() {
		window.location.href = chrome.extension.getURL('newui.html');
	});
	console.time("load Bungie Data");
	bungie.user(function(u) {
		bungie.search(function(e) {

			var avatars = e.data.characters;
			for (var c = 0; c < avatars.length; c++) {
				characterDescriptions[avatars[c].characterBase.characterId] = {
					name: DestinyClassDefinition[avatars[c].characterBase.classHash].className,
					gender: DestinyGenderDefinition[avatars[c].characterBase.genderHash].genderName,
					level: avatars[c].baseCharacterLevel,
					light: avatars[c].characterBase.powerLevel,
					race: DestinyRaceDefinition[avatars[c].characterBase.raceHash].raceName
				};
				characterIdList.push(avatars[c].characterBase.characterId);
			}

			console.timeEnd("load Bungie Data");
			callback();
			checkInventory();
		});
	});
}

function checkInventory() {
	console.time("Bungie Inventory");
	sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
		sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
			var characterHistory = document.getElementById("history");
			var inventoryData = [];
			for (var characterId in data.inventories) {
				Array.prototype.push.apply(inventoryData, data.inventories[characterId]);
			}
			inventoryData.sort(function(a, b) {
				return a.itemInstanceId - b.itemInstanceId;
			});
			for (var i = inventoryData.length - 1; i >= 0; i--) {
				if (inventoryData[i].itemInstanceId === "0") {
					inventoryData.splice(i, 1);
				}
			}
			console.log(inventoryData);
			var sources = [3107502809, 36493462, 460228854, 3945957624, 344892955, 3739898362];
			var div = document.createElement("div");
			div.classList.add("sub-section");
			var description = document.createElement("div");
			description.textContent = "Base Game";
			div.appendChild(description);
			var sourceIndex = 0;
			for (var item of inventoryData) {
				var itemDefinition = DestinyCompactItemDefinition[item.itemHash];
				var found = false;
				if (itemDefinition.sourceHashes && itemDefinition.sourceHashes.length && sources[sourceIndex] && itemDefinition.sourceHashes.indexOf(sources[sourceIndex]) > -1) {
					if (sources[sourceIndex - 1] && sources[sourceIndex - 1] !== 460228854) {
						if (itemDefinition.sourceHashes.indexOf(sources[sourceIndex - 1]) === -1) {
							if (itemDefinition.tierTypeName !== "Exotic" && itemDefinition.bucketTypeHash !== 284967655 && itemDefinition.tierTypeName !== "Rare") {
								found = true;
							}
						}
					} else {
						found = true;
					}
					if (found) {
						var source = DestinyRewardSourceDefinition[sources[sourceIndex]];
						characterHistory.appendChild(div);
						div = document.createElement("div");
						div.classList.add("sub-section");
						div.classList.add(source.identifier);
						var description = document.createElement("div");
						description.textContent = source.sourceName;
						div.appendChild(description);
						sourceIndex++;
					}
				}
				div.appendChild(makeHistoryItem(item, "vault"));
			}
			characterHistory.appendChild(div);
		});
	});
}

function makeHistoryItem(itemData, index) {
	// itemData = JSON.parse(itemData);
	var docfrag = document.createDocumentFragment();
	var container = document.createElement("div");
	var stat = document.createElement("div");
	container.appendChild(stat);
	docfrag.appendChild(container);
	DOMTokenList.prototype.add.apply(container.classList, itemClasses(itemData));
	if (DestinyCompactItemDefinition[itemData.itemHash].hasIcon || (DestinyCompactItemDefinition[itemData.itemHash].icon && DestinyCompactItemDefinition[itemData.itemHash].icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[itemData.itemHash].icon + "'),url('http://bungie.net/img/misc/missing_icon.png')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(itemData);
	// passData(container, itemDiff, moveType, index);
	return docfrag;
}

function itemNetworkTask(characterId, callback) {
	if (characterId === "vault") {
		bungie.vault(callback);
	} else {
		bungie.inventory(characterId, callback);
	}
}

function factionNetworkTask(characterId, callback) {
	if (characterId !== "vault") {
		bungie.factions(characterId, callback);
	} else {
		callback();
	}
}

function itemResultTask(result, characterId) {
	if (result) {
		if (!data.inventories[characterId]) {
			data.inventories[characterId] = [];
		}
		data.inventories[characterId] = concatItems(result.data.buckets);
	}
}

function factionResultTask(result, characterId) {
	if (result) {
		if (!data.progression[characterId]) {
			data.progression[characterId] = [];
		}
		data.progression[characterId] = result.data;
	}
}

function _concat(list, bucketHash, sortedItems) {
	for (var item of list) {
		if (!sortedItems[item.itemInstanceId + "-" + item.itemHash]) {
			sortedItems[item.itemInstanceId + "-" + item.itemHash] = buildCompactItem(item, bucketHash);
			sortedItems[item.itemInstanceId + "-" + item.itemHash].bucketHash = bucketHash;
		} else {
			sortedItems[item.itemInstanceId + "-" + item.itemHash].stackSize += item.stackSize;
		}
	}
	return sortedItems;
}

function concatItems(itemBucketList) {
	var sortedItems = {};
	var unsortedItems = [];
	for (var category of itemBucketList) {
		if (category.items) {
			sortedItems = _concat(category.items, category.bucketHash, sortedItems);
		} else {
			for (var bucket of category) {
				if (bucket.items) {
					sortedItems = _concat(bucket.items, bucket.bucketHash, sortedItems);
				}
			}
		}
	}
	for (var item of sortedItems) {
		unsortedItems.push(item);
	}
	return unsortedItems;
}

function buildCompactItem(itemData, bucketHash) {
	var newItemData = {};
	var hash = itemData.itemHash;
	for (var i = 0; i < relevantStats.length; i++) {
		if (itemData[relevantStats[i]]) {
			if (typeof itemData[relevantStats[i]].length === "number") {
				if (itemData[relevantStats[i]].length > 0) {
					newItemData[relevantStats[i]] = itemData[relevantStats[i]];
				}
			} else {
				newItemData[relevantStats[i]] = itemData[relevantStats[i]];
			}
		}
	}
	newItemData.itemName = DestinyCompactItemDefinition[hash].itemName;
	newItemData.itemTypeName = DestinyCompactItemDefinition[hash].itemTypeName;
	newItemData.tierTypeName = DestinyCompactItemDefinition[hash].tierTypeName;
	newItemData.bucketHash = bucketHash;
	newItemData.bucketName = DestinyInventoryBucketDefinition[bucketHash].bucketName;
	if (newItemData.stats) {
		for (var e = 0; e < newItemData.stats.length; e++) {
			newItemData.stats[e].statName = DestinyStatDefinition[newItemData.stats[e].statHash].statName;
		}
	}
	if (DestinyCompactItemDefinition[hash].sourceHashes) {
		var sourceHashes = DestinyCompactItemDefinition[hash].sourceHashes;
		for (var q = 0; q < sourceHashes.length; q++) {
			var sourceHash = sourceHashes[q];
			var rewardSource = DestinyRewardSourceDefinition[sourceHash];
			if (rewardSource) {
				if (!newItemData.sources) {
					newItemData.sources = [];
				}
				newItemData.sources.push(rewardSource.identifier);
			}
		}
	}
	if (newItemData.objectives) {
		var completed = 0;
		var completionValue = 0;
		for (var l = 0; l < newItemData.objectives.length; l++) {
			newItemData.objectives[l].displayDescription = DestinyObjectiveDefinition[newItemData.objectives[l].objectiveHash].displayDescription;
			newItemData.objectives[l].completionValue = DestinyObjectiveDefinition[newItemData.objectives[l].objectiveHash].completionValue;
			completed += newItemData.objectives[l].progress;
			completionValue += newItemData.objectives[l].completionValue;
		}
		if (completed === completionValue) {
			newItemData.isGridComplete = true;
		}
		newItemData.stackSize = Math.round(((completed / completionValue) * 100)) + "%";
	}
	if (newItemData.damageTypeHash) {
		newItemData.damageTypeName = DestinyDamageTypeDefinition[newItemData.damageTypeHash].damageTypeName;
	}
	if (newItemData.primaryStat) {
		newItemData.primaryStat.statName = DestinyStatDefinition[newItemData.primaryStat.statHash].statName;
	}
	if (newItemData.nodes) {
		var sortedNodes = [];
		for (var r = 0; r < newItemData.nodes.length; r++) {
			var newNode = newItemData.nodes[r];
			if (newNode.hidden === false) {
				var nodeHash = newNode.nodeHash;
				var stepIndex = newNode.stepIndex;
				newNode.nodeStepName = DestinyCompactTalentDefinition[newItemData.talentGridHash].nodes[nodeHash].steps[stepIndex].nodeStepName;
				sortedNodes.push(newNode);
			}
		}
		if (sortedNodes.length === 0) {
			delete newItemData.nodes;
		} else {
			newItemData.nodes = sortedNodes;
		}
	}
	return newItemData;
}
var bungie = new Bungie();
initItems(function() {
	
})