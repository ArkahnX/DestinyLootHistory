var badNames = ["Chroma", "Ascend", "Infuse", "Upgrade Damage", "Void", "Solar", "Arc", "Kinetic", "Häkke Pulse Rifle", "Häkke Sidearm", "Focused Firefly", "Triple Double", "Sign of Four", "Wait for It", "Two for One", "Quick Reaction", "Hive Disruptor", "Oracle Disruptor", "Running Interference", "Whirlwind's Curse", "White Nail", "Cocoon", "Burn", "Reforge", "Rewind", "Phantom Gift", "Reserve Ammo", "Perfectionist", "Private Eye", "MIRV Mini", "Dark Breaker", "Burgeoning Hunger"];
var weaponPerkHashList = [];
var weaponPerks = [];

function isGoodPerk(itemDef) {
	if (!itemDef.nodeStepName || !itemDef.nodeStepDescription || !itemDef.icon) {
		return false;
	}
	if (itemDef.icon === "/img/misc/missing_icon.png") {
		return false;
	}
	for (var name of badNames) {
		if (itemDef.nodeStepName.indexOf(name) > -1) {
			return false;
		}
		if (itemDef.nodeStepDescription.indexOf(name) > -1) {
			return false;
		}
	}
	return true;
}

function findWeaponPerks(weaponTalentGrids) {
	weaponPerks = [];
	weaponPerkHashList = [];
	for (let gridHash of weaponTalentGrids) {
		let nodes = DestinyCompactTalentDefinition[gridHash].nodes;
		for (let node of nodes) {
			if (!node.isRandomRepurchasable) {
				for (let step of node.steps) {
					if (weaponPerkHashList.indexOf(step.nodeStepHash) === -1) {
						// console.log(`Checking perk: ${step.nodeStepName} - ${step.nodeStepDescription}`);
						if (isGoodPerk(step)) {
							// perkList.push({
							// 	nodeStepName: perkDef.nodeStepName,
							// 	perkHash: perkDef.perkHash,
							// 	icon: perkDef.icon,
							// 	nodeStepDescription: perkDef.nodeStepDescription
							// });
							weaponPerkHashList.push(step.nodeStepHash);
							weaponPerks.push({
								perkName: step.nodeStepName,
								perkHash: step.nodeStepHash,
								icon: step.icon,
								perkDescription: step.nodeStepDescription
							});
						}
					}
				}
			}
		}
	}
	weaponPerks.sort(function (a, b) {
		return a.perkName.localeCompare(b.perkName);
	});
	weaponPerkHashList = [];
	for (let perk of weaponPerks) {
		weaponPerkHashList.push(perk.perkHash);
	}
	// console.log(JSON.stringify(weaponPerks));
}

function findWeaponTalentGrids() {
	var talentGridHashes = [];
	for (let itemDef of DestinyCompactItemDefinition) {
		if (itemDef.tierType === 5 && itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.classType === 3 && itemDef.itemCategoryHashes.indexOf(54) === -1 && itemDef.talentGridHash && talentGridHashes.indexOf(itemDef.talentGridHash) === -1) {
			// console.log(`Finding perks for ${itemDef.itemTypeName} - ${itemDef.itemName} - ${itemDef.itemDescription}`);
			talentGridHashes.push(itemDef.talentGridHash)
		}
	}
	findWeaponPerks(talentGridHashes);
}