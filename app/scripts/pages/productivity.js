var endDate = moment();
var startDate = moment(moment().subtract(24, "hours"));
var globalOptions = {};
var DEBUG = false;
var manifest = chrome.runtime.getManifest();
if (!manifest.key) {
	DEBUG = true;
}
getAllOptions().then(function(options) {
	globalOptions = options;
});
var archonsForgeOfferings = [53222595, 75513258, 320546391, 467779878, 499606006, 509258536, 1071829038, 1314964292, 1389966135, 1487443337, 1572235095, 1923380455, 2105075347, 2125668903, 2221360244, 2555632266, 3373783208, 3496832972, 3771657596, 3989468294, 4268984314];

function sortItemDiff(itemDiff, progression, items, engrams, currency, bounties, materials, offerings, exotics, matches, currentProgress) {
	for (var attr in itemDiff) {
		if (itemDiff.match && matches.indexOf(itemDiff.match) === -1) {
			matches.push(itemDiff.match);
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
					if (itemTypeName === "currency") {
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
								itemInstances:[],
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
						if (attr === "removed") {
							exotics[item.itemHash].deleted += 1;
						}
						exotics[item.itemHash].diff = exotics[item.itemHash].added - exotics[item.itemHash].deleted;
					} else if (itemDef.bucketTypeHash && itemDef.itemCategoryHashes && (itemDef.itemCategoryHashes.indexOf(20) > -1 || itemDef.itemCategoryHashes.indexOf(1) > -1)) {
						var identifier = itemDef.tierTypeName + itemDef.bucketTypeHash;
						var bucket = DestinyInventoryBucketDefinition[itemDef.bucketTypeHash];
						if (!items[identifier]) {
							items[identifier] = {
								name: (itemDef.tierTypeName || "") + " " + bucket.bucketName,
								itemHash: item.itemHash,
								itemInstances:[],
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
var totalEngrams = 0;
var totalOfferings = 0;

function getProductivity() {
	totalEngrams = 0;
	totalOfferings = 0;
	database.getMultipleStores(["itemChanges", "progression"]).then(function(localResult) {
		var mainContainer = document.getElementById("productivity");
		mainContainer.innerHTML = "";
		var currentProgress = {};
		for (var character of localResult.progression) {
			if (!currentProgress[character.characterId]) {
				currentProgress[character.characterId] = {};
			}
			for (var progress of character.progression.progressions) {
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
		var matches = [];
		var bounties = {};
		for (let itemDiff of localResult.itemChanges) {
			let localTime = moment.utc(itemDiff.timestamp).tz(timezone);
			if (localTime.isBetween(startDate, endDate)) {
				productivityRange.push(itemDiff);
			}
		}
		for (let itemDiff of productivityRange) {
			sortItemDiff(itemDiff, progression, items, engrams, currency, bounties, materials, offerings, exotics, matches, currentProgress);
		}

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
				if (engramItem.diff <= 0) {
					itemDef.removed = true;
					itemDef.stackSize = "0";
				}
				let itemElement = makeItem(itemDef);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${engramItem.name}\n<br> Collected: ${engramItem.added}\n<br> Decrypted: ${engramItem.deleted}\n<br> Percentage: ${Math.round(engramItem.added/totalEngrams*100)}%`;
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
				if (bountyItem.diff <= 0) {
					bountyItem.removed = true;
					bountyItem.stackSize = "0";
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
				if (materialItem.diff <= 0) {
					materialItem.removed = true;
					materialItem.stackSize = "0";
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
				if (offeringItem.stackSize <= 0) {
					offeringItem.removed = true;
					offeringItem.stackSize = "0";
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
					if (exoticItem.diff <= 0) {
						exoticItem.item.removed = true;
						exoticItem.item.stackSize = "0";
					}
					itemElement = makeItem(exoticItem.item);
				} else {
					if (exoticItem.diff <= 0) {
						itemDef.removed = true;
						itemDef.stackSize = "0";
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
					if (itemItem.diff <= 0) {
						itemItem.item.removed = true;
						itemItem.item.stackSize = "0";
					}
					itemElement = makeItem(itemItem.item);
				} else {
					if (itemItem.diff <= 0) {
						itemDef.removed = true;
						itemDef.stackSize = "0";
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
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			console.log(result);
		});
		initUi(elements.container);
		var startDateInput = document.getElementById("startDate");
		var endDateInput = document.getElementById("endDate");
		var presetDateInput = document.getElementById("presetDate");
		endDate = moment();
		endDateInput.value = endDate.format("YYYY-MM-DDTHH:mm");
		startDate = moment(moment().subtract(24, "hours"));
		startDateInput.value = startDate.format("YYYY-MM-DDTHH:mm");
		startDateInput.setAttribute("disabled", true);
		endDateInput.setAttribute("disabled", true);
		getProductivity();
		document.getElementById("status").classList.remove("active");
		startDateInput.addEventListener("change", function() {
			startDate = moment(startDateInput.value);
			getProductivity();
		}, false);
		endDateInput.addEventListener("change", function() {
			endDate = moment(endDateInput.value);
			getProductivity();
		}, false);
		presetDateInput.addEventListener("change", function() {
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
				getProductivity();
			}
		}, false);
	});
});