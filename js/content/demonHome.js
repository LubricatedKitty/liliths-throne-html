(function () {
  var QUEST_ORDER = [
    "MAIN_1_A_LILAYAS_TESTS",
    "MAIN_1_B_DEMON_HOME",
    "MAIN_1_C_WOLFS_DEN",
    "MAIN_1_D_SLAVERY",
    "MAIN_1_E_REPORT_TO_HELENA",
    "MAIN_1_F_SCARLETTS_FATE",
    "MAIN_1_G_SLAVERY",
    "MAIN_1_H_THE_GREAT_ESCAPE",
    "MAIN_1_I_ARTHURS_TALE",
    "MAIN_1_J_ARTHURS_ROOM",
    "MAIN_2_A_INTO_THE_DEPTHS",
  ];

  var QUEST_NAMES = {
    MAIN_1_A_LILAYAS_TESTS: "Lilaya's Tests",
    MAIN_1_B_DEMON_HOME: "The search for Arthur; Demon Home",
    MAIN_1_C_WOLFS_DEN: "The search for Arthur; The Wolf's Den",
    MAIN_1_D_SLAVERY: "The search for Arthur; Sold into Slavery",
    MAIN_1_E_REPORT_TO_HELENA: "The search for Arthur; Find Helena",
    MAIN_1_F_SCARLETTS_FATE: "The search for Arthur; Scarlett's fate",
    MAIN_1_G_SLAVERY: "The search for Arthur; Slavery",
    MAIN_1_H_THE_GREAT_ESCAPE: "The search for Arthur; The Great Escape",
    MAIN_1_I_ARTHURS_TALE: "The search for Arthur; Conclusion",
    MAIN_1_J_ARTHURS_ROOM: "The search for Arthur; A room of his own",
    MAIN_2_A_INTO_THE_DEPTHS: "Into Submission",
  };

  var QUEST_XP = {
    MAIN_PROLOGUE: 5,
    MAIN_1_A_LILAYAS_TESTS: 10,
    MAIN_1_B_DEMON_HOME: 10,
    MAIN_1_C_WOLFS_DEN: 20,
    MAIN_1_D_SLAVERY: 10,
    MAIN_1_E_REPORT_TO_HELENA: 30,
    MAIN_1_F_SCARLETTS_FATE: 30,
    MAIN_1_G_SLAVERY: 30,
    MAIN_1_H_THE_GREAT_ESCAPE: 200,
    MAIN_1_I_ARTHURS_TALE: 30,
    MAIN_1_J_ARTHURS_ROOM: 30,
    MAIN_2_A_INTO_THE_DEPTHS: 10,
  };

  function xml(tag) {
    return LT.parseFromXML("places/dominion/arthursApartment/apartment", tag);
  }

  function p(html) {
    return "<p>" + html + "</p>";
  }

  LT.questReached = function (id) {
    var cur = LT.game.flags && LT.game.flags.quest;
    return QUEST_ORDER.indexOf(cur) >= QUEST_ORDER.indexOf(id) && QUEST_ORDER.indexOf(id) >= 0;
  };

  LT.advanceMainQuest = function (nextId) {
    var prev = LT.game.flags.quest;
    LT.game.flags.quest = nextId;
    if (typeof LT.syncQuestWorld === "function") LT.syncQuestWorld();
    var html =
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>Quest - Lilith's Throne</b><br/>" +
      "<b style='color:" +
      LT.Colour.GENERIC_GOOD +
      ";'>Task Completed - " +
      (QUEST_NAMES[prev] || prev) +
      "</b><br/><b>New Task - " +
      (QUEST_NAMES[nextId] || nextId) +
      "</b></p>";
    if (typeof LT.incrementExperience === "function" && QUEST_XP[prev]) {
      html += LT.incrementExperience(QUEST_XP[prev]);
    }
    return html;
  };

  function findDominionTile(placeType) {
    var tiles = window.allGrids && window.allGrids.DOMINION;
    if (!tiles) return null;
    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].location && tiles[i].location.placeType === placeType) return tiles[i];
    }
    return null;
  }

  function findDominionXY(x, y) {
    var tiles = window.allGrids && window.allGrids.DOMINION;
    if (!tiles) return null;
    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].x === x && tiles[i].y === y) return tiles[i];
    }
    return null;
  }

  LT.generateArthurTile = function () {
    var existing = findDominionTile("DOMINION_DEMON_HOME_ARTHUR");
    if (existing) return existing;
    var tower = findDominionTile("DOMINION_LILITHS_TOWER");
    var tile = null;
    if (tower) tile = findDominionXY(tower.x - 2, tower.y - 1);
    if (!tile || !tile.location || tile.location.placeType !== "DOMINION_DEMON_HOME") {
      tile = findDominionTile("DOMINION_DEMON_HOME");
    }
    if (!tile || !tile.location) return null;
    var place = (LT.places && LT.places.DOMINION_DEMON_HOME_ARTHUR) || {};
    tile.location.name = "Sawlty Towers";
    tile.location.placeType = "DOMINION_DEMON_HOME_ARTHUR";
    tile.location.passage = "place.DOMINION_DEMON_HOME_ARTHUR";
    tile.location.description = place.description || tile.location.description;
    if (window.grid && grid.gridName === "DOMINION" && typeof findTile === "function") {
      var live = findTile(grid.gridData, tile.x, tile.y);
      if (live) live.location = tile.location;
      if (typeof renderGrid === "function") renderGrid();
    }
    return tile;
  };

  LT.generateZaranixTile = function () {
    var existing = findDominionTile("DOMINION_DEMON_HOME_ZARANIX");
    if (existing) return existing;
    var tower = findDominionTile("DOMINION_LILITHS_TOWER");
    var tile = null;
    if (tower) tile = findDominionXY(tower.x + 1, tower.y - 2);
    if (!tile || !tile.location || tile.location.placeType !== "DOMINION_DEMON_HOME") {
      tile = findDominionTile("DOMINION_DEMON_HOME");
    }
    if (!tile || !tile.location) return null;
    var place = (LT.places && LT.places.DOMINION_DEMON_HOME_ZARANIX) || {};
    tile.location.name = place.name || "Demon Home (Zaranix)";
    tile.location.placeType = "DOMINION_DEMON_HOME_ZARANIX";
    tile.location.passage = "place.DOMINION_DEMON_HOME_ZARANIX";
    tile.location.description = place.description || tile.location.description;
    if (window.grid && grid.gridName === "DOMINION" && typeof findTile === "function") {
      var live = findTile(grid.gridData, tile.x, tile.y);
      if (live) live.location = tile.location;
      if (typeof renderGrid === "function") renderGrid();
    }
    return tile;
  };

  LT.syncQuestWorld = function () {
    if (LT.questReached("MAIN_1_B_DEMON_HOME")) LT.generateArthurTile();
    if (LT.questReached("MAIN_1_H_THE_GREAT_ESCAPE")) LT.generateZaranixTile();
    if (typeof LT.ensureFelicia === "function") LT.ensureFelicia();
    if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    if (typeof LT.ensureCandi === "function") LT.ensureCandi();
    if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
    if (typeof LT.ensureHelena === "function") LT.ensureHelena();
    if (typeof LT.ensureFinch === "function") LT.ensureFinch();
    if (typeof LT.ensureAmber === "function") LT.ensureAmber();
  };

  function streetBody() {
    var pt = LT.game.player && LT.game.player.location && LT.game.player.location.place;
    var html =
      p(
        "From the wide, marble-paved streets, to the immaculate frontages of the regency-style buildings, it's quite clear that this district of 'Demon Home' is one of the more upmarket areas of Dominion. Numerous masterfully-carved statues, the vast majority of which depict some form of demon or another, are dotted around the area, and, considering their subject matter, you assume that these sculptures are what gives this area its name.",
      ) +
      p(
        "As you walk down the street, you pass several fenced-off private gardens; their lush splash of greenery helping to break up the monotony of the surrounding building's creamy-white stone facades. Despite the fact that Demon Home is a little quieter than most of the other areas of Dominion, you notice that there are slightly more Enforcers patrolling the streets; evidence that the wealthy and influential residents of the city are afforded extra protection.",
      );
    if (pt === "DOMINION_DEMON_HOME_ARTHUR") {
      html +=
        "<p><b style='color:" +
        (LT.Colour.BASE_YELLOW_LIGHT || "#f8e1b9") +
        ";'>Sawlty Towers:</b><br/>Arthur's apartment building, 'Sawlty Towers', is located in this particular area of Demon Home.</p>";
    }
    if (pt === "DOMINION_DEMON_HOME_ZARANIX") {
      html +=
        "<p><b style='color:" +
        (LT.Colour.BASE_PINK || "#ff6bda") +
        ";'>Zaranix's Home:</b><br/>Scarlett's note puts Arthur here, in the home of the incubus Zaranix.</p>";
    }
    return html;
  }

  function streetResponses() {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    var pt = LT.game.player && LT.game.player.location && LT.game.player.location.place;
    if (pt === "DOMINION_DEMON_HOME_ARTHUR" && LT.questReached("MAIN_1_B_DEMON_HOME")) {
      list.push(
        new LT.Response(
          "Sawlty Towers",
          LT.game.flags.quest === "MAIN_1_B_DEMON_HOME"
            ? "Find Arthur's apartment in the building using the instructions Lilaya gave to you."
            : "Head over to the Sawlty Towers apartment building.",
          "demonHome.apartment",
        ),
      );
    }
    if (pt === "DOMINION_DEMON_HOME_ZARANIX" && LT.questReached("MAIN_1_H_THE_GREAT_ESCAPE")) {
      list.push(
        new LT.Response(
          "Zaranix's Home",
          "A little way down the road from Arthur's apartment building stands the home of Zaranix; the demon that Scarlett told you about.",
          "zaranix.outside",
        ),
      );
    }
    return list;
  }

  function defineStreet(id, title) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 0,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        if (typeof LT.syncQuestWorld === "function") LT.syncQuestWorld();
      },
      getContent: streetBody,
      getResponses: streetResponses,
    });
  }

  defineStreet("place.DOMINION_DEMON_HOME", "Demon Home");
  defineStreet("place.DOMINION_DEMON_HOME_ARTHUR", "Demon Home");
  defineStreet("place.DOMINION_DEMON_HOME_ZARANIX", "Demon Home");

  LT.defineNode({
    id: "place.DOMINION_DEMON_HOME_GATE",
    ui: "dialogue",
    title: "Demon Home (Gates)",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return (
        p(
          "A set of huge, iron gates have been built across the street here, separating the regular areas of Dominion from that known as 'Demon Home' beyond. Half a dozen elite demon Enforcers are stationed here, keeping a close eye on anyone who comes and goes.",
        ) +
        p(
          "As you walk forwards to pass through the gates, you see one of these demonic guards staring at you. Ignoring their penetrating gaze, you stride forwards, breathing a sigh of relief as you get through to the other side without being stopped.",
        )
      );
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.DOMINION_AUNTS_HOME",
    ui: "dialogue",
    title: "Lilaya's Home",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      return p(
        "Lilaya's home is more of a mansion than a town house, and, due to its impressive size, stands out as a particularly impressive building in this area.",
      );
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  function clearFeliciaFromStreet() {
    var f = LT.game.npcs && LT.game.npcs.felicia;
    if (f) f.location = null;
  }

  LT.defineNode({
    id: "demonHome.apartment",
    ui: "dialogue",
    title: "Sawlty Towers",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureFelicia === "function") LT.ensureFelicia();
      if (typeof LT.ensureBrax === "function") LT.ensureBrax();
    },
    getContent: function () {
      return xml("DEMON_HOME_ARTHURS_APARTMENT");
    },
    getResponses: function () {
      var list = [
        new LT.Response("Leave", "Leave the building and head back out into Demon Home.", "place.DOMINION_DEMON_HOME_ARTHUR", function () {
          clearFeliciaFromStreet();
        }),
      ];
      if (LT.game.flags.quest === "MAIN_1_B_DEMON_HOME") {
        list.push(
          new LT.Response("Arthur's room", "Head up to Arthur's room.", "demonHome.arthursRoom", function () {
            LT.game.textEnd = LT.advanceMainQuest("MAIN_1_C_WOLFS_DEN");
          }),
        );
      } else if (LT.questReached("MAIN_1_C_WOLFS_DEN")) {
        list.push(new LT.Response("Arthur's room", "Arthur is no longer living here...", null).disable("Arthur is no longer living here..."));
        list.push(
          new LT.Response(
            LT.parse("[felicia.Name]'s room"),
            LT.parse("Head up to [felicia.namePos] room."),
            "demonHome.feliciasRoom",
          ),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "demonHome.arthursRoom",
    ui: "dialogue",
    title: "Arthur's Room",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var f = LT.ensureFelicia();
      var loc = LT.game.player && LT.game.player.location;
      f.location = loc ? { world: loc.world, place: loc.place } : { world: "DOMINION", place: "DOMINION_DEMON_HOME_ARTHUR" };
      LT.ensureBrax();
    },
    getContent: function () {
      return xml("DEMON_HOME_ARTHURS_APARTMENT_ARTHURS_ROOM");
    },
    getResponses: function () {
      return [null, new LT.Response("Question dog-girl", "Ask the dog-girl if she knows anything about Arthur's arrest.", "demonHome.arthursRoomEnd")];
    },
  });

  LT.defineNode({
    id: "demonHome.arthursRoomEnd",
    ui: "dialogue",
    title: "Arthur's Room",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var f = LT.ensureFelicia();
      f.playerKnowsName = true;
      LT.game.flags.knowsFelicia = true;
    },
    getContent: function () {
      return xml("DEMON_HOME_ARTHURS_APARTMENT_ARTHURS_ROOM_END");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "You've done all you can here. Head back outside to Demon Home.", "place.DOMINION_DEMON_HOME_ARTHUR", function () {
          clearFeliciaFromStreet();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "demonHome.feliciasRoom",
    ui: "dialogue",
    title: function () {
      return LT.parse("[felicia.NamePos] Room");
    },
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.ensureFelicia();
    },
    getContent: function () {
      return xml("DEMON_HOME_ARTHURS_APARTMENT_FELICIAS_ROOM");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Head back outside to Demon Home.", "place.DOMINION_DEMON_HOME_ARTHUR"),
        new LT.Response("Enter", "Enter Felicia's home.", null).disable("Felicia's apartment is not in this build yet."),
      ];
    },
  });
})();
