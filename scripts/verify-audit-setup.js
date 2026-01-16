#!/usr/bin/env node

/**
 * ✅ Verificación de configuración de auditoría
 *
 * Confirma que todos los archivos y dependencias necesarias están en su lugar.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const checks = [];

console.log('\n🔍 Verificando configuración de auditoría...\n');

// ============================================================================
// CHECKS
// ============================================================================

function check(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    checks.push({ name, pass: true });
  } else {
    console.log(`❌ ${name}`);
    checks.push({ name, pass: false });
  }
}

// 1. Dependencias
console.log('📦 Dependencias:\n');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check('  glob instalado', packageJson.devDependencies.glob !== undefined);
  check('  jscpd instalado', packageJson.devDependencies.jscpd !== undefined);
  check('  prettier instalado', packageJson.devDependencies.prettier !== undefined);
  check('  turbo instalado', packageJson.devDependencies.turbo !== undefined);
} catch (err) {
  console.error(`  ❌ Error leyendo package.json: ${err.message}`);
}

// 2. Archivos de script
console.log('\n📝 Scripts de auditoría:\n');

check(
  '  check-api-consistency.js existe',
  fs.existsSync(path.join(ROOT, 'scripts/audit/check-api-consistency.js'))
);
check(
  '  generate-audit-report.mjs existe',
  fs.existsSync(path.join(ROOT, 'scripts/generate-audit-report.mjs'))
);

// 3. Configuración
console.log('\n⚙️  Configuración:\n');

check('  .jscpd.json existe', fs.existsSync(path.join(ROOT, '.jscpd.json')));
check('  .github/workflows/ existe', fs.existsSync(path.join(ROOT, '.github/workflows')));
check(
  '  quality-audit-report.yml existe',
  fs.existsSync(path.join(ROOT, '.github/workflows/quality-audit-report.yml'))
);

// 4. Documentación
console.log('\n📚 Documentación:\n');

check('  docs/AUDIT_GUIDE.md existe', fs.existsSync(path.join(ROOT, 'docs/AUDIT_GUIDE.md')));

// 5. Scripts en package.json
console.log('\n🛠️  Scripts en package.json:\n');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check('  audit:local', packageJson.scripts['audit:local'] !== undefined);
  check('  audit:report', packageJson.scripts['audit:report'] !== undefined);
  check('  audit:full', packageJson.scripts['audit:full'] !== undefined);
} catch (err) {
  console.error(`  ❌ Error verificando scripts: ${err.message}`);
}

// 6. Backend/Frontend
console.log('\n📂 Estructura:\n');

check('  backend/ existe', fs.existsSync(path.join(ROOT, 'backend')));
check('  frontend/ existe', fs.existsSync(path.join(ROOT, 'frontend')));

// ============================================================================
// RESUMEN
// ============================================================================

const passed = checks.filter(c => c.pass).length;
const total = checks.length;

console.log('\n' + '═'.repeat(60));
console.log(`\n📊 Resultado: ${passed}/${total} verificaciones pasadas\n`);

if (passed === total) {
  console.log('✅ ¡Auditoría lista! Puedes ejecutar:\n');
  console.log('   pnpm run audit:full      # Auditoría completa');
  console.log('   pnpm run audit:local     # Auditoría local');
  console.log('   pnpm run audit:report    # Solo generar reporte\n');
  process.exit(0);
} else {
  console.log('⚠️  Algunas verificaciones fallaron. Por favor:\n');
  console.log('   1. Asegúrate de tener todas las dependencias:');
  console.log('      pnpm install\n');
  console.log('   2. Verifica que los scripts existan en scripts/audit/\n');
  console.log('   3. Revisa la guía: docs/AUDIT_GUIDE.md\n');
  process.exit(1);
}
