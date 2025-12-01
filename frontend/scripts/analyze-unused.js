#!/usr/bin/env node
/*
 * analyze-unused.js
 * Rough component usage scanner to assist cleanup/reorg plan.
 *
 * Usage: From frontend/ folder run `node scripts/analyze-unused.js`
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const SHARED_COMPONENTS_DIR = path.join(SRC_DIR, 'shared', 'components');
const FEATURES_DIR = path.join(SRC_DIR, 'features');
const APP_DIR = path.join(SRC_DIR, 'app');
const REPORT_PATH = path.join(PROJECT_ROOT, 'CLEANUP_REPORT.md');

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

async function pathExists(targetPath) {
  try {
    await fs.promises.access(targetPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(dir, filterFn) {
  const stack = [dir];
  const files = [];

  while (stack.length) {
    const current = stack.pop();
    if (!(await pathExists(current))) continue;

    const stats = await fs.promises.stat(current);
    if (stats.isDirectory()) {
      const children = await fs.promises.readdir(current);
      for (const child of children) {
        stack.push(path.join(current, child));
      }
    } else if (!filterFn || filterFn(current)) {
      files.push(current);
    }
  }

  return files;
}

async function loadCodeFiles() {
  const searchDirs = [APP_DIR, FEATURES_DIR, path.join(SRC_DIR, 'shared')];
  const files = [];
  for (const dir of searchDirs) {
    if (!(await pathExists(dir))) continue;
    const entries = await collectFiles(dir, (filePath) => CODE_EXTENSIONS.has(path.extname(filePath)));
    files.push(...entries);
  }

  const contents = new Map();
  for (const filePath of files) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    contents.set(filePath, content);
  }
  return contents;
}

function toAliasImport(componentPath) {
  const relative = componentPath.replace(SRC_DIR, '').replace(/\\/g, '/');
  return `@${relative}`.replace(/\.(tsx|ts|jsx|js)$/i, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isComponentUsed(componentPath, codeContents) {
  const aliasImport = toAliasImport(componentPath);
  const componentName = path.basename(componentPath).replace(/\.(tsx|ts|jsx|js)$/i, '');
  const aliasRegex = new RegExp(`from\\s+['\"]${escapeRegExp(aliasImport)}['\"]`);
  const componentRegex = new RegExp(`\b${escapeRegExp(componentName)}\b`);

  for (const [filePath, content] of codeContents.entries()) {
    if (filePath === componentPath) continue;
    if (aliasRegex.test(content)) {
      return true;
    }
    if (componentRegex.test(content)) {
      return true;
    }
  }
  return false;
}

async function analyzeComponentDir(label, dirPath, codeContents) {
  if (!(await pathExists(dirPath))) {
    return { label, total: 0, unused: [], used: [] };
  }

  const componentFiles = await collectFiles(dirPath, (filePath) => CODE_EXTENSIONS.has(path.extname(filePath)));
  const entries = [];

  for (const filePath of componentFiles) {
    const used = isComponentUsed(filePath, codeContents);
    entries.push({ filePath, used });
  }

  const unused = entries.filter((entry) => !entry.used);
  const used = entries.filter((entry) => entry.used);

  return {
    label,
    total: entries.length,
    unused,
    used,
  };
}

function formatEntry(entry, baseDir) {
  const relative = path.relative(baseDir, entry.filePath).replace(/\\/g, '/');
  return `- [${entry.used ? 'x' : ' '}] ${relative}`;
}

function generateReport(sections) {
  const lines = [];
  lines.push('# Frontend Cleanup Report');
  lines.push('');
  lines.push(`Generado: ${new Date().toISOString()}`);
  lines.push('');

  const totalComponents = sections.reduce((sum, section) => sum + section.total, 0);
  const totalUnused = sections.reduce((sum, section) => sum + section.unused.length, 0);

  lines.push('## Resumen General');
  lines.push('');
  lines.push(`- Componentes analizados: **${totalComponents}**`);
  lines.push(`- Componentes potencialmente no usados: **${totalUnused}**`);
  lines.push('');

  for (const section of sections) {
    lines.push(`## ${section.label}`);
    lines.push('');
    lines.push(`- Total archivos: ${section.total}`);
    lines.push(`- Marcados como usados: ${section.used.length}`);
    lines.push(`- Marcados como sin uso: ${section.unused.length}`);
    lines.push('');

    if (section.unused.length) {
      lines.push('### Posibles candidatos a limpieza');
      lines.push('');
      for (const entry of section.unused) {
        lines.push(formatEntry(entry, PROJECT_ROOT));
      }
      lines.push('');
    } else {
      lines.push('_Sin candidatos sin uso detectados en esta sección._');
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  console.log('🔍 Iniciando análisis de componentes...');
  const codeContents = await loadCodeFiles();
  console.log(`📁 Archivos de código indexados: ${codeContents.size}`);

  const sections = [];
  sections.push(await analyzeComponentDir('src/components', COMPONENTS_DIR, codeContents));
  sections.push(await analyzeComponentDir('src/shared/components', SHARED_COMPONENTS_DIR, codeContents));

  const report = generateReport(sections);
  await fs.promises.writeFile(REPORT_PATH, report, 'utf8');

  console.log('✅ Reporte generado en CLEANUP_REPORT.md');
}

main().catch((error) => {
  console.error('❌ Error durante el análisis:', error);
  process.exit(1);
});
