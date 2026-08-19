(function () {
  function rom(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/helenaRomance", tag);
  }
  function shopXml(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", tag);
  }
  function diy(tag) {
    return LT.parseFromXML("places/dominion/homeImprovements/generic", tag);
  }
  function alleyXml(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/genericDialogue", tag);
  }

  function romance() {
    return (LT.game.flags && LT.game.flags.helenaRomance) || "";
  }

  function dayNow() {
    return typeof LT.dayNumber === "function" ? LT.dayNumber() : 1;
  }

  function goneHome() {
    return !!(LT.game.flags && LT.game.flags.helenaGoneHome === dayNow());
  }

  function sendHome() {
    LT.game.flags.helenaGoneHome = dayNow();
    var h = LT.game.npcs && LT.game.npcs.helena;
    if (h) h.location = null;
  }

  function helenaAtShop() {
    if (goneHome()) return false;
    if (!(LT.isWorkTime && LT.isWorkTime())) return false;
    return !!(LT.questReached && LT.questReached("MAIN_1_F_SCARLETTS_FATE"));
  }

  function hasItem(id) {
    return typeof LT.countItems === "function" && LT.countItems(LT.game.player, id) > 0;
  }

  function giveItem(id) {
    if (typeof LT.addItem === "function") LT.addItem(LT.game.player, id);
    var spec = LT.ITEMS && LT.ITEMS[id];
    return "<p style='text-align:center;'>You obtained <b>" + ((spec && spec.name) || id) + "</b>!</p>";
  }

  function takeItem(id) {
    if (typeof LT.removeItemById === "function") LT.removeItemById(LT.game.player, id);
  }

  function aff(npc, amount) {
    return typeof LT.incrementAffection === "function" ? LT.incrementAffection(npc, amount) : "";
  }

  function scarlettOwned() {
    return !!(LT.game.flags && LT.game.flags.keptScarlett);
  }

  function scarlettHere() {
    var s = LT.game.npcs && LT.game.npcs.scarlett;
    return !!(s && s.location && s.location.place === "SLAVER_ALLEY_SCARLETTS_SHOP");
  }

  function needsTf() {
    var s = LT.game.npcs && LT.game.npcs.scarlett;
    return !!(s && (!s.isFeminine || !s.isFeminine()));
  }

  function sexResponse(title, tip, opts) {
    if (typeof LT.ResponseSex === "function") return LT.ResponseSex(title, tip, opts);
    return new LT.Response(title, tip, opts.postSexNode || "sex.scene").withColour(LT.Colour.ATTRIBUTE_LUST);
  }

  function leaveShop() {
    return new LT.Response("Leave", "Say goodbye to Helena and exit her shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP");
  }

  function romanceCoreContent() {
    var step = romance();
    if (step === "ROMANCE_HELENA_1_OFFER_HELP") return shopXml("HELENAS_SHOP") + rom("ROMANCE_SHOP_CORE_1");
    if (step === "ROMANCE_HELENA_2_PURCHASE_PAINT") {
      return rom("ROMANCE_SHOP_CORE_2") + rom(hasItem("innoxia_quest_paint_can_premium") || hasItem("innoxia_quest_paint_can") ? "ROMANCE_SHOP_CORE_2_PAINT" : "ROMANCE_SHOP_CORE_2_NO_PAINT");
    }
    if (step === "ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR" || step === "ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR") return rom("ROMANCE_SHOP_CORE_3_PAINT_EXTERIOR");
    if (step === "ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR") return rom("ROMANCE_SHOP_CORE_3_PAINT_SIGN");
    if (step === "ROMANCE_HELENA_4_SCARLETTS_RETURN") {
      if (scarlettOwned()) return rom(scarlettHere() ? "ROMANCE_SHOP_CORE_4_SCARLETT_OWNED_PRESENT" : "ROMANCE_SHOP_CORE_4_SCARLETT_OWNED_NOT_PRESENT");
      return rom(scarlettHere() ? "ROMANCE_SHOP_CORE_4_SCARLETT" : "ROMANCE_SHOP_CORE_4_NO_SCARLETT");
    }
    if (step === "ROMANCE_HELENA_5_SCARLETT_TRAINER") return rom("ROMANCE_SHOP_CORE_5") + rom("ROMANCE_SHOP_CORE_5_NO_ITEMS") + rom("ROMANCE_SHOP_CORE_5_END");
    if (step === "complete") {
      if (typeof LT.helenaShopCompleteContent === "function") return LT.helenaShopCompleteContent();
      return rom("ROMANCE_SHOP_CORE_5");
    }
    return shopXml("HELENAS_SHOP");
  }

  function romanceCoreResponses() {
    var step = romance();
    var list = [];
    if (
      !hasItem("innoxia_quest_paint_can") &&
      !hasItem("innoxia_quest_paint_can_premium") &&
      step !== "ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR" &&
      step !== "ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR" &&
      step !== "ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR" &&
      step !== "ROMANCE_HELENA_4_SCARLETTS_RETURN" &&
      step !== "ROMANCE_HELENA_5_SCARLETT_TRAINER"
    ) {
      list.push(leaveShop());
    }
    if (step === "ROMANCE_HELENA_1_OFFER_HELP") {
      list.push(new LT.Response("Offer help", "Tell Helena that you'd be willing to provide whatever help she needs in order to improve her business.", "helena.offerHelp"));
    }
    if (step === "ROMANCE_HELENA_2_PURCHASE_PAINT") {
      if (hasItem("innoxia_quest_paint_can_premium")) {
        list.push(
          new LT.Response("Paint", "Show Helena the 'Purple-star' can of golden paint which she asked for.", "helena.paint", function () {
            LT.game.textStart = rom("ROMANCE_PAINT_PREMIUM");
            takeItem("innoxia_quest_paint_can_premium");
            LT.game.textEnd = aff(LT.ensureHelena(), 5) + LT.advanceHelenaRomance("ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR");
          }),
        );
      } else if (hasItem("innoxia_quest_paint_can")) {
        list.push(
          new LT.Response("Paint", "Show Helena the can of 'Bronze-star' golden paint, and hope that she doesn't notice that it's not the exact one she asked for...", "helena.paint", function () {
            LT.game.flags.helenaCheapPaint = true;
            LT.game.textStart = rom("ROMANCE_PAINT_STANDARD");
            takeItem("innoxia_quest_paint_can");
            LT.game.textEnd = aff(LT.ensureHelena(), -5) + LT.advanceHelenaRomance("ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR");
          }),
        );
      } else {
        list.push(new LT.Response("Paint", "You haven't yet purchased the golden paint which Helena asked for...", null).disable("You haven't yet purchased the golden paint which Helena asked for..."));
      }
    }
    if (step === "ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR") {
      list.push(
        new LT.Response("Strip paint", "Do as Helena ordered and strip all the old, peeling paint from the store's frontage.", "helena.paintA", function () {
          LT.game.textEnd = LT.advanceHelenaRomance("ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR");
        }),
      );
    }
    if (step === "ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR") {
      list.push(new LT.Response("Paint frontage", "Do as Helena ordered and paint the entire frontage in a fresh new coat of white paint.", "helena.paintB"));
    }
    if (step === "ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR") {
      list.push(new LT.Response("Take paint", "Do as Helena instructs and take the golden paint outside.", "helena.paintC"));
    }
    if (step === "ROMANCE_HELENA_4_SCARLETTS_RETURN") {
      if (scarlettOwned() && !scarlettHere()) {
        list.push(new LT.Response("Leave", "Do as Helena says and leave her shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP"));
      } else if (scarlettHere() && !scarlettOwned()) {
        list.push(
          new LT.Response("Agree", "Tell Helena that you'll return tomorrow.", "helena.scarlettDelivered", function () {
            LT.game.textEnd = rom("ROMANCE_SCARLETT_DELIVERED_END") + aff(LT.ensureHelena(), 5) + LT.advanceHelenaRomance("ROMANCE_HELENA_5_SCARLETT_TRAINER");
          }),
        );
      } else if (scarlettOwned() && scarlettHere()) {
        var price = LT.scarlettPrice();
        list.push(
          new LT.Response("Sell Scarlett (" + price + ")", "Sell Scarlett back to Helena for " + price + ".", "helena.scarlettDelivered", function () {
            deliverScarlett(true);
          }),
        );
        list.push(
          new LT.Response("Give Scarlett", "Give Scarlett back to Helena and do not accept the " + price + " she's offering you.", "helena.scarlettDelivered", function () {
            deliverScarlett(false);
          }),
        );
        list.push(
          new LT.Response("Refuse", "Refuse to sell Scarlett to Helena.<br/>This will fail the quest.", "helena.romanceFailed", function () {
            LT.game.textEnd = aff(LT.ensureHelena(), -100) + LT.advanceHelenaRomance("failed");
            var h = LT.ensureHelena();
            if (h) h.location = { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" };
          }),
        );
      } else {
        list.push(new LT.Response("Leave", "Do as Helena says and leave her shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP"));
      }
    }
    if (step === "ROMANCE_HELENA_5_SCARLETT_TRAINER") {
      list.push(new LT.Response("Follow", "Do as Helena asks and follow her into the back room.", "helena.potions"));
    }
    if (step === "complete") {
      list.push(leaveShop());
      if (typeof LT.helenaCustomSlaveResponse === "function") list.push(LT.helenaCustomSlaveResponse());
      if (LT.game.flags.helenaShopTalkedTo === dayNow()) {
        list.push(new LT.Response("Talk", "You've already spent some time talking to Helena today...", null).disable("You've already spent some time talking to Helena today..."));
      } else {
        list.push(
          new LT.Response("Talk", "Ask Helena how her business is going.", "helena.shopTalk", function () {
            LT.game.flags.helenaShopTalkedTo = dayNow();
            LT.game.textEnd = aff(LT.ensureHelena(), 2);
          }),
        );
      }
      if (typeof LT.helenaDateResponse === "function") list.push(LT.helenaDateResponse());
    }
    return list.length ? list : [leaveShop()];
  }

  function deliverScarlett(paid) {
    var price = LT.scarlettPrice();
    LT.game.flags.keptScarlett = false;
    LT.game.flags.freedScarlett = false;
    LT.game.flags.helenaScarlettToldToReturn = true;
    if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(String(price), true);
    var html = rom(paid ? "ROMANCE_SCARLETT_SOLD" : "ROMANCE_SCARLETT_GIVEN_AWAY") + rom("ROMANCE_SCARLETT_SOLD_REACTION") + rom(needsTf() ? "ROMANCE_SCARLETT_NEEDING_TF" : "ROMANCE_SCARLETT_NO_TF_NEEDED") + rom("ROMANCE_SCARLETT_DELIVERED_END");
    LT.game.textStart = html;
    LT.game.textEnd = (paid ? LT.incrementMoney(price) : "") + aff(LT.ensureHelena(), paid ? 5 : 15) + LT.advanceHelenaRomance("ROMANCE_HELENA_5_SCARLETT_TRAINER");
  }

  LT.helenaShopExteriorHtml = function () {
    var q = LT.game.flags && LT.game.flags.quest;
    var step = romance();
    if (q === "MAIN_1_F_SCARLETTS_FATE") return shopXml("HELENAS_SHOP_EXTERIOR_HELENA_RETURNS");
    if (step === "failed") return shopXml("HELENAS_SHOP_EXTERIOR_ROMANCE_FAILED");
    var html = "";
    if (step === "ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR" || step === "ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR" || step === "ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR") {
      html = shopXml("HELENAS_SHOP_EXTERIOR_PAINTING");
      if (goneHome()) html += shopXml("HELENAS_SHOP_EXTERIOR_GONE_HOME");
      else html += shopXml(helenaAtShop() ? "HELENAS_SHOP_EXTERIOR_PAINTING_OPEN" : "HELENAS_SHOP_EXTERIOR_PAINTING_CLOSED");
      return html;
    }
    if (step && step !== "ROMANCE_HELENA_1_OFFER_HELP" && step !== "ROMANCE_HELENA_2_PURCHASE_PAINT" && step !== "complete") {
      html = shopXml("HELENAS_SHOP_EXTERIOR_PAINTED");
      if (goneHome()) html += shopXml("HELENAS_SHOP_EXTERIOR_GONE_HOME");
      else html += shopXml(helenaAtShop() ? "HELENAS_SHOP_EXTERIOR_PAINTED_OPEN" : "HELENAS_SHOP_EXTERIOR_PAINTED_CLOSED");
      return html;
    }
    if (step === "complete") return shopXml(helenaAtShop() ? "HELENAS_SHOP_EXTERIOR_FINISHED_OPEN" : "HELENAS_SHOP_EXTERIOR_FINISHED_CLOSED");
    if (LT.questReached && LT.questReached("MAIN_1_F_SCARLETTS_FATE")) {
      return shopXml("HELENAS_SHOP_EXTERIOR") + shopXml(helenaAtShop() ? "HELENAS_SHOP_EXTERIOR_OPEN" : "HELENAS_SHOP_EXTERIOR_CLOSED");
    }
    if (!(LT.isWorkTime && LT.isWorkTime())) return shopXml("SCARLETTS_SHOP_EXTERIOR_CLOSED");
    return shopXml("SCARLETTS_SHOP_EXTERIOR");
  };

  LT.helenaShopEnterResponse = function () {
    var q = LT.game.flags && LT.game.flags.quest;
    var step = romance();
    if (step === "failed") return null;
    if (q === "MAIN_1_F_SCARLETTS_FATE" || q === "MAIN_1_G_SLAVERY") {
      return new LT.Response("Enter", "Enter the shop.", "helena.shop");
    }
    if (q === "MAIN_1_E_REPORT_TO_HELENA") {
      return new LT.Response("Enter", "You should go and find Helena before entering Scarlett's Shop again.", null).disable("You should go and find Helena before entering Scarlett's Shop again.");
    }
    if (LT.questReached && LT.questReached("MAIN_1_H_THE_GREAT_ESCAPE")) {
      if (!helenaAtShop()) {
        return new LT.Response("Enter", "Helena's shop is currently closed, and will re-open at nine in the morning. You'll have to come back some time after then.", null).disable(
          "Helena's shop is currently closed, and will re-open at nine in the morning.",
        );
      }
      return new LT.Response("Enter", "Enter the shop.", step ? "helena.romanceShop" : "helena.shop");
    }
    if (!(LT.isWorkTime && LT.isWorkTime())) {
      return new LT.Response("Enter", "Scarlett's Shop is currently closed, and will re-open at six in the morning.", null).disable("Scarlett's Shop is currently closed, and will re-open at six in the morning.");
    }
    return new LT.Response("Enter", "Enter the shop.", "scarlett.shop");
  };

  LT.defineNode({
    id: "helena.romanceShop",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
      var h = LT.game.npcs.helena;
      if (h && helenaAtShop()) h.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
    },
    getContent: romanceCoreContent,
    getResponses: romanceCoreResponses,
  });

  LT.defineNode({
    id: "helena.business",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_BUSINESS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Thank her", "Perhaps she's waiting for you to thank her?", "helena.businessFollow", function () {
          LT.game.textStart = rom("ROMANCE_BUSINESS_THANK_HER");
          LT.game.textEnd = aff(LT.ensureHelena(), 5) + LT.startHelenaRomance();
        }),
        new LT.Response("Prompt her", "Tell her to get on with it then.", "helena.businessFollow", function () {
          LT.game.textStart = rom("ROMANCE_BUSINESS_PROMPT_HER");
          LT.game.textEnd = aff(LT.ensureHelena(), -5) + LT.startHelenaRomance();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.businessFollow",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_BUSINESS_FOLLOWUP");
    },
    getResponses: romanceCoreResponses,
  });

  LT.defineNode({
    id: "helena.offerHelp",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_OFFER_HELP");
    },
    getResponses: function () {
      var money = LT.getMoney();
      var pay;
      if (money >= 10000) {
        pay = new LT.Response("Pay (10000)", "Pay Helena the ten thousand flames which she's asking for.", "helena.offerPay", function () {
          LT.game.textStart = rom("ROMANCE_OFFER_HELP_PAY");
          LT.game.textEnd = LT.incrementMoney(-10000) + aff(LT.ensureHelena(), 5);
        });
      } else if (money > 0) {
        pay = new LT.Response("Pay (" + money + ")", "Tell Helena that you don't have ten thousand flames, so cannot pay her.", "helena.offerPay", function () {
          if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(String(LT.getMoney()), true);
          LT.game.textStart = rom("ROMANCE_OFFER_HELP_PAY_REDUCED");
          LT.game.textEnd = LT.incrementMoney(-LT.getMoney());
        });
      } else {
        pay = new LT.Response("Cannot pay", "Tell Helena that you don't have any flames on you at all, so cannot pay her.", "helena.offerPay", function () {
          LT.game.textStart = rom("ROMANCE_OFFER_HELP_CANNOT_PAY");
          LT.game.textEnd = aff(LT.ensureHelena(), -5);
        });
      }
      return [
        null,
        pay,
        new LT.Response("Refuse", "Tell Helena that she's being extremely unreasonable; she's the one who should be paying you!", "helena.offerPay", function () {
          LT.game.textStart = rom("ROMANCE_OFFER_HELP_REFUSE_TO_PAY");
          LT.game.textEnd = aff(LT.ensureHelena(), -10);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.offerPay",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_OFFER_HELP_PAYMENT");
    },
    getResponses: function () {
      return [null, new LT.Response("Supplies", "Do as Helena commands and fetch the box of supplies.", "helena.supplies")];
    },
  });

  LT.defineNode({
    id: "helena.supplies",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_OFFER_HELP_FETCH_SUPPLIES");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Wait", "Wait for Helena to find what it is she's looking for.", "helena.waitPaint", function () {
          LT.game.textEnd = LT.advanceHelenaRomance("ROMANCE_HELENA_2_PURCHASE_PAINT");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.waitPaint",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.addSpecialParse === "function") {
        LT.addSpecialParse("1500", true);
        LT.addSpecialParse("250", false);
      }
    },
    getContent: function () {
      return rom("ROMANCE_OFFER_HELP_WAIT");
    },
    getResponses: romanceCoreResponses,
  });

  LT.defineNode({
    id: "helena.paint",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendHome();
    },
    getContent: function () {
      return rom("ROMANCE_PAINT");
    },
    getResponses: romanceCoreResponses,
  });

  LT.defineNode({
    id: "helena.paintA",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 14400,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendHome();
    },
    getContent: function () {
      return rom("ROMANCE_PAINTING_1");
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "You'll have to wait until tomorrow before continuing with your work...", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  LT.defineNode({
    id: "helena.paintB",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 14400,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendHome();
      if (typeof LT.ensureNatalya === "function") LT.ensureNatalya();
    },
    getContent: function () {
      return rom("ROMANCE_PAINTING_2");
    },
    getResponses: function () {
      return [null, new LT.Response("Introduction", "Introduce yourself as the person this succubus is looking for, and then proceed to take delivery of the furniture.", "helena.delivery")];
    },
  });

  LT.defineNode({
    id: "helena.delivery",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_FURNITURE_DELIVERY");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Wait", "Don't offer any help, and instead stand back and wait for the centaurs to be done with their task.", "helena.deliveryNext", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_NEXT_NO_HELP");
        }),
        new LT.Response("Offer help", "Ask Natalya if there's anything you can do to help.", "helena.deliveryNext", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_NEXT_HELP");
          LT.game.textEnd = aff(LT.ensureNatalya(), 5);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.deliveryNext",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_NEXT");
    },
    getResponses: function () {
      var follow;
      if (LT.isAnalContentEnabled && !LT.isAnalContentEnabled()) {
        follow = new LT.Response("Follow", "Natalya's scenes involve anal content, and as such will be disabled for as long as your 'Anal Content' setting is turned off.", null).disable(
          "Natalya's scenes involve anal content, and as such will be disabled for as long as your 'Anal Content' setting is turned off.",
        );
      } else {
        follow = new LT.Response("Follow", "Follow Natalya down the alleyway and see what she's up to.", "helena.deliveryFollow");
      }
      return [
        null,
        new LT.Response("Remain", "Wait next to the cart for Natalya to return.", "helena.deliveryEnd", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_WAIT");
        }),
        follow,
      ];
    },
  });

  LT.defineNode({
    id: "helena.deliveryFollow",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_FOLLOW");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Turn around and leave Natalya to get herself off without your help.", "helena.deliveryEnd", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_FOLLOW_LEAVE");
          LT.game.textEnd = aff(LT.ensureNatalya(), -5);
        }),
        new LT.Response("Submit", "Do as the dominant succubus commands, and after calling her 'Mistress', kneel down before her...", "helena.deliverySubmit", function () {
          LT.game.flags.playerSubmittedToNatalya = true;
          LT.game.textEnd = aff(LT.ensureNatalya(), 5);
        }).withColour(LT.Colour.ATTRIBUTE_LUST),
      ];
    },
  });

  LT.defineNode({
    id: "helena.deliverySubmit",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_FOLLOW_SUBMIT");
    },
    getResponses: function () {
      return [
        null,
        sexResponse("Start stroking", "Do as Mistress Natalya commands and start stroking her thick horse-like cock.", {
          partner: LT.ensureNatalya(),
          playerDom: false,
          consensual: true,
          startText: rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_FOLLOW_SUBMIT_START_SEX"),
          postSexNode: "helena.deliveryPostSex",
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.deliveryPostSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_FOLLOW_SUBMIT_POST_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Follow", "Follow Mistress Natalya to see if the two centaurs have finished unpacking the furniture yet.", "helena.deliveryEnd", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_FOLLOW_SUBMIT_POST_SEX_FOLLOW");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.deliveryEnd",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.textEnd = LT.advanceHelenaRomance("ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR");
    },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Lock up", "Lock up the store and prepare to leave.", "helena.lockUp")];
    },
  });

  LT.defineNode({
    id: "helena.lockUp",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_FURNITURE_DELIVERY_END_LOCK_UP");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your way out into Slaver Alley.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  LT.defineNode({
    id: "helena.paintC",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_C");
    },
    getResponses: function () {
      return [null, new LT.Response("Paint sign", "Under the close supervision of Helena, use the golden paint you purchased to paint the words 'Helena's Boutique' over the shop's entrance.", "helena.paintSign")];
    },
  });

  LT.defineNode({
    id: "helena.paintSign",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 1800,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_C_PAINT_SIGN");
    },
    getResponses: function () {
      return [null, new LT.Response("Follow", "Follow Helena back into her store.", "helena.paintFinished")];
    },
  });

  LT.defineNode({
    id: "helena.paintFinished",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_C_FINISHED");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Make tea", "Do as Helena says and make some tea for the two of you.", "helena.paintScarlett", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_C_FINISHED_TEA");
          LT.game.textEnd = aff(LT.ensureHelena(), 5);
        }),
        new LT.Response("Refuse", "Refuse to make Helena some tea, and instead bluntly ask her if there's anything else she requires of you.", "helena.paintScarlett", function () {
          LT.game.textStart = rom("ROMANCE_PAINTING_C_FINISHED_NO_TEA");
          LT.game.textEnd = aff(LT.ensureHelena(), -5);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.paintScarlett",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_PAINTING_C_FINISHED_SCARLETT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Read", "Read the letter which Helena just handed to you.", "helena.letter", function () {
          LT.game.textEnd = LT.advanceHelenaRomance("ROMANCE_HELENA_4_SCARLETTS_RETURN");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.letter",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(String(LT.scarlettPrice()), true);
    },
    getContent: function () {
      return rom("ROMANCE_PAINTING_C_FINISHED_LETTER");
    },
    getResponses: romanceCoreResponses,
  });

  LT.defineNode({
    id: "helena.scarlettDelivered",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendHome();
      var s = LT.game.npcs && LT.game.npcs.scarlett;
      if (s) s.location = null;
    },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "Now that Helena and Scarlett have departed, there's nothing for you to do except leave...", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  LT.defineNode({
    id: "helena.romanceFailed",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return shopXml("HELENAS_SHOP_EXTERIOR_ROMANCE_FAILED");
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "Leave the empty shop.", "place.SLAVER_ALLEY_SCARLETTS_SHOP")];
    },
  });

  LT.defineNode({
    id: "helena.potions",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_5_POTIONS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave her", "Tell Helena that it would be best not to transform Scarlett.", "helena.potionsNext", function () {
          LT.game.textStart = rom("ROMANCE_5_POTIONS_SCARLETT_NO_TF");
        }),
        new LT.Response("Transform her", "Tell Helena that transforming Scarlett into a female harpy would be best for her.", "helena.potionsNext", function () {
          if (typeof LT.feminiseScarlett === "function") LT.feminiseScarlett();
          LT.game.textStart = rom("ROMANCE_5_POTIONS_SCARLETT_FEMALE");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.potionsNext",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Follow", "Follow Helena back out into the store.", "helena.posters")];
    },
  });

  LT.defineNode({
    id: "helena.posters",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_ADVERTISING_POSTERS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Compliment", "Compliment Helena on how beautiful she looks on the posters.", "helena.postersEnd", function () {
          LT.game.textStart = rom("ROMANCE_ADVERTISING_POSTERS_COMPLIMENT");
          LT.game.textEnd = aff(LT.ensureHelena(), 5);
        }),
        new LT.Response("Question", "Agree with Scarlett and question how these posters are supposed to advertise the business.", "helena.postersEnd", function () {
          LT.game.textStart = rom("ROMANCE_ADVERTISING_POSTERS_QUESTION");
          LT.game.textEnd = aff(LT.ensureHelena(), -5);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.postersEnd",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.textEnd = giveItem("innoxia_quest_rolled_up_posters") + LT.advanceHelenaRomance("ROMANCE_HELENA_6_ADVERTISING") + LT.incrementMoney(100);
    },
    getContent: function () {
      return rom("ROMANCE_ADVERTISING_POSTERS_END");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Having received your orders from Helena, you're ready to set out into Slaver Alley and put up these posters.", "place.SLAVER_ALLEY_ENTRANCE", function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("SLAVER_ALLEY", "SLAVER_ALLEY_ENTRANCE");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.posters",
    ui: "dialogue",
    title: "Gateway",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("GATEWAY_POSTER_PERMISSION");
    },
    getResponses: function () {
      var money = LT.getMoney();
      var pay = new LT.Response("Pay (100)", "Pay the guards the hundred flames they're asking for.", "alley.postersPaid", function () {
        takeItem("innoxia_quest_rolled_up_posters");
        LT.game.textStart = alleyXml("GATEWAY_POSTER_PERMISSION_PAID") + alleyXml("GATEWAY_POSTER_PERMISSION_END");
        LT.game.textEnd = LT.incrementMoney(-100);
        var s = LT.ensureScarlett();
        if (s) s.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_ENTRANCE" };
      });
      if (money < 100) pay.disable("You don't have a hundred flames.");
      return [null, pay];
    },
  });

  LT.defineNode({
    id: "alley.postersPaid",
    ui: "dialogue",
    title: "Gateway",
    secondsPassed: 120,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Return", "Scarlett leads you back to Helena's shop.", "helena.afterPosters")];
    },
  });

  LT.defineNode({
    id: "helena.afterPosters",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.enterWorld === "function") LT.enterWorld("SLAVER_ALLEY", "SLAVER_ALLEY_SCARLETTS_SHOP");
    },
    getContent: function () {
      return rom("ROMANCE_RETURN_AFTER_POSTERS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Follow", "Follow Helena throughout the store to see what she needs you and Scarlett to have done by tomorrow.", "helena.prepFollow", function () {
          LT.game.textStart = rom("ROMANCE_7_FOLLOW");
          LT.game.textEnd = LT.advanceHelenaRomance("ROMANCE_HELENA_7_GRAND_OPENING_PREPARATION");
          sendHome();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.prepFollow",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 1800,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Start work", "There's not much to do except get to work...", "helena.prepStart")];
    },
  });

  LT.defineNode({
    id: "helena.prepStart",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 1800,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_START");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Ask nicely", "Kindly ask Scarlett to help clean the shop with you.", "helena.prepWork", function () {
          LT.game.textStart = rom("ROMANCE_7_WORKING_ASK_NICELY");
          LT.game.textEnd = aff(LT.ensureScarlett(), 10);
        }),
        new LT.Response("Scold her", "Scold Scarlett for always causing a nuisance and order her to help.", "helena.prepWork", function () {
          LT.game.textStart = rom("ROMANCE_7_WORKING_SCOLDING");
          LT.game.textEnd = aff(LT.ensureScarlett(), -5);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.prepWork",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 14400,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_WORKING");
    },
    getResponses: function () {
      return [null, new LT.Response("Put up decorations", "Get started on putting up the decorations.", "helena.prepDecor")];
    },
  });

  LT.defineNode({
    id: "helena.prepDecor",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(60) : 60) * 60;
    },
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_DECORATIONS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Decline", "Turn down the offer of whiskey from Scarlett.", "helena.prepFinished", function () {
          LT.game.textStart = rom("ROMANCE_7_WORKING_FINISHED_NO_DRINK");
        }),
        new LT.Response("Drink", "Drink the whiskey which Scarlett is offering to you.", "helena.prepFinished", function () {
          LT.game.textStart = rom("ROMANCE_7_WORKING_FINISHED_DRINK");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.prepFinished",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 1800,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_WORKING_FINISHED");
    },
    getResponses: function () {
      var s = LT.ensureScarlett();
      var attracted = !!(s && s.isAttractedTo && s.isAttractedTo());
      if (!attracted) return [null, new LT.Response("Sleep", "Fall asleep on the sofa.", "helena.morning")];
      var list = [null, new LT.Response("Decline", "Tell Scarlett that you're not interested.", "helena.sexDeclined")];
      if (s.hasVagina && s.hasVagina()) {
        list.push(
          sexResponse("Eat out", "Do as Scarlett asks and eat her out.", {
            partner: s,
            playerDom: false,
            consensual: true,
            startText: rom("ROMANCE_7_WORKING_FINISHED_CUNNILINGUS_START"),
            postSexNode: "helena.afterPrepSex",
          }),
        );
      } else {
        list.push(
          sexResponse("Oral", "Do as Scarlett asks and suck her cock.", {
            partner: s,
            playerDom: false,
            consensual: true,
            startText: rom("ROMANCE_7_WORKING_FINISHED_ORAL_START"),
            postSexNode: "helena.afterPrepSex",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.sexDeclined",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_SEX_DECLINED");
    },
    getResponses: function () {
      return [null, new LT.Response("Sleep", "Fall asleep on the sofa.", "helena.morning")];
    },
  });

  LT.defineNode({
    id: "helena.afterPrepSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_AFTER_SEX");
    },
    getResponses: function () {
      return [null, new LT.Response("Sleep", "Fall asleep.", "helena.morning")];
    },
  });

  LT.defineNode({
    id: "helena.morning",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(480) : 480) * 60;
    },
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_MORNING");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Wake her", "Shake Scarlett to wake her up.", "helena.tidy", function () {
          LT.game.textStart = rom("ROMANCE_7_MORNING_WAKE_SCARLETT");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.tidy",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(540) : 60) * 60;
    },
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_MORNING_TIDY_UP");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Make drinks", "Work alongside Scarlett to make drinks for the guests.", "helena.drinks", function () {
          LT.game.textEnd = LT.advanceHelenaRomance("ROMANCE_HELENA_8_FINISH");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.drinks",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(1020) : 120) * 60;
    },
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return rom("ROMANCE_7_MAKING_DRINKS");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Close eyes", "Do as Helena orders and close your eyes.", "helena.kissed", function () {
          LT.game.textStart = rom("ROMANCE_END_KISSED_CLOSE_EYES");
        }),
        new LT.Response("Peek", "Pretend to close your eyes, but secretly peek to see what it is Helena is planning.", "helena.kissed", function () {
          LT.game.textStart = rom("ROMANCE_END_KISSED_PEEK");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.kissed",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.textEnd = LT.advanceHelenaRomance("complete") + aff(LT.ensureHelena(), 25) + rom("ROMANCE_END_COMPLETED");
    },
    getContent: function () {
      return rom("ROMANCE_END_KISSED");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Continue on your way out into Slaver Alley...", "place.SLAVER_ALLEY_SCARLETTS_SHOP", function () {
          var h = LT.ensureHelena();
          if (h) h.location = { world: "HARPY_NEST", place: "HARPY_NESTS_HELENAS_NEST" };
        }),
      ];
    },
  });

  function paintShelf(id, title, xmlTag, priceTag, itemId, price, premium) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: 60,
      chrome: { left: true, right: true },
      getContent: function () {
        var html = diy(xmlTag);
        if (romance() === "ROMANCE_HELENA_2_PURCHASE_PAINT") {
          if (!hasItem("innoxia_quest_paint_can_premium") && !hasItem("innoxia_quest_paint_can")) {
            if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(String(price), true);
            html += diy(priceTag);
          } else {
            html += diy("SHELVING_PAINT_PURCHASED");
          }
        }
        return html;
      },
      getResponses: function () {
        var list = LT.travelResponses ? LT.travelResponses() : [null];
        if (romance() === "ROMANCE_HELENA_2_PURCHASE_PAINT" && !hasItem("innoxia_quest_paint_can_premium") && !hasItem("innoxia_quest_paint_can")) {
          var tip = premium
            ? "Purchase a can of 'Purple-star' golden paint, which is the one Helena requested."
            : "Purchase a can of 'Bronze-star' golden paint, which is not the one Helena requested!";
          var buy = new LT.Response("Purchase (" + price + ")", tip, "helena.paintBought", function () {
            if (typeof LT.addSpecialParse === "function") LT.addSpecialParse(String(price), true);
            LT.game.flags.helenaPaintBought = itemId;
            LT.game.textEnd = LT.incrementMoney(-price) + giveItem(itemId);
          });
          if (LT.getMoney() < price) buy.disable("You don't have enough flames.");
          list.push(buy);
        }
        return list;
      },
    });
  }

  paintShelf("place.HOME_IMPROVEMENTS_SHELVING_PREMIUM", "Shelving (Premium)", "SHELVING_PREMIUM", "SHELVING_PREMIUM_PRICE", "innoxia_quest_paint_can_premium", 1500, true);
  paintShelf("place.HOME_IMPROVEMENTS_SHELVING_STANDARD", "Shelving (Standard)", "SHELVING_STANDARD", "SHELVING_STANDARD_PRICE", "innoxia_quest_paint_can", 250, false);

  LT.defineNode({
    id: "helena.paintBought",
    ui: "dialogue",
    title: "Argus's DIY Depot",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return diy("PAINT_PURCHASED");
    },
    getResponses: function () {
      return LT.travelResponses ? LT.travelResponses() : [null];
    },
  });
})();
