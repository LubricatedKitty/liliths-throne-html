/* node "Liliths Throne HTML/tools/smoke_companion_loot.js" */
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
  window: {},
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: { TEXT: {}, ITEMS: {}, game: { started: true, player: { items: [], money: 0, location: { world: "DOMINION", place: "DOMINION_STREET", x: 3, y: 2 } }, flags: {}, textStart: "" }, Colour: {} },
};
context.window.LT = context.LT;
context.window.document = context.document;

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
["js/content/nodes.js", "js/engine/response.js", "js/engine/modMenu.js", "js/content/bootFlow.js"].forEach(load);

var LT = context.LT;
LT.ITEMS = {
  cheap: { id: "cheap", kind: "consumable", name: "button", value: 10 },
  mid: { id: "mid", kind: "consumable", name: "tea", value: 150 },
  high: { id: "high", kind: "gift", name: "perfume", value: 400 },
  best: { id: "best", kind: "consumable", name: "nectar", value: 900 },
  questy: { id: "questy", kind: "quest", name: "plot", value: 50 },
};
LT.addItem = function (player, id) {
  player.items.push({ id: id });
  return player.items[player.items.length - 1];
};
LT.incrementMoney = function (n) {
  LT.game.player.money += n;
  return "";
};

function jsFromMod(rel) {
  var text = fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
  var lines = text.split("\n");
  var collecting = false;
  var body = [];
  var i;
  for (i = 0; i < lines.length; i++) {
    if (/^Add Javascript(?:\s+\[[^\]]+\])?:\s*$/.test(lines[i].trim())) {
      collecting = true;
      continue;
    }
    if (collecting && /^(Replace|Add Javascript|Add Content|Add Boot)(?:\s+\[[^\]]+\])?:\s*$/.test(lines[i].trim())) break;
    if (collecting) body.push(lines[i]);
  }
  return body.join("\n");
}
vm.runInNewContext(fs.readFileSync(path.join(root, "mods/KittyCompanionAutoLoot/KittyCompanionAutoLoot.js"), "utf8"), context, { filename: "KittyCompanionAutoLoot.js" });

var api = LT.kittyCompanionAutoLoot;
assert(api, "API exported");
assert(api.classify({ location: { placeType: "DOMINION_BACK_ALLEYS" } }) === "alley", "alley classify");
assert(api.classify({ location: { placeType: "DOMINION_STREET" } }) === "street", "street classify");
assert(api.allowed("street", "streets") && !api.allowed("alley", "streets"), "streets filter");
assert(api.allowed("alley", "both") && api.allowed("street", "both"), "both filter");
assert(api.lootPool("common").length === 1 && api.lootPool("common")[0].id === "cheap", "common pool skips quest");
assert(api.lootPool("really")[0].id === "best", "really-good pool");

assert(api.rollQuality(function () { return 0; }) === "really", "1/100 bracket");
assert(api.rollQuality(function () { return 0.05; }) === "very", "1/10 bracket");
assert(api.rollQuality(function () { return 0.2; }) === "good", "1/5 bracket");
assert(api.rollQuality(function () { return 0.9; }) === "common", "remainder is common");

var seq = [0.5, 0.9];
var i = 0;
var find = api.tryWalk({ location: { placeType: "DOMINION_STREET" } }, {
  random: function () {
    return seq[i++] != null ? seq[i - 1] : 0.9;
  },
});
assert(!find, "normal frequency can miss");

api.saveCfg(Object.assign(api.loadCfg(), { frequency: "constant", lootMoney: false, area: "streets", notify: "chatter" }));
i = 0;
seq = [0, 0.9];
find = api.tryWalk({ location: { placeType: "DOMINION_STREET" } }, {
  random: function () {
    return seq[Math.min(i++, seq.length - 1)];
  },
});
assert(find && find.kind === "item" && find.tier === "common", "constant street walk finds common item");
assert(LT.game.player.items.some(function (it) { return it.id === "cheap"; }), "item added");
assert(LT.game.textStart.indexOf("Your companion") >= 0, "chatter uses generic companion");

api.saveCfg(Object.assign(api.loadCfg(), { area: "alleys" }));
LT.game.textStart = "";
find = api.tryWalk({ location: { placeType: "DOMINION_STREET" } }, { random: function () { return 0; } });
assert(!find, "streets ignored when set to alleys");

var menus = LT.listModMenus();
assert(menus.some(function (m) { return m.id === "KittyCompanionAutoLoot"; }), "registered in mod menu");
LT.game.flags.modMenuId = "KittyCompanionAutoLoot";
var page = LT.getNode("boot.mod-config").getContent();
assert(page.indexOf("data-mod-menu=\"KittyCompanionAutoLoot\"") >= 0, "injector host present");
assert(page.indexOf("kcl-area") >= 0 && page.indexOf("Alleys") >= 0, "area dropdown");
assert(page.indexOf("kcl-freq") >= 0, "frequency dropdown");
assert(page.indexOf("kcl-name") < 0 && page.indexOf("Companion name") < 0, "no companion-name field");
assert(api.defaults.companionName == null, "defaults do not name a companion");

var menuTitles = LT.getNode("boot.menu").getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(menuTitles.indexOf("Mod Menu") >= 0, "main menu Mod Menu");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL COMPANION LOOT SMOKES PASSED");
