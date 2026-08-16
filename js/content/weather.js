(function () {
  var ALWAYS_DANGEROUS = {
    DOMINION_BACK_ALLEYS: true,
    DOMINION_DARK_ALLEYS: true,
    DOMINION_ALLEYS_CANAL_CROSSING: true,
    DOMINION_CANAL: true,
    DOMINION_CANAL_END: true,
  };

  /* Official PlaceType.isDangerous() during MAGIC_STORM only. Alleys are always dangerous. */
  var STORM_STREETS = {
    DOMINION_STREET: true,
    DOMINION_SHOPPING_ARCADE: true,
    DOMINION_NYAN_APARTMENT: true,
    DOMINION_CALLIE_BAKERY: true,
    DOMINION_STREET_HARPY_NESTS: true,
    DOMINION_HARPY_NESTS_ENTRANCE: true,
    DOMINION_NIGHTLIFE_DISTRICT: true,
    DOMINION_CITY_HALL: true,
    DOMINION_AUNTS_HOME: true,
    DOMINION_SLAVER_ALLEY: true,
    DOMINION_RED_LIGHT_DISTRICT: true,
    DOMINION_PARK: true,
    DOMINION_HOME_IMPROVEMENT: true,
    DOMINION_WAREHOUSES: true,
    DOMINION_BACK_ALLEYS_SAFE: true,
    DOMINION_EXIT_TO_SUBMISSION: true,
    DOMINION_EXIT_TO_BAT_CAVERNS: true,
  };

  var STREET_TEXT = {
    DOMINION_STREET: "STREET",
    DOMINION_NYAN_APARTMENT: "STREET",
    DOMINION_CALLIE_BAKERY: "STREET",
    DOMINION_STREET_HARPY_NESTS: "STREET_SHADED",
    DOMINION_BOULEVARD: "BOULEVARD",
    DOMINION_PLAZA: "DOMINION_PLAZA",
  };

  function flags() {
    LT.game.flags = LT.game.flags || {};
    return LT.game.flags;
  }

  function randInt(n) {
    return Math.floor(Math.random() * n);
  }

  function hourOf() {
    return typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
  }

  LT.currentWeather = function () {
    return (LT.game && LT.game.flags && LT.game.flags.weather) || "CLOUD";
  };

  LT.isArcaneStorm = function () {
    return LT.currentWeather() === "MAGIC_STORM";
  };

  LT.isStormStreet = function (placeType) {
    return !!(placeType && STORM_STREETS[placeType]);
  };

  LT.isOutdoorPlace = function (placeType) {
    if (!placeType) return false;
    if (ALWAYS_DANGEROUS[placeType] || STORM_STREETS[placeType]) return true;
    if (placeType === "DOMINION_PLAZA" || placeType === "DOMINION_BOULEVARD") return true;
    if (placeType.indexOf("DOMINION_DEMON_HOME") === 0) return true;
    if (placeType.indexOf("WORLD_MAP_") === 0) return true;
    if (/HARPY_NESTS/.test(placeType) && placeType.indexOf("HELENA") < 0) return true;
    return false;
  };

  LT.isStormImmunePlace = function (placeType) {
    return !LT.isOutdoorPlace(placeType);
  };

  LT.isDangerousTile = function (placeType) {
    if (!placeType) return false;
    if (ALWAYS_DANGEROUS[placeType]) return true;
    return !!(LT.isArcaneStorm() && STORM_STREETS[placeType]);
  };

  LT.ensureWeather = function () {
    var f = flags();
    if (f.weatherTimeRemaining == null && f.stormHoursLeft != null) {
      f.weatherTimeRemaining = Math.max(0, Number(f.stormHoursLeft) * 3600);
      delete f.stormHoursLeft;
    }
    if (!f.weather) {
      f.weather = "CLOUD";
      f.weatherTimeRemaining = 18000;
      f.nextStormTime = (LT.game.secondsPassed || 0) + (2880 + 60 * randInt(24)) * 60;
      f.gatheringStormDuration = (240 + randInt(120)) * 60;
    }
    if (f.nextStormTime == null) {
      f.nextStormTime = (LT.game.secondsPassed || 0) + (2880 + 60 * randInt(24)) * 60;
    }
    if (f.gatheringStormDuration == null) {
      f.gatheringStormDuration = (240 + randInt(120)) * 60;
    }
    if (f.weatherTimeRemaining == null) f.weatherTimeRemaining = 0;
    if (f.weather === "MAGIC_STORM" && f.weatherTimeRemaining > 12 * 3600) {
      f.weatherTimeRemaining = 18000;
    }
  };

  LT.setWeatherInSeconds = function (weather, secondsRemaining) {
    var f = flags();
    f.weather = weather;
    f.weatherTimeRemaining = secondsRemaining;
  };

  LT.startArrivalStorm = function () {
    LT.setWeatherInSeconds("MAGIC_STORM", 18000);
  };

  function startGathering() {
    var f = flags();
    var now = LT.game.secondsPassed || 0;
    f.weather = "MAGIC_STORM_GATHERING";
    f.weatherTimeRemaining = Math.max(60, (f.gatheringStormDuration || 0) - (now - f.nextStormTime));
  }

  function handleAtmosphericConditions(seconds) {
    var f = flags();
    f.weatherTimeRemaining -= seconds;
    if (f.weatherTimeRemaining >= 0) return;
    var now = LT.game.secondsPassed || 0;
    switch (f.weather) {
      case "CLEAR":
        if (now >= f.nextStormTime) {
          startGathering();
          break;
        }
        f.weather = "CLOUD";
        f.weatherTimeRemaining = (120 + randInt(120)) * 60;
        break;
      case "CLOUD":
        if (now >= f.nextStormTime) {
          startGathering();
          break;
        }
        if (Math.random() > 0.4) {
          f.weather = (typeof LT.gameNow === "function" && LT.gameNow().getMonth() === 11) ||
            (typeof LT.gameNow === "function" && LT.gameNow().getMonth() === 0) ||
            (typeof LT.gameNow === "function" && LT.gameNow().getMonth() === 1)
            ? "SNOW"
            : "RAIN";
          f.weatherTimeRemaining = (60 + randInt(300)) * 60;
          break;
        }
        f.weather = "CLEAR";
        f.weatherTimeRemaining = (240 + randInt(240)) * 60;
        break;
      case "MAGIC_STORM":
        f.nextStormTime = now + (2880 + 60 * randInt(24)) * 60;
        f.gatheringStormDuration = (240 + randInt(120)) * 60;
        f.weather = "CLEAR";
        f.weatherTimeRemaining = (240 + randInt(240)) * 60;
        break;
      case "MAGIC_STORM_GATHERING":
        f.weather = "MAGIC_STORM";
        f.weatherTimeRemaining = (480 + randInt(240)) * 60;
        break;
      case "RAIN":
      case "SNOW":
        if (now >= f.nextStormTime) {
          startGathering();
          break;
        }
        f.weather = "CLOUD";
        f.weatherTimeRemaining = (120 + randInt(120)) * 60;
        break;
      default:
        f.weather = "CLOUD";
        f.weatherTimeRemaining = (120 + randInt(120)) * 60;
        break;
    }
  }

  LT.tickWeather = function (seconds) {
    if (!LT.game || !seconds) return;
    LT.ensureWeather();
    handleAtmosphericConditions(seconds);
  };

  LT.dominionPlaceText = function (placeType) {
    var tag = STREET_TEXT[placeType];
    if (!tag || typeof LT.parseFromXML !== "function") return "";
    var html = LT.parseFromXML("places/dominion/dominionPlaces", tag === "STREET_SHADED" ? "STREET" : tag);
    if (tag === "STREET_SHADED") {
      html += LT.parseFromXML("places/dominion/dominionPlaces", "STREET_SHADED");
    }
    return html;
  };

  LT.updateMapVignette = function () {
    var el = document.getElementById("map-vignette");
    if (!el) return;
    if (!LT.game || !LT.game.renderMap) {
      el.hidden = true;
      return;
    }
    var h = hourOf();
    el.classList.remove("dusk", "night");
    if (h >= 21 || h < 6) {
      el.hidden = false;
      el.classList.add("night");
    } else if (h >= 18) {
      el.hidden = false;
      el.classList.add("dusk");
    } else {
      el.hidden = true;
    }
  };

  LT.maybeStormEncounter = function () {
    if (typeof LT.maybePlaceEncounter === "function") return LT.maybePlaceEncounter();
    if (!LT.isArcaneStorm()) return;
    var loc = LT.game.player && LT.game.player.location;
    if (!loc || loc.world !== "DOMINION") return;
    if (!LT.isStormStreet(loc.place) || loc.place === "DOMINION_SLAVER_ALLEY") return;
    var key = "storm," + loc.world + "," + loc.x + "," + loc.y;
    if (LT.game.flags.stormTileKey === key) return;
    LT.game.flags.stormTileKey = key;
    if (Math.random() * 100 >= 15) return;
    if (typeof LT.generateAlleyMugger === "function") {
      LT.generateAlleyMugger({ storm: true, prostitute: false });
      LT.game.flags.redirectNode = "enc.storm-attack";
    }
  };

  document.addEventListener("lt-content", function () {
    if (typeof LT.updateMapVignette === "function") LT.updateMapVignette();
    if (typeof renderGrid === "function" && window.grid && grid.gridName) renderGrid();
  });
  document.addEventListener("lt-time", function () {
    if (typeof LT.updateMapVignette === "function") LT.updateMapVignette();
    if (typeof renderGrid === "function" && window.grid && grid.gridName) renderGrid();
  });
})();
