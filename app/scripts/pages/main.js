tracker.sendAppView('MainScreen');
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

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-77020265-2', 'auto');
ga('set', 'checkProtocolTask', null);
ga('send', 'pageview');