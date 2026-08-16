/* node "Liliths Throne HTML/tools/smoke_alleys.js" */
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
  "js/items/weapons.js",
  "js/items/weaponRuntime.js",
  "js/engine/game.js",
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/engine/utilText.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/text/dominionPlaces.js",
  "js/text/alleywayAttack.js",
  "js/text/prostitute.js",
  "js/content/world.js",
  "js/content/alleys.js",
].forEach(load);

var LT = context.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.money = 500;
LT.game.player.location = { world: "DOMINION", place: "DOMINION_BACK_ALLEYS", x: 1, y: 0 };

var empty = LT.parseFromXML("places/dominion/dominionPlaces", "BACK_ALLEYS");
assert(empty.indexOf("dangerous") >= 0, "Empty alley is marked dangerous");
assert(empty.indexOf("#IF") < 0 && empty.indexOf("[npc.") < 0, "Empty alley parsed");

var dark = LT.parseFromXML("places/dominion/dominionPlaces", "DARK_ALLEYS");
assert(dark.indexOf("very dangerous") >= 0, "Dark alley is marked very dangerous");

var mugger = LT.generateAlleyMugger({ feminine: true, race: { id: "cat-morph", fem: "cat-girl", masc: "cat-boy" }, level: 2 });
assert(mugger.getName() === "the cat-girl", "Unknown mugger is the cat-girl");
assert(mugger.level === 2, "Mugger level is applied");
assert(mugger.maxHealth === 10 + 10 + 2 * mugger.physique, "Mugger uses official HP");
assert(LT.alleyMuggerPresent(), "Mugger is present on this tile");
var allowed = {
  innoxia_pipe_pipe: true,
  innoxia_bat_wooden: true,
  innoxia_bat_metal: true,
  innoxia_knuckleDusters_knuckle_dusters: true,
};
if (mugger.mainWeapon) {
  assert(!!allowed[mugger.mainWeapon.id], "Back-alley mugger weapon is from the official outfit table");
}

var attack = LT.parseFromXML("encounters/dominion/alleywayAttack", "ALLEY_ATTACK");
assert(attack.indexOf("#VAR") < 0, "#VAR block is stripped");
assert(attack.indexOf("cat-girl") >= 0 || attack.indexOf("a cat-girl") >= 0, "Attack names a cat-girl");
assert(attack.indexOf("[npc.") < 0 && attack.indexOf("#IF") < 0, "Attack text parsed");

var alley = LT.getNode("place.DOMINION_BACK_ALLEYS");
var alleyR = alley.getResponses(LT.game, 0);
var explore = alleyR.filter(function (r) { return r && r.title === "Explore"; })[0];
assert(explore && !explore.disabled, "Dangerous alleys have Explore");

var safeR = LT.getNode("place.DOMINION_BACK_ALLEYS_SAFE").getResponses(LT.game, 0);
assert(!safeR.some(function (r) { return r && r.title === "Explore"; }), "Patrolled alleys have no Explore");

var attackR = LT.getNode("alley.attack").getResponses(LT.game, 0);
assert(LT.getNode("alley.attack").travelDisabled, "Assaulted! locks travel");
var fight = attackR.filter(function (r) { return r && r.title === "Fight"; })[0];
assert(fight && fight.nextDialogue === "combat.fight", "Alley Fight starts the combat loop");
var offer = attackR.filter(function (r) { return r && r.title === "Offer body"; })[0];
assert(!!offer, "Offer body is on the assault menu");
if (mugger.attractedToPlayer) {
  assert(offer.nextDialogue === "sex.scene" && !offer.disabled, "Attracted mugger accepts Offer body");
} else {
  assert(offer.disabled, "Unattracted mugger refuses Offer body");
}

var hooker = LT.generateAlleyMugger({ feminine: true, prostitute: true, race: { id: "wolf-morph", fem: "wolf-girl", masc: "wolf-boy" }, level: 2 });
assert(hooker.occupation === "prostitute", "Alley attacker can roll as a prostitute");
assert(hooker.playerKnowsName, "A prostitute introduces herself by name");
assert(LT.prostitutePrice(hooker) >= 150, "Official prostitute price is at least 150");
LT.addSpecialParse(String(LT.prostitutePrice(hooker)), true);
LT.addSpecialParse(String(LT.prostitutePrice(hooker) * 2), false);
var hookerText = LT.parseFromXML("encounters/dominion/prostitute", "ALLEY_PROSTITUTE");
assert(hookerText.indexOf("good time") >= 0 || hookerText.indexOf("prostitute") >= 0, "Prostitute greeting uses official text");
assert(hookerText.indexOf("[npc.") < 0 && hookerText.indexOf("#IF") < 0, "Prostitute greeting parsed");
var hookerR = LT.getNode("alley.prostitute").getResponses(LT.game, 0);
assert(hookerR.some(function (r) { return r && r.title === "Leave"; }), "Prostitute scene has Leave");
assert(hookerR.some(function (r) { return r && String(r.title).indexOf("Dominant") === 0; }), "Prostitute scene has Dominant sex");
assert(hookerR.some(function (r) { return r && String(r.title).indexOf("Submissive") === 0; }), "Prostitute scene has Submissive sex");

fight.effects();
assert(LT.combat.active && LT.combat.enemy === mugger, "Fight uses the generated mugger");

LT.combat.finished = "victory";
var win = LT.parseFromXML("encounters/dominion/alleywayAttack", "AFTER_COMBAT_VICTORY_NO_ATTRACTION");
assert(win.indexOf("money") >= 0, "Victory asks you to take the money");
assert(win.indexOf("[npc.") < 0, "Victory parsed");

var darkMugger = LT.generateAlleyMugger({ dark: true, feminine: false, race: { id: "demon", fem: "succubus", masc: "incubus" }, level: 4 });
assert(darkMugger.fullRace === "incubus", "Dark alley can spawn an incubus");
assert(darkMugger.level === 4, "Dark alley muggers are higher level");
if (darkMugger.mainWeapon) {
  assert(darkMugger.mainWeapon.id === "innoxia_crystal_rare", "Dark-alley demon below 8 uses a rare demonstone");
}

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll alley smoke checks passed.");
