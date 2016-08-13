tracker.sendAppView('ExportScreen');

function exportData(gameMode, minDate, maxDate, resulstLength, ironBanner, lightLevel) {
	chrome.storage.local.get(null, function(data) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		// console.startLogging("export");
		var exportDataButton = document.getElementById("exportData");
		var regexMatch = new RegExp(gameMode, "i");
		var matchDrops = {};
		var sortedData = [];
		var exoticQue = "";
		var factionLevel = 0;
		for (var match of data.matches) {
			if (match.activityTypeHashOverride) {
				if (regexMatch.test(DestinyActivityTypeDefinition[match.activityTypeHashOverride].statGroup) && moment(match.timestamp).isSameOrBefore(maxDate) && moment(match.timestamp).isSameOrAfter(minDate) && match.activityTime > 300) {
					var activityTypeData = DestinyActivityDefinition[match.activityHash];
					var name = activityTypeData.activityName;
					matchDrops[match.activityInstance] = {
						name: name,
						rewards: [],
						exotic: "unused",
						level: factionLevel
					};
					if (exoticQue !== "") {
						matchDrops[match.activityInstance].exotic = exoticQue;
						exoticQue = "";
					}
					for (var itemDiff of data.itemChanges) {
						if (itemDiff.removed.length) {
							var timestamp = new Date(itemDiff.timestamp).getTime();
							var minTime = new Date(match.timestamp).getTime();
							var maxTime = minTime + ((match.activityTime + 240) * 1000);
							if (timestamp >= minTime && maxTime >= timestamp) {
								for (var removed of itemDiff.removed) {
									if (removed.item) {
										removed = removed.item;
									}
									removed = JSON.parse(removed);
									if (removed.itemHash === 417308266) {
										if (matchDrops[match.activityInstance].exotic === "unused") {
											matchDrops[match.activityInstance].exotic = "used";
										} else {
											exoticQue = "used";
										}
										break;
									}
								}
							}
						}
						if (itemDiff.match) {
							var itemMatch = JSON.parse(itemDiff.match);
							if (itemMatch.activityInstance === match.activityInstance) {
								if (itemDiff.added.length) {
									if (itemDiff.progression) {
										for (var progress of itemDiff.progression) {
											if (progress.item) {
												progress = progress.item;
											}
											progress = JSON.parse(progress);
											if (gameMode === "IronBanner" && /faction_event_iron_banner/i.test(progress.name) && progress.level > matchDrops[match.activityInstance].level) {
												matchDrops[match.activityInstance].level = factionLevel = progress.level;
											}
										}
									}
									for (var item of itemDiff.added) {
										if (item.item) {
											item = item.item;
										}
										var added = JSON.parse(item);
										var mainItemData = getItemDefinition(added.itemHash);
										var bucketData = DestinyInventoryBucketDefinition[mainItemData.bucketTypeHash];
										var light = added.stackSize;
										if (added.primaryStat) {
											light = added.primaryStat.value;
										}
										if (!/(bounty|quest|shader|emblem|mission|ship)/i.test(mainItemData.itemTypeName) && !/(weapon|armor|desolate|chroma|spektar|medal)/i.test(mainItemData.itemName) && added.stackSize < 5) {
											if (/(exotic)/i.test(mainItemData.itemName)) {
												var name = mainItemData.itemTypeName.split(" ");
												matchDrops[match.activityInstance].exotic = name[0] + " " + (name[2] || name[1]);
											} else if (/(material|consumable)/i.test(bucketData.bucketName)) {
												for (var i = 0; i < added.stackSize; i++) {
													matchDrops[match.activityInstance].rewards.push(mainItemData.itemName);
												}
											} else if (/(camelot)/i.test(mainItemData.itemName)) {
												matchDrops[match.activityInstance].rewards.push("PS " + mainItemData.tierTypeName + " " + bucketData.bucketName.split(" ")[0] + " (" + light + ")");
											} else if (/(rare)/i.test(mainItemData.tierTypeName)) {
												matchDrops[match.activityInstance].rewards.push(mainItemData.tierTypeName + " " + bucketData.bucketName.split(" ")[0] + " " + (mainItemData.itemTypeName.split(" ")[2] || "") + " (" + light + ")");
											} else if (mainItemData.sourceHashes.indexOf(2770509343) > -1 || mainItemData.sourceHashes.indexOf(478645002) > -1) {
												matchDrops[match.activityInstance].rewards.push(mainItemData.tierTypeName + " " + bucketData.bucketName.split(" ")[0] + " " + (mainItemData.itemTypeName.split(" ")[2] || "") + " (" + light + ")");
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		for (var attr in matchDrops) {
			var rewards = matchDrops[attr].rewards;
			if (rewards.length > resulstLength) {
				rewards.shift();
			}
			var result = {
				// mapName: matchDrops[attr].name,
				ThreeOfCoins: matchDrops[attr].exotic,
				RewardOne: rewards[0] || "",
				RewardTwo: rewards[1] || "",
				RewardThree: rewards[2] || "",
				RewardFour: rewards[3] || ""
			};
			if (resulstLength > 4 && rewards[4]) {
				result.RewardFive = rewards[4] || "";
			}
			if (resulstLength > 5 && rewards[5]) {
				result.RewardSix = rewards[5] || "";
			}
			if (resulstLength > 6 && rewards[6]) {
				result.RewardSeven = rewards[6] || "";
			}
			if (ironBanner) {
				result.Rank = matchDrops[attr].level;
			}
			sortedData.push(join(result) + "\n");
			if (rewards[4]) {
				console.info(rewards);
			}
			console.log(join(result));
		}
		console.log(sortedData.length);
		var textarea = document.getElementById("export");
		textarea.value = sortedData.join("");
		exportDataButton.classList.remove("loading");
		exportDataButton.removeAttribute("disabled");
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

document.addEventListener("DOMContentLoaded", function(event) {
	initUi();
	var exportDataButton = document.getElementById("exportData");
	var minDateInput = document.getElementById("MinDate");
	if (minDateInput) {
		minDateInput.value = moment("2016-07-19T17:00:00Z").format("YYYY-MM-DDTHH:mm:ss");
	}
	var maxDateInput = document.getElementById("MaxDate");
	if (maxDateInput) {
		maxDateInput.value = moment("2016-07-26T09:00:00Z").format("YYYY-MM-DDTHH:mm:ss");
	}
	var gameModeInput = document.getElementById("GameMode");
	var ironBannerInput = document.getElementById("ironBanner");
	var resultsInput = document.getElementById("Results");
	var lightLevelInput = document.getElementById("lightLevel");
	if (exportDataButton) {
		exportDataButton.addEventListener("click", function() {
			exportDataButton.classList.add("loading");
			exportDataButton.setAttribute("disabled", true);
			exportData(gameModeInput.value, moment(minDateInput.value).utc().format(), moment(maxDateInput.value).utc().format(), parseInt(resultsInput.value), ironBannerInput.checked, lightLevelInput.checked);
		});
	}
});