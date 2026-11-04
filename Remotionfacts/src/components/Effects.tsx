import React from 'react';
import { AbsoluteFill, Sequence, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { fxEnd } from '../data';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)',
    pointerEvents: 'none',
  }} />
);

export const Particles: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const speed = 0.5;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 18 }).map((_, i) => {
        const size = 4 + random(`s${i}`) * 8;
        const sp = (0.25 + random(`v${i}`) * 0.5) * speed;
        const off = random(`o${i}`) * 120;
        const top = 110 - ((frame * sp + off) % 120);
        return (
          <div key={i} style={{
            position: 'absolute', left: `${random(`x${i}`) * 100}%`, top: `${top}%`,
            width: size, height: size, borderRadius: '50%', background: color,
            opacity: 0.25 + random(`a${i}`) * 0.4, boxShadow: `0 0 ${size * 3}px ${color}`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

const wrap = (v: number) => (((v % 110) + 110) % 110) - 5;

export const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 40 }).map((_, i) => {
        const size = 2 + random(`ds${i}`) * 3;
        const sp = 0.05 + random(`dv${i}`) * 0.12;
        const x = wrap(random(`dx${i}`) * 110 + frame * sp * 0.6 + Math.sin(frame / 40 + i) * 1.5);
        const y = wrap(random(`dy${i}`) * 110 - frame * sp);
        const o = (0.15 + random(`do${i}`) * 0.3) * (0.6 + 0.4 * Math.sin(frame / 15 + i));
        return (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size,
            borderRadius: '50%', background: '#fff', opacity: o, filter: 'blur(0.5px)',
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ amount?: number }> = ({ amount = 0.12 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: amount, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={frame % 6} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const GRADES: Record<string, { top: string; bottom: string }> = {
  purple: { top: 'rgba(255,150,80,0.30)', bottom: 'rgba(90,40,160,0.70)' },
  teal: { top: 'rgba(255,140,60,0.35)', bottom: 'rgba(0,110,130,0.70)' },
  cold: { top: 'rgba(120,200,255,0.25)', bottom: 'rgba(30,70,150,0.70)' },
  warm: { top: 'rgba(255,200,120,0.30)', bottom: 'rgba(160,80,20,0.55)' },
  fire: { top: 'rgba(255,190,80,0.35)', bottom: 'rgba(190,40,10,0.70)' },
  gold: { top: 'rgba(255,225,140,0.35)', bottom: 'rgba(150,90,10,0.60)' },
  green: { top: 'rgba(120,200,160,0.20)', bottom: 'rgba(10,60,40,0.75)' },
};

export const ColorGrade: React.FC<{ name?: string; intensity?: number }> = ({ name = 'purple', intensity = 1 }) => {
  const g = GRADES[name] ?? GRADES.purple;
  return (
    <AbsoluteFill style={{
      pointerEvents: 'none', mixBlendMode: 'soft-light', opacity: intensity,
      background: `linear-gradient(to bottom, ${g.top}, ${g.bottom})`,
    }} />
  );
};

// Pembungkus untuk scene: memecah kanal warna merah/biru saat ada fx "rgbSplit" yang aktif
export const RgbSplit: React.FC<{ config: any; children: React.ReactNode }> = ({ config, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const active = (config.fx ?? []).find(
    (f: any) => f.type === 'rgbSplit' && t >= f.start && t < fxEnd(f)
  );
  let dx = 0;
  if (active) {
    const end = fxEnd(active);
    const p = clamp01((t - active.start) / Math.max(0.01, end - active.start));
    dx = (active.amount ?? 12) * Math.sin(Math.PI * p); // naik lalu turun
  }
  return (
    <AbsoluteFill style={{ filter: dx > 0.2 ? 'url(#rgbsplit)' : undefined }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="rgbsplit" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={dx} dy="0" result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-dx} dy="0" result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

// Pembungkus kamera: shake & zoomPunch menggeser/zoom scene saja (subtitle & teks tetap diam)
export const CameraFx: React.FC<{ config: any; children: React.ReactNode }> = ({ config, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let tx = 0, ty = 0, rot = 0, scale = 1, active = false;
  for (const f of config.fx ?? []) {
    if (f.type !== 'shake' && f.type !== 'zoomPunch') continue;
    const end = fxEnd(f);
    if (t < f.start || t >= end) continue;
    active = true;
    const p = clamp01((t - f.start) / Math.max(0.01, end - f.start));
    const decay = (1 - p) * (1 - p);
    if (f.type === 'shake') {
      const a = f.amount ?? 22; // px
      tx += (random(`shx${frame}`) - 0.5) * 2 * a * decay;
      ty += (random(`shy${frame}`) - 0.5) * 2 * a * decay;
      rot += (random(`shr${frame}`) - 0.5) * 2 * a * 0.04 * decay;
      scale *= 1 + (a / 250) * Math.min(1, decay * 4); // tutup tepi hitam
    } else {
      scale *= 1 + (f.amount ?? 0.12) * decay;
    }
  }
  return (
    <AbsoluteFill style={active ? { transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})` } : undefined}>
      {children}
    </AbsoluteFill>
  );
};

const FxBody: React.FC<{ f: any; theme: any }> = ({ f, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D, width, height } = useVideoConfig();
  const p = frame / Math.max(1, D - 1);
  const edge = interpolate(frame, [0, D * 0.25, D * 0.75, D], [0, 1, 1, 0], clamp);

  switch (f.type) {
    case 'lightLeak': {
      const x = interpolate(p, [0, 1], [-30, 110]);
      return (
        <AbsoluteFill style={{
          opacity: edge * 0.85, mixBlendMode: 'screen', pointerEvents: 'none',
          background: `radial-gradient(ellipse 55% 70% at ${x}% 30%, rgba(255,140,60,0.9), rgba(255,60,120,0.5) 45%, transparent 70%)`,
        }} />
      );
    }
    case 'bokeh':
      return (
        <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const size = 120 + random(`bk${i}`) * 220;
            const color = i % 2 ? theme.primary : theme.highlight;
            return (
              <div key={i} style={{
                position: 'absolute', left: `${random(`bx${i}`) * 100}%`, top: `${random(`by${i}`) * 100 - p * 8}%`,
                width: size, height: size, borderRadius: '50%', transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${color}, transparent 70%)`,
                filter: 'blur(18px)', opacity: edge * (0.3 + random(`bo${i}`) * 0.35),
              }} />
            );
          })}
        </AbsoluteFill>
      );
    case 'letterbox': {
      const h = `${(f.size ?? 11) * edge}%`;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h, background: '#000' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: '#000' }} />
        </AbsoluteFill>
      );
    }
    case 'glowPulse':
      return (
        <AbsoluteFill style={{
          pointerEvents: 'none', opacity: edge * 0.8,
          boxShadow: `inset 0 0 ${200 + 120 * Math.sin(frame / 6)}px 40px ${f.color ?? theme.primary}`,
        }} />
      );
    case 'blurIn': {
      const b = interpolate(frame, [0, D], [24, 0], clamp);
      return <AbsoluteFill style={{ backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)` }} />;
    }
    case 'flash':
      return (
        <AbsoluteFill style={{
          pointerEvents: 'none', background: f.color ?? '#fff',
          opacity: interpolate(frame, [0, D], [f.intensity ?? 0.9, 0], clamp),
        }} />
      );
    case 'shockwave': {
      const color = f.color ?? theme.highlight;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
          {[0, 0.2].map((delay, i) => {
            if (p < delay) return null;
            const q = clamp01((p - delay) / (1 - delay));
            const size = (1 - Math.pow(1 - q, 3)) * Math.hypot(width, height) * 1.1;
            return (
              <div key={i} style={{
                position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`, width: size, height: size,
                boxSizing: 'border-box', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                border: `${Math.max(2, (1 - q) * 28)}px solid ${color}`, opacity: (1 - q) * 0.9,
                boxShadow: `0 0 60px ${color}, inset 0 0 60px ${color}`,
              }} />
            );
          })}
        </AbsoluteFill>
      );
    }
    case 'speedLines': {
      const N = 56;
      const seed = Math.floor(frame / 2); // berkedip tiap 2 frame
      const cx = width / 2, cy = height / 2, R = Math.hypot(width, height) / 2;
      const inner = R * (f.inner ?? 0.45);
      const pt = (r: number, a: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: edge * 0.85 }}>
          <svg width={width} height={height}>
            {Array.from({ length: N }).map((_, i) => {
              const a = (i / N) * Math.PI * 2 + (random(`sa${i}-${seed}`) - 0.5) * 0.08;
              const w = 0.012 + random(`sw${i}-${seed}`) * 0.03;
              const r1 = inner + random(`sr${i}-${seed}`) * R * 0.25;
              return (
                <polygon key={i} points={`${pt(r1, a)} ${pt(R * 1.05, a - w)} ${pt(R * 1.05, a + w)}`}
                  fill={f.color ?? '#fff'} opacity={0.35 + random(`so${i}-${seed}`) * 0.5} />
              );
            })}
          </svg>
        </AbsoluteFill>
      );
    }
    case 'sparks': {
      const color = f.color ?? theme.highlight;
      const ox = ((f.x ?? 50) / 100) * width, oy = ((f.y ?? 50) / 100) * height;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
          {Array.from({ length: f.count ?? 36 }).map((_, i) => {
            const ang = random(`pa${i}`) * Math.PI * 2;
            const dist = 350 + random(`ps${i}`) * 700;
            const q = clamp01(p * (0.8 + random(`pl${i}`) * 0.4));
            const e = 1 - Math.pow(1 - q, 3);
            const size = 4 + random(`pz${i}`) * 8;
            return (
              <div key={i} style={{
                position: 'absolute', left: ox + Math.cos(ang) * dist * e, top: oy + Math.sin(ang) * dist * e + 400 * q * q,
                width: size, height: size, borderRadius: '50%', background: color,
                boxShadow: `0 0 ${size * 3}px ${color}`, opacity: 1 - q, transform: 'translate(-50%, -50%)',
              }} />
            );
          })}
        </AbsoluteFill>
      );
    }
    case 'vhs': {
      const band = ((frame * 14) % (height * 1.4)) - height * 0.2;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: edge }}>
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: band, height: 140, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.14), transparent)' }} />
          <AbsoluteFill style={{ background: 'rgba(255,0,80,0.05)', mixBlendMode: 'screen' }} />
        </AbsoluteFill>
      );
    }
    default:
      return null; // rgbSplit, shake, zoomPunch ditangani <RgbSplit> / <CameraFx>
  }
};

export const Fx: React.FC<{ config: any; theme: any }> = ({ config, theme }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {(config.fx ?? []).map((f: any, i: number) => {
        const end = fxEnd(f);
        const from = Math.round(f.start * fps);
        const dur = Math.max(2, Math.round((end - f.start) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <FxBody f={f} theme={theme} />
          </Sequence>
        );
      })}
    </>
  );
};