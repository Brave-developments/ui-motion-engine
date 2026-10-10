#!/usr/bin/env node
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv from 'ajv';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (filename) => fs.readFile(path.join(root, filename), 'utf8').then(JSON.parse);
const ajv = new Ajv({ allErrors: true, strict: false });
let failed = false;
const compiledValidators = new Map();
for (const [schemaFile, sampleFile] of [
  ['specs/ui-manifest.schema.json', 'specs/example.ui-manifest.json'],
  ['specs/storyboard.schema.json', 'specs/example.storyboard.json'],
]) {
  const [schema, sample] = await Promise.all([read(schemaFile), read(sampleFile)]);
  const check = ajv.compile(schema);
  compiledValidators.set(schemaFile, check);
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

// Preset templates are intentionally not bound to an approved source manifest yet.
// Validate structural contracts and phase semantics without pretending these are render-ready.
const checkPreset = compiledValidators.get('specs/storyboard.schema.json');
if (!checkPreset) throw new Error('Storyboard validator missing');
for (const file of ['presets/fly-out-return-100.json', 'presets/orbit-3d-65.json']) {
  const preset = await read(file);
  if (!checkPreset(preset)) {
    failed = true;
    console.error('FAIL preset schema', file, checkPreset.errors);
    continue;
  }
  if (!preset.id.includes('TEMPLATE') ||
      preset.shots.some(shot => shot.targetId !== 'REPLACE_WITH_VERIFIED_MANIFEST_COMPONENT_ID')) {
    failed = true;
    console.error('FAIL preset incorrectly claims a verified live target', file);
  }
  for (const shot of preset.shots) {
    for (const effect of shot.effects) {
      if (effect.startOffset + effect.durationFrames > shot.durationFrames) {
        failed = true;
        console.error('FAIL effect extends beyond shot', file, shot.id, effect.name);
      }
    }
  }
  if (file.includes('orbit-3d')) {
    const shot = preset.shots[0];
    const orbit = shot.effects.find(effect => effect.name === 'orbit-3d');
    const p = orbit?.params;
    const close = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 1e-6;
    if (!p || preset.fps !== 30 || shot.durationFrames !== 240 ||
        orbit.startOffset !== 24 || orbit.durationFrames !== 192 ||
        p.entryStartFrame !== 24 || p.entryEndFrame !== 59 ||
        p.orbitStartFrame !== 60 || p.orbitEndFrame !== 179 ||
        p.returnStartFrame !== 180 || p.returnEndFrame !== 215 ||
        p.restoreStartFrame !== 216 ||
        p.liftFrames + p.orbitFrames + p.returnFrames !== 192 ||
        p.intensityPercent !== 65 || p.circuitDegrees !== 360 ||
        p.depthAmplitudePx >= p.perspectivePx ||
        !close(p.orbitRadiusXpx, p.artMaxRadiusXpx * 0.65) ||
        !close(p.orbitRadiusYpx, p.artMaxRadiusYpx * 0.65) ||
        !close(p.depthAmplitudePx, p.artMaxDepthAmplitudePx * 0.65) ||
        !close(p.baseScale, 1 + (p.artMaxBaseScale - 1) * 0.65)) {
      failed = true;
      console.error('FAIL orbit 3D phase/intensity semantics', file);
    }
  }
  if (!failed) console.log('PASS preset contract', file, '(template only, not production-ready)');
}

if (failed) process.exitCode = 1;
