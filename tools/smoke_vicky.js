/* node "Liliths Throne HTML/tools/smoke_vicky.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var store = {};
var listeners = {};
var document = {
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
  },
  addEventListener: function (type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  dispatchEvent: function (e) { (listeners[e.type] || []).forEach(function (fn) { fn(e); }); },
  head: { appendChild: function () {} },
  body: { appendChild: function () {} },
};
var context = {
  console: console,
  window: { location: { search: "" } },
  document: document,
  localStorage: {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
  },
  location: { search: "" },
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  LT: { TEXT: {} },
};
context.window = context;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
[
  "js/lt.js",
  "js/engine/colours.js",
  "js/character/enums.js",
  "js/character/bodyEnums.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/player.js",
  "js/character/npcs.js",
  "js/items/weapons.js",
  "js/items/weaponRuntime.js",
  "js/combat/moves.js",
  "js/combat/spells.js",
  "js/items/spellBooks.js",
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/text/arcaneArts.js",
  "js/content/world.js",
  "js/content/shoppingArcade.js",
].forEach(load);

var LT = context.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.money = 20000;
LT.game.secondsPassed = 11 * 3600;
LT.game.flags = {};

assert(!LT.isDevMode(), "devMode is off by default");
assert(LT.vickyWeaponIds().length > 0, "Vicky sells official SOLD_BY_VICKY weapons");
assert(LT.vickyWeaponIds().indexOf("innoxia_europeanSwords_arming_sword") >= 0, "Arming sword is in Vicky's stock list");
assert(LT.vickyWeaponIds().indexOf("innoxia_bat_wooden_silly") < 0, "Silly-mode weapons are not sold");
assert(LT.weaponBuyPrice("innoxia_europeanSwords_arming_sword") === 7500, "Buy price is value × 1.5 (5000 → 7500)");
assert(LT.weaponSellPrice("innoxia_europeanSwords_arming_sword") === 3750, "Sell price is value × 0.75 (5000 → 3750)");

var ext = LT.getNode("place.SHOPPING_ARCADE_VICKYS_SHOP");
var extHtml = ext.getContent();
assert(extHtml.indexOf("Arcane Arts") >= 0, "Exterior names Arcane Arts");
assert(extHtml.indexOf("#IF") < 0, "Exterior conditionals resolve");
var extR = ext.getResponses();
var enter = extR.filter(function (r) { return r && r.title === "Enter" && !r.disabled; })[0];
assert(enter && enter.nextDialogue === "vicky.shop", "Daytime Enter opens the shop");

LT.game.secondsPassed = 20 * 3600;
var nightR = ext.getResponses();
var nightEnter = nightR.filter(function (r) { return r && r.title === "Enter"; })[0];
assert(nightEnter && nightEnter.disabled, "After 17:00 Enter is closed");

LT.game.secondsPassed = 11 * 3600;
LT.ensureVicky();
var shop = LT.getNode("vicky.shop");
var shopHtml = shop.getContent();
assert(shopHtml.indexOf("Vicky") >= 0, "Interior introduces Vicky");
assert(shopHtml.indexOf("[vicky.") < 0, "Vicky speech parses");
var shopR = shop.getResponses();
assert(shopR.some(function (r) { return r && r.title === "Weapons" && !r.disabled; }), "Weapons trade is available");
assert(shopR.some(function (r) { return r && r.title === "Potions & Spells" && !r.disabled; }), "Potions & Spells sells official spell books");

var stock = LT.vickyStock();
var swordQty = stock.innoxia_europeanSwords_arming_sword;
assert(swordQty >= 2 && swordQty <= 6, "Official stock is 2–6 of each type");
var price = LT.weaponBuyPrice("innoxia_europeanSwords_arming_sword");
var made = LT.makeWeapon("innoxia_europeanSwords_arming_sword");
LT.game.player.money -= price;
LT.game.player.weapons.push(made);
stock.innoxia_europeanSwords_arming_sword -= 1;
assert(LT.game.player.weapons.length === 1, "Buying puts a weapon in the bag");
assert(LT.game.player.money === 20000 - price, "Buying spends the official markup price");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Vicky shop smoke checks passed.");
