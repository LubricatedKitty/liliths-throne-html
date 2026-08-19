(function () {
  function pct(value, max, fallback) {
    if (value == null || !max) return fallback;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatNumber(n) {
    n = Math.floor(Number(n) || 0);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function nameOf(ch) {
    if (!ch) return "Unknown";
    if (ch.getName) return ch.getName();
    return ch.name || "Unknown";
  }

  function raceOf(ch) {
    if (!ch) return "human";
    if (ch.getRaceName) return ch.getRaceName();
    return ch.fullRace || ch.raceName || "human";
  }

  function nameColourOf(ch) {
    var Colour = LT.Colour;
    var fem = ch && ch.getFemininityValue ? ch.getFemininityValue() : ch && ch.femininityValue;
    if (fem == null && ch && ch.isFeminine) fem = ch.isFeminine() ? 70 : 30;
    if (fem == null) fem = 50;
    if (fem < 40) return Colour.MASCULINE;
    if (fem > 60) return Colour.FEMININE;
    return Colour.ANDROGYNOUS;
  }

  function statValue(ch, key) {
    if (!ch) return 0;
    if (key === "physique") return typeof LT.effectivePhysique === "function" ? LT.effectivePhysique(ch) : ch.physique || 0;
    if (key === "arcane") return typeof LT.effectiveArcane === "function" ? LT.effectiveArcane(ch) : ch.arcane || 0;
    if (key === "corruption") return typeof LT.effectiveCorruption === "function" ? LT.effectiveCorruption(ch) : ch.corruption || 0;
    return ch[key] || 0;
  }

  function tooltipBox(title, colour, body) {
    return (
      '<div class="tip-title" style="color:' +
      colour +
      ';">' +
      title +
      '</div><div class="tip-body">' +
      body +
      "</div>"
    );
  }

  function barTooltip(label, colour, current, max, desc) {
    return tooltipBox(
      label,
      colour,
      "<b>" +
        formatNumber(current) +
        "</b> / " +
        formatNumber(max) +
        "<br/>" +
        desc,
    );
  }

  function statTooltip(label, colour, value, desc, extra) {
    return tooltipBox(
      label,
      colour,
      "<div class='tip-thirds'><span>Core<br/><b>" +
        formatNumber(value) +
        "</b></span><span>Bonus<br/><span style='color:" +
        LT.Colour.TEXT_GREY +
        ";'>0</span></span><span>Total<br/><b style='color:" +
        colour +
        ";'>" +
        formatNumber(value) +
        "</b></span></div>" +
        desc +
        (extra ? "<br/><i>" + extra + "</i>" : ""),
    );
  }

  function bar(label, percent, colour, icon, current, max, tip) {
    return (
      '<div class="resource-row" data-tip-html="' +
      escapeHtml(tip) +
      '">' +
      '<div class="resource-icon"><img src="' +
      icon +
      '" alt=""></div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' +
      percent +
      "%;background:" +
      colour +
      ';"></div></div></div>'
    );
  }

  function statIcon(label, value, colour, icon, tip) {
    return (
      '<div class="stat-icon" data-tip-html="' +
      escapeHtml(tip) +
      '"><img src="' +
      icon +
      '" alt="' +
      escapeHtml(label) +
      '"></div>'
    );
  }

  function resolvePartyMember(id) {
    if (!id || id === "player") return LT.game && LT.game.player;
    if (LT.game.npcs && LT.game.npcs[id]) return LT.game.npcs[id];
    if (typeof LT.findSlave === "function") {
      var rec = LT.findSlave(id);
      if (rec && typeof LT.slaveAsNpc === "function") return LT.slaveAsNpc(rec);
    }
    return null;
  }

  function partyMembers() {
    var list = [];
    if (LT.game && LT.game.player) list.push(LT.game.player);
    var ids = (LT.game.player && LT.game.player.companions) || [];
    var i;
    for (i = 0; i < ids.length; i++) {
      var ch = resolvePartyMember(ids[i]);
      if (ch && ch !== LT.game.player) list.push(ch);
    }
    return list;
  }

  function prettySlot(id) {
    if (!id) return "";
    return String(id)
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function hudPortrait(id) {
    if (typeof LT.hasProperty === "function" && !LT.hasProperty("hudCharacterImages")) return "";
    if (typeof LT.portraitHtml !== "function") return "";
    var img = LT.portraitHtml(id, "char-portrait-hud");
    return img ? '<div class="hud-portrait-wrap">' + img + "</div>" : "";
  }

  function characterBox(ch, isPlayer, opts) {
    opts = opts || {};
    var Colour = LT.Colour;
    var id = isPlayer ? "player" : String(ch.id || nameOf(ch)).replace(/[^A-Za-z0-9_-]/g, "_");
    var name = nameOf(ch);
    var sexMode = !!opts.sex;
    var level = ch.level || 1;
    var race = raceOf(ch);
    var hp = pct(ch.health, ch.maxHealth, 100);
    var aura = pct(ch.mana, ch.maxMana, 100);
    var xpNeed = ch.experienceForLevel || 10;
    var xp = pct(ch.experience, xpNeed, 0);
    var health = ch.health != null ? Math.round(ch.health) : 0;
    var maxHealth = ch.maxHealth != null ? Math.round(ch.maxHealth) : 0;
    var mana = ch.mana != null ? Math.round(ch.mana) : 0;
    var maxMana = ch.maxMana != null ? Math.round(ch.maxMana) : 0;
    var exp = ch.experience != null ? Math.round(ch.experience) : 0;
    var physique = statValue(ch, "physique");
    var arcane = statValue(ch, "arcane");
    var corruption = statValue(ch, "corruption");
    var arousal = ch.arousal || 0;
    var lust = ch.lust || 0;
    var who = isPlayer ? "you currently are" : name + " currently is";
    var moneyLine = "";
    if (isPlayer) {
      moneyLine =
        '<div class="hud-funds">' +
        '<span class="hud-money" data-tip-html="' +
        escapeHtml(
          tooltipBox(
            "Flames",
            Colour.MONEY,
            "The currency of Dominion.<br/>You currently have <b style='color:" +
              Colour.MONEY +
              ";'>£" +
              formatNumber(ch.money || 0) +
              "</b>.",
          ),
        ) +
        '" style="color:' +
        Colour.MONEY +
        ';">£' +
        formatNumber(ch.money || 0) +
        "</span>" +
        '<span class="hud-essence" data-tip-html="' +
        escapeHtml(
          tooltipBox(
            "Arcane essences",
            Colour.GENERIC_ARCANE,
            "Crystallised arcane energy used to fire enchanted weapons and enchant items.<br/>You currently have <b style='color:" +
              Colour.GENERIC_ARCANE +
              ";'>" +
              formatNumber(ch.essences || 0) +
              "</b>.",
          ),
        ) +
        '"><img src="' +
        LT.uiIcon("manaIcon.svg") +
        '" alt="">' +
        formatNumber(ch.essences || 0) +
        "</span></div>";
    }
    var pace = "";
    var slotLine = "";
    var sexBars = "";
    if (sexMode && LT.sex) {
      if (typeof LT.isDevMode === "function" && LT.isDevMode()) {
        if (typeof LT.sex.paceName === "function") pace = " - " + LT.sex.paceName(ch);
        var slotName = typeof LT.sex.slotOf === "function" ? LT.sex.slotOf(ch) : "";
        if (slotName) slotLine = '<p class="sex-hud-slot">' + escapeHtml(prettySlot(slotName)) + "</p>";
      }
      var aMax = LT.MAX_AROUSAL || 100;
      var lMax = LT.MAX_LUST || 100;
      var aNow = Math.round(ch.arousal || 0);
      var lNow = Math.round(ch.lust || 0);
      sexBars =
        '<div class="sex-hud-bars">' +
        '<div class="sex-hud-bar-row"><div class="resource-icon"><img src="' +
        LT.uiIcon("arousalIcon.svg") +
        '" alt=""></div><div class="bar-track"><div class="bar-fill" style="width:' +
        pct(aNow, aMax, 0) +
        "%;background:" +
        Colour.ATTRIBUTE_AROUSAL +
        ';"></div></div><span class="sex-hud-bar-num">' +
        aNow +
        "</span></div>" +
        '<div class="sex-hud-bar-row"><div class="resource-icon"><img src="' +
        LT.uiIcon("arousalIcon.svg") +
        '" alt=""></div><div class="bar-track"><div class="bar-fill" style="width:' +
        pct(lNow, lMax, 0) +
        "%;background:" +
        Colour.ATTRIBUTE_LUST +
        ';"></div></div><span class="sex-hud-bar-num">' +
        lNow +
        "</span></div></div>";
    }
    var targeted = sexMode && LT.sex && LT.sex.partner === ch && !isPlayer;
    return (
      '<div class="attribute-container hud-char-box' +
      (targeted ? " sex-target" : "") +
      '">' +
      '<div class="hud-name-row">' +
      '<p class="character-name" style="color:' +
      nameColourOf(ch) +
      ';" data-tip-char="' +
      escapeHtml(id) +
      '">' +
      escapeHtml(name) +
      escapeHtml(pace) +
      "</p>" +
      '<p class="character-sub" data-tip-html="' +
      escapeHtml(
        tooltipBox(
          "Level " + level,
          Colour.ATTRIBUTE_EXPERIENCE,
          escapeHtml(race) +
            "<br/>Experience: <b>" +
            formatNumber(exp) +
            "</b> / " +
            formatNumber(xpNeed) +
            ".",
        ),
      ) +
      '">Level ' +
      level +
      " " +
      escapeHtml(race) +
      "</p></div>" +
      slotLine +
      sexBars +
      moneyLine +
      bar(
        "Health",
        hp,
        Colour.ATTRIBUTE_HEALTH,
        LT.uiIcon("healthIcon.svg"),
        health,
        maxHealth,
        barTooltip(
          "Health",
          Colour.ATTRIBUTE_HEALTH,
          health,
          maxHealth,
          "The amount of stamina and determination " +
            (isPlayer ? "you have" : name + " has") +
            ". Defeat in combat if this reaches 0.<br/>Extra health is added from:<br/><b>10 + (5×level) + (2×Physique) + Bonus Energy</b>",
        ),
      ) +
      bar(
        "Aura",
        aura,
        Colour.ATTRIBUTE_MANA,
        LT.uiIcon("manaIcon.svg"),
        mana,
        maxMana,
        barTooltip(
          "Aura",
          Colour.ATTRIBUTE_MANA,
          mana,
          maxMana,
          "A measure of the amount of arcane energy " +
            (isPlayer ? "you have" : name + " has") +
            " in " +
            (isPlayer ? "your" : "their") +
            " aura.<br/>Extra aura is added from:<br/><b>5 + (2×level) + (5×Arcane) + Bonus Aura</b>",
        ),
      ) +
      bar(
        "Experience",
        xp,
        Colour.ATTRIBUTE_EXPERIENCE,
        LT.uiIcon("experienceIcon.svg"),
        exp,
        xpNeed,
        barTooltip("Experience", Colour.ATTRIBUTE_EXPERIENCE, exp, xpNeed, "How much progress has been made to the next level."),
      ) +
      '<div class="attr-row">' +
      statIcon(
        "Physique",
        physique,
        Colour.ATTRIBUTE_PHYSIQUE,
        LT.uiIcon("strengthIcon.svg"),
        statTooltip(
          "Physique",
          Colour.ATTRIBUTE_PHYSIQUE,
          physique,
          "A measure of how physically healthy " +
            (isPlayer ? "you are" : name + " is") +
            ". Physique <b style='color:" +
            Colour.GENERIC_GOOD +
            ";'>passively increases</b> maximum <b style='color:" +
            Colour.ATTRIBUTE_HEALTH +
            ";'>health</b>.",
          "<b>+2</b> <b style='color:" + Colour.ATTRIBUTE_HEALTH + ";'>Energy</b> per 1 physique",
        ),
      ) +
      statIcon(
        "Arcane",
        arcane,
        Colour.ATTRIBUTE_ARCANE,
        LT.uiIcon("intelligenceIcon.svg"),
        statTooltip(
          "Arcane",
          Colour.ATTRIBUTE_ARCANE,
          arcane,
          "A measure of affinity with the arcane. This <b style='color:" +
            Colour.GENERIC_GOOD +
            ";'>passively increases</b> maximum <b style='color:" +
            Colour.ATTRIBUTE_MANA +
            ";'>aura</b>.",
          "<b>+2</b> <b style='color:" + Colour.ATTRIBUTE_MANA + ";'>Aura</b> per 1 arcane",
        ),
      ) +
      statIcon(
        "Corruption",
        corruption,
        Colour.ATTRIBUTE_CORRUPTION,
        LT.uiIcon("corruptionIcon.svg"),
        statTooltip(
          "Corruption",
          Colour.ATTRIBUTE_CORRUPTION,
          corruption,
          isPlayer
            ? "Corruption is a measure of your perversion and depravity, and affects <b style='color:" +
                Colour.ATTRIBUTE_CORRUPTION +
                ";'>which sex actions you are comfortable performing</b>."
            : "Corruption is a measure of " + name + "'s perversion and depravity. It does <i>not</i> reflect how good or evil they are.",
          "<b>-0.5</b> arousal resistance and <b>+0.5</b> arousal damage per 1 corruption",
        ),
      ) +
      statIcon(
        "Arousal",
        arousal,
        Colour.ATTRIBUTE_AROUSAL,
        LT.uiIcon("arousalIcon.svg"),
        statTooltip(
          "Arousal",
          Colour.ATTRIBUTE_AROUSAL,
          arousal,
          isPlayer ? "How aroused you currently are. You will orgasm when your arousal maxes out." : "How aroused " + name + " is. They will orgasm when their arousal maxes out.",
        ),
      ) +
      statIcon(
        "Lust",
        lust,
        Colour.ATTRIBUTE_LUST,
        LT.uiIcon("arousalIcon.svg"),
        statTooltip(
          "Lust",
          Colour.ATTRIBUTE_LUST,
          lust,
          isPlayer
            ? "How desperate for sexual contact you are. Your lust will move towards your resting lust value over time.<br/><b>Resting Lust = (Corruption/2) + Bonuses</b>"
            : "How desperate for sexual contact " + name + " is.",
        ),
      ) +
      "</div>" +
      '<div class="attribute-container-inner effects" id="status-effects-' +
      escapeHtml(id) +
      '"></div>' +
      hudPortrait(id) +
      "</div>"
    );
  }

  function clockHtml() {
    var Colour = LT.Colour;
    var date = typeof LT.formatGameDate === "function" ? LT.formatGameDate() : "Monday, 1st January 2019";
    var time = (LT.game && LT.game.clock) || "00:00";
    var hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    var dayPart = hour < 6 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
    return (
      '<div class="clock-box">' +
      '<div class="clock-line" data-tip-html="' +
      escapeHtml(tooltipBox("Date", Colour.BASE_YELLOW_LIGHT, "The current date in this world.<br/><b>" + date + "</b>")) +
      '"><img src="' +
      LT.uiIcon("calendar.svg") +
      '" alt=""><span id="game-date">' +
      date +
      "</span></div>" +
      '<div class="clock-line" data-tip-html="' +
      escapeHtml(tooltipBox("Time", Colour.GENERIC_EXCELLENT, "The current time of day.<br/><b>" + time + "</b> (" + dayPart + ").")) +
      '"><img src="' +
      LT.uiIcon("stopwatch.svg") +
      '" alt=""><span id="game-time">' +
      time +
      "</span></div></div>"
    );
  }

  function bindTips(root) {
    if (typeof LT.bindDeclaredTooltips === "function") LT.bindDeclaredTooltips(root);
  }

  LT.characterHudBox = function (ch, isPlayer, opts) {
    return characterBox(ch, isPlayer, opts);
  };
  LT.partyMembersForHud = partyMembers;

  LT.paintAttributes = function () {
    var root = document.querySelector('[data-ui="attributes"]');
    if (!root) return;
    var party = partyMembers();
    var html = "";
    var i;
    for (i = 0; i < party.length; i++) {
      html += characterBox(party[i], party[i] === LT.game.player || i === 0);
    }
    root.innerHTML = html;
    bindTips(root);
    for (i = 0; i < party.length; i++) {
      var ch = party[i];
      var sid = ch === LT.game.player || i === 0 ? "player" : ch.id || nameOf(ch);
      if (typeof LT.paintStatusEffects === "function") LT.paintStatusEffects(ch, "status-effects-" + sid);
    }
    var clock = document.getElementById("hud-clock");
    if (clock) {
      clock.hidden = !!root.hidden;
      if (!clock.hidden) {
        clock.innerHTML = clockHtml();
        bindTips(clock);
      }
    }
  };

  LT.registerAttributes = function () {
    LT.registerUI("attributes", {
      target: "left",
      render: function () {
        LT.paintAttributes();
      },
    });
  };

  LT.initTimeListener = function () {
    document.addEventListener("lt-time", function () {
      var el = document.getElementById("game-time");
      if (el) el.textContent = LT.game.clock;
      var dateEl = document.getElementById("game-date");
      if (dateEl && typeof LT.formatGameDate === "function") dateEl.textContent = LT.formatGameDate();
      if (typeof LT.updateHouseNpcLocations === "function") LT.updateHouseNpcLocations();
      if (typeof LT.paintCharactersPresent === "function") LT.paintCharactersPresent();
      if (typeof LT.paintAttributes === "function" && LT.game.renderAttributes) LT.paintAttributes();
    });
    document.addEventListener("lt-content", function () {
      if (LT.game.renderAttributes) LT.paintAttributes();
    });
  };
})();
