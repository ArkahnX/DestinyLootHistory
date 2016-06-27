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

	var resetTime = moment().format();

	function init() {
		return new Promise(function(resolve) {
			chrome.storage.local.get("logger", function(data) {
				if (data.logger && data.logger.logList) {
					logList = data.logger.logList;
				}
				if (data.logger && data.logger.resetTime) {
					resetTime = moment(data.logger.resetTime).format();
				} else {
					saveData(true);
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
		if (Array.isArray(data)) {
			currentLog.logs.push(_log(type, `Array[${data.length}]`));
		} else if (typeof data === "object") {
			var dataList = [];
			for (var attr in data) {
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

	function saveData(saveTime) {
		if(logList.length > 6000) {
			clean();
		}
		if (!saveTime) {
			chrome.storage.local.set({
				logger: {
					resetTime: resetTime,
					currentLog: currentLog,
					logList: logList
				}
			});
		} else {
			chrome.storage.local.set({
				logger: {
					resetTime: moment().format(),
					currentLog: currentLog,
					logList: logList
				}
			});
		}
	}

	function returnLogs(tagsToShow, showLog, showInfo, showWarn, showError, showTime) {
		return new Promise(function(resolve) {
			chrome.storage.local.get("logger", function(data) {
				var localLogList = data.logger.logList;
				var endLogs = ["\n"];
				for (var logData of localLogList) {
					if (!tagsToShow || tagsToShow.indexOf(logData.tag) > -1) {
						var tempLog = [];
						for (var log of logData.logs) {
							if (log.type === LOG && showLog) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
							}
							if (log.type === INFO && showInfo) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
							}
							if (log.type === WARN && showWarn) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
							}
							if (log.type === ERROR && showError) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
							}
							if (log.type === TIME && showTime) {
								tempLog.push(`${log.timestamp}: ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
							}
						}
						if (tempLog.length) {
							endLogs.push(`-----------------------------------------------------------`);
							endLogs.push(`${logData.timestamp}: ${log.source}: "${logData.tag}"`);
							Array.prototype.push.apply(endLogs, tempLog);
						}
					}
				}
				resolve(endLogs.join("\n"));
			});
		});
	}

	function clean() {
		logList = [];
		chrome.storage.local.set({
			logger: {
				resetTime: moment().format(),
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
		saveData
	};
}());