(function () {
  var STORAGE_KEY = "lt-properties";

  /* Official PropertyValue defaults from 0.4.10. */
  var DEFAULTS = {
    artwork: true,
    thumbnail: true,
    hudCharacterImages: false,
    sexMainStatusBars: false,
    weatherInterruptions: true,
    automaticDialogueCopy: false,
    sillyMode: false,
    sharedEncyclopedia: false,
    enchantmentLimits: true,
    badEndContent: true,
    levelDrain: true,
    opportunisticAttackers: true,
    offspringEncounters: true,
    spittingEnabled: true,
    companionContent: false,
    nonConContent: true,
    sadisticSexContent: true,
    lipstickMarkingContent: true,
    voluntaryNTR: true,
    involuntaryNTR: false,
    incestContent: true,
    lactationContent: true,
    udderContent: true,
    urethralContent: false,
    nipplePenContent: true,
    analContent: true,
    gapeContent: true,
    penetrationLimitations: true,
    elasticityAffectDepth: true,
    footContent: true,
    armpitContent: true,
    muskContent: true,
    furryTailPenetrationContent: false,
    inflationContent: true,
    autoSexClothingManagement: true,
    autoSexStrip: false,
    rapePlayAtSexStart: false,
    ageContent: true,
    feralContent: true,
    cumRegenerationContent: true,
    futanariTesticles: true,
    bipedalCloaca: true,
    vestigialMultiBreasts: true,
    facialHairContent: true,
    pubicHairContent: true,
    bodyHairContent: true,
    assHairContent: false,
    feminineBeardsContent: false,
    furryHairContent: true,
    scalyHairContent: false,
    lipLispContent: false,
  };

  var EXTRA_DEFAULTS = {
    pregnancyDuration: 1,
    humanSpawnRate: 5,
    taurSpawnRate: 5,
    halfDemonSpawnRate: 5,
    taurFurryLevel: 2,
    multiBreasts: 1,
    udders: 1,
    pregnancyBreastGrowthVariance: 2,
    pregnancyBreastGrowth: 1,
    pregnancyUdderGrowth: 1,
    pregnancyBreastGrowthLimit: 10,
    pregnancyUdderGrowthLimit: 10,
    pregnancyLactationIncreaseVariance: 100,
    pregnancyLactationIncrease: 250,
    pregnancyUdderLactationIncrease: 250,
    pregnancyLactationLimit: 1000,
    pregnancyUdderLactationLimit: 1000,
    breastSizePreference: 0,
    udderSizePreference: 0,
    penisSizePreference: 0,
    trapPenisSizePreference: -70,
    cumMultiplierPreference: 100,
    milkMultiplierPreference: 100,
    forcedFetishPercentage: 40,
    forcedTFPercentage: 40,
  };

  var NUMBER_KEYS = {
    pregnancyDuration: { min: 1, max: 40 },
    humanSpawnRate: { min: 0, max: 100 },
    taurSpawnRate: { min: 0, max: 100 },
    halfDemonSpawnRate: { min: 0, max: 100 },
    taurFurryLevel: { min: 0, max: 5 },
    multiBreasts: { min: 0, max: 3 },
    udders: { min: 0, max: 2 },
    pregnancyBreastGrowthVariance: { min: 0, max: 10 },
    pregnancyBreastGrowth: { min: 0, max: 10 },
    pregnancyUdderGrowth: { min: 0, max: 10 },
    pregnancyBreastGrowthLimit: { min: 0, max: 100 },
    pregnancyUdderGrowthLimit: { min: 0, max: 100 },
    pregnancyLactationIncreaseVariance: { min: 0, max: 1000 },
    pregnancyLactationIncrease: { min: 0, max: 1000 },
    pregnancyUdderLactationIncrease: { min: 0, max: 1000 },
    pregnancyLactationLimit: { min: 0, max: 100000 },
    pregnancyUdderLactationLimit: { min: 0, max: 100000 },
    breastSizePreference: { min: -20, max: 20 },
    udderSizePreference: { min: -20, max: 20 },
    penisSizePreference: { min: -20, max: 20 },
    trapPenisSizePreference: { min: -90, max: 100 },
    cumMultiplierPreference: { min: 0, max: 1000 },
    milkMultiplierPreference: { min: 0, max: 1000 },
    forcedFetishPercentage: { min: 0, max: 100 },
    forcedTFPercentage: { min: 0, max: 100 },
  };

  var MAP_KEYS = {
    genderPreferences: true,
    orientationPreferences: true,
    agePreferences: true,
    fetishPreferences: true,
    furryFeminine: true,
    furryMasculine: true,
    spawnFeminine: true,
    spawnMasculine: true,
    skinColourPreferences: true,
  };

  var PREF_SNAPSHOT_KEYS = [
    "genderPreferences",
    "orientationPreferences",
    "agePreferences",
    "fetishPreferences",
    "furryFeminine",
    "furryMasculine",
    "spawnFeminine",
    "spawnMasculine",
    "humanSpawnRate",
    "taurSpawnRate",
    "halfDemonSpawnRate",
    "taurFurryLevel",
  ];

  function blank() {
    var out = {};
    var key;
    for (key in DEFAULTS) {
      if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) out[key] = DEFAULTS[key];
    }
    for (key in EXTRA_DEFAULTS) {
      if (Object.prototype.hasOwnProperty.call(EXTRA_DEFAULTS, key)) out[key] = EXTRA_DEFAULTS[key];
    }
    return out;
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function snapshotPrefs(src) {
    var out = {};
    var i;
    for (i = 0; i < PREF_SNAPSHOT_KEYS.length; i++) {
      var key = PREF_SNAPSHOT_KEYS[i];
      if (src && src[key] != null) out[key] = cloneJson(src[key]);
    }
    return out;
  }

  function restorePrefs(target, snap) {
    var key;
    for (key in snap) {
      if (Object.prototype.hasOwnProperty.call(snap, key)) target[key] = snap[key];
    }
    return target;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return blank();
      var data = JSON.parse(raw);
      var out = blank();
      var key;
      for (key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        if (Object.prototype.hasOwnProperty.call(out, key) || MAP_KEYS[key]) out[key] = data[key];
      }
      return out;
    } catch (e) {
      return blank();
    }
  }

  LT.PROPERTY_DEFAULTS = DEFAULTS;

  LT.ensureProperties = function () {
    if (!LT.properties) LT.properties = load();
    fillSkinColourPreferences(LT.properties);
    return LT.properties;
  };

  LT.saveProperties = function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(LT.ensureProperties()));
    } catch (e) {}
  };

  LT.hasProperty = function (key) {
    var p = LT.ensureProperties();
    if (p[key] == null) return !!DEFAULTS[key];
    return !!p[key];
  };

  LT.setProperty = function (key, value) {
    var p = LT.ensureProperties();
    if (NUMBER_KEYS[key]) {
      var n = Number(value);
      if (isNaN(n)) n = EXTRA_DEFAULTS[key];
      p[key] = Math.max(NUMBER_KEYS[key].min, Math.min(NUMBER_KEYS[key].max, Math.floor(n)));
    } else {
      p[key] = !!value;
    }
    LT.saveProperties();
    return p[key];
  };

  LT.getNumericProperty = function (key, fallback) {
    var p = LT.ensureProperties();
    var n = Number(p[key]);
    if (isNaN(n)) return fallback != null ? fallback : EXTRA_DEFAULTS[key];
    if (NUMBER_KEYS[key]) {
      if (n < NUMBER_KEYS[key].min) return NUMBER_KEYS[key].min;
      if (n > NUMBER_KEYS[key].max) return NUMBER_KEYS[key].max;
    }
    return n;
  };

  LT.resetContentOptions = function () {
    var keep = snapshotPrefs(LT.ensureProperties());
    LT.properties = restorePrefs(blank(), keep);
    if (typeof LT.ensurePreferenceMaps === "function") LT.ensurePreferenceMaps();
    LT.saveProperties();
    return LT.properties;
  };

  LT.isNonConEnabled = function () {
    return LT.hasProperty("nonConContent");
  };
  LT.isIncestEnabled = function () {
    return LT.hasProperty("incestContent");
  };
  LT.isAnalContentEnabled = function () {
    return LT.hasProperty("analContent");
  };
  LT.isFootContentEnabled = function () {
    return LT.hasProperty("footContent");
  };
  LT.isArmpitContentEnabled = function () {
    return LT.hasProperty("armpitContent");
  };
  LT.isLactationContentEnabled = function () {
    return LT.hasProperty("lactationContent");
  };
  LT.isNipplePenContentEnabled = function () {
    return LT.hasProperty("nipplePenContent");
  };
  LT.isUrethralContentEnabled = function () {
    return LT.hasProperty("urethralContent");
  };
  LT.isGapeContentEnabled = function () {
    return LT.hasProperty("gapeContent");
  };
  LT.isUdderContentEnabled = function () {
    return LT.hasProperty("udderContent");
  };
  LT.isFeralContentEnabled = function () {
    return LT.hasProperty("feralContent");
  };
  LT.isFurryTailPenetrationEnabled = function () {
    return LT.hasProperty("furryTailPenetrationContent");
  };
  LT.isOpportunisticAttackersEnabled = function () {
    return LT.hasProperty("opportunisticAttackers");
  };
  LT.isOffspringEncountersEnabled = function () {
    return LT.hasProperty("offspringEncounters");
  };
  LT.isSillyMode = function () {
    return LT.hasProperty("sillyMode");
  };
  LT.isBadEndsEnabled = function () {
    return LT.hasProperty("badEndContent");
  };
  LT.isSpittingDisabled = function () {
    return !LT.hasProperty("spittingEnabled");
  };
  LT.pregnancyDurationWeeks = function () {
    var n = LT.ensureProperties().pregnancyDuration;
    n = Number(n);
    if (!n || n < 1) return 1;
    if (n > 40) return 40;
    return n;
  };

  function fillSkinColourPreferences(p) {
    if (!p.skinColourPreferences || typeof p.skinColourPreferences !== "object") p.skinColourPreferences = {};
    var i;
    for (i = 0; i < LT.HUMAN_SKIN_COLOURS.length; i++) {
      var id = LT.HUMAN_SKIN_COLOURS[i].id;
      var n = Number(p.skinColourPreferences[id]);
      if (isNaN(n)) n = 5;
      if (n < 0) n = 0;
      if (n > 10) n = 10;
      p.skinColourPreferences[id] = n;
    }
    return p.skinColourPreferences;
  }

  LT.HUMAN_SKIN_COLOURS = [
    { id: "PALE", name: "pale", hex: "#f3d7c4" },
    { id: "LIGHT", name: "light", hex: "#e8c4a8" },
    { id: "PORCELAIN", name: "porcelain", hex: "#f7e6d8" },
    { id: "ROSY", name: "rosy", hex: "#e8b39a" },
    { id: "OLIVE", name: "olive", hex: "#c49262" },
    { id: "TANNED", name: "tanned", hex: "#c68642" },
    { id: "DARK", name: "dark", hex: "#8d5524" },
    { id: "CHOCOLATE", name: "chocolate", hex: "#6b3a1f" },
    { id: "EBONY", name: "ebony", hex: "#3b2213" },
  ];

  LT.ensureSkinColourPreferences = function () {
    return fillSkinColourPreferences(LT.ensureProperties());
  };

  LT.adjustSkinColourPreference = function (id, delta) {
    var map = LT.ensureSkinColourPreferences();
    var n = Number(map[id]);
    if (isNaN(n)) n = 5;
    n = Math.max(0, Math.min(10, n + Number(delta || 0)));
    map[id] = n;
    LT.saveProperties();
    return n;
  };

  LT.cumMultiplierPercent = function () {
    return LT.getNumericProperty("cumMultiplierPreference", 100);
  };

  LT.milkMultiplierPercent = function () {
    return LT.getNumericProperty("milkMultiplierPreference", 100);
  };

  if (typeof document !== "undefined") LT.ensureProperties();
})();
