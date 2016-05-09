var bungie = new Bungie();
(function() {
	chrome.storage.local.get(null, function(result) {
			console.log(result)
		})
		// Instance specific extension URL
	var appUrl = chrome.extension.getURL('newui.html');

	function appClicked() {
		chrome.tabs.create({
			url: appUrl
		});
	}

	chrome.browserAction.onClicked.addListener(appClicked);
	initItems(function() {
		beginBackendTracking();
	});
})();