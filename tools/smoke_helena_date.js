/* node "Liliths Throne HTML/tools/smoke_helena_date.js" */
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
  window: { allGrids: { DOMINION: [{ x: 17, y: 12, location: { placeType: "DOMINION_HARPY_NESTS_ENTRANCE" } }, { x: 15, y: 12, location: { name: "Street", placeType: "DOMINION_STREET" } }] } },
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
  "js/engine/properties.js",
  "js/engine/preferences.js",
  "js/engine/utilText.js",
  "js/items/items.js",
  "js/text/helenaGifts.js",
  "js/text/helenaHotel_hotelDate.js",
  "js/text/helenaHotel_hotel.js",
  "js/text/helenaRomance.js",
  "js/text/scarlett.js",
  "js/content/world.js",
  "js/content/demonHome.js",
  "js/content/helenaRomance.js",
  "js/content/helenaHotel.js",
].forEach(load);

var LT = context.LT;
LT.places = LT.places || {};
LT.places.DOMINION_HELENA_HOTEL = { name: "The Golden Feather Hotel", description: "Helena's hotel." };
LT.findPlaceTile = function (grid, type) {
  var tiles = context.window.allGrids[grid] || [];
  for (var i = 0; i < tiles.length; i++) if (tiles[i].location && tiles[i].location.placeType === type) return tiles[i];
  return null;
};
LT.game.player = {
  name: "Alex",
  money: 5000,
  affection: 0,
  getName: function () { return "Alex"; },
  getRaceName: function () { return "human"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" },
};
LT.game.flags.helenaRomance = "complete";
LT.game.flags.quest = "MAIN_1_H_THE_GREAT_ESCAPE";
LT.game.secondsPassed = 3 * 86400 + 18 * 3600;

function named(id, title) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

LT.ensureHelena();
LT.ensureScarlett();
assert(LT.isFridayEvening(), "Friday after 17:00 is date time");
assert(named("helena.romanceShop", "Date") && !named("helena.romanceShop", "Date").disabled, "Completed romance offers Date on Friday evening");

var start = LT.parseFromXML("places/dominion/helenaHotel/hotelDate", "DATE_START");
assert(start.indexOf("Helena") >= 0 || start.indexOf("date") >= 0 || start.length > 20, "Date start XML present");

assert(named("helena.dateStart", "Walk") && named("helena.dateStart", "Walk").nextDialogue === "helena.dateTravel", "Walk starts travel");
assert(named("helena.dateStart", "Fly") && named("helena.dateStart", "Fly").disabled, "Human cannot fly to the hotel");

LT.getNode("helena.dateTravel").applyPreParsingEffects();
assert(LT.findPlaceTile("DOMINION", "DOMINION_HELENA_HOTEL"), "First date stamps The Golden Feather on Dominion");

assert(named("helena.dateTravel", "Small talk"), "Wait with Scarlett: Small talk");
assert(named("helena.dateTravel", "Wait"), "Wait with Scarlett: Wait");
assert(!named("helena.dateTravel", "Romantic setup"), "Romantic setup waits on virginity talk");

LT.game.flags.helenaDateVirginityTalk = true;
assert(named("helena.dateTravel", "Romantic setup") && named("helena.dateTravel", "Romantic setup").disabled, "Romantic setup needs three rose bouquets");
LT.addItem(LT.game.player, "innoxia_gift_rose_bouquet", 3);
assert(LT.countItems(LT.game.player, "innoxia_gift_rose_bouquet") === 3, "Three rose bouquets can be carried");
assert(named("helena.dateTravel", "Romantic setup") && !named("helena.dateTravel", "Romantic setup").disabled, "Three roses unlock Romantic setup");
LT.game.npcs.scarlett.affection = 40;
assert(named("helena.dateRomanceSetup", "Thank her"), "Liked Scarlett agrees to the setup");
named("helena.dateRomanceSetup", "Thank her").effects();
assert(LT.game.flags.helenaDateRomanticSetup, "Thank her spends the roses and sets the scene");
assert(LT.countItems(LT.game.player, "innoxia_gift_rose_bouquet") === 0, "The three bouquets are used");
assert(named("helena.dateEnd", "Leave") && named("helena.dateEnd", "Leave").disabled, "Romantic setup blocks leaving after dinner");
assert(named("helena.dateHome", "Bedroom") && named("helena.dateHome", "Bedroom").nextDialogue === "helena.dateBedroom", "Romantic setup goes straight to the bedroom");
var romanceBed = LT.getNode("helena.dateBedroom").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(romanceBed.indexOf("Perform cunnilingus") >= 0, "Romantic bedroom starts with cunnilingus");
assert(named("helena.dateAfterRomanceSex", "Shower & sleep"), "After romance oral can shower and sleep");
LT.game.flags.helenaDateRomanticSetup = false;
LT.game.flags.helenaDateVirginityTalk = false;

assert(named("helena.dateRestaurant", "Wine"), "Wine is offered");
assert(named("helena.dateRestaurant", "Water"), "Water is offered");

LT.getNode("helena.dateTalking").applyPreParsingEffects();
var talk = LT.getNode("helena.dateTalking").getResponses(LT.game, 0).filter(Boolean);
assert(talk.length === 3, "Talk topic has three replies");
talk[0].effects();
assert((LT.game.flags.helenaTalkTopics || []).length >= 1, "Chosen topic is remembered");

assert(named("helena.datePlayerTopic", "Helena"), "Player can talk about Helena");
assert(named("helena.datePlayerTopic", "Gift") && named("helena.datePlayerTopic", "Gift").disabled, "Gift is locked without a present");
LT.addItem(LT.game.player, "innoxia_gift_chocolates");
assert(named("helena.datePlayerTopic", "Gift") && !named("helena.datePlayerTopic", "Gift").disabled, "A carried gift unlocks Gift");
assert(named("helena.dateGift", "Chocolates"), "Gift menu lists chocolates");
named("helena.dateGift", "Chocolates").effects();
assert(LT.game.flags.helenaGift === LT.dayNumber(), "Giving a gift sets the daily gift flag");
assert(LT.countItems(LT.game.player, "innoxia_gift_chocolates") === 0, "The gift is removed");
assert((LT.game.npcs.helena.affection || 0) >= 5, "Chocolates raise Helena's affection");
assert(named("helena.datePlayerTopic", "Gift") && named("helena.datePlayerTopic", "Gift").disabled, "Only one gift per day");
assert(named("helena.datePlayerTopic", "Sex life") && named("helena.datePlayerTopic", "Sex life").disabled, "Sex life requires 70 affection");

LT.game.npcs.helena.affection = 75;
assert(named("helena.datePlayerTopic", "Sex life") && !named("helena.datePlayerTopic", "Sex life").disabled, "Sex life unlocks at 70 affection");
named("helena.datePlayerTopic", "Sex life").effects();
assert(LT.game.flags.helenaDateSexLifeTalk, "Sex life talk is recorded");

assert(named("helena.dateEnd", "Accompany"), "Accompany Helena upstairs");
assert(named("helena.dateHome", "Inside") && !named("helena.dateHome", "Inside").disabled, "Sex-life talk unlocks Inside");

LT.game.flags.helenaDateSexLifeTalk = false;
assert(named("helena.dateHome", "Inside") && named("helena.dateHome", "Inside").disabled, "Inside stays locked without sex-life talk");

LT.game.flags.helenaDateSexLifeTalk = true;
assert(named("helena.dateApartment", "Coffee"), "Apartment offers coffee");
assert(named("helena.dateApartment", "First kiss"), "First kiss is available before Helena has been kissed");
assert(named("helena.dateApartment", "Bedroom") && named("helena.dateApartment", "Bedroom").disabled, "Bedroom waits on the first kiss");

named("helena.dateApartment", "First kiss").effects();
assert(LT.game.flags.helenaKissed, "First kiss is recorded");
assert(named("helena.dateKiss", "Bedroom") && !named("helena.dateKiss", "Bedroom").disabled, "After the kiss Bedroom unlocks");

var bed = LT.getNode("helena.dateBedroom").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(bed.indexOf("Finger her") >= 0, "Bedroom offers Finger her");
assert(bed.indexOf("Perform cunnilingus") >= 0, "Bedroom offers cunnilingus after the kiss");
assert(bed.indexOf("Receive cunnilingus") >= 0, "Bedroom offers receive cunnilingus for a player with a vagina");
assert(bed.indexOf("Virginity") >= 0, "Bedroom offers Virginity talk after oral");

assert(named("helena.dateAfterSex", "Leave"), "After sex can leave");
assert(named("helena.dateAfterSex", "Sleep over"), "After sex can sleep over");
assert(named("helena.dateWake", "Breakfast"), "Morning offers breakfast");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Helena date smoke checks passed.");
