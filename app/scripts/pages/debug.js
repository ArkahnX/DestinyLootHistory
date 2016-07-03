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
	var sizeHolder = document.getElementById("size");
	var exportButton = document.getElementById("exportLogs");
	var tags = logger.getAllTags();
	for (var tag of tags) {
		var optionElement = document.createElement("option");
		optionElement.textContent = tag;
		optionElement.value = tag;
		optionElement.selected = true;
		tagHolder.appendChild(optionElement);
	}
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
			outPutArea.textContent = trimmed + "\n" + JSON.stringify();
			// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
			var m = encodeURIComponent(trimmed).match(/%[89ABab]/g);
			var bytes = trimmed.length + (m ? m.length : 0);
			var rounded = +(Math.round((bytes/1000) + "e+2")  + "e-2")
			sizeHolder.textContent = `${rounded} KB`;
		});
	});
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-77020265-2']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();