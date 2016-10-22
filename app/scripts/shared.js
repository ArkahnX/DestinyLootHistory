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

function getOption(name) {
	return new Promise(function(resolve) {
		chrome.storage.sync.get(name, function(options) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			resolve(options[name]);
		});
	});
}

function getAllOptions() {
	return new Promise(function(resolve) {
		chrome.storage.sync.get(null, function(options) {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			resolve(options);
		});
	});
}

function setOptionsObject(obj) {
	return new Promise(function(resolve) {
		chrome.storage.sync.set(obj, function() {
			if (chrome.runtime.lastError) {
				logger.error(chrome.runtime.lastError);
			}
			resolve(obj);
		});
	});
}

function setOption(name, value) {
	var obj = {};
	obj[name] = value;
	setOptionsObject(obj);
}

function findInArray(array, property, value) {
	for (var item of array) {
		if (item[property] === value) {
			return item;
		}
	}
	return {};
}

// You'll usually only ever have to create one service instance.
var service = analytics.getService('DestinyLootHistory');

// You can create as many trackers as you want. Each tracker has its own state
// independent of other tracker instances.
var tracker = service.getTracker('UA-77020265-2'); // Supply your GA Tracking ID.

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

var missingItemHashes = [];

function getItemDefinition(hash, item) {
	if (DestinyHistoricalItemDefinition[hash]) {
		return DestinyHistoricalItemDefinition[hash];
	} else if (DestinyCompactItemDefinition[hash]) {
		return DestinyCompactItemDefinition[hash];
	}
	// tracker.sendEvent('Item not in database', `${hash}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
	if (missingItemHashes.indexOf(hash) === -1) {
		// logger.error(`Item Reference ${hash} is not in database. This has been reported.`);
		console.error(`Item Reference ${hash} is not in database. This has been reported.`);
		if (item) {
			console.log(item)
		}
		missingItemHashes.push(hash);
	}
	return {
		itemHash: hash,
		hasIcon: false,
		icon: "",
		sourceHashes: [],
		tierTypeName: "",
		itemTypeName: "",
		itemName: "",
		bucketTypeHash: 215593132
	};
}

function pad(pad, str, padLeft) {
	if (typeof str === 'undefined')
		return pad;
	if (padLeft) {
		return (pad + str).slice(-pad.length);
	} else {
		return (str + pad).substring(0, pad.length);
	}
}