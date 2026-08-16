(function () {
  function nameOf(npc) {
    if (!npc) return "them";
    if (npc.getName) return npc.getName();
    return npc.name || "them";
  }

  function lootHtml() {
    var npc = typeof LT.currentLootNpc === "function" ? LT.currentLootNpc() : null;
    if (!npc) return "<p>There is nobody here to loot.</p>";
    var html = "<p>You go through what " + nameOf(npc) + " was carrying.</p>";
    html += '<div class="inv-wrap"><div class="inv-col"><h6>Worn</h6><div class="inv-grid">';
    var worn = typeof LT.npcEquippedList === "function" ? LT.npcEquippedList(npc) : [];
    if (!worn.length) html += '<div class="inv-item empty-slot"><span class="muted">stripped</span></div>';
    worn.forEach(function (entry) {
      html +=
        '<div class="inv-item" data-loot-cloth="' +
        entry.slot +
        '" style="border-color:' +
        (entry.item.colour || "#888") +
        ';"><b>' +
        entry.item.name +
        '</b><br><span class="muted">' +
        (entry.item.colourName || entry.slot) +
        " · Take</span></div>";
    });
    html += '</div><h6>Weapons</h6><div class="inv-grid">';
    function wepCell(which, wep) {
      if (!wep) return "";
      return (
        '<div class="inv-item" data-loot-wep="' +
        which +
        '"><b>' +
        wep.name +
        '</b><br><span class="muted">' +
        (wep.damageType || "PHYSICAL") +
        " · Take</span></div>"
      );
    }
    html += wepCell("main", npc.mainWeapon);
    html += wepCell("offhand", npc.offhandWeapon);
    (npc.weapons || []).forEach(function (w) {
      html += wepCell(w.uid, w);
    });
    if (!npc.mainWeapon && !npc.offhandWeapon && !(npc.weapons && npc.weapons.length)) {
      html += '<div class="inv-item empty-slot"><span class="muted">none</span></div>';
    }
    html += '</div></div><div class="inv-col"><h6>Bag</h6><div class="inv-grid pile">';
    if (!(npc.items && npc.items.length)) html += '<p class="muted">Empty.</p>';
    (npc.items || []).forEach(function (it) {
      html +=
        '<div class="inv-item" data-loot-item="' +
        it.uid +
        '"><b>' +
        it.name +
        '</b><br><span class="muted">Take</span></div>';
    });
    html += "</div></div></div>";
    return html;
  }

  function backNode() {
    return (LT.game.flags && LT.game.flags.lootReturn) || "alley.victory";
  }

  LT.defineNode({
    id: "loot.npc",
    ui: "inventory",
    title: "Loot",
    secondsPassed: 15,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: lootHtml,
    getResponses: function () {
      var npc = typeof LT.currentLootNpc === "function" ? LT.currentLootNpc() : null;
      var list = [
        new LT.Response("Back", "Leave their things for now.", backNode()),
      ];
      if (!npc) return list;
      list.push(
        new LT.Response("Strip all", "Unequip everything they are wearing and take it.", "loot.npc", function () {
          var taken = LT.stripNpc(npc);
          LT.game.textStart = taken.length
            ? "<p>You strip " + nameOf(npc) + " and take " + taken.length + " piece" + (taken.length === 1 ? "" : "s") + " of clothing.</p>"
            : "<p>They are not wearing anything you can take.</p>";
        }),
      );
      list.push(
        new LT.Response("Take bag", "Take every loose item in their bag.", "loot.npc", function () {
          var taken = LT.takeAllNpcItems(npc);
          LT.game.textStart = taken.length
            ? "<p>You empty their bag (" + taken.length + " item" + (taken.length === 1 ? "" : "s") + ").</p>"
            : "<p>Their bag is empty.</p>";
        }),
      );
      list.push(
        new LT.Response("Take weapons", "Disarm them and take their weapons.", "loot.npc", function () {
          var taken = LT.takeAllNpcWeapons(npc);
          LT.game.textStart = taken.length
            ? "<p>You take " + taken.length + " weapon" + (taken.length === 1 ? "" : "s") + ".</p>"
            : "<p>They have no weapons left.</p>";
        }),
      );
      return list;
    },
  });

  LT.lootResponse = function (npc, returnNode) {
    if (typeof LT.npcHasLoot !== "function" || !LT.npcHasLoot(npc)) {
      return new LT.Response("Inventory", "They have nothing left to take.", null).disable("They have nothing left to take.");
    }
    return new LT.Response("Inventory", "Go through what they were wearing and carrying.", null, function () {
      LT.openNpcLoot(npc, returnNode);
    });
  };

  document.addEventListener("click", function (e) {
    if (!LT.game.currentNode || LT.game.currentNode.id !== "loot.npc") return;
    var npc = typeof LT.currentLootNpc === "function" ? LT.currentLootNpc() : null;
    if (!npc) return;
    var cloth = e.target.closest("[data-loot-cloth]");
    if (cloth) {
      var item = LT.takeNpcClothing(npc, cloth.getAttribute("data-loot-cloth"));
      LT.game.textStart = item ? "<p>You take the " + item.name + ".</p>" : "";
      LT.game.setContent("loot.npc");
      return;
    }
    var bag = e.target.closest("[data-loot-item]");
    if (bag) {
      var taken = LT.takeNpcItem(npc, bag.getAttribute("data-loot-item"));
      LT.game.textStart = taken ? "<p>You take the " + taken.name + ".</p>" : "";
      LT.game.setContent("loot.npc");
      return;
    }
    var wep = e.target.closest("[data-loot-wep]");
    if (wep) {
      var weapon = LT.takeNpcWeapon(npc, wep.getAttribute("data-loot-wep"));
      LT.game.textStart = weapon ? "<p>You take the " + weapon.name + ".</p>" : "";
      LT.game.setContent("loot.npc");
    }
  });
})();
