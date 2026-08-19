(function () {
  function selectedSlave() {
    return LT.findSlave(LT.game.flags && LT.game.flags.manageSlaveId);
  }

  function backToRoom() {
    var loc = LT.game.player && LT.game.player.location;
    if (loc && loc.place && LT.hasNode("place." + loc.place)) return "place." + loc.place;
    return "place.current";
  }

  function jobList() {
    return [
      "IDLE",
      "CLEANING",
      "SECURITY",
      "LIBRARY",
      "KITCHEN",
      "GARDEN",
      "LAB_ASSISTANT",
      "TEST_SUBJECT",
      "BEDROOM",
      "PUBLIC_STOCKS",
      "PROSTITUTE",
      "MILKING",
      "OFFICE",
      "SPA",
      "SPA_RECEPTIONIST",
      "DINING_HALL",
    ];
  }

  function roomContentOverlay() {
    var up = typeof LT.roomUpgradeAt === "function" ? LT.roomUpgradeAt() : null;
    if (!up) return "";
    var html = "<p>" + up.description + "</p>";
    var home = LT.slavesInRoom(LT.currentRoomKey());
    if (home.length) {
      html += "<p>Housed here: ";
      html += home
        .map(function (s) {
          return "<b>" + s.name + "</b>";
        })
        .join(", ");
      html += ".</p>";
    }
    var working = typeof LT.slavesAtCurrentTile === "function" ? LT.slavesAtCurrentTile() : [];
    if (working.length) {
      html += "<p>Working here: ";
      html += working
        .map(function (s) {
          return "<b>" + s.name + "</b> (" + LT.slaveJobName(s) + ")";
        })
        .join(", ");
      html += ".</p>";
    }
    if (LT.game.flags && LT.game.flags.slavePayFlash) {
      html += "<p>Your slaves earned <b>" + LT.game.flags.slavePayFlash + "</b> flames while you were away.</p>";
      LT.game.flags.slavePayFlash = 0;
    }
    if (LT.game.flags && LT.game.flags.workSex) {
      var rec = LT.findSlave(LT.game.flags.workSex);
      if (rec) html += LT.jobSexText(rec);
    }
    var greet = (typeof LT.slavesAtCurrentTile === "function" ? LT.slavesAtCurrentTile() : []).filter(function (s) {
      return LT.getSlaveJob(s) === "BEDROOM" && LT.hasSlaveJobSetting(s, "BEDROOM", "BEDROOM_GREETING");
    });
    if (greet.length) {
      html += "<p>" + greet.map(function (s) { return "<b>" + s.name + "</b>"; }).join(" and ") + " greet you as you enter.</p>";
    }
    return html;
  }

  LT.houseRoomContent = function (base) {
    var extra = roomContentOverlay();
    return (base || "") + extra;
  };

  LT.slavePresenceResponses = function (list) {
    list = list || [];
    if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
    if (LT.game.flags && LT.game.flags.workSex && typeof LT.findSlave === "function" && LT.findSlave(LT.game.flags.workSex) && typeof LT.ResponseSex === "function") {
      var rec = LT.findSlave(LT.game.flags.workSex);
      list.push(
        LT.ResponseSex("Join in", "Take " + rec.name + " while they are at work.", {
          partner: LT.slaveAsNpc(rec),
          consensual: true,
          playerDom: true,
          postSexNode: backToRoom(),
          startText: "[npc.Name] does not resist.",
        }),
      );
    }
    var here = typeof LT.slavesAtCurrentTile === "function" ? LT.slavesAtCurrentTile() : [];
    var i;
    for (i = 0; i < here.length && i < 4; i++) {
      (function (slave) {
        list.push(
          new LT.Response(slave.name, "Inspect " + slave.name + ".", "house.slave", function () {
            LT.game.flags.manageSlaveId = slave.id;
            LT.game.flags.slaveMenuFrom = backToRoom();
          }),
        );
      })(here[i]);
    }
    return list;
  };

  LT.houseExtraResponses = function (list) {
    list = list || [];
    var place = (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "";
    var up = typeof LT.roomUpgradeAt === "function" ? LT.roomUpgradeAt() : null;
    var can = typeof LT.canManageHouse === "function" && LT.canManageHouse();

    if (LT.isEmptyHouseRoom && LT.isEmptyHouseRoom(place) && !up && can) {
      list.push(new LT.Response("Manage room", "Convert this empty room into slave quarters or a workplace.", "house.manage"));
    }
    if (typeof LT.ensureDungeonCell === "function") LT.ensureDungeonCell();
    if (up) {
      list.push(new LT.Response("Occupancy", "Inspect this room and the people assigned here.", "house.occupancy"));
      if (up.id === "OFFICE") {
        list.push(new LT.Response("Occupancy ledger", "Review every slave and converted room in the house.", "house.ledger"));
      }
    }
    var pt = (LT.game.player && LT.game.player.location && LT.game.player.location.place) || "";
    if (pt === "LILAYA_HOME_DUNGEON_CELL") {
      list.push(new LT.Response("Occupancy", "House a slave in this dungeon cell.", "house.occupancy"));
    }
    if (place === "LILAYA_HOME_ROOM_PLAYER" && LT.ownedSlaves && LT.ownedSlaves().length) {
      list.push(new LT.Response("Your slaves", "Review the slaves registered to you.", "house.slaves"));
    }
    return LT.slavePresenceResponses(list);
  };

  LT.defineNode({
    id: "house.manage",
    ui: "dialogue",
    title: "Convert room",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return (
        "<p>Rose can have this empty room converted. Official prices:</p><ul>" +
        "<li><b>Slave's Room</b> — 2000. Houses one slave.</li>" +
        "<li><b>Double Slave Room</b> — 3500. Houses two slaves. Can also upgrade an existing slave room.</li>" +
        "<li><b>Quadruple Slave Room</b> — 6000. Houses four slaves. Can also upgrade a single or double slave room.</li>" +
        "<li><b>Slave lounge</b> — 5000. Idle slaves with House Freedom may come here to relax.</li>" +
        "<li><b>Guest Room</b> — 2000. Houses one guest.</li>" +
        "<li><b>Office</b> — 8000. One office. Four workers. Occupancy ledger.</li>" +
        "<li><b>Milking Room</b> — 10000. Eight stalls.</li>" +
        "<li><b>Dining Hall</b> — 6000. Waiters and waitresses serve here.</li>" +
        "<li><b>Spa</b> — 1500000. One only, cannot be removed.</li>" +
        "</ul><p>You have <b>£" +
        ((LT.game.player && LT.game.player.money) || 0) +
        "</b>.</p>"
      );
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Leave the room as it is.", backToRoom())];
      var ids = typeof LT.availableConvertIds === "function" ? LT.availableConvertIds() : ["SLAVE_ROOM", "GUEST_ROOM", "OFFICE", "MILKING_ROOM", "SPA"];
      var i;
      for (i = 0; i < ids.length; i++) {
        (function (id) {
          var up = LT.HOUSE_UPGRADES[id];
          var title = up.name + " (" + up.cost + ")";
          var blocked = "";
          if (up.unique && LT.countUpgrade(up.id)) blocked = "There is already a " + up.name.toLowerCase() + " in the house.";
          if (!blocked && LT.getMoney() < up.cost) blocked = "You need " + up.cost + " flames.";
          if (blocked) {
            list.push(new LT.Response(title, blocked, null).disable(blocked));
          } else {
            list.push(
              new LT.Response(
                title,
                up.cost ? "Pay " + up.cost + " flames to convert this room." : "Convert this room.",
                id === "ARTHUR_ROOM" ? "lab.arthurInstall" : backToRoom(),
                function () {
                  LT.game.textStart = LT.convertRoom(id);
                  if (id === "ARTHUR_ROOM" && typeof LT.ensureArthur === "function") {
                    var a = LT.ensureArthur();
                    var loc = LT.game.player && LT.game.player.location;
                    if (a && loc) a.location = { world: loc.world, place: "LILAYA_HOME_ARTHUR_ROOM", x: loc.x, y: loc.y };
                  }
                },
              ),
            );
          }
        })(ids[i]);
      }
      return list;
    },
  });

  LT.defineNode({
    id: "house.occupancy",
    ui: "dialogue",
    title: function () {
      var up = LT.roomUpgradeAt();
      return (up && up.name) || "Room";
    },
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      if (typeof LT.ensureDungeonCell === "function") LT.ensureDungeonCell();
      var up = LT.roomUpgradeAt();
      var html = up ? "<p>" + up.description + "</p>" : "<p>This room has not been converted.</p>";
      if (up && up.extras) {
        Object.keys(up.extras).forEach(function (id) {
          if (LT.roomHasExtra(null, id)) html += "<p>" + up.extras[id].description + "</p>";
        });
      }
      var housed = LT.slavesInRoom(LT.currentRoomKey());
      if (!housed.length) html += "<p>No one is housed here.</p>";
      else {
        html += "<ul>";
        housed.forEach(function (s) {
          html += "<li><b>" + s.name + "</b> — " + LT.slaveJobName(s) + "</li>";
        });
        html += "</ul>";
      }
      if (up && up.id === "MILKING_ROOM") {
        var tank = LT.milkingTank(LT.currentRoomKey());
        if (tank) {
          html +=
            "<p>Stored fluids: <b>" +
            (tank.milk || 0) +
            "</b>ml milk, <b>" +
            (tank.cum || 0) +
            "</b>ml cum, <b>" +
            (tank.girlcum || 0) +
            "</b>ml girlcum.</p>";
        }
      }
      if (up && up.id === "SLAVE_LOUNGE") {
        var relaxing = LT.ownedSlaves().filter(function (s) {
          var dest = LT.idleDestination(s);
          return dest && dest.key === LT.currentRoomKey();
        });
        if (relaxing.length) {
          html += "<p>Relaxing here: " + relaxing.map(function (s) { return "<b>" + s.name + "</b>"; }).join(", ") + ".</p>";
        }
      }
      var events = typeof LT.slaveEvents === "function" ? LT.slaveEvents() : [];
      if (events.length) {
        html += "<p><b>Recent slave events</b></p><ul>";
        events.slice(0, 4).forEach(function (ev) {
          html += "<li>" + ev + "</li>";
        });
        html += "</ul>";
      }
      return html;
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Step back into the room.", backToRoom())];
      var up = LT.roomUpgradeAt();
      if (up && up.home) {
        LT.ownedSlaves().forEach(function (s) {
          if (s.home === LT.currentRoomKey()) {
            list.push(
              new LT.Response("Unhouse " + s.name, "Send " + s.name + " back to Slavery Administration.", "house.occupancy", function () {
                s.home = "";
                LT.placeSlave(s);
                LT.game.textStart = "<p>" + s.name + " is no longer housed here.</p>";
              }),
            );
            return;
          }
          list.push(
            new LT.Response(
              "House " + s.name,
              "Move " + s.name + " into this room.",
              "house.occupancy",
              function () {
                var err = LT.assignSlaveHome(s, LT.currentRoomKey());
                LT.game.textStart = err ? "<p>" + err + "</p>" : "<p>" + s.name + " will live here.</p>";
              },
            ),
          );
        });
      }
      if (up) {
        Object.keys(LT.HOUSE_UPGRADES).forEach(function (id) {
          if (!LT.canUpgradeRoom(up.id, id)) return;
          var next = LT.HOUSE_UPGRADES[id];
          var title = next.name + " (" + next.cost + ")";
          var blocked = LT.getMoney() < next.cost ? "You need " + next.cost + " flames." : "";
          if (blocked) list.push(new LT.Response(title, blocked, null).disable(blocked));
          else {
            list.push(
              new LT.Response(title, "Pay " + next.cost + " flames to expand this room.", "house.occupancy", function () {
                LT.game.textStart = LT.convertRoom(id);
              }),
            );
          }
        });
        if (up.extras) {
          Object.keys(up.extras).forEach(function (id) {
            var extra = up.extras[id];
            if (LT.roomHasExtra(null, id)) {
              list.push(
                new LT.Response("Remove " + extra.name, extra.description, "house.occupancy", function () {
                  LT.game.textStart = LT.removeRoomExtra(id);
                }),
              );
              return;
            }
            var title = extra.name + " (" + extra.cost + ")";
            var blocked = "";
            if (extra.exclusive && LT.roomHasExtra(null, extra.exclusive)) {
              blocked = "The '" + (up.extras[extra.exclusive] && up.extras[extra.exclusive].name) + "' upgrade must be removed first.";
            }
            if (!blocked && LT.getMoney() < extra.cost) blocked = "You need " + extra.cost + " flames.";
            if (blocked) list.push(new LT.Response(title, blocked, null).disable(blocked));
            else {
              list.push(
                new LT.Response(title, extra.description, "house.occupancy", function () {
                  LT.game.textStart = LT.addRoomExtra(id);
                }),
              );
            }
          });
        }
        if (up.id === "MILKING_ROOM") {
          var tank = LT.milkingTank(LT.currentRoomKey());
          var stored = tank ? tank.milk + tank.crotchMilk + tank.cum + tank.girlcum : 0;
          if (stored > 0) {
            list.push(
              new LT.Response("Sell fluids", "Sell all stored fluids from this milking room.", "house.occupancy", function () {
                var pay = LT.sellMilkingTank(LT.currentRoomKey());
                LT.game.textStart = "<p>You sell the stored fluids for <b>" + pay + "</b> flames.</p>";
              }),
            );
          }
        }
      }
      return list;
    },
  });

  LT.defineNode({
    id: "house.ledger",
    ui: "dialogue",
    title: "Occupancy ledger",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var html = "<p>The occupancy ledger lists every converted room and every slave registered to you.</p>";
      var rooms = LT.houseRooms();
      var keys = Object.keys(rooms);
      if (!keys.length) html += "<p>No rooms have been converted yet.</p>";
      else {
        html += "<ul>";
        keys.forEach(function (key) {
          var up = LT.roomUpgradeAt(key);
          html += "<li><b>" + ((up && up.name) || key) + "</b> — " + key + "</li>";
        });
        html += "</ul>";
      }
      var owned = LT.ownedSlaves();
      if (!owned.length) html += "<p>You do not own any slaves.</p>";
      else {
        html += "<ul>";
        owned.forEach(function (s) {
          html +=
            "<li><b>" +
            s.name +
            "</b> — " +
            (s.fullRace || s.raceName) +
            ", " +
            LT.slaveJobName(s) +
            (s.home ? ", housed" : ", unhoused") +
            "</li>";
        });
        html += "</ul>";
      }
      return html;
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Close the ledger.", backToRoom())];
      LT.ownedSlaves().forEach(function (s) {
        list.push(
          new LT.Response(s.name, "Inspect " + s.name + ".", "house.slave", function () {
            LT.game.flags.manageSlaveId = s.id;
          }),
        );
      });
      return list;
    },
  });

  LT.defineNode({
    id: "house.slaves",
    ui: "dialogue",
    title: "Your slaves",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var owned = LT.ownedSlaves();
      if (!owned.length) return "<p>You do not own any slaves.</p>";
      var html = "<p>These are the slaves currently registered to you.</p>";
      owned.forEach(function (s) {
        html +=
          "<div class='container-full-width'>" +
          LT.portraitHtml(s.id) +
          "<p><b>" +
          s.name +
          "</b> — " +
          (s.fullRace || s.raceName) +
          "<br/>Now: " +
          LT.slaveJobName(s) +
          " · " +
          LT.slaveHoursSummary(s) +
          (s.home ? " · housed" : " · still at Administration") +
          "<br/>Affection " +
          Math.round(s.aff || 0) +
          "</p></div>";
      });
      return html;
    },
    getResponses: function () {
      var from = LT.game.flags && LT.game.flags.slaveMenuFrom;
      var back = from || backToRoom();
      var list = [new LT.Response("Back", "Close the list.", back)];
      LT.ownedSlaves().forEach(function (s) {
        list.push(
          new LT.Response(s.name, "Inspect " + s.name + ".", "house.slave", function () {
            LT.game.flags.manageSlaveId = s.id;
          }),
        );
      });
      return list;
    },
  });

  LT.defineNode({
    id: "house.slave",
    ui: "dialogue",
    title: function () {
      var s = selectedSlave();
      return (s && s.name) || "Slave";
    },
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var s = selectedSlave();
      if (!s) return "<p>That slave is no longer registered to you.</p>";
      var nowId = LT.getSlaveJob(s);
      var job = LT.SLAVE_JOBS[nowId] || LT.SLAVE_JOBS.IDLE;
      var stam = LT.dailySlaveStamina(s);
      var over = LT.overworkLevel(s);
      var overText = over === 3 ? "severely overworked" : over === 2 ? "overworked" : over === 1 ? "slightly overworked" : "rested";
      return (
        LT.portraitHtml(s.id) +
        "<p><b>" +
        s.name +
        "</b> is a " +
        (s.fullRace || s.raceName) +
        " slave.</p>" +
        "<p>Now: <b>" +
        LT.slaveJobName(s) +
        "</b>. " +
        job.description +
        "</p>" +
        "<p>Today: " +
        LT.slaveHoursSummary(s) +
        "</p>" +
        "<p>Daily stamina <b>" +
        stam +
        "/" +
        LT.SLAVE_BASE_STAMINA +
        "</b> (" +
        overText +
        ").</p>" +
        "<p>" +
        (s.home ? "Housed in a converted room." : "Still listed against the cells at Slavery Administration.") +
        " Affection " +
        Math.round((s.aff || 0) * 10) / 10 +
        ". Obedience " +
        Math.round((s.obe || 0) * 10) / 10 +
        ". Lifetime earnings " +
        (s.earned || 0) +
        " flames.</p>" +
        "<p>Behaviour: " +
        LT.slaveBehaviourName(s) +
        ". " +
        (LT.hasSlavePermission(s, "GENERAL_HOUSE_FREEDOM") ? "House freedom granted." : "Confined to assigned rooms.") +
        " " +
        (LT.hasSlavePermission(s, "SEX_INITIATE_PLAYER") ? "Allowed to use you for relief." : "Not allowed to initiate sex with you.") +
        " " +
        (LT.hasSlavePermission(s, "SEX_INITIATE_SLAVES") ? "May initiate sex with other slaves." : "") +
        "</p>" +
        (typeof LT.slaveEvents === "function" && LT.slaveEvents().length
          ? "<p><b>Recent events</b></p><ul>" +
            LT.slaveEvents()
              .slice(0, 3)
              .map(function (ev) {
                return "<li>" + ev + "</li>";
              })
              .join("") +
            "</ul>"
          : "")
      );
    },
    getResponses: function () {
      var s = selectedSlave();
      var list = [new LT.Response("Back", "Return to the list.", "house.slaves")];
      if (!s) return list;
      list.push(new LT.Response("Jobs & hours", "Assign jobs to each hour of the day.", "house.job"));
      list.push(new LT.Response("Permissions", "Set official behaviour, general, and sex permissions.", "house.perms"));
      list.push(
        new LT.Response(LT.getCharacterImage(s.id) ? "Change image" : "Set image", "Attach or replace a portrait from a file inside the game folder.", "house.slave", function () {
          var ok = LT.promptCharacterImage(s.id);
          LT.game.textStart = ok
            ? "<p>Portrait updated.</p>"
            : "<p>That was not a usable http(s) image link.</p>";
        }),
      );
      if (typeof LT.ResponseSex === "function") {
        list.push(
          LT.ResponseSex("Sex", "Use " + s.name + ".", {
            partner: LT.slaveAsNpc(s),
            manager: (function () {
              var up = typeof LT.roomUpgradeAt === "function" ? LT.roomUpgradeAt() : null;
              return up && up.id === "MILKING_ROOM" ? "milking_stall" : "generic";
            })(),
            consensual: true,
            playerDom: true,
            postSexNode: "house.slave",
            startText: "[npc.Name] waits for your instruction.",
          }),
        );
      }
      return list;
    },
  });

  function selectedJobId() {
    return (LT.game.flags && LT.game.flags.slaveryJobSelected) || "CLEANING";
  }

  function jobButton(job, rec, selected) {
    var name = rec.feminine === false ? job.nameM : job.name;
    var cls = "cosmetics-button" + (selected ? " active" : "");
    var style = "color:" + (job.colour || "#ddd") + ";" + (selected ? "border-color:" + (job.colour || "#999") + ";" : "");
    return (
      '<div data-act="job:' +
      job.id +
      '" class="' +
      cls +
      '" style="' +
      style +
      '" title="' +
      job.description.replace(/"/g, "'") +
      '">' +
      name +
      "</div>"
    );
  }

  function hourButton(rec, hour, selectedId) {
    var id = LT.getSlaveJob(rec, hour);
    var job = LT.SLAVE_JOBS[id] || LT.SLAVE_JOBS.IDLE;
    var check = selectedId === "IDLE" ? { ok: true } : LT.jobHourAvailable(selectedId, rec, hour);
    var can = check.ok || id === selectedId;
    var label = String(hour).padStart(2, "0") + ":00";
    var style = "background:" + (job.colour || "#4a4a4a") + ";color:#111;border-color:" + (job.colour || "#333") + ";";
    if (!can && selectedId !== "IDLE") style += "opacity:0.45;";
    return (
      '<div data-act="hour:' +
      hour +
      '" class="slave-hour' +
      (can ? "" : " disabled") +
      '" style="' +
      style +
      '">' +
      label +
      "</div>"
    );
  }

  LT.defineNode({
    id: "house.job",
    ui: "dialogue",
    title: function () {
      var s = selectedSlave();
      return s ? s.name + "'s Job" : "Jobs & hours";
    },
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var s = selectedSlave();
      if (!s) return "<p>That slave is no longer registered to you.</p>";
      if (!LT.game.flags.slaveryJobSelected) LT.game.flags.slaveryJobSelected = s.job && s.job !== "IDLE" ? s.job : "CLEANING";
      var selected = selectedJobId();
      var selJob = LT.SLAVE_JOBS[selected] || LT.SLAVE_JOBS.IDLE;
      var stam = LT.dailySlaveStamina(s);
      var html = "<p>Select a job, then click hours to assign it. Clicking an hour that already has that job clears it to Idle.</p>";
      html += "<div class='cosmetics-inner-container full'><b>Available Jobs</b><br/>";
      jobList().forEach(function (id) {
        html += jobButton(LT.SLAVE_JOBS[id], s, selected === id);
      });
      html += "</div><div class='cosmetics-inner-container full'><b>Time Slots</b><div class='slave-hours'>";
      var hour;
      for (hour = 0; hour < 24; hour++) html += hourButton(s, hour, selected);
      html +=
        "</div><p><i>Current daily stamina: <b style='color:" +
        (stam >= 0 ? "#6fd4e3" : "#e74c3c") +
        ";'>" +
        stam +
        "</b>/" +
        LT.SLAVE_BASE_STAMINA +
        "</i></p>";
      Object.keys(LT.SLAVE_JOB_HOURS).forEach(function (id) {
        var p = LT.SLAVE_JOB_HOURS[id];
        html += '<div data-act="preset:' + id + '" class="cosmetics-button" title="' + p.description.replace(/"/g, "'") + '">' + p.name + "</div>";
      });
      html += "</div><p>Selected: <b style='color:" + (selJob.colour || "#ddd") + ";'>" + (s.feminine === false ? selJob.nameM : selJob.name) + "</b>. " + selJob.description + "</p>";
      html += "<p>" + LT.slaveHoursSummary(s) + "</p>";
      var spec = LT.SLAVE_JOB_SETTINGS[selected];
      if (spec) {
        html += "<div class='cosmetics-inner-container full'><b>Job settings</b><br/>";
        (spec.mutual || []).forEach(function (set) {
          if ((set.id === "SPA_SAUNA" && !LT.findUpgradeKey("SPA")) || (set.id === "SPA_SAUNA" && !LT.roomHasExtra(LT.findUpgradeKey("SPA"), "SPA_SAUNA"))) {
            /* still show; official greys them until built */
          }
          var on = LT.hasSlaveJobSetting(s, selected, set.id);
          html +=
            '<div data-act="jset:' +
            selected +
            ":" +
            set.id +
            '" class="cosmetics-button' +
            (on ? " active" : "") +
            '" style="color:' +
            (set.colour || "#ddd") +
            ';" title="' +
            set.description.replace(/"/g, "'") +
            '">' +
            set.name +
            "</div>";
        });
        if (spec.exclusive) {
          Object.keys(spec.exclusive).forEach(function (groupName) {
            html += "<p><i>" + groupName + "</i></p>";
            spec.exclusive[groupName].forEach(function (set) {
              var on = LT.hasSlaveJobSetting(s, selected, set.id);
              html +=
                '<div data-act="jsetx:' +
                selected +
                ":" +
                groupName +
                ":" +
                set.id +
                '" class="cosmetics-button' +
                (on ? " active" : "") +
                '" style="color:' +
                (set.colour || "#ddd") +
                ';" title="' +
                set.description.replace(/"/g, "'") +
                '">' +
                set.name +
                "</div>";
            });
          });
        }
        html += "</div>";
      }
      return html;
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the slave.", "house.slave")];
    },
  });

  LT.defineNode({
    id: "house.perms",
    ui: "dialogue",
    title: "Permissions",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var s = selectedSlave();
      if (!s) return "<p>That slave is no longer registered to you.</p>";
      var html = "<p>Official permission groups. Behaviour is exclusive. The others can be combined.</p>";
      Object.keys(LT.SLAVE_PERMISSIONS).forEach(function (gid) {
        var group = LT.SLAVE_PERMISSIONS[gid];
        html += "<div class='cosmetics-inner-container full'><b>" + group.name + "</b><br/>";
        group.settings.forEach(function (set) {
          var on = LT.hasSlavePermission(s, set.id);
          html +=
            '<div data-act="perm:' +
            gid +
            ":" +
            set.id +
            '" class="cosmetics-button' +
            (on ? " active" : "") +
            '" title="' +
            set.description.replace(/"/g, "'") +
            '">' +
            set.name +
            "</div>";
        });
        html += "</div>";
      });
      return html;
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the slave.", "house.slave")];
    },
  });

  function handleManageAct(act) {
    var s = selectedSlave();
    if (!s || !act) return false;
    if (act.indexOf("job:") === 0) {
      LT.game.flags.slaveryJobSelected = act.slice(4);
      return true;
    }
    if (act.indexOf("hour:") === 0) {
      LT.setSlaveJobHour(s, Number(act.slice(5)), selectedJobId());
      return true;
    }
    if (act.indexOf("preset:") === 0) {
      LT.applySlaveHoursPreset(s, act.slice(7), selectedJobId());
      return true;
    }
    if (act.indexOf("perm:") === 0) {
      var parts = act.split(":");
      LT.setSlavePermission(s, parts[1], parts[2]);
      return true;
    }
    if (act.indexOf("jsetx:") === 0) {
      var bits = act.split(":");
      var spec = LT.SLAVE_JOB_SETTINGS[bits[1]];
      var ids = spec && spec.exclusive && spec.exclusive[bits[2]] ? spec.exclusive[bits[2]].map(function (x) { return x.id; }) : [];
      LT.setSlaveJobSetting(s, bits[1], bits[3], ids);
      return true;
    }
    if (act.indexOf("jset:") === 0) {
      var setBits = act.split(":");
      LT.setSlaveJobSetting(s, setBits[1], setBits[2]);
      return true;
    }
    return false;
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest("[data-act]");
      if (!btn || btn.classList.contains("disabled")) return;
      var node = LT.game && LT.game.currentNode;
      if (!node || (node.id !== "house.job" && node.id !== "house.perms")) return;
      if (!handleManageAct(btn.getAttribute("data-act"))) return;
      LT.game.setContent(node);
    });
  }

  LT.defineNode({
    id: "house.image",
    ui: "dialogue",
    title: "Character image",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var id = (LT.game.flags && LT.game.flags.imageTarget) || "player";
      var url = LT.getCharacterImage(id);
      return (
        "<p>Portraits must be a file inside this game folder, such as <code>images/13-Morwyn Blackhorn.png</code>. Paths that leave the folder, or http(s) / data links, are refused.</p>" +
        (url
          ? (typeof LT.artworkHtml === "function" ? LT.artworkHtml(id) : LT.portraitHtml(id)) +
            "<p class='muted'>" +
            url +
            "</p>"
          : "<p>No image is set.</p>")
      );
    },
    getResponses: function () {
      var id = (LT.game.flags && LT.game.flags.imageTarget) || "player";
      var back = (LT.game.flags && LT.game.flags.imageBack) || "phone.menu";
      return [
        new LT.Response("Back", "Leave the portrait as it is.", back),
        new LT.Response(LT.getCharacterImage(id) ? "Change image" : "Set image", "Set a portrait from a file inside the game folder.", "house.image", function () {
          var ok = LT.promptCharacterImage(id);
          LT.game.textStart = ok
            ? "<p>Portrait updated.</p>"
            : "<p>Use a path inside this folder, such as images/name.png. Links and paths that leave the folder are refused.</p>";
        }),
        new LT.Response("Clear image", "Remove the saved link.", "house.image", function () {
          LT.setCharacterImage(id, "");
          LT.game.textStart = "<p>Portrait cleared.</p>";
        }),
      ];
    },
  });
})();
