(function () {
  function slotRow(player, slot) {
    var item = player.equipped[slot.id];
    var inner = item
      ? '<div class="inv-item" data-inv-unequip="' +
        slot.id +
        '" style="border-color:' +
        item.colour +
        ';"><b>' +
        item.name +
        '</b><br><span class="muted">' +
        item.colourName +
        "</span></div>"
      : '<div class="inv-item empty-slot"><span class="muted">empty</span></div>';
    return '<div class="inv-slot"><div class="inv-slot-label">' + slot.label + "</div>" + inner + "</div>";
  }

  function weaponSlotRow(player, slot) {
    var twoHanded = slot.id === "offhand" && typeof LT.isTwoHandedEquipped === "function" && LT.isTwoHandedEquipped(player);
    if (twoHanded) {
      var main = player.mainWeapon;
      return (
        '<div class="inv-slot"><div class="inv-slot-label">' +
        slot.label +
        '</div><div class="inv-item empty-slot" data-inv-wep-unequip="main"><span class="muted">occupied (' +
        ((main && main.name) || "two-handed") +
        ")</span></div></div>"
      );
    }
    var item = slot.id === "main" ? player.mainWeapon : player.offhandWeapon;
    var type = item && LT.getWeaponType && LT.getWeaponType(item.id);
    var inner = item
      ? '<div class="inv-item" data-inv-wep-unequip="' +
        slot.id +
        '" style="border-color:' +
        LT.weaponRarityColour(type && type.rarity) +
        ';"><b>' +
        item.name +
        '</b><br><span class="muted">' +
        (item.damageType || "PHYSICAL") +
        (type ? " · " + type.damage + " dmg" : "") +
        (type && type.twoHanded ? " · two-handed" : "") +
        "</span></div>"
      : '<div class="inv-item empty-slot"><span class="muted">empty</span></div>';
    return '<div class="inv-slot"><div class="inv-slot-label">' + slot.label + "</div>" + inner + "</div>";
  }

  function weaponPileItem(it) {
    var type = LT.getWeaponType && LT.getWeaponType(it.id);
    var range = type && LT.weaponRange ? LT.weaponRange(it, LT.game && LT.game.player) : { min: 0, max: 0 };
    var hands = type && type.twoHanded ? "two-handed" : "one-handed";
    var offBtn =
      type && type.twoHanded
        ? ""
        : '<span class="inv-wep-btn" data-inv-wep-off="' + it.uid + '">Offhand</span>';
    return (
      '<div class="inv-item" style="border-color:' +
      LT.weaponRarityColour(type && type.rarity) +
      ';"><b>' +
      it.name +
      '</b><br><span class="muted">' +
      (it.damageType || "PHYSICAL") +
      " · " +
      (type ? type.damage : "?") +
      " (" +
      range.min +
      "–" +
      range.max +
      ") · " +
      hands +
      (it.effects && it.effects.length ? " · enchanted" : "") +
      '</span><div class="inv-wep-actions"><span class="inv-wep-btn" data-inv-wep-main="' +
      it.uid +
      '">Main</span>' +
      offBtn +
      (typeof LT.canEnchant === "function" && LT.canEnchant()
        ? '<span class="inv-wep-btn" data-inv-enchant="' + it.uid + '">Enchant</span>'
        : "") +
      "</div></div>"
    );
  }

  function inventoryHtml() {
    var p = LT.game.player;
    if (!p) return "<p>You have no inventory.</p>";
    if (typeof LT.ensureWeaponSlots === "function") LT.ensureWeaponSlots(p);
    var weapons = "";
    var wepSlots = LT.WEAPON_SLOTS || [];
    for (var w = 0; w < wepSlots.length; w++) weapons += weaponSlotRow(p, wepSlots[w]);
    var equipped = "";
    for (var i = 0; i < LT.SLOTS.length; i++) equipped += slotRow(p, LT.SLOTS[i]);
    var pile = "";
    for (var k = 0; k < (p.weapons || []).length; k++) pile += weaponPileItem(p.weapons[k]);
    for (var b = 0; b < (p.items || []).length; b++) {
      var book = p.items[b];
      if (!book) continue;
      if (book.kind === "spellbook") {
        pile +=
          '<div class="inv-item" data-inv-read="' +
          book.uid +
          '" style="border-color:' +
          LT.Colour.GENERIC_ARCANE +
          ';"><b>' +
          book.name +
          '</b><br><span class="muted">Read to learn this spell</span></div>';
      } else if (book.kind === "essence" || book.kind === "tf" || book.kind === "consumable" || book.kind === "collar" || book.kind === "toy" || book.kind === "gift" || book.kind === "cosmetic") {
        pile +=
          '<div class="inv-item" data-inv-use="' +
          book.uid +
          '" style="border-color:' +
          (book.kind === "collar" ? "#888888" : LT.Colour.GENERIC_ARCANE) +
          ';"><b>' +
          book.name +
          '</b><br><span class="muted">' +
          (book.kind === "collar" ? "Slave collar" : book.kind === "tf" && book.effects && book.effects.length ? "Enchanted potion · Use" : "Use") +
          "</span>" +
          (book.kind === "tf" && typeof LT.canEnchant === "function" && LT.canEnchant()
            ? '<div class="inv-wep-actions"><span class="inv-wep-btn" data-inv-enchant="' + book.uid + '">Enchant</span></div>'
            : "") +
          "</div>";
      }
    }
    for (var j = 0; j < (p.wardrobe || []).length; j++) {
      var it = p.wardrobe[j];
      pile +=
        '<div class="inv-item" data-inv-equip="' +
        it.uid +
        '" style="border-color:' +
        it.colour +
        ';"><b>' +
        it.name +
        '</b><br><span class="muted">' +
        it.colourName +
        " · " +
        it.slot +
        (it.effects && it.effects.length ? " · enchanted" : "") +
        "</span>" +
        (typeof LT.canEnchant === "function" && LT.canEnchant()
          ? '<div class="inv-wep-actions"><span class="inv-wep-btn" data-inv-enchant="' + it.uid + '">Enchant</span></div>'
          : "") +
        "</div>";
    }
    if (!pile) pile = '<p class="muted">Your bags are empty.</p>';
    return (
      "<p>You take a moment to check what you're wearing, and what you've stuffed into your bags.</p>" +
      '<p>You have <b style="color:' +
      LT.Colour.MONEY +
      ';">£' +
      (p.money || 0) +
      "</b> and <b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>" +
      (p.essences || 0) +
      "</b> arcane essences.</p>" +
      '<div class="inv-wrap"><div class="inv-col"><h6>Weapons</h6><div class="inv-grid">' +
      weapons +
      '</div><h6>Worn</h6><div class="inv-grid">' +
      equipped +
      '</div></div><div class="inv-col"><h6>Carried</h6><div class="inv-grid pile">' +
      pile +
      "</div></div></div>"
    );
  }

  function backGame() {
    return LT.game.returnNode || (LT.game.started ? LT.game.currentNode : "boot.menu");
  }

  LT.openInventory = function () {
    if (typeof LT.rememberReturn === "function") LT.rememberReturn();
    LT.game.setContent("inventory.main");
  };

  LT.defineNode({
    id: "inventory.main",
    ui: "inventory",
    title: "Inventory",
    chrome: { left: true, right: true },
    getContent: inventoryHtml,
    getResponses: function () {
      var list = [
        new LT.Response("Back", "Close your inventory.", backGame(), function () {
          LT.game.returnNode = null;
        }),
      ];
      if (typeof LT.isDevMode === "function" && LT.isDevMode()) {
        list.push(
          new LT.Response("Take all weapons", "DEV: add one of every official weapon type you don't already have.", "inventory.main", function () {
            if (typeof LT.grantAllWeapons === "function") LT.grantAllWeapons(LT.game.player);
          }),
        );
      }
      return list;
    },
  });

  document.addEventListener("click", function (e) {
    if (!LT.game.currentNode || LT.game.currentNode.id !== "inventory.main") return;
    var p = LT.game.player;
    if (!p) return;
    var enchantFirst = e.target.closest("[data-inv-enchant]");
    if (enchantFirst) {
      if (typeof LT.openEnchant === "function") LT.openEnchant(enchantFirst.getAttribute("data-inv-enchant"));
      return;
    }
    var use = e.target.closest("[data-inv-use]");
    if (use) {
      var useUid = use.getAttribute("data-inv-use");
      var carried = (p.items || []).filter(function (it) { return it && it.uid === useUid; })[0];
      if (carried && typeof LT.useCarriedItem === "function") {
        LT.game.textStart = LT.useCarriedItem(p, carried);
        LT.game.setContent("inventory.main");
      }
      return;
    }
    var read = e.target.closest("[data-inv-read]");
    if (read) {
      var uid = read.getAttribute("data-inv-read");
      var book = (p.items || []).filter(function (it) { return it.uid === uid; })[0];
      if (book && typeof LT.readSpellBook === "function") {
        LT.game.textStart = LT.readSpellBook(p, book);
        LT.game.setContent("inventory.main");
      }
      return;
    }
    var wepUnequip = e.target.closest("[data-inv-wep-unequip]");
    if (wepUnequip) {
      LT.unequipWeapon(p, wepUnequip.getAttribute("data-inv-wep-unequip"));
      LT.game.setContent("inventory.main");
      return;
    }
    var wepMain = e.target.closest("[data-inv-wep-main]");
    if (wepMain) {
      LT.equipWeapon(p, wepMain.getAttribute("data-inv-wep-main"), "main");
      LT.game.setContent("inventory.main");
      return;
    }
    var wepOff = e.target.closest("[data-inv-wep-off]");
    if (wepOff) {
      LT.equipWeapon(p, wepOff.getAttribute("data-inv-wep-off"), "offhand");
      LT.game.setContent("inventory.main");
      return;
    }
    var unequip = e.target.closest("[data-inv-unequip]");
    if (unequip) {
      LT.unequipToWardrobe(p, unequip.getAttribute("data-inv-unequip"));
      LT.game.setContent("inventory.main");
      return;
    }
    var enchant = e.target.closest("[data-inv-enchant]");
    if (enchant) {
      if (typeof LT.openEnchant === "function") LT.openEnchant(enchant.getAttribute("data-inv-enchant"));
      return;
    }
    var equip = e.target.closest("[data-inv-equip]");
    if (equip) {
      LT.equipFromWardrobe(p, equip.getAttribute("data-inv-equip"));
      LT.game.setContent("inventory.main");
    }
  });
})();
