tracker.sendAppView('TestScreen');
// console.disable();
initUi(elements.container);
var DEBUG = false;
var manifest = chrome.runtime.getManifest();
if (!manifest.key) {
	DEBUG = true;
}
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

function checkInventory() {
	// console.startLogging("items");
	console.time("Bungie Inventory");
	database.getAllEntries("inventories").then(function(remoteData) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		console.log(remoteData);
		data = remoteData;
		tags.update();
		tags.cleanup(remoteData.inventories);
		// sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
		// sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
		var characterHistory = document.getElementById("history");
		var inventoryData = [];
		var sortedInventoryData = {};
		for (var inventory of data.inventories) {
			if (inventoryData.length === 0) {
				Array.prototype.push.apply(inventoryData, inventory.inventory);
			} else {
				var arrayToMerge = [];
				for (var item of inventory.inventory) {
					item.characterId = characterName(inventory.characterId);
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
				// console.log(arrayToMerge.length);
				Array.prototype.push.apply(inventoryData, arrayToMerge);
			}
		}
		for (let item of inventoryData) {
			if (globalOptions.autoTagInventory) {
				var tag = tags.getTag(item);
				if (tag.tagHash === 5) {

				}
			}
			// var tag = tags.getTag(item);
			// if(tag) {
			// 	// console.log(tags.getName(tag))
			// }
			let itemDefinition = getItemDefinition(item.itemHash);
			let bucketName = DestinyInventoryBucketDefinition[itemDefinition.bucketTypeHash] && DestinyInventoryBucketDefinition[itemDefinition.bucketTypeHash].bucketName || itemDefinition.bucketTypeHash;
			if (!sortedInventoryData[bucketName]) {
				sortedInventoryData[bucketName] = [];
			}
			sortedInventoryData[bucketName].push(item);
		}
		for (let bucket of sortedInventoryData) {
			bucket.sort(function(a, b) {
				if (a.primaryStat && !b.primaryStat) {
					return 0 - parseInt(a.primaryStat.value);
				} else if (b.primaryStat && !a.primaryStat) {
					return parseInt(b.primaryStat.value) - 0;
				} else if (a.primaryStat && b.primaryStat && !isNaN(parseInt(a.primaryStat.value)) && a.primaryStat.value === b.primaryStat.value && hasQuality(a) && hasQuality(b)) {
					return parseItemQuality(b).min - parseItemQuality(a).min;
				} else if (a.primaryStat && b.primaryStat && !isNaN(parseInt(a.primaryStat.value))) {
					return parseInt(b.primaryStat.value) - parseInt(a.primaryStat.value);
				} else if (!a.primaryStat && !b.primaryStat && a.stackSize === b.stackSize) {
					return b.itemInstanceId - a.itemInstanceId;
				} else if (!isNaN(parseInt(a.stackSize))) {
					return parseInt(b.stackSize) - parseInt(a.stackSize);
				} else {
					return b.itemInstanceId - a.itemInstanceId;
				}
			});
		}
		console.log(sortedInventoryData);
		let containingDiv = null;
		for (let bucket of sortedInventoryData) {
			for (let item of bucket) {
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
				containingDiv.appendChild(makeItem(item, item.characterId || "Vault"));
			}
		}
		console.timeEnd("Bungie Inventory");
	});
}

function hideItems() {
	let value = parseInt(document.getElementById("showOnly").value, 10);
	if (value !== 5) {
		let results1 = document.querySelectorAll(`.item[data-can-tag="true"]:not([data-tag-hash="${value}"])`);
		for (let result of results1) {
			result.parentNode.classList.add("undiscovered");
		}
		let results2 = document.querySelectorAll(`.item[data-can-tag="true"][data-tag-hash="${value}"]`);
		for (let result of results2) {
			result.parentNode.classList.remove("undiscovered");
		}
	} else {
		let results = document.querySelectorAll(".undiscovered");
			for (let result of results) {
				result.classList.remove("undiscovered");
			}
		if (document.getElementById("hideTaggedItems").checked) {
			let results = document.querySelectorAll(".item-container .tag-corner");
			for (let result of results) {
				result.parentNode.classList.add("undiscovered");
			}
		}
	}
}

initItems(function() {
	document.getElementById("hideTaggedItems").addEventListener("change", hideItems);
	document.getElementById("showOnly").addEventListener("change", hideItems);
	database.open().then(checkInventory);
	setInterval(hideItems, 5000);
});