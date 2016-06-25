var notification = (function() {
	let manifest = chrome.runtime.getManifest();
	let changelog = `New in ${manifest.version}:<br>
<ul>
	<li>Clickable notifications.</li>
	<li>Item perks.</li>
	<li>Ghosts show material detector.</li>
	<li>Ghosts show guardian and minion icons.</li>
</ul>`;

	let active = true;
	localStorage.notificationClosed = localStorage.notificationClosed || "true";
	let container = document.getElementById("notification");
	let text = document.getElementById("notification-text");

	if (localStorage.version !== manifest.version) {
		localStorage.version = manifest.version;
		localStorage.notificationClosed = "false";
	}
	console.log(active,localStorage.notificationClosed)
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