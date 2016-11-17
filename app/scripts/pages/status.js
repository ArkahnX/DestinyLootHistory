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

function handleResultDisplay(result, messages, className, icon, resolve) {
	if (result === 0) {
		messages.unshift("Success");
		document.getElementById(className).className = "success";
		icon = "check";
	}
	document.getElementById(className).innerHTML = `<i class="fa fa-${icon}" aria-hidden="true"></i><pre>${result}</pre> - <pre>${messages.join(", ")}</pre>`;
	resolve();
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
	r.onload = function() {
		if (this.status >= 200 && this.status < 400) {
			var response = JSON.parse(this.response);
			opts.complete(response);
		}
	};
	r.onerror = function(error) {
		console.error(error);
		opts.incomplete();
	};
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
			incomplete: function(response) {
				incomplete(response, status);
				processStatusResult(status, statusLocation, resolve);
			},
			complete: function(response) {
				complete(response, status);
				processStatusResult(status, statusLocation, resolve);
			}
		});
	});
}

function checkStatusWithCharacters(statusLocation, route, incomplete, afterNetwork, complete) {
	var status = {
		result: 0,
		messages: [],
		icon: "exclamation"
	};
	return new Promise(function(resolve) {
		sequence(characterIdList, function network(characterDetail, resolve) {
			var routeString = route(characterDetail);
			if (routeString) {
				request({
					route: routeString,
					method: 'GET',
					incomplete: function(response) {
						incomplete(response, characterDetail, status);
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
	});
}

function bungieLogin() {
	return checkStatus("bungielogin", "/User/GetBungieNetUser/", function(response, status) {
		console.error("Empty incomplete", response);
	}, function(response, status) {
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
	return checkStatusWithCharacters("bungieinventories", function route(characterDetail) {
		var route = '/Destiny/' + characterDetail.systemType + '/Account/' + characterDetail.membershipId + '/Character/' + characterDetail.characterId + '/Inventory/?definitions=false';
		if (characterDetail.characterId === "vault") {
			route = '/Destiny/' + characterDetail.systemType + '/MyAccount/Vault/';
		}
		return route;
	}, function(response, characterDetail, status) {
		console.error("Empty incomplete");
	}, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found " + characterIdList.length + " inventories");
		}
	});
}

function bungieVendors() {
	return checkStatusWithCharacters("bungievendors", function route(characterDetail) {
		var route = `/Destiny/${characterDetail.systemType}/MyAccount/Character/${characterDetail.characterId}/Vendor/3902439767/Metadata/`;
		if (characterDetail.characterId === "vault") {
			route = false;
		}
		return route;
	}, function(response, characterDetail, status) {
		console.error("Empty incomplete");
	}, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Vendors are functioning normally");
		}
	});
}

function bungieFactions() {
	return checkStatusWithCharacters("bungiefactions", function route(characterDetail) {
		var route = `/Destiny/${characterDetail.systemType}/Account/${characterDetail.membershipId}/Character/${characterDetail.characterId}/Progression/?definitions=false`;
		if (characterDetail.characterId === "vault") {
			route = false;
		}
		return route;
	}, function(response, characterDetail, status) {
		console.error("Empty incomplete");
	}, function afterNetwork(response, status) {
		console.log(response);
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found faction reputation for all characters");
		}
	});
}

function bungieActivities() {
	return checkStatusWithCharacters("bungieactivities", function route(characterDetail) {
		var route = '/Destiny/Stats/ActivityHistory/' + characterDetail.systemType + '/' + characterDetail.membershipId + '/' + characterDetail.characterId + "/?mode=None&count=10&page=1";
		if (characterDetail.characterId === "vault") {
			route = false;
		}
		return route;
	}, function(response, characterDetail, status) {
		console.error("Empty incomplete");
	}, function afterNetwork(response, status) {
		console.log(response);
		if (response.ErrorCode === 1 && response.Response.data.activities[0]) {
			carnageNumbers.push(response.Response.data.activities[0].activityDetails.instanceId);
		}
	}, function complete(status) {
		if (status.result === 0) {
			status.messages.push("Found activities for all characters");
		}
	});
}

function bungieCarnage() {
	// return checkStatusWithCharacters(statusLocation, route, incomplete, afterNetwork, complete);
	var result = 0;
	var messages = [];
	var icon = "exclamation";
	return new Promise(function(resolve) {
		sequence(carnageNumbers, function network(element, resolve) {
			request({
				route: '/Destiny/Stats/PostGameCarnageReport/' + element + '/?definitions=false',
				method: 'GET',
				incomplete: function() {
					console.error("Empty incomplete");
				},
				complete: resolve
			});
		}, function afterNetwork(response) {
			console.log(response);
			if (response.ErrorCode !== 1) {
				result = response.ErrorCode;
				messages.push(response.ErrorStatus);
			}
		}).then(function complete() {
			if (result === 0) {
				messages.push("Found in depth activity details");
			}
			handleResultDisplay(result, messages, "bungiecarnage", icon, resolve);
		});
	});
}

function bungieConsoleData(systemDetail, outputId) {
	var result = 0;
	var messages = [];
	var icon = "exclamation";
	return new Promise(function(resolve) {
		request({
			route: `/Destiny/SearchDestinyPlayer/${systemDetail.type}/${systemDetail.id}/`,
			method: 'GET',
			incomplete: function() {
				console.error("Empty incomplete");
			},
			complete: function(response) {
				console.log("membership", response);
				if (response.ErrorCode === 1 && response.Response.length) {
					systemDetail.membership = response.Response[0].membershipId;
					request({
						route: '/Destiny/' + systemDetail.type + '/Account/' + response.Response[0].membershipId + '/Summary/',
						method: 'GET',
						incomplete: function() {
							console.error("Empty incomplete");
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
								messages.push("Characters: " + systemDetail.characters.length);
							} else {
								result = response.ErrorCode;
								messages.push(response.ErrorStatus);
							}
							handleResultDisplay(result, messages, outputId, icon, resolve);
						}
					});
				} else {
					result = response.ErrorCode;
					if (response.ErrorCode !== 1) {
						messages.push(response.ErrorStatus);
					} else {
						var systemName = (systemDetail.type === 1) ? "Xbox" : "Playstation";
						messages.push("Unable to find Destiny Account for " + systemName);
					}
					handleResultDisplay(result, messages, outputId, icon, resolve);
				}
			}
		});
	});
}



function bungieCookieStep() {
	return new Promise(function(resolve) {
		var result = 0;
		var messages = [];
		var icon = "exclamation";
		chrome.cookies.getAll({
			domain: "www.bungie.net"
		}, function(cookies) {
			console.log(cookies)
			if (chrome.runtime.lastError) {
				tracker.sendEvent('unable to read cookies', JSON.stringify(chrome.runtime.lastError), `version ${localStorage.version}, systems ${localStorage.systems}`);
				result = 1;
				messages.push(chrome.runtime.lastError);
				console.error(chrome.runtime.lastError);
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
				result = 2;
				messages.push("Missing bungleatk cookie");
			}
			if (!cookieResults.bungled.length && cookieResults.bungleatk.length) {
				result = 3;
				messages.push("Missing bungled cookie");
			}
			console.log("Cookies", result, messages, messages.length === 1 ? messages[0] : messages.join(", "), cookieResults);
			handleResultDisplay(result, messages, "cookies", icon, resolve);
		});
	});
}

function bungieDatabase() {
	var result = 0;
	var messages = [];
	var icon = "exclamation";
	return new Promise(function(resolve) {
		var img = new Image();
		img.onload = function() {
			messages.push("Bungie manifest is up to date");
			handleResultDisplay(result, messages, "database", icon, resolve);
		};
		img.onerror = function() {
			result = 1;
			messages.push("Bungie manifest is outdated");
			handleResultDisplay(result, messages, "database", icon, resolve);
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