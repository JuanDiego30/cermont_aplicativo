/**
 * @file validateEndpoints.ts
 * @description Validación de endpoints críticos
 * @usage tsx scripts/validateEndpoints.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface EndpointCheck {
  method: string;
  path: string;
  description: string;
  critical: boolean;
  implemented: boolean;
}

const criticalEndpoints: EndpointCheck[] = [
  {
    method: 'POST',
    path: '/auth/login',
    description: 'User authentication endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    description: 'JWT token refresh endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'POST',
    path: '/auth/logout',
    description: 'User logout endpoint',
    critical: false,
    implemented: false
  },
  {
    method: 'POST',
    path: '/orders',
    description: 'Create new order endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'PATCH',
    path: '/orders/:id/transition',
    description: 'Order state transition endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'GET',
    path: '/orders/:id',
    description: 'Get order details endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'GET',
    path: '/orders/:id/cycle-time',
    description: 'Order cycle time analytics endpoint',
    critical: false,
    implemented: false
  },
  {
    method: 'POST',
    path: '/evidences',
    description: 'Upload evidence endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'GET',
    path: '/.well-known/jwks.json',
    description: 'JWKS public keys endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'GET',
    path: '/healthz',
    description: 'Health check endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'GET',
    path: '/readyz',
    description: 'Readiness check endpoint',
    critical: true,
    implemented: false
  },
  {
    method: 'GET',
    path: '/metrics',
    description: 'Metrics endpoint',
    critical: false,
    implemented: false
  }
];

/**
 * Verificar si un endpoint está implementado en las rutas
 */
function checkEndpointImplementation(endpoint: EndpointCheck): boolean {
  try {
    // Leer archivos de rutas
    const routeFiles = [
      'src/routes/auth.routes.ts',
      'src/routes/orders.routes.ts',
      'src/routes/evidences.routes.ts',
      'src/routes/health.routes.ts'
    ];

    for (const routeFile of routeFiles) {
      try {
        const content = readFileSync(join(process.cwd(), routeFile), 'utf-8');

        // Verificar método HTTP
        const methodPattern = new RegExp(`router\\.${endpoint.method.toLowerCase()}\\s*\\(`);
        if (!methodPattern.test(content)) continue;

        // Verificar path (manejar parámetros)
        const pathPattern = endpoint.path.replace(/:[^/]+/g, '[^/]+');
        const pathRegex = new RegExp(pathPattern.replace(/\//g, '\\/'));
        if (pathRegex.test(content)) {
          return true;
        }
      } catch {
        // Archivo no existe, continuar
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Ejecutar validación de endpoints
 */
async function validateEndpoints(): Promise<void> {
  console.log(chalk.bold.cyan('\n🌐 ENDPOINT VALIDATION REPORT'));
  console.log(chalk.bold.cyan('==============================\n'));

  // Verificar implementación de cada endpoint
  for (const endpoint of criticalEndpoints) {
    endpoint.implemented = checkEndpointImplementation(endpoint);
  }

  const criticalImplemented = criticalEndpoints.filter(e => e.critical && e.implemented).length;
  const criticalTotal = criticalEndpoints.filter(e => e.critical).length;
  const optionalImplemented = criticalEndpoints.filter(e => !e.critical && e.implemented).length;
  const optionalTotal = criticalEndpoints.filter(e => !e.critical).length;

  for (const endpoint of criticalEndpoints) {
    const icon = endpoint.implemented ? chalk.green('✅') : chalk.red('❌');
    const critical = endpoint.critical ? chalk.red('[CRITICAL]') : chalk.yellow('[OPTIONAL]');
    const method = chalk.blue(endpoint.method.padEnd(6));
    const path = chalk.white(endpoint.path);

    console.log(`${icon} ${critical} ${method} ${path}`);
    console.log(`   ${endpoint.description}`);

    if (!endpoint.implemented) {
      console.log(chalk.red(`   ❌ NOT IMPLEMENTED\n`));
    } else {
      console.log(chalk.green(`   ✅ IMPLEMENTED\n`));
    }
  }

  console.log(chalk.bold.cyan('=============================='));
  console.log(chalk.bold.cyan('  SUMMARY'));
  console.log(chalk.bold.cyan('=============================='));

  console.log(chalk.red(`🔴 Critical: ${criticalImplemented}/${criticalTotal} implemented`));
  console.log(chalk.yellow(`🟡 Optional: ${optionalImplemented}/${optionalTotal} implemented`));

  const allCritical = criticalImplemented === criticalTotal;
  const endpointsReady = allCritical;

  console.log(
    chalk.bold[endpointsReady ? 'green' : 'red'](
      `\n${endpointsReady ? '✅ ALL CRITICAL ENDPOINTS READY' : '❌ MISSING CRITICAL ENDPOINTS'}\n`
    )
  );

  if (!allCritical) {
    console.log(chalk.red('Critical endpoints not implemented. Cannot proceed to production.'));
    console.log(chalk.yellow('Missing endpoints:'));
    criticalEndpoints
      .filter(e => e.critical && !e.implemented)
      .forEach(e => console.log(chalk.red(`  - ${e.method} ${e.path}`)));
    process.exit(1);
  }

  console.log(chalk.green('All critical endpoints implemented and ready for production.'));
}

validateEndpoints().catch((error) => {
  console.error(chalk.red('Endpoint validation failed:'), error);
  process.exit(1);
});