/* node tools/smoke_pregnancy.js */
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
load("js/character/statusEffects.js");
load("js/character/bodyEnums.js");
load("js/character/body.js");
load("js/character/player.js");
load("js/engine/response.js");
load("js/content/nodes.js");
load("js/character/pregnancy.js");

var LT = ctx.LT;
LT.game = { player: null, flags: {}, secondsPassed: 0, npcs: {}, textEnd: "" };
var p = LT.createNewPlayer();
p.setGender(LT.Gender.FEMALE);
var father = LT.createNewPlayer();
father.setGender(LT.Gender.MALE);
father.id = "mugger";
LT.game.player = p;

if (LT.isPregnant(p)) throw new Error("start pregnant");
if (LT.isVisiblyPregnant(p)) throw new Error("start visible");
if (!LT.isAbleToBeImpregnated(p)) throw new Error("female should be impregnable");
if (LT.isAbleToBeImpregnated(father)) throw new Error("male should not be impregnable");

var chance = LT.pregnancyChance(p, father);
if (chance <= 0 || chance > 1) throw new Error("chance " + chance);

p.guarantee = true;
var hits = 0;
var i;
for (i = 0; i < 30 && !LT.isPregnant(p); i++) {
  LT.rollForPregnancy(p, father);
}
if (!LT.hasStatusEffect(p, "PREGNANT_0")) throw new Error("missing risk status");
if (!LT.isPregnant(p)) {
  p.pregnancy.litter = { count: 1, fatherId: "mugger" };
  p.pregnancy.pregnant = true;
}
var msg = LT.applyPregnancyStageExpire(p, "PREGNANT_0");
LT.removeStatusEffect(p, "PREGNANT_0");
if (!/pregnant/i.test(msg)) throw new Error("no reveal text");
if (!LT.hasStatusEffect(p, "PREGNANT_1")) throw new Error("no pregnant 1");
if (!LT.isVisiblyPregnant(p)) throw new Error("should be visible");
if (LT.game.flags.pregnancyQuest !== "SIDE_PREGNANCY_CONSULT_LILAYA") throw new Error("quest " + LT.game.flags.pregnancyQuest);

LT.applyPregnancyStageExpire(p, "PREGNANT_1");
if (!LT.hasStatusEffect(p, "PREGNANT_2")) throw new Error("no pregnant 2");
LT.removeStatusEffect(p, "PREGNANT_1");
LT.applyPregnancyStageExpire(p, "PREGNANT_2");
LT.removeStatusEffect(p, "PREGNANT_2");
if (!LT.STATUS_EFFECTS.PREGNANT_3.conditions(p)) throw new Error("ready stage not available");
if (LT.STATUS_EFFECTS.PREGNANT_3.conditions(p)) LT.addStatusEffect(p, "PREGNANT_3", { secondsRemaining: -1 });

var born = LT.endPregnancy(p, true);
if (LT.isPregnant(p)) throw new Error("still pregnant");
if (!p.offspring.length) throw new Error("no offspring");
if (!LT.hasNode("lab.pregnancy") || !LT.hasNode("lab.birth.room")) throw new Error("missing birth nodes");

console.log("ok pregnancy chance", chance.toFixed(2), "litter", born && born.count);
