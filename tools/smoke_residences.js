/* node "Liliths Throne HTML/tools/smoke_residences.js" */
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
        { x: 3, y: 2, location: { name: "Dominion Streets", placeType: "DOMINION_STREET", passage: "place.DOMINION_STREET", description: "Street." } },
        { x: 13, y: 3, location: { name: "Dominion Streets", placeType: "DOMINION_STREET", passage: "place.DOMINION_STREET", description: "Street." } },
        { x: 16, y: 0, location: { name: "Demon Home", placeType: "DOMINION_DEMON_HOME", passage: "place.DOMINION_DEMON_HOME", description: "Demon Home." } },
        { x: 20, y: 1, location: { name: "Demon Home", placeType: "DOMINION_DEMON_HOME", passage: "place.DOMINION_DEMON_HOME", description: "Demon Home." } },
      ],
      WORLD_MAP: [
        { x: 7, y: 28, location: { name: "World Map Fields", placeType: "WORLD_MAP_FIELDS", passage: "place.WORLD_MAP_FIELDS" } },
        { x: 38, y: 31, location: { name: "World Map Fields", placeType: "WORLD_MAP_FIELDS", passage: "place.WORLD_MAP_FIELDS" } },
      ],
      innoxia_fields_elis_town: [
        { x: 0, y: 0, location: { name: "fields", placeType: "innoxia_fields_elis_town_fields", passage: "place.innoxia_fields_elis_town_fields" } },
        { x: 6, y: 0, location: { name: "fields", placeType: "innoxia_fields_elis_town_fields", passage: "place.innoxia_fields_elis_town_fields" } },
      ],
    },
    LT_GRID_META: {},
    grid: { gridName: "CITY_HALL", playerPosition: { x: 3, y: 3 } },
  },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    Colour: { GENERIC_GOOD: "#6c6", GENERIC_MINOR_GOOD: "#8c6", GENERIC_BAD: "#c66" },
    HOUSE_UPGRADES: {
      SLAVE_ROOM: { id: "SLAVE_ROOM", name: "Slave's Room", cap: 1, home: true },
      GUEST_ROOM: { id: "GUEST_ROOM", name: "Guest Room", cap: 1, home: true },
    },
    game: {
      started: true,
      secondsPassed: 12 * 3600,
      player: { money: 400000, items: [], location: { world: "CITY_HALL", place: "CITY_HALL_INFORMATION_DESK", x: 3, y: 3 } },
      flags: { houseRooms: {}, ownedSlaves: [{ id: "s1", name: "Ash", home: "" }] },
      npcs: {},
      textStart: "",
      setContent: function (id) { this._node = id; },
      advanceTime: function (s) { this.secondsPassed += s; },
    },
  },
};
context.window.LT = context.LT;
context.window.document = context.document;
context.grid = context.window.grid;
context.window.grid = context.window.grid;

context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.parse = function (s) { return String(s || ""); };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.getMoney = function () { return context.LT.game.player.money; };
context.LT.incrementMoney = function (d) { context.LT.game.player.money += d; return ""; };
context.LT.houseRooms = function () {
  context.LT.game.flags.houseRooms = context.LT.game.flags.houseRooms || {};
  return context.LT.game.flags.houseRooms;
};
context.LT.ownedSlaves = function () { return context.LT.game.flags.ownedSlaves; };
context.LT.roomUpgradeAt = function (key) {
  var rec = context.LT.houseRooms()[key];
  if (!rec) return null;
  return context.LT.HOUSE_UPGRADES[rec.u];
};
context.LT.parseRoomKey = function (key) {
  var parts = String(key).split(":");
  var xy = parts[1].split(",");
  return { world: parts[0], x: parseInt(xy[0], 10), y: parseInt(xy[1], 10) };
};
context.LT.slavesInRoom = function (key) {
  return context.LT.ownedSlaves().filter(function (s) { return s.home === key; });
};
context.LT.assignSlaveHome = function (rec, key) {
  var up = context.LT.roomUpgradeAt(key);
  if (!up || !up.home) return "This room cannot house a slave.";
  if (up.cap > 0 && context.LT.slavesInRoom(key).filter(function (s) { return s.id !== rec.id; }).length >= up.cap) {
    return "This room is already occupied.";
  }
  rec.home = key;
  return "";
};
context.LT.placeSlave = function () {};
context.LT.travelResponses = function () { return []; };
context.LT.enterWorld = function (grid, place, coords) {
  context.LT.game.player.location = {
    world: grid,
    place: place || "",
    x: coords && coords.x,
    y: coords && coords.y,
  };
  context.window.grid.gridName = grid;
};
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.listModMenus = function () { return context.LT._menus || []; };
context.LT.defineNode({ id: "place.generic", getResponses: function () { return []; }, getContent: function () { return ""; } });

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyResidencesExpansion/residenceLayouts.js");
load("mods/KittyResidencesExpansion/KittyResidencesExpansion.js");

var LT = context.LT;
var api = LT.kittyResidences;
assert(api, "API");
assert(api.catalog.length === 8, "eight properties");
assert(context.window.allGrids.KITTY_RES_FINCHWALK.length >= 6, "flat grid");
assert(context.window.allGrids.KITTY_RES_BLACKTHORN.length < 150, "mansion smaller than Lilaya");
assert(context.window.LT_GRID_META.KITTY_RES_FINCHWALK.width === 11, "small residence is 11");
assert(context.window.LT_GRID_META.KITTY_RES_ASHCOURT.width === 13, "house is 13");
assert(context.window.LT_GRID_META.KITTY_RES_HIGHSPIRE.width === 15, "penthouse is 15");
assert(context.window.LT_GRID_META.KITTY_RES_BLACKTHORN.width === 17, "mansion is 17");
assert(api.propertyAt("DOMINION", 3, 2, "DOMINION_STREET").id === "finchwalk", "flat door");
assert(api.propertyAt("DOMINION", 16, 0, "DOMINION_DEMON_HOME").id === "highspire", "penthouse door");
assert(api.propertyAt("innoxia_fields_elis_town", 0, 0, "innoxia_fields_elis_town_fields").id === "thatchend", "elis door");
assert(api.propertyAt("WORLD_MAP", 7, 28, "WORLD_MAP_FIELDS").id === "westmead", "west foloi");
assert(api.propertyAt("WORLD_MAP", 38, 31, "WORLD_MAP_FIELDS").id === "eastmere", "east foloi");
assert(api.catalog.every(function (s) { return s.flavour && s.name && s.rooms.some(function (r) { return r.role === "slave"; }); }), "each home has flavour and a slave room");

var names = api.catalog.map(function (s) { return s.name; });
assert(new Set(names).size === 8, "unique names");

LT.game.player.location = { world: "CITY_HALL", place: "CITY_HALL_INFORMATION_DESK", x: 3, y: 3 };
var travel = LT.travelResponses();
assert(travel.some(function (r) { return r && r.title === "Kitty estate listings"; }), "City Hall listings");

var spec = api.byId("finchwalk");
var before = LT.getMoney();
assert(!api.buy(spec), "buy flat");
assert(LT.getMoney() === before - 25000, "buy price deducted");
assert(api.accessible("finchwalk"), "owned is accessible");
var slaveKeys = api.liveUpgradeKeys(spec, "SLAVE_ROOM");
assert(slaveKeys.length >= 1 && LT.roomUpgradeAt(slaveKeys[0]).id === "SLAVE_ROOM", "slave room seeded on live tiles");
var slaveTiles = context.window.allGrids.KITTY_RES_FINCHWALK.filter(function (t) {
  return t.location && t.location.placeType === "KITTY_RES_SLAVE";
});
assert(slaveTiles.length >= 1, "walkable slave room tiles");
assert(
  slaveKeys.indexOf(spec.grid + ":" + slaveTiles[0].x + "," + slaveTiles[0].y) >= 0,
  "seeded key matches walked slave tile"
);

var ash = LT.ownedSlaves()[0];
assert(!LT.assignSlaveHome(ash, slaveKeys[0]), "transfer into flat slave room");
assert(ash.home === slaveKeys[0], "slave home set");

assert(LT.hasNode("place.KITTY_RES_FOYER") && LT.hasNode("kitty.res.list") && LT.hasNode("kitty.res.transfer") && LT.hasNode("place.KITTY_RES_EXTERIOR"), "nodes");
assert(context.window.allGrids.DOMINION[0].location.placeType === "KITTY_RES_DOOR_FINCHWALK", "flat door tile is the house");
assert(context.window.allGrids.DOMINION[0].location.passage === "place.KITTY_RES_EXTERIOR", "flat door opens house page");
assert(context.window.allGrids.DOMINION[0].location.name === "The Finch Walk Flat", "flat door name");
assert(context.window.allGrids.WORLD_MAP[0].location.placeType === "KITTY_RES_DOOR_WESTMEAD", "west croft stamps world map");
assert(context.window.allGrids.innoxia_fields_elis_town[0].location.placeType === "KITTY_RES_DOOR_THATCHEND", "thatchend stamps Elis");
LT.game.player.location = { world: "DOMINION", place: "KITTY_RES_DOOR_FINCHWALK", x: 3, y: 2 };
context.window.grid.gridName = "DOMINION";
context.window.grid.playerPosition = { x: 3, y: 2 };
var ext = LT.getNode("place.KITTY_RES_EXTERIOR");
assert(/Finch Walk/i.test(typeof ext.title === "function" ? ext.title() : ext.title), "house page title");
assert(/milliner|Finch Walk/i.test(ext.getContent()), "house page text");
api.enterProperty(spec);
assert(LT.game.player.location.world === "KITTY_RES_FINCHWALK", "enter sets grid");

var west = api.byId("westmead");
assert(!api.rent(west), "rent west croft");
assert(api.accessible("westmead"), "rent is accessible this week");
LT.game.secondsPassed += 8 * 86400;
assert(!api.accessible("westmead"), "lapsed rent locks the door");

var menus = LT.listModMenus();
assert(menus.some(function (m) { return m.id === "KittyResidencesExpansion"; }), "mod menu");
var html = menus.filter(function (m) { return m.id === "KittyResidencesExpansion"; })[0].getHtml();
assert(html.indexOf("The Finch Walk Flat") >= 0 && html.indexOf("City Hall") >= 0, "menu lists homes");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL RESIDENCE SMOKES PASSED");
