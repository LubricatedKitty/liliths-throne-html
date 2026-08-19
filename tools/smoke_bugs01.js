/* node "Liliths Throne HTML/tools/smoke_bugs01.js" */
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
  getElementById: function () { return { classList: { add: function () {}, remove: function () {} } }; },
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
  localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
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
  "js/character/statusEffects.js",
  "js/character/player.js",
  "js/character/npcs.js",
  "js/character/slavery.js",
  "js/engine/game.js",
  "js/engine/properties.js",
  "js/engine/preferences.js",
  "js/engine/utilText.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/content/characterCreation.js",
  "js/content/alleys.js",
  "js/text/kaysTextiles.js",
  "js/text/theWateringHole.js",
  "js/text/angelsKiss.js",
].forEach(load);

var LT = context.LT;
LT.setTitle = function () {};
LT.setChrome = function () {};
LT.openUI = function () {};
LT.setResponses = function () {};
LT.game.player = LT.createNewPlayer();
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 4, y: 4 };
LT.game.started = true;

LT.game.player.health = 3;
LT.game.player.mana = 2;
LT.applySleepEffect(LT.game.player, 60);
assert(LT.hasStatusEffect(LT.game.player, "WELL_RESTED"), "Rest applies Well Rested");
assert(LT.game.player.health === LT.game.player.maxHealth, "Rest refills health to the Well Rested maximum");
assert(LT.game.player.mana === LT.game.player.maxMana, "Rest refills aura to the Well Rested maximum");

var mugger = LT.generateAlleyMugger({ storm: true, prostitute: false, noBind: true, feminine: true });
assert(mugger.attractedToPlayer === true, "Storm attackers always want sex");

LT.game.npcs.amber = { id: "amber", name: "Amber", getName: function () { return "Amber"; } };
LT.game.npcs.alley_99 = { id: "alley_99", name: "Fox" };
assert(LT.namedCharacterIds().indexOf("amber") < 0, "Unmet unique NPCs are not phone contacts");
assert(LT.namedCharacterIds().indexOf("alley_99") < 0, "Alley transients are not phone contacts");
LT.markCharacterEncountered("amber");
assert(LT.namedCharacterIds().indexOf("amber") >= 0, "Met unique NPCs appear in contacts");

assert(LT.parse("[unit.sizes]") === "centimetres", "[unit.sizes] parses to centimetres");
assert(LT.parse("[units.sizes]") === "centimetres", "[units.sizes] parses to centimetres");
var clubber = { id: "npc", name: "Mira", fullRace: "cat-girl", occupation: "clubber", feminine: true, isFeminine: function () { return true; }, getName: function () { return "Mira"; } };
LT.game.npcs.npc = clubber;
assert(LT.parse("[npc.a_raceFull]").indexOf("cat-girl") >= 0, "[npc.a_raceFull] parses");
assert(LT.parse("[npc.job]") === "clubber", "[npc.job] parses to occupation");
LT.ensureAngel();
assert(LT.parse("[angel.speech(Welcome!)]").indexOf("Welcome!") >= 0, "[angel.speech] parses once Angel exists");
assert(LT.parse("[angel.speech(Welcome!)]").indexOf("[angel.speech") < 0, "[angel.speech] leaves no leftover token");

assert(LT.hasNode("place.DOMINION_NIGHTLIFE_DISTRICT") === false || LT.hasNode("place.DOMINION_NIGHTLIFE_DISTRICT"), "nightlife node helper exists");
LT.defineNode({ id: "place.generic", ui: "dialogue", title: "Street", getContent: function () { return "<p>Street.</p>"; }, getResponses: function () { return []; } });
LT.game.currentNode = LT.getNode("place.generic");
LT.game.setContent("place.DOES_NOT_EXIST");
assert(LT.game.currentNode && LT.game.currentNode.id === "place.generic", "Unknown nodes fall back instead of locking travel");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("All Bugs Found 01 smoke checks passed.");
