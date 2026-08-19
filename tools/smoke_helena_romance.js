/* node "Liliths Throne HTML/tools/smoke_helena_romance.js" */
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
  "js/engine/properties.js",
  "js/engine/preferences.js",
  "js/engine/utilText.js",
  "js/items/items.js",
  "js/text/scarlett.js",
  "js/text/slaverAlley.js",
  "js/text/helenaRomance.js",
  "js/text/homeImprovements.js",
  "js/text/helenaNest.js",
  "js/content/world.js",
  "js/content/demonHome.js",
  "js/content/slaverAlley.js",
  "js/content/harpyNests.js",
  "js/content/helenaNest.js",
  "js/content/helenaRomance.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  money: 20000,
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
LT.game.flags.freedScarlett = true;
LT.game.secondsPassed = 11 * 3600;

function named(id, title) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

LT.ensureHelena();
LT.ensureScarlett();
assert(LT.parseFromXML("places/dominion/slaverAlley/helenaRomance", "ROMANCE_BUSINESS").indexOf("Helena") >= 0, "Business XML present");
assert(named("helena.shop", "Business") && named("helena.shop", "Business").nextDialogue === "helena.business", "Business starts after buying Scarlett");

named("helena.business", "Thank her").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_1_OFFER_HELP", "Thank her starts Her Highness's Helper");

assert(named("helena.romanceShop", "Offer help"), "Offer help is available");
var pay = named("helena.offerHelp", "Pay (10000)");
assert(pay, "Full payment is offered with 20000 flames");
pay.effects();
assert(LT.getMoney() === 10000, "Paying Helena costs 10000");

named("helena.supplies", "Wait").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_2_PURCHASE_PAINT", "Wait advances to Purchase Paint");
assert(named("helena.romanceShop", "Paint") && named("helena.romanceShop", "Paint").disabled, "Paint is locked until purchased");

var prem = named("place.HOME_IMPROVEMENTS_SHELVING_PREMIUM", "Purchase (1500)");
assert(prem, "Premium Purple-star paint is for sale");
prem.effects();
assert(LT.countItems(LT.game.player, "innoxia_quest_paint_can_premium") === 1, "Premium paint is added");
assert(LT.getMoney() === 8500, "Premium paint costs 1500");

named("helena.romanceShop", "Paint").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR", "Delivering premium paint starts decorator 1/3");
assert(named("helena.romanceShop", "Strip paint"), "Strip paint is available immediately");

named("helena.romanceShop", "Strip paint").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR", "Stripping advances to decorator 2/3");

LT.game.flags.helenaGoneHome = 0;
assert(named("helena.romanceShop", "Paint frontage"), "Paint frontage is available");
LT.getNode("helena.paintB").applyPreParsingEffects();
assert(LT.game.npcs.natalya, "Natalya is created for the delivery");

LT.game.setContent = function () {};
LT.advanceHelenaRomance("ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR");
assert(named("helena.romanceShop", "Take paint"), "Take paint starts the sign");

LT.advanceHelenaRomance("ROMANCE_HELENA_4_SCARLETTS_RETURN");
LT.ensureScarlett();
assert(LT.game.npcs.scarlett.location.place === "HARPY_NESTS_HELENAS_NEST", "Freed Scarlett is still at the nest for her return");
var nestScarlett = named("place.HARPY_NESTS_HELENAS_NEST", "Scarlett");
assert(nestScarlett, "Nest Scarlett is available during her return");
LT.getNode("helena.meetScarlett").applyPreParsingEffects();
assert(named("helena.meetScarlett", "Helena") && named("helena.meetScarlett", "Helena").nextDialogue === "helena.scarlettToShop", "Nest meeting can send Scarlett back");

named("helena.meetScarlett", "Helena").effects();
LT.ensureScarlett();
assert(LT.game.flags.helenaScarlettToldToReturn, "Telling Scarlett sets the return flag");
assert(LT.game.npcs.scarlett.location.place === "SLAVER_ALLEY_SCARLETTS_SHOP", "Scarlett goes to the shop");

LT.game.flags.helenaGoneHome = 0;
assert(named("helena.romanceShop", "Agree"), "Helena offers Agree once Scarlett is back");
named("helena.romanceShop", "Agree").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_5_SCARLETT_TRAINER", "Agree advances to Harpy Helper");

assert(named("helena.romanceShop", "Follow"), "Follow starts potions");
named("helena.potions", "Transform her").effects();
assert(LT.game.npcs.scarlett.isFeminine(), "Transform her feminises Scarlett");

LT.getNode("helena.postersEnd").applyPreParsingEffects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_6_ADVERTISING", "Posters start Advertising");
assert(LT.countItems(LT.game.player, "innoxia_quest_rolled_up_posters") === 1, "Rolled-up posters are given");

var posters = named("place.SLAVER_ALLEY_ENTRANCE", "Posters");
assert(posters && posters.nextDialogue === "alley.posters", "Gateway offers Posters");
named("alley.posters", "Pay (100)").effects();
assert(LT.countItems(LT.game.player, "innoxia_quest_rolled_up_posters") === 0, "Posters are used");

named("helena.afterPosters", "Follow").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_7_GRAND_OPENING_PREPARATION", "Follow starts grand opening prep");

named("helena.tidy", "Make drinks").effects();
assert(LT.game.flags.helenaRomance === "ROMANCE_HELENA_8_FINISH", "Making drinks is the last task");

LT.getNode("helena.kissed").applyPreParsingEffects();
assert(LT.game.flags.helenaRomance === "complete", "The kiss completes Her Highness's Helper");

LT.game.flags.helenaGoneHome = 0;
LT.getNode("place.HARPY_NESTS_HELENAS_NEST").applyPreParsingEffects();
assert(named("place.HARPY_NESTS_HELENAS_NEST", "Helena") && !named("place.HARPY_NESTS_HELENAS_NEST", "Helena").disabled, "Completed romance reopens Helena at the nest");
LT.getNode("helena.meetScarlett").applyPreParsingEffects();
assert(named("helena.meetScarlett", "Servant"), "Completed romance unlocks Servant");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Her Highness's Helper smoke checks passed.");
