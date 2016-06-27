var NO_DEBUG = true;

function backupHistory() {
	chrome.permissions.contains({
		permissions: ['downloads']
	}, function(result) {
		if (result) {
			_backup();
		} else {
			chrome.permissions.request({
				permissions: ['downloads']
			}, function(granted) {
				if (granted) {
					_backup();
				}
			});
		}
	});
	setTimeout(backupHistory, 1000 * 60 * 30);
}

function _backup() {
	chrome.storage.local.get(null, function(data) {
		var url = 'data:application/json;base64,' + btoa(JSON.stringify(data.itemChanges));
		chrome.downloads.download({
			url: url,
			filename: `itemChanges-${moment().format("YYYY-MM-DD_hh-mm-A")}.json`
		});
	});
}

function appClicked() {
	var appUrl = chrome.extension.getURL('index.html');
	chrome.tabs.create({
		url: appUrl
	});
}

function init() {
	if (bungie) {
		var manifest = chrome.runtime.getManifest();
		if (!manifest.key) {
			backupHistory();
		}
		logger.init().then(function() {
			initItems(function() {
				beginBackendTracking();
			});
		});
	} else {
		setTimeout(init, 50);
	}
}
setTimeout(init, 50);
chrome.storage.local.get(null, function(result) {
	console.log(result);
	logger.startLogging("backend");
	logger.info(result);
});
chrome.browserAction.onClicked.addListener(appClicked);