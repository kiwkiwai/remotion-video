import React from 'react';
import { AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fxEnd } from '../data';
import { GRADES } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Skala koordinat path (hanya path dengan koordinat absolut: M, C, S, L)
const scalePath = (d: string, sx: number, sy: number) => {
  let i = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (m) => String(parseFloat(m) * (i++ % 2 === 0 ? sx : sy)));
};

export const PaperBg: React.FC<{ theme: any }> = ({ theme }) => {
  if (theme.paper === false) return null;
  return (
    <AbsoluteFill style={{
      backgroundImage: `radial-gradient(${theme.paperDot ?? 'rgba(0,0,0,0.07)'} 1.5px, transparent 1.5px)`,
      backgroundSize: '36px 36px',
    }} />
  );
};

export const Vignette: React.FC<{ theme: any }> = ({ theme }) => (
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, ${theme.vignette ?? 'rgba(40,25,10,0.55)'} 100%)`,
    mixBlendMode: theme.vignetteBlend ?? 'multiply', pointerEvents: 'none',
  }} />
);

const wrap = (v: number) => (((v % 110) + 110) % 110) - 5;

// Debu halus melayang (efek "dust")
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

// Lapisan warna sinematik (efek "colorGrade", pilih lewat config.grade)
export const ColorGrade: React.FC<{ name?: string; intensity?: number }> = ({ name = 'cold', intensity = 1 }) => {
  const g = GRADES[name] ?? GRADES.cold;
  return (
    <AbsoluteFill style={{
      pointerEvents: 'none', mixBlendMode: 'soft-light', opacity: intensity,
      background: `linear-gradient(to bottom, ${g.top}, ${g.bottom})`,
    }} />
  );
};

export const Grain: React.FC<{ amount?: number; blend?: string }> = ({ amount = 0.1, blend = 'multiply' }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: amount, mixBlendMode: blend as any }}>
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

// Pembungkus scene: memecah kanal warna merah/biru saat ada fx "rgbSplit" yang aktif
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
    dx = (active.amount ?? 12) * Math.sin(Math.PI * p);
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

// Pembungkus kamera: shake & zoomPunch menggeser/zoom scene saja (teks dan subtitle tetap diam)
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
      scale *= 1 + (a / 250) * Math.min(1, decay * 4); // tutup tepi kosong
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

const CIRCLE = 'M 54 4 C 88 2, 99 14, 96 23 C 93 35, 62 38, 38 36 C 10 33, 1 22, 6 13 C 11 5, 40 2, 62 5';
const UNDERLINE = 'M 2 22 C 25 14, 50 28, 75 18 S 96 18, 98 22';
const BOX = 'M 4 6 L 96 3 L 97 35 L 3 37 L 4 5';
const CROSS_A = 'M 6 4 L 94 36';
const CROSS_B = 'M 94 4 L 6 36';
const SHAFT = 'M 4 30 C 30 6, 62 4, 92 21';
const HEAD = 'M 76 9 L 93 21 L 72 33';

const FxBody: React.FC<{ f: any; theme: any }> = ({ f, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width: VW, height: VH, durationInFrames: D } = useVideoConfig();
  const edge = interpolate(frame, [0, D * 0.25, D * 0.75, D], [0, 1, 1, 0], clamp);
  const out = interpolate(frame, [D - 6, D], [1, 0], clamp);
  const p = frame / Math.max(1, D - 1);

  switch (f.type) {
    case 'marker': {
      const shape = f.shape ?? 'circle';
      const draw = interpolate(frame, [0, Math.min(D, 18)], [0, 1], clamp);
      const W = VW * ((f.width ?? 40) / 100);
      const H = VH * ((f.height ?? (shape === 'underline' ? 4 : shape === 'highlight' ? 5 : 12)) / 100);
      const pos: React.CSSProperties = { position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`, pointerEvents: 'none' };
      if (shape === 'highlight') {
        // stabilo: pita warna tersapu kiri ke kanan, menyatu dengan kertas (multiply)
        return (
          <div style={{
            ...pos, width: W, height: H, borderRadius: 6, background: f.color ?? theme.highlight, mixBlendMode: theme.blend ?? 'multiply',
            transform: `translate(-50%, -50%) rotate(${f.rotate ?? -1}deg)`, opacity: out * 0.9,
            clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`,
          }} />
        );
      }
      const paths = shape === 'underline' ? [UNDERLINE] : shape === 'box' ? [BOX] : shape === 'cross' ? [CROSS_A, CROSS_B] : [CIRCLE];
      return (
        <div style={{ ...pos, transform: 'translate(-50%, -50%)', opacity: draw > 0 ? out : 0 }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
            {paths.map((d, k) => {
              const part = clamp01(draw * paths.length - k);
              if (part <= 0) return null;
              return (
                <path key={k} d={scalePath(d, W / 100, H / 40)} fill="none"
                  stroke={f.color ?? theme.accent} strokeWidth={f.thickness ?? 10}
                  strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - part} />
              );
            })}
          </svg>
        </div>
      );
    }
    case 'arrow': {
      const W = VW * ((f.length ?? 20) / 100);
      const H = W * 0.4;
      const t = interpolate(frame, [0, Math.min(D, 20)], [0, 1], clamp);
      const shaft = clamp01(t / 0.7);
      const head = clamp01((t - 0.7) / 0.3);
      const common = {
        fill: 'none', stroke: f.color ?? theme.accent, strokeWidth: f.thickness ?? 8,
        strokeLinecap: 'round', strokeLinejoin: 'round', pathLength: 1, strokeDasharray: 1,
      } as const;
      return (
        <div style={{
          position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`,
          transform: `translate(-50%, -50%) rotate(${f.angle ?? 0}deg)`,
          opacity: t > 0 ? out : 0, pointerEvents: 'none',
        }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
            <path d={scalePath(SHAFT, W / 100, H / 40)} {...common} strokeDashoffset={1 - shaft} />
            <path d={scalePath(HEAD, W / 100, H / 40)} {...common} strokeDashoffset={1 - head} />
          </svg>
        </div>
      );
    }
    case 'stamp': {
      const s = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 0.6 }, durationInFrames: 14 });
      const size = f.size ?? 90;
      const color = f.color ?? theme.accent;
      return (
        <div style={{
          position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`,
          transform: `translate(-50%, -50%) rotate(${f.rotate ?? -8}deg) scale(${2.2 - 1.2 * s})`,
          opacity: Math.min(1, s * 2) * out * 0.92, pointerEvents: 'none',
          fontSize: size, fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase',
          color, border: `${Math.round(size / 10)}px solid ${color}`, borderRadius: 16,
          padding: '8px 36px', whiteSpace: 'nowrap', mixBlendMode: theme.blend ?? 'multiply',
        }}>{f.text}</div>
      );
    }
    case 'spotlight': {
      const r = (f.radius ?? 260) * interpolate(frame, [0, 18], [1.6, 1], clamp);
      return (
        <AbsoluteFill style={{
          pointerEvents: 'none', opacity: edge,
          background: `radial-gradient(circle at ${f.x ?? 50}% ${f.y ?? 50}%, rgba(0,0,0,0) ${r}px, rgba(0,0,0,${f.amount ?? 0.78}) ${r * 1.9}px)`,
        }} />
      );
    }
    case 'redact': {
      const inP = interpolate(frame, [0, 10], [0, 1], clamp);
      const outWipe = interpolate(frame, [D - 10, D], [0, 1], clamp);
      return (
        <div style={{
          position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`,
          width: `${f.width ?? 40}%`, height: `${f.height ?? 4}%`,
          transform: `translate(-50%, -50%) rotate(${f.rotate ?? 0}deg)`,
          background: f.color ?? '#111', pointerEvents: 'none',
          clipPath: `inset(0 ${(1 - inP) * 100}% 0 ${f.reveal ? outWipe * 100 : 0}%)`,
          opacity: f.reveal ? 1 : out,
        }} />
      );
    }
    case 'dim':
      return <AbsoluteFill style={{ background: '#000', opacity: edge * (f.amount ?? 0.3), pointerEvents: 'none' }} />;
    case 'blurIn': {
      const b = interpolate(frame, [0, D], [24, 0], clamp);
      return <AbsoluteFill style={{ backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)` }} />;
    }
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
    case 'flash':
      return (
        <AbsoluteFill style={{
          pointerEvents: 'none', background: f.color ?? '#fff',
          opacity: interpolate(frame, [0, D], [f.intensity ?? 0.9, 0], clamp),
        }} />
      );
    case 'note': {
      // sticky note dengan selotip, muncul membal
      const s = spring({ frame, fps, config: { damping: 11, stiffness: 160, mass: 0.7 }, durationInFrames: 16 });
      return (
        <div style={{
          position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`, width: `${f.width ?? 56}%`,
          transform: `translate(-50%, -50%) rotate(${f.rotate ?? -3}deg) scale(${0.6 + 0.4 * s})`,
          opacity: Math.min(1, s * 2) * out, pointerEvents: 'none',
          padding: '40px 44px', background: f.color ?? '#FFE066', color: '#16161A',
          fontSize: f.size ?? 52, fontWeight: 700, lineHeight: 1.25, boxShadow: '0 18px 30px rgba(0,0,0,0.25)',
        }}>
          <div style={{ position: 'absolute', top: -20, left: '50%', width: 150, height: 40, marginLeft: -75, background: 'rgba(255,255,255,0.6)', transform: 'rotate(2deg)' }} />
          {f.text}
        </div>
      );
    }
    case 'bars': {
      // bar chart horizontal: items [{label, value, color?}], opsional max, prefix, suffix, decimals, size
      const items: { label: string; value: number; color?: string }[] = f.items ?? [];
      const max = f.max ?? Math.max(...items.map((it) => it.value), 1);
      const size = f.size ?? 40;
      return (
        <div style={{
          position: 'absolute', left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%`, width: `${f.width ?? 80}%`,
          transform: 'translate(-50%, -50%)', opacity: out, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', gap: size * 0.8, color: theme.text,
        }}>
          {items.map((it, i) => {
            const g = clamp01((frame - i * 6) / 22);
            const e = 1 - Math.pow(1 - g, 3);
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: size, fontWeight: 800, marginBottom: 8 }}>
                  <span>{it.label}</span>
                  <span>{f.prefix ?? ''}{(it.value * e).toFixed(f.decimals ?? 0)}{f.suffix ?? ''}</span>
                </div>
                <div style={{ height: size * 0.6, borderRadius: 999, background: theme.track ?? 'rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                  <div style={{ width: `${(it.value / max) * 100 * e}%`, height: '100%', borderRadius: 999, background: it.color ?? (i === 0 ? theme.accent : theme.primary) }} />
                </div>
              </div>
            );
          })}
        </div>
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