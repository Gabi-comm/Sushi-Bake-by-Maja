"""PWA / favicon icons: the Quad cut-out on the brand orange.

Run: python scripts/icons.py   (from the repo root)
"""
from PIL import Image, ImageDraw, ImageFilter

ORANGE = (232, 99, 26, 255)
tray = Image.open("public/img/trays/quad.webp").convert("RGBA")


def icon(size, fill, rounded=False):
    """`fill` = share of the canvas the tray spans (maskable icons keep it inside the 80% safe zone)."""
    im = Image.new("RGBA", (size, size), ORANGE)
    t = tray.copy()
    t.thumbnail((int(size * fill), int(size * fill)), Image.LANCZOS)
    x, y = (size - t.width) // 2, (size - t.height) // 2
    shadow = Image.new("RGBA", t.size, (40, 12, 0, 0))
    shadow.putalpha(t.getchannel("A").point(lambda a: a * 0.45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.02))
    im.alpha_composite(shadow, (x, y + int(size * 0.03)))
    im.alpha_composite(t, (x, y))
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=size // 5, fill=255)
        im.putalpha(mask)
    return im


icon(192, 0.86).save("public/icons/icon-192.png")
icon(512, 0.86).save("public/icons/icon-512.png")
icon(512, 0.66).save("public/icons/maskable-512.png")
icon(180, 0.84).convert("RGB").save("src/app/apple-icon.png")
icon(64, 0.92, rounded=True).save("src/app/icon.png")
