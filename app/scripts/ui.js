var elements = { // jshint ignore:line
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
	toggleSystem: document.getElementById("toggleSystem"),
	autoLock: document.getElementById("autoLock"),
	track3oC: document.getElementById("track3oC"),
	trackBoosters: document.getElementById("trackBoosters"),
	obeyCooldowns: document.getElementById("obeyCooldowns"),
	autoTagInventory: document.getElementById("autoTagInventory"),
	paginate: document.getElementById("paginate"),
	showQuality: document.getElementById("showQuality"),
	useGuardianLight: document.getElementById("useGuardianLight"),
	lockHighLight: document.getElementById("lockHighLight"),
	classType: document.getElementById("classType"),
	categoryHash: document.getElementById("categoryHash"),
	hideUnmatched: document.getElementById("hideUnmatched"),
	refreshGear: document.getElementById("refreshGear"),
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
var moment = moment || null; // jshint ignore:line

if (moment) {
	var timezone = moment.tz.guess();
}

function getOffset(el) {
	el = el.getBoundingClientRect();
	return {
		left: el.left + window.scrollX,
		top: el.top + window.scrollY
	}
}

function initUi(elementTarget) { // jshint ignore:line
	for (var elementName in elements) {
		if (elementNames[elementName]) {
			elements[elementName] = document.getElementById(elementNames[elementName]);
		} else {
			elements[elementName] = document.getElementById(elementName);
		}
	}
	if (elements.version && DEBUG) {
		elements.version.textContent = (manifest.version_name);
	}
	var reloadButtons = document.querySelectorAll(".reload");
	for (var reloadButton of reloadButtons) {
		reloadButton.addEventListener("click", function reloadBackgroundPage() {
			chrome.runtime.getBackgroundPage(function (bp) {
				bp.location.reload();
			});
		});
	}
	if (elementTarget) {
		elements.tooltip.addEventListener("mouseover", function (event) {
			clearTimeout(hideTooltipTimeout);
			hideTooltipTimeout = null;
			clearTimeout(tooltipTimeout);
			var target = null;
			if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
				target = event.target;
			} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
				target = event.target.parentNode;
			} else if (event.target.parentNode.classList.contains("item-container")) {
				target = event.target.parentNode.children[0];
			}
			if (target) {
				handleTooltipData(target.dataset, target, event, true);
			}
		}, true);
		elementTarget.addEventListener("mouseover", function (event) {
			if ((event.target.classList.contains("sub-section") || event.target.classList.contains("dropdowncontent")) && !hideTooltipTimeout) {
				hideTooltipTimeout = setTimeout(hideTooltip, 1000);
				clearTimeout(tooltipTimeout);
			} else {
				var target = null;
				if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
					target = event.target;
				} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
					target = event.target.parentNode;
				} else if (event.target.parentNode.classList.contains("item-container")) {
					target = event.target.parentNode.children[0];
				}
				if (target) {
					clearTimeout(hideTooltipTimeout);
					hideTooltipTimeout = null;
					if (target !== previousElement) {
						// elements.tooltip.classList.add("hidden");
						previousElement = target;
						handleTooltipData(target.dataset, target, event);
					} else {
						// console.log(`unhide tooltip`)
						// elements.tooltip.classList.remove("hidden");
					}
				}
				if (!target) {
					// elements.tooltip.classList.add("hidden");
					previousElement = null;
				}
			}
		}, true);
		elementTarget.addEventListener("mousedown", function (event) {
			var target = null;
			if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
				target = event.target;
			} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
				target = event.target.parentNode;
			} else if (event.target.parentNode.classList.contains("item-container")) {
				target = event.target.parentNode.children[0];
			}
			if (target && target.dataset.canTag && event.button === 0 && target.dataset.removed !== "true") {
				event.preventDefault();
				var tagFloat = document.getElementById("tagfloat");
				tagFloat.dataset.itemInstanceId = target.dataset.itemInstanceId;
				tagFloat.dataset.itemHash = target.dataset.itemHash;
				let tagFloatHeight = tagFloat.getBoundingClientRect().height;
				var coords = getOffset(target);
				if (coords.top + tagFloatHeight + 50 > window.innerHeight) {
					tagFloat.style.top = coords.top - tagFloatHeight;
					tagFloat.classList.add("flip");
				} else {
					tagFloat.style.top = coords.top + 50;
					tagFloat.classList.remove("flip");
				}
				tagFloat.style.left = coords.left - 50;
				tagFloat.classList.remove("invisible");
			} else {
				let tagFloat = document.getElementById("tagfloat");
				tagFloat.classList.add("invisible");
			}
		}, true);
		if (document.getElementById("width-wrapper")) {
			document.getElementById("width-wrapper").addEventListener("scroll", function () {
				// console.log(document.getElementById("tagfloat"));
				document.getElementById("tagfloat").classList.add("invisible");
			}, false);
		}
		if (document.getElementById("debugHome")) {
			document.getElementById("debugHome").addEventListener("scroll", function () {
				// console.log(document.getElementById("tagfloat"));
				document.getElementById("tagfloat").classList.add("invisible");
			}, false);
		}
		var resizeTimeout = null;
		window.addEventListener("resize", function () {
			// console.log(document.getElementById("tagfloat"));
			document.getElementById("tagfloat").classList.add("invisible");
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function () {
				let header = document.getElementById("sticky-title-bar").children[0];
				let headerSections = {};
				let rowIndex = 0;
				for (let type of dataTypes) {
					headerSections[type] = header.children[rowIndex];
					rowIndex++;
				}
				let sections = tableRowSections(elements.container.children[0]);
				for (let attr of dataTypes) {
					headerSections[attr].style.width = sections[attr].getBoundingClientRect().width;
				}
			}, 100);
		}, false);
	}
	if (elements.toggleSystem) {
		getOption("activeType").then(function (activeType) {
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
			elements.toggleSystem.addEventListener("click", function () {
				getOption("activeType").then(function (activeType) {
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
	var secretLinks = document.querySelectorAll(".admin");
	if (secretLinks.length) {
		if (!chrome.runtime.getManifest().key) {
			for (var link of secretLinks) {
				link.classList.remove("hidden");
			}
		}
	}
	if (typeof tags !== "undefined") {
		tags.getUI();
	}
	getAllOptions().then(function (options) {
		if (elements.autoLock) {
			elements.autoLock.checked = options.autoLock === true;
			elements.autoLock.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.track3oC) {
			elements.track3oC.checked = options.track3oC === true;
			elements.track3oC.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.trackBoosters) {
			elements.trackBoosters.checked = options.trackBoosters === true;
			elements.trackBoosters.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.obeyCooldowns) {
			elements.obeyCooldowns.checked = options.obeyCooldowns === true;
			elements.obeyCooldowns.addEventListener("change", handleCheckboxChange, false);
		}
		if (elements.autoTagInventory) {
			elements.autoTagInventory.checked = options.autoTagInventory === true;
			elements.autoTagInventory.addEventListener("change", handleCheckboxChange, false);
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
	tracker.sendEvent('Options', event.target.id, event.target.checked);
	setOption(event.target.id, event.target.checked);
}

var pageQuantity = 50;
var pageNumber = 0;
var oldItemChangeQuantity = 0;
var oldPageNumber = -1;
var previousElement = null;

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
		elements.paginate.addEventListener("change", function () {
			pageNumber = parseInt(elements.paginate.value, 10);
			notificationCooldown = 0;
		}, false);
	}
}

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

function itemType(item) {
	let itemDef = getItemDefinition(item.itemHash, item);
	if (itemDef.itemType === 8) {
		return "engram";
	}
	if (itemDef.itemType === 2) {
		return "armor";
	}
	if (itemDef.itemType === 1) {
		return "currency";
	}
	if (itemDef.itemType === 3) {
		return "weapon";
	}
	if (itemDef.itemType === 4) {
		return "bounty";
	}
	if (itemDef.bucketTypeHash === 1469714392) {
		return "consumable";
	}
	if (itemDef.bucketTypeHash === 3865314626) {
		return "material";
	}
	if (itemDef.bucketTypeHash === 3313201758) {
		return "ornament";
	}
	if ([284967655, 2025709351].indexOf(itemDef.bucketTypeHash) > -1) {
		return "vehicle";
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

var itemCache = [];

function damageTypeName(itemData) {
	var string = "kinetic";
	if (itemData.damageTypeHash) {
		var damageTypeName = DestinyDamageTypeDefinition[itemData.damageTypeHash].damageTypeName;
		if (damageTypeName === "Arc") {
			string = "arc";
		} else if (damageTypeName === "Solar") {
			string = "solar";
		} else if (damageTypeName === "Void") {
			string = "void";
		}
	}
	return string;
}

function makeItem(itemData, classRequirement, optionalCosts) {
	var docfrag = document.createDocumentFragment();
	var itemContainer, container, stat, quality, tag;
	if (itemCache.length) {
		itemContainer = itemCache.pop();
		container = itemContainer.children[0];
		quality = itemContainer.children[1];
		stat = itemContainer.children[2];
		stat.className = "primary-stat";
		tag = itemContainer.children[3];
		if (!tag) {
			console.log(itemContainer)
		}
		tag.innerHTML = "";
		tag.classList.remove("tag-corner");
		for (var attr in container.dataset) {
			delete container.dataset[attr];
		}
	} else {
		itemContainer = document.createElement("div");
		container = document.createElement("div");
		stat = document.createElement("div");
		tag = document.createElement("div");
		quality = document.createElement("div");
		itemContainer.classList.add("item-container");
		itemContainer.appendChild(container);
		itemContainer.appendChild(quality);
		itemContainer.appendChild(stat);
		itemContainer.appendChild(tag);
		stat.classList.add("primary-stat");
	}
	docfrag.appendChild(itemContainer);
	if (itemData.removed) {
		itemContainer.classList.add("undiscovered");
	} else {
		itemContainer.classList.remove("undiscovered");
	}
	if (itemData.nodes && itemData.itemInstanceId === "0") {
		var string = JSON.stringify(itemData.nodes);
		var hash = 0,
			i, chr, len;
		for (i = 0, len = string.length; i < len; i++) {
			chr = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		itemData.itemInstanceId = hash;
	}
	itemContainer.dataset.itemType = itemType(itemData);
	itemContainer.dataset.itemRarity = itemRarity(itemData.itemHash);
	let tagData = tags.getTag(itemData);
	if (tagData) {
		itemContainer.dataset.id = `${itemData.itemInstanceId}`;
		// tag.innerHTML = `<i class="fa fa-${tags.getIcon(tagData)}"></i><span class="tag-text">${tags.getName(tagData)}</span>`;
		container.dataset.canTag = "true";
		container.dataset.tagHash = tagData.tagHash;
		if (tagData.tagHash !== 5) {
			tag.classList.add("tag-corner");
			tag.innerHTML = `<i class="fa fa-${tags.getIcon(tagData)} fa-lg"></i>`;
		}
	}
	if (hasQuality(itemData) && globalOptions.showQuality) {
		var qualityData;
		if (itemData._quality) {
			qualityData = itemData._quality;
		} else {
			qualityData = parseItemQuality(itemData);
		}
		if (qualityData.min > 0) {
			quality.className = "quality " + damageTypeName(itemData);
			stat.classList.add("with-quality");
			quality.style.background = qualityData.color;
			quality.textContent = qualityData.min + "%";
			container.dataset.qualityMin = qualityData.min;
			container.dataset.qualityMax = qualityData.max;
			container.dataset.qualityColor = qualityData.color;
		} else {
			quality.className = "hidden " + itemClasses(itemData).join(" ");
			stat.classList.remove("with-quality");
		}
	} else {
		quality.className = "hidden " + itemClasses(itemData).join(" ");
		stat.classList.remove("with-quality");
	}
	container.className = itemClasses(itemData).join(" ");
	if (itemData.itemHash === 3159615086 || itemData.itemHash === 2534352370 || itemData.itemHash === 2749350776) {
		container.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "')");
	} else if (getItemDefinition(itemData.itemHash).hasIcon || (getItemDefinition(itemData.itemHash).icon && getItemDefinition(itemData.itemHash).icon.length)) {
		container.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "'),url('img/missing_icon.png')");
	} else if (getItemDefinition(itemData.itemHash).itemName === "Classified") {
		container.setAttribute("style", "background-image: url('img/classified.jpg')");
	} else {
		container.setAttribute("style", "background-image: url('img/missing_icon.png')");
	}
	stat.textContent = primaryStat(itemData);
	passData(container, itemData, classRequirement, optionalCosts);
	return docfrag;
}

var progressCache = [];

function sendToCache(DomNode) {
	if (DomNode.children[0].classList.contains("currency")) {
		itemCache.push(DomNode);
	} else if (DomNode.children[0].classList.contains("faction")) {
		progressCache.push(DomNode);
	} else {
		itemCache.push(DomNode);
	}
}

function cleanupMainPage() {
	var childrenList = [];
	if (elements.container.children.length) {
		for (let tableRow of elements.container.children) {
			for (let subSection of tableRow.children) {
				if (subSection.dataset.type !== "date") {
					for (let child of subSection.children) {
						sendToCache(child);
						childrenList.push(child);
					}
				}
			}
		}
	}
	// if (elements.progression.children.length) {
	// 	for (let subSection of elements.progression.children) {
	// 		for (let child of subSection.children) {
	// 			sendToCache(child);
	// 			childrenList.push(child);
	// 		}
	// 	}
	// }
	// if (elements.added.children.length) {
	// 	for (let subSection of elements.added.children) {
	// 		for (let child of subSection.children) {
	// 			sendToCache(child);
	// 			childrenList.push(child);
	// 		}
	// 	}
	// }
	// if (elements.removed.children.length) {
	// 	for (let subSection of elements.removed.children) {
	// 		for (let child of subSection.children) {
	// 			sendToCache(child);
	// 			childrenList.push(child);
	// 		}
	// 	}
	// }
	// if (elements.transferred.children.length) {
	// 	for (let subSection of elements.transferred.children) {
	// 		for (let child of subSection.children) {
	// 			sendToCache(child);
	// 			childrenList.push(child);
	// 		}
	// 	}
	// }
	for (var DomNode of childrenList) {
		DomNode.parentNode.removeChild(DomNode);
	}
}

function makeProgress(progressData, classRequirement) {
	if (progressData.itemHash) {
		return makeItem(progressData, classRequirement);
	}
	var docfrag = document.createDocumentFragment();
	if (progressData.progressionHash && progressData.progressionHash === 3298204156) {
		return docfrag;
	}
	var itemContainer, container, stat, canvas;
	if (progressCache.length) {
		itemContainer = progressCache.pop();
		container = itemContainer.children[0];
		canvas = container.children[0];
		stat = itemContainer.children[1];
		for (var attr in container.dataset) {
			delete container.dataset[attr];
		}
	} else {
		itemContainer = document.createElement("div");
		container = document.createElement("div");
		stat = document.createElement("div");
		canvas = document.createElement("canvas");
		itemContainer.classList.add("item-container");
		container.appendChild(canvas);
		itemContainer.appendChild(container);
		itemContainer.appendChild(stat);
		stat.classList.add("primary-stat");
		container.classList.add("kinetic", "common", "faction");
	}
	docfrag.appendChild(itemContainer);
	// NO BACKGROUND IMAGE ON FACTION ICONS BECAUSE THEY ARE TRANSPARENT
	if (DestinyFactionDefinition[progressData.factionHash]) {
		container.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyFactionDefinition[progressData.factionHash].factionIcon + "')");
		canvas.classList.add("squareProgress", "repProgress");
		canvas.classList.remove("hidden");
		canvas.width = 37;
		canvas.height = 37;
		canvas.dataset.max = progressData.nextLevelAt;
		canvas.dataset.value = progressData.progressToNextLevel;
	} else if (DestinyProgressionDefinition[progressData.progressionHash].icon) {
		canvas.classList.add("hidden");
		container.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyProgressionDefinition[progressData.progressionHash].icon + "')");
	} else if (progressData.name === "pvp_iron_banner.loss_tokens") {
		canvas.classList.add("hidden");
		container.setAttribute("style", "background-image: url('https://www.bungie.net" + getItemDefinition(3397982326).icon + "')");
	} else if (progressData.name === "r1_s4_hiveship_orbs") {
		canvas.classList.add("hidden");
		container.setAttribute("style", "background-image: url('https://www.bungie.net" + getItemDefinition(1069694698).icon + "')");
	} else if (progressData.name === "terminals") {
		canvas.classList.add("hidden");
		container.setAttribute("style", "background-image: url('https://www.bungie.net" + getItemDefinition(2751204699).icon + "')");
	} else if (progressData.name === "d15.fall.record_books.rise_of_iron") {
		canvas.classList.add("hidden");
		container.setAttribute("style", "background-image: url('https://www.bungie.net" + DestinyRewardSourceDefinition[24296771].icon + "')");
	} else {
		canvas.classList.add("hidden");
		container.setAttribute("style", "background-image: url('img/missing_icon.png')");
	}
	stat.textContent = progressData.progressChange;
	passFactionData(container, progressData, classRequirement);
	return docfrag;
}

function itemClasses(itemData) {
	var classList = [];
	if (itemData.isGridComplete) {
		classList.push("complete");
	}
	var itemDefinition = getItemDefinition(itemData.itemHash, itemData);
	if (itemData.itemHash === 3159615086 || itemData.itemHash === 2534352370 || itemData.itemHash === 2749350776) {
		classList.push("faction");
		classList.push("currency");
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
	var itemDef = getItemDefinition(itemData.itemHash, itemData);
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
	if (optionalCosts) {
		DomNode.dataset.costs = JSON.stringify(optionalCosts);
	}
	if (classRequirement) {
		if (typeof classRequirement === "string") {
			DomNode.dataset.classRequirement = classRequirement;
		} else {
			DomNode.dataset.classRequirement = JSON.stringify(classRequirement);
		}
	}
	for (var attr in itemData) {
		if (typeof itemData[attr] === "object") {
			DomNode.dataset[attr] = JSON.stringify(itemData[attr]);
		} else {
			DomNode.dataset[attr] = itemData[attr];
		}
	}
	var itemDefinition = getItemDefinition(itemData.itemHash, itemData);
	// DomNode.dataset.itemHash = itemDefinition.itemHash;
	// if (itemData.itemInstanceId) {
	// 	DomNode.dataset.itemInstanceId = itemData.itemInstanceId;
	// }
	// if (itemDefinition.tierTypeName) {
	// 	DomNode.dataset.tierTypeName = itemDefinition.tierTypeName;
	// } else {
	// 	DomNode.dataset.tierTypeName = "Common";
	// }
	if (itemDefinition.sourceHashes) {
		var temp = [];
		for (var hash of itemDefinition.sourceHashes) {
			if (DestinyRewardSourceDefinition[hash]) {
				temp.push(DestinyRewardSourceDefinition[hash].sourceName.replace(/\s+/g, ''));
			}
		}
		DomNode.dataset.sourceName = JSON.stringify(temp);
	}
	// DomNode.dataset.itemName = itemDefinition.itemName;
	// DomNode.dataset.itemImage = itemDefinition.icon;
	// DomNode.dataset.itemTypeName = itemDefinition.itemTypeName;
	// DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
	if (!DomNode.dataset.primaryStat) {
		DomNode.dataset.primaryStat = primaryStat(itemData);
		DomNode.dataset.primaryStatName = primaryStatName(itemData);
	}
	if (!DomNode.dataset.nodes && DomNode.dataset.talentGridHash) {
		DomNode.dataset.nodes = JSON.stringify(buildFakeNodes(DomNode.dataset.talentGridHash));
	}
	// DomNode.dataset.itemDescription = itemDefinition.itemDescription;
	// DomNode.dataset.damageTypeName = elementType(itemData);
	// DomNode.dataset.classRequirement = "";
	// if (itemData.stats && itemData.stats.length) {
	// 	DomNode.dataset.statTree = JSON.stringify(itemData.stats);
	// }
	// if (itemData.nodes && itemData.nodes.length) {
	// 	DomNode.dataset.talentGridHash = itemData.talentGridHash;
	// 	DomNode.dataset.nodeTree = JSON.stringify(itemData.nodes);
	// }
	// if (itemData.objectives && itemData.objectives.length) {
	// 	DomNode.dataset.objectiveTree = JSON.stringify(itemData.objectives);
	// }
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
	if (DomNode.dataset.itemName === "terminals") {
		var data = DestinyGrimoireCardDefinition[103094];
		DomNode.dataset.itemDescription = data.cardDescription;
		DomNode.dataset.itemName = data.cardName;
		DomNode.dataset.itemTypeName = "Progression";
	}
	if (DomNode.dataset.itemName === "r1_s4_hiveship_orbs") {
		var data = DestinyRecordDefinition[1872531700];
		DomNode.dataset.itemDescription = data.description;
		DomNode.dataset.itemName = data.displayName;
		DomNode.dataset.itemTypeName = "Progression";
	}
	if (DomNode.dataset.itemName === "pvp_iron_banner.loss_tokens") {
		var data = getItemDefinition(3397982326);
		DomNode.dataset.itemDescription = data.itemDescription;
		DomNode.dataset.itemName = data.itemName;
		DomNode.dataset.itemTypeName = "Progression";
	}
	if (DomNode.dataset.itemName === "d15.fall.record_books.rise_of_iron") {
		var data = DestinyRecordBookDefinition[243968262];
		DomNode.dataset.itemDescription = data.displayDescription;
		DomNode.dataset.itemName = data.displayName;
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
	} else if (diffData.name === "terminals") {
		DomNode.dataset.itemImage = getItemDefinition(2751204699).icon;
	} else if (diffData.name === "d15.fall.record_books.rise_of_iron") {
		DomNode.dataset.itemImage = DestinyRewardSourceDefinition[24296771].icon;
	} else {
		DomNode.dataset.itemImage = "/img/missing_icon.png";
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
	if (light === null) {
		return characterDescriptions[characterId].name;
	}
	if (characterId === "vault") {
		return "Vault";
	}
	if (!characterDescriptions[characterId]) {
		// console.log(light)
	}
	return characterDescriptions[characterId].race + " " + characterDescriptions[characterId].gender + " " + characterDescriptions[characterId].name + " (" + (light || characterDescriptions[characterId].light) + ")";
}

function characterSource(itemDiff, moveType, index) {
	var itemData = itemDiff[moveType][index];
	var light = itemDiff.light;
	// console.log(itemDiff.characterId,itemData);
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

var dataTypes = ["date", "progression", "added", "removed", "transferred"];

function makeEmptyTableRow(itemDiff) {
	var tableRow = document.createElement("div");
	tableRow.className = "table-row";
	tableRow.dataset.index = itemDiff.id;
	for (let type of dataTypes) {
		var subContainer = document.createElement("div");
		subContainer.className = "table-cell";
		subContainer.dataset.type = type;
		tableRow.appendChild(subContainer);
	}
	return tableRow;
}

function makeEmptySubSection(itemDiff, className) {
	var subContainer = document.createElement("div");
	subContainer.className = "sub-section " + className;
	subContainer.dataset.index = itemDiff.id;
	return subContainer;
}

function fillSubSection(subContainer, itemDiff, className, moveType) {
	// subContainer.className = "sub-section " + className;
	subContainer.className = "table-cell sub-section";
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
	var link1 = "";
	var link2 = "";
	var instance = "";
	if (itemDiff.match) {
		var match = JSON.parse(itemDiff.match);
		link1 = `<a href="http://destinytracker.com/dg/${match.activityInstance}" target='_blank'>`;
		link2 = "</a>";
		instance = match.activityInstance;
		activity = match.activityHash;
		activityType = match.activityTypeHashOverride || DestinyActivityDefinition[match.activityHash].activityTypeHash;
	}
	subContainer.className = "sub-section table-cell timestamp";

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
		subContainer.innerHTML = link1 + localTime.fromNow() + "<br>" + activityString + link2;
	} else {
		subContainer.innerHTML = link1 + localTime.format("ddd[,] ll LTS") + "<br>" + activityString + link2;
	}
	subContainer.setAttribute("title", localTime.format("ddd[,] ll LTS") + "\n" + activityString);
	subContainer.dataset.timestamp = timestamp;
	subContainer.dataset.activity = activity;
	subContainer.dataset.activityType = activityType;
	subContainer.dataset.index = itemDiff.id;
	subContainer.dataset.instance = instance;
	// var searchData = makeSearchData(itemDiff);
	// for (var typeInfo in searchData) {
	// 	subContainer.dataset[typeInfo] = searchData[typeInfo];
	// }
}

function tableRowSections(tableRow) {
	let sections = {};
	let index = 0;
	for (let type of dataTypes) {
		sections[type] = tableRow.children[index];
		index++;
	}
	return sections;
}

function newDisplayResults() {
	return new Promise(function (resolve) {
		var endPoint = currentItemSet.length - ((pageNumber + 1) * 50);
		if (endPoint < 0) {
			endPoint = 0;
		}
		var startPoint = endPoint + 50;
		if (startPoint > currentItemSet.length) {
			startPoint = currentItemSet.length;
		}
		var index = 0;
		if (oldPageNumber !== pageNumber) {
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
			// for (var attr of dataTypes) {
			var childrenList = [];
			var tableRow = elements.container.children[elements.container.children.length - index - 1];
			if (tableRow) {
				while (tableRow && parseInt(tableRow.dataset.index) !== itemDiff.id) {
					for (let subSection of tableRow.children) {
						for (let child of subSection.children) {
							if (subSection.dataset.type !== "date") {
								sendToCache(child);
							}
							childrenList.push(child);
						}
					}
					for (var DomNode of childrenList) {
						if (DomNode.parentNode) {
							DomNode.parentNode.removeChild(DomNode);
						}
					}
					tableRow.parentNode.removeChild(tableRow);
					tableRow = elements.container.children[elements.container.children.length - index - 1];
				}

			} else if (!tableRow) {
				tableRow = makeEmptyTableRow(itemDiff);
				if (!elements.container.firstChild) {
					elements.container.appendChild(tableRow);
				} else {
					elements.container.insertBefore(tableRow, elements.container.firstChild);
				}
				let sections = tableRowSections(tableRow);
				for (var attr of dataTypes) {
					if (attr === "added" || attr === "removed" || attr === "transferred" || attr === "progression") {
						fillSubSection(sections[attr], itemDiff, "", attr);
					}
					if (attr === "date") {
						fillDateSection(sections[attr], itemDiff, "");
					}
				}
			}
			// }
			index++;
		}
		setTimeout(function () {
			let header = document.getElementById("sticky-title-bar").children[0];
			let headerSections = {};
			let rowIndex = 0;
			for (let type of dataTypes) {
				headerSections[type] = header.children[rowIndex];
				rowIndex++;
			}
			let sections = tableRowSections(elements.container.children[0]);
			for (let attr of dataTypes) {
				headerSections[attr].style.width = sections[attr].getBoundingClientRect().width;
			}
		}, 100);

		resolve();
	});
}