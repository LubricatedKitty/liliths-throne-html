/* node tools/smoke_appearance.js */
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
load("js/character/body.js");
load("js/character/player.js");
load("js/character/appearance.js");
load("js/character/npcs.js");
load("js/character/npcBodies.js");
load("js/engine/response.js");
load("js/content/nodes.js");
load("js/content/advancedAppearance.js");

var LT = ctx.LT;
var p = LT.createNewPlayer();
if (!p.makeup || !p.makeup.MAKEUP_LIPSTICK) throw new Error("no makeup");
if (p.makeup.MAKEUP_LIPSTICK.colour !== "NONE") throw new Error("default lipstick");
p.makeup.MAKEUP_LIPSTICK.colour = "RED";
p.piercings.ear = true;
p.body.ear.pierced = true;
p.tattoos.STOMACH = { type: "hearts", name: "hearts", colour: "PINK", writing: "mine" };
p.body.pubicHair = "FOUR_NATURAL";
if (!LT.hasNode("creation.makeup")) throw new Error("no makeup node");
if (!LT.hasNode("creation.piercings")) throw new Error("no piercing node");
if (!LT.hasNode("creation.tattoos")) throw new Error("no tattoo node");
if (!LT.hasNode("creation.body-hair")) throw new Error("no body hair node");
if (!LT.hasNode("creation.tattoo-add")) throw new Error("no tattoo add node");
var desc = LT.describeBody(p);
["Overview", "Face", "Mouth", "Torso", "Chest", "Arms", "Legs", "Ass"].forEach(function (h) {
  if (desc.indexOf(h) < 0) throw new Error("missing section " + h);
});
if (desc.indexOf("painted red") < 0) throw new Error("selfie missing makeup");
if (desc.indexOf("pierced") < 0) throw new Error("selfie missing piercing");
if (desc.indexOf("hearts") < 0) throw new Error("selfie missing tattoo");
var info = LT.getCharacterInformationScreen(p, { perkTree: true });
if (info.indexOf("Appearance") < 0) throw new Error("info screen missing Appearance");
if (info.indexOf("Personality") < 0) throw new Error("info screen missing Personality");
if (info.indexOf("Stats") < 0) throw new Error("info screen missing Stats");
if (info.indexOf("Clothing") < 0) throw new Error("info screen missing Clothing");
if (info.indexOf("Lactation") < 0 && true) {
  /* lactation only appears when producing; breasts menu must still list it */
}
var breastsNode = LT.getNode("creation.breasts");
ctx.LT.game = { player: p, flags: {}, setContent: function () {}, currentNode: { id: "creation.breasts" } };
if (breastsNode.getContent().indexOf("Lactation") < 0) throw new Error("creator breasts missing lactation");
p.setGender(LT.Gender.MALE);
p.applyHumanDefaults();
ctx.LT.game.player = p;
var genNode = LT.getNode("creation.genitals");
if (genNode.getContent().indexOf("Cum production") < 0) throw new Error("creator penis missing cum production");
var lilaya = { id: "lilaya", name: "Lilaya", feminine: true, getName: function () { return "Lilaya"; }, isFeminine: function () { return true; } };
LT.ensureAppearance(lilaya);
var lDesc = LT.getBodyDescription(lilaya);
if (lDesc.indexOf("half-demon") < 0 && lDesc.indexOf("demon") < 0) throw new Error("Lilaya body missing race");
if (lDesc.indexOf("wings") < 0) throw new Error("Lilaya missing official wings");
if (lDesc.indexOf("don't know what her cock") < 0 && lDesc.indexOf("don't know what her pussy") < 0) {
  if (lDesc.indexOf("haven't seen") < 0) throw new Error("Lilaya genitals should start unknown");
}
var ashley = { id: "ashley", name: "Ashley", getName: function () { return "Ashley"; }, isFeminine: function () { return false; } };
LT.ensureAppearance(ashley);
if (LT.getBodyDescription(ashley).indexOf("concealed") < 0) throw new Error("Ashley should be race-concealed");
console.log("ok appearance", Object.keys(p.makeup).length, "makeup slots");
