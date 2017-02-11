function matchDataUi(storedCarnageData) {
    let tableStart = `<table id="matchdata" class="data-table container hidden"><thead><tr>`;
    let tableMid = `</tr></thead><tbody><tr>`;
    let tableEnd = `</tr></tbody></table>`;
    let tableHead = [];
    let tableContents = [];
    for (let attribute of sortOrder) {
        tableHead.push(`<td title="${attribute.name}" class="${attribute.id}">${attribute.name}</td>`);
    }
    for (let carnageData of storedCarnageData.rows) {
        let tableBody = [];
        for (let attribute of sortOrder) {
            if (attribute.id === "link") {
                tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}"><a href="${carnageData[attribute.id]}">Destiny Tracker</a></td>`);
            } else if (attribute.id === "kd") {
                tableBody.push(`<td class="${kdStyle(carnageData.kd)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
            } else {
                tableBody.push(`<td class="${winStyle(carnageData.win)} ${attribute.id}" title="${carnageData[attribute.id]}">${carnageData[attribute.id]}</td>`);
            }
        }
        tableContents.push(tableBody.join(""));
    }
    let table = tableStart + tableHead.join("") + tableMid + tableContents.join("</tr><tr>") + tableEnd;
    document.getElementById("width-wrapper").innerHTML += table;
    new Tablesort(document.getElementById('matchdata'));
}

function bestsUi(storedCarnageData) {
    
}