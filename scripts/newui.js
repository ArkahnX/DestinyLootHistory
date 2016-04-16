var bungie = new Bungie();

initItems(function() {
	initUi();
});

chrome.storage.local.get(null, function(result) {
	console.log(result)
})