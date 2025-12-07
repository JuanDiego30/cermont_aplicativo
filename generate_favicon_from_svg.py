"""
Genera favicon.ico desde public/Cermont_sin_fondo.svg
- Rasteriza el SVG a PNG en múltiples tamaños
- Empaqueta todas las capas en un ICO
Requiere: cairosvg, Pillow
"""
from io import BytesIO
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "public" / "Cermont_sin_fondo.svg"
OUT_ICO = ROOT / "public" / "favicon.ico"
OUT_PNG = ROOT / "public" / "favicon-512.png"

SIZES = [16, 32, 48, 64, 128, 256]


def svg_to_png_bytes(svg_path: Path, size: int) -> bytes:
    scale = size / 1024  # svg viewBox is 1024
    return cairosvg.svg2png(url=str(svg_path), scale=scale)


def main() -> None:
    if not SRC.exists():
        raise FileNotFoundError(f"No se encontró {SRC}")

    png_layers = []
    for size in SIZES:
        data = svg_to_png_bytes(SRC, size)
        img = Image.open(BytesIO(data)).convert("RGBA")
        png_layers.append(img)

    # Guardar capa grande de referencia
    png_layers[-1].save(OUT_PNG, format="PNG")

    # Guardar ICO con todas las capas
    png_layers[0].save(
        OUT_ICO,
        format="ICO",
        sizes=[(s, s) for s in SIZES],
    )
    print("✓ Generado", OUT_ICO)
    print("✓ Generado", OUT_PNG)


if __name__ == "__main__":
    main()
