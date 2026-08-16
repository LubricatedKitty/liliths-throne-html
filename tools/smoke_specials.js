/* node "Liliths Throne HTML/tools/smoke_specials.js" */
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
  "js/engine/utilText.js",
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/spells.js",
  "js/combat/status.js",
  "js/combat/damage.js",
  "js/combat/weaponSpecials.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
].forEach(load);

var LT = context.LT;
var player = LT.createNewPlayer();
player.setName("Alex", "Alex", "Alex");
LT.game.player = player;
LT.refreshVitals(player, true);

assert(LT.WEAPON_SPECIALS.MKAR_MAG_DUMP.bulletDamage === 21000, "MKAR mag dump is official 21000 per bullet");
assert(LT.WEAPON_SPECIALS.BR14_MAG_DUMP.bulletDamage === 26000, "BR14 mag dump is official 26000 per bullet");
assert(LT.WEAPON_SPECIALS.FAUXMAS_MAG_DUMP.bulletDamage === 18000, "FAUXMAS mag dump is official 18000 per bullet");
assert(LT.MOVES.MKAR_MAG_DUMP.ap === 2 && LT.MOVES.MKAR_MAG_DUMP.cooldown === 2, "Mag dump is official 2 AP / 2 cooldown");
assert(LT.availableSpecials(player).length === 0, "No specials without a rifle equipped");

var dummy = {
  name: "Brax",
  health: 10000000,
  maxHealth: 10000000,
  lust: 10,
  level: 10,
  physique: 20,
  getName: function () { return "Brax"; },
  isFeminine: function () { return false; },
};

player.mainWeapon = LT.makeWeapon("innoxia_gun_mkar");
assert(LT.availableSpecials(player)[0] === "MKAR_MAG_DUMP", "Equipped MKAR unlocks MKAR mag dump");

LT.combat.start({
  enemy: dummy,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
});
dummy.health = 10000000;
dummy.maxHealth = 10000000;

var fight = LT.getNode("combat.fight");
var specials = fight.getResponses(LT.game, 2);
var specialBy = {};
specials.forEach(function (r) { if (r) specialBy[r.title] = r; });
assert(specialBy["Mag dump"] && !specialBy["Mag dump"].disabled, "Specials tab lists Mag dump when MKAR is equipped");

assert(!LT.combat.canQueue("MKAR_MAG_DUMP"), "Mag dump is queueable at 3 AP");
LT.combat.queue("MKAR_MAG_DUMP");
assert(player.remainingAP === 1, "Mag dump spends 2 AP");
assert(LT.getMoveCooldown(player, "MKAR_MAG_DUMP") === 2, "Queueing mag dump starts the official 2-turn cooldown");
assert(LT.combat.canQueue("MKAR_MAG_DUMP"), "Mag dump cannot be queued again while on cooldown");

LT.combat.enemy.selectedMoves = [];
var hp0 = dummy.health;
LT.combat.endTurn();
var dealt = hp0 - dummy.health;
assert(dealt >= 18 * 21000 && dealt <= 25 * 21000, "MKAR mag dump deals official 18–25×21000 (" + dealt + ")");
assert(LT.combat.lastResolution.indexOf("[npc.") < 0, "Mag dump flavour is parsed");
assert(LT.combat.lastResolution.indexOf("hail of bullets") >= 0, "MKAR mag dump uses official full-auto flavour");
assert(LT.combat.lastResolution.indexOf("Brax is hit by") >= 0, "Mag dump names the target with NameIsFull");
assert(LT.getMoveCooldown(player, "MKAR_MAG_DUMP") === 1, "Cooldown ticks to 1 after the use turn");
assert(LT.combat.canQueue("MKAR_MAG_DUMP"), "Mag dump stays blocked on the following turn");

LT.combat.player.selectedMoves = [];
LT.combat.enemy.selectedMoves = [];
LT.combat.endTurn();
assert(LT.getMoveCooldown(player, "MKAR_MAG_DUMP") === 0, "Cooldown expires after 2 ticks");
assert(!LT.combat.canQueue("MKAR_MAG_DUMP"), "Mag dump is usable again after cooldown");

player.mainWeapon = LT.makeWeapon("innoxia_gun_br14");
LT.combat.start({
  enemy: dummy,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
});
dummy.health = 10000000;
dummy.maxHealth = 10000000;
hp0 = dummy.health;
LT.MOVES.BR14_MAG_DUMP.perform(player, dummy);
dealt = hp0 - dummy.health;
assert(dealt >= 3 * 26000 && dealt <= 15 * 26000, "BR14 mag dump deals official 3–15×26000 (" + dealt + ")");

player.mainWeapon = LT.makeWeapon("innoxia_gun_famase");
hp0 = dummy.health;
var faux = LT.MOVES.FAUXMAS_MAG_DUMP.perform(player, dummy);
dealt = hp0 - dummy.health;
assert(dealt >= 13 * 18000 && dealt <= 20 * 18000, "FAUXMAS mag dump deals official 13–20×18000 (" + dealt + ")");
assert(faux.indexOf("into fully automatic") >= 0, "FAUXMAS uses official fire-selector flavour");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll weapon-special smoke checks passed.");
