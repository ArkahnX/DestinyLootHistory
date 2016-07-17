Object.prototype[Symbol.iterator] = function() {
	var keyList = Object.keys(this);
	let index = 0;
	return {
		next: () => {
			let value = this[keyList[index]];
			let done = index >= keyList.length;
			index++;
			return {
				value,
				done
			};
		}
	};
};

// You'll usually only ever have to create one service instance.
var service = analytics.getService('DestinyLootHistory');

// You can create as many trackers as you want. Each tracker has its own state
// independent of other tracker instances.
var tracker = service.getTracker('UA-77020265-2');  // Supply your GA Tracking ID.

function recursive(index, array, networkTask, resultTask, endRecursion) {
	if (array[index]) {
		new Promise(function(resolve) {
			// logger.time("sequence")
			networkTask(array[index], resolve, index);
		}).then(function(result) {
			// logger.timeEnd("sequence")
			resultTask(result, array[index], index);
			recursive(index + 1, array, networkTask, resultTask, endRecursion);
		});
	} else {
		endRecursion();
	}
}

function sequence(array, networkTask, resultTask) {
	return new Promise(function(resolve) {
		recursive(0, array, networkTask, resultTask, resolve);
	});
}

function getItemDefinition(hash) {
	if (DestinyHistoricalItemDefinition[hash]) {
		return DestinyHistoricalItemDefinition[hash];
	} else if (DestinyCompactItemDefinition[hash]) {
		return DestinyCompactItemDefinition[hash];
	}
	tracker.sendEvent('Item not in database', `${hash}`, `version ${localStorage.version}, systems ${JSON.stringify(systemIds)}`);
	logger.error(`Item Reference ${hash} is not in database. This has been reported.`);
	return {
		hasIcon: false,
		icon: "",
		sourceHashes: [],
		tierTypeName: "",
		itemTypeName: "",
		itemName: "",
		bucketTypeHash: 215593132
	};
}