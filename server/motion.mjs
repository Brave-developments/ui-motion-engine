// Entire animation depends on (frame, dimensions, site rectangle, chosen style and settings).
// There are no clocks, random values or external state in this module.
export const STYLES = Object.freeze([
  'fly-out-return', 'orbit-3d', 'hero-focus', 'tilt-pop',
  'sweep-highlight', 'bounce-focus', 'cinematic-pan', 'reveal-stack'
]);
export const FPS = 30;
export const DEFAULT_DURATION = 240;
export const clamp = (v, min=0, max=1) => Math.min(max, Math.max(min, v));
export const ease = v => { const t = clamp(v); return t*t*(3-2*t); };
export const mix = (a,b,t) => a + (b-a)*t;
export function phaseProgress(f, start, peak, holdEnd, end) {
  if (f < start || f >= end) return 0;
  if (f <= peak) return ease((f-start)/Math.max(1,peak-start));
  if (f <= holdEnd) return 1;
  return 1-ease((f-holdEnd)/Math.max(1,end-1-holdEnd));
}
export function computePose({style='fly-out-return',frame=0,totalFrames=240,intensity=65,rect,viewport}) {
  if (!STYLES.includes(style)) throw new Error(`Unknown motion style: ${style}`);
  if (!rect || !viewport || rect.width<=0 || rect.height<=0) throw new Error('Missing real source component geometry');
  const k=clamp(Number(intensity)/100), f=clamp(frame,0,totalFrames-1), T=totalFrames;
  const sourceX=rect.x+rect.width/2, sourceY=rect.y+rect.height/2;
  const centerX=viewport.width*0.5, centerY=viewport.height*0.46;
  const safeW=viewport.width*0.86, safeH=viewport.height*0.80;
  const safeMaxScale=Math.max(1, Math.min(2.1,safeW/rect.width,safeH/rect.height));
  const visibleFrom=Math.round(T*.10), liftEnd=Math.round(T*.25);
  const returnStart=Math.round(T*.75), hiddenAfter=Math.round(T*.90);
  const p=phaseProgress(f,visibleFrom,liftEnd,returnStart,hiddenAfter)*k;
  let dx=0,dy=0,z=0,scale=1,rx=0,ry=0,rz=0, glow=0;
  let dim=0,blur=0;
  if (style==='orbit-3d') {
    // The spatial revolution completes; 65% scales radii, not angular completion.
    const start=Math.round(T*.25), end=Math.round(T*.75)-1;
    const q = ease(clamp((f-start)/Math.max(1,end-start)));
    const theta=Math.PI*2*q;
    const radiusX=260*k, radiusY=92*k, radiusZ=220*k;
    const atTheta=(a)=>({x:centerX+radiusX*Math.cos(a),y:centerY+radiusY*Math.sin(a),z:radiusZ*Math.sin(a)});
    const orbital=atTheta(theta);
    let u=0;
    if(f<visibleFrom)u=0;
    else if(f<start)u=ease((f-visibleFrom)/Math.max(1,start-1-visibleFrom));
    else if(f<=end)u=1;
    else if(f<hiddenAfter)u=1-ease((f-(end+1))/Math.max(1,hiddenAfter-1-(end+1)));
    const dest=f<start?atTheta(0):f>end?atTheta(2*Math.PI):orbital;
    dx=(dest.x-sourceX)*u;
    dy=(dest.y-sourceY)*u;
    z=dest.z*u;
    scale=1+Math.min(.32*k, safeMaxScale-1)*u;
    rx=9*k*Math.cos(theta)*u; ry=18*k*Math.sin(theta)*u;rz=2*k*Math.sin(theta)*u;
    glow=.65*u; dim=.50*k*u; blur=8*k*u;
  } else if(style==='fly-out-return' || style==='hero-focus' || style==='tilt-pop' || style==='bounce-focus') {
    let target=1.85;
    if(style==='hero-focus')target=1.6;
    if(style==='tilt-pop')target=1.34;
    if(style==='bounce-focus')target=1.5;
    const max=Math.min(target,safeMaxScale);
    const destinationFactor=style==='tilt-pop'?.42:1;
    dx=(centerX-sourceX)*p*destinationFactor;
    dy=(centerY-sourceY)*p*destinationFactor;
    scale=1+(max-1)*p;
    ry=(style==='tilt-pop'?24:style==='hero-focus'?6:16)*p;
    rz=(style==='bounce-focus'?5:-4)*p;
    z=(style==='bounce-focus'?70:38)*p;
    glow=p;dim=.48*p;blur=5*p;
  } else if(style==='sweep-highlight') {
    // Subtle movement around exact original element, no artificial card replacement.
    const q=phaseProgress(f,visibleFrom,liftEnd,returnStart,hiddenAfter);
    scale=1+Math.min(.08*k, safeMaxScale-1)*q;
    dx=12*k*Math.sin(Math.PI*2*f/T)*q;
    ry=7*k*Math.sin(Math.PI*2*f/T)*q;
    glow=q*k;dim=.18*q*k;blur=0;
  } else if(style==='reveal-stack') {
    const q=phaseProgress(f,visibleFrom,liftEnd,returnStart,hiddenAfter);
    dx=35*k*q;dy=-25*k*q;
    scale=1+Math.min(.26*k,safeMaxScale-1)*q;
    ry=12*k*q;rz=-3*k*q;glow=.7*k*q;dim=.3*k*q;
  } else if(style==='cinematic-pan') {
    const q=phaseProgress(f,visibleFrom,liftEnd,returnStart,hiddenAfter);
    dx=(centerX-sourceX)*.45*k*q;
    dy=(centerY-sourceY)*.45*k*q;
    scale=1+Math.min(.24*k,safeMaxScale-1)*q;
    glow=.35*k*q;dim=.12*k*q;
  }
  if(k === 0) return {active:false,x:0,y:0,z:0,scale:1,rotateX:0,rotateY:0,rotateZ:0,glow:0,dim:0,blur:0,shadow:0,phase:'original',frame:f,style};
  const active = (f>=visibleFrom && f<hiddenAfter && k>0);
  return {active,x:dx,y:dy,z,scale,rotateX:rx,rotateY:ry,rotateZ:rz,glow:clamp(glow),dim:clamp(dim),blur:Math.max(0,blur),shadow:clamp(Math.max(glow,p)*.45),phase:f<visibleFrom?'original':f<liftEnd?'lift':f<returnStart?'hero':f<hiddenAfter?'return':'original',frame:f,style};
}
