tracker.sendAppView('OptionsScreen');
database.open();

function backupData() {
	var backupDataButton = document.getElementById("backupData");
	database.getMultipleStores(database.allStores).then(function(data) {
		var a = document.createElement("a");
		var file = new Blob([JSON.stringify(data.itemChanges)], {
			type: "application/json"
		});
		var url = URL.createObjectURL(file);
		a.href = url;
		a.download = 'itemChanges.json';
		document.getElementById("backupLabel").appendChild(a);
		a.click();
		setTimeout(function() {
			document.getElementById("backupLabel").removeChild(a);
			window.URL.revokeObjectURL(url);
			backupDataButton.classList.remove("loading");
			backupDataButton.removeAttribute("disabled");
		}, 0);
		// chrome.storage.local.get(null, function(data) {
		// if (chrome.runtime.lastError) {
		// console.error(chrome.runtime.lastError);
		// }
		// var url = 'data:application/json;base64,' + btoa(JSON.stringify(data.itemChanges));
		// chrome.downloads.download({
		// url: url,
		// filename: 'itemChanges.json'
		// });
	});
}

var insigniaInputs = {};
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

document.addEventListener("DOMContentLoaded", function(event) {
	initUi(elements.container);
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

	var keyTranslate = {
		name: "itemName",
		description: "itemDescription",
		hash: "itemHash",
		class: ""
	};

	var weaponPerkTranslate = {
		name: "perkName",
		description: "perkDescription",
		hash: "perkHash",
		class: "inverted"
	};
findWeaponTalentGrids();
	setupItemFields("keepSingleStackItems", itemSources, hashIndex, keyTranslate);
	setupItemFields("autoMoveItemsToVault", itemSources, hashIndex, keyTranslate);
	setupItemFields("highValuePerks", weaponPerks, weaponPerkHashList, weaponPerkTranslate);
	setupItemFields("midValuePerks", weaponPerks, weaponPerkHashList, weaponPerkTranslate);
	setupItemFields("lowValuePerks", weaponPerks, weaponPerkHashList, weaponPerkTranslate);

	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	if (dropZone) {
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleFileSelect, false);
	}
	var minLight = document.getElementById('minLight');
	var minQuality = document.getElementById('minQuality');
	var gearPerks = document.getElementById('gearPerks');
	var perkWindow = document.getElementById('perkWindow');
	var additionalPerks = document.getElementById('additionalPerks');
	var savePerks = document.getElementById('savePerks');
	var perkList = document.getElementById('perkList');
	var pgcrImage = document.getElementById('pgcrImage');
	var relativeDates = document.getElementById('relativeDates');
	var useGuardianLight = document.getElementById('useGuardianLight');
	useGuardianLight.addEventListener("change", function() {
		if (useGuardianLight.checked) {
			minLight.disabled = true;
		} else {
			minLight.disabled = false;
		}
	});

	getAllOptions().then(function(options) {
		console.log(options)
		minLight.value = options.minLight;
		minQuality.value = options.minQuality;
		minLight.addEventListener("change", handleQualityChange, false);
		if (options.useGuardianLight) {
			minLight.disabled = true;
		}
		minQuality.addEventListener("change", handleQualityChange, false);
		relativeDates.checked = options.relativeDates;
		relativeDates.addEventListener("change", handleCheckboxChange, false);
		pgcrImage.checked = options.pgcrImage;
		pgcrImage.addEventListener("change", handleCheckboxChange, false);
	});
});

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
	setOption(target.id, value);
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
			database.addFromArray("itemChanges", object).then(function() {
				// chrome.storage.local.set({
				// 	"itemChanges": object
				// }, function() {
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
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

function setupItemFields(ID, properties, hashList, translation) {
	var insigniaInput = insignia(document.getElementById(ID), {
		free: false,
		deletion: true,
		render: function render(container, item) {
			var hash = parseInt(item.data, 10);
			var data = properties[hashList.indexOf(hash)];
			container.innerHTML = `<img src="https://www.bungie.net${data.icon}" width="16" height="16" class="${translation.class}"><span>${data[translation.name]}</span>`;
			container.title = data[translation.description];
		},
		getText: function(item) {
			var hash = parseInt(item, 10);
			var data = properties[hashList.indexOf(hash)];
			return data[translation.name];
		}
	});
	insigniaInputs[ID] = insigniaInput;
	insigniaInput.on('remove', function() {
		var newArray = [];
		var oldArray = insigniaInput.value();
		for (var item of oldArray) {
			newArray.push(item);
		}
		setOption(ID, newArray);
	});
	new autoComplete({
		selector: '#' + ID,
		minChars: 0,
		delay: 500,
		source: function(term, suggest) {
			var suggestions = [];
			var suggestionList = null;
			if (term.length === 0) {
				suggestionList = properties;
			} else {
				var f = new Fuse(properties, {
					keys: [translation.name, translation.description],
					threshold: 0.1,
					distance: 1000
				});
				suggestionList = f.search(term.toLowerCase());
			}
			for (var suggestion of suggestionList) {
				if (insigniaInput.findItem("" + suggestion[translation.hash]) === null) {
					suggestions.push(suggestion);
				}
			}
			suggest(suggestions);
		},
		renderItem: function(item, search, index) {
			var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
			if (search.split(' ')[0] === "") {
				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item[translation.hash]}" data-name="${item[translation.name]}" title="${item[translation.description]}"><img src="https://www.bungie.net${item.icon}" width="32" height="32" class="${translation.class}"><span>${item[translation.name]}</span></div>`;
			} else {
				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item[translation.hash]}" data-name="${item[translation.name]}" title="${item[translation.description]}"><img src="https://www.bungie.net${item.icon}" width="32" height="32" class="${translation.class}"><span>${(item[translation.name]).replace(re, "<b>$1</b>")}</span></div>`;
			}
		},
		onSelect: function(e, term, item) {
			var hash = parseInt(item.getAttribute('data-hash'), 10);
			var data = properties[hashList.indexOf(hash)];
			console.log(`Item "${data[translation.name]} (${data[translation.description]})" selected by ${(e.type === 'keydown' ? 'pressing enter' : 'mouse click')}.`);
			if (insigniaInput.findItem(item.getAttribute('data-hash')) === null) {
				insigniaInput.addItem(item.getAttribute('data-hash'));
			}
			var newArray = [];
			var oldArray = insigniaInput.value();
			for (let item of oldArray) {
				newArray.push(item);
			}
			setOption(ID, newArray);
			if (ID === "keepSingleStackItems" || "autoMoveItemsToVault") {
				let otherInput = insigniaInput;
				let otherId = ID;
				if (ID === "keepSingleStackItems") {
					otherId = "autoMoveItemsToVault";
					otherInput = insigniaInputs.autoMoveItemsToVault;
				} else {
					otherId = "keepSingleStackItems";
					otherInput = insigniaInputs.keepSingleStackItems;
				}
				if (otherInput.findItem(item.getAttribute('data-hash')) !== null) {
					otherInput.removeItem(item.getAttribute('data-hash'));
				}
				let newArray2 = [];
				let oldArray2 = otherInput.value();
				for (let item of oldArray2) {
					newArray2.push(item);
				}
				setOption(otherId, newArray2);
			}
			if(ID === "highValuePerks" || ID === "midValuePerks" || ID === "lowValuePerks") {
				let otherInput1 = insigniaInput;
				let otherInput2 = insigniaInput;
				let otherId1 = ID;
				let otherId2 = ID;
				if (ID === "highValuePerks") {
					otherId1 = "midValuePerks";
					otherId2 = "lowValuePerks";
					otherInput1 = insigniaInputs.midValuePerks;
					otherInput2 = insigniaInputs.lowValuePerks;
				} else if (ID === "midValuePerks") {
					otherId1 = "highValuePerks";
					otherId2 = "lowValuePerks";
					otherInput1 = insigniaInputs.highValuePerks;
					otherInput2 = insigniaInputs.lowValuePerks;
				} else {
					otherId1 = "midValuePerks";
					otherId2 = "highValuePerks";
					otherInput1 = insigniaInputs.midValuePerks;
					otherInput2 = insigniaInputs.highValuePerks;
				}
				if (otherInput1.findItem(item.getAttribute('data-hash')) !== null) {
					otherInput1.removeItem(item.getAttribute('data-hash'));
				}
				if (otherInput2.findItem(item.getAttribute('data-hash')) !== null) {
					otherInput2.removeItem(item.getAttribute('data-hash'));
				}
				let newArray2 = [];
				let newArray3 = [];
				let oldArray2 = otherInput1.value();
				let oldArray3 = otherInput2.value();
				for (let item of oldArray2) {
					newArray2.push(item);
				}
				for (let item of oldArray3) {
					newArray3.push(item);
				}
				setOption(otherId1, newArray2);
				setOption(otherId2, newArray3);
			}
		}
	});

	// document.getElementById("insigificant").addEventListener('keypress', function(e) {
	// 	if (e.keyCode === 13) {
	// 		insigniaInput.refresh();
	// 		e.preventDefault(); // prevent form submission
	// 	}
	// });
	getOption(ID).then(function(value) {
		for (let item of value) {
			insigniaInput.addItem(item);
		}
	});
}

// function setupItemFields(ID) {
// 	var insigniaInput = insignia(document.getElementById(ID), {
// 		free: false,
// 		deletion: true,
// 		render: function render(container, item) {
// 			var hash = parseInt(item.data, 10);
// 			var data = itemSources[hashIndex.indexOf(hash)];
// 			container.innerHTML = `<img src="https://www.bungie.net${data.icon}" width="16" height="16"><span>${data.itemName}</span>`;
// 			container.title = data.itemDescription;
// 		},
// 		getText: function(item) {
// 			var hash = parseInt(item, 10);
// 			var data = itemSources[hashIndex.indexOf(hash)];
// 			return data.itemName;
// 		}
// 	});
// 	insigniaInputs[ID] = insigniaInput;
// 	insigniaInput.on('remove', function() {
// 		var newArray = [];
// 		var oldArray = insigniaInput.value();
// 		for (var item of oldArray) {
// 			newArray.push(item);
// 		}
// 		setOption(ID, newArray);
// 	});
// 	new autoComplete({
// 		selector: '#' + ID,
// 		minChars: 0,
// 		delay: 500,
// 		source: function(term, suggest) {
// 			var suggestions = [];
// 			var suggestionList = null;
// 			if (term.length === 0) {
// 				suggestionList = itemSources;
// 			} else {
// 				var f = new Fuse(itemSources, {
// 					keys: ['itemName', 'itemDescription'],
// 					threshold: 0.1,
// 					distance: 1000
// 				});
// 				suggestionList = f.search(term.toLowerCase());
// 			}
// 			for (var suggestion of suggestionList) {
// 				if (insigniaInput.findItem("" + suggestion.itemHash) === null) {
// 					suggestions.push(suggestion);
// 				}
// 			}
// 			suggest(suggestions);
// 		},
// 		renderItem: function(item, search, index) {
// 			var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
// 			if (search.split(' ')[0] === "") {
// 				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item.itemHash}" data-name="${item.itemName}" title="${item.itemDescription}"><img src="https://www.bungie.net${item.icon}" width="25" height="25"><span>${item.itemName}</span></div>`;
// 			} else {
// 				return `<div class="autocomplete-suggestion${index === 0 ? " selected" : ""}" data-hash="${item.itemHash}" data-name="${item.itemName}" title="${item.itemDescription}"><img src="https://www.bungie.net${item.icon}" width="25" height="25"><span>${item.itemName.replace(re, "<b>$1</b>")}</span></div>`;
// 			}
// 		},
// 		onSelect: function(e, term, item) {
// 			var hash = parseInt(item.getAttribute('data-hash'), 10);
// 			var data = itemSources[hashIndex.indexOf(hash)];
// 			console.log(`Item "${data.itemName} (${data.itemDescription})" selected by ${(e.type == 'keydown' ? 'pressing enter' : 'mouse click')}.`);
// 			if (insigniaInput.findItem(item.getAttribute('data-hash')) === null) {
// 				insigniaInput.addItem(item.getAttribute('data-hash'));
// 			}
// 			var newArray = [];
// 			var oldArray = insigniaInput.value();
// 			for (let item of oldArray) {
// 				newArray.push(item);
// 			}
// 			setOption(ID, newArray);
// 			var otherInput = insigniaInput;
// 			var otherId = ID;
// 			if (ID === "keepSingleStackItems") {
// 				otherId = "autoMoveItemsToVault";
// 				otherInput = insigniaInputs.autoMoveItemsToVault;
// 			} else {
// 				otherId = "keepSingleStackItems";
// 				otherInput = insigniaInputs.keepSingleStackItems;
// 			}
// 			if (otherInput.findItem(item.getAttribute('data-hash')) !== null) {
// 				otherInput.removeItem(item.getAttribute('data-hash'));
// 			}
// 			var newArray2 = [];
// 			var oldArray2 = otherInput.value();
// 			for (let item of oldArray2) {
// 				newArray2.push(item);
// 			}
// 			setOption(otherId, newArray2);
// 		}
// 	});

// 	// document.getElementById("insigificant").addEventListener('keypress', function(e) {
// 	// 	if (e.keyCode === 13) {
// 	// 		insigniaInput.refresh();
// 	// 		e.preventDefault(); // prevent form submission
// 	// 	}
// 	// });
// 	getOption(ID).then(function(value) {
// 		for (let item of value) {
// 			insigniaInput.addItem(item);
// 		}
// 	});
// }