(function () {
  function dateXml(tag) {
    return LT.parseFromXML("places/dominion/helenaHotel/hotelDate", tag);
  }
  function hotelXml(tag) {
    return LT.parseFromXML("places/dominion/helenaHotel/hotel", tag);
  }

  var TOPICS = ["SLAVES", "HARPY_NESTS", "RACES", "HARPIES", "BUSINESS"];
  var TOPIC_RESPONSES = {
    SLAVES: [
      { title: "Natural", tag: "RESPONSE_SLAVES_NATURAL", aff: 5 },
      { title: "Necessity", tag: "RESPONSE_SLAVES_NECESSITY", aff: 1 },
      { title: "Wrong", tag: "RESPONSE_SLAVES_WRONG", aff: -5 },
    ],
    HARPY_NESTS: [
      { title: "Queen", tag: "RESPONSE_HARPY_NESTS_HELENA_TOP", aff: 5 },
      { title: "Balance", tag: "RESPONSE_HARPY_NESTS_BALANCE", aff: 1 },
      { title: "Dismantle", tag: "RESPONSE_HARPY_NESTS_BAD", aff: -5 },
    ],
    RACES: [
      { title: "Harpies", tag: "RESPONSE_RACES_HARPIES", aff: 5 },
      { title: "Other", tag: "RESPONSE_RACES_OTHER", aff: 1 },
      { title: "Personality", tag: "RESPONSE_RACES_PERSONALITY", aff: -5 },
    ],
    HARPIES: [
      { title: "Admirable", tag: "RESPONSE_HARPIES_CONTROL", aff: 5 },
      { title: "Rude", tag: "RESPONSE_HARPIES_RUDE", aff: 1 },
      { title: "Bitch", tag: "RESPONSE_HARPIES_BITCH", aff: -5 },
    ],
    BUSINESS: [
      { title: "Flatter", tag: "RESPONSE_BUSINESS_FLATTER", aff: 5 },
      { title: "Take credit", tag: "RESPONSE_BUSINESS_CREDIT", aff: 1 },
      { title: "Surprised", tag: "RESPONSE_BUSINESS_SURPRISE", aff: -5 },
    ],
  };

  function helena() {
    return typeof LT.ensureHelena === "function" ? LT.ensureHelena() : LT.game.npcs && LT.game.npcs.helena;
  }

  function scarlett() {
    return typeof LT.ensureScarlett === "function" ? LT.ensureScarlett() : LT.game.npcs && LT.game.npcs.scarlett;
  }

  function aff(npc, amount) {
    return typeof LT.incrementHelenaAffection === "function" ? LT.incrementHelenaAffection(amount) : typeof LT.incrementAffection === "function" ? LT.incrementAffection(npc, amount) : "";
  }

  function sexResponse(title, tip, opts) {
    if (typeof LT.ResponseSex === "function") return LT.ResponseSex(title, tip, opts);
    return new LT.Response(title, tip, opts.postSexNode || "sex.scene").withColour(LT.Colour.ATTRIBUTE_LUST);
  }

  function firstKissDone() {
    return !!(LT.game.flags && LT.game.flags.helenaKissed);
  }

  function sexLifeTalk() {
    return !!(LT.game.flags && LT.game.flags.helenaDateSexLifeTalk);
  }

  function hotelSeen() {
    return !!(LT.game.flags && LT.game.flags.helenaHotelSeen);
  }

  function roseCount() {
    return typeof LT.countItems === "function" ? LT.countItems(LT.game.player, "innoxia_gift_rose_bouquet") : 0;
  }

  function takeRoses(n) {
    var i;
    for (i = 0; i < n; i++) {
      if (typeof LT.removeItemById === "function") LT.removeItemById(LT.game.player, "innoxia_gift_rose_bouquet");
    }
  }

  function helenaGifts() {
    var player = LT.game.player;
    if (!player || !player.items) return [];
    var out = [];
    var i;
    for (i = 0; i < player.items.length; i++) {
      var it = player.items[i];
      var spec = it && LT.ITEMS && LT.ITEMS[it.id];
      if (spec && spec.helenaGift) out.push({ item: it, spec: spec });
    }
    return out;
  }

  LT.giveHelenaGift = function (id) {
    var spec = LT.ITEMS && LT.ITEMS[id];
    if (!spec || !spec.helenaGift) return "";
    if (typeof LT.removeItemById === "function") LT.removeItemById(LT.game.player, id);
    LT.game.flags.helenaGift = typeof LT.dayNumber === "function" ? LT.dayNumber() : 1;
    var html = LT.parseFromXML("characters/dominion/helena", spec.helenaGift);
    if (spec.helenaAff) html += aff(helena(), spec.helenaAff);
    return html;
  };

  function pickTopic() {
    var seen = (LT.game.flags && LT.game.flags.helenaTalkTopics) || [];
    var left = TOPICS.filter(function (t) {
      return seen.indexOf(t) < 0;
    });
    if (!left.length) left = TOPICS.slice();
    var topic = left[Math.floor(Math.random() * left.length)];
    LT.game.flags.helenaDateTopic = topic;
    return topic;
  }

  function markTopic(topic) {
    LT.game.flags.helenaTalkTopics = LT.game.flags.helenaTalkTopics || [];
    if (LT.game.flags.helenaTalkTopics.indexOf(topic) < 0) LT.game.flags.helenaTalkTopics.push(topic);
  }

  LT.isFridayEvening = function () {
    var dt = typeof LT.gameNow === "function" ? LT.gameNow() : null;
    var hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    return !!(dt && dt.getDay && dt.getDay() === 5 && hour >= 17);
  };

  LT.incrementHelenaAffection = function (amount) {
    var h = helena();
    if (!h) return "";
    var cur = h.affection || 0;
    if (amount < 0 && cur + amount < 30) return "";
    if (cur >= 100) return "";
    return typeof LT.incrementAffection === "function" ? LT.incrementAffection(h, amount) : "";
  };

  LT.generateHelenaHotelTile = function () {
    if (typeof LT.findPlaceTile === "function" && LT.findPlaceTile("DOMINION", "DOMINION_HELENA_HOTEL")) return;
    var tiles = window.allGrids && window.allGrids.DOMINION;
    if (!tiles) return;
    var entrance = typeof LT.findPlaceTile === "function" ? LT.findPlaceTile("DOMINION", "DOMINION_HARPY_NESTS_ENTRANCE") : null;
    if (!entrance) return;
    var target = null;
    var i;
    for (i = 0; i < tiles.length; i++) {
      if (tiles[i].x === entrance.x - 2 && tiles[i].y === entrance.y) target = tiles[i];
    }
    if (!target || !target.location) return;
    var place = (LT.places && LT.places.DOMINION_HELENA_HOTEL) || {};
    target.location.name = place.name || "The Golden Feather Hotel";
    target.location.placeType = "DOMINION_HELENA_HOTEL";
    target.location.passage = "place.DOMINION_HELENA_HOTEL";
    target.location.description = place.description || target.location.description;
    if (window.grid && grid.gridName === "DOMINION" && typeof findTile === "function") {
      var live = findTile(grid.gridData, target.x, target.y);
      if (live) live.location = target.location;
      if (typeof renderGrid === "function") renderGrid();
    }
    return target;
  };

  LT.helenaDateResponse = function () {
    if (!LT.isFridayEvening()) {
      return new LT.Response("Date", "You can only ask Helena out on a date on Fridays after 17:00.", null).disable("You can only ask Helena out on a date on Fridays after 17:00.");
    }
    return new LT.Response("Date", "Ask Helena out on a date.", "helena.dateStart");
  };

  LT.defineNode({
    id: "helena.dateStart",
    ui: "dialogue",
    title: "Helena's shop",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.helenaDateRomanticSetup = false;
      LT.game.flags.helenaDateRomanticSetupEatenOut = false;
    },
    getContent: function () {
      return dateXml("DATE_START");
    },
    getResponses: function () {
      var fly = LT.isAbleToFly && LT.isAbleToFly()
        ? new LT.Response("Fly", "Fly back to Helena's apartment with her.", "helena.dateTravel", function () {
            LT.game.textStart = dateXml(hotelSeen() ? "DATE_TRAVEL_FLY_REPEAT" : "DATE_TRAVEL_FLY");
          })
        : new LT.Response("Fly", "You aren't able to fly...", null).disable("You aren't able to fly...");
      return [
        null,
        new LT.Response("Walk", "Walk back to Helena's apartment with her.", "helena.dateTravel", function () {
          LT.game.textStart = dateXml(hotelSeen() ? "DATE_TRAVEL_WALK_REPEAT" : "DATE_TRAVEL_WALK");
        }),
        fly,
        new LT.Response("Offer ride", "You are not a taur, so can't offer to let Helena ride on your back...", null).disable("You are not a taur, so can't offer to let Helena ride on your back..."),
      ];
    },
  });

  LT.defineNode({
    id: "helena.dateTravel",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 900,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.generateHelenaHotelTile === "function") LT.generateHelenaHotelTile();
      LT.game.flags.helenaHotelSeen = true;
      if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_HELENA_HOTEL");
      var h = helena();
      var s = scarlett();
      if (h) h.location = { world: "DOMINION", place: "DOMINION_HELENA_HOTEL" };
      if (s) s.location = { world: "DOMINION", place: "DOMINION_HELENA_HOTEL" };
    },
    getContent: function () {
      return dateXml("DATE_TRAVEL");
    },
    getResponses: function () {
      var list = [
        null,
        new LT.Response("Small talk", "Make small talk with Scarlett while you wait for Helena to return.", "helena.dateRestaurant", function () {
          LT.game.textStart = dateXml("DATE_TRAVEL_SMALL_TALK");
          LT.game.textEnd = typeof LT.incrementAffection === "function" ? LT.incrementAffection(scarlett(), 5) : "";
        }),
        new LT.Response("Wait", "Just wait for Helena to return.", "helena.dateRestaurant", function () {
          LT.game.textStart = dateXml("DATE_TRAVEL_WAIT");
        }),
      ];
      if (LT.game.flags && LT.game.flags.helenaDateVirginityTalk) {
        if (roseCount() < 3) {
          list.push(new LT.Response("Romantic setup", "You require at least three Rose Bouquets in your inventory to do this!", null).disable("You require at least three Rose Bouquets in your inventory to do this!"));
        } else {
          list.push(new LT.Response("Romantic setup", "Ask Scarlett to set up a romantic scene in Helena's apartment for when the two of you return from your date.", "helena.dateRomanceSetup"));
        }
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.dateRomanceSetup",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var s = scarlett();
      return dateXml(s && s.isLikesPlayer && s.isLikesPlayer() ? "DATE_RESTAURANT_ROMANTIC_SETUP_AGREED" : "DATE_RESTAURANT_ROMANTIC_SETUP_DECLINED");
    },
    getResponses: function () {
      var s = scarlett();
      if (s && s.isLikesPlayer && s.isLikesPlayer()) {
        return [
          null,
          new LT.Response("Thank her", "Thank Scarlett for agreeing to do as you've asked.", "helena.dateRestaurant", function () {
            takeRoses(3);
            LT.game.flags.helenaDateRomanticSetup = true;
            LT.game.textStart = dateXml("DATE_RESTAURANT_ROMANTIC_SETUP_THANKS");
          }),
        ];
      }
      var pay = new LT.Response("Pay her (1000)", "Pay Scarlett one thousand flames in exchange for her setting up the romantic scene in Helena's apartment.", "helena.dateRestaurant", function () {
        takeRoses(3);
        LT.game.flags.helenaDateRomanticSetup = true;
        LT.game.textStart = dateXml("DATE_RESTAURANT_ROMANTIC_SETUP_PAID");
        LT.game.textEnd = LT.incrementMoney(-1000);
      });
      if (LT.getMoney() < 1000) pay.disable("You don't have enough money to pay Scarlett...");
      var oralTitle = s && s.hasPenis && s.hasPenis() ? "Suck cock" : "Cunnilingus";
      var oralTip = s && s.hasPenis && s.hasPenis()
        ? "Do as Scarlett suggests and quickly suck her cock in exchange for her setting up the romantic scene."
        : "Do as Scarlett suggests and quickly eat her out in exchange for her setting up the romantic scene.";
      var oralTag = s && s.hasPenis && s.hasPenis() ? "DATE_RESTAURANT_ROMANTIC_SETUP_START_BLOWJOB" : "DATE_RESTAURANT_ROMANTIC_SETUP_START_CUNNILINGUS";
      return [
        null,
        new LT.Response("Refuse", "Refuse to agree to Scarlett's conditions.", "helena.dateRestaurant", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_ROMANTIC_SETUP_REFUSED");
        }),
        pay,
        sexResponse(oralTitle, oralTip, {
          partner: s,
          playerDom: false,
          consensual: true,
          startText: dateXml(oralTag),
          postSexNode: "helena.dateRomanceAfterOral",
          onEnd: function () {
            if (typeof LT.incrementAffection === "function") LT.incrementAffection(s, 5);
          },
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.dateRomanceAfterOral",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      takeRoses(3);
      LT.game.flags.helenaDateRomanticSetup = true;
    },
    getContent: function () {
      return dateXml("DATE_RESTAURANT_ROMANTIC_SETUP_AFTER_ORAL");
    },
    getResponses: function () {
      return [null, new LT.Response("Wait", "Wait for Helena to arrive.", "helena.dateRestaurant")];
    },
  });

  LT.defineNode({
    id: "helena.dateRestaurant",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 900,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var s = scarlett();
      if (s) s.location = null;
    },
    getContent: function () {
      return dateXml("DATE_RESTAURANT_START");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Wine", "Tell Helena and the harpy waitress that you'll also be drinking wine this evening.", "helena.dateTalking", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_START_WINE");
          LT.game.textEnd = aff(helena(), 2);
        }),
        new LT.Response("Water", "Ask the harpy for a drink of water.", "helena.dateTalking", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_START_WATER");
          LT.game.textEnd = aff(helena(), -2);
        }),
        new LT.Response("Beer", "Ask the harpy for a beer.", "helena.dateTalking", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_START_BEER");
          LT.game.textEnd = aff(helena(), -2);
        }),
        new LT.Response("Whiskey", "Ask the harpy for a glass of whiskey.", "helena.dateTalking", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_START_WHISKEY");
          LT.game.textEnd = aff(helena(), -2);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.dateTalking",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 2400,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      pickTopic();
    },
    getContent: function () {
      var topic = LT.game.flags.helenaDateTopic || "SLAVES";
      var seen = (LT.game.flags.helenaTalkTopics || []).indexOf(topic) >= 0;
      return dateXml("DATE_RESTAURANT_TALKING_" + topic + (seen ? "_REPEAT" : ""));
    },
    getResponses: function () {
      var topic = LT.game.flags.helenaDateTopic || "SLAVES";
      var opts = TOPIC_RESPONSES[topic] || TOPIC_RESPONSES.SLAVES;
      var list = [null];
      opts.forEach(function (opt) {
        list.push(
          new LT.Response(opt.title, opt.title, "helena.datePlayerTopic", function () {
            markTopic(topic);
            LT.game.textStart = dateXml(opt.tag);
            LT.game.textEnd = aff(helena(), opt.aff);
          }),
        );
      });
      return list;
    },
  });

  LT.defineNode({
    id: "helena.datePlayerTopic",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 2700,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_RESTAURANT_PLAYER_TOPIC");
    },
    getResponses: function () {
      var h = helena();
      var affVal = (h && h.affection) || 0;
      var sex;
      if (sexLifeTalk()) {
        sex = null;
      } else if (affVal < 70) {
        sex = new LT.Response("Sex life", "You can tell that Helena isn't ready to talk openly about her sex life with you yet. Requires Helena's affection towards you to be 70 or greater.", null).disable(
          "Requires Helena's affection towards you to be 70 or greater. It is currently " + affVal + ".",
        );
      } else {
        sex = new LT.Response("Sex life", "Talk to Helena about her sex life.", "helena.dateEnd", function () {
          LT.game.flags.helenaDateSexLifeTalk = true;
          LT.game.textStart = dateXml("DATE_RESTAURANT_PLAYER_TOPIC_SEX_LIFE");
          LT.game.textEnd = aff(h, 5);
        });
      }
      var list = [
        null,
        new LT.Response("Helena", "Talk about Helena and ask her what she's got planned for the weekend.", "helena.dateEnd", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_PLAYER_TOPIC_HELENA");
          LT.game.textEnd = aff(helena(), 5);
        }),
        new LT.Response("Arcane", "Turn the topic of conversation to the arcane.", "helena.dateEnd", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_PLAYER_TOPIC_ARCANE");
        }),
        new LT.Response("Politics", "Talk to Helena about Lilith and her rule over Dominion.", "helena.dateEnd", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_PLAYER_TOPIC_POLITICS");
          LT.game.textEnd = aff(helena(), -5);
        }),
      ];
      if (sex) list.push(sex);
      if (LT.game.flags && LT.game.flags.helenaGift === (typeof LT.dayNumber === "function" ? LT.dayNumber() : 1)) {
        list.push(new LT.Response("Gift", "You've already given Helena a gift...", null).disable("You've already given Helena a gift..."));
      } else if (!helenaGifts().length) {
        list.push(new LT.Response("Gift", "You aren't carrying anything suitable to give Helena as a gift.", null).disable("You aren't carrying anything suitable to give Helena as a gift."));
      } else {
        list.push(new LT.Response("Gift", "Give Helena a gift. You will be able to return to this scene and ask her about one of the other topics after giving her a gift.", "helena.dateGift"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.dateGift",
    ui: "dialogue",
    title: "Choose Gift",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>The following items are suitable to be given as a gift to Helena. Select the one that you'd like to give to her.</p>";
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Return to the previous screen.", "helena.datePlayerTopic")];
      helenaGifts().forEach(function (entry) {
        list.push(
          new LT.Response(entry.spec.name, "Give Helena the " + entry.spec.name + ".", "helena.datePlayerTopic", function () {
            LT.game.textStart = LT.giveHelenaGift(entry.spec.id);
          }),
        );
      });
      return list;
    },
  });

  LT.defineNode({
    id: "helena.dateEnd",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 1800,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_RESTAURANT_END");
    },
    getResponses: function () {
      var leave = LT.game.flags && LT.game.flags.helenaDateRomanticSetup
        ? new LT.Response("Leave", "With Scarlett having set up a romantic scene for you in Helena's apartment, you don't want to leave her now!", null).disable("With Scarlett having set up a romantic scene for you in Helena's apartment, you don't want to leave her now!")
        : new LT.Response("Leave", "Say goodbye to Helena and that you hope to see her again soon.", "helena.dateLeave", function () {
            LT.game.flags.helenaDateFirstDateComplete = true;
            LT.game.flags.helenaGoneHome = typeof LT.dayNumber === "function" ? LT.dayNumber() : 1;
            LT.game.textStart = dateXml("DATE_RESTAURANT_END_GOODBYE");
            LT.game.textEnd = aff(helena(), -5);
          });
      return [null, new LT.Response("Accompany", "Accompany Helena back up to her penthouse apartment.", "helena.dateHome"), leave];
    },
  });

  LT.defineNode({
    id: "helena.dateHome",
    ui: "dialogue",
    title: "Helena's apartment",
    secondsPassed: 1800,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.textEnd = aff(helena(), 10);
    },
    getContent: function () {
      return dateXml(LT.game.flags && LT.game.flags.helenaDateRomanticSetup ? "DATE_RESTAURANT_END_HOME_ROMANCE" : "DATE_RESTAURANT_END_HOME");
    },
    getResponses: function () {
      var h = helena();
      if (LT.game.flags && LT.game.flags.helenaDateRomanticSetup) {
        return [
          null,
          new LT.Response("Bedroom", h && h.hasFetish && h.hasFetish("DOMINANT") ? "Helena leads you down the hallway to her bedroom." : "Lead Helena down the hallway to her bedroom.", "helena.dateBedroom", function () {
            LT.game.textStart = dateXml("DATE_APARTMENT_ROMANTIC_SCENE_BEDROOM");
          }),
        ];
      }
      var list = [
        null,
        new LT.Response("Goodbye", "Say goodbye to Helena and head back out into Dominion.", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_END_HOME_GOODBYE");
        }),
        new LT.Response("Parting kiss", "Kiss Helena on the cheek and say goodbye.", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_RESTAURANT_END_HOME_GOODBYE_KISS");
          if (!sexLifeTalk()) LT.game.textEnd = aff(h, 5);
        }),
      ];
      if (!sexLifeTalk()) {
        list.push(
          new LT.Response(
            "Inside",
            "You think that Helena would invite you inside if you were first able to get her to openly talk to you about her sex life. Next time, if her affection is 70 or more, ask her about her sex life.",
            null,
          ).disable("Ask Helena about her sex life on a later date (affection 70+) to unlock this."),
        );
      } else {
        list.push(
          new LT.Response("Inside", "Accept Helena's invitation to come inside.", "helena.dateApartment", function () {
            LT.game.textEnd = aff(h, 10);
          }),
        );
      }
      if (h && h.isSlutty && h.isSlutty()) {
        list.push(
          new LT.Response("Bedroom", "Take Helena straight into her bedroom to give her the fucking she's so obviously craving.", "helena.dateBedroom", function () {
            LT.game.textStart = dateXml("DATE_RESTAURANT_END_HOME_BEDROOM");
          }),
        );
      }
      return list;
    },
  });

  function apartmentResponses() {
    var list = [];
    if (LT.game.currentNode && LT.game.currentNode.id === "helena.dateCoffee") {
      list.push(
        new LT.Response("Leave", "Now that you've had coffee, it's time to leave...", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_START_LEAVE");
        }),
      );
    } else {
      list.push(new LT.Response("Leave", "You should at least have some coffee before you leave...", null).disable("You should at least have some coffee before you leave..."));
    }
    if (LT.game.currentNode && LT.game.currentNode.id === "helena.dateCoffee") {
      list.push(new LT.Response("Coffee", "You're already having coffee with Helena...", null).disable("You're already having coffee with Helena..."));
    } else if (LT.game.currentNode && LT.game.currentNode.id === "helena.dateKiss") {
      list.push(new LT.Response("Coffee", "Helena isn't going to want to stop the fun and have coffee now.", null).disable("Helena isn't going to want to stop the fun and have coffee now."));
    } else {
      list.push(new LT.Response("Coffee", "Well, this is what you're here for, isn't it?", "helena.dateCoffee"));
    }
    if (!firstKissDone()) {
      list.push(
        new LT.Response("First kiss", "With how she's acting towards you, you think that you have an opportunity to give Helena her first kiss...", "helena.dateKiss", function () {
          LT.game.flags.helenaKissed = true;
          LT.game.flags.helenaFirstKiss = true;
          LT.game.textEnd = aff(helena(), 10);
        }),
      );
      list.push(new LT.Response("Bedroom", "Helena isn't quite ready for this yet. Perhaps if you were to take her first kiss, she'd be willing to take things into the bedroom the next time you're here.", null).disable("Helena isn't quite ready for this yet."));
    } else {
      var h = helena();
      list.push(new LT.Response(h && h.isSlutty && h.isSlutty() ? "Make out" : "Make out", "Spend some time making out with Helena on the sofa.", "helena.dateKiss"));
      list.push(
        new LT.Response("Bedroom", h && h.isSlutty && h.isSlutty() ? "Give Helena what she so desperately wants and suggest that the two of you head to her bedroom." : "Ask Helena if she'd like to head into her bedroom with you.", "helena.dateBedroom", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_START_BEDROOM");
        }),
      );
    }
    return list;
  }

  LT.defineNode({
    id: "helena.dateApartment",
    ui: "dialogue",
    title: "Helena's apartment",
    secondsPassed: 600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.helenaDateApartmentSeen = true;
      LT.game.textStart = dateXml("DATE_APARTMENT_START");
    },
    getContent: function () {
      return "";
    },
    getResponses: apartmentResponses,
  });

  LT.defineNode({
    id: "helena.dateCoffee",
    ui: "dialogue",
    title: "Helena's apartment",
    secondsPassed: 900,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_APARTMENT_COFFEE");
    },
    getResponses: apartmentResponses,
  });

  LT.defineNode({
    id: "helena.dateKiss",
    ui: "dialogue",
    title: "Helena's apartment",
    secondsPassed: 600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml(LT.game.flags && LT.game.flags.helenaFirstKiss ? "DATE_APARTMENT_KISS_FIRST" : "DATE_APARTMENT_KISS");
    },
    getResponses: function () {
      LT.game.flags.helenaFirstKiss = false;
      var list = apartmentResponses();
      list.push(
        new LT.Response("Bedroom", "Ask Helena if she'd like to head into her bedroom with you.", "helena.dateBedroom", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_KISS_BEDROOM");
        }),
      );
      return list;
    },
  });

  function helenaExperienced(kind) {
    return !!(LT.game.flags && LT.game.flags[kind]);
  }

  function bedroomSex(title, tip, flag, firstTag, expTag, post) {
    return sexResponse(title, tip, {
      partner: helena(),
      playerDom: true,
      consensual: true,
      startText: dateXml(helenaExperienced(flag) ? expTag : firstTag),
      postSexNode: post || "helena.dateAfterSex",
      onEnd: function () {
        LT.game.flags[flag] = true;
        var h = helena();
        if (h && h.sex) h.sex.vaginaVirgin = false;
      },
    });
  }

  LT.defineNode({
    id: "helena.dateBedroom",
    ui: "dialogue",
    title: "Helena's Bedroom",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      var h = helena();
      var virgin = !!(h && h.sex && h.sex.vaginaVirgin);
      if (LT.game.flags && LT.game.flags.helenaDateRomanticSetup && !LT.game.flags.helenaDateRomanticSetupEatenOut && virgin) {
        return [
          sexResponse("Perform cunnilingus", "Push Helena onto the bed, drop your head between her legs, and start eating her out.", {
            partner: h,
            playerDom: true,
            consensual: true,
            startText: dateXml("DATE_APARTMENT_BEDROOM_ROMANCE_PERFORM_CUNNILINGUS"),
            postSexNode: "helena.dateAfterRomanceSex",
            onEnd: function () {
              LT.game.flags.helenaDateRomanticSetupEatenOut = true;
              LT.game.flags.helenaEatenOut = true;
            },
          }),
        ];
      }
      var list = [
        bedroomSex("Finger her", "Finger Helena's pussy while simultaneously giving her breasts some oral attention.", "helenaFingered", "DATE_APARTMENT_BEDROOM_FINGERING_FIRST_TIME", "DATE_APARTMENT_BEDROOM_FINGERING_EXPERIENCED"),
      ];
      if (!firstKissDone()) {
        list.push(new LT.Response("Perform cunnilingus", "Helena isn't ready to go this far with you yet...", null).disable("Helena isn't ready to go this far with you yet..."));
      } else {
        list.push(
          bedroomSex(
            "Perform cunnilingus",
            "Push Helena onto the bed, drop your head between her legs, and start eating her out.",
            "helenaEatenOut",
            "DATE_APARTMENT_BEDROOM_PERFORM_CUNNILINGUS_FIRST_TIME",
            "DATE_APARTMENT_BEDROOM_PERFORM_CUNNILINGUS_EXPERIENCED",
          ),
        );
      }
      var p = LT.game.player;
      if (p && p.hasVagina && p.hasVagina()) {
        if (!firstKissDone()) {
          list.push(new LT.Response("Receive cunnilingus", "Helena isn't ready to go this far with you yet...", null).disable("Helena isn't ready to go this far with you yet..."));
        } else {
          list.push(
            bedroomSex(
              "Receive cunnilingus",
              "Get Helena to get down on her knees and eat you out.",
              "helenaAtePlayer",
              "DATE_APARTMENT_BEDROOM_RECEIVE_CUNNILINGUS_FIRST_TIME",
              "DATE_APARTMENT_BEDROOM_RECEIVE_CUNNILINGUS_EXPERIENCED",
            ),
          );
        }
      }
      if (p && p.hasPenis && p.hasPenis()) {
        if (!firstKissDone()) {
          list.push(new LT.Response("Receive blowjob", "Helena isn't ready to go this far with you yet...", null).disable("Helena isn't ready to go this far with you yet..."));
        } else {
          list.push(
            bedroomSex(
              "Receive blowjob",
              "Get Helena to suck your cock.",
              "helenaBlewPlayer",
              "DATE_APARTMENT_BEDROOM_RECEIVE_BLOWJOB_FIRST_TIME",
              "DATE_APARTMENT_BEDROOM_RECEIVE_BLOWJOB_EXPERIENCED",
            ),
          );
          list.push(bedroomSex("Cowgirl", "Have Helena ride you.", "helenaCowgirl", "DATE_APARTMENT_BEDROOM_COWGIRL", "DATE_APARTMENT_BEDROOM_COWGIRL"));
          list.push(bedroomSex("Missionary", "Take Helena in the missionary position.", "helenaMissionary", "DATE_APARTMENT_BEDROOM_MISSIONARY", "DATE_APARTMENT_BEDROOM_MISSIONARY"));
        }
      }
      if (firstKissDone()) {
        if (LT.game.flags && LT.game.flags.helenaDateVirginityTalk) {
          list.push(
            new LT.Response("Virginity", "Helena has already told you that she's unwilling to lose her virginity. Perhaps you could arrange something with Scarlett the next time you take Helena on a date...", null).disable(
              "Helena has already told you that she's unwilling to lose her virginity.",
            ),
          );
        } else {
          list.push(
            new LT.Response("Virginity", "Ask Helena if she's ready to lose her virginity to you.", "helena.dateBedroom", function () {
              LT.game.flags.helenaDateVirginityTalk = true;
              LT.game.textStart = dateXml("DATE_APARTMENT_BEDROOM_VIRGINITY_TALK");
            }),
          );
        }
      } else {
        list.push(new LT.Response("Virginity", "Helena isn't going to want to discuss losing her virginity until after she's received oral from you...", null).disable("Helena isn't going to want to discuss losing her virginity until after she's received oral from you..."));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.dateAfterRomanceSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_APARTMENT_BEDROOM_AFTER_ROMANCE_SEX");
    },
    getResponses: function () {
      var p = LT.game.player;
      var list = [
        new LT.Response("Leave", p && p.hasPenis && p.hasPenis() ? "Decide not to take Helena's virginity tonight..." : "Decide not to do anything else with Helena tonight...", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_BEDROOM_AFTER_ROMANCE_SEX_LEAVE");
        }),
        new LT.Response("Shower & sleep", "Decide not to take Helena's virginity and instead join her in the shower before going to sleep.", "helena.dateSleep"),
      ];
      if (p && p.hasPenis && p.hasPenis()) {
        list.push(
          sexResponse("Take virginity (as sub)", "Let Helena lose her virginity at her own pace by letting her ride your cock.", {
            partner: helena(),
            playerDom: false,
            consensual: true,
            startText: dateXml("DATE_APARTMENT_BEDROOM_AFTER_ROMANCE_SEX_VIRGINITY_HELENA_DOM"),
            postSexNode: "helena.dateAfterSex",
            onEnd: function () {
              var h = helena();
              if (h) {
                h.fetishes = h.fetishes || {};
                h.fetishes.DOMINANT = true;
                if (h.sex) h.sex.vaginaVirgin = false;
              }
            },
          }),
        );
        list.push(
          sexResponse("Take virginity (as dom)", "Take Helena's virginity in the missionary position.", {
            partner: helena(),
            playerDom: true,
            consensual: true,
            startText: dateXml("DATE_APARTMENT_BEDROOM_AFTER_ROMANCE_SEX_VIRGINITY_HELENA_SUB"),
            postSexNode: "helena.dateAfterSex",
            onEnd: function () {
              var h = helena();
              if (h) {
                h.fetishes = h.fetishes || {};
                h.fetishes.SUBMISSIVE = true;
                if (h.sex) h.sex.vaginaVirgin = false;
              }
            },
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.dateAfterSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_APARTMENT_BEDROOM_AFTER_SEX");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Get dressed and leave Helena's apartment.", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_BEDROOM_AFTER_SEX_LEAVE");
        }),
        new LT.Response("Sleep over", "Accept Helena's invitation to spend the night.", "helena.dateSleep"),
      ];
    },
  });

  LT.defineNode({
    id: "helena.dateSleep",
    ui: "dialogue",
    title: "Helena's Bedroom",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(480) : 480) * 60;
    },
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_APARTMENT_BEDROOM_AFTER_SEX_SLEEP");
    },
    getResponses: function () {
      return [null, new LT.Response("Wake up", "Wake up beside Helena.", "helena.dateWake")];
    },
  });

  LT.defineNode({
    id: "helena.dateWake",
    ui: "dialogue",
    title: "Helena's Bedroom",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_APARTMENT_BEDROOM_AFTER_SEX_SLEEP_WAKE_UP");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Get dressed and leave.", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_BEDROOM_AFTER_SEX_SLEEP_LEAVE");
        }),
        new LT.Response("Breakfast", "Join Helena for breakfast.", "helena.dateBreakfast"),
      ];
    },
  });

  LT.defineNode({
    id: "helena.dateBreakfast",
    ui: "dialogue",
    title: "Helena's apartment",
    secondsPassed: 1800,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return dateXml("DATE_APARTMENT_BEDROOM_AFTER_SEX_SLEEP_BREAKFAST");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Thank Helena for breakfast and head out.", "helena.dateLeave", function () {
          LT.game.textStart = dateXml("DATE_APARTMENT_BREAKFAST_LEAVE");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.dateLeave",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.helenaDateFirstDateComplete = true;
      if (typeof LT.generateHelenaHotelTile === "function") LT.generateHelenaHotelTile();
      if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_HELENA_HOTEL");
    },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your way.", "place.DOMINION_HELENA_HOTEL")];
    },
  });

  LT.defineNode({
    id: "place.DOMINION_HELENA_HOTEL",
    ui: "dialogue",
    title: "The Golden Feather Hotel",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      var place = (LT.places && LT.places.DOMINION_HELENA_HOTEL) || {};
      return "<p>" + (place.description || "You stand before The Golden Feather Hotel.") + "</p>";
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (LT.game.flags && LT.game.flags.helenaDateFirstDateComplete) {
        list.push(new LT.Response("Elevator", "Use the elevator to travel up to Helena's nest.", "place.HARPY_NESTS_HELENAS_NEST", function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("HARPY_NEST", "HARPY_NESTS_HELENAS_NEST");
          LT.game.textStart = hotelXml("HOTEL_TRAVEL_TO_NEST");
        }));
      }
      return list;
    },
  });
})();
