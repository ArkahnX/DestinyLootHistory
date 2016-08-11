var tooltipTimeout = null;

function handleTooltipData(dataset, element, event) {
	clearTimeout(tooltipTimeout);
	tooltipTimeout = setTimeout(function() {
		setTooltipData(dataset, element, event);
	}, 100);
}

function setTooltipData(dataset, element, event) {
	if (dataset.itemName) {
		elements.itemName.textContent = dataset.itemName;
		elements.itemType.textContent = dataset.itemTypeName;
		elements.itemRarity.textContent = dataset.tierTypeName;
		elements.itemRequiredEquipLevel.textContent = dataset.equipRequiredLevel;
		if (dataset.equipRequiredLevel === "0") {
			elements.levelText.classList.add("hidden");
		} else {
			elements.levelText.classList.remove("hidden");
		}
		elements.itemPrimaryStat.textContent = dataset.primaryStat;
		elements.itemStatText.textContent = dataset.primaryStatName;
		elements.itemDescription.textContent = dataset.itemDescription;
		elements.classRequirement.innerHTML = "";
		let json = dataset.classRequirement;
		try {
			json = JSON.parse(dataset.classRequirement);
			var result = [];
			for (var unlockStatus of json) {
				if (unlockStatus.isSet === true) {
					result.push(`<span><i class="fa fa-check-square-o"></i> ${unlockStatus.description}</span>`);
				} else {
					result.push(`<span class="unmet"><i class="fa fa-square-o"></i> ${unlockStatus.description}</span>`);
				}
			}
			elements.classRequirement.innerHTML = result.join("\n");
		} catch (e) {
			elements.classRequirement.innerHTML = "<span>" + json + "</span>";
		}
		handleStats(dataset.itemTypeName, dataset).then(function() {
			elements.tooltip.classList.remove("arc", "void", "solar", "kinetic", "common", "legendary", "rare", "uncommon", "exotic");
			elements.tooltip.classList.add(dataset.tierTypeName.toLowerCase(), dataset.damageTypeName.toLowerCase());
			// console.log(event, tooltip.clientHeight, element.parentNode.offsetTop);
			// console.dir(element.parentNode.getBoundingClientRect())
			// tooltip.
		});
	}
}

function handleStats(statType, dataset) {
	return new Promise(function(resolve, reject) {

		elements.statTable.innerHTML = "";

		elements.nodeTable.innerHTML = "";
		elements.costTable.innerHTML = "";
		// console.log(statType)
		// if (statType === "Faction") {
		// 	return handleFactionStats(dataset, resolve, reject);
		// }
		// if (/(bounty|quest)/i.test(statType)) {
		// 	return handleBountyStats(dataset, resolve, reject);
		// }
		// if (statType === "Material" || statType === "Consumable") {
		// 	return handleEmptyStats(dataset, resolve, reject);
		// }
		return handleOtherStats(dataset, resolve, reject);
	});
}

var statHashes = [4284893193, 2837207746, 2961396640, 4043523819, 3614673599, 1240592695, 2523465841, 155624089, 2762071195, 4188031367, 3871231066, 943549884, 1345609583, 3555269338, 144602215, 1735777505, 4244567218, 209426660, 925767036];

function handleOtherStats(dataset, resolve) {
	elements.statTable.innerHTML = "";
	elements.nodeTable.innerHTML = "";
	elements.costTable.innerHTML = "";
	var itemDef = null;
	console.log()
	if (DestinyFactionDefinition[dataset.itemHash]) {
		itemDef = DestinyFactionDefinition[dataset.itemHash];
	} else if (DestinyProgressionDefinition[dataset.itemHash]) {
		itemDef = DestinyProgressionDefinition[dataset.itemHash];
	} else {
		itemDef = getItemDefinition(dataset.itemHash);
	}
	if (dataset.statTree) {
		var stats = JSON.parse(dataset.statTree);
		var sortedStats = [];
		for (var statHash of statHashes) {
			for (var statDef of itemDef.stats) {
				let found = false;
				if (statDef.statHash === statHash) {
					found = true;
				}
				for (var stat of stats) {
					if (stat.statHash === statHash && statDef.statHash === statHash) {
						sortedStats.push({
							minimum: statDef.minimum,
							maximum: statDef.maximum,
							value: stat.value,
							statName: DestinyStatDefinition[stat.statHash].statName
						});
						found = false;
					}
				}
				if (found === true) {
					sortedStats.push({
						minimum: statDef.minimum,
						maximum: statDef.maximum,
						value: statDef.value,
						statName: DestinyStatDefinition[statDef.statHash].statName
					});
				}
			}
		}
		// for (let stat of sortedStats) {
		// 		sortedStats[stat.statHash] = {
		// 			minimum: 0,
		// 			maximum: 0,
		// 			value: 0,
		// 			statName: DestinyStatDefinition[stat.statHash].statName
		// 		};
		// 	}
		// 	sortedStats[stat.statHash].value = stat.value;
		// 	// sortedStats[stat.statHash].statName = stat.statName;
		// }
		for (let stat of sortedStats) {
			var statDef = itemDef.stats[stat.statHash];
			var tableRow = document.createElement("tr");
			tableRow.classList.add("itemStat");
			var tableText = document.createElement("td");
			tableText.classList.add("statName");
			tableText.textContent = stat.statName + " (" + stat.value + "/" + stat.maximum + ")";
			var tableData = document.createElement("td");
			tableData.classList.add("valueBar");
			var maximum = 100;
			if (stat.maximum > 100) {
				maximum = stat.maximum + (stat.maximum * 0.2);
			}
			if (stat.value === 0) {
				tableData.appendChild(statBar(stat.maximum, maximum, stat.maximum, stat.value));
			} else {
				tableData.appendChild(statBar(stat.maximum, maximum, stat.maximum - stat.value, stat.value));
			}
			tableRow.appendChild(tableText);
			tableRow.appendChild(tableData);
			elements.statTable.appendChild(tableRow);
		}
	}
	if (dataset.costs) {
		var costs = JSON.parse(dataset.costs);
		for (var cost of costs) {
			var costDef = getItemDefinition(cost.itemHash);
			let tableRow = document.createElement("tr");
			tableRow.classList.add("itemStat", "cost");
			let costIcon = document.createElement("td");
			costIcon.classList.add("statName", "node");
			costIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + costDef.icon + "')");
			let costName = document.createElement("td");
			costName.classList.add("statName", "leftStat");
			costName.textContent = costDef.itemName;
			let costTotal = document.createElement("td");
			costTotal.classList.add("statName");
			let cost1 = document.createElement("span");
			let cost2 = document.createElement("span");
			cost1.textContent = cost.total;
			cost2.textContent = ` / ${cost.value}`;
			if (cost.total >= cost.value) {
				cost1.classList.add("purchaseable");
				costName.classList.add("purchaseable");
			} else {
				cost1.classList.add("non-purchaseable");
				costName.classList.add("non-purchaseable");
			}
			tableRow.appendChild(costIcon);
			tableRow.appendChild(costName);
			costTotal.appendChild(cost1);
			costTotal.appendChild(cost2);
			tableRow.appendChild(costTotal);
			elements.costTable.appendChild(tableRow);
		}
	}
	if (dataset.objectiveTree) {
		var objectives = JSON.parse(dataset.objectiveTree);
		for (let stat of objectives) {
			var displayDescription = DestinyObjectiveDefinition[stat.objectiveHash].displayDescription;
			var completionValue = DestinyObjectiveDefinition[stat.objectiveHash].completionValue;
			if (dataset.itemTypeName === "Book" && DestinyRecordDefinition[stat.objectiveHash]) {
				displayDescription = DestinyRecordDefinition[stat.objectiveHash].description;
			}
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
			elements.statTable.appendChild(tableRowOne);
			elements.statTable.appendChild(tableRowTwo);
		}
	}
	if (dataset.nodeTree && dataset.talentGridHash) {
		var nodeData = getNodes(false, JSON.parse(dataset.nodeTree), parseInt(dataset.talentGridHash, 10));
		if (itemDef.bucketTypeHash === 4023194814) {
			nodeData.columns = nodeData.columns + 1;
		}
		for (var i = 0; i < nodeData.rows; i++) {
			let NodeList = document.createElement("tr");
			NodeList.classList.add("node-list");
			for (var e = 0; e < nodeData.columns; e++) {
				let tableText = document.createElement("td");
				tableText.id = `row${i+1}column${e+1}`;
				tableText.classList.add("node");
				NodeList.appendChild(tableText);
			}
			elements.nodeTable.appendChild(NodeList);
		}
		for (let node of nodeData.nodes) {
			let tableText = document.getElementById(`row${node.row}column${node.column}`);
			// tableText.classList.add("node");
			if (node.icon) {
				tableText.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + node.icon + "')");
			}
			tableText.title = node.nodeStepName;
		}
		if (itemDef.bucketTypeHash === 4023194814) {
			if (nodeData.rows > 1 && nodeData.columns > 1) {
				let materialIcon = document.getElementById(`row${1}column${nodeData.columns}`);
				let guardianIcon = document.getElementById(`row${2}column${nodeData.columns}`);
				let guardianText = document.getElementById(`row${1}column${4}`).title.split(" ")[0];
				let materialText = document.getElementById(`row${1}column${3}`).title.split(" ")[0];
				if (materialText === "Relic") {
					materialIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[3242866270].icon + "')");
				} else if (materialText === "Spinmetal") {
					materialIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[2882093969].icon + "')");
				} else if (materialText === "Helium") {
					materialIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[2254123540].icon + "')");
				} else if (materialText === "Spirit") {
					materialIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[2254123540].icon + "')");
				} else if (materialText === "Wormspore") {
					materialIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[3164836592].icon + "')");
				}
				if (guardianText === "Titan") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[1723894001].icon + "')");
				} else if (guardianText === "Warlock") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[776529032].icon + "')");
				} else if (guardianText === "Hunter") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[855333071].icon + "')");
				} else if (guardianText === "Hunter") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + DestinyCompactItemDefinition[855333071].icon + "')");
				} else if (guardianText === "Cleansing") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'img/hive.png')");
				} else if (guardianText === "Reclamation") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'img/taken.png')");
				} else if (guardianText === "Blue") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'img/vex.png')");
				} else if (guardianText === "Network") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'img/cabal.png')");
				} else if (guardianText === "Ether") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'img/fallen.png')");
				}
				materialIcon.title = materialText;
				guardianIcon.title = guardianText;

				// tableText.classList.add("node");
				// if (node.icon) {
				// tableText.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + node.icon + "')");
				// }
				// tableText.title = node.nodeStepName;
			}
		}
	}
	resolve();
}

function handleBountyStats(dataset, resolve, reject) {
	elements.statTable.innerHTML = "";
	var itemDef = getItemDefinition(dataset.itemHash);
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
			elements.statTable.appendChild(tableRowOne);
			elements.statTable.appendChild(tableRowTwo);
		}
	}
	resolve();
}

function handleEmptyStats(dataset, resolve, reject) {
	elements.statTable.innerHTML = "";
	resolve();
}

function handleFactionStats(dataset, resolve, reject) {
	elements.statTable.innerHTML = "";
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
	elements.statTable.appendChild(tableRow);
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