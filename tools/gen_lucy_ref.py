"""Люси по референсу: фото реконструкции из музея (img/ref/lucy-cleveland.jpg), чтобы раскраска найденных костей совпадала с оригиналом."""
import base64, os
from pathlib import Path
from openai import OpenAI
ROOT = Path(__file__).resolve().parent.parent
for line in Path(r"C:\Users\Vlad\.creds\secrets\openai-stadika.env").read_text().splitlines():
    if line.startswith("OPENAI_API_KEY="): os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip().strip('"')
PROMPT = ("Recreate exactly this museum reconstruction of the Lucy skeleton (Australopithecus afarensis, AL 288-1) as a clean photorealistic studio photograph: "
          "the same skeleton, standing upright, strictly frontal view, full body from the top of the skull to the soles of the feet, centred, filling the frame vertically, "
          "arms hanging at the sides, fully transparent background, no glass case, no stand, no label card, no text, no shadow. "
          "Keep EXACTLY the same colour coding as in the reference: every bone and every bone fragment that is brown in the reference stays dark brown fossil bone, "
          "everything that is white in the reference stays matte white plaster, in the same places and on the same sides of the body "
          "(brown mandible and brown patches on the skull, brown left humerus and right humerus shaft, brown rib fragments, brown sacrum and left hip bone, brown left femur, brown ends of the right tibia, brown talus). "
          "Replace the pale blue cartilage lines on the rib cage with white plaster. Keep the ape-like skull with projecting face and no forehead, the long arms and the funnel-shaped rib cage.")
client = OpenAI()
with open(ROOT / "img" / "ref" / "lucy-cleveland.jpg", "rb") as f:
    r = client.images.edit(model="gpt-image-1.5", image=f, prompt=PROMPT, size="1024x1536", quality="high", background="transparent", output_format="png", input_fidelity="high")
(ROOT / "img" / "raw" / "lucy.png").write_bytes(base64.b64decode(r.data[0].b64_json)); print("ok")
