/* node "Liliths Throne HTML/tools/smoke_helena.js" */
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
  location: { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST", x: 2, y: 2 },
};
LT.game.flags.quest = "MAIN_1_E_REPORT_TO_HELENA";
LT.game.secondsPassed = 11 * 3600;

LT.ensureHelena();
assert(LT.isWorkTime() === true, "11:00 nest is awake");

var access = LT.parseFromXML("places/dominion/harpyNests/generic", "ENTRANCE_ENFORCER_POST_ASK_FOR_ACCESS");
assert(access.indexOf("Helena") >= 0, "Access briefing mentions Helena on 1-E");
assert(access.indexOf("[style.") < 0, "Access style tags parsed");

context.grid = { gridName: "HARPY_NEST" };
var walk = { location: { placeType: "HARPY_NESTS_WALKWAYS" } };
var post = { location: { placeType: "HARPY_NESTS_ENTRANCE_ENFORCER_POST" } };
assert(LT.canEnterTile(walk) === false, "Walkways blocked without nest pass");
assert(LT.canEnterTile(post) === true, "Enforcer post is public");
LT.getNode("harpy.access").applyPreParsingEffects();
assert(LT.game.flags.hasHarpyNestAccess === true, "Request access grants nest pass");
assert(LT.canEnterTile(walk) === true, "Walkways open after pass");

var nestR = LT.getNode("place.HARPY_NESTS_HELENAS_NEST").getResponses(LT.game, 0);
var meet = nestR.filter(function (r) { return r && r.title === "Helena" && !r.disabled; })[0];
assert(meet && meet.nextDialogue === "helena.mainQuest", "Daytime Helena is available on 1-E");

var intro = LT.parseFromXML("places/dominion/harpyNests/helena", "HELENAS_NEST_MAIN_QUEST");
assert(intro.indexOf("white wooden throne") >= 0 || intro.indexOf("Helena") >= 0, "Helena intro present");
assert(intro.indexOf("[helena.") < 0 && intro.indexOf("[pc.") < 0, "Helena intro parsed");
assert(intro.indexOf("blue") >= 0, "Helena eye colour parsed");

var woe = LT.parseFromXML("places/dominion/harpyNests/helena", "HELENAS_NEST_MAIN_QUEST_SCARLETT");
assert(woe.indexOf("Electra") >= 0, "Helena leaves Electra in charge");

var choice = LT.getNode("helena.scarlettWoe").getResponses(LT.game, 0);
assert(choice[1] && choice[1].title === "No punishment", "No punishment is slot 1");
assert(choice[2] && choice[2].title === "Take punishment", "Take punishment is slot 2");
choice[1].effects();
assert(LT.game.flags.quest === "MAIN_1_F_SCARLETTS_FATE", "No punishment advances to MAIN_1_F");

var later = LT.getNode("place.HARPY_NESTS_HELENAS_NEST").getResponses(LT.game, 0);
var gone = later.filter(function (r) { return r && r.title === "Helena"; })[0];
assert(gone && gone.disabled, "After 1-F Helena has left the nest");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll 1-E smoke checks passed.");
