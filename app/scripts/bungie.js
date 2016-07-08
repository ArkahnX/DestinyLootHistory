var bungie = (function Bungie() {
	if (!localStorage.activeType) {
		localStorage.activeType = "xbl";
	}
	var bungie = {};
	// private vars
	var systemDetails = {};
	var characterMap = {};
	var systemIds = {};
	var membershipId = 0;
	var lastRoute = "";
	var lastRequestTime = new Date().getTime();

	var active = {
		id: 'loading'
	};

	// private methods
	function _getAllCookies(callback) {
		chrome.cookies.getAll({
			domain: ".bungie.net"
		}, callback);
	}

	function _getCookie(name) {
		return new Promise(function(resolve) {
			_getAllCookies(function(cookies) {
				if (chrome.runtime.lastError) {
					logger.error(chrome.runtime.lastError);
				}
				var bungled = null;
				for (var cookieName in cookies) {
					var cookie = cookies[cookieName];
					if (cookie.name === name && cookie.value) {
						bungled = cookie.value;
						break;
					}
				}
				resolve(bungled);
			});
		});
	}

	function _request(opts, errors) {
		var newDate = new Date().getTime();
		if ((lastRoute === opts.shortRoute && newDate - lastRequestTime >= 800) || lastRoute !== opts.shortRoute) { // make sure not to poll more than once per second for the same type of request
			logger.startLogging("Bungie Logs");
			logger.info(`Bungie API Query Route ${opts.route}`);
			// console.trace()
			lastRoute = opts.shortRoute;
			lastRequestTime = newDate;
			let r = new XMLHttpRequest();
			r.open(opts.method, "https://www.bungie.net/Platform" + opts.route, true);
			r.setRequestHeader('X-API-Key', '4a6cc3aa21d94c949e3f44736d036a8f');
			r.onload = function() {
				// If this code encounters an error, it will retry every 60 seconds until it succeeds
				if (this.status >= 200 && this.status < 400) {
					var response = JSON.parse(this.response);
					if (response.ErrorCode === 36 || response.ErrorCode === 51) {
						logger.startLogging("Bungie Logs");
						tracker.sendEvent('Too Frequent', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
						// _gaq.push(['_trackEvent', 'BungieError', `Error Code ${response.ErrorCode}`, opts.shortRoute, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
						logger.warn(`We accidentally encountered Error ${response.ErrorCode} when attempting ${opts.route}`);
						setTimeout(function() {
							_request(opts, errors + 1);
						}, 1000);
					} else if (response.ErrorCode === 1623 || response.ErrorCode === 1663) {
						logger.startLogging("Bungie Logs");
						logger.error(response.ErrorStatus, response.Message, opts.route);
						if (Object.keys(opts.payload).length > 0) {
							logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						tracker.sendEvent('Invalid Item Selection', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
						// _gaq.push(['_trackEvent', 'BungieError', `Invalid Item Selection`, JSON.stringify(response.Message), `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
						localStorage.errorMessage = 'Invalid item selection, please use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
						logger.saveData();
						opts.complete(response.Response, response);
					} else if (response.ErrorCode === 1642) {
						logger.startLogging("Bungie Logs");
						logger.error(response.ErrorStatus, response.Message, opts.route);
						if (Object.keys(opts.payload).length > 0) {
							tracker.sendEvent('No Vault Space', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
							// _gaq.push(['_trackEvent', 'BungieError', `No Space in Vault`, "no space in vault", `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
							logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						localStorage.errorMessage = 'No space in vault, please free up some space! Or use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
						logger.saveData();
						opts.complete(response.Response, response);
					} else if (response.ErrorCode === 99) {
						logger.startLogging("Bungie Logs");
						tracker.sendEvent('User Not Found', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
						// _gaq.push(['_trackEvent', 'BungieError', `User not found`, response.Message, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
						logger.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message));
						localStorage.error = "true";
						localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message);
						logger.saveData();
						opts.incomplete();
					} else if (response.ErrorCode === 7) {
						logger.startLogging("Bungie Logs");
						tracker.sendEvent('Invalid URL', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
						// _gaq.push(['_trackEvent', 'BungieError', `Invalid URL Parameters`, opts.route, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
						logger.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message));
						localStorage.error = "true";
						localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message);
						logger.saveData();
						opts.incomplete();
					} else if (response.ErrorCode === 5) {
						logger.startLogging("Bungie Logs");
						logger.error(response.ErrorCode, response.ErrorStatus, response.Message, opts.route);
						if (opts.payload && Object.keys(opts.payload).length > 0) {
							logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						tracker.sendEvent('System Disabled Maintenance', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
						// _gaq.push(['_trackEvent', 'BungieError', `Unhandled Error Code ${response.ErrorCode}`, response.Message, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
						localStorage.errorMessage = 'Bungie servers are undergoing maintenance. Please use "Begin Tracking" to try to connect again. \n' + JSON.stringify(response.Message);
						logger.saveData();
						opts.incomplete();
					} else if (response.ErrorCode !== 1) {
						logger.startLogging("Bungie Logs");
						logger.error(response.ErrorCode, response.ErrorStatus, response.Message, opts.route);
						if (opts.payload && Object.keys(opts.payload).length > 0) {
							logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						tracker.sendEvent('Unhandled Error', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
						// _gaq.push(['_trackEvent', 'BungieError', `Unhandled Error Code ${response.ErrorCode}`, response.Message, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
						localStorage.errorMessage = 'Unhandled Bungie Error, please use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
						logger.saveData();
						opts.incomplete();
					} else {
						if (response.Response === undefined || (Array.isArray(response.Response) && response.Response[0] === undefined)) {
							logger.startLogging("Bungie Logs");
							tracker.sendEvent('User Not Found', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
							// _gaq.push(['_trackEvent', 'BungieError', `User not found`, response.Message, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
							logger.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message));
							localStorage.error = "true";
							localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message);
							logger.saveData();
							opts.incomplete();
						} else {
							localStorage.error = "false";
							opts.complete(response.Response, response);
						}
					}
				} else {
					logger.startLogging("Bungie Logs");
					localStorage.error = "true";
					if (this.response.length) {
						let response;
						try {
							response = JSON.parse(response);
						} catch (e) {
							logger.error(`not valid JSON ${this.response}`);
						}
						if (response) {
							tracker.sendEvent('Unhandled Response', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
							// _gaq.push(['_trackEvent', 'BungieError', `Unhandled Error Code ${response.ErrorCode}`, response.Message, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
							logger.error(`code ${response.ErrorCode}, error ${response.ErrorStatus}, message ${response.Message}`);
						}
					}
					tracker.sendEvent('Unhandled Response', `Status: ${this.status}, Message: ${this.response}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
					// _gaq.push(['_trackEvent', 'BungieError', `Unhandled Response ${this.status}`, opts.shortRoute, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
					logger.error(`status ${this.status}, route ${opts.route}, response ${this.response}`);
					logger.error("Response Error: Response did not contain expected values.");
					localStorage.errorMessage = "Response Error: Response did not contain expected values.";
					opts.incomplete();
				}
			};

			r.onerror = function(err) {
				logger.startLogging("Bungie Logs");
				tracker.sendEvent('No Network Connection', `Status: ${this.status}, Message: ${this.response}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
				// _gaq.push(['_trackEvent', 'BungieError', `No Network connection`, "", `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
				logger.error(err);
				logger.error(`route ${opts.route}`);
				logger.error("Network Error: Please check your internet connection.");
				localStorage.errorMessage = "Network Error: Please check your internet connection.";
				localStorage.error = "true";
				logger.saveData();
				opts.incomplete();
			};

			_getCookie('bungled').then(function(token) {
				logger.startLogging("bungie");
				if (token !== null) {
					r.withCredentials = true;
					r.setRequestHeader('x-csrf', token);
					r.send(JSON.stringify(opts.payload));
				} else {
					localStorage.error = "true";
					tracker.sendEvent('Cookie Not Found', `Status: ${this.status}, Message: ${this.response}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, id ${localStorage.uniqueId}`);
					// _gaq.push(['_trackEvent', 'BungieError', `User cookie not found.`, opts.shortRoute, `version ${localStorage.version}, id ${localStorage.uniqueId}`]);
					logger.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.');
					localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.';
					logger.saveData();
					opts.incomplete();
				}
			});
		} else {
			if (newDate - lastRequestTime > 300) {
				logger.warn(`Request exceeded threshhold during ${opts.route} from ${lastRoute}, lastTime ${lastRequestTime} currentTime ${newDate} sum ${newDate-lastRequestTime}, ${1000-(newDate-lastRequestTime)}`);
			}
			setTimeout(function() {
				_request(opts);
			}, 1000);
		}
	}

	bungie.getMemberships = function() {
		return Object.keys(systemIds);
	};

	bungie.getActive = function() {
		return active.type;
	};

	bungie.changeActiveMembership = function() {
		if (active.type === 1 && systemIds.psn.id) {
			active = systemIds.psn;
		}
		if (active.type === 2 && systemIds.xbl.id) {
			active = systemIds.xbl;
		}
	};

	bungie.setActive = function(type) {
		if (type === "psn" && systemIds.psn && systemIds.psn.id) {
			active = systemIds.psn;
		} else if (type === "xbl" && systemIds.xbl && systemIds.xbl.id) {
			active = systemIds.xbl;
		}
	};

	bungie.user = function() {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/User/GetBungieNetUser/',
				shortRoute: '/User/GetBungieNetUser/',
				method: 'GET',
				incomplete: reject,
				complete: function(res) {
					if (res.gamerTag && res.publicCredentialTypes.indexOf(1) > -1) {
						systemDetails.xbo = {
							id: res.gamerTag,
							type: 1,
							characters: []
						};
					}
					if (res.psnId && res.publicCredentialTypes.indexOf(2) > -1) {
						systemDetails.ps4 = {
							id: res.psnId,
							type: 2,
							characters: []
						};
					}
					systemIds.xbl = {
						id: res.gamerTag,
						type: 1
					};
					systemIds.psn = {
						id: res.psnId,
						type: 2
					};

					// active = systemIds.xbl;

					// if (res.psnId) {
					// 	active = systemIds.psn;
					// }
					if (localStorage.activeType === "psn" && res.psnId) {
						active = systemIds.psn;
					} else if (localStorage.activeType === "xbl" && res.gamerTag) {
						active = systemIds.xbl;
					} else if (localStorage.activeType === "psn" && res.gamerTag) {
						active = systemIds.xbl;
						localStorage.activeType = "xbl";
					} else if (localStorage.activeType === "xbl" && res.psnId) {
						active = systemIds.psn;
						localStorage.activeType = "psn";
					}
					resolve(res);
				}
			});
		});
	};
	bungie.search = function() {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/SearchDestinyPlayer/' + active.type + '/' + active.id + '/',
				shortRoute: '/Destiny/SearchDestinyPlayer/',
				method: 'GET',
				incomplete: reject,
				complete: function(membership) {
					membershipId = membership[0].membershipId;
					_request({
						route: '/Destiny/Tiger' + (parseInt(active.type, 10) === 1 ? 'Xbox' : 'PSN') + '/Account/' + membershipId + '/',
						shortRoute: '/Destiny/Tiger/Account/',
						method: 'GET',
						incomplete: reject,
						complete: resolve
					});
				}
			});
		});
	};
	bungie.getCharacters = function() {
		return new Promise(function(resolve, reject) {
			sequence(Object.keys(systemDetails), function(item, complete) {
				var details = systemDetails[item];
				_request({
					route: '/Destiny/SearchDestinyPlayer/' + details.type + '/' + details.id + '/',
					shortRoute: '/Destiny/SearchDestinyPlayer/',
					method: 'GET',
					incomplete: reject,
					complete: function(membership) {
						membershipId = membership[0].membershipId;
						_request({
							route: '/Destiny/Tiger' + (parseInt(details.type, 10) === 1 ? 'Xbox' : 'PSN') + '/Account/' + membershipId + '/',
							shortRoute: '/Destiny/Tiger/Account/',
							method: 'GET',
							incomplete: reject,
							complete: complete
						});
					}
				});
			}, function(networkResult, item) {
				var details = systemDetails[item];
				var avatars = networkResult.data.characters;
				details.characters.push("vault" + details.type);
				for (let avatar of avatars) {
					details.characters.push(avatar.characterBase.characterId);
					characterMap[avatar.characterBase.characterId] = JSON.stringify(avatar);
				}
				for (var character in characterMap) {
					characterMap[character] = JSON.parse(characterMap[character]);
					characterMap[character].type = details.type;
					characterMap[character].characterId = characterMap[character].characterBase.characterId;
				}
				characterMap["vault" + details.type] = {
					type: details.type,
					characterId: "vault"
				};
			}).then(function() {
				resolve(characterMap);
			});
		});
	};
	bungie.activity = function(characterId, gameMode, count, page) {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/Stats/ActivityHistory/' + active.type + '/' + membershipId + '/' + characterId + "/?mode=" + gameMode + "&count=" + count + "&page=" + page,
				shortRoute: '/Destiny/Stats/ActivityHistory/',
				method: 'GET',
				incomplete: reject,
				complete: resolve
			});
		});
	};
	bungie.vault = function() {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/' + active.type + '/MyAccount/Vault/',
				shortRoute: '/Destiny//MyAccount/Vault/',
				method: 'GET',
				incomplete: reject,
				complete: function(result) {
					resolve(result);
				}
			});
		});
	};
	bungie.inventory = function(characterId) {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Character/' + characterId + '/Inventory/?definitions=false',
				shortRoute: '/Destiny//Account//Character//Inventory/?definitions=false',
				method: 'GET',
				incomplete: reject,
				complete: resolve
			});
		});
	};
	bungie.carnage = function(activityId) {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/Stats/PostGameCarnageReport/' + activityId + '/?definitions=false',
				shortRoute: '/Destiny/Stats/PostGameCarnageReport//?definitions=false',
				method: 'GET',
				incomplete: reject,
				complete: resolve
			});
		});
	};
	bungie.advisorsForAccount = function() {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Advisors/?definitions=false',
				shortRoute: '/Destiny/Account/Advisors/',
				method: 'GET',
				incomplete: reject,
				complete: resolve
			});
		});
	};
	bungie.factions = function(characterId) {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Character/' + characterId + '/Progression/?definitions=false',
				shortRoute: '/Destiny//Account//Character//Progression/?definitions=false',
				method: 'GET',
				incomplete: reject,
				complete: resolve
			});
		});
	};
	bungie.transfer = function(characterId, itemId, itemReferenceHash, stackSize, transferToVault) {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/TransferItem/',
				shortRoute: '/Destiny/TransferItem/',
				method: 'POST',
				payload: {
					characterId: characterId,
					membershipType: active.type,
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
	return bungie;
}());