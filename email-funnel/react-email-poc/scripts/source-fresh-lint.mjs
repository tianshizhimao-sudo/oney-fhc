import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const targets = ['emails', 'lib'].map((p) => join(root, p));
const stalePatterns = [/4\.10%?/, /7\.10%?/, /7\.35%?/];
const requiredPatterns = [
  /general information only/i,
  /not credit advice/i,
  /unsubscribe/i,
  /manage.*preferences/i,
  /rba/i,
  /apra/i,
  /sourceFactVersion/i,
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(tsx|ts|mjs)$/.test(path) ? [path] : [];
  });
}

let failed = false;
const allText = files(targets[0]).concat(files(targets[1])).map((file) => {
  const text = readFileSync(file, 'utf8');
  for (const pattern of stalePatterns) {
    if (pattern.test(text)) {
      console.error(`STALE_RATE ${pattern} in ${file}`);
      failed = true;
    }
  }
  return text;
}).join('\n');

for (const pattern of requiredPatterns) {
  if (!pattern.test(allText)) {
    console.error(`MISSING_REQUIRED ${pattern}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('source-fresh lint passed');
