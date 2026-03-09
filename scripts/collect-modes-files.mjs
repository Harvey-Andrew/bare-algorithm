import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import ts from 'typescript';

const TARGET_MODE_COUNTS = new Set([1, 2, 4]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const DEFAULT_SCAN_DIR = path.join(PROJECT_ROOT, 'src/lib/problems');

function walkConstantsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkConstantsFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name === 'constants.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

function getModesCountFromSource(filePath, sourceCode) {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    );
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'MODES') continue;

      if (!declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
        return null;
      }
      return declaration.initializer.elements.length;
    }
  }

  return null;
}

/**
 * Collect constants.ts files whose `export const MODES = []` length is 1, 2, or 4.
 * Files with MODES length 3 are ignored.
 */
export function collectModesFiles(baseDir = DEFAULT_SCAN_DIR) {
  const grouped = { 1: [], 2: [], 4: [] };
  const constantsFiles = walkConstantsFiles(baseDir).sort();

  for (const filePath of constantsFiles) {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const modesCount = getModesCountFromSource(filePath, sourceCode);

    if (modesCount == null || !TARGET_MODE_COUNTS.has(modesCount)) continue;

    const relativePath = path.relative(PROJECT_ROOT, filePath).split(path.sep).join('/');
    grouped[modesCount].push(relativePath);
  }

  return grouped;
}

export function formatModesFileReport(grouped) {
  const lines = [];
  for (const count of [1, 2, 4]) {
    const files = grouped[count];
    lines.push(`MODES=${count} (${files.length})`);
    for (const file of files) {
      lines.push(`- ${file}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

function escapeCsv(value) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toModesCsv(grouped) {
  const rows = [['modes_count', 'file_uri']];
  for (const count of [1, 2, 4]) {
    for (const file of grouped[count]) {
      const absPath = path.resolve(PROJECT_ROOT, file);
      const fileUri = pathToFileURL(absPath).href;
      rows.push([String(count), fileUri]);
    }
  }
  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}

export function writeModesCsv(grouped, outputPath) {
  const csvText = toModesCsv(grouped);
  fs.writeFileSync(outputPath, '\uFEFF' + csvText, 'utf8');
}

const isDirectRun =
  typeof process.argv[1] === 'string' && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  const defaultOutputPath = path.join(PROJECT_ROOT, 'modes-files-report.csv');
  const outputPath = process.argv[2]
    ? path.resolve(PROJECT_ROOT, process.argv[2])
    : defaultOutputPath;
  const grouped = collectModesFiles();
  writeModesCsv(grouped, outputPath);
  console.log(
    `CSV written to: ${path.relative(PROJECT_ROOT, outputPath).split(path.sep).join('/')}`
  );
  console.log(formatModesFileReport(grouped));
}
