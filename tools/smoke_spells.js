/* node "Liliths Throne HTML/tools/smoke_spells.js" */
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
  "js/combat/tease.js",
  "js/combat/spells.js",
  "js/items/spellBooks.js",
  "js/combat/status.js",
  "js/combat/damage.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
].forEach(load);

var LT = context.LT;
var fire = LT.SPELLS.FIREBALL;
var ice = LT.SPELLS.ICE_SHARD;
var slam = LT.SPELLS.SLAM;
var arousal = LT.SPELLS.ARCANE_AROUSAL;
assert(fire && fire.damage === 30 && fire.cost === 75 && fire.variance === "LOW", "Fireball is official 30 / 75 / LOW");
assert(ice && ice.damage === 25 && ice.cost === 35, "Ice Shard is official 25 / 35");
assert(slam && slam.damage === 40 && slam.cost === 60, "Slam is official 40 / 60");
assert(arousal && arousal.damage === 15 && arousal.cost === 50 && arousal.effect === "lust", "Arcane Arousal is official 15 lust / 50");
assert(LT.SPELLS.FLASH && LT.SPELLS.FLASH.cost === 50 && LT.SPELLS.FLASH.effect === "flash", "Flash is official 50 aura / -1 AP");
assert(LT.SPELLS.POISON_VAPOURS && LT.SPELLS.POISON_VAPOURS.cost === 50 && LT.SPELLS.POISON_VAPOURS.effect === "poison", "Poison Vapours is official 50 aura / 25×3");
assert(LT.spellRange(fire).min === 27 && LT.spellRange(fire).max === 33, "Fireball LOW range is 27–33");
assert(LT.spellRange(ice).min === 23 && LT.spellRange(ice).max === 28, "Ice Shard LOW range is 23–28");

assert(LT.knownSpells(LT.createNewPlayer()).length === 0, "New player knows no spells");

var player = LT.createNewPlayer();
player.setName("Alex", "Alex", "Alex");
LT.game.player = player;
LT.refreshVitals(player, true);
LT.SPELL_IDS.forEach(function (id) { LT.learnSpell(player, id); });
assert(player.maxMana === 57, "Level 1 aura is 57");
assert(!LT.canAffordSpell(player, fire), "Level 1 cannot afford Fireball (75)");
assert(LT.canAffordSpell(player, ice), "Level 1 can afford Ice Shard (35)");
assert(!LT.canAffordSpell(player, slam), "Level 1 cannot afford Slam (60)");
assert(LT.canAffordSpell(player, arousal), "Level 1 can afford Arcane Arousal (50)");
assert(LT.canAffordSpell(player, LT.SPELLS.FLASH), "Level 1 can afford Flash (50)");
assert(LT.canAffordSpell(player, LT.SPELLS.POISON_VAPOURS), "Level 1 can afford Poison Vapours (50)");

var dummy = {
  name: "Brax",
  health: 200,
  maxHealth: 200,
  lust: 10,
  getName: function () { return "Brax"; },
  isFeminine: function () { return false; },
};
var line = LT.MOVES.spell_ICE_SHARD.perform(player, dummy);
assert(player.mana === 22, "Ice Shard spends 35 aura (57-35=22)");
assert(dummy.health < 200 && dummy.health >= 172, "Ice Shard deals official LOW damage");
assert(line.indexOf("[npc.") < 0 && line.indexOf("[pc.") < 0, "Ice Shard cast text is parsed");
assert(line.indexOf("Brax") >= 0, "Ice Shard names the target");

LT.refreshVitals(player, true);
player.selectedMoves = [{ id: "spell_ICE_SHARD", target: dummy }];
assert(!LT.canAffordSpell(player, ice), "A second Ice Shard is unaffordable after one is queued");

LT.ensureBrax();
LT.combat.start({
  enemy: LT.game.npcs.brax,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
});
var fight = LT.getNode("combat.fight");
var basic = fight.getResponses(LT.game, 0);
var byIndex = {};
basic.forEach(function (r) { if (r) byIndex[r._index] = r; });
assert(byIndex[1] && byIndex[1].title === "Strike", "Basic tab still has Strike");

var spells = fight.getResponses(LT.game, 1);
var spellBy = {};
spells.forEach(function (r) { if (r) spellBy[r.title] = r; });
assert(spellBy.Fireball && spellBy.Fireball.disabled, "Fireball is listed and disabled at 57 aura");
assert(spellBy["Ice Shard"] && !spellBy["Ice Shard"].disabled, "Ice Shard is usable at 57 aura");
assert(spellBy.Slam && spellBy.Slam.disabled, "Slam is listed and disabled at 57 aura");
assert(spellBy["Arcane Arousal"] && !spellBy["Arcane Arousal"].disabled, "Arcane Arousal is usable at 57 aura");
assert(spellBy.Flash && !spellBy.Flash.disabled, "Flash is usable at 57 aura");
assert(spellBy["Poison Vapours"] && !spellBy["Poison Vapours"].disabled, "Poison Vapours is usable at 57 aura");
assert(spellBy["Arcane Cloud"] && spellBy["Arcane Cloud"].disabled, "Arcane Cloud is listed and disabled at 57 aura");
assert(spellBy["Telepathic Communication"] && spellBy["Telepathic Communication"].disabled, "Telepathic Communication is listed and disabled at 57 aura");

LT.combat.queue("spell_ARCANE_AROUSAL");
LT.combat.enemy.selectedMoves = [];
var lustBefore = LT.combat.enemy.lust;
LT.combat.endTurn();
assert(LT.combat.enemy.lust > lustBefore, "Arcane Arousal raises lust");
assert(LT.combat.player.mana === 7, "Arcane Arousal spends 50 aura (57-50=7)");

LT.refreshVitals(player, true);
var mugger = { name: "the mugger", health: 200, maxHealth: 200, lust: 10, level: 2, physique: 12, getName: function () { return "the mugger"; }, isFeminine: function () { return false; } };
LT.combat.start({
  enemy: mugger,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
});
LT.combat.queue("spell_FLASH");
LT.combat.enemy.selectedMoves = [];
LT.combat.endTurn();
assert(LT.getStatus(mugger, "FLASH") == null, "Flash is consumed when the target's next AP is planned");
assert(LT.combat.enemy.selectedMoves.length === 2, "Flash leaves 2 AP, which a one-handed mugger spends");

LT.refreshVitals(player, true);
LT.combat.start({
  enemy: mugger,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
});
mugger.maxHealth = 200;
mugger.health = 200;
LT.combat.queue("spell_POISON_VAPOURS");
LT.combat.enemy.selectedMoves = [];
var hp0 = mugger.health;
LT.combat.endTurn();
assert(LT.getStatus(mugger, "POISON_VAPOURS") && LT.getStatus(mugger, "POISON_VAPOURS").turns === 2, "Poison Vapours has 2 turns left after the first tick");
assert(hp0 - mugger.health === 25, "Poison Vapours deals 25 on the cast turn");
LT.combat.player.selectedMoves = [];
LT.combat.enemy.selectedMoves = [];
LT.combat.endTurn();
assert(hp0 - mugger.health === 50, "Poison Vapours deals 25 on the second turn");
LT.combat.player.selectedMoves = [];
LT.combat.enemy.selectedMoves = [];
LT.combat.endTurn();
assert(hp0 - mugger.health === 75, "Poison Vapours deals 25 on the third turn");
assert(!LT.getStatus(mugger, "POISON_VAPOURS"), "Poison Vapours expires after 3 ticks");

assert(LT.SPELLS.VACUUM && LT.SPELLS.VACUUM.damage === 5 && LT.SPELLS.VACUUM.cost === 60, "Vacuum is official 5 / 60");
assert(LT.SPELLS.SOOTHING_WATERS && LT.SPELLS.SOOTHING_WATERS.cost === 100 && LT.SPELLS.SOOTHING_WATERS.ap === 3, "Soothing Waters is official 100 aura / 3 AP");
assert(LT.SPELLS.STONE_SHELL && LT.SPELLS.STONE_SHELL.cost === 25, "Stone Shell is official 25 aura");
assert(LT.SPELLS.CLOAK_OF_FLAMES && LT.SPELLS.CLOAK_OF_FLAMES.cost === 50, "Cloak of Flames is official 50 aura");
assert(LT.SPELLS.RAIN_CLOUD && LT.SPELLS.RAIN_CLOUD.cost === 33, "Rain Cloud is official 33 aura");
assert(LT.SPELLS.ARCANE_CLOUD && LT.SPELLS.ARCANE_CLOUD.cost === 150 && LT.SPELLS.ARCANE_CLOUD.effect === "cloud", "Arcane Cloud is official 150 aura / 3 turns");
assert(LT.SPELLS.TELEPATHIC_COMMUNICATION && LT.SPELLS.TELEPATHIC_COMMUNICATION.cost === 75 && LT.SPELLS.TELEPATHIC_COMMUNICATION.effect === "telepathic", "Telepathic Communication is official 75 aura / 5 turns");

LT.refreshVitals(player, true);
player.mana = 120;
player.health = 10;
player.maxHealth = 100;
LT.MOVES.spell_SOOTHING_WATERS.perform(player, player);
assert(player.health === 30, "Soothing Waters heals 20% of max health");
assert(player.mana === 20, "Soothing Waters spends 100 aura");

LT.refreshVitals(player, true);
player.mana = 40;
var shellDummy = { name: "dummy", health: 50, maxHealth: 50, getName: function () { return "dummy"; } };
LT.MOVES.spell_STONE_SHELL.perform(player, shellDummy);
assert(LT.getStatus(player, "STONE_SHELL") && LT.getStatus(player, "STONE_SHELL").turns === 3, "Stone Shell applies to the caster");

var amber = LT.ensureAmber();
LT.refreshVitals(amber, true);
LT.combat.start({
  enemy: amber,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
  behaviour: "SPELLS",
});
assert(LT.combat.enemy.selectedMoves.some(function (m) { return String(m.id).indexOf("spell_") === 0; }), "SPELLS Amber queues an official school spell");

var tank = { name: "tank", health: 50, maxHealth: 50, getName: function () { return "tank"; } };
LT.applyStatus(tank, "CLOAK_OF_FLAMES", 3);
assert(tank.shields.FIRE === 5 && tank.shields.ICE === 10, "Cloak of Flames grants official +5 fire / +10 ice shields");
assert(LT.applyTypedDamage(tank, 8, "FIRE") === 3, "Fire shields absorb 5, leftover 3 goes to HP");
assert(tank.health === 47, "Leftover fire damage hits health");
LT.applyStatus(tank, "STONE_SHELL", 3);
assert(tank.shields.PHYSICAL === 5, "Stone Shell grants official +5 physical shields");
LT.applyStatus(player, "RAIN_CLOUD", 3);
assert(LT.spellCostOf(player, LT.SPELLS.ICE_SHARD) === 44, "Rain Cloud raises Ice Shard from 35 to 44");

LT.refreshVitals(player, true);
if (typeof LT.clearStatuses === "function") LT.clearStatuses(player);
player.mana = 150;
var clouded = { name: "Brax", health: 50, maxHealth: 50, lust: 10, getName: function () { return "Brax"; }, isFeminine: function () { return false; } };
var cloudLine = LT.MOVES.spell_ARCANE_CLOUD.perform(player, clouded);
assert(LT.getStatus(clouded, "ARCANE_CLOUD") && LT.getStatus(clouded, "ARCANE_CLOUD").turns === 3, "Arcane Cloud lasts 3 turns");
assert(clouded.shields.LUST === -25, "Arcane Cloud grants official −25 lust resistance as a shield");
assert(LT.applyLust(clouded, 10) === 10, "Official shieldCheck ignores non-positive lust shields");
assert(cloudLine.indexOf("[npc.") < 0 && cloudLine.indexOf("[pc.") < 0, "Arcane Cloud cast text is parsed");
assert(player.mana === 0, "Arcane Cloud spends 150 aura");

LT.refreshVitals(player, true);
player.mana = 75;
player.lust = 10;
var teleLine = LT.MOVES.spell_TELEPATHIC_COMMUNICATION.perform(player, clouded);
assert(LT.getStatus(player, "TELEPATHIC_COMMUNICATION") && LT.getStatus(player, "TELEPATHIC_COMMUNICATION").turns === 5, "Telepathic Communication lasts 5 turns on the caster");
assert(LT.lustDamageMultiplier(player) === 1.15, "Telepathic Communication is official +15 DAMAGE_LUST");
assert(LT.modifyOutgoingLust(player, 7) === 8, "Tease 7 becomes 8 under +15 lust damage");
assert(teleLine.indexOf("thoughts to be projected") >= 0, "Telepathic Communication uses official self-cast text");
assert(player.mana === 0, "Telepathic Communication spends 75 aura");

var teaseDummy = { name: "dummy", lust: 10, getName: function () { return "dummy"; } };
var teaseLine = LT.MOVES.tease.perform(player, teaseDummy);
assert(teaseDummy.lust >= 16 && teaseDummy.lust <= 20, "Tease under Telepathic is official 7×1.15 with MEDIUM variance");
assert(teaseLine.indexOf("lust") >= 0, "Tease still reports lust");

assert(LT.availableTeases(player).indexOf("tease_breasts") >= 0, "Feminine player can use breasts tease");
assert(LT.availableTeases(player).indexOf("tease_vaginal") >= 0, "Feminine player can use pussy tease");
assert(LT.MOVES.allout.ap === 2 && LT.MOVES.allout.cooldown === 2, "All-out strike is official 2 AP / 2 cooldown");

var book = LT.makeSpellBook("ICE_SHARD");
assert(book && book.name === "Spellbook: Ice Shard", "Ice Shard book uses official name");
assert(LT.spellBookValue("ICE_SHARD") === 2500, "Ice Shard book is official 2500");
assert(LT.spellBookBuyPrice("FLASH") === 7500, "Flash book buys at 5000×1.5");
var learner = LT.createNewPlayer();
var learned = LT.readSpellBook(learner, book);
assert(learner.knownSpells.indexOf("ICE_SHARD") >= 0, "Reading the book teaches Ice Shard");
assert(learned.indexOf("disappears") >= 0, "The book is consumed after it is learned");
assert((learner.items || []).length === 0, "The consumed book leaves the inventory");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll spell smoke checks passed.");
