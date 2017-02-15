function matchDataUi(storedCarnageData) {
	let array = sortBy(storedCarnageData.rows, "id");
	makeTable(array, "matchdata", "width-wrapper", true);
	// let tableStart = `<table id="matchdata" class="data-table container hidden"><thead><tr>`;
	// let tableMid = `</tr></thead><tbody><tr>`;
	// let tableEnd = `</tr></tbody></table>`;
	// let tableHead = [];
	// let tableContents = [];
	// for (let attribute of sortOrder) {
	//     tableHead.push(`<td title="${attribute.name}" class="${attribute.id}">${attribute.name}</td>`);
	// }
	// for (let carnageData of storedCarnageData.rows) {
	//     let tableBody = [];
	//     for (let attribute of sortOrder) {
	//         if (attribute.id === "link") {
	//             tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}"><a href="${carnageData[attribute.id]}">Destiny Tracker</a></td>`);
	//         } else if (attribute.id === "kd") {
	//             tableBody.push(`<td class="${kdStyle(carnageData.kd)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
	//         } else {
	//             tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
	//         }
	//     }
	//     tableContents.push(tableBody.join(""));
	// }
	// let table = tableStart + tableHead.join("") + tableMid + tableContents.join("</tr><tr>") + tableEnd;
	// document.getElementById("width-wrapper").innerHTML += table;
	// new Tablesort(document.getElementById('matchdata'));
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
					tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}">${lootData[attribute.id]}</td>`);
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
	document.getElementById("width-wrapper").innerHTML += `<div id="loot" class="hidden"></div>`;
}