function handleTooltipData(dataset) {
	transitionInterval = setTimeout(function() {
		setTooltipData(dataset)
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
		tooltip.classList.remove("hidden", "arc", "void", "solar", "kinetic", "common", "legendary", "rare", "uncommon", "exotic");
		
	}
}