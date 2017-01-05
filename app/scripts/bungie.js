var bungie = (function Bungie() {
	let bungie = {};
	// private variables
	let ACTIVE_TYPE = 0;
	let systemDetails = {};
	let simpleSystems = {};
	let MEMBERSHIP_ID = "";
	let lastRoute = "";
	let lastRequestTime = new Date().getTime();
	let badAddresses = {};
	let localTokens = null;

	function validateTokens() {
		return new Promise(function (resolve) {
			if (localTokens === null) {
				chrome.storage.sync.get(["authCode", "accessToken", "refreshToken"], function (tokens) {
					localTokens = tokens;
					bungie.refreshAccessToken(localTokens).then(resolve);
				});
			} else {
				bungie.refreshAccessToken(localTokens).then(resolve);
			}
		});
	}

	function _request(opts) {
		if (badAddresses[opts.shortRoute]) {
			badAddresses[opts.shortRoute] += 1;
			if (badAddresses[opts.shortRoute] > 6) {
				badAddresses[opts.shortRoute] = 0;
			} else {
				opts.incomplete();
				return false;
			}
		}
		var currentTime = new Date().getTime();
		if ((lastRoute === opts.shortRoute && currentTime - lastRequestTime >= 800) || lastRoute !== opts.shortRoute) { // make sure not to poll more than once per second for the same type of request
			console.info(`Bungie API Query Route ${opts.route}`);
			lastRoute = opts.shortRoute;
			lastRequestTime = currentTime;
			let r = new XMLHttpRequest();
			let method = "GET";
			if (opts.payload) {
				method = "POST";
			}
			r.open(method, "https://www.bungie.net/Platform" + opts.route, true);
			r.setRequestHeader('X-API-Key', API_KEY);
			r.setRequestHeader('Authorization', "Bearer " + localTokens.accessToken.value);
			r.onreadystatechange = function () {
				if (r.readyState === 4) {
					if ((this.status >= 200 && this.status < 400) || opts.noerror) {
						let requestResponse = null;
						try {
							requestResponse = JSON.parse(this.response);
						} catch (e) {
							console.error(e);
							opts.incomplete();
						}
						if (requestResponse !== null) {
							if (requestResponse.ErrorCode !== 1 && !opts.noerror) {
								console.error(requestResponse);
								badAddresses[opts.shortRoute] = 1;
								opts.incomplete();
							} else { // no errors, continue
								opts.complete(requestResponse.Response || requestResponse, requestResponse);
							}
						}
					} else {
						console.error(this.status, this.response);
						opts.incomplete();
					}
				}
			};
			r.onerror = function () {
				console.error("Request Failed to " + opts.route);
				opts.incomplete();
			};
			if (method === "POST") {
				r.send(JSON.stringify(opts.payload));
			} else {
				r.send();
			}
		} else {
			setTimeout(function () {
				_request(opts);
			}, 1000);
		}
	}

	function bungiePOST(url, data) {
		return new Promise(function (resolve) {
			let r = new XMLHttpRequest();
			r.open("POST", url, true);
			r.setRequestHeader('X-API-Key', API_KEY);
			r.onreadystatechange = function () {
				if (r.readyState === 4) {
					if (this.status >= 200 && this.status < 400) {
						resolve(JSON.parse(this.response));
					}
				}
			};
			r.send(JSON.stringify(data));
		});
	}

	bungie.refreshAccessToken = function (tokens) {
		return new Promise(function (resolve) {
			let currentTime = new Date().getTime();
			if (tokens.refreshToken.expires <= currentTime) {
				bungiePOST("https://www.bungie.net/Platform/App/GetAccessTokensFromCode/", {
					"code": tokens.authCode
				}).then(function (response) {
					localTokens.accessToken = {
						value: response.Response.accessToken.value,
						readyin: new Date().getTime() + (response.Response.accessToken.readyin * 1000),
						expires: new Date().getTime() + (response.Response.accessToken.expires * 1000),
						added: new Date().getTime()
					};
					localTokens.refreshToken = {
						value: response.Response.refreshToken.value,
						readyin: new Date().getTime() + (response.Response.refreshToken.readyin * 1000),
						expires: new Date().getTime() + (response.Response.refreshToken.expires * 1000),
						added: new Date().getTime()
					};
					chrome.storage.sync.set(localTokens, function () {
						globalTokens = localTokens;
						resolve();
					});
				});
			} else if (tokens.refreshToken.readyin < currentTime || tokens.accessToken.readyin > currentTime) {
				if (tokens.accessToken.expires <= currentTime + 60000 || tokens.accessToken.readyin > currentTime) { // simulate one minute ahead so we can refresh this token before it expires, hopefully
					bungiePOST("https://www.bungie.net/Platform/App/GetAccessTokensFromRefreshToken/", {
						"refreshToken": tokens.refreshToken.value
					}).then(function (response) {
						localTokens.accessToken = {
							value: response.Response.accessToken.value,
							readyin: new Date().getTime() + (response.Response.accessToken.readyin * 1000),
							expires: new Date().getTime() + (response.Response.accessToken.expires * 1000),
							added: new Date().getTime()
						};
						localTokens.refreshToken = {
							value: response.Response.refreshToken.value,
							readyin: new Date().getTime() + (response.Response.refreshToken.readyin * 1000),
							expires: new Date().getTime() + (response.Response.refreshToken.expires * 1000),
							added: new Date().getTime()
						};
						chrome.storage.sync.set(localTokens, function () {
							globalTokens = localTokens;
							resolve();
						});
					});
				} else {
					resolve();
				}
			} else {
				resolve();
			}
		});
	};

	function networkRequest(opts) {
		validateTokens().then(function () {
			_request(opts);
		});
	}

	bungie.getCurrentBungieAccount = function () {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/User/GetCurrentBungieAccount/',
				shortRoute: '/User/GetCurrentBungieAccount/',
				incomplete: reject,
				complete: function (res) {
					getOption("activeType").then(function (activeType) {
						ACTIVE_TYPE = activeType;
						for (let account of res.destinyAccounts) {
							systemDetails[account.userInfo.membershipType] = {
								displayName: account.userInfo.displayName,
								membershipId: account.userInfo.membershipId,
								membershipType: account.userInfo.membershipType,
								characters: account.characters
							};
							simpleSystems[account.userInfo.membershipType] = {
								displayName: account.userInfo.displayName,
								membershipId: account.userInfo.membershipId,
								membershipType: account.userInfo.membershipType,
								lastPlayed: account.lastPlayed
							};
						}
						if (activeType === "psn" && systemDetails[2]) {
							ACTIVE_TYPE = 2;
						} else if (activeType === "xbl" && systemDetails[1]) {
							ACTIVE_TYPE = 1;
						} else if (activeType === "psn" && systemDetails[1]) {
							ACTIVE_TYPE = 1;
							setOption("activeType", "xbl");
						} else if (activeType === "xbl" && systemDetails[2]) {
							ACTIVE_TYPE = 2;
							setOption("activeType", "psn");
						}
						if (systemDetails[ACTIVE_TYPE]) {
							MEMBERSHIP_ID = systemDetails[ACTIVE_TYPE].membershipId;
						}
						localStorage.systems = JSON.stringify(simpleSystems);
						resolve(res);
					});
				}
			});
		});
	};

	bungie.accountInfo = function () {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/' + ACTIVE_TYPE + '/Account/' + MEMBERSHIP_ID + '/Summary/',
				shortRoute: '/Destiny/Account/Summary/',
				method: 'GET',
				incomplete: reject,
				complete: function (response) {
					let flattenedCharacters = [];
					for (let character of response.data.characters) {
						let flatCharacter = {
							characterId: character.characterBase.characterId,
							classHash: character.characterBase.classHash,
							classType: character.characterBase.classType,
							currentActivityHash: character.characterBase.currentActivityHash,
							dateLastPlayed: character.characterBase.dateLastPlayed,
							emblemHash: character.emblemHash,
							emblemPath: character.emblemPath,
							genderHash: character.characterBase.genderHash,
							genderType: character.characterBase.genderType,
							isPrestigeLevel: character.isPrestigeLevel,
							level: character.characterLevel,
							membershipId: character.characterBase.membershipId,
							membershipType: character.characterBase.membershipType,
							percentToNextLevel: character.percentToNextLevel,
							powerLevel: character.characterBase.powerLevel,
							raceHash: character.characterBase.raceHash
						};
						flattenedCharacters.push(flatCharacter);
					}
					systemDetails[ACTIVE_TYPE].characters = flattenedCharacters;
					resolve(response);
				}
			});
		});
	};

	bungie.activity = function (characterId, gameMode, count, page) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/Stats/ActivityHistory/' + ACTIVE_TYPE + '/' + MEMBERSHIP_ID + '/' + characterId + "/?mode=" + gameMode + "&count=" + count + "&page=" + page,
				shortRoute: '/Destiny/Stats/ActivityHistory/',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.vault = function () {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/' + ACTIVE_TYPE + '/MyAccount/Vault/',
				shortRoute: '/Destiny//MyAccount/Vault/',
				incomplete: reject,
				complete: function (result) {
					resolve(result);
				}
			});
		});
	};

	bungie.inventory = function (characterId) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/' + ACTIVE_TYPE + '/Account/' + MEMBERSHIP_ID + '/Character/' + characterId + '/Inventory/?definitions=false',
				shortRoute: '/Destiny//Account//Character//Inventory/?definitions=false',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.inventory2 = function (characterId) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/' + ACTIVE_TYPE + '/Account/' + MEMBERSHIP_ID + '/Character/' + characterId + '/Complete/?definitions=false',
				shortRoute: '/Destiny//Account//Character//Inventory/?definitions=false',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.carnage = function (activityId) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/Stats/PostGameCarnageReport/' + activityId + '/?definitions=false',
				shortRoute: '/Destiny/Stats/PostGameCarnageReport//?definitions=false',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.advisorsForAccount = function () {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/' + ACTIVE_TYPE + '/Account/' + MEMBERSHIP_ID + '/Advisors/?definitions=false',
				shortRoute: '/Destiny/Account/Advisors/',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.factions = function (characterId) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/' + ACTIVE_TYPE + '/Account/' + MEMBERSHIP_ID + '/Character/' + characterId + '/Progression/?definitions=false',
				shortRoute: '/Destiny//Account//Character//Progression/?definitions=false',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.getVendorForCharacter = function (characterId, vendorId) {
		return new Promise(function (resolve, reject) {
			database.getEntry("vendors", vendorId + "-" + characterId).then(function (data) {
				if (!data || moment(data.nextRefreshDate).isBefore(moment()) || moment(data.nextRefreshDate).format("YYYY") === "9999") {
					networkRequest({
						route: `/Destiny/${ACTIVE_TYPE}/MyAccount/Character/${characterId}/Vendor/${vendorId}/Metadata/`,
						shortRoute: '/Destiny//MyAccount/Character//Vendor//Metadata/',
						noerror: true,
						incomplete: reject,
						complete: function (bungieResult) {
							if (bungieResult.data) {
								if (moment(bungieResult.data.vendor.nextRefreshDate).format("YYYY") === "9999" || moment(bungieResult.data.vendor.nextRefreshDate).isBefore(moment())) {
									bungieResult.data.vendor.nextRefreshDate = moment().add(1, "days").format("YYYY-MM-DDTHH:mm:ssZ");
								}
								bungieResult.data.vendor.vendorCharacterHash = vendorId + "-" + characterId;
								database.addSingle("vendors", bungieResult.data.vendor).then(resolve);
							} else { // Vendor not found
								resolve(bungieResult);
							}
						}
					});
				} else {
					resolve(data);
				}
			});
		});
	};

	bungie.getXur = function () {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: `/Destiny/Advisors/Xur/?definitions=false`,
				shortRoute: '/Destiny/Advisors/Xur/',
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.transfer = function (characterId, itemId, itemReferenceHash, stackSize, transferToVault) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/TransferItem/',
				shortRoute: '/Destiny/TransferItem/',
				noerror: true,
				payload: {
					characterId: characterId,
					membershipType: ACTIVE_TYPE,
					itemId: itemId,
					itemReferenceHash: itemReferenceHash,
					stackSize: stackSize,
					transferToVault: transferToVault
				},
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.lock = function (characterId, instanceId) {
		return new Promise(function (resolve, reject) {
			networkRequest({
				route: '/Destiny/SetLockState/',
				shortRoute: '/Destiny/SetLockState/',
				noerror: true,
				payload: {
					characterId: characterId,
					membershipType: ACTIVE_TYPE,
					itemId: instanceId,
					state: true
				},
				incomplete: reject,
				complete: resolve
			});
		});
	};

	bungie.getCurrentAccount = function () {
		return systemDetails[ACTIVE_TYPE];
	};

	bungie.ready = function () {
		return ACTIVE_TYPE !== 0 && MEMBERSHIP_ID !== "" && typeof systemDetails[ACTIVE_TYPE] !== "undefined";
	};

	bungie.getMemberships = function () {
		return Object.keys(systemDetails);
	}

	return bungie;
}());