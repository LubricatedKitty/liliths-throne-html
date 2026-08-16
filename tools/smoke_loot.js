/* node tools/smoke_loot.js */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var html = path.join(__dirname, "..");
var ctx = {
  window: { LT: {} },
  document: { addEventListener: function () {}, dispatchEvent: function () {} },
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
load("js/character/player.js");
load("js/items/items.js");
load("js/engine/game.js");
load("js/combat/loot.js");
load("js/items/enchanting.js");

var LT = ctx.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.money = 0;
LT.game.player.essences = 0;

if (LT.getExperienceFromVictory({ level: 3 }) !== 6) throw new Error("xp " + LT.getExperienceFromVictory({ level: 3 }));
if (LT.getLootMoney({ id: "brax", level: 10 }) !== 2500) throw new Error("brax money");
if (LT.getLootMoney({ id: "amber", level: 15 }) !== 5000) throw new Error("amber money");
if (LT.getLootEssenceDrops({ id: "brax" }) !== 8) throw new Error("brax essences");
if (LT.getLootItemId({ id: "brax", lootItems: [] }) != null) throw new Error("brax should drop no item");

var i;
var seen = {};
for (i = 0; i < 80; i++) {
  var id = LT.getLootItemId({ raceName: "cat", level: 2 });
  if (id) seen[id] = (seen[id] || 0) + 1;
}
if (!seen.innoxia_race_cat_felines_fancy) throw new Error("cat mugger never dropped feline drink");
if (!seen.ADDICTION_REMOVAL && !seen.FETISH_UNREFINED && !seen.DYE_BRUSH && !seen.innoxia_race_cat_felines_fancy) {
  throw new Error("no loot items");
}

var before = LT.game.player.money;
var html = LT.applyCombatVictoryLoot({ level: 2, raceName: "wolf", lootMoney: 40 });
if (LT.game.player.money !== before + 40) throw new Error("money not applied");
if (html.indexOf("experience") < 0) throw new Error("xp text missing");
if (LT.game.player.experience < 4) throw new Error("xp not applied");

console.log("ok loot", Object.keys(seen).join(","), "xp", LT.game.player.experience);
