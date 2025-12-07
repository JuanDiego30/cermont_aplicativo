"""
Genera favicon.ico a partir de Cermont_sin_fondo.png agregando fondo circular blanco.
Requisitos: Pillow
"""
from pathlib import Path
from typing import List

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "Cermont_sin_fondo.png"
OUT_DIR = ROOT / "public"
OUT_DIR.mkdir(exist_ok=True)
OUT_ICO = OUT_DIR / "favicon.ico"
OUT_PNG = OUT_DIR / "favicon-512.png"
SIZES: List[int] = [16, 32, 48, 64, 128, 256, 512]


def add_white_circle(img: Image.Image, size: int) -> Image.Image:
    """Crea lienzo cuadrado con círculo blanco y centra el logo."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    margin = int(size * 0.05)
    draw.ellipse((margin, margin, size - margin, size - margin), fill=(255, 255, 255, 255))

    # escalar logo manteniendo proporción ocupando ~70% del canvas
    target = int(size * 0.7)
    logo = img.copy()
    logo.thumbnail((target, target), Image.Resampling.LANCZOS)

    offset = ((size - logo.width) // 2, (size - logo.height) // 2)
    canvas.alpha_composite(logo, offset)
    return canvas


def main() -> None:
    if not SRC.exists():
        raise FileNotFoundError(f"No se encontró {SRC}")

    base = Image.open(SRC).convert("RGBA")
    layers = []
    for size in SIZES:
        layers.append(add_white_circle(base, size))

    # exportar PNG grande de referencia
    layers[-1].save(OUT_PNG, format="PNG")

    # exportar ICO con múltiples tamaños
    layers[0].save(OUT_ICO, format="ICO", sizes=[(s, s) for s in SIZES if s <= 256])
    print("✓ Favicon generado en", OUT_ICO)
    print("✓ PNG generado en", OUT_PNG)


if __name__ == "__main__":
    main()
