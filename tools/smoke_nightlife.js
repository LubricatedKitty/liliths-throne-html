/* node "Liliths Throne HTML/tools/smoke_nightlife.js" */
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
  getElementById: function () { return { classList: { add: function () {}, remove: function () {} }, innerHTML: "", hidden: false, appendChild: function () {} }; },
  querySelector: function () { return { innerHTML: "" }; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {}, classList: { add: function () {}, remove: function () {} } };
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
  LT: { TEXT: {}, Colour: {} },
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
  "js/character/names.js",
  "js/character/npcs.js",
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/items/items.js",
  "js/text/theWateringHole.js",
  "js/text/lightsOut.js",
  "js/content/world.js",
  "js/content/nightlife.js",
].forEach(load);

var LT = context.LT;
LT.openUI = function () {};
LT.setTitle = function () {};
LT.setChrome = function () {};
LT.setResponses = function () {};
LT.game.player = {
  name: "Alex",
  money: 5000,
  raceName: "human",
  fullRace: "human",
  getName: function () { return "Alex"; },
  getRaceName: function () { return this.fullRace || "human"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "DOMINION", place: "DOMINION_NIGHTLIFE_DISTRICT", x: 14, y: 9 },
};
LT.game.flags = {};
LT.game.npcs = {};
LT.game.secondsPassed = 20 * 3600 + 34 * 60;

assert(LT.hasNode("place.DOMINION_NIGHTLIFE_DISTRICT"), "street nightlife node");
assert(LT.hasNode("place.WATERING_HOLE_ENTRANCE"), "entrance node");
assert(LT.hasNode("place.WATERING_HOLE_MAIN_AREA"), "main node");
assert(LT.hasNode("place.WATERING_HOLE_BAR"), "bar node");
assert(LT.hasNode("place.WATERING_HOLE_SEATING_AREA"), "seating node");
assert(LT.hasNode("place.WATERING_HOLE_DANCE_FLOOR"), "dance node");
assert(LT.hasNode("place.WATERING_HOLE_VIP_AREA"), "vip node");
assert(LT.hasNode("place.WATERING_HOLE_TOILETS"), "toilets node");
assert(LT.hasNode("place.innoxia_dominion_nightlife_lights_out_exit"), "lights out exit");
assert(LT.hasNode("place.innoxia_dominion_nightlife_lights_out_bar"), "lights out bar");

assert(LT.isClubOpen(0), "club open at 20:34");
LT.game.secondsPassed = 12 * 3600;
assert(!LT.isClubOpen(0), "club closed at noon");
LT.game.secondsPassed = 5 * 3600;
assert(!LT.isClubOpen(0), "club closed at 05:00");
LT.game.secondsPassed = 19 * 3600;
assert(LT.isClubOpen(0), "club open at 19:00");
LT.game.secondsPassed = 4 * 3600 + 59 * 60;
assert(LT.isClubOpen(0), "club still open at 04:59");
LT.game.secondsPassed = 20 * 3600;

var street = LT.getNode("place.DOMINION_NIGHTLIFE_DISTRICT");
var dayHtml = (function () {
  LT.game.secondsPassed = 12 * 3600;
  return street.getContent();
})();
assert(dayHtml.indexOf("Dialogue for") < 0, "day street XML exists");
assert(/closed|daylight|daytime|afternoon|morning|sun/i.test(dayHtml) || dayHtml.indexOf("<p>") >= 0, "day street has official text");

LT.game.secondsPassed = 20 * 3600;
var nightHtml = street.getContent();
assert(nightHtml.indexOf("Dialogue for") < 0, "night street XML exists");
assert(nightHtml.indexOf("OUTSIDE_LIGHTS_OUT") < 0 && nightHtml.indexOf("Lights Out") < 0, "Lights Out text gated without Hannah");

var streetRes = street.getResponses();
var titles = streetRes.filter(Boolean).map(function (r) { return r.title; });
assert(titles.indexOf("Watering Hole") >= 0, "Watering Hole listed at night");
assert(titles.indexOf("Lights Out") < 0, "Lights Out hidden without Hannah");

LT.game.flags.innoxia_hannah_training_complete = true;
titles = street.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(titles.indexOf("Lights Out") >= 0, "Lights Out listed after Hannah training");
LT.game.secondsPassed = 12 * 3600;
var lo = street.getResponses().filter(Boolean).filter(function (r) { return r.title === "Lights Out"; })[0];
assert(lo && lo.disabled, "Lights Out disabled at noon");
LT.game.secondsPassed = 20 * 3600;
lo = street.getResponses().filter(Boolean).filter(function (r) { return r.title === "Lights Out"; })[0];
assert(lo && !lo.disabled, "Lights Out open at 20:00");
delete LT.game.flags.innoxia_hannah_training_complete;

LT.game.secondsPassed = 12 * 3600;
var hole = street.getResponses().filter(Boolean).filter(function (r) { return r.title === "Watering Hole"; })[0];
assert(hole && hole.disabled, "Watering Hole disabled at noon");
LT.game.secondsPassed = 20 * 3600;

var ent = LT.getNode("place.WATERING_HOLE_ENTRANCE");
var eHtml = ent.getContent();
assert(eHtml.indexOf("Dialogue for") < 0, "Jules first-visit XML");
var eRes = ent.getResponses().filter(Boolean);
var eTitles = eRes.map(function (r) { return r.title; });
assert(eTitles.indexOf("Wait") >= 0, "Wait in queue");
assert(eTitles.indexOf("Suck cock") >= 0, "Suck cock skip");
assert(eTitles.indexOf("Skip queue") < 0, "human cannot demon-skip");
var wait = eRes.filter(function (r) { return r.title === "Wait"; })[0];
assert(wait && wait.secondsPassed === 1800, "Wait is official 30 minutes");

LT.game.player.raceName = "demon";
LT.game.player.fullRace = "succubus";
eTitles = ent.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(eTitles.indexOf("Skip queue") >= 0, "demon can skip queue");
LT.game.player.raceName = "human";
LT.game.player.fullRace = "human";

var clubber = LT.generateClubber({
  gender: LT.Gender.F_V_B_FEMALE,
  race: LT.nightlife.races[1],
  submissive: true,
});
assert(clubber && clubber.name, "spawn clubber");
assert(LT.nightlife.getPartner() === clubber, "partner bound");
assert(!clubber.confident, "submissive clubber is not confident");
LT.game.player.location = { world: "NIGHTLIFE_CLUB", place: "WATERING_HOLE_MAIN_AREA" };
var present = LT.npcAtCurrentTile().map(function (n) { return n.id; });
assert(present.indexOf(clubber.id) >= 0, "submissive clubber is in Characters Present");
assert(present.filter(function (id) { return id === clubber.id; }).length === 1, "clubber is not listed twice");
assert(clubber.orientation, "clubber has orientation");

assert(!LT.nightlife.likesKiss(clubber), "kiss gated at 0 affection / sober");
clubber.affection = 20;
assert(LT.nightlife.likesKiss(clubber), "kiss at friendly median");
assert(!LT.nightlife.likesGroping(clubber), "grope still gated");
clubber.affection = 40;
assert(LT.nightlife.likesGroping(clubber), "grope at like median");
assert(!LT.nightlife.likesSex(clubber), "sex still gated");
clubber.affection = 60;
assert(LT.nightlife.likesSex(clubber), "sex at caring median");
clubber.affection = 0;
LT.incrementAlcoholLevel(clubber, 0.45);
assert(LT.nightlife.likesKiss(clubber), "kiss when tipsy+");
assert(LT.nightlife.likesGroping(clubber), "grope when merry+");
assert(LT.nightlife.likesSex(clubber), "sex when drunk+");
LT.incrementAlcoholLevel(clubber, 0.55);
assert(clubber.alcoholLevel >= 0.95, "wasted threshold reachable");

var drinks = LT.nightlife.drinks;
assert(Math.floor(drinks[0].value * 1.2) === 12, "water 12");
assert(Math.floor(drinks[1].value * 1.2) === 42, "beer 42");
assert(Math.floor(drinks[2].value * 1.2) === 180, "feline 180");
assert(Math.floor(drinks[3].value * 1.2) === 144, "whiskey 144");
assert(Math.floor(drinks[4].value * 1.2) === 240, "rum 240");
assert(drinks[0].alcohol === 0, "water sober");
assert(drinks[1].alcohol === 0.05, "beer +5%");
assert(drinks[2].alcohol === 0.1, "feline +10%");
assert(drinks[3].alcohol === 0.4, "whiskey +40%");
assert(drinks[4].alcohol === 0.5, "rum +50%");
assert(LT.ITEMS.innoxia_race_rat_black_rats_rum, "Black Rat's Rum catalogued");

LT.nightlife.saveClubbers();
assert(!LT.nightlife.getPartner(), "save clears partner");
assert(LT.game.flags.savedClubbers && LT.game.flags.savedClubbers.length === 1, "contact saved");

var vip = LT.getNode("place.WATERING_HOLE_VIP_AREA");
LT.game.flags.krugerIntroduced = false;
var vipTitles = vip.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(vipTitles.indexOf("Kruger") < 0, "VIP Kruger gated until intro");
LT.game.flags.krugerIntroduced = true;
vipTitles = vip.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(vipTitles.indexOf("Kruger") >= 0, "Kruger after intro");

LT.generateClubber({ gender: LT.Gender.F_V_B_FEMALE, race: LT.nightlife.races[0], submissive: true });
LT.game.flags.passedJules = true;
LT.game.secondsPassed = 6 * 3600;
var main = LT.getNode("place.WATERING_HOLE_MAIN_AREA");
var closeTitles = main.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(closeTitles.indexOf("Say goodbye") >= 0, "closing say goodbye");
assert(closeTitles.indexOf("Invite home") >= 0, "closing invite home");
assert(closeTitles.indexOf("Lose company") >= 0, "closing lose company");

var home = LT.getNode("nightlife.home");
assert(home.getContent().indexOf("Dialogue for") < 0, "invite-home XML");

LT.game.secondsPassed = 20 * 3600;
LT.game.player.location = { world: "NIGHTLIFE_CLUB", place: "WATERING_HOLE_MAIN_AREA", x: 1, y: 1 };
LT.enterWorld = function (grid, place) {
  LT.game.player.location = { world: grid, place: place || LT.game.player.location.place };
};
var moved = [];
LT.enterWorld = function (grid, place) {
  moved.push(place);
  LT.game.player.location = { world: grid, place: place || LT.game.player.location.place };
};

var dom = LT.generateClubber({
  gender: LT.Gender.M_P_MALE,
  race: LT.nightlife.races[0],
  submissive: false,
});
assert(dom.confident, "dominant clubber is confident");
assert(!(dom.kind && dom.selfish), "kind and selfish are exclusive");
var found = LT.getNode("nightlife.search.found");
var foundRes = found.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(foundRes.indexOf("Continue") >= 0, "dom search Continue");
assert(foundRes.indexOf("Talk") < 0, "dom search is not player-led Talk");
assert(typeof found.travelDisabled === "function" && found.travelDisabled(), "dom search travel locked");

var first = LT.nightlife.pickClubberBehaviour();
assert(first === "BAR_DRINK", "first dom action is buy a drink while player is sober");
assert(LT.nightlife.isPartnerOfferingDrinks(), "dom offers drinks while sober");
LT.nightlife.applyBehaviourEffects();
assert(LT.game.flags.clubberBehaviour === "BAR_DRINK", "behaviour set to BAR_DRINK");
assert(LT.game.player.location.place === "WATERING_HOLE_BAR", "dom leads player to the bar");
var barPresent = LT.npcAtCurrentTile().map(function (n) { return n.id; });
assert(barPresent.indexOf(dom.id) >= 0, "dominant clubber is in Characters Present at the bar");

var partnerNode = LT.getNode("nightlife.dom.partner");
var drinkTitles = partnerNode.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(
  drinkTitles.indexOf("Accept whiskey") >= 0 ||
    drinkTitles.indexOf("Accept rum") >= 0 ||
    drinkTitles.indexOf("Accept Feline's Fancy") >= 0 ||
    drinkTitles.indexOf("Accept Canine Crush") >= 0,
  "dom drink accept is present",
);
assert(drinkTitles.indexOf("Say goodbye") >= 0, "dom save at slot 9");
assert(drinkTitles.indexOf("Lose company") >= 0, "dom lose at slot 10");

dom.kind = true;
dom.selfish = false;
dom.nightlyAffection = 70;
dom.affection = 0;
LT.game.player.alcoholLevel = 0.05;
LT.game.flags.clubberBehaviour = "BAR_FLIRT";
LT.game.flags.clubberTurnsAtPlace = 2;
LT.game.player.location.place = "WATERING_HOLE_BAR";
assert(LT.nightlife.pickClubberBehaviour() === "BAR_INVITE_HOME", "kind partner invites home once they want sex");

dom.kind = false;
dom.selfish = true;
LT.game.flags.clubberBehaviour = "BAR_DRINK";
assert(LT.nightlife.pickClubberBehaviour() === "TOILETS", "selfish partner pulls you to the toilets once they want sex");

LT.game.player.alcoholLevel = 0.7;
dom.selfish = false;
dom.kind = false;
LT.game.flags.clubberBuyingDrinks = true;
assert(!LT.nightlife.isPartnerOfferingDrinks(), "default personality stops buying drinks once player is drunk");

assert(LT.hasNode("nightlife.dom.takenHome"), "follow-home apartment node");
assert(LT.hasNode("nightlife.dom.toilets.after"), "dom toilet after-sex node");

var pack = LT.TEXT["places/dominion/nightlife/theWateringHole"];
assert(pack.WATERING_HOLE_DOM_PARTNER_BAR_DRINK && pack.WATERING_HOLE_DOM_PARTNER_TAKEN_HOME, "official dom partner XML");
assert(pack.WATERING_HOLE_ENTRANCE && pack.WATERING_HOLE_BAR_KALAHARI_INTRO, "official watering hole pack");
assert(LT.TEXT["places/dominion/nightlife/lights_out"].BAR_HANNAH, "official lights out pack");

assert(LT.nightlife.lightsDrinks.length === 5, "Lights Out has official five shots");
assert(LT.nightlife.lightsDrinks[0].name === "vodka" && LT.nightlife.lightsDrinks[0].price === 100, "vodka 100");
assert(LT.nightlife.lightsDrinks[1].price === 120 && LT.nightlife.lightsDrinks[2].price === 120, "rum/whiskey 120");
assert(LT.nightlife.lightsDrinks[3].price === 180 && LT.nightlife.lightsDrinks[4].price === 180, "arrack/grog 180");

LT.game.flags.innoxia_hannah_training_complete = true;
LT.game.secondsPassed = 20 * 3600;
var barRes = LT.getNode("place.innoxia_dominion_nightlife_lights_out_bar").getResponses().filter(Boolean);
var hannahBtn = barRes.filter(function (r) { return r.title === "Hannah"; })[0];
assert(hannahBtn && hannahBtn.disabled, "Hannah absent before 21:00");
LT.game.secondsPassed = 21 * 3600;
hannahBtn = LT.getNode("place.innoxia_dominion_nightlife_lights_out_bar").getResponses().filter(Boolean).filter(function (r) { return r.title === "Hannah"; })[0];
assert(hannahBtn && !hannahBtn.disabled, "Hannah at the bar from 21:00");

LT.game.flags.innoxia_lights_out_hannah_talk = false;
var hTalk = LT.getNode("nightlife.lights.hannah").getResponses().filter(Boolean);
assert(hTalk.filter(function (r) { return r.title === "Flirt"; })[0].disabled, "Hannah flirt gated on talk");
assert(hTalk.filter(function (r) { return r.title === "Kiss"; })[0].disabled, "Hannah kiss gated on flirt");
assert(hTalk.filter(function (r) { return r.title === "Alleyway"; })[0].disabled, "Hannah sex gated on kiss");
assert(hTalk.filter(function (r) { return /Vodka/.test(r.title); })[0], "Hannah vodka shot");

LT.game.secondsPassed = 20 * 3600;
var saved = LT.generateClubber({ gender: LT.Gender.F_V_B_FEMALE, race: LT.nightlife.races[0], submissive: true });
saved.attractedToPlayer = true;
LT.nightlife.saveClubbers();
LT.game.flags.searchingForASub = true;
var contactRes = LT.getNode("nightlife.contacts").getResponses().filter(Boolean);
var savedBtn = contactRes.filter(function (r) { return r.title === saved.name; })[0];
assert(savedBtn && savedBtn.disabled, "contact blocked for 12 hours after meeting");

LT.getNode("nightlife.toilets.glory.use").applyPreParsingEffects();
assert(LT.game.npcs.glory && /wasted|drunk|tipsy|horny|desperate|intoxicated/.test(LT.game.npcs.glory.name), "glory hole uses official drunk/horny names");

LT.game.npcs.clubber = {
  name: "Rook",
  feminine: false,
  confident: true,
  selfish: true,
  kind: false,
  isFeminine: function () { return false; },
  isKind: function () { return false; },
  isSelfish: function () { return true; },
  isShy: function () { return false; },
  isConfident: function () { return true; },
  getName: function () { return "Rook"; },
  getSpeechColour: function () { return "#88a"; },
};
LT.game.npcs.npc = LT.game.npcs.clubber;
var footsie = LT.parseFromXML("places/dominion/nightlife/theWateringHole", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_FOOTSIE_ACCEPT");
assert(footsie.indexOf("#THEN") < 0, "dom footsie accept has no leftover #THEN");
assert(/beneath the table|inside of your thigh/i.test(footsie), "dom footsie accept keeps official footsie text");
assert(footsie.indexOf("[pc.spreadYourLegs]") < 0, "spreadYourLegs parses");
var grope = LT.parseFromXML("places/dominion/nightlife/theWateringHole", "WATERING_HOLE_DOM_PARTNER_BAR_GROPE_ACCEPT");
assert(grope.indexOf("#THEN") < 0, "dom grope accept has no leftover #THEN");
var flirt = LT.parseFromXML("places/dominion/nightlife/theWateringHole", "WATERING_HOLE_KALAHARI_BREAK_FLIRT");
assert(flirt.indexOf("#THEN") < 0 && flirt.indexOf("seductive") >= 0, "compact #IFpc.isFeminine()#THEN parses");

if (fails.length) {
  console.error(fails.length + " failure(s)");
  process.exit(1);
}
console.log("nightlife smoke ok");
