tracker.sendAppView('DebugScreen');
logger.disable();
logger.init().then(function debugInit() {
	var outPutArea = document.getElementById("logOutput");
	var logOption = document.getElementById("showLog");
	var infoOption = document.getElementById("showInfo");
	var warnOption = document.getElementById("showWarn");
	var errorOption = document.getElementById("showError");
	var timeOption = document.getElementById("showTime");
	var tagHolder = document.getElementById("tags");
	var sizeHolders = document.querySelectorAll("size");
	var exportButtons = document.querySelectorAll(".exportLogs");
	var tags = logger.getAllTags();
	for (var tag of tags) {
		var optionElement = document.createElement("option");
		optionElement.textContent = tag;
		optionElement.value = tag;
		optionElement.selected = true;
		tagHolder.appendChild(optionElement);
	}
	for (var exportButton of exportButtons) {
		exportButton.addEventListener("click", function exportDebug() {
			var selectedTags = [];
			for (var child of tagHolder.children) {
				if (child.selected) {
					selectedTags.push(child.value);
				}
			}
			if (selectedTags.length === 0 || selectedTags.indexOf("all") > -1) {
				selectedTags = false;
			}
			logger.returnLogs(selectedTags, logOption.checked, infoOption.checked, warnOption.checked, errorOption.checked, timeOption.checked).then(function(output) {
				var trimmed = output.trim();
				outPutArea.textContent = trimmed;
				// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
				var m = encodeURIComponent(trimmed).match(/%[89ABab]/g);
				var bytes = trimmed.length + (m ? m.length : 0);
				var rounded = +(Math.round((bytes / 1000) + "e+2") + "e-2");
				for (var sizeHolder of sizeHolders) {
					sizeHolder.textContent = `${rounded} KB`;
				}
				outPutArea.classList.remove("hidden");
			});
		});
	}
});