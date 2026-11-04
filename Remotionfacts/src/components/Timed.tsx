import React from 'react';
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { animStyle } from '../anim';

export type Pos = {
  x?: number; y?: number; width?: number; size?: number;
  align?: 'left' | 'center' | 'right'; rotate?: number; opacity?: number;
  animation?: string;
};

const Inner: React.FC<{ p: Pos; children: React.ReactNode }> = ({ p, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const a = animStyle(p.animation, frame, durationInFrames, fps);
  const justify = p.align === 'left' ? 'flex-start' : p.align === 'right' ? 'flex-end' : 'center';
  return (
    <div style={{
      position: 'absolute', left: `${p.x ?? 50}%`, top: `${p.y ?? 50}%`, width: `${p.width ?? 70}%`,
      transform: `translate(-50%, -50%) rotate(${p.rotate ?? 0}deg)`,
      opacity: p.opacity ?? 1, textAlign: p.align ?? 'center',
      display: 'flex', justifyContent: justify,
    }}>
      <div style={a}>{children}</div>
    </div>
  );
};

export const Timed: React.FC<{
  start: number; end: number; pos?: Pos; def?: Pos; children: React.ReactNode;
}> = ({ start, end, pos = {}, def = {}, children }) => {
  const { fps } = useVideoConfig();
  const from = Math.round(start * fps);
  const dur = Math.max(1, Math.round((end - start) * fps));
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <Inner p={{ ...def, ...pos }}>{children}</Inner>
    </Sequence>
  );
};
