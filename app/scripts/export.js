function exportData() {
	chrome.storage.local.get(null, function(data) {
		var exportDataButton = document.getElementById("exportData");
		var regexMatch = new RegExp("team", "i");
		var matchDrops = {};
		var sortedData = [];
		var exoticQue = "";
		var factionLevel = 0;
		for (var match of data.matches) {
			if (match.activityTypeHashOverride) {
				if (regexMatch.test(DestinyActivityTypeDefinition[match.activityTypeHashOverride].statGroup)) { // FIXME FIND USED THREE OF COINS
					matchDrops[match.activityInstance] = {
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
									removed = JSON.parse(removed);
									console.log(removed, /three/i.test(removed.itemName))
									if (/three/i.test(removed.itemName)) {
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
											console.log(progress)
											progress = JSON.parse(progress);
											if (/faction_event_iron_banner/i.test(progress.name) && progress.level > matchDrops[match.activityInstance].level) {
												matchDrops[match.activityInstance].level = factionLevel = progress.level
											}
										}
									}
									var rewards = [];
									for (var itemDiff of itemDiff.added) {
										var added = JSON.parse(itemDiff);
										var mainItemData = DestinyCompactItemDefinition[added.itemHash];
										var bucketData = DestinyInventoryBucketDefinition[mainItemData.bucketTypeHash];
										if (!/(bounty|quest|shader|emblem|mission|ship)/i.test(mainItemData.itemTypeName) && !/(weapon|armor|desolate|chroma|spektar|medal)/i.test(mainItemData.itemName) && added.stackSize < 5) {
											console.log(added, DestinyInventoryBucketDefinition[mainItemData.bucketTypeHash].bucketName)
											if (/(exotic)/i.test(mainItemData.itemName)) {
												var name = mainItemData.itemTypeName.split(" ");
												matchDrops[match.activityInstance].exotic = name[0] + " " + (name[2] || name[1]);
											} else if (/(material|consumable)/i.test(bucketData.bucketName)) {
												for (var i = 0; i < added.stackSize; i++) {
													matchDrops[match.activityInstance].rewards.push(mainItemData.itemName);
												}
											} else if (/(camelot)/i.test(mainItemData.itemName)) {
												matchDrops[match.activityInstance].rewards.push("PS " + mainItemData.tierTypeName + " " + bucketData.bucketName.split(" ")[0]);
											} else {
												matchDrops[match.activityInstance].rewards.push(mainItemData.tierTypeName + " " + bucketData.bucketName.split(" ")[0]);
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
			if (rewards.length > 4) {
				rewards.shift();
			}
			var result = {
				ThreeOfCoins: matchDrops[attr].exotic,
				RewardOne: rewards[0] || "",
				RewardTwo: rewards[1] || "",
				RewardThree: rewards[2] || "",
				RewardFour: rewards[3] || "",
				Rank: matchDrops[attr].level
			};
			sortedData.push(join(result) + "\n");
			if (rewards[4]) {
				console.log(rewards);
			}
			console.log(join(result))
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