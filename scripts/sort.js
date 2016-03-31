var names = [];
// var names = ["Biomech-ArkahnX"];
var maxPlayers = 20;
var previousGameTimeStamp = 0;
var previousGameDuration = 0;
var previousMe = 0;
var previousDate = 0;
var characterData = {};


function sortGames(unsortedGames) {
	bungie.user(function() {
		bungie.search(function(response) {
			characterData = response.data;
			characterIDs = ["", "", ""];
			for (var i = 0; i < characterData.characters.length; i++) {
				characterIDs[i] = characterData.characters[i].characterBase.characterId;
			}
			processGameData(sortGameData);
		});
	});
}

function sortGameData(unsortedGames) {
	var counter = 0;
	for (var i = 0; i < unsortedGames.length; i++) {
		var game = unsortedGames[i];
		var uniquePlayers = [];
		game.entries.sort(playerSort("-value"));
		if (game.entries.length <= maxPlayers) {
			for (var p = 0; p < game.entries.length; p++) {
				var entry = game.entries[p];
				var playerName = entry.player.destinyUserInfo.displayName;
				var me = findPlayer(game, playerName);
				if (i === 0 && p === 0) {
					bungie.inventory(me.characterId, function(result) {
						for (var e = 0; e < result.data.items.length; e++) {
							if (result.data.items[e].quantity > 1) {
								console.log(result.data.items[e]);
							}
						}
						console.log(result.data.items);
					});
				}
				if ((names.length > 0 && names.indexOf(playerName) > -1) || names.length === 0) {
					if ((me.values.score.basic.value > 0 || me.values.activityDurationSeconds.basic.value > 30) && uniquePlayers.indexOf(me.characterId) === -1) {
						counter++;
						uniquePlayers.push(me.characterId);
						var gunData = calculateWeapons(me);
						var abilityData = abilityKills(me);
						if (me.values.team.basic.displayValue === "-") {
							me.values.team.basic.displayValue = "Bravo";
						}
						var myteam = findTeamStat(game, me.values.team.basic.displayValue);
						var otherTeam = findTeamStat(game, "Bravo");
						if (me.values.team.basic.displayValue === "Bravo") {
							otherTeam = findTeamStat(game, "Alpha");
						}
						if (typeof myteam !== "object") {
							console.log(game.teams, game.activityDetails.instanceId)
						}
						var timeBetweenGames = 0;
						if (previousGameTimeStamp) {
							timeBetweenGames = (new Date(game.period).getTime() - (previousGameTimeStamp + previousGameDuration)) / 1000;
						}
						if (timeBetweenGames < 0) {
							timeBetweenGames = 0;
						}
						var KD = (ifError(me.values.kills.basic.value, me.values.deaths.basic.value)).toFixed(2);
						var KAD = (ifError(me.values.kills.basic.value + me.values.assists.basic.value, me.values.deaths.basic.value)).toFixed(2);
						var statObject = {
							id: counter,
							mapName: game.activityDetails.activityName,
							kills: me.values.kills.basic.value,
							assists: me.values.assists.basic.value,
							deaths: me.values.deaths.basic.value,
							kd: KD,
							kad: KAD,
							win: myteam.standing.basic.displayValue == "Victory" ? "TRUE" : "FALSE",
							day: game.period.slice(0, 10),
							score: me.values.score.basic.value,
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
							place: findPlayerPlace(game, playerName),
							mercy: (myteam.score.basic.value < 16000 && otherTeam.score.basic.value < 16000) ? "TRUE" : "FALSE",
							primaryType: gunData.primaryType,
							specialType: gunData.specialType,
							heavyType: gunData.heavyType,
							guardian: playerName,
							classType: entry.player.characterClass,
							combatRating: abilityData.combatRating,
							bestWeapon: abilityData.bestWeapon,
							killSpree: abilityData.killSpree,
							avenger: abilityData.avenger,
							payBack: abilityData.payBack,
							objective: abilityData.relicsCaptured || abilityData.revives,
							medals: abilityData.medals,
							time: me.values.activityDurationSeconds.basic.value,
							betweenGames: timeBetweenGames,
						};
						var sortOrder = [
							"id",
							"mapName",
							"kills",
							"assists",
							"deaths",
							"kd",
							"kad",
							"win",
							"day",
							"score",
							"link",
							"primary",
							"special",
							"heavy",
							"primaryKills",
							"specialKills",
							"heavyKills",
							"melee",
							"grenade",
							"super",
							"teamscore",
							"enemyscore",
							"sparksCaptured",
							"dunks",
							"place",
							"mercy",
							"primaryType",
							"specialType",
							"heavyType",
							"guardian",
							"classType",
							"combatRating",
							"bestWeapon",
							"killSpree",
							"avenger",
							"payBack",
							"objective",
							"medals",
							"time",
							"betweenGames", ];
						sortedGames.push(statObject);
						// sortedGames.push(join(statObject) + "\n");
					}
				}
			}
			previousGameTimeStamp = new Date(game.period).getTime();
			previousGameDuration = me.values.activityDurationSeconds.basic.value * 1000;
			previousMe = me.values.activityDurationSeconds;
			previousDate = game.period
		}
	}
	chrome.storage.local.set({
		// "sortedgames": sortedGames.join("")
		"sortedgames": sortedGames
	});
	console.log(sortedGames)
	if (typeof makeTable === "function") {
		makeTable(sortedGames);
	}
};
var unsortedGames = [];
var sortedGames = [];


function join(object) {
	var string = "";
	for (var attr in object) {
		string += object[attr];
		string += "\t";
	}
	string = string.slice(0, -1);
	return string;
}

function playerSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function(a, b) {
		var result = (a.score.basic[property] < b.score.basic[property]) ? -1 : (a.score.basic[property] > b.score.basic[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

function findPlayerPlace(game, playerName) {
	// game.entries.sort(playerSort("-value"))
	for (var i = 0; i < game.entries.length; i++) {
		if (game.entries[i].player.destinyUserInfo.displayName === playerName) {
			return i + 1;
		}
	}
}

function findPlayer(game, playerName) {
	// game.entries.sort(playerSort("value"))
	for (var i = 0; i < game.entries.length; i++) {
		if (game.entries[i].player.destinyUserInfo.displayName === playerName) {
			return game.entries[i];
		}
	}
}

function findTeamStat(game, team) {
	for (var i = 0; i < game.teams.length; i++) {
		if (game.teams[i].teamName === team) {
			return game.teams[i];
		}
	}
}

var gunData = {
	primary: "",
	primaryKills: 0,
	special: "",
	specialKills: 0,
	heavy: "",
	heavyKills: 0
};

function calculateWeapons(player) {
	gunData = {
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
	var guns = player.extended.weapons;
	if (guns) {
		for (var i = 0; i < guns.length; i++) {
			var gun = guns[i];
			var gunReference = DestinyInventoryItemDefinition[gun.referenceId];
			if (!gunReference) {
				console.error(gun.referenceId);
			}
			if (primaries.indexOf(gunReference.itemTypeName) > -1 || ["Vex Mythoclast", "Universal Remote", "No Land Beyond"].indexOf(gunReference.itemName) > -1) {
				if (gun.values.uniqueWeaponKills.basic.value > gunData.primaryKills) {
					gunData.primaryKills = gun.values.uniqueWeaponKills.basic.value;
					gunData.primary = gunReference.itemName;
					gunData.primaryType = gunReference.itemTypeName;
				}
			}
			if (heavies.indexOf(gunReference.itemTypeName) > -1 || gunReference.itemName === "Sleeper Simulant") {
				if (gun.values.uniqueWeaponKills.basic.value > gunData.heavyKills) {
					gunData.heavyKills = gun.values.uniqueWeaponKills.basic.value;
					gunData.heavy = gunReference.itemName;
					gunData.heavyType = gunReference.itemTypeName;
				}
			}
			if (specials.indexOf(gunReference.itemTypeName) > -1 && ["Vex Mythoclast", "Universal Remote", "No Land Beyond", "Sleeper Simulant"].indexOf(gunReference.itemName) === -1) {
				if (gun.values.uniqueWeaponKills.basic.value > gunData.specialKills) {
					gunData.specialKills = gun.values.uniqueWeaponKills.basic.value;
					gunData.special = gunReference.itemName;
					gunData.specialType = gunReference.itemTypeName;
				}
			}
		}
	}
	return gunData;
}

var primaries = ["Hand Cannon", "Scout Rifle", "Auto Rifle", "Pulse Rifle"];
var specials = ["Shotgun", "Sniper Rifle", "Fusion Rifle", "Sidearm"];
var heavies = ["Rocket Launcher", "Machine Gun", "Sword"];

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

function ifError(num1, num2) {
	if (num2 === 0) {
		return num1;
	}
	return num1 / num2;
}