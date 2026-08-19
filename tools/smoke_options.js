/* node "Liliths Throne HTML/tools/smoke_options.js" */
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
  "js/engine/colours.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/engine/game.js",
  "js/engine/properties.js",
  "js/character/enums.js",
  "js/engine/preferences.js",
  "js/engine/utilText.js",
  "js/content/bootFlow.js",
  "js/content/options.js",
].forEach(load);

var LT = context.LT;

assert(LT.isNonConEnabled() === true, "Non-con defaults ON");
assert(LT.isAnalContentEnabled() === true, "Anal defaults ON");
assert(LT.isIncestEnabled() === true, "Incest defaults ON");
assert(LT.isUrethralContentEnabled() === false, "Urethral defaults OFF");
assert(LT.hasProperty("assHairContent") === false, "Ass hair defaults OFF");
assert(LT.hasProperty("companionContent") === false, "Companions default OFF");
assert(LT.hasProperty("enchantmentLimits") === true, "Enchantment capacity defaults ON");
assert(LT.pregnancyDurationWeeks() === 1, "Pregnancy duration defaults to 1 week");

LT.setProperty("nonConContent", false);
assert(LT.isNonConEnabled() === false, "Non-con can be turned off");
assert(store["lt-properties"].indexOf("nonConContent") >= 0, "Toggle is written to localStorage");

LT.setProperty("pregnancyDuration", 4);
assert(LT.pregnancyDurationWeeks() === 4, "Pregnancy duration can be set to 4 weeks");
LT.setProperty("pregnancyDuration", 99);
assert(LT.pregnancyDurationWeeks() === 40, "Pregnancy duration caps at official 40");
LT.setProperty("pregnancyDuration", 0);
assert(LT.pregnancyDurationWeeks() === 1, "Pregnancy duration floors at official 1");

var parsedOff = LT.parse("#IF(game.isNonConEnabled())YES#ELSE NO#ENDIF");
assert(parsedOff.indexOf("NO") >= 0 && parsedOff.indexOf("YES") < 0, "Parse sees non-con off");
LT.setProperty("analContent", false);
var parsedAnal = LT.parse("#IF(game.isAnalContentEnabled())ANAL#ELSE NOANAL#ENDIF");
assert(parsedAnal.indexOf("NOANAL") >= 0, "Parse sees anal off");

LT.resetContentOptions();
assert(LT.isNonConEnabled() === true, "Reset restores official non-con default");
assert(LT.pregnancyDurationWeeks() === 1, "Reset restores 1-week pregnancy");

var misc = LT.getNode("boot.options");
var html = misc.getContent();
assert(html.indexOf("Artwork") >= 0 && html.indexOf("Silly mode") >= 0, "Misc page lists official toggles");
var miscR = misc.getResponses(LT.game, 0);
assert(miscR[0] && miscR[0].title === "Back", "Back is slot 0");
assert(miscR[1] && miscR[1].disabled, "Misc is already open");
assert(miscR[2] && miscR[2].nextDialogue === "options.gameplay", "Gameplay is slot 2");
assert(miscR[3] && miscR[3].nextDialogue === "options.sex", "Sex & Fetishes is slot 3");
assert(miscR[4] && miscR[4].nextDialogue === "options.bodies", "Bodies is slot 4");
assert(miscR[5] && miscR[5].title === "Reset", "Reset is slot 5");
assert(miscR[6] && miscR[6].nextDialogue === "options.gender", "Gender preferences is slot 6");
assert(miscR[7] && miscR[7].nextDialogue === "options.orientation", "Orientation preferences is slot 7");
assert(miscR[8] && miscR[8].nextDialogue === "options.age", "Age preferences is slot 8");
assert(miscR[9] && miscR[9].nextDialogue === "options.furry", "Furry preferences is slot 9");
assert(miscR[10] && miscR[10].nextDialogue === "options.fetish", "Fetish preferences is slot 10");

var sexHtml = LT.getNode("options.sex").getContent();
assert(sexHtml.indexOf("Non-consent") >= 0 && sexHtml.indexOf("Incest") >= 0, "Sex page has official non-con and incest");
assert(sexHtml.indexOf("Anal content") >= 0 && sexHtml.indexOf("Foot content") >= 0, "Sex page has anal and foot");
assert(sexHtml.indexOf("Lactation") >= 0 && sexHtml.indexOf("Nipple penetrations") >= 0, "Sex page has lactation and nipple pen");

var playHtml = LT.getNode("options.gameplay").getContent();
assert(playHtml.indexOf("Bad Ends") >= 0 && playHtml.indexOf("Opportunistic attackers") >= 0, "Gameplay page has official combat flags");
assert(playHtml.indexOf("Pregnancy duration") >= 0, "Gameplay page has pregnancy duration");
assert(playHtml.indexOf("Forced fetish") >= 0, "Gameplay page has forced fetish chance");
assert(playHtml.indexOf("Forced transformation") >= 0, "Gameplay page has forced TF chance");
assert(LT.getNumericProperty("forcedFetishPercentage", 0) === 40, "Forced fetish defaults to official 40%");
assert(LT.getNumericProperty("forcedTFPercentage", 0) === 40, "Forced TF defaults to official 40%");

var bodyHtml = LT.getNode("options.bodies").getContent();
assert(bodyHtml.indexOf("Feral") >= 0 && bodyHtml.indexOf("Facial hair") >= 0, "Bodies page has official body flags");
assert(bodyHtml.indexOf("Lip lisps") >= 0, "Bodies page has lip lisps");
assert(bodyHtml.indexOf("Average Pregnancy Breast Growth") >= 0, "Bodies page has pregnancy breast growth");
assert(bodyHtml.indexOf("Pregnancy Breast Growth Limit") >= 0, "Bodies page has pregnancy breast growth limit");
assert(bodyHtml.indexOf("Average Pregnancy Lactation") >= 0, "Bodies page has pregnancy lactation");
assert(bodyHtml.indexOf("Pregnancy Lactation Limit") >= 0, "Bodies page has pregnancy lactation limit");
assert(bodyHtml.indexOf("Cup Size Preference") >= 0, "Bodies page has cup size preference");
assert(bodyHtml.indexOf("Penis Size Preference") >= 0, "Bodies page has penis size preference");
assert(bodyHtml.indexOf("Trap penis size") >= 0, "Bodies page has trap penis size");
assert(bodyHtml.indexOf("Skin Colour Preference") >= 0, "Bodies page has skin colour preference");
assert(bodyHtml.indexOf("Multi-breasts") >= 0 && bodyHtml.indexOf("Crotch-boobs") >= 0, "Bodies page has multi-breast and udder spawn options");
assert(bodyHtml.indexOf("Cum multiplier preference") >= 0 && bodyHtml.indexOf("Milk multiplier preference") >= 0, "Bodies page has cum and milk multipliers");
assert(LT.getNumericProperty("pregnancyBreastGrowth") === 1, "Average pregnancy breast growth defaults to 1 cup");
assert(LT.getNumericProperty("pregnancyBreastGrowthLimit") === 10, "Pregnancy breast growth limit defaults to E-cup");
assert(LT.getNumericProperty("pregnancyLactationIncrease") === 250, "Average pregnancy lactation defaults to 250mL");
assert(LT.getNumericProperty("pregnancyLactationLimit") === 1000, "Pregnancy lactation limit defaults to 1000mL");
assert(LT.getNumericProperty("trapPenisSizePreference") === -70, "Trap penis size defaults to official -70 (30%)");
assert(LT.cumMultiplierPercent() === 100, "Cum multiplier defaults to 100%");
assert(LT.milkMultiplierPercent() === 100, "Milk multiplier defaults to 100%");
assert(LT.ensureSkinColourPreferences().PALE === 5, "Skin colour weights default to 5");
LT.setProperty("pregnancyBreastGrowth", 4);
LT.setProperty("cumMultiplierPreference", 250);
LT.setProperty("milkMultiplierPreference", 50);
assert(LT.getNumericProperty("pregnancyBreastGrowth") === 4, "Pregnancy breast growth can be changed");
assert(LT.cumMultiplierPercent() === 250, "Cum multiplier can be raised");
assert(LT.milkMultiplierPercent() === 50, "Milk multiplier can be lowered");
LT.resetContentOptions();
assert(LT.getNumericProperty("pregnancyBreastGrowth") === 1, "Reset restores pregnancy breast growth");
assert(LT.cumMultiplierPercent() === 100, "Reset restores cum multiplier");
assert(LT.milkMultiplierPercent() === 100, "Reset restores milk multiplier");

LT.setGenderPreference("M_P_MALE", 40);
LT.setOrientationPreference("GYNEPHILIC", 40);
miscR[5].effects();
assert(LT.isUrethralContentEnabled() === false, "Reset keeps urethral off");
assert(LT.ensureProperties().genderPreferences.M_P_MALE === 40, "Reset does not wipe gender preferences");
assert(LT.ensureProperties().orientationPreferences.GYNEPHILIC === 40, "Reset does not wipe orientation preferences");

var genderHtml = LT.getNode("options.gender").getContent();
assert(genderHtml.indexOf("Gender encounter rates") < 0 || genderHtml.indexOf("vagina") >= 0, "Gender page describes genitals");
assert(genderHtml.indexOf("Male") >= 0 && genderHtml.indexOf("Female") >= 0, "Gender page lists male and female");
assert(genderHtml.indexOf("Futanari") >= 0 && genderHtml.indexOf("Trap") >= 0, "Gender page lists futa and trap");
var genderR = LT.getNode("options.gender").getResponses(LT.game, 0);
assert(genderR[11] && genderR[11].title === "Defaults", "Gender Defaults is slot 11");
genderR[11].effects();
assert(LT.ensureProperties().genderPreferences.M_P_MALE === 10, "Gender Defaults restores official male average");
assert(LT.ensureProperties().genderPreferences.F_V_B_FEMALE === 10, "Gender Defaults restores official female average");
assert(LT.ensureProperties().genderPreferences.F_P_V_B_FUTANARI === 1, "Gender Defaults restores official futa minimal");
assert(LT.ensureProperties().genderPreferences.F_P_TRAP === 1, "Gender Defaults restores official trap minimal");
assert(LT.ensureProperties().genderPreferences.M_P_V_B_HERMAPHRODITE === 0, "Other genders default to off");

assert(LT.ensureProperties().orientationPreferences.ANDROPHILIC === 10, "Orientation defaults to average");
assert(LT.ensureProperties().agePreferences.FEMININE.TWENTIES_EARLY === 40, "Early twenties defaults to abundant");
assert(LT.ensureProperties().agePreferences.MASCULINE.SIXTIES_PLUS === 0, "Past seventy defaults to off");
assert(LT.ensureProperties().fetishPreferences.FETISH_BIMBO === 2, "Bimbo fetish defaults to dislike");
assert(LT.ensureProperties().fetishPreferences.FETISH_DOMINANT === 3, "Dominant fetish defaults to neutral");
assert(LT.ensureProperties().humanSpawnRate === 5, "Human spawn rate defaults to 5%");

LT.setGenderPreference("M_P_MALE", 0);
LT.setGenderPreference("F_V_B_FEMALE", 0);
LT.setGenderPreference("F_P_V_B_FUTANARI", 0);
LT.setGenderPreference("F_P_TRAP", 0);
var onlyMale = LT.getGenderFromUserPreferences(false, false);
assert(onlyMale.id === "F_V_B_FEMALE" || onlyMale.id === "M_P_MALE" || onlyMale.id === "F_P_B_SHEMALE" || onlyMale.id === "F_P_V_B_FUTANARI", "Empty gender map uses official fallbacks");
LT.resetGenderPreferences();
LT.setGenderPreference("M_P_MALE", 0);
LT.setGenderPreference("F_V_B_FEMALE", 10);
LT.setGenderPreference("F_P_V_B_FUTANARI", 0);
LT.setGenderPreference("F_P_TRAP", 0);
var forced = LT.getGenderFromUserPreferences(false, false);
assert(forced.id === "F_V_B_FEMALE", "Weighted gender pick uses the only enabled gender");
var needsBoth = LT.getGenderFromUserPreferences(true, true);
assert(needsBoth.hasVagina && needsBoth.hasPenis, "requiresVagina+requiresPenis returns a dual-sex gender");

var furryHtml = LT.getNode("options.furry").getContent();
assert(furryHtml.indexOf("Human Spawn Rate") >= 0 && furryHtml.indexOf("Taur Spawn Rate") >= 0, "Furry page has official spawn rates");
assert(furryHtml.indexOf("Cat-girl") >= 0 && furryHtml.indexOf("Harpy") >= 0, "Furry page lists official spawnable races");
assert(furryHtml.indexOf("preference-button disabled") >= 0, "Harpy furry sliders are disabled");

var fetishHtml = LT.getNode("options.fetish").getContent();
assert(fetishHtml.indexOf("Anal") >= 0 && fetishHtml.indexOf("Non-consent") >= 0, "Fetish page lists official fetishes");
LT.setProperty("analContent", false);
fetishHtml = LT.getNode("options.fetish").getContent();
assert(fetishHtml.indexOf("Anal Content") >= 0, "Anal fetishes disable when anal content is off");

var orient = LT.getSexualOrientationFromUserPreferences(0, 1, 0);
assert(orient.id === "AMBIPHILIC", "Demon/angel weights 0,1,0 pick ambiphilic");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll content-options smoke checks passed.");
