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
	if(DestinyHistoricalItemDefinition[hash]) {
		return DestinyHistoricalItemDefinition[hash];
	} else if(DestinyCompactItemDefinition[hash]) {
		return DestinyCompactItemDefinition[hash];
	}
	logger.error(`Item Reference ${hash} is not in database. Please file a bug report.`);
	return {};
}