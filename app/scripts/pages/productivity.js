var endDate = moment();
var startDate = moment(moment().subtract(24, "hours"));
getAllOptions().then(function (options) {
	globalOptions = options;
	tags.update();
});
tags.noTagging();
var characterDescriptions = JSON.parse(localStorage.characterDescriptions);
var totalEngrams = 0;
var totalOfferings = 0;
var totalActivities = 0;
var archonsForgeOfferings = [53222595, 75513258, 320546391, 467779878, 499606006, 509258536, 1071829038, 1314964292, 1389966135, 1487443337, 1572235095, 1923380455, 2105075347, 2125668903, 2221360244, 2555632266, 3373783208, 3496832972, 3771657596, 3989468294, 4268984314];
var pvp = [39921727, 55476966, 126790154, 579151588, 736189348, 976536573, 1030667770, 1066759414, 1337970376, 1526862764, 1533445734, 1646825171, 1860850614, 2127351241, 2691931425, 2833173037, 2942016862, 3323301749, 3409618559, 3432675002, 3547232662, 3582414910, 3614615911, 3695721985, 3832998222, 3846426416, 3923114990, 3957072814, 3990775146, 4047366879, 4013076195, 3887258850, 3852968078, 3828541881, 3616808722, 3597531865, 3433065842, 1765876615, 308891298, 295266492];
var pve = [147238405, 328502994, 680256650, 837773392, 1037283719, 1299744814, 1686739444, 2043403989, 2889152536, 3705723572, 4110605575, 4164571395, 3497767639, 2881466965, 2201105581, 1801258597, 575572995];
var itemInstanceIds = [];
var matchesPerClass = {};

function sortItemDiff(itemDiff, progression, items, engrams, currency, bounties, materials, offerings, exotics, matches, currentProgress, ornaments) {
	for (var attr in itemDiff) {
		if (itemDiff.match) {
			let match = JSON.parse(itemDiff.match);
			let identifier = match.activityHash;
			identifier = DestinyActivityDefinition[identifier].activityTypeHash;
			if (match.activityTypeHashOverride) {
				identifier = match.activityTypeHashOverride;
			}
			let activityType = DestinyActivityTypeDefinition[identifier];
			if (pvp.indexOf(identifier) > -1 && matchesPerClass.pvp.instances.indexOf(match.activityInstance) === -1) {
				matchesPerClass.pvp.icon = activityType.icon;
				matchesPerClass.pvp.played += 1;
				matchesPerClass.pvp.timeSpent += match.activityTime;
				matchesPerClass.pvp.instances.push(match.activityInstance);
			}
			if (pve.indexOf(identifier) > -1 && matchesPerClass.pve.instances.indexOf(match.activityInstance) === -1) {
				matchesPerClass.pve.icon = activityType.icon;
				matchesPerClass.pve.played += 1;
				matchesPerClass.pve.timeSpent += match.activityTime;
				matchesPerClass.pve.instances.push(match.activityInstance);
			}
			if (!matchesPerClass[characterName(match.characterId)]) {
				matchesPerClass[characterName(match.characterId)] = {
					activityInstances: [],
					timeSpent: 0,
					icon: characterDescriptions[match.characterId].icon,
					activitiesPlayed: 0
				};
			}
			if (matchesPerClass[characterName(match.characterId)].activityInstances.indexOf(match.activityInstance) === -1) {
				matchesPerClass[characterName(match.characterId)].timeSpent += match.activityTime;
				matchesPerClass[characterName(match.characterId)].activitiesPlayed += 1;
				matchesPerClass[characterName(match.characterId)].activityInstances.push(match.activityInstance);
			}
			if (!matches[identifier]) {
				totalActivities++;
				matches[identifier] = {
					instances: [match.activityInstance],
					icon: activityType.icon,
					played: 1,
					name: activityType.activityTypeName,
					timeSpent: match.activityTime
				};
			} else if (matches[identifier] && matches[identifier].instances.indexOf(match.activityInstance) === -1) {
				totalActivities++;
				matches[identifier].timeSpent += match.activityTime;
				matches[identifier].played += 1;
				matches[identifier].instances.push(match.activityInstance);
			}
		}
		if (Array.isArray(itemDiff[attr])) {
			for (var item of itemDiff[attr]) {
				if (item.item) {
					item = item.item;
				}
				item = JSON.parse(item);
				if (item.factionHash) {
					if (!progression[item.factionHash]) {
						progression[item.factionHash] = {
							factionHash: item.factionHash,
							levels: [],
							level: 0,
							nextLevelAt: item.nextLevelAt,
							progressChange: 0,
							currentProgress: item.currentProgress,
							progressToNextLevel: item.progressToNextLevel,
							name: DestinyFactionDefinition[item.factionHash].factionName
						};
					}
					if (progression[item.factionHash].levels.indexOf(item.level) === -1 && currentProgress[itemDiff.characterId][item.progressionHash] !== item.level) {
						progression[item.factionHash].levels.push(item.level);
					}
					progression[item.factionHash].level = progression[item.factionHash].levels.length;
					progression[item.factionHash].progressChange += item.progressChange;
					progression[item.factionHash].currentProgress = item.currentProgress;
					if (!progression[item.factionHash].progressToNextLevel || progression[item.factionHash].progressToNextLevel < item.progressToNextLevel) {
						progression[item.factionHash].progressToNextLevel = item.progressToNextLevel;
					}
				} else if (item.progressionHash) {
					if (!progression[item.progressionHash]) {
						progression[item.progressionHash] = {
							progressionHash: item.progressionHash,
							levels: [],
							level: 0,
							nextLevelAt: item.nextLevelAt,
							progressChange: 0,
							currentProgress: item.currentProgress,
							progressToNextLevel: item.progressToNextLevel,
							name: item.name
						};
					}
					if (progression[item.progressionHash].levels.indexOf(item.level) === -1 && currentProgress[itemDiff.characterId][item.progressionHash] !== item.level) {
						progression[item.progressionHash].levels.push(item.level);
					}
					progression[item.progressionHash].level = progression[item.progressionHash].levels.length;
					progression[item.progressionHash].progressChange += item.progressChange;
					progression[item.progressionHash].currentProgress = item.currentProgress;
					if (!progression[item.progressionHash].progressToNextLevel || progression[item.progressionHash].progressToNextLevel < item.progressToNextLevel) {
						progression[item.progressionHash].progressToNextLevel = item.progressToNextLevel;
					}
				} else if (item.itemHash) {
					var itemTypeName = itemType(item);
					var itemDef = getItemDefinition(item.itemHash, item);
					if (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(56) > -1) {
						if (!ornaments[item.itemHash]) {
							ornaments[item.itemHash] = {
								name: itemDef.itemName,
								hash: item.itemHash,
								added: 0,
								deleted: 0,
								diff: 0
							};
						}
						if (attr === "added") {
							ornaments[item.itemHash].added += item.stackSize;
						}
						if (attr === "removed") {
							ornaments[item.itemHash].deleted += item.stackSize;
						}
						ornaments[item.itemHash].diff = ornaments[item.itemHash].added - ornaments[item.itemHash].deleted;
					} else if (itemTypeName === "currency") {
						if (!currency[item.itemHash]) {
							currency[item.itemHash] = {
								name: itemDef.itemName,
								hash: item.itemHash,
								added: 0,
								deleted: 0,
								diff: 0
							};
						}
						if (attr === "added") {
							currency[item.itemHash].added += item.stackSize;
						}
						if (attr === "removed") {
							currency[item.itemHash].deleted += item.stackSize;
						}
						currency[item.itemHash].diff = currency[item.itemHash].added - currency[item.itemHash].deleted;
					} else if (itemTypeName === "engram") {
						var modifier = attr === "added" ? attr : "deleted";
						if (modifier === "added") {
							totalEngrams += 1;
						}
						if (itemDef.tierType === 6) {
							engrams.exotic[modifier] += 1;
							engrams.exotic.diff = engrams.exotic.added - engrams.exotic.deleted;
						}
						if (itemDef.tierType === 5) {
							if (itemDef.itemName.toLowerCase().indexOf("sublime") > -1) {
								engrams.sublime[modifier] += 1;
								engrams.sublime.diff = engrams.sublime.added - engrams.sublime.deleted;
							} else {
								engrams.legendary[modifier] += 1;
								engrams.legendary.diff = engrams.legendary.added - engrams.legendary.deleted;
							}
						}
						if (itemDef.tierType === 4) {
							engrams.rare[modifier] += 1;
							engrams.rare.diff = engrams.rare.added - engrams.rare.deleted;
						}
						if (!engrams[item.itemHash]) {
							engrams[item.itemHash] = {
								name: itemDef.itemName,
								hash: item.itemHash,
								added: 0,
								deleted: 0,
								diff: 0
							};
						}
						engrams[item.itemHash][modifier] += 1;
						engrams[item.itemHash].diff = engrams[item.itemHash].added - engrams[item.itemHash].deleted;

					} else if (itemTypeName === "bounty") {
						if (!bounties[item.itemHash]) {
							bounties[item.itemHash] = {
								name: itemDef.itemName,
								itemHash: item.itemHash,
								objectives: item.objectives,
								added: 0,
								deleted: 0,
								stackSize: 0
							};
						}
						if (attr === "added") {
							bounties[item.itemHash].added += 1;
						}
						if (attr === "removed") {
							bounties[item.itemHash].deleted += 1;
						}
						bounties[item.itemHash].stackSize = bounties[item.itemHash].added - bounties[item.itemHash].deleted;

					} else if (archonsForgeOfferings.indexOf(item.itemHash) > -1) {
						if (attr === "added") {
							totalOfferings += 1;
						}
						if (!offerings[item.itemHash]) {
							offerings[item.itemHash] = {
								name: itemDef.itemName,
								itemHash: item.itemHash,
								added: 0,
								deleted: 0,
								stackSize: 0
							};
						}
						if (typeof item.stackSize !== "number") {
							item.stackSize = 1;
						}
						if (attr === "added") {
							offerings[item.itemHash].added += item.stackSize;
						}
						if (attr === "removed") {
							offerings[item.itemHash].deleted += item.stackSize;
						}
						offerings[item.itemHash].stackSize = offerings[item.itemHash].added - offerings[item.itemHash].deleted;

					} else if (itemTypeName === "material" || itemTypeName === "consumable") {
						if (!materials[item.itemHash]) {
							materials[item.itemHash] = {
								name: itemDef.itemName,
								itemHash: item.itemHash,
								added: 0,
								deleted: 0,
								stackSize: 0
							};
						}
						if (typeof item.stackSize !== "number") {
							item.stackSize = 1;
						}
						if (attr === "added") {
							materials[item.itemHash].added += item.stackSize;
						}
						if (attr === "removed") {
							materials[item.itemHash].deleted += item.stackSize;
						}
						materials[item.itemHash].stackSize = materials[item.itemHash].added - materials[item.itemHash].deleted;

					} else if (itemDef.tierType === 6) {
						if (!exotics[itemDef.itemHash]) {
							exotics[itemDef.itemHash] = {
								name: itemDef.itemName,
								itemHash: item.itemHash,
								itemInstances: [],
								item: item,
								added: 0,
								deleted: 0,
								diff: 0
							};
						}
						if (attr === "added" && exotics[item.itemHash].itemInstances.indexOf(item.itemInstanceId) === -1) {
							exotics[item.itemHash].added += 1;
							exotics[item.itemHash].itemInstances.push(item.itemInstanceId);
						}
						if (attr === "removed" && itemInstanceIds.indexOf(item.itemInstanceId) === -1) {
							exotics[item.itemHash].deleted += 1;
						}
						exotics[item.itemHash].diff = exotics[item.itemHash].added - exotics[item.itemHash].deleted;
						exotics[item.itemHash].item.stackSize = exotics[item.itemHash].added - exotics[item.itemHash].deleted;
					} else if (itemDef.bucketTypeHash && itemDef.itemCategoryHashes && (itemDef.itemCategoryHashes.indexOf(20) > -1 || itemDef.itemCategoryHashes.indexOf(1) > -1)) {
						var identifier = itemDef.tierTypeName + itemDef.bucketTypeHash;
						var bucket = DestinyInventoryBucketDefinition[itemDef.bucketTypeHash];
						if (!items[identifier]) {
							items[identifier] = {
								name: (itemDef.tierTypeName || "") + " " + bucket.bucketName,
								itemHash: item.itemHash,
								itemInstances: [],
								added: 0,
								deleted: 0,
								diff: 0
							};
						}
						if (attr === "added" && items[identifier].itemInstances.indexOf(item.itemInstanceId) === -1) {
							items[identifier].added += 1;
							items[identifier].itemInstances.push(item.itemInstanceId);
						}
						if (attr === "removed") {
							items[identifier].deleted += 1;
						}
						items[identifier].diff = items[identifier].added - items[identifier].deleted;

					}
				}
			}
		}
	}
}

function getProductivity() {
	document.getElementById("status").classList.add("active");
	totalEngrams = 0;
	totalOfferings = 0;
	totalActivities = 0;
	matchesPerClass = {
		pvp: {
			instances: [],
			icon: "",
			played: 0,
			name: "Crucible",
			timeSpent: 0
		},
		pve: {
			instances: [],
			icon: "",
			played: 0,
			name: "Vanguard",
			timeSpent: 0
		}
	};
	database.getMultipleStores(["itemChanges", "progression", "inventories"]).then(function (localResult) {
		itemInstanceIds = [];
		for (let character of localResult.inventories) {
			for (let item of character.inventory) {
				if (item.itemInstanceId && item.itemInstanceId !== "0" && itemInstanceIds.indexOf(item.itemInstanceId) === -1) {
					itemInstanceIds.push(item.itemInstanceId);
				}
			}
		}
		let mainContainer = document.getElementById("productivity");
		let currentProgress = {};
		for (let character of localResult.progression) {
			if (!currentProgress[character.characterId]) {
				currentProgress[character.characterId] = {};
			}
			for (let progress of character.progression.progressions) {
				currentProgress[character.characterId][progress.progressionHash] = progress.level;
			}
		}
		var productivityRange = [];
		var progression = {};
		var items = {};
		var materials = {};
		var offerings = {};
		var exotics = {};
		var exoticName = getItemDefinition(27147831).tierTypeName;
		var legendaryName = getItemDefinition(67667123).tierTypeName;
		var rareName = getItemDefinition(1233129211).tierTypeName;
		var engrams = {
			exotic: {
				name: exoticName,
				hash: 27147831,
				added: 0,
				deleted: 0,
				diff: 0
			},
			legendary: {
				name: legendaryName,
				hash: 67667123,
				added: 0,
				deleted: 0,
				diff: 0
			},
			sublime: {
				name: "Sublime",
				hash: 67667123,
				added: 0,
				deleted: 0,
				diff: 0
			},
			rare: {
				name: rareName,
				hash: 1233129211,
				added: 0,
				deleted: 0,
				diff: 0
			}
		};
		var currency = {};
		var matches = {};
		var bounties = {};
		var ornaments = {};
		for (let itemDiff of localResult.itemChanges) {
			let localTime = moment.utc(itemDiff.timestamp).tz(timezone);
			if (localTime.isBetween(startDate, endDate)) {
				productivityRange.push(itemDiff);
			}
		}
		for (let itemDiff of productivityRange) {
			sortItemDiff(itemDiff, progression, items, engrams, currency, bounties, materials, offerings, exotics, matches, currentProgress, ornaments);
		}
		for (let character in matchesPerClass) {
			if (matchesPerClass[character].name === "Vanguard" || matchesPerClass[character].name === "Crucible") {
				matches[character] = matchesPerClass[character];
			} else {
				matches[character] = {
					played: matchesPerClass[character].activitiesPlayed,
					name: character,
					timeSpent: matchesPerClass[character].timeSpent,
					icon: matchesPerClass[character].icon
				};
			}
		}
		console.log(matches)
		mainContainer.innerHTML = ``;
		var currencyContainer = document.createElement("div");
		currencyContainer.classList.add("sub-section");
		var currencyFrag = document.createDocumentFragment();
		for (let currencyItem of currency) {
			if (currencyItem.added !== 0 || currencyItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(currencyItem.hash);
				currencyContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				itemDef.stackSize = currencyItem.diff;
				let itemElement = makeItem(itemDef);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${currencyItem.name}\n<br> Earned: ${currencyItem.added}\n<br> Spent: ${currencyItem.deleted}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				currencyFrag.appendChild(container);
			}
		}
		currencyContainer.appendChild(currencyFrag);
		mainContainer.appendChild(currencyContainer);

		var ornamentContainer = document.createElement("div");
		ornamentContainer.classList.add("sub-section");
		ornamentContainer.innerHTML = "<p>" + DestinyItemCategoryDefinition[56].title + "</p>";
		var ornamentFrag = document.createDocumentFragment();
		for (let ornamentItem of ornaments) {
			if (ornamentItem.added !== 0 || ornamentItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(ornamentItem.hash);
				itemDef.stackSize = ornamentItem.diff;
				if (ornamentItem.diff <= 0 || ornamentItem.stackSize <= 0) {
					itemDef.removed = true;
				}
				let itemElement = makeItem(itemDef);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${ornamentItem.name}\n<br> Collected: ${ornamentItem.added}\n<br> Dismantled: ${ornamentItem.deleted}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				ornamentFrag.appendChild(container);
			}
		}
		ornamentContainer.appendChild(ornamentFrag);
		mainContainer.appendChild(ornamentContainer);

		var matchContainer = document.createElement("div");
		matchContainer.classList.add("sub-section");
		var matchFrag = document.createDocumentFragment();
		for (let matchItem of matches) {
			if (matchItem.played !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				matchContainer.innerHTML = "<p>Activities</p>";
				let itemContainer = document.createElement("div");
				let container2 = document.createElement("div");
				container2.setAttribute("style", "background-image: url(" + "'https://www.bungie.net" + matchItem.icon + "')");
				container2.classList.add("faction", "inverted");
				let stat = document.createElement("div");
				stat.textContent = matchItem.played;
				let tag = document.createElement("div");
				let quality = document.createElement("div");
				itemContainer.classList.add("item-container");
				itemContainer.appendChild(container2);
				itemContainer.appendChild(quality);
				itemContainer.appendChild(stat);
				itemContainer.appendChild(tag);
				stat.classList.add("primary-stat");
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${matchItem.name}\n<br> Time Spent: ${moment.duration(matchItem.timeSpent, 'seconds').humanize()}\n<br> Activities Played: ${matchItem.played}\n<br> Percentage: ${Math.round((matchItem.played / totalActivities)*100)}`;
				container.appendChild(itemContainer);
				container.appendChild(textNode);
				matchFrag.appendChild(container);
			}
		}
		matchContainer.appendChild(matchFrag);
		mainContainer.appendChild(matchContainer);

		var factionContainer = document.createElement("div");
		factionContainer.classList.add("sub-section");
		factionContainer.innerHTML = "<p>Progression</p>";
		var factionFrag = document.createDocumentFragment();
		for (let progressionItem of progression) {
			if (progressionItem.added !== 0 || progressionItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = DestinyProgressionDefinition[progressionItem.progressionHash];
				// factionContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				// itemDef.stackSize = progressionItem.progressChange;
				let itemElement = makeProgress(progressionItem);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${progressionItem.name}\n<br> Levels Earned: ${progressionItem.level}\n<br> Rep Earned: ${progressionItem.progressChange}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				factionFrag.appendChild(container);
			}
		}
		factionContainer.appendChild(factionFrag);
		mainContainer.appendChild(factionContainer);

		var engramContainer = document.createElement("div");
		engramContainer.classList.add("sub-section");
		engramContainer.innerHTML = "<p>" + DestinyItemCategoryDefinition[34].title + "</p>";
		var engramFrag = document.createDocumentFragment();
		for (let engramItem of engrams) {
			if (engramItem.added !== 0 || engramItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(engramItem.hash);
				itemDef.stackSize = engramItem.diff;
				if (engramItem.diff <= 0 || engramItem.stackSize <= 0) {
					itemDef.removed = true;
					itemDef.stackSize = "0";
				}
				let itemElement = makeItem(itemDef);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${engramItem.name}\n<br> Collected: ${engramItem.added}\n<br> Decrypted: ${engramItem.deleted}\n<br> Percentage: ${Math.round((engramItem.added/totalEngrams)*100)}%`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				engramFrag.appendChild(container);
			}
		}
		engramContainer.appendChild(engramFrag);
		mainContainer.appendChild(engramContainer);

		var bountyContainer = document.createElement("div");
		bountyContainer.classList.add("sub-section");
		bountyContainer.innerHTML = "<p>" + DestinyItemCategoryDefinition[26].title + "</p>";
		var bountyFrag = document.createDocumentFragment();
		for (let bountyItem of bounties) {
			if (bountyItem.added !== 0 || bountyItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(bountyItem.itemHash);
				if (bountyItem.diff <= 0 || bountyItem.stackSize <= 0) {
					bountyItem.removed = true;
				}
				let itemElement = makeItem(bountyItem);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${bountyItem.name}\n<br> Acquired: ${bountyItem.added}\n<br> Completed: ${bountyItem.deleted}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				bountyFrag.appendChild(container);
			}
		}
		bountyContainer.appendChild(bountyFrag);
		mainContainer.appendChild(bountyContainer);

		var materialContainer = document.createElement("div");
		materialContainer.classList.add("sub-section");
		materialContainer.innerHTML = "<p>" + DestinyItemCategoryDefinition[40].title + "</p>";
		var materialFrag = document.createDocumentFragment();
		for (let materialItem of materials) {
			if (materialItem.added !== 0 || materialItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(materialItem.itemHash);
				if (materialItem.diff <= 0 || materialItem.stackSize <= 0) {
					materialItem.removed = true;
				}
				let itemElement = makeItem(materialItem);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${materialItem.name}\n<br> Collected: ${materialItem.added}\n<br> Used: ${materialItem.deleted}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				materialFrag.appendChild(container);
			}
		}
		materialContainer.appendChild(materialFrag);
		mainContainer.appendChild(materialContainer);

		var offeringContainer = document.createElement("div");
		offeringContainer.classList.add("sub-section");
		offeringContainer.innerHTML = "<p>Offerings</p>";
		var offeringFrag = document.createDocumentFragment();
		for (let offeringItem of offerings) {
			if (offeringItem.added !== 0 || offeringItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(offeringItem.itemHash);
				if (offeringItem.stackSize <= 0 || offeringItem.stackSize <= 0) {
					offeringItem.removed = true;
				}
				let itemElement = makeItem(offeringItem);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${offeringItem.name}\n<br> Collected: ${offeringItem.added}\n<br> Used: ${offeringItem.deleted}\n<br> Percentage: ${Math.round(offeringItem.added/totalOfferings*100)}%`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				offeringFrag.appendChild(container);
			}
		}
		offeringContainer.appendChild(offeringFrag);
		mainContainer.appendChild(offeringContainer);

		var exoticContainer = document.createElement("div");
		exoticContainer.classList.add("sub-section");
		exoticContainer.innerHTML = "<p>" + getItemDefinition(12873460).tierTypeName + "</p>";
		var exoticFrag = document.createDocumentFragment();
		for (let exoticItem of exotics) {
			if (exoticItem.added !== 0 || exoticItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(exoticItem.itemHash);
				// exoticContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				let itemElement;
				if (exoticItem.item) {
					if (exoticItem.diff <= 0 || exoticItem.stackSize <= 0) {
						exoticItem.item.removed = true;
					}
					itemElement = makeItem(exoticItem.item);
				} else {
					if (exoticItem.diff <= 0 || exoticItem.stackSize <= 0) {
						itemDef.removed = true;
					}
					itemElement = makeItem(itemDef);
				}
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${exoticItem.name}\n<br> Collected: ${exoticItem.added}\n<br> Dismantled: ${exoticItem.deleted}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				exoticFrag.appendChild(container);
			}
		}
		exoticContainer.appendChild(exoticFrag);
		mainContainer.appendChild(exoticContainer);

		var itemContainer = document.createElement("div");
		itemContainer.classList.add("sub-section");
		itemContainer.innerHTML = "<p>" + DestinyItemCategoryDefinition[52].title + "</p>";
		var itemFrag = document.createDocumentFragment();
		for (let itemItem of items) {
			if (itemItem.added !== 0 || itemItem.deleted !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(itemItem.itemHash);
				// itemContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				let itemElement;
				if (itemItem.item) {
					if (itemItem.diff <= 0 || itemItem.stackSize <= 0) {
						itemItem.item.removed = true;
					}
					itemElement = makeItem(itemItem.item);
				} else {
					if (itemItem.diff <= 0 || itemItem.stackSize <= 0) {
						itemDef.removed = true;
					}
					itemElement = makeItem(itemDef);
				}
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${itemItem.name}\n<br> Collected: ${itemItem.added}\n<br> Dismantled: ${itemItem.deleted}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				itemFrag.appendChild(container);
			}
		}
		itemContainer.appendChild(itemFrag);
		mainContainer.appendChild(itemContainer);
		document.getElementById("status").classList.remove("active");
	});
}

document.addEventListener("DOMContentLoaded", function (event) {
	database.open().then(function () {
		database.getMultipleStores(database.allStores).then(function (result) {
			console.log(result);
		});
		initUi(document.body);
		var startDateInput = document.getElementById("startDate");
		var endDateInput = document.getElementById("endDate");
		var presetDateInput = document.getElementById("presetDate");
		endDate = moment();
		endDateInput.value = endDate.format("YYYY-MM-DDTHH:mm");
		startDate = moment(moment().subtract(24, "hours"));
		startDateInput.value = startDate.format("YYYY-MM-DDTHH:mm");
		startDateInput.setAttribute("disabled", true);
		endDateInput.setAttribute("disabled", true);
		tracker.sendEvent('Productivity', 'Preset', presetDateInput.value);
		getProductivity();
		startDateInput.addEventListener("change", function () {
			startDate = moment(startDateInput.value);
			tracker.sendEvent('Productivity', 'StartDate', startDate);
			getProductivity();
		}, false);
		endDateInput.addEventListener("change", function () {
			endDate = moment(endDateInput.value);
			tracker.sendEvent('Productivity', 'EndDate', endDate);
			getProductivity();
		}, false);
		presetDateInput.addEventListener("change", function () {
			if (presetDateInput.value === "lastday") {
				startDate = moment(moment().subtract(24, "hours"));
			}
			if (presetDateInput.value === "lastweek") {
				startDate = moment(moment().subtract(7, "days"));
			}
			if (presetDateInput.value === "lastmonth") {
				startDate = moment(moment().subtract(1, "months"));
			}
			if (presetDateInput.value === "custom") {
				startDateInput.removeAttribute("disabled");
				endDateInput.removeAttribute("disabled");
			} else {
				endDate = moment();
				startDateInput.setAttribute("disabled", true);
				endDateInput.setAttribute("disabled", true);
				endDateInput.value = endDate.format("YYYY-MM-DDTHH:mm");
				startDateInput.value = startDate.format("YYYY-MM-DDTHH:mm");
				tracker.sendEvent('Productivity', 'Preset', presetDateInput.value);
				getProductivity();
			}
		}, false);
	});
});