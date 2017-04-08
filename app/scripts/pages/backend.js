tracker.sendAppView('BackgroundScreen');

function _backup() {
	database.getAllEntries("itemChanges").then(function ( /*data*/ ) {
		// chrome.storage.local.get(null, function(data) {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
		}
		// var url = 'data:application/json;base64,' + btoa(JSON.stringify(itemChanges));
		// chrome.downloads.download({
		// 	url: url,
		// 	filename: `itemChanges-${moment().format("YYYY-MM-DD_hh-mm-A")}.json`
		// });
	});
}
getAllOptions().then(function (options) {
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
	}, function (result) {
		if (result) {
			_backup();
		} else {
			chrome.permissions.request({
				permissions: ['downloads']
			}, function (granted) {
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
		}, function initCookies() {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError);
				setTimeout(init, 1000);
			} else {
				// If we have no key, this means this extension is not a webstore install, so we should back up live data, just in case.
				if (DEBUG) {
					backupHistory();
				}
				initializeStoredVariables().then(function () {
					// found in timers.js
					startTimer("activityTracker", 50);
				});
				startTimer("extensionIcon");
			}
		});
	} else {
		setTimeout(init, 1000);
	}
}

function bungiePOST(url, data) {
	return new Promise(function (resolve) {
		let r = new XMLHttpRequest();
		r.open("POST", url, true);
		r.setRequestHeader('X-API-Key', API_KEY);
		r.onreadystatechange = function () {
			if (r.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					resolve(JSON.parse(this.response));
				}
			}
		};
		r.send(JSON.stringify(data));
	});
}

function generateTokens(code) {
	return bungiePOST("https://www.bungie.net/Platform/App/GetAccessTokensFromCode/", {
		"code": code
	});
}

/**
 * STEP 1
 * This is the starting point for my application.
 * Wait two seconds for the chrome cookies database to load.
 */
// setTimeout(init, 50);
// logging some backend data. Saved my butt during the issue that deleted my saved data.
database.open().then(function () {
	database.getMultipleStores(database.allStores).then(function (result) {
		// chrome.storage.local.get(null, function(result) {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
		}
		console.info(result);
		chrome.storage.sync.get(["authCode", "accessToken", "refreshToken"], function (tokens) {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError);
			}
			console.log(tokens);
			if (Object.keys(tokens).length === 3) {
				globalTokens = tokens;
				// refreshAccessToken();
				// bungie.refreshAccessToken(globalTokens).then(init);
				init();
			} else {
				chrome.tabs.create({
					active: true,
					url: chrome.extension.getURL("auth.html")
				});
			}
		});
		// init();
	});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.authCode) {
		generateTokens(request.authCode).then(function (response) {
			var tokens = {
				authCode: request.authCode
			};
			if (response.Response.accessToken && response.Response.refreshToken) {
				console.log(response);
				tokens.accessToken = {
					value: response.Response.accessToken.value,
					readyin: new Date().getTime() + (response.Response.accessToken.readyin * 1000),
					expires: new Date().getTime() + (response.Response.accessToken.expires * 1000),
					added: new Date().getTime()
				};
				tokens.refreshToken = {
					value: response.Response.refreshToken.value,
					readyin: new Date().getTime() + (response.Response.refreshToken.readyin * 1000),
					expires: new Date().getTime() + (response.Response.refreshToken.expires * 1000),
					added: new Date().getTime()
				};
				globalTokens = tokens;
				chrome.storage.sync.set(tokens, function () {
					chrome.runtime.sendMessage({
						loggedIn: true
					});
					// bungie.refreshAccessToken(globalTokens).then(init);
					init();
				});
			}
		});
	}
});

// When the user clicks the chrome extension icon (Exotic Helmet) use the appClicked function (Found above)
chrome.browserAction.onClicked.addListener(appClicked);