function getSortWeight(itemDef) {
	var weight = itemDef.classType * 10 || 0;
	if (itemDef.itemCategoryHashes) {
		if (itemDef.itemCategoryHashes.indexOf(2) > -1) {
			weight += 10;
		} else if (itemDef.itemCategoryHashes.indexOf(3) > -1) {
			weight += 20;
		} else if (itemDef.itemCategoryHashes.indexOf(4) > -1) {
			weight += 30;
		}
		if (itemDef.itemCategoryHashes.indexOf(5) > -1) {
			weight += 40;
		} else if (itemDef.itemCategoryHashes.indexOf(6) > -1) {
			weight += 50;
		} else if (itemDef.itemCategoryHashes.indexOf(7) > -1) {
			weight += 60;
		} else if (itemDef.itemCategoryHashes.indexOf(9) > -1) {
			weight += 70;
		} else if (itemDef.itemCategoryHashes.indexOf(10) > -1) {
			weight += 80;
		} else if (itemDef.itemCategoryHashes.indexOf(11) > -1) {
			weight += 90;
		} else if (itemDef.itemCategoryHashes.indexOf(14) > -1) {
			weight += 100;
		} else if (itemDef.itemCategoryHashes.indexOf(12) > -1) {
			weight += 110;
		} else if (itemDef.itemCategoryHashes.indexOf(13) > -1) {
			weight += 120;
		} else if (itemDef.itemCategoryHashes.indexOf(54) > -1) {
			weight += 130;
		}
		if (itemDef.itemCategoryHashes.indexOf(45) > -1) {
			weight += 1;
		} else if (itemDef.itemCategoryHashes.indexOf(46) > -1) {
			weight += 2;
		} else if (itemDef.itemCategoryHashes.indexOf(47) > -1) {
			weight += 3;
		} else if (itemDef.itemCategoryHashes.indexOf(48) > -1) {
			weight += 4;
		} else if (itemDef.itemCategoryHashes.indexOf(49) > -1) {
			weight += 5;
		}
	}
	// console.log(itemDef.itemName, itemDef.itemCategoryHashes, itemDef.classType, weight)
	return weight;
}

function sortList(list) {
	list.sort(function(a, b) {
		var aDef = getItemDefinition(a);
		var bDef = getItemDefinition(b);
		var aWeight = getSortWeight(aDef);
		var bWeight = getSortWeight(bDef);
		if (aWeight === bWeight) {
			return aDef.itemName.localeCompare(bDef.itemName);
		}
		return aWeight - bWeight;
	});
	console.log(JSON.stringify(list));
	return list;
}

function sortGear(nameObject) {
	for (let group of nameObject) {
		group.hashes = sortList(group.hashes);
	}
	console.log(JSON.stringify(nameObject));
}

function findItemDefinitions(nameObject) {
	for (let itemDef of DestinyCompactItemDefinition) {
		if (itemDef.itemCategoryHashes && itemDef.itemName) {
			if (itemDef.itemCategoryHashes.indexOf(20) > -1) {
				for (let group of nameObject) {
					if (itemDef.itemName.indexOf(group.name) > -1) {
						group.hashes.push(itemDef.itemHash);
					}
				}
			}
		}
	}
	for (let group of nameObject) {
		group.hashes = sortList(group.hashes);
	}
	console.log(JSON.stringify(nameObject));
}

function limitItemDefinitions(list) {
	var newList = [];
	for (var item of list) {
		var itemDef = getItemDefinition(item);
		if (itemDef.sourceHashes && (itemDef.sourceHashes.indexOf(460228854) > -1 || itemDef.sourceHashes.indexOf(24296771) > -1)) {
			newList.push(item);
		}
	}
	console.log(JSON.stringify(newList));
}