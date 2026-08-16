/* node "Liliths Throne HTML/tools/smoke_sex.js" */
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
  "js/character/clothing.js",
  "js/character/npcs.js",
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/sex/sex.js",
  "js/content/sexNodes.js",
  "js/text/prologue.js",
  "js/content/prologue.js",
].forEach(load);

var LT = context.LT;
LT.setTitle = function () {};
LT.setChrome = function () {};
LT.openUI = function () {};
LT.setResponses = function () {};
LT.game.player = LT.createNewPlayer();
LT.game.player.setName("Alex", "Alex", "Alex");

function makePartner(opts) {
  var n = {
    id: opts.id || "smokePartner",
    name: opts.name || "Lilaya",
    feminine: opts.feminine !== false,
    lust: 10,
    gender: opts.gender || LT.Gender.FEMALE,
    sex: { vaginaVirgin: true, penisVirgin: true },
    vaginaVirgin: true,
    getName: function () { return this.name; },
    isFeminine: function () { return this.feminine; },
    hasVagina: function () { return !!(this.gender && this.gender.hasVagina); },
    hasPenis: function () { return !!(this.gender && this.gender.hasPenis); },
    hasBreasts: function () { return !!(this.gender && this.gender.hasBreasts); },
    fuckableNipples: !!opts.fuckableNipples,
  };
  return n;
}
var partner = makePartner({ name: "Lilaya", gender: LT.Gender.FEMALE });
LT.game.npcs.lilaya = partner;

LT.defineNode({
  id: "sex.smokeAfter",
  ui: "dialogue",
  title: "After sex",
  getContent: function () { return "<p>After-sex node.</p>"; },
  getResponses: function () { return []; },
});

var landed = null;
var origSet = LT.game.setContent.bind(LT.game);
LT.game.setContent = function (node) {
  landed = typeof node === "string" ? node : (node && node.id);
  return origSet(node);
};

var enter = LT.ResponseSex("Sex", "Start a generic scene.", {
  partner: partner,
  playerDom: true,
  consensual: true,
  positionName: "Standing",
  startText: "<p>You pull [npc.name] close.</p>",
  postSexNode: "sex.smokeAfter",
});
assert(enter.nextDialogue === "sex.scene", "ResponseSex opens sex.scene");
enter.effects();

assert(LT.sex.active, "Sex starts");
assert(LT.sex.positionName === "Standing", "Default manager position is Standing");
assert(LT.sex.lastResolution.indexOf("Lilaya") >= 0, "Lead-in parses [npc.name] as the partner");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Lead-in has no leftover [npc.] tags");
assert(Math.abs(LT.AROUSAL_INCREASE.TWO_LOW - 1) < 0.001, "TWO_LOW is official 1");
assert(Math.abs(LT.AROUSAL_INCREASE.ZERO_NONE - 0.1) < 0.001, "ZERO_NONE is official 0.1");
assert(Math.abs(LT.AROUSAL_INCREASE.ONE_MINIMUM - 0.5) < 0.001, "ONE_MINIMUM is official 0.5");

var scene = LT.getNode("sex.scene");
assert(scene.tabs.join("/") === "Sex/Self/Positioning/Misc", "Official sex tabs");
assert(scene.title(LT.game) === "Sex: Standing", "Official consensual title");

var sexTab = scene.getResponses(LT.game, 0);
var sexNames = sexTab.filter(Boolean).map(function (r) { return r.title; });
assert(sexNames.indexOf("Start kissing") >= 0, "Start kissing is on the Sex tab");
assert(sexNames.indexOf("Kiss") < 0, "Ongoing Kiss is hidden until started");

var miscBefore = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(miscBefore.indexOf("Manage clothing") >= 0, "Manage clothing is on Misc");
assert(miscBefore.indexOf("Do nothing") >= 0, "Do nothing is on Misc");
assert(miscBefore.indexOf("Stop sex") >= 0, "Consensual Stop sex is on Misc");
assert(scene.getResponses(LT.game, 1).filter(Boolean).length === 0, "Self tab is empty until the player is exposed");
var posBefore = scene.getResponses(LT.game, 2).filter(Boolean).map(function (r) { return r.title; });
assert(posBefore.indexOf("Missionary") >= 0, "Missionary is on Positioning");
assert(posBefore.indexOf("Doggy-style her") >= 0, "Doggy-style her is on Positioning");
assert(posBefore.indexOf("Face-to-wall") >= 0, "Face-to-wall is on Positioning");
assert(posBefore.indexOf("Sixty-nine (top)") >= 0, "Sixty-nine (top) is on Positioning");
assert(posBefore.indexOf("Cowgirl (riding)") >= 0, "Cowgirl (riding) is on Positioning");
assert(posBefore.indexOf("Sit on face") >= 0, "Sit on face is on Positioning");
assert(posBefore.indexOf("Switch to sitting") >= 0, "Switch to sitting is on Positioning");
assert(posBefore.indexOf("Standing receive oral") >= 0, "Standing receive oral is on Positioning");
assert(posBefore.indexOf("Back-to-wall") < 0, "Back-to-wall is hidden while already Standing");

LT.sex.perform("kiss_start");
assert(LT.sex.isKissing(), "Kiss start opens an ongoing kiss");
assert(LT.sex.turn === 1, "A player action plus partner action is one turn");
assert(LT.sex.player.arousal > 0 && LT.sex.partner.arousal > 0, "Kiss raises both arousals");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Kiss text has no leftover [npc.] tags");
assert(/you /i.test(LT.sex.lastResolution), "Player kiss lines use you, not the given name");
assert(LT.sex.lastResolution.toLowerCase().indexOf("alex") < 0, "Player given name is not left in kiss text");

var afterKiss = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(afterKiss.indexOf("Kiss") >= 0, "Ongoing Kiss replaces Start kissing");
assert(afterKiss.indexOf("Stop kissing") >= 0, "Stop kissing is available while kissing");
assert(afterKiss.indexOf("Start kissing") < 0, "Start kissing hides while already kissing");

LT.sex.perform("kiss");
assert(LT.sex.isKissing(), "Ongoing Kiss keeps the pair");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Ongoing kiss has no leftover [npc.] tags");

assert(!LT.isSexExposed(LT.sex.player, "BREASTS"), "Chest starts covered");
assert(!LT.isSexExposed(LT.sex.partner, "VAGINA"), "Groin starts covered");
LT.sex.perform("manage_clothing");
assert(LT.sex.clothingMenu, "Manage clothing opens the clothing submenu");
var clothMenu = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(clothMenu.indexOf("Pull clothing aside") >= 0, "Clothing submenu offers Pull clothing aside");
assert(clothMenu.indexOf("Back") >= 0, "Clothing submenu offers Back");
LT.sex.perform("cloth_expose_all");
assert(!LT.sex.clothingMenu, "Pull clothing aside closes the clothing submenu");
assert(LT.isSexExposed(LT.sex.player, "BREASTS") && LT.isSexExposed(LT.sex.player, "VAGINA"), "Pull clothing aside exposes the player");
assert(LT.isSexExposed(LT.sex.partner, "BREASTS") && LT.isSexExposed(LT.sex.partner, "PENIS"), "Pull clothing aside exposes the partner");
var miscAfter = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(miscAfter.indexOf("Manage clothing") >= 0, "Manage clothing returns after the submenu closes");

var afterExpose = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(afterExpose.indexOf("Grope breasts") >= 0, "Grope breasts is available when the partner has breasts");
assert(afterExpose.some(function (t) { return t.indexOf("Finger") === 0; }), "Finger her is available on an exposed vagina");
assert(afterExpose.indexOf("Start cunnilingus") >= 0, "Start cunnilingus is available on an exposed vagina");
assert(afterExpose.indexOf("Get fingered") >= 0, "Get fingered is available when the player has a vagina");
assert(afterExpose.indexOf("Finger her ass") >= 0, "Anal fingering is available on an exposed anus");
assert(afterExpose.indexOf("Start anilingus") >= 0, "Start anilingus is available on an exposed anus");
assert(afterExpose.indexOf("Kiss nipples") >= 0, "Kiss nipples is available when breasts are exposed");
assert(afterExpose.indexOf("Clit play") >= 0, "Clit play is available on an exposed vagina");
assert(afterExpose.indexOf("Start intercrural") < 0, "Intercrural is hidden when nobody has a penis");
assert(afterExpose.indexOf("Nipple fingering") < 0, "Nipple fingering is hidden unless nipples are fuckable");
assert(afterExpose.indexOf("Fuck her nipple") < 0, "Nipple-fuck is hidden unless nipples are fuckable");
assert(!afterExpose.some(function (t) { return t && t.indexOf("Fuck") === 0; }), "PIV is hidden when nobody has a penis");
assert(afterExpose.indexOf("Perform blowjob") < 0, "Blowjob is hidden when nobody has a penis");

var selfAfter = scene.getResponses(LT.game, 1).filter(Boolean).map(function (r) { return r.title; });
assert(selfAfter.indexOf("Finger yourself") >= 0, "Self tab offers Finger yourself when the player has an exposed vagina");
assert(selfAfter.indexOf("Anal fingering (self)") >= 0, "Self tab offers self anal fingering when the anus is exposed");
assert(selfAfter.indexOf("Pinch nipples (self)") >= 0, "Self tab offers Pinch nipples when breasts are exposed");
assert(selfAfter.indexOf("Start stroking cock") < 0, "Self cock stroking is hidden when the player has no penis");

LT.sex.perform("finger_vagina_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "finger_vagina", "Finger start opens ongoing fingering");
assert(LT.sex.ongoing.label === "fingering", "Ongoing label is fingering");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Fingering start has no leftover [npc.] tags");
assert(LT.sex.partner.arousal > LT.sex.player.arousal || LT.sex.partner.arousal >= 1.5, "Fingering target gets THREE_NORMAL");

var duringFinger = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(duringFinger.indexOf("Fingering") >= 0, "Fingering continue is available");
assert(duringFinger.indexOf("Stop fingering") >= 0, "Stop fingering is available");

LT.sex.perform("finger_vagina");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Ongoing fingering has no leftover [npc.] tags");

LT.sex.player.arousal = 100;
var climax = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(climax.length === 1 && climax[0] === "Orgasm", "Arousal 100 offers only Orgasm");
LT.sex.perform("orgasm");
assert(LT.sex.player.arousal < 10, "Orgasm resets arousal before the partner's follow-up");
assert(LT.sex.player.orgasmedThisSex === 1, "Orgasm increments orgasmedThisSex");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Orgasm text has no leftover [npc.] tags");
assert(/climax|ecstasy|squeal/i.test(LT.sex.lastResolution), "Orgasm uses official climax lines");

LT.sex.perform("stop_sex");
assert(LT.sex.finished, "Stop sex ends the session");
assert(LT.sex.lastResolution.indexOf("stop having sex") >= 0, "Official Stop sex line is used");
assert(LT.sex.lastResolution.indexOf("stepping") < 0, "[pc.step] is the verb step, not stepping");

var done = scene.getResponses(LT.game, 0);
assert(done.filter(Boolean)[0].title === "Continue", "Finished scene offers Continue");
done.filter(Boolean)[0].effects();
assert(landed === "sex.smokeAfter", "Continue lands on postSexNode");
assert(!LT.sex.active, "Finish clears the session");

LT.sex.start({
  partner: partner,
  consensual: false,
  postSexNode: "sex.smokeAfter",
});
assert(scene.title(LT.game) === "Non-consensual Sex: Standing", "Official non-con title");
var noStop = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(noStop.indexOf("Stop sex") < 0, "Non-consensual scenes cannot Stop");

function exposeBoth() {
  ["BREASTS", "PENIS", "VAGINA", "ANUS", "FOOT"].forEach(function (area) {
    LT.setSexExposed(LT.sex.player, area, true);
    LT.setSexExposed(LT.sex.partner, area, true);
  });
}

var male = makePartner({ name: "Brax", feminine: false, gender: LT.Gender.MALE });
LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: male, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var maleActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(maleActs.indexOf("Start handjob") >= 0, "Handjob is available on an exposed penis");
assert(maleActs.indexOf("Perform blowjob") >= 0, "Perform blowjob is available on an exposed penis");
assert(maleActs.indexOf("Get handjob") >= 0, "Get handjob is available when the player has a penis");
assert(maleActs.indexOf("Receive blowjob") >= 0, "Receive blowjob is available when the player has a penis");
assert(maleActs.indexOf("Start anal") >= 0, "Start anal is available on an exposed penis + anus");
assert(maleActs.indexOf("Start intercrural") >= 0, "Start intercrural is available on an exposed penis");
assert(maleActs.indexOf("Start hotdogging") >= 0, "Start hotdogging is available on an exposed penis + anus");
assert(maleActs.indexOf("Get footjob") >= 0 || maleActs.some(function (t) { return t && t.indexOf("footjob") >= 0; }), "Footjob is available when feet are exposed");
assert(!maleActs.some(function (t) { return t && t.indexOf("Fuck") === 0; }), "PIV is hidden when neither has a vagina");
var maleSelf = scene.getResponses(LT.game, 1).filter(Boolean).map(function (r) { return r.title; });
assert(maleSelf.indexOf("Start stroking cock") >= 0, "Self tab offers cock stroking when the player has an exposed penis");

LT.game.player.setGender(LT.Gender.FEMALE);
var mixed = makePartner({ name: "Brax", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: mixed, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var mixedActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(mixedActs.indexOf("Get fucked") >= 0, "Get fucked is available for a vagina + penis pair");
assert(mixedActs.indexOf("Receive anal") >= 0, "Receive anal is available for a female player + male partner");
assert(mixedActs.indexOf("Perform blowjob") >= 0, "Female player can perform a blowjob");
assert(!mixedActs.some(function (t) { return t && t.indexOf("Fuck ") === 0; }), "Female player cannot Fuck him without a penis");

LT.sex.perform("penis_vagina_receive_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "penis_vagina", "Get fucked starts PIV");
assert(LT.sex.lastResolution.indexOf("virgin") >= 0, "Official first-time PIV line is used");
assert(mixed.sex.vaginaVirgin === false || LT.game.player.sex.vaginaVirgin === false, "PIV clears the receiver's virgin flag");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "PIV start has no leftover [npc.] tags");

LT.sex.ongoing = null;
LT.sex.perform("finger_anus_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "finger_anus", "Finger her ass starts anal fingering");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Anal fingering start has no leftover [npc.] tags");
assert(/asshole|ass/i.test(LT.sex.lastResolution), "Anal fingering uses official ass lines");

LT.sex.ongoing = null;
LT.sex.perform("anilingus_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "anilingus", "Start anilingus opens the pair");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Anilingus start has no leftover [npc.] tags");

LT.sex.ongoing = null;
LT.sex.perform("penis_anus_receive_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "penis_anus", "Receive anal starts penis→anus");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Receive anal has no leftover [npc.] tags");

LT.sex.ongoing = null;
LT.sex.perform("self_finger_vagina_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "self_finger_vagina", "Finger yourself opens a Self ongoing");
assert(LT.sex.ongoing.giver === LT.sex.player && LT.sex.ongoing.receiver === LT.sex.player, "Self fingering targets the player");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Self fingering has no leftover [npc.] tags");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "self_finger_vagina", "Partner AI does not overwrite a Self ongoing");

LT.sex.perform("pos_lying_down");
assert(LT.sex.positionName === "Lying down", "Missionary sets Lying down");
assert(scene.title(LT.game) === "Sex: Lying down", "Title follows the Missionary slot");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Missionary text has no leftover [npc.] tags");
assert(/spread your legs/i.test(LT.sex.lastResolution), "Missionary uses the official line");
var posAfterLie = scene.getResponses(LT.game, 2).filter(Boolean).map(function (r) { return r.title; });
assert(posAfterLie.indexOf("Missionary") < 0, "Missionary hides while already lying down");
assert(posAfterLie.indexOf("Back-to-wall") >= 0, "Back-to-wall returns to Standing");
assert(posAfterLie.indexOf("Doggy-style him") >= 0, "Doggy-style him is available from Missionary");

LT.sex.perform("pos_all_fours");
assert(LT.sex.positionName === "All fours", "Doggy-style sets All fours");
assert(scene.title(LT.game) === "Sex: All fours", "Title follows the doggy slot");
assert(/like an animal/i.test(LT.sex.lastResolution), "Doggy-style uses the official line");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Doggy-style text has no leftover [npc.] tags");

LT.sex.perform("pos_standing");
assert(LT.sex.positionName === "Standing", "Back-to-wall returns the manager to Standing");
assert(scene.title(LT.game) === "Sex: Standing", "Title follows Back-to-wall");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Back-to-wall text has no leftover [npc.] tags");

LT.sex.perform("pos_cowgirl");
assert(LT.sex.positionName === "Cowgirl", "Cowgirl (riding) sets Cowgirl");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Cowgirl text has no leftover [npc.] tags");
assert(/ride/i.test(LT.sex.lastResolution), "Cowgirl uses the official ride line");

LT.sex.perform("pos_face_to_wall");
assert(LT.sex.positionName === "Face to wall", "Face-to-wall sets Face to wall");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Face-to-wall text has no leftover [npc.] tags");

var nipplePartner = makePartner({ name: "Lilaya", gender: LT.Gender.FEMALE, fuckableNipples: true });
LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: nipplePartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var nippleActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(nippleActs.indexOf("Nipple fingering") >= 0, "Nipple fingering appears when the partner has fuckable nipples");
assert(nippleActs.indexOf("Fuck her nipple") >= 0, "Nipple-fuck appears when the player has a penis and the partner has fuckable nipples");
assert(nippleActs.indexOf("Kiss nipples") >= 0, "Kiss nipples is still available with fuckable nipples");
LT.sex.perform("finger_nipple_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "finger_nipple", "Nipple fingering starts the pair");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Nipple fingering has no leftover [npc.] tags");
LT.sex.ongoing = null;
LT.sex.perform("penis_nipple_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "penis_nipple", "Nipple-fuck starts the pair");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Nipple-fuck has no leftover [npc.] tags");

LT.sex.ongoing = null;
LT.sex.perform("penis_breasts_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "penis_breasts", "Start paizuri opens the pair");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Paizuri start has no leftover [npc.] tags");
assert(/cleavage|breasts/i.test(LT.sex.lastResolution), "Paizuri uses official breast lines");

LT.sex.ongoing = null;
LT.sex.perform("penis_thighs_start");
assert(LT.sex.ongoing && LT.sex.ongoing.id === "penis_thighs", "Start intercrural opens the pair");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "Intercrural start has no leftover [npc.] tags");

var posMale = scene.getResponses(LT.game, 2).filter(Boolean).map(function (r) { return r.title; });
assert(posMale.indexOf("Mating press") >= 0, "Mating press is available when the player has a penis");

LT.game.player.setGender(LT.Gender.FEMALE);
LT.game.player.orientation = LT.Orientation.GYNEPHILIC;
var empty = LT.getNode("prologue.empty-room");
empty.getContent(LT.game);
var emptyR = empty.getResponses(LT.game, 0);
var dom = emptyR.filter(function (r) { return r && r.title === "Dominant sex"; })[0];
var sub = emptyR.filter(function (r) { return r && r.title === "Submissive sex"; })[0];
assert(dom && dom.nextDialogue === "sex.scene", "Prologue Dominant sex starts the sex kernel");
assert(sub && sub.nextDialogue === "sex.scene", "Prologue Submissive sex starts the sex kernel");
assert(dom.tooltipText.indexOf("not in this build") < 0, "Prologue sex tooltip is official");
dom.effects();
assert(LT.sex.active && LT.sex.partner && LT.sex.partner.name === "Alexandria", "Dominant sex partners Alexandria");
assert(LT.sex.playerDom, "Dominant sex has the player as the lead");
assert(LT.sex.postSexNode === "prologue.after-sex", "Prologue sex returns to after-sex");
assert(LT.game.flags.prologueSex === "dom", "Dominant flag is set on start");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0 && LT.sex.lastResolution.indexOf("[prologue") < 0, "Prologue lead-in parsed");
LT.sex.partner.orgasmedThisSex = 1;
LT.sex.finish();
assert(LT.game.flags.prologueSexSatisfied, "Partner orgasm marks the official satisfied after-sex");
assert(landed === "prologue.after-sex", "Prologue finish lands on after-sex");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("All sex kernel checks passed.");
