var bungie = new Bungie();
var manifest = chrome.runtime.getManifest();
if (manifest.key) {
	window['console']['time'] = function() {};
	window['console']['timeEnd'] = function() {};
}
(function() {
	chrome.storage.local.get(null, function(result) {
			console.log(result)
		})
		// Instance specific extension URL
	var appUrl = chrome.extension.getURL('index.html');

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