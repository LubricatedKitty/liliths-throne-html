(function () {
  function xml(pack, tag) {
    return LT.parseFromXML("places/dominion/harpyNests/" + pack, tag);
  }

  function hasQuest() {
    return !!(LT.game.flags && LT.game.flags.harpyQuest && LT.game.flags.harpyQuest !== "complete");
  }

  function playerFetish(id) {
    var p = LT.game.player;
    if (!p) return false;
    if (p.hasFetish) return p.hasFetish(id);
    return !!(p.fetishes && p.fetishes[id]);
  }

  function playerPerk(id) {
    var p = LT.game.player;
    if (!p) return false;
    if (p.hasPerk) return p.hasPerk(id);
    return !!(p.perks && (p.perks[id] || (p.perks.indexOf && p.perks.indexOf(id) >= 0)));
  }

  function feminineStrong() {
    var p = LT.game.player;
    return !!(p && (p.femininityValue || 0) >= 80);
  }

  function nestTitle(spec) {
    return spec.matriarch.name + "'s nest";
  }

  function defineNest(spec) {
    var prefix = spec.id;
    var pack = spec.pack;
    var exterior = "place." + spec.place;
    var approach = prefix + ".approach";
    var talk = prefix + ".talk";
    var ugly = prefix + ".ugly";
    var queen = prefix + ".queen";
    var force = prefix + ".force";
    var beatPet = prefix + ".beatPet";
    var beatMat = prefix + ".beatMat";
    var afterSex = prefix + ".afterSex";
    var lost = prefix + ".lost";
    var lostMat = prefix + ".lostMat";
    var lostPunish = prefix + ".lostPunish";
    var badEnd = prefix + ".badEnd";
    var badEndApologise = prefix + ".badEndApologise";
    var badEndAfter = prefix + ".badEndAfter";
    var badEndFinal = prefix + ".badEndFinal";
    var spit = prefix + ".spit";

    function ensureAll() {
      if (spec.ensureMat) spec.ensureMat();
      if (spec.ensurePet) spec.ensurePet();
    }

    function trophyHtml() {
      return spec.itemId && typeof LT.giveHarpyMatriarchItem === "function" ? LT.giveHarpyMatriarchItem(spec.itemId) : "";
    }

    function pacifyHtml() {
      var html = typeof LT.pacifyHarpyNest === "function" ? LT.pacifyHarpyNest(spec.pacifiedFlag) : "";
      return html + trophyHtml();
    }

    function petAttracted() {
      var pet = spec.ensurePet();
      if (pet && pet.isAttractedTo) return pet.isAttractedTo(LT.game.player);
      return true;
    }

    function threesomeOk() {
      return petAttracted() || (LT.isNonConEnabled && LT.isNonConEnabled());
    }

    function fightPet() {
      return LT.ResponseCombat("Fight", spec.pet.name + " rushes to do her matriarch's bidding!", {
        enemy: spec.ensurePet(),
        escapeChance: 0,
        victoryNode: beatPet,
        defeatNode: lost,
        returnNode: approach,
      });
    }

    function fightMat() {
      return LT.ResponseCombat("Fight", spec.matriarch.name + " looks furious as she launches her attack on you!", {
        enemy: spec.ensureMat(),
        escapeChance: 0,
        victoryNode: beatMat,
        defeatNode: lostMat,
        returnNode: beatPet,
        onVictory: function () {
          return pacifyHtml();
        },
      });
    }

    function pacifiedSexResponses() {
      var list = [
        new LT.Response("Leave", "Tell " + spec.matriarch.name + " that you'll be back later.", exterior, function () {
          LT.game.textStart = xml(pack, spec.pacifiedLeaveTag);
        }),
        LT.ResponseSex(spec.sexTitle || "Sex", spec.sexTip || "Have dominant sex with " + spec.matriarch.name + ".", {
          partner: spec.ensureMat(),
          playerDom: true,
          consensual: true,
          startText: xml(pack, spec.sexStartTag),
          postSexNode: afterSex,
        }),
      ];
      if (spec.subSexTag) {
        list.push(
          LT.ResponseSex("Get dominated", "Ask " + spec.matriarch.name + " to dominate you.", {
            partner: spec.ensureMat(),
            playerDom: false,
            consensual: true,
            startText: xml(pack, spec.subSexTag),
            postSexNode: afterSex,
          }),
        );
      }
      if (spec.oralTag) {
        if (!threesomeOk()) {
          list.push(
            new LT.Response("Threesome (oral)", "As " + spec.pet.name + " is not attracted to you, she's unwilling to take part in a threesome...", null).disable(
              "As " + spec.pet.name + " is not attracted to you, she's unwilling to take part in a threesome with you and " + spec.matriarch.name + "...",
            ),
          );
        } else {
          list.push(
            LT.ResponseSex("Threesome (oral)", "Have " + spec.matriarch.name + " and " + spec.pet.name + " service you with their mouths.", {
              partner: spec.ensureMat(),
              playerDom: true,
              consensual: true,
              startText: xml(pack, spec.oralTag),
              postSexNode: afterSex,
            }),
          );
        }
      }
      if (spec.pairTag) {
        if (!threesomeOk()) {
          list.push(
            new LT.Response(spec.pairTitle, "As " + spec.pet.name + " is not attracted to you, she's unwilling to take part in a threesome...", null).disable(
              "As " + spec.pet.name + " is not attracted to you, she's unwilling to take part in a threesome with you and " + spec.matriarch.name + "...",
            ),
          );
        } else {
          list.push(
            LT.ResponseSex(spec.pairTitle, spec.pairTip, {
              partner: spec.ensureMat(),
              playerDom: true,
              consensual: true,
              startText: xml(pack, spec.pairTag),
              postSexNode: afterSex,
            }),
          );
        }
      }
      if (spec.spitTag) {
        list.push(new LT.Response("Spitroast " + spec.matriarch.name, "Have " + spec.pet.name + " join you in spitroasting " + spec.matriarch.name + ".", spit));
      }
      return list;
    }

    function lostResponses() {
      var bad = LT.isBadEndsEnabled && LT.isBadEndsEnabled() && LT.isAbleToHaveRaceTransformed && LT.isAbleToHaveRaceTransformed(LT.game.player);
      if (bad) {
        return [
          null,
          new LT.Response(spec.badSuckTitle || "Suck lollipops", spec.badSuckTip || "Completely overpowered, all you can do is take the transformation...", badEnd, function () {
            LT.game.flags.badEnd = spec.badEndName || true;
            LT.game.textStart = xml(pack, "COMBAT_LOST_BAD_END_TF_START") + (typeof LT.applyHarpyMatriarchTf === "function" ? LT.applyHarpyMatriarchTf(LT.game.player, spec.pack) : "") + xml(pack, "COMBAT_LOST_BAD_END_TF_END");
          }),
        ];
      }
      var list = [null];
      if (LT.isSpittingDisabled && LT.isSpittingDisabled()) {
        list.push(
          new LT.Response("Refuse", "Refuse the transformation.", null).disable("Rejection of TF potions is disabled in the gameplay options!"),
        );
      } else {
        list.push(
          new LT.Response("Refuse", spec.refuseTip || "Refuse to take it.", lostPunish, function () {
            LT.game.textStart = xml(pack, "COMBAT_LOST_NO_TF");
          }),
        );
      }
      list.push(
        new LT.Response(spec.tfTitle || "Suck lollipop", spec.tfTip || "Allow the transformation...", lostPunish, function () {
          LT.game.textStart =
            xml(pack, "COMBAT_LOST_TF_START") + (typeof LT.applyHarpyMatriarchTf === "function" ? LT.applyHarpyMatriarchTf(LT.game.player, spec.pack) : "") + xml(pack, "COMBAT_LOST_TF_END");
        }),
      );
      return list;
    }

    LT.defineNode({
      id: exterior,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 60,
      chrome: { left: true, right: true },
      applyPreParsingEffects: ensureAll,
      getContent: function () {
        return xml(pack, spec.exteriorTag);
      },
      getResponses: function () {
        var list = typeof LT.travelResponses === "function" ? LT.travelResponses() : [null];
        var awake = LT.isWorkTime && LT.isWorkTime();
        var storm = LT.isArcaneStorm && LT.isArcaneStorm();
        var known = !!(LT.game.flags && LT.game.flags[spec.encounteredFlag]);
        var label = known ? "Approach " + spec.matriarch.name : "Approach matriarch";
        if (!awake) {
          list.push(
            new LT.Response(label, "Both the matriarch and her flock are sleeping in the buildings below her nest.", null).disable(
              "You'll have to come back during the day if you want to speak with her.",
            ),
          );
        } else if (storm) {
          list.push(
            new LT.Response(label, "If you want to talk to the matriarch, you'll have to come back after the arcane storm has passed.", null).disable(
              "You'll have to come back after the arcane storm has passed.",
            ),
          );
        } else if (!hasQuest() && !(LT.game.flags && LT.game.flags[spec.pacifiedFlag])) {
          list.push(new LT.Response("Approach matriarch", "You have no need to talk to the matriarch of this nest.", null).disable("You have no need to talk to the matriarch of this nest."));
        } else {
          list.push(
            new LT.Response(label, known ? "Walk to the centre of the nest and talk to " + spec.matriarch.name + "." : "Walk to the centre of the nest and talk to the matriarch.", approach),
          );
        }
        return list;
      },
    });

    LT.defineNode({
      id: approach,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 300,
      travelDisabled: true,
      chrome: { left: true, right: true },
      applyPreParsingEffects: ensureAll,
      getContent: function () {
        return xml(pack, spec.approachTag);
      },
      getResponses: function () {
        var pacified = !!(LT.game.flags && LT.game.flags[spec.pacifiedFlag]);
        if (pacified) return pacifiedSexResponses();
        var list = [
          new LT.Response("Leave", "Tell " + spec.matriarch.name + " that you'll be back later.", exterior, function () {
            LT.game.flags[spec.encounteredFlag] = true;
            LT.game.textStart = xml(pack, spec.leaveTag);
          }),
          new LT.Response("Talk", "Try to convince " + spec.matriarch.name + " to calm down.", talk, function () {
            LT.game.flags[spec.encounteredFlag] = true;
          }),
        ];
        var queen = spec.queenResponse();
        if (queen) list.push(queen);
        list.push(
          new LT.Response("Call her ugly", "You know that this would be a terrible idea...", ugly, function () {
            LT.game.flags[spec.encounteredFlag] = true;
          }).withColour(LT.Colour.GENERIC_COMBAT),
        );
        return list;
      },
    });

    LT.defineNode({
      id: talk,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 120,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.parse(spec.talkHtml);
      },
      getResponses: function () {
        var list = [
          new LT.Response("Leave", "Tell " + spec.matriarch.name + " that you'll be back later.", exterior, function () {
            LT.game.textStart = xml(pack, spec.leaveTag);
          }),
        ];
        var queen = spec.queenResponse();
        if (queen) list.push(queen);
        list.push(
          new LT.Response("Force compliance", "If you want these harpies to chill out, it looks as though you'll have to do it by force...", force).withColour(LT.Colour.GENERIC_COMBAT),
        );
        return list;
      },
    });

    LT.defineNode({
      id: ugly,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 120,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.parse(spec.uglyHtml);
      },
      getResponses: function () {
        return [null, fightPet()];
      },
    });

    LT.defineNode({
      id: force,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 120,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.parse(spec.forceHtml);
      },
      getResponses: function () {
        return [null, fightPet()];
      },
    });

    LT.defineNode({
      id: queen,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 120,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      applyPreParsingEffects: function () {
        LT.game.flags[spec.encounteredFlag] = true;
        if (!LT.game.flags[spec.pacifiedFlag]) LT.game.textEnd = pacifyHtml();
      },
      getContent: function () {
        var raw = typeof spec.queenHtml === "function" ? spec.queenHtml() : spec.queenHtml;
        return LT.parse(raw || "");
      },
      getResponses: function () {
        return [
          new LT.Response("Leave", "Tell " + spec.matriarch.name + " that you'll be back later.", exterior, function () {
            LT.game.textStart = xml(pack, spec.pacifiedLeaveTag);
          }),
          LT.ResponseSex("Sex", spec.queenSexTip || "Have dominant sex with " + spec.matriarch.name + " in front of her flock.", {
            partner: spec.ensureMat(),
            playerDom: true,
            consensual: true,
            startText: spec.queenSexStart || "",
            postSexNode: afterSex,
          }),
        ];
      },
    });

    if (spec.spitTag) {
      LT.defineNode({
        id: spit,
        ui: "dialogue",
        title: function () {
          return nestTitle(spec);
        },
        secondsPassed: 300,
        travelDisabled: true,
        continuesDialogue: true,
        chrome: { left: true, right: true },
        getContent: function () {
          return xml(pack, spec.spitTag);
        },
        getResponses: function () {
          return [
            null,
            LT.ResponseSex("Behind", "Drop down behind " + spec.matriarch.name + ", allowing " + spec.pet.name + " to take her mouth.", {
              partner: spec.ensureMat(),
              playerDom: true,
              consensual: true,
              startText: xml(pack, spec.spitBehindTag),
              postSexNode: afterSex,
            }),
            LT.ResponseSex("In front", "Drop down in front of " + spec.matriarch.name + ", allowing " + spec.pet.name + " to take her rear.", {
              partner: spec.ensureMat(),
              playerDom: true,
              consensual: true,
              startText: xml(pack, spec.spitFrontTag),
              postSexNode: afterSex,
            }),
          ];
        },
      });
    }

    LT.defineNode({
      id: beatPet,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 30,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.parse(spec.beatPetHtml);
      },
      getResponses: function () {
        return [null, fightMat()];
      },
    });

    LT.defineNode({
      id: beatMat,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 60,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return LT.parse(spec.beatMatHtml);
      },
      getResponses: function () {
        return [
          new LT.Response("Leave", "Tell " + spec.matriarch.name + " that you'll be back later.", exterior, function () {
            LT.game.textStart = xml(pack, spec.pacifiedLeaveTag);
          }),
          LT.ResponseSex("Sex", "Have dominant sex with " + spec.matriarch.name + ".", {
            partner: spec.ensureMat(),
            playerDom: true,
            consensual: true,
            postSexNode: afterSex,
          }),
        ];
      },
    });

    LT.defineNode({
      id: afterSex,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 60,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return xml(pack, spec.afterSexTag);
      },
      getResponses: function () {
        return [
          new LT.Response("Leave", "Having had your fun, you decide to leave.", exterior, function () {
            LT.game.textStart = xml(pack, spec.leaveAfterSexTag);
          }),
        ];
      },
    });

    function lostNode(id, startTag) {
      LT.defineNode({
        id: id,
        ui: "dialogue",
        title: function () {
          return nestTitle(spec);
        },
        secondsPassed: 300,
        travelDisabled: true,
        chrome: { left: true, right: true },
        getContent: function () {
          return xml(pack, startTag) + xml(pack, "COMBAT_LOST_END");
        },
        getResponses: lostResponses,
      });
    }
    lostNode(lost, "COMBAT_LOST");
    lostNode(lostMat, "COMBAT_LOST_MATRIARCH");

    LT.defineNode({
      id: lostPunish,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 300,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return "";
      },
      getResponses: function () {
        return [
          new LT.Response("Thrown out", "Having had their fun, the harpies throw you out of their nest.", exterior, function () {
            LT.game.textStart = xml(pack, "COMBAT_LOST_THROWN_OUT");
          }),
        ];
      },
    });

    LT.defineNode({
      id: badEnd,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 300,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return "";
      },
      getResponses: function () {
        return [null, new LT.Response("Apologise", spec.apologiseTip || "You really need to say how sorry you are!", badEndApologise)];
      },
    });

    LT.defineNode({
      id: badEndApologise,
      ui: "dialogue",
      title: function () {
        return nestTitle(spec);
      },
      secondsPassed: 120,
      travelDisabled: true,
      continuesDialogue: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return xml(pack, spec.apologiseTag || "COMBAT_LOST_BAD_END_APLOGISE");
      },
      getResponses: function () {
        var p = LT.game.player;
        var hasVag = p && p.hasVagina && p.hasVagina();
        var start = xml(pack, hasVag ? spec.badSexVaginaTag || "BAD_END_SEX_VAGINA_START" : spec.badSexPenisTag || "BAD_END_SEX_PENIS_START");
        return [
          null,
          LT.ResponseSex("Used", "Completely at the mercy of these harpies...", {
            partner: spec.ensureMat(),
            playerDom: false,
            consensual: false,
            startText: start,
            postSexNode: badEndAfter,
          }),
        ];
      },
    });

    LT.defineNode({
      id: badEndAfter,
      ui: "dialogue",
      title: "Used",
      secondsPassed: 60,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return xml(pack, "BAD_END_AFTER_SEX");
      },
      getResponses: function () {
        return [null, new LT.Response("Continue", "The lollipops keep coming...", badEndFinal)];
      },
    });

    LT.defineNode({
      id: badEndFinal,
      ui: "dialogue",
      title: spec.badEndName || "Bad End",
      secondsPassed: 0,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        return xml(pack, "BAD_END_FINAL");
      },
      getResponses: function () {
        return [];
      },
    });
  }

  function queenGate(title, tip, next, ok) {
    return function () {
      var r = new LT.Response(title, tip, next, function () {
        LT.game.flags[this._flag] = true;
      });
      if (!ok()) r.disable(tip);
      return r;
    };
  }

  defineNest({
    id: "bimbo",
    pack: "bimbo",
    place: "HARPY_NESTS_HARPY_NEST_YELLOW",
    exteriorTag: "HARPY_NEST_BIMBO",
    approachTag: "HARPY_NEST_BIMBO_APPROACH",
    leaveTag: "BIMBO_LEAVE",
    pacifiedLeaveTag: "PACIFIED_BIMBO_LEAVE",
    sexStartTag: "PACIFIED_BIMBO_SEX_START",
    afterSexTag: "BIMBO_AFTER_SEX",
    leaveAfterSexTag: "BIMBO_LEAVE_AFTER_SEX",
    encounteredFlag: "bimboEncountered",
    pacifiedFlag: "bimboPacified",
    itemId: "HARPY_MATRIARCH_BIMBO_LOLLIPOP",
    oralTag: "BIMBO_SEX_START_ORAL",
    pairTag: "BIMBO_SEX_START_MISSIONARY",
    pairTitle: "Threesome (missionary)",
    pairTip: "Fuck Brittany and Lauren side by side in the missionary position.",
    tfTitle: "Suck lollipop",
    tfTip: "Allow Brittany to push the lollipop into your mouth... This is a unique transformation, and so bypasses your TF preferences!",
    badEndName: "Bird-brained Bitch",
    apologiseTag: "COMBAT_LOST_BAD_END_APLOGISE",
    apologiseTip: "You really need to, like, say how super sorry you are!",
    matriarch: { name: "Brittany" },
    pet: { name: "Lauren" },
    ensureMat: function () {
      return LT.ensureBrittany();
    },
    ensurePet: function () {
      return LT.ensureLauren();
    },
    talkHtml:
      "<p>[pc.speech(I'm here to talk to you about all the recent unrest around here. The Enforcers are having a hard time keeping the peace, and it would be really helpful if you could get your flock to calm down a little,)] you try to explain, but [bimboHarpy.name] simply rolls her eyes and makes an annoyed tutting sound in response.</p><p>[bimboHarpy.speechNoEffects(Like, that is sooo not my problem!)] she says, making a dismissive gesture with her hand before continuing, [bimboHarpy.speechNoEffects(How about, like, you fuck off with your silly little moaning! I'm, like, sooo tempted to get [bimboHarpyCompanion.name] here to teach you a lesson right now!)]</p><p>It doesn't look like [bimboHarpy.name] is going to listen to reason. You'll either have to think of another way to convince the harpies to calm down, or make them calm down with force.</p>",
    uglyHtml:
      "<p>Annoyed by how this stupid bimbo is treating you, you decide to give her a taste of her own medicine. [pc.speech(How about you stop offending everyone, and put a bag over that ugly face of yours?)]</p><p>[bimboHarpy.NamePos] face goes bright red, and with a furious scream, she cries out to her companion, [bimboHarpy.speechNoEffects([bimboHarpyCompanion.Name]! Get [pc.herHim]! Get [pc.herHim]! Nobody talks to me like that!)]</p><p>Looking almost as angry as [bimboHarpy.name] does, [bimboHarpyCompanion.name] runs forwards, eager to please her matriarch as she launches into a furious assault.</p>",
    forceHtml:
      "<p>Having had enough of [bimboHarpy.namePos] attitude, you make your final demand, [pc.speech(You're going to get your nest to calm down, or I'm going to make you!)]</p><p>[bimboHarpy.NamePos] face goes bright red, and she shouts out to her companion, [bimboHarpy.speechNoEffects([bimboHarpyCompanion.Name], teach this [pc.race] a lesson! Like, <i>nobody</i> talks to me like that!)]</p><p>With a shout, [bimboHarpyCompanion.name] runs forwards, eager to please her matriarch as she launches into a furious assault.</p>",
    beatPetHtml:
      "<p>[bimboHarpy.Name] lets out a furious scream as [bimboHarpyCompanion.name] falls to the floor, defeated. You notice a lot of the surrounding harpies glancing nervously at each other, and a few start to shuffle around to your side of the platform. It looks as though they're trying to hedge their bets, and are getting ready to support you if you manage to prove your strength.</p><p>You don't have too much time to ponder on these harpies' fickle nature, as [bimboHarpy.Name] suddenly darts forwards, screaming, [bimboHarpy.speech(You're gonna pay for this!)]</p>",
    beatMatHtml:
      "<p>[bimboHarpy.NamePos] inner-circle of bimbo harpies, cheering and shouting just moments ago, falls completely silent as they see their matriarch slump to the floor. Walking forwards, you look down on her pitiful form, and you hear the bimbo let out an erotic moan as she pushes herself up onto her knees, [bimboHarpy.speechNoEffects(Aah! Like, you're so powerful and stuff! W-Who are you?!)]</p><p>[pc.speech(Your new leader,)] you respond. [pc.speech(I don't care how you normally determine a flock's leader; I'm in charge now!)]</p><p>Your arcane aura is clearly having a strong effect on [bimboHarpy.name], as she lets out another lewd moan as she responds, [bimboHarpy.speechNoEffects(Y-Yes mistress! I-I'll be, like, super good for you!)]</p><p>Seeing their matriarch submit to you, the rest of the harpies fall to their knees, bowing down to you as you issue your orders, [pc.speech(You're all going to calm down, got it?! No more feuds, and no more attacking travellers through the Harpy Nests!)]</p><p>Your words seem to sink in, and are met by a chorus of eager agreements. Shuffling ever closer to you, [bimboHarpy.name] holds up a swirly pink-and-white lollipop. [bimboHarpy.speechNoEffects(Mistress! If you, like, wanted to look like us, give this a lick! I promise to keep everything under control for you! We'll all be good, won't we, girls?!)]</p><p>As the bimbo harpies cry out in the affirmative, you bend down and take the lollipop in recognition of [bimboHarpy.namePos] submission, but you're unsure whether you'll actually use it...</p><p>Thanks to your victory over [bimboHarpy.name], and the power of your arcane aura, you've been able to subdue [bimboHarpy.namePos] nest! Looking down at the bimbo matriarch, you wonder if you should publicly prove to all these harpies who's in control here...</p>",
    queenHtml:
      "<p>Having had enough of this bitch's attitude, you step forwards, looking at [bimboHarpyCompanion.name] as you speak, [pc.speechNoEffects(Like, do you seriously have to listen to this all day? You're, like, gonna start doin' what I say now, got it?! Now, like, come kneel for your new queen!)]</p><p>The combination of your beautiful features and potent arcane aura seems to be having a strong effect on these harpies. Speaking in the same manner as their matriarch seems to be just enough to start to sway [bimboHarpy.namePos] followers to your side. Before she knows what she's doing, [bimboHarpyCompanion.name] is rushing forwards to obey your command.</p><p>[bimboHarpy.speechNoEffects([bimboHarpyCompanion.Name]?! Like, what the hell are you doin'? Get back here!)] [bimboHarpy.name] shouts.</p><p>[bimboHarpyCompanion.Name] stops in between the two of you, looking back and forth in confusion. You notice that the rest of the flock haven't come to the defence of their matriarch, and are watching, waiting to see what [bimboHarpyCompanion.name] decides to do.</p><p>[pc.speechNoEffects([bimboHarpyCompanion.Name]!)] you shout. [pc.speechNoEffects(Come over here and kneel to me, like, <i>right this instant</i>!)]</p><p>Not quite knowing how to react, [bimboHarpy.name] watches in disbelief as her companion rushes forwards and obediently drops to her knees in front of you. The rest of the harpies quickly follow suit; recognising you as a more powerful and, crucially, more attractive female than their current matriarch.</p><p>As what's just happened starts to sink in, [bimboHarpy.name] quickly runs forwards, pushing [bimboHarpyCompanion.name] out of the way and taking her place as she kneels in front of you. Shuffling forwards, she looks up into your eyes. [bimboHarpy.speechNoEffects(Like, <i>I'm</i> the prettiest one here! A-Apart from you, of course! Let me be your personal pet, please!)]</p><p>Smirking down at your new pet harpy, you tell her what she wants to hear, [pc.speechNoEffects(Good pet! You're, like, so super smart! I knew you'd understand your new place!)]</p><p>[bimboHarpy.Name] shuffles closer, letting out submissive little mewling sounds and looking up at you as you continue, [pc.speechNoEffects(Now, like, I don't have the time and stuff to run this nest, so you're gonna, like carry on doin' all that stuff. You just gotta remember who's really in charge! Now, your first order is to, like, get all these harpies to chill out and stuff! If I hear they've been trouble, you're gonna, like, be demoted from being your pet, got it?!)]</p><p>[bimboHarpy.speechNoEffects(Yes, mistress!)] [bimboHarpy.name] cries out. [bimboHarpy.speechNoEffects(I'll get them under control! Ooh! Ooh! Also! Mistress! I got a special lollipop for you!)]</p><p>Producing a pink-and-white swirly lollipop, [bimboHarpy.name] holds it out towards you. [bimboHarpy.speechNoEffects(This is, like, what I give to all the new members of the flock! It'll, like turn you into one of us!)] You take the lollipop in recognition of [bimboHarpy.namePos] submission, but you're unsure whether you'll actually use it...</p><p>Thanks to your bimbo personality and good looks, you've been able to subdue [bimboHarpy.namePos] nest without fighting! Looking down at the bimbo matriarch, you wonder if you should publicly prove to all these harpies who's in control here...</p>",
    queenSexTip: "Have dominant sex with Brittany in front of her flock.",
    queenSexStart:
      "<p>Eager to put [harpyBimbo.name] in her place in front of her inner-circle, you reach down and grab her by her wings. Pulling her to her feet, you step forwards, planting a deep kiss on her [harpyBimbo.lips+] and drawing a series of excited giggles from the surrounding bimbo harpies.</p><p>[harpyBimbo.Name] responds to your dominant move by wrapping her wings around your back, grinding herself up against you as she passionately returns your kiss...</p>",
    queenResponse: function () {
      var r = new LT.Response(
        "Bimbo queen",
        "This bitch is, like, super not cool. You should totally convince the nest that you should be their queen!",
        "bimbo.queen",
      );
      if (!(playerFetish("FETISH_BIMBO") && feminineStrong())) {
        r.disable("You need a bimbo fetish and a strongly feminine appearance to pull this off.");
      }
      return r;
    },
  });

  defineNest({
    id: "dominant",
    pack: "dominant",
    place: "HARPY_NESTS_HARPY_NEST_RED",
    exteriorTag: "HARPY_NEST_DOMINANT",
    approachTag: "HARPY_NEST_DOMINANT_APPROACH",
    leaveTag: "DOMINANT_LEAVE",
    pacifiedLeaveTag: "PACIFIED_DOMINANT_LEAVE",
    sexStartTag: "PACIFIED_DOMINANT_SEX_START",
    afterSexTag: "DOMINANT_AFTER_SEX",
    leaveAfterSexTag: "DOMINANT_LEAVE_AFTER_SEX",
    encounteredFlag: "dominantEncountered",
    pacifiedFlag: "dominantPacified",
    itemId: "HARPY_MATRIARCH_DOMINANT_PERFUME",
    subSexTag: "PACIFIED_DOMINANT_SEX_START_AS_SUB",
    oralTag: "DOMINANT_SEX_START_ORAL",
    pairTag: "DOMINANT_SEX_START_DOGGY",
    pairTitle: "Threesome (doggy style)",
    pairTip: "Fuck Diana and Harley side by side in the doggy style position.",
    tfTitle: "Spray perfume",
    tfTip: "Allow Diana to spray you with her special perfume... This is a unique transformation, and so bypasses your TF preferences!",
    badSuckTitle: "Breathe it in",
    badEndName: "Bound Bird",
    apologiseTag: "COMBAT_LOST_BAD_END_RETORT",
    apologiseTip: "You need to tell her how sorry you are...",
    matriarch: { name: "Diana" },
    pet: { name: "Harley" },
    ensureMat: function () {
      return LT.ensureDiana();
    },
    ensurePet: function () {
      return LT.ensureHarley();
    },
    talkHtml:
      "<p>[pc.speech(I just want to talk to you about the recent unrest in the Harpy Nests. The Enforcers are having a hard time keeping the peace, and it appears as though some of your flock are to blame,)] you try to explain, but [dominantHarpy.name] stomps her clawed foot on the ground, before cutting you off with an angry grunt.</p><p>[dominantHarpy.speech(What the fuck?! How <i>dare</i> you come here and talk to me like that!)] she shouts, flapping her wings in irritation as she continues, [dominantHarpy.speech(Unless you want to become [dominantHarpyCompanion.namePos] next fuck-toy, you'd better fuck off right now! And be thankful that I'm in a good mood!)]</p><p>It doesn't look like [dominantHarpy.name] is going to listen to you. You'll either have to think of another way to convince these harpies to calm down, or make them calm down by using force.</p>",
    uglyHtml:
      "<p>A devious retort suddenly jumps into your head, and before you know what you're doing, you're speaking out loud, [pc.speech(What I want is to never have to look at your ugly face ever again!)]</p><p>[harpyDominant.Name] lets out a furious scream, and, flapping her wings, she shouts out to her companion, [harpyDominant.speech([harpyDominantCompanion.Name]! Fuck [pc.herHim] up! Beat [pc.herHim] into submission! That fucking bitch! Get [pc.herHim]!)]</p><p>Looking almost as furious as [harpyDominant.name] does, [harpyDominantCompanion.name] jumps forwards, eager to please her matriarch as she launches into a furious assault.</p>",
    forceHtml:
      "<p>Left with no other choice, you look up at [harpyDominant.name] as you make your final demand, [pc.speech(You're either going to get your nest to calm down right now, or I'm going to make you!)]</p><p>[harpyDominant.Name] lets out a furious scream, and she shouts out to her companion, [harpyDominant.speechNoEffects([harpyDominantCompanion.Name], teach this insolent [pc.race] a lesson! <i>Nobody</i> talks to me like that and gets away with it!)]</p><p>With a shout, [harpyDominantCompanion.name] runs forwards, eager to please her matriarch as she launches into a furious assault.</p>",
    beatPetHtml:
      "<p>[harpyDominant.Name] lets out a furious scream as [harpyDominantCompanion.name] falls to the floor, defeated. You notice a lot of the surrounding harpies glancing nervously at each other, and a few start to shuffle around to your side of the platform. It looks as though they're trying to hedge their bets, and are getting ready to support you if you manage to prove your strength.</p><p>You don't have too much time to ponder on these harpies' fickle nature, as [harpyDominant.Name] suddenly leaps down off her podium, screaming, [harpyDominant.speech(You fucking bitch! You're going to pay for this!)]</p>",
    beatMatHtml:
      "<p>[harpyDominant.NamePos] inner-circle of harpies look on in silence as they watch their matriarch slump to the floor. Walking forwards, you look down on her pitiful form, and you hear a low moan escape from between her lips as she pushes herself up onto her knees. [harpyDominant.speechNoEffects(Y-You're so strong... Who are you?!)]</p><p>[pc.speech(Your new leader,)] you respond, turning to face the surrounding harpies. [pc.speech(You're all going to calm down, got it?! No more feuds, and no more attacking travellers through the Harpy Nests!)]</p><p>Your words seem to sink in, and are met by a chorus of eager agreements. Thanks to your victory over [harpyDominant.name], and the power of your arcane aura, you've been able to subdue [harpyDominant.namePos] nest! Looking down at the defeated matriarch, you wonder if you should publicly prove to all these harpies who's in control here...</p>",
    queenHtml: function () {
      var title = LT.game.player && LT.game.player.isFeminine && LT.game.player.isFeminine() ? "Mistress" : "Master";
      return (
        "<p>[pc.speech(If you <i>ever</i> talk to me like that again, I'll have your little pet here use you as her next toy! And, speaking of you,)] you shout, looking at [harpyDominantCompanion.Name], [pc.speech(you'd better have a <i>damn</i> good reason why you aren't kneeling to your new queen!)]</p>" +
        "<p>From the moment you set foot in [harpyDominant.namePos] nest, you could tell that your beautiful features and potent arcane aura were having a strong effect on her flock. Now, speaking in the same dominant manner as their matriarch, you hear the murmurs of unrest rising up around you. Not wanting to anger you, [dominantHarpyCompanion.name] suddenly rushes forwards, before dropping to her knees before you.</p>" +
        "<p>[harpyDominant.speech([harpyDominantCompanion.Name]! You insolent bitch! Get back here, <i>right this instant</i>!)] [harpyDominant.name] screams.</p>" +
        "<p>[harpyDominantCompanion.Name] shuffles closer to you, letting out a little whine as she bows her head in submission. [harpyDominantCompanion.speech(" +
        title +
        ", I'll do whatever you want!)]</p>" +
        "<p>Not quite knowing how to react, [harpyDominant.name] watches in disbelief as the rest of the harpies follow [harpyDominantCompanion.namePos] lead. As one, they flock towards you, bowing their heads in recognition that you're a more powerful and, crucially, more attractive leader than their current matriarch.</p>" +
        "<p>Witnessing the loss of her flock, [harpyDominant.name] suddenly jumps down from her podium. Storming towards you, she angrily grabs the neck of [harpyDominantCompanion.namePos] dress, and with a violent yank, pulls her away from you. Just as you're about to order your new followers to defend you, [harpyDominant.name] jumps forwards, throwing herself down onto her knees before you.</p>" +
        "<p>[harpyDominant.speech(" +
        title +
        "!)] [harpyDominant.name] shouts. [harpyDominant.speech(I'll keep your flock in-line for you! Please, " +
        title +
        ", let me be of use to you!)]</p>" +
        "<p>You can't help but let out a mocking laugh as the matriarch submits to you. Having the choice between building up a new flock, or submitting to your rule, [harpyDominant.name] has obviously chosen the latter, and you reward her obedience by telling her what she wants to hear, [pc.speech(Good girl! You'll do exactly as I say from now on, understood?!)]</p>" +
        "<p>[harpyDominant.Name] shuffles closer, letting out a submissive little mewling sound as she responds, [harpyDominant.speech(Yes " +
        title +
        "! I'll do as you command! I'll be your good girl! Please, " +
        title +
        ", take this special perfume as a sign of my submission to you!)]</p>" +
        "<p>Producing a dark red bottle of perfume, [harpyDominant.name] holds it out towards you. [harpyDominant.speech(If you want, " +
        title +
        ", this will turn you into one of us!)] You take the perfume in recognition of [harpyDominant.namePos] submission, but you're unsure whether you'll actually use it...</p>" +
        "<p>[pc.speech(Good girl!)] you say. [pc.speech(Now, you're going to get this nest to calm down! If I hear just <i>one</i> report of these harpies misbehaving, you're going to be in some serious trouble!)]</p>" +
        "<p>[harpyDominant.speech(Yes, " +
        title +
        "! I'll discipline them! Don't worry about them any more!)]</p>" +
        "<p>Thanks to your dominant personality and good looks, you've been able to subdue [harpyDominant.namePos] nest without fighting! Looking down at the now-submissive matriarch, you wonder if you should publicly prove to all these harpies who's in control here...</p>"
      );
    },
    queenSexTip: "Have dominant sex with Diana in front of your new flock.",
    queenSexStart:
      "<p>Eager to put [harpyDominant.name] in her place in front of your new flock, you reach down and grab her wings. Pulling her to her feet, you step forwards, before planting a deep kiss on her [harpyDominant.lips+].</p><p>[harpyDominant.Name] responds to your dominant move by letting out a submissive little whine, and, wrapping her wings around your back, she passionately starts returning your kiss...</p>",
    queenResponse: function () {
      var r = new LT.Response("Usurp throne", "How <i>dare</i> she speak to you like that! It's time to show her who's really in control here!", "dominant.queen");
      if (!(playerFetish("FETISH_DOMINANT") && feminineStrong())) {
        r.disable("You need a dominant fetish and a strongly feminine appearance to pull this off.");
      }
      return r;
    },
  });

  defineNest({
    id: "nympho",
    pack: "nympho",
    place: "HARPY_NESTS_HARPY_NEST_PINK",
    exteriorTag: "HARPY_NEST_NYMPHO",
    approachTag: "HARPY_NEST_NYMPHO_APPROACH",
    leaveTag: "NYMPHO_LEAVE",
    pacifiedLeaveTag: "PACIFIED_NYMPHO_LEAVE",
    sexStartTag: "PACIFIED_NYMPHO_SEX_START",
    afterSexTag: "NYMPHO_AFTER_SEX",
    leaveAfterSexTag: "NYMPHO_LEAVE_AFTER_SEX",
    encounteredFlag: "nymphoEncountered",
    pacifiedFlag: "nymphoPacified",
    itemId: "HARPY_MATRIARCH_NYMPHO_LOLLIPOP",
    sexTitle: "Sex",
    sexTip: "Have nympho sex with Lexi.",
    oralTag: "NYMPHO_SEX_START_ORAL",
    spitTag: "NYMPHO_SEX_START_SPITROAST",
    spitBehindTag: "NYMPHO_SPITROAST_BEHIND_START",
    spitFrontTag: "NYMPHO_SPITROAST_IN_FRONT_START",
    tfTitle: "Suck lollipop",
    tfTip: "Allow Lexi to push the lollipop into your mouth... This is a unique transformation, and so bypasses your TF preferences!",
    badEndName: "Hen Party",
    apologiseTag: "COMBAT_LOST_BAD_END_BEG",
    apologiseTip: "Beg your new matriarch to forgive you...",
    matriarch: { name: "Lexi" },
    pet: { name: "Max" },
    ensureMat: function () {
      return LT.ensureLexi();
    },
    ensurePet: function () {
      return LT.ensureMax();
    },
    talkHtml:
      "<p>[pc.speech(What I want,)] you say, [pc.speech(is for you to get your nest under control. The Enforcers are struggling to keep the peace, and it's members of your nest who are responsible!)]</p><p>[harpyNympho.speech(Well it's not <i>my</i> fault if some of my playthings want to have a bit of extra fun elsewhere!)] [harpyNympho.name] replies. [harpyNympho.speech(And anyway, you're kind of interrupting things here, so how about you turn around and go bother someone else! [harpyNymphoCompanion.Name]! Why don't you show this rude [pc.race] the way out!)]</p><p>As [harpyNymphoCompanion.name] moves forwards, you realise that [harpyNympho.name] isn't going to listen to you. You'll either have to think of another way to convince these harpies to calm down, or make them calm down by using force.</p>",
    uglyHtml:
      "<p>Realising that you're going to have to force [harpyNympho.name] to get her nest under control, you decide to draw her into a confrontation, [pc.speech(Well, if you aren't going to calm your nest down, can you at least agree to put up some walls around your nest? It's not nice having to see a harpy as ugly as you every time I walk past your nest.)]</p><p>[harpyNympho.Name] lets out a furious scream, and, flapping her wings, she shouts out to her companion, [harpyNympho.speech([harpyNymphoCompanion.Name]! Get [pc.herHim]! Get [pc.herHim]! That fucker! [pc.She] said I was ugly!)]</p><p>Looking almost as furious as [harpyNympho.name] does, [harpyNymphoCompanion.name] jumps forwards, eager to please her matriarch as she launches into a furious assault.</p>",
    forceHtml:
      "<p>Realising that [harpyNympho.name] isn't going to listen to reason, you make your final demand, [pc.speech(You're either going to get your nest to calm down right now, or I'm going to make you!)]</p><p>[harpyNympho.Name] lets out an angry cry, and she shouts out to her companion, [harpyNympho.speech([harpyNymphoCompanion.Name], throw this [pc.race] out already! <i>Nobody</i> talks to me like that and gets away with it!)]</p><p>[harpyNymphoCompanion.name] immediately runs forwards, eager to please her matriarch as she launches into a furious assault.</p>",
    beatPetHtml:
      "<p>[harpyNympho.Name] lets out an angry wail as [harpyNymphoCompanion.name] falls to the floor, defeated. You notice a lot of the surrounding harpies glancing nervously at each other, and a few start to shuffle around to your side of the platform. It looks as though they're getting ready to support you if you manage to defeat their matriarch.</p><p>You don't have too much time to ponder on these harpies' fickle nature, as [harpyNympho.Name] suddenly rushes forwards, shouting, [harpyNympho.speech(You're going to pay for this!)]</p>",
    beatMatHtml:
      "<p>[harpyNympho.NamePos] flock, just a moment ago cheering and shouting support for their matriarch, falls completely silent as they see her slump to the floor, defeated. Walking forwards, you tower over the panting mass of pink feathers, and you hear an erotic moan slip out from between [harpyNympho.namePos] lips as she pushes herself up onto her knees. [harpyNympho.speech(Y-You're so... powerful...)]</p><p>[pc.speech(That's right,)] you respond, [pc.speech(I don't care how you normally determine a flock's leader up here in the Nests; I'm in charge now!)]</p><p>Your arcane aura is clearly having a strong effect on [harpyNympho.name], and you hear her letting out another lewd moan as she responds. Seeing their matriarch submit to you, the rest of the flock falls silent as you issue your orders, [pc.speech(You're all going to calm down, got it?! No more feuds, and no more attacking travellers through the Harpy Nests!)]</p><p>Your words seem to sink in, and are met by a chorus of eager agreements. Thanks to your victory over [harpyNympho.name], and the power of your arcane aura, you've been able to subdue [harpyNympho.namePos] nest! Looking down at the defeated matriarch, you wonder if you should publicly prove to all these harpies who's in control here...</p>",
    queenHtml: function () {
      var title = LT.game.player && LT.game.player.isFeminine && LT.game.player.isFeminine() ? "Mistress" : "Master";
      return (
        "<p>[pc.speech(So, do you only fuck one of your little boy-toys here at a time?)] you ask in a derisory tone. [pc.speech(Because you know you could be doing a lot more than that, right?)]</p>" +
        "<p>For a moment, [harpyNympho.name] seems to be caught off guard, and stumbles over her words as she responds, [harpyNympho.speech(W-Well, I mean, I like to make each harpy feel special!)]</p>" +
        "<p>The murmurs of conversation that had been surrounding you up until this point start to fade away, and you realise that the crowds of male harpies all around you are listening in closely. From the moment you stepped foot inside [harpyNympho.namePos] nest, you could feel her flock's gaze resting on your beautiful figure, and now, loudly critiquing their matriarch's sexual skills, you're getting their full attention.</p>" +
        "<p>Striking the most sensual pose you can muster, you continue, [pc.speech(You know, you're hoarding all these gorgeous harpies here for your own personal use, but you're only willing to fuck them one at a time?! That's kind of unfair, don't you all agree?)]</p>" +
        "<p>Turning to address the crowd as you ask that last question, the entire flock responds by calling out in agreement. Your beautiful features and potent arcane aura are obviously having a strong effect on these harpies, which, combined with talking about sex in such an open manner, has turned them over to your side.</p>" +
        "<p>[harpyNympho.speech(But, w-what should I be doing then?)] [harpyNympho.name] nervously asks. [harpyNympho.speech(I didn't realise I was being unfair...)]</p>" +
        "<p>[pc.speech(Oh, there's lots of things you could be doing,)] you say, walking closer to her. [pc.speech(like having your pussy, ass and mouth all used at the same time. Or allowing your nest to run a train on your slutty little cunt here.)]</p>" +
        "<p>As you say that, you reach down and grab [harpyNympho.namePos] exposed pussy. She lets out a little squeak, and, leaning into you, moans, [harpyNympho.speech(Yes... I'll do that... What else?)]</p>" +
        "<p>[pc.speech(I think it's obvious by now what you need to do,)] you moan into her ear. [pc.speech(Kneel down and accept that I'm the one in charge here.)]</p>" +
        "<p>Realising that her flock has been mesmerised by your words, [harpyNympho.name] falls down onto her knees before you. Looking up with big, lust-filled eyes, she moans, [harpyNympho.speech(" +
        title +
        ", please teach me! I'll calm the flock down for you! Please " +
        title +
        ", tell me what to do!)]</p>" +
        "<p>You can't help but let out a little laugh as the matriarch submits to you. [pc.speech(Good girl! You'll do exactly as I say from now on, understood?!)]</p>" +
        "<p>[harpyNympho.Name] shuffles closer, continuing to let out little moaning noises as she responds, [harpyNympho.speech(Yes " +
        title +
        "! I'll do what you say! Please, " +
        title +
        ", I have something for you!)]</p>" +
        "<p>Producing a cock-shaped lollipop, [harpyNympho.name] holds it out towards you. [harpyNympho.speech(" +
        title +
        ", this will make you look like me! I-If you want to look like me, that is...)] You take the lollipop in recognition of [harpyNympho.namePos] submission, but you're unsure whether you'll actually use it...</p>" +
        "<p>[pc.speech(Good girl!)] you say. [pc.speech(Now, you're going to get your nest to calm down, aren't you?)]</p>" +
        "<p>[harpyNympho.speech(Yes " +
        title +
        "! I'll be able to relieve all their stress if I start letting them use me all at once!)]</p>" +
        "<p>Thanks to your own obsession with sex, your powerful arcane aura, and your good looks, you've been able to subdue [harpyNympho.namePos] nest without fighting! Looking down at the still-moaning matriarch, you wonder if you should give her some one-to-one tuition...</p>"
      );
    },
    queenSexTip: "Have dominant sex with Lexi.",
    queenSexStart:
      "<p>Eager to help satisfy [harpyNympho.namePos] craving for sex, you reach down and grab her wings. Pulling her to her feet, you step forwards, before planting a deep kiss on her [harpyNympho.lips+].</p><p>[harpyNympho.Name] responds to your dominant move by letting out an excited squeal, and, enthusiastically wrapping her wings around your back, she passionately starts returning your kiss...</p>",
    queenResponse: function () {
      var r = new LT.Response(
        "Nympho Queen",
        "You feel sorry for this matriarch, only getting to have sex with the same males over and over again. Tell her how a real nympho behaves!",
        "nympho.queen",
      );
      if (!(playerPerk("NYMPHOMANIAC") && feminineStrong())) {
        r.disable("You need the nymphomaniac perk and a strongly feminine appearance to pull this off.");
      }
      return r;
    },
  });
})();
