/* Lifebound grid runtime. Same tile shape, function names, and window.grid
   fields as Lifebound/index.html so the later full editor port can drop in.

   Flexibility: getMaxifiedGrid / loadGrid / renderGrid / movePlayer use each
   grid's own width and height (from LT_GRID_META or inferred tile bounds).
   grid.gridSize stays as max(width, height) for existing square-grid code. */
(function () {
  var print = (window.print && window.print.log) ? window.print : {
    log: function () {},
    warn: function () { console.warn.apply(console, arguments); },
    error: function () { console.error.apply(console, arguments); },
  };
  window.print = print;

  var grid = window.grid = window.grid || {};
  grid.gridSize = grid.gridSize || 25;
  grid.gridWidth = grid.gridWidth || grid.gridSize;
  grid.gridHeight = grid.gridHeight || grid.gridSize;
  grid.visibleTiles = grid.visibleTiles || 5;
  grid.zoomLevel = grid.zoomLevel || grid.visibleTiles;
  grid.playerPosition = grid.playerPosition || { x: 0, y: 0 };
  grid.gridName = grid.gridName || "";
  grid.gridStyle = grid.gridStyle || "better_rooms";
  grid.gridPruningValue = grid.gridPruningValue || 8;
  grid.gridSymmetrical = grid.gridSymmetrical != null ? grid.gridSymmetrical : true;
  grid.isDrawing = false;
  grid.drawMethod = grid.drawMethod || "None";
  grid.lastTransMethod = grid.lastTransMethod || "None";
  grid.selectedLocation = grid.selectedLocation || null;
  grid.selectedColorLocation = grid.selectedColorLocation || null;
  grid.selectedColor = grid.selectedColor || null;
  grid.selectedTravelType = grid.selectedTravelType || null;
  grid.selectedTravelLocation = grid.selectedTravelLocation || null;
  grid.selectedLocationIcon = grid.selectedLocationIcon || null;
  grid.selectedTravelLocationCoords = grid.selectedTravelLocationCoords || {};
  grid.selectedTile = grid.selectedTile || null;
  grid.currentTile = grid.currentTile || null;
  grid.currentLocation = grid.currentLocation || "";
  grid.currentLocationType = grid.currentLocationType || "";
  grid.currentLocationSubtype = grid.currentLocationSubtype || "";
  grid.currentEstablishment = grid.currentEstablishment || "";
  grid.currentRegion = grid.currentRegion || "";
  grid.currentTilePeople = grid.currentTilePeople || [];
  grid.hidden = !!grid.hidden;
  grid.locations = grid.locations || [];
  grid.homes = grid.homes || [];
  grid.favoritedLocations = grid.favoritedLocations || [];
  grid.locationConditions = grid.locationConditions || [];

  window.allGrids = window.allGrids || {};
  window.selectedTile = window.selectedTile || null;

  function gridWidth() {
    if (grid.gridData && grid.gridData[0]) return grid.gridData[0].length;
    return grid.gridWidth || grid.gridSize || 25;
  }

  function gridHeight() {
    if (grid.gridData) return grid.gridData.length;
    return grid.gridHeight || grid.gridSize || 25;
  }

  function declareGridVariables() {
    window.gridContainer = document.getElementById("grid");
    window.gridInfoBox = document.getElementById("grid-info");
    if (grid.hidden) hideGrid(false);
  }
  window.declareGridVariables = declareGridVariables;

  function hideGrid(setState) {
    if (setState !== false) grid.hidden = true;
    var section = document.querySelector('[data-ui="map"]');
    if (section && grid.hidden) section.hidden = true;
  }
  window.hideGrid = hideGrid;

  function unhideGrid(setState) {
    if (setState !== false) grid.hidden = false;
    var section = document.querySelector('[data-ui="map"]');
    if (section && !grid.hidden) section.hidden = false;
  }
  window.unhideGrid = unhideGrid;

  function showGrid(setState) {
    unhideGrid(setState);
  }
  window.showGrid = showGrid;

  function createEmptyGrid(size) {
    size = size || grid.gridSize || 25;
    var gridData = Array.from({ length: size }, function (_, row) {
      return Array.from({ length: size }, function (_, col) {
        return {
          x: col,
          y: row,
          isNavigable: true,
          location: null,
          isStartingPoint: col === 0 && row === 0,
        };
      });
    });
    return gridData;
  }
  window.createEmptyGrid = createEmptyGrid;

  function createClusteredGrid(size, locations) {
    locations = locations || grid.locations || [];
    var gridData = Array.from({ length: size }, function (_, row) {
      return Array.from({ length: size }, function (_, col) {
        var location = locations.length ? locations[(Math.floor(row / 4) + Math.floor(col / 6)) % locations.length] : null;
        return { x: col, y: row, isNavigable: Math.random() > 0.2, location: location };
      });
    });
    return gridData;
  }
  window.createClusteredGrid = createClusteredGrid;

  function findFirstNavigableTile(inputGrid) {
    var data = inputGrid || grid.gridData;
    if (!data) return null;
    for (var row = 0; row < data.length; row++) {
      for (var col = 0; col < data[row].length; col++) {
        var tile = data[row][col];
        if (tile && tile.isNavigable) return tile;
      }
    }
    return null;
  }
  window.findFirstNavigableTile = findFirstNavigableTile;

  function findTile(gridData, x, y) {
    if (!gridData) return null;
    if (gridData[y] && gridData[y][x] && typeof gridData[y][x].x === "number") return gridData[y][x];
    for (var row = 0; row < gridData.length; row++) {
      if (!gridData[row] || typeof gridData[row].length !== "number") continue;
      for (var col = 0; col < gridData[row].length; col++) {
        var tile = gridData[row][col];
        if (tile && tile.x === x && tile.y === y) return tile;
      }
    }
    return null;
  }
  window.findTile = findTile;

  function findTileMinified(gridData, x, y) {
    if (!gridData) return null;
    for (var i = 0; i < gridData.length; i++) {
      var tile = gridData[i];
      if (tile && tile.x === x && tile.y === y) return tile;
    }
    return null;
  }
  window.findTileMinified = findTileMinified;

  function getMinifiedGrid(gridData) {
    var minimized = [];
    if (!gridData) return minimized;
    for (var row = 0; row < gridData.length; row++) {
      for (var col = 0; col < gridData[row].length; col++) {
        var tile = gridData[row][col];
        if (!tile || !tile.isNavigable) continue;
        var minTile = { x: tile.x, y: tile.y, location: tile.location || null };
        if (tile.isStartingPoint === true) minTile.isStartingPoint = true;
        if (tile.travelConfig != null) minTile.travelConfig = tile.travelConfig;
        minimized.push(minTile);
      }
    }
    return minimized;
  }
  window.getMinifiedGrid = getMinifiedGrid;

  function isAlreadyMaxified(minimizedGrid) {
    return !!(
      minimizedGrid &&
      minimizedGrid.length &&
      Array.isArray(minimizedGrid[0]) &&
      minimizedGrid[0].length &&
      minimizedGrid[0][0] &&
      typeof minimizedGrid[0][0] === "object" &&
      "isNavigable" in minimizedGrid[0][0]
    );
  }

  function getMaxifiedGrid(minimizedGrid, gridSize, gridHeight) {
    if (isAlreadyMaxified(minimizedGrid)) return minimizedGrid;
    var width = typeof gridSize === "number" ? gridSize : 25;
    var height = typeof gridHeight === "number" ? gridHeight : width;
    if (Array.isArray(minimizedGrid)) {
      for (var i = 0; i < minimizedGrid.length; i++) {
        var t = minimizedGrid[i];
        if (!t) continue;
        if (typeof t.x === "number" && t.x + 1 > width) width = t.x + 1;
        if (typeof t.y === "number" && t.y + 1 > height) height = t.y + 1;
      }
    }
    var lookup = {};
    if (Array.isArray(minimizedGrid)) {
      for (var n = 0; n < minimizedGrid.length; n++) {
        var nav = minimizedGrid[n];
        if (nav && typeof nav.x === "number") lookup[nav.x + "," + nav.y] = nav;
      }
    }
    return Array.from({ length: height }, function (_, y) {
      return Array.from({ length: width }, function (_, x) {
        var navTile = lookup[x + "," + y];
        if (navTile) {
          return {
            x: navTile.x,
            y: navTile.y,
            isNavigable: true,
            location: navTile.location || null,
            travelConfig: navTile.travelConfig || null,
            isStartingPoint: navTile.isStartingPoint || false,
          };
        }
        return { x: x, y: y, isNavigable: false, location: null, isStartingPoint: false };
      });
    });
  }
  window.getMaxifiedGrid = getMaxifiedGrid;

  function getCurrentTile() {
    if (!grid.gridData || !grid.playerPosition) return null;
    var row = grid.gridData[grid.playerPosition.y];
    return row ? row[grid.playerPosition.x] : null;
  }
  window.getCurrentTile = getCurrentTile;

  function getLocation(name, locations) {
    if (!name) return null;
    locations = locations || grid.locations || [];
    for (var i = 0; i < locations.length; i++) {
      var loc = locations[i];
      if (loc && loc.name === name) return loc;
      if (loc && loc.sublocations && loc.sublocations.length) {
        var found = getLocation(name, loc.sublocations);
        if (found) return found;
      }
    }
    return null;
  }
  window.getLocation = getLocation;
  window.getLocationByName = getLocation;

  function collectLocationsFromGrid(fullGrid) {
    var seen = {};
    var list = [];
    if (!fullGrid) return list;
    for (var y = 0; y < fullGrid.length; y++) {
      for (var x = 0; x < fullGrid[y].length; x++) {
        var loc = fullGrid[y][x] && fullGrid[y][x].location;
        if (!loc || !loc.name || seen[loc.name + "|" + (loc.placeType || "")]) continue;
        seen[loc.name + "|" + (loc.placeType || "")] = true;
        list.push(loc);
      }
    }
    return list;
  }

  function renderGrid() {
    var gridContainer = window.gridContainer || document.getElementById("grid");
    window.gridContainer = gridContainer;
    if (!grid.gridData || !grid.gridName) {
      hideGrid(false);
      return;
    }
    if (!gridContainer) return;
    showGrid(false);

    var width = gridWidth();
    var height = gridHeight();
    var view = Math.max(1, grid.zoomLevel || 5);
    var viewW = Math.min(view, width);
    var viewH = Math.min(view, height);
    gridContainer.innerHTML = "";
    gridContainer.className = "map-container";
    gridContainer.style.gridTemplateColumns = "repeat(" + viewW + ", 1fr)";
    gridContainer.style.gridTemplateRows = "repeat(" + viewH + ", 1fr)";
    gridContainer.style.aspectRatio = viewW + " / " + viewH;

    var startX = Math.max(0, Math.min(width - viewW, grid.playerPosition.x - Math.floor(viewW / 2)));
    var startY = Math.max(0, Math.min(height - viewH, grid.playerPosition.y - Math.floor(viewH / 2)));
    var px = grid.playerPosition.x;
    var py = grid.playerPosition.y;

    for (var row = startY; row < startY + viewH; row++) {
      for (var col = startX; col < startX + viewW; col++) {
        var tile = grid.gridData[row] && grid.gridData[row][col];
        if (!tile) continue;
        var isPlayer = px === col && py === row;
        var adjacent = (Math.abs(col - px) === 1 && row === py) || (Math.abs(row - py) === 1 && col === px);
        var fogged = typeof LT.isTileDiscovered === "function" && !LT.isTileDiscovered(grid.gridName, col, row);
        var placeType = tile.location && tile.location.placeType;
        var knownVisual = !!(window.LT && LT.placeVisuals && placeType && LT.placeVisuals[placeType]);
        var visual = (window.LT && LT.placeVisual && placeType) ? LT.placeVisual(placeType) : null;
        var tileDiv = document.createElement("div");
        var classes = "map-tile";
        if (!tile.isNavigable) classes += " blank";
        else if (isPlayer) classes += " player";
        if (tile.isNavigable && adjacent) classes += " movement";
        if (tile.isNavigable && !fogged && typeof LT !== "undefined" && LT.isDangerousTile && LT.isDangerousTile(placeType)) {
          classes += " dangerous";
        }
        if (fogged && tile.isNavigable && !isPlayer) classes += " fog";
        tileDiv.className = classes;
        var bg = (knownVisual && visual && visual.background)
          || (tile.location && tile.location.color)
          || (visual && visual.background)
          || "#bbbbbb";
        if (fogged && tile.isNavigable && !isPlayer) bg = "#151518";
        if (tile.isNavigable && bg) tileDiv.style.backgroundColor = bg;
        var iconSrc = (tile.location && tile.location.icon && tile.location.icon.src) || (visual && visual.icon);
        if (tile.isNavigable && iconSrc && !fogged) {
          var placeIcon = document.createElement("div");
          placeIcon.className = "place-icon";
          var content = document.createElement("div");
          content.className = "map-tile-content";
          var img = document.createElement("img");
          img.src = iconSrc;
          img.alt = (tile.location && tile.location.name) || "";
          img.draggable = false;
          img.setAttribute("draggable", "false");
          content.appendChild(img);
          placeIcon.appendChild(content);
          tileDiv.appendChild(placeIcon);
        } else if (isPlayer && tile.isNavigable) {
          var playerMark = document.createElement("div");
          playerMark.className = "place-icon player-marker";
          tileDiv.appendChild(playerMark);
        }
        if (tile.isNavigable) {
          (function (r, c) {
            tileDiv.addEventListener("click", function () {
              selectTile(r, c);
            });
          })(row, col);
        }
        gridContainer.appendChild(tileDiv);
      }
    }
  }
  window.renderGrid = renderGrid;

  function updateInfo() {
    var tile = getCurrentTile();
    var box = window.gridInfoBox || document.getElementById("grid-info");
    window.gridInfoBox = box;
    if (!box) return;
    if (!tile) {
      box.textContent = "Out of bounds";
      return;
    }
    if (tile.isNavigable && tile.location && tile.location.name) {
      box.textContent = tile.location.name;
    } else if (tile.isNavigable) {
      box.textContent = "You are here.";
    } else {
      box.textContent = "This tile is non-navigable.";
    }
  }
  window.updateInfo = updateInfo;

  function applyCurrentTileState() {
    grid.currentTile = getCurrentTile();
    grid.currentLocation = (grid.currentTile && grid.currentTile.location && grid.currentTile.location.name) || "";
    grid.currentLocationType = (grid.currentTile && grid.currentTile.location && grid.currentTile.location.type) || "";
    grid.currentLocationSubtype = (grid.currentTile && grid.currentTile.location && grid.currentTile.location.subtype) || "";
    if (window.player) {
      window.player.currentLocation = grid.currentLocation;
      window.player.currentCoords = { x: grid.playerPosition.x, y: grid.playerPosition.y };
    }
  }

  function movePlayer(dx, dy, moveMode) {
    moveMode = moveMode || "Default";
    var cooldown = 100;
    if (!movePlayer.lastMove) movePlayer.lastMove = 0;
    var now = Date.now();
    if (now - movePlayer.lastMove < cooldown) return;
    movePlayer.lastMove = now;

    var newX;
    var newY;
    var width = gridWidth();
    var height = gridHeight();

    function runTravelHandler() {
      grid.playerPosition = { x: newX, y: newY };
      applyCurrentTileState();
      grid.lastTransMethod = "Walk";
      renderGrid();
      updateInfo();
      if (typeof grid.onMove === "function") grid.onMove(getCurrentTile(), grid);
    }

    if (moveMode === "Default") {
      newX = grid.playerPosition.x + dx;
      newY = grid.playerPosition.y + dy;
    } else if (moveMode === "TileClick") {
      var clickedX = dx;
      var clickedY = dy;
      var distX = Math.abs(clickedX - grid.playerPosition.x);
      var distY = Math.abs(clickedY - grid.playerPosition.y);
      if ((distX === 1 && distY === 0) || (distX === 0 && distY === 1)) {
        newX = clickedX;
        newY = clickedY;
      } else {
        return;
      }
    } else if (moveMode === "Teleport") {
      newX = dx;
      newY = dy;
      runTravelHandler();
      return;
    } else {
      return;
    }

    if (
      newX >= 0 &&
      newY >= 0 &&
      newX < width &&
      newY < height &&
      (function () {
        var dest = grid.gridData[newY] && grid.gridData[newY][newX];
        if (dest && typeof LT.canEnterTile === "function" && !LT.canEnterTile(dest)) return false;
        return true;
      })() &&
      grid.gridData[newY] &&
      grid.gridData[newY][newX] &&
      grid.gridData[newY][newX].isNavigable
    ) {
      runTravelHandler();
    }
  }
  window.movePlayer = movePlayer;

  function loadGrid(newGrid, tile) {
    tile = tile || {};
    var newGridName;
    if (typeof newGrid === "string") {
      newGridName = newGrid;
      newGrid = window.allGrids[newGrid];
      if (!newGrid) {
        print.error('Grid with name "' + newGridName + '" not found.');
        return;
      }
    }

    var meta = (window.LT_GRID_META && newGridName && window.LT_GRID_META[newGridName]) || {};
    newGrid = getMaxifiedGrid(newGrid, meta.width || grid.gridSize || 25, meta.height);
    if (!newGrid) return;

    if (tile.x === undefined || tile.y === undefined) {
      tile = findFirstNavigableTile(newGrid);
    }
    if (!tile) return;

    var tilePosition = { x: tile.x || 0, y: tile.y || 0 };
    grid.gridName = newGridName || grid.gridName;
    grid.gridData = newGrid;
    grid.gridWidth = newGrid[0] ? newGrid[0].length : meta.width || 25;
    grid.gridHeight = newGrid.length;
    grid.gridSize = Math.max(grid.gridWidth, grid.gridHeight);
    grid.playerPosition = { x: tilePosition.x, y: tilePosition.y };
    grid.locations = collectLocationsFromGrid(newGrid);
    window.selectedTile = grid.gridData[tilePosition.y] && grid.gridData[tilePosition.y][tilePosition.x];
    applyCurrentTileState();
    if (typeof LT !== "undefined" && typeof LT.discoverAround === "function") {
      LT.discoverAround(grid.gridName, tilePosition.x, tilePosition.y);
    }
    renderGrid();
    updateInfo();
    if (typeof grid.onLoad === "function") grid.onLoad(getCurrentTile(), grid);
  }
  window.loadGrid = loadGrid;

  function generateGrid(mode) {
    mode = mode || "Normal";
    var size = grid.gridSize || 25;
    if (typeof window.generateDungeon === "function" && grid.gridStyle && grid.gridStyle !== "empty") {
      var newGrid = [];
      for (var y = 0; y < size; y++) {
        newGrid[y] = [];
        for (var x = 0; x < size; x++) newGrid[y][x] = 0;
      }
      var style = grid.gridStyle;
      if (style === "corridors" || style === "corridors_rooms" || style === "thick_corridors" || style === "better_rooms") {
        window.generateDungeon(newGrid, 1, 1);
        if (style === "corridors_rooms" && typeof window.addRooms === "function") window.addRooms(newGrid);
        if (style === "thick_corridors" && typeof window.thickenCorridors === "function") window.thickenCorridors(newGrid, 2);
        if (style === "better_rooms" && typeof window.addBetterRooms === "function") window.addBetterRooms(newGrid);
      } else if (style === "cellular" && typeof window.generateCellular === "function") {
        newGrid = window.generateCellular(newGrid);
      } else if (style === "drunkards" && typeof window.generateDrunkards === "function") {
        window.generateDrunkards(newGrid);
      } else if (style === "continent" && typeof window.generateContinent === "function") {
        newGrid = window.generateContinent(newGrid);
      }
      grid.gridData = Array.from({ length: size }, function (_, gy) {
        return Array.from({ length: size }, function (_, gx) {
          var value = newGrid[gy][gx];
          var isNavigable = value === 1 || value === 2;
          var location = null;
          if (value === 1) location = { color: "#bbb", name: "Corridor" };
          else if (value === 2) location = { color: "#888", name: "Room" };
          return { x: gx, y: gy, isNavigable: isNavigable, location: location, isStartingPoint: gx === 0 && gy === 0 };
        });
      });
    } else {
      grid.gridData = createEmptyGrid(size);
    }
    if (mode === "Normal") {
      var gridNameEl = document.getElementById("grid-name");
      grid.gridName = (gridNameEl && gridNameEl.value && gridNameEl.value.trim()) || grid.gridName || "NewGrid";
    }
    grid.gridWidth = size;
    grid.gridHeight = size;
    var firstTile = findFirstNavigableTile();
    if (firstTile) grid.playerPosition = grid.playerPosition || { x: firstTile.x, y: firstTile.y };
    if (window.gridContainer) renderGrid();
    updateInfo();
  }
  window.generateGrid = generateGrid;

  function travelLocked() {
    if (window.LT && LT.game && LT.game.currentNode && LT.game.currentNode.travelDisabled) {
      if (typeof LT.game.currentNode.travelDisabled === "function") {
        if (LT.game.currentNode.travelDisabled()) return true;
      } else {
        return true;
      }
    }
    if (window.LT && LT.combat && LT.combat.active) return true;
    if (window.LT && LT.sex && LT.sex.active) return true;
    return false;
  }

  function selectTile(row, col) {
    if (travelLocked()) return;
    if (!grid.gridData || !grid.gridData[row] || !grid.gridData[row][col]) return;
    var tile = grid.gridData[row][col];
    window.selectedTile = tile;
    grid.selectedTile = tile;
    if (grid.drawMethod && grid.drawMethod !== "None" && typeof window.startDrawing === "function") {
      return;
    }
    if (!tile.isNavigable) return;
    var px = grid.playerPosition.x;
    var py = grid.playerPosition.y;
    if (row === py && col === px) return;
    var distX = Math.abs(col - px);
    var distY = Math.abs(row - py);
    if ((distX === 1 && distY === 0) || (distX === 0 && distY === 1)) {
      movePlayer(col - px, row - py);
    }
  }
  window.selectTile = selectTile;

  function cycleGridZoom() {
    var steps = [3, 5, 7, 9];
    var i = steps.indexOf(grid.zoomLevel);
    grid.zoomLevel = steps[(i + 1) % steps.length];
    renderGrid();
  }
  window.cycleGridZoom = cycleGridZoom;

  function goToTileLocation(locationName) {
    var currentGrid = window.allGrids[grid.gridName];
    if (!currentGrid) return false;
    var matches = [];
    if (Array.isArray(currentGrid) && currentGrid.length && currentGrid[0] && typeof currentGrid[0].x === "number") {
      for (var i = 0; i < currentGrid.length; i++) {
        if (currentGrid[i].location && currentGrid[i].location.name === locationName) matches.push(currentGrid[i]);
      }
    } else {
      for (var y = 0; y < currentGrid.length; y++) {
        for (var x = 0; x < currentGrid[y].length; x++) {
          var t = currentGrid[y][x];
          if (t && t.location && t.location.name === locationName) matches.push(t);
        }
      }
    }
    if (!matches.length) return false;
    var target = matches[0];
    movePlayer(target.x, target.y, "Teleport");
    return true;
  }
  window.goToTileLocation = goToTileLocation;
})();
