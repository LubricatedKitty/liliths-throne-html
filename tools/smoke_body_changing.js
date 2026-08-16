/* node tools/smoke_body_changing.js */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var html = path.join(__dirname, "..");
var ctx = {
  window: { LT: {} },
  document: { addEventListener: function () {}, dispatchEvent: function () {} },
  CustomEvent: function () {},
  localStorage: {
    _d: {},
    getItem: function (k) { return this._d[k] || null; },
    setItem: function (k, v) { this._d[k] = String(v); },
  },
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
load("js/content/bodyChanging.js");

var LT = ctx.LT;
var p = LT.createNewPlayer();

if (LT.isAbleToSelfTransform(p)) throw new Error("human should not self-TF");
var blocked = LT.getUnableToTransformDescription(p);
if (!/human/i.test(blocked)) throw new Error("expected human lock, got " + blocked);

p.raceName = "demon";
p.fullRace = "succubus";
p.body.subspecies = "DEMON";
if (!LT.isAbleToSelfTransform(p)) throw new Error("demon should self-TF: " + LT.getUnableToTransformDescription(p));
if (!LT.isDemonTFMenu(p)) throw new Error("demon TF menu flag");

LT.bodyChangingTarget = p;
if (!LT.applyBodyChangingAct("set:face.type:DEMON")) throw new Error("face act failed");
if (p.body.face.type !== "DEMON") throw new Error("face not DEMON");
if (!LT.applyBodyChangingAct("set:horn.type:DEMON")) throw new Error("horn act failed");
if (p.body.horn.type !== "DEMON" || p.body.horn.rows < 1) throw new Error("horn not grown");
if (!LT.applyBodyChangingAct("set:tail.type:DEMON")) throw new Error("tail act failed");
if (p.body.tail.type !== "DEMON" || p.body.tail.count < 1) throw new Error("tail not grown");
if (!LT.applyBodyChangingAct("set:wing.type:DEMON")) throw new Error("wing act failed");
if (p.body.wing.type !== "DEMON" || p.body.wing.size === "ZERO_NONEXISTENT") throw new Error("wings not grown");
if (!LT.applyBodyChangingAct("step:height:20:122:366")) throw new Error("height act failed");
if (p.body.height !== 188 && p.body.height !== p.heightCm) throw new Error("height " + p.body.height);
if (p.heightCm !== p.body.height) throw new Error("height not synced");
if (!LT.applyBodyChangingAct("set:penis.type:DEMON")) throw new Error("penis act failed");
if (!p.hasPenis()) throw new Error("demon penis should exist");
if (!LT.applyBodyChangingAct("toggle:penis.modifiers:KNOTTED")) throw new Error("knot act failed");
if (p.body.penis.modifiers.indexOf("KNOTTED") < 0) throw new Error("knot missing");
if (!LT.applyBodyChangingAct("toggle:penis.modifiers:FLARED")) throw new Error("flare act failed");
if (!LT.applyBodyChangingAct("toggle:penis.modifiers:TAPERED")) throw new Error("taper act failed");
if (p.body.penis.modifiers.indexOf("FLARED") >= 0) throw new Error("flare should drop when tapered");
if (!LT.applyBodyChangingAct("set:leg.configuration:ARACHNID")) throw new Error("arachnid act failed");
if (!LT.hasSpinneret(p)) throw new Error("arachnid should grant spinneret");

if (!LT.hasNode("body.core") || !LT.hasNode("body.eyes") || !LT.hasNode("body.hair") || !LT.hasNode("body.head")) {
  throw new Error("missing core pages");
}
if (!LT.hasNode("body.ass") || !LT.hasNode("body.breasts") || !LT.hasNode("body.vagina") || !LT.hasNode("body.penis")) {
  throw new Error("missing sex pages");
}
if (!LT.hasNode("body.crotch") || !LT.hasNode("body.spinneret") || !LT.hasNode("body.save")) {
  throw new Error("missing extra pages");
}

var desc = LT.describeBody(p);
if (desc.indexOf("horns") < 0 || desc.indexOf("tail") < 0) throw new Error("selfie missing racial features");

console.log("ok body changing", p.body.face.type, p.body.horn.type, p.body.tail.type, p.body.wing.type);
