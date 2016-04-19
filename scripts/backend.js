(function() {
	// Instance specific extension URL
	var appUrl = chrome.extension.getURL('newui.html');

	function appClicked() {
		chrome.tabs.create({
			url: appUrl
		});
	}

	chrome.browserAction.onClicked.addListener(appClicked);
})();