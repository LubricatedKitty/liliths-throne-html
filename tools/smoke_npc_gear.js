/* node tools/smoke_npc_gear.js */
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
load("js/character/clothing.js");
load("js/items/items.js");
load("js/items/weapons.js");
load("js/items/weaponRuntime.js");
load("js/combat/loot.js");
load("js/character/npcGear.js");
load("js/engine/game.js");

var LT = ctx.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.wardrobe = [];
LT.game.player.items = [];
LT.game.player.weapons = [];

var mugger = {
  id: "alleyMugger",
  feminine: false,
  occupation: "mugger",
  raceName: "wolf-morph",
  fullRace: "wolf-boy",
  level: 2,
  gender: LT.Gender.MALE,
  isFeminine: function () { return false; },
};
LT.armMuggerFromOutfit(mugger, { dark: false, hasWeapon: true, knuckles: false, meleeId: "innoxia_pipe_pipe" });
LT.prepareNpcGear(mugger, { outfit: "MUGGER" });
if (!mugger.equipped || !Object.keys(mugger.equipped).length) throw new Error("mugger not dressed");
if (!mugger.equipped.torso && !mugger.equipped.leg) throw new Error("mugger missing core clothes");
if (!mugger.items || mugger.items.length < 2) throw new Error("mugger bag empty " + (mugger.items && mugger.items.length));
if (!LT.npcHasLoot(mugger)) throw new Error("hasLoot false");

var hooker = {
  id: "alleyMugger",
  feminine: true,
  occupation: "prostitute",
  raceName: "cat-morph",
  level: 1,
  gender: LT.Gender.FEMALE,
  isFeminine: function () { return true; },
};
LT.prepareNpcGear(hooker, { outfit: "PROSTITUTE" });
if (!hooker.equipped.foot) throw new Error("prostitute missing shoes");
if (!hooker.equipped.chest && !hooker.equipped.torso) throw new Error("prostitute missing top");

var worn = LT.npcEquippedList(mugger).length;
var bag = mugger.items.length;
var weps = (mugger.mainWeapon ? 1 : 0);
LT.stripNpc(mugger);
if (LT.npcEquippedList(mugger).length) throw new Error("strip left clothes");
if (LT.game.player.wardrobe.length !== worn) throw new Error("clothes not taken " + LT.game.player.wardrobe.length);
LT.takeAllNpcItems(mugger);
if (mugger.items.length) throw new Error("bag not emptied");
if (LT.game.player.items.length !== bag) throw new Error("items not taken");
if (mugger.mainWeapon) LT.takeNpcWeapon(mugger, "main");
if (weps && !LT.game.player.weapons.length) throw new Error("weapon not taken");

console.log("ok gear worn", worn, "bag", bag, "player clothes", LT.game.player.wardrobe.length);
