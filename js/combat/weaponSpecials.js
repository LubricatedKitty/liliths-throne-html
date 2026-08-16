(function () {
  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function rndInt(n) {
    return Math.floor(Math.random() * n);
  }

  function weaponNamed(src, id) {
    var main = typeof LT.getMainWeapon === "function" ? LT.getMainWeapon(src) : src && src.mainWeapon;
    if (main && main.id === id) return main;
    var off = typeof LT.getOffhandWeapon === "function" ? LT.getOffhandWeapon(src) : src && src.offhandWeapon;
    if (off && off.id === id) return off;
    return null;
  }

  LT.resetMoveCooldowns = function (ch) {
    if (ch) ch.moveCooldowns = {};
  };

  LT.getMoveCooldown = function (ch, id) {
    if (!ch || !ch.moveCooldowns) return 0;
    return ch.moveCooldowns[id] || 0;
  };

  LT.setMoveCooldown = function (ch, id, turns) {
    if (!ch) return;
    ch.moveCooldowns = ch.moveCooldowns || {};
    if (turns > 0) ch.moveCooldowns[id] = turns;
    else delete ch.moveCooldowns[id];
  };

  LT.lowerMoveCooldowns = function (ch) {
    if (!ch || !ch.moveCooldowns) return;
    var id;
    for (id in ch.moveCooldowns) {
      if (!Object.prototype.hasOwnProperty.call(ch.moveCooldowns, id)) continue;
      ch.moveCooldowns[id] -= 1;
      if (ch.moveCooldowns[id] <= 0) delete ch.moveCooldowns[id];
    }
  };

  function parseSpecial(text, src, tgt, weaponName) {
    var filled = String(text || "").split("{weapon}").join(weaponName || "rifle");
    if (typeof LT.parse !== "function") return filled;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: src, npc2: tgt }, function () {
        return LT.parse(filled);
      });
    }
    return LT.parse(filled);
  }

  function magDumpBullets(hitBase, hitSpan) {
    var bulletsHit = hitBase - rndInt(hitSpan);
    var perEnemy = bulletsHit;
    return Math.max(1, perEnemy - rndInt(3));
  }

  function registerMagDump(def) {
    LT.MOVES[def.id] = {
      id: def.id,
      name: def.name,
      ap: def.ap,
      cooldown: def.cooldown,
      special: true,
      canUse: function (src) {
        if (!weaponNamed(src, def.weaponId)) return false;
        return LT.getMoveCooldown(src, def.id) <= 0;
      },
      cannotUseReason: function (src) {
        if (!weaponNamed(src, def.weaponId)) return def.needReason;
        var cd = LT.getMoveCooldown(src, def.id);
        if (cd > 0) return "This action can't be used since it is still on cooldown! " + cd + " turns remaining.";
        return "You cannot use that now.";
      },
      tooltip: function (src, tgt) {
        return def.tooltip;
      },
      predict: function (src, tgt) {
        return (
          "<span style='color:" +
          LT.Colour.GENERIC_BAD +
          ";'>" +
          def.title +
          "</span> " +
          nameOf(tgt) +
          " — " +
          def.predict
        );
      },
      perform: function (src, tgt) {
        var wep = weaponNamed(src, def.weaponId);
        var weaponName = (wep && wep.name) || def.fallbackName;
        var bullets = magDumpBullets(def.hitBase, def.hitSpan);
        var dmg = def.bulletDamage * bullets;
        if (tgt && typeof LT.applyTypedDamage === "function") LT.applyTypedDamage(tgt, dmg, "PHYSICAL");
        else if (tgt) tgt.health = Math.max(0, (tgt.health || 0) - dmg);
        if (typeof LT.setMoveCooldown === "function" && LT.getMoveCooldown(src, def.id) <= 0) {
          LT.setMoveCooldown(src, def.id, def.cooldown);
        }
        var flavour = parseSpecial(def.flavour, src, tgt, weaponName);
        var hit = parseSpecial("[npc.NameIsFull] hit by [style.boldTerrible(" + bullets + ")] bullet" + (bullets === 1 ? "" : "s") + "!", tgt, src, weaponName);
        return flavour + " " + hit + " " + nameOf(tgt) + " took <b>" + dmg + "</b> damage!";
      },
    };
  }

  LT.WEAPON_SPECIALS = {
    MKAR_MAG_DUMP: {
      id: "MKAR_MAG_DUMP",
      name: "mag dump",
      title: "Mag dump",
      weaponId: "innoxia_gun_mkar",
      fallbackName: "rifle",
      needReason: "Available to characters who have an equipped MKAR.",
      ap: 2,
      cooldown: 2,
      bulletDamage: 21000,
      hitBase: 25,
      hitSpan: 6,
      predict: "Empty an entire 30-round magazine in full-auto, dealing 21000 damage for each bullet that hits.",
      tooltip:
        "Switch to full-auto and empty an entire 30-round magazine at your enemies, dealing 21000 damage for each bullet that hits. Costs 2 AP. Cooldown 2 turns.",
      flavour:
        "Pushing the fire selector on [npc.her] {weapon} up into fully automatic, [npc.name] [npc.verb(take)] aim and [npc.verb(pull)] the trigger, unleashing a deafening, deadly hail of bullets at [npc2.name]!",
    },
    BR14_MAG_DUMP: {
      id: "BR14_MAG_DUMP",
      name: "mag dump",
      title: "Mag dump",
      weaponId: "innoxia_gun_br14",
      fallbackName: "rifle",
      needReason: "Available to characters who have an equipped BR14.",
      ap: 2,
      cooldown: 2,
      bulletDamage: 26000,
      hitBase: 15,
      hitSpan: 11,
      predict: "Empty an entire 20-round magazine in full-auto, dealing 26000 damage for each bullet that hits.",
      tooltip:
        "Switch to full-auto and empty an entire 20-round magazine at your enemies, dealing 26000 damage for each bullet that hits. Costs 2 AP. Cooldown 2 turns.",
      flavour:
        "Flicking the fire selector on [npc.her] {weapon} into fully automatic, [npc.name] [npc.verb(take)] aim and [npc.verb(pull)] the trigger, unleashing a deafening, deadly hail of bullets at [npc2.name]!",
    },
    FAUXMAS_MAG_DUMP: {
      id: "FAUXMAS_MAG_DUMP",
      name: "mag dump",
      title: "Mag dump",
      weaponId: "innoxia_gun_famase",
      fallbackName: "rifle",
      needReason: "Available to characters who have an equipped FAUXMAS.",
      ap: 2,
      cooldown: 2,
      bulletDamage: 18000,
      hitBase: 20,
      hitSpan: 6,
      predict: "Empty an entire 25-round magazine in full-auto, dealing 18000 damage for each bullet that hits.",
      tooltip:
        "Switch to full-auto and empty an entire 25-round magazine at your enemies, dealing 18000 damage for each bullet that hits. Costs 2 AP. Cooldown 2 turns.",
      flavour:
        "Pushing the fire selector on [npc.her] {weapon} into fully automatic, [npc.name] [npc.verb(take)] aim and [npc.verb(pull)] the trigger, unleashing a deafening, deadly hail of bullets at [npc2.name]!",
    },
  };

  LT.WEAPON_SPECIAL_IDS = ["MKAR_MAG_DUMP", "BR14_MAG_DUMP", "FAUXMAS_MAG_DUMP"];

  for (var i = 0; i < LT.WEAPON_SPECIAL_IDS.length; i++) {
    registerMagDump(LT.WEAPON_SPECIALS[LT.WEAPON_SPECIAL_IDS[i]]);
  }

  LT.availableSpecials = function (ch) {
    var out = [];
    for (var i = 0; i < LT.WEAPON_SPECIAL_IDS.length; i++) {
      var id = LT.WEAPON_SPECIAL_IDS[i];
      var def = LT.WEAPON_SPECIALS[id];
      if (weaponNamed(ch, def.weaponId)) out.push(id);
    }
    return out;
  };
})();
