(function () {
  function slot(index, response) {
    if (response) response._index = index;
    return response;
  }

  LT.defineNode({
    id: "combat.fight",
    ui: "dialogue",
    title: function () {
      return "Combat — Turn " + ((LT.combat && LT.combat.turn) || 0);
    },
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    tabs: ["Basic moves", "Spells", "Specials", "Tease"],
    getContent: function () {
      var c = LT.combat;
      if (!c || !c.player || !c.enemy) return "<p>There is no fight here.</p>";
      var html = "<div class='combat-status'>";
      html += c.bar(c.player, LT.Colour.ATTRIBUTE_HEALTH);
      html += c.bar(c.enemy, LT.Colour.GENERIC_BAD);
      html += "</div>";
      var yours = c.predictions(c.player);
      var theirs = c.predictions(c.enemy);
      html += "<div class='combat-predict'><h6>This turn</h6>";
      if (yours.length) html += "<p><b>You:</b> " + yours.join(" ") + "</p>";
      else html += "<p><b>You:</b> <span class='muted'>No moves queued.</span></p>";
      if (theirs.length) html += "<p><b>" + (c.enemy.getName ? c.enemy.getName() : c.enemy.name) + ":</b> " + theirs.join(" ") + "</p>";
      html += "</div>";
      if (c.lastResolution) {
        html += "<div class='combat-log'><h6>Last turn</h6>" + c.lastResolution + "</div>";
      }
      return html;
    },
    getResponses: function (game, tabIndex) {
      var c = LT.combat;
      if (!c) return [null];
      if (c.finished === "victory") {
        return [
          slot(
            1,
            new LT.Response("Victory", "You have won this fight!", null, function () {
              c.finish();
            }).withColour(LT.Colour.GENERIC_GOOD),
          ),
        ];
      }
      if (c.finished === "defeat") {
        return [
          slot(
            1,
            new LT.Response("Defeat", "You have been defeated!", null, function () {
              c.finish();
            }).withColour(LT.Colour.GENERIC_BAD),
          ),
        ];
      }
      if (c.finished === "escaped") {
        return [
          slot(
            1,
            new LT.Response("Escaped!", "You got away!", null, function () {
              c.finish();
            }).withColour(LT.Colour.GENERIC_GOOD),
          ),
        ];
      }
      if (!c.active) return [null];
      var end = new LT.Response(
        "End Turn",
        c.remainingAp() <= 0 ? "Ends your current turn." : "Ends your current turn. You still have unspent AP!",
        "combat.fight",
        function () {
          c.endTurn();
        },
      ).withColour(c.remainingAp() > 0 ? LT.Colour.GENERIC_BAD : LT.Colour.GENERIC_GOOD);
      var strikeReason = c.canQueue("strike");
      var strikeTitle = LT.MOVES.strike.titleOf ? LT.MOVES.strike.titleOf(c.player) : "Strike";
      var strike = new LT.Response(strikeTitle, LT.MOVES.strike.tooltip(c.player, c.enemy), "combat.fight", function () {
        c.queue("strike");
      });
      if (strikeReason) strike.disable(strikeReason);
      var offReason = c.canQueue("offhand");
      var offTitle = LT.MOVES.offhand && LT.MOVES.offhand.titleOf ? LT.MOVES.offhand.titleOf(c.player) : "Offhand";
      var offhand = new LT.Response(offTitle, LT.MOVES.offhand.tooltip(c.player, c.enemy), "combat.fight", function () {
        c.queue("offhand");
      });
      if (offReason) offhand.disable(offReason);
      var blockReason = c.canQueue("block");
      var block = new LT.Response("Block", LT.MOVES.block.tooltip(c.player, c.enemy), "combat.fight", function () {
        c.queue("block");
      });
      if (blockReason) block.disable(blockReason);
      var tease = new LT.Response("Tease", "Open tease options.", "combat.fight", function () {
        c.responseTab = 3;
      }).withColour(LT.Colour.ATTRIBUTE_LUST);
      var allReason = c.canQueue("allout");
      var allout = new LT.Response("All-out strike", LT.MOVES.allout.tooltip(c.player, c.enemy), "combat.fight", function () {
        c.queue("allout");
      });
      if (allReason) allout.disable(allReason);
      var resistReason = c.canQueue("resist");
      var resist = new LT.Response("Resist", LT.MOVES.resist.tooltip(c.player, c.enemy), "combat.fight", function () {
        c.queue("resist");
      }).withColour(LT.Colour.ATTRIBUTE_LUST);
      if (resistReason) resist.disable(resistReason);
      var submit = c.submitBlocked
        ? new LT.Response("Submit", "You cannot submit in this combat scene!", null).disable("You cannot submit in this combat scene!")
        : new LT.Response("Submit", "Surrender this fight to your opponent.", "combat.submit");
      var escape;
      if (c.escapeChance <= 0) {
        escape = new LT.Response("Escape", "You can't run from this fight!", null).disable("You can't run from this fight!");
      } else {
        escape = new LT.Response("Escape", "Try to escape. You have a " + c.escapeChance + "% chance to get away!", "combat.fight", function () {
          c.escape();
        });
      }
      if (tabIndex === 3) {
        var teaseSlots = [slot(0, end)];
        var teases = typeof LT.availableTeases === "function" ? LT.availableTeases(c.player) : ["tease"];
        for (var te = 0; te < teases.length; te++) {
          (function (moveId, index) {
            var move = LT.MOVES[moveId];
            if (!move) return;
            var reason = c.canQueue(moveId);
            var resp = new LT.Response(move.name, move.tooltip(c.player, c.enemy), "combat.fight", function () {
              c.responseTab = 3;
              c.queue(moveId);
            }).withColour(LT.Colour.ATTRIBUTE_LUST);
            if (reason) resp.disable(reason);
            teaseSlots.push(slot(index + 1, resp));
          })(teases[te], te);
        }
        return teaseSlots;
      }
      if (tabIndex === 2) {
        var specialSlots = [slot(0, end)];
        var specials = typeof LT.availableSpecials === "function" ? LT.availableSpecials(c.player) : [];
        for (var p = 0; p < specials.length; p++) {
          (function (moveId, index) {
            var move = LT.MOVES[moveId];
            var def = LT.WEAPON_SPECIALS && LT.WEAPON_SPECIALS[moveId];
            if (!move || !def) return;
            var reason = c.canQueue(moveId);
            var resp = new LT.Response(def.title, move.tooltip(c.player, c.enemy), "combat.fight", function () {
              c.responseTab = 2;
              c.queue(moveId);
            }).withColour(LT.Colour.GENERIC_BAD);
            if (reason) resp.disable(reason);
            specialSlots.push(slot(index + 1, resp));
          })(specials[p], p);
        }
        return specialSlots;
      }
      if (tabIndex === 1 && LT.SPELL_IDS) {
        var spellSlots = [slot(0, end)];
        var known = LT.knownSpells ? LT.knownSpells(c.player) : LT.SPELL_IDS;
        for (var s = 0; s < known.length; s++) {
          (function (spellId, index) {
            var moveId = "spell_" + spellId;
            var move = LT.MOVES[moveId];
            var def = LT.SPELLS[spellId];
            if (!move || !def) return;
            var reason = c.canQueue(moveId);
            var colour =
              def.effect === "lust"
                ? LT.Colour.ATTRIBUTE_LUST
                : def.damageType === "POISON"
                  ? LT.Colour.GENERIC_MINOR_GOOD
                  : def.damageType === "FIRE"
                    ? LT.Colour.GENERIC_BAD
                    : def.damageType === "ICE"
                      ? LT.Colour.ATTRIBUTE_MANA
                      : LT.Colour.ATTRIBUTE_PHYSIQUE;
            var resp = new LT.Response(def.name, move.tooltip(c.player, c.enemy), "combat.fight", function () {
              c.responseTab = 1;
              c.queue(moveId);
            }).withColour(colour);
            if (reason) resp.disable(reason);
            spellSlots.push(slot(index + 1, resp));
          })(known[s], s);
        }
        return spellSlots;
      }
      return [slot(0, end), slot(1, strike), slot(2, block), slot(3, tease), slot(4, resist), slot(6, offhand), slot(7, allout), slot(9, submit), slot(10, escape)];
    },
  });

  LT.defineNode({
    id: "combat.submit",
    ui: "dialogue",
    title: "Submit",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>Are you sure you want to surrender? This will count as a defeat.</p>";
    },
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to the fight.", "combat.fight"),
        new LT.Response("Confirm", "Surrender this fight.", null, function () {
          LT.combat.finished = "defeat";
          LT.combat.finish();
        }).withColour(LT.Colour.GENERIC_BAD),
      ];
    },
  });
})();
