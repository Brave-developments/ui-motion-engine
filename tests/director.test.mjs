import test from 'node:test';
import assert from 'node:assert/strict';
import {localDecision,validateDecision} from '../server/director.mjs';
import {STYLES} from '../server/motion.mjs';
const items=[{id:'x',label:'Free car',tag:'article',rect:{width:300,height:200}}];
test('automatic director can choose more than two effects',()=>{
 const results=['orbit around logo','minimal spotlight','big hero intro','bounce and fun','cinematic scroll','a car'].map(prompt=>localDecision(items,{targetId:'x',prompt}));
 assert.ok(new Set(results.map(x=>x.style)).size>=5);
 for(const x of results)assert.ok(STYLES.includes(x.style));
});
test('invalid provider values cannot add uncontrolled code or effects',()=>{
 assert.equal(validateDecision({style:'evil-js',intensity:999},{style:'orbit-3d'}).style,'orbit-3d');
 assert.equal(validateDecision({style:'orbit-3d',intensity:999}).intensity,100);
 assert.equal(validateDecision({style:'orbit-3d',intensity:-500}).intensity,0);
});
