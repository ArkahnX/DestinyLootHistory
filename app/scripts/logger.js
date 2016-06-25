var logger = (function() {
	const TIME = "time";
	const LOG = "log";
	const ERROR = "error";
	const WARN = "warn";
	const INFO = "info";
	var logList = [];

	var pageWidth = 0;


	var currentLog = null;

	function startLogging(tag) {
		if (currentLog) {
			logList.push(currentLog);
			currentLog = null;
		}
		currentLog = {
			startTime: moment().format(),
			utcTime: moment().utc().format(),
			logs: [],
			timeTags: {},
			tag: tag || ""
		};
	}

	function _getErrorObject() {
		try {
			throw Error('');
		} catch (err) {
			return err;
		}
	}

	function _getSource() {
		var err = _getErrorObject();
		var caller_line = err.stack.split("\n")[6];
		var index = caller_line.split("/");
		index = index[index.length - 1];
		var clean = `${caller_line.split(" ")[5]} (${index.slice(0, index.length-3)})`;
		if(clean.length > pageWidth) {
			pageWidth = clean.length;
		}
		return clean;
	}

	function _log(type, data) {
		if(!currentLog) {
			startLogging(type);
		}
		return {
			type: type,
			data: data,
			timestamp: moment().format(),
			utcTime: moment().utc().format(),
			source: _getSource()
		};
	}

	function time(tag) {
		let startTime = window.performance.now();
		currentLog.timeTags[tag] = startTime;
	}

	function timeEnd(tag) {
		let endTime = window.performance.now();
		if (currentLog.timeTags[tag]) {
			currentLog.logs.push(_log(TIME, endTime - currentLog.timeTags[tag]));
		}
	}

	function error(data) {
		currentLog.logs.push(_log(ERROR, data));
	}

	function log(data) {
		currentLog.logs.push(_log(LOG, data));
	}

	function info(data) {
		currentLog.logs.push(_log(INFO, data));
	}

	function warn(data) {
		currentLog.logs.push(_log(WARN, data));
	}

	function _pad(string,width) {
		return " ".repeat(Math.max(0, width - string.length)) + string;
	}

	function returnLogs(tagsToShow, showLog, showInfo, showWarn, showError, showTime) {
		startLogging();
		console.log(logList)
		var endLogs = ["\n"];
		for (var logData of logList) {
			if (!tagsToShow || tagsToShow.indexOf(logData.tag)) {
				for (var log of logData.logs) {
					if (log.type === LOG && (showLog || !tagsToShow)) {
						endLogs.push(`${log.timestamp} (${log.utcTime}): ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
					}
					if (log.type === INFO && (showInfo || !tagsToShow)) {
						endLogs.push(`${log.timestamp} (${log.utcTime}): ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
					}
					if (log.type === WARN && (showWarn || !tagsToShow)) {
						endLogs.push(`${log.timestamp} (${log.utcTime}): ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
					}
					if (log.type === ERROR && (showError || !tagsToShow)) {
						endLogs.push(`${log.timestamp} (${log.utcTime}): ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
					}
					if (log.type === TIME && (showTime || !tagsToShow)) {
						endLogs.push(`${log.timestamp} (${log.utcTime}): ${_pad(log.source,pageWidth)}: ${_pad(log.type,5)}: ${log.data}`);
					}
				}
			}
		}
		return endLogs.join("\n");
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
		returnLogs,
		startLogging
	};
}());