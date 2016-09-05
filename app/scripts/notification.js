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
		text.innerHTML = content || localStorage.errorMessage + '<br />Please click "Restart Tracking" to try again.';
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
	<li>Got problems or suggestions? <a href="https://www.reddit.com/message/compose/?to=ArkahnX">Message ArkahnX</a> on Reddit!</li>
	<li><a href="http://imgur.com/a/QGLZf">Gallery of new features.</a></li>
	<li>New "<a href="collection.html">Collections</a>" page, discover what you might be missing from your collection, and where to obtain it.</li>
	<li>New comparison feature, the tooltip on the right now displays duplicates of the gear you are inspecting.</li>
	<li>And more! Check out the gallery for the full details.</li>
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