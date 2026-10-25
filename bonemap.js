// Схема скелета с описью костей находки. Координаты 200×470: макушка y=14, пятки y=466.
// Правая сторона находки рисуется слева (анатомическая позиция, лицом к зрителю), левая получается зеркалом.
(function () {
  // кость: стержень от (x1,y1) до (x2,y2) толщиной w с утолщениями на концах
  const bone = (x1, y1, x2, y2, w) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2, r = w * .85;
    return `<path d="M${x1 + nx} ${y1 + ny}L${x2 + nx} ${y2 + ny}L${x2 - nx} ${y2 - ny}L${x1 - nx} ${y1 - ny}Z"/><circle cx="${x1}" cy="${y1}" r="${r}"/><circle cx="${x2}" cy="${y2}" r="${r}"/>`;
  };
  const stack = (x, w, y0, h, n, gap) => Array.from({ length: n }, (_, i) => `<rect x="${x - w / 2}" y="${y0 + i * (h + gap)}" width="${w}" height="${h}" rx="1.2"/>`).join("");
  const ribs = Array.from({ length: 7 }, (_, i) => { const y = 114 + i * 11, s = 1 - Math.abs(i - 3) * .07, x = 100 - 30 * s;
    return `<path d="M97 ${y}Q${x - 2} ${y - 6} ${x} ${y + 9}Q${x + 4} ${y + 17} 97 ${y + 13}L97 ${y + 10}Q${x + 6} ${y + 13} ${x + 3} ${y + 8}Q${x + 2} ${y - 2} 97 ${y + 3}Z"/>`; }).join("");
  const SIDE = {
    clav: `<path d="M97 105Q84 99 66 103L66 107Q84 104 97 110Z"/>`,
    scap: `<path d="M68 108L88 112L82 152Z"/>`,
    hum: bone(66, 112, 57, 198, 6.5),
    rad: bone(52, 206, 41, 288, 3.6),
    uln: bone(59, 205, 49, 289, 3.6),
    hand: `<path d="M37 292L52 294L53 308L38 309Z"/>` + bone(39, 312, 35, 330, 2) + bone(43, 313, 41, 334, 2) + bone(47, 313, 47, 334, 2) + bone(51, 312, 52, 329, 2) + bone(53, 300, 58, 314, 2),
    coxa: `<path d="M95 254Q82 236 66 244Q60 262 69 280Q76 296 91 298L95 286Q86 282 83 272Q89 266 95 263Z"/>`,
    fem: `<circle cx="87" cy="285" r="6.5"/><path d="M87 282L74 290L77 298Z"/>` + bone(76, 296, 83, 368, 7),
    pat: `<circle cx="83" cy="378" r="4.5"/>`,
    tib: bone(85, 388, 84, 450, 6.5),
    fib: bone(73, 390, 75, 450, 2.8),
    foot: `<path d="M77 455L91 455L94 465L64 467Q63 461 70 458Z"/>`,
  };
  const MID = {
    cran: `<path fill-rule="evenodd" d="M100 14C124 14 130 32 129 48C128 62 122 70 116 74L84 74C78 70 72 62 71 48C70 32 76 14 100 14Z M84 46a6 5 0 1 0 12 0a6 5 0 1 0-12 0Z M104 46a6 5 0 1 0 12 0a6 5 0 1 0-12 0Z M100 54L96 63H104Z"/>`,
    mand: `<path d="M81 70Q83 88 100 92Q117 88 119 70L113 72Q111 83 100 85Q89 83 87 72Z"/>`,
    cerv: stack(100, 9, 92, 2.6, 4, 1),
    thor: stack(100, 9, 107, 5.5, 12, 1.4),
    lumb: stack(100, 12, 196, 8, 5, 1.6),
    sacr: `<path d="M92 245H108L104 278Q100 285 96 278Z"/>`,
    ribs: ribs + `<g transform="translate(200 0) scale(-1 1)">${ribs}</g><path d="M98 112H102V160H98Z"/>`,
  };
  const ARM = ["hum", "rad", "uln", "hand"];
  const NAMES = { cran: "череп", mand: "нижняя челюсть", teeth: "зубы", cerv: "шейные позвонки", thor: "грудные позвонки", lumb: "поясничные позвонки", sacr: "крестец", ribs: "рёбра",
    clav: "ключица", scap: "лопатка", hum: "плечевая кость", rad: "лучевая кость", uln: "локтевая кость", hand: "кисть", coxa: "тазовая кость", fem: "бедренная кость", pat: "надколенник", tib: "большеберцовая кость", fib: "малоберцовая кость", foot: "стопа" };

  // уровень 1: что известно из самой базы Will 2017 (кость, по которой сделана оценка; сторона не указана)
  const ELMAP = [
    [/^FHD|Femur|Femoral|femur length/i, ["fem"]], [/Multivariate \(Lower limb\)|Lower limb \(Long bone\)/i, ["fem", "tib"]],
    [/Lower and upper limb/i, ["fem", "tib", "hum"]], [/Upper limb \(Long ?bone\)/i, ["hum", "rad", "uln"]], [/Ulna/i, ["uln"]], [/hand/i, ["hand"]],
    [/clavicle/i, ["clav"]], [/Vertebral/i, ["thor", "lumb"]], [/Pelvis/i, ["coxa"]], [/Foot|Talus|Calcaneus|Mt|Trochlear/i, ["foot"]],
  ];
  const fromEl = el => { if (!el) return []; for (const [re, z] of ELMAP) if (re.test(el)) return z; return []; };
  function level1(r) {
    const zones = {};
    for (const el of [r.bm_el, r.st_el]) for (const z of fromEl(el)) zones[z + (MID[z] ? "" : "_x")] = "m";
    return { lvl: 1, zones, els: [...new Set([r.bm_el, r.st_el].filter(Boolean).map(e => elRu(e.trim())))] };
  }
  const EL_RU = [[/^FHD/, "диаметр головки бедра"], [/Trochlear/i, "ширина блока таранной кости"], [/^Femur \(|Femoral/i, "диаметры бедренной кости"], [/Femur length/i, "длина бедренной кости"],
    [/Multivariate \(Lower limb\)/i, "несколько размеров костей ноги"], [/Lower and upper limb/i, "длинные кости рук и ног"], [/Lower limb \(Long bone\)/i, "длинные кости ноги"], [/Upper limb \(Long ?bone\)/i, "длинные кости руки"],
    [/Ulna/i, "локтевая кость"], [/hand/i, "кости кисти"], [/clavicle/i, "ключица"], [/Vertebral/i, "позвонки"], [/Pelvis/i, "таз"], [/Lower limb \(Foot\)/i, "кости стопы"],
    [/Foot \((.*)\)/i, m => "кости стопы: " + m[1].replace(/max\.? ?length|total length/gi, "длина").replace(/Talus|Talar/g, "таранная").replace(/Calcaneus/g, "пяточная").replace(/Mt/g, "плюсневая ").replace(/\s+/g, " ").trim()]];
  const elRu = e => { for (const [re, t] of EL_RU) { const m = e.match(re); if (m) return typeof t === "function" ? t(m) : t; } return e; };
  const invOf = r => { const i = (window.INV || {})[r.specimen]; return i ? Object.assign({ lvl: 2 }, i) : level1(r); };

  // статус зоны для отрисовки: c целиком, p фрагмент, m кость оценки (уровень 1), x сторона не указана
  const stOf = (zones, k, side) => { if (!side) return zones[k]; const s = zones[k + "_" + side]; if (s) return s; const x = zones[k + "_x"]; return x ? (x === "m" ? "mx" : "x") : null; };
  function paint(st, col, bg, line) {
    if (st === "c" || st === "m") return `fill="${col}" stroke="${col}" stroke-width=".6"`;
    if (st === "p") return `fill="${col}" fill-opacity=".42" stroke="${col}" stroke-width="1"`;
    if (st === "mx" || st === "x") return `fill="${col}" fill-opacity=".55" stroke="${col}" stroke-width=".8" stroke-dasharray="2 1.5"`;
    return `fill="${bg}" stroke="${line}" stroke-opacity=".55" stroke-width=".6"`;
  }
  // разметка <g> скелета: inv из invOf, o = { col, bg, line, arm, wf, hover }
  function boneG(inv, o = {}) {
    const col = o.col || "var(--s1)", bg = o.bg || "var(--bone)", line = o.line || "var(--text-3)", z = inv.zones || {};
    const tip = (k, side, st) => o.hover ? `<title>${NAMES[k]}${side ? (side === "r" ? ", правая" : ", левая") : ""}: ${st === "c" ? "сохранилась" : st === "p" ? "фрагмент" : st === "m" || st === "mx" ? "по ней сделана оценка" : st === "x" ? "найдена, сторона не указана" : "не найдена"}</title>` : "";
    const g = (k, side, shapes) => { const st = stOf(z, k, side); return `<g data-z="${k}${side ? "_" + side : ""}" ${paint(st, col, bg, line)}>${tip(k, side, st)}${shapes}</g>`; };
    let right = "", left = "", arm = "";
    for (const k of Object.keys(SIDE)) { const a = g(k, "r", SIDE[k]), b = g(k, "l", SIDE[k]); if (ARM.includes(k)) arm += a + `<g transform="translate(200 0) scale(-1 1)">${b}</g>`; else { right += a; left += b; } }
    let mid = Object.keys(MID).map(k => g(k, null, MID[k])).join("");
    if (z.teeth && !z.cran && !z.mand) mid += `<g ${paint(z.teeth, col, bg, line)}>${tip("teeth", null, z.teeth)}<rect x="89" y="73" width="22" height="4" rx="1"/></g>`;
    const armK = o.arm || 1;
    return `<g stroke-linejoin="round">${mid}${right}<g transform="translate(200 0) scale(-1 1)">${left}</g><g transform="translate(0 108) scale(1 ${armK}) translate(0 -108)">${arm}</g></g>`;
  }
  // скелет в масштабе: центр cx, земля ground, ppc пикселей на см
  function boneAt(inv, cx, ground, ppc, st, o = {}) {
    const k = st * ppc / 452, wf = o.wf || 1;
    return `<g transform="translate(${cx - 100 * k * wf} ${ground - 467 * k}) scale(${k * wf} ${k})">${boneG(inv, o)}</g>`;
  }
  const boneSVG = (inv, o = {}, attrs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 8 140 464" ${attrs}>${boneG(inv, o)}</svg>`;
  // перечень найденного словами
  function boneList(inv) {
    const z = inv.zones || {}, out = [];
    for (const k of Object.keys(NAMES)) {
      if (MID[k] || k === "teeth") { if (z[k]) out.push([NAMES[k], z[k]]); continue; }
      const r = z[k + "_r"], l = z[k + "_l"], x = z[k + "_x"];
      if (r && l) out.push([NAMES[k] + ", обе", r === "c" && l === "c" ? "c" : "p"]); else if (r) out.push([NAMES[k] + ", правая", r]); else if (l) out.push([NAMES[k] + ", левая", l]);
      if (x) out.push([NAMES[k] + (r || l ? ", ещё" : ""), x]);
    }
    return out;
  }
  window.BONEMAP = { invOf, level1, boneG, boneAt, boneSVG, boneList, NAMES };
})();
