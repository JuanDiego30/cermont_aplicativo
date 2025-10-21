import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const execAsync = promisify(exec);

let cachedVersion: string | null = null;
let cacheTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in ms

interface PackageJson {
  version?: string;
}

function getPackageVersion(): string {
  try {
    const packagePath = resolve(process.cwd(), 'package.json');
    const content = readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(content) as PackageJson;
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export async function getVersionInfo(): Promise<{
  version: string;
  commit: string;
  date: string;
}> {
  const now = Date.now();

  // Return cached value if still valid
  if (cachedVersion && now - cacheTime < CACHE_DURATION) {
    const [version, commit] = cachedVersion.split('|');
    return {
      version,
      commit,
      date: new Date().toISOString(),
    };
  }

  try {
    // Get version from package.json
    const version = getPackageVersion();

    // Get git commit hash
    let commit = 'unknown';
    try {
      const { stdout } = await execAsync('git rev-parse --short HEAD', {
        cwd: process.cwd(),
        timeout: 5000,
      });
      commit = stdout.trim();
    } catch (err) {
      console.warn('Unable to retrieve git commit hash:', err);
    }

    // Cache the result
    cachedVersion = `${version}|${commit}`;
    cacheTime = now;

    return {
      version,
      commit,
      date: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error retrieving version info:', err);
    return {
      version: 'unknown',
      commit: 'unknown',
      date: new Date().toISOString(),
    };
  }
}
