/* node "Liliths Throne HTML/tools/smoke_ralph_desk.js" */
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
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/items/items.js",
  "js/text/ralphsSnacks.js",
  "js/content/shoppingArcade.js",
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
  location: { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_RALPHS_SHOP" },
};
LT.game.secondsPassed = 11 * 3600;

function named(id, title) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

assert(named("place.SHOPPING_ARCADE_RALPHS_SHOP", "Enter"), "Ralph's shop can be entered during work hours");
LT.getNode("ralph.shop").applyPreParsingEffects();
assert(LT.getNode("ralph.shop").getContent().indexOf("horse-boy") >= 0, "First visit uses official Ralph intro");
assert(named("ralph.shop", "Discount"), "Discount is offered");
assert(named("ralph.shop", "Trade with Ralph"), "Trade is offered");

named("ralph.shop", "Discount").effects();
assert(LT.getNode("ralph.discount").getContent().indexOf("twenty-five percent") >= 0, "Discount ask uses official 25% offer");
assert(named("ralph.discount", "Agree"), "Agree starts the desk deal");
assert(named("ralph.discount", "Refuse"), "Refuse is available");

named("ralph.discount", "Agree").effects();
assert(LT.getNode("ralph.desk").getContent().indexOf("kneel under my desk") >= 0, "Agree kneels the player under the desk");
assert(named("ralph.desk", "Stay quiet"), "Stay quiet keeps the full discount");
assert(named("ralph.desk", "Can't stay quiet"), "Making a noise knocks 5% off");

named("ralph.desk", "Can't stay quiet").effects();
assert(LT.game.flags.ralphDeskDiscount === 20, "A heard moan is official -5%");
assert(LT.getNode("ralph.deskHeard").getContent().indexOf("20%") >= 0, "Heard path shows 20%");

LT.getNode("ralph.afterDesk").applyPreParsingEffects();
assert(LT.ralphDiscountActive() && LT.ralphDiscount() === 20, "Aftercare applies a 3-day discount");
var before = LT.itemBuyPrice("ADDICTION_REMOVAL");
assert(before === Math.round(750 * 1.5 * 0.8), "Ralph stock is discounted");

LT.game.secondsPassed += 4320 * 60;
LT.resetRalphDiscountCheck();
assert(!LT.ralphDiscountActive(), "Discount expires after three days");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Ralph desk-deal smoke checks passed.");
