(function () {
  function list() {
    var items = [];
    for (var i = 0; i < arguments.length; i++) items.push(arguments[i]);
    return items;
  }

  function item(id, name, colour) {
    return { id: id, name: name, colour: colour || "#dddddd" };
  }

  LT.BODY_SIZE = {
    ZERO_SKINNY: item("ZERO_SKINNY", "skinny", "#c9dde8"),
    ONE_SLENDER: item("ONE_SLENDER", "slender", "#9ec9dc"),
    TWO_AVERAGE: item("TWO_AVERAGE", "average", "#88b8d4"),
    THREE_LARGE: item("THREE_LARGE", "large", "#6fa4c4"),
    FOUR_HUGE: item("FOUR_HUGE", "huge", "#4f88ab"),
  };
  LT.BODY_SIZE_LIST = list(
    LT.BODY_SIZE.ZERO_SKINNY, LT.BODY_SIZE.ONE_SLENDER, LT.BODY_SIZE.TWO_AVERAGE,
    LT.BODY_SIZE.THREE_LARGE, LT.BODY_SIZE.FOUR_HUGE,
  );

  LT.MUSCLE = {
    ZERO_SOFT: item("ZERO_SOFT", "soft", "#f0d0d0"),
    ONE_LIGHTLY: item("ONE_LIGHTLY", "lightly muscled", "#e8b4b4"),
    TWO_TONED: item("TWO_TONED", "toned", "#d88888"),
    THREE_MUSCULAR: item("THREE_MUSCULAR", "muscular", "#c06060"),
    FOUR_RIPPED: item("FOUR_RIPPED", "ripped", "#a83838"),
  };
  LT.MUSCLE_LIST = list(
    LT.MUSCLE.ZERO_SOFT, LT.MUSCLE.ONE_LIGHTLY, LT.MUSCLE.TWO_TONED,
    LT.MUSCLE.THREE_MUSCULAR, LT.MUSCLE.FOUR_RIPPED,
  );

  LT.LIP = {
    ZERO_THIN: item("ZERO_THIN", "thin"),
    ONE_AVERAGE: item("ONE_AVERAGE", "average-sized"),
    TWO_FULL: item("TWO_FULL", "full"),
    THREE_PLUMP: item("THREE_PLUMP", "plump"),
    FOUR_HUGE: item("FOUR_HUGE", "huge"),
  };
  LT.LIP_LIST = list(LT.LIP.ZERO_THIN, LT.LIP.ONE_AVERAGE, LT.LIP.TWO_FULL, LT.LIP.THREE_PLUMP, LT.LIP.FOUR_HUGE);

  LT.HAIR_LENGTH = {
    ZERO_BALD: item("ZERO_BALD", "bald"),
    ONE_VERY_SHORT: item("ONE_VERY_SHORT", "very short"),
    TWO_SHORT: item("TWO_SHORT", "short"),
    THREE_SHOULDER: item("THREE_SHOULDER", "shoulder-length"),
    FOUR_LONG: item("FOUR_LONG", "long"),
    FIVE_VERY_LONG: item("FIVE_VERY_LONG", "very long"),
    SIX_INCREDIBLY: item("SIX_INCREDIBLY", "incredibly long"),
  };
  LT.HAIR_LENGTH_LIST = list(
    LT.HAIR_LENGTH.ZERO_BALD, LT.HAIR_LENGTH.ONE_VERY_SHORT, LT.HAIR_LENGTH.TWO_SHORT,
    LT.HAIR_LENGTH.THREE_SHOULDER, LT.HAIR_LENGTH.FOUR_LONG, LT.HAIR_LENGTH.FIVE_VERY_LONG,
    LT.HAIR_LENGTH.SIX_INCREDIBLY,
  );

  LT.HAIR_STYLE = [
    { id: "NONE", name: "none", minLength: 0 },
    { id: "MESSY", name: "messy", minLength: 1 },
    { id: "LOOSE", name: "loose", minLength: 1 },
    { id: "SLICKED_BACK", name: "slicked-back", minLength: 1 },
    { id: "MOHAWK", name: "mohawk", minLength: 1 },
    { id: "AFRO", name: "afro", minLength: 1 },
    { id: "SIDECUT", name: "sidecut", minLength: 1 },
    { id: "PIXIE", name: "pixie-cut", minLength: 1 },
    { id: "BOB_CUT", name: "bob cut", minLength: 2 },
    { id: "STRAIGHT", name: "straight", minLength: 2 },
    { id: "WAVY", name: "wavy", minLength: 2 },
    { id: "CURLY", name: "curly", minLength: 2 },
    { id: "PONYTAIL", name: "ponytail", minLength: 3 },
    { id: "LOW_PONYTAIL", name: "low ponytail", minLength: 3 },
    { id: "BUN", name: "bun", minLength: 3 },
    { id: "CHIGNON", name: "chignon", minLength: 3 },
    { id: "BRAIDED", name: "braided", minLength: 3 },
    { id: "TWIN_TAILS", name: "twin tails", minLength: 3 },
    { id: "TWIN_BRAIDS", name: "twin braids", minLength: 3 },
    { id: "SIDE_BRAIDS", name: "side braids", minLength: 3 },
    { id: "CROWN_BRAID", name: "crown braid", minLength: 3 },
    { id: "HIME_CUT", name: "hime cut", minLength: 3 },
    { id: "TOPKNOT", name: "topknot", minLength: 2 },
    { id: "DREADLOCKS", name: "dreadlocks", minLength: 2 },
  ];

  LT.CUP = {
    FLAT: item("FLAT", "flat"),
    AA: item("AA", "AA-cup"),
    A: item("A", "A-cup"),
    B: item("B", "B-cup"),
    C: item("C", "C-cup"),
    D: item("D", "D-cup"),
    DD: item("DD", "DD-cup"),
    E: item("E", "E-cup"),
    F: item("F", "F-cup"),
    FF: item("FF", "FF-cup"),
    G: item("G", "G-cup"),
    GG: item("GG", "GG-cup"),
    H: item("H", "H-cup"),
  };
  LT.CUP_LIST = list(
    LT.CUP.FLAT, LT.CUP.AA, LT.CUP.A, LT.CUP.B, LT.CUP.C, LT.CUP.D, LT.CUP.DD,
    LT.CUP.E, LT.CUP.F, LT.CUP.FF, LT.CUP.G, LT.CUP.GG, LT.CUP.H,
  );

  LT.BREAST_SHAPE = [
    item("ROUND", "round"),
    item("POINTY", "pointy"),
    item("PERKY", "perky"),
    item("SIDE_SET", "side-set"),
    item("WIDE", "wide"),
    item("NARROW", "narrow"),
  ];

  LT.SIZE5 = [
    item("ZERO", "tiny"),
    item("ONE", "small"),
    item("TWO", "average-sized"),
    item("THREE", "large"),
    item("FOUR", "huge"),
  ];

  LT.SKIN = [
    { id: "PALE", name: "pale", hex: "#f3d7c4" },
    { id: "LIGHT", name: "light", hex: "#e8c4a8" },
    { id: "PORCELAIN", name: "porcelain", hex: "#f7e6d8" },
    { id: "ROSY", name: "rosy", hex: "#e8b39a" },
    { id: "OLIVE", name: "olive", hex: "#c49262" },
    { id: "TANNED", name: "tanned", hex: "#c68642" },
    { id: "DARK", name: "dark", hex: "#8d5524" },
    { id: "EBONY", name: "ebony", hex: "#3b2213" },
  ];

  LT.HAIR_COLOUR = [
    { id: "BLACK", name: "black", hex: "#1a1a1a" },
    { id: "DARK_BROWN", name: "dark brown", hex: "#3b2414" },
    { id: "BROWN", name: "brown", hex: "#6b3f1d" },
    { id: "AUBURN", name: "auburn", hex: "#922b05" },
    { id: "GINGER", name: "ginger", hex: "#c45216" },
    { id: "BLONDE", name: "blonde", hex: "#d4b46a" },
    { id: "PLATINUM", name: "platinum", hex: "#e8dcb0" },
    { id: "GREY", name: "grey", hex: "#9a9a9a" },
    { id: "WHITE", name: "white", hex: "#f0f0f0" },
    { id: "PINK", name: "pink", hex: "#ff6bda" },
  ];

  LT.EYE = [
    { id: "BROWN", name: "brown", hex: "#6b3f1d" },
    { id: "HAZEL", name: "hazel", hex: "#8e7618" },
    { id: "GREEN", name: "green", hex: "#3d8c40" },
    { id: "BLUE", name: "blue", hex: "#3b6ea5" },
    { id: "GREY", name: "grey", hex: "#7a7a7a" },
    { id: "AMBER", name: "amber", hex: "#c47b17" },
  ];

  LT.hairLengthIndex = function (id) {
    for (var i = 0; i < LT.HAIR_LENGTH_LIST.length; i++) {
      if (LT.HAIR_LENGTH_LIST[i].id === id) return i;
    }
    return 0;
  };

  LT.bodyShapeOf = function (size, muscle) {
    var si = LT.BODY_SIZE_LIST.indexOf(size);
    var mi = LT.MUSCLE_LIST.indexOf(muscle);
    if (si < 0) si = 2;
    if (mi < 0) mi = 2;
    if (mi >= 3 && si <= 1) return { name: "athletic", colour: "#57be7e" };
    if (mi >= 3) return { name: "muscular", colour: "#c06060" };
    if (si >= 4) return { name: "huge", colour: "#4f88ab" };
    if (si >= 3) return { name: "large", colour: "#6fa4c4" };
    if (si === 0) return { name: "skinny", colour: "#c9dde8" };
    if (si === 1) return { name: "slender", colour: "#9ec9dc" };
    return { name: "average", colour: "#88b8d4" };
  };

  LT.findById = function (arr, id) {
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return arr[0];
  };

  function e(id, name) {
    return { id: id, name: name };
  }

  LT.BODY_HAIR = [
    e("ZERO_NONE", "none"),
    e("ONE_STUBBLE", "stubble"),
    e("TWO_MANICURED", "manicured"),
    e("THREE_TRIMMED", "trimmed"),
    e("FOUR_NATURAL", "natural"),
    e("FIVE_UNKEMPT", "unkempt"),
    e("SIX_BUSHY", "bushy"),
    e("SEVEN_WILD", "wild"),
  ];

  LT.BODY_MATERIAL = [
    e("FLESH", "flesh"),
    e("SLIME", "slime"),
    e("FIRE", "fire"),
    e("ICE", "ice"),
    e("AIR", "air"),
    e("EARTH", "earth"),
    e("WATER", "water"),
    e("ARCANE", "arcane"),
    e("RUBBER", "rubber"),
  ];

  LT.GENITAL_ARRANGEMENT = [
    e("NORMAL", "normal"),
    e("CLOACA", "cloaca"),
    e("CLOACA_BEHIND", "rear cloaca"),
  ];

  LT.RACE_STAGE = [
    e("HUMAN", "human"),
    e("PARTIAL", "partial"),
    e("LESSER", "lesser"),
    e("GREATER", "greater"),
    e("FELINE_MORPH", "feline-morph"),
  ];

  LT.NIPPLE_SHAPE = [
    e("NORMAL", "normal"),
    e("INVERTED", "inverted"),
    e("LIPS", "lips"),
    e("VAGINA", "vagina"),
  ];

  LT.AREOLAE_SHAPE = [e("NORMAL", "round"), e("HEART", "heart"), e("STAR", "star")];

  LT.EYE_SHAPE = [
    e("ROUND", "round"),
    e("HORIZONTAL", "horizontal"),
    e("VERTICAL", "vertical"),
    e("HEART", "heart"),
    e("STAR", "star"),
  ];

  LT.FOOT_STRUCTURE = [
    e("PLANTIGRADE", "plantigrade"),
    e("DIGITIGRADE", "digitigrade"),
    e("UNGULIGRADE", "unguligrade"),
    e("ARACHNOID", "arachnoid"),
  ];

  LT.LEG_CONFIGURATION = [
    e("BIPEDAL", "bipedal"),
    e("TAUR", "taur"),
    e("TAIL_LONG", "serpent"),
    e("TAIL", "tail"),
    e("ARACHNID", "arachnid"),
    e("CEPHALOPOD", "cephalopod"),
    e("AVIAN", "avian"),
  ];

  LT.LACTATION = [
    e("ZERO_NONE", "none"),
    e("ONE_TRICKLE", "a trickle"),
    e("TWO_LITTLE", "a small amount"),
    e("THREE_DECENT_AMOUNT", "a decent amount"),
    e("FOUR_LARGE", "a large amount"),
    e("FIVE_HUGE", "a huge amount"),
    e("SIX_EXTREME", "an extreme amount"),
    e("SEVEN_MONSTROUS", "a monstrous amount"),
  ];

  LT.CUM_PRODUCTION = [
    e("ZERO_NONE", "none"),
    e("ONE_TRICKLE", "a trickle"),
    e("TWO_SMALL_AMOUNT", "a small amount"),
    e("THREE_AVERAGE", "an average amount"),
    e("FOUR_LARGE", "a large amount"),
    e("FIVE_HUGE", "a huge amount"),
    e("SIX_EXTREME", "an extreme amount"),
    e("SEVEN_MONSTROUS", "a monstrous amount"),
  ];

  LT.CAPACITY = [
    e("ZERO_IMPENETRABLE", "impenetrably tight"),
    e("ONE_EXTREMELY_TIGHT", "extremely tight"),
    e("TWO_TIGHT", "tight"),
    e("THREE_SLIGHTLY_LOOSE", "slightly loose"),
    e("FOUR_LOOSE", "loose"),
    e("FIVE_ROOMY", "roomy"),
    e("SIX_STRETCHED_OPEN", "stretched open"),
    e("SEVEN_GAPING", "gaping"),
  ];

  LT.AGE_CATEGORY = [
    { id: "TEENS_LATE", name: "late teens", min: 18, max: 19, colour: "#ff9de0" },
    { id: "TWENTIES", name: "twenties", min: 20, max: 29, colour: "#ff6bda" },
    { id: "THIRTIES", name: "thirties", min: 30, max: 39, colour: "#e36f9b" },
    { id: "FORTIES", name: "forties", min: 40, max: 49, colour: "#c06fe3" },
    { id: "FIFTIES", name: "fifties", min: 50, max: 59, colour: "#b98cff" },
    { id: "SIXTIES_PLUS", name: "sixties or older", min: 60, max: 200, colour: "#888888" },
  ];

  LT.WETNESS = [
    e("ZERO_DRY", "dry"),
    e("ONE_SLIGHTLY_MOIST", "slightly moist"),
    e("TWO_MOIST", "moist"),
    e("THREE_WET", "wet"),
    e("FOUR_SLIMY", "slimy"),
    e("FIVE_SLOPPY", "sloppy"),
    e("SIX_SOPPING_WET", "sopping wet"),
    e("SEVEN_DROOLING", "drooling"),
  ];

  LT.ELASTICITY = [
    e("ZERO_UNYIELDING", "unyielding"),
    e("ONE_RIGID", "rigid"),
    e("TWO_FIRM", "firm"),
    e("THREE_FLEXIBLE", "flexible"),
    e("FOUR_LIMBER", "limber"),
    e("FIVE_STRETCHY", "stretchy"),
    e("SIX_SUPPLE", "supple"),
    e("SEVEN_ELASTIC", "elastic"),
  ];

  LT.PLASTICITY = [
    e("ZERO_RUBBERY", "rubbery"),
    e("ONE_SPRINGY", "springy"),
    e("TWO_TENSILE", "tensile"),
    e("THREE_RESILIENT", "resilient"),
    e("FOUR_ACCOMMODATING", "accommodating"),
    e("FIVE_YIELDING", "yielding"),
    e("SIX_MALLEABLE", "malleable"),
    e("SEVEN_MOULDABLE", "mouldable"),
  ];

  LT.ORIFICE_DEPTH = [
    e("ZERO_EXTREMELY_SHALLOW", "extremely shallow"),
    e("ONE_SHALLOW", "shallow"),
    e("TWO_AVERAGE", "average"),
    e("THREE_DEEP", "deep"),
    e("FOUR_VERY_DEEP", "very deep"),
    e("FIVE_CAVERNOUS", "cavernous"),
    e("SIX_FATHOMLESS", "fathomless"),
    e("SEVEN_UNFATHOMABLE", "unfathomable"),
  ];

  LT.PENETRATION_GIRTH = [
    e("ZERO_THIN", "thin"),
    e("ONE_SLENDER", "slender"),
    e("TWO_NARROW", "narrow"),
    e("THREE_AVERAGE", "average"),
    e("FOUR_GIRTHY", "girthy"),
    e("FIVE_THICK", "thick"),
    e("SIX_CHUBBY", "chubby"),
    e("SEVEN_FAT", "fat"),
  ];

  LT.WING_SIZE = [
    e("ZERO_NONEXISTENT", "none"),
    e("ONE_TINY", "tiny"),
    e("TWO_SMALL", "small"),
    e("THREE_AVERAGE", "average"),
    e("FOUR_LARGE", "large"),
    e("FIVE_HUGE", "huge"),
    e("SIX_MASSIVE", "massive"),
    e("SEVEN_UNREASONABLE", "unreasonable"),
  ];

  LT.PART_TYPE = {
    NONE: e("NONE", "none"),
    HUMAN: e("HUMAN", "human"),
    DEMON: e("DEMON", "demon"),
    CAT_MORPH: e("CAT_MORPH", "cat-morph"),
    DOG_MORPH: e("DOG_MORPH", "dog-morph"),
    WOLF_MORPH: e("WOLF_MORPH", "wolf-morph"),
    HORSE_MORPH: e("HORSE_MORPH", "horse-morph"),
    FOX_MORPH: e("FOX_MORPH", "fox-morph"),
    HARPY: e("HARPY", "harpy"),
  };

  LT.RACE = [
    e("HUMAN", "human"),
    e("DEMON", "demon"),
    e("CAT_MORPH", "cat-morph"),
    e("DOG_MORPH", "dog-morph"),
    e("WOLF_MORPH", "wolf-morph"),
    e("HORSE_MORPH", "horse-morph"),
    e("FOX_MORPH", "fox-morph"),
    e("HARPY", "harpy"),
  ];

  LT.PIERCING_SLOTS = [
    "ear",
    "nose",
    "lip",
    "tongue",
    "navel",
    "nipple",
    "vagina",
    "penis",
  ];

  LT.ORIFICE_MODIFIER = [
    e("PUFFY", "puffy"),
    e("RIBBED", "internally-ribbed"),
    e("TENTACLED", "tentacled"),
    e("MUSCLE_CONTROL", "internally-muscled"),
  ];

  LT.PENETRATION_MODIFIER = [
    e("SHEATHED", "sheathed"),
    e("RIBBED", "ribbed"),
    e("TENTACLED", "tentacled"),
    e("KNOTTED", "knotted"),
    e("BLUNT", "blunt"),
    e("TAPERED", "tapered"),
    e("FLARED", "flared"),
    e("BARBED", "barbed"),
    e("VEINY", "veiny"),
    e("PREHENSILE", "prehensile"),
    e("OVIPOSITOR", "ovipositor"),
  ];

  LT.TONGUE_MODIFIER = [
    e("RIBBED", "ribbed"),
    e("TENTACLED", "tentacled"),
    e("BIFURCATED", "bifurcated"),
    e("WIDE", "wide"),
    e("FLAT", "flat"),
    e("STRONG", "strong"),
    e("TAPERED", "tapered"),
  ];

  LT.FLUID_FLAVOUR = [
    e("CUM", "cum"),
    e("MILK", "milk"),
    e("GIRL_CUM", "girlcum"),
    e("FLAVOURLESS", "flavourless"),
    e("BUBBLEGUM", "bubblegum"),
    e("BEER", "beer"),
    e("VANILLA", "vanilla"),
    e("STRAWBERRY", "strawberry"),
    e("CHOCOLATE", "chocolate"),
    e("PINEAPPLE", "pineapple"),
    e("HONEY", "honey"),
    e("MINT", "mint"),
    e("CHERRY", "cherry"),
    e("COFFEE", "coffee"),
    e("TEA", "tea"),
    e("MAPLE", "maple"),
    e("CINNAMON", "cinnamon"),
    e("LEMON", "lemon"),
    e("ORANGE", "orange"),
    e("GRAPE", "grape"),
    e("MELON", "melon"),
    e("COCONUT", "coconut"),
    e("BLUEBERRY", "blueberry"),
    e("BANANA", "banana"),
  ];

  LT.FLUID_MODIFIER = [
    e("VISCOUS", "viscous"),
    e("STICKY", "sticky"),
    e("SLIMY", "slimy"),
    e("BUBBLING", "bubbling"),
    e("MUSKY", "musky"),
    e("MINERAL_OIL", "mineral oil"),
    e("ALCOHOLIC", "strongly alcoholic"),
    e("ALCOHOLIC_WEAK", "alcoholic"),
    e("ADDICTIVE", "addictive"),
    e("HALLUCINOGENIC", "psychoactive"),
  ];

  LT.TF_COLOURS = [
    { id: "PALE", name: "pale", hex: "#f3d7c4" },
    { id: "LIGHT", name: "light", hex: "#e8c4a8" },
    { id: "PORCELAIN", name: "porcelain", hex: "#f7e6d8" },
    { id: "ROSY", name: "rosy", hex: "#e8b39a" },
    { id: "OLIVE", name: "olive", hex: "#c49262" },
    { id: "TANNED", name: "tanned", hex: "#c68642" },
    { id: "DARK", name: "dark", hex: "#8d5524" },
    { id: "EBONY", name: "ebony", hex: "#3b2213" },
    { id: "BLACK", name: "black", hex: "#1a1a1a" },
    { id: "WHITE", name: "white", hex: "#f0f0f0" },
    { id: "GREY", name: "grey", hex: "#9a9a9a" },
    { id: "RED", name: "red", hex: "#c41e3a" },
    { id: "CRIMSON", name: "crimson", hex: "#8b0000" },
    { id: "PURPLE", name: "purple", hex: "#7b3fa1" },
    { id: "VIOLET", name: "violet", hex: "#9b59b6" },
    { id: "LILAC", name: "lilac", hex: "#c8a2c8" },
    { id: "PINK", name: "pink", hex: "#ff6bda" },
    { id: "BLUE", name: "blue", hex: "#3b6ea5" },
    { id: "GREEN", name: "green", hex: "#3d8c40" },
    { id: "GOLD", name: "gold", hex: "#d4af37" },
    { id: "SILVER", name: "silver", hex: "#c0c0c0" },
    { id: "AMBER", name: "amber", hex: "#c47b17" },
    { id: "BROWN", name: "brown", hex: "#6b3f1d" },
    { id: "HAZEL", name: "hazel", hex: "#8e7618" },
  ];

  LT.SELF_TRANSFORM_RACES = ["DEMON", "ANGEL", "SLIME", "ELEMENTAL", "LILIN", "ELDER_LILIN", "HALF_DEMON", "IMP"];

  LT.MAKEUP_SLOTS = [
    { id: "MAKEUP_BLUSHER", name: "Blusher", help: "Blusher (also called rouge) is used to colour the cheeks so as to provide a more youthful appearance, and to emphasise the cheekbones." },
    { id: "MAKEUP_LIPSTICK", name: "Lipstick", help: "Lipstick is used to provide colour, texture, and protection to the wearer's lips." },
    { id: "MAKEUP_EYE_LINER", name: "Eyeliner", help: "Eyeliner is applied around the contours of the eyes to help to define shape or highlight different features." },
    { id: "MAKEUP_EYE_SHADOW", name: "Eye shadow", help: "Eye shadow is used to make the wearer's eyes stand out or look more attractive." },
    { id: "MAKEUP_NAIL_POLISH_HANDS", name: "Nail polish", help: "Nail polish is used to colour and protect the nails on your hands." },
    { id: "MAKEUP_NAIL_POLISH_FEET", name: "Toenail polish", help: "Toenail polish is used to colour and protect the nails on your feet." },
  ];

  LT.MAKEUP_COLOURS = [
    { id: "NONE", name: "none", hex: "#888888" },
    { id: "BLACK", name: "black", hex: "#1a1a1a" },
    { id: "WHITE", name: "white", hex: "#f0f0f0" },
    { id: "RED", name: "red", hex: "#c41e3a" },
    { id: "RED_DARK", name: "dark red", hex: "#8b0000" },
    { id: "RED_LIGHT", name: "light red", hex: "#e35d6a" },
    { id: "PINK", name: "pink", hex: "#ff6bda" },
    { id: "PINK_LIGHT", name: "light pink", hex: "#ffb6d9" },
    { id: "PURPLE", name: "purple", hex: "#7b3fa1" },
    { id: "PURPLE_LIGHT", name: "light purple", hex: "#c8a2c8" },
    { id: "BLUE", name: "blue", hex: "#3b6ea5" },
    { id: "BLUE_LIGHT", name: "light blue", hex: "#7eb6d9" },
    { id: "GOLD", name: "gold", hex: "#d4af37" },
    { id: "SILVER", name: "silver", hex: "#c0c0c0" },
    { id: "CLEAR", name: "clear", hex: "#dddddd" },
  ];

  LT.PIERCING_TYPES = [
    { id: "ear", name: "Ear", help: "A piercing through the earlobe or cartilage." },
    { id: "nose", name: "Nose", help: "A piercing through the nose." },
    { id: "lip", name: "Lip", help: "A piercing through the lip." },
    { id: "tongue", name: "Tongue", help: "A piercing through the tongue." },
    { id: "navel", name: "Navel", help: "A piercing through the navel." },
    { id: "nipple", name: "Nipple", help: "A piercing through the nipple." },
    { id: "vagina", name: "Vagina", help: "A piercing through the clitoral hood or labia.", needs: "vagina" },
    { id: "penis", name: "Penis", help: "A piercing through the penis.", needs: "penis" },
  ];

  LT.TATTOO_SLOTS = [
    { id: "HEAD", name: "head" },
    { id: "EYES", name: "upper face" },
    { id: "HAIR", name: "ears" },
    { id: "MOUTH", name: "lower face" },
    { id: "NECK", name: "neck" },
    { id: "TORSO_OVER", name: "upper back" },
    { id: "TORSO_UNDER", name: "lower back" },
    { id: "CHEST", name: "chest" },
    { id: "NIPPLE", name: "nipples" },
    { id: "STOMACH", name: "stomach" },
    { id: "HAND", name: "forearms" },
    { id: "WRIST", name: "upper arms" },
    { id: "FINGER", name: "hands" },
    { id: "HIPS", name: "hips" },
    { id: "ANUS", name: "ass" },
    { id: "LEG", name: "upper leg" },
    { id: "GROIN", name: "lower abdomen" },
    { id: "SOCK", name: "lower leg" },
    { id: "ANKLE", name: "ankles" },
    { id: "FOOT", name: "feet" },
    { id: "HORNS", name: "horns", needs: "horns" },
    { id: "WINGS", name: "wings", needs: "wings" },
    { id: "TAIL", name: "tail", needs: "tail" },
    { id: "PENIS", name: "penis", needs: "penis" },
    { id: "VAGINA", name: "vagina", needs: "vagina" },
  ];

  LT.TATTOO_TYPES = [
    { id: "NONE", name: "none", help: "No design — writing or a counter only." },
    { id: "hearts", name: "hearts", help: "A series of hearts and swirling lines." },
    { id: "flowers", name: "flowers", help: "A spray of flowers." },
    { id: "flowers_detailed", name: "detailed flowers", help: "A detailed floral design." },
    { id: "rose", name: "rose", help: "A single rose." },
    { id: "tribal", name: "tribal", help: "A tribal band." },
    { id: "lines", name: "lines", help: "A set of simple lines." },
    { id: "pentagram", name: "pentagram", help: "A pentagram." },
    { id: "spiral", name: "spiral knot", help: "A spiral Celtic knot." },
    { id: "trinity", name: "trinity knot", help: "A trinity Celtic knot." },
    { id: "spider", name: "spider", help: "A spider." },
    { id: "paw", name: "dog paw", help: "A dog's paw print." },
    { id: "paw_cat", name: "cat paw", help: "A cat's paw print." },
    { id: "hoof", name: "horse-shoe", help: "A horseshoe." },
    { id: "butterflies", name: "butterflies", help: "A pair of butterflies." },
    { id: "crossed_blades", name: "crossed blades", help: "A pair of crossed blades." },
    { id: "barcode", name: "barcode", help: "A barcode." },
  ];
})();
