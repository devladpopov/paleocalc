// Реестр формул модуля 1. Каждая формула: источник, где сверены коэффициенты, способ интервала.
// Единицы ввода: длины костей и головка бедра в мм, рост и бедренно-подвздошная ширина в см, ECV в см3, масса в кг.
// interval.kind: "see"  = ±1.96·SEE из источника (приближённый 95% интервал предсказания);
//                "pct"  = ±p% от оценки (конвенция Ruff 2010, применённая в Will et al. 2017);
//                "none" = источник интервала не даёт.

const SOURCES = {
  TG1952: { cite: "Trotter M., Gleser G.C. (1952). Estimation of stature from long bones of American Whites and Negroes. Am. J. Phys. Anthropol. 10: 463-514.", doi: "10.1002/ajpa.1330100407" },
  FELD1990: { cite: "Feldesman M.R., Kleckner J.G., Lundy J.K. (1990). Femur/stature ratio and estimates of stature in mid- and late-Pleistocene fossil hominids. Am. J. Phys. Anthropol. 83: 359-372.", doi: "10.1002/ajpa.1330830309" },
  RUFF1991: { cite: "Ruff C.B., Scott W.W., Liu A.Y.-C. (1991). Articular and diaphyseal remodeling of the proximal femur with changes in body mass in adults. Am. J. Phys. Anthropol. 86: 397-413.", doi: "10.1002/ajpa.1330860306" },
  MCH1992: { cite: "McHenry H.M. (1992). Body size and proportions in early hominids. Am. J. Phys. Anthropol. 87: 407-431.", doi: "10.1002/ajpa.1330870404" },
  GRINE1995: { cite: "Grine F.E., Jungers W.L., Tobias P.V., Pearson O.M. (1995). Fossil Homo femur from Berg Aukas, northern Namibia. Am. J. Phys. Anthropol. 97: 151-185.", doi: "10.1002/ajpa.1330970207" },
  RUFF2012: { cite: "Ruff C.B. et al. (2012). Stature and body mass estimation from skeletal remains in the European Holocene. Am. J. Phys. Anthropol. 148: 601-617.", doi: "10.1002/ajpa.22087" },
  RUFF2000: { cite: "Ruff C.B. (2000). Body mass prediction from skeletal frame size in elite athletes. Am. J. Phys. Anthropol. 113: 507-517 (уравнения Ruff 1994; Ruff et al. 1997).", doi: "10.1002/1096-8644(200012)113:4<507::AID-AJPA5>3.0.CO;2-F" },
  RUFF2005: { cite: "Ruff C.B., Niskanen M., Junno J.-A., Jamison P. (2005). Body mass prediction from stature and bi-iliac breadth in two high latitude populations, with application to earlier higher latitude humans. J. Hum. Evol. 48: 381-392.", doi: "10.1016/j.jhevol.2004.11.009" },
  RUFF1997: { cite: "Ruff C.B., Trinkaus E., Holliday T.W. (1997). Body mass and encephalization in Pleistocene Homo. Nature 387: 173-176.", doi: "10.1038/387173a0" },
  JER1973: { cite: "Jerison H.J. (1973). Evolution of the Brain and Intelligence. New York: Academic Press.", doi: null },
  RUFF2010: { cite: "Ruff C.B. (2010). Body size and body shape in early hominins: implications of the Gona pelvis. J. Hum. Evol. 58: 166-178.", doi: "10.1016/j.jhevol.2009.10.003" },
  ELLIOTT2015: { cite: "Elliott M., Kurki H., Weston D.A., Collard M. (2015). Estimating body mass from postcranial variables: an evaluation of current equations using a large known-mass sample of modern humans. Archaeol. Anthropol. Sci. 8: 689-704 (табл. 4, 5).", doi: "10.1007/s12520-015-0251-6" },
  WILL2017: { cite: "Will M., Pablos A., Stock J.T. (2017). Long-term patterns of body mass and stature evolution within the hominin lineage. R. Soc. Open Sci. 4: 171339. Данные: figshare, CC BY.", doi: "10.1098/rsos.171339" },
};

// Где сверены коэффициенты в этой версии (честная пометка для рецензента).
const CHECK = {
  ELLIOTT: "Сверено по вторичному источнику: Elliott et al. 2015, табл. 4 (коэффициенты до 2 знаков). Нужна сверка с оригиналом.",
  TG: "Сверено по вторичным источникам (учебные таблицы Trotter & Gleser 1952). Нужна сверка с оригиналом.",
  WILL: "Коэффициент взят из глоссария Will et al. 2017 (SI, лист Glossary methods).",
  RUFF97: "Сверено по вторичному источнику (Garvin et al. 2017, H. naledi), цитирующему Ruff et al. 1997.",
};

const PCT20 = { kind: "pct", pct: 20, basis: "±20% от оценки: конвенция Ruff 2010, так же считаны интервалы в базе Will et al. 2017", src: "RUFF2010" };
const PCT10 = { kind: "pct", pct: 10, basis: "±10% от оценки: конвенция базы Will et al. 2017 при отсутствии интервала в источнике", src: "WILL2017" };

const FORMULAS = [
  // ---------- РОСТ ----------
  { id: "tg-fem-wm", group: "stature", name: "Trotter & Gleser 1952, бедро (белые мужчины)", inputs: ["femur"],
    fn: v => 2.38 * v.femur / 10 + 61.41, formula: "S = 2.38·FEM + 61.41 (FEM, см)",
    interval: { kind: "see", see: 3.27, basis: "SE = 3.27 см из источника" }, src: "TG1952", check: CHECK.TG,
    note: "Современная референсная выборка (погибшие в WWII). Для ископаемых гоминид пропорции другие: использовать как ориентир для поздних Homo." },
  { id: "tg-tib-wm", group: "stature", name: "Trotter & Gleser 1952, большеберцовая (белые мужчины)", inputs: ["tibia"],
    fn: v => 2.52 * v.tibia / 10 + 78.62, formula: "S = 2.52·TIB + 78.62 (TIB, см)",
    interval: { kind: "see", see: 3.37, basis: "SE = 3.37 см из источника" }, src: "TG1952", check: CHECK.TG,
    note: "Известная проблема: Trotter измеряла длину большеберцовой без медиальной лодыжки (Jantz et al. 1995), с полной длиной формула завышает рост." },
  { id: "tg-hum-wm", group: "stature", name: "Trotter & Gleser 1952, плечевая (белые мужчины)", inputs: ["humerus"],
    fn: v => 3.08 * v.humerus / 10 + 70.45, formula: "S = 3.08·HUM + 70.45 (HUM, см)",
    interval: { kind: "see", see: 4.05, basis: "SE = 4.05 см из источника" }, src: "TG1952", check: CHECK.TG,
    note: "Верхняя конечность хуже предсказывает рост, чем нижняя." },
  { id: "feld-ratio", group: "stature", name: "Feldesman et al. 1990, отношение бедро/рост", inputs: ["femur"],
    fn: v => v.femur / 10 * 3.7456, formula: "S = FEM·3.7456 (FEM, см; бедро = 26.7% роста)",
    interval: PCT10, src: "FELD1990", check: CHECK.WILL,
    note: "Не зависит от пола и популяции (51 популяция, 13 149 человек). Стандартный выбор для ископаемых в Will et al. 2017 (например, AL 288-1)." },

  // ---------- МАССА ТЕЛА: головка бедра ----------
  { id: "ruff91-c", group: "mass", name: "Ruff et al. 1991, головка бедра (оба пола)", inputs: ["fh"],
    fn: v => 2.160 * v.fh - 24.8, formula: "BM = 2.160·FH − 24.8",
    interval: PCT20, src: "RUFF1991", check: CHECK.ELLIOTT,
    note: "Выборка: 80 живых жителей США (КТ). В части литературы к уравнениям Ruff 1991 применяют поправку ×0.90 (избыток жира в референсной выборке США); в прототипе она не применена, вопрос для научной сверки." },
  { id: "ruff91-m", group: "mass", name: "Ruff et al. 1991, головка бедра (мужчины)", inputs: ["fh"], sex: "M",
    fn: v => 2.741 * v.fh - 54.9, formula: "BM = 2.741·FH − 54.9",
    interval: PCT20, src: "RUFF1991", check: CHECK.ELLIOTT, note: "См. примечание о поправке ×0.90." },
  { id: "ruff91-f", group: "mass", name: "Ruff et al. 1991, головка бедра (женщины)", inputs: ["fh"], sex: "F",
    fn: v => 2.426 * v.fh - 35.1, formula: "BM = 2.426·FH − 35.1",
    interval: PCT20, src: "RUFF1991", check: CHECK.ELLIOTT, note: "См. примечание о поправке ×0.90." },
  { id: "mch92", group: "mass", name: "McHenry 1992, головка бедра", inputs: ["fh"],
    fn: v => 2.239 * v.fh - 39.9, formula: "BM = 2.239·FH − 39.9",
    interval: PCT20, src: "MCH1992", check: CHECK.ELLIOTT,
    note: "Средние 4 выборок, включая койсан и пигмеев: предназначена для мелких гоминид (австралопитеки)." },
  { id: "grine95", group: "mass", name: "Grine et al. 1995, головка бедра", inputs: ["fh"],
    fn: v => 2.268 * v.fh - 36.5, formula: "BM = 2.268·FH − 36.5",
    interval: PCT20, src: "GRINE1995", check: CHECK.ELLIOTT,
    note: "Средние 10 выборок крупных людей: для крупных гоминид (поздние Homo). Auerbach & Ruff 2004 рекомендуют среднее Ruff 1991, McHenry 1992 и Grine 1995 для тел средних размеров." },
  { id: "ruff12-c", group: "mass", name: "Ruff et al. 2012, головка бедра (оба пола, Европа, голоцен)", inputs: ["fh"],
    fn: v => 2.30 * v.fh - 41.7, formula: "BM = 2.30·FH − 41.7",
    interval: PCT20, src: "RUFF2012", check: CHECK.ELLIOTT, note: "1145 скелетов голоцена Европы, RMA-регрессия." },

  // ---------- МАССА ТЕЛА: рост + ширина таза ----------
  { id: "ruff00-m", group: "mass", name: "Ruff 1994/1997/2000, рост и ширина таза (мужчины)", inputs: ["stature", "lbib"], sex: "M",
    fn: v => 0.37 * v.stature + 3.03 * v.lbib - 82.5, formula: "BM = 0.37·ST + 3.03·LBIB − 82.5",
    interval: PCT20, src: "RUFF2000", check: CHECK.ELLIOTT,
    note: "Морфометрический метод. LBIB: прижизненная бедренно-подвздошная ширина, см (из скелетной пересчитывается по Ruff et al. 1997). Ruff 2000 советует брать среднее мужского и женского уравнений." },
  { id: "ruff00-f", group: "mass", name: "Ruff 1994/1997/2000, рост и ширина таза (женщины)", inputs: ["stature", "lbib"], sex: "F",
    fn: v => 0.52 * v.stature + 1.81 * v.lbib - 75.5, formula: "BM = 0.52·ST + 1.81·LBIB − 75.5",
    interval: PCT20, src: "RUFF2000", check: CHECK.ELLIOTT, note: "См. мужское уравнение." },
  { id: "ruff05-m", group: "mass", name: "Ruff et al. 2005, рост и ширина таза (мужчины, вкл. высокие широты)", inputs: ["stature", "lbib"], sex: "M",
    fn: v => 0.42 * v.stature + 3.13 * v.lbib - 92.9, formula: "BM = 0.42·ST + 3.13·LBIB − 92.9",
    interval: PCT20, src: "RUFF2005", check: CHECK.ELLIOTT, note: "Выборка Ruff 2000 плюс две финские группы." },
  { id: "ruff05-f", group: "mass", name: "Ruff et al. 2005, рост и ширина таза (женщины, вкл. высокие широты)", inputs: ["stature", "lbib"], sex: "F",
    fn: v => 0.50 * v.stature + 1.80 * v.lbib - 72.6, formula: "BM = 0.50·ST + 1.80·LBIB − 72.6",
    interval: PCT20, src: "RUFF2005", check: CHECK.ELLIOTT, note: "" },

  // ---------- МОЗГ ----------
  { id: "brain-ruff97", group: "brain", name: "Ruff et al. 1997, масса мозга по объёму эндокрана", inputs: ["ecv"],
    fn: v => 1.147 * Math.pow(v.ecv, 0.976), formula: "Brain (г) = 1.147·ECV^0.976",
    interval: { kind: "none", basis: "Интервал в источнике не указан (R² = 0.995, 27 видов приматов). Погрешность определяется прежде всего ошибкой реконструкции ECV." },
    src: "RUFF1997", check: CHECK.RUFF97, note: "" },
];

// Индексы энцефализации считаются отдельно: зависят от массы мозга и массы тела (вводится или берётся из расчёта).
const EQ_FORMULAS = [
  { id: "eq-martin", name: "EQ по Martin 1981 (в версии Ruff et al. 1997)", formula: "EQ = Brain / (11.22·BM^0.76), Brain в г, BM в кг",
    fn: (brain, bm) => brain / (11.22 * Math.pow(bm, 0.76)), src: "RUFF1997", check: CHECK.RUFF97 },
  { id: "eq-jerison", name: "EQ по Jerison 1973", formula: "EQ = Brain / (0.12·BM^(2/3)), обе массы в г",
    fn: (brain, bm) => brain / (0.12 * Math.pow(bm * 1000, 2 / 3)), src: "JER1973", check: "Классическая формула, сверка с оригиналом не проводилась." },
];

const INPUTS = {
  femur: { label: "Максимальная длина бедренной кости", unit: "мм" },
  tibia: { label: "Длина большеберцовой кости", unit: "мм" },
  humerus: { label: "Максимальная длина плечевой кости", unit: "мм" },
  fh: { label: "Диаметр головки бедра (FHD)", unit: "мм" },
  stature: { label: "Рост (известный или оценённый)", unit: "см" },
  lbib: { label: "Прижизненная бедренно-подвздошная ширина (LBIB)", unit: "см" },
  ecv: { label: "Объём эндокрана (ECV)", unit: "см³" },
  bm: { label: "Масса тела для EQ (пусто = среднее по головке бедра)", unit: "кг" },
};

function intervalOf(f, est) {
  const i = f.interval;
  if (i.kind === "see") return [est - 1.96 * i.see, est + 1.96 * i.see];
  if (i.kind === "pct") return [est * (1 - i.pct / 100), est * (1 + i.pct / 100)];
  return null;
}

if (typeof module !== "undefined") module.exports = { SOURCES, FORMULAS, EQ_FORMULAS, INPUTS, intervalOf };
