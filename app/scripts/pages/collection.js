tracker.sendAppView('Collection');
logger.disable();
getOption("activeType").then(bungie.setActive);
var globalOptions = {};
getAllOptions().then(function(options) {
	globalOptions = options;
});

function findIronBanner(inventories) {
	var mainContainer = document.getElementById("ironbannerContainer");
	// mainContainer.innerHTML = "Loading...";
	var armor = [];
	var weapons = [];
	for (var characterId in inventories) {
		var _characterName = characterName(characterId);
		for (var item of inventories[characterId]) {
			var itemDef = getItemDefinition(item.itemHash, item);
			if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && (itemDef.sourceHashes.indexOf(2770509343) > -1 || itemDef.sourceHashes.indexOf(478645002) > -1)) {
				item.characterId = _characterName;
				armor.push(item);
			}
			if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && itemDef.sourceHashes.indexOf(2770509343) > -1) {
				item.characterId = _characterName;
				weapons.push(item);
			}
		}
	}
	console.log(armor)
	var sortedGear = {
		IronCompanion: {
			hashes: [],
			name: "Iron Companion",
			matches: []
		},
		IronRegalia: {
			hashes: [],
			name: "Iron Regalia",
			matches: []
		},
		IronBreed: {
			hashes: [],
			name: "Iron Breed",
			matches: []
		},
		PreTTK: {
			hashes: [],
			name: "Pre Taken King Weapons",
			matches: []
		},
		TTK: {
			hashes: [],
			name: "Taken King Weapons",
			matches: []
		}
	};
	if (globalOptions.activeType === "psn") {
		sortedGear.IronCamelot = {
			hashes: [],
			name: "Iron Camelot",
			matches: []
		};
	}
	for (let itemDef of DestinyCompactItemDefinition) {
		if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && itemDef.sourceHashes.indexOf(2770509343) > -1 && itemDef.sourceHashes.indexOf(460228854) > -1) {
			sortedGear.TTK.hashes.push({
				itemHash: itemDef.itemHash,
				matches: [],
				topGear: itemDef
			});
		} else if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && itemDef.sourceHashes.indexOf(2770509343) > -1 && itemDef.sourceHashes.indexOf(460228854) === -1) {
			sortedGear.PreTTK.hashes.push({
				itemHash: itemDef.itemHash,
				matches: [],
				topGear: itemDef
			});
		}
	}
	for (var PreTTK of sortedGear.PreTTK.hashes) {
		for (var weapon of weapons) {
			if (weapon.itemHash === PreTTK.itemHash) {
				if (!PreTTK.topGear.primaryStat) {
					PreTTK.topGear = weapon;
				}
				// PreTTK.matches.push(weapon);
				if (PreTTK.topGear.primaryStat.value < weapon.primaryStat.value) {
					PreTTK.topGear = weapon;
				}
			}
		}
		sortedGear.PreTTK.matches.push(PreTTK.topGear);
	}
	for (var TTK of sortedGear.TTK.hashes) {
		for (var weapon of weapons) {
			if (weapon.itemHash === TTK.itemHash) {
				if (!TTK.topGear.primaryStat) {
					TTK.topGear = weapon;
				}
				// TTK.matches.push(weapon);
				if (TTK.topGear.primaryStat.value < weapon.primaryStat.value) {
					TTK.topGear = weapon;
				}
			}
		}
		sortedGear.TTK.matches.push(TTK.topGear);
	}
	for (let _gear of sortedGear) {
		if (_gear.matches.length === 0) {
			for (let itemDef of DestinyCompactItemDefinition) {
				if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1 && itemDef.tierType === 5) {
					if (itemDef.itemName && itemDef.itemName.indexOf(_gear.name) > -1) {
						_gear.hashes.push({
							itemHash: itemDef.itemHash,
							matches: [],
							topGear: itemDef
						});
					}
				}
			}
			for (var gear of _gear.hashes) {
				for (var _armor of armor) {
					if (_armor.itemHash === gear.itemHash) {
						console.log(_armor, gear)
						if (globalOptions.showQuality) {
							if (!hasQuality(gear.topGear)) {
								gear.topGear = _armor;
							}
							// gear.matches.push(_armor);
							if (parseItemQuality(_armor).min > parseItemQuality(gear.topGear).min) {
								gear.topGear = _armor;
							}
						} else {
							if (!gear.topGear.primaryStat) {
								gear.topGear = _armor;
							}
							// gear.matches.push(_armor);
							if (gear.topGear.primaryStat.value < _armor.primaryStat.value) {
								gear.topGear = _armor;
							}
						}
					}
				}
				_gear.matches.push(gear.topGear);
			}
		}
	}
	mainContainer.innerHTML = "";
	for (let gearSet in sortedGear) {
		var ghostSet = sortedGear[gearSet];
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + ghostSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let ghost of ghostSet.matches) {
			var ghostElem = makeItem(ghost, ghost.characterId);
			if (!ghost.itemInstanceId) {
				ghostElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(ghostElem);
			// for (var vendorItem of vendorCategory.saleItems) {
			// 	var itemDef = DestinyCompactItemDefinition[saleItem.item.itemHash];
			// 	if (saleItem.unlockStatuses.length && !saleItem.unlockStatuses[0].isSet && vendorItem.item.itemHash === saleItem.item.itemHash) {
			// 		emblems[saleItem.item.itemHash] = {
			// 			name: itemDef.itemName,
			// 			acquired: saleItem.unlockStatuses[0].isSet,
			// 			selling: true
			// 		};
			// 	}
			// }
		}
		titleContainer.appendChild(docfrag);
		// mainContainer.innerHTML = "";
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGear);
}

function findTrials(inventories) {
	var mainContainer = document.getElementById("trialsContainer");
	// mainContainer.innerHTML = "Loading...";
	var armor = [];
	var weapons = [];
	for (var characterId in inventories) {
		var _characterName = characterName(characterId);
		for (var item of inventories[characterId]) {
			var itemDef = getItemDefinition(item.itemHash, item);
			if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1 && itemDef.tierType === 5) {
				item.characterId = _characterName;
				armor.push(item);
			}
			if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5) {
				item.characterId = _characterName;
				weapons.push(item);
			}
		}
	}
	console.log(armor)
	var sortedGear = {
		WingedSun: {
			hashes: [],
			name: "Winged Sun",
			matches: []
		},
		PreTTK: {
			hashes: [],
			name: "Pre Taken King Weapons",
			matches: []
		},
		TTK: {
			hashes: [],
			name: "Taken King Weapons",
			matches: []
		}
	};
	for (let itemDef of DestinyCompactItemDefinition) {
		if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && itemDef.sourceHashes.indexOf(2770509343) > -1 && itemDef.sourceHashes.indexOf(460228854) > -1) {
			sortedGear.TTK.hashes.push({
				itemHash: itemDef.itemHash,
				matches: [],
				topGear: itemDef
			});
		} else if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && itemDef.sourceHashes.indexOf(2770509343) > -1 && itemDef.sourceHashes.indexOf(460228854) === -1) {
			sortedGear.PreTTK.hashes.push({
				itemHash: itemDef.itemHash,
				matches: [],
				topGear: itemDef
			});
		}
	}
	for (var PreTTK of sortedGear.PreTTK.hashes) {
		for (var weapon of weapons) {
			if (weapon.itemHash === PreTTK.itemHash) {
				if (!PreTTK.topGear.primaryStat) {
					PreTTK.topGear = weapon;
				}
				// PreTTK.matches.push(weapon);
				if (PreTTK.topGear.primaryStat.value < weapon.primaryStat.value) {
					PreTTK.topGear = weapon;
				}
			}
		}
		sortedGear.PreTTK.matches.push(PreTTK.topGear);
	}
	for (var TTK of sortedGear.TTK.hashes) {
		for (var weapon of weapons) {
			if (weapon.itemHash === TTK.itemHash) {
				if (!TTK.topGear.primaryStat) {
					TTK.topGear = weapon;
				}
				// TTK.matches.push(weapon);
				if (TTK.topGear.primaryStat.value < weapon.primaryStat.value) {
					TTK.topGear = weapon;
				}
			}
		}
		sortedGear.TTK.matches.push(TTK.topGear);
	}
	for (let _gear of sortedGear) {
		if (_gear.matches.length === 0) {
			for (let itemDef of DestinyCompactItemDefinition) {
				if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1 && itemDef.tierType === 5) {
					if (itemDef.itemName && itemDef.itemName.indexOf(_gear.name) > -1) {
						_gear.hashes.push({
							itemHash: itemDef.itemHash,
							matches: [],
							topGear: itemDef
						});
					}
				}
			}
			for (var gear of _gear.hashes) {
				for (var _armor of armor) {
					if (_armor.itemHash === gear.itemHash) {
						console.log(_armor, gear)
						if (globalOptions.showQuality) {
							if (!hasQuality(gear.topGear)) {
								gear.topGear = _armor;
							}
							// gear.matches.push(_armor);
							if (parseItemQuality(_armor).min > parseItemQuality(gear.topGear).min) {
								gear.topGear = _armor;
							}
						} else {
							if (!gear.topGear.primaryStat) {
								gear.topGear = _armor;
							}
							// gear.matches.push(_armor);
							if (gear.topGear.primaryStat.value < _armor.primaryStat.value) {
								gear.topGear = _armor;
							}
						}
					}
				}
				_gear.matches.push(gear.topGear);
			}
		}
	}
	mainContainer.innerHTML = "";
	for (let gearSet in sortedGear) {
		var ghostSet = sortedGear[gearSet];
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + ghostSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let ghost of ghostSet.matches) {
			var ghostElem = makeItem(ghost, ghost.characterId);
			if (!ghost.itemInstanceId) {
				ghostElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(ghostElem);
			// for (var vendorItem of vendorCategory.saleItems) {
			// 	var itemDef = DestinyCompactItemDefinition[saleItem.item.itemHash];
			// 	if (saleItem.unlockStatuses.length && !saleItem.unlockStatuses[0].isSet && vendorItem.item.itemHash === saleItem.item.itemHash) {
			// 		emblems[saleItem.item.itemHash] = {
			// 			name: itemDef.itemName,
			// 			acquired: saleItem.unlockStatuses[0].isSet,
			// 			selling: true
			// 		};
			// 	}
			// }
		}
		titleContainer.appendChild(docfrag);
		// mainContainer.innerHTML = "";
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGear);
}

function findGhosts(inventories) {
	var mainContainer = document.getElementById("ghostContainer");
	// mainContainer.innerHTML = "Loading...";
	var ghosts = [];
	for (var characterId in inventories) {
		for (var item of inventories[characterId]) {
			var itemDef = getItemDefinition(item.itemHash);
			if (itemDef.bucketTypeHash === 4023194814) {
				item.characterId = characterName(characterId);
				ghosts.push(item);
			}
		}
	}
	var sortedGhosts = {
		uniqueGhosts: {
			hashes: [],
			name: "Unique Ghosts",
			matches: []
		},
		HunterGhosts: {
			search: ["Hunter"],
			name: "PVP Hunter",
			matches: []
		},
		TitanGhosts: {
			search: ["Titan"],
			name: "PVP Titan",
			matches: []
		},
		WarlockGhosts: {
			search: ["Warlock"],
			name: "PVP Warlock",
			matches: []
		},
		SpinmetalGhosts: {
			search: ["Spinmetal"],
			name: "Spinmetal Ghosts",
			matches: []
		},
		HeliumGhosts: {
			search: ["Helium"],
			name: "Helium Filament Ghosts",
			matches: []
		},
		SpiritGhosts: {
			search: ["Spirit"],
			name: "Spirit Bloom Ghosts",
			matches: []
		},
		RelicGhosts: {
			search: ["Relic"],
			name: "Relic Iron Ghosts",
			matches: []
		},
		WormsporeGhosts: {
			search: ["Wormspore"],
			name: "Wormspore Ghosts",
			matches: []
		},
		FallenEarth: {
			search: ["Ether", "Spinmetal"],
			name: "Fallen on Earth",
			matches: []
		},
		FallenMoon: {
			search: ["Ether", "Helium"],
			name: "Fallen on the Moon",
			matches: []
		},
		FallenVenus: {
			search: ["Ether", "Spirit"],
			name: "Fallen on Venus",
			matches: []
		},
		HiveEarth: {
			search: ["Cleansing", "Spinmetal"],
			name: "Hive on Earth",
			matches: []
		},
		HiveMoon: {
			search: ["Cleansing", "Helium"],
			name: "Hive on the Moon",
			matches: []
		},
		HiveDreadnaught: {
			search: ["Cleansing", "Wormspore"],
			name: "Hive on the Dreadnaught",
			matches: []
		},
		VexVenus: {
			search: ["Blue", "Spirit"],
			name: "Vex on Venus",
			matches: []
		},
		VexMars: {
			search: ["Blue", "Relic"],
			name: "Vex on Mars",
			matches: []
		},
		CabalMars: {
			search: ["Network", "Relic"],
			name: "Cabal on Mars",
			matches: []
		},
		CabalDreadnaught: {
			search: ["Network", "Wormspore"],
			name: "Cabal on the Dreadnaught",
			matches: []
		},
		TakenEarth: {
			search: ["Reclamation", "Spinmetal"],
			name: "Taken on Earth",
			matches: []
		},
		TakenVenus: {
			search: ["Reclamation", "Spirit"],
			name: "Taken on Venus",
			matches: []
		},
		TakenMars: {
			search: ["Reclamation", "Relic"],
			name: "Taken on Mars",
			matches: []
		},
		TakenDreadnaught: {
			search: ["Reclamation", "Wormspore"],
			name: "Taken on the Dreadnaught",
			matches: []
		},
		OtherGhosts: {
			name: "Other ghosts",
			matches: []
		}
	};
	for (var itemDef of DestinyCompactItemDefinition) {
		if (itemDef.bucketTypeHash === 4023194814 && (itemDef.tierTypeName === "Legendary" || itemDef.tierTypeName === "Exotic")) {
			sortedGhosts.uniqueGhosts.hashes.push({
				itemHash: itemDef.itemHash,
				matches: [],
				topGhost: itemDef
			});
		}
	}
	for (var uniqueGhost of sortedGhosts.uniqueGhosts.hashes) {
		for (var ghost of ghosts) {
			if (ghost.itemHash === uniqueGhost.itemHash) {
				if (globalOptions.showQuality) {
					if (!hasQuality(uniqueGhost.topGhost)) {
						uniqueGhost.topGhost = ghost;
					}
					uniqueGhost.matches.push(ghost);
					if (parseItemQuality(ghost).min > parseItemQuality(uniqueGhost.topGhost).min) {
						uniqueGhost.topGhost = ghost;
					}
				} else {
					if (!uniqueGhost.topGhost.primaryStat) {
						uniqueGhost.topGhost = ghost;
					}
					uniqueGhost.matches.push(ghost);
					if (uniqueGhost.topGhost.primaryStat.value < ghost.primaryStat.value) {
						uniqueGhost.topGhost = ghost;
					}
				}
			}
		}
		sortedGhosts.uniqueGhosts.matches.push(uniqueGhost.topGhost);
	}
	for (var ghost of ghosts) {
		var found = false;
		for (var sorting of sortedGhosts) {
			if (sorting.search && containsNodes(ghost, sorting.search) >= 100) {
				sorting.matches.push(ghost);
				found = true;
			}
		}
		if (found === false) {
			sortedGhosts.OtherGhosts.matches.push(ghost);
		}
	}
	mainContainer.innerHTML = "";
	for (var ghostSetName in sortedGhosts) {
		var ghostSet = sortedGhosts[ghostSetName];
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + ghostSet.name + "</p>";
		var docfrag = document.createDocumentFragment();
		for (let ghost of ghostSet.matches) {
			var ghostElem = makeItem(ghost, ghost.characterId);
			if (!ghost.itemInstanceId) {
				ghostElem.children[0].classList.add("undiscovered");
			}
			docfrag.appendChild(ghostElem);
			// for (var vendorItem of vendorCategory.saleItems) {
			// 	var itemDef = DestinyCompactItemDefinition[saleItem.item.itemHash];
			// 	if (saleItem.unlockStatuses.length && !saleItem.unlockStatuses[0].isSet && vendorItem.item.itemHash === saleItem.item.itemHash) {
			// 		emblems[saleItem.item.itemHash] = {
			// 			name: itemDef.itemName,
			// 			acquired: saleItem.unlockStatuses[0].isSet,
			// 			selling: true
			// 		};
			// 	}
			// }
		}
		titleContainer.appendChild(docfrag);
		// mainContainer.innerHTML = "";
		mainContainer.appendChild(titleContainer);
	}
	console.log(sortedGhosts);
}

function displayMissingVendorItems(mainContainer, lastVendor, saleVendor) {
	selectedCharacter = document.getElementById("character").value;
	bungie.getVendorForCharacter(selectedCharacter, lastVendor).catch(function(err) {
		if (err) {
			console.error(err);
		}
	}).then(function(kioskResponse) {
		bungie.getVendorForCharacter(selectedCharacter, saleVendor).catch(function(err) {
			if (err) {
				console.error(err);
			}
		}).then(function(vendorResponse) {
			console.log(kioskResponse, kioskResponse.Response && kioskResponse.Response.data, DestinyVendorDefinition[lastVendor]);
			if (kioskResponse.Response && vendorResponse.Response) {
				var missingContainer = document.createElement("div");
				missingContainer.classList.add("sub-section");
				missingContainer.innerHTML = "<p>Missing from Collection</p>";
				var missingFragment = document.createDocumentFragment();
				var sellingContainer = document.createElement("div");
				sellingContainer.innerHTML = "<p>Available to Purchase from " + DestinyVendorDefinition[saleVendor].summary.vendorName + " " + date.vendorRefreshDate(vendorResponse.Response.data.vendor) + "</p>";
				sellingContainer.classList.add("sub-section");
				var sellingFragment = document.createDocumentFragment();
				var missingHashes = [];
				for (let category of kioskResponse.Response.data.vendor.saleItemCategories) {
					for (let emblem of category.saleItems) {
						if (emblem.failureIndexes[0] || (emblem.requiredUnlockFlags && emblem.requiredUnlockFlags[0].isSet === false) || emblem.itemStatus.toString(2)[3] === "1") {
							missingHashes.push(emblem.item.itemHash);
							missingFragment.appendChild(makeItem(emblem.item, DestinyVendorDefinition[lastVendor].failureStrings[emblem.failureIndexes[0]]));
						}
					}
				}
				for (let category of vendorResponse.Response.data.vendor.saleItemCategories) {
					for (let saleItem of category.saleItems) {
						if (missingHashes.indexOf(saleItem.item.itemHash) > -1) {
							var costs = Item.getCosts(saleItem, vendorResponse.Response.data.vendor, newInventories, selectedCharacter);
							sellingFragment.appendChild(makeItem(saleItem.item, DestinyVendorDefinition[lastVendor].failureStrings[saleItem.failureIndexes[0]], costs));
						}
					}
				}
				mainContainer.innerHTML = "";
				missingContainer.appendChild(missingFragment);
				sellingContainer.appendChild(sellingFragment);
				mainContainer.appendChild(sellingContainer);
				mainContainer.appendChild(missingContainer);
			} else {
				console.log(lastVendor, saleVendor);
			}
		});
	});
}

var vendorItems = {};

function VendorNetworkTask(vendorHash, resolve) {
	selectedCharacter = document.getElementById("character").value;
	bungie.getVendorForCharacter(selectedCharacter, vendorHash).catch(function(err) {
		if (err) {
			console.error(err);
		}
	}).then(function(vendorResponse) {
		if (vendorResponse.Response) {
			resolve(vendorResponse.Response.data);
		} else {
			resolve(false);
		}
	});
}

function VendorResultTask(data, vendorHash) {
	if (data) {
		vendorItems[vendorHash] = {
			name: DestinyVendorDefinition[vendorHash].summary.vendorName,
			currencies: data.vendor.currencies,
			nextRefreshDate: data.vendor.nextRefreshDate,
			items: []
		};
		var docFrag = document.createDocumentFragment();
		var titleContainer = document.createElement("div");
		titleContainer.classList.add("sub-section");
		titleContainer.innerHTML = "<p>" + vendorItems[vendorHash].name + " " + date.vendorRefreshDate(data.vendor) + "</p>";
		for (let category of data.vendor.saleItemCategories) {
			for (let saleItem of category.saleItems) {
				if (hasQuality(saleItem.item) && parseItemQuality(saleItem.item).min > 92) {
					vendorItems[vendorHash].items.push(saleItem);
					var costs = Item.getCosts(saleItem, data.vendor, newInventories, selectedCharacter);
					titleContainer.appendChild(makeItem(saleItem.item, vendorItems[vendorHash].name, costs));
				}
			}
		}
		if (titleContainer.children.length) {
			docFrag.appendChild(titleContainer);
		}
		var mainContainer = document.getElementById("t12Container");
		mainContainer.appendChild(docFrag);
	}
}

function displayT12VendorItems(mainContainer) { // rerun hunter vanguard, titan vanguard, warlock vanguard and house of judgement if 
	sequence([2796397637, 3746647075, 3611686524, 174528503, 3902439767, 1821699360, 3003633346, 242140165, 1808244981, 2680694281, 1990950, 1575820975, 1998812735], VendorNetworkTask, VendorResultTask).then(function() {
		var docFrag = document.createDocumentFragment();
		mainContainer.innerHTML = "";
		for (var vendor of vendorItems) {
			if (vendor.items.length) {
				var titleContainer = document.createElement("div");
				titleContainer.classList.add("sub-section");
				titleContainer.innerHTML = "<p>" + vendor.name + " " + date.vendorRefreshDate(vendor) + "</p>";
				for (let saleItem of vendor.items) {
					var costs = Item.getCosts(saleItem, vendor, newInventories, selectedCharacter);
					docFrag.appendChild(makeItem(saleItem.item, vendor.name, costs));
				}
				titleContainer.appendChild(docFrag);
				mainContainer.appendChild(titleContainer);
			}
		}
	});
}

function findEmblems() {
	var mainContainer = document.getElementById("emblemContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 3301500998, 134701236);
}

function findShaders() {
	var mainContainer = document.getElementById("shaderContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 2420628997, 134701236);
}

function findShips() {
	var mainContainer = document.getElementById("shipContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 2244880194, 459708109);
}

function findT12() {
	var mainContainer = document.getElementById("t12Container");
	mainContainer.innerHTML = "Loading...";
	if (globalOptions.showQuality) {
		displayT12VendorItems(mainContainer);
	} else {
		mainContainer.innerHTML = "Please enable the 'Show Quality' option on the <a href='options.html'>options page</a> to use this feature.";
	}
}

var selectedCharacter = localStorage.newestCharacter;
var newInventories = {};

function postInitItems() {
	var characterHTML = "";
	for (let characterId in characterDescriptions) {
		if (characterId !== "vault") {
			characterHTML += `<option value="${characterId}"${(characterId === selectedCharacter) ? " selected" : ""}>${characterName(characterId)}</option>`;
		}
	}
	document.getElementById("character").innerHTML = characterHTML;
	document.querySelectorAll(".collection-section").forEach(function(element) {
		element.addEventListener("click", function(event) {
			if (event.target.checked === false) {
				if (event.target.dataset.feature === "ghosts") {
					chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findGhosts(data.inventories);
					});
				}
				if (event.target.dataset.feature === "ironbanner") {
					chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findIronBanner(data.inventories);
					});
				}
				if (event.target.dataset.feature === "trials") {
					chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findTrials(data.inventories);
					});
				}
				if (event.target.dataset.feature === "raid") {
					chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findRaid(data.inventories);
					});
				}
				if (event.target.dataset.feature === "emblems") {
					findEmblems();
				}
				if (event.target.dataset.feature === "shaders") {
					findShaders();
				}
				if (event.target.dataset.feature === "ships") {
					findShips();
				}
				if (event.target.dataset.feature === "t12") {
					chrome.storage.local.get("inventories", function(data) {
						newInventories = data.inventories;
						findT12();
					});
				}
			}
		}, false);
	});
	document.getElementById("debugHome").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", function() {
	initUi();
	characterDescriptions = JSON.parse(localStorage.characterDescriptions);

	// findGhosts(data.inventories);
	// initItems(function() {
	// findEmblems();
	// findShaders();
	// findShips();
	// });

	document.getElementById("debugHome").addEventListener("mouseover", function(event) {
		var target = null;
		if (event.target.classList.contains("item") || event.target.classList.contains("faction")) {
			target = event.target;
		} else if (event.target.parentNode.classList.contains("item") || event.target.parentNode.classList.contains("faction")) {
			target = event.target.parentNode;
		} else if (event.target.parentNode.classList.contains("item-container")) {
			target = event.target.parentNode.children[0];
		}
		if (target && target !== previousElement) {
				// elements.tooltip.classList.add("hidden");
			previousElement = target;
			handleTooltipData(target.dataset, target, event);
		}
		if (!target) {
			clearTimeout(tooltipTimeout);
			// elements.tooltip.classList.add("hidden");
			previousElement = null;
		}
	}, true);
	initItems(postInitItems);
});

window.requestAnimationFrame(date.keepDatesUpdated);

// var data = {
// 	inventories: {},
// 	progression: {},
// 	itemChanges: [],
// 	factionChanges: []
// };
// var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete", "objectives"];
// var characterIdList = ["vault"];
// var characterDescriptions = {
// 	"vault": {
// 		name: "Vault",
// 		gender: "",
// 		level: "0",
// 		race: "",
// 		light: ""
// 	}
// };

// function initItems(callback) {
// 	// console.startLogging("items");
// 	console.time("load Bungie Data");
// 	initUi();
// 	getOption("activeType").then(bungie.setActive);
// 	bungie.user().then(function(u) {
// 		if (u.error) {
// 			return setTimeout(function() {
// 				initItems(callback);
// 			}, 1000);
// 		}
// 		bungie.search().then(function(e) {

// 			var avatars = e.data.characters;
// 			for (var c = 0; c < avatars.length; c++) {
// 				console.log(avatars[c].characterBase)
// 				characterDescriptions[avatars[c].characterBase.characterId] = {
// 					name: DestinyClassDefinition[avatars[c].characterBase.classHash].className,
// 					gender: DestinyGenderDefinition[avatars[c].characterBase.genderHash].genderName,
// 					level: avatars[c].baseCharacterLevel,
// 					light: avatars[c].characterBase.powerLevel,
// 					race: DestinyRaceDefinition[avatars[c].characterBase.raceHash].raceName,
// 					dateLastPlayed: avatars[c].characterBase.dateLastPlayed,
// 					currentActivityHash: avatars[c].characterBase.currentActivityHash
// 				};
// 				characterIdList.push(avatars[c].characterBase.characterId);
// 			}

// 			console.timeEnd("load Bungie Data");
// 			if (typeof callback === "function") {
// 				callback();
// 			}
// 			checkInventory();
// 		}).catch(function(e) {
// 			logger.error(e);
// 			if (typeof callback === "function") {
// 				callback();
// 			}
// 		});
// 	}).catch(function(e) {
// 		logger.error(e);
// 		if (typeof callback === "function") {
// 			callback();
// 		}
// 	});
// }


// var findHighestMaterial = (function() {
// 	// console.startLogging("items");
// 	var stage = false;
// 	var oldestCharacterDate = null;
// 	var oldestCharacter = null;
// 	var bigItem = null;
// 	return function() {
// 		console.time("bigmat");
// 		if (stage === false) {
// 			console.time("char");
// 			for (let characterId of characterIdList) {
// 				if (characterId !== "vault") {
// 					var date = new Date(characterDescriptions[characterId].dateLastPlayed);
// 					if (!oldestCharacter || date < oldestCharacterDate) {
// 						oldestCharacterDate = date;
// 						oldestCharacter = characterId;
// 					}
// 				}
// 			}
// 			console.timeEnd("char");
// 			console.time("mats");
// 			for (let item of data.inventories[oldestCharacter]) {
// 				let itemDefinition = getItemDefinition(item.itemHash);
// 				if (itemDefinition.bucketTypeHash === 3865314626) {
// 					if (!bigItem || item.stackSize > bigItem.stackSize) {
// 						bigItem = item;
// 					}
// 				}
// 			}
// 			console.timeEnd("mats");
// 		}
// 		if (stage === true) {
// 			stage = false;
// 		} else {
// 			stage = true;
// 		}
// 		console.timeEnd("bigmat");
// 		return {
// 			characterId: oldestCharacter,
// 			itemId: "0",
// 			itemReferenceHash: bigItem.itemHash,
// 			// membershipType: bungie.membershipType(),
// 			stackSize: 1,
// 			transferToVault: stage
// 		};
// 	};
// }());

// function checkInventory() {
// 	// console.startLogging("items");
// 	console.time("Bungie Inventory");
// 	chrome.storage.local.get(null, function(remoteData) {
// 		if (chrome.runtime.lastError) {
// 			logger.error(chrome.runtime.lastError);
// 		}
// 		console.log(remoteData)
// 		data = remoteData;
// 		// sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
// 		// sequence(characterIdList, factionNetworkTask, factionResultTask).then(function() {
// 		var mat = findHighestMaterial();
// 		console.log(mat);
// 		var characterHistory = document.getElementById("history");
// 		var inventoryData = [];
// 		for (var characterId in data.inventories) {
// 			if (inventoryData.length === 0) {
// 				Array.prototype.push.apply(inventoryData, data.inventories[characterId]);
// 			} else {
// 				var arrayToMerge = [];
// 				for (var item of data.inventories[characterId]) {
// 					if (item.itemInstanceId !== "0") {
// 						arrayToMerge.push(item);
// 					} else {
// 						var located = false;
// 						for (var storedItem of inventoryData) {
// 							if (item.itemInstanceId === "0" && item.itemHash === storedItem.itemHash) {
// 								storedItem.stackSize += item.stackSize;
// 								located = true;
// 							}
// 						}
// 						if (!located) {
// 							arrayToMerge.push(item);
// 						}
// 					}
// 				}
// 				console.log(arrayToMerge.length);
// 				Array.prototype.push.apply(inventoryData, arrayToMerge);
// 			}
// 		}
// 		inventoryData.sort(function(a, b) {
// 			if (a.itemInstanceId === "0") {
// 				return b.stackSize - a.stackSize;
// 			} else {
// 				return a.itemInstanceId - b.itemInstanceId;
// 			}
// 		});
// 		var containingDiv = null;
// 		for (var item of inventoryData) {
// 			var itemDefinition = getItemDefinition(item.itemHash);
// 			var bucketName = DestinyInventoryBucketDefinition[itemDefinition.bucketTypeHash].bucketName;
// 			if (document.getElementById(bucketName) === null) {
// 				var div = document.createElement("div");
// 				div.classList.add("sub-section");
// 				var description = document.createElement("h1");
// 				description.textContent = bucketName;
// 				div.appendChild(description);
// 				characterHistory.appendChild(div);
// 				var nodeList = document.createElement("div");
// 				nodeList.classList.add("sub-section");
// 				nodeList.id = bucketName;
// 				characterHistory.appendChild(nodeList);
// 			}
// 			containingDiv = document.getElementById(bucketName);
// 			containingDiv.appendChild(makeHistoryItem(item, "vault"));
// 		}
// 		console.timeEnd("Bungie Inventory");
// 	});
// }

// function makeHistoryItem(itemData) {
// 	var docfrag = document.createDocumentFragment();
// 	var itemContainer = document.createElement("div");
// 	itemContainer.classList.add("item-container");
// 	var container = document.createElement("div");
// 	var stat = document.createElement("div");
// 	itemContainer.appendChild(container);
// 	if (hasQuality(itemData)) {
// 		var quality = document.createElement("div");
// 		itemContainer.appendChild(quality);
// 		quality.classList.add("quality");
// 		stat.classList.add("with-quality");
// 		var qualityData = parseItemQuality(itemData);
// 		quality.style.background = qualityData.color;
// 		quality.textContent = qualityData.min + "%";
// 	}
// 	itemContainer.appendChild(stat);
// 	docfrag.appendChild(itemContainer);
// 	DOMTokenList.prototype.add.apply(container.classList, itemClasses(itemData));
// 	if (getItemDefinition(itemData.itemHash).hasIcon || (getItemDefinition(itemData.itemHash).icon && getItemDefinition(itemData.itemHash).icon.length)) {
// 		container.setAttribute("style", "background-image: url(" + "'http://www.bungie.net" + getItemDefinition(itemData.itemHash).icon + "'),url('http://bungie.net/img/misc/missing_icon.png')");
// 	} else {
// 		container.setAttribute("style", "background-image: url('http://bungie.net/img/misc/missing_icon.png')");
// 	}
// 	stat.classList.add("primary-stat");
// 	stat.textContent = primaryStat(itemData);
// 	passData(container, itemData);
// 	return docfrag;
// }

// function passData(DomNode, itemData) {
// 	var itemDefinition = getItemDefinition(itemData.itemHash);
// 	if (itemDefinition.tierTypeName) {
// 		DomNode.dataset.tierTypeName = itemDefinition.tierTypeName;
// 	} else {
// 		DomNode.dataset.tierTypeName = "Common";
// 	}
// 	DomNode.dataset.itemHash = itemDefinition.itemHash;
// 	DomNode.dataset.itemName = itemDefinition.itemName;
// 	DomNode.dataset.itemTypeName = itemDefinition.itemTypeName;
// 	DomNode.dataset.equipRequiredLevel = itemData.equipRequiredLevel || 0;
// 	DomNode.dataset.primaryStat = primaryStat(itemData);
// 	DomNode.dataset.primaryStatName = primaryStatName(itemData);
// 	DomNode.dataset.itemDescription = itemDefinition.itemDescription;
// 	DomNode.dataset.damageTypeName = elementType(itemData);
// 	DomNode.dataset.classRequirement = "";
// 	if (itemData.stats && itemData.stats.length) {
// 		DomNode.dataset.statTree = JSON.stringify(itemData.stats);
// 	}
// 	if (itemData.nodes && itemData.nodes.length) {
// 		DomNode.dataset.talentGridHash = itemData.talentGridHash;
// 		DomNode.dataset.nodeTree = JSON.stringify(itemData.nodes);
// 	}
// 	if (itemData.objectives && itemData.objectives.length) {
// 		DomNode.dataset.objectiveTree = JSON.stringify(itemData.objectives);
// 	}
// }

// function itemNetworkTask(characterId, callback) {
// 	if (characterId === "vault") {
// 		bungie.vault().catch(function(err) {
// 			if (err) {
// 				logger.error(err);
// 			}
// 			callback(false);
// 		}).then(callback);
// 	} else {
// 		bungie.inventory(characterId).catch(function(err) {
// 			if (err) {
// 				logger.error(err);
// 			}
// 			callback(false);
// 		}).then(callback);
// 	}
// }

// function factionNetworkTask(characterId, callback) {
// 	if (characterId !== "vault") {
// 		bungie.factions(characterId).catch(function(err) {
// 			if (err) {
// 				logger.error(err);
// 			}
// 			callback(false);
// 		}).then(callback);
// 	} else {
// 		callback();
// 	}
// }

// function itemResultTask(result, characterId) {
// 	if (result) {
// 		if (!data.inventories[characterId]) {
// 			data.inventories[characterId] = [];
// 		}
// 		data.inventories[characterId] = concatItems(result.data.buckets);
// 	}
// }

// function factionResultTask(result, characterId) {
// 	if (result) {
// 		if (!data.progression[characterId]) {
// 			data.progression[characterId] = [];
// 		}
// 		data.progression[characterId] = result.data;
// 	}
// }

// function _concat(list, bucketHash, sortedItems) {
// 	for (var item of list) {
// 		if (!sortedItems[item.itemInstanceId + "-" + item.itemHash]) {
// 			sortedItems[item.itemInstanceId + "-" + item.itemHash] = buildCompactItem(item, bucketHash);
// 			sortedItems[item.itemInstanceId + "-" + item.itemHash].bucketHash = bucketHash;
// 		} else {
// 			sortedItems[item.itemInstanceId + "-" + item.itemHash].stackSize += item.stackSize;
// 		}
// 	}
// 	return sortedItems;
// }

// function concatItems(itemBucketList) {
// 	var sortedItems = {};
// 	var unsortedItems = [];
// 	for (var category of itemBucketList) {
// 		if (category.items) {
// 			sortedItems = _concat(category.items, category.bucketHash, sortedItems);
// 		} else {
// 			for (var bucket of category) {
// 				if (bucket.items) {
// 					sortedItems = _concat(bucket.items, bucket.bucketHash, sortedItems);
// 				}
// 			}
// 		}
// 	}
// 	for (var item of sortedItems) {
// 		unsortedItems.push(item);
// 	}
// 	return unsortedItems;
// }

// function buildCompactItem(itemData, bucketHash) {
// 	var newItemData = {};
// 	var hash = itemData.itemHash;
// 	for (var i = 0; i < relevantStats.length; i++) {
// 		if (itemData[relevantStats[i]]) {
// 			if (typeof itemData[relevantStats[i]].length === "number") {
// 				if (itemData[relevantStats[i]].length > 0) {
// 					newItemData[relevantStats[i]] = itemData[relevantStats[i]];
// 				}
// 			} else {
// 				newItemData[relevantStats[i]] = itemData[relevantStats[i]];
// 			}
// 		}
// 	}
// 	newItemData.itemName = getItemDefinition(hash).itemName;
// 	newItemData.itemTypeName = getItemDefinition(hash).itemTypeName;
// 	newItemData.tierTypeName = getItemDefinition(hash).tierTypeName;
// 	newItemData.bucketHash = bucketHash;
// 	newItemData.bucketName = DestinyInventoryBucketDefinition[bucketHash].bucketName;
// 	if (newItemData.stats) {
// 		for (var e = 0; e < newItemData.stats.length; e++) {
// 			newItemData.stats[e].statName = DestinyStatDefinition[newItemData.stats[e].statHash].statName;
// 		}
// 	}
// 	if (getItemDefinition(hash).sourceHashes) {
// 		var sourceHashes = getItemDefinition(hash).sourceHashes;
// 		for (var q = 0; q < sourceHashes.length; q++) {
// 			var sourceHash = sourceHashes[q];
// 			var rewardSource = DestinyRewardSourceDefinition[sourceHash];
// 			if (rewardSource) {
// 				if (!newItemData.sources) {
// 					newItemData.sources = [];
// 				}
// 				newItemData.sources.push(rewardSource.identifier);
// 			}
// 		}
// 	}
// 	if (newItemData.objectives) {
// 		var completed = 0;
// 		var completionValue = 0;
// 		for (var l = 0; l < newItemData.objectives.length; l++) {
// 			newItemData.objectives[l].displayDescription = DestinyObjectiveDefinition[newItemData.objectives[l].objectiveHash].displayDescription;
// 			newItemData.objectives[l].completionValue = DestinyObjectiveDefinition[newItemData.objectives[l].objectiveHash].completionValue;
// 			completed += newItemData.objectives[l].progress;
// 			completionValue += newItemData.objectives[l].completionValue;
// 		}
// 		if (completed === completionValue) {
// 			newItemData.isGridComplete = true;
// 		}
// 		newItemData.stackSize = Math.round(((completed / completionValue) * 100)) + "%";
// 	}
// 	if (newItemData.damageTypeHash) {
// 		newItemData.damageTypeName = DestinyDamageTypeDefinition[newItemData.damageTypeHash].damageTypeName;
// 	}
// 	if (newItemData.primaryStat) {
// 		newItemData.primaryStat.statName = DestinyStatDefinition[newItemData.primaryStat.statHash].statName;
// 	}
// 	if (newItemData.nodes) {
// 		var sortedNodes = [];
// 		for (var r = 0; r < newItemData.nodes.length; r++) {
// 			var newNode = newItemData.nodes[r];
// 			if (newNode.hidden === false) {
// 				var nodeHash = newNode.nodeHash;
// 				var stepIndex = newNode.stepIndex;
// 				newNode.nodeStepName = DestinyCompactTalentDefinition[newItemData.talentGridHash].nodes[nodeHash].steps[stepIndex].nodeStepName;
// 				sortedNodes.push(newNode);
// 			}
// 		}
// 		if (sortedNodes.length === 0) {
// 			delete newItemData.nodes;
// 		} else {
// 			newItemData.nodes = sortedNodes;
// 		}
// 	}
// 	return newItemData;
// }
// // var bungie = new Bungie();
// initItems(function() {});