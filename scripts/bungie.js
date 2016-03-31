function Bungie() {
	// private vars
	var domain = 'bungie.net';
	var url = 'https://www.bungie.net/Platform';
	var apikey = '4a6cc3aa21d94c949e3f44736d036a8f';

	var systemIds = {};
	var membershipId = 0;
	var characterIds = [];

	var active = {
		id: 'loading'
	};

	// private methods

	function _getAllCookies(callback) {
		chrome.cookies.getAll({
			domain: '.' + domain
		}, function() {
			callback.apply(null, arguments);
		});
	}

	function _getCookie(name, callback) {
		_getAllCookies(function(cookies) {
			var c = null;
			for (var i = 0, l = cookies.length; i < l; ++i) {
				if (cookies[i].name === name) {
					c = cookies[i];
					break;
				}
			}
			callback(c ? c.value : null);
		});
	}

	function _getToken(callback) {
		_getCookie('bungled', function(token) {
			callback(token);
		});
	}

	function _request(opts) {
		var r = new XMLHttpRequest();
		r.open(opts.method, url + opts.route, true);
		r.setRequestHeader('X-API-Key', apikey);
		r.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				var response = JSON.parse(this.response);

				if (response.ErrorCode === 36) setTimeout(function() {
					_request(opts);
				}, 1000);
				else opts.complete(response.Response, response);
			} else {
				opts.complete({
					error: 'network error:' + this.status
				}, this.response);
			}
		};

		r.onerror = function() {
			opts.complete({
				error: 'connection error'
			});
		};

		_getToken(function(token) {
			if (token != null) {
				r.withCredentials = true;
				r.setRequestHeader('x-csrf', token);
				r.send(JSON.stringify(opts.payload));
			} else {
				opts.complete({
					error: 'cookie not found'
				});
			}
		});
	}

	// function _request(opts) {
	// 	_getToken(function(token) {
	// 		if (token != null) {
	// 			var request = new Request(url + opts.route, {
	// 				method: opts.method,
	// 				credentials: "same-origin",
	// 				headers: {
	// 					'X-API-Key': apikey,
	// 					'x-csrf': token,
	// 					'cookie':
	// 				}
	// 			});
	// 			fetch(request).then(function(result) {
	// 				if (result.status >= 200 && result.status < 400) {
	// 					return result.json();
	// 				} else {
	// 					opts.complete({
	// 						error: 'network error:' + result.status
	// 					}, result);
	// 				}
	// 			}).then(function(response) {
	// 				console.log(response, request)
	// 				if (response.ErrorCode === 36) {
	// 					setTimeout(function() {
	// 						_request(opts);
	// 					}, 1000);
	// 				} else {
	// 					opts.complete(response.Response, response);
	// 				}
	// 			});
	// 		} else {
	// 			opts.complete({
	// 				error: 'cookie not found'
	// 			});
	// 		}
	// 	});
	// }

	function get(opts) {
		// Return a new promise.
		return new Promise(function(resolve, reject) {
			// Do the usual XHR stuff
			var r = new XMLHttpRequest();
			r.open(opts.method, url + opts.route, true);
			r.onload = function() {
				if (this.status >= 200 && this.status < 400) {
					var response = JSON.parse(this.response);

					if (response.ErrorCode === 36) setTimeout(function() {
						_request(opts);
					}, 1000);
					else {
						// opts.complete(response.Response, response);
						resolve(response.Response, response);
					}
				} else {
					reject({
						error: 'network error:' + this.status
					}, this.response);
					// opts.complete({
					// 	error: 'network error:' + this.status
					// }, this.response);
				}
			};

			// Handle network errors
			r.onerror = function() {
				reject({
					error: 'connection error'
				});
			};

			// Make the request
			_getToken(function(token) {
				if (token != null) {
					r.withCredentials = true;
					r.setRequestHeader('x-csrf', token);
					r.send(JSON.stringify(opts.payload));
				} else {
					reject({
						error: 'cookie not found'
					});
				}
			});
		});
	}

	// privileged methods
	this.setsystem = function(type) {
		if (type === undefined) return;
		active = systemIds.xbl
		if (type === 'PSN') active = systemIds.psn;
	}
	this.active = function() {
		return active;
	}
	this.system = function() {
		return systemIds;
	}
	this.user = function(callback) {
		_request({
			route: '/User/GetBungieNetUser/',
			method: 'GET',
			complete: function(res) {
				if (res === undefined) {
					callback({
						error: 'no response'
					})
					return;
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
				if (res.error) {
					console.error('Error loading user. Make sure your account is <a href="http://www.bungie.net">linked with bungie.net and you are logged in</a>.');
					return;
				}
				callback(res);
			}
		});
	}
	this.multiUser = function(platform, user, callback) { //'www.bungie.net/Platform/Destiny/2/Stats/GetMembershipIdByDisplayName/' + playerNames[playerIndex] + '/'
		systemIds.xbl = {
			id: user,
			type: 1
		};
		systemIds.psn = {
			id: user,
			type: 2
		};

		active = systemIds.xbl;

		if (platform == 2) {
			active = systemIds.psn;
		}
		callback();
	}
	this.search = function(callback) {
		_request({
			route: '/Destiny/SearchDestinyPlayer/' + active.type + '/' + active.id + '/',
			method: 'GET',
			complete: function(membership) {
				if (membership[0] === undefined) {
					callback({
						error: true
					})
					return;
				}
				membershipId = membership[0].membershipId;
				_request({
					route: '/Destiny/Tiger' + (active.type == 1 ? 'Xbox' : 'PSN') + '/Account/' + membershipId + '/',
					method: 'GET',
					complete: function(result) {
						if (result.error) {
							console.error('Bungie.net user found, but was unable to find your linked ' + (bungie.active().type == 1 ? 'Xbox' : 'PSN') + ' account.');
							return;
						}
						callback(result);
					}
				});
			}
		});
	}
	this.activity = function(characterId, gameMode, count, page, callback) {
		_request({
			route: '/Destiny/Stats/ActivityHistory/' + active.type + '/' + membershipId + '/' + characterId + "/?mode=" + gameMode + "&count=" + count + "&page=" + page,
			method: 'GET',
			complete: callback
		});
	}
	this.inventorySummary = function(membershipType, membershipId, characterId, callback) {
		_request({
			route: '/Destiny/' + membershipType + '/Account/' + membershipId + '/Character/' + characterId + '/Inventory/Summary/',
			method: 'GET',
			complete: callback
		});
	}
	this.carnage = function(instanceId, callback) {
		_request({
			route: '/Destiny/Stats/PostGameCarnageReport/' + instanceId + '/',
			method: 'GET',
			complete: callback
		});
	}
	this.vault = function(callback) {
		_request({
			route: '/Destiny/' + active.type + '/MyAccount/Vault/',
			method: 'GET',
			complete: function(result) {
				if (result.error) {
					console.error('Bungie.net user found, but was unable to find your linked ' + (bungie.active().type == 1 ? 'Xbox' : 'PSN') + ' account.');
					return;
				}
				callback(result);
			}
		});
	}
	this.inventory = function(characterId, callback) {
		_request({
			route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Character/' + characterId + '/Inventory/?definitions=false',
			method: 'GET',
			complete: callback
		});
	}
	this.getItem = function(characterId, itemId, callback) {
		_request({
			route: '/Destiny/' + active.type + '/Account/' + membershipId + '/Character/' + characterId + '/Inventory/' + itemId,
			method: 'GET',
			complete: callback
		});
	}
	this.transfer = function(characterId, itemId, itemHash, amount, toVault, callback) {
		_request({
			route: '/Destiny/TransferItem/',
			method: 'POST',
			payload: {
				characterId: characterId,
				membershipType: active.type,
				itemId: itemId,
				itemReferenceHash: itemHash,
				stackSize: amount,
				transferToVault: toVault
			},
			complete: callback
		});
	}
	this.equip = function(characterId, itemId, callback) {
		_request({
			route: '/Destiny/EquipItem/',
			method: 'POST',
			payload: {
				membershipType: active.type,
				characterId: characterId,
				itemId: itemId
			},
			complete: callback
		})
	}
	// this function works and returns a behemoth response. very useful/scary.
	// .equipResults for more information on item equip messages
	// .character.inventory.buckets -useful to resync data maybe?
	// .summary - useful if we want to update character level/emblem/etc
	this.equipall = function(characterId, itemIds, callback) {
		_request({
			route: '/Destiny/EquipItems/',
			method: 'POST',
			payload: {
				membershipType: active.type,
				characterId: characterId,
				itemIds: itemIds
			},
			complete: callback
		})
	}
}