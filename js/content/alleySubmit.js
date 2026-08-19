(function () {
  function currentPlace() {
    return (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "";
  }

  function attackXml(tag) {
    return LT.parseFromXML("encounters/dominion/alleywayAttack", tag);
  }

  function mugger() {
    return typeof LT.activeAlleyNpc === "function" ? LT.activeAlleyNpc() : LT.game.npcs && LT.game.npcs.alleyMugger;
  }

  function demand3() {
    var n = mugger();
    return (50 + 10 * ((n && n.level) || 1)) * 3;
  }

  function leavePlace() {
    return "place." + currentPlace();
  }

  function acceptBitch(kind) {
    var n = mugger();
    if (!n) return;
    n.playerKnowsName = true;
    n.encounteredBefore = true;
    n.callsPlayer = Math.random() < 0.5 ? "Bitch" : Math.random() < 0.5 ? "Pet" : "Slave";
    n.playerCallsNpc = n.feminine ? (Math.random() < 0.5 ? "Mistress" : "Ma'am") : Math.random() < 0.5 ? "Master" : "Sir";
    if (n.getPlayerSurrenderCount && n.getPlayerSurrenderCount() < 4) n.incrementPlayerSurrenderCount(1);
    LT.game.flags.alleySubmitKind = kind;
  }

  function makeSceneNpc(role, opts) {
    opts = opts || {};
    var extra = LT.generateAlleyMugger({
      prostitute: false,
      transient: true,
      noBind: true,
      feminine: opts.feminine,
      attractedToPlayer: opts.attractedToPlayer != null ? opts.attractedToPlayer : true,
    });
    extra.playerKnowsName = true;
    extra.occupation = role;
    extra.transient = true;
    LT.game.npcs[role] = extra;
    return extra;
  }

  function fightResponses(npc, rebel) {
    return LT.ResponseCombat(rebel ? "Rebel" : "Refuse", rebel
      ? LT.parse("Refuse to play along as [npc.namePos] bitch any longer and prepare to fight for your freedom!")
      : LT.parse("Refuse to become [npc.namePos] bitch and prepare to defend yourself!"), {
      enemy: npc,
      escapeChance: 15,
      victoryNode: "alley.victory",
      defeatNode: "alley.defeat",
      returnNode: leavePlace(),
      onVictory: function () {
        npc.encounteredBefore = true;
        return "";
      },
      onDefeat: function () {
        npc.encounteredBefore = true;
        var take = Math.min(LT.getMoney(), demand3());
        return take ? LT.incrementMoney(-take) : "";
      },
    });
  }

  LT.alleySubmittedResponses = function (npc) {
    npc = npc || mugger();
    if (!npc) return [new LT.Response("Continue", "There's nobody here.", leavePlace())];
    var count = npc.getPlayerSurrenderCount ? npc.getPlayerSurrenderCount() : 0;
    var list = [null];
    if (count === 3) {
      list.push(fightResponses(npc, false));
      var foot = typeof LT.isFootContentEnabled === "function" && LT.isFootContentEnabled();
      var sadist = npc.fetishes && npc.fetishes.indexOf && npc.fetishes.indexOf("SADIST") >= 0;
      if (foot) {
        list.push(new LT.Response("Kiss [npc.feet]".replace("[npc.feet]", "feet"), LT.parse("Show [npc.name] that you're [npc.her] bitch by kissing [npc.her] feet.<br/><i>Becoming [npc.namePos] bitch will change your available options when encountering [npc.herHim] again.</i>"), "alley.submitted", function () {
          acceptBitch("feet");
          LT.game.textStart = attackXml("SUBMITTING_FEET");
        }));
      } else if (sadist) {
        list.push(new LT.Response("Get spanked", LT.parse("Show [npc.name] that you're [npc.her] bitch by presenting your ass for a spanking.<br/><i>Becoming [npc.namePos] bitch will change your available options when encountering [npc.herHim] again.</i>"), "alley.submitted", function () {
          acceptBitch("spank");
          LT.game.textStart = attackXml("SUBMITTING_SPANKING");
        }));
      } else {
        list.push(new LT.Response("Bow down", LT.parse("Show [npc.name] that you're [npc.her] bitch by bowing down before [npc.herHim].<br/><i>Becoming [npc.namePos] bitch will change your available options when encountering [npc.herHim] again.</i>"), "alley.submitted", function () {
          acceptBitch("bow");
          LT.game.textStart = attackXml("SUBMITTING_BOW_DOWN");
        }));
      }
      return list;
    }

    var scene = (LT.game.flags && LT.game.flags.alleySubmitScene) || 4;
    list.push(fightResponses(npc, true));
    if (scene <= 3) {
      var pay = new LT.Response("Pay up (" + demand3() + ")", LT.parse("Do as [npc.name] commands and give [npc.herHim] the flames [npc.she] is demanding."), "alley.submitted-paid", function () {
        npc.incrementPlayerSurrenderCount(1);
        LT.addSpecialParse(String(demand3()), true);
        LT.game.textEnd = LT.incrementMoney(-demand3());
      });
      if (LT.getMoney() < demand3()) pay.disable("You don't have enough flames.");
      list.push(pay);
      list.push(new LT.Response("Partner in crime", LT.parse("Obediently follow [npc.name] and assist [npc.herHim] in mugging the first innocent traveller you find."), "alley.submitted-mugging", function () {
        npc.incrementPlayerSurrenderCount(1);
        makeSceneNpc("victim", { attractedToPlayer: false });
      }));
      list.push(new LT.Response("Pimped out", LT.parse("Submissively follow [npc.name] and allow [npc.herHim] to pimp you out to a 'friend' of [npc.hers]."), "alley.submitted-pimped", function () {
        npc.incrementPlayerSurrenderCount(1);
        makeSceneNpc("friend", { attractedToPlayer: true });
      }));
    } else if (scene === 5) {
      list.push(new LT.Response("Walkies", LT.parse("Crawl alongside [npc.name] as [npc.she] travels to a nearby shop to buy some food."), "alley.submitted-walkies", function () {
        npc.incrementPlayerSurrenderCount(1);
        makeSceneNpc("stranger", { attractedToPlayer: true });
      }));
    } else {
      if (npc.attractedToPlayer) {
        list.push(LT.ResponseSex("Fucked", LT.parse("Be a good bitch and let [npc.name] dominantly fuck you."), {
          partner: npc,
          playerDom: false,
          consensual: true,
          startText: attackXml("SUBMITTED_REPEAT_SEX_START"),
          postSexNode: "alley.submitted-after-sex",
          onEnd: function () {
            npc.incrementPlayerSurrenderCount(1);
          },
        }));
      } else {
        list.push(new LT.Response("Pay up (" + demand3() + ")", LT.parse("Do as [npc.name] commands and give [npc.herHim] the flames [npc.she] is demanding."), "alley.submitted-paid", function () {
          npc.incrementPlayerSurrenderCount(1);
          LT.addSpecialParse(String(demand3()), true);
          LT.game.textEnd = LT.incrementMoney(-demand3());
        }));
      }
    }
    return list;
  };

  LT.defineNode({
    id: "alley.submitted",
    ui: "dialogue",
    title: "Submitted",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (mugger()) bindIf(mugger());
    },
    getContent: function () {
      return attackXml("SUBMITTED_END");
    },
    getResponses: function () {
      var n = mugger();
      var list = [null];
      if (n && n.attractedToPlayer) {
        list.push(LT.ResponseSex("Fucked", LT.parse("Submit to [npc.name] as [npc.she] takes you."), {
          partner: n,
          playerDom: false,
          consensual: true,
          startText: attackXml("SUBMITTED_FUCKED_WILLING"),
          postSexNode: "alley.submitted-after-sex",
        }));
      }
      list.push(new LT.Response("Leave", LT.parse("Leave [npc.name] for now. [npc.She] will still be waiting in this alley."), leavePlace(), function () {
        if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
      }));
      return list;
    },
  });

  function bindIf(n) {
    if (!n) return;
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.alleyMugger = n;
    LT.game.npcs.npc = n;
    if (n.id) LT.game.npcs[n.id] = n;
  }

  LT.defineNode({
    id: "alley.submitted-paid",
    ui: "dialogue",
    title: "Paid",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      LT.addSpecialParse(String(demand3()), true);
      return attackXml("SUBMITTED_REPEAT_PAID");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Continue on your way.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-after-sex",
    ui: "dialogue",
    title: "After sex",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return attackXml("SUBMITTED_AFTER_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Continue", "Continue on your way.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-mugging",
    ui: "dialogue",
    title: "Partner in crime",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var victim = LT.game.npcs && LT.game.npcs.victim;
      if (typeof LT.withParseTargets === "function") {
        return LT.withParseTargets({ npc: mugger(), victim: victim, pc: LT.game.player }, function () {
          return attackXml("SUBMITTED_REPEAT_MUGGING");
        });
      }
      return attackXml("SUBMITTED_REPEAT_MUGGING");
    },
    getResponses: function () {
      var victim = LT.game.npcs && LT.game.npcs.victim;
      return [
        null,
        new LT.Response("Attack", "Help beat the traveller into submission.", "alley.submitted-mugging-won"),
        new LT.Response("Back out", "Refuse to go through with the mugging.", "alley.submitted-mugging-refuse"),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-mugging-won",
    ui: "dialogue",
    title: "Mugging",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var victim = LT.game.npcs && LT.game.npcs.victim;
      if (typeof LT.withParseTargets === "function") {
        return LT.withParseTargets({ npc: mugger(), victim: victim, pc: LT.game.player }, function () {
          return attackXml("SUBMITTED_REPEAT_MUGGING_COMBAT_WON");
        });
      }
      return attackXml("SUBMITTED_REPEAT_MUGGING_COMBAT_WON");
    },
    getResponses: function () {
      var n = mugger();
      var victim = LT.game.npcs && LT.game.npcs.victim;
      var list = [
        null,
        new LT.Response("Leave", "Walk away now that the mugging is done.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
      if (n && victim && n.attractedToPlayer === false) {
        /* still allow watching if mugger is attracted to victim */
      }
      if (victim) {
        list.push(LT.ResponseSex("Watch", "Stay and watch.", {
          partner: n,
          extra: victim,
          playerDom: false,
          consensual: true,
          startText: (function () {
            if (typeof LT.withParseTargets === "function") {
              return LT.withParseTargets({ npc: n, victim: victim, pc: LT.game.player }, function () {
                return attackXml("SUBMITTED_REPEAT_MUGGING_SPECTATE_SEX");
              });
            }
            return attackXml("SUBMITTED_REPEAT_MUGGING_SPECTATE_SEX");
          })(),
          postSexNode: "alley.submitted-mugging-after",
        }));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "alley.submitted-mugging-refuse",
    ui: "dialogue",
    title: "Refused",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return attackXml("SUBMITTED_REPEAT_MUGGING_REFUSE_SEX");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Get out of here.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-mugging-after",
    ui: "dialogue",
    title: "After",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return attackXml("SUBMITTED_REPEAT_MUGGING_SPECTATE_SEX_END");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Continue on your way.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-pimped",
    ui: "dialogue",
    title: "Pimped out",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var friend = LT.game.npcs && LT.game.npcs.friend;
      if (typeof LT.withParseTargets === "function") {
        return LT.withParseTargets({ npc: mugger(), friend: friend, pc: LT.game.player }, function () {
          return attackXml("SUBMITTED_REPEAT_PIMPED_OUT");
        });
      }
      return attackXml("SUBMITTED_REPEAT_PIMPED_OUT");
    },
    getResponses: function () {
      var friend = LT.game.npcs && LT.game.npcs.friend;
      var n = mugger();
      var list = [null];
      if (friend) {
        list.push(LT.ResponseSex("Submit", "Do as they agreed and let the friend use you.", {
          partner: friend,
          playerDom: false,
          consensual: true,
          startText: attackXml("SUBMITTED_REPEAT_PIMPED_OUT_GENERIC_START"),
          postSexNode: "alley.submitted-pimped-after",
        }));
      }
      list.push(new LT.Response("Refuse", "You can't go through with this.", leavePlace(), function () {
        if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
      }));
      return list;
    },
  });

  LT.defineNode({
    id: "alley.submitted-pimped-after",
    ui: "dialogue",
    title: "After",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return attackXml("SUBMITTED_REPEAT_PIMPED_OUT_SEX_END");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Leave the apartment.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-walkies",
    ui: "dialogue",
    title: "Walkies",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var stranger = LT.game.npcs && LT.game.npcs.stranger;
      if (typeof LT.withParseTargets === "function") {
        return LT.withParseTargets({ npc: mugger(), stranger: stranger, pc: LT.game.player }, function () {
          return attackXml("SUBMITTED_REPEAT_WALKIES");
        });
      }
      return attackXml("SUBMITTED_REPEAT_WALKIES");
    },
    getResponses: function () {
      var stranger = LT.game.npcs && LT.game.npcs.stranger;
      var list = [
        null,
        new LT.Response("Ignore", "Turn away and wait for your owner to return.", "alley.submitted-walkies-ignore"),
      ];
      if (stranger) {
        var startTag = stranger.hasPenis && stranger.hasPenis() ? "SUBMITTED_REPEAT_WALKIES_ORAL_START" : "SUBMITTED_REPEAT_WALKIES_ORAL_VAGINAL_START";
        list.push(LT.ResponseSex("Service", "Do as the stranger wants.", {
          partner: stranger,
          playerDom: false,
          consensual: true,
          startText: attackXml(startTag),
          postSexNode: "alley.submitted-walkies-after",
        }));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "alley.submitted-walkies-ignore",
    ui: "dialogue",
    title: "Walkies",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return attackXml("SUBMITTED_REPEAT_WALKIES_IGNORE");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Get up and continue on your way.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });

  LT.defineNode({
    id: "alley.submitted-walkies-after",
    ui: "dialogue",
    title: "After",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return attackXml("SUBMITTED_REPEAT_WALKIES_SEX_END");
    },
    getResponses: function () {
      return [
        null,
        new LT.Response("Leave", "Continue on your way.", leavePlace(), function () {
          if (typeof LT.clearAlleyMugger === "function") LT.clearAlleyMugger();
        }),
      ];
    },
  });
})();
