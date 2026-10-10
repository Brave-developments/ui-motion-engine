import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame} from 'remotion';
export function FrameSequence({prefix}: {prefix:string;frames:number;fps:number}) {
  const frame=useCurrentFrame();
  // Each source image is a real Chromium screenshot, with the ORIGINAL React DOM animated.
  return <AbsoluteFill style={{background:'#070b17'}}><Img src={staticFile(`${prefix}${String(frame).padStart(5,'0')}.png`)} style={{width:'100%',height:'100%',objectFit:'contain'}} /></AbsoluteFill>;
}
