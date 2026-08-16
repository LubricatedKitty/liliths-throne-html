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
if (desc.indexOf("lipstick") < 0) throw new Error("selfie missing makeup");
if (desc.indexOf("ear") < 0) throw new Error("selfie missing piercing");
if (desc.indexOf("hearts") < 0) throw new Error("selfie missing tattoo");
console.log("ok appearance", Object.keys(p.makeup).length, "makeup slots");
