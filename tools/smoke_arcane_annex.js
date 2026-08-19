/* node "Liliths Throne HTML/tools/smoke_arcane_annex.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

function countP(html) {
  return (String(html).match(/<p[\s>]/gi) || []).length;
}
function countSentences(html) {
  var text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 8; }).length;
}
function titles(list) {
  return (list || []).filter(Boolean).map(function (r) { return r.title; });
}

var context = {
  console: console,
  window: {
    allGrids: {
      DOMINION: [
        {
          x: 10,
          y: 8,
          location: {
            name: "Dominion Boulevard",
            placeType: "DOMINION_BOULEVARD",
            passage: "place.DOMINION_BOULEVARD",
            description: "The main boulevards.",
          },
        },
      ],
    },
    LT_GRID_META: {},
    grid: { gridName: "DOMINION", playerPosition: { x: 10, y: 8 } },
  },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: {
    _d: {},
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
    setItem: function (k, v) { this._d[k] = String(v); },
  },
  LT: {
    TEXT: {},
    SPELLS: {
      FIREBALL: { id: "FIREBALL", name: "Fireball", school: "FIRE" },
      FLASH: { id: "FLASH", name: "Flash", school: "FIRE" },
      ICE_SHARD: { id: "ICE_SHARD", name: "Ice Shard", school: "WATER" },
    },
    Colour: { FEMININE: "#f6a", MASCULINE: "#6af", GENERIC_MINOR_GOOD: "#8c6", GENERIC_GOOD: "#6c6", GENERIC_BAD: "#c66", ATTRIBUTE_LUST: "#e6a" },
    game: {
      started: true,
      secondsPassed: 12 * 3600,
      player: { money: 40000, arcane: 10, knownSpells: [], location: { world: "DOMINION", place: "DOMINION_BOULEVARD", x: 10, y: 8 } },
      flags: {},
      npcs: {},
      textStart: "",
      setContent: function (id) { this._node = id; },
      advanceTime: function (s) { this.secondsPassed += s; },
    },
  },
};
context.window.LT = context.LT;
context.window.document = context.document;
context.grid = context.window.grid;

context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.parse = function (s) {
  return String(s || "").replace(/\[[a-z0-9]+\.speech\(([^\]]*)\)\]/gi, '"$1"');
};
context.LT.withParseTargets = function (m, fn) { return fn(); };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.travelResponses = function () { return []; };
context.LT.enterWorld = function (g, p, c) {
  context.LT.game.player.location = { world: g, place: p || "", x: c && c.x, y: c && c.y };
};
context.LT.getMoney = function () { return context.LT.game.player.money; };
context.LT.incrementMoney = function (d) { context.LT.game.player.money += d; return ""; };
context.LT.incrementMana = function () { return 0; };
context.LT.incrementExperience = function (n) { context.LT._xp = (context.LT._xp || 0) + n; return ""; };
context.LT.incrementAffection = function () { return ""; };
context.LT.knownSpells = function (ch) { return (ch && ch.knownSpells) || []; };
context.LT.learnSpell = function (ch, id) {
  ch.knownSpells = ch.knownSpells || [];
  if (ch.knownSpells.indexOf(id) < 0) ch.knownSpells.push(id);
};
context.LT.isWorkTime = function () { return true; };
context.LT.markCharacterEncountered = function () {};
context.LT.refreshVitals = function (n) { return n; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittyDominionArcaneUniversity/annexGrid.js");
load("mods/KittyDominionArcaneUniversity/KittyDominionArcaneUniversity.js");
load("mods/KittyDominionArcaneUniversity/uniScenes.js");
load("mods/KittyDominionArcaneUniversity/uniNightclub.js");
load("mods/KittyDominionArcaneUniversity/uniTutor.js");
load("mods/KittyDominionArcaneUniversity/uniSeduce.js");
load("mods/KittyDominionArcaneUniversity/uniClass.js");
load("mods/KittyDominionArcaneUniversity/uniTeach.js");

var LT = context.LT;
var api = LT.kittyArcaneUniversity;
assert(api, "API");
assert(context.window.allGrids.KITTY_ARCANE_ANNEX.length >= 40, "large annex grid");
assert(
  context.window.allGrids.KITTY_ARCANE_ANNEX.some(function (t) { return t.location.placeType === "KITTY_ANNEX_FOYER"; }) &&
    context.window.allGrids.KITTY_ARCANE_ANNEX.some(function (t) { return t.location.placeType === "KITTY_ANNEX_LECTURE"; }),
  "foyer + lecture"
);
assert(LT.hasNode("place.KITTY_ANNEX_FOYER") && LT.hasNode("place.KITTY_ANNEX_OFFICE") && LT.hasNode("place.KITTY_ANNEX_LECTURE"), "nodes");

var door = context.window.allGrids.DOMINION[0];
assert(door.location.placeType === "KITTY_UNI_ENTRANCE" && door.location.passage === "place.KITTY_UNI_ENTRANCE", "Dominion 10,8 is the University tile");
assert(LT.hasNode("place.KITTY_UNI_ENTRANCE"), "University location node");
var uniPage = LT.getNode("place.KITTY_UNI_ENTRANCE");
LT.game.currentNode = uniPage;
LT.game.player.location = { world: "DOMINION", place: "KITTY_UNI_ENTRANCE", x: 10, y: 8 };
assert(/Dominion|campus|students|university/i.test(uniPage.getContent()), "University page text");
assert(uniPage.getResponses().some(function (r) { return r && r.title === "Enter"; }), "University page Enter");
LT.game.player.location = { world: "DOMINION", place: "DOMINION_BOULEVARD", x: 10, y: 9 };
context.window.grid.playerPosition = { x: 10, y: 9 };
assert(!LT.travelResponses().some(function (r) { return r && /Enter|Arcane University/i.test(r.title); }), "no door at 10,9");

api.ensureStaff();
assert(LT.game.npcs.dean && LT.game.npcs.merrin, "dean");

var office = LT.getNode("place.KITTY_ANNEX_OFFICE");
var intro = office.getContent();
assert(countP(intro) === 3, "Merrin intro is 3 paragraphs (" + countP(intro) + ")");
assert(countSentences(intro) === 9, "Merrin intro is 9 sentences (" + countSentences(intro) + ")");
assert(intro.indexOf("[npc.speech") < 0 && intro.indexOf("[dean.speech") < 0, "intro speech parsed");

var officeBtns = office.getResponses();
var officeTitles = titles(officeBtns);
assert(officeTitles.some(function (t) { return /^Week pass/.test(t); }), "Week pass button");
assert(officeTitles.some(function (t) { return /^Four-year pass/.test(t); }), "Four-year pass button");
assert(officeTitles.indexOf("About") >= 0 && officeTitles.indexOf("Classes") >= 0 && officeTitles.indexOf("Tutoring") >= 0, "About / Classes / Tutoring present");
assert(!officeBtns.filter(function (r) { return r && r.title === "About"; })[0].disabled, "About enabled");
assert(!officeBtns.filter(function (r) { return r && r.title === "Classes"; })[0].disabled, "Classes enabled");
assert(officeBtns.filter(function (r) { return r && r.title === "Tutoring"; })[0].disabled, "Tutoring needs a pass");
assert(officeTitles.indexOf("Leave") >= 0, "Leave present");
assert(!officeTitles.some(function (t) { return /^Focus:/.test(t); }), "no Focus buttons");

var aboutWords = 0;
var ai;
for (ai = 1; ai <= 4; ai++) {
  assert(LT.hasNode("kitty.uni.about." + ai), "about." + ai);
  aboutWords += LT.getNode("kitty.uni.about." + ai).getContent().replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}
assert(aboutWords >= 500, "About is 500+ words (" + aboutWords + ")");
assert(LT.getNode("kitty.uni.about.1").getResponses()[0].title === "Continue", "About continue");
assert(LT.getNode("kitty.uni.about.1").getResponses()[0]._index === 1, "About Continue is first main button, not extra-row 0");
assert(LT.getNode("kitty.uni.about.4").getResponses()[0].title === "Back", "About back on last page");
assert(LT.getNode("kitty.uni.about.4").getResponses()[0]._index === 0, "About Back stays extra-row slot 0");

var ci;
for (ci = 1; ci <= 5; ci++) {
  assert(LT.hasNode("kitty.uni.classes." + ci), "classes." + ci);
  assert(countP(LT.getNode("kitty.uni.classes." + ci).getContent()) >= 3, "classes." + ci + " is 3+ paragraphs");
}
assert(LT.getNode("kitty.uni.classes.5").getResponses()[0].title === "Back", "Classes back on last page");
assert(/Pyra/.test(LT.getNode("kitty.uni.classes.1").getContent()), "Fire page names Pyra");
assert(/Calder/.test(LT.getNode("kitty.uni.classes.5").getContent()), "Arcane page names Calder");
assert(!/stops the hour|marks anyone who laughs|Soak your notes and you copy them after|That is the whole class, more or less/i.test(
  [1, 2, 3, 4, 5].map(function (n) { return LT.getNode("kitty.uni.classes." + n).getContent(); }).join("\n")
), "Classes pages do not use the old clipped teacher lines");
assert(/Flash|arcane fire|aura/i.test(LT.getNode("kitty.uni.classes.1").getContent()), "Fire classes page teaches Flash and aura");
assert(/moisture|Ice Shard|fluid/i.test(LT.getNode("kitty.uni.classes.2").getContent()), "Water classes page teaches Ice Shard");
assert(/force|Slam|construction/i.test(LT.getNode("kitty.uni.classes.3").getContent()), "Earth classes page teaches force");
assert(/Vacuum|gases|void/i.test(LT.getNode("kitty.uni.classes.4").getContent()), "Air classes page teaches Vacuum");
assert(/cult of Lilith|storm|Arcane Arousal/i.test(LT.getNode("kitty.uni.classes.5").getContent()), "Arcane classes page teaches cult and storms");

var weekNode = LT.getNode("kitty.uni.office.week");
var yearNode = LT.getNode("kitty.uni.office.year");
assert(weekNode && yearNode, "pass scene nodes");
assert(countP(weekNode.getContent()) === 3, "week scene 3 paragraphs");
assert(countSentences(weekNode.getContent()) === 9, "week scene 9 sentences (" + countSentences(weekNode.getContent()) + ")");
assert(countP(yearNode.getContent()) === 4, "year scene 4 paragraphs");
assert(countSentences(yearNode.getContent()) === 12, "year scene 12 sentences (" + countSentences(yearNode.getContent()) + ")");
assert(yearNode.getResponses()[0] && yearNode.getResponses()[0].title === "Back", "year Back is first");

var weekBtn = officeBtns.filter(function (r) { return r && /^Week pass/.test(r.title); })[0];
var before = LT.getMoney();
weekBtn.effects();
assert(LT.getMoney() === before - 150, "week price taken");
assert(api.flags().weekPassHeld && api.passValid(), "week pass held");
assert(LT.game._node === "kitty.uni.office.week", "week click opens week scene");

officeBtns = office.getResponses();
weekBtn = officeBtns.filter(function (r) { return r && /^Week pass/.test(r.title); })[0];
var yearBtn = officeBtns.filter(function (r) { return r && /^Four-year pass/.test(r.title); })[0];
assert(weekBtn.disabled, "week disabled after week buy");
assert(!yearBtn.disabled, "four-year still available after week buy");
assert(!office.getResponses().filter(function (r) { return r && r.title === "Tutoring"; })[0].disabled, "Tutoring opens after a pass");

var regBtns = titles(LT.getNode("place.KITTY_ANNEX_REGISTRY").getResponses());
assert(!regBtns.some(function (t) { return /Week pass/i.test(t); }), "registry has no week pass");
assert(regBtns.indexOf("Merrin's office") >= 0, "registry points at Merrin");

var tutorIds = Object.keys(LT._nodes || {}).filter(function (id) { return id.indexOf("kitty.uni.tutor.") === 0; });
if (!tutorIds.length && LT.getNode) {
  tutorIds = [];
}
var tutorCount = 0;
var tid;
var tutorNames = ["pick", "meet", "hub", "talk", "talk2", "drill", "drill2", "correct", "break", "theyFlirt", "theyFlirt2", "flirt", "flirt2", "kiss", "escalateNo", "hands", "sexNo", "afterSex", "see", "gone", "finish", "leave"];
for (tid = 0; tid < tutorNames.length; tid++) {
  if (LT.hasNode("kitty.uni.tutor." + tutorNames[tid])) tutorCount += 1;
}
assert(tutorCount >= 20, "tutoring has 20+ nodes (" + tutorCount + ")");
assert(LT.hasNode("kitty.uni.tutor.pick"), "tutor pick");
assert(LT.hasNode("kitty.uni.tutor.afterSex"), "tutor after-sex");

var classNames = ["arrive", "sit", "hub", "lecture", "lecture2", "theory", "theory2", "notes", "called", "answerGood", "answerBad", "demo", "practice", "partner", "aside", "bell", "result", "learnedWeak", "learnedStrong", "noSpell", "after", "afterTalk"];
var cn = 0;
var cj;
for (cj = 0; cj < classNames.length; cj++) if (LT.hasNode("kitty.uni.class." + classNames[cj])) cn += 1;
assert(cn >= 20, "sit-class has 20+ nodes (" + cn + ")");
var teachNames = ["arrive", "hub", "lecture", "lecture2", "theory", "theory2", "call", "demo", "demo2", "rows", "quiet", "question", "question2", "front", "mistake", "water", "bell", "pack", "late", "endnote", "after", "talk"];
var tn = 0;
var tj;
for (tj = 0; tj < teachNames.length; tj++) if (LT.hasNode("kitty.uni.teach." + teachNames[tj])) tn += 1;
assert(tn >= 20, "teach-class has 20+ nodes (" + tn + ")");
assert(LT.hasNode("kitty.uni.seduce.hub"), "seduce hub");

var weekCont = weekNode.getResponses()[0];
assert(weekCont && weekCont.title === "Continue" && weekCont._index === 1, "week Continue is first main button");
var classCont = LT.getNode("kitty.uni.class.lecture").getResponses()[0];
assert(classCont && classCont.title === "Continue" && classCont._index === 1, "class Continue is first main button");
var teachCont = LT.getNode("kitty.uni.teach.lecture").getResponses()[0];
assert(teachCont && teachCont.title === "Continue" && teachCont._index === 1, "teach Continue is first main button");
var tutorCont = LT.getNode("kitty.uni.tutor.talk").getResponses()[0];
assert(tutorCont && tutorCont.title === "Continue" && tutorCont._index === 1, "tutor Continue is first main button");
var seduceCont = LT.getNode("kitty.uni.seduce.talk").getResponses()[0];
assert(seduceCont && seduceCont.title === "Continue" && seduceCont._index === 1, "seduce Continue is first main button");
var afterTalk = LT.getNode("kitty.uni.class.after").getResponses()[0];
assert(afterTalk && /^Talk to /.test(afterTalk.title) && afterTalk._index === 1, "Talk to ... is first main button");
var seduceTalk = LT.getNode("kitty.uni.seduce.hub").getResponses()[0];
assert(seduceTalk && seduceTalk.title === "Leave" && seduceTalk._index === 1, "seduce empty Leave is first main button");

LT.game.player.location = { world: "KITTY_ARCANE_ANNEX", place: "KITTY_ANNEX_LECTURE_FIRE", x: 1, y: 1 };
var sitBtn = LT.getNode("place.KITTY_ANNEX_LECTURE_FIRE").getResponses().filter(function (r) { return r && r.title === "Sit a class"; })[0];
assert(sitBtn && sitBtn.nextDialogue === "kitty.uni.class.arrive", "Sit opens the class loop");
assert(!sitBtn.disabled, "Sit is open after a pass");
var spellsBeforeSit = (LT.game.player.knownSpells || []).slice();
sitBtn.effects();
assert((LT.game.player.knownSpells || []).join(",") === spellsBeforeSit.join(","), "Sit click does not grant a spell yet");
api.ensureStaff();
api.startSit("FIRE");
var arriveHtml = LT.getNode("kitty.uni.class.arrive").getContent();
assert(countP(arriveHtml) >= 3, "class arrive is 3+ paragraphs");
assert(/Come in and take a seat|gloves stay on the bench/i.test(arriveHtml), "Pyra talks like a normal teacher");
assert(!/speech\(Sit\.\)|"Sit\."/.test(arriveHtml), "no clipped Sit. command");
api.startSit("FIRE");
var fireLecture = LT.getNode("kitty.uni.class.lecture").getContent();
assert(countP(fireLecture) >= 3, "Fire lecture is 3+ paragraphs");
assert(/Flash|fifty|aura|arcane fire/i.test(fireLecture), "Fire lecture teaches Flash and aura");
assert(/essence|Aura Arts|bottled|Vicky/i.test(LT.getNode("kitty.uni.class.theory").getContent()) || /essence|Vicky|aura/i.test(LT.getNode("kitty.uni.class.theory").getContent()), "Fire theory teaches aura and essences");
api.startSit("WATER");
assert(/moisture|Ice Shard|thirty-five/i.test(LT.getNode("kitty.uni.class.lecture").getContent()), "Water lecture teaches Ice Shard from air");
api.startSit("EARTH");
assert(/force|Slam|sixty/i.test(LT.getNode("kitty.uni.class.lecture").getContent()), "Earth lecture teaches Slam as force");
api.startSit("AIR");
assert(/Poison Vapours|gases|Vacuum|void/i.test(LT.getNode("kitty.uni.class.lecture").getContent() + LT.getNode("kitty.uni.class.lecture2").getContent()), "Air lectures teach vapours and Vacuum");
api.startSit("ARCANE");
assert(/Arcane Arousal|cult of Lilith|fifty/i.test(LT.getNode("kitty.uni.class.lecture").getContent()), "Arcane lecture teaches Arousal and the cult");
assert(/storm|current|Telepathic|Cloud/i.test(LT.getNode("kitty.uni.class.lecture2").getContent()), "Arcane lecture2 teaches Cloud and storms");
var afterTalkHtml = LT.getNode("kitty.uni.class.afterTalk").getContent();
assert(countP(afterTalkHtml) >= 3, "afterTalk is 3+ paragraphs");
assert(/Friday is the same glyph|go over the last mark/i.test(afterTalkHtml), "Calder after-talk is normal");
assert(!/That is all I am giving you|speech\(Go\.\)/.test(afterTalkHtml), "no clipped Go. after talk");
api.flags().schoolFocus = "FIRE";
if (typeof api.startTeach === "function") api.startTeach();
var teachLec = LT.getNode("kitty.uni.teach.lecture").getContent();
assert(countP(teachLec) >= 3, "teach lecture is 3+ paragraphs");
assert(/Flash|fifty|arcane fire/i.test(teachLec), "teach Fire lecture names Flash and aura");
assert(LT.hasNode("kitty.uni.teach.theory") && /aura|essence/i.test(LT.getNode("kitty.uni.teach.theory").getContent()), "teach theory covers aura");

before = LT.getMoney();
yearBtn.effects();
assert(LT.getMoney() === before - 15000, "year price taken");
assert(api.flags().yearPassHeld, "year pass held");
assert(LT.game._node === "kitty.uni.office.year", "year click opens year scene");

officeBtns = office.getResponses();
weekBtn = officeBtns.filter(function (r) { return r && /^Week pass/.test(r.title); })[0];
yearBtn = officeBtns.filter(function (r) { return r && /^Four-year pass/.test(r.title); })[0];
assert(weekBtn.disabled && yearBtn.disabled, "both pass buttons disabled after four-year");

var fresh = { enrolled: true, tuitionPaidUntil: 99, weekPassHeld: true, yearPassHeld: false, classesTaken: 0, students: [], staff: [], present: [], lastClassDay: -1, classDay: -1, classesToday: 0 };
LT.game.flags.kittyArcaneUniversity = fresh;
api.flags().schoolFocus = "FIRE";
api.ensureStaff();
var line = api.sitClass({ force: true, school: "FIRE" });
assert(/Fireball/i.test(line), "v1.2 Sit still teaches first unknown spell");
assert(LT.game.player.knownSpells.indexOf("FIREBALL") >= 0, "learnSpell FIREBALL");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittyDominionArcaneUniversity"; }), "mod menu");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL ARCANE ANNEX SMOKES PASSED");
