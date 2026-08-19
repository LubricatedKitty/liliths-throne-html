/* node "Liliths Throne HTML/tools/smoke_enslave.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

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
  window: null,
  document: document,
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
  "js/items/items.js",
  "js/character/slavery.js",
  "js/engine/properties.js",
  "js/engine/preferences.js",
  "js/engine/game.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/engine/utilText.js",
  "js/text/enslavement.js",
  "js/text/angelsKiss.js",
  "js/text/ralphsSnacks.js",
  "js/text/slaveryAdministration.js",
  "js/text/alleywayAttack.js",
  "js/content/world.js",
  "js/content/alleys.js",
  "js/content/slaverAlley.js",
  "js/content/angelsKiss.js",
  "js/content/shoppingArcade.js",
].forEach(load);

var LT = context.LT;
LT.setTitle = function () {};
LT.setChrome = function () {};
LT.openUI = function () {};
LT.setResponses = function () {};
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.money = 20000;
LT.game.player.location = { world: "DOMINION", place: "DOMINION_BACK_ALLEYS", x: 1, y: 0 };
LT.game.flags = {};

var mugger = LT.generateAlleyMugger({ feminine: true, race: { id: "cat-morph", fem: "cat-girl", masc: "cat-boy" }, level: 2, prostitute: false });
LT.game.setContent("alley.victory");
var vic = LT.getNode("alley.victory").getResponses(LT.game, 0).filter(Boolean);
var ens = vic.filter(function (r) { return r.title === "Enslave"; })[0];
assert(ens, "Victory offers Enslave");
assert(ens.disabled, "Enslave is disabled without a license or collar");

LT.game.flags.hasSlaverLicense = true;
vic = LT.getNode("alley.victory").getResponses(LT.game, 0).filter(Boolean);
ens = vic.filter(function (r) { return r.title === "Enslave"; })[0];
assert(ens.disabled, "Enslave is disabled without a collar even with a license");

LT.addItem(LT.game.player, "innoxia_bdsm_metal_collar");
assert(LT.countItems(LT.game.player, "innoxia_bdsm_metal_collar") === 1, "Collar is in inventory");
vic = LT.getNode("alley.victory").getResponses(LT.game, 0).filter(Boolean);
ens = vic.filter(function (r) { return r.title === "Enslave"; })[0];
assert(ens && !ens.disabled, "Enslave is available with a license and a collar");

LT.game.setContent("alley.enslave");
var text = LT.getNode("alley.enslave").getContent(LT.game);
assert(text.indexOf("Slave Registered") >= 0, "Success uses official slave-registered lettering");
assert(text.indexOf("metal collar") >= 0, "Success names the metal collar");
assert(text.indexOf("[npc.") < 0 && text.indexOf("#IF") < 0, "Enslavement text parsed");
assert(LT.countItems(LT.game.player, "innoxia_bdsm_metal_collar") === 0, "Collar is consumed");
assert(LT.pendingSlaves().length === 1, "Slave is waiting at Administration");
assert(LT.pendingSlaves()[0].name === mugger.name, "Waiting slave keeps the mugger's name");

var demon = LT.generateAlleyMugger({ dark: true, feminine: true, race: { id: "demon", fem: "succubus", masc: "incubus" }, level: 4 });
LT.addItem(LT.game.player, "innoxia_bdsm_metal_collar");
LT.game.setContent("alley.victory");
vic = LT.getNode("alley.victory").getResponses(LT.game, 0).filter(Boolean);
ens = vic.filter(function (r) { return r.title === "Enslave"; })[0];
assert(ens.disabled, "Demons cannot be enslaved");
assert(/demon/i.test(ens.tooltipText), "Demon refusal names the official warrant");

LT.game.flags.hasSlaverLicense = true;
LT.game.setContent("admin.inside");
var admin = LT.getNode("admin.inside").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(admin.indexOf("Trade") >= 0, "Finch Trade is live with a slaver license");
assert(admin.some(function (t) { return t.indexOf("Collect slaves") === 0; }), "Collect slaves appears when someone is waiting");

LT.game.setContent("finch.collect");
var collect = LT.getNode("finch.collect").getResponses(LT.game, 0).filter(Boolean);
var take = collect.filter(function (r) { return r.title.indexOf("Collect ") === 0; })[0];
assert(take, "Collect names the waiting slave");
take.effects();
assert(LT.pendingSlaves().length === 0, "Collect clears the waiting list");
assert(LT.ownedSlaves().length === 1, "Collect adds them to owned slaves");

LT.game.player.money = 20000;
LT.game.setContent("finch.trade");
var trade = LT.getNode("finch.trade").getResponses(LT.game, 0).filter(Boolean);
var buyCollar = trade.filter(function (r) { return r.title.indexOf("metal collar") >= 0; })[0];
assert(buyCollar, "Finch sells metal collars");
assert(LT.itemBuyPrice("innoxia_bdsm_metal_collar") === 3750, "Collar buy price is official 1.5× 2500");
var beforeBuy = LT.countItems(LT.game.player, "innoxia_bdsm_metal_collar");
buyCollar.effects();
assert(LT.countItems(LT.game.player, "innoxia_bdsm_metal_collar") === beforeBuy + 1, "Buying a collar adds it");

LT.game.flags.hasProstitutionLicense = false;
LT.game.flags.angelIntroduced = false;
LT.game.setContent("place.ANGELS_KISS_OFFICE");
var office = LT.getNode("place.ANGELS_KISS_OFFICE").getResponses(LT.game, 0).filter(Boolean);
var lic = office.filter(function (r) { return r.title.indexOf("License") === 0; })[0];
assert(lic && !lic.disabled, "Angel offers a 5000-flame prostitution license");
lic.effects();
assert(LT.game.flags.hasProstitutionLicense, "Buying Angel's license sets the flag");
assert(LT.getMoney() === 20000 - 3750 - 5000, "License costs official 5000");

var purchased = LT.parseFromXML("places/dominion/redLightDistrict/angelsKiss", "OFFICE_LICENSE_PURCHASE");
assert(purchased.indexOf("license") >= 0 || purchased.indexOf("License") >= 0 || purchased.indexOf("Angel") >= 0, "License purchase uses official office text");

var ralph = LT.parseFromXML("places/dominion/shoppingArcade/ralphsSnacks", "EXTERIOR");
assert(ralph.indexOf("Ralph") >= 0, "Ralph exterior is official");
assert(LT.shopItemIds("ralph").indexOf("innoxia_race_cat_felines_fancy") >= 0, "Ralph stocks Feline's Fancy");
assert(LT.shopItemIds("vicky").indexOf("innoxia_race_demon_liliths_gift") >= 0, "Vicky stocks Lilith's Gift");

LT.game.setContent("ralph.shop");
var ralphR = LT.getNode("ralph.shop").getResponses(LT.game, 0).filter(Boolean);
var fancy = ralphR.filter(function (r) { return r.title.indexOf("Feline") >= 0; })[0];
assert(fancy, "Ralph sells Feline's Fancy");
fancy.effects();
assert(LT.countItems(LT.game.player, "innoxia_race_cat_felines_fancy") === 1, "Buying a TF drink adds it");
var used = LT.useCarriedItem(LT.game.player, LT.game.player.items.filter(function (it) { return it.id === "innoxia_race_cat_felines_fancy"; })[0]);
assert(/cat-girl|cat-boy|cat-morph/i.test(used + (LT.game.player.fullRace || "")), "Feline's Fancy applies a cat transformation");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("All enslavement / shop / license checks passed.");
