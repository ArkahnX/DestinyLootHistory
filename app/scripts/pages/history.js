tracker.sendAppView('HistoryScreen');
getOption("activeType").then(bungie.setActive);
initUi();
var globalOptions = {};
getAllOptions().then(function(options) {
	globalOptions = options;
});
var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete", "objectives"];
var badBuckets = [375726501, 1469714392, 1626737477, 1801258597, 2197472680, 2422292810, 2689798308, 2689798304, 2689798309, 2689798310, 3161908920, 3772930460];

function isGoodHistoryItem(itemHash) {
	let item = getItemDefinition(itemHash);
	if (badBuckets.indexOf(item.bucketTypeHash) > -1) {
		return false;
	}
	return true;
}

function itemInArray(array, value) {
	for (var arrayItem of array) {
		if (arrayItem.itemInstanceId === value) {
			return true;
		}
	}
	return false;
}

function goodItemToDisplay(item) {
	var itemDataType = itemType(item);
	var itemDataRarity = itemRarity(item.itemHash);
	if(itemDataType === "engram" || itemDataType === "currency" || itemDataType === "bounty") {
		return false;
	}
	if(itemDataRarity === "uncommon" && (itemDataType === "armor" || itemDataType === "weapon")) {
		return false;
	}
	if(itemDataRarity === "rare" && (itemDataType === "armor" || itemDataType === "weapon")) {
		return false;
	}
	if(itemDataRarity === "common" && (itemDataType === "armor" || itemDataType === "weapon")) {
		return false;
	}
	return true;
}

function checkInventory() {
	logger.startLogging("history");
	logger.time("Bungie Inventory");
	var characterHistory = document.getElementById("history");
	characterHistory.innerHTML = "";
	var inventoryData = [];
	for (var characterInventory of data.inventories) {
		Array.prototype.push.apply(inventoryData, characterInventory.inventory);
	}
	for (var itemDiff of data.itemChanges) {
		for (var removedItem of itemDiff.removed) {
			if (removedItem.item) {
				removedItem = removedItem.item;
			}
			let parsedItem = JSON.parse(removedItem);
			parsedItem.removed = true;
			if (parsedItem.itemInstanceId !== "0" && isGoodHistoryItem(parsedItem.itemHash) && !itemInArray(inventoryData, parsedItem.itemInstanceId)) {
				inventoryData.push(parsedItem);
			}
		}
		// Array.prototype.push.apply(inventoryData, itemDiff.removed);
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
	// return false;
	var sourceIndex = 0;
	var sources = [3107502809, 36493462, 460228854, 3945957624, 344892955, 3739898362, 24296771];
	var descriptions = ["Dark Below", "House of Wolves", "The Taken King", "Sparrow Racing League", "Crimson Doubles", "April Update", "Rise of Iron"];
	var div = document.createElement("div");
	div.classList.add("sub-section");
	var description = document.createElement("h1");
	description.textContent = "Destiny";
	div.appendChild(description);
	characterHistory.appendChild(div);
	var div = document.createElement("div");
	div.classList.add("sub-section");
	for (var item of inventoryData) {
		if (goodItemToDisplay(item)) {
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
			div.appendChild(makeItem(item, ""));
		}
	}
	characterHistory.appendChild(div);
}
database.open().then(function() {
	database.getMultipleStores(database.allStores).then(function(result) {
		console.log(result)
			// chrome.storage.local.get(null, function(result) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		data.itemChanges = result.itemChanges;
		data.inventories = result.inventories;
		initItems(checkInventory);
	});
});