import test from 'node:test';
import assert from 'node:assert/strict';
import { fitRect, translationToFocus } from '../src/geometry.mjs';
test('geometry is exact when browser viewport equals video size', () => {
  const source = { x: 330, y: 210, width: 300, height: 220 };
  const mapped = fitRect(source, {width: 1920,height:1080},{width:1920,height:1080});
  assert.deepEqual([mapped.x,mapped.y,mapped.width,mapped.height], [330,210,300,220]);
});
test('letterboxing adds padding without stretching', () => {
  const mapped = fitRect({x:0,y:0,width:100,height:100},{width:1440,height:900},{width:1920,height:1080});
  assert.equal(mapped.scale, 1.2);
  assert.equal(mapped.padX, 96);
  assert.equal(mapped.x, 96);
  assert.equal(mapped.y, 0);
});
test('translation goes from measured center to target center', () => {
  assert.deepEqual(translationToFocus({x:20,y:30,width:100,height:80}, 400, 600), {dx:330,dy:530});
});
test('invalid geometry is rejected', () => assert.throws(() => fitRect({x:0,y:0,width:-1,height:1},{width:1,height:1},{width:1,height:1})));
