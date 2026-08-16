# Lilith's Throne HTML — changelog

Rebuild of Innoxia's **Lilith's Throne 0.4.10** as a double-clickable HTML/CSS/JS app in this folder. Not Twine. Not Java-in-the-browser.

Version numbers are for this rebuild only. They do not match official Java **0.4.10**.

**Numbering rule:** bump `LT.VERSION` only when a public zip ships. Do not increment for each work session. Last public zip before this one was **0.37.1**. Current ship is **0.38.0**.

Story policy through **1-G**: official text, thin runtime, converters for XML/maps, stub sex and combat. Systems port starts at **1-H**.

---

## 0.38.0 — 2026-08-16

Everything built after the 0.37.1 public zip, shipped as one version.

**World, time, museum**

- World map tiles use official place colours and landmark icons instead of a grey grid.
- The calendar date advances from the official 2019 start. Weather follows the official cycle (including the 5-hour arrival storm and 8–12 hour arcane storms). Storm stripes only hit official dangerous street tiles.
- Museum wardrobe stays on-screen instead of being shoved off the right edge.

**Enchanting**

- Combat and orgasm absorb official essences. First absorption starts **Essences and Enchantments**; Lilaya's lesson unlocks Inventory → **Enchant**.
- Clothing: up to **3** effects (attributes + sealing). Official essence cost. Sealed clothing costs `5 / 25 / 100 / 500` to force off.
- Racial drinks: up to **8** body effects; drink to apply official size steps. Unenchanted drinks still do a whole-body race sip.
- Weapons: up to **8** attribute/damage effects. Equip to apply. No sealing on weapons.
- Lilaya's extractor bottles essences. Nyan's enchanted rack has a real Minor Boost physique effect.

**Status, loot, NPC gear**

- Left-panel status icons: weather, Well Rested, Frustrated / Strengthened aura, combat spell statuses. Outdoor storms double essence gains.
- Combat wins use official XP (`level × 2`), money, and one loot roll. Brax 2500 / 8 essences; Amber 5000 plus an item. Level cap **50**.
- Alley muggers and prostitutes spawn dressed and carry a 2–5 item bag. After a win, **Inventory** lets you strip clothes, take weapons, and empty the bag.

**Character, creator, demon Transform, pregnancy**

- Official-shaped `body` (parts, orifices, 24 genders, fetishes, tattoos, piercings, pregnancy fields). Saved in `.ltjson`.
- Museum Makeup / Piercings / Tattoos / Extra hair write those fields.
- Phone → **Transform** is the official BodyChanging menu (Core through Save/Load). Humans cannot use it. **Lilith's Gift** unlocks it for demons.
- Pregnancy: official chance `0.1 + virility/200 + fertility/200`. Risk of pregnancy 4–8 hours, then pregnant / heavily pregnant / ready to give birth. First time starts **Lilaya knows best**. Lab **Pregnancy** uses official birthing text.

**Dominion encounter tables**

- Streets, patrolled alleys, and parks use the official storm-street table (**15%** while `MAGIC_STORM`). Slaver Alley exterior, the plaza, and the boulevard do not ambush.
- Harpy Nest walkways use **12%** attack + **4%** find-item. Explore / Look for trouble force-rolls. Storm harpies use the official storm XML.
- Storm attackers are ordinary Dominion races (not dark-alley demons) and refuse money. Found items are official Harpy Perfume or Bubblegum Lollipop.

**Slave timetable**

- Each slave has a 24-hour job table. Day shift / Day shift + / Night shift / Night shift + / 24 hours / None match official start hours and lengths.
- Pay, placement, and workplace sex use the job at the current hour. Lab jobs refuse 22:00–05:00. Caps are per hour.
- Daily stamina starts at **24**. Overwork 1/2/3 at `-1…-9` / `-10…-19` / `-20+` apply official extra affection loss.
- Permissions are official Behaviour / General / Sex groups (House Freedom, Use You, Sex Toy, breeding flags, and so on).

---

## 0.37.1 — 2026-08-15

**Debug 03**

- Response slot 0 no longer copies the first action (Agree/Agree). Empty unless it is a real Back / Next page.
- Museum wardrobe UI is at the top of the clothing screen and can be clicked.
- Map tiles stay square on non-square maps. Icons are not draggable.
- Starting money is official **5000**.
- Left-panel stat icons are smaller.
- Dangerous tiles (alleys always, streets during an arcane storm) use the official diagonal stripe.
- Kate sells **Lipstick**.
- Defeat still offers a Defeat button after combat ends, even if the fight session already closed.
- Birthday month no longer drops displayed age to 17. `setAge` now keeps the character at least 18 after the start date.

---

## 0.37.0 — 2026-08-15

**House occupancy, slave jobs, portraits**

- Empty window / garden rooms can be converted after Lilaya's Accommodation talk or a slaver license: **Slave's Room 2000**, **Guest Room 2000**, **Office 8000** (one), **Milking Room 10000**, **Spa 1,500,000** (one, cannot remove). Official descriptions.
- Owned slaves can be housed, given an official job (idle, maid, security, library, kitchen, garden, lab assistant, test subject, bedroom, public stocks, prostitute, milking, office, spa / spa clerk), and given behaviour / sex / house-freedom permissions.
- Jobs pay official hourly flames between 06:00–22:00. Visiting a slave at work has a **15%** chance of the job's main sex event.
- Finch **Slave Manager**, bedroom **Your slaves**, phone **Slaves**, and the office **Occupancy ledger** all open the same inspect screen.
- Keeping Scarlett registers her as a slave; freeing her removes her.
- Any character can have a portrait set or changed from an **http(s) image URL**. Only the link is saved (max 400 characters). `data:` URLs are refused.

---

## 0.36.0 — 2026-08-15

**Nyan, Kate, Ashley, Bunny/Loppy, whoring rooms**

- **Nyan's Clothing Emporium** (09:00–17:00): official exterior / greeting. Female / male / unisex racks sell the existing clothing catalog at 1.5×. Bought pieces go to the wardrobe and can be equipped.
- **Succubi's Secrets:** official enter/main text. Hair / Eyes / Cosmetics cost official **200**. Kate also sells lipstick.
- **Dream Lover:** official exterior / entry / shelves. Sells a dildo, vibrator, and gift box (usable from inventory).
- **Bunny** 1500, **Loppy** 2000 / submissive 2500. Official room and sex wrap.
- Licensed **first-floor** bedrooms: Wait submissive / dominant. Client pays official **2000**. Ground-floor rooms tell you to go upstairs.

---

## 0.35.0 — 2026-08-15

**Alley enslavement, collars, shops, licenses**

- After an alley win, **Enslave** is available if you have a slaver license and a **metal collar** (official 2500, 3750 at Finch). Official `characters/enslavement` success/fail text. Demons cannot be enslaved. The target is teleported to Slavery Administration for pickup.
- Finch **Trade** sells collars. **Collect slaves** takes ownership. **Slave Manager** lists owned slaves (no jobs yet).
- **Angel's Kiss** office sells the official **5000** prostitution license. Enter from the Red-Light District tile.
- **Ralph's Snacks** (06:00–22:00) and Vicky **Transformations** sell official race drinks (Feline's Fancy, Canine Crush, Wolf Whiskey, Equine Cider, …) plus rejuvenation potion / Angel's Nectar. Drink from inventory to apply a thin race change.
- Slaver license buy at Administration was already in (letter + 5000).

---

## 0.34.0 — 2026-08-15

**Sex: remaining generic positions, acts, clothing slots**

- Positioning adds official GenericPositioning moves: Face-to-wall, sixty-nine (top/bottom), cowgirl (riding/bottom), sit on face / face sitting, mating press, switch to sitting, standing receive oral, perform oral. Back-to-wall / missionary / doggy unchanged.
- Sex tab adds official NORMAL **paizuri**, **intercrural**, **hotdogging**, **footjob**, and **clit play**. Self adds pinch nipples and finger fuckable nipples.
- **Manage clothing** opens a slot submenu (Pull up / Shift aside / Pull down / Remove per equipped piece, plus Pull clothing aside). Coverage is derived from clothing slots. Response pages cycle on **0** when a tab has more than 15 actions.
- Tails, tentacles, toys, stocks, milking stalls, and glory holes are still out (missing anatomy or furniture).
- Still two sex files.

---

## 0.33.0 — 2026-08-15

**Sex v2: anal, nipple, Self, positions**

- Sex tab adds official **NORMAL** start / ongoing / stop for anal fingering, anal, anilingus, kiss nipples, plus receive buttons. Nipple fingering / nipple-fuck only if the partner has fuckable nipples (Lilaya, Amber).
- **Self** tab: Finger herself, stroke cock, self anal fingering. One ongoing at a time; the partner will not overwrite a Self act.
- **Positioning:** official **Missionary** (Lying down), **Doggy-style [npc2.herHim]** (All fours), **Back-to-[pc.wall]** (returns to Standing).
- Still two sex files (`sex.js` + `sexNodes.js`). No new clothing zipper, pregnancy, or extra positions.

---

## 0.32.0 — 2026-08-15

**Story sex on the main path**

- **Lilaya's tests:** official first-time chain ('Tests' → Open your mouth → Let it happen) and repeat Tests. After-sex uses official orgasm / no-orgasm lab wrap.
- **Brax:** Dominate / Submit after a win. After spit, official **Dominated** (no swallow TF). Uniforms still follow victory sex.
- **Amber:** Use / Submit after a win; **Used** after a loss. Official Java start and after-sex lines. House interior still not in.
- Non-con scenes allow **Stop sex** after anyone has orgasmed once.

---

## 0.31.0 — 2026-08-15

**Prologue sex + Debug 02**

- Museum **Dominant / Submissive** start the sex kernel with official lead-in XML. After-sex uses the official satisfied / not-satisfied lines from whether the partner orgasmed.
- Map clicks cannot leave a tile once a fight or sex scene has locked travel (NESW was already locked).
- Alley attackers can roll as **prostitutes** (~20%). Official greeting, Leave, Dominant / Submissive at official price (`max(150, floor(modifier×50)×10)`). Storms are free.
- Mugger **Offer body** is live if they are attracted; official refuse line if not. Victory / defeat Sex is live when they are attracted.

---

## 0.30.0 — 2026-08-15

**Sex: finger, oral, PIV, orgasm**

- Sex tab now has official **NORMAL** start / ongoing / stop for fingering, handjob, cunnilingus, blowjob, and penis→vagina, plus the matching receive buttons (Get fingered, Get fucked, …).
- **Grope breasts** is a one-shot (works through clothes). Genital acts need **Manage clothing** first.
- Arousal uses official values (`TWO_LOW` / `THREE_NORMAL` / `FOUR_HIGH`). At **100**, the only sex action is **Orgasm** (official climax lines). Arousal resets; the scene continues.
- Partner AI: orgasm if ready, else keep the current act, else start PIV / finger / oral / kiss.
- First PIV uses the official virgin line and clears the receiver's virgin flag.
- Story scenes stay stubbed until 0.31+.

---

## 0.29.0 — 2026-08-15

**Sex kernel**

- `LT.sex` session: one player action, then the partner acts. No AP.
- `sex.scene` uses official tabs **Sex / Self / Positioning / Misc**, arousal + lust bars, travel disabled.
- `LT.ResponseSex` starts a scene. Consensual title is `Sex: Standing`; non-con is `Non-consensual Sex: …`.
- v1 actions (official names, arousal values, NORMAL kiss lines): **Start kissing / Kiss / Stop kissing**, **Manage clothing** (thin expose flags), **Do nothing**, **Stop sex** (consensual only).
- Arousal 0–100 with official `ArousalIncrease` numbers (`ZERO_NONE` 0.1 … `FIVE_EXTREME` 5).
- Partner AI: start a kiss, then keep kissing. Story scenes stay stubbed until 0.31+.

---

## 0.28.0 — 2026-08-15

**Combat surface: tease options, spell books, all-out strike**

- **Tease** opens a Tease tab. Basic Tease uses official seduction lines. Body-part specials: breasts / cock / pussy (from anatomy), plus official oral and dominant teases. Fetish teases deal official base **3** lust.
- **Spell books** are official items. Arcane Arts sells the school starters we support (Ice Shard 2500, Flash 5000, Cloak 10000, …). Buy at 1.5×. **Read** in inventory to learn the spell; the book is consumed.
- **All-out strike** (2 AP, cooldown 2): official both-hands attack. Two-handers only swing the main weapon.

---

## 0.27.0 — 2026-08-15

**Debug 01: travel, time, UI, storms, starting spells**

- Scrollbars match the official dark thumb (`#444`) on a transparent track.
- Enforcer HQ: map clicks now respect the pass lock. The staff entrance is no longer public; interior tiles still need Candi's pass.
- Dominion exits show official Enforcer-watch text. **World travel** stays disabled until a world map is discovered (not in this slice).
- Character creation: official **Random** / **Random Surname** (human name triplets + surnames).
- Loading a save leaves the save/load screen and returns to the in-game place.
- Top-left Health / Aura / Experience bars show current / max.
- Main menu has a stub **Mod menu**.
- Alley ambushes already fire on tile enter (15%). Arcane storms can start while time passes; storm-struck Dominion streets can ambush the same way, and storm conditionals parse.
- New games know **no spells**. Learn them later (or grant in tests).
- Night map vignette after 18:00, stronger after 21:00.
- Bedroom **Sleep** until 07:00. Phone **Wait** (15 minutes / 1 hour / morning / evening).

---

## 0.26.0 — 2026-08-15

**Combat: weapon specials + Arcane Cloud / Telepathic Communication**

- **Specials** tab. Equipped MKAR / BR14 / FAUXMAS unlock official **mag dump** (2 AP, cooldown 2). Official joke-tier bullet damage: MKAR 21000×(18–25), BR14 26000×(3–15), FAUXMAS 18000×(13–20). Cooldown ticks at the start of the next turn.
- **Arcane Cloud** (150 aura, 3 turns): official −25 lust resistance. That becomes a −25 lust shield; official `shieldCheck` only absorbs when shields are above 0, so it only matters if the target already has lust shielding.
- **Telepathic Communication** (75 aura, 5 turns, self): official +15 lust damage. Tease and Arcane Arousal are multiplied by 1.15 while it lasts.

---

## 0.25.0 — 2026-08-15

**Combat: shields, Cloak of Flames, Rain Cloud**

- Official hit chance is **100%** — miss text exists, but `getHitChance` is 1.0, so this rebuild does not invent random misses.
- Turn shielding from resistances: Cloak of Flames **+5 fire / +10 ice**, Stone Shell **+5 physical** (replaces the old flat −5). Shields refresh when the status is applied and after each turn tick. Typed damage eats matching shields (and health shields) first.
- **Cloak of Flames** (50 aura, 3 turns, self). **Rain Cloud** (33 aura, 3 turns): official −25 spell-cost modifier (spells cost 25% more).

---

## 0.24.0 — 2026-08-15

**Vicky / Arcane Arts + devMode grant**

- **Take all weapons** is hidden unless `LT.devMode`, `?dev=1`, or `localStorage lt-devMode=1`.
- Shopping Arcade **Arcane Arts** is playable. Official exterior / interior XML. Open **09:00–17:00**.
- **Weapons** trade: every official `SOLD_BY_VICKY` type (no silly-mode). Stock 2–6, restocks each day. Buy at value × 1.5, sell at value × 0.75 (default NPC trader modifiers).
- Potions & Spells / Clothing / sex stay stubbed.

---

## 0.23.0 — 2026-08-15

**Combat: remaining fight-system holes**

- **Essences.** Ranged weapons spend official `arcaneCost` essences (revolver / shortbow 1). Not enough essences: you cannot fire. New games start with **10**. Brax has official **150**.
- **Thrown consume.** Tennis ball / yarn are lost on use. Official recover: 75% each turn, 100% after combat.
- **Crits.** Official rule: the **third** time the same move is used in one turn is a crit (×1.5 critical power).
- **More spells.** Vacuum (5 / 60), Stone Shell (25 aura, −5 incoming strike damage for 3 turns), Soothing Waters (20% heal, 100 aura, 3 AP).
- **Enemy casters.** Amber knows Ice Shard, Flash, and Arcane Arousal. SPELLS behaviour (and BALANCED weight 1) can queue them.

---

## 0.22.0 — 2026-08-15

**Combat: enemy Block / Tease**

- Enemies spend all leftover AP using official move weights (BALANCED). **Attack** if you are under 20% HP. **Block** if they are under 20% HP. **Tease** if your lust is 75+ (Impassioned). Same-type moves get the official −0.2 repeat penalty.
- Dual-wield still goes Strike then Offhand when they choose to attack. Forced ATTACK / DEFEND / SEDUCE behaviours match official 10× multipliers.
- They still do not cast spells.

---

## 0.21.0 — 2026-08-15

**Combat: Flash + Poison Vapours**

- The other two official school starters. **Flash** (50 aura): dazzles for **−1 AP** on the target's next turn. **Poison Vapours** (50 aura): **25 poison** at the end of each of the next **3** turns (75 total). Recast refreshes the cloud.
- Combat bars show Blinded / Poison Vapours. No other statuses, no upgrades.

---

## 0.20.0 — 2026-08-15

**Combat: official basic spells**

- Spells tab on the fight grid. Official school basics that deal damage immediately: **Fireball** (30 Fire, 75 aura), **Ice Shard** (25 Ice, 35), **Slam** (40 Physical, 60), **Arcane Arousal** (15 lust, 50). All 1 AP, LOW variance. Official cast lines.
- Aura is spent when the spell resolves. Level 1 (57 aura) can cast Ice Shard or Arcane Arousal, not Fireball or Slam. Resist halves Arousal; Block does not cut spells.
- Not in this build: Poison Vapours / Flash / upgrades, spell books, school trees, enemy casters.

---

## 0.19.0 — 2026-08-15

**Combat: enemy offhand**

- If the enemy has an offhand weapon, AI queues **Strike** then **Offhand** (1 AP each). Brax uses the Fire demonstone and the pepperball pistol. Amber uses both demonstones. Dual-wield alley muggers use both knuckles or stone + feather.
- One-handed enemies (pipe, bat, unarmed) still queue a single Strike.
- Still no Block / Tease on the enemy side. Shops, spells, thrown consume, and essence cost stay later.

---

## 0.18.0 — 2026-08-15

**Combat: enemy weapons + official-thin damage**

- Weapons tagged `WEAPON_UNARMED` (demonstones, knuckle dusters) add official unarmed (`2 + physique/5`) to XML damage, then apply variance. Swords, pipes, and guns stay XML + variance.
- **Brax** equips official `innoxia_crystal_epic` (Fire) and a pepperball pistol offhand. **Amber** equips two Fire epic demonstones.
- Dominion alley muggers use the official generic-mugger table: 90% armed; 50% knuckles (half of those dual-wield) or pipe / wooden bat / metal bat. Dark-alley demons: 80% a rare demonstone, 50% a rare feather offhand.
- Enemy AI still queues one Strike, but that Strike now uses whatever they have equipped.
- Still later: shops / Vicky, enchanting, thrown consume, essence cost, spells, allies, smarter AI.

---

## 0.17.0 — 2026-08-15

**Combat: official weapons**

- Converted all **65** official `res/weapons` types (Innoxia, DSG, C4MG1RL). IDs match Java (`innoxia_europeanSwords_arming_sword`, etc.). No invented weapons.
- Main and offhand slots. A two-handed weapon occupies both hands.
- **Strike** uses the main weapon's official damage + `DamageVariance` (NONE/LOW/MEDIUM/HIGH). Unarmed fists if nothing is equipped. Button title becomes the official attack descriptor (Slash, Stab, Shoot).
- **Offhand** (slot W) when an offhand weapon is equipped.
- Inventory: Weapons row, Main/Offhand on carried items, **Take all weapons** grants one of each type you don't already have.
- Official hit text is parsed (`[npc.]` / `[npc2.]`). Saves keep equipped and bagged weapons.
- Not in this build: shops / Vicky, enchanting, thrown one-shot consume/recover, arcane essence cost, weapon special moves.

---

## 0.16.0 — 2026-08-15

**Combat: Tease and lust-loss**

- Official basic **Tease** (1 AP, base 7 lust, ±20% variance). Slot 3.
- Official **Resist** (1 AP): halves incoming Tease this turn. Slot 4. Block still only cuts Strikes.
- Lust bar on both combatants. 100 lust is a defeat (`isCombatantDefeated`: HP ≤ 0 **or** lust 100). Same Victory / Defeat nodes as an HP win.
- Enemy AI is still one Strike. No overflow-lust-to-HP, no tease flavour lines, no weapons.

---

## 0.15.0 — 2026-08-15

**1-H start: Zaranix's door / Amber**

- After Scarlett names Zaranix, Demon Home shows **Zaranix's Home** (official street response).
- Official outside XML. **Knock door** (daytime 06:00–22:00) → Amber answers → **Arthur** (she slams it) or Leave. Beg / persistence Enter stay stubbed (they go inside).
- **Kick down door** is the official combat entrance. Attribute training is not in yet, so the 35-physique gate is not applied. Climb fence stays disabled.
- Amber (level 15 succubus maid) uses the same combat loop. No escape. Win: official victory text, `zaranixAmberSubdued`, sex stubbed, back to the street. Lose: official defeat text, sex stubbed, thrown out. Knock is then locked (hostile maids). The house interior is not in this build.

---

## 0.14.1 — 2026-08-15

**Dominion alley fights**

- Back alleys, dark alleys, and canal crossings use official place XML.
- Official 15% mugger chance when you step onto a new dangerous tile, and again on **Explore** (30 minutes). Patrolled alleys stay safe.
- Procedural mugger: random gender, Dominion race (or incubus/succubus in the dark), level 1–3 (3–5 dark), official HP, unknown name (`the cat-girl`).
- Official assault text → **Fight** (same combat loop) / **Offer money** / Offer body stubbed.
- Win: official victory text, take their flames, a little XP. Lose: they take a cut of yours. Sex stubbed. Escape 25%.

---

## 0.14.0 — 2026-08-15

**Combat v1 + Brax Fight**

- Reusable 1v1 loop: 3 AP, queue moves, **End Turn**, then resolve. Same dialogue chrome and 5×3 grid. Any fight starts with `ResponseCombat`.
- **Strike** and **Block**. Block halves incoming Strikes this turn. No weapons, spells, lust-loss, or allies.
- Official HP / Aura formulas. Main-quest XP we had been dropping is awarded; 10 XP per level.
- **Brax Fight** is live (Truth / drop the act / stop him). Escape chance 0. Win → official victory text → **Leave** (sex stubbed) → uniforms → 1-D. Lose → spit the potion (swallow / sex stubbed) and you can fight again.
- **Lie → Keep on bluffing → Let him go** is still the non-combat route.
- Enemy AI is one Strike per turn. Amber's door stays closed.

---

## 0.13.0 — 2026-08-15

**Main quest 1-G: Slavery (license flag + buy Scarlett)**

- Slavery Administration in Slaver Alley. Finch (cat-boy) is at the desk. Official exterior, posters, and interior XML.
- **Slaver license** starts the *Slaver* side quest (*Letter of recommendation*). Phone shows it next to the main quest.
- Lab **Slaver** after Lilaya's first tests: official letter + **Accommodation**. Empty rooms are a flag only — no slave manager.
- **Present letter (5000)** + **Rules** sets `hasSlaverLicense`. Trade / Slave Manager stay disabled.
- **Buy Scarlett** (15,000, or 10,000 if you took Helena's nest punishment) after the license. Official Calm / Shout / Slap → she names **Zaranix**.
- **Keep her** / **Free her** are flags only (Administration holding cell vs Helena's nest). No slave management.
- Quest becomes *The Great Escape* (`MAIN_1_H`). Official `generateNewTile()`: Zaranix's home is stamped on Dominion at Lilith's Tower `(+1, -2)`. Enter is disabled — that house is the systems cutoff.
- New-game purse is **20,000** flames so the official 5,000 license + 15,000 Scarlett price can be paid. Official Java starts at 5,000; this rebuild has no jobs yet. Flames show on the left panel and in Inventory.

---

## 0.12.0 — 2026-08-15

**Main quest 1-F: Scarlett's fate**

- Return to Scarlett's shop: blinds down, gossip that Helena went inside.
- **Enter** → official introduction: Scarlett is collared, gagged, and enslaved.
- **Offer to buy** → Helena names the price (15,000, or 10,000 if you took her nest punishment) and requires a **slaver license**.
- Quest becomes *Slavery* (`MAIN_1_G`). **Buy Scarlett** is disabled until the license exists. Slavery Administration is not playable yet.

---

## 0.11.0 — 2026-08-15

**Main quest 1-E: Find Helena (Harpy Nests)**

- Harpy Nests entrance on Dominion `(15, 12)` and the nest walkway grid.
- Enforcer post **Request access** grants a nest pass (walkways blocked until then). Official 1-E briefing.
- Helena's nest `(2, 2)`, daytime 06:00–22:00.
- **Helena → Scarlett's woe → No punishment** (or official spanking: Endure / Struggle / Beg for more). Fly after her is disabled (no flight).
- Quest becomes *Scarlett's fate* (`MAIN_1_F`). Helena has left for Slaver Alley. Returning to Scarlett's shop is not fully scripted yet.

---

## 0.10.0 — 2026-08-15

**Main quest 1-D: Sold into Slavery (Scarlett)**

- Slaver Alley street tile `(2, 12)` and interior grid. Official gateway / alley / outside text.
- Scarlett's Shop open 06:00–22:00.
- **Enter → Ask for Arthur → Agree.** Official rude-harpy XML; she no longer has Arthur and sends you to her matriarch **Helena** in the Harpy Nests.
- Quest becomes *Find Helena* (`MAIN_1_E`). Shop Enter is then locked until that report.
- Other alley stalls are walkable descriptions only. No slave market, auctions, or buying Scarlett.

---

## 0.9.0 — 2026-08-15

**Main quest 1-C: The Wolf's Den (Enforcer HQ / Brax talk)**

- Enforcer HQ street tile `(8, 2)` and interior grid.
- Official generic + Brax XML. Reception 09:00–17:00 (Candi).
- **Greet Candi → Brax** grants the interior pass. Guarded door blocks walking until then.
- Brax: **Lie → Keep on bluffing → Let him go** (official non-combat win). Official Observant perk is not gated here so the story can finish.
- Truth/Fight, Drop the act, Stop Brax, and Wolf-tease are stubbed.
- Fem/Masc uniform is a flag + line of text, not a full clothing kit.
- Quest becomes *Sold into Slavery* (`MAIN_1_D`). Scarlett / Slaver Alley is not playable yet.

Docs: `CHANGELOG.md`, `PLAYABLE.md`.

---

## 0.8.0 — 2026-08-15

**Main quest 1-B: Demon Home / Sawlty Towers / Felicia**

- After Lilaya's first tests, quest becomes *The search for Arthur; Demon Home*.
- Official `generateNewTile()`: Sawlty Towers is stamped on Dominion at Lilith's Tower `(-2, -1)` → `(16, 1)`.
- House entrance **Exit** lands on Lilaya's mansion street tile `(8, 12)`.
- Official Demon Home street, gates, and apartment XML.
- Sawlty Towers → Arthur's room → arrest notice (Brax Volkov) → Question dog-girl → Felicia introduces herself.
- Quest becomes *The Wolf's Den* (`MAIN_1_C`).
- Felicia appears in Characters Present at the door. After 1-C, Arthur's room is shut; her apartment Enter is disabled (not this beat).

---

## 0.7.0 — 2026-08-15

**Main quest 1-A: Lilaya's Tests, plus characters present**

- Lilaya and Rose: day in the lab (06:00–22:00), night in Rose's room.
- Official lab XML: door open/shut, entry, aura lecture, Arthur named.
- **Enter → Tests → Returning home → Decline**. Extra “Tests” disabled (sex engine).
- NESW locked during lab talk.
- Right-hand Characters Present panel.
- Phone planner uses official quest wording.
- UtilText: nested `[pc.Name]` inside speech, `#ELSEIF` no longer leaks pregnancy branches.

---

## 0.6.0

**Save / load, phone, inventory**

- localStorage saves (`lt-save-*`, `lt-saves-index`), AutoSave on world change.
- Save, save-to-file (`.ltjson`), load, delete, import. Two-click confirm. Resume on main menu.
- Phone: quests, selfie, discovered maps.
- Inventory: equipped / wardrobe view (no shops yet).

---

## 0.5.0

**Lilaya's house is roamable**

- Ground and first floor grids, official room text for bedroom, corridors, stairs, garden, kitchen/library stubs, Rose's door.
- Fast travel inside the house.
- Lifebound grid runtime with flexible (non-25×25) sizes.
- Map sits bottom-left under attributes. Grey tiles, recolored official place icons.

---

## 0.4.0

**World maps**

- Offline `convert_maps.py`: official painted PNGs → sparse Lifebound-style grids.
- All ~63 WorldTypes from 0.4.10 are in `js/maps/allGrids.js`.
- Place icons generated into `assets/map/icons/`.
- No random map generation (deferred until new content).

---

## 0.3.0

**UtilText + prologue**

- `#IF` / `#ELSE` / `#ENDIF`, `[pc.]` / `[lilaya.]` / `[style.*]`.
- Official prologue XML through **Freedom!** into the bedroom.
- Sex scenes in the museum are skipped with a stub (no sex engine).

---

## 0.2.0

**Character creation**

- Appearance, advanced body, wardrobe, background, jobs, sexual experience, name, confirm.
- Start at prologue, or skip prologue into the bedroom with 1-A already set.

---

## 0.1.0

**Shell**

- `index.html` three-pane dark UI, Carlito, official-looking chrome.
- Sequential `loadScript` onto `window.LT` (file://, no server, no React/TS).
- Every menu is a labeled `<section data-ui>` via `openUI`.
- Disclaimer → patch notes → main menu. Response grid 5×3 + slot 0, hotkeys 1–5 / qwert / asdfg / 0.

---

## Still out of scope (on purpose)

- Sex engine, combat engine, enchanting
- Slavery management (1-G will only need a license **flag**)
- Java save import
- Random encounters / procedural maps
- Full Dominion shops and side quests
- Felicia's apartment, Candi after-hours / punish-Brax content
- Brax fight, wolf-tease, and Enforcer uniform as real clothing
- Slaver license / Slavery Administration (the 1-G *flag*, not slave management)
- Buying Scarlett

Next story beat after 0.12.0: **1-G Slavery** (license from Slavery Administration). Cutoff for systems work remains **1-H**.
