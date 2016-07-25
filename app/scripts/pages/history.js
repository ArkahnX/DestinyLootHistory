tracker.sendAppView('HistoryScreen');
bungie.setActive(localStorage.activetype);
initUi();
var relevantStats = ["itemHash", "itemInstanceId", "isEquipped", "itemInstanceId", "stackSize", "itemLevel", "qualityLevel", "stats", "primaryStat", "equipRequiredLevel", "damageTypeHash", "progression", "talentGridHash", "nodes", "isGridComplete", "objectives"];

function checkInventory() {
	logger.startLogging("history");
	logger.time("Bungie Inventory");
	sequence(characterIdList, itemNetworkTask, itemResultTask).then(function() {
			var characterHistory = document.getElementById("history");
			characterHistory.innerHTML = "";
			var inventoryData = [];
			for (var characterId in newInventories) {
				Array.prototype.push.apply(inventoryData, newInventories[characterId]);
			}
			inventoryData.sort(function(a, b) {
				return a.itemInstanceId - b.itemInstanceId;
			});
			for (var i = inventoryData.length - 1; i >= 0; i--) {
				if (inventoryData[i].itemInstanceId === "0") {
					inventoryData.splice(i, 1);
				}
			}
			logger.info(inventoryData);
			var sourceIndex = 0;
			var sources = [3107502809, 36493462, 460228854, 3945957624, 344892955, 3739898362];
			var descriptions = ["Dark Below", "House of Wolves", "The Taken King", "Sparrow Racing League", "Crimson Doubles", "April Update"];
			var div = document.createElement("div");
			div.classList.add("sub-section");
			var description = document.createElement("h1");
			description.textContent = "Destiny";
			div.appendChild(description);
			characterHistory.appendChild(div);
			var div = document.createElement("div");
			div.classList.add("sub-section");
			for (var item of inventoryData) {
				var itemDefinition = getItemDefinition(item.itemHash);
				var found = false;
				if (itemDefinition.sourceHashes && itemDefinition.sourceHashes.length && sources[sourceIndex] && itemDefinition.sourceHashes.indexOf(sources[sourceIndex]) > -1) {
					if (sources[sourceIndex - 1] && sources[sourceIndex - 1] !== 460228854) {
						if (itemDefinition.sourceHashes.indexOf(sources[sourceIndex - 1]) === -1) {
							if (itemDefinition.tierTypeName !== "Exotic" && itemDefinition.bucketTypeHash !== 284967655 && itemDefinition.tierTypeName !== "Rare") {
								found = true;
							}
						}
					} else {
						found = true;
					}
					if (found) {
						var source = DestinyRewardSourceDefinition[sources[sourceIndex]];
						characterHistory.appendChild(div);
						div = document.createElement("div");
						div.classList.add("sub-section");
						div.classList.add(source.identifier);
						var sourceDescription = document.createElement("h1");
						sourceDescription.textContent = descriptions[sourceIndex];
						div.appendChild(sourceDescription);
						characterHistory.appendChild(div);
						var div = document.createElement("div");
						div.classList.add("sub-section");
						sourceIndex++;
					}
				}
				div.appendChild(makeItem(item, ""));
			}
			characterHistory.appendChild(div);
		});
}

initItems(checkInventory);