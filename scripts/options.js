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
		
	}
}

function saveOptions(callback) {
	chrome.storage.sync.set({
		options: Options
	}, callback);
}