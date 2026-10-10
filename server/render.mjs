import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePose } from './motion.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const jobs=new Map();
let busy=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function getJob(id){const result=jobs.get(id);return result?{...result,absolutePath:undefined}:null;}
export async function renderProject(session,{style,intensity,fps=30,width=1920,height=1080}) {
  if(busy)throw new Error('A render is already in progress');
  if(!session.current)throw new Error('Choose a real website component before rendering.');
  const id='render-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  const frames=8*fps;
  const dir=path.join(root,'public','renders',id);
  const out=path.join(root,'out',id);
  const result={id,status:'queued',frames,completed:0,progress:0,style,intensity,fps,width,height,startedAt:new Date().toISOString(),error:null,video:null};
  jobs.set(id,result);
  busy=true;
  (async()=>{
    try {
      await fs.mkdir(dir,{recursive:true});await fs.mkdir(out,{recursive:true});
      result.status='capturing';
      for(let f=0;f<frames;f++) {
        const bytes=await session.capture(f,{style,intensity,totalFrames:frames});
        await fs.writeFile(path.join(dir,`${String(f).padStart(5,'0')}.png`),bytes);
        result.completed=f+1;
        result.progress=Math.round((f+1)/frames*80);
      }
      await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({id,sourceUrl:session.config.url,sourceMethod:'original-react-rendered-dom',selected:session.current,style,intensity,fps,frames,width,height,warning:'CSS transform applies to real DOM; per-frame capture is composited by Remotion as authenticated source imagery.',createdAt:result.startedAt},null,2));
      result.status='composing';
      // Actual Remotion 4 render of captured source-faithful frames, not a fake card rendering.
      const {bundle}=await import('@remotion/bundler');
      const {getCompositions,renderMedia}=await import('@remotion/renderer');
      const entry=path.join(root,'remotion','index.tsx');
      const serveUrl=await bundle({entryPoint:entry,publicDir:path.join(root,'public'),onProgress:(pct)=>{result.progress=80+Math.floor(pct*8);}});
      const inputProps={prefix:`renders/${id}/`,frames,fps,width:session.config.width,height:session.config.height};
      const compositions=await getCompositions(serveUrl,{inputProps});
      const composition=compositions.find(c=>c.id==='WebsiteMotionFrames');
      if(!composition)throw new Error('Remotion composition not found');
      const outputLocation=path.join(out,'video.mp4');
      await renderMedia({composition,serveUrl,codec:'h264',outputLocation,inputProps,crf:18,overwrite:true,onProgress:({progress})=>{result.progress=88+Math.floor(progress*12);}});
      result.video=`/api/jobs/${id}/video`;
      result.status='ready';result.progress=100;
      await fs.writeFile(path.join(out,'qa.json'),JSON.stringify({kind:'per-frame original DOM replay',renderedWith:'Remotion',status:'exported',frames,source:session.config.url,target:session.current.id,notes:['Visual pixel-parity with static original React import is not established by this DOM capture route','For detailed proof, compare original f0 to f239; inspect z-index conflicts by reviewing video.']},null,2));
    } catch(e){result.status='failed';result.error=String(e?.stack||e).slice(0,1800);}
    finally{busy=false;result.completed=frames;}
  })();
  return getJob(id);
}
export function outputPath(id,filename){
 if(!/^render-[a-z0-9-]+$/.test(id))throw new Error('Invalid job ID');
 if(!['video.mp4','qa.json','manifest.json'].includes(filename))throw new Error('Unknown output');
 return path.join(root,'out',id,filename);
}
export function framePath(id,f){
 if(!/^render-[a-z0-9-]+$/.test(id)||!/^\d{1,5}$/.test(String(f)))throw new Error('Invalid image path');
 return path.join(root,'public','renders',id,`${String(f).padStart(5,'0')}.png`);
}
