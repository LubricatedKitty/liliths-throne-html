(function () {
  var DIRS = {
    N: { dx: 0, dy: -1 },
    S: { dx: 0, dy: 1 },
    W: { dx: -1, dy: 0 },
    E: { dx: 1, dy: 0 },
  };

  function roaming() {
    if (!window.grid || !grid.gridData || !LT.game || !LT.game.renderMap) return false;
    if (LT.game.currentNode && LT.game.currentNode.travelDisabled) return false;
    if (LT.combat && LT.combat.active) return false;
    if (LT.sex && LT.sex.active) return false;
    return true;
  }

  function currentPlaceType() {
    var tile = typeof getCurrentTile === "function" ? getCurrentTile() : null;
    return (tile && tile.location && tile.location.placeType) || "";
  }

  function passageFor(tile) {
    if (!tile || !tile.location) return "place.generic";
    var id = tile.location.passage || ("place." + (tile.location.placeType || ""));
    if (LT.hasNode(id)) return id;
    return "place.generic";
  }

  function syncPlayerLocation() {
    if (!LT.game || !LT.game.player || !window.grid) return;
    var tile = getCurrentTile();
    LT.game.player.location = {
      world: grid.gridName,
      place: currentPlaceType(),
      x: grid.playerPosition.x,
      y: grid.playerPosition.y,
    };
    if (tile && tile.location) {
      LT.game.player.placeName = tile.location.name;
    }
    if (typeof LT.refreshConditionalStatusEffects === "function") LT.refreshConditionalStatusEffects(LT.game.player);
  }

  function showPlace() {
    if (!LT.game) return;
    var tile = getCurrentTile();
    var id = passageFor(tile);
    if (LT.game.currentNode && LT.game.currentNode.id === id) {
      LT.game.setContent(id);
      return;
    }
    LT.game.setContent(id);
  }

  LT.findPlaceTile = function (gridName, placeType) {
    var tiles = window.allGrids && window.allGrids[gridName];
    if (!tiles) return null;
    if (tiles.length && tiles[0] && typeof tiles[0].x === "number") {
      for (var i = 0; i < tiles.length; i++) {
        if (tiles[i].location && tiles[i].location.placeType === placeType) return tiles[i];
      }
      return null;
    }
    for (var y = 0; y < tiles.length; y++) {
      for (var x = 0; x < tiles[y].length; x++) {
        var t = tiles[y][x];
        if (t && t.location && t.location.placeType === placeType) return t;
      }
    }
    return null;
  };

  LT.enterWorld = function (gridName, placeType, coords) {
    if (typeof declareGridVariables === "function") declareGridVariables();
    if (LT.game.player) window.player = LT.game.player;
    if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
    if (typeof LT.syncQuestWorld === "function") LT.syncQuestWorld();
    LT.game.renderAttributes = true;
    LT.game.renderMap = true;
    var tile = coords && coords.x != null ? coords : null;
    if (!tile && placeType) tile = LT.findPlaceTile(gridName, placeType);
    loadGrid(gridName, tile || {});
    LT.openUI("map", { target: "left-map" });
    syncPlayerLocation();
    LT.game.discoveredWorlds = LT.game.discoveredWorlds || [];
    if (gridName && LT.game.discoveredWorlds.indexOf(gridName) < 0) LT.game.discoveredWorlds.push(gridName);
    if (typeof LT.autoSave === "function") LT.autoSave();
    return getCurrentTile();
  };

  LT.travelToPlace = function (gridName, placeType) {
    var tile = LT.enterWorld(gridName, placeType);
    if (tile) {
      if (LT.game.currentNode && LT.game.currentNode.secondsPassed) {
        /* stay */
      }
      showPlace();
    }
    return !!tile;
  };

  LT.useTileTravel = function () {
    var tile = getCurrentTile();
    if (!tile || !tile.travelConfig || !tile.travelConfig.nextGridName) return false;
    var dest = tile.travelConfig;
    if (typeof LT.canUseTileTravel === "function" && !LT.canUseTileTravel(dest)) return false;
    LT.enterWorld(dest.nextGridName, null, dest.coords);
    showPlace();
    return true;
  };

  function onMove() {
    if (!LT.game) return;
    syncPlayerLocation();
    var dest = passageFor(typeof getCurrentTile === "function" ? getCurrentTile() : null);
    var node = typeof LT.getNode === "function" ? LT.getNode(dest) : null;
    var seconds = node && node.secondsPassed ? node.secondsPassed : 10;
    if (seconds > 0) LT.game.advanceTime(seconds);
    if (typeof LT.updateHouseNpcLocations === "function") LT.updateHouseNpcLocations();
    showPlace();
  }

  if (window.grid) {
    grid.onMove = onMove;
    grid.onLoad = function () {
      syncPlayerLocation();
    };
  }

  document.addEventListener("lt-move", function (e) {
    if (!roaming()) return;
    var dir = DIRS[e.detail && e.detail.dir];
    if (!dir) return;
    if (typeof getCurrentTile === "function" && window.grid && grid.gridData) {
      var here = grid.playerPosition;
      var dest = grid.gridData[here.y + dir.dy] && grid.gridData[here.y + dir.dy][here.x + dir.dx];
      if (dest && typeof LT.canEnterTile === "function" && !LT.canEnterTile(dest)) return;
    }
    movePlayer(dir.dx, dir.dy);
  });

  document.addEventListener("keydown", function (e) {
    if (!roaming()) return;
    if (e.target.matches("input, textarea")) return;
    var map = { arrowup: "N", arrowdown: "S", arrowleft: "W", arrowright: "E" };
    var dir = map[e.key.toLowerCase()];
    if (!dir) return;
    e.preventDefault();
    document.dispatchEvent(new CustomEvent("lt-move", { detail: { dir: dir } }));
  });

  document.addEventListener("lt-content", function () {
    if (!LT.game || !LT.game.renderMap) return;
    LT.openUI("map", { target: "left-map" });
    if (typeof renderGrid === "function") renderGrid();
  });
})();
