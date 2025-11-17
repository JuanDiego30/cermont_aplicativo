import { promises as fs } from 'fs';
import path from 'path';

const backendRoot = path.resolve('');
const aliasPrefixes = ['@/', '@shared/', '@backend/', '@domain/', '@infra/', '@app/'];
const tsFiles = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === 'node_modules') continue;
      await walk(full);
    } else if (entry.name.endsWith('.ts')) {
      tsFiles.push(full);
    }
  }
}

function shouldAddJs(spec) {
  if (/\.(ts|js|json|css|mjs|cjs)$/.test(spec)) return false;
  if (spec.startsWith('.') || aliasPrefixes.some((prefix) => spec.startsWith(prefix))) {
    return true;
  }
  return false;
}

async function main() {
  await walk(path.join(backendRoot, 'src'));
  await walk(path.join(backendRoot, 'scripts'));
  let updatedFiles = 0;
  for (const file of tsFiles) {
    const text = await fs.readFile(file, 'utf8');
    const newText = text.replace(/from\s+(['"])([^'";]+)\1/g, (match, quote, spec) => {
      if (!shouldAddJs(spec)) return match;
      return `from ${quote}${spec}.js${quote}`;
    });
    if (newText !== text) {
      updatedFiles++;
      await fs.writeFile(file, newText);
    }
  }
  console.log('Updated', updatedFiles, 'files');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
