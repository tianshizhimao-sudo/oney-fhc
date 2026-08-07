import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const emailDir = join(root, 'emails');
const libFile = join(root, 'lib/sourceFacts.ts');

const requiredSchemaMarkers = [
  /consentType/i,
  /consentCapturedAt/i,
  /consentCaptureMethod/i,
  /consentCaptureSource/i,
  /managePreferencesUrl/i,
  /unsubscribeUrl/i,
  /sourceFactVersion/i,
];

const marketingRequired = [
  /consentCaptureMethod/i,
  /consentCaptureSource/i,
  /manage.*preferences/i,
  /unsubscribe/i,
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx$/.test(path) ? [path] : [];
  });
}

let failed = false;
const schemaText = readFileSync(libFile, 'utf8');
for (const pattern of requiredSchemaMarkers) {
  if (!pattern.test(schemaText)) {
    console.error(`MISSING_CONSENT_SCHEMA ${pattern}`);
    failed = true;
  }
}

const componentText = files(emailDir).map((file) => readFileSync(file, 'utf8')).join('\n');
for (const pattern of marketingRequired) {
  if (!pattern.test(componentText)) {
    console.error(`MISSING_MARKETING_CONSENT_GATE ${pattern}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('consent-gate lint passed');
