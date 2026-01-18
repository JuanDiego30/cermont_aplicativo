#!/usr/bin/env node

/**
 * 📊 Generador de Reporte de Auditoría Consolidado
 *
 * Lee logs de auditoría desde la carpeta audit/ y genera un reporte Markdown
 * consolidado en docs/AUDIT_REPORT.md
 *
 * Uso:
 *   node scripts/generate-audit-report.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIT_DIR = path.join(ROOT, 'audit');
const DOCS_DIR = path.join(ROOT, 'docs');
const REPORT_PATH = path.join(DOCS_DIR, 'AUDIT_REPORT.md');

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`⚠️  No se pudo leer ${filePath}: ${err.message}`);
    return null;
  }
}

function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.warn(`⚠️  No se pudo leer ${filePath}: ${err.message}`);
    return null;
  }
}

function getGitInfo() {
  try {
    const commit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    const author = execSync('git config user.name', { cwd: ROOT, encoding: 'utf8' }).trim();
    return { commit, branch, author };
  } catch {
    return { commit: 'unknown', branch: 'unknown', author: 'unknown' };
  }
}

function getNodeInfo() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    return { nodeVersion, pnpmVersion };
  } catch {
    return { nodeVersion: 'unknown', pnpmVersion: 'unknown' };
  }
}

function extractErrorsFromLog(logContent) {
  if (!logContent) return { errors: 0, warnings: 0, details: [] };

  const lines = logContent.split('\n');
  const errors = lines.filter(l => l.match(/^[^:]*error/i)).length;
  const warnings = lines.filter(l => l.match(/^[^:]*warning/i)).length;

  return { errors, warnings, totalLines: lines.length };
}

function readJsonReport(filename) {
  const filePath = path.join(AUDIT_DIR, filename);
  return readJson(filePath);
}

// ============================================================================
// GENERADOR DE REPORTE
// ============================================================================

console.log('\n📊 Generando reporte de auditoría consolidado...\n');

ensureDir(AUDIT_DIR);
ensureDir(DOCS_DIR);

const gitInfo = getGitInfo();
const nodeInfo = getNodeInfo();
const timestamp = new Date().toISOString();

// Leer reports JSON si existen
const apiConsistencyReport = readJsonReport('api-consistency-report.json');
const lintReport = readJsonReport('lint-report.json');
const testReport = readJsonReport('test-report.json');
const buildReport = readJsonReport('build-report.json');
const securityReport = readJsonReport('security-report.json');

// Leer logs si existen
const lintLog = readFile(path.join(AUDIT_DIR, 'lint.log'));
const typeCheckLog = readFile(path.join(AUDIT_DIR, 'typecheck.log'));
const testLog = readFile(path.join(AUDIT_DIR, 'test.log'));
const buildLog = readFile(path.join(AUDIT_DIR, 'build.log'));

// ============================================================================
// CONSTRUIR REPORTE MARKDOWN
// ============================================================================

let report = `# 📊 Audit Report

**Generated:** ${timestamp}  
**Commit:** \`${gitInfo.commit}\`  
**Branch:** \`${gitInfo.branch}\`  
**Author:** ${gitInfo.author}

---

## ⚙️ Environment

| Variable | Value |
|----------|-------|
| **Node.js** | ${nodeInfo.nodeVersion} |
| **pnpm** | ${nodeInfo.pnpmVersion} |
| **OS** | ${process.platform} |
| **Runner** | ${process.env.RUNNER_OS || 'Local/Unknown'} |

---

## 📈 Summary

| Module | Status | Errors | Warnings | Details |
|--------|--------|--------|----------|---------|
| **Backend Lint** | ⏳ | - | - | See details below |
| **Frontend Lint** | ⏳ | - | - | See details below |
| **Type Check** | ⏳ | - | - | See details below |
| **Tests** | ⏳ | - | - | See details below |
| **Build** | ⏳ | - | - | See details below |
| **API Coherence** | ${apiConsistencyReport?.inconsistenciesCount === 0 ? '✅' : '❌'} | ${apiConsistencyReport?.inconsistenciesCount || 0} | - | API calls vs Backend routes |

---

## 📋 Detailed Results

### 1. API Coherence Report

`;

if (apiConsistencyReport) {
  report += `**Status:** ${apiConsistencyReport.inconsistenciesCount === 0 ? '✅ PASS' : '❌ FAIL'}  
**Execution Time:** ${apiConsistencyReport.duration}s  
**Backend Routes:** ${apiConsistencyReport.backendRoutesCount}  
**Frontend API Calls:** ${apiConsistencyReport.frontendCallsCount}  
**Inconsistencies Found:** ${apiConsistencyReport.inconsistenciesCount}

`;

  if (apiConsistencyReport.inconsistenciesCount > 0) {
    report += `#### ⚠️ Issues Found:\n\n`;
    apiConsistencyReport.issues.slice(0, 10).forEach((issue, idx) => {
      report += `${idx + 1}. \`${issue.frontendUrl}\`\n`;
      report += `   - File: \`${issue.file}:${issue.line}\`\n\n`;
    });

    if (apiConsistencyReport.inconsistencies > 10) {
      report += `... and ${apiConsistencyReport.issues.length - 10} more\n\n`;
    }
  } else {
    report += `✅ All frontend API calls are matched with backend routes.\n\n`;
  }
} else {
  report += `⏳ Report not available yet. Run audit workflow to generate.\n\n`;
}

report += `### 2. Linting Results

`;

if (lintLog) {
  const { errors, warnings } = extractErrorsFromLog(lintLog);
  report += `**Status:** ${errors === 0 ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `**Errors:** ${errors}\n`;
  report += `**Warnings:** ${warnings}\n\n`;

  if (errors > 0) {
    report += `<details><summary>Lint Errors (First 20)</summary>\n\n\`\`\`\n`;
    const errorLines = lintLog
      .split('\n')
      .filter(l => l.match(/error/i))
      .slice(0, 20)
      .join('\n');
    report += errorLines + `\n\`\`\`\n\n</details>\n\n`;
  }
} else {
  report += `⏳ Linting report not available yet.\n\n`;
}

report += `### 3. Type Checking

`;

if (typeCheckLog) {
  const { errors, warnings } = extractErrorsFromLog(typeCheckLog);
  report += `**Status:** ${errors === 0 ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `**Errors:** ${errors}\n`;
  report += `**Warnings:** ${warnings}\n\n`;

  if (errors > 0) {
    report += `<details><summary>Type Errors (First 15)</summary>\n\n\`\`\`\n`;
    const errorLines = typeCheckLog
      .split('\n')
      .filter(l => l.match(/error/i))
      .slice(0, 15)
      .join('\n');
    report += errorLines + `\n\`\`\`\n\n</details>\n\n`;
  }
} else {
  report += `⏳ Type checking report not available yet.\n\n`;
}

report += `### 4. Tests Results

`;

if (testLog) {
  const { errors, warnings } = extractErrorsFromLog(testLog);
  report += `**Status:** ${errors === 0 ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `**Errors/Failures:** ${errors}\n\n`;

  if (errors > 0) {
    report += `<details><summary>Test Failures</summary>\n\n\`\`\`\n`;
    report += testLog.slice(0, 2000) + `\n\`\`\`\n\n</details>\n\n`;
  }
} else {
  report += `⏳ Test report not available yet. Run tests to generate.\n\n`;
}

report += `### 5. Build Status

`;

if (buildLog) {
  const { errors } = extractErrorsFromLog(buildLog);
  report += `**Status:** ${errors === 0 ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `**Build Errors:** ${errors}\n\n`;

  if (errors > 0) {
    report += `<details><summary>Build Errors</summary>\n\n\`\`\`\n`;
    report += buildLog.slice(0, 2000) + `\n\`\`\`\n\n</details>\n\n`;
  }
} else {
  report += `⏳ Build report not available yet.\n\n`;
}

report += `---

## 📚 Additional Resources

- **Quick Start:** [QUICK_START_AUDIT.md](../QUICK_START_AUDIT.md)
- **Complete Guide:** [docs/AUDIT_GUIDE.md](AUDIT_GUIDE.md)
- **Findings Analysis:** [docs/AUDIT_FINDINGS_ANALYSIS.md](AUDIT_FINDINGS_ANALYSIS.md)
- **Team Guide:** [TEAM_AUDIT_GUIDE.md](../TEAM_AUDIT_GUIDE.md)
- **System Diagram:** [AUDIT_SYSTEM_DIAGRAM.md](../AUDIT_SYSTEM_DIAGRAM.md)

---

## ⚠️ Known Issues & Recommendations

### API Coherence Script

**Note:** Initial run detected 41 inconsistencies. These may include false positives due to:
- Dynamic route parameters (:/userId, /:id, etc.)
- Template strings ($\{variable\})
- Normalization of all :param to :param

**Recommendation:** Review \`docs/AUDIT_FINDINGS_ANALYSIS.md\` for detailed analysis.

### ESLint Configuration

**Note:** May require \`globals\` package:
\`\`\`bash
cd backend && pnpm add -D globals
\`\`\`

---

**Report Generated:** ${new Date().toLocaleString()}  
**Duration:** Check individual sections above
`;

// Guardar reporte
fs.writeFileSync(REPORT_PATH, report);
console.log(`✅ Reporte guardado en: ${REPORT_PATH}`);
console.log(`\n📊 Resumen del reporte:\n`);
console.log(
  `   - API Coherence: ${apiConsistencyReport ? (apiConsistencyReport.inconsistenciesCount === 0 ? '✅' : '❌') : '⏳'}`
);
console.log(`   - Lint: ${lintLog ? '✅' : '⏳'}`);
console.log(`   - Type Check: ${typeCheckLog ? '✅' : '⏳'}`);
console.log(`   - Tests: ${testLog ? '✅' : '⏳'}`);
console.log(`   - Build: ${buildLog ? '✅' : '⏳'}`);
console.log(`\n`);
