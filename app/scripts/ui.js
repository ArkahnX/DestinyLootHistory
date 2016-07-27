var elements = {
	date: document.getElementById("date"),
	added: document.getElementById("added"),
	removed: document.getElementById("removed"),
	transferred: document.getElementById("transferred"),
	progression: document.getElementById("progression"),
	trackingItem: document.getElementById("trackingItem"),
	status: document.getElementById("status"),
	container: document.getElementById("container"),
	startTracking: document.getElementById("startTracking"),
	tooltip: document.getElementById("tooltip"),
	itemName: document.getElementById("item-name"),
	itemType: document.getElementById("item-type"),
	itemRarity: document.getElementById("item-rarity"),
	levelText: document.getElementById("level-text"),
	itemRequiredEquipLevel: document.getElementById("item-required-equip-level"),
	itemPrimaryStat: document.getElementById("item-primary-stat"),
	itemStatText: document.getElementById("item-stat-text"),
	itemDescription: document.getElementById("item-description"),
	classRequirement: document.getElementById("class-requirement"),
	statTable: document.getElementById("stat-table"),
	nodeTable: document.getElementById("node-table"),
	ToCReminder: document.getElementById("ToCReminder"),
	toggleSystem: document.getElementById("toggleSystem"),
	autoLock: document.getElementById("autoLock"),
	track3oC: document.getElementById("track3oC"),
	paginate: document.getElementById("paginate"),
	version: document.getElementById("version")
};

var elementNames = {
	itemName: "item-name",
	itemType: "item-type",
	itemRarity: "item-rarity",
	levelText: "level-text",
	itemRequiredEquipLevel: "item-required-equip-level",
	itemPrimaryStat: "item-primary-stat",
	itemStatText: "item-stat-text",
	itemDescription: "item-description",
	classRequirement: "class-requirement",
	statTable: "stat-table",
	nodeTable: "node-table"
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
			elements.version.textContent = (manifest.version);
		}
	}
	if (elements.status) {
		elements.status.classList.add("idle");
		if (elements.startTracking) {
			elements.startTracking.removeAttribute("disabled");
			elements.startTracking.addEventListener("click", function() {
				if (localStorage.listening === "false") {
					localStorage.listening = "true";
					localStorage.manual = "true";
					elements.status.classList.remove("idle", "error");
					elements.status.classList.add("active");
					elements.startTracking.setAttribute("value", "Stop Tracking");
				} else {
					elements.status.classList.add("idle");
					elements.status.classList.remove("active", "error");
					elements.startTracking.setAttribute("value", "Begin Tracking");
					localStorage.listening = "false";
				}
			});
		}
	}
	if (elements.container) {
		elements.container.addEventListener("mouseover", function(event) {
			var target = null;
			if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
				target = event.target;
			} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
				target = event.target.parentNode;
			}
			if (target && target !== previousElement) {
				elements.tooltip.classList.add("hidden");
				previousElement = target;
				handleTooltipData(event.target.dataset, event.target, event);
			}
			if (!target) {
				clearTimeout(tooltipTimeout);
				elements.tooltip.classList.add("hidden");
				previousElement = null;
			}
		}, false);
	}
	if (elements.ToCReminder) {
		if (localStorage.track3oC === "false") {
			elements.ToCReminder.value = "Turn on 3oC reminder";
			elements.ToCReminder.classList.add("grey");
			elements.ToCReminder.classList.remove("green");
		}
		elements.ToCReminder.addEventListener("click", function(event) {
			if (localStorage.track3oC === "false") {
				localStorage.track3oC = "true";
				elements.ToCReminder.value = "Turn off 3oC reminder";
				elements.ToCReminder.classList.remove("grey");
				elements.ToCReminder.classList.add("green");
			} else {
				localStorage.track3oC = "false";
				elements.ToCReminder.value = "Turn on 3oC reminder";
				elements.ToCReminder.classList.add("grey");
				elements.ToCReminder.classList.remove("green");
			}

		}, false);
	}
	if (elements.toggleSystem) {
		if (bungie.getMemberships().length > 1) {
			elements.toggleSystem.classList.remove("hidden");
		}
		if (localStorage.activeType === "xbl") {
			elements.toggleSystem.value = "Swap to PSN";
			elements.toggleSystem.classList.remove("green");
		}
		if (localStorage.activeType === "psn") {
			elements.toggleSystem.value = "Swap to XBOX";
			elements.toggleSystem.classList.add("green");
		}
		elements.toggleSystem.addEventListener("click", function() {
			if (localStorage.activeType === "psn") {
				elements.toggleSystem.value = "Swap to PSN";
				elements.toggleSystem.classList.remove("green");
				localStorage.activeType = "xbl";
			} else {
				elements.toggleSystem.value = "Swap to Xbox";
				elements.toggleSystem.classList.add("green");
				localStorage.activeType = "psn";
			}
		}, false);
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
	if (elements.autoLock && elements.track3oC) {
		elements.autoLock.checked = localStorage.autoLock === "true";
		elements.autoLock.addEventListener("change", handleCheckboxChange, false);
		elements.track3oC.checked = localStorage.track3oC === "true";
		elements.track3oC.addEventListener("change", handleCheckboxChange, false);
	}
}

function handleCheckboxChange(event) {
	localStorage[event.target.id] = event.target.checked;
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
			checkForUpdates();
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

function createItems(itemDiff, className, moveType) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className);
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
	return subContainer;
}

function createProgress(itemDiff, className, moveType) {
	var subContainer = document.createElement("div");
	subContainer.classList.add("sub-section", className);
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
	var localTime = moment.utc(timestamp).tz(timezone);
	subContainer.textContent =localTime.fromNow() + activity;
	subContainer.setAttribute("title", localTime.format("ddd[,] ll LTS"));
	subContainer.dataset.timestamp = timestamp;
	subContainer.dataset.activity = activity;
	subContainer.dataset.index = itemDiff.id;
	return subContainer;
}

var lastIndex = -1;
var pages = ["added", "removed", "progression", "transferred", "date"];
var fragments = {};
for (let page of pages) {
	fragments[page] = document.createDocumentFragment();
}

function work(item, index) {
	// logger.startLogging("UI");
	if (lastIndex < index) {
		if (!item.added) {
			console.log(item);
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
		fragments.date.insertBefore(createDate(item, className), fragments.date.firstChild);
		fragments.progression.insertBefore(createProgress(item, className, "progression"), fragments.progression.firstChild);
		for (let page of pages) {
			if (page !== "date" && page !== "progression") {
				fragments[page].insertBefore(createItems(item, className, page), fragments[page].firstChild);
			}
		}
	}
}

function postWork(resolve) {
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
				tempFragments[page].appendChild(fragments[page].children[i].cloneNode(true));
			}
		}
		window.requestAnimationFrame(function() {
			for (let page of pages) {
				elements[page].appendChild(tempFragments[page]);
			}
			window.requestAnimationFrame(postDisplay);
		});
	}
	resolve();
}

function postDisplay() {
	constructMatchInterface();
	makePages();
	oldItemChangeQuantity = (currentItemSet && currentItemSet.length);
	oldPageNumber = pageNumber;
}

var timezone = moment.tz.guess();

function displayResults(customItems) {
	if(customItems && customItems.length) {
		currentItemSet = customItems;
	}
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

function makeItem(itemData, classRequirement) {
	var docfrag = document.createDocumentFragment();
	var itemContainer = document.createElement("div");
	itemContainer.classList.add("item-container");
	var container = document.createElement("div");
	var stat = document.createElement("div");
	itemContainer.appendChild(container);
	if (hasQuality(itemData)) {
		var quality = document.createElement("div");
		itemContainer.appendChild(quality);
		quality.classList.add("quality");
		stat.classList.add("with-quality");
		var qualityData = parseItemQuality(itemData);
		quality.style.background = qualityData.color;
		quality.textContent = qualityData.min + "%";
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
	passData(container, itemData, classRequirement);
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
	} else if (DestinyProgressionDefinition[progressData.progressionHash].icon) {
		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyProgressionDefinition[progressData.progressionHash].icon + "')");
	} else if (progressData.name === "pvp_iron_banner.loss_tokens") {
		container.setAttribute("style", "background-image: url('http://bungie.net" + getItemDefinition(3397982326).icon + "')");
	} else if (progressData.name === "r1_s4_hiveship_orbs") {
		container.setAttribute("style", "background-image: url('http://bungie.net" + getItemDefinition(1069694698).icon + "')");
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

function passData(DomNode, itemData, classRequirement) {
	// logger.startLogging("UI");
	var itemDefinition = getItemDefinition(itemData.itemHash);
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
	DomNode.dataset.primaryStatName = primaryStatName(itemData);
	DomNode.dataset.itemDescription = itemDefinition.itemDescription;
	DomNode.dataset.damageTypeName = elementType(itemData);
	DomNode.dataset.classRequirement = "";
	if (classRequirement) {
		DomNode.dataset.classRequirement = classRequirement;
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
		DomNode.dataset.itemName = factionData.factionName;
		DomNode.dataset.itemDescription = factionData.factionDescription;
	} else {
		let factionData = DestinyProgressionDefinition[diffData.progressionHash];
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
	DomNode.dataset.classRequirement = "";
	if (classRequirement) {
		DomNode.dataset.classRequirement = classRequirement;
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