(function () {
  function pct(value, max, fallback) {
    if (value == null || !max) return fallback;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function bar(label, percent, colour, icon, current, max) {
    var nums = current != null && max != null ? current + " / " + max : Math.round(percent) + "%";
    return (
      '<div class="resource-row" data-tip="' +
      label +
      ": " +
      nums +
      '">' +
      '<div class="resource-icon"><img src="' +
      icon +
      '" alt=""></div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' +
      percent +
      "%;background:" +
      colour +
      ';"></div></div>' +
      '<div class="bar-numbers">' +
      nums +
      "</div></div>"
    );
  }

  function statIcon(label, value, colour, icon) {
    return (
      '<div class="stat-icon" data-tip="' +
      label +
      ": " +
      value +
      '"><img src="' +
      icon +
      '" alt="' +
      label +
      '"><span style="color:' +
      colour +
      ';">' +
      value +
      "</span></div>"
    );
  }

  LT.paintAttributes = function () {
    var root = document.querySelector('[data-ui="attributes"]');
    if (!root) return;
    var player = LT.game.player;
    var Colour = LT.Colour;
    var name = player && player.getName ? player.getName() : "Unknown";
    var level = (player && player.level) || 1;
    var race = player && player.getRaceName ? player.getRaceName() : "Human";
    var femininity = player && player.getFemininityValue ? player.getFemininityValue() : 50;
    var nameColour =
      femininity < 40 ? Colour.MASCULINE : femininity > 60 ? Colour.FEMININE : Colour.ANDROGYNOUS;

    var hp = pct(player && player.health, player && player.maxHealth, 100);
    var aura = pct(player && player.mana, player && player.maxMana, 100);
    var xp = pct(player && player.experience, player && player.experienceForLevel, 0);

    root.innerHTML =
      '<div class="attribute-container">' +
      (typeof LT.portraitHtml === "function" ? LT.portraitHtml("player", "char-portrait-small") : "") +
      '<p class="character-name" style="color:' +
      nameColour +
      ';">' +
      escapeHtml(name) +
      "</p>" +
      '<p class="character-sub">Level ' +
      level +
      " " +
      escapeHtml(race) +
      "</p>" +
      bar("Health", hp, Colour.ATTRIBUTE_HEALTH, LT.uiIcon("healthIcon.svg"), player && player.health, player && player.maxHealth) +
      bar("Aura", aura, Colour.ATTRIBUTE_MANA, LT.uiIcon("manaIcon.svg"), player && player.mana, player && player.maxMana) +
      bar("Experience", xp, Colour.ATTRIBUTE_EXPERIENCE, LT.uiIcon("experienceIcon.svg"), player && player.experience, player && player.experienceForLevel) +
      "</div>" +
      '<div class="attribute-container"><div class="attr-row">' +
      statIcon("Physique", (player && (typeof LT.effectivePhysique === "function" ? LT.effectivePhysique(player) : player.physique)) || 10, Colour.ATTRIBUTE_PHYSIQUE, LT.uiIcon("strengthIcon.svg")) +
      statIcon("Arcane", (player && (typeof LT.effectiveArcane === "function" ? LT.effectiveArcane(player) : player.arcane)) || 10, Colour.ATTRIBUTE_ARCANE, LT.uiIcon("intelligenceIcon.svg")) +
      statIcon("Corruption", (player && (typeof LT.effectiveCorruption === "function" ? LT.effectiveCorruption(player) : player.corruption)) || 0, Colour.ATTRIBUTE_CORRUPTION, LT.uiIcon("corruptionIcon.svg")) +
      '</div><div class="attr-row">' +
      statIcon("Arousal", (player && player.arousal) || 0, Colour.ATTRIBUTE_AROUSAL, LT.uiIcon("arousalIcon.svg")) +
      statIcon("Lust", (player && player.lust) || 0, Colour.ATTRIBUTE_LUST, LT.uiIcon("arousalIcon.svg")) +
      "</div></div>" +
      '<div class="attribute-container attribute-container-inner effects" id="status-effects"></div>' +
      '<div class="attribute-container clock-box">' +
      '<div class="clock-line"><img src="' +
      LT.uiIcon("calendar.svg") +
      '" alt=""><span id="game-date">' +
      (typeof LT.formatGameDate === "function" ? LT.formatGameDate() : "Monday, 1st January 2019") +
      "</span></div>" +
      '<div class="clock-line"><img src="' +
      LT.uiIcon("stopwatch.svg") +
      '" alt=""><span id="game-time">' +
      LT.game.clock +
      "</span></div>" +
      '<div class="clock-line"><span style="color:' +
      Colour.MONEY +
      ';">£' +
      ((player && player.money) || 0) +
      "</span></div></div>";

    var tips = root.querySelectorAll("[data-tip]");
    for (var i = 0; i < tips.length; i++) {
      (function (el) {
        LT.bindTooltip(el, el.getAttribute("data-tip"));
      })(tips[i]);
    }
    if (typeof LT.paintStatusEffects === "function") LT.paintStatusEffects(player);
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
      if (typeof LT.paintStatusEffects === "function") LT.paintStatusEffects();
    });
    document.addEventListener("lt-content", function () {
      if (LT.game.renderAttributes) LT.paintAttributes();
    });
  };
})();
