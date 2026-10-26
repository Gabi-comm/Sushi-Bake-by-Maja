"""Cut the foil trays out of the orange menu cards (OpenCV GrabCut, offline).

usage: python scripts/cutout.py <src_dir> <out_dir>
"""
import sys
from pathlib import Path

import cv2
import numpy as np

# file -> (output name, rough tray rect x0,y0,x1,y1 as fractions of the image)
JOBS = {
    "quad_sushi.jpg": ("quad", (0.0, 0.2, 0.51, 0.76)),
    "Cheesy Spam.jpg": ("cheesy-spam", (0.03, 0.24, 0.49, 0.79)),
    "Spicy_tuna.jpg": ("spicy-tuna", (0.02, 0.27, 0.51, 0.82)),
    "cali_maki.jpg": ("california-maki", (0.02, 0.23, 0.49, 0.81)),
    "creamy_kani.jpg": ("creamy-kani", (0.01, 0.25, 0.49, 0.79)),
}


def background_mask(img):
    """Pixels close to the card's flat orange are definite background."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    bg = cv2.inRange(hsv, (5, 150, 150), (20, 255, 255))
    return cv2.morphologyEx(bg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))


def cut(path, rect_frac):
    img = cv2.imread(str(path))
    h, w = img.shape[:2]
    x0, y0, x1, y1 = rect_frac
    rect = (int(x0 * w), int(y0 * h), int((x1 - x0) * w), int((y1 - y0) * h))

    mask = np.zeros((h, w), np.uint8)
    mask[:] = cv2.GC_BGD
    rx, ry, rw, rh = rect
    mask[ry:ry + rh, rx:rx + rw] = cv2.GC_PR_FGD
    # Flat orange inside the rect is still background (card shows through the corners).
    mask[(background_mask(img) > 0) & (mask == cv2.GC_PR_FGD)] = cv2.GC_PR_BGD

    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

    # Keep the largest blob (the tray), fill holes, soften the edge.
    n, labels, stats, _ = cv2.connectedComponentsWithStats(fg)
    biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    fg = np.where(labels == biggest, 255, 0).astype(np.uint8)
    contours, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    hull = cv2.convexHull(max(contours, key=cv2.contourArea))
    solid = np.zeros_like(fg)
    cv2.fillPoly(solid, [hull], 255)
    solid = cv2.erode(solid, np.ones((3, 3), np.uint8), iterations=2)
    # Card orange can survive along the hull edge (corner slivers): key it out
    # only within a band near the silhouette so orange food is untouched.
    band = cv2.subtract(solid, cv2.erode(solid, np.ones((61, 61), np.uint8)))
    solid[(band > 0) & (background_mask(img) > 0)] = 0
    solid = cv2.morphologyEx(solid, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    alpha = cv2.GaussianBlur(solid, (5, 5), 0)

    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha
    x, y, bw, bh = cv2.boundingRect(hull)
    return rgba[y:y + bh, x:x + bw]


def main():
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    for name, (slug, rect) in JOBS.items():
        rgba = cut(src / name, rect)
        dest = out / f"{slug}.png"
        cv2.imwrite(str(dest), rgba)
        print(dest, rgba.shape)


if __name__ == "__main__":
    main()
