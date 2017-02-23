var primaries = ["Hand Cannon", "Scout Rifle", "Auto Rifle", "Pulse Rifle"];
var specials = ["Shotgun", "Sniper Rifle", "Fusion Rifle", "Sidearm"];
var heavies = ["Rocket Launcher", "Machine Gun", "Sword"];

function recursiveActivities(characterId, seasonData, activityInstanceIds, page, finish, data) {
	if (!data) {
		data = [];
	}
	bungie.activity(characterId, seasonData.gameMode, 25, ++page).then(function (Response) {
		if (typeof Response.data.activities === "undefined") {
			finish(data);
			return false;
		}
		for (let activity of Response.data.activities) {
			// console.log(moment(activity.period).format(), moment(activity.period).isSameOrBefore(seasonData.maxDate), moment(activity.period).isBefore(seasonData.minDate));
			if (moment(activity.period).isSameOrBefore(seasonData.maxDate) && moment(activity.period).isSameOrAfter(seasonData.minDate) && activityInstanceIds.indexOf(activity.activityDetails.instanceId) === -1) {
				data.push(activity.activityDetails.instanceId);
			}
			if (moment(activity.period).isBefore(seasonData.minDate)) {
				finish(data);
				return false;
			}
		}
		recursiveActivities(characterId, seasonData, activityInstanceIds, page, finish, data);
	});
}

function dynamicSort2(property) {
	let sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		let result = (a.score.basic[property] < b.score.basic[property]) ? -1 : (a.score.basic[property] > b.score.basic[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

function findTeamStat(game, team) {
	for (var i = 0; i < game.teams.length; i++) {
		if (game.teams[i].teamName === team) {
			return game.teams[i];
		}
	}
}

function findPlayerPlace(game, displayName) {
	// game.entries.sort(dynamicSort("-value"))
	for (var i = 0; i < game.entries.length; i++) {
		if (game.entries[i].player.destinyUserInfo.displayName === displayName) {
			return i + 1;
		}
	}
}

function ifError(num1, num2) {
	if (num2 === 0) {
		return num1;
	}
	return num1 / num2;
}

function abilityKills(player) {
	var abilities = {
		melee: 0,
		grenade: 0,
		super: 0,
		sparks: 0,
		dunks: 0,
		combatRating: 0,
		payBack: 0,
		medals: 0,
		bestWeapon: "No Kills",
		killSpree: 0,
		revives: 0,
		avenger: 0,
		neutralized: 0,
		caps: 0,
		orbsDropped: 0,
		orbsGathered: 0,
		relicsCaptured: 0,
	};
	if (player.extended.values.weaponKillsMelee) {
		abilities.melee = player.extended.values.weaponKillsMelee.basic.value;
	}
	if (player.extended.values.weaponKillsGrenade) {
		abilities.grenade = player.extended.values.weaponKillsGrenade.basic.value;
	}
	if (player.extended.values.weaponKillsSuper) {
		abilities.super = player.extended.values.weaponKillsSuper.basic.value;
	}
	if (player.extended.values.slamDunks) {
		abilities.dunks = player.extended.values.slamDunks.basic.value;
	}
	if (player.extended.values.sparksCaptured) {
		abilities.sparks = player.extended.values.sparksCaptured.basic.value;
	}
	if (player.extended.values.medalsPaybackKill) {
		abilities.payBack = player.extended.values.medalsPaybackKill.basic.value;
	}
	if (player.extended.values.allMedalsEarned) {
		abilities.medals = player.extended.values.allMedalsEarned.basic.value;
	}
	if (player.extended.values.weaponBestType) {
		abilities.bestWeapon = player.extended.values.weaponBestType.basic.displayValue;
		if (abilities.bestWeapon === "Machinegun") {
			abilities.bestWeapon = "Machine Gun";
		}
	}
	if (player.extended.values.longestKillSpree) {
		abilities.killSpree = player.extended.values.longestKillSpree.basic.value;
	}
	if (player.extended.values.resurrectionsPerformed) {
		abilities.revives = player.extended.values.resurrectionsPerformed.basic.value;
	}
	if (player.extended.values.medalsAvenger) {
		abilities.avenger = player.extended.values.medalsAvenger.basic.value;
	}
	if (player.extended.values.zonesNeutralized) {
		abilities.neutralized = player.extended.values.zonesNeutralized.basic.value;
	}
	if (player.extended.values.zonesCaptured) {
		abilities.caps = player.extended.values.zonesCaptured.basic.value;
	}
	if (player.extended.values.orbsDropped) {
		abilities.orbsDropped = player.extended.values.orbsDropped.basic.value;
	}
	if (player.extended.values.orbsGathered) {
		abilities.orbsGathered = player.extended.values.orbsGathered.basic.value;
	}
	if (player.extended.values.relicsCaptured) {
		abilities.relicsCaptured = player.extended.values.relicsCaptured.basic.value;
	}
	if (player.extended.values.combatRating) {
		abilities.combatRating = player.extended.values.combatRating.basic.value.toFixed(2);
	}
	return abilities;
}

function calculateWeapons(player) {
	let gunData = {
		primary: "No Kills",
		primaryType: "No Kills",
		primaryKills: 0,
		special: "No Kills",
		specialType: "No Kills",
		specialKills: 0,
		heavy: "No Kills",
		heavyType: "No Kills",
		heavyKills: 0
	}
	let guns = player.extended.weapons;
	if (guns) {
		// console.log(guns.length)
		for (let i = 0; i < guns.length; i++) {
			let gun = guns[i];
			let gunReference = DestinyCompactItemDefinition[gun.referenceId];
			if (!gunReference) {
				console.log(gun.referenceId);
			}
			if (primaries.indexOf(gunReference.itemTypeName) > -1 || ["Vex Mythoclast", "Universal Remote", "No Land Beyond"].indexOf(gunReference.itemName) > -1) {
				if (gun.values.uniqueWeaponKills.basic.value >= gunData.primaryKills) {
					gunData.primaryKills = gun.values.uniqueWeaponKills.basic.value;
					gunData.primary = gunReference.itemName;
					gunData.primaryType = gunReference.itemTypeName;
				}
			}
			if (heavies.indexOf(gunReference.itemTypeName) > -1 || gunReference.itemName === "Sleeper Simulant") {
				if (gun.values.uniqueWeaponKills.basic.value >= gunData.heavyKills) {
					gunData.heavyKills = gun.values.uniqueWeaponKills.basic.value;
					gunData.heavy = gunReference.itemName;
					gunData.heavyType = gunReference.itemTypeName;
				}
			}
			if (specials.indexOf(gunReference.itemTypeName) > -1 && ["Vex Mythoclast", "Universal Remote", "No Land Beyond", "Sleeper Simulant"].indexOf(gunReference.itemName) === -1) {
				if (gun.values.uniqueWeaponKills.basic.value >= gunData.specialKills) {
					gunData.specialKills = gun.values.uniqueWeaponKills.basic.value;
					gunData.special = gunReference.itemName;
					gunData.specialType = gunReference.itemTypeName;
				}
			}
		}
	}
	return gunData;
}

function processCarnageData(game, displayName, gameIndex, timeBetweenGames) {
	game.entries.sort(dynamicSort2("-value"));
	for (let entry of game.entries) {
		if (entry.player.destinyUserInfo.displayName === displayName && (entry.values.score.basic.value > 0 || entry.values.activityDurationSeconds.basic.value > 30)) {
			let gunData = calculateWeapons(entry);
			let abilityData = abilityKills(entry);
			if (entry.values.team.basic.displayValue === "-") {
				entry.values.team.basic.displayValue = "Bravo";
			}
			let myteam = findTeamStat(game, entry.values.team.basic.displayValue);
			let otherTeam = findTeamStat(game, "Bravo");
			if (entry.values.team.basic.displayValue === "Bravo") {
				otherTeam = findTeamStat(game, "Alpha");
			}
			if (typeof myteam !== "object") {
				console.log(game.teams, game.activityDetails.instanceId, game) // FIXME
			}
			let KD = (ifError(entry.values.kills.basic.value, entry.values.deaths.basic.value)).toFixed(2);
			let KAD = (ifError(entry.values.kills.basic.value + entry.values.assists.basic.value, entry.values.deaths.basic.value)).toFixed(2);
			return {
				id: gameIndex,
				mapName: DestinyActivityDefinition[game.activityDetails.referenceId].activityName,
				kills: entry.values.kills.basic.value,
				assists: entry.values.assists.basic.value,
				deaths: entry.values.deaths.basic.value,
				kd: KD,
				kad: KAD,
				win: myteam.standing.basic.displayValue === "Victory" ? "TRUE" : "FALSE",
				day: game.period.slice(0, 10),
				score: entry.values.score.basic.value,
				link: "http://destinytracker.com/dg/" + game.activityDetails.instanceId,
				primary: gunData.primary,
				special: gunData.special,
				heavy: gunData.heavy,
				primaryKills: gunData.primaryKills,
				specialKills: gunData.specialKills,
				heavyKills: gunData.heavyKills,
				melee: abilityData.melee,
				grenade: abilityData.grenade,
				super: abilityData.super,
				teamscore: myteam.score.basic.value,
				enemyscore: otherTeam.score.basic.value,
				sparksCaptured: abilityData.sparks || abilityData.neutralized,
				dunks: abilityData.dunks || abilityData.caps,
				place: findPlayerPlace(game, displayName),
				mercy: (myteam.score.basic.value < 6000 && otherTeam.score.basic.value < 6000) ? "TRUE" : "FALSE",
				primaryType: gunData.primaryType,
				specialType: gunData.specialType,
				heavyType: gunData.heavyType,
				guardian: displayName,
				classType: entry.player.characterClass,
				combatRating: abilityData.combatRating,
				bestWeapon: abilityData.bestWeapon,
				killSpree: abilityData.killSpree,
				avenger: abilityData.avenger,
				payBack: abilityData.payBack,
				objective: abilityData.relicsCaptured || abilityData.revives,
				medals: abilityData.medals,
				time: entry.values.activityDurationSeconds.basic.value,
				betweenGames: timeBetweenGames,
				team: entry.values.team.basic.displayValue,
			};
		}
	}
}

function kdStyle(kd) {
	if (kd >= 2) {
		return "data-gold";
	}
	if (kd >= 1) {
		return "data-green";
	}
	if (kd < 1) {
		return "data-red";
	}
}

function winStyle(win) {
	if (win === "TRUE") {
		return "data-win";
	}
	return "data-loss";
}

function countItems(storedCarnageData, item) {
	return count(storedCarnageData.lootColumns.RewardOne, item) + count(storedCarnageData.lootColumns.RewardTwo, item) + count(storedCarnageData.lootColumns.RewardThree, item) + count(storedCarnageData.lootColumns.RewardFour, item);
}

function sumIf(array, property, condition, value) {
	return array.reduce(function (a, b) {
		console.log(a, b)
		if (b[condition] === value) {
			return a + b[property];
		}
		return a;
	}, 0);
}

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function onlyHunters(value, index, self) {
	return value === "Hunter";
}

function onlyWarlocks(value, index, self) {
	return value === "Warlock";
}

function onlyTitans(value, index, self) {
	return value === "Titan";
}

function onlyWins(value, index, self) {
	return value === "TRUE";
}

function onlyLosses(value, index, self) {
	return value === "FALSE";
}

function onlyAlpha(value, index, self) {
	return value === "Alpha";
}

function onlyBravo(value, index, self) {
	return value === "Bravo";
}

function onlyNonEmptyLoot(value, index, self) {
	return value !== "";
}

function averageArray(array) {
	let total = 0;
	for (let i = 0; i < array.length; i++) {
		total += array[i];
	}
	return total / array.length;
}

function averageSpecialArray(array) {
	let total = 0;
	let totalLength = 0;
	for (let i = 0; i < array.length; i++) {
		if (array[i] < 500) {
			total += array[i];
			totalLength++;
		}
	}
	return total / totalLength;
}

function sumArray(a, b) {
	return a + b;
}

function count(array, item) {
	let count = 0;
	for (let entry of array) {
		if (entry.indexOf(item) > -1) {
			count++;
		}
	}
	return count;
}

function usedThreeOfCoins(value) {
	return value && value !== "unused";
}

function earnedExotics(value) {
	return value && value !== "unused" && value !== "used";
}

function getStatValue(property, storedCarnageData) {
	let REPLACEME = false;
	if (property.id === "matches") {
		return storedCarnageData.columns.link.filter(onlyUnique).length;
	} else if (property.id === "uniqueguardians") {
		return storedCarnageData.columns.guardian.filter(onlyUnique).length;
	} else if (property.id === "guardiandata") {
		return storedCarnageData.rows.length;
	} else if (property.id === "gameswon") {
		return storedCarnageData.columns.win.filter(onlyWins).length;
	} else if (property.id === "gameslost") {
		return storedCarnageData.columns.win.filter(onlyLosses).length;
	} else if (property.id === "win") {
		let wins = storedCarnageData.columns.win.filter(onlyWins).length;
		let games = storedCarnageData.rows.length;
		if (games === 0) {
			games = 1;
		}
		return Math.round((wins / games) * 100) + "%";
	} else if (property.id === "rewards") {
		let result1 = storedCarnageData.lootColumns.RewardOne.filter(onlyNonEmptyLoot).length;
		let result2 = storedCarnageData.lootColumns.RewardTwo.filter(onlyNonEmptyLoot).length;
		let result3 = storedCarnageData.lootColumns.RewardThree.filter(onlyNonEmptyLoot).length;
		let result4 = storedCarnageData.lootColumns.RewardFour.filter(onlyNonEmptyLoot).length;
		return result1 + result2 + result3 + result4;
	} else if (property.id === "rewardspergame") {
		console.log(storedCarnageData.lootColumns.RewardOne)
		let result1 = storedCarnageData.lootColumns.RewardOne.filter(onlyNonEmptyLoot).length;
		let result2 = storedCarnageData.lootColumns.RewardTwo.filter(onlyNonEmptyLoot).length;
		let result3 = storedCarnageData.lootColumns.RewardThree.filter(onlyNonEmptyLoot).length;
		let result4 = storedCarnageData.lootColumns.RewardFour.filter(onlyNonEmptyLoot).length;
		let rewards = result1 + result2 + result3 + result4;
		let games = storedCarnageData.columns.link.filter(onlyUnique).length;
		return (rewards / games).toFixed(2);
	} else if (property.id === "gamesperreward") {
		return REPLACEME;
	} else if (property.id === "hunters") {
		return storedCarnageData.columns.classType.filter(onlyHunters).length;
	} else if (property.id === "titans") {
		return storedCarnageData.columns.classType.filter(onlyTitans).length;
	} else if (property.id === "warlocks") {
		return storedCarnageData.columns.classType.filter(onlyWarlocks).length;
	} else if (property.id === "averagematchtimem") {
		return (averageArray(storedCarnageData.columns.time) / 60).toFixed(1);
	} else if (property.id === "averagetimematchmakings") {
		return averageSpecialArray(storedCarnageData.columns.betweenGames).toFixed(1);
	} else if (property.id === "teamalpha") {
		return storedCarnageData.columns.team.filter(onlyAlpha).length;
	} else if (property.id === "teambravo") {
		return storedCarnageData.columns.team.filter(onlyBravo).length;
	} else if (property.id === "bestkillingspree") {
		return Math.max.apply(null, storedCarnageData.columns.killSpree);
	} else if (property.id === "longestlosingstreak") {
		let compressed = storedCarnageData.columns.win.join("").split("TRUE");
		let maxLossStreak = 0;
		for (let streak of compressed) {
			if (streak.length / 5 > maxLossStreak) {
				maxLossStreak = streak.length / 5;
			}
		}
		return maxLossStreak;
	} else if (property.id === "longestwinningstreak") {
		let compressed = storedCarnageData.columns.win.join("").split("FALSE");
		let maxWinStreak = 0;
		for (let streak of compressed) {
			if (streak.length / 4 > maxWinStreak) {
				maxWinStreak = streak.length / 4;
			}
		}
		return maxWinStreak;
	} else if (property.id === "winningstreaks") {
		let compressed = storedCarnageData.columns.win.join("").split("FALSE");
		let count = 0;
		for (let streak of compressed) {
			if (streak.length > 4) {
				count++;
			}
		}
		return count;
	} else if (property.id === "losingstreaks") {
		let compressed = storedCarnageData.columns.win.join("").split("TRUE");
		let count = 0;
		for (let streak of compressed) {
			if (streak.length > 5) {
				count++;
			}
		}
		return count;
	} else if (property.id === "carriesneutralized") {
		return storedCarnageData.columns.sparksCaptured.reduce(sumArray, 0);
	} else if (property.id === "dunkscaptures") {
		return storedCarnageData.columns.dunks.reduce(sumArray, 0);
	} else if (property.id === "avenges") {
		return storedCarnageData.columns.avenger.reduce(sumArray, 0);
	} else if (property.id === "paybacks") {
		return storedCarnageData.columns.payBack.reduce(sumArray, 0);
	} else if (property.id === "medals") {
		return storedCarnageData.columns.medals.reduce(sumArray, 0);
	} else if (property.id === "kills") {
		return storedCarnageData.columns.kills.reduce(sumArray, 0);
	} else if (property.id === "assists") {
		return storedCarnageData.columns.assists.reduce(sumArray, 0);
	} else if (property.id === "deaths") {
		return storedCarnageData.columns.deaths.reduce(sumArray, 0);
	} else if (property.id === "kd") {
		return (storedCarnageData.columns.kills.reduce(sumArray, 0) / storedCarnageData.columns.deaths.reduce(sumArray, 0)).toFixed(2);
	} else if (property.id === "kad") {
		return ((storedCarnageData.columns.kills.reduce(sumArray, 0) + storedCarnageData.columns.assists.reduce(sumArray, 0)) / storedCarnageData.columns.deaths.reduce(sumArray, 0)).toFixed(2);
	} else if (property.id === "primarykills") {
		return storedCarnageData.columns.primaryKills.reduce(sumArray, 0);
	} else if (property.id === "specialkills") {
		return storedCarnageData.columns.specialKills.reduce(sumArray, 0);
	} else if (property.id === "heavykills") {
		return storedCarnageData.columns.heavyKills.reduce(sumArray, 0);
	} else if (property.id === "meleekills") {
		return storedCarnageData.columns.melee.reduce(sumArray, 0);
	} else if (property.id === "grenadekills") {
		return storedCarnageData.columns.grenade.reduce(sumArray, 0);
	} else if (property.id === "superkills") {
		return storedCarnageData.columns.super.reduce(sumArray, 0);
	} else if (property.id === "autorifle") {
		return count(storedCarnageData.columns.primaryType, "Auto Rifle");
	} else if (property.id === "scoutrifle") {
		return count(storedCarnageData.columns.primaryType, "Scout Rifle");
	} else if (property.id === "pulserifle") {
		return count(storedCarnageData.columns.primaryType, "Pulse Rifle");
	} else if (property.id === "handcannon") {
		return count(storedCarnageData.columns.primaryType, "Hand Cannon");
	} else if (property.id === "shotgun") {
		return count(storedCarnageData.columns.specialType, "Shotgun");
	} else if (property.id === "sniperrifle") {
		return count(storedCarnageData.columns.specialType, "Sniper Rifle");
	} else if (property.id === "fusionrifle") {
		return count(storedCarnageData.columns.specialType, "Fusion Rifle");
	} else if (property.id === "sidearm") {
		return count(storedCarnageData.columns.specialType, "Sidearm");
	} else if (property.id === "rocketlauncher") {
		return count(storedCarnageData.columns.heavyType, "Rocket Launcher");
	} else if (property.id === "machinegun") {
		return count(storedCarnageData.columns.heavyType, "Machine Gun");
	} else if (property.id === "sword") {
		return count(storedCarnageData.columns.heavyType, "Sword");
	} else if (rareItemNames.indexOf(property.name) > -1) {
		return countItems(storedCarnageData, property.name);
	} else if (property.id === "totaldropsandraterare") {
		let total = 0;
		for (let name of rareItemNames) {
			if (name !== "Mote of Light" && name !== "Strange Coin") {
				total += countItems(storedCarnageData, name);
			}
		}
		return total;
	} else if (property.id === "withmotesandcoins") {
		let total = 0;
		for (let name of rareItemNames) {
			total += countItems(storedCarnageData, name);
		}
		return total;
	} else if (legendaryItemNames.indexOf(property.name) > -1) {
		return countItems(storedCarnageData, property.name);
	} else if (property.id === "totaldropsandratelegendary") {
		let total = 0;
		for (let name of legendaryItemNames) {
			total += countItems(storedCarnageData, name);
		}
		return total;
	} else if (property.id === "threeofcoinsused") {
		return storedCarnageData.lootColumns.ThreeOfCoins.filter(usedThreeOfCoins).length;
	} else if (property.id === "exoticsearned") {
		return storedCarnageData.lootColumns.ThreeOfCoins.filter(earnedExotics).length;
	} else if (property.id === "tocperexotic") {
		return Math.round(storedCarnageData.lootColumns.ThreeOfCoins.filter(usedThreeOfCoins).length / (storedCarnageData.lootColumns.ThreeOfCoins.filter(earnedExotics).length || 1));
	} else if (property.id === "exoticpertoc") {
		return REPLACEME;
	} else if (exoticItemNames.indexOf(property.name) > -1) {
		return count(storedCarnageData.lootColumns.ThreeOfCoins, property.name);
	} else if (property.id === "exoticcost") {
		return Math.round(((7 / 5) * storedCarnageData.lootColumns.ThreeOfCoins.filter(usedThreeOfCoins).length) / storedCarnageData.lootColumns.ThreeOfCoins.filter(earnedExotics).length);
	} else if (property.id === "droprate") {
		return Math.round(storedCarnageData.lootColumns.ThreeOfCoins.filter(earnedExotics).length / (storedCarnageData.lootColumns.ThreeOfCoins.filter(usedThreeOfCoins).length || 1) * 100) + "%";
	}
	return false;
}

function getPercentValue(property, storedCarnageData) {
	let REPLACEME = "%%%";
	let kills = storedCarnageData.columns.kills.reduce(sumArray, 0);
	let matches = storedCarnageData.columns.link.filter(onlyUnique).length;
	if (property.id === "primarykills") {
		return Math.round(storedCarnageData.columns.primaryKills.reduce(sumArray, 0) / kills * 100) + "%";
	} else if (property.id === "specialkills") {
		return Math.round(storedCarnageData.columns.specialKills.reduce(sumArray, 0) / kills * 100) + "%";
	} else if (property.id === "heavykills") {
		return Math.round(storedCarnageData.columns.heavyKills.reduce(sumArray, 0) / kills * 100) + "%";
	} else if (property.id === "meleekills") {
		return Math.round(storedCarnageData.columns.melee.reduce(sumArray, 0) / kills * 100) + "%";
	} else if (property.id === "grenadekills") {
		return Math.round(storedCarnageData.columns.grenade.reduce(sumArray, 0) / kills * 100) + "%";
	} else if (property.id === "superkills") {
		return Math.round(storedCarnageData.columns.super.reduce(sumArray, 0) / kills * 100) + "%";
	} else if (property.id === "autorifle") {
		return Math.round(count(storedCarnageData.columns.primaryType, "Auto Rifle") / matches * 100) + "%";
	} else if (property.id === "scoutrifle") {
		return Math.round(count(storedCarnageData.columns.primaryType, "Scout Rifle") / matches * 100) + "%";
	} else if (property.id === "pulserifle") {
		return Math.round(count(storedCarnageData.columns.primaryType, "Pulse Rifle") / matches * 100) + "%";
	} else if (property.id === "handcannon") {
		return Math.round(count(storedCarnageData.columns.primaryType, "Hand Cannon") / matches * 100) + "%";
	} else if (property.id === "shotgun") {
		return Math.round(count(storedCarnageData.columns.specialType, "Shotgun") / matches * 100) + "%";
	} else if (property.id === "sniperrifle") {
		return Math.round(count(storedCarnageData.columns.specialType, "Sniper Rifle") / matches * 100) + "%";
	} else if (property.id === "fusionrifle") {
		return Math.round(count(storedCarnageData.columns.specialType, "Fusion Rifle") / matches * 100) + "%";
	} else if (property.id === "sidearm") {
		return Math.round(count(storedCarnageData.columns.specialType, "Sidearm") / matches * 100) + "%";
	} else if (property.id === "rocketlauncher") {
		return Math.round(count(storedCarnageData.columns.heavyType, "Rocket Launcher") / matches * 100) + "%";
	} else if (property.id === "machinegun") {
		return Math.round(count(storedCarnageData.columns.heavyType, "Machine Gun") / matches * 100) + "%";
	} else if (property.id === "sword") {
		return Math.round(count(storedCarnageData.columns.heavyType, "Sword") / matches * 100) + "%";
	} else if (rareItemNames.indexOf(property.name) > -1) {
		return Math.round(countItems(storedCarnageData, property.name) / storedCarnageData.columns.link.filter(onlyUnique).length * 100) + "%";
	} else if (property.id === "totaldropsandraterare") {
		let total = 0;
		for (let name of rareItemNames) {
			if (name !== "Mote of Light" && name !== "Strange Coin") {
				total += countItems(storedCarnageData, name);
			}
		}
		return Math.round(total / storedCarnageData.columns.link.filter(onlyUnique).length * 100) + "%";
	} else if (property.id === "withmotesandcoins") {
		let total = 0;
		for (let name of rareItemNames) {
			total += countItems(storedCarnageData, name);
		}
		return Math.round(total / storedCarnageData.columns.link.filter(onlyUnique).length * 100) + "%";
	} else if (legendaryItemNames.indexOf(property.name) > -1) {
		return Math.round(countItems(storedCarnageData, property.name) / storedCarnageData.columns.link.filter(onlyUnique).length * 100) + "%";
	} else if (property.id === "totaldropsandratelegendary") {
		let total = 0;
		for (let name of legendaryItemNames) {
			total += countItems(storedCarnageData, name);
		}
		return Math.round(total / storedCarnageData.columns.link.filter(onlyUnique).length * 100) + "%";
	} else if (exoticItemNames.indexOf(property.name) > -1) {
		return Math.round(count(storedCarnageData.lootColumns.ThreeOfCoins, property.name) / storedCarnageData.lootColumns.ThreeOfCoins.filter(usedThreeOfCoins).length * 100) + "%";
	} else if (property.id === "droprate") {
		return false;
	}
	return false;
}

function ui(databaseActivityId) {
	ironBannerDatabase.getEntry("carnageData", databaseActivityId).then(function (storedCarnageData) {
		document.getElementById("width-wrapper").innerHTML = "";
		matchDataUi(storedCarnageData);
		if (storedCarnageData && storedCarnageData.rows.length) {
			bestsUi(storedCarnageData);
			lootUi(storedCarnageData, presetEvents[document.getElementById("season").value]);
			statsUi(storedCarnageData);
			changePage();
		}
	});
}

function join(object) {
	let string = "";
	for (let attr in object) {
		string += object[attr];
		string += "\t";
	}
	string = string.slice(0, -1);
	return string;
}

function getCarnageData(activityInstanceIds, databaseActivityId, seasonData) {
	ironBannerDatabase.getEntry("carnageData", databaseActivityId).then(function (storedCarnageData) {
		let carnageData = [];
		if (storedCarnageData) {
			carnageData = storedCarnageData.rows;
		}
		if (carnageData.length) {
			let temp = [];
			for (let game of carnageData) {
				temp.push(game.link.split("http://destinytracker.com/dg/")[1]);
			}
			let temp2 = [];
			for (let instanceId of activityInstanceIds) {
				if (temp.indexOf(instanceId) === -1) {
					temp2.push(instanceId);
				}
			}
			activityInstanceIds = temp2;
		}
		if (activityInstanceIds.length) {
			exportData(seasonData.gameMode, seasonData.minDate, seasonData.maxDate, 4, true).then(function (lootDrops) {
				sequence(activityInstanceIds, function (activityInstanceId, finish) {
					bungie.carnage(activityInstanceId).then(finish);
				}, function (carnageReport, activityInstanceId) {
					// console.log(activityDetails, character.characterId);
					carnageData.push(carnageReport.data);
				}).then(function () {
					carnageData.sort(function (a, b) {
						return a.activityDetails.instanceId.localeCompare(b.activityDetails.instanceId);
					});
					let processedCarnageRows = [];
					let compressedCarnageData = [];
					let processedCarnageColumns = {};
					for (let sortedAttribute of sortOrder) {
						processedCarnageColumns[sortedAttribute.id] = [];
					}
					let lootColumns = {};
					for (let sortedAttribute of lootHeaders) {
						if (lootDrops[0] && typeof lootDrops[0][sortedAttribute.id] !== "undefined") {
							lootColumns[sortedAttribute.id] = [];
						}
					}
					for (let lootDrop of lootDrops) {
						for (let sortedAttribute of lootHeaders) {
							if (lootDrop && typeof lootDrop[sortedAttribute.id] !== "undefined") {
								lootColumns[sortedAttribute.id].push(lootDrop[sortedAttribute.id]);
							}
						}
					}
					let displayName = bungie.getCurrentAccount().displayName;
					let gameIndex = -1;
					let previousGameTimeStamp = 0;
					let previousGameDuration = 0;
					for (let game of carnageData) {
						if (game.teams && game.teams.length && game.entries.length <= 20) {
							let timeBetweenGames = 0;
							if (previousGameTimeStamp) {
								timeBetweenGames = (new Date(game.period).getTime() - (previousGameTimeStamp + previousGameDuration)) / 1000;
							}
							if (timeBetweenGames < 0) {
								timeBetweenGames = 0;
							}
							let result = processCarnageData(game, displayName, ++gameIndex, timeBetweenGames);
							if (result) {
								processedCarnageRows.push(result);
								compressedCarnageData.push(join(result) + "\n");
								for (let sortedAttribute of sortOrder) {
									processedCarnageColumns[sortedAttribute.id].push(result[sortedAttribute.id]);
								}
							}
							previousGameTimeStamp = new Date(game.period).getTime();
							previousGameDuration = game.entries[0].values.activityDurationSeconds.basic.value * 1000;
						}
					}

					console.log(compressedCarnageData);
					ironBannerDatabase.addSingle("carnageData", {
						activityId: databaseActivityId,
						lastUpdated: moment().format(),
						rows: processedCarnageRows,
						columns: processedCarnageColumns,
						lootRows: lootDrops,
						lootColumns: lootColumns
					}).then(function () {
						ironBannerDatabase.addSingle("tabSeparatedValues", {
							activityId: databaseActivityId,
							lastUpdated: moment().format(),
							data: compressedCarnageData.join("")
						}).then(function () {
							document.getElementById("season").removeAttribute("disabled");
							ui(databaseActivityId);
						});
					});
				});
			});
		} else {
			document.getElementById("season").removeAttribute("disabled");
			ui(databaseActivityId);
		}
	});
}

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function changeSeason() {
	let season = document.getElementById("season");
	document.getElementById("page").parentNode.classList.add("hidden");
	elements.status.classList.add("active");
	if (season.value) {
		season.setAttribute("disabled", "true");
		let seasonData = presetEvents[season.value];
		let bungieAccount = bungie.getCurrentAccount();
		let characters = bungieAccount.characters;
		let databaseActivityId = seasonData.id + "-" + bungieAccount.displayName;
		ironBannerDatabase.getEntry("activityInstanceIds", databaseActivityId).then(function (activityInstanceData) {
			let activityInstanceIds = [];
			if (activityInstanceData) {
				activityInstanceIds = activityInstanceData.data;
			}
			sequence(characters, function (character, finish) {
				recursiveActivities(character.characterId, seasonData, activityInstanceIds, -1, finish);
			}, function (activityDetails) {
				Array.prototype.push.apply(activityInstanceIds, activityDetails);
			}).then(function () {
				activityInstanceIds.filter(onlyUnique);
				activityInstanceIds.sort(function (a, b) {
					return a.localeCompare(b);
				});
				console.log(activityInstanceIds);
				ironBannerDatabase.addSingle("activityInstanceIds", {
					activityId: databaseActivityId,
					lastUpdated: moment().format(),
					data: activityInstanceIds
				});
				getCarnageData(activityInstanceIds, databaseActivityId, seasonData);
			});
		});
	}
}

function setupAccounts() {
	return new Promise(function (resolve) {
		let updatefn = bungie.getCurrentBungieAccount;
		if (bungie.ready()) {
			updatefn = bungie.accountInfo;
		}
		getOption("activeType").then(bungie.setActive).then(updatefn).then(resolve);
	});
}

function changePage() {
	let page = document.getElementById("page");
	page.parentNode.classList.remove("hidden");
	for (let element of document.getElementById("width-wrapper").children) {
		if (element.id !== page.value) {
			element.classList.add("hidden");
		}
	}
	document.getElementById(page.value).classList.remove("hidden");
	elements.status.classList.remove("active");
}

function sortByHighest(array, property) {
	array.sort(function (a, b) {
		return parseInt(b[property]) - parseInt(a[property]);
	});
}

function sortByLowest(array, property) {
	array.sort(function (a, b) {
		return parseInt(a[property]) - parseInt(b[property]);
	});
}

function sortBy(array, options) {
	let newArray = array;
	if (options.secondary) {
		newArray = array.filter(function (element) {
			return element[options.secondary] === options.secondaryValue;
		});
	}
	if (options.sort === "highest") {
		newArray.sort(function (a, b) {
			return parseInt(b[options.id]) - parseInt(a[options.id]);
		});
	} else if (options.sort === "lowest") {
		newArray.sort(function (a, b) {
			return parseInt(a[options.id]) - parseInt(b[options.id]);
		});
	} else {
		newArray.sort(function (a, b) {
			return parseInt(a[options]) - parseInt(b[options]);
		});
	}
	return newArray;
}

ironBannerDatabase.open().then(database.open).then(setupAccounts).then(function () {
	let season = document.getElementById("season");
	let page = document.getElementById("page");
	let bestSelect = document.getElementById("bestSelect");
	for (let activityPreset of presetEvents) {
		season.innerHTML += `<option value="${activityPreset.id}">${activityPreset.name}</option>`;
	}
	season.addEventListener("change", changeSeason, false);
	page.addEventListener("change", changePage, false);
	elements.status.classList.remove("active");
	document.getElementById("season").removeAttribute("disabled");
});