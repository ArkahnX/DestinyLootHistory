var a = ["Most Kills","Least Kills","Most Assists","Most Deaths","Least Deaths","Best K/d","Worst K/d","Best Ka/d","Worst Ka/d","Best Score","Worst Score","Most Primary Kills","Most Special Kills","Most Heavy Kills","Most Melee Kills","Most Grenade Kills","Most Super Kills","Best Killing Spree","Best Combat Rating","Best Scout Rifle","Best Auto Rifle","Best Hand Cannon","Best Pulse Rifle","Best Shotgun","Best Sidearm","Best Fusion Rifle","Best Sniper Rifle","Best Rocket Launcher","Best Machine Gun","Best Sword","Most Neutralized","Most Captures","Most Avenges","Most Paybacks","Most Medals","Sleeper Simulant","No Land Beyond","Universal Remote","Vex Mythoclast","Queenbreakers Bow"]
var result = {};
for(var item of a) {
	var id = item.split(" ")[1].replace(/\//g,'').toLowerCase();
	var name = item.replace(/[\/\s]*/g,'').toLowerCase();
	var sort = "highest";
	if(item.indexOf("Worst") > -1 || item.indexOf("Least") > -1) {
		sort = "lowest";
	}
	result[name] = {
		id:id,
		name:item,
		sort:sort
	}
	if(item.indexOf("Best") > -1) {
		result[name].secondary = "FIXME";
		var temp = item.split(" ");
		temp.shift();
		result[name].secondaryValue = temp.join(" ");
	}
}
console.log(JSON.stringify(result));


var a = ["Matches","Unique Guardians","Guardian Data","Games Won","Games Lost","Win %","Rewards","Rewards Per Game","Games Per Reward","Hunters","Titans","Warlocks","Average Match Time (M)","Average Time Matchmaking (S)","Team Alpha","Team Bravo"];
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"gameStats",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Best Killing Spree","Longest Losing Streak","Longest Winning Streak","Winning Streaks","Losing Streaks","Carries/Neutralized","Dunks/Captures","Avenges","Paybacks","Medals"];
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"specialStats",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Kills","Assists","Deaths","K/d","Ka/d"]
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"mainStats",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Primary Kills","Special Kills","Heavy Kills","Melee Kills","Grenade Kills","Super Kills"]
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"abilityKills",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Auto Rifle","Scout Rifle","Pulse Rifle","Hand Cannon","Shotgun","Sniper Rifle","Fusion Rifle","Sidearm","Rocket Launcher","Machine Gun","Sword"]
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"weaponsUsed",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Mote of Light","Strange Coin","Rare Primary Engram","Rare Special Engram","Rare Heavy Engram","Rare Helmet Engram","Rare Chest Engram","Rare Gauntlets Engram","Rare Leg Engram","Rare Class Engram","Rare Primary","Rare Special","Rare Heavy","Rare Helmet","Rare Chest","Rare Gauntlets","Rare Leg","Rare Class","Rare Ghost","Total Drops and Rate","With Motes and Coins"];
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"rareRewards",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));


var a = ["Legendary Helmet","Legendary Chest","Legendary Gauntlets","Legendary Leg","Legendary Class","Legendary Ghost","Legendary Artifact","Legendary Primary","Legendary Special","Legendary Heavy","Total Drops and Rate"]
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"legendaryRewards",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Primary Engram","Special Engram","Heavy Engram","Helmet Engram","Chest Engram","Gauntlets Engram","Leg Engram","Three of Coins Used","Exotics Earned","ToC Per Exotic","Exotic Per ToC","Exotic Cost","Drop Rate"];
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"exoticRewards",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a = ["Player","Class","Encountered","Wins","Win %","Kills","Kill Avg","Deaths","Death Avg","Assists","Assist Avg","K/d","K/ad"];
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"guardianStats",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));

var a =["Map","Team","Matches","Chances","Wins","Win %","Kills","Assists","Deaths","K/d","Ka/d","Kill Avg","Assist Avg","Death Avg"];
var result = [];
var strings = [];
for(var item of a) {
	var name = item.replace(/[\/\s\%\(\)]*/g,'').toLowerCase();
	result.push({
		id:name,
		style:"guardianStats",
		name:item
	});
	strings.push(`if(property.id === "${name}") {return REPLACEME;}`);
}
console.log(JSON.stringify(result));
console.log(strings.join("\n else "));