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
    text = text.replace(/\[units?\.sizes?\]/g, "centimetres");
    text = text.replace(/\[units?\.size\((\d+)\)\]/g, function (_, n) {
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
    var limit = text.length;
    while (guard++ < 80) {
      var start = lastIndexOfIf(text, limit);
      if (start < 0) break;
      var parsed = evalConditionalBlock(text, start);
      if (!parsed) {
        limit = start;
        continue;
      }
      text = text.slice(0, start) + parsed.keep + text.slice(parsed.end);
      limit = text.length;
    }
    return text;
  }

  function isIfToken(text, i) {
    if (text.indexOf("#IF", i) !== i) return false;
    if (i >= 4 && text.slice(i - 4, i) === "ELSE") return false;
    return true;
  }

  function lastIndexOfIf(text, limit) {
    if (limit == null || limit > text.length) limit = text.length;
    var best = -1;
    var i = 0;
    while (i < limit) {
      var next = text.indexOf("#IF", i);
      if (next < 0 || next >= limit) break;
      if (isIfToken(text, next)) best = next;
      i = next + 3;
    }
    return best;
  }

  function skipThen(text, pos) {
    while (pos < text.length && /\s/.test(text.charAt(pos))) pos++;
    if (text.indexOf("#THEN", pos) === pos) return pos + 5;
    return pos;
  }

  function stripThenPrefix(body) {
    return String(body || "").replace(/^\s*#THEN\b\s*/i, "");
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
      return { cond: text.slice(head + 1, j).trim(), bodyStart: skipThen(text, j + 1) };
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
          branches.push({ cond: branchCond, body: stripThenPrefix(text.slice(branchStart, i)) });
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
          branches.push({ cond: branchCond, body: stripThenPrefix(text.slice(branchStart, i)) });
          branchCond = "true";
          branchStart = skipThen(text, i + 5);
          i = branchStart;
          continue;
        }
        i += 5;
        continue;
      }
      if (text.indexOf("#ENDIF", i) === i) {
        if (depth === 0) {
          branches.push({ cond: branchCond, body: stripThenPrefix(text.slice(branchStart, i)) });
          var keep = "";
          for (var b = 0; b < branches.length; b++) {
            if (evalCondition(branches[b].cond)) {
              keep = stripThenPrefix(branches[b].body);
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
      e = e.replace(/pc\.hasBreasts\(\)/g, bool(targetOf("pc") && targetOf("pc").hasBreasts && targetOf("pc").hasBreasts()));
      e = e.replace(/pc\.isPenisBulgeVisible\(\)/g, bool(isBulgeVisible(targetOf("pc"))));
      e = e.replace(/pc\.isTesticleBulgeVisible\(\)/g, bool(isBulgeVisible(targetOf("pc"))));
      e = e.replace(/[A-Za-z0-9_]+\.isTaur\(\)/g, "false");
      e = e.replace(/pc\.isCowardly\(\)/g, "false");
      e = e.replace(/pc\.isBipedal\(\)/g, "true");
      e = e.replace(/game\.isBadEndsEnabled\(\)/g, bool(LT.isBadEndsEnabled && LT.isBadEndsEnabled()));
      e = e.replace(/game\.isBadEnd\(\)/g, bool(LT.game.flags && LT.game.flags.badEnd));
      e = e.replace(/game\.isSpittingDisabled\(\)/g, bool(LT.isSpittingDisabled && LT.isSpittingDisabled()));
      e = e.replace(/pc\.isAbleToAccessCoverableArea\(CA_MOUTH,\s*true\)/g, "true");
      e = e.replace(/pc\.isAbleToHaveRaceTransformed\(\)/g, "false");
      e = e.replace(/pc\.isAbleToFlyFromExtraParts\(\)/g, bool(LT.isAbleToFlyFromExtraParts && LT.isAbleToFlyFromExtraParts()));
      e = e.replace(/pc\.isAbleToFly\(\)/g, bool(LT.isAbleToFly && LT.isAbleToFly()));
      e = e.replace(/pc\.hasCompanions\(\)/g, bool(playerHasCompanions()));
      e = e.replace(/pc\.isPartyAbleToFly\(\)/g, bool(LT.isPartyAbleToFly && LT.isPartyAbleToFly()));
      e = e.replace(/pc\.hasFetish\([^)]+\)/g, "false");
      e = e.replace(/pc\.hasItemType\(ITEM_innoxia_quest_gym_membership_card\)/g, function () {
        return bool(typeof LT.countItems === "function" && LT.countItems(LT.game.player, "innoxia_quest_gym_membership_card") > 0);
      });
      e = e.replace(/game\.getCharactersPresent\(\)\.contains\(pix\)/g, function () {
        var n = targetOf("pix");
        return bool(n && n.location && LT.game.player && LT.game.player.location && n.location.place === LT.game.player.location.place);
      });
      e = e.replace(/pix\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(targetOf("pix"))));
      e = e.replace(/pix\.isCharacterReactedToPregnancy\([^)]*\)/g, "true");
      e = e.replace(/kalahari\.isCharacterReactedToPregnancy\([^)]*\)/g, "true");
      e = e.replace(/kalahari\.isVisiblyPregnant\(\)/g, "false");
      e = e.replace(/pc\.isShy\(\)/g, bool(targetOf("pc") && targetOf("pc").hasPersonalityTrait && targetOf("pc").hasPersonalityTrait("SHY")));
      e = e.replace(/pc\.getFemininityValue\(\)>=FEMININITY_FEMININE_STRONG\.getMinimumFemininity\(\)/g, bool(targetOf("pc") && (targetOf("pc").femininityValue || 0) >= 80));
      e = e.replace(/(?:bimboHarpy|harpyBimbo|bimboHarpyCompanion|harpyBimboCompanion|dominantHarpy|harpyDominant|dominantHarpyCompanion|harpyDominantCompanion|nymphoHarpy|harpyNympho|nymphoHarpyCompanion|harpyNymphoCompanion)\.isVisiblyPregnant\(\)/g, "false");
      e = e.replace(/(?:bimboHarpy|harpyBimbo|bimboHarpyCompanion|harpyBimboCompanion)\.isCharacterReactedToPregnancy\([^)]*\)/g, "true");
      e = e.replace(/pc\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(targetOf("pc"))));
      e = e.replace(/game\.getPlayer\(\)\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(LT.game.player)));
      e = e.replace(/game\.getDialogueFlags\(\)\.hasFlag\((?:FLAG_)?([A-Za-z0-9_]+)\)/g, function (_, id) {
        return bool(hasFlag(id));
      });
      e = e.replace(/flags\.hasFlag\((?:FLAG_)?([A-Za-z0-9_]+)\)/g, function (_, id) {
        return bool(hasFlag(id));
      });
      e = e.replace(/lilaya\.getLocationPlaceType\(\)==PLACE_TYPE_LILAYA_HOME_LAB/g, bool(npcAtLab()));
      e = e.replace(/game\.getDayOfWeek\(\)==DOW_FRIDAY/g, function () {
        var dt = typeof LT.gameNow === "function" ? LT.gameNow() : null;
        return bool(dt && dt.getDay && dt.getDay() === 5);
      });
      e = e.replace(/scarlett\.isAbleToFly\(\)/g, bool(true));
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
      e = e.replace(/pc\.isQuestProgressGreaterThan\([^,]+,QUEST_([A-Z0-9_]+)\)/g, function (_, id) {
        if (LT.game.flags && LT.game.flags.quest === id) return "false";
        return bool(LT.questReached && LT.questReached(id));
      });
      e = e.replace(/pc\.isQuestFailed\([^)]+\)/g, "false");
      e = e.replace(/pc\.getQuest\(QUEST_LINE_ROMANCE_HELENA\)==QUEST_([A-Z0-9_]+)/g, function (_, id) {
        return bool(LT.game.flags && LT.game.flags.helenaRomance === id);
      });
      e = e.replace(/pc\.isQuestCompleted\(([^)]+)\)/g, function (_, raw) {
        if (/ROMANCE_HELENA/.test(raw)) return bool(LT.game.flags && LT.game.flags.helenaRomance === "complete");
        if (/HARPY_PACIFICATION/.test(raw)) return bool(LT.game.flags && (LT.game.flags.harpyQuest === "complete" || LT.game.flags.harpyPacified));
        return "false";
      });
      e = e.replace(/helena\.isSlutty\(\)/g, bool(targetOf("helena") && targetOf("helena").isSlutty && targetOf("helena").isSlutty()));
      e = e.replace(/helena\.hasFetish\(FETISH_([A-Z0-9_]+)\)/g, function (_, id) {
        return bool(targetOf("helena") && targetOf("helena").hasFetish && targetOf("helena").hasFetish(id));
      });
      e = e.replace(/helena\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(targetOf("helena"))));
      e = e.replace(/helena\.isCharacterReactedToPregnancy\([^)]*\)/g, "true");
      e = e.replace(/helena\.getPregnantLitter\(\)\.isFatherId\(pc\.getId\(\)\)/g, "false");
      e = e.replace(/scarlett\.isLikesPlayer\(\)/g, bool(targetOf("scarlett") && targetOf("scarlett").isLikesPlayer && targetOf("scarlett").isLikesPlayer()));
      e = e.replace(/scarlett\.hasPenis\(\)/g, bool(targetOf("scarlett") && targetOf("scarlett").hasPenis && targetOf("scarlett").hasPenis()));
      e = e.replace(/scarlett\.isAttractedTo\(pc\)/g, bool(targetOf("scarlett") && targetOf("scarlett").isAttractedTo && targetOf("scarlett").isAttractedTo()));
      e = e.replace(/scarlett\.isVisiblyPregnant\(\)/g, bool(typeof LT.isVisiblyPregnant === "function" && LT.isVisiblyPregnant(targetOf("scarlett"))));
      e = e.replace(/scarlett\.isCharacterReactedToPregnancy\([^)]*\)/g, "true");
      e = e.replace(/scarlett\.getPregnantLitter\(\)\.isFatherId\(pc\.getId\(\)\)/g, "false");
      e = e.replace(/scarlett\.isAssVirgin\(\)/g, bool(targetOf("scarlett") && targetOf("scarlett").sex && targetOf("scarlett").sex.assVirgin));
      e = e.replace(/scarlett\.getGenitalArrangement\(\)==GENITALS_CLOACA/g, "false");
      e = e.replace(/helena\.getGenitalArrangement\(\)==GENITALS_CLOACA/g, "false");
      e = e.replace(/pc\.hasLegs\(\)/g, "true");
      e = e.replace(/pc\.hasTail\(\)/g, "false");
      e = e.replace(/game\.getNonCompanionCharactersPresent\(\)\.contains\((helena|scarlett)\)/g, function (_, id) {
        var n = LT.game.npcs && LT.game.npcs[id];
        var place = LT.game.player && LT.game.player.location && LT.game.player.location.place;
        return bool(n && n.location && n.location.place === place);
      });
      e = e.replace(/game\.getDayMinutes\(\)([<>=]+)(\d+)(?:\*(\d+))?/g, function (_, op, a, b) {
        var mins = typeof LT.dayMinutes === "function" ? LT.dayMinutes() : 12 * 60;
        var rhs = Number(a) * (b ? Number(b) : 1);
        if (op === "<") return bool(mins < rhs);
        if (op === ">") return bool(mins > rhs);
        if (op === "<=") return bool(mins <= rhs);
        if (op === ">=") return bool(mins >= rhs);
        return bool(mins === rhs);
      });
      e = e.replace(/pc\.isHasSlaverLicense\(\)/g, bool(!!(LT.game.flags && LT.game.flags.hasSlaverLicense)));
      e = e.replace(/game\.getNonCompanionCharactersPresent\(\)\.isEmpty\(\)/g, bool(!(typeof LT.alleyMuggerPresent === "function" && LT.alleyMuggerPresent())));
      e = e.replace(/npc\.isAttractedTo\(pc\)/g, bool(targetOf("npc") && targetOf("npc").attractedToPlayer));
      e = e.replace(/npc\.hasFetish\(FETISH_([A-Z0-9_]+)\)/g, function (_, id) {
        var n = targetOf("npc");
        var key = "FETISH_" + id;
        return bool(n && n.hasFetish && n.hasFetish(key));
      });
      e = e.replace(/npc\.getFetishDesire\(FETISH_([A-Z0-9_]+)\)\.isPositive\(\)/g, function (_, id) {
        var n = targetOf("npc");
        var desire = n && n.getFetishDesire && n.getFetishDesire("FETISH_" + id);
        return bool(desire === "LIKE" || desire === "LOVE");
      });
      e = e.replace(/npc\.isUsingForcedFetish\(pc\)/g, bool(targetOf("npc") && targetOf("npc").usingForcedFetish));
      e = e.replace(/npc\.isUsingForcedTransform\(pc\)/g, bool(targetOf("npc") && targetOf("npc").usingForcedTransform));
      e = e.replace(/npc\.isApplyingPostCombatTransformations\(\)/g, bool(targetOf("npc") && targetOf("npc").usingForcedTransform));
      e = e.replace(/npc\.getPostCombatFetishPotion\(\)!=null/g, bool(targetOf("npc") && targetOf("npc").postCombatFetishPotion));
      e = e.replace(/npc\.getPostCombatPotion\(\)!=null/g, bool(targetOf("npc") && targetOf("npc").postCombatPotion));
      e = e.replace(/npc\.isFeral\(\)/g, bool(isFeralChar(targetOf("npc"))));
      e = e.replace(/com\.isFeral\(\)/g, bool(isFeralChar(firstCompanion())));
      e = e.replace(/npc\.isFeminine\(\)/g, bool(targetOf("npc") && targetOf("npc").isFeminine && targetOf("npc").isFeminine()));
      e = e.replace(/npc\.getObedienceBasic\(\)==OBEDIENCE_BASIC_DISOBEDIENT/g, function () {
        var n = targetOf("npc");
        return bool(n && (n.obedience || 0) < -30);
      });
      e = e.replace(/npc\.getObedienceBasic\(\)==OBEDIENCE_BASIC_NEUTRAL/g, function () {
        var n = targetOf("npc");
        var o = n ? n.obedience || 0 : 0;
        return bool(o >= -30 && o < 30);
      });
      e = e.replace(/npc\.getAffectionLevelBasic\(pc\)==AFFECTION_BASIC_DISLIKE/g, function () {
        var n = targetOf("npc");
        return bool(n && (n.affection || 0) < -30);
      });
      e = e.replace(/npc\.getAffectionLevelBasic\(pc\)==AFFECTION_BASIC_NEUTRAL/g, function () {
        var n = targetOf("npc");
        var a = n ? n.affection || 0 : 0;
        return bool(a >= -30 && a < 30);
      });
      e = e.replace(/npc\.isConfident\(\)/g, bool(targetOf("npc") && (targetOf("npc").confident || (targetOf("npc").isConfident && targetOf("npc").isConfident()))));
      e = e.replace(/npc\.isShy\(\)/g, bool(targetOf("npc") && (targetOf("npc").shy || (targetOf("npc").isShy && targetOf("npc").isShy()))));
      e = e.replace(/npc\.isKind\(\)/g, bool(targetOf("npc") && (targetOf("npc").kind || (targetOf("npc").isKind && targetOf("npc").isKind()))));
      e = e.replace(/npc\.isSelfish\(\)/g, bool(targetOf("npc") && (targetOf("npc").selfish || (targetOf("npc").isSelfish && targetOf("npc").isSelfish()))));
      e = e.replace(/npc\.isRelatedTo\(pc\)/g, "false");
      e = e.replace(/npc\.getHistory\(\)==OCCUPATION_[A-Z0-9_]+/g, "false");
      e = e.replace(/npc\.getAffectionLevel\(pc\)\.isLessThan\([^)]+\)/g, "true");
      e = e.replace(/npc\.hasEncounteredBefore\(\)/g, bool(targetOf("npc") && targetOf("npc").encounteredBefore));
      e = e.replace(/npc\.getPlayerSurrenderCount\(\)/g, String((targetOf("npc") && (targetOf("npc").playerSurrenderCount || 0)) || 0));
      e = e.replace(/npc\.isVisiblyPregnant\(\)/g, "false");
      e = e.replace(/npc\.isSatisfiedFromLastSex\(\)/g, bool(targetOf("npc") && (targetOf("npc").orgasmedThisSex || 0) >= 1));
      e = e.replace(/sex\.getNumberOfOrgasms\(npc\)>(\d+)/g, function (_, n) {
        return bool(targetOf("npc") && (targetOf("npc").orgasmedThisSex || 0) > Number(n));
      });
      e = e.replace(/npc\.isMute\(\)/g, bool(isMuteChar(targetOf("npc"))));
      e = e.replace(/com\.isMute\(\)/g, bool(isMuteChar(firstCompanion())));
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
      e = e.replace(/game\.isNonConEnabled\(\)/g, bool(LT.isNonConEnabled && LT.isNonConEnabled()));
      e = e.replace(/game\.isIncestEnabled\(\)/g, bool(LT.isIncestEnabled && LT.isIncestEnabled()));
      e = e.replace(/game\.isAnalContentEnabled\(\)/g, bool(LT.isAnalContentEnabled && LT.isAnalContentEnabled()));
      e = e.replace(/game\.isFootContentEnabled\(\)/g, bool(LT.isFootContentEnabled && LT.isFootContentEnabled()));
      e = e.replace(/game\.isArmpitContentEnabled\(\)/g, bool(LT.isArmpitContentEnabled && LT.isArmpitContentEnabled()));
      e = e.replace(/game\.isLactationContentEnabled\(\)/g, bool(LT.isLactationContentEnabled && LT.isLactationContentEnabled()));
      e = e.replace(/game\.isNipplePenContentEnabled\(\)/g, bool(LT.isNipplePenContentEnabled && LT.isNipplePenContentEnabled()));
      e = e.replace(/game\.isUrethralContentEnabled\(\)/g, bool(LT.isUrethralContentEnabled && LT.isUrethralContentEnabled()));
      e = e.replace(/game\.isGapeContentEnabled\(\)/g, bool(LT.isGapeContentEnabled && LT.isGapeContentEnabled()));
      e = e.replace(/game\.isFeralContentEnabled\(\)/g, bool(LT.isFeralContentEnabled && LT.isFeralContentEnabled()));
      e = e.replace(/game\.isOffspringEncountersEnabled\(\)/g, bool(LT.isOffspringEncountersEnabled && LT.isOffspringEncountersEnabled()));
      e = e.replace(/game\.isOpportunisticAttackersEnabled\(\)/g, bool(LT.isOpportunisticAttackersEnabled && LT.isOpportunisticAttackersEnabled()));
      e = e.replace(/game\.isSillyMode\(\)/g, bool(LT.isSillyMode && LT.isSillyMode()));
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
      e = e.replace(/pc\.hasCompanions\(\)/g, bool(playerHasCompanions()));
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

  var ENSURE_PARSE = {
    angel: "ensureAngel",
    jules: "ensureJules",
    kay: "ensureKay",
    kalahari: "ensureKalahari",
    kruger: "ensureKruger",
    nyan: "ensureNyan",
    pix: "ensurePix",
    kate: "ensureKate",
    ashley: "ensureAshley",
    bunny: "ensureBunny",
    loppy: "ensureLoppy",
    hannah: "ensureHannah",
    vicky: "ensureVicky",
    ralph: "ensureRalph",
    amber: "ensureAmber",
    katherine: "ensureKatherine",
    kelly: "ensureKelly",
    zaranix: "ensureZaranix",
    arthur: "ensureArthur",
    brax: "ensureBrax",
    helena: "ensureHelena",
    scarlett: "ensureScarlett",
    wolfgang: "ensureWolfgang",
  };

  function playerHasCompanions() {
    var ids = LT.game && LT.game.player && LT.game.player.companions;
    return !!(ids && ids.length);
  }

  function firstCompanion() {
    var ids = LT.game && LT.game.player && LT.game.player.companions;
    if (!ids || !ids.length) return null;
    var id = ids[0];
    if (!id) return null;
    if (LT.game.npcs && LT.game.npcs[id]) return LT.game.npcs[id];
    var lower = String(id).toLowerCase();
    return (LT.game.npcs && LT.game.npcs[lower]) || null;
  }

  function isFeralChar(ch) {
    if (!ch) return false;
    if (typeof ch.isFeral === "function") return !!ch.isFeral();
    return !!(ch.body && ch.body.feral);
  }

  function isMuteChar(ch) {
    if (!ch) return false;
    if (typeof ch.isMute === "function") return !!ch.isMute();
    if (ch.mute) return true;
    return !!(ch.hasPersonalityTrait && ch.hasPersonalityTrait("MUTE"));
  }

  function feralVocal(ch) {
    if (ch && ch.feralSound) return ch.feralSound;
    return "a wordless animal sound";
  }

  function targetOf(name) {
    var key = name.toLowerCase();
    if (parseTargets && parseTargets[key]) return parseTargets[key];
    if (key === "pc") return LT.game.player;
    if (key === "com" || key === "companion") return firstCompanion();
    if (LT.game.npcs && LT.game.npcs[key]) return LT.game.npcs[key];
    var ensureName = ENSURE_PARSE[key];
    if (ensureName && typeof LT[ensureName] === "function") {
      var ensured = LT[ensureName]();
      if (ensured) return ensured;
    }
    if (key === "bimboharpy" || key === "harpybimbo") return LT.game.npcs && LT.game.npcs.brittany;
    if (key === "bimboharpycompanion" || key === "harpybimbocompanion") return LT.game.npcs && LT.game.npcs.lauren;
    if (key === "dominantharpy" || key === "harpydominant") return LT.game.npcs && LT.game.npcs.diana;
    if (key === "dominantharpycompanion" || key === "harpydominantcompanion") return LT.game.npcs && LT.game.npcs.harley;
    if (key === "nymphoharpy" || key === "harpynympho") return LT.game.npcs && LT.game.npcs.lexi;
    if (key === "nymphoharpycompanion" || key === "harpynymphocompanion") return LT.game.npcs && LT.game.npcs.max;
    if (key === "npc") return LT.game.npcs && (LT.game.npcs.npc || LT.game.npcs.prologuefemale || LT.game.npcs.prologuemale);
    if (key === "partner") return LT.game.npcs && (LT.game.npcs.partner || LT.game.npcs.glory || LT.game.npcs.npc);
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

  function pickOne(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function sexPaceOf(ch) {
    if (LT.sex && typeof LT.sex.getSexPace === "function") return LT.sex.getSexPace(ch) || "";
    return "";
  }

  function sexVocal(ch, form) {
    var fem = ch && ch.isFeminine ? ch.isFeminine() : !!(ch && ch.feminine);
    var pace = sexPaceOf(ch);
    if (pace === "SUB_RESISTING") {
      if (form === "ing") return fem ? pickOne(["sobbing", "crying"]) : pickOne(["shouting", "protesting"]);
      if (form === "s") return fem ? pickOne(["sobs", "cries"]) : pickOne(["shouts", "protests"]);
      return fem ? pickOne(["sob", "cry"]) : pickOne(["shout", "protest"]);
    }
    if (form === "ing") return fem ? pickOne(["moaning", "squealing"]) : pickOne(["groaning", "grunting"]);
    if (form === "s") return fem ? pickOne(["moans", "squeals"]) : pickOne(["groans", "grunts"]);
    return fem ? pickOne(["moan", "squeal"]) : pickOne(["groan", "grunt"]);
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
    if (cmd === "has") {
      return isPlayerChar(ch) ? "have" : "has";
    }
    if (cmd === "mouth") return plus ? "hot mouth" : "mouth";
    if (cmd === "cum") return plus ? "hot cum" : "cum";
    if (cmd === "faceskin" || cmd === "skin") return "skin";
    if (cmd === "girlcum") return plus ? "slick girlcum" : "girlcum";
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
    if (cmd === "hand") return plus ? "delicate hand" : "hand";
    if (cmd === "hands") return plus ? "delicate hands" : "hands";
    if (cmd === "pussy") return plus ? "wet pussy" : "pussy";
    if (cmd === "asshole") return plus ? "tight asshole" : "asshole";
    if (cmd === "asscloaca") return plus ? "ass" : "ass";
    if (cmd === "nipple") return plus ? "puffy nipple" : "nipple";
    if (cmd === "nipples") return plus ? "puffy nipples" : "nipples";
    if (cmd === "breast") return plus ? "large breast" : "breast";
    if (cmd === "ear") return "ear";
    if (cmd === "wall") return "wall";
    if (cmd === "desk") return (LT.sex && LT.sex.deskName) || "desk";
    if (cmd === "floor") return (LT.sex && LT.sex.floorName) || "floor";
    if (cmd === "sobbing" || cmd === "crying") return sexVocal(ch, "ing");
    if (cmd === "sobs" || cmd === "cries") return sexVocal(ch, "s");
    if (cmd === "sob" || cmd === "cry") return sexVocal(ch, "base");
    if (cmd === "moansverb") return asYou ? "moan" : fem ? "moans" : "groans";
    if (cmd === "groansverb") return asYou ? "groan" : fem ? "moan" : "groan";
    if (cmd === "a_groan") return fem ? "a moan" : "a groan";
    if (cmd === "groan") return fem ? "moan" : "groan";
    if (cmd === "labia") return plus ? "puffy labia" : "labia";
    if (cmd === "clit") return plus ? "sensitive clit" : "clit";
    if (cmd === "clits") return plus ? "sensitive clits" : "clits";
    if (cmd === "tail") return plus ? "prehensile tail" : "tail";
    if (cmd === "tentacle") return plus ? "slick tentacle" : "tentacle";
    if (cmd === "tentacles") return plus ? "slick tentacles" : "tentacles";
    if (cmd === "thigh") return plus ? "thigh" : "thigh";
    if (cmd === "thighs") return plus ? "thighs" : "thighs";
    if (cmd === "foot") return plus ? "foot" : "foot";
    if (cmd === "feet") return plus ? "feet" : "feet";
    if (cmd === "toes") return plus ? "toes" : "toes";
    if (cmd === "spreadyourlegs") return isPlayerChar(ch) ? "spread your legs" : fem ? "spreads her legs" : "spreads his legs";
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
    if (cmd === "petname") {
      var who = String(args || "").replace(/[\[\]]/g, "").trim().toLowerCase();
      if (isPlayerChar(ch)) {
        var owner = targetOf(who) || (LT.game.npcs && (LT.game.npcs.npc || LT.game.npcs.alleyMugger));
        return (owner && owner.playerCallsNpc) || "them";
      }
      if (who === "pc" || who === "player") return ch.callsPlayer || "bitch";
      return ch.callsPlayer || "bitch";
    }
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
    if (cmd === "a_fullrace" || cmd === "afullrace" || cmd === "a_racefull" || cmd === "aracefull") {
      var race = ch.fullRace || (ch.getRaceName ? ch.getRaceName() : ch.raceName) || "person";
      var article = /^[aeiou]/i.test(race) ? "an" : "a";
      return article + " " + race;
    }
    if (cmd === "job" || cmd === "occupation" || cmd === "history") {
      if (ch.occupation && ch.occupation.name) return ch.occupation.name;
      if (typeof ch.occupation === "string") return ch.occupation;
      return "unemployed";
    }
    if (cmd === "fullrace") {
      var full = ch.fullRace || (ch.getRaceName ? ch.getRaceName() : ch.raceName) || "person";
      if (String(args || "").toLowerCase() === "true") {
        return (/^[aeiou]/i.test(full) ? "an " : "a ") + full;
      }
      return full;
    }
    if (cmd === "cupsize") return ch.cupSize || "";
    if (cmd === "a_penissize" || cmd === "penissize") return ch.penisSize || "a small";
    if (cmd === "speech" || cmd === "speechnoeffects") {
      if (isFeralChar(ch) || isMuteChar(ch)) {
        return "<i>" + feralVocal(ch) + "</i>";
      }
      var sc = ch.getSpeechColour ? ch.getSpeechColour() : fem ? LT.Colour.FEMININE : LT.Colour.MASCULINE;
      return '<span class="speech" style="color:' + sc + ';">"' + replaceCommands(args || "") + '"</span>';
    }
    if (cmd === "thought") return "<i>" + (args || "") + "</i>";
    if (cmd === "moaning") return sexVocal(ch, "ing");
    if (cmd === "moan") return fem ? "moan" : "groan";
    if (cmd === "ass") return plus ? "plump ass" : "ass";
    if (cmd === "breasts") {
      if (ch.breastSize && ch.breastSize.id === "FLAT") return "chest";
      return plus ? "breasts" : "breasts";
    }
    if (cmd === "lips") return plus ? "full lips" : "lips";
    if (cmd === "girl") return fem ? "girl" : "guy";
    if (cmd === "babe") return fem ? "babe" : "babe";
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
