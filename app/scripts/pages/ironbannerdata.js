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
}, ]