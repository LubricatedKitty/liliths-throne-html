(function () {
  function shopXml(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", tag);
  }

  function alleyXml(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/genericDialogue", tag);
  }

  function p(html) {
    return "<p>" + html + "</p>";
  }

  function locDesc() {
    var t = typeof getCurrentTile === "function" ? getCurrentTile() : null;
    var loc = (t && t.location) || {};
    if (loc.description) return p(loc.description);
    return p("You are in " + (loc.name || "Slaver Alley") + ".");
  }

  LT.defineNode({
    id: "place.DOMINION_SLAVER_ALLEY",
    ui: "dialogue",
    title: "Slaver Alley",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("OUTSIDE");
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.SLAVER_ALLEY_ENTRANCE",
    ui: "dialogue",
    title: "Gateway",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("GATEWAY");
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  LT.defineNode({
    id: "place.SLAVER_ALLEY_PATH",
    ui: "dialogue",
    title: "Alleyway",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("ALLEYWAY");
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });

  function genericStall(id, title) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 0,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
        if (typeof LT.maybeWorkplaceSex === "function") LT.maybeWorkplaceSex();
      },
      getContent: function () {
        var html = locDesc();
        if (LT.game.flags && LT.game.flags.workSex && typeof LT.jobSexText === "function") {
          var rec = LT.findSlave(LT.game.flags.workSex);
          if (rec) html += LT.jobSexText(rec);
        }
        return html;
      },
      getResponses: function () {
        var list = LT.travelResponses ? LT.travelResponses() : [null];
        if (typeof LT.slavePresenceResponses === "function") return LT.slavePresenceResponses(list);
        return list;
      },
    });
  }

  genericStall("place.SLAVER_ALLEY_AUCTIONING_BLOCK", "Auctioning Block");
  genericStall("place.SLAVER_ALLEY_BOUNTY_HUNTERS", "'The Rusty Collar'");
  genericStall("place.SLAVER_ALLEY_CAFE", "Cafe");
  genericStall("place.SLAVER_ALLEY_CAFE_2", "Cafe");
  genericStall("place.SLAVER_ALLEY_CAFE_3", "Cafe");
  genericStall("place.SLAVER_ALLEY_CAFE_4", "Cafe");
  genericStall("place.SLAVER_ALLEY_DESERTED_ALLEYWAY", "Deserted alleyway");
  genericStall("place.SLAVER_ALLEY_MARKET_STALL_BULK", "Zaibatsu Exchange");
  genericStall("place.SLAVER_ALLEY_MARKET_STALL_EXCLUSIVE", "Slave Rental Store");
  genericStall("place.SLAVER_ALLEY_PUBLIC_STOCKS", "Public Stocks");
  genericStall("place.SLAVER_ALLEY_STALL_ANAL", "The Rear Entrance");
  genericStall("place.SLAVER_ALLEY_STALL_FEMALES", "A Woman's Touch");
  genericStall("place.SLAVER_ALLEY_STALL_MALES", "Iron & Steel");
  genericStall("place.SLAVER_ALLEY_STALL_ORAL", "Viva Voce");
  genericStall("place.SLAVER_ALLEY_STALL_VAGINAL", "White Lilies");
  genericStall("place.SLAVER_ALLEY_STATUE", "Statue of the Fallen Angel");

  LT.defineNode({
    id: "place.SLAVER_ALLEY_SCARLETTS_SHOP",
    ui: "dialogue",
    title: "Scarlett's Shop",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
    },
    getContent: function () {
      var q = LT.game.flags && LT.game.flags.quest;
      if (q === "MAIN_1_F_SCARLETTS_FATE" || (LT.questReached && LT.questReached("MAIN_1_G_SLAVERY"))) {
        return shopXml("HELENAS_SHOP_EXTERIOR_HELENA_RETURNS");
      }
      if (!(LT.isWorkTime && LT.isWorkTime())) return shopXml("SCARLETTS_SHOP_EXTERIOR_CLOSED");
      return shopXml("SCARLETTS_SHOP_EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      var q = LT.game.flags && LT.game.flags.quest;
      if (q === "MAIN_1_F_SCARLETTS_FATE" || (LT.questReached && LT.questReached("MAIN_1_G_SLAVERY"))) {
        list.push(new LT.Response("Enter", "Enter the shop.", "helena.shop"));
        return list;
      }
      if (!(LT.isWorkTime && LT.isWorkTime())) {
        list.push(
          new LT.Response("Enter", "Scarlett's Shop is currently closed, and will re-open at six in the morning. You'll have to come back some time after then.", null).disable(
            "Scarlett's Shop is currently closed, and will re-open at six in the morning.",
          ),
        );
      } else if (q === "MAIN_1_E_REPORT_TO_HELENA") {
        list.push(new LT.Response("Enter", "You should go and find Helena before entering Scarlett's Shop again.", null).disable("You should go and find Helena before entering Scarlett's Shop again."));
      } else {
        list.push(new LT.Response("Enter", "Enter the shop.", "scarlett.shop"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "scarlett.shop",
    ui: "dialogue",
    title: "Scarlett's Shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
    },
    getContent: function () {
      if (LT.game.flags && LT.game.flags.quest === "MAIN_1_D_SLAVERY") return shopXml("SCARLETTS_SHOP_INTRO");
      return shopXml("SCARLETTS_SHOP");
    },
    getResponses: function () {
      var list = [new LT.Response("Leave", "Exit the shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
      if (LT.game.flags && LT.game.flags.quest === "MAIN_1_D_SLAVERY") {
        list.push(new LT.Response("Ask for Arthur", "Ask Scarlett if she's got a slave named Arthur for sale.", "scarlett.bitch"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "scarlett.bitch",
    ui: "dialogue",
    title: "Scarlett's Shop",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("SCARLETT_IS_A_BITCH");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Agree", "Agree to help Scarlett.", "scarlett.superBitch", function () {
          LT.game.textEnd = LT.advanceMainQuest("MAIN_1_E_REPORT_TO_HELENA");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "scarlett.superBitch",
    ui: "dialogue",
    title: "Scarlett's Shop",
    secondsPassed: 180,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("SCARLETT_IS_A_SUPER_BITCH");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your way.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  LT.defineNode({
    id: "helena.shop",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
      var h = LT.game.npcs.helena;
      var s = LT.game.npcs.scarlett;
      if (h) h.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
      if (s) s.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
    },
    getContent: function () {
      if (LT.game.flags && LT.game.flags.quest === "MAIN_1_F_SCARLETTS_FATE") return shopXml("HELENAS_SHOP_INTRODUCTION");
      if (LT.game.flags && LT.game.flags.quest === "MAIN_1_G_SLAVERY") return shopXml("HELENAS_SHOP_OFFER_SCARLETT");
      return shopXml("HELENAS_SHOP_INTRODUCTION");
    },
    getResponses: function () {
      var q = LT.game.flags && LT.game.flags.quest;
      if (q === "MAIN_1_F_SCARLETTS_FATE") {
        return [
          null,
          new LT.Response("Offer to buy", "Offer to buy Scarlett from Helena.", "helena.forSale", function () {
            if (LT.game.flags.punishedByHelena) LT.game.flags.scarlettPrice = 10000;
            else LT.game.flags.scarlettPrice = 15000;
            LT.game.textEnd = LT.advanceMainQuest("MAIN_1_G_SLAVERY");
          }),
        ];
      }
      var list = [new LT.Response("Leave", "Say goodbye to Helena and exit her shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
      if (q === "MAIN_1_G_SLAVERY") list.push(scarlettBuyResponse());
      return list;
    },
  });

  LT.defineNode({
    id: "helena.forSale",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("HELENAS_SHOP_SCARLETT_FOR_SALE");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Leave and head to the Slavery Administration for a slaver license.", "place.SLAVER_ALLEY_SCARLETTS_SHOP"),
        scarlettBuyResponse(),
      ];
    },
  });

  function scarlettBuyResponse() {
    var price = LT.scarlettPrice();
    if (!(LT.game.flags && LT.game.flags.hasSlaverLicense)) {
      return new LT.Response(
        "Buy Scarlett (" + price + ")",
        "You need to obtain a slaver license from the Slavery Administration before you can buy Scarlett!",
        null,
      ).disable("You need to obtain a slaver license from the Slavery Administration before you can buy Scarlett!");
    }
    if (LT.getMoney() < price) {
      return new LT.Response("Buy Scarlett (" + price + ")", "You don't have enough money to buy Scarlett.", null).disable(
        "You don't have enough money to buy Scarlett.",
      );
    }
    return new LT.Response("Buy Scarlett (" + price + ")", "Buy Scarlett for " + price + " flames.", "helena.buying", function () {
      LT.game.textEnd = LT.incrementMoney(-price);
    });
  }

  function purchasedScarlett(kind) {
    return function () {
      LT.game.textStart = shopXml("HELENAS_SHOP_SCARLETT_PURCHASED_" + kind);
      if (LT.game.flags.quest === "MAIN_1_G_SLAVERY") {
        LT.game.textEnd = LT.advanceMainQuest("MAIN_1_H_THE_GREAT_ESCAPE");
      }
      if (typeof LT.generateZaranixTile === "function") LT.generateZaranixTile();
    };
  }

  LT.defineNode({
    id: "helena.buying",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 180,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(String(LT.scarlettPrice()), true);
    },
    getContent: function () {
      return shopXml("HELENAS_SHOP_BUYING_SCARLETT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Calm her down", "Gently reassure Scarlett to get her to calm down.", "helena.purchased", purchasedScarlett("GENTLE")),
        new LT.Response("Shout at her", "Shout at Scarlett and remind her that she's now your property.", "helena.purchased", purchasedScarlett("SHOUT")),
        new LT.Response("Slap her", "Slap Scarlett and remind her that she's now your property.", "helena.purchased", purchasedScarlett("SLAP")),
      ];
    },
  });

  LT.defineNode({
    id: "helena.purchased",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("HELENAS_SHOP_SCARLETT_PURCHASED");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Keep her", "You decide to keep Scarlett as your slave.", "helena.keep", function () {
          LT.game.flags.keptScarlett = true;
          LT.game.flags.freedScarlett = false;
          if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
          if (typeof LT.takeOwnership === "function") LT.takeOwnership(LT.game.npcs.scarlett);
        }),
        new LT.Response("Free her", "You decide to grant Scarlett her freedom.", "helena.free", function () {
          LT.game.flags.freedScarlett = true;
          LT.game.flags.keptScarlett = false;
          if (typeof LT.ownedSlaves === "function") {
            LT.game.flags.ownedSlaves = LT.ownedSlaves().filter(function (s) {
              return s.id !== "scarlett" && s.src !== "scarlett";
            });
          }
          if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.keep",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 180,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("HELENAS_SHOP_BUYING_SCARLETT_KEEP_HER");
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "Exit the shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  LT.defineNode({
    id: "helena.free",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 180,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("HELENAS_SHOP_BUYING_SCARLETT_FREE_HER");
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "Exit the shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  function adminXml(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/slaveryAdministration", tag);
  }

  function adminExteriorResponses() {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    list.push(new LT.Response("Enter", "Step inside the 'Slavery Administration' building.", "admin.inside"));
    if (LT.game.currentNode && LT.game.currentNode.id === "admin.posters") {
      list.push(new LT.Response("Posters", "You're already taking a closer look at the posters...", null).disable("You're already taking a closer look at the posters..."));
    } else {
      list.push(new LT.Response("Posters", "Take a closer look at the posters which are plastered over the wall of the Slavery Administration building.", "admin.posters"));
    }
    return list;
  }

  function adminLicenseResponses() {
    var list = [new LT.Response("Leave", "Step back outside.", "place.SLAVER_ALLEY_SLAVERY_ADMINISTRATION", function () {
      LT.game.flags.finchIntroduced = true;
    })];
    if (LT.game.flags && LT.game.flags.hasSlaverLicense) {
      list.push(new LT.Response("Trade", "Buy slavery-related items.", "finch.trade"));
      var waiting = typeof LT.pendingSlaves === "function" ? LT.pendingSlaves() : [];
      if (waiting.length) {
        list.push(new LT.Response("Collect slaves (" + waiting.length + ")", "Collect the slaves waiting here after being collared.", "finch.collect"));
      }
      var owned = typeof LT.ownedSlaves === "function" ? LT.ownedSlaves() : [];
      if (owned.length) {
        list.push(new LT.Response("Slave Manager", "Review the slaves you own.", "finch.slaves"));
      } else {
        list.push(new LT.Response("Slave Manager", "You do not own any slaves yet.", null).disable("You do not own any slaves yet."));
      }
      return list;
    }
    if (!(LT.game.flags && LT.game.flags.slaveryQuest)) {
      list.push(
        new LT.Response("Slaver license", "Ask Finch about obtaining a slaver license.", "admin.askLicense", function () {
          LT.game.flags.finchIntroduced = true;
          LT.game.textEnd = LT.startSlaveryQuest();
        }),
      );
      return list;
    }
    var cost = LT.SLAVER_LICENSE_COST;
    if (LT.game.flags.slaveryQuest === "SIDE_SLAVER_RECOMMENDATION_OBTAINED") {
      if (LT.getMoney() >= cost) {
        list.push(
          new LT.Response(
            "Present letter (" + cost + ")",
            "Show Finch the letter of recommendation you obtained from Lilaya, and then pay " + cost + " flames to obtain a slaver license.",
            "admin.licenseObtained",
            function () {
              LT.game.textEnd = LT.incrementMoney(-cost);
            },
          ),
        );
      } else {
        list.push(
          new LT.Response("Present letter (" + cost + ")", "You don't have enough money to buy a slaver license! You need at least " + cost + " flames.", null).disable(
            "You don't have enough money to buy a slaver license! You need at least " + cost + " flames.",
          ),
        );
      }
    } else {
      list.push(
        new LT.Response("Present letter (" + cost + ")", "You need to obtain a letter of recommendation from Lilaya first!", null).disable(
          "You need to obtain a letter of recommendation from Lilaya first!",
        ),
      );
    }
    return list;
  }

  LT.defineNode({
    id: "place.SLAVER_ALLEY_SLAVERY_ADMINISTRATION",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureFinch === "function") LT.ensureFinch();
    },
    getContent: function () {
      return adminXml("SLAVERY_ADMINISTRATION_EXTERIOR");
    },
    getResponses: adminExteriorResponses,
  });

  LT.defineNode({
    id: "admin.posters",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return adminXml("SLAVERY_ADMINISTRATION_POSTERS");
    },
    getResponses: adminExteriorResponses,
  });

  LT.defineNode({
    id: "admin.inside",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureFinch === "function") LT.ensureFinch();
    },
    getContent: function () {
      return adminXml("SLAVERY_ADMINISTRATION");
    },
    getResponses: adminLicenseResponses,
  });

  LT.defineNode({
    id: "admin.askLicense",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return adminXml("SLAVERY_ADMINISTRATION_ASK_ABOUT_SLAVER_LICENSE");
    },
    getResponses: adminLicenseResponses,
  });

  LT.defineNode({
    id: "admin.licenseObtained",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return adminXml("SLAVERY_ADMINISTRATION_SLAVER_LICENSE_OBTAINED");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Rules", "Allow Finch to explain the rules to you.", "admin.rules", function () {
          LT.game.flags.hasSlaverLicense = true;
          LT.game.textEnd = LT.advanceSlaveryQuest("complete");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "admin.rules",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return adminXml("SLAVERY_ADMINISTRATION_SLAVER_LICENSE_OBTAINED_RULES");
    },
    getResponses: adminLicenseResponses,
  });

  LT.defineNode({
    id: "finch.trade",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.itemShopHtml(
        "finch",
        "<p>Finch shows you the slavery supplies he keeps behind the counter. Metal collars are what you'll need if you intend to bring alley criminals in.</p>",
      );
    },
    getResponses: function () {
      return LT.itemShopResponses("finch", "admin.inside");
    },
  });

  LT.defineNode({
    id: "finch.collect",
    ui: "dialogue",
    title: "Slavery Administration",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var wait = LT.pendingSlaves();
      if (!wait.length) return "<p>There are no slaves waiting to be collected.</p>";
      var html = "<p>The following slaves were teleported here after you collared them, and are waiting for you to formally take ownership.</p><ul>";
      var i;
      for (i = 0; i < wait.length; i++) {
        html += "<li><b>" + wait[i].name + "</b>, " + (wait[i].fullRace || wait[i].raceName) + "</li>";
      }
      html += "</ul>";
      return html;
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Return to Finch.", "admin.inside")];
      var wait = LT.pendingSlaves();
      var i;
      for (i = 0; i < wait.length; i++) {
        (function (index) {
          var rec = wait[index];
          list.push(
            new LT.Response("Collect " + rec.name, "Take ownership of " + rec.name + ".", "finch.collect", function () {
              LT.collectPendingSlave(index);
              LT.game.textStart = "<p>You sign for <b>" + rec.name + "</b>. They are now your slave.</p>";
            }),
          );
        })(i);
      }
      return list;
    },
  });

  LT.defineNode({
    id: "finch.slaves",
    ui: "dialogue",
    title: "Your slaves",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var owned = LT.ownedSlaves();
      if (!owned.length) return "<p>You do not own any slaves.</p>";
      var html = "<p>These are the slaves currently registered to you.</p><ul>";
      var i;
      for (i = 0; i < owned.length; i++) {
        html += "<li><b>" + owned[i].name + "</b> — " + (owned[i].fullRace || owned[i].raceName) + " (collared)</li>";
      }
      html += "</ul>";
      return html;
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Return to Finch.", "admin.inside")];
      var owned = typeof LT.ownedSlaves === "function" ? LT.ownedSlaves() : [];
      var i;
      for (i = 0; i < owned.length; i++) {
        (function (s) {
          list.push(
            new LT.Response(s.name, "Inspect " + s.name + ".", "house.slave", function () {
              LT.game.flags.manageSlaveId = s.id;
              LT.game.flags.slaveMenuFrom = "finch.slaves";
            }),
          );
        })(owned[i]);
      }
      return list;
    },
  });
})();
