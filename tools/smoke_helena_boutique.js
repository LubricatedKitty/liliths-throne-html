/* node "Liliths Throne HTML/tools/smoke_helena_boutique.js" */
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
  "js/character/bodyEnums.js",
  "js/character/body.js",
  "js/character/names.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/npcs.js",
  "js/character/slavery.js",
  "js/engine/game.js",
  "js/engine/properties.js",
  "js/engine/preferences.js",
  "js/engine/utilText.js",
  "js/items/items.js",
  "js/text/scarlett.js",
  "js/text/slaverAlley.js",
  "js/text/helenaRomance.js",
  "js/text/helenasBoutique.js",
  "js/text/homeImprovements.js",
  "js/content/world.js",
  "js/content/demonHome.js",
  "js/content/slaverAlley.js",
  "js/content/helenaRomance.js",
  "js/content/helenaBoutique.js",
  "js/content/helenaHotel.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  money: 40000,
  items: [],
  getName: function () { return "Alex"; },
  getRaceName: function () { return "human"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" },
};
LT.game.flags.quest = "MAIN_1_H_THE_GREAT_ESCAPE";
LT.game.flags.hasSlaverLicense = true;
LT.game.flags.helenaRomance = "complete";
LT.game.secondsPassed = 11 * 3600;

function named(id, title) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

assert(LT.TEXT["places/dominion/slaverAlley/helenasBoutique"].HELENAS_SHOP_CUSTOM_SLAVE_START, "Boutique start XML is loaded");
assert(LT.TEXT["places/dominion/slaverAlley/helenasBoutique"].HELENAS_SHOP_CUSTOM_SLAVE_DELIVERY, "Boutique delivery XML is loaded");

LT.ensureHelena();
LT.ensureScarlett();
var shop = LT.getNode("helena.romanceShop");
assert(shop, "Completed romance shop exists");
var html = shop.getContent();
assert(html.indexOf("Helena's Boutique") >= 0 || html.indexOf("beautiful harpy matriarch") >= 0, "Completed shop uses boutique greeting");
assert(named("helena.romanceShop", "Custom slave"), "Custom slave is offered after the romance");
assert(named("helena.romanceShop", "Talk"), "Talk is still offered");

named("helena.romanceShop", "Custom slave");
var start = LT.getNode("helena.customSlaveStart");
assert(start.getContent().indexOf("custom slave") >= 0, "Start uses official custom-slave text");
assert(named("helena.customSlaveStart", "Female template"), "Female template is available");
assert(named("helena.customSlaveStart", "Male template"), "Male template is available");
assert(named("helena.customSlaveStart", "Back out"), "Back out is available");

named("helena.customSlaveStart", "Back out");
assert(LT.getNode("helena.customSlaveDeclined").getContent().indexOf("don't want to order") >= 0, "Declining uses official text");

named("helena.customSlaveStart", "Female template").effects();
var slave = LT.getHelenaCustomSlave();
assert(slave && slave.feminine, "Female template creates a feminine human");
assert(slave.raceName === "HUMAN", "Template starts as human");
assert(LT.helenaCustomSlaveValue(false) === 25000, "Human slave costs official 25000");
assert(LT.helenaCustomSlaveValue(true) === 30000, "Slime special is +5000");

assert(named("helena.customSlavePersonality", "Personality").disabled, "Personality tab is current");
assert(named("helena.customSlavePersonality", "Body"), "Body tab is available");
assert(named("helena.customSlavePersonality", "Finalise order"), "Finalise order is available");

LT._helenaBoutiqueApply("race:CAT_MORPH");
assert(LT.getHelenaCustomSlave().raceName === "CAT_MORPH", "Race can be set to cat-morph");
assert(LT.helenaCustomSlaveValue(false) === 30000, "Full non-human morph adds official 5000");

LT._helenaBoutiqueApply("nameRandom");
LT._helenaBoutiqueApply("obe:50");
LT._helenaBoutiqueApply("aff:50");
LT._helenaBoutiqueApply("orient:GYNEPHILIC");
assert(slave.obedience === 50 && slave.affection === 50, "Obedience and affection can be set");

LT.getNode("helena.customSlaveFinish").applyPreParsingEffects();
var finishHtml = LT.getNode("helena.customSlaveFinish").getContent();
assert(finishHtml.indexOf("slime special") >= 0 || finishHtml.indexOf("Slime special") >= 0, "Finish mentions the slime special");
assert(named("helena.customSlaveFinish", "Order (30000)"), "Order shows the race-adjusted price");
assert(named("helena.customSlaveFinish", "Slime special (35000)"), "Slime special shows +5000");

LT.game.player.money = 1000;
assert(named("helena.customSlaveFinish", "Order (30000)").disabled, "Order is locked when the player cannot afford it");
LT.game.player.money = 40000;

named("helena.customSlaveFinish", "Order (30000)").effects();
assert(LT.game.player.money === 10000, "Ordering deducts the official price");
assert(LT.game.flags.helenaSlaveOrderDay === LT.dayNumber(), "Order stamps helenaSlaveOrderDay");
assert(named("helena.romanceShop", "Collect slave").disabled, "Collect is locked for seven days");
assert(shop.getContent().indexOf("days until your slave is ready") >= 0, "Shop reminds you of the wait");

LT.game.secondsPassed += 6 * 86400;
assert(LT.helenaCustomSlaveDaysLeft() === 1, "Six days later one day remains");
assert(named("helena.romanceShop", "Collect slave").disabled, "Still locked on day 6");

LT.game.secondsPassed += 86400;
assert(LT.helenaCustomSlaveDaysLeft() === 0, "Ready after seven days");
assert(named("helena.romanceShop", "Collect slave") && !named("helena.romanceShop", "Collect slave").disabled, "Collect unlocks after seven days");
assert(shop.getContent().indexOf("collect your slave") >= 0, "Shop says the slave is ready");

var delivery = LT.getNode("helena.customSlaveDelivery");
delivery.applyPreParsingEffects();
var delHtml = delivery.getContent();
assert(delHtml.indexOf(slave.name) >= 0, "Delivery uses the ordered slave's name");
assert(named("helena.customSlaveDelivery", "Respond"), "Respond takes delivery");

named("helena.customSlaveDelivery", "Respond").effects();
assert(!LT.getHelenaCustomSlave(), "Helena no longer holds the custom slave");
assert(LT.ownedSlaves().some(function (s) { return s.name === slave.name; }), "takeOwnership registers the slave");
assert(slave.location.place === "SLAVER_ALLEY_SLAVERY_ADMINISTRATION", "Slave is sent to Slavery Administration");
assert(named("helena.romanceShop", "Custom slave"), "A new order can be started after collection");

named("helena.customSlaveStart", "Male template").effects();
var male = LT.getHelenaCustomSlave();
assert(male && !male.feminine && male.hasPenis(), "Male template creates a masculine human");
named("helena.customSlavePersonality", "Cancel").effects();
assert(!LT.getHelenaCustomSlave(), "Cancel banishes the unfinished slave");

assert(LT._helenaIntToString(25000) === "twenty-five thousand", "Prices use official word form");
assert(LT._helenaIntToString(7) === "seven", "Wait days use official word form");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Helena custom-slave smoke checks passed.");
