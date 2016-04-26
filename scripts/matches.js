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
	if (data.itemChanges[0]) {
		sequence(characterIdList, getBungieMatchData, function() {}).then(function() {
			data.matches.sort(function(a, b) {
				return new Date(a.timestamp) - new Date(b.timestamp);
			});
			console.log(data.matches);
		});
	}
}

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
					console.log(characterId,firstDateString,result.data.activities)
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
		mode: activity.activityDetails.mode,
		activityHash: activity.activityDetails.activityTypeHashOverride,
		activityInstance: activity.activityDetails.instanceId,
		activityTime: activity.values.activityDurationSeconds.basic.value
	};
}