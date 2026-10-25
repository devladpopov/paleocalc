"""Ровный «слепок» без раскраски найдено/восстановлено: рисунок группы для находок без своей иллюстрации.
Яркость коричневых и белых участков отдельно приводится к распределению яркости кости modern-mid (квантильное
сопоставление), цвет берётся из modern-mid по яркости. Запуск: python tools/neutral_skeletons.py"""
from pathlib import Path
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
load = lambda k: np.asarray(Image.open(ROOT / "img" / f"{k}.webp").convert("RGBA")).astype(float) / 255
lum = lambda rgb: rgb @ [.299, .587, .114]
ref = load("modern-mid"); rm = ref[..., 3] > .5
rl = lum(ref[..., :3])[rm]; rq = np.quantile(rl, np.linspace(0, 1, 101))
# таблица «яркость -> цвет» по modern-mid
bins = np.clip((lum(ref[..., :3]) * 63).astype(int), 0, 63)
lut = np.array([ref[..., :3][rm & (bins == b)].mean(0) if (rm & (bins == b)).sum() > 20 else [np.nan] * 3 for b in range(64)])
idx = np.arange(64)
for c in range(3): ok = ~np.isnan(lut[:, c]); lut[:, c] = np.interp(idx, idx[ok], lut[ok, c])
def match(v, m):
    q = np.quantile(v[m], np.linspace(0, 1, 101)); return np.interp(v, q, rq)
for k in ["lucy", "turkana", "ferrassie", "hobbit"]:
    im = load(k); rgb, a = im[..., :3], im[..., 3:]
    mx, mn = rgb.max(-1), rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-6)
    L = lum(rgb); vis = a[..., 0] > .5
    brown = np.clip((sat - .22) / .16, 0, 1)
    Lw = match(L, vis & (brown < .5)) if (vis & (brown < .5)).sum() > 500 else L
    Lb = match(L, vis & (brown >= .5)) if (vis & (brown >= .5)).sum() > 500 else L
    L2 = Lw * (1 - brown) + Lb * brown
    out = lut[np.clip((L2 * 63).astype(int), 0, 63)]
    Image.fromarray((np.concatenate([out, a], -1) * 255).astype(np.uint8)).save(ROOT / "img" / f"{k}-cast.webp", "WEBP", quality=82, method=6)
    print(k, (ROOT / "img" / f"{k}-cast.webp").stat().st_size // 1024, "KB")
