tracker.sendAppView('TestScreen');
// console.disable();
initUi();
var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: []
};
var globalOptions = {};
getAllOptions().then(function(options) {
	globalOptions = options;
});
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

function initItems(callback) {
	// console.startLogging("items");
	console.time("load Bungie Data");
	initUi();
	getOption("activeType").then(bungie.setActive);
	bungie.user().then(function(u) {
		if (u.error) {
			return setTimeout(function() {
				initItems(callback);
			}, 1000);
		}
		bungie.search().then(function(e) {

			var avatars = e.data.characters;
			for (var c = 0; c < avatars.length; c++) {
				console.log(avatars[c].characterBase)
				characterDescriptions[avatars[c].characterBase.characterId] = {
					name: DestinyClassDefinition[avatars[c].characterBase.classHash].className,
					gender: DestinyGenderDefinition[avatars[c].characterBase.genderHash].genderName,
					level: avatars[c].baseCharacterLevel,
					light: avatars[c].characterBase.powerLevel,
					race: DestinyRaceDefinition[avatars[c].characterBase.raceHash].raceName,
					dateLastPlayed: avatars[c].characterBase.dateLastPlayed
				};
				characterIdList.push(avatars[c].characterBase.characterId);
			}

			console.timeEnd("load Bungie Data");
			if (typeof callback === "function") {
				callback();
			}
			database.open().then(checkInventory);
		}).catch(function(e) {
			logger.error(e);
			if (typeof callback === "function") {
				callback();
			}
		});
	}).catch(function(e) {
		logger.error(e);
		if (typeof callback === "function") {
			callback();
		}
	});
}

function checkInventory() {
	// console.startLogging("items");
	console.time("Bungie Inventory");
	database.getAllEntries("inventories").then(function(remoteData) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		console.log(remoteData)
		data = remoteData;
		// sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
		// sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
		var characterHistory = document.getElementById("history");
		var inventoryData = [];
		for (var inventory of data.inventories) {
			if (inventoryData.length === 0) {
				Array.prototype.push.apply(inventoryData, inventory.inventory);
			} else {
				var arrayToMerge = [];
				for (var item of inventory.inventory) {
					if (item.itemInstanceId !== "0") {
						arrayToMerge.push(item);
					} else {
						var located = false;
						for (var storedItem of inventoryData) {
							if (item.itemInstanceId === "0" && item.itemHash === storedItem.itemHash) {
								storedItem.stackSize += item.stackSize;
								located = true;
							}
						}
						if (!located) {
							arrayToMerge.push(item);
						}
					}
				}
				console.log(arrayToMerge.length);
				Array.prototype.push.apply(inventoryData, arrayToMerge);
			}
		}
		inventoryData.sort(function(a, b) {
			if (!isNaN(parseInt(a.stackSize))) {
				return parseInt(b.stackSize) - parseInt(a.stackSize);
			} else if (a.primaryStat && b.primaryStat && !isNaN(parseInt(a.primaryStat.value))) {
				return parseInt(b.stackSize) - parseInt(a.stackSize);
			} else {
				return a.itemInstanceId - b.itemInstanceId;
			}
		});
		console.log(inventoryData)
		var containingDiv = null;
		for (var item of inventoryData) {
			var itemDefinition = getItemDefinition(item.itemHash);
			var bucketName = DestinyInventoryBucketDefinition[itemDefinition.bucketTypeHash] && DestinyInventoryBucketDefinition[itemDefinition.bucketTypeHash].bucketName || itemDefinition.bucketTypeHash;
			if (document.getElementById(bucketName) === null) {
				var div = document.createElement("div");
				div.classList.add("sub-section");
				var description = document.createElement("h1");
				description.textContent = bucketName;
				div.appendChild(description);
				characterHistory.appendChild(div);
				var nodeList = document.createElement("div");
				nodeList.classList.add("sub-section");
				nodeList.id = bucketName;
				characterHistory.appendChild(nodeList);
			}
			containingDiv = document.getElementById(bucketName);
			containingDiv.appendChild(makeHistoryItem(item, "vault"));
		}
		console.timeEnd("Bungie Inventory");
	});
}

function makeHistoryItem(itemData) {
	var docfrag = document.createDocumentFragment();
	var itemContainer = document.createElement("div");
	itemContainer.classList.add("item-container");
	var container = document.createElement("div");
	var stat = document.createElement("div");
	itemContainer.appendChild(container);
	if (hasQuality(itemData) && globalOptions.showQuality) {
		var quality = document.createElement("div");
		itemContainer.appendChild(quality);
		quality.classList.add("quality");
		stat.classList.add("with-quality");
		var qualityData = parseItemQuality(itemData);
		quality.style.background = qualityData.color;
		quality.textContent = qualityData.min + "%";
		container.dataset.qualityMin = qualityData.min;
		container.dataset.qualityMax = qualityData.max;
		container.dataset.qualityColor = qualityData.color;
	}
	itemContainer.appendChild(stat);
	docfrag.appendChild(itemContainer);
	DOMTokenList.prototype.add.apply(container.classList, itemClasses(itemData));
	if (getItemDefinition(itemData.itemHash).hasIcon || (getItemDefinition(itemData.itemHash).icon && getItemDefinition(itemData.itemHash).icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "'),url('img/misc/missing_icon.png')");
	} else {
		container.setAttribute("style", "background-image: url('img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(itemData);
	passData(container, itemData);
	return docfrag;
}

function passData(DomNode, itemData) {
	var itemDefinition = getItemDefinition(itemData.itemHash);
	DomNode.dataset.itemHash = itemDefinition.itemHash;
	if (itemData.itemInstanceId) {
		DomNode.dataset.itemInstanceId = itemData.itemInstanceId;
	}
	if (itemDefinition.tierTypeName) {
		DomNode.dataset.tierTypeName = itemDefinition.tierTypeName;
	} else {
		DomNode.dataset.tierTypeName = "Common";
	}
	if (itemDefinition.sourceHashes) {
		var temp = [];
		for (var hash of itemDefinition.sourceHashes) {
			if (DestinyRewardSourceDefinition[hash]) {
				temp.push(DestinyRewardSourceDefinition[hash].sourceName.replace(/\s+/g, ''));
			}
		}
		DomNode.dataset.sourceName = JSON.stringify(temp);
	}
	DomNode.dataset.itemName = itemDefinition.itemName;
	DomNode.dataset.itemImage = itemDefinition.icon;
	DomNode.dataset.itemTypeName = itemDefinition.itemTypeName;
	DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
	DomNode.dataset.primaryStat = primaryStat(itemData);
	DomNode.dataset.primaryStatName = primaryStatName(itemData);
	DomNode.dataset.itemDescription = itemDefinition.itemDescription;
	DomNode.dataset.damageTypeName = elementType(itemData);
	DomNode.dataset.classRequirement = "";
	if (itemData.stats && itemData.stats.length) {
		DomNode.dataset.statTree = JSON.stringify(itemData.stats);
	}
	if (itemData.nodes && itemData.nodes.length) {
		DomNode.dataset.talentGridHash = itemData.talentGridHash;
		DomNode.dataset.nodeTree = JSON.stringify(itemData.nodes);
	}
	if (itemData.objectives && itemData.objectives.length) {
		DomNode.dataset.objectiveTree = JSON.stringify(itemData.objectives);
	}
}

function itemNetworkTask(characterId, callback) {
	if (characterId === "vault") {
		bungie.vault().catch(function(err) {
			if (err) {
				logger.error(err);
			}
			callback(false);
		}).then(callback);
	} else {
		bungie.inventory(characterId).catch(function(err) {
			if (err) {
				logger.error(err);
			}
			callback(false);
		}).then(callback);
	}
}

function factionNetworkTask(characterId, callback) {
	if (characterId !== "vault") {
		bungie.factions(characterId).catch(function(err) {
			if (err) {
				logger.error(err);
			}
			callback(false);
		}).then(callback);
	} else {
		callback();
	}
}

function itemResultTask(result, characterId) {
	if (result) {
		var inventory = findInArray(data.inventories, "characterId", characterId);
		if (!inventory.inventory) {
			inventory = {
				characterId: characterId,
				inventory: []
			};
			data.inventories.push(inventory);
		}
		inventory.inventory = concatItems(result.data.buckets);
	}
}

function factionResultTask(result, characterId) {
	if (result) {
		var progression = findInArray(data.progression, "characterId", characterId);
		if (!progression.progression) {
			progression = {
				characterId: characterId,
				progression: []
			};
			data.progression.push(progression);
		}
		progression.progression = result.data;
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
	newItemData.itemName = getItemDefinition(hash).itemName;
	newItemData.itemTypeName = getItemDefinition(hash).itemTypeName;
	newItemData.tierTypeName = getItemDefinition(hash).tierTypeName;
	newItemData.bucketHash = bucketHash;
	newItemData.bucketName = DestinyInventoryBucketDefinition[bucketHash].bucketName;
	if (newItemData.stats) {
		for (var e = 0; e < newItemData.stats.length; e++) {
			newItemData.stats[e].statName = DestinyStatDefinition[newItemData.stats[e].statHash].statName;
		}
	}
	if (getItemDefinition(hash).sourceHashes) {
		var sourceHashes = getItemDefinition(hash).sourceHashes;
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
// var bungie = new Bungie();
initItems(function() {});