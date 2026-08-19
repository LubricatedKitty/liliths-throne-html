(function () {
  function pixXml(tag) {
    return LT.parseFromXML("places/dominion/shoppingArcade/pixsPlayground", tag);
  }

  function flags() {
    LT.game.flags = LT.game.flags || {};
    return LT.game.flags;
  }

  function hasCard() {
    return typeof LT.countItems === "function" && LT.countItems(LT.game.player, "innoxia_quest_gym_membership_card") > 0;
  }

  function pixHere() {
    return typeof LT.isWorkTime === "function" && LT.isWorkTime();
  }

  function insideGym() {
    return !!(hasCard() || flags().innoxia_pix_session_started);
  }

  function sexResponse(title, tip, opts) {
    if (typeof LT.ResponseSex === "function") return LT.ResponseSex(title, tip, opts);
    return new LT.Response(title, tip, opts.postSexNode || "pix.showerAfter").withColour(LT.Colour.ATTRIBUTE_LUST);
  }

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_PIXS_GYM",
    ui: "dialogue",
    title: "Pix's Playground (Exterior)",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensurePix === "function") LT.ensurePix();
    },
    getContent: function () {
      return pixXml("GYM_EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      list.push(new LT.Response("Enter", "Enter the gym.", "pix.reception"));
      return list;
    },
  });

  function receptionResponses() {
    var list = [new LT.Response("Leave", "Leave the gym.", "pix.exit")];
    if (!flags().innoxia_pix_introduced) {
      list.push(
        new LT.Response("Follow", "Follow Pix on a tour of the gym.", "pix.tour", function () {
          flags().innoxia_pix_introduced = true;
          flags().innoxia_pix_had_tour = true;
        }),
      );
      return list;
    }
    if (pixHere() && !flags().innoxia_pix_had_tour) {
      list.push(
        new LT.Response("Follow", "Follow Pix on a tour of the gym.", "pix.tour", function () {
          flags().innoxia_pix_had_tour = true;
        }),
      );
      return list;
    }
    if (pixHere() && !hasCard()) {
      if (LT.getMoney() >= 8000) {
        list.push(
          new LT.Response("Membership (8000)", "Sign up for a lifetime membership for 8000 flames.", "pix.membership", function () {
            LT.game.textEnd = LT.incrementMoney(-8000);
            if (typeof LT.addItem === "function") LT.addItem(LT.game.player, "innoxia_quest_gym_membership_card");
          }),
        );
      } else {
        list.push(new LT.Response("Membership (8000)", "You cannot afford the 8000 flame membership.", null).disable("You need 8000 flames."));
      }
    }
    if (!hasCard() && !flags().innoxia_pix_session_started) {
      if (LT.getMoney() >= 100) {
        list.push(
          new LT.Response("Session (100)", "Pay 100 flames for a single session.", "pix.session", function () {
            flags().innoxia_pix_session_started = true;
            LT.game.textEnd = LT.incrementMoney(-100);
          }),
        );
      } else {
        list.push(new LT.Response("Session (100)", "You cannot afford a 100 flame session.", null).disable("You need 100 flames."));
      }
    }
    if (insideGym()) {
      list.push(new LT.Response("Showers", "Head to the changing rooms and showers.", "pix.showers"));
      if (hasCard() && pixHere() && !flags().innoxia_pix_workout_pix_completed) {
        list.push(new LT.Response("Personal training", "Ask Pix for a personal workout session.", "pix.workout"));
      } else if (hasCard() && flags().innoxia_pix_workout_pix_completed) {
        list.push(new LT.Response("Personal training", "Pix already put you through a session today.", null).disable("Come back once you've recovered."));
      }
    }
    if (pixHere() && flags().innoxia_pix_had_tour) {
      list.push(new LT.Response("Talk", "Talk to Pix about the gym.", "pix.talkGym"));
    }
    return list;
  }

  LT.defineNode({
    id: "pix.reception",
    ui: "dialogue",
    title: "Reception",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensurePix === "function") LT.ensurePix();
      var day = typeof LT.dayNumber === "function" ? LT.dayNumber() : 1;
      if (flags().pixWorkoutDay !== day) {
        flags().innoxia_pix_workout_pix_completed = false;
        flags().pixWorkoutDay = day;
      }
    },
    getContent: function () {
      return pixXml("RECEPTION");
    },
    getResponses: receptionResponses,
  });

  LT.defineNode({
    id: "pix.exit",
    ui: "dialogue",
    title: "Pix's Playground",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml(flags().innoxia_pix_introduced ? "EXIT" : "EXIT_INITIAL_ENTRY");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Leave the gym.", "place.SHOPPING_ARCADE_PIXS_GYM", function () {
          flags().innoxia_pix_session_started = false;
        }),
        new LT.Response("Stay", "Turn around and return to reception.", "pix.reception"),
      ];
    },
  });

  LT.defineNode({
    id: "pix.tour",
    ui: "dialogue",
    title: "Tour",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_TOUR") + pixXml("RECEPTION_TOUR_NEXT") + pixXml("RECEPTION_TOUR_END");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Return to the reception desk.", "pix.reception")];
    },
  });

  LT.defineNode({
    id: "pix.membership",
    ui: "dialogue",
    title: "Membership",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_MEMBERSHIP");
    },
    getResponses: receptionResponses,
  });

  LT.defineNode({
    id: "pix.session",
    ui: "dialogue",
    title: "Session",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_SESSION");
    },
    getResponses: receptionResponses,
  });

  LT.defineNode({
    id: "pix.talkGym",
    ui: "dialogue",
    title: "Reception",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_TALK_GYM");
    },
    getResponses: receptionResponses,
  });

  LT.defineNode({
    id: "pix.showers",
    ui: "dialogue",
    title: "Showers",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("SHOWERS");
    },
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to reception.", "pix.reception"),
        new LT.Response("Quick shower", "Take a quick shower.", "pix.showerQuick"),
        new LT.Response("Thorough shower", "Take a longer shower.", "pix.showerThorough"),
      ];
    },
  });

  LT.defineNode({
    id: "pix.showerQuick",
    ui: "dialogue",
    title: "Showers",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("SHOWERS_QUICK");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Step back into the changing room.", "pix.showers")];
    },
  });

  LT.defineNode({
    id: "pix.showerThorough",
    ui: "dialogue",
    title: "Showers",
    secondsPassed: 600,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("SHOWERS_THOROUGH");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Step back into the changing room.", "pix.showers")];
    },
  });

  LT.defineNode({
    id: "pix.workout",
    ui: "dialogue",
    title: "Personal training",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_PIX_WORKOUT") + pixXml("RECEPTION_PIX_WORKOUT_CARDIO");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Full effort", "Give the workout everything you've got.", "pix.workoutEnd", function () {
          LT.game.textStart = pixXml("RECEPTION_PIX_WORKOUT_FULL_EFFORT") + pixXml("RECEPTION_PIX_WORKOUT_CARDIO_FULL_EFFORT");
        }),
        new LT.Response("Hold back", "Don't push yourself quite as hard as Pix wants.", "pix.workoutEnd", function () {
          LT.game.textStart = pixXml("RECEPTION_PIX_WORKOUT_HELD_BACK") + pixXml("RECEPTION_PIX_WORKOUT_CARDIO_HELD_BACK");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "pix.workoutEnd",
    ui: "dialogue",
    title: "Personal training",
    secondsPassed: 1800,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      flags().innoxia_pix_workout_pix_completed = true;
    },
    getContent: function () {
      return pixXml("RECEPTION_PIX_WORKOUT_END");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Join her", "Join Pix in the showers for her special cooldown.", "pix.showerReward"),
        new LT.Response("Decline", "Tell Pix you'll give it a miss this time.", "pix.reception", function () {
          LT.game.textStart = pixXml("RECEPTION_PIX_WORKOUT_END_NO_REWARD");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "pix.showerReward",
    ui: "dialogue",
    title: "Showers",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_PIX_WORKOUT_END_REWARD");
    },
    getResponses: function () {
      return [
        null,
        sexResponse("Let her", "Tell Pix to get started.", {
          partner: typeof LT.ensurePix === "function" ? LT.ensurePix() : LT.game.npcs.pix,
          manager: "pix_shower",
          consensual: true,
          playerDom: false,
          postSexNode: "pix.showerAfter",
          startText: pixXml("RECEPTION_PIX_WORKOUT_END_REWARD_START"),
        }),
        new LT.Response("Too tired", "Tell Pix you're too tired for more exercise.", "pix.showers", function () {
          LT.game.textStart = pixXml("RECEPTION_PIX_WORKOUT_END_REWARD_DECLINED");
        }),
      ];
    },
  });

  LT.defineNode({
    id: "pix.showerAfter",
    ui: "dialogue",
    title: "Showers",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return pixXml("RECEPTION_PIX_WORKOUT_END_REWARD_AFTER_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Rest for a moment, then leave the changing rooms.", "pix.reception", function () {
          LT.game.textStart = pixXml("RECEPTION_PIX_WORKOUT_END_REWARD_AFTER_SEX_LEAVE");
        }),
      ];
    },
  });
})();
