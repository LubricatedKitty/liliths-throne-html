/* node "Liliths Throne HTML/tools/smoke_weapons.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var store = {};
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
  "js/character/clothing.js",
  "js/character/npcs.js",
  "js/items/weapons.js",
  "js/items/weaponRuntime.js",
  "js/engine/game.js",
  "js/engine/save.js",
  "js/engine/utilText.js",
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/ui/menus/inventory.js",
].forEach(load);

var LT = context.LT;
var ids = LT.WEAPON_IDS;
assert(ids.length === 65, "Official catalog has 65 weapon types");
assert(!!LT.WEAPONS.innoxia_europeanSwords_arming_sword, "Arming sword id is official");
assert(!!LT.WEAPONS.innoxia_europeanSwords_zweihander, "Zweihander id is official");
assert(!!LT.WEAPONS.innoxia_dagger_dagger, "Demon's Dagger id is official");
assert(!!LT.WEAPONS.innoxia_bow_shortbow, "Shortbow id is official");
assert(!!LT.WEAPONS.innoxia_gun_revolver, "Arcane revolver id is official");
assert(!LT.WEAPONS.anubisstaff && !LT.WEAPONS.innoxia_anubisstaff, "No invented anubis staff");

var sword = LT.WEAPONS.innoxia_europeanSwords_arming_sword;
assert(sword.name === "arming sword", "Arming sword keeps official name");
assert(sword.damage === 35, "Arming sword damage is 35");
assert(sword.variance === "LOW", "Arming sword variance is LOW");
assert(sword.twoHanded === false, "Arming sword is one-handed");
assert(sword.melee === true, "Arming sword is melee");

var zwei = LT.WEAPONS.innoxia_europeanSwords_zweihander;
assert(zwei.name === "Zweihänder", "Zweihander decodes official umlaut");
assert(zwei.twoHanded === true, "Zweihander is two-handed");
assert(zwei.damage === 50, "Zweihander damage is 50");
assert(zwei.variance === "MEDIUM", "Zweihander variance is MEDIUM");

var bow = LT.WEAPONS.innoxia_bow_shortbow;
assert(bow.melee === false, "Shortbow is ranged");
assert(bow.twoHanded === true, "Shortbow is two-handed");
assert(bow.damage === 25, "Shortbow damage is 25");

var player = LT.createNewPlayer();
player.setName("Alex", "Alex", "Alex");
LT.game.player = player;
LT.game.started = true;

assert(LT.grantAllWeapons(player) === 65, "Take-all grants one of each official type");
assert(player.weapons.length === 65, "All granted weapons sit in the bag");
assert(LT.grantAllWeapons(player) === 0, "Take-all does not duplicate types you already have");

function take(id) {
  for (var i = 0; i < player.weapons.length; i++) if (player.weapons[i].id === id) return player.weapons[i];
  return null;
}

var swordInst = take("innoxia_europeanSwords_arming_sword");
var daggerInst = take("innoxia_dagger_dagger");
var zweiInst = take("innoxia_europeanSwords_zweihander");
assert(!!swordInst && !!daggerInst && !!zweiInst, "Granted bag includes sword, dagger, zweihander");

assert(LT.equipWeapon(player, swordInst.uid, "main"), "Can equip arming sword to main");
assert(player.mainWeapon && player.mainWeapon.id === "innoxia_europeanSwords_arming_sword", "Main slot holds the sword");
assert(LT.equipWeapon(player, daggerInst.uid, "offhand"), "Can equip dagger to offhand");
assert(player.offhandWeapon && player.offhandWeapon.id === "innoxia_dagger_dagger", "Offhand slot holds the dagger");
assert(!!LT.getOffhandWeapon(player), "Offhand weapon is readable while main is one-handed");

var swordRange = LT.weaponRange(player.mainWeapon);
assert(swordRange.min === 32 && swordRange.max === 39, "LOW variance on 35 is 32–39");
var rolled = LT.rollWeapon(player.mainWeapon);
assert(rolled >= 32 && rolled <= 39, "Rolled sword damage stays in official LOW range");

var stone = LT.makeWeapon("innoxia_crystal_epic", "FIRE");
assert(LT.weaponUsesUnarmed(stone), "Demonstone uses unarmed calculation");
assert(LT.baseWeaponDamage(stone, player) === 19, "Epic demonstone is 15 + unarmed 4");
var stoneRange = LT.weaponRange(stone, player);
assert(stoneRange.min === 15 && stoneRange.max === 23, "MEDIUM variance on 19 is 15–23");
var pipe = LT.makeWeapon("innoxia_pipe_pipe", "PHYSICAL");
assert(!LT.weaponUsesUnarmed(pipe), "Pipe is not an unarmed weapon");
assert(LT.baseWeaponDamage(pipe, player) === 15, "Pipe stays at XML damage 15");
var knuckles = LT.makeWeapon("innoxia_knuckleDusters_knuckle_dusters", "PHYSICAL");
assert(LT.baseWeaponDamage(knuckles, player) === 19, "Knuckles are 15 + unarmed 4");

var dummy = { name: "Brax", health: 200, maxHealth: 200, level: 10, getName: function () { return "Brax"; }, isFeminine: function () { return false; } };
var hit = LT.MOVES.strike.perform(player, dummy);
assert(dummy.health < 200, "Equipped Strike deals sword damage");
assert(hit.indexOf("[npc.") < 0 && hit.indexOf("[npc2.") < 0, "Weapon hit text is parsed");
assert(/for <b>\d+<\/b> damage/.test(hit), "Strike still reports damage");

LT.combat.start({
  enemy: dummy,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
});
var fight = LT.getNode("combat.fight");
var live = fight.getResponses(LT.game, 0);
var byIndex = {};
live.forEach(function (r) { if (r) byIndex[r._index] = r; });
assert(byIndex[1] && byIndex[1].title === "Slash", "Strike title uses the sword's attack descriptor");
assert(byIndex[6] && byIndex[6].title === "Stab", "Offhand title uses the dagger's attack descriptor");
assert(!byIndex[6].disabled, "Offhand is usable with a dagger equipped");

assert(LT.equipWeapon(player, zweiInst.uid, "main"), "Equipping a two-hander succeeds");
assert(player.mainWeapon.id === "innoxia_europeanSwords_zweihander", "Main is now the zweihander");
assert(!player.offhandWeapon, "Two-hander unequips the offhand");
assert(!LT.getOffhandWeapon(player), "Offhand is occupied by a two-hander");
LT.unequipWeapon(player, "main");
var zweiBag = take("innoxia_europeanSwords_zweihander");
assert(!!zweiBag, "Unequipped zweihander returns to the bag");
assert(LT.equipWeapon(player, zweiBag.uid, "offhand") === false, "Two-hander cannot go in the offhand");
assert(!!take("innoxia_europeanSwords_zweihander"), "Rejected two-hander stays in the bag");
assert(LT.equipWeapon(player, take("innoxia_europeanSwords_zweihander").uid, "main"), "Zweihander can be re-equipped to main");

var parsed = LT.parseWeaponText("[npc.Name] [npc.verb(slash)] at [npc2.name]!", player, dummy);
assert(parsed === "Alex slash at Brax!", "Player verbs stay first-person");
var enemyParsed = LT.parseWeaponText("[npc.Name] [npc.verb(slash)] at [npc2.name]!", dummy, player);
assert(enemyParsed === "Brax slashes at Alex!", "NPC verbs take third person");

var snap = LT.snapshotGame();
assert(snap.player.mainWeapon && snap.player.mainWeapon.id === "innoxia_europeanSwords_zweihander", "Save snapshot keeps the main weapon");
assert(Array.isArray(snap.player.weapons) && snap.player.weapons.length >= 63, "Save snapshot keeps the weapon bag");

var inv = LT.getNode("inventory.main");
var html = inv.getContent();
assert(html.indexOf("Weapons") >= 0, "Inventory shows a Weapons section");
assert(html.indexOf("Zweihänder") >= 0 || html.indexOf("zweihander") >= 0 || html.indexOf("occupied") >= 0, "Inventory shows the equipped two-hander");
var replies = inv.getResponses();
assert(!replies.some(function (r) { return r && r.title === "Take all weapons"; }), "Take all weapons is hidden without devMode");
LT.devMode = true;
replies = inv.getResponses();
assert(replies.some(function (r) { return r && r.title === "Take all weapons"; }), "Take all weapons appears in devMode");
LT.devMode = false;

var brax = LT.ensureBrax();
assert(brax.mainWeapon && brax.mainWeapon.id === "innoxia_crystal_epic", "Brax's official main is the epic demonstone");
assert(brax.mainWeapon.damageType === "FIRE", "Brax's demonstone is Fire");
assert(brax.offhandWeapon && brax.offhandWeapon.id === "dsg_eep_pbweap_pbpistol", "Brax's official offhand is the pepperball pistol");
assert(LT.baseWeaponDamage(brax.mainWeapon, brax) === 20, "Brax demonstone is 15 + unarmed 5");

var amber = LT.ensureAmber();
assert(amber.mainWeapon && amber.mainWeapon.id === "innoxia_crystal_epic", "Amber's official main is the epic demonstone");
assert(amber.offhandWeapon && amber.offhandWeapon.id === "innoxia_crystal_epic", "Amber's official offhand is a second demonstone");

var mugger = { level: 2, physique: 12 };
LT.armMuggerFromOutfit(mugger, { hasWeapon: true, knuckles: false, meleeId: "innoxia_pipe_pipe" });
assert(mugger.mainWeapon.id === "innoxia_pipe_pipe", "Dominion mugger can roll a pipe");
LT.armMuggerFromOutfit(mugger, { hasWeapon: true, knuckles: true, offhand: true });
assert(mugger.mainWeapon.id === "innoxia_knuckleDusters_knuckle_dusters", "Dominion mugger can roll knuckles");
assert(mugger.offhandWeapon && mugger.offhandWeapon.id === "innoxia_knuckleDusters_knuckle_dusters", "Knuckle muggers can dual-wield");
LT.armMuggerFromOutfit(mugger, { dark: true, hasWeapon: true, dual: true });
assert(mugger.mainWeapon.id === "innoxia_crystal_rare", "Dark-alley demon below 8 uses a rare demonstone");
assert(mugger.offhandWeapon && mugger.offhandWeapon.id === "innoxia_feather_rare", "Dark-alley dual-wield offhand is a rare feather");

LT.combat.start({
  enemy: brax,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
  behaviour: "ATTACK",
});
assert(LT.combat.enemy.selectedMoves.length === 3, "ATTACK Brax spends 3 AP");
assert(LT.combat.enemy.selectedMoves[0].id === "strike", "Brax's first move is Strike");
assert(LT.combat.enemy.selectedMoves[1].id === "offhand", "Brax's second move is Offhand");
assert(LT.combat.predictions(brax)[0].indexOf("misty demonstone") >= 0, "Brax's queued Strike uses the demonstone");
assert(LT.combat.predictions(brax)[1].indexOf("pepperball") >= 0, "Brax's queued Offhand uses the pistol");
assert(LT.combat.enemy.remainingAP === 0, "Strike + Offhand + another attack spends Brax's 3 AP");

var pipeMugger = { level: 2, physique: 12, maxAP: 3, getName: function () { return "the mugger"; } };
LT.armMuggerFromOutfit(pipeMugger, { hasWeapon: true, knuckles: false, meleeId: "innoxia_pipe_pipe" });
LT.combat.start({
  enemy: pipeMugger,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
  behaviour: "ATTACK",
});
assert(LT.combat.enemy.selectedMoves.every(function (m) { return m.id === "strike"; }), "A one-handed ATTACK mugger only Strikes");
assert(LT.combat.enemy.selectedMoves.length === 3, "A one-handed mugger spends 3 AP on Strike");

LT.combat.start({
  enemy: amber,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
  behaviour: "ATTACK",
});
assert(LT.combat.enemy.selectedMoves.length === 3, "ATTACK Amber spends 3 AP");
assert(LT.combat.enemy.selectedMoves[1].id === "offhand", "Amber's second move is the offhand demonstone");
assert(LT.combat.predictions(amber)[1].indexOf("misty demonstone") >= 0, "Amber's Offhand uses the second demonstone");

player.essences = 0;
var revolver = LT.makeWeapon("innoxia_gun_revolver");
player.weapons.push(revolver);
LT.equipWeapon(player, revolver.uid, "main");
assert(!LT.canAffordWeapon(player, "main"), "A revolver needs an essence");
player.essences = 1;
assert(LT.canAffordWeapon(player, "main"), "One essence can fire the revolver");
var before = dummy.health;
LT.MOVES.strike.perform(player, dummy);
assert(player.essences === 0, "Firing the revolver spends 1 essence");
assert(dummy.health < before, "The revolver still deals damage");

var ball = LT.makeWeapon("innoxia_thrown_tennis_ball");
player.weapons.push(ball);
LT.equipWeapon(player, ball.uid, "main");
LT.combat.start({
  enemy: dummy,
  escapeChance: 0,
  victoryNode: "boot.menu",
  defeatNode: "boot.menu",
  behaviour: "ATTACK",
});
player.mainWeapon = ball;
LT.MOVES.strike.perform(player, dummy, 0);
assert(!player.mainWeapon, "A one-shot tennis ball is consumed on use");
LT.recoverThrownAfterCombat();
assert(player.mainWeapon && player.mainWeapon.id === "innoxia_thrown_tennis_ball", "Tennis balls recover after combat (100%)");

player.mainWeapon = null;
player.selectedMoves = [{ id: "strike" }, { id: "strike" }, { id: "strike" }];
assert(LT.isMoveCrit(player, "strike", 2), "The third identical move in a turn is a critical");
assert(!LT.isMoveCrit(player, "strike", 1), "The second identical move is not a critical");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll weapon smoke checks passed.");
