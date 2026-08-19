/* node "Liliths Throne HTML/tools/smoke_pix_gym.js" */
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
  "js/text/pixsPlayground.js",
  "js/content/pixGym.js",
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
  location: { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_PIXS_GYM" },
};
LT.game.secondsPassed = 11 * 3600;

function named(id, title) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

LT.ensurePix();
assert(named("place.SHOPPING_ARCADE_PIXS_GYM", "Enter"), "Gym exterior offers Enter");
LT.getNode("pix.reception").applyPreParsingEffects();
assert(LT.getNode("pix.reception").getContent().indexOf("Pix") >= 0, "First visit introduces Pix");
assert(named("pix.reception", "Follow"), "First visit offers the tour");

named("pix.reception", "Follow").effects();
assert(LT.game.flags.innoxia_pix_had_tour, "Tour sets the official had-tour flag");
assert(named("pix.reception", "Membership (8000)"), "Lifetime membership is 8000");
assert(named("pix.reception", "Session (100)"), "A single session is 100");

named("pix.reception", "Membership (8000)").effects();
assert(LT.game.player.money === 12000, "Membership costs 8000");
assert(LT.countItems(LT.game.player, "innoxia_quest_gym_membership_card") === 1, "Membership card is given");
assert(named("pix.reception", "Showers"), "Members can use the showers");
assert(named("pix.reception", "Personal training"), "Members can ask Pix to train them");

assert(LT.getNode("pix.showers").getContent().indexOf("cubicles") >= 0, "Showers use official changing-room text");
assert(named("pix.showers", "Quick shower"), "Quick shower is available");
assert(named("pix.showers", "Thorough shower"), "Thorough shower is available");

assert(named("pix.workout", "Full effort"), "Workout offers full effort");
named("pix.workout", "Full effort").effects();
LT.getNode("pix.workoutEnd").applyPreParsingEffects();
assert(LT.getNode("pix.workoutEnd").getContent().indexOf("showers") >= 0, "Workout ends with the shower offer");
assert(named("pix.workoutEnd", "Join her"), "Join her starts Pix's shower");
assert(LT.getNode("pix.showerReward").getContent().indexOf("pins you up against the wall") >= 0, "Shower reward uses official pounce text");
assert(named("pix.showerReward", "Let her"), "Let her starts the shower sex");
assert(named("pix.showerReward", "Too tired"), "Too tired declines");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Pix gym/shower smoke checks passed.");
