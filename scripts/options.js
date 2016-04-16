var Options = {
	historicalMinDate: "2016-02-09T18:00",
	historicalMaxDate: "2016-02-16T09:00",
	historicalGameMode: "None",
	currentMinDate: "2016-02-09T18:00",
	currentMaxDate: "2016-02-09T18:00",
	currentGameMode: "None",
	type: "current",
	gameConsole: 2,
	friends: ["Biomech-ArkahnX", "Clockwork--Ninja", "sociopatrolman", "Sunbun", "Caidies", "Cmaaster"],
	version: "1.2",
};

var inDOM = false;

function loadOptions(callback) {
	console.time("startLoading");
	console.time("loadOptions");
	chrome.storage.sync.get("options", function(result) {
		inDOM = typeof document.body !== "undefined";
		if (!result.options || result.options.version !== "1.2") {
			saveOptions(function() {
				optionsToHTML();
				setListeners();
				console.timeEnd("loadOptions");
				callback();
			});
		} else {
			Options = result.options;
			optionsToHTML();
			setListeners();
			console.timeEnd("loadOptions");
			callback();
		}
	});
}

function optionsToHTML() {
	if (inDOM) {
		for (var attr in Options) {
			console.log(attr)
			var element = document.querySelector("#" + attr);
			element.value = Options[attr];
			if (attr === "friends") {
				element.value = Options[attr].join(",");
			}
		}
	}
}

function HTMLToOptions() {
	if (inDOM) {
		for (var attr in Options) {
			var element = document.querySelector("#" + attr);
			Options[attr] = element.value;
			if (attr === "friends") {
				Options[attr] = element.value.split(",");
			}
		}
	}
}

function setListeners() {
	if (inDOM) {
		for (var attr in Options) {
			var element = document.querySelector("#" + attr);
			element.addEventListener("change", function(event) {
				HTMLToOptions();
				saveOptions();
			});
		}
		var element = document.querySelector("#lookupData");
		element.addEventListener("click", function(event) {
			Options.type = "historical";
			saveOptions();
			loadGameData();
		});
		var element = document.querySelector("#startTracking");
		element.addEventListener("click", function(event) {
			if (listenLoop === null) {
				Options.type = "current";
				var d = new Date();
				d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
				Options.currentMinDate = Options.currentMaxDate = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + (d.getHours() - 0)).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2);
				console.log(d, new Date(Options.currentMinDate), Options.currentMinDate)
				saveOptions();
				startListening();
			} else {
				stopListening();
			}
		});
	}
}

function saveOptions(callback) {
	chrome.storage.sync.set({
		options: Options
	}, callback);
}