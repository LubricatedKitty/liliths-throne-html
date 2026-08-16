/* Headless smoke of 1-B Demon Home / Sawlty Towers / Felicia.
   node "Liliths Throne HTML/tools/smoke_arthur.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.resolve(__dirname, "..");
var fails = [];

function fail(msg) {
  fails.push(msg);
  console.error("FAIL:", msg);
}
function ok(msg) {
  console.log("OK  ", msg);
}
function assert(cond, msg) {
  if (cond) ok(msg);
  else fail(msg);
}

var listeners = {};
var document = {
  getElementById: function () {
    return null;
  },
  querySelector: function () {
    return null;
  },
  querySelectorAll: function () {
    return [];
  },
  createElement: function () {
    return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
  },
  addEventListener: function (type, fn) {
    (listeners[type] = listeners[type] || []).push(fn);
  },
  dispatchEvent: function (e) {
    var list = listeners[e.type] || [];
    for (var i = 0; i < list.length; i++) list[i](e);
  },
  head: { appendChild: function () {} },
  body: { appendChild: function () {} },
};

function CustomEvent(type, init) {
  this.type = type;
  this.detail = init && init.detail;
}

var context = {
  console: console,
  window: null,
  document: document,
  CustomEvent: CustomEvent,
  LT: { TEXT: {} },
};
context.window = context;
context.global = context;

function load(rel) {
  var file = path.join(root, rel);
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
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
  "js/content/world.js",
  "js/content/lab.js",
  "js/content/demonHome.js",
].forEach(load);

var LT = context.LT;
context.allGrids = {
  DOMINION: [
    { x: 18, y: 2, location: { name: "Lilith's Tower", placeType: "DOMINION_LILITHS_TOWER", passage: "place.DOMINION_LILITHS_TOWER" } },
    { x: 16, y: 1, location: { name: "Demon Home", placeType: "DOMINION_DEMON_HOME", passage: "place.DOMINION_DEMON_HOME", description: "generic" } },
    { x: 8, y: 12, location: { name: "Lilaya's Home", placeType: "DOMINION_AUNTS_HOME", passage: "place.DOMINION_AUNTS_HOME" } },
  ],
};
LT.places = {
  DOMINION_DEMON_HOME_ARTHUR: {
    description: "A large stone building ornately decorated in the Victorian style, it resembles a five-star hotel more than an apartment complex.",
  },
};

LT.game.player = {
  name: "Alex",
  names: { feminine: "Alex", masculine: "Alex", androgynous: "Alex" },
  feminine: true,
  getName: function () {
    return "Alex";
  },
  isFeminine: function () {
    return true;
  },
  hasPenis: function () {
    return false;
  },
  hasVagina: function () {
    return true;
  },
  getSpeechColour: function () {
    return "#ff66a3";
  },
  location: { world: "DOMINION", place: "DOMINION_DEMON_HOME_ARTHUR", x: 16, y: 1 },
};
LT.game.flags.quest = "MAIN_1_A_LILAYAS_TESTS";
LT.game.secondsPassed = 12 * 3600;

assert(!findArthur(), "Sawlty Towers is not on the map before 1-B");

LT.game.textEnd = LT.advanceMainQuest("MAIN_1_B_DEMON_HOME");
assert(LT.game.flags.quest === "MAIN_1_B_DEMON_HOME", "Quest is MAIN_1_B");
assert(LT.questReached("MAIN_1_B_DEMON_HOME"), "questReached 1-B");
var arthurTile = findArthur();
assert(!!arthurTile && arthurTile.x === 16 && arthurTile.y === 1, "Arthur tile at tower-2,-1 (16,1)");
assert(arthurTile.location.placeType === "DOMINION_DEMON_HOME_ARTHUR", "Tile place type is Sawlty Towers");

var lobby = LT.parseFromXML("places/dominion/arthursApartment/apartment", "DEMON_HOME_ARTHURS_APARTMENT");
assert(lobby.indexOf("room five") >= 0, "First-play lobby mentions room five");
assert(lobby.indexOf("Felicia") < 0, "First-play lobby does not mention Felicia by name");

var street = LT.getNode("place.DOMINION_DEMON_HOME_ARTHUR");
var streetR = street.getResponses(LT.game, 0);
var sawlty = streetR.filter(function (r) {
  return r && r.title === "Sawlty Towers";
})[0];
assert(sawlty && sawlty.nextDialogue === "demonHome.apartment", "Street offers Sawlty Towers");

var aptR = LT.getNode("demonHome.apartment").getResponses(LT.game, 0);
assert(aptR[0] && aptR[0].title === "Leave", "Lobby Leave is slot 0");
assert(aptR[1] && aptR[1].title === "Arthur's room" && aptR[1].nextDialogue === "demonHome.arthursRoom", "Lobby Arthur's room is slot 1");

aptR[1].effects();
assert(LT.game.flags.quest === "MAIN_1_C_WOLFS_DEN", "Entering Arthur's room advances to MAIN_1_C");
assert(LT.game.textEnd.indexOf("The Wolf's Den") >= 0, "Quest update names The Wolf's Den");

LT.getNode("demonHome.arthursRoom").applyPreParsingEffects();
var room = LT.parseFromXML("places/dominion/arthursApartment/apartment", "DEMON_HOME_ARTHURS_APARTMENT_ARTHURS_ROOM");
assert(room.indexOf("NOTICE OF ARREST") >= 0, "Arrest notice present");
assert(room.indexOf("Brax Volkov") >= 0, "Warrant names Brax Volkov");
assert(room.indexOf("157 centimetres") >= 0, "Felicia height parsed");
assert(room.indexOf("brown") >= 0, "Felicia eye colour parsed");
assert(room.indexOf("[felicia.") < 0 && room.indexOf("[brax.") < 0 && room.indexOf("[pc.") < 0, "Room commands parsed");
assert(LT.game.npcs.felicia.location && LT.game.npcs.felicia.location.place === "DOMINION_DEMON_HOME_ARTHUR", "Felicia is on the tile during the room scene");

var present = LT.npcAtCurrentTile().map(function (n) {
  return n.id;
});
assert(present.indexOf("felicia") >= 0, "Characters present includes Felicia");

LT.getNode("demonHome.arthursRoomEnd").applyPreParsingEffects();
var end = LT.parseFromXML("places/dominion/arthursApartment/apartment", "DEMON_HOME_ARTHURS_APARTMENT_ARTHURS_ROOM_END");
assert(end.indexOf("Felicia Delilah-Hope Renmorre") >= 0, "Felicia introduces her full name");
assert(end.indexOf("Enforcer") >= 0 && end.indexOf("plotting against Lilith") >= 0, "Felicia explains the arrest");
assert(LT.game.flags.knowsFelicia === true, "knowsFelicia flag set");

var later = LT.getNode("demonHome.apartment").getResponses(LT.game, 0);
assert(later[1] && later[1].disabled, "After 1-C, Arthur's room is disabled");
assert(later[2] && /Felicia/.test(later[2].title), "After 1-C, Felicia's room is offered");

LT.syncQuestWorld();
assert(findArthur() && findArthur().location.placeType === "DOMINION_DEMON_HOME_ARTHUR", "syncQuestWorld is idempotent");

function findArthur() {
  var tiles = context.allGrids.DOMINION;
  for (var i = 0; i < tiles.length; i++) {
    if (tiles[i].location && tiles[i].location.placeType === "DOMINION_DEMON_HOME_ARTHUR") return tiles[i];
  }
  return null;
}

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll 1-B smoke checks passed.");
