for (var diff of data.itemChanges) {
	if (diff.progression) {
		for (var progress of diff.progression) {
			if (progress.icon) {
				delete progress.icon;
			}
			if (progress.name) {
				delete progress.name;
			}
			if (progress.description) {
				delete progress.description;
			}
			if (progress.currentProgress) {
				delete progress.currentProgress;
			}
			for (var faction of DestinyFactionDefinition) {
				if (faction.progressionHash === progress.progressionHash) {
					progress.factionHash = faction.factionHash;
				}
			}
			for (var progressData of data.progression[diff.characterId].progressions) {
				if (progressData.progressionHash === progress.progressionHash) {
					progress.progressToNextLevel = progressData.progressToNextLevel;
				}
			}
		}
	}
}

for (var diff of data.itemChanges) {
	if (diff.progression) {
		for (var i = diff.progression.length; i > -1; i--) {
			if (diff.progression[i] === null || diff.progression[i] === "null" || diff.progression[i] === undefined) {
				diff.progression.splice(i, 1);
			}
		}
		if (diff.progression.length === 0) {
			delete diff.progression;
		}
	}
}


sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
	// console.log(newProgression);
	chrome.storage.local.set({
		"progression": newProgression
	}, function() {})
});
(function() {
	var index = 0;
	for (var item of data.itemChanges) {
		item.id = index;
		index++;
	}
	chrome.storage.local.set(data);
}());