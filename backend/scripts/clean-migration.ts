import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeSafeItem(itemPath: string, description: string): void {
  const fullPath = path.resolve(itemPath);

  if (fs.existsSync(fullPath)) {
    log(`🗑️  Eliminando: ${description}`, 'yellow');
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      log('   ✅ Eliminado', 'green');
    } catch (error) {
      log(`   ❌ Error: ${(error as Error).message}`, 'red');
    }
  } else {
    log(`⏭️  Saltado: ${description} (no existe)`, 'gray');
  }
}

async function main() {
  log('╔══════════════════════════════════════════════╗', 'cyan');
  log('║  🧹 LIMPIEZA DE BACKEND POST-MIGRACIÓN     ║', 'cyan');
  log('╚══════════════════════════════════════════════╝', 'cyan');
  log('');

  const backendPath = path.resolve(__dirname, '..');
  process.chdir(backendPath);

  log(`📁 Directorio de trabajo: ${backendPath}\n`, 'cyan');

  log('▶️  FASE 1: Limpiando duplicaciones de Prisma\n', 'magenta');
  removeSafeItem('prisma/prisma', 'prisma/prisma (carpeta duplicada)');
  removeSafeItem('prisma.config.ts', 'prisma.config.ts (raíz)');
  removeSafeItem('prisma/prisma.config.ts', 'prisma/prisma.config.ts');

  log('\n▶️  FASE 2: Eliminando modelos de Mongoose (obsoletos)\n', 'magenta');
  removeSafeItem('src/infra/db/models', 'src/infra/db/models (Mongoose models)');

  log('\n▶️  FASE 3: Eliminando controladores duplicados\n', 'magenta');
  removeSafeItem('src/infra/http/controllers/AuthControllerRefactored.ts', 'AuthControllerRefactored.ts');
  removeSafeItem('src/infra/http/controllers/OrdersControllerRefactored.ts', 'OrdersControllerRefactored.ts');
  removeSafeItem('src/infra/http/controllers/WorkPlansControllerRefactored.ts', 'WorkPlansControllerRefactored.ts');

  log('\n▶️  FASE 4: Eliminando scripts obsoletos de MongoDB\n', 'magenta');
  const scriptsToRemove = [
    'check-user.js',
    'check-user-detailed.js',
    'cleanDuplicateIndexes.js',
    'cleanUsers.ts',
    'recreate-users.js',
    'test-find-user.ts',
    'test-login.js',
    'test-login-simple.js',
    'verifyUsers.ts',
    'clean-db.ts',
    'reset-db.ts',
    'resetDatabase.ts',
  ];

  scriptsToRemove.forEach((script) => {
    removeSafeItem(`scripts/${script}`, `scripts/${script}`);
  });

  log('\n▶️  FASE 5: Eliminando configuración de MongoDB\n', 'magenta');
  removeSafeItem('src/shared/config/database.ts', 'src/shared/config/database.ts');

  log('\n▶️  FASE 6: Renombrando seed\n', 'magenta');
  if (fs.existsSync('scripts/seed-sqlite.ts')) {
    if (fs.existsSync('scripts/seed.ts')) {
      log('⚠️  scripts/seed.ts ya existe, eliminando seed-sqlite.ts', 'yellow');
      fs.unlinkSync('scripts/seed-sqlite.ts');
    } else {
      fs.renameSync('scripts/seed-sqlite.ts', 'scripts/seed.ts');
      log('✅ Renombrado: seed-sqlite.ts → seed.ts', 'green');
    }
  } else {
    log('⏭️  Saltado: seed-sqlite.ts no existe', 'gray');
  }

  log('\n╔══════════════════════════════════════════════╗', 'cyan');
  log('║  ✅ LIMPIEZA COMPLETADA                     ║', 'cyan');
  log('╚══════════════════════════════════════════════╝', 'cyan');

  log('\n📋 Próximos pasos:\n', 'yellow');
  log('   1. npx prisma generate');
  log('   2. npm run seed');
  log('   3. npm run dev');
  log('');

  log('🔄 Generando Prisma Client...', 'cyan');
  try {
    await execAsync('npx prisma generate');
    log('✅ Prisma Client generado', 'green');
  } catch (error) {
    log(`❌ Error al generar Prisma Client: ${(error as Error).message}`, 'red');
  }

  log('\n🌱 Ejecutando seed...', 'cyan');
  try {
    await execAsync('npm run seed');
    log('✅ Seed ejecutado correctamente', 'green');
  } catch (error) {
    log(`❌ Error al ejecutar seed: ${(error as Error).message}`, 'red');
  }

  log('\n✅ Listo para arrancar el servidor con: npm run dev', 'green');
}

main().catch((error) => {
  log(`❌ Error crítico: ${error.message}`, 'red');
  process.exit(1);
});
