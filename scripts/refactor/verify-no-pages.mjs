import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Verifica que NO existan imports/referencias a src/app/pages/<domain>.
 *
 * Uso:
 *   node scripts/refactor/verify-no-pages.mjs admin
 *   node scripts/refactor/verify-no-pages.mjs ordenes
 */

const WORKSPACE_ROOT = path.resolve(process.cwd());
const APP_ROOT = path.join(WORKSPACE_ROOT, 'apps/web/src/app');

const domain = process.argv[2];
if (!domain) {
  console.error('ERROR: falta dominio. Ej: admin | ordenes');
  process.exit(2);
}

const patterns = [
  `src/app/pages/${domain}`,
  `/pages/${domain}`,
  `./pages/${domain}`,
  `../pages/${domain}`,
  `@app/pages/${domain}`,
  `pages/${domain}`,
];

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.angular', '.turbo', '.git', 'coverage']);

async function* walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      yield* walkFiles(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!fullPath.endsWith('.ts') && !fullPath.endsWith('.html') && !fullPath.endsWith('.scss') && !fullPath.endsWith('.css')) continue;
    yield fullPath;
  }
}

function rel(p) {
  return path.relative(WORKSPACE_ROOT, p).replaceAll('\\', '/');
}

async function main() {
  try {
    await fs.access(APP_ROOT);
  } catch {
    console.error('ERROR: no se encontró apps/web/src/app');
    process.exit(2);
  }

  const hits = [];

  for await (const file of walkFiles(APP_ROOT)) {
    const content = await fs.readFile(file, 'utf8');
    for (const ptn of patterns) {
      if (content.includes(ptn)) {
        hits.push({ file: rel(file), pattern: ptn });
      }
    }
  }

  if (hits.length === 0) {
    console.log(`NO_PAGES_OK ${domain}`);
    return;
  }

  console.log(`NO_PAGES_FAIL ${domain} ${hits.length}`);
  for (const h of hits.slice(0, 50)) {
    console.log(`- ${h.file} contains ${h.pattern}`);
  }
  if (hits.length > 50) {
    console.log(`... +${hits.length - 50} más`);
  }

  process.exitCode = 1;
}

await main();
