/* node "Liliths Throne HTML/tools/smoke_zaranix.js" */
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
var store = {};
var context = {
  console: console,
  window: null,
  document: document,
  localStorage: {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
  },
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
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/player.js",
  "js/character/npcs.js",
  "js/character/slavery.js",
  "js/engine/game.js",
  "js/engine/properties.js",
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/engine/utilText.js",
  "js/text/lab.js",
  "js/text/arthursRoom.js",
  "js/text/apartment.js",
  "js/text/zaranixGround.js",
  "js/text/zaranixFirst.js",
  "js/maps/allGrids.js",
  "js/content/world.js",
  "js/content/house.js",
  "js/content/lab.js",
  "js/content/demonHome.js",
  "js/content/zaranix.js",
  "js/content/zaranixInterior.js",
].forEach(load);

var LT = context.LT;
var lastWorld = null;
LT.enterWorld = function (grid, place, coords) {
  lastWorld = { grid: grid, place: place, coords: coords || null };
  if (LT.game.player) {
    LT.game.player.location = { world: grid, place: place, x: coords && coords.x, y: coords && coords.y };
  }
  return { location: { placeType: place } };
};

LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.location = { world: "DOMINION", place: "DOMINION_DEMON_HOME_ZARANIX", x: 19, y: 0 };
LT.game.flags.quest = "MAIN_1_H_THE_GREAT_ESCAPE";
LT.game.secondsPassed = 11 * 3600;
LT.generateZaranixTile();

var gf = function (tag) { return LT.parseFromXML("places/dominion/zaranixHome/groundFloor", tag); };
var ff = function (tag) { return LT.parseFromXML("places/dominion/zaranixHome/firstFloor", tag); };

assert(gf("GARDEN").indexOf("plant") >= 0 || gf("GARDEN").indexOf("garden") >= 0, "Garden XML is present");
assert(gf("GARDEN").indexOf("#IF") < 0, "Garden conditionals resolve");
assert(ff("ZARANIX_ROOM").indexOf("lab") >= 0 || ff("ZARANIX_ROOM").indexOf("Zaranix") >= 0, "First-floor lab XML is present");
assert(ff("CORRIDOR_MAID_KELLY_ENCOUNTER").toLowerCase().indexOf("maid") >= 0, "Kelly encounter XML is present");

var outR = LT.getNode("zaranix.outside").getResponses(LT.game, 0);
var climb = outR.filter(function (r) { return r && r.title === "Climb fence"; })[0];
var kickWeak = outR.filter(function (r) { return r && r.title === "Kick down door"; })[0];
assert(climb && !climb.disabled && climb.nextDialogue === "place.ZARANIX_GF_GARDEN_ENTRY", "Daytime climb fence enters the garden");
assert(kickWeak && kickWeak.disabled, "Kick requires 35 physique");

LT.game.player.physique = 35;
outR = LT.getNode("zaranix.outside").getResponses(LT.game, 0);
var kick = outR.filter(function (r) { return r && r.title === "Kick down door" && !r.disabled; })[0];
assert(kick && kick.nextDialogue === "zaranix.kick", "35 physique can kick the door");
kick.effects();
assert(lastWorld && lastWorld.grid === "ZARANIX_HOUSE_GROUND_FLOOR", "Kick enters the ground floor");
assert(LT.game.npcs.katherine && LT.game.npcs.kelly && LT.game.npcs.zaranix, "House NPCs are created on entry");

var garden = LT.getNode("place.ZARANIX_GF_GARDEN_ENTRY").getContent();
assert(garden && garden.indexOf("#IF") < 0, "Garden entry parses");

var maidR = LT.getNode("place.ZARANIX_GF_MAID").getResponses(LT.game, 0);
var kFight = maidR.filter(function (r) { return r && r.title === "Fight"; })[0];
assert(kFight && kFight.nextDialogue === "combat.fight", "Katherine tile offers a fight");

var kellyR = LT.getNode("place.ZARANIX_FF_MAID").getResponses(LT.game, 0);
var kellyFight = kellyR.filter(function (r) { return r && r.title === "Fight"; })[0];
assert(kellyFight && kellyFight.nextDialogue === "combat.fight", "Kelly tile offers a fight");

var stairsUp = LT.getNode("place.ZARANIX_GF_STAIRS").getResponses(LT.game, 0);
assert(stairsUp.filter(function (r) { return r && r.title === "Upstairs"; }).length === 1, "Ground stairs offer Upstairs");
var stairsDown = LT.getNode("place.ZARANIX_FF_STAIRS").getResponses(LT.game, 0);
assert(stairsDown.filter(function (r) { return r && r.title === "Downstairs"; }).length === 1, "First-floor stairs offer Downstairs");

var labR = LT.getNode("zaranix.labEntry").getResponses(LT.game, 0);
var explain = labR.filter(function (r) { return r && r.title === "Explain everything"; })[0];
var demand = labR.filter(function (r) { return r && r.title === "Demand Arthur"; })[0];
assert(explain && demand, "Zaranix lab offers Demand and Explain");
explain.effects();
assert(LT.game.flags.quest === "MAIN_1_I_ARTHURS_TALE", "Explaining to Zaranix advances 1-H to 1-I");
assert(LT.game.npcs.arthur && LT.game.npcs.arthur.location.place === "LILAYA_HOME_LAB", "Arthur is sent to Lilaya's lab");

var entry = LT.getNode("lab.entry");
var arthurHtml = entry.getContent();
assert(arthurHtml.indexOf("Arthur") >= 0, "Lab entry during 1-I uses Arthur's return text");
assert(arthurHtml.indexOf("#IF") < 0, "Arthur lab entry conditionals resolve");
var agree = entry.getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Agree"; })[0];
assert(agree && agree.nextDialogue === "lab.arthurTale", "1-I lab entry only offers Agree");

var tale = LT.getNode("lab.arthurTale").getContent();
assert(tale.indexOf("Arthur") >= 0 && tale.indexOf("#IF") < 0, "Arthur's tale XML parses");
var clear = LT.getNode("lab.arthurTale").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Clear storeroom"; })[0];
assert(clear && clear.nextDialogue === "lab.arthurInstall", "Tale offers Clear storeroom");
clear.effects();
assert(LT.countUpgrade("ARTHUR_ROOM") === 1, "Clear storeroom installs Arthur's unique room");
assert(LT.game.npcs.arthur.location.place === "LILAYA_HOME_ARTHUR_ROOM", "Arthur moves into his room");

var install = LT.getNode("lab.arthurInstall").getContent();
assert(install.indexOf("Arthur") >= 0 && install.indexOf("#IF") < 0, "Installation XML parses");
var lys = LT.getNode("lab.arthurInstall").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Find Lyssieth"; })[0];
assert(lys && lys.nextDialogue === "lab.arthurLyssieth", "Installation offers Find Lyssieth");
lys.effects();
assert(LT.game.flags.quest === "MAIN_2_A_INTO_THE_DEPTHS", "Find Lyssieth advances to 2-A");

LT.game.flags.quest = "MAIN_1_H_THE_GREAT_ESCAPE";
LT.game.flags.zaranixKnockedOnDoor = true;
LT.game.flags.amberDoorKnockRepeatCount = 0;
LT.game.flags.zaranixKickedDownDoor = false;
LT.game.flags.zaranixMaidsHostile = false;
var beg = LT.getNode("zaranix.beg");
assert(beg.getContent().indexOf("#IF") < 0, "Beg XML parses");
var eager = beg.getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Eager lick"; })[0];
assert(eager && eager.nextDialogue === "zaranix.begEager", "Default foot content offers Eager lick");
LT.setProperty("footContent", false);
var doggy = LT.getNode("zaranix.beg").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Good doggy"; })[0];
assert(doggy && doggy.nextDialogue === "zaranix.begDoggy", "Foot-off beg offers Good doggy");

LT.game.flags.quest = "MAIN_1_H_THE_GREAT_ESCAPE";
LT.getNode("zaranix.holdBack").getResponses(LT.game, 0)[1].effects();
assert(LT.game.flags.quest === "MAIN_1_I_ARTHURS_TALE", "Lounge Arthur advances 1-I");
assert(LT.game.npcs.arthur.location.place === "ZARANIX_GF_LOUNGE", "Arthur stays in the lounge until you leave");
LT.getNode("zaranix.meetArthur").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Leave"; })[0].effects();
assert(LT.game.npcs.arthur.location.place === "LILAYA_HOME_LAB", "Leaving the lounge sends Arthur to the lab");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Zaranix interior smoke checks passed.");
