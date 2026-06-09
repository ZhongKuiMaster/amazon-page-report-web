#!/usr/bin/env python3
import json
import ssl
import sys
import urllib.request
from io import BytesIO

import cv2
import numpy as np
from PIL import Image


def load_image(url: str):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=20, context=ssl._create_unverified_context()) as response:
        payload = response.read()

    image = Image.open(BytesIO(payload)).convert("RGB")
    arr = np.array(image)
    return arr


def resize_if_needed(arr: np.ndarray, max_width: int = 1200):
    h, w = arr.shape[:2]
    if w <= max_width:
        return arr
    scale = max_width / float(w)
    new_h = max(1, int(h * scale))
    return cv2.resize(arr, (max_width, new_h), interpolation=cv2.INTER_AREA)


def white_background_metrics(arr: np.ndarray):
    h, w = arr.shape[:2]
    band = max(4, int(min(h, w) * 0.06))
    border = np.concatenate(
        [
            arr[:band, :, :].reshape(-1, 3),
            arr[h - band :, :, :].reshape(-1, 3),
            arr[:, :band, :].reshape(-1, 3),
            arr[:, w - band :, :].reshape(-1, 3),
        ],
        axis=0,
    )
    near_white = np.all(border >= 240, axis=1)
    pure_white = np.all(border >= 250, axis=1)
    return {
        "border_near_white_ratio": round(float(np.mean(near_white)), 4),
        "border_pure_white_ratio": round(float(np.mean(pure_white)), 4),
    }


def detect_text_overlay(arr: np.ndarray):
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    dark_mask = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 11
    )
    light_mask = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, -11
    )

    def component_stats(mask):
        n, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        boxes = []
        for i in range(1, n):
            x, y, w, h, area = stats[i]
            if area < 12 or area > 1600:
                continue
            if w < 3 or h < 6 or w > 120 or h > 80:
                continue
            ratio = w / max(h, 1)
            if ratio < 0.15 or ratio > 12:
                continue
            fill = area / max(w * h, 1)
            if fill < 0.08 or fill > 0.92:
                continue
            boxes.append((x, y, w, h, area))
        return boxes

    dark_boxes = component_stats(dark_mask)
    light_boxes = component_stats(light_mask)
    boxes = dark_boxes if len(dark_boxes) >= len(light_boxes) else light_boxes

    if not boxes:
        return {
            "overlay_likely": False,
            "text_component_count": 0,
            "line_cluster_count": 0,
            "raw_cluster_count": 0,
        }

    ys = sorted(y for _, y, _, h, _ in boxes for y in [y + h / 2])
    clusters = []
    for y in ys:
        if not clusters or abs(y - clusters[-1][-1]) > 18:
            clusters.append([y])
        else:
            clusters[-1].append(y)

    valid_line_clusters = 0
    box_centers = [(x, y + h / 2, w, h) for x, y, w, h, _ in boxes]
    cluster_bands: list[tuple[float, float]] = []
    for cluster in clusters:
        if len(cluster) < 5:
            continue
        min_y = min(cluster)
        max_y = max(cluster)
        if max_y - min_y > 42:
            continue
        cluster_bands.append((min_y - 12, max_y + 12))

    for min_band_y, max_band_y in cluster_bands:
        band_boxes = [
            (x, center_y, w, h)
            for x, center_y, w, h in box_centers
            if min_band_y <= center_y <= max_band_y
        ]
        if len(band_boxes) < 5:
            continue
        x_positions = [x for x, _, _, _ in band_boxes]
        x_span = max(x_positions) - min(x_positions)
        if x_span < 40:
            continue
        valid_line_clusters += 1

    line_cluster_count = valid_line_clusters
    overlay_likely = valid_line_clusters >= 1

    return {
        "overlay_likely": overlay_likely,
        "text_component_count": len(boxes),
        "line_cluster_count": line_cluster_count,
        "raw_cluster_count": len(clusters),
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing image URL"}))
        sys.exit(1)

    image_url = sys.argv[1]
    try:
        arr = resize_if_needed(load_image(image_url))
        white_metrics = white_background_metrics(arr)
        text_metrics = detect_text_overlay(arr)

        result = {
            "imageUrl": image_url,
            "whiteBackgroundLikely": white_metrics["border_near_white_ratio"] >= 0.92,
            "mainImageHasTextOverlayLikely": text_metrics["overlay_likely"],
            "metrics": {
                **white_metrics,
                **text_metrics,
                "width": int(arr.shape[1]),
                "height": int(arr.shape[0]),
            },
        }
        print(json.dumps(result))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
