var notification = (function() {
	let manifest = chrome.runtime.getManifest();
	let changelog = `New in ${manifest.version}:<br>
<ul>
	<li>This extension may need to be limited as Bungie has reached out to me indicating that it is causing excess wear on their servers.</li>
	<li>I am currently working with Bungie to determine the best course of action.</li>
	<li>Tracking has been reduced, and may be stopped entirely if further action needs to be taken.</li>
	<li>Sorry for the inconvinience, and thank you for your patience and support.</li>
</ul>`;

	let active = true;
	localStorage.notificationClosed = localStorage.notificationClosed || "true";
	let container = document.getElementById("notification");
	let text = document.getElementById("notification-text");
	var localVersion = localStorage.version.split(".");
	var manifestVersion = manifest.version.split(".");
	if (localVersion[0] !== manifestVersion[0] || localVersion[1] !== manifestVersion[1]) {
		localStorage.notificationClosed = "false";
	}
	localStorage.version = manifest.version;
	if (localStorage.notificationClosed === "false") {
		show(changelog);
	} else {
		hide();
	}

	container.addEventListener("click", function() {
		active = false;
		container.style.top = ((container.offsetHeight + 5) * -1) + "px";
		container.classList.remove("error");
		localStorage.notificationClosed = "true";
	}, true);

	function show(content) {
		active = false;
		if (!content) {
			active = true;
			container.classList.add("error");
		}
		text.innerHTML = content || localStorage.errorMessage;
		// container.classList.add("live");
		container.style.top = "0px";
	}

	function hide() {
		if (active) {
			active = false;
			container.style.top = ((container.offsetHeight + 5) * -1) + "px";
			container.classList.remove("error");
		}
	}

	return {
		hide: hide,
		show: show
	};
}());