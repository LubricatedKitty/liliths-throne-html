/* node "Liliths Throne HTML/tools/smoke_oaken_petra.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var context = {
  console: console,
  window: { allGrids: {} },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    ITEMS: {},
    Gender: { FEMALE: { hasVagina: true, hasBreasts: true, feminine: true } },
    Colour: { FEMININE: "#f6a", GENERIC_GOOD: "#6c6", GENERIC_MINOR_GOOD: "#8c6", ATTRIBUTE_LUST: "#f6a" },
    game: {
      started: true,
      secondsPassed: 19 * 3600,
      player: { money: 20000, items: [], location: { world: "KITTY_OAKEN_GLADE", place: "KITTY_OAKEN_DINING", x: 2, y: 1 } },
      flags: {},
      npcs: {},
      textStart: "",
      setContent: function (id) { this._node = id; },
      advanceTime: function (s) { this.secondsPassed += s; },
    },
  },
};
context.window.LT = context.LT;
context.window.document = context.document;
context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.parse = function (s) {
  return String(s || "").replace(/\[petra\.speech\(([^\]]*)\)\]/g, '"$1"');
};
context.LT.parseFromXML = function (p, t) {
  var pack = context.LT.TEXT[p] || {};
  return context.LT.parse(pack[t] || t);
};
context.LT.withParseTargets = function (m, fn) { return fn(); };
context.LT.incrementMoney = function (d) { context.LT.game.player.money += d; return ""; };
context.LT.getMoney = function () { return context.LT.game.player.money; };
context.LT.incrementAffection = function (n, a) { n.affection = (n.affection || 0) + a; return ""; };
context.LT.incrementHealth = function () { return 0; };
context.LT.hourOfDay = function () { return 19; };
context.LT.markCharacterEncountered = function () {};
context.LT.refreshVitals = function (n) { return n; };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.travelResponses = function () { return []; };
context.LT.enterWorld = function (g, p, c) {
  context.LT.game.player.location = { world: g, place: p || "", x: c && c.x, y: c && c.y };
};

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyOakenGladeRestaurant/KittyOakenGladeRestaurant.js");
load("mods/KittyOakenGladePetra/KittyOakenGladePetra.js");

var LT = context.LT;
var api = LT.kittyOakenPetra;
assert(api, "API");
assert(LT.kittyOakenGlade, "restaurant still loaded");
assert(LT.hasNode("kitty.oaken.petra") && LT.hasNode("kitty.oaken.petraWine") && LT.hasNode("kitty.oaken.petraCover") && LT.hasNode("kitty.oaken.petraSex"), "petra nodes");

var p = api.ensurePetra();
assert(p && p.id === "petra" && p.name === "Petra" && /doe|deer/i.test(p.fullRace + p.raceName), "Petra Vale");
assert((p.affection || 0) === 0, "starts at 0");

var dining = LT.getNode("place.KITTY_OAKEN_DINING");
var titles = dining.getResponses().map(function (r) { return r && r.title; });
assert(titles.indexOf("Talk to Petra") >= 0, "dining Talk to Petra");
assert(/Petra Vale/.test(dining.getContent()), "dining mentions Petra");
assert(LT.getNode("place.KITTY_OAKEN_FOYER").getResponses().some(function (r) { return r && r.title === "Talk to Petra"; }), "foyer talk");
assert(LT.getNode("place.KITTY_OAKEN_KITCHEN").getResponses().some(function (r) { return r && r.title === "Talk to Petra"; }), "kitchen talk");

api.talk();
assert(api.flags().met && api.flags().talks === 1, "first talk");
assert(api.likeOf() === 4, "meet +4");
assert(/Petra/.test(LT.game.textStart) && LT.game.textStart.indexOf("[petra.speech") < 0, "speech parsed");

api.talk();
assert(api.flags().talks === 2 && api.likeOf() === 6, "second talk +2");
var hub = LT.getNode("kitty.oaken.petra").getResponses().map(function (r) { return r.title; });
assert(hub.indexOf("Help with the wine list") >= 0, "wine unlocks after 2 talks");
assert(hub.indexOf("Cover a table") < 0, "cover still locked");

assert(!api.doWine(), "wine event");
assert(api.flags().wine && api.likeOf() === 11, "wine +5");
assert(api.doWine(), "wine is one-shot");

api.talk();
hub = LT.getNode("kitty.oaken.petra").getResponses().map(function (r) { return r.title; });
assert(hub.indexOf("Cover a table") >= 0, "cover unlocks after 3 talks");
var money = LT.getMoney();
assert(!api.doCover(), "cover event");
assert(api.flags().cover && LT.getMoney() === money + 40, "cover tip");
assert(api.doCover(), "cover is one-shot");

money = LT.getMoney();
var t0 = LT.game.secondsPassed;
assert(!api.helpFloor(), "help floor");
assert(LT.getMoney() === money + 50, "help tip");
assert(LT.game.secondsPassed === t0 + 30 * 60, "half hour");
assert(api.helpFloor(), "help once a day");

LT.kittyOakenGlade.flags().step = "done";
assert(api.talkTag() === "TALK_DONE", "saved-restaurant line");

api.likePetra(20);
assert(api.likeOf() >= api.AFF_SEX, "sex gate reachable");
hub = LT.getNode("kitty.oaken.petra").getResponses().map(function (r) { return r.title; });
assert(hub.indexOf("Ask if she is off the clock") >= 0, "sex response");

var sex = LT.getNode("kitty.oaken.petraSex").getContent();
assert(/cellar/i.test(sex) && sex.indexOf("[petra.speech") < 0, "cellar scene parsed");
assert(sex.indexOf("Vesper takes off her spectacles") < 0, "not Vesper's office scene");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittyOakenGladePetra"; }), "mod menu");

var modText = fs.readFileSync(path.join(root, "mods/KittyOakenGladePetra/KittyOakenGladePetra.mod"), "utf8");
assert(/Depends On:\s*KittyOakenGladeRestaurant\.mod/.test(modText), "Depends On restaurant");
assert(/Add Boot:/.test(modText) && !/Add Javascript:/.test(modText), "pattern B boot only");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL OAKEN PETRA SMOKES PASSED");
