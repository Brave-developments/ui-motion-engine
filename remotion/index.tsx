import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {FrameSequence} from './sequence';
const Root:React.FC=()=> <Composition
  id="WebsiteMotionFrames"
  component={FrameSequence}
  durationInFrames={240}
  fps={30}
  width={1440}
  height={810}
  defaultProps={{prefix:'renders/example/',frames:240,fps:30,width:1440,height:810}}
  calculateMetadata={({props})=>({durationInFrames:props.frames||240,fps:props.fps||30,width:props.width||1440,height:props.height||810})}
/>;
registerRoot(Root);
