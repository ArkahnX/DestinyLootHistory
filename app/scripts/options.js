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
	})
}

document.addEventListener("DOMContentLoaded", function(event) {
	var startOnLaunchButton = document.getElementById("startOnLaunch");
	var backupDataButton = document.getElementById("backupData");
	var exportDataButton = document.getElementById("exportData");
	var closeOptions = document.getElementById("closeOptions");
	closeOptions.addEventListener("click", function() {
		window.location.href = chrome.extension.getURL('newui.html');
	});
	backupDataButton.addEventListener("click", function() {
		chrome.permissions.contains({
			permissions: ['downloads']
		}, function(result) {
			if (result) {
				// The extension has the permissions.
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
	exportDataButton.addEventListener("click", function() {
		exportDataButton.classList.add("loading");
		exportDataButton.setAttribute("disabled", true);
		exportData();
	});

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
			}
			r.readAsText(files);
		}
	}

	function handleDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}

	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
});