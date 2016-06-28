/* jshint indent: 1, unused: true, esversion:6 */
var bungie = (function Bungie() {
	var bungie = {};
	// private vars
	var systemDetails = {};
	var characterMap = {};
	var systemIds = {};
	var membershipId = 0;

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

	function _request(opts) {
		var r = new XMLHttpRequest();
		r.open(opts.method, "https://www.bungie.net/Platform" + opts.route, true);
		r.setRequestHeader('X-API-Key', '4a6cc3aa21d94c949e3f44736d036a8f');
		r.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				var response = JSON.parse(this.response);
				if (response.ErrorCode === 36) {
					setTimeout(function() {
						_request(opts);
					}, 1000);
				} else if (response.ErrorCode === 1623 || response.ErrorCode === 1663) {
					logger.startLogging("Bungie Logs");
					logger.error(response.ErrorStatus, response.Message, opts.route);
					if (Object.keys(opts.payload).length > 0) {
						logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
					}
					localStorage.error = "true";
					localStorage.errorMessage = 'Invalid item selection, please use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
					logger.saveData();
					opts.complete(response.Response, response);
				} else if (response.ErrorCode === 1642) {
					logger.startLogging("Bungie Logs");
					logger.error(response.ErrorStatus, response.Message, opts.route);
					if (Object.keys(opts.payload).length > 0) {
						logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
					}
					localStorage.error = "true";
					localStorage.errorMessage = 'No space in vault, please free up some space! Or use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
					logger.saveData();
					opts.complete(response.Response, response);
				} else if (response.ErrorCode !== 1) {
					logger.startLogging("Bungie Logs");
					logger.error(response.ErrorCode, response.ErrorStatus, response.Message, opts.route);
					if (Object.keys(opts.payload).length > 0) {
						logger.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
					}
					localStorage.error = "true";
					localStorage.errorMessage = 'Unhandled Bungie Error, please use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
					setTimeout(function() {
						_request(opts);
						logger.saveData();
					}, 5000);
				} else {
					if (response.Response === undefined || (Array.isArray(response.Response) && response.Response[0] === undefined)) {
						logger.startLogging("Bungie Logs");
						logger.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message));
						localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message);
						setTimeout(function() {
							_request(opts);
							logger.saveData();
						}, 5000);
					} else {
						localStorage.error = "false";
						opts.complete(response.Response, response);
					}
				}
			} else {
				localStorage.error = "true";
				logger.error("Network Error: Please check your internet connection.");
				localStorage.errorMessage = "Network Error: Please check your internet connection.";
				setTimeout(function() {
					_request(opts);
					logger.saveData();
				}, 5000);
			}
		};

		r.onerror = function() {
			logger.startLogging("bungie");
			logger.error("Network Error: Please check your internet connection.");
			localStorage.errorMessage = "Network Error: Please check your internet connection.";
			localStorage.error = "true";
			setTimeout(function() {
				_request(opts);
			}, 5000);
		};

		_getCookie('bungled').then(function(token) {
			logger.startLogging("bungie");
			if (token !== null) {
				r.withCredentials = true;
				r.setRequestHeader('x-csrf', token);
				r.send(JSON.stringify(opts.payload));
			} else {
				localStorage.error = "true";
				logger.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.');
				localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.';
				setTimeout(function() {
					_request(opts);
				}, 5000);
			}
		});
	}

	bungie.getMemberships = function() {
		return Object.keys(systemIds);
	};

	bungie.getActive = function() {
		return active.type;
	};

	bungie.changeActiveMembership = function() {
		if(active.type === 1 && systemIds.psn.id) {
			active = systemIds.psn;
		}
		if(active.type === 2 && systemIds.xbl.id) {
			active = systemIds.xbl;
		}
	};

	bungie.user = function() {
		return new Promise(function(resolve) {
			_request({
				route: '/User/GetBungieNetUser/',
				method: 'GET',
				complete: function(res) {
					if(res.gamerTag && res.publicCredentialTypes.indexOf(1) > -1) {
						systemDetails.xbo = {
							id:res.gamerTag,
							type:1
						};
					}
					if(res.psnId && res.publicCredentialTypes.indexOf(2) > -1) {
						systemDetails.ps4 = {
							id:res.psnId,
							type:2
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

					active = systemIds.xbl;

					if (res.psnId) {
						active = systemIds.psn;
					}
					resolve(res);
				}
			});
		});
	};
	bungie.search = function() {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/SearchDestinyPlayer/' + active.type + '/' + active.id + '/',
				method: 'GET',
				complete: function(membership) {
					membershipId = membership[0].membershipId;
					_request({
						route: '/Destiny/Tiger' + (active.type == 1 ? 'Xbox' : 'PSN') + '/Account/' + membershipId + '/',
						method: 'GET',
						complete: resolve
					});
				}
			});
		});
	};
	bungie.activity = function(characterId, gameMode, count, page) {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/Stats/ActivityHistory/' + active.type + '/' + membershipId + '/' + characterId + "/?mode=" + gameMode + "&count=" + count + "&page=" + page,
				method: 'GET',
				complete: resolve
			});
		});
	};
	bungie.vault = function() {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/' + active.type + '/MyAccount/Vault/',
				method: 'GET',
				complete: function(result) {
					resolve(result);
				}
			});
		});
	};
	bungie.inventory = function(characterId) {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Character/' + characterId + '/Inventory/?definitions=false',
				method: 'GET',
				complete: resolve
			});
		});
	};
	bungie.carnage = function(activityId) {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/Stats/PostGameCarnageReport/' + activityId + '/?definitions=false',
				method: 'GET',
				complete: resolve
			});
		});
	};
	bungie.factions = function(characterId) {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Character/' + characterId + '/Progression/?definitions=false',
				method: 'GET',
				complete: resolve
			});
		});
	};
	bungie.transfer = function(characterId, itemId, itemReferenceHash, stackSize, transferToVault) {
		return new Promise(function(resolve) {
			_request({
				route: '/Destiny/TransferItem/',
				method: 'POST',
				payload: {
					characterId: characterId,
					membershipType: active.type,
					itemId: itemId,
					itemReferenceHash: itemReferenceHash,
					stackSize: stackSize,
					transferToVault: transferToVault
				},
				complete: resolve
			});
		});
	};
	return bungie;
}());