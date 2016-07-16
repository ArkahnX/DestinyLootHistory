tracker.sendAppView('Vendor');
logger.disable();
initUi();

function passData(DomNode, itemData, unlockFlag) {
	logger.startLogging("UI");
	if (itemData.tierTypeName) {
		DomNode.dataset.tierTypeName = itemData.tierTypeName;
	} else {
		DomNode.dataset.tierTypeName = "Common";
	}
	DomNode.dataset.itemHash = itemData.itemHash;
	DomNode.dataset.itemName = itemData.itemName;
	DomNode.dataset.itemTypeName = itemData.itemTypeName;
	DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
	DomNode.dataset.primaryStat = primaryStat(itemData);
	DomNode.dataset.primaryStatName = primaryStatName(itemData);
	DomNode.dataset.itemDescription = itemData.itemDescription;
	DomNode.dataset.damageTypeName = elementType(itemData);
	DomNode.dataset.classRequirement = "";
	if (unlockFlag) {
		DomNode.dataset.classRequirement = unlockFlag;
	}
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

function makeItem(itemHash, acquired, saleItem) {
	var itemData = getItemDefinition(itemHash);
	var docfrag = document.createDocumentFragment();
	var itemContainer = document.createElement("div");
	itemContainer.classList.add("item-container");
	var container = document.createElement("div");
	var stat = document.createElement("div");
	itemContainer.appendChild(container);
	itemContainer.appendChild(stat);
	docfrag.appendChild(itemContainer);
	if (hasQuality(saleItem.item)) {
		var quality = document.createElement("div");
		itemContainer.appendChild(quality);
		quality.classList.add("quality");
		stat.classList.add("with-quality");
		var qualityData = parseItemQuality(saleItem.item);
		quality.style.background = qualityData.color;
		quality.textContent = qualityData.min + "%";
	}
	DOMTokenList.prototype.add.apply(container.classList, itemClasses(itemData));
	if (itemData.itemHash === 3159615086 || itemData.itemHash === 2534352370 || itemData.itemHash === 2749350776) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "')");
	} else if (getItemDefinition(itemData.itemHash).hasIcon || (getItemDefinition(itemData.itemHash).icon && getItemDefinition(itemData.itemHash).icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "'),url('http://bungie.net/img/misc/missing_icon.png')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(itemData);
	var unlockFlag = false;
	if (acquired) {
		// console.log(itemData, DestinyUnlockFlagDefinition[acquired.unlockFlagHash], saleItem);
		if (acquired.isSet === false) {
			container.style.borderColor = "red";
		}
		unlockFlag = DestinyVendorDefinition["3301500998"].failureStrings[saleItem.failureIndexes[0] || 0];
		if (!unlockFlag) {
			unlockFlag = DestinyUnlockFlagDefinition[acquired.unlockFlagHash].displayName;
			if (!DestinyUnlockFlagDefinition[acquired.unlockFlagHash].displayName) {
				if (itemData.sourceHashes) {
					unlockFlag = DestinyRewardSourceDefinition[itemData.sourceHashes[0]].description;
				} else {
					unlockFlag = "";
				}
			}
		}
	}
	passData(container, itemData, unlockFlag);
	return docfrag;
}

function makeItemsFromList(list) {
	var emblems = {};
	var mainContainer = document.getElementById("history");
	// var categories = emblemData.data.vendor.saleItemCategories;
	// var vendorCategory = outfitterData.data.vendor.saleItemCategories[0];
	for (var category of list) {
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<h1>" + category.categoryTitle + "</h1>";
		mainContainer.appendChild(titleContainer);
		var subContainer = document.createElement("div");
		subContainer.classList.add("sub-section");
		var docfrag = document.createDocumentFragment();
		for (var saleItem of category.saleItems) {
			docfrag.appendChild(makeItem(saleItem.item.itemHash, saleItem.unlockStatuses[0], saleItem));
			// for (var vendorItem of vendorCategory.saleItems) {
			// 	var itemDef = DestinyCompactItemDefinition[saleItem.item.itemHash];
			// 	if (saleItem.unlockStatuses.length && !saleItem.unlockStatuses[0].isSet && vendorItem.item.itemHash === saleItem.item.itemHash) {
			// 		emblems[saleItem.item.itemHash] = {
			// 			name: itemDef.itemName,
			// 			acquired: saleItem.unlockStatuses[0].isSet,
			// 			selling: true
			// 		};
			// 	}
			// }
		}
		subContainer.appendChild(docfrag);
		mainContainer.appendChild(subContainer);
	}
}

var vendorList = [174528503,354219928,452808717]; // foreach DestinyVendorDefinition

initItems(function() {
	bungie.getVendorForCharacter(localStorage.newestCharacter, 3301500998).then(function(emblemData) {
		bungie.getVendorForCharacter(localStorage.newestCharacter, 134701236).then(function(outfitterData) {
			bungie.getXur().then(function(xurData) {
				console.log(xurData.data.saleItemCategories[2].saleItems);
				makeItemsFromList(xurData.data.saleItemCategories);
				makeItemsFromList(emblemData.data.vendor.saleItemCategories);
				// console.log(emblems, categories, vendorCategory);
			});
		});
	});
});