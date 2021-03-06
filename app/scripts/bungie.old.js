var bungie = (function Bungie() {
	var bungie = {};
	// private vars
	var systemDetails = {};
	var systemIds = {};
	var membershipId = 0;
	var lastRoute = "";
	var lastRequestTime = new Date().getTime();

	var active = {
		id: 'loading'
	};
	var badAddresses = {};

	// private methods
	function _getAllCookies(callback) {
		chrome.cookies.getAll({
			domain: "www.bungie.net"
		}, callback);
	}

	function _getCookies(names) {
		return new Promise(function(resolve) {
			_getAllCookies(function(cookies) {
				if (chrome.runtime.lastError) {
					tracker.sendEvent('unable to read cookies', JSON.stringify(chrome.runtime.lastError), `version ${localStorage.version}, systems ${localStorage.systems}`);
					console.error(chrome.runtime.lastError);
				}
				if (cookies && cookies.length) {
					var bungled = [];
					for (var name of names) {
						for (var cookieName in cookies) {
							var cookie = cookies[cookieName];
							if (name === cookie.name && cookie.value) {
								bungled.push(cookie.value);
								break;
							}
						}
					}
					resolve(bungled);
				} else {
					resolve(false);
				}
			});
		});
	}

	function newRequest(opts) {
		let r = new XMLHttpRequest();
		var method = "GET";
		if (opts.payload) {
			method = "POST";
		}
		r.open(method, "https://www.bungie.net/Platform" + opts.route, true);
		r.setRequestHeader('X-API-Key', API_KEY);
		r.setRequestHeader('Authorization', "Bearer " + globalTokens.accessToken.value);
		r.onreadystatechange = function() {
			if (r.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					console.warn(JSON.parse(this.response));
				}
			}
		};
		if (method === "POST") {
			r.send(JSON.stringify(opts.payload));
		} else {
			r.send();

		}
	}

	function _request(opts) {
		// newRequest(opts);
		var newDate = new Date().getTime();
		if (badAddresses[opts.shortRoute]) {
			badAddresses[opts.shortRoute] += 1;
			if (badAddresses[opts.shortRoute] > 6) {
				badAddresses[opts.shortRoute] = 0;
			} else {
				opts.incomplete();
				return false;
			}
		}
		if ((lastRoute === opts.shortRoute && newDate - lastRequestTime >= 800) || lastRoute !== opts.shortRoute) { // make sure not to poll more than once per second for the same type of request
			console.info(`Bungie API Query Route ${opts.route}`);
			// console.trace()
			lastRoute = opts.shortRoute;
			lastRequestTime = newDate;
			let r = new XMLHttpRequest();
			r.open(opts.method, "https://www.bungie.net/Platform" + opts.route, true);
			r.setRequestHeader('X-API-Key', API_KEY);
			// r.timeout = 5000;
			r.onload = function() {
				if (this.status >= 200 && this.status < 400) {
					var response = JSON.parse(this.response);
					if (opts.noerror) {
						opts.complete(response);
					} else if (response.ErrorStatus === "DestinyLegacyPlatformInaccessible") {
						console.error(response.ErrorStatus, response.Message, opts.route);
						localStorage.errorMessage = 'The Bungie API no longer supports Legacy Consoles. Please sign in to Destiny on a supported console.';
						localStorage.error = "true";
						tracker.sendEvent('Invalid Console', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						opts.incomplete();
					} else if (response.ErrorCode === 36 || response.ErrorCode === 51) {
						tracker.sendEvent('Too Frequent', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						console.warn(`We accidentally encountered Error ${response.ErrorCode} when attempting ${opts.route}`);
						setTimeout(function() {
							_request(opts);
						}, 1000);
					} else if (response.ErrorCode === 1623 || response.ErrorCode === 1663) {
						console.error(response.ErrorStatus, response.Message, opts.route);
						if (Object.keys(opts.payload).length > 0) {
							console.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						tracker.sendEvent('Invalid Item Selection', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						localStorage.errorMessage = 'Invalid item selection, please use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
						opts.complete(response.Response, response);
					} else if (response.ErrorCode === 1642) {
						console.error(response.ErrorStatus, response.Message, opts.route);
						if (Object.keys(opts.payload).length > 0) {
							tracker.sendEvent('No Vault Space', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
							console.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						localStorage.errorMessage = 'No space in vault, please free up some space! Or use the <a href="debug.html">report issue feature</a>.<br>' + JSON.stringify(response.Message);
						opts.complete(response.Response, response);
					} else if (response.ErrorCode === 99) {
						tracker.sendEvent('User Not Logged In', `CSRF: ${opts.csrf}, ATK: ${opts.atk}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						console.error('Error loading user. Make sure your account is <a href="https://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message));
						localStorage.error = "true";
						localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="https://www.bungie.net">linked with bungie.net and you are logged in</a>.<br>This is a generic error, please use the <a href="debug.html">report issue feature</a> so the developers can assist.';
						opts.incomplete();
					} else if (response.ErrorCode === 7) {
						tracker.sendEvent('Invalid URL', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.route}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						console.error('Error loading user. Make sure your account is <a href="https://www.bungie.net">linked with bungie.net and you are logged in</a>.\n<br>' + JSON.stringify(response.Message));
						localStorage.error = "true";
						localStorage.errorMessage = 'Error loading user. Make sure your account is <a href="https://www.bungie.net">linked with bungie.net and you are logged in</a>.<br>This is a generic error, please use the <a href="debug.html">report issue feature</a> so the developers can assist.';
						opts.incomplete();
					} else if (response.ErrorCode === 5) {
						console.error(response.ErrorCode, response.ErrorStatus, response.Message, opts.route);
						if (opts.payload && Object.keys(opts.payload).length > 0) {
							console.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						tracker.sendEvent('System Disabled Maintenance', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						localStorage.errorMessage = 'Bungie servers are undergoing maintenance. Please use "Restart Tracking" to try to connect again. \n' + JSON.stringify(response.Message);
						badAddresses[opts.shortRoute] = 1;
						opts.incomplete();
					} else if (response.ErrorCode !== 1) {

						console.error(response.ErrorCode, response.ErrorStatus, response.Message, opts.route, localStorage.systems);
						if (opts.payload && Object.keys(opts.payload).length > 0) {
							console.error(`Character: ${opts.payload.characterId}, Membership: ${opts.payload.membershipType}, itemHash: ${opts.payload.itemReferenceHash}, stackSize: ${opts.payload.stackSize}, transferToVault: ${opts.payload.transferToVault}`);
						}
						localStorage.error = "true";
						tracker.sendEvent('Unhandled Error', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						localStorage.errorMessage = 'Unhandled Bungie Error, please use the <a href="debug.html">report issue feature</a> so the developers can assist.\n' + JSON.stringify(response.Message);
						badAddresses[opts.shortRoute] = 1;
						opts.incomplete();
					} else {
						if (response.Response === undefined || (Array.isArray(response.Response) && response.Response[0] === undefined)) {
							tracker.sendEvent('User Not Found', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.route}, Response: ${JSON.stringify(response)}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
							console.error('Response was empty\n' + JSON.stringify(response) + localStorage.systems);
							localStorage.error = "true";
							localStorage.errorMessage = `Error loading user. Make sure your account is <a href="https://www.bungie.net">linked with bungie.net and you are logged in</a>.<br>This is a generic error, please use the <a href="debug.html">report issue feature</a> so the developers can assist.`;
							opts.incomplete();
						} else {
							localStorage.error = "false";
							opts.complete(response.Response, response);
						}
					}
				} else {
					localStorage.error = "true";
					if (this.response.length) {
						let response;
						let validJSON = false;
						try {
							response = JSON.parse(response);
							validJSON = true;
						} catch (e) {
							console.error(`not valid JSON ${this.response && this.response.length}`);
							validJSON = false;
						}
						if (response && validJSON) {
							tracker.sendEvent('Unhandled Response', `Code: ${response.ErrorCode}, Message: ${response.Message}, Route: ${opts.route}, Response: ${response}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
							console.error(`code ${response.ErrorCode}, error ${response.ErrorStatus}, message ${response.Message}` + localStorage.systems);
						}
					}
					tracker.sendEvent('Unhandled Response', `Status: ${this.status}, Message: ${this.response && this.response.length}, Route: ${opts.route}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
					console.error(`status ${this.status}, route ${opts.route}, response ${this.response && this.response.length}` + localStorage.systems);
					console.error("Response Error: Response did not contain expected values.");
					localStorage.errorMessage = `Response Error: Response did not contain expected values.<br>This is a generic error, please use the <a href="debug.html">report issue feature</a> so the developers can assist.`;
					opts.incomplete();
				}
			};

			r.onerror = function() {
				try {
					tracker.sendEvent('No Network Connection', `Status: ${this.status}, Message: ${this.response}, Route: ${opts.route}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
				} catch (e) {
					if (e) {
						console.error(e);
					}
				}
				console.error(`Status: ${this.status}, Message: ${this.response}, Route: ${opts.route}`);
				console.error(`Options ${JSON.stringify(opts)}`);
				console.error("Network Error: Please check your internet connection.");
				localStorage.errorMessage = `Network Error: Please check your internet connection.<br>This is a generic error, please use the <a href="debug.html">report issue feature</a> so the developers can assist.`;
				localStorage.error = "true";
				opts.incomplete();
			};

			// _getCookies(['bungled', 'bungleatk']).then(function(tokens) {
			// 	if (tokens && tokens.length && tokens.length === 2) {
			// 		r.withCredentials = true;
			// 		r.setRequestHeader('x-csrf', tokens[0]);
			// 		opts.csrf = tokens[0];
			// 		opts.atk = tokens[1].length;
			// 		r.send(JSON.stringify(opts.payload));
			// 	} else {
			// 		if (typeof tokens === "object") {
			// 			tracker.sendEvent('some bungienet tokens', JSON.stringify(tokens), `version ${localStorage.version}, systems ${localStorage.systems}`);
			// 		} else {
			// 			tracker.sendEvent('no bungienet tokens', typeof tokens, `version ${localStorage.version}, systems ${localStorage.systems}`);
			// 			// console.error('Error loading cookie. {}');
			// 		}
			// 		localStorage.error = "true";
			// 		localStorage.errorMessage = `Error loading user. Please sign out and sign back in to <a href="https://www.bungie.net">linked with bungie.net</a> then click Restart Tracking.\nThis issue is being actively worked on. <a href="https://docs.google.com/forms/d/e/1FAIpQLSeuHPgi_vetjNlQvVbOE8M7qM-7G5I4zmGalSKmUGT4UQ0Ekw/viewform">Please report it with this survey</a>.`;
			chrome.cookies.getAll({
				domain: "www.bungie.net"
			}, function(cookies) {
				if (chrome.runtime.lastError) {
					if (typeof cookies !== "object") {
						tracker.sendEvent('Chrome Cookie Runtime Error', JSON.stringify(chrome.runtime.lastError) + "~" + cookies, `version ${localStorage.version}, systems ${localStorage.systems}`);
					} else {
						tracker.sendEvent('Chrome Cookie Runtime Error', JSON.stringify(chrome.runtime.lastError) + "~" + JSON.stringify(cookies), `version ${localStorage.version}, systems ${localStorage.systems}`);
					}
					console.error(chrome.runtime.lastError);
					localStorage.error = "true";
					localStorage.errorMessage = `Error loading user. Please sign out and sign back in to <a href="https://www.bungie.net">linked with bungie.net</a> then click Restart Tracking.\nThis issue is being actively worked on. <a href="https://docs.google.com/forms/d/e/1FAIpQLSeuHPgi_vetjNlQvVbOE8M7qM-7G5I4zmGalSKmUGT4UQ0Ekw/viewform">Please report it with this survey</a>.`;
					opts.incomplete();
				} else if (cookies && cookies.length) {
					var cookieNames = {};
					for (var cookie of cookies) {
						if (cookie.name) {
							cookieNames[cookie.name] = cookie.value + "";
						}
					}
					if (cookieNames.bungled && cookieNames.bungleatk) {
						r.withCredentials = true;
						r.setRequestHeader('x-csrf', cookieNames.bungled);
						opts.csrf = cookieNames.bungled;
						opts.atk = cookieNames.bungleatk.length;
						r.send(JSON.stringify(opts.payload));
					} else {
						tracker.sendEvent('Chrome Cookie Not Found', `CSRF: ${cookieNames.bungled}, ATK: ${cookieNames.bungleatk && cookieNames.bungleatk.length || 0}, Route: ${opts.shortRoute}`, `version ${localStorage.version}, systems ${localStorage.systems}`);
						localStorage.error = "true";
						localStorage.errorMessage = `Error loading user. Please sign out and sign back in to <a href="https://www.bungie.net">linked with bungie.net</a> then click Restart Tracking.\nThis issue is being actively worked on. <a href="https://docs.google.com/forms/d/e/1FAIpQLSeuHPgi_vetjNlQvVbOE8M7qM-7G5I4zmGalSKmUGT4UQ0Ekw/viewform">Please report it with this survey</a>.`;
						opts.incomplete();
					}
				}
			});
			// 	if (cookies && cookies.length) {
			// 		var cookieNames = {};
			// 		for (var cookie of cookies) {
			// 			if (cookie.name) {
			// 				cookieNames[cookie.name] = cookie.value;
			// 			}
			// 		}
			// 		var result = JSON.stringify(cookieNames);
			// 		tracker.sendEvent('bungled or bungleatk not found', result, `version ${localStorage.version}, systems ${localStorage.systems}`);
			// 		console.error('Error loading cookie.' + result);
			// 	} else {
			// 		if (typeof cookies === "object") {
			// 			tracker.sendEvent('some bungienet cookies', JSON.stringify(cookies), `version ${localStorage.version}, systems ${localStorage.systems}`);
			// 		} else {
			// 			tracker.sendEvent('no bungienet cookies', typeof cookies, `version ${localStorage.version}, systems ${localStorage.systems}`);
			// 			// console.error('Error loading cookie. {}');
			// 		}
			// 	}
			// 	opts.incomplete();
			// });
			// }
			// });
		} else {
			setTimeout(function() {
				_request(opts);
			}, 1000);
		}
	}

	bungie.getMemberships = function() {
		return Object.keys(JSON.parse(localStorage.systems));
	};
	bungie.getSystems = function() {
		return systemIds;
	};

	bungie.getActive = function() {
		return active.type;
	};

	bungie.setActive = function(type) {
		if (type === "psn" && systemIds.psn && systemIds.psn.id) {
			active = systemIds.psn;
			setOption("activeType", "psn");
		} else if (type === "xbl" && systemIds.xbl && systemIds.xbl.id) {
			active = systemIds.xbl;
			setOption("activeType", "xbl");
		}
	};

	bungie.user = function() {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/User/GetCurrentBungieAccount/',
				shortRoute: '/User/GetCurrentBungieAccount/',
				method: 'GET',
				incomplete: reject,
				complete: function(res) {
					// if (res.gamerTag && res.publicCredentialTypes.indexOf(1) > -1) {
					// 	systemDetails.xbo = {
					// 		id: res.gamerTag,
					// 		type: 1,
					// 		characters: []
					// 	};
					// 	if (res.psnId) {
					// 		systemIds.psn = {
					// 			id: res.psnId,
					// 			type: 2
					// 		};
					// 	}
					// }
					// if (res.psnId && res.publicCredentialTypes.indexOf(2) > -1) {
					// 	systemDetails.ps4 = {
					// 		id: res.psnId,
					// 		type: 2,
					// 		characters: []
					// 	};
					// }
					// if (res.gamerTag) {
					// 	systemIds.xbl = {
					// 		id: res.gamerTag,
					// 		type: 1
					// 	};
					// }
					// if (res.psnId) {
					// 	systemIds.psn = {
					// 		id: res.psnId,
					// 		type: 2
					// 	};
					// }

					// active = systemIds.xbl;

					// if (res.psnId) {
					// 	active = systemIds.psn;
					// }
					getOption("activeType").then(function(activeType) {
						for (let account of res.destinyAccounts) {
							if (account.userInfo.membershipType === 1) {
								systemDetails.xbo = {
									id: account.userInfo.displayName,
									type: 1,
									characters: []
								};
								systemIds.xbl = {
									id: account.userInfo.displayName,
									type: 1
								};
							} else if (account.userInfo.membershipType === 2) {
								systemDetails.ps4 = {
									id: account.userInfo.displayName,
									type: 2,
									characters: []
								};
								systemIds.psn = {
									id: account.userInfo.displayName,
									type: 2
								};
							}
						}
						console.log(systemDetails, systemIds, activeType)
						if (activeType === "psn" && systemDetails.ps4) {
							active = systemIds.psn;
							console.log(active)
						} else if (activeType === "xbl" && systemDetails.xbo) {
							active = systemIds.xbl;
							console.log(active)
						} else if (activeType === "psn" && systemDetails.xbo) {
							active = systemIds.xbl;
							setOption("activeType", "xbl");
							console.log(active)
						} else if (activeType === "xbl" && systemDetails.ps4) {
							active = systemIds.psn;
							setOption("activeType", "psn");
							console.log(active)
						}
						console.log(active)
						localStorage.systems = JSON.stringify(systemIds);
						resolve(res);
					});
				}
			});
		});
	};

	function _search(resolve, reject) {
		_request({
			route: '/Destiny/' + active.type + '/Stats/GetMembershipIdByDisplayName/' + active.id + '/',
			shortRoute: '/Destiny/Stats/GetMembershipIdByDisplayName/',
			method: 'GET',
			incomplete: function() {
				getOption("activeType").then(function(activeType) {
					if (activeType === "xbl") {
						bungie.setActive("psn");
						_search(resolve, reject);
					} else {
						reject();
					}
				});
			},
			complete: function(membership) {
				membershipId = membership;
				_request({
					route: '/Destiny/' + active.type + '/Account/' + membership + '/Summary/',
					shortRoute: '/Destiny/Account/',
					method: 'GET',
					incomplete: reject,
					complete: resolve
				});
			}
		});
	}

	bungie.search = function() {
		return new Promise(function(resolve, reject) {
			_search(resolve, reject);
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
	bungie.getVendorForCharacter = function(characterId, vendorId) {
		return new Promise(function(resolve, reject) {
			database.getEntry("vendors", vendorId + "-" + characterId).then(function(data) {
				if (!data || moment(data.nextRefreshDate).isBefore(moment()) || moment(data.nextRefreshDate).format("YYYY") === "9999") {
					_request({
						route: `/Destiny/${active.type}/MyAccount/Character/${characterId}/Vendor/${vendorId}/Metadata/`,
						shortRoute: '/Destiny//MyAccount/Character//Vendor//Metadata/',
						method: 'GET',
						noerror: true,
						incomplete: reject,
						complete: function(bungieResult) {
							if (bungieResult.Response) {
								if (moment(bungieResult.Response.data.vendor.nextRefreshDate).format("YYYY") === "9999" || moment(bungieResult.Response.data.vendor.nextRefreshDate).isBefore(moment())) {
									bungieResult.Response.data.vendor.nextRefreshDate = moment().add(1, "days").format("YYYY-MM-DDTHH:mm:ssZ");
								}
								bungieResult.Response.data.vendor.vendorCharacterHash = vendorId + "-" + characterId;
								database.addSingle("vendors", bungieResult.Response.data.vendor).then(resolve);
							} else {
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
	bungie.getXur = function() {
		return new Promise(function(resolve, reject) {
			_request({
				route: `/Destiny/Advisors/Xur/?definitions=false`,
				shortRoute: '/Destiny/Advisors/Xur/',
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
				noerror: true,
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
	bungie.lock = function(characterId, instanceId) {
		return new Promise(function(resolve, reject) {
			_request({
				route: '/Destiny/SetLockState/',
				shortRoute: '/Destiny/SetLockState/',
				method: 'POST',
				noerror: true,
				payload: {
					characterId: characterId,
					membershipType: active.type,
					itemId: instanceId,
					state: true
				},
				incomplete: reject,
				complete: resolve
			});
		});
	};
	return bungie;
}());