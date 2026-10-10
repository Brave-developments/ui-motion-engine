import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Example manifest and storyboard are honest about their illustrative status', () => {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'specs/example.ui-manifest.json')));
  const s = JSON.parse(fs.readFileSync(path.join(root, 'specs/example.storyboard.json')));
  assert.equal(m.components[0].verifiedImport, false);
  assert.equal(m.components[0].renderMode, 'unresolved');
  assert.equal(s.shots[0].targetId, m.components[0].id);
  assert.ok(s.warnings.some((x) => x.includes('EXAMPLE')));
});
test('Repository contains engineering handoff and parity gate', () => {
  const handoff = fs.readFileSync(path.join(root, 'docs/13-ENGINEERING-HANDOFF.md'), 'utf8');
  const tests = fs.readFileSync(path.join(root, 'docs/09-QUALITY-AND-TESTS.md'), 'utf8');
  assert.match(handoff, /actual existing card code/i);
  assert.match(tests, /visual/i);
});
