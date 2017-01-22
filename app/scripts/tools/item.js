const item = (function () { // jshint ignore:line
	var item = {};
	item.getCosts = function getCosts(saleItem, vendor, inventories, characterId) {
		let costs = [];
		if (vendor.currencies) {
			for (let cost of saleItem.costs) {
				let currencyTotal = vendor.currencies[cost.itemHash];
				if (typeof currencyTotal !== "number") {
					currencyTotal = 0;
					var inventory = findInArray(inventories, "characterId", characterId);
					for (let item of inventory.inventory || []) {
						if (item.itemHash === cost.itemHash) {
							currencyTotal = item.stackSize;
							break;
						}
					}
				}
				costs.push({
					itemHash: cost.itemHash,
					value: cost.value,
					total: currencyTotal
				});
			}
		}
		return costs;
	};
	return item;
}());