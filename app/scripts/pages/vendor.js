tracker.sendAppView('Vendor');
getAllOptions().then(function(options) {
	globalOptions = options;
	tags.update();
});
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
const manualVendorHashMap = {
	"3746647075": [24705361, 1895808083, 253884812], // crucible handler
	"3658200622": [24705361, 1895808083, 253884812], // crucible quartermaster
	"4269570979": [1220331761], // cryptarch
	"1303406887": [1220331761], // cryptarch
	"2190824863": [1220331761], // cryptarch
	"3611686524": [2525408946, 3415213788, 520485989], // dead orbit
	"1808244981": [197052627, 3550485241, 596540126], // new monarchy
	"174528503": [2057772486], // eris morn
	"1410745145": [1986053430], // queens wrath
	"1998812735": [283961095], // house of judgement
	"1821699360": [2347072494, 3999459672, 239142937], // future war cult
	"2668878854": [3563588106, 3389480343, 2218157060], // vanguard quartermaster
	"1575820975": [3563588106, 3389480343, 2218157060], // warlock
	"3003633346": [3563588106, 3389480343, 2218157060], // hunter
	"1990950": [3563588106, 3389480343, 2218157060], // titan
};

function makeSaleItem(itemHash, unlockStatuses, saleItem, currencies) {
	var itemDef = getItemDefinition(itemHash, saleItem.item);
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
				var inventory = findInArray(newInventories, "characterId", selectedCharacter);
				for (let item of inventory.inventory || []) {
					// for (var item of newInventories[selectedCharacter]) {
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
	if (!saleItem.item.primaryStat && itemDef.itemCategoryHashes) {
		if (itemDef.itemCategoryHashes.indexOf(1) > -1) {
			saleItem.item.primaryStat = {
				value: 350,
				statHash: 368428387
			};
		} else if (itemDef.itemCategoryHashes.indexOf(20) > -1) {
			saleItem.item.primaryStat = {
				value: 350,
				statHash: 209426660
			};
		}
	}
	var item = makeItem(saleItem.item, unlockFlag, costs);
	if (acquired !== 0) {
		item.children[0].classList.add("undiscovered");
	}
	return item;
}

function makeItemsFromVendor(vendor) {
	var list = vendor.saleItemCategories;
	var mainContainer = document.getElementById("history");
	var localVendor = {};
	for (let vendorType of vendors) {
		for (let vendorDescription of vendorType) {
			if (vendorDescription.vendorHash === vendor.vendorHash) {
				localVendor = vendorDescription;
			}
		}
	}
	// var categories = emblemData.data.vendor.saleItemCategories;
	// var vendorCategory = outfitterData.data.vendor.saleItemCategories[0];
	if (localVendor.vendorName) {
		var vendorContainer = document.createElement("div");
		var vendorName = document.createElement("h1");
		var vendorDescription = document.createElement("h3");
		vendorName.textContent = localVendor.vendorName;
		vendorDescription.textContent = localVendor.vendorDescription;
		vendorContainer.classList.add("sub-section", "vendor-title");
		vendorContainer.appendChild(vendorName);
		vendorContainer.appendChild(vendorDescription);
		if (vendor.nextRefreshDate) {
			var resetDate = document.createElement("h2");
			resetDate.innerHTML = date.vendorRefreshDate(vendor);
			vendorContainer.appendChild(resetDate);
		}
		mainContainer.appendChild(vendorContainer);
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
			var itemDef = getItemDefinition(saleItem.item.itemHash, saleItem.item);
			if (!saleItem.item.primaryStat && itemDef.itemCategoryHashes) {
				if (itemDef.itemCategoryHashes.indexOf(1) > -1) {
					saleItem.item.primaryStat = {
						value: 350,
						statHash: 368428387
					};
				} else if (itemDef.itemCategoryHashes.indexOf(20) > -1) {
					saleItem.item.primaryStat = {
						value: 350,
						statHash: 209426660
					};
				}
			}
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
	if (!manualVendorHashMap[localVendor.vendorHash]) {
		elements.status.classList.remove("active");
		return;
	}
	for (var packageHash of manualVendorHashMap[localVendor.vendorHash]) {
		for (var singlePackage of localVendor.packages) {
			if (packageHash === singlePackage.itemHash) {
				var vendorPackage = singlePackage && singlePackage.derivedItemCategories || [];
				for (let category of vendorPackage) {
					if (category.items.length) {
						// for (var e = 0; e < vendorPackage.length - 1; e++) {
						// var category = vendorPackage[e];
						let titleContainer = document.createElement("div");
						titleContainer.classList.add("sub-section");
						titleContainer.innerHTML = "<h2>" + singlePackage.itemName + " - " + category.categoryDescription + "</h2>";
						mainContainer.appendChild(titleContainer);
						let subContainer = document.createElement("div");
						subContainer.classList.add("sub-section");
						let docfrag = document.createDocumentFragment();
						for (let item of category.items) {
							docfrag.appendChild(makeItem(getItemDefinition(item.itemHash, item)));
						}
						subContainer.appendChild(docfrag);
						mainContainer.appendChild(subContainer);
					}
				}
			}
		}
	}
	elements.status.classList.remove("active");
	// if (localVendor.packages.length) {
	// 	var category = localVendor.packages[0].derivedItemCategories[localVendor.packages[0].derivedItemCategories.length - 1];
	// 	let textContainer = document.createElement("div");
	// 	textContainer.classList.add("sub-section");
	// 	textContainer.innerHTML = "<h2>" + singlePackage.itemName + " - " + category.categoryDescription + "</h2>";
	// 	mainContainer.appendChild(textContainer);
	// 	let subSection = document.createElement("div");
	// 	subSection.classList.add("sub-section");
	// 	let itemFrag = document.createDocumentFragment();
	// 	for (let item of category.items) {
	// 		itemFrag.appendChild(makeItem(getItemDefinition(item.itemHash, item)));
	// 	}
	// 	subSection.appendChild(itemFrag);
	// 	mainContainer.appendChild(subSection);
	// }
}

function listContainsItem(list, itemHash) {
	for (var item of packageCategory.items) {
		if (item.itemHash === itemHash) {
			return true;
		}
	}
	return false;
}

function compressPackages(packages) {
	var itemHashes = [];
	for (let packageInfo of packages) {
		var derivedItemCategories = [];
		var index = 0;
		for (let packageCategory of packageInfo.derivedItemCategories) {
			derivedItemCategories[index] = {
				categoryDescription: packageCategory.categoryDescription,
				items: []
			};
			for (var item of packageCategory.items) {
				if (itemHashes.indexOf(item.itemHash) === -1) {
					itemHashes.push(item.itemHash);
					derivedItemCategories[index].items.push(item);
				}
			}
			index++;
		}
		packageInfo.derivedItemCategories = derivedItemCategories;
	}
	return packages;
	derivedItemCategories[0] = {
		categoryDescription: package.derivedItemCategories[0].categoryDescription,
		items: []
	};
	let guaranteedText = derivedItemCategories[0].categoryDescription.split(" ");
	for (let packageCategory of package.derivedItemCategories) {
		if (packageCategory.categoryDescription.indexOf(guaranteedText) === -1) {
			derivedItemCategories[1] = {
				categoryDescription: packageCategory.categoryDescription,
				items: []
			};
			break;
		}
	}
	let possibleText = derivedItemCategories[1].categoryDescription.split(" ");
	for (let packageCategory of package.derivedItemCategories) {
		if (packageCategory.categoryDescription.indexOf(guaranteedText) > -1) {
			for (let item of packageCategory.items) {
				if (listContainsItem(derivedItemCategories[0].items, item.itemHash) === false) {
					derivedItemCategories[0].items.push(item);
				}
			}
		}
		if (packageCategory.categoryDescription.indexOf(possibleText) > -1) {
			for (let item of packageCategory.items) {
				if (listContainsItem(derivedItemCategories[1].items, item.itemHash) === false) {
					derivedItemCategories[1].items.push(item);
				}
			}
		}
	}
	// console.log(derivedItemCategories);
	return derivedItemCategories;
}

function addPackagesToVendors() {
	var packages = [];
	for (let vendorType of vendors) {
		for (let vendor of vendorType) {
			vendor.packages = [];
			for (let vendorHash in manualVendorHashMap) {
				if (vendor.vendorHash === parseInt(vendorHash)) {
					for (let itemDefinition of DestinyCompactItemDefinition) {
						// console.log(itemDefinition);
						if (itemDefinition.itemTypeName === "Package" && itemDefinition.derivedItemCategories && itemDefinition.derivedItemVendorHash && manualVendorHashMap[vendorHash].indexOf(itemDefinition.itemHash) > -1) {
							// itemDefinition.derivedItemCategories = compressPackage(itemDefinition);
							vendor.packages.push(itemDefinition);
						}
					}
				}
			}
			vendor.packages = compressPackages(vendor.packages);
		}
	}
}

var deadVendors = [415161769, 863056813, 3019290222, 2698860028, 1660667815, 1588933401, 2586808090, 1653856985, 529545063, 1353750121, 4275962006, 163657562, 3898086963, 3165969428, 892630493, 2016602161];
var selectedCharacter = localStorage.newestCharacter;
var lastVendor = "";
var vendors = {};
database.open().then(function() {
	database.getAllEntries("inventories").then(function(data) {
		// chrome.storage.local.get("inventories", function(data) {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
		}
		newInventories = data.inventories;
		tags.cleanup(data.inventories);
		refreshCharacterData().then(function() {
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
						if (categoryHash !== 700) {
							if (!vendors[categoryHash]) {
								vendors[categoryHash] = [];
							}
							vendors[categoryHash].push(vendor.summary);
						}
					}
					if (vendor.summary.vendorSubcategoryHash && vendor.summary.vendorSubcategoryHash !== 700) {
						if (!vendors[vendor.summary.vendorSubcategoryHash]) {
							vendors[vendor.summary.vendorSubcategoryHash] = [];
						}
						vendors[vendor.summary.vendorSubcategoryHash].push(vendor.summary);
					}
				} else {
					// vendors.other.push(vendor.summary);
				}
			}
			for (let vendorCategory in vendors) {
				vendors[vendorCategory].sort(function(a, b) {
					var textA = a.vendorName.toUpperCase();
					var textB = b.vendorName.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});
			}
			addPackagesToVendors();
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
			elements.status.classList.remove("active");
		});
	});
});

function getVendor(hash) {
	tracker.sendEvent('Vendor', 'Get', DestinyVendorDefinition[hash] && DestinyVendorDefinition[hash].summary.vendorName || hash);
	elements.status.classList.add("active");
	var mainContainer = document.getElementById("history");
	mainContainer.innerHTML = "";
	lastVendor = parseInt(hash);
	selectedCharacter = document.getElementById("character").value;
	document.getElementById("compare").value = "None";
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).catch(function(err) {
		if (err) {
			console.error(err);
		}
	}).then(function(vendorData) {
		if (vendorData && vendorData.vendorHash) {
			console.log(vendorData, DestinyVendorDefinition[lastVendor]);
			document.getElementById("history").innerHTML = "";
			makeItemsFromVendor(vendorData);
		} else {
			document.getElementById("history").innerHTML = `<h2>${vendorData.Message}</h2>`;
			console.log(lastVendor);
			elements.status.classList.remove("active");
		}
	});
}

function compareVendor(vendorHash, compareHash) {
	tracker.sendEvent('Vendor', 'Compare', vendorHash + '-' + compareHash);
	elements.status.classList.add("active");
	var mainContainer = document.getElementById("history");
	mainContainer.innerHTML = "";
	lastVendor = parseInt(vendorHash);
	selectedCharacter = document.getElementById("character").value;
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).catch(function(err) {
		if (err) {
			console.error(err);
		}
	}).then(function(responseMain) {
		bungie.getVendorForCharacter(selectedCharacter, compareHash).catch(function(err) {
			if (err) {
				console.error(err);
			}
		}).then(function(responseCompare) {
			if (responseMain.vendorHash && responseCompare.vendorHash) {
				var vendorSaleItems = responseMain.saleItemCategories;
				var vendorName = DestinyVendorDefinition[responseMain.vendorHash].summary.vendorName;
				var compareName = DestinyVendorDefinition[responseCompare.vendorHash].summary.vendorName;
				var compareSaleItems = responseCompare.saleItemCategories;
				var flattenedVendorItems = flattenItems(vendorSaleItems);
				var flattenedCompareItems = flattenItems(compareSaleItems);
				var currencies = {};
				if (Object.keys(responseMain.currencies).length > 0) {
					currencies = responseMain.currencies;
				}
				if (Object.keys(responseCompare.currencies).length > 0) {
					currencies = responseCompare.currencies;
				}
				var saleItemCategories = [{
					categoryTitle: vendorName + " reset " + moment(responseMain.nextRefreshDate).fromNow(),
					saleItems: []
				}, {
					categoryTitle: compareName + " reset " + moment(responseCompare.nextRefreshDate).fromNow(),
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

initUi(document.body);

window.requestAnimationFrame(date.keepDatesUpdated);