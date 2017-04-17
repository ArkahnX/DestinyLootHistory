const presetEvents = {
    CrimsonDoubles: {
        id: "CrimsonDoubles",
        name: "Crimson Doubles",
        minDate: moment("2016-02-09T18:00:00Z").format(),
        maxDate: moment("2016-02-16T09:00:00Z").format(),
        gameMode: "Elimination"
    },
    SparrowRacing2016: {
        id: "SparrowRacing2016",
        gameMode: "Racing",
        name: "Sparrow Racing 2016",
        minDate: moment("2016-12-13T18:00:00Z").format(),
        maxDate: moment("2017-01-10T09:00:00Z").format()
    },
    SparrowRacing2015: {
        id: "SparrowRacing2015",
        gameMode: "Racing",
        name: "Sparrow Racing 2015",
        minDate: moment("2015-12-08T18:00:00Z").format(),
        maxDate: moment("2015-12-29T09:00:00Z").format()
    },
    IronBannerApril2017: {
        id: "IronBannerApril2017",
        gameMode: "IronBanner",
        name: "Iron Banner April 2017",
        minDate: moment("2017-04-11T18:00:00Z").format(),
        maxDate: moment("2017-04-18T09:00:00Z").format()
    },
    IronBannerFebruary2017: {
        id: "IronBannerFebruary2017",
        gameMode: "Supremacy",
        name: "Iron Banner February 2017",
        minDate: moment("2017-02-28T18:00:00Z").format(),
        maxDate: moment("2017-03-07T09:00:00Z").format()
    },
    IronBannerJanuary2017: {
        id: "IronBannerJanuary2017",
        gameMode: "Team",
        name: "Iron Banner January 2017",
        minDate: moment("2017-01-17T18:00:00Z").format(),
        maxDate: moment("2017-01-24T09:00:00Z").format()
    },
    IronBannerDecember2016: {
        id: "IronBannerDecember2016",
        gameMode: "Rift",
        name: "Iron Banner December 2016",
        minDate: moment("2016-12-06T18:00:00Z").format(),
        maxDate: moment("2016-12-13T09:00:00Z").format()
    },
    IronBannerNovember2016: {
        id: "IronBannerNovember2016",
        gameMode: "IronBanner",
        name: "Iron Banner November 2016",
        minDate: moment("2016-11-08T18:00:00Z").format(),
        maxDate: moment("2016-11-15T09:00:00Z").format()
    },
    IronBannerOctober2016: {
        id: "IronBannerOctober2016",
        gameMode: "Supremacy",
        name: "Iron Banner October 2016",
        minDate: moment("2016-11-04T18:00:00Z").format(),
        maxDate: moment("2016-11-11T09:00:00Z").format()
    },
    IronBannerAugust2016: {
        id: "IronBannerAugust2016",
        gameMode: "Team",
        name: "Iron Banner August 2016",
        minDate: moment("2016-08-16T18:00:00Z").format(),
        maxDate: moment("2016-08-23T09:00:00Z").format()
    },
    IronBannerJuly2016: {
        id: "IronBannerJuly2016",
        gameMode: "IronBanner",
        name: "Iron Banner July 2016",
        minDate: moment("2016-07-19T18:00:00Z").format(),
        maxDate: moment("2016-07-26T09:00:00Z").format()
    },
    IronBannerJune2016: {
        id: "IronBannerJune2016",
        gameMode: "Team",
        name: "Iron Banner June 2016",
        minDate: moment("2016-06-28T18:00:00Z").format(),
        maxDate: moment("2016-07-05T09:00:00Z").format()
    },
    IronBannerMay2016: {
        id: "IronBannerMay2016",
        gameMode: "IronBanner",
        name: "Iron Banner May 2016",
        minDate: moment("2016-05-25T18:00:00Z").format(),
        maxDate: moment("2016-05-31T09:00:00Z").format()
    },
    IronBannerApril2016: {
        id: "IronBannerApril2016",
        gameMode: "Team",
        name: "Iron Banner April 2016",
        minDate: moment("2016-04-26T18:00:00Z").format(),
        maxDate: moment("2016-05-03T09:00:00Z").format()
    },
    IronBannerMarch2016: {
        id: "IronBannerMarch2016",
        gameMode: "IronBanner",
        name: "Iron Banner March 2016",
        minDate: moment("2016-03-29T18:00:00Z").format(),
        maxDate: moment("2016-04-05T09:00:00Z").format()
    },
    IronBannerFebruary2016: {
        id: "IronBannerFebruary2016",
        gameMode: "Team",
        name: "Iron Banner February 2016",
        minDate: moment("2016-02-23T18:00:00Z").format(),
        maxDate: moment("2016-03-01T09:00:00Z").format()
    },
    IronBannerJanuary2016: {
        id: "IronBannerJanuary2016",
        gameMode: "Rift",
        name: "Iron Banner January 2016",
        minDate: moment("2016-01-26T18:00:00Z").format(),
        maxDate: moment("2016-02-02T09:00:00Z").format()
    },
    IronBannerDecember2015: {
        id: "IronBannerDecember2015",
        gameMode: "IronBanner",
        name: "Iron Banner December 2015",
        minDate: moment("2015-12-29T18:00:00Z").format(),
        maxDate: moment("2015-01-05T09:00:00Z").format()
    },
    IronBannerNovember2015: {
        id: "IronBannerNovember2015",
        gameMode: "Team",
        name: "Iron Banner November 2015",
        minDate: moment("2015-11-17T18:00:00Z").format(),
        maxDate: moment("2015-11-24T09:00:00Z").format()
    },
    IronBannerOctober2015: {
        id: "IronBannerOctober2015",
        gameMode: "IronBanner",
        name: "Iron Banner October 2015",
        minDate: moment("2015-10-13T19:00:00Z").format(),
        maxDate: moment("2015-10-20T09:00:00Z").format()
    },
    IronBannerAugust2015: {
        id: "IronBannerAugust2015",
        gameMode: "IronBanner",
        name: "Iron Banner August 2015",
        minDate: moment("2015-08-25T18:00:00Z").format(),
        maxDate: moment("2015-09-01T09:00:00Z").format()
    }
};
let sortOrder = [{
        id: "id",
        name: "#"
    },
    {
        id: "mapName",
        name: "Map"
    },
    {
        id: "kills",
        name: "Kills"
    },
    {
        id: "assists",
        name: "Assists"
    },
    {
        id: "deaths",
        name: "Deaths"
    },
    {
        id: "kd",
        name: "K/d"
    },
    {
        id: "kad",
        name: "Ka/d"
    },
    {
        id: "win",
        name: "Win"
    },
    {
        id: "day",
        name: "Day"
    },
    {
        id: "score",
        name: "Score"
    },
    {
        id: "link",
        name: "Link",
        width: 70
    },
    {
        id: "primary",
        name: "Primary"
    },
    {
        id: "special",
        name: "Special"
    },
    {
        id: "heavy",
        name: "Heavy"
    },
    {
        id: "primaryKills",
        name: "Primary Kills"
    },
    {
        id: "specialKills",
        name: "Special Kills"
    },
    {
        id: "heavyKills",
        name: "Heavy Kills"
    },
    {
        id: "melee",
        name: "Melee Kills"
    },
    {
        id: "grenade",
        name: "Grenade Kills"
    },
    {
        id: "super",
        name: "Super Kills"
    },
    {
        id: "teamscore",
        name: "Team Score"
    },
    {
        id: "enemyscore",
        name: "Enemy Score"
    },
    {
        id: "sparksCaptured",
        name: "Sparks Captured"
    },
    {
        id: "dunks",
        name: "Dunks"
    },
    {
        id: "place",
        name: "Placement"
    },
    {
        id: "mercy",
        name: "Mercy Rule"
    },
    {
        id: "primaryType",
        name: "Primary"
    },
    {
        id: "specialType",
        name: "Special"
    },
    {
        id: "heavyType",
        name: "Heavy"
    },
    {
        id: "guardian",
        name: "Name"
    },
    {
        id: "classType",
        name: "Class"
    },
    {
        id: "combatRating",
        name: "Combat Rating"
    },
    {
        id: "bestWeapon",
        name: "Best Weapon"
    },
    {
        id: "killSpree",
        name: "Kill Spree"
    },
    {
        id: "avenger",
        name: "Avenger"
    },
    {
        id: "payBack",
        name: "Payback"
    },
    {
        id: "objective",
        name: "Objective"
    },
    {
        id: "medals",
        name: "Medals"
    },
    {
        id: "time",
        name: "Time"
    },
    {
        id: "betweenGames",
        name: "Time Between Games"
    },
    {
        id: "team",
        name: "Team"
    }
];
let categories = {
    "mostkills": {
        "id": "kills",
        "name": "Most Kills",
        "sort": "highest"
    },
    "leastkills": {
        "id": "kills",
        "name": "Least Kills",
        "sort": "lowest"
    },
    "mostassists": {
        "id": "assists",
        "name": "Most Assists",
        "sort": "highest"
    },
    "mostdeaths": {
        "id": "deaths",
        "name": "Most Deaths",
        "sort": "highest"
    },
    "leastdeaths": {
        "id": "deaths",
        "name": "Least Deaths",
        "sort": "lowest"
    },
    "bestkd": {
        "id": "kd",
        "name": "Best K/d",
        "sort": "highest"
    },
    "worstkd": {
        "id": "kd",
        "name": "Worst K/d",
        "sort": "lowest"
    },
    "bestkad": {
        "id": "kad",
        "name": "Best Ka/d",
        "sort": "highest"
    },
    "worstkad": {
        "id": "kad",
        "name": "Worst Ka/d",
        "sort": "lowest"
    },
    "bestscore": {
        "id": "score",
        "name": "Best Score",
        "sort": "highest"
    },
    "worstscore": {
        "id": "score",
        "name": "Worst Score",
        "sort": "lowest"
    },
    "mostprimarykills": {
        "id": "primaryKills",
        "name": "Most Primary Kills",
        "sort": "highest"
    },
    "mostspecialkills": {
        "id": "specialKills",
        "name": "Most Special Kills",
        "sort": "highest"
    },
    "mostheavykills": {
        "id": "heavyKills",
        "name": "Most Heavy Kills",
        "sort": "highest"
    },
    "mostmeleekills": {
        "id": "melee",
        "name": "Most Melee Kills",
        "sort": "highest"
    },
    "mostgrenadekills": {
        "id": "grenade",
        "name": "Most Grenade Kills",
        "sort": "highest"
    },
    "mostsuperkills": {
        "id": "super",
        "name": "Most Super Kills",
        "sort": "highest"
    },
    "bestkillingspree": {
        "id": "killSpree",
        "name": "Best Killing Spree",
        "sort": "highest"
    },
    "bestcombatrating": {
        "id": "combatRating",
        "name": "Best Combat Rating",
        "sort": "highest"
    },
    "bestscoutrifle": {
        "id": "primaryKills",
        "name": "Best Scout Rifle",
        "sort": "highest",
        "secondary": "primaryType",
        "secondaryValue": "Scout Rifle"
    },
    "bestautorifle": {
        "id": "primaryKills",
        "name": "Best Auto Rifle",
        "sort": "highest",
        "secondary": "primaryType",
        "secondaryValue": "Auto Rifle"
    },
    "besthandcannon": {
        "id": "primaryKills",
        "name": "Best Hand Cannon",
        "sort": "highest",
        "secondary": "primaryType",
        "secondaryValue": "Hand Cannon"
    },
    "bestpulserifle": {
        "id": "primaryKills",
        "name": "Best Pulse Rifle",
        "sort": "highest",
        "secondary": "primaryType",
        "secondaryValue": "Pulse Rifle"
    },
    "bestshotgun": {
        "id": "specialKills",
        "name": "Best Shotgun",
        "sort": "highest",
        "secondary": "specialType",
        "secondaryValue": "Shotgun"
    },
    "bestsidearm": {
        "id": "specialKills",
        "name": "Best Sidearm",
        "sort": "highest",
        "secondary": "specialType",
        "secondaryValue": "Sidearm"
    },
    "bestfusionrifle": {
        "id": "specialKills",
        "name": "Best Fusion Rifle",
        "sort": "highest",
        "secondary": "specialType",
        "secondaryValue": "Fusion Rifle"
    },
    "bestsniperrifle": {
        "id": "specialKills",
        "name": "Best Sniper Rifle",
        "sort": "highest",
        "secondary": "specialType",
        "secondaryValue": "Sniper Rifle"
    },
    "bestrocketlauncher": {
        "id": "heavyKills",
        "name": "Best Rocket Launcher",
        "sort": "highest",
        "secondary": "heavyType",
        "secondaryValue": "Rocket Launcher"
    },
    "bestmachinegun": {
        "id": "heavyKills",
        "name": "Best Machine Gun",
        "sort": "highest",
        "secondary": "heavyType",
        "secondaryValue": "Machine Gun"
    },
    "bestsword": {
        "id": "heavyKills",
        "name": "Best Sword",
        "sort": "highest",
        "secondary": "heavyType",
        "secondaryValue": "Sword"
    },
    "mostneutralized": {
        "id": "neutralized",
        "name": "Most Neutralized",
        "sort": "highest"
    },
    "mostcaptures": {
        "id": "captures",
        "name": "Most Captures",
        "sort": "highest"
    },
    "mostavenges": {
        "id": "avenger",
        "name": "Most Avenges",
        "sort": "highest"
    },
    "mostpaybacks": {
        "id": "payBack",
        "name": "Most Paybacks",
        "sort": "highest"
    },
    "mostmedals": {
        "id": "medals",
        "name": "Most Medals",
        "sort": "highest"
    },
    "sleepersimulant": {
        "id": "heavyKills",
        "secondary": "heavy",
        "secondaryValue": "Sleeper Simulant",
        "name": "Sleeper Simulant",
        "sort": "highest"
    },
    "nolandbeyond": {
        "id": "primaryKills",
        "secondary": "primary",
        "secondaryValue": "No Land Beyond",
        "name": "No Land Beyond",
        "sort": "highest"
    },
    "universalremote": {
        "id": "primaryKills",
        "secondary": "primary",
        "secondaryValue": "Universal Remote",
        "name": "Universal Remote",
        "sort": "highest"
    },
    "vexmythoclast": {
        "id": "primaryKills",
        "secondary": "primary",
        "secondaryValue": "Vex Mythoclast",
        "name": "Vex Mythoclast",
        "sort": "highest"
    },
    "queenbreakersbow": {
        "id": "specialKills",
        "secondary": "special",
        "secondaryValue": "Queenbreakers' Bow",
        "name": "Queenbreakers' Bow",
        "sort": "highest"
    }
};
let lootHeaders = [{
    id: "ThreeOfCoins",
    name: "ToC"
}, {
    id: "RewardOne",
    name: "Reward 1"
}, {
    id: "RewardTwo",
    name: "Reward 2"
}, {
    id: "RewardThree",
    name: "Reward 3"
}, {
    id: "RewardFour",
    name: "Reward 4"
}, {
    id: "Rank",
    name: "Rank"
}, {
    id: "place",
    name: "Place"
}, {
    id: "win",
    name: "Win"
}, {
    id: "score",
    name: "Score"
}, {
    id: "id",
    name: "#"
}, {
    id: "mapName",
    name: "Map"
}];

const gameStats = [{ "id": "matches", "style": "gameStats", "name": "Matches" }, { "id": "uniqueguardians", "style": "gameStats", "name": "Unique Guardians" }, { "id": "guardiandata", "style": "gameStats", "name": "Guardian Data" }, { "id": "gameswon", "style": "gameStats", "name": "Games Won" }, { "id": "gameslost", "style": "gameStats", "name": "Games Lost" }, { "id": "win", "style": "gameStats", "name": "Win %" }, { "id": "rewards", "style": "gameStats", "name": "Rewards" }, { "id": "rewardspergame", "style": "gameStats", "name": "Rewards Per Game" }, { "id": "gamesperreward", "style": "gameStats", "name": "Games Per Reward" }, { "id": "hunters", "style": "gameStats", "name": "Hunters" }, { "id": "titans", "style": "gameStats", "name": "Titans" }, { "id": "warlocks", "style": "gameStats", "name": "Warlocks" }, { "id": "averagematchtimem", "style": "gameStats", "name": "Average Match Time (M)" }, { "id": "averagetimematchmakings", "style": "gameStats", "name": "Average Time Matchmaking (S)" }, { "id": "teamalpha", "style": "gameStats", "name": "Team Alpha" }, { "id": "teambravo", "style": "gameStats", "name": "Team Bravo" }];

const specialStats = [{ "id": "bestkillingspree", "style": "specialStats", "name": "Best Killing Spree" }, { "id": "longestlosingstreak", "style": "specialStats", "name": "Longest Losing Streak" }, { "id": "longestwinningstreak", "style": "specialStats", "name": "Longest Winning Streak" }, { "id": "winningstreaks", "style": "specialStats", "name": "Winning Streaks" }, { "id": "losingstreaks", "style": "specialStats", "name": "Losing Streaks" }, { "id": "carriesneutralized", "style": "specialStats", "name": "Carries/Neutralized" }, { "id": "dunkscaptures", "style": "specialStats", "name": "Dunks/Captures" }, { "id": "avenges", "style": "specialStats", "name": "Avenges" }, { "id": "paybacks", "style": "specialStats", "name": "Paybacks" }, { "id": "medals", "style": "specialStats", "name": "Medals" }];

const mainStats = [{ "id": "kills", "style": "mainStats", "name": "Kills" }, { "id": "assists", "style": "mainStats", "name": "Assists" }, { "id": "deaths", "style": "mainStats", "name": "Deaths" }, { "id": "kd", "style": "mainStats", "name": "K/d" }, { "id": "kad", "style": "mainStats", "name": "Ka/d" }];

const abilityKillsData = [{ "id": "primarykills", "style": "abilityKills", "name": "Primary Kills" }, { "id": "specialkills", "style": "abilityKills", "name": "Special Kills" }, { "id": "heavykills", "style": "abilityKills", "name": "Heavy Kills" }, { "id": "meleekills", "style": "abilityKills", "name": "Melee Kills" }, { "id": "grenadekills", "style": "abilityKills", "name": "Grenade Kills" }, { "id": "superkills", "style": "abilityKills", "name": "Super Kills" }];

const weaponsUsed = [{ "id": "autorifle", "style": "weaponsUsed", "name": "Auto Rifle" }, { "id": "scoutrifle", "style": "weaponsUsed", "name": "Scout Rifle" }, { "id": "pulserifle", "style": "weaponsUsed", "name": "Pulse Rifle" }, { "id": "handcannon", "style": "weaponsUsed", "name": "Hand Cannon" }, { "id": "shotgun", "style": "weaponsUsed", "name": "Shotgun" }, { "id": "sniperrifle", "style": "weaponsUsed", "name": "Sniper Rifle" }, { "id": "fusionrifle", "style": "weaponsUsed", "name": "Fusion Rifle" }, { "id": "sidearm", "style": "weaponsUsed", "name": "Sidearm" }, { "id": "rocketlauncher", "style": "weaponsUsed", "name": "Rocket Launcher" }, { "id": "machinegun", "style": "weaponsUsed", "name": "Machine Gun" }, { "id": "sword", "style": "weaponsUsed", "name": "Sword" }];

const rareRewardStats = [{ "id": "moteoflight", "style": "rareRewards", "name": "Mote of Light" }, { "id": "strangecoin", "style": "rareRewards", "name": "Strange Coin" }, { "id": "rareprimaryengram", "style": "rareRewards", "name": "Rare Primary Engram" }, { "id": "rarespecialengram", "style": "rareRewards", "name": "Rare Special Engram" }, { "id": "rareheavyengram", "style": "rareRewards", "name": "Rare Heavy Engram" }, { "id": "rarehelmetengram", "style": "rareRewards", "name": "Rare Helmet Engram" }, { "id": "rarechestengram", "style": "rareRewards", "name": "Rare Chest Engram" }, { "id": "raregauntletsengram", "style": "rareRewards", "name": "Rare Gauntlets Engram" }, { "id": "rarelegengram", "style": "rareRewards", "name": "Rare Leg Engram" }, { "id": "rareclassengram", "style": "rareRewards", "name": "Rare Class Engram" }, { "id": "rareprimary", "style": "rareRewards", "name": "Rare Primary" }, { "id": "rarespecial", "style": "rareRewards", "name": "Rare Special" }, { "id": "rareheavy", "style": "rareRewards", "name": "Rare Heavy" }, { "id": "rarehelmet", "style": "rareRewards", "name": "Rare Helmet" }, { "id": "rarechest", "style": "rareRewards", "name": "Rare Chest" }, { "id": "raregauntlets", "style": "rareRewards", "name": "Rare Gauntlets" }, { "id": "rareleg", "style": "rareRewards", "name": "Rare Leg" }, { "id": "rareclass", "style": "rareRewards", "name": "Rare Class" }, { "id": "rareghost", "style": "rareRewards", "name": "Rare Ghost" }, { "id": "totaldropsandraterare", "style": "rareRewards stat-header", "name": "Total Drops and Rate" }, { "id": "withmotesandcoins", "style": "rareRewards stat-header", "name": "With Motes and Coins" }];

const rareItemNames = ["Mote of Light", "Strange Coin", "Rare Primary Engram", "Rare Special Engram", "Rare Heavy Engram", "Rare Helmet Engram", "Rare Chest Engram", "Rare Gauntlets Engram", "Rare Leg Engram", "Rare Class Engram", "Rare Primary", "Rare Special", "Rare Heavy", "Rare Helmet", "Rare Chest", "Rare Gauntlets", "Rare Leg", "Rare Class", "Rare Ghost"];

const legendaryRewardStats = [{ "id": "legendaryhelmet", "style": "legendaryRewards", "name": "Legendary Helmet" }, { "id": "legendarychest", "style": "legendaryRewards", "name": "Legendary Chest" }, { "id": "legendarygauntlets", "style": "legendaryRewards", "name": "Legendary Gauntlets" }, { "id": "legendaryleg", "style": "legendaryRewards", "name": "Legendary Leg" }, { "id": "legendaryclass", "style": "legendaryRewards", "name": "Legendary Class" }, { "id": "legendaryghost", "style": "legendaryRewards", "name": "Legendary Ghost" }, { "id": "legendaryartifact", "style": "legendaryRewards", "name": "Legendary Artifact" }, { "id": "legendaryprimary", "style": "legendaryRewards", "name": "Legendary Primary" }, { "id": "legendaryspecial", "style": "legendaryRewards", "name": "Legendary Special" }, { "id": "legendaryheavy", "style": "legendaryRewards", "name": "Legendary Heavy" }, { "id": "totaldropsandratelegendary", "style": "legendaryRewards stat-header", "name": "Total Drops and Rate" }];

const legendaryItemNames = ["Legendary Helmet", "Legendary Chest", "Legendary Gauntlets", "Legendary Leg", "Legendary Class", "Legendary Ghost", "Legendary Artifact", "Legendary Primary", "Legendary Special", "Legendary Heavy"];

const exoticRewardStats = [{ "id": "primaryengram", "style": "exoticRewards", "name": "Primary Engram" }, { "id": "specialengram", "style": "exoticRewards", "name": "Special Engram" }, { "id": "heavyengram", "style": "exoticRewards", "name": "Heavy Engram" }, { "id": "helmetengram", "style": "exoticRewards", "name": "Helmet Engram" }, { "id": "chestengram", "style": "exoticRewards", "name": "Chest Engram" }, { "id": "gloveengram", "style": "exoticRewards", "name": "Gauntlet Engram" }, { "id": "bootengram", "style": "exoticRewards", "name": "Leg Engram" }, { "id": "droprate", "style": "exoticRewards stat-header", "name": "Drop Rate" }, { "id": "threeofcoinsused", "style": "exoticRewards", "name": "Three of Coins Used" }, { "id": "exoticsearned", "style": "exoticRewards", "name": "Exotics Earned" }, { "id": "tocperexotic", "style": "exoticRewards", "name": "ToC Per Exotic" }, { "id": "exoticcost", "style": "exoticRewards", "name": "Exotic Cost" }];

const exoticItemNames = ["Primary Engram", "Special Engram", "Heavy Engram", "Helmet Engram", "Chest Engram", "Gauntlet Engram", "Leg Engram"];

const weaponStats = ["weapon","used","wins","kills","deaths","assists"];

const additionalWeaponStats = ["weapon", "type", "used", "wins", "kills", "deaths", "assists"];

const guardianStats = [{ "id": "player", "style": "guardianStats", "name": "Player" }, { "id": "class", "style": "guardianStats", "name": "Class" }, { "id": "encountered", "style": "guardianStats", "name": "Encountered" }, { "id": "wins", "style": "guardianStats", "name": "Wins" }, { "id": "win", "style": "guardianStats", "name": "Win %" }, { "id": "kills", "style": "guardianStats", "name": "Kills" }, { "id": "killavg", "style": "guardianStats", "name": "Kill Avg" }, { "id": "deaths", "style": "guardianStats", "name": "Deaths" }, { "id": "deathavg", "style": "guardianStats", "name": "Death Avg" }, { "id": "assists", "style": "guardianStats", "name": "Assists" }, { "id": "assistavg", "style": "guardianStats", "name": "Assist Avg" }, { "id": "kd", "style": "guardianStats kd", "name": "K/d" }, { "id": "kad", "style": "guardianStats", "name": "K/ad" }];

const mapStats = [{ "id": "map", "style": "guardianStats", "name": "Map" }, { "id": "matches", "style": "guardianStats", "name": "Matches" }, { "id": "chances", "style": "guardianStats", "name": "Chances" }, { "id": "wins", "style": "guardianStats", "name": "Wins" }, { "id": "win", "style": "guardianStats", "name": "Win %" }, { "id": "kills", "style": "guardianStats", "name": "Kills" }, { "id": "assists", "style": "guardianStats", "name": "Assists" }, { "id": "deaths", "style": "guardianStats", "name": "Deaths" }, { "id": "kd", "style": "guardianStats", "name": "K/d" }, { "id": "kad", "style": "guardianStats", "name": "Ka/d" }, { "id": "killavg", "style": "guardianStats", "name": "Kill Avg" }, { "id": "assistavg", "style": "guardianStats", "name": "Assist Avg" }, { "id": "deathavg", "style": "guardianStats", "name": "Death Avg" }];

const mapSpawnStats = [{ "id": "map", "style": "guardianStats", "name": "Map" }, { "id": "team", "style": "guardianStats", "name": "Team" }, { "id": "matches", "style": "guardianStats", "name": "Matches" }, { "id": "chances", "style": "guardianStats", "name": "Chances" }, { "id": "wins", "style": "guardianStats", "name": "Wins" }, { "id": "win", "style": "guardianStats", "name": "Win %" }, { "id": "kills", "style": "guardianStats", "name": "Kills" }, { "id": "assists", "style": "guardianStats", "name": "Assists" }, { "id": "deaths", "style": "guardianStats", "name": "Deaths" }, { "id": "kd", "style": "guardianStats", "name": "K/d" }, { "id": "kad", "style": "guardianStats", "name": "Ka/d" }, { "id": "killavg", "style": "guardianStats", "name": "Kill Avg" }, { "id": "assistavg", "style": "guardianStats", "name": "Assist Avg" }, { "id": "deathavg", "style": "guardianStats", "name": "Death Avg" }];