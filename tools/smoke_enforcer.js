/* node "Liliths Throne HTML/tools/smoke_enforcer.js" */
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
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/engine/utilText.js",
  "js/text/lab.js",
  "js/text/apartment.js",
  "js/text/enforcerGeneric.js",
  "js/text/enforcerBrax.js",
  "js/content/world.js",
  "js/content/lab.js",
  "js/content/demonHome.js",
  "js/content/enforcerHQ.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  getName: function () { return "Alex"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "ENFORCER_HQ", place: "ENFORCER_HQ_RECEPTION_DESK", x: 0, y: 6 },
};
LT.game.flags.quest = "MAIN_1_C_WOLFS_DEN";
LT.game.secondsPassed = 11 * 3600;

LT.ensureBrax();
LT.ensureCandi();
assert(LT.isOfficeHours() === true, "11:00 is office hours");
assert(LT.game.npcs.candi.location && LT.game.npcs.candi.location.place === "ENFORCER_HQ_RECEPTION_DESK", "Candi at desk");

var exterior = LT.parseFromXML("places/dominion/enforcerHQ/generic", "EXTERIOR");
assert(exterior.indexOf("Enforcer Headquarters") >= 0, "Exterior names the HQ");
assert(exterior.indexOf("[units.") < 0, "units.time parsed");

var desk = LT.parseFromXML("places/dominion/enforcerHQ/generic", "RECEPTION_DESK");
assert(desk.indexOf("Candi") >= 0 && desk.indexOf("makeup") >= 0, "First-visit Candi desk text");
assert(desk.indexOf("leash") < 0, "Post-quest Candi pet branch does not leak");

var rec = LT.getNode("place.ENFORCER_HQ_RECEPTION_DESK").getResponses(LT.game, 0);
var greet = rec.filter(function (r) { return r && r.title === "Greet Candi"; })[0];
assert(!!greet && greet.nextDialogue === "enforcer.candi", "Greet Candi during 1-C");

var candiR = LT.getNode("enforcer.candi").getResponses(LT.game, 0);
assert(candiR[1] && candiR[1].title === "Brax", "Ask for Brax is slot 1");
candiR[1].effects();
assert(LT.game.flags.accessToEnforcerHQ === true, "Pass granted");

var pub = { location: { placeType: "ENFORCER_HQ_WAITING_AREA" } };
var office = { location: { placeType: "ENFORCER_HQ_BRAXS_OFFICE" } };
context.grid = { gridName: "ENFORCER_HQ" };
assert(LT.canEnterTile(office) === true, "Pass allows interior");
LT.game.flags.accessToEnforcerHQ = false;
assert(LT.canEnterTile(office) === false, "No pass blocks Brax's office");
assert(LT.canEnterTile(pub) === true, "Waiting area always public");
var staff = { location: { placeType: "ENFORCER_HQ_ENFORCER_ENTRANCE" } };
assert(LT.canEnterTile(staff) === false, "Staff entrance is not public without a pass");
LT.game.flags.accessToEnforcerHQ = true;

var lie = LT.parseFromXML("places/dominion/enforcerHQ/brax", "INTERIOR_BRAX_LIE");
assert(lie.indexOf("She-wolf") >= 0 || lie.indexOf("wolf") >= 0 || lie.indexOf("Brax") >= 0, "Lie scene parses");
assert(lie.indexOf("[brax.") < 0 && lie.indexOf("[pc.") < 0, "Lie commands parsed");

var bluffR = LT.getNode("enforcer.braxBluff").getResponses(LT.game, 0);
assert(bluffR[1] && bluffR[1].title === "Let him go", "Let him go is the dialogue win");
bluffR[1].effects();
assert(LT.game.flags.quest === "MAIN_1_D_SLAVERY", "Quest advances to MAIN_1_D");

var truthR = LT.getNode("enforcer.braxTruth").getResponses(LT.game, 0);
assert(truthR[1] && !truthR[1].disabled && truthR[1].nextDialogue === "combat.fight", "Truth Fight starts combat");
var braxR = LT.getNode("enforcer.brax").getResponses(LT.game, 0);
assert(braxR[3] && braxR[3].disabled, "Wolf-tease is stubbed");

var winR = LT.getNode("enforcer.braxVictory").getResponses(LT.game, 0);
assert(winR[2] && winR[2].title === "Dominate Brax" && winR[2].nextDialogue === "sex.scene", "Dominate Brax starts the sex kernel");
assert(winR[3] && winR[3].title === "Submit to Brax" && winR[3].nextDialogue === "sex.scene", "Submit to Brax starts the sex kernel");
var spitR = LT.getNode("enforcer.braxDefeatSpit").getResponses(LT.game, 0);
assert(spitR[1] && spitR[1].title === "Dominated" && spitR[1].nextDialogue === "sex.scene", "Spit then Dominated starts the sex kernel");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll 1-C smoke checks passed.");
