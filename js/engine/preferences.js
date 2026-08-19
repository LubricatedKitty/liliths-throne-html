(function () {
  var Colour = LT.Colour;

  function capitalise(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  LT.capitaliseSentence = capitalise;

  function pickWeighted(map) {
    var total = 0;
    var key;
    for (key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key) && map[key] > 0) total += map[key];
    }
    if (total <= 0) return null;
    var roll = Math.random() * total;
    var acc = 0;
    for (key in map) {
      if (!Object.prototype.hasOwnProperty.call(map, key) || map[key] <= 0) continue;
      acc += map[key];
      if (roll < acc) return key;
    }
    return key;
  }

  function copyMap(src) {
    var out = {};
    var key;
    for (key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) out[key] = src[key];
    }
    return out;
  }

  LT.ContentPreferenceValue = [
    { id: "ZERO_NONE", name: "off", value: 0 },
    { id: "ONE_MINIMAL", name: "minimal", value: 1 },
    { id: "TWO_LOW", name: "low", value: 5 },
    { id: "THREE_AVERAGE", name: "average", value: 10 },
    { id: "FOUR_HIGH", name: "high", value: 20 },
    { id: "FIVE_ABUNDANT", name: "abundant", value: 40 },
  ];

  LT.SexualOrientationPreference = LT.ContentPreferenceValue;

  LT.FurryPreference = [
    { id: "HUMAN", name: "Disabled", colour: Colour.TRANSFORMATION_HUMAN, button: "X" },
    { id: "MINIMUM", name: "Minimum", colour: Colour.TRANSFORMATION_PARTIAL, button: "--" },
    { id: "REDUCED", name: "Lesser", colour: Colour.TRANSFORMATION_PARTIAL_FULL, button: "-" },
    { id: "NORMAL", name: "Greater", colour: Colour.TRANSFORMATION_LESSER, button: "+" },
    { id: "MAXIMUM", name: "Maximum", colour: Colour.TRANSFORMATION_GREATER, button: "++" },
  ];

  LT.SubspeciesPreference = [
    { id: "ZERO_NONE", name: "off", value: 0 },
    { id: "ONE_LOW", name: "low", value: 25 },
    { id: "TWO_AVERAGE", name: "average", value: 50 },
    { id: "THREE_HIGH", name: "high", value: 75 },
    { id: "FOUR_ABUNDANT", name: "abundant", value: 100 },
  ];

  LT.FetishPreference = [
    { id: "ZERO_DISABLED", name: "disabled", value: 0, hate: 0, dislike: 0, like: 0, love: 0, colour: Colour.TEXT_GREY, tip: "This fetish will not be given to any NPC unless special conditions are met." },
    { id: "ONE_HATE", name: "hate", value: 1, hate: 10, dislike: 5, like: 0, love: 0, colour: Colour.GENERIC_BAD, tip: "NPCs will only dislike or hate this fetish unless special conditions are met." },
    { id: "TWO_DISLIKE", name: "dislike", value: 2, hate: 5, dislike: 10, like: 3, love: 1, colour: Colour.GENERIC_MINOR_BAD, tip: "NPCs will more likely dislike/hate this fetish but can still like/love it." },
    { id: "THREE_NEUTRAL", name: "neutral", value: 3, hate: 3, dislike: 3, like: 3, love: 3, colour: Colour.TEXT, tip: "No preference either way." },
    { id: "FOUR_LIKE", name: "like", value: 4, hate: 1, dislike: 3, like: 10, love: 5, colour: Colour.GENERIC_MINOR_GOOD, tip: "NPCs will more likely like/love this fetish but can still dislike/hate it." },
    { id: "FIVE_LOVE", name: "love", value: 5, hate: 0, dislike: 0, like: 3, love: 5, colour: Colour.GENERIC_GOOD, tip: "NPCs will only like or love this fetish." },
    { id: "SIX_ALWAYS", name: "always", value: 6, hate: 0, dislike: 0, like: 0, love: 1, colour: Colour.GENERIC_EXCELLENT, tip: "NPCs will always have this fetish." },
  ];

  LT.AgeCategory = [
    { id: "TEENS_LATE", name: "late teens", min: 14, max: 20, colour: Colour.AGE_TEENS, def: 20 },
    { id: "TWENTIES_EARLY", name: "early twenties", min: 20, max: 23, colour: Colour.AGE_TWENTIES, def: 40 },
    { id: "TWENTIES_MIDDLE", name: "mid-twenties", min: 23, max: 27, colour: Colour.AGE_TWENTIES, def: 40 },
    { id: "TWENTIES_LATE", name: "late twenties", min: 27, max: 30, colour: Colour.AGE_TWENTIES, def: 20 },
    { id: "THIRTIES_EARLY", name: "early thirties", min: 30, max: 33, colour: Colour.AGE_THIRTIES, def: 10 },
    { id: "THIRTIES_MIDDLE", name: "mid-thirties", min: 33, max: 37, colour: Colour.AGE_THIRTIES, def: 10 },
    { id: "THIRTIES_LATE", name: "late thirties", min: 37, max: 40, colour: Colour.AGE_THIRTIES, def: 5 },
    { id: "FORTIES_EARLY", name: "early forties", min: 40, max: 43, colour: Colour.AGE_FORTIES, def: 5 },
    { id: "FORTIES_MIDDLE", name: "mid-forties", min: 43, max: 47, colour: Colour.AGE_FORTIES, def: 1 },
    { id: "FORTIES_LATE", name: "late forties", min: 47, max: 50, colour: Colour.AGE_FORTIES, def: 1 },
    { id: "FIFTIES_EARLY", name: "early fifties", min: 50, max: 53, colour: Colour.AGE_FIFTIES, def: 1 },
    { id: "FIFTIES_MIDDLE", name: "mid-fifties", min: 53, max: 57, colour: Colour.AGE_FIFTIES, def: 0 },
    { id: "FIFTIES_LATE", name: "late fifties", min: 57, max: 60, colour: Colour.AGE_FIFTIES, def: 0 },
    { id: "SIXTIES_EARLY", name: "early sixties", min: 60, max: 63, colour: Colour.AGE_SIXTIES, def: 0 },
    { id: "SIXTIES_MIDDLE", name: "mid-sixties", min: 63, max: 67, colour: Colour.AGE_SIXTIES, def: 0 },
    { id: "SIXTIES_LATE", name: "late sixties", min: 67, max: 70, colour: Colour.AGE_SIXTIES, def: 0 },
    { id: "SIXTIES_PLUS", name: "past seventy", min: 70, max: 100, colour: Colour.AGE_SIXTIES, def: 0 },
  ];

  var GENDER_DEFAULTS = {
    M_P_MALE: 10,
    F_V_B_FEMALE: 10,
    F_P_V_B_FUTANARI: 1,
    F_P_TRAP: 1,
  };

  LT.GENDER_LIST = [
    LT.Gender.M_P_V_B_HERMAPHRODITE,
    LT.Gender.M_P_V_HERMAPHRODITE,
    LT.Gender.M_P_B_BUSTYBOY,
    LT.Gender.M_P_MALE,
    LT.Gender.M_V_B_BUTCH,
    LT.Gender.M_V_CUNTBOY,
    LT.Gender.M_B_MANNEQUIN,
    LT.Gender.M_MANNEQUIN,
    LT.Gender.N_P_V_B_HERMAPHRODITE,
    LT.Gender.N_P_V_HERMAPHRODITE,
    LT.Gender.N_P_B_SHEMALE,
    LT.Gender.N_P_TRAP,
    LT.Gender.N_V_B_TOMBOY,
    LT.Gender.N_V_TOMBOY,
    LT.Gender.N_B_DOLL,
    LT.Gender.N_NEUTER,
    LT.Gender.F_P_V_B_FUTANARI,
    LT.Gender.F_P_V_FUTANARI,
    LT.Gender.F_P_B_SHEMALE,
    LT.Gender.F_P_TRAP,
    LT.Gender.F_V_B_FEMALE,
    LT.Gender.F_V_FEMALE,
    LT.Gender.F_B_DOLL,
    LT.Gender.F_DOLL,
  ];

  LT.ORIENTATION_LIST = [LT.Orientation.ANDROPHILIC, LT.Orientation.AMBIPHILIC, LT.Orientation.GYNEPHILIC];

  LT.FETISH_LIST = [
    { id: "FETISH_ANAL_GIVING", name: "anal", content: "analContent" },
    { id: "FETISH_ANAL_RECEIVING", name: "buttslut", content: "analContent" },
    { id: "FETISH_VAGINAL_GIVING", name: "vaginal" },
    { id: "FETISH_VAGINAL_RECEIVING", name: "pussy slut" },
    { id: "FETISH_ORAL_RECEIVING", name: "oral" },
    { id: "FETISH_ORAL_GIVING", name: "oral performer" },
    { id: "FETISH_BREASTS_OTHERS", name: "breasts lover" },
    { id: "FETISH_BREASTS_SELF", name: "breasts" },
    { id: "FETISH_LACTATION_OTHERS", name: "milk lover", content: "lactationContent" },
    { id: "FETISH_LACTATION_SELF", name: "lactation", content: "lactationContent" },
    { id: "FETISH_LEG_LOVER", name: "leg lover" },
    { id: "FETISH_STRUTTER", name: "strutter" },
    { id: "FETISH_FOOT_GIVING", name: "dominant foot", content: "footContent" },
    { id: "FETISH_FOOT_RECEIVING", name: "submissive foot", content: "footContent" },
    { id: "FETISH_ARMPIT_GIVING", name: "armpit lover", content: "armpitContent" },
    { id: "FETISH_ARMPIT_RECEIVING", name: "armpit slut", content: "armpitContent" },
    { id: "FETISH_PENIS_GIVING", name: "cock stud" },
    { id: "FETISH_PENIS_RECEIVING", name: "cock addict" },
    { id: "FETISH_CUM_STUD", name: "cum stud" },
    { id: "FETISH_CUM_ADDICT", name: "cum addict" },
    { id: "FETISH_DEFLOWERING", name: "deflowering" },
    { id: "FETISH_PURE_VIRGIN", name: "vaginal virginity" },
    { id: "FETISH_MASTURBATION", name: "masturbation" },
    { id: "FETISH_IMPREGNATION", name: "impregnation" },
    { id: "FETISH_PREGNANCY", name: "pregnancy" },
    { id: "FETISH_TRANSFORMATION_GIVING", name: "transformer" },
    { id: "FETISH_TRANSFORMATION_RECEIVING", name: "test subject" },
    { id: "FETISH_KINK_GIVING", name: "kink advocate" },
    { id: "FETISH_KINK_RECEIVING", name: "kink curious" },
    { id: "FETISH_DENIAL", name: "orgasm denier" },
    { id: "FETISH_DENIAL_SELF", name: "self-denial" },
    { id: "FETISH_DOMINANT", name: "dominant" },
    { id: "FETISH_SUBMISSIVE", name: "submissive" },
    { id: "FETISH_INCEST", name: "incest", content: "incestContent" },
    { id: "FETISH_SADIST", name: "sadist" },
    { id: "FETISH_MASOCHIST", name: "masochist" },
    { id: "FETISH_NON_CON_DOM", name: "non-consent", content: "nonConContent" },
    { id: "FETISH_NON_CON_SUB", name: "unwilling fuck-toy", content: "nonConContent" },
    { id: "FETISH_BONDAGE_APPLIER", name: "bondage applier" },
    { id: "FETISH_BONDAGE_VICTIM", name: "bondage bitch" },
    { id: "FETISH_EXHIBITIONIST", name: "exhibitionist" },
    { id: "FETISH_VOYEURIST", name: "voyeurist" },
    { id: "FETISH_BIMBO", name: "bimbo", def: 2 },
    { id: "FETISH_CROSS_DRESSER", name: "cross dressing", def: 2 },
    { id: "FETISH_SIZE_QUEEN", name: "size queen", content: "penetrationLimitations" },
  ];

  var FETISH_CONTENT_LABEL = {
    analContent: "Anal Content",
    lactationContent: "Lactation",
    footContent: "Foot Content",
    armpitContent: "Armpit Content",
    incestContent: "Incest",
    nonConContent: "Non-consent",
    penetrationLimitations: "Penetrative size-difference",
  };

  LT.SPAWN_SUBSPECIES = [
    { id: "cat-morph", name: "cat-morph", fem: "cat-girl", masc: "cat-boy", colour: "#e39a6f", rarity: 1.0, furryEnabled: true, spawnEnabled: true, defaultFurry: "NORMAL", defaultSpawn: 100, pools: { dominion: true } },
    { id: "dog-morph", name: "dog-morph", fem: "dog-girl", masc: "dog-boy", colour: "#c4a574", rarity: 1.0, furryEnabled: true, spawnEnabled: true, defaultFurry: "NORMAL", defaultSpawn: 100, pools: { dominion: true } },
    { id: "wolf-morph", name: "wolf-morph", fem: "wolf-girl", masc: "wolf-boy", colour: "#8d8d8d", rarity: 0.5, furryEnabled: true, spawnEnabled: true, defaultFurry: "NORMAL", defaultSpawn: 100, pools: { dominion: true } },
    { id: "fox-morph", name: "fox-morph", fem: "fox-girl", masc: "fox-boy", colour: "#e38d4a", rarity: 1.0, furryEnabled: true, spawnEnabled: true, defaultFurry: "NORMAL", defaultSpawn: 100, pools: { dominion: true } },
    { id: "horse-morph", name: "horse-morph", fem: "horse-girl", masc: "horse-boy", colour: "#8d6e63", rarity: 1.0, furryEnabled: true, spawnEnabled: true, defaultFurry: "NORMAL", defaultSpawn: 100, pools: { dominion: true } },
    { id: "harpy", name: "harpy", fem: "harpy", masc: "harpy", colour: "#e39ab8", rarity: 1.0, furryEnabled: false, spawnEnabled: false, defaultFurry: "NORMAL", defaultSpawn: 100, pools: { harpy: true } },
  ];

  LT.HUMAN_RACE = { id: "human", name: "human", fem: "woman", masc: "man", colour: Colour.RACE_HUMAN };
  LT.DEMON_RACE = { id: "demon", name: "demon", fem: "succubus", masc: "incubus", colour: "#c06fe3" };

  function defaultGenderMap() {
    var out = {};
    var i;
    for (i = 0; i < LT.GENDER_LIST.length; i++) {
      var g = LT.GENDER_LIST[i];
      out[g.id] = GENDER_DEFAULTS[g.id] != null ? GENDER_DEFAULTS[g.id] : 0;
    }
    return out;
  }

  function defaultOrientationMap() {
    return { ANDROPHILIC: 10, AMBIPHILIC: 10, GYNEPHILIC: 10 };
  }

  function defaultAgeMap() {
    var out = { MASCULINE: {}, NEUTRAL: {}, FEMININE: {} };
    var i;
    var type;
    for (i = 0; i < LT.AgeCategory.length; i++) {
      for (type in out) {
        if (Object.prototype.hasOwnProperty.call(out, type)) out[type][LT.AgeCategory[i].id] = LT.AgeCategory[i].def;
      }
    }
    return out;
  }

  function defaultFetishMap() {
    var out = {};
    var i;
    for (i = 0; i < LT.FETISH_LIST.length; i++) {
      var f = LT.FETISH_LIST[i];
      out[f.id] = f.def != null ? f.def : 3;
    }
    return out;
  }

  function defaultFurryMap() {
    var out = {};
    var i;
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) out[LT.SPAWN_SUBSPECIES[i].id] = LT.SPAWN_SUBSPECIES[i].defaultFurry;
    return out;
  }

  function defaultSpawnMap() {
    var out = {};
    var i;
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) out[LT.SPAWN_SUBSPECIES[i].id] = LT.SPAWN_SUBSPECIES[i].defaultSpawn;
    return out;
  }

  function mergeMap(base, saved) {
    var out = copyMap(base);
    var key;
    if (!saved) return out;
    for (key in saved) {
      if (Object.prototype.hasOwnProperty.call(saved, key) && Object.prototype.hasOwnProperty.call(out, key)) out[key] = saved[key];
    }
    return out;
  }

  function mergeNested(base, saved) {
    var out = {};
    var key;
    for (key in base) {
      if (Object.prototype.hasOwnProperty.call(base, key)) out[key] = mergeMap(base[key], saved && saved[key]);
    }
    return out;
  }

  LT.ensurePreferenceMaps = function () {
    var p = LT.ensureProperties();
    p.genderPreferences = mergeMap(defaultGenderMap(), p.genderPreferences);
    p.orientationPreferences = mergeMap(defaultOrientationMap(), p.orientationPreferences);
    p.agePreferences = mergeNested(defaultAgeMap(), p.agePreferences);
    p.fetishPreferences = mergeMap(defaultFetishMap(), p.fetishPreferences);
    p.furryFeminine = mergeMap(defaultFurryMap(), p.furryFeminine);
    p.furryMasculine = mergeMap(defaultFurryMap(), p.furryMasculine);
    p.spawnFeminine = mergeMap(defaultSpawnMap(), p.spawnFeminine);
    p.spawnMasculine = mergeMap(defaultSpawnMap(), p.spawnMasculine);
    if (p.humanSpawnRate == null) p.humanSpawnRate = 5;
    if (p.taurSpawnRate == null) p.taurSpawnRate = 5;
    if (p.halfDemonSpawnRate == null) p.halfDemonSpawnRate = 5;
    if (p.taurFurryLevel == null) p.taurFurryLevel = 2;
    return p;
  };

  LT.resetGenderPreferences = function () {
    LT.ensureProperties().genderPreferences = defaultGenderMap();
    LT.saveProperties();
  };
  LT.resetOrientationPreferences = function () {
    LT.ensureProperties().orientationPreferences = defaultOrientationMap();
    LT.saveProperties();
  };
  LT.resetAgePreferences = function () {
    LT.ensureProperties().agePreferences = defaultAgeMap();
    LT.saveProperties();
  };
  LT.resetFetishPreferences = function () {
    LT.ensureProperties().fetishPreferences = defaultFetishMap();
    LT.saveProperties();
  };
  LT.resetFurryPreferences = function () {
    var p = LT.ensureProperties();
    p.furryFeminine = defaultFurryMap();
    p.furryMasculine = defaultFurryMap();
    p.spawnFeminine = defaultSpawnMap();
    p.spawnMasculine = defaultSpawnMap();
    p.humanSpawnRate = 5;
    p.taurSpawnRate = 5;
    p.halfDemonSpawnRate = 5;
    p.taurFurryLevel = 2;
    LT.saveProperties();
  };

  LT.setGenderPreference = function (genderId, value) {
    LT.ensurePreferenceMaps().genderPreferences[genderId] = value;
    LT.saveProperties();
  };
  LT.setOrientationPreference = function (id, value) {
    LT.ensurePreferenceMaps().orientationPreferences[id] = value;
    LT.saveProperties();
  };
  LT.setAgePreference = function (type, ageId, value) {
    LT.ensurePreferenceMaps().agePreferences[type][ageId] = value;
    LT.saveProperties();
  };
  LT.setFetishPreference = function (id, value) {
    LT.ensurePreferenceMaps().fetishPreferences[id] = value;
    LT.saveProperties();
  };
  LT.setFurryPreference = function (side, raceId, furryId) {
    var p = LT.ensurePreferenceMaps();
    var race = LT.getSpawnSubspecies(raceId);
    if (race && !race.furryEnabled) return;
    if (side === "masculine") p.furryMasculine[raceId] = furryId;
    else p.furryFeminine[raceId] = furryId;
    LT.saveProperties();
  };
  LT.setSpawnPreference = function (side, raceId, value) {
    var p = LT.ensurePreferenceMaps();
    var race = LT.getSpawnSubspecies(raceId);
    if (race && !race.spawnEnabled) return;
    if (side === "masculine") p.spawnMasculine[raceId] = value;
    else p.spawnFeminine[raceId] = value;
    LT.saveProperties();
  };
  LT.setAllFurryPreferences = function (furryId) {
    var i;
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) {
      if (!LT.SPAWN_SUBSPECIES[i].furryEnabled) continue;
      LT.ensurePreferenceMaps().furryFeminine[LT.SPAWN_SUBSPECIES[i].id] = furryId;
      LT.ensurePreferenceMaps().furryMasculine[LT.SPAWN_SUBSPECIES[i].id] = furryId;
    }
    LT.saveProperties();
  };
  LT.setAllSpawnPreferences = function (value) {
    var i;
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) {
      if (!LT.SPAWN_SUBSPECIES[i].spawnEnabled) continue;
      LT.ensurePreferenceMaps().spawnFeminine[LT.SPAWN_SUBSPECIES[i].id] = value;
      LT.ensurePreferenceMaps().spawnMasculine[LT.SPAWN_SUBSPECIES[i].id] = value;
    }
    LT.saveProperties();
  };

  LT.getGenderById = function (id) {
    return LT.Gender[id] || null;
  };

  LT.getSpawnSubspecies = function (id) {
    var i;
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) {
      if (LT.SPAWN_SUBSPECIES[i].id === id) return LT.SPAWN_SUBSPECIES[i];
    }
    return null;
  };

  LT.getFetishDef = function (id) {
    var i;
    for (i = 0; i < LT.FETISH_LIST.length; i++) {
      if (LT.FETISH_LIST[i].id === id) return LT.FETISH_LIST[i];
    }
    return null;
  };

  LT.getFetishPreference = function (value) {
    var i;
    for (i = 0; i < LT.FetishPreference.length; i++) {
      if (LT.FetishPreference[i].value === value) return LT.FetishPreference[i];
    }
    return LT.FetishPreference[3];
  };

  LT.fetishContentDisabledLabel = function (fetish) {
    if (!fetish || !fetish.content) return null;
    if (LT.hasProperty(fetish.content)) return null;
    return FETISH_CONTENT_LABEL[fetish.content] || "Unspecified Content";
  };

  LT.getGenderFromUserPreferences = function (a, b) {
    LT.ensurePreferenceMaps();
    var map = {};
    var i;
    var g;
    if (a && typeof a === "object" && (a.id || a.isFeminine || typeof a.feminine === "boolean")) {
      var wantFem = typeof a.isFeminine === "function" ? a.isFeminine() : a.feminine !== false && a.id !== "MASCULINE" && a.id !== "MASCULINE_STRONG";
      for (i = 0; i < LT.GENDER_LIST.length; i++) {
        g = LT.GENDER_LIST[i];
        if (!!g.feminine === !!wantFem && LT.ensureProperties().genderPreferences[g.id] > 0) {
          map[g.id] = LT.ensureProperties().genderPreferences[g.id];
        }
      }
      var picked = pickWeighted(map);
      if (picked) return LT.getGenderById(picked);
      return wantFem ? LT.Gender.F_V_B_FEMALE : LT.Gender.M_P_MALE;
    }
    var requiresVagina = !!a;
    var requiresPenis = !!b;
    for (i = 0; i < LT.GENDER_LIST.length; i++) {
      g = LT.GENDER_LIST[i];
      if (requiresVagina && !g.hasVagina) continue;
      if (requiresPenis && !g.hasPenis) continue;
      if (LT.ensureProperties().genderPreferences[g.id] > 0) map[g.id] = LT.ensureProperties().genderPreferences[g.id];
    }
    picked = pickWeighted(map);
    if (picked) return LT.getGenderById(picked);
    if (Math.random() > 0.5 || requiresVagina) {
      if (requiresVagina && requiresPenis) return LT.Gender.F_P_V_B_FUTANARI;
      if (requiresPenis) return LT.Gender.F_P_B_SHEMALE;
      return LT.Gender.F_V_B_FEMALE;
    }
    return LT.Gender.M_P_MALE;
  };

  LT.getSexualOrientationFromUserPreferences = function (gynephilicWeight, ambiphilicWeight, androphilicWeight) {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().orientationPreferences;
    var map = {
      GYNEPHILIC: (prefs.GYNEPHILIC || 0) * (gynephilicWeight || 0),
      AMBIPHILIC: (prefs.AMBIPHILIC || 0) * (ambiphilicWeight || 0),
      ANDROPHILIC: (prefs.ANDROPHILIC || 0) * (androphilicWeight || 0),
    };
    var id = pickWeighted(map);
    return (id && LT.Orientation[id]) || LT.Orientation.AMBIPHILIC;
  };

  LT.getRacialOrientation = function (raceId, gender) {
    if (raceId === "harpy") return LT.getSexualOrientationFromUserPreferences(95, 5, 0);
    if (raceId === "demon" || raceId === "angel") return LT.getSexualOrientationFromUserPreferences(0, 1, 0);
    if (gender && gender.feminine) return LT.getSexualOrientationFromUserPreferences(20, 40, 40);
    return LT.getSexualOrientationFromUserPreferences(60, 30, 10);
  };

  LT.getAgeFromPreferences = function (gender) {
    LT.ensurePreferenceMaps();
    var type = (gender && gender.type) || "FEMININE";
    var prefs = LT.ensureProperties().agePreferences[type] || {};
    var map = {};
    var i;
    for (i = 0; i < LT.AgeCategory.length; i++) {
      var cat = LT.AgeCategory[i];
      if ((prefs[cat.id] || 0) > 0) map[cat.id] = prefs[cat.id];
    }
    var id = pickWeighted(map);
    var chosen = null;
    for (i = 0; i < LT.AgeCategory.length; i++) {
      if (LT.AgeCategory[i].id === id) chosen = LT.AgeCategory[i];
    }
    if (!chosen) chosen = LT.AgeCategory[2];
    return chosen.min + Math.floor(Math.random() * (chosen.max - chosen.min));
  };

  LT.isAttractedToPlayer = function (npc) {
    var player = LT.game && LT.game.player;
    var playerFem = !!(player && player.isFeminine && player.isFeminine());
    var o = npc && npc.orientation;
    var oid = o && o.id ? o.id : o;
    if (oid === "GYNEPHILIC") return playerFem;
    if (oid === "ANDROPHILIC") return !playerFem;
    return true;
  };

  function furryFor(gender, raceId) {
    var p = LT.ensurePreferenceMaps();
    if (gender && gender.feminine) return p.furryFeminine[raceId] || "NORMAL";
    return p.furryMasculine[raceId] || "NORMAL";
  }

  function spawnFor(gender, raceId) {
    var p = LT.ensurePreferenceMaps();
    if (gender && gender.feminine) return p.spawnFeminine[raceId] || 0;
    return p.spawnMasculine[raceId] || 0;
  }

  LT.pickEncounterRace = function (opts) {
    opts = opts || {};
    var gender = opts.gender || LT.Gender.F_V_B_FEMALE;
    var pool = opts.pool || "dominion";
    var includeHuman = opts.includeHumanChance !== false;
    if (includeHuman && Math.random() * 100 < LT.getNumericProperty("humanSpawnRate", 5)) {
      return LT.HUMAN_RACE;
    }
    var weights = {};
    var races = {};
    var i;
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) {
      var race = LT.SPAWN_SUBSPECIES[i];
      if (pool && race.pools && !race.pools[pool]) continue;
      if (furryFor(gender, race.id) === "HUMAN") continue;
      var spawn = spawnFor(gender, race.id);
      if (spawn <= 0) continue;
      var w = Math.floor(10000 * (race.rarity || 1) * spawn);
      if (w <= 0) continue;
      weights[race.id] = w;
      races[race.id] = race;
    }
    var id = pickWeighted(weights);
    if (id && races[id]) return races[id];
    return opts.fallback || LT.HUMAN_RACE;
  };

  var FETISH_COUNT = [1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];

  LT.applyFetishPreferences = function (npc) {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().fetishPreferences;
    var fetishes = [];
    var desires = {};
    var haveMap = {};
    var i;
    for (i = 0; i < LT.FETISH_LIST.length; i++) {
      var f = LT.FETISH_LIST[i];
      if (LT.fetishContentDisabledLabel(f)) continue;
      var pref = LT.getFetishPreference(prefs[f.id]);
      if (pref.value === 0) continue;
      if (pref.value === 6) {
        fetishes.push(f.id);
        desires[f.id] = "LOVE";
        continue;
      }
      var desireWeights = {};
      if (pref.hate) desireWeights.HATE = pref.hate;
      if (pref.dislike) desireWeights.DISLIKE = pref.dislike;
      if (pref.like) desireWeights.LIKE = pref.like;
      if (pref.love) desireWeights.LOVE = pref.love;
      var rolled = pickWeighted(desireWeights) || "NEUTRAL";
      desires[f.id] = rolled;
      if (rolled === "LOVE") haveMap[f.id] = pref.love || 5;
      else if (rolled === "LIKE") haveMap[f.id] = pref.like || 3;
    }
    var want = FETISH_COUNT[Math.floor(Math.random() * FETISH_COUNT.length)];
    while (fetishes.length < want) {
      var pick = pickWeighted(haveMap);
      if (!pick) break;
      fetishes.push(pick);
      delete haveMap[pick];
    }
    npc.fetishes = fetishes;
    npc.fetishDesires = desires;
    npc.hasFetish = function (id) {
      return this.fetishes && this.fetishes.indexOf(id) >= 0;
    };
    npc.getFetishDesire = function (id) {
      return (this.fetishDesires && this.fetishDesires[id]) || "NEUTRAL";
    };
    return npc;
  };

  LT.genderBarHtml = function () {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().genderPreferences;
    var total = 0;
    var i;
    for (i = 0; i < LT.GENDER_LIST.length; i++) total += prefs[LT.GENDER_LIST[i].id] || 0;
    var html = '<div class="pref-bar">';
    if (!total) {
      html += '<div class="pref-bar-seg" style="width:100%;background:' + Colour.FEMININE + ';"></div>';
    } else {
      for (i = 0; i < LT.GENDER_LIST.length; i++) {
        var g = LT.GENDER_LIST[i];
        var v = prefs[g.id] || 0;
        if (v <= 0) continue;
        html += '<div class="pref-bar-seg" style="width:' + (v / total) * 100 + "%;background:" + g.colour + ';"></div>';
      }
    }
    return html + "</div>";
  };

  LT.orientationBarHtml = function () {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().orientationPreferences;
    var total = (prefs.ANDROPHILIC || 0) + (prefs.AMBIPHILIC || 0) + (prefs.GYNEPHILIC || 0);
    var html = '<div class="pref-bar">';
    if (!total) {
      html += '<div class="pref-bar-seg" style="width:100%;background:' + Colour.ANDROGYNOUS + ';"></div>';
    } else {
      var i;
      for (i = 0; i < LT.ORIENTATION_LIST.length; i++) {
        var o = LT.ORIENTATION_LIST[i];
        var v = prefs[o.id] || 0;
        if (v <= 0) continue;
        html += '<div class="pref-bar-seg" style="width:' + (v / total) * 100 + "%;background:" + o.colour + ';"></div>';
      }
    }
    return html + "</div>";
  };

  LT.ageBarHtml = function (type) {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().agePreferences[type] || {};
    var total = 0;
    var i;
    for (i = 0; i < LT.AgeCategory.length; i++) total += prefs[LT.AgeCategory[i].id] || 0;
    var colour = LT.PronounType[type] ? LT.PronounType[type].colour : Colour.ANDROGYNOUS;
    var html = '<div class="pref-bar">';
    if (!total) {
      html += '<div class="pref-bar-seg" style="width:100%;background:' + colour + ';"></div>';
    } else {
      for (i = 0; i < LT.AgeCategory.length; i++) {
        var cat = LT.AgeCategory[i];
        var v = prefs[cat.id] || 0;
        if (v <= 0) continue;
        html += '<div class="pref-bar-seg" style="width:' + (v / total) * 100 + "%;background:" + cat.colour + ';"></div>';
      }
    }
    return html + "</div>";
  };

  if (typeof document !== "undefined") LT.ensurePreferenceMaps();
})();
