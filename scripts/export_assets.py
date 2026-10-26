"""Write web-ready assets into public/ from the cut-outs, textures and raw photos.

usage: python scripts/export_assets.py <bake_dir> <cutout_dir> <texture_dir>
"""
import sys
from pathlib import Path

from PIL import Image

PUBLIC = Path(__file__).resolve().parent.parent / "public"
GALLERY = {
    "831527692_122135395701384660_353979817647451451_n.jpg": "quad-table",
    "830630426_122135395977384660_7092714644137602315_n.jpg": "duo-table",
    "831010555_122135395989384660_4525149822041196464_n.jpg": "duo-table-2",
    "834472502_122135395743384660_1858672142992199991_n.jpg": "regular-table",
    "831527709_122135395965384660_6727571552699395231_n.jpg": "table-5",
    "831771047_122135396001384660_5163679890984088885_n.jpg": "table-6",
    "833715247_122135396025384660_4743478107035551285_n.jpg": "table-7",
}


def save(im, dest, width, quality=82):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=quality, method=6)
    print(dest.relative_to(PUBLIC), im.size, dest.stat().st_size // 1024, "KB")


def main():
    bake, cut, tex = (Path(p) for p in sys.argv[1:4])
    for png in sorted(cut.glob("*.png")):
        save(Image.open(png), PUBLIC / "img/trays" / f"{png.stem}.webp", 1100 if png.stem == "quad" else 800)
    for jpg in sorted(tex.glob("*.jpg")):
        save(Image.open(jpg).convert("RGB"), PUBLIC / "tex" / f"{jpg.stem}.webp", 1024, 80)
    for name, slug in GALLERY.items():
        save(Image.open(bake / name).convert("RGB"), PUBLIC / "img/gallery" / f"{slug}.webp", 1100)
    banner = Image.open(bake / "738511953_122101208499384660_7263874320483981143_n.png").convert("RGB")
    save(banner, PUBLIC / "img/banner.webp", 1600)
    banner.resize((1200, round(1200 * banner.height / banner.width))).crop((0, 0, 1200, 457)).save(PUBLIC / "og.jpg", quality=84)


if __name__ == "__main__":
    main()
