/* node tools/smoke_body.js */
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
load("js/character/body.js");
load("js/character/player.js");

var LT = ctx.LT;
var p = LT.createNewPlayer();
if (!p.body) throw new Error("no body");
if (p.body.face.type !== "HUMAN") throw new Error("face " + p.body.face.type);
if (p.body.vagina.type === "NONE") throw new Error("female should have vagina");
if (p.body.penis.type !== "NONE") throw new Error("default female penis");
if (p.body.horn.type !== "NONE") throw new Error("human horns");
if (p.body.tail.type !== "NONE") throw new Error("human tail");
if (p.body.wing.type !== "NONE") throw new Error("human wings");
if (!p.pregnancy) throw new Error("no pregnancy stub");
if (!p.fetishes) throw new Error("no fetishes map");
if (!p.piercings || p.piercings.ear == null) throw new Error("no piercings");
if (!LT.Gender.F_V_B_FEMALE) throw new Error("official female gender missing");
if (LT.Gender.FEMALE !== LT.Gender.F_V_B_FEMALE) throw new Error("FEMALE alias");

p.setGender(LT.Gender.MALE);
if (!p.hasPenis()) throw new Error("male should have penis");
if (p.hasVagina()) throw new Error("male should not have vagina after reset");
if (p.body.penis.type === "NONE") throw new Error("male body penis NONE");

p.body.horn.type = "DEMON";
p.body.horn.length = 15;
p.body.tail.type = "DEMON";
p.body.wing.type = "DEMON";
p.body.wing.size = "THREE_AVERAGE";
if (p.body.horn.type !== "DEMON") throw new Error("demon horn not stored");

console.log("ok body parts", Object.keys(p.body).length, "horn", p.body.horn.type);
