var notification = (function() {
	let manifest = chrome.runtime.getManifest();
	let changelog = `New in ${manifest.version}:<br>
<ul>
	<li>Clickable notifications.</li>
	<li>Item perks.</li>
</ul>`;

	let active = false;
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
		hide();
	}, true);

	function show(content) {
		if (!active) {
			active = true;
			if (!content) {
				container.classList.add("error");
			}
			text.innerHTML = content || localStorage.errorMessage;
			// container.classList.add("live");
			container.style.top = "0px";
		}
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