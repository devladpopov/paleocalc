"""Контур суши для карты находок: Natural Earth 1:50m land (public domain), обрезка до Старого Света,
равнопромежуточная проекция, упрощение, вывод в data/world.js (одна SVG-строка path)."""
import json, sys
from pathlib import Path
from shapely.geometry import shape, box
from shapely.ops import transform
ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / ".tmp" / "ne50.geojson"
LON0, LON1, LAT0, LAT1, W = -20, 135, -40, 62, 960
K = W / (LON1 - LON0); H = round((LAT1 - LAT0) * K)
clip = box(LON0, LAT0, LON1, LAT1)
proj = lambda x, y, z=None: (( (x - LON0) * K), ((LAT1 - y) * K))
parts = []
for f in json.loads(SRC.read_text(encoding="utf-8"))["features"]:
    g = shape(f["geometry"]).intersection(clip)
    if g.is_empty: continue
    g = transform(proj, g).simplify(0.7, preserve_topology=True)
    for p in getattr(g, "geoms", [g]):
        if p.geom_type != "Polygon" or p.area < 2: continue
        for ring in [p.exterior, *p.interiors]:
            c = list(ring.coords)[:-1]
            parts.append("M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in c) + "Z")
d = "".join(parts).replace(".0 ", " ")
out = ROOT / "data" / "world.js"
out.write_text(f"// Natural Earth 1:50m land (public domain), equirectangular {LON0}..{LON1}E, {LAT0}..{LAT1}N\nwindow.WORLD={json.dumps({'lon0': LON0, 'lat1': LAT1, 'k': K, 'w': W, 'h': H, 'd': d})};\n", encoding="utf-8")
print(H, len(d) // 1024, "KB")
