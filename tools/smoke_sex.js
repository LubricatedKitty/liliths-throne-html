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
  "js/character/body.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/player.js",
  "js/character/clothing.js",
  "js/character/npcs.js",
  "js/engine/game.js",
  "js/engine/utilText.js",
  "js/sex/sex.js",
  "js/sex/specials.js",
  "js/sex/sexHud.js",
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
assert(scene.tabs.join("/") === "Misc/Sex/Self/Positioning", "Misc is the first sex tab");
assert(LT.sexTabInternal(0) === 3 && LT.sexTabVisual(0) === 1, "Misc is visual first, Sex stays internal 0");
assert(scene.title(LT.game) === "Sex: Standing", "Official consensual title");

var sexTab = scene.getResponses(LT.game, 0);
var sexNames = sexTab.filter(Boolean).map(function (r) { return r.title; });
assert(LT.sex.parseText("Fuck [npc2.herHim]", LT.game.player, partner) === "Fuck her", "Fuck [npc2.herHim] parses to Fuck her");
assert(LT.sex.parseText("Over [pc.desk]", LT.game.player, partner) === "Over desk", "Over [pc.desk] parses to Over desk");
LT.sex.setSexPace(LT.game.player, "SUB_RESISTING");
var sob = LT.sex.parseText("Struggling and [pc.sobbing]", LT.game.player, partner);
assert(/Struggling and (sobbing|crying|shouting|protesting)/.test(sob), " [pc.sobbing] parses to a vocal");
LT.sex.setSexPace(LT.game.player, "DOM_NORMAL");
assert(sexNames.indexOf("Start kissing") >= 0, "Start kissing is on the Sex tab");
assert(sexNames.indexOf("Kiss") < 0, "Ongoing Kiss is hidden until started");

var miscBefore = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(miscBefore.indexOf("Manage clothing") >= 0, "Manage clothing is on Misc");
assert(miscBefore.indexOf("Do nothing") >= 0, "Do nothing is on Misc");
assert(miscBefore.indexOf("Stop sex") >= 0, "Consensual Stop sex is on Misc");
assert(miscBefore.indexOf("Calm down") >= 0, "Calm down is on Misc");
assert(miscBefore.indexOf("Moan") >= 0, "Moan is on Misc");
assert(miscBefore.indexOf("Stop clothing control") >= 0, "Stop clothing control is on Misc");
assert(miscBefore.indexOf("Stop penetrative control") >= 0, "Stop penetrative control is on Misc");
assert(
  scene.getResponses(LT.game, 1).filter(Boolean).every(function (r) {
    return /finger|mouth|lip|breast/i.test(r.title) && !/pussy|ass|cock|nipple|yourself/i.test(r.title);
  }),
  "Self tab has no genital acts until the player is exposed",
);
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

var lustBeforeKiss = LT.sex.player.lust || 0;
LT.sex.perform("kiss_start");
assert(LT.sex.isKissing(), "Kiss start opens an ongoing kiss");
assert(LT.sex.turn === 1, "A player action plus partner action is one turn");
assert(LT.sex.player.arousal > 0 && LT.sex.partner.arousal > 0, "Kiss raises both arousals");
assert((LT.sex.player.lust || 0) > lustBeforeKiss, "Sex actions raise lust");
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
assert(afterExpose.indexOf("Get fingered") >= 0 || afterExpose.indexOf("Fingered") >= 0, "Get fingered is available when the player has a vagina");
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
assert(duringFinger.indexOf("Fingering") >= 0 || duringFinger.indexOf("Fingered") >= 0, "Fingering continue is available");
assert(duringFinger.indexOf("Stop fingering") >= 0 || duringFinger.indexOf("Stop getting fingered") >= 0, "Stop fingering is available");

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

LT.game.player.setGender(LT.Gender.FEMALE);
var aiPartner = makePartner({ id: "aiPartner", name: "Brax", feminine: false, gender: LT.Gender.MALE });
delete aiPartner.location;
LT.sex.start({ partner: aiPartner, playerDom: false, consensual: true, postSexNode: "sex.smokeAfter" });
function coverAgain(ch) {
  if (!ch.equipped) return;
  Object.keys(ch.equipped).forEach(function (slot) {
    if (ch.equipped[slot]) {
      ch.equipped[slot].displaced = false;
      ch.equipped[slot].removed = false;
    }
  });
  ch.sexExposed = { MOUTH: true, BREASTS: false, PENIS: false, VAGINA: false, ANUS: false, FOOT: false };
}
coverAgain(LT.game.player);
coverAgain(aiPartner);
var presentIds = LT.npcAtCurrentTile().map(function (n) { return n.id; });
assert(presentIds.indexOf("aiPartner") >= 0, "Sex partner appears in Characters Present");

LT.sex.preventClothing = true;
LT.sex.lastNpcPositionTurn = -3;
var posPick = LT.sex.pickPartnerAction();
assert(posPick && String(posPick.id).indexOf("pos_") === 0, "NPC can change position when a sex act is blocked");
LT.sex.perform(posPick.id);
assert(LT.sex.positionName !== "Standing", "NPC position action actually changes the position");
LT.sex.preventClothing = false;

LT.sex.ongoing = null;
var firstAi = LT.sex.pickPartnerAction();
assert(firstAi && String(firstAi.id).indexOf("npc_undress") === 0, "NPC undresses to reach a desired sex act");
LT.sex.perform("do_nothing");
assert(LT.sex.lastResolution.indexOf("better access") >= 0 || /shift aside|remove/i.test(LT.sex.lastResolution), "NPC undress text plays");
var turns = 0;
while (turns < 8 && !(LT.sex.ongoing && LT.sex.ongoing.id === "penis_vagina")) {
  LT.sex.perform("do_nothing");
  turns += 1;
}
assert(LT.sex.ongoing && LT.sex.ongoing.id === "penis_vagina", "NPC starts penetrative sex without the player initiating it");
assert(LT.sex.ongoing.giver === aiPartner, "NPC is the penetrating partner");

LT.game.player.setGender(LT.Gender.FEMALE);
var multi = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
multi.fetishDesire = { FETISH_ORAL_GIVING: "ZERO_HATE" };
LT.sex.start({ partner: multi, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("kiss_start");
assert(LT.sex.isKissing(), "kiss still starts");
assert(LT.sex.areasFree(LT.sex.player, LT.sex.partner, "finger_vagina"), "hands are free while kissing");
assert(!LT.sex.areasFree(LT.sex.player, LT.sex.partner, "cunnilingus"), "tongue is busy while kissing");
if (!LT.sex.listOngoing().some(function (l) { return l.id === "finger_vagina"; })) {
  LT.sex.perform("finger_vagina_start");
}
assert(LT.sex.isKissing(), "kiss survives starting fingering");
assert(LT.sex.listOngoing().length >= 2, "kiss + fingering are both ongoing");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "kiss"; }) && LT.sex.listOngoing().some(function (l) { return l.id === "finger_vagina"; }), "both links listed");
var both = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(both.indexOf("Kiss") >= 0 && both.indexOf("Stop kissing") >= 0, "kiss continue/stop stay available");
assert(both.indexOf("Fingering") >= 0 || both.indexOf("Fingered") >= 0 || both.indexOf("Stop fingering") >= 0, "fingering continue/stop stay available");
var sceneHtml = scene.getContent();
assert(/kiss/i.test(sceneHtml) && /finger/i.test(sceneHtml), "UI lists both ongoing labels");
var beforeStop = LT.sex.listOngoing().length;
LT.sex.perform("kiss_stop");
assert(!LT.sex.isKissing(), "stop kissing removes only the kiss");
assert(LT.sex.listOngoing().length === beforeStop - 1 && LT.sex.listOngoing().every(function (l) { return l.id !== "kiss"; }), "other links remain after kiss stop");

assert(LT.sex.pairLegal("kiss") && LT.sex.pairLegal("penis_vagina"), "standing allows kiss and PIV");
var slotsP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
slotsP.fetishDesire = { FETISH_ORAL_GIVING: "ZERO_HATE" };
LT.sex.start({ partner: slotsP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(LT.sex.playerSlot === "standing_dom" && LT.sex.partnerSlot === "standing_sub", "standing slots assigned");
LT.sex.perform("kiss_start");
assert(LT.sex.isKissing(), "kiss in standing");
LT.sex.perform("pos_face_to_wall");
assert(LT.sex.positionName === "Face to wall", "switched to face-to-wall");
assert(LT.sex.playerSlot === "wall_dom" && LT.sex.partnerSlot === "wall_facing", "wall slots");
assert(!LT.sex.isKissing(), "face-to-wall prunes kiss");
assert(!LT.sex.pairLegal("kiss") && !LT.sex.pairLegal("blowjob") && !LT.sex.pairLegal("cunnilingus"), "behind denies mouth-to-mouth and frontal oral");
assert(LT.sex.pairLegal("penis_vagina") && LT.sex.pairLegal("penis_anus") && LT.sex.pairLegal("anilingus"), "behind still allows rear sex");
var wallActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(wallActs.indexOf("Start kissing") < 0, "Start kissing hidden face-to-wall");
assert(wallActs.indexOf("Start anilingus") >= 0 || wallActs.indexOf("Anilingus") >= 0, "anilingus available face-to-wall");
LT.sex.perform("pos_all_fours");
assert(!LT.sex.pairLegal("kiss") && LT.sex.pairLegal("penis_vagina"), "doggy is a behind graph");
LT.sex.perform("pos_sixty_nine");
assert(LT.sex.pairLegal("cunnilingus") && LT.sex.pairLegal("blowjob"), "69 allows oral");
assert(!LT.sex.pairLegal("kiss") && !LT.sex.pairLegal("penis_vagina"), "69 denies kiss and PIV");
var oralActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(oralActs.indexOf("Start cunnilingus") >= 0, "69 offers cunnilingus");
assert(!oralActs.some(function (t) { return t && t.indexOf("Fuck") === 0; }), "69 hides PIV");
assert(LT.sex.slotOf(LT.sex.player) && LT.sex.slotOf(LT.sex.partner), "UI shows slot names");

LT.sex.start({ partner: makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE }), consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var noTail = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(noTail.indexOf("Tail-fuck her") < 0 && noTail.indexOf("Tentacle-fuck her") < 0, "tail/tentacle hidden without the appendage");
assert(noTail.indexOf("Use a toy on her") < 0, "toy hidden without a dildo");
assert(noTail.indexOf("Scissor her") >= 0 && noTail.indexOf("Clit-fuck her") >= 0, "two vaginas unlock clit pairs");
assert(noTail.indexOf("Lick her armpit") >= 0, "armpit lick available");
assert(noTail.indexOf("Fuck her urethra") < 0, "urethra hidden without fuckableUrethra");

var tailed = makePartner({ name: "Cinder", feminine: true, gender: LT.Gender.FEMALE });
tailed.hasTail = function () { return true; };
tailed.body = { tail: { type: "DEMON_COMMON", count: 1 }, tentacle: { type: "NONE", count: 0 } };
LT.sex.start({ partner: tailed, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var tailActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(tailActs.indexOf("Get tail-fucked") >= 0, "partner tail unlocks get tail-fucked");
LT.game.player.hasTail = function () { return true; };
LT.game.player.body = { tail: { type: "CAT_MORPH", count: 1 } };
var selfTail = scene.getResponses(LT.game, 1).filter(Boolean).map(function (r) { return r.title; });
assert(selfTail.indexOf("Tail-fuck yourself") >= 0, "self tail-fuck on Self tab");
LT.sex.perform("tail_vagina_start");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "tail_vagina"; }), "tail-vagina link starts");
assert(LT.sex.lastResolution.indexOf("[npc.") < 0, "tail text parses");

var toyed = makePartner({ name: "Ash", feminine: true, gender: LT.Gender.FEMALE });
toyed.sexToy = true;
LT.sex.start({ partner: toyed, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Get toyed"; }), "toy act with sexToy flag");

var ure = makePartner({ name: "Elle", feminine: true, gender: LT.Gender.FEMALE });
ure.fuckableUrethra = true;
LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: ure, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Fuck her urethra"; }), "urethral PIV when flagged");

LT.sex.perform("pos_all_fours");
assert(LT.sex.pairLegal("tail_vagina") && !LT.sex.pairLegal("tail_mouth"), "doggy allows tail-fuck, not tail-mouth");
LT.sex.perform("pos_sixty_nine");
assert(LT.sex.pairLegal("tail_mouth") && !LT.sex.pairLegal("tail_vagina"), "69 allows tail-mouth, not tail-fuck");

LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE }), consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.player.arousal = 100;
var femClimax = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(femClimax.length === 1 && femClimax[0] === "Orgasm", "no-penis climax is still the single Orgasm");

LT.game.player.setGender(LT.Gender.MALE);
var cumPartner = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: cumPartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.player.arousal = 100;
var outside = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(outside.indexOf("Orgasm") < 0, "exposed penis does not use generic Orgasm");
assert(outside.indexOf("Cum on floor") >= 0 && outside.indexOf("Cum on face") >= 0, "external cum targets");
assert(outside.indexOf("Creampie") < 0, "creampie hidden when not inside");
LT.sex.perform("orgasm_floor");
assert(LT.sex.lastCumTarget === "FLOOR", "floor target recorded");
assert(LT.sex.player.orgasmedThisSex === 1, "floor orgasm counts");
assert(/floor/i.test(LT.sex.lastResolution), "floor climax text");

LT.sex.start({ partner: cumPartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
var inside = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(inside.indexOf("Creampie") >= 0, "creampie when inside");
assert(inside.indexOf("Pull out (floor)") >= 0, "pull-out renamed while inside");
assert(inside.indexOf("Knot") < 0, "knot hidden without a knot");
LT.sex.perform("orgasm_creampie");
assert(LT.sex.lastCumTarget === "INSIDE", "creampie target");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "penis_vagina"; }), "creampie leaves the penis inside");
assert(/inside/i.test(LT.sex.lastResolution), "creampie text");

LT.sex.start({ partner: cumPartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
LT.sex.perform("orgasm_floor");
assert(LT.sex.lastCumTarget === "FLOOR", "pull-out target");
assert(!LT.sex.listOngoing().some(function (l) { return l.id === "penis_vagina"; }), "pull-out stops the penis link");
assert(/pull/i.test(LT.sex.lastResolution), "pull-out text");

LT.sex.player.knotted = true;
LT.sex.start({ partner: cumPartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Knot"; }), "knot option when knotted and inside");
LT.sex.perform("orgasm_knot");
assert(LT.sex.knotted && LT.sex.knotted.receiver === cumPartner, "knot lock recorded");
assert(/knot/i.test(LT.sex.lastResolution), "knot text");

LT.sex.player.knotted = false;
LT.sex.player.wearingCondom = true;
LT.sex.player.forceCondomFailure = "NONE";
LT.sex.start({ partner: cumPartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
var withCondom = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(withCondom.length === 1 && withCondom[0] === "Orgasm", "condom forces generic Orgasm");
LT.sex.perform("orgasm");
assert(LT.sex.lastCondomFailure === "NONE", "held condom");
assert(/condom/i.test(LT.sex.lastResolution), "cum fills the condom");

LT.sex.player.forceCondomFailure = "CUM_OVERLOAD";
LT.sex.start({ partner: cumPartner, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
LT.sex.perform("orgasm");
assert(LT.sex.lastCondomFailure === "CUM_OVERLOAD", "overload burst");
assert(/burst/i.test(LT.sex.lastResolution), "burst text");

LT.sex.player.wearingCondom = false;
LT.sex.player.forceCondomFailure = null;
LT.sex.player.knotted = false;
LT.game.player.setGender(LT.Gender.MALE);
var lubePartner = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: lubePartner, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.hasLubricationType(LT.sex.player, "MOUTH", "SALIVA"), "start saliva on player mouth");
assert(LT.sex.hasLubricationType(lubePartner, "TONGUE", "SALIVA"), "start saliva on partner tongue");
assert(!LT.sex.hasLubricationType(lubePartner, "VAGINA", "GIRLCUM"), "no girlcum at zero arousal");
lubePartner.arousal = 50;
LT.sex.calculateWetAreas(false);
assert(LT.sex.hasLubricationType(lubePartner, "VAGINA", "GIRLCUM"), "girlcum at moist threshold");
assert(LT.sex.hasLubricationType(lubePartner, "ANUS", "ANAL_LUBE"), "anal lube at moist threshold");
exposeBoth();
LT.sex.perform("cunnilingus_start");
assert(LT.sex.hasLubricationType(lubePartner, "VAGINA", "SALIVA"), "cunnilingus transfers saliva onto the vagina");
assert(/Wet:/.test(LT.sex.lubeSummary()), "lube summary lists wet areas");
assert(/lubricat/i.test(scene.getContent() || LT.sex.logHtml || ""), "sex UI shows wet line");

var slime = makePartner({ name: "Goo", feminine: true, gender: LT.Gender.FEMALE });
slime.bodyMaterial = "SLIME";
LT.sex.start({ partner: slime, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.hasLubricationType(slime, "VAGINA", "SLIME"), "slime body starts lubricated");

LT.sex.player.arousal = 100;
LT.sex.calculateWetAreas(false);
assert(LT.sex.hasLubricationType(LT.sex.player, "PENIS", "PRECUM"), "precum at full arousal");
LT.sex.player.wearingCondom = true;
LT.sex.start({ partner: makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE }), consensual: true, postSexNode: "sex.smokeAfter" });
LT.sex.player.arousal = 100;
LT.sex.calculateWetAreas(false);
assert(!LT.sex.hasLubricationType(LT.sex.player, "PENIS", "PRECUM"), "condom blocks precum on the shaft");
LT.sex.player.wearingCondom = false;

var tight = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: tight, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var tightOrifice = LT.sex.orificeOf(tight, "VAGINA");
tightOrifice.capacity = "ZERO_IMPENETRABLE";
tightOrifice.stretchedCapacity = 0.5;
tightOrifice.elasticity = "THREE_FLEXIBLE";
var startCap = LT.sex.getStretchedCapacity(tight, "VAGINA");
LT.sex.perform("penis_vagina_start");
assert(LT.sex.isStretching(tight, "VAGINA"), "impenetrable vagina stretches around an average penis");
assert(LT.sex.getStretchedCapacity(tight, "VAGINA") > startCap, "stretched capacity increases on first thrust");
assert(/stretch/i.test(LT.sex.lastResolution), "stretch text on a too-tight start");
var midCap = LT.sex.getStretchedCapacity(tight, "VAGINA");
LT.sex.perform("penis_vagina");
assert(LT.sex.getStretchedCapacity(tight, "VAGINA") > midCap, "ongoing penetration keeps stretching");
var stretchTurns = 0;
while (LT.sex.isStretching(tight, "VAGINA") && stretchTurns < 16) {
  LT.sex.perform("penis_vagina");
  stretchTurns += 1;
}
assert(!LT.sex.isStretching(tight, "VAGINA"), "enough turns finish stretching a tight vagina");
assert(LT.sex.getStretchedCapacity(tight, "VAGINA") > 2, "stretched capacity rose toward the penis");

var gaping = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: gaping, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var looseOrifice = LT.sex.orificeOf(gaping, "VAGINA");
looseOrifice.capacity = "SEVEN_GAPING";
looseOrifice.stretchedCapacity = 20.5;
LT.sex.perform("finger_vagina_start");
assert(LT.sex.isTooLoose(gaping, "VAGINA"), "gaping vagina is too loose for fingers");
assert(/loose/i.test(LT.sex.lastResolution), "too-loose text");

var cream = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: cream, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
LT.sex.perform("orgasm_creampie");
assert(LT.sex.hasLubricationType(cream, "VAGINA", "CUM"), "creampie leaves cum inside");
assert(cream.creampieVagina, "creampie flag set for the next encounter");

LT.isNonConEnabled = function () { return true; };
LT.game.player.lust = 10;
var pacePartner = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
pacePartner.lust = 10;
LT.sex.start({ partner: pacePartner, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.getSexPace(LT.sex.player) === "DOM_NORMAL", "default player-dom pace is normal");
assert(LT.sex.getSexPace(pacePartner) === "SUB_NORMAL", "default partner-sub pace is normal");
assert(LT.sex.isDom(LT.sex.player) && !LT.sex.isDom(pacePartner), "player is the lead");
assert(LT.sex.getSexControl(LT.sex.player) === LT.SEX_CONTROL.FULL, "consensual dom has full control");
assert(/Lead: you/.test(LT.sex.paceSummary()) && /normal/.test(LT.sex.paceSummary()), "pace summary names the lead");
assert(/Lead: you/.test(LT.sex.paceSummary()) && /Pace:|normal/.test(LT.sex.paceSummary()), "sex UI shows lead and pace");
var paceMisc = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(paceMisc.indexOf("Gentle") >= 0 && paceMisc.indexOf("Rough") >= 0, "dom pace switches on Misc");
assert(paceMisc.indexOf("Submit") >= 0 && paceMisc.indexOf("Take the lead") < 0, "consensual dom can submit");
assert(paceMisc.indexOf("Eager") < 0 && paceMisc.indexOf("Ask for rough") < 0, "dom does not see sub pace actions");
assert(paceMisc.indexOf("Stop positioning control") >= 0 && paceMisc.indexOf("Forbid self actions") >= 0, "full control forbids partner self/positioning");
LT.sex.perform("pace_gentle");
assert(LT.sex.getSexPace(LT.sex.player) === "DOM_GENTLE", "Gentle forces a gentle pace");
assert(LT.sex.turn >= 1, "gentle pace action spends a turn");
LT.sex.perform("pace_rough");
assert(LT.sex.getSexPace(LT.sex.player) === "DOM_ROUGH", "Rough forces a rough pace");
LT.sex.perform("submit_lead");
assert(!LT.sex.playerDom, "Submit hands the lead to the partner");
assert(LT.sex.getSexPace(LT.sex.player) === "SUB_EAGER", "rough-to-sub becomes eager");
assert(LT.sex.getSexPace(pacePartner) === "DOM_NORMAL", "partner opposite of sub-normal is dom-normal");
var subMisc = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(subMisc.indexOf("Take the lead") >= 0 && subMisc.indexOf("Ask for rough") >= 0, "sub can take the lead or ask for rough");
assert(subMisc.indexOf("Eager") < 0, "already-eager hides Eager");
LT.sex.perform("ask_rough");
assert(LT.sex.getSexPace(pacePartner) === "DOM_ROUGH", "ask for rough sets the partner's pace");
LT.sex.perform("take_lead");
assert(LT.sex.playerDom, "Take the lead returns control");
assert(LT.sex.getSexPace(LT.sex.player) === "DOM_ROUGH", "eager-to-dom becomes rough");

var sadist = makePartner({ name: "Brax", feminine: false, gender: LT.Gender.MALE });
sadist.lust = 80;
sadist.fetishes = { FETISH_SADIST: true };
sadist.hasFetish = function (id) { return id === "FETISH_SADIST"; };
LT.sex.start({ partner: sadist, playerDom: false, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.getSexPace(sadist) === "DOM_ROUGH", "sadist dom is rough");
LT.game.player.lust = 80;
assert(LT.sex.getSexPace(LT.sex.player) === "SUB_EAGER", "high lust sub is eager");

var resister = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: resister, consensual: false, playerDom: true, postSexNode: "sex.smokeAfter" });
LT.sex.setSexPace(resister, "SUB_RESISTING");
var resistPick = LT.sex.pickPartnerAction();
assert(resistPick && resistPick.id === "resist", "resisting partner struggles instead of starting acts");

LT.sex.start({ partner: makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE }), consensual: false, playerDom: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.getSexControl(LT.sex.player) === LT.SEX_CONTROL.ONGOING_PLUS_LIMITED_PENETRATIONS, "non-con player-sub has limited control");
assert(scene.getResponses(LT.game, 2).filter(Boolean).length === 0, "non-con sub cannot change position");
assert(scene.getResponses(LT.game, 3).filter(Boolean).some(function (r) { return r.title === "Resist"; }), "non-con sub can Resist");
assert(scene.getResponses(LT.game, 3).filter(Boolean).every(function (r) { return r.title !== "Stop clothing control"; }), "limited control cannot forbid clothing");

LT.sex.start({ partner: makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE }), consensual: true, postSexNode: "sex.smokeAfter" });
LT.sex.perform("prevent_self");
assert(LT.sex.preventSelf, "forbid self actions");
LT.sex.perform("prevent_positioning");
assert(LT.sex.preventPositioning, "stop positioning control");
LT.sex.lastNpcPositionTurn = -3;
var blockedPos = LT.sex.pickPartnerAction();
assert(!blockedPos || String(blockedPos.id).indexOf("pos_") !== 0, "positioning lock stops the partner changing slots");

LT.game.player.setGender(LT.Gender.MALE);
LT.game.player.lust = 10;
var nia = makePartner({ id: "nia", name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
var rose = makePartner({ id: "rose", name: "Rose", feminine: true, gender: LT.Gender.FEMALE });
nia.lust = 10;
rose.lust = 10;
LT.sex.start({ partner: nia, partners: [rose], consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.participants.length === 3, "threesome has three participants");
assert(LT.sex.partners.length === 2 && LT.sex.partner === nia, "primary target is the first partner");
assert(LT.sex.slotOf(LT.sex.player) === "standing_dom", "player keeps the standing dom slot");
assert(LT.sex.slotOf(nia) === "standing_sub", "first extra partner is in front");
assert(LT.sex.slotOf(rose) === "standing_sub_2", "second extra partner stands beside");
assert(LT.sex.getTarget(LT.sex.player) === nia && LT.sex.getTarget(rose) === LT.sex.player, "player targets Nia; extras target the player");
assert(LT.sex.pairLegal("kiss", LT.sex.player, rose) && LT.sex.pairLegal("penis_vagina", LT.sex.player, rose), "beside slot is face-to-face with the player");
assert(/Rose/.test(scene.getContent()) && LT.sex.slotOf(rose) === "standing_sub_2", "UI lists every participant");
var multiMisc = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(multiMisc.indexOf("Target Rose") >= 0 && multiMisc.indexOf("Target Nia") < 0, "Misc offers the other partner as a target");
LT.sex.perform("target_rose");
assert(LT.sex.partner === rose && LT.sex.getTarget(LT.sex.player) === rose, "Target Rose switches the active partner");
assert(/attention/i.test(LT.sex.lastResolution), "target switch text");
var afterTarget = scene.getResponses(LT.game, 3).filter(Boolean).map(function (r) { return r.title; });
assert(afterTarget.indexOf("Target Nia") >= 0 && afterTarget.indexOf("Target Rose") < 0, "can switch back to Nia");
exposeBoth();
LT.setSexExposed(rose, "VAGINA", true);
LT.sex.perform("do_nothing");
assert((LT.sex.lastResolution.match(/<p>/g) || []).length === 3, "player plus both partners act each turn");
LT.sex.slots.rose = "standing_behind";
assert(LT.sex.slotOf(rose) === "standing_behind", "forced behind slot");
assert(!LT.sex.pairLegal("kiss", rose, nia) && LT.sex.pairLegal("penis_vagina", rose, nia), "behind the sub allows rear sex, not kissing");
assert(!LT.sex.pairLegal("kiss", rose, LT.sex.player), "behind slot cannot reach the standing dom");

LT.sex.start({ partner: nia, partners: [rose], consensual: true, positionName: "All fours", postSexNode: "sex.smokeAfter" });
assert(LT.sex.slotOf(rose) === "doggy_head", "all-fours extra kneels at the head");
assert(LT.sex.pairLegal("cunnilingus", rose, nia) && !LT.sex.pairLegal("penis_vagina", rose, nia), "head slot is oral-only with the person on all fours");
assert(LT.sex.pairLegal("penis_vagina", LT.sex.player, nia) && !LT.sex.pairLegal("kiss", LT.sex.player, nia), "doggy still denies player-sub kissing");

LT.sex.start({ partner: nia, consensual: true, postSexNode: "sex.smokeAfter" });
assert(scene.getResponses(LT.game, 3).filter(Boolean).every(function (r) { return String(r.title).indexOf("Target ") !== 0; }), "1v1 hides target switching");

LT.game.player.setGender(LT.Gender.MALE);
LT.sex.player.wearingCondom = false;
var ralph = makePartner({ id: "ralph", name: "Ralph", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: ralph, manager: "ralph_desk", consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.manager === "ralph_desk" && LT.sex.positionName === "Under desk", "Ralph desk uses the unique under-desk position");
assert(LT.sex.slotOf(LT.sex.player) === "ralph_sub" && LT.sex.slotOf(ralph) === "ralph_dom", "player kneels under Ralph");
assert(!LT.sex.canStop(), "Ralph desk cannot be stopped mid-discount");
assert(scene.getResponses(LT.game, 2).filter(Boolean).length === 0, "Ralph desk locks positioning");
assert(LT.sex.pairLegal("blowjob", LT.sex.player, ralph) && !LT.sex.pairLegal("kiss", LT.sex.player, ralph), "under-desk is oral-only");
exposeBoth();
var ralphPick = LT.sex.pickPartnerAction(ralph, LT.sex.player);
assert(ralphPick && ralphPick.id === "blowjob_receive_start", "Ralph prefers to push into the player's mouth");

var pix = makePartner({ id: "pix", name: "Pix", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: pix, manager: "pix_shower", consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Shower sex" && !LT.sex.canStop(), "Pix shower locks the shower position");
assert(LT.sex.slotOf(LT.sex.player) === "shower_wall" && LT.sex.slotOf(pix) === "shower_behind", "Pix stands behind the player");
assert(LT.sex.hasLubricationType(LT.sex.player, "ANUS", "WATER"), "shower starts wet");
assert(LT.isSexExposed(LT.sex.player, "PENIS") && LT.isSexExposed(pix, "VAGINA"), "Pix shower starts naked");
assert(LT.sex.pairLegal("penis_vagina", pix, LT.sex.player) && !LT.sex.pairLegal("kiss", pix, LT.sex.player), "shower is a behind graph");

var stock = makePartner({ id: "stockSlave", name: "Testa", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({
  partner: stock,
  manager: "stocks",
  playerDom: true,
  consensual: false,
  bannedAreas: { stockSlave: ["VAGINA"] },
  postSexNode: "sex.smokeAfter",
});
assert(LT.sex.positionName === "Stocks" && LT.sex.slotOf(stock) === "stocks_locked", "slave is locked in the stocks");
assert(LT.sex.getSexControl(stock) === LT.SEX_CONTROL.NONE, "locked stocked character has no control");
assert(!LT.sex.pairLegal("penis_vagina", LT.sex.player, stock) && LT.sex.pairLegal("penis_anus", LT.sex.player, stock), "stocks honour banned orifices");
LT.sex.start({ partner: stock, manager: "stocks", playerDom: false, consensual: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.slotOf(LT.sex.player) === "stocks_locked" && LT.sex.getSexControl(LT.sex.player) === LT.SEX_CONTROL.NONE, "player locked in stocks has no control");

var glory = makePartner({ id: "glory", name: "a stranger", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: glory, manager: "glory_hole", playerDom: false, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Glory hole" && LT.sex.slotOf(LT.sex.player) === "glory_kneeling", "servicing a glory hole kneels the player");
assert(LT.sex.pairLegal("blowjob", LT.sex.player, glory) && !LT.sex.pairLegal("penis_vagina", LT.sex.player, glory), "glory hole service is oral-only");
LT.sex.start({ partner: glory, manager: "glory_hole", playerDom: true, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.slotOf(LT.sex.player) === "glory_receiving", "using a glory hole presents the player");

var brax = makePartner({ id: "brax", name: "Brax", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: brax, manager: "brax_doggy", playerDom: false, consensual: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.slotOf(LT.sex.player) === "doggy_all_fours" && LT.sex.slotOf(brax) === "doggy_dom", "Brax doggy puts the player on all fours");
assert(scene.getResponses(LT.game, 2).filter(Boolean).length === 0, "Brax doggy locks positioning");
assert(LT.sex.pairLegal("penis_vagina", brax, LT.sex.player), "Brax can mount from behind");

var amber = makePartner({ id: "amber", name: "Amber", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: amber, manager: "amber_doggy", playerDom: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.manager === "amber_doggy" && LT.sex.preventPositioning, "Amber doggy uses the locked manager");

LT.sex.start({ partner: nia, manager: "milking_stall", playerDom: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Milking stall" && LT.sex.slotOf(nia) === "stall_locked", "milking stall locks the partner");
assert(LT.sex.getSexControl(nia) === LT.SEX_CONTROL.NONE, "locked milking partner has no control");

var bunny = makePartner({ id: "bunny", name: "Bunny", feminine: true, gender: LT.Gender.FEMALE });
var loppy = makePartner({ id: "loppy", name: "Loppy", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({
  partner: bunny,
  partners: [loppy],
  manager: "bunny_loppy",
  consensual: true,
  postSexNode: "sex.smokeAfter",
});
assert(LT.sex.manager === "bunny_loppy" && LT.sex.positionName === "All fours", "sisters threesome prefers doggy");
assert(LT.sex.slotOf(LT.sex.player) === "doggy_dom", "player is the one behind the sisters");
assert(LT.sex.slotOf(bunny) === "doggy_all_fours" && LT.sex.slotOf(loppy) === "doggy_all_fours_2", "both sisters present on all fours");
assert(LT.sex.pairLegal("penis_anus", LT.sex.player, loppy) && LT.sex.pairLegal("penis_vagina", LT.sex.player, bunny), "player can take either sister");
assert(!LT.sex.pairLegal("kiss", LT.sex.player, bunny), "sisters on all fours cannot kiss the player");

LT.game.player.setGender(LT.Gender.FEMALE);
var actP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: actP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
var baseTitles = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(baseTitles.indexOf("Finger her clit") >= 0, "finger-clit pair is available");
assert(baseTitles.indexOf("Hold her hand") >= 0, "finger-finger pair is available");
assert(baseTitles.indexOf("Lick her breasts") >= 0, "tongue-breasts pair is available");
assert(baseTitles.indexOf("Push fingers into her mouth") >= 0, "finger-mouth pair is available");
var selfTitles = scene.getResponses(LT.game, 1).filter(Boolean).map(function (r) { return r.title; });
assert(selfTitles.some(function (t) { return /Suck/.test(t) && /finger/i.test(t); }), "self finger-mouth on Self tab");

var moundP = makePartner({ name: "Brax", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: moundP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Lick his mound"; }), "tongue-mound when the partner has no vagina");
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return /foot/i.test(r.title); }), "foot-to-mouth is available when feet are exposed");

var spin = makePartner({ name: "Web", feminine: true, gender: LT.Gender.FEMALE });
spin.hasSpinneret = function () { return true; };
LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: spin, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Fuck her spinneret"; }), "spinneret PIV when flagged");

var crotch = makePartner({ name: "Udder", feminine: true, gender: LT.Gender.FEMALE });
crotch.hasCrotchBoobs = true;
crotch.fuckableCrotchNipples = true;
LT.sex.start({ partner: crotch, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return /crotch-nipple/i.test(r.title); }), "crotch-nipple acts when flagged");

var herm = makePartner({ name: "Herm", feminine: true, gender: LT.Gender.FEMALE });
herm.hasPenis = function () { return true; };
herm.hasVagina = function () { return true; };
LT.sex.start({ partner: herm, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.game.player.hasPenis = function () { return true; };
LT.game.player.hasVagina = function () { return true; };
LT.setSexExposed(LT.game.player, "PENIS", true);
LT.setSexExposed(LT.game.player, "VAGINA", true);
assert(scene.getResponses(LT.game, 1).filter(Boolean).some(function (r) { return r.title === "Fuck yourself"; }), "self PIV when hermaphroditic");

LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: actP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "DOM_ROUGH");
LT.sex.perform("kiss_start");
assert(/rough|crush/i.test(LT.sex.lastResolution), "rough pace changes kiss text");
LT.sex.start({ partner: actP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "DOM_GENTLE");
LT.sex.perform("penis_vagina_start");
assert(/gentle|slowly|ease/i.test(LT.sex.lastResolution), "gentle pace changes PIV text");
var paceMale = makePartner({ name: "Brax", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: paceMale, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "DOM_ROUGH");
LT.sex.perform("blowjob_start");
assert(/rough|force|deep/i.test(LT.sex.lastResolution), "rough pace changes blowjob text");
LT.sex.start({ partner: paceMale, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "DOM_GENTLE");
LT.sex.perform("finger_penis_start");
assert(/gentle|slowly/i.test(LT.sex.lastResolution), "gentle pace changes handjob text");
LT.sex.start({ partner: actP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "DOM_ROUGH");
LT.sex.perform("penis_anus_start");
assert(/rough|slam/i.test(LT.sex.lastResolution), "rough pace changes anal text");
LT.sex.start({ partner: actP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "SUB_EAGER");
LT.sex.perform("cunnilingus_start");
assert(/desperate|hungrily|eager/i.test(LT.sex.lastResolution), "eager pace changes cunnilingus text");

LT.sex.start({ partner: actP, consensual: true, postSexNode: "sex.smokeAfter" });
assert(scene.getResponses(LT.game, 2).filter(Boolean).some(function (r) { return /desk/i.test(r.title); }), "Over desk is on Positioning");
LT.sex.perform("pos_over_desk");
assert(LT.sex.positionName === "Over desk", "over-desk position sets");
assert(LT.sex.pairLegal("penis_vagina", LT.sex.player, actP) && !LT.sex.pairLegal("kiss", LT.sex.player, actP), "over desk is a behind graph");

LT.game.player.setGender(LT.Gender.MALE);
var cumMore = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: cumMore, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.player.arousal = 100;
var standingCum = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(standingCum.indexOf("Cum in hair") >= 0 && standingCum.indexOf("Cum on your groin") >= 0, "standing offers hair and self-groin");
assert(standingCum.indexOf("Cum on legs") >= 0 && standingCum.indexOf("Cum on your face") >= 0, "standing offers legs and self-face");
assert(standingCum.indexOf("Cum up wall") < 0 && standingCum.indexOf("Cum on back") < 0, "standing hides behind-only cum targets");
LT.sex.perform("orgasm_hair");
assert(LT.sex.lastCumTarget === "HAIR", "hair target recorded");
assert(/hair/i.test(LT.sex.lastResolution), "hair climax text");

LT.sex.start({ partner: cumMore, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("pos_all_fours");
LT.sex.player.arousal = 100;
var doggyCum = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(doggyCum.indexOf("Cum up wall") >= 0 && doggyCum.indexOf("Cum on back") >= 0, "doggy offers wall and back");
assert(doggyCum.indexOf("Cum on face") < 0 && doggyCum.indexOf("Cum in hair") < 0, "doggy hides frontal facial targets");
LT.sex.perform("orgasm_wall");
assert(LT.sex.lastCumTarget === "WALL", "wall target recorded");
assert(/wall/i.test(LT.sex.lastResolution), "wall climax text");

LT.sex.start({ partner: cumMore, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.player.arousal = 100;
LT.sex.perform("orgasm_self_groin");
assert(LT.sex.lastCumTarget === "SELF_GROIN", "self-groin target recorded");
assert(LT.sex.hasLubricationType(LT.sex.player, "PENIS", "CUM"), "self-groin leaves cum on the player");

LT.game.player.setGender(LT.Gender.FEMALE);
var waitP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: waitP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
waitP.arousal = 100;
var prepTitles = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(prepTitles.indexOf("Prepare") >= 0, "partner climax offers Prepare");
assert(prepTitles.indexOf("Deny") >= 0, "dominant player can Deny at partner climax");
assert(prepTitles.indexOf("Start kissing") < 0, "regular acts hide while the partner is about to orgasm");
LT.sex.perform("orgasm_prepare");
assert(waitP.orgasmedThisSex === 1, "prepare lets the partner orgasm this turn");
assert(waitP.arousal < 10, "partner orgasm resets arousal");
assert(/prepare/i.test(LT.sex.lastResolution), "prepare text plays before the climax");

LT.sex.start({ partner: waitP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
waitP.arousal = 100;
LT.sex.perform("orgasm_deny");
assert(waitP.orgasmedThisSex === 0, "deny prevents the partner orgasm");
assert(waitP.arousal < 100, "deny drops partner arousal");
assert(/climax|still|arms/i.test(LT.sex.lastResolution), "deny uses official hold-still lines");

LT.game.player.setGender(LT.Gender.FEMALE);
var cockP = makePartner({ name: "Brax", feminine: false, gender: LT.Gender.MALE });
LT.sex.start({ partner: cockP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_receive_start");
cockP.arousal = 100;
var reqTitles = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(reqTitles.indexOf("Request creampie") >= 0, "taking a cock offers Request creampie");
assert(reqTitles.indexOf("Request pull-out") >= 0, "taking a cock offers Request pull-out");
LT.sex.perform("orgasm_request_creampie");
assert(LT.sex.lastCumTarget === "INSIDE", "requested creampie is honoured");
assert(LT.game.player.creampieVagina, "requested creampie fills the player");

cockP.knotted = true;
LT.sex.start({ partner: cockP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.perform("penis_vagina_receive_start");
cockP.arousal = 100;
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Request knot"; }), "knotted cock offers Request knot");
LT.sex.perform("orgasm_request_knot");
assert(LT.sex.knotted && LT.sex.knotted.locked && LT.sex.knotted.receiver === LT.sex.player, "requested knot locks the player");

LT.game.player.setGender(LT.Gender.MALE);
var lockP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: lockP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.player.knotted = true;
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
LT.sex.perform("orgasm_knot");
assert(LT.sex.knotted && LT.sex.knotted.locked, "knot lock is active after knotting");
var lockedSex = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(lockedSex.indexOf("Stop fucking") < 0, "knot lock hides Stop fucking");
assert(scene.getResponses(LT.game, 2).filter(Boolean).length === 0, "knot lock blocks position changes");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "penis_vagina"; }), "knot keeps the penis inside");
LT.sex.perform("penis_vagina");
LT.sex.perform("penis_vagina");
assert(LT.sex.knotted && LT.sex.knotted.locked, "knot still locked after two turns");
LT.sex.perform("penis_vagina");
assert(!LT.sex.knotted, "knot deflates after a few turns");
assert(/deflate|wet pop/i.test(LT.sex.lastResolution), "deflate text plays");
assert(!LT.sex.listOngoing().some(function (l) { return l.id === "penis_vagina"; }), "deflating the knot pulls out");

var nia2 = makePartner({ id: "nia2", name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
var rose2 = makePartner({ id: "rose2", name: "Rose", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: nia2, partners: [rose2], consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.setSexExposed(rose2, "VAGINA", true);
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 100;
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Double creampie"; }), "3+ inside offers double creampie");
LT.sex.perform("orgasm_double_creampie");
assert(LT.sex.lastCumTarget === "INSIDE_SWITCH_DOUBLE", "double creampie target recorded");
assert(nia2.creampieVagina && rose2.creampieVagina, "double creampie fills both partners");

LT.sex.start({ partner: nia2, usingLilayaPanties: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.player.arousal = 100;
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Cum in Lilaya's panties"; }), "Lilaya panties orgasm when flagged");
LT.sex.perform("orgasm_lilaya_panties");
assert(LT.sex.lastCumTarget === "LILAYA_PANTIES", "Lilaya panties target recorded");
assert(/panties/i.test(LT.sex.lastResolution), "Lilaya panties climax text");

LT.sex.start({ partner: makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE }), consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.partner.arousal = 60;
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Deny"; }), "mid-scene Deny when the partner is close");
LT.sex.perform("deny");
assert(LT.sex.partner.arousal < 60, "mid-scene Deny drops arousal");

LT.game.player.setGender(LT.Gender.MALE);
var talkP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: talkP, consensual: true, postSexNode: "sex.smokeAfter" });
assert(scene.getResponses(LT.game, 3).filter(Boolean).some(function (r) { return r.title === "Dirty talk"; }), "Misc offers Dirty talk");
exposeBoth();
LT.sex.perform("penis_vagina_start");
assert(LT.sex.getSexTypeCount(LT.sex.player, talkP, "PENIS", "VAGINA") === 1, "starting PIV records the sex type");
assert(LT.sex.relatedFetishes("PENIS", "VAGINA", LT.sex.player, talkP).indexOf("FETISH_VAGINAL_GIVING") >= 0, "PIV is a vaginal-giving type");
assert(LT.sex.calculateSexTypeWeighting(LT.sex.player, talkP, "PENIS", "VAGINA") > 0, "neutral PIV weighting is positive");
LT.sex.perform("dirty_talk");
assert(/speech\(|pussy|cock|good|stop/i.test(LT.sex.lastResolution), "dirty talk uses the current pair");

var oralP = makePartner({ id: "oralP", name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
oralP.fetishes = { FETISH_ORAL_GIVING: true };
LT.sex.start({ partner: oralP, consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.setSexExposed(LT.sex.player, "PENIS", true);
LT.sex.perform("do_nothing");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "blowjob"; }), "oral fetish prefers starting a blowjob over PIV");

var hateP = makePartner({ id: "hateP", name: "Brax", feminine: false, gender: LT.Gender.MALE });
hateP.fetishDesire = { FETISH_VAGINAL_GIVING: "ZERO_HATE" };
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: hateP, consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(LT.sex.calculateSexTypeWeighting(hateP, LT.sex.player, "PENIS", "VAGINA") < 0, "hated vaginal-giving scores below zero");
LT.sex.perform("do_nothing");
assert(!LT.sex.listOngoing().some(function (l) { return l.id === "penis_vagina"; }), "hated PIV is not started");

var prefP = makePartner({ id: "prefP", name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
prefP.mainSexPreference = { performing: "MOUTH", targeted: "PENIS" };
LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: prefP, consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(LT.sex.calculateSexTypeWeighting(prefP, LT.sex.player, "MOUTH", "PENIS") >
  LT.sex.calculateSexTypeWeighting(prefP, LT.sex.player, "VAGINA", "PENIS"), "main sex preference outranks a neutral receive-PIV");
LT.sex.perform("do_nothing");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "blowjob"; }), "preferred sex type is the one started");
assert(LT.sex.getSexTypeCount(prefP, LT.sex.player, "MOUTH", "PENIS") >= 1, "partner start is remembered");

LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ masturbation: true, consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.active && LT.sex.masturbation, "solo masturbation starts without a partner");
assert(LT.sex.positionName === "Masturbation", "default masturbation slot is standing");
assert(LT.sex.partner === LT.sex.player, "masturbation targets the player");
assert(LT.sex.pairLegal("self_finger_vagina") && !LT.sex.pairLegal("kiss"), "masturbation is self-only");
assert(LT.sex.pairLegal("finger_vagina") === false, "partner fingering is blocked while masturbating");
var mastPos = scene.getResponses(LT.game, 2).filter(Boolean).map(function (r) { return r.title; });
assert(mastPos.indexOf("Sitting") >= 0 && mastPos.indexOf("Kneeling") >= 0, "masturbation can switch to sitting or kneeling");
assert(mastPos.indexOf("Missionary") < 0 && mastPos.indexOf("Doggy-style her") < 0, "partnered positions hide during masturbation");
assert(scene.getResponses(LT.game, 3).filter(Boolean).every(function (r) { return r.title !== "Dirty talk"; }), "dirty talk hides during masturbation");
exposeBoth();
assert(scene.getResponses(LT.game, 1).filter(Boolean).some(function (r) { return r.title === "Finger yourself" || r.title === "Finger herself"; }), "Self tab offers fingering while masturbating");
LT.sex.perform("self_finger_vagina_start");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "self_finger_vagina"; }), "self fingering starts in masturbation");
LT.sex.setSexPace(LT.sex.player, "DOM_GENTLE");
LT.sex.perform("self_finger_vagina");
assert(/slowly|gently/i.test(LT.sex.lastResolution), "gentle pace changes self-fingering text");
LT.sex.perform("pos_masturbate_sitting");
assert(LT.sex.positionName === "Masturbation (sitting)", "sitting masturbation slot sets");
assert(/seated|sitting/i.test(LT.sex.lastResolution), "sitting switch uses the official line");
LT.sex.player.arousal = 100;
var mastCum = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(mastCum.indexOf("Orgasm") >= 0 || mastCum.some(function (t) { return /your |floor/i.test(t); }), "masturbation climax offers self or generic orgasm");
assert(mastCum.indexOf("Cum on face") < 0 && mastCum.indexOf("Creampie") < 0, "masturbation hides partner cum targets");

LT.sex.start({ manager: "masturbation_panties", consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Masturbation (panties)", "panties manager uses the kneeling-panties slot");
assert(LT.sex.usingLilayaPanties, "panties manager flags Lilaya panties");
exposeBoth();
LT.game.player.setGender(LT.Gender.MALE);
LT.setSexExposed(LT.sex.player, "PENIS", true);
LT.sex.player.arousal = 100;
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Cum in Lilaya's panties"; }), "panties climax offers Lilaya panties");

var breed = makePartner({ name: "Epona", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: breed, manager: "breeding_stall", consensual: true, playerDom: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Breeding stall", "breeding stall manager position");
assert(LT.sex.slotOf(LT.sex.player) === "breeding_fucking" && LT.sex.slotOf(breed) === "breeding_back", "breeder stands, mother lies on her back");
assert(LT.sex.pairLegal("penis_vagina") && !LT.sex.pairLegal("kiss") && !LT.sex.pairLegal("blowjob"), "breeding stall is groin-only");
assert(scene.getResponses(LT.game, 2).filter(Boolean).length === 0, "breeding stall locks positioning");

LT.sex.start({ partner: breed, manager: "breeding_stall", consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.slotOf(LT.sex.player) === "breeding_back" && LT.sex.slotOf(breed) === "breeding_fucking", "sub player lies on the bench");

var hole = makePartner({ name: "Stranger", feminine: false, gender: LT.Gender.MALE });
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: hole, manager: "glory_hole_sex", consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Glory hole sex", "glory hole sex manager position");
assert(LT.sex.slotOf(LT.sex.player) === "glory_fucked" && LT.sex.slotOf(hole) === "glory_fucking", "player presents, partner fucks through the hole");
assert(LT.sex.pairLegal("penis_vagina", hole, LT.sex.player) && !LT.sex.pairLegal("kiss"), "glory hole sex allows PIV, not kissing");

var tailP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
tailP.hasTail = function () { return true; };
LT.game.player.setGender(LT.Gender.FEMALE);
LT.game.player.hasTail = function () { return true; };
LT.sex.start({ partner: tailP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(LT.sex.player, "DOM_ROUGH");
LT.sex.perform("tail_vagina_start");
assert(/rough|thrust/i.test(LT.sex.lastResolution), "rough pace changes tail-fuck text");

LT.game.player.hasTail = function () { return false; };
LT.game.player.setGender(LT.Gender.FEMALE);
var skipP = makePartner({ name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: skipP, consensual: true, postSexNode: "sex.smokeAfter" });
assert(scene.getResponses(LT.game, 3).filter(Boolean).some(function (r) { return r.title === "Quick sex"; }), "consensual Misc offers Quick sex");
exposeBoth();
LT.sex.perform("skip_sex");
assert(LT.sex.finished, "Quick sex ends the scene");
assert(LT.sex.player.orgasmedThisSex >= 1 && skipP.orgasmedThisSex >= 1, "Quick sex applies orgasms");
assert(LT.sex.skipSeconds >= 180, "Quick sex advances several minutes");
assert(/skip|preferences|climax|orgasm/i.test(LT.sex.lastResolution), "Quick sex describes the skipped encounter");

LT.sex.start({ partner: skipP, manager: "ralph_desk", postSexNode: "sex.smokeAfter" });
assert(scene.getResponses(LT.game, 3).filter(Boolean).every(function (r) { return r.title !== "Quick sex"; }), "unique no-stop scenes cannot skip");

var watched = makePartner({ id: "watched", name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
var watcher = makePartner({ id: "watcher", name: "Rose", feminine: true, gender: LT.Gender.FEMALE });
LT.sex.start({ partner: watched, spectators: [watcher], consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.isSpectator(watcher) && !LT.sex.isSpectator(watched), "spectator is flagged watching");
assert(LT.sex.slotOf(watcher) === "watching", "spectator uses the watching slot");
assert(!LT.sex.pairLegal("kiss", watcher, watched), "spectators cannot start sex pairs");
exposeBoth();
LT.sex.perform("do_nothing");
assert(/watch|look on/i.test((LT.sex.lastResolution || "") + (LT.sex.logHtml || "")), "spectator watches instead of acting");
assert(/watching/i.test(scene.getContent()), "UI marks the spectator");

LT.sex.start({ partner: watched, publicSex: true, consensual: true, postSexNode: "sex.smokeAfter" });
assert(/Public /.test(scene.title(LT.game)), "public sex prefixes the title");
LT.sex.perform("do_nothing");
assert(/passerby|whistle|stranger/i.test(LT.sex.lastResolution), "public sex appends a watcher line");

LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: skipP, consensual: true, postSexNode: "sex.smokeAfter" });
exposeBoth();
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return /Fondle/.test(r.title); }), "fondle breasts pair is available");
var selfMore = scene.getResponses(LT.game, 1).filter(Boolean).map(function (r) { return r.title; });
assert(selfMore.some(function (t) { return /own breast|Grope/.test(t); }), "self breast fondling is on Self");

assert(LT.SEX_MANAGERS.rose_hands && LT.SEX_MANAGERS.lilaya_lab && LT.SEX_MANAGERS.vicky_desk && LT.SEX_MANAGERS.scarlett_oral, "Dominion unique managers are registered");
assert(LT.SEX_POSITIONS["Hand-holding"] && LT.SEX_POSITIONS["Hand-holding"].allow.finger_mouth && !LT.SEX_POSITIONS["Hand-holding"].allow.kiss, "Hand-holding is a hands-only slot graph");

var roseHands = makePartner({ id: "rose", name: "Rose", feminine: true, gender: LT.Gender.FEMALE });
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: roseHands, manager: "rose_hands", consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Hand-holding", "Rose hands manager uses Hand-holding");
assert(LT.sex.preventPositioning, "Rose hands locks positioning");
assert(LT.sex.pairLegal("finger_mouth") && LT.sex.pairLegal("finger_finger") && !LT.sex.pairLegal("kiss") && !LT.sex.pairLegal("penis_vagina"), "Rose hands only allows hand pairs");
var roseActs = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(roseActs.indexOf("Hand massage") >= 0 && roseActs.indexOf("Interlock fingers") >= 0 && roseActs.indexOf("Nail rub") >= 0, "Rose unique hand actions are listed");
assert(roseActs.indexOf("Stroke fingers") >= 0 && roseActs.indexOf("Lick palms") >= 0 && roseActs.indexOf("Suck fingers") >= 0, "Rose lick and suck actions are listed");
assert(roseActs.indexOf("Start kissing") < 0 && roseActs.indexOf("Hold her hand") < 0, "generic pairs hide during Rose hands");
LT.sex.perform("rose_hand_massage");
assert(/massage|hand/i.test(LT.sex.lastResolution), "Rose hand massage uses official hand-holding text");
assert(/cry|moan|pant|brace|aah|don't stop|hand-holding|table-top|weak at the knees|keep going/i.test(LT.sex.lastResolution), "Rose answers a hand action with her unique reaction");
LT.sex.perform("rose_suck_start");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "finger_mouth"; }), "sucking Rose's fingers occupies mouth and fingers");
assert(scene.getResponses(LT.game, 0).filter(Boolean).some(function (r) { return r.title === "Gentle suck" || r.title === "Intense suck"; }), "ongoing Rose suck options appear");
assert(scene.getResponses(LT.game, 0).filter(Boolean).every(function (r) { return r.title !== "Lick palms"; }), "lick palms hides while the mouth is occupied");

var lilayaP = makePartner({ id: "lilaya", name: "Lilaya", feminine: true, gender: LT.Gender.FEMALE });
lilayaP.fetishDesire = { FETISH_PREGNANCY: "ZERO_HATE" };
LT.game.player.setGender(LT.Gender.MALE);
LT.sex.start({ partner: lilayaP, manager: "lilaya_lab", consensual: true, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Sitting (in lap)" && LT.sex.manager === "lilaya_lab", "Lilaya lab manager sits");
exposeBoth();
LT.sex.perform("penis_vagina_start");
LT.sex.player.arousal = 80;
LT.sex.perform("penis_vagina");
assert(LT.sex.requestedPullout, "Lilaya demands a pull-out once the player is passionate");
assert(/pull out|not getting pregnant/i.test(LT.sex.lastResolution), "Lilaya pull-out reminder uses official speech");
LT.sex.player.arousal = 100;
var lilayaPrep = scene.getResponses(LT.game, 0).filter(Boolean).map(function (r) { return r.title; });
assert(lilayaPrep.indexOf("Creampie") >= 0 && lilayaPrep.indexOf("Pull out (floor)") >= 0, "player climax still offers creampie and pull-out");
LT.sex.perform("orgasm_creampie");
assert(/pull out! I'm/i.test(LT.sex.lastResolution) || /not getting pregnant/i.test(LT.sex.lastResolution), "Lilaya unique-max asks for pull-out as the player cums");
if (typeof LT.hasStatusEffect !== "function") {
  LT.hasStatusEffect = function (ch, id) {
    return !!(ch && ch.statusEffects && ch.statusEffects[id]);
  };
}
if (typeof LT.addStatusEffect !== "function") {
  LT.addStatusEffect = function (ch, id) {
    ch.statusEffects = ch.statusEffects || {};
    ch.statusEffects[id] = { id: id };
  };
}
if (!LT.hasStatusEffect(lilayaP, "PREGNANT_0")) LT.addStatusEffect(lilayaP, "PREGNANT_0");
LT.sex.player.arousal = 0;
lilayaP.arousal = 20;
LT.sex.perform("do_nothing");
assert(LT.sex.finished, "Lilaya furious-stop ends sex after a pregnancy-risk creampie");
assert(/told you to pull out|Creampied/i.test(LT.sex.lastResolution), "furious stop uses official creampie dialogue");

var vickyP = makePartner({ id: "vicky", name: "Vicky", feminine: true, gender: LT.Gender.F_P_V_B_FUTANARI });
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: vickyP, manager: "vicky_desk", consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.managerCanStop === false && LT.sex.preventPositioning, "Vicky manager cannot be stopped and locks the position");
exposeBoth();
vickyP.arousal = 100;
LT.sex.perform("do_nothing");
assert(LT.sex.finished, "Vicky marking orgasm ends the scene");
assert(LT.sex.lastCumTarget === "FACE", "Vicky unique orgasm is a facial");
assert(/mark you with my scent|good little prey|belong to me/i.test(LT.sex.lastResolution), "Vicky marking uses official facial text");

var scarlettP = makePartner({ id: "scarlett", name: "Scarlett", feminine: false, gender: LT.Gender.M_P_MALE });
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: scarlettP, manager: "scarlett_oral", consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
assert(LT.sex.positionName === "Perform oral", "Scarlett shop oral kneels the player");
assert(LT.sex.getSexControl(LT.sex.player) === LT.SEX_CONTROL.ONGOING_ONLY, "player shop-oral control is ongoing-only");
assert(LT.sex.managerCanStop === false, "Scarlett shop oral cannot be stopped");
exposeBoth();
LT.sex.perform("do_nothing");
assert(LT.sex.listOngoing().some(function (l) { return l.id === "blowjob"; }), "Scarlett shop oral prefers starting a blowjob");
LT.sex.turn = 3;
LT.sex.player.arousal = 20;
scarlettP.arousal = 20;
LT.sex.flags.forceScarlettInterrupt = true;
LT.sex.perform("blowjob");
assert(/customer|busy|fuck off|keep sucking/i.test(LT.sex.lastResolution), "Scarlett customer interruption fires in the shop-oral manager");
assert(LT.sex.flags.scarlettInterruptedTurn != null, "customer interruption records the turn");
scarlettP.arousal = 80;
LT.sex.player.arousal = 40;
LT.sex.perform("blowjob");
assert(/Helena|complaint|finish me off/i.test(LT.sex.lastResolution), "Helena interruption follows the customer one");
var scarlettRough = makePartner({ id: "scarlett", name: "Scarlett", feminine: false, gender: LT.Gender.M_P_MALE });
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: scarlettRough, consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
exposeBoth();
LT.sex.setSexPace(scarlettRough, "DOM_ROUGH");
LT.sex.links = [{ id: "penis_anus", giver: scarlettRough, receiver: LT.sex.player, giverArea: "PENIS", receiverArea: "ANUS", label: "anal" }];
LT.sex.player.arousal = 100;
LT.sex._playerAct = LT.SEX_ACTIONS.orgasm;
var tease = LT.sex.pickPartnerAction(scarlettRough, LT.sex.player);
assert(tease && tease.id === "scarlett_buttslut_tease", "Scarlett rough anal prepare is Buttslut tease");
var climaxActs = LT.sex.availableActions(0) || [];
var climaxId = (climaxActs[0] && climaxActs[0].id) || "orgasm";
LT.sex.perform(climaxId);
assert(/buttslut|cock in your ass|bitch/i.test(LT.sex.lastResolution), "Buttslut tease uses official Scarlett speech");

var stopDom = makePartner({ id: "stopDom", name: "Nia", feminine: true, gender: LT.Gender.FEMALE });
LT.game.player.setGender(LT.Gender.FEMALE);
LT.sex.start({ partner: stopDom, consensual: true, playerDom: false, postSexNode: "sex.smokeAfter" });
stopDom.orgasmedThisSex = 1;
LT.game.player.orgasmedThisSex = 1;
LT.sex._playerAct = { id: "kiss", isOrgasm: false };
assert(LT.sex.isPartnerWantingToStopSex(stopDom), "satisfied non-submissive partner wants to stop");
var stopPick = LT.sex.pickPartnerAction(stopDom, LT.game.player);
assert(stopPick && stopPick.endsSex, "NPC pick returns a stop-sex action when satisfied");
LT.sex.perform("do_nothing");
assert(LT.sex.finished, "NPC ends the scene after being satisfied");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("All sex kernel checks passed.");
