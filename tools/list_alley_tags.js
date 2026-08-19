var fs = require("fs");
var s = fs.readFileSync(__dirname + "/../js/text/alleywayAttack.js", "utf8");
var tags = [];
var re = /"([A-Z0-9_]+)"\s*:/g;
var m;
while ((m = re.exec(s))) tags.push(m[1]);
console.log(tags.join("\n"));
console.log("count", tags.length);
