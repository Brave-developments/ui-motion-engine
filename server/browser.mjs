import { chromium } from 'playwright';
import { assertLocalUrl, isAllowedAssetUrl } from './security.mjs';
import { computePose } from './motion.mjs';

const TARGET_SELECTOR='article.resource-card, article[class*="card"], [class*="resource-card"], [class*="server-card"], [class*="streamer-card"], [class*="hero"], .resource-core, h1, .page-search, button';
const css=(x)=>String(x).replace(/[^a-zA-Z0-9_-]/g,'_');
export class SiteSession {
  constructor(){this.browser=null;this.context=null;this.page=null;this.candidates=[];this.current=null;this.warnings=[];this.config=null;this.mutex=Promise.resolve();}
  async start(config) {
    await this.close();
    assertLocalUrl(config.url);
    this.config=config;
    this.browser=await chromium.launch({headless:true});
    this.context=await this.browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:1,locale:'en-AU',timezoneId:'Australia/Brisbane',reducedMotion:'reduce',serviceWorkers:'block'});
    await this.context.route('**/*',async route=>{
      const request=route.request();
      const address=request.url();
      if(!['GET','HEAD'].includes(request.method())){ this.warnings.push(`Blocked write request: ${request.method()}`);return route.abort(); }
      if(!isAllowedAssetUrl(address,config.allowExternalAssets)) {this.warnings.push('Blocked external asset or navigation');return route.abort();}
      const parsed=new URL(address);
      if(!['localhost','127.0.0.1','[::1]'].includes(parsed.hostname) && !['image','font','stylesheet'].includes(request.resourceType())) return route.abort();
      return route.continue();
    });
    this.page=await this.context.newPage();
    this.page.on('console', m=>{if(m.type()==='error')this.warnings.push(m.text().slice(0,160));});
    await this.page.goto(config.url,{waitUntil:'domcontentloaded',timeout:25000});
    await this.page.addStyleTag({content:'*,*::before,*::after{scroll-behavior:auto!important;transition-duration:0s!important;animation-play-state:paused!important}'});
    try{await this.page.evaluate(async()=>{
      await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]);
      await Promise.race([Promise.all([...document.images].slice(0,100).map(img=>img.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,5000))]);
    });}catch{this.warnings.push('Font/image readiness was not confirmed');}
    await this.page.waitForTimeout(450);
    this.candidates=await this.page.evaluate((sel)=>{
      const els=[...document.querySelectorAll(sel)];
      return els.map((el,i)=>{
        const rect=el.getBoundingClientRect(); const st=getComputedStyle(el);
        const label=(el.getAttribute('aria-label')||el.querySelector('h1,h2,h3')?.textContent||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,100);
        return {id:'target-'+i, index:i,tag:el.tagName.toLowerCase(),label,classes:(typeof el.className==='string'?el.className:'').slice(0,180),rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},hasImage:!!el.querySelector('img'),visible:rect.width>4&&rect.height>4&&st.visibility!=='hidden'&&st.display!=='none'&&rect.bottom>0&&rect.top<innerHeight&&rect.left<innerWidth&&rect.right>0};
      }).filter(x=>x.visible&&x.rect.width>42&&x.rect.height>24).slice(0,80);
    },TARGET_SELECTOR);
    this.warnings=[...new Set(this.warnings)].slice(0,20);
    return {url:config.url,title:await this.page.title(),candidates:this.candidates,warnings:this.warnings,viewport:{width:config.width,height:config.height},status:'REAL_SOURCE_DOM',sourceMethod:'Browser uses actual React-rendered site DOM (no recreated card JSX)'};
  }
  async select(targetId){
    if(!this.page)throw new Error('Inspect the website first');
    const target=this.candidates.find(x=>x.id===targetId);
    if(!target)throw new Error('Unknown target; inspect again');
    await this.reset();
    const item=await this.page.evaluate(({selector,index})=>{
      const node=document.querySelectorAll(selector)[index];
      if(!node)throw new Error('Target changed since inspection');
      const r=node.getBoundingClientRect();
      return {rect:{x:r.x,y:r.y,width:r.width,height:r.height},label:(node.getAttribute('aria-label')||node.querySelector('h1,h2,h3')?.textContent||node.textContent||'').replace(/\s+/g,' ').trim().slice(0,100),originalTransform:getComputedStyle(node).transform};
    },{selector:TARGET_SELECTOR,index:target.index});
    if(!item.rect.width||!item.rect.height)throw new Error('Target no longer visible');
    if(item.label!==target.label)throw new Error('Target content changed. Reinspect the page.');
    this.current={...target,...item};
    return this.current;
  }
  async reset(){
    if(!this.page)return;
    await this.page.evaluate(()=>{
      const x=document.getElementById('__ui_motion_dim');if(x)x.remove();
      const active=document.querySelector('[data-ui-motion-active="1"]');
      if(active){const prev=JSON.parse(active.getAttribute('data-ui-motion-original')||'{}');
        for(const name of ['transform','transformOrigin','filter','boxShadow','position','zIndex','willChange','backfaceVisibility','pointerEvents']){
          if(prev[name]===undefined||prev[name]===null)active.style.removeProperty(name.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()));
          else active.style[name]=prev[name];
        }
        active.removeAttribute('data-ui-motion-active');active.removeAttribute('data-ui-motion-original');
      }
    });
  }
  async capture(frame,options={}) {
    if(!this.current)throw new Error('Select a component');
    // Serialize page mutation and screenshot; renderer and editor may request frames concurrently.
    const operation=this.mutex.then(async()=>{
      if(!this.page)throw new Error('Source browser closed');
      const totalFrames=Number(options.totalFrames??240);
      const pose=computePose({style:options.style||'fly-out-return',frame:Number(frame),totalFrames,intensity:Number(options.intensity??65),rect:this.current.rect,viewport:{width:this.config.width,height:this.config.height}});
      await this.page.evaluate(({index,selector,pose})=>{
        const node=document.querySelectorAll(selector)[index];
        if(!node)throw new Error('Selected DOM element no longer exists');
        if(node.getAttribute('data-ui-motion-active')!=='1'){
          const original={};for(const prop of ['transform','transformOrigin','filter','boxShadow','position','zIndex','willChange','backfaceVisibility','pointerEvents'])original[prop]=node.style[prop]||null;
          node.setAttribute('data-ui-motion-original',JSON.stringify(original));
          node.setAttribute('data-ui-motion-active','1');
        }
        const original=JSON.parse(node.getAttribute('data-ui-motion-original')||'{}');
        let overlay=document.getElementById('__ui_motion_dim');
        if(!overlay){overlay=document.createElement('div');overlay.id='__ui_motion_dim';
          Object.assign(overlay.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'2147483000',background:'#080b18',opacity:'0',backdropFilter:'none',transition:'none'});
          document.body.append(overlay);
        }
        if(!pose.active){
          for(const prop of ['transform','transformOrigin','filter','boxShadow','position','zIndex','willChange','backfaceVisibility','pointerEvents']){
            if(original[prop]===null)node.style.removeProperty(prop.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()));else node.style[prop]=original[prop];
          }
          overlay.style.opacity='0';overlay.style.backdropFilter='none';
          return;
        }
        const finite=(n)=>Number.isFinite(n)?n:0;
        const x=finite(pose.x), y=finite(pose.y), z=finite(pose.z);
        node.style.position='relative';node.style.zIndex='2147483001';node.style.willChange='transform';node.style.pointerEvents='none';
        node.style.transformOrigin='center center';node.style.backfaceVisibility='hidden';
        const rest=original.transform||'';
        node.style.transform=`perspective(1200px) translate3d(${x}px,${y}px,${z}px) rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) rotateZ(${pose.rotateZ}deg) scale(${pose.scale}) ${rest}`;
        node.style.boxShadow=`0 0 0 300vmax rgba(8,11,24,${pose.dim*.78}), 0 24px 65px rgba(0,0,0,${pose.shadow})${pose.glow>0?`, 0 0 ${32*pose.glow}px rgba(88,184,255,${.7*pose.glow})`:''}`;
        // The dimming is drawn as a huge spread shadow BEHIND the real card.
        // This avoids the common z-index bug where a document-level backdrop covers the card.
        overlay.style.opacity='0';overlay.style.backdropFilter='none';
        // Blur is not applied in live-DOM mode: safely blurring a parent also blurs its card.
        // The snapshot/Remotion pipeline can add a true isolated backdrop later.
        // Ancestor overflow/stacking may still clip the transformed element; report visually.
      },{index:this.current.index,selector:TARGET_SELECTOR,pose});
      return this.page.screenshot({type:'png',animations:'disabled',caret:'hide'});
    });
    this.mutex=operation.catch(()=>{});
    return operation;
  }
  async close(){
    if(this.context)await this.context.close().catch(()=>{});
    if(this.browser)await this.browser.close().catch(()=>{});
    this.page=null;this.browser=null;this.context=null;this.current=null;this.candidates=[];
  }
}
