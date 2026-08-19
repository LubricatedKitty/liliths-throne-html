(function () {
  function hour() {
    var s = ((LT.game.secondsPassed % 86400) + 86400) % 86400;
    return Math.floor(s / 3600);
  }

  LT.isWorkTime = function () {
    var h = hour();
    return h >= 6 && h < 22;
  };

  LT.isOfficeHours = function () {
    var h = hour();
    return h >= 9 && h <= 17;
  };

  LT.hourOfDay = hour;

  function applyHouseNpc(existing, opts) {
    var n = existing || {};
    n.id = n.id || opts.id;
    n.name = n.name || opts.name;
    n.feminine = true;
    n.raceName = n.raceName || opts.raceName;
    n.speechColour = n.speechColour || opts.speechColour;
    n.relationToPlayer = n.relationToPlayer || opts.relationToPlayer || "";
    if (!n.location || typeof n.location !== "object") n.location = opts.location;
    n.getName = n.getName || function () {
      return this.name;
    };
    n.isFeminine = n.isFeminine || function () {
      return true;
    };
    n.getSpeechColour = n.getSpeechColour || function () {
      return this.speechColour;
    };
    n.getRaceName = n.getRaceName || function () {
      return this.raceName;
    };
    n.gender = n.gender || LT.Gender.FEMALE;
    n.hasVagina = n.hasVagina || function () {
      return !!(this.gender && this.gender.hasVagina);
    };
    n.hasPenis = n.hasPenis || function () {
      return !!(this.gender && this.gender.hasPenis);
    };
    n.hasBreasts = n.hasBreasts || function () {
      return !!(this.gender && this.gender.hasBreasts);
    };
    if (!n.sex) n.sex = { vaginaVirgin: false, penisVirgin: true };
    return n;
  }

  LT.ensureHouseNpcs = function () {
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.lilaya = applyHouseNpc(LT.game.npcs.lilaya, {
      id: "lilaya",
      name: "Lilaya",
      raceName: "demon",
      speechColour: "#ff66a3",
      relationToPlayer: "aunt",
      location: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" },
    });
    LT.game.npcs.lilaya.fuckableNipples = true;
    LT.game.npcs.lilaya.fetishDesire = LT.game.npcs.lilaya.fetishDesire || {};
    if (LT.game.npcs.lilaya.fetishDesire.FETISH_PREGNANCY == null) {
      LT.game.npcs.lilaya.fetishDesire.FETISH_PREGNANCY = "ZERO_HATE";
    }
    LT.game.npcs.rose = applyHouseNpc(LT.game.npcs.rose, {
      id: "rose",
      name: "Rose",
      raceName: "cat-girl",
      speechColour: "#ff8cb3",
      relationToPlayer: "maid",
      location: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" },
    });
    LT.updateHouseNpcLocations();
    if (LT.game.started && typeof LT.markCharacterEncountered === "function") {
      LT.markCharacterEncountered("lilaya");
      LT.markCharacterEncountered("rose");
    }
    return LT.game.npcs;
  };

  LT.updateHouseNpcLocations = function () {
    var lilaya = LT.game.npcs && LT.game.npcs.lilaya;
    var rose = LT.game.npcs && LT.game.npcs.rose;
    if (!lilaya || !rose) return;
    if (LT.isWorkTime()) {
      lilaya.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" };
      rose.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" };
    } else {
      lilaya.location = { world: "LILAYAS_HOUSE_FIRST_FLOOR", place: "LILAYA_HOME_ROOM_ROSE" };
      rose.location = { world: "LILAYAS_HOUSE_FIRST_FLOOR", place: "LILAYA_HOME_ROOM_ROSE" };
    }
  };

  LT.ensureFelicia = function () {
    LT.game.npcs = LT.game.npcs || {};
    var existing = LT.game.npcs.felicia;
    var n = applyHouseNpc(existing, {
      id: "felicia",
      name: "Felicia",
      raceName: "dog-girl",
      speechColour: LT.Colour.FEMININE,
      relationToPlayer: "",
      location: null,
    });
    n.surname = n.surname || "Delilah-Hope Renmorre";
    n.heightValue = n.heightValue || "157 centimetres";
    n.eyeColour = n.eyeColour || "brown";
    n.cupSize = n.cupSize || "C";
    n.playerKnowsName = !!(LT.game.flags && LT.game.flags.knowsFelicia);
    n.getName = function () {
      return this.playerKnowsName ? "Felicia" : "the dog-girl";
    };
    n.getFullName = function () {
      return this.playerKnowsName ? "Felicia Delilah-Hope Renmorre" : "the dog-girl";
    };
    LT.game.npcs.felicia = n;
    return n;
  };

  LT.ensureScarlett = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.scarlett) {
      var n = applyHouseNpc(null, {
        id: "scarlett",
        name: "Scarlett",
        raceName: "harpy",
        speechColour: "#FF94BD",
        location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" },
      });
      n.surname = "Kardos";
      n.penisSize = "a small";
      n.feminine = false;
      n.gender = LT.Gender.M_P_MALE;
      n.penisPresent = true;
      n.vaginaPresent = false;
      n.affection = n.affection || 0;
      n.orientation = LT.Orientation.GYNEPHILIC;
      n.sex = { vaginaVirgin: true, assVirgin: true, penisVirgin: false };
      n.isFeminine = function () {
        return false;
      };
      n.hasPenis = function () {
        return this.penisPresent !== false;
      };
      n.hasVagina = function () {
        return !!this.vaginaPresent;
      };
      n.isLikesPlayer = function () {
        return (this.affection || 0) >= 30;
      };
      n.isAttractedTo = function () {
        return typeof LT.isAttractedToPlayer === "function" ? LT.isAttractedToPlayer(this) : true;
      };
      n.getFullName = function () {
        return "Scarlett Kardos";
      };
      LT.game.npcs.scarlett = n;
    }
    var s = LT.game.npcs.scarlett;
    s.gender = s.gender && s.gender.hasPenis ? s.gender : LT.Gender.M_P_MALE;
    if (s.penisPresent == null) s.penisPresent = true;
    if (s.affection == null) s.affection = 0;
    if (!s.orientation) s.orientation = LT.Orientation.GYNEPHILIC;
    s.isLikesPlayer = s.isLikesPlayer || function () {
      return (this.affection || 0) >= 30;
    };
    s.isAttractedTo = s.isAttractedTo || function () {
      return typeof LT.isAttractedToPlayer === "function" ? LT.isAttractedToPlayer(this) : true;
    };
    s.hasPenis = s.hasPenis || function () {
      return this.penisPresent !== false;
    };
    var romance = LT.game.flags && LT.game.flags.helenaRomance;
    if (LT.game.flags && LT.game.flags.keptScarlett) {
      s.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" };
    } else if (romance === "complete") {
      s.location = LT.isWorkTime && LT.isWorkTime() ? { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" } : null;
    } else if (LT.game.flags && LT.game.flags.helenaScarlettToldToReturn) {
      s.location = LT.isWorkTime && LT.isWorkTime() ? { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" } : null;
    } else if (LT.game.flags && LT.game.flags.freedScarlett) {
      s.location = { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" };
    } else if (LT.isWorkTime && LT.isWorkTime()) {
      s.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
    } else {
      s.location = null;
    }
    return s;
  };

  LT.ensureHelena = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.helena) {
      LT.game.npcs.helena = applyHouseNpc(null, {
        id: "helena",
        name: "Helena",
        raceName: "harpy",
        speechColour: "#FFDFB3",
        location: null,
      });
      LT.game.npcs.helena.surname = "Labelle";
      LT.game.npcs.helena.eyeColour = "blue";
      LT.game.npcs.helena.affection = LT.game.npcs.helena.affection || 0;
      LT.game.npcs.helena.sex = { vaginaVirgin: true, assVirgin: true, penisVirgin: true };
      LT.game.npcs.helena.isSlutty = function () {
        var sex = this.sex || {};
        return !(sex.vaginaVirgin && sex.assVirgin);
      };
    }
    var h = LT.game.npcs.helena;
    if (!h.sex) h.sex = { vaginaVirgin: true, assVirgin: true, penisVirgin: true };
    if (h.sex.assVirgin == null) h.sex.assVirgin = true;
    h.isSlutty = h.isSlutty || function () {
      var sex = this.sex || {};
      return !(sex.vaginaVirgin && sex.assVirgin);
    };
    h.hasFetish = h.hasFetish || function (id) {
      return !!(this.fetishes && this.fetishes[id]);
    };
    return h;
  };

  LT.ensureNatalya = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.natalya) {
      LT.game.npcs.natalya = applyHouseNpc(null, {
        id: "natalya",
        name: "Natalya",
        raceName: "succubus",
        speechColour: "#c060ff",
        location: null,
      });
      LT.game.npcs.natalya.penisPresent = true;
      LT.game.npcs.natalya.hasPenis = function () {
        return true;
      };
      LT.game.npcs.natalya.affection = 0;
    }
    return LT.game.npcs.natalya;
  };

  LT.feminiseScarlett = function () {
    var s = LT.ensureScarlett();
    if (!s) return s;
    s.feminine = true;
    s.gender = LT.Gender.F_V_B_FEMALE;
    s.penisPresent = false;
    s.vaginaPresent = true;
    s.isFeminine = function () {
      return true;
    };
    s.hasPenis = function () {
      return false;
    };
    s.hasVagina = function () {
      return true;
    };
    return s;
  };

  LT.ensureCandi = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.candi) {
      LT.game.npcs.candi = applyHouseNpc(null, {
        id: "candi",
        name: "Candi",
        raceName: "cat-girl",
        speechColour: LT.Colour.FEMININE,
        location: null,
      });
    }
    var c = LT.game.npcs.candi;
    if (LT.isOfficeHours && LT.isOfficeHours()) {
      c.location = { world: "ENFORCER_HQ", place: "ENFORCER_HQ_RECEPTION_DESK" };
    } else {
      c.location = null;
    }
    return c;
  };

  LT.ensureFinch = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.finch) {
      LT.game.npcs.finch = {
        id: "finch",
        name: "Finch",
        surname: "Moreno",
        feminine: false,
        raceName: "cat-boy",
        speechColour: LT.Colour.MASCULINE,
        eyeColour: "green",
        location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" },
        getName: function () {
          return "Finch";
        },
        isFeminine: function () {
          return false;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        getFullName: function () {
          return "Finch Moreno";
        },
        getRaceName: function () {
          return this.raceName;
        },
      };
    }
    LT.game.npcs.finch.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" };
    return LT.game.npcs.finch;
  };

  LT.ensureAmber = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.amber) {
      LT.game.npcs.amber = {
        id: "amber",
        name: "Amber",
        surname: "Lireceamartu",
        feminine: true,
        raceName: "succubus",
        fullRace: "succubus",
        speechColour: "#ffb347",
        eyeColour: "amber",
        level: 15,
        lootMoney: 5000,
        physique: 16,
        arcane: 25,
        playerKnowsName: false,
        location: null,
        getName: function () {
          return this.playerKnowsName ? "Amber" : "the succubus maid";
        },
        getFullName: function () {
          return this.playerKnowsName ? "Amber Lireceamartu" : this.getName();
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        getRaceName: function () {
          return this.fullRace;
        },
        gender: LT.Gender.FEMALE,
        hasVagina: function () {
          return true;
        },
        hasPenis: function () {
          return true;
        },
        hasBreasts: function () {
          return true;
        },
        sex: { vaginaVirgin: false, penisVirgin: false },
        fuckableNipples: true,
      };
    }
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.npcs.amber);
    LT.game.npcs.amber.fuckableNipples = true;
    if (typeof LT.equipOfficialLoadout === "function" && !LT.game.npcs.amber.mainWeapon) {
      LT.equipOfficialLoadout("amber", LT.game.npcs.amber);
    }
    if (typeof LT.dressUniqueNpc === "function") LT.dressUniqueNpc("amber", LT.game.npcs.amber);
    if (!LT.game.npcs.amber.knownSpells) {
      LT.game.npcs.amber.knownSpells = ["ICE_SHARD", "FLASH", "ARCANE_AROUSAL"];
    }
    return LT.game.npcs.amber;
  };

  function simpleNpc(id, name, feminine, extras) {
    var n = {
      id: id,
      name: name,
      feminine: feminine,
      speechColour: feminine ? LT.Colour.FEMININE : LT.Colour.ANDROGYNOUS,
      gender: feminine ? LT.Gender.FEMALE : LT.Gender.ANDROGYNOUS,
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
      hasVagina: function () {
        return !!(this.gender && this.gender.hasVagina);
      },
      hasPenis: function () {
        return !!(this.gender && this.gender.hasPenis);
      },
      hasBreasts: function () {
        return !!(this.gender && this.gender.hasBreasts);
      },
      getRaceName: function () {
        return this.fullRace || this.raceName || (this.feminine ? "girl" : "boy");
      },
    };
    var k;
    if (extras) for (k in extras) if (Object.prototype.hasOwnProperty.call(extras, k)) n[k] = extras[k];
    return n;
  }

  LT.ensureNyan = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.nyan) LT.game.npcs.nyan = simpleNpc("nyan", "Nyan", true, { fullRace: "cat-girl" });
    return LT.game.npcs.nyan;
  };
  LT.ensureKate = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.kate) LT.game.npcs.kate = simpleNpc("kate", "Kate", true, { fullRace: "succubus" });
    return LT.game.npcs.kate;
  };
  LT.ensureAshley = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.ashley) {
      LT.game.npcs.ashley = simpleNpc("ashley", "Ashley", false, {
        fullRace: "human",
        gender: LT.Gender.FEMALE,
        feminine: false,
        speechColour: LT.Colour.ANDROGYNOUS || "#b39ddb",
      });
    }
    return LT.game.npcs.ashley;
  };
  LT.ensureBunny = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.bunny) LT.game.npcs.bunny = simpleNpc("bunny", "Bunny", true, { fullRace: "rabbit-girl" });
    return LT.game.npcs.bunny;
  };
  LT.ensureLoppy = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.loppy) LT.game.npcs.loppy = simpleNpc("loppy", "Loppy", true, { fullRace: "rabbit-girl" });
    return LT.game.npcs.loppy;
  };

  LT.ensureJules = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.jules) {
      LT.game.npcs.jules = simpleNpc("jules", "Jules", false, {
        fullRace: "zebra-boy",
        raceName: "horse-morph",
        gender: LT.Gender.MALE,
        speechColour: LT.Colour.MASCULINE,
      });
    }
    return LT.game.npcs.jules;
  };

  LT.ensureKay = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.kay) {
      LT.game.npcs.kay = simpleNpc("kay", "Kay", false, {
        fullRace: "cat-boy",
        raceName: "cat-morph",
        gender: LT.Gender.MALE,
        speechColour: "#b39ddb",
        heightValue: "five-foot-four",
        bodyShape: "slender",
      });
    }
    return LT.game.npcs.kay;
  };
  LT.ensureKalahari = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.kalahari) {
      LT.game.npcs.kalahari = simpleNpc("kalahari", "Kalahari", true, {
        fullRace: "lioness",
        raceName: "cat-morph",
        gender: LT.Gender.FEMALE,
        speechColour: LT.Colour.FEMININE,
        affection: 0,
      });
    }
    return LT.game.npcs.kalahari;
  };
  LT.ensureKruger = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.kruger) {
      LT.game.npcs.kruger = simpleNpc("kruger", "Kruger", false, {
        fullRace: "lion",
        raceName: "cat-morph",
        gender: LT.Gender.MALE,
        speechColour: LT.Colour.MASCULINE,
        affection: 0,
      });
    }
    return LT.game.npcs.kruger;
  };
  LT.ensureHannah = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.hannah) {
      LT.game.npcs.hannah = simpleNpc("hannah", "Hannah", true, {
        fullRace: "hyena-girl",
        raceName: "hyena-morph",
        gender: LT.Gender.FEMALE,
        speechColour: LT.Colour.FEMININE,
        affection: 0,
      });
    }
    return LT.game.npcs.hannah;
  };

  LT.ensureRalph = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.ralph) {
      LT.game.npcs.ralph = simpleNpc("ralph", "Ralph", false, {
        fullRace: "horse-boy",
        raceName: "horse-morph",
        gender: LT.Gender.MALE,
        speechColour: LT.Colour.MASCULINE,
        affection: 0,
      });
    }
    var n = LT.game.npcs.ralph;
    if (typeof LT.isWorkTime === "function" && LT.isWorkTime()) {
      n.location = { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_RALPHS_SHOP" };
    } else {
      n.location = null;
    }
    return n;
  };

  LT.ensurePix = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.pix) {
      LT.game.npcs.pix = simpleNpc("pix", "Pix", true, {
        fullRace: "border-collie-girl",
        raceName: "dog-morph",
        gender: LT.Gender.FEMALE,
        speechColour: "#f4d35e",
        affection: 0,
      });
    }
    var n = LT.game.npcs.pix;
    if (typeof LT.isWorkTime === "function" && LT.isWorkTime()) {
      n.location = { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_PIXS_GYM" };
    } else {
      n.location = null;
    }
    return n;
  };

  LT.ensureSean = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.sean) {
      LT.game.npcs.sean = simpleNpc("sean", "Sean", false, {
        fullRace: "wolf-boy",
        raceName: "wolf-morph",
        gender: LT.Gender.MALE,
        speechColour: LT.Colour.MASCULINE,
        eyeColour: "light blue",
        heightValue: "six feet two inches",
        affection: 0,
      });
    }
    LT.game.npcs.sean.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_PUBLIC_STOCKS" };
    return LT.game.npcs.sean;
  };

  LT.ensureAngel = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.angel) {
      LT.game.npcs.angel = {
        id: "angel",
        name: "Angel",
        feminine: true,
        raceName: "human",
        fullRace: "human",
        speechColour: LT.Colour.FEMININE,
        getName: function () {
          return "Angel";
        },
        getFullName: function () {
          return "Angel";
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
      };
    }
    return LT.game.npcs.angel;
  };

  LT.ensureKatherine = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.katherine) {
      LT.game.npcs.katherine = {
        id: "katherine",
        name: "Katherine",
        feminine: true,
        raceName: "succubus",
        fullRace: "succubus",
        speechColour: "#ff8cb3",
        level: 10,
        physique: 12,
        arcane: 18,
        playerKnowsName: false,
        location: { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_MAID" },
        getName: function () {
          return this.playerKnowsName ? "Katherine" : "the succubus maid";
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        gender: LT.Gender.FEMALE,
        hasVagina: function () {
          return true;
        },
        hasPenis: function () {
          return true;
        },
        hasBreasts: function () {
          return true;
        },
      };
    }
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.npcs.katherine);
    return LT.game.npcs.katherine;
  };

  LT.ensureKelly = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.kelly) {
      LT.game.npcs.kelly = {
        id: "kelly",
        name: "Kelly",
        feminine: true,
        raceName: "succubus",
        speechColour: "#ff8cb3",
        level: 10,
        physique: 12,
        arcane: 18,
        playerKnowsName: true,
        location: { world: "ZARANIX_HOUSE_FIRST_FLOOR", place: "ZARANIX_FF_MAID" },
        getName: function () {
          return "Kelly";
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        gender: LT.Gender.FEMALE,
        hasVagina: function () {
          return true;
        },
        hasPenis: function () {
          return true;
        },
        hasBreasts: function () {
          return true;
        },
      };
    }
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.npcs.kelly);
    return LT.game.npcs.kelly;
  };

  LT.ensureZaranix = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.zaranix) {
      LT.game.npcs.zaranix = {
        id: "zaranix",
        name: "Zaranix",
        surname: "Lyniximartu",
        feminine: false,
        raceName: "incubus",
        fullRace: "incubus",
        speechColour: "#b98cff",
        level: 15,
        lootMoney: 8000,
        physique: 20,
        arcane: 30,
        playerKnowsName: true,
        location: { world: "ZARANIX_HOUSE_FIRST_FLOOR", place: "ZARANIX_FF_OFFICE" },
        getName: function () {
          return "Zaranix";
        },
        getFullName: function () {
          return "Zaranix Lyniximartu";
        },
        isFeminine: function () {
          return false;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        getRaceName: function () {
          return this.fullRace;
        },
        gender: LT.Gender.MALE,
        hasVagina: function () {
          return false;
        },
        hasPenis: function () {
          return true;
        },
        hasBreasts: function () {
          return false;
        },
      };
    }
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.npcs.zaranix);
    if (typeof LT.dressUniqueNpc === "function") LT.dressUniqueNpc("zaranix", LT.game.npcs.zaranix);
    return LT.game.npcs.zaranix;
  };

  LT.ensureArthur = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.arthur) {
      LT.game.npcs.arthur = {
        id: "arthur",
        name: "Arthur",
        feminine: false,
        raceName: "human",
        getName: function () {
          return "Arthur";
        },
        getFullName: function () {
          return "Arthur";
        },
        isFeminine: function () {
          return false;
        },
        getSpeechColour: function () {
          return LT.Colour.MASCULINE;
        },
      };
    }
    return LT.game.npcs.arthur;
  };

  function ensureHarpy(id, extras) {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs[id]) {
      LT.game.npcs[id] = {
        id: id,
        name: extras.name,
        surname: extras.surname || "",
        feminine: extras.feminine !== false,
        raceName: "harpy",
        fullRace: "harpy",
        speechColour: extras.speechColour || "#ff8cb3",
        level: extras.level || 7,
        physique: extras.physique || 12,
        arcane: extras.arcane || 10,
        playerKnowsName: extras.playerKnowsName !== false,
        location: extras.location || null,
        getName: function () {
          return this.name;
        },
        getFullName: function () {
          return this.surname ? this.name + " " + this.surname : this.name;
        },
        isFeminine: function () {
          return !!this.feminine;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        getRaceName: function () {
          return "harpy";
        },
        isAttractedTo: function () {
          return true;
        },
        gender: extras.gender || LT.Gender.FEMALE,
        hasVagina: function () {
          return !!(this.gender && this.gender.hasVagina);
        },
        hasPenis: function () {
          return !!(this.gender && this.gender.hasPenis);
        },
        hasBreasts: function () {
          return !!(this.gender && this.gender.hasBreasts);
        },
      };
    }
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.npcs[id]);
    return LT.game.npcs[id];
  }

  LT.ensureBrittany = function () {
    return ensureHarpy("brittany", {
      name: "Brittany",
      surname: "Blomgren",
      level: 7,
      speechColour: "#ffe066",
      location: { world: "HARPY_NEST", place: "HARPY_NESTS_HARPY_NEST_YELLOW" },
    });
  };
  LT.ensureLauren = function () {
    return ensureHarpy("lauren", {
      name: "Lauren",
      surname: "Nystrom",
      level: 5,
      speechColour: "#ffe066",
      location: { world: "HARPY_NEST", place: "HARPY_NESTS_HARPY_NEST_YELLOW" },
    });
  };
  LT.ensureDiana = function () {
    return ensureHarpy("diana", {
      name: "Diana",
      surname: "Zima",
      level: 7,
      speechColour: "#e74c3c",
      location: { world: "HARPY_NEST", place: "HARPY_NESTS_HARPY_NEST_RED" },
    });
  };
  LT.ensureHarley = function () {
    return ensureHarpy("harley", {
      name: "Harley",
      surname: "Orlov",
      feminine: false,
      gender: LT.Gender.MALE,
      level: 5,
      speechColour: "#e74c3c",
      location: { world: "HARPY_NEST", place: "HARPY_NESTS_HARPY_NEST_RED" },
    });
  };
  LT.ensureLexi = function () {
    return ensureHarpy("lexi", {
      name: "Lexi",
      surname: "Holub",
      level: 7,
      speechColour: "#ff8cb3",
      location: { world: "HARPY_NEST", place: "HARPY_NESTS_HARPY_NEST_PINK" },
    });
  };
  LT.ensureMax = function () {
    return ensureHarpy("max", {
      name: "Max",
      surname: "Maly",
      feminine: false,
      gender: LT.Gender.MALE,
      level: 5,
      speechColour: "#ff8cb3",
      location: { world: "HARPY_NEST", place: "HARPY_NESTS_HARPY_NEST_PINK" },
    });
  };

  LT.ensureBrax = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.brax) {
      LT.game.npcs.brax = {
        id: "brax",
        name: "Brax",
        surname: "Volkov",
        feminine: false,
        raceName: "wolf-boy",
        speechColour: "#ADB4FF",
        level: 10,
        lootMoney: 2500,
        lootItems: [],
        lootEssences: 8,
        physique: 15,
        arcane: 10,
        getName: function () {
          return "Brax";
        },
        isFeminine: function () {
          return false;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        getFullName: function () {
          return "Brax Volkov";
        },
        getRaceName: function () {
          return this.raceName;
        },
        gender: LT.Gender.MALE,
        hasVagina: function () {
          return false;
        },
        hasPenis: function () {
          return true;
        },
        hasBreasts: function () {
          return false;
        },
        sex: { vaginaVirgin: false, penisVirgin: false },
      };
      if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.npcs.brax, true);
    }
    var n = LT.game.npcs.brax;
    if (!n.level) n.level = 10;
    if (!n.physique) n.physique = 15;
    if (n.arcane == null) n.arcane = 10;
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(n);
    if (typeof LT.equipOfficialLoadout === "function" && !n.mainWeapon) {
      LT.equipOfficialLoadout("brax", n);
    }
    if (typeof LT.dressUniqueNpc === "function") LT.dressUniqueNpc("brax", n);
    if (n.essences == null) n.essences = 150;
    if (!n.hasPenis) {
      n.gender = n.gender || LT.Gender.MALE;
      n.hasPenis = function () {
        return true;
      };
      n.hasVagina = function () {
        return false;
      };
      n.hasBreasts = function () {
        return false;
      };
    }
    return n;
  };

  LT.ensureVicky = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.vicky) {
      LT.game.npcs.vicky = {
        id: "vicky",
        name: "Vicky",
        feminine: true,
        raceName: "wolf-girl",
        fullRace: "wolf-girl",
        speechColour: "#c9a227",
        location: { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_VICKYS_SHOP" },
        getName: function () {
          return "Vicky";
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
        getRaceName: function () {
          return this.fullRace;
        },
      };
    }
    var n = LT.game.npcs.vicky;
    if (typeof LT.isOfficeHours === "function" && LT.isOfficeHours()) {
      n.location = { world: "SHOPPING_ARCADE", place: "SHOPPING_ARCADE_VICKYS_SHOP" };
    } else {
      n.location = null;
    }
    return n;
  };

  LT.npcAtCurrentTile = function () {
    LT.ensureHouseNpcs();
    if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
    if (typeof LT.syncNightlifePresent === "function") LT.syncNightlifePresent();
    var loc = LT.game.player && LT.game.player.location;
    var world = (loc && loc.world) || (window.grid && grid.gridName);
    var place = (loc && loc.place) || "";
    if (!place && typeof getCurrentTile === "function") {
      var tile = getCurrentTile();
      place = (tile && tile.location && tile.location.placeType) || "";
    }
    var list = [];
    var seen = {};
    var npcs = LT.game.npcs || {};
    var x = loc && loc.x;
    var y = loc && loc.y;
    if (x == null && window.grid && grid.playerPosition) {
      x = grid.playerPosition.x;
      y = grid.playerPosition.y;
    }
    Object.keys(npcs).forEach(function (key) {
      var n = npcs[key];
      if (!n || !n.location || !n.location.world) return;
      if (n.location.world !== world) return;
      if (n.location.x != null && x != null) {
        if (n.location.x !== x || n.location.y !== y) return;
      } else if (n.location.place && place) {
        if (n.location.place !== place) return;
      } else {
        return;
      }
      var seenKey = n.id || key;
      if (seen[seenKey]) return;
      seen[seenKey] = true;
      list.push(n);
    });
    if (LT.sex && LT.sex.active) {
      var extras = LT.sex.participants || (LT.sex.partner ? [LT.sex.partner] : []);
      extras.forEach(function (n) {
        if (!n || n === (LT.game && LT.game.player)) return;
        var extraKey = n.id || n.name || "sexPartner";
        if (seen[extraKey]) return;
        seen[extraKey] = true;
        list.push(n);
      });
    }
    if (typeof LT.markCharacterEncountered === "function") {
      list.forEach(function (n) {
        if (n && n.id) LT.markCharacterEncountered(n.id);
      });
    }
    return list;
  };
})();
