(function () {
  /* Combat status APIs live in js/character/statusEffects.js.
     This file stays in the load list so older boot caches keep a valid path. */
  if (typeof LT.applyStatus === "function") return;

  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  LT.applyStatus = function (ch, id, turns) {
    if (!ch) return;
    ch.statuses = ch.statuses || {};
    ch.statuses[id] = { id: id, turns: turns };
    if (typeof LT.refreshShields === "function") LT.refreshShields(ch);
  };

  LT.getStatus = function (ch, id) {
    return ch && ch.statuses ? ch.statuses[id] : null;
  };

  LT.clearStatuses = function (ch) {
    if (ch) ch.statuses = {};
  };

  LT.apPenalty = function (ch) {
    var flash = LT.getStatus(ch, "FLASH");
    return flash && flash.turns > 0 ? 1 : 0;
  };

  LT.consumeFlash = function (ch) {
    var flash = LT.getStatus(ch, "FLASH");
    if (!flash) return 0;
    var penalty = flash.turns > 0 ? 1 : 0;
    flash.turns -= 1;
    if (flash.turns <= 0) delete ch.statuses.FLASH;
    return penalty;
  };

  LT.tickStatuses = function (ch) {
    var lines = [];
    if (!ch || !ch.statuses) return lines;
    var poison = ch.statuses.POISON_VAPOURS;
    if (poison && poison.turns > 0) {
      var dmg = typeof LT.applyTypedDamage === "function" ? LT.applyTypedDamage(ch, 25, "POISON") : 25;
      if (typeof LT.applyTypedDamage !== "function") ch.health = Math.max(0, (ch.health || 0) - dmg);
      poison.turns -= 1;
      var left = poison.turns;
      lines.push(
        "<p>" +
          nameOf(ch) +
          " takes <b>" +
          dmg +
          "</b> poison damage" +
          (left > 0 ? " (" + left + " turn" + (left === 1 ? "" : "s") + " remaining)" : "") +
          ".</p>",
      );
      if (left <= 0) delete ch.statuses.POISON_VAPOURS;
    }
    var shell = ch.statuses.STONE_SHELL;
    if (shell && shell.turns > 0) {
      shell.turns -= 1;
      if (shell.turns <= 0) delete ch.statuses.STONE_SHELL;
    }
    var cloak = ch.statuses.CLOAK_OF_FLAMES;
    if (cloak && cloak.turns > 0) {
      cloak.turns -= 1;
      if (cloak.turns <= 0) delete ch.statuses.CLOAK_OF_FLAMES;
    }
    var rain = ch.statuses.RAIN_CLOUD;
    if (rain && rain.turns > 0) {
      rain.turns -= 1;
      if (rain.turns <= 0) delete ch.statuses.RAIN_CLOUD;
    }
    var cloud = ch.statuses.ARCANE_CLOUD;
    if (cloud && cloud.turns > 0) {
      cloud.turns -= 1;
      if (cloud.turns <= 0) delete ch.statuses.ARCANE_CLOUD;
    }
    var tele = ch.statuses.TELEPATHIC_COMMUNICATION;
    if (tele && tele.turns > 0) {
      tele.turns -= 1;
      if (tele.turns <= 0) delete ch.statuses.TELEPATHIC_COMMUNICATION;
    }
    if (typeof LT.refreshShields === "function") LT.refreshShields(ch);
    return lines;
  };

  LT.statusSummary = function (ch) {
    if (!ch || !ch.statuses) return "";
    var bits = [];
    if (ch.statuses.FLASH && ch.statuses.FLASH.turns > 0) bits.push("Blinded (−1 AP)");
    if (ch.statuses.POISON_VAPOURS && ch.statuses.POISON_VAPOURS.turns > 0) {
      bits.push("Poison Vapours (" + ch.statuses.POISON_VAPOURS.turns + ")");
    }
    if (ch.statuses.STONE_SHELL && ch.statuses.STONE_SHELL.turns > 0) {
      bits.push("Stone Shell (" + ch.statuses.STONE_SHELL.turns + ")");
    }
    if (ch.statuses.CLOAK_OF_FLAMES && ch.statuses.CLOAK_OF_FLAMES.turns > 0) {
      bits.push("Cloak of Flames (" + ch.statuses.CLOAK_OF_FLAMES.turns + ")");
    }
    if (ch.statuses.RAIN_CLOUD && ch.statuses.RAIN_CLOUD.turns > 0) {
      bits.push("Rain Cloud (" + ch.statuses.RAIN_CLOUD.turns + ")");
    }
    if (ch.statuses.ARCANE_CLOUD && ch.statuses.ARCANE_CLOUD.turns > 0) {
      bits.push("Arcane Cloud (" + ch.statuses.ARCANE_CLOUD.turns + ")");
    }
    if (ch.statuses.TELEPATHIC_COMMUNICATION && ch.statuses.TELEPATHIC_COMMUNICATION.turns > 0) {
      bits.push("Telepathic Communication (" + ch.statuses.TELEPATHIC_COMMUNICATION.turns + ")");
    }
    return bits.join(" · ");
  };
})();
