(function () {
  function emptyBonus() {
    return {
      physique: 0,
      arcane: 0,
      health: 0,
      mana: 0,
      corruption: 0,
      fertility: 0,
      virility: 0,
      damageUnarmed: 0,
      damagePhysical: 0,
      damageLust: 0,
      resistPhysical: 0,
      resistLust: 0,
      resistFire: 0,
      resistIce: 0,
      spellCost: 0,
      restingLust: 0,
      actionPoints: 0,
    };
  }

  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function parseFor(ch, text) {
    if (!text) return "";
    if (typeof LT.parse === "function") {
      if (typeof LT.withParseTargets === "function") {
        return LT.withParseTargets({ npc: ch, pc: (LT.game && LT.game.player) || ch }, function () {
          return LT.parse(text);
        });
      }
      return LT.parse(text);
    }
    return text;
  }

  function nowSeconds() {
    return (LT.game && LT.game.secondsPassed) || 0;
  }

  function currentPlace(ch) {
    return (ch && ch.location && ch.location.place) || "";
  }

  function currentWorld(ch) {
    return (ch && ch.location && ch.location.world) || "";
  }

  LT.statusIcon = function (name) {
    return "assets/statusEffects/" + name + ".svg";
  };

  LT.worldRegionOf = function (world) {
    if (!world) return "";
    if (world === "MUSEUM" || world === "MUSEUM_LOST") return "OLD_WORLD";
    if (/HARPY/i.test(world)) return "HARPY_NESTS";
    if (/WORLD_MAP/i.test(world)) return "WORLD_MAP";
    if (/SUBMISSION|BAT_CAVERN/i.test(world)) return "SUBMISSION";
    if (/FIELD|ELIS|THEMISC/i.test(world)) return "FIELDS";
    return "DOMINION";
  };

  LT.isInNewWorld = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    return LT.worldRegionOf(currentWorld(ch)) !== "OLD_WORLD";
  };

  LT.isStormRegion = function (ch) {
    var region = LT.worldRegionOf(currentWorld(ch || (LT.game && LT.game.player)));
    return region === "DOMINION" || region === "HARPY_NESTS";
  };

  LT.isVulnerableToArcaneStorm = function (ch) {
    return (typeof LT.effectiveArcane === "function" ? LT.effectiveArcane(ch) : (ch && ch.arcane) || 0) < 10;
  };

  function weatherIcon(day, night) {
    return function () {
      return LT.statusIcon(typeof LT.isDayTime === "function" && LT.isDayTime() ? day : night);
    };
  }

  function weatherRemainingExtra() {
    var f = LT.game && LT.game.flags;
    if (!f) return [];
    if (f.weather === "MAGIC_STORM" || f.weather === "MAGIC_STORM_GATHERING") {
      return ["Time remaining: " + LT.formatStatusDuration(f.weatherTimeRemaining || 0)];
    }
    return [];
  }

  function weatherLibidoExtras(ch) {
    var extra = ["Enhanced libido"];
    return extra.concat(weatherRemainingExtra(ch));
  }

  function se(id, opts) {
    opts.id = id;
    LT.STATUS_EFFECTS[id] = opts;
    return opts;
  }

  LT.STATUS_EFFECTS = {};

  se("WEATHER_PROLOGUE", {
    name: "Strange Atmosphere",
    priority: 100,
    beneficial: false,
    icon: LT.statusIcon("weatherNightStormIncoming"),
    extra: ["Enhanced libido"],
    description: function () {
      return "There's a strange atmosphere surrounding the museum this evening, and you inexplicably find yourself feeling incredibly aroused...";
    },
    conditions: function (ch) {
      return !LT.isInNewWorld(ch);
    },
  });

  se("WEATHER_CLEAR", {
    name: "Clear skies",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDayClear", "weatherNightClear"),
    extra: weatherLibidoExtras,
    description: function (ch) {
      var sky =
        typeof LT.isDayTime === "function" && LT.isDayTime()
          ? "The sun shines down from a perfectly clear blue sky."
          : "The moon and stars shine down from a perfectly clear night's sky.";
      return sky + " Although there's no sign of a storm at the moment, " + nameOf(ch) + " can still feel the effects of the arcane manifesting in the form of an increased libido.";
    },
    conditions: function (ch) {
      return LT.isInNewWorld(ch) && typeof LT.currentWeather === "function" && LT.currentWeather() === "CLEAR";
    },
  });

  se("WEATHER_CLOUD", {
    name: "Cloudy skies",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDayCloudy", "weatherNightCloudy"),
    extra: weatherLibidoExtras,
    description: function (ch) {
      return (
        "The weather seems to change at a moment's notice, and is currently overcast, with a chance of rain. Although there's no sign of a storm at the moment, " +
        nameOf(ch) +
        " can still feel the effects of the arcane manifesting in the form of an increased libido."
      );
    },
    conditions: function (ch) {
      return LT.isInNewWorld(ch) && typeof LT.currentWeather === "function" && LT.currentWeather() === "CLOUD";
    },
  });

  se("WEATHER_RAIN", {
    name: "Rain",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDayRain", "weatherNightRain"),
    extra: weatherLibidoExtras,
    description: function (ch) {
      return (
        "The heavy rain clouds overhead have finally burst, unleashing a sudden, torrential downpour. Although there's no sign of a storm at the moment, " +
        nameOf(ch) +
        " can still feel the effects of the arcane manifesting in the form of an increased libido."
      );
    },
    conditions: function (ch) {
      return LT.isInNewWorld(ch) && typeof LT.currentWeather === "function" && LT.currentWeather() === "RAIN";
    },
  });

  se("WEATHER_SNOW", {
    name: "Snow",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDaySnow", "weatherNightSnow"),
    extra: weatherLibidoExtras,
    description: function (ch) {
      return (
        "The heavy clouds overhead have finally burst, unleashing a flurry of brilliant white snowflakes upon the land below. Although there's no sign of a storm at the moment, " +
        nameOf(ch) +
        " can still feel the effects of the arcane manifesting in the form of an increased libido."
      );
    },
    conditions: function (ch) {
      return LT.isInNewWorld(ch) && typeof LT.currentWeather === "function" && LT.currentWeather() === "SNOW";
    },
  });

  se("WEATHER_STORM_GATHERING", {
    name: "Gathering storm",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDayStormIncoming", "weatherNightStormIncoming"),
    extra: weatherLibidoExtras,
    description: function (ch) {
      return parseFor(
        ch,
        "A roiling mass of thick black storm clouds hang heavy in the skies above [npc.name]. Flashes of pink and purple energy can be seen just beneath their surface, and [npc.she] [npc.verb(realise)] that an arcane storm is going to break out at any moment.",
      );
    },
    conditions: function (ch) {
      return LT.isInNewWorld(ch) && typeof LT.currentWeather === "function" && LT.currentWeather() === "MAGIC_STORM_GATHERING";
    },
  });

  se("WEATHER_STORM", {
    name: "Arcane storm",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDayStorm", "weatherNightStorm"),
    attributes: { resistLust: -5 },
    extra: function (ch) {
      return ["Enhanced libido", "Double essence gains from sex & combat"].concat(weatherRemainingExtra(ch));
    },
    description: function (ch) {
      var base = "Huge streaks of pink and purple lightning arc through the sky as an arcane storm rages high above Dominion. ";
      if (!LT.isVulnerableToArcaneStorm(ch)) {
        return base + nameOf(ch) + "'s affinity with the arcane has rendered them almost completely immune to the arousing effects of arcane storms, with the only effect being feeling a little hornier than usual.";
      }
      return base + nameOf(ch) + " is far enough away from the storm's epicentre to be rendered all but immune to its arousing effects!";
    },
    conditions: function (ch) {
      if (!LT.isInNewWorld(ch) || typeof LT.currentWeather !== "function" || LT.currentWeather() !== "MAGIC_STORM") return false;
      var immune = typeof LT.isStormImmunePlace === "function" && LT.isStormImmunePlace(currentPlace(ch));
      if (!LT.isStormRegion(ch)) return true;
      return !LT.isVulnerableToArcaneStorm(ch) && !immune;
    },
  });

  se("WEATHER_STORM_VULNERABLE", {
    name: "Arcane storm",
    priority: 100,
    beneficial: false,
    icon: weatherIcon("weatherDayStorm", "weatherNightStorm"),
    attributes: { resistLust: -100, restingLust: 50 },
    extra: function (ch) {
      return ["Enhanced libido", "Overwhelming Lust", "Double essence gains from sex & combat"].concat(weatherRemainingExtra(ch));
    },
    description: function (ch) {
      return (
        "Huge streaks of pink and purple lightning arc through the sky as an arcane storm rages high above Dominion. " +
        nameOf(ch) +
        " is being heavily affected by the ongoing arcane storm, and can think of nothing but sex..."
      );
    },
    conditions: function (ch) {
      if (!LT.isInNewWorld(ch) || typeof LT.currentWeather !== "function" || LT.currentWeather() !== "MAGIC_STORM") return false;
      if (!LT.isStormRegion(ch)) return false;
      if (typeof LT.isStormImmunePlace === "function" && LT.isStormImmunePlace(currentPlace(ch))) return false;
      return LT.isVulnerableToArcaneStorm(ch);
    },
  });

  se("WEATHER_STORM_PROTECTED", {
    name: "Arcane storm (protected)",
    priority: 100,
    beneficial: true,
    icon: weatherIcon("weatherDayStormProtected", "weatherNightStormProtected"),
    extra: function (ch) {
      return ["Enhanced libido"].concat(weatherRemainingExtra(ch));
    },
    description: function (ch) {
      return (
        "Huge streaks of pink and purple lightning arc through the sky as an arcane storm rages high above Dominion. Although they can still feel its effects taking the form of an increased libido, " +
        nameOf(ch) +
        " is currently protected from most of the storm's wrath."
      );
    },
    conditions: function (ch) {
      if (!LT.isInNewWorld(ch) || typeof LT.currentWeather !== "function" || LT.currentWeather() !== "MAGIC_STORM") return false;
      if (!LT.isStormRegion(ch)) return false;
      return typeof LT.isStormImmunePlace === "function" && LT.isStormImmunePlace(currentPlace(ch));
    },
  });

  se("WELL_RESTED", {
    name: "well rested",
    priority: 80,
    beneficial: true,
    icon: LT.statusIcon("wellRested"),
    attributes: { health: 10, mana: 10 },
    description: function (ch) {
      return parseFor(ch, "After having a good rest, [npc.name] [npc.verb(feel)] full of energy.");
    },
  });

  se("WELL_RESTED_BOOSTED", {
    name: "well rested (boosted)",
    priority: 80,
    beneficial: true,
    icon: LT.statusIcon("wellRestedBoosted"),
    attributes: { health: 30, mana: 30 },
    description: function (ch) {
      return parseFor(ch, "Thanks to the upgraded emperor-size bed in [npc.her] room, [npc.name] [npc.has] managed to get a very comfortable rest, and now [npc.verb(feel)] full of energy and vigour.");
    },
  });

  se("WELL_RESTED_BOOSTED_EXTRA", {
    name: "well rested (extra boosted)",
    priority: 80,
    beneficial: true,
    icon: LT.statusIcon("wellRestedBoostedExtra"),
    attributes: { health: 60, mana: 60 },
    description: function (ch) {
      return parseFor(
        ch,
        "Thanks to the upgraded emperor-size bed in [npc.her] room, combined with [npc.her] ability of knowing how best to get a good rest, [npc.name] now [npc.verb(feel)] as though [npc.sheIs] overflowing of energy and vigour.",
      );
    },
  });

  se("FRUSTRATED_NO_ORGASM", {
    name: "Frustrated",
    priority: 80,
    beneficial: false,
    sex: true,
    icon: LT.statusIcon("frustrated"),
    attributes: { resistLust: -15 },
    description: function (ch) {
      return parseFor(ch, "[npc.Name] recently had a sexual encounter in which [npc.she] didn't manage to cum. As a result, [npc.sheIs] feeling extremely horny and frustrated...");
    },
  });

  se("RECOVERING_AURA", {
    name: "Strengthened aura",
    priority: 80,
    beneficial: false,
    sex: true,
    icon: LT.statusIcon("recoveringAura"),
    attributes: { resistLust: 5 },
    description: function (ch) {
      if (ch && ch.player) return "Due to a recent orgasm, your arcane aura has been temporarily strengthened. While in this state, you will no longer receive an arcane essence if you orgasm!";
      return parseFor(
        ch,
        "Due to a recent orgasm, [npc.namePos] arcane aura has been temporarily strengthened. While [npc.she] remains in this state, you will not receive an arcane essence if [npc.she] orgasms in your presence!",
      );
    },
  });

  se("FLASH", {
    name: "Blinded",
    priority: 10,
    beneficial: false,
    combat: true,
    icon: LT.statusIcon("blinded"),
    attributes: { actionPoints: -1 },
    description: function (ch) {
      return parseFor(ch, "The blinding flash of light has left [npc.name] temporarily dazzled, and [npc.sheIsFull] struggling to regain control of [npc.her] senses!");
    },
  });

  se("POISON_VAPOURS", {
    name: "Poison Vapours",
    priority: 10,
    beneficial: false,
    combat: true,
    icon: LT.statusIcon("combat_poisoned"),
    extra: ["25 poison damage per turn"],
    description: function (ch) {
      return parseFor(ch, "The cloud of poison vapours continues to linger around [npc.namePos] body, causing [npc.herHim] to cough and splutter each time [npc.she] [npc.verb(breathe)] in.");
    },
  });

  se("STONE_SHELL", {
    name: "Stone Shell",
    priority: 10,
    beneficial: true,
    combat: true,
    icon: LT.statusIcon("positiveCombatEffect"),
    attributes: { resistPhysical: 5 },
    description: function (ch) {
      return parseFor(ch, "A solid barrier of stone is being held up between [npc.name] and [npc.her] enemy, granting [npc.herHim] significantly improved physical defence.");
    },
  });

  se("CLOAK_OF_FLAMES", {
    name: "Cloak of Flames",
    priority: 10,
    beneficial: true,
    combat: true,
    icon: LT.statusIcon("melee_fire"),
    attributes: { resistFire: 5, resistIce: 10 },
    description: function (ch) {
      return parseFor(ch, "[npc.NameHasFull] been shrouded in a cloak of arcane flames which is increasing [npc.her] fire and cold resistances!");
    },
  });

  se("RAIN_CLOUD", {
    name: "Rain Cloud",
    priority: 10,
    beneficial: false,
    combat: true,
    icon: LT.statusIcon("weatherDayRain"),
    attributes: { spellCost: -25 },
    description: function (ch) {
      return parseFor(ch, "A small, arcane-infused rain cloud is hovering above [npc.namePos] head. The cold rain is sapping [npc.her] ability to effectively cast spells.");
    },
  });

  se("ARCANE_CLOUD", {
    name: "Arcane Cloud",
    priority: 10,
    beneficial: false,
    combat: true,
    icon: LT.statusIcon("weatherDayStorm"),
    attributes: { resistLust: -25 },
    description: function (ch) {
      return parseFor(ch, "A small arcane cloud is hovering above [npc.namePos] head. While subjected to its presence, the arousing effects of the arcane seep into [npc.her] mind.");
    },
  });

  se("TELEPATHIC_COMMUNICATION", {
    name: "Telepathic Communication",
    priority: 10,
    beneficial: true,
    combat: true,
    icon: LT.statusIcon("attLust3"),
    attributes: { damageLust: 15 },
    description: function (ch) {
      return parseFor(ch, "[npc.NameIsFull] able to project [npc.her] seductive taunts and [npc.moans+] directly into a person's mind!");
    },
  });

  se("PREGNANT_0", {
    name: "risk of pregnancy",
    priority: 80,
    beneficial: false,
    icon: LT.statusIcon("potionEffects"),
    description: function (ch) {
      return parseFor(
        ch,
        "After recently having unprotected sex, there's a risk that [npc.name] will get pregnant! Due to the fact that the arcane accelerates people's pregnancies, [npc.she]'ll know if [npc.sheIs] pregnant within a matter of hours...",
      );
    },
    onExpire: function (ch) {
      return typeof LT.applyPregnancyStageExpire === "function" ? LT.applyPregnancyStageExpire(ch, "PREGNANT_0") : "";
    },
  });

  se("PREGNANT_1", {
    name: "pregnant",
    priority: 80,
    beneficial: false,
    icon: LT.statusIcon("potionEffects"),
    attributes: { health: -1 },
    extra: ["-5% Maximum health"],
    description: function (ch) {
      return parseFor(ch, "From one of [npc.namePos] recent sexual encounters, [npc.sheHas] been impregnated! Due to the fact that the arcane accelerates people's pregnancies, [npc.she]'ll move onto the next stage with alarming speed.");
    },
    onExpire: function (ch) {
      return typeof LT.applyPregnancyStageExpire === "function" ? LT.applyPregnancyStageExpire(ch, "PREGNANT_1") : "";
    },
  });

  se("PREGNANT_2", {
    name: "heavily pregnant",
    priority: 80,
    beneficial: false,
    icon: LT.statusIcon("potionEffects"),
    attributes: { health: -2 },
    extra: ["-10% Maximum health"],
    description: function (ch) {
      return parseFor(ch, "[npc.NamePos] stomach has swollen considerably, making it obvious that [npc.sheIs] heavily pregnant. Due to the fact that the arcane accelerates people's pregnancies, [npc.she]'ll move onto the final stage with alarming speed.");
    },
    onExpire: function (ch) {
      return typeof LT.applyPregnancyStageExpire === "function" ? LT.applyPregnancyStageExpire(ch, "PREGNANT_2") : "";
    },
  });

  se("PREGNANT_3", {
    name: "ready to give birth",
    priority: 80,
    beneficial: false,
    icon: LT.statusIcon("potionEffects"),
    extra: ["Ready to give birth"],
    description: function (ch) {
      return parseFor(ch, "[npc.NamePos] belly has inflated to a colossal size, making it clear to anyone who glances [npc.her] way that [npc.sheIs] ready to give birth. It might be a good idea to visit Lilaya...");
    },
    conditions: function (ch) {
      return !!(
        typeof LT.isPregnant === "function" &&
        LT.isPregnant(ch) &&
        !LT.hasStatusEffect(ch, "PREGNANT_0") &&
        !LT.hasStatusEffect(ch, "PREGNANT_1") &&
        !LT.hasStatusEffect(ch, "PREGNANT_2")
      );
    },
  });

  function bag(ch) {
    if (!ch) return null;
    if (!ch.statusEffects) ch.statusEffects = {};
    return ch.statusEffects;
  }

  LT.getStatusDef = function (id) {
    return LT.STATUS_EFFECTS[id] || null;
  };

  LT.hasStatusEffect = function (ch, id) {
    return !!(ch && ch.statusEffects && ch.statusEffects[id]);
  };

  LT.getAppliedStatus = function (ch, id) {
    return ch && ch.statusEffects ? ch.statusEffects[id] : null;
  };

  LT.addStatusEffect = function (ch, id, duration) {
    if (!ch || !LT.STATUS_EFFECTS[id]) return false;
    var def = LT.STATUS_EFFECTS[id];
    var rec = bag(ch)[id] || { id: id, lastApplied: nowSeconds(), secondsPassed: 0 };
    if (duration && typeof duration === "object") {
      if (duration.combatTurns != null) rec.combatTurns = duration.combatTurns;
      if (duration.secondsRemaining != null) rec.secondsRemaining = duration.secondsRemaining;
    } else if (def.combat) {
      rec.combatTurns = duration == null ? 1 : duration;
    } else {
      rec.secondsRemaining = duration == null ? -1 : duration;
    }
    rec.lastApplied = nowSeconds();
    bag(ch)[id] = rec;
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch);
    return true;
  };

  LT.removeStatusEffect = function (ch, id) {
    if (!ch || !ch.statusEffects || !ch.statusEffects[id]) return false;
    delete ch.statusEffects[id];
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch);
    return true;
  };

  LT.removeCombatStatusEffects = function (ch) {
    if (!ch || !ch.statusEffects) return;
    Object.keys(ch.statusEffects).forEach(function (id) {
      var def = LT.STATUS_EFFECTS[id];
      if (def && def.combat) delete ch.statusEffects[id];
    });
  };

  LT.listStatusEffects = function (ch) {
    if (!ch || !ch.statusEffects) return [];
    var list = [];
    Object.keys(ch.statusEffects).forEach(function (id) {
      var def = LT.STATUS_EFFECTS[id];
      if (def) list.push({ id: id, def: def, applied: ch.statusEffects[id] });
    });
    list.sort(function (a, b) {
      return (b.def.priority || 0) - (a.def.priority || 0);
    });
    return list;
  };

  LT.statusBonus = function (ch) {
    var bonus = emptyBonus();
    if (!ch) return bonus;
    LT.listStatusEffects(ch).forEach(function (entry) {
      var attrs = entry.def.attributes;
      if (typeof attrs === "function") attrs = attrs(ch);
      if (!attrs) return;
      Object.keys(attrs).forEach(function (key) {
        bonus[key] = (bonus[key] || 0) + attrs[key];
      });
    });
    return bonus;
  };

  LT.getRestingLust = function (ch) {
    return 10 + ((LT.statusBonus(ch).restingLust) || 0);
  };

  LT.stormDoublesEssences = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    return LT.hasStatusEffect(ch, "WEATHER_STORM") || LT.hasStatusEffect(ch, "WEATHER_STORM_VULNERABLE");
  };

  LT.formatStatusDuration = function (seconds) {
    seconds = Math.max(0, Math.floor(seconds || 0));
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    if (h && m) return h + " hour" + (h === 1 ? "" : "s") + ", " + m + " minute" + (m === 1 ? "" : "s");
    if (h) return h + " hour" + (h === 1 ? "" : "s");
    if (m) return m + " minute" + (m === 1 ? "" : "s");
    return "less than a minute";
  };

  LT.refreshConditionalStatusEffects = function (ch) {
    if (!ch) return;
    Object.keys(LT.STATUS_EFFECTS).forEach(function (id) {
      var def = LT.STATUS_EFFECTS[id];
      if (!def.conditions) return;
      var ok = !!def.conditions(ch);
      if (ok && !LT.hasStatusEffect(ch, id)) {
        LT.addStatusEffect(ch, id, { secondsRemaining: -1 });
        if (id === "WEATHER_STORM_VULNERABLE") {
          ch.lust = Math.max(ch.lust || 0, LT.getRestingLust(ch));
        }
      } else if (!ok && LT.hasStatusEffect(ch, id) && (ch.statusEffects[id].secondsRemaining == null || ch.statusEffects[id].secondsRemaining < 0)) {
        LT.removeStatusEffect(ch, id);
      }
    });
  };

  LT.tickWorldStatusEffects = function (ch, seconds) {
    if (!ch || !seconds) return;
    var bagNow = bag(ch);
    Object.keys(bagNow).forEach(function (id) {
      var rec = bagNow[id];
      var def = LT.STATUS_EFFECTS[id];
      if (!def || def.combat) return;
      rec.secondsPassed = (rec.secondsPassed || 0) + seconds;
      if (rec.secondsRemaining != null && rec.secondsRemaining >= 0) {
        rec.secondsRemaining -= seconds;
        if (rec.secondsRemaining < 0) {
          if (def.onExpire) {
            var msg = def.onExpire(ch);
            if (msg && LT.game) LT.game.textEnd = (LT.game.textEnd || "") + msg;
          }
          delete bagNow[id];
        }
      }
    });
    LT.refreshConditionalStatusEffects(ch);
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch);
    /* Official HEALTH/MANA regeneration is a tiny fraction of maximum per hour. Sleep is the main refill. */
    if (seconds > 0) {
      var hours = seconds / 3600;
      if (typeof LT.incrementHealth === "function") LT.incrementHealth(ch, (ch.maxHealth || 0) * 0.01 * hours);
      if (typeof LT.incrementMana === "function") LT.incrementMana(ch, (ch.maxMana || 0) * 0.01 * hours);
    }
  };

  LT.applySleepEffect = function (ch, additionalMinutes) {
    if (!ch) return;
    additionalMinutes = additionalMinutes || 0;
    ch.lust = typeof LT.getRestingLust === "function" ? LT.getRestingLust(ch) : 0;
    LT.removeStatusEffect(ch, "WELL_RESTED");
    LT.removeStatusEffect(ch, "WELL_RESTED_BOOSTED");
    LT.removeStatusEffect(ch, "WELL_RESTED_BOOSTED_EXTRA");
    var seconds = 10 * 60 * 60 + additionalMinutes * 60;
    LT.addStatusEffect(ch, "WELL_RESTED", { secondsRemaining: seconds });
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch, true);
    ch.health = ch.maxHealth;
    ch.mana = ch.maxMana;
  };

  LT.applySexEndStatusEffects = function (ch, orgasmed) {
    if (!ch) return;
    var seconds = 14400;
    if (orgasmed) {
      LT.removeStatusEffect(ch, "FRUSTRATED_NO_ORGASM");
      LT.addStatusEffect(ch, "RECOVERING_AURA", { secondsRemaining: seconds });
    } else {
      LT.addStatusEffect(ch, "FRUSTRATED_NO_ORGASM", { secondsRemaining: seconds });
    }
  };

  function extraList(def, ch) {
    var extra = def.extra;
    if (typeof extra === "function") extra = extra(ch);
    return extra || [];
  }

  function iconSrc(def, ch) {
    var icon = def.icon;
    if (typeof icon === "function") icon = icon(ch);
    return icon || LT.statusIcon("potionEffects");
  }

  function descriptionOf(def, ch) {
    if (typeof def.description === "function") return def.description(ch);
    return def.description || "";
  }

  LT.statusTooltip = function (ch, id) {
    var def = LT.STATUS_EFFECTS[id];
    var rec = LT.getAppliedStatus(ch, id);
    if (!def) return id;
    var lines = ["<b>" + def.name + "</b>", descriptionOf(def, ch)];
    var extras = extraList(def, ch);
    var i;
    for (i = 0; i < extras.length; i++) lines.push(extras[i]);
    var attrs = def.attributes;
    if (typeof attrs === "function") attrs = attrs(ch);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var n = attrs[key];
        if (!n) return;
        lines.push((n > 0 ? "+" : "") + n + " " + key);
      });
    }
    if (rec && rec.secondsRemaining != null && rec.secondsRemaining >= 0) {
      lines.push("Remaining: " + LT.formatStatusDuration(rec.secondsRemaining));
    } else if (rec && rec.combatTurns != null) {
      lines.push(rec.combatTurns + " turn" + (rec.combatTurns === 1 ? "" : "s") + " remaining");
    }
    return lines.filter(Boolean).join("<br/>");
  };

  LT.paintStatusEffects = function (ch, rootId) {
    var root = document.getElementById(rootId || "status-effects");
    if (!root) return;
    ch = ch || (LT.game && LT.game.player);
    if (ch) LT.refreshConditionalStatusEffects(ch);
    var list = LT.listStatusEffects(ch);
    if (!list.length) {
      root.innerHTML = rootId && String(rootId).indexOf("status-effects-") === 0 ? "" : '<p class="muted" style="text-align:center;margin:0;padding:8px;">No status effects</p>';
      return;
    }
    var html = '<div class="status-effect-row">';
    list.forEach(function (entry) {
      html +=
        '<div class="status-effect-icon" data-status="' +
        entry.id +
        '"><img src="' +
        iconSrc(entry.def, ch) +
        '" alt="' +
        entry.def.name +
        '"></div>';
    });
    html += "</div>";
    root.innerHTML = html;
    var icons = root.querySelectorAll("[data-status]");
    var i;
    for (i = 0; i < icons.length; i++) {
      (function (el) {
        if (typeof LT.bindTooltip === "function") LT.bindTooltip(el, function () {
          return LT.statusTooltip(ch, el.getAttribute("data-status"));
        });
      })(icons[i]);
    }
  };

  LT.serializeStatusEffects = function (ch) {
    if (!ch || !ch.statusEffects) return {};
    var out = {};
    Object.keys(ch.statusEffects).forEach(function (id) {
      var rec = ch.statusEffects[id];
      out[id] = {
        id: id,
        secondsRemaining: rec.secondsRemaining,
        combatTurns: rec.combatTurns,
        lastApplied: rec.lastApplied,
        secondsPassed: rec.secondsPassed,
      };
    });
    return out;
  };

  LT.applySavedStatusEffects = function (ch, data) {
    if (!ch) return;
    ch.statusEffects = {};
    if (!data) return;
    Object.keys(data).forEach(function (id) {
      if (!LT.STATUS_EFFECTS[id]) return;
      ch.statusEffects[id] = {
        id: id,
        secondsRemaining: data[id].secondsRemaining,
        combatTurns: data[id].combatTurns,
        lastApplied: data[id].lastApplied || 0,
        secondsPassed: data[id].secondsPassed || 0,
      };
    });
  };

  /* Combat wrappers keep the existing spell / combat API. */
  LT.applyStatus = function (ch, id, turns) {
    LT.addStatusEffect(ch, id, { combatTurns: turns });
  };

  LT.getStatus = function (ch, id) {
    var rec = LT.getAppliedStatus(ch, id);
    if (!rec) return null;
    return { id: id, turns: rec.combatTurns != null ? rec.combatTurns : rec.secondsRemaining };
  };

  LT.clearStatuses = function (ch) {
    LT.removeCombatStatusEffects(ch);
  };

  LT.apPenalty = function (ch) {
    var flash = LT.getAppliedStatus(ch, "FLASH");
    return flash && flash.combatTurns > 0 ? 1 : 0;
  };

  LT.consumeFlash = function (ch) {
    var flash = LT.getAppliedStatus(ch, "FLASH");
    if (!flash) return 0;
    var penalty = flash.combatTurns > 0 ? 1 : 0;
    flash.combatTurns -= 1;
    if (flash.combatTurns <= 0) LT.removeStatusEffect(ch, "FLASH");
    return penalty;
  };

  LT.tickStatuses = function (ch) {
    var lines = [];
    if (!ch || !ch.statusEffects) return lines;
    var poison = ch.statusEffects.POISON_VAPOURS;
    if (poison && poison.combatTurns > 0) {
      var dmg = typeof LT.applyTypedDamage === "function" ? LT.applyTypedDamage(ch, 25, "POISON") : 25;
      if (typeof LT.applyTypedDamage !== "function") ch.health = Math.max(0, (ch.health || 0) - dmg);
      poison.combatTurns -= 1;
      var left = poison.combatTurns;
      lines.push(
        "<p>" +
          nameOf(ch) +
          " takes <b>" +
          dmg +
          "</b> poison damage" +
          (left > 0 ? " (" + left + " turn" + (left === 1 ? "" : "s") + " remaining)" : "") +
          ".</p>",
      );
      if (left <= 0) LT.removeStatusEffect(ch, "POISON_VAPOURS");
    }
    ["STONE_SHELL", "CLOAK_OF_FLAMES", "RAIN_CLOUD", "ARCANE_CLOUD", "TELEPATHIC_COMMUNICATION"].forEach(function (id) {
      var rec = ch.statusEffects[id];
      if (!rec || rec.combatTurns == null) return;
      rec.combatTurns -= 1;
      if (rec.combatTurns <= 0) LT.removeStatusEffect(ch, id);
    });
    if (typeof LT.refreshShields === "function") LT.refreshShields(ch);
    return lines;
  };

  LT.statusSummary = function (ch) {
    if (!ch || !ch.statusEffects) return "";
    var bits = [];
    LT.listStatusEffects(ch).forEach(function (entry) {
      if (!entry.def.combat) return;
      var turns = entry.applied.combatTurns;
      bits.push(entry.def.name + (turns != null ? " (" + turns + ")" : ""));
    });
    return bits.join(" · ");
  };
})();
