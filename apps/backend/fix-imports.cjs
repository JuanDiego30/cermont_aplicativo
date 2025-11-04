#!/usr/bin/env node

/**
 * Auto-Fix Imports Script
 * @description Corrige automáticamente imports vacíos ('') en todo el backend
 * @version 1.0.0
 * @usage node fix-imports.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');

// Mapeo de imports vacíos → rutas correctas
const IMPORT_MAP = {
  // Constantes
  'from \'\';\n // For constants': 'from \'../constants/index.js\';',
  'from \'\';\n // Enums': 'from \'../constants/index.js\';',
  'from \'\';\n // For enum': 'from \'../constants/index.js\';',

  // Middleware
  'sanitizeQuery from \'\'': 'sanitizeQuery from \'../middleware/sanitize.js\'',
  'validateRequest from \'\'': 'validateRequest from \'../middleware/validateRequest.js\'',
  'validateObjectId from \'\'': 'validateObjectId from \'../middleware/sanitize.js\'',
  'createRateLimiter from \'\'': 'createRateLimiter from \'../middleware/rateLimiter.js\'',
  'auditLogger from \'\'': 'auditLogger from \'../middleware/audit.js\'',
  'cacheMiddleware from \'\'': 'cacheMiddleware from \'../middleware/cache.js\'',
  'invalidateCache from \'\'': 'invalidateCache from \'../middleware/cache.js\'',
  'invalidateCacheById from \'\'': 'invalidateCacheById from \'../middleware/cache.js\'',

  // Controllers
  'from \'../utils/asyncHandler\'': 'from \'../controllers',

  // Models
  'from \'\';\n // Order': 'from \'../models/Order.js\'',
  'from \'\';\n // User': 'from \'../models/User.js\'',
  'from \'\';\n // WorkPlan': 'from \'../models/WorkPlan.js\'',
  'from \'\';\n // ToolKit': 'from \'../models/ToolKit.js\'',
};

// Regex patterns para detectar imports vacíos
const PATTERNS = [
  {
    regex: /import\s+{\s*([^}]+?)\s*}\s+from\s+['"](['"])/g,
    replacement: (match, imports, quote) => {
      const importList = imports.split(',').map(i => i.trim());
      console.log(`⚠️  Found empty import: ${imports}`);
      return `// ✅ FIXED: ${match}`;
    }
  }
];

/**
 * Procesa recursivamente todos los archivos .ts y .js
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Evitar node_modules y .git
      if (!file.startsWith('.') && file !== 'node_modules') {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      processFile(filePath);
    }
  });
}

/**
 * Procesa un archivo individual
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Buscar imports vacíos
    const emptyImportRegex = /import\s+{\s*([^}]+?)\s*}\s+from\s+['"](['"])/g;
    const matches = [...content.matchAll(emptyImportRegex)];

    if (matches.length > 0) {
      console.log(`\n📄 Archivo: ${filePath}`);
      console.log(`   Encontrados ${matches.length} imports vacíos`);

      matches.forEach(match => {
        const [fullMatch, imports] = match;
        const importList = imports.split(',').map(i => i.trim());

        // Intentar mapear automáticamente
        let suggestedPath = '';
        importList.forEach(imp => {
          if (imp.includes('sanitizeQuery')) suggestedPath = '../middleware/sanitize.js';
          if (imp.includes('validateRequest')) suggestedPath = '../middleware/validateRequest.js';
          if (imp.includes('auditLogger')) suggestedPath = '../middleware/audit.js';
          if (imp.includes('createRateLimiter')) suggestedPath = '../middleware/rateLimiter.js';
          if (imp.includes('cacheMiddleware')) suggestedPath = '../middleware/cache.js';
          if (imp.includes('ROLES') || imp.includes('HTTP_STATUS')) suggestedPath = '../constants/index.js';
        });

        if (suggestedPath) {
          const correctedImport = `import { ${imports} } from '${suggestedPath}'`;
          content = content.replace(fullMatch, correctedImport);
          console.log(`   ✅ Corregido: import { ${imports} } from '${suggestedPath}'`);
        } else {
          console.log(`   ⚠️  Manual check needed: import { ${imports} }`);
        }
      });

      // Escribir cambios si hay diferencias
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`   💾 Guardado`);
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
console.log('🔧 Auto-Fix Imports Script');
console.log('==========================\n');
console.log(`📂 Procesando: ${SRC_DIR}\n`);

try {
  processDirectory(SRC_DIR);
  console.log('\n✅ Proceso completado\n');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}