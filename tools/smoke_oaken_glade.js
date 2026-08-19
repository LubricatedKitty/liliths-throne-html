/* node "Liliths Throne HTML/tools/smoke_oaken_glade.js" */
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
      player: { money: 20000, items: [], location: { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_RESTAURANT", x: 9, y: 1 } },
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
context.LT.hasNode = function () { return false; };
context.LT.getNode = function (id) { throw new Error(id); };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.parse = function (s) { return String(s || ""); };
context.LT.parseFromXML = function (p, t) { return (context.LT.TEXT[p] && context.LT.TEXT[p][t]) || t; };
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
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyOakenGladeRestaurant/KittyOakenGladeRestaurant.js");

var LT = context.LT;
var api = LT.kittyOakenGlade;
assert(api, "API");
assert(context.window.allGrids.KITTY_OAKEN_GLADE.length >= 12, "larger restaurant grid");
assert(LT.hasNode("place.KITTY_OAKEN_FOYER"), "foyer");
assert(LT.hasNode("place.SHOPPING_ARCADE_RESTAURANT"), "arcade door node");
assert(LT.hasNode("kitty.oaken.vesperSex") && LT.hasNode("kitty.oaken.patronSex"), "sex intros");

var v = LT.ensureVesper();
assert(v && v.id === "vesper" && (v.affection || 0) === 0, "vesper starts at 0 like");
api.flags().step = "helping";
api.flags().debt = 5000;
api.flags().lastWorkDay = -1;
api.flags().hired = true;
var money = LT.game.player.money;
var hook = api.workEvening();
assert(LT.game.player.money === money + 25, "wage paid");
assert(v.affection === 2, "work +2 like");
assert(api.flags().debt === 4000, "lease work still knocks 1000");
assert(api.flags().lastWorkDay >= 0, "one shift a day stamped");
assert(hook === null || hook === "vesper" || hook === "patron", "sex roll result");

api.dineWithOwner();
assert(v.affection === 7, "dine with owner +5");

v.affection = 8;
assert(api.AFF_PATRON === 10 && api.AFF_OWNER === 25, "gates");
var patron = api.makePatron();
assert(patron && patron.id === "oakpatron" && patron.occupation === "diner", "random patron");

var menus = LT.listModMenus();
assert(menus.some(function (m) { return m.id === "KittyOakenGladeRestaurant"; }), "mod menu");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL OAKEN GLADE SMOKES PASSED");
