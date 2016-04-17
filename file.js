function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files[0]; // FileList object.

	if (files) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			var object = JSON.parse(contents);
			processDifference(object, "item")
		}
		r.readAsText(files);
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


function isSameItem(item1, item2) {
	if (item1 === item2) {
		return true;
	}
	if(typeof item1 === "string") {
		item1 = JSON.parse(item1);
	}
	if(typeof item2 === "string") {
		item2 = JSON.parse(item2);
	}
	if (item1.itemHash === item2.itemHash) {
		if (item1.stackSize === item2.stackSize) {
			if (item1.itemInstanceId === item2.itemInstanceId) {
				return true;
			}
		}
	}
	return false;
}

function makeDate(string, offset) {
	// console.log(string,offset)
	var d = new Date(string);
	d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
	d = new Date(d.getTime() + (offset * 1000))
	var dateString = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + "T" + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
	return dateString;
}

function processDifference(diffs, type) {
	var additions = [];
	var removals = [];
	var transfers = [];
	var changes = [];
	var finalChanges = [];
	var previousTimeStamp = null;
	var previousDiff = null;
	var characterIds = [];
	var timestamps = [];
	if (diffs.length) {
		for (var diff of diffs) {
			if (characterIds.indexOf(diff.characterId) === -1) {
				characterIds.push(diff.characterId);
			}
			if (typeof diff.timestamp !== "string") {
				var secondsSinceLastDiff = diff.secondsSinceLastDiff || 0;
				if (diff.secondsSinceLastDiff === 0 && previousDiff.added.length !== diff.removed.length) {
					secondsSinceLastDiff = 60 * 60 * 4;
				}
				diff.timestamp = makeDate(previousTimeStamp, secondsSinceLastDiff);
			}
			for (var addition of diff.added) {
				if (addition) {
					additions.push({
						timestamp: diff.timestamp,
						secondsSinceLastDiff: diff.secondsSinceLastDiff,
						characterId: diff.characterId,
						item: JSON.stringify(addition)
					});
				}
			}
			for (var removal of diff.removed) {
				if (removal) {
					removals.push({
						timestamp: diff.timestamp,
						secondsSinceLastDiff: diff.secondsSinceLastDiff,
						characterId: diff.characterId,
						item: JSON.stringify(removal)
					});
				}
			}
			previousTimeStamp = diff.timestamp;
			previousDiff = diff;
			if (timestamps.indexOf(diff.timestamp) === -1) {
				timestamps.push(diff.timestamp);
			}
		}
		for (var i = additions.length - 1; i >= 0; i--) {
			var addition = additions[i];
			for (var e = removals.length - 1; e >= 0; e--) {
				var removal = removals[e];
				if (addition.characterId !== removal.characterId) {
					if (isSameItem(addition.item, removal.item)) {
						var movedItem = additions.splice(i, 1)[0];
						if (!movedItem) {
							console.log(removal, addition, i, e, movedItem, additions.length, removals.length)
						}
						removals.splice(e, 1);
						transfers.push({
							timestamp: addition.timestamp,
							secondsSinceLastDiff: addition.secondsSinceLastDiff,
							from: removal.characterId,
							to: addition.characterId,
							item: movedItem.item
						});
						break;
					}
				}
			}
		}
	}
	// if (oldProgression) {
	// 	for (var characterId in oldProgression) {
	// 		var diff = {
	// 			timestamp: currentDateString,
	// 			secondsSinceLastDiff: (new Date(currentDateString) - previousFactionDate) / 1000,
	// 			characterId: characterId,
	// 			changes: checkFactionDiff(oldProgression[characterId].progressions, data.progression[characterId].progressions),
	// 			level: data.progression[characterId].levelProgression
	// 		};
	// 		if (diff.changes.length > 0) {
	// 			changes.push(diff);
	// 		}
	// 	}
	// }
	for (var timestamp of timestamps) {
		for (var characterId of characterIds) {
			var diff = {
				timestamp: timestamp,
				secondsSinceLastDiff: 0,
				characterId: characterId,
				removed: [],
				added: [],
				transfered: []
			};
			// if (data.progression[characterId]) {
			// 	diff.level = data.progression[characterId].levelProgression;
			// 	diff.changed = [];
			// 	for (var change of changes) {
			// 		if (change.characterId === characterId) {
			// 			diff.changed.push(change.item);
			// 		}
			// 	}
			// }
			for (var addition of additions) {
				if (addition.characterId === characterId && addition.timestamp === timestamp) {
					diff.added.push(addition.item);
				}
			}
			for (var removal of removals) {
				if (removal.characterId === characterId && removal.timestamp === timestamp) {
					diff.removed.push(removal.item);
				}
			}
			for (var transfer of transfers) {
				if (transfer.to === characterId && transfer.timestamp === timestamp) {
					diff.transfered.push({
						from: transfer.from,
						to: transfer.to,
						item: transfer.item
					});
				}
			}
			if (diff.removed.length || diff.added.length || diff.transfered.length || (diff.changed && diff.changed.length)) {
				finalChanges.push(diff);
			}
		}
	}
	console.log("Additions:", additions.length, additions, "\nRemovals:", removals.length, removals, "\nTransfers:", transfers.length, transfers, "\nChanges:", changes.length, changes, "\nFinal Changes:", finalChanges);
	// // Array.prototype.push.apply(data., checkFactionDiff(oldProgression[characterId].progressions, data.progression[characterId].progressions));
	// // Array.prototype.push.apply(additions, checkDiff(data.inventories[characterId], oldInventories[characterId]));
	// // Array.prototype.push.apply(removals, checkDiff(oldInventories[characterId], data.inventories[characterId]));
	// oldProgression = data.progression;
	// oldInventories = data.inventories;
	chrome.storage.local.set({"itemChanges":finalChanges}, function() {});
	var itemBlob = new Blob([JSON.stringify(finalChanges)], {
		type: 'application/json'
	});

	var url = window.URL;
	var a = document.getElementById('link1');
	a.download = 'itemChanges.json';
	a.href = url.createObjectURL(itemBlob);
	a.textContent = 'Download Item Change Data';
	a.dataset.downloadurl = ['json', a.download, a.href].join(':');
	// var factionBlob = new Blob([JSON.stringify(data.factionChanges)], {
	// 	type: 'application/json'
	// });

	// var a2 = document.getElementById('link2');
	// a2.download = 'factionChanges.json';
	// a2.href = url.createObjectURL(factionBlob);
	// a2.textContent = 'Download Faction Change Data';
	// a2.dataset.downloadurl = ['json', a2.download, a2.href].join(':');
	// });
}