(function () {
  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function weaponOf(src, slot) {
    if (slot === "offhand") return typeof LT.getOffhandWeapon === "function" ? LT.getOffhandWeapon(src) : null;
    return typeof LT.getMainWeapon === "function" ? LT.getMainWeapon(src) : null;
  }

  function applyStrike(src, tgt, slot, turnIndex) {
    var wep = weaponOf(src, slot);
    var cost = typeof LT.weaponArcaneCost === "function" ? LT.weaponArcaneCost(wep) : 0;
    if (wep && cost > 0) {
      if ((src.essences || 0) < cost) wep = null;
      else src.essences -= cost;
    }
    var dmg = wep && typeof LT.rollStrike === "function" ? LT.rollStrike(src, slot) : LT.rollUnarmed(src);
    var moveId = slot === "offhand" ? "offhand" : "strike";
    var crit = typeof LT.applyCrit === "function" ? LT.applyCrit(src, moveId, turnIndex, dmg) : { dmg: dmg, crit: false };
    dmg = crit.dmg;
    if (tgt && tgt.blocking && dmg > 0) dmg = Math.max(1, Math.round(dmg * 0.5));
    var dtype = typeof LT.strikeDamageType === "function" ? LT.strikeDamageType(wep) : "PHYSICAL";
    if (tgt && typeof LT.applyTypedDamage === "function") LT.applyTypedDamage(tgt, dmg, dtype);
    else if (tgt) tgt.health = Math.max(0, (tgt.health || 0) - dmg);
    var flavour;
    if (wep && typeof LT.weaponHitText === "function") flavour = LT.weaponHitText(src, tgt, wep);
    else flavour = nameOf(src) + " strikes " + nameOf(tgt);
    if (wep && typeof LT.consumeOneShot === "function") LT.consumeOneShot(src, slot, wep);
    var extra = "";
    if (cost && wep) extra += " (−" + cost + " essence" + (cost === 1 ? "" : "s") + ")";
    if (crit.crit) extra += " <b>Critical hit!</b>";
    return flavour + " for <b>" + dmg + "</b> damage." + extra;
  }

  function strikeTooltip(src, tgt, slot, unarmedLabel) {
    var wep = weaponOf(src, slot);
    var range = typeof LT.strikeRange === "function" ? LT.strikeRange(src, slot) : LT.unarmedRange(src);
    if (wep) {
      var type = LT.getWeaponType && LT.getWeaponType(wep.id);
      var tip = type && type.attackTooltip;
      if (tip && typeof LT.parseWeaponText === "function") {
        tip = LT.parseWeaponText(tip, src, tgt);
        return tip + " (" + range.min + "–" + range.max + " damage)";
      }
      return (LT.weaponAttackName ? LT.weaponAttackName(wep) : "Strike") + " " + nameOf(tgt) + " with your " + wep.name + " for " + range.min + "–" + range.max + " damage.";
    }
    return unarmedLabel + " " + nameOf(tgt) + " with your fists for " + range.min + "–" + range.max + " damage.";
  }

  function strikePredict(src, tgt, slot, fallbackName) {
    var wep = weaponOf(src, slot);
    var range = typeof LT.strikeRange === "function" ? LT.strikeRange(src, slot) : LT.unarmedRange(src);
    var title = wep && LT.weaponAttackName ? LT.weaponAttackName(wep) : fallbackName;
    var withWhat = wep ? wep.name : "fists";
    return (
      "<span style='color:" +
      LT.Colour.GENERIC_BAD +
      ";'>" +
      title +
      "</span> " +
      nameOf(tgt) +
      " with " +
      withWhat +
      " for " +
      range.min +
      "–" +
      range.max +
      " damage."
    );
  }

  LT.MOVES = {
    strike: {
      id: "strike",
      name: "Strike",
      ap: 1,
      titleOf: function (src) {
        var wep = weaponOf(src, "main");
        return wep && LT.weaponAttackName ? LT.weaponAttackName(wep) : "Strike";
      },
      canUse: function (src) {
        return typeof LT.canAffordWeapon !== "function" || LT.canAffordWeapon(src, "main");
      },
      cannotUseReason: function () {
        return "You don't have enough arcane essences to use your weapon!";
      },
      tooltip: function (src, tgt) {
        return strikeTooltip(src, tgt, "main", "Strike");
      },
      predict: function (src, tgt) {
        return strikePredict(src, tgt, "main", "Strike");
      },
      perform: function (src, tgt, turnIndex) {
        return applyStrike(src, tgt, "main", turnIndex);
      },
    },
    offhand: {
      id: "offhand",
      name: "Offhand",
      ap: 1,
      canUse: function (src) {
        if (!weaponOf(src, "offhand")) return false;
        return typeof LT.canAffordWeapon !== "function" || LT.canAffordWeapon(src, "offhand");
      },
      cannotUseReason: function (src) {
        if (!weaponOf(src, "offhand")) return "You have no offhand weapon equipped.";
        return "You don't have enough arcane essences to use your weapon!";
      },
      titleOf: function (src) {
        var wep = weaponOf(src, "offhand");
        return wep && LT.weaponAttackName ? LT.weaponAttackName(wep) : "Offhand";
      },
      tooltip: function (src, tgt) {
        return strikeTooltip(src, tgt, "offhand", "Offhand strike");
      },
      predict: function (src, tgt) {
        return strikePredict(src, tgt, "offhand", "Offhand");
      },
      perform: function (src, tgt, turnIndex) {
        return applyStrike(src, tgt, "offhand", turnIndex);
      },
    },
    block: {
      id: "block",
      name: "Block",
      ap: 1,
      tooltip: function () {
        return "Take a defensive stance. Incoming strikes this turn deal half damage.";
      },
      predict: function (src) {
        return nameOf(src) + " will block incoming strikes.";
      },
      perform: function (src) {
        src.blocking = true;
        return nameOf(src) + " takes a defensive stance.";
      },
    },
    tease: {
      id: "tease",
      name: "Tease",
      ap: 1,
      tooltip: function (src, tgt) {
        var range = LT.lustRange(src);
        return "Tease " + nameOf(tgt) + " for " + range.min + "–" + range.max + " lust damage.";
      },
      predict: function (src, tgt) {
        var range = LT.lustRange(src);
        return (
          "<span style='color:" +
          LT.Colour.ATTRIBUTE_LUST +
          ";'>Tease</span> " +
          nameOf(tgt) +
          " for " +
          range.min +
          "–" +
          range.max +
          " lust."
        );
      },
      perform: function (src, tgt, turnIndex) {
        var dmg = LT.rollLust(src);
        var crit = typeof LT.applyCrit === "function" ? LT.applyCrit(src, "tease", turnIndex, dmg) : { dmg: dmg, crit: false };
        dmg = crit.dmg;
        if (tgt && tgt.resisting) dmg = Math.max(1, Math.round(dmg * 0.5));
        var dealt = LT.applyLust(tgt, dmg);
        var flavour = typeof LT.seductionDescription === "function" ? LT.seductionDescription(src, tgt) : nameOf(src) + " teases " + nameOf(tgt);
        return (
          flavour +
          " <b style='color:" +
          LT.Colour.ATTRIBUTE_LUST +
          ";'>" +
          dealt +
          "</b> lust." +
          (crit.crit ? " <b>Critical hit!</b>" : "")
        );
      },
    },
    allout: {
      id: "allout",
      name: "All-out strike",
      ap: 2,
      cooldown: 2,
      tooltip: function (src, tgt) {
        return "Strike with both hands at once. Costs 2 AP. Cooldown 2 turns.";
      },
      canUse: function (src) {
        if (typeof LT.getMoveCooldown === "function" && LT.getMoveCooldown(src, "allout") > 0) return false;
        if (typeof LT.canAffordWeapon === "function") {
          if (!LT.canAffordWeapon(src, "main")) return false;
          if (weaponOf(src, "offhand") && !LT.canAffordWeapon(src, "offhand")) return false;
        }
        return true;
      },
      cannotUseReason: function (src) {
        if (typeof LT.getMoveCooldown === "function" && LT.getMoveCooldown(src, "allout") > 0) {
          return "This action can't be used since it is still on cooldown! " + LT.getMoveCooldown(src, "allout") + " turns remaining.";
        }
        return "You don't have enough arcane essences to use your weapons!";
      },
      predict: function (src, tgt) {
        return (
          "<span style='color:" +
          LT.Colour.GENERIC_BAD +
          ";'>All-out strike</span> " +
          nameOf(tgt) +
          " with both hands."
        );
      },
      perform: function (src, tgt, turnIndex) {
        var main = applyStrike(src, tgt, "main", turnIndex);
        if (typeof LT.isTwoHandedEquipped === "function" && LT.isTwoHandedEquipped(src)) return main;
        return main + " " + applyStrike(src, tgt, "offhand", turnIndex);
      },
    },
    resist: {
      id: "resist",
      name: "Resist",
      ap: 1,
      tooltip: function () {
        return "Focus on resisting seduction. Incoming teases this turn deal half lust.";
      },
      predict: function (src) {
        return nameOf(src) + " will resist incoming teases.";
      },
      perform: function (src) {
        src.resisting = true;
        return nameOf(src) + " focuses on resisting seduction.";
      },
    },
  };
})();
