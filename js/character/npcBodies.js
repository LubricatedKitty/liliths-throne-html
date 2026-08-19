(function () {
  function spec(opts) {
    return opts;
  }

  LT.OFFICIAL_BODIES = {
    lilaya: spec({
      feminine: true, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 180, femininity: 85, bodySize: "TWO_AVERAGE", muscle: "ONE_LIGHTLY",
      skin: "LIGHT", hair: "BLACK", hairLength: "THREE_SHOULDER", hairStyle: "LOOSE",
      eye: "AMBER", lipSize: "TWO_FULL",
      breastSize: "E", breastShape: "PERKY", nippleSize: "THREE", areolaeSize: "THREE",
      assSize: "THREE", hipSize: "THREE",
      penisLength: 15, testicleSize: "TWO", vaginaCapacity: "TWO_TIGHT", labiaSize: "THREE", clitorisSize: "ZERO",
      faceType: "HUMAN", earType: "HUMAN",
      hornType: "SWEPT_BACK", tailType: "DEMON_COMMON", wingType: "DEMON_COMMON", wingSize: "FOUR_LARGE",
      race: "DEMON", subspecies: "half-demon", ageAppearance: 32,
      description: "Your demonic aunt, and a brilliant arcane researcher.",
    }),
    rose: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 165, femininity: 90, bodySize: "ONE_SLENDER", muscle: "TWO_TONED",
      skin: "LIGHT", hair: "AUBURN", hairLength: "THREE_SHOULDER", hairStyle: "BOB_CUT",
      eye: "GREEN", lipSize: "TWO_FULL",
      breastSize: "C", breastShape: "PERKY", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "TWO", hipSize: "TWO", vaginaCapacity: "ZERO_IMPENETRABLE", labiaSize: "ZERO",
      faceType: "HUMAN", earType: "CAT_MORPH", tailType: "CAT_MORPH",
      race: "CAT_MORPH", subspecies: "cat-girl",
      makeup: { MAKEUP_LIPSTICK: "RED", MAKEUP_EYE_LINER: "BLACK", MAKEUP_EYE_SHADOW: "RED", MAKEUP_NAIL_POLISH_HANDS: "PINK", MAKEUP_NAIL_POLISH_FEET: "PINK" },
      description: "Lilaya's cat-girl maid.",
    }),
    felicia: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 157, femininity: 75, bodySize: "ONE_SLENDER", muscle: "ONE_LIGHTLY",
      skin: "PALE", hair: "WHITE", hairLength: "FOUR_LONG", hairStyle: "PONYTAIL",
      eye: "BROWN", lipSize: "ONE_AVERAGE",
      breastSize: "C", breastShape: "ROUND", nippleSize: "ONE", areolaeSize: "ONE",
      assSize: "THREE", hipSize: "THREE",
      faceType: "DOG_MORPH", earType: "DOG_MORPH", tailType: "DOG_MORPH",
      race: "DOG_MORPH", subspecies: "samoyed dog-girl",
      description: "Arthur's neighbor and sometimes caregiver. Known for the smoothest, fluffiest fur in town.",
    }),
    scarlett: spec({
      feminine: false, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 155, femininity: 75, bodySize: "ONE_SLENDER", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BROWN", hairLength: "TWO_SHORT", hairStyle: "LOOSE",
      eye: "AMBER", lipSize: "TWO_FULL",
      breastSize: "AA", breastShape: "POINTY", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "TWO", hipSize: "TWO",
      penisLength: 8, testicleSize: "ZERO", vaginaCapacity: "ONE_EXTREMELY_TIGHT",
      faceType: "HARPY", earType: "HARPY", wingType: "HARPY", tailType: "NONE",
      race: "HARPY", subspecies: "harpy",
    }),
    helena: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 162, femininity: 100, bodySize: "ONE_SLENDER", muscle: "TWO_TONED",
      skin: "PALE", hair: "PLATINUM", hairLength: "THREE_SHOULDER", hairStyle: "STRAIGHT",
      eye: "BLUE", lipSize: "TWO_FULL",
      breastSize: "D", breastShape: "PERKY", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "THREE", vaginaCapacity: "ZERO_IMPENETRABLE",
      faceType: "HARPY", earType: "HARPY", wingType: "HARPY",
      race: "HARPY", subspecies: "harpy",
    }),
    candi: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 167, femininity: 85, bodySize: "TWO_AVERAGE", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BLONDE", hairLength: "FIVE_VERY_LONG", hairStyle: "PONYTAIL",
      eye: "BLUE", lipSize: "FOUR_HUGE",
      breastSize: "G", breastShape: "ROUND", nippleSize: "THREE", areolaeSize: "THREE",
      assSize: "FOUR", hipSize: "FOUR", vaginaCapacity: "SIX_STRETCHED_OPEN",
      faceType: "HUMAN", earType: "CAT_MORPH", tailType: "CAT_MORPH",
      race: "CAT_MORPH", subspecies: "cat-girl",
    }),
    finch: spec({
      feminine: false, hasPenis: true, hasVagina: false, hasBreasts: false,
      height: 183, femininity: 25, bodySize: "ONE_SLENDER", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BLACK", hairLength: "TWO_SHORT", hairStyle: "SLICKED_BACK",
      eye: "GREEN", lipSize: "ONE_AVERAGE",
      breastSize: "FLAT", nippleSize: "ZERO", areolaeSize: "ZERO",
      assSize: "ONE", hipSize: "ONE", penisLength: 8, testicleSize: "ONE",
      faceType: "HUMAN", earType: "CAT_MORPH", tailType: "CAT_MORPH",
      race: "CAT_MORPH", subspecies: "cat-boy",
    }),
    amber: spec({
      feminine: true, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 180, femininity: 85, bodySize: "TWO_AVERAGE", muscle: "THREE_MUSCULAR",
      skin: "TANNED", hair: "GINGER", hairLength: "FIVE_VERY_LONG", hairStyle: "WAVY",
      eye: "AMBER", lipSize: "TWO_FULL",
      breastSize: "G", breastShape: "SIDE_SET", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "THREE",
      penisLength: 25, testicleSize: "FOUR", vaginaCapacity: "TWO_TIGHT",
      hornType: "SWEPT_BACK", tailType: "DEMON_COMMON",
      race: "DEMON", subspecies: "succubus", ageAppearance: 28,
    }),
    nyan: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 165, femininity: 85, bodySize: "ZERO_SKINNY", muscle: "ONE_LIGHTLY",
      skin: "PALE", hair: "WHITE", hairLength: "THREE_SHOULDER", hairStyle: "LOOSE",
      eye: "BLUE", lipSize: "TWO_FULL",
      breastSize: "B", breastShape: "POINTY", nippleSize: "ONE", areolaeSize: "TWO",
      assSize: "TWO", hipSize: "TWO", vaginaCapacity: "ONE_EXTREMELY_TIGHT",
      faceType: "HUMAN", earType: "CAT_MORPH", tailType: "CAT_MORPH",
      race: "CAT_MORPH", subspecies: "cat-girl",
    }),
    kate: spec({
      feminine: true, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 180, femininity: 85, bodySize: "TWO_AVERAGE", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BLACK", hairLength: "THREE_SHOULDER", hairStyle: "SIDECUT",
      eye: "AMBER", lipSize: "TWO_FULL",
      breastSize: "F", breastShape: "ROUND", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "TWO",
      penisLength: 15, testicleSize: "THREE", vaginaCapacity: "ONE_EXTREMELY_TIGHT",
      hornType: "CURLED", tailType: "DEMON_COMMON", wingType: "DEMON_COMMON",
      race: "DEMON", subspecies: "succubus", ageAppearance: 28,
    }),
    ashley: spec({
      feminine: false, hasPenis: true, hasVagina: false, hasBreasts: false,
      height: 186, femininity: 50, bodySize: "ONE_SLENDER", muscle: "TWO_TONED",
      skin: "PALE", eye: "BLUE", race: "ANGEL", subspecies: "angel", ageAppearance: 25,
      raceConcealed: true,
    }),
    bunny: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 168, femininity: 85, bodySize: "ONE_SLENDER", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BLONDE", hairLength: "FOUR_LONG", hairStyle: "STRAIGHT",
      eye: "BLUE", lipSize: "TWO_FULL",
      breastSize: "E", breastShape: "ROUND", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "THREE", vaginaCapacity: "THREE_SLIGHTLY_LOOSE",
      earType: "NONE", tailType: "NONE",
      race: "HUMAN", subspecies: "rabbit-girl",
    }),
    loppy: spec({
      feminine: true, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 178, femininity: 80, bodySize: "TWO_AVERAGE", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BROWN", hairLength: "FOUR_LONG", hairStyle: "WAVY",
      eye: "BROWN", lipSize: "TWO_FULL",
      breastSize: "DD", breastShape: "ROUND", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "THREE",
      penisLength: 22, testicleSize: "THREE", vaginaCapacity: "THREE_SLIGHTLY_LOOSE",
      race: "HUMAN", subspecies: "rabbit-girl",
    }),
    jules: spec({
      feminine: false, hasPenis: true, hasVagina: false, hasBreasts: false,
      height: 190, femininity: 5, bodySize: "THREE_LARGE", muscle: "THREE_MUSCULAR",
      skin: "EBONY", hair: "BLACK", hairLength: "ONE_VERY_SHORT", hairStyle: "MOHAWK",
      eye: "BROWN", lipSize: "ONE_AVERAGE",
      breastSize: "FLAT", nippleSize: "ZERO", areolaeSize: "ZERO",
      assSize: "ONE", hipSize: "ONE", penisLength: 25, testicleSize: "THREE",
      faceType: "HORSE_MORPH", earType: "HORSE_MORPH", tailType: "HORSE_MORPH",
      race: "HORSE_MORPH", subspecies: "zebra-boy",
    }),
    kalahari: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 179, femininity: 85, bodySize: "TWO_AVERAGE", muscle: "FOUR_RIPPED",
      skin: "TANNED", hair: "BLONDE", hairLength: "THREE_SHOULDER", hairStyle: "WAVY",
      eye: "AMBER", lipSize: "TWO_FULL",
      breastSize: "C", breastShape: "PERKY", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "TWO", hipSize: "TWO", vaginaCapacity: "ONE_EXTREMELY_TIGHT",
      faceType: "HUMAN", earType: "CAT_MORPH", tailType: "CAT_MORPH",
      race: "CAT_MORPH", subspecies: "lioness",
    }),
    kruger: spec({
      feminine: false, hasPenis: true, hasVagina: false, hasBreasts: false,
      height: 188, femininity: 0, bodySize: "THREE_LARGE", muscle: "FOUR_RIPPED",
      skin: "TANNED", hair: "BLONDE", hairLength: "TWO_SHORT", hairStyle: "LOOSE",
      eye: "AMBER", lipSize: "ONE_AVERAGE",
      breastSize: "FLAT", nippleSize: "ZERO", areolaeSize: "ZERO",
      assSize: "ONE", hipSize: "ONE", penisLength: 20, testicleSize: "THREE",
      faceType: "HUMAN", earType: "CAT_MORPH", tailType: "CAT_MORPH",
      race: "CAT_MORPH", subspecies: "lion",
    }),
    hannah: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 192, femininity: 65, bodySize: "THREE_LARGE", muscle: "FOUR_RIPPED",
      skin: "DARK", hair: "BLACK", hairLength: "TWO_SHORT", hairStyle: "SLICKED_BACK",
      eye: "BLUE", lipSize: "TWO_FULL",
      breastSize: "C", breastShape: "WIDE", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "TWO", hipSize: "THREE", vaginaCapacity: "TWO_TIGHT",
      faceType: "DOG_MORPH", earType: "DOG_MORPH", tailType: "DOG_MORPH",
      race: "DOG_MORPH", subspecies: "spotted hyena-girl",
    }),
    angel: spec({
      feminine: true, hasPenis: false, hasVagina: true, hasBreasts: true,
      height: 174, femininity: 90, bodySize: "ONE_SLENDER", muscle: "TWO_TONED",
      skin: "LIGHT", hair: "BLONDE", hairLength: "FOUR_LONG", hairStyle: "WAVY",
      eye: "BLUE", lipSize: "THREE_PLUMP",
      breastSize: "DD", breastShape: "ROUND", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "THREE", vaginaCapacity: "FIVE_ROOMY",
      race: "DEMON", subspecies: "succubus",
    }),
    katherine: spec({
      feminine: true, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 180, femininity: 85, bodySize: "TWO_AVERAGE", muscle: "THREE_MUSCULAR",
      skin: "LIGHT", hair: "BLACK", hairLength: "FOUR_LONG", hairStyle: "HIME_CUT",
      eye: "AMBER", lipSize: "TWO_FULL",
      breastSize: "F", breastShape: "ROUND", nippleSize: "THREE", areolaeSize: "THREE",
      assSize: "THREE", hipSize: "THREE",
      penisLength: 17, testicleSize: "TWO", vaginaCapacity: "TWO_TIGHT",
      hornType: "CURLED", tailType: "DEMON_COMMON",
      race: "DEMON", subspecies: "succubus", ageAppearance: 18,
    }),
    arthur: spec({
      feminine: false, hasPenis: true, hasVagina: false, hasBreasts: false,
      height: 183, femininity: 25, bodySize: "ONE_SLENDER", muscle: "ONE_LIGHTLY",
      skin: "LIGHT", hair: "BROWN", hairLength: "TWO_SHORT", hairStyle: "MESSY",
      eye: "BROWN", lipSize: "ONE_AVERAGE",
      breastSize: "FLAT", nippleSize: "ZERO", areolaeSize: "ZERO",
      assSize: "ONE", hipSize: "ONE", penisLength: 15, testicleSize: "TWO",
      race: "HUMAN", subspecies: "human",
    }),
    brax: spec({
      feminine: false, hasPenis: true, hasVagina: false, hasBreasts: false,
      height: 183, femininity: 25, bodySize: "THREE_LARGE", muscle: "FOUR_RIPPED",
      skin: "LIGHT", hair: "GREY", hairLength: "ZERO_BALD", hairStyle: "NONE",
      eye: "BLUE", lipSize: "ONE_AVERAGE",
      breastSize: "FLAT", nippleSize: "ZERO", areolaeSize: "ZERO",
      assSize: "ONE", hipSize: "ONE", penisLength: 20, testicleSize: "THREE",
      faceType: "WOLF_MORPH", earType: "WOLF_MORPH", tailType: "WOLF_MORPH",
      race: "WOLF_MORPH", subspecies: "wolf-boy",
    }),
    vicky: spec({
      feminine: true, hasPenis: true, hasVagina: true, hasBreasts: true,
      height: 175, femininity: 85, bodySize: "THREE_LARGE", muscle: "FOUR_RIPPED",
      skin: "LIGHT", hair: "GREY", hairLength: "ZERO_BALD", hairStyle: "NONE",
      eye: "AMBER", lipSize: "ONE_AVERAGE",
      breastSize: "C", breastShape: "SIDE_SET", nippleSize: "TWO", areolaeSize: "TWO",
      assSize: "THREE", hipSize: "THREE",
      penisLength: 22, testicleSize: "THREE", vaginaCapacity: "FIVE_ROOMY",
      faceType: "WOLF_MORPH", earType: "WOLF_MORPH", tailType: "WOLF_MORPH",
      race: "WOLF_MORPH", subspecies: "wolf-girl",
    }),
  };

  LT.applyOfficialBody = function (ch, preset) {
    if (!ch || !preset) return ch;
    if (typeof LT.createBody !== "function") return ch;
    ch.body = LT.createBody(preset);
    ch.body._officialApplied = true;
    if (preset.ageAppearance) ch.ageAppearance = preset.ageAppearance;
    if (preset.raceConcealed) ch.raceConcealed = true;
    if (preset.description) ch.description = preset.description;
    if (preset.subspecies) {
      ch.raceName = preset.subspecies;
      ch.fullRace = preset.subspecies;
    }
    if (preset.makeup) {
      ch.makeup = ch.makeup || {};
      Object.keys(preset.makeup).forEach(function (slot) {
        ch.makeup[slot] = { colour: preset.makeup[slot], modifier: "MAKEUP" };
      });
    }
    if (preset.hasPenis && preset.hasVagina) {
      ch.gender = ch.gender || LT.Gender.FUTANARI || LT.Gender.FEMALE;
    }
    if (typeof LT.syncCharacterFromBody === "function") LT.syncCharacterFromBody(ch);
    return ch;
  };

  LT.ensureAppearance = function (ch) {
    if (!ch) return ch;
    if (typeof LT.ensureCharacterSystems === "function") LT.ensureCharacterSystems(ch);
    var id = ch.id;
    if (id && LT.OFFICIAL_BODIES[id] && (!ch.body || !ch.body._officialApplied)) {
      LT.applyOfficialBody(ch, LT.OFFICIAL_BODIES[id]);
    }
    return ch;
  };
})();
