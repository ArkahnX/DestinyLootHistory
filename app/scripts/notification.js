var notification = (function() {
	let active = true;
	let container = document.getElementById("notification");
	let text = document.getElementById("notification-text");

	function show(content) {
		if (content && container.style.top === "0px") {
			return false;
		}
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
	<li>Got problems or suggestions? <a href="https://www.reddit.com/message/compose/?to=ArkahnX" target="_blank">Message ArkahnX</a> on Reddit!</li>
	<li><a href="http://imgur.com/a/ufCMc" target="_blank">Gallery of new features.</a></li>
	<li>New "<a href="productivity.html" target="_blank">Productivity</a>" page, see your destiny inventory changes in a day, a week, or more.</li>
	<li>New "<a href="search.html" target="_blank">Search</a>" page, new "<a href="test.html" target="_blank">Inventory</a>" page</li>
	<li>New "<a href="collection.html" target="_blank">Collections</a>" page, discover what you might be missing from your collection, and where to obtain it.</li>
	<li><a href="https://goo.gl/forms/vWNJpb849ZmtL8c03">Answer a two question survey to help direct the next version of destiny Loot History!</a></li>
</ul>`;

	localStorage.notificationClosed = localStorage.notificationClosed || "true";
	if (localStorage.notificationClosed === "false") {
		show(changelog);
	} else {
		hide();
	}

	container.addEventListener("click", function(event) {
		if (event.target.nodeName !== "A") {
			active = false;
			container.style.top = ((container.offsetHeight + 5) * -1) + "px";
			if (container.classList.contains("error") === false) {
				localStorage.notificationClosed = "true";
			}
			container.classList.remove("error");
		}
	}, true);

	return {
		hide,
		show,
		changelog
	};
}());