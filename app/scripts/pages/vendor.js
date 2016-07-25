tracker.sendAppView('Vendor');
logger.disable();
initUi();

function makeSaleItem(itemHash, acquired, saleItem) {
	var item = makeItem(saleItem.item, unlockFlag);
	var itemDef = getItemDefinition(itemHash);
	var unlockFlag = false;
	if (acquired) {
		// console.log(itemData, DestinyUnlockFlagDefinition[acquired.unlockFlagHash], saleItem);
		if (acquired.isSet === false) {
			item.children[0].classList.add("undiscovered")
		}
		unlockFlag = DestinyVendorDefinition[lastVendor].failureStrings[saleItem.failureIndexes[0] || -1];
		if (!unlockFlag) {
			unlockFlag = DestinyUnlockFlagDefinition[acquired.unlockFlagHash].displayName;
			if (!DestinyUnlockFlagDefinition[acquired.unlockFlagHash].displayName) {
				if (itemDef.sourceHashes) {
					unlockFlag = DestinyRewardSourceDefinition[itemDef.sourceHashes[0]].description;
				} else {
					unlockFlag = "";
				}
			}
		}
	}
	return item;
}

function makeItemsFromVendor(vendor) {
	var list = vendor.saleItemCategories;
	var mainContainer = document.getElementById("history");
	// var categories = emblemData.data.vendor.saleItemCategories;
	// var vendorCategory = outfitterData.data.vendor.saleItemCategories[0];
	if (vendor.nextRefreshDate) {
		var resetDate = document.createElement("div");
		resetDate.classList.add("sub-section");
		resetDate.innerHTML = "<h1>Vendor will reset " + moment(vendor.nextRefreshDate).fromNow() + "</h1>";
		mainContainer.appendChild(resetDate);
	}
	for (var category of list) {
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<h1>" + category.categoryTitle + "</h1>";
		mainContainer.appendChild(titleContainer);
		var subContainer = document.createElement("div");
		subContainer.classList.add("sub-section");
		var docfrag = document.createDocumentFragment();
		for (var saleItem of category.saleItems) {
			docfrag.appendChild(makeSaleItem(saleItem.item.itemHash, saleItem.unlockStatuses[0], saleItem));
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
		} else if (document.getElementById("vendor").value !== "None") {
			getVendor(document.getElementById("vendor").value);
		}
	});
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
			makeItemsFromVendor(response.Response.data.vendor);
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
					categoryTitle: vendorName + " reset " + moment(responseMain.Response.data.vendor.nextRefreshDate).fromNow(),
					saleItems: []
				}, {
					categoryTitle: compareName + " reset " + moment(responseCompare.Response.data.vendor.nextRefreshDate).fromNow(),
					saleItems: []
				}];
				var vendor = {
					saleItemCategories: saleItemCategories
				};
				for (var compareItem of flattenedCompareItems) {
					for (var vendorItem of flattenedVendorItems) {
						if (compareItem.item.itemHash === vendorItem.item.itemHash) {
							saleItemCategories[0].saleItems.push(vendorItem);
							saleItemCategories[1].saleItems.push(compareItem);
						}
					}
				}
				// console.log(response, response.Response && response.Response.data, DestinyVendorDefinition[lastVendor]);
				makeItemsFromVendor(vendor);
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