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
  // перечень найденного словами: [название, статус, ключ зоны для подсветки]
  function boneList(inv) {
    const z = inv.zones || {}, out = [];
    for (const k of Object.keys(NAMES)) {
      if (MID[k] || k === "teeth") { if (z[k]) out.push([NAMES[k], z[k], k]); continue; }
      const r = z[k + "_r"], l = z[k + "_l"], x = z[k + "_x"];
      if (r && l) out.push([NAMES[k] + ", обе", r === "c" && l === "c" ? "c" : "p", k]); else if (r) out.push([NAMES[k] + ", правая", r, k + "_r"]); else if (l) out.push([NAMES[k] + ", левая", l, k + "_l"]);
      if (x) out.push([NAMES[k] + (r || l ? ", ещё" : ""), x, k + "_x"]);
    }
    return out;
  }

  // ---------- опись на настоящем рисунке скелета ----------
  // Ориентиры на рисунках img/*.webp (высота 900, анатомическая позиция): правая сторона находки слева, левая получается зеркалом
  // относительно cx. sk череп [верх, низ], md подбородок, nk основание шеи, sh/el/wr/hp/kn/an плечевой, локтевой, лучезапястный,
  // тазобедренный, коленный и голеностопный суставы, fy кончики пальцев, cb низ грудной клетки, rw полуширина груди,
  // pt/pb верх и низ таза, pw полуширина таза, fb стопа по x. Зоны грубые: подсветка ложится только на кость (прозрачный фон).
  const GEO = {
    lucy: { W: 270, cx: 135, sk: [0, 88], skw: 45, md: 128, nk: 150, sh: [32, 178], el: [20, 345], wr: [18, 505], fy: 595, cb: 318, rw: 92, pt: 372, pb: 488, pw: 98, hp: [88, 440], kn: [82, 645], an: [90, 835], fb: [50, 128] },
    turkana: { W: 331, cx: 165, sk: [0, 95], skw: 45, md: 122, nk: 140, sh: [62, 165], el: [45, 320], wr: [30, 455], fy: 550, cb: 325, rw: 92, pt: 345, pb: 470, pw: 97, hp: [112, 425], kn: [100, 625], an: [112, 825], fb: [62, 142] },
    ferrassie: { W: 340, cx: 170, sk: [0, 95], skw: 50, md: 122, nk: 148, sh: [45, 172], el: [35, 330], wr: [28, 460], fy: 555, cb: 330, rw: 100, pt: 350, pb: 478, pw: 105, hp: [108, 432], kn: [95, 612], an: [103, 828], fb: [55, 145] },
    hobbit: { W: 362, cx: 180, sk: [0, 105], skw: 55, md: 140, nk: 162, sh: [55, 185], el: [38, 345], wr: [32, 470], fy: 575, cb: 345, rw: 110, pt: 362, pb: 495, pw: 112, hp: [118, 455], kn: [108, 640], an: [118, 832], fb: [60, 150] },
    modern: { W: 285, cx: 142, sk: [0, 95], skw: 45, md: 122, nk: 148, sh: [38, 172], el: [30, 325], wr: [25, 450], fy: 545, cb: 322, rw: 85, pt: 352, pb: 462, pw: 88, hp: [95, 432], kn: [75, 630], an: [85, 832], fb: [52, 125] },
  };
  const geoKey = img => img.startsWith("modern") ? "modern" : img.replace(/-cast$/, "");
  // стержень от a до b шириной w (с небольшим запасом на концах); off сдвигает поперёк (для лучевой/локтевой, большой/малой берцовых)
  const seg = (a, b, w, off = 0, ext = 6) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const p = (q, s, t) => [q[0] + nx * (off + t) + ux * s, q[1] + ny * (off + t) + uy * s];
    return [p(a, -ext, -w / 2), p(b, ext, -w / 2), p(b, ext, w / 2), p(a, -ext, w / 2)]; };
  const oct = (c, r) => Array.from({ length: 8 }, (_, i) => [c[0] + r * Math.cos(i * Math.PI / 4), c[1] + r * Math.sin(i * Math.PI / 4)]);
  // зоны одной стороны (правой находки, слева на рисунке) и средние; каждая зона: список многоугольников
  function zonesOf(g) {
    const { cx, sk, skw, md, nk, sh, el, wr, fy, cb, rw, pt, pb, pw, hp, kn, an, fb } = g, sp = g.W * .045, ph = pb - pt;
    // сторона: лучевая кость латеральнее (дальше от середины), малоберцовая тоже
    const side = {
      clav: [[[cx - sp, nk - 10], [sh[0] + 4, sh[1] - 24], [sh[0] + 6, sh[1] - 4], [cx - sp, nk + 10]]],
      scap: [[[sh[0] + 10, sh[1] - 4], [cx - rw * .45, nk + 14], [cx - rw * .5, nk + (cb - nk) * .5], [sh[0] + 22, sh[1] + 48]]],
      hum: [seg([sh[0] - 2, sh[1] - 10], el, 28)],
      rad: [seg(el, wr, 16, 8, 2)],
      uln: [seg(el, wr, 16, -8, 2)],
      hand: [seg(wr, [wr[0], fy], 54, 0, 2)],
      coxa: [[[cx - sp * 1.5, pt - 8], [cx - pw - 6, pt - 8], [cx - pw - 4, hp[1]], [hp[0] - 6, pb + 6], [cx - 2, pb + 6], [cx - 2, pb - ph * .15], [cx - sp * 1.5, pb - ph * .15]]],
      fem: [seg([hp[0] - 8, hp[1] - 6], kn, 42, 0, 8)],
      pat: [oct(kn, 13)],
      tib: [seg([kn[0] + 5, kn[1] + 16], [an[0] + 5, an[1]], 24, 0, 4)],
      fib: [seg([kn[0] - 15, kn[1] + 22], [an[0] - 15, an[1]], 14, 0, 4)],
      foot: [[[fb[0], an[1] + 8], [fb[1], an[1] + 8], [fb[1] + 6, 900], [fb[0] - 6, 900]]],
    };
    const chest = [[cx - rw, nk + 14], [cx - sp, nk + 14], [cx - sp, cb + 6], [cx - rw, cb - 10]];
    const mid = {
      ribs: [chest, chest.map(([x, y]) => [2 * cx - x, y])],
      thor: [[[cx - sp, nk + 12], [cx + sp, nk + 12], [cx + sp, cb], [cx - sp, cb]]],
      cran: [[[cx - skw, sk[0]], [cx + skw, sk[0]], [cx + skw, sk[1]], [cx - skw, sk[1]]]],
      mand: [[[cx - skw * .8, sk[1]], [cx + skw * .8, sk[1]], [cx + skw * .6, md], [cx - skw * .6, md]]],
      cerv: [[[cx - sp, md], [cx + sp, md], [cx + sp, nk + 10], [cx - sp, nk + 10]]],
      lumb: [[[cx - sp * 1.25, cb], [cx + sp * 1.25, cb], [cx + sp * 1.25, pt + ph * .25], [cx - sp * 1.25, pt + ph * .25]]],
      sacr: [[[cx - sp * 1.5, pt + ph * .25], [cx + sp * 1.5, pt + ph * .25], [cx + sp, pb - ph * .15], [cx - sp, pb - ph * .15]]],
    };
    const out = {}, mir = poly => poly.map(([x, y]) => [2 * cx - x, y]);
    // порядок важен: позже нарисованная зона лежит сверху и первой ловит нажатие
    for (const k of ["ribs", "thor"]) out[k] = mid[k];
    for (const k of ["scap", "clav"]) { out[k + "_r"] = side[k]; out[k + "_l"] = side[k].map(mir); }
    for (const k of ["cran", "mand", "cerv", "lumb", "sacr"]) out[k] = mid[k];
    for (const k of ["coxa", "hum", "rad", "uln", "hand", "fem", "pat", "tib", "fib", "foot"]) { out[k + "_r"] = side[k]; out[k + "_l"] = side[k].map(mir); }
    return out;
  }
  const ZCACHE = {};
  const zonesFor = img => ZCACHE[geoKey(img)] || (ZCACHE[geoKey(img)] = zonesOf(GEO[geoKey(img)]));
  const ptsOf = poly => poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  // статус зоны: сторонние кости без указания стороны (_x) красятся с обеих сторон
  const zoneSt = (z, id) => { const m = id.match(/^(\w+)_([rl])$/); if (!m) return z[id] || null; return z[id] || (z[m[1] + "_x"] ? (z[m[1] + "_x"] === "m" ? "mx" : "x") : null); };
  const ST_RU = { c: "сохранилась", p: "сохранился фрагмент", m: "по этой кости сделана оценка роста или массы", mx: "по этой кости сделана оценка, сторона в базе не указана", x: "найдена, сторона не указана" };
  const zoneName = id => { const m = id.match(/^(\w+?)(?:_([rlx]))?$/), k = m[1]; return NAMES[k] + (m[2] === "r" ? ", правая" : m[2] === "l" ? ", левая" : ""); };
  // svg: img рисунок, base его файл; o.tint красить найденные кости (для рисунков-заменителей), o.uid уникальный префикс id
  function boneImg(inv, img, o = {}) {
    const g = GEO[geoKey(img)], zs = zonesFor(img), z = inv.zones || {}, u = o.uid || "bi", href = `img/${img}.webp`;
    const flt = (id, col) => `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="saturate" values="0" result="g"/><feFlood flood-color="${col}" result="f"/><feBlend in="g" in2="f" mode="multiply" result="m"/><feComposite in="m" in2="SourceAlpha" operator="in"/></filter>`;
    // выбранная кость: светлое золото с ореолом (серый слой осветляется, чтобы коричневая кость не уходила в оливковый)
    const sel = `<filter id="${u}-fs" x="-20%" y="-5%" width="140%" height="110%" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="saturate" values="0" result="g0"/><feComponentTransfer in="g0" result="g"><feFuncR type="linear" slope="1.5" intercept=".25"/><feFuncG type="linear" slope="1.5" intercept=".25"/><feFuncB type="linear" slope="1.5" intercept=".25"/></feComponentTransfer><feFlood flood-color="#f5cf74" result="f"/><feBlend in="g" in2="f" mode="multiply" result="m"/><feComposite in="m" in2="SourceAlpha" operator="in" result="c"/><feDropShadow in="c" dx="0" dy="0" stdDeviation="3" flood-color="#ffd27a" flood-opacity=".9"/></filter>`;
    let defs = flt(`${u}-fc`, "#a86a3c") + sel
      + `<clipPath id="${u}-sel"></clipPath>`, tint = "", hit = "";
    for (const id in zs) {
      const st = zoneSt(z, id), polys = zs[id].map(p => `<polygon points="${ptsOf(p)}"/>`).join("");
      if (o.tint && st) { defs += `<clipPath id="${u}-${id}">${polys}</clipPath>`;
        tint += `<image href="${href}" width="${g.W}" height="900" clip-path="url(#${u}-${id})" filter="url(#${u}-fc)" opacity="${st === "c" || st === "m" ? 1 : .55}"/>`; }
      hit += `<g class="bz" data-z="${id}" tabindex="-1"><title>${zoneName(id)}: ${ST_RU[st] || "не найдена"}</title>${polys}</g>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} 900" class="bimg" data-img="${img}" data-uid="${u}" ${o.attrs || ""}><defs>${defs}</defs>`
      + `<image href="${href}" width="${g.W}" height="900"/>${tint}<image class="bsel" href="${href}" width="${g.W}" height="900" clip-path="url(#${u}-sel)" filter="url(#${u}-fs)"/><g class="bhit">${hit}</g></svg>`;
  }
  // подсветить зону (или обе стороны для ключа без стороны) в svg из boneImg; вернуть список id
  function boneSel(svg, key) {
    if (key === "teeth") key = "mand";
    const zs = zonesFor(svg.dataset.img), ids = zs[key] ? [key] : /_x$/.test(key) ? [key.replace(/_x$/, "_r"), key.replace(/_x$/, "_l")] : [key + "_r", key + "_l"].filter(id => zs[id]);
    svg.querySelector(`#${svg.dataset.uid}-sel`).innerHTML = ids.map(id => zs[id].map(p => `<polygon points="${ptsOf(p)}"/>`).join("")).join("");
    svg.querySelectorAll(".bz").forEach(el => el.classList.toggle("on", ids.includes(el.dataset.z)));
    return ids;
  }
  window.BONEMAP = { invOf, level1, boneG, boneAt, boneSVG, boneList, NAMES, boneImg, boneSel, zoneSt, zoneName, ST_RU, zonesFor };
})();
