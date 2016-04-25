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
			for (var faction of DestinyFactionDefinition) {
				if (faction.progressionHash === progress.progressionHash) {
					progress.factionHash = faction.factionHash;
				}
			}
			for (var progressData of data.progression[diff.characterId]) {
				if (progressData.progressionHash === progress.progressionHash) {
					progress.currentProgress = progressData.currentProgress; // FIXME
				}
			}
		}
	}
}