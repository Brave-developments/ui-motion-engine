/**
 * Reference effect wrapper only. Pass the original imported website card as children.
 * It does NOT recreate any source UI. Adopt into a real Remotion composition in Phase 1.
 * Positions use video canvas px, after converting browser DOMRect CSS px to canvas px.
 */
import type { CSSProperties, ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type Rect = { x: number; y: number; width: number; height: number };

type Props = {
  origin: Rect;
  children: ReactNode; // <ActualSourceResourceCard {...pinnedProps} />
  focusX: number;
  focusY: number;
  startFrame?: number;
  liftDuration?: number;
  holdFrames?: number;
  returnDuration?: number;
  zoom?: number;
};

export function FlyingOriginalCard({
  origin, children, focusX, focusY,
  startFrame = 15, liftDuration = 34, holdFrames = 60,
  returnDuration = 40, zoom = 1.6,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const lifting = spring({ frame: local, fps, durationInFrames: liftDuration, config: { damping: 18 } });
  const returning = spring({ frame: local - liftDuration - holdFrames, fps,
    durationInFrames: returnDuration, config: { damping: 20 } });
  const progress = Math.max(0, Math.min(1, lifting)) *
    (1 - Math.max(0, Math.min(1, returning)));
  const cardCx = origin.x + origin.width / 2;
  const cardCy = origin.y + origin.height / 2;
  const tx = (focusX - cardCx) * progress;
  const ty = (focusY - cardCy) * progress;
  const scale = interpolate(progress, [0, 1], [1, zoom]);
  const tilt = interpolate(progress, [0, 1], [0, 12]);
  // Exact initial/final transform, so swap with visible original card at boundaries.
  const style: CSSProperties = {
    position: 'absolute', left: origin.x, top: origin.y,
    width: origin.width, height: origin.height,
    transformOrigin: 'center center',
    transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotateY(${tilt}deg)`,
    boxShadow: progress ? `0 ${20 * progress}px ${55 * progress}px rgba(0,0,0,${0.4 * progress})` : 'none',
    willChange: 'transform',
    pointerEvents: 'none',
  };
  return <div style={{ position: 'absolute', inset: 0, perspective: 1200, pointerEvents: 'none' }}>
    <div style={style}>{children}</div>
  </div>;
}
