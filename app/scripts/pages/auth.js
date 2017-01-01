document.getElementById("bungieLoginButton").setAttribute("HREF", AUTH_URL);
if (location.search.length && location.search.split("=")[1]) {
	document.getElementById("bungieLoginButton").setAttribute("disabled", true);
	document.getElementById("bungieLoginButton").value = "Processing Data...";
	chrome.runtime.sendMessage({
		authCode: location.search.split("=")[1]
	});
} else if (location.hash === "#login") {

} else if (location.hash === "#logout") {
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
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.loggedIn) {
		location.href = "index.html";
	}
});