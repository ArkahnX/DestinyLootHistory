var notification = (function() {
	let active = true;
	let container = document.getElementById("notification");
	let text = document.getElementById("notification-text");

	function show(content) {
		active = false;
		if (!content) {
			active = true;
			container.classList.add("error");
		} else {
			container.classList.remove("error");
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

	let manifest = chrome.runtime.getManifest();
	const changelog = `New in ${manifest.version}:<br>
<ul>
	<li>If the extension encounters an issue (Red exclamation point on the icon) please reslove the issue, then click "Begin Tracking"</li>
	<li>New: Automatically lock items that are high quality or high light. (<a href="options.html">Setup</a>)</li>
	<li>Quick toggles for three of coins and auto locking in on the front page.</li>
	<li>If you encounter issues, please use the "<a href="debug.html">Report Issue</a>" feature.</li>
</ul>`;

	localStorage.notificationClosed = localStorage.notificationClosed || "true";
	if (localStorage.notificationClosed === "false") {
		show(changelog);
	} else {
		hide();
	}

	container.addEventListener("click", function() {
		active = false;
		container.style.top = ((container.offsetHeight + 5) * -1) + "px";
		if (container.classList.contains("error") === false) {
			localStorage.notificationClosed = "true";
		}
		container.classList.remove("error");
	}, true);

	return {
		hide,
		show,
		changelog
	};
}());