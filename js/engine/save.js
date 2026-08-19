(function () {
  var PREFIX = "lt-save-";
  var INDEX_KEY = "lt-saves-index";

  function byId(table, id) {
    if (id == null || !table) return null;
    if (table[id]) return table[id];
    if (typeof LT.findById === "function") return LT.findById(table, id);
    return null;
  }

  function pickId(v) {
    if (v == null) return null;
    if (typeof v === "object" && v.id) return v.id;
    return v;
  }

  function serializePlayer(p) {
    if (!p) return null;
    return {
      names: p.names,
      surname: p.surname,
      gender: pickId(p.gender),
      femininityValue: p.femininityValue,
      orientation: pickId(p.orientation),
      personality: p.personality,
      birthday: p.birthday instanceof Date ? p.birthday.toISOString() : p.birthday,
      level: p.level,
      experience: p.experience,
      experienceForLevel: p.experienceForLevel,
      health: p.health,
      maxHealth: p.maxHealth,
      mana: p.mana,
      maxMana: p.maxMana,
      physique: p.physique,
      arcane: p.arcane,
      corruption: p.corruption,
      arousal: p.arousal,
      lust: p.lust,
      money: p.money,
      essences: p.essences || 0,
      location: p.location,
      placeName: p.placeName,
      equipped: p.equipped,
      wardrobe: p.wardrobe,
      mainWeapon: p.mainWeapon || null,
      offhandWeapon: p.offhandWeapon || null,
      weapons: p.weapons || [],
      occupation: pickId(p.occupation),
      sex: p.sex,
      heightCm: p.heightCm,
      skin: pickId(p.skin),
      bodySize: pickId(p.bodySize),
      muscle: pickId(p.muscle),
      lipSize: pickId(p.lipSize),
      lipsPuffy: p.lipsPuffy,
      eye: pickId(p.eye),
      hairLength: pickId(p.hairLength),
      hairStyle: pickId(p.hairStyle),
      hair: pickId(p.hair),
      breastSize: pickId(p.breastSize),
      breastShape: pickId(p.breastShape),
      nippleSize: pickId(p.nippleSize),
      areolaeSize: pickId(p.areolaeSize),
      nipplesPuffy: p.nipplesPuffy,
      assSize: pickId(p.assSize),
      hipSize: pickId(p.hipSize),
      anusBleached: p.anusBleached,
      penisLength: p.penisLength,
      testicleSize: pickId(p.testicleSize),
      vaginaCapacity: pickId(p.vaginaCapacity),
      labiaSize: pickId(p.labiaSize),
      clitorisSize: pickId(p.clitorisSize),
      wardrobeReady: p.wardrobeReady,
      wardrobeFem: p.wardrobeFem,
      knownSpells: p.knownSpells || [],
      items: p.items || [],
      statusEffects: typeof LT.serializeStatusEffects === "function" ? LT.serializeStatusEffects(p) : p.statusEffects || {},
      raceName: p.raceName,
      fullRace: p.fullRace,
      appearedAge: p.appearedAge,
      penisPresent: p.penisPresent,
      vaginaPresent: p.vaginaPresent,
      body: typeof LT.serializeBody === "function" ? LT.serializeBody(p.body) : p.body || null,
      fetishes: p.fetishes || {},
      fetishDesire: p.fetishDesire || {},
      perks: p.perks || [],
      perkPoints: p.perkPoints || 0,
      attributes: p.attributes || null,
      affection: p.affection || {},
      obedience: p.obedience || 0,
      pregnancy: p.pregnancy || null,
      offspring: p.offspring || [],
      tattoos: p.tattoos || {},
      makeup: p.makeup || {},
      scars: p.scars || {},
      piercings: p.piercings || {},
      addictions: p.addictions || {},
      potionAttributes: p.potionAttributes || {},
      enchantmentLimit: p.enchantmentLimit,
      companions: p.companions || [],
      sexCount: p.sexCount || null,
    };
  }

  function applyPlayer(p, data) {
    if (!p || !data) return p;
    p.names = data.names || p.names;
    p.surname = data.surname || "";
    p.gender = byId(LT.Gender, data.gender) || p.gender;
    p.femininityValue = data.femininityValue != null ? data.femininityValue : p.femininityValue;
    p.orientation = byId(LT.Orientation, data.orientation) || p.orientation;
    p.personality = data.personality || {};
    p.birthday = data.birthday ? new Date(data.birthday) : p.birthday;
    p.level = data.level || 1;
    p.experience = data.experience || 0;
    p.experienceForLevel = data.experienceForLevel || 10;
    p.health = data.health != null ? data.health : p.health;
    p.maxHealth = data.maxHealth || p.maxHealth;
    p.mana = data.mana != null ? data.mana : p.mana;
    p.maxMana = data.maxMana || p.maxMana;
    p.physique = data.physique != null ? data.physique : p.physique;
    p.arcane = data.arcane != null ? data.arcane : p.arcane;
    p.corruption = data.corruption || 0;
    p.arousal = data.arousal || 0;
    p.lust = data.lust != null ? data.lust : p.lust;
    p.money = data.money || 0;
    p.essences = data.essences != null ? data.essences : p.essences || 0;
    p.location = data.location || null;
    p.placeName = data.placeName;
    p.equipped = data.equipped || {};
    p.wardrobe = data.wardrobe || [];
    p.mainWeapon = data.mainWeapon || null;
    p.offhandWeapon = data.offhandWeapon || null;
    p.weapons = data.weapons || [];
    p.occupation = (data.occupation && LT.findOccupation && LT.findOccupation(data.occupation)) || null;
    p.sex = data.sex || p.sex;
    p.heightCm = data.heightCm || p.heightCm;
    p.skin = byId(LT.SKIN, data.skin) || p.skin;
    p.bodySize = byId(LT.BODY_SIZE, data.bodySize) || p.bodySize;
    p.muscle = byId(LT.MUSCLE, data.muscle) || p.muscle;
    p.lipSize = byId(LT.LIP, data.lipSize) || p.lipSize;
    p.lipsPuffy = !!data.lipsPuffy;
    p.eye = byId(LT.EYE, data.eye) || p.eye;
    p.hairLength = byId(LT.HAIR_LENGTH, data.hairLength) || p.hairLength;
    p.hairStyle = byId(LT.HAIR_STYLE, data.hairStyle) || p.hairStyle;
    p.hair = byId(LT.HAIR_COLOUR, data.hair) || p.hair;
    p.breastSize = byId(LT.CUP, data.breastSize) || p.breastSize;
    p.breastShape = byId(LT.BREAST_SHAPE, data.breastShape) || p.breastShape;
    p.nippleSize = byId(LT.SIZE5, data.nippleSize) || p.nippleSize;
    p.areolaeSize = byId(LT.SIZE5, data.areolaeSize) || p.areolaeSize;
    p.nipplesPuffy = !!data.nipplesPuffy;
    p.assSize = byId(LT.SIZE5, data.assSize) || p.assSize;
    p.hipSize = byId(LT.SIZE5, data.hipSize) || p.hipSize;
    p.anusBleached = !!data.anusBleached;
    p.penisLength = data.penisLength != null ? data.penisLength : p.penisLength;
    p.testicleSize = byId(LT.SIZE5, data.testicleSize) || p.testicleSize;
    p.vaginaCapacity = byId(LT.SIZE5, data.vaginaCapacity) || p.vaginaCapacity;
    p.labiaSize = byId(LT.SIZE5, data.labiaSize) || p.labiaSize;
    p.clitorisSize = byId(LT.SIZE5, data.clitorisSize) || p.clitorisSize;
    p.knownSpells = data.knownSpells || [];
    p.items = data.items || [];
    p.wardrobeReady = !!data.wardrobeReady;
    p.wardrobeFem = data.wardrobeFem;
    if (data.raceName) p.raceName = data.raceName;
    if (data.fullRace) p.fullRace = data.fullRace;
    if (data.appearedAge != null) p.appearedAge = data.appearedAge;
    if (data.penisPresent != null) p.penisPresent = data.penisPresent;
    if (data.vaginaPresent != null) p.vaginaPresent = data.vaginaPresent;
    if (typeof LT.applySavedBody === "function") LT.applySavedBody(p, data);
    if (typeof LT.applySavedStatusEffects === "function") LT.applySavedStatusEffects(p, data.statusEffects);
    if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(p);
    else if (typeof LT.refreshVitals === "function") LT.refreshVitals(p);
    return p;
  }

  function readIndex() {
    try {
      var raw = localStorage.getItem(INDEX_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeIndex(list) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  }

  function sanitizeName(name) {
    return String(name || "New Save")
      .replace(/[^A-Za-z0-9 _-]/g, "")
      .trim()
      .slice(0, 40) || "New Save";
  }

  LT.snapshotGame = function () {
    if (typeof LT.compactCharacterSave === "function") LT.compactCharacterSave();
    var loc = (LT.game.player && LT.game.player.location) || {};
    var tile = typeof getCurrentTile === "function" ? getCurrentTile() : null;
    return {
      version: "0.4.10-html",
      rebuildVersion: LT.VERSION || "0.38.0",
      secondsPassed: LT.game.secondsPassed,
      startingYear: LT.game.startingYear,
      startingMonth: LT.game.startingMonth,
      startingDay: LT.game.startingDay,
      flags: LT.game.flags,
      started: !!LT.game.started,
      node: LT.game.currentNode && LT.game.currentNode.id,
      renderMap: !!LT.game.renderMap,
      renderAttributes: !!LT.game.renderAttributes,
      discoveredWorlds: LT.game.discoveredWorlds || [],
      discoveredTiles: LT.game.discoveredTiles || {},
      world: loc.world || (window.grid && grid.gridName) || null,
      place: loc.place || (tile && tile.location && tile.location.placeType) || null,
      x: loc.x != null ? loc.x : window.grid && grid.playerPosition ? grid.playerPosition.x : null,
      y: loc.y != null ? loc.y : window.grid && grid.playerPosition ? grid.playerPosition.y : null,
      player: serializePlayer(LT.game.player),
      alleyNpcs: serializeAlleyNpcs(),
    };
  };

  function serializeAlleyNpcs() {
    var out = [];
    var npcs = LT.game && LT.game.npcs;
    if (!npcs) return out;
    Object.keys(npcs).forEach(function (key) {
      var n = npcs[key];
      if (!n || n.transient || n.stormAttacker) return;
      if (!(n.id && String(n.id).indexOf("alley_") === 0) && n.occupation !== "mugger" && n.occupation !== "prostitute") return;
      if (key === "npc" || key === "alleyMugger") return;
      out.push({
        id: n.id,
        name: n.name,
        surname: n.surname,
        playerKnowsName: !!n.playerKnowsName,
        occupation: n.occupation,
        feminine: !!n.feminine,
        gender: n.gender && n.gender.id,
        raceName: n.raceName,
        fullRace: n.fullRace,
        speechColour: n.speechColour,
        level: n.level,
        physique: n.physique,
        arcane: n.arcane,
        money: n.money,
        attractedToPlayer: !!n.attractedToPlayer,
        playerSurrenderCount: n.playerSurrenderCount || 0,
        encounteredBefore: !!n.encounteredBefore,
        callsPlayer: n.callsPlayer || "",
        playerCallsNpc: n.playerCallsNpc || "",
        location: n.location,
        fetishes: n.fetishes || [],
        age: n.age,
      });
    });
    return out;
  }

  LT.listSaves = function () {
    var names = readIndex();
    var out = [];
    for (var i = 0; i < names.length; i++) {
      var data = LT.readSave(names[i]);
      if (!data) continue;
      out.push({
        name: names[i],
        savedAt: data.savedAt,
        playerName: data.player && data.player.names ? data.player.names.feminine || data.player.names.masculine : names[i],
        world: data.world,
        place: data.place,
      });
    }
    out.sort(function (a, b) {
      return String(b.savedAt || "").localeCompare(String(a.savedAt || ""));
    });
    return out;
  };

  LT.readSave = function (name) {
    try {
      var raw = localStorage.getItem(PREFIX + name);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  LT.saveGame = function (name) {
    if (!LT.game || !LT.game.started || !LT.game.player) return false;
    name = sanitizeName(name);
    var snap = LT.snapshotGame();
    snap.name = name;
    snap.savedAt = new Date().toISOString();
    localStorage.setItem(PREFIX + name, JSON.stringify(snap));
    var index = readIndex();
    if (index.indexOf(name) < 0) {
      index.push(name);
      writeIndex(index);
    }
    return name;
  };

  LT.deleteSave = function (name) {
    localStorage.removeItem(PREFIX + name);
    writeIndex(
      readIndex().filter(function (n) {
        return n !== name;
      }),
    );
  };

  LT.exportSave = function (name) {
    var data = name ? LT.readSave(name) : null;
    if (!data) {
      if (!LT.game.started) return;
      data = LT.snapshotGame();
      data.name = sanitizeName(name || (LT.game.player && LT.game.player.getName()) || "export");
      data.savedAt = new Date().toISOString();
    }
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = data.name + ".ltjson";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 500);
  };

  LT.importSave = function (file, callback) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var name = sanitizeName(data.name || file.name.replace(/\.ltjson$/i, "") || "Imported");
        if (LT.readSave(name)) name = name + "_" + Date.now().toString().slice(-4);
        data.name = name;
        data.savedAt = data.savedAt || new Date().toISOString();
        localStorage.setItem(PREFIX + name, JSON.stringify(data));
        var index = readIndex();
        if (index.indexOf(name) < 0) {
          index.push(name);
          writeIndex(index);
        }
        if (callback) callback(name);
      } catch (e) {
        console.error("Import failed", e);
        if (callback) callback(null);
      }
    };
    reader.readAsText(file);
  };

  function restoreAlleyNpcs(list) {
    if (!list || !list.length) return;
    LT.game.npcs = LT.game.npcs || {};
    var i;
    for (i = 0; i < list.length; i++) {
      var rec = list[i];
      if (!rec || !rec.id) continue;
      var npc = rec;
      if (rec.gender && typeof rec.gender === "string" && LT.Gender && LT.Gender[rec.gender]) {
        npc.gender = LT.Gender[rec.gender];
      }
      if (typeof LT.hydrateAlleyNpc === "function") npc = LT.hydrateAlleyNpc(npc);
      LT.game.npcs[npc.id] = npc;
    }
  }

  LT.loadGame = function (name) {
    var data = typeof name === "string" ? LT.readSave(name) : name;
    if (!data || !data.player) return false;
    LT._loading = true;
    try {
      LT.game.started = true;
      LT.game.secondsPassed = data.secondsPassed || 0;
      if (data.startingYear != null) LT.game.startingYear = data.startingYear;
      if (data.startingMonth != null) LT.game.startingMonth = data.startingMonth;
      if (data.startingDay != null) LT.game.startingDay = data.startingDay;
      LT.game.flags = data.flags || {};
      if (typeof LT.ensureWeather === "function") LT.ensureWeather();
      LT.game.discoveredWorlds = data.discoveredWorlds || [];
      if (data.discoveredTiles) {
        LT.game.discoveredTiles = data.discoveredTiles;
      } else {
        LT.game.discoveredTiles = {};
        (LT.game.discoveredWorlds || []).forEach(function (world) {
          if (typeof LT.revealWorld === "function") LT.revealWorld(world);
        });
      }
      LT.game.renderMap = !!data.renderMap;
      LT.game.renderAttributes = !!data.renderAttributes;
      LT.game.player = LT.createNewPlayer();
      applyPlayer(LT.game.player, data.player);
      window.player = LT.game.player;
      if (data.world && typeof LT.enterWorld === "function") {
        LT.enterWorld(data.world, data.place, data.x != null ? { x: data.x, y: data.y } : null);
      }
      var nodeId = data.node;
      if (nodeId && /^(boot\.save-load|boot\.menu|boot\.options|phone\.|inventory\.)/.test(nodeId)) {
        nodeId = null;
      }
      if (typeof LT.refreshAllRoomVisuals === "function") LT.refreshAllRoomVisuals();
      if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
      restoreAlleyNpcs(data.alleyNpcs);
      if (nodeId && LT.hasNode(nodeId)) LT.game.setContent(nodeId);
      else if (data.world && typeof getCurrentTile === "function") {
        var tile = getCurrentTile();
        var passage = tile && tile.location && tile.location.passage;
        if (passage && LT.hasNode(passage)) LT.game.setContent(passage);
        else if (LT.hasNode("place.generic")) LT.game.setContent("place.generic");
      } else {
        LT.game.setContent("boot.menu");
      }
      return true;
    } finally {
      LT._loading = false;
    }
  };

  LT.rememberReturn = function () {
    var node = LT.game && LT.game.currentNode;
    if (!node || !node.id) return;
    if (/^(boot\.|phone\.|inventory\.|body\.)/.test(node.id)) return;
    LT.game.returnNode = node;
  };

  LT.autoSave = function () {
    if (LT._loading || !LT.game || !LT.game.started) return;
    try {
      LT.saveGame("AutoSave");
    } catch (e) {}
  };
})();
