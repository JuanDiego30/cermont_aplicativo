#!/usr/bin/env node

/*
 * Jest wrapper para compatibilidad:
 * - Jest 30 reemplazó --testPathPattern por --testPathPatterns.
 * - Algunos prompts/scripts antiguos aún usan el flag anterior.
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const rawArgs = process.argv.slice(2);
const mappedArgs = [];

const toLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');

const hasCoverageFlag = () =>
  rawArgs.some((a) => a === '--coverage' || a === '--coverage=true' || a.startsWith('--coverage='));

const findTestPathPatternsValue = () => {
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg === '--testPathPattern' || arg === '--testPathPatterns') {
      const next = rawArgs[i + 1];
      if (next && !String(next).startsWith('--')) return String(next);
    }

    if (arg.startsWith('--testPathPattern=')) return arg.split('=').slice(1).join('=');
    if (arg.startsWith('--testPathPatterns=')) return arg.split('=').slice(1).join('=');
  }

  return undefined;
};

const wantsAuthScope = () => {
  const value = findTestPathPatternsValue();
  return typeof value === 'string' && toLower(value).includes('auth');
};

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === '--testPathPattern') {
    mappedArgs.push('--testPathPatterns');
    continue;
  }

  if (arg.startsWith('--testPathPattern=')) {
    mappedArgs.push(arg.replace('--testPathPattern=', '--testPathPatterns='));
    continue;
  }

  mappedArgs.push(arg);
}

// Si el run es de coverage y está enfocado a auth (por testPathPatterns),
// forzamos el config de Auth para que la cobertura no se diluya contra todo el src/**.
if (hasCoverageFlag() && wantsAuthScope()) {
  const authConfigPath = path.resolve(process.cwd(), 'jest.auth.config.ts');

  let replaced = false;
  for (let i = 0; i < mappedArgs.length; i++) {
    const arg = mappedArgs[i];
    if (arg === '--config') {
      mappedArgs[i + 1] = authConfigPath;
      replaced = true;
      break;
    }
    if (typeof arg === 'string' && arg.startsWith('--config=')) {
      mappedArgs[i] = `--config=${authConfigPath}`;
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    mappedArgs.unshift('--config', authConfigPath);
  }
}

const jestBin = path.resolve(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js');
const result = spawnSync(process.execPath, [jestBin, ...mappedArgs], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
