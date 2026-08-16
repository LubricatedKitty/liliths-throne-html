/* node tools/smoke_weather.js */
var fs = require("fs");
var vm = require("vm");
var path = require("path");
var html = path.join(__dirname, "..");
var ctx = {
  window: {},
  document: { addEventListener: function () {}, dispatchEvent: function () {} },
  CustomEvent: function () {},
  LT: {},
};
ctx.window = ctx;
ctx.LT.TEXT = {};
vm.createContext(ctx);
function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(html, rel), "utf8"), ctx);
}
load("js/lt.js");
load("js/engine/game.js");
ctx.LT.hourOfDay = function () {
  var s = ((ctx.LT.game.secondsPassed % 86400) + 86400) % 86400;
  return Math.floor(s / 3600);
};
load("js/engine/utilText.js");
load("js/text/dominionPlaces.js");
load("js/content/weather.js");

var g = ctx.LT.game;
g.startingYear = 2019;
g.startingMonth = 7;
g.startingDay = 16;
g.secondsPassed = 20 * 3600 + 34 * 60;
var d1 = ctx.LT.formatGameDate();
if (d1.indexOf("16th August 2019") < 0) throw new Error("start date " + d1);
g.secondsPassed += 86400;
var d2 = ctx.LT.formatGameDate();
if (d2.indexOf("17th August 2019") < 0) throw new Error("next day " + d2);
if (ctx.LT.dayNumber() !== 2) throw new Error("day number " + ctx.LT.dayNumber());

ctx.LT.startArrivalStorm();
if (!ctx.LT.isArcaneStorm()) throw new Error("arrival storm missing");
if (!ctx.LT.isDangerousTile("DOMINION_STREET")) throw new Error("street should storm");
if (ctx.LT.isDangerousTile("DOMINION_PLAZA")) throw new Error("plaza should stay safe");
if (ctx.LT.isDangerousTile("DOMINION_BOULEVARD")) throw new Error("boulevard should stay safe");
if (!ctx.LT.isDangerousTile("DOMINION_BACK_ALLEYS")) throw new Error("alley always dangerous");

g.advanceTime(18001);
if (ctx.LT.isArcaneStorm()) throw new Error("storm should have ended after 5 hours");
if (ctx.LT.isDangerousTile("DOMINION_STREET")) throw new Error("street should be safe after storm");
if (!ctx.LT.isDangerousTile("DOMINION_BACK_ALLEYS")) throw new Error("alley still dangerous after storm");

ctx.LT.setWeatherInSeconds("MAGIC_STORM", 60);
var htmlStreet = ctx.LT.dominionPlaceText("DOMINION_STREET");
if (!htmlStreet || htmlStreet.indexOf("deserted") < 0) throw new Error("missing storm street text");
var htmlBlvd = ctx.LT.dominionPlaceText("DOMINION_BOULEVARD");
if (!htmlBlvd || htmlBlvd.toLowerCase().indexOf("arcane storm") < 0) throw new Error("missing boulevard storm text");

console.log("ok", d1, "->", d2, ctx.LT.currentWeather());
