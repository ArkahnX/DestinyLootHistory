var consoleLog = function() {
    var oldConsoleLog = null;
    var oldConsoleTime = null;
	var oldConsoleTimeEnd = null;
	return {
		enable: function() {
			if (oldConsoleLog == null && oldConsoleTime == null && oldConsoleTimeEnd == null) {
				return;
			}

            window['console']['log'] = oldConsoleLog;
            window['console']['time'] = oldConsoleTime;
			window['console']['timeEnd'] = oldConsoleTimeEnd;
		},
		disable: function() {
            oldConsoleLog = console.log;
            oldConsoleTime = console.time;
			oldConsoleTimeEnd = console.timeEnd;
            // window['console']['log'] = function() {};
            window['console']['time'] = function() {};
			window['console']['timeEnd'] = function() {};
		}
	};
}();