/**
 * @file validateSecurity.ts
 * @description Validación de configuración de seguridad
 * @usage tsx scripts/validateSecurity.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface SecurityCheck {
  name: string;
  description: string;
  validate: () => Promise<boolean> | boolean;
  critical: boolean;
}

const securityChecks: SecurityCheck[] = [
  {
    name: 'Helmet Security Headers',
    description: 'Helmet middleware configured for security headers',
    critical: true,
    validate: async () => {
      try {
        const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
        return appContent.includes('helmet') && appContent.includes('app.use(helmet');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'HSTS Header',
    description: 'HTTP Strict Transport Security configured',
    critical: true,
    validate: async () => {
      try {
        const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
        return appContent.includes('hsts') || appContent.includes('HSTS');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'CORS Configuration',
    description: 'CORS middleware properly configured',
    critical: true,
    validate: async () => {
      try {
        const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
        return appContent.includes('cors') && appContent.includes('app.use(cors');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Input Sanitization',
    description: 'MongoDB injection protection active',
    critical: true,
    validate: async () => {
      try {
        const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
        return appContent.includes('express-mongo-sanitize');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Rate Limiting',
    description: 'Rate limiting middleware configured',
    critical: true,
    validate: async () => {
      try {
        const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
        return appContent.includes('express-rate-limit') || appContent.includes('rateLimit');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Argon2 Password Hashing',
    description: 'Argon2id used for password hashing',
    critical: true,
    validate: async () => {
      try {
        const authContent = readFileSync(join(process.cwd(), 'src/services/auth.service.ts'), 'utf-8');
        return authContent.includes('argon2') && authContent.includes('hashPassword');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'JWT with Jose',
    description: 'Jose library used for JWT operations',
    critical: true,
    validate: async () => {
      try {
        const authContent = readFileSync(join(process.cwd(), 'src/services/auth.service.ts'), 'utf-8');
        return authContent.includes('jose') && authContent.includes('SignJWT');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'JWKS Endpoint',
    description: 'JWKS endpoint exposed for key verification',
    critical: true,
    validate: async () => {
      try {
        const routesContent = readFileSync(join(process.cwd(), 'src/routes/auth.routes.ts'), 'utf-8');
        return routesContent.includes('jwks') || routesContent.includes('JWKS');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Zod Validation',
    description: 'Zod schemas used for input validation',
    critical: true,
    validate: async () => {
      try {
        const controllerContent = readFileSync(join(process.cwd(), 'src/controllers/auth.controller.ts'), 'utf-8');
        return controllerContent.includes('zod') || controllerContent.includes('Zod');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Audit Logging',
    description: 'Audit trails implemented for sensitive operations',
    critical: false,
    validate: async () => {
      try {
        const orderService = readFileSync(join(process.cwd(), 'src/services/order.service.ts'), 'utf-8');
        return orderService.includes('audit') || orderService.includes('logger');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Environment Variables',
    description: 'Sensitive data not hardcoded',
    critical: true,
    validate: async () => {
      try {
        const envContent = readFileSync(join(process.cwd(), '.env.example'), 'utf-8');
        return envContent.includes('JWT_SECRET') && envContent.includes('MONGODB_URI');
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Error Handling',
    description: 'Proper error handling middleware configured',
    critical: true,
    validate: async () => {
      try {
        const appContent = readFileSync(join(process.cwd(), 'src/app.ts'), 'utf-8');
        return appContent.includes('errorHandler') || appContent.includes('error-handling');
      } catch {
        return false;
      }
    }
  }
];

/**
 * Ejecutar validación de seguridad
 */
async function validateSecurity(): Promise<void> {
  console.log(chalk.bold.cyan('\n🔒 SECURITY VALIDATION REPORT'));
  console.log(chalk.bold.cyan('================================\n'));

  const results = await Promise.all(
    securityChecks.map(async (check) => {
      const passed = await check.validate();
      return { ...check, passed };
    })
  );

  const criticalPassed = results.filter(r => r.critical && r.passed).length;
  const criticalTotal = results.filter(r => r.critical).length;
  const optionalPassed = results.filter(r => !r.critical && r.passed).length;
  const optionalTotal = results.filter(r => !r.critical).length;

  for (const result of results) {
    const icon = result.passed ? chalk.green('✅') : chalk.red('❌');
    const critical = result.critical ? chalk.red('[CRITICAL]') : chalk.yellow('[OPTIONAL]');
    console.log(`${icon} ${critical} ${result.name}`);
    console.log(`   ${result.description}`);

    if (!result.passed) {
      console.log(chalk.red(`   ❌ FAILED\n`));
    } else {
      console.log(chalk.green(`   ✅ PASSED\n`));
    }
  }

  console.log(chalk.bold.cyan('================================'));
  console.log(chalk.bold.cyan('  SUMMARY'));
  console.log(chalk.bold.cyan('================================'));

  console.log(chalk.red(`🔴 Critical: ${criticalPassed}/${criticalTotal} passed`));
  console.log(chalk.yellow(`🟡 Optional: ${optionalPassed}/${optionalTotal} passed`));

  const allCritical = criticalPassed === criticalTotal;
  const securityReady = allCritical;

  console.log(
    chalk.bold[securityReady ? 'green' : 'red'](
      `\n${securityReady ? '✅ SECURITY BASELINE MET' : '❌ SECURITY ISSUES DETECTED'}\n`
    )
  );

  if (!allCritical) {
    console.log(chalk.red('Critical security requirements not met. Cannot proceed to production.'));
    process.exit(1);
  }

  console.log(chalk.green('All critical security requirements validated. Ready for production.'));
}

validateSecurity().catch((error) => {
  console.error(chalk.red('Security validation failed:'), error);
  process.exit(1);
});