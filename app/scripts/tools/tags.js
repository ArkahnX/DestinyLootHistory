window.tags = (function() {
	let tags = {};
	let localOptions = {};
	let hashTags = ["tagWeaponInstances", "tagArmorInstances", "tagOtherInstances"];
	let indexTags = ["tagWeaponIndexes", "tagArmorIndexes", "tagOtherIndexes"];
	let tagArrays = ["tagList1", "tagList2", "tagList3"];
	let tagHashes = ["keep", "junk", "infuseup", "infusionfodder", "custom"];
	let tagNames = {
		keep: "Keep",
		junk: "Bad Rolls",
		infuseup: "Needs Infusing",
		infusionfodder: "Infusion Fuel",
		custom: "Custom Tag"
	};

	tags.tagName = function(tagHash) {
		var name = tagHashes[tagHash];
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
			return false;
		}
		if (tagType(item) > -1) {
			return true;
		}
		return false;
	};

	tags.getTag = function(item) {
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		let hashIndex = localOptions[hashTags[tagType]].indexOf(item.itemInstanceId);
		if (hashIndex > -1) {
			let tagIndex = localOptions[indexTags[tagType]][hashIndex].split(":");
			let arrayIndex = parseInt(tagIndex[0], 10);
			let tagId = parseInt(tagIndex[1], 10);
			for (var tag of localOptions[tagArrays[arrayIndex]]) {
				if (tag.tagId === tagId) {
					return tag;
				}
			}
		}
		return false;
	};

	tags.removeTag = function(item, dontSave) {
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		let hashIndex = localOptions[hashTags[tagType]].indexOf(item.itemInstanceId);
		if (hashIndex > -1) {
			let tagIndex = localOptions[indexTags[tagType]][hashIndex].split(":");
			let arrayIndex = parseInt(tagIndex[0], 10);
			let tagId = parseInt(tagIndex[1], 10);
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
					return true;
				}
			}
		}
		return false;
	};

	tags.setTag = function(item, tagHash) {
		let tagType = tags.canTag(item);
		if (tagType === -1) {
			return false;
		}
		tags.removeTag(item, true);
		localOptions.tagIdIndex += 1;
		localOptions[hashTags[tagType]].push(item.itemInstanceId);
		localOptions[indexTags[tagType]].push(`${tagType}:${localOptions.tagIdIndex}`);
		for (var i = 0; i < 3; i++) {
			if (localOptions[tagArrays[i]].length < 200) {
				localOptions[tagArrays[i]].push({
					tagId:localOptions.tagIdIndex,
					tagHash:tagHash
				});
				// setOption(tagArrays[i], localOptions[tagArrays[i]]);
				// setOption(indexTags[tagType], localOptions[indexTags[tagType]]);
				// setOption(hashTags[tagType], localOptions[hashTags[tagType]]);
				// setOption("tagIdIndex", localOptions.tagIdIndex);
				setOptionsObject(localOptions);
				break;
			}
		}
	};
	return tags;
}());