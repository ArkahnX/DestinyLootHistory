var _VERBOSE = false;
var logger = (function() {
	const TIME = "time";
	const LOG = "log";
	const ERROR = "error";
	const WARN = "warn";
	const INFO = "info";
	var logList = [];

	var pageWidth = 0;

	var currentLog = null;

	var lastUsedTag = "";

	var disabled = false;


	function init() {
		return new Promise(function(resolve) {
			chrome.storage.local.get("logger", function(data) {
				if (data.logger && data.logger.logList) {
					logList = data.logger.logList;
					currentLog = data.logger.currentLog;
				}
				resolve();
			});
		});
	}

	function startLogging(tag) {
		if (!disabled) {
			if (!currentLog || (currentLog && currentLog.tag !== tag)) {
				if (currentLog && currentLog.logs.length) {
					logList.push(currentLog);
					lastUsedTag = currentLog.tag;
				}
				if (lastUsedTag === tag) {
					currentLog = logList.pop();
				} else {
					currentLog = {
						timestamp: moment().format(),
						logs: [],
						timeTags: {},
						source: _getSource(),
						tag: tag || ""
					};
				}
			}
		}
	}

	function endLogging() {
		logList.push(currentLog);
		currentLog = null;
	}

	function _getErrorObject() {
		try {
			throw Error('');
		} catch (err) {
			return err;
		}
	}

	function getAllTags() {
		var tags = [];
		for (var log of logList) {
			if (tags.indexOf(log.tag) === -1) {
				tags.push(log.tag);
			}
		}
		if (currentLog) {
			if (tags.indexOf(currentLog.tag) === -1) {
				tags.push(currentLog.tag);
			}
		}
		return tags;
	}

	function _getSource() {
		var err = _getErrorObject();
		var caller_line;
		for (var line of err.stack.split("\n")) {
			if (line.indexOf("logger") === -1 && line !== "Error" && line.indexOf("Error (native)") === -1) {
				caller_line = line;
				break;
			}
		}
		// var caller_line = err.stack.split("\n")[6];
		var index = caller_line.split("/");
		index = index[index.length - 1];
		var pageLine = index.split(":");
		pageLine = pageLine[1];
		var functionName = caller_line.split(" ")[5];
		functionName = functionName.split(":")[0];
		var fileName = index.split(" ");
		fileName = fileName[fileName.length - 1].split(":");
		fileName = fileName[0];
		var clean = `${functionName} (${fileName}:${pageLine})`;
		if (clean.length > pageWidth) {
			pageWidth = clean.length;
		}
		return clean;
	}

	function _log(type, data) {
		if (!currentLog) {
			startLogging(type);
		}
		return {
			type: type,
			data: data,
			timestamp: moment().format(),
			source: _getSource()
		};
	}

	function time(tag) {
		if (!disabled) {
			let startTime = window.performance.now();
			currentLog.timeTags[tag] = startTime;
		}
	}

	function timeEnd(tag) {
		if (!disabled) {
			let endTime = window.performance.now();
			if (currentLog.timeTags[tag]) {
				currentLog.logs.push(_log(TIME, `${tag}: ${+(Math.round((endTime - currentLog.timeTags[tag]) + "e+3")  + "e-3")}ms`));
			}
		}
	}

	function error(data) {
		if (!disabled) {
			for (var data of arguments) {
				_multi(ERROR, data);
			}
		}
	}

	function log(data) {
		if (!disabled) {
			for (var data of arguments) {
				_multi(LOG, data);
			}
		}
	}

	function info() {
		if (!disabled) {
			for (var data of arguments) {
				_multi(INFO, data);
			}
		}
	}

	function _multi(type, data) {
		if (!chrome.runtime.getManifest().key || _VERBOSE === true) {
			if (type !== "time" && type !== "timeEnd") {
				console[type](moment().format(), _getSource(), data);
			}
		}

		if (Array.isArray(data)) {
			currentLog.logs.push(_log(type, `Array[${data.length}]`));
		} else if (typeof data === "object") {
			var dataList = [];
			for (var attr in data) {
				if (data[attr] !== undefined && data[attr] !== null) {
					if (Array.isArray(data[attr])) {
						dataList.push(`${attr}: Array[${data[attr].length}]`);
					} else if (typeof data[attr] === "object") {
						dataList.push(`${attr}: Object[${Object.keys(data[attr]).length}]`);
					} else if (typeof data[attr] === "function") {
						dataList.push(`${attr}: ${data[attr].toString().split("{")[0].trim()}`);
					} else if (typeof data[attr] === "string") {
						dataList.push(type, `${attr}: "${data[attr]}"`);
					} else {
						dataList.push(`${attr}: ${data[attr]}`);
					}
				}
			}
			currentLog.logs.push(_log(type, dataList.join(",\n")));
		} else if (typeof data === "function") {
			currentLog.logs.push(_log(type, data.toString().split("{")[0].trim()));
		} else if (typeof data === "string") {
			currentLog.logs.push(_log(type, `"${data}"`));
		} else {
			currentLog.logs.push(_log(type, data));
		}
	}

	function warn(data) {
		if (!disabled) {
			for (var data of arguments) {
				_multi(WARN, data);
			}
		}
	}

	function _pad(string, width) {
		return " ".repeat(Math.max(0, width - string.length)) + string;
	}

	function saveData() {
		if (logList.length > 6000) {
			clean();
		} else {
			chrome.storage.local.set({
				logger: {
					currentLog: currentLog,
					logList: logList
				}
			});
		}
	}

	function exportLogs() {
		return new Promise(function(resolve) {
			chrome.storage.local.get("logger", function(data) {
				var localLogList = data.logger.logList;
				var endLogs = ["\n"];
				var startingPoint = localLogList.length - 500;
				if (localLogList.length < 500) {
					startingPoint = 0;
				}
				for (var i = startingPoint; i < localLogList.length; i++) {
					var logData = localLogList[i];
					var tempLog = [];
					for (var log of logData.logs) {
						if (log.type === LOG) {
							tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
						}
						if (log.type === INFO) {
							tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
						}
						if (log.type === WARN) {
							tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
						}
						if (log.type === ERROR) {
							tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
						}
					}
					if (tempLog.length) {
						endLogs.push(`-----------------------------------------------------------`);
						endLogs.push(`${logData.timestamp}: ${log.source}: "${logData.tag}"`);
						Array.prototype.push.apply(endLogs, tempLog);
					}
				}
				resolve(endLogs.join("\n"));
			});
		});
	}

	function returnLogs(tagsToShow, showLog, showInfo, showWarn, showError, showTime) {
		return new Promise(function(resolve) {
			chrome.storage.local.get("logger", function(data) {
				var localLogList = data.logger.logList;
				var endLogs = ["\n"];
				var uniqueLogs = [];
				for (var logData of localLogList) {
					if (!tagsToShow || tagsToShow.indexOf(logData.tag) > -1) {
						var tempLog = [];
						for (var log of logData.logs) {
							if (log.type === LOG && showLog && uniqueLogs.indexOf(log.data) === -1) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
								uniqueLogs.push(log.data);
							}
							if (log.type === INFO && showInfo && uniqueLogs.indexOf(log.data) === -1) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
								uniqueLogs.push(log.data);
							}
							if (log.type === WARN && showWarn && uniqueLogs.indexOf(log.data) === -1) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
								uniqueLogs.push(log.data);
							}
							if (log.type === ERROR && showError && uniqueLogs.indexOf(log.data) === -1) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
								uniqueLogs.push(log.data);
							}
							if (log.type === TIME && showTime && uniqueLogs.indexOf(log.data) === -1) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
								uniqueLogs.push(log.data);
							}
						}
						if (tempLog.length) {
							endLogs.push(`-----------------------------------------------------------`);
							endLogs.push(`${logData.timestamp}: ${log.source}: "${logData.tag}"`);
							Array.prototype.push.apply(endLogs, tempLog);
						}
					}
				}
				endLogs.push(`-----------------------------------------------------------`);
				endLogs.push(moment().format());
				endLogs.push(`Unique ID: ${localStorage.uniqueId}, Version: ${chrome.runtime.getManifest().version}, Chrome: ${/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]}`);
				endLogs.push("localStorage Values");
				for (var property in localStorage) {
					endLogs.push(`${property}: "${localStorage[property]}"`);
				}
				chrome.storage.local.get(null, function(result) {
					for (var property in result) {
						if (Array.isArray(result[property])) {
							endLogs.push(`${property}: Array[${result[property].length}]`);
						} else if (!Array.isArray(result[property]) && typeof result[property] === "object") {
							for (var attr in result[property]) {
								if (Array.isArray(result[property][attr])) {
									endLogs.push(`${property}.${attr}: Array[${result[property][attr].length}]`);
								} else if (!Array.isArray(result[property]) && typeof result[property] === "object") {
									endLogs.push(`${property}.${attr}: Object[${Object.keys(result[property][attr]).length}]`);
								} else {
									endLogs.push(`${property}.${attr}: "${result[property][attr]}"`);
								}
							}
						} else {
							endLogs.push(`${property}: "${result[property]}"`);
						}
					}
					endLogs.push(`Bungie Systems ${localStorage.systems}`);
					resolve(endLogs.join("\n"));
				});
			});
		});
	}

	function clean() {
		logList = [];
		chrome.storage.local.set({
			logger: {
				currentLog: currentLog,
				logList: []
			}
		});
	}

	function getLogs() {
		return logList;
	}

	function disable() {
		disabled = true;
	}

	return {
		LOG,
		INFO,
		WARN,
		ERROR,
		TIME,
		log,
		warn,
		error,
		info,
		time,
		timeEnd,
		getAllTags,
		returnLogs,
		startLogging,
		init,
		endLogging,
		clean,
		getLogs,
		disable,
		saveData,
		exportLogs
	};
}());