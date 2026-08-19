(function () {
  function GameCharacter(opts) {
    opts = opts || {};
    this.id = opts.id;
    this.player = !!opts.player;
    this.names = { masculine: "Unknown", androgynous: "Unknown", feminine: "Unknown" };
    this.surname = "";
    this.gender = LT.Gender.FEMALE;
    this.femininityValue = 70;
    this.orientation = LT.Orientation.AMBIPHILIC;
    this.personality = {};
    this.birthday = new Date(1997, 5, 15);
    this.level = 1;
    this.experience = 0;
    this.experienceForLevel = 10;
    this.physique = 10;
    this.arcane = 10;
    this.maxHealth = LT.maxHealthOf(this);
    this.health = this.maxHealth;
    this.maxMana = LT.maxManaOf(this);
    this.mana = this.maxMana;
    this.corruption = 0;
    this.arousal = 0;
    this.lust = 10;
    this.essences = 0;
    this.knownSpells = [];
    this.items = [];
    this.money = 0;
    this.location = null;
    this.equipped = {};
    this.wardrobe = [];
    this.mainWeapon = null;
    this.offhandWeapon = null;
    this.weapons = [];
    this.occupation = null;
    this.sex = {
      vaginal: 0,
      anal: 0,
      oral: 0,
      penisVirgin: true,
      vaginaVirgin: true,
    };
    this.applyHumanDefaults();
  }

  GameCharacter.prototype.isPlayer = function () {
    return this.player;
  };

  GameCharacter.prototype.isFeminine = function () {
    return this.femininityValue >= 50 || this.gender.feminine;
  };

  GameCharacter.prototype.getFemininity = function () {
    return LT.femininityFromValue(this.femininityValue);
  };

  GameCharacter.prototype.getFemininityValue = function () {
    return this.femininityValue;
  };

  GameCharacter.prototype.setFemininity = function (entry) {
    this.femininityValue = typeof entry === "number" ? entry : entry.value;
  };

  GameCharacter.prototype.getGender = function () {
    return this.gender;
  };

  GameCharacter.prototype.setGender = function (gender) {
    var changed = this.gender !== gender;
    this.gender = gender;
    if (gender === LT.Gender.FEMALE && this.femininityValue < 50) this.femininityValue = 70;
    if (gender === LT.Gender.MALE && this.femininityValue > 50) this.femininityValue = 30;
    this.penisPresent = !!(gender && gender.hasPenis);
    this.vaginaPresent = !!(gender && gender.hasVagina);
    if (changed) this.applyHumanDefaults();
  };

  GameCharacter.prototype.hasFetish = function (id) {
    return !!(this.fetishes && this.fetishes[id]);
  };

  GameCharacter.prototype.hasPerk = function (id) {
    return !!(this.perks && this.perks[id]);
  };

  GameCharacter.prototype.hasPenis = function () {
    if (this.body && this.body.penis) return this.body.penis.type !== "NONE";
    if (this.penisPresent != null) return !!this.penisPresent;
    return !!(this.gender && this.gender.hasPenis);
  };

  GameCharacter.prototype.hasVagina = function () {
    if (this.body && this.body.vagina) return this.body.vagina.type !== "NONE";
    if (this.vaginaPresent != null) return !!this.vaginaPresent;
    return !!(this.gender && this.gender.hasVagina);
  };

  GameCharacter.prototype.hasBreasts = function () {
    return !!(this.gender && this.gender.hasBreasts) || (this.breastSize && this.breastSize.id !== "FLAT");
  };

  GameCharacter.prototype.applyHumanDefaults = function () {
    var f = this.isFeminine();
    this.heightCm = f ? 168 : 178;
    this.skin = LT.findById(LT.SKIN, "LIGHT");
    this.bodySize = LT.BODY_SIZE.TWO_AVERAGE;
    this.muscle = f ? LT.MUSCLE.ONE_LIGHTLY : LT.MUSCLE.TWO_TONED;
    this.lipSize = f ? LT.LIP.TWO_FULL : LT.LIP.ONE_AVERAGE;
    this.lipsPuffy = false;
    this.eye = LT.findById(LT.EYE, "BROWN");
    this.hairLength = f ? LT.HAIR_LENGTH.FOUR_LONG : LT.HAIR_LENGTH.TWO_SHORT;
    this.hairStyle = f ? LT.findById(LT.HAIR_STYLE, "WAVY") : LT.findById(LT.HAIR_STYLE, "MESSY");
    this.hair = LT.findById(LT.HAIR_COLOUR, "BROWN");
    this.breastSize = f ? LT.CUP.C : LT.CUP.FLAT;
    this.breastShape = LT.findById(LT.BREAST_SHAPE, "ROUND");
    this.nippleSize = LT.SIZE5[f ? 2 : 1];
    this.areolaeSize = LT.SIZE5[f ? 2 : 1];
    this.nipplesPuffy = false;
    this.assSize = LT.SIZE5[f ? 3 : 2];
    this.hipSize = LT.SIZE5[f ? 3 : 2];
    this.anusBleached = false;
    this.penisLength = 15;
    this.testicleSize = LT.SIZE5[2];
    this.vaginaCapacity = LT.SIZE5[2];
    this.labiaSize = LT.SIZE5[2];
    this.clitorisSize = LT.SIZE5[0];
    if (typeof LT.createBody === "function") {
      this.body = LT.createBody({
        feminine: f,
        hasPenis: this.penisPresent != null ? !!this.penisPresent : !!(this.gender && this.gender.hasPenis),
        hasVagina: this.vaginaPresent != null ? !!this.vaginaPresent : !!(this.gender && this.gender.hasVagina),
        hasBreasts: !!(this.gender && this.gender.hasBreasts) || f,
        height: this.heightCm,
        femininity: this.femininityValue,
        bodySize: this.bodySize,
        muscle: this.muscle,
        skin: this.skin,
        lipSize: this.lipSize,
        lipsPuffy: this.lipsPuffy,
        eye: this.eye,
        hairLength: this.hairLength,
        hairStyle: this.hairStyle,
        hair: this.hair,
        breastSize: this.breastSize,
        breastShape: this.breastShape,
        nippleSize: this.nippleSize,
        areolaeSize: this.areolaeSize,
        nipplesPuffy: this.nipplesPuffy,
        assSize: this.assSize,
        hipSize: this.hipSize,
        anusBleached: this.anusBleached,
        penisLength: this.penisLength,
        testicleSize: this.testicleSize,
        vaginaCapacity: this.vaginaCapacity && this.vaginaCapacity.id,
        labiaSize: this.labiaSize,
        clitorisSize: this.clitorisSize,
        race: "HUMAN",
      });
    }
    if (typeof LT.ensureCharacterSystems === "function") LT.ensureCharacterSystems(this);
  };

  GameCharacter.prototype.getBodyShape = function () {
    return LT.bodyShapeOf(this.bodySize, this.muscle);
  };

  GameCharacter.prototype.describeBody = function () {
    return LT.describeBody(this);
  };

  GameCharacter.prototype.getName = function () {
    if (this.femininityValue < 40) return this.names.masculine;
    if (this.femininityValue > 60) return this.names.feminine;
    return this.names.androgynous;
  };

  GameCharacter.prototype.setName = function (masculine, androgynous, feminine) {
    this.names = {
      masculine: masculine,
      androgynous: androgynous || masculine,
      feminine: feminine || masculine,
    };
  };

  GameCharacter.prototype.getRaceName = function () {
    var raw = this.fullRace || this.raceName || "human";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  GameCharacter.prototype.getAgeValue = function (now) {
    now = now || (typeof LT.gameNow === "function" ? LT.gameNow() : new Date(2019, 9, 1));
    var age = now.getFullYear() - this.birthday.getFullYear();
    var md = now.getMonth() * 32 + now.getDate();
    var bd = this.birthday.getMonth() * 32 + this.birthday.getDate();
    if (md < bd) age -= 1;
    return age;
  };

  GameCharacter.prototype.setAge = function (age, now) {
    now = now || (typeof LT.gameNow === "function" ? LT.gameNow() : new Date(2019, 9, 1));
    var clamped = Math.max(18, Math.min(50, age));
    var month = this.birthday.getMonth();
    var date = this.birthday.getDate();
    var year = now.getFullYear() - clamped;
    var md = now.getMonth() * 32 + now.getDate();
    var bd = month * 32 + date;
    if (md < bd) year -= 1;
    this.birthday = new Date(year, month, date);
  };

  GameCharacter.prototype.hasPersonalityTrait = function (id) {
    return !!this.personality[id];
  };

  GameCharacter.prototype.togglePersonality = function (id) {
    var trait = null;
    for (var i = 0; i < LT.PERSONALITY.length; i++) {
      if (LT.PERSONALITY[i].id === id) {
        trait = LT.PERSONALITY[i];
        break;
      }
    }
    if (!trait) return;
    if (this.personality[id]) {
      delete this.personality[id];
      return;
    }
    var exclusive = trait.exclusive || [];
    for (var j = 0; j < exclusive.length; j++) delete this.personality[exclusive[j]];
    this.personality[id] = true;
  };

  GameCharacter.prototype.she = function () {
    return this.isFeminine() ? "she" : "he";
  };

  GameCharacter.prototype.her = function () {
    return this.isFeminine() ? "her" : "his";
  };

  GameCharacter.prototype.getGenderColour = function () {
    return this.gender.colour || LT.Colour.ANDROGYNOUS;
  };

  LT.GameCharacter = GameCharacter;

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
    var prevMaxMana = ch.maxMana || 0;
    ch.maxHealth = LT.maxHealthOf(ch);
    ch.maxMana = LT.maxManaOf(ch);
    ch.experienceForLevel = LT.experienceNeeded(ch.level || 1);
    if (fill || ch.health == null) ch.health = ch.maxHealth;
    else if (ch.maxHealth > prevMax) ch.health += ch.maxHealth - prevMax;
    if (ch.health > ch.maxHealth) ch.health = ch.maxHealth;
    if (ch.health < 0) ch.health = 0;
    if (fill || ch.mana == null) ch.mana = ch.maxMana;
    else if (ch.maxMana > prevMaxMana) ch.mana += ch.maxMana - prevMaxMana;
    if (ch.mana > ch.maxMana) ch.mana = ch.maxMana;
    if (ch.mana < 0) ch.mana = 0;
    return ch;
  };

  LT.incrementHealth = function (ch, amount) {
    if (!ch) return 0;
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch);
    var before = ch.health || 0;
    ch.health = Math.max(0, Math.min(ch.maxHealth || 0, before + (amount || 0)));
    return ch.health - before;
  };

  LT.incrementMana = function (ch, amount) {
    if (!ch) return 0;
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch);
    var before = ch.mana || 0;
    ch.mana = Math.max(0, Math.min(ch.maxMana || 0, before + (amount || 0)));
    return ch.mana - before;
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
