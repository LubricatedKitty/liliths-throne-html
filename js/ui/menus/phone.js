(function () {
  var QUESTS = {
    MAIN_1_A_LILAYAS_TESTS: {
      line: "Lilith's Throne",
      name: "Lilaya's Tests",
      text: "You can find Lilaya in her lab at any time, where she'll be ready to continue running her tests on you. Maybe she can find a way to send you back home?",
    },
    MAIN_1_B_DEMON_HOME: {
      line: "Lilith's Throne",
      name: "The search for Arthur; Demon Home",
      text: "Lilaya has informed you that her old colleague, Arthur, would know more about the type of magic used in the portal. However, she seems to have an intense dislike of him, and you've ended up being tasked to go and get him to apologise to Lilaya before she'll allow him to come and work with her. Arthur lives in an apartment building called 'Sawlty Towers', in the district of the city known as 'Demon Home', so you can find him there.",
    },
    MAIN_1_C_WOLFS_DEN: {
      line: "Lilith's Throne",
      name: "The search for Arthur; The Wolf's Den",
      text: "Arthur has been arrested by Dominion's Enforcers, and has been taken to the Enforcer's HQ. It looks like you'll have to inquire further there and find out a way to save Arthur.",
    },
    MAIN_1_D_SLAVERY: {
      line: "Lilith's Throne",
      name: "The search for Arthur; Sold into Slavery",
      text: "After defeating Brax, you found out that Arthur was sold into slavery to a trader called Scarlett. You'll have to travel to Slaver Alley, find Scarlett, and find a way to free Arthur.",
    },
    MAIN_1_E_REPORT_TO_HELENA: {
      line: "Lilith's Throne",
      name: "The search for Arthur; Find Helena",
      text: "After finding Scarlett in Slaver Alley, you discovered that she's no longer in possession of Arthur. Before she'll tell you anything about it, she wants you to go to the Harpy Nests and report to her matriarch, Helena, that her business is a complete failure",
    },
    MAIN_1_F_SCARLETTS_FATE: {
      line: "Lilith's Throne",
      name: "The search for Arthur; Scarlett's fate",
      text: "You need to travel back to Scarlett's shop to find out what's become of her. Hopefully Helena wasn't too hard on her, and she'll be willing to tell you what happened to Arthur now...",
    },
    MAIN_1_G_SLAVERY: {
      line: "Lilith's Throne",
      name: "The search for Arthur; Slavery",
      text: "Helena is willing to sell Scarlett to you, which seems to be the only way you'll get the information you need. You'll need to have a slaver license in order to buy Scarlett.",
    },
    MAIN_1_H_THE_GREAT_ESCAPE: {
      line: "Lilith's Throne",
      name: "The search for Arthur; The Great Escape",
      text: "It turns out that Arthur was sold to an extremely dangerous demon called Zaranix, who lives in Demon Home. You'll need to travel to demon home and rescue Arthur!",
    },
  };

  var SIDE_QUESTS = {
    SIDE_SLAVER_NEED_RECOMMENDATION: {
      line: "Slaver",
      name: "Letter of recommendation",
      text: "After asking how to obtain a slaver license at the Slavery Administration building, you discovered that you'll need a letter of recommendation first. Lilaya should be able to help with that.",
    },
    SIDE_ENCHANTMENTS_LILAYA_HELP: {
      line: "Essences and Enchantments",
      name: "Ask Lilaya for help",
      text: "You recently felt a strange force entering your body, and although it doesn't seem to have had any obvious effect, you should probably have it checked out. Lilaya is sure to know more, so perhaps you should go and talk to her about it.",
    },
    SIDE_SLAVER_RECOMMENDATION_OBTAINED: {
      line: "Slaver",
      name: "Present letter",
      text: "Now that you've obtained a letter of recommendation from Lilaya, you should go back to the Slavery Administration building in Slaver Alley and present it to Finch.",
    },
    SIDE_PREGNANCY_CONSULT_LILAYA: {
      line: "Pregnancy",
      name: "Lilaya knows best",
      text: "There's no way... You're pregnant? You're pregnant! Surely Lilaya will know what to do?!",
    },
    SIDE_PREGNANCY_LILAYA_THE_MIDWIFE: {
      line: "Pregnancy",
      name: "Lilaya the midwife",
      text: "Lilaya said that she'd be able to help you give birth whenever you're ready. You're going to need to wait until your belly has finished growing, then you can go and see Lilaya to give birth.",
    },
  };

  function backGame() {
    return LT.game.returnNode || (LT.game.started ? LT.game.currentNode : "boot.menu");
  }

  function openPhoneNode(id) {
    if (typeof LT.rememberReturn === "function") LT.rememberReturn();
    LT.game.setContent(id);
  }

  LT.openPhone = function () {
    openPhoneNode("phone.menu");
  };

  LT.defineNode({
    id: "phone.menu",
    ui: "phone",
    title: "Phone",
    chrome: { left: true, right: true },
    getContent: function () {
      var body = "<p>You pull out your phone and tap in the unlock code.</p>";
      if (LT.game.started && LT.game.renderMap) {
        body +=
          "<p>Using your powerful aura, you've managed to figure out a way to channel the arcane into charging the battery of your phone, although considering that it's the only one in this world, it's not much use for calling anyone. Instead, you're using it as a way to store information about things you've discovered in this strange new world.</p>";
      }
      return body;
    },
    getResponses: function () {
      return [
        new LT.Response("Back", "Put your phone away.", backGame(), function () {
          LT.game.returnNode = null;
        }),
        new LT.Response("Quests", "Open your planner to view your current quests.", "phone.quests"),
        (function () {
          var r = new LT.Response("Selfie", "Take a selfie to get a good view of yourself.", "phone.selfie");
          if (!LT.game.player) r.disable("You need a character first.");
          return r;
        })(),
        new LT.Response("Maps", "View maps you've discovered.", "phone.maps"),
        (function () {
          var r = new LT.Response("Wait", "Pass time where you are.", "phone.wait");
          if (!LT.game.started || !LT.game.player) r.disable("You need to be in the game first.");
          if (LT.game.currentNode && LT.game.currentNode.travelDisabled) r.disable("You can't wait here.");
          return r;
        })(),
        (function () {
          var owned = typeof LT.ownedSlaves === "function" ? LT.ownedSlaves() : [];
          if (!owned.length) return new LT.Response("Slaves", "You do not own any slaves.", null).disable("You do not own any slaves.");
          return new LT.Response("Slaves", "Review the slaves registered to you.", "house.slaves", function () {
            LT.game.flags.slaveMenuFrom = "phone.menu";
          });
        })(),
        new LT.Response("Contacts", "People you have met, and their portraits.", "phone.contacts"),
        (function () {
          var r = new LT.Response("Transform", "Transform your body.", "body.core", function () {
            LT.bodyChangingTarget = LT.game.player;
            LT.bodyChangingReturn = "phone.menu";
          });
          if (!LT.game.player) r.disable("You need a character first.");
          else if (typeof LT.isAbleToSelfTransform === "function" && !LT.isAbleToSelfTransform(LT.game.player)) {
            r.disable(
              (typeof LT.getUnableToTransformDescription === "function" && LT.getUnableToTransformDescription(LT.game.player)) ||
                "You cannot transform your body at will!",
            );
          }
          return r;
        })(),
      ];
    },
  });

  LT.defineNode({
    id: "phone.quests",
    ui: "phone",
    title: "Planner",
    chrome: { left: true, right: true },
    getContent: function () {
      function block(q) {
        return (
          "<details open><summary class='quest-title' style='color:" +
          LT.Colour.GENERIC_ARCANE +
          ";'>" +
          q.line +
          "</summary>" +
          "<div class='container-full-width'><h6 style='margin:0;color:" +
          LT.Colour.BASE_PINK_LIGHT +
          ";'>" +
          q.name +
          "</h6><p>" +
          q.text +
          "</p></div></details>"
        );
      }
      var html = "";
      var id = LT.game.flags && LT.game.flags.quest;
      var q = QUESTS[id];
      if (q) html += block(q);
      var sideId = LT.game.flags && LT.game.flags.slaveryQuest;
      var side = SIDE_QUESTS[sideId];
      if (side) html += block(side);
      var enchId = LT.game.flags && LT.game.flags.enchantmentQuest;
      var ench = SIDE_QUESTS[enchId];
      if (ench) html += block(ench);
      var pregId = LT.game.flags && LT.game.flags.pregnancyQuest;
      var preg = SIDE_QUESTS[pregId];
      if (preg) html += block(preg);
      if (!html) return "<p class='muted'>You don't have any active quests.</p>";
      return html;
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the phone.", "phone.menu")];
    },
  });

  function waitAndReturn(seconds, hour, text) {
    if (hour != null && typeof LT.waitUntilHour === "function") LT.waitUntilHour(hour);
    else LT.game.advanceTime(seconds || 0);
    if (typeof LT.updateHouseNpcLocations === "function") LT.updateHouseNpcLocations();
    LT.game.textStart = "<p>" + text + "</p>";
    var dest = LT.game.returnNode;
    LT.game.returnNode = null;
    if (dest) LT.game.setContent(dest);
  }

  LT.defineNode({
    id: "phone.wait",
    ui: "phone",
    title: "Wait",
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>You can pass some time here if you need to wait for a shop to open or for morning to come.</p>";
    },
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to the phone.", "phone.menu"),
        new LT.Response("15 minutes", "Wait for fifteen minutes.", null, function () {
          waitAndReturn(15 * 60, null, "You wait for fifteen minutes.");
        }),
        new LT.Response("1 hour", "Wait for one hour.", null, function () {
          waitAndReturn(3600, null, "You wait for an hour.");
        }),
        new LT.Response("Until morning", "Wait until 07:00.", null, function () {
          waitAndReturn(0, 7, "You wait until morning.");
        }),
        new LT.Response("Until evening", "Wait until 21:00.", null, function () {
          waitAndReturn(0, 21, "You wait until evening.");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "phone.selfie",
    ui: "phone",
    title: "Selfie picture",
    chrome: { left: true, right: true },
    getContent: function () {
      var p = LT.game.player;
      if (!p) return "<p>Nobody to photograph.</p>";
      return (
        "<p>You hold the phone out and take a picture of yourself.</p>" +
        (typeof LT.portraitHtml === "function" ? LT.portraitHtml("player") : "") +
        "<div class='container-full-width'><p><b style='color:" +
        (p.getGenderColour ? p.getGenderColour() : "#ddd") +
        ";'>" +
        p.getName() +
        "</b> · Level " +
        (p.level || 1) +
        " Human</p>" +
        (p.describeBody ? p.describeBody() : "") +
        "</div>"
      );
    },
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to the phone.", "phone.menu"),
        new LT.Response(
          typeof LT.getCharacterImage === "function" && LT.getCharacterImage("player") ? "Change image" : "Set image",
          "Attach a portrait from an image link.",
          "house.image",
          function () {
            LT.game.flags.imageTarget = "player";
            LT.game.flags.imageBack = "phone.selfie";
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "phone.maps",
    ui: "phone",
    title: "Maps",
    chrome: { left: true, right: true },
    getContent: function () {
      var worlds = LT.game.discoveredWorlds || [];
      if (!worlds.length && window.grid && grid.gridName) worlds = [grid.gridName];
      if (!worlds.length) return "<p class='muted'>You haven't explored any maps yet.</p>";
      var html = "<p>Places you've travelled to:</p>";
      for (var i = 0; i < worlds.length; i++) {
        var id = worlds[i];
        var meta = (window.LT_GRID_META && LT_GRID_META[id]) || {};
        var here = window.grid && grid.gridName === id;
        html +=
          "<div class='container-full-width'><b>" +
          (meta.name || id) +
          "</b>" +
          (here ? " <span class='muted'>(here)</span>" : "") +
          "<br/><span class='muted'>" +
          (meta.width || "?") +
          "×" +
          (meta.height || "?") +
          "</span></div>";
      }
      return html;
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the phone.", "phone.menu")];
    },
  });

  LT.defineNode({
    id: "phone.contacts",
    ui: "phone",
    title: "Contacts",
    chrome: { left: true, right: true },
    getContent: function () {
      var ids = typeof LT.namedCharacterIds === "function" ? LT.namedCharacterIds() : ["player"];
      var html = "<p>Set or change a portrait by pasting an http(s) image link. Only the link is saved.</p>";
      var i;
      for (i = 0; i < ids.length; i++) {
        var id = ids[i];
        var name = id === "player" ? (LT.game.player && LT.game.player.getName ? LT.game.player.getName() : "You") : id;
        var npc = LT.game.npcs && LT.game.npcs[id];
        if (npc && npc.getName) name = npc.getName();
        html +=
          "<div class='container-full-width contact-card'>" +
          (typeof LT.portraitHtml === "function" ? LT.portraitHtml(id, "char-portrait-small") : "") +
          "<p><b>" +
          name +
          "</b></p></div>";
      }
      return html;
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Return to the phone.", "phone.menu")];
      var ids = typeof LT.namedCharacterIds === "function" ? LT.namedCharacterIds() : ["player"];
      var i;
      for (i = 0; i < ids.length && i < 12; i++) {
        (function (id) {
          var label = id === "player" ? "Your image" : id;
          var npc = LT.game.npcs && LT.game.npcs[id];
          if (npc && npc.getName) label = npc.getName();
          list.push(
            new LT.Response(label, "Set or change this portrait.", "house.image", function () {
              LT.game.flags.imageTarget = id;
              LT.game.flags.imageBack = "phone.contacts";
            }),
          );
        })(ids[i]);
      }
      return list;
    },
  });
})();
