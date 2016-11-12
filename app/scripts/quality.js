/**
None				0
Currency			1
Armor				2
Weapon				3
Bounty				4
CompletedBounty		5
BountyReward		6
Message				7
Engram				8
Consumable			9
ExchangeMaterial	10
MissionReward		11
QuestStep			12
QuestStepComplete	13
Emblem				14
Quest				15
**/

function hasQuality(item) {
	var itemDef = getItemDefinition(item.itemHash);
	return (item.primaryStat && ((itemDef.itemType === 2 && item.primaryStat.value > 199 && (itemDef.tierType === 5 || itemDef.tierType === 6)) || (itemDef.itemType === 3 && itemDef.tierType === 5)) && item.stats && item.nodes);
}

function fitValue(light) {
	if (light > 300) {
		return (0.2546 * light) - 23.825;
	}
	if (light > 200) {
		return (0.1801 * light) - 1.4612;
	} else {
		return -1;
	}
}

function parseQuality(startingStat, startingDefense, endingDefense) {
	var max = Math.floor(fitValue(endingDefense) / fitValue(startingDefense) * (startingStat + 1));
	var min = Math.floor(fitValue(endingDefense) / fitValue(startingDefense) * startingStat);
	return {
		max,
		min
	};
}

function containsNodes(item, nodeNameList) {
	var result = 0;
	if (!Array.isArray(nodeNameList)) {
		nodeNameList = [nodeNameList];
	}
	var itemDef = getItemDefinition(item.itemHash);
	var grid = getNodes(item);
	for (var nodeName of nodeNameList) {
		for (var node of grid) {
			if (node.nodeStepName && node.nodeStepName.toLowerCase().indexOf(nodeName.toLowerCase()) > -1) {
				result++;
				break;
			}
		}
	}
	return Math.round((result / nodeNameList.length) * 100) || 0;
}

function talentsContainsPerkHashes(item, perkHashList) {
	var result = 0;
	if (!Array.isArray(perkHashList)) {
		perkHashList = [perkHashList];
	}
	var itemDef = getItemDefinition(item.itemHash);
	var grid = getNodes(item);
	for (var perkHash of perkHashList) {
		for (var node of grid) {
			if (node.perkHashes && node.perkHashes.indexOf(parseInt(perkHash)) > -1) {
				result++;
				break;
			}
		}
	}
	var extra = 10 - grid.length;
	return Math.round((result / 10) * 100) || 0;
}

function getItemCategoryName(item) {
	var itemDef = getItemDefinition(item.itemHash);
	if (itemDef.itemCategoryHashes.indexOf(38) > -1) {
		return "artifact";
	}
	if (itemDef.itemCategoryHashes.indexOf(39) > -1) {
		return "ghost";
	}
	if (itemDef.itemCategoryHashes.indexOf(45) > -1) {
		return "helmet";
	}
	if (itemDef.itemCategoryHashes.indexOf(46) > -1) {
		return "gauntlets";
	}
	if (itemDef.itemCategoryHashes.indexOf(47) > -1) {
		return "chest";
	}
	if (itemDef.itemCategoryHashes.indexOf(48) > -1) {
		return "leg";
	}
	if (itemDef.itemCategoryHashes.indexOf(49) > -1) {
		return "class";
	}
}

function getWeaponColor(value) {
	return value <= 49 ? "#F04242" :
		value <= 75 ? "#F07C42" :
		value <= 85 ? "#F0F042" :
		value <= 99 ? "#42F042" :
		value >= 100 ? "#42D3F0" : "rgba(255, 255, 255, .9)";
}

function getWeightForTalentGrid(talentGridHash, itemDef) {
	var totalPoints = 0;
	var columns = [];
	var talentDef = DestinyCompactTalentDefinition[talentGridHash];
	for (var node of talentDef.nodes) {
		var nodePoints = 0;
		for (let step of node.steps) {
			if (globalOptions.highValuePerks.indexOf(step.nodeStepHash + "") > -1 && nodePoints < 3) {
				// console.log(`${itemDef.itemName} - ${step.nodeStepName} - 3 - ${step.nodeStepHash}`)
				nodePoints = 3;
				break;
			} else if (globalOptions.midValuePerks.indexOf(step.nodeStepHash + "") > -1 && nodePoints < 2) {
				// console.log(`${itemDef.itemName} - ${step.nodeStepName} - 2 - ${step.nodeStepHash}`)
				nodePoints = 2;
			} else if (globalOptions.lowValuePerks.indexOf(step.nodeStepHash + "") > -1 && nodePoints < 1) {
				// console.log(`${itemDef.itemName} - ${step.nodeStepName} - 1 - ${step.nodeStepHash}`)
				nodePoints = 1;
			} else if (validWeaponPerks.indexOf(step.nodeStepHash) > -1 && nodePoints === 0) {
				// console.log(`${itemDef.itemName} - ${step.nodeStepName} - extra - ${step.nodeStepHash}`)
				nodePoints = 1;
			}
		}
		if (!columns[node.column || 0] || columns[node.column || 0] < nodePoints) {
			columns[node.column || 0] = nodePoints;
		}
		// totalPoints += nodePoints;
	}
	// console.log(itemDef.itemName, columns)
	for (let columnData of columns) {
		totalPoints += columnData;
	}
	if (totalPoints === 0) {
		totalPoints = 1;
	}
	return totalPoints;
}

function parseWeaponPerkQuality(item, grid, itemDef, itemType) {
	var stats = item.stats;
	var light = item.primaryStat.value;
	var columns = [];
	var columnWeights = {};
	var columnDefWeights = getWeightForTalentGrid(item.talentGridHash, itemDef);
	var points = 0;
	for (var node of grid) {
		var point = 0;
		// if (!columns[node.column]) {
		// 	columns[node.column] = [];
		// 	columnWeights[node.column] = [];
		// }
		// columns[node.column].push(node);
		if (globalOptions.highValuePerks.indexOf(node.nodeStepHash + "") > -1) {
			// console.log(`${itemDef.itemName} - ${node.nodeStepName} - 3`)
			point += 3;
		} else if (globalOptions.midValuePerks.indexOf(node.nodeStepHash + "") > -1) {
			// console.log(`${itemDef.itemName} - ${node.nodeStepName} - 2`)
			point += 2;
		} else if (globalOptions.lowValuePerks.indexOf(node.nodeStepHash + "") > -1) {
			// console.log(`${itemDef.itemName} - ${node.nodeStepName} - 1`)
			point += 1;
		}
		if (!columns[node.column - 1] || columns[node.column - 1] < point) {
			columns[node.column - 1] = point;
		}
	}
	// console.log(itemDef.itemName, columns)
	for (let columnData of columns) {
		points += columnData;
	}
	// var weight = [];
	// for (let column = 0; column < columns.length; column++) {
	// 	if (columns[column]) {
	// 		for (let row = 0; row < columns[column].length; row++) {
	// 			if (columnDefWeights[column] && columnDefWeights[column][row]) {
	// 				weight.push((columnWeights[column][row] || 0) / columnDefWeights[column][row]);
	// 			} else {
	// 				weight.push(0)
	// 			}
	// 		}
	// 	}
	// }
	// console.log(weight)
	// var sum = 0;
	// for (var i = 0; i < weight.length; i++) {
	// 	sum += weight[i];
	// }

	// var avg = Math.round((sum / weight.length) * 100);
	// console.log(grid, columns, columnDefWeights, columnWeights);
	// console.log(itemDef.itemName, points, columnDefWeights);
	return {
		min: Math.round((points / columnDefWeights) * 100),
		max: Math.round((points / columnDefWeights) * 100),
		color: getWeaponColor(Math.round((points / columnDefWeights) * 100))
	};
}

function parseItemQuality(item) {
	var grid = getNodes(item);
	var itemDef = getItemDefinition(item.itemHash);
	var itemType = getItemCategoryName(item);
	if (itemDef.itemType === 3) {
		return parseWeaponPerkQuality(item, grid, itemDef, itemType);
	}
	var stats = item.stats;
	var light = item.primaryStat.value;

	var split = 0;
	if (maxStatRolls[itemType]) {
		split = maxStatRolls[itemType];
	}

	var ret = {
		total: {
			min: 0,
			max: 0
		},
		max: split * 2
	};

	var statBonus = getBonus(item.primaryStat.value, itemType);
	if (stats) {
		for (var stat of stats) {
			var scaled = 0;
			var statValue = stat.value;
			for (var node of grid) {
				if (node.isActivated) {
					if (stat.statHash === 144602215 && node.nodeStepHash === 1034209669) { // intellect
						statValue = stat.value - statBonus;
					} else if (stat.statHash === 1735777505 && node.nodeStepHash === 1263323987) { // discipline
						statValue = stat.value - statBonus;
					} else if (stat.statHash === 4244567218 && node.nodeStepHash === 193091484) { // strength
						statValue = stat.value - statBonus;
					}
				}
			}
			if (statValue) {
				var max = 335;
				if (light > max) {
					max = light;
				}
				scaled = parseQuality(statValue, light, max);
			}
			ret.total.min += scaled.min || 0;
			ret.total.max += scaled.max || 0;
		}
	}

	return {
		min: Math.round(ret.total.min / ret.max * 100),
		max: Math.round(ret.total.max / ret.max * 100),
		color: getColor(Math.round(ret.total.min / ret.max * 100))
	};
}

function getColor(value) {
	return value <= 85 ? "#F04242" :
		value <= 90 ? "#F07C42" :
		value <= 95 ? "#F0F042" :
		value <= 99 ? "#42F042" :
		value >= 100 ? "#42D3F0" : "rgba(255, 255, 255, .9)";
}

function getBonus(light, type) {
	switch (type) {
		case 'helmet':
			return light < 292 ? 15 :
				light < 307 ? 16 :
				light < 319 ? 17 :
				light < 332 ? 18 : 19;
		case 'gauntlets':
			return light < 287 ? 13 :
				light < 305 ? 14 :
				light < 319 ? 15 :
				light < 333 ? 16 : 17;
		case 'chest':
			return light < 287 ? 20 :
				light < 300 ? 21 :
				light < 310 ? 22 :
				light < 319 ? 23 :
				light < 328 ? 24 : 25;
		case 'leg':
			return light < 284 ? 18 :
				light < 298 ? 19 :
				light < 309 ? 20 :
				light < 319 ? 21 :
				light < 329 ? 22 : 23;
		case 'class':
		case 'ghost':
			return light < 295 ? 8 :
				light < 319 ? 9 : 10;
		case 'artifact':
			return light < 287 ? 34 :
				light < 295 ? 35 :
				light < 302 ? 36 :
				light < 308 ? 37 :
				light < 314 ? 38 :
				light < 319 ? 39 :
				light < 325 ? 40 :
				light < 330 ? 41 :
				light < 335 ? 42 : 43;
	}
	// console.warn('item bonus not found', type);
	return 0;
}

function getNodes(item, nodes, talentGridHash) {
	let itemData = item;
	var parsedNodes = [];
	var rows = 1;
	var columns = 1;
	if (!nodes && !talentGridHash && !item) {
		return {
			nodes: parsedNodes,
			rows,
			columns
		};
	}
	if (!item) {
		itemData = {};
		itemData.nodes = nodes;
		itemData.talentGridHash = talentGridHash;
	}
	if (itemData.nodes) {
		var grid = DestinyCompactTalentDefinition[itemData.talentGridHash];
		for (var node of itemData.nodes) {
			for (var data of grid.nodes) {
				if ((data.nodeHash === node.nodeHash || (node.nodeHash === 0 && !data.nodeHash)) && !node.hidden && node.stepIndex > -1) {
					var step = data.steps[node.stepIndex];
					if (!step) {
						console.log(data, node)
					}
					if (data.column + 1 > columns) {
						columns = data.column + 1;
					}
					if (data.row + 1 > rows) {
						rows = data.row + 1;
					}
					var nodeData = {
						column: data.column + 1 || 1,
						row: data.row + 1 || 1,
						icon: step.icon,
						nodeStepDescription: step.nodeStepDescription,
						nodeStepHash: step.nodeStepHash,
						nodeHash: node.nodeHash,
						stepIndex: step.stepIndex,
						perkHashes: step.perkHashes,
						activatedAtGridLevel: step.activationRequirement.gridLevel,
						nodeStepName: step.nodeStepName,
						isActivated: node.isActivated,
						state: node.state
					};
					parsedNodes.push(nodeData);
				}
			}
		}
		if (nodes && talentGridHash) {
			return {
				nodes: parsedNodes,
				rows,
				columns
			};
		}
		return parsedNodes;
	}
	return {
		nodes: parsedNodes,
		rows,
		columns
	};
}

var maxStatRolls = {
	"helmet": 46,
	"gauntlets": 41,
	"chest": 61,
	"leg": 56,
	"class": 25,
	"ghost": 25,
	"artifact": 38
};

var statValues = {
	200: 34.5588,
	201: 34.7389,
	202: 34.919,
	203: 35.0991,
	204: 35.2792,
	205: 35.4593,
	206: 35.6394,
	207: 35.8195,
	208: 35.9996,
	209: 36.1797,
	210: 36.3598,
	211: 36.5399,
	212: 36.72,
	213: 36.9001,
	214: 37.0802,
	215: 37.2603,
	216: 37.4404,
	217: 37.6205,
	218: 37.8006,
	219: 37.9807,
	220: 38.1608,
	221: 38.3409,
	222: 38.521,
	223: 38.7011,
	224: 38.8812,
	225: 39.0613,
	226: 39.2414,
	227: 39.4215,
	228: 39.6016,
	229: 39.7817,
	230: 39.9618,
	231: 40.1419,
	232: 40.322,
	233: 40.5021,
	234: 40.6822,
	235: 40.8623,
	236: 41.0424,
	237: 41.2225,
	238: 41.4026,
	239: 41.5827,
	240: 41.7628,
	241: 41.9429,
	242: 42.123,
	243: 42.3031,
	244: 42.4832,
	245: 42.6633,
	246: 42.8434,
	247: 43.0235,
	248: 43.2036,
	249: 43.3837,
	250: 43.5638,
	251: 43.7439,
	252: 43.924,
	253: 44.1041,
	254: 44.2842,
	255: 44.4643,
	256: 44.6444,
	257: 44.8245,
	258: 45.0046,
	259: 45.1847,
	260: 45.3648,
	261: 45.5449,
	262: 45.725,
	263: 45.9051,
	264: 46.0852,
	265: 46.2653,
	266: 46.4454,
	267: 46.6255,
	268: 46.8056,
	269: 46.9857,
	270: 47.1658,
	271: 47.3459,
	272: 47.526,
	273: 47.7061,
	274: 47.8862,
	275: 48.0663,
	276: 48.2464,
	277: 48.4265,
	278: 48.6066,
	279: 48.7867,
	280: 48.9668,
	281: 49.1469,
	282: 49.327,
	283: 49.5071,
	284: 49.6872,
	285: 49.8673,
	286: 50.0474,
	287: 50.2275,
	288: 50.4076,
	289: 50.5877,
	290: 50.7678,
	291: 50.9479,
	292: 51.128,
	293: 51.3081,
	294: 51.4882,
	295: 51.6683,
	296: 51.8484,
	297: 52.0285,
	298: 52.2086,
	299: 52.3887,
	300: 52.555,
	301: 52.8096,
	302: 53.0642,
	303: 53.3188,
	304: 53.5734,
	305: 53.828,
	306: 54.0826,
	307: 54.3372,
	308: 54.5918,
	309: 54.8464,
	310: 55.101,
	311: 55.3556,
	312: 55.6102,
	313: 55.8648,
	314: 56.1194,
	315: 56.374,
	316: 56.6286,
	317: 56.8832,
	318: 57.1378,
	319: 57.3924,
	320: 57.647,
	321: 57.9016,
	322: 58.1562,
	323: 58.4108,
	324: 58.6654,
	325: 58.92,
	326: 59.1746,
	327: 59.4292,
	328: 59.6838,
	329: 59.9384,
	330: 60.193,
	331: 60.4476,
	332: 60.7022,
	333: 60.9568,
	334: 61.2114,
	335: 61.466
};

var validWeaponPerks = [1647823253, 186107093, 3669692864, 577762578, 3168941623, 686081071, 453334051, 994456416, 2910350468, 2493727727, 3756868213, 3420574674, 1393124125, 265561391, 2443668841, 695712111, 190272820, 2875733392, 1891493121, 1450441122, 3985040583, 300289986, 324009713, 3359693707, 2335058401, 2164126547, 792270175, 3583346327, 2246149211, 2801245349, 2935707225, 762005899, 2960149342, 3355015915, 1008399900, 728329578, 1410981459, 4020792686, 1271574376, 868135889, 148132307, 62342138, 3160334135, 620788128, 3582177736, 1281897011, 3624251231, 556476910, 616081201, 1923295819, 4198030754, 1627795050, 3528431156, 3058480256, 3232540036, 2837264531, 1085914778, 2433187730, 3527977584, 387580157, 3352501118, 215264323, 2485527920, 60002887, 1699141682, 1919385086, 882930025, 1795467064, 3742851299, 2098777628, 1345676076, 1821665467, 423261833, 386636896, 3979525328, 185449329, 2133887516, 431265444, 2788650063, 1759800752, 3279824990, 1278010675, 2806121217, 49794312, 1324739096, 3006914496, 1419200282, 3409718360, 1987488058, 1013303099, 221290636, 3125734432, 4081260527, 2889679361, 3975020101, 4179962704, 3383721778, 4017426047, 3842144658, 1094816219, 2546741293, 3342147638, 3671057472, 2555124303, 3687977041, 1640131399, 2110331143, 1509962390, 3044181713, 385634121, 3567563393, 3741288340, 1782221257, 3766810936, 2746971172, 1522616589, 1382212563, 2957484368, 2094642344, 1467131454, 817861275, 2479685401, 924252026, 3069944219, 1445276424, 169883190, 1734554166, 1738778771, 3986909762, 2502465203, 3024268258, 3895120982, 3803161218, 2201228393, 3468004786, 4169078065, 838935487, 116142342, 2484463758, 2127742624, 1086530641, 855592488, 3707521590, 2715081031, 1789968129, 213547364, 904218236];