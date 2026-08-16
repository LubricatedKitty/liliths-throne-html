/* Headless smoke of lab + house NPCs + UtilText. Run from repo root:
   node "Liliths Throne HTML/tools/smoke_lab.js" */
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
  var code = fs.readFileSync(file, "utf8");
  vm.runInNewContext(code, context, { filename: file });
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
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/text/lab.js",
  "js/content/world.js",
  "js/content/lab.js",
].forEach(load);

var LT = context.LT;

context.LT.game.player = {
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
  location: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB", x: 2, y: 9 },
};

LT.game.secondsPassed = 10 * 3600;
LT.game.flags.quest = "MAIN_1_A_LILAYAS_TESTS";
LT.game.renderMap = true;
LT.ensureHouseNpcs();

assert(LT.game.npcs.lilaya.relationToPlayer === "aunt", "Lilaya relation is aunt");
assert(LT.game.npcs.lilaya.speechColour === "#ff66a3", "Lilaya speech colour");
assert(LT.game.npcs.rose.raceName === "cat-girl", "Rose race");
assert(LT.game.npcs.lilaya.location.place === "LILAYA_HOME_LAB", "Day: Lilaya in lab");
assert(LT.game.npcs.rose.location.place === "LILAYA_HOME_LAB", "Day: Rose in lab");
assert(LT.isWorkTime() === true, "10:00 is work time");

var present = LT.npcAtCurrentTile();
assert(present.length === 2, "Both NPCs present on lab tile by day (" + present.length + ")");

LT.game.secondsPassed = 23 * 3600;
LT.updateHouseNpcLocations();
assert(LT.isWorkTime() === false, "23:00 is not work time");
assert(LT.game.npcs.lilaya.location.place === "LILAYA_HOME_ROOM_ROSE", "Night: Lilaya in Rose's room");
assert(LT.game.npcs.rose.location.world === "LILAYAS_HOUSE_FIRST_FLOOR", "Night: Rose upstairs");

LT.game.secondsPassed = 10 * 3600;
LT.updateHouseNpcLocations();

var door = LT.parseFromXML("places/dominion/lilayasHome/lab", "LAB");
assert(door.indexOf("wide") >= 0 && door.indexOf("open") >= 0, "Day lab door text is open");
assert(door.indexOf("[lilaya.") < 0 && door.indexOf("[style.") < 0, "Day LAB has no leftover tags");

LT.game.secondsPassed = 23 * 3600;
LT.updateHouseNpcLocations();
var shut = LT.parseFromXML("places/dominion/lilayasHome/lab", "LAB");
assert(shut.indexOf("closed") >= 0, "Night lab door text is closed");
LT.game.secondsPassed = 10 * 3600;
LT.updateHouseNpcLocations();

var entry = LT.parseFromXML("places/dominion/lilayasHome/lab", "LAB_ENTRY_BASE") +
  LT.parseFromXML("places/dominion/lilayasHome/lab", "LAB_ENTRY_NAUGHTY_ROSE") +
  LT.parseFromXML("places/dominion/lilayasHome/lab", "LAB_ENTRY_BASE_END");
assert(entry.indexOf("aunt") >= 0, "Entry uses [lilaya.relation] -> aunt");
assert(entry.indexOf("Alex") >= 0, "Entry uses player name");
assert(entry.indexOf("experiment") >= 0, "Entry includes experiment line");
assert(entry.indexOf("what is it you need") >= 0, "First-play pregnancy else-branch kept");
assert(entry.indexOf("got me pregnant") < 0 && entry.indexOf("[daddy.") < 0, "Pregnancy/daddy branch does not leak");
assert(entry.indexOf("[") < 0 || /\[(?!style)/.test(entry) === false || entry.indexOf("[lilaya.") < 0, "Entry parsed commands");
if (entry.indexOf("[lilaya.") >= 0 || entry.indexOf("[rose.") >= 0 || entry.indexOf("[pc.") >= 0) {
  fail("Unparsed commands remain in entry:\n" + entry.slice(0, 400));
} else {
  ok("Entry speech/commands parsed");
}

var testing = LT.parseFromXML("places/dominion/lilayasHome/lab", "AUNT_HOME_LABORATORY_TESTING");
assert(testing.indexOf("arcane aura") >= 0, "Testing text includes aura explanation");
assert(testing.indexOf("[pc.") < 0 && testing.indexOf("[lilaya.") < 0, "Testing commands parsed");

var arthur = LT.parseFromXML("places/dominion/lilayasHome/lab", "AUNT_HOME_LABORATORY_TESTING_ARTHUR");
assert(arthur.indexOf("Sawlty Towers") >= 0, "Arthur text names Sawlty Towers");
assert(arthur.indexOf("Demon Home") >= 0, "Arthur text names Demon Home");

var declined = LT.parseFromXML("places/dominion/lilayasHome/lab", "AUNT_HOME_LABORATORY_TESTING_ARTHUR_DECLINED");
assert(declined.indexOf("change your mind") >= 0, "Decline text present");

var doorNode = LT.getNode("place.LILAYA_HOME_LAB");
var dayDoor = doorNode.getResponses(LT.game, 0);
var enter = dayDoor.filter(function (r) {
  return r && r.title === "Enter" && !r.disabled;
});
assert(enter.length === 1 && enter[0].nextDialogue === "lab.entry", "Day door offers Enter -> lab.entry");

LT.game.secondsPassed = 23 * 3600;
LT.updateHouseNpcLocations();
var nightDoor = doorNode.getResponses(LT.game, 0);
var nightEnter = nightDoor.filter(function (r) {
  return r && r.title === "Enter";
});
assert(nightEnter.length === 1 && nightEnter[0].disabled, "Night door Enter is disabled");
LT.game.secondsPassed = 10 * 3600;
LT.updateHouseNpcLocations();

var inside = LT.getNode("lab.entry").getResponses(LT.game, 0);
assert(inside[0] && inside[0].title === "Leave", "Leave is slot 0");
var tests = inside.filter(function (r) {
  return r && r.title === "Tests";
})[0];
assert(tests && tests.nextDialogue === "lab.testing", "Tests leads to lab.testing");

var returning = LT.getNode("lab.testing").getResponses(LT.game, 0);
assert(returning[1] && returning[1].title === "Returning home", "Returning home is slot 1");

LT.getNode("lab.arthur").applyPreParsingEffects();
assert(LT.game.flags.quest === "MAIN_1_B_DEMON_HOME", "Arthur talk advances quest to MAIN_1_B");

var after = LT.getNode("lab.arthur").getResponses(LT.game, 0);
assert(after[1] && after[1].title === "'Tests'" && after[1].nextDialogue === "lab.hornyLilaya", "'Tests' continues into official horny-Lilaya");
assert(after[2] && after[2].title === "Decline" && after[2].nextDialogue === "lab.inside", "Decline returns to lab.inside");

var later = LT.getNode("lab.entry").getResponses(LT.game, 0);
var laterTests = later.filter(function (r) {
  return r && (r.title === "Tests" || r.title === "\"Tests\"");
})[0];
assert(laterTests && laterTests.nextDialogue === "lab.testingRepeat", "After the first tests, more Tests go to the repeat scene");

var letIt = LT.getNode("lab.wantsSex").getResponses(LT.game, 0);
assert(letIt[1] && letIt[1].nextDialogue === "sex.scene", "Let it happen starts the sex kernel");

assert(LT.getNode("lab.entry").travelDisabled === true, "lab.entry blocks travel");
assert(LT.getNode("place.LILAYA_HOME_LAB").travelDisabled == null, "Lab door allows travel");

LT.game.npcs.lilaya = { name: "Lilaya", feminine: true, isFeminine: function () { return true; }, getName: function () { return "Lilaya"; } };
LT.ensureHouseNpcs();
assert(LT.game.npcs.lilaya.relationToPlayer === "aunt", "ensureHouseNpcs upgrades prologue stub Lilaya");
assert(LT.game.npcs.lilaya.getSpeechColour() === "#ff66a3", "upgraded Lilaya has speech colour");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll lab smoke checks passed.");
