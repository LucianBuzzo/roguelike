#!/usr/bin/env node

const { readdirSync, statSync, readFileSync } = require('fs');
const { join, extname } = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const IGNORED_DIRS = new Set(['.git', 'node_modules']);

function collectJsFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        files.push(...collectJsFiles(join(dir, entry.name)));
      }
      continue;
    }

    if (entry.isFile() && extname(entry.name) === '.js') {
      files.push(join(dir, entry.name));
    }
  }

  return files;
}

function main() {
  const jsFiles = collectJsFiles(ROOT).sort();

  if (jsFiles.length === 0) {
    console.log('No JavaScript files found.');
    return;
  }

  for (const filePath of jsFiles) {
    const source = readFileSync(filePath, 'utf8');
    try {
      new vm.Script(source, { filename: filePath });
      console.log(`✓ ${filePath.replace(`${ROOT}/`, '')}`);
    } catch (error) {
      console.error(`✗ Syntax error in ${filePath.replace(`${ROOT}/`, '')}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log(`Checked ${jsFiles.length} JavaScript file(s).`);
}

main();
