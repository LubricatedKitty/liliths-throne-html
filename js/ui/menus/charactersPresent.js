(function () {
  var BLURBS = {
    lilaya: "Your demonic aunt. She spends her days running experiments in her lab.",
    rose: "Lilaya's cat-girl maid.",
    felicia: "Felicia is Arthur's neighbor and sometimes caregiver. While she tries to act calm and collected, she lights up at the sight of anything she remotely enjoys. Is known for the smoothest, fluffiest fur in town.",
    scarlett: "A rude harpy slaver who used to sell slaves out of Slaver Alley.",
    helena: "Matriarch of her harpy nest, and Scarlett's mistress.",
    candi: "The cat-girl receptionist at Enforcer HQ.",
    finch: "Finch is the manager of Slaver Alley's 'Slave Administration' building. Although he acts friendly enough, you can't help but wonder if his disarming disposition is just for show.",
    amber: "Zaranix's succubus maid.",
    nyan: "The shy cat-girl owner of Nyan's Clothing Emporium.",
    kate: "The succubus who runs Succubi's Secrets.",
    ashley: "Ashley is the owner of the shop 'Dream Lover', and is seemingly also its only working staff. They are very stand-offish and loathe helping out their customers.",
    bunny: "A rabbit-girl prostitute who works at Angel's Kiss.",
    loppy: "A rabbit-girl prostitute who works at Angel's Kiss.",
    jules: "Jules is the zebra-boy bouncer for the nightclub 'The Watering Hole'.",
    kalahari: "The lioness bartender at 'The Watering Hole'.",
    kruger: "The lion who owns 'The Watering Hole'.",
    hannah: "Hannah works at the gym, 'Pix's Playground', as a boxing instructor.",
    angel: "The succubus madam who runs Angel's Kiss.",
    katherine: "One of Zaranix's succubus maids.",
    arthur: "Lilaya's old colleague, and an expert on arcane artefacts.",
    brax: "The wolf-boy Enforcer who used to hold Arthur.",
    vicky: "The wolf-girl who runs Arcane Arts in the Shopping Arcade.",
  };

  function colour(npc) {
    if (npc.getSpeechColour) return npc.getSpeechColour();
    return npc.feminine || (npc.isFeminine && npc.isFeminine()) ? LT.Colour.FEMININE : LT.Colour.MASCULINE;
  }

  function displayName(npc) {
    if (!npc) return "Unknown";
    if (npc.getName) return npc.getName();
    return npc.name || npc.id || "Unknown";
  }

  function raceName(npc) {
    if (!npc) return "";
    if (npc.getRaceName) return npc.getRaceName();
    return npc.fullRace || npc.raceName || "";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function findNpc(id) {
    if (!id) return null;
    var list = typeof LT.npcAtCurrentTile === "function" ? LT.npcAtCurrentTile() : [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return (LT.game.npcs && LT.game.npcs[id]) || null;
  }

  function inspectedNpc() {
    var id = LT.game.flags && LT.game.flags.presentNpcId;
    var n = findNpc(id);
    if (n) return n;
    var list = typeof LT.npcAtCurrentTile === "function" ? LT.npcAtCurrentTile() : [];
    return list[0] || null;
  }

  function closePresent() {
    var back = LT.game.returnNode;
    LT.game.returnNode = null;
    if (LT.game.flags) delete LT.game.flags.presentNpcId;
    if (back) LT.game.setContent(back);
    else if (LT.hasNode("place.generic")) LT.game.setContent("place.generic");
  }

  LT.openCharactersPresent = function (id) {
    if (!LT.game || !LT.game.started) return;
    var current = LT.game.currentNode;
    var viewing = current && current.id === "characters.present";
    var list = typeof LT.npcAtCurrentTile === "function" ? LT.npcAtCurrentTile() : [];
    if (id) {
      if (viewing && LT.game.flags && LT.game.flags.presentNpcId === id) {
        closePresent();
        return;
      }
    } else if (viewing) {
      closePresent();
      return;
    } else if (!list.length) {
      return;
    }
    if (!viewing && typeof LT.rememberReturn === "function") LT.rememberReturn();
    LT.game.flags = LT.game.flags || {};
    LT.game.flags.presentNpcId = id || (list[0] && list[0].id) || "";
    LT.game.setContent("characters.present");
  };

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
        var race = raceName(n);
        var art = typeof LT.hasArtwork === "function" && LT.hasArtwork(n.id);
        var showThumb = art && typeof LT.thumbnailEnabled === "function" && LT.thumbnailEnabled();
        var thumb =
          showThumb && typeof LT.portraitHtml === "function" ? LT.portraitHtml(n.id, "char-portrait-tiny") : "";
        html +=
          "<div class='present-row" +
          (i % 2 ? " alt" : "") +
          "' data-present-id='" +
          escapeHtml(n.id) +
          "' data-tip-char='" +
          escapeHtml(n.id) +
          "' data-tip-full='1'>" +
          thumb +
          "<span class='present-name' style='color:" +
          colour(n) +
          ";'>" +
          (art && typeof LT.artworkEnabled === "function" && LT.artworkEnabled() ? "&#128247; " : "") +
          escapeHtml(displayName(n)) +
          "</span>" +
          (race ? "<span class='muted'> · " + escapeHtml(race) + "</span>" : "") +
          "</div>";
      }
    }
    html +=
      "</div><div class='attribute-container effects'><p style='text-align:center;padding:0;margin:0;'><b>Items Present</b></p>" +
      "<p style='text-align:center;padding:0;margin:0;'><span class='muted'>None...</span></p></div>" +
      "<div class='attribute-container effects'><p style='text-align:center;padding:0;margin:0;'><b>Event Log</b></p>" +
      "<p style='text-align:center;padding:0;margin:0;'><span class='muted'>No events yet...</span></p></div>";
    root.innerHTML = html;
    if (typeof LT.bindDeclaredTooltips === "function") LT.bindDeclaredTooltips(root);
  };

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", function (e) {
      var row = e.target && e.target.closest && e.target.closest("[data-present-id]");
      if (!row) return;
      LT.openCharactersPresent(row.getAttribute("data-present-id"));
    });
  }

  LT.defineNode({
    id: "characters.present",
    ui: "dialogue",
    title: function () {
      var n = inspectedNpc();
      return n ? "Characters Present (" + displayName(n) + ")" : "Characters Present";
    },
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var n = inspectedNpc();
      if (!n) return "<p>Nobody is here.</p>";
      if (typeof LT.ensureAppearance === "function") LT.ensureAppearance(n);
      if (typeof LT.getCharacterInformationScreen === "function") {
        return LT.getCharacterInformationScreen(n, { perkTree: true });
      }
      var race = raceName(n);
      var blurb = BLURBS[n.id] || "";
      var level = n.level != null ? n.level : "";
      return (
        (typeof LT.portraitHtml === "function" ? LT.portraitHtml(n.id) : "") +
        "<div class='container-full-width'><p><b style='color:" +
        colour(n) +
        ";'>" +
        escapeHtml(n.getFullName ? n.getFullName() : displayName(n)) +
        "</b>" +
        (level !== "" ? " · Level " + level : "") +
        (race ? " " + escapeHtml(race) : "") +
        "</p>" +
        (blurb ? "<p>" + escapeHtml(blurb) + "</p>" : "") +
        (typeof LT.getBodyDescription === "function" ? LT.getBodyDescription(n) : n.describeBody ? n.describeBody() : "") +
        "</div>"
      );
    },
    getResponses: function () {
      var list = typeof LT.npcAtCurrentTile === "function" ? LT.npcAtCurrentTile() : [];
      var viewed = inspectedNpc();
      var responses = [
        new LT.Response("Back", "Stop viewing the characters present and return to the main game.", null, closePresent),
      ];
      var i;
      for (i = 0; i < list.length && i < 14; i++) {
        (function (npc) {
          var looking = viewed && viewed.id === npc.id;
          var r = new LT.Response(
            displayName(npc),
            looking ? "You are already looking at " + displayName(npc) + "!" : "Take a detailed look at " + displayName(npc) + ".",
            looking ? null : "characters.present",
            function () {
              LT.game.flags.presentNpcId = npc.id;
            },
          );
          if (looking) r.disable("You are already looking at " + displayName(npc) + "!");
          responses.push(r);
        })(list[i]);
      }
      return responses;
    },
  });

  LT.registerUI("characters-present", {
    target: "right",
    render: function () {
      LT.paintCharactersPresent();
    },
  });
})();
