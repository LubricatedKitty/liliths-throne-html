/* node "Liliths Throne HTML/tools/smoke_harpy_trio.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var listeners = {};
var store = {};
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
  "js/engine/colours.js",
  "js/character/enums.js",
  "js/character/bodyEnums.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/player.js",
  "js/character/npcs.js",
  "js/engine/properties.js",
  "js/engine/game.js",
  "js/items/items.js",
  "js/items/harpyMatriarch.js",
  "js/combat/attack.js",
  "js/combat/moves.js",
  "js/combat/combat.js",
  "js/content/combatNodes.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/engine/utilText.js",
  "js/text/harpyNests.js",
  "js/text/harpyBimbo.js",
  "js/text/harpyDominant.js",
  "js/text/harpyNympho.js",
  "js/maps/allGrids.js",
  "js/content/world.js",
  "js/content/harpyNests.js",
  "js/content/harpyTrio.js",
].forEach(load);

var LT = context.LT;
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");
LT.game.player.location = { world: "HARPY_NEST", place: "HARPY_NESTS_ENTRANCE_ENFORCER_POST" };
LT.game.player.money = 0;
LT.game.secondsPassed = 11 * 3600;
LT.game.flags.hasHarpyNestAccess = true;

var post = LT.getNode("place.HARPY_NESTS_ENTRANCE_ENFORCER_POST").getResponses(LT.game, 0);
var angry = post.filter(function (r) { return r && r.title === "Angry Harpies"; })[0];
assert(angry && angry.nextDialogue === "harpy.angry", "Access already granted offers Angry Harpies");

var riots = LT.parseFromXML("places/dominion/harpyNests/generic", "ENTRANCE_ENFORCER_POST_ASK_ABOUT_RIOTS");
assert(riots.indexOf("harpy") >= 0 || riots.indexOf("Harpy") >= 0, "Riots briefing names harpies");
assert(riots.indexOf("#IF") < 0, "Riots briefing conditionals resolve");

LT.getNode("harpy.angry").getResponses(LT.game, 0)[1].effects();
assert(LT.game.flags.harpyQuest === "HARPY_PACIFICATION_ONE", "Follow starts HARPY_PACIFICATION_ONE");

var yellow = LT.getNode("place.HARPY_NESTS_HARPY_NEST_YELLOW");
var ext = yellow.getContent();
assert(ext.indexOf("#IF") < 0, "Brittany exterior parses");
var extR = yellow.getResponses(LT.game, 0);
var approach = extR.filter(function (r) { return r && String(r.title).indexOf("Approach") === 0 && !r.disabled; })[0];
assert(approach && approach.nextDialogue === "bimbo.approach", "Quest makes Brittany approachable");

LT.ensureBrittany();
LT.ensureLauren();
var app = LT.getNode("bimbo.approach").getContent();
assert(app.indexOf("Brittany") >= 0 || app.indexOf("bleach") >= 0, "Approach uses official bimbo text");
assert(app.indexOf("#IF") < 0, "Approach conditionals resolve");

var appR = LT.getNode("bimbo.approach").getResponses(LT.game, 0);
assert(appR.filter(function (r) { return r && r.title === "Talk"; }).length === 1, "Approach offers Talk");
assert(appR.filter(function (r) { return r && r.title === "Call her ugly"; }).length === 1, "Approach offers Call her ugly");
var queen = appR.filter(function (r) { return r && r.title === "Bimbo queen"; })[0];
assert(queen && queen.disabled, "Bimbo queen is locked without fetish and strong femininity");
LT.game.player.fetishes = { FETISH_BIMBO: true };
LT.game.player.femininityValue = 90;
queen = LT.getNode("bimbo.approach").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Bimbo queen" && !r.disabled; })[0];
assert(queen && queen.nextDialogue === "bimbo.queen", "Bimbo queen unlocks with fetish and strong femininity");
var qHtml = LT.getNode("bimbo.queen").getContent();
assert(qHtml.indexOf("lollipop") >= 0 || qHtml.indexOf("queen") >= 0, "Bimbo queen uses official submission text");

LT.game.player.fetishes = { FETISH_DOMINANT: true };
var dQueen = LT.getNode("dominant.approach").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Usurp throne" && !r.disabled; })[0];
assert(dQueen && dQueen.nextDialogue === "dominant.queen", "Usurp throne unlocks with dominant fetish");
assert(LT.getNode("dominant.queen").getContent().indexOf("perfume") >= 0, "Diana queen scene offers official perfume");

LT.game.player.perks = { NYMPHOMANIAC: true };
var nQueen = LT.getNode("nympho.approach").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Nympho Queen" && !r.disabled; })[0];
assert(nQueen && nQueen.nextDialogue === "nympho.queen", "Nympho Queen unlocks with the perk");
assert(LT.getNode("nympho.queen").getContent().indexOf("lollipop") >= 0, "Lexi queen scene offers official lollipop");

var talk = LT.getNode("bimbo.talk").getContent();
assert(talk.indexOf("Enforcer") >= 0, "Talk uses official Enforcer request");
assert(talk.indexOf("[bimbo") < 0, "Brittany speech parses in talk");

var forceR = LT.getNode("bimbo.talk").getResponses(LT.game, 0);
var force = forceR.filter(function (r) { return r && r.title === "Force compliance"; })[0];
assert(force && force.nextDialogue === "bimbo.force", "Talk offers Force compliance");

var fight = LT.getNode("bimbo.force").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Fight"; })[0];
assert(fight && fight.nextDialogue === "combat.fight", "Force starts Lauren's fight");

LT.getNode("bimbo.beatMat").applyPreParsingEffects && LT.getNode("bimbo.beatMat").applyPreParsingEffects();
var winHtml = LT.pacifyHarpyNest("bimboPacified");
assert(LT.game.flags.bimboPacified, "Beating Brittany sets bimboPacified");
LT.giveHarpyMatriarchItem("HARPY_MATRIARCH_BIMBO_LOLLIPOP");
assert(LT.countItems(LT.game.player, "HARPY_MATRIARCH_BIMBO_LOLLIPOP") === 1, "Brittany's lollipop can be added");
var suck = LT.applyHarpyMatriarchTf(LT.game.player, "bimbo");
assert(suck.indexOf("bimbo fetish") >= 0 || LT.game.player.hasFetish("FETISH_BIMBO"), "Lollipop applies the official bimbo fetish");
assert(LT.game.player.femininityValue >= 95, "Lollipop raises femininity to 95");

LT.game.flags.bimboPacified = true;
LT.game.flags.dominantPacified = true;
LT.game.flags.nymphoPacified = true;
var pacR = LT.getNode("bimbo.approach").getResponses(LT.game, 0).map(function (r) { return r && r.title; });
assert(pacR.indexOf("Threesome (oral)") >= 0, "Pacified Brittany offers oral threesome");
assert(pacR.indexOf("Threesome (missionary)") >= 0, "Pacified Brittany offers missionary threesome");
assert(LT.getNode("dominant.approach").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Get dominated"; }).length === 1, "Pacified Diana offers Get dominated");
assert(LT.getNode("nympho.approach").getResponses(LT.game, 0).filter(function (r) { return r && String(r.title).indexOf("Spitroast") === 0; }).length === 1, "Pacified Lexi offers spit-roast");

LT.setProperty("badEndContent", false);
var lostR = LT.getNode("bimbo.lost").getResponses(LT.game, 0).map(function (r) { return r && r.title; });
assert(lostR.indexOf("Refuse") >= 0, "Loss offers Refuse when bad ends are off");
assert(lostR.indexOf("Suck lollipop") >= 0, "Loss offers Suck lollipop when bad ends are off");
LT.setProperty("badEndContent", true);
var badR = LT.getNode("bimbo.lost").getResponses(LT.game, 0).filter(function (r) { return r && r.title === "Suck lollipops"; })[0];
assert(badR && badR.nextDialogue === "bimbo.badEnd", "Bad ends on offer the official forced lollipops");
assert(LT.game.flags.harpyQuest === "HARPY_PACIFICATION_TWO", "First nest advances to TWO");
assert(winHtml.indexOf("One down") >= 0, "Quest banner names the next task");

LT.pacifyHarpyNest("dominantPacified");
assert(LT.game.flags.harpyQuest === "HARPY_PACIFICATION_THREE", "Second nest advances to THREE");
LT.pacifyHarpyNest("nymphoPacified");
assert(LT.game.flags.harpyQuest === "HARPY_PACIFICATION_REWARD", "Third nest unlocks the Enforcer reward");

post = LT.getNode("place.HARPY_NESTS_ENTRANCE_ENFORCER_POST").getResponses(LT.game, 0);
var report = post.filter(function (r) { return r && r.title === "Report back" && !r.disabled; })[0];
assert(report && report.nextDialogue === "harpy.report", "Reward stage offers Report back");
report.effects();
assert(LT.game.flags.harpyQuest === "complete", "Report back completes Angry Harpies");
assert(LT.game.flags.harpyPacified, "Completion marks the nests as pacified");
assert(LT.game.player.money === 5000, "Report back pays official 5000 flames");

var red = LT.parseFromXML("places/dominion/harpyNests/dominant", "HARPY_NEST_DOMINANT");
assert(red.indexOf("#IF") < 0, "Diana exterior parses");
var pink = LT.parseFromXML("places/dominion/harpyNests/nympho", "HARPY_NEST_NYMPHO");
assert(pink.indexOf("#IF") < 0, "Lexi exterior parses");
assert(LT.getNode("place.HARPY_NESTS_HARPY_NEST_RED"), "Diana nest node exists");
assert(LT.getNode("place.HARPY_NESTS_HARPY_NEST_PINK"), "Lexi nest node exists");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll harpy trio smoke checks passed.");
