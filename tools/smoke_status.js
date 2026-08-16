/* node tools/smoke_status.js */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var html = path.join(__dirname, "..");
var ctx = {
  window: { LT: {} },
  document: { addEventListener: function () {}, dispatchEvent: function () {}, getElementById: function () { return null; } },
  CustomEvent: function () {},
};
ctx.window.LT = ctx.LT = { TEXT: {} };
ctx.window = ctx;
vm.createContext(ctx);
function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(html, rel), "utf8"), ctx);
}
load("js/lt.js");
load("js/engine/colours.js");
load("js/character/enums.js");
load("js/character/bodyEnums.js");
load("js/character/statusEffects.js");
load("js/character/player.js");
load("js/engine/game.js");
load("js/content/weather.js");
load("js/items/enchanting.js");

var LT = ctx.LT;
var p = LT.createNewPlayer();
LT.game.player = p;
p.location = { world: "DOMINION", place: "DOMINION_STREET", x: 8, y: 8 };
LT.game.startingYear = 2019;
LT.game.startingMonth = 7;
LT.game.startingDay = 16;

if (!LT.STATUS_EFFECTS.WEATHER_STORM) throw new Error("catalog missing storm");
if (!LT.STATUS_EFFECTS.WELL_RESTED) throw new Error("catalog missing well rested");

LT.startArrivalStorm();
LT.refreshConditionalStatusEffects(p);
if (!LT.hasStatusEffect(p, "WEATHER_STORM")) throw new Error("street storm missing, have " + Object.keys(p.statusEffects || {}));
if (LT.hasStatusEffect(p, "WEATHER_STORM_VULNERABLE")) throw new Error("arcane 10 should not be vulnerable");
if (!LT.stormDoublesEssences(p)) throw new Error("storm should double essences");

p.location.place = "LILAYA_HOME_ROOM_PLAYER";
p.location.world = "LILAYAS_HOUSE_FIRST_FLOOR";
LT.refreshConditionalStatusEffects(p);
if (!LT.hasStatusEffect(p, "WEATHER_STORM_PROTECTED")) throw new Error("house should protect from storm");
if (LT.hasStatusEffect(p, "WEATHER_STORM")) throw new Error("protected should replace street storm");
if (LT.stormDoublesEssences(p)) throw new Error("protected storm should not double essences");

p.arcane = 5;
p.location.place = "DOMINION_STREET";
p.location.world = "DOMINION";
LT.refreshConditionalStatusEffects(p);
if (!LT.hasStatusEffect(p, "WEATHER_STORM_VULNERABLE")) throw new Error("low arcane should be vulnerable");

p.arcane = 10;
p.location.world = "MUSEUM";
p.location.place = "MUSEUM_LOBBY";
LT.refreshConditionalStatusEffects(p);
if (!LT.hasStatusEffect(p, "WEATHER_PROLOGUE")) throw new Error("museum prologue weather missing");

p.location.world = "LILAYAS_HOUSE_FIRST_FLOOR";
p.location.place = "LILAYA_HOME_ROOM_PLAYER";
LT.setWeatherInSeconds("CLEAR", 1000);
LT.refreshConditionalStatusEffects(p);
if (!LT.hasStatusEffect(p, "WEATHER_CLEAR")) throw new Error("clear skies missing");

var beforeMax = LT.maxHealthOf(p);
LT.applySleepEffect(p, 60);
if (!LT.hasStatusEffect(p, "WELL_RESTED")) throw new Error("sleep did not apply well rested");
if (LT.maxHealthOf(p) !== beforeMax + 10) throw new Error("well rested health " + LT.maxHealthOf(p) + " vs " + (beforeMax + 10));
if (p.statusEffects.WELL_RESTED.secondsRemaining !== 10 * 3600 + 3600) throw new Error("well rested duration " + p.statusEffects.WELL_RESTED.secondsRemaining);
LT.tickWorldStatusEffects(p, 3600);
if (p.statusEffects.WELL_RESTED.secondsRemaining !== 10 * 3600) throw new Error("after rest hour remaining " + p.statusEffects.WELL_RESTED.secondsRemaining);

LT.applyStatus(p, "FLASH", 1);
if (!LT.hasStatusEffect(p, "FLASH")) throw new Error("combat flash missing");
if (LT.apPenalty(p) !== 1) throw new Error("flash AP penalty missing");
LT.clearStatuses(p);
if (LT.hasStatusEffect(p, "FLASH")) throw new Error("combat clear left flash");
if (!LT.hasStatusEffect(p, "WELL_RESTED")) throw new Error("combat clear wiped well rested");

LT.applySexEndStatusEffects(p, false);
if (!LT.hasStatusEffect(p, "FRUSTRATED_NO_ORGASM")) throw new Error("frustrated missing");
LT.applySexEndStatusEffects(p, true);
if (LT.hasStatusEffect(p, "FRUSTRATED_NO_ORGASM")) throw new Error("orgasm should clear frustrated");
if (!LT.hasStatusEffect(p, "RECOVERING_AURA")) throw new Error("recovering aura missing");
var blocked = LT.awardOrgasmEssences();
if (blocked) throw new Error("recovering aura should block orgasm essences");

LT.removeStatusEffect(p, "RECOVERING_AURA");
LT.setWeatherInSeconds("MAGIC_STORM", 18000);
p.location.place = "DOMINION_STREET";
p.location.world = "DOMINION";
LT.refreshConditionalStatusEffects(p);
LT.game.flags.essenceOrgasmDiscovered = true;
var before = p.essences || 0;
LT.awardOrgasmEssences();
if ((p.essences || 0) <= before) throw new Error("orgasm essences not awarded");
if ((p.essences || 0) - before < 2) throw new Error("storm should at least double minimum gain");

var saved = LT.serializeStatusEffects(p);
var p2 = LT.createNewPlayer();
LT.applySavedStatusEffects(p2, saved);
if (!LT.hasStatusEffect(p2, "WELL_RESTED")) throw new Error("save did not restore well rested");

console.log("ok status first loop");
