var manifest = chrome.runtime.getManifest();
if (manifest.key) {
	window.console.time = function() {};
	window.console.timeEnd = function() {};
}

function appClicked() {
	var appUrl = chrome.extension.getURL('index.html');
	chrome.tabs.create({
		url: appUrl
	});
}

function init() {
	if (bungie) {
		chrome.storage.local.get(null, function(result) {
			console.log(result);
		});


		chrome.browserAction.onClicked.addListener(appClicked);
		initItems(function() {
			beginBackendTracking();
		});
	} else {
		setTimeout(init, 50);
	}
}
setTimeout(init, 50);