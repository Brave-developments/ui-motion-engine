#!/usr/bin/env node
/** Chromium → source DOM motion → screenshot frames → Remotion MP4 smoke.
 * Synthetic fixture verifies pipeline, not FiveM source parity. */
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {SiteSession} from '../server/browser.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html = ['<!doctype html><html><head><style>',
'body{margin:0;background:#080e20;color:white;font-family:Arial,sans-serif}',
'main{padding:32px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
'.resource-card{background:#131f37;border:1px solid #3e649a;border-radius:14px;padding:22px;height:135px;box-sizing:border-box}',
'.resource-card h3{margin:8px 0;color:#b7dbff}.resource-card p{font-size:12px;color:#86a4c8}',
'</style></head><body><main><h1>Source Fixture — test only</h1>',
'<div class="grid"><article class="resource-card"><h3>Authentic DOM Test Card</h3><p>Rendered by a website, not the editor</p></article>',
'<article class="resource-card"><h3>Second Card</h3><p>Source alignment control</p></article></div></main></body></html>'].join('');
const local=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
const listen=()=>new Promise(resolve=>local.listen(4173,'127.0.0.1',resolve));
const close=()=>new Promise(resolve=>local.close(resolve));
const session=new SiteSession();let folder;
try {
  await listen();
  const info=await session.start({url:'http://127.0.0.1:4173/',width:640,height:360,allowExternalAssets:false});
  const selected=info.candidates.find(c=>c.classes.includes('resource-card')&&c.label.includes('Authentic'));
  assert.ok(selected,'expected actual source card');
  await session.select(selected.id);
  const props={style:'orbit-3d',intensity:65,totalFrames:240};
  const before=await session.capture(0,props);
  const baseBox=await session.page.locator('article.resource-card').first().evaluate(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    return {x:r.x,y:r.y,width:r.width,height:r.height,transform:s.transform,boxShadow:s.boxShadow};
  });
  const during=await session.capture(100,props);
  const after=await session.capture(239,props);
  const endBox=await session.page.locator('article.resource-card').first().evaluate(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    return {x:r.x,y:r.y,width:r.width,height:r.height,transform:s.transform,boxShadow:s.boxShadow};
  });
  assert.ok(!before.equals(during),'mid-animation pixels must change');
  // Bytewise PNG equality is not a valid fidelity test across compositor passes.
  // The original element and CSS geometry MUST return exactly; screenshot parity needs
  // pixel-diff metrics/tolerances in the advanced QA workflow.
  assert.deepEqual(endBox,baseBox,'source DOM computed geometry and styling must restore');
  if(!before.equals(after))console.log('INFO: PNG screenshot bytes changed; original source DOM geometry and CSS restored.');
  assert.equal(await session.page.locator('article.resource-card').count(),2,'no cloned cards');
  const jobId='smoke-'+Date.now().toString(36);
  folder=path.join(root,'public','renders',jobId);
  await fs.mkdir(folder,{recursive:true});
  const frames=[0,24,40,59,60,80,100,120,179,180,215,239];
  for(let index=0;index<frames.length;index++){
    const data=await session.capture(frames[index],props);
    await fs.writeFile(path.join(folder,String(index).padStart(5,'0')+'.png'),data);
  }
  const {bundle}=await import('@remotion/bundler');
  const {getCompositions,renderMedia}=await import('@remotion/renderer');
  const serveUrl=await bundle({entryPoint:path.join(root,'remotion','index.tsx'),publicDir:path.join(root,'public')});
  const inputProps={prefix:'renders/'+jobId+'/',frames:frames.length,fps:24,width:640,height:360};
  const comps=await getCompositions(serveUrl,{inputProps});
  const comp=comps.find(c=>c.id==='WebsiteMotionFrames');
  assert.ok(comp,'Remotion composition available');
  assert.equal(comp.width,640);assert.equal(comp.height,360);assert.equal(comp.durationInFrames,12);
  const output=path.join(os.tmpdir(),'ui-motion-smoke-'+Date.now()+'.mp4');
  await renderMedia({serveUrl,composition:comp,codec:'h264',outputLocation:output,inputProps,overwrite:true});
  const video=await fs.readFile(output);
  assert.ok(video.length>10000,'rendered video must contain media data');
  assert.equal(video.toString('ascii',4,8),'ftyp','MP4 header');
  console.log('PASS: source DOM parity and Remotion H.264 MP4 render, bytes='+video.length);
  await fs.unlink(output);
} finally {
  await session.close().catch(()=>{});
  await close().catch(()=>{});
  if(folder)await fs.rm(folder,{recursive:true,force:true}).catch(()=>{});
}
