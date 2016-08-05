tracker.sendAppView('OptionsScreen');

function backupData() {
	var backupDataButton = document.getElementById("backupData");
	chrome.storage.local.get(null, function(data) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		var url = 'data:application/json;base64,' + btoa(JSON.stringify(data.itemChanges));
		chrome.downloads.download({
			url: url,
			filename: 'itemChanges.json'
		});
		backupDataButton.classList.remove("loading");
		backupDataButton.removeAttribute("disabled");
	});
}
var insigniaInput = null;
var autoCompleteInput = null;

document.addEventListener("DOMContentLoaded", function(event) {
	initUi();
	var startOnLaunchButton = document.getElementById("startOnLaunch");
	var backupDataButton = document.getElementById("backupData");
	var exportDataButton = document.getElementById("exportData");
	var exportLogsButton = document.getElementById("exportLogs");
	var minDateInput = document.getElementById("MinDate");
	if (minDateInput) {
		minDateInput.value = moment("2016-07-19T17:00:00Z").format("YYYY-MM-DDTHH:mm:ss");
	}
	var maxDateInput = document.getElementById("MaxDate");
	if (maxDateInput) {
		maxDateInput.value = moment("2016-07-26T09:00:00Z").format("YYYY-MM-DDTHH:mm:ss");
	}
	var gameModeInput = document.getElementById("GameMode");
	var ironBannerInput = document.getElementById("ironBanner");
	var resultsInput = document.getElementById("Results");
	var lightLevelInput = document.getElementById("lightLevel");
	if (backupDataButton) {
		backupDataButton.addEventListener("click", function() {
			chrome.permissions.contains({
				permissions: ['downloads']
			}, function(result) {
				if (result) {
					backupDataButton.classList.add("loading");
					backupDataButton.setAttribute("disabled", true);
					backupData();
				} else {
					chrome.permissions.request({
						permissions: ['downloads']
					}, function(granted) {
						if (granted) {
							backupDataButton.classList.add("loading");
							backupDataButton.setAttribute("disabled", true);
							backupData();
						}
					});
				}
			});
		});
	}
	if (exportDataButton) {
		exportDataButton.addEventListener("click", function() {
			exportDataButton.classList.add("loading");
			exportDataButton.setAttribute("disabled", true);
			exportData(gameModeInput.value, moment(minDateInput.value).utc().format(), moment(maxDateInput.value).utc().format(), parseInt(resultsInput.value), ironBannerInput.checked, lightLevelInput.checked);
		});
	}
	var itemSources = [];
	var hashIndex = [];
	var badHashes = [
		// festival of the lost
		1593524656, 1593524657, 1593524664, 1593524665, 1593524666, 1593524667, 1593524668,
		// crimson days
		1848923894,
		// unused consumables
		199830403, 1053112404, 2111706071, 3348846756,
		//unused items
		4030362776, 3887668221, 2448634621, 1682402747, 126428429, 437131613, 516735544, 516735545, 584130857, 1448697668, 1515795123, 1847675504, 1968488792, 2609687617, 3779317040, 3779317041, 382889452,
	];

	function goodItem(itemDef) {
		if (itemDef.bucketTypeHash !== 1469714392 && itemDef.bucketTypeHash !== 3865314626) {
			return false;
		}
		if (badHashes.indexOf(itemDef.itemHash) > -1) {
			return false;
		}
		if (!itemDef.itemType) {
			if (!itemDef.itemCategoryHashes) {
				return false;
			} else if (itemDef.itemCategoryHashes.indexOf(40) === -1) {
				return false;
			}
		}
		if (itemDef.maxStackSize === 1 || itemDef.nonTransferrable) {
			return false;
		}
		if (hashIndex.indexOf(itemDef.itemHash) > -1) {
			return false;
		}
		return true;
	}
	for (var itemDef of DestinyCompactItemDefinition) {
		if (goodItem(itemDef)) {
			itemSources.push({
				itemName: itemDef.itemName,
				itemHash: itemDef.itemHash,
				icon: itemDef.icon,
				itemDescription: itemDef.itemDescription
			});
			hashIndex.push(itemDef.itemHash);
		}
	}
	autoCompleteInput = new autoComplete({
		selector: '#insigificant',
		minChars: 0,
		delay: 500,
		source: function(term, suggest) {
			var suggestions = [];
			var suggestionList = null;
			if (term.length === 0) {
				suggestionList = itemSources;
			} else {
				var f = new Fuse(itemSources, {
					keys: ['itemName', 'itemDescription'],
					threshold: 0.1,
					distance: 1000
				});
				suggestionList = f.search(term.toLowerCase());
			}
			for (var suggestion of suggestionList) {
				if (insigniaInput.findItem("" + suggestion.itemHash) === null) {
					suggestions.push(suggestion);
				}
			}
			suggest(suggestions);
		},
		renderItem: function(item, search, index) {
			var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
			if (search.split(' ')[0] === "") {
				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item.itemHash}" data-name="${item.itemName}" title="${item.itemDescription}"><img src="http://www.bungie.net${item.icon}" width="25" height="25"><span>${item.itemName}</span></div>`;
			} else {
				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item.itemHash}" data-name="${item.itemName}" title="${item.itemDescription}"><img src="http://www.bungie.net${item.icon}" width="25" height="25"><span>${item.itemName.replace(re, "<b>$1</b>")}</span></div>`;
			}
		},
		onSelect: function(e, term, item) {
			var hash = parseInt(item.getAttribute('data-hash'), 10);
			var data = itemSources[hashIndex.indexOf(hash)];
			console.log(`Item "${data.itemName} (${data.itemDescription})" selected by ${(e.type == 'keydown' ? 'pressing enter' : 'mouse click')}.`);
			if (insigniaInput.findItem(item.getAttribute('data-hash')) === null) {
				insigniaInput.addItem(item.getAttribute('data-hash'));
			}
			localStorage.autoMoveItemsToVault = JSON.stringify(insigniaInput.value());
		}
	});
	insigniaInput = insignia(document.getElementById("insigificant"), {
		free: false,
		deletion: true,
		getText: function(item) {
			var hash = parseInt(item, 10);
			var data = itemSources[hashIndex.indexOf(hash)];
			return data.itemName;
		}
	});
	insigniaInput.on('remove', function() {
		localStorage.autoMoveItemsToVault = JSON.stringify(insigniaInput.value());
	});
	// document.getElementById("insigificant").addEventListener('keypress', function(e) {
	// 	if (e.keyCode === 13) {
	// 		insigniaInput.refresh();
	// 		e.preventDefault(); // prevent form submission
	// 	}
	// });
	if (localStorage.autoMoveItemsToVault) {
		var vaultItems = JSON.parse(localStorage.autoMoveItemsToVault);
		for (let item of vaultItems) {
			insigniaInput.addItem(item);
		}
	}

	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	if (dropZone) {
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleFileSelect, false);
	}
	var minLight = document.getElementById('minLight');
	var minQuality = document.getElementById('minQuality');
	var minConsumableStacks = document.getElementById('minConsumableStacks');
	var minMaterialStacks = document.getElementById('minMaterialStacks');
	var gearPerks = document.getElementById('gearPerks');
	var perkWindow = document.getElementById('perkWindow');
	var additionalPerks = document.getElementById('additionalPerks');
	var savePerks = document.getElementById('savePerks');
	var perkList = document.getElementById('perkList');
	if (minLight) {
		minLight.value = parseInt(localStorage.minLight) || minLight.value;
		minQuality.value = parseInt(localStorage.minQuality) || minQuality.value;
		if (isNaN(parseInt(localStorage.minConsumableStacks))) {
			minConsumableStacks.value = minConsumableStacks.value;
		} else {
			minConsumableStacks.value = parseInt(localStorage.minConsumableStacks);
		}
		if (isNaN(parseInt(localStorage.minMaterialStacks))) {
			minMaterialStacks.value = minMaterialStacks.value;
		} else {
			minMaterialStacks.value = parseInt(localStorage.minMaterialStacks);
		}
		minLight.addEventListener("change", handleQualityChange, false);
		minQuality.addEventListener("change", handleQualityChange, false);
		minConsumableStacks.addEventListener("change", handleQualityChange, false);
		minMaterialStacks.addEventListener("change", handleQualityChange, false);
	}
	if (gearPerks) {
		gearPerks.addEventListener("click", function() {
			loadPerksets();
			perkWindow.classList.remove("hidden");
		}, false);
		savePerks.addEventListener("click", function() {
			perkWindow.classList.add("hidden");
		}, false);
		additionalPerks.addEventListener("click", function() {
			perkList.innerHTML = perkList.innerHTML + `<li><fieldset>
		<label>Gear Type: <select><optgroup label="Primary Weapons"><option value="Pulse">Pulse Rifle</option><option value="Hand">Hand Cannon</option><option value="Auto">Auto Rifle</option><option value="Scout">Scout Rifle</option></optgroup><optgroup label="Special Weapons"><option value="Fusion">Fusion Rifle</option><option value="Sniper">Sniper Rifle</option><option value="Shotgun">Shotgun</option><option value="Sidearm">Sidearm</option></optgroup><optgroup label="Heavy Weapons"><option value="Machine">Machine Gun</option><option value="Rocket">Rocket Launcher</option></optgroup><optgroup label="Armor"><option value="Gauntlets">Gauntlets</option><option value="Leg">Leg Armor</option><option value="Artifact">Artifact</option><option value="Helmet">Helmet</option><option value="Chest">Chest Armor</option><option value="Ghost">Ghost Shell</option></optgroup></select></label>
		<label>Perks: <input type="text"></label>
		<label>Percent Match: <input type="number" min="1" max="100"></label>
		</fieldset></li>`;
		}, false);
	}
});

function loadPerksets() {
	var perkList = document.getElementById('perkList');
	var perkSets = JSON.parse(localStorage.perkSets);
	var html = "";
	for (var perkSet of perkSets) {
		html += `<li><fieldset>
		<label>Gear Type: <select><optgroup label="Primary Weapons"><option value="Pulse"${(perkSet.type ==="Pulse") ? " selected" : ""}>Pulse Rifle</option><option value="Hand"${(perkSet.type ==="Hand") ? " selected" : ""}>Hand Cannon</option><option value="Auto"${(perkSet.type ==="Auto") ? " selected" : ""}>Auto Rifle</option><option value="Scout"${(perkSet.type ==="Scout") ? " selected" : ""}>Scout Rifle</option></optgroup><optgroup label="Special Weapons"><option value="Fusion"${(perkSet.type ==="Fusion") ? " selected" : ""}>Fusion Rifle</option><option value="Sniper"${(perkSet.type ==="Sniper") ? " selected" : ""}>Sniper Rifle</option><option value="Shotgun"${(perkSet.type ==="Shotgun") ? " selected" : ""}>Shotgun</option><option value="Sidearm"${(perkSet.type ==="Sidearm") ? " selected" : ""}>Sidearm</option></optgroup><optgroup label="Heavy Weapons"><option value="Machine"${(perkSet.type ==="Machine") ? " selected" : ""}>Machine Gun</option><option value="Rocket"${(perkSet.type ==="Rocket") ? " selected" : ""}>Rocket Launcher</option></optgroup><optgroup label="Armor"><option value="Gauntlets"${(perkSet.type ==="Gauntlets") ? " selected" : ""}>Gauntlets</option><option value="Leg"${(perkSet.type ==="Leg") ? " selected" : ""}>Leg Armor</option><option value="Artifact"${(perkSet.type ==="Artifact") ? " selected" : ""}>Artifact</option><option value="Helmet"${(perkSet.type ==="Helmet") ? " selected" : ""}>Helmet</option><option value="Chest"${(perkSet.type ==="Chest") ? " selected" : ""}>Chest Armor</option><option value="Ghost"${(perkSet.type ==="Ghost") ? " selected" : ""}>Ghost Shell</option></optgroup></select></label>
		<label>Perks: <input type="text" value="${perkSet.perks.join(",")}"></label>
		<label>Percent Match: <input type="number" min="1" max="100" value="${parseInt(perkSet.value)}"></label>
		</fieldset></li>`;
	}
	html += `<li><fieldset>
		<label>Gear Type: <select><optgroup label="Primary Weapons"><option value="Pulse">Pulse Rifle</option><option value="Hand">Hand Cannon</option><option value="Auto">Auto Rifle</option><option value="Scout">Scout Rifle</option></optgroup><optgroup label="Special Weapons"><option value="Fusion">Fusion Rifle</option><option value="Sniper">Sniper Rifle</option><option value="Shotgun">Shotgun</option><option value="Sidearm">Sidearm</option></optgroup><optgroup label="Heavy Weapons"><option value="Machine">Machine Gun</option><option value="Rocket">Rocket Launcher</option></optgroup><optgroup label="Armor"><option value="Gauntlets">Gauntlets</option><option value="Leg">Leg Armor</option><option value="Artifact">Artifact</option><option value="Helmet">Helmet</option><option value="Chest">Chest Armor</option><option value="Ghost">Ghost Shell</option></optgroup></select></label>
		<label>Perks: <input type="text"></label>
		<label>Percent Match: <input type="number" min="1" max="100"></label>
		</fieldset></li>`;
	perkList.innerHTML = html;
}

function handleQualityChange(event) {
	var target = event.target;
	var value = parseInt(target.value, 10);
	var minimum = parseInt(target.min, 10);
	var maximum = parseInt(target.max, 10);
	if (isNaN(value)) {
		value = maximum;
	}
	if (value < minimum) {
		value = minimum;
	}
	if (value > maximum) {
		value = maximum;
	}
	localStorage[target.id] = value;
	target.value = value;
}

function handleFileSelect(evt) {
	var dropZone = document.getElementById('drop_zone');
	dropZone.classList.add("loading");
	dropZone.textContent = "Restoration In Progress";
	evt.stopPropagation();
	evt.preventDefault();
	console.log(dropZone.classList, dropZone.textContent)
	var files = evt.dataTransfer.files[0]; // FileList object.

	if (files) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			var object = JSON.parse(contents);
			chrome.storage.local.set({
				"itemChanges": object
			}, function() {
				if (chrome.runtime.lastError) {
					logger.error(chrome.runtime.lastError);
				}
				dropZone.classList.remove("loading");
				dropZone.textContent = "Restoration Complete";
			});
		};
		r.readAsText(files);
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}