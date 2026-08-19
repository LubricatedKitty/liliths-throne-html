(function () {
  LT.ALLEY_ATTACK_CHANCE = 0.15;
  var CANAL = {
    DOMINION_ALLEYS_CANAL_CROSSING: true,
    DOMINION_CANAL: true,
    DOMINION_CANAL_END: true,
  };
  var ALLEY = {
    DOMINION_BACK_ALLEYS: true,
    DOMINION_DARK_ALLEYS: true,
    DOMINION_ALLEYS_CANAL_CROSSING: true,
    DOMINION_CANAL: true,
    DOMINION_CANAL_END: true,
  };
  var RACES = [
    { id: "human", fem: "woman", masc: "man" },
    { id: "cat-morph", fem: "cat-girl", masc: "cat-boy" },
    { id: "dog-morph", fem: "dog-girl", masc: "dog-boy" },
    { id: "wolf-morph", fem: "wolf-girl", masc: "wolf-boy" },
    { id: "horse-morph", fem: "horse-girl", masc: "horse-boy" },
    { id: "fox-morph", fem: "fox-girl", masc: "fox-boy" },
    { id: "harpy", fem: "harpy", masc: "harpy" },
  ];
  var DARK_RACES = [
    { id: "demon", fem: "succubus", masc: "incubus" },
  ];
  var FEM_NAMES = ["Kara", "Nisha", "Sable", "Rin", "Mira", "Tasha", "Vesper"];
  var MAS_NAMES = ["Rook", "Dane", "Ash", "Bram", "Jace", "Cole", "Vex"];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function placeXml(tag) {
    return LT.parseFromXML("places/dominion/dominionPlaces", tag);
  }

  function attackXml(tag) {
    return LT.parseFromXML("encounters/dominion/alleywayAttack", tag);
  }

  function hookerXml(tag) {
    return LT.parseFromXML("encounters/dominion/prostitute", tag);
  }

  LT.prostitutePrice = function (npc) {
    var p = 1;
    if (npc && npc.isFeminine && npc.isFeminine()) p += 0.5;
    if (npc && npc.hasVagina && npc.hasVagina()) p += 0.15;
    if (npc && npc.hasPenis && npc.hasPenis()) p += 0.1;
    p += ((npc && npc.level) || 1) * 0.05;
    return Math.max(150, Math.floor(p * 50) * 10);
  };

  function currentPlace() {
    return (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "";
  }

  function tileKey() {
    var loc = LT.game.player && LT.game.player.location;
    if (!loc) return "";
    return (loc.world || "") + "," + loc.x + "," + loc.y;
  }

  function bindMugger(mugger) {
    if (!mugger) return mugger;
    LT.game.npcs = LT.game.npcs || {};
    if (mugger.id) LT.game.npcs[mugger.id] = mugger;
    LT.game.npcs.alleyMugger = mugger;
    LT.game.npcs.npc = mugger;
    return mugger;
  }

  function attachMuggerApi(mugger) {
    if (!mugger) return mugger;
    mugger.getName = function () {
      return this.playerKnowsName ? this.name : "the " + this.fullRace;
    };
    mugger.getFullName = function () {
      return this.getName();
    };
    mugger.isFeminine = function () {
      return !!this.feminine;
    };
    mugger.getSpeechColour = function () {
      return this.speechColour;
    };
    mugger.getRaceName = function () {
      return this.fullRace;
    };
    mugger.hasVagina = function () {
      return !!(this.gender && this.gender.hasVagina);
    };
    mugger.hasPenis = function () {
      return !!(this.gender && this.gender.hasPenis);
    };
    mugger.hasBreasts = function () {
      return !!(this.gender && this.gender.hasBreasts);
    };
    mugger.getPlayerSurrenderCount = function () {
      return this.playerSurrenderCount || 0;
    };
    mugger.incrementPlayerSurrenderCount = function (n) {
      this.playerSurrenderCount = (this.playerSurrenderCount || 0) + (n == null ? 1 : n);
      return this.playerSurrenderCount;
    };
    mugger.hasEncounteredBefore = function () {
      return !!this.encounteredBefore;
    };
    mugger.getPetName = function (who) {
      if (who === "pc" || who === LT.game.player) return this.callsPlayer || "bitch";
      return this.playerCallsNpc || this.name;
    };
    return mugger;
  }

  LT.hydrateAlleyNpc = function (raw) {
    if (!raw) return null;
    return attachMuggerApi(raw);
  };

  LT.alleyOccupantsHere = function () {
    var loc = LT.game.player && LT.game.player.location;
    if (!loc) return [];
    var list = [];
    var npcs = LT.game.npcs || {};
    Object.keys(npcs).forEach(function (key) {
      if (key === "npc" || key === "alleyMugger" || key === "victim" || key === "friend" || key === "stranger") return;
      var n = npcs[key];
      if (!n || n.transient || !n.location || !n.location.world) return;
      if (n.location.world !== loc.world) return;
      if (n.location.x != null && loc.x != null) {
        if (n.location.x !== loc.x || n.location.y !== loc.y) return;
      } else if (n.location.place !== loc.place) return;
      if (n.occupation === "mugger" || n.occupation === "prostitute" || (n.id && String(n.id).indexOf("alley_") === 0)) {
        list.push(n);
      }
    });
    return list;
  };

  LT.alleyMuggerPresent = function () {
    if (LT.alleyOccupantsHere().length) return true;
    var n = LT.game.npcs && LT.game.npcs.alleyMugger;
    if (!n || !n.location || !n.location.world) return false;
    var loc = LT.game.player && LT.game.player.location;
    if (!loc) return false;
    return n.location.world === loc.world && n.location.place === loc.place && n.location.x === loc.x && n.location.y === loc.y;
  };

  LT.activeAlleyNpc = function () {
    return (LT.game.npcs && LT.game.npcs.alleyMugger) || LT.alleyOccupantsHere()[0] || null;
  };

  LT.persistAlleyNpc = function (npc) {
    if (!npc || npc.transient || npc.stormAttacker) return npc;
    var loc = (LT.game.player && LT.game.player.location) || {};
    npc.location = { world: loc.world, place: loc.place, x: loc.x, y: loc.y };
    bindMugger(npc);
    return npc;
  };

  LT.clearAlleyMugger = function (banish) {
    var n = LT.game.npcs && LT.game.npcs.alleyMugger;
    if (banish && n) {
      if (n.id && LT.game.npcs[n.id] === n) delete LT.game.npcs[n.id];
    }
    if (LT.game.npcs) {
      delete LT.game.npcs.alleyMugger;
      if (LT.game.npcs.npc && (!n || LT.game.npcs.npc === n || LT.game.npcs.npc.id === "alleyMugger")) {
        delete LT.game.npcs.npc;
      }
    }
  };

  LT.banishAlleyNpc = function (npc) {
    npc = npc || (LT.game.npcs && LT.game.npcs.alleyMugger);
    if (!npc) return;
    if (LT.game.npcs) {
      if (npc.id) delete LT.game.npcs[npc.id];
      if (LT.game.npcs.alleyMugger === npc) delete LT.game.npcs.alleyMugger;
      if (LT.game.npcs.npc === npc) delete LT.game.npcs.npc;
    }
  };

  function pickGender(opts) {
    if (opts.gender) return opts.gender;
    if (typeof LT.getGenderFromUserPreferences === "function") {
      if (opts.feminine != null) {
        return LT.getGenderFromUserPreferences(opts.feminine ? LT.Femininity.FEMININE : LT.Femininity.MASCULINE);
      }
      return LT.getGenderFromUserPreferences(!!opts.requiresVagina, !!opts.requiresPenis);
    }
    var feminine = opts.feminine != null ? opts.feminine : Math.random() < 0.5;
    return feminine ? LT.Gender.FEMALE : LT.Gender.MALE;
  }

  function pickRace(opts, gender, dark) {
    if (opts.race) return opts.race;
    if (dark) return DARK_RACES[0];
    if (typeof LT.pickEncounterRace === "function") {
      return LT.pickEncounterRace({
        gender: gender,
        pool: opts.pool || "dominion",
        includeHumanChance: opts.includeHumanChance !== false,
        fallback: LT.HUMAN_RACE || RACES[0],
      });
    }
    return pick(RACES);
  }

  LT.generateAlleyMugger = function (opts) {
    opts = opts || {};
    var dark = !!opts.dark;
    var gender = pickGender(opts);
    var feminine = !!(gender && gender.feminine);
    var race = pickRace(opts, gender, dark);
    var level = opts.level != null ? opts.level : dark ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);
    var loc = (LT.game.player && LT.game.player.location) || {};
    var fullRace = feminine ? race.fem : race.masc;
    var official = typeof LT.randomOfficialName === "function" ? LT.randomOfficialName({ feminine: feminine }) : null;
    var name = official ? official.name : pick(feminine ? FEM_NAMES : MAS_NAMES);
    var prostitute = opts.storm ? false : opts.prostitute != null ? !!opts.prostitute : Math.random() < 0.2;
    var orientation = opts.orientation || (typeof LT.getRacialOrientation === "function" ? LT.getRacialOrientation(race.id, gender) : LT.Orientation.AMBIPHILIC);
    LT.game.flags = LT.game.flags || {};
    LT.game.flags.alleyNpcSeq = (LT.game.flags.alleyNpcSeq || 0) + 1;
    var mugger = {
      id: "alley_" + LT.game.flags.alleyNpcSeq,
      name: name,
      surname: official && official.surname ? official.surname : pick(typeof LT.HUMAN_SURNAMES !== "undefined" ? LT.HUMAN_SURNAMES : ["Voss", "Kane", "Reed", "Holt", "Pike", "Ash"]),
      playerKnowsName: !!prostitute,
      occupation: prostitute ? "prostitute" : "mugger",
      feminine: feminine,
      gender: gender,
      orientation: orientation,
      age: opts.age != null ? opts.age : typeof LT.getAgeFromPreferences === "function" ? LT.getAgeFromPreferences(gender) : 25,
      raceName: race.id,
      fullRace: fullRace,
      speechColour: (gender && gender.colour) || (feminine ? LT.Colour.FEMININE : LT.Colour.MASCULINE),
      level: level,
      physique: 8 + level * 2,
      arcane: dark ? 18 : 8,
      money: 10 + Math.floor(Math.random() * (level * 10 + 1)) + 1,
      attractedToPlayer: opts.attractedToPlayer != null ? !!opts.attractedToPlayer : Math.random() < 0.5,
      playerSurrenderCount: 0,
      encounteredBefore: false,
      transient: !!opts.storm || !!opts.transient,
      stormAttacker: !!opts.storm,
      location: { world: loc.world, place: loc.place, x: loc.x, y: loc.y },
    };
    attachMuggerApi(mugger);
    if (opts.attractedToPlayer == null && typeof LT.isAttractedToPlayer === "function") {
      mugger.attractedToPlayer = LT.isAttractedToPlayer(mugger);
    }
    /* Official arcane-storm attackers are always lust-crazed, regardless of orientation. */
    if (opts.storm || (typeof LT.isArcaneStorm === "function" && LT.isArcaneStorm())) {
      mugger.attractedToPlayer = true;
    }
    var fetishPct = typeof LT.getNumericProperty === "function" ? LT.getNumericProperty("forcedFetishPercentage", 40) : 40;
    var tfPct = typeof LT.getNumericProperty === "function" ? LT.getNumericProperty("forcedTFPercentage", 40) : 40;
    mugger.usingForcedFetish = fetishPct > 0 && Math.random() * 100 < fetishPct;
    mugger.usingForcedTransform = tfPct > 0 && Math.random() * 100 < tfPct;
    if (typeof LT.applyFetishPreferences === "function") LT.applyFetishPreferences(mugger);
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(mugger, true);
    if (typeof LT.armMuggerFromOutfit === "function") {
      LT.armMuggerFromOutfit(mugger, { dark: dark });
    }
    if (typeof LT.prepareNpcGear === "function") {
      LT.prepareNpcGear(mugger, { outfit: prostitute ? "PROSTITUTE" : "MUGGER" });
    }
    if (opts.noBind) return mugger;
    return bindMugger(mugger);
  };

  function rollAttack() {
    return Math.random() < LT.ALLEY_ATTACK_CHANCE;
  }

  function encounterNodeFor(npc) {
    if (!npc) return "place." + currentPlace();
    if (npc.occupation === "prostitute") return "alley.prostitute";
    return "alley.attack";
  }

  function startEncounter() {
    var here = LT.alleyOccupantsHere();
    var npc = here[0];
    if (!npc) {
      var dark = currentPlace() === "DOMINION_DARK_ALLEYS";
      npc = LT.generateAlleyMugger({ dark: dark });
      LT.persistAlleyNpc(npc);
    } else {
      bindMugger(npc);
    }
    LT.game.setContent(encounterNodeFor(npc));
  }

  function maybeAmbush() {
    var key = tileKey();
    if (!key || LT.game.flags.alleyTileKey === key) return;
    LT.game.flags.alleyTileKey = key;
    var here = LT.alleyOccupantsHere();
    if (here.length) {
      bindMugger(here[0]);
      LT.game.flags.redirectNode = encounterNodeFor(here[0]);
      return;
    }
    if (rollAttack()) {
      var dark = currentPlace() === "DOMINION_DARK_ALLEYS";
      var npc = LT.generateAlleyMugger({ dark: dark });
      LT.persistAlleyNpc(npc);
      LT.game.flags.redirectNode = encounterNodeFor(npc);
    }
  }

  function alleyResponses() {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    list.push(
      new LT.Response(
        "Explore",
        "Explore the alleyways. Although you don't think you're any more or less likely to find anything by doing this, at least you won't have to keep travelling back and forth...",
        null,
        function () {
          LT.game.advanceTime(1800);
          var here = LT.alleyOccupantsHere();
          if (here.length) startEncounter();
          else if (rollAttack()) startEncounter();
          else {
            LT.game.textStart = "<p>You spend some time searching the alleyways, but you don't find anything of interest.</p>";
            LT.game.setContent("place." + currentPlace());
          }
        },
      ),
    );
    return list;
  }

  function defineAlley(id, title, tag, dangerous) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 180,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        LT.game.flags.alleyCanal = !!CANAL[currentPlace()];
        if (dangerous) maybeAmbush();
        else if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
      },
      getContent: function () {
        return placeXml(tag);
      },
      getResponses: dangerous ? alleyResponses : function () {
        return LT.travelResponses ? LT.travelResponses() : [null];
      },
    });
  }

  defineAlley("place.DOMINION_BACK_ALLEYS", "Alleyways", "BACK_ALLEYS", true);
  defineAlley("place.DOMINION_BACK_ALLEYS_SAFE", "Alleyways (Patrolled)", "BACK_ALLEYS_SAFE", false);
  defineAlley("place.DOMINION_DARK_ALLEYS", "Dark Alleyways", "DARK_ALLEYS", true);
  defineAlley("place.DOMINION_ALLEYS_CANAL_CROSSING", "Canal Crossing", "BACK_ALLEYS_CANAL", true);
  defineAlley("place.DOMINION_CANAL", "Canal", "BACK_ALLEYS_CANAL", true);
  defineAlley("place.DOMINION_CANAL_END", "Canal", "BACK_ALLEYS_CANAL", true);

  function muggerDemand() {
    var n = LT.activeAlleyNpc && LT.activeAlleyNpc();
    return 50 + 10 * ((n && n.level) || 1);
  }

  function muggerDemand3() {
    return muggerDemand() * 3;
  }

  function markEncountered(npc) {
    if (!npc) return;
    npc.encounteredBefore = true;
  }

  function attackTagFor(npc) {
    if (!npc) return "ALLEY_ATTACK";
    var count = npc.getPlayerSurrenderCount ? npc.getPlayerSurrenderCount() : npc.playerSurrenderCount || 0;
    if (count >= 4) return "ALLEY_ATTACK_SUBMITTED";
    if (count === 3) return "ALLEY_ATTACK_DEMAND_SUBMIT";
    if (npc.encounteredBefore) return "ALLEY_ATTACK_REPEAT";
    return "ALLEY_ATTACK";
  }

  function pickSubmittedIndex(npc) {
    var idx = 1 + Math.floor(Math.random() * 6);
    if (idx === 1 && LT.getMoney() < muggerDemand3()) idx = 2;
    if (idx === 6) idx = 4;
    if (idx === 4 && npc && !npc.attractedToPlayer) idx = 5;
    LT.game.flags = LT.game.flags || {};
    LT.game.flags.alleySubmitScene = idx;
    return idx;
  }

  LT.defineNode({
    id: "alley.attack",
    ui: "dialogue",
    title: "Assaulted!",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (LT.game.npcs && LT.game.npcs.alleyMugger) bindMugger(LT.game.npcs.alleyMugger);
    },
    getContent: function () {
      var mugger = LT.activeAlleyNpc();
      if (mugger && (mugger.getPlayerSurrenderCount ? mugger.getPlayerSurrenderCount() : 0) >= 4) {
        pickSubmittedIndex(mugger);
      }
      return attackXml(attackTagFor(mugger));
    },
    getResponses: function () {
      var mugger = LT.activeAlleyNpc();
      if (!mugger) return [new LT.Response("Continue", "There's nobody here.", "place." + currentPlace())];
      var count = mugger.getPlayerSurrenderCount ? mugger.getPlayerSurrenderCount() : 0;
      if (count >= 3 && typeof LT.alleySubmittedResponses === "function") {
        return LT.alleySubmittedResponses(mugger);
      }
      var demand = muggerDemand();
      var pay = new LT.Response("Offer money (" + demand + ")", "Offer " + demand + " flames to be left alone.", "place." + currentPlace(), function () {
        markEncountered(mugger);
        LT.game.textEnd = LT.incrementMoney(-demand);
        LT.clearAlleyMugger();
        LT.game.textStart = attackXml("ALLEY_ATTACK_PAY_OFF") || ("<p>You hand over the flames. " + mugger.getName() + " snatches them and slips back into the shadows.</p>");
      });
      if (LT.getMoney() < demand) {
        pay.disable("You don't have " + demand + " flames.");
      }
      var offerBody;
      if (mugger.attractedToPlayer) {
        offerBody = LT.ResponseSex(
          "Offer body",
          LT.parse("Offer your body to [npc.name] so that you can avoid a violent confrontation.<br/><i>Repeatedly submitting to [npc.name] will eventually lead to [npc.herHim] demanding that you become [npc.her] bitch...</i>"),
          {
            partner: mugger,
            playerDom: false,
            consensual: true,
            startText: attackXml("ALLEY_ATTACK_OFFER_BODY"),
            postSexNode: "alley.after-offer-sex",
            onEnd: function () {
              markEncountered(mugger);
              if (mugger.incrementPlayerSurrenderCount) mugger.incrementPlayerSurrenderCount(1);
            },
          },
        );
      } else {
        offerBody = new LT.Response(
          "Offer body",
          LT.parse("You can tell that [npc.name] isn't at all interested in having sex with you. You'll either have to offer [npc.herHim] some money, or prepare for a fight!"),
          null,
        ).disable(LT.parse("You can tell that [npc.name] isn't at all interested in having sex with you. You'll either have to offer [npc.herHim] some money, or prepare for a fight!"));
      }
      return [
        null,
        LT.ResponseCombat("Fight", LT.parse("Stand up for yourself and fight [npc.name]!"), {
          enemy: mugger,
          escapeChance: 25,
          victoryNode: "alley.victory",
          defeatNode: "alley.defeat",
          returnNode: "place." + currentPlace(),
          onVictory: function () {
            markEncountered(mugger);
            return "";
          },
          onDefeat: function () {
            markEncountered(mugger);
            var take = Math.min(LT.getMoney(), muggerDemand());
            return take ? LT.incrementMoney(-take) : "";
          },
          onEscape: function () {
            markEncountered(mugger);
            if (mugger.stormAttacker || mugger.transient) LT.banishAlleyNpc(mugger);
            else LT.clearAlleyMugger();
          },
        }),
        pay,
        offerBody,
      ];
    },
  });

  function enslaveXml(tag, npc) {
    var raw = (LT.TEXT["characters/enslavement"] && LT.TEXT["characters/enslavement"][tag]) || "";
    raw = raw.replace(/\[#SPECIAL_PARSE_0\]/g, "metal collar").replace(/\[#SPECIAL_PARSE_1\]/g, "it");
    if (typeof LT.addSpecialParse === "function") LT.addSpecialParse("metal collar", true);
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: npc, pc: LT.game.player }, function () {
        return LT.parse(raw);
      });
    }
    return LT.parse(raw);
  }

  function canEnslave(mugger) {
    if (!mugger) return { ok: false, reason: "There is nobody here to enslave." };
    if (mugger.occupation === "prostitute" && mugger.playerKnowsName) {
      /* alley prostitutes are still unregistered criminals */
    }
    if (mugger.raceName === "demon" || (mugger.fullRace && /succubus|incubus|demon/i.test(mugger.fullRace))) {
      return { ok: false, reason: "No Enforcer would ever sign off on a demon's enslavement warrant.", tag: "ENSLAVEMENT_FAIL_NOT_WANTED_DEMON" };
    }
    if (!(LT.game.flags && LT.game.flags.hasSlaverLicense)) {
      return { ok: false, reason: "You need a slaver license to enslave anyone.", tag: "ENSLAVEMENT_FAIL_NO_LICENSE" };
    }
    if (typeof LT.countItems !== "function" || LT.countItems(LT.game.player, "innoxia_bdsm_metal_collar") < 1) {
      return { ok: false, reason: "You need a metal slave collar to lock around their neck." };
    }
    return { ok: true };
  }

  function enslaveResponse(mugger) {
    var check = canEnslave(mugger);
    var resp = new LT.Response("Enslave", "Lock a slave collar around their neck and have them teleported to Slavery Administration.", "alley.enslave");
    if (!check.ok) resp.disable(check.reason);
    return resp;
  }

  LT.defineNode({
    id: "alley.enslave",
    ui: "dialogue",
    title: "New Slave",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (LT.game.npcs && LT.game.npcs.alleyMugger) bindMugger(LT.game.npcs.alleyMugger);
    },
    getContent: function () {
      var mugger = LT.game.npcs && LT.game.npcs.alleyMugger;
      var check = canEnslave(mugger);
      if (!mugger) return "<p>They are already gone.</p>";
      if (!check.ok && check.tag) return enslaveXml(check.tag, mugger);
      if (!check.ok) return "<p>" + check.reason + "</p>";
      LT.removeItemById(LT.game.player, "innoxia_bdsm_metal_collar");
      LT.enslaveNpc(mugger);
      mugger.playerKnowsName = true;
      return enslaveXml("ENSLAVEMENT_SUCCESS_COLLAR", mugger);
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "They have been teleported to Slavery Administration.", "place." + currentPlace(), function () {
          LT.banishAlleyNpc(LT.activeAlleyNpc());
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.victory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (LT.game.npcs && LT.game.npcs.alleyMugger) bindMugger(LT.game.npcs.alleyMugger);
    },
    getContent: function () {
      var n = LT.game.npcs && LT.game.npcs.alleyMugger;
      if (n && n.attractedToPlayer) return attackXml("AFTER_COMBAT_VICTORY_ATTRACTION");
      return attackXml("AFTER_COMBAT_VICTORY_NO_ATTRACTION");
    },
    getResponses: function () {
      var mugger = LT.game.npcs && LT.game.npcs.alleyMugger;
      var list = [
        null,
        new LT.Response("Continue", "Carry on your way.", "place." + currentPlace(), function () {
          markEncountered(mugger);
          LT.clearAlleyMugger();
        }),
      ];
      list.push(enslaveResponse(mugger));
      if (typeof LT.lootResponse === "function") list.push(LT.lootResponse(mugger, "alley.victory"));
      if (mugger && mugger.attractedToPlayer) {
        list.push(
          LT.ResponseSex("Sex", "They are asking for it...", {
            partner: mugger,
            playerDom: true,
            consensual: true,
            startText: attackXml("AFTER_COMBAT_VICTORY_SEX"),
            postSexNode: "alley.after-victory-sex",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "alley.defeat",
    ui: "dialogue",
    title: "Defeat",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (LT.game.npcs && LT.game.npcs.alleyMugger) bindMugger(LT.game.npcs.alleyMugger);
    },
    getContent: function () {
      return attackXml("AFTER_COMBAT_DEFEAT_GENERIC_START") +
        "<p>Having taken what they wanted, " +
        ((LT.game.npcs.alleyMugger && LT.game.npcs.alleyMugger.getName()) || "the mugger") +
        " melts back into the alleyways, leaving you to pick yourself up.</p>";
    },
    getResponses: function () {
      var mugger = LT.game.npcs && LT.game.npcs.alleyMugger;
      var list = [
        null,
        new LT.Response("Continue", "Pick yourself up and carry on.", "place." + currentPlace(), function () {
          markEncountered(mugger);
          LT.clearAlleyMugger();
        }),
      ];
      if (mugger && mugger.attractedToPlayer) {
        list.push(
          LT.ResponseSex("Sex", "They have other ideas.", {
            partner: mugger,
            playerDom: false,
            consensual: true,
            postSexNode: "alley.after-offer-sex",
          }),
        );
      }
      return list;
    },
  });

  function alleyAfter(id, title, tag) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 60,
      travelDisabled: true,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        if (LT.game.npcs && LT.game.npcs.alleyMugger) bindMugger(LT.game.npcs.alleyMugger);
      },
      getContent: function () {
        return attackXml(tag);
      },
      getResponses: function () {
        return [
          null,
          new LT.Response("Continue", "Carry on your way.", "place." + currentPlace(), function () {
            var n = LT.activeAlleyNpc();
            markEncountered(n);
            LT.clearAlleyMugger();
          }),
        ];
      },
    });
  }

  alleyAfter("alley.after-offer-sex", "After sex", "AFTER_SEX_DEFEAT");
  alleyAfter("alley.after-victory-sex", "After sex", "AFTER_SEX_VICTORY");

  LT.defineNode({
    id: "alley.prostitute",
    ui: "dialogue",
    title: "Prostitute",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var n = LT.game.npcs && LT.game.npcs.alleyMugger;
      if (n) bindMugger(n);
      var storm = !!(LT.isArcaneStorm && LT.isArcaneStorm());
      var cost = storm ? 0 : LT.prostitutePrice(n);
      LT.addSpecialParse(String(cost), true);
      LT.addSpecialParse(String(cost * 2), false);
    },
    getContent: function () {
      return LT.isArcaneStorm && LT.isArcaneStorm() ? hookerXml("ALLEY_PROSTITUTE_STORM") : hookerXml("ALLEY_PROSTITUTE");
    },
    getResponses: function () {
      var n = LT.game.npcs && LT.game.npcs.alleyMugger;
      if (!n) return [new LT.Response("Continue", "There's nobody here.", "place." + currentPlace())];
      var storm = !!(LT.isArcaneStorm && LT.isArcaneStorm());
      var cost = storm ? 0 : LT.prostitutePrice(n);
      var leave = new LT.Response(
        "Leave",
        LT.parse("You're not at all interested in having sex with a prostitute. Walk around [npc.herHim] and continue on your way."),
        "place." + currentPlace(),
        function () {
          LT.game.textStart = hookerXml("ALLEY_PROSTITUTE_LEAVE");
          n.encounteredBefore = true;
          LT.persistAlleyNpc(n);
          LT.clearAlleyMugger();
        },
      );
      function paid(title, tip, dom, startTag) {
        var resp = LT.ResponseSex(title, tip, {
          partner: n,
          playerDom: !!dom,
          consensual: true,
          startText: hookerXml(startTag),
          postSexNode: "alley.prostituteAfter",
          onEnd: function () {
            n.encounteredBefore = true;
          },
        });
        if (cost > 0 && LT.getMoney() < cost) {
          return new LT.Response(title, LT.parse("You don't have " + cost + " flames, so you can't afford to have sex with [npc.name]."), null).disable(
            LT.parse("You don't have " + cost + " flames, so you can't afford to have sex with [npc.name]."),
          );
        }
        var prev = resp.effects;
        resp.effects = function () {
          if (cost > 0) LT.game.textEnd = (LT.game.textEnd || "") + LT.incrementMoney(-cost);
          if (prev) prev();
        };
        return resp;
      }
      var domLabel = cost ? "Dominant (" + cost + ")" : "Dominant";
      var subLabel = cost ? "Submissive (" + cost + ")" : "Submissive";
      var domTip = cost
        ? LT.parse("Pay [npc.name] " + cost + " flames to have dominant sex with [npc.herHim].")
        : LT.parse("[npc.Name] is so turned on that [npc.she] isn't going to charge you anything for having sex with [npc.herHim]!");
      var subTip = cost
        ? LT.parse("Pay [npc.name] " + cost + " flames to have submissive sex with [npc.herHim].")
        : LT.parse("[npc.Name] is so turned on that [npc.she] isn't going to charge you anything for having sex with [npc.herHim]!");
      return [
        null,
        leave,
        paid(domLabel, domTip, true, "ALLEY_PROSTITUTE_DOM_SEX"),
        paid(subLabel, subTip, false, "ALLEY_PROSTITUTE_SUB_SEX"),
      ];
    },
  });

  LT.defineNode({
    id: "alley.prostituteAfter",
    ui: "dialogue",
    title: "After sex",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (LT.game.npcs && LT.game.npcs.alleyMugger) bindMugger(LT.game.npcs.alleyMugger);
    },
    getContent: function () {
      return LT.isArcaneStorm && LT.isArcaneStorm() ? hookerXml("AFTER_SEX_STORM") : hookerXml("AFTER_SEX_PAID");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", LT.parse("Leave [npc.name] behind and continue on your way."), "place." + currentPlace(), function () {
          LT.game.textStart = LT.isArcaneStorm && LT.isArcaneStorm() ? hookerXml("AFTER_SEX_STORM_LEAVE") : hookerXml("AFTER_SEX_PAID_LEAVE");
          var left = LT.activeAlleyNpc();
          if (left) left.encounteredBefore = true;
          LT.clearAlleyMugger();
        }),
      ];
    },
  });
})();
