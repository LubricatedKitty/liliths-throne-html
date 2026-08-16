(function () {
  var VARIANCE = 0.2;

  LT.unarmedRange = function (attacker) {
    var base = LT.unarmedDamage(attacker);
    return {
      min: Math.max(1, Math.round(base * (1 - VARIANCE))),
      max: Math.max(1, Math.round(base * (1 + VARIANCE))),
    };
  };

  LT.strikeRange = function (attacker, slot) {
    var wep =
      slot === "offhand"
        ? typeof LT.getOffhandWeapon === "function" && LT.getOffhandWeapon(attacker)
        : typeof LT.getMainWeapon === "function" && LT.getMainWeapon(attacker);
    if (wep && typeof LT.weaponRange === "function") return LT.weaponRange(wep, attacker);
    return LT.unarmedRange(attacker);
  };

  LT.rollStrike = function (attacker, slot) {
    var wep =
      slot === "offhand"
        ? typeof LT.getOffhandWeapon === "function" && LT.getOffhandWeapon(attacker)
        : typeof LT.getMainWeapon === "function" && LT.getMainWeapon(attacker);
    if (wep && typeof LT.rollWeapon === "function") return LT.rollWeapon(wep, attacker);
    return LT.rollUnarmed(attacker);
  };

  LT.rollUnarmed = function (attacker) {
    var range = LT.unarmedRange(attacker);
    if (range.max <= range.min) return range.min;
    return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
  };

  LT.TEASE_BASE = 7;
  LT.MAX_LUST = 100;

  LT.lustRange = function (src) {
    var base = LT.TEASE_BASE;
    if (typeof LT.modifyOutgoingLust === "function") base = LT.modifyOutgoingLust(src, base);
    return {
      min: Math.max(1, Math.round(base * (1 - VARIANCE))),
      max: Math.max(1, Math.round(base * (1 + VARIANCE))),
    };
  };

  LT.rollLust = function (src) {
    var range = LT.lustRange(src);
    if (range.max <= range.min) return range.min;
    return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
  };

  LT.applyLust = function (target, amount) {
    if (!target) return 0;
    var before = target.lust || 0;
    target.lust = Math.max(0, Math.min(LT.MAX_LUST, before + amount));
    return target.lust - before;
  };
})();
