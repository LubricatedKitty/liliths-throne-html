(function () {
  LT.DAMAGE_VARIANCE = {
    NONE: 0,
    LOW: 0.1,
    MEDIUM: 0.2,
    HIGH: 0.5,
  };

  LT.WEAPON_SLOTS = [
    { id: "main", label: "Main weapon" },
    { id: "offhand", label: "Offhand" },
  ];

  var RARITY_COLOUR = {
    COMMON: "#888888",
    UNCOMMON: "#57be7e",
    RARE: "#6f9be3",
    EPIC: "#c06fe3",
    LEGENDARY: "#e3c66f",
    QUEST: "#ff6bda",
  };

  function ensureLists(ch) {
    if (!ch) return ch;
    if (!ch.weapons) ch.weapons = [];
    if (ch.mainWeapon === undefined) ch.mainWeapon = null;
    if (ch.offhandWeapon === undefined) ch.offhandWeapon = null;
    return ch;
  }

  LT.getWeaponType = function (id) {
    if (!id || !LT.WEAPONS) return null;
    if (typeof id === "object") return LT.WEAPONS[id.id] || null;
    return LT.WEAPONS[id] || null;
  };

  LT.weaponRarityColour = function (rarity) {
    return RARITY_COLOUR[rarity] || "#888888";
  };

  LT.makeWeapon = function (id, damageType) {
    var type = LT.getWeaponType(id);
    if (!type) return null;
    var chosen = damageType;
    if (!chosen || type.damageTypes.indexOf(chosen) < 0) chosen = type.damageTypes[0];
    return {
      kind: "weapon",
      id: type.id,
      name: type.name,
      damageType: chosen,
      uid: type.id + "_" + Math.random().toString(36).slice(2, 8),
    };
  };

  LT.getMainWeapon = function (ch) {
    return ch && ch.mainWeapon ? ch.mainWeapon : null;
  };

  LT.getOffhandWeapon = function (ch) {
    if (!ch || !ch.offhandWeapon) return null;
    var main = LT.getMainWeapon(ch);
    var mainType = main && LT.getWeaponType(main.id);
    if (mainType && mainType.twoHanded) return null;
    return ch.offhandWeapon;
  };

  LT.isTwoHandedEquipped = function (ch) {
    var main = LT.getMainWeapon(ch);
    var type = main && LT.getWeaponType(main.id);
    return !!(type && type.twoHanded);
  };

  function varianceOf(weapon) {
    var type = weapon && LT.getWeaponType(weapon.id);
    var key = type && type.variance;
    if (key && LT.DAMAGE_VARIANCE[key] != null) return LT.DAMAGE_VARIANCE[key];
    return LT.DAMAGE_VARIANCE.MEDIUM;
  }

  LT.weaponUsesUnarmed = function (weaponOrType) {
    var type = weaponOrType && weaponOrType.damage != null ? weaponOrType : LT.getWeaponType(weaponOrType);
    var tags = (type && type.tags) || [];
    return tags.indexOf("WEAPON_UNARMED") >= 0;
  };

  LT.baseWeaponDamage = function (weapon, attacker) {
    var type = weapon && LT.getWeaponType(weapon.id);
    if (!type) return 0;
    var base = type.damage || 0;
    if (LT.weaponUsesUnarmed(type) && attacker && typeof LT.unarmedDamage === "function") {
      base += LT.unarmedDamage(attacker);
    }
    return base;
  };

  LT.weaponRange = function (weapon, attacker) {
    var base = LT.baseWeaponDamage(weapon, attacker);
    var v = varianceOf(weapon);
    return {
      min: Math.max(0, Math.round(base * (1 - v))),
      max: Math.max(0, Math.round(base * (1 + v))),
    };
  };

  LT.rollWeapon = function (weapon, attacker) {
    var range = LT.weaponRange(weapon, attacker);
    var rolled = range.max <= range.min ? range.min : range.min + Math.floor(Math.random() * (range.max - range.min + 1));
    return typeof LT.applyEnchantDamage === "function" ? LT.applyEnchantDamage(attacker, weapon, rolled) : rolled;
  };

  function pick(list, rnd) {
    rnd = rnd || Math.random;
    if (!list || !list.length) return "";
    return list[Math.floor(rnd() * list.length)];
  }

  var MUGGER_MELEE = ["innoxia_pipe_pipe", "innoxia_bat_wooden", "innoxia_bat_metal"];
  var DEMON_ELEM = ["FIRE", "ICE", "POISON"];

  LT.equipOfficialLoadout = function (who, ch) {
    if (!ch || typeof LT.makeWeapon !== "function") return ch;
    ensureLists(ch);
    if (who === "brax") {
      ch.mainWeapon = LT.makeWeapon("innoxia_crystal_epic", "FIRE");
      ch.offhandWeapon = LT.makeWeapon("dsg_eep_pbweap_pbpistol");
    } else if (who === "amber") {
      ch.mainWeapon = LT.makeWeapon("innoxia_crystal_epic", "FIRE");
      ch.offhandWeapon = LT.makeWeapon("innoxia_crystal_epic", "FIRE");
    }
    return ch;
  };

  LT.armMuggerFromOutfit = function (ch, opts) {
    opts = opts || {};
    if (!ch || typeof LT.makeWeapon !== "function") return ch;
    ensureLists(ch);
    ch.mainWeapon = null;
    ch.offhandWeapon = null;
    var rnd = opts.random || Math.random;
    var level = ch.level || 1;
    var elem = function () {
      return opts.damageType || pick(DEMON_ELEM, rnd);
    };
    if (opts.dark) {
      if (opts.hasWeapon === false || (opts.hasWeapon == null && rnd() > 0.8)) return ch;
      var dagger = level >= 8 && (opts.dagger != null ? opts.dagger : rnd() <= 0.05);
      var dual = opts.dual != null ? opts.dual : rnd() <= 0.5;
      if (dagger) {
        ch.mainWeapon = LT.makeWeapon("innoxia_dagger_dagger", elem());
        if (dual) ch.offhandWeapon = LT.makeWeapon("innoxia_dagger_dagger", elem());
      } else if (level >= 8) {
        ch.mainWeapon = LT.makeWeapon("innoxia_crystal_epic", elem());
        if (dual) ch.offhandWeapon = LT.makeWeapon("innoxia_feather_epic", elem());
      } else {
        ch.mainWeapon = LT.makeWeapon("innoxia_crystal_rare", elem());
        if (dual) ch.offhandWeapon = LT.makeWeapon("innoxia_feather_rare", elem());
      }
      return ch;
    }
    if (opts.hasWeapon === false || (opts.hasWeapon == null && rnd() > 0.9)) return ch;
    var knuckles = opts.knuckles != null ? opts.knuckles : rnd() <= 0.5;
    if (knuckles) {
      ch.mainWeapon = LT.makeWeapon("innoxia_knuckleDusters_knuckle_dusters", "PHYSICAL");
      if (opts.offhand != null ? opts.offhand : rnd() <= 0.5) {
        ch.offhandWeapon = LT.makeWeapon("innoxia_knuckleDusters_knuckle_dusters", "PHYSICAL");
      }
    } else {
      ch.mainWeapon = LT.makeWeapon(opts.meleeId || pick(MUGGER_MELEE, rnd), "PHYSICAL");
    }
    return ch;
  };

  LT.weaponAttackName = function (weapon) {
    var type = weapon && LT.getWeaponType(weapon.id);
    var desc = (type && type.attackDescriptor) || "strike";
    return desc.charAt(0).toUpperCase() + desc.slice(1);
  };

  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function pickText(list) {
    if (!list || !list.length) return "";
    return list[Math.floor(Math.random() * list.length)];
  }

  LT.parseWeaponText = function (text, attacker, target) {
    if (!text) return "";
    if (typeof LT.parse !== "function") return text;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: attacker, npc2: target }, function () {
        return LT.parse(text);
      });
    }
    return LT.parse(text);
  };

  LT.weaponHitText = function (src, tgt, weapon) {
    var type = weapon && LT.getWeaponType(weapon.id);
    var line = pickText(type && type.hitTexts);
    if (line) return LT.parseWeaponText(line, src, tgt);
    return nameOf(src) + " hits " + nameOf(tgt) + " with " + ((weapon && weapon.name) || "a weapon");
  };

  function findCarried(player, uid) {
    ensureLists(player);
    for (var i = 0; i < player.weapons.length; i++) {
      if (player.weapons[i].uid === uid) return i;
    }
    return -1;
  }

  function stash(player, weapon) {
    if (!weapon) return;
    ensureLists(player);
    player.weapons.push(weapon);
  }

  LT.unequipWeapon = function (player, slot) {
    ensureLists(player);
    if (slot === "offhand") {
      if (player.offhandWeapon) {
        stash(player, player.offhandWeapon);
        player.offhandWeapon = null;
      }
      if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(player);
      return;
    }
    if (player.mainWeapon) {
      stash(player, player.mainWeapon);
      player.mainWeapon = null;
    }
    if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(player);
  };

  LT.equipWeapon = function (player, uid, slot) {
    ensureLists(player);
    var idx = findCarried(player, uid);
    if (idx < 0) return false;
    var item = player.weapons[idx];
    var type = LT.getWeaponType(item.id);
    if (!type) return false;
    if (slot === "offhand" && type.twoHanded) return false;
    player.weapons.splice(idx, 1);
    if (slot === "offhand") {
      if (LT.isTwoHandedEquipped(player)) LT.unequipWeapon(player, "main");
      if (player.offhandWeapon) stash(player, player.offhandWeapon);
      player.offhandWeapon = item;
      if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(player);
      return true;
    }
    if (player.mainWeapon) stash(player, player.mainWeapon);
    if (type.twoHanded && player.offhandWeapon) {
      stash(player, player.offhandWeapon);
      player.offhandWeapon = null;
    }
    player.mainWeapon = item;
    if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(player);
    return true;
  };

  LT.ownedWeaponIds = function (player) {
    ensureLists(player);
    var ids = {};
    if (player.mainWeapon) ids[player.mainWeapon.id] = true;
    if (player.offhandWeapon) ids[player.offhandWeapon.id] = true;
    for (var i = 0; i < player.weapons.length; i++) ids[player.weapons[i].id] = true;
    return ids;
  };

  LT.grantAllWeapons = function (player) {
    ensureLists(player);
    var owned = LT.ownedWeaponIds(player);
    var ids = LT.WEAPON_IDS || Object.keys(LT.WEAPONS || {});
    var added = 0;
    for (var i = 0; i < ids.length; i++) {
      if (owned[ids[i]]) continue;
      var made = LT.makeWeapon(ids[i]);
      if (!made) continue;
      player.weapons.push(made);
      added++;
    }
    return added;
  };

  LT.vickyWeaponIds = function () {
    var ids = LT.WEAPON_IDS || Object.keys(LT.WEAPONS || {});
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var type = LT.WEAPONS[ids[i]];
      if (!type || !type.tags) continue;
      if (type.tags.indexOf("SOLD_BY_VICKY") < 0) continue;
      if (type.tags.indexOf("SILLY_MODE") >= 0) continue;
      out.push(ids[i]);
    }
    return out;
  };

  LT.weaponBuyPrice = function (id) {
    var type = LT.getWeaponType(id);
    return Math.round(((type && type.value) || 0) * 1.5);
  };

  LT.weaponSellPrice = function (id) {
    var type = LT.getWeaponType(id);
    return Math.round(((type && type.value) || 0) * 0.75);
  };

  LT.vickyStock = function () {
    LT.game.flags = LT.game.flags || {};
    var day = Math.floor(((LT.game && LT.game.secondsPassed) || 0) / 86400);
    if (LT.game.flags.vickyStockDay === day && LT.game.flags.vickyStock) return LT.game.flags.vickyStock;
    var stock = {};
    var ids = LT.vickyWeaponIds();
    for (var i = 0; i < ids.length; i++) stock[ids[i]] = 2 + Math.floor(Math.random() * 5);
    LT.game.flags.vickyStockDay = day;
    LT.game.flags.vickyStock = stock;
    return stock;
  };

  LT.ensureWeaponSlots = ensureLists;

  var ONE_SHOT_RECOVER = {
    innoxia_thrown_tennis_ball: { turn: 75, combat: 100 },
    innoxia_thrown_yarn: { turn: 75, combat: 100 },
  };

  LT.weaponArcaneCost = function (weapon) {
    var type = weapon && LT.getWeaponType(weapon.id);
    return (type && type.arcaneCost) || 0;
  };

  LT.oneShotRecover = function (weapon) {
    var id = weapon && weapon.id;
    return ONE_SHOT_RECOVER[id] || { turn: 0, combat: 0 };
  };

  LT.queuedEssenceCost = function (ch) {
    var total = 0;
    var moves = (ch && ch.selectedMoves) || [];
    for (var i = 0; i < moves.length; i++) {
      var slot = moves[i].id === "offhand" ? "offhand" : moves[i].id === "strike" ? "main" : null;
      if (!slot) continue;
      var wep = slot === "offhand" ? LT.getOffhandWeapon(ch) : LT.getMainWeapon(ch);
      total += LT.weaponArcaneCost(wep);
    }
    return total;
  };

  LT.canAffordWeapon = function (ch, slot) {
    var wep = slot === "offhand" ? LT.getOffhandWeapon(ch) : LT.getMainWeapon(ch);
    var cost = LT.weaponArcaneCost(wep);
    if (!cost) return true;
    return (ch.essences || 0) - LT.queuedEssenceCost(ch) >= cost;
  };

  LT.CRITICAL_DAMAGE = 1.5;

  LT.isMoveCrit = function (ch, moveId, turnIndex) {
    if (turnIndex == null || !ch) return false;
    var n = 0;
    var moves = ch.selectedMoves || [];
    for (var i = 0; i <= turnIndex && i < moves.length; i++) {
      if (moves[i].id === moveId) n++;
    }
    return n > 0 && n % 3 === 0;
  };

  LT.applyCrit = function (ch, moveId, turnIndex, dmg) {
    if (!LT.isMoveCrit(ch, moveId, turnIndex)) return { dmg: dmg, crit: false };
    return { dmg: Math.round(dmg * LT.CRITICAL_DAMAGE), crit: true };
  };

  LT.consumeOneShot = function (ch, slot, weapon) {
    if (!ch || !weapon) return;
    var type = LT.getWeaponType(weapon.id);
    if (!type || !type.oneShot) return;
    if (slot === "offhand") ch.offhandWeapon = null;
    else ch.mainWeapon = null;
    if (LT.combat) {
      LT.combat.thrownThisTurn = LT.combat.thrownThisTurn || [];
      LT.combat.thrownThisCombat = LT.combat.thrownThisCombat || [];
      var rec = { ch: ch, slot: slot, weapon: weapon };
      LT.combat.thrownThisTurn.push(rec);
      LT.combat.thrownThisCombat.push(rec);
    }
  };

  LT.recoverThrownAfterTurn = function () {
    var lines = [];
    var list = (LT.combat && LT.combat.thrownThisTurn) || [];
    var kept = [];
    for (var i = 0; i < list.length; i++) {
      var rec = list[i];
      var chance = LT.oneShotRecover(rec.weapon).turn;
      if (Math.random() * 100 <= chance) {
        if (rec.slot === "offhand" && !rec.ch.offhandWeapon) rec.ch.offhandWeapon = rec.weapon;
        else if (rec.slot === "main" && !rec.ch.mainWeapon) rec.ch.mainWeapon = rec.weapon;
        var name = rec.ch.getName ? rec.ch.getName() : rec.ch.name || "someone";
        lines.push("<p>" + name + " recovers " + rec.weapon.name + ".</p>");
        LT.combat.thrownThisCombat = (LT.combat.thrownThisCombat || []).filter(function (x) {
          return x !== rec;
        });
      } else {
        kept.push(rec);
      }
    }
    if (LT.combat) LT.combat.thrownThisTurn = [];
    return lines;
  };

  LT.recoverThrownAfterCombat = function () {
    var list = (LT.combat && LT.combat.thrownThisCombat) || [];
    for (var i = 0; i < list.length; i++) {
      var rec = list[i];
      if (Math.random() * 100 <= LT.oneShotRecover(rec.weapon).combat) {
        if (rec.slot === "offhand" && !rec.ch.offhandWeapon) rec.ch.offhandWeapon = rec.weapon;
        else if (rec.slot === "main" && !rec.ch.mainWeapon) rec.ch.mainWeapon = rec.weapon;
        else if (rec.ch.weapons) rec.ch.weapons.push(rec.weapon);
      }
    }
    if (LT.combat) {
      LT.combat.thrownThisTurn = [];
      LT.combat.thrownThisCombat = [];
    }
  };
})();
