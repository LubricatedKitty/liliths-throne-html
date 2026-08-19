(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function cap(s) {
    s = String(s || "");
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  function article(s) {
    var plain = String(s || "").replace(/<[^>]+>/g, "");
    var det = typeof LT.article === "function" ? LT.article(plain) : /^[aeiou]/i.test(plain) ? "an" : "a";
    return det + " " + s;
  }

  function named(list, id, fallback) {
    if (!id) return fallback || "";
    if (typeof id === "object") return id.name || fallback || "";
    if (list) {
      if (list[id] && list[id].name) return list[id].name;
      if (typeof LT.findById === "function") {
        var hit = LT.findById(list, id);
        if (hit && hit.name) return hit.name;
      }
      if (Array.isArray(list)) {
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
      }
    }
    return fallback || String(id).toLowerCase().replace(/_/g, " ");
  }

  function hexOf(list, id, fallback) {
    if (id && typeof id === "object") return id.hex || id.colour || fallback || "#ddd";
    if (list) {
      if (list[id] && (list[id].hex || list[id].colour)) return list[id].hex || list[id].colour;
      if (typeof LT.findById === "function") {
        var hit = LT.findById(list, id);
        if (hit) return hit.hex || hit.colour || fallback || "#ddd";
      }
      if (Array.isArray(list)) {
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].hex || list[i].colour || fallback || "#ddd";
      }
    }
    return fallback || "#ddd";
  }

  function colourSpan(list, id, text) {
    return "<span style='color:" + hexOf(list, id, "#ddd") + ";'>" + esc(text || named(list, id)) + "</span>";
  }

  function isPlayer(ch) {
    return !!(ch && (ch.player || ch.id === "player" || (ch.isPlayer && ch.isPlayer())));
  }

  function feminine(ch) {
    if (ch.isFeminine) return !!ch.isFeminine();
    return (ch.femininityValue || 50) >= 50;
  }

  function voice(ch) {
    var you = isPlayer(ch);
    var fem = feminine(ch);
    if (you) {
      return {
        name: "You",
        Name: "You",
        she: "you",
        She: "You",
        her: "your",
        Her: "Your",
        him: "you",
        herself: "yourself",
        has: "have",
        is: "are",
        was: "were",
        doNot: "don't",
        NameIs: "You are",
        NameHas: "You have",
        SheHas: "You have",
        SheIs: "You're",
      };
    }
    return {
      name: ch.getName ? ch.getName() : ch.name || "They",
      Name: ch.getName ? ch.getName() : ch.name || "They",
      she: fem ? "she" : "he",
      She: fem ? "She" : "He",
      her: fem ? "her" : "his",
      Her: fem ? "Her" : "His",
      him: fem ? "her" : "him",
      herself: fem ? "herself" : "himself",
      has: "has",
      is: "is",
      was: "was",
      doNot: fem ? "doesn't" : "doesn't",
      NameIs: (ch.getName ? ch.getName() : ch.name || "They") + (fem ? " is" : " is"),
      NameHas: (ch.getName ? ch.getName() : ch.name || "They") + " has",
      SheHas: (fem ? "She has" : "He has"),
      SheIs: fem ? "She's" : "He's",
    };
  }

  function header(title) {
    return "<p style='padding-top:0;margin-top:0;'><span style='color:" + LT.Colour.TEXT_GREY + ";'>" + esc(title) + ":</span><br/>";
  }

  function partName(type) {
    if (!type || type === "NONE") return "";
    if (type === "HUMAN") return "human";
    return named(LT.PART_TYPE, type, String(type).toLowerCase().replace(/_/g, "-"));
  }

  function heightLabel(cm) {
    var n = Number(cm) || 170;
    if (n < 152) return { name: "very short", colour: "#c9dde8" };
    if (n < 165) return { name: "short", colour: "#9ec9dc" };
    if (n < 178) return { name: "average height", colour: "#88b8d4" };
    if (n < 191) return { name: "tall", colour: "#6fa4c4" };
    return { name: "very tall", colour: "#4f88ab" };
  }

  function heightText(cm) {
    var n = Number(cm) || 170;
    var ft = Math.floor(n / 30.48);
    var inch = Math.round((n / 2.54) % 12);
    if (inch === 12) {
      ft += 1;
      inch = 0;
    }
    var label = heightLabel(n);
    return (
      "<span style='color:" +
      label.colour +
      ";'>" +
      n +
      "cm (" +
      ft +
      "'" +
      inch +
      "\")</span>"
    );
  }

  function ageCategory(age) {
    var list = LT.AGE_CATEGORY || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (age >= list[i].min && age <= list[i].max) return list[i];
    }
    return list[list.length - 1] || { name: "adult", colour: "#ddd" };
  }

  function makeupColour(ch, slotId) {
    var rec = ch.makeup && ch.makeup[slotId];
    if (!rec || !rec.colour || rec.colour === "NONE") return "";
    return named(LT.MAKEUP_COLOURS, rec.colour, rec.colour.toLowerCase().replace(/_/g, " "));
  }

  function hairStylePhrase(styleId) {
    var map = {
      NONE: "is unstyled",
      MESSY: "is unstyled and very messy",
      LOOSE: "is left loose and unstyled",
      SLICKED_BACK: "has been slicked back",
      MOHAWK: "has been styled into a mohawk",
      AFRO: "has been styled into an afro",
      SIDECUT: "has been styled into a sidecut",
      PIXIE: "has been styled into a pixie-cut",
      BOB_CUT: "has been styled into a bob cut",
      STRAIGHT: "has been straightened and left loose",
      WAVY: "has been styled into waves and left loose",
      CURLY: "has been curled and left loose",
      PONYTAIL: "has been styled into a ponytail",
      LOW_PONYTAIL: "has been styled into a low ponytail",
      BUN: "has been styled into a bun",
      CHIGNON: "has been tied up into a chignon",
      BRAIDED: "has been woven into a long braid",
      TWIN_TAILS: "has been styled into twin tails",
      TWIN_BRAIDS: "has been woven into long twin braids",
      SIDE_BRAIDS: "has been woven into braids that hang down on either side of the face",
      CROWN_BRAID: "has been woven into a crown of braids",
      HIME_CUT: "has been straightened and styled into a hime cut",
      TOPKNOT: "has been styled into a topknot",
      DREADLOCKS: "has been styled into dreadlocks",
    };
    return map[styleId] || "has been styled";
  }

  function bodyHairPhrase(level, area) {
    var n = named(LT.BODY_HAIR, level, "none");
    if (!level || level === "ZERO_NONE") return "";
    if (level === "ONE_STUBBLE") return "a stubbly patch of " + area;
    if (level === "TWO_MANICURED") return "a small, manicured amount of " + area;
    if (level === "THREE_TRIMMED") return "a well-trimmed amount of " + area;
    if (level === "FOUR_NATURAL") return "a natural amount of " + area;
    if (level === "FIVE_UNKEMPT") return "an unkempt amount of " + area;
    if (level === "SIX_BUSHY") return "a thick, bushy amount of " + area;
    if (level === "SEVEN_WILD") return "a wild amount of " + area;
    return n + " " + area;
  }

  LT.knowsArea = function (target, area) {
    if (!target) return false;
    if (isPlayer(target)) return true;
    if (target.areasKnown && Object.prototype.hasOwnProperty.call(target.areasKnown, area)) {
      return !!target.areasKnown[area];
    }
    if (area === "PENIS" || area === "VAGINA" || area === "ANUS" || area === "NIPPLES") return false;
    return true;
  };

  LT.revealArea = function (target, area) {
    if (!target) return;
    target.areasKnown = target.areasKnown || {};
    target.areasKnown[area] = true;
  };

  function disabled(text) {
    return "<span style='color:" + LT.Colour.TEXT_GREY + ";'>" + text + "</span>";
  }

  function overview(ch, v, b) {
    var fem = ch.getFemininity ? ch.getFemininity() : LT.femininityFromValue(ch.femininityValue || 50);
    var gender = ch.getGender ? ch.getGender() : ch.gender;
    var genderName = (gender && gender.name) || "person";
    var race = ch.getRaceName ? ch.getRaceName() : ch.fullRace || ch.raceName || "human";
    var raceLower = String(race).toLowerCase();
    var human = raceLower === "human";
    var heightCm = (b && b.height) || ch.heightCm || 170;
    var html = header("Overview");
    if (isPlayer(ch)) {
      html +=
        "You are " +
        esc(ch.getName ? ch.getName() : "you") +
        ", " +
        (human
          ? article("<span style='color:" + (fem.colour || "#ddd") + ";'>" + esc(fem.name.toLowerCase()) + "</span>") +
            " " +
            esc(genderName) +
            " <span style='color:" +
            LT.Colour.RACE_HUMAN +
            ";'>human</span>. "
          : article(esc(raceLower)) + " " + esc(genderName) + ". ");
    } else if (LT.knowsArea(ch, "PENIS") && LT.knowsArea(ch, "VAGINA")) {
      html +=
        esc(v.Name) +
        " is " +
        (human
          ? article("<span style='color:" + (fem.colour || "#ddd") + ";'>" + esc(fem.name.toLowerCase()) + "</span>") +
            " " +
            esc(genderName) +
            " <span style='color:" +
            LT.Colour.RACE_HUMAN +
            ";'>human</span>. "
          : article(esc(raceLower)) + " " + esc(genderName) + ". ");
    } else {
      html += esc(v.Name) + " is " + article(esc(raceLower)) + ". ";
    }
    html += "Standing at full height, " + v.she + " " + (isPlayer(ch) ? "measure" : "measures") + " " + heightText(heightCm) + ".";
    if (!isPlayer(ch) && LT.game && LT.game.player && LT.game.player.heightCm) {
      var diff = heightCm - LT.game.player.heightCm;
      if (diff >= 25) html += " making " + v.him + " <span style='color:#4f88ab;'>significantly taller</span> than you.";
      else if (diff <= -25) html += " making " + v.him + " <span style='color:#c9dde8;'>significantly shorter</span> than you.";
    }
    if (typeof LT.hasProperty !== "function" || LT.hasProperty("ageContent")) {
      var age = ch.getAgeValue
        ? ch.getAgeValue()
        : ch.ageAppearance || (b && b.ageAppearance) || 25;
      var cat = ageCategory(age);
      html +=
        " " +
        v.She +
        " " +
        (isPlayer(ch) ? "appear" : "appears") +
        " to be in " +
        v.her +
        " <span style='color:" +
        cat.colour +
        ";'>" +
        cat.name +
        "</span>.";
    }
    if (b && b.bodyMaterial && b.bodyMaterial !== "FLESH") {
      html +=
        "</p><p>" +
        v.NameHas +
        " an entire body made out of <b style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>" +
        named(LT.BODY_MATERIAL, b.bodyMaterial) +
        "</b>!";
    }
    return html + "</p>";
  }

  function faceSection(ch, v, b) {
    var html = header("Face");
    var faceType = partName(b.face && b.face.type) || "human";
    var fem = ch.getFemininity ? ch.getFemininity() : LT.femininityFromValue(ch.femininityValue || 50);
    var skin = colourSpan(LT.SKIN, (b.torso && b.torso.covering && b.torso.covering.primary) || (ch.skin && ch.skin.id), named(LT.SKIN, (b.torso && b.torso.covering && b.torso.covering.primary) || (ch.skin && ch.skin.id), "light"));
    html +=
      v.SheHas +
      " " +
      article("<span style='color:" + (fem.colour || "#ddd") + ";'>" + esc(fem.name.toLowerCase()) + "</span>") +
      " " +
      esc(faceType) +
      " face, with " +
      skin +
      " skin.";
    var blush = makeupColour(ch, "MAKEUP_BLUSHER");
    if (blush) html += " " + v.SheIs + " wearing " + blush + " blusher.";
    var hairLen = (b.hair && b.hair.length) || (ch.hairLength && ch.hairLength.id) || "TWO_SHORT";
    var hairCol = (b.hair && b.hair.colour) || (ch.hair && ch.hair.id) || "BROWN";
    var hairStyle = (b.hair && b.hair.style) || (ch.hairStyle && ch.hairStyle.id) || "NONE";
    if (hairLen === "ZERO_BALD") {
      html += " " + v.SheHas + " no hair on " + v.her + " head, revealing the " + skin + " that covers " + v.her + " scalp.";
    } else {
      html +=
        " " +
        v.SheHas +
        " " +
        named(LT.HAIR_LENGTH_LIST, hairLen, "short") +
        ", " +
        colourSpan(LT.HAIR_COLOUR, hairCol) +
        " hair, which " +
        hairStylePhrase(hairStyle) +
        ".";
    }
    if (b.hair && b.hair.neckFluff) {
      html += " A large amount of " + colourSpan(LT.HAIR_COLOUR, hairCol) + " hair has grown around " + v.her + " neck and upper chest.";
    }
    if (b.horn && b.horn.type && b.horn.type !== "NONE") {
      html += " " + v.SheHas + " " + esc(partName(b.horn.type)) + " horns growing from " + v.her + " forehead.";
    }
    if (b.antenna && b.antenna.type && b.antenna.type !== "NONE") {
      html += " A pair of antennae sprout from " + v.her + " forehead.";
    }
    if ((ch.piercings && ch.piercings.nose) || (b.face && b.face.piercedNose)) {
      html += " " + v.Her + " nose has been pierced.";
    }
    if (LT.knowsArea(ch, "EYES")) {
      var iris = (b.eye && b.eye.iris) || (ch.eye && ch.eye.id) || "BROWN";
      var irisShape = named(LT.EYE_SHAPE, (b.eye && b.eye.irisShape) || "ROUND");
      html +=
        " " +
        v.SheHas +
        " a pair of " +
        esc(partName((b.eye && b.eye.type) || "HUMAN")) +
        " eyes, with " +
        irisShape +
        ", " +
        colourSpan(LT.EYE, iris) +
        " irises.";
      var liner = makeupColour(ch, "MAKEUP_EYE_LINER");
      if (liner) html += " Around " + v.her + " eyes, " + v.she + " " + v.has + " a layer of " + liner + " eye liner.";
      var shadow = makeupColour(ch, "MAKEUP_EYE_SHADOW");
      if (shadow) html += " " + v.SheIs + " wearing a tasteful amount of " + shadow + " eye shadow.";
    } else {
      html += " " + disabled("You haven't seen " + v.her + " eyes before, so you don't know what they look like.");
    }
    var earType = partName((b.ear && b.ear.type) || "HUMAN");
    html += " " + v.SheHas + " a pair of " + (((ch.piercings && ch.piercings.ear) || (b.ear && b.ear.pierced)) ? "pierced " : "") + esc(earType) + " ears.";
    if (typeof LT.hasProperty !== "function" || LT.hasProperty("facialHairContent")) {
      var facial = (b.facialHair || "ZERO_NONE");
      if (facial !== "ZERO_NONE") {
        html += " " + v.SheHas + " " + bodyHairPhrase(facial, "facial hair") + " growing on " + v.her + " face.";
      } else if (!feminine(ch)) {
        html += " " + v.She + " " + v.doNot + " have any trace of facial hair.";
      }
    }
    return html + "</p>";
  }

  function mouthSection(ch, v, b) {
    var html = header("Mouth");
    var lips = named(LT.LIP_LIST, (b.face && b.face.lipSize) || (ch.lipSize && ch.lipSize.id), "average-sized");
    var lipstick = makeupColour(ch, "MAKEUP_LIPSTICK");
    html +=
      v.SheHas +
      " " +
      lips +
      ((b.face && b.face.lipsPuffy) || ch.lipsPuffy ? ", puffy" : "") +
      " lips" +
      (lipstick ? ", painted " + lipstick : "") +
      ".";
    if ((ch.piercings && ch.piercings.lip) || (b.face && b.face.piercedLip)) html += " " + v.Her + " lips have been pierced.";
    if ((ch.piercings && ch.piercings.tongue) || (b.face && b.face.tongue && b.face.tongue.pierced)) {
      html += " " + v.Her + " tongue has been pierced.";
    }
    var mouth = b.face && b.face.mouth;
    if (mouth) {
      html +=
        " " +
        v.Her +
        " throat is " +
        named(LT.CAPACITY, mouth.capacity, named(LT.SIZE5, mouth.capacity, "average")) +
        " and " +
        named(LT.WETNESS, mouth.wetness, "moist") +
        ".";
      if (mouth.modifiers && mouth.modifiers.indexOf("PUFFY") >= 0) {
        html += " " + v.Her + " lips have swollen up to be far puffier than what would be considered normal.";
      }
      if (mouth.modifiers && mouth.modifiers.indexOf("RIBBED") >= 0) {
        html += " The inside of " + v.her + " throat is lined with sensitive, fleshy ribs.";
      }
      if (mouth.modifiers && mouth.modifiers.indexOf("TENTACLED") >= 0) {
        html += " " + v.Her + " throat is filled with tiny little tentacles, which wriggle and squirm with a mind of their own.";
      }
      if (mouth.modifiers && mouth.modifiers.indexOf("MUSCLE_CONTROL") >= 0) {
        html += " " + v.SheHas + " a series of internal muscles lining the inside of " + v.her + " throat.";
      }
    }
    return html + "</p>";
  }

  function torsoSection(ch, v, b) {
    var html = header("Torso");
    var size = ch.bodySize || (LT.BODY_SIZE && LT.BODY_SIZE[b.bodySize]);
    var muscle = ch.muscle || (LT.MUSCLE && LT.MUSCLE[b.muscle]);
    var shape = typeof LT.bodyShapeOf === "function" ? LT.bodyShapeOf(size, muscle) : { name: "average", colour: "#88b8d4" };
    var torsoType = partName((b.torso && b.torso.type) || "HUMAN");
    var skin = colourSpan(LT.SKIN, (b.torso && b.torso.covering && b.torso.covering.primary) || (ch.skin && ch.skin.id));
    html +=
      v.Her +
      " torso is " +
      article(esc(torsoType)) +
      " in form, and is covered in " +
      skin +
      " skin. " +
      v.SheHas +
      " a " +
      colourSpan(LT.BODY_SIZE_LIST, size && size.id, named(LT.BODY_SIZE_LIST, size && size.id, "average")) +
      ", " +
      colourSpan(LT.MUSCLE_LIST, muscle && muscle.id, named(LT.MUSCLE_LIST, muscle && muscle.id, "toned")) +
      " body, giving " +
      v.him +
      " <span style='color:" +
      shape.colour +
      ";'>" +
      article(shape.name) +
      "</span> body shape.";
    if (typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(ch)) {
      var stage = LT.hasStatusEffect && LT.hasStatusEffect(ch, "PREGNANT_3")
        ? "massively swollen, and it's blatantly obvious that <span style='color:" + LT.Colour.GENERIC_ARCANE + ";'>" + v.she + " " + v.is + " expecting to give birth very soon</span>"
        : LT.hasStatusEffect && LT.hasStatusEffect(ch, "PREGNANT_2")
          ? "heavily swollen, and it's clear that <span style='color:" + LT.Colour.GENERIC_ARCANE + ";'>" + v.she + " " + v.is + " pregnant</span>"
          : "slightly swollen, and it's clear to anyone who takes a closer look that <span style='color:" + LT.Colour.GENERIC_ARCANE + ";'>" + v.she + " " + v.is + " pregnant</span>";
      html += " " + v.Her + " belly is " + stage + ".";
    }
    return html + "</p>";
  }

  function chestSection(ch, v, b) {
    var html = header("Chest");
    var cup = (b.breast && b.breast.size) || (ch.breastSize && ch.breastSize.id) || "FLAT";
    var shape = named(LT.BREAST_SHAPE, (b.breast && b.breast.shape) || (ch.breastShape && ch.breastShape.id), "round");
    var rows = (b.breast && b.breast.rows) || 1;
    if (cup === "FLAT") {
      html += v.SheHas + " a completely flat chest, with " + (rows === 1 ? "a single pair of pecs" : rows + " pairs of pecs") + ".";
    } else {
      var cupName = named(LT.CUP_LIST, cup, cup);
      html +=
        v.SheHas +
        " " +
        (rows === 1 ? "one pair" : rows + " pairs") +
        " of " +
        shape +
        " breasts, which fit comfortably into " +
        article(cupName) +
        " bra.";
      if (rows > 1) html += " The pairs below " + v.her + " top pair are slightly smaller.";
    }
    if (!LT.knowsArea(ch, "NIPPLES")) {
      html += " " + disabled("You've never seen " + v.her + " naked chest, so you don't know what " + v.her + " nipples look like.");
    } else {
      var nipSize = named(LT.SIZE5, (b.breast && b.breast.nipple && b.breast.nipple.size) || (ch.nippleSize && ch.nippleSize.id), "average-sized");
      var nipShape = named(LT.NIPPLE_SHAPE, (b.breast && b.breast.nipple && b.breast.nipple.shape) || "NORMAL");
      var areSize = named(LT.SIZE5, (b.breast && b.breast.areolae && b.breast.areolae.size) || (ch.areolaeSize && ch.areolaeSize.id), "average-sized");
      var areShape = named(LT.AREOLAE_SHAPE, (b.breast && b.breast.areolae && b.breast.areolae.shape) || "NORMAL");
      html +=
        " On each of " +
        v.her +
        " " +
        (cup === "FLAT" ? "pecs" : shape + " breasts") +
        ", " +
        v.she +
        " " +
        v.has +
        " " +
        nipSize +
        (nipShape !== "normal" ? ", " + nipShape : "") +
        " nipples, with " +
        areSize +
        ", " +
        areShape +
        " areolae.";
      if ((b.breast && b.breast.nipple && b.breast.nipple.puffy) || ch.nipplesPuffy) {
        html += " They are puffy.";
      }
      if ((ch.piercings && ch.piercings.nipple) || (b.breast && b.breast.nipple && b.breast.nipple.pierced)) {
        html += " They have been pierced.";
      }
      if (b.breast && b.breast.nipple && b.breast.nipple.fuckable) {
        html += " " + v.Her + " nipples are fuckable, with internal channels.";
      }
      var milk = (b.breast && (b.breast.lactation || b.breast.milkStorage)) || 0;
      if (milk && milk !== "ZERO_NONE" && milk !== 0) {
        html += " " + v.She + " " + v.is + " lactating " + named(LT.LACTATION, milk, "a small amount") + " of milk.";
      }
    }
    return html + "</p>";
  }

  function crotchSection(ch, v, b) {
    var crotch = b.breastCrotch;
    if (!crotch || crotch.type === "NONE" || !crotch.rows) return "";
    var title = crotch.shape === "UDDERS" ? "Udders" : "Crotch-boobs";
    if (!LT.knowsArea(ch, "BREASTS_CROTCH")) {
      return header(title) + disabled("You haven't seen " + v.her + " exposed stomach before, so you don't know if " + v.she + " " + v.has + " any crotch-boobs or udders.") + "</p>";
    }
    return (
      header(title) +
      v.SheHas +
      " " +
      named(LT.CUP_LIST, crotch.size, "flat") +
      " " +
      named(LT.BREAST_SHAPE, crotch.shape, "round") +
      " crotch-boobs." +
      "</p>"
    );
  }

  function armsSection(ch, v, b) {
    var html = header("Arms");
    var rows = (b.arm && b.arm.rows) || 1;
    var type = partName((b.arm && b.arm.type) || "HUMAN");
    html +=
      v.SheHas +
      " " +
      (rows === 1 ? "a pair" : rows + " pairs") +
      " of " +
      esc(type) +
      " arms.";
    var nails = makeupColour(ch, "MAKEUP_NAIL_POLISH_HANDS");
    if (nails) html += " " + v.Her + " fingernails have been painted " + nails + ".";
    if (typeof LT.hasProperty !== "function" || LT.hasProperty("bodyHairContent")) {
      var under = b.underarmHair || (b.arm && b.arm.underarmHair) || "ZERO_NONE";
      if (under === "ZERO_NONE") html += " There is no trace of any hair in " + v.her + " armpits.";
      else html += " " + v.SheHas + " " + bodyHairPhrase(under, "underarm hair") + " in " + v.her + " armpits.";
    }
    return html + "</p>";
  }

  function legsSection(ch, v, b) {
    var html = header("Legs");
    var type = partName((b.leg && b.leg.type) || "HUMAN");
    var config = named(LT.LEG_CONFIGURATION, (b.leg && b.leg.configuration) || "BIPEDAL");
    var feet = named(LT.FOOT_STRUCTURE, (b.leg && b.leg.footStructure) || "PLANTIGRADE");
    html +=
      v.SheHas +
      " a pair of " +
      esc(type) +
      " legs, in a " +
      esc(config) +
      " configuration, ending in " +
      esc(feet) +
      " feet.";
    var toes = makeupColour(ch, "MAKEUP_NAIL_POLISH_FEET");
    if (toes) html += " " + v.Her + " toenails have been painted " + toes + ".";
    return html + "</p>";
  }

  function extrasSection(ch, v, b) {
    var html = "";
    if (b.wing && b.wing.type && b.wing.type !== "NONE") {
      html +=
        header("Wings") +
        v.SheHas +
        " a pair of " +
        named(LT.WING_SIZE, b.wing.size, "average") +
        " " +
        esc(partName(b.wing.type)) +
        " wings." +
        "</p>";
    }
    if (b.tail && b.tail.type && b.tail.type !== "NONE") {
      html +=
        header("Tail") +
        v.SheHas +
        " " +
        ((b.tail.count || 1) > 1 ? b.tail.count + " " : "a ") +
        named(LT.PENETRATION_GIRTH, b.tail.girth, "average") +
        " " +
        esc(partName(b.tail.type)) +
        ((b.tail.count || 1) > 1 ? " tails" : " tail") +
        "." +
        "</p>";
    }
    if (b.tentacle && b.tentacle.type && b.tentacle.type !== "NONE") {
      html += header("Tentacle-legs") + v.SheHas + " tentacles in place of " + v.her + " lower body.</p>";
    }
    if (b.genitalArrangement && b.genitalArrangement !== "NORMAL") {
      html +=
        header("Cloaca") +
        "<i>" +
        v.Her +
        " genitals and asshole are located within " +
        v.her +
        " " +
        named(LT.GENITAL_ARRANGEMENT, b.genitalArrangement) +
        ".</i></p>";
    }
    return html;
  }

  function assSection(ch, v, b) {
    var html = header("Ass");
    var ass = named(LT.SIZE5, (b.ass && b.ass.size) || (ch.assSize && ch.assSize.id), "average-sized");
    var hips = named(LT.SIZE5, (b.ass && b.ass.hipSize) || (ch.hipSize && ch.hipSize.id), "average-sized");
    html += v.Her + " " + hips + " hips and " + ass + " ass are covered in the same skin as the rest of " + v.her + " body.";
    if (!LT.knowsArea(ch, "ANUS")) {
      html += " " + disabled("You haven't seen " + v.her + " naked ass before, so you don't know what " + v.her + " asshole looks like.");
    } else {
      var anus = b.ass && b.ass.anus;
      html +=
        " " +
        v.Her +
        " asshole" +
        ((b.ass && b.ass.bleached) || ch.anusBleached
          ? " has been bleached so that the rim is no darker than the skin around it"
          : ", the rim being slightly darker than the skin around it") +
        ".";
      if (anus) {
        html +=
          " It is " +
          named(LT.CAPACITY, anus.capacity, named(LT.SIZE5, anus.capacity, "tight")) +
          " and " +
          named(LT.WETNESS, anus.wetness, "dry") +
          ".";
      }
      if (typeof LT.hasProperty !== "function" || LT.hasProperty("assHairContent")) {
        var ah = b.assHair || "ZERO_NONE";
        if (ah !== "ZERO_NONE") html += " " + v.SheHas + " " + bodyHairPhrase(ah, "ass hair") + " around " + v.her + " asshole.";
      }
    }
    return html + "</p>";
  }

  function penisSection(ch, v, b) {
    var has = (b.penis && b.penis.type && b.penis.type !== "NONE") || (ch.hasPenis && ch.hasPenis());
    if (LT.knowsArea(ch, "PENIS")) {
      if (!has) return "";
      var html = header("Penis");
      var len = (b.penis && b.penis.length) || ch.penisLength || 15;
      var girth = named(LT.PENETRATION_GIRTH, (b.penis && b.penis.girth) || "THREE_AVERAGE");
      var type = partName((b.penis && b.penis.type) || "HUMAN");
      html +=
        v.SheHas +
        " " +
        article(girth) +
        ", " +
        len +
        "-cm " +
        esc(type) +
        " cock.";
      var balls = named(LT.SIZE5, (b.penis && b.penis.testicle && b.penis.testicle.size) || (ch.testicleSize && ch.testicleSize.id), "average-sized");
      var count = (b.penis && b.penis.testicle && b.penis.testicle.count) || 2;
      html +=
        " " +
        ((b.penis && b.penis.testicle && b.penis.testicle.internal) ? v.Her + " testicles are internal." : v.SheHas + " " + count + " " + balls + " testicles.");
      var cum = b.penis && b.penis.testicle && (b.penis.testicle.cumProduction || b.penis.testicle.cumStorage);
      if (cum && cum !== "ZERO_NONE" && cum !== 0) {
        html += " " + v.She + " " + v.is + " capable of producing " + named(LT.CUM_PRODUCTION, cum, "an average amount") + " of cum.";
      }
      if ((ch.piercings && ch.piercings.penis) || (b.penis && b.penis.pierced)) html += " It has been pierced.";
      var mods = (b.penis && b.penis.modifiers) || [];
      if (mods.indexOf("KNOTTED") >= 0) html += " A fat knot sits at the base.";
      if (mods.indexOf("RIBBED") >= 0) html += " It's lined with hard, fleshy ribs.";
      if (mods.indexOf("SHEATHED") >= 0) html += " When not in use, it retreats back into the sheath at its base.";
      if (mods.indexOf("BARBED") >= 0) html += " Fleshy, backwards-facing barbs line its length.";
      if (mods.indexOf("FLARED") >= 0) html += " The head is wide and flared.";
      if (mods.indexOf("TAPERED") >= 0) html += " The shaft is tapered, and gets thinner nearer to the head.";
      if (mods.indexOf("PREHENSILE") >= 0) html += " It is prehensile, and can be manipulated and moved much like a primate's tail.";
      if (typeof LT.hasProperty !== "function" || LT.hasProperty("pubicHairContent")) {
        var ph = b.pubicHair || "ZERO_NONE";
        if (ph !== "ZERO_NONE") html += " " + v.SheHas + " " + bodyHairPhrase(ph, "pubic hair") + ".";
      }
      return html + "</p>";
    }
    return header("Penis") + disabled("You haven't seen " + v.her + " naked groin before, so you don't know what " + v.her + " cock looks like, or even if " + v.she + " " + v.has + " one.") + "</p>";
  }

  function vaginaSection(ch, v, b) {
    var has = (b.vagina && b.vagina.type && b.vagina.type !== "NONE") || (ch.hasVagina && ch.hasVagina());
    if (LT.knowsArea(ch, "VAGINA")) {
      if (!has) {
        if (LT.knowsArea(ch, "PENIS") && !((b.penis && b.penis.type && b.penis.type !== "NONE") || (ch.hasPenis && ch.hasPenis()))) {
          return header("Genitals") + v.SheHas + " a smooth, featureless mound.</p>";
        }
        return "";
      }
      var html = header("Vagina");
      var type = partName((b.vagina && b.vagina.type) || "HUMAN");
      var labia = named(LT.SIZE5, (b.vagina && b.vagina.labiaSize) || (ch.labiaSize && ch.labiaSize.id), "average-sized");
      var clit = named(LT.SIZE5, (b.vagina && b.vagina.clitSize) || (ch.clitorisSize && ch.clitorisSize.id), "tiny");
      var orifice = b.vagina && b.vagina.orifice;
      html +=
        v.SheHas +
        " " +
        article(esc(type)) +
        " pussy, with " +
        labia +
        " labia and " +
        article(clit) +
        " clit.";
      if (orifice) {
        html +=
          " It is " +
          named(LT.CAPACITY, orifice.capacity, named(LT.SIZE5, orifice.capacity, "tight")) +
          " and " +
          named(LT.WETNESS, orifice.wetness, "moist") +
          ".";
      }
      if (b.vagina && b.vagina.hymen) html += " " + v.Her + " hymen is intact.";
      if ((ch.piercings && ch.piercings.vagina) || (b.vagina && b.vagina.pierced)) html += " It has been pierced.";
      if (typeof LT.hasProperty !== "function" || LT.hasProperty("pubicHairContent")) {
        var ph = b.pubicHair || "ZERO_NONE";
        if (ph !== "ZERO_NONE" && !((b.penis && b.penis.type && b.penis.type !== "NONE") || (ch.hasPenis && ch.hasPenis()))) {
          html += " " + v.SheHas + " " + bodyHairPhrase(ph, "pubic hair") + ".";
        }
      }
      return html + "</p>";
    }
    return header("Vagina") + disabled("You haven't seen " + v.her + " naked groin before, so you don't know what " + v.her + " pussy looks like, or even if " + v.she + " " + v.has + " one.") + "</p>";
  }

  function tattooSection(ch, v) {
    var tats = ch.tattoos || {};
    var keys = Object.keys(tats).filter(function (k) { return tats[k]; });
    if (!keys.length) return "";
    var html = header("Tattoos");
    var i;
    for (i = 0; i < keys.length; i++) {
      var t = tats[keys[i]];
      var slot = named(LT.TATTOO_SLOTS, keys[i], keys[i].toLowerCase().replace(/_/g, " "));
      if (i) html += "<br/>";
      html +=
        "<span style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>" +
        cap(slot) +
        ":</span> " +
        esc(t.name || t.type || "a tattoo") +
        (t.writing ? ", bearing the words: '" + esc(t.writing) + "'" : "") +
        ".";
    }
    return html + "</p>";
  }

  function pregnancySection(ch, v) {
    if (isPlayer(ch)) return "";
    if (typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(ch)) {
      return header("Pregnancy") + v.SheIs + " visibly pregnant.</p>";
    }
    return "";
  }

  LT.getBodyDescription = function (ch) {
    if (!ch) return "";
    if (typeof LT.ensureAppearance === "function") LT.ensureAppearance(ch);
    else if (typeof LT.ensureCharacterSystems === "function") LT.ensureCharacterSystems(ch);
    var v = voice(ch);
    if (ch.raceConcealed) {
      return (
        header("Overview") +
        esc(v.Name) +
        " is wrapped in a concealing cloak. As " +
        v.her +
        " body is mostly concealed, you can't tell what " +
        v.she +
        " really looks like." +
        "</p>"
      );
    }
    var b = ch.body || {};
    return (
      overview(ch, v, b) +
      faceSection(ch, v, b) +
      mouthSection(ch, v, b) +
      torsoSection(ch, v, b) +
      chestSection(ch, v, b) +
      crotchSection(ch, v, b) +
      armsSection(ch, v, b) +
      legsSection(ch, v, b) +
      extrasSection(ch, v, b) +
      assSection(ch, v, b) +
      penisSection(ch, v, b) +
      vaginaSection(ch, v, b) +
      tattooSection(ch, v) +
      pregnancySection(ch, v)
    );
  };

  function birthdayString(ch) {
    if (!ch.birthday) return "";
    var d = ch.birthday;
    var months = LT.MONTHS || ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var n = d.getDate();
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    var ord = n + (s[(v - 20) % 10] || s[v] || s[0]);
    return ord + " of " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function personalityHtml(ch) {
    var html = "<h6>Personality</h6><p>";
    var traits = [];
    var src = ch.personality || {};
    Object.keys(src).forEach(function (id) {
      if (!src[id]) return;
      var t = null;
      for (var i = 0; i < (LT.PERSONALITY || []).length; i++) if (LT.PERSONALITY[i].id === id) t = LT.PERSONALITY[i];
      traits.push(t || { id: id, name: id.toLowerCase(), colour: "#ddd" });
    });
    if (!traits.length) {
      html += (isPlayer(ch) ? "You have" : voice(ch).NameHas) + " a well-rounded personality, with no exceptionally good nor bad traits.";
    } else {
      traits.forEach(function (t, i) {
        if (i) html += "<br/>";
        html += "<b style='color:" + (t.colour || "#ddd") + ";'>" + cap(t.name) + "</b>";
      });
    }
    if (ch.orientation) {
      html +=
        "</p><p>" +
        (isPlayer(ch) ? "You are" : voice(ch).NameIs) +
        " <span style='color:" +
        (ch.orientation.colour || "#ddd") +
        ";'>" +
        esc(ch.orientation.name || "ambiphilic") +
        "</span>.";
    }
    return html + "</p>";
  }

  function relationshipHtml(ch) {
    if (isPlayer(ch)) return "";
    var v = voice(ch);
    var html = "<h6>Relationships</h6><p>";
    if (ch.relationToPlayer) html += cap(String(ch.relationToPlayer)) + ".<br/>";
    var aff = 0;
    if (typeof ch.getAffection === "function") aff = ch.getAffection();
    else if (typeof ch.affection === "number") aff = ch.affection;
    else if (ch.affection && typeof ch.affection.player === "number") aff = ch.affection.player;
    var affName = aff >= 80 ? "adores" : aff >= 50 ? "likes" : aff >= 20 ? "is friendly towards" : aff <= -50 ? "dislikes" : aff <= -80 ? "hates" : "is neutral towards";
    html += v.Name + " " + affName + " you.";
    if (ch.owner === "player" || ch.slaveOwner === "player") html += "<br/>" + v.SheIs + " a <span style='color:" + LT.Colour.GENERIC_ARCANE + ";'>slave</span>, owned by you.";
    return html + "</p>";
  }

  function clothingHtml(ch) {
    var slots = ch.equipped || {};
    var keys = Object.keys(slots).filter(function (k) { return slots[k]; });
    var html = "<h6>Clothing</h6><p>";
    if (!keys.length) {
      html += (isPlayer(ch) ? "You are" : voice(ch).NameIs) + " not wearing any clothing.";
    } else {
      keys.forEach(function (slot, i) {
        var item = slots[slot];
        var name = item.name || item.id || slot;
        if (i) html += "<br/>";
        html += "<b>" + cap(slot) + ":</b> " + esc(name);
      });
    }
    return html + "</p>";
  }

  function fetishHtml(ch) {
    var fet = ch.fetishes || {};
    var keys = Object.keys(fet).filter(function (k) { return fet[k]; });
    if (!keys.length) return "";
    var html = "<h6>Fetishes</h6><p>";
    keys.forEach(function (k, i) {
      if (i) html += ", ";
      html += esc(String(k).toLowerCase().replace(/_/g, " "));
    });
    return html + "</p>";
  }

  function statsHtml(ch) {
    var phys = typeof LT.effectivePhysique === "function" ? LT.effectivePhysique(ch) : ch.physique || 10;
    var arc = typeof LT.effectiveArcane === "function" ? LT.effectiveArcane(ch) : ch.arcane || 10;
    var cor = typeof LT.effectiveCorruption === "function" ? LT.effectiveCorruption(ch) : ch.corruption || 0;
    return (
      "<div class='container-full-width'><details><summary class='quest-title'>Stats</summary>" +
      "<p>Level " +
      (ch.level || 1) +
      " · Health " +
      Math.round(ch.health || 0) +
      "/" +
      Math.round(ch.maxHealth || 0) +
      " · Aura " +
      Math.round(ch.mana || 0) +
      "/" +
      Math.round(ch.maxMana || 0) +
      "</p><p><span style='color:" +
      LT.Colour.ATTRIBUTE_PHYSIQUE +
      ";'>Physique</span> " +
      phys +
      " · <span style='color:" +
      LT.Colour.ATTRIBUTE_ARCANE +
      ";'>Arcane</span> " +
      arc +
      " · <span style='color:" +
      LT.Colour.ATTRIBUTE_CORRUPTION +
      ";'>Corruption</span> " +
      cor +
      "</p></details></div>"
    );
  }

  LT.getCharacterInformationScreen = function (ch, opts) {
    opts = opts || {};
    if (!ch) return "<p>Nobody is here.</p>";
    if (typeof LT.ensureAppearance === "function") LT.ensureAppearance(ch);
    else if (typeof LT.ensureCharacterSystems === "function") LT.ensureCharacterSystems(ch);
    var v = voice(ch);
    var name = ch.getFullName ? ch.getFullName() : v.Name;
    var html = "<div class='char-info-block'>";
    var portraitId = ch.id || (isPlayer(ch) ? "player" : "");
    if (typeof LT.artworkHtml === "function") html += LT.artworkHtml(portraitId);
    else if (typeof LT.portraitHtml === "function") html += LT.portraitHtml(portraitId, "char-portrait");
    html +=
      "<h6><span class='char-info-name' data-tip-char='" +
      esc(portraitId) +
      "'>" +
      esc(name) +
      "</span></h6><p>";
    if (ch.occupation && ch.occupation.name) html += cap(ch.occupation.name) + ". ";
    var born = birthdayString(ch);
    if (born) {
      html += (isPlayer(ch) ? "You were" : v.She + " " + v.was) + " created on the " + born;
      var age = ch.getAgeValue ? ch.getAgeValue() : ch.ageAppearance;
      if (age) {
        var cat = ageCategory(age);
        html +=
          ", and " +
          v.is +
          " considered to be <span style='color:" +
          cat.colour +
          ";'>" +
          article(cat.name.replace(/s$/, "") + (cat.id === "TEENS_LATE" ? "" : "").trim() || cat.name) +
          "</span>.";
      } else html += ".";
    }
    html += "</p>";
    html += relationshipHtml(ch);
    html += personalityHtml(ch);
    html += "<h6>Appearance</h6>" + LT.getBodyDescription(ch);
    html += statsHtml(ch);
    if (opts.perkTree !== false) {
      html +=
        "<div class='container-full-width'><details><summary class='quest-title'>Perk tree</summary>" +
        "<p class='muted'>Perk assignment is handled from combat and level-up. This character's current perks: " +
        ((ch.perks && ch.perks.length) ? ch.perks.join(", ") : "none yet") +
        ".</p></details></div>";
    }
    html += fetishHtml(ch);
    html += clothingHtml(ch);
    html += "</div>";
    return html;
  };

  var oldDescribe = LT.describeBody;
  LT.describeBody = function (p) {
    if (typeof LT.getBodyDescription === "function") return LT.getBodyDescription(p);
    return oldDescribe ? oldDescribe(p) : "";
  };
})();
