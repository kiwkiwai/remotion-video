import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { resolveAsset } from '../data';

export const ParallaxView: React.FC<{ video: string; cfg: any; theme: any }> = ({ video, cfg, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / Math.max(1, durationInFrames - 1);
  const k = cfg.intensity ?? 1;
  const dir = cfg.direction ?? 'zoomIn';
  const layers = [...(cfg.layers ?? [])].sort((a: any, b: any) => (a.depth ?? 1) - (b.depth ?? 1));
  const rotY = (p - 0.5) * 8 * k;
  const rotX = (0.5 - p) * 3 * k;

  return (
    <AbsoluteFill style={{ perspective: 1400, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)` }}>
        {layers.map((l: any, i: number) => {
          const d = l.depth ?? 1;
          let tx = 0;
          let sc = 1.1;
          if (dir === 'left') tx = -(p - 0.5) * d * 50 * k;
          else if (dir === 'right') tx = (p - 0.5) * d * 50 * k;
          else sc = 1.1 + p * 0.04 * d * k;
          const transform = `translateX(${tx}px) scale(${sc})`;
          if (l.type === 'text') {
            return (
              <AbsoluteFill key={i} style={{ transform }}>
                <div style={{
                  position: 'absolute', left: `${l.x ?? 50}%`, top: `${l.y ?? 40}%`,
                  transform: 'translate(-50%, -50%)', fontSize: l.size ?? 200, fontWeight: 900,
                  color: l.color ?? theme.accent, whiteSpace: 'nowrap', lineHeight: 1,
                }}>{l.text}</div>
              </AbsoluteFill>
            );
          }
          return (
            <AbsoluteFill key={i} style={{ transform }}>
              <Img src={staticFile(resolveAsset(video, l.file))} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
