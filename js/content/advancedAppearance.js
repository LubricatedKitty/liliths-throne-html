(function () {
  function note() {
    return '<div class="container-full-width" style="text-align:center;"><i>All of these options can be influenced later on in the game.</i></div>';
  }

  function pill(active, act, label, colour) {
    var c = colour || "#dddddd";
    if (active) {
      return '<div class="cosmetics-button active"><span style="color:' + c + ';">' + label + "</span></div>";
    }
    return (
      '<div data-act="' +
      act +
      '" class="cosmetics-button"><span style="color:' +
      c +
      ';opacity:0.55;">' +
      label +
      "</span></div>"
    );
  }

  function pills(title, help, items, currentId, prefix, hexKey) {
    var html =
      '<div class="container-full-width" style="text-align:center;"><p style="text-align:center;margin:0;padding:0;"><b>' +
      title +
      "</b></p>";
    if (help) html += '<p style="text-align:center;">' + help + "</p>";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html += pill(currentId === it.id, prefix + it.id, it.name, it.hex || it.colour);
    }
    html += "</div>";
    return html;
  }

  function stepper(title, act, label, decOff, incOff) {
    return (
      '<div class="container-full-width" style="text-align:center;"><p style="margin:0;padding:0;"><b>' +
      title +
      "</b></p><div class=\"stepper\" style=\"margin-top:6px;\">" +
      '<div data-act="' +
      act +
      '_DEC" class="normal-button' +
      (decOff ? " disabled" : "") +
      '">−</div>' +
      '<span class="stepper-value">' +
      label +
      "</span>" +
      '<div data-act="' +
      act +
      '_INC" class="normal-button' +
      (incOff ? " disabled" : "") +
      '">+</div></div></div>'
    );
  }

  function toggle(title, help, act, on, onLabel, offLabel) {
    return (
      '<div class="container-full-width" style="text-align:center;"><p style="margin:0;padding:0;"><b>' +
      title +
      "</b></p><p>" +
      help +
      "</p>" +
      pill(on, act + "_ON", onLabel || "Yes", LT.Colour.GENERIC_GOOD) +
      pill(!on, act + "_OFF", offLabel || "No", LT.Colour.GENERIC_MINOR_BAD) +
      "</div>"
    );
  }

  function stepList(list, current, dir) {
    var i = 0;
    for (; i < list.length; i++) if (list[i] === current || list[i].id === current.id) break;
    if (i >= list.length) i = 0;
    i = Math.max(0, Math.min(list.length - 1, i + dir));
    return list[i];
  }

  function hubHtml() {
    var p = LT.game.player;
    var named =
      p.surname && p.surname.length
        ? p.getName() + " " + p.surname
        : p.getName();
    var title = p.surname
      ? (p.isFeminine() ? "Miss" : "Mr.") + " " + p.surname
      : p.isFeminine()
        ? "Miss"
        : "Sir";
    return (
      "<p><span class=\"speech\">\"It's " +
      named +
      ',"</span> you say, impatiently looking down at the man\'s clipboard as he scans through his list.</p>' +
      "<p>Finally, you see his finger trace over your name, and with a smile, he steps to one side and beckons you forwards. <span class=\"speech\">\"Have a good evening, " +
      title +
      '."</span></p>' +
      "<p>Thanking him, you hurry through the entranceway, and within moments, find yourself stepping into the museum's enormous central lobby. Large banners have been hung from the upper floor's balconies; their bold font proudly declaring this to be the 'Akkadian Empire Exhibit: Opening Evening'. On the far side of the grand hall, you see throngs of people surrounding a large stage, and you breathe a sigh of relief as you notice that it's currently empty.</p>" +
      "<p><i>Phew... I made it in time after all...</i></p>" +
      "<p>As Lily's opening speech seems to be running just as late as you are, you decide to step over to a nearby mirror to make sure that you're looking presentable...</p><br/>" +
      "<div class=\"container-full-width\"><h5 style=\"text-align:center;\">Appearance</h5>" +
      LT.describeBody(p) +
      "</div><br/><div class=\"container-full-width\" style=\"text-align:center;\"><i>You can modify your appearance by entering each of the sub-menus below.</i></div>"
    );
  }

  function coreHtml() {
    var p = LT.game.player;
    var shape = p.getBodyShape();
    return (
      note() +
      stepper("Height", "HEIGHT", p.heightCm + " cm", p.heightCm <= 140, p.heightCm >= 210) +
      pills("Skin Colour", "The colour of the skin that's covering your body.", LT.SKIN, p.skin.id, "SKIN_") +
      pills("Body Size", "How much fat your body carries.", LT.BODY_SIZE_LIST, p.bodySize.id, "SIZE_") +
      pills("Muscle", "How muscular your body is.", LT.MUSCLE_LIST, p.muscle.id, "MUSCLE_") +
      '<div class="container-full-width" style="text-align:center;">Your muscle and body size values result in your appearance being:<br/>' +
      '<b style="color:' +
      shape.colour +
      ';">' +
      shape.name.charAt(0).toUpperCase() +
      shape.name.slice(1) +
      "</b></div>"
    );
  }

  function faceHtml() {
    var p = LT.game.player;
    return (
      note() +
      pills("Lip Size", "How large your lips are.", LT.LIP_LIST, p.lipSize.id, "LIP_") +
      toggle("Puffy Lips", "Whether your lips are extra puffy.", "LIPPUFF", p.lipsPuffy, "Puffy", "Natural") +
      pills("Iris Colour", "The colour of your eye's irises.", LT.EYE, p.eye.id, "EYE_")
    );
  }

  function hairHtml() {
    var p = LT.game.player;
    var lenI = LT.hairLengthIndex(p.hairLength.id);
    var styles = [];
    for (var i = 0; i < LT.HAIR_STYLE.length; i++) {
      if (LT.HAIR_STYLE[i].minLength <= lenI) styles.push(LT.HAIR_STYLE[i]);
    }
    return (
      note() +
      pills("Hair Length", "Choose how long your hair is.", LT.HAIR_LENGTH_LIST, p.hairLength.id, "HLEN_") +
      pills("Hair Style", "Choose your hair style. Certain hair styles are unavailable at shorter hair lengths.", styles, p.hairStyle.id, "HSTYLE_") +
      pills("Hair Colour", "The colour of your hair.", LT.HAIR_COLOUR, p.hair.id, "HCOLOUR_")
    );
  }

  function breastsHtml() {
    var p = LT.game.player;
    return (
      note() +
      pills("Breast Size", "How large your breasts are.", LT.CUP_LIST, p.breastSize.id, "CUP_") +
      pills("Breast Shape", "The shape of your breasts.", LT.BREAST_SHAPE, p.breastShape.id, "BSHAPE_") +
      pills("Nipple Size", "How large your nipples are.", LT.SIZE5, p.nippleSize.id, "NIP_") +
      pills("Areolae Size", "How large your areolae are.", LT.SIZE5, p.areolaeSize.id, "ARE_") +
      toggle("Puffy Nipples", "Whether your nipples are puffy.", "NIPPUFF", p.nipplesPuffy, "Puffy", "Natural") +
      pills("Lactation", "How much milk your breasts produce.", LT.LACTATION, (p.body && p.body.breast && (p.body.breast.lactation || "ZERO_NONE")) || "ZERO_NONE", "LACT_")
    );
  }

  function assHtml() {
    var p = LT.game.player;
    return (
      note() +
      pills("Ass Size", "How large your ass is.", LT.SIZE5, p.assSize.id, "ASS_") +
      pills("Hip Size", "How wide your hips are.", LT.SIZE5, p.hipSize.id, "HIP_") +
      toggle("Bleached Anus", "Whether you've bleached around your anus.", "BLEACH", p.anusBleached, "Bleached", "Natural")
    );
  }

  function genitalsHtml() {
    var p = LT.game.player;
    if (p.hasPenis()) {
      return (
        note() +
        stepper("Penis Length", "PENIS", p.penisLength + " cm", p.penisLength <= 5, p.penisLength >= 40) +
        pills("Testicle Size", "How large your testicles are.", LT.SIZE5, p.testicleSize.id, "BALLS_") +
        pills("Cum production", "How much cum you produce.", LT.CUM_PRODUCTION, (p.body && p.body.penis && p.body.penis.testicle && (p.body.penis.testicle.cumProduction || "THREE_AVERAGE")) || "THREE_AVERAGE", "CUM_")
      );
    }
    return (
      note() +
      pills("Capacity", "How accommodating your vagina is.", LT.SIZE5, p.vaginaCapacity.id, "CAP_") +
      pills("Labia Size", "How large your labia are.", LT.SIZE5, p.labiaSize.id, "LABIA_") +
      pills("Clitoris Size", "How large your clitoris is.", LT.SIZE5, p.clitorisSize.id, "CLIT_")
    );
  }

  function ensureAppearanceExtras(p) {
    if (typeof LT.ensureCharacterSystems === "function") LT.ensureCharacterSystems(p);
    if (!p.makeup) p.makeup = {};
    (LT.MAKEUP_SLOTS || []).forEach(function (slot) {
      if (!p.makeup[slot.id]) p.makeup[slot.id] = { colour: "NONE", modifier: "MAKEUP" };
    });
    if (!p.piercings) p.piercings = {};
    (LT.PIERCING_TYPES || []).forEach(function (slot) {
      if (p.piercings[slot.id] == null) p.piercings[slot.id] = false;
    });
    if (!p.tattoos) p.tattoos = {};
    if (p.body) {
      p.body.facialHair = p.body.facialHair || "ZERO_NONE";
      p.body.pubicHair = p.body.pubicHair || "ZERO_NONE";
      p.body.underarmHair = p.body.underarmHair || "ZERO_NONE";
      p.body.assHair = p.body.assHair || "ZERO_NONE";
    }
  }

  function syncPiercingToBody(p, id, on) {
    if (!p.body) return;
    if (id === "ear") p.body.ear.pierced = on;
    else if (id === "lip") p.body.face.piercedLip = on;
    else if (id === "tongue") p.body.face.tongue.pierced = on;
    else if (id === "navel") p.body.piercedStomach = on;
    else if (id === "nose") p.body.face.piercedNose = on;
    else if (id === "nipple") p.body.breast.nipple.pierced = on;
    else if (id === "penis") p.body.penis.pierced = on;
    else if (id === "vagina") p.body.vagina.pierced = on;
  }

  function canPierce(p, slot) {
    if (slot.needs === "penis") return !!(p.hasPenis && p.hasPenis());
    if (slot.needs === "vagina") return !!(p.hasVagina && p.hasVagina());
    return true;
  }

  function tattooSlotBlocked(p, slot) {
    if (!p.body) return false;
    if (slot.needs === "horns") return !p.body.horn || p.body.horn.type === "NONE";
    if (slot.needs === "wings") return !p.body.wing || p.body.wing.type === "NONE";
    if (slot.needs === "tail") return !p.body.tail || p.body.tail.type === "NONE";
    if (slot.needs === "penis") return !(p.hasPenis && p.hasPenis());
    if (slot.needs === "vagina") return !(p.hasVagina && p.hasVagina());
    return false;
  }

  function makeupHtml() {
    var p = LT.game.player;
    ensureAppearanceExtras(p);
    var html = note();
    (LT.MAKEUP_SLOTS || []).forEach(function (slot) {
      var current = (p.makeup[slot.id] && p.makeup[slot.id].colour) || "NONE";
      html += pills(slot.name, slot.help, LT.MAKEUP_COLOURS, current, "MAKEUP_" + slot.id + "_");
    });
    return html;
  }

  function piercingsHtml() {
    var p = LT.game.player;
    ensureAppearanceExtras(p);
    var html = note();
    (LT.PIERCING_TYPES || []).forEach(function (slot) {
      var on = !!p.piercings[slot.id];
      var ok = canPierce(p, slot);
      html +=
        '<div class="container-full-width" style="text-align:center;"><p style="margin:0;padding:0;"><b>' +
        slot.name +
        " piercing</b></p><p>" +
        slot.help +
        "</p>";
      if (!ok) {
        html += '<div class="cosmetics-button disabled"><span style="opacity:0.45;">Unpierced</span></div>';
        html += '<div class="cosmetics-button disabled"><span style="opacity:0.45;">Pierced</span></div>';
      } else {
        html += pill(!on, "PIERCE_" + slot.id + "_OFF", "Unpierced");
        html += pill(on, "PIERCE_" + slot.id + "_ON", "Pierced", LT.Colour.GENERIC_ARCANE);
      }
      html += "</div>";
    });
    return html;
  }

  function tattoosHtml() {
    var p = LT.game.player;
    ensureAppearanceExtras(p);
    var html =
      '<div class="container-full-width" style="text-align:center;"><i>Later on in the game, you can get enchanted and glowing tattoos. For now, however, your tattoo choices are limited to more mundane options.</i></div>';
    (LT.TATTOO_SLOTS || []).forEach(function (slot) {
      var blocked = tattooSlotBlocked(p, slot);
      var tat = p.tattoos[slot.id];
      html +=
        '<div class="cosmetics-inner-container" style="text-align:center;"><p style="margin:0;"><b>' +
        slot.name.charAt(0).toUpperCase() +
        slot.name.slice(1) +
        "</b></p>";
      if (blocked) {
        html += '<p><i>Unavailable for your current body.</i></p>';
      } else if (tat) {
        html +=
          "<p>" +
          (tat.type && tat.type !== "NONE" ? tat.type.replace(/_/g, " ") : "writing") +
          (tat.writing ? ' "' + tat.writing + '"' : "") +
          "</p>" +
          pill(false, "TATTOO_RM_" + slot.id, "Remove", LT.Colour.GENERIC_BAD);
      } else {
        html += pill(false, "TATTOO_ADD_" + slot.id, "Add", LT.Colour.GENERIC_GOOD);
      }
      html += "</div>";
    });
    return html;
  }

  function tattooAddHtml() {
    var p = LT.game.player;
    ensureAppearanceExtras(p);
    var slotId = LT.game.flags.creationTattooSlot;
    var draft = LT.game.flags.creationTattooDraft || { type: "hearts", colour: "BLACK", writing: "" };
    var slot = LT.findById(LT.TATTOO_SLOTS, slotId) || { id: slotId, name: slotId };
    return (
      '<div class="container-full-width" style="text-align:center;"><p>Add a ' +
      slot.name +
      " tattoo.</p></div>" +
      pills("Tattoo type", "Mundane designs available during character creation.", LT.TATTOO_TYPES, draft.type, "TTYPE_") +
      pills("Primary colour", "The main colour of this tattoo.", LT.MAKEUP_COLOURS.filter(function (c) { return c.id !== "NONE"; }), draft.colour, "TCOL_") +
      '<div class="container-full-width" style="text-align:center;"><p style="margin:0;"><b>Writing</b></p><p>Optional text to write on the tattoo.</p>' +
      '<input id="tattoo-writing" type="text" value="' +
      (draft.writing || "").replace(/"/g, "&quot;") +
      '" style="max-width:320px;margin:6px;" /></div>'
    );
  }

  function bodyHairHtml() {
    var p = LT.game.player;
    ensureAppearanceExtras(p);
    var b = p.body;
    var feminine = p.isFeminine && p.isFeminine();
    var html = note();
    html += pills("Body hair colour", "This is the hair that covers all areas other than the head.", LT.HAIR_COLOUR, (b.coverings && b.coverings.BODY_HAIR && b.coverings.BODY_HAIR.primary) || "BROWN", "BHAIRCOL_");
    if (feminine) {
      html +=
        '<div class="container-full-width" style="text-align:center;"><p style="margin:0;"><b>Facial hair</b></p><p>The body hair found on your face. Feminine characters cannot grow facial hair.</p>' +
        pill(true, "FACIAL_ZERO_NONE", "none", LT.Colour.GENERIC_GOOD) +
        "</div>";
    } else {
      html += pills("Facial hair", "The body hair found on your face.", LT.BODY_HAIR, b.facialHair, "FACIAL_");
    }
    html += pills("Pubic hair", "The body hair found in the genital area; located on and around your sex organs and crotch.", LT.BODY_HAIR, b.pubicHair, "PUBIC_");
    html += pills("Underarm hair", "The body hair found in your armpits.", LT.BODY_HAIR, b.underarmHair, "UNDERARM_");
    html += pills("Ass hair", "The body hair found around your asshole.", LT.BODY_HAIR, b.assHair, "ASSHAIR_");
    return html;
  }

  function backToHub() {
    return [new LT.Response("Back", "Confirm your choices and return to the appearance menu.", "creation.advanced")];
  }

  function handleAct(act) {
    var p = LT.game.player;
    if (!p) return;
    if (act === "HEIGHT_DEC") p.heightCm = Math.max(140, p.heightCm - 1);
    else if (act === "HEIGHT_INC") p.heightCm = Math.min(210, p.heightCm + 1);
    else if (act === "PENIS_DEC") p.penisLength = Math.max(5, p.penisLength - 1);
    else if (act === "PENIS_INC") p.penisLength = Math.min(40, p.penisLength + 1);
    else if (act.indexOf("SKIN_") === 0) p.skin = LT.findById(LT.SKIN, act.slice(5));
    else if (act.indexOf("SIZE_") === 0) p.bodySize = LT.BODY_SIZE[act.slice(5)] || p.bodySize;
    else if (act.indexOf("MUSCLE_") === 0) p.muscle = LT.MUSCLE[act.slice(7)] || p.muscle;
    else if (act.indexOf("LIP_") === 0 && act.indexOf("LIPPUFF") !== 0) p.lipSize = LT.LIP[act.slice(4)] || p.lipSize;
    else if (act === "LIPPUFF_ON") p.lipsPuffy = true;
    else if (act === "LIPPUFF_OFF") p.lipsPuffy = false;
    else if (act.indexOf("EYE_") === 0) p.eye = LT.findById(LT.EYE, act.slice(4));
    else if (act.indexOf("HLEN_") === 0) {
      p.hairLength = LT.HAIR_LENGTH[act.slice(5)] || p.hairLength;
      var li = LT.hairLengthIndex(p.hairLength.id);
      if (p.hairStyle.minLength > li) p.hairStyle = LT.findById(LT.HAIR_STYLE, li === 0 ? "NONE" : "MESSY");
    } else if (act.indexOf("HSTYLE_") === 0) p.hairStyle = LT.findById(LT.HAIR_STYLE, act.slice(7));
    else if (act.indexOf("HCOLOUR_") === 0) p.hair = LT.findById(LT.HAIR_COLOUR, act.slice(8));
    else if (act.indexOf("CUP_") === 0) p.breastSize = LT.CUP[act.slice(4)] || p.breastSize;
    else if (act.indexOf("BSHAPE_") === 0) p.breastShape = LT.findById(LT.BREAST_SHAPE, act.slice(7));
    else if (act.indexOf("NIP_") === 0 && act.indexOf("NIPPUFF") !== 0) p.nippleSize = LT.findById(LT.SIZE5, act.slice(4));
    else if (act.indexOf("ARE_") === 0) p.areolaeSize = LT.findById(LT.SIZE5, act.slice(4));
    else if (act === "NIPPUFF_ON") p.nipplesPuffy = true;
    else if (act === "NIPPUFF_OFF") p.nipplesPuffy = false;
    else if (act.indexOf("ASS_") === 0) p.assSize = LT.findById(LT.SIZE5, act.slice(4));
    else if (act.indexOf("HIP_") === 0) p.hipSize = LT.findById(LT.SIZE5, act.slice(4));
    else if (act === "BLEACH_ON") p.anusBleached = true;
    else if (act === "BLEACH_OFF") p.anusBleached = false;
    else if (act.indexOf("BALLS_") === 0) p.testicleSize = LT.findById(LT.SIZE5, act.slice(6));
    else if (act.indexOf("CAP_") === 0) p.vaginaCapacity = LT.findById(LT.SIZE5, act.slice(4));
    else if (act.indexOf("LABIA_") === 0) p.labiaSize = LT.findById(LT.SIZE5, act.slice(6));
    else if (act.indexOf("CLIT_") === 0) p.clitorisSize = LT.findById(LT.SIZE5, act.slice(5));
    else if (act.indexOf("LACT_") === 0) {
      if (p.body && p.body.breast) p.body.breast.lactation = act.slice(5);
    } else if (act.indexOf("CUM_") === 0) {
      if (p.body && p.body.penis && p.body.penis.testicle) p.body.penis.testicle.cumProduction = act.slice(4);
    }
    else if (act.indexOf("MAKEUP_") === 0) {
      ensureAppearanceExtras(p);
      var rest = act.slice(7);
      var slotId = null;
      (LT.MAKEUP_SLOTS || []).forEach(function (slot) {
        if (rest.indexOf(slot.id + "_") === 0) slotId = slot.id;
      });
      if (slotId) {
        var colour = rest.slice(slotId.length + 1);
        p.makeup[slotId] = { colour: colour, modifier: "MAKEUP" };
        if (p.body && p.body.coverings) p.body.coverings[slotId] = { type: slotId, primary: colour, secondary: colour, pattern: "NONE", modifier: "MAKEUP" };
      }
    } else if (act.indexOf("PIERCE_") === 0) {
      ensureAppearanceExtras(p);
      var pierceOn = /_ON$/.test(act);
      var pierceId = act.replace(/^PIERCE_/, "").replace(/_ON$|_OFF$/, "");
      p.piercings[pierceId] = pierceOn;
      syncPiercingToBody(p, pierceId, pierceOn);
    } else if (act.indexOf("TATTOO_ADD_") === 0) {
      LT.game.flags.creationTattooSlot = act.slice(11);
      LT.game.flags.creationTattooDraft = { type: "hearts", colour: "BLACK", writing: "" };
      LT.game.setContent("creation.tattoo-add");
      return;
    } else if (act.indexOf("TATTOO_RM_") === 0) {
      ensureAppearanceExtras(p);
      delete p.tattoos[act.slice(10)];
    } else if (act.indexOf("TTYPE_") === 0) {
      LT.game.flags.creationTattooDraft = LT.game.flags.creationTattooDraft || {};
      LT.game.flags.creationTattooDraft.type = act.slice(6);
    } else if (act.indexOf("TCOL_") === 0) {
      LT.game.flags.creationTattooDraft = LT.game.flags.creationTattooDraft || {};
      LT.game.flags.creationTattooDraft.colour = act.slice(5);
    } else if (act.indexOf("FACIAL_") === 0) {
      ensureAppearanceExtras(p);
      p.body.facialHair = act.slice(7);
    } else if (act.indexOf("PUBIC_") === 0) {
      ensureAppearanceExtras(p);
      p.body.pubicHair = act.slice(6);
    } else if (act.indexOf("UNDERARM_") === 0) {
      ensureAppearanceExtras(p);
      p.body.underarmHair = act.slice(9);
    } else if (act.indexOf("ASSHAIR_") === 0) {
      ensureAppearanceExtras(p);
      p.body.assHair = act.slice(8);
    } else if (act.indexOf("BHAIRCOL_") === 0) {
      ensureAppearanceExtras(p);
      if (!p.body.coverings) p.body.coverings = {};
      p.body.coverings.BODY_HAIR = { type: "HUMAN", primary: act.slice(9), secondary: act.slice(9), pattern: "NONE", modifier: "SMOOTH" };
    } else return;
    if (typeof LT.syncBodyFromCharacter === "function") LT.syncBodyFromCharacter(p);
    if (typeof LT.syncCharacterFromBody === "function") LT.syncCharacterFromBody(p);
    LT.game.setContent(LT.game.currentNode);
  }

  LT.defineNode({
    id: "creation.advanced",
    ui: "creation-advanced",
    title: "In the Museum",
    chrome: { left: true, right: false },
    getContent: hubHtml,
    getResponses: function () {
      var p = LT.game.player;
      return [
        new LT.Response("Back", "Return to naming.", "creation.name"),
        new LT.Response(
          "Continue",
          "Your clothes are a little messy after rushing here. Tidy yourself up before proceeding to the main stage.",
          "creation.wardrobe",
        ).withTime(30),
        new LT.Response("Core", "Enter the customisation menu for all of your body's core aspects.", "creation.core"),
        new LT.Response("Face", "Enter the customisation menu for aspects related to your face.", "creation.face"),
        new LT.Response("Hair", "Enter the customisation menu for your hair.", "creation.hair"),
        new LT.Response("Breasts", "Enter the customisation menu for your breasts.", "creation.breasts"),
        new LT.Response("Ass & Hips", "Enter the customisation menu for aspects related to your ass, hips, and anus.", "creation.ass"),
        new LT.Response(
          p && p.hasPenis() ? "Penis" : "Vagina",
          "Enter the customisation menu for your genitals.",
          "creation.genitals",
        ),
        new LT.Response("Makeup", "Enter the customisation menu for makeup.", "creation.makeup"),
        new LT.Response("Piercings", "Enter the customisation menu for body piercings.", "creation.piercings"),
        new LT.Response("Tattoos", "Enter the customisation menu for tattoos.", "creation.tattoos"),
        new LT.Response("Extra hair", "Enter the customisation menu for facial, pubic, and body hair.", "creation.body-hair"),
      ];
    },
  });

  function editor(id, ui, title, htmlFn) {
    LT.defineNode({
      id: id,
      ui: ui,
      title: title,
      chrome: { left: true, right: false },
      getContent: htmlFn,
      getResponses: backToHub,
    });
  }

  editor("creation.core", "creation-core", "Core Body Appearance", coreHtml);
  editor("creation.face", "creation-face", "Face Appearance", faceHtml);
  editor("creation.hair", "creation-hair", "Hair Appearance", hairHtml);
  editor("creation.breasts", "creation-breasts", "Breasts Appearance", breastsHtml);
  editor("creation.ass", "creation-ass", "Ass Appearance", assHtml);
  LT.defineNode({
    id: "creation.genitals",
    ui: "creation-genitals",
    title: function () {
      return LT.game.player && LT.game.player.hasPenis() ? "Penis Appearance" : "Vagina Appearance";
    },
    chrome: { left: true, right: false },
    getContent: genitalsHtml,
    getResponses: backToHub,
  });

  editor("creation.makeup", "creation-makeup", "Cosmetics", makeupHtml);
  editor("creation.piercings", "creation-piercings", "Piercings", piercingsHtml);
  editor("creation.tattoos", "creation-tattoos", "Tattoos", tattoosHtml);
  editor("creation.body-hair", "creation-body-hair", "Body Hair", bodyHairHtml);

  LT.defineNode({
    id: "creation.tattoo-add",
    ui: "creation-tattoos",
    title: function () {
      var slot = LT.findById(LT.TATTOO_SLOTS, LT.game.flags && LT.game.flags.creationTattooSlot);
      return "Add " + (slot ? slot.name : "tattoo");
    },
    chrome: { left: true, right: false },
    getContent: tattooAddHtml,
    getResponses: function () {
      var draft = (LT.game.flags && LT.game.flags.creationTattooDraft) || { type: "hearts", colour: "BLACK", writing: "" };
      var apply = new LT.Response("Apply", "Add this tattoo.", "creation.tattoos", function () {
        var p = LT.game.player;
        ensureAppearanceExtras(p);
        var slotId = LT.game.flags.creationTattooSlot;
        var next = LT.game.flags.creationTattooDraft || { type: "hearts", colour: "BLACK", writing: "" };
        var input = document.getElementById("tattoo-writing");
        if (input) next.writing = String(input.value || "").trim();
        p.tattoos[slotId] = {
          type: next.type,
          name: next.type === "NONE" ? "writing" : String(next.type).replace(/_/g, " "),
          colour: next.colour,
          writing: next.writing || "",
        };
      });
      if (draft.type === "NONE" && !draft.writing) {
        apply.disable("You need to select a tattoo type or add some writing in order to make a tattoo!");
      }
      return [
        apply,
        new LT.Response("Back", "Decide not to get this tattoo and return to the main selection screen.", "creation.tattoos"),
      ];
    },
  });

  document.addEventListener("click", function (e) {
    var stage = document.getElementById("ui-stage");
    if (!stage || !stage.contains(e.target)) return;
    var btn = e.target.closest("[data-act]");
    if (!btn || btn.classList.contains("disabled")) return;
    var node = LT.game.currentNode;
    if (!node || String(node.id).indexOf("creation.") !== 0) return;
    if (node.id === "creation.appearance" || node.id === "creation.name") return;
    handleAct(btn.getAttribute("data-act"));
  });
})();
