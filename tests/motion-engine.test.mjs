import test from 'node:test';
import assert from 'node:assert/strict';
import {STYLES,computePose} from '../server/motion.mjs';
const arg={rect:{x:200,y:130,width:250,height:190},viewport:{width:1440,height:810},totalFrames:240};
test('all selectable styles return finite poses',()=>{
 assert.ok(STYLES.length>=7);
 for(const style of STYLES){for(let f of [0,24,60,119,179,180,215,216,239]){
   const pose=computePose({...arg,style,intensity:65,frame:f});
   for(const key of ['x','y','z','scale','rotateX','rotateY','rotateZ','dim','glow'])assert.ok(Number.isFinite(pose[key]),style+':'+f+':'+key);
 }}
});
test('orbit 0% stays exactly at original location every frame',()=>{
 for(let f=0;f<240;f++){const p=computePose({...arg,frame:f,style:'orbit-3d',intensity:0});assert.equal(p.active,false);assert.equal(p.x,0);assert.equal(p.y,0);assert.equal(p.z,0);assert.equal(p.scale,1);assert.equal(p.dim,0);assert.equal(p.glow,0);}
});
test('orbit performs a closed circuit while returning to original slot',()=>{
 const p=(f)=>computePose({...arg,frame:f,style:'orbit-3d',intensity:65});
 assert.equal(p(23).x,0);assert.equal(p(24).x,0);assert.equal(p(24).scale,1);
 for(const key of ['x','y','z','scale','rotateX','rotateY','rotateZ'])assert.ok(Math.abs(p(59)[key]-p(60)[key])<0.00001,`entry ${key}`);
 for(const key of ['x','y','z','scale','rotateX','rotateY','rotateZ'])assert.ok(Math.abs(p(179)[key]-p(180)[key])<0.00001,`exit ${key}`);
 assert.ok(Math.abs(p(120).x-p(60).x)>50);assert.ok(Math.abs(p(90).z)>20);
 for(const f of [215,216,239]){assert.ok(Math.abs(p(f).x)<0.01);assert.ok(Math.abs(p(f).y)<0.01);assert.ok(Math.abs(p(f).z)<0.01);assert.ok(Math.abs(p(f).scale-1)<0.01);}
});
test('all animations have frame 215 source identity',()=>{
 for(const style of STYLES){const p=computePose({...arg,frame:215,style,intensity:100});assert.ok(Math.abs(p.x)<0.01,style);assert.ok(Math.abs(p.y)<0.01,style);assert.ok(Math.abs(p.scale-1)<0.01,style);}
});
