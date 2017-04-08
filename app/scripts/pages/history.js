tracker.sendAppView('HistoryScreen');
getOption("activeType").then(bungie.setActive);
initUi(document.body);
getAllOptions().then(function (options) {
	globalOptions = options;
	tags.update();
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
	if (itemDataType === "engram" || itemDataType === "currency" || itemDataType === "bounty") {
		return false;
	}
	if (itemDataRarity === "uncommon" && (itemDataType === "armor" || itemDataType === "weapon")) {
		return false;
	}
	if (itemDataRarity === "rare" && (itemDataType === "armor" || itemDataType === "weapon")) {
		return false;
	}
	if (itemDataRarity === "common" && (itemDataType === "armor" || itemDataType === "weapon")) {
		return false;
	}
	return true;
}

function checkInventory() {
	console.time("Bungie Inventory");
	var characterHistory = document.getElementById("history");
	characterHistory.innerHTML = "";
	var inventoryData = [];
	for (var characterInventory of currentInventories) {
		Array.prototype.push.apply(inventoryData, characterInventory.inventory);
	}
	inventoryData.sort(function (a, b) {
		return a.itemInstanceId - b.itemInstanceId;
	});
	for (var i = inventoryData.length - 1; i >= 0; i--) {
		if (inventoryData[i].itemInstanceId === "0") {
			inventoryData.splice(i, 1);
		}
	}
	console.info(inventoryData);
	// return false;
	var sourceIndex = 0;
	var sources = [2585003248, 2784812137, 2659839637, 1234918199, 2775576620, 1537575125, [2964550958, 4160622434], 3475869915, 3131490494, [4161861381, 3068521220]];
	var descriptions = ["Dark Below", "House of Wolves", "The Taken King", "Sparrow Racing League", "Crimson Doubles", "April Update", "Rise of Iron", "Festival of the Lost", "Dawning", "Age of Triumph"];

	function containsSourceHash(itemDefinition, sourceHashes) {
		if(typeof sourceHashes === "undefined") {
			return false;
		}
		if (typeof sourceHashes === "number") {
			return itemDefinition.sourceHashes.indexOf(sourceHashes) > -1;
		}
		for (let sourceHash of sourceHashes) {
			let result = itemDefinition.sourceHashes.indexOf(sourceHash) > -1;
			if (result) {
				return true;
			}
		}
		return false;
	}
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
			if (itemDefinition.sourceHashes && itemDefinition.sourceHashes.length && sources[sourceIndex] && (containsSourceHash(itemDefinition, sources[sourceIndex]) || containsSourceHash(itemDefinition, sources[sourceIndex+1]))) {
				if (sources[sourceIndex - 1] && sources[sourceIndex - 1] !== 2659839637) {
					if (containsSourceHash(itemDefinition, sources[sourceIndex - 1]) === false) {
						if (itemDefinition.tierTypeName !== "Exotic" && itemDefinition.bucketTypeHash !== 284967655 && itemDefinition.tierTypeName !== "Rare") {
							found = true;
						}
					}
				} else {
					found = true;
				}
				if (found) {
					if (Array.isArray(sources[sourceIndex])) {
						var source = DestinyRewardSourceDefinition[sources[sourceIndex][0]]
					} else {
						var source = DestinyRewardSourceDefinition[sources[sourceIndex]];
					}
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
database.open().then(function () {
	database.getMultipleStores(database.allStores).then(function (result) {
		console.log(result)
		itemChanges = result.itemChanges;
		currentInventories = result.inventories;
		tracker.sendEvent('History', 'Load', 'True');
		refreshCharacterData().then(checkInventory);
	});
});