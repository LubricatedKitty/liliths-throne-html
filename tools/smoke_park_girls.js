/* node "Liliths Throne HTML/tools/smoke_park_girls.js" */
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
  window: { allGrids: {}, grid: { gridName: "DOMINION", playerPosition: { x: 6, y: 1 } } },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    Colour: { FEMININE: "#f6a", GENERIC_GOOD: "#6c6", GENERIC_MINOR_GOOD: "#8c6" },
    Gender: { FEMALE: { hasVagina: true, hasBreasts: true, feminine: true } },
    game: {
      started: true,
      secondsPassed: 10 * 3600,
      player: { money: 500, health: 30, location: { world: "DOMINION", place: "DOMINION_PARK", x: 6, y: 1 } },
      flags: {},
      npcs: {},
      textStart: "",
      currentNode: { id: "place.generic" },
      setContent: function (id) { this._node = id; },
      advanceTime: function (s) { this.secondsPassed += s; },
    },
  },
};
context.window.LT = context.LT;
context.window.document = context.document;
context.grid = context.window.grid;

context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.parse = function (s) {
  return String(s || "")
    .replace(/\[(amelia|emily|destiny|joan)\.speech\(([^\]]*)\)\]/g, '"$2"')
    .replace(/\[(amelia|emily|destiny|joan)\.fullRace\]/g, "girl");
};
context.LT.parseFromXML = function (p, t) {
  var pack = context.LT.TEXT[p] || {};
  return context.LT.parse(pack[t] || t);
};
context.LT.withParseTargets = function (m, fn) { return fn(); };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.setResponses = function (list) {
  context.LT._lastResponses = list || [];
  return context.LT._lastResponses;
};
context.LT.incrementAffection = function (n, a) { n.affection = (n.affection || 0) + a; };
context.LT.incrementHealth = function (ch, n) { ch.health = (ch.health || 0) + n; };
context.LT.incrementMana = function (n) { context.LT.game.player.mana = (context.LT.game.player.mana || 0) + n; };
context.LT.markCharacterEncountered = function () {};
context.LT.refreshVitals = function (n) { return n; };
context.LT.defineNode({
  id: "place.generic",
  getContent: function () { return "<p>There are several large parks found throughout Dominion.</p>"; },
  getResponses: function () { return []; },
});
context.LT.defineNode({
  id: "phone.quests",
  getContent: function () { return "<p>You don't have any active quests.</p>"; },
});

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyParkGirls/KittyParkGirls.js");

var LT = context.LT;
var api = LT.kittyParkGirls;
assert(api, "API");
assert(api.GIRLS.length === 4, "four girls");
api.ensureAll();
assert(LT.game.npcs.amelia && LT.game.npcs.emily && LT.game.npcs.destiny && LT.game.npcs.joan, "npcs");
assert(LT.game.npcs.amelia.location.x === 6 && LT.game.npcs.joan.location.x === 6, "north park pair");
assert(LT.game.npcs.emily.location.x === 14 && LT.game.npcs.emily.location.y === 4, "Emily east");
assert(LT.game.npcs.destiny.location.y === 16, "Destiny south");

function titles() {
  return LT.getNode("place.generic").getResponses().map(function (r) { return r && r.title; });
}
function go(x, y, place) {
  LT.game.player.location = { world: "DOMINION", place: place || "DOMINION_PARK", x: x, y: y };
}

go(6, 1);
var t = titles();
assert(t.indexOf("Talk to Amelia") >= 0 && t.indexOf("Talk to Joan") >= 0, "north: Amelia + Joan");
assert(t.indexOf("Talk to Emily") < 0 && t.indexOf("Talk to Destiny") < 0, "north hides the others");
assert(/Amelia/.test(LT.getNode("place.generic").getContent()) && /Joan/.test(LT.getNode("place.generic").getContent()), "north present line");

go(14, 4);
t = titles();
assert(t.indexOf("Talk to Emily") >= 0 && t.indexOf("Talk to Amelia") < 0, "east: Emily");
go(6, 16);
t = titles();
assert(t.indexOf("Talk to Destiny") >= 0, "south: Destiny");

go(10, 10, "DOMINION_PLAZA");
assert(!titles().some(function (x) { return x && /Talk to /.test(x); }), "no park girls on plaza");

go(6, 1);
api.setActive("amelia");
api.accept("amelia");
assert(api.flags().amelia.step === "run", "Amelia accepted");
assert(!api.doActivity("amelia"), "first jog");
assert(api.flags().amelia.runs === 1 && api.flags().amelia.step === "run", "one jog");
assert(api.doActivity("amelia"), "jog once a day");
LT.game.secondsPassed += 86400;
assert(!api.doActivity("amelia"), "second jog");
assert(api.flags().amelia.step === "done", "Amelia done");

api.setActive("emily");
api.accept("emily");
assert(api.findBook(), "book not at north");
go(6, 16);
t = titles();
assert(t.indexOf("Search the benches") >= 0, "search benches on south");
assert(!api.findBook(), "found book");
assert(api.findBook(), "book one-shot");
go(14, 4);
assert(!api.returnItem("emily"), "return book");
assert(api.flags().emily.step === "done", "Emily done");
assert(!api.doActivity("emily"), "read together");

api.setActive("destiny");
api.accept("destiny");
LT.game.secondsPassed += 86400;
assert(!api.doActivity("destiny"), "yoga 1");
LT.game.secondsPassed += 86400;
assert(!api.doActivity("destiny"), "yoga 2");
assert(api.flags().destiny.step === "done", "Destiny done");

api.setActive("joan");
api.accept("joan");
go(6, 1);
assert(api.findDog(), "dog not at north");
go(14, 4);
assert(titles().indexOf("Call for Pip") >= 0, "call Pip on east");
assert(!api.findDog(), "found Pip");
go(6, 1);
assert(!api.returnItem("joan"), "return Pip");
assert(api.flags().joan.step === "done", "Joan done");

var quests = LT.getNode("phone.quests").getContent();
assert(/Amelia/.test(quests) && /Emily/.test(quests) && /Destiny/.test(quests) && /Joan/.test(quests), "phone quests");

assert(LT.hasNode("kitty.park.girl") && LT.hasNode("kitty.park.findBook") && LT.hasNode("kitty.park.findDog"), "nodes");
var meet = LT.getNode("kitty.park.girl");
api.setActive("amelia");
assert(meet.getContent().indexOf("[amelia.speech") < 0, "speech parsed");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittyParkGirls"; }), "mod menu");

var modText = fs.readFileSync(path.join(root, "mods/KittyParkGirls/KittyParkGirls.mod"), "utf8");
assert(/Add Boot:/.test(modText) && !/Add Javascript:/.test(modText), "pattern B boot only");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL PARK GIRLS SMOKES PASSED");
