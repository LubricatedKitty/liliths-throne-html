/* node "Liliths Throne HTML/tools/smoke_characters_present.js" */
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
  window: null,
  document: document,
  localStorage: {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
  },
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  LT: { TEXT: {} },
};
context.window = context;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
[
  "js/lt.js",
  "js/paths.js",
  "js/engine/colours.js",
  "js/character/enums.js",
  "js/character/bodyEnums.js",
  "js/character/body.js",
  "js/character/player.js",
  "js/character/appearance.js",
  "js/ui/openUI.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/slavery.js",
  "js/character/npcs.js",
  "js/character/npcBodies.js",
  "js/engine/game.js",
  "js/engine/properties.js",
  "js/ui/menus/charactersPresent.js",
].forEach(load);

var LT = context.LT;
LT.game.started = true;
LT.game.player = {
  name: "Alex",
  getName: function () { return "Alex"; },
  location: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" },
};
LT.game.secondsPassed = 10 * 3600;
LT.ensureHouseNpcs();
LT.ensureFinch();
LT.ensureHannah();

var here = LT.npcAtCurrentTile();
assert(here.some(function (n) { return n.id === "lilaya"; }), "Lilaya is present in the daytime lab");
assert(here.some(function (n) { return n.id === "rose"; }), "Rose is present in the daytime lab");

assert(LT.defaultPortraitUrl("lilaya").indexOf("assets/characters/lilaya/clothed1.png") >= 0, "Lilaya has bundled official art");
assert(LT.portraitHtml("lilaya").indexOf("clothed1.png") >= 0, "portraitHtml falls back to bundled art");
assert(LT.getCharacterImage("lilaya") === "", "Bundled art is not stored as a custom URL");
assert(!LT.setCharacterImage("lilaya", "https://example.com/custom.png"), "http(s) portrait URLs are refused");
assert(LT.setCharacterImage("lilaya", "images/13-Morwyn Blackhorn.png"), "In-folder portrait paths are accepted");
assert(LT.portraitHtml("lilaya").indexOf("images/13-Morwyn Blackhorn.png") >= 0, "Custom local path overrides bundled art");
assert(LT.getCharacterImage("lilaya") === "images/13-Morwyn Blackhorn.png", "Custom local path is what the save stores");
LT.setCharacterImage("lilaya", "");
assert(LT.portraitHtml("lilaya").indexOf("clothed1.png") >= 0, "Clearing the custom URL restores bundled art");

assert(LT.portraitHtml("felicia").indexOf("felicia/clothed1.png") >= 0, "Felicia has generated default art");
assert(LT.portraitHtml("ashley").indexOf("ashley/clothed1.png") >= 0, "Ashley has generated default art");
assert(LT.portraitHtml("jules").indexOf("jules/clothed1.png") >= 0, "Jules has generated default art");
assert(LT.portraitHtml("hannah").indexOf("hannah/clothed1.png") >= 0, "Hannah has generated default art");
assert(LT.portraitHtml("finch").indexOf("finch/clothed1.png") >= 0, "Finch has generated default art");

LT.setProperty("artwork", false);
assert(LT.portraitHtml("lilaya") === "", "Artwork option off hides bundled portraits");
assert(LT.portraitHtml("player") === "", "Player still has no default portrait");
LT.setProperty("artwork", true);

var node = LT.getNode("characters.present");
LT.game.flags.presentNpcId = "lilaya";
var html = node.getContent();
assert(html.indexOf("clothed1.png") >= 0, "Inspect screen shows the portrait");
assert(html.indexOf("char-artwork") >= 0, "Inspect screen uses the large artwork frame");
assert(html.indexOf("data-tip-char='lilaya'") >= 0, "Inspect name can be hovered");
assert(typeof LT.characterHoverTooltipHtml === "function", "Name hover tooltip helper exists");
var tip = LT.characterHoverTooltipHtml("lilaya");
assert(tip.indexOf("tip-portrait") >= 0 && tip.indexOf("clothed1.png") >= 0, "Name hover tooltip shows the character image");
var fullTip = LT.characterHoverTooltipHtml("lilaya", { full: true });
assert(fullTip.indexOf("tip-portrait-full") >= 0 && fullTip.indexOf("clothed1.png") >= 0, "Characters Present hover shows the full portrait");
assert(/Lilaya/.test(html), "Inspect screen names Lilaya");
assert(html.indexOf("Overview") >= 0 && html.indexOf("Face") >= 0 && html.indexOf("Chest") >= 0, "Inspect screen has official appearance sections");
assert(html.indexOf("Personality") >= 0 && html.indexOf("Stats") >= 0, "Inspect screen has personality and stats");
assert(html.indexOf("half-demon") >= 0 || html.indexOf("demon") >= 0, "Lilaya uses her official half-demon body");

var responses = node.getResponses();
assert(responses[0] && responses[0].title === "Back", "Slot 0 is Back");
assert(responses.some(function (r) { return r.title === "Lilaya" && r.disabled; }), "Viewed character is disabled");
assert(responses.some(function (r) { return r.title === "Rose" && !r.disabled; }), "Other present characters are selectable");

assert(LT.game.npcs.hannah.fullRace === "hyena-girl", "Hannah matches official spotted-hyena race");

["lilaya", "rose", "scarlett", "helena", "candi", "amber", "nyan", "kate", "bunny", "loppy", "kalahari", "kruger", "angel", "katherine", "arthur", "brax", "vicky", "felicia", "ashley", "jules", "hannah", "finch"].forEach(function (id) {
  var rel = path.join(root, "assets", "characters", id, "clothed1.png");
  assert(fs.existsSync(rel), "Portrait file exists for " + id);
});

var grids = fs.readFileSync(path.join(root, "js", "maps", "allGrids.js"), "utf8");
assert(grids.indexOf("svgFile") < 0, "allGrids.js no longer embeds svgFile paths");
assert(grids.toLowerCase().indexOf("liliths throne v0.4.10") < 0, "Play JS does not point at the 0.4.10 folder");

if (fails.length) {
  console.error("\n" + fails.length + " failed");
  process.exit(1);
}
console.log("\nAll characters-present checks passed.");
