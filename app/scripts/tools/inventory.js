const inventory = (function () { // jshint ignore:line
	var inventory = {};
	inventory.getRemote = function getRemoteInventory() {
		return new Promise(function (resolve) {
			var characterIds = Object.keys(JSON.parse(localStorage.characterDescriptions));
			sequence(characterIds, function (characterId0))
		});
	};
	return inventory;
}());