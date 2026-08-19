/* node "Liliths Throne HTML/tools/smoke_helena_nest.js" */
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
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/npcs.js",
  "js/engine/game.js",
  "js/engine/properties.js",
  "js/engine/preferences.js",
  "js/engine/utilText.js",
  "js/text/helenaNest.js",
  "js/text/harpyNests.js",
  "js/content/world.js",
  "js/content/demonHome.js",
  "js/content/harpyNests.js",
  "js/content/helenaNest.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  getName: function () { return "Alex"; },
  getRaceName: function () { return "human"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST", x: 2, y: 2 },
};
LT.game.flags.quest = "MAIN_1_F_SCARLETTS_FATE";
LT.game.secondsPassed = 11 * 3600;

function titles(nodeId) {
  return LT.getNode(nodeId).getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
}

function named(nodeId, title) {
  return LT.getNode(nodeId).getResponses(LT.game, 0).filter(function (r) { return r && r.title === title; })[0];
}

assert(LT.isWorkTime() === true, "11:00 nest is awake");
LT.ensureHelena();
LT.ensureScarlett();
assert(LT.parseFromXML("places/dominion/harpyNests/helena", "HELENAS_NEST_MAIN_QUEST_TAKE_FLIGHT").indexOf("Slaver Alley") >= 0, "Take flight XML present");
assert(LT.parseFromXML("places/dominion/harpyNests/helena", "HELENAS_NEST_MEETING_SCARLETT").indexOf("Scarlett") >= 0, "Scarlett meeting XML present");
assert(LT.parseFromXML("places/dominion/harpyNests/helena", "HELENAS_NEST_SCARLETTS_SERVANT").indexOf("Scarlett") >= 0, "Servant XML present");

var gone = named("place.HARPY_NESTS_HELENAS_NEST", "Helena");
assert(gone && gone.disabled, "After 1-F Helena has left the nest");
assert(titles("place.HARPY_NESTS_HELENAS_NEST").indexOf("Scarlett") < 0, "Scarlett is not at the nest until freed");

var fly = named("helena.noPunishment", "Fly after her");
assert(fly && fly.disabled, "Human without wings cannot fly after Helena");

LT.game.player.getRaceName = function () { return "harpy"; };
LT.game.player.raceName = "harpy";
fly = named("helena.noPunishment", "Fly after her");
assert(fly && !fly.disabled && fly.nextDialogue === "helena.takeFlight", "Harpy can fly after Helena");
var shop = LT.getNode("helena.takeFlight").getResponses(LT.game, 0).filter(Boolean)[0];
assert(shop && shop.title === "Scarlett's Shop", "Flight lands at Scarlett's Shop");
LT.game.player.getRaceName = function () { return "human"; };
LT.game.player.raceName = "human";

LT.game.flags.freedScarlett = true;
LT.ensureScarlett();
assert(LT.game.npcs.scarlett.hasPenis(), "Official Scarlett has a penis");
assert(LT.game.npcs.scarlett.location.place === "HARPY_NESTS_HELENAS_NEST", "Freed Scarlett is at the nest");

var scarlettBtn = named("place.HARPY_NESTS_HELENAS_NEST", "Scarlett");
assert(scarlettBtn && !scarlettBtn.disabled && scarlettBtn.nextDialogue === "helena.meetScarlett", "Daytime Scarlett is available after freeing her");

LT.getNode("helena.meetScarlett").applyPreParsingEffects();
var meet = LT.getNode("helena.meetScarlett").getResponses(LT.game, 0);
var meetTitles = meet.filter(Boolean).map(function (r) { return r.title; });
assert(meetTitles.indexOf("Leave") >= 0, "Scarlett meeting offers Leave");
assert(meetTitles.indexOf("Offer ass") >= 0, "Default anal content offers ass");
assert(meetTitles.indexOf("Servant") < 0, "Servant is gated on Her Highness's Helper");
assert(meetTitles.indexOf("Relax") < 0, "Relax is gated on Her Highness's Helper");

var start = LT.parseFromXML("places/dominion/harpyNests/helena", "START_SCARLETT_SEX");
assert(start.indexOf("[scarlett.") < 0 && start.indexOf("[pc.") < 0, "Scarlett sex start parsed");

LT.game.flags.helenaRomance = "complete";
LT.game.npcs.scarlett.affection = 40;
LT.getNode("place.HARPY_NESTS_HELENAS_NEST").applyPreParsingEffects();
var helenaBtn = named("place.HARPY_NESTS_HELENAS_NEST", "Helena");
assert(helenaBtn && !helenaBtn.disabled && helenaBtn.nextDialogue === "helena.nest", "Completed romance reopens Helena at the nest");

var talk = named("helena.nest", "Talk");
assert(talk && talk.nextDialogue === "helena.nestTalk", "Helena nest talk is available");
talk.effects();
assert(LT.game.flags.helenaNestTalkedTo === LT.dayNumber(), "Talk is once per day");
assert(named("helena.nestTalk", "Talk") && named("helena.nestTalk", "Talk").disabled, "Repeat talk is disabled the same day");

LT.game.npcs.helena.sex = { vaginaVirgin: false, assVirgin: false };
assert(LT.game.npcs.helena.isSlutty(), "Helena is slutty after losing virginity");
assert(named("helena.nest", "Apartment") && named("helena.nest", "Apartment").nextDialogue === "helena.apartment", "Slutty Helena offers her apartment");

LT.getNode("helena.meetScarlett").applyPreParsingEffects();
meetTitles = LT.getNode("helena.meetScarlett").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(meetTitles.indexOf("Servant") >= 0, "Romance-complete Scarlett offers Servant");
assert(meetTitles.indexOf("Relax") >= 0, "Liked Scarlett offers Relax");

var servant = LT.getNode("helena.servant").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(servant.indexOf("Back massage") >= 0, "Servant offers back massage");
assert(servant.indexOf("Groom wings") >= 0, "Servant offers groom wings");
assert(servant.indexOf("Talons") >= 0, "Foot content offers talon massage");

var back = LT.getNode("helena.servantBack").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(back.indexOf("Hold back") >= 0, "Massage can be held back");
assert(back.indexOf("Blowjob") >= 0, "Penis Scarlett offers blowjob reward");

LT.game.flags.scarlettRewardRoll = 0;
var reward = LT.getNode("helena.servantReward").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(reward.indexOf("Kiss feet") >= 0, "Final reward can kiss feet");
assert(reward.indexOf("Bow down") >= 0, "Final reward can bow");
assert(reward.indexOf("Flatter") >= 0, "Final reward can flatter");
assert(reward.indexOf("Back out") >= 0, "Final reward can back out");

var chosen = named("helena.servantReward", "Kiss feet");
chosen.effects();
assert(chosen.nextDialogue === "helena.servantRewardSex", "Kiss feet always chooses the player");

var sexChoices = LT.getNode("helena.servantRewardSex").getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(sexChoices.indexOf("No preference") >= 0, "Reward sex has no preference");
assert(sexChoices.indexOf("Blowjob") >= 0, "Reward sex has blowjob");
assert(sexChoices.indexOf("Anal") >= 0, "Reward sex has anal");
assert(sexChoices.indexOf("Fucked") >= 0, "Reward sex has vaginal for a player with a vagina");

LT.getNode("helena.afterRewardSex").applyPreParsingEffects();
assert(LT.game.flags.scarlettGoneHome === LT.dayNumber(), "After the reward Scarlett goes home for the day");
assert(titles("place.HARPY_NESTS_HELENAS_NEST").indexOf("Scarlett") < 0, "Scarlett is gone from the nest after being taken home");

var storm = nestXmlSafe();
function nestXmlSafe() {
  var prev = LT.isArcaneStorm;
  LT.isArcaneStorm = function () { return true; };
  var html = LT.getNode("place.HARPY_NESTS_HELENAS_NEST").getContent();
  var r = named("place.HARPY_NESTS_HELENAS_NEST", "Helena");
  LT.isArcaneStorm = prev;
  return { html: html, helena: r };
}
assert(storm.html.indexOf("storm") >= 0 || storm.html.indexOf("shelter") >= 0, "Storm uses official storm exterior");
assert(storm.helena && storm.helena.disabled, "Storm disables Helena");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll Helena nest smoke checks passed.");
