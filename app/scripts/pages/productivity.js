var endDate = moment();
var startDate = moment(moment().subtract(24, "hours"));

function sortItemDiff(itemDiff, progression, items, engrams, currency, bounties, matches) {
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
				if (item.factionHash && !progression[item.factionHash]) {
					progression[item.factionHash] = {
						factionHash: item.factionHash,
						levels: [item.level],
						level: 0,
						progressChange: item.progressChange,
						currentProgress: item.currentProgress,
						name: DestinyFactionDefinition[item.factionHash].factionName
					};
				} else if (item.factionHash && progression[item.factionHash]) {
					if (progression[item.factionHash].levels.indexOf(item.level) === -1) {
						progression[item.factionHash].levels.push(item.level);
					}
					progression[item.factionHash].level = progression[item.factionHash].levels.length;
					progression[item.factionHash].progressChange += item.progressChange;
					progression[item.factionHash].currentProgress = item.currentProgress;
				} else if (item.progressionHash && !progression[item.progressionHash]) {
					progression[item.progressionHash] = {
						progressionHash: item.progressionHash,
						levels: [item.level],
						level: 0,
						progressChange: item.progressChange,
						currentProgress: item.currentProgress,
						name: item.name
					};
				} else if (item.progressionHash && progression[item.progressionHash]) {
					if (progression[item.progressionHash].levels.indexOf(item.level) === -1) {
						progression[item.progressionHash].levels.push(item.level);
					}
					progression[item.progressionHash].level = progression[item.progressionHash].levels.length;
					progression[item.progressionHash].progressChange += item.progressChange;
					progression[item.progressionHash].currentProgress = item.currentProgress;
				} else if (item.itemHash) {
					var itemDef = getItemDefinition(item.itemHash);
					if (itemDef.itemType === 1) {
						if (!currency[item.itemHash]) {
							currency[item.itemHash] = {
								name: itemDef.itemName,
								hash: item.itemHash,
								added: 0,
								removed: 0,
								diff: 0
							};
						} else {
							if (attr === "added") {
								currency[item.itemHash].added += item.stackSize;
							}
							if (attr === "removed") {
								currency[item.itemHash].removed += item.stackSize;
							}
							currency[item.itemHash].diff = currency[item.itemHash].added - currency[item.itemHash].removed;
						}
					} else if (itemDef.itemType === 8) {
						if (!engrams[item.itemHash]) {
							engrams[item.itemHash] = {
								name: itemDef.itemName,
								hash: item.itemHash,
								added: 0,
								removed: 0,
								diff: 0
							};
						} else {
							if (attr === "added") {
								engrams[item.itemHash].added += 1;
							}
							if (attr === "removed") {
								engrams[item.itemHash].removed += 1;
							}
							engrams[item.itemHash].diff = engrams[item.itemHash].added - engrams[item.itemHash].removed;
						}
					} else if (itemDef.itemType === 4) {
						if (!bounties[item.itemHash]) {
							bounties[item.itemHash] = {
								name: itemDef.itemName,
								itemHash: item.itemHash,
								objectives: item.objectives,
								added: 0,
								removed: 0,
								stackSize: 0
							};
						} else {
							if (attr === "added") {
								bounties[item.itemHash].added += 1;
							}
							if (attr === "removed") {
								bounties[item.itemHash].removed += 1;
							}
							bounties[item.itemHash].stackSize = bounties[item.itemHash].added - bounties[item.itemHash].removed;
						}
					} else {
						if (!items[item.itemHash]) {
							items[item.itemHash] = {
								name: itemDef.itemName,
								hash: item.itemHash,
								added: 0,
								removed: 0,
								diff: 0
							};
						} else {
							if (attr === "added") {
								items[item.itemHash].added += 1;
							}
							if (attr === "removed") {
								items[item.itemHash].removed += 1;
							}
							items[item.itemHash].diff = items[item.itemHash].added - items[item.itemHash].removed;
						}
					}
				}
			}
		}
	}
}

function getProductivity() {
	var mainContainer = document.getElementById("productivity");
	database.getAllEntries("itemChanges").then(function(localResult) {
		var productivityRange = [];
		var progression = {};
		var items = {};
		var engrams = {};
		var currency = {};
		var matches = [];
		var bounties = {};
		for (let itemDiff of localResult.itemChanges) {
			let localTime = moment.utc(itemDiff.timestamp).tz(timezone);
			if (localTime.isBetween(startDate, endDate)) {
				productivityRange.push(itemDiff);
			}
		}
		console.log(productivityRange)
		for (let itemDiff of productivityRange) {
			sortItemDiff(itemDiff, progression, items, engrams, currency, bounties, matches);
		}
		var currencyContainer = document.createElement("div");
		currencyContainer.classList.add("sub-section");
		var currencyFrag = document.createDocumentFragment();
		for (let currencyItem of currency) {
			if (currencyItem.added !== 0 || currencyItem.removed !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(currencyItem.hash);
				currencyContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				itemDef.stackSize = currencyItem.diff;
				let itemElement = makeItem(itemDef);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${currencyItem.name}\n<br> Earned: ${currencyItem.added}\n<br> Spent: ${currencyItem.removed}`;
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
			if (progressionItem.added !== 0 || progressionItem.removed !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = DestinyProgressionDefinition[progressionItem.progressionHash];
				// factionContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				// itemDef.stackSize = progressionItem.progressChange;
				let itemElement = makeProgress(progressionItem);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${progressionItem.name}\n<br> Levels Earned: ${progressionItem.level - 1}\n<br> Rep Earned: ${progressionItem.progressChange}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				factionFrag.appendChild(container);
			}
		}
		factionContainer.appendChild(factionFrag);
		mainContainer.appendChild(factionContainer);
		currencyContainer.appendChild(currencyFrag);
		mainContainer.appendChild(currencyContainer);
		var engramContainer = document.createElement("div");
		engramContainer.classList.add("sub-section");
		// engramContainer.innerHTML = "<p>Engrams</p>";
		var engramFrag = document.createDocumentFragment();
		for (let engramItem of engrams) {
			if (engramItem.added !== 0 || engramItem.removed !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(engramItem.hash);
				engramContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				itemDef.stackSize = engramItem.diff;
				let itemElement = makeItem(itemDef);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${engramItem.name}\n<br> Collected: ${engramItem.added}\n<br> Decrypted: ${engramItem.removed}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				engramFrag.appendChild(container);
			}
		}
		engramContainer.appendChild(engramFrag);
		mainContainer.appendChild(engramContainer);
		var bountyContainer = document.createElement("div");
		bountyContainer.classList.add("sub-section");
		// bountyContainer.innerHTML = "<p>Bounties</p>";
		var bountyFrag = document.createDocumentFragment();
		for (let bountyItem of bounties) {
			if (bountyItem.added !== 0 || bountyItem.removed !== 0) {
				let container = document.createElement("span");
				container.className = "productiveCurrency productiveBox";
				let itemDef = getItemDefinition(bountyItem.itemHash);
				bountyContainer.innerHTML = "<p>" + itemDef.itemTypeName + "</p>";
				let itemElement = makeItem(bountyItem);
				let textNode = document.createElement("span");
				textNode.className = "productiveCurrency";
				textNode.innerHTML = `${bountyItem.name}\n<br> Collected: ${bountyItem.added}\n<br> Decrypted: ${bountyItem.removed}`;
				container.appendChild(itemElement);
				container.appendChild(textNode);
				bountyFrag.appendChild(container);
			}
		}
		bountyContainer.appendChild(bountyFrag);
		mainContainer.appendChild(bountyContainer);
		console.log(progression, items, engrams, currency, matches, bounties)
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			console.log(result);
		});
		initUi();
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