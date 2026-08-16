(function () {
  function xml(tag) {
    return LT.parseFromXML("misc/prologue", tag);
  }

  function femaleNpc() {
    var p = LT.game.player;
    if (!p) return false;
    return p.orientation.id === "GYNEPHILIC" || (p.orientation.id === "AMBIPHILIC" && p.hasPenis());
  }

  function bindNpcs() {
    var female = femaleNpc();
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.prologuefemale = {
      id: "prologuefemale",
      name: "Alexandria",
      feminine: true,
      gender: LT.Gender.FEMALE,
      lust: 20,
      sex: { vaginaVirgin: true, penisVirgin: true },
      isFeminine: function () { return true; },
      getName: function () { return "Alexandria"; },
      hasVagina: function () { return true; },
      hasPenis: function () { return false; },
      hasBreasts: function () { return true; },
    };
    LT.game.npcs.prologuemale = {
      id: "prologuemale",
      name: "Alexander",
      feminine: false,
      gender: LT.Gender.MALE,
      lust: 20,
      sex: { vaginaVirgin: false, penisVirgin: true },
      isFeminine: function () { return false; },
      getName: function () { return "Alexander"; },
      hasVagina: function () { return false; },
      hasPenis: function () { return true; },
      hasBreasts: function () { return false; },
    };
    if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
    LT.game.npcs.npc = female ? LT.game.npcs.prologuefemale : LT.game.npcs.prologuemale;
  }

  function node(id, title, seconds, getContent, responses, continues) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: title,
      secondsPassed: seconds || 0,
      continuesDialogue: !!continues,
      chrome: { left: true, right: false },
      getContent: getContent,
      getResponses: responses,
    });
  }

  node("prologue.intro", "In the Museum", 90, function () {
    bindNpcs();
    return femaleNpc() ? xml("INTRO_FEMALE") : xml("INTRO_MALE");
  }, function () {
    return [
      null,
      new LT.Response("Agree", "Overwhelmed with arousal, you decide to agree to go and have some fun.", "prologue.empty-room"),
      new LT.Response("Say No", "You don't think it's a good idea to sneak off and have sex when you're supposed to be here to see your aunt Lily. Say no.", "prologue.no"),
    ];
  });

  node("prologue.empty-room", "In the Museum", 90, function () {
    bindNpcs();
    return femaleNpc() ? xml("INTRO_EMPTY_ROOM_FEMALE") : xml("INTRO_EMPTY_ROOM_MALE");
  }, function () {
    var female = femaleNpc();
    var partner = female ? LT.game.npcs.prologuefemale : LT.game.npcs.prologuemale;
    var asMale = !!(LT.game.player && LT.game.player.hasPenis && LT.game.player.hasPenis());
    var domStart = female
      ? asMale
        ? "INTRO_EMPTY_ROOM_SEX_FEMALE_AS_MALE_START_DOM"
        : "INTRO_EMPTY_ROOM_SEX_FEMALE_AS_FEMALE_START_DOM"
      : "INTRO_EMPTY_ROOM_SEX_MALE_START_DOM";
    var subStart = female
      ? asMale
        ? "INTRO_EMPTY_ROOM_SEX_FEMALE_AS_MALE_START_SUB"
        : "INTRO_EMPTY_ROOM_SEX_FEMALE_AS_FEMALE_START_SUB"
      : "INTRO_EMPTY_ROOM_SEX_MALE_START_SUB";
    var tip = xml("SEX_CLOTHING_MANAGEMENT_TIP");
    var who = female ? "[prologueFemale.name]" : "[prologueMale.name]";
    var him = female ? "her" : "him";
    var domTip = "Give in to your lust, take the lead, and start having sex with " + LT.parse(who) + "...";
    var subTip = female
      ? "Give in to your lust, submit to " + LT.parse(who) + ", and let her take the lead as you have sex with her..."
      : "Give in to your lust, submit to " + LT.parse(who) + ", and let " + him + " take the lead as you have sex with " + him + "...";
    function wrapSex(resp, flag) {
      var prev = resp.effects;
      resp.effects = function () {
        LT.game.flags.prologueSex = flag;
        if (prev) prev();
      };
      return resp;
    }
    function afterPrologue() {
      LT.game.flags.prologueSexSatisfied = !!(LT.sex.partner && LT.sex.partner.orgasmedThisSex >= 1);
    }
    return [
      null,
      wrapSex(
        LT.ResponseSex("Dominant sex", domTip, {
          partner: partner,
          playerDom: true,
          consensual: true,
          startText: xml(domStart) + tip,
          postSexNode: "prologue.after-sex",
          onEnd: afterPrologue,
        }),
        "dom",
      ),
      wrapSex(
        LT.ResponseSex("Submissive sex", subTip, {
          partner: partner,
          playerDom: false,
          consensual: true,
          startText: xml(subStart) + tip,
          postSexNode: "prologue.after-sex",
          onEnd: afterPrologue,
        }),
        "sub",
      ),
      new LT.Response("Second Thoughts", "Decide that this is a bad idea after all, and put an end to this.", "prologue.second-thoughts"),
    ];
  }, true);

  node("prologue.after-sex", "In the Museum", 60, function () {
    bindNpcs();
    var body = femaleNpc()
      ? xml(LT.game.flags.prologueSexSatisfied ? "AFTER_SEX_FEMALE_SATISFIED" : "AFTER_SEX_FEMALE_NOT_SATISFIED")
      : xml(LT.game.flags.prologueSexSatisfied ? "AFTER_SEX_MALE_SATISFIED" : "AFTER_SEX_MALE_NOT_SATISFIED");
    return body + xml("AFTER_SEX");
  }, function () {
    return [null, new LT.Response("Search", "Go and search the museum for Arthur.", "prologue.intro2")];
  });

  node("prologue.second-thoughts", "In the Museum", 30, function () {
    bindNpcs();
    return (femaleNpc() ? xml("INTRO_SECOND_THOUGHTS_FEMALE") : xml("INTRO_SECOND_THOUGHTS_MALE")) + xml("INTRO_SECOND_THOUGHTS");
  }, function () {
    return [null, new LT.Response("Search", "Go and search the museum for Arthur.", "prologue.intro2")];
  }, true);

  node("prologue.no", "In the Museum", 30, function () {
    bindNpcs();
    return (femaleNpc() ? xml("INTRO_NO_FEMALE") : xml("INTRO_NO_MALE")) + xml("INTRO_NO");
  }, function () {
    return [null, new LT.Response("Search", "Go and search the museum for Arthur.", "prologue.intro2")];
  }, true);

  node("prologue.intro2", "In the Museum", 600, function () {
    bindNpcs();
    return xml("INTRO_2");
  }, function () {
    return [
      null,
      new LT.Response("Agree", "Go and look behind the mirror to find out who's there.", "prologue.intro3a"),
      new LT.Response("Nope", "This is the most obvious trap you've ever seen.", "prologue.intro3b"),
    ];
  }, true);

  node("prologue.intro3a", "", 20, function () { return xml("INTRO_3A"); }, function () {
    return [null, new LT.Response("The horror!", "Aaaa!", "prologue.intro4")];
  }, true);

  node("prologue.intro3b", "", 20, function () { return xml("INTRO_3B"); }, function () {
    return [null, new LT.Response("The horror!", "Aaaa!", "prologue.intro4")];
  }, true);

  node("prologue.intro4", "The horror!", 20, function () { return xml("INTRO_4"); }, function () {
    return [null, new LT.Response("Panic", "Now would be a good time to panic.", "prologue.intro5")];
  }, true);

  node("prologue.intro5", "", 20, function () { return xml("INTRO_5"); }, function () {
    return [
      null,
      new LT.Response("Wake up", "You slowly start to regain consciousness.", "prologue.new-world-1", function () {
        LT.game.renderMap = true;
        LT.game.player.location = { world: "dominion", place: "aunts-home" };
      }),
    ];
  }, true);

  node("prologue.new-world-1", "A new world", 60, function () { return xml("INTRO_NEW_WORLD_1"); }, function () {
    return [
      null,
      new LT.Response("Struggle", "Try to struggle out of their grip.", "prologue.struggle"),
      new LT.Response("Furries?! Yes!", "Furries are real?! You love furries! This will remember a 'maximum furry' preference.", "prologue.love-furries", function () {
        LT.game.flags.furryPreference = "maximum";
      }),
      new LT.Response("Furries?! No!", "Why are furries real?! You hate furries! This will remember a 'human only' preference.", "prologue.hate-furries", function () {
        LT.game.flags.furryPreference = "human";
      }),
    ];
  });

  function toLilayaSave() {
    if (typeof LT.ensureHouseNpcs === "function") LT.ensureHouseNpcs();
  }

  node("prologue.struggle", "", 60, function () {
    return xml("INTRO_NEW_WORLD_1_STRUGGLE") + xml("INTRO_NEW_WORLD_1_STRUGGLE_END");
  }, function () {
    return [null, new LT.Response("Continue", "Someone's come to save you!", "prologue.new-world-2", toLilayaSave)];
  }, true);

  node("prologue.hate-furries", "", 60, function () {
    return xml("INTRO_NEW_WORLD_1_BY_THE_POWER_OF_HATING_FURRIES") + xml("INTRO_NEW_WORLD_1_STRUGGLE_END");
  }, function () {
    return [null, new LT.Response("Continue", "Someone's come to save you!", "prologue.new-world-2", toLilayaSave)];
  }, true);

  node("prologue.love-furries", "", 60, function () {
    return xml("INTRO_NEW_WORLD_1_BY_THE_POWER_OF_LOVING_FURRIES") + xml("INTRO_NEW_WORLD_1_STRUGGLE_END");
  }, function () {
    return [null, new LT.Response("Continue", "Someone's come to save you!", "prologue.new-world-2", toLilayaSave)];
  }, true);

  node("prologue.new-world-2", "", 60, function () { return xml("INTRO_NEW_WORLD_2"); }, function () {
    return [null, new LT.Response("Explain", "Quickly explain to Lily what happened back at the museum.", "prologue.new-world-2a")];
  }, true);

  node("prologue.new-world-2a", "", 60, function () { return xml("INTRO_NEW_WORLD_2_A"); }, function () {
    return [
      null,
      new LT.Response("Follow", "Follow Lily as she leads you back to her house.", "prologue.new-world-3", function () {
        LT.game.player.location = { world: "lilaya-f0", place: "entrance" };
      }),
    ];
  }, true);

  node("prologue.new-world-3", "Lilaya's Home", 300, function () { return xml("INTRO_NEW_WORLD_3"); }, function () {
    return [
      null,
      new LT.Response("To the lab", "Follow Lilaya to her lab.", "prologue.new-world-4", function () {
        LT.game.player.location = { world: "lilaya-f0", place: "lab" };
      }),
    ];
  });

  node("prologue.new-world-4", "", 60, function () { return xml("INTRO_NEW_WORLD_4"); }, function () {
    return [
      null,
      new LT.Response("Blinded", "The pink flash was so bright that you're left temporarily blinded!", "prologue.new-world-5", function () {
        var p = LT.game.player;
        var slots = Object.keys(p.equipped || {});
        for (var i = 0; i < slots.length; i++) LT.unequipToWardrobe(p, slots[i]);
      }),
    ];
  }, true);

  node("prologue.new-world-5", "", 60, function () { return xml("INTRO_NEW_WORLD_5"); }, function () {
    return [
      null,
      new LT.Response("I'm a demon?!", "Lilaya keeps using the word 'Demon' to describe your aura.", "prologue.new-world-6", function () {
        var p = LT.game.player;
        var left = p.wardrobe.slice();
        p.wardrobe = [];
        for (var i = 0; i < left.length; i++) {
          var item = left[i];
          if (p.equipped[item.slot]) p.wardrobe.push(p.equipped[item.slot]);
          p.equipped[item.slot] = item;
        }
        p.weapon = "demonstone";
      }),
    ];
  }, true);

  node("prologue.new-world-6", "", 60, function () {
    LT.addSpecialParse("images of flames", true);
    LT.addSpecialParse("flame", false);
    return xml("INTRO_NEW_WORLD_6");
  }, function () {
    var p = LT.game.player;
    var title = p && !p.isFeminine() ? "You're a wizard!" : "You're a witch!";
    var r = new LT.Response(title, "Thanks to your powerful aura, you can harness the arcane!", "prologue.new-world-7");
    return [null, r];
  }, true);

  node("prologue.new-world-7", "", 60, function () {
    LT.addSpecialParse("Fireball", true);
    return xml("INTRO_NEW_WORLD_7");
  }, function () {
    return [
      null,
      new LT.Response("Your room", "You follow Rose as she leads you up to your new room.", "prologue.new-world-8", function () {
        LT.game.player.location = { world: "lilaya-f1", place: "player-room" };
      }),
    ];
  }, true);

  node("prologue.new-world-8", "Your room", 60, function () { return xml("INTRO_NEW_WORLD_8"); }, function () {
    return [
      null,
      new LT.Response("Knocking", "Rose said she'd be back in about half an hour, so that must be her knocking at your door.", "prologue.new-world-9", function () {
        LT.game.player.money = (LT.game.player.money || 0) + (LT.STARTING_MONEY || 5000);
        LT.game.flags.quest = "MAIN_1_A_LILAYAS_TESTS";
        LT.game.textEnd =
          "<p style='text-align:center;'>" +
          LT.parse("[style.boldExcellent(Fireball tome)]") +
          " added to your room's storage!</p>" +
          (typeof LT.incrementExperience === "function" ? LT.incrementExperience(5) : "");
      }),
    ];
  }, true);

  node("prologue.new-world-9", "Knocking", 1800, function () {
    var extra = LT.game.textEnd || "";
    LT.game.textEnd = "";
    return extra + xml("INTRO_NEW_WORLD_9");
  }, function () {
    return [
      null,
      new LT.Response("Freedom!", "Decide what you want to do next.", "place.LILAYA_HOME_ROOM_PLAYER", function () {
        LT.game.renderAttributes = true;
        LT.game.renderMap = true;
        LT.game.started = true;
        if (typeof LT.startArrivalStorm === "function") LT.startArrivalStorm();
        if (typeof LT.enterWorld === "function") {
          LT.enterWorld("LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_ROOM_PLAYER");
        }
      }),
    ];
  }, true);

})();
