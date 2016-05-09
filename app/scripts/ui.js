function initUi() {
	var header = document.querySelector("#status");
	header.classList.add("idle");
	var element = document.querySelector("#startTracking");
	element.removeAttribute("disabled");
	element.addEventListener("click", function(event) {
		if (!localStorage["listening"] || localStorage["listening"] === "false") {
			var d = new Date();
			d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
			d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + (d.getHours() - 0)).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2);
			localStorage["listening"] = "true";
			localStorage["manual"] = "true";
		} else {
			localStorage["listening"] = "false";
		}
	});
	var historyLink = document.querySelector("#viewhistory");
	if (historyLink) {
		historyLink.addEventListener("click", function() {
			window.location.href = chrome.extension.getURL('history.html');
		});
	}
	var optionsLink = document.querySelector("#viewOptions");
	if (optionsLink) {
		optionsLink.addEventListener("click", function() {
			window.location.href = chrome.extension.getURL('options.html');
		});
	}
	document.querySelector("#container").addEventListener("mouseover", function(event) {
		var target = null;
		if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
			target = event.target;
		} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
			target = event.target.parentNode;
		}
		if (target && target !== previousElement) {
			tooltip.classList.add("hidden");
			previousElement = target;
			if (transitionInterval) {
				clearInterval(transitionInterval);
			}
			handleTooltipData(event.target.dataset);
		}
		if (!target) {
			if (transitionInterval) {
				clearInterval(transitionInterval);
			}
			tooltip.classList.add("hidden");
			previousElement = null;
		}
	}, false);
}

var transitionInterval = null;
var previousElement = null;

function rowHeight(list1Length, list2Length, list3Length, list4Length) {
	if (list1Length < 5 && list2Length < 5 && list3Length < 5 && list4Length < 5) {
		return "one-row";
	}
	if (list1Length < 9 && list2Length < 9 && list3Length < 9 && list4Length < 9) {
		return "two-rows";
	}
	if (list1Length < 13 && list2Length < 13 && list3Length < 13 && list4Length < 13) {
		return "three-rows";
	}
	if (list1Length < 17 && list2Length < 17 && list3Length < 17 && list4Length < 17) {
		return "four-rows";
	}
	if (list1Length < 21 && list2Length < 21 && list3Length < 21 && list4Length < 21) {
		return "five-rows";
	}
	return "five-rows";
}

function createItems(itemDiff, className, moveType) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className);
	var docfrag = document.createDocumentFragment();
	for (var i = 0; i < itemDiff[moveType].length; i++) {
		docfrag.appendChild(makeItem(itemDiff, moveType, i));
	}
	subContainer.appendChild(docfrag);
	return subContainer;
}

function createProgress(itemDiff, className, moveType) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className);
	if (itemDiff[moveType]) {
		var docfrag = document.createDocumentFragment();
		for (var i = 0; i < itemDiff[moveType].length; i++) {
			docfrag.appendChild(makeProgress(itemDiff, moveType, i));
		}
		subContainer.appendChild(docfrag);
	}
	return subContainer;
}

function createDate(itemDiff, className) {
	var timestamp = itemDiff.timestamp;
	var activity = "";
	if (itemDiff.match) {
		var match = JSON.parse(itemDiff.match);
		var activityTypeData = DestinyActivityDefinition[match.activityHash];
		activity = " " + activityTypeData.activityName;
	}
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className, "timestamp");
	subContainer.textContent = moment.utc(timestamp).tz(moment.tz.guess()).fromNow() + activity;
	subContainer.setAttribute("title", moment.utc(timestamp).tz(moment.tz.guess()).format("ddd[,] ll LTS"));
	subContainer.dataset.timestamp = timestamp;
	subContainer.dataset.activity = activity;
	subContainer.dataset.index = itemDiff.id;
	return subContainer;
}

var lastIndex = -1;
var resultQuantity = 100;
var arrayStep = 0;

function displayResults() {
	console.timeEnd("grab matches");
	constructMatchInterface();
	console.time("loadResults");
	var timestamps = document.querySelectorAll(".timestamp");
	for (var item of timestamps) {
		item.textContent = moment.utc(item.dataset.timestamp).tz(moment.tz.guess()).fromNow() + item.dataset.activity;
		item.setAttribute("title", moment.utc(item.dataset.timestamp).tz(moment.tz.guess()).format("ddd[,] ll LTS"));
	}
	var date = document.getElementById("date");
	var added = document.getElementById("added");
	var removed = document.getElementById("removed");
	var transferred = document.getElementById("transferred");
	var progression = document.getElementById("progression");
	var dateFrag = document.createDocumentFragment();
	var addedFrag = document.createDocumentFragment();
	var removedFrag = document.createDocumentFragment();
	var transferredFrag = document.createDocumentFragment();
	var progressionFrag = document.createDocumentFragment();
	// The dataset
	var myArr = [];
	// Number of operations per call
	var batchSize = 50;
	// The actual processing method
	function work(item, index) {
		var dateFrag = document.createDocumentFragment();
		var addedFrag = document.createDocumentFragment();
		var removedFrag = document.createDocumentFragment();
		var transferredFrag = document.createDocumentFragment();
		var progressionFrag = document.createDocumentFragment();
		// console.time("part1")
		var addedQty = item.added.length;
		var removedQty = item.removed.length;
		var transferredQty = item.transferred.length;
		var progressionQty = 0;
		if (item.progression) {
			progressionQty = item.progression.length;
		}
		var className = rowHeight(addedQty, removedQty, transferredQty, progressionQty);
		lastIndex = index;
		// console.timeEnd("part1")
		// console.time("part2")
		dateFrag.insertBefore(createDate(item, className), dateFrag.firstChild);
		addedFrag.insertBefore(createItems(item, className, "added"), addedFrag.firstChild);
		removedFrag.insertBefore(createItems(item, className, "removed"), removedFrag.firstChild);
		transferredFrag.insertBefore(createItems(item, className, "transferred"), transferredFrag.firstChild);
		progressionFrag.insertBefore(createProgress(item, className, "progression"), progressionFrag.firstChild);
		// console.timeEnd("part2")
		date.insertBefore(dateFrag, date.firstChild)
		added.insertBefore(addedFrag, added.firstChild)
		removed.insertBefore(removedFrag, removed.firstChild)
		transferred.insertBefore(transferredFrag, transferred.firstChild)
		progression.insertBefore(progressionFrag, progression.firstChild)
	}

	// Start iterator, it will return a promise
	var promise = asyncIterator(data.itemChanges, work, batchSize);

	// When promise is resolved, output results
	promise.then(function(results) {
		console.time("part3")
		date.insertBefore(dateFrag, date.firstChild)
		added.insertBefore(addedFrag, added.firstChild)
		removed.insertBefore(removedFrag, removed.firstChild)
		transferred.insertBefore(transferredFrag, transferred.firstChild)
		progression.insertBefore(progressionFrag, progression.firstChild)
		console.timeEnd("part3")
		console.timeEnd("loadResults");
		console.log('Done processing', results);
	});
	// sequence(data.itemChanges, function(arrayItem, callback, index) {
	// 	if (lastIndex < index) {
	// 		console.time("part1")
	// 		var addedQty = arrayItem.added.length;
	// 		var removedQty = arrayItem.removed.length;
	// 		var transferredQty = arrayItem.transferred.length;
	// 		var progressionQty = 0;
	// 		if (arrayItem.progression) {
	// 			progressionQty = arrayItem.progression.length;
	// 		}
	// 		var className = rowHeight(addedQty, removedQty, transferredQty, progressionQty);
	// 		lastIndex = index;
	// 		console.timeEnd("part1")
	// 		callback({
	// 			className: className,
	// 			itemDiff: arrayItem
	// 		});
	// 	}
	// 	callback(false);
	// }, function(result, arrayItem, index) {
	// 	if (result) {
	// 		console.time("part2")
	// 		var itemDiff = result.itemDiff;
	// 		var className = result.className;
	// 		dateFrag.insertBefore(createDate(itemDiff, className), dateFrag.firstChild);
	// 		addedFrag.insertBefore(createItems(itemDiff, className, "added"), addedFrag.firstChild);
	// 		removedFrag.insertBefore(createItems(itemDiff, className, "removed"), removedFrag.firstChild);
	// 		transferredFrag.insertBefore(createItems(itemDiff, className, "transferred"), transferredFrag.firstChild);
	// 		progressionFrag.insertBefore(createProgress(itemDiff, className, "progression"), progressionFrag.firstChild);
	// 		console.timeEnd("part2")
	// 	}
	// }).then(function() {
	// 	console.time("part3")
	// 	date.insertBefore(dateFrag, date.firstChild)
	// 	added.insertBefore(addedFrag, added.firstChild)
	// 	removed.insertBefore(removedFrag, removed.firstChild)
	// 	transferred.insertBefore(transferredFrag, transferred.firstChild)
	// 	progression.insertBefore(progressionFrag, progression.firstChild)
	// 	console.timeEnd("part3")
	// 	console.timeEnd("loadResults");
	// });
}

function delayNode(index, className, latestItemChange, date, added, removed, transferred) {
	setTimeout(function() {
		date.insertBefore(createDate(latestItemChange.timestamp, className), date.firstChild);
		added.insertBefore(createItems(latestItemChange.added, className, latestItemChange.characterId, "added"), added.firstChild);
		removed.insertBefore(createItems(latestItemChange.removed, className, latestItemChange.characterId, "removed"), removed.firstChild);
		transferred.insertBefore(createItems(latestItemChange.transferred, className, latestItemChange.characterId, "transferred"), transferred.firstChild);
	}, 50);
}

function makeItem(itemDiff, moveType, index) {
	var itemData = itemDiff[moveType][index];
	if (itemData.item) {
		itemData = itemData.item;
	}
	itemData = JSON.parse(itemData);
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
	passData(container, itemDiff, moveType, index);
	return docfrag;
}

function makeProgress(itemDiff, moveType, index) {
	var progressData = itemDiff[moveType][index];
	progressData = JSON.parse(progressData);
	if (progressData.itemHash) {
		return makeItem(itemDiff, moveType, index);
	}
	var docfrag = document.createDocumentFragment();
	var container = document.createElement("div");
	var stat = document.createElement("div");
	container.appendChild(stat);
	docfrag.appendChild(container);
	container.classList.add("kinetic", "common", "faction")
	if (DestinyFactionDefinition[progressData.factionHash]) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyFactionDefinition[progressData.factionHash].factionIcon + "')");
	} else if (DestinyProgressionDefinition[progressData.progressionHash].icon) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyProgressionDefinition[progressData.progressionHash].icon + "')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = progressData.progressChange
	passFactionData(container, itemDiff, moveType, index);
	return docfrag;
}

function itemClasses(itemData) {
	var classList = ["item"];
	if (itemData.isGridComplete) {
		classList.push("complete");
	}
	var itemDefinition = DestinyCompactItemDefinition[itemData.itemHash];
	if (itemDefinition.tierTypeName === "Exotic") {
		classList.push("exotic");
	} else if (itemDefinition.tierTypeName === "Legendary") {
		classList.push("legendary");
	} else if (itemDefinition.tierTypeName === "Rare") {
		classList.push("rare");
	} else if (itemDefinition.tierTypeName === "Uncommon") {
		classList.push("uncommon");
	} else {
		classList.push("common");
	}
	if (itemData.damageTypeHash) {
		var damageTypeName = DestinyDamageTypeDefinition[itemData.damageTypeHash].damageTypeName;
		if (damageTypeName === "Arc") {
			classList.push("arc");
		} else if (damageTypeName === "Solar") {
			classList.push("solar");
		} else if (damageTypeName === "Void") {
			classList.push("void");
		} else {
			classList.push("kinetic");
		}
	} else {
		classList.push("kinetic");
	}
	return classList;
}

function primaryStat(itemData) {
	if (itemData.primaryStat) {
		return itemData.primaryStat.value;
	} else {
		return itemData.stackSize;
	}
}

function elementType(itemData) {
	if (itemData.damageTypeHash) {
		var damageTypeName = DestinyDamageTypeDefinition[itemData.damageTypeHash].damageTypeName;
		return damageTypeName;
	} else {
		return "Kinetic";
	}
}

function primaryStatName(itemData) {
	if (itemData.primaryStat) {
		return itemData.primaryStat.statName;
	} else if (itemData.bucketHash === 2197472680) {
		return "Completed"
	} else {
		return "Quantity";
	}
}

function passData(DomNode, itemDiff, moveType, index) {
	var itemData = itemDiff[moveType][index];
	if (itemData.item) {
		itemData = itemData.item;
	}
	itemData = JSON.parse(itemData);
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
	DomNode.dataset.primaryStatName = primaryStatName(itemDefinition);
	DomNode.dataset.itemDescription = itemDefinition.itemDescription;
	DomNode.dataset.damageTypeName = elementType(itemData);
	DomNode.dataset.classRequirement = characterSource(itemDiff, moveType, index);
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

function passFactionData(DomNode, itemDiff, moveType, index) {
	var diffData = itemDiff[moveType][index];
	diffData = JSON.parse(diffData);
	if (diffData.factionHash) {
		var factionData = DestinyFactionDefinition[diffData.factionHash];
		DomNode.dataset.itemName = factionData.factionName;
		DomNode.dataset.itemDescription = factionData.factionDescription;
	} else {
		var factionData = DestinyProgressionDefinition[diffData.progressionHash];
		DomNode.dataset.itemName = factionData.name;
		DomNode.dataset.itemDescription = "";
	}
	DomNode.dataset.tierTypeName = "Common";
	DomNode.dataset.itemTypeName = "Faction";
	DomNode.dataset.equipRequiredLevel = 0;
	DomNode.dataset.primaryStat = diffData.progressToNextLevel;
	DomNode.dataset.primaryStatName = diffData.nextLevelAt;
	DomNode.dataset.damageTypeName = "Kinetic";
	DomNode.dataset.progressToNextLevel = diffData.progressToNextLevel;
	DomNode.dataset.progressChange = diffData.progressChange;
	DomNode.dataset.nextLevelAt = diffData.nextLevelAt;
	DomNode.dataset.level = diffData.level;
	DomNode.dataset.classRequirement = characterSource(itemDiff, moveType, index);
}

function characterName(characterId, light) {
	if (light === null) {
		return characterDescriptions[characterId].name;
	}
	if (characterId === "vault") {
		return "Vault";
	}
	return characterDescriptions[characterId].race + " " + characterDescriptions[characterId].gender + " " + characterDescriptions[characterId].name + " (" + (light || characterDescriptions[characterId].light) + ")";
}

function characterSource(itemDiff, moveType, index) {
	var itemData = itemDiff[moveType][index];
	var light = itemDiff.light;
	var toId = itemDiff.characterId;
	var fromId = "";
	var starter = "Added to ";
	if (itemData.item) {
		fromId = itemData.from;
	}
	if (moveType === "removed") {
		starter = "Removed from ";
	}
	if (fromId) {
		starter = "From " + characterName(fromId, null) + " to ";
	}
	return starter + characterName(toId, light);
}