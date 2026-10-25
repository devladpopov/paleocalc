# Сборка описи костей (уровень 2) из черновиков .work-inv/g*.json в data/inventory.json и data/inventory.js.
# Ключ: specimen ровно как в data/will2017.json. Неизвестные зоны и статусы отбрасываются с предупреждением.
import glob, json, os, sys
sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MID = {"cran", "mand", "teeth", "cerv", "thor", "lumb", "sacr", "ribs"}
SIDE = {"clav", "scap", "hum", "rad", "uln", "hand", "coxa", "fem", "pat", "tib", "fib", "foot"}
names = {r["specimen"] for r in json.load(open(os.path.join(ROOT, "data", "will2017.json"), encoding="utf-8"))}

inv = {}
for f in sorted(glob.glob(os.path.join(ROOT, ".work-inv", "g*.json"))):
    for x in json.load(open(f, encoding="utf-8")):
        sp = x["specimen"]
        if sp not in names:
            print("нет в базе:", sp, file=sys.stderr); continue
        zones = {}
        for k, v in (x.get("zones") or {}).items():
            base, _, side = k.partition("_")
            ok = (k in MID) or (base in SIDE and side in ("r", "l", "x"))
            if not ok or v not in ("c", "p"):
                print(f"{sp}: пропущена зона {k}={v}", file=sys.stderr); continue
            zones[k] = v
        inv[sp] = {"zones": zones, "pct": x.get("pct") or None, "found_ru": (x.get("found_ru") or "").strip(),
                   "sources": [s for s in (x.get("sources") or []) if s.get("cite")], "doubt": x.get("doubt") or None}

json.dump(inv, open(os.path.join(ROOT, "data", "inventory.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(os.path.join(ROOT, "data", "inventory.js"), "w", encoding="utf-8") as o:
    o.write("// Опись сохранившихся костей (уровень 2), собрана по публикациям; ждёт сверки. Генерируется tools/build_inventory.py\n")
    o.write("window.INV = " + json.dumps(inv, ensure_ascii=False) + ";\n")
print(len(inv), "находок:", ", ".join(inv))
