(function () {
  var HQ_PUBLIC = {
    ENFORCER_HQ_ENTRANCE: true,
    ENFORCER_HQ_WAITING_AREA: true,
    ENFORCER_HQ_RECEPTION_DESK: true,
    ENFORCER_HQ_GUARDED_DOOR: true,
  };

  function generic(tag) {
    return LT.parseFromXML("places/dominion/enforcerHQ/generic", tag);
  }

  function braxXml(tag) {
    return LT.parseFromXML("places/dominion/enforcerHQ/brax", tag);
  }

  function placeType() {
    return (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "";
  }

  function hasPass() {
    return !!(LT.game.flags && LT.game.flags.accessToEnforcerHQ) && !(LT.questReached && LT.questReached("MAIN_1_D_SLAVERY"));
  }

  LT.canEnterTile = function (tile) {
    if (!tile || !window.grid) return true;
    var pt = tile.location && tile.location.placeType;
    if (grid.gridName === "ENFORCER_HQ") {
      if (!pt || HQ_PUBLIC[pt]) return true;
      return hasPass();
    }
    if (grid.gridName === "HARPY_NEST") {
      if (LT.game.flags && LT.game.flags.hasHarpyNestAccess) return true;
      return pt === "HARPY_NESTS_ENTRANCE_ENFORCER_POST";
    }
    return true;
  };

  function leaveToStreet() {
    if (typeof LT.travelToPlace === "function") LT.travelToPlace("DOMINION", "DOMINION_ENFORCER_HQ");
  }

  LT.defineNode({
    id: "place.DOMINION_ENFORCER_HQ",
    ui: "dialogue",
    title: "Enforcer HQ",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return generic("EXTERIOR");
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  function defineHqPlace(id, title, tag, extras) {
    extras = extras || {};
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 0,
      chrome: { left: true, right: true },
      applyPreParsingEffects: extras.applyPreParsingEffects || function () {
        if (typeof LT.ensureCandi === "function") LT.ensureCandi();
        if (typeof LT.ensureBrax === "function") LT.ensureBrax();
      },
      getContent: extras.getContent || function () {
        return generic(tag);
      },
      getResponses: extras.getResponses || function () {
        return LT.travelResponses ? LT.travelResponses() : [null];
      },
    });
  }

  defineHqPlace("place.ENFORCER_HQ_ENTRANCE", "Entranceway", "ENTRANCE");
  defineHqPlace("place.ENFORCER_HQ_WAITING_AREA", "Waiting area", "WAITING_AREA");
  defineHqPlace("place.ENFORCER_HQ_CORRIDOR", "Corridor", "CORRIDOR", {
    getContent: function () {
      var html = generic("CORRIDOR");
      var loc = LT.game.player && LT.game.player.location;
      if (loc && loc.x === 4 && loc.y === 4) html += generic("CORRIDOR_BRAX_WARNING");
      return html;
    },
  });
  defineHqPlace("place.ENFORCER_HQ_CELLS_CORRIDOR", "Corridor", "CORRIDOR_PLAIN");
  defineHqPlace("place.ENFORCER_HQ_OFFICE", "Locked Office", "OFFICE");
  defineHqPlace("place.ENFORCER_HQ_STAIRS", "Guarded Staircase", "STAIRCASE");
  defineHqPlace("place.ENFORCER_HQ_CELL", "Cell", "CELL");
  defineHqPlace("place.ENFORCER_HQ_CELLS_OFFICE", "Cells Office", "CELLS_OFFICE");
  defineHqPlace("place.ENFORCER_HQ_LOCKED_DOOR", "Locked door", "LOCKED_DOOR");
  defineHqPlace("place.ENFORCER_HQ_LOCKED_DOOR_EDGE", "Locked door", "LOCKED_DOOR");
  defineHqPlace("place.ENFORCER_HQ_REQUISITIONS_DOOR", "Locked door", "LOCKED_DOOR");
  defineHqPlace("place.ENFORCER_HQ_REQUISITIONS", "Requisitions Desk", "LOCKED_DOOR");
  defineHqPlace("place.ENFORCER_HQ_OFFICE_QUARTERMASTER", "Quartermaster's Office", "OFFICE");
  defineHqPlace("place.ENFORCER_HQ_ENFORCER_ENTRANCE", "Enforcer Entrance", "ENTRANCE");

  defineHqPlace("place.ENFORCER_HQ_RECEPTION_DESK", "Reception desk", "RECEPTION_DESK", {
    applyPreParsingEffects: function () {
      if (typeof LT.ensureCandi === "function") LT.ensureCandi();
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      var open = LT.isOfficeHours && LT.isOfficeHours();
      var quest = LT.game.flags && LT.game.flags.quest;
      if (open && quest === "MAIN_1_C_WOLFS_DEN" && !LT.game.flags.accessToEnforcerHQ) {
        list.push(new LT.Response("Greet Candi", "Get her attention by saying hello.", "enforcer.candi"));
      }
      return list;
    },
  });

  defineHqPlace("place.ENFORCER_HQ_GUARDED_DOOR", "Guarded door", "GUARDED_DOOR", {
    getResponses: function () {
      var list = [null];
      if (!hasPass()) {
        list.push(
          new LT.Response("Step back", "You don't really see much option other than to do as the Enforcer says.", null, function () {
            LT.game.textStart = generic("GUARDED_DOOR_STEP_BACK");
            if (typeof LT.travelToPlace === "function") LT.travelToPlace("ENFORCER_HQ", "ENFORCER_HQ_WAITING_AREA");
          }),
        );
      }
      return list;
    },
  });

  defineHqPlace("place.ENFORCER_HQ_BRAXS_OFFICE", "Brax's Office", null, {
    getContent: function () {
      var place = (LT.places && LT.places.ENFORCER_HQ_BRAXS_OFFICE) || {};
      return "<p>" + (place.description || "Enforcers of the rank 'Inspector' are allowed their own office.") + "</p>";
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (LT.game.flags && LT.game.flags.quest === "MAIN_1_C_WOLFS_DEN") {
        list.push(new LT.Response("Enter", LT.parse("Step into [brax.namePos] office."), "enforcer.brax"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "enforcer.candi",
    ui: "dialogue",
    title: "Enforcer HQ",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.metCandi = true;
      if (typeof LT.ensureCandi === "function") LT.ensureCandi();
    },
    getContent: function () {
      return generic("INTERIOR_SECRETARY");
    },
    getResponses: function () {
      return [
        new LT.Response("Step back", "Tell Candi that you'll be back later and step away from her desk.", "place.ENFORCER_HQ_WAITING_AREA", function () {
          LT.game.textStart = generic("INTERIOR_SECRETARY_LEAVE");
        }),
        new LT.Response(LT.parse("[brax.name]"), LT.parse("Tell her that you're here to see [brax.name]."), "enforcer.candiBrax", function () {
          LT.game.flags.accessToEnforcerHQ = true;
        }),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.candiBrax",
    ui: "dialogue",
    title: "Enforcer HQ",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return generic("INTERIOR_SECRETARY_BRAX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "Step back",
          "Now that you've got what you were after, you can step away from Candi's desk.",
          "place.ENFORCER_HQ_WAITING_AREA",
        ),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.brax",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
      var b = LT.game.npcs.brax;
      if (b) b.location = { world: "ENFORCER_HQ", place: "ENFORCER_HQ_BRAXS_OFFICE" };
    },
    getContent: function () {
      return braxXml("INTERIOR_BRAX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Truth", "Tell [brax.name] who you are, and that you're here to find out what happened to Arthur.", "enforcer.braxTruth"),
        new LT.Response(
          "Lie",
          "You notice that all of the models in the posters are wolf-girls. Perhaps you could pretend that Arthur is a patron of an exclusive wolf-girl themed brothel that you so happen to own...",
          "enforcer.braxLie",
        ),
        new LT.Response(
          "Wolf-tease",
          "Use your feminine wolf-like body to tease [brax.name] into giving you information about Arthur.",
          null,
        ).disable("You need to be a feminine wolf-morph, and that transformation is not in this build."),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxTruth",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("INTERIOR_BRAX_TRUTH");
    },
    getResponses: function () {
      return [
        null,
        braxFight("If you want to find out what happened to Arthur, you're going to have to fight [brax.name]!"),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxLie",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("INTERIOR_BRAX_LIE");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "Keep on bluffing",
          "Imply that 'The She-wolf's Den' is a brothel you own. If he'll give you information about Arthur, you'll give him VIP status.",
          "enforcer.braxBluff",
        ),
        new LT.Response(
          "Drop the act",
          "Tell [brax.name] that he's an idiot and you're here to find out what he's done with Arthur.",
          "enforcer.braxIdiot",
        ),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxIdiot",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("INTERIOR_BRAX_LIE_IDIOT_BRAX");
    },
    getResponses: function () {
      return [
        null,
        braxFight("[brax.name] looks extremely embarrassed, and you're sure that you've given yourself at least a small advantage by tricking him like this!"),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxBluff",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("INTERIOR_BRAX_LIE_BLUFFING");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "Let him go",
          "Tell [brax.name] to have fun. From your directions, it'll take at least a couple of hours before he figures out he's been fooled.",
          "enforcer.braxSuccess",
          function () {
            LT.game.textEnd = LT.advanceMainQuest("MAIN_1_D_SLAVERY");
          },
        ),
        new LT.Response("Stop [brax.name]", "Tell [brax.name] that he's an idiot and you're going to beat him up for being such a gullible fool.", "enforcer.braxBluffIdiot"),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxBluffIdiot",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("INTERIOR_BRAX_LIE_BLUFFING_IDIOT_BRAX");
    },
    getResponses: function () {
      return [null, braxFight("Fight [brax.name].")];
    },
  });

  function braxFight(tip) {
    if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    return LT.ResponseCombat("Fight", LT.parse(tip), {
      enemy: LT.game.npcs.brax,
      escapeChance: 0,
      victoryNode: "enforcer.braxVictory",
      defeatNode: "enforcer.braxDefeat",
      onVictory: function () {
        if (LT.game.flags.quest === "MAIN_1_C_WOLFS_DEN") return LT.advanceMainQuest("MAIN_1_D_SLAVERY");
        return "";
      },
      onDefeat: function () {
        LT.game.flags.braxFoughtCount = (LT.game.flags.braxFoughtCount || 0) + 1;
        return "";
      },
    });
  }

  function takeUniform(kind) {
    return function () {
      LT.game.flags.enforcerUniform = kind;
      LT.game.flags.accessToEnforcerHQ = false;
      var b = LT.game.npcs && LT.game.npcs.brax;
      if (b) b.location = null;
      LT.game.textStart =
        "<p>You take the " +
        (kind === "fem" ? "feminine" : "masculine") +
        " Enforcer uniform.</p>";
      leaveToStreet();
    };
  }

  LT.defineNode({
    id: "enforcer.braxVictory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
      if (typeof LT.ensureArthur === "function") LT.ensureArthur();
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
    },
    getContent: function () {
      return braxXml("AFTER_COMBAT_VICTORY");
    },
    getResponses: function () {
      return [
        null,
        typeof LT.lootResponse === "function" ? LT.lootResponse(LT.game.npcs.brax, "enforcer.braxVictory") : null,
        new LT.Response("Leave", "You really don't want to have sex with Brax. Leave his office and continue on your way.", "enforcer.braxVictoryNoSex"),
        LT.ResponseSex(
          "Dominate Brax",
          "Brax's broken, horny form is too much for you to resist, and you can't help but smile down deviously at the wolf-boy as you prepare to make him your bitch.",
          {
            partner: LT.game.npcs.brax,
            playerDom: true,
            consensual: true,
            startText: braxXml("AFTER_COMBAT_VICTORY_DOMINATE"),
            postSexNode: "enforcer.braxAfterDom",
          },
        ),
        LT.ResponseSex(
          "Submit to Brax",
          "Although you've defeated him, your submissive nature is causing you to consider letting Brax dominantly fuck you...",
          {
            partner: LT.game.npcs.brax,
            manager: "brax_doggy",
            playerDom: false,
            consensual: true,
            positionName: "All fours",
            startText: braxXml("AFTER_COMBAT_VICTORY_SUBMIT"),
            postSexNode: "enforcer.braxAfterSub",
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxVictoryNoSex",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("AFTER_COMBAT_VICTORY_NO_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Fem. Uniform", "You take the feminine uniform and find yourself back outside once more, but this time, with new knowledge of Arthur's location.", null, takeUniform("fem")),
        new LT.Response("Masc. Uniform", "You take the manly uniform and find yourself outside once more, but this time, with new knowledge of Arthur's location.", null, takeUniform("masc")),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxDefeat",
    ui: "dialogue",
    title: "Defeat",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    },
    getContent: function () {
      return braxXml("AFTER_COMBAT_DEFEAT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Spit", "Spit out the transformative liquid.", "enforcer.braxDefeatSpit"),
        new LT.Response("Swallow", "Do as Brax says and swallow the strange liquid.", null).disable(
          "Forced transformation is not in this build. Spit, then leave.",
        ),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxDefeatSpit",
    ui: "dialogue",
    title: "Defeat",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("AFTER_DEFEAT_TRANSFORMATION_REFUSED");
    },
    getResponses: function () {
      return [
        null,
        LT.ResponseSex("Dominated", "Brax is far too strong for you to resist...", {
          partner: LT.game.npcs && LT.game.npcs.brax,
          manager: "brax_doggy",
          playerDom: false,
          consensual: false,
          positionName: "All fours",
          startText: braxXml("AFTER_DEFEAT_TRANSFORMATION_REFUSED_DOMINATED"),
          postSexNode: "enforcer.braxAfterSub",
        }),
      ];
    },
  });

  function braxUniforms() {
    return [
      null,
      new LT.Response("Fem. Uniform", "You take the feminine uniform and find yourself back outside once more, but this time, with new knowledge of Arthur's location.", null, takeUniform("fem")),
      new LT.Response("Masc. Uniform", "You take the manly uniform and find yourself outside once more, but this time, with new knowledge of Arthur's location.", null, takeUniform("masc")),
    ];
  }

  LT.defineNode({
    id: "enforcer.braxAfterDom",
    ui: "dialogue",
    title: "Brax collapses",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    },
    getContent: function () {
      return braxXml("AFTER_DOMINANT_SEX");
    },
    getResponses: braxUniforms,
  });

  LT.defineNode({
    id: "enforcer.braxAfterSub",
    ui: "dialogue",
    title: "Brax is done",
    secondsPassed: 1800,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    },
    getContent: function () {
      return braxXml("AFTER_SUBMISSIVE_SEX");
    },
    getResponses: function () {
      if (LT.questReached && LT.questReached("MAIN_1_D_SLAVERY")) return braxUniforms();
      return [
        null,
        new LT.Response("Carry on", "Get up and carry on your way.", "place.ENFORCER_HQ_BRAXS_OFFICE"),
      ];
    },
  });

  LT.defineNode({
    id: "enforcer.braxSuccess",
    ui: "dialogue",
    title: function () {
      return LT.parse("[brax.namePos] Office");
    },
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return braxXml("INTERIOR_BRAX_LIE_BLUFFING_SUCCESS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Fem. uniform", "Take the feminine uniform and leave the Enforcer HQ.", null, takeUniform("fem")),
        new LT.Response("Masc. uniform", "Take the masculine uniform and leave the Enforcer HQ.", null, takeUniform("masc")),
      ];
    },
  });
})();
