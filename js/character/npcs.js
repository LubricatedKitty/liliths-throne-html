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
    LT.game.npcs.rose = applyHouseNpc(LT.game.npcs.rose, {
      id: "rose",
      name: "Rose",
      raceName: "cat-girl",
      speechColour: "#ff8cb3",
      relationToPlayer: "maid",
      location: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" },
    });
    LT.updateHouseNpcLocations();
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
      n.isFeminine = function () {
        return false;
      };
      n.getFullName = function () {
        return "Scarlett Kardos";
      };
      LT.game.npcs.scarlett = n;
    }
    var s = LT.game.npcs.scarlett;
    if (LT.game.flags && LT.game.flags.keptScarlett) {
      s.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" };
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
    }
    return LT.game.npcs.helena;
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

  LT.ensureAngel = function () {
    LT.game.npcs = LT.game.npcs || {};
    if (!LT.game.npcs.angel) {
      LT.game.npcs.angel = {
        id: "angel",
        name: "Angel",
        feminine: true,
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
        speechColour: "#ff8cb3",
        getName: function () {
          return "Katherine";
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return this.speechColour;
        },
      };
    }
    return LT.game.npcs.katherine;
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
    var loc = LT.game.player && LT.game.player.location;
    var world = (loc && loc.world) || (window.grid && grid.gridName);
    var place = (loc && loc.place) || "";
    if (!place && typeof getCurrentTile === "function") {
      var tile = getCurrentTile();
      place = (tile && tile.location && tile.location.placeType) || "";
    }
    var list = [];
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
      list.push(n);
    });
    return list;
  };
})();
