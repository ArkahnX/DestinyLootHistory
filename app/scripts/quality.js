function parseQuality(startingStat, startingDefense, endingDefense) {
	var maxStat = Math.floor(statValues[endingDefense] / statValues[startingDefense] * (startingStat + 1), 1);
	var minStat = Math.floor(statValues[endingDefense] / statValues[startingDefense] * startingStat, 1);
	return {
		maxStat,
		minStat
	};
}

function parseItemQuality(item) {
	var itemType = DestinyCompactItemDefinition[item.itemHash].itemTypeName.split(" ")[0];
	var results = [];
	var finalTier = {
		stat:0,
		max:0
	};
	for (var stat of item.stats) {
		var maxStat = parseQuality(stat.value, item.primaryStat.value, 335).maxStat;
		let result = {
			stat: maxStat,
			tier: Math.round(100 * maxStat/maxStatRolls[itemType])
		};
		finalTier.stat += maxStat;
		finalTier.max += maxStatRolls[itemType];
		results.push(result);
		console.log(result);
	}

}

function getBonus(light, type) {
	switch (type.toLowerCase()) {
		case 'helmet':
		case 'helmets':
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
		case 'chest armor':
			return light < 287 ? 20 :
				light < 300 ? 21 :
				light < 310 ? 22 :
				light < 319 ? 23 :
				light < 328 ? 24 : 25;
		case 'leg':
		case 'leg armor':
			return light < 284 ? 18 :
				light < 298 ? 19 :
				light < 309 ? 20 :
				light < 319 ? 21 :
				light < 329 ? 22 : 23;
		case 'classitem':
		case 'class items':
		case 'ghost':
		case 'ghosts':
			return light < 295 ? 8 :
				light < 319 ? 9 : 10;
		case 'artifact':
		case 'artifacts':
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

var maxStatRolls = {
	Helmet: 48,
	Gauntlets: 43,
	Chest: 61,
	Leg: 56,
	Hunter: 25,
	Titan: 25,
	Warlock: 25,
	Ghost: 25
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
	if (item.primaryStat && item.primaryStat.statHash === 3897883278) {
		var itemType = DestinyCompactItemDefinition[item.itemHash].itemTypeName;
		console.log(`itemType: ${itemType} itemLevel: ${item.primaryStat.value} itemStats: ${JSON.stringify(item.stats)}`);
		parseItemQuality(item);
	}
}