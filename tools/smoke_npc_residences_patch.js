/* node "Liliths Throne HTML/tools/smoke_npc_residences_patch.js" */
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
  window: {
    allGrids: {
      DOMINION: [
        { x: 13, y: 3, location: { placeType: "DOMINION_STREET" } },
        { x: 10, y: 8, location: { placeType: "DOMINION_BOULEVARD" } },
      ],
    },
    LT_GRID_META: {},
    grid: { gridName: "DOMINION", playerPosition: { x: 13, y: 3 } },
  },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function () { return null; }, setItem: function () {} },
  LT: {
    TEXT: {},
    Colour: { FEMININE: "#f6a", MASCULINE: "#6af", GENERIC_GOOD: "#6c6", GENERIC_MINOR_GOOD: "#8c6", GENERIC_BAD: "#c66" },
    HOUSE_UPGRADES: {
      GUEST_ROOM: { id: "GUEST_ROOM", name: "Guest Room", cap: 1, home: true },
      SLAVE_ROOM: { id: "SLAVE_ROOM", name: "Slave's Room", cap: 1, home: true },
    },
    game: {
      started: true,
      secondsPassed: 12 * 3600,
      player: { money: 500000, companions: [], location: { world: "DOMINION", place: "DOMINION_STREET", x: 13, y: 3 } },
      flags: {
        houseRooms: { "LILAYAS_HOUSE:2,2": { u: "GUEST_ROOM" } },
        ownedSlaves: [],
        hasSlaverLicense: true,
        slaveryQuest: "complete",
      },
      npcs: {},
      textStart: "",
      currentNode: { id: "kitty.npc.more" },
      setContent: function (id) { this._node = id; },
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
context.LT.parse = function (s) { return String(s || ""); };
context.LT.parseFromXML = function (p, t) { return (context.LT.TEXT[p] && context.LT.TEXT[p][t]) || t; };
context.LT.withParseTargets = function (m, fn) { return fn(); };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.setResponses = function (list) { context.LT._lastResponses = list; };
context.LT.travelResponses = function () { return []; };
context.LT.enterWorld = function (g, p, c) {
  context.LT.game.player.location = { world: g, place: p || "", x: c && c.x, y: c && c.y };
};
context.LT.houseRooms = function () { return context.LT.game.flags.houseRooms; };
context.LT.roomUpgradeAt = function (key) {
  var rec = context.LT.game.flags.houseRooms[key];
  return rec ? context.LT.HOUSE_UPGRADES[rec.u] : null;
};
context.LT.parseRoomKey = function (key) {
  var parts = String(key).split(":");
  var xy = (parts[1] || "0,0").split(",");
  return { world: parts[0], x: parseInt(xy[0], 10), y: parseInt(xy[1], 10) };
};
context.LT.slavesInRoom = function () { return []; };
context.LT.ownedSlaves = function () { return context.LT.game.flags.ownedSlaves; };
context.LT.findSlave = function () { return null; };
context.LT.takeOwnership = function () { return null; };
context.LT.canManageHouse = function () { return true; };
context.LT.incrementAffection = function (n, a) { n.affection = (n.affection || 0) + a; return ""; };
context.LT.npcAtCurrentTile = function () { return []; };
context.LT.getMoney = function () { return context.LT.game.player.money; };
context.LT.incrementMoney = function (d) { context.LT.game.player.money += d; return ""; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.isEmptyHouseRoom = function () { return false; };

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyResidencesExpansion/residenceLayouts.js");
load("mods/KittyResidencesExpansion/KittyResidencesExpansion.js");
load("mods/KittyNPCExpansion/KittyNPCExpansion.js");
load("mods/KittyNPCResidencesExpansionPatch/KittyNPCResidencesExpansionPatch.js");

var LT = context.LT;
assert(LT.kittyNpcResidencesPatch, "patch API");
assert(LT.kittyNpcHousePicker() === "kitty.npc.housePick", "picker hook");
assert(LT.hasNode("kitty.npc.housePick"), "picker node");

var ash = LT.kittyResidences.byId("ashcourt");
assert(!LT.kittyResidences.buy(ash), "buy Ashcourt");
assert(LT.kittyResidences.accessible("ashcourt"), "Ashcourt owned");

var dests = LT.kittyNpcResidencesPatch.destinations();
var names = dests.map(function (d) { return d.id; });
assert(names.indexOf("lilaya") >= 0, "Lilaya listed");
assert(names.indexOf("ashcourt") >= 0, "Ashcourt listed");
assert(names.indexOf("finchwalk") < 0, "flat has no guest room");
assert(names.indexOf("westmead") < 0, "unbought west croft omitted");

var n = { id: "guest1", name: "Dana", affection: 40, housed: false, getName: function () { return "Dana"; } };
LT.game.npcs.guest1 = n;
LT.kittyNpcExpansion.setCurrent(n);
var houseBtn = LT.kittyNpcExpansion.moreList(n).filter(function (r) { return r.title === "Send to house"; })[0];
assert(houseBtn && houseBtn.nextDialogue === "kitty.npc.housePick", "Send to house opens picker");
assert(!houseBtn.disabled, "Send to house enabled when rooms exist");

var pick = LT.getNode("kitty.npc.housePick").getResponses().map(function (r) { return r.title; });
assert(pick.indexOf("Lilaya's Home") >= 0 && pick.indexOf("Ashcourt House") >= 0, "picker names both homes");

var ashDest = dests.filter(function (d) { return d.id === "ashcourt"; })[0];
assert(!LT.kittyNpcExpansion.sendHome(n, ashDest.keys[0]), "send to Ashcourt guest room");
assert(n.housed && n.guestKey.indexOf("KITTY_RES_ASHCOURT") === 0, "guest lives at Ashcourt");

var west = LT.kittyResidences.byId("westmead");
assert(!LT.kittyResidences.rent(west), "rent Westmead");
assert(LT.kittyNpcResidencesPatch.destinations().every(function (d) { return d.id !== "westmead"; }), "Westmead still has no guest room");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL NPC RESIDENCES PATCH SMOKES PASSED");
