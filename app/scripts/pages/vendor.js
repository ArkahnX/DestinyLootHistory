tracker.sendAppView('Vendor');
logger.disable();
initUi();

function passData(DomNode, itemData, unlockFlag) {
	var itemDef = getItemDefinition(itemData.itemHash);
	logger.startLogging("UI");
	if (itemData.tierTypeName) {
		DomNode.dataset.tierTypeName = itemDef.tierTypeName;
	} else {
		DomNode.dataset.tierTypeName = "Common";
	}
	DomNode.dataset.itemHash = itemData.itemHash;
	DomNode.dataset.itemName = itemDef.itemName;
	DomNode.dataset.itemTypeName = itemDef.itemTypeName;
	DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
	DomNode.dataset.primaryStat = primaryStat(itemData);
	DomNode.dataset.primaryStatName = primaryStatName(itemData);
	DomNode.dataset.itemDescription = itemDef.itemDescription;
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
	if (hasQuality(saleItem.item)) {
		var quality = document.createElement("div");
		itemContainer.appendChild(quality);
		quality.classList.add("quality");
		stat.classList.add("with-quality");
		var qualityData = parseItemQuality(saleItem.item);
		quality.style.background = qualityData.color;
		quality.textContent = qualityData.min + "%";
	}
	itemContainer.appendChild(stat);
	docfrag.appendChild(itemContainer);
	DOMTokenList.prototype.add.apply(container.classList, itemClasses(saleItem.item));
	if (itemData.itemHash === 3159615086 || itemData.itemHash === 2534352370 || itemData.itemHash === 2749350776) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "')");
	} else if (getItemDefinition(itemData.itemHash).hasIcon || (getItemDefinition(itemData.itemHash).icon && getItemDefinition(itemData.itemHash).icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "'),url('http://bungie.net/img/misc/missing_icon.png')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = primaryStat(saleItem.item);
	var unlockFlag = false;
	if (acquired) {
		// console.log(itemData, DestinyUnlockFlagDefinition[acquired.unlockFlagHash], saleItem);
		if (acquired.isSet === false) {
			itemContainer.classList.add("undiscovered")
		}
		unlockFlag = DestinyVendorDefinition[lastVendor].failureStrings[saleItem.failureIndexes[0] || -1];
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
	passData(container, saleItem.item, unlockFlag);
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

var deadVendors = [415161769, 863056813, 3019290222, 2698860028, 1660667815, 1588933401, 2586808090, 1653856985, 529545063, 1353750121, 4275962006, 163657562, 3898086963, 3165969428, 892630493, 2016602161, ];
var selectedCharacter = localStorage.newestCharacter;
var lastVendor = "";

initItems(function() {
	var vendors = {
		other: []
	};
	var characterHTML = "";
	for (let characterId in characterDescriptions) {
		if (characterId !== "vault") {
			characterHTML += `<option value="${characterId}"${(characterId === selectedCharacter) ? " selected" : ""}>${characterName(characterId)}</option>`;
		}
	}
	document.getElementById("character").innerHTML = characterHTML;
	for (let vendor of DestinyVendorDefinition) {
		if (vendor.summary.vendorCategoryHashes.length || vendor.summary.vendorSubcategoryHash) {
			for (let categoryHash of vendor.summary.vendorCategoryHashes) {
				if (!vendors[categoryHash]) {
					vendors[categoryHash] = [];
				}
				vendors[categoryHash].push(vendor.summary);
			}
			if (vendor.summary.vendorSubcategoryHash) {
				if (!vendors[vendor.summary.vendorSubcategoryHash]) {
					vendors[vendor.summary.vendorSubcategoryHash] = [];
				}
				vendors[vendor.summary.vendorSubcategoryHash].push(vendor.summary);
			}
		} else {
			vendors.other.push(vendor.summary);
		}
	}
	for (let vendorCategory in vendors) {
		vendors[vendorCategory].sort(function(a, b) {
			var textA = a.vendorName.toUpperCase();
			var textB = b.vendorName.toUpperCase();
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		});
	}
	var vendorHTML = "";
	for (let vendorCategory in vendors) {
		vendorHTML += `<optgroup label="${DestinyVendorCategoryDefinition[vendorCategory] && DestinyVendorCategoryDefinition[vendorCategory].categoryName || vendorCategory}">`;
		for (let vendor of vendors[vendorCategory]) {
			vendorHTML += `<option value="${vendor.vendorHash}"${(vendor.vendorHash === lastVendor) ? " selected" : ""}>${vendor.vendorName || vendor.vendorHash}</option>`;
		}
		vendorHTML += `</optgroup>`;
	}
	document.getElementById("vendor").innerHTML = `<option value="None" selected>None</option>` + vendorHTML;
	document.getElementById("compare").innerHTML = `<option value="None" selected>None</option>` + vendorHTML;
	document.getElementById("character").addEventListener("change", function() {
		if (document.getElementById("vendor").value !== "None") {
			getVendor(lastVendor);
		}
	});
	document.getElementById("vendor").addEventListener("change", function(event) {
		if (event.target.value !== "None") {
			getVendor(event.target.value);
		}
	});
	document.getElementById("compare").addEventListener("change", function(event) {
		if (document.getElementById("vendor").value !== "None" && event.target.value !== "None") {
			compareVendor(document.getElementById("vendor").value, event.target.value);
		}
	});
	// bungie.getVendorForCharacter(localStorage.newestCharacter, 3301500998).then(function(emblemData) {
	// 	bungie.getVendorForCharacter(localStorage.newestCharacter, 134701236).then(function(outfitterData) {
	// 		bungie.getXur().then(function(xurData) {
	// 			console.log(xurData.data.saleItemCategories[2].saleItems);
	// 			makeItemsFromList(xurData.data.saleItemCategories);
	// 			makeItemsFromList(emblemData.data.vendor.saleItemCategories);
	// 			// console.log(emblems, categories, vendorCategory);
	// 		});
	// 	});
	// });
});

function getVendor(hash) {
	var mainContainer = document.getElementById("history");
	mainContainer.innerHTML = "";
	lastVendor = parseInt(hash);
	selectedCharacter = document.getElementById("character").value;
	document.getElementById("compare").value = "None";
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).then(function(response) {
		console.log(response, response.Response && response.Response.data, DestinyVendorDefinition[lastVendor]);
		if (response.Response) {
			makeItemsFromList(response.Response.data.vendor.saleItemCategories);
		} else {
			console.log(lastVendor);
		}
	});
}

function compareVendor(vendorHash, compareHash) {
	var mainContainer = document.getElementById("history");
	mainContainer.innerHTML = "";
	lastVendor = parseInt(vendorHash);
	selectedCharacter = document.getElementById("character").value;
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).then(function(responseMain) {
		bungie.getVendorForCharacter(selectedCharacter, compareHash).then(function(responseCompare) {
			if (responseMain.Response && responseCompare.Response) {
				var vendorSaleItems = responseMain.Response.data.vendor.saleItemCategories;
				var vendorName = DestinyVendorDefinition[responseMain.Response.data.vendor.vendorHash].summary.vendorName;
				var compareName = DestinyVendorDefinition[responseCompare.Response.data.vendor.vendorHash].summary.vendorName;
				var compareSaleItems = responseCompare.Response.data.vendor.saleItemCategories;
				var flattenedVendorItems = flattenItems(vendorSaleItems);
				var flattenedCompareItems = flattenItems(compareSaleItems);
				var saleItemCategories = [{
					categoryTitle: vendorName,
					saleItems: []
				}, {
					categoryTitle: compareName,
					saleItems: []
				}];
				for (var compareItem of flattenedCompareItems) {
					for (var vendorItem of flattenedVendorItems) {
						if (compareItem.item.itemHash === vendorItem.item.itemHash) {
							saleItemCategories[0].saleItems.push(vendorItem);
							saleItemCategories[1].saleItems.push(compareItem);
						}
					}
				}
				// console.log(response, response.Response && response.Response.data, DestinyVendorDefinition[lastVendor]);
				makeItemsFromList(saleItemCategories);
			} else {
				console.log(document.getElementById("character").value, document.getElementById("vendor").value, document.getElementById("compare").value);
			}
		});
	});
}

function flattenItems(itemCategories) {
	var result = [];
	for (var category of itemCategories) {
		for (var item of category.saleItems) {
			result.push(item);
		}
	}
	return result;
}