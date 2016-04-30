var matchDateList = [];

function getLocalMatches() {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get(["matches"], function(result) {
			data.matches = handleInput(result.matches, data.matches);
			for (var activity of data.matches) {
				if (matchDateList.indexOf(activity.period) === -1) {
					matchDateList.push(activity.period);
				}
			}
			resolve(data);
		});
	});
}

function getRemoteMatches() {
	return new Promise(function(resolve, reject) {
		if (data.itemChanges[0]) {
			sequence(characterIdList, getBungieMatchData, function() {}).then(function() {
				data.matches.sort(function(a, b) {
					return new Date(a.timestamp) - new Date(b.timestamp);
				});
				resolve();
			});
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
	bungie.activity(characterId, "None", 10, page, function(result) {
		var foundOldDate = false;
		if (result.data && result.data.activities.length) {
			for (var activity of result.data.activities) {
				if (new Date(activity.period) >= new Date(firstDateString)) {
					if (matchDateList.indexOf(activity.activityDetails.instanceId) === -1) {
						matchDateList.push(activity.activityDetails.instanceId);
						data.matches.push(compactMatch(activity));
					}
				} else {
					foundOldDate = true;
					break;
				}
			}
			if (!foundOldDate) {
				_remoteMatch(page + 1, firstDateString, characterId, resolve);
			} else {
				resolve();
			}
		}
	});
}

function compactMatch(activity) {
	return {
		timestamp: activity.period,
		activityHash: activity.activityDetails.referenceId,
		activityInstance: activity.activityDetails.instanceId,
		activityTypeHashOverride: activity.activityDetails.activityTypeHashOverride,
		activityTime: activity.values.activityDurationSeconds.basic.value
	};
}

function applyMatchData() {
	return new Promise(function(resolve, reject) {
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
			resolve();
		})
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