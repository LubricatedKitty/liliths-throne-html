(function () {
  function tile() {
    return typeof getCurrentTile === "function" ? getCurrentTile() : null;
  }

  function loc() {
    var t = tile();
    return (t && t.location) || { name: "Unknown", description: "" };
  }

  function p(html) {
    return "<p>" + html + "</p>";
  }

  function inferTravelLabel(cfg) {
    if (!cfg) return "Travel";
    if (cfg.label && cfg.label !== "To") return cfg.label;
    var dest = cfg.nextGridName || "";
    if (/FIRST_FLOOR|_f1|_F1/i.test(dest)) return "Upstairs";
    if (/GROUND_FLOOR|_f0|_F0/i.test(dest)) return "Downstairs";
    if (/WORLD_MAP/i.test(dest)) return "World map";
    return "Travel";
  }

  function inferTravelTip(cfg) {
    var label = inferTravelLabel(cfg);
    if (label === "Enter") return "Enter " + (cfg.nextLocationName || "this location") + ".";
    if (label === "Exit") return "Leave and return to " + (cfg.nextLocationName || "the street") + ".";
    if (label === "Upstairs") return "Go upstairs.";
    if (label === "Downstairs") return "Go downstairs.";
    if (label === "World map") return "Travel to the world map.";
    return "Travel to " + (cfg.nextLocationName || "the connected area") + ".";
  }

  function isDominionExit(placeType) {
    return /^DOMINION_EXIT_(EAST|NORTH|WEST|SOUTH)$/.test(placeType || "");
  }

  function discoveredWorldMap() {
    return !!(LT.game && LT.game.flags && LT.game.flags.discoveredWorldMap);
  }

  LT.canUseTileTravel = function (cfg) {
    if (!cfg || !cfg.nextGridName) return true;
    if (/WORLD_MAP/i.test(cfg.nextGridName) && !discoveredWorldMap()) return false;
    return true;
  };

  LT.travelResponses = function () {
    var list = [null];
    var t = tile();
    var placeType = t && t.location && t.location.placeType;
    if (isDominionExit(placeType)) {
      if (discoveredWorldMap()) {
        list.push(
          new LT.Response("World travel", "Exit Dominion and head out into the wide world...", null, function () {
            LT.useTileTravel();
          }),
        );
      } else {
        list.push(
          new LT.Response(
            "World travel",
            "You don't know what the rest of the world looks like, and, for now, your business is within the city.",
            null,
          ).disable("You don't know what the rest of the world looks like, and, for now, your business is within the city."),
        );
      }
      return list;
    }
    if (t && t.travelConfig && t.travelConfig.nextGridName) {
      var cfg = t.travelConfig;
      var travel = new LT.Response(inferTravelLabel(cfg), inferTravelTip(cfg), null, function () {
        LT.useTileTravel();
      });
      if (!LT.canUseTileTravel(cfg)) {
        travel.disable("You have no reason to leave Dominion yet, and without a map you would get lost.");
      }
      list.push(travel);
    }
    return list;
  };

  LT.defineNode({
    id: "place.generic",
    ui: "dialogue",
    title: function () {
      return loc().name || "Unknown";
    },
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
      else if (typeof LT.maybeStormEncounter === "function") LT.maybeStormEncounter();
      if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
      if (typeof LT.maybeWorkplaceSex === "function") LT.maybeWorkplaceSex();
    },
    getContent: function () {
      var info = loc();
      if (isDominionExit(info.placeType)) {
        if (discoveredWorldMap()) {
          return p(
            "A pair of elite demon Enforcers are keeping a close watch on everyone who enters or leaves the city. Now that you have a map, as well as business out there in the world beyond Dominion, there's nothing stopping you from leaving right now.",
          );
        }
        return (
          p(
            "A pair of elite demon Enforcers are keeping a close watch on everyone who enters or leaves the city. Although there's nothing stopping you from heading out into the world beyond, you have no reason to leave Dominion at the moment, and, without a map, you imagine that it would be quite easy to get lost.",
          ) +
          p("Your quest to find out how to return to your old world will no doubt eventually lead you to places other than Dominion, but for now, your business is within the city itself.")
        );
      }
      var extra = "";
      if (typeof LT.dominionPlaceText === "function") {
        extra = LT.dominionPlaceText(info.placeType) || "";
      }
      if (!extra) {
        extra = info.description ? p(info.description) : p("You are in " + (info.name || "this place") + ".");
      }
      if (LT.game.flags && LT.game.flags.workSex && typeof LT.jobSexText === "function") {
        var rec = LT.findSlave(LT.game.flags.workSex);
        if (rec) extra += LT.jobSexText(rec);
      }
      return extra;
    },
    getResponses: function () {
      var list = LT.travelResponses();
      if (typeof LT.slavePresenceResponses === "function") return LT.slavePresenceResponses(list);
      return list;
    },
  });

  var STREET_NODES = [
    { id: "DOMINION_STREET", title: "Dominion Streets", seconds: 120 },
    { id: "DOMINION_NYAN_APARTMENT", title: "Nyan's Apartment", seconds: 120 },
    { id: "DOMINION_CALLIE_BAKERY", title: "The Creamy Bakey", seconds: 120 },
    { id: "DOMINION_STREET_HARPY_NESTS", title: "Dominion Streets", seconds: 120 },
    { id: "DOMINION_BOULEVARD", title: "Dominion Boulevard", seconds: 90 },
    { id: "DOMINION_PLAZA", title: "Lilith's Plaza", seconds: 180 },
  ];
  STREET_NODES.forEach(function (spec) {
    if (LT.hasNode && LT.hasNode("place." + spec.id)) return;
    LT.defineNode({
      id: "place." + spec.id,
      ui: "dialogue",
      title: spec.title,
      secondsPassed: spec.seconds,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
        else if (typeof LT.maybeStormEncounter === "function") LT.maybeStormEncounter();
      },
      getContent: function () {
        return LT.getNode("place.generic").getContent();
      },
      getResponses: function () {
        return LT.travelResponses();
      },
    });
  });

  ["DOMINION_EXIT_EAST", "DOMINION_EXIT_NORTH", "DOMINION_EXIT_WEST", "DOMINION_EXIT_SOUTH"].forEach(function (id) {
    LT.defineNode({
      id: "place." + id,
      ui: "dialogue",
      title: "Dominion Exit",
      secondsPassed: 120,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.getNode("place.generic").getContent();
      },
      getResponses: function () {
        return LT.travelResponses();
      },
    });
  });
})();
