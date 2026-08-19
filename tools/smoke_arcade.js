/* node "Liliths Throne HTML/tools/smoke_arcade.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var document = {
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
  },
  addEventListener: function (type, fn) { (this._l = this._l || {})[type] = (this._l[type] || []).concat(fn); },
  dispatchEvent: function (e) { ((this._l && this._l[e.type]) || []).forEach(function (fn) { fn(e); }); },
  head: { appendChild: function () {} },
  body: { appendChild: function () {} },
};
var context = { console: console, window: null, document: document, CustomEvent: function (t, i) { this.type = t; this.detail = i && i.detail; }, LT: { TEXT: {} } };
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
  "js/character/clothing.js",
  "js/character/npcs.js",
  "js/items/items.js",
  "js/engine/game.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/engine/utilText.js",
  "js/text/clothingEmporium.js",
  "js/text/succubisSecrets.js",
  "js/text/dreamLover.js",
  "js/text/angelsKiss.js",
  "js/content/world.js",
  "js/content/arcadeShops.js",
  "js/content/angelsKiss.js",
].forEach(load);

var LT = context.LT;
LT.setTitle = function () {};
LT.setChrome = function () {};
LT.openUI = function () {};
LT.setResponses = function () {};
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.money = 20000;
LT.game.player.wardrobe = [];
LT.game.flags = {};
LT.game.secondsPassed = 12 * 3600;

assert(LT.parseFromXML("places/dominion/shoppingArcade/clothingEmporium", "NYAN_EXTERIOR").indexOf("Nyan") >= 0, "Nyan exterior is official");
assert(LT.parseFromXML("places/dominion/shoppingArcade/succubisSecrets", "EXTERIOR").indexOf("Succubi") >= 0 || LT.parseFromXML("places/dominion/shoppingArcade/succubisSecrets", "EXTERIOR").indexOf("salon") >= 0, "Kate exterior is official");
assert(LT.parseFromXML("places/dominion/shoppingArcade/dreamLover", "EXTERIOR").indexOf("Dream") >= 0, "Ashley exterior is official");

LT.game.setContent("nyan.shop");
var nyan = LT.getNode("nyan.shop").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(nyan.indexOf("Female clothing") >= 0, "Nyan offers female clothing");
assert(nyan.indexOf("Male clothing") >= 0, "Nyan offers male clothing");
LT.game.setContent("nyan.female");
var fem = LT.getNode("nyan.female").getResponses(LT.game, 0).filter(Boolean);
var dress = fem.filter(function (r) { return r.title.indexOf("skater dress") >= 0; })[0];
assert(dress && !dress.disabled, "Nyan sells a skater dress");
var money = LT.getMoney();
dress.effects();
assert(LT.getMoney() < money, "Buying clothing costs flames");
assert(LT.game.player.wardrobe.some(function (it) { return it.id === "skater_dress"; }), "Bought clothing goes to the wardrobe");

assert(LT.KATE_COSMETICS_COST === 200, "Kate cosmetics cost is official 200");
LT.game.setContent("kate.shop");
var kate = LT.getNode("kate.shop").getResponses(LT.game, 0).filter(Boolean);
assert(kate.some(function (r) { return r.title.indexOf("Hair") === 0; }), "Kate offers Hair");
assert(kate.some(function (r) { return r.title.indexOf("Cosmetics") === 0; }), "Kate offers Cosmetics");
var hair = kate.filter(function (r) { return r.title.indexOf("Hair") === 0; })[0];
hair.effects();
assert(LT.game.player.hairColour === "auburn", "Hair service applies a hair colour");

LT.game.setContent("ashley.shop");
var ash = LT.getNode("ashley.shop").getResponses(LT.game, 0).filter(Boolean);
assert(ash.some(function (r) { return r.title === "Explore shelves"; }), "Ashley has Explore shelves");
assert(ash.some(function (r) { return r.title.indexOf("dildo") >= 0; }), "Ashley sells a dildo");
var toy = ash.filter(function (r) { return r.title.indexOf("dildo") >= 0; })[0];
toy.effects();
assert(LT.countItems(LT.game.player, "innoxia_toy_dildo") === 1, "Buying a toy adds it");

assert(LT.BUNNY_SEX_COST === 1500, "Bunny costs official 1500");
assert(LT.LOPPY_SEX_COST === 2000, "Loppy costs official 2000");
assert(LT.WHORE_PAY === 2000, "Self-whoring pays official 2000");
LT.game.setContent("place.ANGELS_KISS_BEDROOM_BUNNY");
var bun = LT.getNode("place.ANGELS_KISS_BEDROOM_BUNNY").getResponses(LT.game, 0).filter(Boolean);
assert(bun.some(function (r) { return r.title === "Enter"; }), "Bunny bedroom offers Enter");
LT.game.setContent("bunny.enter");
var enter = LT.getNode("bunny.enter").getResponses(LT.game, 0).filter(Boolean);
assert(enter.some(function (r) { return r.title.indexOf("Sex (1500)") === 0; }), "Bunny sex is 1500");
assert(LT.BUNNY_LOPPY_THREESOME_COST === 5000, "Bunny/Loppy threesome costs official 5000");
assert(enter.some(function (r) { return r.title.indexOf("Threesome (5000)") === 0; }), "Bunny room offers the official threesome");
assert(enter.some(function (r) { return r.title === "Decline"; }), "Bunny room offers Decline");
LT.game.player.money = 0;
var broke = LT.getNode("bunny.enter").getResponses(LT.game, 0).filter(Boolean);
assert(broke.some(function (r) { return r.title.indexOf("Threesome") === 0 && r.disabled; }), "threesome disables without 5000 flames");
LT.game.player.money = 20000;
var three = enter.filter(function (r) { return r.title.indexOf("Threesome (5000)") === 0; })[0];
three.effects();
assert(LT.sex.active && LT.sex.manager === "bunny_loppy", "Bunny threesome starts the sisters manager");
assert(LT.sex.participants.length === 3, "threesome includes Bunny and Loppy");
assert(LT.sex.slotOf(LT.sex.player) === "doggy_dom", "player is behind both sisters");
assert(LT.sex.slotOf(LT.game.npcs.bunny) === "doggy_all_fours", "Bunny presents on all fours");
assert(LT.sex.slotOf(LT.game.npcs.loppy) === "doggy_all_fours_2", "Loppy presents on all fours beside her");
assert(LT.sex.pairLegal("penis_vagina", LT.sex.player, LT.game.npcs.bunny) && LT.sex.pairLegal("penis_vagina", LT.sex.player, LT.game.npcs.loppy), "player can take either sister from behind");
assert(!LT.sex.pairLegal("kiss", LT.sex.player, LT.game.npcs.bunny), "doggy threesome still denies kissing the girl on all fours");
assert(LT.game.player.money === 15000, "threesome deducts 5000");
assert(LT.game.flags.bunnyIntroduced && LT.game.flags.loppyIntroduced, "threesome introduces both sisters");
assert(/Loppy|loppy|sister/.test(LT.sex.startText || LT.sex.lastResolution), "threesome lead-in fetches Loppy");
LT.game.setContent("loppy.enter");
var lop = LT.getNode("loppy.enter").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(lop.some(function (t) { return t.indexOf("Threesome (5000)") === 0; }), "Loppy room also offers the threesome");
assert(lop.indexOf("Decline") >= 0, "Loppy room offers Decline");

LT.game.flags.hasProstitutionLicense = true;
LT.game.player.location = { world: "ANGELS_KISS_FIRST_FLOOR", place: "ANGELS_KISS_BEDROOM", x: 1, y: 0 };
LT.game.setContent("place.ANGELS_KISS_BEDROOM");
var room = LT.getNode("place.ANGELS_KISS_BEDROOM").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(room.indexOf("Wait (submissive)") >= 0, "Licensed first-floor rooms offer Wait (submissive)");
assert(room.indexOf("Wait (dominant)") >= 0, "Licensed first-floor rooms offer Wait (dominant)");

LT.game.player.location.world = "ANGELS_KISS_GROUND_FLOOR";
LT.game.setContent("place.ANGELS_KISS_BEDROOM");
var ground = LT.getNode("place.ANGELS_KISS_BEDROOM").getContent(LT.game);
assert(ground.indexOf("first floor") >= 0 || ground.indexOf("upstairs") >= 0, "Ground-floor rooms tell you to use the first floor");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("All arcade / Angel's Kiss shop checks passed.");
