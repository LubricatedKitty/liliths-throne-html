(function () {
  if (!LT.sex) return;

  var Colour = LT.Colour || {};

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function isPlayer(ch) {
    return !!(ch && (ch.player || ch === LT.sex.player || ch === (LT.game && LT.game.player)));
  }

  function parseSex(text, src, tgt) {
    if (!text) return "";
    if (typeof LT.parse !== "function") return text;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: src, npc2: tgt, pc: LT.game && LT.game.player }, function () {
        return LT.parse(text);
      });
    }
    return LT.parse(text);
  }

  function note(kind, text) {
    if (!text) return "";
    var cls = "sex-note";
    if (kind === "virgin") cls += " sex-note-virgin";
    else if (kind === "stretch") cls += " sex-note-stretch";
    else if (kind === "lube") cls += " sex-note-lube";
    else if (kind === "xp") cls += " sex-note-xp";
    return "<p class='" + cls + "'>" + text + "</p>";
  }

  function asParagraphs(html) {
    if (!html) return "";
    if (/<p[\s>]/i.test(html)) return html;
    return "<p>" + html + "</p>";
  }

  function stripTags(s) {
    return String(s || "").replace(/<[^>]+>/g, "");
  }

  var POS_DESC = {
    Standing: "[npc.Name] is standing before you, ready to have some fun with you. You are standing in front of [npc.herHim].",
    "Face to wall": "You have [npc.name] pressed face-first against a nearby wall, standing close behind [npc.herHim].",
    "All fours": "[npc.Name] is down on all fours, with you kneeling behind [npc.herHim].",
    "Lying down": "You are lying down on your back, exposing your stomach, face, and groin. [npc.Name] is over the top of you.",
    "Sixty-nine": "You are on top of [npc.name] in a sixty-nine, your mouth hovering over [npc.her] groin.",
    "Sixty-nine (bottom)": "You are on your back beneath [npc.name] in a sixty-nine.",
    Cowgirl: "You are straddling [npc.name], sitting in [npc.her] lap.",
    "Cowgirl (bottom)": "You are on your back with [npc.name] straddling you.",
    "Sit on face": "You are sitting on [npc.namePos] face.",
    "Face sitting": "[npc.Name] is sitting on your face.",
    "Mating press": "You have [npc.name] folded beneath you in a mating press.",
    Sitting: "You are sitting down, with [npc.name] kneeling between your [pc.legs].",
    "Sitting (in lap)": "You are sitting down, with [npc.name] in your lap.",
    "Receive oral": "You are standing, with [npc.name] kneeling before you to perform oral.",
    "Perform oral": "You are kneeling before [npc.name], your face just in front of [npc.her] groin.",
    "Under desk": "You are kneeling under the desk, with your face just in front of [npc.namePos] groin.",
    "Shower sex": "You are standing in the shower, with [npc.name] pressed in behind you.",
    Stocks: "[npc.Name] is locked in the stocks.",
    "Glory hole": "A glory hole separates you from [npc.name].",
    "Milking stall": "[npc.Name] is locked in the milking stall.",
    "Over desk": "[npc.Name] is bent over the desk, and you are standing behind [npc.herHim].",
    Masturbation: "You are standing upright, ready to masturbate.",
    "Masturbation (sitting)": "You are sitting down, ready to masturbate.",
    "Masturbation (kneeling)": "You are kneeling on the floor, ready to masturbate.",
    "Masturbation (panties)": "You are kneeling on the floor, ready to masturbate with the aid of Lilaya's panties.",
    "Breeding stall": "[npc.Name] is on [npc.her] back in the breeding stall.",
    "Glory hole sex": "A glory hole separates you from [npc.name].",
    "Hand-holding": "You and [npc.name] are standing facing one another, ready to perform lewd acts with one another's hands.",
  };

  function positionBlock(label, name) {
    var partner = LT.sex.partner || LT.sex.player;
    var desc = POS_DESC[name] || "You get into position.";
    if (LT.sex.masturbation) desc = POS_DESC[name] || "You are ready to masturbate.";
    var parsed = parseSex(desc, partner, LT.sex.player);
    return (
      "<div class='sex-position-block'><b>" +
      escapeHtml(label) +
      ":</b> <b class='sex-pos-name'>" +
      escapeHtml(name || "Standing") +
      "</b><br/><i><b>" +
      parsed +
      "</b></i></div>"
    );
  }

  function hasPenis(ch) {
    if (!ch) return false;
    if (typeof ch.hasPenis === "function") return !!ch.hasPenis();
    return !!(ch.gender && ch.gender.hasPenis);
  }

  function hasVagina(ch) {
    if (!ch) return false;
    if (typeof ch.hasVagina === "function") return !!ch.hasVagina();
    return !!(ch.gender && ch.gender.hasVagina);
  }

  function exposed(ch, area) {
    return !!(typeof LT.isSexExposed === "function" && LT.isSexExposed(ch, area));
  }

  function virginBag(ch) {
    ch.sex = ch.sex || {};
    return ch.sex;
  }

  function takeFlag(ch, key) {
    var bag = virginBag(ch);
    if (bag[key] === false || ch[key] === false) return false;
    if (bag[key] === true || ch[key] === true) {
      bag[key] = false;
      ch[key] = false;
      return true;
    }
    if (bag[key] == null && ch[key] == null) return false;
    return false;
  }

  function extraForStart(src, tgt, act) {
    var bits = [];
    var pair = act && (act.pair || "");
    var oral = pair === "blowjob" || pair === "cunnilingus" || pair === "anilingus" || pair === "suckle";
    var vaginal = pair === "penis_vagina" || pair === "clit_vagina" || pair === "tail_vagina" || pair === "tentacle_vagina" || pair === "toy_vagina";
    var anal = pair === "penis_anus" || pair === "finger_anus" || pair === "tail_anus" || pair === "tentacle_anus" || pair === "toy_anus";
    var mouth = pair === "blowjob" || pair === "finger_mouth" || pair === "kiss";
    var penisOwner = null;
    var orificeOwner = null;
    if (pair === "blowjob") {
      penisOwner = act.id && /receive/.test(act.id) ? src : tgt;
      orificeOwner = penisOwner === src ? tgt : src;
    } else if (pair === "penis_vagina" || pair === "penis_anus") {
      penisOwner = act.id && /receive/.test(act.id) ? tgt : src;
      orificeOwner = penisOwner === src ? tgt : src;
    }

    if (oral && orificeOwner && takeFlag(orificeOwner, "oralVirgin")) {
      bits.push(
        note(
          "virgin",
          parseSex("[npc.Name] [npc.has] given [npc2.name] [npc2.her] first oral experience!", src === orificeOwner ? tgt : src, orificeOwner),
        ),
      );
    }
    if (vaginal && orificeOwner && takeFlag(orificeOwner, "vaginaVirgin")) {
      bits.push(note("virgin", parseSex("[npc.Name] [npc.has] taken [npc2.namePos] virginity!", penisOwner || src, orificeOwner)));
    }
    if (anal && orificeOwner && takeFlag(orificeOwner, "assVirgin")) {
      bits.push(note("virgin", parseSex("[npc.Name] [npc.has] taken [npc2.namePos] anal virginity!", penisOwner || src, orificeOwner)));
    }
    if (penisOwner && takeFlag(penisOwner, "penisVirgin")) {
      bits.push(note("virgin", parseSex("[npc.Name] [npc.has] taken [npc2.namePos] penile virginity!", orificeOwner || tgt, penisOwner)));
    }

    if (penisOwner && orificeOwner && (pair === "blowjob" || pair === "penis_vagina" || pair === "penis_anus")) {
      var len = (penisOwner.body && penisOwner.body.penis && penisOwner.body.penis.length) || penisOwner.penisLength || 15;
      var inches = Math.max(1, Math.round(len / 2.54));
      var hole = pair === "blowjob" ? "throat" : pair === "penis_anus" ? "ass" : "pussy";
      bits.push(
        note(
          "stretch",
          parseSex(
            "[npc.Name] is able to sink [npc.her] cock fully down [npc2.namePos] " +
              hole +
              " without going so deep as to cause [npc2.herHim] discomfort!",
            penisOwner,
            orificeOwner,
          ),
        ),
      );
      bits.push(
        note(
          "stretch",
          parseSex("[npc.Name] is hilting the entire " + inches + '" length of [npc.her] cock in [npc2.namePos] ' + hole + "!", penisOwner, orificeOwner),
        ),
      );
    }

    if (penisOwner && (tgt && tgt.fetishes && tgt.fetishes.FETISH_DEFLOWERING) && bits.length) {
      bits.splice(
        1,
        0,
        note("xp", parseSex("Due to [npc.namePos] deflowering fetish, [npc.she] gains 9 experience!", tgt, src)),
      );
    }
    return bits.join("");
  }

  function restyleLube(html) {
    if (!html) return "";
    return String(html).replace(
      /([^.]+ (?:is already lubricated by|is quickly lubricated by) [^.]+)\./g,
      function (m, line) {
        return note("lube", line + ".");
      },
    );
  }

  function actionTitle(src, act) {
    var title = stripTags((act && (act.name || act.id)) || "Action");
    if (title.indexOf("[") >= 0) title = stripTags(parseSex(title, src, act && act._tgt ? act._tgt : LT.sex.partner));
    if (isPlayer(src)) return "> " + title;
    return "> " + nameOf(src) + ": " + title;
  }

  function formatBlock(block) {
    var act = block.act || {};
    var header = "<p class='sex-action-title'>" + escapeHtml(actionTitle(block.src, act)) + "</p>";
    var body = restyleLube(asParagraphs(block.html || ""));
    var extra = "";
    if (act.type === "START_ONGOING") extra += extraForStart(block.src, block.tgt, act);
    if (act.type === "POSITIONING") extra += positionBlock("New position", LT.sex.positionName);
    return header + body + extra + "<hr>";
  }

  function exposedLine(ch) {
    if (!ch || isPlayer(ch)) return "";
    if (!hasPenis(ch) || !exposed(ch, "PENIS")) return "";
    if (typeof LT.revealArea === "function") LT.revealArea(ch, "PENIS");
    var bits = [];
    var bag = virginBag(ch);
    if (bag.penisVirgin !== false && ch.penisVirgin !== false) {
      bits.push(note("xp", parseSex("[npc.Name] has retained [npc.her] penile virginity!", ch, LT.sex.player)));
    }
    if (typeof LT.describeBody === "function" && ch.body) {
      /* appearance section is wrapped in headers; keep a short reveal line instead */
    }
    bits.push(asParagraphs(parseSex("[npc.Name] lets out a soft grunt as [npc.her] [npc.cock] is revealed.", ch, LT.sex.player)));
    return bits.join("");
  }

  function buildStartLog() {
    var s = LT.sex;
    var html = "";
    if (s.startText) html += asParagraphs(s.startText);
    html += positionBlock("Starting Position", s.positionName || "Standing");
    var parts = s.partners || [];
    var i;
    for (i = 0; i < parts.length; i++) html += exposedLine(parts[i]);
    var extras = s.partners || [];
    if (extras.length > 1) {
      html +=
        "<p class='muted'>Also here: " +
        extras
          .slice(1)
          .map(function (ch) {
            return nameOf(ch);
          })
          .join(", ") +
        ".</p>";
    }
    var specs = s.spectators || [];
    for (i = 0; i < specs.length; i++) {
      html += note("lube", nameOf(specs[i]) + " is watching.");
    }
    var lube = typeof s.lubeSummary === "function" ? s.lubeSummary() : "";
    if (lube) html += note("lube", lube.replace(/^Wet:\s*/, ""));
    s.logHtml = html;
    return html;
  }

  function appendTurnLog() {
    var s = LT.sex;
    if (!s) return;
    var blocks = s._turnBlocks || [];
    var i;
    var chunk = "";
    for (i = 0; i < blocks.length; i++) chunk += formatBlock(blocks[i]);
    s.logHtml = (s.logHtml || "") + chunk;
  }

  var origStart = LT.sex.start;
  LT.sex.start = function (opts) {
    var result = origStart.apply(this, arguments);
    if (this && this.active) buildStartLog();
    if (typeof LT.paintSexChrome === "function") LT.paintSexChrome();
    return result;
  };

  var origPerform = LT.sex.perform;
  LT.sex.perform = function (actionId) {
    var result = origPerform.apply(this, arguments);
    if (this && this.active) appendTurnLog();
    if (typeof LT.paintSexChrome === "function") LT.paintSexChrome();
    return result;
  };

  var origFinish = LT.sex.finish;
  LT.sex.finish = function () {
    var result = origFinish.apply(this, arguments);
    if (typeof LT.paintAttributes === "function" && LT.game && LT.game.renderAttributes) LT.paintAttributes();
    if (typeof LT.paintCharactersPresent === "function") LT.paintCharactersPresent();
    return result;
  };

  function companionIds() {
    return ((LT.game.player && LT.game.player.companions) || []).slice();
  }

  function resolveCompanion(id) {
    if (!id) return null;
    if (LT.game.npcs && LT.game.npcs[id]) return LT.game.npcs[id];
    if (typeof LT.findSlave === "function") {
      var rec = LT.findSlave(id);
      if (rec && typeof LT.slaveAsNpc === "function") return LT.slaveAsNpc(rec);
    }
    return null;
  }

  function inList(list, ch) {
    if (!list || !ch) return false;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === ch || (list[i] && ch && list[i].id && list[i].id === ch.id)) return true;
    }
    return false;
  }

  function playerIsDom() {
    return !!(LT.sex && LT.sex.isDom && LT.sex.player && LT.sex.isDom(LT.sex.player));
  }

  function sameSideAsPlayer(ch) {
    if (!ch) return false;
    if (isPlayer(ch)) return true;
    if (LT.sex.isDom) return LT.sex.isDom(ch) === playerIsDom();
    return false;
  }

  function allSexPeople() {
    var s = LT.sex;
    var list = [];
    var i;
    var parts = [].concat(s.participants || [], s.partners || [], s.spectators || []);
    for (i = 0; i < parts.length; i++) {
      if (parts[i] && !inList(list, parts[i])) list.push(parts[i]);
    }
    return list;
  }

  function playerColumn() {
    var s = LT.sex;
    var out = [s.player];
    var people = allSexPeople();
    var i;
    for (i = 0; i < people.length; i++) {
      if (isPlayer(people[i]) || !sameSideAsPlayer(people[i])) continue;
      out.push(people[i]);
    }
    var ids = companionIds();
    for (i = 0; i < ids.length; i++) {
      var ch = resolveCompanion(ids[i]);
      if (!ch || isPlayer(ch) || inList(out, ch) || inList(s.partners, ch)) continue;
      out.push(ch);
    }
    return out;
  }

  function sexPartnerColumn() {
    var out = [];
    var people = allSexPeople();
    var i;
    for (i = 0; i < people.length; i++) {
      if (isPlayer(people[i]) || sameSideAsPlayer(people[i])) continue;
      out.push(people[i]);
    }
    return out;
  }

  function columnHeader(chars, fallback, playerSide) {
    if (playerSide === true) return playerIsDom() ? "Dominant" : "Submissive";
    if (playerSide === false) return playerIsDom() ? "Submissive" : "Dominant";
    if (!chars || !chars.length) return fallback;
    var dom = LT.sex.isDom && LT.sex.isDom(chars[0]);
    return dom ? "Dominant" : "Submissive";
  }

  function renderColumn(chars, header) {
    var html = '<div class="sex-hud-header">' + escapeHtml(header) + "</div>";
    var i;
    var box = LT.characterHudBox;
    if (!box) return html;
    for (i = 0; i < chars.length; i++) {
      html += box(chars[i], isPlayer(chars[i]), { sex: true });
    }
    return html;
  }

  function bindTips(root) {
    if (typeof LT.bindDeclaredTooltips === "function") LT.bindDeclaredTooltips(root);
    var i;
    var chars = (LT.sex.participants || []).concat(playerColumn());
    for (i = 0; i < chars.length; i++) {
      if (!chars[i]) continue;
      var sid = isPlayer(chars[i]) ? "player" : String(chars[i].id || nameOf(chars[i])).replace(/[^A-Za-z0-9_-]/g, "_");
      if (typeof LT.paintStatusEffects === "function") LT.paintStatusEffects(chars[i], "status-effects-" + sid);
    }
  }

  LT.paintSexChrome = function () {
    if (!LT.sex || !LT.sex.active) return;
    var left = document.querySelector('[data-ui="attributes"]');
    var right = document.querySelector('[data-ui="characters-present"] [data-node-content]');
    var party = playerColumn();
    var partners = sexPartnerColumn();
    if (left) {
      left.hidden = false;
      left.innerHTML = renderColumn(party, columnHeader(party, "You", true));
      bindTips(left);
    }
    if (right) {
      var wrap = document.querySelector('[data-ui="characters-present"]');
      if (wrap) wrap.hidden = false;
      right.innerHTML = renderColumn(partners, columnHeader(partners, "Partners", false));
      bindTips(right);
    }
    var clock = document.getElementById("hud-clock");
    if (clock) clock.hidden = true;
    var map = document.querySelector('[data-ui="map"]');
    if (map) map.hidden = true;
  };

  var origPaintAttr = LT.paintAttributes;
  LT.paintAttributes = function () {
    if (LT.sex && LT.sex.active) {
      LT.paintSexChrome();
      return;
    }
    if (origPaintAttr) origPaintAttr();
  };

  var origPaintPresent = LT.paintCharactersPresent;
  LT.paintCharactersPresent = function () {
    if (LT.sex && LT.sex.active) {
      LT.paintSexChrome();
      return;
    }
    if (origPaintPresent) origPaintPresent();
  };

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("lt-content", function () {
      if (!(LT.sex && LT.sex.active)) return;
      var stage = document.getElementById("ui-stage");
      var text = document.querySelector('[data-ui="dialogue"] .dialogue-text');
      if (text) text.scrollTop = text.scrollHeight;
      if (stage) stage.scrollTop = stage.scrollHeight;
    });
  }

  LT.sex.positionBlock = positionBlock;
  LT.sex.buildStartLog = buildStartLog;
})();
