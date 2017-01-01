var notification = (function() {
	let active = true;
	let container = document.getElementById("notification");
	let closeButton = document.getElementById("notification-close");
	let icon = document.getElementById("notification-icon");

	function show() {
		container.classList.add("live");
		icon.children[0].classList.remove("fa-envelope");
		icon.children[0].classList.add("fa-envelope-o");
		localStorage.notificationClosed = "true";
		icon.dataset.title = "Notifications";
		icon.classList.remove("green");
	}

	function hide() {
		container.classList.remove("live");
	}

	function update() {
		localStorage.notificationClosed = localStorage.notificationClosed || "true";
		if (localStorage.notificationClosed === "false") {
			icon.children[0].classList.remove("fa-envelope-o");
			icon.children[0].classList.add("fa-envelope");
			icon.dataset.title = "Unread Notifications";
			icon.classList.add("green");
		}
	}

	update();

	closeButton.addEventListener("click", function() {
		hide();
	}, true);

	return {
		update,
		hide,
		show
	};
}());