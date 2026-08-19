(function () {
  function nestXml(tag) {
    return LT.parseFromXML("places/dominion/harpyNests/helena", tag);
  }

  function generic(tag) {
    return LT.parseFromXML("places/dominion/harpyNests/generic", tag);
  }

  LT.defineNode({
    id: "place.DOMINION_HARPY_NESTS_ENTRANCE",
    ui: "dialogue",
    title: "Harpy Nests Entrance",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      return generic("OUTSIDE");
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.DOMINION_STREET_HARPY_NESTS",
    ui: "dialogue",
    title: "Dominion Streets",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      return LT.getNode("place.generic").getContent();
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.HARPY_NESTS_ENTRANCE_ENFORCER_POST",
    ui: "dialogue",
    title: "Enforcer post",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return generic("ENTRANCE_ENFORCER_POST");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!(LT.game.flags && LT.game.flags.hasHarpyNestAccess)) {
        list.push(new LT.Response("Request access", "Walk up to the desk and ask if you can visit the Harpy Nests.", "harpy.access"));
      } else if (!LT.game.flags.harpyQuest) {
        list.push(new LT.Response("Angry Harpies", "Ask one of the Enforcers about the recent troubles in the Harpy Nests.", "harpy.angry"));
      } else if (LT.game.flags.harpyQuest === "HARPY_PACIFICATION_REWARD") {
        list.push(
          new LT.Response("Report back", "Report to the Enforcer that you've calmed the three matriarchs down.", "harpy.report", function () {
            LT.game.textEnd = (typeof LT.advanceHarpyQuest === "function" ? LT.advanceHarpyQuest("complete") : "") + (typeof LT.incrementMoney === "function" ? LT.incrementMoney(5000) : "");
          }),
        );
      } else if (LT.game.flags.harpyQuest !== "complete") {
        list.push(new LT.Response("Report back", "You haven't calmed the three matriarchs down yet!", null).disable("You haven't calmed the three matriarchs down yet!"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "harpy.access",
    ui: "dialogue",
    title: "Enforcer post",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.hasHarpyNestAccess = true;
    },
    getContent: function () {
      return generic("ENTRANCE_ENFORCER_POST_ASK_FOR_ACCESS");
    },
    getResponses: function () {
      return LT.getNode("place.HARPY_NESTS_ENTRANCE_ENFORCER_POST").getResponses(LT.game, 0);
    },
  });

  LT.defineNode({
    id: "harpy.angry",
    ui: "dialogue",
    title: "Enforcer post",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return generic("ENTRANCE_ENFORCER_POST_ASK_ABOUT_RIOTS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Follow", "Do as the horse-boy asks and follow him.", "harpy.angryNext", function () {
          LT.game.textEnd = typeof LT.startHarpyQuest === "function" ? LT.startHarpyQuest() : "";
        }),
      ];
    },
  });

  LT.defineNode({
    id: "harpy.angryNext",
    ui: "dialogue",
    title: "Enforcer post",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return generic("ENTRANCE_ENFORCER_POST_ASK_ABOUT_RIOTS_NEXT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Having agreed to help pacify the Harpy Nests, you leave the horse-boy's office...", "place.HARPY_NESTS_ENTRANCE_ENFORCER_POST", function () {
          LT.game.textStart = generic("ENTRANCE_ENFORCER_POST_ASK_ABOUT_RIOTS_NEXT_LEAVE");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "harpy.report",
    ui: "dialogue",
    title: "Enforcer post",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return generic("ENTRANCE_ENFORCER_POST_COMPLETED_PACIFICATION");
    },
    getResponses: function () {
      return LT.getNode("place.HARPY_NESTS_ENTRANCE_ENFORCER_POST").getResponses(LT.game, 0);
    },
  });

  LT.defineNode({
    id: "place.HARPY_NESTS_WALKWAYS",
    ui: "dialogue",
    title: "Walkway",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      return generic("WALKWAY");
    },
    getResponses: function () {
      return typeof LT.harpyExploreResponses === "function" ? LT.harpyExploreResponses() : LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.HARPY_NESTS_WALKWAYS_BRIDGE",
    ui: "dialogue",
    title: "Walkway Bridge",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      return generic("WALKWAY_BRIDGE");
    },
    getResponses: function () {
      return typeof LT.harpyExploreResponses === "function" ? LT.harpyExploreResponses() : LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  function storming() {
    return !!(LT.isArcaneStorm && LT.isArcaneStorm());
  }

  function awakeNest() {
    return !!(LT.isWorkTime && LT.isWorkTime()) && !storming();
  }

  function romanceHelenaDone() {
    return !!(LT.game.flags && LT.game.flags.helenaRomance === "complete");
  }

  function scarlettAtNest() {
    if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
    var s = LT.game.npcs && LT.game.npcs.scarlett;
    if (!s || !s.location || s.location.place !== "HARPY_NESTS_HELENAS_NEST") return false;
    if (LT.game.flags && LT.game.flags.scarlettGoneHome === (typeof LT.dayNumber === "function" ? LT.dayNumber() : 0)) return false;
    return true;
  }

  function helenaAtNest() {
    if (!romanceHelenaDone()) return false;
    if (!awakeNest()) return false;
    var h = LT.game.npcs && LT.game.npcs.helena;
    return !!(h && h.location && h.location.place === "HARPY_NESTS_HELENAS_NEST");
  }

  function flyAfterHelena() {
    if (LT.isAbleToFly && LT.isAbleToFly()) {
      return new LT.Response("Fly after her", "Take off and fly after Helena.", "helena.takeFlight");
    }
    if (LT.game.player && LT.game.player.hasCompanions && LT.game.player.hasCompanions()) {
      return new LT.Response("Fly after her", "As your companion is unable to fly, you'll have to travel to Slaver Alley by foot...", null).disable(
        "As your companion is unable to fly, you'll have to travel to Slaver Alley by foot...",
      );
    }
    return new LT.Response("Fly after her", "You can't fly, so you'll have to travel to Slaver Alley by foot.", null).disable(
      "You can't fly, so you'll have to travel to Slaver Alley by foot.",
    );
  }

  LT.defineNode({
    id: "place.HARPY_NESTS_HELENAS_NEST",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
      var h = LT.game.npcs && LT.game.npcs.helena;
      if (h) {
        if (LT.game.flags && LT.game.flags.quest === "MAIN_1_E_REPORT_TO_HELENA" && awakeNest()) {
          h.location = { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" };
        } else if (romanceHelenaDone() && awakeNest()) {
          h.location = { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" };
        }
      }
    },
    getContent: function () {
      if (storming()) return nestXml("HELENAS_NEST_EXTERIOR_STORM");
      if (!(LT.isWorkTime && LT.isWorkTime())) return nestXml("HELENAS_NEST_EXTERIOR_SLEEPING");
      return nestXml("HELENAS_NEST_EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (storming()) {
        list.push(
          new LT.Response("Helena", "Helena's flock is taking shelter in the buildings below her nest. You'll have to come back after the arcane storm has passed.", null).disable(
            "Helena's flock is taking shelter in the buildings below her nest. You'll have to come back after the arcane storm has passed.",
          ),
        );
      } else if (!(LT.isWorkTime && LT.isWorkTime())) {
        var sleepTip =
          LT.questReached && LT.questReached("MAIN_1_F_SCARLETTS_FATE")
            ? "Both Helena and her flock are sleeping in the buildings below her nest. If you wanted to speak with Helena, you should go to her shop in Slaver Alley."
            : "Both Helena and her flock are sleeping in the buildings below her nest. You'll have to come back during the day if you want to speak with her.";
        list.push(new LT.Response("Meet with Helena", sleepTip, null).disable(sleepTip));
      } else if (LT.game.flags && LT.game.flags.quest === "MAIN_1_E_REPORT_TO_HELENA") {
        list.push(new LT.Response("Helena", "Walk over to the tall platform to meet with Helena.", "helena.mainQuest"));
      } else if (helenaAtNest()) {
        list.push(new LT.Response("Helena", "Walk over to the tall platform to meet with Helena.", "helena.nest"));
      } else if (LT.questReached && LT.questReached("MAIN_1_F_SCARLETTS_FATE")) {
        list.push(new LT.Response("Helena", "Helena has flown off to Slaver Alley! You'll have to find her there.", null).disable("Helena has flown off to Slaver Alley! You'll have to find her there."));
      } else {
        list.push(new LT.Response("Helena", "You have no reason to talk to Helena.", null).disable("You have no reason to talk to Helena."));
      }
      if (scarlettAtNest()) {
        if (storming()) {
          list.push(
            new LT.Response(
              "Scarlett",
              "As there's an arcane storm currently raging overhead, Scarlett and the rest of the nest's inhabitants are sheltering in the buildings below her nest. You'll have to come back once the storm has passed if you want to speak with her.",
              null,
            ).disable(
              "As there's an arcane storm currently raging overhead, Scarlett and the rest of the nest's inhabitants are sheltering in the buildings below her nest.",
            ),
          );
        } else if (!(LT.isWorkTime && LT.isWorkTime())) {
          list.push(
            new LT.Response("Scarlett", "Both Scarlett and the rest of Helena's flock are sleeping in the buildings below her nest. You'll have to come back during the day if you want to speak with her.", null).disable(
              "Both Scarlett and the rest of Helena's flock are sleeping in the buildings below her nest.",
            ),
          );
        } else if (romanceHelenaDone()) {
          list.push(new LT.Response("Scarlett", "Head over to where Scarlett is surrounded by a crowd of harpies and say hello.", "helena.meetScarlett"));
        } else {
          list.push(new LT.Response("Scarlett", "Head over to where Scarlett is sitting and say hello.", "helena.meetScarlett"));
        }
      }
      if (LT.game.flags && LT.game.flags.helenaDateFirstDateComplete) {
        list.push(
          new LT.Response("Dominion", "Use the elevator to travel down through 'The Golden Feather' and out into Dominion.", "place.DOMINION_HELENA_HOTEL", function () {
            if (typeof LT.generateHelenaHotelTile === "function") LT.generateHelenaHotelTile();
            if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_HELENA_HOTEL");
            LT.game.textStart = LT.parseFromXML("places/dominion/helenaHotel/hotel", "HOTEL_TRAVEL_TO_DOMINION");
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.takeFlight",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_MAIN_QUEST_TAKE_FLIGHT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Scarlett's Shop", "You arrive at Scarlett's Shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP", function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("SLAVER_ALLEY", "SLAVER_ALLEY_SCARLETTS_SHOP");
          else if (LT.game.player) LT.game.player.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.mainQuest",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
    },
    getContent: function () {
      return nestXml("HELENAS_NEST_MAIN_QUEST");
    },
    getResponses: function () {
      return [null, new LT.Response("Scarlett's woe", "Tell Helena about Scarlett's failure to run her slavery business.", "helena.scarlettWoe")];
    },
  });

  LT.defineNode({
    id: "helena.scarlettWoe",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_MAIN_QUEST_SCARLETT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("No punishment", "Don't take Scarlett's punishment for her.", "helena.noPunishment", function () {
          LT.game.textEnd = LT.advanceMainQuest("MAIN_1_F_SCARLETTS_FATE");
        }),
        new LT.Response("Take punishment", "Offer to take Scarlett's punishment for her.", "helena.punish"),
      ];
    },
  });

  LT.defineNode({
    id: "helena.noPunishment",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_MAIN_QUEST_NO_PUNISHMENT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Leave Helena's nest.", "place.HARPY_NESTS_HELENAS_NEST", function () {
          LT.game.textStart = nestXml("HELENAS_NEST_MAIN_QUEST_LEAVING");
          var h = LT.game.npcs && LT.game.npcs.helena;
          if (h) h.location = null;
        }),
        flyAfterHelena(),
      ];
    },
  });

  function punishEndResponses() {
    return [
      null,
      new LT.Response("Leave", "Leave Helena's nest.", "place.HARPY_NESTS_HELENAS_NEST", function () {
        LT.game.textStart = nestXml("HELENAS_NEST_MAIN_QUEST_LEAVING");
        var h = LT.game.npcs && LT.game.npcs.helena;
        if (h) h.location = null;
      }),
      flyAfterHelena(),
    ];
  }

  function punishChoice(id, xmlTag) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: "Helena's nest",
      secondsPassed: 180,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        LT.game.flags.punishedByHelena = true;
        if (LT.game.flags.quest === "MAIN_1_E_REPORT_TO_HELENA") {
          LT.game.textEnd = LT.advanceMainQuest("MAIN_1_F_SCARLETTS_FATE");
        }
      },
      getContent: function () {
        return nestXml(xmlTag) + nestXml("HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_END");
      },
      getResponses: punishEndResponses,
    });
  }

  LT.defineNode({
    id: "helena.punish",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Endure it", "Try and keep quiet and endure your punishment.", "helena.endure"),
        new LT.Response("Struggle", "Start struggling and crying out in discomfort.", "helena.struggle"),
        new LT.Response("Beg for more", "Beg to be punished.", "helena.enjoy"),
      ];
    },
  });

  punishChoice("helena.endure", "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_ENDURE");
  punishChoice("helena.struggle", "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_STRUGGLE");
  punishChoice("helena.enjoy", "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_ENJOY");
})();
