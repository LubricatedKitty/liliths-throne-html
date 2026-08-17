(function () {

  function statusPart(ch, key) {
    if (typeof LT.statusBonus !== "function") return 0;
    return (LT.statusBonus(ch)[key] || 0);
  }

  LT.maxHealthOf = function (ch) {
    var bonus = ((ch.enchantBonus && ch.enchantBonus.health) || 0) + statusPart(ch, "health");
    return 10 + 5 * (ch.level || 1) + 2 * (LT.effectivePhysique(ch) || 10) + bonus;
  };

  LT.maxManaOf = function (ch) {
    var bonus = ((ch.enchantBonus && ch.enchantBonus.mana) || 0) + statusPart(ch, "mana");
    return 5 + 2 * (ch.level || 1) + 5 * (LT.effectiveArcane(ch) || 10) + bonus;
  };

  LT.effectivePhysique = function (ch) {
    return (ch.physique || 10) + ((ch.enchantBonus && ch.enchantBonus.physique) || 0);
  };

  LT.effectiveArcane = function (ch) {
    return (ch.arcane || 10) + ((ch.enchantBonus && ch.enchantBonus.arcane) || 0);
  };

  LT.effectiveCorruption = function (ch) {
    return (ch.corruption || 0) + ((ch.enchantBonus && ch.enchantBonus.corruption) || 0);
  };

  LT.experienceNeeded = function (level) {
    return (level || 1) * 10;
  };

  LT.unarmedDamage = function (ch) {
    var bonus = (ch && ch.enchantBonus && ch.enchantBonus.damageUnarmed) || 0;
    return Math.max(1, 2 + Math.floor((LT.effectivePhysique(ch) || 10) / 5) + bonus);
  };

  LT.refreshVitals = function (ch, fill) {
    if (!ch) return ch;
    var prevMax = ch.maxHealth || 0;
    ch.maxHealth = LT.maxHealthOf(ch);
    ch.maxMana = LT.maxManaOf(ch);
    ch.experienceForLevel = LT.experienceNeeded(ch.level || 1);
    if (fill || ch.health == null) ch.health = ch.maxHealth;
    else if (ch.maxHealth > prevMax) ch.health += ch.maxHealth - prevMax;
    if (ch.health > ch.maxHealth) ch.health = ch.maxHealth;
    if (ch.health < 0) ch.health = 0;
    if (fill || ch.mana == null || ch.mana > ch.maxMana) ch.mana = ch.maxMana;
    return ch;
  };

  LT.incrementExperience = function (amount) {
    var p = LT.game && LT.game.player;
    if (!p || !amount) return "";
    if ((p.level || 1) >= 50) {
      p.experience = 0;
      return "";
    }
    p.experience = (p.experience || 0) + amount;
    var html =
      "<p style='text-align:center;'>You have gained <b style='color:" +
      LT.Colour.ATTRIBUTE_EXPERIENCE +
      ";'>" +
      amount +
      "</b> experience!</p>";
    while ((p.level || 1) < 50 && p.experience >= LT.experienceNeeded(p.level)) {
      p.experience -= LT.experienceNeeded(p.level);
      p.level += 1;
      LT.refreshVitals(p);
      html +=
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_EXCELLENT +
        ";'>Level up!</b> You are now level " +
        p.level +
        "!</p>";
    }
    p.experienceForLevel = LT.experienceNeeded(p.level);
    return html;
  };

  LT.createNewPlayer = function () {
    var p = new GameCharacter({ id: "player", player: true });
    p.setGender(LT.Gender.FEMALE);
    p.setFemininity(LT.Femininity.FEMININE);
    p.orientation = LT.Orientation.AMBIPHILIC;
    p.setName("Unknown", "Unknown", "Unknown");
    p.essences = 10;
    p.knownSpells = [];
    LT.refreshVitals(p, true);
    return p;
  };

  LT.describeBody = function (p) {
    if (!p) return "";
    var fem = p.getFemininity();
    var shape = p.getBodyShape();
    var heightFt = Math.floor(p.heightCm / 30.48);
    var heightIn = Math.round((p.heightCm / 2.54) % 12);
    var she = p.she();
    var her = p.her();
    var hairBit =
      p.hairLength.id === "ZERO_BALD"
        ? she.charAt(0).toUpperCase() + she.slice(1) + " is bald."
        : she.charAt(0).toUpperCase() +
          she.slice(1) +
          " has " +
          p.hairLength.name +
          ", " +
          p.hairStyle.name +
          " <span style='color:" +
          p.hair.hex +
          ";'>" +
          p.hair.name +
          "</span> hair.";
    var chest =
      p.breastSize.id === "FLAT"
        ? she.charAt(0).toUpperCase() + she.slice(1) + " has a flat chest."
        : she.charAt(0).toUpperCase() +
          she.slice(1) +
          " has " +
          p.breastShape.name +
          " " +
          p.breastSize.name +
          " breasts.";
    var genitals;
    if (p.hasPenis() && p.hasVagina()) {
      genitals =
        she.charAt(0).toUpperCase() +
        she.slice(1) +
        " has a " +
        p.penisLength +
        "-cm penis and a vagina with " +
        p.labiaSize.name +
        " labia.";
    } else if (p.hasPenis()) {
      genitals = she.charAt(0).toUpperCase() + she.slice(1) + " has a " + p.penisLength + "-cm penis and " + p.testicleSize.name + " testicles.";
    } else if (p.hasVagina()) {
      genitals = she.charAt(0).toUpperCase() + she.slice(1) + " has a vagina with " + p.labiaSize.name + " labia.";
    } else {
      genitals = she.charAt(0).toUpperCase() + she.slice(1) + " has a smooth mound.";
    }
    var html = (
      "<p>You are " +
      LT.article(fem.name.toLowerCase()) +
      " <span style='color:" +
      fem.colour +
      ";'>" +
      fem.name.toLowerCase() +
      "</span> " +
      p.getGender().name +
      ", standing " +
      p.heightCm +
      "cm (" +
      heightFt +
      "'" +
      heightIn +
      '") tall. Your body is <span style="color:' +
      shape.colour +
      ';">' +
      shape.name +
      "</span> — " +
      p.bodySize.name +
      " and " +
      p.muscle.name +
      " — with <span style='color:" +
      p.skin.hex +
      ";'>" +
      p.skin.name +
      "</span> skin.</p><p>" +
      hairBit +
      " " +
      she.charAt(0).toUpperCase() +
      she.slice(1) +
      " has <span style='color:" +
      p.eye.hex +
      ";'>" +
      p.eye.name +
      "</span> eyes and " +
      p.lipSize.name +
      (p.lipsPuffy ? ", puffy" : "") +
      " lips.</p><p>" +
      chest +
      " " +
      her.charAt(0).toUpperCase() +
      her.slice(1) +
      " ass is " +
      p.assSize.name +
      ", and " +
      her +
      " hips are " +
      p.hipSize.name +
      ". " +
      genitals +
      "</p>"
    );
    if (typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(p)) {
      html +=
        "<p>Your belly is visibly swollen. You are <b style='color:" +
        LT.Colour.GENERIC_SEX +
        ";'>" +
        (LT.hasStatusEffect(p, "PREGNANT_3") ? "ready to give birth" : LT.hasStatusEffect(p, "PREGNANT_2") ? "heavily pregnant" : "pregnant") +
        "</b>.</p>";
    }
    if (p.body) {
      var extras = [];
      function partLabel(id) {
        var t = LT.PART_TYPE && LT.PART_TYPE[id];
        return t ? t.name : String(id || "").toLowerCase().replace(/_/g, "-");
      }
      if (p.body.face && p.body.face.type && p.body.face.type !== "HUMAN") extras.push("a " + partLabel(p.body.face.type) + " face");
      if (p.body.ear && p.body.ear.type && p.body.ear.type !== "HUMAN" && p.body.ear.type !== "NONE") extras.push(partLabel(p.body.ear.type) + " ears");
      if (p.body.horn && p.body.horn.type && p.body.horn.type !== "NONE") extras.push(partLabel(p.body.horn.type) + " horns");
      if (p.body.tail && p.body.tail.type && p.body.tail.type !== "NONE") extras.push("a " + partLabel(p.body.tail.type) + " tail");
      if (p.body.wing && p.body.wing.type && p.body.wing.type !== "NONE") extras.push(partLabel(p.body.wing.type) + " wings");
      if (extras.length) {
        html += "<p>Racial features: " + extras.join(", ") + ".</p>";
      }
    }
    var worn = [];
    if (p.makeup) {
      Object.keys(p.makeup).forEach(function (key) {
        var rec = p.makeup[key];
        if (rec && rec.colour && rec.colour !== "NONE") {
          var slot = LT.findById(LT.MAKEUP_SLOTS, key);
          worn.push((slot ? slot.name.toLowerCase() : key.toLowerCase()) + " (" + rec.colour.toLowerCase().replace(/_/g, " ") + ")");
        }
      });
    }
    if (worn.length) html += "<p>Makeup: " + worn.join(", ") + ".</p>";
    var pierced = [];
    if (p.piercings) {
      Object.keys(p.piercings).forEach(function (key) {
        if (p.piercings[key]) pierced.push(key);
      });
    }
    if (pierced.length) html += "<p>Piercings: " + pierced.join(", ") + ".</p>";
    if (p.tattoos) {
      var tats = [];
      Object.keys(p.tattoos).forEach(function (key) {
        var t = p.tattoos[key];
        if (t) tats.push((t.name || t.type || "tattoo") + " on the " + key.toLowerCase().replace(/_/g, " "));
      });
      if (tats.length) html += "<p>Tattoos: " + tats.join("; ") + ".</p>";
    }
    return html;
  };
})();
