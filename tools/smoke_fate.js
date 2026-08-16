/* node "Liliths Throne HTML/tools/smoke_fate.js" */
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
  "js/text/helenaNest.js",
  "js/text/harpyNests.js",
  "js/content/world.js",
  "js/content/lab.js",
  "js/content/demonHome.js",
  "js/content/enforcerHQ.js",
  "js/content/slaverAlley.js",
  "js/content/harpyNests.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  getName: function () { return "Alex"; },
  getRaceName: function () { return "human"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP", x: 3, y: 5 },
};
LT.game.flags.quest = "MAIN_1_F_SCARLETTS_FATE";
LT.game.secondsPassed = 11 * 3600;
LT.ensureHelena();
LT.ensureScarlett();

var ext = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "HELENAS_SHOP_EXTERIOR_HELENA_RETURNS");
assert(ext.indexOf("Helena") >= 0, "Return exterior mentions Helena");
assert(ext.indexOf("[npcFemale.") < 0, "Gossip speech parsed");

var shopR = LT.getNode("place.SLAVER_ALLEY_SCARLETTS_SHOP").getResponses(LT.game, 0);
var enter = shopR.filter(function (r) { return r && r.title === "Enter" && !r.disabled; })[0];
assert(enter && enter.nextDialogue === "helena.shop", "1-F Enter goes to Helena's shop");

var intro = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "HELENAS_SHOP_INTRODUCTION");
assert(intro.indexOf("ball gag") >= 0 || intro.indexOf("slave collar") >= 0, "Introduction shows enslaved Scarlett");
assert(intro.indexOf("[helena.") < 0 && intro.indexOf("[scarlett.") < 0 && intro.indexOf("[pc.") < 0, "Introduction parsed");

var inside = LT.getNode("helena.shop").getResponses(LT.game, 0);
assert(inside[1] && inside[1].title === "Offer to buy", "Offer to buy is slot 1");
inside[1].effects();
assert(LT.game.flags.quest === "MAIN_1_G_SLAVERY", "Offer to buy advances to MAIN_1_G");

var sale = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "HELENAS_SHOP_SCARLETT_FOR_SALE");
assert(sale.indexOf("slaver license") >= 0, "Helena requires a slaver license");
assert(sale.indexOf("Slavery Administration") >= 0, "She points you at Slavery Administration");
assert(sale.indexOf("fifteen thousand") >= 0, "Full price without punishment discount");

LT.game.flags.punishedByHelena = true;
var sale2 = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "HELENAS_SHOP_SCARLETT_FOR_SALE");
assert(sale2.indexOf("ten thousand") >= 0, "Punishment path gets the official discount");

var after = LT.getNode("helena.shop").getResponses(LT.game, 0);
var buy = after.filter(function (r) { return r && r.title && r.title.indexOf("Buy Scarlett") === 0; })[0];
assert(buy && buy.disabled, "Buy Scarlett is disabled without a license");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll 1-F smoke checks passed.");
