import * as path from 'path';

export function normalizeRelativePath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  if (path.isAbsolute(normalized)) {
    throw new Error('Absolute paths are not allowed');
  }
  if (normalized.includes('..')) {
    throw new Error('Path traversal is not allowed');
  }
  return normalized;
}

export function resolveSafePath(basePath: string, filePath: string): string {
  const relative = normalizeRelativePath(filePath);
  const base = path.resolve(basePath);
  const full = path.resolve(base, relative);

  if (full !== base && !full.startsWith(base + path.sep)) {
    throw new Error('Invalid storage path');
  }

  return full;
}
