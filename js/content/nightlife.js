(function () {
  var PACK = "places/dominion/nightlife/theWateringHole";
  var LIGHTS = "places/dominion/nightlife/lights_out";
  var SELL = 1.2;
  var WAIT_SECONDS = 1800;
  var BREAK_MINUTES = 35;
  var BREAK_COOLDOWN = 720;
  var AFF_FRIENDLY = 20;
  var AFF_LIKE = 40;
  var AFF_CARING = 60;
  var AFF_STRONG_DISLIKE = -60;
  var ALC_MERRY = 0.2;
  var ALC_DRUNK = 0.4;
  var ALC_WASTED_MAX = 1;

  var CLUB_RACES = [
    { id: "human", fem: "woman", masc: "man", name: "human" },
    { id: "cat-morph", fem: "cat-girl", masc: "cat-boy", name: "cat-morph" },
    { id: "dog-morph", fem: "dog-girl", masc: "dog-boy", name: "dog-morph" },
    { id: "wolf-morph", fem: "wolf-girl", masc: "wolf-boy", name: "wolf-morph" },
    { id: "fox-morph", fem: "fox-girl", masc: "fox-boy", name: "fox-morph" },
    { id: "horse-morph", fem: "horse-girl", masc: "horse-boy", name: "horse-morph" },
    { id: "rabbit-morph", fem: "rabbit-girl", masc: "rabbit-boy", name: "rabbit-morph" },
    { id: "rat-morph", fem: "rat-girl", masc: "rat-boy", name: "rat-morph" },
    { id: "squirrel-morph", fem: "squirrel-girl", masc: "squirrel-boy", name: "squirrel-morph" },
    { id: "cow-morph", fem: "cow-girl", masc: "cow-boy", name: "cow-morph" },
    { id: "alligator-morph", fem: "alligator-girl", masc: "alligator-boy", name: "alligator-morph" },
    { id: "bat-morph", fem: "bat-girl", masc: "bat-boy", name: "bat-morph" },
    { id: "raccoon-morph", fem: "raccoon-girl", masc: "raccoon-boy", name: "raccoon-morph" },
    { id: "harpy", fem: "harpy", masc: "harpy", name: "harpy" },
  ];

  var DRINKS = [
    { id: "innoxia_race_human_vanilla_water", label: "Water", alcohol: 0, value: 10, affection: 1, kind: "bottle" },
    { id: "innoxia_race_dog_canine_crush", label: "Beer", alcohol: 0.05, value: 35, affection: 2, kind: "bottle" },
    { id: "innoxia_race_cat_felines_fancy", label: "Feline's Fancy", alcohol: 0.1, value: 150, affection: 3, kind: "glass" },
    { id: "innoxia_race_wolf_wolf_whiskey", label: "Wolf Whiskey", alcohol: 0.4, value: 120, affection: 4, kind: "glass" },
    { id: "innoxia_race_rat_black_rats_rum", label: "Black Rat's Rum", alcohol: 0.5, value: 200, affection: 5, kind: "glass" },
  ];

  function xml(tag) {
    return LT.parseFromXML(PACK, tag);
  }

  function lightsXml(tag) {
    return LT.parseFromXML(LIGHTS, tag);
  }

  function flags() {
    LT.game.flags = LT.game.flags || {};
    return LT.game.flags;
  }

  function flag(name) {
    return !!(LT.game.flags && LT.game.flags[name]);
  }

  function setFlag(name, on) {
    flags()[name] = !!on;
    if (!on) delete flags()[name];
  }

  function minutesOfDay(extraSeconds) {
    var s = (((LT.game.secondsPassed || 0) + (extraSeconds || 0)) % 86400 + 86400) % 86400;
    return Math.floor(s / 60);
  }

  LT.isClubOpen = function (minutesAhead) {
    var m = (minutesOfDay() + (minutesAhead || 0)) % 1440;
    return !(m >= 300 && m < 1140);
  };

  LT.isLightsOutOpen = function () {
    var h = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    return h >= 18 || h < 4;
  };

  function hasHannah() {
    return flag("innoxia_hannah_training_complete");
  }

  function slot(index, response) {
    if (response) response._index = index;
    return response;
  }

  function parseWith(npc, html) {
    if (!npc) return typeof LT.parse === "function" ? LT.parse(html) : html;
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.npc = npc;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: npc, pc: LT.game.player }, function () {
        return LT.parse(html);
      });
    }
    return LT.parse(html);
  }

  function xmlNpc(tag, npc) {
    return parseWith(npc, xml(tag));
  }

  function p(html) {
    return "<p>" + html + "</p>";
  }

  function isDemon() {
    var pl = LT.game.player;
    if (!pl) return false;
    var race = String(pl.raceName || pl.fullRace || "").toLowerCase();
    return race === "demon" || race.indexOf("succubus") >= 0 || race.indexOf("incubus") >= 0 || race.indexOf("demon") >= 0;
  }

  function canUseMouth() {
    return !flag("mouthInaccessible");
  }

  function storm() {
    return typeof LT.currentWeather === "function" && LT.currentWeather() === "MAGIC_STORM";
  }

  function drinkPrice(drink) {
    return Math.floor(drink.value * SELL);
  }

  function drinkName(drink) {
    var type = LT.ITEMS && LT.ITEMS[drink.id];
    return (type && type.name) || drink.label;
  }

  function drinkEffects(drink) {
    var lines = [];
    if (drink.alcohol > 0) lines.push("Adds " + Math.round(drink.alcohol * 100) + "% to intoxication level.");
    else lines.push("Non-alcoholic.");
    return "<br>" + lines.join("<br>");
  }

  LT.alcoholLevelValue = function (ch) {
    if (!ch) return 0;
    return Math.max(0, Math.min(ALC_WASTED_MAX, ch.alcoholLevel || 0));
  };

  LT.incrementAlcoholLevel = function (ch, amount) {
    if (!ch) return "";
    ch.alcoholLevel = Math.max(0, Math.min(ALC_WASTED_MAX, (ch.alcoholLevel || 0) + amount));
    if (!amount) return "";
    return (
      "<p style='text-align:center;'><i>" +
      (ch.getName ? ch.getName() : ch.name || "They") +
      (amount > 0 ? " gets more intoxicated." : " sobers up a little.") +
      "</i></p>"
    );
  };

  function alcoholName(v) {
    if (v < 0.01) return "";
    if (v < 0.2) return "tipsy";
    if (v < 0.4) return "merry";
    if (v < 0.6) return "drunk";
    if (v < 0.8) return "hammered";
    return "wasted";
  }

  function affectionOf(npc) {
    if (!npc) return 0;
    if (!isPartnerSub() && npc.nightlyAffection != null) return npc.nightlyAffection;
    return npc.affection || 0;
  }

  function incrementAffection(npc, amount) {
    if (!npc) return "";
    if (!isPartnerSub() && npc.nightlyAffection != null) {
      npc.nightlyAffection = Math.max(-100, Math.min(100, (npc.nightlyAffection || 0) + amount));
    }
    npc.affection = Math.max(-100, Math.min(100, (npc.affection || 0) + amount));
    var name = npc.getName ? npc.getName() : npc.name || "They";
    var verb = amount >= 0 ? "likes you more" : "likes you less";
    return "<p style='text-align:center;'><i>" + name + " " + verb + ".</i></p>";
  }

  function likesKiss(npc) {
    if (!npc) return false;
    return affectionOf(npc) >= AFF_FRIENDLY || LT.alcoholLevelValue(npc) > 0;
  }

  function likesGroping(npc) {
    if (!npc) return false;
    return affectionOf(npc) >= AFF_LIKE || LT.alcoholLevelValue(npc) > ALC_MERRY;
  }

  function likesSex(npc) {
    if (!npc) return false;
    return affectionOf(npc) >= AFF_CARING || LT.alcoholLevelValue(npc) > ALC_DRUNK;
  }

  function getPartner() {
    return (LT.game.npcs && LT.game.npcs.clubber) || null;
  }

  function hasPartner() {
    return !!getPartner();
  }

  function isPartnerSub() {
    var npc = getPartner();
    if (!npc) return true;
    return !npc.confident;
  }

  function resetDomBehaviour() {
    flags().clubberBehaviour = "INTRODUCTION";
    flags().clubberTurnsAtPlace = 0;
    flags().clubberBuyingDrinks = true;
    var npc = getPartner();
    if (npc) npc.nightlyAffection = 0;
  }

  function currentClubPlace() {
    return (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "WATERING_HOLE_MAIN_AREA";
  }

  function behaviourPlace(behaviour) {
    if (!behaviour) return "WATERING_HOLE_MAIN_AREA";
    if (behaviour.indexOf("BAR_") === 0) return "WATERING_HOLE_BAR";
    if (behaviour.indexOf("DANCE") === 0) return "WATERING_HOLE_DANCE_FLOOR";
    if (behaviour.indexOf("SIT_DOWN") === 0) return "WATERING_HOLE_SEATING_AREA";
    if (behaviour === "TOILETS") return "WATERING_HOLE_TOILETS";
    return "WATERING_HOLE_MAIN_AREA";
  }

  function isWillingToMove() {
    var turns = flags().clubberTurnsAtPlace || 0;
    var cur = flags().clubberBehaviour || "INTRODUCTION";
    return !(turns < 2 && cur !== "INTRODUCTION");
  }

  function isPartnerOfferingDrinks() {
    if (flags().clubberBuyingDrinks === false) return false;
    var npc = getPartner();
    var alc = LT.alcoholLevelValue(LT.game.player);
    if (npc && npc.selfish) return alc < 0.6;
    if (npc && npc.kind) return alc < 0.01;
    return alc < 0.4;
  }

  function isDomLeaving() {
    return hasPartner() && !isPartnerSub() && affectionOf(getPartner()) < AFF_STRONG_DISLIKE;
  }

  function incrementDomAffection(amount) {
    var npc = getPartner();
    if (!npc) return "";
    npc.nightlyAffection = Math.max(-100, Math.min(100, (npc.nightlyAffection || 0) + amount));
    if (npc.nightlyAffection <= (npc.affection || 0) && npc.nightlyAffection < 100) return "";
    npc.affection = Math.max(-100, Math.min(100, (npc.affection || 0) + amount));
    var name = npc.getName ? npc.getName() : npc.name || "They";
    return "<p style='text-align:center;'><i>" + name + " " + (amount >= 0 ? "likes you more" : "likes you less") + ".</i></p>";
  }

  function drinkById(id) {
    var i;
    for (i = 0; i < DRINKS.length; i++) if (DRINKS[i].id === id) return DRINKS[i];
    return DRINKS[0];
  }

  function pickClubberBehaviour() {
    var npc = getPartner();
    var here = currentClubPlace();
    var cur = flags().clubberBehaviour || "INTRODUCTION";
    var canMove = isWillingToMove();
    if (isDomLeaving()) return "LEAVES";
    if (npc && npc.selfish) {
      if (cur !== "BAR_DRINK" && isPartnerOfferingDrinks() && (here === "WATERING_HOLE_BAR" || canMove)) return "BAR_DRINK";
      if (canMove && likesSex(npc)) return "TOILETS";
      if (!canMove) {
        if (here === "WATERING_HOLE_DANCE_FLOOR") return cur !== "DANCE_GROPE" ? "DANCE_GROPE" : "DANCE_KISS";
        if (likesKiss(npc)) return cur !== "BAR_GROPE" ? "BAR_GROPE" : "BAR_KISS";
        return cur !== "BAR_FLIRT" ? "BAR_FLIRT" : "BAR_KISS";
      }
      if (here !== "WATERING_HOLE_DANCE_FLOOR") return cur !== "DANCE_GROPE" ? "DANCE_GROPE" : "DANCE_KISS";
      if (likesKiss(npc)) return cur !== "BAR_GROPE" ? "BAR_GROPE" : "BAR_KISS";
      return cur !== "BAR_FLIRT" ? "BAR_FLIRT" : "BAR_KISS";
    }
    if (npc && npc.kind) {
      if (cur !== "BAR_DRINK" && isPartnerOfferingDrinks() && (here === "WATERING_HOLE_BAR" || canMove)) return "BAR_DRINK";
      if (likesSex(npc)) return here === "WATERING_HOLE_SEATING_AREA" ? "SIT_DOWN_INVITE_HOME" : "BAR_INVITE_HOME";
      if (likesGroping(npc)) {
        if (canMove || here === "WATERING_HOLE_SEATING_AREA") return cur !== "SIT_DOWN_FOOTSIE" ? "SIT_DOWN_FOOTSIE" : "SIT_DOWN_KISS";
        return cur !== "BAR_GROPE" ? "BAR_GROPE" : "BAR_KISS";
      }
      if (likesKiss(npc)) {
        if (canMove || here === "WATERING_HOLE_SEATING_AREA") return cur !== "SIT_DOWN_KISS" ? "SIT_DOWN_KISS" : "SIT_DOWN_FLIRT";
        return cur !== "BAR_KISS" ? "BAR_KISS" : "BAR_FLIRT";
      }
      if ((here === "WATERING_HOLE_BAR" || canMove) && isPartnerOfferingDrinks()) {
        return cur !== "BAR_FLIRT" ? "BAR_FLIRT" : "BAR_TALK";
      }
      return cur !== "SIT_DOWN_FLIRT" ? "SIT_DOWN_FLIRT" : "SIT_DOWN_TALK";
    }
    if (cur !== "BAR_DRINK" && isPartnerOfferingDrinks() && (here === "WATERING_HOLE_BAR" || canMove)) return "BAR_DRINK";
    if ((canMove || here === "WATERING_HOLE_SEATING_AREA") && likesSex(npc)) return "SIT_DOWN_SEX";
    if (likesGroping(npc)) {
      if (canMove || here === "WATERING_HOLE_SEATING_AREA") return cur !== "SIT_DOWN_FOOTSIE" ? "SIT_DOWN_FOOTSIE" : "SIT_DOWN_KISS";
      if (here === "WATERING_HOLE_DANCE_FLOOR") return cur !== "DANCE_GROPE" ? "DANCE_GROPE" : "DANCE_KISS";
      return cur !== "BAR_GROPE" ? "BAR_GROPE" : "BAR_KISS";
    }
    if (likesKiss(npc)) {
      if (canMove || here === "WATERING_HOLE_SEATING_AREA") return cur !== "SIT_DOWN_KISS" ? "SIT_DOWN_KISS" : "SIT_DOWN_FLIRT";
      if (here === "WATERING_HOLE_DANCE_FLOOR") return cur !== "DANCE_KISS" ? "DANCE_KISS" : "DANCE";
      return cur !== "BAR_KISS" ? "BAR_KISS" : "BAR_FLIRT";
    }
    if (here === "WATERING_HOLE_DANCE_FLOOR" || !canMove) return cur !== "BAR_FLIRT" ? "BAR_FLIRT" : "BAR_TALK";
    return "DANCE";
  }

  function applyBehaviourEffects() {
    var npc = getPartner();
    var next = pickClubberBehaviour();
    flags().clubberTurnsAtPlace = (flags().clubberTurnsAtPlace || 0) + 1;
    if (next === "LEAVES") {
      flags().clubberBehaviour = "LEAVES";
      return;
    }
    var from = behaviourPlace(flags().clubberBehaviour || "INTRODUCTION");
    var to = behaviourPlace(next);
    if (from !== to) {
      var locTag = {
        WATERING_HOLE_BAR: "WATERING_HOLE_DOM_PARTNER_CHANGE_LOCATION_BAR",
        WATERING_HOLE_DANCE_FLOOR: "WATERING_HOLE_DOM_PARTNER_CHANGE_LOCATION_DANCE_FLOOR",
        WATERING_HOLE_SEATING_AREA: "WATERING_HOLE_DOM_PARTNER_CHANGE_LOCATION_SEATING_AREA",
        WATERING_HOLE_TOILETS: "WATERING_HOLE_DOM_PARTNER_CHANGE_LOCATION_TOILETS",
      }[to];
      if (locTag) LT.game.textStart = (LT.game.textStart || "") + xmlNpc(locTag, npc);
      flags().clubberTurnsAtPlace = 0;
    }
    flags().clubberBehaviour = next;
    goClub(to);
  }

  function domReactResponses() {
    if (isEndConditionMet(0)) return endResponses(0);
    return [
      null,
      slot(
        1,
        new LT.Response("Continue", parseWith(getPartner(), "See what [npc.name] wants to do next..."), "nightlife.dom.partner", function () {
          applyBehaviourEffects();
        }),
      ),
    ];
  }

  function goAfterDom() {
    var place = currentClubPlace();
    if (place && LT.hasNode("place." + place)) LT.game.setContent("place." + place);
    else LT.game.setContent("place.WATERING_HOLE_MAIN_AREA");
  }

  function followDomHome() {
    if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_BOULEVARD");
  }

  function bindPartner(npc) {
    LT.game.npcs = LT.game.npcs || {};
    if (npc) {
      LT.game.npcs.clubber = npc;
      LT.game.npcs.npc = npc;
      syncClubberPresent();
    } else {
      var old = LT.game.npcs.clubber;
      if (old) old.location = null;
      delete LT.game.npcs.clubber;
      if (LT.game.npcs.npc && LT.game.npcs.npc.clubber) delete LT.game.npcs.npc;
    }
    return npc;
  }

  function syncClubberPresent() {
    var npc = getPartner();
    if (!npc) return npc;
    var loc = LT.game.player && LT.game.player.location;
    if (loc && loc.world) npc.location = { world: loc.world, place: loc.place };
    else npc.location = null;
    return npc;
  }

  LT.syncNightlifePresent = function () {
    ensureClubNpcs();
    return syncClubberPresent();
  };

  function savedClubbers() {
    flags().savedClubbers = flags().savedClubbers || [];
    return flags().savedClubbers;
  }

  function serializeClubber(npc) {
    return {
      id: npc.id,
      name: npc.name,
      feminine: !!npc.feminine,
      genderId: npc.gender && npc.gender.id,
      raceName: npc.raceName,
      fullRace: npc.fullRace,
      confident: !!npc.confident,
      kind: !!npc.kind,
      selfish: !!npc.selfish,
      affection: npc.affection || 0,
      orientation: npc.orientation && npc.orientation.id,
      speechColour: npc.speechColour,
      attractedToPlayer: npc.attractedToPlayer !== false,
      lastEncounteredMinutes: npc.lastEncounteredMinutes || 0,
      timesHadSex: npc.timesHadSex || 0,
    };
  }

  function hydrateClubber(data) {
    var gender = (data.genderId && LT.Gender && LT.Gender[data.genderId]) || (data.feminine ? LT.Gender.FEMALE : LT.Gender.MALE);
    return makeClubber(gender, findRace(data.raceName) || CLUB_RACES[0], !data.confident, data);
  }

  function findRace(id) {
    var i;
    for (i = 0; i < CLUB_RACES.length; i++) if (CLUB_RACES[i].id === id) return CLUB_RACES[i];
    return null;
  }

  function pickName(feminine) {
    var list = LT.HUMAN_NAME_TRIPLETS;
    if (list && list.length) {
      var trip = list[Math.floor(Math.random() * list.length)];
      return feminine ? trip[2] || trip[1] || trip[0] : trip[0];
    }
    return feminine ? "Mira" : "Rook";
  }

  function makeClubber(gender, race, submissive, data) {
    data = data || {};
    var feminine = !!(gender && gender.feminine);
    var fullRace = feminine ? race.fem : race.masc;
    var name = data.name || pickName(feminine);
    var npc = {
      id: data.id || "clubber_" + Math.random().toString(36).slice(2, 8),
      name: name,
      playerKnowsName: true,
      occupation: "clubber",
      clubber: true,
      unique: false,
      feminine: feminine,
      gender: gender,
      raceName: race.id,
      fullRace: fullRace,
      raceStage: data.raceStage || "GREATER",
      confident: data.confident != null ? !!data.confident : !submissive,
      affection: data.affection != null ? data.affection : 0,
      nightlyAffection: 0,
      alcoholLevel: 0,
      orientation: (data.orientation && LT.Orientation[data.orientation]) || LT.Orientation.AMBIPHILIC,
      speechColour: data.speechColour || (gender && gender.colour) || (feminine ? LT.Colour.FEMININE : LT.Colour.MASCULINE),
      getName: function () {
        return this.name;
      },
      getFullName: function () {
        return this.name;
      },
      isFeminine: function () {
        return !!this.feminine;
      },
      getSpeechColour: function () {
        return this.speechColour;
      },
      getRaceName: function () {
        return this.fullRace;
      },
      hasVagina: function () {
        return !!(this.gender && this.gender.hasVagina);
      },
      hasPenis: function () {
        return !!(this.gender && this.gender.hasPenis);
      },
      hasBreasts: function () {
        return !!(this.gender && this.gender.hasBreasts);
      },
      isConfident: function () {
        return !!this.confident;
      },
      isShy: function () {
        return !this.confident;
      },
      isKind: function () {
        return !!this.kind;
      },
      isSelfish: function () {
        return !!this.selfish;
      },
    };
    if (data.kind != null) npc.kind = !!data.kind;
    if (data.selfish != null) npc.selfish = !!data.selfish;
    if (!data.name) {
      if (Math.random() < 0.4) npc.orientation = LT.Orientation.AMBIPHILIC;
      else if (LT.game.player && LT.game.player.isFeminine && LT.game.player.isFeminine()) npc.orientation = LT.Orientation.GYNEPHILIC;
      else npc.orientation = LT.Orientation.ANDROPHILIC;
    }
    if (data.attractedToPlayer != null) npc.attractedToPlayer = !!data.attractedToPlayer;
    else if (typeof LT.isAttractedToPlayer === "function") npc.attractedToPlayer = LT.isAttractedToPlayer(npc);
    else npc.attractedToPlayer = true;
    if (typeof LT.applyFetishPreferences === "function") LT.applyFetishPreferences(npc);
    npc.lastEncounteredMinutes = data.lastEncounteredMinutes || 0;
    npc.timesHadSex = data.timesHadSex || 0;
    if (submissive) {
      npc.confident = false;
      npc.kind = false;
      npc.selfish = false;
    } else if (data.kind == null && data.selfish == null) {
      npc.confident = true;
      var rnd = Math.random();
      if (rnd < 0.33) npc.kind = true;
      else if (rnd < 0.66) npc.selfish = true;
    }
    return npc;
  }

  LT.generateClubber = function (opts) {
    opts = opts || {};
    var gender = opts.gender || (typeof LT.getGenderFromUserPreferences === "function" ? LT.getGenderFromUserPreferences(!!opts.feminine) : LT.Gender.FEMALE);
    var race = opts.race || CLUB_RACES[Math.floor(Math.random() * CLUB_RACES.length)];
    var submissive = opts.submissive !== false;
    var npc = bindPartner(makeClubber(gender, race, submissive, { raceStage: opts.raceStage }));
    resetDomBehaviour();
    return npc;
  };

  function minutesPassed() {
    return Math.floor((LT.game.secondsPassed || 0) / 60);
  }

  function markClubberMet(npc) {
    if (!npc) return;
    npc.lastEncounteredMinutes = minutesPassed();
  }

  function saveClubbers() {
    var npc = getPartner();
    if (!npc) return;
    markClubberMet(npc);
    var list = savedClubbers();
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === npc.id) list.splice(i, 1);
    list.push(serializeClubber(npc));
    bindPartner(null);
  }

  function removeClubbers() {
    bindPartner(null);
  }

  function clubberStatus(seconds) {
    if (!hasPartner()) {
      if (isEndConditionMet(Math.floor((seconds || 0) / 60))) return endingStatus(Math.floor((seconds || 0) / 60));
      return "";
    }
    var npc = getPartner();
    var aff = affectionOf(npc);
    var colour = aff < -10 ? LT.Colour.GENERIC_BAD : aff < 30 ? LT.Colour.GENERIC_MINOR_GOOD : LT.Colour.GENERIC_GOOD;
    var mood;
    if (aff < -50) mood = "angry and frustrated";
    else if (aff < -10) mood = "mildly annoyed";
    else if (aff < 30) mood = "entertained";
    else if (aff < 70) mood = "having a great time";
    else mood = "desperate to have sex with you";
    var html = "<p style='text-align:center;'><i>";
    html += parseWith(npc, "[npc.Name] looks <i style='color:" + colour + ";'>" + mood + "</i>.");
    var alc = LT.alcoholLevelValue(npc);
    var an = alcoholName(alc);
    if (an) html += "<br>" + parseWith(npc, "[npc.Name] is currently <i style='color:" + (LT.Colour.ATTRIBUTE_CORRUPTION || "#b14a4a") + ";'>" + an + "</i>.");
    html += "<br>";
    if (likesSex(npc)) html += parseWith(npc, "You can tell that [npc.she] wants to have sex with you...");
    else if (likesGroping(npc)) html += parseWith(npc, "You can tell that [npc.she] wants some physical contact...");
    else if (likesKiss(npc)) html += parseWith(npc, "You can tell that [npc.she] wouldn't mind a kiss...");
    else html += parseWith(npc, "It would be best to talk to [npc.herHim] a little before making a move...");
    html += "</i></p>";
    if (isEndConditionMet(Math.floor((seconds || 0) / 60))) html += endingStatus(Math.floor((seconds || 0) / 60));
    return html;
  }

  function isPartnerLeaving() {
    return hasPartner() && affectionOf(getPartner()) < AFF_STRONG_DISLIKE;
  }

  function isPartnerPassingOut() {
    return hasPartner() && isPartnerSub() && LT.alcoholLevelValue(getPartner()) >= ALC_WASTED_MAX - 0.05;
  }

  function isEndConditionMet(minutesAhead) {
    return isPartnerLeaving() || isPartnerPassingOut() || (!LT.isClubOpen(minutesAhead) && flag("passedJules"));
  }

  function endingStatus(minutesAhead) {
    var html = "<p style='text-align:center;'>";
    if (isPartnerLeaving()) {
      html += parseWith(getPartner(), "<b style='color:" + LT.Colour.GENERIC_BAD + ";'>[npc.Name] leaves you!</b><br>[npc.Name] is fed up, and with a dismissive wave of [npc.her] [npc.hand], [npc.she] turns around and leaves you!");
    } else if (isPartnerPassingOut()) {
      html += parseWith(getPartner(), "<b style='color:" + LT.Colour.GENERIC_BAD + ";'>[npc.Name] collapses!</b><br>Having had far too much to drink, [npc.name] slumps down to the ground!");
    } else if (!LT.isClubOpen(minutesAhead)) {
      html += "<b style='color:" + LT.Colour.GENERIC_BAD + ";'>Closing time</b><br>All of the lights in the club suddenly flash off and on a few times, and as the background music stops playing, you hear Jules shout out, ";
      html += parseWith(LT.ensureJules(), "[jules.speech(It's closing time! Everyone out!)]");
    }
    html += "</p>";
    return html;
  }

  function leaveToStreet() {
    setFlag("kalahariWantsSex", false);
    if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_NIGHTLIFE_DISTRICT");
    LT.game.setContent("place.DOMINION_NIGHTLIFE_DISTRICT");
  }

  function goClub(placeType) {
    if (typeof LT.enterWorld === "function") LT.enterWorld("NIGHTLIFE_CLUB", placeType);
    syncClubberPresent();
  }

  function goMainArea() {
    goClub("WATERING_HOLE_MAIN_AREA");
  }

  function endResponses(minutesAhead) {
    var list = [null];
    if (isPartnerLeaving()) {
      list.push(
        slot(
          1,
          new LT.Response("Continue", parseWith(getPartner(), "Perhaps you should have treated [npc.name] a little better..."), null, function () {
            LT.game.textStart = xmlNpc(isPartnerSub() ? "WATERING_HOLE_PARTNER_LEAVES" : "WATERING_HOLE_PARTNER_DOM_LEAVES", getPartner());
            removeClubbers();
            LT.game.setContent(currentPlaceNode());
          }),
        ),
      );
      return list;
    }
    if (isPartnerPassingOut()) {
      list.push(
        slot(
          1,
          new LT.Response("Continue", parseWith(getPartner(), "[npc.Name] collapses!"), null, function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_PARTNER_TOO_WASTED", getPartner());
            saveClubbers();
            LT.game.setContent(currentPlaceNode());
          }),
        ),
      );
      return list;
    }
    if (!LT.isClubOpen(minutesAhead)) {
      if (hasPartner()) {
        list.push(
          slot(
            1,
            new LT.Response("Say goodbye", parseWith(getPartner(), "It's closing time. Say goodbye to [npc.name]. Saves this character."), null, function () {
              saveClubbers();
              leaveToStreet();
            }).withColour(LT.Colour.GENERIC_GOOD),
          ),
        );
        var home = new LT.Response("Invite home", parseWith(getPartner(), "Ask [npc.name] to come back to your place."), "nightlife.home", function () {
          takeHome();
        });
        if (!likesSex(getPartner())) home.disable(parseWith(getPartner(), "[npc.Name] is showing no interest in wanting to go back to your place..."));
        list.push(slot(2, home));
        list.push(
          slot(
            3,
            new LT.Response("Lose company", parseWith(getPartner(), "Tell [npc.name] you've got to go. Removes this character."), null, function () {
              removeClubbers();
              leaveToStreet();
            }).withColour(LT.Colour.GENERIC_BAD),
          ),
        );
      } else {
        list.push(
          slot(
            1,
            new LT.Response("Leave", "It's closing time, so you need to leave the club now.", null, function () {
              leaveToStreet();
            }),
          ),
        );
      }
    }
    return list;
  }

  function currentPlaceNode() {
    var place = LT.game.player && LT.game.player.location && LT.game.player.location.place;
    if (place && LT.hasNode("place." + place)) return "place." + place;
    return "place.WATERING_HOLE_MAIN_AREA";
  }

  function takeHome() {
    if (typeof LT.enterWorld === "function") LT.enterWorld("LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_ROOM_PLAYER");
  }

  function startClubSex(opts) {
    opts = opts || {};
    if (opts.partner && opts.partner.clubber) {
      opts.partner.timesHadSex = (opts.partner.timesHadSex || 0) + 1;
    }
    if (typeof LT.sex !== "object" || typeof LT.sex.start !== "function") {
      LT.game.setContent(opts.postSexNode || currentPlaceNode());
      return;
    }
    LT.sex.start({
      partner: opts.partner || getPartner(),
      playerDom: opts.playerDom !== false,
      consensual: opts.consensual !== false,
      manager: opts.manager,
      postSexNode: opts.postSexNode,
      startText: opts.startText || "",
      positionName: opts.positionName,
    });
    LT.game.setContent("sex.scene");
  }

  function partnerActionResponses(prefix, extra) {
    extra = extra || {};
    var npc = getPartner();
    var list = extra.base || [null];
    if (isEndConditionMet(0)) return endResponses(0);
    list.push(
      slot(
        1,
        new LT.Response("Talk", parseWith(npc, "Talk to [npc.name] and get to know [npc.herHim] a little better."), prefix + ".talk", function () {
          LT.game.textEnd = incrementAffection(npc, 5) + clubberStatus(120);
        }),
      ),
    );
    list.push(
      slot(
        2,
        new LT.Response("Flirt", parseWith(npc, "Compliment [npc.namePos] appearance and start flirting with [npc.herHim]."), prefix + ".flirt", function () {
          LT.game.textEnd = incrementAffection(npc, 10) + clubberStatus(120);
        }),
      ),
    );
    var kiss = new LT.Response("Kiss", parseWith(npc, "Lean in and kiss [npc.name]."), prefix + ".kiss", function () {
      if (likesKiss(npc)) LT.game.textEnd = incrementAffection(npc, extra.kissAff != null ? extra.kissAff : 15) + clubberStatus(120);
      else LT.game.textEnd = incrementAffection(npc, extra.kissReject != null ? extra.kissReject : -15) + clubberStatus(120);
    });
    if (!likesKiss(npc) && extra.kissNeed) kiss.disable(parseWith(npc, extra.kissNeed));
    list.push(slot(3, kiss));
    var grope = new LT.Response(extra.gropeTitle || "Feel up", parseWith(npc, extra.gropeTip || "Get some physical contact with [npc.name]."), prefix + ".grope", function () {
      if (likesGroping(npc)) LT.game.textEnd = incrementAffection(npc, extra.gropeAff != null ? extra.gropeAff : 20) + clubberStatus(120);
      else LT.game.textEnd = incrementAffection(npc, extra.gropeReject != null ? extra.gropeReject : -25) + clubberStatus(120);
    });
    list.push(slot(4, grope));
    list.push(
      slot(
        5,
        new LT.Response("Save", parseWith(npc, "Say goodbye to [npc.name] for now. Saves this character."), extra.saveNode || currentPlaceNode(), function () {
          LT.game.textStart = xmlNpc(extra.saveTag || "WATERING_HOLE_MAIN_SAVE_CLUBBER", npc);
          saveClubbers();
        }).withColour(LT.Colour.GENERIC_GOOD),
      ),
    );
    list.push(
      slot(
        6,
        new LT.Response("Lose company", parseWith(npc, "Tell [npc.name] you've got to go. Removes this character."), extra.loseNode || currentPlaceNode(), function () {
          LT.game.textStart = xmlNpc(extra.loseTag || "WATERING_HOLE_MAIN_LOSE_COMPANY", npc);
          removeClubbers();
        }).withColour(LT.Colour.GENERIC_BAD),
      ),
    );
    return list;
  }

  function searchResponses() {
    var list = [null];
    if (isEndConditionMet(0)) return endResponses(0);
    var last = flags().lastClubSearch;
    list.push(slot(1, new LT.Response("Search", "Look through the crowds for someone to spend the night with.", "nightlife.search.gender", function () {
      flags().searchingForASub = true;
    })));
    if (last && last.sub) {
      list.push(
        slot(
          2,
          new LT.Response("Repeat", "Look for someone like the last person you approached.", "nightlife.search.found", function () {
            flags().searchingForASub = true;
            spawnFromLast(true);
          }),
        ),
      );
    }
    if (savedClubbers().length) {
      list.push(slot(3, new LT.Response("Contacts", "Look for someone you've already spent the night with.", "nightlife.contacts", function () {
        flags().searchingForASub = true;
      })));
    }
    list.push(slot(4, new LT.Response("Import", "Import a character file as a clubber.", null).disable("Importing a character file is not available in this HTML build.")));
    list.push(slot(6, new LT.Response("Search (as sub)", "Look for a dominant partner to spend the night with.", "nightlife.search.gender", function () {
      flags().searchingForASub = false;
    })));
    if (last && !last.sub) {
      list.push(
        slot(
          7,
          new LT.Response("Repeat (dom)", "Look for another dominant partner like last time.", "nightlife.search.found", function () {
            flags().searchingForASub = false;
            spawnFromLast(false);
          }),
        ),
      );
    }
    if (savedClubbers().length) {
      list.push(slot(8, new LT.Response("Contacts (dom)", "Look for a dominant clubber you've already met.", "nightlife.contacts", function () {
        flags().searchingForASub = false;
      })));
    }
    list.push(slot(9, new LT.Response("Import (dom)", "Import a dominant clubber.", null).disable("Importing a character file is not available in this HTML build.")));
    return list;
  }

  function spawnFromLast(sub) {
    var last = flags().lastClubSearch || {};
    var gender = (last.genderId && LT.Gender[last.genderId]) || LT.Gender.FEMALE;
    var race = findRace(last.raceId) || CLUB_RACES[0];
    flags().searchingForASub = !!sub;
    LT.generateClubber({ gender: gender, race: race, submissive: !!sub, raceStage: last.raceStage });
  }

  function gendersOf(type) {
    var out = [];
    var id;
    for (id in LT.Gender) {
      if (!Object.prototype.hasOwnProperty.call(LT.Gender, id)) continue;
      var g = LT.Gender[id];
      if (!g || !g.id || g.id !== id) continue;
      if (g.type === type) out.push(g);
    }
    return out;
  }

  function startSexFrom(tag, post, playerDom) {
    var npc = getPartner();
    startClubSex({
      partner: npc,
      playerDom: playerDom !== false,
      postSexNode: post,
      startText: xmlNpc(tag, npc),
    });
  }

  function roomTravel() {
    return typeof LT.travelResponses === "function" ? LT.travelResponses() : [null];
  }

  function ensureClubNpcs() {
    if (typeof LT.ensureJules === "function") {
      var jules = LT.ensureJules();
      var loc = LT.game.player && LT.game.player.location;
      if (jules && loc && loc.world === "NIGHTLIFE_CLUB") {
        jules.location = { world: "NIGHTLIFE_CLUB", place: "WATERING_HOLE_ENTRANCE" };
      } else if (jules) {
        jules.location = null;
      }
    }
    if (typeof LT.ensureKalahari === "function") {
      var kalahari = LT.ensureKalahari();
      var here = LT.game.player && LT.game.player.location;
      if (kalahari && here && here.world === "NIGHTLIFE_CLUB" && here.place === "WATERING_HOLE_BAR") {
        kalahari.location = { world: "NIGHTLIFE_CLUB", place: "WATERING_HOLE_BAR" };
      } else if (kalahari) {
        kalahari.location = null;
      }
    }
    if (typeof LT.ensureKruger === "function") {
      var kruger = LT.ensureKruger();
      var vip = LT.game.player && LT.game.player.location;
      if (kruger && vip && vip.world === "NIGHTLIFE_CLUB" && vip.place === "WATERING_HOLE_VIP_AREA") {
        kruger.location = { world: "NIGHTLIFE_CLUB", place: "WATERING_HOLE_VIP_AREA" };
      } else if (kruger) {
        kruger.location = null;
      }
    }
    syncClubberPresent();
  }

  /* —— Street —— */
  LT.defineNode({
    id: "place.DOMINION_NIGHTLIFE_DISTRICT",
    ui: "dialogue",
    title: "Nightlife",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
      else if (typeof LT.maybeStormEncounter === "function") LT.maybeStormEncounter();
      ensureClubNpcs();
    },
    getContent: function () {
      var html;
      if (!LT.isClubOpen(0)) html = xml(storm() ? "OUTSIDE_DAY_STORM" : "OUTSIDE_DAY");
      else html = xml(storm() ? "OUTSIDE_NIGHT_STORM" : "OUTSIDE_NIGHT");
      if (hasHannah()) html += xml("OUTSIDE_LIGHTS_OUT");
      return html;
    },
    getResponses: function () {
      var list = roomTravel().filter(function (r) {
        return !r || String(r.title || r.name || "") !== "Enter";
      });
      var open = LT.isClubOpen(0);
      var hole = new LT.Response(
        "Watering Hole",
        open ? "The nightclub, 'The Watering Hole', is currently open. You could enter if you wanted to." : "The nightclub, 'The Watering Hole', is currently closed. A sign by the entrance informs you that it's open from 19:00–05:00 every night.",
        "place.WATERING_HOLE_ENTRANCE",
        function () {
          setFlag("passedJules", false);
          setFlag("fuckedJulesTonight", false);
          goClub("WATERING_HOLE_ENTRANCE");
        },
      );
      if (!open) hole.disable("The nightclub, 'The Watering Hole', is currently closed. A sign by the entrance informs you that it's open from 19:00–05:00 every night.");
      list.push(hole);
      if (hasHannah()) {
        var lo = new LT.Response(
          "Lights Out",
          LT.isLightsOutOpen() ? "The bar, 'Lights Out', is currently open. You could enter if you wanted to." : "The bar, 'Lights Out', is currently closed. A sign by the entrance informs you that it's open from 18:00–04:00 every night.",
          "place.innoxia_dominion_nightlife_lights_out_exit",
          function () {
            if (typeof LT.enterWorld === "function") LT.enterWorld("innoxia_dominion_nightlife_lights_out", "innoxia_dominion_nightlife_lights_out_exit");
          },
        );
        if (!LT.isLightsOutOpen()) lo.disable("The bar, 'Lights Out', is currently closed. A sign by the entrance informs you that it's open from 18:00–04:00 every night.");
        list.push(lo);
      }
      return list;
    },
  });

  /* —— Entrance / Jules —— */
  function entranceContent() {
    ensureClubNpcs();
    if (!flag("passedJules")) {
      return xml(flag("julesIntroduced") ? "WATERING_HOLE_ENTRANCE_REPEAT" : "WATERING_HOLE_ENTRANCE");
    }
    return xmlNpc("WATERING_HOLE_ENTRANCE_PASSED", getPartner()) + clubberStatus(60);
  }

  function passJules() {
    setFlag("passedJules", true);
    setFlag("julesIntroduced", true);
    goMainArea();
  }

  LT.defineNode({
    id: "place.WATERING_HOLE_ENTRANCE",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    travelDisabled: function () {
      return !flag("passedJules") || isEndConditionMet(0);
    },
    chrome: { left: true, right: true },
    applyPreParsingEffects: ensureClubNpcs,
    getContent: entranceContent,
    getResponses: function () {
      if (isEndConditionMet(0) && flag("passedJules")) return endResponses(0);
      var list = [null];
      if (!hasPartner()) {
        list.push(
          slot(
            0,
            new LT.Response("Exit", "Leave 'The Watering Hole' and head back out into the district of Dominion known as 'Nightlife'.", null, function () {
              setFlag("julesIntroduced", true);
              leaveToStreet();
            }),
          ),
        );
        if (!flag("passedJules")) {
          list.push(
            slot(
              1,
              new LT.Response("Wait", "Wait patiently in the queue to get in to the club.", "nightlife.entrance.wait", function () {
                passJules();
              }).withTime(WAIT_SECONDS),
            ),
          );
          var suck = new LT.Response("Suck cock", "Suck Jules's cock in front of everyone in order to skip to the front of the queue.", null, function () {
            setFlag("suckedJulesCock", true);
            setFlag("passedJules", true);
            setFlag("julesIntroduced", true);
            startClubSex({
              partner: LT.ensureJules(),
              playerDom: false,
              postSexNode: "nightlife.entrance.afterBlowjob",
              startText: xml("WATERING_HOLE_ENTRANCE_START_BLOWJOB"),
              positionName: "Performing oral",
            });
          });
          if (!canUseMouth()) suck.disable("You can't gain access to your mouth, so you can't suck Jules's cock!");
          list.push(slot(2, suck));
          if (isDemon()) {
            list.push(
              slot(
                3,
                new LT.Response("Skip queue", "Use your status as a demon to cut the queue.", "nightlife.entrance.skip", function () {
                  passJules();
                }),
              ),
            );
          }
          return list;
        }
        if (flag("suckedJulesCock")) {
          var jules = new LT.Response("Jules", "Tell Jules that you want him to give you 'a proper fuck'...", null, function () {
            setFlag("fuckedJules", true);
            setFlag("fuckedJulesTonight", true);
            startClubSex({
              partner: LT.ensureJules(),
              playerDom: false,
              postSexNode: "nightlife.entrance.afterSex",
              startText: xml("WATERING_HOLE_ENTRANCE_JULES_SEX"),
            });
          });
          if (flag("fuckedJulesTonight")) jules.disable("You've already had a 'proper fuck' from Jules tonight, and he doesn't have time to do it again...");
          list.push(slot(1, jules));
        }
        return list;
      }
      list.push(
        slot(
          1,
          new LT.Response("Say goodbye", parseWith(getPartner(), "Say goodbye to [npc.name] before heading back out. Saves this character."), null, function () {
            saveClubbers();
            leaveToStreet();
          }).withColour(LT.Colour.GENERIC_GOOD),
        ),
      );
      var home = new LT.Response("Invite home", parseWith(getPartner(), "Take [npc.name] back to your room."), "nightlife.home", function () {
        takeHome();
      });
      if (!likesSex(getPartner())) home.disable(parseWith(getPartner(), "[npc.Name] is showing no interest in wanting to go back to your place. You should interact with [npc.herHim] a little more first..."));
      list.push(slot(2, home));
      list.push(
        slot(
          3,
          new LT.Response("Lose company", parseWith(getPartner(), "Tell [npc.name] you've got to go. Removes this character."), null, function () {
            removeClubbers();
            leaveToStreet();
          }).withColour(LT.Colour.GENERIC_BAD),
        ),
      );
      return list;
    },
  });

  LT.defineNode({
    id: "nightlife.entrance.wait",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_ENTRANCE_WAITING") + xml("WATERING_HOLE_ENTRANCE_END");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_MAIN_AREA").getResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.entrance.skip",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_ENTRANCE_SKIP_QUEUE") + xml("WATERING_HOLE_ENTRANCE_END");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_MAIN_AREA").getResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.entrance.afterBlowjob",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      goMainArea();
    },
    getContent: function () {
      return xml("AFTER_JULES_BLOWJOB") + xml("WATERING_HOLE_ENTRANCE_END");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_MAIN_AREA").getResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.entrance.afterSex",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("AFTER_JULES_SEX");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_MAIN_AREA").getResponses();
    },
  });

  /* —— Main floor —— */
  function definePartnerBeat(id, title, tag, extraTag, seconds, back) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title || "The Watering Hole",
      secondsPassed: seconds || 120,
      chrome: { left: true, right: true },
      getContent: function () {
        var npc = getPartner();
        var html = xmlNpc(tag, npc);
        if (extraTag) {
          var accepted = extraTag.acceptIf ? extraTag.acceptIf(npc) : true;
          html += xmlNpc(accepted ? extraTag.accept : extraTag.reject, npc);
        }
        return html + clubberStatus(seconds || 120);
      },
      getResponses: function () {
        return LT.getNode(back).getResponses();
      },
    });
  }

  LT.defineNode({
    id: "place.WATERING_HOLE_MAIN_AREA",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: ensureClubNpcs,
    getContent: function () {
      return xmlNpc("WATERING_HOLE_MAIN", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (hasPartner() && !isPartnerSub()) return domReactResponses();
      if (hasPartner()) return partnerActionResponses("nightlife.main", { kissAff: 15, gropeAff: 20, gropeReject: -25 });
      return searchResponses();
    },
  });

  definePartnerBeat("nightlife.main.talk", "The Watering Hole", "WATERING_HOLE_MAIN_TALK", { acceptIf: function () { return true; }, accept: "WATERING_HOLE_TALK_CONTENT", reject: "WATERING_HOLE_TALK_CONTENT" }, 120, "place.WATERING_HOLE_MAIN_AREA");
  definePartnerBeat("nightlife.main.flirt", "The Watering Hole", "WATERING_HOLE_MAIN_FLIRT", { acceptIf: function () { return true; }, accept: "WATERING_HOLE_FLIRT_CONTENT", reject: "WATERING_HOLE_FLIRT_CONTENT" }, 120, "place.WATERING_HOLE_MAIN_AREA");
  definePartnerBeat("nightlife.main.kiss", "The Watering Hole", "WATERING_HOLE_MAIN_KISS", { acceptIf: likesKiss, accept: "WATERING_HOLE_KISS_CONTENT", reject: "WATERING_HOLE_MAIN_KISS_REJECTED" }, 120, "place.WATERING_HOLE_MAIN_AREA");
  definePartnerBeat("nightlife.main.grope", "The Watering Hole", "WATERING_HOLE_MAIN_GROPE", { acceptIf: likesGroping, accept: "WATERING_HOLE_GROPE_CONTENT", reject: "WATERING_HOLE_MAIN_GROPE_REJECTED" }, 120, "place.WATERING_HOLE_MAIN_AREA");

  LT.defineNode({
    id: "nightlife.search.gender",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    tabs: ["Feminine", "Masculine", "Androgynous"],
    getContent: function () {
      return xml("WATERING_HOLE_SEARCH_GENDER");
    },
    getResponses: function (game, tabIndex) {
      var types = ["FEMININE", "MASCULINE", "NEUTRAL"];
      var type = types[tabIndex || 0];
      var list = [null];
      list.push(slot(0, new LT.Response("Back", "Decide against looking for someone to approach.", "place.WATERING_HOLE_MAIN_AREA")));
      var gs = gendersOf(type);
      var i;
      for (i = 0; i < gs.length; i++) {
        (function (g, index) {
          var breasts = g.hasBreasts ? "Breasts" : "No breasts";
          var penis = g.hasPenis ? "Penis" : "No penis";
          var vagina = g.hasVagina ? "Vagina" : "No vagina";
          list.push(
            slot(
              index + 1,
              new LT.Response(g.name.charAt(0).toUpperCase() + g.name.slice(1), "Look for a " + g.name + " in amongst the crowds of revellers. (" + breasts + ", " + penis + ", " + vagina + ")", "nightlife.search.race", function () {
                flags().clubberGenderId = g.id;
              }),
            ),
          );
        })(gs[i], i);
      }
      return list;
    },
  });

  var STAGE_BY_TAB = ["PARTIAL", "PARTIAL_FULL", "LESSER", "GREATER"];

  LT.defineNode({
    id: "nightlife.search.race",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    tabs: ["Partial", "Minor", "Lesser", "Greater"],
    getContent: function () {
      return xml("WATERING_HOLE_SEARCH_RACE");
    },
    getResponses: function (game, tabIndex) {
      var list = [null];
      list.push(slot(0, new LT.Response("Back", "Decide to look for a different gender.", "nightlife.search.gender")));
      var stage = STAGE_BY_TAB[tabIndex || 0];
      var i;
      for (i = 0; i < CLUB_RACES.length; i++) {
        (function (race, index) {
          list.push(
            slot(
              index + 1,
              new LT.Response(race.name.charAt(0).toUpperCase() + race.name.slice(1), "Look for a " + race.name + " in amongst the crowds of revellers.", "nightlife.search.found", function () {
                var gender = LT.Gender[flags().clubberGenderId] || LT.Gender.FEMALE;
                var sub = flags().searchingForASub !== false;
                flags().lastClubSearch = { genderId: gender.id, raceId: race.id, raceStage: stage, sub: sub };
                LT.generateClubber({ gender: gender, race: race, submissive: sub, raceStage: stage });
              }),
            ),
          );
        })(CLUB_RACES[i], i);
      }
      return list;
    },
  });

  LT.defineNode({
    id: "nightlife.search.found",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    travelDisabled: function () {
      return !isPartnerSub();
    },
    chrome: { left: true, right: true },
    getContent: function () {
      var tag = isPartnerSub() ? "WATERING_HOLE_SEARCH_GENERATE" : "WATERING_HOLE_SEARCH_GENERATE_DOM";
      return xmlNpc(tag, getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (!isPartnerSub()) return domReactResponses();
      return LT.getNode("place.WATERING_HOLE_MAIN_AREA").getResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.contacts",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml(flags().searchingForASub === false ? "WATERING_HOLE_CONTACTS_DOM" : "WATERING_HOLE_CONTACTS");
    },
    getResponses: function () {
      var list = [null];
      list.push(slot(0, new LT.Response("Back", "Decide to stop searching for someone you've met before.", "place.WATERING_HOLE_MAIN_AREA")));
      var wantSub = flags().searchingForASub !== false;
      var listSaved = savedClubbers();
      var shown = 0;
      var i;
      for (i = 0; i < listSaved.length; i++) {
        (function (data) {
          var isSub = !data.confident;
          if (isSub !== wantSub) return;
          shown += 1;
          var idx = shown;
          var raceTip = data.fullRace || data.raceName || "clubber";
          var r = new LT.Response(data.name, "Look for " + data.name + " in the club. (" + raceTip + ")", "nightlife.contacts.find", function () {
            var npc = hydrateClubber(data);
            bindPartner(npc);
            markClubberMet(npc);
            if (!npc.timesHadSex) npc.affection = 5;
            if (!isPartnerSub()) resetDomBehaviour();
          });
          if (data.attractedToPlayer === false) {
            r.disable(data.name + " is no longer attracted to you, and so would be unwilling to spend time with you in the club. (" + raceTip + ")");
          } else if (data.lastEncounteredMinutes && minutesPassed() - data.lastEncounteredMinutes < 720) {
            r.disable("You have already met " + data.name + " in the club tonight, and as such, you will not be able to encounter them again until tomorrow.");
          }
          list.push(slot(idx, r));
        })(listSaved[i]);
      }
      return list;
    },
  });

  LT.defineNode({
    id: "nightlife.contacts.find",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    travelDisabled: function () {
      return !isPartnerSub();
    },
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc(isPartnerSub() ? "WATERING_HOLE_FIND_CONTACT" : "WATERING_HOLE_FIND_CONTACT_DOM", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (!isPartnerSub()) return domReactResponses();
      return LT.getNode("place.WATERING_HOLE_MAIN_AREA").getResponses();
    },
  });

  /* —— Seating —— */
  LT.defineNode({
    id: "place.WATERING_HOLE_SEATING_AREA",
    ui: "dialogue",
    title: "Seating Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      if (hasPartner()) return xmlNpc("WATERING_HOLE_SEATING_WITH_PARTNER", getPartner()) + clubberStatus(60);
      return xml("WATERING_HOLE_SEATING");
    },
    getResponses: function () {
      if (!hasPartner()) return roomTravel();
      if (isEndConditionMet(0)) return endResponses(0);
      var npc = getPartner();
      var list = [null];
      list.push(
        slot(
          1,
          new LT.Response("Talk", parseWith(npc, "Talk to [npc.name] and get to know [npc.herHim] a little better."), "nightlife.seating.talk", function () {
            LT.game.textEnd = incrementAffection(npc, 5) + clubberStatus(120);
          }),
        ),
      );
      list.push(
        slot(
          2,
          new LT.Response("Flirt", parseWith(npc, "Compliment [npc.namePos] appearance and start flirting with [npc.herHim]."), "nightlife.seating.flirt", function () {
            LT.game.textEnd = incrementAffection(npc, 10) + clubberStatus(120);
          }),
        ),
      );
      list.push(
        slot(
          3,
          new LT.Response("Footsie", parseWith(npc, "Play footsie with [npc.name] under the table."), "nightlife.seating.footsie", function () {
            if (likesGroping(npc)) LT.game.textEnd = incrementAffection(npc, 25) + clubberStatus(120);
            else LT.game.textEnd = incrementAffection(npc, -25) + clubberStatus(120);
          }),
        ),
      );
      var sexDom = new LT.Response("Sex (dom)", parseWith(npc, "Propose having sex here, with you on top."), null, function () {
        if (likesSex(npc)) startSexFrom("WATERING_HOLE_SEATING_SEX_AS_DOM", "nightlife.seating.afterSex", true);
        else {
          incrementAffection(npc, -25);
          LT.game.setContent("nightlife.seating.sexDomRejected");
        }
      });
      var sexSub = new LT.Response("Sex (sub)", parseWith(npc, "Propose having sex here, with [npc.name] on top."), null, function () {
        if (likesSex(npc)) startSexFrom("WATERING_HOLE_SEATING_SEX_AS_SUB", "nightlife.seating.afterSex", false);
        else {
          incrementAffection(npc, -25);
          LT.game.setContent("nightlife.seating.sexSubRejected");
        }
      });
      list.push(slot(4, sexDom));
      list.push(slot(5, sexSub));
      list.push(
        slot(
          6,
          new LT.Response("Save", parseWith(npc, "Say goodbye to [npc.name] for now."), "place.WATERING_HOLE_SEATING_AREA", function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_SEATING_SAVE_CLUBBER", npc);
            saveClubbers();
          }).withColour(LT.Colour.GENERIC_GOOD),
        ),
      );
      list.push(
        slot(
          7,
          new LT.Response("Lose company", parseWith(npc, "Tell [npc.name] you've got to go."), "place.WATERING_HOLE_SEATING_AREA", function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_SEATING_LOSE_COMPANY", npc);
            removeClubbers();
          }).withColour(LT.Colour.GENERIC_BAD),
        ),
      );
      return list;
    },
  });

  definePartnerBeat("nightlife.seating.talk", "Seating Area", "WATERING_HOLE_SEATING_TALK", { acceptIf: function () { return true; }, accept: "WATERING_HOLE_TALK_CONTENT", reject: "WATERING_HOLE_TALK_CONTENT" }, 120, "place.WATERING_HOLE_SEATING_AREA");
  definePartnerBeat("nightlife.seating.flirt", "Seating Area", "WATERING_HOLE_SEATING_FLIRT", { acceptIf: function () { return true; }, accept: "WATERING_HOLE_FLIRT_CONTENT", reject: "WATERING_HOLE_FLIRT_CONTENT" }, 120, "place.WATERING_HOLE_SEATING_AREA");
  LT.defineNode({
    id: "nightlife.seating.footsie",
    ui: "dialogue",
    title: "Seating Area",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc(likesGroping(getPartner()) ? "WATERING_HOLE_SEATING_FOOTSIE" : "WATERING_HOLE_SEATING_FOOTSIE_REJECTED", getPartner()) + clubberStatus(120);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_SEATING_AREA").getResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.seating.sexDomRejected",
    ui: "dialogue",
    title: "Seating Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_SEATING_SEX_AS_DOM_REJECTED", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_SEATING_AREA").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.seating.sexSubRejected",
    ui: "dialogue",
    title: "Seating Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_SEATING_SEX_AS_SUB_REJECTED", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_SEATING_AREA").getResponses();
    },
  });

  function afterSexResponses(prefix, seeTag, noTag, rudeTag, back) {
    return function () {
      var list = [null];
      var npc = getPartner();
      list.push(
        slot(
          1,
          new LT.Response("See again", parseWith(npc, "Tell [npc.name] that you'd like to see [npc.herHim] again."), prefix + ".see", function () {
            LT.game.textStart = xmlNpc(seeTag, npc);
            saveClubbers();
          }).withColour(LT.Colour.GENERIC_GOOD),
        ),
      );
      list.push(
        slot(
          2,
          new LT.Response("Don't see again", parseWith(npc, "Tell [npc.name] that you don't want to see [npc.herHim] again."), prefix + ".gone", function () {
            LT.game.textStart = xmlNpc(noTag, npc);
            removeClubbers();
          }),
        ),
      );
      list.push(
        slot(
          3,
          new LT.Response("Rude", parseWith(npc, "Bluntly tell [npc.name] you don't want to see [npc.herHim] again."), prefix + ".gone", function () {
            LT.game.textStart = xmlNpc(rudeTag, npc);
            removeClubbers();
          }).withColour(LT.Colour.GENERIC_BAD),
        ),
      );
      return list;
    };
  }

  LT.defineNode({
    id: "nightlife.seating.afterSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var org = LT.sex && LT.sex.partner && LT.sex.partner.orgasmedThisSex;
      return xmlNpc(org ? "WATERING_HOLE_SEATING_AFTER_SEX" : "WATERING_HOLE_SEATING_AFTER_SEX_NO_ORGASM", getPartner());
    },
    getResponses: afterSexResponses("nightlife.seating", "WATERING_HOLE_SEATING_AFTER_SEX_SEE_AGAIN", "WATERING_HOLE_SEATING_AFTER_SEX_DO_NOT_SEE_AGAIN", "WATERING_HOLE_SEATING_AFTER_SEX_DO_NOT_SEE_AGAIN_RUDE", "place.WATERING_HOLE_SEATING_AREA"),
  });
  LT.defineNode({
    id: "nightlife.seating.see",
    ui: "dialogue",
    title: "Seating Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return clubberStatus(60);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_SEATING_AREA").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.seating.gone",
    ui: "dialogue",
    title: "Seating Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_SEATING");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_SEATING_AREA").getResponses();
    },
  });

  /* —— Bar / Kalahari —— */
  function kalahariBreakLeft() {
    var started = flags().kalahari_break_timer || 0;
    return Math.max(0, BREAK_MINUTES - (minutesOfDay() - started));
  }

  function kalahariCanBreak() {
    var last = flags().kalahari_break_timer || 0;
    return minutesOfDay() - last >= BREAK_COOLDOWN || !last;
  }

  function applyDrink(target, drink) {
    return LT.incrementAlcoholLevel(target, drink.alcohol);
  }

  function drinkSelfResponse(drink, index) {
    var price = drinkPrice(drink);
    var name = drinkName(drink);
    var title = drink.label + " (" + price + ")";
    var r = new LT.Response(title, "Ask Kalahari for a " + drink.kind + " of " + name + "." + drinkEffects(drink), "nightlife.bar.drink", function () {
      LT.game.textStart =
        parseWith(null, "<p>[pc.speech(Can I get a " + drink.kind + " of " + name + "?)] you call out over the noise of the club to Kalahari.</p>") +
        parseWith(LT.ensureKalahari(), "<p>[kalahari.speech(Sure thing hun!)] the lioness responds. [kalahari.speech(That'll be " + price + " flames.)]</p>") +
        p("Handing over the money to Kalahari, you take the " + name + " and drink it.") +
        applyDrink(LT.game.player, drink) +
        LT.incrementMoney(-price);
    });
    if (LT.getMoney() < price) r.disable("You can't afford a " + drink.kind + " of " + name + "!");
    return slot(index, r);
  }

  function drinkPartnerResponse(drink, index) {
    var price = drinkPrice(drink);
    var name = drinkName(drink);
    var npc = getPartner();
    var r = new LT.Response(drink.label + " (" + price + ")", parseWith(npc, "Ask Kalahari for a " + drink.kind + " of " + name + " for [npc.name]." + drinkEffects(drink)), "nightlife.bar.drink", function () {
      LT.game.textStart =
        parseWith(npc, "<p>You buy [npc.name] a " + drink.kind + " of " + name + ".</p>") +
        applyDrink(npc, drink) +
        incrementAffection(npc, drink.affection) +
        LT.incrementMoney(-price);
    });
    if (LT.getMoney() < price) r.disable("You can't afford that drink!");
    return slot(index, r);
  }

  LT.defineNode({
    id: "place.WATERING_HOLE_BAR",
    ui: "dialogue",
    title: "Bar",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: ensureClubNpcs,
    getContent: function () {
      if (!flag("kalahariIntroduced")) return xml("WATERING_HOLE_BAR");
      return xmlNpc("WATERING_HOLE_BAR_REPEAT", getPartner()) + clubberStatus(60);
    },
    tabs: function () {
      if (!hasPartner()) return [];
      return ["Self", getPartner().name];
    },
    getResponses: function (game, tabIndex) {
      ensureClubNpcs();
      if (isEndConditionMet(0)) return endResponses(0);
      if (!flag("kalahariIntroduced")) {
        return [null, new LT.Response("Barmaid", "The lioness barmaid says hello.", "nightlife.bar.intro", function () {
          setFlag("kalahariIntroduced", true);
        })];
      }
      if (hasPartner() && tabIndex === 1) {
        var list = [null];
        var d;
        var npc = getPartner();
        for (d = 0; d < DRINKS.length; d++) list.push(drinkPartnerResponse(DRINKS[d], d + 1));
        list.push(
          slot(
            6,
            new LT.Response("Talk", parseWith(npc, "Talk to [npc.name] in order to get to know [npc.herHim] better."), "nightlife.bar.talk", function () {
              LT.game.textEnd = incrementAffection(npc, 5) + clubberStatus(120);
            }),
          ),
        );
        list.push(
          slot(
            7,
            new LT.Response("Flirt", parseWith(npc, "Start flirting with [npc.name]."), "nightlife.bar.flirt", function () {
              LT.game.textEnd = incrementAffection(npc, 10) + clubberStatus(120);
            }),
          ),
        );
        list.push(
          slot(
            8,
            new LT.Response("Kiss", parseWith(npc, "Lean in and kiss [npc.name]."), "nightlife.bar.kiss", function () {
              if (likesKiss(npc)) LT.game.textEnd = incrementAffection(npc, 15) + clubberStatus(120);
              else LT.game.textEnd = incrementAffection(npc, -15) + clubberStatus(120);
            }),
          ),
        );
        list.push(
          slot(
            9,
            new LT.Response("Feel up", parseWith(npc, "Get some physical contact with [npc.name]."), "nightlife.bar.grope", function () {
              if (likesGroping(npc)) LT.game.textEnd = incrementAffection(npc, 25) + clubberStatus(120);
              else LT.game.textEnd = incrementAffection(npc, -25) + clubberStatus(120);
            }),
          ),
        );
        list.push(
          slot(
            10,
            new LT.Response("Save", parseWith(npc, "Say goodbye to [npc.name] for now."), "place.WATERING_HOLE_BAR", function () {
              LT.game.textStart = xmlNpc("WATERING_HOLE_BAR_SAVE_CLUBBER", npc);
              saveClubbers();
            }).withColour(LT.Colour.GENERIC_GOOD),
          ),
        );
        list.push(
          slot(
            11,
            new LT.Response("Lose company", parseWith(npc, "Tell [npc.name] you've got to go."), "place.WATERING_HOLE_BAR", function () {
              LT.game.textStart = xmlNpc("WATERING_HOLE_BAR_LOSE_COMPANY", npc);
              removeClubbers();
            }).withColour(LT.Colour.GENERIC_BAD),
          ),
        );
        return list;
      }
      var self = [null];
      var i;
      for (i = 0; i < DRINKS.length; i++) self.push(drinkSelfResponse(DRINKS[i], i + 1));
      if (!hasPartner()) {
        self.push(
          slot(
            6,
            new LT.Response("Talk", "Lean forwards and talk to Kalahari for a little while.", "nightlife.bar.kalahari.talk", function () {
              LT.game.textEnd = incrementAffection(LT.ensureKalahari(), 5) + clubberStatus(120);
            }),
          ),
        );
        self.push(
          slot(
            7,
            new LT.Response("Flirt", "Start flirting with Kalahari.", "nightlife.bar.kalahari.flirt", function () {
              LT.game.textEnd = incrementAffection(LT.ensureKalahari(), 10) + clubberStatus(120);
            }),
          ),
        );
        var br = new LT.Response("Break", "Ask Kalahari if she's got a break coming up, and if she'd like to spend it with you.", flag("krugerIntroduced") ? "nightlife.bar.break" : "nightlife.bar.breakIntro", function () {
          flags().kalahari_break_timer = minutesOfDay();
          goClub("WATERING_HOLE_VIP_AREA");
        });
        if (!kalahariCanBreak()) br.disable("Kalahari has already used up her break tonight!");
        else if (!likesKiss(LT.ensureKalahari())) br.disable("You don't know Kalahari well enough to ask her to spend her break with you. Try talking and flirting with her a little first...");
        self.push(slot(8, br));
      } else {
        self.push(slot(6, new LT.Response("Talk", parseWith(getPartner(), "You can't talk to Kalahari while [npc.name] is with you!"), null).disable(parseWith(getPartner(), "You can't talk to Kalahari while [npc.name] is with you!"))));
        self.push(slot(7, new LT.Response("Flirt", parseWith(getPartner(), "You can't flirt with Kalahari while [npc.name] is with you!"), null).disable(parseWith(getPartner(), "You can't flirt with Kalahari while [npc.name] is with you!"))));
        self.push(slot(8, new LT.Response("Break", parseWith(getPartner(), "You can't ask Kalahari to spend her break with you while [npc.name] is with you!"), null).disable(parseWith(getPartner(), "You can't ask Kalahari to spend her break with you while [npc.name] is with you!"))));
      }
      return self;
    },
  });

  LT.defineNode({
    id: "nightlife.bar.intro",
    ui: "dialogue",
    title: "Bar",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_BAR_KALAHARI_INTRO") + clubberStatus(60);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_BAR").getResponses(LT.game, 0);
    },
  });

  LT.defineNode({
    id: "nightlife.bar.drink",
    ui: "dialogue",
    title: "Bar",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return clubberStatus(120);
    },
    getResponses: function (game, tabIndex) {
      return LT.getNode("place.WATERING_HOLE_BAR").getResponses(game, tabIndex || 0);
    },
  });

  definePartnerBeat("nightlife.bar.talk", "Bar", "WATERING_HOLE_BAR_TALK", { acceptIf: function () { return true; }, accept: "WATERING_HOLE_TALK_CONTENT", reject: "WATERING_HOLE_TALK_CONTENT" }, 120, "place.WATERING_HOLE_BAR");
  definePartnerBeat("nightlife.bar.flirt", "Bar", "WATERING_HOLE_BAR_FLIRT", { acceptIf: function () { return true; }, accept: "WATERING_HOLE_FLIRT_CONTENT", reject: "WATERING_HOLE_FLIRT_CONTENT" }, 120, "place.WATERING_HOLE_BAR");
  definePartnerBeat("nightlife.bar.kiss", "Bar", "WATERING_HOLE_BAR_KISS", { acceptIf: likesKiss, accept: "WATERING_HOLE_KISS_CONTENT", reject: "WATERING_HOLE_BAR_KISS_REJECTED" }, 120, "place.WATERING_HOLE_BAR");
  definePartnerBeat("nightlife.bar.grope", "Bar", "WATERING_HOLE_BAR_GROPE", { acceptIf: likesGroping, accept: "WATERING_HOLE_GROPE_CONTENT", reject: "WATERING_HOLE_BAR_GROPE_REJECTED" }, 120, "place.WATERING_HOLE_BAR");

  LT.defineNode({
    id: "nightlife.bar.kalahari.talk",
    ui: "dialogue",
    title: "Bar",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_BAR_KALAHARI_TALK") + clubberStatus(120);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_BAR").getResponses(LT.game, 0);
    },
  });
  LT.defineNode({
    id: "nightlife.bar.kalahari.flirt",
    ui: "dialogue",
    title: "Bar",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_BAR_KALAHARI_FLIRT") + xml("WATERING_HOLE_BAR_KALAHARI_FLIRT_END") + clubberStatus(120);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_BAR").getResponses(LT.game, 0);
    },
  });

  function kalahariStatus() {
    return "<p style='text-align:center;'><i>Kalahari has " + Math.max(0, kalahariBreakLeft() - 5) + " minutes of her break left.</i></p>";
  }

  function breakResponses() {
    if (isEndConditionMet(0) || kalahariBreakLeft() <= 0) {
      if (kalahariBreakLeft() <= 0 && !isEndConditionMet(0)) {
        return [
          null,
          new LT.Response("Continue", "Kalahari's break is over.", "place.WATERING_HOLE_BAR", function () {
            LT.game.textStart = xml("WATERING_HOLE_KALAHARI_BREAK_OUT_OF_TIME");
            goClub("WATERING_HOLE_BAR");
          }),
        ];
      }
      return endResponses(0);
    }
    var k = LT.ensureKalahari();
    var list = [null];
    list.push(
      slot(
        1,
        new LT.Response("Talk", "Talk to Kalahari.", "nightlife.bar.break.talk", function () {
          LT.game.textEnd = incrementAffection(k, 5);
        }),
      ),
    );
    list.push(
      slot(
        2,
        new LT.Response("Flirt", "Flirt with Kalahari.", "nightlife.bar.break.flirt", function () {
          LT.game.textEnd = incrementAffection(k, 10);
        }),
      ),
    );
    var kiss = new LT.Response("Kiss", "Kiss Kalahari.", "nightlife.bar.break.kiss", function () {
      LT.game.textEnd = incrementAffection(k, 15);
    });
    if (!likesKiss(k)) kiss.disable("Kalahari isn't ready for a kiss yet.");
    list.push(slot(3, kiss));
    var grope = new LT.Response("Feel up", "Get some physical contact with Kalahari.", "nightlife.bar.break.grope", function () {
      LT.game.textEnd = incrementAffection(k, 20);
    });
    if (!likesGroping(k)) grope.disable("Kalahari isn't ready for that yet.");
    list.push(slot(4, grope));
    var sex = new LT.Response("Sex", "See if Kalahari wants to have sex during her break.", null, function () {
      startClubSex({
        partner: k,
        playerDom: true,
        postSexNode: "nightlife.bar.break.afterSex",
        startText: xml("WATERING_HOLE_BAR_KALAHARI_BREAK_SEX_AS_DOM"),
      });
    });
    if (!likesSex(k)) sex.disable("Kalahari isn't ready to have sex with you yet.");
    list.push(slot(5, sex));
    list.push(
      slot(
        6,
        new LT.Response("End break", "Let Kalahari get back to work.", "place.WATERING_HOLE_BAR", function () {
          LT.game.textStart = xml("WATERING_HOLE_KALAHARI_BREAK_END");
          goClub("WATERING_HOLE_BAR");
        }),
      ),
    );
    return list;
  }

  LT.defineNode({
    id: "nightlife.bar.breakIntro",
    ui: "dialogue",
    title: "VIP Area",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      setFlag("krugerIntroduced", true);
    },
    getContent: function () {
      return xml("WATERING_HOLE_BAR_KALAHARI_BREAK_KRUGER_INTRO") + kalahariStatus();
    },
    getResponses: breakResponses,
  });
  LT.defineNode({
    id: "nightlife.bar.break",
    ui: "dialogue",
    title: "VIP Area",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_BAR_KALAHARI_BREAK") + kalahariStatus();
    },
    getResponses: breakResponses,
  });
  ["talk", "flirt", "kiss", "grope"].forEach(function (act) {
    var tags = {
      talk: "WATERING_HOLE_KALAHARI_BREAK_TALK",
      flirt: "WATERING_HOLE_KALAHARI_BREAK_FLIRT",
      kiss: "WATERING_HOLE_KALAHARI_BREAK_KISS",
      grope: "WATERING_HOLE_KALAHARI_BREAK_GROPE",
    };
    LT.defineNode({
      id: "nightlife.bar.break." + act,
      ui: "dialogue",
      title: "VIP Area",
      secondsPassed: 180,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return xml(tags[act]) + kalahariStatus();
      },
      getResponses: breakResponses,
    });
  });
  LT.defineNode({
    id: "nightlife.bar.break.afterSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var org = LT.sex && LT.sex.partner && LT.sex.partner.orgasmedThisSex;
      return xml(org ? "WATERING_HOLE_BAR_KALAHARI_BREAK_AFTER_SEX" : "WATERING_HOLE_BAR_KALAHARI_BREAK_AFTER_SEX_NO_ORGASM");
    },
    getResponses: breakResponses,
  });

  /* —— VIP / Kruger —— */
  LT.defineNode({
    id: "place.WATERING_HOLE_VIP_AREA",
    ui: "dialogue",
    title: "VIP Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: ensureClubNpcs,
    getContent: function () {
      if (flag("krugerIntroduced")) return xmlNpc("WATERING_HOLE_VIP", getPartner()) + clubberStatus(60);
      return xmlNpc("WATERING_HOLE_VIP_BLOCKED", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (isEndConditionMet(0)) return endResponses(0);
      var list = roomTravel();
      if (flag("krugerIntroduced") && !hasPartner()) {
        list.push(
          new LT.Response("Kruger", "Walk up to Kruger and say hello.", "nightlife.vip.kruger", function () {
            LT.game.textEnd = xml("WATERING_HOLE_VIP_KRUGER") + clubberStatus(60);
          }),
        );
      }
      return list;
    },
  });

  function krugerResponses() {
    if (isEndConditionMet(0)) return endResponses(0);
    var k = LT.ensureKruger();
    var list = [null];
    list.push(
      slot(
        1,
        new LT.Response("Talk", "Talk to Kruger for a little while.", "nightlife.vip.kruger.talk", function () {
          LT.game.textEnd = incrementAffection(k, 5) + clubberStatus(120);
        }),
      ),
    );
    list.push(
      slot(
        2,
        new LT.Response("Flirt", "Flirt with Kruger.", "nightlife.vip.kruger.flirt", function () {
          LT.game.textEnd = incrementAffection(k, 10) + clubberStatus(120);
        }),
      ),
    );
    var kissed = new LT.Response("Kissed", "You can tell that Kruger wants to kiss you. Lean forwards and let him.", "nightlife.vip.kruger.kiss", function () {
      LT.game.textEnd = incrementAffection(k, 15) + clubberStatus(120);
    });
    if (!likesKiss(k)) kissed.disable("Kruger isn't ready to kiss you yet.");
    list.push(slot(3, kissed));
    var felt = new LT.Response("Felt up", "You can tell that Kruger wants to have some physical contact with you.", "nightlife.vip.kruger.grope", function () {
      LT.game.textEnd = incrementAffection(k, 20) + clubberStatus(120);
    });
    if (!likesGroping(k)) felt.disable("Kruger isn't ready for that yet.");
    list.push(slot(4, felt));
    var sex = new LT.Response("Sex", "Let Kruger have sex with you.", null, function () {
      startClubSex({
        partner: k,
        playerDom: false,
        postSexNode: "nightlife.vip.kruger.afterSex",
        startText: xml("WATERING_HOLE_VIP_KRUGER_SEX_AS_SUB"),
      });
    });
    if (!likesSex(k)) sex.disable("Kruger isn't ready to have sex with you yet.");
    list.push(slot(5, sex));
    list.push(slot(6, new LT.Response("Leave", "Tell Kruger that you need to leave.", "nightlife.vip.kruger.leave")));
    return list;
  }

  LT.defineNode({
    id: "nightlife.vip.kruger",
    ui: "dialogue",
    title: "VIP Area",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return clubberStatus(60);
    },
    getResponses: krugerResponses,
  });
  ["talk", "flirt", "kiss", "grope"].forEach(function (act) {
    var tags = {
      talk: "WATERING_HOLE_VIP_KRUGER_TALK",
      flirt: "WATERING_HOLE_VIP_KRUGER_FLIRT",
      kiss: "WATERING_HOLE_VIP_KRUGER_KISSED",
      grope: "WATERING_HOLE_VIP_KRUGER_FELT_UP",
    };
    LT.defineNode({
      id: "nightlife.vip.kruger." + act,
      ui: "dialogue",
      title: "VIP Area",
      secondsPassed: 120,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return xml(tags[act]) + clubberStatus(120);
      },
      getResponses: krugerResponses,
    });
  });
  LT.defineNode({
    id: "nightlife.vip.kruger.afterSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_VIP_KRUGER_AFTER_SEX");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_VIP_AREA").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.vip.kruger.leave",
    ui: "dialogue",
    title: "VIP Area",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_VIP_KRUGER_LEAVE");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_VIP_AREA").getResponses();
    },
  });

  /* —— Dance floor —— */
  LT.defineNode({
    id: "place.WATERING_HOLE_DANCE_FLOOR",
    ui: "dialogue",
    title: "Dance Floor",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_DANCE_FLOOR", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (isEndConditionMet(0)) return endResponses(0);
      if (!hasPartner()) {
        var list = roomTravel();
        list.push(new LT.Response("Dance", "Dance for a little while.", "nightlife.dance.solo"));
        return list;
      }
      var npc = getPartner();
      var out = [null];
      out.push(
        slot(
          1,
          new LT.Response("Dance", parseWith(npc, "Dance with [npc.name] for a little while."), "nightlife.dance.together", function () {
            LT.game.textEnd = incrementAffection(npc, 15) + clubberStatus(120);
          }),
        ),
      );
      out.push(
        slot(
          2,
          new LT.Response("Kiss", parseWith(npc, "Kiss [npc.name] on the dance floor."), "nightlife.dance.kiss", function () {
            if (likesKiss(npc)) LT.game.textEnd = incrementAffection(npc, 15) + clubberStatus(120);
            else LT.game.textEnd = incrementAffection(npc, -15) + clubberStatus(120);
          }),
        ),
      );
      out.push(
        slot(
          3,
          new LT.Response("Grope", parseWith(npc, "Grope [npc.name] while you dance."), "nightlife.dance.grope", function () {
            if (likesGroping(npc)) LT.game.textEnd = incrementAffection(npc, 25) + clubberStatus(120);
            else LT.game.textEnd = incrementAffection(npc, -25) + clubberStatus(120);
          }),
        ),
      );
      out.push(
        slot(
          4,
          new LT.Response("Save", parseWith(npc, "Say goodbye to [npc.name] for now."), "place.WATERING_HOLE_DANCE_FLOOR", function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_DANCE_FLOOR_SAVE_CLUBBER", npc);
            saveClubbers();
          }).withColour(LT.Colour.GENERIC_GOOD),
        ),
      );
      out.push(
        slot(
          5,
          new LT.Response("Lose company", parseWith(npc, "Tell [npc.name] you've got to go."), "place.WATERING_HOLE_DANCE_FLOOR", function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_DANCE_FLOOR_LOSE_COMPANY", npc);
            removeClubbers();
          }).withColour(LT.Colour.GENERIC_BAD),
        ),
      );
      return out;
    },
  });

  LT.defineNode({
    id: "nightlife.dance.solo",
    ui: "dialogue",
    title: "Dance Floor",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_DANCE_FLOOR_DANCE_SOLO");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_DANCE_FLOOR").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.dance.together",
    ui: "dialogue",
    title: "Dance Floor",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_DANCE_FLOOR_DANCE", getPartner()) + clubberStatus(120);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_DANCE_FLOOR").getResponses();
    },
  });
  definePartnerBeat("nightlife.dance.kiss", "Dance Floor", "WATERING_HOLE_DANCE_FLOOR_KISS", { acceptIf: likesKiss, accept: "WATERING_HOLE_KISS_CONTENT", reject: "WATERING_HOLE_DANCE_FLOOR_KISS_REJECTED" }, 120, "place.WATERING_HOLE_DANCE_FLOOR");
  definePartnerBeat("nightlife.dance.grope", "Dance Floor", "WATERING_HOLE_DANCE_FLOOR_GROPE", { acceptIf: likesGroping, accept: "WATERING_HOLE_GROPE_CONTENT", reject: "WATERING_HOLE_DANCE_FLOOR_GROPE_REJECTED" }, 120, "place.WATERING_HOLE_DANCE_FLOOR");

  /* —— Toilets —— */
  LT.defineNode({
    id: "place.WATERING_HOLE_TOILETS",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_TOILETS", getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (isEndConditionMet(0)) return endResponses(0);
      var list = [null];
      list.push(slot(1, new LT.Response("Toilet", "Use the toilet.", "nightlife.toilets.use")));
      list.push(slot(2, new LT.Response("Wash", "Wash your hands and face.", "nightlife.toilets.wash")));
      if (hasPartner()) {
        var npc = getPartner();
        var sex = new LT.Response("Stall sex", parseWith(npc, "Pull [npc.name] into a stall."), null, function () {
          if (likesSex(npc)) startSexFrom("WATERING_HOLE_TOILETS_SEX", "nightlife.toilets.afterSex", true);
          else {
            incrementAffection(npc, -25);
            LT.game.setContent("nightlife.toilets.sexRejected");
          }
        });
        list.push(slot(3, sex));
        list.push(
          slot(
            4,
            new LT.Response("Save", parseWith(npc, "Say goodbye to [npc.name] for now."), "place.WATERING_HOLE_TOILETS", function () {
              saveClubbers();
            }).withColour(LT.Colour.GENERIC_GOOD),
          ),
        );
        list.push(
          slot(
            5,
            new LT.Response("Lose company", parseWith(npc, "Tell [npc.name] you've got to go."), "place.WATERING_HOLE_TOILETS", function () {
              removeClubbers();
            }).withColour(LT.Colour.GENERIC_BAD),
          ),
        );
      } else {
        list.push(slot(3, new LT.Response("Glory hole (use)", "Use a glory hole.", "nightlife.toilets.glory.use")));
        list.push(slot(4, new LT.Response("Glory hole (service)", "Service a glory hole.", "nightlife.toilets.glory.service")));
      }
      list.push(slot(6, new LT.Response("Posters", "Take a look at the posters.", "nightlife.toilets.posters")));
      return list;
    },
  });

  function toiletSimple(id, tag) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: "Toilets",
      secondsPassed: 60,
      chrome: { left: true, right: true },
      getContent: function () {
        return xmlNpc(tag, getPartner()) + clubberStatus(60);
      },
      getResponses: function () {
        return LT.getNode("place.WATERING_HOLE_TOILETS").getResponses();
      },
    });
  }
  toiletSimple("nightlife.toilets.use", "WATERING_HOLE_TOILETS_USE");
  toiletSimple("nightlife.toilets.wash", "WATERING_HOLE_TOILETS_WASH");
  toiletSimple("nightlife.toilets.posters", "WATERING_HOLE_TOILETS_POSTERS");
  toiletSimple("nightlife.toilets.sexRejected", "WATERING_HOLE_TOILETS_SEX_REJECTED");

  function spawnGloryPartner(opts) {
    opts = opts || {};
    var servicing = !!opts.servicing;
    var gender;
    if (typeof LT.getGenderFromUserPreferences === "function") {
      gender = servicing ? LT.getGenderFromUserPreferences(false, false) : LT.getGenderFromUserPreferences(false, true);
    } else {
      gender = servicing ? LT.Gender.FEMALE : LT.Gender.MALE;
    }
    var race = CLUB_RACES[Math.floor(Math.random() * CLUB_RACES.length)];
    var last = flags().gloryholeNpcNameDescriptor || "";
    var desc;
    var alc = 0;
    var rnd = Math.random();
    if (rnd < 0.1 && last !== "wasted") {
      desc = servicing && Math.random() < 0.5 ? "intoxicated" : "wasted";
      alc = 1;
      last = "wasted";
    } else if (Math.random() < 0.3 && last !== "drunk") {
      desc = "drunk";
      alc = 0.5;
      last = "drunk";
    } else if (Math.random() < 0.4 && last !== "tipsy") {
      desc = "tipsy";
      alc = 0.15;
      last = "tipsy";
    } else {
      desc = servicing ? (Math.random() < 0.5 ? "desperate" : "horny") : "horny";
      last = desc;
    }
    flags().gloryholeNpcNameDescriptor = last;
    var noun = race ? (gender && gender.feminine ? race.fem : race.masc) : "stranger";
    var npc = makeClubber(gender, race, servicing, { name: desc + " " + noun });
    npc.playerKnowsName = false;
    npc.alcoholLevel = alc;
    npc.getName = function () {
      return this.name;
    };
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.glory = npc;
    LT.game.npcs.partner = npc;
    LT.game.npcs.npc = npc;
    return npc;
  }

  LT.defineNode({
    id: "nightlife.toilets.glory.use",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      spawnGloryPartner({ servicing: false });
    },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_USING_GET_READY", LT.game.npcs.glory);
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "On second thoughts, you don't really want some stranger having fun with your private parts...", "place.WATERING_HOLE_TOILETS"),
        new LT.Response("Continue", "Present yourself at the glory hole.", null, function () {
          startClubSex({
            partner: LT.game.npcs.glory,
            manager: "glory_hole",
            playerDom: true,
            postSexNode: "nightlife.toilets.glory.use.after",
            startText: xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_START_USING", LT.game.npcs.glory),
          });
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.toilets.glory.use.after",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_USING_POST_SEX", LT.game.npcs.glory);
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Walk out of the stall.", "place.WATERING_HOLE_TOILETS")];
    },
  });
  LT.defineNode({
    id: "nightlife.toilets.glory.service",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      spawnGloryPartner({ servicing: true });
    },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_SERVICING_GET_READY", LT.game.npcs.glory);
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "On second thoughts, you don't really want to suck the cocks of some strangers...", "place.WATERING_HOLE_TOILETS"),
        new LT.Response("Stall", "Stay in the stall.", null, function () {
          startClubSex({
            partner: LT.game.npcs.glory,
            manager: "glory_hole",
            playerDom: false,
            postSexNode: "nightlife.toilets.glory.service.after",
            startText: xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_START_SERVICING", LT.game.npcs.glory),
          });
        }),
        new LT.Response("Public", "Do it where people can see.", null, function () {
          startClubSex({
            partner: LT.game.npcs.glory,
            manager: "glory_hole",
            playerDom: false,
            postSexNode: "nightlife.toilets.glory.service.afterPublic",
            startText: xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_START_SERVICING_PUBLIC", LT.game.npcs.glory),
          });
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.toilets.glory.service.after",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_SERVICING_POST_SEX", LT.game.npcs.glory);
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Walk out of the stall.", "place.WATERING_HOLE_TOILETS")];
    },
  });
  LT.defineNode({
    id: "nightlife.toilets.glory.service.afterPublic",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_TOILETS_GLORY_HOLE_SERVICING_POST_SEX_PUBLIC", LT.game.npcs.glory);
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Walk out of the stall.", "place.WATERING_HOLE_TOILETS")];
    },
  });

  LT.defineNode({
    id: "nightlife.toilets.afterSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var org = LT.sex && LT.sex.partner && LT.sex.partner.orgasmedThisSex;
      return xmlNpc(org ? "WATERING_HOLE_TOILETS_AFTER_SEX" : "WATERING_HOLE_TOILETS_AFTER_SEX_NO_ORGASM", getPartner()) + clubberStatus(60);
    },
    getResponses: afterSexResponses("nightlife.toilets", "WATERING_HOLE_TOILETS_AFTER_SEX_SEE_AGAIN", "WATERING_HOLE_TOILETS_AFTER_SEX_DO_NOT_SEE_AGAIN", "WATERING_HOLE_TOILETS_AFTER_SEX_DO_NOT_SEE_AGAIN_RUDE", "place.WATERING_HOLE_TOILETS"),
  });
  LT.defineNode({
    id: "nightlife.toilets.see",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return clubberStatus(60);
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_TOILETS").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.toilets.gone",
    ui: "dialogue",
    title: "Toilets",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("WATERING_HOLE_TOILETS");
    },
    getResponses: function () {
      return LT.getNode("place.WATERING_HOLE_TOILETS").getResponses();
    },
  });

  /* —— Invite home —— */
  LT.defineNode({
    id: "nightlife.home",
    ui: "dialogue",
    title: "Your Room",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("AUNT_HOME_PLAYERS_ROOM_CLUBBER_TAKEN_HOME", getPartner());
    },
    getResponses: function () {
      var npc = getPartner();
      return [
        null,
        new LT.Response("Sex (dom)", parseWith(npc, "Have sex with [npc.name], with you on top."), null, function () {
          startSexFrom("AUNT_HOME_PLAYERS_ROOM_CLUBBER_TAKEN_HOME_SEX_AS_DOM", "nightlife.home.after", true);
        }),
        new LT.Response("Sex (sub)", parseWith(npc, "Have sex with [npc.name], with [npc.herHim] on top."), null, function () {
          startSexFrom("AUNT_HOME_PLAYERS_ROOM_CLUBBER_TAKEN_HOME_SEX_AS_SUB", "nightlife.home.after", false);
        }),
        new LT.Response("Change mind", parseWith(npc, "Decide against having sex."), "nightlife.home.change", function () {
          LT.game.textStart = xmlNpc("AUNT_HOME_PLAYERS_ROOM_CLUBBER_TAKEN_HOME_CHANGE_MIND", npc);
          saveClubbers();
        }),
        new LT.Response("Change mind (rude)", parseWith(npc, "Bluntly send [npc.name] away."), "nightlife.home.change", function () {
          LT.game.textStart = xmlNpc("AUNT_HOME_PLAYERS_ROOM_CLUBBER_TAKEN_HOME_CHANGE_MIND_RUDE", npc);
          removeClubbers();
        }).withColour(LT.Colour.GENERIC_BAD),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.home.after",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var org = LT.sex && LT.sex.partner && LT.sex.partner.orgasmedThisSex;
      return xmlNpc(org ? "BACK_HOME_AFTER_CLUBBER_SEX" : "BACK_HOME_AFTER_CLUBBER_SEX_NO_ORGASM", getPartner());
    },
    getResponses: afterSexResponses("nightlife.home", "BACK_HOME_AFTER_SEX_SEE_AGAIN", "BACK_HOME_AFTER_SEX_DO_NOT_SEE_AGAIN", "BACK_HOME_AFTER_SEX_DO_NOT_SEE_AGAIN_RUDE", "place.LILAYA_HOME_ROOM_PLAYER"),
  });
  LT.defineNode({
    id: "nightlife.home.see",
    ui: "dialogue",
    title: "Your Room",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return p("You show your guest out and settle back into your room.");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Stay in your room.", "place.LILAYA_HOME_ROOM_PLAYER")];
    },
  });
  LT.defineNode({
    id: "nightlife.home.gone",
    ui: "dialogue",
    title: "Your Room",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return p("You are alone in your room again.");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Stay in your room.", "place.LILAYA_HOME_ROOM_PLAYER")];
    },
  });
  LT.defineNode({
    id: "nightlife.home.change",
    ui: "dialogue",
    title: "Your Room",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return p("The moment passes, and you are back in your room.");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Stay in your room.", "place.LILAYA_HOME_ROOM_PLAYER")];
    },
  });

  /* —— Lights Out —— */
  function lightsLeave() {
    if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_NIGHTLIFE_DISTRICT");
    LT.game.setContent("place.DOMINION_NIGHTLIFE_DISTRICT");
  }

  LT.defineNode({
    id: "place.innoxia_dominion_nightlife_lights_out_exit",
    ui: "dialogue",
    title: "Lights Out",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHannah === "function") LT.ensureHannah();
    },
    getContent: function () {
      if (!flag("lightsOutVisited")) {
        setFlag("lightsOutVisited", true);
        return lightsXml("EXIT_INITIAL_ENTRY");
      }
      return lightsXml("EXIT");
    },
    getResponses: function () {
      var list = roomTravel();
      list.push(
        new LT.Response("Leave", "Leave 'Lights Out' and head back out into the Nightlife district.", null, function () {
          lightsLeave();
        }),
      );
      return list;
    },
  });

  LT.defineNode({
    id: "place.innoxia_dominion_nightlife_lights_out_tables",
    ui: "dialogue",
    title: "tables",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("TABLES");
    },
    getResponses: function () {
      return roomTravel();
    },
  });

  LT.defineNode({
    id: "place.innoxia_dominion_nightlife_lights_out_toilets",
    ui: "dialogue",
    title: "toilets",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("TOILETS");
    },
    getResponses: function () {
      var list = roomTravel();
      list.push(new LT.Response("Toilet", "Use the toilet.", "nightlife.lights.toilets.use"));
      list.push(new LT.Response("Wash", "Wash your hands.", "nightlife.lights.toilets.wash"));
      return list;
    },
  });
  LT.defineNode({
    id: "nightlife.lights.toilets.use",
    ui: "dialogue",
    title: "toilets",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("TOILETS_USE");
    },
    getResponses: function () {
      return LT.getNode("place.innoxia_dominion_nightlife_lights_out_toilets").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.lights.toilets.wash",
    ui: "dialogue",
    title: "toilets",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("TOILETS_WASH");
    },
    getResponses: function () {
      return LT.getNode("place.innoxia_dominion_nightlife_lights_out_toilets").getResponses();
    },
  });

  var LIGHTS_DRINKS = [
    { name: "vodka", price: 100, alcohol: 0.25, slot: 6 },
    { name: "rum", price: 120, alcohol: 0.5, slot: 7 },
    { name: "whiskey", price: 120, alcohol: 0.4, slot: 8 },
    { name: "arrack", price: 180, alcohol: 0.45, slot: 9 },
    { name: "grog", price: 180, alcohol: 0.05, slot: 10 },
  ];

  function isHannahAtBar() {
    var h = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    return hasHannah() && h >= 21;
  }

  function lightsParse(tag, drinkName) {
    if (drinkName && typeof LT.addSpecialParse === "function") LT.addSpecialParse(drinkName, true);
    return lightsXml(tag);
  }

  LT.defineNode({
    id: "place.innoxia_dominion_nightlife_lights_out_bar",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHannah === "function") LT.ensureHannah();
    },
    getContent: function () {
      return lightsXml("BAR");
    },
    getResponses: function () {
      var list = roomTravel();
      list.push(new LT.Response("Sit down", "Head over to an empty seat and sit down at the bar.", "nightlife.lights.bar.sit"));
      var hannah = new LT.Response(
        "Hannah",
        isHannahAtBar() ? "Sit down next to Hannah and say hello." : "Hannah isn't here at the moment. She said that she'd be here between 21:00–00:00...",
        "nightlife.lights.hannah",
        function () {
          var h = LT.ensureHannah();
          h.alcoholLevel = 0.18;
          setFlag("innoxia_lights_out_free_drink", true);
          setFlag("innoxia_lights_out_hannah_alcohol_warning", false);
          setFlag("innoxia_lights_out_hannah_talk", false);
          setFlag("innoxia_lights_out_hannah_flirt", false);
          setFlag("innoxia_lights_out_hannah_kiss", false);
          setFlag("innoxia_lights_out_hannah_sex", false);
          setFlag("innoxia_lights_out_hannah_last_night_met", true);
          LT.game.textStart = lightsXml("BAR_HANNAH");
        },
      );
      if (!isHannahAtBar()) {
        hannah.disable("Hannah isn't here at the moment. She said that she'd be here between 21:00–00:00...");
      }
      list.push(hannah);
      return list;
    },
  });

  LT.defineNode({
    id: "nightlife.lights.bar.sit",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_SIT");
    },
    getResponses: function () {
      var list = [null];
      list.push(slot(0, new LT.Response("Leave", "Stand up and leave the bar.", "nightlife.lights.bar.leave")));
      list.push(slot(1, new LT.Response("Relax", "Relax and enjoy your time at the bar.", "nightlife.lights.bar.relax")));
      var i;
      for (i = 0; i < LIGHTS_DRINKS.length; i++) {
        (function (drink) {
          var title = drink.name.charAt(0).toUpperCase() + drink.name.slice(1) + " (" + drink.price + ")";
          var r = new LT.Response(title, "Order a shot of " + drink.name + ".", "nightlife.lights.bar.sit", function () {
            LT.game.textStart = lightsParse("BAR_SIT_DRINK", drink.name) + LT.incrementAlcoholLevel(LT.game.player, drink.alcohol) + LT.incrementMoney(-drink.price);
          }).withTime(120);
          if (LT.getMoney() < drink.price) r.disable("You can't afford a shot of " + drink.name + "...");
          list.push(slot(drink.slot, r));
        })(LIGHTS_DRINKS[i]);
      }
      return list;
    },
  });
  LT.defineNode({
    id: "nightlife.lights.bar.leave",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 30,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_SIT_LEAVE");
    },
    getResponses: function () {
      return LT.getNode("place.innoxia_dominion_nightlife_lights_out_bar").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.lights.bar.drink",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return LT.getNode("nightlife.lights.bar.sit").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.lights.bar.relax",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml(Math.random() < 0.55 ? "BAR_SIT_RELAX" : "BAR_SIT_RELAX_REJECT");
    },
    getResponses: function () {
      var list = [null, new LT.Response("Back", "Return to sitting at the bar.", "nightlife.lights.bar.sit")];
      list.push(new LT.Response("Flirt", "Flirt with the patron who approached you.", "nightlife.lights.bar.flirt"));
      return list;
    },
  });
  LT.defineNode({
    id: "nightlife.lights.bar.flirt",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      spawnGloryPartner({ servicing: false });
    },
    getContent: function () {
      return lightsXml(Math.random() < 0.6 ? "BAR_SIT_RELAX_FLIRT" : "BAR_SIT_RELAX_FLIRT_REJECT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Back", "Leave it there.", "nightlife.lights.bar.sit"),
        new LT.Response("Alleyway", "Go out to the alleyway with them.", null, function () {
          startClubSex({
            partner: LT.game.npcs.glory,
            playerDom: true,
            postSexNode: "nightlife.lights.afterAlley",
            startText: lightsXml("BAR_SIT_RELAX_FLIRT_SEX_START_ALLEYWAY"),
          });
        }),
        new LT.Response("Bedroom", "Go back to their place.", null, function () {
          startClubSex({
            partner: LT.game.npcs.glory,
            playerDom: true,
            postSexNode: "nightlife.lights.afterBedroom",
            startText: lightsXml("BAR_SIT_RELAX_FLIRT_SEX_START_BEDROOM"),
          });
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.lights.afterAlley",
    ui: "dialogue",
    title: "Alleyway",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("ONE_NIGHT_STAND_AFTER_SEX_ALLEYWAY");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Head back to the Nightlife district.", null, function () {
          lightsLeave();
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.lights.afterBedroom",
    ui: "dialogue",
    title: "Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("ONE_NIGHT_STAND_AFTER_SEX_BEDROOM");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Head back to the Nightlife district.", null, function () {
          lightsLeave();
        }),
      ];
    },
  });

  function hannahDrinkResponse(drink) {
    var free = flag("innoxia_lights_out_free_drink");
    var title = drink.name.charAt(0).toUpperCase() + drink.name.slice(1) + (free ? " (Free)" : " (" + drink.price + ")");
    var r = new LT.Response(title, free ? "Order a shot of " + drink.name + " on Hannah's tab." : "Order a shot of " + drink.name + ".", null, function () {
      var alreadyWarned = flag("innoxia_lights_out_hannah_alcohol_warning");
      LT.game.textStart = lightsParse("BAR_HANNAH_DRINK", drink.name);
      if (!flag("innoxia_lights_out_free_drink")) LT.game.textStart += LT.incrementMoney(-drink.price);
      else setFlag("innoxia_lights_out_free_drink", false);
      LT.game.textStart += LT.incrementAlcoholLevel(LT.game.player, drink.alcohol);
      if (LT.alcoholLevelValue(LT.game.player) >= 0.8) {
        if (alreadyWarned) {
          LT.game.setContent("nightlife.lights.hannah.wasted");
          return;
        }
        setFlag("innoxia_lights_out_hannah_alcohol_warning", true);
        LT.game.textStart += lightsXml("BAR_HANNAH_DRINK_WARNING");
      }
      LT.game.setContent("nightlife.lights.hannah");
    }).withTime(120);
    if (!free && LT.getMoney() < drink.price) r.disable("You can't afford a shot of " + drink.name + "...");
    return slot(drink.slot, r);
  }

  function hannahResponses() {
    var h = LT.ensureHannah();
    var list = [null];
    list.push(slot(0, new LT.Response("Leave", "Leave Hannah to her work.", "nightlife.lights.hannah.leave")));
    var talk = new LT.Response("Talk", "Talk to Hannah.", "nightlife.lights.hannah.talk", function () {
      setFlag("innoxia_lights_out_hannah_talk", true);
      LT.game.textEnd = incrementAffection(h, 5);
    });
    if (flag("innoxia_lights_out_hannah_talk")) talk.disable("You've already had a talk with Hannah tonight.");
    list.push(slot(1, talk));
    var flirt = new LT.Response("Flirt", "Flirt with Hannah.", "nightlife.lights.hannah.flirt", function () {
      setFlag("innoxia_lights_out_hannah_flirt", true);
      LT.game.textEnd = incrementAffection(h, 10);
    });
    if (!flag("innoxia_lights_out_hannah_talk")) flirt.disable("You should talk to Hannah a little first...");
    else if (flag("innoxia_lights_out_hannah_flirt")) flirt.disable("You've already flirted with Hannah tonight.");
    list.push(slot(2, flirt));
    var kiss = new LT.Response("Kiss", "Kiss Hannah.", "nightlife.lights.hannah.kiss", function () {
      setFlag("innoxia_lights_out_hannah_kiss", true);
      LT.game.textEnd = incrementAffection(h, 15);
    });
    if (!flag("innoxia_lights_out_hannah_flirt")) kiss.disable("You should flirt with Hannah a little first...");
    else if (flag("innoxia_lights_out_hannah_kiss")) kiss.disable("You've already kissed Hannah tonight.");
    list.push(slot(3, kiss));
    var alley = new LT.Response("Alleyway", "Ask Hannah to step outside with you.", null, function () {
      setFlag("innoxia_lights_out_hannah_sex", true);
      startClubSex({
        partner: h,
        playerDom: true,
        postSexNode: "nightlife.lights.hannah.afterAlley",
        startText: lightsXml("BAR_HANNAH_SEX_START_ALLEYWAY"),
      });
    });
    var bedroom = new LT.Response("Bedroom", "Go home with Hannah.", null, function () {
      setFlag("innoxia_lights_out_hannah_sex", true);
      startClubSex({
        partner: h,
        playerDom: true,
        postSexNode: "nightlife.lights.hannah.afterBedroom",
        startText: lightsXml("BAR_HANNAH_SEX_START_BEDROOM"),
      });
    });
    if (!flag("innoxia_lights_out_hannah_kiss")) {
      alley.disable("You should kiss Hannah first...");
      bedroom.disable("You should kiss Hannah first...");
    }
    list.push(slot(4, alley));
    list.push(slot(5, bedroom));
    var i;
    for (i = 0; i < LIGHTS_DRINKS.length; i++) list.push(hannahDrinkResponse(LIGHTS_DRINKS[i]));
    return list;
  }

  LT.defineNode({
    id: "nightlife.lights.hannah",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH");
    },
    getResponses: hannahResponses,
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.drink",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.alcoholLevelValue(LT.game.player) >= 0.6 ? lightsXml("BAR_HANNAH_DRINK_WARNING") : "";
    },
    getResponses: hannahResponses,
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.talk",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH_TALK");
    },
    getResponses: hannahResponses,
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.flirt",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH_FLIRT");
    },
    getResponses: hannahResponses,
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.kiss",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH_KISS");
    },
    getResponses: hannahResponses,
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.leave",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 30,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH_LEAVE");
    },
    getResponses: function () {
      return LT.getNode("place.innoxia_dominion_nightlife_lights_out_bar").getResponses();
    },
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.wasted",
    ui: "dialogue",
    title: "bar",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH_WASTED");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Let Hannah send you home.", "nightlife.lights.hannah.wasted.leave"),
        new LT.Response("Sex", "Hannah takes you somewhere more private.", null, function () {
          startClubSex({
            partner: LT.ensureHannah(),
            playerDom: false,
            postSexNode: "nightlife.lights.hannah.afterBedroom",
            startText: lightsXml("BAR_HANNAH_WASTED_SEX_START"),
          });
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.wasted.leave",
    ui: "dialogue",
    title: "Nightlife",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("BAR_HANNAH_WASTED_LEAVE");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "You are back in the Nightlife district.", null, function () {
          lightsLeave();
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.afterAlley",
    ui: "dialogue",
    title: "Alleyway",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("AFTER_SEX_ALLEYWAY");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Head back to Lights Out.", "place.innoxia_dominion_nightlife_lights_out_bar")];
    },
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.afterBedroom",
    ui: "dialogue",
    title: "Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("AFTER_SEX_BEDROOM");
    },
    getResponses: function () {
      return [null, new LT.Response("Morning", "Wake up the next morning.", "nightlife.lights.hannah.morning")];
    },
  });
  LT.defineNode({
    id: "nightlife.lights.hannah.morning",
    ui: "dialogue",
    title: "Bedroom",
    secondsPassed: 8 * 3600,
    chrome: { left: true, right: true },
    getContent: function () {
      return lightsXml("AFTER_SEX_BEDROOM_MORNING");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Head back out.", null, function () {
          lightsLeave();
        }),
      ];
    },
  });

  function domAccept(tag, affection, extra) {
    return function () {
      LT.game.textStart = (LT.game.textStart || "") + xmlNpc(tag, getPartner());
      if (extra) extra();
      if (affection) LT.game.textEnd = (LT.game.textEnd || "") + incrementDomAffection(affection);
    };
  }

  function drinkBoth(id) {
    var drink = drinkById(id);
    var html = applyDrink(LT.game.player, drink);
    if (getPartner()) html += applyDrink(getPartner(), drink);
    return html;
  }

  function leaveDomSave(tag) {
    return function () {
      LT.game.textStart = (LT.game.textStart || "") + xmlNpc(tag, getPartner());
      saveClubbers();
    };
  }

  function leaveDomLose(tag) {
    return function () {
      LT.game.textStart = (LT.game.textStart || "") + xmlNpc(tag, getPartner());
      removeClubbers();
    };
  }

  function pairResponses(acceptTitle, acceptTip, acceptTag, acceptAff, declineTitle, declineTip, declineTag, declineAff, extraAccept) {
    var npc = getPartner();
    return [
      null,
      slot(1, new LT.Response(acceptTitle, parseWith(npc, acceptTip), "nightlife.dom.react", domAccept(acceptTag, acceptAff, extraAccept))),
      slot(2, new LT.Response(declineTitle, parseWith(npc, declineTip), "nightlife.dom.react", domAccept(declineTag, declineAff))),
      slot(9, new LT.Response("Say goodbye", parseWith(npc, "Tell [npc.name] that you've got to head off for a little while, but that you hope to see [npc.herHim] again. Saves this character."), "nightlife.dom.neutral", leaveDomSave("WATERING_HOLE_DOM_PARTNER_SAVE_CLUBBER")).withColour(LT.Colour.GENERIC_GOOD)),
      slot(10, new LT.Response("Lose company", parseWith(npc, "Make up an excuse to get rid of [npc.name]. Removes this character."), "nightlife.dom.neutral", leaveDomLose("WATERING_HOLE_DOM_PARTNER_LOSE_COMPANY")).withColour(LT.Colour.GENERIC_BAD)),
    ];
  }

  function inviteResponses(followNode, gentleTag, rudeTag) {
    var npc = getPartner();
    return [
      null,
      slot(1, new LT.Response("Follow home", parseWith(npc, "Follow [npc.name] back to [npc.her] house, where [npc.sheIs] sure to want to have sex with you..."), followNode, function () {
        followDomHome();
      })),
      slot(4, new LT.Response("Refuse (gentle)", parseWith(npc, "Tell [npc.name] that you're not interested in going back to [npc.her] place, but that you hope to see [npc.herHim] at the club another time. Saves this character."), "nightlife.dom.neutral", leaveDomSave(gentleTag)).withColour(LT.Colour.GENERIC_GOOD)),
      slot(5, new LT.Response("Refuse (harsh)", parseWith(npc, "Bluntly tell [npc.name] that you have no interest whatsoever in having sex with [npc.herHim]. Removes this character."), "nightlife.dom.neutral", leaveDomLose(rudeTag)).withColour(LT.Colour.GENERIC_BAD)),
    ];
  }

  function refuseSexResponses(gentleTag, rudeTag) {
    var npc = getPartner();
    return [
      null,
      slot(4, new LT.Response("Refuse (gentle)", parseWith(npc, "Tell [npc.name] that you're not interested in having sex with [npc.herHim], but that you hope to see [npc.herHim] at the club another time. Saves this character."), "nightlife.dom.neutral", function () {
        LT.game.textEnd = xmlNpc(gentleTag, npc);
        saveClubbers();
      }).withColour(LT.Colour.GENERIC_GOOD)),
      slot(5, new LT.Response("Refuse (harsh)", parseWith(npc, "Bluntly tell [npc.name] that you have no interest whatsoever in having sex with [npc.herHim]. Removes this character."), "nightlife.dom.neutral", function () {
        LT.game.textEnd = xmlNpc(rudeTag, npc);
        removeClubbers();
      }).withColour(LT.Colour.GENERIC_BAD)),
    ];
  }

  LT.defineNode({
    id: "nightlife.dom.partner",
    ui: "dialogue",
    title: function () {
      var place = currentClubPlace();
      var info = LT.places && LT.places[place];
      return (info && info.name) || "The Watering Hole";
    },
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var behaviour = flags().clubberBehaviour || "INTRODUCTION";
      return xmlNpc("WATERING_HOLE_DOM_PARTNER_" + behaviour, getPartner()) + clubberStatus(60);
    },
    getResponses: function () {
      if (isEndConditionMet(0)) return endResponses(0);
      var behaviour = flags().clubberBehaviour || "INTRODUCTION";
      var npc = getPartner();
      var fem = !!(LT.game.player && LT.game.player.isFeminine && LT.game.player.isFeminine());
      if (behaviour === "LEAVES") {
        return [
          null,
          slot(9, new LT.Response("Say goodbye", parseWith(npc, "Tell [npc.name] that despite how you've treated [npc.herHim] this evening, you hope to see [npc.herHim] again. Saves this character."), "nightlife.dom.neutral", leaveDomSave("WATERING_HOLE_DOM_PARTNER_LEAVES_SAVE_CLUBBER")).withColour(LT.Colour.GENERIC_GOOD)),
          slot(10, new LT.Response("Lose company", parseWith(npc, "Tell [npc.name] that you don't want to see [npc.herHim] again. Removes this character."), "nightlife.dom.neutral", leaveDomLose("WATERING_HOLE_DOM_PARTNER_LEAVES_LOSE_COMPANY")).withColour(LT.Colour.GENERIC_BAD)),
        ];
      }
      if (behaviour === "BAR_DRINK") {
        if (npc && npc.selfish) {
          return [
            null,
            slot(1, new LT.Response("Accept rum", parseWith(npc, "Accept the glass of Black Rat's Rum that [npc.name] has offered you." + drinkEffects(drinkById("innoxia_race_rat_black_rats_rum"))), "nightlife.dom.react", function () {
              if (getPartner()) LT.incrementAlcoholLevel(getPartner(), -0.05);
              LT.game.textStart = xmlNpc("WATERING_HOLE_DOM_PARTNER_ACCEPT_RUM", npc) + drinkBoth("innoxia_race_rat_black_rats_rum");
              LT.game.textEnd = incrementDomAffection(15);
            })),
            slot(2, new LT.Response("Refuse rum", parseWith(npc, "Refuse the glass of Black Rat's Rum that [npc.name] has offered you."), "nightlife.dom.react", function () {
              LT.game.textStart = xmlNpc("WATERING_HOLE_DOM_PARTNER_REFUSE_RUM", npc);
              flags().clubberBuyingDrinks = false;
              LT.game.textEnd = incrementDomAffection(-15);
            })),
            slot(9, new LT.Response("Say goodbye", parseWith(npc, "Tell [npc.name] that you've got to head off. Saves this character."), "nightlife.dom.neutral", leaveDomSave("WATERING_HOLE_DOM_PARTNER_SAVE_CLUBBER")).withColour(LT.Colour.GENERIC_GOOD)),
            slot(10, new LT.Response("Lose company", parseWith(npc, "Make up an excuse to get rid of [npc.name]."), "nightlife.dom.neutral", leaveDomLose("WATERING_HOLE_DOM_PARTNER_LOSE_COMPANY")).withColour(LT.Colour.GENERIC_BAD)),
          ];
        }
        if (npc && npc.kind) {
          var kindId = fem ? "innoxia_race_cat_felines_fancy" : "innoxia_race_dog_canine_crush";
          var kindAccept = fem ? "WATERING_HOLE_DOM_PARTNER_ACCEPT_FELINES_FANCY" : "WATERING_HOLE_DOM_PARTNER_ACCEPT_BEER";
          var kindRefuse = fem ? "WATERING_HOLE_DOM_PARTNER_REFUSE_FELINES_FANCY" : "WATERING_HOLE_DOM_PARTNER_REFUSE_BEER";
          var kindTitle = fem ? "Accept Feline's Fancy" : "Accept Canine Crush";
          var kindRefuseTitle = fem ? "Refuse Feline's Fancy" : "Refuse Canine Crush";
          return [
            null,
            slot(1, new LT.Response(kindTitle, parseWith(npc, "Accept the drink that [npc.name] has offered you." + drinkEffects(drinkById(kindId))), "nightlife.dom.react", function () {
              LT.game.textStart = xmlNpc(kindAccept, npc) + drinkBoth(kindId);
              LT.game.textEnd = incrementDomAffection(15);
            })),
            slot(2, new LT.Response(kindRefuseTitle, parseWith(npc, "Refuse the drink that [npc.name] has offered you."), "nightlife.dom.react", function () {
              LT.game.textStart = xmlNpc(kindRefuse, npc) + drinkBoth("innoxia_race_human_vanilla_water");
              flags().clubberBuyingDrinks = false;
              LT.game.textEnd = incrementDomAffection(-5);
            })),
            slot(9, new LT.Response("Say goodbye", parseWith(npc, "Tell [npc.name] that you've got to head off. Saves this character."), "nightlife.dom.neutral", leaveDomSave("WATERING_HOLE_DOM_PARTNER_SAVE_CLUBBER")).withColour(LT.Colour.GENERIC_GOOD)),
            slot(10, new LT.Response("Lose company", parseWith(npc, "Make up an excuse to get rid of [npc.name]."), "nightlife.dom.neutral", leaveDomLose("WATERING_HOLE_DOM_PARTNER_LOSE_COMPANY")).withColour(LT.Colour.GENERIC_BAD)),
          ];
        }
        return [
          null,
          slot(1, new LT.Response("Accept whiskey", parseWith(npc, "Accept the glass of Wolf Whiskey that [npc.name] has offered you." + drinkEffects(drinkById("innoxia_race_wolf_wolf_whiskey"))), "nightlife.dom.react", function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_DOM_PARTNER_ACCEPT_WOLF_WHISKEY", npc) + drinkBoth("innoxia_race_wolf_wolf_whiskey");
            LT.game.textEnd = incrementDomAffection(15);
          })),
          slot(2, new LT.Response("Refuse whiskey", parseWith(npc, "Refuse the glass of Wolf Whiskey that [npc.name] has offered you."), "nightlife.dom.react", function () {
            LT.game.textStart = xmlNpc("WATERING_HOLE_DOM_PARTNER_REFUSE_WOLF_WHISKEY", npc) + drinkBoth("innoxia_race_human_vanilla_water");
            flags().clubberBuyingDrinks = false;
            LT.game.textEnd = incrementDomAffection(-10);
          })),
          slot(9, new LT.Response("Say goodbye", parseWith(npc, "Tell [npc.name] that you've got to head off. Saves this character."), "nightlife.dom.neutral", leaveDomSave("WATERING_HOLE_DOM_PARTNER_SAVE_CLUBBER")).withColour(LT.Colour.GENERIC_GOOD)),
          slot(10, new LT.Response("Lose company", parseWith(npc, "Make up an excuse to get rid of [npc.name]."), "nightlife.dom.neutral", leaveDomLose("WATERING_HOLE_DOM_PARTNER_LOSE_COMPANY")).withColour(LT.Colour.GENERIC_BAD)),
        ];
      }
      if (behaviour === "BAR_FLIRT") {
        return pairResponses("Flirt back", "Respond positively to [npc.namePos] flirtatious remarks, and flirt back with [npc.herHim].", "WATERING_HOLE_DOM_PARTNER_BAR_FLIRT_ACCEPT", 10, "Show disdain", "Respond negatively to [npc.namePos] flirtatious remarks, and tell [npc.herHim] to stop.", "WATERING_HOLE_DOM_PARTNER_BAR_FLIRT_DECLINE", -10);
      }
      if (behaviour === "BAR_GROPE") {
        return pairResponses("Submit", "Lean in against [npc.name] and let [npc.herHim] feel you up.", "WATERING_HOLE_DOM_PARTNER_BAR_GROPE_ACCEPT", 20, "Push away", "Tell [npc.name] to get away from you.", "WATERING_HOLE_DOM_PARTNER_BAR_GROPE_DECLINE", -20);
      }
      if (behaviour === "BAR_KISS") {
        return pairResponses("Kiss", "Lean in against [npc.name] and start making out with [npc.herHim].", "WATERING_HOLE_DOM_PARTNER_BAR_KISS_ACCEPT", 15, "Push away", "Push [npc.name] away and tell [npc.herHim] to keep [npc.her] [npc.lips] to [npc.herself].", "WATERING_HOLE_DOM_PARTNER_BAR_KISS_DECLINE", -15);
      }
      if (behaviour === "BAR_TALK") {
        return pairResponses("Continue conversation", "Happily continue chatting with [npc.name].", "WATERING_HOLE_DOM_PARTNER_BAR_TALK_ACCEPT", 5, "Stay silent", "Make a non-committal humming noise, before waiting for [npc.name] to continue.", "WATERING_HOLE_DOM_PARTNER_BAR_TALK_DECLINE", -5);
      }
      if (behaviour === "BAR_INVITE_HOME") {
        return inviteResponses("nightlife.dom.takenHome", "BAR_INVITE_HOME_REFUSE_GENTLE", "BAR_INVITE_HOME_REFUSE_RUDE");
      }
      if (behaviour === "DANCE") {
        return pairResponses("Dance", "Step out onto the dance floor and start dancing with [npc.name].", "WATERING_HOLE_DOM_PARTNER_DANCE_ACCEPT", 10, "Refuse", "Tell [npc.name] that you have no interest in dancing with [npc.herHim].", "WATERING_HOLE_DOM_PARTNER_DANCE_DECLINE", -10);
      }
      if (behaviour === "DANCE_GROPE") {
        return pairResponses("Submit", "Lean in against [npc.name] and let [npc.herHim] feel you up.", "WATERING_HOLE_DOM_PARTNER_DANCE_GROPE_ACCEPT", 20, "Push away", "Tell [npc.name] to get away from you.", "WATERING_HOLE_DOM_PARTNER_DANCE_GROPE_DECLINE", -20);
      }
      if (behaviour === "DANCE_KISS") {
        return pairResponses("Kiss", "Lean in against [npc.name] and start making out with [npc.herHim].", "WATERING_HOLE_DOM_PARTNER_DANCE_KISS_ACCEPT", 15, "Push away", "Push [npc.name] away and tell [npc.herHim] to keep [npc.her] [npc.lips] to [npc.herself].", "WATERING_HOLE_DOM_PARTNER_DANCE_KISS_DECLINE", -15);
      }
      if (behaviour === "SIT_DOWN_FLIRT") {
        return pairResponses("Flirt back", "Respond positively to [npc.namePos] flirtatious remarks, and flirt back with [npc.herHim].", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_FLIRT_ACCEPT", 10, "Show disdain", "Respond negatively to [npc.namePos] flirtatious remarks, and tell [npc.herHim] to stop.", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_FLIRT_DECLINE", -10);
      }
      if (behaviour === "SIT_DOWN_FOOTSIE") {
        return pairResponses("Play footsie", "Let [npc.namePos] [npc.foot] work all the way up to your groin, and start reciprocating [npc.her] flirtatious movements.", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_FOOTSIE_ACCEPT", 20, "Pull away", "Pull away from [npc.namePos] [npc.foot], before angrily telling [npc.herHim] to stop.", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_FOOTSIE_DECLINE", -20);
      }
      if (behaviour === "SIT_DOWN_KISS") {
        return pairResponses("Kiss", "Let [npc.name] start kissing you.", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_KISS_ACCEPT", 15, "Push away", "Reject [npc.namePos] attempt to kiss you and push [npc.herHim] away.", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_KISS_DECLINE", -15);
      }
      if (behaviour === "SIT_DOWN_TALK") {
        return pairResponses("Continue conversation", "Happily continue chatting with [npc.name].", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_TALK_ACCEPT", 5, "Stay silent", "Make a non-committal humming noise, before waiting for [npc.name] to continue.", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_TALK_DECLINE", -5);
      }
      if (behaviour === "SIT_DOWN_INVITE_HOME") {
        return inviteResponses("nightlife.dom.takenHome", "SIT_DOWN_INVITE_HOME_REFUSE_GENTLE", "SIT_DOWN_INVITE_HOME_REFUSE_RUDE");
      }
      if (behaviour === "SIT_DOWN_SEX") {
        var sexList = refuseSexResponses("WATERING_HOLE_DOM_PARTNER_SIT_DOWN_SEX_REFUSE_GENTLE", "WATERING_HOLE_DOM_PARTNER_SIT_DOWN_SEX_REFUSE_RUDE");
        sexList.splice(
          1,
          0,
          slot(
            1,
            new LT.Response("Sex (sub)", parseWith(npc, "Do as [npc.name] says and start having submissive sex with [npc.herHim]."), null, function () {
              startClubSex({
                partner: npc,
                playerDom: false,
                postSexNode: "nightlife.seating.afterSex",
                startText: xmlNpc("WATERING_HOLE_DOM_PARTNER_SIT_DOWN_SEX_START", npc),
                positionName: "Sitting",
              });
            }),
          ),
        );
        return sexList;
      }
      if (behaviour === "TOILETS") {
        var toiletList = refuseSexResponses("WATERING_HOLE_DOM_PARTNER_TOILETS_SEX_START_REFUSE_GENTLE", "WATERING_HOLE_DOM_PARTNER_TOILETS_SEX_START_REFUSE_RUDE");
        toiletList.splice(
          1,
          0,
          slot(
            1,
            new LT.Response("Stall sex", parseWith(npc, "Let [npc.name] fuck you in one of the toilet's stalls."), null, function () {
              startClubSex({
                partner: npc,
                playerDom: false,
                postSexNode: "nightlife.dom.toilets.after",
                startText: xmlNpc("WATERING_HOLE_DOM_PARTNER_TOILETS_SEX_START", npc),
              });
            }),
          ),
        );
        return toiletList;
      }
      return pairResponses("Continue", "See what [npc.name] does next.", "WATERING_HOLE_DOM_PARTNER_BAR_TALK_ACCEPT", 5, "Stay silent", "Wait for [npc.name] to continue.", "WATERING_HOLE_DOM_PARTNER_BAR_TALK_DECLINE", -5);
    },
  });

  LT.defineNode({
    id: "nightlife.dom.react",
    ui: "dialogue",
    title: function () {
      var place = currentClubPlace();
      var info = LT.places && LT.places[place];
      return (info && info.name) || "The Watering Hole";
    },
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return clubberStatus(300);
    },
    getResponses: function () {
      return domReactResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.dom.neutral",
    ui: "dialogue",
    title: "The Watering Hole",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return LT.getNode(currentPlaceNode()).getResponses();
    },
  });

  LT.defineNode({
    id: "nightlife.dom.takenHome",
    ui: "dialogue",
    title: function () {
      return parseWith(getPartner(), "[npc.NamePos] Apartment");
    },
    secondsPassed: 1800,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xmlNpc("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME", getPartner());
    },
    getResponses: function () {
      var npc = getPartner();
      return [
        null,
        slot(1, new LT.Response("Sex", parseWith(npc, "Have submissive sex with [npc.name]."), null, function () {
          startClubSex({
            partner: npc,
            playerDom: false,
            postSexNode: "nightlife.dom.takenHome.after",
            startText: xmlNpc("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_SEX", npc),
          });
        })),
        slot(4, new LT.Response("Refuse", parseWith(npc, "Tell [npc.name] that you don't really want to go back to [npc.her] place to have sex... Saves this character."), "nightlife.dom.street", function () {
          LT.game.textEnd = xmlNpc("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_CHANGE_MIND", npc);
          saveClubbers();
        }).withColour(LT.Colour.GENERIC_GOOD)),
        slot(5, new LT.Response("Angrily refuse", parseWith(npc, "Tell [npc.name] that this isn't at all the sort of thing you were thinking of! Removes this character."), "nightlife.dom.street", function () {
          LT.game.textEnd = xmlNpc("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_CHANGE_MIND_RUDE", npc);
          removeClubbers();
        }).withColour(LT.Colour.GENERIC_BAD)),
      ];
    },
  });

  LT.defineNode({
    id: "nightlife.dom.takenHome.after",
    ui: "dialogue",
    title: function () {
      return parseWith(getPartner(), "[npc.NamePos] Apartment");
    },
    secondsPassed: 900,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var org = LT.sex && LT.sex.partner && LT.sex.partner.orgasmedThisSex;
      return xmlNpc(org ? "WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_AFTER_SEX" : "WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_AFTER_SEX_NO_ORGASM", getPartner());
    },
    getResponses: function () {
      var npc = getPartner();
      return [
        null,
        slot(1, new LT.Response("See again", parseWith(npc, "Tell [npc.name] that you hope to see [npc.herHim] again. Saves this character."), "nightlife.dom.street", leaveDomSave("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_AFTER_SEX_SEE_AGAIN")).withColour(LT.Colour.GENERIC_GOOD)),
        slot(2, new LT.Response("Hope not (gentle)", parseWith(npc, "Make a non-committal response, secretly hoping that you won't see [npc.name] again. Removes this character."), "nightlife.dom.street", leaveDomLose("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_AFTER_SEX_DO_NOT_SEE_AGAIN")).withColour(LT.Colour.GENERIC_BAD)),
        slot(3, new LT.Response("Hope not (harsh)", parseWith(npc, "Crudely tell [npc.name] that you were only interested in fucking [npc.herHim]. Removes this character."), "nightlife.dom.street", leaveDomLose("WATERING_HOLE_DOM_PARTNER_TAKEN_HOME_AFTER_SEX_DO_NOT_SEE_AGAIN_RUDE")).withColour(LT.Colour.GENERIC_BAD)),
      ];
    },
  });

  LT.defineNode({
    id: "nightlife.dom.street",
    ui: "dialogue",
    title: "Dominion Boulevard",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_BOULEVARD");
      if (LT.hasNode("place.DOMINION_BOULEVARD")) return LT.getNode("place.DOMINION_BOULEVARD").getResponses();
      return [null, new LT.Response("Continue", "You are back out on the streets of Dominion.", "place.DOMINION_NIGHTLIFE_DISTRICT")];
    },
  });

  LT.defineNode({
    id: "nightlife.dom.toilets.after",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var org = LT.sex && LT.sex.partner && LT.sex.partner.orgasmedThisSex;
      return xmlNpc(org ? "WATERING_HOLE_DOM_PARTNER_TOILETS_AFTER_SEX" : "WATERING_HOLE_DOM_PARTNER_TOILETS_AFTER_SEX_NO_ORGASM", getPartner());
    },
    getResponses: function () {
      var npc = getPartner();
      return [
        null,
        slot(1, new LT.Response("See again", parseWith(npc, "Tell [npc.name] that you hope to see [npc.herHim] again. Saves this character."), "place.WATERING_HOLE_TOILETS", leaveDomSave("WATERING_HOLE_DOM_PARTNER_TOILETS_AFTER_SEX_SEE_AGAIN")).withColour(LT.Colour.GENERIC_GOOD)),
        slot(2, new LT.Response("Hope not (gentle)", parseWith(npc, "Make a non-committal response, secretly hoping that you won't see [npc.name] again. Removes this character."), "place.WATERING_HOLE_TOILETS", leaveDomLose("WATERING_HOLE_DOM_PARTNER_TOILETS_AFTER_SEX_DO_NOT_SEE_AGAIN")).withColour(LT.Colour.GENERIC_BAD)),
        slot(3, new LT.Response("Hope not (harsh)", parseWith(npc, "Crudely tell [npc.name] that you were only interested in fucking [npc.herHim]. Removes this character."), "place.WATERING_HOLE_TOILETS", leaveDomLose("WATERING_HOLE_DOM_PARTNER_TOILETS_AFTER_SEX_DO_NOT_SEE_AGAIN_RUDE")).withColour(LT.Colour.GENERIC_BAD)),
      ];
    },
  });

  LT.nightlife = {
    drinks: DRINKS,
    lightsDrinks: LIGHTS_DRINKS,
    races: CLUB_RACES,
    getPartner: getPartner,
    syncClubberPresent: syncClubberPresent,
    saveClubbers: saveClubbers,
    removeClubbers: removeClubbers,
    likesKiss: likesKiss,
    likesGroping: likesGroping,
    likesSex: likesSex,
    resetDomBehaviour: resetDomBehaviour,
    pickClubberBehaviour: pickClubberBehaviour,
    applyBehaviourEffects: applyBehaviourEffects,
    incrementDomAffection: incrementDomAffection,
    isPartnerOfferingDrinks: isPartnerOfferingDrinks,
  };
})();
