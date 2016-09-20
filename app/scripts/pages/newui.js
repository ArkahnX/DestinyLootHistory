tracker.sendAppView('MainScreen');
if (localStorage.characterDescriptions) {
	characterDescriptions = JSON.parse(localStorage.characterDescriptions);
	jsonCharacterDescriptions = localStorage.characterDescriptions;
}
var debugMessage = `Destiny Loot History V${chrome.runtime.getManifest().version}
GitHub: https://github.com/ArkahnX/DestinyLootHistory
Gallery: http://imgur.com/a/QGLZf
Reddit: https://www.reddit.com/message/compose/?to=ArkahnX`;
console.log(debugMessage);

logger.disable();
document.addEventListener("DOMContentLoaded", function() {
	initUi();
}, false);

var jsonCharacterDescriptions = "";
var notificationCooldown = 0;
var globalOptions = {};

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
		var startPoint = endPoint + 50;
		var index = 0;
		if(oldPageNumber !== pageNumber) {
			cleanupMainPage();
		}
		// cleanupMainPage();
		// for (var i = startPoint; i > endPoint; i--) {
		for (var i = endPoint; i < startPoint; i++) { // starting from bottom element
			var itemDiff = currentItemSet[i];
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
				if (subSection && attr !== "date") {
					while (subSection && parseInt(subSection.dataset.index) !== itemDiff.id) {
						for (let child of subSection.children) {
							sendToCache(child);
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
				} else if (subSection && attr === "date") {
					fillDateSection(subSection, itemDiff, className);
				} else if (!subSection) {
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

function frontEndUpdate() {
	getAllOptions().then(function(options) {
		globalOptions = options;
	});
	if (elements.toggleSystem) {
		getOption("activeType").then(function(activeType) {
			if (activeType === "xbl" && elements.toggleSystem.value !== "Swap to PSN") {
				elements.toggleSystem.value = "Swap to PSN";
				elements.toggleSystem.classList.remove("green");
			}
			if (activeType === "psn" && elements.toggleSystem.value !== "Swap to XBOX") {
				elements.toggleSystem.value = "Swap to XBOX";
				elements.toggleSystem.classList.add("green");
			}
		});
	}
	if (localStorage.error === "true") {
		if (notificationCooldown === 0) {
			notification.show();
			elements.status.classList.add("active", "error");
			elements.status.classList.remove("idle");
			localStorage.listening = "false";
		}
	} else {
		if (localStorage.notificationClosed === "false") {
			notification.show(notification.changelog);
		} else {
			notification.hide();
		}
		if (localStorage.listening === "false") {
			elements.status.classList.add("idle");
			elements.status.classList.remove("active", "error");
			localStorage.listening = "false";
		} else if (localStorage.listening === "true") {
			elements.status.classList.remove("idle", "error");
			elements.status.classList.add("active");
		}
	}
	if (notificationCooldown % 500 === 0) {
		var timestamps = document.querySelectorAll(".timestamp");
		for (var item of timestamps) {
			var localTime = moment.utc(item.dataset.timestamp).tz(timezone);
			var activityString = "";
			if (item.dataset.activity) {
				var activityDef = DestinyActivityDefinition[item.dataset.activity];
				var activityTypeDef = DestinyActivityTypeDefinition[item.dataset.activityType];
				if (activityDef && activityTypeDef) {
					var activityName = activityDef.activityName;
					var activityTypeName = activityTypeDef.activityTypeName;
					activityString = activityTypeName + " - " + activityName;
				}
				if (globalOptions.pgcrImage) {
					item.style.backgroundImage = `url(https://www.bungie.net${activityDef.pgcrImage})`;
					item.classList.add("bg");
				} else {
					item.style.backgroundImage = "";
					item.classList.remove("bg");
				}
			}
			if (globalOptions.relativeDates) {
				item.innerHTML = localTime.fromNow() + "<br>" + activityString;
			} else {
				item.innerHTML = localTime.format("ddd[,] ll LTS") + "<br>" + activityString;
			}
			item.setAttribute("title", localTime.format("ddd[,] ll LTS") + "\n" + activityString);
		}
	}
	notificationCooldown++;
	if (notificationCooldown > 7200) {
		notificationCooldown = 0;
		if (jsonCharacterDescriptions !== localStorage.characterDescriptions) {
			characterDescriptions = JSON.parse(localStorage.characterDescriptions);
			jsonCharacterDescriptions = localStorage.characterDescriptions;
		}
	}
	if (localStorage.updateUI === "true" || notificationCooldown === 0 || pageNumber !== oldPageNumber) {
		localStorage.updateUI = "false";
		database.getMultipleStores(["itemChanges", "inventories"]).then(function chromeStorageGet(localData) {
			currentItemSet = localData.itemChanges;
			newInventories = localData.inventories;
			console.time("UpdateUI");
			newDisplayResults().then(function() {
				postDisplay();
				console.timeEnd("UpdateUI");
				window.requestAnimationFrame(frontEndUpdate);
			});
		});
	} else {
		window.requestAnimationFrame(frontEndUpdate);
	}
}
getAllOptions().then(function(options) {
	globalOptions = options;
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			localStorage.updateUI = "true";
			frontEndUpdate();
			// chrome.storage.local.get(null, function(result) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			console.log(result);
		});
	});
});