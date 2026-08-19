(function () {
  function nestXml(tag) {
    return LT.parseFromXML("places/dominion/harpyNests/helena", tag);
  }

  function romanceDone() {
    return !!(LT.game.flags && LT.game.flags.helenaRomance === "complete");
  }

  function scarlett() {
    return typeof LT.ensureScarlett === "function" ? LT.ensureScarlett() : LT.game.npcs && LT.game.npcs.scarlett;
  }

  function helena() {
    return typeof LT.ensureHelena === "function" ? LT.ensureHelena() : LT.game.npcs && LT.game.npcs.helena;
  }

  function likesScarlett() {
    var s = scarlett();
    return !!(s && s.isLikesPlayer && s.isLikesPlayer());
  }

  function attractedScarlett() {
    var s = scarlett();
    return !!(s && s.isAttractedTo && s.isAttractedTo());
  }

  function scarlettHasPenis() {
    var s = scarlett();
    return !!(s && s.hasPenis && s.hasPenis());
  }

  function playerHas(fn) {
    var p = LT.game.player;
    return !!(p && p[fn] && p[fn]());
  }

  function dayNow() {
    return typeof LT.dayNumber === "function" ? LT.dayNumber() : 1;
  }

  function dailyOn(name) {
    return !!(LT.game.flags && LT.game.flags[name] === dayNow());
  }

  function setDaily(name) {
    LT.game.flags[name] = dayNow();
  }

  function aff(npc, amount) {
    return typeof LT.incrementAffection === "function" ? LT.incrementAffection(npc, amount) : "";
  }

  function applyScarlettFucked() {
    LT.game.flags.scarlettGoneHome = dayNow();
  }

  function nestTalkResponses() {
    var list = [
      new LT.Response("Leave", "Say goodbye to Helena and exit her nest.", "place.HARPY_NESTS_HELENAS_NEST", function () {
        var h = helena();
        if (h) h.reactedPregnancy = true;
        if (h && h.isSlutty && h.isSlutty()) LT.game.flags.helenaSlutSeen = true;
      }),
    ];
    if (LT.game.currentNode && LT.game.currentNode.id === "helena.nestTalk") {
      list.push(new LT.Response("Talk", "You are already talking to Helena...", null).disable("You are already talking to Helena..."));
    } else if (dailyOn("helenaNestTalkedTo")) {
      list.push(new LT.Response("Talk", "You've already spent some time talking to Helena in her nest today...", null).disable("You've already spent some time talking to Helena in her nest today..."));
    } else {
      list.push(
        new LT.Response("Talk", "Ask Helena how she is.", "helena.nestTalk", function () {
          setDaily("helenaNestTalkedTo");
          LT.game.textEnd = aff(helena(), 2);
        }),
      );
    }
    var h = helena();
    if (h && h.isSlutty && h.isSlutty()) {
      if (dailyOn("helenaNestFucked")) {
        list.push(new LT.Response("Apartment", "You've already had sex with Helena in her nest today, and she doesn't have time to do it again...", null).disable("You've already had sex with Helena in her nest today, and she doesn't have time to do it again..."));
      } else {
        list.push(
          LT.ResponseSex
            ? new LT.Response("Apartment", "Accept Helena's offer of 'showing you around her apartment'.<br/>" + (typeof LT.parse === "function" ? LT.parse("[style.italicsSex(This will lead into having sex with her...)]") : "This will lead into having sex with her..."), "helena.apartment", function () {
                if (h) h.reactedPregnancy = true;
                setDaily("helenaNestFucked");
                LT.game.flags.helenaSlutSeen = true;
                LT.game.textEnd = aff(h, 5);
              }).withColour(LT.Colour.ATTRIBUTE_LUST)
            : new LT.Response("Apartment", "Accept Helena's offer of 'showing you around her apartment'.", "helena.apartment"),
        );
      }
    }
    return list;
  }

  function sexResponse(title, tip, opts) {
    if (typeof LT.ResponseSex === "function") return LT.ResponseSex(title, tip, opts);
    return new LT.Response(title, tip, opts.postSexNode || "sex.scene", function () {
      if (opts && opts.onEnd) opts.onEnd();
    }).withColour(LT.Colour.ATTRIBUTE_LUST);
  }

  function scarlettSex(title, tip, kind, startTag, playerDom) {
    return sexResponse(title, tip, {
      partner: scarlett(),
      playerDom: playerDom !== false,
      consensual: true,
      startText: nestXml(startTag),
      postSexNode: "helena.afterScarlettSex",
      onEnd: function () {
        LT.game.flags.scarlettLastSex = kind;
      },
    });
  }

  function servantSex(title, tip, startTag, postNode) {
    return sexResponse(title, tip, {
      partner: scarlett(),
      playerDom: true,
      consensual: true,
      startText: nestXml(startTag),
      postSexNode: postNode || "helena.afterServantSex",
    });
  }

  function rewardSex(title, tip, startTag) {
    return sexResponse(title, tip, {
      partner: scarlett(),
      playerDom: true,
      consensual: true,
      startText: nestXml(startTag),
      postSexNode: "helena.afterRewardSex",
    });
  }

  LT.defineNode({
    id: "helena.nest",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureHelena === "function") LT.ensureHelena();
    },
    getContent: function () {
      return nestXml("HELENAS_NEST");
    },
    getResponses: nestTalkResponses,
  });

  LT.defineNode({
    id: "helena.nestTalk",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 1800,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_TALK");
    },
    getResponses: nestTalkResponses,
  });

  LT.defineNode({
    id: "helena.apartment",
    ui: "dialogue",
    title: "Helena's Bedroom",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.helenaBedroomFromNest = true;
    },
    getContent: function () {
      return nestXml("HELENAS_NEST_APARTMENT_BEDROOM");
    },
    getResponses: function () {
      var h = helena();
      var list = [new LT.Response("Leave", "Leave Helena's bedroom and return to the nest.", "place.HARPY_NESTS_HELENAS_NEST")];
      if (typeof sexResponse === "function") {
        list.push(
          sexResponse("Sex", "Have sex with Helena.", {
            partner: h,
            playerDom: !(h && h.hasFetish && h.hasFetish("DOMINANT")),
            consensual: true,
            startText: "",
            postSexNode: "helena.afterApartment",
          }),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.afterApartment",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "<p>Once the two of you have finished, Helena leads you back up to her nest.</p>";
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Return to Helena's nest.", "place.HARPY_NESTS_HELENAS_NEST")];
    },
  });

  function meetScarlettResponses() {
    var list = [
      new LT.Response(
        "Leave",
        likesScarlett()
          ? "Tell Scarlett that you only wanted to stop by and say hello, and that you've got to leave now."
          : "Not wanting to put up with her awful attitude, you tell Scarlett that you're going to leave.",
        "place.HARPY_NESTS_HELENAS_NEST",
        function () {
          LT.game.textStart = nestXml(romanceDone() ? "HELENAS_NEST_MEETING_SCARLETT_STEP_BACK_POST_QUEST" : "HELENAS_NEST_MEETING_SCARLETT_STEP_BACK");
        },
      ),
    ];
    if (romanceDone()) {
      if (!attractedScarlett()) {
        list.push(new LT.Response("Servant", "As Scarlett is not attracted to you, she does not want you acting as her servant...", null).disable("As Scarlett is not attracted to you, she does not want you acting as her servant..."));
      } else if ((typeof LT.dayMinutes === "function" ? LT.dayMinutes() : 0) > 1140) {
        list.push(
          new LT.Response("Servant", "It's too late in the day to start working as Scarlett's servant. You should try again another day before [units.time(19)]...", null).disable(
            "It's too late in the day to start working as Scarlett's servant.",
          ),
        );
      } else {
        list.push(
          new LT.Response(
            "Servant",
            likesScarlett() ? "Tell Scarlett that you'd like to repay her kindness towards you by acting as her servant for the day." : "Work as Scarlett's servant for the day to get a chance at fucking her.",
            "helena.servant",
            function () {
              LT.game.textEnd = aff(scarlett(), 5);
            },
          ),
        );
      }
      if (likesScarlett()) {
        if (dailyOn("scarlettRelaxed")) {
          list.push(
            new LT.Response("Relax", "Scarlett has already spent time relaxing with you today. If you wanted to spend more time with her, you'll have to return tomorrow.", null).disable(
              "Scarlett has already spent time relaxing with you today.",
            ),
          );
        } else {
          list.push(
            new LT.Response("Relax", "Accept Scarlett's invitation to sit down and relax with her for a while.", "helena.scarlettRelax", function () {
              setDaily("scarlettRelaxed");
            }),
          );
        }
      }
    } else if (scarlettHasPenis()) {
      if (LT.isAnalContentEnabled && LT.isAnalContentEnabled()) {
        if (!attractedScarlett()) {
          list.push(new LT.Response("Offer ass", "Scarlett is not attracted to you, and so is unwilling to have sex with you.", null).disable("Scarlett is not attracted to you, and so is unwilling to have sex with you."));
        } else {
          list.push(scarlettSex("Offer ass", "Tell Scarlett that if that's what she wants, then of course she can fuck your ass.", "anal", "START_SCARLETT_SEX", false));
        }
      } else if (playerHas("hasVagina")) {
        if (!attractedScarlett()) {
          list.push(new LT.Response("Offer pussy", "Scarlett is not attracted to you, and so is unwilling to have sex with you.", null).disable("Scarlett is not attracted to you, and so is unwilling to have sex with you."));
        } else {
          list.push(scarlettSex("Offer pussy", "Tell Scarlett that if that's what she wants, then of course she can fuck your pussy.", "vagina", "START_SCARLETT_SEX_VAGINA", false));
        }
      } else if (!attractedScarlett()) {
        list.push(new LT.Response("Offer oral", "Scarlett is not attracted to you, and so is unwilling to have sex with you.", null).disable("Scarlett is not attracted to you, and so is unwilling to have sex with you."));
      } else {
        list.push(scarlettSex("Offer oral", "Tell Scarlett that if that's what she wants, then of course you'll suck her cock.", "oral", "START_SCARLETT_SEX_ORAL", false));
      }
    }
    if (LT.game.flags && LT.game.flags.helenaRomance === "ROMANCE_HELENA_4_SCARLETTS_RETURN") {
      list.push(
        new LT.Response("Helena", "Tell Scarlett that Helena is requesting her presence back at her shop in Slaver Alley.", "helena.scarlettToShop", function () {
          var s = scarlett();
          if (s) s.location = { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SCARLETTS_SHOP" };
          LT.game.flags.helenaScarlettToldToReturn = true;
        }),
      );
    }
    return list;
  }

  LT.defineNode({
    id: "helena.meetScarlett",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureScarlett === "function") LT.ensureScarlett();
      LT.game.textStart = nestXml(romanceDone() ? "HELENAS_NEST_MEETING_SCARLETT_HELENA_QUEST_COMPLETE" : "HELENAS_NEST_MEETING_SCARLETT");
      var s = scarlett();
      if (s) s.reactedPregnancy = true;
    },
    getContent: function () {
      return "";
    },
    getResponses: meetScarlettResponses,
  });

  LT.defineNode({
    id: "helena.scarlettToShop",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_MEETING_SCARLETT_TO_SHOP");
    },
    getResponses: function () {
      var fly;
      if (LT.isPartyAbleToFly && LT.isPartyAbleToFly()) {
        fly = new LT.Response("Fly after her", "Take off and fly after Scarlett.", "place.SLAVER_ALLEY_SCARLETTS_SHOP", function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("SLAVER_ALLEY", "SLAVER_ALLEY_SCARLETTS_SHOP");
          LT.game.textStart = nestXml("HELENAS_NEST_MEETING_SCARLETT_TO_SHOP_FLY_AFTER");
        });
      } else {
        fly = new LT.Response("Fly after her", "As you are unable to fly, you cannot fly after Scarlett...", null).disable("As you are unable to fly, you cannot fly after Scarlett...");
      }
      return [null, new LT.Response("Step back", "Now that your work here is done, there's nothing left to do but step back and prepare to travel back down to Helena's store in Slaver Alley...", "place.HARPY_NESTS_HELENAS_NEST"), fly];
    },
  });

  LT.defineNode({
    id: "helena.afterScarlettSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var kind = LT.game.flags && LT.game.flags.scarlettLastSex;
      if (kind === "oral") return nestXml("AFTER_SCARLETT_SEX_ORAL");
      if (kind === "vagina") return nestXml("AFTER_SCARLETT_SEX_VAGINA");
      return nestXml("AFTER_SCARLETT_SEX");
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "Do as Scarlett says and leave the nest...", "place.HARPY_NESTS_HELENAS_NEST")];
    },
  });

  LT.defineNode({
    id: "helena.scarlettRelax",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 3600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_SCARLETT_RELAX");
    },
    getResponses: function () {
      var list = [null];
      if (!attractedScarlett()) {
        list.push(new LT.Response("Apartment", "As Scarlett is not attracted to you, she will not invite you to spend some time with her in her room...", null).disable("As Scarlett is not attracted to you, she will not invite you to spend some time with her in her room..."));
      } else {
        list.push(
          new LT.Response("Apartment", "Accept Scarlett's invitation to spend some time with her in her room.", "helena.servantRewardSex", function () {
            LT.game.textStart = nestXml("HELENAS_NEST_SCARLETT_RELAX_APARTMENT");
          }).withColour(LT.Colour.ATTRIBUTE_LUST),
        );
      }
      list.push(
        new LT.Response(
          attractedScarlett() ? "Decline" : "Leave",
          attractedScarlett()
            ? "Tell Scarlett that you've got other matters which require your attention today, before taking your leave and heading back out of Helena's nest."
            : "Say goodbye to Scarlett and head out of Helena's nest.",
          "place.HARPY_NESTS_HELENAS_NEST",
          function () {
            LT.game.textStart = nestXml("HELENAS_NEST_SCARLETT_RELAX_LEAVE");
          },
        ),
      );
      return list;
    },
  });

  LT.defineNode({
    id: "helena.servant",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 1800,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_SCARLETTS_SERVANT");
    },
    getResponses: function () {
      var list = [
        null,
        new LT.Response("Back massage", "Choose to massage Scarlett's back...", "helena.servantBack", function () {
          LT.game.textEnd = aff(scarlett(), 5);
        }),
        new LT.Response("Groom wings", "Choose to groom Scarlett's wings...", "helena.servantWings", function () {
          LT.game.textEnd = aff(scarlett(), 5);
        }),
      ];
      if (LT.isFootContentEnabled && LT.isFootContentEnabled()) {
        list.push(
          new LT.Response("Talons", "Choose to massage Scarlett's bird-like feet...", "helena.servantFeet", function () {
            LT.game.textEnd = aff(scarlett(), 5);
          }),
        );
      }
      return list;
    },
  });

  function holdBack(startTag) {
    return new LT.Response("Hold back", "Choose to hold back and wait until later for Scarlett's reward.", "helena.servantReward", function () {
      LT.game.textStart = nestXml(startTag);
    });
  }

  LT.defineNode({
    id: "helena.servantBack",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 3600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.textStart = nestXml("HELENAS_NEST_SCARLETTS_SERVANT_BACK_MASSAGE");
    },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      var list = [null, holdBack("HELENAS_NEST_SCARLETTS_SERVANT_BACK_MASSAGE_HOLD_BACK")];
      if (scarlettHasPenis()) {
        list.push(servantSex("Blowjob", "Take your reward now and suck Scarlett's cock while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_BACK_MASSAGE_BLOWJOB"));
      } else {
        list.push(servantSex("Cunnilingus", "Take your reward now and orally service Scarlett's pussy while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_BACK_MASSAGE_CUNNILINGUS"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.servantWings",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 3600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_SCARLETTS_SERVANT_GROOM_WINGS");
    },
    getResponses: function () {
      var list = [null, holdBack("HELENAS_NEST_SCARLETTS_SERVANT_GROOM_WINGS_HOLD_BACK")];
      if (scarlettHasPenis()) {
        list.push(servantSex("Handjob", "Take your reward now and jerk off Scarlett's cock while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_GROOM_WINGS_HANDJOB"));
      } else {
        list.push(servantSex("Finger her", "Take your reward now and finger Scarlett's pussy while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_GROOM_WINGS_FINGERING"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.servantFeet",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 3600,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FOOT_MASSAGE");
    },
    getResponses: function () {
      var list = [null, holdBack("HELENAS_NEST_SCARLETTS_SERVANT_FOOT_MASSAGE_HOLD_BACK")];
      if (scarlettHasPenis()) {
        list.push(servantSex("Blowjob", "Take your reward now and suck Scarlett's cock while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_FOOT_MASSAGE_BLOWJOB"));
      } else {
        list.push(servantSex("Cunnilingus", "Take your reward now and orally service Scarlett's pussy while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_FOOT_MASSAGE_CUNNILINGUS"));
      }
      if (playerHas("hasPenis")) {
        list.push(servantSex("Talon-job", "Take your reward now and have Scarlett use her talons to jerk you off while the other harpies continue to pamper her...", "HELENAS_NEST_SCARLETTS_SERVANT_FOOT_MASSAGE_TALONJOB"));
      } else {
        list.push(new LT.Response("Talon-job", "As you don't have a penis, you cannot receive a talon-job from Scarlett...", null).disable("As you don't have a penis, you cannot receive a talon-job from Scarlett..."));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.afterServantSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("AFTER_SCARLETT_SERVANT_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Continue on your way over to the entrance of Helena's nest.", "place.HARPY_NESTS_HELENAS_NEST", function () {
          applyScarlettFucked();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.servantReward",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(1260) : 60) * 60;
    },
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.scarlettRewardRoll = Math.random();
    },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      var roll = LT.game.flags.scarlettRewardRoll;
      if (roll == null) roll = 0;
      return [
        new LT.Response("Back out", "Back out of this and tell Scarlett that you're going to leave...", "helena.servantRewardLeave"),
        new LT.Response("Kiss feet", "Kiss Scarlett's feet.<br/>" + (typeof LT.parse === "function" ? LT.parse("[style.italicsExcellent(She will definitely choose you as her partner if you do this!)]") : "She will definitely choose you as her partner if you do this!"), "helena.servantRewardSex", function () {
          LT.game.textStart = nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_KISS_FEET") + nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_CHOSEN");
          LT.game.textEnd = aff(scarlett(), 10);
        }).withColour(LT.Colour.ATTRIBUTE_LUST),
        new LT.Response(
          "Bow down",
          "Bow down in front of Scarlett.<br/>" + (typeof LT.parse === "function" ? LT.parse("[style.italicsGood(She is likely, but not certain, to choose you as her partner if you do this.)]") : "She is likely, but not certain, to choose you as her partner if you do this."),
          roll < 0.75 ? "helena.servantRewardSex" : "helena.servantNotChosen",
          function () {
            if (roll < 0.75) {
              LT.game.textStart = nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_BOW_DOWN") + nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_CHOSEN");
              LT.game.textEnd = aff(scarlett(), 5);
            } else {
              LT.game.textStart = nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_BOW_DOWN_NOT_CHOSEN");
            }
          },
        ).withColour(LT.Colour.ATTRIBUTE_LUST),
        new LT.Response(
          "Flatter",
          "Do your best to flatter and impress Scarlett.<br/>" + (typeof LT.parse === "function" ? LT.parse("[style.italicsMinorGood(She is just as likely as not to choose you as her partner if you do this.)]") : "She is just as likely as not to choose you as her partner if you do this."),
          roll < 0.5 ? "helena.servantRewardSex" : "helena.servantNotChosen",
          function () {
            if (roll < 0.5) {
              LT.game.textStart = nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_FLATTER") + nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_CHOSEN");
            } else {
              LT.game.textStart = nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_FLATTER_NOT_CHOSEN");
            }
          },
        ).withColour(LT.Colour.ATTRIBUTE_LUST),
      ];
    },
  });

  LT.defineNode({
    id: "helena.servantRewardLeave",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_LEAVE");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Exit Helena's nest.", "place.HARPY_NESTS_HELENAS_NEST", function () {
          applyScarlettFucked();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.servantNotChosen",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      applyScarlettFucked();
    },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      return [null, new LT.Response("Leave", "Leave the nest and hope to be chosen by Scarlett the next time you decide to act as her servant...", "place.HARPY_NESTS_HELENAS_NEST")];
    },
  });

  LT.defineNode({
    id: "helena.servantRewardSex",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: 300,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return "";
    },
    getResponses: function () {
      var list = [rewardSex("No preference", "Tell Scarlett that you have no preference in how you want her to fuck you, and that she can figure it out after getting started...", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_NO_PREFERENCE")];
      if (scarlettHasPenis()) {
        list.push(rewardSex("Blowjob", "Tell Scarlett that you want to suck her cock.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SEX_BLOWJOB"));
        if (LT.isAnalContentEnabled && LT.isAnalContentEnabled()) {
          list.push(rewardSex("Anal", "Ask Scarlett to fuck your ass.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SEX_ANAL"));
        }
        if (playerHas("hasVagina")) {
          list.push(rewardSex("Fucked", "Ask Scarlett to fuck your pussy.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SEX_VAGINAL"));
        }
      } else {
        list.push(rewardSex("Cunnilingus", "Tell Scarlett that you want to eat her out.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SEX_CUNNILINGUS"));
        if (playerHas("hasVagina")) {
          list.push(rewardSex("Scissor", "Ask Scarlett if you can scissor with her.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SCISSORING"));
        }
        if (playerHas("hasPenis")) {
          list.push(rewardSex("Fuck her", "Tell Scarlett that you want to fuck her pussy.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SEX_FUCK_HER"));
          if (LT.isAnalContentEnabled && LT.isAnalContentEnabled()) {
            var s = scarlett();
            var assVirgin = !!(s && s.sex && s.sex.assVirgin);
            list.push(rewardSex(assVirgin ? "Take anal virginity" : "Anal", assVirgin ? "Ask Scarlett if you can take her anal virginity and fuck her ass." : "Ask Scarlett if you can fuck her ass.", "HELENAS_NEST_SCARLETTS_SERVANT_FINAL_REWARD_SEX_FUCK_HER_ASS"));
          }
        }
      }
      return list;
    },
  });

  LT.defineNode({
    id: "helena.afterRewardSex",
    ui: "dialogue",
    title: "Finished",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      applyScarlettFucked();
    },
    getContent: function () {
      return nestXml("AFTER_SCARLETT_SERVANT_FINAL_REWARD_SEX");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Tell Scarlett that you need to be leaving now and ride the elevator back up to Helena's nest...", "place.HARPY_NESTS_HELENAS_NEST", function () {
          LT.game.textStart = nestXml("AFTER_SCARLETT_SERVANT_FINAL_REWARD_SEX_LEAVE");
        }),
        new LT.Response("Sleep over", "Agree to spend the night with Scarlett.", "helena.sleepOver", function () {
          LT.game.textEnd = aff(scarlett(), 5);
        }),
      ];
    },
  });

  LT.defineNode({
    id: "helena.sleepOver",
    ui: "dialogue",
    title: "Helena's nest",
    secondsPassed: function () {
      return (typeof LT.minutesUntilTime === "function" ? LT.minutesUntilTime(480) : 480) * 60;
    },
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return nestXml("AFTER_SCARLETT_SERVANT_FINAL_REWARD_SEX_SLEEP_OVER");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on over to the exit of Helena's nest...", "place.HARPY_NESTS_HELENAS_NEST")];
    },
  });
})();
