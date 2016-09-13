var elements = {
	date: document.getElementById("date"),
	added: document.getElementById("added"),
	removed: document.getElementById("removed"),
	transferred: document.getElementById("transferred"),
	progression: document.getElementById("progression"),
	trackingItem: document.getElementById("trackingItem"),
	status: document.getElementById("status"),
	container: document.getElementById("container"),
	tooltip: document.getElementById("tooltip"),
	itemImage: document.getElementById("item-image"),
	squareProgress: document.getElementById("squareProgress"),
	itemName: document.getElementById("item-name"),
	itemType: document.getElementById("item-type"),
	itemRarity: document.getElementById("item-rarity"),
	levelText: document.getElementById("level-text"),
	itemRequiredEquipLevel: document.getElementById("item-required-equip-level"),
	itemPrimaryStat: document.getElementById("item-primary-stat"),
	itemStatText: document.getElementById("item-stat-text"),
	itemDescription: document.getElementById("item-description"),
	itemCompare: document.getElementById("item-compare"),
	compareTable: document.getElementById("compare-table"),
	classRequirement: document.getElementById("class-requirement"),
	statTable: document.getElementById("stat-table"),
	nodeTable: document.getElementById("node-table"),
	costTable: document.getElementById("cost-table"),
	ToCReminder: document.getElementById("ToCReminder"),
	toggleSystem: document.getElementById("toggleSystem"),
	autoLock: document.getElementById("autoLock"),
	track3oC: document.getElementById("track3oC"),
	paginate: document.getElementById("paginate"),
	showQuality: document.getElementById("showQuality"),
	useGuardianLight: document.getElementById("useGuardianLight"),
	lockHighLight: document.getElementById("lockHighLight"),
	version: document.getElementById("version")
};

var elementNames = {
	itemImage: "item-image",
	itemName: "item-name",
	itemType: "item-type",
	itemRarity: "item-rarity",
	levelText: "level-text",
	itemRequiredEquipLevel: "item-required-equip-level",
	itemPrimaryStat: "item-primary-stat",
	itemStatText: "item-stat-text",
	itemDescription: "item-description",
	itemCompare: "item-compare",
	classRequirement: "class-requirement",
	statTable: "stat-table",
	nodeTable: "node-table",
	costTable: "cost-table",
	compareTable: "compare-table"
};

var currentItemSet = [];

function initUi() {
	for (var elementName in elements) {
		if (elementNames[elementName]) {
			elements[elementName] = document.getElementById(elementNames[elementName]);
		} else {
			elements[elementName] = document.getElementById(elementName);
		}
	}
	var manifest = chrome.runtime.getManifest();
	if (typeof manifest.key === "undefined") {
		if (elements.version) {
			elements.version.textContent = (manifest.version_name);
		}
	}
	var reloadButtons = document.querySelectorAll(".reload");
	for (var reloadButton of reloadButtons) {
		reloadButton.addEventListener("click", function reloadBackgroundPage() {
			chrome.runtime.getBackgroundPage(function(bp) {
				bp.location.reload();
			});
		});
	}
	if (elements.container) {
		elements.container.addEventListener("mouseover", function(event) {
			var target = null;
			if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
				target = event.target;
			} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
				target = event.target.parentNode;
			} else if (event.target.parentNode.classList.contains("item-container")) {
				target = event.target.parentNode.children[0];
			}
			if (target && target !== previousElement) {
				// elements.tooltip.classList.add("hidden");
				previousElement = target;
				handleTooltipData(target.dataset, target, event);
			}
			if (!target) {
				clearTimeout(tooltipTimeout);
				// elements.tooltip.classList.add("hidden");
				previousElement = null;
			}
		}, true);
	}
	if (elements.ToCReminder) {
		getOption("track3oC").then(function(track3oC) {
			if (track3oC === false) {
				elements.ToCReminder.value = "Turn on 3oC reminder";
				elements.ToCReminder.classList.add("grey");
				elements.ToCReminder.classList.remove("green");
			}
			elements.ToCReminder.addEventListener("click", function(event) {
				getOption("track3oC").then(function(track3oC) {
					if (track3oC === false) {
						setOption("track3oC", true);
						elements.ToCReminder.value = "Turn off 3oC reminder";
						elements.ToCReminder.classList.remove("grey");
						elements.ToCReminder.classList.add("green");
					} else {
						setOption("track3oC", false);
						elements.ToCReminder.value = "Turn on 3oC reminder";
						elements.ToCReminder.classList.add("grey");
						elements.ToCReminder.classList.remove("green");
					}
				});
			}, false);
		});
	}
	if (elements.toggleSystem) {
		getOption("activeType").then(function(activeType) {
			if (bungie.getMemberships().length > 1) {
				elements.toggleSystem.classList.remove("hidden");
			}
			if (activeType === "xbl") {
				elements.toggleSystem.value = "Swap to PSN";
				elements.toggleSystem.classList.remove("green");
			}
			if (activeType === "psn") {
				elements.toggleSystem.value = "Swap to XBOX";
				elements.toggleSystem.classList.add("green");
			}
			elements.toggleSystem.addEventListener("click", function() {
				getOption("activeType").then(function(activeType) {
					if (activeType === "psn") {
						elements.toggleSystem.value = "Swap to PSN";
						elements.toggleSystem.classList.remove("green");
						setOption("activeType", "xbl");
					} else {
						elements.toggleSystem.value = "Swap to Xbox";
						elements.toggleSystem.classList.add("green");
						setOption("activeType", "psn");
					}
				});
			}, false);
		});
	}
	// Disable all accurrate tracking
	// if (document.querySelector("#accurateTracking")) {
	// 	var accurateTrackingDiv = document.querySelector("#accurateTracking");
	// 	if (localStorage.accurateTracking === "true") {
	// 		accurateTrackingDiv.value = "disable accurate tracking";
	// 		accurateTrackingDiv.classList.remove("grey");
	// 		accurateTrackingDiv.classList.add("green");
	// 	}
	// 	accurateTrackingDiv.addEventListener("click", function(event) {
	// 		if (localStorage.accurateTracking === "false") {
	// 			var confirmation = window.confirm("This tracking will move items from your guardian to the vault and back.\n Make sure you have a stack of ideally 500 armor or weapon parts for minimal interruption. 200 is the minimal acceptance.\n\n This feature is known to cause issues with full vaults, or inventories with low consumables / materials.\n If you split your inventories between all three characters, this feature is completely safe to enable.\n\n Press OK to track items within 20 seconds of accuracy. Press cancel to retain within 60 seconds of accuracy.");
	// 			if (confirmation) {
	// 				localStorage.accurateTracking = "true";
	// 				accurateTrackingDiv.value = "disable accurate tracking";
	// 				accurateTrackingDiv.classList.remove("grey");
	// 				accurateTrackingDiv.classList.add("green");
	// 			}
	// 		} else {
	// 			localStorage.accurateTracking = "false";
	// 			accurateTrackingDiv.value = "enable accurate tracking";
	// 			accurateTrackingDiv.classList.add("grey");
	// 			accurateTrackingDiv.classList.remove("green");
	// 		}

	// 	}, false);
	// }
	var secretLinks = document.querySelectorAll(".admin");
	if (secretLinks.length) {
		if (!chrome.runtime.getManifest().key) {
			for (var link of secretLinks) {
				link.classList.remove("hidden");
			}
		}
	}
	getAllOptions().then(function(options) {
		if (elements.autoLock) {
			elements.autoLock.checked = options.autoLock === true;
			elements.autoLock.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.track3oC) {
			elements.track3oC.checked = options.track3oC === true;
			elements.track3oC.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.showQuality) {
			elements.showQuality.checked = options.showQuality === true;
			elements.showQuality.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.useGuardianLight) {
			elements.useGuardianLight.checked = options.useGuardianLight === true;
			elements.useGuardianLight.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.lockHighLight) {
			elements.lockHighLight.checked = options.lockHighLight === true;
			elements.lockHighLight.addEventListener("change", handleCheckboxChange, false);
		}
	});
}

function handleCheckboxChange(event) {
	setOption(event.target.id, event.target.checked);
}

function makePages() {
	if (elements.paginate && oldItemChangeQuantity !== currentItemSet.length) {
		while (elements.paginate.lastChild) {
			elements.paginate.removeChild(elements.paginate.lastChild);
		}
		var tempContainer = document.createDocumentFragment();
		for (let i = 0; i < Math.ceil(currentItemSet.length / pageQuantity); i++) {
			var option = document.createElement("option");
			option.value = i;
			if (i === pageNumber) {
				option.selected = true;
			}
			option.textContent = `Page ${i+1}`;
			tempContainer.appendChild(option);
		}
		elements.paginate.appendChild(tempContainer);
		elements.paginate.addEventListener("change", function() {
			pageNumber = parseInt(elements.paginate.value, 10);
			notificationCooldown = 0;
		}, false);
	}
}

var pageQuantity = 50;
var pageNumber = 0;
var oldItemChangeQuantity = 0;
var oldPageNumber = -1;
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
	if (list1Length < 25 && list2Length < 25 && list3Length < 25 && list4Length < 25) {
		return "six-rows";
	}
	if (list1Length < 29 && list2Length < 29 && list3Length < 29 && list4Length < 29) {
		return "seven-rows";
	}
	if (list1Length < 33 && list2Length < 33 && list3Length < 33 && list4Length < 33) {
		return "eight-rows";
	}
	if (list1Length < 37 && list2Length < 37 && list3Length < 37 && list4Length < 37) {
		return "nine-rows";
	}
	if (list1Length < 41 && list2Length < 41 && list3Length < 41 && list4Length < 41) {
		return "ten-rows";
	}
	if (list1Length < 45 && list2Length < 45 && list3Length < 45 && list4Length < 45) {
		return "eleven-rows";
	}
	if (list1Length < 49 && list2Length < 49 && list3Length < 49 && list4Length < 49) {
		return "twelve-rows";
	}
	if (list1Length < 53 && list2Length < 53 && list3Length < 53 && list4Length < 53) {
		return "thirteen-rows";
	}
	return "thirteen-rows";
}

function createItems(itemDiff, className, moveType, searchData) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className);
	subContainer.dataset.index = itemDiff.id;
	var docfrag = document.createDocumentFragment();
	if (itemDiff[moveType]) {
		for (var i = 0; i < itemDiff[moveType].length; i++) {
			var itemData = itemDiff[moveType][i];
			if (itemData.item) {
				itemData = itemData.item;
			}
			itemData = JSON.parse(itemData);
			docfrag.appendChild(makeItem(itemData, characterSource(itemDiff, moveType, i)));
		}
	}
	subContainer.appendChild(docfrag);
	for (var typeInfo in searchData) {
		subContainer.dataset[typeInfo] = searchData[typeInfo];
	}
	return subContainer;
}

function createProgress(itemDiff, className, moveType, searchData) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className);
	subContainer.dataset.index = itemDiff.id;
	if (itemDiff[moveType]) {
		var docfrag = document.createDocumentFragment();
		for (var i = 0; i < itemDiff[moveType].length; i++) {
			var itemData = itemDiff[moveType][i];
			if (itemData.item) {
				itemData = itemData.item;
			}
			itemData = JSON.parse(itemData);
			docfrag.appendChild(makeProgress(itemData, characterSource(itemDiff, moveType, i)));
		}
		subContainer.appendChild(docfrag);
	}
	for (var typeInfo in searchData) {
		subContainer.dataset[typeInfo] = searchData[typeInfo];
	}
	return subContainer;
}

function createDate(itemDiff, className, searchData) {
	var timestamp = itemDiff.timestamp;
	var activity = "";
	var activityType = "";
	if (itemDiff.match) {
		var match = JSON.parse(itemDiff.match);
		activity = match.activityHash;
		activityType = match.activityTypeHashOverride || DestinyActivityDefinition[match.activityHash].activityTypeHash;
	}
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className, "timestamp");

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
			subContainer.style.backgroundImage = `url(http://www.bungie.net${activityDef.pgcrImage})`;
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
	for (var typeInfo in searchData) {
		subContainer.dataset[typeInfo] = searchData[typeInfo];
	}
	return subContainer;
}

var lastIndex = -1;
var pages = ["added", "removed", "progression", "transferred", "date"];
var fragments = {};
for (let page of pages) {
	fragments[page] = document.createDocumentFragment();
}

function getInfo(item, itemDef, attribute) {
	if (!item[attribute]) {
		return itemDef[attribute];
	}
	return item[attribute];
}

var searchTypes = searchTypes || false;

function work(item, index) {
	// logger.startLogging("UI");
	if (lastIndex < index) {
		if (!item.added) {
			console.log(item);
		}
		var searchData = {};
		if (searchTypes) {
			for (let page of pages) {
				if (item[page]) {
					for (var type of searchTypes) {
						for (let itemData of item[page]) {
							if (itemData.item) {
								itemData = itemData.item;
							}
							itemData = JSON.parse(itemData);
							var itemTypeValue = "";
							let itemDefinition = null;
							if (itemData.itemHash) {
								itemDefinition = getItemDefinition(itemData.itemHash);
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
							if (typeof nodeValue === "string") {
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
		var addedQty = item.added.length;
		var removedQty = item.removed.length;
		var progressionQty = 0;
		if (item.progression) {
			progressionQty = item.progression.length;
		}
		var transferredQty = 0;
		if (item.transferred) {
			transferredQty = item.transferred.length;
		}
		var className = rowHeight(addedQty, removedQty, transferredQty, progressionQty);
		lastIndex = index;
		fragments.date.insertBefore(createDate(item, className, searchData), fragments.date.firstChild);
		fragments.progression.insertBefore(createProgress(item, className, "progression", searchData), fragments.progression.firstChild);
		for (let page of pages) {
			if (page !== "date" && page !== "progression") {
				fragments[page].insertBefore(createItems(item, className, page, searchData), fragments[page].firstChild);
			}
		}
	}
}

function postWork(resolve) {
	if (document.getElementById("noItemOverlay")) {
		if (!currentItemSet || !currentItemSet.length && localStorage.error === "false") {
			document.getElementById("noItemOverlay").classList.remove("hidden");
		} else {
			document.getElementById("noItemOverlay").classList.add("hidden");
		}
	}
	if (oldItemChangeQuantity !== (currentItemSet && currentItemSet.length) || oldPageNumber !== pageNumber) {
		for (var page of pages) {
			while (elements[page].lastChild) {
				elements[page].removeChild(elements[page].lastChild);
			}
		}
		var maxLength = fragments.date.children.length;
		if ((pageNumber + 1) * pageQuantity < maxLength) {
			maxLength = (pageNumber + 1) * pageQuantity;
		}
		var minNumber = (pageNumber * pageQuantity) - 1;
		if (minNumber < 0) {
			minNumber = 0;
		}
		var tempFragments = {};
		for (let page of pages) {
			tempFragments[page] = document.createDocumentFragment();
			for (let i = minNumber; i < maxLength; i++) {
				if (page === "date") {
					let node = fragments[page].children[i].cloneNode(true);
					if (!node.dataset.activity) {
						for (let n = currentItemSet.length - 1; n > 0; n--) {
							if (currentItemSet[n].id === parseInt(node.dataset.index) && currentItemSet[n].match) {
								var match = JSON.parse(currentItemSet[n].match);
								node.dataset.activity = match.activityHash;
								node.dataset.activityType = match.activityTypeHashOverride || DestinyActivityDefinition[match.activityHash].activityTypeHash;
							}
							if (currentItemSet[n].id < parseInt(node.dataset.index)) {
								break;
							}
						}
					}
					fragments[page].children[i] = node;
					tempFragments[page].appendChild(node);
				} else {
					tempFragments[page].appendChild(fragments[page].children[i].cloneNode(true));
				}
			}
		}
		window.requestAnimationFrame(function() {
			for (let page of pages) {
				elements[page].appendChild(tempFragments[page]);
			}
			resolve();
			window.requestAnimationFrame(postDisplay);
		});
	}
}

function postDisplay() {
	constructMatchInterface();
	makePages();
	oldItemChangeQuantity = (currentItemSet && currentItemSet.length);
	oldPageNumber = pageNumber;
	var progressBars = document.querySelectorAll(".squareProgress");
	for (var progressBar of progressBars) {
		var t = progressBar.dataset.value / progressBar.dataset.max;
		if (t > 0 && t !== Infinity) {
			var n = new SquareProgress(progressBar, t);
			n.backgroundColor = "rgba(0,0,0,0)";
			n.borderColor = "rgba(0,0,0,0)";
			n.draw();
		}
	}
}
var moment = moment || null

if (moment) {
	var timezone = moment.tz.guess();
}

var UIhideItemResults = false;

function displayResults(customItems, hideItemResults) {
	if (customItems && customItems.length) {
		currentItemSet = customItems;
	}
	UIhideItemResults = hideItemResults;
	// logger.startLogging("UI");
	if (elements.trackingItem && localStorage.accurateTracking === "true") {
		elements.trackingItem.style.display = "inline-block";
		elements.trackingItem.style.backgroundImage = "url(" + "'http://www.bungie.net" + getItemDefinition(localStorage.transferMaterial).icon + "')";

	} else if (elements.trackingItem) {
		elements.trackingItem.style.display = "none";
	}
	return new Promise(function displayResultsCore(resolve, reject) {
		// logger.startLogging("UI");
		// logger.timeEnd("grab matches");
		// logger.time("loadResults");
		if (oldItemChangeQuantity !== (currentItemSet && currentItemSet.length) || oldPageNumber !== pageNumber) {
			for (var page of pages) {
				while (elements[page].lastChild) {
					elements[page].removeChild(elements[page].lastChild);
				}
				elements[page].innerHTML = "<h2 class='section-title'>Loading...</h2>";
			}
			// Start iterator, it will return a promise
			var promise = asyncIterator(currentItemSet || [], work, pageQuantity);

			// When promise is resolved, output results
			promise.then(function() {
				postWork(resolve);
			});
		} else {
			postWork(resolve);
		}
	});
}

function itemType(itemHash) {
	let itemDef = getItemDefinition(itemHash);
	if (itemDef.itemTypeName && itemDef.itemTypeName.indexOf("Engram") > -1) {
		return "engram";
	}
	if ([14239492, 20886954, 434908299, 1585787867, 4023194814, 3551918588, 3448274439].indexOf(itemDef.bucketTypeHash) > -1) {
		return "armor";
	}
	if ([284967655, 2025709351].indexOf(itemDef.bucketTypeHash) > -1) {
		return "vehicle";
	}
	if ([953998645, 1498876634, 2465295065].indexOf(itemDef.bucketTypeHash) > -1) {
		return "weapon";
	}
	if ([4274335291, 3796357825, 3054419239, 2973005342].indexOf(itemDef.bucketTypeHash) > -1) {
		return "social";
	}
	return "other";
}

function itemRarity(itemHash) {
	let itemDefinition = getItemDefinition(itemHash);
	if (itemDefinition.tierTypeName === "Exotic") {
		return "exotic";
	} else if (itemDefinition.tierTypeName === "Legendary") {
		return "legendary";
	} else if (itemDefinition.tierTypeName === "Rare") {
		return "rare";
	} else if (itemDefinition.tierTypeName === "Uncommon") {
		return "uncommon";
	} else {
		return "common";
	}
}

function makeItem(itemData, classRequirement, optionalCosts) {
	var docfrag = document.createDocumentFragment();
	var itemContainer = document.createElement("div");
	itemContainer.classList.add("item-container");
	if (itemData.removed) {
		itemContainer.classList.add("undiscovered");
	}
	var container = document.createElement("div");
	var stat = document.createElement("div");
	itemContainer.appendChild(container);
	itemContainer.dataset.itemType = itemType(itemData.itemHash);
	itemContainer.dataset.itemRarity = itemRarity(itemData.itemHash);
	if (hasQuality(itemData) && globalOptions.showQuality) {
		var quality = document.createElement("div");
		itemContainer.appendChild(quality);
		quality.classList.add("quality");
		stat.classList.add("with-quality");
		var qualityData = parseItemQuality(itemData);
		quality.style.background = qualityData.color;
		quality.textContent = qualityData.min + "%";
		container.dataset.qualityMin = qualityData.min;
		container.dataset.qualityMax = qualityData.max;
		container.dataset.qualityColor = qualityData.color;
	}
	itemContainer.appendChild(stat);
	docfrag.appendChild(itemContainer);
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
	passData(container, itemData, classRequirement, optionalCosts);
	return docfrag;
}

function makeProgress(progressData, classRequirement) {
	if (progressData.itemHash) {
		return makeItem(progressData, classRequirement);
	}
	var docfrag = document.createDocumentFragment();
	if (progressData.progressionHash && progressData.progressionHash === 3298204156) {
		return docfrag;
	}
	var itemContainer = document.createElement("div");
	itemContainer.classList.add("item-container");
	var container = document.createElement("div");
	var stat = document.createElement("div");
	itemContainer.appendChild(container);
	itemContainer.appendChild(stat);
	docfrag.appendChild(itemContainer);
	container.classList.add("kinetic", "common", "faction");
	// NO BACKGROUND IMAGE ON FACTION ICONS BECAUSE THEY ARE TRANSPARENT
	if (DestinyFactionDefinition[progressData.factionHash]) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyFactionDefinition[progressData.factionHash].factionIcon + "')");
		var canvas = document.createElement("canvas");
		canvas.classList.add("squareProgress", "repProgress");
		canvas.width = 37;
		canvas.height = 37;
		canvas.dataset.max = progressData.nextLevelAt;
		canvas.dataset.value = progressData.progressToNextLevel;
		container.appendChild(canvas);
	} else if (DestinyProgressionDefinition[progressData.progressionHash].icon) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyProgressionDefinition[progressData.progressionHash].icon + "')");
	} else if (progressData.name === "pvp_iron_banner.loss_tokens") {
		container.setAttribute("style", "background-image: url('http://bungie.net" + getItemDefinition(3397982326).icon + "')");
	} else if (progressData.name === "r1_s4_hiveship_orbs") {
		container.setAttribute("style", "background-image: url('http://bungie.net" + getItemDefinition(1069694698).icon + "')");
	} else if (progressData.name === "terminals") {
		container.setAttribute("style", "background-image: url('http://bungie.net" + getItemDefinition(2751204699).icon + "')");
	} else {
		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
	}
	stat.classList.add("primary-stat");
	stat.textContent = progressData.progressChange;
	passFactionData(container, progressData, classRequirement);
	return docfrag;
}

function itemClasses(itemData) {
	// logger.startLogging("UI");
	var classList = [];
	if (itemData.isGridComplete) {
		classList.push("complete");
	}
	var itemDefinition = getItemDefinition(itemData.itemHash);
	if (itemData.itemHash === 3159615086 || itemData.itemHash === 2534352370 || itemData.itemHash === 2749350776) {
		classList.push("faction");
	} else {
		classList.push("item");
	}
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
	} else if (itemData.stackSize) {
		return itemData.stackSize;
	} else {
		return 1;
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
	var itemDef = getItemDefinition(itemData.itemHash);
	if (itemData.itemHash === 3159615086) {
		var glimmer = getItemDefinition(3159615086);
		if (itemData.maxStackSize) {
			return `${itemData.maxStackSize}/${glimmer.maxStackSize}`;
		}
		return glimmer.maxStackSize;
	} else if (itemData.itemHash === 2534352370) {
		var marks = getItemDefinition(2534352370);
		if (itemData.maxStackSize) {
			return `${itemData.maxStackSize}/${marks.maxStackSize}`;
		}
		return marks.maxStackSize;
	} else if (itemData.primaryStat) {
		return DestinyStatDefinition[itemData.primaryStat.statHash].statName;
	} else if (itemDef.bucketTypeHash === 2197472680 || itemDef.bucketTypeHash === 1801258597) {
		return "Completed";
	} else {
		return "Quantity";
	}
}

function passData(DomNode, itemData, classRequirement, optionalCosts) {
	// logger.startLogging("UI");
	var itemDefinition = getItemDefinition(itemData.itemHash);
	if (optionalCosts) {
		DomNode.dataset.costs = JSON.stringify(optionalCosts);
	}
	DomNode.dataset.itemHash = itemDefinition.itemHash;
	if (itemData.itemInstanceId) {
		DomNode.dataset.itemInstanceId = itemData.itemInstanceId;
	}
	if (itemDefinition.tierTypeName) {
		DomNode.dataset.tierTypeName = itemDefinition.tierTypeName;
	} else {
		DomNode.dataset.tierTypeName = "Common";
	}
	if (itemDefinition.sourceHashes) {
		var temp = [];
		for (var hash of itemDefinition.sourceHashes) {
			if (DestinyRewardSourceDefinition[hash]) {
				temp.push(DestinyRewardSourceDefinition[hash].sourceName.replace(/\s+/g, ''));
			}
		}
		DomNode.dataset.sourceName = JSON.stringify(temp);
	}
	DomNode.dataset.itemName = itemDefinition.itemName;
	DomNode.dataset.itemImage = itemDefinition.icon;
	DomNode.dataset.itemTypeName = itemDefinition.itemTypeName;
	DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
	DomNode.dataset.primaryStat = primaryStat(itemData);
	DomNode.dataset.primaryStatName = primaryStatName(itemData);
	DomNode.dataset.itemDescription = itemDefinition.itemDescription;
	DomNode.dataset.damageTypeName = elementType(itemData);
	DomNode.dataset.classRequirement = "";
	if (classRequirement) {
		if (typeof classRequirement === "string") {
			DomNode.dataset.classRequirement = classRequirement;
		} else {
			DomNode.dataset.classRequirement = JSON.stringify(classRequirement);
		}
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

function passFactionData(DomNode, diffData, classRequirement) {
	if (diffData.factionHash) {
		let factionData = DestinyFactionDefinition[diffData.factionHash];
		DomNode.dataset.itemHash = diffData.factionHash;
		DomNode.dataset.itemName = factionData.factionName;
		DomNode.dataset.itemDescription = factionData.factionDescription;
		DomNode.dataset.itemTypeName = "Faction";
	} else {
		let factionData = DestinyProgressionDefinition[diffData.progressionHash];
		DomNode.dataset.itemHash = diffData.progressionHash;
		DomNode.dataset.itemName = factionData.name;
		DomNode.dataset.itemDescription = "";
		DomNode.dataset.itemTypeName = "Progression";
	}
	if (DestinyFactionDefinition[diffData.factionHash]) {
		DomNode.dataset.itemImage = DestinyFactionDefinition[diffData.factionHash].factionIcon;
	} else if (DestinyProgressionDefinition[diffData.progressionHash].icon) {
		DomNode.dataset.itemImage = DestinyProgressionDefinition[diffData.progressionHash].icon;
	} else if (diffData.name === "pvp_iron_banner.loss_tokens") {
		DomNode.dataset.itemImage = getItemDefinition(3397982326).icon;
	} else if (diffData.name === "r1_s4_hiveship_orbs") {
		DomNode.dataset.itemImage = getItemDefinition(1069694698).icon;
	} else if (progressData.name === "terminals") {
		DomNode.dataset.itemImage = getItemDefinition(2751204699).icon;
	} else {
		DomNode.dataset.itemImage = "/img/misc/missing_icon.png";
	}
	DomNode.dataset.tierTypeName = "Common";
	DomNode.dataset.equipRequiredLevel = 0;
	DomNode.dataset.primaryStat = diffData.progressToNextLevel;
	DomNode.dataset.primaryStatName = diffData.nextLevelAt;
	DomNode.dataset.damageTypeName = "Kinetic";
	DomNode.dataset.progressToNextLevel = diffData.progressToNextLevel;
	DomNode.dataset.progressChange = diffData.progressChange;
	DomNode.dataset.nextLevelAt = diffData.nextLevelAt;
	DomNode.dataset.level = diffData.level;
	DomNode.dataset.classRequirement = "";
	if (classRequirement) {
		if (typeof classRequirement === "string") {
			DomNode.dataset.classRequirement = classRequirement;
		} else {
			DomNode.dataset.classRequirement = JSON.stringify(classRequirement);
		}
	}
}

function characterName(characterId, light) {
	if (!characterDescriptions[characterId]) {
		return "";
	}
	// logger.startLogging("UI");
	if (light === null) {
		return characterDescriptions[characterId].name;
	}
	if (characterId === "vault") {
		return "Vault";
	}
	if (!characterDescriptions[characterId]) {
		// logger.log(light)
	}
	return characterDescriptions[characterId].race + " " + characterDescriptions[characterId].gender + " " + characterDescriptions[characterId].name + " (" + (light || characterDescriptions[characterId].light) + ")";
}

function characterSource(itemDiff, moveType, index) {
	var itemData = itemDiff[moveType][index];
	var light = itemDiff.light;
	// logger.log(itemDiff.characterId,itemData);
	var toId = itemDiff.characterId;
	var fromId = "";
	var starter = "Added to ";
	if (itemData.item) {
		if (itemData.from && itemData.to) {
			fromId = itemData.from;
			toId = itemData.to;
		} else {
			toId = itemData.characterId;
		}
	}
	if (moveType === "removed") {
		starter = "Removed from ";
	}
	if (fromId) {
		starter = "From " + characterName(fromId, null) + " to ";
	}
	return starter + characterName(toId, light);
}