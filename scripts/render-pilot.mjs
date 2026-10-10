#!/usr/bin/env node
// CLI pilot: use an authentic running website card and create a real Remotion MP4.
import {SiteSession} from '../server/browser.mjs';
import {chooseStyle} from '../server/director.mjs';
import {renderProject,getJob} from '../server/render.mjs';
import {validateSettings} from '../server/security.mjs';
const args=process.argv.slice(2);
const option=(key,def)=>{const i=args.indexOf('--'+key);return i===-1?def:args[i+1];};
const cfg=validateSettings({
  url:option('url','http://127.0.0.1:5173/free'),
  width:1440,height:810,
  intensity:Number(option('intensity','65')),
  prompt:option('prompt','cinematic resource card reveal')
});
const session=new SiteSession();
try {
  const site=await session.start(cfg);
  const label=option('label','').toLowerCase();
  const target=site.candidates.find(c=>c.classes.includes('resource-card') && c.label.toLowerCase().includes(label))
    ??site.candidates.find(c=>c.tag==='article'&&c.label.toLowerCase().includes(label));
  if(!target)throw new Error('No authentic visible resource card. Check source website/API or route.');
  await session.select(target.id);
  const dir=await chooseStyle(site.candidates,{targetId:target.id,prompt:cfg.prompt,intensity:cfg.intensity,width:cfg.width,height:cfg.height});
  console.log('Original source component:',target.label,'Director:',dir.director,'Style:',dir.style);
  const job=await renderProject(session,{style:dir.style,intensity:dir.intensity,fps:30,width:cfg.width,height:cfg.height});
  while(true) {
    await new Promise(r=>setTimeout(r,2000));
    const state=getJob(job.id);
    if(state.status==='ready'){console.log('Completed MP4: out/'+job.id+'/video.mp4');break;}
    if(state.status==='failed')throw new Error(state.error);
    process.stdout.write('\r'+state.status+' '+state.progress+'%');
  }
} catch(err) {
  console.error('Pilot render failed:',err?.stack||String(err));process.exitCode=1;
} finally { await session.close(); }
