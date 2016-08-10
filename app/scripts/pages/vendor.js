tracker.sendAppView('Vendor');
logger.disable();

var saleItemStatuses = [
	"Success",
	"Not Enough Space",
	"NoFunds",
	"NoProgression",
	"NoUnlock",
	"NoQuantity",
	"OutsidePurchaseWindow",
	"NotAvailable",
	"Can't carry more of those",
	"UnknownError",
	"AlreadySelling",
	"Unsellable",
	"SellingInhibited",
	"AlreadyOwned",
];
var cannotEquipReason = [
	"None",
	"ItemUnequippable",
	"ItemUniqueEquipRestricted",
	"ItemFailedUnlockCheck",
	"ItemFailedLevelCheck",
	"ItemNotOnCharacter"
];

function makeSaleItem(itemHash, unlockStatuses, saleItem, currencies) {
	var itemDef = getItemDefinition(itemHash);
	var unlockFlag = "";
	var acquired = unlockStatuses.length;
	for (var unlockStatus of unlockStatuses) {
		if (unlockStatus.isSet === true) {
			acquired--;
		}
	}
	var vendorItem = -1;
	for (var vendorDefinitionItem of DestinyVendorDefinition[lastVendor].sales) {
		if (vendorDefinitionItem.itemHash === saleItem.item.itemHash) {
			vendorItem = vendorDefinitionItem.failureIndexes;
			break;
		}
	}
	unlockFlag = DestinyVendorDefinition[lastVendor].failureStrings[saleItem.failureIndexes[0] || vendorItem[0] || -1];
	if (unlockFlag === undefined || unlockFlag === "" || (lastVendor === 570929315 && saleItem.failureIndexes.length === 0)) {
		// unlockFlag = "";
	} else {

		if (!Array.isArray(unlockFlag)) {
			unlockFlag = [];
		}
		let list = saleItem.failureIndexes;
		if (vendorItem.length > list.length) {
			list = vendorItem;
		}
		for (let i = 0; i < list.length; i++) {
			let failureIndex = list[i];
			let isSet = true;
			if (unlockStatuses[i]) {
				isSet = unlockStatuses[i].isSet;
			}
			if (DestinyVendorDefinition[lastVendor].failureStrings[failureIndex]) {
				if (lastVendor === 570929315 && (failureIndex === 0 || failureIndex === 1)) {
					acquired++;
					isSet = false;
				}
				unlockFlag.push({
					description: DestinyVendorDefinition[lastVendor].failureStrings[failureIndex],
					isSet: isSet
				});
			}
		}
	}
	if (unlockStatuses[0] === undefined || !DestinyUnlockFlagDefinition[saleItem.requiredUnlockFlags[0]].displayName) {
		// if (itemDef.sourceHashes) {
		// 	unlockFlag = DestinyRewardSourceDefinition[itemDef.sourceHashes[0]].description;
		// } else {
		// }
		// unlockFlag = "";
	} else {
		if (!Array.isArray(unlockFlag)) {
			unlockFlag = [];
		}
		let list = saleItem.requiredUnlockFlags;
		for (let i = 0; i < list.length; i++) {
			let failureIndex = list[i];
			let isSet = false;
			if (unlockStatuses[i]) {
				isSet = unlockStatuses[i].isSet;
			}
			if (DestinyUnlockFlagDefinition[failureIndex].displayName) {
				unlockFlag.push({
					description: DestinyUnlockFlagDefinition[failureIndex].displayName,
					isSet: isSet
				});
			}
		}
	}
	if (saleItem.itemStatus !== 0) {
		if (unlockFlag === "" || unlockFlag === undefined) {
			unlockFlag = [];
		}
		if (Array.isArray(unlockFlag)) {
			let numberString = saleItem.itemStatus.toString(2);
			for (let i = 0; i < numberString.length; i++) {
				if (numberString[i] !== "0") {
					acquired++;
					unlockFlag.push({
						description: saleItemStatuses[numberString.length - i],
						isSet: false
					});
				}
			}
		}
	}
	if (saleItem.item.cannotEquipReason) {
		if (unlockFlag === "" || unlockFlag === undefined) {
			unlockFlag = [];
		}
		if (Array.isArray(unlockFlag)) {
			let numberString = saleItem.item.cannotEquipReason.toString(2);
			for (let i = 0; i < numberString.length; i++) {
				if (numberString[i] !== "0") {
					var description = cannotEquipReason[numberString.length - i];
					if (description === "ItemFailedUnlockCheck") {
						if (!itemDef.classType) {
							description = `Requires Titan Class`;
						}
						if (itemDef.classType === 1) {
							description = `Requires Hunter Class`;
						}
						if (itemDef.classType === 2) {
							description = `Requires Warlock Class`;
						}
					}
					// acquired++;
					unlockFlag.push({
						description: description,
						isSet: false
					});
				}
			}
		}
	}
	var costs = [];
	if (currencies) {
		for (var cost of saleItem.costs) {
			var currencyTotal = currencies[cost.itemHash];
			if (typeof currencyTotal !== "number") {
				currencyTotal = 0;
				for (var item of newInventories[selectedCharacter]) {
					if (item.itemHash === cost.itemHash) {
						currencyTotal = item.stackSize;
						break;
					}
				}
			}
			costs.push({
				itemHash: cost.itemHash,
				value: cost.value,
				total: currencyTotal
			});
		}
	}
	var item = makeItem(saleItem.item, unlockFlag, costs);
	if (acquired !== 0) {
		item.children[0].classList.add("undiscovered");
	}
	return item;
}

function pad(pad, str, padLeft) {
	if (typeof str === 'undefined')
		return pad;
	if (padLeft) {
		return (pad + str).slice(-pad.length);
	} else {
		return (str + pad).substring(0, pad.length);
	}
}

function makeItemsFromVendor(vendor) {
	var list = vendor.saleItemCategories;
	var mainContainer = document.getElementById("history");
	// var categories = emblemData.data.vendor.saleItemCategories;
	// var vendorCategory = outfitterData.data.vendor.saleItemCategories[0];
	if (vendor.nextRefreshDate) {
		var resetDate = document.createElement("div");
		resetDate.classList.add("sub-section", "resetDate");
		var days = moment(vendor.nextRefreshDate).diff(moment(), "days");
		var hours = pad(Array(3).join("0"), moment(vendor.nextRefreshDate).diff(moment(), "hours") % 24, true);
		var minutes = pad(Array(3).join("0"), moment(vendor.nextRefreshDate).diff(moment(), "minutes") % 60, true);
		var seconds = pad(Array(3).join("0"), moment(vendor.nextRefreshDate).diff(moment(), "seconds") % 60, true);
		resetDate.innerHTML = "<h1>STOCK REFRESH " + `${days} ${(days > 1)? "Days" : "Day"} ${hours}:${minutes}:${seconds}` + "</h1>";
		resetDate.dataset.date = vendor.nextRefreshDate;
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
			docfrag.appendChild(makeSaleItem(saleItem.item.itemHash, saleItem.unlockStatuses, saleItem, vendor.currencies));
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

var deadVendors = [415161769, 863056813, 3019290222, 2698860028, 1660667815, 1588933401, 2586808090, 1653856985, 529545063, 1353750121, 4275962006, 163657562, 3898086963, 3165969428, 892630493, 2016602161];
var selectedCharacter = localStorage.newestCharacter;
var lastVendor = "";

chrome.storage.local.get("inventories", function(data) {
	if (chrome.runtime.lastError) {
		logger.error(chrome.runtime.lastError);
	}
	newInventories = data.inventories;
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
});

function getVendor(hash) {
	var mainContainer = document.getElementById("history");
	mainContainer.innerHTML = "";
	lastVendor = parseInt(hash);
	selectedCharacter = document.getElementById("character").value;
	document.getElementById("compare").value = "None";
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).catch(function(err) {
		if (err) {
			logger.error(err);
		}
	}).then(function(response) {
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
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).catch(function(err) {
		if (err) {
			logger.error(err);
		}
	}).then(function(responseMain) {
		bungie.getVendorForCharacter(selectedCharacter, compareHash).catch(function(err) {
			if (err) {
				logger.error(err);
			}
		}).then(function(responseCompare) {
			if (responseMain.Response && responseCompare.Response) {
				var vendorSaleItems = responseMain.Response.data.vendor.saleItemCategories;
				var vendorName = DestinyVendorDefinition[responseMain.Response.data.vendor.vendorHash].summary.vendorName;
				var compareName = DestinyVendorDefinition[responseCompare.Response.data.vendor.vendorHash].summary.vendorName;
				var compareSaleItems = responseCompare.Response.data.vendor.saleItemCategories;
				var flattenedVendorItems = flattenItems(vendorSaleItems);
				var flattenedCompareItems = flattenItems(compareSaleItems);
				var currencies = {};
				if (Object.keys(responseMain.Response.data.vendor.currencies).length > 0) {
					currencies = responseMain.Response.data.vendor.currencies;
				}
				if (Object.keys(responseCompare.Response.data.vendor.currencies).length > 0) {
					currencies = responseCompare.Response.data.vendor.currencies;
				}
				var saleItemCategories = [{
					categoryTitle: vendorName + " reset " + moment(responseMain.Response.data.vendor.nextRefreshDate).fromNow(),
					saleItems: []
				}, {
					categoryTitle: compareName + " reset " + moment(responseCompare.Response.data.vendor.nextRefreshDate).fromNow(),
					saleItems: []
				}];
				var vendor = {
					currencies: currencies,
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

initUi();

function dateTime() {
	var dates = document.querySelectorAll(".resetDate");
	for(var date of dates) {
		var vendorDate = moment(date.dataset.date);
		var now = moment();
		var days = vendorDate.diff(now, "days");
		var hours = pad(Array(3).join(" "), vendorDate.diff(now, "hours") % 24, true);
		var minutes = pad(Array(3).join(" "), vendorDate.diff(now, "minutes") % 60, true);
		var seconds = pad(Array(3).join(" "), vendorDate.diff(now, "seconds") % 60, true);
		date.innerHTML = "<h1>STOCK REFRESH " + `${days} ${(days > 1)? "Days" : "Day"} ${hours}:${minutes}:${seconds}` + "</h1>";
	}
	window.requestAnimationFrame(dateTime);
}
window.requestAnimationFrame(dateTime);