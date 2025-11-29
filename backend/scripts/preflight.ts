#!/usr/bin/env node
import 'dotenv/config';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

/**
 * Pre-flight checks before starting the server
 */

interface CheckResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

const prisma = new PrismaClient();

const checks: CheckResult[] = [];

async function checkDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  const targetFile = databaseUrl.startsWith('file:')
    ? resolve(process.cwd(), databaseUrl.replace('file:', ''))
    : null;

  console.log('?? Verificando conexión a la base de datos (Prisma/SQLite)...');

  try {
    await prisma.$connect();

    checks.push({
      name: 'Database',
      status: 'ok',
      message: `Conectado a ${databaseUrl}`,
    });

    if (targetFile) {
      const exists = existsSync(targetFile);
      console.log(
        exists
          ? '? Archivo SQLite detectado'
          : '? Archivo SQLite no existe (se generará automáticamente)'
      );
    }

    console.log('? Base de datos accesible');
  } catch (error: any) {
    checks.push({
      name: 'Database',
      status: 'error',
      message: `No se pudo conectar: ${error.message}`,
    });

    console.error('? Base de datos inaccesible');
    console.error(`   ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkJWKS(): Promise<void> {
  const privateKeyPath = resolve(process.cwd(), process.env.JWKS_PRIVATE_PATH || 'config/jwks-private.json');
  const publicKeyPath = resolve(process.cwd(), process.env.JWKS_PUBLIC_PATH || 'config/jwks-public.json');

  console.log('?? Verificando archivos JWKS...');

  const privateExists = existsSync(privateKeyPath);
  const publicExists = existsSync(publicKeyPath);

  if (privateExists && publicExists) {
    checks.push({
      name: 'JWKS',
      status: 'ok',
      message: 'Archivos de claves encontrados',
    });
    console.log('? Archivos JWKS encontrados');
  } else {
    checks.push({
      name: 'JWKS',
      status: 'warning',
      message: 'Archivos de claves no encontrados, se generar�n autom�ticamente',
    });
    console.log('??  Archivos JWKS no encontrados');
    console.log('   Se generar�n autom�ticamente con: npm run jwks:generate');
  }
}

function checkEnvironment(): void {
  console.log('?? Verificando variables de entorno...');

  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_ISSUER',
    'JWT_AUDIENCE',
    'CORS_ORIGIN',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length === 0) {
    checks.push({
      name: 'Variables de Entorno',
      status: 'ok',
      message: 'Todas las variables requeridas est�n configuradas',
    });
    console.log('? Variables de entorno configuradas');
  } else {
    checks.push({
      name: 'Variables de Entorno',
      status: 'warning',
      message: `Faltan: ${missing.join(', ')}`,
    });
    console.log('??  Algunas variables de entorno no est�n configuradas:');
    missing.forEach(varName => console.log(`   - ${varName}`));
  }

  // Mostrar configuraci�n actual
  console.log('\n?? Configuraci�n actual:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   PORT: ${process.env.PORT || '4100'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL || 'file:./prisma/dev.db'}`);
  console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
}

function printSummary(): void {
  console.log('\n' + '='.repeat(50));
  console.log('?? RESUMEN DE VERIFICACIONES');
  console.log('='.repeat(50));

  checks.forEach(check => {
    const icon = check.status === 'ok' ? '?' : check.status === 'warning' ? '??' : '?';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  const hasErrors = checks.some(c => c.status === 'error');
  const hasWarnings = checks.some(c => c.status === 'warning');

  console.log('='.repeat(50));

  if (hasErrors) {
    console.log('\n? HAY ERRORES CR�TICOS');
    console.log('   El servidor no podr� iniciarse correctamente.');
    console.log('   Por favor, corrige los errores antes de continuar.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n??  HAY ADVERTENCIAS');
    console.log('   El servidor podr�a iniciarse, pero revisa las advertencias.\n');
  } else {
    console.log('\n? TODAS LAS VERIFICACIONES PASARON');
    console.log('   El servidor est� listo para iniciarse.\n');
  }
}

async function main(): Promise<void> {
  console.log('?? Verificando prerequisitos del servidor...\n');

  // Ejecutar verificaciones
  checkEnvironment();
  await checkJWKS();
  await checkDatabase();

  // Mostrar resumen
  printSummary();
}

main().catch(error => {
  console.error('? Error ejecutando verificaciones:', error);
  process.exit(1);
});
