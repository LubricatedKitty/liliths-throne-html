/* node "Liliths Throne HTML/tools/smoke_combat.js" */
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
  "js/combat/tease.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/engine/utilText.js",
  "js/text/enforcerBrax.js",
  "js/content/demonHome.js",
  "js/content/enforcerHQ.js",
].forEach(load);

var LT = context.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.flags.quest = "MAIN_1_C_WOLFS_DEN";
LT.ensureBrax();
LT.ensureArthur();
LT.ensureScarlett();
LT.game.npcs.brax.combatBehaviour = "ATTACK";

assert(LT.game.player.maxHealth === 35, "Level 1 official HP is 35");
assert(LT.game.player.maxMana === 57, "Level 1 official Aura is 57");
assert(LT.unarmedDamage(LT.game.player) === 4, "Level 1 unarmed is 2 + physique/5");
assert(LT.game.npcs.brax.level === 10, "Brax is level 10");
assert(LT.game.npcs.brax.maxHealth === 90, "Brax official-thin HP is 90");

var xp = LT.incrementExperience(10);
assert(LT.game.player.level === 2, "10 XP levels the player to 2");
assert(xp.indexOf("Level up") >= 0, "Level-up text is returned");
assert(LT.game.player.maxHealth === 40, "Level 2 HP is 40");

LT.combat.start({
  enemy: LT.game.npcs.brax,
  escapeChance: 0,
  victoryNode: "enforcer.braxVictory",
  defeatNode: "enforcer.braxDefeat",
});
assert(LT.combat.active, "Combat starts");
assert(LT.combat.player.remainingAP === 3, "Player starts with 3 AP");
assert(LT.combat.enemy.selectedMoves.length === 3, "ATTACK behaviour spends 3 AP");
assert(LT.combat.enemy.selectedMoves[0].id === "strike", "ATTACK behaviour leads with Strike");
assert(LT.combat.canQueue("strike") == null, "Strike is usable at 3 AP");

LT.combat.queue("strike");
LT.combat.queue("strike");
assert(LT.combat.player.remainingAP === 1, "Two Strikes spend 2 AP");
assert(LT.combat.predictions(LT.combat.player).length === 2, "Two predictions are queued");
var fightMenu = LT.getNode("combat.fight").getResponses(LT.game, 0);
var resetBtn = fightMenu.filter(function (r) { return r && r.title === "Reset"; })[0];
assert(resetBtn && resetBtn._index === 14, "Reset is official combat slot 14");
assert(!resetBtn.disabled, "Reset is available after moves are queued");
resetBtn.effects();
assert(LT.combat.player.selectedMoves.length === 0, "Reset clears queued moves");
assert(LT.combat.player.remainingAP === 3, "Reset refunds AP for this turn");
var emptyReset = LT.getNode("combat.fight").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Reset"; })[0];
assert(emptyReset && emptyReset.disabled, "Reset is disabled when no moves are queued");
LT.combat.queue("strike");
LT.combat.queue("strike");
assert(LT.combat.player.remainingAP === 1, "Moves can be queued again after Reset");

var hpBefore = LT.combat.enemy.health;
LT.combat.endTurn();
assert(LT.combat.enemy.health < hpBefore, "Queued Strikes deal damage");
assert(LT.combat.turn === 1, "End Turn increments the turn");
assert(LT.combat.player.remainingAP === 3, "AP resets after the turn");

LT.combat.queue("block");
var playerHp = LT.combat.player.health;
var raw = LT.rollUnarmed(LT.combat.enemy);
LT.combat.enemy.selectedMoves = [{ id: "strike", target: LT.combat.player }];
LT.combat.player.blocking = true;
var blocked = Math.max(1, Math.round(raw * 0.5));
assert(blocked <= raw, "Block halves incoming Strike damage");
LT.combat.player.blocking = false;

LT.combat.start({
  enemy: LT.game.npcs.brax,
  escapeChance: 0,
  victoryNode: "enforcer.braxVictory",
  defeatNode: "enforcer.braxDefeat",
});
LT.combat.enemy.health = 1;
LT.combat.queue("strike");
LT.combat.endTurn();
assert(LT.combat.finished === "victory", "Enemy at 1 HP falls to a Strike");

var fightNode = LT.getNode("combat.fight");
var afterWin = fightNode.getResponses(LT.game, 0);
assert(afterWin[0] && afterWin[0].title === "Victory", "Victory is the only response when the enemy is down");

LT.combat.start({
  enemy: LT.game.npcs.brax,
  escapeChance: 0,
  victoryNode: "enforcer.braxVictory",
  defeatNode: "enforcer.braxDefeat",
});
LT.combat.player.health = 1;
LT.combat.player.selectedMoves = [];
LT.combat.endTurn();
assert(LT.combat.finished === "defeat", "Player at 1 HP falls to Brax's Strike");

var dummy = {
  name: "dummy",
  health: 100,
  maxHealth: 100,
  lust: 10,
  level: 1,
  physique: 10,
  getName: function () { return "dummy"; },
};
LT.combat.start({ enemy: dummy, escapeChance: 0, victoryNode: "boot.menu", defeatNode: "boot.menu", behaviour: "DEFEND" });
dummy.health = 10;
dummy.maxHealth = 100;
LT.combat.planEnemy();
assert(LT.combat.enemy.selectedMoves.some(function (m) { return m.id === "block"; }), "A low-HP DEFEND enemy queues Block");

dummy.health = 100;
dummy.lust = 10;
LT.game.player.lust = 80;
LT.combat.start({ enemy: dummy, escapeChance: 0, victoryNode: "boot.menu", defeatNode: "boot.menu", behaviour: "SEDUCE" });
assert(LT.combat.enemy.selectedMoves.some(function (m) { return m.id === "tease"; }), "A SEDUCE enemy queues Tease");
dummy.combatBehaviour = "BALANCED";
LT.game.player.health = LT.game.player.maxHealth;
LT.game.player.lust = 80;
var teaseW = LT.combat.typeWeight("TEASE", dummy, LT.game.player, 0, function () { return 0; });
var attackW = LT.combat.typeWeight("ATTACK", dummy, LT.game.player, 0, function () { return 0; });
assert(teaseW > attackW, "Official lust ≥75 adds 0.2 to Tease weight");
LT.game.player.lust = 10;

LT.combat.start({
  enemy: LT.game.npcs.brax,
  escapeChance: 0,
  victoryNode: "enforcer.braxVictory",
  defeatNode: "enforcer.braxDefeat",
});
var live = fightNode.getResponses(LT.game, 0);
var byIndex = {};
live.forEach(function (r) { if (r) byIndex[r._index] = r; });
assert(byIndex[0] && byIndex[0].title === "End Turn", "Slot 0 is End Turn");
assert(byIndex[1] && byIndex[1].title === "Strike", "Slot 1 is Strike");
assert(byIndex[2] && byIndex[2].title === "Block", "Slot 2 is Block");
assert(byIndex[3] && byIndex[3].title === "Tease", "Slot 3 is Tease");
assert(byIndex[4] && byIndex[4].title === "Resist", "Slot 4 is Resist");
assert(byIndex[9] && byIndex[9].title === "Submit", "Slot 9 is Submit");
assert(byIndex[10] && byIndex[10].disabled, "Brax escape is disabled");

LT.combat.start({
  enemy: LT.game.npcs.brax,
  escapeChance: 0,
  victoryNode: "enforcer.braxVictory",
  defeatNode: "enforcer.braxDefeat",
});
LT.combat.enemy.lust = 95;
LT.combat.queue("tease");
LT.combat.enemy.selectedMoves = [];
LT.combat.endTurn();
assert(LT.combat.enemy.lust >= 95, "Tease raises lust");
assert(LT.combat.finished === "victory", "100 lust is a lust-loss victory");

var rawLust = 8;
var resisted = Math.max(1, Math.round(rawLust * 0.5));
assert(resisted < rawLust, "Resist halves incoming Tease");

LT.game.flags.quest = "MAIN_1_C_WOLFS_DEN";
var truth = LT.getNode("enforcer.braxTruth").getResponses(LT.game, 0);
var fight = truth.filter(function (r) { return r && r.title === "Fight" && !r.disabled; })[0];
assert(fight && fight.nextDialogue === "combat.fight", "Truth Fight starts the combat node");

var winText = LT.parseFromXML("places/dominion/enforcerHQ/brax", "AFTER_COMBAT_VICTORY");
assert(winText.indexOf("Scarlett") >= 0, "Victory names Scarlett");
assert(winText.indexOf("Arthur") >= 0, "Victory names Arthur");
assert(winText.indexOf("[brax.") < 0 && winText.indexOf("[arthur.") < 0, "Victory parsed");

var loseText = LT.parseFromXML("places/dominion/enforcerHQ/brax", "AFTER_COMBAT_DEFEAT");
assert(loseText.indexOf("potion") >= 0 || loseText.indexOf("bottle") >= 0, "First defeat uses the potion scene");
assert(loseText.indexOf("#ELSEIF") < 0 && loseText.indexOf("[brax.") < 0, "Defeat #ELSEIF parsed");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll combat smoke checks passed.");
