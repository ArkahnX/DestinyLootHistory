tracker.sendAppView('SearchScreen');
logger.disable();
characterDescriptions = JSON.parse(localStorage.characterDescriptions);
var searchTypes = ["itemName", "itemTypeName", "itemDescription", "tierTypeName", "damageTypeName", "primaryStat"];

function makeSearchData(itemDiff) {
	var searchData = {};
	if (searchTypes) {
		for (let itemDiffType of itemDiff) {
			if (Array.isArray(itemDiffType)) {
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
});

function processSearchTerm() {
	document.getElementById("status").classList.add("active");
	pageNumber = 0;
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
			makePages();
			document.getElementById("status").classList.remove("active");
		});
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			console.log(result);
		});
		initUi();
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

function makeEmptySubSection(itemDiff, className) {
	var subContainer = document.createElement("div");
	subContainer.className = "sub-section " + className;
	subContainer.dataset.index = itemDiff.id;
	return subContainer;
}

function fillSubSection(subContainer, itemDiff, className, moveType) {
	subContainer.className = "sub-section " + className;
	subContainer.dataset.index = itemDiff.id;
	if (itemDiff[moveType] && itemDiff[moveType].length) {
		var docfrag = document.createDocumentFragment();
		for (var i = 0; i < itemDiff[moveType].length; i++) {
			var itemData = itemDiff[moveType][i];
			var parsedItem = itemData;
			if (parsedItem.item) {
				parsedItem = parsedItem.item;
			}
			parsedItem = JSON.parse(parsedItem);
			var endItem;
			if (moveType === "progression") {
				endItem = makeProgress(parsedItem, characterSource(itemDiff, moveType, i));
			} else {
				endItem = makeItem(parsedItem, characterSource(itemDiff, moveType, i));
			}
			docfrag.appendChild(endItem);
		}
		subContainer.appendChild(docfrag);
	}
	// var searchData = makeSearchData(itemDiff);
	// for (var typeInfo in searchData) {
	// 	subContainer.dataset[typeInfo] = searchData[typeInfo];
	// }
}

function fillDateSection(subContainer, itemDiff, className) {
	var timestamp = itemDiff.timestamp;
	var activity = "";
	var activityType = "";
	if (itemDiff.match) {
		var match = JSON.parse(itemDiff.match);
		activity = match.activityHash;
		activityType = match.activityTypeHashOverride || DestinyActivityDefinition[match.activityHash].activityTypeHash;
	}
	subContainer.className = "sub-section " + className + " timestamp";

	var localTime = moment.utc(timestamp).tz(timezone);
	var activityString = "";
	if (activity) {
		var activityDef = DestinyActivityDefinition[activity];
		var activityTypeDef = DestinyActivityTypeDefinition[activityType];
		if (activityDef && activityTypeDef) {
			var activityName = activityDef.activityName;
			var activityTypeName = activityTypeDef.activityTypeName;
			activityString = activityTypeName + " - " + activityName;
		}
		if (globalOptions.pgcrImage) {
			subContainer.style.backgroundImage = `url(https://www.bungie.net${activityDef.pgcrImage})`;
			subContainer.classList.add("bg");
		} else {
			subContainer.style.backgroundImage = "";
			subContainer.classList.remove("bg");
		}
	}
	if (globalOptions.relativeDates) {
		subContainer.innerHTML = localTime.fromNow() + "<br>" + activityString;
	} else {
		subContainer.innerHTML = localTime.format("ddd[,] ll LTS") + "<br>" + activityString;
	}
	subContainer.setAttribute("title", localTime.format("ddd[,] ll LTS") + "\n" + activityString);
	subContainer.dataset.timestamp = timestamp;
	subContainer.dataset.activity = activity;
	subContainer.dataset.activityType = activityType;
	subContainer.dataset.index = itemDiff.id;
	// var searchData = makeSearchData(itemDiff);
	// for (var typeInfo in searchData) {
	// 	subContainer.dataset[typeInfo] = searchData[typeInfo];
	// }
}

var dataTypes = ["date", "progression", "added", "removed", "transferred"];

function newDisplayResults() {
	return new Promise(function(resolve) {
		var endPoint = currentItemSet.length - ((pageNumber + 1) * 50);
		if (endPoint < 0) {
			endPoint = 0;
		}
		var startPoint = endPoint + 50;
		if (startPoint > currentItemSet.length) {
			startPoint = currentItemSet.length;
		}
		var index = 0;
		// cleanupMainPage();
		// for (var i = startPoint; i > endPoint; i--) {
		for (var i = endPoint; i < startPoint; i++) { // starting from bottom element
			var itemDiff = currentItemSet[i];
			if (!itemDiff) {
				console.log(i, startPoint, endPoint, pageNumber, currentItemSet);
			}
			var addedQty = itemDiff.added.length;
			var removedQty = itemDiff.removed.length;
			var progressionQty = 0;
			if (itemDiff.progression) {
				progressionQty = itemDiff.progression.length;
			}
			var transferredQty = 0;
			if (itemDiff.transferred) {
				transferredQty = itemDiff.transferred.length;
			}
			var className = rowHeight(addedQty, removedQty, transferredQty, progressionQty);
			for (var attr of dataTypes) {
				var childrenList = [];
				var subSection = elements[attr].children[elements[attr].children.length - index - 1];
				if (subSection) {
					while (subSection && parseInt(subSection.dataset.index) !== itemDiff.id) {
						console.log(parseInt(subSection.dataset.index), itemDiff.id)
						for (let child of subSection.children) {
							if (attr !== "date") {
								sendToCache(child);
							}
							childrenList.push(child);
						}
						for (var DomNode of childrenList) {
							if (DomNode.parentNode) {
								DomNode.parentNode.removeChild(DomNode);
							}
						}
						subSection.parentNode.removeChild(subSection);
						subSection = elements[attr].children[elements[attr].children.length - index - 1];
					}
				}
				if (!subSection) {
					subSection = makeEmptySubSection(itemDiff, className);
					elements[attr].insertBefore(subSection, elements[attr].firstChild);
					if (attr === "added" || attr === "removed" || attr === "transferred" || attr === "progression") {
						fillSubSection(subSection, itemDiff, className, attr);
					}
					if (attr === "date") {
						fillDateSection(subSection, itemDiff, className);
					}
				}
			}
			index++;
		}
		resolve();
	});
}