tracker.sendAppView('StatusScreen');
var cookieResults = {
	bungled: "",
	bungleatk: ""
};
var systemDetails = {
	xbo: {
		id: "",
		type: 1,
		membership: "",
		characters: []
	},
	ps4: {
		id: "",
		type: 2,
		membership: "",
		characters: []
	}
};

var carnageNumbers = [];

var characterIdList = [];

function handleNetworkError(statusCode, address, status) {
	console.log(arguments)
	var message = "";
	if (statusCode === 0) {
		message = "Internet is Disconnected";
	} else if (statusCode === 404) {
		message = "Unable to reach URL: " + address;
	}
	if (message) {
		status.messages.push(message);
		status.result = statusCode === 0 ? 1337 : statusCode;
	}
}

function processStatusResult(status, statusLocation, resolve) {
	if (status.result === 0) {
		status.messages.unshift("Success");
		document.getElementById(statusLocation).className = "success";
		status.icon = "check";
	}
	document.getElementById(statusLocation).innerHTML = `<i class="fa fa-${status.icon}" aria-hidden="true"></i><pre>${status.result}</pre> - <pre>${status.messages.join(", ")}</pre>`;
	resolve();
}

function request(opts) {
	let r = new XMLHttpRequest();
	r.open(opts.method, "https://www.bungie.net/Platform" + opts.route, true);
	r.setRequestHeader('X-API-Key', API_KEY);
	r.onreadystatechange = function() {
		if (r.readyState === 4) {
			if (this.status >= 200 && this.status < 400) {
				var response = JSON.parse(this.response);
				opts.complete(response);
			} else {
				opts.incomplete(r.status, opts.route);
			}
		}
	};
	// r.onerror = function(error) {
	// 	opts.incomplete(r.status, opts.route);
	// };
	r.withCredentials = true;
	r.setRequestHeader('x-csrf', cookieResults.bungled);
	opts.csrf = cookieResults.bungled;
	opts.atk = cookieResults.bungleatk.length;
	r.send(JSON.stringify(opts.payload));
}

function checkStatus(statusLocation, route, incomplete, complete) {
	var status = {
		result: 0,
		messages: [],
		icon: "exclamation"
	};
	return new Promise(function(resolve) {
		request({
			route: route,
			method: 'GET',
			incomplete: function(response, address) {
				incomplete(response, address, status);
				processStatusResult(status, statusLocation, resolve);
			},
			complete: function(response) {
				complete(response, status);
				processStatusResult(status, statusLocation, resolve);
			}
		});
	});
}

function checkStatusWithCharacters(list, statusLocation, route, incomplete, afterNetwork, complete) {
	var status = {
		result: 0,
		messages: [],
		icon: "exclamation"
	};
	return new Promise(function(resolve) {
		if (list.length) {
			sequence(list, function network(characterDetail, resolve) {
				var routeString = route(characterDetail);
				if (routeString) {
					request({
						route: routeString,
						method: 'GET',
						incomplete: function(response, address) {
							incomplete(response, address, status);
							processStatusResult(status, statusLocation, resolve);
						},
						complete: resolve
					});
				} else {
					resolve({
						ErrorCode: 1
					});
				}
			}, function(response) {
				if (response.ErrorCode !== 1) {
					status.result = response.ErrorCode;
					status.messages.push(response.ErrorStatus);
				}
				afterNetwork(response, status);
			}).then(function() {
				complete(status);
				processStatusResult(status, statusLocation, resolve);
			});
		} else {
			status.result = 7331;
			status.messages.push("No characters found");
			processStatusResult(status, statusLocation, resolve);
		}
	});
}

function bungieLogin() {
	return checkStatus("bungielogin", "/User/GetBungieNetUser/", handleNetworkError, function(response, status) {
		console.log(response);
		if (response.ErrorCode === 1) {
			var data = response.Response;
			if (data.gamerTag && data.publicCredentialTypes.indexOf(1) > -1) {
				systemDetails.xbo.id = data.gamerTag;
				status.messages.push("XBL: " + data.gamerTag);
			}
			if (data.psnId && data.publicCredentialTypes.indexOf(2) > -1) {
				systemDetails.ps4.id = data.psnId;
				status.messages.push("PSN: " + data.psnId);
			}
			if (!systemDetails.xbo.id && !systemDetails.ps4.id) {
				status.result = 1;
				status.messages.push("Unable to find linked PSN or XBL account names.");
			}
		} else {
			status.result = response.ErrorCode;
			status.messages.push(response.ErrorStatus);
		}
		console.log("bungielogin", status, systemDetails);
	});
}

function bungieInventories() {
	return checkStatusWithCharacters(characterIdList, "bungieinventories", function route(characterDetail) {
		var route = '/Destiny/' + characterDetail.systemType + '/Account/' + characterDetail.membershipId + '/Character/' + characterDetail.characterId + '/Inventory/?definitions=false';
		if (characterDetail.characterId === "vault") {
			route = '/Destiny/' + characterDetail.systemType + '/MyAccount/Vault/';
		}
		return route;
	}, handleNetworkError, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found " + characterIdList.length + " inventories");
		}
	});
}

function bungieVendors() {
	return checkStatusWithCharacters(characterIdList, "bungievendors", function route(characterDetail) {
		var route = `/Destiny/${characterDetail.systemType}/MyAccount/Character/${characterDetail.characterId}/Vendor/3902439767/Metadata/`;
		if (characterDetail.characterId === "vault") {
			route = false;
		}
		return route;
	}, handleNetworkError, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Vendors are functioning normally");
		}
	});
}

function bungieFactions() {
	return checkStatusWithCharacters(characterIdList, "bungiefactions", function route(characterDetail) {
		var route = `/Destiny/${characterDetail.systemType}/Account/${characterDetail.membershipId}/Character/${characterDetail.characterId}/Progression/?definitions=false`;
		if (characterDetail.characterId === "vault") {
			route = false;
		}
		return route;
	}, handleNetworkError, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found faction reputation for all characters");
		}
	});
}

function bungieActivities() {
	return checkStatusWithCharacters(characterIdList, "bungieactivities", function route(characterDetail) {
		var route = '/Destiny/Stats/ActivityHistory/' + characterDetail.systemType + '/' + characterDetail.membershipId + '/' + characterDetail.characterId + "/?mode=None&count=10&page=1";
		if (characterDetail.characterId === "vault") {
			route = false;
		}
		return route;
	}, handleNetworkError, function afterNetwork(response, status) {
		console.log(response);
		if (response.ErrorCode === 1 && response.Response && response.Response.data.activities[0]) {
			carnageNumbers.push(response.Response.data.activities[0].activityDetails.instanceId);
		}
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found activities for all characters");
		}
	});
}

function bungieCarnage() {
	return checkStatusWithCharacters(carnageNumbers, "bungieactivities", function route(carnageInstanceId) {
		var route = '/Destiny/Stats/PostGameCarnageReport/' + carnageInstanceId + '/?definitions=false';
		return route;
	}, handleNetworkError, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found in depth activity details");
		}
	});
}

function bungieConsoleData(systemDetail, outputId) {
	var status = {
		result: 0,
		messages: [],
		icon: "exclamation"
	};
	return new Promise(function(resolve) {
		request({
			route: `/Destiny/SearchDestinyPlayer/${systemDetail.type}/${systemDetail.id}/`,
			method: 'GET',
			incomplete: function(response, address) {
				handleNetworkError(response, address, status);
				processStatusResult(status, outputId, resolve);
			},
			complete: function(response) {
				console.log("membership", response);
				if (response.ErrorCode === 1 && response.Response.length) {
					systemDetail.membership = response.Response[0].membershipId;
					request({
						route: '/Destiny/' + systemDetail.type + '/Account/' + response.Response[0].membershipId + '/Summary/',
						method: 'GET',
						incomplete: function(response, address) {
							handleNetworkError(response, address, status);
							processStatusResult(status, outputId, resolve);
						},
						complete: function(account) {
							console.log("account", account);
							if (account.ErrorCode === 1) {
								for (var character of account.Response.data.characters) {
									systemDetail.characters.push(character.characterBase.characterId);
									characterIdList.push({
										systemType: systemDetail.type,
										characterId: character.characterBase.characterId,
										membershipId: systemDetail.membership
									});
								}
								characterIdList.push({
									systemType: systemDetail.type,
									characterId: "vault"
								});
								status.messages.push("Characters: " + systemDetail.characters.length);
							} else {
								status.result = response.ErrorCode;
								status.messages.push(response.ErrorStatus);
							}
							processStatusResult(status, outputId, resolve);
						}
					});
				} else {
					status.result = response.ErrorCode;
					if (response.ErrorCode !== 1) {
						status.messages.push(response.ErrorStatus);
					} else {
						var systemName = (systemDetail.type === 1) ? "Xbox" : "Playstation";
						status.messages.push("Unable to find Destiny Account for " + systemName);
					}
					processStatusResult(status, outputId, resolve);
				}
			}
		});
	});
}



function bungieCookieStep() {
	return new Promise(function(resolve) {
		var status = {
			result: 0,
			messages: [],
			icon: "exclamation"
		};
		chrome.cookies.getAll({
			domain: "www.bungie.net"
		}, function(cookies) {
			if (chrome.runtime.lastError) {
				tracker.sendEvent('unable to read cookies', JSON.stringify(chrome.runtime.lastError), `version ${localStorage.version}, systems ${localStorage.systems}`);
				status.result = 1;
				status.messages.push(chrome.runtime.lastError);
			}
			if (Array.isArray(cookies)) {
				for (var cookie of cookies) {
					if (cookie.name && cookie.value) {
						if (cookie.name === "bungled" || cookie.name === "bungleatk") {
							cookieResults[cookie.name] = cookie.value;
						}
					}
				}
			}
			if (cookieResults.bungled.length && !cookieResults.bungleatk.length) {
				status.result = 2;
				status.messages.push("Missing bungleatk cookie");
			}
			if (!cookieResults.bungled.length && cookieResults.bungleatk.length) {
				status.result = 3;
				status.messages.push("Missing bungled cookie");
			}
			processStatusResult(status, "cookies", resolve);
		});
	});
}

function bungieDatabase() {
	var status = {
			result: 0,
			messages: [],
			icon: "exclamation"
		};
	return new Promise(function(resolve) {
		var img = new Image();
		img.onload = function() {
			status.messages.push("Bungie manifest is up to date");
			processStatusResult(status, "database", resolve);
		};
		img.onerror = function() {
			status.result = 1;
			status.messages.push("Bungie manifest is outdated");
			processStatusResult(status, "database", resolve);
		};
		img.src = "https://www.bungie.net" + DestinyFactionDefinition[174528503].factionIcon;
	});
}

document.addEventListener("DOMContentLoaded", function() {
	bungieCookieStep().then(bungieLogin).then(function() {
		return bungieConsoleData(systemDetails.xbo, "bungiexbone");
	}).then(function() {
		return bungieConsoleData(systemDetails.ps4, "bungieps4");
	}).then(bungieInventories).then(bungieActivities).then(bungieCarnage).then(bungieVendors).then(bungieFactions).then(bungieDatabase);
});