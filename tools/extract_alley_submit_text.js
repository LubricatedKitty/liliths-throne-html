var fs = require("fs");
var xmlPath = "G:/Twine Games/LT Rebuild/Liliths Throne v0.4.10/res/txt/encounters/dominion/alleywayAttack.xml";
var outPath = "G:/Twine Games/LT Rebuild/Liliths Throne HTML/js/text/alleywayAttackSubmit.js";
var want = {
  ALLEY_ATTACK_REPEAT: 1,
  ALLEY_ATTACK_PEACEFUL: 1,
  ALLEY_ATTACK_PAY_OFF: 1,
  ALLEY_ATTACK_SUBMITTED: 1,
  ALLEY_ATTACK_DEMAND_SUBMIT: 1,
  SUBMITTING_FEET: 1,
  SUBMITTING_SPANKING: 1,
  SUBMITTING_BOW_DOWN: 1,
  SUBMITTED_END: 1,
  SUBMITTED_FUCKED_WILLING: 1,
  SUBMITTED_AFTER_SEX: 1,
  SUBMITTED_REPEAT_PAID: 1,
  SUBMITTED_REPEAT_SEX_START: 1,
  SUBMITTED_REPEAT_MUGGING: 1,
  SUBMITTED_REPEAT_MUGGING_COMBAT_WON: 1,
  SUBMITTED_REPEAT_MUGGING_SPECTATE_SEX: 1,
  SUBMITTED_REPEAT_MUGGING_NO_SPECTATE: 1,
  SUBMITTED_REPEAT_MUGGING_REFUSE_SEX: 1,
  SUBMITTED_REPEAT_MUGGING_SPECTATE_SEX_END: 1,
  SUBMITTED_REPEAT_PIMPED_OUT: 1,
  SUBMITTED_REPEAT_PIMPED_OUT_GENERIC_START: 1,
  SUBMITTED_REPEAT_PIMPED_OUT_SEX_END: 1,
  SUBMITTED_REPEAT_WALKIES: 1,
  SUBMITTED_REPEAT_WALKIES_ORAL_START: 1,
  SUBMITTED_REPEAT_WALKIES_ORAL_VAGINAL_START: 1,
  SUBMITTED_REPEAT_WALKIES_VAGINAL_START: 1,
  SUBMITTED_REPEAT_WALKIES_ANAL_START: 1,
  SUBMITTED_REPEAT_WALKIES_IGNORE: 1,
  SUBMITTED_REPEAT_WALKIES_SEX_END: 1,
};
var xml = fs.readFileSync(xmlPath, "utf8");
console.log("xml length", xml.length, "sample", JSON.stringify(xml.slice(xml.indexOf("ALLEY_ATTACK_SUBMITTED") - 20, xml.indexOf("ALLEY_ATTACK_SUBMITTED") + 80)));
var map = {};
var re = /<htmlContent\s+tag="([^"]+)"\s*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/htmlContent>/g;
var m;
while ((m = re.exec(xml))) {
  if (want[m[1]]) map[m[1]] = m[2];
}
var keys = Object.keys(want);
var missing = keys.filter(function (k) { return !map[k]; });
if (missing.length) {
  console.error("missing", missing);
  process.exit(1);
}
var body = "LT.TEXT = LT.TEXT || {};\nLT.TEXT[\"encounters/dominion/alleywayAttack\"] = Object.assign(LT.TEXT[\"encounters/dominion/alleywayAttack\"] || {}, " + JSON.stringify(map) + ");\n";
fs.writeFileSync(outPath, body);
console.log("wrote", keys.length, "tags to", outPath);
