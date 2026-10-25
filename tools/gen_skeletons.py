"""Генерация иллюстраций скелетов для блока «Вы и Люси» через OpenAI Images API.
Запуск: python tools/gen_skeletons.py [id ...]. Ключ: C:\\Users\\Vlad\\.creds\\secrets\\openai-stadika.env.
Результат: img/raw/<id>.png (как пришло), затем tools/trim_skeletons.py обрезает по контуру."""
import base64, os, sys, concurrent.futures as cf
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).resolve().parent.parent
for line in Path(r"C:\Users\Vlad\.creds\secrets\openai-stadika.env").read_text().splitlines():
    if line.startswith("OPENAI_API_KEY="):
        os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip().strip('"')
client = OpenAI()
OUT = ROOT / "img" / "raw"; OUT.mkdir(parents=True, exist_ok=True)

COMMON = ("Scientific museum photograph of a single mounted skeleton, strictly frontal anatomical view (anatomical position, arms hanging at the sides, palms forward), "
          "standing upright, full body from the top of the skull to the soles of the feet, centred, filling the frame vertically, even soft studio lighting, "
          "fully transparent background, no mount stand, no rod, no shadow on the floor, no labels, no text, no scale bar. Photorealistic, high detail.")
FOSSIL = ("Colour code exactly like a museum reconstruction cast: ORIGINAL fossil bones that were actually found are dark chocolate-brown mineralised bone with a slight sheen; "
          "MISSING bones that were reconstructed are matte off-white plaster. The contrast between brown original and white reconstructed bones must be obvious. "
          "Colour every bone individually according to the lists below. Do NOT split the skeleton into a brown half and a white half; brown and white bones are mixed on both sides of the body. LEFT and RIGHT mean the specimen's own anatomical sides (in this frontal view the specimen's left is on the viewer's right). ")

P = {
    "lucy": COMMON + FOSSIL + (
        "Specimen: AL 288-1 'Lucy', adult female Australopithecus afarensis, 3.2 million years old, about 105 cm tall. "
        "Anatomy: small ape-sized skull with projecting face and no forehead, funnel-shaped (conical) rib cage, wide flaring short pelvis, arms long relative to the legs, "
        "slightly curved finger bones, knees angled inward (valgus), bipedal feet. "
        "Brown (found, about 40% of the skeleton): the mandible (lower jaw); a few small brown patches on the otherwise white braincase; LEFT humerus and the shaft of the RIGHT humerus; "
        "the RIGHT radius and ulna; a few finger bones; fragments of several ribs on BOTH sides (only short brown pieces within otherwise white ribs); "
        "about six thoracic vertebrae and two lumbar vertebrae; the sacrum; the LEFT hip bone; the LEFT femur; the upper and lower ends of the RIGHT tibia; the lower end of the RIGHT fibula; the RIGHT talus and a few toe bones. "
        "White plaster (reconstructed): the whole skull except the mandible and small patches, both clavicles and scapulae, the LEFT forearm, the RIGHT hip bone, the RIGHT femur, the LEFT tibia and fibula, "
        "the LEFT foot, almost all of both hands, the cervical vertebrae, most of the rib length."),
    "turkana": COMMON + FOSSIL + (
        "Specimen: KNM-WT 15000 'Turkana Boy', adolescent Homo erectus, 1.5 million years old, tall and slender, about 160 cm tall at death. "
        "Anatomy: long-legged, narrow-hipped body like modern East Africans, barrel rib cage, skull with low vault, heavy brow ridge, no chin, about 880 cm3 brain. "
        "Brown (found, one of the most complete early hominin skeletons): cranium and mandible, most vertebrae, most ribs, both hip bones, sacrum, both femora, both tibiae, "
        "both fibulae, both humeri, radius and ulna, clavicles and scapulae. "
        "White plaster (reconstructed): almost all hand bones and almost all foot bones (both hands and both feet are white), a few ribs. Both legs including both shin bones are brown."),
    "ferrassie": COMMON + FOSSIL + (
        "Specimen: La Ferrassie 1, adult male Neanderthal (Homo neanderthalensis), about 45 000 years old, about 172 cm tall, very robust. "
        "Anatomy: large long low skull with big brow ridge, large nose opening, no chin, wide barrel-shaped chest, wide pelvis, thick bones, short forearms and short shins relative to upper arm and thigh. "
        "Brown (found, a fairly complete skeleton): cranium and mandible, many vertebrae and ribs, both hip bones (damaged), both femora, both tibiae and fibulae, both humeri, forearms, "
        "most hand bones and most foot bones. "
        "White plaster (reconstructed): some ribs, some vertebrae, parts of the pelvis and a few small hand and foot bones."),
    "hobbit": COMMON + FOSSIL + (
        "Specimen: LB1 'the Hobbit', adult female Homo floresiensis from Flores, Indonesia, about 60 000-100 000 years old, about 104 cm tall. "
        "Anatomy: tiny skull with chimp-sized brain (426 cm3), no chin, short legs, very long flat feet relative to the legs, wide pelvis, shoulders shrugged forward. "
        "Brown (found): cranium and mandible; the RIGHT femur, RIGHT tibia and RIGHT fibula; the LEFT hip bone; the RIGHT humerus and parts of both forearms; many bones of both feet; a few hand bones; a few short rib fragments and two vertebrae. "
        "White plaster (reconstructed): the whole rib cage (both sides white, apart from a few small brown fragments), the whole spine except two vertebrae, both clavicles and scapulae, the RIGHT hip bone, "
        "the whole LEFT leg (femur, tibia, fibula), the LEFT humerus, most of both hands."),}
MOD = COMMON + (" Real natural ivory-coloured human bone throughout (no plaster, no colour coding). Specimen: modern adult Homo sapiens, {sex}, about {h} cm tall, {build}. "
                "Anatomy: large rounded skull with vertical forehead and a chin, barrel-shaped rib cage, narrow pelvis, legs long relative to arms, arches in the feet. {prop}")
P["modern-short"] = MOD.format(sex="female", h=155, build="slender build", prop="Short stature: relatively shorter legs and slightly larger head relative to height.")
P["modern-mid"] = MOD.format(sex="male", h=172, build="average build", prop="Average human body proportions.")
P["modern-tall"] = MOD.format(sex="male", h=190, build="athletic build", prop="Tall stature: relatively longer legs and a slightly smaller head relative to height.")

def gen(k):
    r = client.images.generate(model="gpt-image-1.5", prompt=P[k], size="1024x1536", quality="high", background="transparent", output_format="png", n=1)
    (OUT / f"{k}.png").write_bytes(base64.b64decode(r.data[0].b64_json))
    return k

if __name__ == "__main__":
    ids = sys.argv[1:] or list(P)
    with cf.ThreadPoolExecutor(7) as ex:
        for f in cf.as_completed([ex.submit(gen, k) for k in ids]):
            try: print("ok", f.result(), flush=True)
            except Exception as e: print("ERR", repr(e)[:400], flush=True)
