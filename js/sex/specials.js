(function () {
  if (!LT.sex || !LT.SEX_ACTIONS) return;

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function parseSpecial(text, src, tgt) {
    if (!text) return "";
    if (typeof LT.parse !== "function") return text;
    var out = "";
    try {
      if (typeof LT.withParseTargets === "function") {
        out = LT.withParseTargets({ npc: src, npc2: tgt, pc: LT.game && LT.game.player }, function () {
          return LT.parse(text);
        });
      } else {
        out = LT.parse(text);
      }
    } catch (err) {
      return text;
    }
    return out || text;
  }

  function charId(ch) {
    if (!ch) return "";
    return String(ch.id || ch.name || "").toLowerCase();
  }

  function isPlayer(ch) {
    return !!(ch && (ch.player || ch === LT.sex.player || ch === (LT.game && LT.game.player)));
  }

  function isRose(ch) {
    return charId(ch) === "rose";
  }

  function isLilaya(ch) {
    return charId(ch) === "lilaya";
  }

  function isVicky(ch) {
    return charId(ch) === "vicky";
  }

  function isScarlett(ch) {
    return charId(ch) === "scarlett";
  }

  function managerIs(id) {
    return LT.sex.manager === id || (LT.sex.managerSpec && LT.sex.managerSpec.id === id);
  }

  function hasPenis(ch) {
    if (!ch) return false;
    if (typeof ch.hasPenis === "function") return !!ch.hasPenis();
    return !!(ch.gender && ch.gender.hasPenis);
  }

  function desireNegative(ch, id) {
    var d = "";
    if (LT.sex.fetishDesire) d = String(LT.sex.fetishDesire(ch, id) || "");
    else d = String((ch && ch.fetishDesire && ch.fetishDesire[id]) || "");
    return /HATE|DISLIKE/.test(d);
  }

  function pregnancyHate(ch) {
    if (!ch) return false;
    if (isLilaya(ch) && !(ch.fetishDesire && ch.fetishDesire.FETISH_PREGNANCY)) return true;
    return desireNegative(ch, "FETISH_PREGNANCY");
  }

  function visiblyPregnant(ch) {
    return typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(ch);
  }

  function hasStatus(ch, id) {
    return !!(typeof LT.hasStatusEffect === "function" && LT.hasStatusEffect(ch, id));
  }

  function amazonsSecret(ch) {
    return hasStatus(ch, "innoxia_amazons_secret");
  }

  function muskEnabled() {
    if (typeof LT.isMuskContentEnabled === "function") return LT.isMuskContentEnabled();
    if (LT.properties && LT.properties.muskContent === false) return false;
    return true;
  }

  function satisfied(ch) {
    var need = (ch && ch.orgasmsBeforeSatisfied) || 1;
    return ((ch && ch.orgasmedThisSex) || 0) >= need;
  }

  function findPair(id, pred) {
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      if (links[i].id === id && (!pred || pred(links[i]))) return links[i];
    }
    return null;
  }

  function penisInVagina(giver, receiver) {
    return !!findPair("penis_vagina", function (l) {
      return l.giver === giver && l.receiver === receiver;
    });
  }

  function penisInAnus(giver, receiver) {
    return !!findPair("penis_anus", function (l) {
      return l.giver === giver && l.receiver === receiver;
    });
  }

  function mouthFree(ch) {
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      var l = links[i];
      if ((l.giver === ch && l.giverArea === "MOUTH") || (l.receiver === ch && l.receiverArea === "MOUTH")) return false;
    }
    return true;
  }

  function roseSucking(src, tgt) {
    return !!findPair("finger_mouth", function (l) {
      return l.giver === tgt && l.receiver === src;
    });
  }

  function startRoseSuck(src, tgt) {
    LT.sex.links = LT.sex.links || [];
    if (roseSucking(src, tgt)) return;
    LT.sex.links.push({
      id: "finger_mouth",
      giver: tgt,
      receiver: src,
      giverArea: "FINGER",
      receiverArea: "MOUTH",
      label: "fingers in mouth",
      justStarted: true,
    });
    LT.sex.lastPlayerPair = "finger_mouth";
  }

  function stopRoseSuck(src, tgt) {
    var link = findPair("finger_mouth", function (l) {
      return l.giver === tgt && l.receiver === src;
    });
    if (!link) return;
    var next = [];
    var i;
    for (i = 0; i < LT.sex.links.length; i++) {
      if (LT.sex.links[i] !== link) next.push(LT.sex.links[i]);
    }
    LT.sex.links = next;
  }

  function markPullout(src) {
    LT.sex.requestedPullout = true;
    LT.sex.pulloutRequesters = LT.sex.pulloutRequesters || {};
    if (src) LT.sex.pulloutRequesters[charId(src) || src] = true;
  }

  function alreadyAskedPullout(src) {
    var bag = LT.sex.pulloutRequesters || {};
    return !!(src && bag[charId(src) || src]);
  }

  function flag(key, value) {
    LT.sex.flags = LT.sex.flags || {};
    if (arguments.length > 1) {
      LT.sex.flags[key] = value;
      return value;
    }
    return LT.sex.flags[key];
  }

  function registerSpecial(def) {
    LT.SEX_ACTIONS[def.id] = def;
  }

  registerSpecial({
    id: "rose_hand_massage",
    name: "Hand massage",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt);
    },
    tooltip: function () {
      return "Massage Rose's hands.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Taking Rose's hand in one of yours, you gently press the [pc.fingers+] of your other hand down against the back of hers, rubbing and massaging her delicate skin.",
          "You take hold of Rose's hand, and with slow, deliberate movements, start massaging giving her a gentle massage.",
          "Holding Rose's hand in yours, you start to apply a gentle pressure, revelling in the feeling of her perfect, unblemished skin as you give her a loving massage.",
          "With a soft, tender care, you start massaging Rose's hands, letting out little [pc.moans] as you feel the softness of her angelic skin.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_interlock_fingers",
    name: "Interlock fingers",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt);
    },
    tooltip: function () {
      return "Interlock your fingers with Rose's.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Taking Rose's hand in yours, you intertwine your fingers between hers, and with a gentle pressure, you lewdly hold her hand.",
          "In a single, deliberate movement, you grasp Rose's hand in yours, sliding your fingers between hers as you fully penetrate the inviting gaps between her digits.",
          "Letting out a determined [pc.moan], you slide your fingers between Rose's, squeezing down on her hand as you show her just how naughty you are.",
          "With a lewd thrust of your [pc.arm], you grasp Rose's perfect hand in yours, quickly interlocking your fingers with hers as you struggle to contain a desperate gasp.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_nail_rub",
    name: "Nail rub",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt);
    },
    tooltip: function () {
      return "Gently rub Rose's nails.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Rose's nails are painted a very soft shade of pink, and you find yourself unable to resist sliding your fingertips up over their flawless surface.",
          "In an incredible display of lewdness, you slide each of your fingertips over the corresponding fingernail on Rose's hand, sighing contentedly to yourself as you feel her perfect manicure.",
          "Rose wasn't lying when she said she takes good care of her hands, and as you slide your fingertips over her perfectly-manicured nails, you wonder just how long it took her to get them looking so good.",
          "The soft shade of pink that Rose has painted her fingernails perfectly compliments the pale tone of her skin, and as you rub your fingers up and down their smooth lengths, you marvel at just how perfect they are.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_stroke_fingers",
    name: "Stroke fingers",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt);
    },
    tooltip: function () {
      return "Gently stroke Rose's fingers.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Grasping one of Rose's slender, feminine fingers in your hand, you slowly slide your fingertips up and down its length, marvelling at how soft her perfect, unblemished skin is.",
          "With a determined thrust of your hand, you grasp Rose's fingers, sliding your own digits up and down over their lengths as you fail to contain an ecstatic [pc.moan].",
          "Sliding your fingers over Rose's, you let out a little whimper in excitement as you start stroking her soft, angelic skin.",
          "Running your fingertips up and down the length of each of Rose's slender, feminine fingers, you struggle to comprehend just how perfectly formed her hands truly are.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_lick_palms",
    name: "Lick palms",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt) && mouthFree(src);
    },
    tooltip: function () {
      return "Lick Rose's palms.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Lifting one of Rose's hands up to your mouth, you press your [pc.lips+] against the delicate skin of her palm, before sliding your [pc.tongue] up over her soft skin.",
          "Raising Rose's hand to your mouth, you deliver a long, slow lick to her soft palm, letting out a lewd [pc.moan] as you get a faint taste of salty sweat mixed in with her feminine scent.",
          "Taking hold of Rose's hand, you lift it up to your mouth before softly licking and lapping at her delicate palm. The gentle taste of sweat and feminine perfume hits your [pc.tongue], and you fail to contain a shuddering [pc.moan].",
          "With a little [pc.moan], you raise Rose's angelic hand to your [pc.lips+], before delivering a slow, loving lick to her soft palm.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_suck_start",
    name: "Suck fingers",
    tab: 0,
    type: "START_ONGOING",
    pair: "finger_mouth",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt) && !roseSucking(src, tgt);
    },
    tooltip: function () {
      return "Start sucking Rose's fingers.";
    },
    perform: function (src, tgt) {
      startRoseSuck(src, tgt);
      return parseSpecial(
        "In an incredible display of the sort of extreme lewdness usually confined to only the most outrageous of online-publications, you resolutely commit to taking things to the next level. Grasping Rose's angelic, feminine hand in yours, you slowly lift it to your mouth. Sensing what you're about to do, and in sheer anticipation of witnessing the result of the outrageous course of action you've embarked upon, Rose collapses against the wall for support, moaning and panting as her fingers draw ever nearer to your cavernous maw.<br/><br/>As your hot breath falls on her sensitive fingertips, you briefly ponder if perhaps you've taken this a little too far, but there seems to be no easy way out now, and you resolutely thrust Rose's fingers past your lips and into your mouth. Thus relegating yourself to the ranks of the lewdest of sexual deviants, and knowing that you'll never quite be the same person as you once were, you proceed to then start sucking on Rose's fingers.",
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_gentle_suck",
    name: "Gentle suck",
    tab: 0,
    type: "ONGOING",
    pair: "finger_mouth",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt) && roseSucking(src, tgt);
    },
    tooltip: function () {
      return "Gently suck Rose's fingers.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "You gently suck and kiss Rose's feminine digits, desperately running your tongue over her slender fingers as you taste her gentle combination of sweat and feminine perfume.",
          "Sucking gently on Rose's perfect fingers, you run your tongue around each of her digits in turn, letting out [pc.moans+] as you orally pleasure her hand.",
          "Determined to give Rose a good time, you gently suck and kiss at each of her feminine fingers, revelling in the feeling of being able to experience such a devious pleasure.",
          "Wrapping your [pc.lips+] around Rose's angelic fingers, you gently suck and kiss at her perfectly-formed digits, making little [pc.moaning] noises as you notice the faint taste of her sweat hitting the back of your tongue.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_intense_suck",
    name: "Intense suck",
    tab: 0,
    type: "ONGOING",
    pair: "finger_mouth",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt) && roseSucking(src, tgt);
    },
    tooltip: function () {
      return "Intensely suck Rose's fingers.";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Before you know what you're doing, you've lost yourself to the devious pleasure of sucking Rose's fingers, and with a lewd cry, you desperately pick up the pace of your intense digit-sucking.",
          "With an intense sucking motion, you press your [pc.lips+] down around Rose's fingers before starting to frantically kiss and lick at her delicate digits.",
          "You decide to pick up the pace of your lewd finger-sucking, and with a desperate cry, you greedily swirl your tongue around each of her digits in turn.",
          "Rose's fingers are soft and warm in your mouth, and, not being able to hold yourself back any longer, you frantically start sucking and kissing her perfectly-formed digits.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_suck_stop",
    name: "Stop sucking",
    tab: 0,
    type: "STOP_ONGOING",
    pair: "finger_mouth",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isPlayer(src) && isRose(tgt) && roseSucking(src, tgt);
    },
    tooltip: function () {
      return "Stop sucking Rose's fingers.";
    },
    perform: function (src, tgt) {
      stopRoseSuck(src, tgt);
      return parseSpecial(
        "Not being able to cope with just how lewd your finger-sucking has become, you slide Rose's soft, feminine digits out of your mouth. A solitary strand of slimy saliva slowly slides out from your mouth, connecting your lips to Rose's fingertips for brief moment before breaking and falling to the floor beneath you.",
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_moan",
    name: "Moans",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    uniqueMax: true,
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isRose(src) && isPlayer(tgt);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Rose lets out a desperate cry, ",
          "With an extremely lewd moan, Rose cries out, ",
          "Desperately moaning, Rose locks her [rose.eyes+] with yours, ",
          "With a desperate, shuddering moan, Rose cries out, ",
        ]) +
          pick([
            "[rose.speech(~Aah!~ Yes! Don't stop!)]",
            "[rose.speech(Yes! Yes! ~Aah!~ Take me!)]",
            "[rose.speech(Oh yes! ~Aah!~ Keep going!)]",
            "[rose.speech(Oh! ~Aah!~ Keep going! Yes!)]",
            "[rose.speech(~Aah!~ Yes, Yes, Yes!!!)]",
            "[rose.speech(~Aah!~ Oh yes! Keep going! ~Aah!~)]",
          ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_panting",
    name: "Panting",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isRose(src) && isPlayer(tgt);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Rose seems unable to do anything but pant and [rose.moan] as you carry on stimulating her hands.",
          "Your expert hand-holding skills prove to be too much for Rose, who's unable to do anything but pant from sheer arousal.",
          "Rose's eyes roll up into the back of her head for a moment, and as her tongue lolls out of her mouth, she lets out a long, desperate moan.",
          "With a desperate [rose.moan], Rose starts panting and sighing, and you see her [rose.tongue+] lolling out of her mouth as she struggles to deal with the amount of pleasure you're giving to her.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_brace",
    name: "Brace",
    tab: 0,
    type: "ONGOING",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isRose(src) && isPlayer(tgt);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "Rose partially collapses against the table-top next to her, desperately bracing herself as she starts to go weak at the knees.",
          "With a little [rose.moan], Rose leans against the wall next to her, bracing herself as she struggles to cope with her intense arousal.",
          "Rose rests her back against the wall next to her, clearly unable to stand of her own volition as she lets out a shuddering [rose.moan].",
          "Leaning against the nearby table-top, Rose uses the piece of furniture for support, clearly struggling to remain upright due to the overwhelming pleasure she's receiving from your expert hand-holding skills.",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_slide_fingers",
    name: "Slide fingers",
    tab: 0,
    type: "ONGOING",
    pair: "finger_mouth",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isRose(src) && isPlayer(tgt) && roseSucking(tgt, src);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        pick([
          "With a lewd [rose.moan], Rose starts sliding her fingering in and out of your mouth, causing you to experience levels of lewdness you couldn't imagine even in your wildest dreams.",
          "Rose starts slowly sliding her fingers in and out of your mouth, and you let out a desperate whine as you feel her soft skin rubbing over your [pc.lips+].",
          "Sliding her fingers in and out of your mouth, Rose swirls them around your tongue a little before letting out a desperate [rose.moan].",
          "In an unparallelled display of outrageous sexual deviancy, Rose starts slowly sliding her fingers in and out of your mouth, allowing you to feel her unbelievably soft skin rubbing back and forth past your [pc.lips+].",
        ]),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "rose_partner_stop",
    name: "Finished",
    tab: 0,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    uniqueMax: true,
    endsSex: true,
    canUse: function (src, tgt) {
      return managerIs("rose_hands") && isRose(src) && isPlayer(tgt) && satisfied(src) && satisfied(tgt);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      return parseSpecial(
        "With a satisfied sigh, Rose disentangles herself from your clutches, and, staring lovingly into your eyes, excuses herself, [rose.speech(I don't think I can take any more right now! I need to get some rest, but we definitely need to do this again some time!)]",
        src,
        tgt,
      );
    },
  });

  function lilayaDemandTitle(tgt) {
    if (amazonsSecret(tgt)) return "Pull back reminder";
    if (LT.sex.wearingCondom && LT.sex.wearingCondom(tgt)) return "Condom check";
    return "Pull out reminder";
  }

  function lilayaAskTitle(tgt) {
    if (amazonsSecret(tgt)) return "Demand pull back";
    if (LT.sex.wearingCondom && LT.sex.wearingCondom(tgt)) return "Condom reassurance";
    return "Demand pull out";
  }

  function lilayaDemandText(src, tgt, climax) {
    if (amazonsSecret(tgt)) {
      if (climax) {
        return "Through [npc.her] desperate moans and lewd cries, [npc.name] somehow manages to formulate a sentence as [npc.she] cries out to [npc2.name],  [npc.speech(Hey, wait! If you orgasm like this, I could get pregnant!)]";
      }
      return "Through [npc.her] desperate moans and lewd cries, [npc.name] somehow manages to formulate a sentence as [npc.she] cries out to [npc2.name], [npc.speech(Pull away before you orgasm! I know that you've drunk a bottle of Amazon's Secret, and I'm <b>not</b> getting pregnant!)]";
    }
    if (LT.sex.wearingCondom && LT.sex.wearingCondom(tgt)) {
      if (climax) {
        return "Through [npc.her] desperate moans and lewd cries, [npc.name] somehow manages to formulate a sentence as [npc.she] cries out to [npc2.name], [npc.speech(That condom had better not break! I'm <b>not</b> getting pregnant!)]";
      }
      return "Through [npc.her] desperate moans and lewd cries, [npc.name] somehow manages to formulate a sentence as [npc.she] cries out to [npc2.name], [npc.speech(Your condom's on properly, isn't it? I'm <b>not</b> getting pregnant!)]";
    }
    if (climax) {
      return "Through [npc.her] desperate moans and lewd cries, [npc.name] somehow manages to formulate a sentence as [npc.she] cries out to [npc2.name], [npc.speech(Pull out! I'm <b>not</b> getting pregnant!)]";
    }
    return "Through [npc.her] desperate moans and lewd cries, [npc.name] somehow manages to formulate a sentence as [npc.she] cries out to [npc2.name], [npc.speech(Just remember to pull out! I'm <b>not</b> getting pregnant!)]";
  }

  function partnerPreparingFor(tgt) {
    if ((tgt && tgt.arousal || 0) >= (LT.MAX_AROUSAL || 100)) return true;
    return !!(LT.sex._playerAct && (LT.sex._playerAct.isOrgasm || LT.sex._playerAct.type === "ORGASM"));
  }

  function lilayaPulloutReady(src, tgt, climax) {
    if (!isLilaya(src) || !tgt) return false;
    if (visiblyPregnant(src) || !pregnancyHate(src)) return false;
    if (!(amazonsSecret(tgt) || (penisInVagina(tgt, src) && hasPenis(tgt)))) return false;
    if (!climax && alreadyAskedPullout(src)) return false;
    if (!climax && (tgt.arousal || 0) < 80) return false;
    return true;
  }

  registerSpecial({
    id: "lilaya_demand_pullout",
    name: "Pull out reminder",
    tab: 0,
    type: "ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    uniqueMax: true,
    canUse: function (src, tgt) {
      return lilayaPulloutReady(src, tgt, false);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      markPullout(src);
      return parseSpecial(lilayaDemandText(src, tgt, false), src, tgt);
    },
  });
  Object.defineProperty(LT.SEX_ACTIONS.lilaya_demand_pullout, "name", {
    configurable: true,
    get: function () {
      return lilayaDemandTitle((LT.sex && LT.sex.player) || null);
    },
  });

  registerSpecial({
    id: "lilaya_ask_pullout",
    name: "Demand pull out",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    uniqueMax: true,
    canUse: function (src, tgt) {
      return lilayaPulloutReady(src, tgt, true) && partnerPreparingFor(tgt);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      if (LT.sex.preparedFor && LT.sex.preparedFor.indexOf(tgt) < 0) LT.sex.preparedFor.push(tgt);
      markPullout(src);
      return parseSpecial(lilayaDemandText(src, tgt, true), src, tgt);
    },
  });
  Object.defineProperty(LT.SEX_ACTIONS.lilaya_ask_pullout, "name", {
    configurable: true,
    get: function () {
      return lilayaAskTitle((LT.sex && LT.sex.player) || null);
    },
  });

  registerSpecial({
    id: "lilaya_prepare",
    name: "Prepare",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    uniqueMax: true,
    canUse: function (src, tgt) {
      return (
        isLilaya(src) &&
        pregnancyHate(src) &&
        !penisInVagina(tgt, src) &&
        !amazonsSecret(tgt) &&
        partnerPreparingFor(tgt)
      );
    },
    tooltip: function () {
      return "You can feel that [npc2.name] is fast approaching [npc2.her] orgasm. Prepare yourself for it.";
    },
    perform: function (src, tgt) {
      if (LT.sex.preparedFor && LT.sex.preparedFor.indexOf(tgt) < 0) LT.sex.preparedFor.push(tgt);
      return parseSpecial(
        "[npc.Name] lets out [npc.a_moan+] of encouragement as [npc.she] prepares for [npc2.name] to reach [npc2.her] orgasm.",
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "lilaya_furious_stop",
    name: "Creampied?!",
    tab: 0,
    type: "ONGOING",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    uniqueMax: true,
    endsSex: true,
    canUse: function (src, tgt) {
      return isLilaya(src) && pregnancyHate(src) && hasStatus(src, "PREGNANT_0");
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      if (amazonsSecret(tgt) || !hasPenis(tgt)) {
        return parseSpecial(
          "[npc.Name] feels a deep, penetrating warmth spreading through her [lilaya.pussy+] and up into her womb. Violently shoving [npc2.name] away from her, she angrily screams, [npc.speechNoEffects(What the fuck?! I told you to pull back!)]",
          src,
          tgt,
        );
      }
      if (LT.game && LT.game.flags && LT.game.flags.lilayaCondomBroke) {
        return parseSpecial(
          "[npc.Name] feels [npc2.namePos] [npc2.cum] dripping out of her [lilaya.pussy+], and, frantically shoving [npc2.herHim] away from her, she cries out in distress,  [npc.speechNoEffects(The condom broke! No! Fuck! I could get pregnant from this!)]",
          src,
          tgt,
        );
      }
      return parseSpecial(
        "[npc.Name] feels [npc2.namePos] [npc2.cum] dripping out of her [lilaya.pussy+], and, violently shoving [npc2.herHim] away from her, she angrily screams, [npc.speechNoEffects(What the fuck?! I told you to pull out!)]",
        src,
        tgt,
      );
    },
  });
  Object.defineProperty(LT.SEX_ACTIONS.lilaya_furious_stop, "name", {
    configurable: true,
    get: function () {
      var tgt = LT.sex && LT.sex.player;
      if (amazonsSecret(tgt) || !hasPenis(tgt)) return "Impregnated?!";
      return "Creampied?!";
    },
  });

  function vickyMarkTitle(src) {
    var inside = LT.sex.penisInside && LT.sex.penisInside(src);
    if (inside) {
      if (inside.receiverArea === "FINGER" || findPair("finger_penis", function (l) { return l.receiver === src; })) {
        return "Handjob onto face";
      }
      return "Pull out (facial)";
    }
    return "Facial";
  }

  registerSpecial({
    id: "vicky_marking_orgasm",
    name: "Facial",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    uniqueMax: true,
    endsSex: true,
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src, tgt) {
      if (!isVicky(src) || !muskEnabled()) return false;
      if ((src.arousal || 0) < (LT.MAX_AROUSAL || 100)) return false;
      if (!hasPenis(src) || (LT.sex.wearingCondom && LT.sex.wearingCondom(src))) return false;
      if (LT.isSexExposed && !LT.isSexExposed(src, "PENIS")) return false;
      if (LT.sex.cumTargetAllowed && !LT.sex.cumTargetAllowed(src, "FACE")) return false;
      return !!tgt;
    },
    tooltip: function () {
      return "You've reached your climax, and can't hold back your orgasm any longer. Direct your cum onto [npc2.namePos] face.";
    },
    perform: function (src, tgt) {
      var text = "";
      if (typeof LT.parseFromXML === "function" && LT.TEXT && LT.TEXT["places/dominion/shoppingArcade/arcaneArts"]) {
        text = LT.parseFromXML("places/dominion/shoppingArcade/arcaneArts", "VICKY_MARKING_ORGASM");
      }
      if (!text) {
        text =
          "With a deep, rumbling growl, Vicky suddenly grabs the back of your head, before moaning, [vicky.speechNoEffects(~Mmm!~ I'm going to cum! ~Aah!~ Take it on your face, my good little prey!)] " +
          "Obediently doing as you're told, you direct Vicky's throbbing cock towards your face. As the knot at the base of her huge shaft swells up, she reaches her climax, and a thick spurt of hot, salty cum shoots out of her hard cock. Directing her musky cum onto your face, the wolf-girl growls, [vicky.speechNoEffects(That's it... Let me mark you with my scent... ~Mmm!~ That's my good prey...)] " +
          "Completely submitting to Vicky, you hold still so as to allow spurt after spurt of her thick, musky jizz to land on your [pc.faceSkin]. Growling in satisfaction as her orgasm comes to an end, the wolf-girl flashes a toothy grin down at you, before pulling back and declaring, [vicky.speechNoEffects(We're done... You carry my scent now, so everyone will know that you belong to me!)] " +
          "It seems as though the wolf-girl has finished...";
      }
      if (LT.sex.applyOrgasm) LT.sex.applyOrgasm(src, tgt, "FACE");
      else {
        src.arousal = 0;
        src.orgasmedThisSex = (src.orgasmedThisSex || 0) + 1;
        LT.sex.lastCumTarget = "FACE";
      }
      return parseSpecial(text, src, tgt);
    },
  });
  Object.defineProperty(LT.SEX_ACTIONS.vicky_marking_orgasm, "name", {
    configurable: true,
    get: function () {
      var parts = ((LT.sex && LT.sex.participants) || []).concat([LT.sex && LT.sex.partner, LT.sex && LT.sex.player]);
      var i;
      for (i = 0; i < parts.length; i++) {
        if (isVicky(parts[i])) return vickyMarkTitle(parts[i]);
      }
      return "Facial";
    },
  });

  registerSpecial({
    id: "scarlett_buttslut_tease",
    name: "Buttslut tease",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    uniqueMax: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      if (!isScarlett(src) || !isPlayer(tgt)) return false;
      if (src.isMute && src.isMute()) return false;
      if (LT.sex.isDom && !LT.sex.isDom(src)) return false;
      if (LT.sex.getSexPace && LT.sex.getSexPace(src) !== "DOM_ROUGH") return false;
      return penisInAnus(src, tgt);
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      if (LT.sex.preparedFor && LT.sex.preparedFor.indexOf(tgt) < 0) LT.sex.preparedFor.push(tgt);
      return parseSpecial(
        "Realising that you're close to reaching your climax, [scarlett.name] slams [scarlett.her] [scarlett.cock+] deep into your [pc.asshole+] and teases, [scarlett.speechNoEffects(Come on, bitch! ~Mmm!~ Prove to me that you're a dirty buttslut and cum from the feeling of my cock in your ass!)]",
        src,
        tgt,
      );
    },
  });

  function scarlettInterruptText(tag, fallback) {
    if (typeof LT.parseFromXML === "function" && LT.TEXT && LT.TEXT["characters/dominion/scarlett"]) {
      var xml = LT.parseFromXML("characters/dominion/scarlett", tag);
      if (xml) return xml;
    }
    return fallback;
  }

  registerSpecial({
    id: "scarlett_customer_interrupt",
    name: "Customer interruption",
    tab: 0,
    type: "ONGOING",
    uniqueMax: true,
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function (src) {
      if (!managerIs("scarlett_oral") || isPlayer(src)) return false;
      if ((LT.sex.turn || 0) <= 2) return false;
      if ((LT.sex.player && LT.sex.player.arousal || 0) >= 75) return false;
      if ((src.arousal || 0) >= 75) return false;
      var last = flag("scarlettInterruptedTurn");
      if (last != null && (LT.sex.turn || 0) - last <= 10) return false;
      if (flag("forceScarlettInterrupt")) return true;
      return Math.random() < 0.5;
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      flag("scarlettInterruptedTurn", LT.sex.turn || 0);
      return parseSpecial(
        scarlettInterruptText(
          "CUSTOMER_INTERRUPTION",
          "Having spotted a customer heading towards her, Scarlett bucks her hips forwards and slams her [scarlett.cock+] down your throat, effectively silencing you as she calls out, [scarlett.speechNoEffects(Ask one of the other harpies for help! I'm fucking busy here!)]<br/><br/>Scarlett's hostile exclamation effectively dissuades the customer from coming any closer, and after watching them turn around and walk off, the raven harpy draws back a little and hisses down at you, [scarlett.speechNoEffects(Keep sucking, bitch!)]",
        ),
        src,
        tgt,
      );
    },
  });

  registerSpecial({
    id: "scarlett_helena_interrupt",
    name: "Helena interruption",
    tab: 0,
    type: "ONGOING",
    uniqueMax: true,
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function (src) {
      if (!managerIs("scarlett_oral") || isPlayer(src)) return false;
      if (flag("helenaInterruptedTurn") != null) return false;
      if (flag("scarlettInterruptedTurn") == null) return false;
      if ((LT.sex.player && LT.sex.player.arousal || 0) >= 95) return false;
      var a = src.arousal || 0;
      return a > 75 && a < 95;
    },
    tooltip: function () {
      return "";
    },
    perform: function (src, tgt) {
      flag("helenaInterruptedTurn", LT.sex.turn || 0);
      return parseSpecial(
        scarlettInterruptText(
          "HELENA_INTERRUPTION",
          "Letting out a surprised gasp, Scarlett suddenly steps forwards and hilts her cock down your throat, effectively limiting the sounds you can produce to no more than a quiet, gargled splutter. The reason for this unexpected move is very quickly made clear to you, as from up above, you hear the familiar, soft voice of Helena addressing your sexual partner, [helena.speechNoEffects(Scarlett, my dear, I've just received a complaint from one of our clients. Apparently, you've just been extremely rude to them. What do you have to say for yourself?)]<br/><br/>[scarlett.speechNoEffects(Ah! S-Sorry, Helena! I didn't mean to be so rude!)] the raven harpy quickly apologises, doing her best to hide the tone of arousal in her voice.<br/><br/>Thankfully, Helena seems to be oblivious as to what's happening beneath the counter in front of her, and after sharply scolding her subordinate, she lets out an exasperated sigh and asks, [helena.speechNoEffects(So did [pc.name] leave earlier? I thought [pc.she] would have come and said goodbye to me...)]<br/><br/>[scarlett.speechNoEffects(Yes, but I'm sure [pc.she]'ll be back soon,)] Scarlett says as she slowly grinds the base of her cock against your [pc.lips]. Without saying another word, you hear the beautiful matriarch turn on the spot and head off back into the store, leaving Scarlett to let out a soft laugh and hiss down at you, [scarlett.speechNoEffects(You hear that? Once I've finished with you, Helena'll be wanting to see you. Now hurry up and finish me off!)]",
        ),
        src,
        tgt,
      );
    },
  });

  function pickUniquePartnerAction(src, tgt) {
    var acts = LT.SEX_ACTIONS;
    if (acts.rose_partner_stop && acts.rose_partner_stop.canUse(src, tgt)) return acts.rose_partner_stop;
    if (acts.lilaya_furious_stop && acts.lilaya_furious_stop.canUse(src, tgt)) return acts.lilaya_furious_stop;
    if ((src.arousal || 0) >= (LT.MAX_AROUSAL || 100) && acts.vicky_marking_orgasm && acts.vicky_marking_orgasm.canUse(src, tgt)) {
      return acts.vicky_marking_orgasm;
    }
    if (acts.scarlett_helena_interrupt && acts.scarlett_helena_interrupt.canUse(src, tgt)) return acts.scarlett_helena_interrupt;
    if (acts.scarlett_customer_interrupt && acts.scarlett_customer_interrupt.canUse(src, tgt)) return acts.scarlett_customer_interrupt;
    if (LT.sex._playerAct && (LT.sex._playerAct.isOrgasm || LT.sex._playerAct.type === "ORGASM")) {
      if (acts.scarlett_buttslut_tease && acts.scarlett_buttslut_tease.canUse(src, tgt)) return acts.scarlett_buttslut_tease;
      if (acts.lilaya_ask_pullout && acts.lilaya_ask_pullout.canUse(src, tgt)) return acts.lilaya_ask_pullout;
      if (acts.lilaya_prepare && acts.lilaya_prepare.canUse(src, tgt)) return acts.lilaya_prepare;
    }
    if (acts.lilaya_demand_pullout && acts.lilaya_demand_pullout.canUse(src, tgt)) return acts.lilaya_demand_pullout;
    if (managerIs("rose_hands") && isRose(src)) {
      if (acts.rose_slide_fingers && acts.rose_slide_fingers.canUse(src, tgt)) return acts.rose_slide_fingers;
      var roseActs = [acts.rose_moan, acts.rose_panting, acts.rose_brace].filter(function (act) {
        return act && (!act.canUse || act.canUse(src, tgt));
      });
      if (roseActs.length) return pick(roseActs);
    }
    return null;
  }

  [
    "finger_mouth_start",
    "finger_mouth",
    "finger_mouth_stop",
    "finger_mouth_receive_start",
    "finger_mouth_receive",
    "finger_mouth_receive_stop",
    "finger_finger_start",
    "finger_finger",
    "finger_finger_stop",
    "finger_finger_receive_start",
    "finger_finger_receive",
    "finger_finger_receive_stop",
  ].forEach(function (id) {
    var act = LT.SEX_ACTIONS[id];
    if (!act || !act.canUse) return;
    var origCan = act.canUse;
    act.canUse = function (src, tgt) {
      if (managerIs("rose_hands")) return false;
      return origCan.call(this, src, tgt);
    };
  });

  var origPick = LT.sex.pickPartnerAction;
  LT.sex.pickPartnerAction = function (src, tgt) {
    src = src || this.partner;
    tgt = tgt || (this.getTarget && this.getTarget(src)) || this.player;
    var unique = pickUniquePartnerAction(src, tgt);
    if (unique) return unique;
    return origPick.call(this, src, tgt);
  };

  LT.sex.uniqueSpecials = {
    isRose: isRose,
    isLilaya: isLilaya,
    isVicky: isVicky,
    isScarlett: isScarlett,
    managerIs: managerIs,
    pickUniquePartnerAction: pickUniquePartnerAction,
  };
})();
