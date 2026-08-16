(function () {
  /* Official AbstractItemEffectType increment tables. */
  var SMALL = { MAJOR_DRAIN: -3, DRAIN: -2, MINOR_DRAIN: -1, MINOR_BOOST: 1, BOOST: 2, MAJOR_BOOST: 3 };
  var MEDIUM = { MAJOR_DRAIN: -15, DRAIN: -5, MINOR_DRAIN: -1, MINOR_BOOST: 1, BOOST: 5, MAJOR_BOOST: 15 };

  function delta(table, potency) {
    return table[potency] || 0;
  }

  function listOf(obj) {
    if (Array.isArray(obj)) return obj;
    var keys = Object.keys(obj);
    var out = [];
    var i;
    for (i = 0; i < keys.length; i++) out.push(obj[keys[i]]);
    return out;
  }

  function stepEnum(current, list, amount) {
    if (!list || !list.length || !amount) return current;
    var i = 0;
    for (i = 0; i < list.length; i++) {
      if (current && list[i] && (list[i] === current || list[i].id === current.id)) break;
    }
    if (i >= list.length) i = 0;
    i = Math.max(0, Math.min(list.length - 1, i + amount));
    return list[i];
  }

  function drinkType(item) {
    if (!item) return null;
    return (typeof LT.itemType === "function" && LT.itemType(item.id)) || item;
  }

  function raceLabel(item) {
    var t = drinkType(item);
    return (t && t.race) || "human";
  }

  function applyRaceCovering(ch, item) {
    var t = drinkType(item);
    if (!t) return "Nothing happens.";
    var fem = ch.isFeminine ? ch.isFeminine() : (ch.femininityValue || 50) >= 50;
    ch.raceName = t.race;
    ch.fullRace = fem ? t.fem : t.masc;
    if (ch.body) {
      var race = String(t.race || "human").toUpperCase().replace(/-/g, "_");
      ch.body.subspecies = race;
      ch.body.fleshSubspecies = race;
      if (race === "DEMON") ch.body.raceStage = "GREATER";
    }
    return "Your body takes on more " + t.race + " features.";
  }

  function syncParts(ch) {
    if (ch.penisPresent == null) ch.penisPresent = !!(ch.gender && ch.gender.hasPenis);
    if (ch.vaginaPresent == null) ch.vaginaPresent = !!(ch.gender && ch.gender.hasVagina);
  }

  function setPenis(ch, on) {
    syncParts(ch);
    ch.penisPresent = !!on;
    if (on && !ch.penisLength) ch.penisLength = 15;
    if (ch.body && ch.body.penis) {
      ch.body.penis.type = on ? ch.body.penis.type === "NONE" ? "HUMAN" : ch.body.penis.type : "NONE";
      if (on && !ch.body.penis.length) ch.body.penis.length = ch.penisLength || 15;
    }
  }

  function setVagina(ch, on) {
    syncParts(ch);
    ch.vaginaPresent = !!on;
    if (ch.body && ch.body.vagina) {
      ch.body.vagina.type = on ? ch.body.vagina.type === "NONE" ? "HUMAN" : ch.body.vagina.type : "NONE";
    }
  }

  LT.TF_STEP_SMALL = SMALL;
  LT.TF_STEP_MEDIUM = MEDIUM;

  LT.RACIAL_PRIMARIES = ["TF_CORE", "TF_FACE", "TF_HAIR", "TF_SKIN", "TF_ASS", "TF_BREASTS", "TF_PENIS", "TF_VAGINA"];

  LT.RACIAL_SECONDARIES = {
    TF_CORE: ["TF_TYPE_1", "TF_MOD_SIZE", "TF_MOD_SIZE_SECONDARY", "TF_MOD_SIZE_TERTIARY", "TF_MOD_FEMININITY"],
    TF_FACE: ["TF_TYPE_1", "TF_MOD_SIZE"],
    TF_HAIR: ["TF_TYPE_1", "TF_MOD_SIZE"],
    TF_SKIN: ["TF_TYPE_1"],
    TF_ASS: ["TF_TYPE_1", "TF_MOD_SIZE", "TF_MOD_SIZE_SECONDARY"],
    TF_BREASTS: ["TF_TYPE_1", "REMOVAL", "TF_MOD_SIZE", "TF_MOD_SIZE_SECONDARY", "TF_MOD_SIZE_TERTIARY"],
    TF_PENIS: ["TF_TYPE_1", "REMOVAL", "TF_MOD_SIZE", "TF_MOD_SIZE_TERTIARY"],
    TF_VAGINA: ["TF_TYPE_1", "REMOVAL", "TF_MOD_SIZE", "TF_MOD_SIZE_SECONDARY", "TF_MOD_CAPACITY"],
  };

  LT.isRacialIngredient = function (item) {
    if (!item) return false;
    if (item.kind === "tf" || item.kind === "potion") return true;
    var t = drinkType(item);
    return !!(t && t.kind === "tf");
  };

  LT.applyRacialEffect = function (ch, effect, item) {
    if (!ch || !effect) return "";
    var pot = effect.potency || "MINOR_BOOST";
    var small = delta(SMALL, pot);
    var medium = delta(MEDIUM, pot);
    var pri = effect.primary;
    var sec = effect.secondary;
    var race = raceLabel(item);

    if (sec === "TF_TYPE_1") {
      return applyRaceCovering(ch, item);
    }
    if (sec === "REMOVAL") {
      if (pri === "TF_PENIS") {
        if (!ch.hasPenis()) return "You have no penis to remove.";
        setPenis(ch, false);
        return "Your penis shrinks away until nothing remains.";
      }
      if (pri === "TF_VAGINA") {
        if (!ch.hasVagina()) return "You have no vagina to remove.";
        setVagina(ch, false);
        return "Your vagina seals shut until the flesh is smooth.";
      }
      if (pri === "TF_BREASTS") {
        ch.breastSize = LT.CUP.FLAT;
        return "Your chest flattens.";
      }
    }

    if (pri === "TF_CORE") {
      if (sec === "TF_MOD_SIZE") {
        var before = ch.heightCm || 170;
        ch.heightCm = Math.max(120, Math.min(250, before + medium));
        if (ch.heightCm === before) return "Your height does not change.";
        return "Your height is now " + ch.heightCm + "cm.";
      }
      if (sec === "TF_MOD_SIZE_SECONDARY") {
        ch.muscle = stepEnum(ch.muscle, LT.MUSCLE_LIST, small);
        return "Your muscles are now " + ch.muscle.name + ".";
      }
      if (sec === "TF_MOD_SIZE_TERTIARY") {
        ch.bodySize = stepEnum(ch.bodySize, LT.BODY_SIZE_LIST, small);
        return "Your body is now " + ch.bodySize.name + ".";
      }
      if (sec === "TF_MOD_FEMININITY") {
        var fem = Math.max(0, Math.min(100, (ch.femininityValue || 50) + medium));
        ch.femininityValue = fem;
        return "Your femininity is now " + fem + ".";
      }
    }

    if (pri === "TF_FACE" && sec === "TF_MOD_SIZE") {
      ch.lipSize = stepEnum(ch.lipSize, LT.LIP_LIST, small);
      return "Your lips are now " + ch.lipSize.name + ".";
    }

    if (pri === "TF_HAIR" && sec === "TF_MOD_SIZE") {
      ch.hairLength = stepEnum(ch.hairLength, LT.HAIR_LENGTH_LIST, small);
      return "Your hair is now " + ch.hairLength.name + ".";
    }

    if (pri === "TF_ASS") {
      if (sec === "TF_MOD_SIZE") {
        ch.assSize = stepEnum(ch.assSize, LT.SIZE5, small);
        return "Your ass is now " + ch.assSize.name + ".";
      }
      if (sec === "TF_MOD_SIZE_SECONDARY") {
        ch.hipSize = stepEnum(ch.hipSize, LT.SIZE5, small);
        return "Your hips are now " + ch.hipSize.name + ".";
      }
    }

    if (pri === "TF_BREASTS") {
      if (sec === "TF_MOD_SIZE") {
        ch.breastSize = stepEnum(ch.breastSize, LT.CUP_LIST, small);
        return "Your breasts are now " + ch.breastSize.name + ".";
      }
      if (sec === "TF_MOD_SIZE_SECONDARY") {
        ch.nippleSize = stepEnum(ch.nippleSize, LT.SIZE5, small);
        return "Your nipples are now " + ch.nippleSize.name + ".";
      }
      if (sec === "TF_MOD_SIZE_TERTIARY") {
        ch.areolaeSize = stepEnum(ch.areolaeSize, LT.SIZE5, small);
        return "Your areolae are now " + ch.areolaeSize.name + ".";
      }
    }

    if (pri === "TF_PENIS") {
      if (sec === "TF_TYPE_1") {
        setPenis(ch, true);
        applyRaceCovering(ch, item);
        return "You now have a penis. " + "It takes on a " + race + " shape.";
      }
      if (sec === "TF_MOD_SIZE") {
        if (!ch.hasPenis()) {
          setPenis(ch, true);
          ch.penisLength = 8;
        }
        ch.penisLength = Math.max(1, Math.min(80, (ch.penisLength || 15) + medium));
        return "Your penis is now " + ch.penisLength + "cm long.";
      }
      if (sec === "TF_MOD_SIZE_TERTIARY") {
        if (!ch.hasPenis()) setPenis(ch, true);
        ch.testicleSize = stepEnum(ch.testicleSize, LT.SIZE5, small);
        return "Your testicles are now " + ch.testicleSize.name + ".";
      }
    }

    if (pri === "TF_VAGINA") {
      if (sec === "TF_TYPE_1") {
        setVagina(ch, true);
        applyRaceCovering(ch, item);
        return "You now have a vagina. It takes on a " + race + " shape.";
      }
      if (sec === "TF_MOD_SIZE") {
        if (!ch.hasVagina()) setVagina(ch, true);
        ch.clitorisSize = stepEnum(ch.clitorisSize, LT.SIZE5, small);
        return "Your clitoris is now " + ch.clitorisSize.name + ".";
      }
      if (sec === "TF_MOD_SIZE_SECONDARY") {
        if (!ch.hasVagina()) setVagina(ch, true);
        ch.labiaSize = stepEnum(ch.labiaSize, LT.SIZE5, small);
        return "Your labia are now " + ch.labiaSize.name + ".";
      }
      if (sec === "TF_MOD_CAPACITY") {
        if (!ch.hasVagina()) setVagina(ch, true);
        ch.vaginaCapacity = stepEnum(ch.vaginaCapacity, LT.SIZE5, small);
        return "Your vagina is now " + ch.vaginaCapacity.name + ".";
      }
    }

    return "The potion fizzes, but this body cannot take that change yet.";
  };

  LT.applyRacialEffects = function (ch, item) {
    var effects = (item && item.effects) || [];
    if (!effects.length) return "";
    var lines = [];
    var i;
    for (i = 0; i < effects.length; i++) {
      var text = LT.applyRacialEffect(ch, effects[i], item);
      if (text) lines.push("<p>" + text + "</p>");
    }
    return lines.join("");
  };
})();
