(function () {
  class Character {
    constructor(opts) {
      opts = opts || {};
      this.id = opts.id;
      this.player = !!opts.player;
      this.names = {
        masculine: "Unknown",
        androgynous: "Unknown",
        feminine: "Unknown",
      };
      this.raceName = opts.raceName || "human";
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
      this.slots = structuredClone(LT.slots);
      for (const slot of this.slots) {
        slot.owner = this.id;
      }
      this.sex = {
        vaginal: 0,
        anal: 0,
        oral: 0,
        penisVirgin: true,
        vaginaVirgin: true,
      };
      if (opts.defaults || true) {
        this.applyDefaults();
      }
    }
    initSlots() {
      if (this.gender.hasPenis) {
        this.slots.penis.active = true;
      }
      if (this.gender.hasVagina) {
        this.slots.vagina.active = true;
        this.slots.clitoris.active = true;
      }
    }
    isPlayer() {
      return this.player;
    }

    isFeminine() {
      return this.femininityValue >= 50 || this.gender.feminine;
    }

    getFemininity() {
      return LT.femininityFromValue(this.femininityValue);
    }

    getFemininityValue() {
      return this.femininityValue;
    }

    setFemininity(entry) {
      this.femininityValue = typeof entry === "number" ? entry : entry.value;
    }

    getGender() {
      return this.gender;
    }

    setGender(gender) {
      var changed = this.gender !== gender;
      this.gender = gender;
      if (gender === LT.Gender.FEMALE && this.femininityValue < 50)
        this.femininityValue = 70;
      if (gender === LT.Gender.MALE && this.femininityValue > 50)
        this.femininityValue = 30;
      this.penisPresent = !!(gender && gender.hasPenis);
      this.vaginaPresent = !!(gender && gender.hasVagina);
      if (changed) this.applyDefaults();
    }

    hasPenis() {
      if (this.body && this.body.penis) return this.body.penis.type !== "NONE";
      if (this.penisPresent != null) return !!this.penisPresent;
      return !!(this.gender && this.gender.hasPenis);
    }

    hasVagina() {
      if (this.body && this.body.vagina)
        return this.body.vagina.type !== "NONE";
      if (this.vaginaPresent != null) return !!this.vaginaPresent;
      return !!(this.gender && this.gender.hasVagina);
    }

    hasBreasts() {
      return (
        !!(this.gender && this.gender.hasBreasts) ||
        (this.breastSize && this.breastSize.id !== "FLAT")
      );
    }

    applyDefaults() {
      var f = this.isFeminine();
      this.heightCm = f ? 168 : 178;
      this.skin = LT.findById(LT.SKIN, "LIGHT");
      this.bodySize = LT.BODY_SIZE.TWO_AVERAGE;
      this.muscle = f ? LT.MUSCLE.ONE_LIGHTLY : LT.MUSCLE.TWO_TONED;
      this.lipSize = f ? LT.LIP.TWO_FULL : LT.LIP.ONE_AVERAGE;
      this.lipsPuffy = false;
      this.eye = LT.findById(LT.EYE, "BROWN");
      this.hairLength = f ? LT.HAIR_LENGTH.FOUR_LONG : LT.HAIR_LENGTH.TWO_SHORT;
      this.hairStyle = f
        ? LT.findById(LT.HAIR_STYLE, "WAVY")
        : LT.findById(LT.HAIR_STYLE, "MESSY");
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
        var bodyOpts = {
          race: this.raceName || "HUMAN",
          feminine: f,
          hasPenis:
            this.penisPresent != null
              ? !!this.penisPresent
              : !!(this.gender && this.gender.hasPenis),
          hasVagina:
            this.vaginaPresent != null
              ? !!this.vaginaPresent
              : !!(this.gender && this.gender.hasVagina),
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
          race: this.raceName || "HUMAN",
        };
        this.body = LT.createBody(bodyOpts);
      }
      if (typeof LT.ensureCharacterSystems === "function")
        LT.ensureCharacterSystems(this);
    }

    getBodyShape() {
      return LT.bodyShapeOf(this.bodySize, this.muscle);
    }

    describeBody() {
      return LT.describeBody(this);
    }

    getName() {
      if (this.femininityValue < 40) return this.names.masculine;
      if (this.femininityValue > 60) return this.names.feminine;
      return this.names.androgynous;
    }

    setName(masculine, androgynous, feminine) {
      this.names = {
        masculine: masculine,
        androgynous: androgynous || masculine,
        feminine: feminine || masculine,
      };
    }

    getRaceName() {
      var raw = this.fullRace || this.raceName || "human";
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    getAgeValue(now) {
      now =
        now ||
        (typeof LT.gameNow === "function"
          ? LT.gameNow()
          : new Date(2019, 9, 1));
      var age = now.getFullYear() - this.birthday.getFullYear();
      var md = now.getMonth() * 32 + now.getDate();
      var bd = this.birthday.getMonth() * 32 + this.birthday.getDate();
      if (md < bd) age -= 1;
      return age;
    }

    setAge(age, now) {
      now =
        now ||
        (typeof LT.gameNow === "function"
          ? LT.gameNow()
          : new Date(2019, 9, 1));
      var clamped = Math.max(18, Math.min(50, age));
      var month = this.birthday.getMonth();
      var date = this.birthday.getDate();
      var year = now.getFullYear() - clamped;
      var md = now.getMonth() * 32 + now.getDate();
      var bd = month * 32 + date;
      if (md < bd) year -= 1;
      this.birthday = new Date(year, month, date);
    }

    hasPersonalityTrait(id) {
      return !!this.personality[id];
    }

    togglePersonality(id) {
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
      for (var j = 0; j < exclusive.length; j++)
        delete this.personality[exclusive[j]];
      this.personality[id] = true;
    }

    she() {
      return this.isFeminine() ? "she" : "he";
    }

    her() {
      return this.isFeminine() ? "her" : "his";
    }

    getGenderColour() {
      return this.gender.colour || LT.Colour.ANDROGYNOUS;
    }
  }
  LT.GameCharacter = Character;
})();
