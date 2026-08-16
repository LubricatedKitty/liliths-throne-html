(function () {
  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  LT.SPELLS = {
    FIREBALL: {
      id: "FIREBALL",
      name: "Fireball",
      school: "FIRE",
      damageType: "FIRE",
      damage: 30,
      variance: "LOW",
      cost: 75,
      ap: 1,
      effect: "health",
      description: "Summons a ball of arcane flames that can be launched at a target.",
      castPc:
        "Summoning a swirling vortex of arcane fire around your [pc.arm], you focus its raw power into a ball of roiling flames before launching it at [npc.name]!",
      castNpc:
        "Summoning a swirling vortex of arcane fire around [npc.her] [npc.arm], [npc.she] focuses its raw power into a ball of roiling flames before launching it directly at [npc2.name]!",
    },
    ICE_SHARD: {
      id: "ICE_SHARD",
      name: "Ice Shard",
      school: "WATER",
      damageType: "ICE",
      damage: 25,
      variance: "LOW",
      cost: 35,
      ap: 1,
      effect: "health",
      description: "Summons a shard of ice that can be launched at a target.",
      castPc:
        "Summoning a swirling vortex of water from the moisture in the air, you focus your energy on freezing it in place, creating a shard of ice that you then launch at [npc.name]!",
      castNpc:
        "Summoning a swirling vortex of water from the moisture in the air, [npc.name] focuses [npc.her] energy on freezing it in place, creating a shard of ice that [npc.she] then launches at [npc2.name]!",
    },
    SLAM: {
      id: "SLAM",
      name: "Slam",
      school: "EARTH",
      damageType: "PHYSICAL",
      damage: 40,
      variance: "LOW",
      cost: 60,
      ap: 1,
      effect: "health",
      description: "Summons a crushing wave of force that slams down onto a target.",
      castPc: "With a downward, striking gesture, you summon forth a huge wave of pure force, which slams down on [npc.name]!",
      castNpc: "With a downward, striking gesture, [npc.name] summons forth a huge wave of pure force, which slams down on [npc2.name]!",
    },
    FLASH: {
      id: "FLASH",
      name: "Flash",
      school: "FIRE",
      damageType: "FIRE",
      damage: 0,
      variance: "LOW",
      cost: 50,
      ap: 1,
      effect: "flash",
      description: "Creates a blinding flash of light which dazzles the target.",
      extra: "Dazzles the target for -1 action points!",
      castPc: "With a flick of your wrist, you summon a blinding flash of light right in front of [npc.namePos] face!",
      castNpc: "With a flick of [npc.her] wrist, [npc.name] summons a blinding flash of light right in front of [npc2.namePos] face!",
    },
    POISON_VAPOURS: {
      id: "POISON_VAPOURS",
      name: "Poison Vapours",
      school: "AIR",
      damageType: "POISON",
      damage: 0,
      variance: "LOW",
      cost: 50,
      ap: 1,
      effect: "poison",
      description: "Summons a cloud of poisonous gas around a target.",
      extra: "25 poison damage per turn for 3 turns.",
      castPc: "With a sweeping motion of your [pc.arm], you summon forth a cloud of poison vapours around [npc.name]!",
      castNpc: "With a sweeping motion of [npc.her] [npc.arm], [npc.name] summons forth a cloud of poison vapours around [npc2.name]!",
    },
    CLOAK_OF_FLAMES: {
      id: "CLOAK_OF_FLAMES",
      name: "Cloak of Flames",
      school: "FIRE",
      damageType: "FIRE",
      damage: 0,
      variance: "LOW",
      cost: 50,
      ap: 1,
      effect: "cloak",
      description: "Shrouds the target in a protective cloak of arcane flames, granting them improved fire and ice resistance.",
      extra: "Lasts for 3 turns. +5 fire and +10 ice shielding.",
      castPc: "With a swipe of your [pc.arm], you summon a protective cloak of arcane fire around yourself!",
      castNpc: "With a swipe of [npc.her] [npc.arm], [npc.name] summons a protective cloak of arcane fire around [npc.herself]!",
    },
    RAIN_CLOUD: {
      id: "RAIN_CLOUD",
      name: "Rain Cloud",
      school: "WATER",
      damageType: "ICE",
      damage: 0,
      variance: "LOW",
      cost: 33,
      ap: 1,
      effect: "rain",
      description: "Summons a small cloud of arcane-enchanted rain above the target's head, which saps their ability to cast spells.",
      extra: "Lasts for 3 turns. Spell costs +25%.",
      castPc: "With an upwards thrust of your [pc.arm], you summon forth a cloud of rain above [npc.namePos] head!",
      castNpc: "With an upwards thrust of [npc.her] [npc.arm], [npc.name] summons forth a cloud of rain above [npc2.namePos] head!",
    },
    VACUUM: {
      id: "VACUUM",
      name: "Vacuum",
      school: "AIR",
      damageType: "PHYSICAL",
      damage: 5,
      variance: "LOW",
      cost: 60,
      ap: 1,
      effect: "health",
      description: "Creates a void in the air, dealing a small amount of initial damage as it sucks in the target, before lingering around to continue to disrupt their movements.",
      extra: "Lasts for 4 turns.",
      castPc: "With a clench of your fist, you summon forth a vacuum right next to [npc.name]!",
      castNpc: "With a clench of [npc.her] fist, [npc.name] summons forth a vacuum right next to [npc2.name]!",
    },
    SOOTHING_WATERS: {
      id: "SOOTHING_WATERS",
      name: "Soothing Waters",
      school: "WATER",
      damageType: "ICE",
      damage: 0,
      variance: "LOW",
      cost: 100,
      ap: 3,
      effect: "heal",
      description: "Summons an orb of soothing arcane-infused water, which restores the health of anyone who drinks it.",
      extra: "Restores 20% health.",
      castPc: "With a gentle swish of your [pc.hand], you summon forth an orb of healing water, which you quickly drink.",
      castNpc: "With a gentle swish of [npc.her] [npc.hand], [npc.name] summons forth an orb of healing water, which [npc.she] quickly drinks.",
    },
    STONE_SHELL: {
      id: "STONE_SHELL",
      name: "Stone Shell",
      school: "EARTH",
      damageType: "PHYSICAL",
      damage: 0,
      variance: "LOW",
      cost: 25,
      ap: 1,
      effect: "shell",
      description: "Summons a protective layer of stone around the target.",
      extra: "Lasts for 3 turns. +5 physical shielding.",
      castPc: "Thrusting your [pc.hand] forwards, you summon forth a levitating stone shell to protect you from incoming attacks!",
      castNpc: "Thrusting [npc.her] [npc.hand] forwards, [npc.name] summons forth a levitating stone shell to protect [npc.herHim] from incoming attacks!",
    },
    ARCANE_AROUSAL: {
      id: "ARCANE_AROUSAL",
      name: "Arcane Arousal",
      school: "ARCANE",
      damageType: "LUST",
      damage: 15,
      variance: "LOW",
      cost: 50,
      ap: 1,
      effect: "lust",
      description: "Causes the target to witness a highly arousing arcane vision.",
      castPc: "You focus your arcane energy on projecting an arousing vision into [npc.namePos] mind.",
      castNpc: "[npc.Name] focuses [npc.her] arcane energy on projecting an arousing vision into [npc2.namePos] mind!",
    },
    ARCANE_CLOUD: {
      id: "ARCANE_CLOUD",
      name: "Arcane Cloud",
      school: "ARCANE",
      damageType: "PHYSICAL",
      damage: 0,
      variance: "LOW",
      cost: 150,
      ap: 1,
      effect: "cloud",
      description: "Summons an arcane-imbued stormcloud over the target's head.",
      extra: "Lasts for 3 turns. −25 lust resistance.",
      castPc: "With an upwards thrust of your [pc.arm], you summon forth an arcane cloud above [npc.namePos] head!",
      castNpc: "With an upwards thrust of [npc.her] [npc.arm], [npc.name] summons forth an arcane cloud above [npc2.namePos] head!",
    },
    TELEPATHIC_COMMUNICATION: {
      id: "TELEPATHIC_COMMUNICATION",
      name: "Telepathic Communication",
      school: "ARCANE",
      damageType: "PHYSICAL",
      damage: 0,
      variance: "LOW",
      cost: 75,
      ap: 1,
      effect: "telepathic",
      self: true,
      description: "The caster projects seductive voices into the mind of the target.",
      extra: "Lasts for 5 turns. +15 lust damage.",
      castPc: "You focus your arcane energy on enabling your thoughts to be projected into others' minds!",
      castNpc: "[npc.Name] focuses [npc.her] arcane energy on enabling [npc.her] thoughts to be projected into others' minds!",
    },
  };

  LT.SPELL_IDS = [
    "FIREBALL",
    "FLASH",
    "CLOAK_OF_FLAMES",
    "ICE_SHARD",
    "RAIN_CLOUD",
    "POISON_VAPOURS",
    "VACUUM",
    "SLAM",
    "STONE_SHELL",
    "SOOTHING_WATERS",
    "ARCANE_AROUSAL",
    "ARCANE_CLOUD",
    "TELEPATHIC_COMMUNICATION",
  ];

  LT.knownSpells = function (ch) {
    if (ch && ch.knownSpells && ch.knownSpells.length) return ch.knownSpells.slice();
    return [];
  };

  LT.learnSpell = function (ch, id) {
    if (!ch || !id || !LT.SPELLS[id]) return;
    ch.knownSpells = ch.knownSpells || [];
    if (ch.knownSpells.indexOf(id) < 0) ch.knownSpells.push(id);
  };

  LT.spellRange = function (spell) {
    var v = (LT.DAMAGE_VARIANCE && LT.DAMAGE_VARIANCE[spell.variance]) || 0.1;
    var base = spell.damage || 0;
    return {
      min: Math.max(0, Math.round(base * (1 - v))),
      max: Math.max(0, Math.round(base * (1 + v))),
    };
  };

  LT.rollSpell = function (spell) {
    var range = LT.spellRange(spell);
    if (range.max <= range.min) return range.min;
    return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
  };

  LT.queuedSpellCost = function (ch) {
    var total = 0;
    var moves = (ch && ch.selectedMoves) || [];
    for (var i = 0; i < moves.length; i++) {
      var move = LT.MOVES[moves[i].id];
      if (move && move.spell) {
        total += typeof LT.spellCostOf === "function" ? LT.spellCostOf(ch, move.spell) : move.spell.cost;
      }
    }
    return total;
  };

  LT.canAffordSpell = function (ch, spell) {
    if (!ch || !spell) return false;
    var cost = typeof LT.spellCostOf === "function" ? LT.spellCostOf(ch, spell) : spell.cost;
    return (ch.mana || 0) - LT.queuedSpellCost(ch) >= cost;
  };

  function parseCast(spell, src, tgt) {
    var isPlayer = src && ((src.isPlayer && src.isPlayer()) || src.player);
    var text = isPlayer ? spell.castPc : spell.castNpc;
    if (!text) return nameOf(src) + " casts " + spell.name;
    if (typeof LT.parse !== "function") return text;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets(isPlayer ? { npc: tgt, npc2: tgt } : { npc: src, npc2: tgt }, function () {
        return LT.parse(text);
      });
    }
    return LT.parse(text);
  }

  function spendAura(src, spell) {
    var cost = typeof LT.spellCostOf === "function" ? LT.spellCostOf(src, spell) : spell.cost;
    var before = src.mana || 0;
    if (before < cost) return false;
    src.mana = before - cost;
    return true;
  }

  function colourOf(spell) {
    if (spell.effect === "lust") return LT.Colour.ATTRIBUTE_LUST;
    if (spell.damageType === "POISON") return LT.Colour.GENERIC_MINOR_GOOD;
    if (spell.damageType === "FIRE") return LT.Colour.GENERIC_BAD;
    if (spell.damageType === "ICE") return LT.Colour.ATTRIBUTE_MANA;
    return LT.Colour.ATTRIBUTE_PHYSIQUE;
  }

  function register(spell) {
    var moveId = "spell_" + spell.id;
    LT.MOVES[moveId] = {
      id: moveId,
      name: spell.name,
      spell: spell,
      ap: spell.ap || 1,
      canUse: function (src) {
        return LT.canAffordSpell(src, spell);
      },
      cannotUseReason: function (src) {
        return (
          "You need at least " +
          spell.cost +
          " aura to cast " +
          spell.name +
          "!" +
          (src && src.mana != null ? " (You have " + Math.max(0, (src.mana || 0) - LT.queuedSpellCost(src)) + ".)" : "")
        );
      },
      tooltip: function (src, tgt) {
        var extra = spell.extra ? " " + spell.extra : "";
        if (
          spell.effect === "flash" ||
          spell.effect === "poison" ||
          spell.effect === "heal" ||
          spell.effect === "shell" ||
          spell.effect === "cloak" ||
          spell.effect === "rain" ||
          spell.effect === "cloud" ||
          spell.effect === "telepathic"
        ) {
          return spell.description + extra + " Costs " + spell.cost + " aura.";
        }
        var range = LT.spellRange(spell);
        var kind = spell.effect === "lust" ? "lust" : "damage";
        return (
          spell.description +
          " Deal " +
          range.min +
          "–" +
          range.max +
          " " +
          kind +
          " to " +
          nameOf(tgt) +
          ". Costs " +
          spell.cost +
          " aura."
        );
      },
      predict: function (src, tgt) {
        var extra = spell.extra || "";
        if (
          spell.effect === "flash" ||
          spell.effect === "poison" ||
          spell.effect === "heal" ||
          spell.effect === "shell" ||
          spell.effect === "cloak" ||
          spell.effect === "rain" ||
          spell.effect === "cloud" ||
          spell.effect === "telepathic"
        ) {
          return (
            "<span style='color:" +
            colourOf(spell) +
            ";'>" +
            spell.name +
            "</span> " +
            nameOf(spell.self ? src : tgt) +
            " — " +
            extra +
            " (" +
            spell.cost +
            " aura)."
          );
        }
        var range = LT.spellRange(spell);
        var kind = spell.effect === "lust" ? "lust" : "damage";
        return (
          "<span style='color:" +
          colourOf(spell) +
          ";'>" +
          spell.name +
          "</span> " +
          nameOf(tgt) +
          " for " +
          range.min +
          "–" +
          range.max +
          " " +
          kind +
          " (" +
          spell.cost +
          " aura)."
        );
      },
      perform: function (src, tgt, turnIndex) {
        if (!spendAura(src, spell)) {
          return nameOf(src) + " does not have enough aura to cast " + spell.name + "!";
        }
        var spent = typeof LT.spellCostOf === "function" ? LT.spellCostOf(src, spell) : spell.cost;
        var flavour = parseCast(spell, src, tgt);
        if (spell.effect === "flash") {
          if (tgt && typeof LT.applyStatus === "function") LT.applyStatus(tgt, "FLASH", 1);
          return flavour + " " + nameOf(tgt) + " is dazzled (−1 AP). (-" + spent + " aura)";
        }
        if (spell.effect === "poison") {
          if (tgt && typeof LT.applyStatus === "function") LT.applyStatus(tgt, "POISON_VAPOURS", 3);
          return flavour + " A poison cloud lingers for 3 turns (25/turn). (-" + spent + " aura)";
        }
        if (spell.effect === "heal") {
          var heal = Math.round((src.maxHealth || 0) * 0.2);
          src.health = Math.min(src.maxHealth || heal, (src.health || 0) + heal);
          return flavour + " Restores <b>" + heal + "</b> health. (-" + spent + " aura)";
        }
        if (spell.effect === "shell") {
          if (typeof LT.applyStatus === "function") LT.applyStatus(src, "STONE_SHELL", 3);
          return flavour + " +5 physical shielding for 3 turns. (-" + spent + " aura)";
        }
        if (spell.effect === "cloak") {
          if (typeof LT.applyStatus === "function") LT.applyStatus(src, "CLOAK_OF_FLAMES", 3);
          return flavour + " +5 fire and +10 ice shielding for 3 turns. (-" + spent + " aura)";
        }
        if (spell.effect === "rain") {
          if (tgt && typeof LT.applyStatus === "function") LT.applyStatus(tgt, "RAIN_CLOUD", 3);
          return flavour + " " + nameOf(tgt) + "'s spells cost 25% more for 3 turns. (-" + spent + " aura)";
        }
        if (spell.effect === "cloud") {
          if (tgt && typeof LT.applyStatus === "function") LT.applyStatus(tgt, "ARCANE_CLOUD", 3);
          return flavour + " " + nameOf(tgt) + " has −25 lust resistance for 3 turns. (-" + spent + " aura)";
        }
        if (spell.effect === "telepathic") {
          if (typeof LT.applyStatus === "function") LT.applyStatus(src, "TELEPATHIC_COMMUNICATION", 5);
          return flavour + " +15 lust damage for 5 turns. (-" + spent + " aura)";
        }
        var dmg = LT.rollSpell(spell);
        var crit = typeof LT.applyCrit === "function" ? LT.applyCrit(src, "spell_" + spell.id, turnIndex, dmg) : { dmg: dmg, crit: false };
        dmg = crit.dmg;
        if (spell.effect === "lust") {
          if (typeof LT.modifyOutgoingLust === "function") dmg = LT.modifyOutgoingLust(src, dmg);
          if (tgt && tgt.resisting) dmg = Math.max(1, Math.round(dmg * 0.5));
          var dealt = typeof LT.applyLust === "function" ? LT.applyLust(tgt, dmg) : dmg;
          return flavour + " <b style='color:" + LT.Colour.ATTRIBUTE_LUST + ";'>" + dealt + "</b> lust. (-" + spent + " aura)" + (crit.crit ? " <b>Critical hit!</b>" : "");
        }
        if (tgt && typeof LT.applyTypedDamage === "function") LT.applyTypedDamage(tgt, dmg, spell.damageType || "PHYSICAL");
        else if (tgt) tgt.health = Math.max(0, (tgt.health || 0) - dmg);
        return flavour + " for <b>" + dmg + "</b> damage. (-" + spent + " aura)" + (crit.crit ? " <b>Critical hit!</b>" : "");
      },
    };
  }

  for (var i = 0; i < LT.SPELL_IDS.length; i++) register(LT.SPELLS[LT.SPELL_IDS[i]]);
})();
