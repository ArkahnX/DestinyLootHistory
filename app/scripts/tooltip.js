var tooltipTimeout = null;
var hideTooltipTimeout = null;
var newInventories = newInventories || {};
var lastToolTipItemInstance = "";
var tooltipSide = "right";

function hideTooltip() {
	hideTooltipTimeout = null;
	elements.tooltip.classList.add("hidden");
	lastToolTipItemInstance = "";
}

function handleTooltipData(dataset, element, event, preventFlipping) {
	clearTimeout(tooltipTimeout);
	if (lastToolTipItemInstance !== dataset.itemHash + "-" + dataset.itemInstanceId) {
		tooltipTimeout = setTimeout(function () {
			if (!preventFlipping) {
				if (window.innerWidth / 2 > element.getBoundingClientRect().left) {
					tooltipSide = "right";
				} else {
					tooltipSide = "left";
				}
			}
			setTooltipData(dataset, element, event);
		}, 500);
	}
}

function setTooltipData(dataset, element, event) {
	lastToolTipItemInstance = dataset.itemHash + "-" + dataset.itemInstanceId;
	var itemDetails = dataset;
	document.getElementById("tag").classList.add("hidden");
	if (element.className.indexOf("faction") === -1 || element.className.indexOf("currency") > -1) {
		itemDetails = getItemDefinition(dataset.itemHash);
	}
	if (dataset.itemName || itemDetails.itemName) {
		elements.tooltip.dataset.itemInstanceId = dataset.itemInstanceId;
		elements.tooltip.dataset.itemHash = dataset.itemHash;
		if (dataset.canTag) {
			document.getElementById("tag").value = dataset.tagHash;
			document.getElementById("tag").classList.remove("hidden");
		}
		if (dataset.itemImage || itemDetails.icon) {
			elements.itemImage.src = "https://www.bungie.net" + (dataset.itemImage || itemDetails.icon);
		} else if (dataset.itemName === "Classified" || itemDetails.itemName === "Classified") {
			elements.itemImage.src = "img/classified.jpg";
		} else {
			elements.itemImage.src = "img/missing.png";
		}
		if (dataset.itemTypeName === "Faction") {
			elements.squareProgress.dataset.max = dataset.nextLevelAt;
			elements.squareProgress.dataset.value = dataset.progressToNextLevel;
		} else {
			elements.squareProgress.dataset.max = 1;
			elements.squareProgress.dataset.value = 0;
		}
		elements.itemName.textContent = dataset.itemName || itemDetails.itemName;
		elements.itemType.textContent = dataset.itemTypeName || itemDetails.itemTypeName;
		elements.itemRarity.textContent = dataset.tierTypeName || itemDetails.tierTypeName;
		elements.itemRequiredEquipLevel.textContent = dataset.equipRequiredLevel || itemDetails.equipRequiredLevel || 0;
		var t = elements.squareProgress.dataset.value / elements.squareProgress.dataset.max;
		if (t > 0 && t !== Infinity) {
			var n = new SquareProgress(elements.squareProgress, t);
			n.backgroundColor = "rgba(0,0,0,0)";
			n.borderColor = "rgba(0,0,0,0)";
			n.draw();
			elements.squareProgress.classList.remove("hidden");
		} else {
			elements.squareProgress.classList.add("hidden");
		}
		if (dataset.equipRequiredLevel === "0") {
			elements.levelText.classList.add("hidden");
		} else {
			elements.levelText.classList.remove("hidden");
		}
		if (dataset.primaryStat && dataset.primaryStat.charAt(0) === "{") {
			var parsedPrimaryStat = JSON.parse(dataset.primaryStat);
			elements.itemPrimaryStat.textContent = parsedPrimaryStat.value;
			elements.itemStatText.textContent = DestinyStatDefinition[parsedPrimaryStat.statHash].statName;
		} else {
			elements.itemPrimaryStat.textContent = dataset.primaryStat;
			elements.itemStatText.textContent = dataset.primaryStatName;
		}
		elements.itemDescription.innerHTML = dataset.itemDescription || itemDetails.itemDescription;
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
			if (json) {
				elements.classRequirement.innerHTML = "<span>" + json + "</span>";
			}
		}
		handleStats(dataset.itemTypeName, dataset).then(function () {
			elements.tooltip.className = "flex-tooltip " + tooltipSide;
			var tierTypeName = dataset.tierTypeName || itemDetails.tierTypeName || "Common";
			var damageTypeName = dataset.damageTypeName || (dataset.damageTypeHash && DestinyDamageTypeDefinition[dataset.damageTypeHash] && DestinyDamageTypeDefinition[dataset.damageTypeHash].damageTypeName) || "Kinetic";
			elements.tooltip.classList.add(tierTypeName.toLowerCase(), damageTypeName.toLowerCase());
			if (dataset.sourceName) {
				var temp = JSON.parse(dataset.sourceName);
				for (var name of temp) {
					elements.tooltip.classList.add(name);
				}
			}
			// console.log(event, tooltip.clientHeight, element.parentNode.offsetTop);
			// console.dir(element.parentNode.getBoundingClientRect())
			// tooltip.
		});
	}
}

function handleStats(statType, dataset) {
	return new Promise(function (resolve, reject) {

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
	elements.compareTable.innerHTML = "";
	var itemDef = null;
	if (DestinyFactionDefinition[dataset.itemHash]) {
		itemDef = DestinyFactionDefinition[dataset.itemHash];
	} else if (DestinyProgressionDefinition[dataset.itemHash]) {
		itemDef = DestinyProgressionDefinition[dataset.itemHash];
	} else {
		itemDef = getItemDefinition(dataset.itemHash);
	}
	if (dataset.level) {
		elements.statTable.innerHTML = "";
		var tableRow = document.createElement("tr");
		tableRow.classList.add("itemStat");
		var tableText = document.createElement("td");
		tableText.classList.add("statName");
		tableText.textContent = "Rank " + dataset.level;
		var tableData = document.createElement("td");
		tableData.classList.add("valueBar");
		tableData.appendChild(progressBar(dataset.progressToNextLevel, dataset.nextLevelAt, dataset.progressChange));
		tableRow.appendChild(tableText);
		tableRow.appendChild(tableData);
		elements.statTable.appendChild(tableRow);
	}
	if (dataset.stats && itemDef.stats) {
		var stats = JSON.parse(dataset.stats);
		var sortedStats = [];
		var missingItemDefStats = true;
		for (var statDef of itemDef.stats) {
			if (statHashes.indexOf(statDef.statHash) > -1) {
				missingItemDefStats = false;
				break;
			}
		}
		if (missingItemDefStats) {
			for (let statHash of statHashes) {
				for (let stat of stats) {
					if (stat.statHash === statHash) {
						sortedStats.push({
							minimum: 0,
							maximum: 25,
							value: stat.value,
							statName: DestinyStatDefinition[stat.statHash].statName
						});
					}
				}
			}
		} else {
			for (let statHash of statHashes) {
				for (let statDef of itemDef.stats) {
					let found = false;
					if (statDef.statHash === statHash) {
						found = true;
					}
					for (let stat of stats) {
						if (stat.statHash === statHash && statDef.statHash === statHash) {
							if (statDef.maximum < stat.value) {
								statDef.maximum = stat.value;
							}
							sortedStats.push({
								minimum: statDef.minimum,
								maximum: statDef.maximum,
								value: stat.value,
								statName: DestinyStatDefinition[stat.statHash].statName
							});
							found = false;
						}
					}
					if (found === true && statDef.value !== 0) {
						if (statDef.maximum < statDef.value) {
							statDef.maximum = statDef.value;
						}
						sortedStats.push({
							minimum: statDef.minimum,
							maximum: statDef.maximum,
							value: statDef.value,
							statName: DestinyStatDefinition[statDef.statHash].statName
						});
					}
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
	if (dataset.qualityMin) {
		var tableRow = document.createElement("tr");
		tableRow.classList.add("itemStat");
		var tableText = document.createElement("td");
		tableText.classList.add("statName");
		var minQuality = parseInt(dataset.qualityMin);
		var maxQuality = parseInt(dataset.qualityMax);
		if (parseInt(dataset.primaryStat) === 335) {
			maxQuality = minQuality;
		}
		tableText.style.color = dataset.qualityColor;
		tableText.textContent = "Quality (" + minQuality + " - " + maxQuality + ")";
		var tableData = document.createElement("td");
		tableData.classList.add("valueBar");
		var max = 100;
		if (maxQuality > 100) {
			max = maxQuality;
		}
		tableData.appendChild(statBar(maxQuality, max, maxQuality - minQuality, minQuality));
		tableRow.appendChild(tableText);
		tableRow.appendChild(tableData);
		elements.statTable.appendChild(tableRow);
	}
	if (dataset.costs) {
		var costs = JSON.parse(dataset.costs);
		for (var cost of costs) {
			var costDef = getItemDefinition(cost.itemHash);
			let tableRow = document.createElement("tr");
			tableRow.classList.add("itemStat", "cost");
			let costIcon = document.createElement("td");
			costIcon.classList.add("statName", "node");
			costIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + costDef.icon + "')");
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
	if (elements.itemCompare && itemDef.itemCategoryHashes && (itemDef.itemCategoryHashes.indexOf(20) > -1 || itemDef.itemCategoryHashes.indexOf(1) > -1)) {
		var comparisonItems = [];
		var sourceInventories = newInventories;
		if (Object.keys(data.inventories).length) {
			sourceInventories = data.inventories;
		}
		for (var characterInventory of sourceInventories) {
			for (var item of characterInventory.inventory) {
				if (item.itemHash === parseInt(dataset.itemHash)) {
					comparisonItems.push(item);
				}
			}
		}
		if (comparisonItems.length > 1 || typeof lastVendor !== "undefined") {
			comparisonItems.sort(function (a, b) {
				a.itemInstanceId.localeCompare(b.itemInstanceId);
			});
			let titleRow = document.createElement("tr");
			titleRow.classList.add("node-list");
			let titleText = document.createElement("td");
			titleText.textContent = "Comparison";
			titleText.setAttribute("colspan", "3");
			titleRow.appendChild(titleText);
			elements.compareTable.appendChild(titleRow);
			let compareRow = document.createElement("tr");
			compareRow.classList.add("node-list");
			for (var item of comparisonItems) {
				let tableText = document.createElement("td");
				tableText.classList.add("node");
				tableText.appendChild(makeItem(item));
				compareRow.appendChild(tableText);
				if (compareRow.children.length === 3) {
					elements.compareTable.appendChild(compareRow);
					compareRow = document.createElement("tr");
					compareRow.classList.add("node-list");
				}
			}
			if (compareRow.children.length > 0) {
				elements.compareTable.appendChild(compareRow);
			}
		}
	}
	if (dataset.objectives) {
		var objectives = JSON.parse(dataset.objectives);
		for (let stat of objectives) {
			if (DestinyObjectiveDefinition[stat.objectiveHash]) {
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
	}
	if (dataset.nodes && dataset.talentGridHash) {
		var nodeData = getNodes(false, JSON.parse(dataset.nodes), parseInt(dataset.talentGridHash, 10));
		if (itemDef.bucketTypeHash === 4023194814) {
			nodeData.columns = nodeData.columns + 1;
		}
		for (var i = 0; i < nodeData.rows; i++) {
			let NodeList = document.createElement("tr");
			NodeList.classList.add("node-list");
			for (var e = 0; e < nodeData.columns; e++) {
				let tableText = document.createElement("td");
				tableText.id = `row${i+1}column${e+1}`;
				NodeList.appendChild(tableText);
			}
			elements.nodeTable.appendChild(NodeList);
		}
		if (nodeData && nodeData.nodes) {
			// var talentDef = DestinyCompactTalentDefinition[dataset.talentGridHash];
			for (let node of nodeData.nodes) {
				let tableText = document.getElementById(`row${node.row}column${node.column}`);
				tableText.classList.add("node");
				tableText.dataset.state = node.state;
				// tableText.classList.add("node");
				if (node.icon) {
					tableText.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + node.icon + "')");
				}
				if (node.isActivated) {
					tableText.classList.add("node-selected");
				} else if (node.state === 9 || node.state === 1 || node.state === 5 || node.state === 6) {
					tableText.classList.add("node-complete");
				}
				tableText.title = node.nodeStepName + " \n" + node.nodeStepDescription;
				if (DEBUG) {
					// console.log(node, talentDef);
					// var nodeDef = talentDef.nodes[node.nodeHash];
					// var stepDef = nodeDef.steps[node.stepIndex];
					// var activatedAtGridLevel = stepDef.activationRequirement.gridLevel;
					tableText.title = node.nodeStepName + " \n" + node.nodeStepDescription + " \nState: " + node.state + " \nGrid: " + node.activatedAtGridLevel;
				}
			}
		}
		if (itemDef.bucketTypeHash === 4023194814) { // ghost shell icons
			console.log(nodeData)
			if (nodeData.rows > 1 && nodeData.columns > 1) {
				let materialIcon = document.getElementById(`row${1}column${nodeData.columns}`);
				let guardianIcon = document.getElementById(`row${2}column${nodeData.columns}`);
				let guardianText = document.getElementById(`row${1}column${4}`).title.split(" ")[0];
				let materialText = document.getElementById(`row${1}column${3}`).title.split(" ")[0];
				materialIcon.classList.add("node");
				guardianIcon.classList.add("node");
				if (materialText === "Relic") {
					materialIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[3242866270].icon + "')");
				} else if (materialText === "Spinmetal") {
					materialIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[2882093969].icon + "')");
				} else if (materialText === "Helium") {
					materialIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[1797491610].icon + "')");
				} else if (materialText === "Spirit") {
					materialIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[2254123540].icon + "')");
				} else if (materialText === "Wormspore") {
					materialIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[3164836592].icon + "')");
				}
				if (guardianText === "Titan") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[1723894001].icon + "')");
				} else if (guardianText === "Warlock") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[776529032].icon + "')");
				} else if (guardianText === "Hunter") {
					guardianIcon.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + DestinyCompactItemDefinition[855333071].icon + "')");
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
				// materialIcon.title = materialText;
				// guardianIcon.title = guardianText;

				// tableText.classList.add("node");
				// if (node.icon) {
				// tableText.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + node.icon + "')");
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
	if (dataset.objectives) {
		var objectives = JSON.parse(dataset.objectives);
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
	tableData.appendChild(progressBar(dataset.progressToNextLevel, dataset.nextLevelAt, dataset.progressChange));
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

function progressBar(currentValue, maxValue, baseModifier) {
	currentValue = parseInt(currentValue);
	maxValue = parseInt(maxValue);
	baseModifier = parseInt(baseModifier);
	var container = document.createElement("span");
	var valueBar = document.createElement("span");
	var valueModifiedByNodeBar = document.createElement("span");
	var valueModifiedBar = document.createElement("span");
	var text = document.createElement("span");
	text.classList.add("progress-text");
	text.textContent = `${currentValue} / ${maxValue}`;
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
	valueModifiedBar.style.width = "100%";
	valueModifiedByNodeBar.appendChild(valueModifiedBar);
	// valueModifiedByNodeBar.appendChild(text);
	valueBar.appendChild(valueModifiedByNodeBar);
	container.appendChild(text);
	container.appendChild(valueBar);
	return container;
}