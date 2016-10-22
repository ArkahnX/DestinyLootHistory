window.tags = (function() {
	let tags = {};
	let localOptions = {};
	let hashTags = ["tagWeaponInstances", "tagArmorInstances", "tagOtherInstances"];
	let indexTags = ["tagWeaponIndexes", "tagArmorIndexes", "tagOtherIndexes"];
	let tagArrays = ["tagList1", "tagList2", "tagList3"];
	let tagHashes = ["keep", "junk", "infuseup", "infusionfodder", "custom", "default", "needstesting"];
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
		needstesting: "Needs Testing"
	};
	let tagIcons = {
		default: "tag",
		keep: "star",
		junk: "ban",
		infuseup: "arrow-up",
		infusionfodder: "arrow-down",
		custom: "tags",
		needstesting: "question-circle"
	};

	tags.cleanup = function(inventories) {
		console.time("cleanup");
		let itemHashes = [];
		let deleteHashes = [];
		for (let characterInventory of inventories) {
			for (let item of characterInventory.inventory) {
				if (item.itemInstanceId) {
					itemHashes.push(item.itemInstanceId);
				}
			}
		}
		for (let hashTag of hashTags) {
			for (let hash of localOptions[hashTag]) {
				if (itemHashes.indexOf(hash) === -1) {
					deleteHashes.push(hash);
				} else {
					console.log(hash)

				}
			}
		}
		for (let hash of deleteHashes) {
			tags.quickRemoveTag(hash);
		}
		console.log(localOptions)
		setOptionsObject(localOptions);
		console.timeEnd("cleanup");
	};

	tags.getUI = function() {
		let tagSelect = document.getElementById("tag");
		var tagFloat = document.getElementById("tagfloat");
		if (tagSelect && tagFloat) {
			for (let i = 0; i < tagHashes.length; i++) {
				let tagName = tagNames[tagHashes[i]];

				var optionElement = document.createElement("option");
				optionElement.value = i;
				optionElement.textContent = tagName;
				if (i === 5) {
					optionElement.selected = true;
				}
				tagSelect.appendChild(optionElement);
				if (i !== 5) {
					var liElement = document.createElement("li");
					liElement.textContent = tagName;
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
			}
			tags.setTag({
				itemInstanceId: origin,
				itemHash: itemHash,
			}, tagType);
		});
		tagFloat.addEventListener("click", function(event) {
			var origin = tagFloat.dataset.itemInstanceId;
			var itemHash = parseInt(tagFloat.dataset.itemHash);
			var tagType = parseInt(event.target.value);
			var results = document.querySelectorAll(`.item-container[data-id="${origin}"]`);
			for (var result of results) {
				var tag = result.children[3];
				tag.classList.add("tag-corner");
				tag.innerHTML = `<i class="fa fa-${tags.getIcon({tagHash:tagType})} fa-lg"></i>`;
			}
			tags.setTag({
				itemInstanceId: origin,
				itemHash: itemHash,
			}, tagType);
			tagFloat.classList.add("hidden");
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
			tagWeaponInstances: globalOptions.tagWeaponInstances,
			tagArmorInstances: globalOptions.tagArmorInstances,
			tagOtherInstances: globalOptions.tagOtherInstances,
			tagArmorIndexes: globalOptions.tagArmorIndexes,
			tagWeaponIndexes: globalOptions.tagWeaponIndexes,
			tagOtherIndexes: globalOptions.tagOtherIndexes,
			tagList1: globalOptions.tagList1,
			tagList2: globalOptions.tagList2,
			tagList3: globalOptions.tagList3,
			tagIdIndex: globalOptions.tagIdIndex
		};
	};

	function tagType(item) {
		let itemDef = getItemDefinition(item.itemHash, item);
		if (itemDef.itemType === 3 || (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(1) > -1)) {
			return 0;
		}
		if (itemDef.itemCategoryHashes && (itemDef.itemCategoryHashes.indexOf(39) > -1 || itemDef.itemCategoryHashes.indexOf(38) > -1)) {
			return 2;
		}
		if (itemDef.itemType === 2 || (itemDef.itemCategoryHashes && itemDef.itemCategoryHashes.indexOf(20) > -1)) {
			return 1;
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
		let hashIndex = localOptions[hashTags[tagType]].indexOf(item.itemInstanceId);
		if (hashIndex > -1) {
			let tagIndex = localOptions[indexTags[tagType]][hashIndex].split(":");
			let arrayIndex = parseInt(tagIndex[2] || 0, 10);
			let tagId = parseInt(tagIndex[1], 10);
			for (var tag of localOptions[tagArrays[arrayIndex]]) {
				if (tag.tagId === tagId) {
					console.timeEnd("getTag");
					return tag;
				}
			}
		}
		console.timeEnd("getTag");
		return defaultTag;
	};

	tags.removeTag = function(item, dontSave) {
		console.time("removeTag");
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		let hashIndex = localOptions[hashTags[tagType]].indexOf(item.itemInstanceId);
		if (hashIndex > -1) {
			let tagIndex = localOptions[indexTags[tagType]][hashIndex].split(":");
			let tagId = parseInt(tagIndex[1], 10);
			let arrayIndex = parseInt(tagIndex[2] || 0, 10);
			for (let i = 0; i < localOptions[tagArrays[arrayIndex]].length; i++) {
				let tag = localOptions[tagArrays[arrayIndex]][i];
				if (tag.tagId === tagId) {
					localOptions[hashTags[tagType]].splice(hashIndex, 1);
					localOptions[indexTags[tagType]].splice(hashIndex, 1);
					localOptions[tagArrays[arrayIndex]].splice(i, 1);
					if (!dontSave) {
						setOption(hashTags[tagType], localOptions[hashTags[tagType]]);
						setOption(indexTags[tagType], localOptions[indexTags[tagType]]);
						setOption(tagArrays[arrayIndex], localOptions[tagArrays[arrayIndex]]);
					}
					console.timeEnd("removeTag");
					return true;
				}
			}
		}
		console.timeEnd("removeTag");
		return false;
	};

	tags.quickRemoveTag = function(itemInstanceId) {
		console.time("quickRemoveTag");
		for (var tagType = 0; tagType < hashTags.length; tagType++) {
			let hashIndex = localOptions[hashTags[tagType]].indexOf(itemInstanceId);
			if (hashIndex > -1) {
				let tagIndex = localOptions[indexTags[tagType]][hashIndex].split(":");
				let tagId = parseInt(tagIndex[1], 10);
				let arrayIndex = parseInt(tagIndex[2] || 0, 10);
				for (let i = 0; i < localOptions[tagArrays[arrayIndex]].length; i++) {
					let tag = localOptions[tagArrays[arrayIndex]][i];
					if (tag.tagId === tagId) {
						localOptions[hashTags[tagType]].splice(hashIndex, 1);
						localOptions[indexTags[tagType]].splice(hashIndex, 1);
						localOptions[tagArrays[arrayIndex]].splice(i, 1);
						console.timeEnd("quickRemoveTag");
						return true;
					}
				}
				break;
			}
		}
	};

	tags.setTag = function(item, tagHash) {
		console.time("setTag");
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		tags.removeTag(item, true);
		localOptions.tagIdIndex += 1;
		localOptions[hashTags[tagType]].push(item.itemInstanceId);
		for (var i = 0; i < 3; i++) {
			if (localOptions[tagArrays[i]].length < 200) {
				localOptions[indexTags[tagType]].push(`${tagType}:${localOptions.tagIdIndex}:${i}`);
				localOptions[tagArrays[i]].push({
					tagId: localOptions.tagIdIndex,
					tagHash: tagHash
				});
				// setOption(tagArrays[i], localOptions[tagArrays[i]]);
				// setOption(indexTags[tagType], localOptions[indexTags[tagType]]);
				// setOption(hashTags[tagType], localOptions[hashTags[tagType]]);
				// setOption("tagIdIndex", localOptions.tagIdIndex);
				setOptionsObject(localOptions);
				break;
			}
		}
		console.timeEnd("setTag");
	};
	return tags;
}());