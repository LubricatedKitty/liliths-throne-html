(function () {
  function xml(tag) {
    return LT.parseFromXML("places/dominion/lilayasHome/lab", tag);
  }

  function lilayaInLab() {
    if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
    var n = LT.game.npcs && LT.game.npcs.lilaya;
    return !!(n && n.location && n.location.place === "LILAYA_HOME_LAB");
  }

  function houseTabs(game, tab) {
    if (tab === 1 && LT.game.renderMap) {
      return LT.getNode("place.LILAYA_HOME_CORRIDOR").getResponses(game, 1);
    }
    return labDoorResponses();
  }

  function labDoorResponses() {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    if (lilayaInLab()) {
      list.push(new LT.Response("Enter", "Step through the door and enter Lilaya's laboratory.", "lab.entry"));
    } else {
      list.push(
        new LT.Response("Enter", "The door to Lilaya's laboratory is firmly shut, and, considering the hour, she's probably sleeping upstairs.", null).disable(
          "The door is shut. Come back during the day.",
        ),
      );
    }
    return list;
  }

  LT.defineNode({
    id: "place.LILAYA_HOME_LAB",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    tabs: ["Actions", "Fast travel"],
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
    },
    getContent: function () {
      return xml("LAB");
    },
    getResponses: houseTabs,
  });

  LT.defineNode({
    id: "lab.entry",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
      if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
      if (typeof LT.maybeWorkplaceSex === "function") LT.maybeWorkplaceSex();
    },
    getContent: function () {
      var html = xml("LAB_ENTRY_BASE") + xml("LAB_ENTRY_NAUGHTY_ROSE") + xml("LAB_ENTRY_BASE_END");
      if (LT.game.flags && LT.game.flags.workSex && typeof LT.jobSexText === "function") {
        var rec = LT.findSlave(LT.game.flags.workSex);
        if (rec) html += LT.jobSexText(rec);
      }
      return html;
    },
    getResponses: function () {
      var list = [
        new LT.Response("Leave", "Say goodbye to Lilaya and exit her lab.", "place.LILAYA_HOME_LAB", function () {
          LT.game.textStart = "<p>You tell Lilaya that you've got to get going, and, after saying goodbye, you head over to the lab's door and make your exit.</p>";
        }),
      ];
      if (typeof LT.slavePresenceResponses === "function") LT.slavePresenceResponses(list);
      var quest = LT.game.flags && LT.game.flags.quest;
      if (quest === "MAIN_1_A_LILAYAS_TESTS") {
        list.push(new LT.Response("Tests", "Let Lilaya know that you're here to let her run her tests on you.", "lab.testing"));
      } else if (quest && quest !== "MAIN_1_A_LILAYAS_TESTS") {
        if (LT.game.flags && LT.game.flags.hadSexWithLilaya) {
          list.push(
            new LT.Response("\"Tests\"", "Let Lilaya know that you're here to let her run more of her \"tests\" on you.", "lab.moreSex"),
          );
        } else {
          list.push(
            new LT.Response("Tests", "Tell Lilaya that you want her to run more of her 'tests' on you.", "lab.testingRepeat"),
          );
        }
      }
      if (LT.game.flags && LT.game.flags.enchantmentQuest === "SIDE_ENCHANTMENTS_LILAYA_HELP") {
        list.push(
          new LT.Response(
            "Essences",
            "Ask Lilaya about the strange energy you absorbed.",
            "lab.essences",
          ),
        );
      } else if (LT.game.flags && (LT.game.flags.enchantmentQuest === "complete" || LT.game.flags.canEnchant)) {
        list.push(
          new LT.Response(
            "Extract essences",
            LT.game.flags.essenceExtractionKnown
              ? "Ask Lilaya if you can use her equipment to extract some essences."
              : "Ask Lilaya if there's any way to extract essences you've absorbed.",
            "lab.extract",
          ),
        );
      }
      if (typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(LT.game.player)) {
        if (!(LT.questReached && LT.questReached("MAIN_1_B_DEMON_HOME")) && LT.game.flags.quest === "MAIN_1_A_LILAYAS_TESTS") {
          list.push(
            new LT.Response("Pregnancy", "You'll need to complete Lilaya's initial tests before she'll agree to help you deal with your pregnancy.", null).disable(
              "You'll need to complete Lilaya's initial tests before she'll agree to help you deal with your pregnancy.",
            ),
          );
        } else if (LT.game.flags.pregnancyQuest === "SIDE_PREGNANCY_CONSULT_LILAYA") {
          list.push(
            new LT.Response("Pregnancy", "Speak to Lilaya about your pregnancy.", "lab.pregnancy", function () {
              LT.advanceFirstPregnancyQuest("SIDE_PREGNANCY_LILAYA_THE_MIDWIFE");
            }),
          );
        } else {
          list.push(new LT.Response("Pregnancy", "Speak to Lilaya about your pregnancy.", "lab.pregnancyRepeat"));
        }
      }
      if (LT.game.flags && LT.game.flags.slaveryQuest === "SIDE_SLAVER_NEED_RECOMMENDATION") {
        if (!(LT.questReached && LT.questReached("MAIN_1_B_DEMON_HOME"))) {
          list.push(
            new LT.Response(
              "Slaver",
              "You'll need to complete Lilaya's initial tests before you can ask her for a letter of recommendation.",
              null,
            ).disable("You'll need to complete Lilaya's initial tests before you can ask her for a letter of recommendation."),
          );
        } else {
          list.push(
            new LT.Response("Slaver", "Ask Lilaya for a letter of recommendation in order to obtain a slaver license.", "lab.slaver"),
          );
        }
      }
      return list;
    },
  });

  LT.defineNode({
    id: "lab.testing",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("AUNT_HOME_LABORATORY_TESTING");
    },
    getResponses: function () {
      return [null, new LT.Response("Returning home", "Ask Lilaya if she's found a way to send you back home.", "lab.arthur")];
    },
  });

  LT.defineNode({
    id: "lab.arthur",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (LT.game.flags.quest === "MAIN_1_A_LILAYAS_TESTS") {
        if (typeof LT.advanceMainQuest === "function") {
          LT.game.textEnd = LT.advanceMainQuest("MAIN_1_B_DEMON_HOME");
        } else {
          LT.game.flags.quest = "MAIN_1_B_DEMON_HOME";
        }
      }
    },
    getContent: function () {
      return xml("AUNT_HOME_LABORATORY_TESTING_ARTHUR");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "'Tests'",
          "Accept Lilaya's offer of more 'tests'. You're not sure what her intentions really are, but you're confident that you'll be able to stop her if she tries any funny business.",
          "lab.hornyLilaya",
        ),
        new LT.Response(
          "Decline",
          "Tell Lilaya that you're not up for this sort of thing.",
          "lab.inside",
          function () {
            LT.game.textStart = xml("AUNT_HOME_LABORATORY_TESTING_ARTHUR_DECLINED");
          },
        ),
      ];
    },
  });

  function lilayaPartner() {
    if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
    return LT.game.npcs.lilaya;
  }

  function letItHappenTip() {
    return "You know that this can only end one way. Although Lilaya reminds you of your aunt Lily, you don't think it will get in the way of you enjoying this...";
  }

  LT.defineNode({
    id: "lab.testingRepeat",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("AUNT_HOME_LABORATORY_TESTING_REPEAT");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Sit down", "You know exactly why Lilaya seems embarrassed about these 'tests'...", "lab.hornyLilaya"),
        new LT.Response("Decline", "Tell Lilaya that you've changed your mind. While she'll probably be a little disappointed, you can always come back later to take up her offer if you should change your mind.", "lab.inside", function () {
          LT.game.textStart = xml("AUNT_HOME_LABORATORY_TESTING_LEAVE");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "lab.hornyLilaya",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Open your mouth", "Let Lilaya push her finger into your mouth. After all, maybe this is just part of the test?", "lab.wantsSex"),
        new LT.Response(
          "Stop this",
          "Stand up and tell Lilaya that this is going too far. While she'll undoubtedly be upset at this sudden end to her advances, you're sure that she'd try to hit on you again if you changed your mind in the future.",
          "lab.inside",
          function () {
            LT.game.textStart = xml("AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_DECLINED");
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "lab.wantsSex",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_WANTS_SEX");
    },
    getResponses: function () {
      return [
        null,
        LT.ResponseSex("Let it happen", letItHappenTip(), {
          partner: lilayaPartner(),
          playerDom: true,
          consensual: true,
          positionName: "Sitting",
          startText: xml("AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_WANTS_SEX_START"),
          postSexNode: "lab.endSex",
          onEnd: function () {
            LT.game.flags.hadSexWithLilaya = true;
          },
        }),
        new LT.Response(
          "Stop this",
          "Stand up and tell Lilaya that this has gone too far. While she'll undoubtedly be upset at this sudden end, you're sure that she'd try to hit on you again if you changed your mind in the future.",
          "lab.inside",
          function () {
            LT.game.textStart = xml("AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_WANTS_SEX_DECLINED");
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "lab.moreSex",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("AUNT_HOME_LABORATORY_TESTING_MORE_SEX");
    },
    getResponses: function () {
      return [
        null,
        LT.ResponseSex("Sex", "Start having sex with Lilaya.", {
          partner: lilayaPartner(),
          playerDom: true,
          consensual: true,
          positionName: "Sitting",
          startText: xml("AUNT_HOME_LABORATORY_TESTING_MORE_SEX_START"),
          postSexNode: "lab.endSex",
          onEnd: function () {
            LT.game.flags.hadSexWithLilaya = true;
          },
        }),
        new LT.Response(
          "Stop",
          "Tell Lilaya that you need to get going. While she'll definitely be disappointed that you're stopping so soon, you can always come back later if you should change your mind.",
          "lab.inside",
          function () {
            LT.game.textStart = xml("AUNT_HOME_LABORATORY_TESTING_MORE_SEX_STOP");
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "lab.endSex",
    ui: "dialogue",
    title: "Get up",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
    },
    getContent: function () {
      var n = LT.game.npcs && LT.game.npcs.lilaya;
      if (n && !(n.orgasmedThisSex > 0)) return xml("LAB_END_SEX_NO_ORGASM");
      return xml("LAB_END_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Leave the lab and let Lilaya carry on with her work.", "lab.inside"),
      ];
    },
  });

  LT.defineNode({
    id: "lab.slaver",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("LILAYA_SLAVER_RECOMMENDATION");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "Accommodation",
          "Agree with Lilaya's observation that you'll need somewhere to keep your slaves.",
          "lab.slaverAccommodation",
          function () {
            if (LT.game.flags.slaveryQuest === "SIDE_SLAVER_NEED_RECOMMENDATION") {
              LT.game.textEnd = LT.advanceSlaveryQuest("SIDE_SLAVER_RECOMMENDATION_OBTAINED");
            }
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "lab.slaverAccommodation",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("LILAYA_SLAVER_RECOMMENDATION_SLAVE_ACCOMMODATION");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "Continue",
          "Now that you've got Lilaya's letter of recommendation, you should head back to Slaver Alley and talk to Finch.",
          "lab.inside",
        ),
      ];
    },
  });

  LT.defineNode({
    id: "lab.essences",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("LILAYA_EXPLAINS_ESSENCES");
    },
    getResponses: function () {
      return [null, new LT.Response("Listen", "Listen to Lilaya's explanation.", "lab.essences2")];
    },
  });

  LT.defineNode({
    id: "lab.essences2",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("LILAYA_EXPLAINS_ESSENCES_2");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Listen", "Listen as Lilaya shows you how to use your stored essences in order to enchant items.", "lab.essences3"),
      ];
    },
  });

  LT.defineNode({
    id: "lab.essences3",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.completeEnchantmentQuest === "function") {
        LT.game.textEnd = LT.completeEnchantmentQuest();
      }
    },
    getContent: function () {
      return xml("LILAYA_EXPLAINS_ESSENCES_3") + xml("LILAYA_EXPLAINS_ESSENCES_END");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Thank Lilaya and look around the lab.", "lab.inside")];
    },
  });

  LT.defineNode({
    id: "lab.extract",
    ui: "dialogue",
    title: "Essence extraction",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("ESSENCE_EXTRACTION");
    },
    getResponses: function () {
      function extract(amount) {
        return function () {
          var have = (LT.game.player && LT.game.player.essences) || 0;
          var n = amount === "all" ? have : Math.min(amount, have);
          if (!n) {
            LT.game.textStart = "<p>You don't have any arcane essences to extract.</p>";
            return;
          }
          LT.incrementEssenceCount(-n, false);
          LT.game.flags.extractCount = n;
          var i;
          for (i = 0; i < n; i++) LT.addItem(LT.game.player, "innoxia_items_essence_arcane");
          LT.game.flags.essenceExtractionKnown = true;
        };
      }
      var have = (LT.game.player && LT.game.player.essences) || 0;
      var one = new LT.Response("Extract (1)", "Extract one of your arcane essences.", "lab.extracted", extract(1));
      var five = new LT.Response("Extract (5)", "Extract five of your arcane essences.", "lab.extracted", extract(5));
      var twenty = new LT.Response("Extract (25)", "Extract twenty-five of your arcane essences.", "lab.extracted", extract(25));
      var all = new LT.Response("Extract (all)", "Extract all of your arcane essences.", "lab.extracted", extract("all"));
      if (have < 1) {
        one.disable("You don't have any arcane essences!");
        all.disable("You don't have any essences!");
      }
      if (have < 5) five.disable("You don't have enough arcane essences!");
      if (have < 25) twenty.disable("You don't have enough arcane essences!");
      return [
        new LT.Response("Back", "Stop extracting essences.", "lab.inside", function () {
          LT.game.flags.essenceExtractionKnown = true;
        }),
        one,
        five,
        twenty,
        all,
      ];
    },
  });

  LT.defineNode({
    id: "lab.extracted",
    ui: "dialogue",
    title: "Essence extraction",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("ESSENCE_EXTRACTION_BOTTLED");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Step away from the extraction equipment.", "lab.extract")];
    },
  });

  LT.defineNode({
    id: "lab.inside",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("LAB_EXIT");
    },
    getResponses: function () {
      return LT.getNode("lab.entry").getResponses(LT.game, 0);
    },
  });
})();
