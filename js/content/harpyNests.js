(function () {
  function nestXml(tag) {
    return LT.parseFromXML("places/dominion/harpyNests/helena", tag);
  }

  function generic(tag) {
    return LT.parseFromXML("places/dominion/harpyNests/generic", tag);
  }

  function locDesc() {
    var t = typeof getCurrentTile === "function" ? getCurrentTile() : null;
    var loc = (t && t.location) || {};
    if (loc.description) return "<p>" + loc.description + "</p>";
    return "<p>You are on the Harpy Nests.</p>";
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
      return [null, new LT.Response("Continue", "Step away from the desk and continue on your way.", "place.HARPY_NESTS_ENTRANCE_ENFORCER_POST")];
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

  function otherNest(id, title) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 0,
      chrome: { left: true, right: true },
      getContent: locDesc,
      getResponses: function () {
        return LT.travelResponses ? LT.travelResponses() : [null];
      },
    });
  }
  otherNest("place.HARPY_NESTS_HARPY_NEST_PINK", "Harpy nest");
  otherNest("place.HARPY_NESTS_HARPY_NEST_RED", "Harpy nest");
  otherNest("place.HARPY_NESTS_HARPY_NEST_YELLOW", "Harpy nest");

  LT.defineNode({
    id: "place.HARPY_NESTS_HELENAS_NEST",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
      var h = LT.game.npcs && LT.game.npcs.helena;
      if (h && LT.isWorkTime && LT.isWorkTime()) {
        h.location = { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" };
      }
    },
    getContent: function () {
      if (!(LT.isWorkTime && LT.isWorkTime())) return nestXml("HELENAS_NEST_EXTERIOR_SLEEPING");
      return nestXml("HELENAS_NEST_EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!(LT.isWorkTime && LT.isWorkTime())) {
        list.push(
          new LT.Response("Meet with Helena", "Both Helena and her flock are sleeping in the buildings below her nest.", null).disable(
            "You'll have to come back during the day if you want to speak with her.",
          ),
        );
      } else if (LT.game.flags && LT.game.flags.quest === "MAIN_1_E_REPORT_TO_HELENA") {
        list.push(new LT.Response("Helena", "Walk over to the tall platform to meet with Helena.", "helena.mainQuest"));
      } else if (LT.questReached && LT.questReached("MAIN_1_F_SCARLETTS_FATE")) {
        list.push(new LT.Response("Helena", "Helena has flown off to Slaver Alley! You'll have to find her there.", null).disable("Helena has flown off to Slaver Alley! You'll have to find her there."));
      } else {
        list.push(new LT.Response("Helena", "You have no reason to talk to Helena.", null).disable("You have no reason to talk to Helena."));
      }
      return list;
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
        new LT.Response("Fly after her", "You can't fly, so you'll have to travel to Slaver Alley by foot.", null).disable("You can't fly, so you'll have to travel to Slaver Alley by foot."),
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
      new LT.Response("Fly after her", "You can't fly, so you'll have to travel to Slaver Alley by foot.", null).disable("You can't fly, so you'll have to travel to Slaver Alley by foot."),
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
