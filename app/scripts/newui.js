var bungie = new Bungie();
consoleLog.disable();
// initItems(function() {
	// 	startListening();
	characterDescriptions = JSON.parse(localStorage["characterDescriptions"]);
	initUi();
	checkForUpdates();
// });

chrome.storage.local.get(null, function(result) {
	console.log(result)
})