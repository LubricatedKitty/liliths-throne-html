(function () {
  /* Official AbstractEncounter.getRandomEncounter: Math.random() * 100 < total, then weighted pick. */

  var STREET_PLACES = {
    DOMINION_STREET: true,
    DOMINION_SHOPPING_ARCADE: true,
    DOMINION_NYAN_APARTMENT: true,
    DOMINION_CALLIE_BAKERY: true,
    DOMINION_STREET_HARPY_NESTS: true,
    DOMINION_HARPY_NESTS_ENTRANCE: true,
    DOMINION_NIGHTLIFE_DISTRICT: true,
    DOMINION_CITY_HALL: true,
    DOMINION_AUNTS_HOME: true,
    DOMINION_RED_LIGHT_DISTRICT: true,
    DOMINION_HOME_IMPROVEMENT: true,
    DOMINION_WAREHOUSES: true,
    DOMINION_BACK_ALLEYS_SAFE: true,
  };

  var HARPY_WALKWAYS = {
    HARPY_NESTS_WALKWAYS: true,
    HARPY_NESTS_WALKWAYS_BRIDGE: true,
  };

  function flags() {
    LT.game.flags = LT.game.flags || {};
    return LT.game.flags;
  }

  function currentPlace() {
    return (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "";
  }

  function tileKey() {
    var loc = LT.game.player && LT.game.player.location;
    if (!loc) return "";
    return (loc.world || "") + "," + loc.x + "," + loc.y;
  }

  function returnPlace() {
    return "place." + (currentPlace() || "generic");
  }

  function playerTrueName() {
    var p = LT.game.player;
    if (!p) return "";
    if (p.names) return p.names.androgynous || p.names.feminine || p.names.masculine || "";
    if (p.getName) return p.getName() || "";
    return p.name || "";
  }

  function harpyPacified() {
    return !!(LT.game.flags && (LT.game.flags.harpyPacified || LT.game.flags.harpyQuest === "complete"));
  }

  function bindMugger(npc) {
    if (!npc) return npc;
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.alleyMugger = npc;
    LT.game.npcs.npc = npc;
    return npc;
  }

  function mugger() {
    return LT.game.npcs && LT.game.npcs.alleyMugger;
  }

  function muggerDemand(npc) {
    return 50 + 10 * ((npc && npc.level) || 1);
  }

  function stormXml(tag) {
    return LT.parseFromXML("encounters/dominion/stormStreetAttack", tag);
  }

  function harpyXml(tag) {
    var pack = LT.isArcaneStorm && LT.isArcaneStorm() ? "encounters/dominion/harpyAttackStorm" : "encounters/dominion/harpyAttack";
    var html = LT.parseFromXML(pack, tag);
    if (html && html.indexOf("Dialogue for") >= 0 && pack !== "encounters/dominion/harpyAttack") {
      return LT.parseFromXML("encounters/dominion/harpyAttack", tag);
    }
    return html;
  }

  function genericXml(tag) {
    return LT.parseFromXML("encounters/dominion/generic", tag);
  }

  function itemName(id) {
    return (LT.ITEMS && LT.ITEMS[id] && LT.ITEMS[id].name) || id;
  }

  LT.pickWeightedEncounter = function (entries) {
    var total = 0;
    var i;
    for (i = 0; i < entries.length; i++) total += entries[i].weight;
    if (total <= 0) return null;
    var roll = Math.random() * total;
    var acc = 0;
    for (i = 0; i < entries.length; i++) {
      acc += entries[i].weight;
      if (roll < acc) return entries[i];
    }
    return entries[entries.length - 1];
  };

  LT.rollEncounterTable = function (entries, force) {
    var available = [];
    var total = 0;
    var i;
    for (i = 0; i < (entries || []).length; i++) {
      var e = entries[i];
      if (!e || !e.weight || (e.available && !e.available())) continue;
      available.push(e);
      total += e.weight;
    }
    if (!available.length || total <= 0) return null;
    if (!force && Math.random() * 100 >= total) return null;
    var tries = 0;
    var pool = available.slice();
    while (pool.length && tries <= 3) {
      tries++;
      var picked = LT.pickWeightedEncounter(pool);
      if (!picked) return null;
      if (typeof picked.start === "function") {
        var node = picked.start();
        if (node) return { entry: picked, node: node };
      } else if (picked.node) {
        return { entry: picked, node: picked.node };
      }
      pool = pool.filter(function (x) {
        return x !== picked;
      });
    }
    return null;
  };

  LT.encounterTableIdForPlace = function (placeType) {
    if (!placeType) return null;
    if (STREET_PLACES[placeType]) return "DOMINION_STREET";
    if (placeType === "DOMINION_PARK") return "DOMINION_PARK";
    if (HARPY_WALKWAYS[placeType]) return "HARPY_NEST_WALKWAYS";
    return null;
  };

  LT.streetEncounterEntries = function () {
    var list = [];
    if (LT.isArcaneStorm && LT.isArcaneStorm()) {
      list.push({ id: "DOMINION_STORM_ATTACK", weight: 15, start: startStormAttack });
    }
    if (playerTrueName().toLowerCase() === "kinariu" && !flags().foundHappiness) {
      list.push({ id: "DOMINION_STREET_FIND_HAPPINESS", weight: 10, start: startHappiness });
    }
    return list;
  };

  LT.parkEncounterEntries = function () {
    if (LT.isArcaneStorm && LT.isArcaneStorm()) {
      return [{ id: "DOMINION_STORM_ATTACK", weight: 15, start: startStormAttack }];
    }
    return [];
  };

  LT.harpyWalkwayEntries = function () {
    var list = [];
    if (!harpyPacified() || (LT.isArcaneStorm && LT.isArcaneStorm())) {
      list.push({ id: "HARPY_NEST_ATTACK", weight: 12, start: startHarpyAttack });
    }
    list.push({ id: "HARPY_NEST_FIND_ITEM", weight: 4, start: startHarpyFindItem });
    return list;
  };

  LT.harpyLookForTroubleEntries = function () {
    return [
      { id: "HARPY_NEST_ATTACK", weight: 12, start: startHarpyAttack },
      { id: "HARPY_NEST_FIND_ITEM", weight: 4, start: startHarpyFindItem },
    ];
  };

  function entriesForTable(tableId) {
    if (tableId === "DOMINION_STREET") return LT.streetEncounterEntries();
    if (tableId === "DOMINION_PARK") return LT.parkEncounterEntries();
    if (tableId === "HARPY_NEST_WALKWAYS") return LT.harpyWalkwayEntries();
    if (tableId === "HARPY_NEST_LOOK_FOR_TROUBLE") return LT.harpyLookForTroubleEntries();
    return [];
  }

  function startStormAttack() {
    if (!(LT.isArcaneStorm && LT.isArcaneStorm())) return null;
    if (typeof LT.generateAlleyMugger !== "function") return null;
    var npc = LT.generateAlleyMugger({ storm: true, prostitute: false });
    npc.attractedToPlayer = true;
    bindMugger(npc);
    flags().encounterKind = "storm";
    return "enc.storm-attack";
  }

  function startHarpyAttack() {
    var npc = LT.generateHarpyAttacker();
    bindMugger(npc);
    flags().encounterKind = "harpy";
    return "enc.harpy-attack";
  }

  function startHarpyFindItem() {
    var id = Math.random() < 0.66 ? "innoxia_race_harpy_harpy_perfume" : "innoxia_race_harpy_bubblegum_lollipop";
    flags().foundEncounterItem = id;
    flags().encounterKind = "find-item";
    return "enc.find-item";
  }

  function startHappiness() {
    flags().foundHappiness = true;
    flags().encounterKind = "happiness";
    return "enc.happiness";
  }

  LT.generateHarpyAttacker = function (opts) {
    opts = opts || {};
    var npc = LT.generateAlleyMugger({
      storm: false,
      prostitute: false,
      feminine: opts.feminine,
      gender: opts.gender,
      includeHumanChance: false,
      pool: "harpy",
      race: opts.race || { id: "harpy", fem: "harpy", masc: "harpy" },
      level: opts.level != null ? opts.level : 2 + Math.floor(Math.random() * 4),
    });
    npc.occupation = "mugger";
    if (typeof LT.prepareNpcGear === "function") {
      LT.prepareNpcGear(npc, { outfit: "MUGGER" });
    }
    return npc;
  };

  LT.maybePlaceEncounter = function (opts) {
    opts = opts || {};
    var loc = LT.game.player && LT.game.player.location;
    if (!loc) return null;
    var tableId = opts.tableId || LT.encounterTableIdForPlace(loc.place);
    if (!tableId) return null;
    var key = "enc," + tileKey();
    if (!opts.force && flags().encounterTileKey === key) return null;
    flags().encounterTileKey = key;
    var result = LT.rollEncounterTable(entriesForTable(tableId), !!opts.force);
    if (!result) return null;
    if (!opts.noRedirect) flags().redirectNode = result.node;
    return result.node;
  };

  LT.maybeStormEncounter = function () {
    return LT.maybePlaceEncounter();
  };

  function fightResponse(npc, victory, defeat, tip) {
    return LT.ResponseCombat("Fight", tip || LT.parse("Stand up for yourself and fight [npc.name]!"), {
      enemy: npc,
      escapeChance: 25,
      victoryNode: victory,
      defeatNode: defeat,
      returnNode: returnPlace(),
      onVictory: function () {
        return "";
      },
      onDefeat: function () {
        var take = Math.min(LT.getMoney(), muggerDemand(npc));
        return take ? LT.incrementMoney(-take) : "";
      },
      onEscape: function () {
        if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
      },
    });
  }

  function enslaveIfPossible(list, npc) {
    if (!npc || typeof LT.getNode !== "function" || !LT.hasNode("alley.enslave")) return list;
    var resp = new LT.Response("Enslave", "Lock a slave collar around their neck and have them teleported to Slavery Administration.", "alley.enslave");
    if (!(LT.game.flags && LT.game.flags.hasSlaverLicense)) {
      resp.disable("You need a slaver license to enslave anyone.");
    } else if (typeof LT.countItems !== "function" || LT.countItems(LT.game.player, "innoxia_bdsm_metal_collar") < 1) {
      resp.disable("You need a metal slave collar to lock around their neck.");
    }
    list.push(resp);
    return list;
  }

  function lootIfPossible(list, npc, back) {
    if (typeof LT.lootResponse === "function") list.push(LT.lootResponse(npc, back));
    return list;
  }

  LT.defineNode({
    id: "enc.storm-attack",
    ui: "dialogue",
    title: "Attacked!",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      return stormXml("STORM_ATTACK");
    },
    getResponses: function () {
      var npc = mugger();
      if (!npc) return [new LT.Response("Continue", "There's nobody here.", returnPlace())];
      var pay = new LT.Response(
        "Offer money",
        LT.parse("Due to the ongoing arcane storm, [npc.name] isn't interested in your money, and only wants to have sex! You'll have to either fight [npc.herHim] or give [npc.herHim] what [npc.she] wants!"),
        null,
      ).disable(
        LT.parse("Due to the ongoing arcane storm, [npc.name] isn't interested in your money, and only wants to have sex! You'll have to either fight [npc.herHim] or give [npc.herHim] what [npc.she] wants!"),
      );
      var offer = LT.ResponseSex("Offer body", LT.parse("Offer your body to [npc.name] so that you can avoid a violent confrontation."), {
        partner: npc,
        playerDom: false,
        consensual: true,
        startText: stormXml("STORM_ATTACK_OFFER_BODY"),
        postSexNode: "enc.storm-after-sex",
      });
      return [null, fightResponse(npc, "enc.storm-victory", "enc.storm-defeat", LT.parse("Defend yourself against the unwanted advances of [npc.name]!")), pay, offer];
    },
  });

  LT.defineNode({
    id: "enc.storm-victory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      var n = mugger();
      if (n && n.attractedToPlayer) return stormXml("AFTER_COMBAT_VICTORY_ATTRACTION");
      return stormXml("AFTER_COMBAT_VICTORY_NO_ATTRACTION");
    },
    getResponses: function () {
      var npc = mugger();
      var list = [
        null,
        new LT.Response("Continue", "Carry on your way.", returnPlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
      enslaveIfPossible(list, npc);
      lootIfPossible(list, npc, "enc.storm-victory");
      if (npc && npc.attractedToPlayer) {
        list.push(
          LT.ResponseSex("Sex", "They are asking for it...", {
            partner: npc,
            playerDom: true,
            consensual: true,
            startText: stormXml("AFTER_COMBAT_VICTORY_SEX"),
            postSexNode: "enc.storm-after-sex",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "enc.storm-defeat",
    ui: "dialogue",
    title: "Defeat",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      return stormXml("AFTER_COMBAT_DEFEAT_GENERIC_START");
    },
    getResponses: function () {
      var npc = mugger();
      var list = [
        null,
        new LT.Response("Continue", "Pick yourself up and carry on.", returnPlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
      if (npc && npc.attractedToPlayer) {
        list.push(
          LT.ResponseSex("Sex", "They have other ideas.", {
            partner: npc,
            playerDom: false,
            consensual: true,
            postSexNode: "enc.storm-after-sex",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "enc.storm-after-sex",
    ui: "dialogue",
    title: "After sex",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      var n = mugger();
      if (n && LT.combat && LT.combat.lastResult === "victory") return stormXml("AFTER_SEX_VICTORY");
      return stormXml("AFTER_SEX_DEFEAT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Carry on your way.", returnPlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "enc.harpy-attack",
    ui: "dialogue",
    title: "Assaulted!",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      return harpyXml("HARPY_ATTACK");
    },
    getResponses: function () {
      var npc = mugger();
      if (!npc) return [new LT.Response("Continue", "There's nobody here.", returnPlace())];
      var demand = muggerDemand(npc);
      var pay = new LT.Response("Offer money (" + demand + ")", "Offer " + demand + " flames to be left alone.", returnPlace(), function () {
        LT.game.textEnd = LT.incrementMoney(-demand);
        LT.game.textStart = harpyXml("HARPY_ATTACK_PAY_OFF");
        if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
      });
      if (LT.getMoney() < demand) pay.disable("You don't have " + demand + " flames.");
      var offer;
      if (npc.attractedToPlayer) {
        offer = LT.ResponseSex("Offer body", LT.parse("Offer your body to [npc.name] so that you can avoid a violent confrontation."), {
          partner: npc,
          playerDom: false,
          consensual: true,
          startText: harpyXml("HARPY_ATTACK_OFFER_BODY"),
          postSexNode: "enc.harpy-after-sex",
        });
      } else {
        offer = new LT.Response(
          "Offer body",
          LT.parse("You can tell that [npc.name] isn't at all interested in having sex with you. You'll either have to offer [npc.herHim] some money, or prepare for a fight!"),
          null,
        ).disable(LT.parse("You can tell that [npc.name] isn't at all interested in having sex with you. You'll either have to offer [npc.herHim] some money, or prepare for a fight!"));
      }
      return [null, fightResponse(npc, "enc.harpy-victory", "enc.harpy-defeat"), pay, offer];
    },
  });

  LT.defineNode({
    id: "enc.harpy-victory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      var n = mugger();
      if (n && n.attractedToPlayer) return harpyXml("AFTER_COMBAT_VICTORY_ATTRACTION");
      return harpyXml("AFTER_COMBAT_VICTORY_NO_ATTRACTION");
    },
    getResponses: function () {
      var npc = mugger();
      var list = [
        null,
        new LT.Response("Continue", "Carry on your way.", returnPlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
      enslaveIfPossible(list, npc);
      lootIfPossible(list, npc, "enc.harpy-victory");
      if (npc && npc.attractedToPlayer) {
        list.push(
          LT.ResponseSex("Sex", "They are asking for it...", {
            partner: npc,
            playerDom: true,
            consensual: true,
            startText: harpyXml("AFTER_COMBAT_VICTORY_SEX"),
            postSexNode: "enc.harpy-after-sex",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "enc.harpy-defeat",
    ui: "dialogue",
    title: "Defeat",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      return harpyXml("AFTER_COMBAT_DEFEAT_GENERIC_START");
    },
    getResponses: function () {
      var npc = mugger();
      var list = [
        null,
        new LT.Response("Continue", "Carry on your way.", returnPlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
      if (npc && npc.attractedToPlayer) {
        list.push(
          LT.ResponseSex("Sex", "They have other ideas.", {
            partner: npc,
            playerDom: false,
            consensual: true,
            postSexNode: "enc.harpy-after-sex",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "enc.harpy-after-sex",
    ui: "dialogue",
    title: "After sex",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindMugger(mugger());
    },
    getContent: function () {
      var n = mugger();
      if (n && LT.combat && LT.combat.lastResult === "victory") return harpyXml("AFTER_SEX_VICTORY");
      return harpyXml("AFTER_SEX_DEFEAT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Carry on your way.", returnPlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "enc.find-item",
    ui: "dialogue",
    title: "Dropped item",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var id = flags().foundEncounterItem;
      LT.addSpecialParse(itemName(id), true);
      LT.addSpecialParse(itemName(id), false);
    },
    getContent: function () {
      return genericXml("HARPY_NESTS_FIND_ITEM");
    },
    getResponses: function () {
      var id = flags().foundEncounterItem;
      var name = itemName(id);
      return [
        null,
        new LT.Response("Take", "Add the " + name + " to your inventory.", returnPlace(), function () {
          if (id && typeof LT.addItem === "function") LT.addItem(LT.game.player, id);
          delete flags().foundEncounterItem;
        }),
        new LT.Response("Leave", "Leave the " + name + " on the floor.", returnPlace(), function () {
          delete flags().foundEncounterItem;
        }),
      ];
    },
  });

  LT.defineNode({
    id: "enc.happiness",
    ui: "dialogue",
    title: "Finding Happiness",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return genericXml("DOMINION_STREET_FIND_HAPPINESS");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your way.", returnPlace())];
    },
  });

  LT.harpyExploreResponses = function () {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    var pacified = harpyPacified();
    if (pacified) {
      list.push(
        new LT.Response(
          "Look for trouble",
          "Although you've pacified the harpy nests, you're sure that you can find a harpy who's looking for a confrontation...",
          null,
          function () {
            LT.game.advanceTime(1800);
            var node = LT.maybePlaceEncounter({ force: true, tableId: "HARPY_NEST_LOOK_FOR_TROUBLE", noRedirect: true });
            if (node) LT.game.setContent(node);
          },
        ),
      );
    } else {
      list.push(
        new LT.Response(
          "Explore",
          "Explore the walkways. Although you don't think you're any more or less likely to find anything by doing this, at least you won't have to keep travelling back and forth...",
          null,
          function () {
            LT.game.advanceTime(1800);
            var node = LT.maybePlaceEncounter({ force: true, tableId: "HARPY_NEST_WALKWAYS", noRedirect: true });
            if (node) LT.game.setContent(node);
          },
        ),
      );
    }
    return list;
  };
})();
