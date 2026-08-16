(function () {
  function xml(tag) {
    return LT.parseFromXML("places/dominion/shoppingArcade/arcaneArts", tag);
  }

  function shopOpen() {
    return typeof LT.isOfficeHours === "function" && LT.isOfficeHours();
  }

  function parseExterior() {
    var prev = LT.isWorkTime;
    LT.isWorkTime = shopOpen;
    var html = xml("EXTERIOR");
    LT.isWorkTime = prev;
    return html;
  }

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_VICKYS_SHOP",
    ui: "dialogue",
    title: "Arcane Arts (Exterior)",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureVicky === "function") LT.ensureVicky();
    },
    getContent: parseExterior,
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!shopOpen()) {
        list.push(
          new LT.Response("Enter", "Arcane Arts is currently closed. You'll have to come back later if you want to do some shopping here.", null).disable(
            "Arcane Arts is currently closed. Opening hours are 09:00–17:00.",
          ),
        );
      } else {
        list.push(new LT.Response("Enter", "Step inside Arcane Arts.", "vicky.shop"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "vicky.shop",
    ui: "dialogue",
    title: "Arcane Arts",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureVicky === "function") LT.ensureVicky();
    },
    getContent: function () {
      return xml("SHOP_WEAPONS");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Leave Arcane Arts and head back out into the arcade.", "place.SHOPPING_ARCADE_VICKYS_SHOP", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Weapons", "Walk over to the counter and see what weapons Vicky has in stock.", "vicky.weapons", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Potions & Spells", "See what spell books Vicky has in stock.", "vicky.spells", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Transformations", "See what transformative drinks Vicky has behind the counter.", "vicky.tf", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Clothing", "Vicky doesn't have any clothing in stock at the moment.", null).disable("Vicky doesn't have any clothing in stock at the moment."),
      ];
    },
  });

  function stockHtml() {
    var p = LT.game.player;
    var stock = LT.vickyStock();
    var ids = LT.vickyWeaponIds();
    var buy = "";
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var qty = stock[id] || 0;
      if (qty <= 0) continue;
      var type = LT.getWeaponType(id);
      var price = LT.weaponBuyPrice(id);
      buy +=
        '<div class="inv-item" data-vicky-buy="' +
        id +
        '" style="border-color:' +
        (typeof LT.weaponRarityColour === "function" ? LT.weaponRarityColour(type && type.rarity) : "#888") +
        ';"><b>' +
        type.name +
        "</b><br><span class='muted'>£" +
        price +
        " · " +
        qty +
        " in stock · " +
        (type.twoHanded ? "two-handed" : "one-handed") +
        " · " +
        type.damage +
        " dmg</span></div>";
    }
    if (!buy) buy = '<p class="muted">Vicky has no weapons in stock.</p>';
    var sell = "";
    for (var j = 0; j < (p.weapons || []).length; j++) {
      var it = p.weapons[j];
      var sp = LT.weaponSellPrice(it.id);
      sell +=
        '<div class="inv-item" data-vicky-sell="' +
        it.uid +
        '"><b>' +
        it.name +
        "</b><br><span class='muted'>Sell for £" +
        sp +
        "</span></div>";
    }
    if (!sell) sell = '<p class="muted">You have no spare weapons to sell.</p>';
    return (
      "<p>You walk over to the counter. Vicky growls and waits for you to make a decision.</p>" +
      '<p>You have <b style="color:' +
      LT.Colour.MONEY +
      ';">£' +
      (p.money || 0) +
      "</b>.</p>" +
      '<div class="inv-wrap"><div class="inv-col"><h6>For sale</h6><div class="inv-grid pile">' +
      buy +
      '</div></div><div class="inv-col"><h6>Sell</h6><div class="inv-grid pile">' +
      sell +
      "</div></div></div>"
    );
  }

  LT.defineNode({
    id: "vicky.weapons",
    ui: "inventory",
    title: "Arcane Arts — Weapons",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: stockHtml,
    getResponses: function () {
      return [new LT.Response("Back", "Step back from the counter.", "vicky.shop")];
    },
  });

  function bookStockHtml() {
    var p = LT.game.player;
    var stock = LT.vickyBookStock();
    var buy = "";
    for (var i = 0; i < LT.SPELL_BOOK_IDS.length; i++) {
      var id = LT.SPELL_BOOK_IDS[i];
      if ((stock[id] || 0) <= 0) continue;
      var spell = LT.SPELLS[id];
      var price = LT.spellBookBuyPrice(id);
      var known = p.knownSpells && p.knownSpells.indexOf(id) >= 0;
      buy +=
        '<div class="inv-item" data-vicky-book="' +
        id +
        '" style="border-color:' +
        LT.Colour.GENERIC_ARCANE +
        ';"><b>Spellbook: ' +
        (spell && spell.name) +
        "</b><br><span class='muted'>£" +
        price +
        (known ? " · already known" : "") +
        " · 1 in stock</span></div>";
    }
    if (!buy) buy = '<p class="muted">Vicky has no spell books in stock today.</p>';
    return (
      "<p>Vicky's spell books are stacked behind the counter. She'll sell you one if you can pay.</p>" +
      '<p>You have <b style="color:' +
      LT.Colour.MONEY +
      ';">£' +
      (p.money || 0) +
      "</b>.</p>" +
      '<div class="inv-wrap"><div class="inv-col"><h6>Spell books</h6><div class="inv-grid pile">' +
      buy +
      "</div></div></div>"
    );
  }

  LT.defineNode({
    id: "vicky.spells",
    ui: "inventory",
    title: "Arcane Arts — Spell books",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: bookStockHtml,
    getResponses: function () {
      return [new LT.Response("Back", "Step back from the counter.", "vicky.shop")];
    },
  });

  document.addEventListener("click", function (e) {
    if (LT.game.currentNode && LT.game.currentNode.id === "vicky.spells") {
      var bookBtn = e.target.closest("[data-vicky-book]");
      if (!bookBtn) return;
      var sid = bookBtn.getAttribute("data-vicky-book");
      var stock = LT.vickyBookStock();
      var price = LT.spellBookBuyPrice(sid);
      var p = LT.game.player;
      if ((stock[sid] || 0) <= 0 || (p.money || 0) < price) return;
      var book = LT.makeSpellBook(sid);
      if (!book) return;
      p.money -= price;
      p.items = p.items || [];
      p.items.push(book);
      stock[sid] -= 1;
      LT.game.setContent("vicky.spells");
      return;
    }
    if (!LT.game.currentNode || LT.game.currentNode.id !== "vicky.weapons") return;
    var p = LT.game.player;
    if (!p) return;
    var buy = e.target.closest("[data-vicky-buy]");
    if (buy) {
      var id = buy.getAttribute("data-vicky-buy");
      var stock = LT.vickyStock();
      var price = LT.weaponBuyPrice(id);
      if ((stock[id] || 0) <= 0) return;
      if ((p.money || 0) < price) return;
      var made = LT.makeWeapon(id);
      if (!made) return;
      p.money -= price;
      p.weapons = p.weapons || [];
      p.weapons.push(made);
      stock[id] -= 1;
      LT.game.setContent("vicky.weapons");
      return;
    }
    var sell = e.target.closest("[data-vicky-sell]");
    if (sell) {
      var uid = sell.getAttribute("data-vicky-sell");
      var idx = -1;
      for (var i = 0; i < (p.weapons || []).length; i++) if (p.weapons[i].uid === uid) idx = i;
      if (idx < 0) return;
      var item = p.weapons[idx];
      p.money = (p.money || 0) + LT.weaponSellPrice(item.id);
      p.weapons.splice(idx, 1);
      LT.game.setContent("vicky.weapons");
    }
  });

  function ralphOpen() {
    return typeof LT.isWorkTime === "function" && LT.isWorkTime();
  }

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_RALPHS_SHOP",
    ui: "dialogue",
    title: "Ralph's Snacks (Exterior)",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.parseFromXML("places/dominion/shoppingArcade/ralphsSnacks", "EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!ralphOpen()) {
        list.push(
          new LT.Response("Enter", "Ralph's Snacks is currently closed.", null).disable("Ralph's Snacks is closed. Opening hours are 06:00–22:00."),
        );
      } else {
        list.push(new LT.Response("Enter", "Step inside Ralph's Snacks.", "ralph.shop"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "ralph.shop",
    ui: "dialogue",
    title: "Ralph's Snacks",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.itemShopHtml(
        "ralph",
        "<p>The interior of Ralph's Snacks is packed with bottles, boxes, and labelled drinks. Ralph grins from behind the counter and waits for you to pick something.</p>",
      );
    },
    getResponses: function () {
      return LT.itemShopResponses("ralph", "place.SHOPPING_ARCADE_RALPHS_SHOP");
    },
  });

  LT.defineNode({
    id: "vicky.tf",
    ui: "dialogue",
    title: "Arcane Arts — Transformations",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.itemShopHtml(
        "vicky",
        "<p>Vicky keeps a short row of transformative drinks under the counter, next to the spell books.</p>",
      );
    },
    getResponses: function () {
      return LT.itemShopResponses("vicky", "vicky.shop");
    },
  });
})();
