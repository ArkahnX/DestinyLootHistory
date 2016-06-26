var NO_DEBUG = true;
var manifest = chrome.runtime.getManifest();
if (localStorage.characterDescriptions) {
	characterDescriptions = JSON.parse(localStorage.characterDescriptions); // FIXME error with no value
}
logger.disable();
initUi();
checkForUpdates();

chrome.storage.local.get(null, function(result) {
	console.log(result);
});