(function () {
  var SEX_TAB_VISUAL = [3, 0, 1, 2];
  var SEX_TAB_INTERNAL = { 0: 1, 1: 2, 2: 3, 3: 0 };

  LT.sexTabInternal = function (visual) {
    if (visual == null) return 0;
    return SEX_TAB_VISUAL[visual] != null ? SEX_TAB_VISUAL[visual] : visual;
  };

  LT.sexTabVisual = function (internal) {
    if (internal == null) return 1;
    return SEX_TAB_INTERNAL[internal] != null ? SEX_TAB_INTERNAL[internal] : 1;
  };

  function slot(index, response) {
    if (response) response._index = index;
    return response;
  }

  function actionColour(act) {
    if (!act) return null;
    if (act.endsSex) return LT.Colour.GENERIC_BAD;
    if (act.isOrgasm) return LT.Colour.ATTRIBUTE_AROUSAL;
    if (act.id === "do_nothing") return LT.Colour.GENERIC_MINOR_BAD;
    if (act.id === "manage_clothing") return LT.Colour.GENERIC_MINOR_GOOD;
    return LT.Colour.ATTRIBUTE_AROUSAL;
  }

  LT.defineNode({
    id: "sex.scene",
    ui: "dialogue",
    title: function () {
      var s = LT.sex;
      if (!s || !s.active) return "Sex";
      return (s.publicSex ? "Public " : "") + (s.consensual ? "" : "Non-consensual ") + "Sex: " + (s.positionName || "Standing");
    },
    secondsPassed: function () {
      if (LT.sex && LT.sex.skipSeconds) return LT.sex.skipSeconds;
      return LT.sex && LT.sex.active ? 20 : 0;
    },
    travelDisabled: true,
    chrome: { left: true, right: true },
    tabs: ["Misc", "Sex", "Self", "Positioning"],
    getContent: function () {
      var s = LT.sex;
      if (!s || !s.player || (!s.partner && !s.masturbation)) return "<p>There is no sex scene here.</p>";
      var html = "";
      if (typeof LT.isDevMode === "function" && LT.isDevMode()) {
        var slotBits = [];
        var parts = s.participants || [s.player, s.partner];
        var si;
        for (si = 0; si < parts.length; si++) {
          if (!parts[si]) continue;
          var who = parts[si] === s.player ? "you" : (parts[si].getName ? parts[si].getName() : parts[si].name);
          var slot = typeof s.slotOf === "function" ? s.slotOf(parts[si]) : "";
          slotBits.push(who + (slot ? " (" + slot + ")" : ""));
        }
        html += "<p class='muted'>Slots: " + slotBits.join(", ") + ".</p>";
        if (typeof s.paceSummary === "function") html += "<p class='muted'>" + s.paceSummary() + "</p>";
        if (typeof s.listOngoing === "function") {
          var links = s.listOngoing() || [];
          if (links.length) {
            html +=
              "<p class='muted'>Ongoing: " +
              links
                .map(function (l) {
                  return l.id || l.label || "act";
                })
                .join(", ") +
              ".</p>";
          }
        }
      }
      var showBars = typeof LT.hasProperty === "function" ? LT.hasProperty("sexMainStatusBars") : false;
      if (showBars) {
        html += "<div class='combat-status'>";
        var parts = s.participants || [s.player, s.partner];
        var p;
        for (p = 0; p < parts.length; p++) {
          if (parts[p]) html += s.bar(parts[p]);
        }
        html += "</div>";
      }
      if (s.logHtml) html += "<div class='sex-log'>" + s.logHtml + "</div>";
      else if (s.lastResolution) html += "<div class='sex-log'>" + s.lastResolution + "</div>";
      return html;
    },
    getResponses: function (game, tabIndex) {
      var s = LT.sex;
      if (!s || !s.active) return [null];
      if (s.finished) {
        return [
          slot(
            1,
            new LT.Response("Continue", "The encounter is over.", null, function () {
              s.finish();
            }).withColour(LT.Colour.GENERIC_GOOD),
          ),
        ];
      }
      var list = [null];
      var actions = s.availableActions(tabIndex);
      var i;
      for (i = 0; i < actions.length; i++) {
        (function (act, index) {
          var title = typeof act.name === "function" ? act.name(s.player, s.partner) : act.name;
          if (title && title.indexOf("[") >= 0 && LT.sex.parseText) title = LT.sex.parseText(title, s.player, s.partner);
          var tip = act.tooltip ? act.tooltip(s.player, s.partner) : "";
          if (tip && tip.indexOf("[") >= 0 && LT.sex.parseText) tip = LT.sex.parseText(tip, s.player, s.partner);
          var resp = new LT.Response(title, tip, "sex.scene", function () {
            s.responseTab = tabIndex;
            s.perform(act.id);
          });
          var colour = actionColour(act);
          if (colour) resp.withColour(colour);
          list.push(slot(index + 1, resp));
        })(actions[i], i);
      }
      return list;
    },
  });
})();
