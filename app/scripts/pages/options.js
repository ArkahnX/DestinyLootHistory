tracker.sendAppView('OptionsScreen');

function backupData() {
	var backupDataButton = document.getElementById("backupData");
	chrome.storage.local.get(null, function(data) {
		var url = 'data:application/json;base64,' + btoa(JSON.stringify(data.itemChanges));
		chrome.downloads.download({
			url: url,
			filename: 'itemChanges.json'
		});
		backupDataButton.classList.remove("loading");
		backupDataButton.removeAttribute("disabled");
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	initUi();
	var uniqueId = document.getElementById("uniqueId");
	if (uniqueId) {
		if (localStorage.uniqueId !== "false") {
			uniqueId.textContent = localStorage.uniqueId;
		}
	}
	var startOnLaunchButton = document.getElementById("startOnLaunch");
	var backupDataButton = document.getElementById("backupData");
	var exportDataButton = document.getElementById("exportData");
	var exportLogsButton = document.getElementById("exportLogs");
	var minDateInput = document.getElementById("MinDate");
	if (minDateInput) {
		minDateInput.value = moment("2016-06-28T17:00:00Z").format("YYYY-MM-DDTHH:mm:ss");
	}
	var maxDateInput = document.getElementById("MaxDate");
	if (minDateInput) {
		minDateInput.value = moment("2016-07-05T09:00:00Z").format("YYYY-MM-DDTHH:mm:ss");
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
	if (minLight) {
		minLight.value = parseInt(localStorage.minLight) || minLight.value;
		minQuality.value = parseInt(localStorage.minQuality) || minQuality.value;
		minLight.addEventListener("change", handleQualityChange, false);
		minQuality.addEventListener("change", handleQualityChange, false);
		gearPerks.addEventListener("click",function(){
			loadPerksets();
			perkWindow.classList.remove("hidden");
		},false);
		savePerks.addEventListener("click",function(){
			perkWindow.classList.add("hidden");
		},false);
		additionalPerks.addEventListener("click",function(){
			perkList.innerHTML = perkList.innerHTML + `<li><fieldset>
		<label>Gear Type: <select><optgroup label="Primary Weapons"><option value="Pulse">Pulse Rifle</option><option value="Hand">Hand Cannon</option><option value="Auto">Auto Rifle</option><option value="Scout">Scout Rifle</option></optgroup><optgroup label="Special Weapons"><option value="Fusion">Fusion Rifle</option><option value="Sniper">Sniper Rifle</option><option value="Shotgun">Shotgun</option><option value="Sidearm">Sidearm</option></optgroup><optgroup label="Heavy Weapons"><option value="Machine">Machine Gun</option><option value="Rocket">Rocket Launcher</option></optgroup><optgroup label="Armor"><option value="Gauntlets">Gauntlets</option><option value="Leg">Leg Armor</option><option value="Artifact">Artifact</option><option value="Helmet">Helmet</option><option value="Chest">Chest Armor</option><option value="Ghost">Ghost Shell</option></optgroup></select></label>
		<label>Perks: <input type="text"></label>
		<label>Percent Match: <input type="number" min="1" max="100"></label>
		</fieldset></li>`;
		},false);
	}
});

function loadPerksets() {
	var perkList = document.getElementById('perkList');
	var perkSets = JSON.parse(localStorage.perkSets);
	var html = "";
	for(var perkSet of perkSets) {
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
	dropZone.classList.add("loading");
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files[0]; // FileList object.

	if (files) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			var object = JSON.parse(contents);
			chrome.storage.local.set({
				"itemChanges": object
			}, function() {
				dropZone.classList.remove("loading");
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