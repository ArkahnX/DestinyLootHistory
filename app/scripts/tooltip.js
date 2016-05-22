function handleTooltipData(dataset) {
	transitionInterval = setTimeout(function() {
		setTooltipData(dataset);
	}, 100);
}

function setTooltipData(dataset) {
	if (dataset.tierTypeName) {
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
		handleStats(dataset.itemTypeName, dataset).then(function() {
			tooltip.classList.remove("hidden", "arc", "void", "solar", "kinetic", "common", "legendary", "rare", "uncommon", "exotic");
			tooltip.classList.add(dataset.tierTypeName.toLowerCase(), dataset.damageTypeName.toLowerCase());
		});
	}
}

function handleStats(statType, dataset) {
	return new Promise(function(resolve, reject) {
		if (statType === "Faction") {
			return handleFactionStats(dataset, resolve, reject);
		}
		if (/(bounty|quest)/i.test(statType)) {
			return handleBountyStats(dataset, resolve, reject);
		}
		if (statType === "Material" || statType === "Consumable") {
			return handleEmptyStats(dataset, resolve, reject);
		}
		return handleOtherStats(dataset, resolve, reject);
	});
}

var statHashes = [155624089, 943549884, 1240592695, 1345609583, 3555269338, 3871231066, 4043523819, 4188031367, 4284893193, 144602215, 1735777505, 4244567218, 2961396640, 3614673599, 2837207746, 2762071195, 209426660, 925767036, 2523465841];

function handleOtherStats(dataset, resolve, reject) {
	var statContainer = document.getElementById("stat-table");
	statContainer.innerHTML = "";
	var itemDef = DestinyCompactItemDefinition[dataset.itemHash];
	if (dataset.statTree) {
		var stats = JSON.parse(dataset.statTree);
		var sortedStats = {};
		for (var stat of itemDef.stats) {
			if (statHashes.indexOf(stat.statHash) > -1) {
				sortedStats[stat.statHash] = {
					minimum: stat.minimum,
					maximum: stat.maximum,
					value: stat.value,
					statName: DestinyStatDefinition[stat.statHash].statName
				};
			}
		}
		for (let stat of stats) {
			if (!sortedStats[stat.statHash]) {
				console.error(sortedStats, stats);
			}
			sortedStats[stat.statHash].value = stat.value;
			// sortedStats[stat.statHash].statName = stat.statName;
		}
		for (let stat of sortedStats) {
			var statDef = itemDef.stats[stat.statHash];
			var tableRow = document.createElement("tr");
			tableRow.classList.add("itemStat");
			var tableText = document.createElement("td");
			tableText.classList.add("statName");
			tableText.textContent = stat.statName;
			var tableData = document.createElement("td");
			tableData.classList.add("valueBar");
			if (stat.value === 0) {
				tableData.appendChild(statBar(stat.maximum, 100, stat.maximum, stat.value));
			} else {
				tableData.appendChild(statBar(stat.maximum, 100, stat.maximum - stat.value, stat.value));
			}
			tableRow.appendChild(tableText);
			tableRow.appendChild(tableData);
			statContainer.appendChild(tableRow);
		}
	}
	if (dataset.objectiveTree) {
		var objectives = JSON.parse(dataset.objectiveTree);
		for (let stat of objectives) {
			var displayDescription = DestinyObjectiveDefinition[stat.objectiveHash].displayDescription;
			var completionValue = DestinyObjectiveDefinition[stat.objectiveHash].completionValue;
			var tableRowOne = document.createElement("tr");
			tableRowOne.classList.add("itemStat", "bounty");
			var tableRowTwo = document.createElement("tr");
			tableRowTwo.classList.add("itemStat", "bounty");
			let tableText = document.createElement("td");
			tableText.classList.add("statName");
			tableText.setAttribute("colspan", "2");
			tableText.textContent = displayDescription;
			let tableData = document.createElement("td");
			tableData.classList.add("valueBar");
			tableData.setAttribute("colspan", "2");
			tableData.appendChild(statBar(stat.progress, completionValue, 0, stat.progress));
			tableRowOne.appendChild(tableText);
			tableRowTwo.appendChild(tableData);
			statContainer.appendChild(tableRowOne);
			statContainer.appendChild(tableRowTwo);
		}
	}
	resolve();
}

function handleBountyStats(dataset, resolve, reject) {
	var statContainer = document.getElementById("stat-table");
	statContainer.innerHTML = "";
	var itemDef = DestinyCompactItemDefinition[dataset.itemHash];
	if (dataset.objectiveTree) {
		var objectives = JSON.parse(dataset.objectiveTree);
		for (var stat of objectives) {
			var displayDescription = DestinyObjectiveDefinition[stat.objectiveHash].displayDescription;
			var completionValue = DestinyObjectiveDefinition[stat.objectiveHash].completionValue;
			var tableRowOne = document.createElement("tr");
			tableRowOne.classList.add("itemStat", "bounty");
			var tableRowTwo = document.createElement("tr");
			tableRowTwo.classList.add("itemStat");
			var tableText = document.createElement("td");
			tableText.classList.add("statName");
			tableText.textContent = displayDescription;
			var tableData = document.createElement("td");
			tableData.classList.add("valueBar");
			tableData.appendChild(statBar(stat.progress, completionValue, 0, stat.progress));
			tableRowOne.appendChild(tableText);
			tableRowTwo.appendChild(tableData);
			statContainer.appendChild(tableRowOne);
			statContainer.appendChild(tableRowTwo);
		}
	}
	resolve();
}

function handleEmptyStats(dataset, resolve, reject) {
	var statContainer = document.getElementById("stat-table");
	statContainer.innerHTML = "";
	resolve();
}

function handleFactionStats(dataset, resolve, reject) {
	var statContainer = document.getElementById("stat-table");
	statContainer.innerHTML = "";
	var tableRow = document.createElement("tr");
	tableRow.classList.add("itemStat");
	var tableText = document.createElement("td");
	tableText.classList.add("statName");
	tableText.textContent = "Rank " + dataset.level;
	var tableData = document.createElement("td");
	tableData.classList.add("valueBar");
	tableData.appendChild(statBar(dataset.progressToNextLevel, dataset.nextLevelAt, dataset.progressChange, dataset.progressToNextLevel));
	tableRow.appendChild(tableText);
	tableRow.appendChild(tableData);
	statContainer.appendChild(tableRow);
	resolve();
}

function statBar(currentValue, maxValue, baseModifier, displayValue) {
	currentValue = parseInt(currentValue);
	maxValue = parseInt(maxValue);
	baseModifier = parseInt(baseModifier);
	var valueBar = document.createElement("span");
	var valueModifiedByNodeBar = document.createElement("span");
	var valueModifiedBar = document.createElement("span");
	var text = document.createTextNode(displayValue);
	valueBar.classList.add("value");
	valueModifiedByNodeBar.classList.add("valueModifiedByNode");
	if (baseModifier > 0) {
		valueModifiedByNodeBar.classList.add("positive");
	}
	valueModifiedBar.classList.add("valueModified");
	valueBar.style.width = Math.round(((currentValue) / maxValue) * 100) + "%";
	valueBar.dataset.currentValue = currentValue;
	valueBar.dataset.maxValue = maxValue;
	valueBar.dataset.baseModifier = baseModifier;
	if (baseModifier >= currentValue) {
		baseModifier = currentValue;
	}
	valueModifiedBar.style.width = Math.round((baseModifier / currentValue) * 100) + "%";
	valueModifiedByNodeBar.appendChild(valueModifiedBar);
	valueModifiedByNodeBar.appendChild(text);
	valueBar.appendChild(valueModifiedByNodeBar);
	return valueBar;
}