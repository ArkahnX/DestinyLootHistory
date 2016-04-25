function initUi() {
	var header = document.querySelector("#status");
	header.classList.add("idle");
	var element = document.querySelector("#startTracking");
	element.removeAttribute("disabled");
	element.addEventListener("click", function(event) {
		if (listenLoop === null) {
			var d = new Date();
			d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
			d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + (d.getHours() - 0)).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2);
			startListening();
		} else {
			stopListening();
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
		if (event.target.classList.contains("item")) {
			target = event.target;
		} else if (event.target.parentNode.classList.contains("item")) {
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
	document.querySelector("#container").addEventListener("scroll", function(event) {
		if (window.innerHeight + document.body.scrollTop > document.body.offsetHeight) {
			displayResults();
		}
	});
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

function createDate(timestamp, className) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className, "timestamp");
	subContainer.textContent = moment.utc(timestamp).tz(moment.tz.guess()).fromNow();
	subContainer.setAttribute("title", moment.utc(timestamp).tz(moment.tz.guess()).format("ddd[,] ll LTS"));
	subContainer.dataset.timestamp = timestamp;
	return subContainer;
}

var lastIndex = -1;
var resultQuantity = 100;
var arrayStep = 0;

function displayResults() {
	var timestamps = document.querySelectorAll(".timestamp");
	for (var item of timestamps) {
		item.textContent = moment.utc(item.dataset.timestamp).tz(moment.tz.guess()).fromNow();
		item.setAttribute("title", moment.utc(item.dataset.timestamp).tz(moment.tz.guess()).format("ddd[,] ll LTS"));
	}
	console.time("loadResults");
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
	// var thinArray = [];
	// for(var i=data.itemChanges.length-(arrayStep * resultQuantity);i > -1;i--) {
	// 	if(data.itemChanges[i]) {
	// 		thinArray.push(data.itemChanges[i]);
	// 	}
	// }

	sequence(data.itemChanges, function(arrayItem, callback, index) {
		if (lastIndex < index) {
			var addedQty = arrayItem.added.length;
			var removedQty = arrayItem.removed.length;
			var transferredQty = arrayItem.transferred.length;
			var progressionQty = 0;
			if (arrayItem.progression) {
				progressionQty = arrayItem.progression.length;
			}
			var className = rowHeight(addedQty, removedQty, transferredQty, progressionQty);
			lastIndex = index;
			callback({
				className: className,
				itemDiff: arrayItem
			});
		}
		callback(false);
	}, function(result, arrayItem, index) {
		if (result) {
			var itemDiff = result.itemDiff;
			var className = result.className;
			dateFrag.insertBefore(createDate(itemDiff.timestamp, className), dateFrag.firstChild);
			addedFrag.insertBefore(createItems(itemDiff, className, "added"), addedFrag.firstChild);
			removedFrag.insertBefore(createItems(itemDiff, className, "removed"), removedFrag.firstChild);
			transferredFrag.insertBefore(createItems(itemDiff, className, "transferred"), transferredFrag.firstChild);
			progressionFrag.insertBefore(createProgress(itemDiff, className, "progression"), progressionFrag.firstChild);
		}
	}).then(function() {
		date.insertBefore(dateFrag, date.firstChild)
		added.insertBefore(addedFrag, added.firstChild)
		removed.insertBefore(removedFrag, removed.firstChild)
		transferred.insertBefore(transferredFrag, transferred.firstChild)
		progression.insertBefore(progressionFrag, progression.firstChild)
		console.timeEnd("loadResults");
	});
	// var lastIndex2 = -1;
	// console.time("makeInventory");
	// var inventory = document.getElementById("inventory");
	// sequence(data.inventories["2305843009230608060"], function(arrayItem, callback, index) {
	// 	if (lastIndex2 < index) {
	// 		var targetNode = document.getElementById(arrayItem.bucketName);
	// 		if(!targetNode) {
	// 			var div = document.createElement("div");
	// 			div.setAttribute("id",arrayItem.bucketName);
	// 			div.classList.add("sub-section");
	// 			inventory.appendChild(div);
	// 		}
	// 		lastIndex2 = index;
	// 		callback(true);
	// 	}
	// 	callback(false);
	// }, function(result, arrayItem, index) {
	// 	if (result) {
	// 		var targetNode = document.getElementById(arrayItem.bucketName);
	// 		targetNode.appendChild(makeItem(arrayItem, "2305843009230608060"));
	// 	}
	// }).then(function() {
	// 	console.timeEnd("makeInventory");
	// });
	// for (var e = 0; e < data.itemChanges.length; e++) {
	// 	if (lastIndex < e) {
	// 		var latestItemChange = data.itemChanges[e];
	// 		var addedQty = latestItemChange.added.length;
	// 		var removedQty = latestItemChange.removed.length;
	// 		var transferredQty = latestItemChange.transferred.length;
	// 		var className = rowHeight(addedQty, removedQty, transferredQty);
	// 		delayNode(e, className, latestItemChange, date, added, removed, transferred);
	// 		lastIndex = e;
	// 	}
	// }
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
	var docfrag = document.createDocumentFragment();
	var container = document.createElement("div");
	var stat = document.createElement("div");
	container.appendChild(stat);
	docfrag.appendChild(container);
	container.classList.add("kinetic", "common", "item")
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
	if (itemData.tierTypeName === "Exotic") {
		classList.push("exotic");
	} else if (itemData.tierTypeName === "Legendary") {
		classList.push("legendary");
	} else if (itemData.tierTypeName === "Rare") {
		classList.push("rare");
	} else if (itemData.tierTypeName === "Uncommon") {
		classList.push("uncommon");
	} else {
		classList.push("common");
	}
	if (itemData.damageTypeName) {
		if (itemData.damageTypeName === "Arc") {
			classList.push("arc");
		} else if (itemData.damageTypeName === "Solar") {
			classList.push("solar");
		} else if (itemData.damageTypeName === "Void") {
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
	if (itemData.damageTypeName) {
		return itemData.damageTypeName;
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
	if (itemData.tierTypeName) {
		DomNode.dataset.tierTypeName = itemData.tierTypeName;
	} else {
		DomNode.dataset.tierTypeName = "Common";
	}
	DomNode.dataset.itemName = itemData.itemName;
	DomNode.dataset.itemTypeName = itemData.itemTypeName;
	DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
	DomNode.dataset.primaryStat = primaryStat(itemData);
	DomNode.dataset.primaryStatName = primaryStatName(itemData);
	DomNode.dataset.itemDescription = DestinyCompactItemDefinition[itemData.itemHash].itemDescription;
	DomNode.dataset.damageTypeName = elementType(itemData);
	DomNode.dataset.classRequirement = characterSource(itemDiff, moveType, index);
}

function passFactionData(DomNode, itemDiff, moveType, index) {
	var diffData = itemDiff[moveType][index];
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
	console.log(diffData)
	DomNode.dataset.primaryStat = diffData.progressToNextLevel;
	DomNode.dataset.primaryStatName = "Progress";
	DomNode.dataset.damageTypeName = "Kinetic";
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

