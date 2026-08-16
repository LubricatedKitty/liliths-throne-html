/* node tools/smoke_enchant.js */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var html = path.join(__dirname, "..");
var ctx = {
  window: { LT: {} },
  document: { addEventListener: function () {}, dispatchEvent: function () {} },
  CustomEvent: function () {},
};
ctx.window.LT = ctx.LT = { TEXT: {}, Colour: { GENERIC_ARCANE: "#f", GENERIC_GOOD: "#0", GENERIC_BAD: "#f", MONEY: "#f" } };
vm.createContext(ctx);
function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(html, rel), "utf8"), ctx);
}
load("js/lt.js");
ctx.LT.Colour = ctx.LT.Colour || {};
load("js/engine/colours.js");
load("js/character/enums.js");
load("js/character/bodyEnums.js");
load("js/character/player.js");
load("js/character/clothing.js");
load("js/items/items.js");
load("js/items/weapons.js");
load("js/items/weaponRuntime.js");
load("js/items/enchanting.js");
load("js/items/tfApply.js");

ctx.LT.game = { flags: {}, player: ctx.LT.createNewPlayer() };
var p = ctx.LT.game.player;
p.essences = 40;
var shirt = ctx.LT.makeClothing("tshirt");
p.wardrobe = [shirt];

var effect = ctx.LT.itemEffect("CLOTHING", "CLOTHING_MAJOR_ATTRIBUTE", "STRENGTH", "MINOR_BOOST", 0);
if (ctx.LT.itemEffectCost(effect) < 2) throw new Error("cost too low");
var result = ctx.LT.craftEnchantedItem(shirt, [effect]);
if (result.error) throw new Error(result.error);
if (!result.item.effects || result.item.effects.length !== 1) throw new Error("missing effects");
ctx.LT.replaceCarried(p, shirt.uid, result.item);
ctx.LT.equipFromWardrobe(p, result.item.uid);
if (ctx.LT.effectivePhysique(p) !== (p.physique || 10) + 1) throw new Error("worn bonus missing " + ctx.LT.effectivePhysique(p));
ctx.LT.unequipToWardrobe(p, result.item.slot);
if (ctx.LT.effectivePhysique(p) !== (p.physique || 10)) throw new Error("bonus stuck after unequip");

var sealed = ctx.LT.itemEffect("CLOTHING", "CLOTHING_SPECIAL", "CLOTHING_SEALING", "MINOR_BOOST", 0);
p.essences = 40;
var sock = ctx.LT.makeClothing("socks");
p.wardrobe.push(sock);
var sealedItem = ctx.LT.craftEnchantedItem(sock, [sealed]).item;
ctx.LT.replaceCarried(p, sock.uid, sealedItem);
ctx.LT.equipFromWardrobe(p, sealedItem.uid);
p.essences = 0;
if (ctx.LT.unequipToWardrobe(p, sealedItem.slot) !== false) throw new Error("sealed clothing came off for free");
p.essences = 5;
if (ctx.LT.unequipToWardrobe(p, sealedItem.slot) === false) throw new Error("could not break seal with 5 essences");

var q = ctx.LT.startEnchantmentQuest();
if (ctx.LT.game.flags.enchantmentQuest !== "SIDE_ENCHANTMENTS_LILAYA_HELP") throw new Error("quest not started");
if (q.indexOf("Essences") < 0) throw new Error("quest banner missing");
ctx.LT.completeEnchantmentQuest();
if (!ctx.LT.canEnchant()) throw new Error("cannot enchant after quest");

ctx.LT.game.flags = {};
var combatHtml = ctx.LT.awardCombatEssences({ name: "Kara", level: 2 });
if (combatHtml.indexOf("shimmering pink") < 0) throw new Error("combat discovery text missing");
if (ctx.LT.game.flags.enchantmentQuest !== "SIDE_ENCHANTMENTS_LILAYA_HELP") throw new Error("combat did not start quest");

p.essences = 80;
var drink = ctx.LT.makeItem("innoxia_race_cat_felines_fancy");
p.items = [drink];
var racial = ctx.LT.itemEffect("RACIAL", "TF_CORE", "TF_MOD_SIZE", "BOOST", 0);
var potion = ctx.LT.craftEnchantedItem(drink, [racial]);
if (potion.error) throw new Error(potion.error);
if (potion.item.kind !== "tf") throw new Error("potion kind");
var startH = p.heightCm;
ctx.LT.applyRacialEffects(p, potion.item);
if (p.heightCm !== startH + 5) throw new Error("height boost " + p.heightCm + " vs " + (startH + 5));
var grow = ctx.LT.itemEffect("RACIAL", "TF_PENIS", "TF_MOD_SIZE", "MINOR_BOOST", 0);
p.penisPresent = false;
ctx.LT.applyRacialEffect(p, grow, drink);
if (!p.hasPenis()) throw new Error("penis not added");
var remove = ctx.LT.itemEffect("RACIAL", "TF_PENIS", "REMOVAL", "MINOR_BOOST", 0);
ctx.LT.applyRacialEffect(p, remove, drink);
if (p.hasPenis()) throw new Error("penis not removed");

p.essences = 40;
var pipe = ctx.LT.makeWeapon("innoxia_pipe_pipe");
if (!pipe) throw new Error("missing pipe weapon");
p.weapons = [pipe];
var wepFx = ctx.LT.itemEffect("WEAPON", "CLOTHING_MAJOR_ATTRIBUTE", "STRENGTH", "MINOR_BOOST", 0);
var wep = ctx.LT.craftEnchantedItem(pipe, [wepFx]);
if (wep.error) throw new Error(wep.error);
ctx.LT.replaceCarried(p, pipe.uid, wep.item);
var baseP = ctx.LT.effectivePhysique(p);
ctx.LT.equipWeapon(p, wep.item.uid, "main");
if (ctx.LT.effectivePhysique(p) !== baseP + 1) throw new Error("weapon bonus missing " + ctx.LT.effectivePhysique(p));
ctx.LT.unequipWeapon(p, "main");
if (ctx.LT.effectivePhysique(p) !== baseP) throw new Error("weapon bonus stuck");

console.log("ok cost", result.cost, "essences", p.essences, "height", p.heightCm);
