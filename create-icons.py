#!/usr/bin/env python3
"""
Script para crear favicon.ico y logo.svg a partir del PNG de CERMONT
"""

import os
from PIL import Image, ImageDraw

# Crear directorio si no existe
os.makedirs('public', exist_ok=True)

# Dimensiones para diferentes tamaños
sizes = {
    'favicon.ico': [(16, 16), (32, 32), (48, 48), (64, 64)],
    'apple-touch-icon.png': [(180, 180)],
}

# Crear imagen con fondo redondo
def create_rounded_icon(size, bg_color=(255, 255, 255), primary_color=(0, 102, 204), secondary_color=(51, 204, 51)):
    """
    Crear icono con fondo redondo simulando el diseño de CERMONT
    """
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = int(size * 0.1)  # 10% margen
    
    # Fondo blanco redondeado
    draw.rounded_rectangle(
        [(margin, margin), (size - margin, size - margin)],
        radius=int(size * 0.2),
        fill=bg_color,
        outline=None
    )
    
    # Arco superior azul
    arc_thickness = int(size * 0.15)
    arc_margin = int(size * 0.25)
    
    draw.arc(
        [(arc_margin, arc_margin), (size - arc_margin, size - arc_margin)],
        start=0,
        end=180,
        fill=primary_color,
        width=arc_thickness
    )
    
    # Arco inferior verde
    draw.arc(
        [(arc_margin, arc_margin), (size - arc_margin, size - arc_margin)],
        start=180,
        end=360,
        fill=secondary_color,
        width=arc_thickness
    )
    
    return img

# Crear favicon.ico
try:
    print("Creando favicon.ico...")
    images = []
    for size in sizes['favicon.ico']:
        img = create_rounded_icon(size[0])
        images.append(img)
    
    images[0].save(
        'public/favicon.ico',
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print("✓ favicon.ico creado")
except Exception as e:
    print(f"✗ Error creando favicon.ico: {e}")

# Crear apple-touch-icon.png
try:
    print("Creando apple-touch-icon.png...")
    img = create_rounded_icon(180)
    img.save('public/apple-touch-icon.png', 'PNG')
    print("✓ apple-touch-icon.png creado")
except Exception as e:
    print(f"✗ Error creando apple-touch-icon.png: {e}")

# Crear logo.svg con fondo redondo
svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <style>
      .cermont-bg { fill: white; }
      .cermont-arc-top { stroke: #0066CC; stroke-width: 24; fill: none; }
      .cermont-arc-bottom { stroke: #33CC33; stroke-width: 24; fill: none; }
    </style>
  </defs>
  
  <!-- Fondo redondeado blanco -->
  <rect class="cermont-bg" x="15" y="15" width="170" height="170" rx="30" ry="30" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
  
  <!-- Arco superior azul -->
  <path class="cermont-arc-top" 
        d="M 60 80 A 50 50 0 0 1 140 80"
        stroke-linecap="round"/>
  
  <!-- Arco inferior verde -->
  <path class="cermont-arc-bottom" 
        d="M 140 120 A 50 50 0 0 1 60 120"
        stroke-linecap="round"/>
</svg>
'''

try:
    print("Creando logo.svg...")
    with open('public/logo.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print("✓ logo.svg creado")
except Exception as e:
    print(f"✗ Error creando logo.svg: {e}")

print("\n✅ Archivos de imagen completados:")
print("   - public/favicon.ico")
print("   - public/apple-touch-icon.png")
print("   - public/logo.svg")
