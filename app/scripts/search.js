var bungie = new Bungie();
var manifest = chrome.runtime.getManifest();
if (manifest.key) {
	window.console.time = function() {};
	window.console.timeEnd = function() {};
}
characterDescriptions = JSON.parse(localStorage.characterDescriptions);
initUi();

chrome.storage.local.get(null, function(result) {
	console.log(result);
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
	var itemHash = document.createElement("option");
	itemHash.setAttribute("value", "itemHash");
	itemHash.textContent = "Hash";
	select.appendChild(itemHash);
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
	document.getElementById("addSearchTerm").addEventListener("click", addSearchTerm);
	document.getElementById("searchButton").addEventListener("click", handleSearch);
	addSearchTerm();
});

function removeSearchTerms(e) {
	var ID = parseInt(e.target.parentNode.dataset.id, 10);
	for (var i = searchTerms.length - 1; i > -1; i--) {
		if (searchTerms[i].id === ID) {
			searchTerms.splice(i, 1);
			break;
		}
	}
	e.target.parentNode.parentNode.removeChild(e.target.parentNode);
	document.getElementById("container").style.height = "calc(100% - " + document.getElementById("status").clientHeight + "px)";
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
	document.getElementById("container").style.height = "calc(100% - " + document.getElementById("status").clientHeight + "px)";
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

function handleSearch() {
	var resultQuantity = document.getElementById("resultQuantity");
	// var script = document.createElement('script');
	// script.onload = function() {
	// 	//do stuff with the script
	// };
	// script.src = something;
	// document.head.appendChild(script); //or something of the likes
	// FIXME USE SEQUENCE FOR NETWORK LOADING ALL SCRIPTS
	// FIXME 2 ONLY LOAD TALENTGRID WHEN SEARCHING TALENTS
	// FIXME 3 ONLY LOAD COMPACTDEFS WHEN SEARCHING DAMAGE TYPE

	var searchResults = [];
	chrome.storage.local.get(null, function(data) {
		for (let term of searchTerms) {
			var type = term.type;
			var property = term.property;
			for (let itemDiff of data.itemChanges) {
				if (itemDiff[type].length) {
					for (let item of itemDiff[type]) {
						var baseItem = JSON.parse(item);
						var itemData = DestinyCompactItemDefinition[baseItem.itemHash];
						if (property === "element" || property === "light") {
							if (typeof baseItem.primaryStat !== "undefined") {
								if (isNaN(parseInt(term.item, 10))) {
									var statDef = DestinyDamageTypeDefinition[baseItem.damageTypeHash];
									if (statDef) {
										if (statDef.damageTypeName.match(new RegExp(term.item, "i"))) {
											searchResults.push(itemDiff);
											break;
										}
									}
								} else if (baseItem.primaryStat.value === parseInt(term.item, 10)) {
									searchResults.push(itemDiff);
									break;
								}
							}
						} else if (typeof baseItem[property] !== "undefined" && baseItem[property].match(new RegExp(term.item, "i"))) {
							searchResults.push(itemDiff);
							break;
						} else if (typeof itemData[property] !== "undefined" && itemData[property].match(new RegExp(term.item, "i"))) {
							searchResults.push(itemDiff);
							break;
						}
					}
				}
			}
		}
		console.log(searchResults);
		document.getElementById("date").innerHTML = "";
		document.getElementById("progression").innerHTML = "";
		document.getElementById("added").innerHTML = "";
		document.getElementById("transferred").innerHTML = "";
		document.getElementById("removed").innerHTML = "";
		lastIndex = -1;
		resultQuantity = 100;
		arrayStep = 0;
		displayResults(searchResults);
	});
}