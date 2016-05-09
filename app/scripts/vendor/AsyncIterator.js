/**
 * Batch processes large datasets with the help of requestAnimationFrame in order
 * to not lock up the single thread.
 */
var asyncIterator = function(arr, cb, batchSize) {
	var arr = arr;
	var cb = cb;
	var batchSize = parseInt(batchSize) || 10;
	var position = 0;
	var results = [];

	var _iterate = function(resolve, reject) {
		for (var i = 0; i < batchSize; i++) {
			if (position >= arr.length) {
				break;
			}

			var currentItem = arr[position];

			results[position] = cb(currentItem, position);

			position++;
		}
		if (!arr) {
			console.log(this)
		}
		if (position < arr.length) {
			window.requestAnimationFrame(function() {
				_iterate(resolve, reject);
			});
		} else {
			resolve(results);
		}
	}
	return new Promise(_iterate);
};