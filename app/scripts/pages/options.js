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
	var autoLock = document.getElementById('autoLock');
	var track3oC = document.getElementById('track3oC');
	if (minLight) {
		autoLock.checked = localStorage.autoLock === "true";
		autoLock.addEventListener("change",handleCheckboxChange,false);
		track3oC.checked = localStorage.track3oC === "true";
		track3oC.addEventListener("change",handleCheckboxChange,false);
		minLight.value = parseInt(localStorage.minLight) || minLight.value;
		minQuality.value = parseInt(localStorage.minQuality) || minQuality.value;
		minLight.addEventListener("change", handleQualityChange, false);
		minQuality.addEventListener("change", handleQualityChange, false);
	}

});

function handleCheckboxChange(event) {
	localStorage[event.target.id] = event.target.checked;
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