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
	list.sort(function (a, b) {
		var aDef = getItemDefinition(a);
		var bDef = getItemDefinition(b);
		var aWeight = getSortWeight(aDef);
		var bWeight = getSortWeight(bDef);
		if (aWeight === bWeight) {
			return aDef.itemName.localeCompare(bDef.itemName);
		}
		return aWeight - bWeight;
	});
	// console.log(JSON.stringify(list));
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



// tierType
// Unknown	0
// Currency	1
// Basic	2
// Common	3
// Rare		4
// Superior	5
// Exotic	6

let definitionResults = {};

let definitions = {
	exotic: {
		tierType: [6],
		exclude: [1274330686, 3705198528, 3191797831, 3191797830, 346443851, 2612834019, 3118679308, 3118679309, 1389842216, 2344494719, 2344494718, 1557422751, 3490486525, 3490486524, 135862171, 135862170, 3164616405, 3164616404, 3164616407, 119482465, 2228467481, 119482466, 119482464, 4113238754, 2681212685, 1389842217, 2233757098, 600134030, 3919932809, 4007228882, 3208101038, 162157029, 3473700535, 3103835493, 4270124522, 921478195, 1865771870, 909225554, 104781337, 2272644374, 2272644375, 499191786, 499191787, 1398023011, 838428205, 287395896, 1398023010, 2449500440, 4132383826, 2591213943, 4146057409, 1619609940, 78421062, 2927156752, 3050633443, 2335332317, 2994845057, 1611580929, 2994845058, 2994845059, 3577254054, 144553854, 94883184, 144553855, 144553853, 2771018501, 2771018502, 3455371673, 2771018500, 813361818],
		queries: {
			helmets: [45],
			arms: [46],
			chest: [47],
			legs: [48],
			class: [49],
			autorifle: [5],
			handcannon: [6],
			pulserifle: [7],
			scoutrifle: [8],
			special: [9, 10, 11, 14],
			heavy: [4]
		}
	},
	ironbanner: {
		tierType: [5],
		exclude: [3451716861, 1556318808, 2020019241, 1914248812, 1448055471, 3275079860, 2559980950, 1846030075, 2452629279, 3470167972, 2413349891, 3477470986, 1063666591, 2369983328, 1737847390, 2898884243, 391890850, 541785999, 1571566214, 925496553, 2902070748, 1157862961, 694579350, 1898672999, 443208337, 651478697, 2566597498, 42867523, 333467661, 2429881589, 2266818225, 883472904, 1864523264, 1984812258, 3345355735, 2266591883, 337037804, 3345355735],
		queries: {},
		names: {
			companion: ["Iron Companion"],
			regalia: ["Iron Regalia"],
			breed: ["Iron Breed"],
			doi: ["Days of Iron"],
			saga: ["Iron Saga"],
			camelot: ["Iron Camelot"],
			legacy: ["A brute force weapon, forged in fire by the Lords of the Iron Banner.", "A high-impact weapon, forged in fire by the Lords of the Iron Banner.", "An advanced energy weapon, forged in fire by the Lords of the Iron Banner.", "A sharpshooter's weapon, forged in fire by the Lords of the Iron Banner.", "A heavy-fire weapon, forged in fire by the Lords of the Iron Banner.", "A precision-fire weapon, forged in fire by the Lords of the Iron Banner.", "An auto-fire weapon, forged in fire by the Lords of the Iron Banner.", "A burst-fire weapon, forged in fire by the Lords of the Iron Banner.", "A personal firearm, forged in fire by the Lords of the Iron Banner.", "A versatile sidearm, forged by Häkke for the Lords of the Iron Banner."],
		},
	},
	trials: {
		tierType: [5],
		exclude: [254918725, 2785395614, 4171787962],
		queries: {

		},
		names: {
			watcher: ["\"The watcher does not just observe. The watcher defines the observed.\" —Parables of the Allspring", "\"Light burns. Light heals. Light blinds. Light reveals.\" —Parables of the Allspring", "\"'Out of sight, out of mind,' they say. The Speaker wishes this was true.\" —Fractal Scrolls"],
			exile: ["\"They who entered the Speaker's chambers as master and apprentice were bitter rivals when they left.\" —Brother Vance", "\"Many followed him when he left—if not with their feet, then with their hearts.\" —Fractal Scrolls", "\"Let the heat melt your body so your soul might flow with the river of time.\" —Parables of the Allspring", "\"Was he exiled? Did he leave willingly? Was the parting angry? Peaceful? Is he dead? Alive? In a word: yes.\" —Sister Faora", "\"Strengthen the body, empower the mind.\" —Parables of the Allspring", "\"Though the City won a great battle at Twilight Gap, it lost an even greater mind.\" —Sister Lupe", "\"Don't you find it strange that the one called The Speaker rarely has anything useful to say?\" —Sayings of the Disciples"],
			blindsight: ["\"With the sight I saw the self within the self.\" —Fractal Scrolls", "\"I shrouded myself so when the Light returned I could see it all the clearer.\" —Parables of the Allspring", "\"The courage to walk into the Darkness, but strength to return to the Light.\" —Parables of the Allspring"],
			legacy: ["Join the dance of fire and birth.", "From deep within the shadows it came—a messenger borne on black wings.", "You can't pull an all-nighter when the sun never sets.", "An elite trophy earned only by Trials of Osiris champions.", "\"The sun took my sight, thus the sun became my eyes.\" —Parables of the Allspring", "Even the brightest stars eventually set.", "In the mirrorlike crags of the Fields of Glass, a single mote of dust produces infinite reflections.", "Could you please repeat the question?", "It's a blessing in disguise.", "Its shimmering facets extend beyond sight or touch."]
		}
	},
	raid: {
		tierType: [5],
		exclude: [],
		queries: {

		}
	}
}

function indexOfArray(array, valuesToSearchFor) {
	let result = 0;
	for (let value of valuesToSearchFor) {
		if (array.indexOf(value) > -1) {
			result++;
		}
	}
	return result > 0;
}

let vogLoot = [2542033072, 621603243, 2154053164, 3742521821, 3632330099, 3598793896, 2001493563, 2125403517, 3569444312, 242628276, 1784034858];
let newLoot = [];
for (let itemDef of DestinyCompactItemDefinition) {
	if (itemDef.itemCategoryHashes && itemDef.itemName && itemDef.tierType && itemDef.itemDescription) {
		for (let loot of vogLoot) {
			let lootDef = getItemDefinition(loot);
			if (itemDef.itemName.indexOf(lootDef.itemName) > -1 && vogLoot.indexOf(itemDef.itemHash) === -1 && newLoot.indexOf(itemDef.itemHash) === -1) {
				newLoot.push(itemDef.itemHash);
			}
		}
		for (let groupName in definitions) {
			if (!definitionResults[groupName]) {
				definitionResults[groupName] = {};
			}
			let group = definitions[groupName];
			if (group.tierType.indexOf(itemDef.tierType) > -1 && group.exclude.indexOf(itemDef.itemHash) === -1) {
				for (let queryName in group.queries) {
					if (!definitionResults[groupName][queryName]) {
						definitionResults[groupName][queryName] = [];
					}
					let query = group.queries[queryName];
					if (indexOfArray(itemDef.itemCategoryHashes, query)) {
						definitionResults[groupName][queryName].push(itemDef.itemHash);
					}
				}
				for (let name in group.names) {
					if (!definitionResults[groupName][name]) {
						definitionResults[groupName][name] = [];
					}
					let query = group.names[name];
					if (indexOfArray(itemDef.itemDescription, query)) {
						definitionResults[groupName][name].push(itemDef.itemHash);
					}
				}
			}
		}
	}
}
for (let group of definitionResults) {
	for (let queryName in group) {
		group[queryName] = JSON.stringify(sortList(group[queryName]));
	}
}
console.log(JSON.stringify(definitionResults, null, "\t"));
console.log(JSON.stringify(sortList(newLoot)));