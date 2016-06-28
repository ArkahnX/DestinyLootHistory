var notification = (function() {
	let manifest = chrome.runtime.getManifest();
	let changelog = `New in ${manifest.version}:<br>
<ul>
	<li>If possible, Three of Coins will be transferred to your primary character after each activity completion.</li>
	<li>We can't generate Three of Coins from thin air. If you don't own any, we can't transfer them.</li>
	<li>Partial fix for issues where guardians had full inventories or full vaults. If you are still having issues, please <a href="debug.html">send me your logs</a>.</li>
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