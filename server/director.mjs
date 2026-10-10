import { STYLES, clamp } from './motion.mjs';
export function localDecision(candidates = [], context = {}) {
  const selected = candidates.find(x=>x.id===context.targetId) ?? candidates[0] ?? {};
  const title=String(selected.label??'').toLowerCase();
  const kind=String(selected.tag??'').toLowerCase();
  const prompt=String(context.prompt??'').toLowerCase();
  let style='fly-out-return', reason='Highlight the original component without changing its design.';
  if(/orbit|galaxy|planet|circle|space/.test(prompt)) {style='orbit-3d';reason='The creative brief requests depth and orbital movement.';}
  else if(/spin|tilt|rotate/.test(prompt)) {style='tilt-pop';reason='A subtle 3D tilt fits the creative brief.';}
  else if(/spotlight|glow|simple|minimal/.test(prompt)) {style='sweep-highlight';reason='A restrained spotlight preserves readability.';}
  else if(/hero|headline|banner|launch/.test(prompt+' '+title)||kind==='h1') {style='hero-focus';reason='The title/hero warrants a clean centred reveal.';}
  else if(/server|grid|multiple|stack/.test(prompt+' '+title)) {style='reveal-stack';reason='A spatial stack suits the card/grid content.';}
  else if(/bounce|playful|fun/.test(prompt)) {style='bounce-focus';reason='The requested tone benefits from a spring-style movement.';}
  else if(/search|sweep|scroll/.test(prompt)||kind==='input') {style='cinematic-pan';reason='Camera-like movement suits a search/interaction feature.';}
  else if (Number(selected.rect?.width) > (Number(context.width)||1440)*.65) {style='hero-focus';reason='A wide component benefits from limited zoom and clear framing.';}
  else if(kind==='button'||kind==='a') {style='sweep-highlight';reason='A smaller control remains legible with a restrained highlight.';}
  return {style,intensity:clamp(Number(context.intensity??65),0,100),reason,director:'Automatic rules',caption:''};
}
export function validateDecision(decision, defaults={}) {
  const style=STYLES.includes(decision?.style)?decision.style:defaults.style??'fly-out-return';
  const intensity=typeof decision?.intensity==='number'&&Number.isFinite(decision.intensity)?clamp(decision.intensity,0,100):clamp(Number(defaults.intensity??65),0,100);
  return {style,intensity,reason:String(decision?.reason??defaults.reason??'').slice(0,240),caption:String(decision?.caption??'').slice(0,140),director:defaults.director??'AI Director'};
}
export async function chooseStyle(candidates,context={},settings={}) {
  const fallback=localDecision(candidates,context);
  const key=settings.apiKey || process.env.GEMINI_API_KEY;
  if(!key) return fallback;
  const selected=candidates.find(x=>x.id===context.targetId) ?? candidates[0];
  if(!selected) return fallback;
  const model=(process.env.GEMINI_MODEL||'gemini-2.5-flash').replace(/[^a-zA-Z0-9._-]/g,'');
  const desc={tag:selected.tag, label:String(selected.label||'').slice(0,100),dimensions:selected.rect,viewport:{width:context.width,height:context.height},userDirection:String(context.prompt||'').slice(0,800)};
  const message='You are a cinematic motion director. Pick EXACTLY ONE existing animation style for real website UI; never change or invent the actual UI. Allowed styles: '+STYLES.join(', ')+'. Return only JSON: {"style": "one allowed style", "intensity": number 0..100, "reason":"short visual design rationale", "caption":"optional promotional caption, without made-up claims"}. Make your choice from actual geometry, source type and creative brief: '+JSON.stringify(desc);
  try {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    let response;
    try { response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:message}]}],generationConfig:{responseMimeType:'application/json',temperature:0.4}})}); }
    finally {clearTimeout(timeout);}
    if(!response.ok)throw new Error(`Gemini ${response.status}`);
    const data=await response.json();
    const answer=data.candidates?.[0]?.content?.parts?.map(p=>p.text??'').join('')??'';
    const parsed=JSON.parse(answer);
    return validateDecision(parsed,{...fallback,director:'Gemini AI'});
  } catch (error) {
    return {...fallback,director:'Automatic rules (AI unavailable)',reason:`AI request unavailable; ${fallback.reason}`};
  }
}
