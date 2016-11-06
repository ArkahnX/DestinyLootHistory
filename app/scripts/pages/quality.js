var insigniaInputs = {};
var perkList = [];
var rewardSourceList = [];
characterDescriptions = JSON.parse(localStorage.characterDescriptions);
var perkHashIndex = [1228656138, 709737102, 1269473995, 3326413736, 1880426832, 3129120313, 3457701870, 1456076301, 1765729154, 3735909663, 2999530468, 2661061678, 3792198727, 707792617, 2664229771, 3302053862, 1101818187, 3743041729, 2131801999, 448609668, 632126377, 2152652274, 1950307497, 3649859369, 3031176193, 2482846307, 1394084296, 1175838572, 1359068529, 3689182788, 4090945472, 4111868508, 700071256, 247305382, 3857263415, 3474991791, 1875467969, 1613412752, 2979228483, 1986661836, 3538671621, 2988093069, 3669655943, 2871746970, 275337775, 2333942527, 3283108368, 1900693659, 3911170550, 770631416, 1863078623, 972070082, 3722223157, 3102938162, 3464328064, 318657130, 4023922623, 1711887956, 3661306029, 1258704074, 1026458383, 1752089080, 1577779520, 3240339843, 124234431, 3795565363, 4051254786, 2556279843, 3944665868, 671224739, 1028572792, 1688301903, 3119194123, 2507926095, 3031234337, 2421244048, 4266524967, 2725595956, 1632665602, 597127202, 3133914358, 192233393, 2814215427, 2450150110, 4198986151, 3848963378, 522135030, 2626112550, 3877389831, 2525259694, 731752060, 3245550306, 1275958706, 661681055, 3325943374, 183958561, 1257014586, 2028552052, 77746637, 1029160485, 1605283625, 4091143788, 3632688592, 1880837044, 317976013, 3851285775, 3523239750, 539512168, 1723656171, 2095340230, 3050866996, 3480879699, 1724858392, 3467141629, 1981671584, 4096399315, 1357398595, 3318043226, 2779348654, 2425591494, 2179933840, 1928591453, 3052118152, 2784842908, 824061322, 1568304667, 390728111, 2144441188, 2448421045, 4182717269, 1870183033, 2768191624, 58719660, 2057818109, 2678818989, 1737781361, 3572254272, 3733789933, 1160175599, 2670306210, 1846145321, 1566222180, 2290550941, 2047535886, 3752206822, 2201881340, 3909966040, 745231149, 3350178149, 3798969172, 4148534176, 1989386514, 2967608339, 3724563374, 356306776, 97066487, 3960232833, 383243401, 1424250509, 1490285904, 1584602733, 2859055896, 1966098145, 2818471317, 1347165795, 1299594097, 521001914, 1928256881, 3730022952, 3317503477, 1759552806, 3943006857, 1704130927, 2758635242, 2887187771, 888309016, 4060987422, 259633136, 1334652795, 4189070124, 3256310621, 1405953642, 653222695, 2168429839, 3879685265, 3686406336, 3906787506, 2712575832, 525257484, 1737026719, 1173182893, 1857351259, 2791554375, 3309086364];

var rewardSourceHashIndex = [24296771, 36493462, 113998144, 147701865, 299200664, 344892955, 346792680, 460228854, 478645002, 482203941, 541934873, 686593720, 709638738, 831813627, 846654930, 866383853, 941581325, 950592345, 1011133026, 1141011754, 1257353826, 1381856260, 1389125983, 1391763834, 1396812895, 1536427767, 1587918730, 1662396737, 1835600269, 1882189853, 1920307024, 1963381593, 2155337848, 2294933711, 2644169369, 2770509343, 2859308742, 2861499388, 2975148657, 3080587303, 3107502809, 3116705946, 3147905712, 3286066462, 3405266230, 3413298620, 3496730577, 3498761033, 3523074641, 3551688287, 3654364561, 3660582080, 3672389432, 3739898362, 3870113141, 3945957624, 4065765153, 4074277503, 4131549852];



function isGoodPerk(itemDef) {
	if (!itemDef.nodeStepName || !itemDef.nodeStepDescription || !itemDef.icon) {
		return false;
	}
	if (itemDef.icon === "/img/misc/missing_icon.png") {
		return false;
	}
	if (itemDef.nodeStepName.indexOf("Chroma") > -1) {
		return false;
	}
	if (itemDef.nodeStepName.indexOf("Ascend") > -1) {
		return false;
	}
	if (itemDef.nodeStepName.indexOf("Upgrade Damage") > -1) {
		return false;
	}
	return true;
}

var weaponTalentGrids = [3537590230, 610379264, 101926142, 4208195429, 4208195428, 4267080965, 3313759472, 2145151405, 571301937, 4058565332, 2339676442, 186686495, 2740307196, 3634730057, 563589974, 3405327737, 1462003727, 1393344713, 3684294341, 520518493, 327510628, 2047220462, 556981091, 2142335891, 2878028369, 1038182623, 3687637571, 3687637570, 3652393328, 4026995771, 1043661638, 662694125, 1173596555, 264384074, 1221114914, 238559955, 2269451478, 3159146611, 1342013042, 3577215418, 887051485, 1002266788, 877327073, 277602097, 188529294, 3478559768, 267493576, 1664755985, 1664755984, 529240916, 3116083709, 879677959, 3981554245, 489939625, 54170120, 979806020, 657121322, 3944066983, 46313982, 4221122087, 1881959745, 3606052194, 243871591, 1224056596, 2078286123, 1027210955, 2521989033, 642859411, 1364837654, 1464793454, 2389155580, 1251155252, 3627288415, 2836478578, 37817076, 3807163128, 3592718601, 612612378, 3890973528, 4035310061, 3403448791, 1000895224, 1386452352, 1769196939, 1769196938, 642276198, 298070824, 127643265, 192082017, 1224728520, 982404318, 1572815191, 3649306017, 369411632, 2073748644, 3666290460, 2515260583, 214163140, 3004165488, 1024588185, 3526033362, 689346335, 1415170625, 2869840785, 2037340277, 2457418698, 2604886534, 3436925567, 3870885683, 1494420540, 3246669987];

function findWeaponPerks() {
	let weaponPerks = [];
	let weaponPerkHashes = [];
	for (let gridHash of weaponTalentGrids) {
		let nodes = DestinyCompactTalentDefinition[gridHash].nodes;
		for (let node of nodes) {
			if (!node.isRandomRepurchasable) {
				for (let step of node.steps) {
					if (weaponPerkHashes.indexOf(step.nodeStepHash) === -1) {
						// console.log(`Checking perk: ${step.nodeStepName} - ${step.nodeStepDescription}`);
						if (isGoodPerk(step)) {
							// perkList.push({
							// 	nodeStepName: perkDef.nodeStepName,
							// 	perkHash: perkDef.perkHash,
							// 	icon: perkDef.icon,
							// 	nodeStepDescription: perkDef.nodeStepDescription
							// });
							weaponPerkHashes.push(step.nodeStepHash);
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
	console.log(JSON.stringify(weaponPerks));
}

function findWeaponTalentGrids() {
	var talentGridHashes = [];
	var itemList = [];
	for (let itemDef of DestinyCompactItemDefinition) {
		if (itemDef.tierType === 5 && itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1 && itemDef.talentGridHash && talentGridHashes.indexOf(itemDef.talentGridHash) === -1) {
			console.log(`Finding perks for ${itemDef.itemTypeName} - ${itemDef.itemName} - ${itemDef.itemDescription}`);
			talentGridHashes.push(itemDef.talentGridHash)
		}
	}
	console.log(JSON.stringify(talentGridHashes));
}

function findPerks() {
	perkHashIndex = [];
	perkList = [];
	for (let itemDef of DestinyCompactItemDefinition) {
		if (itemDef.tierType === 5 && itemDef.talentGridHash && itemDef.sourceHashes && talentGridHashes.indexOf(itemDef.talentGridHash) === -1 && (itemDef.sourceHashes.indexOf(24296771) > -1 || itemDef.sourceHashes.indexOf(346792680) > -1 || itemDef.sourceHashes.indexOf(3147905712) > -1 || itemDef.sourceHashes.indexOf(460228854) > -1) && itemDef.itemSubType !== 18) {
			talentGridHashes.push(itemDef.talentGridHash);
			console.log(`Finding perks for ${itemDef.itemTypeName} - ${itemDef.itemName} - ${itemDef.itemDescription}`);
			let nodes = DestinyCompactTalentDefinition[itemDef.talentGridHash].nodes;
			for (let node of nodes) {
				for (let step of node.steps) {
					if (step.perkHashes) {
						for (let perkHash of step.perkHashes) {
							let perkDef = DestinySandboxPerkDefinition[perkHash];
							if (perkHashIndex.indexOf(perkHash) === -1 && perkDef && isGoodPerk(perkDef)) {
								// perkList.push({
								// 	displayName: perkDef.displayName,
								// 	perkHash: perkDef.perkHash,
								// 	displayIcon: perkDef.displayIcon,
								// 	displayDescription: perkDef.displayDescription
								// });
								perkHashIndex.push(perkDef.perkHash);
							}
						}
					}
				}
			}
		}
	}
	// for (var itemDef of DestinySandboxPerkDefinition) {
	// 	if (isGoodPerk(itemDef)) {
	// 		perkList.push({
	// 			displayName: itemDef.displayName,
	// 			perkHash: itemDef.perkHash,
	// 			displayIcon: itemDef.displayIcon,
	// 			displayDescription: itemDef.displayDescription
	// 		});
	// 		perkHashIndex.push(itemDef.perkHash);
	// 	}
	// }

	console.log(JSON.stringify(perkHashIndex));
	console.log(JSON.stringify(perkList));
}

function setupItemFields(ID, properties, hashList, sortList) {
	var insigniaInput = insignia(document.getElementById(ID), {
		free: false,
		deletion: true,
		render: function render(container, item) {
			var hash = parseInt(item.data, 10);
			var data = properties[hashList.indexOf(hash)];
			container.innerHTML = `<img src="https://www.bungie.net${data.displayIcon}" width="16" height="16" class="perkIcon"><span>${data.displayName}</span>`;
			container.title = data.displayDescription;
		},
		getText: function(item) {
			var hash = parseInt(item, 10);
			var data = properties[hashList.indexOf(hash)];
			return data.displayName;
		}
	});
	insigniaInputs[ID] = insigniaInput;
	insigniaInput.on('remove', function() {
		var newArray = [];
		var oldArray = insigniaInput.value();
		for (var item of oldArray) {
			newArray.push(item);
		}
		setOption(ID, newArray);
	});
	new autoComplete({
		selector: '#' + ID,
		minChars: 0,
		delay: 500,
		source: function(term, suggest) {
			var suggestions = [];
			var suggestionList = null;
			if (term.length === 0) {
				suggestionList = properties;
			} else {
				var f = new Fuse(properties, {
					keys: ['displayName', 'displayDescription'],
					threshold: 0.1,
					distance: 1000
				});
				suggestionList = f.search(term.toLowerCase());
			}
			for (var suggestion of suggestionList) {
				if (insigniaInput.findItem("" + suggestion.perkHash) === null) {
					suggestions.push(suggestion);
				}
			}
			suggest(suggestions);
		},
		renderItem: function(item, search, index) {
			var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
			if (search.split(' ')[0] === "") {
				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item.perkHash}" data-name="${item.displayName}" title="${item.displayDescription}"><img src="https://www.bungie.net${item.displayIcon}" width="32" height="32" class="perkIcon"><span>${item.displayName}</span></div>`;
			} else {
				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item.perkHash}" data-name="${item.displayName}" title="${item.displayDescription}"><img src="https://www.bungie.net${item.displayIcon}" width="32" height="32" class="perkIcon"><span>${item.displayName.replace(re, "<b>$1</b>")}</span></div>`;
			}
		},
		onSelect: function(e, term, item) {
			var hash = parseInt(item.getAttribute('data-hash'), 10);
			var data = properties[hashList.indexOf(hash)];
			console.log(`Item "${data.displayName} (${data.displayDescription})" selected by ${(e.type === 'keydown' ? 'pressing enter' : 'mouse click')}.`);
			if (insigniaInput.findItem(item.getAttribute('data-hash')) === null) {
				insigniaInput.addItem(item.getAttribute('data-hash'));
				if (sortList) {
					let node = document.createElement("li");
					node.innerHTML = `<img src="https://www.bungie.net${data.displayIcon}" width="16" height="16" class="perkIcon"><span>${data.displayName}</span>`;
					node.title = data.displayDescription;
					node.id = hash;
					sortList.appendChild(node);
				}
			}
			var newArray = [];
			var oldArray = insigniaInput.value();
			for (let item of oldArray) {
				newArray.push(item);
			}
			setOption(ID, newArray);
		}
	});

	// document.getElementById("insigificant").addEventListener('keypress', function(e) {
	// 	if (e.keyCode === 13) {
	// 		insigniaInput.refresh();
	// 		e.preventDefault(); // prevent form submission
	// 	}
	// });
	getOption(ID).then(function(value) {
		for (let item of value) {
			insigniaInput.addItem(item);
		}
	});
}

function getSortOrder(list) {
	var sortOrder = [];
	for (let child of list.children) {
		sortOrder.push(child.id);
	}
	return sortOrder;
}

var duplicates = [];

function findGearForFilter(data) {
	return new Promise(function(resolve) {
		duplicates = [];
		var uniqueHashes = [];
		var classType = parseInt(elements.classType.value);
		var categoryHash = parseInt(elements.categoryHash.value);
		var gear = [];
		for (var characterInventory of data.inventories) {
			var _characterName = characterName(characterInventory.characterId);
			for (var item of characterInventory.inventory) {
				var itemDef = getItemDefinition(item.itemHash, item);
				if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(categoryHash) > -1 && ((classType !== 3 && (itemDef.classType === classType || classType === 0 && !itemDef.classType)) || classType === 3)) {
					item.characterId = _characterName;
					gear.push(item);
					if (uniqueHashes.indexOf(item.itemHash) > -1) {
						duplicates.push(item.itemHash);
					} else {
						uniqueHashes.push(item.itemHash);
					}
				}
			}
		}
		// gear.sort(function(a, b) {
		// 	return (a.level || 0) - (b.level || 0);
		// });
		resolve(gear);
	});
}

var stringMap = {
	gearRarity: "Gear Rarity",
	gearPerks: "Gear Perks",
	gearLight: "High Light",
	gearLevel: "Gear XP",
	gearQuality: "Stat Quality",
	gearXPIncomplete: "XP Incomplete",
	gearNeedsUpgrades: "Incomplete Nodes",
	gearSource: "Reward Source",
	gearDuplicates: "Duplicate Gear",
	gearXPMax: "XP Maxed"
};

var weightFns = {
	gearDuplicates: function(itemDef, item) {
		if (duplicates.indexOf(item.itemHash) > -1) {
			return 1000;
		}
		return 0;
	},
	gearSource: function(itemDef, item) {
		let found = 0;
		if (itemDef.sourceHashes) {
			for (let rewardSource of itemDef.sourceHashes) {
				if (globalOptions.rewardSources.indexOf(rewardSource + "") > -1) {
					found++;
				}
			}
		}
		if (found) {
			return Math.round((found / itemDef.sourceHashes.length) * 1000);
		}
		return 0;
	},
	gearXPIncomplete: function(itemDef, item) {
		if (item.xpComplete === false && !item.isGridComplete) {
			return 1000;
		}
		return 0;
	},
	gearNeedsUpgrades: function(itemDef, item) {
		if (item.isGridComplete) {
			return 0;
		}
		return 1000;
	},
	gearXPMax: function(itemDef, item) {
		if (item.xpComplete || item.isGridComplete) {
			return 1000;
		}
		return 0;
	},
	gearLevel: function(itemDef, item) {
		return Math.round((item.xpTotal / item.xpMax) * 1000);
	},
	gearRarity: function(itemDef) {
		return Math.round((itemDef.tierType / 6) * 1000) || 0;
	},
	gearPerks: function(itemDef, item) {
		return talentsContainsPerkHashes(item, globalOptions.perkSortOrder) * 10;
	},
	gearLight: function(itemDef, item) {
		if (item.primaryStat && item.primaryStat.value) {
			return Math.round((item.primaryStat.value / 400) * 1000);
		}
		return 0;
	},
	gearQuality: function(itemDef, item) {
		if (hasQuality(item)) {
			return Math.round((parseItemQuality(item).min / 350) * 1000);
		}
		return 0;
	}
};

function getWeight(itemDef, item) {
	var weight = 0;
	var index = globalOptions.qualitySortOrder.length * 2;
	item.weight = [];
	for (var listItem of globalOptions.qualitySortOrder) {
		item.weight.push(weightFns[listItem](itemDef, item) * Math.pow(10, index));
		weight += weightFns[listItem](itemDef, item) * Math.pow(10, index);
		index -= 2;
	}
	item.weightTotal = weight;
	return weight;
}

function sortGear(gearList) {
	return new Promise(function(resolve) {
		gearList.sort(function(a, b) {
			var aDef = getItemDefinition(a.itemHash, a);
			var bDef = getItemDefinition(b.itemHash, b);
			var aWeight = getWeight(aDef, a);
			var bWeight = getWeight(bDef, b);
			if (aWeight === bWeight) {
				return aDef.itemName.localeCompare(bDef.itemName);
			}
			return bWeight - aWeight;
		});
		resolve(gearList);
	});
}

function displayGear(gearList) {
	document.getElementById("resultContainer").innerHTML = "";
	// for (let gearSet of sortedGear) {
	// var titleContainer = document.createElement("div");
	// titleContainer.classList.add("sub-section");
	// titleContainer.innerHTML = "<p>" + gearSet.name + "</p>";
	var hideUnmatched = elements.hideUnmatched.checked;
	var docfrag = document.createDocumentFragment();
	for (let gear of gearList) {
		console.log(gear.weight);
		var gearElem = makeItem(gear, gear.characterId);
		if (hideUnmatched && parseInt(gear.weight[0], 10) === 0) {
			gearElem.children[0].classList.add("undiscovered");
		}
		// for (var weight of gear.weight) {
		// 	if (hideUnmatched && parseInt(weight, 10) === 0) {
		// 		gearElem.children[0].classList.add("undiscovered");
		// 		break;
		// 	}
		// }
		docfrag.appendChild(gearElem);
	}
	// titleContainer.appendChild(docfrag);
	document.getElementById("resultContainer").appendChild(docfrag);
	elements.status.classList.remove("active");
	// }
}

function organiseGear(options) {
	globalOptions = options;
	database.getAllEntries("inventories").then(findGearForFilter).then(sortGear).then(displayGear);
}

function startUi(options) {
	globalOptions = options;
	tags.update();
	for (var perkHash of perkHashIndex) {
		let perkDef = DestinySandboxPerkDefinition[perkHash];
		perkList.push({
			displayName: perkDef.displayName,
			perkHash: perkDef.perkHash,
			displayIcon: perkDef.displayIcon,
			displayDescription: perkDef.displayDescription
		});
	}
	initUi(document.body);
	var list = document.getElementById("qualitySortOrderList");
	var unusedList = document.getElementById("qualitySortOrderListUnused");
	var perkSortList = document.getElementById("perkSortOrderList");
	var perkUnusedList = document.getElementById("perkSortOrderListUnused");
	var oldNodes = getSortOrder(list);
	if (globalOptions.qualitySortOrder.length === 0) {
		setOption("qualitySortOrder", oldNodes);
		globalOptions.qualitySortOrder = oldNodes;
	}
	for (var rewardSource of rewardSourceHashIndex) {
		var sourceDef = DestinyRewardSourceDefinition[rewardSource];
		rewardSourceList.push({
			displayName: sourceDef.sourceName,
			displayIcon: sourceDef.icon,
			displayDescription: sourceDef.description,
			perkHash: sourceDef.sourceHash
		});
	}
	list.innerHTML = "";
	for (let element of globalOptions.qualitySortOrder) {
		var index = oldNodes.indexOf(element);
		if (index > -1) {
			oldNodes.splice(index, 1);
		}
		let node = document.createElement("li");
		node.id = element;
		node.textContent = stringMap[element];
		list.appendChild(node);
	}
	for (let element of oldNodes) {
		let node = document.createElement("li");
		node.id = element;
		node.textContent = stringMap[element];
		unusedList.appendChild(node);
	}
	new Sortable(list, {
		group: "sort",
		onSort: function() {
			var order = getSortOrder(list);
			setOption("qualitySortOrder", order);
		}
	});
	new Sortable(unusedList, {
		group: "sort"
	});
	setupItemFields("perkSortOrder", perkList, perkHashIndex, perkSortOrderList);
	setupItemFields("rewardSources", rewardSourceList, rewardSourceHashIndex);
	for (let element of globalOptions.perkSortOrder) {
		let node = document.createElement("li");
		let data = perkList[perkHashIndex.indexOf(parseInt(element))];
		node.innerHTML = `<img src="https://www.bungie.net${data.displayIcon}" width="16" height="16" class="perkIcon"><span>${data.displayName}</span>`;
		node.title = data.displayDescription;
		node.id = element;
		perkSortList.appendChild(node);
	}
	new Sortable(perkSortList, {
		group: "perks",
		onSort: function() {
			var order = getSortOrder(perkSortList);
			setOption("perkSortOrder", order);
		}
	});
	new Sortable(perkUnusedList, {
		group: "perks"
	});
	// setupItemFields("qualitySortOrder", perkList, perkHashIndex);
	elements.refreshGear.addEventListener("click", function() {
		getAllOptions().then(organiseGear);
	});
	document.getElementById("debugHome").classList.remove("hidden");
	elements.refreshGear.removeAttribute("disabled");
	elements.status.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function() {
	elements.status.classList.add("active");
	database.open().then(getAllOptions).then(startUi);
});