var fs = require('fs');
var path = require('path');
var manifest = require("./test/manifest.json");
var version = manifest.version.split(".");
var today = new Date();
version[0] = "" + today.getFullYear();
version[1] = "" + (today.getMonth() + 1) + ("0000" + today.getDate()).slice(-2);
version[2] = "" + today.getHours() + ("0000" + today.getMinutes()).slice(-2);
manifest.version = version.join(".");
manifest.version_name = "Test Branch " + today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
manifest.name = "Destiny Loot History Test Branch";
fs.writeFile("./test/manifest.json", JSON.stringify(manifest, null, "\t"), function (err) {
	if (err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});

function copy(file, route) {
	if (["gdrive.html", "gdrive.js", "icon16.png", "icon32.png", "icon48.png", "icon128.png", "manifest.json"].indexOf(file) === -1) {
		fs.stat(path.resolve(__dirname, "app", route, file), function (err, stats) {
			console.log(file);
			if (!stats.isDirectory()) {
				fs.createReadStream(path.join("app", route, file)).pipe(fs.createWriteStream(path.join("test", route, file)));
			}
		});
	}
}

var files = fs.readdirSync('./app');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "");
}

var files = fs.readdirSync('./app/DestinyDatabase');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "DestinyDatabase");
}

var files = fs.readdirSync('./app/fonts');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "fonts");
}

var files = fs.readdirSync('./app/img');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "img");
}

var files = fs.readdirSync('./app/scripts');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "scripts");
}

var files = fs.readdirSync('./app/scripts/pages');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "scripts/pages");
}

var files = fs.readdirSync('./app/scripts/tools');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "scripts/tools");
}

var files = fs.readdirSync('./app/scripts/vendor');
for (var i = 0; i < files.length; i++) {
	var file = files[i];
	copy(file, "scripts/vendor");
}