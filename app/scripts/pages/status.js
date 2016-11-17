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

function handleResultDisplay(result, messages, className, icon, resolve) {
	if (result === 0) {
		messages.unshift("Success");
		document.getElementById(className).className = "success";
		icon = "check";
	}
	document.getElementById(className).innerHTML = `<i class="fa fa-${icon}" aria-hidden="true"></i><pre>${result}</pre> - <pre>${messages.join(", ")}</pre>`;
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

function bungieLogin() {
	var result = 0;
	var messages = [];
	var icon = "exclamation";
	return new Promise(function(resolve) {
		request({
			route: '/User/GetBungieNetUser/',
			method: 'GET',
			incomplete: function() {
				console.error("Empty incomplete");
			},
			complete: function(res) {
				console.log(res);
				if (res.ErrorCode === 1) {
					var data = res.Response;
					if (data.gamerTag && data.publicCredentialTypes.indexOf(1) > -1) {
						systemDetails.xbo.id = data.gamerTag;
						messages.push("XBL: " + data.gamerTag);
					}
					if (data.psnId && data.publicCredentialTypes.indexOf(2) > -1) {
						systemDetails.ps4.id = data.psnId;
						messages.push("PSN: " + data.psnId);
					}
					if (!systemDetails.xbo.id && !systemDetails.ps4.id) {
						result = 1;
						messages.push("Unable to find linked PSN or XBL account names.");
					}
				} else {
					result = res.ErrorCode;
					messages.push(res.ErrorStatus);
				}
				console.log("bungielogin", result, messages, systemDetails);
				handleResultDisplay(result, messages, "bungielogin", icon, resolve);
			}
		});
	});
}

function bungieInventories() {
	var result = 0;
	var messages = [];
	var icon = "exclamation";
	return new Promise(function(resolve) {
		var inventoryCharacterIds = [];
		for (var systemDetail of systemDetails) {
			if (systemDetail.membership) {
				inventoryCharacterIds.push({
					systemType: systemDetail.type,
					characterId: "vault"
				});
				for (var characterId of systemDetail.characters) {
					inventoryCharacterIds.push({
						systemType: systemDetail.type,
						characterId: characterId,
						membershipId: systemDetail.membership
					});
				}
			}
		}
		sequence(inventoryCharacterIds, function network(element, resolve) {
			var route = '/Account/' + element.membershipId + '/Character/' + element.characterId + '/Inventory/?definitions=false';
			if (element.characterId === "vault") {
				route = '/MyAccount/Vault/';
			}
			request({
				route: '/Destiny/' + element.systemType + route,
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
				messages.push("Found " + inventoryCharacterIds.length + " inventories");
			}
			handleResultDisplay(result, messages, "bungieinventories", icon, resolve);
		});
	});
}

function bungieActivities() {
	var result = 0;
	var messages = [];
	var icon = "exclamation";
	return new Promise(function(resolve) {
		var inventoryCharacterIds = [];
		for (var systemDetail of systemDetails) {
			if (systemDetail.membership) {
				for (var characterId of systemDetail.characters) {
					inventoryCharacterIds.push({
						systemType: systemDetail.type,
						characterId: characterId,
						membershipId: systemDetail.membership
					});
				}
			}
		}
		sequence(inventoryCharacterIds, function network(element, resolve) {
			request({
				route: '/Destiny/Stats/ActivityHistory/' + element.systemType + '/' + element.membershipId + '/' + element.characterId + "/?mode=None&count=10&page=1",
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
			} else if (response.Response.data.activities[0]) {
				carnageNumbers.push(response.Response.data.activities[0].activityDetails.instanceId);
			}
		}).then(function complete() {
			if (result === 0) {
				messages.push("Found activities for " + inventoryCharacterIds.length + " characters");
			}
			handleResultDisplay(result, messages, "bungieactivities", icon, resolve);
		});
	});
}

function bungieCarnage() {
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
			route: '/Destiny/' + systemDetail.type + '/Stats/GetMembershipIdByDisplayName/' + systemDetail.id + '/',
			method: 'GET',
			incomplete: function() {
				console.error("Empty incomplete");
			},
			complete: function(response) {
				console.log("membership", response);
				if (response.ErrorCode === 1) {
					systemDetail.membership = response.Response;
					request({
						route: '/Destiny/' + systemDetail.type + '/Account/' + response.Response + '/Summary/',
						method: 'GET',
						incomplete: function() {
							console.error("Empty incomplete");
						},
						complete: function(account) {
							console.log("account", account);
							if (account.ErrorCode === 1) {
								for (var character of account.Response.data.characters) {
									systemDetail.characters.push(character.characterBase.characterId);
								}
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
					messages.push(response.ErrorStatus);
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

document.addEventListener("DOMContentLoaded", function() {
	bungieCookieStep().then(bungieLogin).then(function() {
		return bungieConsoleData(systemDetails.xbo, "bungiexbone");
	}).then(function() {
		return bungieConsoleData(systemDetails.ps4, "bungieps4");
	}).then(bungieInventories).then(bungieActivities).then(bungieCarnage);
});