var matchIdList = [];

function getLocalMatches() {
	return new Promise(function(resolve, reject) {
		console.time("Local Matches");
		chrome.storage.local.get(["matches"], function(result) {
			data.matches = handleInput(result.matches, data.matches);
			for (var activity of data.matches) {
				if (matchIdList.indexOf(activity.characterId + "-" + activity.activityInstance) === -1) {
					matchIdList.push(activity.characterId + "-" + activity.activityInstance);
				}
			}
			console.timeEnd("Local Matches");
			resolve(data);
		});
	});
}

function getRemoteMatches() {
	return new Promise(function(resolve, reject) {
		console.time("Remote Matches");
		if (data.itemChanges[0]) {
			sequence(characterIdList, getBungieMatchData, function() {}).then(function() {
				data.matches.sort(function(a, b) {
					return new Date(a.timestamp) - new Date(b.timestamp);
				});
				console.timeEnd("Remote Matches");
				resolve();
			});
		} else {
			resolve();
		}
	});
}

function deleteMatchData() {}

function getBungieMatchData(characterId, resolve) {
	var firstDateString = data.itemChanges[0].timestamp;
	if (characterId !== "vault") {
		_remoteMatch(0, firstDateString, characterId, resolve);
	} else {
		resolve();
	}
}

function _remoteMatch(page, firstDateString, characterId, resolve) {
	console.time("Look Up Match");
	bungie.activity(characterId, "None", 10, page).then(function(result) {
		var foundOldDate = false;
		if (result.data && result.data.activities.length) {
			for (var activity of result.data.activities) {
				if (new Date(activity.period) >= new Date(firstDateString)) {
					if (matchIdList.indexOf(characterId + "-" + activity.activityDetails.instanceId) === -1) {
						matchIdList.push(characterId + "-" + activity.activityDetails.instanceId);
						data.matches.push(compactMatch(activity, characterId));
					} else {
						foundOldDate = true;
						break;
					}
				} else {
					foundOldDate = true;
					break;
				}
			}
			console.timeEnd("Look Up Match");
			if (!foundOldDate) {
				_remoteMatch(page + 1, firstDateString, characterId, resolve);
			} else {
				resolve();
			}
		}
	});
}

function compactMatch(activity, characterId) {
	return {
		timestamp: activity.period,
		activityHash: activity.activityDetails.referenceId,
		activityInstance: activity.activityDetails.instanceId,
		activityTypeHashOverride: activity.activityDetails.activityTypeHashOverride,
		activityTime: activity.values.activityDurationSeconds.basic.value,
		characterId: characterId
	};
}

function applyMatchData() {
	return new Promise(function(resolve, reject) {
		console.time("Match Data");
		for (var itemDiff of data.itemChanges) {
			var timestamp = new Date(itemDiff.timestamp).getTime();
			for (var match of data.matches) {
				var minTime = new Date(match.timestamp).getTime();
				var maxTime = minTime + ((match.activityTime + 120) * 1000);
				if (timestamp >= minTime && maxTime >= timestamp) {
					itemDiff.match = JSON.stringify(match);
				}
			}
		}
		chrome.storage.local.set({
			itemChanges: data.itemChanges,
			matches: data.matches,
		}, function() {
			console.timeEnd("Match Data");
			resolve();
		});
	});
}

function constructMatchInterface() {
	var nodes = document.querySelectorAll(".timestamp");
	for (var node of nodes) {
		if (node.dataset.activity === "") {
			var index = parseInt(node.dataset.index, 10);
			for (var itemDiff of data.itemChanges) {
				if (itemDiff.id === index) {
					if (itemDiff.match) {
						var match = JSON.parse(itemDiff.match);
						var activityTypeData = DestinyActivityDefinition[match.activityHash];
						node.dataset.activity = " " + activityTypeData.activityName;
					}
					break;
				}
			}
		}
	}
}