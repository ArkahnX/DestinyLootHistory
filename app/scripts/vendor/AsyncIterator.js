/**
 * Batch processes large datasets with the help of requestAnimationFrame in order
 * to not lock up the single thread.
 */
var asyncIterator = function(array, workFunction, size) {
	var batchSize = parseInt(size, 10) || 10;
	var position = 0;
	var results = [];

	var _iterate = function(resolve, reject) {
		for (var i = 0; i < batchSize; i++) {
			if (position >= array.length) {
				break;
			}

			var currentItem = array[position];

			workFunction(currentItem, position);

			position++;
		}
		if (!array) {
			console.log(this);
		}
		if (position < array.length) {
			window.requestAnimationFrame(function() {
				_iterate(resolve, reject);
			});
		} else {
			resolve(results);
		}
	};
	return new Promise(_iterate);
};