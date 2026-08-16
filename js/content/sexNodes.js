(function () {
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
      return (s.consensual ? "" : "Non-consensual ") + "Sex: " + (s.positionName || "Standing");
    },
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    tabs: ["Sex", "Self", "Positioning", "Misc"],
    getContent: function () {
      var s = LT.sex;
      if (!s || !s.player || !s.partner) return "<p>There is no sex scene here.</p>";
      var html = "<div class='combat-status'>";
      html += s.bar(s.player);
      html += s.bar(s.partner);
      html += "</div>";
      if (s.ongoing) {
        html += "<p class='muted'>Ongoing: " + (s.ongoing.label || s.ongoing.id) + ".</p>";
      }
      if (s.lastResolution) {
        html += "<div class='combat-log'><h6>" + (s.turn ? "Last actions" : "Sex") + "</h6>" + s.lastResolution + "</div>";
      }
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
          var title = act.name;
          if (title && title.indexOf("[") >= 0 && LT.sex.parseText) title = LT.sex.parseText(title, s.player, s.partner);
          var tip = act.tooltip ? act.tooltip(s.player, s.partner) : "";
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
