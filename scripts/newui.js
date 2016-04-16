var bungie = new Bungie();

initItems(function() {
});

chrome.storage.local.get(null, function(result) {
	console.log(result)
})