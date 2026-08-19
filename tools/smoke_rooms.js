/* node "Liliths Throne HTML/tools/smoke_rooms.js" */
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
  window: { allGrids: {}, LT_GRID_META: {}, grid: { gridName: "LILAYAS_HOUSE", playerPosition: { x: 3, y: 3 } } },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    Colour: { GENERIC_GOOD: "#6c6", GENERIC_MINOR_GOOD: "#8c6" },
    HOUSE_UPGRADES: {
      SLAVE_ROOM: { id: "SLAVE_ROOM", name: "Slave's Room", cap: 1, home: true },
      SLAVE_ROOM_DOUBLE: { id: "SLAVE_ROOM_DOUBLE", name: "Double Slave Room", cap: 2, home: true },
      SLAVE_ROOM_QUADRUPLE: { id: "SLAVE_ROOM_QUADRUPLE", name: "Quadruple Slave Room", cap: 4, home: true },
      GUEST_ROOM: { id: "GUEST_ROOM", name: "Guest Room", cap: 1, home: true },
      DUNGEON_CELL: { id: "DUNGEON_CELL", name: "Dungeon cell", cap: 4, home: true },
    },
    game: {
      started: true,
      secondsPassed: 12 * 3600,
      player: { money: 50000, location: { world: "LILAYAS_HOUSE", place: "LILAYA_HOME_ROOM", x: 3, y: 3 } },
      flags: {
        houseRooms: {
          "LILAYAS_HOUSE:3,3": { u: "SLAVE_ROOM" },
          "LILAYAS_HOUSE:2,2": { u: "GUEST_ROOM" },
          "LILAYAS_HOUSE:4,4": { u: "SLAVE_ROOM_DOUBLE" },
          "LILAYAS_HOUSE:5,5": { u: "SLAVE_ROOM_QUADRUPLE" },
          "LILAYAS_HOUSE:0,0": { u: "DUNGEON_CELL" },
        },
        ownedSlaves: [
          { id: "s1", name: "Ash", home: "" },
          { id: "s2", name: "Bea", home: "" },
          { id: "s3", name: "Cy", home: "" },
          { id: "s4", name: "Dee", home: "" },
          { id: "s5", name: "Eve", home: "" },
        ],
      },
      npcs: {},
      textStart: "",
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
context.LT.houseRooms = function () { return context.LT.game.flags.houseRooms; };
context.LT.currentRoomKey = function () {
  var loc = context.LT.game.player.location;
  return loc.world + ":" + loc.x + "," + loc.y;
};
context.LT.roomUpgradeAt = function (key) {
  var rec = context.LT.game.flags.houseRooms[key || context.LT.currentRoomKey()];
  if (!rec) return null;
  return context.LT.HOUSE_UPGRADES[rec.u];
};
context.LT.ownedSlaves = function () { return context.LT.game.flags.ownedSlaves; };
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
context.LT.houseRoomContent = function (base) { return base || ""; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.defineNode({
  id: "house.occupancy",
  getContent: function () { return "<p>No one is housed here.</p>"; },
  getResponses: function () { return []; },
});

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyRoomsExpansion/KittyRoomsExpansion.js");

var LT = context.LT;
var api = LT.kittyRooms;
assert(api, "API");

function slave(id) {
  var i;
  for (i = 0; i < LT.ownedSlaves().length; i++) if (LT.ownedSlaves()[i].id === id) return LT.ownedSlaves()[i];
  return null;
}
function clearHomes() {
  LT.ownedSlaves().forEach(function (s) { s.home = ""; });
  LT.game.npcs = {};
}

api.saveMenu({ enabled: true, guestCap: 2, slaveMult: 2 });
assert(api.effectiveCap(LT.HOUSE_UPGRADES.GUEST_ROOM) === 2, "guest cap 2");
assert(api.effectiveCap(LT.HOUSE_UPGRADES.SLAVE_ROOM) === 2, "slave 2x → 2");
assert(api.effectiveCap(LT.HOUSE_UPGRADES.SLAVE_ROOM_DOUBLE) === 4, "double 2x → 4");
assert(api.effectiveCap(LT.HOUSE_UPGRADES.SLAVE_ROOM_QUADRUPLE) === 8, "quad 2x → 8");
assert(api.effectiveCap(LT.HOUSE_UPGRADES.DUNGEON_CELL) === 4, "dungeon unchanged");
assert(LT.HOUSE_UPGRADES.SLAVE_ROOM.cap === 1, "does not mutate official cap");
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:3,3").cap === 2, "wrapped slave room cap");
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:2,2").cap === 2, "wrapped guest cap");

clearHomes();
assert(!LT.assignSlaveHome(slave("s1"), "LILAYAS_HOUSE:3,3"), "first slave into 2x room");
assert(!LT.assignSlaveHome(slave("s2"), "LILAYAS_HOUSE:3,3"), "second slave into 2x room");
assert(/occupied/i.test(LT.assignSlaveHome(slave("s3"), "LILAYAS_HOUSE:3,3")), "third slave blocked at 2x");

api.saveMenu({ enabled: true, guestCap: 2, slaveMult: 4 });
clearHomes();
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:3,3").cap === 4, "4x single → 4");
assert(!LT.assignSlaveHome(slave("s1"), "LILAYAS_HOUSE:3,3"), "1/4");
assert(!LT.assignSlaveHome(slave("s2"), "LILAYAS_HOUSE:3,3"), "2/4");
assert(!LT.assignSlaveHome(slave("s3"), "LILAYAS_HOUSE:3,3"), "3/4");
assert(!LT.assignSlaveHome(slave("s4"), "LILAYAS_HOUSE:3,3"), "4/4");
assert(/occupied/i.test(LT.assignSlaveHome(slave("s5"), "LILAYAS_HOUSE:3,3")), "5th blocked at 4x");
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:4,4").cap === 8, "double 4x → 8");
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:5,5").cap === 16, "quad 4x → 16");

api.saveMenu({ enabled: true, guestCap: 1, slaveMult: 1 });
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:3,3").cap === 1, "1x is official");
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:2,2").cap === 1, "guest 1 is official");
clearHomes();
assert(!LT.assignSlaveHome(slave("s1"), "LILAYAS_HOUSE:3,3"), "vanilla first");
assert(/occupied/i.test(LT.assignSlaveHome(slave("s2"), "LILAYAS_HOUSE:3,3")), "vanilla second blocked");

api.saveMenu({ enabled: false, guestCap: 6, slaveMult: 4 });
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:3,3").cap === 1, "disabled uses official slave cap");
assert(LT.roomUpgradeAt("LILAYAS_HOUSE:2,2").cap === 1, "disabled uses official guest cap");

api.saveMenu({ enabled: true, guestCap: 3, slaveMult: 1 });
clearHomes();
assert(!LT.assignSlaveHome(slave("s1"), "LILAYAS_HOUSE:2,2"), "guest room can house a slave");
assert(!LT.assignSlaveHome(slave("s2"), "LILAYAS_HOUSE:2,2"), "second slave in guest cap 3");
LT.game.npcs.g1 = { id: "g1", name: "Nia", housed: true, guestKey: "LILAYAS_HOUSE:2,2" };
assert(api.guestsInRoom("LILAYAS_HOUSE:2,2").length === 1, "one guest listed");
assert(api.occupantCount("LILAYAS_HOUSE:2,2") === 3, "2 slaves + 1 guest");
assert(api.roomFull("LILAYAS_HOUSE:2,2"), "guest room full at 3");
assert(/occupied/i.test(LT.assignSlaveHome(slave("s3"), "LILAYAS_HOUSE:2,2")), "no fourth into guest room");

api.saveMenu({ enabled: true, guestCap: 4, slaveMult: 1 });
assert(!api.roomFull("LILAYAS_HOUSE:2,2"), "raising guest cap frees a slot");
assert(!LT.assignSlaveHome(slave("s3"), "LILAYAS_HOUSE:2,2"), "fourth occupant after cap raise");
slave("s3").home = "";
LT.game.npcs.g2 = { id: "g2", name: "Pia", housed: true, guestKey: "LILAYAS_HOUSE:2,2" };

LT.game.player.location = { world: "LILAYAS_HOUSE", place: "LILAYA_HOME_ROOM", x: 2, y: 2 };
var extra = api.occupancyExtra();
assert(/Occupancy: <b>4<\/b> \/ <b>4<\/b>/.test(extra), "occupancy line");
assert(/Nia/.test(extra) && /Pia/.test(extra), "guests named in overlay");
assert(/Nia/.test(LT.houseRoomContent("<p>base</p>")), "houseRoomContent lists guests");
assert(/Occupancy/.test(LT.getNode("house.occupancy").getContent()), "occupancy node patched");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittyRoomsExpansion"; }), "mod menu");
var html = LT.listModMenus().filter(function (m) { return m.id === "KittyRoomsExpansion"; })[0].getHtml();
assert(/People per guest room/.test(html) && /2x/.test(html), "mod menu fields");

var modText = fs.readFileSync(path.join(root, "mods/KittyRoomsExpansion/KittyRoomsExpansion.mod"), "utf8");
assert(/Add Boot:/.test(modText) && !/Add Javascript:/.test(modText), "pattern B boot only");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL ROOMS SMOKES PASSED");
