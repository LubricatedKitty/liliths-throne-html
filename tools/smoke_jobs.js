/* node "Liliths Throne HTML/tools/smoke_jobs.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var contentListeners = [];
var context = {
  console: console,
  window: { allGrids: {}, LT_GRID_META: {}, grid: { gridName: "DOMINION", playerPosition: { x: 6, y: 12 } } },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function (ev, fn) { contentListeners.push([ev, fn]); },
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    Colour: { FEMININE: "#f6a", MASCULINE: "#6af", GENERIC_MINOR_GOOD: "#8c6", GENERIC_GOOD: "#6c6" },
    game: {
      started: true,
      secondsPassed: 12 * 3600,
      player: { money: 1000, location: { world: "DOMINION", place: "DOMINION_PLAZA", x: 10, y: 10 } },
      flags: { hasProstitutionLicense: false },
      npcs: {},
      textStart: "",
      currentNode: { id: "place.generic" },
      returnNode: "place.generic",
      setContent: function (id) { this._node = id; },
      advanceTime: function (s) { this.secondsPassed += s; },
    },
  },
};
context.window.LT = context.LT;
context.window.document = context.document;
context.grid = context.window.grid;
context.Math = Math;

context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.parse = function (s) { return String(s || "").replace(/\[npc\.name\]/gi, "Ryn").replace(/\[npc\.Name\]/g, "Ryn"); };
context.LT.withParseTargets = function (m, fn) { return fn(); };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.ResponseSex = function (title, tip, opts) {
  this.title = title;
  this.opts = opts;
  this.effects = function () { context.LT._sex = opts; };
};
context.LT.setResponses = function (responses) {
  context.LT._lastResponses = responses || [];
  return context.LT._lastResponses;
};
context.LT.getMoney = function () { return context.LT.game.player.money; };
context.LT.incrementMoney = function (d) { context.LT.game.player.money += d; return ""; };
context.LT.refreshVitals = function (n) { return n; };
context.LT.rememberReturn = function () { context.LT._remembered = true; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyJobsEstablishmentsExpansion/KittyJobsEstablishmentsExpansion.js");

var LT = context.LT;
var api = LT.kittyJobs;
assert(api, "API");
assert(api.venues.length === 13, "thirteen venues including bank");
assert(
  ["nyan", "kate", "ashley", "ralph", "vicky", "kay", "cafe", "collar", "club", "gym", "enforcer", "brothel", "bank"].every(function (id) {
    return !!api.byId(id);
  }),
  "named venues"
);

var nyan = api.byId("nyan");
assert(nyan.ranks.join(">") === "Folder>Shop assistant>Senior assistant", "Nyan ranks");
assert(api.byId("kate").ranks[0] === "Wash-girl", "Kate ranks");
assert(api.byId("ashley").ranks.join(">") === "Shelf stocker>Assistant", "Ashley ranks");
assert(api.byId("ralph").delivery, "Ralph delivery flag");
assert(api.byId("brothel").officialSex, "brothel official sex left alone");
assert(api.SWORD.join(">") === "Rookie>Constable>Sergeant>Inspector>Chief Inspector>Superintendent", "SWORD ranks");
assert(api.ORICL.join(">") === "Constable>Sergeant>Inspector", "ORICL ranks");
assert(api.byId("enforcer").workers === 12 && api.byId("enforcer").prisoners === 20, "Enforcer 12 staff + 20 prisoners");

function go(place, node) {
  LT.game.player.location = { world: "DOMINION", place: place, x: 6, y: 12 };
  LT.game.currentNode = { id: node || "place.generic" };
}

go("DOMINION_PLAZA");
assert(!api.venueHere(), "plaza is not a workplace");
go("SHOPPING_ARCADE_NYANS_SHOP", "nyan.shop");
assert(api.venueHere() && api.venueHere().id === "nyan", "Nyan shop");
go("ENFORCER_HQ_CORRIDOR");
assert(api.venueHere().id === "enforcer", "Enforcer prefix");
go("ANGELS_KISS_BEDROOM");
assert(api.venueHere().id === "brothel", "Angel prefix");
go("WATERING_HOLE_DANCE_FLOOR");
assert(api.venueHere().id === "club", "club prefix");
go("BOUNTY_HUNTER_LODGE_BAR");
assert(api.venueHere().id === "collar", "collar prefix");
go("SLAVER_ALLEY_CAFE_3");
assert(api.venueHere().id === "cafe", "cafe regex");

go("SHOPPING_ARCADE_NYANS_SHOP", "nyan.shop");
assert(/You do not work here/.test(api.workShift(nyan).line), "shift without hire");
assert(/Hired at Nyan/.test(api.hire(nyan)), "hire Nyan");
assert(api.jobRec("nyan").hired && api.rankName(nyan, api.jobRec("nyan")) === "Folder", "bottom rank");

var money = LT.getMoney();
var t0 = LT.game.secondsPassed;
var shift = api.workShift(nyan);
assert(/Folder/.test(shift.line) && /40/.test(shift.line), "first shift pay");
assert(LT.getMoney() === money + 40, "wage applied");
assert(LT.game.secondsPassed === t0 + 3600, "one-hour shift");

var i;
for (i = 0; i < 4; i++) api.workShift(nyan);
assert(api.jobRec("nyan").rank === 1, "promote after 5 shifts");
assert(api.rankName(nyan, api.jobRec("nyan")) === "Shop assistant", "Shop assistant");

go("SHOPPING_ARCADE_RALPHS_SHOP", "ralph.shop");
var ralph = api.byId("ralph");
api.hire(ralph);
api.rotateHere(true);
var rnd = Math.random;
Math.random = function () { return 0.1; };
var del = api.workShift(ralph);
Math.random = rnd;
assert(del.delivery, "Ralph 50% delivery");

go("ANGELS_KISS_ENTRANCE");
var brothel = api.byId("brothel");
assert(/license/.test(api.hire(brothel)), "brothel hire blocked without license");
assert(!api.jobRec("brothel").hired, "not hired");
LT.game.flags.hasProstitutionLicense = true;
assert(/Hired at Angel/.test(api.hire(brothel)), "brothel hire with license");
api.workShift(brothel);
assert(api.flags().brothelDisinhibition === 1, "disinhibition +1");
Math.random = function () { return 0; };
assert(api.maybeSex(brothel) === null, "brothel maybeSex stays official");
Math.random = rnd;

go("SHOPPING_ARCADE_NYANS_SHOP", "nyan.shop");
api.rotateHere(true);
var pool = api.ensurePool(nyan);
assert(pool.workers.length === 2, "Nyan default 2 workers");
assert(api.presentWorkers(nyan).length >= 2, "present after rotate");
Math.random = function () { return 0; };
var hit = api.maybeSex(nyan);
Math.random = rnd;
assert(hit && hit.scene && hit.partner, "15% sex can fire");
Math.random = function () { return 0; };
assert(api.maybeSex(nyan) === null, "one workplace sex per day");
Math.random = rnd;

go("DOMINION_WAREHOUSES", "kay.entry");
api.rotateHere(true);
assert(api.ensurePool(api.byId("kay")).workers.length === 8, "Kay default 8");
assert(api.presentWorkers(api.byId("kay")).length === 6, "large venue presents 6");

go("ENFORCER_HQ_RECEPTION_DESK");
api.rotateHere(true);
var ef = api.ensurePool(api.byId("enforcer"));
assert(ef.workers.length === 12 && ef.prisoners.length === 20, "Enforcer pools");
api.flags().enforcerTrack = "SWORD";
api.hire(api.byId("enforcer"));
assert(api.rankName(api.byId("enforcer"), api.jobRec("enforcer")) === "Rookie", "SWORD rookie");
api.jobRec("enforcer").rank = 4;
assert(api.rankName(api.byId("enforcer"), api.jobRec("enforcer")) === "Chief Inspector", "SWORD chief");
api.flags().enforcerTrack = "ORICL";
api.jobRec("enforcer").rank = 0;
assert(api.rankName(api.byId("enforcer"), api.jobRec("enforcer")) === "Constable", "ORICL start");
assert(api.maxRank(api.byId("enforcer")) === 3, "ORICL three ranks");

assert(LT.hasNode("kitty.job.desk"), "desk node");
go("SHOPPING_ARCADE_NYANS_SHOP", "nyan.shop");
var desk = LT.getNode("kitty.job.desk");
var titles = desk.getResponses().map(function (r) { return r.title; });
assert(titles.indexOf("Work a shift") >= 0, "desk has Work a shift when hired");

go("ANGELS_KISS_ENTRANCE");
LT.game.flags.hasProstitutionLicense = false;
api.jobRec("brothel").hired = false;
var brothelAsk = LT.getNode("kitty.job.desk").getResponses().filter(function (r) { return r && r.title === "Apply for work"; })[0];
assert(brothelAsk && brothelAsk.disabled, "Apply for work disabled without license");

go("SHOPPING_ARCADE_KATES_SHOP", "kate.shop");
LT.game.currentNode = { id: "kate.shop" };
LT.setResponses([]);
assert(LT._lastResponses.some(function (r) { return r && r.title === "Staff board"; }), "Staff board inject");
LT.game.currentNode = { id: "sex.scene" };
LT.setResponses([]);
assert(!LT._lastResponses.some(function (r) { return r && r.title === "Staff board"; }), "no board on sex");
LT.game.currentNode = { id: "boot.menu" };
LT.setResponses([]);
assert(!LT._lastResponses.some(function (r) { return r && r.title === "Staff board"; }), "no board on boot");

go("SHOPPING_ARCADE_NYANS_SHOP", "nyan.shop");
api.flags().lastSex.nyan = -1;
Math.random = function () { return 0; };
LT.game.textStart = "";
LT.emitWalk();
Math.random = rnd;
assert(/cubicle|racks|counter|Ryn/i.test(LT.game.textStart), "onWalk can append workplace sex");

go("SHOPPING_ARCADE_VICKYS_SHOP", "vicky.shop");
api.jobRec("vicky").hired = false;
var applyBtn = LT.getNode("kitty.job.desk").getResponses().filter(function (r) { return r && r.title === "Apply for work"; })[0];
assert(applyBtn, "Vicky Apply for work");
applyBtn.effects();
var applyQ = LT.getNode("kitty.job.applyQ");
var qi;
for (qi = 0; qi < 3; qi++) {
  var answers = applyQ.getResponses().filter(Boolean);
  assert(answers.length >= 1 && answers[0].title !== "Back", "question " + (qi + 1) + " is still the interview");
  assert(
    answers[0].nextDialogue === (qi === 2 ? "kitty.job.desk" : "kitty.job.applyQ"),
    qi === 2 ? "third answer leaves the interview" : "question " + (qi + 1) + " continues"
  );
  answers[0].effects();
}
assert(api.jobRec("vicky").hired, "three good answers hire");
assert(api.flags().apply.q === 3, "apply counter stops at 3");
var afterQs = applyQ.getResponses().filter(Boolean);
assert(afterQs.length === 1 && afterQs[0].title === "Back", "no more interview answers after the last question");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittyJobsEstablishmentsExpansion"; }), "mod menu");
var html = LT.listModMenus().filter(function (m) { return m.id === "KittyJobsEstablishmentsExpansion"; })[0].getHtml();
assert(/Nyan/.test(html) && /Enable/.test(html), "mod menu lists venues");

var modText = fs.readFileSync(path.join(root, "mods/KittyJobsEstablishmentsExpansion/KittyJobsEstablishmentsExpansion.mod"), "utf8");
assert(/Add Boot:/.test(modText) && !/Add Javascript:/.test(modText), "pattern B boot only");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL JOBS SMOKES PASSED");
