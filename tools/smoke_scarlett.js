/* node "Liliths Throne HTML/tools/smoke_scarlett.js" */
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
  window: null,
  document: document,
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  LT: { TEXT: {} },
};
context.window = context;
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
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/text/lab.js",
  "js/text/apartment.js",
  "js/text/enforcerGeneric.js",
  "js/text/enforcerBrax.js",
  "js/text/scarlett.js",
  "js/text/slaverAlley.js",
  "js/content/world.js",
  "js/content/lab.js",
  "js/content/demonHome.js",
  "js/content/enforcerHQ.js",
  "js/content/slaverAlley.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  getName: function () { return "Alex"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP", x: 3, y: 5 },
};
LT.game.flags.quest = "MAIN_1_D_SLAVERY";
LT.game.secondsPassed = 10 * 3600;

LT.ensureScarlett();
LT.ensureHelena();
assert(LT.isWorkTime() === true, "10:00 shop is open");
assert(LT.game.npcs.scarlett.location && LT.game.npcs.scarlett.location.place === "SLAVER_ALLEY_SCARLETTS_SHOP", "Scarlett in shop");
assert(LT.game.npcs.helena.getName() === "Helena", "Helena exists for parser");

var ext = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "SCARLETTS_SHOP_EXTERIOR");
assert(ext.indexOf("Scarlett's Shop") >= 0, "Open exterior names the shop");
assert(ext.indexOf("[unit.") < 0, "unit.time parsed");

var shopR = LT.getNode("place.SLAVER_ALLEY_SCARLETTS_SHOP").getResponses(LT.game, 0);
var enter = shopR.filter(function (r) { return r && r.title === "Enter" && !r.disabled; })[0];
assert(enter && enter.nextDialogue === "scarlett.shop", "Daytime Enter is available");

var intro = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "SCARLETTS_SHOP_INTRO");
assert(intro.indexOf("donate any slaves") >= 0, "Intro has Scarlett's greeting");
assert(intro.indexOf("[scarlett.") < 0, "Scarlett speech parsed");

var inside = LT.getNode("scarlett.shop").getResponses(LT.game, 0);
assert(inside[0] && inside[0].title === "Leave", "Leave is slot 0");
assert(inside[1] && inside[1].title === "Ask for Arthur", "Ask for Arthur is slot 1");

var bitch = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "SCARLETT_IS_A_BITCH");
assert(bitch.indexOf("Helena") >= 0, "Scarlett names Helena");
assert(bitch.indexOf("Harpy Nests") >= 0, "She sends you to the Harpy Nests");
assert(bitch.indexOf("[helena.") < 0 && bitch.indexOf("[pc.") < 0, "Bitch scene parsed");

var agree = LT.getNode("scarlett.bitch").getResponses(LT.game, 0);
agree[1].effects();
assert(LT.game.flags.quest === "MAIN_1_E_REPORT_TO_HELENA", "Agree advances to MAIN_1_E");

var later = LT.getNode("place.SLAVER_ALLEY_SCARLETTS_SHOP").getResponses(LT.game, 0);
var blocked = later.filter(function (r) { return r && r.title === "Enter"; })[0];
assert(blocked && blocked.disabled, "After 1-E, shop Enter is disabled");

LT.game.secondsPassed = 23 * 3600;
var night = LT.getNode("place.SLAVER_ALLEY_SCARLETTS_SHOP").getResponses(LT.game, 0);
var nightEnter = night.filter(function (r) { return r && r.title === "Enter"; })[0];
assert(nightEnter && nightEnter.disabled, "Night shop is closed");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll 1-D smoke checks passed.");
