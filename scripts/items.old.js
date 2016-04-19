
var newInventories = {};
var newProgression = {};











function saveInventory(characterId) {

}







function calculateDifference(characterId, callback) {
	if (characterId === "vault") {
		bungie.vault(callback);
	} else {
		bungie.inventory(characterId, callback);
	}
}

function checkFactionRank(characterId, callback) {
	if (characterId !== "vault") {
		bungie.factions(characterId, callback);
	} else {
		callback();
	}
}

function parseNewItems(itemData, characterId) {
	var newItems = concatItems(itemData.data.buckets);
	newInventories[characterId] = newItems;
}



// function checkDiffs

var listenLoop = null;
var stopLoop = null;

function checkInventory() {
	// sequence(characterIdList, calculateDifference, parseNewItems).then(function() {
	sequence(characterIdList, calculateDifference, _internalDiffCheck).then(function() {
		sequence(characterIdList, checkFactionRank, factionRepChanges).then(function() {
			chrome.storage.local.set(data);
			// loadGameData();
		});
	});
	// for (var c = 0; c < avatars.length; c++) {
	// 	if (avatars[c] === "vault") {
	// 		calculateDifference("vault", callback);
	// 	} else {
	// 		calculateDifference(avatars[c].characterBase.characterId, callback);
	// 	}
	// }
}

function startListening() {
	if (listenLoop === null) {
		trackIdle();
		var element = document.querySelector("#startTracking");
		element.setAttribute("value", "Stop Tracking");
		listenLoop = setInterval(function() {
			checkInventory();
		}, 15000);
	}
}

function stopListening() {
	if (listenLoop !== null) {
		var element = document.querySelector("#startTracking");
		element.setAttribute("value", "Begin Tracking");
		clearInterval(listenLoop);
		listenLoop = null;
		clearInterval(stopLoop);
		stopLoop = null;
	}
}

function trackIdle() {
	if (stopLoop !== null) {
		clearInterval(stopLoop);
	}
	stopLoop = setInterval(function() {
		stopListening();
	}, 1000 * 60 * 30);
}