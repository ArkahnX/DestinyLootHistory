tracker.sendAppView('SearchScreen');
logger.disable();
var DEBUG = false;
var manifest = chrome.runtime.getManifest();
if (!manifest.key) {
	DEBUG = true;
}
characterDescriptions = JSON.parse(localStorage.characterDescriptions);
var searchTypes = ["itemName", "itemTypeName", "itemDescription", "tierTypeName", "damageTypeName", "primaryStat"];

function makeSearchData(itemDiff) {
	var searchData = {};
	if (searchTypes) {
		for (let attr in itemDiff) {
			let itemDiffType = itemDiff[attr];
			if (Array.isArray(itemDiffType) && attr !== "transferred") {
				for (var type of searchTypes) {
					for (let itemData of itemDiffType) {
						if (itemData.item) {
							itemData = itemData.item;
						}
						itemData = JSON.parse(itemData);
						var itemTypeValue = "";
						let itemDefinition = null;
						if (itemData.itemHash) {
							itemDefinition = getItemDefinition(itemData.itemHash, itemData);
							if (type === "tierTypeName") {
								if (itemDefinition.tierTypeName) {
									itemTypeValue = itemDefinition.tierTypeName;
								} else {
									itemTypeValue = "Common";
								}
							} else if (type === "itemName") {
								itemTypeValue = itemDefinition.itemName;
							} else if (type === "itemTypeName") {
								itemTypeValue = itemDefinition.itemTypeName;
							} else if (type === "primaryStat") {
								itemTypeValue = primaryStat(itemData);
							} else if (type === "itemDescription") {
								itemTypeValue = itemDefinition.itemDescription || "";
							} else if (type === "damageTypeName") {
								itemTypeValue = elementType(itemData);
							}
						} else {
							if (itemData.factionHash) {
								itemDefinition = DestinyFactionDefinition[itemData.factionHash];
								if (type === "itemName") {
									itemTypeValue = itemDefinition.factionName;
								} else if (type === "itemDescription") {
									itemTypeValue = itemDefinition.factionDescription;
								}
							} else {
								itemDefinition = DestinyProgressionDefinition[itemData.progressionHash];
								if (type === "itemName") {
									itemTypeValue = itemDefinition.name;
								}
							}
						}
						// var itemTypeValue = getInfo(itemData, getItemDefinition(itemData.itemHash), type);
						if (typeof itemTypeValue !== "string") {
							// console.log(itemTypeValue, page, type, item, itemDefinition, itemData)
						}
						var nodeValue = itemTypeValue || "";
						if (typeof nodeValue === "string" && nodeValue.length) {
							nodeValue = itemTypeValue.replace(/(\r\n|\n|\r)/gm, " ").toLowerCase();
						}
						if (!searchData[type]) {
							searchData[type] = "";
						}
						if (searchData[type].indexOf(nodeValue) === -1) {
							searchData[type] += " | " + nodeValue;
						}
					}
				}
			}
		}
	}
	return searchData;
}

var globalOptions = {};

getAllOptions().then(function(options) {
	globalOptions = options;
	tags.update();
});

function processSearchTerm() {
	document.getElementById("status").classList.add("active");
	pageNumber = 0;
	oldPageNumber = 0;
	document.querySelector('#paginate').innerHTML = "";
	var searchElement = document.querySelector('#searchInput');
	var searchTerm = searchElement.value.toLowerCase();
	database.getAllEntries("itemChanges").then(function chromeStorageGet(localData) {
		var searchResults = [];
		var testChange = localData.itemChanges[1];
		var testData = makeSearchData(testChange);
		var testResult = false;
		for (let attr in testData) {
			if (testResult === false) {
				testResult = testData[attr].indexOf(searchTerm) > -1;
			}
		}
		console.log(testResult, searchTerm, testData, testChange);
		console.log(window.performance.now(), "Start Search");
		for (let itemDiff of localData.itemChanges) {
			var itemDiffMatched = false;
			var searchData = makeSearchData(itemDiff);
			for (let attr in searchData) {
				if (itemDiffMatched === false) {
					itemDiffMatched = searchData[attr].indexOf(searchTerm) > -1;
				}
			}
			if (itemDiffMatched) {
				searchResults.push(itemDiff);
			}
		}
		console.log(searchResults);
		currentItemSet = searchResults;
		document.querySelector('#resultQuantityBox').value = searchResults.length + " Results";
		console.log(window.performance.now(), "End Search");
		newDisplayResults().then(function() {
			console.log(window.performance.now(), "End Results");
			postDisplay();
			document.getElementById("status").classList.remove("active");
		});
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			console.log(result);
		});
		initUi(elements.container);
		document.getElementById("status").classList.remove("active");
		var searchElement = document.querySelector('#searchInput');
		var searchTimeout = null;
		searchElement.addEventListener("keyup", function() {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(processSearchTerm, 300);
		}, false);
		var pageElement = document.querySelector('#paginate');
		pageElement.addEventListener("change", function() {
			pageNumber = parseInt(elements.paginate.value, 10);
			document.getElementById("status").classList.add("active");
			newDisplayResults().then(function() {
				document.getElementById("status").classList.remove("active");
			});
		}, false);
	});
});