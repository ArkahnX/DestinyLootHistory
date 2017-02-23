function matchDataUi(storedCarnageData) {
	if (storedCarnageData && storedCarnageData.rows.length) {
		let array = sortBy(storedCarnageData.rows, "id");
		makeTable(array, "matchdata", "width-wrapper", true);
	} else {
		document.getElementById("width-wrapper").innerHTML = `<h1>No Match Data Found!</h1>`;
		elements.status.classList.remove("active");
	}
}

function makeTable(storedCarnageDataRows, tableId, tableContainer, hidden, options) {
	let hiddenString = "";
	if (hidden) {
		hiddenString = " hidden";
	}
	let tableStart = `<table id="${tableId}" class="data-table container${hiddenString}"><thead><tr>`;
	let tableMid = `</tr></thead><tbody><tr>`;
	let tableEnd = `</tr></tbody></table>`;
	let tableHead = [];
	if (options && options.id) {
		tableHead.push(`<td title="Stat" class="stat">Stat</td>`);
		tableHead.push(`<td title="Value" class="values">Value</td>`);
	}
	let tableContents = [];
	for (let attribute of sortOrder) {
		tableHead.push(`<td title="${attribute.name}" class="${attribute.id}">${attribute.name}</td>`);
	}
	for (let carnageData of storedCarnageDataRows) {
		let tableBody = [];
		if (options && options.id) {
			tableBody.push(`<td class="${winStyle(carnageData.win)} stat" title="${options.name}">${options.name}</td>`);
			tableBody.push(`<td class="${winStyle(carnageData.win)} values" title="${carnageData[options.id]}">${carnageData[options.id]}</td>`);
		}
		for (let attribute of sortOrder) {
			if (typeof carnageData[attribute.id] !== "undefined") {
				if (attribute.id === "link") {
					tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}"><a href="${carnageData[attribute.id]}">Destiny Tracker</a></td>`);
				} else if (attribute.id === "kd") {
					tableBody.push(`<td class="${kdStyle(carnageData.kd)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
				} else {
					tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
				}
			}
		}
		tableContents.push(tableBody.join(""));
	}
	let table = tableStart + tableHead.join("") + tableMid + tableContents.join("</tr><tr>") + tableEnd;
	document.getElementById(tableContainer).innerHTML += table;
	new Tablesort(document.getElementById(tableId));
}

function makeMultiTable(tableData, tableId, tableContainer, hidden) {
	let hiddenString = "";
	if (hidden) {
		hiddenString = " hidden";
	}
	let tableStart = `<table id="${tableId}" class="data-table container${hiddenString}"><thead><tr>`;
	let tableMid = `</tr></thead><tbody><tr>`;
	let tableEnd = `</tr></tbody></table>`;
	let tableHead = [];
	tableHead.push(`<td title="Stat" class="stat">Stat</td>`);
	tableHead.push(`<td title="Value" class="values">Value</td>`);
	let tableContents = [];
	for (let attribute of sortOrder) {
		tableHead.push(`<td title="${attribute.name}" class="${attribute.id}">${attribute.name}</td>`);
	}
	for (let dataObject of tableData) {
		let options = dataObject.options;
		// let carnageData = dataObject.array;
		for (let carnageData of dataObject.array) {
			let tableBody = [];
			if (options && options.id) {
				tableBody.push(`<td class="${winStyle(carnageData.win)} stat" title="${options.name}">${options.name}</td>`);
				tableBody.push(`<td class="${winStyle(carnageData.win)} values" title="${carnageData[options.id]}">${carnageData[options.id]}</td>`);
			}
			for (let attribute of sortOrder) {
				if (typeof carnageData[attribute.id] !== "undefined") {
					if (attribute.id === "link") {
						tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}"><a href="${carnageData[attribute.id]}">Destiny Tracker</a></td>`);
					} else if (attribute.id === "kd") {
						tableBody.push(`<td class="${kdStyle(carnageData.kd)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
					} else {
						tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
					}
				}
			}
			tableContents.push(tableBody.join(""));
		}
	}
	let table = tableStart + tableHead.join("") + tableMid + tableContents.join("</tr><tr>") + tableEnd;
	document.getElementById(tableContainer).innerHTML += table;
	new Tablesort(document.getElementById(tableId));
}

function bestsUi(storedCarnageData) {
	document.getElementById("width-wrapper").innerHTML += `<div id="bests" class="hidden"></div>`;
	let multiTable = [];
	for (let category of categories) {
		let array = sortBy(storedCarnageData.rows, category);
		let temp = [];
		if (array[0]) {
			temp.push(array[0]);
		}
		if (array[1]) {
			temp.push(array[1]);
		}
		multiTable.push({
			array: temp,
			options: category
		});
	}
	makeMultiTable(multiTable, "bests-table", "bests");
}

function lootUi(storedCarnageData, season) {
	document.getElementById("width-wrapper").innerHTML += `<div id="loot" class="hidden"></div>`;
	let array = sortBy(storedCarnageData.rows, "id");
	let tableStart = `<table id="lootData" class="data-table container"><thead><tr>`;
	let tableMid = `</tr></thead><tbody><tr>`;
	let tableEnd = `</tr></tbody></table>`;
	let tableHead = [];
	let tableContents = [];
	for (let attribute of lootHeaders) {
		tableHead.push(`<td title="${attribute.name}" class="${attribute.id}">${attribute.name}</td>`);
	}
	for (let i = 0; i < array.length; i++) {
		let carnageData = array[i];
		let lootData = storedCarnageData.lootRows[i];
		let tableBody = [];
		if (lootData) {
			for (let attribute of lootHeaders) {
				if (typeof carnageData[attribute.id] !== "undefined") {
					tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
				} else if (typeof lootData[attribute.id] !== "undefined") {
					tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${lootData[attribute.id]}">${lootData[attribute.id]}</td>`);
				}
			}
		}
		tableContents.push(tableBody.join(""));
	}
	let table = tableStart + tableHead.join("") + tableMid + tableContents.join("</tr><tr>") + tableEnd;
	document.getElementById("loot").innerHTML += table;
	new Tablesort(document.getElementById('lootData'));
}

function statsUi(storedCarnageData) {
	document.getElementById("width-wrapper").innerHTML += `<div id="stats" class="hidden"></div>`;
	let tableStart = `<table id="statData" class="data-table container"><thead><tr>`;
	let tableMid = `</tr></thead><tbody><tr>`;
	let tableEnd = `</tr></tbody></table>`;
	let tableHeaders = [];
	let tableColumns = [];
	let tableContents = [];
	tableHeaders.push(`<td class="gameStats stat-header" title="Game Stats" colspan="2">Game Stats</td>`);
	tableHeaders.push(`<td class="specialStats stat-header" title="Special Stats" colspan="2">Special Stats</td>`);
	tableHeaders.push(`<td class="mainStats stat-header" title="Main Stats" colspan="2">Main Stats</td>`);
	tableHeaders.push(`<td class="abilityKills stat-header" title="Kills By Type" colspan="2">Kills By Type</td><td class="abilityKills stat-header stat-percent">Total</td>`);
	tableHeaders.push(`<td class="weaponsUsed stat-header" title="Weapons Used" colspan="2">Weapons Used</td><td class="weaponsUsed stat-header stat-percent">Total</td>`);
	tableHeaders.push(`<td class="rareRewards stat-header" title="Rare Reward Stats" colspan="2">Rare Reward Stats</td><td class="rareRewards stat-header stat-percent">Drop Rate</td>`);
	tableHeaders.push(`<td class="legendaryRewards stat-header" title="Legendary Reward Stats" colspan="2">Legendary Reward Stats</td><td class="legendaryRewards stat-header stat-percent">Drop Rate</td>`);
	tableHeaders.push(`<td class="exoticRewards stat-header" title="Exotic Reward Stats" colspan="2">Exotic Reward Stats</td><td class="exoticRewards stat-header stat-percent">Drop Rate</td>`);
	let arrays = [gameStats, specialStats, mainStats];
	for (let array of arrays) {
		let nameColumn = [];
		let dataColumn = [];
		for (let property of array) {
			nameColumn.push(`<td class="${property.style} stat-name" title="${property.name}">${property.name}</td>`);
			let dataValue = getStatValue(property, storedCarnageData);
			dataColumn.push(`<td class="${property.style} stat-data" title="${dataValue}">${dataValue}</td>`);
		}
		tableColumns.push(nameColumn, dataColumn, []);
	}
	let doubleArrays = [abilityKillsData, weaponsUsed, rareRewardStats, legendaryRewardStats, exoticRewardStats];
	for (let array of doubleArrays) {
		let nameColumn = [];
		let dataColumn = [];
		let percentColumn = [];
		for (let property of array) {
			if(property.id === "droprate") {
			nameColumn.push(`<td class="${property.style} stat-name" title="${property.name}" colspan="2">${property.name}</td>`);
			} else {
				nameColumn.push(`<td class="${property.style} stat-name" title="${property.name}">${property.name}</td>`);
			}
			let dataValue = getStatValue(property, storedCarnageData);
			let percentValue = getPercentValue(property, storedCarnageData);
			if (dataValue !== false) {
				dataColumn.push(`<td class="${property.style} stat-data" title="${dataValue}">${dataValue}</td>`);
			} else {
				dataColumn.push("");
			}
			if (percentValue !== false) {
				percentColumn.push(`<td class="${property.style} stat-percent" title="${percentValue}">${percentValue}</td>`);
			} else {
				percentColumn.push("");
			}
		}
		tableColumns.push(nameColumn, dataColumn, percentColumn, []);
	}
	let maxLength = 0;
	for (let column of tableColumns) {
		if (column.length > maxLength) {
			maxLength = column.length;
		}
	}
	for (let i = 0; i < maxLength; i++) {
		let result = "";
		for (let column of tableColumns) {
			if (column[i]) {
				result += column[i];
			} else {
				result += `<td class="spacer"></td>`;
			}
		}
		tableContents.push(result);
	}
	let table = tableStart + tableHeaders.join(`<td class="spacer"></td>`) + tableMid + tableContents.join("</tr><tr>") + tableEnd;
	document.getElementById("stats").innerHTML += table;
	new Tablesort(document.getElementById('statData'));
}