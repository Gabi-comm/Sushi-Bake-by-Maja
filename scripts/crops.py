"""Food-only crops from the single-flavor menu cards (side-angle shots), used as
3D top textures. Boxes are in source pixels (2048-wide cards).

usage: python scripts/crops.py <src_dir> <out_dir>
"""
import sys
from pathlib import Path

from PIL import Image

CROPS = {
    "Cheesy Spam.jpg": ("cheesy-spam", (230, 600, 690, 1050)),
    "Spicy_tuna.jpg": ("spicy-tuna", (190, 650, 750, 930)),
    "cali_maki.jpg": ("california-maki", (200, 560, 700, 985)),
    "creamy_kani.jpg": ("creamy-kani", (200, 560, 700, 985)),
}

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
for name, (slug, box) in CROPS.items():
    Image.open(src / name).convert("RGB").crop(box).resize((1024, 768), Image.LANCZOS).save(out / f"{slug}.jpg", quality=86)
    print(slug)
