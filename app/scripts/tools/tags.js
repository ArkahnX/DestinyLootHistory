window.tags = (function() {
	let tags = {};
	let localOptions = {};
	let tagStorageArrays = ["tags1", "tags2", "tags3", "tags4"];
	let hashArrays = ["tagHashes1", "tagHashes2", "tagHashes3", "tagHashes4"];
	let tagHashes = ["keep", "junk", "infuseup", "infusionfodder", "custom", "default", "needstesting", "needsbetterstats"];
	const defaultTag = {
		tagId: 0,
		tagHash: 5
	};
	let tagNames = {
		default: "Tag Item",
		keep: "Keep",
		junk: "Bad Rolls",
		infuseup: "Needs Infusing",
		infusionfodder: "Infusion Fuel",
		custom: "Custom Tag",
		needsbetterstats: "Watch For Better Stats",
		needstesting: "Needs Testing"
	};
	let tagIcons = {
		default: "tag",
		keep: "star",
		junk: "ban",
		infuseup: "arrow-up",
		infusionfodder: "arrow-down",
		custom: "tags",
		needsbetterstats: "refresh",
		needstesting: "question-circle"
	};

	tags.cleanup = function(inventories) {
		console.time("newCleanup");
		let deleteIndexes = {};
		let itemHashes = [];
		for (let characterInventory of inventories) {
			for (let item of characterInventory.inventory) {
				if (item.itemInstanceId) {
					itemHashes.push(item.itemInstanceId);
				}
			}
		}
		for (let arrayIndex = 0; arrayIndex < hashArrays.length; arrayIndex++) {
			let hashArrayName = hashArrays[arrayIndex];
			let storageArrayName = tagStorageArrays[arrayIndex];
			for (let hashIndex = 0; hashIndex < localOptions[hashArrayName].length; hashIndex++) {
				let hash = localOptions[hashArrayName][hashIndex];
				if (itemHashes.indexOf(hash) === -1) {
					if (!deleteIndexes[storageArrayName]) {
						deleteIndexes[storageArrayName] = [];
					}
					deleteIndexes[storageArrayName].push(hashIndex);
				}
			}
		}
		for (let arrayIndex = 0; arrayIndex < hashArrays.length; arrayIndex++) {
			let hashArrayName = hashArrays[arrayIndex];
			let storageArrayName = tagStorageArrays[arrayIndex];
			if (deleteIndexes[storageArrayName]) {
				deleteIndexes[storageArrayName].sort(function(a, b) {
					return b - a;
				});
				for (let index of deleteIndexes[storageArrayName]) {
					localOptions[hashArrayName].splice(index, 1);
					localOptions[storageArrayName].splice(index, 1);
				}
			}
		}
		console.timeEnd("newCleanup");
		console.log(localOptions);
		return setOptionsObject(localOptions).then(function() {
			// console.timeEnd("newCleanup");
		});
	};

	tags.getUI = function() {
		let tagSelect = document.getElementById("tag");
		var tagFloat = document.getElementById("tagfloat");
		var showOnly = document.getElementById("showOnly");
		if (tagSelect && tagFloat) {
			for (let i = 0; i < tagHashes.length; i++) {
				let tagName = tagNames[tagHashes[i]];
				let tagIcon = tagIcons[tagHashes[i]];
				let optionElement = document.createElement("option");
				optionElement.value = i;
				optionElement.textContent = tagName;
				if (i === 5) {
					optionElement.selected = true;
				}
				tagSelect.appendChild(optionElement);
				if (showOnly) {
					let optionElement = document.createElement("option");
					optionElement.value = i;
					optionElement.textContent = tagName;
					if (i === 5) {
						optionElement.textContent = "Show All";
						optionElement.selected = true;
					}
					showOnly.appendChild(optionElement);
				}
				if (i !== 5) {
					var liElement = document.createElement("li");
					liElement.innerHTML = `<i class="fa fa-${tagIcon} fa-lg"></i> ${tagName}`;
					liElement.value = i;
					liElement.classList.add("button");
					tagFloat.appendChild(liElement);
				}
			}
		}
		tagSelect.addEventListener("change", function() {
			var origin = elements.tooltip.dataset.itemInstanceId;
			var itemHash = parseInt(elements.tooltip.dataset.itemHash);
			var tagType = parseInt(tagSelect.value);
			var results = document.querySelectorAll(`.item-container[data-id="${origin}"]`);
			for (var result of results) {
				var tag = result.children[3];
				tag.classList.add("tag-corner");
				tag.innerHTML = `<i class="fa fa-${tags.getIcon({tagHash:tagType})} fa-lg"></i>`;
				result.children[0].dataset.tagHash = tagType;
			}
			tags.setTag({
				itemInstanceId: origin,
				itemHash: itemHash,
			}, tagType);
		});
		tagFloat.addEventListener("click", function(event) {
			var value = event.target.value;
			if (typeof value !== "undefined") {
				var origin = tagFloat.dataset.itemInstanceId;
				var itemHash = parseInt(tagFloat.dataset.itemHash);
				var tagType = parseInt(event.target.value);
				var results = document.querySelectorAll(`.item-container[data-id="${origin}"]`);
				for (var result of results) {
					var tag = result.children[3];
					tag.classList.add("tag-corner");
					tag.innerHTML = `<i class="fa fa-${tags.getIcon({tagHash:tagType})} fa-lg"></i>`;
					result.children[0].dataset.tagHash = tagType;
				}
				tags.setTag({
					itemInstanceId: origin,
					itemHash: itemHash,
				}, tagType);
				tagFloat.classList.add("invisible");
			}
		}, true);
	};

	tags.getIcon = function(tag) {
		if (tag === false) {
			return "tag";
		}
		var name = tagHashes[tag.tagHash];
		return tagIcons[name];
	};

	tags.getName = function(tag) {
		if (tag === false) {
			return tagNames["default"];
		}
		var name = tagHashes[tag.tagHash];
		return tagNames[name];
	};

	tags.update = function() {
		localOptions = {
			tags1: globalOptions.tags1,
			tags2: globalOptions.tags2,
			tags3: globalOptions.tags3,
			tags4: globalOptions.tags4,
			tagHashes4: globalOptions.tagHashes4,
			tagHashes3: globalOptions.tagHashes3,
			tagHashes2: globalOptions.tagHashes2,
			tagHashes1: globalOptions.tagHashes1,
			tagIdIndex: globalOptions.tagIdIndex
		};
		// console.log(localOptions)
	};

	function tagType(item) {
		let itemDef = getItemDefinition(item.itemHash, item);
		if (itemDef.itemType === 3 || (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1)) {
			return 0; // primary, special, heavy weapons
		}
		if (itemDef.itemCategoryHashes && (itemDef.itemCategoryHashes.indexOf(39) > -1 || itemDef.itemCategoryHashes.indexOf(38) > -1 || itemDef.itemCategoryHashes.indexOf(49) > -1)) {
			return 2; // ghosts, artifacts, class items
		}
		if (itemDef.itemType === 2 || (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1)) {
			return 1; // helmets, gauntlets, chest armor, legs
		}
		return -1;
	}

	tags.canTag = function(item) {
		if (!item.itemInstanceId) {
			return -1;
		}
		return tagType(item);
	};

	tags.getTag = function(item) {
		console.time("getTag");
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		let tagIndex = localOptions[hashArrays[tagType]].indexOf(item.itemInstanceId);
		if (tagIndex > -1) {
			console.timeEnd("getTag");
			return localOptions[tagStorageArrays[tagType]][tagIndex];
		}
		console.timeEnd("getTag");
		return defaultTag;
	};

	tags.setTagWithoutSaving = function(item, tagHash) {
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		for (let arrayIndex = 0; arrayIndex < hashArrays.length; arrayIndex++) {
			let tagIndex = localOptions[hashArrays[tagType]].indexOf(item.itemInstanceId);
			if (tagIndex > -1) {
				localOptions[tagStorageArrays[tagType]][tagIndex].tagHash = tagHash;
				return true;
			}
		}
		if (localOptions[hashArrays[tagType]].length < 300) {
			localOptions[hashArrays[tagType]].push(item.itemInstanceId);
			localOptions[tagStorageArrays[tagType]].push({
				tagId: localOptions.tagIdIndex,
				tagHash: tagHash
			});
			return true;
		} else {
			console.error("not enough space");
		}
	};

	tags.saveAll = function() {
		return setOptionsObject(localOptions).then(function() {
			console.log("Done");
		});
	};

	let timer = -1;

	function updateGlobalOptions() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			getAllOptions().then(function(options) {
				globalOptions = options;
				tags.update();
			});
		}, 10000);
	}

	tags.setTag = function(item, tagHash) {
		console.time("setNewTag");
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		// for (let arrayIndex = 0; arrayIndex < hashArrays.length; arrayIndex++) {
		let tagIndex = localOptions[hashArrays[tagType]].indexOf(item.itemInstanceId);
		if (tagIndex > -1) {
			// return true;
			if (localOptions[tagStorageArrays[tagType]][tagIndex].tagHash !== tagHash) {
				localOptions[tagStorageArrays[tagType]][tagIndex].tagHash = tagHash;
				return setOptionsObject(localOptions).then(function() {
					console.timeEnd("setNewTag");
					updateGlobalOptions();
				});
			} else {
				console.timeEnd("setNewTag");
				return true;
			}
		}
		// }
		// for (let arrayIndex = 0; arrayIndex < hashArrays.length; arrayIndex++) {
		if (localOptions[hashArrays[tagType]].length < 300) {
			localOptions[hashArrays[tagType]].push(item.itemInstanceId);
			localOptions[tagStorageArrays[tagType]].push({
				tagId: localOptions.tagIdIndex,
				tagHash: tagHash
			});
			// return true;
			return setOptionsObject(localOptions).then(function() {
				console.timeEnd("setNewTag");
				updateGlobalOptions();
			});
		} else {
			console.error("not enough space");
		}
		// }
	};
	return tags;
}());