#!/usr/bin/env node
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv from 'ajv';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (filename) => fs.readFile(path.join(root, filename), 'utf8').then(JSON.parse);
const ajv = new Ajv({ allErrors: true, strict: false });
let failed = false;
for (const [schemaFile, sampleFile] of [
  ['specs/ui-manifest.schema.json', 'specs/example.ui-manifest.json'],
  ['specs/storyboard.schema.json', 'specs/example.storyboard.json'],
]) {
  const [schema, sample] = await Promise.all([read(schemaFile), read(sampleFile)]);
  const check = ajv.compile(schema);
  if (check(sample)) console.log(`PASS ${sampleFile}`);
  else { console.error(`FAIL ${sampleFile}`, check.errors); failed = true; }
}
const storyboard = await read('specs/example.storyboard.json');
const manifest = await read('specs/example.ui-manifest.json');
const ids = new Set(manifest.components.map((x) => x.id));
for (const shot of storyboard.shots) {
  if (!ids.has(shot.targetId)) { failed = true; console.error('Missing target', shot.targetId); }
  for (const effect of shot.effects) {
    if (effect.startOffset + effect.durationFrames > shot.durationFrames) {
      failed = true; console.error('Effect exceeds shot', shot.id, effect.name);
    }
  }
}
// Strong semantic warning: the supplied example is NOT verified / production-ready.
if (manifest.components.some((c) => !c.verifiedImport)) console.log('EXPECTED WARNING: sample target is unverified (not production-ready).');
if (failed) process.exitCode = 1;
