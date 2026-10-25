// Проверки: node tests/test.js
const { FORMULAS, EQ_FORMULAS, SOURCES, intervalOf } = require("../formulas.js");
const assert = require("assert");
const by = id => FORMULAS.find(f => f.id === id);
const near = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
// 1. У каждой формулы есть источник, сверка и описание интервала
for (const f of FORMULAS) { assert(SOURCES[f.src], f.id + " src"); assert(f.check && f.interval && f.interval.basis, f.id); }
// 2. Trotter & Gleser: бедро 45 см -> 2.38*45+61.41 = 168.51
near(by("tg-fem-wm").fn({ femur: 450 }), 168.51, 1e-9, "TG femur");
near(intervalOf(by("tg-fem-wm"), 168.51)[1], 168.51 + 1.96 * 3.27, 1e-9, "TG CI");
// 3. Обратная сверка с базой Will et al. 2017: Chancelade 1 = 67.37 кг по Grine 1995 -> FHD ~45.8 мм
const fh = (67.3744 + 36.5) / 2.268; near(by("grine95").fn({ fh }), 67.3744, 1e-9, "Grine roundtrip");
// 4. Feldesman: AL 288-1, рост 105 см в базе -> бедро ~28.0 см (литература: ~280 мм)
near(105 / 3.7456, 28.03, 0.01, "Feldesman AL 288-1");
// 5. EQ современного человека (мозг 1350 г, 63 кг): Martin ~5, Jerison ~7
const eqm = EQ_FORMULAS[0].fn(1350, 63), eqj = EQ_FORMULAS[1].fn(1350, 63);
assert(eqm > 4.5 && eqm < 5.8, "EQ Martin " + eqm); assert(eqj > 6 && eqj < 8, "EQ Jerison " + eqj);
// 6. База Will et al. 2017 загружена и содержит Lucy и Turkana boy
global.window = {}; require("../data/will2017.js");
const db = window.WILL2017; assert(db.length > 300, "db size " + db.length);
assert(db.find(r => r.specimen === "AL 288-1").bm === 26, "Lucy BM");
// 7. Обратный пересчёт «Вы и Люси»: Люси 105 см -> бедро ~280 мм (в литературе 281); головка бедра по массе 26 кг ~27 мм (измерено 28.6)
const { REVERSE } = require("../formulas.js");
near(REVERSE.femurFromStature(105), 280.3, 0.1, "femur from stature");
near(REVERSE.fhFromMass(26), 26.8, 0.1, "FH from mass");
for (const bm of [26, 50, 70, 90]) { const fh = REVERSE.fhFromMass(bm), m3 = ["ruff91-c", "mch92", "grine95"].reduce((s, id) => s + by(id).fn({ fh }), 0) / 3; near(m3, bm, 1, "FH roundtrip " + bm); }
near(REVERSE.bmi(172, 72), 24.34, 0.01, "BMI");
// карта: у каждой находки ровно одно местонахождение, координаты в рамке карты
require("../data/sites.js"); require("../data/world.js");
const sites = window.SITES.map(s => ({ ...s, re: new RegExp(s.m) }));
for (const r of db) { const m = sites.filter(s => s.re.test(r.specimen)); assert.strictEqual(m.length, 1, "site for " + r.specimen + ": " + m.length); }
for (const s of sites) { assert(s.lon >= window.WORLD.lon0 && s.lat <= window.WORLD.lat1 && s.lat >= -40 && s.lon <= 135, "site in frame " + s.n); }
console.log(`OK: ${FORMULAS.length + EQ_FORMULAS.length} формул, ${db.length} записей базы, ${sites.length} местонахождений. EQ Martin=${eqm.toFixed(2)}, Jerison=${eqj.toFixed(2)}`);
