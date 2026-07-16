#!/usr/bin/env python3
"""
Crop iPhone screenshot source images into cleaned modal JPEGs.

Hand-tuned coordinates derived from pixel inspection of each source file.
Run: python3 scripts/crop-modal-images.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GALLERY = ROOT / "public/images/gallery/past-projects"
OUTPUT_DIR = ROOT / "public/images/projects/modal"
CARD_OUTPUT_DIR = ROOT / "public/images/projects"
JPEG_QUALITY = 93

# (left, top, right, bottom) — PIL crop box, right/bottom are exclusive
# rotate: degrees CCW applied after crop (0 = keep as-is)
CROPS = {
    "modern-oak-sideboard": {
        "source": GALLERY / "modern-oak-sideboard.jpg",
        "output": OUTPUT_DIR / "modern-oak-sideboard-modal.jpg",
        # Full-width photo after Files header; portrait furniture shot.
        "box": (0, 531, 1284, 2243),
        "rotate": 0,
    },
    "black-walnut-table-combo": {
        "source": GALLERY / "black-walnut-table-combo.jpg",
        "output": OUTPUT_DIR / "black-walnut-table-combo-modal.jpg",
        # Landscape dining + couch table combo on grey backdrop.
        "box": (0, 960, 1284, 1815),
        "rotate": 0,
    },
    "black-walnut-smokey-grey-epoxy-table": {
        "source": GALLERY / "black-walnut-smokey-grey-epoxy-table.jpg",
        "output": OUTPUT_DIR / "black-walnut-smokey-grey-epoxy-table-modal.jpg",
        # Landscape epoxy coffee table on grey backdrop.
        "box": (0, 906, 1284, 1869),
        "rotate": 0,
    },
    "live-edge-mahogany-table": {
        "source": GALLERY / "live-edge-mahogany-table.jpg",
        "output": OUTPUT_DIR / "live-edge-mahogany-table-modal.jpg",
        # Portrait dining table with slipcovered chairs.
        "box": (0, 531, 1284, 2243),
        "rotate": 0,
    },
    "walnut-dining-table": {
        "source": GALLERY / "walnut-dining-table-steel-base.jpg",
        "output": OUTPUT_DIR / "walnut-dining-table-modal.jpg",
        # Landscape walnut dining table on grey backdrop.
        "box": (0, 906, 1284, 1869),
        "rotate": 0,
    },
    "american-black-walnut-coffee-table-walnut-legs": {
        "source": GALLERY / "american-black-walnut-coffee-table-walnut-legs.jpg",
        "output": OUTPUT_DIR / "american-black-walnut-coffee-table-walnut-legs-modal.jpg",
        # Landscape coffee table with walnut legs.
        "box": (0, 960, 1284, 1815),
        "rotate": 0,
    },
    "live-edge-olive-couch-table": {
        "source": GALLERY / "live-edge-olive-couch-table.jpg",
        "output": OUTPUT_DIR / "live-edge-olive-couch-table-modal.jpg",
        # Landscape olive couch table on grey backdrop.
        "box": (0, 960, 1284, 1815),
        "rotate": 0,
    },
    "zebrano-side-tables": {
        "source": GALLERY / "zebrano-side-tables.jpg",
        "output": OUTPUT_DIR / "zebrano-side-tables-modal.jpg",
        # Portrait zebrano side tables in living room.
        "box": (0, 531, 1284, 2243),
        "rotate": 0,
    },
    "mixed-hardwood-bottle-openers": {
        "source": GALLERY / "mixed-hardwood-bottle-openers.jpg",
        "output": OUTPUT_DIR / "mixed-hardwood-bottle-openers-modal.jpg",
        # Portrait wall-mounted bottle openers on white backdrop.
        "box": (0, 531, 1284, 2243),
        "rotate": 0,
    },
    "walnut-maple-purpleheart-coasters": {
        "source": GALLERY / "walnut-maple-purpleheart-coasters.jpg",
        "output": OUTPUT_DIR / "walnut-maple-purpleheart-coasters-modal.jpg",
        # Portrait coaster set on white backdrop.
        "box": (0, 531, 1284, 2243),
        "rotate": 0,
    },
    "golf-lisnice-board": {
        "source": GALLERY / "golf-lisnice-board.jpg",
        "output": OUTPUT_DIR / "golf-lisnice-board-modal.jpg",
        # Remove black bars above/below photo; keep board + surrounding carpet.
        "box": (0, 531, 1284, 2243),
        # Board is vertical in source; rotate CCW so text reads left-to-right.
        "rotate": 90,
    },
    "pig-roast-event-board": {
        "source": GALLERY / "pig-roast-event-board.jpg",
        "output": OUTPUT_DIR / "pig-roast-event-board-modal.jpg",
        # Landscape pig roast board with beer mug outdoors.
        "box": (0, 906, 1284, 1869),
        "rotate": 0,
    },
    "superman-epoxy-wall-art": {
        "source": GALLERY / "superman-epoxy-wall-art.jpg",
        "output": OUTPUT_DIR / "superman-epoxy-wall-art-modal.jpg",
        # Strip status bar, Files header, black bars, and carpet margins.
        # Tight crop on walnut slabs + blue epoxy + Superman emblem.
        "box": (0, 1035, 1284, 1714),
        "rotate": 0,
    },
}

# Card-only images (separate from modal when orientation differs for grid display)
CARD_CROPS = {
    "golf-lisnice-board": {
        "source": GALLERY / "golf-lisnice-board.jpg",
        "output": CARD_OUTPUT_DIR / "golf-lisnice-board-card.jpg",
        # Same crop as modal; rotate so board reads horizontally in 4:3 card grid.
        "box": (0, 531, 1284, 2243),
        "rotate": 90,
    },
}


def crop_and_save(name: str, spec: dict) -> None:
    source = spec["source"]
    output = spec["output"]
    box = spec["box"]
    rotate = spec.get("rotate", 0)

    img = Image.open(source).convert("RGB")
    cropped = img.crop(box)

    if rotate:
        cropped = cropped.rotate(rotate, expand=True)

    output.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(output, "JPEG", quality=JPEG_QUALITY, optimize=True)

    print(f"{name}:")
    print(f"  source:  {source.name} ({img.size[0]}x{img.size[1]})")
    print(f"  crop:    {box} → {box[2]-box[0]}x{box[3]-box[1]}")
    if rotate:
        print(f"  rotate:  {rotate}° CCW")
    print(f"  output:  {output.relative_to(ROOT)} ({cropped.size[0]}x{cropped.size[1]})")


def main() -> None:
    print("=== Modal images ===")
    for name, spec in CROPS.items():
        crop_and_save(name, spec)

    print("\n=== Card images ===")
    for name, spec in CARD_CROPS.items():
        crop_and_save(name, spec)


if __name__ == "__main__":
    main()
