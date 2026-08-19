/* node "Liliths Throne HTML/tools/smoke_amber.js" */
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
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/player.js",
  "js/character/npcs.js",
  "js/engine/game.js",
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/engine/utilText.js",
  "js/text/apartment.js",
  "js/text/zaranixGround.js",
  "js/maps/allGrids.js",
  "js/content/world.js",
  "js/content/demonHome.js",
  "js/content/zaranix.js",
  "js/content/zaranixInterior.js",
].forEach(load);

var LT = context.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.location = { world: "DOMINION", place: "DOMINION_DEMON_HOME_ZARANIX", x: 19, y: 0 };
LT.game.flags.quest = "MAIN_1_H_THE_GREAT_ESCAPE";
LT.game.secondsPassed = 11 * 3600;
LT.generateZaranixTile();
LT.ensureAmber();
LT.ensureKatherine();

LT.enterWorld = function (grid, place) {
  if (LT.game.player) LT.game.player.location = { world: grid, place: place };
};
var street = LT.getNode("place.DOMINION_DEMON_HOME_ZARANIX").getResponses(LT.game, 0);
var home = street.filter(function (r) { return r && r.title === "Zaranix's Home"; })[0];
assert(home && home.nextDialogue === "zaranix.outside", "Street offers Zaranix's Home");

var outside = LT.parseFromXML("places/dominion/zaranixHome/groundFloor", "OUTSIDE");
assert(outside.indexOf("Zaranix") >= 0, "Outside names Zaranix");
assert(outside.indexOf("[units.size") < 0, "Fence height parsed");
assert(outside.indexOf("#IF") < 0, "Outside conditionals resolved");
assert(outside.indexOf("knock on the door") >= 0, "Daytime knock is mentioned");

var outR = LT.getNode("zaranix.outside").getResponses(LT.game, 0);
var knock = outR.filter(function (r) { return r && r.title === "Knock door" && !r.disabled; })[0];
var climb = outR.filter(function (r) { return r && r.title === "Climb fence"; })[0];
var kick = outR.filter(function (r) { return r && r.title === "Kick down door" && !r.disabled; })[0];
assert(knock && knock.nextDialogue === "zaranix.knock", "Daytime knock is available");
assert(climb && !climb.disabled && climb.nextDialogue === "place.ZARANIX_GF_GARDEN_ENTRY", "Climb fence enters the garden");
LT.game.player.physique = 35;
outR = LT.getNode("zaranix.outside").getResponses(LT.game, 0);
kick = outR.filter(function (r) { return r && r.title === "Kick down door" && !r.disabled; })[0];
assert(kick && kick.nextDialogue === "zaranix.kick", "Kick down door is the combat entrance");

knock.effects();
assert(LT.game.flags.zaranixDiscoveredHome, "Knock discovers the house");
assert(LT.game.flags.amberDoorKnockRepeatCount === 1, "Knock increments Amber's door count");
assert(LT.game.npcs.amber.location && LT.game.npcs.amber.location.place === "DOMINION_DEMON_HOME_ZARANIX", "Amber answers on the street tile");

var knockText = LT.parseFromXML("places/dominion/zaranixHome/groundFloor", "KNOCK_ON_DOOR");
assert(knockText.indexOf("amber") >= 0 || knockText.indexOf("Amber") >= 0 || knockText.indexOf("succub") >= 0 || knockText.indexOf("maid") >= 0, "Knock introduces the maid");
assert(knockText.indexOf("[amber.") < 0, "Amber speech parsed");

var knockR = LT.getNode("zaranix.knock").getResponses(LT.game, 0);
var arthur = knockR.filter(function (r) { return r && r.title === "Arthur"; })[0];
assert(arthur && arthur.nextDialogue === "zaranix.askArthur", "First knock can ask for Arthur");

var ask = LT.parseFromXML("places/dominion/zaranixHome/groundFloor", "KNOCK_ON_DOOR_ASK_FOR_ARTHUR");
assert(ask.indexOf("Arthur") >= 0, "She hears Arthur's name");
assert(ask.indexOf("[amber.") < 0, "Arthur ask parsed");

kick.effects();
assert(LT.game.flags.zaranixKickedDownDoor, "Kick sets the kicked-door flag");
assert(LT.game.flags.zaranixMaidsHostile, "Kick makes the maids hostile");
assert(LT.game.npcs.amber.playerKnowsName, "Kick teaches Amber's name");

var kickText = LT.parseFromXML("places/dominion/zaranixHome/groundFloor", "ENTRANCE_KICK_DOWN_DOOR");
assert(kickText.indexOf("Katherine") >= 0, "Katherine shouts from the corridor");
assert(kickText.indexOf("[katherine.") < 0 && kickText.indexOf("[amber.") < 0, "Kick-in speech parsed");

var kickR = LT.getNode("zaranix.kick").getResponses(LT.game, 0);
var fight = kickR.filter(function (r) { return r && r.title === "Fight"; })[0];
assert(fight && fight.nextDialogue === "combat.fight", "Kick Fight starts the combat loop");
fight.effects();
assert(LT.combat.active && LT.combat.enemy && LT.combat.enemy.id === "amber", "The enemy is Amber");
assert(LT.combat.escapeChance === 0, "Amber fight cannot be escaped");

LT.combat.finished = "victory";
var winR = LT.getNode("zaranix.amberVictory").getResponses(LT.game, 0);
var winContinue = winR.filter(function (r) { return r && r.title === "Continue"; })[0];
var useAmber = winR.filter(function (r) { return r && r.title === "Use Amber"; })[0];
var submitAmber = winR.filter(function (r) { return r && r.title === "Submit"; })[0];
assert(winContinue && winContinue.nextDialogue === "place.ZARANIX_GF_ENTRANCE", "Victory Continue enters the house");
assert(useAmber && useAmber.nextDialogue === "sex.scene", "Use Amber starts the sex kernel");
assert(submitAmber && submitAmber.nextDialogue === "sex.scene", "Submit starts the sex kernel");
var loseR = LT.getNode("zaranix.amberDefeat").getResponses(LT.game, 0);
assert(loseR[1] && loseR[1].title === "Used" && loseR[1].nextDialogue === "sex.scene", "Defeat Used starts the sex kernel");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Amber door smoke checks passed.");
