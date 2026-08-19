/* node "Liliths Throne HTML/tools/smoke_invite.js" */
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
  window: { allGrids: {}, LT_GRID_META: {}, grid: { gridName: "DOMINION", playerPosition: { x: 1, y: 1 } } },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    Colour: { FEMININE: "#f6a", MASCULINE: "#6af", GENERIC_MINOR_GOOD: "#8c6" },
    HOUSE_UPGRADES: {
      GUEST_ROOM: { id: "GUEST_ROOM", name: "Guest Room", cap: 1, home: true },
      SLAVE_ROOM: { id: "SLAVE_ROOM", name: "Slave's Room", cap: 1, home: true },
    },
    game: {
      started: true,
      secondsPassed: 12 * 3600,
      player: {
        money: 5000,
        offspring: [],
        companions: [],
        location: { world: "DOMINION", place: "DOMINION_BACK_ALLEYS", x: 1, y: 1 },
      },
      flags: {
        houseRooms: {},
        accommodationQuest: "",
        ownedSlaves: [],
      },
      npcs: {},
      textStart: "",
      currentNode: { id: "alley.victory" },
      returnNode: "place.generic",
      setContent: function (id) { this._node = id; },
    },
    combat: {
      finished: "",
      enemy: null,
      finish: function () { return this.finished; },
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
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.setResponses = function (responses) {
  context.LT._lastResponses = responses || [];
  return context.LT._lastResponses;
};
context.LT.houseRooms = function () { return context.LT.game.flags.houseRooms; };
context.LT.roomUpgradeAt = function (key) {
  var rec = context.LT.game.flags.houseRooms[key];
  if (!rec) return null;
  return context.LT.HOUSE_UPGRADES[rec.u];
};
context.LT.parseRoomKey = function (key) {
  var parts = String(key).split(":");
  var xy = parts[1].split(",");
  return { world: parts[0], x: parseInt(xy[0], 10), y: parseInt(xy[1], 10) };
};
context.LT.ownedSlaves = function () { return context.LT.game.flags.ownedSlaves; };
context.LT.slavesInRoom = function (key) {
  return context.LT.ownedSlaves().filter(function (s) { return s.home === key; });
};
context.LT.findSlave = function () { return null; };
context.LT.persistAlleyNpc = function (n) { return n; };
context.LT.incrementAffection = function (n, amount) {
  n.affection = (n.affection || 0) + amount;
};
context.LT.rememberReturn = function () { context.LT._remembered = true; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.defineNode({ id: "place.LILAYA_HOME_LAB", getResponses: function () { return []; } });
context.LT.defineNode({ id: "alley.victory", getResponses: function () { return []; } });
context.LT.defineNode({ id: "place.LILAYA_HOME_ROOM_PLAYER", getResponses: function () { return []; } });

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyInviteToMansion/KittyInviteToMansion.js");

var LT = context.LT;
var api = LT.kittyInvite;
assert(api, "API");
assert(LT.hasNode("kitty.invite.offer") && LT.hasNode("kitty.invite.lilaya") && LT.hasNode("kitty.invite.offspring"), "nodes");

var mugger = { id: "alley_01", name: "Kara", feminine: true, affection: 55, location: { world: "DOMINION", place: "DOMINION_BACK_ALLEYS", x: 1, y: 1 } };
LT.game.npcs.alleyMugger = mugger;
LT.game.npcs.alley_01 = mugger;

assert(/defeated|offspring/i.test(api.inviteBlock(mugger)), "not yet defeated");
api.markDefeated(mugger);
assert(api.isDefeated(mugger), "marked defeated");
assert(LT.game.flags.accommodationQuest === "SIDE_ACCOMMODATION_NEED_LILAYAS_PERMISSION", "quest starts");
assert(/Ask Lilaya|permission/i.test(api.invite(mugger)), "blocked without permission");

api.grantPermission();
assert(api.hasPermission(), "permission granted");
assert(/guest room/i.test(api.invite(mugger)), "blocked without guest room");

LT.game.flags.houseRooms["LILAYAS_HOUSE_GROUND_FLOOR:2,2"] = { u: "GUEST_ROOM" };
assert(api.firstFreeLilayaGuest() === "LILAYAS_HOUSE_GROUND_FLOOR:2,2", "free Lilaya guest room");
assert(!api.invite(mugger), "invite defeated");
assert(mugger.housed && mugger.guestKey === "LILAYAS_HOUSE_GROUND_FLOOR:2,2", "housed in mansion");
assert(mugger.location.world === "LILAYAS_HOUSE_GROUND_FLOOR", "moved to mansion");
assert(mugger.affection >= 100, "official +50 affection");
assert(api.flags().occupants.indexOf("alley_01") >= 0, "occupant listed");
assert(/already have a room/.test(api.invite(mugger)), "no double invite");

var unique = { id: "lilaya", name: "Lilaya", affection: 80 };
assert(/own home/.test(api.inviteBlock(unique)), "unique blocked");

var cold = { id: "alley_02", name: "Rook", affection: 10 };
api.markDefeated(cold);
assert(/affection 50/.test(api.inviteBlock(cold)), "official affection gate");
api.saveMenu({ enabled: true, requireAffection: false });
LT.game.flags.houseRooms["LILAYAS_HOUSE_GROUND_FLOOR:3,3"] = { u: "GUEST_ROOM" };
assert(!api.invite(cold), "affection skip allows invite");
api.saveMenu({ enabled: true, requireAffection: true });

LT.game.player.offspring = [{ id: "lit-1", motherId: "player", fatherId: "alley_01", count: 2, sons: 1, daughters: 1, motherRace: "HUMAN", fatherRace: "CAT-MORPH" }];
var kids = api.ensureOffspring();
assert(kids.length === 2, "two children from litter");
assert(kids[0].kittyOffspring && kids[1].kittyOffspring, "marked offspring");
assert(kids.some(function (k) { return k.feminine; }) && kids.some(function (k) { return !k.feminine; }), "son and daughter");
assert(api.affectionOk(kids[0]), "family affection -50");
kids[0].affection = -60;
assert(!api.affectionOk(kids[0]), "family too disliked");
kids[0].affection = 20;

LT.game.flags.houseRooms["LILAYAS_HOUSE_FIRST_FLOOR:4,4"] = { u: "GUEST_ROOM" };
var kid = api.unhousedOffspring()[0];
assert(!api.invite(kid), "invite offspring");
assert(kid.housed && /^LILAYA/.test(kid.guestKey), "child in mansion");

var lastKid = api.unhousedOffspring()[0];
LT.game.flags.houseRooms = { "LILAYAS_HOUSE_GROUND_FLOOR:2,2": { u: "GUEST_ROOM" } };
mugger.guestKey = "LILAYAS_HOUSE_GROUND_FLOOR:2,2";
kid.guestKey = "LILAYAS_HOUSE_GROUND_FLOOR:2,2";
assert(/no vacant guest room/i.test(api.invite(lastKid)), "full guest room blocks");

LT.game.currentNode = { id: "place.LILAYA_HOME_LAB" };
LT.setResponses([]);
assert(LT._lastResponses.some(function (r) { return r && r.title === "Guest rooms"; }), "lab Guest rooms");

LT.game.npcs.alleyMugger = { id: "alley_03", name: "Nisha", affection: 60, defeatedByPlayer: true };
api.markDefeated(LT.game.npcs.alleyMugger);
LT.game.currentNode = { id: "alley.victory" };
LT.setResponses([]);
assert(LT._lastResponses.some(function (r) { return r && r.title === "Offer room"; }), "victory Offer room");

LT.game.currentNode = { id: "place.LILAYA_HOME_ROOM_PLAYER" };
LT.setResponses([]);
assert(LT._lastResponses.some(function (r) { return r && r.title === "Invite offspring"; }), "bedroom Invite offspring");

LT.game.currentNode = { id: "sex.scene" };
LT.game.npcs.alleyMugger = mugger;
LT.setResponses([]);
assert(!LT._lastResponses.some(function (r) { return r && r.title === "Offer room"; }), "no offer on sex");

LT.combat.enemy = { id: "alley_04", name: "Vex" };
LT.combat.finished = "victory";
LT.combat.finish();
assert(api.isDefeated(LT.combat.enemy), "combat.finish marks defeated");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittyInviteToMansion"; }), "mod menu");
var html = LT.listModMenus().filter(function (m) { return m.id === "KittyInviteToMansion"; })[0].getHtml();
assert(/Official affection/.test(html), "mod menu fields");

var modText = fs.readFileSync(path.join(root, "mods/KittyInviteToMansion/KittyInviteToMansion.mod"), "utf8");
assert(/Add Boot:/.test(modText) && !/Add Javascript:/.test(modText), "pattern B boot only");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL INVITE SMOKES PASSED");
