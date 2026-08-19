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

  function roundOne(n) {
    return Math.round((Number(n) || 0) * 10) / 10;
  }

  LT.applyArousal = function (ch, amount) {
    if (!ch) return 0;
    var before = ch.arousal || 0;
    ch.arousal = Math.max(0, Math.min(LT.MAX_AROUSAL, roundOne(before + amount)));
    if (amount > 0 && typeof LT.applyLust === "function") {
      LT.applyLust(ch, amount * 2);
    } else if (amount > 0) {
      ch.lust = Math.max(0, Math.min(LT.MAX_LUST || 100, (ch.lust || 0) + amount * 2));
    }
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
    links: [],
    lastPlayerPair: "",
    finished: false,
    onEnd: null,
  };

  var AREA_CAP = {
    FINGER: 2,
    TONGUE: 1,
    PENIS: 1,
    MOUTH: 1,
    VAGINA: 1,
    ANUS: 1,
    NIPPLE: 2,
    BREASTS: 2,
    FOOT: 2,
    THIGHS: 1,
    ASS: 1,
    CLIT: 1,
    TAIL: 1,
    TENTACLE: 2,
    TOY: 1,
    ARMPIT: 2,
    URETHRA: 1,
    SPINNERET: 1,
    CROTCH_NIPPLE: 2,
    MOUND: 1,
  };

  var PAIR_AREAS = {
    kiss: { giver: "TONGUE", receiver: "MOUTH", extra: [["MOUTH", "TONGUE"]] },
    finger_vagina: { giver: "FINGER", receiver: "VAGINA" },
    finger_penis: { giver: "FINGER", receiver: "PENIS" },
    finger_anus: { giver: "FINGER", receiver: "ANUS" },
    finger_nipple: { giver: "FINGER", receiver: "NIPPLE" },
    cunnilingus: { giver: "TONGUE", receiver: "VAGINA" },
    blowjob: { giver: "MOUTH", receiver: "PENIS" },
    anilingus: { giver: "TONGUE", receiver: "ANUS" },
    penis_vagina: { giver: "PENIS", receiver: "VAGINA" },
    penis_anus: { giver: "PENIS", receiver: "ANUS" },
    penis_nipple: { giver: "PENIS", receiver: "NIPPLE" },
    penis_breasts: { giver: "PENIS", receiver: "BREASTS" },
    penis_thighs: { giver: "PENIS", receiver: "THIGHS" },
    penis_ass: { giver: "PENIS", receiver: "ASS" },
    penis_feet: { giver: "PENIS", receiver: "FOOT" },
    suckle: { giver: "TONGUE", receiver: "NIPPLE" },
    self_finger_vagina: { giver: "FINGER", receiver: "VAGINA" },
    self_finger_anus: { giver: "FINGER", receiver: "ANUS" },
    self_finger_penis: { giver: "FINGER", receiver: "PENIS" },
    self_finger_nipple: { giver: "FINGER", receiver: "NIPPLE" },
    tail_vagina: { giver: "TAIL", receiver: "VAGINA" },
    tail_anus: { giver: "TAIL", receiver: "ANUS" },
    tail_mouth: { giver: "TAIL", receiver: "MOUTH" },
    tail_nipple: { giver: "TAIL", receiver: "NIPPLE" },
    tentacle_vagina: { giver: "TENTACLE", receiver: "VAGINA" },
    tentacle_anus: { giver: "TENTACLE", receiver: "ANUS" },
    tentacle_mouth: { giver: "TENTACLE", receiver: "MOUTH" },
    tentacle_nipple: { giver: "TENTACLE", receiver: "NIPPLE" },
    clit_vagina: { giver: "CLIT", receiver: "VAGINA" },
    clit_clit: { giver: "CLIT", receiver: "CLIT" },
    clit_mouth: { giver: "CLIT", receiver: "MOUTH" },
    clit_anus: { giver: "CLIT", receiver: "ANUS" },
    clit_nipple: { giver: "CLIT", receiver: "NIPPLE" },
    penis_armpit: { giver: "PENIS", receiver: "ARMPIT" },
    tongue_armpit: { giver: "TONGUE", receiver: "ARMPIT" },
    penis_urethra_vagina: { giver: "PENIS", receiver: "URETHRA" },
    penis_urethra_penis: { giver: "PENIS", receiver: "URETHRA" },
    toy_vagina: { giver: "TOY", receiver: "VAGINA" },
    toy_anus: { giver: "TOY", receiver: "ANUS" },
    self_tail_vagina: { giver: "TAIL", receiver: "VAGINA" },
    self_tail_anus: { giver: "TAIL", receiver: "ANUS" },
    finger_clit: { giver: "FINGER", receiver: "CLIT" },
    finger_mouth: { giver: "FINGER", receiver: "MOUTH" },
    finger_finger: { giver: "FINGER", receiver: "FINGER" },
    tongue_breasts: { giver: "TONGUE", receiver: "BREASTS" },
    tongue_mound: { giver: "TONGUE", receiver: "MOUND" },
    foot_mouth: { giver: "FOOT", receiver: "MOUTH" },
    penis_spinneret: { giver: "PENIS", receiver: "SPINNERET" },
    tail_spinneret: { giver: "TAIL", receiver: "SPINNERET" },
    tentacle_spinneret: { giver: "TENTACLE", receiver: "SPINNERET" },
    finger_crotch_nipple: { giver: "FINGER", receiver: "CROTCH_NIPPLE" },
    penis_crotch_nipple: { giver: "PENIS", receiver: "CROTCH_NIPPLE" },
    tongue_crotch_nipple: { giver: "TONGUE", receiver: "CROTCH_NIPPLE" },
    self_penis_vagina: { giver: "PENIS", receiver: "VAGINA" },
    self_penis_anus: { giver: "PENIS", receiver: "ANUS" },
    self_penis_mouth: { giver: "PENIS", receiver: "MOUTH" },
    self_tongue_vagina: { giver: "TONGUE", receiver: "VAGINA" },
    self_tongue_anus: { giver: "TONGUE", receiver: "ANUS" },
    self_finger_mouth: { giver: "FINGER", receiver: "MOUTH" },
    self_tail_mouth: { giver: "TAIL", receiver: "MOUTH" },
    finger_breasts: { giver: "FINGER", receiver: "BREASTS" },
    self_finger_breasts: { giver: "FINGER", receiver: "BREASTS" },
    self_mound: { giver: "FINGER", receiver: "MOUND" },
    self_tongue_mouth: { giver: "TONGUE", receiver: "MOUTH" },
    self_tongue_nipple: { giver: "TONGUE", receiver: "NIPPLE" },
    self_tail_nipple: { giver: "TAIL", receiver: "NIPPLE" },
    self_penis_nipple: { giver: "PENIS", receiver: "NIPPLE" },
  };

  var PAIR_IDS = [
    "kiss",
    "finger_vagina",
    "finger_penis",
    "finger_anus",
    "finger_nipple",
    "cunnilingus",
    "blowjob",
    "anilingus",
    "penis_vagina",
    "penis_anus",
    "penis_nipple",
    "penis_breasts",
    "penis_thighs",
    "penis_ass",
    "penis_feet",
    "suckle",
    "tail_vagina",
    "tail_anus",
    "tail_mouth",
    "tail_nipple",
    "tentacle_vagina",
    "tentacle_anus",
    "tentacle_mouth",
    "tentacle_nipple",
    "clit_vagina",
    "clit_clit",
    "clit_mouth",
    "clit_anus",
    "clit_nipple",
    "penis_armpit",
    "tongue_armpit",
    "penis_urethra_vagina",
    "penis_urethra_penis",
    "toy_vagina",
    "toy_anus",
    "finger_clit",
    "finger_mouth",
    "finger_finger",
    "tongue_breasts",
    "tongue_mound",
    "foot_mouth",
    "penis_spinneret",
    "tail_spinneret",
    "tentacle_spinneret",
    "finger_crotch_nipple",
    "penis_crotch_nipple",
    "tongue_crotch_nipple",
    "finger_breasts",
  ];

  function allowPairs(block) {
    var out = {};
    var i;
    for (i = 0; i < PAIR_IDS.length; i++) out[PAIR_IDS[i]] = !(block && block[PAIR_IDS[i]]);
    return out;
  }

  var ORAL_ONLY = allowPairs({
    kiss: true,
    penis_vagina: true,
    penis_anus: true,
    penis_nipple: true,
    penis_breasts: true,
    penis_thighs: true,
    penis_ass: true,
    penis_feet: true,
    suckle: true,
    tail_vagina: true,
    tail_anus: true,
    tail_nipple: true,
    tentacle_vagina: true,
    tentacle_anus: true,
    tentacle_nipple: true,
    clit_vagina: true,
    clit_clit: true,
    clit_anus: true,
    clit_nipple: true,
    penis_armpit: true,
    tongue_armpit: true,
    penis_urethra_vagina: true,
    penis_urethra_penis: true,
    toy_vagina: true,
    toy_anus: true,
    penis_spinneret: true,
    tail_spinneret: true,
    tentacle_spinneret: true,
    finger_crotch_nipple: true,
    penis_crotch_nipple: true,
    tongue_crotch_nipple: true,
  });
  var BEHIND = allowPairs({
    kiss: true,
    blowjob: true,
    cunnilingus: true,
    suckle: true,
    penis_breasts: true,
    penis_feet: true,
    finger_nipple: true,
    tail_mouth: true,
    tentacle_mouth: true,
    clit_mouth: true,
    clit_clit: true,
    clit_nipple: true,
    penis_armpit: true,
    tongue_armpit: true,
    penis_urethra_penis: true,
    finger_mouth: true,
    tongue_breasts: true,
    tongue_mound: true,
    foot_mouth: true,
    finger_finger: true,
  });
  var FACE_TO_FACE = allowPairs({});

  var SEX_POSITIONS = {
    Standing: {
      id: "standing",
      playerSlot: "standing_dom",
      partnerSlot: "standing_sub",
      allow: FACE_TO_FACE,
    },
    "Face to wall": {
      id: "face_to_wall",
      playerSlot: "wall_dom",
      partnerSlot: "wall_facing",
      allow: BEHIND,
    },
    "All fours": {
      id: "all_fours",
      playerSlot: "doggy_dom",
      partnerSlot: "doggy_all_fours",
      allow: BEHIND,
    },
    "Lying down": {
      id: "lying_down",
      playerSlot: "missionary_kneeling",
      partnerSlot: "missionary_back",
      allow: FACE_TO_FACE,
    },
    "Sixty-nine": {
      id: "sixty_nine",
      playerSlot: "sixty_nine_top",
      partnerSlot: "sixty_nine_bottom",
      allow: ORAL_ONLY,
    },
    "Sixty-nine (bottom)": {
      id: "sixty_nine_bottom",
      playerSlot: "sixty_nine_bottom",
      partnerSlot: "sixty_nine_top",
      allow: ORAL_ONLY,
    },
    Cowgirl: {
      id: "cowgirl",
      playerSlot: "cowgirl_riding",
      partnerSlot: "cowgirl_back",
      allow: allowPairs({ cunnilingus: true, blowjob: true, anilingus: true, penis_feet: true, clit_mouth: true, tail_mouth: true, tentacle_mouth: true, tongue_armpit: true }),
    },
    "Cowgirl (bottom)": {
      id: "cowgirl_bottom",
      playerSlot: "cowgirl_back",
      partnerSlot: "cowgirl_riding",
      allow: allowPairs({ cunnilingus: true, blowjob: true, anilingus: true, penis_feet: true, clit_mouth: true, tail_mouth: true, tentacle_mouth: true, tongue_armpit: true }),
    },
    "Sit on face": {
      id: "sit_on_face",
      playerSlot: "facesit_top",
      partnerSlot: "facesit_back",
      allow: ORAL_ONLY,
    },
    "Face sitting": {
      id: "face_sitting",
      playerSlot: "facesit_back",
      partnerSlot: "facesit_top",
      allow: ORAL_ONLY,
    },
    "Mating press": {
      id: "mating_press",
      playerSlot: "press_dom",
      partnerSlot: "press_back",
      allow: FACE_TO_FACE,
    },
    Sitting: {
      id: "sitting",
      playerSlot: "sitting",
      partnerSlot: "kneeling_oral",
      allow: allowPairs({
        penis_vagina: true,
        penis_anus: true,
        penis_nipple: true,
        penis_breasts: true,
        penis_thighs: true,
        penis_ass: true,
        penis_feet: true,
        tail_vagina: true,
        tail_anus: true,
        tentacle_vagina: true,
        tentacle_anus: true,
        clit_vagina: true,
        clit_clit: true,
        penis_urethra_vagina: true,
        penis_urethra_penis: true,
        toy_vagina: true,
        toy_anus: true,
      }),
    },
    "Receive oral": {
      id: "receive_oral",
      playerSlot: "standing_receive_oral",
      partnerSlot: "kneeling_giving_oral",
      allow: ORAL_ONLY,
    },
    "Perform oral": {
      id: "perform_oral",
      playerSlot: "kneeling_giving_oral",
      partnerSlot: "standing_receive_oral",
      allow: ORAL_ONLY,
    },
  };

  (function attachSlotGraphs() {
    var name;
    for (name in SEX_POSITIONS) {
      if (!Object.prototype.hasOwnProperty.call(SEX_POSITIONS, name)) continue;
      var pos = SEX_POSITIONS[name];
      if (!pos.extraSlots) pos.extraSlots = [pos.partnerSlot + "_2"];
      if (pos.slotAllow) continue;
      pos.slotAllow = {};
      pos.slotAllow[pos.playerSlot] = {};
      pos.slotAllow[pos.playerSlot][pos.partnerSlot] = pos.allow;
      pos.slotAllow[pos.playerSlot][pos.extraSlots[0]] = pos.allow;
      pos.slotAllow[pos.partnerSlot] = {};
      pos.slotAllow[pos.partnerSlot][pos.playerSlot] = pos.allow;
      pos.slotAllow[pos.partnerSlot][pos.extraSlots[0]] = pos.allow;
      pos.slotAllow[pos.extraSlots[0]] = {};
      pos.slotAllow[pos.extraSlots[0]][pos.playerSlot] = pos.allow;
      pos.slotAllow[pos.extraSlots[0]][pos.partnerSlot] = pos.allow;
    }
    SEX_POSITIONS.Standing.extraSlots = ["standing_sub_2", "standing_behind"];
    SEX_POSITIONS.Standing.slotAllow = {
      standing_dom: { standing_sub: FACE_TO_FACE, standing_sub_2: FACE_TO_FACE },
      standing_sub: { standing_dom: FACE_TO_FACE, standing_sub_2: FACE_TO_FACE },
      standing_sub_2: { standing_dom: FACE_TO_FACE, standing_sub: FACE_TO_FACE },
      standing_behind: { standing_sub: BEHIND },
    };
    SEX_POSITIONS["All fours"].extraSlots = ["doggy_head"];
    SEX_POSITIONS["All fours"].slotAllow = {
      doggy_dom: { doggy_all_fours: BEHIND, doggy_all_fours_2: BEHIND },
      doggy_all_fours: { doggy_dom: BEHIND, doggy_head: ORAL_ONLY, doggy_all_fours_2: FACE_TO_FACE },
      doggy_all_fours_2: { doggy_dom: BEHIND, doggy_all_fours: FACE_TO_FACE },
      doggy_head: { doggy_all_fours: ORAL_ONLY },
    };
    SEX_POSITIONS["Lying down"].extraSlots = ["missionary_head"];
    SEX_POSITIONS["Lying down"].slotAllow = {
      missionary_kneeling: { missionary_back: FACE_TO_FACE },
      missionary_back: { missionary_kneeling: FACE_TO_FACE, missionary_head: ORAL_ONLY },
      missionary_head: { missionary_back: ORAL_ONLY },
    };
  })();

  SEX_POSITIONS["Under desk"] = {
    id: "under_desk",
    playerSlot: "ralph_sub",
    partnerSlot: "ralph_dom",
    extraSlots: [],
    allow: ORAL_ONLY,
    slotAllow: {
      ralph_sub: { ralph_dom: ORAL_ONLY },
      ralph_dom: { ralph_sub: ORAL_ONLY },
    },
  };
  SEX_POSITIONS["Shower sex"] = {
    id: "shower_sex",
    playerSlot: "shower_wall",
    partnerSlot: "shower_behind",
    extraSlots: [],
    allow: BEHIND,
    slotAllow: {
      shower_behind: { shower_wall: BEHIND },
      shower_wall: { shower_behind: BEHIND },
    },
  };
  SEX_POSITIONS.Stocks = {
    id: "stocks",
    playerSlot: "stocks_behind",
    partnerSlot: "stocks_locked",
    extraSlots: ["stocks_oral"],
    allow: BEHIND,
    slotAllow: {
      stocks_behind: { stocks_locked: BEHIND },
      stocks_locked: { stocks_behind: BEHIND, stocks_oral: ORAL_ONLY },
      stocks_oral: { stocks_locked: ORAL_ONLY },
    },
  };
  SEX_POSITIONS["Glory hole"] = {
    id: "glory_hole",
    playerSlot: "glory_kneeling",
    partnerSlot: "glory_receiving",
    extraSlots: ["glory_receiving_2"],
    allow: ORAL_ONLY,
    slotAllow: {
      glory_kneeling: { glory_receiving: ORAL_ONLY, glory_receiving_2: ORAL_ONLY },
      glory_receiving: { glory_kneeling: ORAL_ONLY },
      glory_receiving_2: { glory_kneeling: ORAL_ONLY },
    },
  };
  SEX_POSITIONS["Milking stall"] = {
    id: "milking_stall",
    playerSlot: "stall_behind",
    partnerSlot: "stall_locked",
    extraSlots: [],
    allow: BEHIND,
    slotAllow: {
      stall_behind: { stall_locked: BEHIND },
      stall_locked: { stall_behind: BEHIND },
    },
  };
  SEX_POSITIONS["Over desk"] = {
    id: "over_desk",
    playerSlot: "desk_dom",
    partnerSlot: "desk_over",
    extraSlots: ["desk_oral"],
    allow: BEHIND,
    slotAllow: {
      desk_dom: { desk_over: BEHIND },
      desk_over: { desk_dom: BEHIND, desk_oral: ORAL_ONLY },
      desk_oral: { desk_over: ORAL_ONLY },
    },
  };

  var SELF_ONLY = allowPairs(
    PAIR_IDS.reduce(function (block, id) {
      block[id] = true;
      return block;
    }, {}),
  );
  var BREEDING = allowPairs({
    kiss: true,
    blowjob: true,
    cunnilingus: true,
    anilingus: true,
    suckle: true,
    penis_breasts: true,
    penis_feet: true,
    finger_nipple: true,
    tail_mouth: true,
    tentacle_mouth: true,
    clit_mouth: true,
    clit_clit: true,
    clit_nipple: true,
    penis_armpit: true,
    tongue_armpit: true,
    finger_mouth: true,
    tongue_breasts: true,
    tongue_mound: true,
    foot_mouth: true,
    finger_finger: true,
  });
  var GLORY_SEX = allowPairs({
    kiss: true,
    blowjob: true,
    cunnilingus: true,
    anilingus: true,
    suckle: true,
    penis_breasts: true,
    penis_feet: true,
    penis_thighs: true,
    penis_ass: true,
    finger_nipple: true,
    tail_mouth: true,
    tentacle_mouth: true,
    clit_mouth: true,
    clit_clit: true,
    clit_nipple: true,
    penis_armpit: true,
    tongue_armpit: true,
    finger_mouth: true,
    tongue_breasts: true,
    tongue_mound: true,
    foot_mouth: true,
    finger_finger: true,
  });

  SEX_POSITIONS.Masturbation = {
    id: "masturbation",
    playerSlot: "masturbation_standing",
    partnerSlot: "masturbation_standing",
    extraSlots: [],
    allow: SELF_ONLY,
    masturbation: true,
    slotAllow: {
      masturbation_standing: { masturbation_standing: SELF_ONLY },
    },
  };
  SEX_POSITIONS["Masturbation (sitting)"] = {
    id: "masturbation_sitting",
    playerSlot: "masturbation_sitting",
    partnerSlot: "masturbation_sitting",
    extraSlots: [],
    allow: SELF_ONLY,
    masturbation: true,
    slotAllow: {
      masturbation_sitting: { masturbation_sitting: SELF_ONLY },
    },
  };
  SEX_POSITIONS["Masturbation (kneeling)"] = {
    id: "masturbation_kneeling",
    playerSlot: "masturbation_kneeling",
    partnerSlot: "masturbation_kneeling",
    extraSlots: [],
    allow: SELF_ONLY,
    masturbation: true,
    slotAllow: {
      masturbation_kneeling: { masturbation_kneeling: SELF_ONLY },
    },
  };
  SEX_POSITIONS["Masturbation (panties)"] = {
    id: "masturbation_panties",
    playerSlot: "masturbation_panties",
    partnerSlot: "masturbation_panties",
    extraSlots: [],
    allow: SELF_ONLY,
    masturbation: true,
    slotAllow: {
      masturbation_panties: { masturbation_panties: SELF_ONLY },
    },
  };
  SEX_POSITIONS["Breeding stall"] = {
    id: "breeding_stall",
    playerSlot: "breeding_back",
    partnerSlot: "breeding_fucking",
    extraSlots: [],
    allow: BREEDING,
    slotAllow: {
      breeding_fucking: { breeding_front: BREEDING, breeding_back: BREEDING },
      breeding_front: { breeding_fucking: BREEDING },
      breeding_back: { breeding_fucking: BREEDING },
    },
  };
  SEX_POSITIONS["Glory hole sex"] = {
    id: "glory_hole_sex",
    playerSlot: "glory_fucked",
    partnerSlot: "glory_fucking",
    extraSlots: ["glory_receiving"],
    allow: GLORY_SEX,
    slotAllow: {
      glory_fucked: { glory_fucking: GLORY_SEX, glory_receiving: ORAL_ONLY },
      glory_anal_fucked: { glory_fucking: BEHIND, glory_receiving: ORAL_ONLY },
      glory_fucking: { glory_fucked: GLORY_SEX, glory_anal_fucked: BEHIND },
      glory_receiving: { glory_fucked: ORAL_ONLY, glory_anal_fucked: ORAL_ONLY },
    },
  };

  var HANDS_ONLY = {};
  var handI;
  for (handI = 0; handI < PAIR_IDS.length; handI++) HANDS_ONLY[PAIR_IDS[handI]] = false;
  HANDS_ONLY.finger_mouth = true;
  HANDS_ONLY.finger_finger = true;
  SEX_POSITIONS["Hand-holding"] = {
    id: "hand_holding",
    playerSlot: "hand_sex_dom",
    partnerSlot: "hand_sex_sub",
    extraSlots: [],
    allow: HANDS_ONLY,
    slotAllow: {
      hand_sex_dom: { hand_sex_sub: HANDS_ONLY },
      hand_sex_sub: { hand_sex_dom: HANDS_ONLY },
    },
  };
  SEX_POSITIONS["Sitting (in lap)"] = {
    id: "sitting_in_lap",
    playerSlot: "sitting",
    partnerSlot: "sitting_in_lap",
    extraSlots: [],
    allow: FACE_TO_FACE,
    slotAllow: {
      sitting: { sitting_in_lap: FACE_TO_FACE },
      sitting_in_lap: { sitting: FACE_TO_FACE },
    },
  };

  var CUM_SELF = ["SELF_GROIN", "SELF_STOMACH", "SELF_LEGS", "SELF_FEET", "SELF_BREASTS", "SELF_HANDS", "SELF_FACE", "FLOOR"];
  var CUM_FRONT = CUM_SELF.concat(["FACE", "HAIR", "BREASTS", "STOMACH", "GROIN", "ASS", "LEGS", "FEET", "ARMPITS"]);
  var CUM_BEHIND = CUM_SELF.concat(["WALL", "BACK", "ASS", "GROIN", "LEGS", "FEET"]);
  var CUM_ORAL = CUM_SELF.concat(["FACE", "HAIR", "BREASTS", "STOMACH", "ARMPITS"]);
  (function assignCumTargets() {
    var name;
    var oral = {
      "Sixty-nine": 1,
      "Sixty-nine (bottom)": 1,
      "Sit on face": 1,
      "Face sitting": 1,
      "Receive oral": 1,
      "Perform oral": 1,
      "Under desk": 1,
      "Glory hole": 1,
    };
    var behind = {
      "Face to wall": 1,
      "All fours": 1,
      "Over desk": 1,
      Stocks: 1,
      "Milking stall": 1,
      "Shower sex": 1,
      "Breeding stall": 1,
      "Glory hole sex": 1,
    };
    var selfCum = {
      Masturbation: 1,
      "Masturbation (sitting)": 1,
      "Masturbation (kneeling)": 1,
      "Masturbation (panties)": 1,
    };
    for (name in SEX_POSITIONS) {
      if (!Object.prototype.hasOwnProperty.call(SEX_POSITIONS, name)) continue;
      if (selfCum[name]) SEX_POSITIONS[name].cumTargets = CUM_SELF;
      else if (oral[name]) SEX_POSITIONS[name].cumTargets = CUM_ORAL;
      else if (behind[name]) SEX_POSITIONS[name].cumTargets = CUM_BEHIND;
      else SEX_POSITIONS[name].cumTargets = CUM_FRONT;
    }
  })();

  LT.SEX_MANAGERS = {
    generic: { id: "generic" },
    ralph_desk: {
      id: "ralph_desk",
      positionName: "Under desk",
      playerDom: false,
      canStop: false,
      lockPosition: true,
      preventOthersClothing: true,
      preferStarts: ["blowjob_receive_start"],
    },
    pix_shower: {
      id: "pix_shower",
      positionName: "Shower sex",
      playerDom: false,
      canStop: false,
      lockPosition: true,
      startNaked: true,
      washing: true,
    },
    stocks: {
      id: "stocks",
      positionName: "Stocks",
      lockPosition: true,
      lockedControl: 0,
      slotsByLead: {
        dom: { player: "stocks_behind", partner: "stocks_locked" },
        sub: { player: "stocks_locked", partner: "stocks_behind" },
      },
    },
    glory_hole: {
      id: "glory_hole",
      positionName: "Glory hole",
      lockPosition: true,
      preventOthersClothing: true,
      slotsByLead: {
        dom: { player: "glory_receiving", partner: "glory_kneeling" },
        sub: { player: "glory_kneeling", partner: "glory_receiving" },
      },
    },
    milking_stall: {
      id: "milking_stall",
      positionName: "Milking stall",
      lockPosition: true,
      lockedControl: 0,
      slotsByLead: {
        dom: { player: "stall_behind", partner: "stall_locked" },
        sub: { player: "stall_locked", partner: "stall_behind" },
      },
    },
    brax_doggy: {
      id: "brax_doggy",
      positionName: "All fours",
      lockPosition: true,
      playerSlot: "doggy_all_fours",
      partnerSlot: "doggy_dom",
    },
    amber_doggy: {
      id: "amber_doggy",
      positionName: "All fours",
      lockPosition: true,
      playerSlot: "doggy_all_fours",
      partnerSlot: "doggy_dom",
    },
    bunny_loppy: {
      id: "bunny_loppy",
      positionName: "All fours",
      playerDom: true,
      playerSlot: "doggy_dom",
      partnerSlot: "doggy_all_fours",
      extraSlots: ["doggy_all_fours_2"],
    },
    masturbation: {
      id: "masturbation",
      positionName: "Masturbation",
      masturbation: true,
      playerDom: true,
    },
    masturbation_panties: {
      id: "masturbation_panties",
      positionName: "Masturbation (panties)",
      masturbation: true,
      usingLilayaPanties: true,
      playerDom: true,
    },
    breeding_stall: {
      id: "breeding_stall",
      positionName: "Breeding stall",
      lockPosition: true,
      preferStarts: ["penis_vagina_start", "penis_vagina_receive_start"],
      slotsByLead: {
        dom: { player: "breeding_fucking", partner: "breeding_back" },
        sub: { player: "breeding_back", partner: "breeding_fucking" },
      },
    },
    glory_hole_sex: {
      id: "glory_hole_sex",
      positionName: "Glory hole sex",
      lockPosition: true,
      preventOthersClothing: true,
      slotsByLead: {
        dom: { player: "glory_fucking", partner: "glory_fucked" },
        sub: { player: "glory_fucked", partner: "glory_fucking" },
      },
    },
    rose_hands: {
      id: "rose_hands",
      positionName: "Hand-holding",
      playerDom: true,
      lockPosition: true,
      preventOthersClothing: true,
      playerSlot: "hand_sex_dom",
      partnerSlot: "hand_sex_sub",
    },
    lilaya_lab: {
      id: "lilaya_lab",
      positionName: "Sitting (in lap)",
      playerDom: true,
      playerSlot: "sitting",
      partnerSlot: "sitting_in_lap",
    },
    vicky_desk: {
      id: "vicky_desk",
      canStop: false,
      lockPosition: true,
    },
    vicky_over_desk: {
      id: "vicky_over_desk",
      positionName: "Over desk",
      canStop: false,
      lockPosition: true,
    },
    scarlett_oral: {
      id: "scarlett_oral",
      positionName: "Perform oral",
      playerDom: false,
      canStop: false,
      lockPosition: true,
      preventOthersClothing: true,
      lockedControl: 2,
      preferStarts: ["blowjob_receive_start", "cunnilingus_receive_start"],
    },
  };
  LT.SEX_POSITIONS = SEX_POSITIONS;

  function pairAreas(id) {
    return PAIR_AREAS[id] || { giver: "FINGER", receiver: "VAGINA" };
  }

  function areaCap(area) {
    return AREA_CAP[area] || 1;
  }

  function eachOccupied(link, fn) {
    if (!link) return;
    fn(link.giver, link.giverArea);
    fn(link.receiver, link.receiverArea);
    var extra = link.extra || [];
    var i;
    for (i = 0; i < extra.length; i++) {
      fn(link.giver, extra[i][0]);
      fn(link.receiver, extra[i][1]);
    }
  }

  function countUsed(ch, area, skip) {
    var n = 0;
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      if (skip && links[i] === skip) continue;
      eachOccupied(links[i], function (who, used) {
        if (who === ch && used === area) n += 1;
      });
    }
    return n;
  }

  function areasFree(giver, receiver, id) {
    var spec = pairAreas(id);
    if (countUsed(giver, spec.giver) >= areaCap(spec.giver)) return false;
    if (countUsed(receiver, spec.receiver) >= areaCap(spec.receiver)) return false;
    var extra = spec.extra || [];
    var i;
    for (i = 0; i < extra.length; i++) {
      if (countUsed(giver, extra[i][0]) >= areaCap(extra[i][0])) return false;
      if (countUsed(receiver, extra[i][1]) >= areaCap(extra[i][1])) return false;
    }
    return true;
  }

  function findLink(id, pred) {
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      if (links[i].id === id && (!pred || pred(links[i]))) return links[i];
    }
    return null;
  }

  function isKnotLocked(link) {
    var k = LT.sex.knotted;
    if (!k || !k.locked || !link) return false;
    return link.giver === k.giver && link.giverArea === "PENIS" && link.receiver === k.receiver;
  }

  function removeLink(link, force) {
    if (!link || !LT.sex.links) return false;
    if (!force && isKnotLocked(link)) return false;
    var next = [];
    var i;
    for (i = 0; i < LT.sex.links.length; i++) {
      if (LT.sex.links[i] !== link) next.push(LT.sex.links[i]);
    }
    LT.sex.links = next;
    LT.sex._stoppedThisTurn = link.id;
    if (LT.sex.lastPlayerPair === link.id && !findLink(link.id)) LT.sex.lastPlayerPair = "";
    return true;
  }

  function stopFirstUsing(ch, area) {
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      var hit = false;
      eachOccupied(links[i], function (who, used) {
        if (who === ch && used === area) hit = true;
      });
      if (hit) {
        if (isKnotLocked(links[i])) continue;
        removeLink(links[i]);
        return true;
      }
    }
    return false;
  }

  function freeAreasFor(giver, receiver, id) {
    var spec = pairAreas(id);
    var need = [[giver, spec.giver], [receiver, spec.receiver]];
    var extra = spec.extra || [];
    var i;
    for (i = 0; i < extra.length; i++) {
      need.push([giver, extra[i][0]]);
      need.push([receiver, extra[i][1]]);
    }
    for (i = 0; i < need.length; i++) {
      while (countUsed(need[i][0], need[i][1]) >= areaCap(need[i][1])) {
        if (!stopFirstUsing(need[i][0], need[i][1])) break;
      }
    }
  }

  Object.defineProperty(LT.sex, "ongoing", {
    configurable: true,
    enumerable: true,
    get: function () {
      var links = this.links || [];
      if (!links.length) return null;
      if (this.lastPlayerPair) {
        var pref = findLink(this.lastPlayerPair);
        if (pref) return pref;
      }
      return links[links.length - 1];
    },
    set: function (value) {
      if (!value) {
        this.links = [];
        this.lastPlayerPair = "";
        return;
      }
      this.links = this.links || [];
      var i;
      for (i = 0; i < this.links.length; i++) {
        if (this.links[i].id === value.id && this.links[i].giver === value.giver && this.links[i].receiver === value.receiver) {
          this.links[i] = value;
          return;
        }
      }
      this.links.push(value);
    },
  });

  LT.sex.start = function (opts) {
    opts = opts || {};
    var player = LT.game.player;
    var partner = opts.partner;
    var mgrIdEarly = opts.manager || "generic";
    var mgrEarly = (LT.SEX_MANAGERS && LT.SEX_MANAGERS[mgrIdEarly]) || {};
    var solo = !!(opts.masturbation || mgrEarly.masturbation);
    if (!player || (!partner && !solo)) return;
    var extras = [];
    if (opts.partners) extras = extras.concat(opts.partners);
    if (opts.extraPartners) extras = extras.concat(opts.extraPartners);
    var partners = [];
    var seen = {};
    var addPartner = function (ch, fallbackId) {
      if (!ch || ch === player) return;
      if (!ch.id) ch.id = fallbackId;
      var key = charKey(ch);
      if (seen[key]) return;
      seen[key] = true;
      partners.push(ch);
    };
    addPartner(partner, "sexPartner");
    var ei;
    for (ei = 0; ei < extras.length; ei++) addPartner(extras[ei], "sexPartner" + (ei + 2));
    var specList = [].concat(opts.spectators || [], opts.watchers || []);
    var spectators = [];
    var si;
    for (si = 0; si < specList.length; si++) {
      if (!specList[si] || specList[si] === player) continue;
      if (!specList[si].id) specList[si].id = "sexSpectator" + (si + 1);
      spectators.push(specList[si]);
    }
    var everyone = [player].concat(partners).concat(spectators);
    var i;
    for (i = 0; i < everyone.length; i++) {
      ensureSexState(everyone[i]);
      everyone[i].arousal = 0;
      everyone[i].orgasmedThisSex = 0;
      everyone[i].sexExposed = { MOUTH: true, BREASTS: false, PENIS: false, VAGINA: false, ANUS: false, FOOT: false };
    }
    this.active = true;
    this.turn = 0;
    this.player = player;
    this.masturbation = solo || partners.length === 0;
    this.partner = partners[0] || (this.masturbation ? player : null);
    var mgrId = opts.manager || "generic";
    var mgr = (LT.SEX_MANAGERS && LT.SEX_MANAGERS[mgrId]) || {};
    if (opts.playerDom == null && mgr.playerDom != null) opts.playerDom = mgr.playerDom;
    if (!opts.positionName && mgr.positionName) opts.positionName = mgr.positionName;
    if (this.masturbation && !opts.positionName && !mgr.positionName) opts.positionName = "Masturbation";
    this.playerDom = opts.playerDom !== false;
    this.consensual = opts.consensual !== false;
    this.manager = mgrId;
    this.managerSpec = mgr;
    this.positionName = opts.positionName || "Standing";
    this.postSexNode = opts.postSexNode || null;
    this.preventClothing = false;
    this.preventPenetration = false;
    this.preventPositioning = false;
    this.preventSelf = false;
    this.managerCanStop = true;
    this.publicSex = !!(opts.publicSex || mgr.publicSex);
    this.playerSpectator = !!(opts.playerSpectator || mgr.playerSpectator);
    this.spectators = spectators;
    this.bannedAreas = {};
    this.forcePace = {};
    this.forceControl = {};
    this.subHasEqualControl = this.consensual;
    this.lastNpcPositionTurn = -3;
    this.participants = everyone;
    this.partners = partners;
    this.slots = {};
    this.targets = {};
    rebuildRoleLists();
    setPosition(this.positionName);
    if (this.masturbation) setTarget(player, player);
    else setTarget(player, partners[0]);
    for (i = 0; i < partners.length; i++) setTarget(partners[i], player);
    if (this.playerSpectator) {
      this.slots[charKey(player)] = "watching";
      this.playerSlot = "watching";
    }
    for (i = 0; i < spectators.length; i++) {
      this.slots[charKey(spectators[i])] = "watching";
      setTarget(spectators[i], partners[0] || player);
    }
    LT.game.npcs = LT.game.npcs || {};
    var loc = player.location;
    for (i = 0; i < partners.length; i++) {
      if (!LT.game.npcs[partners[i].id]) LT.game.npcs[partners[i].id] = partners[i];
      if (loc && loc.world) {
        partners[i].location = { world: loc.world, place: loc.place, x: loc.x, y: loc.y };
      }
    }
    LT.game.npcs.sexPartner = partners[0];
    this.startText = opts.startText
      ? (typeof LT.withParseTargets === "function"
          ? LT.withParseTargets({ npc: this.partner || player, npc2: player, pc: player }, function () {
              return LT.parse(opts.startText);
            })
          : opts.startText)
      : this.masturbation
        ? "Deciding to take care of [npc.her] needs, [npc.name] [npc.verb(prepare)] to masturbate."
        : "";
    if (this.masturbation && !opts.startText && typeof LT.parse === "function") {
      this.startText = typeof LT.withParseTargets === "function"
        ? LT.withParseTargets({ npc: player, npc2: player, pc: player }, function () {
            return LT.parse("Deciding to take care of [npc.her] needs, [npc.name] [npc.verb(prepare)] to masturbate.");
          })
        : this.startText;
    }
    this.lastResolution = this.startText;
    this.links = [];
    this.lastPlayerPair = "";
    this.knotted = null;
    this.preparedFor = [];
    this.requestedCreampie = false;
    this.requestedKnot = false;
    this.requestedPullout = false;
    this.pulloutRequesters = {};
    this.flags = {};
    this.usingLilayaPanties = !!(opts.usingLilayaPanties || mgr.usingLilayaPanties);
    this.sexTypeCount = {};
    this.lastCumTarget = "";
    this.lastCondomFailure = "NONE";
    this.wetAreas = {};
    this.areasCurrentlyStretching = {};
    this.areasTooLoose = {};
    this.areasStretched = {};
    this.finished = false;
    this.onEnd = opts.onEnd || null;
    this.responseTab = 0;
    this.clothingMenu = false;
    for (i = 0; i < everyone.length; i++) {
      dressForSex(everyone[i]);
      if (typeof LT.ensureBody === "function") LT.ensureBody(everyone[i]);
    }
    if (opts.playerPace) setSexPace(player, opts.playerPace);
    if (opts.partnerPace) setSexPace(partners[0], opts.partnerPace);
    applyStartingPaceStats(player, getSexPace(player), !!opts.playerPace);
    applyStartingPaceStats(partners[0], getSexPace(partners[0]), !!opts.partnerPace);
    applyManagerSpec(mgr, opts);
    this.deskName = opts.deskName || (mgr && mgr.deskName) || "desk";
    this.floorName = opts.floorName || (mgr && mgr.floorName) || "floor";
    calculateWetAreas(true);
    this.logHtml = "";
    this._turnBlocks = [];
  };

  function pairKissing(a, b) {
    if (!a) a = LT.sex.player;
    if (!b) b = LT.sex.partner;
    return !!findLink("kiss", function (l) {
      return (l.giver === a && l.receiver === b) || (l.giver === b && l.receiver === a);
    });
  }

  LT.sex.isKissing = function (a, b) {
    return pairKissing(a, b);
  };

  LT.sex.listOngoing = function () {
    return (this.links || []).slice();
  };

  LT.sex.areasFree = areasFree;
  LT.sex.countUsed = countUsed;

  LT.sex.canStop = function () {
    if (!this.active || this.finished) return false;
    if (this.managerCanStop === false) return false;
    if (this.consensual) return true;
    var parts = this.participants || [this.player, this.partner];
    var i;
    var n = 0;
    for (i = 0; i < parts.length; i++) n += (parts[i] && parts[i].orgasmedThisSex) || 0;
    return n > 0;
  };

  LT.sex.canSkip = function () {
    if (!this.active || this.finished) return false;
    if (this.masturbation) return false;
    if (this.managerSpec && this.managerSpec.canSkip === false) return false;
    if (this.managerSpec && this.managerSpec.canStop === false) return false;
    return this.consensual || this.canStop();
  };

  LT.sex.isSpectator = isSpectator;

  function register(def) {
    LT.SEX_ACTIONS[def.id] = def;
  }

  function sexContentAllowed(act) {
    if (!act) return false;
    if (act.type === "STOP_ONGOING" || act.type === "ONGOING") return true;
    var tag = act.content || act.pair || act.id || "";
    if (/anal|finger_anus|anilingus|tail_anus|tentacle_anus|clit_anus|toy_anus/i.test(tag) && typeof LT.isAnalContentEnabled === "function" && !LT.isAnalContentEnabled()) return false;
    if (/foot/i.test(tag) && typeof LT.isFootContentEnabled === "function" && !LT.isFootContentEnabled()) return false;
    if (/nipple_pen|penis_nipple|finger_nipple|tail_nipple|tentacle_nipple|clit_nipple/i.test(tag) && typeof LT.isNipplePenContentEnabled === "function" && !LT.isNipplePenContentEnabled()) return false;
    if (/armpit/i.test(tag) && typeof LT.isArmpitContentEnabled === "function" && !LT.isArmpitContentEnabled()) return false;
    if (/urethra/i.test(tag) && typeof LT.isUrethralContentEnabled === "function" && !LT.isUrethralContentEnabled()) return false;
    if (/crotch_nipple/i.test(tag) && typeof LT.isNipplePenContentEnabled === "function" && !LT.isNipplePenContentEnabled()) return false;
    return true;
  }

  LT.SEX_ACTIONS = {};

  register({
    id: "kiss_start",
    name: "Start kissing",
    tab: 0,
    type: "START_ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      return !pairKissing(src, tgt) && areasFree(src, tgt, "kiss") && pairLegal("kiss", src, tgt);
    },
    tooltip: function (src, tgt) {
      return parseSex("Press your [npc.lips] against [npc2.namePos] mouth and start making out with [npc2.herHim].", src, tgt);
    },
    perform: function (src, tgt) {
      setOngoing("kiss", src, tgt, "kissing");
      return parseSex(pickPaceLines(KISS_START_LINES, KISS_START_PACE, src), src, tgt);
    },
  });

  register({
    id: "kiss",
    name: "Kiss",
    tab: 0,
    type: "ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      return pairKissing(src, tgt);
    },
    tooltip: function (src, tgt) {
      return parseSex("Continue kissing [npc2.name].", src, tgt);
    },
    perform: function (src, tgt) {
      return parseSex(pickPaceLines(KISS_ON_LINES, KISS_ON_PACE, src), src, tgt);
    },
  });

  register({
    id: "kiss_stop",
    name: "Stop kissing",
    tab: 0,
    type: "STOP_ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      return pairKissing(src, tgt);
    },
    tooltip: function (src, tgt) {
      return parseSex("Pull away from [npc2.name] and stop kissing [npc2.herHim].", src, tgt);
    },
    perform: function (src, tgt) {
      var link = findLink("kiss", function (l) {
        return (l.giver === src && l.receiver === tgt) || (l.giver === tgt && l.receiver === src);
      }) || findLink("kiss");
      if (link) removeLink(link);
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
  function tailOf(ch) {
    return ch && ((ch.body && ch.body.tail) || ch.tail);
  }
  function hasTail(ch) {
    if (!ch) return false;
    if (typeof ch.hasTail === "function") return !!ch.hasTail();
    var t = tailOf(ch);
    return !!(t && t.type && t.type !== "NONE");
  }
  function hasTentacle(ch) {
    if (!ch) return false;
    if (typeof ch.hasTentacle === "function") return !!ch.hasTentacle();
    var t = ch.body && ch.body.tentacle ? ch.body.tentacle : ch.tentacle;
    return !!(t && t.type && t.type !== "NONE" && (t.count || 0) > 0);
  }
  function hasFuckableUrethra(ch) {
    return !!(ch && ch.fuckableUrethra);
  }
  function hasSexToy(ch) {
    if (!ch) return false;
    if (ch.sexToy) return true;
    if (typeof LT.countItems !== "function") return false;
    return LT.countItems(ch, "innoxia_toy_dildo") > 0 || LT.countItems(ch, "innoxia_toy_vibrator") > 0;
  }
  function hasSpinneret(ch) {
    if (!ch) return false;
    if (typeof ch.hasSpinneret === "function") return !!ch.hasSpinneret();
    if (ch.spinneret) return true;
    var s = ch.body && ch.body.spinneret;
    return !!(s && (s.fuckable || s.type && s.type !== "NONE"));
  }
  function hasCrotchBoobs(ch) {
    if (!ch) return false;
    if (typeof ch.hasBreastsCrotch === "function") return !!ch.hasBreastsCrotch();
    if (ch.hasCrotchBoobs) return true;
    var b = ch.body && ch.body.breastCrotch;
    return !!(b && b.type && b.type !== "NONE" && (b.rows || 0) > 0);
  }
  function hasFuckableCrotchNipples(ch) {
    if (!hasCrotchBoobs(ch)) return false;
    if (ch.fuckableCrotchNipples) return true;
    var n = ch.body && ch.body.breastCrotch && ch.body.breastCrotch.nipple;
    return !!(n && n.fuckable);
  }
  function pickPaceLines(fallback, paceMap, src) {
    var pace = typeof getSexPace === "function" ? getSexPace(src) : "";
    if (paceMap && paceMap[pace] && paceMap[pace].length) return pick(paceMap[pace]);
    return pick(fallback);
  }
  var KISS_START_LINES = [
    "[npc.Name] [npc.verb(lean)] down, pressing [npc.her] [npc.lips+] against [npc2.namePos] mouth as [npc.she] [npc.verb(deliver)] a passionate kiss.",
    "With a grin, [npc.name] [npc.verb(lean)] down into [npc2.namePos] [npc2.breasts], breathing in [npc2.her] [npc2.scent] as [npc.she] [npc.verb(press)] [npc.her] [npc.lips+] against [npc2.hers].",
    "Leaning down, [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(press)] [npc.her] [npc.lips+] against [npc2.namePos] and [npc.she] [npc.verb(start)] to eagerly kiss [npc2.herHim].",
  ];
  var KISS_START_PACE = {
    DOM_GENTLE: ["Slowly leaning in, [npc.name] [npc.verb(press)] a soft, gentle kiss against [npc2.namePos] [npc2.lips]."],
    DOM_ROUGH: ["Grabbing [npc2.name], [npc.name] [npc.verb(crush)] [npc.her] [npc.lips+] against [npc2.hers] in a rough, dominant kiss."],
    SUB_EAGER: ["With a needy little [npc.moan], [npc.name] desperately [npc.verb(press)] [npc.her] [npc.lips+] to [npc2.namePos] mouth."],
    SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to twist away, but [npc2.namePos] mouth finds [npc.hers] and [npc.she] [npc.verb(let)] out a distressed [npc.sob]."],
  };
  var KISS_ON_LINES = [
    "Eagerly pressing [npc.her] [npc.lips+] against [npc2.nameHers], [npc.name] [npc.verb(plant)] a series of passionate kisses on [npc2.her] mouth.",
    "[npc.Name] eagerly [npc.verb(lean)] in against [npc2.name], breathing in [npc2.her] [npc2.scent+] as [npc.she] [npc.verb(plant)] a series of soft kisses on [npc2.her] [npc2.lips+].",
    "[npc.Name] eagerly [npc.verb(press)] against [npc2.namePos] [npc2.breasts+], before tilting [npc.her] head slightly to one side as [npc.she] passionately [npc.verb(kiss)] [npc2.her] [npc2.lips+].",
  ];
  var KISS_ON_PACE = {
    DOM_GENTLE: ["[npc.Name] slowly [npc.verb(kiss)] [npc2.name], keeping the contact soft and unhurried."],
    DOM_ROUGH: ["[npc.Name] roughly [npc.verb(claim)] [npc2.namePos] mouth, kissing [npc2.herHim] hard enough to bruise."],
    SUB_EAGER: ["[npc.Name] desperately [npc.verb(kiss)] back, moaning into [npc2.namePos] mouth."],
    SUB_RESISTING: ["[npc.Name] [npc.verb(whimper)] and [npc.verb(try)] to pull [npc.her] [npc.lips] away, struggling against the kiss."],
  };
  function pairOngoing(id) {
    return !!findLink(id);
  }
  function setOngoing(id, giver, receiver, label) {
    freeAreasFor(giver, receiver, id);
    var spec = pairAreas(id);
    var link = {
      id: id,
      giver: giver,
      receiver: receiver,
      label: label || id,
      giverArea: spec.giver,
      receiverArea: spec.receiver,
      extra: spec.extra || [],
      penetration: spec.giver,
      orifice: spec.receiver,
      performer: giver,
      target: receiver,
    };
    var existing = findLink(id, function (l) {
      return l.giver === giver && l.receiver === receiver;
    });
    if (existing) {
      if (isKnotLocked(existing)) return existing;
      removeLink(existing);
    }
    LT.sex.links = LT.sex.links || [];
    LT.sex.links.push(link);
    if (LT.sex._acting === LT.sex.player) LT.sex.lastPlayerPair = id;
    link.justStarted = true;
    transferLink(link);
    return link;
  }

  var LUBE_NAME = {
    SALIVA: "saliva",
    MILK: "milk",
    PRECUM: "precum",
    CUM: "cum",
    GIRLCUM: "girlcum",
    ANAL_LUBE: "anal lubricant",
    SLIME: "slime",
    WATER: "water",
    OTHER: "lubrication",
  };
  var AREA_LABEL = {
    VAGINA: "pussy",
    ANUS: "asshole",
    MOUTH: "mouth",
    TONGUE: "tongue",
    PENIS: "cock",
    NIPPLE: "nipple",
    CLIT: "clit",
    URETHRA: "urethra",
    BREASTS: "breasts",
    ASS: "ass",
    FOOT: "feet",
    THIGHS: "thighs",
    ARMPIT: "armpit",
    FINGER: "fingers",
    TAIL: "tail",
    TENTACLE: "tentacle",
    TOY: "toy",
  };
  var STRETCH_AREAS = { VAGINA: 1, ANUS: 1, NIPPLE: 1, URETHRA: 1, MOUTH: 1 };
  var PENETRATORS = { FINGER: 1, TONGUE: 1, PENIS: 1, CLIT: 1, TAIL: 1, TENTACLE: 1, TOY: 1 };
  var CAPACITY_MEDIAN = {
    ZERO: 0.5,
    ZERO_IMPENETRABLE: 0.5,
    ONE: 1.5,
    ONE_EXTREMELY_TIGHT: 1.5,
    TWO: 3,
    TWO_TIGHT: 3,
    THREE: 5,
    THREE_SLIGHTLY_LOOSE: 5,
    FOUR: 7.5,
    FOUR_LOOSE: 7.5,
    FIVE: 10.5,
    FIVE_ROOMY: 10.5,
    SIX: 14,
    SIX_STRETCHED_OPEN: 14,
    SEVEN: 20.5,
    SEVEN_GAPING: 20.5,
  };
  var ELASTIC_STRETCH = {
    ZERO_UNYIELDING: 0.025,
    ONE_RIGID: 0.05,
    TWO_FIRM: 0.1,
    THREE_FLEXIBLE: 0.15,
    FOUR_LIMBER: 0.2,
    FIVE_STRETCHY: 0.25,
    SIX_SUPPLE: 0.3,
    SEVEN_ELASTIC: 0.5,
  };
  var ELASTIC_TOLERANCE = {
    ZERO_UNYIELDING: 0,
    ONE_RIGID: 0.05,
    TWO_FIRM: 0.1,
    THREE_FLEXIBLE: 0.15,
    FOUR_LIMBER: 0.2,
    FIVE_STRETCHY: 0.25,
    SIX_SUPPLE: 0.25,
    SEVEN_ELASTIC: 0.25,
  };
  var WET_AROUSAL = {
    ZERO_DRY: 101,
    ONE_SLIGHTLY_MOIST: 100,
    TWO_MOIST: 50,
    THREE_WET: 25,
    FOUR_SLIMY: 0,
    FIVE_SLOPPY: 0,
    SIX_SOPPING_WET: 0,
    SEVEN_DROOLING: 0,
  };
  var GIRTH_MOD = {
    ZERO_THIN: -0.8,
    ONE_SLENDER: -0.4,
    TWO_NARROW: -0.2,
    THREE_AVERAGE: 0,
    FOUR_GIRTHY: 0.2,
    FIVE_THICK: 0.4,
    SIX_CHUBBY: 0.6,
    SEVEN_FAT: 0.8,
  };
  var lubeNotes = [];

  function pushLubeNote(text) {
    if (text && lubeNotes.indexOf(text) < 0) lubeNotes.push(text);
  }
  function takeLubeNotes() {
    var text = lubeNotes.join(" ");
    lubeNotes = [];
    return text;
  }
  function charKey(ch) {
    if (!ch) return "null";
    if (ch.player || ch === LT.game.player) return "player";
    return String(ch.id || ch.name || "npc");
  }
  function sexParticipants() {
    var list = (LT.sex.participants || [LT.sex.player, LT.sex.partner]).filter(Boolean);
    var seen = {};
    var out = [];
    var i;
    var k;
    for (i = 0; i < list.length; i++) {
      k = charKey(list[i]);
      if (seen[k]) continue;
      seen[k] = true;
      out.push(list[i]);
    }
    return out;
  }
  function findParticipant(key) {
    if (!key || key === "null") return null;
    if (key === "player") return LT.sex.player;
    var parts = sexParticipants();
    var i;
    for (i = 0; i < parts.length; i++) {
      if (charKey(parts[i]) === key) return parts[i];
    }
    return null;
  }
  function orificeOf(ch, kind) {
    if (!ch || !kind) return null;
    if (!ch.body && typeof LT.ensureBody === "function") LT.ensureBody(ch);
    var b = ch.body;
    if (b) {
      if (kind === "VAGINA") return b.vagina && b.vagina.orifice;
      if (kind === "ANUS") return b.ass && b.ass.anus;
      if (kind === "MOUTH") return b.face && b.face.mouth;
      if (kind === "NIPPLE") return b.breast && b.breast.orifice;
      if (kind === "URETHRA") {
        if (hasPenis(ch) && b.penis) return b.penis.urethra;
        if (hasVagina(ch) && b.vagina) return b.vagina.urethra;
      }
    }
    ch._sexOrifices = ch._sexOrifices || {};
    if (!ch._sexOrifices[kind]) {
      var cap = "TWO_TIGHT";
      if (kind === "VAGINA" && ch.vaginaCapacity) cap = ch.vaginaCapacity.id || ch.vaginaCapacity;
      ch._sexOrifices[kind] = {
        wetness: "TWO_MOIST",
        capacity: cap,
        elasticity: "THREE_FLEXIBLE",
        stretchedCapacity: null,
      };
    }
    return ch._sexOrifices[kind];
  }
  function capacityMedian(id) {
    if (id && typeof id === "object") id = id.id;
    return CAPACITY_MEDIAN[id] != null ? CAPACITY_MEDIAN[id] : 3;
  }
  function getStretchedCapacity(ch, area) {
    var o = orificeOf(ch, area);
    if (!o) return capacityMedian("TWO_TIGHT");
    if (o.stretchedCapacity == null) o.stretchedCapacity = capacityMedian(o.capacity);
    return o.stretchedCapacity;
  }
  function setStretchedCapacity(ch, area, value) {
    var o = orificeOf(ch, area);
    if (!o) return;
    o.stretchedCapacity = value;
  }
  function wetnessId(ch, area) {
    var o = orificeOf(ch, area);
    return (o && o.wetness) || "TWO_MOIST";
  }
  function elasticityId(ch, area) {
    var o = orificeOf(ch, area);
    return (o && o.elasticity) || "THREE_FLEXIBLE";
  }
  function wetArousalNeeded(ch, area) {
    return WET_AROUSAL[wetnessId(ch, area)] != null ? WET_AROUSAL[wetnessId(ch, area)] : 50;
  }
  function precumArousalNeeded(ch) {
    var stored = 0;
    if (ch && ch.body && ch.body.penis && ch.body.penis.testicle) stored = ch.body.penis.testicle.cumStorage || 0;
    else if (ch) stored = ch.cumStorage || 0;
    if (stored <= 0) return 100;
    if (stored < 3) return 75;
    if (stored < 6) return 50;
    if (stored < 16) return 25;
    if (stored < 30) return 5;
    return 0;
  }
  function milkStorageOf(ch) {
    if (!ch) return 0;
    if (ch.body && ch.body.breast) return ch.body.breast.milkStorage || 0;
    return ch.milkStorage || 0;
  }
  function bodyMaterialOf(ch) {
    if (!ch) return "FLESH";
    if (ch.bodyMaterial) return ch.bodyMaterial;
    if (ch.body && ch.body.bodyMaterial) return ch.body.bodyMaterial;
    return "FLESH";
  }
  function hasStatus(ch, id) {
    if (!ch || !id) return false;
    if (ch[id] || ch[id.replace(/_([A-Z])/g, function (_, c) { return c; }).toLowerCase()]) return true;
    if (id === "CREAMPIE_VAGINA" && (ch.creampieVagina || ch.creampiedVagina)) return true;
    if (id === "CREAMPIE_ANUS" && (ch.creampieAnus || ch.creampiedAnus)) return true;
    if (id === "CREAMPIE_NIPPLES" && (ch.creampieNipples || ch.creampiedNipples)) return true;
    var bag = ch.statusEffects || ch.effects;
    if (!bag) return false;
    if (Object.prototype.toString.call(bag) === "[object Array]") return bag.indexOf(id) >= 0;
    return !!(bag[id] || (bag[id] && bag[id].active));
  }
  function wetList(ch, area) {
    var key = charKey(ch);
    LT.sex.wetAreas = LT.sex.wetAreas || {};
    LT.sex.wetAreas[key] = LT.sex.wetAreas[key] || {};
    LT.sex.wetAreas[key][area] = LT.sex.wetAreas[key][area] || [];
    return LT.sex.wetAreas[key][area];
  }
  function hasLubricationType(ch, area, type) {
    var list = ((LT.sex.wetAreas || {})[charKey(ch)] || {})[area] || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (!type || list[i].type === type) return true;
    }
    return false;
  }
  function hasLubrication(ch, area) {
    return hasLubricationType(ch, area, null);
  }
  function areaLabel(area) {
    return AREA_LABEL[area] || String(area || "").toLowerCase();
  }
  function addLubrication(ch, area, type, fromCh, silent) {
    if (!ch || !area || !type) return false;
    if ((type === "PRECUM" || type === "CUM") && area === "PENIS" && wearingCondom(ch) && (!fromCh || fromCh === ch || fromCh === "player" && ch === LT.sex.player)) {
      return false;
    }
    var list = wetList(ch, area);
    var fromKey = fromCh == null ? "null" : typeof fromCh === "string" ? fromCh : charKey(fromCh);
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].type === type && list[i].from === fromKey) return false;
    }
    list.push({ type: type, from: fromKey });
    if (!silent) {
      var who = ch === LT.sex.player ? "Your" : nameOf(ch) + "'s";
      var already = LT.sex.turn === 0 && !LT.sex._acting;
      pushLubeNote(who + " " + areaLabel(area) + " " + (already ? "is already lubricated by " : "is quickly lubricated by ") + (LUBE_NAME[type] || "lubrication") + ".");
    }
    return true;
  }
  function copyLube(fromCh, fromArea, toCh, toArea) {
    var src = (((LT.sex.wetAreas || {})[charKey(fromCh)] || {})[fromArea] || []).slice();
    var i;
    var e;
    for (i = 0; i < src.length; i++) {
      e = src[i];
      if ((e.type === "PRECUM" || e.type === "CUM") && fromArea === "PENIS" && wearingCondom(fromCh) && e.from === charKey(fromCh)) continue;
      addLubrication(toCh, toArea, e.type, e.from === "null" ? null : findParticipant(e.from) || e.from, false);
    }
  }
  function transferLink(link) {
    if (!link) return;
    copyLube(link.giver, link.giverArea, link.receiver, link.receiverArea);
    copyLube(link.receiver, link.receiverArea, link.giver, link.giverArea);
    var extra = link.extra || [];
    var i;
    for (i = 0; i < extra.length; i++) {
      copyLube(link.giver, extra[i][0], link.receiver, extra[i][1]);
      copyLube(link.receiver, extra[i][1], link.giver, extra[i][0]);
    }
  }
  function penisDiameter(ch) {
    var length = 15;
    var girth = "THREE_AVERAGE";
    var mods = [];
    if (ch && ch.body && ch.body.penis) {
      if (ch.body.penis.length) length = ch.body.penis.length;
      if (ch.body.penis.girth) girth = ch.body.penis.girth;
      if (ch.body.penis.modifiers) mods = ch.body.penis.modifiers;
    } else if (ch && ch.penisLength) length = ch.penisLength;
    var base = 0.2;
    base = Math.max(0.15, base - Math.max(length - 15, 0) * 0.0025);
    var gmod = GIRTH_MOD[girth] != null ? GIRTH_MOD[girth] : 0;
    if (mods.indexOf("FLARED") >= 0) gmod += 0.05;
    if (mods.indexOf("TAPERED") >= 0) gmod -= 0.05;
    return Math.round(length * base * (1 + gmod) * 100) / 100;
  }
  function penetrationDiameter(ch, area) {
    if (area === "PENIS") return penisDiameter(ch);
    if (area === "CLIT") {
      var size = (ch && ch.body && ch.body.vagina && ch.body.vagina.clitSize) || "ZERO";
      if (size === "ZERO" || size === "ZERO_MICROSCOPIC") return 0.8;
      if (size === "ONE" || size === "ONE_SMALL") return 1.4;
      return 2.2;
    }
    if (area === "TAIL" || area === "TENTACLE") {
      var part = area === "TAIL" ? tailOf(ch) : ch && ch.body && ch.body.tentacle;
      return penisDiameter({ body: { penis: { length: 15, girth: (part && part.girth) || "THREE_AVERAGE" } } });
    }
    if (area === "FINGER") return 1.6;
    if (area === "TONGUE") return 1.2;
    if (area === "TOY") return 3.2;
    return 0;
  }
  function stretchRoles(link) {
    if (!link || link.id === "kiss") return null;
    var g = link.giverArea;
    var r = link.receiverArea;
    if (STRETCH_AREAS[r] && PENETRATORS[g]) {
      return { owner: link.receiver, orifice: r, penetrator: link.giver, penArea: g };
    }
    if (STRETCH_AREAS[g] && PENETRATORS[r]) {
      return { owner: link.giver, orifice: g, penetrator: link.receiver, penArea: r };
    }
    return null;
  }
  function maxComfortableDiameter(ch, area, lubed) {
    var cap = getStretchedCapacity(ch, area);
    var tol = ELASTIC_TOLERANCE[elasticityId(ch, area)];
    if (tol == null) tol = 0.15;
    return cap * (1.01 + tol + (lubed ? 0.1 : 0));
  }
  function isTooBig(ch, area, diameter, lubed) {
    return diameter > maxComfortableDiameter(ch, area, lubed);
  }
  function isTooSmall(ch, area, diameter) {
    return diameter <= getStretchedCapacity(ch, area) * 0.6;
  }
  function markArea(mapName, ch, area, on) {
    var key = charKey(ch);
    LT.sex[mapName] = LT.sex[mapName] || {};
    LT.sex[mapName][key] = LT.sex[mapName][key] || {};
    if (on) LT.sex[mapName][key][area] = true;
    else delete LT.sex[mapName][key][area];
  }
  function isAreaFlagged(mapName, ch, area) {
    return !!(((LT.sex[mapName] || {})[charKey(ch)] || {})[area]);
  }
  function applyStretch(link, initial) {
    var roles = stretchRoles(link);
    if (!roles) return null;
    var diameter = penetrationDiameter(roles.penetrator, roles.penArea);
    if (!diameter) return null;
    var lubed = hasLubrication(roles.owner, roles.orifice);
    var stretching = isTooBig(roles.owner, roles.orifice, diameter, lubed);
    var loose = !stretching && isTooSmall(roles.owner, roles.orifice, diameter);
    if (stretching) {
      var stretchMod = ELASTIC_STRETCH[elasticityId(roles.owner, roles.orifice)];
      if (stretchMod == null) stretchMod = 0.15;
      var current = getStretchedCapacity(roles.owner, roles.orifice);
      var inc = Math.max(diameter * 0.05, (diameter - current) * stretchMod);
      var next = current + inc;
      if (next > diameter) next = diameter;
      setStretchedCapacity(roles.owner, roles.orifice, next);
      markArea("areasCurrentlyStretching", roles.owner, roles.orifice, true);
      markArea("areasStretched", roles.owner, roles.orifice, true);
      markArea("areasTooLoose", roles.owner, roles.orifice, false);
      if (!isTooBig(roles.owner, roles.orifice, diameter, lubed)) {
        markArea("areasCurrentlyStretching", roles.owner, roles.orifice, false);
        pushLubeNote(parseSex("[npc2.NamePos] " + areaLabel(roles.orifice) + " has been stretched out enough to comfortably take [npc.namePos] " + areaLabel(roles.penArea) + ".", roles.penetrator, roles.owner));
      } else if (initial) {
        pushLubeNote(parseSex("[npc2.NamePos] " + areaLabel(roles.orifice) + " is too tight for [npc.namePos] " + areaLabel(roles.penArea) + ", and is being stretched out.", roles.penetrator, roles.owner));
      } else {
        pushLubeNote(parseSex("[npc2.NamePos] " + areaLabel(roles.orifice) + " continues to stretch around [npc.namePos] " + areaLabel(roles.penArea) + ".", roles.penetrator, roles.owner));
      }
    } else {
      markArea("areasCurrentlyStretching", roles.owner, roles.orifice, false);
      if (loose && initial) {
        markArea("areasTooLoose", roles.owner, roles.orifice, true);
        pushLubeNote(parseSex("[npc2.NamePos] " + areaLabel(roles.orifice) + " is too loose for [npc.namePos] " + areaLabel(roles.penArea) + ".", roles.penetrator, roles.owner));
      }
    }
    return { stretching: isAreaFlagged("areasCurrentlyStretching", roles.owner, roles.orifice), loose: loose, diameter: diameter };
  }
  function applyStretchAll(initial) {
    var links = LT.sex.links || [];
    var i;
    var first;
    for (i = 0; i < links.length; i++) {
      first = initial || !!links[i].justStarted;
      applyStretch(links[i], first);
      links[i].justStarted = false;
    }
  }
  function calculateWetAreas(onInit) {
    var parts = sexParticipants();
    var i;
    var ch;
    var arousal;
    for (i = 0; i < parts.length; i++) {
      ch = parts[i];
      if (onInit) {
        if (bodyMaterialOf(ch) === "SLIME") {
          ["MOUTH", "VAGINA", "ANUS", "NIPPLE", "URETHRA", "TONGUE", "PENIS", "CLIT"].forEach(function (area) {
            addLubrication(ch, area, "SLIME", ch, true);
          });
        }
        addLubrication(ch, "MOUTH", "SALIVA", ch, true);
        addLubrication(ch, "TONGUE", "SALIVA", ch, true);
      }
      if (milkStorageOf(ch) > 0) addLubrication(ch, "NIPPLE", "MILK", ch, true);
      if (hasStatus(ch, "CREAMPIE_ANUS")) addLubrication(ch, "ANUS", "CUM", null, onInit);
      if (hasStatus(ch, "CREAMPIE_NIPPLES")) addLubrication(ch, "NIPPLE", "CUM", null, onInit);
      if (hasStatus(ch, "CREAMPIE_VAGINA")) {
        addLubrication(ch, "VAGINA", "CUM", null, onInit);
        addLubrication(ch, "CLIT", "CUM", null, true);
      }
      arousal = ch.arousal || 0;
      if (arousal >= wetArousalNeeded(ch, "ANUS")) addLubrication(ch, "ANUS", "ANAL_LUBE", ch, onInit);
      if (hasPenis(ch) && arousal >= precumArousalNeeded(ch)) {
        addLubrication(ch, "PENIS", "PRECUM", ch, onInit);
        addLubrication(ch, "URETHRA", "PRECUM", ch, true);
      }
      if (hasVagina(ch) && arousal >= wetArousalNeeded(ch, "VAGINA")) {
        addLubrication(ch, "VAGINA", "GIRLCUM", ch, onInit);
        addLubrication(ch, "CLIT", "GIRLCUM", ch, true);
      }
    }
    var links = LT.sex.links || [];
    for (i = 0; i < links.length; i++) transferLink(links[i]);
    if (onInit) lubeNotes = [];
  }
  function lubeTypesOn(ch, area) {
    var list = ((LT.sex.wetAreas || {})[charKey(ch)] || {})[area] || [];
    var seen = {};
    var names = [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (seen[list[i].type]) continue;
      seen[list[i].type] = true;
      names.push(LUBE_NAME[list[i].type] || list[i].type.toLowerCase());
    }
    return names;
  }
  function lubeSummary() {
    var parts = sexParticipants();
    var bits = [];
    var stretchBits = [];
    var i;
    var areas;
    var a;
    var names;
    var who;
    var key;
    for (i = 0; i < parts.length; i++) {
      who = parts[i] === LT.sex.player ? "your" : nameOf(parts[i]) + "'s";
      key = charKey(parts[i]);
      areas = Object.keys((LT.sex.wetAreas || {})[key] || {});
      for (a = 0; a < areas.length; a++) {
        names = lubeTypesOn(parts[i], areas[a]);
        if (!names.length) continue;
        if (areas[a] === "MOUTH" || areas[a] === "TONGUE") {
          if (names.length === 1 && names[0] === "saliva") continue;
        }
        bits.push(who + " " + areaLabel(areas[a]) + " (" + names.join(", ") + ")");
      }
      areas = Object.keys(((LT.sex.areasCurrentlyStretching || {})[key]) || {});
      for (a = 0; a < areas.length; a++) stretchBits.push(who + " " + areaLabel(areas[a]));
    }
    var line = "";
    if (bits.length) line += "Wet: " + bits.join("; ") + ".";
    if (stretchBits.length) line += (line ? " " : "") + "Stretching: " + stretchBits.join(", ") + ".";
    return line;
  }

  LT.sex.addLubrication = addLubrication;
  LT.sex.hasLubrication = hasLubrication;
  LT.sex.hasLubricationType = hasLubricationType;
  LT.sex.calculateWetAreas = calculateWetAreas;
  LT.sex.getStretchedCapacity = getStretchedCapacity;
  LT.sex.setStretchedCapacity = setStretchedCapacity;
  LT.sex.isStretching = function (ch, area) {
    return isAreaFlagged("areasCurrentlyStretching", ch, area);
  };
  LT.sex.isTooLoose = function (ch, area) {
    return isAreaFlagged("areasTooLoose", ch, area);
  };
  LT.sex.penetrationDiameter = penetrationDiameter;
  LT.sex.maxComfortableDiameter = maxComfortableDiameter;
  LT.sex.lubeSummary = lubeSummary;
  LT.sex.orificeOf = orificeOf;
  LT.LUBE = LUBE_NAME;

  LT.SEX_PACE = {
    SUB_RESISTING: { id: "SUB_RESISTING", name: "resisting", isDom: false },
    SUB_NORMAL: { id: "SUB_NORMAL", name: "normal", isDom: false },
    SUB_EAGER: { id: "SUB_EAGER", name: "eager", isDom: false },
    DOM_GENTLE: { id: "DOM_GENTLE", name: "gentle", isDom: true },
    DOM_NORMAL: { id: "DOM_NORMAL", name: "normal", isDom: true },
    DOM_ROUGH: { id: "DOM_ROUGH", name: "rough", isDom: true },
  };
  LT.SEX_CONTROL = {
    NONE: 0,
    SELF: 1,
    ONGOING_ONLY: 2,
    ONGOING_PLUS_LIMITED_PENETRATIONS: 3,
    FULL: 4,
  };
  var PACE_OPPOSITE = {
    DOM_GENTLE: "SUB_NORMAL",
    DOM_NORMAL: "SUB_NORMAL",
    DOM_ROUGH: "SUB_EAGER",
    SUB_EAGER: "DOM_ROUGH",
    SUB_NORMAL: "DOM_NORMAL",
    SUB_RESISTING: "DOM_GENTLE",
  };

  function hasFetish(ch, id) {
    if (!ch || !id) return false;
    if (typeof ch.hasFetish === "function") return !!ch.hasFetish(id);
    var bag = ch.fetishes || ch.fetish;
    if (!bag) return false;
    return !!(bag[id] || bag[id.replace(/^FETISH_/, "")]);
  }

  var DESIRE_WEIGHT = {
    FOUR_LOVE: 5,
    LOVE: 5,
    THREE_LIKE: 3,
    LIKE: 3,
    TWO_NEUTRAL: 1,
    NEUTRAL: 1,
    ONE_DISLIKE: -4,
    DISLIKE: -4,
    ZERO_HATE: -6,
    HATE: -6,
  };

  function fetishDesire(ch, id) {
    if (!ch || !id) return "TWO_NEUTRAL";
    if (typeof ch.getFetishDesire === "function") {
      var d = ch.getFetishDesire(id);
      if (d) return d;
    }
    var bag = ch.fetishDesire || ch.desires || {};
    return bag[id] || bag[id.replace(/^FETISH_/, "")] || "TWO_NEUTRAL";
  }

  function fetishContentBlocked(id) {
    if (!id) return false;
    var list = LT.FETISH_LIST || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id !== id || !list[i].content) continue;
      var flag = list[i].content;
      var fn = "is" + flag.charAt(0).toUpperCase() + flag.slice(1) + "Enabled";
      if (typeof LT[fn] === "function" && !LT[fn]()) return true;
      if (flag === "analContent" && typeof LT.isAnalContentEnabled === "function" && !LT.isAnalContentEnabled()) return true;
      if (flag === "footContent" && typeof LT.isFootContentEnabled === "function" && !LT.isFootContentEnabled()) return true;
      if (flag === "armpitContent" && typeof LT.isArmpitContentEnabled === "function" && !LT.isArmpitContentEnabled()) return true;
    }
    return false;
  }

  function takesVirginity(area) {
    return area === "PENIS" || area === "CLIT" || area === "TAIL" || area === "TENTACLE";
  }

  function relatedFetishes(performing, targeted, src, tgt, isOrgasm) {
    var out = [];
    var add = function (id) {
      if (id && out.indexOf(id) < 0) out.push(id);
    };
    if (performing === "CLIT") add("FETISH_VAGINAL_RECEIVING");
    if (performing === "PENIS") add("FETISH_PENIS_GIVING");
    if (performing === "FOOT") add("FETISH_FOOT_GIVING");
    if (performing === "TONGUE" && targeted !== "MOUTH") add("FETISH_ORAL_GIVING");
    if (performing === "ANUS" || performing === "ASS") add("FETISH_ANAL_RECEIVING");
    if (performing === "BREASTS" || performing === "CROTCH_NIPPLE" || performing === "NIPPLE") add("FETISH_BREASTS_SELF");
    if (performing === "MOUTH" && targeted !== "TONGUE") add("FETISH_ORAL_GIVING");
    if (performing === "THIGHS") add("FETISH_STRUTTER");
    if (performing === "URETHRA") add("FETISH_PENIS_GIVING");
    if (performing === "VAGINA") {
      add("FETISH_VAGINAL_RECEIVING");
      if (isOrgasm && targeted === "PENIS") add("FETISH_PREGNANCY");
    }
    if (performing === "ARMPIT") add("FETISH_ARMPIT_RECEIVING");
    if (targeted === "CLIT") add("FETISH_VAGINAL_GIVING");
    if (targeted === "PENIS") add("FETISH_PENIS_RECEIVING");
    if (targeted === "FOOT") add("FETISH_FOOT_RECEIVING");
    if (targeted === "TONGUE" && performing !== "MOUTH") add("FETISH_ORAL_RECEIVING");
    if (targeted === "ARMPIT") add("FETISH_ARMPIT_GIVING");
    if (targeted === "ANUS" || targeted === "ASS") {
      add("FETISH_ANAL_GIVING");
      if (takesVirginity(performing) && tgt && (tgt.assVirgin || (tgt.sex && tgt.sex.assVirgin))) add("FETISH_DEFLOWERING");
    }
    if (targeted === "BREASTS" || targeted === "CROTCH_NIPPLE" || targeted === "NIPPLE") add("FETISH_BREASTS_OTHERS");
    if (targeted === "MOUTH") {
      if (performing !== "TONGUE") add("FETISH_ORAL_RECEIVING");
      if (takesVirginity(performing) && tgt && (tgt.faceVirgin || (tgt.sex && tgt.sex.faceVirgin))) add("FETISH_DEFLOWERING");
    }
    if (targeted === "THIGHS") add("FETISH_LEG_LOVER");
    if (targeted === "URETHRA") add("FETISH_PENIS_RECEIVING");
    if (targeted === "VAGINA") {
      add("FETISH_VAGINAL_GIVING");
      if (isOrgasm && performing === "PENIS") add("FETISH_IMPREGNATION");
      if (takesVirginity(performing) && tgt && (tgt.vaginaVirgin || (tgt.sex && tgt.sex.vaginaVirgin))) add("FETISH_DEFLOWERING");
    }
    if (src && tgt && src === tgt) add("FETISH_MASTURBATION");
    return out;
  }

  function sexTypeKey(performing, targeted) {
    return String(performing || "") + "|" + String(targeted || "");
  }

  function incrementSexTypeCount(performer, partner, performing, targeted) {
    if (!performer || !performing) return;
    var key = sexTypeKey(performing, targeted);
    var pk = charKey(performer);
    var tk = charKey(partner || performer);
    LT.sex.sexTypeCount = LT.sex.sexTypeCount || {};
    LT.sex.sexTypeCount[pk] = LT.sex.sexTypeCount[pk] || {};
    LT.sex.sexTypeCount[pk][tk] = LT.sex.sexTypeCount[pk][tk] || {};
    LT.sex.sexTypeCount[pk][tk][key] = (LT.sex.sexTypeCount[pk][tk][key] || 0) + 1;
    performer.sexTypeMemory = performer.sexTypeMemory || {};
    performer.sexTypeMemory[tk] = performer.sexTypeMemory[tk] || {};
    performer.sexTypeMemory[tk][key] = (performer.sexTypeMemory[tk][key] || 0) + 1;
  }

  function getSexTypeCount(performer, partner, performing, targeted) {
    if (!performer) return 0;
    var key = sexTypeKey(performing, targeted);
    var pk = charKey(performer);
    var tk = charKey(partner || performer);
    var scene = (((LT.sex.sexTypeCount || {})[pk] || {})[tk] || {})[key] || 0;
    if (scene) return scene;
    return (((performer.sexTypeMemory || {})[tk] || {})[key]) || 0;
  }

  function sexTypeOfAction(act, src) {
    if (!act) return null;
    var raw = act.pair || act.id || "";
    var receive = /_receive/.test(act.id || "");
    var pair = String(raw).replace(/_receive_start$|_receive_stop$|_receive$|_start$|_stop$/, "");
    var spec = pairAreas(pair);
    if (!spec) return null;
    if (receive) return { performing: spec.receiver, targeted: spec.giver, pair: pair, self: pair.indexOf("self_") === 0 };
    return { performing: spec.giver, targeted: spec.receiver, pair: pair, self: pair.indexOf("self_") === 0 };
  }

  function preferenceOf(ch, which) {
    if (!ch) return null;
    return ch[which] || null;
  }

  function calculateSexTypeWeighting(src, tgt, performing, targeted, opts) {
    opts = opts || {};
    var weight = 0;
    var fetishes = relatedFetishes(performing, targeted, src, tgt, !!opts.orgasm);
    var i;
    for (i = 0; i < fetishes.length; i++) {
      if (fetishContentBlocked(fetishes[i])) return -100000;
      if (hasFetish(src, fetishes[i])) {
        weight += 7;
        continue;
      }
      var desire = fetishDesire(src, fetishes[i]);
      weight += DESIRE_WEIGHT[desire] != null ? DESIRE_WEIGHT[desire] : 1;
    }
    var pref = preferenceOf(src, opts.main ? "mainSexPreference" : "foreplayPreference") || preferenceOf(src, "mainSexPreference") || preferenceOf(src, "foreplayPreference");
    if (pref && pref.performing === performing && pref.targeted === targeted) weight += 8;
    if (opts.request && opts.request.performing === performing && opts.request.targeted === targeted) weight += 6;
    return weight;
  }

  function currentSexType(src, tgt) {
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      if (isCommittedOngoing(links[i].id) && (links[i].giver === src || links[i].receiver === src)) {
        if (links[i].giver === src) return { performing: links[i].giverArea, targeted: links[i].receiverArea, pair: links[i].id };
        return { performing: links[i].receiverArea, targeted: links[i].giverArea, pair: links[i].id };
      }
    }
    for (i = 0; i < links.length; i++) {
      if (links[i].giver === src || links[i].receiver === src) {
        if (links[i].giver === src) return { performing: links[i].giverArea, targeted: links[i].receiverArea, pair: links[i].id };
        return { performing: links[i].receiverArea, targeted: links[i].giverArea, pair: links[i].id };
      }
    }
    return null;
  }

  function dirtyTalkLine(src, tgt) {
    var pace = getSexPace(src);
    var st = currentSexType(src, tgt);
    var speech;
    if (pace === "SUB_RESISTING") {
      speech = pick(["No! Please, stop this!", "I don't want this! Let me go!", "Please, I don't want to do this!"]);
    } else if (!st) {
      if (pace === "DOM_ROUGH") speech = pick(["You ready to get fucked, slut?", "I'm going to fuck you senseless!", "You're my bitch now, understand?!"]);
      else if (pace === "DOM_GENTLE") speech = pick(["I'll be gentle, don't worry!", "Let's have some fun!", "You're going to love this!"]);
      else if (pace === "SUB_EAGER") speech = pick(["Please, fuck me!", "I need this so badly!", "Don't hold back!"]);
      else speech = pick(["This is going to be good!", "You're going to be a good [npc2.girl]!", "Ready for some fun?"]);
    } else if (st.performing === "VAGINA" && st.targeted === "PENIS") {
      if (pace === "DOM_ROUGH") speech = pick(["That's right, fuck my pussy!", "Come on, slam that cock into me!"]);
      else if (pace === "SUB_EAGER") speech = pick(["Yes! Fuck my pussy!", "I love your cock in my pussy!"]);
      else speech = pick(["Yes, fuck my pussy!", "Your cock feels so good!"]);
    } else if (st.performing === "PENIS" && st.targeted === "VAGINA") {
      if (pace === "DOM_ROUGH") speech = pick(["Take my cock, slut!", "I'm going to fuck this pussy senseless!"]);
      else if (pace === "SUB_EAGER") speech = pick(["Your pussy feels amazing!", "I can't get enough of your pussy!"]);
      else speech = pick(["Your pussy feels so good!", "I'm going to fill you up!"]);
    } else if (st.performing === "MOUTH" && st.targeted === "PENIS") {
      speech = pick(["I love sucking your cock!", "Your cock tastes so good!", "Mmm, don't stop thrusting!"]);
    } else if (st.performing === "PENIS" && st.targeted === "MOUTH") {
      speech = pick(["That's it, suck my cock!", "Take it down your throat!", "Good [npc2.girl], keep sucking!"]);
    } else if (st.performing === "ANUS" || st.targeted === "ANUS") {
      speech = pick(["Yes, fuck my ass!", "Your ass feels so tight!", "Don't stop!"]);
    } else if (st.performing === "VAGINA" && st.targeted === "FINGER") {
      speech = pick(["Yes, finger my pussy!", "Your fingers feel so good!"]);
    } else if (st.performing === "FINGER" && st.targeted === "VAGINA") {
      speech = pick(["Your pussy's so wet!", "That's right, take my fingers!"]);
    } else {
      if (pace === "DOM_ROUGH") speech = pick(["You like that, slut?", "I'm going to use you however I want!"]);
      else if (pace === "SUB_EAGER") speech = pick(["Please, don't stop!", "I need more!"]);
      else speech = pick(["Yes, just like that!", "That feels so good!", "Don't stop!"]);
    }
    return "[npc.speech(" + speech + ")]";
  }
  function lustBand(lust) {
    var n = Number(lust) || 0;
    if (n < 10) return { sub: "SUB_RESISTING", dom: "DOM_GENTLE", arousalMod: 0.5 };
    if (n < 25) return { sub: "SUB_NORMAL", dom: "DOM_NORMAL", arousalMod: 0.75 };
    if (n < 50) return { sub: "SUB_NORMAL", dom: "DOM_NORMAL", arousalMod: 1 };
    if (n < 75) return { sub: "SUB_NORMAL", dom: "DOM_NORMAL", arousalMod: 1.25 };
    if (n < 90) return { sub: "SUB_EAGER", dom: "DOM_ROUGH", arousalMod: 1.5 };
    return { sub: "SUB_EAGER", dom: "DOM_ROUGH", arousalMod: 1.5 };
  }
  function listHasChar(list, ch) {
    if (!list || !ch) return false;
    var key = charKey(ch);
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === ch || charKey(list[i]) === key) return true;
    }
    return false;
  }
  function isDom(ch) {
    if (!ch) return false;
    if (listHasChar(LT.sex.dominants, ch)) return true;
    if (listHasChar(LT.sex.submissives, ch)) return false;
    if (ch === LT.sex.player || ch.player) return !!LT.sex.playerDom;
    return !LT.sex.playerDom;
  }
  function otherParticipants(ch) {
    var parts = sexParticipants();
    var out = [];
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] !== ch) out.push(parts[i]);
    }
    return out;
  }
  function slotOf(ch) {
    if (!ch) return "";
    return ((LT.sex.slots || {})[charKey(ch)]) || "";
  }
  function getTarget(ch) {
    if (!ch) return null;
    var key = (LT.sex.targets || {})[charKey(ch)];
    if (!key) return ch === LT.sex.player ? LT.sex.partner : LT.sex.player;
    var parts = sexParticipants();
    var i;
    for (i = 0; i < parts.length; i++) {
      if (charKey(parts[i]) === key) return parts[i];
    }
    return ch === LT.sex.player ? LT.sex.partner : LT.sex.player;
  }
  function setTarget(ch, target) {
    if (!ch || !target) return;
    LT.sex.targets = LT.sex.targets || {};
    LT.sex.targets[charKey(ch)] = charKey(target);
    if (ch === LT.sex.player || ch.player) LT.sex.partner = target;
  }
  function rebuildRoleLists() {
    var player = LT.sex.player;
    var others = (LT.sex.partners || otherParticipants(player)).slice();
    if (LT.sex.playerDom) {
      LT.sex.dominants = [player];
      LT.sex.submissives = others;
    } else {
      LT.sex.submissives = [player];
      LT.sex.dominants = others;
    }
  }
  function derivedPace(ch) {
    var band = lustBand(ch && ch.lust);
    var pace = isDom(ch) ? band.dom : band.sub;
    if (isDom(ch)) {
      if (hasFetish(ch, "FETISH_SADIST")) return "DOM_ROUGH";
      if (hasFetish(ch, "FETISH_SUBMISSIVE") && !hasFetish(ch, "FETISH_SADIST") && !hasFetish(ch, "FETISH_DOMINANT")) {
        return "DOM_GENTLE";
      }
      if (pace === "DOM_ROUGH" && !hasFetish(ch, "FETISH_DOMINANT") && !hasFetish(ch, "FETISH_SADIST") && !hasFetish(ch, "FETISH_NON_CON_DOM")) {
        pace = "DOM_NORMAL";
      }
    } else {
      if (hasFetish(ch, "FETISH_NON_CON_SUB")) pace = "SUB_RESISTING";
      if (pace === "SUB_RESISTING" && !(typeof LT.isNonConEnabled === "function" && LT.isNonConEnabled())) {
        pace = "SUB_NORMAL";
      }
    }
    return pace;
  }
  function getSexPace(ch) {
    if (!ch) return "SUB_NORMAL";
    var forced = (LT.sex.forcePace || {})[charKey(ch)];
    if (forced) return forced;
    return derivedPace(ch);
  }
  function setSexPace(ch, pace) {
    if (!ch || !pace) return;
    LT.sex.forcePace = LT.sex.forcePace || {};
    LT.sex.forcePace[charKey(ch)] = pace;
  }
  function getSexControl(ch) {
    if (!ch) return LT.SEX_CONTROL.NONE;
    var forced = (LT.sex.forceControl || {})[charKey(ch)];
    if (forced != null) return forced;
    if (isDom(ch)) return LT.SEX_CONTROL.FULL;
    if (LT.sex.consensual || LT.sex.subHasEqualControl) return LT.SEX_CONTROL.FULL;
    if (ch === LT.sex.player || ch.player) return LT.SEX_CONTROL.ONGOING_PLUS_LIMITED_PENETRATIONS;
    return LT.SEX_CONTROL.ONGOING_ONLY;
  }
  function applyStartingPaceStats(ch, pace, forced) {
    if (!ch || !forced) return;
    if (pace === "DOM_GENTLE") ch.lust = 10;
    else if (pace === "DOM_NORMAL") ch.arousal = Math.max(ch.arousal || 0, 5);
    else if (pace === "DOM_ROUGH" || pace === "SUB_EAGER") {
      ch.lust = Math.max(ch.lust || 0, 85);
      ch.arousal = Math.max(ch.arousal || 0, 10);
    } else if (pace === "SUB_NORMAL") {
      ch.lust = Math.max(ch.lust || 0, 10);
      ch.arousal = Math.max(ch.arousal || 0, 5);
    } else if (pace === "SUB_RESISTING") ch.lust = 0;
  }
  function paceName(ch) {
    var id = getSexPace(ch);
    return (LT.SEX_PACE[id] && LT.SEX_PACE[id].name) || String(id || "").toLowerCase();
  }
  function paceSummary() {
    var parts = sexParticipants();
    var bits = [];
    var i;
    for (i = 0; i < parts.length; i++) {
      bits.push((parts[i] === LT.sex.player ? "you" : nameOf(parts[i])) + " (" + paceName(parts[i]) + ")");
    }
    var lead = LT.sex.playerDom ? "you" : nameOf(LT.sex.partner);
    return "Lead: " + lead + ". Pace: " + bits.join(", ") + ".";
  }
  function switchLead() {
    var playerPace = getSexPace(LT.sex.player);
    var partnerPace = getSexPace(LT.sex.partner);
    LT.sex.playerDom = !LT.sex.playerDom;
    setSexPace(LT.sex.player, PACE_OPPOSITE[playerPace] || (LT.sex.playerDom ? "DOM_NORMAL" : "SUB_NORMAL"));
    setSexPace(LT.sex.partner, PACE_OPPOSITE[partnerPace] || (LT.sex.playerDom ? "SUB_NORMAL" : "DOM_NORMAL"));
    rebuildRoleLists();
  }
  function actionAllowedByControl(act, src) {
    if (!act) return false;
    if (act.isOrgasm || act.endsSex || act.isPrepare || act.type === "PREPARE_FOR_PARTNER_ORGASM") return true;
    var ctrl = getSexControl(src || LT.sex.player);
    if (act.id === "resist" || act.id === "do_nothing" || act.id === "calm_down" || act.type === "SPEECH") return true;
    if (ctrl <= LT.SEX_CONTROL.NONE) return false;
    if (act.tab === 1) return ctrl >= LT.SEX_CONTROL.SELF;
    if (act.tab === 2) return ctrl >= LT.SEX_CONTROL.FULL;
    if (act.type === "START_ONGOING") return ctrl >= LT.SEX_CONTROL.ONGOING_PLUS_LIMITED_PENETRATIONS;
    if (act.type === "ONGOING" || act.type === "STOP_ONGOING") return ctrl >= LT.SEX_CONTROL.ONGOING_ONLY;
    return ctrl >= LT.SEX_CONTROL.ONGOING_PLUS_LIMITED_PENETRATIONS;
  }
  function canCommandPartner(src) {
    return getSexControl(src || LT.sex.player) >= LT.SEX_CONTROL.FULL;
  }

  LT.sex.getSexPace = getSexPace;
  LT.sex.setSexPace = setSexPace;
  LT.sex.isDom = isDom;
  LT.sex.getSexControl = getSexControl;
  LT.sex.paceName = paceName;
  LT.sex.paceSummary = paceSummary;
  LT.sex.switchLead = switchLead;
  LT.sex.canCommandPartner = canCommandPartner;
  LT.sex.getTarget = getTarget;
  LT.sex.setTarget = setTarget;
  LT.sex.slotOf = slotOf;
  LT.sex.otherParticipants = otherParticipants;
  LT.sex.isMasturbation = function () {
    return !!LT.sex.masturbation;
  };
  LT.sex.hasFetish = hasFetish;
  LT.sex.fetishDesire = fetishDesire;
  LT.sex.relatedFetishes = relatedFetishes;
  LT.sex.calculateSexTypeWeighting = calculateSexTypeWeighting;
  LT.sex.incrementSexTypeCount = incrementSexTypeCount;
  LT.sex.getSexTypeCount = getSexTypeCount;
  LT.sex.sexTypeOfAction = sexTypeOfAction;
  LT.sex.getDirtyTalk = dirtyTalkLine;

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
        return !findLink(spec.id, function (l) { return l.giver === src && l.receiver === tgt; }) && spec.ok(src, tgt) && pairLegal(spec.id, src, tgt);
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.start.tip, src, tgt);
      },
      perform: function (src, tgt) {
        setOngoing(spec.id, src, tgt, spec.label);
        var text = parseSex(pickPaceLines(spec.start.lines, spec.start.pace, src), src, tgt);
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
        return !!findLink(spec.id, function (l) { return l.giver === src; });
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.ongoing.tip, src, tgt);
      },
      perform: function (src) {
        var link = findLink(spec.id, function (l) { return l.giver === src; }) || findLink(spec.id);
        return parseSex(pickPaceLines(spec.ongoing.lines, spec.ongoing.pace, src), link.giver, link.receiver);
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
        var link = findLink(spec.id, function (l) { return l.giver === src; });
        return !!(link && !isKnotLocked(link));
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.stop.tip, src, tgt);
      },
      perform: function (src) {
        var link = findLink(spec.id, function (l) { return l.giver === src; }) || findLink(spec.id);
        var text = parseSex(pick(spec.stop.lines), link.giver, link.receiver);
        removeLink(link);
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
        return !findLink(spec.id, function (l) { return l.giver === tgt && l.receiver === src; }) && spec.ok(tgt, src) && pairLegal(spec.id, tgt, src);
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.receive.start.tip, src, tgt);
      },
      perform: function (src, tgt) {
        setOngoing(spec.id, tgt, src, spec.label);
        var text = parseSex(pickPaceLines(spec.receive.start.lines, spec.receive.start.pace, src), src, tgt);
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
        return !!findLink(spec.id, function (l) { return l.receiver === src; });
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.receive.ongoing.tip, src, tgt);
      },
      perform: function (src) {
        var link = findLink(spec.id, function (l) { return l.receiver === src; }) || findLink(spec.id);
        return parseSex(pickPaceLines(spec.receive.ongoing.lines, spec.receive.ongoing.pace, src), link.receiver, link.giver);
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
        var link = findLink(spec.id, function (l) { return l.receiver === src; });
        return !!(link && !isKnotLocked(link));
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.receive.stop.tip, src, tgt);
      },
      perform: function (src) {
        var link = findLink(spec.id, function (l) { return l.receiver === src; }) || findLink(spec.id);
        var text = parseSex(pick(spec.receive.stop.lines), link.receiver, link.giver);
        removeLink(link);
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
      pace: {
        DOM_GENTLE: ["Slowly tracing [npc.her] [npc.fingers] over [npc2.namePos] [npc2.labia+], [npc.name] gently [npc.verb(ease)] [npc.her] digits into [npc2.her] [npc2.pussy+]."],
        DOM_ROUGH: ["Without warning, [npc.name] roughly [npc.verb(thrust)] [npc.her] [npc.fingers] deep into [npc2.namePos] [npc2.pussy+]."],
        SUB_EAGER: ["Desperate to please, [npc.name] greedily [npc.verb(sink)] [npc.her] [npc.fingers] into [npc2.namePos] [npc2.pussy+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] hand away, but [npc.her] [npc.fingers] are still forced into [npc2.namePos] [npc2.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.fingers] in and out of [npc2.namePos] [npc2.pussy+], gently curling them against [npc2.her] inner walls."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] [npc.her] [npc.fingers] in and out of [npc2.namePos] [npc2.pussy+], thrusting them in deep."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(finger)] [npc2.name], moaning as [npc.she] [npc.verb(curl)] [npc.her] [npc.fingers] as deep as they will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] hand away, sobbing as [npc.her] [npc.fingers] are still buried in [npc2.namePos] [npc2.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly wrapping [npc.her] [npc.fingers] around [npc2.namePos] [npc2.cock+], [npc.name] gently [npc.verb(start)] stroking up and down its length."],
        DOM_ROUGH: ["Grabbing [npc2.namePos] [npc2.cock+], [npc.name] roughly [npc.verb(start)] jerking [npc2.herHim] off with fast, tight strokes."],
        SUB_EAGER: ["With a needy [npc.moan], [npc.name] greedily [npc.verb(wrap)] [npc.her] [npc.fingers] around [npc2.namePos] [npc2.cock+] and [npc.verb(start)] stroking."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] hand away, but [npc.her] [npc.fingers] are still wrapped around [npc2.namePos] [npc2.cock+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(stroke)] [npc2.namePos] [npc2.cock+], gently sliding [npc.her] [npc.fingers] up and down the shaft."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(jerk)] [npc2.namePos] [npc2.cock+], pumping [npc.her] [npc.hand] up and down with a tight grip."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(stroke)] [npc2.namePos] [npc2.cock+], moaning as [npc.she] [npc.verb(work)] [npc.her] [npc.hand] as fast as [npc.she] can."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to let go, sobbing as [npc.her] [npc.fingers] are still forced around [npc2.namePos] [npc2.cock+]."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly pressing [npc.her] [npc.lips] to [npc2.namePos] [npc2.labia+], [npc.name] gently [npc.verb(lick)] [npc2.her] [npc2.pussy+] before easing [npc.her] [npc.tongue] inside."],
        DOM_ROUGH: ["Grabbing [npc2.namePos] [npc2.hips], [npc.name] roughly [npc.verb(bury)] [npc.her] [npc.face] in [npc2.her] [npc2.pussy+] and [npc.verb(thrust)] [npc.her] [npc.tongue] deep inside."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] hungrily [npc.verb(press)] [npc.her] [npc.mouth] to [npc2.namePos] [npc2.pussy+] and [npc.verb(push)] [npc.her] [npc.tongue] inside."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to turn [npc.her] head away, but [npc.her] [npc.mouth] is still pushed against [npc2.namePos] [npc2.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(lick)] [npc2.namePos] [npc2.pussy+], gently sliding [npc.her] [npc.tongue] in and out."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] [npc.her] [npc.tongue] deep into [npc2.namePos] [npc2.pussy+], holding [npc2.her] [npc2.hips] in place."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(lick)] [npc2.namePos] [npc2.pussy+], moaning as [npc.she] [npc.verb(drive)] [npc.her] [npc.tongue] as deep as it will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] [npc.face] away, sobbing as [npc.her] [npc.tongue] is still pressed into [npc2.namePos] [npc2.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly leaning in, [npc.name] gently [npc.verb(kiss)] the [npc2.cockHead+] of [npc2.namePos] [npc2.cock+] before easing it into [npc.her] mouth."],
        DOM_ROUGH: ["Grabbing [npc2.namePos] [npc2.hips], [npc.name] roughly [npc.verb(take)] [npc2.her] [npc2.cock+] into [npc.her] mouth and [npc.verb(force)] it in deep."],
        SUB_EAGER: ["With a needy [npc.moan], [npc.name] hungrily [npc.verb(wrap)] [npc.her] [npc.lips] around [npc2.namePos] [npc2.cock+] and [npc.verb(start)] sucking."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to turn [npc.her] head away, but [npc2.namePos] [npc2.cock] is still pushed against [npc.her] [npc.lips]."],
      },
    },
    ongoing: {
      name: "Perform blowjob",
      tip: "Eagerly suck [npc2.namePos] [npc2.cock+].",
      selfA: "TWO_LOW",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly wrapping [npc.her] [npc.lips+] around [npc2.namePos] [npc2.cock+], [npc.name] [npc.verb(start)] rapidly bobbing [npc.her] head up and down as [npc.she] [npc.verb(give)] [npc2.herHim] an enthusiastic blowjob.",
      ],
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(bob)] [npc.her] head, gently sucking [npc2.namePos] [npc2.cock+] with long, careful strokes of [npc.her] [npc.tongue]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(slam)] [npc.her] head down, forcing [npc2.namePos] [npc2.cock+] deep into [npc.her] throat."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(suck)] [npc2.namePos] [npc2.cock+], moaning around the shaft as [npc.she] [npc.verb(bob)] [npc.her] head as fast as [npc.she] can."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull back, sobbing as [npc2.namePos] [npc2.cock] is still held in [npc.her] mouth."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly easing the [npc.cockTip+] of [npc.her] [npc.cock] between [npc2.namePos] [npc2.labia+], [npc.name] gently [npc.verb(sink)] into [npc2.her] [npc2.pussy+]."],
        DOM_ROUGH: ["Lining [npc.herself] up, [npc.name] roughly [npc.verb(slam)] [npc.her] [npc.cock+] into [npc2.namePos] [npc2.pussy+]."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(thrust)] [npc.her] [npc.cock+] into [npc2.namePos] [npc2.pussy+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull back, but [npc.her] [npc.cock] is still pushed into [npc2.namePos] [npc2.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(roll)] [npc.her] [npc.hips], gently sliding [npc.her] [npc.cock+] in and out of [npc2.namePos] [npc2.pussy+]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pound)] [npc2.namePos] [npc2.pussy+], slamming [npc.her] [npc.hips] forward with every thrust."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(fuck)] [npc2.name], moaning as [npc.she] [npc.verb(drive)] [npc.her] [npc.cock+] as deep as it will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving, sobbing as [npc.her] [npc.cock] is still buried in [npc2.namePos] [npc2.pussy+]."],
      },
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
    content: "anal",
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
      pace: {
        DOM_GENTLE: ["Slowly tracing [npc.her] [npc.fingers] over [npc2.namePos] [npc2.assCloaca], [npc.name] gently [npc.verb(ease)] [npc.her] digits into [npc2.her] [npc2.asshole+]."],
        DOM_ROUGH: ["Without warning, [npc.name] roughly [npc.verb(thrust)] [npc.her] [npc.fingers] deep into [npc2.namePos] [npc2.asshole+]."],
        SUB_EAGER: ["Desperate to please, [npc.name] greedily [npc.verb(sink)] [npc.her] [npc.fingers] into [npc2.namePos] [npc2.asshole+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] hand away, but [npc.her] [npc.fingers] are still forced into [npc2.namePos] [npc2.asshole+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.fingers] in and out of [npc2.namePos] [npc2.asshole+], gently curling them against [npc2.her] inner walls."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] [npc.her] [npc.fingers] in and out of [npc2.namePos] [npc2.asshole+], thrusting them in deep."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(finger)] [npc2.namePos] [npc2.ass], moaning as [npc.she] [npc.verb(curl)] [npc.her] [npc.fingers] as deep as they will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] hand away, sobbing as [npc.her] [npc.fingers] are still buried in [npc2.namePos] [npc2.asshole+]."],
      },
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
    content: "anal",
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
      pace: {
        DOM_GENTLE: ["Slowly easing the [npc.cockTip+] of [npc.her] [npc.cock] between [npc2.namePos] ass cheeks, [npc.name] gently [npc.verb(sink)] into [npc2.her] [npc2.asshole+]."],
        DOM_ROUGH: ["Lining [npc.herself] up, [npc.name] roughly [npc.verb(slam)] [npc.her] [npc.cock+] into [npc2.namePos] [npc2.asshole+]."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(thrust)] [npc.her] [npc.cock+] into [npc2.namePos] [npc2.asshole+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull back, but [npc.her] [npc.cock] is still pushed into [npc2.namePos] [npc2.asshole+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(roll)] [npc.her] [npc.hips], gently sliding [npc.her] [npc.cock+] in and out of [npc2.namePos] [npc2.asshole+]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pound)] [npc2.namePos] [npc2.asshole+], slamming [npc.her] [npc.hips] forward with every thrust."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(fuck)] [npc2.namePos] [npc2.ass], moaning as [npc.she] [npc.verb(drive)] [npc.her] [npc.cock+] as deep as it will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving, sobbing as [npc.her] [npc.cock] is still buried in [npc2.namePos] [npc2.asshole+]."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly pressing [npc.her] [npc.lips] to [npc2.namePos] [npc2.assCloaca+], [npc.name] gently [npc.verb(lick)] [npc2.her] [npc2.asshole+] before easing [npc.her] [npc.tongue] inside."],
        DOM_ROUGH: ["Grabbing [npc2.namePos] [npc2.ass], [npc.name] roughly [npc.verb(bury)] [npc.her] [npc.face] between [npc2.her] cheeks and [npc.verb(thrust)] [npc.her] [npc.tongue] deep into [npc2.her] [npc2.asshole+]."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] hungrily [npc.verb(press)] [npc.her] [npc.mouth] to [npc2.namePos] [npc2.asshole+] and [npc.verb(push)] [npc.her] [npc.tongue] inside."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to turn [npc.her] head away, but [npc.her] [npc.mouth] is still pushed against [npc2.namePos] [npc2.asshole+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(lick)] [npc2.namePos] [npc2.asshole+], gently sliding [npc.her] [npc.tongue] in and out."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] [npc.her] [npc.tongue] deep into [npc2.namePos] [npc2.asshole+], holding [npc2.her] [npc2.ass] in place."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(lick)] [npc2.namePos] [npc2.asshole+], moaning as [npc.she] [npc.verb(drive)] [npc.her] [npc.tongue] as deep as it will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] [npc.face] away, sobbing as [npc.her] [npc.tongue] is still pressed into [npc2.namePos] [npc2.asshole+]."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly pushing [npc2.namePos] [npc2.breasts+] together, [npc.name] gently [npc.verb(slide)] [npc.her] [npc.cock] into [npc2.her] cleavage."],
        DOM_ROUGH: ["Grabbing [npc2.namePos] [npc2.breasts+], [npc.name] roughly [npc.verb(shove)] them around [npc.her] [npc.cock+] and [npc.verb(start)] thrusting."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(sink)] [npc.her] [npc.cock+] between [npc2.namePos] [npc2.breasts+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull back, but [npc.her] [npc.cock] is still pushed between [npc2.namePos] [npc2.breasts+]."],
      },
    },
    ongoing: {
      name: "Paizuri",
      tip: "Continue fucking [npc2.namePos] [npc2.breasts+].",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly sinking [npc.her] [npc.cock+] between [npc2.namePos] [npc2.breasts+], [npc.name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(fuck)] [npc2.her] cleavage.",
      ],
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.cock+] between [npc2.namePos] [npc2.breasts+], gently rocking [npc.her] [npc.hips]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pound)] [npc2.namePos] cleavage, slamming [npc.her] [npc.cock+] between [npc2.her] [npc2.breasts+]."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(fuck)] [npc2.namePos] [npc2.breasts+], moaning as [npc.she] [npc.verb(thrust)] as deep as [npc.she] can."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving, sobbing as [npc.her] [npc.cock] is still trapped between [npc2.namePos] [npc2.breasts+]."],
      },
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
    content: "foot",
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
      pace: {
        DOM_GENTLE: ["Slowly taking hold of [npc2.namePos] [npc2.feet], [npc.name] gently [npc.verb(slide)] [npc.her] [npc.cock+] between them."],
        DOM_ROUGH: ["Grabbing [npc2.namePos] [npc2.feet], [npc.name] roughly [npc.verb(shove)] [npc.her] [npc.cock+] between them and [npc.verb(start)] thrusting."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(push)] [npc.her] [npc.cock+] between [npc2.namePos] [npc2.feet]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull back, but [npc.her] [npc.cock] is still trapped between [npc2.namePos] [npc2.feet]."],
      },
    },
    ongoing: {
      name: "Receiving footjob",
      tip: "Continue fucking [npc2.namePos] [npc2.feet].",
      selfA: "FOUR_HIGH",
      tgtA: "THREE_NORMAL",
      lines: [
        "Eagerly thrusting [npc.her] [npc.cock+] between [npc2.namePos] [npc2.feet], [npc.name] [npc.verb(let)] out [npc.a_moan+].",
      ],
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.cock+] between [npc2.namePos] [npc2.feet], gently rocking [npc.her] [npc.hips]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] [npc.her] [npc.cock+] between [npc2.namePos] [npc2.feet], slamming [npc.her] [npc.hips] forward."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(fuck)] [npc2.namePos] [npc2.feet], moaning as [npc.she] [npc.verb(thrust)] as fast as [npc.she] can."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving, sobbing as [npc.her] [npc.cock] is still held between [npc2.namePos] [npc2.feet]."],
      },
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

  function shortPair(spec) {
    var receive = spec.receiveStart
      ? {
          start: {
            name: spec.receiveStart,
            tip: spec.receiveTip,
            selfA: spec.tgtA || "THREE_NORMAL",
            tgtA: spec.selfA || "TWO_LOW",
            lines: spec.receiveLines || spec.startLines,
          },
          ongoing: {
            name: spec.receiveOn || spec.onName,
            tip: spec.receiveOnTip || spec.onTip,
            selfA: spec.tgtA || "THREE_NORMAL",
            tgtA: spec.selfA || "TWO_LOW",
            lines: spec.receiveOnLines || spec.onLines,
          },
          stop: {
            name: spec.receiveStop || spec.stopName,
            tip: spec.receiveStopTip || spec.stopTip,
            lines: spec.receiveStopLines || spec.stopLines,
          },
        }
      : undefined;
    registerPair({
      id: spec.id,
      content: spec.content,
      label: spec.label,
      ok: spec.ok,
      start: {
        name: spec.startName,
        tip: spec.startTip,
        selfA: spec.selfA || "TWO_LOW",
        tgtA: spec.tgtA || "THREE_NORMAL",
        lines: spec.startLines,
        pace: spec.startPace,
      },
      ongoing: {
        name: spec.onName,
        tip: spec.onTip,
        selfA: spec.selfA || "TWO_LOW",
        tgtA: spec.tgtA || "THREE_NORMAL",
        lines: spec.onLines,
        pace: spec.onPace,
      },
      stop: {
        name: spec.stopName,
        tip: spec.stopTip,
        lines: spec.stopLines,
      },
      receive: receive,
    });
  }

  shortPair({
    id: "tail_vagina",
    label: "tail-fucking",
    ok: function (g, r) { return hasTail(g) && hasVagina(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Tail-fuck [npc2.herHim]",
    startTip: "Slide your [npc.tail+] into [npc2.namePos] [npc2.pussy+].",
    startLines: ["Wrapping [npc.her] [npc.tail+] around [npc2.namePos] [npc2.hips], [npc.name] [npc.verb(press)] the tip against [npc2.her] [npc2.labia+] before greedily sinking it into [npc2.her] [npc2.pussy+]."],
    onName: "Tail-fucking",
    onTip: "Keep thrusting your [npc.tail+] in and out of [npc2.namePos] [npc2.pussy+].",
    onLines: ["[npc.Name] eagerly [npc.verb(pump)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.pussy+], drawing [npc2.a_moan+] from [npc2.her] [npc2.lips]."],
    stopName: "Stop tail-fucking",
    stopTip: "Pull your [npc.tail+] out of [npc2.namePos] [npc2.pussy+].",
    stopLines: ["Sliding [npc.her] [npc.tail+] out of [npc2.namePos] [npc2.pussy+], [npc.name] [npc.verb(put)] an end to the tail-fucking."],
    receiveStart: "Get tail-fucked",
    receiveTip: "Get [npc2.name] to fuck you with [npc2.her] [npc2.tail+].",
    receiveLines: ["Grabbing [npc2.namePos] [npc2.tail+], [npc.name] [npc.verb(guide)] the tip to [npc.her] [npc.pussy+] and [npc.verb(push)] back onto it."],
    receiveOn: "Being tail-fucked",
    receiveStop: "Stop being tail-fucked",
    selfA: "TWO_LOW",
    tgtA: "FOUR_HIGH",
    startPace: {
      DOM_GENTLE: ["Slowly wrapping [npc.her] [npc.tail+] around [npc2.namePos] [npc2.hips], [npc.name] gently [npc.verb(ease)] the tip into [npc2.her] [npc2.pussy+]."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] [npc.her] [npc.tail+] into [npc2.namePos] [npc2.pussy+]."],
      SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(sink)] [npc.her] [npc.tail+] into [npc2.namePos] [npc2.pussy+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] [npc.tail] back, but the tip is still pushed into [npc2.namePos] [npc2.pussy+]."],
    },
    onPace: {
      DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.pussy+]."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.pussy+]."],
      SUB_EAGER: ["[npc.Name] desperately [npc.verb(fuck)] [npc2.name] with [npc.her] [npc.tail+], moaning as [npc.she] [npc.verb(drive)] it as deep as it will go."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving [npc.her] [npc.tail], sobbing as it is still buried in [npc2.namePos] [npc2.pussy+]."],
    },
  });
  shortPair({
    id: "tail_anus",
    content: "anal",
    label: "tail-pegging",
    ok: function (g, r) { return hasTail(g) && LT.isSexExposed(r, "ANUS"); },
    startName: "Tail-peg [npc2.herHim]",
    startTip: "Push your [npc.tail+] into [npc2.namePos] [npc2.asshole+].",
    startLines: ["[npc.Name] [npc.verb(press)] the tip of [npc.her] [npc.tail+] against [npc2.namePos] [npc2.asshole+] before slowly sinking it inside."],
    onName: "Tail-pegging",
    onTip: "Keep fucking [npc2.namePos] [npc2.asshole+] with your [npc.tail+].",
    onLines: ["[npc.Name] [npc.verb(pump)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.asshole+]."],
    stopName: "Stop tail-pegging",
    stopTip: "Pull your [npc.tail+] out of [npc2.namePos] [npc2.asshole+].",
    stopLines: ["Sliding [npc.her] [npc.tail+] free, [npc.name] [npc.verb(stop)] pegging [npc2.name]."],
    receiveStart: "Get tail-pegged",
    receiveTip: "Get [npc2.name] to push [npc2.her] [npc2.tail+] into your ass.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.tail+] back against [npc.her] [npc.asshole+] and [npc.verb(push)] onto it."],
    receiveOn: "Being tail-pegged",
    receiveStop: "Stop being tail-pegged",
    startPace: {
      DOM_GENTLE: ["Slowly pressing the tip of [npc.her] [npc.tail+] against [npc2.namePos] [npc2.asshole+], [npc.name] gently [npc.verb(ease)] it inside."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] [npc.her] [npc.tail+] into [npc2.namePos] [npc2.asshole+]."],
      SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(sink)] [npc.her] [npc.tail+] into [npc2.namePos] [npc2.asshole+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] [npc.tail] back, but the tip is still pushed into [npc2.namePos] [npc2.asshole+]."],
    },
    onPace: {
      DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.asshole+]."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.asshole+]."],
      SUB_EAGER: ["[npc.Name] desperately [npc.verb(peg)] [npc2.name] with [npc.her] [npc.tail+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving [npc.her] [npc.tail], sobbing as it is still buried in [npc2.namePos] [npc2.asshole+]."],
    },
  });
  shortPair({
    id: "tail_mouth",
    label: "tail oral",
    ok: function (g, r) { return hasTail(g); },
    startName: "Get [npc2.her] mouth on your tail",
    startTip: "Push your [npc.tail+] into [npc2.namePos] mouth.",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.tail+] against [npc2.namePos] [npc2.lips+] until [npc2.she] [npc2.verb(part)] them and take it in."],
    onName: "Tail in mouth",
    onTip: "Keep sliding your [npc.tail+] between [npc2.namePos] [npc2.lips+].",
    onLines: ["[npc.Name] eagerly [npc.verb(slide)] [npc.her] [npc.tail+] in and out of [npc2.namePos] mouth."],
    stopName: "Stop tail oral",
    stopTip: "Pull your [npc.tail+] out of [npc2.namePos] mouth.",
    stopLines: ["Pulling [npc.her] [npc.tail+] back, [npc.name] [npc.verb(leave)] [npc2.namePos] mouth empty."],
    receiveStart: "Suck [npc2.her] tail",
    receiveTip: "Take [npc2.namePos] [npc2.tail+] into your mouth.",
    receiveLines: ["Leaning in, [npc.name] [npc.verb(wrap)] [npc.her] [npc.lips+] around [npc2.namePos] [npc2.tail+] and [npc.verb(start)] sucking."],
    receiveOn: "Sucking tail",
    receiveStop: "Stop sucking tail",
  });
  shortPair({
    id: "tail_nipple",
    content: "nipple_pen",
    label: "tail-nipple",
    ok: function (g, r) { return hasTail(g) && hasFuckableNipples(r) && LT.isSexExposed(r, "BREASTS"); },
    startName: "Tail-fuck [npc2.her] nipple",
    startTip: "Push your [npc.tail+] into [npc2.namePos] fuckable [npc2.nipple+].",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.tail+] to [npc2.namePos] [npc2.nipple+] and [npc.verb(sink)] it inside."],
    onName: "Tail in nipple",
    onTip: "Keep fucking [npc2.namePos] [npc2.nipple+] with your [npc.tail+].",
    onLines: ["[npc.Name] [npc.verb(thrust)] [npc.her] [npc.tail+] in and out of [npc2.namePos] [npc2.nipple+]."],
    stopName: "Stop tail-nipple",
    stopTip: "Pull your [npc.tail+] out of [npc2.namePos] [npc2.nipple+].",
    stopLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.tail+] free of [npc2.namePos] [npc2.nipple+]."],
    receiveStart: "Get a tail in your nipple",
    receiveTip: "Get [npc2.name] to push [npc2.her] [npc2.tail+] into your fuckable nipple.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.tail+] to [npc.her] [npc.nipple+] and [npc.verb(take)] it in."],
    receiveOn: "Nipple tail-fucked",
    receiveStop: "Stop nipple tail-fucking",
  });
  shortPair({
    id: "tentacle_vagina",
    label: "tentacle-fucking",
    ok: function (g, r) { return hasTentacle(g) && hasVagina(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Tentacle-fuck [npc2.herHim]",
    startTip: "Push a [npc.tentacle+] into [npc2.namePos] [npc2.pussy+].",
    startLines: ["One of [npc.namePos] [npc.tentacles+] [npc.verb(press)] against [npc2.namePos] [npc2.labia+] before sliding deep into [npc2.her] [npc2.pussy+]."],
    onName: "Tentacle-fucking",
    onTip: "Keep thrusting a tentacle in [npc2.namePos] [npc2.pussy+].",
    onLines: ["[npc.NamePos] [npc.tentacle+] [npc.verb(pump)] in and out of [npc2.namePos] [npc2.pussy+]."],
    stopName: "Stop tentacle-fucking",
    stopTip: "Pull your tentacle out of [npc2.namePos] [npc2.pussy+].",
    stopLines: ["The [npc.tentacle+] slips free of [npc2.namePos] [npc2.pussy+]."],
    receiveStart: "Get tentacle-fucked",
    receiveTip: "Take [npc2.namePos] tentacle into your [npc.pussy+].",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.tentacle+] into [npc.her] [npc.pussy+]."],
    receiveOn: "Being tentacle-fucked",
    receiveStop: "Stop being tentacle-fucked",
    selfA: "TWO_LOW",
    tgtA: "FOUR_HIGH",
    startPace: {
      DOM_GENTLE: ["One of [npc.namePos] [npc.tentacles+] slowly [npc.verb(ease)] between [npc2.namePos] [npc2.labia+] and [npc.verb(slide)] into [npc2.her] [npc2.pussy+]."],
      DOM_ROUGH: ["A [npc.tentacle+] roughly [npc.verb(thrust)] into [npc2.namePos] [npc2.pussy+]."],
      SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(sink)] a [npc.tentacle+] into [npc2.namePos] [npc2.pussy+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull the tentacle back, but it is still pushed into [npc2.namePos] [npc2.pussy+]."],
    },
    onPace: {
      DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.tentacle+] in and out of [npc2.namePos] [npc2.pussy+]."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] [npc.her] [npc.tentacle+] in and out of [npc2.namePos] [npc2.pussy+]."],
      SUB_EAGER: ["[npc.Name] desperately [npc.verb(fuck)] [npc2.name] with [npc.her] [npc.tentacle+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to still the tentacle, sobbing as it is still buried in [npc2.namePos] [npc2.pussy+]."],
    },
  });
  shortPair({
    id: "tentacle_anus",
    content: "anal",
    label: "tentacle-pegging",
    ok: function (g, r) { return hasTentacle(g) && LT.isSexExposed(r, "ANUS"); },
    startName: "Tentacle-peg [npc2.herHim]",
    startTip: "Push a tentacle into [npc2.namePos] [npc2.asshole+].",
    startLines: ["A slick [npc.tentacle+] [npc.verb(press)] to [npc2.namePos] [npc2.asshole+] and [npc.verb(push)] inside."],
    onName: "Tentacle-pegging",
    onTip: "Keep fucking [npc2.namePos] ass with a tentacle.",
    onLines: ["The [npc.tentacle+] [npc.verb(thrust)] in and out of [npc2.namePos] [npc2.asshole+]."],
    stopName: "Stop tentacle-pegging",
    stopTip: "Pull the tentacle out.",
    stopLines: ["The tentacle slips free of [npc2.namePos] ass."],
    receiveStart: "Get tentacle-pegged",
    receiveTip: "Take [npc2.namePos] tentacle in your ass.",
    receiveLines: ["[npc.Name] [npc.verb(push)] back onto [npc2.namePos] [npc2.tentacle+]."],
    receiveOn: "Being tentacle-pegged",
    receiveStop: "Stop being tentacle-pegged",
  });
  shortPair({
    id: "tentacle_mouth",
    label: "tentacle oral",
    ok: function (g) { return hasTentacle(g); },
    startName: "Tentacle in [npc2.her] mouth",
    startTip: "Push a tentacle between [npc2.namePos] [npc2.lips+].",
    startLines: ["A [npc.tentacle+] [npc.verb(brush)] [npc2.namePos] [npc2.lips+] before sliding into [npc2.her] mouth."],
    onName: "Tentacle oral",
    onTip: "Keep using [npc2.namePos] mouth.",
    onLines: ["The [npc.tentacle+] [npc.verb(slide)] between [npc2.namePos] [npc2.lips+]."],
    stopName: "Stop tentacle oral",
    stopTip: "Pull the tentacle out of [npc2.namePos] mouth.",
    stopLines: ["The tentacle slips from [npc2.namePos] mouth."],
    receiveStart: "Suck tentacle",
    receiveTip: "Take [npc2.namePos] tentacle into your mouth.",
    receiveLines: ["[npc.Name] [npc.verb(wrap)] [npc.her] [npc.lips+] around [npc2.namePos] [npc2.tentacle+]."],
    receiveOn: "Sucking tentacle",
    receiveStop: "Stop sucking tentacle",
  });
  shortPair({
    id: "tentacle_nipple",
    content: "nipple_pen",
    label: "tentacle-nipple",
    ok: function (g, r) { return hasTentacle(g) && hasFuckableNipples(r) && LT.isSexExposed(r, "BREASTS"); },
    startName: "Tentacle-fuck [npc2.her] nipple",
    startTip: "Push a tentacle into [npc2.namePos] fuckable nipple.",
    startLines: ["A [npc.tentacle+] [npc.verb(find)] [npc2.namePos] [npc2.nipple+] and [npc.verb(sink)] inside."],
    onName: "Tentacle in nipple",
    onTip: "Keep fucking [npc2.namePos] [npc2.nipple+].",
    onLines: ["The tentacle [npc.verb(pump)] in and out of [npc2.namePos] [npc2.nipple+]."],
    stopName: "Stop tentacle-nipple",
    stopTip: "Pull the tentacle out.",
    stopLines: ["The tentacle slips free of [npc2.namePos] nipple."],
    receiveStart: "Get a tentacle in your nipple",
    receiveTip: "Take [npc2.namePos] tentacle into your nipple.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] the [npc2.tentacle+] into [npc.her] [npc.nipple+]."],
    receiveOn: "Nipple tentacle-fucked",
    receiveStop: "Stop nipple tentacle-fucking",
  });
  shortPair({
    id: "clit_vagina",
    label: "clit-fucking",
    ok: function (g, r) { return hasVagina(g) && hasVagina(r) && LT.isSexExposed(g, "VAGINA") && LT.isSexExposed(r, "VAGINA"); },
    startName: "Clit-fuck [npc2.herHim]",
    startTip: "Rub your [npc.clit+] against [npc2.namePos] [npc2.pussy+] and start grinding.",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.clit+] to [npc2.namePos] [npc2.labia+] and [npc.verb(start)] grinding."],
    onName: "Clit-fucking",
    onTip: "Keep grinding your [npc.clit+] against [npc2.namePos] [npc2.pussy+].",
    onLines: ["[npc.Name] [npc.verb(grind)] [npc.her] [npc.clit+] against [npc2.namePos] [npc2.pussy+], both of them moaning."],
    stopName: "Stop clit-fucking",
    stopTip: "Pull your [npc.clit+] away.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.clit+] back from [npc2.namePos] [npc2.pussy+]."],
    receiveStart: "Get clit-fucked",
    receiveTip: "Get [npc2.name] to grind [npc2.her] [npc2.clit+] against you.",
    receiveLines: ["[npc.Name] [npc.verb(pull)] [npc2.name] in until [npc2.her] [npc2.clit+] [npc2.verb(meet)] [npc.her] [npc.pussy+]."],
    receiveOn: "Being clit-fucked",
    receiveStop: "Stop being clit-fucked",
    selfA: "FOUR_HIGH",
    tgtA: "FOUR_HIGH",
  });
  shortPair({
    id: "clit_clit",
    label: "clit-scissoring",
    ok: function (g, r) { return hasVagina(g) && hasVagina(r) && LT.isSexExposed(g, "VAGINA") && LT.isSexExposed(r, "VAGINA"); },
    startName: "Scissor [npc2.herHim]",
    startTip: "Press your [npc.clit+] against [npc2.namePos] [npc2.clit+].",
    startLines: ["[npc.Name] [npc.verb(slot)] [npc.her] [npc.clit+] against [npc2.namePos] [npc2.clit+] and [npc.verb(start)] rubbing."],
    onName: "Scissoring",
    onTip: "Keep rubbing your clits together.",
    onLines: ["Their [npc.clits+] slide together as [npc.name] [npc.verb(grind)] down."],
    stopName: "Stop scissoring",
    stopTip: "Pull your clit away.",
    stopLines: ["[npc.Name] [npc.verb(ease)] [npc.her] [npc.clit+] away from [npc2.namePos]."],
    receiveStart: "Scissor back",
    receiveTip: "Meet [npc2.namePos] [npc2.clit+] with yours.",
    receiveLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.clit+] up to meet [npc2.namePos]."],
    receiveOn: "Scissoring",
    receiveStop: "Stop scissoring",
    selfA: "FOUR_HIGH",
    tgtA: "FOUR_HIGH",
  });
  shortPair({
    id: "clit_mouth",
    label: "clit oral",
    ok: function (g, r) { return hasVagina(g) && LT.isSexExposed(g, "VAGINA"); },
    startName: "Get clit sucked",
    startTip: "Get [npc2.name] to suck your [npc.clit+].",
    startLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] mouth to [npc.her] [npc.clit+] and [npc.verb(let)] out [npc.a_moan+] as [npc2.she] [npc2.verb(start)] sucking."],
    onName: "Clit sucked",
    onTip: "Keep [npc2.namePos] mouth on your [npc.clit+].",
    onLines: ["[npc2.Name] [npc2.verb(suck)] and [npc2.verb(kiss)] [npc.namePos] [npc.clit+]."],
    stopName: "Stop clit oral",
    stopTip: "Pull your clit from [npc2.namePos] mouth.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.clit+] from [npc2.namePos] [npc2.lips+]."],
    receiveStart: "Suck [npc2.her] clit",
    receiveTip: "Lick and suck [npc2.namePos] [npc2.clit+].",
    receiveLines: ["[npc.Name] [npc.verb(lower)] [npc.her] mouth to [npc2.namePos] [npc2.clit+] and [npc.verb(start)] sucking."],
    receiveOn: "Sucking clit",
    receiveStop: "Stop sucking clit",
    selfA: "FOUR_HIGH",
    tgtA: "TWO_LOW",
  });
  shortPair({
    id: "clit_anus",
    content: "anal",
    label: "clit-pegging",
    ok: function (g, r) { return hasVagina(g) && LT.isSexExposed(g, "VAGINA") && LT.isSexExposed(r, "ANUS"); },
    startName: "Clit-peg [npc2.herHim]",
    startTip: "Push your [npc.clit+] against [npc2.namePos] [npc2.asshole+].",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.clit+] to [npc2.namePos] [npc2.asshole+] and [npc.verb(grind)] in."],
    onName: "Clit-pegging",
    onTip: "Keep grinding your [npc.clit+] against [npc2.namePos] ass.",
    onLines: ["[npc.Name] [npc.verb(grind)] [npc.her] [npc.clit+] against [npc2.namePos] [npc2.asshole+]."],
    stopName: "Stop clit-pegging",
    stopTip: "Pull away.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.clit+] back."],
    receiveStart: "Get clit-pegged",
    receiveTip: "Get [npc2.name] to grind [npc2.her] clit against your ass.",
    receiveLines: ["[npc.Name] [npc.verb(push)] [npc.her] ass back onto [npc2.namePos] [npc2.clit+]."],
    receiveOn: "Being clit-pegged",
    receiveStop: "Stop being clit-pegged",
  });
  shortPair({
    id: "clit_nipple",
    content: "nipple_pen",
    label: "clit-nipple",
    ok: function (g, r) { return hasVagina(g) && hasFuckableNipples(r) && LT.isSexExposed(g, "VAGINA") && LT.isSexExposed(r, "BREASTS"); },
    startName: "Clit-fuck [npc2.her] nipple",
    startTip: "Rub your [npc.clit+] against [npc2.namePos] fuckable [npc2.nipple+].",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.clit+] to [npc2.namePos] [npc2.nipple+] and [npc.verb(grind)]."],
    onName: "Clit in nipple",
    onTip: "Keep using [npc2.namePos] [npc2.nipple+].",
    onLines: ["[npc.Name] [npc.verb(rub)] [npc.her] [npc.clit+] against [npc2.namePos] [npc2.nipple+]."],
    stopName: "Stop clit-nipple",
    stopTip: "Pull away.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.clit+] back."],
    receiveStart: "Get clit in your nipple",
    receiveTip: "Get [npc2.name] to use your nipple.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.clit+] to [npc.her] [npc.nipple+]."],
    receiveOn: "Nipple clit-fucked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "penis_armpit",
    content: "armpit",
    label: "armpit-fucking",
    ok: function (g, r) { return hasPenis(g) && LT.isSexExposed(g, "PENIS"); },
    startName: "Thrust into [npc2.her] armpit",
    startTip: "Slide your [npc.cock+] into [npc2.namePos] armpit.",
    startLines: ["[npc.Name] [npc.verb(lift)] [npc2.namePos] arm and [npc.verb(slide)] [npc.her] [npc.cock+] into the warm hollow of [npc2.her] armpit."],
    onName: "Armpit-fucking",
    onTip: "Keep thrusting into [npc2.namePos] armpit.",
    onLines: ["[npc.Name] [npc.verb(thrust)] [npc.her] [npc.cock+] in and out of [npc2.namePos] armpit."],
    stopName: "Stop armpit-fucking",
    stopTip: "Pull your cock out of [npc2.namePos] armpit.",
    stopLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.cock+] free of [npc2.namePos] armpit."],
    receiveStart: "Get [npc2.her] cock in your armpit",
    receiveTip: "Let [npc2.name] fuck your armpit.",
    receiveLines: ["[npc.Name] [npc.verb(raise)] [npc.her] arm and [npc.verb(guide)] [npc2.namePos] [npc2.cock+] into [npc.her] armpit."],
    receiveOn: "Armpit fucked",
    receiveStop: "Stop armpit sex",
    selfA: "FOUR_HIGH",
    tgtA: "TWO_LOW",
  });
  shortPair({
    id: "tongue_armpit",
    content: "armpit",
    label: "armpit-licking",
    ok: function (g, r) { return true; },
    startName: "Lick [npc2.her] armpit",
    startTip: "Put your mouth on [npc2.namePos] armpit.",
    startLines: ["[npc.Name] [npc.verb(lift)] [npc2.namePos] arm and [npc.verb(press)] [npc.her] [npc.tongue+] into [npc2.her] armpit, licking eagerly."],
    onName: "Licking armpit",
    onTip: "Keep licking [npc2.namePos] armpit.",
    onLines: ["[npc.Name] [npc.verb(lap)] at [npc2.namePos] armpit, [npc.tongue+] working steadily."],
    stopName: "Stop licking armpit",
    stopTip: "Pull your mouth away.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] mouth from [npc2.namePos] armpit."],
    receiveStart: "Get your armpit licked",
    receiveTip: "Get [npc2.name] to lick your armpit.",
    receiveLines: ["[npc.Name] [npc.verb(raise)] [npc.her] arm to [npc2.namePos] mouth."],
    receiveOn: "Armpit licked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "penis_urethra_vagina",
    content: "urethra",
    label: "urethral-fucking",
    ok: function (g, r) { return hasPenis(g) && hasVagina(r) && hasFuckableUrethra(r) && LT.isSexExposed(g, "PENIS") && LT.isSexExposed(r, "VAGINA"); },
    startName: "Fuck [npc2.her] urethra",
    startTip: "Push your [npc.cock+] into [npc2.namePos] fuckable urethral opening.",
    startLines: ["[npc.Name] [npc.verb(line)] [npc.her] [npc.cock+] up with [npc2.namePos] urethra and [npc.verb(push)] in."],
    onName: "Urethral-fucking",
    onTip: "Keep thrusting into [npc2.namePos] urethra.",
    onLines: ["[npc.Name] [npc.verb(fuck)] [npc2.namePos] urethra with short, careful thrusts."],
    stopName: "Stop urethral-fucking",
    stopTip: "Pull out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] free of [npc2.namePos] urethra."],
    receiveStart: "Get your urethra fucked",
    receiveTip: "Take [npc2.namePos] cock in your urethra.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.cock+] to [npc.her] urethra."],
    receiveOn: "Urethra fucked",
    receiveStop: "Stop",
    selfA: "FOUR_HIGH",
    tgtA: "FOUR_HIGH",
  });
  shortPair({
    id: "penis_urethra_penis",
    content: "urethra",
    label: "cock-urethra",
    ok: function (g, r) { return hasPenis(g) && hasPenis(r) && hasFuckableUrethra(r) && LT.isSexExposed(g, "PENIS") && LT.isSexExposed(r, "PENIS"); },
    startName: "Fuck [npc2.her] cock-urethra",
    startTip: "Push into [npc2.namePos] fuckable urethral opening.",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.cock+] to the slit of [npc2.namePos] [npc2.cock+] and [npc.verb(push)] in."],
    onName: "Cock-urethral-fucking",
    onTip: "Keep thrusting.",
    onLines: ["[npc.Name] [npc.verb(thrust)] carefully into [npc2.namePos] urethra."],
    stopName: "Stop",
    stopTip: "Pull out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] free."],
    receiveStart: "Get your cock-urethra fucked",
    receiveTip: "Take [npc2.name] in your urethra.",
    receiveLines: ["[npc.Name] [npc.verb(hold)] still as [npc2.name] [npc2.verb(line)] up."],
    receiveOn: "Cock-urethra fucked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "toy_vagina",
    label: "toying",
    ok: function (g, r) { return hasSexToy(g) && hasVagina(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Use a toy on [npc2.herHim]",
    startTip: "Slide a dildo or vibrator into [npc2.namePos] [npc2.pussy+].",
    startLines: ["[npc.Name] [npc.verb(press)] the toy to [npc2.namePos] [npc2.labia+] and [npc.verb(sink)] it into [npc2.her] [npc2.pussy+]."],
    onName: "Using toy",
    onTip: "Keep working the toy in [npc2.namePos] [npc2.pussy+].",
    onLines: ["[npc.Name] [npc.verb(work)] the toy in and out of [npc2.namePos] [npc2.pussy+]."],
    stopName: "Stop toying",
    stopTip: "Pull the toy out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] the toy free of [npc2.namePos] [npc2.pussy+]."],
    receiveStart: "Get toyed",
    receiveTip: "Get [npc2.name] to use a toy on you.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] the toy into [npc.her] [npc.pussy+]."],
    receiveOn: "Being toyed",
    receiveStop: "Stop being toyed",
    tgtA: "FOUR_HIGH",
    startPace: {
      DOM_GENTLE: ["Slowly pressing the toy to [npc2.namePos] [npc2.labia+], [npc.name] gently [npc.verb(ease)] it into [npc2.her] [npc2.pussy+]."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] the toy into [npc2.namePos] [npc2.pussy+]."],
      SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(sink)] the toy into [npc2.namePos] [npc2.pussy+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull the toy back, but it is still pushed into [npc2.namePos] [npc2.pussy+]."],
    },
    onPace: {
      DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] the toy in and out of [npc2.namePos] [npc2.pussy+]."],
      DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] the toy in and out of [npc2.namePos] [npc2.pussy+]."],
      SUB_EAGER: ["[npc.Name] desperately [npc.verb(work)] the toy in [npc2.namePos] [npc2.pussy+]."],
      SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop moving the toy, sobbing as it is still buried in [npc2.namePos] [npc2.pussy+]."],
    },
  });
  shortPair({
    id: "toy_anus",
    content: "anal",
    label: "anal toying",
    ok: function (g, r) { return hasSexToy(g) && LT.isSexExposed(r, "ANUS"); },
    startName: "Use a toy in [npc2.her] ass",
    startTip: "Push a toy into [npc2.namePos] [npc2.asshole+].",
    startLines: ["[npc.Name] [npc.verb(press)] the toy to [npc2.namePos] [npc2.asshole+] and [npc.verb(ease)] it in."],
    onName: "Anal toying",
    onTip: "Keep using the toy in [npc2.namePos] ass.",
    onLines: ["[npc.Name] [npc.verb(work)] the toy in and out of [npc2.namePos] [npc2.asshole+]."],
    stopName: "Stop anal toying",
    stopTip: "Pull the toy out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] the toy free."],
    receiveStart: "Get a toy in your ass",
    receiveTip: "Take the toy in your ass.",
    receiveLines: ["[npc.Name] [npc.verb(push)] back onto the toy."],
    receiveOn: "Ass being toyed",
    receiveStop: "Stop",
  });

  shortPair({
    id: "finger_clit",
    label: "clit fingering",
    ok: function (g, r) { return hasVagina(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Finger [npc2.her] clit",
    startTip: "Rub and tease [npc2.namePos] [npc2.clit+].",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.fingers] to [npc2.namePos] [npc2.clit+] and [npc.verb(start)] stroking in tight circles."],
    onName: "Fingering clit",
    onTip: "Keep playing with [npc2.namePos] [npc2.clit+].",
    onLines: ["[npc.Name] eagerly [npc.verb(rub)] [npc2.namePos] [npc2.clit+], drawing [npc2.a_moan+] from [npc2.her] [npc2.lips]."],
    stopName: "Stop fingering clit",
    stopTip: "Take your fingers away from [npc2.namePos] clit.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.fingers] back from [npc2.namePos] [npc2.clit+]."],
    receiveStart: "Get your clit fingered",
    receiveTip: "Get [npc2.name] to play with your [npc.clit+].",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.fingers] onto [npc.her] [npc.clit+]."],
    receiveOn: "Clit being fingered",
    receiveStop: "Stop",
    tgtA: "FOUR_HIGH",
  });
  shortPair({
    id: "finger_mouth",
    label: "fingers in mouth",
    ok: function (g, r) { return LT.isSexExposed(r, "MOUTH"); },
    startName: "Push fingers into [npc2.her] mouth",
    startTip: "Slide your [npc.fingers] between [npc2.namePos] [npc2.lips+].",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.fingers] to [npc2.namePos] [npc2.lips+] and [npc.verb(push)] them into [npc2.her] mouth."],
    onName: "Fingers in mouth",
    onTip: "Keep your fingers in [npc2.namePos] mouth.",
    onLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.fingers] over [npc2.namePos] [npc2.tongue], letting [npc2.herHim] suck on them."],
    stopName: "Stop fingers in mouth",
    stopTip: "Pull your fingers out of [npc2.namePos] mouth.",
    stopLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.fingers] free of [npc2.namePos] mouth."],
    receiveStart: "Suck [npc2.her] fingers",
    receiveTip: "Take [npc2.namePos] fingers into your mouth.",
    receiveLines: ["[npc.Name] [npc.verb(part)] [npc.her] [npc.lips+] and [npc.verb(take)] [npc2.namePos] [npc2.fingers] into [npc.her] mouth."],
    receiveOn: "Sucking fingers",
    receiveStop: "Stop sucking fingers",
  });
  shortPair({
    id: "finger_finger",
    label: "holding hands",
    ok: function () { return true; },
    startName: "Hold [npc2.her] hand",
    startTip: "Interlace your [npc.fingers] with [npc2.namePos].",
    startLines: ["[npc.Name] [npc.verb(reach)] out and [npc.verb(lace)] [npc.her] [npc.fingers] through [npc2.namePos]."],
    onName: "Holding hands",
    onTip: "Keep holding [npc2.namePos] hand.",
    onLines: ["[npc.Name] [npc.verb(squeeze)] [npc2.namePos] [npc2.fingers], keeping their hands locked together."],
    stopName: "Let go",
    stopTip: "Release [npc2.namePos] hand.",
    stopLines: ["[npc.Name] [npc.verb(let)] [npc2.namePos] hand slip free."],
    receiveStart: "Take [npc2.her] hand",
    receiveTip: "Take hold of [npc2.namePos] hand.",
    receiveLines: ["[npc.Name] [npc.verb(take)] [npc2.namePos] [npc2.hand] in [npc.hers]."],
    receiveOn: "Hands held",
    receiveStop: "Let go",
    selfA: "ONE_MINIMUM",
    tgtA: "ONE_MINIMUM",
  });
  shortPair({
    id: "tongue_breasts",
    label: "licking breasts",
    ok: function (g, r) { return hasBreasts(r) && LT.isSexExposed(r, "BREASTS"); },
    startName: "Lick [npc2.her] breasts",
    startTip: "Run your [npc.tongue] over [npc2.namePos] [npc2.breasts+].",
    startLines: ["[npc.Name] [npc.verb(lean)] in and [npc.verb(drag)] [npc.her] [npc.tongue] over [npc2.namePos] [npc2.breasts+]."],
    onName: "Licking breasts",
    onTip: "Keep licking [npc2.namePos] [npc2.breasts+].",
    onLines: ["[npc.Name] hungrily [npc.verb(lick)] and [npc.verb(kiss)] [npc2.namePos] [npc2.breasts+]."],
    stopName: "Stop licking breasts",
    stopTip: "Pull your mouth back from [npc2.namePos] breasts.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.tongue] back from [npc2.namePos] [npc2.breasts+]."],
    receiveStart: "Get your breasts licked",
    receiveTip: "Push your [npc.breasts+] into [npc2.namePos] face.",
    receiveLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.breasts+] against [npc2.namePos] [npc2.lips]."],
    receiveOn: "Breasts being licked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "tongue_mound",
    label: "licking mound",
    ok: function (g, r) { return !hasVagina(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Lick [npc2.her] mound",
    startTip: "Lick over [npc2.namePos] genderless groin.",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.tongue] to [npc2.namePos] smooth mound and [npc.verb(start)] licking."],
    onName: "Licking mound",
    onTip: "Keep licking [npc2.namePos] mound.",
    onLines: ["[npc.Name] eagerly [npc.verb(lap)] over [npc2.namePos] groin, teasing the featureless mound with [npc.her] [npc.tongue]."],
    stopName: "Stop licking mound",
    stopTip: "Pull your mouth back.",
    stopLines: ["[npc.Name] [npc.verb(lift)] [npc.her] head from [npc2.namePos] groin."],
    receiveStart: "Get your mound licked",
    receiveTip: "Get [npc2.name] to lick your groin.",
    receiveLines: ["[npc.Name] [npc.verb(push)] [npc.her] groin into [npc2.namePos] [npc2.face]."],
    receiveOn: "Mound being licked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "foot_mouth",
    content: "foot",
    label: "foot worship",
    ok: function (g, r) { return LT.isSexExposed(g, "FOOT") && LT.isSexExposed(r, "MOUTH"); },
    startName: "Push a foot into [npc2.her] mouth",
    startTip: "Press your [npc.foot] to [npc2.namePos] [npc2.lips+].",
    startLines: ["[npc.Name] [npc.verb(lift)] [npc.her] [npc.foot] to [npc2.namePos] [npc2.lips+] and [npc.verb(push)] it into [npc2.her] mouth."],
    onName: "Foot in mouth",
    onTip: "Keep your [npc.foot] in [npc2.namePos] mouth.",
    onLines: ["[npc.Name] [npc.verb(let)] [npc2.name] [npc2.verb(lick)] and [npc2.verb(suck)] [npc.her] [npc.foot]."],
    stopName: "Stop foot worship",
    stopTip: "Pull your foot back.",
    stopLines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.foot] out of [npc2.namePos] mouth."],
    receiveStart: "Worship [npc2.her] foot",
    receiveTip: "Take [npc2.namePos] [npc2.foot] into your mouth.",
    receiveLines: ["[npc.Name] [npc.verb(lean)] down and [npc.verb(take)] [npc2.namePos] [npc2.foot] into [npc.her] mouth."],
    receiveOn: "Worshipping foot",
    receiveStop: "Stop",
  });
  shortPair({
    id: "penis_spinneret",
    label: "spinneret-fucking",
    ok: function (g, r) { return hasPenis(g) && LT.isSexExposed(g, "PENIS") && hasSpinneret(r); },
    startName: "Fuck [npc2.her] spinneret",
    startTip: "Sink your [npc.cock+] into [npc2.namePos] spinneret.",
    startLines: ["[npc.Name] [npc.verb(line)] [npc.her] [npc.cock+] up with [npc2.namePos] spinneret and [npc.verb(thrust)] in."],
    onName: "Fucking spinneret",
    onTip: "Keep fucking [npc2.namePos] spinneret.",
    onLines: ["[npc.Name] [npc.verb(pump)] [npc.her] [npc.cock+] in and out of [npc2.namePos] spinneret."],
    stopName: "Stop spinneret-fucking",
    stopTip: "Pull out of [npc2.namePos] spinneret.",
    stopLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.cock+] free of [npc2.namePos] spinneret."],
    receiveStart: "Get your spinneret fucked",
    receiveTip: "Take [npc2.name] in your spinneret.",
    receiveLines: ["[npc.Name] [npc.verb(push)] back, taking [npc2.namePos] [npc2.cock+] into [npc.her] spinneret."],
    receiveOn: "Spinneret being fucked",
    receiveStop: "Stop",
    selfA: "FOUR_HIGH",
    tgtA: "FOUR_HIGH",
  });
  shortPair({
    id: "tail_spinneret",
    label: "tail-spinneret",
    ok: function (g, r) { return hasTail(g) && hasSpinneret(r); },
    startName: "Tail-fuck [npc2.her] spinneret",
    startTip: "Push your [npc.tail+] into [npc2.namePos] spinneret.",
    startLines: ["[npc.Name] [npc.verb(curl)] [npc.her] [npc.tail+] into [npc2.namePos] spinneret."],
    onName: "Tail in spinneret",
    onTip: "Keep using your tail.",
    onLines: ["[npc.Name] [npc.verb(work)] [npc.her] [npc.tail+] in and out of [npc2.namePos] spinneret."],
    stopName: "Stop",
    stopTip: "Pull your tail out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.tail+] free."],
    receiveStart: "Get tail in your spinneret",
    receiveTip: "Take [npc2.namePos] tail in your spinneret.",
    receiveLines: ["[npc.Name] [npc.verb(take)] [npc2.namePos] [npc2.tail+] into [npc.her] spinneret."],
    receiveOn: "Spinneret tail-fucked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "tentacle_spinneret",
    label: "tentacle-spinneret",
    ok: function (g, r) { return hasTentacle(g) && hasSpinneret(r); },
    startName: "Tentacle-fuck [npc2.her] spinneret",
    startTip: "Push a tentacle into [npc2.namePos] spinneret.",
    startLines: ["[npc.Name] [npc.verb(slip)] a tentacle into [npc2.namePos] spinneret."],
    onName: "Tentacle in spinneret",
    onTip: "Keep thrusting.",
    onLines: ["[npc.Name] [npc.verb(pump)] a tentacle in and out of [npc2.namePos] spinneret."],
    stopName: "Stop",
    stopTip: "Pull the tentacle out.",
    stopLines: ["[npc.Name] [npc.verb(withdraw)] the tentacle."],
    receiveStart: "Get a tentacle in your spinneret",
    receiveTip: "Take a tentacle in your spinneret.",
    receiveLines: ["[npc.Name] [npc.verb(take)] the tentacle into [npc.her] spinneret."],
    receiveOn: "Spinneret tentacle-fucked",
    receiveStop: "Stop",
  });
  shortPair({
    id: "finger_crotch_nipple",
    content: "nipple_pen",
    label: "crotch-nipple fingering",
    ok: function (g, r) { return hasFuckableCrotchNipples(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Finger [npc2.her] crotch-nipples",
    startTip: "Push your [npc.fingers] into [npc2.namePos] crotch-nipples.",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.fingers] into [npc2.namePos] fuckable crotch-nipples."],
    onName: "Fingering crotch-nipples",
    onTip: "Keep fingering [npc2.namePos] crotch-nipples.",
    onLines: ["[npc.Name] [npc.verb(work)] [npc.her] [npc.fingers] in and out of [npc2.namePos] crotch-nipples."],
    stopName: "Stop",
    stopTip: "Pull your fingers out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.fingers] free."],
    receiveStart: "Get crotch-nipples fingered",
    receiveTip: "Get [npc2.name] to finger your crotch-nipples.",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.fingers] into [npc.her] crotch-nipples."],
    receiveOn: "Crotch-nipples fingered",
    receiveStop: "Stop",
  });
  shortPair({
    id: "penis_crotch_nipple",
    content: "nipple_pen",
    label: "crotch-nipple-fucking",
    ok: function (g, r) { return hasPenis(g) && LT.isSexExposed(g, "PENIS") && hasFuckableCrotchNipples(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Fuck [npc2.her] crotch-nipples",
    startTip: "Sink your [npc.cock+] into [npc2.namePos] crotch-nipples.",
    startLines: ["[npc.Name] [npc.verb(thrust)] [npc.her] [npc.cock+] into [npc2.namePos] crotch-nipple."],
    onName: "Fucking crotch-nipples",
    onTip: "Keep fucking [npc2.namePos] crotch-nipples.",
    onLines: ["[npc.Name] [npc.verb(pump)] [npc.her] [npc.cock+] in and out of [npc2.namePos] crotch-nipple."],
    stopName: "Stop",
    stopTip: "Pull out.",
    stopLines: ["[npc.Name] [npc.verb(slide)] free of [npc2.namePos] crotch-nipple."],
    receiveStart: "Get crotch-nipples fucked",
    receiveTip: "Take [npc2.name] in your crotch-nipples.",
    receiveLines: ["[npc.Name] [npc.verb(sink)] down onto [npc2.namePos] [npc2.cock+]."],
    receiveOn: "Crotch-nipples fucked",
    receiveStop: "Stop",
    selfA: "FOUR_HIGH",
    tgtA: "FOUR_HIGH",
  });
  shortPair({
    id: "tongue_crotch_nipple",
    content: "nipple_pen",
    label: "crotch-nipple licking",
    ok: function (g, r) { return hasCrotchBoobs(r) && LT.isSexExposed(r, "VAGINA"); },
    startName: "Lick [npc2.her] crotch-nipples",
    startTip: "Lick [npc2.namePos] crotch-nipples.",
    startLines: ["[npc.Name] [npc.verb(press)] [npc.her] [npc.tongue] to [npc2.namePos] crotch-nipples and [npc.verb(start)] licking."],
    onName: "Licking crotch-nipples",
    onTip: "Keep licking.",
    onLines: ["[npc.Name] eagerly [npc.verb(lap)] over [npc2.namePos] crotch-nipples."],
    stopName: "Stop",
    stopTip: "Pull back.",
    stopLines: ["[npc.Name] [npc.verb(lift)] [npc.her] head."],
    receiveStart: "Get crotch-nipples licked",
    receiveTip: "Get [npc2.name] to lick your crotch-nipples.",
    receiveLines: ["[npc.Name] [npc.verb(push)] [npc.her] crotch-boobs into [npc2.namePos] [npc2.face]."],
    receiveOn: "Crotch-nipples licked",
    receiveStop: "Stop",
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
        return parseSex(pickPaceLines(spec.start.lines, spec.start.pace, src), src, src);
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
        return !!findLink(spec.id, function (l) { return l.giver === src && l.receiver === src; });
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.ongoing.tip, src, tgt);
      },
      perform: function (src) {
        return parseSex(pickPaceLines(spec.ongoing.lines, spec.ongoing.pace, src), src, src);
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
        return !!findLink(spec.id, function (l) { return l.giver === src && l.receiver === src; });
      },
      tooltip: function (src, tgt) {
        return parseSex(spec.stop.tip, src, tgt);
      },
      perform: function (src) {
        var link = findLink(spec.id, function (l) { return l.giver === src && l.receiver === src; });
        var text = parseSex(pick(spec.stop.lines), src, src);
        if (link) removeLink(link);
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
      pace: {
        DOM_GENTLE: ["Slowly reaching between [npc.her] [npc.legs], [npc.name] gently [npc.verb(ease)] [npc.her] [npc.fingers] into [npc.her] [npc.pussy+]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(thrust)] [npc.her] [npc.fingers] deep into [npc.her] [npc.pussy+]."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(sink)] [npc.her] [npc.fingers] into [npc.her] [npc.pussy+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to pull [npc.her] hand away, but [npc.her] [npc.fingers] are still pushed into [npc.her] [npc.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(slide)] [npc.her] [npc.fingers] in and out of [npc.her] [npc.pussy+]."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(pump)] [npc.her] [npc.fingers] in and out of [npc.her] [npc.pussy+]."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(finger)] [npc.herself], moaning as [npc.she] [npc.verb(curl)] [npc.her] digits as deep as they will go."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to stop, sobbing as [npc.her] [npc.fingers] are still buried in [npc.her] [npc.pussy+]."],
      },
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
      pace: {
        DOM_GENTLE: ["Slowly wrapping [npc.her] [npc.fingers] around [npc.her] [npc.cock+], [npc.name] gently [npc.verb(start)] stroking."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(grab)] [npc.her] [npc.cock+] and [npc.verb(start)] jerking off with tight, fast strokes."],
        SUB_EAGER: ["With a desperate [npc.moan], [npc.name] greedily [npc.verb(stroke)] [npc.her] [npc.cock+]."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to take [npc.her] hand away, but [npc.her] [npc.fingers] are still wrapped around [npc.her] [npc.cock+]."],
      },
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
      pace: {
        DOM_GENTLE: ["[npc.Name] slowly [npc.verb(stroke)] [npc.her] [npc.cock+], gently sliding [npc.her] [npc.fingers] up and down."],
        DOM_ROUGH: ["[npc.Name] roughly [npc.verb(jerk)] [npc.her] [npc.cock+], pumping [npc.her] [npc.hand] with a tight grip."],
        SUB_EAGER: ["[npc.Name] desperately [npc.verb(stroke)] [npc.her] [npc.cock+], moaning as [npc.she] [npc.verb(work)] [npc.her] [npc.hand] as fast as [npc.she] can."],
        SUB_RESISTING: ["[npc.Name] [npc.verb(try)] to let go, sobbing as [npc.her] [npc.fingers] are still wrapped around [npc.her] [npc.cock+]."],
      },
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
    content: "anal",
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

  registerSelf({
    id: "self_tail_vagina",
    label: "self tail-fucking",
    ok: function (src) {
      return hasTail(src) && hasVagina(src) && LT.isSexExposed(src, "VAGINA");
    },
    start: {
      name: "Tail-fuck [npc.herself]",
      tip: "Slide your [npc.tail+] into your own [npc.pussy+].",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["Curling [npc.her] [npc.tail+] down between [npc.her] [npc.legs], [npc.name] [npc.verb(push)] it into [npc.her] [npc.pussy+] and [npc.verb(let)] out [npc.a_moan+]."],
    },
    ongoing: {
      name: "Tail-fucking [npc.herself]",
      tip: "Keep using your [npc.tail+] on yourself.",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(pump)] [npc.her] [npc.tail+] in and out of [npc.her] [npc.pussy+]."],
    },
    stop: {
      name: "Stop tail-fucking [npc.herself]",
      tip: "Pull your tail out.",
      lines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.tail+] free."],
    },
  });
  registerSelf({
    id: "self_tail_anus",
    content: "anal",
    label: "self tail-pegging",
    ok: function (src) {
      return hasTail(src) && LT.isSexExposed(src, "ANUS");
    },
    start: {
      name: "Tail-peg [npc.herself]",
      tip: "Push your [npc.tail+] into your own ass.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(curl)] [npc.her] [npc.tail+] back and [npc.verb(sink)] it into [npc.her] [npc.asshole+]."],
    },
    ongoing: {
      name: "Tail-pegging [npc.herself]",
      tip: "Keep using your tail.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(work)] [npc.her] [npc.tail+] in and out of [npc.her] [npc.asshole+]."],
    },
    stop: {
      name: "Stop tail-pegging [npc.herself]",
      tip: "Pull your tail out.",
      lines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.tail+] free."],
    },
  });
  registerSelf({
    id: "self_penis_vagina",
    label: "fucking herself",
    ok: function (src) {
      return hasPenis(src) && hasVagina(src) && LT.isSexExposed(src, "PENIS") && LT.isSexExposed(src, "VAGINA");
    },
    start: {
      name: "Fuck [npc.herself]",
      tip: "Sink your [npc.cock+] into your own [npc.pussy+].",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["Bending [npc.her] [npc.cock+] down, [npc.name] [npc.verb(guide)] it into [npc.her] own [npc.pussy+] and [npc.verb(start)] fucking [npc.herself]."],
    },
    ongoing: {
      name: "Fucking [npc.herself]",
      tip: "Keep thrusting into yourself.",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(rock)] [npc.her] [npc.hips], sliding [npc.her] [npc.cock+] in and out of [npc.her] own [npc.pussy+]."],
    },
    stop: {
      name: "Stop fucking [npc.herself]",
      tip: "Pull out of yourself.",
      lines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.cock+] free of [npc.her] [npc.pussy+]."],
    },
  });
  registerSelf({
    id: "self_penis_anus",
    label: "pegging herself",
    ok: function (src) {
      return hasPenis(src) && LT.isSexExposed(src, "PENIS") && LT.isSexExposed(src, "ANUS");
    },
    start: {
      name: "Fuck [npc.her] own ass",
      tip: "Push your [npc.cock+] into your own [npc.asshole+].",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(bend)] [npc.her] [npc.cock+] back and [npc.verb(ease)] it into [npc.her] own [npc.asshole+]."],
    },
    ongoing: {
      name: "Fucking [npc.her] own ass",
      tip: "Keep thrusting.",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(work)] [npc.her] [npc.cock+] in and out of [npc.her] own [npc.asshole+]."],
    },
    stop: {
      name: "Stop",
      tip: "Pull out.",
      lines: ["[npc.Name] [npc.verb(slide)] free."],
    },
  });
  registerSelf({
    id: "self_penis_mouth",
    label: "autofellatio",
    ok: function (src) {
      return hasPenis(src) && LT.isSexExposed(src, "PENIS") && LT.isSexExposed(src, "MOUTH");
    },
    start: {
      name: "Suck [npc.her] own cock",
      tip: "Bend down and take your [npc.cock+] into your mouth.",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(bend)] down and [npc.verb(wrap)] [npc.her] [npc.lips+] around [npc.her] own [npc.cock+]."],
    },
    ongoing: {
      name: "Sucking [npc.her] own cock",
      tip: "Keep sucking yourself.",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(bob)] [npc.her] head, sucking [npc.her] own [npc.cock+]."],
    },
    stop: {
      name: "Stop autofellatio",
      tip: "Take your cock out of your mouth.",
      lines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.cock+] out of [npc.her] mouth."],
    },
  });
  registerSelf({
    id: "self_tongue_vagina",
    label: "self cunnilingus",
    ok: function (src) {
      return hasVagina(src) && LT.isSexExposed(src, "VAGINA");
    },
    start: {
      name: "Lick [npc.her] own pussy",
      tip: "Bend down and lick your [npc.pussy+].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(bend)] down and [npc.verb(drag)] [npc.her] [npc.tongue] over [npc.her] own [npc.pussy+]."],
    },
    ongoing: {
      name: "Licking [npc.herself]",
      tip: "Keep licking yourself.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] hungrily [npc.verb(lap)] at [npc.her] own [npc.pussy+]."],
    },
    stop: {
      name: "Stop",
      tip: "Lift your head.",
      lines: ["[npc.Name] [npc.verb(lift)] [npc.her] head."],
    },
  });
  registerSelf({
    id: "self_tongue_anus",
    label: "self anilingus",
    ok: function (src) {
      return LT.isSexExposed(src, "ANUS");
    },
    start: {
      name: "Lick [npc.her] own ass",
      tip: "Lick your own [npc.asshole+].",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(reach)] back and [npc.verb(drag)] [npc.her] [npc.tongue] over [npc.her] own [npc.asshole+]."],
    },
    ongoing: {
      name: "Licking [npc.her] own ass",
      tip: "Keep licking.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(lap)] at [npc.her] own [npc.asshole+]."],
    },
    stop: {
      name: "Stop",
      tip: "Stop licking.",
      lines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.tongue] back."],
    },
  });
  registerSelf({
    id: "self_finger_mouth",
    label: "sucking fingers",
    ok: function () {
      return true;
    },
    start: {
      name: "Suck [npc.her] fingers",
      tip: "Push your [npc.fingers] into your own mouth.",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.fingers] into [npc.her] own mouth and [npc.verb(start)] sucking."],
    },
    ongoing: {
      name: "Sucking [npc.her] fingers",
      tip: "Keep sucking your fingers.",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(suck)] on [npc.her] [npc.fingers], coating them in saliva."],
    },
    stop: {
      name: "Stop",
      tip: "Take your fingers out of your mouth.",
      lines: ["[npc.Name] [npc.verb(pull)] [npc.her] [npc.fingers] free."],
    },
  });
  registerSelf({
    id: "self_tail_mouth",
    label: "sucking tail",
    ok: function (src) {
      return hasTail(src);
    },
    start: {
      name: "Suck [npc.her] tail",
      tip: "Take your [npc.tail+] into your mouth.",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(curl)] [npc.her] [npc.tail+] up and [npc.verb(take)] it into [npc.her] mouth."],
    },
    ongoing: {
      name: "Sucking [npc.her] tail",
      tip: "Keep sucking your tail.",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(suck)] on [npc.her] [npc.tail+]."],
    },
    stop: {
      name: "Stop",
      tip: "Take your tail out of your mouth.",
      lines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.tail+] free."],
    },
  });
  registerSelf({
    id: "self_finger_breasts",
    label: "fondling own breasts",
    ok: function (src) {
      return hasBreasts(src);
    },
    start: {
      name: "Grope [npc.her] own breasts",
      tip: "Reach up and start fondling your own [npc.breasts+].",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["Reaching up to [npc.her] chest, [npc.name] [npc.verb(start)] eagerly groping [npc.her] own [npc.breasts+]."],
    },
    ongoing: {
      name: "Groping [npc.her] breasts",
      tip: "Keep fondling your [npc.breasts+].",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(squeeze)] and [npc.verb(fondle)] [npc.her] own [npc.breasts+]."],
    },
    stop: {
      name: "Stop",
      tip: "Stop groping your breasts.",
      lines: ["[npc.Name] [npc.verb(take)] [npc.her] [npc.hands] away from [npc.her] [npc.breasts+]."],
    },
  });
  registerSelf({
    id: "self_mound",
    label: "rubbing mound",
    ok: function (src) {
      return !hasVagina(src) && !hasPenis(src);
    },
    start: {
      name: "Rub [npc.her] mound",
      tip: "Reach down and start rubbing your genderless mound.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["Reaching down between [npc.her] [npc.legs], [npc.name] [npc.verb(start)] rubbing [npc.her] sensitive genderless mound."],
    },
    ongoing: {
      name: "Rubbing mound",
      tip: "Keep rubbing your mound.",
      selfA: "THREE_NORMAL",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(rub)] [npc.her] genderless mound, letting out [npc.a_moan+]."],
    },
    stop: {
      name: "Stop",
      tip: "Stop rubbing your mound.",
      lines: ["[npc.Name] [npc.verb(take)] [npc.her] [npc.hand] away from [npc.her] mound."],
    },
  });
  registerSelf({
    id: "self_tongue_mouth",
    label: "licking lips",
    ok: function () {
      return true;
    },
    start: {
      name: "Lick [npc.her] lips",
      tip: "Run your tongue over your own [npc.lips+].",
      selfA: "ONE_MINIMUM",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(run)] [npc.her] [npc.tongue+] over [npc.her] own [npc.lips+]."],
    },
    ongoing: {
      name: "Licking [npc.her] lips",
      tip: "Keep licking your lips.",
      selfA: "ONE_MINIMUM",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] slowly [npc.verb(lick)] [npc.her] own [npc.lips+]."],
    },
    stop: {
      name: "Stop",
      tip: "Stop licking your lips.",
      lines: ["[npc.Name] [npc.verb(close)] [npc.her] mouth."],
    },
  });
  registerSelf({
    id: "self_tongue_nipple",
    label: "licking own nipples",
    ok: function (src) {
      return hasBreasts(src) && LT.isSexExposed(src, "BREASTS");
    },
    start: {
      name: "Lick [npc.her] own nipples",
      tip: "Bend down and start licking your own [npc.nipples+].",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["Bending [npc.her] head down, [npc.name] [npc.verb(start)] licking [npc.her] own [npc.nipple+]."],
    },
    ongoing: {
      name: "Licking [npc.her] nipples",
      tip: "Keep licking your nipples.",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(lap)] at [npc.her] own [npc.nipple+]."],
    },
    stop: {
      name: "Stop",
      tip: "Stop licking your nipples.",
      lines: ["[npc.Name] [npc.verb(lift)] [npc.her] head away from [npc.her] [npc.breasts+]."],
    },
  });
  registerSelf({
    id: "self_tail_nipple",
    label: "tail-nipple",
    ok: function (src) {
      return hasTail(src) && hasBreasts(src) && LT.isSexExposed(src, "BREASTS");
    },
    start: {
      name: "Tease [npc.her] nipple with [npc.her] tail",
      tip: "Rub your [npc.tail+] over your own [npc.nipple+].",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(curl)] [npc.her] [npc.tail+] up and [npc.verb(tease)] [npc.her] own [npc.nipple+]."],
    },
    ongoing: {
      name: "Tail on [npc.her] nipple",
      tip: "Keep teasing your nipple with your tail.",
      selfA: "TWO_LOW",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.NamePos] [npc.tail+] [npc.verb(rub)] over [npc.her] own [npc.nipple+]."],
    },
    stop: {
      name: "Stop",
      tip: "Pull your tail away.",
      lines: ["[npc.Name] [npc.verb(unwrap)] [npc.her] [npc.tail+] from [npc.her] [npc.breast+]."],
    },
  });
  registerSelf({
    id: "self_penis_nipple",
    label: "fucking own nipple",
    ok: function (src) {
      return hasPenis(src) && hasFuckableNipples(src) && LT.isSexExposed(src, "PENIS") && LT.isSexExposed(src, "BREASTS");
    },
    start: {
      name: "Fuck [npc.her] own nipple",
      tip: "Slide your [npc.cock+] into your own fuckable [npc.nipple+].",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(line)] [npc.her] [npc.cock+] up to [npc.her] own [npc.nipple+] and [npc.verb(push)] inside."],
    },
    ongoing: {
      name: "Fucking [npc.her] nipple",
      tip: "Keep fucking your own nipple.",
      selfA: "FOUR_HIGH",
      tgtA: "ONE_MINIMUM",
      lines: ["[npc.Name] [npc.verb(thrust)] [npc.her] [npc.cock+] in and out of [npc.her] own [npc.nipple+]."],
    },
    stop: {
      name: "Stop",
      tip: "Pull out of your nipple.",
      lines: ["[npc.Name] [npc.verb(slide)] [npc.her] [npc.cock+] free of [npc.her] [npc.nipple+]."],
    },
  });
  shortPair({
    id: "finger_breasts",
    label: "groping",
    ok: function (g, r) {
      return hasBreasts(r);
    },
    startName: "Fondle [npc2.her] breasts",
    startTip: "Reach out and start fondling [npc2.namePos] [npc2.breasts+].",
    startLines: ["[npc.Name] [npc.verb(reach)] out and [npc.verb(start)] eagerly fondling [npc2.namePos] [npc2.breasts+]."],
    onName: "Fondling breasts",
    onTip: "Keep groping [npc2.namePos] [npc2.breasts+].",
    onLines: ["[npc.Name] [npc.verb(squeeze)] and [npc.verb(fondle)] [npc2.namePos] [npc2.breasts+]."],
    stopName: "Stop fondling",
    stopTip: "Take your hands off [npc2.namePos] breasts.",
    stopLines: ["[npc.Name] [npc.verb(take)] [npc.her] [npc.hands] away from [npc2.namePos] [npc2.breasts+]."],
    receiveStart: "Get breasts fondled",
    receiveTip: "Get [npc2.name] to fondle your [npc.breasts+].",
    receiveLines: ["[npc.Name] [npc.verb(guide)] [npc2.namePos] [npc2.hands] onto [npc.her] [npc.breasts+]."],
    receiveOn: "Breasts fondled",
    receiveStop: "Stop",
    selfA: "TWO_LOW",
    tgtA: "THREE_NORMAL",
  });

  LT.sex.hasSpinneret = hasSpinneret;
  LT.sex.hasCrotchBoobs = hasCrotchBoobs;
  LT.sex.hasFuckableCrotchNipples = hasFuckableCrotchNipples;
  LT.sex.pickPaceLines = pickPaceLines;

  function applyManagerSpec(mgr, opts) {
    opts = opts || {};
    mgr = mgr || {};
    LT.sex.managerSpec = mgr;
    LT.sex.manager = mgr.id || LT.sex.manager || "generic";
    if (mgr.lockPosition || mgr.preventPositioning) LT.sex.preventPositioning = true;
    if (mgr.preventOthersClothing) LT.sex.preventClothing = true;
    if (mgr.canStop === false) LT.sex.managerCanStop = false;
    if (mgr.startNaked) {
      var parts = sexParticipants();
      var i;
      var a;
      var ch;
      var areas = ["BREASTS", "PENIS", "VAGINA", "ANUS", "FOOT"];
      for (i = 0; i < parts.length; i++) {
        ch = parts[i];
        for (a = 0; a < areas.length; a++) LT.setSexExposed(ch, areas[a], true);
        if (ch.equipped) {
          Object.keys(ch.equipped).forEach(function (slot) {
            if (ch.equipped[slot]) ch.equipped[slot].removed = true;
          });
        }
      }
    }
    if (mgr.washing) {
      sexParticipants().forEach(function (ch) {
        ["MOUTH", "VAGINA", "ANUS", "PENIS", "NIPPLE", "BREASTS"].forEach(function (area) {
          addLubrication(ch, area, "WATER", null, true);
        });
      });
    }
    var pSlot = mgr.playerSlot;
    var nSlot = mgr.partnerSlot;
    if (mgr.slotsByLead) {
      var pair = LT.sex.playerDom ? mgr.slotsByLead.dom : mgr.slotsByLead.sub;
      if (pair) {
        pSlot = pair.player;
        nSlot = pair.partner;
      }
    }
    if (pSlot && LT.sex.player) {
      LT.sex.slots = LT.sex.slots || {};
      LT.sex.slots[charKey(LT.sex.player)] = pSlot;
      LT.sex.playerSlot = pSlot;
    }
    if (nSlot && LT.sex.partner) {
      LT.sex.slots = LT.sex.slots || {};
      LT.sex.slots[charKey(LT.sex.partner)] = nSlot;
      LT.sex.partnerSlot = nSlot;
    }
    if (mgr.extraSlots && LT.sex.partners) {
      var e;
      for (e = 1; e < LT.sex.partners.length; e++) {
        LT.sex.slots[charKey(LT.sex.partners[e])] = mgr.extraSlots[e - 1] || mgr.extraSlots[mgr.extraSlots.length - 1];
      }
    }
    LT.sex.bannedAreas = opts.bannedAreas || mgr.bannedAreas || {};
    if (mgr.lockedControl != null) {
      var locked = LT.sex.playerDom ? LT.sex.partner : LT.sex.player;
      if (locked) {
        LT.sex.forceControl = LT.sex.forceControl || {};
        LT.sex.forceControl[charKey(locked)] = mgr.lockedControl;
      }
    }
  }

  function currentPosition() {
    return SEX_POSITIONS[LT.sex.positionName] || SEX_POSITIONS.Standing;
  }

  function areaBanned(ch, area) {
    if (!ch || !area) return false;
    var bag = ((LT.sex.bannedAreas || {})[charKey(ch)]) || [];
    return bag.indexOf(area) >= 0;
  }

  function isSpectator(ch) {
    if (!ch) return false;
    if (ch === LT.sex.player && LT.sex.playerSpectator) return true;
    var list = LT.sex.spectators || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === ch) return true;
    }
    return slotOf(ch) === "watching";
  }

  function pairLegal(id, giver, receiver) {
    if (!id) return true;
    if (String(id).indexOf("self_") === 0) return true;
    if (isSpectator(giver) || isSpectator(receiver)) return false;
    if (giver && receiver) {
      var areas = pairAreas(id);
      if (areaBanned(receiver, areas.receiver) || areaBanned(giver, areas.giver)) return false;
    }
    var pos = currentPosition();
    if (!pos) return true;
    var allow = pos.allow;
    if (giver && receiver && pos.slotAllow) {
      var from = slotOf(giver);
      var to = slotOf(receiver);
      if (from && to && pos.slotAllow[from] && pos.slotAllow[from][to]) {
        allow = pos.slotAllow[from][to];
      } else if (from && to && !((from === pos.playerSlot && to === pos.partnerSlot) || (from === pos.partnerSlot && to === pos.playerSlot))) {
        return false;
      }
    }
    if (!allow) return true;
    if (allow[id] === false) return false;
    return allow[id] !== undefined ? !!allow[id] : true;
  }

  function pruneIllegalLinks() {
    var links = (LT.sex.links || []).slice();
    var i;
    for (i = 0; i < links.length; i++) {
      if (isKnotLocked(links[i])) continue;
      if (!pairLegal(links[i].id, links[i].giver, links[i].receiver)) removeLink(links[i]);
    }
  }

  function setPosition(name) {
    LT.sex.positionName = name;
    var pos = SEX_POSITIONS[name] || SEX_POSITIONS.Standing;
    LT.sex.positionId = pos.id;
    LT.sex.playerSlot = pos.playerSlot;
    LT.sex.partnerSlot = pos.partnerSlot;
    LT.sex.slots = LT.sex.slots || {};
    if (LT.sex.player) LT.sex.slots[charKey(LT.sex.player)] = pos.playerSlot;
    var partners = LT.sex.partners || otherParticipants(LT.sex.player);
    if (partners[0]) LT.sex.slots[charKey(partners[0])] = pos.partnerSlot;
    var extra = pos.extraSlots || [];
    var i;
    for (i = 1; i < partners.length; i++) {
      LT.sex.slots[charKey(partners[i])] = extra[i - 1] || extra[extra.length - 1] || pos.partnerSlot;
    }
    pruneIllegalLinks();
  }

  LT.sex.pairLegal = pairLegal;
  LT.sex.currentPosition = currentPosition;

  function registerPosition(spec) {
    register({
      id: spec.id,
      name: spec.name,
      tab: 2,
      type: "POSITIONING",
      selfArousal: "ONE_MINIMUM",
      targetArousal: "ONE_MINIMUM",
      canUse: function (src, tgt) {
        if (LT.sex.preventPositioning || (LT.sex.managerSpec && LT.sex.managerSpec.lockPosition)) return false;
        if (LT.sex.knotted && LT.sex.knotted.locked) return false;
        if (LT.sex.positionName === spec.position) return false;
        var dest = SEX_POSITIONS[spec.position];
        if (LT.sex.masturbation && !(dest && dest.masturbation)) return false;
        if (!LT.sex.masturbation && dest && dest.masturbation) return false;
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
    id: "pos_over_desk",
    name: "Over [pc.desk]",
    position: "Over desk",
    tip: "Bend [npc2.name] over a nearby [pc.desk] and take [npc2.herHim] from behind.",
    line: "Taking hold of [npc2.namePos] [npc2.hips], [npc.name] [npc.verb(bend)] [npc2.herHim] over a nearby [pc.desk]. Stepping in behind [npc2.herHim], [npc.she] [npc.verb(grind)] [npc.her] groin against [npc2.her] [npc2.ass+], [npc.moaning], [npc.speech(Stay just like that...)]",
  });
  registerPosition({
    id: "pos_masturbate_standing",
    name: "Standing",
    position: "Masturbation",
    tip: "Decide to get to your [npc.feet] and continue masturbating while standing upright.",
    line: "Deciding that it would be better to continue masturbating while standing upright, [npc.name] [npc.verb(push)] [npc.herself] up onto [npc.her] [npc.feet], before dropping [npc.her] [npc.hands] down between [npc.her] [npc.legs] and preparing to continue where [npc.she] left off...",
  });
  registerPosition({
    id: "pos_masturbate_sitting",
    name: "Sitting",
    position: "Masturbation (sitting)",
    tip: "Decide to sit down on a nearby surface and continue masturbating in that position.",
    line: "Deciding that it would be better to continue masturbating in a seated position, [npc.name] [npc.verb(find)] a suitable surface nearby, before sitting down and moving [npc.her] [npc.hands] between [npc.her] [npc.legs]...",
  });
  registerPosition({
    id: "pos_masturbate_kneeling",
    name: "Kneeling",
    position: "Masturbation (kneeling)",
    tip: "Decide to drop down onto your knees and continue masturbating in a kneeling position.",
    line: "Deciding that it would be better to continue masturbating while kneeling down on the ground, [npc.name] [npc.verb(drop)] down into such a position, before sliding [npc.her] [npc.hands] down between [npc.her] [npc.legs] and preparing to continue where [npc.she] left off...",
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
      return !LT.sex.masturbation && hasBreasts(tgt) && tgt !== src;
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
      return !LT.sex.masturbation && hasVagina(tgt) && tgt !== src && LT.isSexExposed(tgt, "VAGINA");
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

  var INTERNAL_ORIFICES = { VAGINA: 1, ANUS: 1, MOUTH: 1, NIPPLE: 1, URETHRA: 1 };
  var CREAMPIE_AREAS = { VAGINA: 1, ANUS: 1, MOUTH: 1, NIPPLE: 1, URETHRA: 1, BREASTS: 1, FOOT: 1, FINGER: 1, ARMPIT: 1 };

  function wearingCondom(ch) {
    if (!ch) return false;
    if (ch.wearingCondom) return true;
    var item = ch.equipped && (ch.equipped.penis || ch.equipped.cock);
    if (item && /condom/i.test(item.id || item.name || "")) return true;
    return false;
  }

  function hasKnot(ch) {
    if (!ch) return false;
    if (ch.knotted) return true;
    var mods = (ch.body && ch.body.penis && ch.body.penis.modifiers) || ch.penisModifiers || [];
    return mods.indexOf("KNOTTED") >= 0;
  }

  function penisInside(src) {
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      if (links[i].giver === src && links[i].giverArea === "PENIS") return links[i];
    }
    return null;
  }

  function rollCondomFailure(ch) {
    if (!wearingCondom(ch)) return "NONE";
    if (ch.condomSabotaged || ch.forceCondomFailure === "SABOTAGED") return "SABOTAGED";
    if (ch.forceCondomFailure === "CUM_OVERLOAD") return "CUM_OVERLOAD";
    if (ch.forceCondomFailure === "NONE") return "NONE";
    if (Math.random() < 0.1) return "CUM_OVERLOAD";
    return "NONE";
  }

  function hasFeet(ch) {
    if (!ch) return false;
    if (ch.hasFeet === false) return false;
    if (typeof ch.hasFeet === "function") return !!ch.hasFeet();
    return true;
  }

  function isTakingCock(receiver, giver) {
    if (!receiver || !giver || !hasPenis(giver)) return false;
    var links = LT.sex.links || [];
    var i;
    for (i = 0; i < links.length; i++) {
      if (links[i].giver === giver && links[i].receiver === receiver && links[i].giverArea === "PENIS") return true;
    }
    return false;
  }

  function atClimax(src) {
    return (src && src.arousal || 0) >= LT.MAX_AROUSAL;
  }

  function isPreparedFor(ch) {
    var list = LT.sex.preparedFor || [];
    return list.indexOf(ch) >= 0;
  }

  function markPrepared(ch) {
    LT.sex.preparedFor = LT.sex.preparedFor || [];
    if (ch && LT.sex.preparedFor.indexOf(ch) < 0) LT.sex.preparedFor.push(ch);
  }

  function clearOrgasmRequests() {
    LT.sex.requestedCreampie = false;
    LT.sex.requestedKnot = false;
    LT.sex.requestedPullout = false;
  }

  function partnerAwaitingOrgasm() {
    var npcs = otherParticipants(LT.sex.player);
    var i;
    for (i = 0; i < npcs.length; i++) {
      if (isSpectator(npcs[i])) continue;
      if (atClimax(npcs[i]) && !isPreparedFor(npcs[i])) return npcs[i];
    }
    return null;
  }

  function secondaryCreampieTarget(src) {
    var inside = penisInside(src);
    if (!inside) return null;
    var parts = otherParticipants(src);
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i] !== inside.receiver) return parts[i];
    }
    return null;
  }

  function availableCumTargets(src) {
    var pos = currentPosition() || {};
    var list = (pos.cumTargets || CUM_FRONT).slice();
    if (LT.sex.usingLilayaPanties) list.push("LILAYA_PANTIES");
    if (secondaryCreampieTarget(src)) list.push("INSIDE_SWITCH_DOUBLE");
    return list;
  }

  function cumTargetAllowed(src, target) {
    if (!target) return false;
    var list = availableCumTargets(src);
    if (list.indexOf(target) < 0) return false;
    if ((target === "FEET" && tgtHasNoFeet(src)) || (target === "SELF_FEET" && !hasFeet(src))) return false;
    if (target === "ARMPITS" && typeof LT.isArmpitContentEnabled === "function" && !LT.isArmpitContentEnabled()) return false;
    return true;
  }

  function tgtHasNoFeet(src) {
    var tgt = (src && getTarget(src)) || LT.sex.partner;
    return !hasFeet(tgt);
  }

  function applyCumOnto(ch, target, src) {
    if (!ch) return;
    if (target === "FACE" || target === "SELF_FACE" || target === "HAIR") addLubrication(ch, "MOUTH", "CUM", src, false);
    else if (target === "BREASTS" || target === "SELF_BREASTS") addLubrication(ch, "BREASTS", "CUM", src, false);
    else if (target === "ASS" || target === "BACK") addLubrication(ch, "ASS", "CUM", src, false);
    else if (target === "GROIN" || target === "SELF_GROIN") {
      if (hasVagina(ch)) addLubrication(ch, "VAGINA", "CUM", src, false);
      if (hasPenis(ch)) addLubrication(ch, "PENIS", "CUM", src, false);
    } else if (target === "STOMACH" || target === "SELF_STOMACH" || target === "LEGS" || target === "SELF_LEGS") {
      addLubrication(ch, "ASS", "CUM", src, true);
    } else if (target === "FEET" || target === "SELF_FEET") {
      addLubrication(ch, "FOOT", "CUM", src, false);
    } else if (target === "SELF_HANDS") {
      addLubrication(ch, "FINGER", "CUM", src, false);
    }
  }

  function applyCreampieFluid(inside, src) {
    if (!inside) return;
    addLubrication(inside.receiver, inside.receiverArea, "CUM", src, false);
    if (inside.receiverArea === "VAGINA") {
      addLubrication(inside.receiver, "CLIT", "CUM", src, true);
      inside.receiver.creampieVagina = true;
    }
    if (inside.receiverArea === "ANUS") inside.receiver.creampieAnus = true;
    if (inside.receiverArea === "NIPPLE" || inside.receiverArea === "CROTCH_NIPPLE") inside.receiver.creampieNipples = true;
  }

  function deflateKnot() {
    var k = LT.sex.knotted;
    if (!k) return "";
    var giver = k.giver;
    var receiver = k.receiver;
    k.locked = false;
    LT.sex.knotted = null;
    var text = parseSex(
      " After a few minutes the swollen knot starts to deflate, and with a wet pop [npc.name] [npc.verb(pull)] [npc.her] [npc.cock+] free.",
      giver,
      receiver,
    );
    var inside = penisInside(giver);
    if (inside && inside.receiver === receiver) removeLink(inside, true);
    LT.sex.lastKnotDeflated = true;
    return text;
  }

  function tickKnotLock() {
    var k = LT.sex.knotted;
    if (!k || !k.locked) return "";
    k.turnsLeft = (k.turnsLeft || 0) - 1;
    if (k.turnsLeft > 0) return "";
    return deflateKnot();
  }

  function applyOrgasm(src, tgt, target, opts) {
    opts = opts || {};
    var bits = [];
    var inside = penisInside(src);
    var double = target === "INSIDE_SWITCH_DOUBLE";
    var creampieTarget = target === "INSIDE" || double || opts.knot;
    bits.push("[npc.Name] [npc.verb(reach)] around and [npc.verb(grab)] [npc2.namePos] [npc2.ass+], pulling [npc2.herHim] close and letting out [npc.a_moan+] as [npc.she] [npc.verb(prepare)] to reach [npc.her] climax.");
    if (hasVagina(src)) {
      bits.push("A desperate, shuddering heat suddenly crashes up from [npc.namePos] [npc.pussy+], and [npc.she] [npc.verb(let)] out a manic squeal as a blinding wave of pure ecstasy washes over [npc.herHim].");
      var fingered = findLink("finger_vagina", function (l) { return l.receiver === src && l.giver !== src; });
      if (fingered) {
        bits.push("[npc.NamePos] vaginal muscles grip and squeeze around [npc2.namePos] intruding digits, and [npc2.she] continues to stroke and tease [npc.her] clit, drawing out a series of [npc.moans+] from between [npc.her] [npc.lips+].");
      }
    }
    var condom = wearingCondom(src);
    var fail = "NONE";
    if (condom) {
      fail = rollCondomFailure(src);
      if (fail === "NONE") {
        bits.push(" [npc.NamePos] [npc.cock+] twitches as [npc.she] [npc.verb(fill)] the condom.");
      } else {
        bits.push(
          fail === "SABOTAGED"
            ? " The condom was sabotaged — it gives way as [npc.name] [npc.verb(cum)]."
            : " There's too much cum. The condom bursts."
        );
      }
    }
    if (opts.knot && inside) {
      bits.push(" The fat knot at the base of [npc.namePos] [npc.cock+] swells and locks [npc.herHim] inside [npc2.name]. The two of you are stuck together until it deflates.");
      LT.sex.knotted = {
        giver: src,
        receiver: inside.receiver,
        area: inside.receiverArea,
        locked: true,
        turnsLeft: 3,
      };
    }
    if (creampieTarget && inside) {
      bits.push(" [npc.Name] [npc.verb(hilt)] [npc.herself] and [npc.verb(cum)] deep inside [npc2.name].");
      if (double) {
        var second = secondaryCreampieTarget(src);
        if (second) {
          bits.push(" With a wet slide, [npc.she] [npc.verb(pull)] out and [npc.verb(thrust)] into " + nameOf(second) + ", spending the rest of [npc.her] orgasm inside of [npc.her] second partner.");
          LT.sex.lastSecondaryCreampie = second;
        }
      }
    } else if (target === "LILAYA_PANTIES") {
      if (inside && hasPenis(src)) {
        bits.push(" [npc.Name] [npc.verb(pull)] out at the last moment.");
        removeLink(inside, true);
      }
      bits.push(" [npc.She] [npc.verb(cum)] into Lilaya's panties, soaking the fabric.");
    } else if (target && target !== "GENERIC" && target !== "INSIDE") {
      var pulled = inside && hasPenis(src);
      if (pulled) {
        bits.push(" [npc.Name] [npc.verb(pull)] out at the last moment.");
        removeLink(inside, true);
      }
      var onto = {
        FLOOR: "onto the floor",
        WALL: "up the wall",
        FACE: "over [npc2.namePos] face",
        BREASTS: "onto [npc2.namePos] [npc2.breasts]",
        STOMACH: "onto [npc2.namePos] stomach",
        ASS: "over [npc2.namePos] ass",
        GROIN: "over [npc2.namePos] groin",
        BACK: "over [npc2.namePos] back",
        LEGS: "onto [npc2.namePos] [npc2.legs]",
        FEET: "onto [npc2.namePos] [npc2.feet]",
        HAIR: "into [npc2.namePos] hair",
        ARMPITS: "over [npc2.namePos] armpit",
        SELF_GROIN: "onto [npc.her] own groin",
        SELF_STOMACH: "onto [npc.her] own stomach",
        SELF_LEGS: "onto [npc.her] own [npc.legs]",
        SELF_FEET: "onto [npc.her] own [npc.feet]",
        SELF_BREASTS: "onto [npc.her] own [npc.breasts]",
        SELF_HANDS: "into [npc.her] own [npc.hands]",
        SELF_FACE: "over [npc.her] own face",
      };
      bits.push(" [npc.She] [npc.verb(direct)] [npc.her] cum " + (onto[target] || "onto the floor") + ".");
    }
    src.arousal = 0;
    src.orgasmedThisSex = (src.orgasmedThisSex || 0) + 1;
    LT.sex.lastCumTarget = target || "GENERIC";
    LT.sex.lastCondomFailure = fail;
    if (hasPenis(src) && (!condom || fail !== "NONE")) {
      if (creampieTarget && inside) {
        applyCreampieFluid(inside, src);
        if (double && LT.sex.lastSecondaryCreampie) {
          var extra = LT.sex.lastSecondaryCreampie;
          if (hasVagina(extra)) {
            addLubrication(extra, "VAGINA", "CUM", src, false);
            extra.creampieVagina = true;
          } else {
            addLubrication(extra, "ANUS", "CUM", src, false);
            extra.creampieAnus = true;
          }
        }
      } else if (String(target || "").indexOf("SELF_") === 0) {
        applyCumOnto(src, target, src);
      } else if (target && target !== "GENERIC" && target !== "FLOOR" && target !== "WALL" && target !== "LILAYA_PANTIES") {
        applyCumOnto(tgt, target, src);
      }
    }
    var list = LT.sex.preparedFor || [];
    var nextPrep = [];
    var pi;
    for (pi = 0; pi < list.length; pi++) {
      if (list[pi] !== src) nextPrep.push(list[pi]);
    }
    LT.sex.preparedFor = nextPrep;
    clearOrgasmRequests();
    var text = parseSex(bits.join(" "), src, tgt);
    if (src && src.player && typeof LT.awardOrgasmEssences === "function") {
      text += LT.awardOrgasmEssences();
    }
    var creampie =
      creampieTarget &&
      inside &&
      inside.receiverArea === "VAGINA" &&
      (!condom || fail !== "NONE");
    if (creampie && typeof LT.rollForPregnancy === "function" && hasPenis(src) && hasVagina(inside.receiver)) {
      text += LT.rollForPregnancy(inside.receiver, src);
    }
    if (double && LT.sex.lastSecondaryCreampie && typeof LT.rollForPregnancy === "function" && hasPenis(src) && hasVagina(LT.sex.lastSecondaryCreampie) && (!condom || fail !== "NONE")) {
      text += LT.rollForPregnancy(LT.sex.lastSecondaryCreampie, src);
    }
    return text;
  }

  register({
    id: "orgasm",
    name: "Orgasm",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src) {
      if (!atClimax(src)) return false;
      if (!hasPenis(src) || !LT.isSexExposed(src, "PENIS") || wearingCondom(src)) return true;
      return false;
    },
    tooltip: function () {
      return "You've reached your climax, and can't hold back your orgasm any longer.";
    },
    perform: function (src, tgt) {
      return applyOrgasm(src, tgt, "GENERIC");
    },
  });

  register({
    id: "orgasm_creampie",
    name: "Creampie",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src) {
      if (!atClimax(src) || !hasPenis(src) || wearingCondom(src)) return false;
      var inside = penisInside(src);
      return !!(inside && CREAMPIE_AREAS[inside.receiverArea]);
    },
    tooltip: function () {
      return "Cum inside. You've reached your climax, and can't hold back any longer.";
    },
    perform: function (src, tgt) {
      return applyOrgasm(src, tgt, "INSIDE");
    },
  });

  register({
    id: "orgasm_knot",
    name: "Knot",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src) {
      if (!atClimax(src) || !hasPenis(src) || !hasKnot(src) || wearingCondom(src)) return false;
      var inside = penisInside(src);
      return !!(inside && INTERNAL_ORIFICES[inside.receiverArea]);
    },
    tooltip: function () {
      return "Push your knot in and cum inside, locking the two of you together.";
    },
    perform: function (src, tgt) {
      return applyOrgasm(src, tgt, "INSIDE", { knot: true });
    },
  });

  function registerCumTarget(id, target, nameOutside, namePull, tip) {
    register({
      id: id,
      name: nameOutside,
      tab: 0,
      type: "ORGASM",
      isOrgasm: true,
      cumTarget: target,
      selfArousal: "FIVE_EXTREME",
      targetArousal: "FIVE_EXTREME",
      canUse: function (src) {
        if (!atClimax(src) || !hasPenis(src) || !LT.isSexExposed(src, "PENIS") || wearingCondom(src)) return false;
        return cumTargetAllowed(src, target);
      },
      tooltip: function () {
        return tip;
      },
      perform: function (src, tgt) {
        return applyOrgasm(src, tgt, target);
      },
    });
    var act = LT.SEX_ACTIONS[id];
    var oldName = act.name;
    Object.defineProperty(act, "name", {
      configurable: true,
      get: function () {
        var src = LT.sex && LT.sex.player;
        if (src && penisInside(src)) return namePull;
        return oldName;
      },
    });
  }

  registerCumTarget("orgasm_floor", "FLOOR", "Cum on floor", "Pull out (floor)", "Direct your cum onto the floor.");
  registerCumTarget("orgasm_stomach", "STOMACH", "Cum on stomach", "Pull out (stomach)", "Direct your cum onto their stomach.");
  registerCumTarget("orgasm_face", "FACE", "Cum on face", "Pull out (face)", "Direct your cum over their face.");
  registerCumTarget("orgasm_breasts", "BREASTS", "Cum on breasts", "Pull out (breasts)", "Direct your cum onto their breasts.");
  registerCumTarget("orgasm_ass", "ASS", "Cum on ass", "Pull out (ass)", "Direct your cum over their ass.");
  registerCumTarget("orgasm_groin", "GROIN", "Cum on groin", "Pull out (groin)", "Direct your cum over their groin.");
  registerCumTarget("orgasm_wall", "WALL", "Cum up wall", "Pull out (wall)", "Direct your cum up the wall.");
  registerCumTarget("orgasm_hair", "HAIR", "Cum in hair", "Pull out (hair)", "Direct your cum into their hair.");
  registerCumTarget("orgasm_legs", "LEGS", "Cum on legs", "Pull out (legs)", "Direct your cum onto their legs.");
  registerCumTarget("orgasm_feet", "FEET", "Cum on feet", "Pull out (feet)", "Direct your cum onto their feet.");
  registerCumTarget("orgasm_back", "BACK", "Cum on back", "Pull out (back)", "Direct your cum over their back.");
  registerCumTarget("orgasm_armpits", "ARMPITS", "Cum on armpit", "Pull out (armpit)", "Direct your cum over their armpit.");
  registerCumTarget("orgasm_self_groin", "SELF_GROIN", "Cum on your groin", "Pull out (own groin)", "Direct your cum onto your own groin.");
  registerCumTarget("orgasm_self_stomach", "SELF_STOMACH", "Cum on your stomach", "Pull out (own stomach)", "Direct your cum onto your own stomach.");
  registerCumTarget("orgasm_self_legs", "SELF_LEGS", "Cum on your legs", "Pull out (own legs)", "Direct your cum onto your own legs.");
  registerCumTarget("orgasm_self_feet", "SELF_FEET", "Cum on your feet", "Pull out (own feet)", "Direct your cum onto your own feet.");
  registerCumTarget("orgasm_self_breasts", "SELF_BREASTS", "Cum on your breasts", "Pull out (own breasts)", "Direct your cum onto your own breasts.");
  registerCumTarget("orgasm_self_hands", "SELF_HANDS", "Cum on your hands", "Pull out (own hands)", "Direct your cum into your own hands.");
  registerCumTarget("orgasm_self_face", "SELF_FACE", "Cum on your face", "Pull out (own face)", "Direct your cum over your own face.");

  register({
    id: "orgasm_double_creampie",
    name: "Double creampie",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    cumTarget: "INSIDE_SWITCH_DOUBLE",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src) {
      if (!atClimax(src) || !hasPenis(src) || wearingCondom(src)) return false;
      var inside = penisInside(src);
      return !!(inside && CREAMPIE_AREAS[inside.receiverArea] && secondaryCreampieTarget(src));
    },
    tooltip: function () {
      return "Cum inside, then switch to your other partner and finish in them as well.";
    },
    perform: function (src, tgt) {
      return applyOrgasm(src, tgt, "INSIDE_SWITCH_DOUBLE");
    },
  });

  register({
    id: "orgasm_lilaya_panties",
    name: "Cum in Lilaya's panties",
    tab: 0,
    type: "ORGASM",
    isOrgasm: true,
    cumTarget: "LILAYA_PANTIES",
    selfArousal: "FIVE_EXTREME",
    targetArousal: "FIVE_EXTREME",
    canUse: function (src) {
      if (!LT.sex.usingLilayaPanties) return false;
      if (!atClimax(src) || !hasPenis(src) || !LT.isSexExposed(src, "PENIS") || wearingCondom(src)) return false;
      return true;
    },
    tooltip: function () {
      return "You've reached your climax. Cum into Lilaya's panties.";
    },
    perform: function (src, tgt) {
      return applyOrgasm(src, tgt, "LILAYA_PANTIES");
    },
  });

  var PREPARE_PACE = {
    DOM_GENTLE: ["[npc.Name] [npc.verb(let)] out a soft [npc.moan] of encouragement as [npc.she] [npc.verb(prepare)] for [npc2.name] to reach [npc2.her] orgasm."],
    DOM_ROUGH: ["[npc.Name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(prepare)] for [npc2.name] to reach [npc2.her] orgasm."],
    SUB_EAGER: ["[npc.Name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(prepare)] for [npc2.name] to reach [npc2.her] orgasm."],
    SUB_RESISTING: ["[npc.Name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] desperately [npc.verb(try)] to pull away from [npc2.name] before [npc2.she] [npc2.verb(orgasm)]."],
  };

  register({
    id: "orgasm_prepare",
    name: "Prepare",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      return atClimax(tgt) && !atClimax(src);
    },
    tooltip: function () {
      return "You can feel that [npc2.name] is fast approaching [npc2.her] orgasm. Prepare yourself for it.";
    },
    perform: function (src, tgt) {
      markPrepared(tgt);
      return parseSex(pickPaceLines(
        ["[npc.Name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(prepare)] for [npc2.name] to reach [npc2.her] orgasm."],
        PREPARE_PACE,
        src,
      ), src, tgt);
    },
  });

  register({
    id: "orgasm_request_creampie",
    name: "Request creampie",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      return atClimax(tgt) && !atClimax(src) && isTakingCock(src, tgt);
    },
    tooltip: function () {
      return "You can feel that [npc2.name] is fast approaching [npc2.her] orgasm. Ask [npc2.herHim] to fill you with [npc2.her] cum.";
    },
    perform: function (src, tgt) {
      markPrepared(tgt);
      LT.sex.requestedCreampie = true;
      return parseSex("[npc.Name] [npc.verb(plead)] for [npc2.name] to cum inside.", src, tgt);
    },
  });

  register({
    id: "orgasm_request_knot",
    name: "Request knot",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      if (!atClimax(tgt) || atClimax(src) || !isTakingCock(src, tgt) || !hasKnot(tgt)) return false;
      var inside = penisInside(tgt);
      return !!(inside && inside.receiver === src && INTERNAL_ORIFICES[inside.receiverArea]);
    },
    tooltip: function () {
      return "You can feel that [npc2.name] is fast approaching [npc2.her] orgasm. Ask [npc2.herHim] to knot you and fill you with [npc2.her] cum.";
    },
    perform: function (src, tgt) {
      markPrepared(tgt);
      LT.sex.requestedKnot = true;
      return parseSex("[npc.Name] [npc.verb(plead)] for [npc2.name] to push [npc2.her] knot in and cum deep inside.", src, tgt);
    },
  });

  register({
    id: "orgasm_request_pullout",
    name: "Request pull-out",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function (src, tgt) {
      return atClimax(tgt) && !atClimax(src) && isTakingCock(src, tgt);
    },
    tooltip: function () {
      return "You can feel that [npc2.name] is fast approaching [npc2.her] orgasm. Ask [npc2.herHim] to pull out.";
    },
    perform: function (src, tgt) {
      markPrepared(tgt);
      LT.sex.requestedPullout = true;
      return parseSex("[npc.Name] [npc.verb(plead)] for [npc2.name] to pull out before [npc2.she] [npc2.verb(cum)].", src, tgt);
    },
  });

  register({
    id: "orgasm_deny",
    name: "Deny",
    tab: 0,
    type: "PREPARE_FOR_PARTNER_ORGASM",
    isPrepare: true,
    selfArousal: "TWO_LOW",
    targetArousal: "NEGATIVE_MAJOR",
    canUse: function (src, tgt) {
      if (!atClimax(tgt) || atClimax(src) || !isDom(src)) return false;
      if (src.player || src === LT.sex.player) return true;
      return hasFetish(src, "FETISH_DENIAL");
    },
    tooltip: function () {
      return "You can feel that [npc2.name] is fast approaching [npc2.her] orgasm. Don't let [npc2.herHim] have it.";
    },
    perform: function (src, tgt) {
      return parseSex(
        pickPaceLines(
          ["Hearing that [npc2.sheIs] about to orgasm, [npc.name] quickly [npc.verb(grab)] hold of [npc2.namePos] [npc2.arms], before holding [npc2.herHim] still and preventing [npc2.herHim] from reaching [npc2.her] climax."],
          {
            DOM_GENTLE: ["Upon hearing this, [npc.name] quickly [npc.verb(take)] a firm grip of [npc2.namePos] [npc2.arms], before holding [npc2.herHim] in place and preventing [npc2.herHim] from stimulating [npc2.herself]."],
            DOM_ROUGH: ["Growling, [npc.name] [npc.verb(slam)] [npc.her] grip onto [npc2.namePos] [npc2.arms] and [npc.verb(force)] [npc2.herHim] to stay still, denying [npc2.herHim] [npc2.her] climax."],
          },
          src,
        ),
        src,
        tgt,
      );
    },
  });

  register({
    id: "deny",
    name: "Deny",
    tab: 0,
    type: "ONGOING",
    selfArousal: "TWO_LOW",
    targetArousal: "NEGATIVE",
    canUse: function (src, tgt) {
      if (!src || !tgt || src === tgt || atClimax(src) || atClimax(tgt)) return false;
      if (!isDom(src)) return false;
      if ((tgt.arousal || 0) < 50) return false;
      if (src.player || src === LT.sex.player) return true;
      return hasFetish(src, "FETISH_DENIAL");
    },
    tooltip: function () {
      return "Force [npc2.name] to stay perfectly still, holding them in position until they've lost a good portion of their arousal.";
    },
    perform: function (src, tgt) {
      var again = (tgt.orgasmedThisSex || 0) > 0;
      return parseSex(
        pickPaceLines(
          [
            "Taking a firm grip of [npc2.namePos] [npc2.arms], [npc.name] [npc.verb(hold)] [npc2.herHim] quite still, [npc.moaning+] as [npc.she] [npc.verb(wait)] for [npc2.herHim] to calm down, [npc.speech(That's a good [npc2.girl]! We wouldn't want you to climax " + (again ? "again already" : "just yet") + " now, would we?!)]",
          ],
          {
            DOM_GENTLE: [
              "Taking a gentle, yet firm, grip of [npc2.namePos] [npc2.arms], [npc.name] [npc.verb(hold)] [npc2.herHim] quite still, softly [npc.moaning] as [npc.she] [npc.verb(wait)] for [npc2.herHim] to calm down, [npc.speech(That's a good [npc2.girl]... We wouldn't want you to climax " + (again ? "again already" : "just yet") + " now, would we?)]",
            ],
            DOM_ROUGH: [
              "Taking a rough, firm grip of [npc2.namePos] [npc2.arms], [npc.name] [npc.verb(force)] [npc2.herHim] to remain quite still, growling as [npc.she] [npc.verb(wait)] for [npc2.herHim] to calm down, [npc.speech(Don't you dare cum " + (again ? "again" : "") + " without my permission!)]",
            ],
          },
          src,
        ),
        src,
        tgt,
      );
    },
  });

  LT.sex.applyOrgasm = applyOrgasm;
  LT.sex.penisInside = penisInside;
  LT.sex.wearingCondom = wearingCondom;
  LT.sex.hasKnot = hasKnot;
  LT.sex.rollCondomFailure = rollCondomFailure;
  LT.sex.isTakingCock = isTakingCock;
  LT.sex.availableCumTargets = availableCumTargets;
  LT.sex.cumTargetAllowed = cumTargetAllowed;
  LT.sex.deflateKnot = deflateKnot;
  LT.sex.tickKnotLock = tickKnotLock;
  LT.sex.isPreparedFor = isPreparedFor;
  LT.sex.partnerAwaitingOrgasm = partnerAwaitingOrgasm;
  LT.sex.secondaryCreampieTarget = secondaryCreampieTarget;

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
    id: "calm_down",
    name: "Calm down",
    tab: 3,
    type: "ONGOING",
    selfArousal: "NEGATIVE",
    targetArousal: "ZERO_NONE",
    canUse: function () {
      return true;
    },
    tooltip: function () {
      return "Focus on calming yourself down, which lowers your arousal.";
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "Closing your [pc.eyes], you take a deep breath, calming yourself down and lowering your arousal.",
          "Taking a deep breath, you focus on calming yourself down a little.",
          "You take a moment to focus on something other than [npc2.name], calming yourself down in the process.",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "dirty_talk",
    name: "Dirty talk",
    tab: 3,
    type: "SPEECH",
    selfArousal: "TWO_LOW",
    targetArousal: "TWO_LOW",
    canUse: function () {
      return !LT.sex.masturbation;
    },
    tooltip: function () {
      return "Talk dirty to your partner.";
    },
    perform: function (src, tgt) {
      var pace = getSexPace(src);
      var lead;
      if (pace === "SUB_RESISTING") {
        lead = pick([
          "[npc.Name] [npc.sobsVerb+] as [npc.she] [npc.verb(beg)] [npc2.name] to stop, ",
          "Tears in [npc.her] [npc.eyes], [npc.name] desperately [npc.verb(plead)], ",
        ]);
      } else if (pace === "DOM_ROUGH") {
        lead = pick([
          "[npc.Name] [npc.verb(growl)] at [npc2.name], ",
          "Letting out a rough growl, [npc.name] [npc.verb(snarl)], ",
        ]);
      } else {
        lead = pick([
          "[npc.Name] [npc.verb(let)] out [npc.a_moan+] as [npc.she] [npc.verb(tease)], ",
          "Leaning in against [npc2.name], [npc.name] [npc.verb(moan)], ",
        ]);
      }
      return parseSex(lead + dirtyTalkLine(src, tgt), src, tgt);
    },
  });
  (function nameDirtyTalk() {
    var act = LT.SEX_ACTIONS.dirty_talk;
    Object.defineProperty(act, "name", {
      configurable: true,
      get: function () {
        var src = LT.sex && LT.sex.player;
        var pace = src ? getSexPace(src) : "";
        if (pace === "DOM_ROUGH") return "Rough talk";
        if (pace === "SUB_RESISTING") return "Beg to stop";
        return "Dirty talk";
      },
    });
  })();

  register({
    id: "moan",
    name: "Moan",
    tab: 3,
    type: "ONGOING",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function () {
      return true;
    },
    tooltip: function () {
      return "Let out a lewd moan.";
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "You can't help but let out [pc.a_moan+] as you press yourself against [npc2.name].",
          "Letting out [pc.a_moan+], you grind yourself against [npc2.name].",
          "[pc.A_moan+] escapes from between your [pc.lips] as you lose yourself in the moment.",
        ]),
        src,
        tgt,
      );
    },
  });

  register({
    id: "resist",
    name: "Resist",
    tab: 3,
    type: "ONGOING",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      src = src || LT.sex.player;
      if (isDom(src)) return false;
      if (!(typeof LT.isNonConEnabled === "function" && LT.isNonConEnabled())) return false;
      if (src === LT.sex.player || src.player) return !LT.sex.consensual;
      return getSexPace(src) === "SUB_RESISTING" || !LT.sex.consensual;
    },
    tooltip: function () {
      return "Struggle against your partner and refuse to take part.";
    },
    perform: function (src, tgt) {
      setSexPace(src, "SUB_RESISTING");
      return parseSex(
        pick([
          "You continue struggling against [npc2.name], refusing to make any sort of move on [npc2.herHim].",
          "Struggling and [pc.sobbing], you try to wriggle out of [npc2.namePos] grasp, dreading what [npc2.her] next move might be.",
          "You try to push [npc2.name] away from you, [pc.sobbing] and struggling in distress as you refuse to submit.",
        ]),
        src,
        tgt,
      );
    },
  });

  function registerPace(id, pace, name, tip, lines, can) {
    register({
      id: id,
      name: name,
      tab: 3,
      type: "SPECIAL",
      selfArousal: "ZERO_NONE",
      targetArousal: "ZERO_NONE",
      canUse: function (src) {
        src = src || LT.sex.player;
        if (getSexPace(src) === pace) return false;
        return !can || can(src);
      },
      tooltip: function () {
        return tip;
      },
      perform: function (src, tgt) {
        setSexPace(src, pace);
        return parseSex(pick(lines), src, tgt) || ("You settle into a " + name.toLowerCase() + " pace.");
      },
    });
  }
  registerPace(
    "pace_gentle",
    "DOM_GENTLE",
    "Gentle",
    "Slow down and treat your partner more gently.",
    [
      "You ease off, deciding to take things slowly and gently with [npc2.name].",
      "Softening your grip, you make it clear that you want this to stay gentle.",
    ],
    function (src) {
      return isDom(src);
    },
  );
  registerPace(
    "pace_normal_dom",
    "DOM_NORMAL",
    "Normal",
    "Return to a normal dominant pace.",
    [
      "You settle back into a steady, normal pace with [npc2.name].",
      "Letting the moment find its own rhythm, you keep a normal pace.",
    ],
    function (src) {
      return isDom(src);
    },
  );
  registerPace(
    "pace_rough",
    "DOM_ROUGH",
    "Rough",
    "Pick up the pace and treat your partner roughly.",
    [
      "You tighten your grip and start treating [npc2.name] more roughly.",
      "A rougher heat takes over as you slam yourself against [npc2.name].",
    ],
    function (src) {
      return isDom(src);
    },
  );
  registerPace(
    "pace_normal_sub",
    "SUB_NORMAL",
    "Normal",
    "Stop resisting or acting overly eager, and settle into a normal submissive pace.",
    [
      "You stop fighting the moment and settle into a normal, willing pace.",
      "Taking a breath, you let [npc2.name] lead at a normal pace.",
    ],
    function (src) {
      return !isDom(src);
    },
  );
  registerPace(
    "pace_eager",
    "SUB_EAGER",
    "Eager",
    "Give in and eagerly go along with whatever your partner wants.",
    [
      "You can't help but eagerly press yourself back against [npc2.name].",
      "A needy heat takes over, and you eagerly give yourself to [npc2.name].",
    ],
    function (src) {
      return !isDom(src);
    },
  );

  register({
    id: "ask_gentle",
    name: "Ask for gentle",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function (src) {
      src = src || LT.sex.player;
      return !isDom(src) && getSexPace(LT.sex.partner) !== "DOM_GENTLE";
    },
    tooltip: function () {
      return "Ask [npc2.name] to be gentler.";
    },
    perform: function (src, tgt) {
      setSexPace(tgt, "DOM_GENTLE");
      return parseSex("You ask [npc2.name] to be gentler, and [npc2.she] [npc2.verb(ease)] off.", src, tgt);
    },
  });
  register({
    id: "ask_rough",
    name: "Ask for rough",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function (src) {
      src = src || LT.sex.player;
      return !isDom(src) && getSexPace(LT.sex.partner) !== "DOM_ROUGH";
    },
    tooltip: function () {
      return "Ask [npc2.name] to be rougher.";
    },
    perform: function (src, tgt) {
      setSexPace(tgt, "DOM_ROUGH");
      return parseSex("You ask [npc2.name] to be rougher, and [npc2.she] [npc2.verb(grin)] as [npc2.she] [npc2.verb(pick)] up the pace.", src, tgt);
    },
  });
  register({
    id: "submit_lead",
    name: "Submit",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function () {
      return !!LT.sex.consensual && !!LT.sex.playerDom;
    },
    tooltip: function () {
      return "Let [npc2.name] take the lead.";
    },
    perform: function (src, tgt) {
      switchLead();
      return parseSex("You let [npc2.name] take the lead, submitting to [npc2.her] pace.", src, tgt);
    },
  });
  register({
    id: "take_lead",
    name: "Take the lead",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    canUse: function () {
      return !!LT.sex.consensual && !LT.sex.playerDom;
    },
    tooltip: function () {
      return "Take control of the encounter.";
    },
    perform: function (src, tgt) {
      switchLead();
      return parseSex("You take the lead, putting yourself back in control.", src, tgt);
    },
  });

  register({
    id: "prevent_clothing",
    name: "Stop clothing control",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return canCommandPartner(src) && !LT.sex.preventClothing;
    },
    tooltip: function () {
      return "Stop [npc2.name] from removing or displacing clothing.";
    },
    perform: function (src, tgt) {
      LT.sex.preventClothing = true;
      return parseSex("You make it clear that [npc2.name] is not to take off or pull aside any clothing.", src, tgt);
    },
  });

  register({
    id: "allow_clothing",
    name: "Allow clothing control",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      if (LT.sex.managerSpec && LT.sex.managerSpec.preventOthersClothing) return false;
      return canCommandPartner(src) && !!LT.sex.preventClothing;
    },
    tooltip: function () {
      return "Allow [npc2.name] to remove or displace clothing again.";
    },
    perform: function (src, tgt) {
      LT.sex.preventClothing = false;
      return parseSex("You stop preventing [npc2.name] from managing clothing.", src, tgt);
    },
  });

  register({
    id: "prevent_penetration",
    name: "Stop penetrative control",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return canCommandPartner(src) && !LT.sex.preventPenetration;
    },
    tooltip: function () {
      return "Stop [npc2.name] from starting new penetrative actions.";
    },
    perform: function (src, tgt) {
      LT.sex.preventPenetration = true;
      return parseSex("You make it clear that [npc2.name] is not to start any new penetrative actions.", src, tgt);
    },
  });

  register({
    id: "allow_penetration",
    name: "Allow penetrative control",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return canCommandPartner(src) && !!LT.sex.preventPenetration;
    },
    tooltip: function () {
      return "Allow [npc2.name] to start penetrative actions again.";
    },
    perform: function (src, tgt) {
      LT.sex.preventPenetration = false;
      return parseSex("You stop preventing [npc2.name] from starting penetrative actions.", src, tgt);
    },
  });

  register({
    id: "prevent_positioning",
    name: "Stop positioning control",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return canCommandPartner(src) && !LT.sex.preventPositioning;
    },
    tooltip: function () {
      return "Stop [npc2.name] from changing position.";
    },
    perform: function (src, tgt) {
      LT.sex.preventPositioning = true;
      return parseSex("You make it clear that [npc2.name] is not to change position.", src, tgt);
    },
  });
  register({
    id: "allow_positioning",
    name: "Allow positioning control",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      if (LT.sex.managerSpec && LT.sex.managerSpec.lockPosition) return false;
      return canCommandPartner(src) && !!LT.sex.preventPositioning;
    },
    tooltip: function () {
      return "Allow [npc2.name] to change position again.";
    },
    perform: function (src, tgt) {
      LT.sex.preventPositioning = false;
      return parseSex("You stop preventing [npc2.name] from changing position.", src, tgt);
    },
  });
  register({
    id: "prevent_self",
    name: "Forbid self actions",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return canCommandPartner(src) && !LT.sex.preventSelf;
    },
    tooltip: function () {
      return "Forbid [npc2.name] from performing self-penetrative actions.";
    },
    perform: function (src, tgt) {
      LT.sex.preventSelf = true;
      var links = (LT.sex.links || []).slice();
      var i;
      for (i = 0; i < links.length; i++) {
        if (links[i].giver === tgt && links[i].receiver === tgt) removeLink(links[i]);
      }
      return parseSex("[npc.speech(I don't want to see you trying to get yourself off,)] you [npc.moan] at [npc2.name]. [npc2.Name] will no longer use any self-penetrative actions.", src, tgt);
    },
  });
  register({
    id: "allow_self",
    name: "Permit self actions",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ZERO_NONE",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return canCommandPartner(src) && !!LT.sex.preventSelf;
    },
    tooltip: function () {
      return "Allow [npc2.name] to use self-penetrative actions again.";
    },
    perform: function (src, tgt) {
      LT.sex.preventSelf = false;
      return parseSex("You let [npc2.name] use self-penetrative actions again.", src, tgt);
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
      if (LT.sex.playerSpectator) return "Back out and stop watching.";
      if (LT.sex.masturbation) return "Put an end to your masturbation session.";
      return parseSex("Stop having sex with [npc2.name].", src, tgt);
    },
    perform: function (src, tgt) {
      if (LT.sex.playerSpectator) return "Having had enough of the show, you turn away and stop watching the sex scene unfold before you...";
      if (LT.sex.masturbation) return parseSex("Having had enough, you stop masturbating...", src, tgt || src);
      return parseSex("Having had enough, you [pc.step] back and stop having sex...", src, tgt);
    },
  });
  Object.defineProperty(LT.SEX_ACTIONS.stop_sex, "name", {
    configurable: true,
    get: function () {
      if (LT.sex && LT.sex.playerSpectator) return "Stop watching";
      if (LT.sex && LT.sex.masturbation) return "Stop masturbating";
      return "Stop sex";
    },
  });

  function generateQuickSexDescription(src, tgt) {
    var bits = [
      "Wanting to skip ahead, you let the encounter play out according to [npc2.namePos] preferences.",
    ];
    var playerPen = hasPenis(src);
    var tgtPen = hasPenis(tgt);
    var playerVag = hasVagina(src);
    var tgtVag = hasVagina(tgt);
    if ((playerPen && tgtVag) || (tgtPen && playerVag)) {
      bits.push(" Before long the two of you are fucking in earnest, and after several heated minutes you both reach climax.");
    } else if (playerPen || tgtPen) {
      bits.push(" Hands and mouths keep busy until you both orgasm.");
    } else {
      bits.push(" You focus on getting each other off, and both of you orgasm.");
    }
    return parseSex(bits.join(""), src, tgt);
  }

  function applySkipSexEffects() {
    var parts = (LT.sex.participants || []).filter(function (ch) {
      return ch && !isSpectator(ch);
    });
    var i;
    var giver;
    var receiver;
    for (i = 0; i < parts.length; i++) {
      var need = Math.max(1, (parts[i].orgasmsBeforeSatisfied || 1) - (parts[i].orgasmedThisSex || 0));
      parts[i].orgasmedThisSex = (parts[i].orgasmedThisSex || 0) + need;
      parts[i].arousal = 0;
    }
    for (i = 0; i < parts.length; i++) {
      var j;
      for (j = 0; j < parts.length; j++) {
        if (i === j) continue;
        if (hasPenis(parts[i]) && hasVagina(parts[j]) && !wearingCondom(parts[i])) {
          giver = parts[i];
          receiver = parts[j];
          receiver.creampieVagina = true;
          if (typeof LT.rollForPregnancy === "function") LT.rollForPregnancy(receiver, giver);
        }
      }
    }
    var rem = 0;
    for (i = 0; i < parts.length; i++) {
      if (isDom(parts[i]) || LT.sex.subHasEqualControl) rem += Math.max(1, (parts[i].orgasmsBeforeSatisfied || 1));
      else rem += 1;
    }
    LT.sex.skipSeconds = rem * 180;
  }

  register({
    id: "skip_sex",
    name: "Quick sex",
    tab: 3,
    type: "SPECIAL",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ONE_MINIMUM",
    endsSex: true,
    canUse: function () {
      return LT.sex.canSkip();
    },
    tooltip: function () {
      return "Skips this sex scene, but still applies all applicable effects as though the scene had taken place, based on your partner's preferences.";
    },
    perform: function (src, tgt) {
      applySkipSexEffects();
      return generateQuickSexDescription(src, tgt || LT.sex.partner);
    },
  });

  register({
    id: "watch",
    name: "Watch",
    tab: 0,
    type: "ONGOING",
    selfArousal: "ONE_MINIMUM",
    targetArousal: "ZERO_NONE",
    canUse: function (src) {
      return isSpectator(src);
    },
    tooltip: function () {
      return "Watch the others.";
    },
    perform: function (src, tgt) {
      return parseSex(
        pick([
          "[npc.Name] [npc.verb(watch)] [npc2.name], eyes fixed on every movement.",
          "[npc.Name] [npc.verb(let)] out a quiet [npc.moan] as [npc.she] [npc.verb(look)] on.",
        ]),
        src,
        tgt,
      );
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

  function targetSwitchActs() {
    var acts = [];
    var others = otherParticipants(LT.sex.player);
    if (others.length < 2) return acts;
    var i;
    for (i = 0; i < others.length; i++) {
      (function (npc) {
        acts.push({
          id: "target_" + charKey(npc),
          name: "Target " + nameOf(npc),
          tab: 3,
          type: "SPECIAL",
          selfArousal: "ZERO_NONE",
          targetArousal: "ZERO_NONE",
          canUse: function () {
            return LT.sex.partner !== npc;
          },
          tooltip: function () {
            return "Set " + nameOf(npc) + " as the active partner.";
          },
          perform: function (src) {
            setTarget(src || LT.sex.player, npc);
            return parseSex("You turn your attention to [npc2.name].", LT.sex.player, npc);
          },
        });
      })(others[i]);
    }
    return acts;
  }

  LT.sex.availableActions = function (tab) {
    var list = [];
    var src = this.player;
    var tgt = this.partner;
    if ((src.arousal || 0) >= LT.MAX_AROUSAL) {
      var climaxes = [];
      var oid;
      for (oid in LT.SEX_ACTIONS) {
        if (!Object.prototype.hasOwnProperty.call(LT.SEX_ACTIONS, oid)) continue;
        var oact = LT.SEX_ACTIONS[oid];
        if (!oact.isOrgasm) continue;
        if (oact.canUse && !oact.canUse(src, tgt)) continue;
        climaxes.push(oact);
      }
      if (climaxes.length) return climaxes;
    }
    if (this.playerSpectator) {
      var watchActs = [];
      if (LT.SEX_ACTIONS.watch && LT.SEX_ACTIONS.watch.canUse(src, tgt)) watchActs.push(LT.SEX_ACTIONS.watch);
      if (LT.SEX_ACTIONS.skip_sex && LT.sex.canSkip()) watchActs.push(LT.SEX_ACTIONS.skip_sex);
      if (LT.SEX_ACTIONS.stop_sex && LT.sex.canStop()) watchActs.push(LT.SEX_ACTIONS.stop_sex);
      return watchActs;
    }
    var waiting = partnerAwaitingOrgasm();
    if (waiting) {
      if (waiting !== tgt) {
        setTarget(src, waiting);
        tgt = waiting;
      }
      var prepares = [];
      var pid;
      for (pid in LT.SEX_ACTIONS) {
        if (!Object.prototype.hasOwnProperty.call(LT.SEX_ACTIONS, pid)) continue;
        var pact = LT.SEX_ACTIONS[pid];
        if (!pact.isPrepare && pact.type !== "PREPARE_FOR_PARTNER_ORGASM") continue;
        if (pact.canUse && !pact.canUse(src, tgt)) continue;
        prepares.push(pact);
      }
      if (LT.SEX_ACTIONS.stop_sex && LT.sex.canStop && LT.sex.canStop()) prepares.push(LT.SEX_ACTIONS.stop_sex);
      if (prepares.length) return prepares;
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
      if (!sexContentAllowed(act)) continue;
      if (!actionAllowedByControl(act, src)) continue;
      list.push(act);
    }
    if (tab === 3) {
      this._targetActs = {};
      var switches = targetSwitchActs();
      var s;
      for (s = 0; s < switches.length; s++) {
        if (switches[s] && (!switches[s].canUse || switches[s].canUse(src, tgt))) {
          this._targetActs[switches[s].id] = switches[s];
          list.push(switches[s]);
        }
      }
    }
    return list;
  };

  function runAction(src, tgt, act) {
    LT.sex._acting = src;
    var text = act.perform(src, tgt) || "";
    LT.sex._acting = null;
    if (act.type === "START_ONGOING") {
      var started = sexTypeOfAction(act, src);
      if (started) incrementSexTypeCount(src, tgt, started.performing, started.targeted);
    }
    if (!act.isOrgasm) {
      var srcMod = lustBand(src && src.lust).arousalMod;
      var tgtMod = lustBand(tgt && tgt.lust).arousalMod;
      if (getSexPace(src) === "SUB_RESISTING" && !hasFetish(src, "FETISH_NON_CON_SUB")) srcMod = 0.5;
      LT.applyArousal(src, (LT.AROUSAL_INCREASE[act.selfArousal] || 0) * srcMod);
      LT.applyArousal(tgt, (LT.AROUSAL_INCREASE[act.targetArousal] || 0) * tgtMod);
    }
    calculateWetAreas(false);
    applyStretchAll(false);
    var notes = takeLubeNotes();
    if (notes) text += (text && text.charAt(text.length - 1) === "." ? " " : " ") + notes;
    return text;
  }

  function blockingItem(ch, area) {
    if (!ch || !ch.equipped || area === "MOUTH") return null;
    var slots = Object.keys(ch.equipped);
    var i;
    for (i = 0; i < slots.length; i++) {
      var item = ch.equipped[slots[i]];
      if (itemBlocksArea(item, area)) return item;
    }
    return null;
  }

  function partnerUndressAction(owner, area, src, tgt) {
    return {
      id: "npc_undress_" + (owner === src ? "self" : "other") + "_" + String(area || "").toLowerCase(),
      name: "Undress",
      tab: 3,
      type: "SPECIAL",
      selfArousal: "ZERO_NONE",
      targetArousal: "ZERO_NONE",
      canUse: function () {
        return true;
      },
      perform: function (actor, target) {
        var item = blockingItem(owner, area);
        if (!item) {
          LT.setSexExposed(owner, area, true);
          return parseSex("[npc.Name] [npc.verb(make)] sure [npc.she] [npc.has] the access [npc.she] [npc.verb(want)].", actor, target);
        }
        var verb = displaceVerb(item);
        if (verb === "Remove") item.removed = true;
        else item.displaced = verb;
        if (!blockingItem(owner, area)) LT.setSexExposed(owner, area, true);
        var whose = owner === actor ? "[npc.her]" : "[npc2.namePos]";
        var label = item.name || item.slot || "clothing";
        var move = verb === "Remove" ? " [npc.verb(remove)] " : " [npc.verb(shift)] aside ";
        return parseSex("[npc.Name]" + move + whose + " " + label + ", wanting better access.", actor, target);
      },
    };
  }

  function desireAreas(id, src, tgt) {
    if (id === "penis_vagina_start") return hasPenis(src) && hasVagina(tgt) ? [{ ch: src, area: "PENIS" }, { ch: tgt, area: "VAGINA" }] : null;
    if (id === "penis_vagina_receive_start") return hasPenis(tgt) && hasVagina(src) ? [{ ch: tgt, area: "PENIS" }, { ch: src, area: "VAGINA" }] : null;
    if (id === "penis_anus_start") return hasPenis(src) ? [{ ch: src, area: "PENIS" }, { ch: tgt, area: "ANUS" }] : null;
    if (id === "penis_anus_receive_start") return hasPenis(tgt) ? [{ ch: tgt, area: "PENIS" }, { ch: src, area: "ANUS" }] : null;
    if (id === "finger_vagina_start") return hasVagina(tgt) ? [{ ch: tgt, area: "VAGINA" }] : null;
    if (id === "finger_vagina_receive_start") return hasVagina(src) ? [{ ch: src, area: "VAGINA" }] : null;
    if (id === "finger_anus_start") return [{ ch: tgt, area: "ANUS" }];
    if (id === "finger_anus_receive_start") return [{ ch: src, area: "ANUS" }];
    if (id === "cunnilingus_start") return hasVagina(tgt) ? [{ ch: tgt, area: "VAGINA" }] : null;
    if (id === "cunnilingus_receive_start") return hasVagina(src) ? [{ ch: src, area: "VAGINA" }] : null;
    if (id === "anilingus_start") return [{ ch: tgt, area: "ANUS" }];
    if (id === "anilingus_receive_start") return [{ ch: src, area: "ANUS" }];
    if (id === "blowjob_start") return hasPenis(tgt) ? [{ ch: tgt, area: "PENIS" }] : null;
    if (id === "blowjob_receive_start") return hasPenis(src) ? [{ ch: src, area: "PENIS" }] : null;
    if (id === "finger_penis_start") return hasPenis(tgt) ? [{ ch: tgt, area: "PENIS" }] : null;
    if (id === "finger_penis_receive_start") return hasPenis(src) ? [{ ch: src, area: "PENIS" }] : null;
    if (id === "suckle_start" || id === "finger_nipple_start") return hasBreasts(tgt) ? [{ ch: tgt, area: "BREASTS" }] : null;
    if (id === "penis_nipple_start" || id === "penis_breasts_start") return hasPenis(src) && hasBreasts(tgt) ? [{ ch: src, area: "PENIS" }, { ch: tgt, area: "BREASTS" }] : null;
    if (id === "penis_thighs_start" || id === "penis_ass_start") return hasPenis(src) ? [{ ch: src, area: "PENIS" }] : null;
    if (id === "penis_feet_start") return hasPenis(src) ? [{ ch: src, area: "PENIS" }, { ch: tgt, area: "FOOT" }] : null;
    if (id === "tail_vagina_start") return hasTail(src) && hasVagina(tgt) ? [{ ch: tgt, area: "VAGINA" }] : null;
    if (id === "tentacle_vagina_start") return hasTentacle(src) && hasVagina(tgt) ? [{ ch: tgt, area: "VAGINA" }] : null;
    if (id === "toy_vagina_start") return hasSexToy(src) && hasVagina(tgt) ? [{ ch: tgt, area: "VAGINA" }] : null;
    if (id === "clit_vagina_start") return hasVagina(src) && hasVagina(tgt) ? [{ ch: src, area: "VAGINA" }, { ch: tgt, area: "VAGINA" }] : null;
    if (id === "clit_play") return hasVagina(tgt) ? [{ ch: tgt, area: "VAGINA" }] : null;
    if (id === "grope_breasts") return hasBreasts(tgt) ? [] : null;
    if (id === "kiss_start") return [];
    return null;
  }

  function isCommittedOngoing(id) {
    if (!id) return false;
    if (id === "kiss" || id === "grope_breasts" || id === "clit_play") return false;
    return /penis_|finger_|cunnilingus|anilingus|blowjob|suckle|tail_|tentacle_|clit_|toy_/.test(id);
  }

  function isPenetrativeStart(id) {
    return /penis_|finger_vagina|finger_anus|cunnilingus|anilingus|blowjob|tail_|tentacle_|toy_|clit_/.test(id || "");
  }

  function orgasmCount(ch) {
    return (ch && ch.orgasmedThisSex) || 0;
  }

  function orgasmsBeforeSatisfied(ch) {
    if (!ch) return 1;
    if (ch.orgasmsBeforeSatisfied != null) return ch.orgasmsBeforeSatisfied;
    return 1;
  }

  function isSatisfiedFromOrgasms(ch) {
    return orgasmCount(ch) >= orgasmsBeforeSatisfied(ch);
  }

  function isInForeplay(ch) {
    return (ch.arousal || 0) < 25 && orgasmCount(ch) === 0;
  }

  function characterAbleToStopSex(ch) {
    if (!ch || !LT.sex.active || LT.sex.finished) return false;
    if (LT.sex.managerCanStop === false) return false;
    if (isSpectator(ch)) return false;
    if (isDom(ch)) return true;
    return getSexControl(ch) === LT.SEX_CONTROL.FULL && !!LT.sex.consensual;
  }

  function isPlayerOwnedSlave(ch) {
    if (!ch || ch === LT.sex.player || ch.player) return false;
    if (ch.owner === LT.sex.player || ch.owner === "player") return true;
    if (ch.slave && (ch.slaveOwner === "player" || ch.slaveOwner === LT.sex.player)) return true;
    return false;
  }

  function isPartnerWantingToStopSex(partner) {
    if (!characterAbleToStopSex(partner)) return false;
    var playerAct = LT.sex._playerAct;
    if (playerAct && (playerAct.isOrgasm || playerAct.isPrepare || playerAct.type === "PREPARE_FOR_PARTNER_ORGASM")) return false;
    if (isDom(LT.sex.player) && !isSpectator(LT.sex.player) && characterAbleToStopSex(LT.sex.player) && isPlayerOwnedSlave(partner)) {
      return false;
    }
    var parts = LT.sex.participants || [LT.sex.player, LT.sex.partner];
    var domsSatisfied = true;
    var subsSatisfied = true;
    var subsResisting = true;
    var i;
    for (i = 0; i < parts.length; i++) {
      var ch = parts[i];
      if (!ch || isSpectator(ch)) continue;
      if (isDom(ch)) {
        if (!isSatisfiedFromOrgasms(ch)) domsSatisfied = false;
      } else {
        if (getSexPace(ch) !== "SUB_RESISTING") subsResisting = false;
        if (!isSatisfiedFromOrgasms(ch)) subsSatisfied = false;
      }
    }
    var gettingBored = orgasmCount(partner) > orgasmsBeforeSatisfied(partner) + 1;
    var subsStillInForeplay = true;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] && !isDom(parts[i]) && !isSpectator(parts[i]) && !isInForeplay(parts[i])) subsStillInForeplay = false;
    }
    if (isDom(partner) && (!LT.sex.consensual || subsResisting || (subsStillInForeplay && gettingBored))) {
      if (gettingBored) return true;
      return domsSatisfied;
    }
    if (getSexControl(partner) !== LT.SEX_CONTROL.FULL) return false;
    return domsSatisfied && subsSatisfied;
  }

  LT.sex.isPartnerWantingToStopSex = isPartnerWantingToStopSex;

  var NPC_STOP_SEX = {
    id: "stop_sex",
    name: "Stop sex",
    type: "SPECIAL",
    endsSex: true,
    perform: function (src, tgt) {
      return parseSex("Having had enough, [npc.name] [npc.verb(step)] back and [npc.verb(stop)] having sex...", src, tgt);
    },
  };

  LT.sex.pickPartnerAction = function (src, tgt) {
    src = src || this.partner;
    tgt = tgt || getTarget(src) || this.player;
    if (!src || !tgt) return LT.SEX_ACTIONS.do_nothing;
    if (isPartnerWantingToStopSex(src)) return NPC_STOP_SEX;
    if (isSpectator(src)) return LT.SEX_ACTIONS.watch || LT.SEX_ACTIONS.do_nothing;
    if ((src.arousal || 0) >= LT.MAX_AROUSAL) {
      if (isPreparedFor(src) || src === LT.sex.player) {
        if (LT.sex.requestedKnot && LT.SEX_ACTIONS.orgasm_knot && LT.SEX_ACTIONS.orgasm_knot.canUse(src, tgt)) return LT.SEX_ACTIONS.orgasm_knot;
        if (LT.sex.requestedCreampie && LT.SEX_ACTIONS.orgasm_creampie && LT.SEX_ACTIONS.orgasm_creampie.canUse(src, tgt)) return LT.SEX_ACTIONS.orgasm_creampie;
        if (LT.sex.requestedPullout && LT.SEX_ACTIONS.orgasm_floor && LT.SEX_ACTIONS.orgasm_floor.canUse(src, tgt)) return LT.SEX_ACTIONS.orgasm_floor;
        if (LT.SEX_ACTIONS.orgasm_creampie && LT.SEX_ACTIONS.orgasm_creampie.canUse(src, tgt)) return LT.SEX_ACTIONS.orgasm_creampie;
        if (LT.SEX_ACTIONS.orgasm && LT.SEX_ACTIONS.orgasm.canUse(src, tgt)) return LT.SEX_ACTIONS.orgasm;
        if (LT.SEX_ACTIONS.orgasm_floor && LT.SEX_ACTIONS.orgasm_floor.canUse(src, tgt)) return LT.SEX_ACTIONS.orgasm_floor;
      }
    }
    if (LT.sex._playerAct && LT.sex._playerAct.isOrgasm && LT.SEX_ACTIONS.orgasm_prepare) {
      return LT.SEX_ACTIONS.orgasm_prepare;
    }
    if (getSexPace(src) === "SUB_RESISTING") {
      var resistAct = LT.SEX_ACTIONS.resist;
      if (resistAct && (!resistAct.canUse || resistAct.canUse(src, tgt))) return resistAct;
      return LT.SEX_ACTIONS.do_nothing;
    }
    var prefer = LT.sex.managerSpec && LT.sex.managerSpec.preferStarts;
    if (prefer) {
      var p;
      for (p = 0; p < prefer.length; p++) {
        var prefAct = LT.SEX_ACTIONS[prefer[p]];
        if (prefAct && sexContentAllowed(prefAct) && (!prefAct.canUse || prefAct.canUse(src, tgt))) return prefAct;
      }
    }
    var committed = [];
    var i;
    var links = this.links || [];
    for (i = 0; i < links.length; i++) {
      if (isCommittedOngoing(links[i].id) && (links[i].giver === src || links[i].receiver === src)) committed.push(links[i]);
    }
    var kissAct = LT.SEX_ACTIONS.kiss_start;
    var canAddKiss = kissAct && this._stoppedThisTurn !== "kiss" && (!kissAct.canUse || kissAct.canUse(src, tgt));
    if (committed.length && canAddKiss) return kissAct;
    if (committed.length) {
      var on = committed[0];
      if (on.giver === src && LT.SEX_ACTIONS[on.id]) return LT.SEX_ACTIONS[on.id];
      if (on.receiver === src && LT.SEX_ACTIONS[on.id + "_receive"]) return LT.SEX_ACTIONS[on.id + "_receive"];
    }

    var starts = [
      "penis_vagina_start",
      "penis_vagina_receive_start",
      "penis_anus_start",
      "penis_anus_receive_start",
      "finger_vagina_start",
      "finger_vagina_receive_start",
      "blowjob_start",
      "blowjob_receive_start",
      "cunnilingus_start",
      "cunnilingus_receive_start",
      "finger_penis_start",
      "finger_penis_receive_start",
      "finger_anus_start",
      "finger_anus_receive_start",
      "anilingus_start",
      "anilingus_receive_start",
      "tail_vagina_start",
      "tentacle_vagina_start",
      "toy_vagina_start",
      "suckle_start",
      "finger_nipple_start",
      "penis_nipple_start",
      "penis_breasts_start",
      "penis_thighs_start",
      "penis_ass_start",
      "penis_feet_start",
    ];
    var i;
    var a;
    var scored = [];
    for (i = 0; i < starts.length; i++) {
      var id = starts[i];
      var act = LT.SEX_ACTIONS[id];
      var areas = desireAreas(id, src, tgt);
      if (!act || areas == null || !sexContentAllowed(act)) continue;
      if (this.preventSelf && /^self_/.test(id)) continue;
      if (getSexControl(src) < LT.SEX_CONTROL.ONGOING_PLUS_LIMITED_PENETRATIONS) continue;
      if (this.preventPenetration && isPenetrativeStart(id)) continue;
      var st = sexTypeOfAction(act, src);
      var weight = st ? calculateSexTypeWeighting(src, tgt, st.performing, st.targeted) : 1;
      if (weight < 0) continue;
      var blocked = null;
      for (a = 0; a < areas.length; a++) {
        if (blockingItem(areas[a].ch, areas[a].area)) {
          blocked = areas[a];
          break;
        }
      }
      if (blocked && this.preventClothing) continue;
      if (!blocked && act.canUse && !act.canUse(src, tgt)) continue;
      scored.push({ act: act, weight: weight, blocked: blocked, index: i });
    }
    scored.sort(function (a, b) {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.index - b.index;
    });
    if (scored.length) {
      var best = scored[0];
      if (best.blocked) {
        return partnerUndressAction(best.blocked.ch, best.blocked.area, src, tgt);
      }
      return best.act;
    }

    if (!this.preventPenetration && !this.preventPositioning && getSexControl(src) >= LT.SEX_CONTROL.FULL && this.turn - (this.lastNpcPositionTurn || -3) >= 2 && (!this.ongoing || !isCommittedOngoing(this.ongoing.id))) {
      var posIds = this.playerDom === false
        ? ["pos_all_fours", "pos_lying_down", "pos_face_to_wall", "pos_mating_press", "pos_cowgirl_bottom", "pos_sitting"]
        : ["pos_lying_down", "pos_all_fours", "pos_sitting", "pos_receive_oral"];
      for (i = 0; i < posIds.length; i++) {
        var pos = LT.SEX_ACTIONS[posIds[i]];
        if (pos && (!pos.canUse || pos.canUse(src, tgt))) {
          this.lastNpcPositionTurn = this.turn;
          return pos;
        }
      }
    }

    var fallbacks = ["dirty_talk", "clit_play", "grope_breasts", "kiss_start"];
    for (i = 0; i < fallbacks.length; i++) {
      var fall = LT.SEX_ACTIONS[fallbacks[i]];
      if (fall && sexContentAllowed(fall) && (!fall.canUse || fall.canUse(src, tgt))) return fall;
    }
    return LT.SEX_ACTIONS.do_nothing;
  };

  LT.sex.perform = function (actionId) {
    if (!this.active || this.finished) return;
    this._stoppedThisTurn = "";
    var target = getTarget(this.player) || this.partner;
    var waiting = partnerAwaitingOrgasm();
    if (waiting) target = waiting;
    var act = (this._clothActs && this._clothActs[actionId]) || (this._targetActs && this._targetActs[actionId]) || LT.SEX_ACTIONS[actionId];
    if (!act || (act.canUse && !act.canUse(this.player, target))) return;
    this._playerAct = act;
    this._turnBlocks = [];
    var lines = [];
    var playerText = runAction(this.player, target, act);
    this._turnBlocks.push({ src: this.player, tgt: target, act: act, html: playerText });
    lines.push("<p>" + playerText + "</p>");
    if (act.endsSex) {
      this.lastResolution = lines.join("");
      this.finished = true;
      this._playerAct = null;
      return;
    }
    var npcs = otherParticipants(this.player);
    var i;
    var npc;
    var npcTgt;
    var npcAct;
    for (i = 0; i < npcs.length; i++) {
      npc = npcs[i];
      npcTgt = getTarget(npc) || this.player;
      npcAct = this.pickPartnerAction(npc, npcTgt);
      if (npcAct) {
        var npcText = runAction(npc, npcTgt, npcAct);
        this._turnBlocks.push({ src: npc, tgt: npcTgt, act: npcAct, html: npcText });
        lines.push("<p>" + npcText + "</p>");
        if (npcAct.endsSex) {
          this.lastResolution = lines.join("");
          this.finished = true;
          this._playerAct = null;
          return;
        }
      }
    }
    this.turn += 1;
    if (act.isOrgasm && this.knotted && this.knotted.locked) {
      /* knot just set this turn — do not tick it down yet */
    } else {
      var deflate = tickKnotLock();
      if (deflate) {
        lines.push("<p>" + deflate + "</p>");
        this._turnBlocks.push({ src: this.player, tgt: target, act: { id: "knot_deflate", name: "Knot deflates" }, html: deflate });
      }
    }
    if (this.publicSex && !act.endsSex) {
      var publicLine = pick([
        "A passerby glances over and smirks as they watch.",
        "Someone nearby lets out an impressed whistle.",
        "You catch a stranger staring, making no effort to hide their interest.",
      ]);
      lines.push("<p><i>" + publicLine + "</i></p>");
      this._turnBlocks.push({ src: this.player, tgt: target, act: { id: "public_watch", name: "Public" }, html: "<i>" + publicLine + "</i>" });
    }
    this.lastResolution = lines.join("");
    this._playerAct = null;
  };

  LT.sex.finish = function () {
    var extra = "";
    this.active = false;
    var parts = this.participants || [this.player, this.partner];
    var i;
    if (typeof LT.applySexEndStatusEffects === "function") {
      for (i = 0; i < parts.length; i++) {
        if (parts[i]) LT.applySexEndStatusEffects(parts[i], !!parts[i].orgasmedThisSex);
      }
    }
    if (typeof LT.revealArea === "function") {
      for (i = 0; i < parts.length; i++) {
        (function (ch) {
          if (!ch || ch === LT.sex.player) return;
          ["NIPPLES", "ANUS", "PENIS", "VAGINA"].forEach(function (area) {
            LT.revealArea(ch, area);
          });
        })(parts[i]);
      }
    }
    if (this.onEnd) extra = this.onEnd() || "";
    if (extra) LT.game.textEnd = extra;
    if (this.postSexNode) LT.game.setContent(this.postSexNode);
  };

  LT.sex.bar = function (ch) {
    var a = roundOne(Math.max(0, ch.arousal || 0));
    var maxA = LT.MAX_AROUSAL || 100;
    var pct = Math.max(0, Math.min(100, (a / maxA) * 100));
    var lust = roundOne(Math.max(0, ch.lust || 0));
    var lustMax = LT.MAX_LUST || 100;
    var lustPct = Math.max(0, Math.min(100, (lust / lustMax) * 100));
    return (
      "<div class='combatant'>" +
      "<div class='combatant-name'>" +
      nameOf(ch) +
      (typeof LT.isDevMode === "function" && LT.isDevMode() && ch === LT.sex.partner && ch !== LT.sex.player ? " <span class='muted'>[target]</span>" : "") +
      (typeof LT.isDevMode === "function" && LT.isDevMode() && isSpectator(ch) ? " <span class='muted'>[watching]</span>" : "") +
      (typeof LT.isDevMode === "function" && LT.isDevMode() && typeof paceName === "function" ? " <span class='muted'>(" + paceName(ch) + ")</span>" : "") +
      "</div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      pct +
      "%;background:" +
      LT.Colour.ATTRIBUTE_AROUSAL +
      ";'></div></div>" +
      "<div class='muted'>" +
      a.toFixed(1) +
      " / " +
      maxA +
      " arousal</div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      lustPct +
      "%;background:" +
      LT.Colour.ATTRIBUTE_LUST +
      ";'></div></div>" +
      "<div class='muted'>" +
      lust.toFixed(1) +
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
