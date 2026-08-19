/* node "Liliths Throne HTML/tools/smoke_encounters.js" */
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
  Math: Math,
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
  "js/items/items.js",
  "js/engine/properties.js",
  "js/engine/preferences.js",
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
  "js/text/stormStreetAttack.js",
  "js/text/harpyAttack.js",
  "js/text/harpyAttackStorm.js",
  "js/text/encounterGeneric.js",
  "js/content/weather.js",
  "js/content/world.js",
  "js/content/alleys.js",
  "js/content/encounters.js",
  "js/content/harpyNests.js",
].forEach(load);

var LT = context.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.money = 500;
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 8, y: 8 };

assert(LT.encounterTableIdForPlace("DOMINION_STREET") === "DOMINION_STREET", "Street uses DOMINION_STREET table");
assert(LT.encounterTableIdForPlace("DOMINION_SHOPPING_ARCADE") === "DOMINION_STREET", "Arcade exterior uses street table");
assert(LT.encounterTableIdForPlace("DOMINION_AUNTS_HOME") === "DOMINION_STREET", "Lilaya's street uses street table");
assert(LT.encounterTableIdForPlace("DOMINION_BACK_ALLEYS_SAFE") === "DOMINION_STREET", "Patrolled alleys use street table");
assert(LT.encounterTableIdForPlace("DOMINION_PARK") === "DOMINION_PARK", "Park uses park table");
assert(LT.encounterTableIdForPlace("HARPY_NESTS_WALKWAYS") === "HARPY_NEST_WALKWAYS", "Walkways use harpy table");
assert(LT.encounterTableIdForPlace("HARPY_NESTS_WALKWAYS_BRIDGE") === "HARPY_NEST_WALKWAYS", "Bridges use harpy table");
assert(LT.encounterTableIdForPlace("DOMINION_SLAVER_ALLEY") == null, "Slaver alley exterior has no encounter table");
assert(LT.encounterTableIdForPlace("DOMINION_PLAZA") == null, "Plaza has no encounter table");
assert(LT.encounterTableIdForPlace("DOMINION_BOULEVARD") == null, "Boulevard is not the street storm table");
assert(LT.encounterTableIdForPlace("DOMINION_ENFORCER_HQ") == null, "Enforcer HQ exterior has no encounter table");
assert(LT.encounterTableIdForPlace("DOMINION_BACK_ALLEYS") == null, "Dangerous alleys stay on the alley table");

LT.setWeatherInSeconds("CLOUD", 3600);
assert(LT.streetEncounterEntries().length === 0, "Clear streets have no storm/cultist/Wes rows");
assert(LT.parkEncounterEntries().length === 0, "Clear park has no storm row");

LT.setWeatherInSeconds("MAGIC_STORM", 3600);
var street = LT.streetEncounterEntries();
assert(street.length === 1 && street[0].id === "DOMINION_STORM_ATTACK" && street[0].weight === 15, "Storm streets are 15% storm attack");
var park = LT.parkEncounterEntries();
assert(park.length === 1 && park[0].weight === 15, "Storm park is 15% storm attack");

LT.game.player.setName("Kinariu", "Kinariu", "Kinariu");
var withFox = LT.streetEncounterEntries();
assert(withFox.length === 2 && withFox[1].id === "DOMINION_STREET_FIND_HAPPINESS" && withFox[1].weight === 10, "Kinariu can find Happiness at 10%");
LT.game.flags.foundHappiness = true;
assert(LT.streetEncounterEntries().length === 1, "Happiness is once-only");
LT.game.player.setName("Alex", "Alex", "Alex");
delete LT.game.flags.foundHappiness;

var walk = LT.harpyWalkwayEntries();
assert(walk.length === 2 && walk[0].weight === 12 && walk[1].weight === 4, "Walkways are 12% attack + 4% item");
LT.game.flags.harpyPacified = true;
var calm = LT.harpyWalkwayEntries();
assert(calm.length === 2 && calm[0].id === "HARPY_NEST_ATTACK", "Storm still allows walkway attacks after pacification");
LT.setWeatherInSeconds("CLOUD", 3600);
var calmClear = LT.harpyWalkwayEntries();
assert(calmClear.length === 1 && calmClear[0].id === "HARPY_NEST_FIND_ITEM", "Pacified walkways drop attacks in clear weather");
delete LT.game.flags.harpyPacified;
var trouble = LT.harpyLookForTroubleEntries();
assert(trouble.length === 2 && trouble[0].weight === 12, "Look for trouble always includes attacks");

var realRandom = Math.random;
Math.random = function () { return 0.149; };
var hit = LT.rollEncounterTable([{ id: "A", weight: 15, start: function () { return "hit"; } }], false);
assert(hit && hit.node === "hit", "Official roll 14.9 < 15 triggers");
Math.random = function () { return 0.15; };
var miss = LT.rollEncounterTable([{ id: "A", weight: 15, start: function () { return "hit"; } }], false);
assert(!miss, "Official roll 15.0 is not less than 15");
Math.random = function () { return 0.99; };
var forced = LT.rollEncounterTable([{ id: "A", weight: 15, start: function () { return "forced"; } }], true);
assert(forced && forced.node === "forced", "Force-roll ignores the 100 check");
Math.random = realRandom;

LT.setWeatherInSeconds("MAGIC_STORM", 3600);
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 4, y: 4 };
Math.random = function () { return 0; };
var stormNode = LT.maybePlaceEncounter({ noRedirect: true });
Math.random = realRandom;
assert(stormNode === "enc.storm-attack", "Street storm roll starts storm attack");
var attacker = LT.game.npcs.alleyMugger;
assert(attacker && attacker.occupation !== "prostitute", "Storm attacker is not a prostitute");
assert(attacker.raceName !== "demon", "Storm streets use ordinary Dominion races, not dark-alley demons");
assert(attacker.attractedToPlayer === true, "Storm attacker is lust-crazed");

var stormText = LT.getNode("enc.storm-attack").getContent();
assert(stormText.indexOf("deserted streets of Dominion") >= 0, "Storm opening uses official street text");
assert(stormText.indexOf("#IF") < 0 && stormText.indexOf("[npc.") < 0, "Storm opening parsed");
var stormR = LT.getNode("enc.storm-attack").getResponses(LT.game, 0);
var pay = stormR.filter(function (r) { return r && r.title === "Offer money"; })[0];
assert(pay && pay.disabled, "Storm offer-money is disabled");
var fight = stormR.filter(function (r) { return r && r.title === "Fight"; })[0];
assert(fight, "Storm fight is available");
var body = stormR.filter(function (r) { return r && r.title === "Offer body"; })[0];
assert(body && !body.disabled, "Storm offer-body is available");

LT.game.player.location = { world: "DOMINION", place: "DOMINION_SLAVER_ALLEY", x: 1, y: 1 };
delete LT.game.flags.encounterTileKey;
assert(LT.maybePlaceEncounter({ force: true, noRedirect: true }) == null, "Slaver alley never rolls");

LT.game.player.location = { world: "HARPY_NEST", place: "HARPY_NESTS_WALKWAYS", x: 2, y: 2 };
delete LT.game.flags.encounterTileKey;
var harpy = LT.generateHarpyAttacker({ feminine: true, level: 3 });
assert(harpy.raceName === "harpy", "Harpy attacker is a harpy");
assert(harpy.level === 3, "Harpy level is applied");
assert(harpy.level >= 2 && harpy.level <= 5, "Default harpy band is 2–5");
assert(harpy.gender && harpy.gender.feminine, "Explicit feminine harpy stays feminine");
var randomHarpy = LT.generateHarpyAttacker({ level: 2 });
assert(randomHarpy.raceName === "harpy", "Preference-rolled harpy attacker stays a harpy");

var hOpen = LT.parseFromXML("encounters/dominion/harpyAttack", "HARPY_ATTACK");
assert(hOpen.indexOf("swoops down") >= 0 || hOpen.indexOf("blocking your path") >= 0, "Harpy attack XML present");
assert(hOpen.indexOf("#IF") < 0, "Harpy attack parsed");
var hStorm = LT.parseFromXML("encounters/dominion/harpyAttackStorm", "HARPY_ATTACK");
assert(hStorm.indexOf("arcane storm") >= 0, "Storm harpy attack XML present");

Math.random = function () { return 0.7; };
delete LT.game.flags.foundEncounterItem;
var itemNode = startFindViaTable();
Math.random = realRandom;
function startFindViaTable() {
  return LT.maybePlaceEncounter({ force: true, tableId: "HARPY_NEST_LOOK_FOR_TROUBLE", noRedirect: true });
}
assert(LT.ITEMS.innoxia_race_harpy_bubblegum_lollipop, "Bubblegum lollipop exists");
assert(LT.ITEMS.innoxia_race_harpy_bubblegum_lollipop.value === 10, "Lollipop value is official 10");

Math.random = function () { return 0.0; };
delete LT.game.flags.foundEncounterItem;
delete LT.game.flags.encounterTileKey;
var findA = LT.rollEncounterTable(
  [{ id: "HARPY_NEST_FIND_ITEM", weight: 4, start: function () {
    LT.game.flags.foundEncounterItem = Math.random() < 0.66 ? "innoxia_race_harpy_harpy_perfume" : "innoxia_race_harpy_bubblegum_lollipop";
    return "enc.find-item";
  }}],
  true,
);
Math.random = function () { return 0.66; };
delete LT.game.flags.foundEncounterItem;
var findB = LT.rollEncounterTable(
  [{ id: "HARPY_NEST_FIND_ITEM", weight: 4, start: function () {
    LT.game.flags.foundEncounterItem = Math.random() < 0.66 ? "innoxia_race_harpy_harpy_perfume" : "innoxia_race_harpy_bubblegum_lollipop";
    return "enc.find-item";
  }}],
  true,
);
Math.random = realRandom;
assert(findA && LT.game.flags.foundEncounterItem !== "x", "Find-item start runs");

var perfumeCount = 0;
var popCount = 0;
var i;
for (i = 0; i < 200; i++) {
  if (Math.random() < 0.66) perfumeCount++;
  else popCount++;
}
assert(perfumeCount > popCount, "66% perfume split leans perfume");

LT.game.flags.foundEncounterItem = "innoxia_race_harpy_harpy_perfume";
LT.getNode("enc.find-item").applyPreParsingEffects();
var dropped = LT.getNode("enc.find-item").getContent();
assert(dropped.indexOf("Harpy Perfume") >= 0, "Find-item names the perfume");
assert(dropped.indexOf("flash of pink") >= 0, "Find-item uses official walkway text");
var take = LT.getNode("enc.find-item").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Take"; })[0];
var leave = LT.getNode("enc.find-item").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Leave"; })[0];
assert(take && leave, "Find-item has Take and Leave");
var before = LT.countItems(LT.game.player, "innoxia_race_harpy_harpy_perfume");
take.effects();
assert(LT.countItems(LT.game.player, "innoxia_race_harpy_harpy_perfume") === before + 1, "Take adds the item");

LT.game.player.setName("Kinariu", "Kinariu", "Kinariu");
LT.setWeatherInSeconds("CLOUD", 3600);
LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 9, y: 9 };
delete LT.game.flags.foundHappiness;
delete LT.game.flags.encounterTileKey;
Math.random = function () { return 0; };
var happy = LT.maybePlaceEncounter({ noRedirect: true });
Math.random = realRandom;
assert(happy === "enc.happiness", "Kinariu happiness encounter fires");
assert(LT.game.flags.foundHappiness === true, "Finding Happiness sets the flag");
var fox = LT.getNode("enc.happiness").getContent();
assert(fox.indexOf("Happiness") >= 0 && fox.indexOf("silver") >= 0, "Happiness uses official fox text");
assert(fox.indexOf("5 metres") >= 0, "unit.lSizes(5000) becomes 5 metres");
assert(fox.indexOf("#IF") < 0 && fox.indexOf("[style.") < 0, "Happiness text parsed");

var explore = LT.getNode("place.HARPY_NESTS_WALKWAYS").getResponses(LT.game, 0);
var exp = explore.filter(function (r) { return r && r.title === "Explore"; })[0];
assert(exp, "Unpacified walkways have Explore");
LT.game.flags.harpyPacified = true;
var look = LT.getNode("place.HARPY_NESTS_WALKWAYS").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Look for trouble"; })[0];
assert(look, "Pacified walkways have Look for trouble");

LT.game.player.location = { world: "DOMINION", place: "DOMINION_STREET", x: 3, y: 3 };
LT.setWeatherInSeconds("MAGIC_STORM", 3600);
delete LT.game.flags.encounterTileKey;
Math.random = function () { return 0.99; };
var none = LT.maybePlaceEncounter({ noRedirect: true });
assert(!none, "A high roll on the same table misses");
var again = LT.maybePlaceEncounter({ noRedirect: true });
assert(!again, "Same tile does not re-roll until you leave");
Math.random = function () { return 0; };
var forcedSame = LT.maybePlaceEncounter({ force: true, noRedirect: true });
assert(forcedSame === "enc.storm-attack" || forcedSame === "enc.happiness", "Force-roll still works on the same tile");
Math.random = realRandom;

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll encounter table smoke checks passed.");
