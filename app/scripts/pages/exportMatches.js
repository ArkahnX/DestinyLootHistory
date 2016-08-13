// exports.minDate = new Date("2016-01-26T18:00:00Z"); // IRON BANNER JAN 26 RIFT
// exports.maxDate = new Date("2016-02-02T08:00:00Z"); // IRON BANNER JAN 26 RIFT
// exports.gameMode = "Rift"; // RIFT IRON BANNER
// exports.minDate = new Date("2016-02-09T18:00:00Z"); // CRIMSON DOUBLES FEB 9 DOUBLES
// exports.maxDate = new Date("2016-02-16T09:00:00Z"); // CRIMSON DOUBLES FEB 9 DOUBLES
// exports.gameMode = "Elimination"; // CRIMSON DOUBLES
// exports.minDate = new Date("2016-02-23T18:00:00Z"); // IRON BANNER FEB 23 CLASH
// exports.maxDate = new Date("2016-03-01T09:00:00Z"); // IRON BANNER FEB 23 CLASH
// exports.gameMode = "Team"; // Clash
// exports.minDate = new Date("2016-03-29T18:00:00Z"); // IRON BANNER MAR 29 CONTROL
// exports.maxDate = new Date("2016-04-05T09:00:00Z"); // IRON BANNER MAR 29 CONTROL
// exports.gameMode = "ironBanner"; // Iron Banner
// exports.minDate = new Date("2016-04-26T18:00:00Z"); // IRON BANNER APR 26 CLASH
// exports.maxDate = new Date("2016-05-03T09:00:00Z"); // IRON BANNER APR 26 CLASH
// exports.gameMode = "Team"; // Clash
// exports.minDate = new Date("2016-05-25T18:00:00Z"); // IRON BANNER MAY 25 CONTROL
// exports.maxDate = new Date("2016-05-31T09:00:00Z"); // IRON BANNER MAY 25 CONTROL
// exports.gameMode = "IronBanner"; // Control
// exports.minDate = new Date("2016-06-28T18:00:00Z"); // IRON BANNER June 28 Clash
// exports.maxDate = new Date("2016-07-05T09:00:00Z"); // IRON BANNER June 28 Clash
// exports.gameMode = "Team"; // Clash
// exports.playerNames = ["Biomech-ArkahnX", "Clockwork--Ninja", "sociopatrolman", "Sunbun", "Caidies", "Cmaaster", "ECHO2031"];
// exports.mainGuardian = "Biomech-ArkahnX";

var presetEvents = {
	CrimsonDoubles: {
		minDate: moment("2016-02-09T18:00:00Z").format(),
		maxDate: moment("2016-02-16T09:00:00Z").format(),
		gameMode: "Elimination"
	},
	SparrowRacing: {
		gameMode: "Racing",
		minDate: moment("2015-12-08T18:00:00Z").format(),
		maxDate: moment("2015-12-29T09:00:00Z").format()
	},
	IronBannerAugust2016: {
		gameMode: "Team",
		minDate: moment("2016-08-16T18:00:00Z").format(),
		maxDate: moment("2016-08-23T09:00:00Z").format()
	},
	IronBannerJuly2016: {
		gameMode: "IronBanner",
		minDate: moment("2016-07-19T18:00:00Z").format(),
		maxDate: moment("2016-07-26T09:00:00Z").format()
	},
	IronBannerJune2016: {
		gameMode: "Team",
		minDate: moment("2016-06-28T18:00:00Z").format(),
		maxDate: moment("2016-07-05T09:00:00Z").format()
	},
	IronBannerMay2016: {
		gameMode: "IronBanner",
		minDate: moment("2016-05-25T18:00:00Z").format(),
		maxDate: moment("2016-05-31T09:00:00Z").format()
	},
	IronBannerApril2016: {
		gameMode: "Team",
		minDate: moment("2016-04-26T18:00:00Z").format(),
		maxDate: moment("2016-05-03T09:00:00Z").format()
	},
	IronBannerMarch2016: {
		gameMode: "IronBanner",
		minDate: moment("2016-03-29T18:00:00Z").format(),
		maxDate: moment("2016-04-05T09:00:00Z").format()
	},
	IronBannerFebruary2016: {
		gameMode: "Team",
		minDate: moment("2016-02-23T18:00:00Z").format(),
		maxDate: moment("2016-03-01T09:00:00Z").format()
	},
	IronBannerJanuary2016: {
		gameMode: "Rift",
		minDate: moment("2016-01-26T18:00:00Z").format(),
		maxDate: moment("2016-02-02T09:00:00Z").format()
	},
	IronBannerDecember2015: {
		gameMode: "IronBanner",
		minDate: moment("2015-12-29T18:00:00Z").format(),
		maxDate: moment("2015-01-05T09:00:00Z").format()
	},
	IronBannerNovember2015: {
		gameMode: "Team",
		minDate: moment("2015-11-17T18:00:00Z").format(),
		maxDate: moment("2015-11-24T09:00:00Z").format()
	},
	IronBannerOctober2015: {
		gameMode: "IronBanner",
		minDate: moment("2015-10-13T19:00:00Z").format(),
		maxDate: moment("2015-10-20T09:00:00Z").format()
	},
	IronBannerAugust2015: {
		gameMode: "IronBanner",
		minDate: moment("2015-08-25T18:00:00Z").format(),
		maxDate: moment("2015-09-01T09:00:00Z").format()
	}
};

function returnDefaultOptions() {
	var systems = JSON.parse(localStorage.systems);
	var system = systems[localStorage.activeType];
	var currentIronBanner = presetEvents.IronBannerAugust2016;
	return {
		minDate: currentIronBanner.minDate,
		maxDate: currentIronBanner.maxDate,
		system: system.type,
		gameMode: currentIronBanner.gameMode,
		playerNames: [system.id],
		mainGuardian: system.id
	};
}

function getOptions() {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.get("options", function(result) {
			if (result.options && Object.keys(result.options).length > 0 && result.options.system !== 0 && result.options.playerNames.length > 0) {
				console.log(result.options)
				resolve(result.options);
			} else {
				console.log(result.options)
				reject(result.options);
			}
		});
	});
}

function setOptions(object) {
	var optionsObject = {
		options: object
	};
	chrome.storage.sync.set(optionsObject);
}

var elements = {
	launchButton: document.getElementById("gatherData"),
	gameModeSelect: document.getElementById("gameMode"),
	systemSelect: document.getElementById("system"),
	mainGuardianInput: document.getElementById("mainGuardian"),
	playerNamesInput: document.getElementById("playerNames"),
	minDateInput: document.getElementById("minDate"),
	presetSelect: document.getElementById("presets"),
	statusSpan: document.getElementById("status"),
	exportArea: document.getElementById("export"),
	overlay: document.getElementById("overlay"),
	individualSheet: document.getElementById("individualSheet"),
	multipleSheet: document.getElementById("multipleSheet"),
	maxDateInput: document.getElementById("maxDate")
};

document.addEventListener("DOMContentLoaded", function() {
	elements.launchButton = document.getElementById("gatherData");
	elements.gameModeSelect = document.getElementById("gameMode");
	elements.systemSelect = document.getElementById("system");
	elements.mainGuardianInput = document.getElementById("mainGuardian");
	elements.playerNamesInput = document.getElementById("playerNames");
	elements.minDateInput = document.getElementById("minDate");
	elements.presetSelect = document.getElementById("presets");
	elements.maxDateInput = document.getElementById("maxDate");
	elements.exportArea = document.getElementById("export");
	elements.overlay = document.getElementById("overlay");
	elements.individualSheet = document.getElementById("individualSheet");
	elements.multipleSheet = document.getElementById("multipleSheet");
	elements.statusSpan = document.getElementById("status");
	getOptions().then(fillOptionElements).catch(function(options) {
		if (!options) {
			options = {};
		}
		var defaultOptions = returnDefaultOptions();
		console.log(defaultOptions);
		setOptions(defaultOptions);
		fillOptionElements(defaultOptions);
	});
	elements.presetSelect.addEventListener("change", function() {
		var selectedValue = elements.presetSelect.value;
		console.log(selectedValue);
		if (selectedValue !== "None") {
			var preset = presetEvents[selectedValue];
			elements.minDateInput.value = moment(preset.minDate).format("YYYY-MM-DDTHH:mm:ss");
			elements.maxDateInput.value = moment(preset.maxDate).format("YYYY-MM-DDTHH:mm:ss");
			elements.gameModeSelect.value = preset.gameMode;
		}
	}, false);

	elements.playerNamesInput.addEventListener("keyup", function() {
		var selectedValue = elements.playerNamesInput.value.replace(/\s+/g, '').split(",");
		console.log(selectedValue);
		var html = [`\t\t\t\t\t<option value="" selected>All ${selectedValue.length} Guardians</option>`];
		for (var name of selectedValue) {
			html.push(`\t\t\t\t\t<option value="${name}">${name}</option>`);
		}
		elements.mainGuardianInput.innerHTML = html.join("\n");
	}, false);

	elements.launchButton.addEventListener("click", function() {
		elements.overlay.classList.remove("hidden");
		elements.multipleSheet.classList.add("hidden");
		elements.individualSheet.classList.add("hidden");
		var object = {
			minDate: moment(elements.minDateInput.value).utc().format(),
			maxDate: moment(elements.maxDateInput.value).utc().format(),
			mainGuardian: elements.mainGuardianInput.value,
			gameMode: elements.gameModeSelect.value,
			system: elements.systemSelect.value,
			playerNames: elements.playerNamesInput.value.replace(/\s+/g, '').split(",")
		};
		setOptions(object);
		getRemoteMatches().then(convertToTSV).then(function(tsvFile) {
			elements.overlay.classList.add("hidden");
			elements.exportArea.textContent = tsvFile;
			if (elements.mainGuardianInput.value === "") {
				elements.multipleSheet.classList.remove("hidden");
			} else {
				elements.individualSheet.classList.remove("hidden");
			}
		});
	}, false);
});

function fillOptionElements(options) {
	elements.maxDateInput.value = moment(options.maxDate).format("YYYY-MM-DDTHH:mm:ss");
	elements.minDateInput.value = moment(options.minDate).format("YYYY-MM-DDTHH:mm:ss");
	elements.playerNamesInput.value = options.playerNames.join(",");
	elements.mainGuardianInput.value = options.mainGuardian;
	elements.systemSelect.value = options.system;
	elements.presetSelect.value = options.system;
	elements.gameModeSelect.value = options.gameMode;
	var selectedValue = elements.playerNamesInput.value.replace(/\s+/g, '').split(",");
	console.log(selectedValue);
	var html = [`\t\t\t\t\t<option value="" selected>All ${selectedValue.length} Guardians</option>`];
	for (var name of selectedValue) {
		html.push(`\t\t\t\t\t<option value="${name}">${name}</option>`);
	}
	elements.mainGuardianInput.innerHTML = html.join("\n");
}

function setLogText(value) {
	console.log(moment().format(), value);
	elements.statusSpan.textContent = "Status: " + value;
}

var unsortedGames = [];
var foundGameIDs = [];
var gameIDList = [];
var playerCharacters = 0;
var membershipID = "";
var characterIDs = ["", "", ""];
var lastRequestTime = new Date().getTime();
var characterData = {};

function recursive(index, array, networkTask, resultTask, endRecursion) {
	if (array[index]) {
		new Promise(function(resolve, reject) {
			networkTask(array[index], resolve, index);
		}).then(function(result) {
			resultTask(result, array[index]);
			recursive(index + 1, array, networkTask, resultTask, endRecursion);
		});
	} else {
		endRecursion();
	}
}

function sequence(array, networkTask, resultTask) {
	return new Promise(function(resolve, reject) {
		recursive(0, array, networkTask, resultTask, resolve);
	});
}

function _request(url, resolve, reject) {
	var newDate = new Date().getTime();
	if (newDate - lastRequestTime >= 1000) { // make sure not to poll more than once per second for the same type of request
		lastRequestTime = newDate;
		let r = new XMLHttpRequest();
		r.open("GET", "https://www.bungie.net/Platform" + url, true);
		r.setRequestHeader('X-API-Key', '4a6cc3aa21d94c949e3f44736d036a8f');
		r.onload = function() {
			var result = JSON.parse(this.response);
			var responseURL = this.responseURL;
			if (this.status >= 200 && this.status < 400) {
				if (result.Response) {
					console.log()
					resolve(result.Response);
				} else {
					console.error(this, result, responseURL);
					reject();
				}
			} else {
				console.error(this);
				reject();
			}
		};

		r.onerror = function(err) {
			console.error(this, err);
			reject();
		};
		r.send();
	} else {
		setTimeout(function() {
			_request(url, resolve, reject);
		}, 1000);
	}
}

function makeRequest(url) {
	return new Promise(function(resolve, reject) {
		_request(url, resolve, reject);
	});
}

function getRemoteMatches() {
	return new Promise(function(resolve, reject) {
		getCharacterData().then(getMatchData).then(processMatchData).then(resolve);
	});
}

function _characterDataRequest(playerName, complete) {
	if (!characterData[playerName]) {
		setLogText(`Get Guardian Data for ${playerName}`);
		makeRequest(`/Destiny/${options.system}/Stats/GetMembershipIdByDisplayName/${playerName}/`).then(function(membershipId) {
			makeRequest(`/Destiny/${options.system}/Account/${membershipId}/Summary/`).then(function(Response) {
				complete({
					characters: Response.data.characters,
					membershipId: membershipId
				});
			}).catch(function() {
				complete(false);
			});
		}).catch(function() {
			complete(false);
		});
	} else {
		complete(false);
	}
}

function _characterDataResult(guardianData, playerName) {
	if (guardianData) {
		if (!characterData[playerName]) {
			characterData[playerName] = {
				membershipId: guardianData.membershipId,
				characters: []
			};
		}
		for (var character of guardianData.characters) {
			characterData[playerName].characters.push(character.characterBase.characterId);
		}
	}
}

function _getCharacterData(options, resolve) {
	chrome.storage.local.get("characterData", function(result) {
		characterData = result.characterData || {};
		sequence(options.playerNames, _characterDataRequest, _characterDataResult).then(function() {
			chrome.storage.local.set({
				characterData: characterData
			}, function() {
				setLogText(`Done`);
				resolve(options);
			});
		});
	});
}

function getCharacterData() {
	return new Promise(function(resolve, reject) {
		setLogText("Get Configuration");
		getOptions().then(function(options) {
			var fileName = `${moment(options.minDate).utc().format("YYMMDD")}_${moment(options.maxDate).utc().format("YYMMDD")}_${options.gameMode}`;
			setLogText("Get Match Data");
			chrome.storage.local.get(fileName, function(result) {
				if (result[fileName] && result[fileName].games) {
					unsortedGames = result[fileName].games;
					gameIDList = result[fileName].hashes;
				}
				for (var game of unsortedGames) {
					foundGameIDs.push(game.activityDetails.instanceId);
				}
				if (options.playerNames.indexOf(options.mainGuardian) === -1) {
					options.playerNames.push(options.mainGuardian);
				}
				_getCharacterData(options, resolve);
			});
		});
	});
}

function getMatchData(options) {
	return new Promise(function(resolve, reject) {
		var playerNames = Object.keys(characterData);
		sequence(playerNames, function(playerName, finalize) {
			setLogText(`Counting Games For ${playerName}`);
			sequence(characterData[playerName].characters, function(characterId, complete) {
				var membershipId = characterData[playerName].membershipId;
				recursiveMatches(options, membershipId, characterId, new Date(), 25, -1, complete);
			}, function(activityList, playerName) {}).then(finalize);
		}, function(activityList, playerName) {}).then(function() {
			var fileName = `${moment(options.minDate).utc().format("YYMMDD")}_${moment(options.maxDate).utc().format("YYMMDD")}_${options.gameMode}`;
			var object = {};
			object[fileName] = {
				games: unsortedGames,
				hashes: gameIDList
			};
			chrome.storage.local.set(object, function() {
				setLogText(`Done`);
				console.log(gameIDList);
				resolve(options);
			});
		});
	});
}

function _processActivity(activities, index, date, options) {
	if (activities[index]) {
		date = new Date(activities[index].period);
		if (date >= new Date(options.minDate) && date <= new Date(options.maxDate)) {
			if (gameIDList.indexOf(activities[index].activityDetails.instanceId) === -1) {
				setLogText(`Counting match ${gameIDList.length + 1}`);
				gameIDList.push(activities[index].activityDetails.instanceId);
			}
		}
		if (activities[index + 1] === "undefined") {
			date = new Date(options.minDate) - 1;
			break;
		}
	}
}

function recursiveMatches(options, membershipId, characterId, lastDate, count, page, complete) {
	if (lastDate >= new Date(options.minDate)) {
		page++;
		makeRequest(`/Destiny/Stats/ActivityHistory/${options.system}/${membershipId}/${characterId}/?mode=${options.gameMode}&count=${count}&page=${page}`).then(function(Response) {
			var activities = Response.data.activities;
			var date = new Date();
			if (activities) {
				for (var c = 0; c < count; c++) {
					date = _processActivity(activities, c, date, options);
				}
			} else {
				date = new Date(options.minDate) - 1;
			}
			recursiveMatches(options, membershipId, characterId, date, count, page, complete);
		}).catch(function() {
			complete();
		});
	} else if (lastDate < new Date(options.minDate)) {
		complete();
	}
}

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function(a, b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	};
}

function _matchDataRequest(gameId, complete, index) {
	setLogText(`Processing match ${((index / (gameIDList.length - 1)) * 100).toFixed(2)}%`);
	if (foundGameIDs.indexOf(gameId) === -1) {
		makeRequest(`/Destiny/Stats/PostGameCarnageReport/${gameId}/?definitions=false`).then(complete).catch(function() {
			complete(false);
		});
	} else {
		complete(false);
	}
}

function _matchDataResult(Response, gameId) {
	if (Response) {
		var mapHash = Response.data.activityDetails.referenceId;
		if (DestinyActivityDefinition[mapHash]) {
			Response.data.activityDetails.activityName = DestinyActivityDefinition[mapHash].activityName;
			unsortedGames.push(Response.data);
		} else {
			throw new Error("Undiscovered location: " + mapHash);
		}
	}
}

function processMatchData(options) {
	return new Promise(function(resolve, reject) {
		if (gameIDList.length) {
			sequence(gameIDList, _matchDataRequest, _matchDataResult).then(function() {
				setLogText(`Sorting Matches`);
				unsortedGames.sort(dynamicSort("period"));
				console.log(unsortedGames);
				setLogText(`Saving Game Data`);
				var fileName = `${moment(options.minDate).utc().format("YYMMDD")}_${moment(options.maxDate).utc().format("YYMMDD")}_${options.gameMode}`;
				var object = {};
				object[fileName] = {
					games: unsortedGames,
					hashes: gameIDList
				};
				chrome.storage.local.set(object, function() {
					setLogText(`Done`);
					resolve(options, object);
				});
			});
		} else {
			resolve(false);
		}
	});
}

function convertToTSV(options) {
	return new Promise(function(resolve, reject) {
		if (options) {
			sortGameData(options.mainGuardian).then(resolve);
		} else {
			resolve(false);
		}
	});
}

var previousGameTimeStamp = 0;
var previousGameDuration = 0;

function sortGameData(mainGuardian) {
	var sortedGames = [];
	return new Promise(function(resolve, reject) {
		var counter = 0;
		for (var i = 0; i < unsortedGames.length; i++) {
			var game = unsortedGames[i];
			if (game.teams && game.teams.length) {
				var uniquePlayers = [];
				game.entries.sort(dynamicSort2("-value"));
				for (var p = 0; p < game.entries.length; p++) {
					var entry = game.entries[p];
					var playerName = entry.player.destinyUserInfo.displayName;
					var me = findPlayer(game, playerName);
					if (mainGuardian === playerName || mainGuardian === "") {
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
								console.log(game.teams, game.activityDetails.instanceId, game) // FIXME
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
								mercy: (myteam.score.basic.value < 6000 && otherTeam.score.basic.value < 6000) ? "TRUE" : "FALSE",
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
								team: me.values.team.basic.displayValue,
							};
							sortedGames.push(join(statObject) + "\n");
						}
					}
				}
				previousGameTimeStamp = new Date(game.period).getTime();
				previousGameDuration = me.values.activityDurationSeconds.basic.value * 1000;
			}
		}
		resolve(sortedGames.join(""));
	});
}

function join(object) {
	var string = "";
	for (var attr in object) {
		string += object[attr];
		string += "\t";
	}
	string = string.slice(0, -1);
	return string;
}

function dynamicSort2(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function(a, b) {
		var result = (a.score.basic[property] < b.score.basic[property]) ? -1 : (a.score.basic[property] > b.score.basic[property]) ? 1 : 0;
		return result * sortOrder;
	};
}

function findPlayerPlace(game, playerName) {
	// game.entries.sort(dynamicSort("-value"))
	for (var i = 0; i < game.entries.length; i++) {
		if (game.entries[i].player.destinyUserInfo.displayName === playerName) {
			return i + 1;
		}
	}
}

function findPlayer(game, playerName) {
	// game.entries.sort(dynamicSort("value"))
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

function calculateWeapons(player) {
	var gunData = {
		primary: "No Kills",
		primaryType: "No Kills",
		primaryKills: 0,
		special: "No Kills",
		specialType: "No Kills",
		specialKills: 0,
		heavy: "No Kills",
		heavyType: "No Kills",
		heavyKills: 0
	};
	var guns = player.extended.weapons;
	if (guns) {
		// console.log(guns.length)
		for (var i = 0; i < guns.length; i++) {
			var gun = guns[i];
			var gunReference = DestinyCompactItemDefinition[gun.referenceId];
			if (!gunReference) {
				console.log(gun.referenceId);
				fs.writeFileSync("error.txt", gun.referenceId);
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