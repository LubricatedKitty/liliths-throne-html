(function () {
  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function defeated(ch) {
    if (!ch) return true;
    if ((ch.health || 0) <= 0) return true;
    return (ch.lust || 0) >= (LT.MAX_LUST || 100);
  }

  function resetAp(ch) {
    ch.maxAP = ch.maxAP || 3;
    var penalty = typeof LT.consumeFlash === "function" ? LT.consumeFlash(ch) : 0;
    ch.remainingAP = Math.max(0, ch.maxAP - penalty);
    ch.turnStartAP = ch.remainingAP;
    ch.selectedMoves = [];
  }

  LT.combat = {
    active: false,
    turn: 0,
    player: null,
    enemy: null,
    escapeChance: 0,
    submitBlocked: false,
    victoryNode: null,
    defeatNode: null,
    escaped: false,
    finished: null,
    lastResolution: "",
    onVictory: null,
    onDefeat: null,
  };

  LT.combat.start = function (opts) {
    opts = opts || {};
    var player = LT.game.player;
    var enemy = opts.enemy;
    if (!player || !enemy) return;
    if (typeof LT.refreshVitals === "function") {
      LT.refreshVitals(player);
      LT.refreshVitals(enemy, true);
    }
    player.health = Math.max(player.health || 0, 5);
    enemy.health = enemy.maxHealth;
    if (player.lust == null) player.lust = 10;
    if (enemy.lust == null) enemy.lust = 10;
    player.blocking = false;
    enemy.blocking = false;
    player.resisting = false;
    enemy.resisting = false;
    if (typeof LT.clearStatuses === "function") {
      LT.clearStatuses(player);
      LT.clearStatuses(enemy);
    }
    if (typeof LT.refreshShields === "function") {
      LT.refreshShields(player);
      LT.refreshShields(enemy);
    }
    if (typeof LT.resetMoveCooldowns === "function") {
      LT.resetMoveCooldowns(player);
      LT.resetMoveCooldowns(enemy);
    }
    resetAp(player);
    resetAp(enemy);
    this.active = true;
    this.turn = 0;
    this.player = player;
    this.enemy = enemy;
    this.escapeChance = opts.escapeChance || 0;
    this.submitBlocked = !!opts.submitBlocked;
    this.victoryNode = opts.victoryNode;
    this.defeatNode = opts.defeatNode;
    this.returnNode = opts.returnNode || null;
    this.escaped = false;
    this.finished = null;
    this.lastResolution = "";
    this.onVictory = opts.onVictory || null;
    this.onDefeat = opts.onDefeat || null;
    this.responseTab = 0;
    this.onEscape = opts.onEscape || null;
    this.thrownThisTurn = [];
    this.thrownThisCombat = [];
    if (opts.behaviour) enemy.combatBehaviour = opts.behaviour;
    this.planEnemy();
  };

  function healthPct(ch) {
    var max = ch && ch.maxHealth ? ch.maxHealth : 1;
    return Math.max(0, (ch && ch.health) || 0) / max;
  }

  LT.combat.typeWeight = function (type, src, tgt, already, rnd) {
    rnd = rnd || Math.random;
    var behaviour = (src && src.combatBehaviour) || "BALANCED";
    var mult = 1;
    if (behaviour === "ATTACK" && type === "ATTACK") mult = 10;
    if (behaviour === "DEFEND" && type === "DEFEND") mult = 10;
    if (behaviour === "SEDUCE" && type === "TEASE") mult = 10;
    if (behaviour === "SPELLS" && type === "SPELL") mult = 10;
    already = already || 0;
    if (type === "ATTACK") {
      var attackBase = healthPct(tgt) < 0.2 ? 1.1 : 0.8;
      return attackBase * mult + 0.2 * rnd() - 0.2 * already;
    }
    if (type === "DEFEND") {
      if (healthPct(src) < 0.2) return 1.0 * mult + 0.5 * rnd() - 0.2 * already;
      return 0.25 * mult + 0.75 * rnd() - 0.2 * already;
    }
    if (type === "TEASE") {
      var w = 0.8 * mult + 0.2 * rnd() - 0.2 * already;
      if ((tgt && tgt.lust) >= 75) w += 0.2;
      if (src && src.attractedToPlayer === false) w *= 0.5;
      return w;
    }
    if (type === "SPELL") {
      if (!this.affordableEnemySpell(src)) return -999;
      return mult;
    }
    return 0;
  };

  LT.combat.affordableEnemySpell = function (src) {
    var ids = (src && src.knownSpells) || [];
    for (var i = 0; i < ids.length; i++) {
      var spell = LT.SPELLS && LT.SPELLS[ids[i]];
      var move = LT.MOVES && LT.MOVES["spell_" + ids[i]];
      if (spell && move && typeof LT.canAffordSpell === "function" && LT.canAffordSpell(src, spell)) return ids[i];
    }
    return null;
  };

  function queuedOfType(src, type) {
    var n = 0;
    var moves = (src && src.selectedMoves) || [];
    for (var i = 0; i < moves.length; i++) {
      var id = moves[i].id;
      if (type === "ATTACK" && (id === "strike" || id === "offhand")) n++;
      else if (type === "DEFEND" && id === "block") n++;
      else if (type === "TEASE" && id === "tease") n++;
      else if (type === "SPELL" && String(id).indexOf("spell_") === 0) n++;
    }
    return n;
  }

  LT.combat.pickEnemyMove = function (src, tgt, used, rnd) {
    used = used || {};
    var types = ["ATTACK", "DEFEND", "TEASE", "SPELL"];
    var best = null;
    var bestW = -999;
    for (var i = 0; i < types.length; i++) {
      var w = this.typeWeight(types[i], src, tgt, queuedOfType(src, types[i]), rnd);
      if (w > bestW) {
        bestW = w;
        best = types[i];
      }
    }
    if (best === "ATTACK") {
      var hasOff = typeof LT.getOffhandWeapon === "function" && LT.getOffhandWeapon(src);
      if (!used.strike) return { id: "strike", type: "ATTACK" };
      if (hasOff && !used.offhand) return { id: "offhand", type: "ATTACK" };
      return { id: "strike", type: "ATTACK" };
    }
    if (best === "DEFEND") return { id: "block", type: "DEFEND" };
    if (best === "TEASE") return { id: "tease", type: "TEASE" };
    if (best === "SPELL") {
      var sid = this.affordableEnemySpell(src);
      if (sid) return { id: "spell_" + sid, type: "SPELL" };
    }
    return { id: "strike", type: "ATTACK" };
  };

  LT.combat.planEnemy = function () {
    if (!this.enemy || defeated(this.enemy)) return;
    resetAp(this.enemy);
    var src = this.enemy;
    var tgt = this.player;
    var used = {};
    src.selectedMoves = [];
    while ((src.remainingAP || 0) >= 1) {
      var pick = this.pickEnemyMove(src, tgt, used);
      var move = LT.MOVES[pick.id];
      if (!move || (src.remainingAP || 0) < (move.ap || 1)) break;
      if (move.canUse && !move.canUse(src, tgt)) {
        if (pick.id === "offhand") {
          used.offhand = true;
          continue;
        }
        break;
      }
      src.selectedMoves.push({ id: pick.id, target: tgt });
      src.remainingAP -= move.ap || 1;
      used[pick.id] = true;
    }
  };

  LT.combat.remainingAp = function () {
    return this.player ? this.player.remainingAP || 0 : 0;
  };

  LT.combat.canQueue = function (moveId) {
    var move = LT.MOVES[moveId];
    if (!this.active || this.finished || !move || !this.player) return "You cannot use that now.";
    if ((this.player.remainingAP || 0) < move.ap) return "This action can't be used since you don't have enough AP!";
    if (move.canUse && !move.canUse(this.player, this.enemy)) {
      return move.cannotUseReason ? move.cannotUseReason(this.player, this.enemy) : "You cannot use that now.";
    }
    return null;
  };

  LT.combat.queue = function (moveId) {
    var reason = this.canQueue(moveId);
    if (reason) return reason;
    var move = LT.MOVES[moveId];
    this.player.selectedMoves.push({ id: moveId, target: this.enemy });
    this.player.remainingAP -= move.ap;
    if (move.cooldown && typeof LT.setMoveCooldown === "function") {
      LT.setMoveCooldown(this.player, moveId, move.cooldown);
    }
    return null;
  };

  LT.combat.resetSelectedMoves = function () {
    if (!this.active || this.finished || !this.player) return false;
    var moves = this.player.selectedMoves || [];
    if (!moves.length) return false;
    var i;
    for (i = 0; i < moves.length; i++) {
      var move = LT.MOVES[moves[i].id];
      if (move && move.cooldown && typeof LT.setMoveCooldown === "function") {
        LT.setMoveCooldown(this.player, moves[i].id, 0);
      }
    }
    this.player.selectedMoves = [];
    this.player.remainingAP = this.player.turnStartAP != null ? this.player.turnStartAP : this.player.maxAP || 3;
    return true;
  };

  LT.combat.predictions = function (ch) {
    var list = [];
    var moves = (ch && ch.selectedMoves) || [];
    for (var i = 0; i < moves.length; i++) {
      var move = LT.MOVES[moves[i].id];
      if (move) list.push(move.predict(ch, moves[i].target));
    }
    return list;
  };

  LT.combat.endTurn = function () {
    if (!this.active || this.finished) return;
    this.player.blocking = false;
    this.enemy.blocking = false;
    this.player.resisting = false;
    this.enemy.resisting = false;
    var lines = [];
    this.resolveCharacter(this.player, lines);
    if (!defeated(this.enemy) && !this.escaped) this.resolveCharacter(this.enemy, lines);
    if (!this.escaped && typeof LT.tickStatuses === "function") {
      var ticks = LT.tickStatuses(this.player).concat(LT.tickStatuses(this.enemy));
      for (var t = 0; t < ticks.length; t++) lines.push(ticks[t]);
    }
    if (!this.escaped && typeof LT.recoverThrownAfterTurn === "function") {
      var recovered = LT.recoverThrownAfterTurn();
      for (var r = 0; r < recovered.length; r++) lines.push(recovered[r]);
    }
    this.lastResolution = lines.join("");
    if (this.escaped) {
      this.finished = "escaped";
      return;
    }
    if (defeated(this.enemy)) {
      this.finished = "victory";
      return;
    }
    if (defeated(this.player)) {
      this.finished = "defeat";
      return;
    }
    if (typeof LT.lowerMoveCooldowns === "function") {
      LT.lowerMoveCooldowns(this.player);
      LT.lowerMoveCooldowns(this.enemy);
    }
    resetAp(this.player);
    this.player.blocking = false;
    this.enemy.blocking = false;
    this.player.resisting = false;
    this.enemy.resisting = false;
    this.turn += 1;
    this.planEnemy();
  };

  LT.combat.resolveCharacter = function (ch, lines) {
    var moves = ch.selectedMoves || [];
    if (!moves.length) {
      lines.push("<p>" + nameOf(ch) + " does nothing.</p>");
      return;
    }
    for (var i = 0; i < moves.length; i++) {
      if (defeated(this.player) || defeated(this.enemy)) break;
      var move = LT.MOVES[moves[i].id];
      if (!move) continue;
      lines.push("<p>" + move.perform(ch, moves[i].target, i) + "</p>");
    }
  };

  LT.combat.escape = function () {
    if (this.escapeChance >= 100 || Math.floor(Math.random() * 100) < this.escapeChance) {
      this.escaped = true;
      this.lastResolution = "<p>You successfully managed to escape!</p>";
      this.finished = "escaped";
      return true;
    }
    this.lastResolution = "<p>You failed to escape!</p>";
    this.player.selectedMoves = [];
    this.endTurn();
    return false;
  };

  LT.combat.finish = function () {
    var result = this.finished;
    var extra = "";
    this.active = false;
    if (result === "victory" && typeof LT.applyCombatVictoryLoot === "function") {
      extra += LT.applyCombatVictoryLoot(this.enemy) || "";
    }
    if (result === "victory" && typeof LT.awardCombatEssences === "function") {
      extra += LT.awardCombatEssences(this.enemy) || "";
    }
    if (result === "victory" && this.onVictory) extra += this.onVictory() || "";
    if (result === "defeat" && this.onDefeat) extra = this.onDefeat() || "";
    if (typeof LT.recoverThrownAfterCombat === "function") LT.recoverThrownAfterCombat();
    if (result === "escaped" && this.onEscape) this.onEscape();
    if (extra) LT.game.textEnd = extra;
    var dest = null;
    if (result === "victory") dest = this.victoryNode;
    else if (result === "defeat") dest = this.defeatNode || this.returnNode;
    else if (result === "escaped") dest = this.returnNode || this.defeatNode;
    if (dest) LT.game.setContent(dest);
    else if (this.returnNode) LT.game.setContent(this.returnNode);
  };

  LT.combat.bar = function (ch, colour) {
    var max = ch.maxHealth || 1;
    var hp = Math.max(0, ch.health || 0);
    var pct = Math.max(0, Math.min(100, (hp / max) * 100));
    var lust = Math.max(0, ch.lust || 0);
    var lustPct = Math.max(0, Math.min(100, (lust / (LT.MAX_LUST || 100)) * 100));
    return (
      "<div class='combatant'>" +
      "<div class='combatant-name'>" +
      nameOf(ch) +
      " · Level " +
      (ch.level || 1) +
      " <b>(<span style='color:" +
      ((ch.remainingAP || 0) === 0 ? LT.Colour.GENERIC_GOOD : LT.Colour.GENERIC_BAD) +
      ";'>" +
      (ch.remainingAP || 0) +
      "</span>/" +
      (ch.maxAP || 3) +
      " AP)</b></div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      pct +
      "%;background:" +
      colour +
      ";'></div></div>" +
      "<div class='muted'>" +
      hp +
      " / " +
      max +
      " health</div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      lustPct +
      "%;background:" +
      LT.Colour.ATTRIBUTE_LUST +
      ";'></div></div>" +
      "<div class='muted'>" +
      lust +
      " / " +
      (LT.MAX_LUST || 100) +
      " lust</div>" +
      "<div class='bar-track'><div class='bar-fill' style='width:" +
      Math.max(0, Math.min(100, ((ch.mana || 0) / (ch.maxMana || 1)) * 100)) +
      "%;background:" +
      LT.Colour.ATTRIBUTE_MANA +
      ";'></div></div>" +
      "<div class='muted'>" +
      (ch.mana || 0) +
      " / " +
      (ch.maxMana || 0) +
      " aura</div>" +
      "<div class='muted'>" +
      (ch.essences || 0) +
      " essences</div>" +
      (typeof LT.statusSummary === "function" && LT.statusSummary(ch)
        ? "<div class='muted'>" + LT.statusSummary(ch) + "</div>"
        : "") +
      "</div>"
    );
  };

  LT.ResponseCombat = function (title, tooltipText, opts) {
    return new LT.Response(title, tooltipText, "combat.fight", function () {
      LT.combat.start(opts);
    });
  };
})();
