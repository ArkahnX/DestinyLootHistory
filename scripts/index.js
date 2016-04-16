// curl -i -H "Accept: application/json" -H "Content-Type: application/json" -H "X-API-Key: 4a6cc3aa21d94c949e3f44736d036a8f" -H "x-csrf: 9193414393683614504" https://www.bungie.net/Platform/Destiny/2/Stats/GetMembershipIdByDisplayName/Biomech-ArkahnX/

// var options = {
// 	url: 'www.bungie.net/Platform/Destiny/2/Stats/GetMembershipIdByDisplayName/Biomech-ArkahnX/',
// 	verbose: true,
// 	stderr: true,
// 	headers: {
// 		"Accept": "application/json",
// 		"Content-Type": "application/json",
// 		"X-API-Key": "4a6cc3aa21d94c949e3f44736d036a8f",
// 		"x-csrf": "9193414393683614504"
// 	}
// };

// curl.request(options, function(err, data) {
// 	console.error(err);
// 	data = JSON.parse(data);
// 	console.log(data);
// 	if (data.response) {

// 	}
// });
if (!makeTable) {
	var makeTable = null;
}

var bungie = new Bungie();

var membershipID = "";
var characterIDs = ["", "", ""];
// var minDate = new Date("2016-01-26T18:00:00Z"); // IRON BANNER JAN 26
// var maxDate = new Date("2016-02-02T08:00:00Z"); // IRON BANNER JAN 26
// var GAME_MODE = "Rift"; // RIFT IRON BANNER
// var minDate = new Date("2016-02-09T18:00:00Z"); // CRIMSON DOUBLES FEB 9
// var maxDate = new Date("2016-02-16T09:00:00Z"); // CRIMSON DOUBLES FEB 9
// var GAME_MODE = "23"; // CRIMSON DOUBLES
var unsortedGames = [];
var foundGameIDs = [];
var gameIDList = [];
// var playerNames = ["Biomech-ArkahnX", "Clockwork--Ninja", "sociopatrolman", "Sunbun", "Caidies", "Cmaaster"];
// var platform = 2;
var playerCharacters = 0;
var skipAtFirstOldValue = true;

// var fileName = "" + maxDate.getYear() + maxDate.getMonth() + maxDate.getDay() + "_" + minDate.getYear() + minDate.getMonth() + minDate.getDay() + "_" + GAME_MODE;

function loadGame(gameName, callback) {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get(gameName, resolve);
	});
}

loadOptions(function() {
	initItems(function() {
		if (inDOM) {
			Micro.tabs(".container");
		}
	});
});

function loadGameData() {
	console.time("loadGameData");
	loadGame(fileName + "_games").then(function(result) {
		console.timeEnd("loadGameData");
		// console.log(result);
		if (result[fileName() + "_games"]) {
			unsortedGames = JSON.parse(result[fileName() + "_games"]);
		}
		console.time("loadIDData");
		return loadGame(fileName() + "_IDList");
	}).then(function(result) {
		console.timeEnd("loadIDData");
		// console.log(result);
		if (result[fileName() + "_IDList"]) {
			foundGameIDs = JSON.parse(result[fileName() + "_IDList"]);
		}
		gameIDList = JSON.parse(JSON.stringify(foundGameIDs));
		begin(0);
		console.time("loadSortedGames");
		return loadGame("sortedgames");
	}).then(function(result) {
		console.timeEnd("loadSortedGames");
		if (result["sortedgames"]) {
			// console.log(result["sortedgames"]);
			if (inDOM) {
				// makeTable(result["sortedgames"]);
			}
		} else {
			begin(0);
		}
	});
}

function begin(playerIndex, optionType) {
	// console.log("Finding games for", Options.friends[playerIndex]);
	bungie.multiUser(Options.gameConsole, Options.friends[playerIndex], function() {
		bungie.search(function(response) {
			// console.log("Counting characters")
			var data = response.data;
			characterIDs = ["", "", ""];
			for (var i = 0; i < data.characters.length; i++) {
				characterIDs[i] = data.characters[i].characterBase.characterId;
				playerCharacters++;
			}
			for (var i = 0; i < characterIDs.length; i++) {
				var firstMatchFound = false;
				var page = -1;
				var count = 25;
				var date = new Date();
				recursiveMatches(characterIDs[i], date, count, page, playerIndex, Options[Options.type + "GameMode"]);
			}
		});
	});
}

function recursiveMatches(characterID, lastDate, count, page, playerIndex) {
	var minDate = new Date(Options[Options.type + "MinDate"]).getTime();
	if (lastDate >= minDate) {
		page++;
		bungie.activity(characterID, Options[Options.type + "GameMode"], count, page, function(response) {
			var activities = response.data.activities;
			if (activities) {
				for (var c = 0; c < count; c++) {
					if (activities[c]) {
						var date = new Date(activities[c].period).getTime();
						if (date >= minDate && (date <= Options[Options.type + "MaxDate"] || Options.type === "current")) {
							if (gameIDList.indexOf(activities[c].activityDetails.instanceId) === -1) {
								console.log("Counting match ", gameIDList.length + 1);
								gameIDList.push(activities[c].activityDetails.instanceId);
							}
						} else if (date < minDate) {
							console.log("No new matches found", date, minDate, date < minDate);
							date = new Date(minDate) - 1;
							c = 25;
						} else if (skipAtFirstOldValue && gameIDList.indexOf(activities[c].activityDetails.instanceId) > 0) {
							date = new Date(minDate) - 1;
							c = 25;
							console.log("No new matches found");
						} else if (activities[c + 1] === "undefined") {
							console.log("No more matches remaining");
							date = new Date(minDate) - 1
						}
					}
				}
			} else {
				console.log("No matches found");
				date = new Date(minDate) - 1
			}
			recursiveMatches(characterID, date, count, page, playerIndex);
		})
	} else {
		doneRecurions(playerIndex);
	}
}

var recursionsCompleted = 0;

function doneRecurions(playerIndex) {
	if (Options.type === "historical") {
		var playerNames = Options.friends;
	} else {
		var playerNames = [bungie.active().id];
	}
	recursionsCompleted++;
	if (recursionsCompleted >= playerCharacters) {
		if (playerIndex + 1 < playerNames.length) {
			begin(playerIndex + 1);
		} else {
			processGameData(0);
		}
	}
}

function checkWeapons(data, index, callback) {
	if (index < data.entries.length) {
		var buckets = [1498876634, 2465295065, 953998645];
		if (!data.entries[index].extended) {
			data.entries[index].extended = {};
		}
		if (!data.entries[index].extended.weapons) {
			data.entries[index].extended.weapons = [];
		} else {
			for (var i = 0; i < data.entries[index].extended.weapons.length; i++) {
				var weaponIndex = buckets.indexOf(data.entries[index].extended.weapons[i]);
				if (index > -1) {
					buckets[weaponIndex] = null;
				}
			}
		}
		var entry = data.entries[index];
		var player = entry.player.destinyUserInfo;
		if (buckets[0] !== null || buckets[1] !== null || buckets[2] !== null) {
			bungie.inventorySummary(player.membershipType, player.membershipId, entry.characterId, function(response) {
				var response = response.data;
				for (var i = 0; i < response.items.length; i++) {
					if (buckets.indexOf(response.items[i].bucketHash) > -1) {
						// console.log("length",data.entries[index].extended.weapons.length);
						entry.extended.weapons.push({
							referenceId: response.items[i].itemHash,
							values: {
								uniqueWeaponKills: {
									basic: {
										value: 0,
										displayValue: "0"
									}
								}
							}
						});
					}
				}
				checkWeapons(data, index + 1, callback);
			});
		} else {
			checkWeapons(data, index + 1, callback);
		}
	} else {
		callback(data);
	}
}

function processGameData(index) {
	if (index === gameIDList.length - 1) {
		console.log("Processing match 100%");
	} else {
		console.log("Processing match ", (index / (gameIDList.length - 1)) * 100, "%");
	}
	if (foundGameIDs.indexOf(gameIDList[index]) === -1 && gameIDList.length > 0) {
		bungie.carnage(gameIDList[index], function(response) {
			var mapHash = response.data.activityDetails.referenceId;
			var typeHash = response.data.activityDetails.activityTypeHashOverride;
			if (DestinyActivityDefinition[mapHash]) {
				response.data.activityDetails.activityName = DestinyActivityDefinition[mapHash].activityName;
				response.data.activityDetails.activityTypeName = DestinyActivityTypeDefinition[typeHash].activityTypeName;
				checkWeapons(response.data, 0, function(data) {
					// console.log("resume")
					unsortedGames.push(data);
					if (index < gameIDList.length - 1) {
						processGameData(index + 1);
					} else {
						doneRecurions2();
					}
				});
			} else {
				console.error("No Info for ", mapHash);
			}
		});
	} else {
		if (index < gameIDList.length - 1) {
			processGameData(index + 1);
		} else {
			doneRecurions2();
		}
	}
}

function fileName() {
	var minDate = new Date(Options[Options.type + "MinDate"]);
	var maxDate = new Date(Options[Options.type + "MaxDate"]);
	var part1 = maxDate.getFullYear() + ('0' + (maxDate.getMonth() + 1)).slice(-2) + ('0' + maxDate.getDate()).slice(-2)
	var part2 = minDate.getFullYear() + ('0' + (minDate.getMonth() + 1)).slice(-2) + ('0' + minDate.getDate()).slice(-2)
	return "" + part1 + "_" + part2 + "_" + Options[Options.type + "GameMode"];
}

function doneRecurions2() {
	console.log("sorting matches");
	unsortedGames.sort(dynamicSort("period"));
	var saveData = {};
	saveData[fileName() + '_games'] = JSON.stringify(unsortedGames);
	saveData[fileName() + '_IDList'] = JSON.stringify(gameIDList);
	// saveData[fileName() + '_items'] = JSON.stringify(itemChanges);
	chrome.storage.local.set(saveData);
	// sortGames(unsortedGames);
	// fs.writeFile("games.json", JSON.stringify(unsortedGames), function(err) {
	// 	if (err) {
	// 		return console.error(err);
	// 	}

	// 	console.log("The file was saved as","games.json");
	// });
	// fs.writeFile(fileName + '_games.json', JSON.stringify(unsortedGames), function(err) {
	// 	if (err) {
	// 		return console.error(err);
	// 	}

	// 	console.log("The file was saved as",fileName + '_games.json');
	// });
	// fs.writeFile(fileName + '_IDList.json', JSON.stringify(gameIDList), function(err) {
	// 	if (err) {
	// 		return console.error(err);
	// 	}

	// 	console.log("The file was saved as",fileName + '_IDList.json');
	// });
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
	}
}

chrome.browserAction.onClicked.addListener(function(tab) {
	var optionsUrl = chrome.extension.getURL('main.html');
	chrome.tabs.query({
		url: optionsUrl
	}, function(tabs) {
		if (tabs.length) {
			chrome.tabs.update(tabs[0].id, {
				active: true
			});
		} else {
			chrome.tabs.create({
				url: optionsUrl
			});
		}
	});
});
chrome.storage.local.get(null, function(result) {
	console.log(result)
})