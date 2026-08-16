(function () {
  LT.SHIELD_TYPES = ["HEALTH", "PHYSICAL", "FIRE", "ICE", "POISON", "LUST"];

  LT.resistFromStatuses = function (ch, type) {
    var n = 0;
    if (typeof LT.getStatus === "function") {
      if (LT.getStatus(ch, "CLOAK_OF_FLAMES")) {
        if (type === "FIRE") n += 5;
        if (type === "ICE") n += 10;
      }
      if (LT.getStatus(ch, "STONE_SHELL") && type === "PHYSICAL") n += 5;
      if (LT.getStatus(ch, "ARCANE_CLOUD") && type === "LUST") n += -25;
    }
    var b = ch && ch.enchantBonus;
    if (b) {
      if (type === "PHYSICAL") n += b.resistPhysical || 0;
      if (type === "LUST") n += b.resistLust || 0;
      if (type === "FIRE") n += b.resistFire || 0;
      if (type === "ICE") n += b.resistIce || 0;
      if (type === "POISON") n += b.resistPoison || 0;
    }
    return n;
  };

  LT.refreshShields = function (ch) {
    if (!ch) return;
    ch.shields = ch.shields || {};
    var i;
    for (i = 0; i < LT.SHIELD_TYPES.length; i++) ch.shields[LT.SHIELD_TYPES[i]] = 0;
    ch.shields.PHYSICAL = LT.resistFromStatuses(ch, "PHYSICAL");
    ch.shields.FIRE = LT.resistFromStatuses(ch, "FIRE");
    ch.shields.ICE = LT.resistFromStatuses(ch, "ICE");
    ch.shields.POISON = LT.resistFromStatuses(ch, "POISON");
    ch.shields.LUST = LT.resistFromStatuses(ch, "LUST");
  };

  function absorb(ch, type, amount) {
    if (!ch.shields) return amount;
    var s = ch.shields[type] || 0;
    if (s <= 0) return amount;
    if (amount >= s) {
      ch.shields[type] = 0;
      return amount - s;
    }
    ch.shields[type] = s - amount;
    return 0;
  }

  LT.shieldAbsorb = function (ch, type, amount) {
    if (!ch || amount <= 0) return amount;
    type = type || "PHYSICAL";
    var left = amount;
    if (type !== "HEALTH" && type !== "LUST") left = absorb(ch, "HEALTH", left);
    left = absorb(ch, type, left);
    return left;
  };

  LT.applyTypedDamage = function (target, amount, type) {
    if (!target || amount <= 0) return 0;
    var left = LT.shieldAbsorb(target, type || "PHYSICAL", amount);
    if (left > 0) target.health = Math.max(0, (target.health || 0) - left);
    return left;
  };

  LT.strikeDamageType = function (weapon) {
    if (weapon && weapon.damageType) return weapon.damageType;
    return "PHYSICAL";
  };

  LT.spellCostOf = function (ch, spell) {
    var cost = (spell && spell.cost) || 0;
    if (typeof LT.getStatus === "function" && LT.getStatus(ch, "RAIN_CLOUD")) {
      cost = Math.round(cost * 1.25);
    }
    var bonus = ch && ch.enchantBonus && ch.enchantBonus.spellCost;
    if (bonus) cost = Math.max(0, Math.round(cost * (1 - bonus / 100)));
    return cost;
  };

  LT.lustDamageBonus = function (ch) {
    var n = 0;
    if (typeof LT.getStatus === "function" && LT.getStatus(ch, "TELEPATHIC_COMMUNICATION")) n += 15;
    if (ch && ch.enchantBonus) n += ch.enchantBonus.damageLust || 0;
    return n;
  };

  LT.applyEnchantDamage = function (ch, weapon, amount) {
    if (!amount) return 0;
    var b = ch && ch.enchantBonus;
    if (!b) return amount;
    var pct = b.damagePhysical || 0;
    var type = weapon && weapon.damageType;
    if (type === "FIRE") pct += b.damageFire || 0;
    else if (type === "ICE") pct += b.damageIce || 0;
    else if (type === "POISON") pct += b.damagePoison || 0;
    else if (type === "LUST") pct += b.damageLust || 0;
    var wType = weapon && typeof LT.getWeaponType === "function" ? LT.getWeaponType(weapon.id) : null;
    var ranged = wType && ((wType.tags || []).indexOf("WEAPON_RANGED") >= 0 || /bow|gun|revolver|crossbow/i.test(wType.id || ""));
    if (ranged) pct += b.damageRanged || 0;
    else if (weapon) pct += b.damageMelee || 0;
    return Math.max(0, Math.round(amount * (1 + pct / 100)));
  };

  LT.lustDamageMultiplier = function (ch) {
    return 1 + LT.lustDamageBonus(ch) / 100;
  };

  LT.modifyOutgoingLust = function (ch, amount) {
    return Math.round(amount * LT.lustDamageMultiplier(ch));
  };
})();
