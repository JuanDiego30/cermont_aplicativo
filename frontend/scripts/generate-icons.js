// Script para generar iconos PWA básicos
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar SVG para cada tamaño
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1D5FA8"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>`;

  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Por ahora guardamos el SVG con extensión .png
  // En producción deberías convertir SVG a PNG real con una librería como sharp
  fs.writeFileSync(filename, svg);
  console.log(`? Creado: icon-${size}x${size}.png`);
});

console.log('\n? Iconos PWA generados exitosamente');
console.log('??  NOTA: En producción, deberías usar una herramienta como sharp para convertir SVG a PNG real');
