document.addEventListener("DOMContentLoaded", function loaded() {
	logger.startLogging("debug")
	var outPutArea = document.getElementById("logOutput");
	var logOption = document.getElementById("showLog");
	var infoOption = document.getElementById("showInfo");
	var warnOption = document.getElementById("showWarn");
	var errorOption = document.getElementById("showError");
	var timeOption = document.getElementById("showTime");
	var tagHolder = document.getElementById("tags");
	var exportButton = document.getElementById("exportLogs");
	var tags = logger.getAllTags();
	for(var tag of tags) {
		var optionElement = document.createElement("option");
		optionElement.textContent = tag;
		optionElement.value = tag;
		optionElement.selected = true;
		tagHolder.appendChild(optionElement);
		logger.log(tag)
	}
	exportButton.addEventListener("click",function() {
		logger.startLogging("export")
		var selectedTags = [];
		for(var child of tagHolder.children) {
			if(child.selected) {
				selectedTags.push(child.value);
			}
		}
		logger.log(`tags length ${tags.length}`);
		if(selectedTags.length === 0) {
			selectedTags = false;
		}
		var output = logger.returnLogs(selectedTags, logOption.checked, infoOption.checked, warnOption.checked, errorOption.checked,timeOption.checked);
		outPutArea.textContent = output;
	});
});