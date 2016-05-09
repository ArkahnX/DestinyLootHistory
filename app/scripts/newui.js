var bungie = new Bungie();

// initItems(function() {
	// 	startListening();
	initUi();
	checkForUpdates();
// });

chrome.storage.local.get(null, function(result) {
	console.log(result)
})