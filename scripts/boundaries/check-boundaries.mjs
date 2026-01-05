import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Boundary checker (lightweight, no extra deps).
 *
 * Goal: start enforcing architecture boundaries incrementally without breaking the build.
 *
 * Usage:
 *   node scripts/boundaries/check-boundaries.mjs
 *   node scripts/boundaries/check-boundaries.mjs --strict
 */

const WORKSPACE_ROOT = path.resolve(process.cwd());

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  '.angular',
  '.turbo',
  '.git',
  'coverage',
]);

function isIgnoredDir(dirName) {
  return IGNORE_DIRS.has(dirName);
}

async function* walkFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (isIgnoredDir(entry.name)) continue;
      yield* walkFiles(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!fullPath.endsWith('.ts')) continue;

    yield fullPath;
  }
}

function extractImports(tsSource) {
  // Matches:
  //   import ... from 'x';
  //   import('x')
  // (kept intentionally simple; good enough for guardrails)
  const imports = [];

  const importFromRe = /import\s+[^;]*?from\s+['"]([^'"]+)['"]/g;
  const importCallRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const match of tsSource.matchAll(importFromRe)) imports.push(match[1]);
  for (const match of tsSource.matchAll(importCallRe)) imports.push(match[1]);

  return imports;
}

function rel(filePath) {
  return path.relative(WORKSPACE_ROOT, filePath).replaceAll('\\', '/');
}

function makeViolation({ file, imported, ruleId, message }) {
  return { file: rel(file), imported, ruleId, message };
}

function isInPath(file, segment) {
  return rel(file).includes(segment);
}

function checkBackend({ file, imported }) {
  const violations = [];

  // Domain must be pure.
  if (isInPath(file, 'apps/api/src/modules/') && isInPath(file, '/domain/')) {
    const forbiddenPackages = [
      '@nestjs/',
      'nestjs',
      '@prisma/client',
      'prisma',
      'express',
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/swagger',
      '@nestjs/platform-express',
    ];

    if (forbiddenPackages.some(p => imported === p || imported.startsWith(p))) {
      violations.push(
        makeViolation({
          file,
          imported,
          ruleId: 'api-domain-no-framework',
          message: 'Domain no debe depender de NestJS/Prisma/Express.',
        }),
      );
    }

    // Domain should not import application/infrastructure relatively.
    if (imported.includes('/application/') || imported.includes('/infrastructure/')) {
      violations.push(
        makeViolation({
          file,
          imported,
          ruleId: 'api-domain-no-upstream',
          message: 'Domain no debe importar application/infrastructure.',
        }),
      );
    }
  }

  // Application should not import HTTP controllers.
  if (isInPath(file, 'apps/api/src/modules/') && isInPath(file, '/application/')) {
    if (imported.includes('/infrastructure/controllers') || imported.includes('/controllers')) {
      violations.push(
        makeViolation({
          file,
          imported,
          ruleId: 'api-application-no-http',
          message: 'Application no debe depender de controllers/HTTP.',
        }),
      );
    }
  }

  return violations;
}

function checkFrontend({ file, imported }) {
  const violations = [];

  // Prevent feature code from depending on demo legacy.
  if (isInPath(file, 'apps/web/src/app/features/') && imported.includes('pages/demo-legacy')) {
    violations.push(
      makeViolation({
        file,
        imported,
        ruleId: 'web-no-demo-legacy-in-features',
        message: 'features/** no debe depender de pages/demo-legacy/**.',
      }),
    );
  }

  // Prevent core from depending on features/pages.
  if (isInPath(file, 'apps/web/src/app/core/') && (imported.includes('/features/') || imported.includes('/pages/'))) {
    violations.push(
      makeViolation({
        file,
        imported,
        ruleId: 'web-core-no-features',
        message: 'core/** no debe depender de features/** ni pages/** (solo cross-cutting).',
      }),
    );
  }

  return violations;
}

async function main() {
  const targets = [
    path.join(WORKSPACE_ROOT, 'apps/api/src'),
    path.join(WORKSPACE_ROOT, 'apps/web/src'),
  ];

  const violations = [];

  for (const target of targets) {
    try {
      await fs.access(target);
    } catch {
      continue;
    }

    for await (const file of walkFiles(target)) {
      let content;
      try {
        content = await fs.readFile(file, 'utf8');
      } catch {
        continue;
      }

      const imports = extractImports(content);
      for (const imported of imports) {
        violations.push(...checkBackend({ file, imported }));
        violations.push(...checkFrontend({ file, imported }));
      }
    }
  }

  if (violations.length === 0) {
    console.log('BOUNDARIES_OK');
    return;
  }

  // Report
  const byRule = new Map();
  for (const v of violations) {
    const key = v.ruleId;
    byRule.set(key, byRule.get(key) ?? []);
    byRule.get(key).push(v);
  }

  console.log(`BOUNDARIES_VIOLATIONS ${violations.length}`);
  for (const [ruleId, items] of byRule.entries()) {
    console.log(`\n- ${ruleId} (${items.length})`);
    for (const it of items.slice(0, 20)) {
      console.log(`  ${it.file} -> ${it.imported}`);
    }
    if (items.length > 20) {
      console.log(`  ... +${items.length - 20} más`);
    }
  }

  // In non-strict mode, we don't fail the pipeline yet.
  if (STRICT) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

await main();
