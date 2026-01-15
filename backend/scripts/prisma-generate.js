#!/usr/bin/env node
const { spawnSync } = require('child_process');

// Load local .env if available (optional)
try { require('dotenv').config(); } catch (e) { /* ignore */ }

// Run prisma generate pointing to the schema inside the backend package
// Load environment variables from .env if present
const env = Object.assign({}, process.env);
try {
  const dot = require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
  if (dot.parsed && dot.parsed.DATABASE_URL) {
    env.DATABASE_URL = dot.parsed.DATABASE_URL;
  }
} catch (e) {
  // ignore
}

const res = spawnSync('npx', ['prisma', 'generate', '--schema', 'prisma/schema.prisma'], {
  stdio: 'inherit',
  cwd: require('path').resolve(__dirname, '..'),
  env,
  shell: true,
});

process.exit(res.status);
