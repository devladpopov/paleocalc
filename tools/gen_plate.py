"""Иллюстрация для блока «Научный отдел»: гравюра-таблица с инструментами антрополога, через OpenAI Images API.
Запуск: python tools/gen_plate.py [n]. Ключ: C:\\Users\\Vlad\\.creds\\secrets\\openai-stadika.env.
Результат: img/raw/plate-<i>.png; лучший вариант сжимается в img/plate.webp."""
import base64, os, sys, concurrent.futures as cf
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).resolve().parent.parent
for line in Path(r"C:\Users\Vlad\.creds\secrets\openai-stadika.env").read_text().splitlines():
    if line.startswith("OPENAI_API_KEY="):
        os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip().strip('"')
client = OpenAI()
OUT = ROOT / "img" / "raw"; OUT.mkdir(parents=True, exist_ok=True)

PROMPT = ("A single plate from a late 19th-century anthropology atlas: fine copperplate engraving, black ink line and cross-hatching on warm off-white paper, no colour. "
          "Still life arranged on the plate, seen slightly from above: a human femur lying on a wooden osteometric board (a flat board with a millimetre scale, a fixed upright end plate and a sliding block touching the end of the bone); "
          "a brass sliding caliper (vernier caliper) lying diagonally across the lower part; a spreading caliper with two curved arms and a small graduated arc, placed beside a human skull in three-quarter view; "
          "a tall Martin anthropometer rod standing at the right edge. Accurate anatomy and accurate instrument mechanics. "
          "Generous empty paper margins, thin double-ruled border around the plate. Absolutely no letters, no numbers, no captions, no text, no signature anywhere.")

def gen(i):
    r = client.images.generate(model="gpt-image-1.5", prompt=PROMPT, size="1536x1024", quality="high", output_format="png", n=1)
    p = OUT / f"plate-{i}.png"; p.write_bytes(base64.b64decode(r.data[0].b64_json)); return p

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    with cf.ThreadPoolExecutor(n) as ex:
        for p in ex.map(gen, range(1, n + 1)): print(p)
