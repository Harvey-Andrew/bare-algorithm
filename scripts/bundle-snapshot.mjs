import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = '.next/analyze';
const BUNDLE_ROOT_DIR = path.join('docs/performance/bundle-analysis');
const SNAPSHOT_FILES = ['client.html', 'nodejs.html', 'edge.html'];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    if (token.includes('=')) {
      const [k, v] = token.split('=');
      args[k.slice(2)] = v ?? '';
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[token.slice(2)] = next;
      i += 1;
      continue;
    }

    args[token.slice(2)] = 'true';
  }
  return args;
}

function toLocalDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

function resolveUniqueRunDir(rootDir, stamp) {
  let candidate = path.join(rootDir, stamp);
  if (!fs.existsSync(candidate)) {
    return candidate;
  }

  let index = 1;
  while (true) {
    const suffix = String(index).padStart(2, '0');
    candidate = path.join(rootDir, `${stamp}-${suffix}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    index += 1;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetName = args._[0];
  if (!targetName || !['before', 'after'].includes(targetName)) {
    console.error(
      'Usage: node scripts/bundle-snapshot.mjs <before|after> [--stamp <yyyy-MM-dd-HHmmss>]'
    );
    process.exit(1);
  }

  for (const file of SNAPSHOT_FILES) {
    const source = path.join(SOURCE_DIR, file);
    if (!fs.existsSync(source)) {
      console.error(`Missing analyzer output: ${source}`);
      process.exit(1);
    }
  }

  const stamp = args.stamp ?? toLocalDateStamp();
  const targetRootDir = path.join(BUNDLE_ROOT_DIR, targetName);
  const targetDir = resolveUniqueRunDir(targetRootDir, stamp);

  // Always keep historical snapshots.
  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of SNAPSHOT_FILES) {
    const source = path.join(SOURCE_DIR, file);
    const target = path.join(targetDir, file);
    fs.copyFileSync(source, target);
  }

  console.log(`Snapshot saved to ${targetDir.replaceAll('\\', '/')}`);
}

main();
