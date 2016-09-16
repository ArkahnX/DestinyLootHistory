var database = (function() {
	var database = {};
	database.db = null;
	database.upgrade = false;
	database.allStores = ["currencies", "matches", "progression", "inventories", "itemChanges"];

	database.onerror = function(e) {
		console.error(e);
	};

	database.addFromArray = function(name, entries) {
		return new Promise(function(resolve) {
			var db = database.db;
			var trans = db.transaction([name], "readwrite");
			var store = trans.objectStore(name);
			sequence(entries, function(entry, complete) {
				var request = store.put(entry);

				request.onsuccess = function() {
					complete();
				};

				request.onerror = database.onerror;
			}, function() {}).then(function() {
				console.log("Completed: " + name);
				resolve();
			});
		});
	};

	database.addSingle = function(name, entry, complete) {
		return new Promise(function(resolve) {
			var db = database.db;
			var trans = db.transaction([name], "readwrite");
			var store = trans.objectStore(name);

			var request = store.put(entry);

			request.onsuccess = function(e) {
				resolve();
			};

			request.onerror = database.onerror;
		});
	};

	database.getEntry = function(name, id) {
		console.time("getEntry");
		return new Promise(function(resolve) {
			var db = database.db;
			var trans = db.transaction([name], "readonly");
			var store = trans.objectStore(name);

			var request = store.get(id);

			request.onsuccess = function(e) {
				console.timeEnd("getEntry");
				resolve(e.target.result);
			};

			request.onerror = database.onerror;
		});
	};

	database.getAllEntries = function(name) {
		console.time("getAllEntries: " + name);
		return new Promise(function(resolve) {
			var db = database.db;
			var trans = db.transaction([name], "readonly");
			var store = trans.objectStore(name);
			var items = [];

			trans.oncomplete = function() {
				console.timeEnd("getAllEntries: " + name);
				var finalResult = {};
				finalResult[name] = items;
				resolve(finalResult);
			};

			// Get everything in the store;
			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(keyRange);

			cursorRequest.onsuccess = function(e) {
				var result = e.target.result;
				if (!!result == false)
					return;

				items.push(result.value);
				result.continue();
			};

			cursorRequest.onerror = database.onerror;
		});
	};

	database.getMultipleStores = function(storesArray) {
		console.time("multipleStores");
		return new Promise(function(resolve) {
			var result = {};
			sequence(storesArray, function(entry, complete) {
				database.getAllEntries(entry).then(complete);
			}, function(store, entry) {
				result[entry] = store[entry];
			}).then(function() {
				console.timeEnd("multipleStores");
				resolve(result);
			});
		});
	};

	database.deleteTodo = function(id) {
		var db = database.db;
		var trans = db.transaction(["todo"], "readwrite");
		var store = trans.objectStore("todo");

		var request = store.delete(id);

		request.onsuccess = function(e) {
			database.getAllTodoItems();
		};

		request.onerror = function(e) {
			console.log("Error Adding: ", e);
		};
	};

	database.addFromObject = function(result) {
		return new Promise(function(resolve) {
			// console.log(result);
			sequence(["currencies", "inventories", "itemChanges", "matches", "progression"], function(entry, complete) {
				database.addFromArray(entry, result[entry]).then(complete);
			}, function() {}).then(function() {
				resolve();
				// console.log("DONE!");
			});
		});
	};

	database.update = function(result) {
		return new Promise(function(resolve) {
			if (database.upgrade) {
				// console.log(result);
				sequence(["currencies", "inventories", "itemChanges", "matches", "progression"], function(entry, complete) {
					database.addFromArray(entry, result[entry]).then(complete);
				}, function() {}).then(function() {
					resolve();
					// console.log("DONE!");
				});
			} else {
				resolve();
			}
		});
	};

	database.open = function() {
		return new Promise(function(resolve) {
			console.time("database");
			var request = indexedDB.open("DestinyLootHistory", 8);

			// We can only create Object stores in a versionchange transaction.
			request.onupgradeneeded = function(e) {
				console.log(e)
				if (e.oldVersion === 0) {
					database.upgrade = true;
				}
				var db = e.target.result;

				// A versionchange transaction is started automatically.
				e.target.transaction.onerror = database.onerror;

				// if (db.objectStoreNames.contains("currencies")) {
				// 	db.deleteObjectStore("currencies");
				// }
				// if (db.objectStoreNames.contains("inventories")) {
				// 	db.deleteObjectStore("inventories");
				// }
				// if (db.objectStoreNames.contains("matches")) {
				// 	db.deleteObjectStore("matches");
				// }
				// if (db.objectStoreNames.contains("progression")) {
				// 	db.deleteObjectStore("progression");
				// }
				// if (db.objectStoreNames.contains("itemChanges")) {
				// 	db.deleteObjectStore("itemChanges");
				// }

				var currencyStore = db.createObjectStore("currencies", {
					keyPath: "itemHash"
				});
				currencyStore.createIndex("itemHash", "itemHash", {
					unique: true
				});
				var inventoryStore = db.createObjectStore("inventories", {
					keyPath: "characterId"
				});
				inventoryStore.createIndex("characterId", "characterId", {
					unique: true
				});
				var matchStore = db.createObjectStore("matches", {
					keyPath: "activityInstance"
				});
				matchStore.createIndex("itemHash", "itemHash", {
					unique: true
				});
				var progressStore = db.createObjectStore("progression", {
					keyPath: "characterId"
				});
				progressStore.createIndex("characterId", "characterId", {
					unique: true
				});
				var itemChangeStore = db.createObjectStore("itemChanges", {
					keyPath: "id"
				});
				itemChangeStore.createIndex("id", "id", {
					unique: true
				});
				itemChangeStore.createIndex("timestamp", "timestamp", {
					unique: false
				});
			};

			request.onsuccess = function(e) {
				database.db = e.target.result;
				console.timeEnd("database");
				resolve();
			};

			request.onerror = database.onerror;
		});
	};

	return database;
}());