/* node "Liliths Throne HTML/tools/smoke_public_stocks.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var listeners = {};
var document = {
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
  },
  addEventListener: function (type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  dispatchEvent: function (e) { (listeners[e.type] || []).forEach(function (fn) { fn(e); }); },
  head: { appendChild: function () {} },
  body: { appendChild: function () {} },
};
var context = {
  console: console,
  window: { allGrids: {} },
  document: document,
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  LT: { TEXT: {} },
};
context.window.LT = context.LT;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
[
  "js/lt.js",
  "js/engine/colours.js",
  "js/character/enums.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/npcs.js",
  "js/character/slavery.js",
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/text/slaverAlley.js",
  "js/content/houseManage.js",
  "js/content/publicStocks.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  money: 20000,
  items: [],
  getName: function () { return "Alex"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_PUBLIC_STOCKS" },
};
LT.game.flags.hasSlaverLicense = true;
LT.game.secondsPassed = 12 * 3600;

function named(id, title) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

LT.ensureSean();
LT.getNode("place.SLAVER_ALLEY_PUBLIC_STOCKS").applyPreParsingEffects();
var html = LT.getNode("place.SLAVER_ALLEY_PUBLIC_STOCKS").getContent();
assert(html.indexOf("public stocks") >= 0 || html.indexOf("wooden frame") >= 0, "Stocks tile uses official courtyard text");
assert(html.indexOf("Enforcer") >= 0 || html.indexOf("sean") >= 0 || html.indexOf("Sean") >= 0, "Sean is mentioned");
assert(named("place.SLAVER_ALLEY_PUBLIC_STOCKS", "Enforcer"), "Unmet Sean is listed as Enforcer");

assert(LT.getNode("stocks.sean").getContent().indexOf("wolf") >= 0 || LT.getNode("stocks.sean").getContent().indexOf("Enforcer") >= 0 || LT.getNode("stocks.sean").getContent().length > 40, "Sean intro XML parses");
assert(named("stocks.sean", "Talk"), "Sean Talk is available");
assert(named("stocks.sean", "Complain"), "Sean Complain is available");

named("stocks.sean", "Complain").effects();
assert(named("stocks.complain", "Persist"), "Complain can persist");
assert(named("stocks.persist", "Take their place"), "Persist offers taking their place");
assert(LT.getNode("stocks.takePlace").getContent().indexOf("stocks") >= 0, "Take place locks the player up");
assert(named("stocks.lockedRandoms", "Endure it"), "Locked-up randoms can use the player");

var rec = LT.snapshotSlave({ name: "Testa", feminine: true, raceName: "cat-girl", fullRace: "cat-girl" });
rec.hours = [];
var h;
for (h = 0; h < 24; h++) rec.hours[h] = "PUBLIC_STOCKS";
rec.job = "PUBLIC_STOCKS";
rec.jobSettings = { PUBLIC_STOCKS: { SEX_ORAL: true, SEX_VAGINAL: true, SEX_ANAL: true } };
LT.ownedSlaves().push(rec);
if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
LT.getNode("place.SLAVER_ALLEY_PUBLIC_STOCKS").applyPreParsingEffects();
assert(named("place.SLAVER_ALLEY_PUBLIC_STOCKS", "Use Testa"), "Owned stocks slaves can be used");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll public-stocks smoke checks passed.");
