(function () {
  function colour(npc) {
    if (npc.getSpeechColour) return npc.getSpeechColour();
    return npc.feminine || (npc.isFeminine && npc.isFeminine()) ? LT.Colour.FEMININE : LT.Colour.MASCULINE;
  }

  LT.paintCharactersPresent = function () {
    var root = document.querySelector('[data-ui="characters-present"] [data-node-content]');
    if (!root) return;
    if (typeof LT.updateHouseNpcLocations === "function") LT.updateHouseNpcLocations();
    var list = typeof LT.npcAtCurrentTile === "function" ? LT.npcAtCurrentTile() : [];
    var html = "<div class='attribute-container'><p style='text-align:center;padding:0;margin:0;'><b>Characters Present</b></p>";
    if (!list.length) {
      html += "<p style='text-align:center;padding:0;margin:0;'><span class='muted'>None...</span></p>";
    } else {
      for (var i = 0; i < list.length; i++) {
        var n = list[i];
        var race = n.getRaceName ? n.getRaceName() : n.raceName || "";
        html +=
          "<div class='present-row" +
          (i % 2 ? " alt" : "") +
          "'>" +
          (typeof LT.portraitHtml === "function" ? LT.portraitHtml(n.id, "char-portrait-tiny") : "") +
          "<span style='color:" +
          colour(n) +
          ";'>" +
          (n.getName ? n.getName() : n.name) +
          "</span>" +
          (race ? "<span class='muted'> · " + race + "</span>" : "") +
          "</div>";
      }
    }
    html += "</div>";
    root.innerHTML = html;
  };

  LT.registerUI("characters-present", {
    target: "right",
    render: function () {
      LT.paintCharactersPresent();
    },
  });
})();
