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
			console.log(d)
			startListening();
		} else {
			stopListening();
		}
	});
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
}

function handleTooltipData(dataset) {
	transitionInterval = setTimeout(function() {
		setTooltipData(dataset)
	}, 100);
}

var transitionInterval = null;
var previousElement = null;

function rowHeight(list1Length, list2Length, list3Length) {
	if (list1Length < 5 && list2Length < 5 && list3Length < 5) {
		return "one-row";
	}
	if (list1Length < 9 && list2Length < 9 && list3Length < 9) {
		return "two-rows";
	}
	if (list1Length < 13 && list2Length < 13 && list3Length < 13) {
		return "three-rows";
	}
	if (list1Length < 17 && list2Length < 17 && list3Length < 17) {
		return "four-rows";
	}
	if (list1Length < 21 && list2Length < 21 && list3Length < 21) {
		return "five-rows";
	}
	return "five-rows";
}

function createItems(itemList, className, characterId, moveType) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section");
	subContainer.classList.add(className);
	var docfrag = document.createDocumentFragment();
	for (var i = 0; i < itemList.length; i++) {
		var item = itemList[i];
		if (item.item) {
			item = item.item;
		}
		docfrag.appendChild(makeItem(JSON.parse(item), characterId, moveType));
	}
	subContainer.appendChild(docfrag);
	return subContainer;
}

function createDate(timestamp, className) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section");
	subContainer.classList.add(className);
	subContainer.textContent = moment.utc(timestamp).tz(moment.tz.guess()).fromNow();
	subContainer.setAttribute("title",moment.utc(timestamp).tz(moment.tz.guess()).format("llll"));
	return subContainer;
}

var lastIndex = -1;

function displayResults() {
	console.time("loadResults");
	var date = document.getElementById("date");
	var added = document.getElementById("added");
	var removed = document.getElementById("removed");
	var transferred = document.getElementById("transferred");
	sequence(data.itemChanges, function(arrayItem, callback, index) {
		if (lastIndex < index) {
			var addedQty = arrayItem.added.length;
			var removedQty = arrayItem.removed.length;
			var transferredQty = arrayItem.transferred.length;
			var className = rowHeight(addedQty, removedQty, transferredQty);
			lastIndex = index;
			callback({
				className: className,
				latestItemChange: arrayItem
			});
		}
		callback(false);
	}, function(result, arrayItem, index) {
		if (result) {
			var latestItemChange = result.latestItemChange;
			var className = result.className;
			date.insertBefore(createDate(latestItemChange.timestamp, className), date.firstChild);
			added.insertBefore(createItems(latestItemChange.added, className, latestItemChange.characterId, "added"), added.firstChild);
			removed.insertBefore(createItems(latestItemChange.removed, className, latestItemChange.characterId, "removed"), removed.firstChild);
			transferred.insertBefore(createItems(latestItemChange.transferred, className, latestItemChange.characterId, "transferred"), transferred.firstChild);
		}
	}).then(function() {
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

function makeItem(itemData, characterId, moveType) {
	var docfrag = document.createDocumentFragment();
	var container = document.createElement("div");
	var stat = document.createElement("div");
	container.appendChild(stat);
	docfrag.appendChild(container);
	DOMTokenList.prototype.add.apply(container.classList, itemClasses(itemData));
	container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[itemData.itemHash].icon + "')");
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(itemData);
	passData(container, itemData, characterId, moveType);
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
	} else {
		return "Quantity";
	}
}

function passData(DomNode, itemData, characterId, moveType) {
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
	DomNode.dataset.classRequirement = characterSource(characterId, moveType);
}

function characterSource(characterId, moveType) {
	if (characterId === "vault") {
		return "From Vault"
	}
	var starter = "Added to ";
	if (moveType === "removed") {
		starter = "Removed from ";
	}
	if (moveType === "transferred") {
		starter = "transferred to "
		if (characterId === "vault") {
			return "To Vault"
		}
	}
	return starter + characterDescriptions[characterId].race + " " + characterDescriptions[characterId].gender + " " + characterDescriptions[characterId].name + " (" + characterDescriptions[characterId].light + ")";
}

function setTooltipData(dataset) {
	var tooltip = document.getElementById("tooltip");
	var itemName = document.getElementById("item-name");
	var itemType = document.getElementById("item-type");
	var itemRarity = document.getElementById("item-rarity");
	var itemLevelText = document.getElementById("level-text");
	var itemRequiredEquipLevel = document.getElementById("item-required-equip-level");
	var itemPrimaryStat = document.getElementById("item-primary-stat");
	var itemPrimaryStatText = document.getElementById("item-stat-text");
	var itemDescription = document.getElementById("item-description");
	var classRequirement = document.getElementById("class-requirement");
	itemName.textContent = dataset.itemName;
	itemType.textContent = dataset.itemTypeName;
	itemRarity.textContent = dataset.tierTypeName;
	itemRequiredEquipLevel.textContent = dataset.equipRequiredLevel;
	if (dataset.equipRequiredLevel === "0") {
		itemLevelText.classList.add("hidden");
	} else {
		itemLevelText.classList.remove("hidden");
	}
	itemPrimaryStat.textContent = dataset.primaryStat;
	itemPrimaryStatText.textContent = dataset.primaryStatName;
	itemDescription.textContent = dataset.itemDescription;
	classRequirement.textContent = dataset.classRequirement;
	tooltip.classList.remove("hidden", "arc", "void", "solar", "kinetic", "common", "legendary", "rare", "uncommon", "exotic");
	try {
		tooltip.classList.add(dataset.tierTypeName.toLowerCase(), dataset.damageTypeName.toLowerCase());
	} catch (e) {
		console.log(dataset)
	}
}
for(var i=0;i<data.itemChanges.length;i++) {
	var item = data.itemChanges[i];
	if(item.added.length > 10 || item.removed.length > 10 || item.transferred.length > 10) {
		console.log(i,item)
	}
}