var chosenFileEntry = null;



function readFile(name, callback) {
	chrome.fileSystem.chooseEntry({
		type: 'openFile'
	}, function(readOnlyEntry) {

		readOnlyEntry.file(function(file) {
			var reader = new FileReader();

			reader.onerror = errorHandler;
			reader.onloadend = function(e) {
				console.log(e.target.result);
			};

			reader.readAsText(file);
		});
	});
}