(function () {
  var unseen = {};
  var special = [];

  var parseTargets = null;

  LT.utilUnseen = unseen;

  LT.withParseTargets = function (map, fn) {
    var prev = parseTargets;
    parseTargets = map || null;
    try {
      return fn();
    } finally {
      parseTargets = prev;
    }
  };

  LT.addSpecialParse = function (value, reset) {
    if (reset) special = [];
    special.push(String(value));
  };

  LT.parseFromXML = function (path, tag) {
    var pack = LT.TEXT && LT.TEXT[path];
    if (!pack || pack[tag] == null) {
      return "<p><span style='color:" + LT.Colour.GENERIC_BAD + ";'>Dialogue for '" + tag + "' not found in " + path + ".</span></p>";
    }
    return LT.parse(pack[tag]);
  };

  LT.parse = function (input) {
    if (input == null) return "";
    var text = String(input);
    var i;
    for (i = 0; i < special.length; i++) {
      text = text.split("[#SPECIAL_PARSE_" + i + "]").join(special[i]);
    }
    text = text.replace(/#VAR[\s\S]*?#ENDVAR/g, "");
    text = applyConditionals(text);
    text = text.replace(/\[units?\.time\((\d+)\)\]/g, function (_, h) {
      return String(h).padStart(2, "0") + ":00";
    });
    text = text.replace(/\[units\.size\((\d+)\)\]/g, function (_, n) {
      return n + " centimetres";
    });
    text = text.replace(/\[units?\.lSizes\((\d+)\)\]/g, function (_, n) {
      return Number(n) / 1000 + " metres";
    });
    text = text.replace(/\[units?\.lSizes\]/g, "metres");
    text = text.replace(/\[style\.evening\]/g, function () {
      var h = LT.hourOfDay ? LT.hourOfDay() : 12;
      if (h < 12) return "morning";
      if (h < 17) return "afternoon";
      return "evening";
    });
    text = text.replace(/\[style\.random\(([\s\S]*?)\)\]/g, function (_, inner) {
      var parts = String(inner).split("|");
      var clean = [];
      var p;
      for (p = 0; p < parts.length; p++) {
        var bit = parts[p].trim();
        if (bit) clean.push(bit);
      }
      return clean.length ? clean[Math.floor(Math.random() * clean.length)] : "";
    });
    text = text.replace(/\[style\.([A-Za-z]+)\(([\s\S]*?)\)\]/g, function (_, kind, inner) {
      return wrapStyle(kind, LT.parse(inner));
    });
    text = replaceCommands(text);
    return text;
  };

  function wrapStyle(kind, inner) {
    var map = {
      boldExcellent: { color: LT.Colour.GENERIC_EXCELLENT, bold: true },
      colourGood: { color: LT.Colour.GENERIC_GOOD },
      colorGood: { color: LT.Colour.GENERIC_GOOD },
      colourBad: { color: LT.Colour.GENERIC_BAD },
      colourTerrible: { color: "#b14a4a" },
      boldTerrible: { color: "#b14a4a", bold: true },
      italicsGood: { color: LT.Colour.GENERIC_GOOD, italic: true },
      italicsExcellent: { color: LT.Colour.GENERIC_EXCELLENT, italic: true },
      colourSex: { color: LT.Colour.ATTRIBUTE_LUST },
      italics: { italic: true },
      italicsMinorBad: { color: LT.Colour.GENERIC_MINOR_BAD, italic: true },
      italicsMinorGood: { color: LT.Colour.GENERIC_MINOR_GOOD, italic: true },
      colourMinorBad: { color: LT.Colour.GENERIC_MINOR_BAD },
      colourMinorGood: { color: LT.Colour.GENERIC_MINOR_GOOD },
      speechFeminine: { color: LT.Colour.FEMININE, speech: true },
      speechFeminineStrong: { color: "#ff3cb0", speech: true },
      speechMasculine: { color: LT.Colour.MASCULINE, speech: true },
      speechMasculineStrong: { color: "#3b6ea5", speech: true },
    };
    var spec = map[kind] || { color: "#ddd" };
    var style = spec.color ? "color:" + spec.color + ";" : "";
    if (spec.bold) style += "font-weight:bold;";
    if (spec.italic) style += "font-style:italic;";
    if (spec.speech) return '<span class="speech" style="' + style + '">' + inner + "</span>";
    return '<span style="' + style + '">' + inner + "</span>";
  }

  function applyConditionals(text) {
    var guard = 0;
    while (guard++ < 40) {
      var start = lastIndexOfIf(text);
      if (start < 0) break;
      var parsed = evalConditionalBlock(text, start);
      if (!parsed) break;
      text = text.slice(0, start) + parsed.keep + text.slice(parsed.end);
    }
    return text;
  }

  function lastIndexOfIf(text) {
    var best = -1;
    var i = 0;
    while (i < text.length) {
      var a = text.indexOf("#IF(", i);
      var b = text.indexOf("#IF ", i);
      var next = -1;
      if (a < 0) next = b;
      else if (b < 0) next = a;
      else next = Math.min(a, b);
      if (next < 0) break;
      if (next >= 4 && text.slice(next - 4, next) === "ELSE") {
        i = next + 3;
        continue;
      }
      best = next;
      i = next + 3;
    }
    return best;
  }

  function parseIfHeader(text, start, keyword) {
    var head = start + keyword.length;
    if (text.charAt(head) === "(") {
      var depth = 0;
      var j = head;
      for (; j < text.length; j++) {
        if (text.charAt(j) === "(") depth++;
        else if (text.charAt(j) === ")") {
          depth--;
          if (depth === 0) break;
        }
      }
      if (depth !== 0) return null;
      return { cond: text.slice(head + 1, j).trim(), bodyStart: j + 1 };
    }
    var thenAt = text.indexOf("#THEN", start);
    if (thenAt < 0) return null;
    return { cond: text.slice(head, thenAt).trim(), bodyStart: thenAt + 5 };
  }

  function evalConditionalBlock(text, start) {
    var header = parseIfHeader(text, start, "#IF");
    if (!header) return null;
    var branches = [];
    var depth = 0;
    var i = header.bodyStart;
    var branchStart = header.bodyStart;
    var branchCond = header.cond;
    while (i < text.length) {
      if (text.indexOf("#ELSEIF", i) === i) {
        if (depth === 0) {
          branches.push({ cond: branchCond, body: text.slice(branchStart, i) });
          var elseIf = parseIfHeader(text, i, "#ELSEIF");
          if (!elseIf) return null;
          branchCond = elseIf.cond;
          branchStart = elseIf.bodyStart;
          i = elseIf.bodyStart;
          continue;
        }
        i += 7;
        continue;
      }
      if (text.indexOf("#ELSE", i) === i) {
        if (depth === 0) {
          branches.push({ cond: branchCond, body: text.slice(branchStart, i) });
          branchCond = "true";
          branchStart = i + 5;
          i = branchStart;
          continue;
        }
        i += 5;
        continue;
      }
      if (text.indexOf("#ENDIF", i) === i) {
        if (depth === 0) {
          branches.push({ cond: branchCond, body: text.slice(branchStart, i) });
          var keep = "";
          for (var b = 0; b < branches.length; b++) {
            if (evalCondition(branches[b].cond)) {
              keep = branches[b].body;
              break;
            }
          }
          return { keep: keep, end: i + 6 };
        }
        depth--;
        i += 6;
        continue;
      }
      if (text.indexOf("#IF", i) === i) {
        depth++;
        i += 3;
        continue;
      }
      i++;
    }
    return null;
  }

  function findTop(text, from, token, stop) {
    var i = from;
    var depth = 0;
    while (i < text.length) {
      if (text.indexOf("#IF", i) === i) {
        depth++;
        i += 3;
        continue;
      }
      if (text.indexOf(stop, i) === i) {
        if (depth === 0) return -1;
        depth--;
        i += stop.length;
        continue;
      }
      if (depth === 0 && text.indexOf(token, i) === i) {
        if (token === "#ELSE" && text.indexOf("#ELSEIF", i) === i) {
          i += 7;
          continue;
        }
        return i;
      }
      i++;
    }
    return -1;
  }

  function npcAtLab() {
    var n = targetOf("lilaya");
    return !!(n && n.location && n.location.place === "LILAYA_HOME_LAB");
  }

  function hasFlag(id) {
    id = String(id || "").replace(/^FLAG_/, "");
    if (!LT.game.flags) return false;
    if (id === "accessToEnforcerHQ") return !!LT.game.flags.accessToEnforcerHQ;
    if (id === "knowsFelicia") return !!LT.game.flags.knowsFelicia;
    return !!LT.game.flags[id];
  }

  function evalCondition(expr) {
    var e = expr.replace(/\s+/g, "");
    try {
      e = e.replace(/pc\.isFeminine\(\)/g, bool(targetOf("pc") && targetOf("pc").isFeminine()));
      e = e.replace(/pc\.hasPenis\(\)/g, bool(targetOf("pc") && targetOf("pc").hasPenis && targetOf("pc").hasPenis()));
      e = e.replace(/pc\.hasVagina\(\)/g, bool(targetOf("pc") && targetOf("pc").hasVagina && targetOf("pc").hasVagina()));
      e = e.replace(/pc\.isPenisBulgeVisible\(\)/g, bool(isBulgeVisible(targetOf("pc"))));
      e = e.replace(/pc\.isTesticleBulgeVisible\(\)/g, bool(isBulgeVisible(targetOf("pc"))));
      e = e.replace(/pc\.isTaur\(\)/g, "false");
      e = e.replace(/pc\.isCowardly\(\)/g, "false");
      e = e.replace(/pc\.isBipedal\(\)/g, "true");
      e = e.replace(/pc\.isAbleToFly(?:FromExtraParts)?\(\)/g, "false");
      e = e.replace(/pc\.isAbleToFly\(\)/g, "false");
      e = e.replace(/pc\.hasCompanions\(\)/g, "false");
      e = e.replace(/pc\.isPartyAbleToFly\(\)/g, "false");
      e = e.replace(/pc\.hasFetish\([^)]+\)/g, "false");
      e = e.replace(/pc\.isShy\(\)/g, bool(targetOf("pc") && targetOf("pc").hasPersonalityTrait && targetOf("pc").hasPersonalityTrait("SHY")));
      e = e.replace(/pc\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(targetOf("pc"))));
      e = e.replace(/game\.getPlayer\(\)\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(LT.game.player)));
      e = e.replace(/game\.getDialogueFlags\(\)\.hasFlag\((?:FLAG_)?([A-Za-z0-9_]+)\)/g, function (_, id) {
        return bool(hasFlag(id));
      });
      e = e.replace(/flags\.hasFlag\((?:FLAG_)?([A-Za-z0-9_]+)\)/g, function (_, id) {
        return bool(hasFlag(id));
      });
      e = e.replace(/lilaya\.getLocationPlaceType\(\)==PLACE_TYPE_LILAYA_HOME_LAB/g, bool(npcAtLab()));
      e = e.replace(/game\.isDayTime\(\)/g, bool(LT.isDayTime ? LT.isDayTime() : LT.isWorkTime && LT.isWorkTime()));
      e = e.replace(/game\.isExtendedWorkTime\(\)/g, bool(LT.isWorkTime && LT.isWorkTime()));
      e = e.replace(/pc\.getAttributeValue\(ATTRIBUTE_MAJOR_PHYSIQUE\)>=(\d+)/g, function (_, n) {
        return bool((LT.game.player && (LT.game.player.physique || 0)) >= Number(n));
      });
      e = e.replace(/flags\.getSavedLong\('([^']+)'\)(>=|==)(\d+)/g, function (_, id, op, n) {
        var key = id === "amber_door_knock_repeat_count" ? "amberDoorKnockRepeatCount" : id;
        var v = (LT.game.flags && LT.game.flags[key]) || 0;
        return bool(op === ">=" ? v >= Number(n) : v === Number(n));
      });
      e = e.replace(/game\.isWorkTime\(\)/g, bool(LT.isOfficeHours && LT.isOfficeHours()));
      e = e.replace(/game\.isBraxMainQuestComplete\(\)/g, bool(LT.questReached && LT.questReached("MAIN_1_D_SLAVERY")));
      e = e.replace(/pc\.getQuest\([^)]+\)==QUEST_([A-Z0-9_]+)/g, function (_, id) {
        return bool(LT.game.flags && LT.game.flags.quest === id);
      });
      e = e.replace(/pc\.isQuestProgressLessThan\([^,]+,QUEST_([A-Z0-9_]+)\)/g, function (_, id) {
        return bool(!(LT.questReached && LT.questReached(id)));
      });
      e = e.replace(/pc\.isQuestCompleted\([^)]+\)/g, "false");
      e = e.replace(/pc\.isHasSlaverLicense\(\)/g, bool(!!(LT.game.flags && LT.game.flags.hasSlaverLicense)));
      e = e.replace(/game\.getNonCompanionCharactersPresent\(\)\.isEmpty\(\)/g, bool(!(typeof LT.alleyMuggerPresent === "function" && LT.alleyMuggerPresent())));
      e = e.replace(/npc\.isAttractedTo\(pc\)/g, bool(targetOf("npc") && targetOf("npc").attractedToPlayer));
      e = e.replace(/npc\.isFeral\(\)/g, "false");
      e = e.replace(/npc\.isFeminine\(\)/g, bool(targetOf("npc") && targetOf("npc").isFeminine && targetOf("npc").isFeminine()));
      e = e.replace(/npc\.isFeminine\(\)/g, bool(targetOf("npc") && targetOf("npc").isFeminine && targetOf("npc").isFeminine()));
      e = e.replace(/npc\.isRelatedTo\(pc\)/g, "false");
      e = e.replace(/npc\.getHistory\(\)==OCCUPATION_[A-Z0-9_]+/g, "false");
      e = e.replace(/npc\.getAffectionLevel\(pc\)\.isLessThan\([^)]+\)/g, "true");
      e = e.replace(/npc\.hasEncounteredBefore\(\)/g, bool(targetOf("npc") && targetOf("npc").encounteredBefore));
      e = e.replace(/npc\.isVisiblyPregnant\(\)/g, "false");
      e = e.replace(/npc\.isSatisfiedFromLastSex\(\)/g, bool(targetOf("npc") && (targetOf("npc").orgasmedThisSex || 0) >= 1));
      e = e.replace(/sex\.getNumberOfOrgasms\(npc\)>(\d+)/g, function (_, n) {
        return bool(targetOf("npc") && (targetOf("npc").orgasmedThisSex || 0) > Number(n));
      });
      e = e.replace(/npc\.isMute\(\)/g, "false");
      e = e.replace(/npc\.isPostCombatRapePlay\(\)/g, "false");
      e = e.replace(/pc\.getRace\(\)==RACE_[A-Z0-9_]+/g, "false");
      if (e === "canal") return !!(LT.game.flags && LT.game.flags.alleyCanal);
      if (e === "storm") return !!(LT.isArcaneStorm && LT.isArcaneStorm());
      e = e.replace(/npc\.isCharacterReactedToPregnancy\([^)]*\)/g, "false");
      e = e.replace(/npc\.getPregnantLitter\(\)[^=]*=[^=]*\([^)]*\)/g, "false");
      e = e.replace(/brax\.getFoughtPlayerCount\(\)>(\d+)/g, function (_, n) {
        return bool((LT.game.flags && LT.game.flags.braxFoughtCount || 0) > Number(n));
      });
      e = e.replace(/pc\.getTailType\(\)\.getRace\(\)==RACE_[A-Z0-9_]+/g, "false");
      e = e.replace(/game\.isNonConEnabled\(\)/g, "false");
      e = e.replace(/game\.isPlotDiscovered\(\)/g, "false");
      e = e.replace(/pc\.getOccupation\(\)==OCCUPATION_[A-Z0-9_]+/g, "false");
      e = e.replace(/game\.isArcaneStorm\(\)/g, bool(LT.isArcaneStorm && LT.isArcaneStorm()));
      e = e.replace(/game\.getCurrentWeather\(\)==WEATHER_([A-Z0-9_]+)/g, function (_, w) {
        return bool(typeof LT.currentWeather === "function" && LT.currentWeather() === w);
      });
      e = e.replace(/pc\.getLocationPlace\(\)\.getPlaceType\(\)==PLACE_TYPE_([A-Z0-9_]+)/g, function (_, id) {
        var place = LT.game.player && LT.game.player.location && LT.game.player.location.place;
        return bool(place === id);
      });
      e = e.replace(/pc\.hasCompanions\(\)/g, "false");
      e = e.replace(/game\.getHourOfDay\(\)>=(\d+)&&game\.getHourOfDay\(\)<=(\d+)/g, function (_, a, b) {
        var h = LT.hourOfDay ? LT.hourOfDay() : 12;
        return bool(h >= Number(a) && h <= Number(b));
      });
      e = e.replace(/pc\.getCharactersEncountered\(\)\.contains\([^)]+\)/g, bool(!!(LT.game.flags && LT.game.flags.metCandi)));
      e = e.replace(/game\.isHourBetween\((\d+),(\d+)\)/g, function (_, a, b) {
        var h = LT.hourOfDay ? LT.hourOfDay() : 12;
        return bool(h >= Number(a) && h < Number(b));
      });
      if (/[^truefals!&|()]/i.test(e.replace(/true|false/g, ""))) {
        note("cond:" + expr);
        return false;
      }
      return Function("return (" + e + ");")();
    } catch (err) {
      note("cond-err:" + expr);
      return false;
    }
  }

  function bool(v) {
    return v ? "true" : "false";
  }

  function isBulgeVisible(ch) {
    if (!ch || !ch.hasPenis || !ch.hasPenis()) return false;
    return !ch.isFeminine();
  }

  function replaceCommands(text) {
    var out = "";
    var i = 0;
    while (i < text.length) {
      if (text.charAt(i) !== "[") {
        out += text.charAt(i);
        i++;
        continue;
      }
      var parsed = parseCommandAt(text, i);
      if (!parsed) {
        out += "[";
        i++;
        continue;
      }
      out += parsed.out;
      i = parsed.end;
    }
    return out;
  }

  function parseCommandAt(text, start) {
    var rest = text.slice(start);
    var m = /^\[([A-Za-z0-9]+)\.([A-Za-z0-9_+]+)/.exec(rest);
    if (!m) return null;
    var i = start + m[0].length;
    var args = null;
    if (text.charAt(i) === "(") {
      var depth = 1;
      var j = i + 1;
      for (; j < text.length; j++) {
        var c = text.charAt(j);
        if (c === "(") depth++;
        else if (c === ")") {
          depth--;
          if (depth === 0) break;
        }
      }
      if (depth !== 0) return null;
      args = text.slice(i + 1, j);
      i = j + 1;
    }
    if (text.charAt(i) !== "]") return null;
    return { out: runCommand(m[1], m[2], args), end: i + 1 };
  }

  function conjugateVerb(base) {
    var word = String(base || "");
    if (!word) return word;
    var lower = word.toLowerCase();
    var irregular = { have: "has", be: "is", do: "does", go: "goes", ready: "readies" };
    if (irregular[lower]) {
      if (word.charAt(0) === word.charAt(0).toUpperCase()) {
        return irregular[lower].charAt(0).toUpperCase() + irregular[lower].slice(1);
      }
      return irregular[lower];
    }
    if (/(?:s|x|z|ch|sh)$/i.test(word)) return word + "es";
    if (/[bcdfghjklmnpqrstvwxz]y$/i.test(word)) return word.slice(0, -1) + "ies";
    return word + "s";
  }

  function targetOf(name) {
    var key = name.toLowerCase();
    if (parseTargets && parseTargets[key]) return parseTargets[key];
    if (key === "pc") return LT.game.player;
    if (LT.game.npcs && LT.game.npcs[key]) return LT.game.npcs[key];
    if (key === "npc") return LT.game.npcs && (LT.game.npcs.npc || LT.game.npcs.prologuefemale || LT.game.npcs.prologuemale);
    if (key === "npcfemale") {
      return {
        feminine: true,
        name: "the wolf-girl",
        getName: function () {
          return "the wolf-girl";
        },
        isFeminine: function () {
          return true;
        },
        getSpeechColour: function () {
          return LT.Colour.FEMININE;
        },
      };
    }
    return null;
  }

  function runCommand(targetName, command, args) {
    var ch = targetOf(targetName);
    if (!ch) {
      note(targetName + "." + command);
      return "[" + targetName + "." + command + "]";
    }
    var raw = command;
    var plus = /\+$/.test(command);
    command = command.replace(/\+$/, "");
    var cap = command.charAt(0) === command.charAt(0).toUpperCase() && command.charAt(0) !== command.charAt(0).toLowerCase();
    var cmd = command.toLowerCase();
    var out = resolve(ch, cmd, args, plus, targetName);
    if (out == null) {
      note(targetName + "." + raw);
      return "[" + targetName + "." + raw + "]";
    }
    if (cap && out.length) out = out.charAt(0).toUpperCase() + out.slice(1);
    return out;
  }

  function isPlayerChar(ch) {
    return !!(ch && ((ch.isPlayer && ch.isPlayer()) || ch.player));
  }

  function sexPlayerToken(targetName, ch) {
    return !!(LT._parseSexNames && isPlayerChar(ch) && String(targetName || "").toLowerCase() !== "pc");
  }

  function resolve(ch, cmd, args, plus, targetName) {
    var fem = ch.isFeminine ? ch.isFeminine() : !!ch.feminine;
    var name = ch.getName ? ch.getName() : ch.name || "someone";
    var asYou = sexPlayerToken(targetName, ch);
    if (cmd === "verb") {
      var base = (args || "").trim();
      var isPlayer = isPlayerChar(ch);
      return isPlayer ? base : conjugateVerb(base);
    }
    if (cmd === "does") {
      return isPlayerChar(ch) ? "do" : "does";
    }
    if (cmd === "name") return asYou ? "you" : name;
    if (cmd === "nameisfull") {
      return isPlayerChar(ch) ? "You are" : name + " is";
    }
    if (cmd === "namepos") return asYou ? "your" : possessive(name);
    if (cmd === "namehers") {
      return isPlayerChar(ch) ? "yours" : possessive(name);
    }
    if (cmd === "scent") return plus ? "intoxicating scent" : "scent";
    if (cmd === "a_moan") return fem ? "a moan" : "a groan";
    if (cmd === "moanverb") return fem ? "moans" : "groans";
    if (cmd === "finger") return plus ? "slender finger" : "finger";
    if (cmd === "fingers") return plus ? "slender fingers" : "fingers";
    if (cmd === "pussy") return plus ? "wet pussy" : "pussy";
    if (cmd === "asshole") return plus ? "tight asshole" : "asshole";
    if (cmd === "asscloaca") return plus ? "ass" : "ass";
    if (cmd === "nipple") return plus ? "puffy nipple" : "nipple";
    if (cmd === "nipples") return plus ? "puffy nipples" : "nipples";
    if (cmd === "breast") return plus ? "large breast" : "breast";
    if (cmd === "ear") return "ear";
    if (cmd === "wall") return "wall";
    if (cmd === "moansverb") return asYou ? "moan" : fem ? "moans" : "groans";
    if (cmd === "groansverb") return asYou ? "groan" : fem ? "moan" : "groan";
    if (cmd === "a_groan") return fem ? "a moan" : "a groan";
    if (cmd === "groan") return fem ? "moan" : "groan";
    if (cmd === "labia") return plus ? "puffy labia" : "labia";
    if (cmd === "clit") return plus ? "sensitive clit" : "clit";
    if (cmd === "thigh") return plus ? "thigh" : "thigh";
    if (cmd === "thighs") return plus ? "thighs" : "thighs";
    if (cmd === "foot") return plus ? "foot" : "foot";
    if (cmd === "feet") return plus ? "feet" : "feet";
    if (cmd === "footjob") return "footjob";
    if (cmd === "cleavage") return "cleavage";
    if (cmd === "chest") return plus ? "chest" : "chest";
    if (cmd === "cock") return plus ? "hard cock" : "cock";
    if (cmd === "cockhead" || cmd === "cocktip") return plus ? "wide head" : "head";
    if (cmd === "penis") return plus ? "hard cock" : "cock";
    if (cmd === "face") return "face";
    if (cmd === "tongue") return plus ? "long tongue" : "tongue";
    if (cmd === "breastrows") return "";
    if (cmd === "shehas" || cmd === "shehasfull") return asYou ? "you have" : fem ? "she has" : "he has";
    if (cmd === "surname") return ch.surname || "";
    if (cmd === "she" || cmd === "he") return asYou ? "you" : fem ? "she" : "he";
    if (cmd === "her") return asYou ? "your" : fem ? "her" : "his";
    if (cmd === "his") return asYou ? "your" : fem ? "her" : "his";
    if (cmd === "him") return asYou ? "you" : fem ? "her" : "him";
    if (cmd === "hers") return asYou ? "yours" : fem ? "hers" : "his";
    if (cmd === "herself" || cmd === "himself") return asYou ? "yourself" : fem ? "herself" : "himself";
    if (cmd === "sheis") return asYou ? "you're" : fem ? "she's" : "he's";
    if (cmd === "herhim") return asYou ? "you" : fem ? "her" : "him";
    if (cmd === "relation") return ch.relationToPlayer || "relative";
    if (cmd === "pcname") return (LT.game.player && (LT.game.player.getName ? LT.game.player.getName() : LT.game.player.name)) || "you";
    if (cmd === "fullname" || cmd === "namefull") {
      if (ch.getFullName) return ch.getFullName();
      return name + (ch.surname ? " " + ch.surname : "");
    }
    if (cmd === "heightvalue") return ch.heightValue || "average height";
    if (cmd === "eyecolour") return ch.eyeColour || "coloured";
    if (cmd === "eyes") return (ch.eyeColour ? ch.eyeColour + " eyes" : "eyes");
    if (cmd === "arm") return "arm";
    if (cmd === "arms") return "arms";
    if (cmd === "legs") return "legs";
    if (cmd === "race") return ch.getRaceName ? ch.getRaceName() : ch.raceName || "human";
    if (cmd === "stepping") return "stepping";
    if (cmd === "step") return "step";
    if (cmd === "steps") return isPlayerChar(ch) ? "step" : "steps";
    if (cmd === "walk") return "walk";
    if (cmd === "leg") return "leg";
    if (cmd === "a_hand") return "a hand";
    if (cmd === "hand") return "hand";
    if (cmd === "lip") return plus ? "full lip" : "lip";
    if (cmd === "hips") return plus ? "wide hips" : "hips";
    if (cmd === "moans") return fem ? "moans" : "groans";
    if (cmd === "a_fullrace" || cmd === "afullrace") {
      var race = ch.fullRace || (ch.getRaceName ? ch.getRaceName() : ch.raceName) || "person";
      var article = /^[aeiou]/i.test(race) ? "an" : "a";
      return article + " " + race;
    }
    if (cmd === "fullrace") return ch.fullRace || (ch.getRaceName ? ch.getRaceName() : ch.raceName) || "person";
    if (cmd === "cupsize") return ch.cupSize || "";
    if (cmd === "a_penissize" || cmd === "penissize") return ch.penisSize || "a small";
    if (cmd === "speech" || cmd === "speechnoeffects") {
      var sc = ch.getSpeechColour ? ch.getSpeechColour() : fem ? LT.Colour.FEMININE : LT.Colour.MASCULINE;
      return '<span class="speech" style="color:' + sc + ';">"' + replaceCommands(args || "") + '"</span>';
    }
    if (cmd === "thought") return "<i>" + (args || "") + "</i>";
    if (cmd === "moaning") return fem ? "moaning" : "groaning";
    if (cmd === "moan") return fem ? "moan" : "groan";
    if (cmd === "ass") return plus ? "plump ass" : "ass";
    if (cmd === "breasts") {
      if (ch.breastSize && ch.breastSize.id === "FLAT") return "chest";
      return plus ? "breasts" : "breasts";
    }
    if (cmd === "lips") return plus ? "full lips" : "lips";
    if (cmd === "girl") return fem ? "girl" : "guy";
    if (cmd === "sir") return fem ? "Ma'am" : "Sir";
    return null;
  }

  function possessive(name) {
    if (/s$/i.test(name)) return name + "'";
    return name + "'s";
  }

  function note(token) {
    if (!unseen[token]) {
      unseen[token] = true;
      console.warn("UtilText unseen:", token);
    }
  }
})();
