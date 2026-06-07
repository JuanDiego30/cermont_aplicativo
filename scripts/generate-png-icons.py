#!/usr/bin/env python3
"""Generate PNG icons from SVG for PWA manifest."""
import os
import subprocess
import sys

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
svg_path = "frontend/public/icons/logo-cermont.svg"
output_dir = "frontend/public/icons"

# Check if rsvg-convert is available (part of librsvg)
try:
    subprocess.run(["rsvg-convert", "--version"], capture_output=True, check=True)
    use_rsvg = True
except (subprocess.CalledProcessError, FileNotFoundError):
    use_rsvg = False

if use_rsvg:
    for size in sizes:
        output_path = os.path.join(output_dir, f"logo-{size}x{size}.png")
        subprocess.run([
            "rsvg-convert", 
            "-w", str(size), 
            "-h", str(size),
            "-o", output_path,
            svg_path
        ], check=True)
        print(f"Created logo-{size}x{size}.png")
else:
    # Fallback: create simple PNG files using ImageMagick if available
    try:
        subprocess.run(["convert", "--version"], capture_output=True, check=True)
        for size in sizes:
            output_path = os.path.join(output_dir, f"logo-{size}x{size}.png")
            subprocess.run([
                "convert",
                svg_path,
                "-resize", f"{size}x{size}",
                output_path
            ], check=True)
            print(f"Created logo-{size}x{size}.png")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("ERROR: Neither rsvg-convert nor ImageMagick 'convert' found.")
        print("Please install librsvg (rsvg-convert) or ImageMagick.")
        sys.exit(1)