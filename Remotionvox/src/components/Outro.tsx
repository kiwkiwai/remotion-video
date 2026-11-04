import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { resolveAsset } from '../data';

const OutroBody: React.FC<{ o: any; theme: any }> = ({ o, theme }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: theme.bg, opacity: a, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1, color: theme.text }}>{o.text}</div>
      {o.sub && <div style={{ fontSize: 44, fontWeight: 600, marginTop: 36, color: theme.text }}>{o.sub}</div>}
    </AbsoluteFill>
  );
};

export const Outro: React.FC<{ config: any; theme: any }> = ({ config, theme }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const o = config.outro;
  if (!o?.text) return null;
  const from = Math.round((o.start ?? durationInFrames / fps - 3) * fps);
  return (
    <Sequence from={from} durationInFrames={Math.max(1, durationInFrames - from)}>
      <OutroBody o={o} theme={theme} />
    </Sequence>
  );
};

export const Logo: React.FC<{ video: string; config: any }> = ({ video, config }) => {
  const l = config.logo;
  if (!l?.file) return null;
  return (
    <Img src={staticFile(resolveAsset(video, l.file))} style={{
      position: 'absolute', left: `${l.x ?? 86}%`, top: `${l.y ?? 10}%`, width: `${l.width ?? 14}%`,
      transform: 'translate(-50%, -50%)', opacity: l.opacity ?? 0.8,
    }} />
  );
};

export const ProgressBar: React.FC<{ config: any; theme: any }> = ({ config, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pb = config.progressBar;
  if (!pb) return null;
  const c = typeof pb === 'object' ? pb : {};
  return (
    <div style={{
      position: 'absolute', left: 0, bottom: 0, height: c.height ?? 8,
      width: `${(frame / durationInFrames) * 100}%`, background: c.color ?? theme.accent,
    }} />
  );
};