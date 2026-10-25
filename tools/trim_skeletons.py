"""Обрезка сгенерированных скелетов по контуру (макушка = верх, пятки = низ) и экспорт в WebP для сайта."""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
for src in sorted((ROOT / "img" / "raw").glob("*.png")):
    im = Image.open(src).convert("RGBA")
    a = im.getchannel("A").point(lambda v: 255 if v > 24 else 0)
    im = im.crop(a.getbbox())
    h = 900; im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    out = ROOT / "img" / f"{src.stem}.webp"; im.save(out, "WEBP", quality=82, method=6)
    print(src.stem, im.size, out.stat().st_size // 1024, "KB")
