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
	for (var characterInventory of inventories) {
		var _characterName = characterName(characterInventory.characterId);
		for (var item of characterInventory.inventory) {
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
		IronSaga: {
			hashes: [],
			name: "Iron Saga",
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
		},
		ROI: {
			hashes: [],
			name: "Rise of Iron Weapons",
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
		} else if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1 && itemDef.tierType === 5 && itemDef.sourceHashes && itemDef.sourceHashes.indexOf(478645002) > -1 && itemDef.sourceHashes.indexOf(24296771) > -1) {
			sortedGear.ROI.hashes.push({
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
	for (var characterInventory of inventories) {
		var _characterName = characterName(characterInventory.characterId);
		for (var item of characterInventory.inventory) {
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
	for (var characterInventory of inventories) {
		for (var item of characterInventory.inventory) {
			var itemDef = getItemDefinition(item.itemHash);
			if (itemDef.bucketTypeHash === 4023194814) {
				item.characterId = characterName(characterInventory.characterId);
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
				mainContainer.innerHTML = "";
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
						if (emblem.failureIndexes[0] || (emblem.requiredUnlockFlags && emblem.requiredUnlockFlags[0].isSet === false) || emblem.itemStatus & 8) {
							missingHashes.push(emblem.item.itemHash);
							missingFragment.appendChild(makeItem(emblem.item, DestinyVendorDefinition[lastVendor].failureStrings[emblem.failureIndexes[0]]));
						} else {
							console.log(getItemDefinition(emblem.item.itemHash).itemName,emblem);
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
				mainContainer.innerHTML = `<h2>${kioskResponse.Message}</h2>`;
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

function findSparrows() {
	var mainContainer = document.getElementById("sparrowContainer");
	mainContainer.innerHTML = "Loading...";
	displayMissingVendorItems(mainContainer, 44395194, 459708109);
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
					database.getAllEntries("inventories").then(function(data) {
					// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findGhosts(data.inventories);
					});
				}
				if (event.target.dataset.feature === "ironbanner") {
					database.getAllEntries("inventories").then(function(data) {
					// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findIronBanner(data.inventories);
					});
				}
				if (event.target.dataset.feature === "trials") {
					database.getAllEntries("inventories").then(function(data) {
					// chrome.storage.local.get("inventories", function(data) {
						console.log(data.inventories);
						findTrials(data.inventories);
					});
				}
				if (event.target.dataset.feature === "raid") {
					database.getAllEntries("inventories").then(function(data) {
					// chrome.storage.local.get("inventories", function(data) {
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
				if (event.target.dataset.feature === "sparrows") {
					findSparrows();
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
	initItems(function() {
		database.open().then(postInitItems);
	});
});

window.requestAnimationFrame(date.keepDatesUpdated);