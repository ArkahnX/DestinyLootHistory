tracker.sendAppView('SearchScreen');
logger.disable();
var manifest = chrome.runtime.getManifest();
characterDescriptions = JSON.parse(localStorage.characterDescriptions);
var searchTypes = ["itemName", "itemTypeName", "itemDescription", "tierTypeName", "damageTypeName", "primaryStat"];

var globalOptions = {};

getAllOptions().then(function(options) {
	globalOptions = options;
});

var uniqueId = 0;
var searchTerms = [];

function nameTypes() {
	var select = document.createElement("select");
	select.classList.add("nameType");
	var itemName = document.createElement("option");
	itemName.setAttribute("value", "itemName");
	itemName.setAttribute("selected", "true");
	itemName.textContent = "Name";
	select.appendChild(itemName);
	var itemTypeName = document.createElement("option");
	itemTypeName.setAttribute("value", "itemTypeName");
	itemTypeName.textContent = "Item Type";
	select.appendChild(itemTypeName);
	var itemDescription = document.createElement("option");
	itemDescription.setAttribute("value", "itemDescription");
	itemDescription.textContent = "Description";
	select.appendChild(itemDescription);
	var tierTypeName = document.createElement("option");
	tierTypeName.setAttribute("value", "tierTypeName");
	tierTypeName.textContent = "Rarity";
	select.appendChild(tierTypeName);
	var element = document.createElement("option");
	element.setAttribute("value", "element");
	element.textContent = "Damage Type";
	select.appendChild(element);
	var light = document.createElement("option");
	light.setAttribute("value", "light");
	light.textContent = "Light Level";
	select.appendChild(light);
	return select;
}

function addSearchTerm() {
	var searchTermsContainer = document.getElementById("searchTerms");
	var ID = searchTerms.length;
	var li = document.createElement("li");
	li.dataset.id = uniqueId;
	li.appendChild(nameTypes());
	var nameBox = document.createElement("input");
	nameBox.classList.add("nameBox");
	nameBox.setAttribute("type", "text");
	nameBox.setAttribute("placeholder", "Search Term");
	li.appendChild(nameBox);
	var select = document.createElement("select");
	select.classList.add("termType");
	var add = document.createElement("option");
	add.setAttribute("value", "added");
	add.setAttribute("selected", "true");
	add.textContent = "Added";
	select.appendChild(add);
	var remove = document.createElement("option");
	remove.setAttribute("value", "removed");
	remove.textContent = "Removed";
	select.appendChild(remove);
	var both = document.createElement("option");
	both.setAttribute("value", "both");
	both.textContent = "Both";
	select.appendChild(both);
	li.appendChild(select);
	var removeSearchTerm = document.createElement("input");
	removeSearchTerm.classList.add("removeSearchTerm");
	removeSearchTerm.setAttribute("type", "button");
	removeSearchTerm.setAttribute("value", "Remove Term");
	li.appendChild(removeSearchTerm);
	searchTermsContainer.appendChild(li);
	searchTerms.push({
		id: uniqueId,
		type: "added",
		property: "itemName",
		item: ""
	});
	uniqueId++;
	addListeners();
}

document.addEventListener("DOMContentLoaded", function(event) {
	database.open().then(function() {
		database.getMultipleStores(database.allStores).then(function(result) {
			// chrome.storage.local.get(null, function(result) {
			console.log(result);
		});

		// document.getElementById("addSearchTerm").addEventListener("click", addSearchTerm);
		// document.getElementById("searchButton").addEventListener("click", handleSearch);
		// addSearchTerm();
		initUi();
		database.getAllEntries("itemChanges").then(function chromeStorageGet(localData) {
			// chrome.storage.local.get("itemChanges", function chromeStorageGet(localData) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			currentItemSet = localData.itemChanges;
			pageQuantity = currentItemSet.length;
			console.log(window.performance.now(), "New Node")
			displayResults(false, true).then(function() {
				var dataNodes = document.querySelectorAll(".item-container div:first-child");
				console.log(window.performance.now(), "New Node");
				// for (var node of dataNodes) {
				// 	var parentIndex = node.parentNode.parentNode.dataset.index;
				// 	var parentNodes = document.querySelectorAll("[data-index='" + parentIndex + "']");
				// 	for (var type of searchTypes) {
				// 		console.log(window.performance.now(), type)
				// 		var nodeValue = node.dataset[type] && node.dataset[type].replace(/(\r\n|\n|\r)/gm, " ") || "";
				// 		for (var parentNode of parentNodes) {
				// 			if (!parentNode.dataset[type]) {
				// 				parentNode.dataset[type] = "";
				// 			}
				// 			if (parentNode.dataset[type].indexOf(nodeValue) === -1) {
				// 				parentNode.dataset[type] += " | " + nodeValue.toLowerCase();
				// 			}
				// 		}
				// 	}
				// }
				document.getElementById("status").classList.remove("active");
				var searchElement = document.querySelector('#jetsSearch');
				var searchTimeout = null;
				searchElement.removeAttribute("disabled");
				searchElement.setAttribute("placeholder", "Enter a search term");
				searchElement.addEventListener("keyup", function() {
					clearTimeout(searchTimeout);
					searchTimeout = setTimeout(searchResults, 300);
				}, false);
			});
		});
	});
});

function camelCaseToDash(myStr) {
	return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function searchResults() {
	var searchElement = document.querySelector('#jetsSearch');
	var searchStyle = document.querySelector('#searchStyle');
	var searchType = document.getElementById("searchType");
	var searchValue = searchElement.value;
	console.log(searchValue);
	searchStyle.textContent = `.main-section > :not([data-${camelCaseToDash(searchType.value)}*="${searchValue.toLowerCase()}"]){ display:none; }`;
}

function removeSearchTerms(e) {
	var ID = parseInt(e.target.parentNode.dataset.id, 10);
	for (var i = searchTerms.length - 1; i > -1; i--) {
		if (searchTerms[i].id === ID) {
			searchTerms.splice(i, 1);
			break;
		}
	}
	e.target.parentNode.parentNode.removeChild(e.target.parentNode);
	document.getElementById("container").style.height = "calc(100% - " + (document.getElementById("status").clientHeight + 32) + "px)";
}

function updateSearchTerm(e) {
	var ID = parseInt(e.target.parentNode.dataset.id, 10);
	for (var i = searchTerms.length - 1; i > -1; i--) {
		if (searchTerms[i].id === ID) {
			if (e.target.nodeName === "INPUT") {
				searchTerms[i].item = e.target.value;
			} else {
				if (e.target.classList.contains("termType")) {
					searchTerms[i].type = e.target.value;
				} else {
					searchTerms[i].property = e.target.value;
				}
			}
			break;
		}
	}
}

function addListeners() {
	var nameBox = document.querySelectorAll(".nameBox");
	var searchTermType = document.querySelectorAll(".termType");
	var nameType = document.querySelectorAll(".nameType");
	var removeSearchTerm = document.querySelectorAll(".removeSearchTerm");
	document.getElementById("container").style.height = "calc(100% - " + (document.getElementById("status").clientHeight + 32) + "px)";
	if (removeSearchTerm.length) {
		for (let item of removeSearchTerm) {
			item.removeEventListener("click", removeSearchTerms);
			item.addEventListener("click", removeSearchTerms);
		}
	}
	if (nameBox.length) {
		for (let item of nameBox) {
			item.removeEventListener("keyup", updateSearchTerm);
			item.addEventListener("keyup", updateSearchTerm);
		}
	}
	if (searchTermType.length) {
		for (let item of searchTermType) {
			item.removeEventListener("change", updateSearchTerm);
			item.addEventListener("change", updateSearchTerm);
		}
	}
	if (nameType.length) {
		for (let item of nameType) {
			item.removeEventListener("change", updateSearchTerm);
			item.addEventListener("change", updateSearchTerm);
		}
	}
}

function loadScript(scriptName, id) {
	return new Promise(function(resolve, reject) {
		if (document.getElementById(id)) {
			resolve();
		} else {
			var script = document.createElement("script");
			script.id = id;
			script.onload = resolve;
			script.src = scriptName;
			document.body.appendChild(script);
		}
	});
}

function handleSearch() {
	document.getElementById("status").classList.add("active");
	document.getElementById("status").classList.remove("idle");
	var searchResults = [];
	// var terms = 0;
	loadScript("DestinyDatabase/DestinyHistoricalItemDefinition.js", "DestinyHistoricalItemDefinition").then(function() {
		loadScript("DestinyDatabase/DestinyCompactItemDefinition.js", "DestinyCompactItemDefinition").then(function() {
			loadScript("DestinyDatabase/DestinyCompactDefinition.js", "DestinyCompactDefinition").then(function() {
				loadScript("DestinyDatabase/DestinyCompactTalentDefinition.js", "DestinyCompactTalentDefinition").then(function() {
					database.getAllEntries(database.allStores).then(function(data) {
						// chrome.storage.local.get(null, function(data) {
						// var searchData = data.itemChanges;
						// if (terms > 0 && searchResults.length === 0) {
						// return finishSearch(searchResults);
						// } else if (terms > 0) {
						// searchData = searchResults;
						// }
						// var tempSearchResults = [];
						for (let itemDiff of data.itemChanges) {
							if (itemDiff.added.length) {
								for (let item of itemDiff.added) {
									if (item.item) {
										item = item.item;
									}
									var baseItem = JSON.parse(item);
									var itemData = getItemDefinition(baseItem.itemHash);
									var searchMatches = 0;
									for (let term of searchTerms) {
										var property = term.property;
										if (property === "element" || property === "light") {

											if (typeof baseItem.primaryStat !== "undefined") {
												if (isNaN(parseInt(term.item, 10))) {
													var statDef = getItemDefinition(baseItem.damageTypeHash);
													if (statDef) {
														if (statDef.damageTypeName.match(new RegExp(term.item, "i"))) {
															searchMatches += 1;
															// searchResults.push(itemDiff);
															// break;
														}
													}
												} else if (baseItem.primaryStat.value === parseInt(term.item, 10)) {
													searchMatches += 1;
													// searchResults.push(itemDiff);
													// break;
												}
											}
										} else if (typeof baseItem[property] !== "undefined" && baseItem[property].match(new RegExp(term.item, "i"))) {
											searchMatches += 1;
											// searchResults.push(itemDiff);
											// break;
										} else if (typeof itemData[property] !== "undefined" && itemData[property].match(new RegExp(term.item, "i"))) {
											searchMatches += 1;
											// searchResults.push(itemDiff);
											// break;
										}
									}
									if (searchMatches === searchTerms.length) {
										searchResults.push(itemDiff);
										break;
									}
								}
							}
							// terms++;
							// searchResults = tempSearchResults;
							// Array.prototype.push.apply(searchResults, tempSearchResults);
						}
						return finishSearch(searchResults);
					});
				});
			});
		});
	});
}

function finishSearch(results) {
	// logger.startLogging("search");
	console.info(results);
	document.getElementById("date").innerHTML = "";
	document.getElementById("progression").innerHTML = "";
	document.getElementById("added").innerHTML = "";
	document.getElementById("transferred").innerHTML = "";
	document.getElementById("removed").innerHTML = "";
	lastIndex = -1;
	resultQuantity = 100;
	arrayStep = 0;
	displayResults(results);
	document.getElementById("status").classList.remove("active");
	document.getElementById("status").classList.add("idle");
}