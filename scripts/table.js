function $(selector) {
	return document.querySelectorAll(selector);
}

function styleData(key, value) {
	var style = "";
	if (typeof value === "number") {
		style += " number";
	}
	if (key === "kd") {
		if (value >= 2) {
			style += " excellent";
		} else if (value >= 1) {
			style += " good";
		} else if (value < 1) {
			style += " bad";
		}
	}
	return style;
}

function styleRow(data) {
	var style = "";
	if (data.win === "TRUE") {
		style += " win";
	} else if (data.win === "FALSE") {
		style += " loss";
	}
	return style;
}
var sortOrder = [
	"id", 33, "#",
	"mapName", 85, "Map",
	"kills", 35, "Kills",
	"assists", 53, "Assists",
	"deaths", 50, "Deaths",
	"kd", 35, "K/d",
	"kad", 35, "Ka/d",
	"win", 49, "Win",
	"day", 71, "Day",
	"score", 44, "Score",
	"link", 78, "Link",
	"primary", 74, "Primary",
	"special", 81, "Special",
	"heavy", 72, "Heavy",
	"primaryKills", 56, "Primary",
	"specialKills", 53, "Special",
	"heavyKills", 45, "Heavy",
	"melee", 44, "Melee",
	"grenade", 60, "Grenade",
	"super", 44, "Super",
	"teamscore", 48, "Score",
	"enemyscore", 56, "E Score",
	"sparksCaptured", 52, "Carries",
	"dunks", 45, "Caps",
	"place", 41, "Place",
	"mercy", 48, "Mercy",
	"primaryType", 56, "Primary",
	"specialType", 56, "Special",
	"heavyType", 56, "Heavy",
	"guardian", 64, "Name",
	"classType", 48, "Class",
	"combatRating", 48, "Rating",
	"bestWeapon", 56, "Best",
	"killSpree", 48, "Spree",
	"avenger", 59, "Avenger",
	"payBack", 59, "Payback",
	"objective", 56, "Revives",
	"medals", 51, "Medals",
	"time", 48, "Time",
	"betweenGames", 54, "Waiting"];
var makeTable = function(data) {
	console.time("buildTableString");
	var fragment = document.createDocumentFragment();
	var main = $("#matchData");
	var nav = $("#tabs");
	var result = "";
	var tableStart = "<table>\n";
	var tableEnd = "</table>\n";
	// var headerRows = "<tr>\n";
	console.log(data.length)
	var headerRows = document.createElement("tr");
	for (var i = 0; i < sortOrder.length; i += 3) {
		// headerRows += "<th style='width:" + sortOrder[i + 1] + "px;'>" + sortOrder[i + 2] + "</th>\n";
		var header = document.createElement("th");
		header.style.width = sortOrder[i + 1] + "px";
		header.appendChild(document.createTextNode(sortOrder[i + 2]));
		headerRows.appendChild(header);
	}
	fragment.appendChild(headerRows);
	// headerRows += "</tr>\n";
	// var bodyData = "";
	for (var i = 0; i < data.length; i++) {
		var row = document.createElement("tr");
		row.setAttribute("class", styleRow(data[i]));
		var bodySection = document.createDocumentFragment();
		// var bodySection = "<tr class='" + styleRow(data[i]) + "'>\n";
		for (var e = 0; e < sortOrder.length; e += 3) {
			var dataSection = document.createElement("td");
			dataSection.style.minWidth = sortOrder[e + 1] + "px"; // CONTR)ASJDFIUHSADFUIYHSADFKUYIHSDF
			dataSection.setAttribute("class", styleData(sortOrder[e], data[i][sortOrder[e]]));
			dataSection.appendChild(document.createTextNode(data[i][sortOrder[e]]));
			bodySection.appendChild(dataSection);
			// bodySection += "<td style='min-width:" + sortOrder[e + 1] + "px;' class='" + styleData(sortOrder[e], data[i][sortOrder[e]]) + "'>" + data[i][sortOrder[e]] + "</td>\n";
		}
		row.appendChild(bodySection);
		fragment.appendChild(row);
		// bodySection += "</tr>\n";
		// bodyData += bodySection;
	}
	// fragment.appendChild(bodySection);
	// result = tableStart + headerRows + bodyData + tableEnd;
	console.timeEnd("buildTableString")
	console.time("placeTable");
	main[0].appendChild(fragment);
	// main[0].innerHTML = result;
	// console.log(result)
	console.timeEnd("placeTable");
	console.timeEnd("startLoading")
}

