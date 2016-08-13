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
	<li>Most issues can be resolved by following steps in the "<a href="debug.html">Report Issue</a>" page.</li>
	<li>Quick toggles for three of coins and auto locking in on the front page.</li>
	<li>New: <a href="vendors.html">Vendors</a> page under "Features". Browse vendors and compare them. <br />Example: Compare the Guardian Outfitter against the Emblem Kiosk to see missing emblems.</li>
	<li>New: <a href="options.html">Options</a> to move excess consumables and materials to the vault. Name the items you want to move, set a maximum stack size, and the extension will take care of the rest.</li>
	<li>New: <a href="https://www.reddit.com/r/DestinyLootHistory/">Destiny Loot History subreddit</a>, post suggestions, issues and more here. Also a great source to view patch notes.</li>
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