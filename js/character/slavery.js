(function () {
  var IMAGE_MAX = 400;
  var WORK_SEX_CHANCE = 0.15;

  var EMPTY_ROOMS = {
    LILAYA_HOME_ROOM_WINDOW_GROUND_FLOOR: true,
    LILAYA_HOME_ROOM_GARDEN_GROUND_FLOOR: true,
    LILAYA_HOME_ROOM_WINDOW_FIRST_FLOOR: true,
    LILAYA_HOME_ROOM_GARDEN_FIRST_FLOOR: true,
  };

  LT.SLAVE_JOBS = {
    IDLE: {
      id: "IDLE",
      name: "Idle",
      nameM: "Idle",
      description: "Do not assign any job to this character.",
      income: 0,
      cap: -1,
      affection: 0,
      obedience: 0,
      stamina: 0,
      colour: "#4a4a4a",
      needs: null,
      interactSex: true,
      interactBond: true,
      place: null,
    },
    CLEANING: {
      id: "CLEANING",
      name: "maid",
      nameM: "manservant",
      description: "Assign this character to help Rose keep the house clean, deal with visitors, and perform all sorts of menial housework.",
      income: 80,
      cap: 20,
      affection: 0,
      obedience: 0.5,
      stamina: 2,
      obePay: 0.1,
      colour: "#8ec8f0",
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_CORRIDOR" },
    },
    SECURITY: {
      id: "SECURITY",
      name: "security guard",
      nameM: "security guard",
      description: "Assign this character to act as a security guard. A guard will always be posted at the entrance, with other guards patrolling the corridors.",
      income: 80,
      cap: 8,
      affection: 0,
      obedience: 0.5,
      stamina: 2,
      obePay: 0.1,
      colour: "#c0392b",
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_ENTRANCE_HALL" },
    },
    LIBRARY: {
      id: "LIBRARY",
      name: "librarian",
      nameM: "librarian",
      description: "Assign this character to work in Lilaya's library.",
      income: 80,
      cap: 5,
      affection: 0,
      obedience: 0.25,
      stamina: 1.5,
      obePay: 0.1,
      colour: "#1abc9c",
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LIBRARY" },
    },
    KITCHEN: {
      id: "KITCHEN",
      name: "cook",
      nameM: "cook",
      description: "Assign this character to work in Lilaya's kitchen as a cook.",
      income: 80,
      cap: 5,
      affection: 0,
      obedience: 0.25,
      stamina: 2,
      obePay: 0.05,
      colour: "#c4a574",
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_KITCHEN" },
    },
    GARDEN: {
      id: "GARDEN",
      name: "gardener",
      nameM: "gardener",
      description: "Assign this character to work as a gardener in Lilaya's courtyard garden.",
      income: 80,
      cap: 4,
      affection: 0,
      obedience: 0.25,
      stamina: 2,
      obePay: 0.05,
      colour: "#27ae60",
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_GARDEN" },
    },
    LAB_ASSISTANT: {
      id: "LAB_ASSISTANT",
      name: "lab assistant",
      nameM: "lab assistant",
      description: "Assign this character to help Lilaya in her lab.",
      income: 100,
      cap: 1,
      affection: 0,
      obedience: 0.25,
      stamina: 1.5,
      obePay: 0.2,
      colour: "#a8e063",
      dayOnly: true,
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" },
    },
    TEST_SUBJECT: {
      id: "TEST_SUBJECT",
      name: "test subject",
      nameM: "test subject",
      description: "Allow Lilaya to use this slave as a test subject for her experiments.",
      income: 150,
      cap: 5,
      affection: -0.5,
      obedience: 0.5,
      stamina: 3,
      colour: "#f1948a",
      dayOnly: true,
      noSex: true,
      place: { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_LAB" },
    },
    BEDROOM: {
      id: "BEDROOM",
      name: "bedroom slave",
      nameM: "bedroom slave",
      description: "Assign this slave to wait upon you in your bedroom.",
      income: 0,
      cap: 4,
      affection: 0,
      obedience: 0.25,
      stamina: 0,
      colour: "#9aa7d9",
      interactSex: true,
      interactBond: true,
      place: { world: "LILAYAS_HOUSE_FIRST_FLOOR", place: "LILAYA_HOME_ROOM_PLAYER" },
    },
    PUBLIC_STOCKS: {
      id: "PUBLIC_STOCKS",
      name: "public fucktoy",
      nameM: "public fucktoy",
      description: "Assign this slave to be locked in the public-use stocks in slaver alley.",
      income: 0,
      cap: 5,
      affection: -5,
      obedience: 1,
      stamina: 2,
      colour: "#f5b7b1",
      place: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_PUBLIC_STOCKS" },
    },
    PROSTITUTE: {
      id: "PROSTITUTE",
      name: "Prostitute",
      nameM: "Prostitute",
      description: "Assign this slave to work as a prostitute at the brothel 'Angel's Kiss'.",
      income: 200,
      cap: 10,
      affection: -0.25,
      obedience: 0.5,
      stamina: 2.5,
      obePay: 0.5,
      colour: "#ad1457",
      needsLicense: true,
      place: { world: "ANGELS_KISS_FIRST_FLOOR", place: "ANGELS_KISS_BEDROOM" },
    },
    MILKING: {
      id: "MILKING",
      name: "Dairy Cow",
      nameM: "Dairy Bull",
      description: "Assign this slave to the milking stalls, ready to have their milk, cum, and/or girlcum milked from them.",
      income: 0,
      cap: 8,
      affection: -0.25,
      obedience: 1,
      stamina: 2,
      colour: "#f7dc6f",
      needs: "MILKING_ROOM",
    },
    OFFICE: {
      id: "OFFICE",
      name: "office worker",
      nameM: "office worker",
      description: "Assign this character to work in the office which you've had outfitted here in Lilaya's house.",
      income: 100,
      cap: 4,
      affection: 0,
      obedience: 0,
      stamina: 2,
      obePay: 1,
      colour: "#c39bd3",
      interactSex: true,
      interactBond: true,
      needs: "OFFICE",
    },
    SPA: {
      id: "SPA",
      name: "Spa servant",
      nameM: "Spa servant",
      description: "Assign this slave to your private spa, ready to give you a massage or tend to any of your needs.",
      income: 0,
      cap: 8,
      affection: 0.5,
      obedience: -0.1,
      stamina: 1.5,
      colour: "#5dade2",
      interactSex: true,
      interactBond: true,
      needs: "SPA",
    },
    SPA_RECEPTIONIST: {
      id: "SPA_RECEPTIONIST",
      name: "Spa clerk",
      nameM: "Spa clerk",
      description: "Assign this slave to work on the reception desk of your private spa.",
      income: 0,
      cap: 2,
      affection: 0,
      obedience: 0.05,
      stamina: 2,
      colour: "#5d6d7e",
      interactSex: true,
      interactBond: true,
      needs: "SPA",
    },
    DINING_HALL: {
      id: "DINING_HALL",
      name: "waitress",
      nameM: "waiter",
      description: "Assign this character to serve food in a dining hall.",
      income: 50,
      cap: 6,
      affection: 0,
      obedience: 0.5,
      stamina: 2,
      obePay: 0.05,
      colour: "#e3b06f",
      interactSex: true,
      interactBond: true,
      needs: "DINING_HALL",
    },
  };

  function setting(id, name, description, colour) {
    return { id: id, name: name, description: description, colour: colour || "#ff6bda" };
  }

  LT.SLAVE_JOB_SETTINGS = {
    SECURITY: {
      mutual: [
        setting("SECURITY_ENTRANCE_PRIORITY", "Entrance Priority", "This slave will be chosen above others to be positioned at the entrance.", "#e3c66f"),
        setting("SECURITY_ANSWER_DOOR", "Answer Door", "If this slave is located at the entrance, they will answer the door instead of Rose.", "#8dbe57"),
      ],
    },
    TEST_SUBJECT: {
      mutual: [
        setting("TEST_SUBJECT_ALLOW_TRANSFORMATIONS_FEMALE", "Feminine TF", "Allow this slave to receive feminine transformations.", LT.Colour.FEMININE),
        setting("TEST_SUBJECT_ALLOW_TRANSFORMATIONS_MALE", "Masculine TF", "Allow this slave to receive masculine transformations.", LT.Colour.MASCULINE),
      ],
    },
    PUBLIC_STOCKS: {
      mutual: [
        setting("SEX_ORAL", "Allow Oral", "Allow this slave to perform oral on others."),
        setting("SEX_VAGINAL", "Allow Vaginal", "Allow this slave to receive vaginal sex."),
        setting("SEX_ANAL", "Allow Anal", "Allow this slave to receive anal sex."),
        setting("SEX_NIPPLES", "Allow Nipples", "Allow this slave to receive penetrative nipple sex."),
      ],
      defaults: ["SEX_ORAL", "SEX_VAGINAL", "SEX_ANAL"],
    },
    PROSTITUTE: {
      mutual: [
        setting("SEX_ORAL", "Allow Oral", "Allow this slave to perform oral on others."),
        setting("SEX_VAGINAL", "Allow Vaginal", "Allow this slave to receive vaginal sex."),
        setting("SEX_ANAL", "Allow Anal", "Allow this slave to receive anal sex."),
        setting("SEX_NIPPLES", "Allow Nipples", "Allow this slave to receive penetrative nipple sex."),
      ],
      defaults: ["SEX_ORAL", "SEX_VAGINAL", "SEX_ANAL"],
    },
    MILKING: {
      mutual: [
        setting("MILKING_MILK", "Collect Milk", "Allow this slave's milk to be collected.", "#f8e1b9"),
        setting("MILKING_MILK_CROTCH", "Collect Udder-milk", "Allow this slave's udders to be milked.", "#f8e1b9"),
        setting("MILKING_CUM", "Collect Cum", "Allow this slave's cum to be collected.", "#8ec8f0"),
        setting("MILKING_GIRLCUM", "Collect Girlcum", "Allow this slave's girlcum to be collected.", "#f5a8ff"),
        setting("MILKING_MILK_AUTO_SELL", "Auto-sell Milk", "Set this slave's milk to be automatically sold instead of stored.", "#e3c66f"),
        setting("MILKING_MILK_CROTCH_AUTO_SELL", "Auto-sell Udder-milk", "Set this slave's crotch-milk to be automatically sold instead of stored.", "#e3c66f"),
        setting("MILKING_CUM_AUTO_SELL", "Auto-sell Cum", "Set this slave's cum to be automatically sold instead of stored.", "#e3c66f"),
        setting("MILKING_GIRLCUM_AUTO_SELL", "Auto-sell Girlcum", "Set this slave's girlcum to be automatically sold instead of stored.", "#e3c66f"),
        setting("MILKING_TEAR_HYMEN", "Tear Hymen", "If this slave has an intact hymen, allow the 'pussy pump' to be inserted anyway.", "#ad1457"),
      ],
      defaults: ["MILKING_MILK", "MILKING_MILK_CROTCH", "MILKING_CUM", "MILKING_GIRLCUM"],
      exclusive: {
        "Room Preference": [
          setting("MILKING_NO_PREFERENCE", "No Preference", "Set this slave to work in any available milking room.", "#888"),
          setting("MILKING_INDUSTRIAL", "Industrial Milking", "Set this slave to work in a milking room with industrial milkers.", "#e36f6f"),
          setting("MILKING_REGULAR", "Regular Milking", "Set this slave to work in a milking room with regular milkers.", "#f8e1b9"),
          setting("MILKING_ARTISAN", "Artisan Milking", "Set this slave to work in a milking room with artisan milkers.", "#8dbe57"),
        ],
      },
      exclusiveDefaults: ["MILKING_NO_PREFERENCE"],
    },
    BEDROOM: {
      mutual: [
        setting("BEDROOM_GREETING", "Greeting", "Instruct this slave to greet you whenever you enter your room.", "#8dbe57"),
        setting("BEDROOM_CLEAN", "Cleaning", "Tell this slave to keep your room clean.", "#8ec8f0"),
        setting("BEDROOM_WAKE_UP", "Waking", "Allow this slave to serve as your alarm clock.", "#f8e1b9"),
        setting("BEDROOM_HELP_WASH", "Washing", "Have this slave assist you in the bathroom when you wash yourself.", "#6f9be3"),
      ],
      defaults: ["BEDROOM_GREETING", "BEDROOM_CLEAN"],
      exclusive: {
        Sleep: [
          setting("BEDROOM_SLEEP_FLOOR", "Sleep on Floor", "Tell this slave that they must sleep on the floor of your room.", "#e36f6f"),
          setting("BEDROOM_SLEEP_ON_BED", "Sleep on Bed", "Permit this slave to sleep on your bed, but not under the covers.", "#b98cff"),
          setting("BEDROOM_SLEEP_IN_BED", "Sleep in Bed", "Permit this slave to sleep in your bed beside you, under the covers.", "#ff6bda"),
        ],
      },
      exclusiveDefaults: ["BEDROOM_SLEEP_ON_BED"],
    },
    SPA: {
      mutual: [
        setting("SPA_BATHING", "Bathing", "Have this slave join you in the spa when you bathe.", "#5dade2"),
        setting("SPA_STRIP_TO_BATHE", "Bathe Naked", "Have this slave strip off all of their clothes when joining you to bathe.", "#d7b8e8"),
        setting("SPA_MASSAGE", "Massage", "Have this slave available for giving you a massage.", "#c4a574"),
        setting("SPA_SAUNA", "Sauna", "Have this slave join you when you use the sauna (once you've constructed that extension).", "#e39ab8"),
        setting("SPA_POOL", "Swimming", "Have this slave join you for a swim when you use the pool (once you've constructed that extension).", "#8ec8f0"),
      ],
      defaults: ["SPA_BATHING", "SPA_STRIP_TO_BATHE", "SPA_MASSAGE"],
    },
    SPA_RECEPTIONIST: {
      mutual: [setting("SPA_SHOWERING", "Showering", "Have this slave assist you in the changing room's showers when you wash yourself.", "#6f9be3")],
    },
  };

  LT.SLAVE_JOB_HOURS = {
    NONE: { id: "NONE", name: "None", description: "Do not assign any hours to this character.", start: 0, length: 0 },
    DAY_NORMAL: { id: "DAY_NORMAL", name: "Day shift", description: "Get this character to work eight hours over the course of the day.", start: 9, length: 8 },
    DAY_LONG: { id: "DAY_LONG", name: "Day shift +", description: "Get this character to work sixteen hours over the course of the day.", start: 6, length: 16 },
    NIGHT_NORMAL: { id: "NIGHT_NORMAL", name: "Night shift", description: "Get this character to work eight hours over the course of the night.", start: 20, length: 8 },
    NIGHT_LONG: { id: "NIGHT_LONG", name: "Night shift +", description: "Get this character to work sixteen hours over the course of the night.", start: 16, length: 16 },
    TWENTY_FOUR_HOURS: { id: "TWENTY_FOUR_HOURS", name: "24 hours", description: "Assign every hour as a work hour.", start: 0, length: 24 },
  };

  LT.SLAVE_BASE_STAMINA = 24;

  LT.SLAVE_PERMISSIONS = {
    BEHAVIOUR: {
      id: "BEHAVIOUR",
      name: "Behaviour",
      exclusive: true,
      settings: [
        { id: "BEHAVIOUR_SLUTTY", name: "Slutty", description: "Get this slave to act in a trashy, slutty manner when interacting with you." },
        { id: "BEHAVIOUR_SEDUCTIVE", name: "Seductive", description: "Get this slave to act in a refined, seductive manner when interacting with you." },
        { id: "BEHAVIOUR_STANDARD", name: "Standard", description: "Do not give this slave any instructions as to how they should act around you.", def: true },
        { id: "BEHAVIOUR_PROFESSIONAL", name: "Professional", description: "Get this slave to act in a professional manner when interacting with you." },
        { id: "BEHAVIOUR_WHOLESOME", name: "Wholesome", description: "Get this slave to act in a loving and wholesome manner around you." },
      ],
    },
    GENERAL: {
      id: "GENERAL",
      name: "General",
      exclusive: false,
      settings: [
        { id: "GENERAL_SILENCE", name: "Silence", description: "Forbid this slave from talking." },
        { id: "GENERAL_CRAWLING", name: "Crawling", description: "Forbid this slave from walking, forcing them to crawl around on all fours." },
        { id: "GENERAL_HOUSE_FREEDOM", name: "House Freedom", description: "Grant this slave the freedom to walk around Lilaya's house in their free time." },
        { id: "GENERAL_OUTSIDE_FREEDOM", name: "Outside Freedom", description: "Grant this slave the freedom to leave Lilaya's house in their free time." },
      ],
    },
    SEX: {
      id: "SEX",
      name: "Sex",
      exclusive: false,
      settings: [
        { id: "SEX_MASTURBATE", name: "Masturbation", description: "Allow this slave to masturbate." },
        { id: "SEX_INITIATE_SLAVES", name: "Initiate Sex", description: "Allow this slave to initiate sex with any other slave that has the 'Sex Toy' permission enabled." },
        { id: "SEX_INITIATE_PLAYER", name: "Use You", description: "Allow this slave to use you for sexual relief. This will allow them to initiate sex with you at any time." },
        { id: "SEX_RECEIVE_SLAVES", name: "Sex Toy", description: "Allow this slave to be used for sexual relief by any of your slaves with the 'Initiate Sex' permission enabled." },
        { id: "SEX_SAVE_VIRGINITY", name: "Save Virginity", description: "Do not let any other slaves take this slave's virginity during sex.", def: true },
        { id: "SEX_IMPREGNATED", name: "Breeding Bitch", description: "Allow this slave to be impregnated during sexual events with any other slave that has the 'Slave Stud' permission enabled." },
        { id: "SEX_IMPREGNATE", name: "Slave Stud", description: "Allow this slave to impregnate any other slave that has the 'Breeding Bitch' permission enabled during sexual events." },
      ],
    },
    PILLS: {
      id: "PILLS",
      name: "Pills",
      exclusive: true,
      settings: [
        { id: "PILLS_PROMISCUITY_PILLS", name: "Promiscuity Pills", description: "Keep this slave on Promiscuity Pills, greatly reducing both their fertility and virility." },
        { id: "PILLS_NO_PILLS", name: "No Pills", description: "Don't give this slave any sort of fertility modification pills, resulting in a natural chance of them getting pregnant.", def: true },
        { id: "PILLS_VIXENS_VIRILITY", name: "Vixen's Virility", description: "Keep this slave on Vixen's Virility pills, greatly increasing both their fertility and virility." },
        { id: "PILLS_BROODMOTHER", name: "Broodmother Pills", description: "Keep this slave on Broodmother pills, massively increasing both their fertility and virility and doubling how many offspring they conceive." },
      ],
    },
    PREGNANCY: {
      id: "PREGNANCY",
      name: "Pregnancy",
      exclusive: false,
      settings: [
        { id: "PREGNANCY_MOTHERS_MILK", name: "Mother's Milk", description: "Order this slave to regularly consume Mother's Milk while pregnant, which will result in them completing their pregnancy within a few hours of becoming visibly pregnant." },
        { id: "PREGNANCY_ALLOW_BIRTHING", name: "Allow Birthing", description: "Allow this slave to go to Lilaya's birthing room to give birth whenever they need to.", def: true },
        { id: "PREGNANCY_ALLOW_EGG_LAYING", name: "Allow Egg Laying", description: "Allow this slave to go to Lilaya's birthing room to lay any eggs which have been implanted in them whenever they need to.", def: true },
      ],
    },
    DIET: {
      id: "DIET",
      name: "Diet",
      exclusive: true,
      settings: [
        { id: "FOOD_DIET_EXTREME", name: "Skinny", description: "Severely limit the amount of food available to this slave, eventually making them skinny." },
        { id: "FOOD_DIET", name: "Slender", description: "Restrict the amount of food available to this slave, eventually making them slender." },
        { id: "FOOD_NORMAL", name: "Average", description: "Give this slave a healthy amount of food, eventually making them average.", def: true },
        { id: "FOOD_PLUS", name: "Large", description: "Give this slave an extra meal every day, eventually making them large." },
        { id: "FOOD_LAVISH", name: "Huge", description: "Make an abundance of food available to this slave, eventually making them huge." },
      ],
    },
    EXERCISE: {
      id: "EXERCISE",
      name: "Exercise",
      exclusive: true,
      settings: [
        { id: "EXERCISE_FORBIDDEN", name: "Soft", description: "Forbid this slave from performing any strenuous activities, eventually making them soft." },
        { id: "EXERCISE_REST", name: "Lightly muscled", description: "Do not give this slave any exercise routine, eventually making them lightly muscled." },
        { id: "EXERCISE_NORMAL", name: "Toned", description: "Set this slave to perform a healthy amount of exercise, eventually making them toned.", def: true },
        { id: "EXERCISE_TRAINING", name: "Muscular", description: "Give this slave a workout routine, eventually making them muscular." },
        { id: "EXERCISE_BODY_BUILDING", name: "Ripped", description: "Give this slave a strenuous exercise routine, eventually making them ripped." },
      ],
    },
    CLEANLINESS: {
      id: "CLEANLINESS",
      name: "Cleanliness",
      exclusive: false,
      settings: [
        { id: "CLEANLINESS_WASH_CLOTHES", name: "Wash Clothing", description: "Tell this slave to keep their clothing washed and clean.", def: true },
        { id: "CLEANLINESS_WASH_BODY", name: "Wash Body", description: "Tell this slave to keep their body washed and clean, which will keep their orifices free of creampies.", def: true },
      ],
    },
    SLEEPING: {
      id: "SLEEPING",
      name: "Sleeping",
      exclusive: true,
      settings: [
        { id: "SLEEPING_DEFAULT", name: "Sleep Whenever", description: "Tell this slave to sleep whenever they like, which will be during the night for diurnal races and during the day for nocturnal races.", def: true },
        { id: "SLEEPING_NIGHT", name: "Sleep At Night", description: "Tell this slave to sleep during the night. This will have neither a positive nor negative effect on them." },
        { id: "SLEEPING_DAY", name: "Sleep During Day", description: "Tell this slave to sleep during the day. This will have neither a positive nor negative effect on them." },
      ],
    },
  };

  LT.HOUSE_UPGRADES = {
    SLAVE_ROOM: {
      id: "SLAVE_ROOM",
      name: "Slave's Room",
      cost: 2000,
      cap: 1,
      home: true,
      colour: "#c0392b",
      convert: true,
      description:
        "You've paid to have this room converted into basic slave's quarters. A single-size bed, covered in a plain white duvet, sits against one wall. Beside it, there's a simple bedside cabinet, complete with arcane-powered lamp. Other than that, the only other pieces of furniture in here are a wooden wardrobe and chest of drawers.",
    },
    SLAVE_ROOM_DOUBLE: {
      id: "SLAVE_ROOM_DOUBLE",
      name: "Double Slave Room",
      cost: 3500,
      cap: 2,
      home: true,
      colour: "#c0392b",
      convert: true,
      from: ["SLAVE_ROOM"],
      aff: -0.05,
      obe: -0.05,
      description:
        "You've paid to have this room converted so that it's suitable for housing two of your slaves. A pair of single-size beds, covered in a plain white duvets, sit against opposite walls. Beside each one, there's a simple bedside cabinet, complete with arcane-powered lamp. Other than that, the only other pieces of furniture in here are a single wooden wardrobe and solitary chest of drawers.",
    },
    SLAVE_ROOM_QUADRUPLE: {
      id: "SLAVE_ROOM_QUADRUPLE",
      name: "Quadruple Slave Room",
      cost: 6000,
      cap: 4,
      home: true,
      colour: "#c0392b",
      convert: true,
      from: ["SLAVE_ROOM", "SLAVE_ROOM_DOUBLE"],
      aff: -0.1,
      obe: -0.2,
      description:
        "You've paid to have this room converted so that it's suitable for housing four of your slaves. Four single-size beds, covered in a plain white duvets, sit against the walls. Beside each one, there's a simple bedside cabinet, complete with arcane-powered lamp. Other than that, the only other pieces of furniture in here are a pair of wooden wardrobes and two chests of drawers.",
    },
    SLAVE_LOUNGE: {
      id: "SLAVE_LOUNGE",
      name: "Slave lounge",
      cost: 5000,
      cap: 0,
      home: false,
      colour: "#8dbe57",
      convert: true,
      description:
        "This room has been converted into a lounge for your slaves. When not sleeping or at work, and provided that they have the 'House Freedom' permission, they might choose to come here to relax for an hour or so.",
    },
    DUNGEON_CELL: {
      id: "DUNGEON_CELL",
      name: "Dungeon cell",
      cost: 0,
      cap: 1,
      home: true,
      colour: "#777",
      convert: false,
      description: "The cells within Lilaya's dungeon are designed to be cramped and uncomfortable.",
    },
    GUEST_ROOM: {
      id: "GUEST_ROOM",
      name: "Guest Room",
      cost: 2000,
      cap: 1,
      home: true,
      convert: true,
      colour: "#7dcea0",
      description:
        "You've paid to have this room converted into a basic guest room. A single-size bed, covered in a plain white duvet, sits against one wall. Beside it, there's a simple bedside cabinet, complete with arcane-powered lamp. Other than that, the only other pieces of furniture in here are a wooden wardrobe and chest of drawers.",
    },
    OFFICE: {
      id: "OFFICE",
      name: "Office",
      cost: 8000,
      cap: 0,
      unique: true,
      convert: true,
      colour: "#af7ac5",
      description:
        "In order to help Lilaya with her copious amounts of paperwork related to exotic material acquisition, you've had this room converted into a four-person-capacity office. Along with the forms related to Lilaya's heavily-regulated purchases, the workers assigned here are tasked with keeping records in a general 'Occupancy ledger', which you can access here at any time.",
    },
    MILKING_ROOM: {
      id: "MILKING_ROOM",
      name: "Milking Room",
      cost: 10000,
      cap: 8,
      convert: true,
      colour: "#f5b041",
      description:
        "This room has been converted into a special milking room, in which eight of your slaves can be milked of their various fluids. Four machines are set along the left-hand side of the wall, with the other four being placed on the opposite side of the room.",
    },
    SPA: {
      id: "SPA",
      name: "Spa",
      cost: 1500000,
      cap: 0,
      unique: true,
      permanent: true,
      convert: true,
      extras: {
        SPA_SAUNA: {
          id: "SPA_SAUNA",
          name: "Sauna (extension)",
          cost: 150000,
          description: "A sauna and steam room have been added to the spa.",
        },
        SPA_POOL: {
          id: "SPA_POOL",
          name: "Swimming pool (extension)",
          cost: 300000,
          description: "An indoor swimming pool has been added to the spa.",
        },
      },
      colour: "#48c9b0",
      description:
        "This room has been completely renovated and transformed into a luxurious, private spa, complete with private showers and changing rooms. In the middle of the marble floor, there are a series of large pools, each of which is filled with warm water drawn from geothermal springs.",
    },
    ARTHUR_ROOM: {
      id: "ARTHUR_ROOM",
      name: "Arthur's Room",
      cost: 0,
      cap: 0,
      unique: true,
      permanent: true,
      convert: true,
      placeType: "LILAYA_HOME_ARTHUR_ROOM",
      colour: "#6b8ea8",
      description: "This room now belongs to Arthur, who uses it as his personal lab-cum-bedroom.",
    },
  };

  var JOB_SEX = {
    CLEANING: "[npc.Name] is halfway through changing the linens when [npc.she] sees you. Flushing, [npc.she] sets the sheets aside and waits to see what you want.",
    SECURITY: "[npc.Name] is posted at [npc.her] station. After a glance to make sure the hall is empty, [npc.she] lowers [npc.her] eyes and waits.",
    LIBRARY: "Between the stacks, [npc.name] looks up from a returned book. [npc.She] keeps [npc.her] voice to a whisper as [npc.she] asks if you needed [npc.herHim].",
    KITCHEN: "The kitchen is hot. [npc.Name] sets down a ladle, wipes [npc.her] hands, and leans back against the prep table.",
    GARDEN: "[npc.Name] is kneeling by the rose bushes. When [npc.she] realises you are alone, [npc.she] stays where [npc.she] is.",
    LAB_ASSISTANT: "Lilaya is absorbed in a reading on the far bench. [npc.Name] glances that way, then back at you, cheeks coloured.",
    BEDROOM: "[npc.Name] is waiting in your room, just as you ordered. [npc.She] looks up from the foot of the bed.",
    PUBLIC_STOCKS: "[npc.Name] is locked in the public stocks, unable to do more than watch you approach.",
    PROSTITUTE: "The bedroom door is closed on a finished booking. [npc.Name] is still on the sheets, catching [npc.her] breath.",
    MILKING: "[npc.Name] is locked into a milking stall. The pumps are quiet for the moment.",
    OFFICE: "[npc.Name] is alone with the occupancy ledger. [npc.She] closes the book when you shut the office door.",
    SPA: "[npc.Name] has a massage table ready. [npc.She] oils [npc.her] hands and waits to see whether you actually wanted a massage.",
    SPA_RECEPTIONIST: "The spa desk is empty of guests. [npc.Name] sets the appointment book aside.",
    DINING_HALL: "[npc.Name] is laying out silverware on the long dining table. [npc.She] looks up as you enter.",
    IDLE: "You catch [npc.name] idle in [npc.her] room. [npc.She] stands as you enter.",
  };

  function flags() {
    LT.game.flags = LT.game.flags || {};
    return LT.game.flags;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  LT.pendingSlaves = function () {
    if (!flags().pendingSlaves) flags().pendingSlaves = [];
    return flags().pendingSlaves;
  };

  LT.ownedSlaves = function () {
    if (!flags().ownedSlaves) flags().ownedSlaves = [];
    return flags().ownedSlaves;
  };

  LT.houseRooms = function () {
    if (!flags().houseRooms) flags().houseRooms = {};
    return flags().houseRooms;
  };

  LT.charImages = function () {
    if (!flags().charImages) flags().charImages = {};
    return flags().charImages;
  };

  LT.canManageHouse = function () {
    var f = flags();
    return !!(f.hasSlaverLicense || f.slaveryQuest === "SIDE_SLAVER_RECOMMENDATION_OBTAINED" || f.slaveryQuest === "complete");
  };

  LT.isEmptyHouseRoom = function (placeType) {
    return !!EMPTY_ROOMS[placeType];
  };

  LT.currentRoomKey = function () {
    var loc = (LT.game.player && LT.game.player.location) || {};
    var world = loc.world || (window.grid && grid.gridName) || "";
    var x = loc.x != null ? loc.x : window.grid && grid.playerPosition ? grid.playerPosition.x : null;
    var y = loc.y != null ? loc.y : window.grid && grid.playerPosition ? grid.playerPosition.y : null;
    if (world == null || x == null || y == null) return "";
    return world + ":" + x + "," + y;
  };

  LT.parseRoomKey = function (key) {
    var parts = String(key || "").split(":");
    if (parts.length < 2) return null;
    var xy = parts[1].split(",");
    return { world: parts[0], x: parseInt(xy[0], 10), y: parseInt(xy[1], 10) };
  };

  LT.roomUpgradeAt = function (key) {
    var rec = LT.houseRooms()[key || LT.currentRoomKey()];
    if (!rec) return null;
    return LT.HOUSE_UPGRADES[rec.u || rec] || null;
  };

  LT.findUpgradeKey = function (upgradeId) {
    var rooms = LT.houseRooms();
    var keys = Object.keys(rooms);
    var i;
    for (i = 0; i < keys.length; i++) {
      var rec = rooms[keys[i]];
      if ((rec && rec.u) === upgradeId || rec === upgradeId) return keys[i];
    }
    return null;
  };

  LT.countUpgrade = function (upgradeId) {
    var rooms = LT.houseRooms();
    var n = 0;
    Object.keys(rooms).forEach(function (k) {
      var rec = rooms[k];
      if ((rec && rec.u) === upgradeId || rec === upgradeId) n += 1;
    });
    return n;
  };

  LT.applyRoomUpgradeVisual = function (key, upgrade) {
    var parsed = LT.parseRoomKey(key);
    if (!parsed || !window.allGrids || !allGrids[parsed.world]) return;
    var cells = allGrids[parsed.world];
    var i;
    for (i = 0; i < cells.length; i++) {
      if (cells[i].x === parsed.x && cells[i].y === parsed.y && cells[i].location) {
        cells[i].location.name = upgrade ? upgrade.name : "Room";
        if (upgrade) cells[i].location.color = upgrade.colour;
        if (upgrade && upgrade.placeType) {
          cells[i].location.placeType = upgrade.placeType;
          cells[i].location.passage = "place." + upgrade.placeType;
        }
        if (typeof renderGrid === "function") renderGrid();
        return;
      }
    }
  };

  LT.refreshAllRoomVisuals = function () {
    var rooms = LT.houseRooms();
    Object.keys(rooms).forEach(function (key) {
      var up = LT.roomUpgradeAt(key);
      if (up) LT.applyRoomUpgradeVisual(key, up);
    });
  };

  LT.canUpgradeRoom = function (fromId, toId) {
    var to = LT.HOUSE_UPGRADES[toId];
    if (!to || !to.from) return false;
    return to.from.indexOf(fromId) >= 0;
  };

  LT.convertRoom = function (upgradeId) {
    var up = LT.HOUSE_UPGRADES[upgradeId];
    var key = LT.currentRoomKey();
    if (!up || !key) return "There is no room here to convert.";
    var existing = LT.roomUpgradeAt(key);
    if (existing) {
      if (existing.id === up.id) return "This room has already been converted.";
      if (!LT.canUpgradeRoom(existing.id, up.id)) return "This room has already been converted.";
    }
    if (up.unique && LT.countUpgrade(up.id)) return "There is already a " + up.name.toLowerCase() + " in the house.";
    if (LT.getMoney() < up.cost) return "You need " + up.cost + " flames to convert this room.";
    LT.incrementMoney(-up.cost);
    var extras = (LT.houseRooms()[key] && LT.houseRooms()[key].x) || {};
    LT.houseRooms()[key] = { u: up.id, x: extras };
    LT.applyRoomUpgradeVisual(key, up);
    return "<p>Rose has the room converted into a <b>" + up.name + "</b> for " + up.cost + " flames.</p>";
  };

  LT.roomHasExtra = function (key, extraId) {
    var rec = LT.houseRooms()[key || LT.currentRoomKey()];
    return !!(rec && rec.x && rec.x[extraId]);
  };

  LT.addRoomExtra = function (extraId) {
    var key = LT.currentRoomKey();
    var up = LT.roomUpgradeAt(key);
    if (!up || !up.extras || !up.extras[extraId]) return "That extension cannot be built here.";
    if (LT.roomHasExtra(key, extraId)) return "That extension is already finished.";
    var extra = up.extras[extraId];
    if (extra.exclusive && LT.roomHasExtra(key, extra.exclusive)) {
      return "The '" + (up.extras[extra.exclusive] && up.extras[extra.exclusive].name) + "' upgrade must be removed first.";
    }
    if (LT.getMoney() < extra.cost) return "You need " + extra.cost + " flames for the " + extra.name.toLowerCase() + ".";
    LT.incrementMoney(-extra.cost);
    var rec = LT.houseRooms()[key] || { u: up.id };
    rec.x = rec.x || {};
    rec.x[extraId] = true;
    LT.houseRooms()[key] = rec;
    return "<p>Rose has the <b>" + extra.name + "</b> built for " + extra.cost + " flames.</p>";
  };

  LT.removeRoomExtra = function (extraId) {
    var key = LT.currentRoomKey();
    var rec = LT.houseRooms()[key];
    if (!rec || !rec.x || !rec.x[extraId]) return "That upgrade is not installed.";
    var up = LT.roomUpgradeAt(key);
    var extra = up && up.extras && up.extras[extraId];
    delete rec.x[extraId];
    return "<p>The <b>" + ((extra && extra.name) || extraId) + "</b> has been removed.</p>";
  };

  LT.ensureDungeonCell = function (key) {
    key = key || LT.currentRoomKey();
    var loc = (LT.game.player && LT.game.player.location) || {};
    if ((loc.place || "") !== "LILAYA_HOME_DUNGEON_CELL") return null;
    if (!LT.houseRooms()[key]) LT.houseRooms()[key] = { u: "DUNGEON_CELL" };
    return LT.roomUpgradeAt(key);
  };

  LT.availableConvertIds = function () {
    var existing = LT.roomUpgradeAt();
    var quest = LT.game.flags && LT.game.flags.quest;
    var ids = [];
    Object.keys(LT.HOUSE_UPGRADES).forEach(function (id) {
      var up = LT.HOUSE_UPGRADES[id];
      if (!up.convert) return;
      if (id === "ARTHUR_ROOM") {
        if (quest !== "MAIN_1_I_ARTHURS_TALE" && quest !== "MAIN_1_J_ARTHURS_ROOM") return;
        if (LT.countUpgrade("ARTHUR_ROOM")) return;
      }
      if (!existing) ids.push(id);
      else if (LT.canUpgradeRoom(existing.id, id)) ids.push(id);
    });
    return ids;
  };

  LT.installArthurRoom = function () {
    var world = "LILAYAS_HOUSE_GROUND_FLOOR";
    var cells = window.allGrids && window.allGrids[world];
    if (!cells) return null;
    var lab = null;
    var i;
    for (i = 0; i < cells.length; i++) {
      if (cells[i].location && cells[i].location.placeType === "LILAYA_HOME_LAB") lab = cells[i];
    }
    var x = lab ? lab.x + 1 : 3;
    var y = lab ? lab.y : 9;
    var cell = null;
    for (i = 0; i < cells.length; i++) {
      if (cells[i].x === x && cells[i].y === y) {
        cell = cells[i];
        break;
      }
    }
    var desc =
      "Converted from a store room houses Lilaya's one-time lover and colleague, Arthur.";
    if (!cell) {
      cell = {
        x: x,
        y: y,
        location: {
          name: "Arthur's Room",
          color: "#6b8ea8",
          placeType: "LILAYA_HOME_ARTHUR_ROOM",
          passage: "place.LILAYA_HOME_ARTHUR_ROOM",
          description: desc,
        },
      };
      cells.push(cell);
    } else {
      cell.location = cell.location || {};
      cell.location.name = "Arthur's Room";
      cell.location.color = "#6b8ea8";
      cell.location.placeType = "LILAYA_HOME_ARTHUR_ROOM";
      cell.location.passage = "place.LILAYA_HOME_ARTHUR_ROOM";
      cell.location.description = desc;
    }
    var key = world + ":" + x + "," + y;
    LT.houseRooms()[key] = { u: "ARTHUR_ROOM", x: {} };
    var a = typeof LT.ensureArthur === "function" ? LT.ensureArthur() : null;
    if (a) a.location = { world: world, place: "LILAYA_HOME_ARTHUR_ROOM", x: x, y: y };
    if (LT.game.player) LT.game.player.location = { world: world, place: "LILAYA_HOME_ARTHUR_ROOM", x: x, y: y };
    if (typeof LT.enterWorld === "function") LT.enterWorld(world, "LILAYA_HOME_ARTHUR_ROOM", { x: x, y: y });
    return cell;
  };

  function nextSlaveId() {
    return "slave_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  }

  function emptyHours() {
    var hours = [];
    var i;
    for (i = 0; i < 24; i++) hours.push("IDLE");
    return hours;
  }

  function defaultPermFlags() {
    return {
      BEHAVIOUR_STANDARD: true,
      SEX_SAVE_VIRGINITY: true,
      PILLS_NO_PILLS: true,
      PREGNANCY_ALLOW_BIRTHING: true,
      PREGNANCY_ALLOW_EGG_LAYING: true,
      FOOD_NORMAL: true,
      EXERCISE_NORMAL: true,
      CLEANLINESS_WASH_CLOTHES: true,
      CLEANLINESS_WASH_BODY: true,
      SLEEPING_DEFAULT: true,
    };
  }

  function extra(id, name, cost, description, opts) {
    opts = opts || {};
    return {
      id: id,
      name: name,
      cost: cost,
      description: description,
      exclusive: opts.exclusive || null,
      aff: opts.aff || 0,
      obe: opts.obe || 0,
    };
  }

  var SLAVE_ROOM_EXTRAS = {
    BED_UPGRADE: extra("BED_UPGRADE", "Double Size Bed", 500, "A double size bed, complete with a comfortable mattress, fluffy pillows, and a warm duvet.", { exclusive: "BED_DOWNGRADE", aff: 0.2, obe: -0.1 }),
    BED_DOWNGRADE: extra("BED_DOWNGRADE", "Small Steel Bed", 250, "A small steel-framed bed with an uncomfortable mattress, a hard pillow, and a thin blanket.", { exclusive: "BED_UPGRADE", aff: -0.1, obe: 0.2 }),
    DOG_BOWLS: extra("DOG_BOWLS", "Dog Bowls", 100, "Metal dog bowls on the floor. Meals are served from these.", { exclusive: "ROOM_SERVICE", aff: -0.2, obe: 0.25 }),
    ROOM_SERVICE: extra("ROOM_SERVICE", "Room Service", 500, "Unlimited room service for this room's occupant.", { exclusive: "DOG_BOWLS", aff: 0.4, obe: -0.2 }),
    OBEDIENCE_TRAINER: extra("OBEDIENCE_TRAINER", "Obedience Trainer", 10000, "A glowing crystal that shocks disobedient thoughts.", { aff: -0.2, obe: 0.4 }),
    ARCANE_INSTRUMENTS: extra("ARCANE_INSTRUMENTS", "Arcane Instruments", 500, "Arcane sensors gather data on the occupant's aura.", { aff: -0.1, obe: 0 }),
  };

  var DUNGEON_EXTRAS = {
    CELL_BED_UP: extra("CELL_BED_UP", "Improved Bedding", 250, "More comfortable mattresses, pillows, and blankets.", { exclusive: "CELL_BED_DOWN", aff: 0.05, obe: -0.05 }),
    CELL_BED_DOWN: extra("CELL_BED_DOWN", "Straw Bedding", 100, "The beds have been replaced with piles of straw.", { exclusive: "CELL_BED_UP", aff: -0.1, obe: 0.2 }),
    CELL_DOG_BOWLS: extra("CELL_DOG_BOWLS", "Dog Bowls", 100, "Meals are served in dog bowls on the floor.", { exclusive: "CELL_FOOD", aff: -0.2, obe: 0.25 }),
    CELL_FOOD: extra("CELL_FOOD", "Decent Food", 250, "Cold bland meals have been replaced with decent hot food.", { exclusive: "CELL_DOG_BOWLS", aff: 0.1, obe: -0.1 }),
    CELL_ROPES: extra("CELL_ROPES", "Rope Restraints", 250, "Sturdy ropes bind the occupying slaves in place.", { exclusive: "CELL_CHAINS", aff: -0.2, obe: 0.15 }),
    CELL_CHAINS: extra("CELL_CHAINS", "Chain Restraints", 500, "Metal chains bind the occupying slaves in place.", { exclusive: "CELL_ROPES", aff: -0.25, obe: 0.3 }),
  };

  var MILKING_EXTRAS = {
    ARTISAN_MILKERS: extra("ARTISAN_MILKERS", "Artisan Milkers", 2500, "Comfortable artisan machines. Milk 2000 / cum 200 / girlcum 40 per hour.", { exclusive: "INDUSTRIAL_MILKERS", aff: 1, obe: 0.5 }),
    INDUSTRIAL_MILKERS: extra("INDUSTRIAL_MILKERS", "Industrial Milkers", 1500, "Industrial machines maximise output. Milk 5000 / cum 500 / girlcum 100 per hour.", { exclusive: "ARTISAN_MILKERS", aff: -1, obe: 0.5 }),
    MILK_EFFICIENCY: extra("MILK_EFFICIENCY", "Lact-o-Cups", 500, "Doubles the machines' maximum hourly milking efficiency."),
    CUM_EFFICIENCY: extra("CUM_EFFICIENCY", "Succ-u-Buses", 500, "Doubles the machines' maximum hourly cum-milking efficiency."),
    GIRLCUM_EFFICIENCY: extra("GIRLCUM_EFFICIENCY", "Vibro-Pumps", 500, "Doubles the machines' maximum hourly girlcum-milking efficiency."),
  };

  LT.HOUSE_UPGRADES.SLAVE_ROOM.extras = SLAVE_ROOM_EXTRAS;
  LT.HOUSE_UPGRADES.SLAVE_ROOM_DOUBLE.extras = SLAVE_ROOM_EXTRAS;
  LT.HOUSE_UPGRADES.SLAVE_ROOM_QUADRUPLE.extras = SLAVE_ROOM_EXTRAS;
  LT.HOUSE_UPGRADES.DUNGEON_CELL.extras = DUNGEON_EXTRAS;
  LT.HOUSE_UPGRADES.DUNGEON_CELL.cap = 4;
  LT.HOUSE_UPGRADES.MILKING_ROOM.extras = MILKING_EXTRAS;
  LT.HOUSE_UPGRADES.DINING_HALL = {
    id: "DINING_HALL",
    name: "Dining Hall",
    cost: 6000,
    cap: 0,
    home: false,
    convert: true,
    colour: "#e3b06f",
    description:
      "This room has been converted into a dining hall, complete with a long, wooden table and a dozen chairs. Although Lilaya and Rose are likely going to continue with their habit of eating in the lab, there's nothing stopping you from making use of this room.",
  };

  LT.normalizeSlave = function (rec) {
    if (!rec) return rec;
    if (!rec.id || rec.id === "slave" || rec.id === "alleyMugger") rec.id = nextSlaveId();
    rec.job = rec.job || "IDLE";
    rec.aff = rec.aff == null ? 0 : rec.aff;
    rec.obe = rec.obe == null ? 0 : rec.obe;
    rec.home = rec.home || "";
    rec.earned = rec.earned || 0;
    rec.collared = rec.collared !== false;
    rec.perms = rec.perms || {};
    rec.jobSettings = rec.jobSettings || {};
    rec.pentUp = rec.pentUp || 0;
    rec.affToward = rec.affToward || {};
    if (rec.hasVagina == null) rec.hasVagina = rec.feminine !== false;
    if (rec.hasPenis == null) rec.hasPenis = rec.feminine === false;
    rec.milkStorage = rec.milkStorage || 0;
    if (!rec.perms.PILLS_NO_PILLS && !rec.perms.PILLS_PROMISCUITY_PILLS && !rec.perms.PILLS_VIXENS_VIRILITY && !rec.perms.PILLS_BROODMOTHER) rec.perms.PILLS_NO_PILLS = true;
    if (!rec.perms.FOOD_DIET_EXTREME && !rec.perms.FOOD_DIET && !rec.perms.FOOD_NORMAL && !rec.perms.FOOD_PLUS && !rec.perms.FOOD_LAVISH) rec.perms.FOOD_NORMAL = true;
    if (!rec.perms.EXERCISE_FORBIDDEN && !rec.perms.EXERCISE_REST && !rec.perms.EXERCISE_NORMAL && !rec.perms.EXERCISE_TRAINING && !rec.perms.EXERCISE_BODY_BUILDING) rec.perms.EXERCISE_NORMAL = true;
    if (!rec.perms.SLEEPING_DEFAULT && !rec.perms.SLEEPING_NIGHT && !rec.perms.SLEEPING_DAY) rec.perms.SLEEPING_DEFAULT = true;
    if (rec.perms.PREGNANCY_ALLOW_BIRTHING == null) rec.perms.PREGNANCY_ALLOW_BIRTHING = true;
    if (rec.perms.PREGNANCY_ALLOW_EGG_LAYING == null) rec.perms.PREGNANCY_ALLOW_EGG_LAYING = true;
    if (rec.perms.CLEANLINESS_WASH_CLOTHES == null) rec.perms.CLEANLINESS_WASH_CLOTHES = true;
    if (rec.perms.CLEANLINESS_WASH_BODY == null) rec.perms.CLEANLINESS_WASH_BODY = true;
    Object.keys(LT.SLAVE_JOB_SETTINGS).forEach(function (jobId) {
      var spec = LT.SLAVE_JOB_SETTINGS[jobId];
      rec.jobSettings[jobId] = rec.jobSettings[jobId] || {};
      var map = rec.jobSettings[jobId];
      if (!Object.keys(map).length) {
        (spec.defaults || []).forEach(function (id) {
          map[id] = true;
        });
        (spec.exclusiveDefaults || []).forEach(function (id) {
          map[id] = true;
        });
      }
    });
    if (rec.perms.beh || rec.perms.sexP != null || rec.perms.house != null) {
      if (rec.perms.beh) rec.perms["BEHAVIOUR_" + rec.perms.beh] = true;
      if (rec.perms.sexP !== false) rec.perms.SEX_INITIATE_PLAYER = true;
      if (rec.perms.house) rec.perms.GENERAL_HOUSE_FREEDOM = true;
      delete rec.perms.beh;
      delete rec.perms.sexP;
      delete rec.perms.house;
    }
    if (!rec.perms.BEHAVIOUR_SLUTTY && !rec.perms.BEHAVIOUR_SEDUCTIVE && !rec.perms.BEHAVIOUR_STANDARD && !rec.perms.BEHAVIOUR_PROFESSIONAL && !rec.perms.BEHAVIOUR_WHOLESOME) {
      rec.perms.BEHAVIOUR_STANDARD = true;
    }
    if (!rec.hours || rec.hours.length !== 24) {
      rec.hours = emptyHours();
      if (rec.job && rec.job !== "IDLE") {
        var h;
        for (h = 6; h < 22; h++) rec.hours[h] = rec.job;
      }
    }
    return rec;
  };

  LT.snapshotSlave = function (npc) {
    var rec = {
      id: nextSlaveId(),
      name: (npc && (npc.name || (npc.getName && npc.getName()))) || "Unknown",
      feminine: !!(npc && (npc.feminine || (npc.isFeminine && npc.isFeminine()))),
      raceName: (npc && npc.raceName) || "human",
      fullRace: (npc && (npc.fullRace || (npc.getRaceName && npc.getRaceName()))) || "human",
      collared: true,
      job: "IDLE",
      hours: emptyHours(),
      aff: 0,
      obe: 0,
      perms: defaultPermFlags(),
      jobSettings: {},
      pentUp: 0,
      affToward: {},
      home: "",
      earned: 0,
      hasVagina: !!(npc && npc.hasVagina ? npc.hasVagina() : npc && npc.feminine),
      hasPenis: !!(npc && npc.hasPenis ? npc.hasPenis() : npc && !npc.feminine),
      milkStorage: 0,
    };
    if (npc && npc.gender) {
      rec.hasVagina = !!npc.gender.hasVagina;
      rec.hasPenis = !!npc.gender.hasPenis;
    }
    if (npc && npc.id && npc.id !== "alleyMugger" && npc.id !== "npc") rec.src = String(npc.id).slice(0, 24);
    return rec;
  };

  LT.enslaveNpc = function (npc) {
    var rec = LT.snapshotSlave(npc);
    rec.waiting = true;
    LT.pendingSlaves().push(rec);
    return rec;
  };

  LT.collectPendingSlave = function (index) {
    var wait = LT.pendingSlaves();
    if (index < 0 || index >= wait.length) return null;
    var rec = LT.normalizeSlave(wait.splice(index, 1)[0]);
    rec.waiting = false;
    LT.ownedSlaves().push(rec);
    LT.syncSlaveNpcs();
    return rec;
  };

  LT.takeOwnership = function (npc) {
    if (!npc) return null;
    var owned = LT.ownedSlaves();
    var i;
    for (i = 0; i < owned.length; i++) {
      if (owned[i].src === npc.id || owned[i].id === npc.id) return owned[i];
    }
    var rec = LT.snapshotSlave(npc);
    rec.src = npc.id;
    rec.id = npc.id;
    rec.waiting = false;
    owned.push(rec);
    LT.syncSlaveNpcs();
    return rec;
  };

  LT.findSlave = function (id) {
    var owned = LT.ownedSlaves();
    var i;
    for (i = 0; i < owned.length; i++) if (owned[i].id === id) return LT.normalizeSlave(owned[i]);
    return null;
  };

  LT.slaveJobName = function (rec, hour) {
    var id = hour == null ? LT.getSlaveJob(rec) : LT.getSlaveJob(rec, hour);
    var job = LT.SLAVE_JOBS[id] || LT.SLAVE_JOBS.IDLE;
    return rec && rec.feminine === false ? job.nameM : job.name;
  };

  LT.getSlaveJob = function (rec, hour) {
    if (!rec) return "IDLE";
    LT.normalizeSlave(rec);
    if (hour == null) hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    hour = ((hour % 24) + 24) % 24;
    return rec.hours[hour] || "IDLE";
  };

  LT.isSlaveAtWork = function (rec, hour) {
    return LT.getSlaveJob(rec, hour) !== "IDLE";
  };

  LT.countWorkingJob = function (hour, jobId, skipId) {
    var n = 0;
    LT.ownedSlaves().forEach(function (s) {
      if (skipId && s.id === skipId) return;
      if (LT.getSlaveJob(s, hour) === jobId) n += 1;
    });
    return n;
  };

  LT.jobHourAvailable = function (jobId, rec, hour) {
    var job = LT.SLAVE_JOBS[jobId];
    if (!job) return { ok: false, reason: "Unknown job." };
    if (jobId === "IDLE") return { ok: true };
    if (job.needsLicense && !(flags().hasProstitutionLicense)) {
      return { ok: false, reason: "You do not have permission from Angel to send your slaves to work in her brothel!" };
    }
    if (job.needs && !LT.findUpgradeKey(job.needs)) {
      if (job.needs === "SPA") return { ok: false, reason: "The spa upgrade must be constructed before this job is available!" };
      if (job.needs === "OFFICE") return { ok: false, reason: "There isn't enough office space to assign this job!" };
      if (job.needs === "MILKING_ROOM") return { ok: false, reason: "Not enough space in milking rooms!" };
      return { ok: false, reason: "Convert a room into a " + job.needs.replace(/_/g, " ").toLowerCase() + " first." };
    }
    if (!rec.home) {
      return { ok: false, reason: "Slaves cannot work out of the cells at slavery administration. Move them into a room first!" };
    }
    if (job.dayOnly && (hour < 6 || hour >= 22)) {
      return { ok: false, reason: "No-one can work in Lilaya's lab while she is sleeping!" };
    }
    if (job.cap > 0 && LT.countWorkingJob(hour, jobId, rec.id) >= job.cap) {
      return { ok: false, reason: "You have already assigned the maximum number of people to this job!" };
    }
    return { ok: true };
  };

  LT.slavesInRoom = function (key) {
    key = key || "";
    return LT.ownedSlaves().filter(function (s) {
      return s.home === key;
    });
  };

  LT.jobAvailable = function (jobId, rec) {
    return LT.jobHourAvailable(jobId, rec, 12);
  };

  LT.setSlaveJobHour = function (rec, hour, jobId) {
    LT.normalizeSlave(rec);
    hour = ((hour % 24) + 24) % 24;
    if (jobId !== "IDLE" && LT.getSlaveJob(rec, hour) === jobId) {
      rec.hours[hour] = "IDLE";
    } else {
      var check = LT.jobHourAvailable(jobId, rec, hour);
      if (!check.ok) return check.reason;
      rec.hours[hour] = jobId;
    }
    rec.job = LT.primarySlaveJob(rec);
    LT.placeSlave(rec);
    return "";
  };

  LT.applySlaveHoursPreset = function (rec, presetId, jobId, force) {
    LT.normalizeSlave(rec);
    var preset = LT.SLAVE_JOB_HOURS[presetId];
    if (!preset) return "Unknown hours.";
    jobId = jobId || rec.job || "IDLE";
    var hour;
    if (preset.id === "NONE") {
      for (hour = 0; hour < 24; hour++) {
        if (rec.hours[hour] === jobId) rec.hours[hour] = "IDLE";
      }
    } else {
      for (hour = preset.start; hour < preset.start + preset.length; hour++) {
        var applied = ((hour % 24) + 24) % 24;
        var check = LT.jobHourAvailable(jobId, rec, applied);
        if (check.ok || force) rec.hours[applied] = jobId;
      }
    }
    rec.job = LT.primarySlaveJob(rec);
    LT.placeSlave(rec);
    return "";
  };

  LT.primarySlaveJob = function (rec) {
    LT.normalizeSlave(rec);
    var counts = {};
    var hour;
    for (hour = 0; hour < 24; hour++) {
      var id = rec.hours[hour] || "IDLE";
      if (id === "IDLE") continue;
      counts[id] = (counts[id] || 0) + 1;
    }
    var best = "IDLE";
    var bestN = 0;
    Object.keys(counts).forEach(function (id) {
      if (counts[id] > bestN) {
        best = id;
        bestN = counts[id];
      }
    });
    return best;
  };

  LT.slaveHoursSummary = function (rec) {
    LT.normalizeSlave(rec);
    var parts = [];
    var start = 0;
    var cur = rec.hours[0] || "IDLE";
    var hour;
    for (hour = 1; hour <= 24; hour++) {
      var next = hour < 24 ? rec.hours[hour] || "IDLE" : null;
      if (next !== cur) {
        if (cur !== "IDLE") {
          var job = LT.SLAVE_JOBS[cur] || LT.SLAVE_JOBS.IDLE;
          var name = rec.feminine === false ? job.nameM : job.name;
          parts.push(name + " " + String(start).padStart(2, "0") + ":00–" + String(hour % 24).padStart(2, "0") + ":00");
        }
        start = hour;
        cur = next;
      }
    }
    return parts.length ? parts.join("; ") : "Idle all day";
  };

  LT.setSlaveJob = function (rec, jobId) {
    var check = LT.jobAvailable(jobId, rec);
    if (!check.ok) return check.reason;
    rec.job = jobId;
    if (jobId === "IDLE") {
      rec.hours = emptyHours();
      LT.placeSlave(rec);
    } else {
      LT.applySlaveHoursPreset(rec, "DAY_LONG", jobId);
    }
    return "";
  };

  LT.slaveHourlyIncome = function (rec, jobId) {
    var job = LT.SLAVE_JOBS[jobId] || LT.SLAVE_JOBS.IDLE;
    var value = job.income + (job.affPay || 0) * (rec.aff || 0) + (job.obePay || 0) * (rec.obe || 0);
    return Math.max(0, Math.floor(value));
  };

  LT.dailySlaveStamina = function (rec) {
    LT.normalizeSlave(rec);
    var drain = 0;
    var hour;
    for (hour = 0; hour < 24; hour++) {
      var job = LT.SLAVE_JOBS[rec.hours[hour]] || LT.SLAVE_JOBS.IDLE;
      drain += job.stamina || 0;
    }
    return LT.SLAVE_BASE_STAMINA - drain;
  };

  LT.overworkLevel = function (rec) {
    var stam = LT.dailySlaveStamina(rec);
    if (stam < -19) return 3;
    if (stam < -9) return 2;
    if (stam < 0) return 1;
    return 0;
  };

  LT.hasSlavePermission = function (rec, settingId) {
    return !!(rec && rec.perms && rec.perms[settingId]);
  };

  LT.setSlavePermission = function (rec, groupId, settingId) {
    LT.normalizeSlave(rec);
    var group = LT.SLAVE_PERMISSIONS[groupId];
    if (!group) return;
    if (group.exclusive) {
      group.settings.forEach(function (s) {
        delete rec.perms[s.id];
      });
      rec.perms[settingId] = true;
    } else if (rec.perms[settingId]) {
      delete rec.perms[settingId];
    } else {
      rec.perms[settingId] = true;
    }
  };

  LT.hasSlaveJobSetting = function (rec, jobId, settingId) {
    return !!(rec && rec.jobSettings && rec.jobSettings[jobId] && rec.jobSettings[jobId][settingId]);
  };

  LT.setSlaveJobSetting = function (rec, jobId, settingId, exclusiveIds) {
    LT.normalizeSlave(rec);
    rec.jobSettings[jobId] = rec.jobSettings[jobId] || {};
    var map = rec.jobSettings[jobId];
    if (exclusiveIds && exclusiveIds.length) {
      exclusiveIds.forEach(function (id) {
        delete map[id];
      });
      map[settingId] = true;
      return;
    }
    if (map[settingId]) delete map[settingId];
    else map[settingId] = true;
  };

  LT.slaveBehaviourName = function (rec) {
    if (LT.hasSlavePermission(rec, "BEHAVIOUR_SLUTTY")) return "Slutty";
    if (LT.hasSlavePermission(rec, "BEHAVIOUR_SEDUCTIVE")) return "Seductive";
    if (LT.hasSlavePermission(rec, "BEHAVIOUR_PROFESSIONAL")) return "Professional";
    if (LT.hasSlavePermission(rec, "BEHAVIOUR_WHOLESOME")) return "Wholesome";
    return "Standard";
  };

  LT.assignSlaveHome = function (rec, key) {
    var up = LT.roomUpgradeAt(key);
    if (!up || !up.home) return "This room cannot house a slave.";
    if (up.cap > 0 && LT.slavesInRoom(key).filter(function (s) { return s.id !== rec.id; }).length >= up.cap) {
      return "This room is already occupied.";
    }
    rec.home = key;
    LT.placeSlave(rec);
    return "";
  };

  function hourSeed(rec, hour) {
    var day = Math.floor((LT.game.secondsPassed || 0) / 86400);
    var n = day * 97 + hour * 13;
    var s = String(rec && rec.id || "");
    var i;
    for (i = 0; i < s.length; i++) n += s.charCodeAt(i) * (i + 3);
    return ((n % 1000) + 1000) % 1000 / 1000;
  }

  function isSleepingHour(rec, hour) {
    if (LT.getSlaveJob(rec, hour) !== "IDLE") return false;
    if (LT.hasSlavePermission(rec, "SLEEPING_DAY")) return hour >= 6 && hour < 22;
    if (LT.hasSlavePermission(rec, "SLEEPING_NIGHT")) return hour < 6 || hour >= 22;
    return hour < 6 || hour >= 22;
  }

  LT.FLUID_VALUE = { milk: 0.01, crotchMilk: 0.01, cum: 0.1, girlcum: 1 };

  LT.milkingRooms = function () {
    if (!flags().milkingRooms) flags().milkingRooms = {};
    return flags().milkingRooms;
  };

  LT.milkingTank = function (key) {
    key = key || LT.findUpgradeKey("MILKING_ROOM");
    if (!key) return null;
    var tanks = LT.milkingRooms();
    if (!tanks[key]) tanks[key] = { milk: 0, crotchMilk: 0, cum: 0, girlcum: 0 };
    return tanks[key];
  };

  LT.milkingAmounts = function (rec, key) {
    var tankKey = key || LT.findUpgradeKey("MILKING_ROOM");
    var milk = 2500;
    var cum = 250;
    var girl = 50;
    if (LT.roomHasExtra(tankKey, "ARTISAN_MILKERS")) {
      milk = 2000;
      cum = 200;
      girl = 40;
    } else if (LT.roomHasExtra(tankKey, "INDUSTRIAL_MILKERS")) {
      milk = 5000;
      cum = 500;
      girl = 100;
    }
    if (LT.roomHasExtra(tankKey, "MILK_EFFICIENCY")) milk *= 2;
    if (LT.roomHasExtra(tankKey, "CUM_EFFICIENCY")) cum *= 2;
    if (LT.roomHasExtra(tankKey, "GIRLCUM_EFFICIENCY")) girl *= 2;
    return { milk: milk, crotchMilk: milk, cum: cum, girlcum: girl };
  };

  LT.applyMilkingHour = function (rec, key) {
    var amounts = LT.milkingAmounts(rec, key);
    var tank = LT.milkingTank(key);
    var income = 0;
    var notes = [];
    function handle(type, amount, collect, sell, label) {
      if (!collect || amount <= 0) return;
      if (sell) {
        var pay = Math.max(1, Math.floor(amount * LT.FLUID_VALUE[type]));
        income += pay;
        notes.push(amount + "ml " + label + " sold (+" + pay + ")");
      } else if (tank) {
        tank[type] = (tank[type] || 0) + amount;
        notes.push(amount + "ml " + label + " stored");
      }
    }
    handle("milk", rec.milkStorage > 0 || rec.lactating ? amounts.milk : 0, LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_MILK"), LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_MILK_AUTO_SELL"), "milk");
    handle("crotchMilk", rec.hasCrotchMilk ? amounts.crotchMilk : 0, LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_MILK_CROTCH"), LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_MILK_CROTCH_AUTO_SELL"), "udder-milk");
    handle("cum", rec.hasPenis ? amounts.cum : 0, LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_CUM"), LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_CUM_AUTO_SELL"), "cum");
    handle("girlcum", rec.hasVagina ? amounts.girlcum : 0, LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_GIRLCUM"), LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_GIRLCUM_AUTO_SELL"), "girlcum");
    return { income: income, notes: notes };
  };

  LT.sellMilkingTank = function (key) {
    var tank = LT.milkingTank(key);
    if (!tank) return 0;
    var pay = 0;
    ["milk", "crotchMilk", "cum", "girlcum"].forEach(function (type) {
      if (tank[type] > 0) pay += Math.max(1, Math.floor(tank[type] * LT.FLUID_VALUE[type]));
      tank[type] = 0;
    });
    if (pay && typeof LT.incrementMoney === "function") LT.incrementMoney(pay);
    return pay;
  };

  LT.applyRoomExtraDaily = function (rec) {
    if (!rec.home) return;
    var up = LT.roomUpgradeAt(rec.home);
    if (!up || !up.extras) return;
    var room = LT.houseRooms()[rec.home];
    if (!room || !room.x) return;
    Object.keys(room.x).forEach(function (id) {
      if (!room.x[id] || !up.extras[id]) return;
      rec.aff = Math.max(-100, Math.min(100, (rec.aff || 0) + (up.extras[id].aff || 0)));
      rec.obe = Math.max(-100, Math.min(100, (rec.obe || 0) + (up.extras[id].obe || 0)));
    });
  };

  LT.loungeKey = function () {
    return LT.findUpgradeKey("SLAVE_LOUNGE");
  };

  function wantsLounge(rec, hour) {
    if (!rec || !rec.home) return false;
    if (LT.getSlaveJob(rec, hour) !== "IDLE") return false;
    if (!LT.hasSlavePermission(rec, "GENERAL_HOUSE_FREEDOM")) return false;
    if (!LT.loungeKey()) return false;
    if (isSleepingHour(rec, hour)) return false;
    var over = LT.overworkLevel(rec);
    if (over === 3) return false;
    var roll = hourSeed(rec, hour);
    if (roll < 0.25) return false;
    if (roll < 0.3) return false;
    if (over === 2 && roll < 0.8) return false;
    if (over === 1 && roll < 0.55) return false;
    return true;
  }

  LT.idleDestination = function (rec, hour) {
    if (hour == null) hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    if (!rec.home) return { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" };
    var home = LT.parseRoomKey(rec.home);
    if (home) home.key = rec.home;
    if (!wantsLounge(rec, hour)) return home;
    var lounge = LT.loungeKey();
    var already = 0;
    LT.ownedSlaves().forEach(function (s) {
      if (s.id !== rec.id && wantsLounge(s, hour)) already += 1;
    });
    if (already >= 8) return home;
    var dest = LT.parseRoomKey(lounge);
    if (dest) dest.key = lounge;
    return dest || home;
  };

  LT.slaveWorkPlace = function (rec) {
    var hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    var jobId = LT.getSlaveJob(rec, hour);
    var job = LT.SLAVE_JOBS[jobId] || LT.SLAVE_JOBS.IDLE;
    if (jobId === "IDLE") return LT.idleDestination(rec, hour);
    if (jobId === "SECURITY" && LT.hasSlaveJobSetting(rec, "SECURITY", "SECURITY_ENTRANCE_PRIORITY")) {
      return { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_ENTRANCE_HALL" };
    }
    if (job.needs) {
      var key = LT.findUpgradeKey(job.needs);
      if (key) return LT.parseRoomKey(key);
    }
    if (job.place) return { world: job.place.world, place: job.place.place };
    if (rec.home) return LT.parseRoomKey(rec.home);
    return null;
  };

  LT.placeSlave = function (rec) {
    var dest = LT.slaveWorkPlace(rec);
    var npc = LT.slaveAsNpc(rec);
    if (!dest) {
      npc.location = null;
      return;
    }
    npc.location = dest.place
      ? { world: dest.world, place: dest.place, x: dest.x, y: dest.y }
      : { world: dest.world, x: dest.x, y: dest.y, place: "" };
    if (dest.x != null && window.allGrids && allGrids[dest.world]) {
      var cells = allGrids[dest.world];
      var i;
      for (i = 0; i < cells.length; i++) {
        if (cells[i].x === dest.x && cells[i].y === dest.y && cells[i].location) {
          npc.location.place = cells[i].location.placeType;
          break;
        }
      }
    }
  };

  LT.slaveAsNpc = function (rec) {
    LT.game.npcs = LT.game.npcs || {};
    rec = LT.normalizeSlave(rec);
    var n = LT.game.npcs[rec.id] || {};
    n.id = rec.id;
    n.name = rec.name;
    n.feminine = rec.feminine !== false;
    n.raceName = rec.raceName || rec.fullRace || "human";
    n.fullRace = rec.fullRace || n.raceName;
    n.speechColour = n.feminine ? LT.Colour.FEMININE : LT.Colour.MASCULINE;
    n.slave = true;
    n.job = rec.job;
    n.gender = n.feminine ? LT.Gender.FEMALE : LT.Gender.MALE;
    n.getName = function () {
      return this.name;
    };
    n.isFeminine = function () {
      return !!this.feminine;
    };
    n.getSpeechColour = function () {
      return this.speechColour;
    };
    n.getRaceName = function () {
      return this.fullRace || this.raceName;
    };
    n.hasVagina = function () {
      return !!(this.gender && this.gender.hasVagina);
    };
    n.hasPenis = function () {
      return !!(this.gender && this.gender.hasPenis);
    };
    n.hasBreasts = function () {
      return !!(this.gender && this.gender.hasBreasts);
    };
    if (!n.sex) n.sex = { vaginaVirgin: false, penisVirgin: false };
    LT.game.npcs[rec.id] = n;
    return n;
  };

  LT.syncSlaveNpcs = function () {
    LT.ownedSlaves().forEach(function (rec) {
      LT.normalizeSlave(rec);
      LT.placeSlave(rec);
    });
  };

  function hoursCrossed(prevSeconds, nextSeconds) {
    var hours = [];
    var t = Math.floor(prevSeconds / 3600) + 1;
    var end = Math.floor(nextSeconds / 3600);
    for (; t <= end && hours.length < 48; t++) hours.push(((t % 24) + 24) % 24);
    return hours;
  }

  LT.tickSlavery = function (seconds) {
    if (!seconds || !LT.game) return;
    var next = LT.game.secondsPassed;
    var prev = next - seconds;
    var hours = hoursCrossed(prev, next);
    if (!hours.length) {
      LT.syncSlaveNpcs();
      return;
    }
    var pay = 0;
    LT.ownedSlaves().forEach(function (rec) {
      LT.normalizeSlave(rec);
      var over = LT.overworkLevel(rec);
      var i;
      for (i = 0; i < hours.length; i++) {
        var jobId = LT.getSlaveJob(rec, hours[i]);
        if (jobId === "IDLE") continue;
        var job = LT.SLAVE_JOBS[jobId] || LT.SLAVE_JOBS.IDLE;
        var income = LT.slaveHourlyIncome(rec, jobId);
        pay += income;
        rec.earned = (rec.earned || 0) + income;
        var aff = job.affection || 0;
        if (over === 1) {
          if (aff > 0) aff *= 0.5;
          aff -= 0.5;
        } else if (over === 2) {
          if (aff > 0) aff *= 0.2;
          aff -= 1;
        } else if (over === 3) {
          if (aff > 0) aff = 0;
          aff -= 2;
        }
        rec.aff = Math.max(-100, Math.min(100, (rec.aff || 0) + aff));
        rec.obe = Math.max(-100, Math.min(100, (rec.obe || 0) + (job.obedience || 0)));
        if (jobId === "MILKING") {
          var milked = LT.applyMilkingHour(rec, LT.findUpgradeKey("MILKING_ROOM"));
          pay += milked.income;
          rec.earned = (rec.earned || 0) + milked.income;
        }
        if (hours[i] === 0) LT.applyRoomExtraDaily(rec);
      }
    });
    if (pay && typeof LT.incrementMoney === "function") LT.incrementMoney(pay);
    flags().slavePayFlash = pay;
    hours.forEach(function (hour) {
      LT.runSlaveInteractions(hour);
    });
    LT.syncSlaveNpcs();
  };

  function destKey(dest) {
    if (!dest) return "";
    if (dest.key) return dest.key;
    if (dest.x != null) return (dest.world || "") + ":" + dest.x + "," + dest.y;
    return (dest.world || "") + "|" + (dest.place || "");
  }

  function slaveDestAt(rec, hour) {
    var jobId = LT.getSlaveJob(rec, hour);
    if (jobId === "IDLE") return LT.idleDestination(rec, hour);
    var job = LT.SLAVE_JOBS[jobId] || LT.SLAVE_JOBS.IDLE;
    if (job.needs) {
      var key = LT.findUpgradeKey(job.needs);
      if (key) return LT.parseRoomKey(key);
    }
    if (job.place) return { world: job.place.world, place: job.place.place };
    if (rec.home) return LT.parseRoomKey(rec.home);
    return null;
  }

  LT.slaveEvents = function () {
    if (!flags().slaveEvents) flags().slaveEvents = [];
    return flags().slaveEvents;
  };

  LT.pushSlaveEvent = function (text) {
    var list = LT.slaveEvents();
    list.unshift(text);
    if (list.length > 12) list.length = 12;
  };

  var SLAVE_SEX_TEXT = {
    CLEANING: "While dusting one of the corridors, [npc.name] caught sight of [npc2.name], and couldn't resist pulling [npc2.herHim] into an empty room for some sex.",
    SECURITY: "While patrolling one of the corridors, [npc.name] caught sight of [npc2.name], and couldn't resist pulling [npc2.herHim] into an empty room for some sex.",
    IDLE: "[npc.Name] had some fun with [npc2.name].",
    KITCHEN: "While working in the kitchen, [npc.name] saw [npc2.name] enter the pantry alone, and couldn't resist following [npc2.herHim] inside.",
    GARDEN: "[npc.Name] pulled [npc2.name] behind one of the bushes in the garden.",
    LAB_ASSISTANT: "When Lilaya left to take a break, [npc.name] used the opportunity to have sex with [npc2.name] on one of the lab's tables.",
    LIBRARY: "[npc.Name] pulled [npc2.name] behind one of the shelves in the Library.",
    OFFICE: "Taking a small break from the paperwork assigned to [npc.herHim], [npc.name] pushed [npc2.name] down over [npc.her] desk.",
    BEDROOM: "[npc.Name] took advantage of being in your bedroom with [npc2.name].",
    SPA: "[npc.Name] took advantage of being in the spa with [npc2.name].",
    SPA_RECEPTIONIST: "[npc.Name] took advantage of being assigned to the spa's reception desk with [npc2.name].",
  };

  function parseSlavePair(a, b, raw) {
    var npc = LT.slaveAsNpc(a);
    var npc2 = LT.slaveAsNpc(b);
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: npc, npc2: npc2, pc: LT.game.player }, function () {
        return LT.parse(raw);
      });
    }
    return raw.replace(/\[npc\.Name\]/g, a.name).replace(/\[npc2\.name\]/g, b.name);
  }

  LT.runSlaveInteractions = function (hour) {
    var slaves = LT.ownedSlaves().map(function (s) {
      return LT.normalizeSlave(s);
    });
    var used = {};
    var i;
    var j;
    for (i = 0; i < slaves.length; i++) {
      var a = slaves[i];
      var jobA = LT.getSlaveJob(a, hour);
      var specA = LT.SLAVE_JOBS[jobA] || LT.SLAVE_JOBS.IDLE;
      if (specA.interactSex) a.pentUp = (a.pentUp || 0) + 1;
      if (used[a.id] || !LT.hasSlavePermission(a, "SEX_INITIATE_SLAVES")) continue;
      if (!specA.interactSex) continue;
      if ((a.pentUp || 0) < 8) continue;
      var destA = destKey(slaveDestAt(a, hour));
      if (!destA) continue;
      for (j = 0; j < slaves.length; j++) {
        var b = slaves[j];
        if (b.id === a.id || used[b.id]) continue;
        if (!LT.hasSlavePermission(b, "SEX_RECEIVE_SLAVES")) continue;
        if (destKey(slaveDestAt(b, hour)) !== destA) continue;
        if (a.home && (LT.roomHasExtra(a.home, "CELL_ROPES") || LT.roomHasExtra(a.home, "CELL_CHAINS"))) continue;
        if (LT.hasSlavePermission(b, "SEX_SAVE_VIRGINITY") && b.virgin) continue;
        used[a.id] = true;
        used[b.id] = true;
        a.pentUp = 0;
        var raw = SLAVE_SEX_TEXT[jobA] || SLAVE_SEX_TEXT.IDLE;
        var text = parseSlavePair(a, b, raw);
        a.affToward[b.id] = Math.min(100, (a.affToward[b.id] || 0) + 10);
        b.affToward[a.id] = Math.min(100, (b.affToward[a.id] || 0) + 10);
        a.aff = Math.min(100, (a.aff || 0) + 2);
        b.aff = Math.min(100, (b.aff || 0) + 2);
        if (LT.hasSlavePermission(a, "SEX_IMPREGNATE") && LT.hasSlavePermission(b, "SEX_IMPREGNATED")) {
          b.bredBy = a.id;
        }
        LT.pushSlaveEvent(text);
        break;
      }
    }
    for (i = 0; i < slaves.length; i++) {
      a = slaves[i];
      if (used[a.id]) continue;
      jobA = LT.getSlaveJob(a, hour);
      specA = LT.SLAVE_JOBS[jobA] || LT.SLAVE_JOBS.IDLE;
      if (!specA.interactBond) continue;
      destA = destKey(slaveDestAt(a, hour));
      if (!destA) continue;
      for (j = i + 1; j < slaves.length; j++) {
        b = slaves[j];
        if (used[b.id] || destKey(slaveDestAt(b, hour)) !== destA) continue;
        var roll = hourSeed(a, hour + j);
        if (roll > 0.2) continue;
        var pos = roll < 0.16;
        var delta = pos ? 5 : -5;
        a.affToward[b.id] = Math.max(-100, Math.min(100, (a.affToward[b.id] || 0) + delta));
        b.affToward[a.id] = Math.max(-100, Math.min(100, (b.affToward[a.id] || 0) + delta));
        LT.pushSlaveEvent(
          pos
            ? a.name + " and " + b.name + " spent some time getting to know one another a little better."
            : a.name + " and " + b.name + " spent some time arguing with one another.",
        );
        used[a.id] = true;
        used[b.id] = true;
        break;
      }
    }
  };

  LT.slavesAtCurrentTile = function () {
    var loc = (LT.game.player && LT.game.player.location) || {};
    var world = loc.world || (window.grid && grid.gridName);
    var place = loc.place || "";
    var x = loc.x;
    var y = loc.y;
    var list = [];
    LT.ownedSlaves().forEach(function (rec) {
      var npc = LT.game.npcs && LT.game.npcs[rec.id];
      if (!npc || !npc.location) return;
      if (npc.location.world !== world) return;
      if (npc.location.place && place && npc.location.place === place) {
        list.push(rec);
        return;
      }
      if (x != null && npc.location.x === x && npc.location.y === y) list.push(rec);
    });
    return list;
  };

  LT.jobSexText = function (rec) {
    var raw = JOB_SEX[rec.job] || JOB_SEX.IDLE;
    var npc = LT.slaveAsNpc(rec);
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ npc: npc, pc: LT.game.player }, function () {
        return "<p>" + LT.parse(raw) + "</p>";
      });
    }
    return "<p>" + raw + "</p>";
  };

  LT.maybeWorkplaceSex = function () {
    var f = flags();
    f.workSex = null;
    var slaves = LT.slavesAtCurrentTile();
    if (!slaves.length) return "";
    var hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    var i;
    for (i = 0; i < slaves.length; i++) {
      var rec = slaves[i];
      var job = LT.SLAVE_JOBS[LT.getSlaveJob(rec, hour)] || LT.SLAVE_JOBS.IDLE;
      if (job.noSex) continue;
      if (rec._sexHour === hour) continue;
      if (Math.random() >= WORK_SEX_CHANCE) {
        rec._sexHour = hour;
        continue;
      }
      rec._sexHour = hour;
      f.workSex = rec.id;
      return LT.jobSexText(rec);
    }
    return "";
  };

  LT.normalizeLocalImagePath = function (url) {
    if (!url || typeof url !== "string") return "";
    return String(url).trim().replace(/\\/g, "/");
  };

  LT.isSafeImageUrl = function (url) {
    if (!url || typeof url !== "string") return false;
    url = LT.normalizeLocalImagePath(url);
    if (!url || url.length > IMAGE_MAX) return false;
    if (/^(data:|https?:|file:|javascript:)/i.test(url)) return false;
    if (/^[a-zA-Z]:\//.test(url)) return false;
    if (url.charAt(0) === "/" || url.charAt(0) === "\\") return false;
    if (url.indexOf("..") !== -1) return false;
    if (!/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(url)) return false;
    return true;
  };

  LT.setCharacterImage = function (id, url) {
    if (!id) return false;
    var map = LT.charImages();
    if (!url) {
      delete map[id];
      return true;
    }
    url = LT.normalizeLocalImagePath(url);
    if (!LT.isSafeImageUrl(url)) return false;
    map[id] = url;
    return true;
  };

  LT.getCharacterImage = function (id) {
    if (!id) return "";
    return LT.charImages()[id] || "";
  };

  /* Bundled clothed portraits. Custom http(s) URLs still override. */
  LT.DEFAULT_PORTRAITS = {
    lilaya: "lilaya/clothed1.png",
    rose: "rose/clothed1.png",
    scarlett: "scarlett/clothed1.png",
    helena: "helena/clothed1.png",
    candi: "candi/clothed1.png",
    amber: "amber/clothed1.png",
    nyan: "nyan/clothed1.png",
    kate: "kate/clothed1.png",
    ashley: "ashley/clothed1.png",
    bunny: "bunny/clothed1.png",
    loppy: "loppy/clothed1.png",
    jules: "jules/clothed1.png",
    kalahari: "kalahari/clothed1.png",
    kruger: "kruger/clothed1.png",
    hannah: "hannah/clothed1.png",
    angel: "angel/clothed1.png",
    katherine: "katherine/clothed1.png",
    arthur: "arthur/clothed1.png",
    brax: "brax/clothed1.png",
    vicky: "vicky/clothed1.png",
    felicia: "felicia/clothed1.png",
    finch: "finch/clothed1.png",
    ralph: "ralph/clothed1.png",
    pix: "pix/clothed1.png",
    kay: "kay/clothed1.png",
    zaranix: "zaranix/clothed1.png",
    claire: "claire/clothed1.png",
    kelly: "kelly/clothed1.png",
  };

  LT.defaultPortraitUrl = function (id) {
    var rel = LT.DEFAULT_PORTRAITS && LT.DEFAULT_PORTRAITS[id];
    if (!rel) return "";
    return typeof LT.charAsset === "function" ? LT.charAsset(rel) : "assets/characters/" + rel;
  };

  /* Official Artwork.java: clothed* / partial* / naked*, plus filename tags
     #preg #nopreg #penis #nopenis #vagina #novagina. Cycle with artworkIndex. */
  LT.ARTWORK = LT.ARTWORK || {};

  function artworkBasename(path) {
    var s = String(path || "").replace(/\\/g, "/");
    var slash = s.lastIndexOf("/");
    return (slash >= 0 ? s.slice(slash + 1) : s).toLowerCase();
  }

  function artworkKind(path) {
    var n = artworkBasename(path);
    if (n.indexOf("naked") === 0) return "naked";
    if (n.indexOf("partial") === 0) return "partial";
    return "clothed";
  }

  function artworkHasTag(path, tag) {
    return artworkBasename(path).indexOf("#" + tag) >= 0 || artworkBasename(path).indexOf("_" + tag) >= 0;
  }

  LT.registerArtwork = function (id, spec) {
    if (!id || !spec || !spec.artists) return null;
    var existing = LT.ARTWORK[id] || { index: 0 };
    existing.artists = spec.artists;
    existing.defaultArtist = spec.defaultArtist || existing.defaultArtist || Object.keys(spec.artists)[0];
    if (spec.artist) existing.artist = spec.artist;
    if (existing.artist == null) existing.artist = existing.defaultArtist;
    LT.ARTWORK[id] = existing;
    return existing;
  };

  LT.setArtworkArtist = function (id, artist) {
    var pack = LT.ARTWORK[id];
    if (!pack || !pack.artists || !pack.artists[artist]) return false;
    pack.artist = artist;
    pack.index = 0;
    return true;
  };

  LT.artworkListFor = function (id) {
    var pack = LT.ARTWORK[id];
    if (!pack || !pack.artists) return [];
    var artist = pack.artist || pack.defaultArtist;
    var files = pack.artists[artist] || [];
    return files.slice();
  };

  LT.filterArtworkList = function (ch, files) {
    var preg = !!(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(ch));
    var hasPenis = !!(ch && ch.hasPenis && ch.hasPenis());
    var hasVagina = !!(ch && ch.hasVagina && ch.hasVagina());
    var taggedPreg = [];
    var kept = [];
    var i;
    for (i = 0; i < (files || []).length; i++) {
      var f = files[i];
      var n = artworkBasename(f);
      if (n.indexOf("#preg") >= 0 && n.indexOf("#nopreg") < 0 && !preg) continue;
      if (n.indexOf("#nopreg") >= 0 && preg) continue;
      if (n.indexOf("#penis") >= 0 && n.indexOf("#nopenis") < 0 && !hasPenis) continue;
      if (n.indexOf("#nopenis") >= 0 && hasPenis) continue;
      if (n.indexOf("#vagina") >= 0 && n.indexOf("#novagina") < 0 && !hasVagina) continue;
      if (n.indexOf("#novagina") >= 0 && hasVagina) continue;
      if (n.indexOf("#preg") >= 0 && n.indexOf("#nopreg") < 0) taggedPreg.push(f);
      else kept.push(f);
    }
    if (preg && taggedPreg.length) return taggedPreg;
    return kept;
  };

  function sexParticipant(ch) {
    if (!LT.sex || !LT.sex.active || !ch) return false;
    if (LT.sex.player === ch || LT.sex.partner === ch) return true;
    var parts = LT.sex.participants || [];
    var i;
    for (i = 0; i < parts.length; i++) if (parts[i] === ch) return true;
    return false;
  }

  LT.artworkClothingTier = function (ch) {
    if (sexParticipant(ch)) {
      var exp = ch.sexExposed || {};
      if (exp.PENIS || exp.VAGINA || exp.ANUS) return "naked";
      if (exp.BREASTS) return "partial";
    }
    return "clothed";
  };

  LT.filteredArtworkByTier = function (id) {
    var ch = typeof LT.characterById === "function" ? LT.characterById(id) : null;
    var files = LT.filterArtworkList(ch, LT.artworkListFor(id));
    var tier = LT.artworkClothingTier(ch);
    var bucket = [];
    var i;
    for (i = 0; i < files.length; i++) {
      if (artworkKind(files[i]) === tier) bucket.push(files[i]);
    }
    if (!bucket.length && tier === "partial") {
      for (i = 0; i < files.length; i++) if (artworkKind(files[i]) === "naked") bucket.push(files[i]);
    }
    if (!bucket.length) bucket = files;
    return bucket;
  };

  LT.pickArtworkUrl = function (id) {
    var bucket = LT.filteredArtworkByTier(id);
    if (!bucket.length) return "";
    var pack = LT.ARTWORK[id] || {};
    var ch = typeof LT.characterById === "function" ? LT.characterById(id) : null;
    var idx = (ch && ch.artworkIndex != null) ? ch.artworkIndex : pack.index || 0;
    idx = ((idx % bucket.length) + bucket.length) % bucket.length;
    return bucket[idx];
  };

  LT.incrementArtworkIndex = function (id, delta) {
    var bucket = LT.filteredArtworkByTier(id);
    if (bucket.length < 2) return false;
    var pack = LT.ARTWORK[id];
    var ch = typeof LT.characterById === "function" ? LT.characterById(id) : null;
    var idx = (ch && ch.artworkIndex != null) ? ch.artworkIndex : (pack && pack.index) || 0;
    idx = idx + (delta || 1);
    idx = ((idx % bucket.length) + bucket.length) % bucket.length;
    if (ch) ch.artworkIndex = idx;
    if (pack) pack.index = idx;
    return true;
  };

  LT.artworkEnabled = function () {
    return typeof LT.hasProperty !== "function" || LT.hasProperty("artwork");
  };

  LT.thumbnailEnabled = function () {
    return typeof LT.hasProperty !== "function" || LT.hasProperty("thumbnail");
  };

  LT.hasArtwork = function (id) {
    return !!(LT.getCharacterImage(id) || (typeof LT.pickArtworkUrl === "function" && LT.pickArtworkUrl(id)) || LT.defaultPortraitUrl(id));
  };

  LT.resolvedPortraitUrl = function (id) {
    var custom = LT.getCharacterImage(id);
    if (custom) return custom;
    if (!LT.artworkEnabled()) return "";
    var packed = typeof LT.pickArtworkUrl === "function" ? LT.pickArtworkUrl(id) : "";
    if (packed) return packed;
    return LT.defaultPortraitUrl(id);
  };

  LT.promptCharacterImage = function (id) {
    if (typeof window === "undefined" || !window.prompt) return false;
    var current = LT.getCharacterImage(id) || "";
    var next = window.prompt("Image path inside the game folder (for example images/name.png). Leave empty to clear.", current);
    if (next == null) return false;
    next = LT.normalizeLocalImagePath(next);
    if (!next) {
      LT.setCharacterImage(id, "");
      return true;
    }
    if (!LT.isSafeImageUrl(next)) return false;
    return LT.setCharacterImage(id, next);
  };

  LT.portraitHtml = function (id, cls) {
    var url = LT.resolvedPortraitUrl(id);
    if (!url) return "";
    return (
      "<img class='" +
      (cls || "char-portrait") +
      "' src='" +
      escapeHtml(url) +
      "' alt='' referrerpolicy='no-referrer' onload='if(window.LT&&LT.sizeArtwork)LT.sizeArtwork(this)' onerror=\"this.style.display='none'\">"
    );
  };

  LT.artworkHtml = function (id) {
    var img = typeof LT.portraitHtml === "function" ? LT.portraitHtml(id, "char-portrait") : "";
    if (!img) return "";
    var bucket = typeof LT.filteredArtworkByTier === "function" ? LT.filteredArtworkByTier(id) : [];
    var cycle = "";
    if (bucket.length > 1) {
      cycle =
        "<div class='art-cycle'>" +
        "<span class='art-cycle-btn' data-art-delta='-1' data-art-id='" +
        escapeHtml(id) +
        "'>&lt;</span>" +
        "<span class='art-cycle-btn' data-art-delta='1' data-art-id='" +
        escapeHtml(id) +
        "'>&gt;</span></div>";
    }
    return "<div class='char-artwork'>" + img + cycle + "</div>";
  };

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest("[data-art-id][data-art-delta]");
      if (!btn) return;
      var id = btn.getAttribute("data-art-id");
      var delta = Number(btn.getAttribute("data-art-delta")) || 1;
      if (typeof LT.incrementArtworkIndex === "function" && LT.incrementArtworkIndex(id, delta) && LT.game && LT.game.currentNode) {
        LT.game.setContent(LT.game.currentNode);
      }
    });
  }

  LT.sizeArtwork = function (img) {
    if (!img) return;
    var wrap = img.closest ? img.closest(".char-artwork") : img.parentNode;
    if (!wrap || !wrap.classList || !wrap.classList.contains("char-artwork")) return;
    var w = img.naturalWidth || 0;
    var h = img.naturalHeight || 0;
    var pct = 52;
    if (h && w && h < w) pct = 72;
    else if (h && w && h === w) pct = 56;
    wrap.style.width = pct + "%";
    if (w) wrap.style.maxWidth = w + "px";
  };

  LT.characterById = function (id) {
    if (!id || id === "player") return LT.game && LT.game.player;
    if (LT.game && LT.game.npcs && LT.game.npcs[id]) return LT.game.npcs[id];
    if (typeof LT.findSlave === "function") {
      var rec = LT.findSlave(id);
      if (rec && typeof LT.slaveAsNpc === "function") return LT.slaveAsNpc(rec);
    }
    return null;
  };

  LT.characterHoverTooltipHtml = function (id, opts) {
    opts = opts || {};
    var full = !!opts.full;
    var ch = typeof LT.characterById === "function" ? LT.characterById(id) : null;
    var name = "Unknown";
    var race = "";
    var level = 1;
    var colour = (LT.Colour && LT.Colour.ANDROGYNOUS) || "#ddd";
    if (ch) {
      if (ch.getName) name = ch.getName();
      else name = ch.name || id || name;
      if (ch.getRaceName) race = ch.getRaceName();
      else race = ch.fullRace || ch.raceName || "";
      level = ch.level || 1;
      var fem = ch.getFemininityValue ? ch.getFemininityValue() : ch.femininityValue;
      if (fem == null && ch.isFeminine) fem = ch.isFeminine() ? 70 : 30;
      if (fem == null) fem = 50;
      if (LT.Colour) {
        if (fem < 40) colour = LT.Colour.MASCULINE;
        else if (fem > 60) colour = LT.Colour.FEMININE;
        else colour = LT.Colour.ANDROGYNOUS;
      }
    } else if (id) name = id;
    var img = "";
    if (full || typeof LT.thumbnailEnabled !== "function" || LT.thumbnailEnabled()) {
      img = LT.portraitHtml(id, full ? "tip-portrait-full" : "tip-portrait");
    }
    return (
      '<div class="tip-name-card' +
      (full ? " tip-name-card-full" : "") +
      '">' +
      '<div class="tip-name-copy">' +
      '<div class="tip-title" style="color:' +
      colour +
      ';">' +
      escapeHtml(name) +
      '</div><div class="tip-body">Level ' +
      level +
      (race ? " " + escapeHtml(race) : "") +
      ".</div></div>" +
      img +
      "</div>"
    );
  };

  LT.compactCharacterSave = function () {
    var map = LT.charImages();
    Object.keys(map).forEach(function (id) {
      if (!LT.isSafeImageUrl(map[id])) delete map[id];
    });
    LT.ownedSlaves().forEach(function (rec) {
      LT.normalizeSlave(rec);
      delete rec.waiting;
      delete rec._sexHour;
      if (rec.name) rec.name = String(rec.name).slice(0, 40);
      if (rec.raceName) rec.raceName = String(rec.raceName).slice(0, 32);
      if (rec.fullRace) rec.fullRace = String(rec.fullRace).slice(0, 40);
    });
    LT.pendingSlaves().forEach(function (rec) {
      LT.normalizeSlave(rec);
      delete rec._sexHour;
    });
  };

  var GENERIC_CONTACT = {
    npc: true,
    alleyMugger: true,
    angelClient: true,
    wolfgang: true,
    glory: true,
    partner: true,
    prologuefemale: true,
    prologuemale: true,
  };

  function isGenericContactId(id) {
    if (!id) return true;
    var s = String(id);
    if (GENERIC_CONTACT[s]) return true;
    if (s.indexOf("alley_") === 0) return true;
    if (s.indexOf("clubber_") === 0) return true;
    return false;
  }

  LT.charactersEncountered = function () {
    LT.game.flags = LT.game.flags || {};
    if (!Array.isArray(LT.game.flags.charactersEncountered)) LT.game.flags.charactersEncountered = [];
    return LT.game.flags.charactersEncountered;
  };

  LT.markCharacterEncountered = function (id) {
    if (!id || id === "player" || isGenericContactId(id)) return;
    var list = LT.charactersEncountered();
    if (list.indexOf(id) < 0) list.push(id);
    var n = LT.game.npcs && LT.game.npcs[id];
    if (n) n.playerHasMet = true;
  };

  LT.namedCharacterIds = function () {
    var ids = ["player"];
    var met = LT.charactersEncountered();
    var npcs = LT.game.npcs || {};
    var i;
    for (i = 0; i < met.length; i++) {
      var id = met[i];
      if (!id || id === "player" || isGenericContactId(id)) continue;
      if (!npcs[id] && id !== "player") continue;
      if (ids.indexOf(id) < 0) ids.push(id);
    }
    Object.keys(npcs).forEach(function (key) {
      var n = npcs[key];
      if (!n || !n.id || isGenericContactId(n.id)) return;
      if (n.playerHasMet && ids.indexOf(n.id) < 0) ids.push(n.id);
    });
    return ids;
  };
})();
