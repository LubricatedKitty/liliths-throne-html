/* node "Liliths Throne HTML/tools/smoke_npc_expansion.js" */
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
        { x: 5, y: 2, location: { placeType: "DOMINION_STREET" } },
        { x: 10, y: 8, location: { placeType: "DOMINION_BOULEVARD" } },
        { x: 10, y: 10, location: { placeType: "DOMINION_PLAZA" } },
        { x: 8, y: 6, location: { placeType: "DOMINION_PARK" } },
      ],
    },
    LT_GRID_META: {},
    grid: { gridName: "DOMINION", playerPosition: { x: 10, y: 8 } },
  },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function (ev, fn) { this._l = this._l || []; this._l.push([ev, fn]); },
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
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
      player: { money: 5000, companions: [], location: { world: "DOMINION", place: "DOMINION_BOULEVARD", x: 10, y: 8 } },
      flags: {
        houseRooms: { "LILAYAS_HOUSE:2,2": { u: "GUEST_ROOM" }, "LILAYAS_HOUSE:3,3": { u: "SLAVE_ROOM" } },
        ownedSlaves: [],
        hasSlaverLicense: true,
        slaveryQuest: "complete",
      },
      npcs: {},
      textStart: "",
      currentNode: { id: "place.generic" },
      setContent: function (id) { this._node = id; },
      returnNode: "place.generic",
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
  var xy = parts[1].split(",");
  return { world: parts[0], x: parseInt(xy[0], 10), y: parseInt(xy[1], 10) };
};
context.LT.slavesInRoom = function () { return []; };
context.LT.ownedSlaves = function () { return context.LT.game.flags.ownedSlaves; };
context.LT.findSlave = function (id) {
  var i;
  for (i = 0; i < context.LT.game.flags.ownedSlaves.length; i++) {
    if (context.LT.game.flags.ownedSlaves[i].id === id) return context.LT.game.flags.ownedSlaves[i];
  }
  return null;
};
context.LT.assignSlaveHome = function (rec, key) { rec.home = key; return ""; };
context.LT.takeOwnership = function (npc) {
  var rec = { id: npc.id, name: npc.name, home: "" };
  context.LT.game.flags.ownedSlaves.push(rec);
  return rec;
};
context.LT.canManageHouse = function () { return true; };
context.LT.incrementAffection = function (n, a) { n.affection = (n.affection || 0) + a; return ""; };
context.LT.npcAtCurrentTile = function () { return []; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.listModMenus = function () { return context.LT._menus || []; };
context.LT.rememberReturn = function () {};
context.LT.defineNode({
  id: "characters.present",
  getResponses: function () { return [new context.LT.Response("Back", "", null)]; },
});

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("js/character/names.js");
load("mods/KittyNPCExpansion/KittyNPCExpansion.js");

var LT = context.LT;
var api = LT.kittyNpcExpansion;
assert(api, "API");
assert(api.ensureRoster().length === 140, "140 citizens including demon and harpy extras");
assert(api.ensureRoster().filter(function (n) { return n.kittyKind === "demon"; }).length === 20, "20 extra demons");
assert(api.ensureRoster().filter(function (n) { return n.kittyKind === "harpy"; }).length === 20, "20 extra harpies");
assert(context.window.allGrids.KITTY_ARCANE_ANNEX, "annex foyer grid");
assert(LT.hasNode("place.KITTY_ANNEX_FOYER"), "annex node");
assert(LT.hasNode("kitty.npc.more"), "More node");

LT.game.player.location = { world: "DOMINION", place: "DOMINION_BOULEVARD", x: 10, y: 8 };
api.rotateCity(true);
var placed = api.ensureRoster().filter(function (n) { return n.location && n.location.world === "DOMINION"; });
assert(placed.length === 10, "ten boulevard standers");
assert(placed.every(function (n) { return n.name && n.name.indexOf("the-") !== 0; }), "real names");
var allNames = api.ensureRoster().map(function (n) { return n.name; });
var unique = {};
allNames.forEach(function (nm) { unique[nm] = (unique[nm] || 0) + 1; });
assert(Object.keys(unique).length > 40, "official name variety");
assert((unique.Bram || 0) === 0 && (unique.Rook || 0) === 0, "not stub mugger names");

api.rotateUni(true);
assert(api.flags().uni.length === 10, "10 at annex");
var atUni = api.flags().uni.every(function (id) {
  var n = LT.game.npcs[id];
  return n && n.location && n.location.world === "KITTY_ARCANE_ANNEX";
});
assert(atUni, "uni ten stand in the foyer");

var citizen = api.ensureRoster()[0];
api.setCurrent(citizen);
var titles = api.moreList(citizen).map(function (r) { return r.title; });
assert(titles.indexOf("Flirt") >= 0 && titles.indexOf("Joke") >= 0, "flirt and joke");
api.moreList(citizen).filter(function (r) { return r.title === "Flirt"; })[0].effects();
assert(/Affinity/.test(api.flags().lastTalk || ""), "flirt shows affinity growth");
var firstFlirt = api.flags().lastTalk;
api.moreList(citizen).filter(function (r) { return r.title === "Flirt"; })[0].effects();
assert(api.flags().lastTalk && api.flags().lastTalk.length > 180, "flirt text is long enough");
assert(titles.indexOf("Recruit") >= 0, "recruit offered");
assert(api.moreList(citizen).filter(function (r) { return r.title === "Kiss"; })[0].disabled, "kiss gated");
citizen.affection = 30;
citizen.obedience = 40;
var opened = api.moreList(citizen);
var kissR = opened.filter(function (r) { return r.title === "Kiss"; })[0];
var slaveR = opened.filter(function (r) { return r.title === "Ask to be your slave"; })[0];
assert(api.affOf(citizen) >= 10, "affOf sees 30");
assert(kissR && !kissR.disabled, "kiss opens at 10+");
assert(slaveR && !slaveR.disabled, "slave ask opens at 35 obe");

api.recruit(citizen);
assert(citizen.recruited && LT.game.player.companions.indexOf(citizen.id) >= 0, "recruit follows");
assert(!api.sendHome(citizen), "send to guest room");
assert(citizen.housed && citizen.guestKey.indexOf("GUEST_ROOM") < 0 && citizen.guestKey.indexOf("LILAYAS_HOUSE") >= 0, "housed in guest room");
api.sendBack(citizen);
assert(!citizen.housed && !citizen.recruited, "send back clears");

assert(api.isUnique({ id: "lilaya" }) && !api.isUnique(citizen), "uniques blocked");
var lil = { id: "lilaya", name: "Lilaya", affection: 50, obedience: 80 };
assert(api.moreList(lil).every(function (r) { return r.title !== "Recruit"; }), "no recruit Lilaya");

LT.setResponses([new LT.Response("Talk", "x", null)]);
assert(LT._lastResponses.some(function (r) { return r && r.title === "More"; }), "More injected onto dialogue");

var annexTile = context.window.allGrids.DOMINION.filter(function (t) { return t.x === 10 && t.y === 8; })[0];
assert(annexTile.location.placeType === "KITTY_NPC_ANNEX_ENTRANCE", "annex stamps Dominion 10,8");
assert(LT.hasNode("place.KITTY_NPC_ANNEX_ENTRANCE"), "annex location node");
LT.game.player.location = { world: "DOMINION", place: "KITTY_NPC_ANNEX_ENTRANCE", x: 10, y: 8 };
LT.game.currentNode = { id: "place.KITTY_NPC_ANNEX_ENTRANCE" };
assert(/lecture house/i.test(LT.getNode("place.KITTY_NPC_ANNEX_ENTRANCE").getContent()), "annex page text");
assert(LT.getNode("place.KITTY_NPC_ANNEX_ENTRANCE").getResponses().some(function (r) { return r && r.title === "Enter"; }), "annex page Enter");

var present = LT.getNode("characters.present").getResponses();
assert(present.some(function (r) { return r && r.title === "More"; }), "More on Characters Present");

assert(LT.listModMenus().some(function (m) { return m.id === "KittyNPCExpansion"; }), "mod menu");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL NPC EXPANSION SMOKES PASSED");
