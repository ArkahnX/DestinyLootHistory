tracker.sendAppView('HistoryScreen');
bungie.setActive(localStorage.activetype);
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
	logger.startLogging("history");
	logger.time("load Bungie Data");
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
				characterDescriptions[avatars[c].characterBase.characterId] = {
					name: DestinyClassDefinition[avatars[c].characterBase.classHash].className,
					gender: DestinyGenderDefinition[avatars[c].characterBase.genderHash].genderName,
					level: avatars[c].baseCharacterLevel,
					light: avatars[c].characterBase.powerLevel,
					race: DestinyRaceDefinition[avatars[c].characterBase.raceHash].raceName
				};
				characterIdList.push(avatars[c].characterBase.characterId);
			}

			logger.timeEnd("load Bungie Data");
			if (typeof callback === "function") {
				callback();
			}
			checkInventory();
		}).catch(function() {
			if (typeof callback === "function") {
				callback();
			}
		});
	}).catch(function() {
		if (typeof callback === "function") {
			callback();
		}
	});
}

function checkInventory() {
	logger.startLogging("history");
	logger.time("Bungie Inventory");
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
			logger.info(inventoryData);
			var sourceIndex = 0;
			var sources = [3107502809, 36493462, 460228854, 3945957624, 344892955, 3739898362];
			var descriptions = ["Dark Below", "House of Wolves", "The Taken King", "Sparrow Racing League", "Crimson Doubles", "April Update"];
			var div = document.createElement("div");
			div.classList.add("sub-section");
			var description = document.createElement("h1");
			description.textContent = "Destiny";
			div.appendChild(description);
			characterHistory.appendChild(div);
			var div = document.createElement("div");
			div.classList.add("sub-section");
			for (var item of inventoryData) {
				var itemDefinition = getItemDefinition(item.itemHash);
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
						var sourceDescription = document.createElement("h1");
						sourceDescription.textContent = descriptions[sourceIndex];
						div.appendChild(sourceDescription);
						characterHistory.appendChild(div);
						var div = document.createElement("div");
						div.classList.add("sub-section");
						sourceIndex++;
					}
				}
				div.appendChild(makeHistoryItem(item, "vault"));
			}
			characterHistory.appendChild(div);
		});
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
	if (getItemDefinition(itemData.itemHash).hasIcon || (getItemDefinition(itemData.itemHash).icon && getItemDefinition(itemData.itemHash).icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "'),url('http://bungie.net/img/misc/missing_icon.png')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(itemData);
	passData(container, itemData);
	return docfrag;
}

function passData(DomNode, itemData) {
	var itemDefinition = getItemDefinition(itemData.itemHash);
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
		DomNode.dataset.talentGridHash = itemData.talentGridHash;
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
initItems(function() {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-77020265-2', 'auto');
ga('set', 'checkProtocolTask', null);
ga('send', 'pageview');
});