const $=id=>document.getElementById(id);
const state={candidates:[],selected:null,width:1440,height:810,style:'fly-out-return',intensity:65,frame:0,fps:30,totalFrames:240,playing:false,busy:false,playToken:0,siteUrl:'',jobId:null};
const api=async(url,body)=>{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!res.ok){const m=await res.json().catch(()=>({error:'Request failed'}));throw new Error(m.error||'Request failed');}return res;};
function notify(message,error=false){$('notice').textContent=message;$('notice').className='notice'+(error?' error':'');}
function enable(value){for(const id of ['directBtn','style','previewBtn','renderBtn','seek','playBtn','backBtn','nextBtn'])$(id).disabled=!value;}
function setFrame(frame){state.frame=Math.max(0,Math.min(state.totalFrames-1,frame));$('seek').max=state.totalFrames-1;$('seek').value=state.frame;$('frameText').textContent=`Frame ${state.frame} / ${state.totalFrames-1}`;const seconds=Math.floor(state.frame/state.fps);$('timecode').textContent=`00:${String(seconds).padStart(2,'0')} / 00:08`;}
async function renderFrame(){
 if(!state.selected||state.busy)return;
 state.busy=true;
 try{const r=await api('/api/frame',{frame:state.frame,totalFrames:state.totalFrames,style:state.style,intensity:state.intensity});const blob=await r.blob();const url=URL.createObjectURL(blob);const img=$('siteImage');const previous=img.dataset.blob;img.src=url;img.dataset.blob=url;if(previous)URL.revokeObjectURL(previous);$('emptyPreview').style.display='none';$('hitboxes').innerHTML='';}
 catch(e){notify(e.message,true);stopPlayback();}finally{state.busy=false;}
}
function selectVisual(targetId){state.selected=targetId;document.querySelectorAll('.target').forEach(x=>x.classList.toggle('selected',x.dataset.id===targetId));document.querySelectorAll('.hitbox').forEach(x=>x.classList.toggle('active',x.dataset.id===targetId));}
async function selectTarget(targetId){
 stopPlayback();try{const r=await api('/api/select',{targetId});const data=await r.json();selectVisual(targetId);enable(true);setFrame(0);$('renderMode').textContent='REAL REACT DOM';$('decisionReason').textContent=`Selected: ${data.selected.label}. The source component remains the actual React-rendered website element.`;notify(data.warning);await renderFrame();}catch(e){notify(e.message,true);}
}
function updateHitboxes(){const root=$('hitboxes');root.innerHTML='';for(const c of state.candidates){if(!c.rect||c.rect.width<50)continue;const b=document.createElement('button');b.type='button';b.className='hitbox';b.title=c.label||c.classes;b.dataset.id=c.id;b.style.left=(c.rect.x/state.width*100)+'%';b.style.top=(c.rect.y/state.height*100)+'%';b.style.width=(c.rect.width/state.width*100)+'%';b.style.height=(c.rect.height/state.height*100)+'%';b.addEventListener('click',()=>selectTarget(c.id));root.append(b);}}
$('connectForm').addEventListener('submit',async e=>{
 e.preventDefault();stopPlayback();enable(false);$('inspectBtn').disabled=true;notify('Opening a clean Chromium session and reading genuine website elements...');
 const values={url:$('siteUrl').value,width:Number($('viewportWidth').value),height:Number($('viewportHeight').value),allowExternalAssets:$('externalAssets').checked};
 try{const r=await api('/api/inspect',values);const data=await r.json();state.candidates=data.candidates||[];state.width=values.width;state.height=values.height;state.selected=null;state.siteUrl=values.url;const img=$('siteImage');img.src='/api/snapshot?cache='+Date.now();$('emptyPreview').style.display='none';$('canvas').style.aspectRatio=`${state.width}/${state.height}`;$('sourceStatus').textContent='Connected: '+data.title.slice(0,28);$('renderMode').textContent='SITE INSPECTED';$('count').textContent=`${state.candidates.length} selectable items from the actual rendered website.`;
 const list=$('targetList');list.innerHTML='';for(const c of state.candidates){const b=document.createElement('button');b.className='target';b.dataset.id=c.id;b.innerHTML=`<span class="target-title"></span><span class="target-meta"></span>`;b.querySelector('.target-title').textContent=c.label||c.classes||'Untitled element';b.querySelector('.target-meta').textContent=`${c.tag.toUpperCase()} • ${Math.round(c.rect.width)} × ${Math.round(c.rect.height)}px`;b.addEventListener('click',()=>selectTarget(c.id));list.append(b);}updateHitboxes();notify(`Inspected ${data.candidates.length} real targets. Choose a component. ${data.warnings.length?'Warnings: '+data.warnings.slice(0,2).join(' | '):''}`);}
 catch(e){notify(e.message,true);}finally{$('inspectBtn').disabled=false;}
});
$('directBtn').addEventListener('click',async()=>{if(!state.selected)return;notify('Selecting a cinematic effect for your real website element...');$('directBtn').disabled=true;try{const r=await api('/api/direct',{prompt:$('creativePrompt').value,intensity:Number($('intensity').value)});const {decision}=await r.json();state.style=decision.style;state.intensity=decision.intensity;$('style').value=decision.style;$('intensity').value=decision.intensity;$('intensityValue').textContent=decision.intensity+'%';$('decisionReason').textContent=`${decision.director}: ${decision.reason}`;notify(`Director chose ${decision.style} at ${decision.intensity}% intensity.`);await renderFrame();}catch(e){notify(e.message,true);}finally{$('directBtn').disabled=false;}});
$('intensity').addEventListener('input',e=>{$('intensityValue').textContent=e.target.value+'%';state.intensity=Number(e.target.value);});
$('intensity').addEventListener('change',renderFrame);
$('style').addEventListener('change',e=>{state.style=e.target.value;$('decisionReason').textContent='Manual style override. The real UI remains unchanged.';renderFrame();});
$('previewBtn').addEventListener('click',renderFrame);
$('fps').addEventListener('change',e=>{state.fps=Number(e.target.value);state.totalFrames=state.fps*8;setFrame(0);renderFrame();});
$('seek').addEventListener('input',e=>{stopPlayback();setFrame(Number(e.target.value));});
$('seek').addEventListener('change',renderFrame);
$('backBtn').addEventListener('click',()=>{stopPlayback();setFrame(state.frame-1);renderFrame();});
$('nextBtn').addEventListener('click',()=>{stopPlayback();setFrame(state.frame+1);renderFrame();});
function stopPlayback(){state.playing=false;state.playToken++;$('playBtn').textContent='▶';}
$('playBtn').addEventListener('click',async()=>{
 if(state.playing){stopPlayback();return;}
 state.playing=true;const token=++state.playToken;$('playBtn').textContent='Ⅱ';let last=performance.now();
 while(state.playing&&token===state.playToken){
  if(state.busy){await new Promise(r=>setTimeout(r,40));continue;}
  const time=performance.now();if(time-last<120){await new Promise(r=>setTimeout(r,20));continue;}
  // Responsive draft playback; final export renders every exact frame at requested FPS.
  last=time;setFrame((state.frame+Math.max(1,Math.round(state.fps*.13)))%state.totalFrames);
  await renderFrame();
 }
});
$('renderBtn').addEventListener('click',async()=>{if(!state.selected)return;stopPlayback();$('renderBtn').disabled=true;$('outputPanel').hidden=false;$('progressFill').style.width='0';$('jobMessage').textContent='Preparing genuine website frames...';$('downloadArea').innerHTML='';try{const r=await api('/api/render',{style:state.style,intensity:state.intensity,fps:state.fps});const job=await r.json();state.jobId=job.id;notify('Remotion export started. Browser captures real source frames; Remotion assembles the MP4.');const interval=setInterval(async()=>{try{const status=await fetch(`/api/jobs/${job.id}`).then(x=>x.json());$('progressFill').style.width=(status.progress||0)+'%';$('jobMessage').textContent=`${status.status}: ${status.progress||0}% (${status.completed||0}/${status.frames} frames)`;if(status.status==='ready'||status.status==='failed'){clearInterval(interval);$('renderBtn').disabled=false;if(status.status==='ready'){$('downloadArea').innerHTML=`<a download="ui-motion.mp4" href="/api/jobs/${job.id}/video">Download finished MP4 ↗</a> · <a href="/api/jobs/${job.id}/manifest">Source manifest</a> · <a href="/api/jobs/${job.id}/qa">QA report</a>`;notify('Remotion export completed. Review video and source fidelity before publishing.');}else notify(status.error||'Render failed',true);}}catch(e){clearInterval(interval);$('renderBtn').disabled=false;notify(e.message,true);}},1500);}catch(e){$('renderBtn').disabled=false;notify(e.message,true);}});
fetch('/api/status').then(r=>r.json()).then(r=>{$('modelHint').textContent=r.modelConfigured?'Gemini is configured. AI can choose from '+r.styles.length+' motion styles.':'Gemini is not configured. Automatic rules choose from '+r.styles.length+' motion styles; set GEMINI_API_KEY to enable model-directed choices.';}).catch(()=>{});
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||!state.selected)return;if(e.code==='Space'){e.preventDefault();$('playBtn').click();}else if(e.code==='ArrowLeft'){e.preventDefault();setFrame(state.frame-(e.shiftKey?10:1));renderFrame();}else if(e.code==='ArrowRight'){e.preventDefault();setFrame(state.frame+(e.shiftKey?10:1));renderFrame();}});
