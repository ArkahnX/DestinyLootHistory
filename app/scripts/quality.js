function parseQuality(startingStat, startingDefense, endingDefense) {
	var maxStat = Math.floor(statValues[endingDefense] / statValues[startingDefense] * (startingStat + 1), 1);
	var minStat = Math.floor(statValues[endingDefense] / statValues[startingDefense] * startingStat, 1);
	return {
		maxStat,
		minStat
	};
}

function parseItemQuality(item) {
	// console.log(JSON.stringify(item.stats));
	var grid = getNodes(item);
	var itemDef = DestinyCompactItemDefinition[item.itemHash]
	var itemType = itemDef.itemTypeName.split(" ")[0];
	if (itemDef.itemTypeName.split(" ")[1]) {
		itemType = itemType + " " + itemDef.itemTypeName.split(" ")[1];
	}
	var finalTier = {
		stat: 0,
		max: 0,
		color: "rgba(255, 255, 255, .9)",
		results: []
	};
	for (var stat of item.stats) {
		var statValue = stat.value;
		for (var node of grid) {
			if (node.isActivated) {
				var statBonus = getBonus(item.primaryStat.value, itemType);
				if (stat.statHash === 144602215 && node.nodeStepHash === 1034209669) { // intellect
					statValue = stat.value - statBonus;
				} else if (stat.statHash === 1735777505 && node.nodeStepHash === 1263323987) { // discipline
					statValue = stat.value - statBonus;
					console.log(itemDef.itemName, statValue, stat.value, statBonus);
				} else if (stat.statHash === 4244567218 && node.nodeStepHash === 193091484) { // strength
					statValue = stat.value - statBonus;
				}
			}
		}

		var minStat = parseQuality(statValue, item.primaryStat.value, 335).minStat;
		let result = {
			stat: minStat,
			tier: Math.round(100 * minStat / maxStatRolls[itemType])
		};
		if (stat.value > 0) {
			finalTier.stat += minStat;
			finalTier.max += maxStatRolls[itemType];
			finalTier.color = getColor(Math.round(finalTier.stat / finalTier.max * 100));
		}
		finalTier.results.push(result);
		// console.log(result);
	}
	return finalTier;
	// console.log(finalTier, results);
}

function getQualityRating(stats, light, type) { // FIXME: try this function
	if (!stats || light.value < 200) {
		return null;
	}

	var split = 0;
	switch (type.toLowerCase()) {
		case 'helmet':
			split = 46; // bungie reports 48, but i've only seen 46
			break;
		case 'gauntlets':
			split = 41; // bungie reports 43, but i've only seen 41
			break;
		case 'chest':
			split = 61;
			break;
		case 'leg':
			split = 56;
			break;
		case 'classitem':
		case 'ghost':
			split = 25;
			break;
		case 'artifact':
			split = 38;
			break;
		default:
			return null;
	}

	var ret = {
		total: {
			min: 0,
			max: 0
		},
		max: split * 2
	};

	var pure = 0;
	stats.forEach(function(stat) {
		var scaled = 0;
		if (stat.base) {
			scaled = getScaledStat(stat.base, light.value);
			pure = scaled.min;
		}
		stat.scaled = scaled;
		stat.split = split;
		stat.qualityPercentage = {
			min: Math.min(100, Math.round(100 * stat.scaled.min / stat.split)),
			max: Math.min(100, Math.round(100 * stat.scaled.max / stat.split))
		};
		ret.total.min += scaled.min || 0;
		ret.total.max += scaled.max || 0;
	});

	if (pure === ret.total.min) {
		stats.forEach(function(stat) {
			stat.scaled = {
				min: Math.floor(stat.scaled.min / 2),
				max: Math.floor(stat.scaled.max / 2)
			};
			stat.qualityPercentage = {
				min: Math.min(100, Math.round(100 * stat.scaled.min / stat.split)),
				max: Math.min(100, Math.round(100 * stat.scaled.max / stat.split))
			};
		});
	}

	return {
		min: Math.round(ret.total.min / ret.max * 100),
		max: Math.round(ret.total.max / ret.max * 100)
	};
}

function getColor(value) {
	var color = 0;
	if (value <= 85) {
		color = 0;
	} else if (value <= 90) {
		color = 20;
	} else if (value <= 95) {
		color = 60;
	} else if (value <= 99) {
		color = 120;
	} else if (value >= 100) {
		color = 190;
	} else {
		return 'rgba(255, 255, 255, .9)';
	}
	return 'hsl(' + color + ',85%,60%)';
}

function getBonus(light, type) { // FIXME: figure out stat node increases from light 200-280. Might need to make a new character on a new account.
	switch (type.toLowerCase()) {
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
		case 'chest armor':
			return light < 287 ? 20 :
				light < 300 ? 21 :
				light < 310 ? 22 :
				light < 319 ? 23 :
				light < 328 ? 24 : 25;
		case 'leg armor':
			return light < 284 ? 18 :
				light < 298 ? 19 :
				light < 309 ? 20 :
				light < 319 ? 21 :
				light < 329 ? 22 : 23;
		case 'warlock bond':
		case 'titan mark':
		case 'hunter cloak':
		case 'ghost shell':
			return light < 295 ? 8 :
				light < 319 ? 9 : 10;
		case 'hunter artifact':
		case 'warlock artifact':
		case 'titan artifact':
			return light < 287 ? 34 :
				light < 295 ? 35 :
				light < 302 ? 36 :
				light < 308 ? 37 :
				light < 314 ? 38 :
				light < 319 ? 39 :
				light < 325 ? 40 :
				light < 330 ? 41 : 42;
		case 'lost items':
			// TODO: this can be improved when we separate an item's type from its location, but for now we don't know
			return 0;
	}
	console.warn('item bonus not found', type);
	return 0;
}

function getNodes(item) {
	if (item.nodes) {
		var grid = DestinyCompactTalentDefinition[item.talentGridHash];
		var parsedNodes = [];
		for (var node of item.nodes) {
			for (var data of grid.nodes) {
				if (data.nodeHash === node.nodeHash) {
					var step = data.steps[node.stepIndex];
					var nodeData = {
						icon: step.icon,
						nodeStepDescription: step.nodeStepDescription,
						nodeStepHash: step.nodeStepHash,
						nodeStepName: step.nodeStepName,
						isActivated: node.isActivated,
					};
					parsedNodes.push(nodeData);
				}
			}
		}
		return parsedNodes;
	}
}

var maxStatRolls = {
	Helmet: 48,
	Gauntlets: 43,
	"Chest Armor": 61,
	"Leg Armor": 56,
	"Hunter Cloak": 25,
	"Titan Mark": 25,
	"Warlock Bond": 25,
	"Ghost Shell": 25,
	"Hunter Artifact": 25,
	"Titan Artifact": 25,
	"Warlock Artifact": 25
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

for (var item of data.inventories["2305843009221440972"]) {
	if (item.primaryStat && item.primaryStat.statHash === 3897883278 && item.stats) {
		var itemType = DestinyCompactItemDefinition[item.itemHash].itemTypeName;
		var itemName = DestinyCompactItemDefinition[item.itemHash].itemName;
		console.log(`itemName: ${itemName} itemType: ${itemType} itemLevel: ${item.primaryStat.value}`);
		var result = parseItemQuality(DestinyCompactItemDefinition[item.itemHash]);
		console.log(item);
	}
}