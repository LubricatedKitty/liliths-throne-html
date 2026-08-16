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
      needs: "SPA",
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
  };

  LT.HOUSE_UPGRADES = {
    SLAVE_ROOM: {
      id: "SLAVE_ROOM",
      name: "Slave's Room",
      cost: 2000,
      cap: 1,
      home: true,
      colour: "#c0392b",
      description:
        "You've paid to have this room converted into basic slave's quarters. A single-size bed, covered in a plain white duvet, sits against one wall. Beside it, there's a simple bedside cabinet, complete with arcane-powered lamp. Other than that, the only other pieces of furniture in here are a wooden wardrobe and chest of drawers.",
    },
    GUEST_ROOM: {
      id: "GUEST_ROOM",
      name: "Guest Room",
      cost: 2000,
      cap: 1,
      home: true,
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
      colour: "#af7ac5",
      description:
        "In order to help Lilaya with her copious amounts of paperwork related to exotic material acquisition, you've had this room converted into a four-person-capacity office. Along with the forms related to Lilaya's heavily-regulated purchases, the workers assigned here are tasked with keeping records in a general 'Occupancy ledger', which you can access here at any time.",
    },
    MILKING_ROOM: {
      id: "MILKING_ROOM",
      name: "Milking Room",
      cost: 10000,
      cap: 8,
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
      colour: "#48c9b0",
      description:
        "This room has been completely renovated and transformed into a luxurious, private spa, complete with private showers and changing rooms. In the middle of the marble floor, there are a series of large pools, each of which is filled with warm water drawn from geothermal springs.",
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

  LT.convertRoom = function (upgradeId) {
    var up = LT.HOUSE_UPGRADES[upgradeId];
    var key = LT.currentRoomKey();
    if (!up || !key) return "There is no room here to convert.";
    if (LT.roomUpgradeAt(key)) return "This room has already been converted.";
    if (up.unique && LT.countUpgrade(up.id)) return "There is already a " + up.name.toLowerCase() + " in the house.";
    if (LT.getMoney() < up.cost) return "You need " + up.cost + " flames to convert this room.";
    LT.incrementMoney(-up.cost);
    LT.houseRooms()[key] = { u: up.id };
    LT.applyRoomUpgradeVisual(key, up);
    return "<p>Rose has the room converted into a <b>" + up.name + "</b> for " + up.cost + " flames.</p>";
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
    };
  }

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
      home: "",
      earned: 0,
    };
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

  LT.slaveWorkPlace = function (rec) {
    var hour = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    var jobId = LT.getSlaveJob(rec, hour);
    var job = LT.SLAVE_JOBS[jobId] || LT.SLAVE_JOBS.IDLE;
    if (jobId === "IDLE") {
      if (rec.home) return LT.parseRoomKey(rec.home);
      return { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" };
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
      }
    });
    if (pay && typeof LT.incrementMoney === "function") LT.incrementMoney(pay);
    flags().slavePayFlash = pay;
    LT.syncSlaveNpcs();
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

  LT.isSafeImageUrl = function (url) {
    if (!url || typeof url !== "string") return false;
    if (url.length > IMAGE_MAX) return false;
    if (/^data:/i.test(url)) return false;
    return /^https?:\/\//i.test(url);
  };

  LT.setCharacterImage = function (id, url) {
    if (!id) return false;
    var map = LT.charImages();
    if (!url) {
      delete map[id];
      return true;
    }
    url = String(url).trim();
    if (!LT.isSafeImageUrl(url)) return false;
    map[id] = url;
    return true;
  };

  LT.getCharacterImage = function (id) {
    if (!id) return "";
    return LT.charImages()[id] || "";
  };

  LT.promptCharacterImage = function (id) {
    if (typeof window === "undefined" || !window.prompt) return false;
    var current = LT.getCharacterImage(id) || "";
    var next = window.prompt("Image URL (http/https only, max " + IMAGE_MAX + " characters). Leave empty to clear.", current);
    if (next == null) return false;
    next = String(next).trim();
    if (!next) {
      LT.setCharacterImage(id, "");
      return true;
    }
    if (!LT.isSafeImageUrl(next)) return false;
    return LT.setCharacterImage(id, next);
  };

  LT.portraitHtml = function (id, cls) {
    var url = LT.getCharacterImage(id);
    if (!url) return "";
    return (
      "<img class='" +
      (cls || "char-portrait") +
      "' src='" +
      escapeHtml(url) +
      "' alt='' referrerpolicy='no-referrer' onerror=\"this.style.display='none'\">"
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

  LT.namedCharacterIds = function () {
    var ids = ["player"];
    var npcs = LT.game.npcs || {};
    Object.keys(npcs).forEach(function (key) {
      var n = npcs[key];
      if (!n || !n.id) return;
      if (n.id === "npc" || n.id === "alleyMugger" || n.id === "angelClient" || n.id === "wolfgang") return;
      if (ids.indexOf(n.id) < 0) ids.push(n.id);
    });
    return ids;
  };
})();
