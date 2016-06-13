initUi();
var data = {
	inventories: {},
	progression: {},
	itemChanges: [],
	factionChanges: []
};
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
	console.time("load Bungie Data");
	initUi();
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
			callback();
			checkInventory();
		});
	});
}


var findHighestMaterial = (function() {
	var stage = false;
	var oldestCharacterDate = null;
	var oldestCharacter = null;
	var bigItem = null;
	return function() {
		console.time("bigmat");
		if (stage === false) {
			console.time("char");
			for (let characterId of characterIdList) {
				if (characterId !== "vault") {
					var date = new Date(characterDescriptions[characterId].dateLastPlayed);
					if (!oldestCharacter || date < oldestCharacterDate) {
						oldestCharacterDate = date;
						oldestCharacter = characterId;
					}
				}
			}
			console.timeEnd("char");
			console.time("mats");
			for (let item of data.inventories[oldestCharacter]) {
				let itemDefinition = DestinyCompactItemDefinition[item.itemHash];
				if (itemDefinition.bucketTypeHash === 3865314626) {
					if (!bigItem || item.stackSize > bigItem.stackSize) {
						bigItem = item;
					}
				}
			}
			console.timeEnd("mats");
		}
		if (stage === true) {
			stage = false;
		} else {
			stage = true;
		}
		console.timeEnd("bigmat");
		return {
			characterId: oldestCharacter,
			itemId: "0",
			itemReferenceHash: bigItem.itemHash,
			membershipType: bungie.membershipType(),
			stackSize: 1,
			transferToVault: stage
		};
	};
}());

function checkInventory() {
	console.time("Bungie Inventory");
	chrome.storage.local.get(null, function(remoteData) {
		console.log(remoteData)
		data = remoteData;
		// sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
		// sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
		var mat = findHighestMaterial();
		console.log(mat);
		var characterHistory = document.getElementById("history");
		var inventoryData = [];
		for (var characterId in data.inventories) {
			if (inventoryData.length === 0) {
				Array.prototype.push.apply(inventoryData, data.inventories[characterId]);
			} else {
				var arrayToMerge = [];
				for (var item of data.inventories[characterId]) {
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
			if (a.itemInstanceId === "0") {
				return b.stackSize - a.stackSize;
			} else {
				return a.itemInstanceId - b.itemInstanceId;
			}
		});
		var containingDiv = null;
		for (var item of inventoryData) {
			var itemDefinition = DestinyCompactItemDefinition[item.itemHash];
			var bucketName = DestinyInventoryBucketDefinition[itemDefinition.bucketTypeHash].bucketName;
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
	if (hasQuality(itemData)) {
		var quality = document.createElement("div");
		itemContainer.appendChild(quality);
		quality.classList.add("quality");
		stat.classList.add("with-quality");
		var qualityData = parseItemQuality(itemData);
		quality.style.background = qualityData.color;
		quality.textContent = qualityData.min + "%";
	}
	itemContainer.appendChild(stat);
	docfrag.appendChild(itemContainer);
	DOMTokenList.prototype.add.apply(container.classList, itemClasses(itemData));
	if (DestinyCompactItemDefinition[itemData.itemHash].hasIcon || (DestinyCompactItemDefinition[itemData.itemHash].icon && DestinyCompactItemDefinition[itemData.itemHash].icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[itemData.itemHash].icon + "'),url('http://bungie.net/img/misc/missing_icon.png')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(itemData);
	passData(container, itemData);
	return docfrag;
}

function passData(DomNode, itemData) {
	var itemDefinition = DestinyCompactItemDefinition[itemData.itemHash];
	if (itemDefinition.tierTypeName) {
		DomNode.dataset.tierTypeName = itemDefinition.tierTypeName;
	} else {
		DomNode.dataset.tierTypeName = "Common";
	}
	DomNode.dataset.itemHash = itemDefinition.itemHash;
	DomNode.dataset.itemName = itemDefinition.itemName;
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
		DomNode.dataset.nodeTree = JSON.stringify(itemData.nodes);
	}
	if (itemData.objectives && itemData.objectives.length) {
		DomNode.dataset.objectiveTree = JSON.stringify(itemData.objectives);
	}
}

function itemNetworkTask(characterId, callback) {
	if (characterId === "vault") {
		bungie.vault().then(callback);
	} else {
		bungie.inventory(characterId).then(callback);
	}
}

function factionNetworkTask(characterId, callback) {
	if (characterId !== "vault") {
		bungie.factions(characterId).then(callback);
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
// var bungie = new Bungie();
initItems(function() {

});