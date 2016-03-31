var bungie = new bungie();
var _storage = [];
var _items = [];
var _sections = null;
bungie.user(function(u) {
	loadUser();
});

function loadUser() {
	_storage = [];
	_items = [];
	_sections = null;

	console.log(bungie.active().id)

	bungie.search(function(e) {
		if (e.error) {
			console.error('Bungie.net user found, but was unable to find your linked ' + (bungie.active().type == 1 ? 'Xbox' : 'PSN') + ' account.');
			return;
		}
		console.log(e)

		bungie.vault(function(v) {
			console.log(v)
			if (v === undefined) {
				console.error('Bungie.net user found, but was unable to find your linked ' + (bungie.active().type == 1 ? 'Xbox' : 'PSN') + ' account.');
				return;
			}
			_storage['vault'] = {
				icon: ''
			};
			// appendItems('vault', flattenVault(v.data));
		});

		var avatars = e.data.characters;
		// loader.characters = avatars.length;

		function getClass(type) {
			switch (type) {
				case 0:
					return 'titan';
				case 1:
					return 'hunter';
				case 2:
					return 'warlock';
			}
			return 'unknown';
		}

		for (var c in avatars) {
			// move.appendChild();
			_storage[avatars[c].characterBase.characterId] = {
				icon: avatars[c].emblemPath,
				background: avatars[c].backgroundPath,
				level: avatars[c].characterLevel,
				class: getClass(avatars[c].characterBase.classType)
			}
			bungie.inventory(avatars[c].characterBase.characterId, function(i) {
				console.log(i)
				// appendItems(avatars[c].characterBase.characterId, flattenInventory(i.data))
			});
			// loadInventory(avatars[c].characterBase.characterId);
		}
		console.log(_storage)
	});
}