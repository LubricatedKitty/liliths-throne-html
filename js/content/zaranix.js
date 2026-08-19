(function () {
  function xml(tag) {
    return LT.parseFromXML("places/dominion/zaranixHome/groundFloor", tag);
  }

  function workTime() {
    return LT.isWorkTime && LT.isWorkTime();
  }

  function knockCount() {
    return LT.game.flags.amberDoorKnockRepeatCount || 0;
  }

  function incrementKnock() {
    LT.game.flags.amberDoorKnockRepeatCount = knockCount() + 1;
  }

  function placeAmberOnStreet() {
    var a = LT.ensureAmber();
    var loc = LT.game.player && LT.game.player.location;
    a.location = loc ? { world: loc.world, place: loc.place, x: loc.x, y: loc.y } : { world: "DOMINION", place: "DOMINION_DEMON_HOME_ZARANIX" };
    return a;
  }

  function sendAmberHome() {
    var a = LT.game.npcs && LT.game.npcs.amber;
    if (a) a.location = null;
  }

  LT.defineNode({
    id: "zaranix.outside",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureAmber === "function") LT.ensureAmber();
      if (typeof LT.ensureKatherine === "function") LT.ensureKatherine();
    },
    getContent: function () {
      if (LT.game.flags.zaranixDiscoveredHome) {
        return xml("OUTSIDE_REPEAT") + (LT.game.flags.zaranixMaidsHostile ? xml("OUTSIDE_REPEAT_HOSTILE_MAIDS") : xml("OUTSIDE_REPEAT_NON_HOSTILE_MAIDS"));
      }
      return xml("OUTSIDE");
    },
    getResponses: function () {
      var list = [
        new LT.Response("Leave", "Turn around and walk away.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          LT.game.flags.zaranixDiscoveredHome = true;
          sendAmberHome();
        }),
      ];
      if (LT.game.flags.zaranixMaidsHostile) {
        list.push(
          new LT.Response("Knock door", "Zaranix's maids will recognise you on sight, and won't let you in. You'll have to find another way to get inside.", null).disable(
            "Zaranix's maids will recognise you on sight, and won't let you in.",
          ),
        );
      } else if (!workTime()) {
        list.push(
          new LT.Response("Knock door", "Nobody will come to answer the door at such an unsociable time. You'll have to come back during the day, or find another way to get inside.", null).disable(
            "Nobody will come to answer the door at such an unsociable time.",
          ),
        );
      } else {
        list.push(
          new LT.Response("Knock door", "Knock on the door and wait for someone to answer.", "zaranix.knock", function () {
            placeAmberOnStreet();
            LT.game.flags.zaranixDiscoveredHome = true;
            incrementKnock();
          }),
        );
      }
      if (!workTime()) {
        list.push(
          new LT.Response(
            typeof LT.canFlyOverZaranix === "function" && LT.canFlyOverZaranix() ? "Fly over fence" : "Climb fence",
            "The house is sure to be securely locked up at such an unsociable time.",
            null,
          ).disable("The house is sure to be securely locked up at such an unsociable time."),
        );
      } else if (typeof LT.canFlyOverZaranix === "function" && LT.canFlyOverZaranix()) {
        list.push(
          new LT.Response("Fly over fence", "Fly over the garden's fence and see if there's a way in through there.", "place.ZARANIX_GF_GARDEN_ENTRY", function () {
            LT.game.flags.zaranixDiscoveredHome = true;
            if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_GARDEN_ENTRY");
            LT.game.textStart =
              "<p>A small fence like the one before you is no obstacle for someone who can fly. You take a little run up before launching yourself into the air. Quickly gaining altitude, you wheel around and swoop down into the garden adjoining Zaranix's home.</p>";
          }),
        );
      } else {
        list.push(
          new LT.Response("Climb fence", "Climb over the garden's fence and see if there's a way in through there.", "place.ZARANIX_GF_GARDEN_ENTRY", function () {
            LT.game.flags.zaranixDiscoveredHome = true;
            if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_GARDEN_ENTRY");
            LT.game.textStart =
              "<p>Deciding to try and sneak your way into Zaranix's home, you loiter about the fence separating his garden from the public street, waiting for an opportunity to scale the obstacle. Once you're sure that nobody is looking your way, you quickly climb up the iron bars of the fence, and, swinging your legs over the top, you jump down into the private garden.</p>";
          }),
        );
      }
      if (LT.game.flags.zaranixKickedDownDoor) {
        list.push(
          new LT.Response("Kick down door", "After your last entrance, the front door has been reinforced. You're unable to enter like this again.", null).disable(
            "After your last entrance, the front door has been reinforced.",
          ),
        );
      } else if (typeof LT.zaranixPhysique === "function" && LT.zaranixPhysique() < 35) {
        list.push(
          new LT.Response("Kick down door", "You don't think you're strong enough to kick down such a sturdy-looking door. (Requires 35 physique.)", null).disable(
            "You don't think you're strong enough to kick down such a sturdy-looking door. (Requires 35 physique.)",
          ),
        );
      } else {
        list.push(
          new LT.Response("Kick down door", "Kick down the front door.", "zaranix.kick", function () {
            var a = LT.ensureAmber();
            a.playerKnowsName = true;
            LT.game.flags.zaranixDiscoveredHome = true;
            LT.game.flags.zaranixMaidsHostile = true;
            LT.game.flags.zaranixKickedDownDoor = true;
            if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_ENTRANCE");
            a.location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_ENTRANCE" };
          }).withColour(LT.Colour.GENERIC_BAD),
        );
      }
      return list;
    },
  });

  LT.defineNode({
    id: "zaranix.knock",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      placeAmberOnStreet();
    },
    getContent: function () {
      if (LT.game.flags.zaranixKnockedOnDoor) return xml("KNOCK_ON_DOOR_REPEAT");
      return xml("KNOCK_ON_DOOR");
    },
    getResponses: function () {
      if (LT.game.flags.zaranixKnockedOnDoor) {
        var list = [
          null,
          new LT.Response("Step back", "Step back from the door and think about finding another way in.", "zaranix.outside", function () {
            sendAmberHome();
            LT.game.textStart = xml("KNOCK_ON_DOOR_SLAMMED_IN_FACE");
          }),
          new LT.Response("Beg", "Beg the maid to let you in.", "zaranix.beg"),
        ];
        if (knockCount() >= 4) {
          list.push(
            new LT.Response("Enter", "It looks like your persistence has paid off!", "zaranix.meeting", function () {
              if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_LOUNGE");
              if (typeof LT.ensureAmber === "function") {
                LT.ensureAmber().playerKnowsName = true;
                LT.ensureAmber().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
              }
            }),
          );
        }
        return list;
      }
      return [
        new LT.Response("Leave", "Say that you've got the wrong house and take your leave.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          sendAmberHome();
          LT.game.flags.zaranixKnockedOnDoor = true;
          LT.game.textStart = xml("KNOCK_ON_DOOR_WRONG_HOUSE");
        }),
        new LT.Response("Arthur", "Ask to see Arthur.", "zaranix.askArthur", function () {
          LT.game.flags.zaranixKnockedOnDoor = true;
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.askArthur",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Step back", "Step back from the door and think about finding another way in.", "zaranix.outside", function () {
          sendAmberHome();
          LT.game.textStart = xml("KNOCK_ON_DOOR_SLAMMED_IN_FACE");
        }),
        new LT.Response("Beg", "Beg the maid to let you in.", "zaranix.beg"),
      ];
    },
  });

  function amberFight() {
    var amber = LT.ensureAmber();
    amber.playerKnowsName = true;
    return LT.ResponseCombat("Fight", "Defend yourself against the furious maid!", {
      enemy: amber,
      escapeChance: 0,
      victoryNode: "zaranix.amberVictory",
      defeatNode: "zaranix.amberDefeat",
      returnNode: "zaranix.outside",
      onVictory: function () {
        LT.game.flags.zaranixAmberSubdued = true;
        LT.game.flags.zaranixMaidsHostile = true;
        return "";
      },
    });
  }

  LT.defineNode({
    id: "zaranix.kick",
    ui: "dialogue",
    title: "Entrance Hall",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureAmber === "function") LT.ensureAmber();
      if (typeof LT.ensureKatherine === "function") LT.ensureKatherine();
    },
    getContent: function () {
      return xml("ENTRANCE_KICK_DOWN_DOOR") + (LT.game.flags.zaranixKnockedOnDoor ? xml("ENTRANCE_KICK_DOWN_DOOR_MAIDS_MET") : xml("ENTRANCE_KICK_DOWN_DOOR_MAIDS_NOT_MET"));
    },
    getResponses: function () {
      return [null, amberFight()];
    },
  });

  LT.defineNode({
    id: "zaranix.amberVictory",
    ui: "dialogue",
    title: "Victory",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var a = LT.ensureAmber();
      a.playerKnowsName = true;
    },
    getContent: function () {
      return LT.parse(
        "<p>Amber staggers back, bracing herself against the wall as she lets out one last hateful curse, [amber.speech(You... " +
          (LT.game.player && LT.game.player.isFeminine() ? "bitch..." : "bastard...") +
          ")]</p>" +
          "<p>It's quite clear that she's unable to continue fighting any longer, and after just a moment, the effects of your powerful arcane aura make themselves known. Amber's angry scowl trails off into an exceptionally lewd moan, and, averting the gaze of her luminescent eyes from you for the first time, she looks down at her groin and slips a hand under her dress.</p>" +
          "<p>[amber.speech(~Aaah!~ Fuck...)] she moans, the movement of her arm making it quite clear that she's fingering herself.</p>" +
          "<p>Despite the noise of your fight, there's no sign of the other maid whose voice you heard upon entering the house. Given the chance to have some fun with this angry, and now very horny, maid, you wonder if you should take it, or continue on your way to find Zaranix.</p>",
      );
    },
    getResponses: function () {
      return [
        null,
        typeof LT.lootResponse === "function" ? LT.lootResponse(LT.ensureAmber(), "zaranix.amberVictory") : null,
        new LT.Response("Continue", "Continue into Zaranix's house.", "place.ZARANIX_GF_ENTRANCE", function () {
          LT.game.flags.zaranixAmberSubdued = true;
          if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_ENTRANCE");
          LT.ensureAmber().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_ENTRANCE" };
        }),
        LT.ResponseSex("Use Amber", "Have some fun with this fiery maid.", {
          partner: LT.ensureAmber(),
          playerDom: true,
          consensual: true,
          startText:
            "<p>It doesn't look like any of the other maids of the household are coming to help her, so you decide to take this opportunity to have a little fun with Amber. Stepping over to where she's leaning against the wall, you reach forwards and take hold of her arm, before pulling her hand out from under her dress. Denied the freedom to get herself off, Amber pitifully looks up into your eyes, and instead of fury, you see them filled with burning lust.</p><p>She pushes herself off from the wall, wrapping her arms around your back and desperately pressing her [amber.lips+] against yours. You reciprocate the gesture, and after spending a few moments of sliding your tongues into one another's mouths, you pull back, grinning...</p>",
          postSexNode: "zaranix.amberAfterVictorySex",
        }),
        LT.ResponseSex(
          "Submit",
          "Amber's fiery personality is seriously turning you on. You can't bring yourself to take the dominant role, but you <i>do</i> want to have sex with her. Perhaps if you submitted, she'd be willing to fuck you?",
          {
            partner: LT.ensureAmber(),
            manager: "amber_doggy",
            playerDom: false,
            consensual: true,
            startText:
              "<p>Despite her currently-defeated state, you find yourself incredibly turned on by Amber's dominant, fiery personality. Not willing to take the dominant role, but with a deep desire to have sex with the now-very-horny succubus, you walk up to where she's leaning against the wall, and sigh, [pc.speech('Miss Amber' was it? Erm... If you're feeling a little horny, perhaps you could use me? I mean, I-)]</p><p>Despite the fact that you're a stranger in her master's house, Amber looks up at you with an intense, burning passion in her eyes. Sliding her hand out from under her dress, she pushes herself off of the wall, interrupting your sentence as she grabs your head and pulls you into a desperate kiss.</p><p>You reciprocate the gesture, but only spend a few moments sliding your tongues into one another's mouths before Amber pulls back, moaning, [amber.speech(Good bitch! Fuck... I'm so fucking horny! I <i>need</i> you!)]</p>",
            postSexNode: "zaranix.amberAfterVictorySex",
          },
        ),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.amberDefeat",
    ui: "dialogue",
    title: "Defeated",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureAmber === "function") LT.ensureAmber();
    },
    getContent: function () {
      return LT.parse(
        "<p>The fiery-haired maid proves to be too much for you to handle, and, unable to continue fighting, you stumble back against a nearby wall. Amber's mocking laughter rings out as she sees that you're defeated, and, stepping towards you, she growls, [amber.speech(You stupid fucking bitch! Now you're going to <i>really</i> pay!)]</p>" +
          "<p>You look up to see the burning amber eyes of the angry succubus glaring into yours, and before you can do or say anything, she reaches up with one hand and firmly grabs you by the neck. You let out a coughing splutter as her grip tightens, which only serves to make her let out another mocking laugh, [amber.speech(Hahaha! Pathetic!)]</p>" +
          "<p>With that, she suddenly hurls you to the floor, and you let out a cry as you fall down onto all fours. Amber steps around behind you, and as you try to crawl away, she delivers a stinging sharp slap to your rear end, [amber.speech(Stupid bitch! You've got me all worked up now! Time to teach you a lesson!)]</p>",
      );
    },
    getResponses: function () {
      return [
        null,
        LT.ResponseSex("Used", "Amber starts fucking you.", {
          partner: LT.ensureAmber(),
          manager: "amber_doggy",
          playerDom: false,
          consensual: false,
          positionName: "All fours",
          startText:
            "<p>Amber takes a firm grasp of your hips, before roughly lifting your ass a little higher. The sharp slap of her hand across your right cheek causes you to let out a little cry, which is met by the maid's aggressive growl, [amber.speech(Squeal all you want bitch, <i>you're mine now!</i>)]</p>",
          postSexNode: "zaranix.amberAfterDefeatSex",
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.amberAfterVictorySex",
    ui: "dialogue",
    title: "Continue",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureAmber === "function") LT.ensureAmber();
    },
    getContent: function () {
      var a = LT.game.npcs && LT.game.npcs.amber;
      var satisfied = a && a.orgasmedThisSex >= 1;
      var body = satisfied
        ? "<p>Amber lets out a deeply satisfied sigh, before sinking to the floor in total exhaustion. Despite her fatigue, you see one of her hands slip down between her legs, and, quite clearly still overwhelmed by lust, she starts masturbating in front of you. She's obviously not going to pose much of a threat like this, so you turn your attention back towards the task at hand; that of finding Zaranix and rescuing Arthur.</p>"
        : "<p>Amber lets out a desperate whine, before sinking to the floor and pressing both of her hands to her groin. Having not been satisfied, she's quite clearly still overcome by her intense lust, and starts frantically masturbating right there on the floor. She's obviously not going to pose much of a threat like this, so you turn your attention back towards the task at hand; that of finding Zaranix and rescuing Arthur.</p>";
      return LT.parse(body + "<p>Conscious of the fact that there are other maids to look out for, you prepare to set off further into the house...</p>");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Continue into Zaranix's house.", "place.ZARANIX_GF_ENTRANCE", function () {
          LT.game.flags.zaranixAmberSubdued = true;
          if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_ENTRANCE");
          LT.ensureAmber().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_ENTRANCE" };
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.amberAfterDefeatSex",
    ui: "dialogue",
    title: "Used",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.parse(
        "<p>You collapse to the floor, totally exhausted from Amber's rough treatment of you. With a final, scornful sneer, Amber stands up, [amber.speech(That's all bitches like you are good for! Now get the fuck out of this house!)]</p>" +
          "<p>Reaching down to grab you by the back of the neck, Amber mercilessly drags you to the front door. Yanking it open, she spits one last hateful remark your way, before literally kicking you out into the street and slamming the door behind you.</p>",
      );
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "You've been thrown back out onto the street.", "place.DOMINION_DEMON_HOME_ZARANIX", function () {
          sendAmberHome();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.beg",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR_BEG");
    },
    getResponses: function () {
      var list = [
        new LT.Response("Back out", "Stand up and step back. You're definitely not willing to do anything like that.", "zaranix.outside", function () {
          sendAmberHome();
          LT.game.textStart = xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR_BEG_REFUSE");
        }),
      ];
      if (typeof LT.zaranixFootOn === "function" && LT.zaranixFootOn()) {
        list.push(
          new LT.Response("Reluctant lick", "If this is what it's going to take to finally meet Arthur, you suppose that you'll do it.", "zaranix.begReluctant", function () {
            LT.ensureAmber().playerKnowsName = true;
          }),
        );
        list.push(
          new LT.Response("Eager lick", "Immediately drop down onto all fours and enthusiastically lick the maid's shoes.", "zaranix.begEager", function () {
            LT.ensureAmber().playerKnowsName = true;
          }),
        );
      } else {
        list.push(
          new LT.Response("Good doggy", "Do as this dominant succubus says and drop down onto all fours, before telling her that you're a good doggy.", "zaranix.begDoggy", function () {
            LT.ensureAmber().playerKnowsName = true;
          }),
        );
      }
      return list;
    },
  });

  function goLounge() {
    if (typeof LT.enterZaranixHouse === "function") LT.enterZaranixHouse("ZARANIX_GF_LOUNGE");
    var a = LT.ensureAmber();
    a.location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
    if (typeof LT.ensureZaranix === "function") {
      LT.ensureZaranix().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
    }
  }

  LT.defineNode({
    id: "zaranix.begDoggy",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("OUTSIDE_KNOCK_ON_DOOR_ASK_FOR_ARTHUR_GOOD_DOGGY");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Inside", "Crawl alongside Amber as she leads you into the house.", "zaranix.meeting", goLounge),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.begReluctant",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR_BEG_RELUCTANT_LICK");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Inside", "Crawl alongside Amber as she leads you into the house.", "zaranix.meeting", goLounge),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.begEager",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 60,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR_BEG_EAGER_LICK");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Wait", "Do as Amber says and wait for her return.", "zaranix.meeting", function () {
          LT.game.textStart = xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR_BEG_WAITING");
          goLounge();
        }),
        new LT.Response("Lick soles", "Don't let Amber get away just yet! You still haven't cleaned the soles of her shoes!", "zaranix.begSoles"),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.begSoles",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("KNOCK_ON_DOOR_ASK_FOR_ARTHUR_BEG_EAGER_LICK_SOLES");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Inside", "Crawl alongside Amber as she leads you into the house.", "zaranix.meeting", goLounge),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.meeting",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags.amberRepeatEncountered = true;
      if (typeof LT.ensureZaranix === "function") LT.ensureZaranix();
    },
    getContent: function () {
      return xml("MEETING_ZARANIX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Sit on floor", "Do as Amber commands and sit on the floor.", "zaranix.sitFloor", function () {
          LT.game.flags.amberSatOnFloor = true;
          if (typeof LT.ensureZaranix === "function") {
            LT.ensureZaranix().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
          }
        }),
        new LT.Response("Sit on sofa", "Disobey Amber and sit on one of the sofas.", "zaranix.sitSofa", function () {
          if (typeof LT.ensureZaranix === "function") {
            LT.ensureZaranix().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
          }
        }),
      ];
    },
  });

  function afterSitResponses() {
    return [
      null,
      new LT.Response("Hold back", "Simply say that Lilaya wants Arthur back, and avoid telling Zaranix anything about why.", "zaranix.holdBack"),
      new LT.Response("Explain everything", "Tell Zaranix all about your appearance in this world, and how Lilaya needs Arthur's help in order to find out what's going on.", "zaranix.explainAll"),
    ];
  }

  LT.defineNode({
    id: "zaranix.sitFloor",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("MEETING_ZARANIX_SIT_FLOOR");
    },
    getResponses: afterSitResponses,
  });

  LT.defineNode({
    id: "zaranix.sitSofa",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("MEETING_ZARANIX_SIT_SOFA");
    },
    getResponses: afterSitResponses,
  });

  function meetArthur() {
    if (typeof LT.ensureArthur === "function") {
      LT.ensureArthur().location = { world: "ZARANIX_HOUSE_GROUND_FLOOR", place: "ZARANIX_GF_LOUNGE" };
    }
    LT.game.textEnd = typeof LT.rescueArthur === "function" ? LT.rescueArthur({ move: false }) : "";
  }

  function sendArthurToLab() {
    if (typeof LT.placeArthurInLab === "function") LT.placeArthurInLab();
  }

  LT.defineNode({
    id: "zaranix.holdBack",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("MEETING_ZARANIX_HOLD_BACK");
    },
    getResponses: function () {
      return [null, new LT.Response("Arthur", "You finally come face-to-face with your elusive quarry.", "zaranix.meetArthur", meetArthur)];
    },
  });

  LT.defineNode({
    id: "zaranix.explainAll",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("MEETING_ZARANIX_EXPLAIN_EVERYTHING");
    },
    getResponses: function () {
      return [null, new LT.Response("Arthur", "You finally come face-to-face with your elusive quarry.", "zaranix.meetArthur", meetArthur)];
    },
  });

  LT.defineNode({
    id: "zaranix.meetArthur",
    ui: "dialogue",
    title: "Lounge",
    secondsPassed: 30,
    travelDisabled: true,
    continuesDialogue: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("MEETING_ZARANIX_ARTHUR");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Refuse to perform any sexual favours for Zaranix or Amber and take your leave.", "zaranix.refuseSex", function () {
          sendArthurToLab();
        }),
        LT.ResponseSex("'Thank' Zaranix", "Show Zaranix how grateful you are.", {
          partner: typeof LT.ensureZaranix === "function" ? LT.ensureZaranix() : { id: "zaranix", name: "Zaranix" },
          playerDom: false,
          consensual: true,
          startText: xml("MEETING_ZARANIX_ARTHUR_THANK_ZARANIX") + xml("MEETING_ZARANIX_ARTHUR_THANK_ZARANIX_START_SEX"),
          postSexNode: "zaranix.afterThankZaranix",
        }),
        LT.ResponseSex("'Thank' Amber", "Show Amber how grateful you are.", {
          partner: LT.ensureAmber(),
          playerDom: false,
          consensual: true,
          startText: xml("MEETING_ZARANIX_ARTHUR_THANK_AMBER"),
          postSexNode: "zaranix.afterThankAmber",
        }),
      ];
    },
  });

  LT.defineNode({
    id: "zaranix.refuseSex",
    ui: "dialogue",
    title: "Zaranix's Home",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendArthurToLab();
      if (typeof LT.resetZaranixHouse === "function") LT.resetZaranixHouse();
      if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_DEMON_HOME_ZARANIX");
    },
    getContent: function () {
      return xml("MEETING_ZARANIX_ARTHUR_REFUSE_SEX");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your journey.", "place.DOMINION_DEMON_HOME_ZARANIX")];
    },
  });

  LT.defineNode({
    id: "zaranix.afterThankZaranix",
    ui: "dialogue",
    title: "Zaranix is finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendArthurToLab();
      if (typeof LT.resetZaranixHouse === "function") LT.resetZaranixHouse();
      if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_DEMON_HOME_ZARANIX");
    },
    getContent: function () {
      return xml("AFTER_SEX_THANKING_ZARANIX");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your journey.", "place.DOMINION_DEMON_HOME_ZARANIX")];
    },
  });

  LT.defineNode({
    id: "zaranix.afterThankAmber",
    ui: "dialogue",
    title: "Amber is finished",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      sendArthurToLab();
      if (typeof LT.resetZaranixHouse === "function") LT.resetZaranixHouse();
      if (typeof LT.enterWorld === "function") LT.enterWorld("DOMINION", "DOMINION_DEMON_HOME_ZARANIX");
    },
    getContent: function () {
      return xml("AFTER_SEX_THANKING_AMBER");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your journey.", "place.DOMINION_DEMON_HOME_ZARANIX")];
    },
  });
})();
