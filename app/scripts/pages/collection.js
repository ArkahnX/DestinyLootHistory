tracker.sendAppView('Collection');
logger.disable();
getOption("activeType").then(bungie.setActive);
var globalOptions = {};
getAllOptions().then(function(options) {
	globalOptions = options;
});

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

var newInventories = newInventories || {};

function flattenInventories(inventories) {
	return new Promise(function(resolve) {
		newInventories = inventories;
		var endResult = {
			weapons: {
				category: 1,
				results: []
			},
			armor: {
				category: 20,
				results: []
			},
			emblems: {
				category: 19,
				results: []
			},
			shaders: {
				category: 41,
				results: []
			},
			ships: {
				category: 42,
				results: []
			},
			sparrows: {
				category: 43,
				results: []
			},
			ghosts: {
				category: 39,
				results: []
			}
		}
		for (var characterInventory of inventories) {
			var _characterName = characterName(characterInventory.characterId);
			for (var item of characterInventory.inventory) {
				var itemDef = getItemDefinition(item.itemHash, item);
				if (itemDef.itemCategoryHashes) {
					for (var category of endResult) {
						if (itemDef.itemCategoryHashes.indexOf(category.category) > -1) {
							item.characterId = _characterName;
							category.results.push(item);
						}
					}
				}
			}
		}
		resolve(endResult);
	});
}

function findIronBanner(inventoryCategories) {
	console.log(inventoryCategories)
	var mainContainer = document.getElementById("ironbannerContainer");
	// mainContainer.innerHTML = "Loading...";
	var sortedGear = {
		"IronCompanion": {
			"hashes": [3907475891, 1866413378, 82944038, 3910559228, 825392783, 2747259661, 3399822332, 554244708, 2402750214, 1722532281, 870077908, 3995873645, 1212068371, 4242215215, 3841951818],
			"name": "Iron Companion",
			"type": "armor",
			"matches": []
		},
		"IronRegalia": {
			"hashes": [3238812335, 1057400374, 607837434, 2269782672, 3552383236, 4260440589, 618035964, 480802660, 3915931142, 2055339186, 2314184410, 214912035, 2558490477, 2601925973, 3724577049],
			"name": "Iron Regalia",
			"type": "armor",
			"matches": []
		},
		"IronBreed": {
			"hashes": [3238812334, 1057400375, 607837435, 2269782673, 3602716122, 4260440588, 618035965, 480802661, 3915931143, 1971451024, 2314184411, 214912034, 2558490476, 2601925972, 3808465211],
			"name": "Iron Breed",
			"type": "armor",
			"matches": []
		},
		"DaysOfIron": {
			"hashes": [1130101274, 3367372899, 1782893741, 993385365, 4191772320, 3795900624, 3593684385, 3006512631, 369105043, 373830470, 3686632461, 44227836, 1164361060, 3342123014, 2332648633, 1807104308],
			"name": "Days of Iron",
			"type": "armor",
			"matches": []
		},
		"IronSaga": {
			"hashes": [2007792164, 1572105981, 3633902467, 3896258079, 2532725498, 850974178, 149041867, 201220485, 1665256925, 3152205784, 2196848513, 3034768024, 2931417008, 1494493138, 2283132909, 1369867138],
			"name": "Iron Saga",
			"type": "armor",
			"matches": []
		},
		"PreTTK": {
			"hashes": [1998842327, 2115569661, 3582249030, 3968437225, 1923132366, 367695658, 1730663491, 2853794413, 805224273],
			"name": "Year One Weapons",
			"type": "weapons",
			"matches": []
		},
		"TTK": {
			"hashes": [3497087277, 3452625744, 2897238917, 3904536202, 2443083323, 1264422556, 1272989272, 3068424913, 2121113047, 3536592559],
			"name": "Year Two Weapons",
			"type": "weapons",
			"matches": []
		},
		"ROI": {
			"hashes": [1026578963, 1050258874, 2413549607, 2999797736, 958238921, 3768542598, 1689897198, 2205574383, 2878293129, 330048677],
			"name": "Year Three Weapons",
			"type": "weapons",
			"matches": []
		},
		"IronCamelot": {
			"hashes": [3734616175, 2019341558, 3187552139, 1292884101, 2073560916, 656689057, 4174844898, 3472912587, 2642309592],
			"name": "Iron Camelot",
			"type": "armor",
			"matches": []
		}
	};
	if (globalOptions.activeType === "psn") {
		sortedGear.IronCamelot = {
			"hashes": [3734616175, 2019341558, 3187552139, 1292884101, 2073560916, 656689057, 4174844898, 3472912587, 2642309592],
			"name": "Iron Camelot",
			"type": "armor",
			"matches": []
		};
	}
	sortGear(sortedGear);
	for (var group of sortedGear) {
		for (var hash of group.hashes) {
			var topGear = getItemDefinition(hash);
			for (var gear of inventoryCategories[group.type].results) {
				if (gear.itemHash === hash) {
					if (globalOptions.showQuality) {
						if (!hasQuality(topGear) || topGear.itemName) {
							topGear = gear;
						}
						if (parseItemQuality(gear).min > parseItemQuality(topGear).min) {
							topGear = gear;
						}
					} else {
						if (!topGear.primaryStat) {
							topGear = gear;
						}
						if (topGear.primaryStat.value < gear.primaryStat.value) {
							topGear = gear;
						}
					}
				}
			}
			group.matches.push(topGear);
		}
	}
	mainContainer.innerHTML = "";
	for (let gearSet of sortedGear) {
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + gearSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let gear of gearSet.matches) {
			var gearElem = makeItem(gear, gear.characterId);
			if (!gear.itemInstanceId) {
				gearElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(gearElem);
		}
		titleContainer.appendChild(docfrag);
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGear);
}

function findTrials(inventoryCategories) {
	var mainContainer = document.getElementById("trialsContainer");
	var sortedGear = {
		"Watcher": {
			"hashes": [2520286396, 595116866, 590944734, 3636271393, 3387472392, 1496660238, 3637940698, 1937895859, 3863421729, 2847788649, 2558361307, 3774909908],
			"name": "Watcher",
			"type": "armor",
			"matches": []
		},
		"Exile": {
			"hashes": [2573091812, 2520286397, 595116867, 590944735, 3602716116, 3636271392, 3348229560, 3387472393, 1496660239, 3637940699, 1937895858, 1971451038, 1777045417, 3863421728, 2847788648, 2558361306, 3774909909, 3808465205],
			"name": "Exile",
			"type": "armor",
			"matches": []
		},
		"Blindsight": {
			"hashes": [10673377, 1705510185, 2959003547, 3342415803, 1811367951, 728377845, 3515978626, 4184289356, 1566345524],
			"name": "Blindsight",
			"type": "armor",
			"matches": []
		},
		"WingedSun": {
			"hashes": [10673376, 1705510184, 2959003546, 3407607557, 3342415802, 1811367950, 728377844, 2129462487, 3515978627, 4184289357, 1566345525, 2339777344],
			"name": "Winged Sun",
			"type": "armor",
			"matches": []
		},
		"Pariah": {
			"hashes": [3925936918, 835063271, 3452701201, 3882836265, 1353163820, 3273710512, 3071494145, 3461067991, 271372403, 1294420134, 3128948233, 537476480, 3389932104, 3910264250, 1221519781],
			"name": "Pariah",
			"type": "armor",
			"matches": []
		},
		"Vigil": {
			"hashes": [1176452006, 190411895, 1627572929, 1998946585, 2410077980, 380709696, 2241750289, 3324900039, 1648442595, 4040397782, 1059881049, 997700304, 1963125496, 1314758954, 741603733, 1960785498],
			"name": "Vigil",
			"type": "armor",
			"matches": []
		},
		"PreTTK": {
			"hashes": [1550781862, 1550781863, 1283021733, 1283021732, 120524974, 120524975, 1768925825, 1768925824, 3327140886, 2217778941, 2911036427, 3028978726, 73994448],
			"name": "Year One Weapons",
			"type": "weapons",
			"matches": []
		},
		"TTK": {
			"hashes": [2748310063, 2748310062, 1173766590, 1173766591, 341708371, 341708370, 48423572, 48423573, 2469233045, 1604125378, 1305525274, 2321310309, 1505957929],
			"name": "Year Two Weapons",
			"type": "weapons",
			"matches": []
		},
		"ROI": {
			"hashes": [3490124917, 3490124916, 3366907656, 3366907657, 1398798173, 1398798172, 320170738, 320170739, 2968802931, 1232070660, 2904362064],
			"name": "Year Three Weapons",
			"type": "weapons",
			"matches": []
		}
	};
	sortGear(sortedGear);
	for (var group of sortedGear) {
		for (var hash of group.hashes) {
			var topGear = getItemDefinition(hash);
			for (var gear of inventoryCategories[group.type].results) {
				if (gear.itemHash === hash) {
					if (globalOptions.showQuality) {
						if (!hasQuality(topGear) || topGear.itemName) {
							topGear = gear;
						}
						if (parseItemQuality(gear).min > parseItemQuality(topGear).min) {
							topGear = gear;
						}
					} else {
						if (!topGear.primaryStat) {
							topGear = gear;
						}
						if (topGear.primaryStat.value < gear.primaryStat.value) {
							topGear = gear;
						}
					}
				}
			}
			group.matches.push(topGear);
		}
	}
	mainContainer.innerHTML = "";
	for (let gearSet of sortedGear) {
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + gearSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let gear of gearSet.matches) {
			var gearElem = makeItem(gear, gear.characterId);
			if (!gear.itemInstanceId) {
				gearElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(gearElem);
		}
		titleContainer.appendChild(docfrag);
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGear);
}

function findRaid(inventoryCategories) {
	var mainContainer = document.getElementById("raidContainer");
	var sortedGear = {
		"VoG": {
			"hashes": [2147998057, 3851493600, 3367833896, 2504856474, 774963973, 1096028869, 1835128980, 3833808556, 1698410142, 2237496545, 2486746566, 1883484055, 4079606241, 3267664569, 991704636],
			"name": "Vault of Glass",
			"type": "armor",
			"matches": []
		},
		"CE": {
			"hashes": [1898281764, 1462595581, 2450884227, 3786747679, 1349707258, 1311326450, 1736102875, 1261228341, 186143053, 4253790216, 2477121987, 3148626578, 3009953622, 3549968172, 2339580799],
			"name": "Crota's End",
			"type": "armor",
			"matches": []
		},
		"KF": {
			"hashes": [1245063911, 1245063910, 217447094, 217447095, 3176903680, 3176903681, 1601524312, 1601524313, 130578781, 130578780, 3471865172, 3471865173, 2302693613, 2302693612, 3907799187, 3907799186, 2549035183, 2549035182, 2242715339, 2242715338, 1846107924, 1846107925, 521951204, 521951205, 372855004, 372855005, 1658688592, 1658688593],
			"name": "King's Fall",
			"type": "armor",
			"matches": []
		},
		"WotM": {
			"hashes": [3138343137, 3138343136, 3976262648, 3976262649, 307172368, 307172369, 2011530290, 2011530291, 3529294925, 3529294924, 661529959, 661529958, 2903199470, 2903199471, 1823306242, 1823306243, 691310312, 691310313, 1047302227, 1047302226, 1299613398, 1299613399, 2503707047, 2503707046, 2679967697, 2679967696, 1680970217, 1680970216, 155972844, 155972845, 2436994447, 2436994446],
			"name": "Wrath of the Machine",
			"type": "armor",
			"matches": []
		},
		"VoGW": {
			"hashes": [2149012811, 3074713346, 3892023023, 1603229152, 346443849, 1267053937, 3695068318, 892741686, 152628833, 3807770941],
			"name": "Vault of Glass Weapons",
			"type": "weapons",
			"matches": []
		},
		"CEW": {
			"hashes": [4252504452, 4144666151, 2809229973, 437329200, 868574327, 1267147308, 560601823, 3615265777, 788203480, 2361858758],
			"name": "Crota's End Weapons",
			"type": "weapons",
			"matches": []
		},
		"KFW": {
			"hashes": [2918358302, 2918358303, 3688594189, 1457207757, 1457207756, 962497239, 962497238, 2536361592, 2536361593, 3042333087, 3042333086, 3919765141, 3919765140, 2201079122, 2201079123, 1551744703, 1551744702, 1397524040, 1397524041],
			"name": "King's Fall Weapons",
			"type": "weapons",
			"matches": []
		},
		"WotMW": {
			"hashes": [2542033072, 621603243, 2154053164, 3742521821, 3632330099, 3598793896, 2001493563, 2125403517, 3569444312, 242628276, 1784034858],
			"name": "Wrath of the Machine Weapons",
			"type": "weapons",
			"matches": []
		}
	};
	sortGear(sortedGear);
	for (var group of sortedGear) {
		for (var hash of group.hashes) {
			var topGear = getItemDefinition(hash);
			for (var gear of inventoryCategories[group.type].results) {
				if (gear.itemHash === hash) {
					if (globalOptions.showQuality) {
						if (!hasQuality(topGear) || topGear.itemName) {
							topGear = gear;
						}
						if (parseItemQuality(gear).min > parseItemQuality(topGear).min) {
							topGear = gear;
						}
					} else {
						if (!topGear.primaryStat) {
							topGear = gear;
						}
						if (topGear.primaryStat.value < gear.primaryStat.value) {
							topGear = gear;
						}
					}
				}
			}
			group.matches.push(topGear);
		}
	}
	mainContainer.innerHTML = "";
	for (let gearSet of sortedGear) {
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + gearSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let gear of gearSet.matches) {
			var gearElem = makeItem(gear, gear.characterId);
			if (!gear.itemInstanceId) {
				gearElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(gearElem);
		}
		titleContainer.appendChild(docfrag);
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGear);
}

function findExotics(inventoryCategories) {
	var mainContainer = document.getElementById("exoticContainer");
	var sortedGear = {
		"Head": {
			"hashes": [591060260, 591060261, 941890987, 941890988, 941890989, 941890990, 941890991, 1054763958, 1054763959, 1519376144, 1519376145, 1519376146, 1519376147, 1519376148, 1520434776, 1520434777, 1520434778, 1520434779, 1520434781, 2778128366, 2778128367],
			"name": "Helmets",
			"type": "armor",
			"matches": []
		},
		"Arms": {
			"hashes": [155374076, 155374077, 1062853750, 1062853751, 1275480032, 1275480033, 1275480035, 1458254032, 1458254033, 1458254034, 2217280774, 2217280775, 3055446324, 3055446326, 3055446327],
			"name": "Gauntlets",
			"type": "armor",
			"matches": []
		},
		"Chest": {
			"hashes": [105485105, 2661471738, 2661471739, 2882684152, 2882684153, 2898542650, 3574778420, 3574778421, 3574778422, 3574778423, 3921595523],
			"name": "Body Armor",
			"type": "armor",
			"matches": []
		},
		"Legs": {
			"hashes": [1394543945, 1775312682, 1775312683, 2275132880, 2479526175, 4267828624, 4267828625],
			"name": "Boots",
			"type": "armor",
			"matches": []
		},
		"Class": {
			"hashes": [2122538504, 2122538505, 2122538506, 2300914893, 2300914894, 2300914895, 2820418552, 2820418553, 2820418555],
			"name": "Class Items",
			"type": "armor",
			"matches": []
		},
		"Primary": {
			"hashes": [99462853, 255654879, 552354419, 803312564, 987423912, 1177550374, 1177550375, 1346849289, 1758882169, 2055601060, 2055601061, 2055601062, 2447423792, 2447423793, 2748609458, 3688594189, 3688594190, 3742521821, 3835813881, 3904467563, 4097026463, 346443849, 2809229973, 3490486524],
			"name": "Primary Weapons",
			"type": "weapons",
			"matches": []
		},
		"Special": {
			"hashes": [99462852, 99462854, 99462855, 1982014077, 3012398148, 3078564838, 3078564839, 3227022822, 3227022823, 3675783241, 3835813880, 3938709034, 310074617, 346443850, 3118679308],
			"name": "Special Weapons",
			"type": "weapons",
			"matches": []
		},
		"Heavy": {
			"hashes": [57660786, 57660787, 2808364178, 2808364179, 3012398149, 3564229425, 3851373522, 4100639362, 4100639364, 4100639365],
			"name": "Heavy Weapons",
			"type": "weapons",
			"matches": []
		}
	};
	sortGear(sortedGear);
	for (var group of sortedGear) {
		for (var hash of group.hashes) {
			var topGear = getItemDefinition(hash);
			for (var gear of inventoryCategories[group.type].results) {
				if (gear.itemHash === hash) {
					if (globalOptions.showQuality) {
						if (!hasQuality(topGear) || topGear.itemName) {
							topGear = gear;
						}
						if (parseItemQuality(gear).min > parseItemQuality(topGear).min) {
							topGear = gear;
						}
					} else {
						if (!topGear.primaryStat) {
							topGear = gear;
						}
						if (topGear.primaryStat.value < gear.primaryStat.value) {
							topGear = gear;
						}
					}
				}
			}
			group.matches.push(topGear);
		}
	}
	mainContainer.innerHTML = "";
	for (let gearSet of sortedGear) {
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + gearSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let gear of gearSet.matches) {
			var gearElem = makeItem(gear, gear.characterId);
			if (!gear.itemInstanceId) {
				gearElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(gearElem);
		}
		titleContainer.appendChild(docfrag);
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGear);
}

function findGhosts(inventories) {
	var mainContainer = document.getElementById("ghostContainer");
	// mainContainer.innerHTML = "Loading...";
	var ghosts = [];
	for (var characterInventory of inventories) {
		for (var item of characterInventory.inventory) {
			var itemDef = getItemDefinition(item.itemHash);
			if (itemDef.bucketTypeHash === 4023194814) {
				item.characterId = characterName(characterInventory.characterId);
				ghosts.push(item);
			}
		}
	}
	var sortedGhosts = {
		uniqueGhosts: {
			hashes: [],
			name: "Unique Ghosts",
			matches: []
		},
		HunterGhosts: {
			search: ["Hunter"],
			name: "PVP Hunter",
			matches: []
		},
		TitanGhosts: {
			search: ["Titan"],
			name: "PVP Titan",
			matches: []
		},
		WarlockGhosts: {
			search: ["Warlock"],
			name: "PVP Warlock",
			matches: []
		},
		SpinmetalGhosts: {
			search: ["Spinmetal"],
			name: "Spinmetal Ghosts",
			matches: []
		},
		HeliumGhosts: {
			search: ["Helium"],
			name: "Helium Filament Ghosts",
			matches: []
		},
		SpiritGhosts: {
			search: ["Spirit"],
			name: "Spirit Bloom Ghosts",
			matches: []
		},
		RelicGhosts: {
			search: ["Relic"],
			name: "Relic Iron Ghosts",
			matches: []
		},
		WormsporeGhosts: {
			search: ["Wormspore"],
			name: "Wormspore Ghosts",
			matches: []
		},
		FallenEarth: {
			search: ["Ether", "Spinmetal"],
			name: "Fallen on Earth",
			matches: []
		},
		FallenMoon: {
			search: ["Ether", "Helium"],
			name: "Fallen on the Moon",
			matches: []
		},
		FallenVenus: {
			search: ["Ether", "Spirit"],
			name: "Fallen on Venus",
			matches: []
		},
		HiveEarth: {
			search: ["Cleansing", "Spinmetal"],
			name: "Hive on Earth",
			matches: []
		},
		HiveMoon: {
			search: ["Cleansing", "Helium"],
			name: "Hive on the Moon",
			matches: []
		},
		HiveDreadnaught: {
			search: ["Cleansing", "Wormspore"],
			name: "Hive on the Dreadnaught",
			matches: []
		},
		VexVenus: {
			search: ["Blue", "Spirit"],
			name: "Vex on Venus",
			matches: []
		},
		VexMars: {
			search: ["Blue", "Relic"],
			name: "Vex on Mars",
			matches: []
		},
		CabalMars: {
			search: ["Network", "Relic"],
			name: "Cabal on Mars",
			matches: []
		},
		CabalDreadnaught: {
			search: ["Network", "Wormspore"],
			name: "Cabal on the Dreadnaught",
			matches: []
		},
		TakenEarth: {
			search: ["Reclamation", "Spinmetal"],
			name: "Taken on Earth",
			matches: []
		},
		TakenVenus: {
			search: ["Reclamation", "Spirit"],
			name: "Taken on Venus",
			matches: []
		},
		TakenMars: {
			search: ["Reclamation", "Relic"],
			name: "Taken on Mars",
			matches: []
		},
		TakenDreadnaught: {
			search: ["Reclamation", "Wormspore"],
			name: "Taken on the Dreadnaught",
			matches: []
		},
		OtherGhosts: {
			name: "Other ghosts",
			matches: []
		}
	};
	for (var itemDef of DestinyCompactItemDefinition) {
		if (itemDef.bucketTypeHash === 4023194814 && (itemDef.tierTypeName === "Legendary" || itemDef.tierTypeName === "Exotic")) {
			sortedGhosts.uniqueGhosts.hashes.push({
				itemHash: itemDef.itemHash,
				matches: [],
				topGhost: itemDef
			});
		}
	}
	for (var uniqueGhost of sortedGhosts.uniqueGhosts.hashes) {
		for (var ghost of ghosts) {
			if (ghost.itemHash === uniqueGhost.itemHash) {
				if (globalOptions.showQuality) {
					if (!hasQuality(uniqueGhost.topGhost)) {
						uniqueGhost.topGhost = ghost;
					}
					uniqueGhost.matches.push(ghost);
					if (parseItemQuality(ghost).min > parseItemQuality(uniqueGhost.topGhost).min) {
						uniqueGhost.topGhost = ghost;
					}
				} else {
					if (!uniqueGhost.topGhost.primaryStat) {
						uniqueGhost.topGhost = ghost;
					}
					uniqueGhost.matches.push(ghost);
					if (uniqueGhost.topGhost.primaryStat.value < ghost.primaryStat.value) {
						uniqueGhost.topGhost = ghost;
					}
				}
			}
		}
		sortedGhosts.uniqueGhosts.matches.push(uniqueGhost.topGhost);
	}
	for (var ghost of ghosts) {
		var found = false;
		for (var sorting of sortedGhosts) {
			if (sorting.search && containsNodes(ghost, sorting.search) >= 100) {
				sorting.matches.push(ghost);
				found = true;
			}
		}
		if (found === false) {
			sortedGhosts.OtherGhosts.matches.push(ghost);
		}
	}
	mainContainer.innerHTML = "";
	for (var ghostSetName in sortedGhosts) {
		var ghostSet = sortedGhosts[ghostSetName];
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + ghostSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let ghost of ghostSet.matches) {
			var ghostElem = makeItem(ghost, ghost.characterId);
			if (!ghost.itemInstanceId) {
				ghostElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(ghostElem);
			// for (var vendorItem of vendorCategory.saleItems) {
			// 	var itemDef = DestinyCompactItemDefinition[saleItem.item.itemHash];
			// 	if (saleItem.unlockStatuses.length && !saleItem.unlockStatuses[0].isSet && vendorItem.item.itemHash === saleItem.item.itemHash) {
			// 		emblems[saleItem.item.itemHash] = {
			// 			name: itemDef.itemName,
			// 			acquired: saleItem.unlockStatuses[0].isSet,
			// 			selling: true
			// 		};
			// 	}
			// }
		}
		titleContainer.appendChild(docfrag);
		// mainContainer.innerHTML = "";
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGhosts);
}

function displayMissingVendorItems(mainContainer, lastVendor, saleVendor) {
	selectedCharacter = document.getElementById("character").value;
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).catch(function(err) {
		if (err) {
			console.error(err);
		}
	}).then(function(kioskResponse) {
		bungie.getVendorForCharacter(selectedCharacter, saleVendor).catch(function(err) {
			if (err) {
				console.error(err);
			}
		}).then(function(vendorResponse) {
			console.log(kioskResponse, kioskResponse.Response && kioskResponse.Response.data, DestinyVendorDefinition[lastVendor]);
			if (kioskResponse.Response && vendorResponse.Response) {
				mainContainer.innerHTML = "";
				var missingContainer = document.createElement("div");
				missingContainer.classList.add("sub-section");
				missingContainer.innerHTML = "<p>Missing from Collection</p>";
				var missingFragment = document.createDocumentFragment();
				var sellingContainer = document.createElement("div");
				sellingContainer.innerHTML = "<p>Available to Purchase from " + DestinyVendorDefinition[saleVendor].summary.vendorName + " " + date.vendorRefreshDate(vendorResponse.Response.data.vendor) + "</p>";
				sellingContainer.classList.add("sub-section");
				var sellingFragment = document.createDocumentFragment();
				var missingHashes = [];
				for (let category of kioskResponse.Response.data.vendor.saleItemCategories) {
					for (let emblem of category.saleItems) {
						if (emblem.failureIndexes[0] || (emblem.requiredUnlockFlags && emblem.requiredUnlockFlags[0].isSet === false) || emblem.itemStatus & 8) {
							missingHashes.push(emblem.item.itemHash);
							missingFragment.appendChild(makeItem(emblem.item, DestinyVendorDefinition[lastVendor].failureStrings[emblem.failureIndexes[0]]));
						} else {
							console.log(getItemDefinition(emblem.item.itemHash).itemName, emblem);
						}
					}
				}
				for (let category of vendorResponse.Response.data.vendor.saleItemCategories) {
					for (let saleItem of category.saleItems) {
						if (missingHashes.indexOf(saleItem.item.itemHash) > -1) {
							var costs = Item.getCosts(saleItem, vendorResponse.Response.data.vendor, newInventories, selectedCharacter);
							sellingFragment.appendChild(makeItem(saleItem.item, DestinyVendorDefinition[lastVendor].failureStrings[saleItem.failureIndexes[0]], costs));
						}
					}
				}
				mainContainer.innerHTML = "";
				missingContainer.appendChild(missingFragment);
				sellingContainer.appendChild(sellingFragment);
				mainContainer.appendChild(sellingContainer);
				mainContainer.appendChild(missingContainer);
			} else {
				console.log(lastVendor, saleVendor);
				mainContainer.innerHTML = `<h2>${kioskResponse.Message}</h2>`;
			}
		});
	});
}

var vendorItems = {};

function VendorNetworkTask(vendorHash, resolve) {
	selectedCharacter = document.getElementById("character").value;
	bungie.getVendorForCharacter(selectedCharacter, vendorHash).catch(function(err) {
		if (err) {
			console.error(err);
		}
	}).then(function(vendorResponse) {
		if (vendorResponse && vendorResponse.Response) {
			resolve(vendorResponse.Response.data);
		} else {
			resolve(false);
		}
	});
}

function VendorResultTask(data, vendorHash) {
	if (data) {
		vendorItems[vendorHash] = {
			name: DestinyVendorDefinition[vendorHash].summary.vendorName,
			currencies: data.vendor.currencies,
			nextRefreshDate: data.vendor.nextRefreshDate,
			items: []
		};
		var docFrag = document.createDocumentFragment();
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + vendorItems[vendorHash].name + " " + date.vendorRefreshDate(data.vendor) + "</p>";
		for (let category of data.vendor.saleItemCategories) {
			for (let saleItem of category.saleItems) {
				if (hasQuality(saleItem.item) && parseItemQuality(saleItem.item).min > 92) {
					vendorItems[vendorHash].items.push(saleItem);
					var costs = Item.getCosts(saleItem, data.vendor, newInventories, selectedCharacter);
					titleContainer.appendChild(makeItem(saleItem.item, vendorItems[vendorHash].name, costs));
				}
			}
		}
		if (titleContainer.children.length) {
			docFrag.appendChild(titleContainer);
		}
		var mainContainer = document.getElementById("t12Container");
		mainContainer.appendChild(docFrag);
	}
}

function displayT12VendorItems(mainContainer) { // rerun hunter vanguard, titan vanguard, warlock vanguard and house of judgement if 
	sequence([2796397637, 3746647075, 3611686524, 174528503, 3902439767, 1821699360, 3003633346, 242140165, 1808244981, 2680694281, 1990950, 1575820975, 1998812735, 2610555297, 2190824860], VendorNetworkTask, VendorResultTask).then(function() {
		var docFrag = document.createDocumentFragment();
		mainContainer.innerHTML = "";
		for (var vendor of vendorItems) {
			if (vendor.items.length) {
				var titleContainer = document.createElement("div");
				titleContainer.classList.add("sub-section");
				titleContainer.innerHTML = "<p>" + vendor.name + " " + date.vendorRefreshDate(vendor) + "</p>";
				for (let saleItem of vendor.items) {
					var costs = Item.getCosts(saleItem, vendor, newInventories, selectedCharacter);
					docFrag.appendChild(makeItem(saleItem.item, vendor.name, costs));
				}
				titleContainer.appendChild(docFrag);
				mainContainer.appendChild(titleContainer);
			}
		}
	});
}

function findEmblems() {
	var mainContainer = document.getElementById("emblemContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 3301500998, 134701236);
}

function findShaders() {
	var mainContainer = document.getElementById("shaderContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 2420628997, 134701236);
}

function findShips() {
	var mainContainer = document.getElementById("shipContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 2244880194, 459708109);
}

function findSparrows() {
	var mainContainer = document.getElementById("sparrowContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 44395194, 459708109);
}

function findT12() {
	var mainContainer = document.getElementById("t12Container");
	mainContainer.innerHTML = "Loading...";
	if (globalOptions.showQuality) {
		displayT12VendorItems(mainContainer);
	} else {
		mainContainer.innerHTML = "Please enable the 'Show Quality' option on the <a href='options.html'>options page</a> to use this feature.";
	}
}

var selectedCharacter = localStorage.newestCharacter;
var newInventories = {};

function postInitItems() {
	var characterHTML = "";
	for (let characterId in characterDescriptions) {
		if (characterId !== "vault") {
			characterHTML += `<option value="${characterId}"${(characterId === selectedCharacter) ? " selected" : ""}>${characterName(characterId)}</option>`;
		}
	}
	elements.status.classList.remove("active");
	document.getElementById("character").innerHTML = characterHTML;
	document.querySelectorAll(".collection-section").forEach(function(element) {
		element.addEventListener("click", function(event) {
			if (event.target.checked === false) {
				if (event.target.dataset.feature === "ghosts") {
					database.getAllEntries("inventories").then(function(data) {
						// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						newInventories = data.inventories;
						findGhosts(data.inventories);
					});
				}
				if (event.target.dataset.feature === "ironbanner") {
					database.getAllEntries("inventories").then(function(data) {
						// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						flattenInventories(data.inventories).then(findIronBanner);
					});
				}
				if (event.target.dataset.feature === "trials") {
					database.getAllEntries("inventories").then(function(data) {
						// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						flattenInventories(data.inventories).then(findTrials);
					});
				}
				if (event.target.dataset.feature === "raid") {
					database.getAllEntries("inventories").then(function(data) {
						// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						flattenInventories(data.inventories).then(findRaid);
					});
				}
				if (event.target.dataset.feature === "exotics") {
					database.getAllEntries("inventories").then(function(data) {
						// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						flattenInventories(data.inventories).then(findExotics);
					});
				}
				if (event.target.dataset.feature === "emblems") {
					if (!bungieProfileLoaded) {
						initItems(function() {
							bungieProfileLoaded = true;
							findEmblems();
						});
					} else {
						findEmblems();
					}
				}
				if (event.target.dataset.feature === "shaders") {
					if (!bungieProfileLoaded) {
						initItems(function() {
							bungieProfileLoaded = true;
							findShaders();
						});
					} else {
						findShaders();
					}
				}
				if (event.target.dataset.feature === "ships") {
					if (!bungieProfileLoaded) {
						initItems(function() {
							bungieProfileLoaded = true;
							findShips();
						});
					} else {
						findShips();
					}
				}
				if (event.target.dataset.feature === "sparrows") {
					if (!bungieProfileLoaded) {
						initItems(function() {
							bungieProfileLoaded = true;
							findSparrows();
						});
					} else {
						findSparrows();
					}
				}
				if (event.target.dataset.feature === "t12") {
					chrome.storage.local.get("inventories", function(data) {
						newInventories = data.inventories;
						if (!bungieProfileLoaded) {
							initItems(function() {
								bungieProfileLoaded = true;
								findT12();
							});
						} else {
							findT12();
						}
					});
				}
			}
		}, false);
	});
	document.getElementById("debugHome").classList.remove("hidden");
}

var bungieProfileLoaded = false;

document.addEventListener("DOMContentLoaded", function() {
	initUi();
	characterDescriptions = JSON.parse(localStorage.characterDescriptions);

	// findGhosts(data.inventories);
	// initItems(function() {
	// findEmblems();
	// findShaders();
	// findShips();
	// });

	document.getElementById("debugHome").addEventListener("mouseover", function(event) {
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
	// initItems(function() {
	database.open().then(postInitItems);
	// });
});

window.requestAnimationFrame(date.keepDatesUpdated);