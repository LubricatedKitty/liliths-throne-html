(function () {
  var HEIGHT_MIN = 122;
  var HEIGHT_MAX = 366;
  var PRESET_KEY = "lt-tf-presets";
  var currentId = "body.core";

  function part(id, name) {
    return { id: id, name: name || String(id).toLowerCase().replace(/_/g, "-") };
  }

  function listOf(obj) {
    if (Array.isArray(obj)) return obj;
    var keys = Object.keys(obj || {});
    var out = [];
    var i;
    for (i = 0; i < keys.length; i++) out.push(obj[keys[i]]);
    return out;
  }

  function hexOf(it) {
    return (it && (it.hex || it.colour)) || "#dddddd";
  }

  function nameOf(it) {
    if (!it) return "none";
    return it.name || String(it.id || it).toLowerCase().replace(/_/g, "-");
  }

  function idOf(v, fallback) {
    if (v == null) return fallback || "NONE";
    if (typeof v === "string") return v;
    return v.id || fallback || "NONE";
  }

  function raceId(ch) {
    if (!ch) return "HUMAN";
    var b = ch.body || {};
    var raw = b.subspeciesOverride || b.subspecies || ch.fullRace || ch.raceName || "human";
    return String(raw).toUpperCase().replace(/-/g, "_").replace(/_MORPH$/, "_MORPH");
  }

  function isSelfTransformRace(id) {
    var list = LT.SELF_TRANSFORM_RACES || [];
    var i;
    for (i = 0; i < list.length; i++) if (list[i] === id) return true;
    return false;
  }

  LT.getTrueSubspecies = function (ch) {
    return raceId(ch);
  };

  LT.isDemonTFMenu = function (ch) {
    ch = ch || LT.bodyChangingTarget || (LT.game && LT.game.player);
    if (!ch) return false;
    var b = ch.body || {};
    if (idOf(b.bodyMaterial, "FLESH") === "SLIME") return false;
    var id = raceId(ch);
    return id === "DEMON" || id === "LILIN" || id === "ELDER_LILIN" || id === "IMP" || id === "ELEMENTAL";
  };

  LT.getUnableToTransformDescription = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    if (!ch) return "You need a character first.";
    if (ch.body && ch.body.feral) {
      return "As a feral " + (ch.raceName || "creature") + ", you cannot have your body transformed!";
    }
    if (ch.doll) {
      return "Dolls cannot self-transform.";
    }
    if (!isSelfTransformRace(raceId(ch))) {
      var raceName = ((ch.getRaceName && ch.getRaceName()) || "human").toLowerCase();
      return "As " + LT.article(raceName) + " " + raceName + ", you cannot transform your body at will!";
    }
    if (LT.sex && LT.sex.active && LT.sex.selfTransformDisabled) {
      return "Although you are normally able to self-transform, you cannot do so during this sex scene!";
    }
    return "";
  };

  LT.isAbleToSelfTransform = function (ch) {
    return LT.getUnableToTransformDescription(ch) === "";
  };

  LT.hasSpinneret = function (ch) {
    ch = ch || LT.bodyChangingTarget || (LT.game && LT.game.player);
    if (!ch || !ch.body) return false;
    var tail = (ch.body.tail && ch.body.tail.type) || "NONE";
    var cfg = (ch.body.leg && ch.body.leg.configuration) || "BIPEDAL";
    return tail === "SPINNERET" || cfg === "ARACHNID";
  };

  LT.hasNipples = function (ch) {
    ch = ch || LT.bodyChangingTarget || (LT.game && LT.game.player);
    if (!ch || !ch.body || !ch.body.breast) return true;
    return ch.body.breast.type !== "NONE";
  };

  LT.hasBreastsCrotch = function (ch) {
    ch = ch || LT.bodyChangingTarget || (LT.game && LT.game.player);
    if (!ch || !ch.body || !ch.body.breastCrotch) return false;
    return ch.body.breastCrotch.type !== "NONE";
  };

  function target() {
    return LT.bodyChangingTarget || (LT.game && LT.game.player);
  }

  function bodyOf(ch) {
    ch = ch || target();
    if (!ch) return null;
    if (typeof LT.ensureBody === "function") LT.ensureBody(ch);
    return ch.body;
  }

  function ensureExtras(ch, b) {
    if (!ch || !b) return;
    if (ch.appearedAge == null && typeof ch.getAgeValue === "function") ch.appearedAge = ch.getAgeValue();
    if (ch.appearedAge == null) ch.appearedAge = 18;
    if (!b.face.mouth) b.face.mouth = LT.emptyOrifice();
    if (!b.face.tongue) b.face.tongue = { length: 0, pierced: false, modifiers: [] };
    if (!b.face.tongue.modifiers) b.face.tongue.modifiers = [];
    if (!b.ass.anus) b.ass.anus = LT.emptyOrifice();
    if (!b.ass.anus.modifiers) b.ass.anus.modifiers = [];
    if (!b.breast.orifice) b.breast.orifice = LT.emptyOrifice();
    if (!b.breast.orifice.modifiers) b.breast.orifice.modifiers = [];
    if (!b.breast.milkFlavour) b.breast.milkFlavour = "MILK";
    if (!b.breast.milkModifiers) b.breast.milkModifiers = [];
    if (b.breast.milkRegen == null) b.breast.milkRegen = 0;
    if (!b.vagina.orifice) b.vagina.orifice = LT.emptyOrifice();
    if (!b.vagina.orifice.modifiers) b.vagina.orifice.modifiers = [];
    if (!b.vagina.urethra) b.vagina.urethra = LT.emptyOrifice();
    if (!b.vagina.urethra.modifiers) b.vagina.urethra.modifiers = [];
    if (!b.vagina.modifiers) b.vagina.modifiers = [];
    if (!b.vagina.girlcumFlavour) b.vagina.girlcumFlavour = "GIRL_CUM";
    if (!b.vagina.girlcumModifiers) b.vagina.girlcumModifiers = [];
    if (b.vagina.squirter == null) b.vagina.squirter = false;
    if (b.vagina.eggLayer == null) b.vagina.eggLayer = false;
    if (!b.penis.modifiers) b.penis.modifiers = [];
    if (!b.penis.urethra) b.penis.urethra = LT.emptyOrifice();
    if (!b.penis.urethra.modifiers) b.penis.urethra.modifiers = [];
    if (!b.penis.cumFlavour) b.penis.cumFlavour = "CUM";
    if (!b.penis.cumModifiers) b.penis.cumModifiers = [];
    if (b.penis.cumExpulsion == null) b.penis.cumExpulsion = 15;
    if (!b.spinneret) b.spinneret = LT.emptyOrifice();
    if (!b.spinneret.modifiers) b.spinneret.modifiers = [];
    if (!b.coverings) b.coverings = {};
    if (!b.breastCrotch.nipple) {
      b.breastCrotch.nipple = { shape: "NORMAL", size: "TWO", countPerBreast: 1, pierced: false, puffy: false, fuckable: false };
      b.breastCrotch.areolae = { shape: "NORMAL", size: "TWO" };
      b.breastCrotch.orifice = LT.emptyOrifice();
      b.breastCrotch.milkFlavour = "MILK";
      b.breastCrotch.milkModifiers = [];
      b.breastCrotch.milkRegen = 0;
    }
    if (!b.breastCrotch.orifice) b.breastCrotch.orifice = LT.emptyOrifice();
    if (!b.breastCrotch.orifice.modifiers) b.breastCrotch.orifice.modifiers = [];
    if (!b.breastCrotch.milkFlavour) b.breastCrotch.milkFlavour = "MILK";
    if (!b.breastCrotch.milkModifiers) b.breastCrotch.milkModifiers = [];
  }

  function coreRaces() {
    return [LT.PART_TYPE.HUMAN, LT.PART_TYPE.DEMON];
  }

  function minorRaces(includeNone) {
    var list = [];
    if (includeNone !== false) list.push(LT.PART_TYPE.NONE);
    list.push(LT.PART_TYPE.HUMAN, LT.PART_TYPE.DEMON);
    return list;
  }

  function getAt(root, path) {
    var parts = path.split(".");
    var obj = root;
    var i;
    for (i = 0; i < parts.length; i++) {
      if (obj == null) return undefined;
      obj = obj[parts[i]];
    }
    return obj;
  }

  function setAt(root, path, value) {
    var parts = path.split(".");
    var obj = root;
    var i;
    for (i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] == null || typeof obj[parts[i]] !== "object") obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }

  function coveringOf(b, key, fallbackType, fallbackColour) {
    if (!b.coverings) b.coverings = {};
    if (!b.coverings[key]) {
      b.coverings[key] = {
        type: fallbackType || "HUMAN",
        primary: fallbackColour || "LIGHT",
        secondary: fallbackColour || "LIGHT",
        pattern: "NONE",
        modifier: "SMOOTH",
      };
    }
    return b.coverings[key];
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

  function box(title, help, inner, half) {
    return (
      '<div class="' +
      (half ? "cosmetics-inner-container" : "container-full-width") +
      '" style="text-align:center;"><p style="text-align:center;margin:0;padding:0;"><b>' +
      title +
      "</b></p>" +
      (help ? '<p style="text-align:center;">' + help + "</p>" : "") +
      inner +
      "</div>"
    );
  }

  function pills(title, help, items, current, actPrefix, half) {
    var html = "";
    var i;
    for (i = 0; i < items.length; i++) {
      var it = items[i];
      html += pill(current === it.id, actPrefix + it.id, nameOf(it), hexOf(it));
    }
    return box(title, help, html, half);
  }

  function toggles(title, help, items, selected, actPrefix, half) {
    var html = "";
    var i;
    for (i = 0; i < items.length; i++) {
      var it = items[i];
      var on = selected && selected.indexOf(it.id) >= 0;
      html += pill(on, actPrefix + it.id, nameOf(it), hexOf(it));
    }
    return box(title, help, html, half);
  }

  function yn(title, help, actOn, actOff, on, onLabel, offLabel, half) {
    return box(
      title,
      help,
      pill(on, actOn, onLabel || "Yes", LT.Colour.GENERIC_GOOD) +
        pill(!on, actOff, offLabel || "No", LT.Colour.GENERIC_MINOR_BAD),
      half,
    );
  }

  function stepper(title, help, path, value, min, max, unit, half) {
    var atMin = value <= min;
    var atMax = value >= max;
    var label = value + (unit || "");
    var inner =
      '<div class="stepper" style="margin-top:6px;">' +
      '<div data-act="step:' +
      path +
      ":-5:" +
      min +
      ":" +
      max +
      '" class="normal-button' +
      (value - 5 < min ? " disabled" : "") +
      '">−−</div>' +
      '<div data-act="step:' +
      path +
      ":-1:" +
      min +
      ":" +
      max +
      '" class="normal-button' +
      (atMin ? " disabled" : "") +
      '">−</div>' +
      '<span class="stepper-value">' +
      label +
      "</span>" +
      '<div data-act="step:' +
      path +
      ":1:" +
      min +
      ":" +
      max +
      '" class="normal-button' +
      (atMax ? " disabled" : "") +
      '">+</div>' +
      '<div data-act="step:' +
      path +
      ":5:" +
      min +
      ":" +
      max +
      '" class="normal-button' +
      (value + 5 > max ? " disabled" : "") +
      '">++</div></div>';
    return box(title, help, inner, half);
  }

  function row(a, b) {
    return '<div style="clear:left;">' + a + b + "</div>";
  }

  function powers() {
    return LT.isDemonTFMenu(target()) ? "demonic" : "innate";
  }

  function intro(area) {
    var ch = target();
    var demon = LT.isDemonTFMenu(ch);
    var line = demon
      ? "Focus your " + powers() + " transformative powers on changing aspects of your " + area + "."
      : "Focus your innate transformative powers on changing aspects of your " + area + ".";
    return '<div class="container-full-width" style="text-align:center;"><i>' + line + "</i></div>";
  }

  function partName(id) {
    var t = LT.PART_TYPE && LT.PART_TYPE[id];
    return t ? t.name : String(id || "none").toLowerCase().replace(/_/g, "-");
  }

  function enumById(list, id) {
    var i;
    for (i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return list[0] || { id: id, name: String(id).toLowerCase() };
  }

  function applySet(ch, b, path, value) {
    if (path === "femininity") {
      b.femininity = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
      return;
    }
    if (path === "appearedAge") {
      ch.appearedAge = Math.max(18, Math.min(50, parseInt(value, 10) || 18));
      return;
    }
    if (path.indexOf("cover.") === 0) {
      var key = path.slice(6);
      coveringOf(b, key).primary = value;
      if (key === "HUMAN" || key === "SKIN") {
        if (!b.torso.covering) b.torso.covering = coveringOf(b, "HUMAN");
        b.torso.covering.primary = value;
      }
      if (key === "HAIR") b.hair.colour = value;
      if (key === "EYE_IRISES") b.eye.iris = value;
      return;
    }
    if (path === "bodySize") {
      b.bodySize = value;
      return;
    }
    if (path === "muscle") {
      b.muscle = value;
      return;
    }
    if (path === "hair.length") {
      b.hair.length = value;
      var li = typeof LT.hairLengthIndex === "function" ? LT.hairLengthIndex(value) : 0;
      var styles = LT.HAIR_STYLE || [];
      var style = null;
      var s;
      for (s = 0; s < styles.length; s++) if (styles[s].id === b.hair.style) style = styles[s];
      if (style && style.minLength > li) b.hair.style = li === 0 ? "NONE" : "MESSY";
      return;
    }
    if (path === "penis.type") {
      b.penis.type = value;
      if (value !== "NONE" && !b.penis.length) b.penis.length = 15;
      return;
    }
    if (path === "vagina.type") {
      b.vagina.type = value;
      return;
    }
    if (path === "breastCrotch.type") {
      b.breastCrotch.type = value;
      if (value !== "NONE" && !b.breastCrotch.rows) b.breastCrotch.rows = 1;
      if (value === "NONE") b.breastCrotch.rows = 0;
      return;
    }
    if (path === "tail.type") {
      b.tail.type = value;
      if (value !== "NONE" && !b.tail.count) b.tail.count = 1;
      if (value === "NONE") b.tail.count = 0;
      return;
    }
    if (path === "wing.type") {
      b.wing.type = value;
      if (value === "NONE") b.wing.size = "ZERO_NONEXISTENT";
      else if (b.wing.size === "ZERO_NONEXISTENT") b.wing.size = "THREE_AVERAGE";
      return;
    }
    if (path === "horn.type") {
      b.horn.type = value;
      if (value !== "NONE" && !b.horn.rows) {
        b.horn.rows = 1;
        b.horn.perRow = 2;
        if (!b.horn.length) b.horn.length = 15;
      }
      if (value === "NONE") {
        b.horn.rows = 0;
        b.horn.perRow = 0;
      }
      return;
    }
    if (path === "antenna.type") {
      b.antenna.type = value;
      if (value !== "NONE" && !b.antenna.rows) {
        b.antenna.rows = 1;
        b.antenna.perRow = 2;
      }
      if (value === "NONE") {
        b.antenna.rows = 0;
        b.antenna.perRow = 0;
      }
      return;
    }
    if (path === "penis.girth" && (value === "TAPERED" || value === "FLARED")) {
      /* girth is not a modifier */
    }
    setAt(b, path, value);
  }

  function applyStep(ch, b, path, delta, min, max) {
    var cur;
    if (path === "femininity") cur = b.femininity;
    else if (path === "appearedAge") cur = ch.appearedAge == null ? 18 : ch.appearedAge;
    else if (path === "height") cur = b.height;
    else cur = getAt(b, path);
    cur = Number(cur) || 0;
    cur = Math.max(min, Math.min(max, cur + delta));
    if (path === "penis.testicle.count") {
      if (cur % 2) cur = Math.max(min, Math.min(max, cur + (delta > 0 ? 1 : -1)));
    }
    if (path === "femininity") b.femininity = cur;
    else if (path === "appearedAge") ch.appearedAge = cur;
    else if (path === "height") b.height = cur;
    else setAt(b, path, cur);
  }

  function applyToggle(ch, b, path, id) {
    if (path === "neckFluff") {
      b.hair.neckFluff = id === "ON";
      return;
    }
    if (path === "lipsPuffy") {
      b.face.lipsPuffy = id === "ON";
      return;
    }
    if (path === "squirter") {
      b.vagina.squirter = id === "ON";
      return;
    }
    if (path === "hymen") {
      b.vagina.hymen = id === "ON";
      return;
    }
    if (path === "eggLayer") {
      b.vagina.eggLayer = id === "ON";
      return;
    }
    if (path === "internalTesticles") {
      b.penis.testicle.internal = id === "ON";
      return;
    }
    if (path === "anusBleached") {
      b.ass.bleached = id === "ON";
      return;
    }
    var arr = getAt(b, path);
    if (!Array.isArray(arr)) {
      setAt(b, path, []);
      arr = getAt(b, path);
    }
    var i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else {
      if (path.indexOf("penis.modifiers") === 0) {
        if (id === "TAPERED") {
          i = arr.indexOf("FLARED");
          if (i >= 0) arr.splice(i, 1);
        }
        if (id === "FLARED") {
          i = arr.indexOf("TAPERED");
          if (i >= 0) arr.splice(i, 1);
        }
      }
      arr.push(id);
    }
  }

  function applyAct(act) {
    var ch = target();
    if (!ch || !act) return false;
    var b = bodyOf(ch);
    if (!b) return false;
    ensureExtras(ch, b);
    var bits = act.split(":");
    var kind = bits[0];
    if (kind === "set") applySet(ch, b, bits[1], bits.slice(2).join(":"));
    else if (kind === "step") applyStep(ch, b, bits[1], parseInt(bits[2], 10) || 0, parseInt(bits[3], 10), parseInt(bits[4], 10));
    else if (kind === "toggle") applyToggle(ch, b, bits[1], bits[2]);
    else if (kind === "savepreset") savePreset();
    else if (kind === "loadpreset") loadPreset(bits.slice(1).join(":"));
    else if (kind === "delpreset") deletePreset(bits.slice(1).join(":"));
    else return false;
    if (typeof LT.syncCharacterFromBody === "function") LT.syncCharacterFromBody(ch);
    return true;
  }

  LT.applyBodyChangingAct = applyAct;

  function loadPresets() {
    try {
      return JSON.parse(localStorage.getItem(PRESET_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function writePresets(map) {
    try {
      localStorage.setItem(PRESET_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function savePreset() {
    var input = document.getElementById("tf-preset-name");
    var name = input && input.value ? String(input.value).trim() : "";
    if (!name) name = "Preset";
    var ch = target();
    var map = loadPresets();
    map[name] = typeof LT.serializeBody === "function" ? LT.serializeBody(ch.body) : JSON.parse(JSON.stringify(ch.body));
    writePresets(map);
  }

  function loadPreset(name) {
    var map = loadPresets();
    var data = map[name];
    var ch = target();
    if (!data || !ch) return;
    ch.body = JSON.parse(JSON.stringify(data));
    if (typeof LT.ensureCharacterSystems === "function") LT.ensureCharacterSystems(ch);
  }

  function deletePreset(name) {
    var map = loadPresets();
    delete map[name];
    writePresets(map);
  }

  function already(title) {
    return new LT.Response(title, "You are already in this screen!", null).disable("You are already in this screen!");
  }

  function resp(index, title, tip, id) {
    var r;
    if (currentId === id) r = already(title);
    else r = new LT.Response(title, tip, id);
    r._index = index;
    return r;
  }

  function getResponses() {
    var ch = target();
    var spinneret = LT.hasSpinneret(ch);
    var nipples = LT.hasNipples(ch);
    var crotchTitle = ch && ch.body && ch.body.breastCrotch && ch.body.breastCrotch.shape === "UDDERS" ? "Udders" : "Crotch-boobs";
    var list = [
      resp(1, "Core", "Change core aspects of your body.", "body.core"),
      resp(2, "Eyes", "Change aspects of your eyes.", "body.eyes"),
      resp(3, "Hair", "Change aspects of your hair.", "body.hair"),
      resp(4, "Head", "Change aspects of your face and head.", "body.head"),
      resp(5, "Ass", "Change aspects of your ass.", "body.ass"),
    ];
    var breasts = resp(6, "Breasts", "Change aspects of your breasts.", "body.breasts");
    if (!nipples) breasts.disable("You do not have any breasts!");
    list.push(breasts);
    list.push(resp(7, "Vagina", "Change aspects of your vagina.", "body.vagina"));
    list.push(resp(8, "Penis", "Change aspects of your penis.", "body.penis"));
    var spin = resp(9, "Spinneret", "Change aspects of your spinneret.", "body.spinneret");
    if (!spinneret) spin.disable("You do not have a spinneret!<br/><i>Spinnerets are gained via certain tail or leg types.</i>");
    list.push(spin);
    list.push(resp(10, crotchTitle, "Change aspects of your crotch-boobs.", "body.crotch"));
    list.push(resp(11, "Save/Load", "Save or load transformation presets, allowing you to quickly switch your appearance.", "body.save"));
    var back = new LT.Response("Back", "Return to the previous screen.", LT.bodyChangingReturn || "phone.menu");
    back._index = 0;
    list.push(back);
    return list;
  }

  function page(id, title, htmlFn) {
    LT.defineNode({
      id: id,
      ui: "phone",
      title: title,
      chrome: { left: true, right: true },
      getHeaderContent: function () {
        currentId = id;
        var ch = target();
        var b = bodyOf(ch);
        if (!b) return "<p>No body to transform.</p>";
        ensureExtras(ch, b);
        return htmlFn(ch, b);
      },
      getContent: function () {
        return "";
      },
      getResponses: getResponses,
    });
  }

  function coreHtml(ch, b) {
    var fem = LT.femininityFromValue(b.femininity);
    var shape = LT.bodyShapeOf(
      (LT.BODY_SIZE && LT.BODY_SIZE[b.bodySize]) || ch.bodySize,
      (LT.MUSCLE && LT.MUSCLE[b.muscle]) || ch.muscle,
    );
    return (
      intro("core aspects of your body") +
      stepper("Age appearance", "Change how old you appear to be.", "appearedAge", ch.appearedAge, 18, 50, "") +
      row(
        stepper("Femininity", "Change how feminine or masculine your body is.<br/><i>This affects speech colour, clothing restrictions, and sexual attraction.</i>", "femininity", b.femininity, 0, 100, "<br/><i style='color:" + fem.colour + ";'>" + fem.name + "</i>", true),
        stepper("Height", "Change how tall you are.<br/><i>Used for some descriptions and size-difference sex scenes.</i>", "height", b.height, HEIGHT_MIN, HEIGHT_MAX, " cm", true),
      ) +
      pills("Body Size", "How much fat your body carries.", LT.BODY_SIZE_LIST, b.bodySize, "set:bodySize:") +
      pills("Muscle", "How muscular your body is.", LT.MUSCLE_LIST, b.muscle, "set:muscle:") +
      '<div class="container-full-width" style="text-align:center;">Your muscle and body size values give you the body shape: <b style="color:' +
      shape.colour +
      ';">' +
      shape.name.charAt(0).toUpperCase() +
      shape.name.slice(1) +
      "</b></div>" +
      row(
        pills("Face type", "Change the type of your face.", coreRaces(), b.face.type, "set:face.type:", true),
        pills("Body type", "Change the type of your torso.", coreRaces(), b.torso.type, "set:torso.type:", true),
      ) +
      row(
        pills("Arm type", "Change the type of your arms.", coreRaces(), b.arm.type, "set:arm.type:", true),
        pills("Leg type", "Change the type of your legs.", coreRaces(), b.leg.type, "set:leg.type:", true),
      ) +
      row(
        stepper("Arm rows", "How many pairs of arms you have.", "arm.rows", b.arm.rows || 1, 1, 3, "", true),
        pills("Foot structure", "The structure of your feet.", LT.FOOT_STRUCTURE, b.leg.footStructure, "set:leg.footStructure:", true),
      ) +
      row(
        pills("Leg configuration", "How your lower body is configured.", LT.LEG_CONFIGURATION, b.leg.configuration, "set:leg.configuration:", true),
        pills("Genital arrangement", "Where your genitals are placed.", LT.GENITAL_ARRANGEMENT, b.genitalArrangement, "set:genitalArrangement:", true),
      ) +
      row(
        pills("Tail type", "Grow, remove, or change your tail.", minorRaces(true), b.tail.type, "set:tail.type:", true),
        stepper("Tail length", "Length of your tail as a percentage of your height.", "tail.lengthPercent", b.tail.lengthPercent || 0, 0, 200, "%", true),
      ) +
      row(
        stepper("Tail count", "How many tails you have.", "tail.count", b.tail.count || 0, 0, 9, "", true),
        pills("Tail girth", "How thick your tail is.", LT.PENETRATION_GIRTH, b.tail.girth, "set:tail.girth:", true),
      ) +
      row(
        stepper("Tentacle length", "Length of your tentacles as a percentage of your height.", "tentacle.lengthPercent", b.tentacle.lengthPercent || 0, 0, 200, "%", true),
        pills("Tentacle girth", "How thick your tentacles are.", LT.PENETRATION_GIRTH, b.tentacle.girth, "set:tentacle.girth:", true),
      ) +
      row(
        pills("Wing type", "Grow, remove, or change your wings.", minorRaces(true), b.wing.type, "set:wing.type:", true),
        pills("Wing size", "How large your wings are.", LT.WING_SIZE, b.wing.size, "set:wing.size:", true),
      ) +
      pills("Skin colour", "The colour of the skin covering your body.", LT.TF_COLOURS, (b.torso.covering && b.torso.covering.primary) || "LIGHT", "set:cover.HUMAN:") +
      pills("Underarm hair", "Change the amount of hair in your underarms.", LT.BODY_HAIR, b.underarmHair, "set:underarmHair:")
    );
  }

  function eyesHtml(ch, b) {
    return (
      intro("eyes") +
      row(
        pills("Eye type", "Change the type of your eyes.", minorRaces(false), b.eye.type, "set:eye.type:", true),
        stepper("Eye pairs", "How many pairs of eyes you have.", "eye.pairs", b.eye.pairs || 1, 1, 4, "", true),
      ) +
      row(
        pills("Iris shape", "The shape of your irises.", LT.EYE_SHAPE, b.eye.irisShape, "set:eye.irisShape:", true),
        pills("Pupil shape", "The shape of your pupils.", LT.EYE_SHAPE, b.eye.pupilShape, "set:eye.pupilShape:", true),
      ) +
      pills("Iris colour", "The colour and pattern of your irises.", LT.TF_COLOURS, b.eye.iris, "set:cover.EYE_IRISES:") +
      pills("Pupil colour", "The colour and pattern of your pupils.", LT.TF_COLOURS, coveringOf(b, "EYE_PUPILS", "HUMAN", "BLACK").primary, "set:cover.EYE_PUPILS:") +
      pills("Sclerae colour", "The colour and pattern of your sclerae.", LT.TF_COLOURS, coveringOf(b, "EYE_SCLERA", "HUMAN", "WHITE").primary, "set:cover.EYE_SCLERA:")
    );
  }

  function hairHtml(ch, b) {
    var lenI = LT.hairLengthIndex(b.hair.length);
    var styles = [];
    var i;
    for (i = 0; i < LT.HAIR_STYLE.length; i++) {
      if (LT.HAIR_STYLE[i].minLength <= lenI) styles.push(LT.HAIR_STYLE[i]);
    }
    return (
      intro("hair") +
      pills("Hair type", "Change the type of your hair.", minorRaces(false), b.hair.type, "set:hair.type:") +
      row(
        pills("Hair length", "Choose how long your hair is.", LT.HAIR_LENGTH_LIST, b.hair.length, "set:hair.length:", true),
        yn("Neck fluff", "Whether you have a fluff of fur around your neck.", "toggle:neckFluff:ON", "toggle:neckFluff:OFF", !!b.hair.neckFluff, "Fluffy", "None", true),
      ) +
      pills("Hair style", "Change your hair style. Certain styles are unavailable at shorter lengths.", styles, b.hair.style, "set:hair.style:") +
      pills("Hair colour", "You can harness the power of your demonic form to change the colour of your hair.", LT.TF_COLOURS, b.hair.colour, "set:cover.HAIR:")
    );
  }

  function headHtml(ch, b) {
    var horns = b.horn.type !== "NONE";
    return (
      intro("head and face") +
      pills("Ear type", "Change the type of your ears.", minorRaces(false), b.ear.type, "set:ear.type:") +
      row(
        pills("Horn type", "Grow, remove, or change your horns.", minorRaces(true), b.horn.type, "set:horn.type:", true),
        stepper("Horn length", "How long your horns are.", "horn.length", b.horn.length || 0, 0, 50, " cm", true),
      ) +
      row(
        stepper("Horn rows", "How many rows of horns you have.", "horn.rows", b.horn.rows || 0, 0, 3, "", true),
        stepper("Horns per row", "How many horns grow in each row.", "horn.perRow", b.horn.perRow || 0, 0, 4, "", true),
      ) +
      row(
        pills("Antenna type", "Grow, remove, or change your antennae.", minorRaces(true), b.antenna.type, "set:antenna.type:", true),
        stepper("Antenna length", "How long your antennae are.", "antenna.length", b.antenna.length || 0, 0, 40, " cm", true),
      ) +
      row(
        stepper("Antenna rows", "How many rows of antennae you have.", "antenna.rows", b.antenna.rows || 0, 0, 3, "", true),
        stepper("Antennae per row", "How many antennae grow in each row.", "antenna.perRow", b.antenna.perRow || 0, 0, 4, "", true),
      ) +
      (horns
        ? pills("Horn colour", "The colour of your horns.", LT.TF_COLOURS, coveringOf(b, "HORN", "DEMON", "RED").primary, "set:cover.HORN:")
        : "") +
      pills("Lip size", "How large your lips are.", LT.LIP_LIST, b.face.lipSize, "set:face.lipSize:") +
      yn("Puffy lips", "Whether your lips are extra puffy.", "toggle:lipsPuffy:ON", "toggle:lipsPuffy:OFF", !!b.face.lipsPuffy, "Puffy", "Natural") +
      row(
        toggles("Throat modifiers", "Special qualities of your throat.", LT.ORIFICE_MODIFIER, b.face.mouth.modifiers, "toggle:face.mouth.modifiers:", true),
        pills("Throat wetness", "How wet your throat is.", LT.WETNESS, b.face.mouth.wetness, "set:face.mouth.wetness:", true),
      ) +
      row(
        pills("Throat capacity", "How accommodating your throat is.", LT.SIZE5, b.face.mouth.capacity, "set:face.mouth.capacity:", true),
        pills("Throat depth", "How deep your throat is.", LT.ORIFICE_DEPTH, b.face.mouth.depth, "set:face.mouth.depth:", true),
      ) +
      row(
        pills("Throat elasticity", "How quickly your throat stretches.", LT.ELASTICITY, b.face.mouth.elasticity, "set:face.mouth.elasticity:", true),
        pills("Throat plasticity", "How readily your throat keeps a new size.", LT.PLASTICITY, b.face.mouth.plasticity, "set:face.mouth.plasticity:", true),
      ) +
      row(
        stepper("Tongue length", "How long your tongue is.", "face.tongue.length", b.face.tongue.length || 0, 0, 80, " cm", true),
        toggles("Tongue modifiers", "Special qualities of your tongue.", LT.TONGUE_MODIFIER, b.face.tongue.modifiers, "toggle:face.tongue.modifiers:", true),
      ) +
      pills("Lip &amp; throat colour", "The natural colour of your lips and throat.", LT.TF_COLOURS, coveringOf(b, "MOUTH", "HUMAN", "ROSY").primary, "set:cover.MOUTH:") +
      pills("Tongue colour", "The colour of your tongue.", LT.TF_COLOURS, coveringOf(b, "TONGUE", "HUMAN", "ROSY").primary, "set:cover.TONGUE:") +
      pills("Beard length", "Change the length of your beard.", LT.BODY_HAIR, b.facialHair, "set:facialHair:")
    );
  }

  function assHtml(ch, b) {
    return (
      intro("ass and hips") +
      pills("Ass type", "Change the type of your ass.", minorRaces(false), b.ass.type, "set:ass.type:") +
      row(
        pills("Ass size", "How large your ass is.", LT.SIZE5, b.ass.size, "set:ass.size:", true),
        pills("Hip size", "How wide your hips are.", LT.SIZE5, b.ass.hipSize, "set:ass.hipSize:", true),
      ) +
      row(
        toggles("Anus modifiers", "Special qualities of your anus.", LT.ORIFICE_MODIFIER, b.ass.anus.modifiers, "toggle:ass.anus.modifiers:", true),
        pills("Anus wetness", "How wet your anus is.", LT.WETNESS, b.ass.anus.wetness, "set:ass.anus.wetness:", true),
      ) +
      row(
        pills("Anus capacity", "How accommodating your anus is.", LT.SIZE5, b.ass.anus.capacity, "set:ass.anus.capacity:", true),
        pills("Anus depth", "How deep your anus is.", LT.ORIFICE_DEPTH, b.ass.anus.depth, "set:ass.anus.depth:", true),
      ) +
      row(
        pills("Anus elasticity", "How quickly your anus stretches.", LT.ELASTICITY, b.ass.anus.elasticity, "set:ass.anus.elasticity:", true),
        pills("Anus plasticity", "How readily your anus keeps a new size.", LT.PLASTICITY, b.ass.anus.plasticity, "set:ass.anus.plasticity:", true),
      ) +
      pills("Anus colour", "Change the colour of your asshole.", LT.TF_COLOURS, coveringOf(b, "ANUS", "HUMAN", "ROSY").primary, "set:cover.ANUS:") +
      pills("Ass hair", "Change the amount of hair around your anus.", LT.BODY_HAIR, b.assHair, "set:assHair:")
    );
  }

  function breastsHtml(ch, b) {
    return (
      intro("breasts") +
      pills("Breast type", "Change the type of your breasts.", minorRaces(false), b.breast.type, "set:breast.type:") +
      row(
        pills("Breast size", "How large your breasts are.", LT.CUP_LIST, b.breast.size, "set:breast.size:", true),
        pills("Breast shape", "The shape of your breasts.", LT.BREAST_SHAPE, b.breast.shape, "set:breast.shape:", true),
      ) +
      row(
        stepper("Breast rows", "How many pairs of breasts you have.", "breast.rows", b.breast.rows || 1, 1, 5, "", true),
        toggles("Nipple modifiers", "Special qualities of your nipples.", LT.ORIFICE_MODIFIER, b.breast.orifice.modifiers, "toggle:breast.orifice.modifiers:", true),
      ) +
      row(
        stepper("Milk storage", "How much milk you can store.", "breast.milkStorage", b.breast.milkStorage || 0, 0, 10000, " ml", true),
        stepper("Milk regeneration", "How quickly your milk replenishes.", "breast.milkRegen", b.breast.milkRegen || 0, 0, 10000, "", true),
      ) +
      row(
        pills("Milk flavour", "The flavour of your milk.", LT.FLUID_FLAVOUR, b.breast.milkFlavour, "set:breast.milkFlavour:", true),
        toggles("Milk modifiers", "Special qualities of your milk.", LT.FLUID_MODIFIER, b.breast.milkModifiers, "toggle:breast.milkModifiers:", true),
      ) +
      row(
        stepper("Nipples per breast", "How many nipples each breast has.", "breast.nipple.countPerBreast", b.breast.nipple.countPerBreast || 1, 1, 4, "", true),
        pills("Nipple shape", "The shape of your nipples.", LT.NIPPLE_SHAPE, b.breast.nipple.shape, "set:breast.nipple.shape:", true),
      ) +
      row(
        pills("Nipple size", "How large your nipples are.", LT.SIZE5, b.breast.nipple.size, "set:breast.nipple.size:", true),
        pills("Areolae size", "How large your areolae are.", LT.SIZE5, b.breast.areolae.size, "set:breast.areolae.size:", true),
      ) +
      row(
        pills("Nipple capacity", "How accommodating your nipples are.", LT.SIZE5, b.breast.orifice.capacity, "set:breast.orifice.capacity:", true),
        pills("Nipple depth", "How deep your nipples are.", LT.ORIFICE_DEPTH, b.breast.orifice.depth, "set:breast.orifice.depth:", true),
      ) +
      row(
        pills("Nipple elasticity", "How quickly your nipples stretch.", LT.ELASTICITY, b.breast.orifice.elasticity, "set:breast.orifice.elasticity:", true),
        pills("Nipple plasticity", "How readily your nipples keep a new size.", LT.PLASTICITY, b.breast.orifice.plasticity, "set:breast.orifice.plasticity:", true),
      ) +
      pills("Nipple colour", "Change the colour of your nipples.", LT.TF_COLOURS, coveringOf(b, "NIPPLES", "HUMAN", "ROSY").primary, "set:cover.NIPPLES:") +
      pills("Milk colour", "Change the colour of your milk.", LT.TF_COLOURS, coveringOf(b, "MILK", "HUMAN", "WHITE").primary, "set:cover.MILK:")
    );
  }

  function vaginaHtml(ch, b) {
    var html = intro("vagina") + pills("Vagina type", "Grow, remove, or change your vagina.", minorRaces(true), b.vagina.type, "set:vagina.type:");
    if (b.vagina.type === "NONE") return html;
    return (
      html +
      pills("Girlcum flavour", "The flavour of your girlcum.", LT.FLUID_FLAVOUR, b.vagina.girlcumFlavour, "set:vagina.girlcumFlavour:") +
      toggles("Girlcum modifiers", "Special qualities of your girlcum.", LT.FLUID_MODIFIER, b.vagina.girlcumModifiers, "toggle:vagina.girlcumModifiers:") +
      row(
        yn("Squirter", "Whether you squirt when you orgasm.", "toggle:squirter:ON", "toggle:squirter:OFF", !!b.vagina.squirter, "Squirter", "Normal", true),
        yn("Hymen", "Whether your hymen is intact.", "toggle:hymen:ON", "toggle:hymen:OFF", b.vagina.hymen !== false, "Intact", "Broken", true),
      ) +
      row(
        pills("Labia size", "How large your labia are.", LT.SIZE5, b.vagina.labiaSize, "set:vagina.labiaSize:", true),
        yn("Egg-layer", "Whether your vagina lays eggs instead of live young.", "toggle:eggLayer:ON", "toggle:eggLayer:OFF", !!b.vagina.eggLayer, "Egg-layer", "Live young", true),
      ) +
      row(
        toggles("Vagina modifiers", "Special qualities of your vagina.", LT.ORIFICE_MODIFIER, b.vagina.orifice.modifiers, "toggle:vagina.orifice.modifiers:", true),
        pills("Wetness", "How wet your vagina is.", LT.WETNESS, b.vagina.orifice.wetness, "set:vagina.orifice.wetness:", true),
      ) +
      row(
        pills("Capacity", "How accommodating your vagina is.", LT.SIZE5, b.vagina.orifice.capacity, "set:vagina.orifice.capacity:", true),
        pills("Depth", "How deep your vagina is.", LT.ORIFICE_DEPTH, b.vagina.orifice.depth, "set:vagina.orifice.depth:", true),
      ) +
      row(
        pills("Elasticity", "How quickly your vagina stretches.", LT.ELASTICITY, b.vagina.orifice.elasticity, "set:vagina.orifice.elasticity:", true),
        pills("Plasticity", "How readily your vagina keeps a new size.", LT.PLASTICITY, b.vagina.orifice.plasticity, "set:vagina.orifice.plasticity:", true),
      ) +
      row(
        pills("Clitoris size", "How large your clitoris is.", LT.SIZE5, b.vagina.clitSize, "set:vagina.clitSize:", true),
        pills("Clitoris girth", "How thick your clitoris is.", LT.PENETRATION_GIRTH, b.vagina.clitGirth, "set:vagina.clitGirth:", true),
      ) +
      row(
        toggles("Clitoris modifiers", "Special qualities of your clitoris.", LT.PENETRATION_MODIFIER, b.vagina.modifiers, "toggle:vagina.modifiers:", true),
        toggles("Urethra modifiers", "Special qualities of your urethral opening.", LT.ORIFICE_MODIFIER, b.vagina.urethra.modifiers, "toggle:vagina.urethra.modifiers:", true),
      ) +
      row(
        pills("Urethra capacity", "How accommodating your urethra is.", LT.SIZE5, b.vagina.urethra.capacity, "set:vagina.urethra.capacity:", true),
        pills("Urethra depth", "How deep your urethra is.", LT.ORIFICE_DEPTH, b.vagina.urethra.depth, "set:vagina.urethra.depth:", true),
      ) +
      row(
        pills("Urethra elasticity", "How quickly your urethra stretches.", LT.ELASTICITY, b.vagina.urethra.elasticity, "set:vagina.urethra.elasticity:", true),
        pills("Urethra plasticity", "How readily your urethra keeps a new size.", LT.PLASTICITY, b.vagina.urethra.plasticity, "set:vagina.urethra.plasticity:", true),
      ) +
      pills("Vagina colour", "Change the colour of your vagina.", LT.TF_COLOURS, coveringOf(b, "VAGINA", "HUMAN", "ROSY").primary, "set:cover.VAGINA:") +
      pills("Girlcum colour", "Change the colour of your girlcum.", LT.TF_COLOURS, coveringOf(b, "GIRL_CUM", "HUMAN", "WHITE").primary, "set:cover.GIRL_CUM:") +
      pills("Pubic hair", "Change the amount of hair around your genitals.", LT.BODY_HAIR, b.pubicHair, "set:pubicHair:")
    );
  }

  function penisHtml(ch, b) {
    var html = intro("penis") + pills("Penis type", "Grow, remove, or change your penis.", minorRaces(true), b.penis.type, "set:penis.type:");
    if (b.penis.type === "NONE") return html;
    return (
      html +
      row(
        stepper("Penis length", "How long your penis is.", "penis.length", b.penis.length || 0, 1, 100, " cm", true),
        pills("Penis girth", "How thick your penis is.", LT.PENETRATION_GIRTH, b.penis.girth, "set:penis.girth:", true),
      ) +
      row(
        toggles("Penis modifiers", "Special qualities of your penis.", LT.PENETRATION_MODIFIER, b.penis.modifiers, "toggle:penis.modifiers:", true),
        stepper("Cum expulsion", "What percentage of stored cum is expelled at orgasm.", "penis.cumExpulsion", b.penis.cumExpulsion || 15, 5, 100, "%", true),
      ) +
      row(
        stepper("Cum storage", "How much cum you can store.", "penis.testicle.cumStorage", b.penis.testicle.cumStorage || 0, 0, 10000, " ml", true),
        stepper("Cum regeneration", "How quickly your cum replenishes.", "penis.testicle.cumStored", b.penis.testicle.cumStored || 0, 0, 10000, " ml", true),
      ) +
      row(
        pills("Cum flavour", "The flavour of your cum.", LT.FLUID_FLAVOUR, b.penis.cumFlavour, "set:penis.cumFlavour:", true),
        toggles("Cum modifiers", "Special qualities of your cum.", LT.FLUID_MODIFIER, b.penis.cumModifiers, "toggle:penis.cumModifiers:", true),
      ) +
      row(
        stepper("Testicle count", "How many testicles you have.", "penis.testicle.count", b.penis.testicle.count || 2, 2, 8, "", true),
        yn("Internal testicles", "Whether your testicles are internal.", "toggle:internalTesticles:ON", "toggle:internalTesticles:OFF", !!b.penis.testicle.internal, "Internal", "External", true),
      ) +
      row(
        pills("Testicle size", "How large your testicles are.", LT.SIZE5, b.penis.testicle.size, "set:penis.testicle.size:", true),
        toggles("Urethra modifiers", "Special qualities of your urethral opening.", LT.ORIFICE_MODIFIER, b.penis.urethra.modifiers, "toggle:penis.urethra.modifiers:", true),
      ) +
      row(
        pills("Urethra capacity", "How accommodating your urethra is.", LT.SIZE5, b.penis.urethra.capacity, "set:penis.urethra.capacity:", true),
        pills("Urethra depth", "How deep your urethra is.", LT.ORIFICE_DEPTH, b.penis.urethra.depth, "set:penis.urethra.depth:", true),
      ) +
      row(
        pills("Urethra elasticity", "How quickly your urethra stretches.", LT.ELASTICITY, b.penis.urethra.elasticity, "set:penis.urethra.elasticity:", true),
        pills("Urethra plasticity", "How readily your urethra keeps a new size.", LT.PLASTICITY, b.penis.urethra.plasticity, "set:penis.urethra.plasticity:", true),
      ) +
      pills("Penis colour", "Change the colour of your penis.", LT.TF_COLOURS, coveringOf(b, "PENIS", "HUMAN", "ROSY").primary, "set:cover.PENIS:") +
      pills("Cum colour", "Change the colour of your cum.", LT.TF_COLOURS, coveringOf(b, "CUM", "HUMAN", "WHITE").primary, "set:cover.CUM:") +
      pills("Pubic hair", "Change the amount of hair around your genitals.", LT.BODY_HAIR, b.pubicHair, "set:pubicHair:")
    );
  }

  function crotchHtml(ch, b) {
    var html = intro("crotch-boobs") + pills("Crotch-boob type", "Grow, remove, or change your crotch-boobs.", minorRaces(true), b.breastCrotch.type, "set:breastCrotch.type:");
    if (b.breastCrotch.type === "NONE") return html;
    return (
      html +
      row(
        pills("Size", "How large your crotch-boobs are.", LT.CUP_LIST, b.breastCrotch.size, "set:breastCrotch.size:", true),
        pills("Shape", "The shape of your crotch-boobs.", LT.BREAST_SHAPE, b.breastCrotch.shape, "set:breastCrotch.shape:", true),
      ) +
      row(
        stepper("Rows", "How many pairs of crotch-boobs you have.", "breastCrotch.rows", b.breastCrotch.rows || 1, 1, 5, "", true),
        toggles("Nipple modifiers", "Special qualities of your crotch-nipples.", LT.ORIFICE_MODIFIER, b.breastCrotch.orifice.modifiers, "toggle:breastCrotch.orifice.modifiers:", true),
      ) +
      row(
        stepper("Milk storage", "How much milk your crotch-boobs can store.", "breastCrotch.milkStorage", b.breastCrotch.milkStorage || 0, 0, 10000, " ml", true),
        stepper("Milk regeneration", "How quickly that milk replenishes.", "breastCrotch.milkRegen", b.breastCrotch.milkRegen || 0, 0, 10000, "", true),
      ) +
      row(
        pills("Milk flavour", "The flavour of this milk.", LT.FLUID_FLAVOUR, b.breastCrotch.milkFlavour, "set:breastCrotch.milkFlavour:", true),
        toggles("Milk modifiers", "Special qualities of this milk.", LT.FLUID_MODIFIER, b.breastCrotch.milkModifiers, "toggle:breastCrotch.milkModifiers:", true),
      ) +
      row(
        stepper("Nipples per breast", "How many nipples each crotch-boob has.", "breastCrotch.nipple.countPerBreast", b.breastCrotch.nipple.countPerBreast || 1, 1, 4, "", true),
        pills("Nipple shape", "The shape of your crotch-nipples.", LT.NIPPLE_SHAPE, b.breastCrotch.nipple.shape, "set:breastCrotch.nipple.shape:", true),
      ) +
      row(
        pills("Nipple size", "How large your crotch-nipples are.", LT.SIZE5, b.breastCrotch.nipple.size, "set:breastCrotch.nipple.size:", true),
        pills("Areolae size", "How large those areolae are.", LT.SIZE5, b.breastCrotch.areolae.size, "set:breastCrotch.areolae.size:", true),
      ) +
      row(
        pills("Nipple capacity", "How accommodating your crotch-nipples are.", LT.SIZE5, b.breastCrotch.orifice.capacity, "set:breastCrotch.orifice.capacity:", true),
        pills("Nipple depth", "How deep your crotch-nipples are.", LT.ORIFICE_DEPTH, b.breastCrotch.orifice.depth, "set:breastCrotch.orifice.depth:", true),
      ) +
      row(
        pills("Nipple elasticity", "How quickly they stretch.", LT.ELASTICITY, b.breastCrotch.orifice.elasticity, "set:breastCrotch.orifice.elasticity:", true),
        pills("Nipple plasticity", "How readily they keep a new size.", LT.PLASTICITY, b.breastCrotch.orifice.plasticity, "set:breastCrotch.orifice.plasticity:", true),
      ) +
      pills("Nipple colour", "Change the colour of your crotch-nipples.", LT.TF_COLOURS, coveringOf(b, "NIPPLES_CROTCH", "HUMAN", "ROSY").primary, "set:cover.NIPPLES_CROTCH:") +
      pills("Milk colour", "Change the colour of this milk.", LT.TF_COLOURS, coveringOf(b, "MILK", "HUMAN", "WHITE").primary, "set:cover.MILK:")
    );
  }

  function spinneretHtml(ch, b) {
    return (
      intro("spinneret") +
      row(
        toggles("Spinneret modifiers", "Special qualities of your spinneret.", LT.ORIFICE_MODIFIER, b.spinneret.modifiers, "toggle:spinneret.modifiers:", true),
        pills("Wetness", "How wet your spinneret is.", LT.WETNESS, b.spinneret.wetness, "set:spinneret.wetness:", true),
      ) +
      row(
        pills("Capacity", "How accommodating your spinneret is.", LT.SIZE5, b.spinneret.capacity, "set:spinneret.capacity:", true),
        pills("Depth", "How deep your spinneret is.", LT.ORIFICE_DEPTH, b.spinneret.depth, "set:spinneret.depth:", true),
      ) +
      row(
        pills("Elasticity", "How quickly your spinneret stretches.", LT.ELASTICITY, b.spinneret.elasticity, "set:spinneret.elasticity:", true),
        pills("Plasticity", "How readily your spinneret keeps a new size.", LT.PLASTICITY, b.spinneret.plasticity, "set:spinneret.plasticity:", true),
      ) +
      pills("Spinneret colour", "Change the colour of your spinneret.", LT.TF_COLOURS, coveringOf(b, "SPINNERET", "HUMAN", "LIGHT").primary, "set:cover.SPINNERET:")
    );
  }

  function saveHtml(ch, b) {
    var map = loadPresets();
    var names = Object.keys(map);
    var html =
      intro("saved transformations") +
      '<div class="container-full-width" style="text-align:center;"><p><b>Save transformation</b></p><p>Enter a name and save your current body as a preset.</p>' +
      '<input id="tf-preset-name" type="text" value="Demon" style="max-width:240px;margin:6px;" />' +
      '<div data-act="savepreset" class="cosmetics-button"><span style="color:' +
      LT.Colour.GENERIC_GOOD +
      ';">Save</span></div></div>';
    if (!names.length) {
      html += '<div class="container-full-width" style="text-align:center;"><i>No transformation presets saved yet.</i></div>';
      return html;
    }
    var i;
    for (i = 0; i < names.length; i++) {
      html +=
        '<div class="container-full-width" style="text-align:center;"><b>' +
        names[i] +
        '</b><br/><div data-act="loadpreset:' +
        names[i] +
        '" class="cosmetics-button"><span style="color:' +
        LT.Colour.GENERIC_GOOD +
        ';">Load</span></div>' +
        '<div data-act="delpreset:' +
        names[i] +
        '" class="cosmetics-button"><span style="color:' +
        LT.Colour.GENERIC_BAD +
        ';">Delete</span></div></div>';
    }
    return html;
  }

  page("body.core", "Core", coreHtml);
  page("body.eyes", "Eyes", eyesHtml);
  page("body.hair", "Hair", hairHtml);
  page("body.head", "Head", headHtml);
  page("body.ass", "Ass", assHtml);
  page("body.breasts", "Breasts", breastsHtml);
  page("body.vagina", "Vagina", vaginaHtml);
  page("body.penis", "Penis", penisHtml);
  page("body.crotch", function () {
    var ch = target();
    return ch && ch.body && ch.body.breastCrotch && ch.body.breastCrotch.shape === "UDDERS" ? "Udders" : "Crotch-boobs";
  }, crotchHtml);
  page("body.spinneret", "Spinneret", spinneretHtml);
  page("body.save", "Save transformation files", saveHtml);

  LT.openBodyChanging = function (ch, returnNode) {
    LT.bodyChangingTarget = ch || (LT.game && LT.game.player);
    LT.bodyChangingReturn = returnNode || "phone.menu";
    if (LT.game) LT.game.setContent("body.core");
  };

  document.addEventListener("click", function (e) {
    var stage = document.getElementById("ui-stage");
    if (!stage || !stage.contains(e.target)) return;
    var btn = e.target.closest("[data-act]");
    if (!btn || btn.classList.contains("disabled")) return;
    var node = LT.game && LT.game.currentNode;
    if (!node || String(node.id).indexOf("body.") !== 0) return;
    if (!applyAct(btn.getAttribute("data-act"))) return;
    LT.game.setContent(LT.game.currentNode);
  });
})();
