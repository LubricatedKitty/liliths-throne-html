/* node "Liliths Throne HTML/tools/smoke_example_mods.js" */
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
  getElementById: function (id) { return id === "example-mod-style" ? null : { style: {}, hidden: false }; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { style: {}, id: "", textContent: "", setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
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
context.window.document = document;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
[
  "js/lt.js",
  "js/engine/colours.js",
  "js/character/enums.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/statusEffects.js",
  "js/character/player.js",
  "js/character/npcs.js",
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/items/items.js",
  "js/combat/damage.js",
  "js/combat/combat.js",
  "js/content/encounters.js",
  "js/content/world.js",
  "js/content/shoppingArcade.js",
  "js/ui/menus/phone.js",
].forEach(load);

function jsFromMod(rel) {
  var text = fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
  var lines = text.split("\n");
  var collecting = false;
  var body = [];
  var i;
  for (i = 0; i < lines.length; i++) {
    if (/^Add Javascript(?:\s+\[[^\]]+\])?:\s*$/.test(lines[i].trim())) {
      collecting = true;
      continue;
    }
    if (collecting && /^(Replace|Add Javascript|Add Content|Add Boot)(?:\s+\[[^\]]+\])?:\s*$/.test(lines[i].trim())) {
      break;
    }
    if (collecting) body.push(lines[i]);
  }
  return body.join("\n");
}

var mods = [
  "mods/sweetTea/sweetTea.mod",
  "mods/examples/ralphTeaTalk.mod",
  "mods/examples/miraQuest.mod",
  "mods/examples/cellarHatch.mod",
  "mods/examples/streetPurse.mod",
  "mods/examples/teaShield.mod",
  "mods/examples/exampleSexAction.mod",
  "mods/examples/exampleHub.mod",
];
mods.forEach(function (rel) {
  vm.runInNewContext(jsFromMod(rel), context, { filename: rel });
});

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  player: true,
  money: 20000,
  items: [],
  health: 40,
  maxHealth: 40,
  getName: function () { return "Alex"; },
  isFeminine: function () { return true; },
  isPlayer: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "DOMINION", place: "DOMINION_PARK", x: 6, y: 1 },
};
LT.game.secondsPassed = 11 * 3600;
LT.game.started = true;
LT.game.flags = {};
LT.game.npcs = LT.game.npcs || {};

function titles(id) {
  return LT.getNode(id).getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
}

assert(LT.ITEMS.my_mod_tea && LT.ITEMS.my_mod_tea.soldBy.indexOf("ralph") >= 0, "Sweet tea is sold by Ralph");
assert(LT.shopItemIds("ralph").indexOf("my_mod_tea") >= 0, "Ralph shop list includes sweet tea");
assert(LT.ITEMS.my_mod_parcel && LT.ITEMS.my_mod_parcel.id === "my_mod_parcel", "Mira parcel item exists");

assert(LT.hasNode("my.ralphTea"), "Ralph tea node exists");
assert(titles("ralph.shop").indexOf("Ask about tea") >= 0, "Ralph shop has Ask about tea");
assert(titles("ralph.shop").indexOf("Trade with Ralph") >= 0, "Official Ralph trade still present");

assert(LT.hasNode("my.mira"), "Mira node exists");
assert(typeof LT.ensureMyNpc === "function", "ensureMyNpc exists");
var mira = LT.ensureMyNpc();
assert(mira && mira.name === "Mira", "Mira name");
assert(titles("place.generic").indexOf("Talk to Mira") >= 0, "Park generic node offers Talk to Mira");
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 3, y: 2 };
assert(titles("place.generic").indexOf("Talk to Mira") < 0, "Talk to Mira is not on non-park tiles");

LT.getNode("my.mira").applyPreParsingEffects();
var meet = LT.getNode("my.mira").getContent();
assert(meet.indexOf("Mira") >= 0 || meet.indexOf("cat-girl") >= 0, "Mira meet text parses");
assert(meet.indexOf("[myNpc.") < 0, "Mira meet text has no leftover tokens: " + meet.slice(0, 160));

assert(context.window.allGrids.MY_CELLAR && context.window.allGrids.MY_CELLAR.length === 2, "Cellar grid has two tiles");
assert(LT.hasNode("place.MY_CELLAR_STAIRS"), "Cellar stairs node");
assert(LT.hasNode("place.MY_CELLAR_RACKS"), "Cellar racks node");
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 6, y: 2 };
assert(titles("place.DOMINION_STREET").indexOf("Cellar hatch") >= 0, "Hatch appears on street 6,2");
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 3, y: 2 };
assert(titles("place.DOMINION_STREET").indexOf("Cellar hatch") < 0, "Hatch is not on other streets");

var street = LT.streetEncounterEntries();
assert(street.some(function (e) { return e.id === "MY_STREET_EVENT"; }), "Street table includes purse event");
assert(LT.hasNode("my.streetEvent") && LT.hasNode("my.streetEvent.wait"), "Purse nodes exist");

assert(LT.SEX_ACTIONS.example_compliment && LT.SEX_ACTIONS.example_compliment.tab === 0, "Example sex action registered");

LT.game.flags.exampleTeaShield = true;
var left = LT.applyTypedDamage(LT.game.player, 10, "PHYSICAL");
assert(left === 5, "Tea shield halves incoming damage, got " + left);

assert(LT.hasNode("example.hub"), "Hub node exists");
assert(titles("phone.menu").indexOf("Example Mods") >= 0, "Phone has Example Mods");
assert(titles("example.hub").indexOf("Go to Ralph") >= 0, "Hub can jump to Ralph");
assert(titles("example.hub").indexOf("Dropped purse") >= 0, "Hub can jump to purse");
assert(titles("example.hub").indexOf("Spar with dummy") >= 0, "Hub can start dummy spar");

var hubHtml = LT.getNode("example.hub").getContent();
assert(hubHtml.indexOf("Sweet Tea is loaded") >= 0, "Hub sees sweet tea");
assert(hubHtml.indexOf("Mira's Parcel is loaded") >= 0, "Hub sees Mira");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL EXAMPLE MOD SMOKES PASSED");
