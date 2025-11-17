/**
 * Script para agregar extensiones .js a imports relativos en archivos TypeScript
 * Necesario para NodeNext module resolution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Regex para capturar imports relativos sin extensión
  const importRegex = /^(import\s+.*from\s+['"])(\.[^'"]+)(['"])/gm;
  
  const newContent = content.replace(importRegex, (match, before, importPath, after) => {
    // Si ya tiene extensión .js, .json, o .ts, no modificar
    if (importPath.match(/\.(js|json|ts)$/)) {
      return match;
    }
    
    // Agregar .js
    modified = true;
    return `${before}${importPath}.js${after}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${path.relative(srcDir, filePath)}`);
    return 1;
  }
  
  return 0;
}

function walkDirectory(dir) {
  let filesFixed = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      filesFixed += walkDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      filesFixed += processFile(filePath);
    }
  }
  
  return filesFixed;
}

console.log('🔧 Fixing TypeScript imports...\n');
const totalFixed = walkDirectory(srcDir);
console.log(`\n✅ Fixed ${totalFixed} files`);
