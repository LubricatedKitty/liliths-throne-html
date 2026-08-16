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
    { id: "human", fem: "human", masc: "human" },
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
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.alleyMugger = mugger;
    LT.game.npcs.npc = mugger;
    return mugger;
  }

  LT.alleyMuggerPresent = function () {
    var n = LT.game.npcs && LT.game.npcs.alleyMugger;
    if (!n || !n.location || !n.location.world) return false;
    var loc = LT.game.player && LT.game.player.location;
    if (!loc) return false;
    return n.location.world === loc.world && n.location.place === loc.place && n.location.x === loc.x && n.location.y === loc.y;
  };

  LT.clearAlleyMugger = function () {
    if (LT.game.npcs) {
      delete LT.game.npcs.alleyMugger;
      if (LT.game.npcs.npc && LT.game.npcs.npc.id === "alleyMugger") delete LT.game.npcs.npc;
    }
  };

  LT.generateAlleyMugger = function (opts) {
    opts = opts || {};
    var dark = !!opts.dark;
    var feminine = opts.feminine != null ? opts.feminine : Math.random() < 0.5;
    var race = opts.race || pick(dark ? DARK_RACES : RACES);
    var level = opts.level != null ? opts.level : dark ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);
    var loc = (LT.game.player && LT.game.player.location) || {};
    var fullRace = feminine ? race.fem : race.masc;
    var name = pick(feminine ? FEM_NAMES : MAS_NAMES);
    var prostitute = opts.storm ? false : opts.prostitute != null ? !!opts.prostitute : Math.random() < 0.2;
    var mugger = {
      id: "alleyMugger",
      name: name,
      playerKnowsName: !!prostitute,
      occupation: prostitute ? "prostitute" : "mugger",
      feminine: feminine,
      gender: feminine ? LT.Gender.FEMALE : LT.Gender.MALE,
      raceName: race.id,
      fullRace: fullRace,
      speechColour: feminine ? LT.Colour.FEMININE : LT.Colour.MASCULINE,
      level: level,
      physique: 8 + level * 2,
      arcane: dark ? 18 : 8,
      money: 10 + Math.floor(Math.random() * (level * 10 + 1)) + 1,
      attractedToPlayer: Math.random() < 0.5,
      location: { world: loc.world, place: loc.place, x: loc.x, y: loc.y },
      getName: function () {
        return this.playerKnowsName ? this.name : "the " + this.fullRace;
      },
      getFullName: function () {
        return this.getName();
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
    };
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(mugger, true);
    if (typeof LT.armMuggerFromOutfit === "function") {
      LT.armMuggerFromOutfit(mugger, { dark: dark });
    }
    if (typeof LT.prepareNpcGear === "function") {
      LT.prepareNpcGear(mugger, { outfit: prostitute ? "PROSTITUTE" : "MUGGER" });
    }
    return bindMugger(mugger);
  };

  function rollAttack() {
    return Math.random() < LT.ALLEY_ATTACK_CHANCE;
  }

  function startEncounter() {
    var dark = currentPlace() === "DOMINION_DARK_ALLEYS";
    var npc = LT.generateAlleyMugger({ dark: dark });
    LT.game.setContent(npc.occupation === "prostitute" ? "alley.prostitute" : "alley.attack");
  }

  function maybeAmbush() {
    var key = tileKey();
    if (!key || LT.game.flags.alleyTileKey === key) return;
    LT.game.flags.alleyTileKey = key;
    if (rollAttack()) {
      var dark = currentPlace() === "DOMINION_DARK_ALLEYS";
      var npc = LT.generateAlleyMugger({ dark: dark });
      LT.game.flags.redirectNode = npc.occupation === "prostitute" ? "alley.prostitute" : "alley.attack";
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
          if (rollAttack()) startEncounter();
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
    var n = LT.game.npcs && LT.game.npcs.alleyMugger;
    return 50 + 10 * ((n && n.level) || 1);
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
      return attackXml("ALLEY_ATTACK");
    },
    getResponses: function () {
      var mugger = LT.game.npcs && LT.game.npcs.alleyMugger;
      if (!mugger) return [new LT.Response("Continue", "There's nobody here.", "place." + currentPlace())];
      var demand = muggerDemand();
      var pay = new LT.Response("Offer money (" + demand + ")", "Offer " + demand + " flames to be left alone.", "place." + currentPlace(), function () {
        LT.game.textEnd = LT.incrementMoney(-demand);
        LT.clearAlleyMugger();
        LT.game.textStart = "<p>You hand over the flames. " + mugger.getName() + " snatches them and slips back into the shadows.</p>";
      });
      if (LT.getMoney() < demand) {
        pay.disable("You don't have " + demand + " flames.");
      }
      var offerBody;
      if (mugger.attractedToPlayer) {
        offerBody = LT.ResponseSex(
          "Offer body",
          LT.parse("Offer your body to [npc.name] so that you can avoid a violent confrontation."),
          {
            partner: mugger,
            playerDom: false,
            consensual: true,
            startText: attackXml("ALLEY_ATTACK_OFFER_BODY"),
            postSexNode: "alley.after-offer-sex",
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
            return "";
          },
          onDefeat: function () {
            var take = Math.min(LT.getMoney(), muggerDemand());
            return take ? LT.incrementMoney(-take) : "";
          },
          onEscape: function () {
            LT.clearAlleyMugger();
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
          LT.clearAlleyMugger();
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
          LT.clearAlleyMugger();
        }),
      ];
    },
  });
})();
