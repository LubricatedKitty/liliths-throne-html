(function () {
  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var RACES = [
    { id: "HUMAN", name: "human", fem: "human", masc: "human" },
    { id: "CAT_MORPH", name: "cat-morph", fem: "cat-girl", masc: "cat-boy" },
    { id: "DOG_MORPH", name: "dog-morph", fem: "dog-girl", masc: "dog-boy" },
    { id: "WOLF_MORPH", name: "wolf-morph", fem: "wolf-girl", masc: "wolf-boy" },
    { id: "FOX_MORPH", name: "fox-morph", fem: "fox-girl", masc: "fox-boy" },
    { id: "HORSE_MORPH", name: "horse-morph", fem: "horse-girl", masc: "horse-boy" },
    { id: "HARPY", name: "harpy", fem: "harpy", masc: "harpy" },
    { id: "DEMON", name: "demon", fem: "demoness", masc: "demon" },
  ];
  var ORIENTATIONS = ["ANDROPHILIC", "AMBIPHILIC", "GYNEPHILIC"];
  var TRAITS = ["CONFIDENT", "SHY", "KIND", "SELFISH", "NAIVE", "CYNICAL", "BRAVE", "COWARDLY", "LEWD", "INNOCENT", "PRUDE"];
  var FETISHES = ["SUBMISSIVE", "DOMINANT", "BIMBO", "PREGNANCY", "CUM_STUD", "CUM_ADDICT", "ORAL_RECEIVING", "ORAL_GIVING"];
  var HAIR = ["blonde", "brown", "black", "red", "white", "pink"];
  var EYES = ["blue", "green", "brown", "hazel", "amber", "grey"];
  var HAIR_LEN = [
    { id: "ZERO_BALD", name: "bald" },
    { id: "ONE_VERY_SHORT", name: "very short" },
    { id: "TWO_SHORT", name: "short" },
    { id: "THREE_SHOULDER", name: "shoulder-length" },
    { id: "FOUR_LONG", name: "long" },
    { id: "FIVE_VERY_LONG", name: "very long" },
  ];
  var CUPS = ["FLAT", "AA", "A", "B", "C", "D", "DD", "E", "F", "G"];
  var SIZES = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"];

  function boutique(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/helenasBoutique", tag);
  }

  function dayNow() {
    return typeof LT.dayNumber === "function" ? LT.dayNumber() : 1;
  }

  function helena() {
    return typeof LT.ensureHelena === "function" ? LT.ensureHelena() : LT.game.npcs && LT.game.npcs.helena;
  }

  function intToString(n) {
    n = Math.abs(n | 0);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + intToString(n % 100) : "");
    if (n < 100000) {
      var rest = n % 1000;
      return intToString(Math.floor(n / 1000)) + " thousand" + (rest ? (rest < 100 ? " and " : ", ") + intToString(rest) : "");
    }
    return String(n);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function raceOf(id) {
    var i;
    for (i = 0; i < RACES.length; i++) if (RACES[i].id === id) return RACES[i];
    return RACES[0];
  }

  function fullRaceName(feminine, raceId) {
    var race = raceOf(raceId);
    return feminine ? race.fem : race.masc;
  }

  function attachSlave(npc) {
    npc.getName = npc.getName || function () {
      return this.name;
    };
    npc.getFullName = npc.getFullName || function () {
      return this.surname ? this.name + " " + this.surname : this.name;
    };
    npc.isFeminine = npc.isFeminine || function () {
      return !!this.feminine;
    };
    npc.getSpeechColour = npc.getSpeechColour || function () {
      return this.speechColour || (this.feminine ? LT.Colour.FEMININE : LT.Colour.MASCULINE);
    };
    npc.getRaceName = npc.getRaceName || function () {
      return this.fullRace || this.raceName || "human";
    };
    npc.hasVagina = npc.hasVagina || function () {
      return !!(this.gender && this.gender.hasVagina);
    };
    npc.hasPenis = npc.hasPenis || function () {
      return !!(this.gender && this.gender.hasPenis);
    };
    npc.hasBreasts = npc.hasBreasts || function () {
      return !!(this.gender && this.gender.hasBreasts);
    };
    npc.hasFetish = npc.hasFetish || function (id) {
      return !!(this.fetishes && this.fetishes[id]);
    };
    npc.hasPersonalityTrait = npc.hasPersonalityTrait || function (id) {
      return !!(this.personality && this.personality[id]);
    };
    return npc;
  }

  function applyRace(slave, raceId) {
    var race = raceOf(raceId);
    var fem = !!slave.feminine;
    slave.raceName = race.id;
    slave.fullRace = fullRaceName(fem, race.id);
    if (typeof LT.createBody === "function") {
      var prev = slave.body || {};
      slave.body = LT.createBody({
        feminine: fem,
        hasPenis: slave.hasPenis ? slave.hasPenis() : !fem,
        hasVagina: slave.hasVagina ? slave.hasVagina() : fem,
        hasBreasts: slave.hasBreasts ? slave.hasBreasts() : fem,
        height: prev.height,
        femininity: prev.femininity,
        bodySize: prev.bodySize,
        muscle: prev.muscle,
        race: race.id,
        breastSize: prev.breast && prev.breast.size,
        assSize: prev.ass && prev.ass.size,
        hipSize: prev.ass && prev.ass.hipSize,
        hair: slave.hairColour,
      });
    }
    return slave;
  }

  LT.getHelenaCustomSlave = function () {
    var h = helena();
    if (!h || !h.slavesOwned || !h.slavesOwned.length) return null;
    return h.slavesOwned[0];
  };

  LT.helenaCustomSlaveDaysLeft = function () {
    if (!LT.getHelenaCustomSlave()) return 0;
    var ordered = LT.game.flags.helenaSlaveOrderDay;
    if (ordered == null || ordered < 0) return 0;
    return Math.max(0, 7 - (dayNow() - ordered));
  };

  LT.helenaCustomSlaveRaceWeight = function (slave) {
    slave = slave || LT.getHelenaCustomSlave();
    if (!slave || !slave.body) return slave && slave.raceName && slave.raceName !== "HUMAN" ? 5 : 0;
    var counts = {};
    var keys = ["face", "torso", "arm", "leg", "ass", "breast", "eye", "hair", "ear", "tail", "wing", "penis", "vagina"];
    var i;
    for (i = 0; i < keys.length; i++) {
      var part = slave.body[keys[i]];
      var type = part && part.type;
      if (!type || type === "NONE" || type === "HUMAN") continue;
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  };

  LT.helenaCustomSlaveValue = function (asSlime) {
    var slave = LT.getHelenaCustomSlave();
    if (!slave) return 0;
    var value = 25000;
    var weights = LT.helenaCustomSlaveRaceWeight(slave);
    var race;
    for (race in weights) {
      if (!Object.prototype.hasOwnProperty.call(weights, race)) continue;
      value += Math.min(5000, 1000 * weights[race]);
    }
    if (asSlime) value += 5000;
    return value;
  };

  LT.banishHelenaCustomSlave = function () {
    var h = helena();
    var slave = LT.getHelenaCustomSlave();
    if (h) h.slavesOwned = [];
    if (slave && LT.game.npcs && LT.game.npcs[slave.id]) delete LT.game.npcs[slave.id];
    if (LT.game.npcs) delete LT.game.npcs.npc;
    LT.bodyChangingTarget = null;
    return slave;
  };

  LT.generateHelenaStartingSlave = function (gender) {
    LT.banishHelenaCustomSlave();
    gender = gender || LT.Gender.FEMALE;
    var fem = !!(gender.feminine || gender.id && gender.id.charAt(0) === "F");
    var trip = typeof LT.randomHumanNameTriplet === "function" ? LT.randomHumanNameTriplet() : ["Alex", "Alex", "Alex"];
    var name = fem ? trip[2] || trip[1] || trip[0] : trip[0];
    var surname = typeof LT.randomHumanSurname === "function" ? LT.randomHumanSurname() : "Smith";
    var playerName = LT.game.player && (LT.game.player.getName ? LT.game.player.getName() : LT.game.player.name);
    var slave = attachSlave({
      id: "helenaSlave_" + Math.random().toString(36).slice(2, 8),
      name: name,
      surname: surname,
      petName: playerName || "Master",
      feminine: fem,
      gender: gender,
      raceName: "HUMAN",
      fullRace: "human",
      unique: false,
      customHelena: true,
      playerKnowsName: true,
      affection: 0,
      obedience: 0,
      appearedAge: 18,
      orientation: (LT.Orientation && LT.Orientation.AMBIPHILIC) || { id: "AMBIPHILIC" },
      personality: { KIND: true },
      fetishes: {},
      speechColour: fem ? LT.Colour.FEMININE : LT.Colour.MASCULINE,
      hairColour: fem ? "blonde" : "brown",
      eyeColour: "brown",
      hairLength: fem ? "FOUR_LONG" : "TWO_SHORT",
      makeup: {},
      piercings: {},
      sex: { vaginaVirgin: true, penisVirgin: true, assVirgin: true },
      location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" },
    });
    applyRace(slave, "HUMAN");
    var h = helena();
    if (h) h.slavesOwned = [slave];
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs[slave.id] = slave;
    LT.game.npcs.npc = slave;
    LT.bodyChangingTarget = slave;
    LT.game.flags.helenaSlaveOrderDay = -1;
    return slave;
  };

  function parseSlave(html) {
    var slave = LT.getHelenaCustomSlave();
    if (!slave) return html;
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.npc = slave;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: slave }, function () {
        return html;
      });
    }
    return html;
  }

  function boutiqueSlave(tag) {
    var slave = LT.getHelenaCustomSlave();
    LT.game.npcs = LT.game.npcs || {};
    if (slave) LT.game.npcs.npc = slave;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: slave }, function () {
        return boutique(tag);
      });
    }
    return boutique(tag);
  }

  function pill(active, act, label, colour) {
    var c = colour || "#dddddd";
    if (active) {
      return '<div class="cosmetics-button active"><span style="color:' + c + ';">' + label + "</span></div>";
    }
    return '<div data-helena-slave="' + act + '" class="cosmetics-button"><span style="color:' + c + ';opacity:0.55;">' + label + "</span></div>";
  }

  function box(title, inner) {
    return '<div class="container-full-width" style="text-align:center;padding:8px;"><p style="margin:0;"><b>' + title + "</b></p>" + inner + "</div>";
  }

  function summary(slave) {
    if (!slave) return "";
    var traits = [];
    var id;
    for (id in slave.personality || {}) if (slave.personality[id]) traits.push(id.toLowerCase());
    var fetish = [];
    for (id in slave.fetishes || {}) if (slave.fetishes[id]) fetish.push(id.toLowerCase().replace(/_/g, " "));
    var cost = LT.helenaCustomSlaveValue(false);
    return (
      "<p>Current order: <b>" +
      slave.getFullName() +
      "</b> (" +
      (slave.appearedAge || 18) +
      "), " +
      ((slave.orientation && slave.orientation.name) || "ambiphilic") +
      " " +
      slave.fullRace +
      ". Personality: " +
      (traits.join(", ") || "kind") +
      ". Obedience " +
      (slave.obedience || 0) +
      ", affection " +
      (slave.affection || 0) +
      (fetish.length ? ". Fetishes: " + fetish.join(", ") : "") +
      ". Base cost <b>" +
      cost +
      "</b> flames.</p>"
    );
  }

  function nameForm(slave) {
    if (!slave) return "";
    return (
      box(
        "Name / Surname / What they call you",
        '<div style="margin:6px 0;">' +
          pill(false, "nameRandom", "Random name") +
          pill(false, "surnameRandom", "Random surname") +
          "</div><p style='margin:4px 0;'><b>" +
          slave.name +
          " " +
          (slave.surname || "") +
          "</b> will address you as <b>" +
          (slave.petName || "Master") +
          "</b>.</p>" +
          pill(slave.petName === "Master", "pet:Master", "Master") +
          pill(slave.petName === "Mistress", "pet:Mistress", "Mistress") +
          pill(LT.game.player && slave.petName === (LT.game.player.getName ? LT.game.player.getName() : LT.game.player.name), "pet:player", LT.game.player ? LT.game.player.getName ? LT.game.player.getName() : LT.game.player.name : "You"),
      ) +
      box(
        "Age appearance",
        pill(false, "age:-5", "−−") +
          pill(false, "age:-1", "−") +
          " <b>" +
          (slave.appearedAge || 18) +
          "</b> " +
          pill(false, "age:1", "+") +
          pill(false, "age:5", "++"),
      ) +
      box(
        "Orientation",
        ORIENTATIONS.map(function (id) {
          var o = LT.Orientation && LT.Orientation[id];
          return pill(slave.orientation && slave.orientation.id === id, "orient:" + id, o ? o.name : id.toLowerCase(), o && o.colour);
        }).join(""),
      ) +
      box(
        "Personality",
        TRAITS.map(function (id) {
          var t = null;
          var i;
          for (i = 0; i < (LT.PERSONALITY || []).length; i++) if (LT.PERSONALITY[i].id === id) t = LT.PERSONALITY[i];
          return pill(!!(slave.personality && slave.personality[id]), "trait:" + id, t ? t.name : id.toLowerCase(), t && t.colour);
        }).join(""),
      ) +
      box(
        "Obedience",
        pill((slave.obedience || 0) < -30, "obe:-50", "Disobedient", LT.Colour.GENERIC_BAD) +
          pill((slave.obedience || 0) >= -30 && (slave.obedience || 0) < 30, "obe:0", "Neutral") +
          pill((slave.obedience || 0) >= 30, "obe:50", "Obedient", LT.Colour.GENERIC_GOOD),
      ) +
      box(
        "Affection",
        pill((slave.affection || 0) < -30, "aff:-50", "Dislike", LT.Colour.GENERIC_BAD) +
          pill((slave.affection || 0) >= -30 && (slave.affection || 0) < 30, "aff:0", "Neutral") +
          pill((slave.affection || 0) >= 30, "aff:50", "Like", LT.Colour.GENERIC_GOOD),
      ) +
      box(
        "Fetishes",
        FETISHES.map(function (id) {
          return pill(!!(slave.fetishes && slave.fetishes[id]), "fetish:" + id, id.toLowerCase().replace(/_/g, " "));
        }).join(""),
      )
    );
  }

  function bodyForm(slave) {
    if (!slave) return "";
    var b = slave.body || {};
    return (
      box(
        "Race",
        RACES.map(function (r) {
          return pill(slave.raceName === r.id, "race:" + r.id, r.name);
        }).join(""),
      ) +
      box(
        "Height / Femininity",
        pill(false, "height:-5", "Shorter") +
          " <b>" +
          ((b.height || (slave.feminine ? 168 : 178)) + " cm") +
          "</b> " +
          pill(false, "height:5", "Taller") +
          "<br/>" +
          pill(false, "fem:-10", "More masculine") +
          " <b>" +
          (b.femininity != null ? b.femininity : slave.feminine ? 70 : 30) +
          "</b> " +
          pill(false, "fem:10", "More feminine"),
      ) +
      summary(slave)
    );
  }

  function eyesForm(slave) {
    return box(
      "Eye colour",
      EYES.map(function (c) {
        return pill(slave.eyeColour === c, "eye:" + c, c);
      }).join(""),
    );
  }

  function hairForm(slave) {
    return (
      box(
        "Hair colour",
        HAIR.map(function (c) {
          return pill(slave.hairColour === c, "hair:" + c, c);
        }).join(""),
      ) +
      box(
        "Hair length",
        HAIR_LEN.map(function (h) {
          return pill(slave.hairLength === h.id, "hairLen:" + h.id, h.name);
        }).join(""),
      )
    );
  }

  function headForm(slave) {
    var lip = slave.body && slave.body.face && slave.body.face.lipSize;
    return box(
      "Lip size",
      ["ONE_AVERAGE", "TWO_FULL", "THREE_PLUMP", "FOUR_HUGE"]
        .map(function (id) {
          return pill(lip === id, "lips:" + id, id.toLowerCase().replace(/_/g, " "));
        })
        .join(""),
    );
  }

  function assForm(slave) {
    var size = slave.body && slave.body.ass && slave.body.ass.size;
    var hip = slave.body && slave.body.ass && slave.body.ass.hipSize;
    return (
      box(
        "Ass size",
        SIZES.map(function (id) {
          return pill(size === id || size === id + "_AVERAGE", "ass:" + id, id.toLowerCase());
        }).join(""),
      ) +
      box(
        "Hip size",
        SIZES.map(function (id) {
          return pill(hip === id, "hips:" + id, id.toLowerCase());
        }).join(""),
      )
    );
  }

  function breastsForm(slave) {
    var size = slave.body && slave.body.breast && slave.body.breast.size;
    return box(
      "Breast size",
      CUPS.map(function (id) {
        return pill(size === id, "cup:" + id, id);
      }).join(""),
    );
  }

  function vaginaForm(slave) {
    var has = slave.hasVagina && slave.hasVagina();
    return box("Vagina", pill(has, "vag:1", "Present", LT.Colour.FEMININE) + pill(!has, "vag:0", "None", LT.Colour.GENERIC_BAD));
  }

  function penisForm(slave) {
    var has = slave.hasPenis && slave.hasPenis();
    return box("Penis", pill(has, "pen:1", "Present", LT.Colour.MASCULINE) + pill(!has, "pen:0", "None", LT.Colour.GENERIC_BAD));
  }

  function makeupForm(slave) {
    slave.makeup = slave.makeup || {};
    return box(
      "Makeup",
      pill(!!slave.makeup.lipstick, "makeup:lipstick", "Lipstick") +
        pill(!!slave.makeup.eyeliner, "makeup:eyeliner", "Eyeliner") +
        pill(!!slave.makeup.eyeshadow, "makeup:eyeshadow", "Eye shadow") +
        pill(!!slave.makeup.blusher, "makeup:blusher", "Blusher") +
        pill(!!slave.makeup.nails, "makeup:nails", "Nail polish"),
    );
  }

  function piercingForm(slave) {
    slave.piercings = slave.piercings || {};
    return box(
      "Piercings",
      (LT.PIERCING_SLOTS || ["ear", "nose", "lip", "navel", "nipple"]).map(function (slot) {
        return pill(!!slave.piercings[slot], "pierce:" + slot, slot);
      }).join(""),
    );
  }

  function finishForm(slave) {
    var virgin = !!(slave.sex && slave.sex.vaginaVirgin && slave.sex.penisVirgin);
    var cost = LT.helenaCustomSlaveValue(false);
    var slime = LT.helenaCustomSlaveValue(true);
    return (
      '<div class="container-full-width" style="text-align:center;"><i>More sexual experience will result in your slave gaining more corruption.</i></div>' +
      box("Sexual experience", pill(virgin, "sex:virgin", "Virgin") + pill(!virgin, "sex:experienced", "Experienced")) +
      "<p style='text-align:center;'><b>" +
      slave.getFullName() +
      "'s Appearance</b><br/>" +
      slave.appearedAge +
      "-year-old " +
      ((slave.orientation && slave.orientation.name) || "ambiphilic") +
      " " +
      slave.fullRace +
      ", " +
      (slave.body && slave.body.height ? slave.body.height + " cm tall" : "") +
      ".</p>" +
      "<p style='text-align:center;'>Order: <b>" +
      cost +
      "</b> flames. Slime special: <b>" +
      slime +
      "</b> flames.</p>"
    );
  }

  function applyAct(act) {
    var slave = LT.getHelenaCustomSlave();
    if (!slave || !act) return false;
    var parts = act.split(":");
    var kind = parts[0];
    var arg = parts.slice(1).join(":");
    if (kind === "nameRandom") {
      var trip = typeof LT.randomHumanNameTriplet === "function" ? LT.randomHumanNameTriplet() : ["Alex", "Alex", "Alex"];
      slave.name = slave.feminine ? trip[2] || trip[1] || trip[0] : trip[0];
    } else if (kind === "surnameRandom") {
      slave.surname = typeof LT.randomHumanSurname === "function" ? LT.randomHumanSurname() : "Smith";
    } else if (kind === "pet") {
      slave.petName = arg === "player" && LT.game.player ? (LT.game.player.getName ? LT.game.player.getName() : LT.game.player.name) : arg;
    } else if (kind === "age") {
      slave.appearedAge = Math.max(18, Math.min(50, (slave.appearedAge || 18) + Number(arg)));
    } else if (kind === "orient" && LT.Orientation && LT.Orientation[arg]) {
      slave.orientation = LT.Orientation[arg];
    } else if (kind === "trait") {
      slave.personality = slave.personality || {};
      var on = !slave.personality[arg];
      var i;
      for (i = 0; i < (LT.PERSONALITY || []).length; i++) {
        if (LT.PERSONALITY[i].id === arg && LT.PERSONALITY[i].exclusive) {
          LT.PERSONALITY[i].exclusive.forEach(function (ex) {
            delete slave.personality[ex];
          });
        }
      }
      if (on) slave.personality[arg] = true;
      else delete slave.personality[arg];
    } else if (kind === "obe") {
      slave.obedience = Number(arg);
    } else if (kind === "aff") {
      slave.affection = Number(arg);
    } else if (kind === "fetish") {
      slave.fetishes = slave.fetishes || {};
      if (slave.fetishes[arg]) delete slave.fetishes[arg];
      else slave.fetishes[arg] = true;
    } else if (kind === "race") {
      applyRace(slave, arg);
    } else if (kind === "height" && slave.body) {
      slave.body.height = Math.max(122, Math.min(366, (slave.body.height || 168) + Number(arg)));
    } else if (kind === "fem") {
      slave.body = slave.body || {};
      slave.body.femininity = Math.max(0, Math.min(100, (slave.body.femininity != null ? slave.body.femininity : 50) + Number(arg)));
      slave.feminine = slave.body.femininity >= 50;
      slave.speechColour = slave.feminine ? LT.Colour.FEMININE : LT.Colour.MASCULINE;
      slave.fullRace = fullRaceName(slave.feminine, slave.raceName);
    } else if (kind === "eye") {
      slave.eyeColour = arg;
    } else if (kind === "hair") {
      slave.hairColour = arg;
    } else if (kind === "hairLen") {
      slave.hairLength = arg;
    } else if (kind === "lips" && slave.body && slave.body.face) {
      slave.body.face.lipSize = arg;
    } else if (kind === "ass" && slave.body && slave.body.ass) {
      slave.body.ass.size = arg;
    } else if (kind === "hips" && slave.body && slave.body.ass) {
      slave.body.ass.hipSize = arg;
    } else if (kind === "cup" && slave.body && slave.body.breast) {
      slave.body.breast.size = arg;
    } else if (kind === "vag") {
      slave.gender = arg === "1" ? (slave.hasPenis && slave.hasPenis() ? LT.Gender.F_P_V_B_FUTANARI || LT.Gender.FEMALE : LT.Gender.FEMALE) : slave.hasPenis && slave.hasPenis() ? LT.Gender.MALE : LT.Gender.F_B_DOLL || LT.Gender.FEMALE;
      if (slave.body && slave.body.vagina) slave.body.vagina.type = arg === "1" ? slave.raceName || "HUMAN" : "NONE";
    } else if (kind === "pen") {
      slave.gender = arg === "1" ? (slave.hasVagina && slave.hasVagina() ? LT.Gender.F_P_V_B_FUTANARI || LT.Gender.MALE : LT.Gender.MALE) : slave.hasVagina && slave.hasVagina() ? LT.Gender.FEMALE : LT.Gender.MALE;
      if (slave.body && slave.body.penis) slave.body.penis.type = arg === "1" ? slave.raceName || "HUMAN" : "NONE";
    } else if (kind === "makeup") {
      slave.makeup = slave.makeup || {};
      slave.makeup[arg] = !slave.makeup[arg];
    } else if (kind === "pierce") {
      slave.piercings = slave.piercings || {};
      slave.piercings[arg] = !slave.piercings[arg];
    } else if (kind === "sex") {
      slave.sex = slave.sex || {};
      var virgin = arg === "virgin";
      slave.sex.vaginaVirgin = virgin;
      slave.sex.penisVirgin = virgin;
      slave.sex.assVirgin = virgin;
    } else {
      return false;
    }
    return true;
  }

  function designerResponses(current) {
    var list = [
      new LT.Response("Cancel", "Decide against ordering a custom slave from Helena.", "helena.romanceShop", function () {
        LT.banishHelenaCustomSlave();
      }),
    ];
    function tab(id, title, tip, node) {
      if (current === id) list.push(new LT.Response(title, "You are already customising this.", null).disable("You are already customising this."));
      else list.push(new LT.Response(title, tip, node));
    }
    tab("personality", "Personality", "Customise aspects of your slave's personality.", "helena.customSlavePersonality");
    tab("body", "Body", "Customise core aspects of your slave's body.", "helena.customSlaveBody");
    tab("eyes", "Eyes", "Customise aspects of your slave's eyes.", "helena.customSlaveEyes");
    tab("hair", "Hair", "Customise aspects of your slave's hair.", "helena.customSlaveHair");
    tab("head", "Head", "Customise aspects of your slave's head and face.", "helena.customSlaveHead");
    tab("ass", "Ass", "Customise aspects of your slave's hips and ass.", "helena.customSlaveAss");
    tab("breasts", "Breasts", "Customise aspects of your slave's breasts.", "helena.customSlaveBreasts");
    tab("vagina", "Vagina", "Customise aspects of your slave's vagina.", "helena.customSlaveVagina");
    tab("penis", "Penis", "Customise aspects of your slave's penis.", "helena.customSlavePenis");
    list.push(new LT.Response("Spinneret", "Your slave does not have a spinneret!<br/><i>Spinnerets are gained via certain tail or leg types.</i>", null).disable("Your slave does not have a spinneret."));
    list.push(new LT.Response("Crotch-boobs", "Change aspects of your slave's crotch-boobs.", "helena.customSlaveBreasts"));
    tab("makeup", "Makeup", "Customise your slave's makeup.", "helena.customSlaveMakeup");
    tab("piercings", "Piercings", "Customise your slave's piercings.", "helena.customSlavePiercings");
    list.push(
      new LT.Response("Finalise order", "Tell Helena that you've completed the ordering forms, and see how much this is going to cost you...", "helena.customSlaveFinish").withColour(
        LT.Colour.GENERIC_MINOR_GOOD || LT.Colour.GENERIC_GOOD,
      ),
    );
    return list;
  }

  function defineDesigner(id, title, tag, extraFn, current) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 10,
      travelDisabled: true,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        var slave = LT.getHelenaCustomSlave();
        if (slave) {
          LT.game.npcs.npc = slave;
          LT.bodyChangingTarget = slave;
        }
      },
      getContent: function () {
        var slave = LT.getHelenaCustomSlave();
        return boutique(tag) + (extraFn && slave ? extraFn(slave) : "") + (current === "personality" && slave ? summary(slave) : "");
      },
      getResponses: function () {
        return designerResponses(current);
      },
    });
  }

  LT.helenaShopCompleteContent = function () {
    var html = boutique("ROMANCE_SHOP_CORE");
    var friday = typeof LT.isFridayEvening === "function" ? LT.isFridayEvening() : false;
    var slave = LT.getHelenaCustomSlave();
    var ordered = LT.game.flags && LT.game.flags.helenaSlaveOrderDay;
    if (friday) {
      html += boutique("ROMANCE_SHOP_CORE_END_DATE");
    } else if (slave && ordered != null && ordered >= 0) {
      var days = LT.helenaCustomSlaveDaysLeft();
      if (days > 0) {
        var ready = typeof LT.gameNow === "function" ? LT.gameNow() : new Date();
        ready = new Date(ready.getTime());
        ready.setDate(ready.getDate() + days);
        if (typeof LT.addSpecialParse === "function") {
          LT.addSpecialParse(intToString(days), true);
          LT.addSpecialParse(WEEKDAYS[ready.getDay()], false);
        }
        html += boutique("ROMANCE_SHOP_CORE_END_CUSTOM_SLAVE_PROGRESS");
      } else {
        html += boutique("ROMANCE_SHOP_CORE_END_CUSTOM_SLAVE_READY");
      }
    } else {
      html += boutique("ROMANCE_SHOP_CORE_END");
    }
    return html;
  };

  LT.helenaCustomSlaveResponse = function () {
    var slave = LT.getHelenaCustomSlave();
    var ordered = LT.game.flags && LT.game.flags.helenaSlaveOrderDay;
    if (slave && ordered != null && ordered >= 0) {
      var days = LT.helenaCustomSlaveDaysLeft();
      if (days > 0) {
        return new LT.Response(
          "Collect slave",
          "Your custom slave is in the process of being trained and transformed, and won't be ready for collection for another " + intToString(days) + " days.",
          null,
        ).disable("Your custom slave is in the process of being trained and transformed, and won't be ready for collection for another " + intToString(days) + " days.");
      }
      return new LT.Response("Collect slave", "Tell Helena that you're ready to take delivery of your custom slave.", "helena.customSlaveDelivery");
    }
    return new LT.Response("Custom slave", "Ask Helena about ordering a custom slave.", "helena.customSlaveStart");
  };

  LT.defineNode({
    id: "helena.customSlaveStart",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return boutique("HELENAS_SHOP_CUSTOM_SLAVE_START");
    },
    getResponses: function () {
      return [
        new LT.Response("Back out", "Decide against ordering a custom slave from Helena.", "helena.customSlaveDeclined"),
        new LT.Response("Female template", "Start designing your custom slave, using a human female as a starting point.", "helena.customSlavePersonality", function () {
          LT.generateHelenaStartingSlave(LT.Gender.FEMALE);
        }).withColour(LT.Colour.FEMININE),
        new LT.Response("Male template", "Start designing your custom slave, using a human male as a starting point.", "helena.customSlavePersonality", function () {
          LT.generateHelenaStartingSlave(LT.Gender.MALE);
        }).withColour(LT.Colour.MASCULINE),
      ];
    },
  });

  LT.defineNode({
    id: "helena.customSlaveDeclined",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return boutique("HELENAS_SHOP_CUSTOM_SLAVE_DECLINED");
    },
    getResponses: function () {
      return LT.getNode("helena.romanceShop").getResponses(LT.game, 0);
    },
  });

  defineDesigner("helena.customSlavePersonality", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_PERSONALITY", nameForm, "personality");
  defineDesigner("helena.customSlaveBody", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_CORE", bodyForm, "body");
  defineDesigner("helena.customSlaveEyes", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_EYES", eyesForm, "eyes");
  defineDesigner("helena.customSlaveHair", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_HAIR", hairForm, "hair");
  defineDesigner("helena.customSlaveHead", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_HEAD", headForm, "head");
  defineDesigner("helena.customSlaveAss", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_ASS", assForm, "ass");
  defineDesigner("helena.customSlaveBreasts", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_BREASTS", breastsForm, "breasts");
  defineDesigner("helena.customSlaveVagina", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_VAGINA", vaginaForm, "vagina");
  defineDesigner("helena.customSlavePenis", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_PENIS", penisForm, "penis");
  defineDesigner("helena.customSlaveMakeup", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_MAKEUP", makeupForm, "makeup");
  defineDesigner("helena.customSlavePiercings", "Customise Slave", "HELENAS_SHOP_CUSTOM_SLAVE_BODY_PIERCINGS", piercingForm, "piercings");

  LT.defineNode({
    id: "helena.customSlaveFinish",
    ui: "dialogue",
    title: "Order Slave",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var cost = LT.helenaCustomSlaveValue(false);
      if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(intToString(cost), true);
    },
    getContent: function () {
      var slave = LT.getHelenaCustomSlave();
      var cost = LT.helenaCustomSlaveValue(false);
      if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(intToString(cost), true);
      return boutique("HELENAS_SHOP_CUSTOM_SLAVE_FINISH") + (slave ? finishForm(slave) : "");
    },
    getResponses: function () {
      var cost = LT.helenaCustomSlaveValue(false);
      var slime = LT.helenaCustomSlaveValue(true);
      var money = typeof LT.getMoney === "function" ? LT.getMoney() : (LT.game.player && LT.game.player.money) || 0;
      var list = [new LT.Response("Back", "Go back and make some changes...", "helena.customSlavePersonality")];
      if (money < cost) {
        list.push(new LT.Response("Order (" + cost + ")", "You cannot afford to order the slave, as you only have " + intToString(money) + " flames.", null).disable("You cannot afford to order the slave."));
      } else {
        list.push(
          new LT.Response("Order (" + cost + ")", "Tell Helena that you'd like to order the slave for " + intToString(cost) + " flames.", "helena.customSlaveOrder", function () {
            placeOrder(false);
          }),
        );
      }
      if (money < slime) {
        list.push(new LT.Response("Slime special (" + slime + ")", "You cannot afford to order the slime special, as you only have " + intToString(money) + " flames.", null).disable("You cannot afford to order the slime special."));
      } else {
        list.push(
          new LT.Response("Slime special (" + slime + ")", "Tell Helena that you'd like to order the slave, with the 'slime special' treatment, for " + intToString(slime) + " flames.", "helena.customSlaveOrder", function () {
            placeOrder(true);
          }),
        );
      }
      return list;
    },
  });

  function readyWeekday() {
    var dt = typeof LT.gameNow === "function" ? LT.gameNow() : new Date();
    var copy = new Date(dt.getTime());
    copy.setDate(copy.getDate() + 7);
    return WEEKDAYS[copy.getDay()];
  }

  function placeOrder(asSlime) {
    var cost = LT.helenaCustomSlaveValue(asSlime);
    var slave = LT.getHelenaCustomSlave();
    if (asSlime && slave) {
      slave.body = slave.body || {};
      slave.body.bodyMaterial = "SLIME";
      slave.fullRace = "slime " + (slave.fullRace || "human");
    }
    if (typeof LT.addSpecialParse === "function") {
      LT.addSpecialParse(intToString(cost), true);
      LT.addSpecialParse(readyWeekday(), false);
    }
    LT.game.textStart = boutique(asSlime ? "HELENAS_SHOP_CUSTOM_SLAVE_ORDER_SLIME" : "HELENAS_SHOP_CUSTOM_SLAVE_ORDER") + boutique("HELENAS_SHOP_CUSTOM_SLAVE_ORDER_END");
    LT.game.flags.helenaSlaveOrderDay = dayNow();
    LT.game.textEnd = typeof LT.incrementMoney === "function" ? LT.incrementMoney(-cost) : "";
  }

  LT.defineNode({
    id: "helena.customSlaveOrder",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return LT.getNode("helena.romanceShop").getResponses(LT.game, 0);
    },
  });

  LT.defineNode({
    id: "helena.customSlaveDelivery",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var slave = LT.getHelenaCustomSlave();
      if (slave) {
        slave.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
        LT.game.npcs.npc = slave;
      }
    },
    getContent: function () {
      return boutiqueSlave("HELENAS_SHOP_CUSTOM_SLAVE_DELIVERY");
    },
    getResponses: function () {
      var slave = LT.getHelenaCustomSlave();
      return [
        null,
        new LT.Response("Respond", slave ? "Respond in the positive to " + slave.name + "'s question." : "Respond.", "helena.customSlaveDeliveryEnd", function () {
          deliverSlave();
        }),
      ];
    },
  });

  function deliverSlave() {
    var slave = LT.getHelenaCustomSlave();
    if (!slave) return;
    LT.game.npcs.npc = slave;
    slave.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" };
    if (typeof LT.takeOwnership === "function") LT.takeOwnership(slave);
    if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(slave.name, true);
    LT.game.textStart = boutiqueSlave("HELENAS_SHOP_CUSTOM_SLAVE_DELIVERY_END");
    var h = helena();
    if (h) h.slavesOwned = [];
    LT.game.flags.helenaSlaveOrderDay = -1;
  }

  LT.defineNode({
    id: "helena.customSlaveDeliveryEnd",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return LT.getNode("helena.romanceShop").getResponses(LT.game, 0);
    },
  });

  LT.defineNode({
    id: "helena.shopTalk",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return boutique("HELENAS_SHOP_TALK");
    },
    getResponses: function () {
      return LT.getNode("helena.romanceShop").getResponses(LT.game, 0);
    },
  });

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", function (e) {
      var stage = document.getElementById("ui-stage");
      if (!stage || !stage.contains(e.target)) return;
      var btn = e.target.closest("[data-helena-slave]");
      if (!btn) return;
      if (!applyAct(btn.getAttribute("data-helena-slave"))) return;
      if (LT.game && LT.game.currentNode) LT.game.setContent(LT.game.currentNode);
    });
  }

  LT._helenaBoutiqueApply = applyAct;
  LT._helenaIntToString = intToString;
})();
