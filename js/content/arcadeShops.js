(function () {
  function nyanXml(tag) {
    return LT.parseFromXML("places/dominion/shoppingArcade/clothingEmporium", tag);
  }
  function kateXml(tag) {
    return LT.parseFromXML("places/dominion/shoppingArcade/succubisSecrets", tag);
  }
  function ashleyXml(tag) {
    return LT.parseFromXML("places/dominion/shoppingArcade/dreamLover", tag);
  }
  function officeOpen() {
    return typeof LT.isOfficeHours === "function" && LT.isOfficeHours();
  }

  function clothingShopResponses(group, leaveNode) {
    var list = [new LT.Response("Back", "Look at another rack.", leaveNode)];
    var ids = LT.nyanStock(group);
    var i;
    for (i = 0; i < ids.length; i++) {
      (function (id) {
        var item = LT.CLOTHING[id];
        if (!item) return;
        var price = LT.clothingBuyPrice(item);
        var title = item.name + " (" + price + ")";
        if (LT.getMoney() < price) {
          list.push(new LT.Response(title, "You cannot afford that.", null).disable("You need " + price + " flames."));
        } else {
          list.push(
            new LT.Response(title, "Buy " + item.name + " for " + price + " flames.", leaveNode, function () {
              var made = LT.makeClothing(id);
              LT.game.player.wardrobe = LT.game.player.wardrobe || [];
              LT.game.player.wardrobe.push(made);
              LT.game.textEnd = LT.incrementMoney(-price);
              LT.game.textStart = "<p>You buy the " + item.name + " for " + price + " flames and tuck it into your bag.</p>";
            }),
          );
        }
      })(ids[i]);
    }
    return list;
  }

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_NYANS_SHOP",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureNyan === "function") LT.ensureNyan();
    },
    getContent: function () {
      return nyanXml("NYAN_EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!officeOpen()) {
        list.push(new LT.Response("Enter", "Nyan's shop is closed.", null).disable("Opening hours are 09:00–17:00."));
      } else {
        list.push(new LT.Response("Enter", "Step inside Nyan's Clothing Emporium.", "nyan.shop"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "nyan.shop",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureNyan === "function") LT.ensureNyan();
    },
    getContent: function () {
      var f = LT.game.flags || {};
      if (f.nyanHiding && !f.nyanGirlfriend && !f.nyanRomanceDeclined) return nyanXml("NYAN_HIDING");
      if (f.nyanGirlfriend) return nyanXml("SHOP_CLOTHING_REPEAT_GIRLFRIEND");
      return nyanXml(f.nyanIntroduced ? "NYAN_GREETING_REPEAT" : "SHOP_CLOTHING");
    },
    getResponses: function () {
      LT.game.flags.nyanIntroduced = true;
      var f = LT.game.flags;
      if (f.nyanHiding && !f.nyanGirlfriend && !f.nyanRomanceDeclined) {
        return [
          new LT.Response("Follow", "Follow Nyan into her stockroom again and listen to what she has to say.", "nyan.hiding-end"),
          new LT.Response("Leave", "Leave her be for now.", "place.SHOPPING_ARCADE_NYANS_SHOP", function () {
            LT.game.textStart = nyanXml("NYAN_HIDING_LEAVE");
          }),
        ];
      }
      var list = [
        new LT.Response("Leave", "Leave the shop.", "place.SHOPPING_ARCADE_NYANS_SHOP"),
        new LT.Response("Female clothing", "See what female clothing Nyan has in stock.", "nyan.female"),
        new LT.Response("Male clothing", "See what male clothing Nyan has in stock.", "nyan.male"),
        new LT.Response("Unisex clothing", "See what unisex clothing Nyan has in stock.", "nyan.unisex"),
      ];
      if (f.nyanQuestComplete) {
        list.push(new LT.Response("Enchanted clothing", "See what special enchanted clothing Nyan now stocks.", "nyan.enchanted"));
      } else if (!f.nyanQuest) {
        list.push(
          new LT.Response("Enchanted clothing", "Ask Nyan if she stocks enchanted clothing. This will start Nyan's romance quest!", "nyan.enchanted-ask", function () {
            LT.game.flags.nyanQuest = "RELATIONSHIP_NYAN_1_STOCK_ISSUES";
          }),
        );
      } else if (f.nyanQuest === "RELATIONSHIP_NYAN_4_STOCK_ISSUES_SUPPLIERS_BEATEN") {
        list.push(
          new LT.Response("Report back", "Tell Nyan that you've dealt with the suppliers.", "nyan.report", function () {
            LT.game.flags.nyanQuestComplete = true;
            LT.game.flags.nyanQuest = "complete";
            LT.game.flags.nyanAffection = 30;
            LT.game.textEnd = LT.incrementMoney(5000);
          }),
        );
      } else if (f.nyanQuest === "RELATIONSHIP_NYAN_1_STOCK_ISSUES") {
        list.push(
          new LT.Response("Offer help", "Tell Nyan that you'll help her with her supplier problem.", "nyan.help", function () {
            LT.game.flags.nyanQuest = "RELATIONSHIP_NYAN_2_STOCK_ISSUES_AGREED_TO_HELP";
            LT.game.flags.nyanAffection = 10;
          }),
        );
      } else {
        list.push(new LT.Response("Report back", "Report back to Nyan once you've dealt with the suppliers.", null).disable("Nyan is still waiting for you to deal with her suppliers in the warehouse district."));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "nyan.enchanted-ask",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nyanXml("SHOP_ENCHANTED_CLOTHING");
    },
    getResponses: function () {
      return LT.getNode("nyan.shop").getResponses();
    },
  });
  LT.defineNode({
    id: "nyan.help",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nyanXml("SHOP_OFFER_HELP");
    },
    getResponses: function () {
      return LT.getNode("nyan.shop").getResponses();
    },
  });
  LT.defineNode({
    id: "nyan.report",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nyanXml("SHOP_REPORT_BACK");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Exit the store.", "place.SHOPPING_ARCADE_NYANS_SHOP", function () {
          LT.game.flags.nyanHiding = true;
          LT.game.textStart = nyanXml("NYAN_EXIT_EMBARRASSED");
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nyan.hiding-end",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nyanXml("NYAN_HIDING_END");
    },
    getResponses: function () {
      return [
        new LT.Response("Accept", "Accept Nyan's clumsy attempt at asking you out.", "nyan.girlfriend", function () {
          LT.game.flags.nyanGirlfriend = true;
          LT.game.flags.nyanHiding = false;
        }),
        new LT.Response("Decline", "Turn Nyan down.", "nyan.decline", function () {
          LT.game.flags.nyanRomanceDeclined = true;
          LT.game.flags.nyanHiding = false;
        }),
      ];
    },
  });
  LT.defineNode({
    id: "nyan.girlfriend",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nyanXml("NYAN_HIDING_END_GIRLFRIEND");
    },
    getResponses: function () {
      return [new LT.Response("Continue", "Return to the shop floor.", "nyan.shop")];
    },
  });
  LT.defineNode({
    id: "nyan.decline",
    ui: "dialogue",
    title: "Nyan's Clothing Emporium",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nyanXml("NYAN_HIDING_END_DECLINE");
    },
    getResponses: function () {
      return [new LT.Response("Continue", "Return to the shop floor.", "nyan.shop")];
    },
  });
  LT.defineNode({
    id: "nyan.enchanted",
    ui: "dialogue",
    title: "Enchanted clothing",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>Now that her supplier is delivering again, Nyan has a small rack of enchanted clothing set aside for you. Each piece costs more than the mundane equivalent.</p>";
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Return to Nyan.", "nyan.shop")];
      var ids = ["plunge_bra", "lacy_panties", "skater_dress", "heart_necklace", "thong"];
      var i;
      for (i = 0; i < ids.length; i++) {
        (function (id) {
          var item = LT.CLOTHING[id];
          if (!item) return;
          var price = Math.round(LT.clothingBuyPrice(item) * 2);
          var title = "Enchanted " + item.name + " (" + price + ")";
          if (LT.getMoney() < price) {
            list.push(new LT.Response(title, "You cannot afford that.", null).disable("You need " + price + " flames."));
          } else {
            list.push(
              new LT.Response(title, "Buy an enchanted " + item.name + ".", "nyan.enchanted", function () {
                var made = LT.makeClothing(id);
                made.enchanted = true;
                made.enchantmentKnown = true;
                made.effects = [
                  LT.itemEffect("CLOTHING", "CLOTHING_MAJOR_ATTRIBUTE", "STRENGTH", "MINOR_BOOST", 0),
                ];
                made.name = "enchanted " + made.name;
                LT.game.player.wardrobe = LT.game.player.wardrobe || [];
                LT.game.player.wardrobe.push(made);
                LT.game.textEnd = LT.incrementMoney(-price);
                LT.game.textStart = "<p>You buy the enchanted " + item.name + " for " + price + " flames.</p>";
              }),
            );
          }
        })(ids[i]);
      }
      return list;
    },
  });

  LT.defineNode({
    id: "nyan.female",
    ui: "dialogue",
    title: "Female clothing",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>Nyan nervously shows you the female clothing racks.</p>";
    },
    getResponses: function () {
      return clothingShopResponses("female", "nyan.shop");
    },
  });
  LT.defineNode({
    id: "nyan.male",
    ui: "dialogue",
    title: "Male clothing",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>Nyan shows you the male clothing racks.</p>";
    },
    getResponses: function () {
      return clothingShopResponses("male", "nyan.shop");
    },
  });
  LT.defineNode({
    id: "nyan.unisex",
    ui: "dialogue",
    title: "Unisex clothing",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>Nyan shows you the unisex clothing racks.</p>";
    },
    getResponses: function () {
      return clothingShopResponses("unisex", "nyan.shop");
    },
  });

  LT.KATE_COSMETICS_COST = 200;

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_KATES_SHOP",
    ui: "dialogue",
    title: "Succubi's Secrets",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureKate === "function") LT.ensureKate();
    },
    getContent: function () {
      return kateXml("EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!officeOpen()) {
        list.push(new LT.Response("Enter", "Succubi's Secrets is closed.", null).disable("Opening hours are 09:00–17:00."));
      } else {
        list.push(new LT.Response("Enter", "Step inside Succubi's Secrets.", "kate.shop"));
      }
      return list;
    },
  });

  function kateResponses() {
    var cost = LT.KATE_COSMETICS_COST;
    var list = [new LT.Response("Leave", "Leave the salon.", "place.SHOPPING_ARCADE_KATES_SHOP")];
    function service(title, tip, node, apply) {
      if (LT.getMoney() < cost) {
        list.push(new LT.Response(title + " (" + cost + ")", "You cannot afford that.", null).disable("Kate charges " + cost + " flames."));
      } else {
        list.push(
          new LT.Response(title + " (" + cost + ")", tip, node, function () {
            LT.game.textEnd = LT.incrementMoney(-cost);
            if (apply) apply();
          }),
        );
      }
    }
    service("Hair", "Have Kate restyle and recolour your hair.", "kate.hair", function () {
      LT.game.player.hairColour = "auburn";
    });
    service("Eyes", "Have Kate change your eye colour.", "kate.eyes", function () {
      LT.game.player.eyeColour = "amber";
    });
    service("Cosmetics", "Have Kate apply cosmetics.", "kate.cosmetics", function () {
      LT.game.player.makeup = true;
    });
    if (typeof LT.itemShopResponses === "function") {
      var extras = LT.itemShopResponses("kate", "kate.shop");
      extras.shift();
      list = list.concat(extras);
    }
    return list;
  }

  LT.defineNode({
    id: "kate.shop",
    ui: "dialogue",
    title: "Succubi's Secrets",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureKate === "function") LT.ensureKate();
    },
    getContent: function () {
      return kateXml(LT.game.flags && LT.game.flags.kateIntroduced ? "SHOP_BEAUTY_SALON_MAIN" : "SHOP_BEAUTY_SALON_ENTER");
    },
    getResponses: function () {
      LT.game.flags.kateIntroduced = true;
      return kateResponses();
    },
  });
  LT.defineNode({
    id: "kate.hair",
    ui: "dialogue",
    title: "Succubi's Secrets",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return kateXml("SHOP_BEAUTY_SALON_HAIR");
    },
    getResponses: kateResponses,
  });
  LT.defineNode({
    id: "kate.eyes",
    ui: "dialogue",
    title: "Succubi's Secrets",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return kateXml("SHOP_BEAUTY_SALON_EYES");
    },
    getResponses: kateResponses,
  });
  LT.defineNode({
    id: "kate.cosmetics",
    ui: "dialogue",
    title: "Succubi's Secrets",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return kateXml("SHOP_BEAUTY_SALON_COSMETICS");
    },
    getResponses: kateResponses,
  });

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_ASHLEYS_SHOP",
    ui: "dialogue",
    title: "Dream Lover",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureAshley === "function") LT.ensureAshley();
    },
    getContent: function () {
      return ashleyXml(officeOpen() ? "EXTERIOR" : "EXTERIOR_CLOSED");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!officeOpen()) {
        list.push(new LT.Response("Enter", "Dream Lover is closed.", null).disable("Opening hours are 09:00–17:00."));
      } else {
        list.push(new LT.Response("Enter", "Step inside Dream Lover.", "ashley.shop"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "ashley.shop",
    ui: "dialogue",
    title: "Dream Lover",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureAshley === "function") LT.ensureAshley();
    },
    getContent: function () {
      return ashleyXml(LT.game.flags && LT.game.flags.ashleyIntroduced ? "ENTRY_REPEAT" : "ENTRY");
    },
    getResponses: function () {
      LT.game.flags.ashleyIntroduced = true;
      var list = [new LT.Response("Leave", "Leave Dream Lover.", "place.SHOPPING_ARCADE_ASHLEYS_SHOP")];
      list.push(new LT.Response("Explore shelves", "Have a look at what's on the shelves.", "ashley.shelves"));
      if (typeof LT.itemShopResponses === "function") {
        var extras = LT.itemShopResponses("ashley", "ashley.shop");
        extras.shift();
        list = list.concat(extras);
      }
      return list;
    },
  });

  LT.defineNode({
    id: "place.DOMINION_WAREHOUSES",
    ui: "dialogue",
    title: "Warehouse District",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      var info = (typeof getCurrentTile === "function" && getCurrentTile() && getCurrentTile().location) || {};
      var html = "<p>" + (info.description || "The warehouse district.") + "</p>";
      if (LT.game.flags && LT.game.flags.nyanQuest === "RELATIONSHIP_NYAN_2_STOCK_ISSUES_AGREED_TO_HELP") {
        html += LT.parseFromXML("places/dominion/warehouseDistrict/kaysTextiles", "WAREHOUSE_DISTRICT_KAYS_TEXTILES");
      }
      return html;
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (LT.game.flags && LT.game.flags.nyanQuest === "RELATIONSHIP_NYAN_2_STOCK_ISSUES_AGREED_TO_HELP") {
        list.push(new LT.Response("Kay's Textiles", "Find the warehouse Nyan told you about.", "kay.entry"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "kay.entry",
    ui: "dialogue",
    title: "Kay's Textiles",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.parseFromXML("places/dominion/warehouseDistrict/kaysTextiles", "INITIAL_ENTRY");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Leave the warehouse.", "place.DOMINION_WAREHOUSES"),
        new LT.Response("Confront", "Confront the bounty hunters who have seized Kay's business.", "kay.dobermanns"),
      ];
    },
  });

  LT.defineNode({
    id: "kay.dobermanns",
    ui: "dialogue",
    title: "Overseer Station",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.parseFromXML("places/dominion/warehouseDistrict/kaysTextiles", "DOBERMANNS");
    },
    getResponses: function () {
      return [
        new LT.Response("Fight", "Fight Wolfgang and Karl.", null, function () {
          if (typeof LT.ResponseCombat === "function") {
            var thug = {
              id: "wolfgang",
              name: "Wolfgang",
              feminine: false,
              gender: LT.Gender.MALE,
              level: 8,
              physique: 24,
              speechColour: LT.Colour.MASCULINE,
              getName: function () { return "Wolfgang"; },
              getFullName: function () { return "Wolfgang"; },
              isFeminine: function () { return false; },
              getSpeechColour: function () { return this.speechColour; },
            };
            if (typeof LT.refreshVitals === "function") LT.refreshVitals(thug, true);
            LT.game.npcs = LT.game.npcs || {};
            LT.game.npcs.wolfgang = thug;
            var fight = LT.ResponseCombat("Fight", "Fight the bounty hunters.", {
              enemy: thug,
              victoryNode: "kay.victory",
              defeatNode: "place.DOMINION_WAREHOUSES",
            });
            fight.effects();
          } else {
            LT.game.flags.nyanQuest = "RELATIONSHIP_NYAN_4_STOCK_ISSUES_SUPPLIERS_BEATEN";
            LT.game.setContent("kay.victory");
          }
        }),
      ];
    },
  });

  LT.defineNode({
    id: "kay.victory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      LT.game.flags.nyanQuest = "RELATIONSHIP_NYAN_4_STOCK_ISSUES_SUPPLIERS_BEATEN";
      return LT.parseFromXML("places/dominion/warehouseDistrict/kaysTextiles", "DOBERMANNS_COMBAT_PLAYER_VICTORY");
    },
    getResponses: function () {
      return [new LT.Response("Leave", "Return to the warehouse district. You should report back to Nyan.", "place.DOMINION_WAREHOUSES")];
    },
  });

  LT.defineNode({
    id: "ashley.shelves",
    ui: "dialogue",
    title: "Dream Lover",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return ashleyXml("EXPLORE_SHELVES");
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the counter.", "ashley.shop")];
    },
  });
})();
