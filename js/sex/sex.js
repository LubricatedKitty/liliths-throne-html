(function () {
  LT.MAX_AROUSAL = 100;
  LT.AROUSAL_INCREASE = {
    NEGATIVE_MAJOR: -30,
    NEGATIVE: -20,
    ZERO_NONE: 0.1,
    ONE_MINIMUM: 0.5,
    TWO_LOW: 1,
    THREE_NORMAL: 1.5,
    FOUR_HIGH: 2,
    FIVE_EXTREME: 5,
  };

  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function parseSex(text, src, tgt) {
    if (!text) return "";
    if (typeof LT.parse !== "function") return text;
    var prev = LT._parseSexNames;
    LT._parseSexNames = true;
    try {
      if (typeof LT.withParseTargets === "function") {
        return LT.withParseTargets({ npc: src, npc2: tgt, pc: LT.game.player }, function () {
          return LT.parse(text);
        });
      }
      return LT.parse(text);
    } finally {
      LT._parseSexNames = prev;
    }
  }

  function ensureSexState(ch) {
    if (!ch) return;
    if (ch.arousal == null) ch.arousal = 0;
    ch.sexExposed = ch.sexExposed || { MOUTH: true, BREASTS: false, PENIS: false, VAGINA: false, ANUS: false, FOOT: false };
    if (ch.orgasmedThisSex == null) ch.orgasmedThisSex = 0;
  }

  LT.applyArousal = function (ch, amount) {
    if (!ch) return 0;
    var before = ch.arousal || 0;
    ch.arousal = Math.max(0, Math.min(LT.MAX_AROUSAL, before + amount));
    return ch.arousal - before;
  };

  function coverKey(area) {
    if (area === "BREASTS") return "chest";
    if (area === "VAGINA" || area === "PENIS" || area === "ANUS") return "groin";
    if (area === "FOOT" || area === "FEET") return "foot";
    return null;
  }

  function itemBlocksArea(item, area) {
    if (!item || item.removed || item.displaced) return false;
    var key = coverKey(area);
    if (!key) return false;
    var covers = item.covers || [item.slot];
    return covers.indexOf(key) >= 0;
  }

  LT.isSexExposed = function (ch, area) {
    if (!ch) return false;
    if (area === "MOUTH") return true;
    if (ch.sexExposed && ch.sexExposed[area]) return true;
    if (ch.equipped) {
      var slots = Object.keys(ch.equipped);
      var sawCover = false;
      var i;
      for (i = 0; i < slots.length; i++) {
        var item = ch.equipped[slots[i]];
        if (!item) continue;
        var key = coverKey(area);
        var covers = item.covers || [item.slot];
        if (key && covers.indexOf(key) >= 0) {
          sawCover = true;
          if (itemBlocksArea(item, area)) return false;
        }
      }
      if (sawCover) return true;
    }
    return !!(ch.sexExposed && ch.sexExposed[area]);
  };

  LT.setSexExposed = function (ch, area, on) {
    if (!ch) return;
    ch.sexExposed = ch.sexExposed || {};
    ch.sexExposed[area] = !!on;
  };

  function dressForSex(ch) {
    if (!ch) return;
    if (ch.equipped && Object.keys(ch.equipped).length) return;
    if (typeof LT.makeClothing !== "function") return;
    ch.equipped = {};
    var fem = ch.isFeminine ? ch.isFeminine() : !!ch.feminine;
    if (fem) {
      ch.equipped.chest = LT.makeClothing("plunge_bra");
      ch.equipped.groin = LT.makeClothing("panties");
      ch.equipped.torso = LT.makeClothing("skater_dress");
    } else {
      ch.equipped.groin = LT.makeClothing("boxers");
      ch.equipped.torso = LT.makeClothing("shirt_short");
      ch.equipped.leg = LT.makeClothing("trousers");
    }
  }

  LT.sex = {
    active: false,
    turn: 0,
    player: null,
    partner: null,
    playerDom: true,
    consensual: true,
    manager: "generic",
    positionName: "Standing",
    postSexNode: null,
    startText: "",
    lastResolution: "",
    ongoing: null,
    finished: false,
    onEnd: null,
  };

  LT.sex.start = function (opts) {
    opts = opts || {};
    var player = LT.game.player;
    var partner = opts.partner;
    if (!player || !partner) return;
    ensureSexState(player);
    ensureSexState(partner);
    player.arousal = player.arousal || 0;
    partner.arousal = partner.arousal || 0;
    player.orgasmedThisSex = 0;
    partner.orgasmedThisSex = 0;
    player.sexExposed = { MOUTH: true, BREASTS: false, PENIS: false, VAGINA: false, ANUS: false, FOOT: false };
    partner.sexExposed = { MOUTH: true, BREASTS: false, PENIS: false, VAGINA: false, ANUS: false, FOOT: false };
    this.active = true;
    this.turn = 0;
    this.player = player;
    this.partner = partner;
    this.playerDom = opts.playerDom !== false;
    this.consensual = opts.consensual !== false;
    this.manager = opts.manager || "generic";
    this.positionName = opts.positionName || "Standing";
    this.postSexNode = opts.postSexNode || null;
    this.startText = opts.startText
      ? (typeof LT.withParseTargets === "function"
          ? LT.withParseTargets({ npc: partner, npc2: player, pc: player }, function () {
              return LT.parse(opts.startText);
            })
          : opts.startText)
      : "";
    this.lastResolution = this.startText;
    this.ongoing = null;
    this.finished = false;
    this.onEnd = opts.onEnd || null;
    this.responseTab = 0;
    this.clothingMenu = false;
    dressForSex(player);
    dressForSex(partner);
  };

  LT.sex.isKissing = function () {
    return !!(this.ongoing && this.ongoing.id === "kiss");
  };

  LT.sex.canStop = function () {
    if (!this.active || this.finished) return false;
    if (this.consensual) return true;
    return ((this.player && this.player.orgasmedThisSex) || 0) + ((this.partner && this.partner.orgasmedThisSex) || 0) > 0;
  };

  function register(def) {
    LT.SEX_ACTIONS[def.id] = def;
  }

  LT.SEX_ACTIONS = {};

  register({
    id: "kiss_start",
    name: "Start kissing",
    tab: 0,
    type: "START_ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function () {
      return !LT.sex.ongoing;
    },
    tooltip: function (src, tgt) {
      return parseSex("Press your [npc.lips] against [npc2.namePos] mouth and start making out with [npc2.herHim].", src, tgt);
    },
    perform: function (src, tgt) {
      LT.sex.ongoing = { id: "kiss", penetration: "TONGUE", orifice: "MOUTH", performer: src, target: tgt };
      return parseSex(
        pick([
          "[npc.Name] [npc.verb(lean)] down, pressing [npc.her] [npc.lips+] against [npc2.namePos] mouth as [npc.she] [npc.verb(deliver)] a passionate kiss.",
          "With a grin, [npc.name] [npc.verb(lean)] down into [npc2.namePos] [npc2.breasts], breathing in [npc2.her] [npc2.scent] as [npc.she] [npc.verb(press)] [npc.her] [npc.lips+] against [npc2.hers].",
          "Leaning down, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(press)] [npc.her] [npc.lips+] against [npc2.namePos] and [npc.she] [npc.verb(start)] to eagerly kiss [npc2.herHim].",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "kiss",
    name: "Kiss",
    tab: 0,
    type: "ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function () {
      return LT.sex.isKissing();
    },
    tooltip: function (src, tgt) {
      return parseSex("Continue kissing [npc2.name].", src, tgt);
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "Eagerly pressing [npc.her] [npc.lips+] against [npc2.nameHers], [npc.name] [npc.verb(plant)] a series of passionate kisses on [npc2.her] mouth.",
          "[npc.Name] eagerly [npc.verb(lean)] in against [npc2.name], breathing in [npc2.her] [npc2.scent+] as [npc.she] [npc.verb(plant)] a series of soft kisses on [npc2.her] [npc2.lips+].",
          "[npc.Name] eagerly [npc.verb(press)] against [npc2.namePos] [npc2.breasts+], before tilting [npc.her] head slightly to one side as [npc.she] passionately [npc.verb(kiss)] [npc2.her] [npc2.lips+].",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "kiss_stop",
    name: "Stop kissing",
    tab: 0,
    type: "STOP_ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function () {
      return LT.sex.isKissing();
    },
    tooltip: function (src, tgt) {
      return parseSex("Pull away from [npc2.name] and stop kissing [npc2.herHim].", src, tgt);
    },
    perform: function (src, tgt) {
      LT.sex.ongoing = null;
      return parseSex(
        pick([
          "Gazing into [npc2.namePos] [npc2.eyes], [npc.name] [npc.verb(grin)] as [npc.she] [npc.verb(pull)] back, putting an end to [npc.her] kiss.",
          "[npc.Name] suddenly [npc.verb(pull)] back, bringing an end to [npc.her] kiss.",
          "[npc.Name] [npc.verb(pull)] back from [npc2.name], taking [npc.her] [npc.lips+] away from [npc2.hers] as [npc.she] breaks off [npc.her] kiss.",
        ]),
        src,
        tgt,
      );
    },
  });

  function hasPenis(ch) {
    return !!(ch && ((ch.hasPenis && ch.hasPenis()) || (ch.gender && ch.gender.hasPenis)));
  }
  function hasVagina(ch) {
    return !!(ch && ((ch.hasVagina && ch.hasVagina()) || (ch.gender && ch.gender.hasVagina)));
  }
  function hasBreasts(ch) {
    if (!ch) return false;
    if (ch.hasBreasts) return ch.hasBreasts();
    return !!(ch.gender && ch.gender.hasBreasts);
  }
  function hasFuckableNipples(ch) {
    return !!(ch && ch.fuckableNipples);
  }
  function pairOngoing(id) {
    return !!(LT.sex.ongoing && LT.sex.ongoing.id === id);
  }
  function setOngoing(id, giver, receiver, label) {
    LT.sex.ongoing = { id: id, giver: giver, receiver: receiver, label: label };
  }
  function takeVirgin(penetrator, receiver) {
    var flag = receiver.sex && receiver.sex.vaginaVirgin;
    if (receiver.vaginaVirgin != null) flag = receiver.vaginaVirgin;
    if (!flag) return "";
    if (receiver.sex) receiver.sex.vaginaVirgin = false;
    receiver.vaginaVirgin = false;
    return parseSex(" As [npc2.sheIs] a virgin, [npc2.name] can't help but let out a shocked [npc2.moan] as [npc2.she] [npc2.verb(experience)] the feeling of being penetrated for the first time.", penetrator, receiver);
  }

  function registerPair(spec) {
    register({
      id: spec.id + "_start",
      pair: spec.id,
      name: spec.start.name,
      tab: 0,
      type: "START_ONGOING",
      selfArousal: spec.start.selfA,
      targetArousal: spec.start.tgtA,
      canUse: function (src, tgt) {
        return !pairOngoing(spec.id) && spec.ok(src, tgt);
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.start.tip, src, tgt);
      },
      perform: function (src, tgt) {
        setOngoing(spec.id, src, tgt, spec.label);
        var text = parseSex(pick(spec.start.lines), src, tgt);
        if (spec.onStart) text += spec.onStart(src, tgt) || "";
        return text;
      },
    });
    register({
      id: spec.id,
      pair: spec.id,
      name: spec.ongoing.name,
      tab: 0,
      type: "ONGOING",
      selfArousal: spec.ongoing.selfA,
      targetArousal: spec.ongoing.tgtA,
      canUse: function (src) {
        return pairOngoing(spec.id) && LT.sex.ongoing.giver === src;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.ongoing.tip, src, tgt);
      },
      perform: function () {
        return parseSex(pick(spec.ongoing.lines), LT.sex.ongoing.giver, LT.sex.ongoing.receiver);
      },
    });
    register({
      id: spec.id + "_stop",
      pair: spec.id,
      name: spec.stop.name,
      tab: 0,
      type: "STOP_ONGOING",
      selfArousal: "TWO_LOW",
      targetArousal: "TWO_LOW",
      canUse: function (src) {
        return pairOngoing(spec.id) && LT.sex.ongoing.giver === src;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.stop.tip, src, tgt);
      },
      perform: function () {
        var text = parseSex(pick(spec.stop.lines), LT.sex.ongoing.giver, LT.sex.ongoing.receiver);
        LT.sex.ongoing = null;
        return text;
      },
    });
    if (!spec.receive) return;
    register({
      id: spec.id + "_receive_start",
      pair: spec.id,
      name: spec.receive.start.name,
      tab: 0,
      type: "START_ONGOING",
      selfArousal: spec.receive.start.selfA,
      targetArousal: spec.receive.start.tgtA,
      canUse: function (src, tgt) {
        return !pairOngoing(spec.id) && spec.ok(tgt, src);
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.receive.start.tip, src, tgt);
      },
      perform: function (src, tgt) {
        setOngoing(spec.id, tgt, src, spec.label);
        var text = parseSex(pick(spec.receive.start.lines), src, tgt);
        if (spec.onReceiveStart) text += spec.onReceiveStart(src, tgt) || "";
        return text;
      },
    });
    register({
      id: spec.id + "_receive",
      pair: spec.id,
      name: spec.receive.ongoing.name,
      tab: 0,
      type: "ONGOING",
      selfArousal: spec.receive.ongoing.selfA,
      targetArousal: spec.receive.ongoing.tgtA,
      canUse: function (src) {
        return pairOngoing(spec.id) && LT.sex.ongoing.receiver === src;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.receive.ongoing.tip, src, tgt);
      },
      perform: function () {
        return parseSex(pick(spec.receive.ongoing.lines), LT.sex.ongoing.receiver, LT.sex.ongoing.giver);
      },
    });
    register({
      id: spec.id + "_receive_stop",
      pair: spec.id,
      name: spec.receive.stop.name,
      tab: 0,
      type: "STOP_ONGOING",
      selfArousal: "TWO_LOW",
      targetArousal: "TWO_LOW",
      canUse: function (src) {
        return pairOngoing(spec.id) && LT.sex.ongoing.receiver === src;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.receive.stop.tip, src, tgt);
      },
      perform: function () {
        var text = parseSex(pick(spec.receive.stop.lines), LT.sex.ongoing.receiver, LT.sex.ongoing.giver);
        LT.sex.ongoing = null;
        return text;
      },
    });
  }

  registerPair({
    id: "finger_vagina",
    label: "fingering",
    ok: function (giver, receiver) {
      return hasVagina(receiver) && LT.isSexExposed(receiver, "VAGINA");
    },
    start: {
      name: "Finger [npc2.herHim]",
      tip: "Sink your [npc.fingers] into [npc2.namePos] [npc2.pussy+] and start fingering [npc2.herHim].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly teasing [npc.her] [npc.fingers+] over [npc2.namePos] [npc2.labia+], [npc.name] [npc.verb(let)] out [npc.a_moan+] before greedily sinking [npc.her] digits into [npc2.her] [npc2.pussy+].",
        "[npc.Name] eagerly [npc.verb(press)] [npc.her] [npc.fingers+] down between [npc2.namePos] [npc2.legs+], and with a determined thrust, [npc.she] greedily [npc.verb(sink)] [npc.her] digits into [npc2.her] [npc2.pussy+].",
      ],
    },
    ongoing: {
      name: "Fingering",
      tip: "Continue fingering [npc2.namePos] [npc2.pussy+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly sinking [npc.her] [npc.fingers+] deep into [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(curl)] [npc.her] digits up, stroking [npc2.her] vaginal walls as [npc.she] [npc.verb(start)] passionately fingering [npc2.herHim].",
        "Firmly pushing [npc.her] [npc.hand] into [npc2.namePos] groin, [npc.name] eagerly [npc.verb(slide)] [npc.her] [npc.fingers+] deep into [npc2.namePos] [npc2.pussy+], letting out [npc.a_moan+] as [npc.she] [npc.verb(start)] rapidly fingering [npc2.herHim].",
        "Eagerly pressing [npc.her] [npc.hand] down between [npc2.namePos] [npc2.legs], [npc.name] [npc.verb(let)] out [npc.a_moan+] before enthusiastically sliding [npc.her] [npc.fingers+] deep into [npc2.her] [npc2.pussy+].",
      ],
    },
    stop: {
      name: "Stop fingering",
      tip: "Pull your [npc.fingers] out of [npc2.namePos] [npc2.pussy+] and stop fingering [npc2.herHim].",
      lines: [
        "Sliding [npc.her] [npc.fingers] out of [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(give)] [npc2.her] [npc2.clit+] a little squeeze before taking [npc.her] [npc.hand] away from [npc2.her] groin.",
        "Pushing deep inside of [npc2.name] one last time, [npc.name] then [npc.verb(slide)] [npc.her] [npc.fingers] back out of [npc2.namePos] [npc2.pussy+], putting an end to [npc.her] fingering.",
      ],
    },
    receive: {
      start: {
        name: "Get fingered",
        tip: "Get [npc2.name] to start fingering your [npc.pussy+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "With a firm grip on [npc2.her] [npc2.hand], [npc.name] eagerly [npc.verb(guide)] [npc2.namePos] [npc2.fingers] over [npc.her] [npc.labia+], letting out [npc.a_moan+] before greedily pushing [npc2.her] digits into [npc.her] [npc.pussy+].",
          "Taking hold of [npc2.namePos] [npc2.hand], [npc.name] eagerly [npc.verb(guide)] [npc2.her] [npc2.fingers] down between [npc.her] [npc.legs+], and with a determined pressure, [npc.name] greedily [npc.verb(push)] [npc2.her] digits into [npc.her] [npc.pussy+].",
        ],
      },
      ongoing: {
        name: "Fingered",
        tip: "Enjoy [npc2.namePos] [npc2.fingers+] in your [npc.pussy+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pushing [npc.her] [npc.hips] out against [npc2.namePos] [npc2.hand], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] energetically [npc.verb(help)] to sink [npc2.namePos] [npc2.fingers+] deep into [npc.her] [npc.pussy+].",
        ],
      },
      stop: {
        name: "Stop getting fingered",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.fingers] out of your [npc.pussy+].",
        lines: [
          "Sliding [npc2.namePos] [npc2.fingers] out of [npc.her] [npc.pussy+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to the fingering.",
        ],
      },
    },
  });

  registerPair({
    id: "finger_penis",
    label: "handjob",
    ok: function (giver, receiver) {
      return hasPenis(receiver) && LT.isSexExposed(receiver, "PENIS");
    },
    start: {
      name: "Start handjob",
      tip: "Reach down and start stroking [npc2.namePos] [npc2.cock+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Reaching down between [npc2.namePos] [npc2.legs], [npc.name] eagerly [npc.verb(wrap)] [npc.her] [npc.fingers] around [npc2.her] [npc2.cock+], letting out [npc.a_moan+] as [npc.she] [npc.verb(start)] rapidly stroking up and down its length.",
        "[npc.Name] [npc.verb(drop)] one of [npc.her] [npc.hands] down between [npc2.namePos] [npc2.legs], and, taking hold of [npc2.her] [npc2.cock+], [npc.she] [npc.verb(start)] eagerly jerking [npc2.herHim] off.",
        "Teasing [npc.her] [npc.fingers] over [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] rapidly stroking up and down its throbbing length.",
      ],
    },
    ongoing: {
      name: "Handjob",
      tip: "Continue giving [npc2.name] a handjob.",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly wrapping [npc.her] [npc.fingers+] around [npc2.namePos] [npc2.cock+], [npc.name] rapidly [npc.verb(start)] to slide [npc.her] [npc.hand] up and down [npc2.her] shaft.",
        "Happily pressing [npc.herself] against [npc2.name], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] rapidly [npc.verb(slide)] [npc.her] [npc.hand+] up and down the length of [npc2.namePos] [npc2.cock+].",
      ],
    },
    stop: {
      name: "Stop handjob",
      tip: "Let go of [npc2.namePos] [npc2.cock+] and stop giving [npc2.herHim] a handjob.",
      lines: [
        "Taking [npc.her] [npc.hand] away from [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(give)] [npc2.her] [npc2.cockHead] one last stroke as [npc.she] stops giving [npc2.herHim] a handjob.",
        "[npc.Name] sharply [npc.verb(inhale)], breathing in [npc2.namePos] [npc2.scent+] before taking [npc.her] [npc.fingers] away from [npc2.her] [npc2.cock+].",
      ],
    },
    receive: {
      start: {
        name: "Get handjob",
        tip: "Get [npc2.name] to start giving you a handjob.",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "With a firm grip on [npc2.her] [npc2.hand], [npc.name] eagerly [npc.verb(guide)] [npc2.namePos] [npc2.fingers] around [npc.her] [npc.cock+], letting out [npc.a_moan+] before greedily making [npc2.herHim] start giving [npc.herHim] a handjob.",
          "Taking hold of [npc2.namePos] [npc2.hand], [npc.name] eagerly [npc.verb(guide)] [npc2.her] [npc2.fingers] around [npc.her] [npc.cock+], and with a determined pressure, [npc.she] greedily [npc.verb(make)] [npc2.herHim] start giving [npc.herHim] a handjob.",
        ],
      },
      ongoing: {
        name: "Receive handjob",
        tip: "Enjoy [npc2.namePos] handjob.",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pushing [npc.her] [npc.hips] out against [npc2.namePos] [npc2.hand], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc2.name] [npc2.verb(continue)] giving [npc.herHim] a handjob.",
          "With [npc.a_moan+], [npc.name] enthusiastically [npc.verb(start)] thrusting [npc.her] [npc.hips] out against [npc2.namePos] [npc2.hand], enjoying the handjob that [npc.sheIs] receiving.",
        ],
      },
      stop: {
        name: "Stop receiving handjob",
        tip: "Get [npc2.name] to take [npc2.her] [npc2.hand] off your [npc.cock].",
        lines: [
          "Taking [npc2.namePos] [npc2.hand] away from [npc.her] [npc.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(stop)] receiving a handjob.",
        ],
      },
    },
  });

  registerPair({
    id: "cunnilingus",
    label: "cunnilingus",
    ok: function (giver, receiver) {
      return hasVagina(receiver) && LT.isSexExposed(receiver, "VAGINA");
    },
    start: {
      name: "Start cunnilingus",
      tip: "Slide your [npc.tongue] into [npc2.namePos] [npc2.pussy+] and start performing cunnilingus.",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly pressing [npc.her] [npc.lips+] against [npc2.namePos] [npc2.pussy], [npc.name] [npc.verb(plant)] a series of passionate kisses on [npc2.her] [npc2.labia+], before desperately sliding [npc.her] [npc.tongue+] into [npc2.her] [npc2.pussy+].",
        "Planting a series of passionate kisses on [npc2.namePos] [npc2.labia+], [npc.name] [npc.verb(give)] [npc2.her] [npc2.pussy+] a hungry lick, before greedily pushing [npc.her] [npc.tongue+] deep inside.",
      ],
    },
    ongoing: {
      name: "Cunnilingus",
      tip: "Continue thrusting your [npc.tongue] into [npc2.namePos] [npc2.pussy+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly driving [npc.her] [npc.tongue+] as deep as possible into [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(press)] [npc.her] [npc.lips+] up against [npc2.her] [npc2.labia+] and [npc.verb(let)] out a muffled [npc.moan].",
        "Withdrawing [npc.her] [npc.tongue+] from [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(start)] to eagerly kiss and lick [npc2.namePos] [npc2.labia+], before pressing forwards and greedily sliding [npc.her] [npc.tongue] into [npc2.her] [npc2.pussy+] once more.",
        "Drawing [npc.her] [npc.tongue+] out from [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(start)] happily kissing and nuzzling against [npc2.namePos] [npc2.labia+], before leaning forwards and enthusiastically thrusting [npc.her] [npc.tongue] deep into [npc2.her] [npc2.pussy+].",
      ],
    },
    stop: {
      name: "Stop cunnilingus",
      tip: "Pull your [npc.tongue] out of [npc2.namePos] [npc2.pussy+] and stop performing cunnilingus.",
      lines: [
        "With one last lick, [npc.name] [npc.verb(pull)] [npc.her] [npc.face] away from [npc2.namePos] [npc2.pussy+].",
        "Giving [npc2.namePos] [npc2.labia+] a final, wet kiss, [npc.name] [npc.verb(pull)] [npc.her] [npc.face] away from [npc2.her] [npc2.pussy+].",
      ],
    },
    receive: {
      start: {
        name: "Receive cunnilingus",
        tip: "Get [npc2.name] to start licking [npc.namePos] [npc.pussy+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pressing [npc.her] [npc.labia+] down against [npc2.namePos] [npc2.face], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] frantically grinding [npc.her] [npc.pussy+] down on [npc2.her] [npc2.lips+].",
          "Shifting [npc.her] [npc.hips] so that [npc2.namePos] [npc2.face] is forced into [npc.her] [npc.labia+], [npc.Name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] eagerly pressing [npc.her] [npc.pussy+] down against [npc2.her] [npc2.lips+].",
        ],
      },
      ongoing: {
        name: "Receive cunnilingus",
        tip: "Eagerly press your [npc.labia+] down over [npc2.namePos] face in order to drive [npc2.her] [npc2.tongue+] into your [npc.pussy+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pressing [npc.her] [npc.labia+] down over [npc2.namePos] [npc2.face+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] firmly [npc.verb(plant)] [npc.her] [npc.pussy+] down over [npc2.her] [npc2.lips+].",
        ],
      },
      stop: {
        name: "Stop receiving cunnilingus",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.tongue+] out of your [npc.pussy+].",
        lines: [
          "Pulling [npc.her] [npc.pussy+] away from [npc2.namePos] [npc2.face], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to the cunnilingus.",
        ],
      },
    },
  });

  registerPair({
    id: "blowjob",
    label: "blowjob",
    ok: function (giver, receiver) {
      return hasPenis(receiver) && LT.isSexExposed(receiver, "PENIS") && LT.isSexExposed(giver, "MOUTH");
    },
    start: {
      name: "Perform blowjob",
      tip: "Take [npc2.namePos] [npc2.cock+] into your mouth and start giving [npc2.herHim] a blowjob.",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "[npc.NamePos] hot breath falls down onto [npc2.namePos] groin as [npc.she] eagerly [npc.verb(drop)] [npc.her] head down between [npc2.her] [npc2.legs], passionately kissing the [npc2.cockHead+] of [npc2.her] [npc2.cock+] before greedily taking [npc2.herHim] into [npc.her] mouth.",
        "Eagerly dropping [npc.her] head down between [npc2.namePos] [npc2.legs], [npc.name] [npc.verb(deliver)] a long, wet lick up the length of [npc2.her] [npc2.cock+], before greedily taking the [npc2.cockHead+] into [npc.her] mouth.",
      ],
    },
    ongoing: {
      name: "Perform blowjob",
      tip: "Eagerly suck [npc2.namePos] [npc2.cock+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly wrapping [npc.her] [npc.lips+] around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(start)] rapidly bobbing [npc.her] head up and down as [npc.she] [npc.verb(give)] [npc2.herHim] an enthusiastic blowjob.",
      ],
    },
    stop: {
      name: "Stop blowjob",
      tip: "Take [npc2.namePos] [npc2.cock+] out of your mouth and stop giving [npc2.herHim] a blowjob.",
      lines: [
        "Sliding [npc2.namePos] [npc2.cock+] out of [npc.her] mouth, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to the blowjob.",
        "With [npc.a_moan+], [npc.name] [npc.verb(pull)] [npc.her] head back, sliding [npc2.namePos] [npc2.cock+] fully out of [npc.her] mouth.",
      ],
    },
    receive: {
      start: {
        name: "Receive blowjob",
        tip: "Slide your [npc.cock+] into [npc2.namePos] mouth and get [npc2.herHim] to give you a blowjob.",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Reaching down to grab [npc2.namePos] head, [npc.name] [npc.verb(line)] the [npc.cockHead+] of [npc.her] [npc.cock] up to [npc2.her] [npc2.lips+], before eagerly pushing [npc.her] [npc.hips] forwards and sliding [npc.her] [npc.cock+] into [npc2.her] mouth.",
          "Reaching down to take hold of [npc2.namePos] head, [npc.name] [npc.verb(push)] the [npc.cockHead+] of [npc.her] [npc.cock] against [npc2.namePos] [npc2.lips+], before eagerly bucking [npc.her] [npc.hips] into [npc2.her] [npc2.face] and sliding [npc.her] [npc.cock+] into [npc2.her] mouth.",
        ],
      },
      ongoing: {
        name: "Receive blowjob",
        tip: "Push your [npc.cock+] into [npc2.namePos] face to encourage [npc2.herHim] to continue giving you a blowjob.",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "[npc.Name] eagerly [npc.verb(thrust)] [npc.her] [npc.cock+] past [npc2.namePos] [npc2.lips+], letting out [npc.a_moan+] as [npc.she] greedily [npc.verb(pump)] [npc.her] [npc.hips] into [npc2.her] [npc2.face].",
          "[npc.Name] desperately [npc.verb(buck)] [npc.her] [npc.hips] into [npc2.namePos] [npc2.face], letting out [npc.a_moan+] as [npc.she] eagerly [npc.verb(fuck)] [npc2.her] throat.",
          "Enthusiastically bucking [npc.her] [npc.hips+] into [npc2.namePos] [npc2.face], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(continue)] happily receiving [npc.her] blowjob.",
        ],
      },
      stop: {
        name: "Stop receiving blowjob",
        tip: "Pull your [npc.cock+] out of [npc2.namePos] mouth and stop receiving a blowjob from [npc2.herHim].",
        lines: [
          "Sliding [npc.her] [npc.cock+] out of [npc2.namePos] mouth, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] puts an end to the blowjob.",
          "With [npc.a_moan+], [npc.name] [npc.verb(pull)] [npc.her] [npc.hips] back, sliding [npc.her] [npc.cock+] fully out of [npc2.namePos] mouth.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_vagina",
    label: "fucking",
    ok: function (giver, receiver) {
      return hasPenis(giver) && LT.isSexExposed(giver, "PENIS") && hasVagina(receiver) && LT.isSexExposed(receiver, "VAGINA");
    },
    onStart: function (src, tgt) {
      return takeVirgin(src, tgt);
    },
    onReceiveStart: function (src, tgt) {
      return takeVirgin(tgt, src);
    },
    start: {
      name: "Fuck [npc2.herHim]",
      tip: "Sink your [npc.cock+] into [npc2.namePos] [npc2.pussy+] and start fucking [npc2.herHim].",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Eagerly teasing the [npc.cockTip+] of [npc.her] [npc.cock] between [npc2.namePos] [npc2.labia+], [npc.name] [npc.verb(let)] out [npc.a_moan+] before thrusting forwards, greedily sinking [npc.her] [npc.cock+] into [npc2.her] [npc2.pussy+].",
        "[npc.Name] [npc.verb(position)] the [npc.cockTip+] of [npc.her] [npc.cock] between [npc2.namePos] [npc2.labia+], and with a determined thrust, [npc.she] eagerly [npc.verb(sink)] it deep into [npc2.her] [npc2.pussy+].",
      ],
    },
    ongoing: {
      name: "Fuck [npc2.herHim]",
      tip: "Continue thrusting your [npc.cock+] in and out of [npc2.namePos] [npc2.pussy+].",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Eagerly sinking [npc.her] [npc.cock+] deep into [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(start)] enthusiastically rocking [npc.her] [npc.hips] back and forth, letting out [npc.a_moan+] with every thrust as [npc.she] happily [npc.verb(fuck)] [npc2.name].",
        "Enthusiastically pushing [npc.her] [npc.cock+] deep into [npc2.namePos] [npc2.pussy+], [npc.name] frantically [npc.verb(thrust)] [npc.her] [npc.hips] forwards, letting out [npc.a_moan+] as [npc.she] greedily [npc.verb(fuck)] [npc2.herHim].",
        "Thrusting [npc.her] [npc.cock+] deep into [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] to eagerly pump [npc.her] [npc.hips] back and forth, breathing in [npc2.namePos] [npc2.scent] as [npc.she] desperately [npc.verb(fuck)] [npc2.herHim].",
      ],
    },
    stop: {
      name: "Stop fucking",
      tip: "Pull your [npc.cock+] out of [npc2.namePos] [npc2.pussy+] and stop fucking [npc2.herHim].",
      lines: [
        "Sliding [npc.her] [npc.cock] out of [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(rub)] the [npc.cockTip] up and down over [npc2.her] [npc2.labia+] one last time before pulling back.",
        "Pushing deep inside of [npc2.name] one last time, [npc.name] then [npc.verb(slide)] [npc.her] [npc.cock+] back out of [npc2.her] [npc2.pussy+], putting an end to the fucking.",
      ],
    },
    receive: {
      start: {
        name: "Get fucked",
        tip: "Slide [npc2.namePos] [npc2.cock+] into your [npc.pussy+] and get fucked.",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "Grabbing [npc2.namePos] [npc2.cock], [npc.name] eagerly [npc.verb(guide)] it up to [npc.her] [npc.labia+], letting out [npc.a_moan+] before desperately bucking [npc.her] [npc.hips] and forcing [npc2.herHim] to penetrate [npc.her] [npc.pussy+].",
          "Grabbing [npc2.namePos] [npc2.cock], [npc.name] [npc.verb(line)] it up to [npc.her] [npc.pussy+], before eagerly thrusting [npc.her] [npc.hips] back and letting out [npc.a_moan+] as [npc.she] [npc.verb(penetrate)] [npc.herself] on [npc2.her] [npc2.cock+].",
        ],
      },
      ongoing: {
        name: "Fucked",
        tip: "Eagerly fuck your [npc.pussy+] on [npc2.namePos] [npc2.cock+].",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "With an eager bucking of [npc.her] [npc.hips], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(help)] to sink [npc2.namePos] [npc2.cock+] deep into [npc.her] [npc.pussy+].",
          "With [npc.a_moan+], [npc.name] enthusiastically [npc.verb(start)] bucking [npc.her] [npc.hips], forcing [npc2.namePos] [npc2.cock+] ever deeper into [npc.her] [npc.pussy+].",
          "Energetically gyrating [npc.her] [npc.hips], [npc.a_moan+] bursts out from between [npc.namePos] [npc.lips+] as [npc.her] movements force [npc2.namePos] [npc2.cock+] deep into [npc.her] [npc.pussy+].",
        ],
      },
      stop: {
        name: "Stop being fucked",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.cock] out of your [npc.pussy+].",
        lines: [
          "Getting [npc2.name] to pull [npc2.her] [npc2.cock+] out of [npc.her] [npc.pussy+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to being fucked.",
        ],
      },
    },
  });

  registerPair({
    id: "finger_anus",
    label: "anal fingering",
    ok: function (giver, receiver) {
      return LT.isSexExposed(receiver, "ANUS");
    },
    start: {
      name: "Finger [npc2.her] ass",
      tip: "Sink [npc.namePos] [npc.fingers] into [npc2.namePos] [npc2.asshole+] and start fingering [npc2.herHim].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly teasing [npc.her] [npc.fingers+] over [npc2.namePos] [npc2.assCloaca], [npc.name] [npc.verb(let)] out [npc.a_moan+] before greedily sinking [npc.her] digits into [npc2.her] [npc2.asshole+].",
        "[npc.Name] eagerly [npc.verb(press)] [npc.her] [npc.fingers+] down between [npc2.namePos] ass cheeks, and with a determined thrust, [npc.she] greedily [npc.verb(sink)] [npc.her] digits into [npc2.her] [npc2.asshole+].",
      ],
    },
    ongoing: {
      name: "Anal fingering",
      tip: "Continue fingering [npc2.namePos] [npc2.asshole+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly sinking [npc.her] [npc.fingers+] into [npc2.namePos] [npc2.asshole+], [npc.name] [npc.verb(curl)] [npc.her] digits up, enthusiastically stroking [npc2.her] inner walls as [npc.she] hungrily [npc.verb(finger)] [npc2.her] [npc2.ass].",
        "Firmly pushing [npc.her] [npc.fingers+] into [npc2.namePos] [npc2.asshole+], [npc.name] rapidly [npc.verb(pump)] them in and out, letting out [npc.a_moan+] as [npc.she] eagerly [npc.verb(finger)] [npc2.her] [npc2.ass].",
        "Eagerly pressing [npc.her] [npc.hand] down against [npc2.namePos] [npc2.ass], [npc.name] [npc.verb(let)] out [npc.a_moan+] before enthusiastically sliding [npc.her] [npc.fingers+] deep into [npc2.her] [npc2.asshole+].",
      ],
    },
    stop: {
      name: "Stop anal fingering",
      tip: "Pull your [npc.fingers] out of [npc2.namePos] [npc2.asshole+] and stop fingering [npc2.herHim].",
      lines: [
        "Sliding [npc.her] [npc.fingers] out of [npc2.namePos] [npc2.asshole+], [npc.name] quickly takes [npc.her] [npc.hand] away from [npc2.namePos] [npc2.assCloaca].",
        "Pushing deep inside of [npc2.name] one last time, [npc.name] then [npc.verb(slide)] [npc.her] [npc.fingers] back out of [npc2.namePos] [npc2.asshole+], putting an end to [npc.her] fingering.",
      ],
    },
    receive: {
      start: {
        name: "Get anally fingered",
        tip: "Get [npc2.name] to start fingering your [npc.assCloaca+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "With a firm grip on [npc2.her] [npc2.hand], [npc.name] eagerly [npc.verb(guide)] [npc2.namePos] [npc2.fingers] over [npc.her] [npc.assCloaca], letting out [npc.a_moan+] before greedily pushing [npc2.her] digits into [npc.her] [npc.asshole+].",
          "Taking hold of [npc2.namePos] [npc2.hand], [npc.name] eagerly [npc.verb(guide)] [npc2.her] [npc2.fingers] between [npc.her] ass cheeks, and with a determined pressure, [npc.she] greedily [npc.verb(push)] [npc2.her] digits into [npc.her] [npc.asshole+].",
        ],
      },
      ongoing: {
        name: "Anally fingered",
        tip: "Enjoy [npc2.namePos] [npc2.fingers+] in your [npc.asshole+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pushing [npc.her] [npc.ass] back against [npc2.namePos] [npc2.hand], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc2.she] [npc2.verb(continue)] fingering [npc.her] [npc.asshole+].",
        ],
      },
      stop: {
        name: "Stop getting anally fingered",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.fingers] out of your [npc.asshole+].",
        lines: [
          "Sliding [npc2.namePos] [npc2.fingers] out of [npc.her] [npc.asshole+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to the anal fingering.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_anus",
    label: "anal",
    ok: function (giver, receiver) {
      return hasPenis(giver) && LT.isSexExposed(giver, "PENIS") && LT.isSexExposed(receiver, "ANUS");
    },
    start: {
      name: "Start anal",
      tip: "Sink your [npc.cock+] into [npc2.namePos] [npc2.asshole+] and start fucking [npc2.herHim].",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Eagerly teasing the [npc.cockTip+] of [npc.her] [npc.cock] over [npc2.namePos] [npc2.assCloaca+], [npc.name] [npc.verb(let)] out [npc.a_moan+] before thrusting forwards, greedily sinking [npc.her] [npc.cock+] into [npc2.her] [npc2.asshole+].",
        "[npc.Name] [npc.verb(position)] the [npc.cockTip+] of [npc.her] [npc.cock] between [npc2.namePos] ass cheeks, and with a determined thrust, [npc.she] eagerly [npc.verb(sink)] it deep into [npc2.her] [npc2.asshole+].",
      ],
    },
    ongoing: {
      name: "Anal",
      tip: "Continue thrusting your [npc.cock+] in and out of [npc2.namePos] [npc2.asshole+].",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Eagerly sinking [npc.her] [npc.cock+] deep into [npc2.namePos] [npc2.asshole+], [npc.name] [npc.verb(start)] enthusiastically rocking [npc.her] [npc.hips] back and forth, letting out [npc.a_moan+] with every thrust as [npc.she] happily [npc.verb(fuck)] [npc2.name].",
        "Enthusiastically pushing [npc.her] [npc.cock+] deep into [npc2.namePos] [npc2.asshole+], [npc.name] frantically [npc.verb(thrust)] [npc.her] [npc.hips] forwards, letting out [npc.a_moan+] as [npc.she] greedily [npc.verb(fuck)] [npc2.herHim].",
        "Thrusting [npc.her] [npc.cock+] deep into [npc2.namePos] [npc2.asshole+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] to eagerly pump [npc.her] [npc.hips] back and forth, breathing in [npc2.namePos] [npc2.scent] as [npc.she] desperately [npc.verb(fuck)] [npc2.herHim].",
      ],
    },
    stop: {
      name: "Stop anal",
      tip: "Pull your [npc.cock+] out of [npc2.namePos] [npc2.asshole+] and stop fucking [npc2.herHim].",
      lines: [
        "Sliding [npc.her] [npc.cock] out of [npc2.namePos] [npc2.asshole+], [npc.name] [npc.verb(rub)] the [npc.cockTip] up and down over [npc2.her] [npc2.assCloaca+] one last time before pulling back.",
        "Pushing deep inside of [npc2.name] one last time, [npc.name] then [npc.verb(slide)] [npc.her] [npc.cock+] back out of [npc2.her] [npc2.asshole+], putting an end to the anal sex.",
      ],
    },
    receive: {
      start: {
        name: "Receive anal",
        tip: "Slide [npc2.namePos] [npc2.cock+] into your [npc.asshole+] and get fucked.",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "Grabbing [npc2.namePos] [npc2.cock], [npc.name] eagerly [npc.verb(guide)] it up between [npc.her] ass cheeks, letting out [npc.a_moan+] before desperately bucking [npc.her] [npc.hips] and forcing [npc2.herHim] to penetrate [npc.her] [npc.asshole+].",
          "Grabbing [npc2.namePos] [npc2.cock], [npc.name] [npc.verb(line)] it up to [npc.her] [npc.asshole+], before eagerly thrusting [npc.her] [npc.hips] back and letting out [npc.a_moan+] as [npc.she] [npc.verb(penetrate)] [npc.herself] on [npc2.her] [npc2.cock+].",
        ],
      },
      ongoing: {
        name: "Receiving anal",
        tip: "Eagerly fuck your [npc.asshole+] on [npc2.namePos] [npc2.cock+].",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "With an eager bucking of [npc.her] [npc.hips], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(help)] to sink [npc2.namePos] [npc2.cock+] deep into [npc.her] [npc.asshole+].",
          "With [npc.a_moan+], [npc.name] enthusiastically [npc.verb(start)] bucking [npc.her] [npc.hips], forcing [npc2.namePos] [npc2.cock+] ever deeper into [npc.her] [npc.asshole+].",
        ],
      },
      stop: {
        name: "Stop receiving anal",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.cock] out of your [npc.asshole+].",
        lines: [
          "Getting [npc2.name] to pull [npc2.her] [npc2.cock+] out of [npc.her] [npc.asshole+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to receiving anal.",
        ],
      },
    },
  });

  registerPair({
    id: "anilingus",
    label: "anilingus",
    ok: function (giver, receiver) {
      return LT.isSexExposed(receiver, "ANUS");
    },
    start: {
      name: "Start anilingus",
      tip: "Slide your [npc.tongue] into [npc2.namePos] [npc2.asshole+] and start performing anilingus.",
      selfA: "THREE_NORMAL",
      tgtA: "TWO_LOW",
      lines: [
        "Eagerly pressing [npc.her] [npc.lips+] against [npc2.namePos] [npc2.assCloaca+], [npc.name] [npc.verb(plant)] a series of passionate kisses on [npc2.her] cheeks, before desperately sliding [npc.her] [npc.tongue+] into [npc2.her] [npc2.asshole+].",
        "Planting a series of passionate kisses on [npc2.namePos] [npc2.assCloaca+], [npc.name] [npc.verb(give)] [npc2.her] [npc2.asshole+] a hungry lick, before greedily pushing [npc.her] [npc.tongue+] deep inside.",
      ],
    },
    ongoing: {
      name: "Anilingus",
      tip: "Continue thrusting your [npc.tongue] into [npc2.namePos] [npc2.asshole+].",
      selfA: "THREE_NORMAL",
      tgtA: "TWO_LOW",
      lines: [
        "Eagerly driving [npc.her] [npc.tongue+] as deep as possible into [npc2.namePos] [npc2.assCloaca+], [npc.name] [npc.verb(press)] [npc.her] [npc.lips+] up against [npc2.her] [npc2.asshole+] and [npc.verb(let)] out a muffled [npc.moan].",
        "Withdrawing [npc.her] [npc.tongue+] from [npc2.namePos] [npc2.asshole+], [npc.name] [npc.verb(start)] to eagerly kiss and lick [npc2.namePos] [npc2.assCloaca+], before pressing forwards and greedily sliding [npc.her] [npc.tongue] into [npc2.her] [npc2.asshole+] once more.",
      ],
    },
    stop: {
      name: "Stop anilingus",
      tip: "Pull your [npc.tongue] out of [npc2.namePos] [npc2.asshole+] and stop performing anilingus.",
      lines: [
        "With one last lick, [npc.name] [npc.verb(pull)] [npc.her] [npc.face] away from [npc2.namePos] [npc2.asshole+].",
        "Giving [npc2.namePos] [npc2.assCloaca+] a final, wet kiss, [npc.name] [npc.verb(pull)] [npc.her] [npc.face] away from [npc2.her] [npc2.asshole+].",
      ],
    },
    receive: {
      start: {
        name: "Receive anilingus",
        tip: "Get [npc2.name] to start licking your [npc.asshole+].",
        selfA: "TWO_LOW",
        tgtA: "THREE_NORMAL",
        lines: [
          "Eagerly pressing [npc.her] [npc.assCloaca+] down against [npc2.namePos] [npc2.face], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] frantically grinding [npc.her] [npc.asshole+] down on [npc2.her] [npc2.lips+].",
          "Shifting [npc.her] [npc.hips] so that [npc2.namePos] [npc2.face] is forced into [npc.her] [npc.assCloaca+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] eagerly pressing [npc.her] [npc.asshole+] down against [npc2.her] [npc2.lips+].",
        ],
      },
      ongoing: {
        name: "Receive anilingus",
        tip: "Eagerly press your [npc.asshole+] down over [npc2.namePos] face.",
        selfA: "TWO_LOW",
        tgtA: "THREE_NORMAL",
        lines: [
          "Eagerly pressing [npc.her] [npc.asshole+] down over [npc2.namePos] [npc2.face+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] firmly [npc.verb(plant)] [npc.her] [npc.assCloaca+] down over [npc2.her] [npc2.lips+].",
        ],
      },
      stop: {
        name: "Stop receiving anilingus",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.tongue+] out of your [npc.asshole+].",
        lines: [
          "Pulling [npc.her] [npc.asshole+] away from [npc2.namePos] [npc2.face], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(put)] an end to the anilingus.",
        ],
      },
    },
  });

  registerPair({
    id: "suckle",
    label: "nipple kiss",
    ok: function (giver, receiver) {
      return hasBreasts(receiver) && LT.isSexExposed(receiver, "BREASTS");
    },
    start: {
      name: "Kiss nipples",
      tip: "Press your [npc.lips] up to [npc2.namePos] [npc2.breast+] and start sucking on [npc2.her] [npc2.nipple+].",
      selfA: "TWO_LOW",
      tgtA: "TWO_LOW",
      lines: [
        "Leaning in to [npc2.namePos] [npc2.breasts+], [npc.name] [npc.verb(press)] [npc.her] [npc.lips+] against one of [npc2.her] [npc2.nipples+] and [npc.verb(start)] eagerly kissing and sucking.",
        "[npc.Name] [npc.verb(wrap)] [npc.her] [npc.lips+] around [npc2.namePos] [npc2.nipple+], letting out [npc.a_moan+] as [npc.she] [npc.verb(start)] suckling.",
      ],
    },
    ongoing: {
      name: "Nipple kiss",
      tip: "Continue kissing and sucking [npc2.namePos] [npc2.nipple+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly wrapping [npc.her] [npc.lips+] around [npc2.namePos] [npc2.nipple+], [npc.name] [npc.verb(let)] out a muffled [npc.moan] as [npc.she] [npc.verb(continue)] kissing and sucking.",
        "[npc.Name] hungrily [npc.verb(kiss)] and [npc.verb(suck)] on [npc2.namePos] [npc2.nipple+], pressing [npc.her] face into [npc2.her] [npc2.breasts+].",
      ],
    },
    stop: {
      name: "Stop kissing nipples",
      tip: "Pull your [npc.lips] away from [npc2.namePos] [npc2.nipple+].",
      lines: [
        "With one last kiss, [npc.name] [npc.verb(pull)] back from [npc2.namePos] [npc2.nipple+].",
      ],
    },
    receive: {
      start: {
        name: "Get nipples sucked",
        tip: "Pull [npc2.namePos] face into your [npc.breasts] and get [npc2.herHim] to start kissing and sucking your nipples.",
        selfA: "TWO_LOW",
        tgtA: "TWO_LOW",
        lines: [
          "Pulling [npc2.namePos] face into [npc.her] [npc.breasts+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(press)] one of [npc.her] [npc.nipples+] against [npc2.her] [npc2.lips+].",
        ],
      },
      ongoing: {
        name: "Get nipples sucked",
        tip: "Keep [npc2.namePos] face pressed into your [npc.breasts].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pressing [npc.her] [npc.breasts+] into [npc2.namePos] [npc2.face], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc2.she] [npc2.verb(continue)] sucking [npc.her] [npc.nipple+].",
        ],
      },
      stop: {
        name: "Stop getting nipples sucked",
        tip: "Pull [npc2.namePos] face away from your [npc.breasts].",
        lines: [
          "Pulling [npc2.namePos] face away from [npc.her] [npc.breasts+], [npc.name] [npc.verb(put)] an end to the nipple-kissing.",
        ],
      },
    },
  });

  registerPair({
    id: "finger_nipple",
    label: "nipple fingering",
    ok: function (giver, receiver) {
      return hasFuckableNipples(receiver) && hasBreasts(receiver) && LT.isSexExposed(receiver, "BREASTS");
    },
    start: {
      name: "Nipple fingering",
      tip: "Sink your [npc.fingers] into one of [npc2.namePos] fuckable [npc2.nipples] and start fingering [npc2.her] breasts.",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Teasing [npc.her] [npc.fingers] over [npc2.namePos] [npc2.breasts+], [npc2.name] [npc2.verb(let)] out a gasp as [npc.name] [npc.verb(circle)] around one of [npc2.her] [npc2.nipples+], before eagerly pushing [npc.her] digits into [npc2.her] inviting orifice.",
        "[npc.Name] [npc.verb(press)] [npc.her] [npc.fingers] against one of [npc2.namePos] [npc2.nipples+], and with a steady pressure, [npc.she] greedily [npc.verb(sink)] [npc.her] digits into the flesh of [npc2.namePos] breast.",
      ],
    },
    ongoing: {
      name: "Finger nipple",
      tip: "Continue fingering [npc2.namePos] [npc2.nipple+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Sinking [npc.her] [npc.fingers+] deep into [npc2.namePos] [npc2.nipple+], [npc.name] [npc.verb(start)] eagerly fingering [npc2.her] [npc2.breasts], letting out [npc.a_moan+] as [npc.she] [npc.verb(press)] [npc.herself] up against [npc2.herHim].",
        "Pressing [npc.herself] against [npc2.name], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] eagerly pumping [npc.her] [npc.fingers+] in and out of [npc2.namePos] [npc2.nipple+].",
      ],
    },
    stop: {
      name: "Stop nipple fingering",
      tip: "Pull your [npc.fingers] out of [npc2.namePos] [npc2.nipple+].",
      lines: [
        "Sliding [npc.her] [npc.fingers] out of [npc2.namePos] [npc2.nipple+], [npc.name] [npc.verb(take)] [npc.her] [npc.hand] away from [npc2.her] [npc2.breasts+].",
      ],
    },
    receive: {
      start: {
        name: "Get nipple fingered",
        tip: "Get [npc2.name] to start fingering your [npc.nipple+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Guiding [npc2.namePos] [npc2.fingers] to [npc.her] [npc.nipple+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(push)] [npc2.her] digits into the inviting orifice.",
        ],
      },
      ongoing: {
        name: "Nipple fingered",
        tip: "Enjoy [npc2.namePos] [npc2.fingers+] in your [npc.nipple+].",
        selfA: "THREE_NORMAL",
        tgtA: "TWO_LOW",
        lines: [
          "Eagerly pressing [npc.her] [npc.breasts+] into [npc2.namePos] [npc2.hand], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc2.she] [npc2.verb(continue)] fingering [npc.her] [npc.nipple+].",
        ],
      },
      stop: {
        name: "Stop getting nipple fingered",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.fingers] out of your [npc.nipple+].",
        lines: [
          "Pulling [npc2.namePos] [npc2.fingers] out of [npc.her] [npc.nipple+], [npc.name] [npc.verb(put)] an end to the nipple fingering.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_nipple",
    label: "nipple-fucking",
    ok: function (giver, receiver) {
      return hasPenis(giver) && LT.isSexExposed(giver, "PENIS") && hasFuckableNipples(receiver) && hasBreasts(receiver) && LT.isSexExposed(receiver, "BREASTS");
    },
    start: {
      name: "Fuck [npc2.her] nipple",
      tip: "Sink your [npc.cock+] into [npc2.namePos] fuckable [npc2.nipple+].",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Lining the [npc.cockTip+] of [npc.her] [npc.cock] up to [npc2.namePos] [npc2.nipple+], [npc.name] [npc.verb(let)] out [npc.a_moan+] before thrusting forwards and sinking [npc.her] [npc.cock+] into the inviting orifice.",
      ],
    },
    ongoing: {
      name: "Nipple-fuck",
      tip: "Continue thrusting your [npc.cock+] in and out of [npc2.namePos] [npc2.nipple+].",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Eagerly thrusting [npc.her] [npc.cock+] in and out of [npc2.namePos] [npc2.nipple+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(fuck)] [npc2.her] [npc2.breast].",
      ],
    },
    stop: {
      name: "Stop nipple-fucking",
      tip: "Pull your [npc.cock+] out of [npc2.namePos] [npc2.nipple+].",
      lines: [
        "Sliding [npc.her] [npc.cock+] out of [npc2.namePos] [npc2.nipple+], [npc.name] [npc.verb(put)] an end to the nipple-fucking.",
      ],
    },
    receive: {
      start: {
        name: "Get nipple fucked",
        tip: "Slide [npc2.namePos] [npc2.cock+] into your [npc.nipple+].",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "Guiding [npc2.namePos] [npc2.cock+] to [npc.her] [npc.nipple+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(push)] back and [npc.verb(take)] [npc2.herHim] inside.",
        ],
      },
      ongoing: {
        name: "Nipple fucked",
        tip: "Keep [npc2.namePos] [npc2.cock+] pumping in and out of your [npc.nipple+].",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "Eagerly pressing [npc.her] [npc.breast+] onto [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc2.she] [npc2.verb(continue)] fucking [npc.her] [npc.nipple+].",
        ],
      },
      stop: {
        name: "Stop getting nipple fucked",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.cock] out of your [npc.nipple+].",
        lines: [
          "Getting [npc2.name] to pull out of [npc.her] [npc.nipple+], [npc.name] [npc.verb(put)] an end to being nipple-fucked.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_breasts",
    label: "paizuri",
    ok: function (giver, receiver) {
      return hasPenis(giver) && hasBreasts(receiver) && LT.isSexExposed(giver, "PENIS") && LT.isSexExposed(receiver, "BREASTS");
    },
    start: {
      name: "Start paizuri",
      tip: "Slide your [npc.cock+] between [npc2.namePos] [npc2.breasts+] and start fucking them.",
      selfA: "FOUR_HIGH",
      tgtA: "FOUR_HIGH",
      lines: [
        "Reaching down to greedily sink [npc.her] [npc.fingers] into [npc2.namePos] [npc2.breasts+], [npc.name] eagerly [npc.verb(push)] them together, lining [npc.her] [npc.cock] up to [npc2.her] cleavage before sliding forwards and starting to enthusiastically fuck [npc2.her] [npc2.breasts].",
      ],
    },
    ongoing: {
      name: "Paizuri",
      tip: "Continue fucking [npc2.namePos] [npc2.breasts+].",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly sinking [npc.her] [npc.cock+] between [npc2.namePos] [npc2.breasts+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(fuck)] [npc2.her] cleavage.",
      ],
    },
    stop: {
      name: "Stop paizuri",
      tip: "Pull your [npc.cock+] out from between [npc2.namePos] [npc2.breasts+].",
      lines: [
        "Sliding [npc.her] [npc.cock+] out from between [npc2.namePos] [npc2.breasts+], [npc.name] [npc.verb(put)] an end to the paizuri.",
      ],
    },
    receive: {
      start: {
        name: "Perform paizuri",
        tip: "Push your [npc.breasts+] together around [npc2.namePos] [npc2.cock+] and start giving [npc2.herHim] paizuri.",
        selfA: "FOUR_HIGH",
        tgtA: "FOUR_HIGH",
        lines: [
          "Pushing [npc.her] [npc.breasts+] together around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] giving [npc2.herHim] paizuri.",
        ],
      },
      ongoing: {
        name: "Giving paizuri",
        tip: "Keep sliding your [npc.breasts+] up and down around [npc2.namePos] [npc2.cock+].",
        selfA: "THREE_NORMAL",
        tgtA: "FOUR_HIGH",
        lines: [
          "Eagerly sliding [npc.her] [npc.breasts+] up and down around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+].",
        ],
      },
      stop: {
        name: "Stop giving paizuri",
        tip: "Pull your [npc.breasts+] away from [npc2.namePos] [npc2.cock+].",
        lines: [
          "Pulling [npc.her] [npc.breasts+] away from [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(put)] an end to the paizuri.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_thighs",
    label: "intercrural",
    ok: function (giver, receiver) {
      return hasPenis(giver) && LT.isSexExposed(giver, "PENIS");
    },
    start: {
      name: "Start intercrural",
      tip: "Slide your [npc.cock+] between [npc2.namePos] thighs and start fucking them.",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly pushing [npc2.namePos] [npc2.legs+] together, [npc.name] [npc.verb(press)] the [npc.cockHead+] of [npc.her] [npc.cock+] up against [npc2.namePos] thighs, before greedily pushing [npc.her] [npc.hips] forwards and starting to fuck the crevice that's formed.",
        "[npc.Name] [npc.verb(position)] the [npc.cockHead+] of [npc.her] [npc.cock] up against [npc2.namePos] [npc2.legs+], before eagerly pressing [npc2.her] thighs together and starting to fuck the crevice that's formed.",
      ],
    },
    ongoing: {
      name: "Intercrural",
      tip: "Continue fucking [npc2.namePos] thighs.",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly thrusting [npc.her] [npc.cock+] between [npc2.namePos] thighs, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(fuck)] the crevice that's formed.",
      ],
    },
    stop: {
      name: "Stop intercrural",
      tip: "Pull your [npc.cock+] out from between [npc2.namePos] thighs.",
      lines: [
        "Sliding [npc.her] [npc.cock+] out from between [npc2.namePos] thighs, [npc.name] [npc.verb(put)] an end to the intercrural sex.",
      ],
    },
    receive: {
      start: {
        name: "Receive intercrural",
        tip: "Push your thighs together around [npc2.namePos] [npc2.cock+].",
        selfA: "THREE_NORMAL",
        tgtA: "FOUR_HIGH",
        lines: [
          "Pushing [npc.her] [npc.legs+] together around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] letting [npc2.herHim] fuck [npc.her] thighs.",
        ],
      },
      ongoing: {
        name: "Thigh-fucked",
        tip: "Keep your thighs pressed around [npc2.namePos] [npc2.cock+].",
        selfA: "THREE_NORMAL",
        tgtA: "FOUR_HIGH",
        lines: [
          "Eagerly pressing [npc.her] thighs around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+].",
        ],
      },
      stop: {
        name: "Stop thigh-fucking",
        tip: "Pull your thighs away from [npc2.namePos] [npc2.cock+].",
        lines: [
          "Pulling [npc.her] thighs away from [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(put)] an end to the intercrural sex.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_ass",
    label: "hotdogging",
    ok: function (giver, receiver) {
      return hasPenis(giver) && LT.isSexExposed(giver, "PENIS") && LT.isSexExposed(receiver, "ANUS");
    },
    start: {
      name: "Start hotdogging",
      tip: "Slide the [npc.cockHead] of your [npc.cock] between [npc2.namePos] ass cheeks.",
      selfA: "THREE_NORMAL",
      tgtA: "TWO_LOW",
      lines: [
        "Greedily pushing [npc2.namePos] ass cheeks together, [npc.name] [npc.verb(start)] eagerly sliding the [npc.cockHead] of [npc.her] [npc.cock+] up and down between the cleft that's formed.",
        "Taking a firm hold of [npc2.namePos] [npc2.ass+], [npc.name] enthusiastically [npc.verb(push)] [npc2.her] cheeks together, before starting to tease [npc.her] [npc.cock+] between the cleft.",
      ],
    },
    ongoing: {
      name: "Hotdogging",
      tip: "Continue sliding your [npc.cock+] between [npc2.namePos] ass cheeks.",
      selfA: "THREE_NORMAL",
      tgtA: "TWO_LOW",
      lines: [
        "Eagerly sliding [npc.her] [npc.cock+] up and down between [npc2.namePos] ass cheeks, [npc.name] [npc.verb(let)] out [npc.a_moan+].",
      ],
    },
    stop: {
      name: "Stop hotdogging",
      tip: "Pull your [npc.cock+] out from between [npc2.namePos] ass cheeks.",
      lines: [
        "Pulling [npc.her] [npc.cock+] out from between [npc2.namePos] ass cheeks, [npc.name] [npc.verb(put)] an end to the hotdogging.",
      ],
    },
    receive: {
      start: {
        name: "Get hotdogged",
        tip: "Get [npc2.name] to slide [npc2.her] [npc2.cock+] between your ass cheeks.",
        selfA: "TWO_LOW",
        tgtA: "THREE_NORMAL",
        lines: [
          "Pushing [npc.her] ass cheeks back around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] getting hotdogged.",
        ],
      },
      ongoing: {
        name: "Hotdogged",
        tip: "Keep your ass cheeks pressed around [npc2.namePos] [npc2.cock+].",
        selfA: "TWO_LOW",
        tgtA: "THREE_NORMAL",
        lines: [
          "Eagerly pressing [npc.her] ass cheeks around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+].",
        ],
      },
      stop: {
        name: "Stop being hotdogged",
        tip: "Get [npc2.name] to pull [npc2.her] [npc2.cock+] out from between your ass cheeks.",
        lines: [
          "Pulling [npc.her] ass cheeks away from [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(put)] an end to being hotdogged.",
        ],
      },
    },
  });

  registerPair({
    id: "penis_feet",
    label: "footjob",
    ok: function (giver, receiver) {
      return hasPenis(giver) && LT.isSexExposed(giver, "PENIS") && LT.isSexExposed(receiver, "FOOT");
    },
    start: {
      name: "Get [npc2.footjob]",
      tip: "Slide your [npc.cock+] between [npc2.namePos] [npc2.feet] and start fucking them.",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Taking hold of [npc2.namePos] [npc2.feet], [npc.name] [npc.verb(slide)] [npc.her] [npc.cock+] in between them and [npc.verb(start)] eagerly thrusting back and forth.",
      ],
    },
    ongoing: {
      name: "Receiving footjob",
      tip: "Continue fucking [npc2.namePos] [npc2.feet].",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly thrusting [npc.her] [npc.cock+] between [npc2.namePos] [npc2.feet], [npc.name] [npc.verb(let)] out [npc.a_moan+].",
      ],
    },
    stop: {
      name: "Stop footjob",
      tip: "Pull your [npc.cock+] out from between [npc2.namePos] [npc2.feet].",
      lines: [
        "Sliding [npc.her] [npc.cock+] out from between [npc2.namePos] [npc2.feet], [npc.name] [npc.verb(put)] an end to the footjob.",
      ],
    },
    receive: {
      start: {
        name: "Give footjob",
        tip: "Rub your [npc.feet] up and down around [npc2.namePos] [npc2.cock+].",
        selfA: "THREE_NORMAL",
        tgtA: "FOUR_HIGH",
        lines: [
          "Wrapping [npc.her] [npc.feet] around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(start)] eagerly stroking up and down.",
        ],
      },
      ongoing: {
        name: "Giving footjob",
        tip: "Keep stroking [npc2.namePos] [npc2.cock+] with your [npc.feet].",
        selfA: "THREE_NORMAL",
        tgtA: "FOUR_HIGH",
        lines: [
          "Eagerly sliding [npc.her] [npc.feet] up and down [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+].",
        ],
      },
      stop: {
        name: "Stop giving footjob",
        tip: "Pull your [npc.feet] away from [npc2.namePos] [npc2.cock+].",
        lines: [
          "Pulling [npc.her] [npc.feet] away from [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(put)] an end to the footjob.",
        ],
      },
    },
  });

  function registerSelf(spec) {
    register({
      id: spec.id + "_start",
      pair: spec.id,
      name: spec.start.name,
      tab: 1,
      type: "START_ONGOING",
      selfArousal: spec.start.selfA,
      targetArousal: spec.start.tgtA,
      canUse: function (src) {
        return !pairOngoing(spec.id) && spec.ok(src);
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.start.tip, src, tgt);
      },
      perform: function (src) {
        setOngoing(spec.id, src, src, spec.label);
        return parseSex(pick(spec.start.lines), src, src);
      },
    });
    register({
      id: spec.id,
      pair: spec.id,
      name: spec.ongoing.name,
      tab: 1,
      type: "ONGOING",
      selfArousal: spec.ongoing.selfA,
      targetArousal: spec.ongoing.tgtA,
      canUse: function (src) {
        return pairOngoing(spec.id) && LT.sex.ongoing.giver === src && LT.sex.ongoing.receiver === src;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.ongoing.tip, src, tgt);
      },
      perform: function (src) {
        return parseSex(pick(spec.ongoing.lines), src, src);
      },
    });
    register({
      id: spec.id + "_stop",
      pair: spec.id,
      name: spec.stop.name,
      tab: 1,
      type: "STOP_ONGOING",
      selfArousal: "ONE_MINIMUM",
      targetArousal: "ONE_MINIMUM",
      canUse: function (src) {
        return pairOngoing(spec.id) && LT.sex.ongoing.giver === src && LT.sex.ongoing.receiver === src;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.stop.tip, src, tgt);
      },
      perform: function (src) {
        var text = parseSex(pick(spec.stop.lines), src, src);
        LT.sex.ongoing = null;
        return text;
      },
    });
  }

  registerSelf({
    id: "self_finger_vagina",
    label: "self fingering",
    ok: function (src) {
      return hasVagina(src) && LT.isSexExposed(src, "VAGINA");
    },
    start: {
      name: "Finger [npc.herself]",
      tip: "Start fingering [npc.herself].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "Reaching down between [npc.her] [npc.legs], [npc.name] [npc.verb(tease)] [npc.her] [npc.fingers] over the entrance to [npc.her] [npc.pussy+], before letting out [npc.a_moan+] as [npc.she] [npc.verb(push)] [npc.her] digits deep inside.",
        "[npc.Name] eagerly [npc.verb(push)] [npc.her] fingers into [npc.her] needy [npc.pussy], [npc.moaning+] as [npc.she] [npc.verb(curl)] [npc.her] digits up inside [npc.herself] and [npc.verb(start)] stroking in a 'come-hither' motion.",
      ],
    },
    ongoing: {
      name: "Finger self",
      tip: "Concentrate on fingering [npc.herself].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "[npc.A_moan+] escapes from between [npc.namePos] [npc.lips+] as [npc.she] greedily [npc.verb(push)] [npc.her] [npc.fingers] deep inside [npc.her] [npc.pussy+].",
        "Pumping [npc.her] [npc.fingers] in and out of [npc.her] [npc.pussy+], [npc.name] [npc.verb(start)] letting out a series of delighted [npc.moans] as [npc.she] rhythmically [npc.verb(finger)] [npc.herself].",
      ],
    },
    stop: {
      name: "Stop fingering (self)",
      tip: "Stop fingering [npc.herself].",
      lines: ["With [npc.a_groan+], [npc.name] [npc.verb(slide)] [npc.her] fingers out of [npc.her] [npc.pussy+]."],
    },
  });

  registerSelf({
    id: "self_stroke_cock",
    label: "cock stroking",
    ok: function (src) {
      return hasPenis(src) && LT.isSexExposed(src, "PENIS");
    },
    start: {
      name: "Start stroking cock",
      tip: "Take hold of your [npc.cock+] and start jerking yourself off.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "Reaching down between [npc.her] [npc.legs], [npc.name] [npc.verb(grab)] hold of [npc.her] [npc.cock+] and [npc.verb(start)] to masturbate.",
        "Reaching down and taking hold of [npc.her] [npc.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] jerking [npc.herself] off.",
      ],
    },
    ongoing: {
      name: "Cock stroking",
      tip: "Focus on stroking your [npc.cock+].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "[npc.A_moan+] escapes from between [npc.namePos] [npc.lips+] as [npc.she] eagerly [npc.verb(slide)] [npc.her] [npc.fingers] up and down the length of [npc.her] [npc.cock+].",
        "Wrapping [npc.her] [npc.fingers] around [npc.her] [npc.cock+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] frantically [npc.verb(stroke)] up and down.",
      ],
    },
    stop: {
      name: "Stop cock stroking",
      tip: "Stop stroking your [npc.cock+].",
      lines: ["With [npc.a_moan+], [npc.name] [npc.verb(take)] [npc.her] [npc.hand] away from [npc.her] [npc.cock+] and [npc.verb(stop)] jerking off."],
    },
  });

  registerSelf({
    id: "self_finger_nipple",
    label: "self nipple fingering",
    ok: function (src) {
      return hasFuckableNipples(src) && hasBreasts(src) && LT.isSexExposed(src, "BREASTS");
    },
    start: {
      name: "Finger nipples (self)",
      tip: "Sink your [npc.fingers] into your fuckable [npc.nipples] and start fingering your breasts.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "Reaching up to [npc.her] [npc.breasts+], [npc.name] [npc.verb(push)] [npc.her] [npc.fingers] into [npc.her] [npc.nipple+] and [npc.verb(let)] out [npc.a_moan+].",
      ],
    },
    ongoing: {
      name: "Finger nipples (self)",
      tip: "Continue fingering your [npc.nipples].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "[npc.A_moan+] escapes from between [npc.namePos] [npc.lips+] as [npc.she] [npc.verb(pump)] [npc.her] [npc.fingers] in and out of [npc.her] [npc.nipple+].",
      ],
    },
    stop: {
      name: "Stop fingering nipples (self)",
      tip: "Pull your [npc.fingers] out of your [npc.nipples].",
      lines: ["With [npc.a_moan+], [npc.name] [npc.verb(slide)] [npc.her] fingers out of [npc.her] [npc.nipple+]."],
    },
  });

  registerSelf({
    id: "self_finger_anus",
    label: "self anal fingering",
    ok: function (src) {
      return LT.isSexExposed(src, "ANUS");
    },
    start: {
      name: "Anal fingering (self)",
      tip: "Start fingering [npc.her] ass.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "Reaching around to [npc.her] [npc.ass], [npc.name] [npc.verb(tease)] [npc.her] fingers over the entrance to [npc.her] [npc.asshole+], before pushing them inside and letting out [npc.a_moan+].",
        "[npc.Name] eagerly [npc.verb(push)] [npc.her] fingers into [npc.her] needy [npc.asshole], [npc.moaning+] as [npc.she] [npc.verb(start)] pumping [npc.her] digits in and out of [npc.her] [npc.ass].",
      ],
    },
    ongoing: {
      name: "Anal fingering (self)",
      tip: "Continue fingering [npc.her] [npc.asshole].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: [
        "[npc.A_moan+] escapes from between [npc.namePos] [npc.lips+] as [npc.she] [npc.verb(push)] [npc.her] [npc.fingers] deep inside [npc.her] [npc.asshole+].",
        "Pumping [npc.her] [npc.fingers] in and out of [npc.her] [npc.asshole+], [npc.name] [npc.verb(let)] out a series of [npc.moans] as [npc.she] [npc.verb(finger)] [npc.her] [npc.ass].",
      ],
    },
    stop: {
      name: "Stop anal fingering (self)",
      tip: "Stop fingering [npc.her] ass.",
      lines: ["With [npc.a_groan+], [npc.name] [npc.verb(slide)] [npc.her] fingers out of [npc.her] [npc.asshole+]."],
    },
  });

  function setPosition(name) {
    LT.sex.positionName = name;
  }

  function registerPosition(spec) {
    register({
      id: spec.id,
      name: spec.name,
      tab: 2,
      type: "POSITIONING",
      selfArousal: "ONE_MINIMUM",
      targetArousal: "ONE_MINIMUM",
      canUse: function (src, tgt) {
        if (LT.sex.positionName === spec.position) return false;
        return spec.ok ? spec.ok(src, tgt) : true;
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.tip, src, tgt);
      },
      perform: function (src, tgt) {
        setPosition(spec.position);
        return parseSex(spec.line, src, tgt);
      },
    });
  }

  registerPosition({
    id: "pos_standing",
    name: "Back-to-[pc.wall]",
    position: "Standing",
    tip: "Push [npc2.name] back against a nearby [pc.wall].",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] back against a nearby [pc.wall]. Grinding [npc.her] body up against [npc2.hers], [npc.she] [npc.moansVerb] into [npc2.her] [npc2.ear], [npc.speech(Good [npc2.girl]! Now hold still while I fuck you!)]",
  });
  registerPosition({
    id: "pos_face_to_wall",
    name: "Face-to-[pc.wall]",
    position: "Face to wall",
    tip: "Push [npc2.name] up against a nearby [pc.wall].",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] up against a nearby [pc.wall]. Grinding [npc.her] body up against [npc2.her] back, [npc.she] [npc.moansVerb] into [npc2.her] [npc2.ear], [npc.speech(Good [npc2.girl]! Now hold still while I fuck you!)]",
  });
  registerPosition({
    id: "pos_all_fours",
    name: "Doggy-style [npc2.herHim]",
    position: "All fours",
    tip: "Make [npc2.name] get down on all fours so that you can fuck [npc2.herHim], doggy-style.",
    line: "Wanting to fuck [npc2.name] in the doggy-style position, [npc.name] [npc.verb(push)] [npc2.herHim] down onto all fours before [npc.herHim]. Kneeling down behind [npc2.herHim], [npc.she] [npc.verb(grip)] [npc2.her] [npc2.hips+] and [npc.verb(pull)] [npc2.her] [npc2.ass+] back against [npc.her] groin, [npc.moaning], [npc.speech(Time to fuck you like an animal!)]",
  });
  registerPosition({
    id: "pos_lying_down",
    name: "Missionary",
    position: "Lying down",
    tip: "Push [npc2.name] down onto [npc2.her] back and kneel between [npc2.her] [npc2.legs], ready to have sex in the missionary position.",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] down onto [npc2.her] back. Kneeling down between [npc2.her] [npc2.legs], [npc.she] [npc.moansVerb] as [npc.she] [npc.verb(look)] down into [npc2.her] [npc2.eyes+], [npc.speech(That's right, spread your legs for me...)]",
  });
  registerPosition({
    id: "pos_sixty_nine",
    name: "Sixty-nine (top)",
    position: "Sixty-nine",
    tip: "Push [npc2.name] down onto [npc2.her] back and straddle [npc2.her] face, in the sixty-nine position.",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] down onto [npc2.her] back. Quickly lowering [npc.herself] down onto all fours over the top of [npc2.herHim], [npc.she] [npc.verb(drop)] [npc.her] crotch down over [npc2.her] face as [npc.she] similarly [npc.verb(position)] [npc.her] own head over [npc2.her] groin. Looking back beneath [npc.herHim], [npc.name] [npc.moansVerb], [npc.speech(Good [npc2.girl]! Now let's have some fun!)]",
  });
  registerPosition({
    id: "pos_sixty_nine_bottom",
    name: "Sixty-nine (bottom)",
    position: "Sixty-nine (bottom)",
    tip: "Lie down on your back and let [npc2.name] straddle your face, in the sixty-nine position.",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(tug)] [npc2.herHim] down on top of [npc.herHim] as [npc.she] [npc.verb(lie)] down on [npc.her] back. Pulling [npc2.her] [npc2.hips] back so that [npc2.sheIs] in a reversed all-fours position over the top of [npc.herHim], [npc.name] [npc.verb(look)] up at [npc2.her] crotch hovering over [npc.her] face, and [npc.moansVerb], [npc.speech(Good [npc2.girl]! It's time for some oral fun!)]",
  });
  registerPosition({
    id: "pos_cowgirl",
    name: "Cowgirl (riding)",
    position: "Cowgirl",
    tip: "Push [npc2.name] down onto [npc2.her] back and straddle [npc2.her] groin, in the cow-girl position.",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] down onto [npc2.her] back. [npc.She] then lowers [npc.herself] down on top of [npc2.herHim], bringing [npc.her] crotch down to bump against [npc2.hers] as [npc.she] [npc.verb(straddle)] [npc2.herHim] in the cowgirl position. Once [npc.sheHas] made [npc.herself] comfortable, [npc.she] [npc.verb(grin)] down at [npc2.name] and [npc.moansVerb], [npc.speech(Good [npc2.girl]! It's time to give you a ride!)]",
  });
  registerPosition({
    id: "pos_cowgirl_bottom",
    name: "Cowgirl (bottom)",
    position: "Cowgirl (bottom)",
    tip: "Lie down onto your back and get [npc2.name] to straddle your groin, in the cow-girl position.",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(pull)] [npc2.herHim] down with [npc.herHim] as [npc.she] [npc.verb(lie)] down on [npc.her] back. With a firm grip on [npc2.namePos] [npc2.hips], [npc.she] [npc.verb(push)] [npc2.herHim] back so that [npc2.sheIs] straddling [npc.herHim] in the cowgirl position. Once [npc.sheHas] made [npc.herself] comfortable, [npc.she] [npc.verb(grin)] up at [npc2.name] and [npc.moansVerb], [npc.speech(Good [npc2.girl]! It's time for you to have a ride!)]",
  });
  registerPosition({
    id: "pos_sit_on_face",
    name: "Sit on face",
    position: "Sit on face",
    tip: "Push [npc2.name] down onto [npc2.her] back and sit on [npc2.her] face.",
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] down onto [npc2.her] back. [npc.She] then [npc.verb(lower)] [npc.herself] down over the top of [npc2.herHim], such that [npc.her] crotch is hovering just above [npc2.her] [npc2.face]. Once [npc.sheHas] made [npc.herself] comfortable, [npc.she] [npc.verb(allow)] [npc.her] [npc.legs] to give way, firmly planting [npc.her] groin down against [npc2.namePos] mouth.",
  });
  registerPosition({
    id: "pos_facesitting",
    name: "Face sitting",
    position: "Face sitting",
    tip: "Lie down on your back and get [npc2.name] to sit on your face.",
    line: "Taking hold of [npc2.namePos] [npc2.arms], [npc.name] [npc.verb(pull)] [npc2.herHim] down with [npc.herHim] as [npc.she] [npc.verb(lie)] down on [npc.her] back. Reaching around to grab [npc2.her] thighs, [npc.she] then [npc.verb(pull)] [npc2.herHim] down on top of [npc.herHim], so that [npc2.her] crotch is hovering just over [npc.her] [npc.face]. At that moment, [npc2.namePos] [npc2.legs] suddenly give way, causing [npc2.herHim] to firmly plant [npc2.her] groin down against [npc.namePos] mouth.",
  });
  registerPosition({
    id: "pos_mating_press",
    name: "Mating press",
    position: "Mating press",
    tip: "Force [npc2.name] down onto [npc2.her] back, push [npc2.her] [npc2.legs] apart and up towards [npc2.her] head, and then lie down on top of [npc2.herHim], in the 'mating press' position.",
    ok: function (src) {
      return hasPenis(src);
    },
    line: "Taking hold of [npc2.namePos] shoulders, [npc.name] [npc.verb(push)] [npc2.herHim] down onto the ground, forcing [npc2.herHim] to lie on [npc2.her] back. Grabbing [npc2.her] [npc2.legs], [npc.name] [npc.verb(push)] them apart and back up towards [npc2.her] head, before lying down on top of [npc2.herHim] and bumping [npc.her] groin against [npc2.hers]. Pinning [npc2.namePos] wrists to the floor on either side of [npc2.her] head, [npc.name] [npc.moansVerb], [npc.speech(It's time to give you a good hard fuck!)]",
  });
  registerPosition({
    id: "pos_sitting",
    name: "Switch to sitting",
    position: "Sitting",
    tip: "Sit down on a nearby surface, with [npc2.name] kneeling before you, ready to perform oral.",
    line: "Deciding that [npc.she] [npc.verb(want)] to switch into a different position, [npc.name] [npc.verb(get)] [npc2.name] to kneel down before a nearby raised surface. Sitting down in front of [npc2.herHim], [npc.name] [npc.moansVerb], [npc.speech(Yes... This is more like it...)]",
  });
  registerPosition({
    id: "pos_receive_oral",
    name: "Standing receive oral",
    position: "Receive oral",
    tip: "Get [npc2.name] to perform oral on you. Once [npc2.sheHasFull] started, you can get [npc2.herHim] to switch between your front and back.",
    line: "Wanting [npc2.name] to perform oral on [npc.herHim], [npc.name] [npc.verb(push)] [npc2.herHim] down so that [npc2.sheIs] kneeling before [npc.herHim]. Grinning down at [npc2.herHim], [npc.name] [npc.verb(order)], [npc.speech(Go on, put that mouth of yours to use!)]",
  });
  registerPosition({
    id: "pos_perform_oral",
    name: "Perform oral",
    position: "Perform oral",
    tip: "Get down and perform oral on [npc2.name]. Once you have started, you can switch between [npc2.her] front and back.",
    line: "Wanting to perform oral on [npc2.name], [npc.name] [npc.verb(move)] around and [npc.verb(kneel)] down before [npc2.herHim]. Looking up into [npc2.her] [npc2.eyes+], [npc.she] [npc.moansVerb], [npc.speech(That's right, let me put my mouth to use!)]",
  });

  register({
    id: "grope_breasts",
    name: "Grope breasts",
    tab: 0,
    type: "REQUIRES_NO_PENETRATION",
    selfArousal: "TWO_LOW",
    targetArousal: "THREE_NORMAL",
    canUse: function (src, tgt) {
      return hasBreasts(tgt);
    },
    tooltip: function (src, tgt) {
      return parseSex("Give [npc2.namePos] [npc2.breasts+] a squeeze.", src, tgt);
    },
    perform: function (src, tgt) {
      if (LT.isSexExposed(tgt, "BREASTS")) {
        return parseSex(
          pick([
            "Reaching up to [npc2.namePos] chest, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] eagerly fondling and groping [npc2.her] [npc2.breasts+].",
            "[npc.Name] [npc.verb(find)] [npc.herself] unable to resist the temptation of [npc2.namePos] [npc2.breasts+], and [npc.she] [npc.verb(reach)] up to eagerly start groping and squeezing [npc2.her] exposed chest.",
            "Teasing [npc.her] [npc.fingers] over [npc2.namePos] exposed chest, [npc.name] [npc.verb(start)] to eagerly fondle and grope [npc2.namePos] [npc2.breasts+].",
          ]),
          src,
          tgt,
        );
      }
      return parseSex(
        pick([
          "Reaching up to [npc2.namePos] chest, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(start)] eagerly fondling and groping [npc2.her] [npc2.breasts+].",
          "[npc.Name] [npc.verb(find)] [npc.herself] unable to resist the temptation of [npc2.namePos] [npc2.breasts+], and [npc.she] [npc.verb(reach)] up to eagerly start groping and squeezing [npc2.her] chest.",
          "Teasing [npc.her] [npc.fingers] over [npc2.namePos] chest, [npc.name] [npc.verb(start)] to eagerly fondle and grope [npc2.her] [npc2.breasts+].",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "clit_play",
    name: "Clit play",
    tab: 0,
    type: "REQUIRES_NO_PENETRATION",
    selfArousal: "TWO_LOW",
    targetArousal: "FOUR_HIGH",
    canUse: function (src, tgt) {
      return hasVagina(tgt) && LT.isSexExposed(tgt, "VAGINA");
    },
    tooltip: function (src, tgt) {
      return parseSex("Reach down to [npc2.namePos] [npc2.pussy+] and start playing with [npc2.her] [npc2.clit].", src, tgt);
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "Reaching down between [npc2.namePos] [npc2.legs], [npc.name] [npc.verb(start)] eagerly rubbing and teasing [npc2.her] [npc2.clit+], drawing [npc2.a_moan+] out from [npc2.her] mouth.",
          "[npc.Name] [npc.verb(press)] [npc.her] [npc.fingers] against [npc2.namePos] [npc2.clit+], circling and stroking as [npc2.she] [npc2.verb(let)] out [npc2.a_moan+].",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "pinch_nipples_self",
    name: "Pinch nipples (self)",
    tab: 1,
    type: "REQUIRES_NO_PENETRATION",
    selfArousal: "THREE_NORMAL",
    targetArousal: "ONE_MINIMUM",
    canUse: function (src) {
      return hasBreasts(src) && LT.isSexExposed(src, "BREASTS");
    },
    tooltip: function () {
      return "Play with your nipples.";
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "[npc.Name] [npc.verb(reach)] up and [npc.verb(start)] playing with [npc.her] hard [npc.nipples], pinching and rubbing them as [npc.she] [npc.moans] with arousal.",
          "[npc.NamePos] fingertips tease over [npc.her] [npc.breasts+], stopping to pinch and tug at [npc.her] [npc.nipples+] as [npc.she] [npc.moan] and sighs in delight.",
          "With [npc.a_moan+], [npc.name] [npc.verb(reach)] up to [npc.her] [npc.nipples+], pinching and flicking them as [npc.she] continues to cry out in delight.",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "orgasm",
    name: "Orgasm",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src) {
      return (src.arousal || 0) >= LT.MAX_AROUSAL;
    },
    tooltip: function () {
      return "You've reached your climax, and can't hold back your orgasm any longer.";
    },
    perform: function (src, tgt) {
      var bits = [];
      bits.push("[npc.Name] [npc.verb(reach)] around and [npc.verb(grab)] [npc2.namePos] [npc2.ass+], pulling [npc2.herHim] close and letting out [npc.a_moan+] as [npc.she] [npc.verb(prepare)] to reach [npc.her] climax.");
      if (hasVagina(src)) {
        bits.push("A desperate, shuddering heat suddenly crashes up from [npc.namePos] [npc.pussy+], and [npc.she] [npc.verb(let)] out a manic squeal as a blinding wave of pure ecstasy washes over [npc.herHim].");
        var on = LT.sex.ongoing;
        if (on && on.id === "finger_vagina" && on.receiver === src && on.giver !== src) {
          bits.push("[npc.NamePos] vaginal muscles grip and squeeze around [npc2.namePos] intruding digits, and [npc2.she] continues to stroke and tease [npc.her] clit, drawing out a series of [npc.moans+] from between [npc.her] [npc.lips+].");
        }
      }
      src.arousal = 0;
      src.orgasmedThisSex = (src.orgasmedThisSex || 0) + 1;
      var text = parseSex(bits.join(" "), src, tgt);
      if (src && src.player && typeof LT.awardOrgasmEssences === "function") {
        text += LT.awardOrgasmEssences();
      }
      var on = LT.sex.ongoing;
      if (on && on.id === "penis_vagina" && typeof LT.rollForPregnancy === "function" && hasPenis(src) && hasVagina(tgt)) {
        text += LT.rollForPregnancy(tgt, src);
      }
      return text;
    },
  });

  register({
    id: "manage_clothing",
    name: "Manage clothing",
    tab: 3,
    type: "ONGOING",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function () {
      return !LT.sex.clothingMenu;
    },
    tooltip: function () {
      return "Pull clothing aside to get better access.";
    },
    perform: function () {
      LT.sex.clothingMenu = true;
      return "You decide to manage the clothing that's in the way.";
    },
  });

  register({
    id: "cloth_expose_all",
    name: "Pull clothing aside",
    tab: 3,
    type: "ONGOING",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function () {
      return !!LT.sex.clothingMenu;
    },
    tooltip: function () {
      return "Quickly pull clothing out of the way, exposing both of you.";
    },
    perform: function (src, tgt) {
      function strip(ch) {
        ["BREASTS", "PENIS", "VAGINA", "ANUS", "FOOT"].forEach(function (area) {
          LT.setSexExposed(ch, area, true);
        });
        if (!ch.equipped) return;
        Object.keys(ch.equipped).forEach(function (slot) {
          if (ch.equipped[slot]) ch.equipped[slot].displaced = true;
        });
      }
      strip(src);
      strip(tgt);
      LT.sex.clothingMenu = false;
      return parseSex("You quickly pull [npc2.namePos] clothing out of the way, exposing [npc2.her] body, then do the same for yourself.", src, tgt);
    },
  });

  register({
    id: "cloth_back",
    name: "Back",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function () {
      return !!LT.sex.clothingMenu;
    },
    tooltip: function () {
      return "Stop managing clothing.";
    },
    perform: function () {
      LT.sex.clothingMenu = false;
      return "You leave the clothing as it is.";
    },
  });

  register({
    id: "do_nothing",
    name: "Do nothing",
    tab: 3,
    type: "ONGOING",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function () {
      return true;
    },
    tooltip: function () {
      return "Don't make a move.";
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "You remain in position, pressing yourself against [npc2.name], but not making any sort of move on [npc2.herHim].",
          "Staying quite still, you press yourself up against [npc2.name], waiting for [npc2.herHim] to make the next move.",
          "You press yourself against [npc2.name], content to let [npc2.herHim] make the next move.",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "stop_sex",
    name: "Stop sex",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    endsSex: true,
    canUse: function () {
      return LT.sex.canStop();
    },
    tooltip: function (src, tgt) {
      return parseSex("Stop having sex with [npc2.name].", src, tgt);
    },
    perform: function (src, tgt) {
      return parseSex("Having had enough, you [pc.step] back and stop having sex...", src, tgt);
    },
  });

  LT.sex.parseText = parseSex;

  function displaceVerb(item) {
    if (item.slot === "groin") return "Shift aside";
    if (item.slot === "leg" || item.slot === "sock") return "Pull down";
    if (item.slot === "chest" || item.slot === "torso" || item.slot === "torsoOver") return "Pull up";
    return "Remove";
  }

  function clothingSlotActs(who, ch) {
    var acts = [];
    if (!ch || !ch.equipped) return acts;
    var slots = Object.keys(ch.equipped);
    var i;
    for (i = 0; i < slots.length; i++) {
      (function (slot) {
        var item = ch.equipped[slot];
        if (!item) return;
        var owner = who === "p" ? "your" : parseSex("[npc2.namePos]", LT.sex.player, LT.sex.partner);
        var label = item.name || slot;
        if (!item.displaced && !item.removed) {
          var verb = displaceVerb(item);
          acts.push({
            id: "cloth_" + who + "_" + slot + "_disp",
            name: verb + " " + owner + " " + label,
            tab: 3,
            type: "SPECIAL",
            selfArousal: "ZERO_NONE",
            targetArousal: "ZERO_NONE",
            canUse: function () {
              return true;
            },
            tooltip: function () {
              return verb + " the " + label + ".";
            },
            perform: function () {
              if (verb === "Remove") item.removed = true;
              else item.displaced = verb;
              return parseSex("You " + verb.toLowerCase() + " " + owner + " " + label + ".", LT.sex.player, LT.sex.partner);
            },
          });
        } else {
          acts.push({
            id: "cloth_" + who + "_" + slot + "_fix",
            name: "Replace " + owner + " " + label,
            tab: 3,
            type: "SPECIAL",
            selfArousal: "ZERO_NONE",
            targetArousal: "ZERO_NONE",
            canUse: function () {
              return true;
            },
            tooltip: function () {
              return "Put the " + label + " back in place.";
            },
            perform: function () {
              item.displaced = false;
              item.removed = false;
              return parseSex("You put " + owner + " " + label + " back in place.", LT.sex.player, LT.sex.partner);
            },
          });
        }
      })(slots[i]);
    }
    return acts;
  }

  LT.sex.availableActions = function (tab) {
    var list = [];
    var src = this.player;
    var tgt = this.partner;
    if ((src.arousal || 0) >= LT.MAX_AROUSAL && LT.SEX_ACTIONS.orgasm && LT.SEX_ACTIONS.orgasm.canUse(src, tgt)) {
      return [LT.SEX_ACTIONS.orgasm];
    }
    if (tab === 3 && this.clothingMenu) {
      this._clothActs = {};
      var cloth = clothingSlotActs("p", src).concat(clothingSlotActs("n", tgt));
      cloth.push(LT.SEX_ACTIONS.cloth_expose_all);
      cloth.push(LT.SEX_ACTIONS.cloth_back);
      var c;
      for (c = 0; c < cloth.length; c++) {
        if (cloth[c] && (!cloth[c].canUse || cloth[c].canUse(src, tgt))) {
          this._clothActs[cloth[c].id] = cloth[c];
          list.push(cloth[c]);
        }
      }
      return list;
    }
    var id;
    for (id in LT.SEX_ACTIONS) {
      if (!Object.prototype.hasOwnProperty.call(LT.SEX_ACTIONS, id)) continue;
      var act = LT.SEX_ACTIONS[id];
      if (tab != null && act.tab !== tab) continue;
      if (act.id === "cloth_expose_all" || act.id === "cloth_back") continue;
      if (act.canUse && !act.canUse(src, tgt)) continue;
      list.push(act);
    }
    return list;
  };

  function runAction(src, tgt, act) {
    var text = act.perform(src, tgt) || "";
    if (!act.isOrgasm) {
      LT.applyArousal(src, LT.AROUSAL_INCREASE[act.selfArousal] || 0);
      LT.applyArousal(tgt, LT.AROUSAL_INCREASE[act.targetArousal] || 0);
    }
    return text;
  }

  LT.sex.pickPartnerAction = function () {
    var src = this.partner;
    var tgt = this.player;
    if ((src.arousal || 0) >= LT.MAX_AROUSAL) return LT.SEX_ACTIONS.orgasm;
    if (this.ongoing) {
      if (this.ongoing.giver === src && LT.SEX_ACTIONS[this.ongoing.id]) return LT.SEX_ACTIONS[this.ongoing.id];
      if (this.ongoing.receiver === src && LT.SEX_ACTIONS[this.ongoing.id + "_receive"]) return LT.SEX_ACTIONS[this.ongoing.id + "_receive"];
      if (this.ongoing.giver === this.ongoing.receiver) {
        if (LT.SEX_ACTIONS.grope_breasts && LT.SEX_ACTIONS.grope_breasts.canUse(src, tgt)) return LT.SEX_ACTIONS.grope_breasts;
        return LT.SEX_ACTIONS.do_nothing;
      }
      if (this.ongoing.id === "kiss") return LT.SEX_ACTIONS.kiss;
    }
    var starts = [
      "penis_vagina_start",
      "penis_vagina_receive_start",
      "penis_anus_start",
      "penis_anus_receive_start",
      "finger_vagina_start",
      "finger_vagina_receive_start",
      "finger_anus_start",
      "finger_anus_receive_start",
      "cunnilingus_start",
      "cunnilingus_receive_start",
      "anilingus_start",
      "anilingus_receive_start",
      "blowjob_start",
      "blowjob_receive_start",
      "finger_penis_start",
      "finger_penis_receive_start",
      "suckle_start",
      "finger_nipple_start",
      "penis_nipple_start",
      "penis_breasts_start",
      "penis_thighs_start",
      "penis_ass_start",
      "penis_feet_start",
      "clit_play",
      "grope_breasts",
      "kiss_start",
    ];
    var i;
    for (i = 0; i < starts.length; i++) {
      var act = LT.SEX_ACTIONS[starts[i]];
      if (act && act.canUse && act.canUse(src, tgt)) return act;
    }
    return LT.SEX_ACTIONS.do_nothing;
  };

  LT.sex.perform = function (actionId) {
    if (!this.active || this.finished) return;
    var act = (this._clothActs && this._clothActs[actionId]) || LT.SEX_ACTIONS[actionId];
    if (!act || (act.canUse && !act.canUse(this.player, this.partner))) return;
    var lines = [];
    lines.push("<p>" + runAction(this.player, this.partner, act) + "</p>");
    if (act.endsSex) {
      this.lastResolution = lines.join("");
      this.finished = true;
      return;
    }
    var partnerAct = this.pickPartnerAction();
    if (partnerAct && partnerAct.id !== "stop_sex") {
      lines.push("<p>" + runAction(this.partner, this.player, partnerAct) + "</p>");
    }
    this.turn += 1;
    this.lastResolution = lines.join("");
  };

  LT.sex.finish = function () {
    var extra = "";
    this.active = false;
    if (typeof LT.applySexEndStatusEffects === "function") {
      LT.applySexEndStatusEffects(this.player, !!(this.player && this.player.orgasmedThisSex));
      if (this.partner) LT.applySexEndStatusEffects(this.partner, !!(this.partner && this.partner.orgasmedThisSex));
    }
    if (this.onEnd) extra = this.onEnd() || "";
    if (extra) LT.game.textEnd = extra;
    if (this.postSexNode) LT.game.setContent(this.postSexNode);
  };

  LT.sex.bar = function (ch) {
    var a = Math.max(0, ch.arousal || 0);
    var pct = Math.max(0, Math.min(100, a));
    var lust = Math.max(0, ch.lust || 0);
    var lustMax = LT.MAX_LUST || 100;
    var lustPct = Math.max(0, Math.min(100, (lust / lustMax) * 100));
    return (
      "<div class='combatant'>" +
      "<div class='combatant-name'>" +
      nameOf(ch) +
      "</div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      pct +
      "%;background:" +
      LT.Colour.ATTRIBUTE_AROUSAL +
      ";'></div></div>" +
      "<div class='muted'>" +
      Math.round(a * 10) / 10 +
      " / " +
      LT.MAX_AROUSAL +
      " arousal</div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      lustPct +
      "%;background:" +
      LT.Colour.ATTRIBUTE_LUST +
      ";'></div></div>" +
      "<div class='muted'>" +
      lust +
      " / " +
      lustMax +
      " lust</div></div>"
    );
  };

  LT.ResponseSex = function (title, tooltipText, opts) {
    return new LT.Response(title, tooltipText, "sex.scene", function () {
      LT.sex.start(opts);
    }).withColour(LT.Colour.ATTRIBUTE_LUST);
  };
})();
