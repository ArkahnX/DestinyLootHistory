var notification = (function() {
	let manifest = chrome.runtime.getManifest();
	let changelog = `New in ${manifest.version}:<br>
<ul>
	<li>Three of coins notification at the start of each activity. Can be toggled.</li>
	<li>Users of multiple consoles should be able to see a toggle to swap their console. I don't have an easy way to test, so please report any issues.</li>
	<li>Fixed weird bug with no items being tracked. Please let me know ASAP if the app stops reporting item drops. (With a log link attached please!)</li>
	<li>Use the "Report Issue" button to create logs.</li>
</ul>`;

	let active = true;
	localStorage.notificationClosed = localStorage.notificationClosed || "true";
	let container = document.getElementById("notification");
	let text = document.getElementById("notification-text");

	if (localStorage.version !== manifest.version) {
		localStorage.version = manifest.version;
		localStorage.notificationClosed = "false";
	}
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