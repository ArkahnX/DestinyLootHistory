var bungie = new Bungie();
var manifest = chrome.runtime.getManifest();
if (manifest.key) {
	window['console']['time'] = function() {};
	window['console']['timeEnd'] = function() {};
}
characterDescriptions = JSON.parse(localStorage["characterDescriptions"]);
initUi();
checkForUpdates();

chrome.storage.local.get(null, function(result) {
	console.log(result)
})