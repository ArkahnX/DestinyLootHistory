tracker.sendAppView('BackgroundScreen');
var globalOptions = {};

function _backup() {
	database.getAllEntries("itemChanges").then(function(data) {
		// chrome.storage.local.get(null, function(data) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		var url = 'data:application/json;base64,' + btoa(JSON.stringify(data.itemChanges));
		// chrome.downloads.download({
		// 	url: url,
		// 	filename: `itemChanges-${moment().format("YYYY-MM-DD_hh-mm-A")}.json`
		// });
	});
}
getAllOptions().then(function(options) {
	globalOptions = options;
});

/**
 * Dev function to backup itemChanges.json on background load as well as every 30 minutes.
 * This function spawned because of an error which erased my item history, and I didn't want to take any more chances.
 * Only works on non- webstore installs, ie, developer builds.
 */
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

function appClicked() {
	var appUrl = chrome.extension.getURL('index.html');
	chrome.tabs.create({
		url: appUrl
	});
}

function init() {
	if (bungie) {
		chrome.cookies.getAll({
			domain: "www.bungie.net"
		}, function initCookies(result) {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError)
				setTimeout(init, 1000);
			} else {
				var manifest = chrome.runtime.getManifest();
				// If we have no key, this means this extension is not a webstore install, so we should back up live data, just in case.
				if (!manifest.key) {
					backupHistory();
				}
				initializeStoredVariables().then(function() {
					// Found in logger.js used to store logs. These logs are accessed via debug.html and display the running state of my application. I request users having issues to send me their debug logs.
					logger.init().then(function() {
						// found in timers.js
						startTimer("activityTracker", 50);
					});
				});
				startTimer("extensionIcon");
			}
		});
	} else {
		setTimeout(init, 1000);
	}
}
/**
 * STEP 1
 * This is the starting point for my application.
 * Wait two seconds for the chrome cookies database to load.
 */
// setTimeout(init, 50);
// logging some backend data. Saved my butt during the issue that deleted my saved data.
database.open().then(function() {
	database.getMultipleStores(database.allStores).then(function(result) {
		// chrome.storage.local.get(null, function(result) {
		if (chrome.runtime.lastError) {
			logger.error(chrome.runtime.lastError);
		}
		logger.startLogging("Backend");
		logger.info(result);
		init();
	});
});

// When the user clicks the chrome extension icon (Exotic Helmet) use the appClicked function (Found above)
chrome.browserAction.onClicked.addListener(appClicked);