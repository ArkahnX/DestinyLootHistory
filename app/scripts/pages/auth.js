document.getElementById("bungieLoginButton").setAttribute("HREF", AUTH_URL);
tracker.sendEvent('Auth', 'Open', "True");
if (location.search.length && location.search.split("=")[1]) {
	document.getElementById("bungieLoginButton").setAttribute("disabled", true);
	document.getElementById("bungieLoginButton").value = "Processing Data...";
	chrome.runtime.sendMessage({
		authCode: location.search.split("=")[1]
	});
	tracker.sendEvent('Auth', 'Login', "True");
} else if (location.hash === "#login") {
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
		backgroundPage.stopTimer("extensionIcon");
		backgroundPage.stopTimer("activityTracker");
		backgroundPage.stopTimer("inventoryCheck");
		chrome.storage.sync.remove(["authCode", "accessToken", "refreshToken"]);
		localStorage.characterDescriptions = "{}";
		localStorage.systems = "{}";
		localStorage.threeOfCoinsProgress = "{}";
	});
} else if (location.hash === "#logout") {
	tracker.sendEvent('Auth', 'Logout', "Page");
	// location.href = "auth.html#login";
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
		backgroundPage.stopTimer("extensionIcon");
		backgroundPage.stopTimer("activityTracker");
		backgroundPage.stopTimer("inventoryCheck");
		chrome.storage.sync.remove(["authCode", "accessToken", "refreshToken"]);
		localStorage.characterDescriptions = "{}";
		localStorage.systems = "{}";
		localStorage.threeOfCoinsProgress = "{}";
		backgroundPage.location.reload();
		window.close();
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.loggedIn) {
		tracker.sendEvent('Auth', 'Redirect', "True");
		location.href = "index.html";
	}
});