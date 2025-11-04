/**
 * @file auditStability.ts
 * @description Auditoría rápida de compilación, tests, seguridad y endpoints
 * @usage tsx scripts/auditStability.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface AuditResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: AuditResult[] = [];

/**
 * Ejecutar auditoría de compilación
 */
async function auditCompilation(): Promise<void> {
  try {
    console.log('📦 Auditing TypeScript compilation...');
    await execAsync('npm run type-check');

    results.push({
      name: 'TypeScript Compilation',
      status: 'pass',
      message: '✅ tsc --noEmit passed without errors'
    });
  } catch (error: any) {
    results.push({
      name: 'TypeScript Compilation',
      status: 'fail',
      message: '❌ tsc --noEmit failed',
      details: error.stderr || error.message
    });
  }
}

/**
 * Ejecutar auditoría de linting
 */
async function auditLinting(): Promise<void> {
  try {
    console.log('📝 Auditing ESLint...');
    const { stdout } = await execAsync('npm run lint');

    if (stdout.includes('✖') || stdout.includes('error')) {
      results.push({
        name: 'ESLint',
        status: 'fail',
        message: '❌ ESLint found issues',
        details: stdout.substring(0, 500)
      });
    } else {
      results.push({
        name: 'ESLint',
        status: 'pass',
        message: '✅ ESLint passed'
      });
    }
  } catch (error: any) {
    results.push({
      name: 'ESLint',
      status: 'fail',
      message: '❌ ESLint execution failed',
      details: error.message
    });
  }
}

/**
 * Ejecutar auditoría de pruebas
 */
async function auditTests(): Promise<void> {
  try {
    console.log('🧪 Auditing test suites...');
    const { stdout } = await execAsync('npm test');

    const passMatch = stdout.match(/(\d+) passed/);
    const failMatch = stdout.match(/(\d+) failed/);

    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;

    if (failed > 0) {
      results.push({
        name: 'Test Suites',
        status: 'fail',
        message: `❌ ${failed} tests failed, ${passed} passed`,
        details: stdout.substring(0, 800)
      });
    } else {
      results.push({
        name: 'Test Suites',
        status: 'pass',
        message: `✅ All tests passed (${passed} tests)`
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Test Suites',
      status: 'fail',
      message: '❌ Test execution failed',
      details: error.message
    });
  }
}

/**
 * Auditoría de dependencias
 */
async function auditDependencies(): Promise<void> {
  try {
    console.log('📚 Auditing dependencies...');
    await execAsync('npm audit --audit-level moderate --json');

    results.push({
      name: 'npm audit',
      status: 'pass',
      message: '✅ No moderate or higher vulnerabilities'
    });
  } catch (error: any) {
    // npm audit returns non-zero exit code when vulnerabilities are found
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout);
        const vulnerabilities = audit.vulnerabilities || {};
        const moderateCount = Object.values(vulnerabilities).filter(
          (v: any) => v.severity === 'moderate' || v.severity === 'high' || v.severity === 'critical'
        ).length;

        if (moderateCount > 0) {
          results.push({
            name: 'npm audit',
            status: 'fail',
            message: `❌ ${moderateCount} moderate+ vulnerabilities found`,
            details: 'Run npm audit fix to address issues'
          });
        } else {
          results.push({
            name: 'npm audit',
            status: 'pass',
            message: '✅ No moderate or higher vulnerabilities'
          });
        }
      } catch {
        results.push({
          name: 'npm audit',
          status: 'warning',
          message: '⚠️ Could not parse npm audit output',
          details: error.message
        });
      }
    } else {
      results.push({
        name: 'npm audit',
        status: 'warning',
        message: '⚠️ npm audit check failed',
        details: error.message
      });
    }
  }
}

/**
 * Auditoría de cabeceras de seguridad
 */
async function auditSecurityHeaders(): Promise<void> {
  console.log('🔒 Auditing security headers configuration...');

  const checks = {
    helmet: false,
    hsts: false,
    csp: false,
    cors: false,
    sanitization: false
  };

  try {
    const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
    checks.helmet = appContent.includes('advancedSecurityHeaders') || appContent.includes('helmet');
    checks.hsts = appContent.includes('hsts') || appContent.includes('HSTS') || appContent.includes('strictTransportSecurity');
    checks.cors = appContent.includes('cors') && appContent.includes('app.use(cors');
    checks.sanitization = appContent.includes('mongoSanitization') || appContent.includes('express-mongo-sanitize');

    // Check HSTS and CSP in security config
    try {
      const securityContent = readFileSync(join(process.cwd(), 'src/config/securityHeaders.ts'), 'utf-8');
      checks.hsts = securityContent.includes('hsts:') || securityContent.includes('strictTransportSecurity');
      checks.csp = securityContent.includes('contentSecurityPolicy') || securityContent.includes('csp');
    } catch {
      checks.hsts = false;
      checks.csp = false;
    }

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    if (passed === total) {
      results.push({
        name: 'Security Headers',
        status: 'pass',
        message: `✅ All ${total} security headers configured`,
        details: Object.entries(checks)
          .map(([name, status]) => `  ${status ? '✅' : '❌'} ${name}`)
          .join('\n')
      });
    } else {
      results.push({
        name: 'Security Headers',
        status: 'fail',
        message: `❌ ${total - passed}/${total} security headers missing`,
        details: Object.entries(checks)
          .map(([name, status]) => `  ${status ? '✅' : '❌'} ${name}`)
          .join('\n')
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Security Headers',
      status: 'warning',
      message: '⚠️ Could not verify security headers',
      details: error.message
    });
  }
}

/**
 * Auditoría de endpoints críticos
 */
async function auditCriticalEndpoints(): Promise<void> {
  console.log('🌐 Auditing critical endpoints...');

  const endpoints: Record<string, boolean> = {
    'POST /auth/login': false,
    'POST /auth/refresh': false,
    'POST /orders/:id/transition': false,
    'POST /evidences': false,
    'GET /.well-known/jwks.json': false,
    'GET /health': false,
    'GET /ready': false
  };

  try {
    const routeDir = join(process.cwd(), 'src/routes');
    const routeFiles = readdirSync(routeDir);
    let allRoutesContent = '';

    for (const file of routeFiles) {
      if (file.endsWith('.ts')) {
        try {
          allRoutesContent += readFileSync(join(routeDir, file), 'utf-8') + '\n';
        } catch {
          // Skip files that can't be read
        }
      }
    }

    for (const endpoint of Object.keys(endpoints)) {
      const path = endpoint.split(' ')[1];
      const cleanPath = path.replace(/:[^/]+/g, '[a-zA-Z0-9]');
      if (allRoutesContent.includes(cleanPath) || allRoutesContent.includes(path)) {
        endpoints[endpoint] = true;
      }
    }

    const implemented = Object.values(endpoints).filter(Boolean).length;
    const total = Object.keys(endpoints).length;

    if (implemented === total) {
      results.push({
        name: 'Critical Endpoints',
        status: 'pass',
        message: `✅ All ${total} critical endpoints implemented`,
        details: Object.entries(endpoints)
          .map(([name, status]) => `  ${status ? '✅' : '❌'} ${name}`)
          .join('\n')
      });
    } else {
      results.push({
        name: 'Critical Endpoints',
        status: 'fail',
        message: `❌ ${total - implemented}/${total} critical endpoints missing`,
        details: Object.entries(endpoints)
          .map(([name, status]) => `  ${status ? '✅' : '❌'} ${name}`)
          .join('\n')
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Critical Endpoints',
      status: 'warning',
      message: '⚠️ Could not verify endpoints',
      details: error.message
    });
  }
}

/**
 * Mostrar reporte final
 */
function generateReport(): void {
  console.log('\n========================================');
  console.log('  PR04 STABILITY AUDIT REPORT');
  console.log('========================================\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  for (const result of results) {
    const icon =
      result.status === 'pass'
        ? '✅'
        : result.status === 'fail'
          ? '❌'
          : '⚠️';

    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);

    if (result.details) {
      console.log(`\n${result.details}\n`);
    }
  }

  console.log('========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);

  const allGreen = failed === 0 && warnings === 0;
  console.log(
    allGreen ? '\n✅ READY FOR MERGE\n' : '\n❌ BLOCKERS DETECTED\n'
  );

  process.exit(allGreen ? 0 : 1);
}

/**
 * Ejecutar todas las auditorías
 */
async function runAudit(): Promise<void> {
  try {
    await auditCompilation();
    await auditLinting();
    await auditTests();
    await auditDependencies();
    await auditSecurityHeaders();
    await auditCriticalEndpoints();
    generateReport();
  } catch (error) {
    console.error('Fatal error during audit:', error);
    process.exit(1);
  }
}

runAudit();