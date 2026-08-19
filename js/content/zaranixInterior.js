(function () {
  function gf(tag) {
    return LT.parseFromXML("places/dominion/zaranixHome/groundFloor", tag);
  }
  function ff(tag) {
    return LT.parseFromXML("places/dominion/zaranixHome/firstFloor", tag);
  }

  function canFly() {
    var p = LT.game.player;
    if (!p || !p.body || !p.body.wing) return false;
    return p.body.wing.type && p.body.wing.type !== "NONE" && p.body.wing.size !== "ZERO_NONEXISTENT";
  }

  function physique() {
    var p = LT.game.player;
    if (!p) return 0;
    return typeof LT.effectivePhysique === "function" ? LT.effectivePhysique(p) : p.physique || 0;
  }

  function footOn() {
    return typeof LT.hasProperty !== "function" || LT.hasProperty("footContent");
  }

  function placeNpc(npc, world, place) {
    if (!npc) return;
    npc.location = { world: world, place: place };
  }

  LT.resetZaranixHouse = function () {
    var f = LT.game.flags;
    f.zaranixAmberSubdued = false;
    f.zaranixKatherineSubdued = false;
    f.zaranixKellySubdued = false;
    var a = LT.game.npcs && LT.game.npcs.amber;
    if (a) a.location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
    var k = LT.game.npcs && LT.game.npcs.katherine;
    if (k) k.location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_MAID" };
    var kelly = LT.game.npcs && LT.game.npcs.kelly;
    if (kelly) kelly.location = { world: "ZARANIX_HOUSE_FIRST_FLOOR", place: "ZARANIX_FF_MAID" };
    var z = LT.game.npcs && LT.game.npcs.zaranix;
    if (z) z.location = { world: "ZARANIX_HOUSE_FIRST_FLOOR", place: "ZARANIX_FF_OFFICE" };
  };

  LT.enterZaranixHouse = function (placeType) {
    if (typeof LT.ensureAmber === "function") LT.ensureAmber();
    if (typeof LT.ensureKatherine === "function") LT.ensureKatherine();
    if (typeof LT.ensureKelly === "function") LT.ensureKelly();
    if (typeof LT.ensureZaranix === "function") LT.ensureZaranix();
    if (typeof LT.enterWorld === "function") LT.enterWorld("ZARANIX_HOUSE_GROUND_FLOOR", placeType || "ZARANIX_GF_ENTRANCE");
  };

  LT.placeArthurInLab = function () {
    var a = typeof LT.ensureArthur === "function" ? LT.ensureArthur() : null;
    if (a) a.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" };
    return a;
  };

  LT.rescueArthur = function (opts) {
    opts = opts || {};
    if (opts.move !== false) LT.placeArthurInLab();
    if (LT.game.flags.quest === "MAIN_1_H_THE_GREAT_ESCAPE" && typeof LT.advanceMainQuest === "function") {
      return LT.advanceMainQuest("MAIN_1_I_ARTHURS_TALE");
    }
    return "";
  };

  function leaveHouse(text) {
    LT.resetZaranixHouse();
    if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_DEMON_HOME_ZARANIX");
    if (text) LT.game.textStart = text;
  }

  function placeNode(id, title, seconds, getContent, extraResponses) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: seconds || 20,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        if (typeof LT.ensureKatherine === "function") LT.ensureKatherine();
        if (typeof LT.ensureKelly === "function") LT.ensureKelly();
        if (typeof LT.ensureZaranix === "function") LT.ensureZaranix();
      },
      getContent: getContent,
      getResponses: function () {
        var list = typeof LT.travelResponses === "function" ? LT.travelResponses() : [null];
        if (extraResponses) {
          var extra = extraResponses();
          var i;
          for (i = 0; i < extra.length; i++) if (extra[i]) list.push(extra[i]);
        }
        return list;
      },
    });
  }

  LT.defineNode({
    id: "place.ZARANIX_GF_ENTRANCE",
    ui: "dialogue",
    title: "Entrance Hall",
    secondsPassed: 20,
    chrome: { left: true, right: true },
    getContent: function () {
      var html = gf("ENTRANCE");
      var a = LT.game.npcs && LT.game.npcs.amber;
      if (a && a.location && a.location.place === "ZARANIX_GF_ENTRANCE") html += gf("ENTRANCE_AMBER_PRESENT");
      return html;
    },
    getResponses: function () {
      var list = typeof LT.travelResponses === "function" ? LT.travelResponses() : [null];
      list.push(
        new LT.Response(
          "Exit",
          "Leave Zaranix's house and head back out into Demon Home. You will have to gain entry all over again if you choose to leave now!",
          "place.DOMINION_DEMON_HOME_ZARANIX",
          function () {
            leaveHouse("");
          },
        ),
      );
      var a = LT.game.npcs && LT.game.npcs.amber;
      if (a && a.location && a.location.place === "ZARANIX_GF_ENTRANCE" && LT.game.flags.zaranixAmberSubdued) {
        list.push(
          LT.ResponseSex("Use Amber", "Have some fun with this fiery maid.", {
            partner: LT.ensureAmber(),
            playerDom: true,
            consensual: true,
            startText: gf("ENTRANCE_AMBER_SEX"),
            postSexNode: "place.ZARANIX_GF_ENTRANCE",
          }),
        );
        list.push(
          LT.ResponseSex("Submit", "Submit to Amber.", {
            partner: LT.ensureAmber(),
            manager: "amber_doggy",
            playerDom: false,
            consensual: true,
            startText: gf("ENTRANCE_AMBER_SEX_SUBMIT"),
            postSexNode: "place.ZARANIX_GF_ENTRANCE",
          }),
        );
      }
      return list;
    },
  });

  placeNode("place.ZARANIX_GF_CORRIDOR", "Corridor", 20, function () {
    var html = gf("CORRIDOR");
    if (!LT.game.flags.zaranixKatherineSubdued) html += gf("CORRIDOR_KATHERINE_NOT_SUBDUED");
    return html;
  });

  placeNode(
    "place.ZARANIX_GF_STAIRS",
    "Staircase",
    20,
    function () {
      var html = gf("STAIRS");
      if (!LT.game.flags.zaranixKatherineSubdued) html += gf("STAIRS_KATHERINE_NOT_SUBDUED");
      return html;
    },
    function () {
      return [
        new LT.Response("Upstairs", "Head upstairs to the first floor of Zaranix's house.", "place.ZARANIX_FF_STAIRS", function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("ZARANIX_HOUSE_FIRST_FLOOR", "ZARANIX_FF_STAIRS");
        }),
      ];
    },
  );

  placeNode("place.ZARANIX_GF_GARDEN_ENTRY", "Garden", 20, function () {
    return gf("GARDEN_ENTRY");
  });
  placeNode("place.ZARANIX_GF_GARDEN", "Garden", 20, function () {
    return gf("GARDEN");
  });
  placeNode("place.ZARANIX_GF_GARDEN_ROOM", "Room", 20, function () {
    var html = gf("GARDEN_ROOM");
    if (!LT.game.flags.zaranixKatherineSubdued) html += gf("GARDEN_ROOM_KATHERINE_NOT_SUBDUED");
    return html;
  });
  placeNode("place.ZARANIX_GF_ROOM", "Room", 20, function () {
    return gf("ROOM");
  });

  LT.defineNode({
    id: "place.ZARANIX_GF_LOUNGE",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      if (LT.game.flags.zaranixAmberSubdued) return gf("LOUNGE_AMBER_SUBDUED");
      var a = LT.game.npcs && LT.game.npcs.amber;
      if (a && a.location && a.location.place === "ZARANIX_GF_ENTRANCE") return gf("LOUNGE_EMPTY");
      return gf("LOUNGE_EMPTY");
    },
    getResponses: function () {
      return typeof LT.travelResponses === "function" ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.ZARANIX_GF_MAID",
    ui: "dialogue",
    title: "Corridor",
    secondsPassed: 60,
    travelDisabled: function () {
      return !LT.game.flags.zaranixKatherineSubdued;
    },
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureKatherine === "function") LT.ensureKatherine();
    },
    getContent: function () {
      if (LT.game.flags.zaranixKatherineSubdued) return gf("CORRIDOR_MAID_KATHERINE_SUBDUED");
      var a = LT.game.npcs && LT.game.npcs.amber;
      if (a && a.location && a.location.place === "ZARANIX_GF_ENTRANCE") return gf("CORRIDOR_MAID_KATHERINE_ENCOUNTER_FOUGHT_AMBER");
      if (LT.game.flags.zaranixKatherineFought) return gf("CORRIDOR_MAID_KATHERINE_ENCOUNTER_REPEAT");
      return gf("CORRIDOR_MAID_KATHERINE_ENCOUNTER");
    },
    getResponses: function () {
      var k = LT.ensureKatherine();
      if (LT.game.flags.zaranixKatherineSubdued) {
        return [
          null,
          LT.ResponseSex("Use Katherine", "Have some fun with this maid.", {
            partner: k,
            playerDom: true,
            consensual: true,
            startText: gf("CORRIDOR_MAID_KATHERINE_SEX"),
            postSexNode: "place.ZARANIX_GF_MAID",
          }),
          LT.ResponseSex("Submit", "Submit to Katherine.", {
            partner: k,
            playerDom: false,
            consensual: true,
            startText: gf("CORRIDOR_MAID_KATHERINE_SEX_SUBMIT"),
            postSexNode: "place.ZARANIX_GF_MAID",
          }),
        ];
      }
      return [
        null,
        LT.ResponseCombat("Fight", "Defend yourself against the furious maid!", {
          enemy: k,
          escapeChance: 0,
          victoryNode: "zaranix.katherineVictory",
          defeatNode: "zaranix.katherineDefeat",
          returnNode: "place.ZARANIX_GF_MAID",
          onVictory: function () {
            k.playerKnowsName = true;
            LT.game.flags.zaranixKatherineSubdued = true;
            LT.game.flags.zaranixMaidsHostile = true;
            LT.game.flags.zaranixKatherineFought = true;
            return "";
          },
        }),
      ];
    },
  });

  placeNode("place.ZARANIX_FF_CORRIDOR", "Corridor", 20, function () {
    var html = ff("CORRIDOR");
    if (!LT.game.flags.zaranixKellySubdued) html += ff("CORRIDOR_KELLY_NOT_SUBDUED");
    return html;
  });
  placeNode(
    "place.ZARANIX_FF_STAIRS",
    "Staircase",
    20,
    function () {
      return ff("STAIRS");
    },
    function () {
      return [
        new LT.Response("Downstairs", "Head downstairs to the ground floor of Zaranix's house.", "place.ZARANIX_GF_STAIRS", function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("ZARANIX_HOUSE_GROUND_FLOOR", "ZARANIX_GF_STAIRS");
        }),
      ];
    },
  );
  placeNode("place.ZARANIX_FF_ROOM", "Room", 20, function () {
    return ff("ROOM");
  });

  LT.defineNode({
    id: "place.ZARANIX_FF_MAID",
    ui: "dialogue",
    title: "Corridor",
    secondsPassed: 60,
    travelDisabled: function () {
      return !LT.game.flags.zaranixKellySubdued;
    },
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureKelly === "function") LT.ensureKelly();
    },
    getContent: function () {
      if (LT.game.flags.zaranixKellySubdued) return ff("CORRIDOR_MAID_KELLY_SUBDUED");
      if (LT.game.flags.zaranixKellyFought) return ff("CORRIDOR_MAID_KELLY_ENCOUNTER_REPEAT");
      return ff("CORRIDOR_MAID_KELLY_ENCOUNTER");
    },
    getResponses: function () {
      var k = LT.ensureKelly();
      if (LT.game.flags.zaranixKellySubdued) {
        return [
          null,
          LT.ResponseSex("Use Kelly", "Have some fun with this maid.", {
            partner: k,
            playerDom: true,
            consensual: true,
            startText: ff("CORRIDOR_MAID_KELLY_SEX"),
            postSexNode: "place.ZARANIX_FF_MAID",
          }),
          LT.ResponseSex("Submit", "Submit to Kelly.", {
            partner: k,
            playerDom: false,
            consensual: true,
            startText: ff("CORRIDOR_MAID_KELLY_SEX_SUBMIT"),
            postSexNode: "place.ZARANIX_FF_MAID",
          }),
        ];
      }
      return [
        null,
        LT.ResponseCombat("Fight", "Defend yourself against the furious maid!", {
          enemy: k,
          escapeChance: 0,
          victoryNode: "zaranix.kellyVictory",
          defeatNode: "zaranix.kellyDefeat",
          returnNode: "place.ZARANIX_FF_MAID",
          onVictory: function () {
            k.playerKnowsName = true;
            LT.game.flags.zaranixKellySubdued = true;
            LT.game.flags.zaranixMaidsHostile = true;
            LT.game.flags.zaranixKellyFought = true;
            return "";
          },
        }),
      ];
    },
  });

  LT.defineNode({
    id: "place.ZARANIX_FF_OFFICE",
    ui: "dialogue",
    title: "Zaranix's Lab",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureZaranix === "function") LT.ensureZaranix();
    },
    getContent: function () {
      return ff("ZARANIX_ROOM");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Zaranix's lab", "You find yourself stepping into a laboratory much like that of Lilaya's.", "zaranix.labEntry", function () {
          LT.game.flags.zaranixMaidsHostile = true;
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.labEntry",
    ui: "dialogue",
    title: "Zaranix's Lab",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return ff(LT.game.flags.zaranixFought ? "ZARANIX_ROOM_ENTRY_REPEAT" : "ZARANIX_ROOM_ENTRY");
    },
    getResponses: function () {
      if (LT.game.flags.zaranixFought) {
        return [
          null,
          LT.ResponseCombat("Fight", "Defend yourself against Zaranix's attack!", {
            enemy: LT.ensureZaranix(),
            escapeChance: 0,
            victoryNode: "zaranix.zaranixVictory",
            defeatNode: "zaranix.zaranixDefeat",
            returnNode: "zaranix.labEntry",
          }),
        ];
      }
      return [
        null,
        new LT.Response("Demand Arthur", "Refuse to tell Zaranix why you're here, and instead simply demand that he hand over Arthur to you.", "zaranix.labDemand").withColour(LT.Colour.GENERIC_BAD),
        new LT.Response("Explain everything", "Tell Zaranix that Lilaya needs Arthur in order to help her unravel the mystery of inter-dimensional travel.", "zaranix.labExplain", function () {
          LT.game.textEnd = LT.rescueArthur();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.labDemand",
    ui: "dialogue",
    title: "Zaranix's Lab",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return ff("ZARANIX_ROOM_NO_EXPLANATION");
    },
    getResponses: function () {
      return [
        null,
        LT.ResponseCombat("Fight", "Defend yourself against Zaranix's attack!", {
          enemy: LT.ensureZaranix(),
          escapeChance: 0,
          victoryNode: "zaranix.zaranixVictory",
          defeatNode: "zaranix.zaranixDefeat",
          returnNode: "zaranix.labDemand",
          onVictory: function () {
            LT.game.flags.zaranixFought = true;
            return LT.rescueArthur();
          },
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.labExplain",
    ui: "dialogue",
    title: "Zaranix's Lab",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return ff("ZARANIX_ROOM_EXPLANATION");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Leave Zaranix's house.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          leaveHouse(ff("ZARANIX_ROOM_EXPLANATION_THANKS"));
        }),
        LT.ResponseSex("'Thank' Zaranix", "You feel a little sorry for Zaranix. Perhaps you could offer to give him a blowjob as thanks...", {
          partner: LT.ensureZaranix(),
          playerDom: false,
          consensual: true,
          startText: ff("ZARANIX_ROOM_EXPLANATION_SEXY_THANKS") + ff("ZARANIX_ROOM_EXPLANATION_SEXY_THANKS_START"),
          postSexNode: "zaranix.afterThankZaranixLab",
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.afterThankZaranixLab",
    ui: "dialogue",
    title: "Zaranix is finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return ff("ZARANIX_ROOM_EXPLANATION_SEXY_THANKS_POST_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Continue on your journey.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          leaveHouse("");
        }),
      ];
    },
  });

  function maidVictory(id, title, name, place) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 0,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        if (name === "Katherine") {
          return LT.parse(
            "<p>Katherine staggers back, gripping the edge of a nearby cabinet as she collapses against the wall. She doesn't seem all that upset at having failed to defend her master's home, as she looks up at you and moans, [katherine.speech(~Ah!~ Oh no! I'm totally defenceless! ~Mmm!~ Nothing can stop you from having your way with me now!)]</p><p>It's quite obvious that she wants to have sex with you, and she continues to moan and pant with desire as she leans back against the wall. Unable to wait even two seconds to hear your reply, her hands slip under her dress, and she starts shamelessly masturbating right there in front of you.</p><p>In her current lust-filled state, Katherine isn't going to pose much of a threat from now on, so you could either do what she obviously wants you to do, and have sex with her, or simply ignore her and continue on your way.</p>",
          );
        }
        return LT.parse(
          "<p>Kelly staggers back, gripping the edge of a nearby cabinet as she collapses against the wall. She doesn't seem all that upset at having failed to defend her master's home, as she looks up at you and moans, [kelly.speech(~Ah!~ Oh no! I'm totally defenceless! ~Mmm!~ Nothing can stop you from having your way with me now!)]</p><p>It's quite obvious that she wants to have sex with you, and she continues to moan and pant with desire as she leans back against the wall. Unable to wait even two seconds to hear your reply, her hands slip under her dress, and she starts shamelessly masturbating right there in front of you.</p><p>In her current lust-filled state, Kelly isn't going to pose much of a threat from now on, so you could either do what she obviously wants you to do, and have sex with her, or simply ignore her and continue on your way.</p>",
        );
      },
      getResponses: function () {
        var npc = name === "Katherine" ? LT.ensureKatherine() : LT.ensureKelly();
        return [
          null,
          new LT.Response("Continue", "Continue exploring Zaranix's house.", place),
          LT.ResponseSex("Use " + name, "Have some fun with the horny maid.", {
            partner: npc,
            playerDom: true,
            consensual: true,
            postSexNode: place,
          }),
          LT.ResponseSex("Submit", "Submit to " + name + ".", {
            partner: npc,
            playerDom: false,
            consensual: true,
            postSexNode: place,
          }),
        ];
      },
    });
  }

  maidVictory("zaranix.katherineVictory", "Victory", "Katherine", "place.ZARANIX_GF_MAID");
  maidVictory("zaranix.kellyVictory", "Victory", "Kelly", "place.ZARANIX_FF_MAID");

  function maidDefeat(id, name) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: "Defeated",
      secondsPassed: 60,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.parse(
          "<p>" +
            name +
            " proves too much for you. The maid drags you back to the front door and throws you out into the street.</p>",
        );
      },
      getResponses: function () {
        return [
          null,
          new LT.Response("Continue", "You've been thrown back out onto the street.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
            leaveHouse("");
          }),
        ];
      },
    });
  }
  maidDefeat("zaranix.katherineDefeat", "Katherine");
  maidDefeat("zaranix.kellyDefeat", "Kelly");

  LT.defineNode({
    id: "zaranix.zaranixVictory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return (
        LT.parse(
          "<p>Zaranix staggers back from the fight, no longer able to stop you. With his household in disarray, there's nothing preventing you from taking Arthur and leaving.</p>",
        ) + (LT.game.textEnd || "")
      );
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Take Arthur and leave Zaranix's house.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          if (!LT.game.flags.quest || LT.game.flags.quest === "MAIN_1_H_THE_GREAT_ESCAPE") {
            LT.game.textEnd = (LT.game.textEnd || "") + LT.rescueArthur();
          }
          leaveHouse("<p>You escort Arthur out of the house and back onto the streets of Demon Home. Lilaya will want to hear everything.</p>");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.zaranixDefeat",
    ui: "dialogue",
    title: "Defeated",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.parse("<p>Zaranix overpowers you and has his maids throw you back out onto the street.</p>");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "You've been thrown back out onto the street.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          LT.game.flags.zaranixFought = true;
          leaveHouse("");
        }),
      ];
    },
  });

  LT.canFlyOverZaranix = canFly;
  LT.zaranixPhysique = physique;
  LT.zaranixFootOn = footOn;
  LT.placeZaranixNpc = placeNpc;
})();
