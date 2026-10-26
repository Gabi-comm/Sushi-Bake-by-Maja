"""Rectify each cut-out tray's food surface into a flat texture for the 3D top layer.

usage: python scripts/textures.py <cutout_dir> <out_dir>
"""
import sys
from pathlib import Path

import cv2
import numpy as np

# fraction trimmed from each side after rectifying, to drop the foil walls
INSET = {"quad": 0.13, "cheesy-spam": 0.10, "spicy-tuna": 0.12,
         "california-maki": 0.10, "creamy-kani": 0.10}


def order(pts):
    """Order corners tl, tr, br, bl."""
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], np.float32)


def main():
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    for slug, inset in INSET.items():
        rgba = cv2.imread(str(src / f"{slug}.png"), cv2.IMREAD_UNCHANGED)
        alpha = rgba[:, :, 3]
        contours, _ = cv2.findContours((alpha > 128).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        box = order(cv2.boxPoints(cv2.minAreaRect(max(contours, key=cv2.contourArea))))
        w = int(max(np.linalg.norm(box[0] - box[1]), np.linalg.norm(box[3] - box[2])))
        h = int(max(np.linalg.norm(box[0] - box[3]), np.linalg.norm(box[1] - box[2])))
        if h > w:  # keep landscape
            box = np.roll(box, -1, axis=0)
            w, h = h, w
        dst = np.array([[0, 0], [w, 0], [w, h], [0, h]], np.float32)
        flat = cv2.warpPerspective(rgba[:, :, :3], cv2.getPerspectiveTransform(box, dst), (w, h))
        dx, dy = int(w * inset), int(h * inset)
        flat = cv2.resize(flat[dy:h - dy, dx:w - dx], (1024, 768), interpolation=cv2.INTER_AREA)
        dest = out / f"{slug}.jpg"
        cv2.imwrite(str(dest), flat, [cv2.IMWRITE_JPEG_QUALITY, 86])
        print(dest)


if __name__ == "__main__":
    main()
