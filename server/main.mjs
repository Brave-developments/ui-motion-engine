import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SiteSession} from './browser.mjs';
import {chooseStyle} from './director.mjs';
import {STYLES} from './motion.mjs';
import {validateSettings} from './security.mjs';
import {renderProject,isRendering,getJob,outputPath,framePath} from './render.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const APP_PORT=Number(process.env.MOTION_PORT||5085);
const site=new SiteSession();
let decision=null, selected=null;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.mp4':'video/mp4','.json':'application/json'};
const reply=(res,status,obj)=>{const body=JSON.stringify(obj);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'http://127.0.0.1:'+APP_PORT});res.end(body)};
async function json(req){let text='';for await(const ch of req){text+=ch.toString();if(text.length>24000)throw new Error('Request too large');}return JSON.parse(text||'{}');}
async function serveFile(res,file,type=null){const content=await fs.readFile(file);res.writeHead(200,{'Content-Type':type||mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(content);}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://127.0.0.1:'+APP_PORT).pathname;
  if(req.method==='GET'&&pathname==='/api/status')return reply(res,200,{ok:true,version:'0.2.0',website:site.config?.url||null,selected:selected?.id||null,modelConfigured:!!process.env.GEMINI_API_KEY,styles:STYLES,implementation:'real DOM motion capture + Remotion MP4 assembly'});
  if(req.method==='POST'&&pathname==='/api/inspect'){
    if(isRendering())return reply(res,409,{error:'Cannot replace the website during an active render'});
    const config=validateSettings(await json(req));selected=null;decision=null;
    const result=await site.start(config);return reply(res,200,result);
  }
  if(req.method==='GET'&&pathname==='/api/snapshot'){
    if(!site.page)return reply(res,400,{error:'Inspect website first'});
    await site.reset();const screenshot=await site.page.screenshot({type:'png',animations:'disabled',caret:'hide'});
    res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store'});res.end(screenshot);return;
  }
  if(req.method==='POST'&&pathname==='/api/select'){
    if(isRendering())return reply(res,409,{error:'Cannot replace the component during an active render'});
    const input=await json(req);selected=await site.select(String(input.targetId));decision=null;
    return reply(res,200,{selected,renderability:'REAL_SOURCE_DOM',warning:'Original React DOM is animated inside its source browser. An isolated JSX import adapter is not yet available.'});
  }
  if(req.method==='POST'&&pathname==='/api/direct'){
    if(!selected)return reply(res,400,{error:'Select an element first'});
    const input=await json(req);
    decision=await chooseStyle(site.candidates,{targetId:selected.id,width:site.config.width,height:site.config.height,intensity:Number(input.intensity??65),prompt:String(input.prompt??'').slice(0,800)});
    return reply(res,200,{decision});
  }
  if(req.method==='POST'&&pathname==='/api/frame'){
    if(!selected)return reply(res,400,{error:'Select an element first'});
    const input=await json(req);
    const style=String(input.style||decision?.style||'fly-out-return');
    if(!STYLES.includes(style))throw new Error('Unknown style');
    const intensity=Number(input.intensity??decision?.intensity??65);
    if(!Number.isFinite(intensity)||intensity<0||intensity>100)throw new Error('Intensity must be 0–100');
    const totalFrames=Number(input.totalFrames||240),frame=Number(input.frame||0);
    if(!Number.isInteger(totalFrames)||totalFrames<30||totalFrames>480||!Number.isInteger(frame)||frame<0||frame>=totalFrames)throw new Error('Invalid video frames');
    const image=await site.capture(frame,{style,intensity,totalFrames});
    res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store'});res.end(image);return;
  }
  if(req.method==='POST'&&pathname==='/api/render'){
    if(!selected)return reply(res,400,{error:'Select a website component before exporting'});
    const input=await json(req);
    const style=String(input.style||decision?.style||'fly-out-return');if(!STYLES.includes(style))throw new Error('Unknown style');
    const intensity=Number(input.intensity??decision?.intensity??65);
    const fps=Number(input.fps||30);
    if(![24,25,30,60].includes(fps)||!Number.isFinite(intensity)||intensity<0||intensity>100)throw new Error('Invalid render settings');
    const result=await renderProject(site,{style,intensity,fps,width:site.config.width,height:site.config.height});
    return reply(res,202,result);
  }
  const matchJob=pathname.match(/^\/api\/jobs\/(render-[a-z0-9-]+)(?:\/(video|manifest|qa|frames\/\d{1,5}))?$/);
  if(req.method==='GET'&&matchJob){
    const [,id,item]=matchJob;
    const job=getJob(id);if(!job)return reply(res,404,{error:'Job not found'});
    if(!item)return reply(res,200,job);
    if(item.startsWith('frames/'))return await serveFile(res,framePath(id,item.slice(7)),'image/png');
    return await serveFile(res,outputPath(id,item==='video'?'video.mp4':item+'.json'));
  }
  if(req.method==='GET'&&(pathname==='/'||['/app.js','/app.css'].includes(pathname)))return await serveFile(res,path.join(root,'studio',pathname==='/'?'index.html':pathname.slice(1)));
  return reply(res,404,{error:'Not found'});
 }catch(e){const status=/ENOENT/.test(String(e))?404:400;reply(res,status,{error:String(e?.message||e)});}
});
server.listen(APP_PORT,'127.0.0.1',()=>console.log(`UI Motion Playground: http://127.0.0.1:${APP_PORT}\nConnect a locally running React website. Model configured: ${Boolean(process.env.GEMINI_API_KEY)}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{server.close();await site.close();process.exit(0);});
