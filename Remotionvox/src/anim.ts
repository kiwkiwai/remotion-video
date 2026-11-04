import React from 'react';
import { interpolate, spring, random } from 'remotion';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const animStyle = (
  name: string | undefined, frame: number, duration: number, fps: number
): React.CSSProperties => {
  const exit = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lin = clamp(frame / 12);
  const e = 1 - Math.pow(1 - lin, 3);
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 140 }, durationInFrames: 20 });
  const sb = spring({ frame, fps, config: { damping: 7, stiffness: 120 }, durationInFrames: 28 });
  switch (name) {
    case 'pop': return { opacity: exit * Math.min(1, s * 2), transform: `scale(${0.6 + 0.4 * s})` };
    case 'slideLeft': return { opacity: e * exit, transform: `translateX(${(1 - e) * -220}px)` };
    case 'slideUp': return { opacity: e * exit, transform: `translateY(${(1 - e) * 120}px)` };
    case 'bounce': return { opacity: exit * Math.min(1, lin * 3), transform: `translateY(${(1 - sb) * 160}px) scale(${0.8 + 0.2 * sb})` };
    case 'drop': return { opacity: exit * Math.min(1, lin * 3), transform: `translateY(${(1 - sb) * -260}px)` };
    case 'blur': return { opacity: e * exit, filter: lin < 1 ? `blur(${(1 - e) * 20}px)` : undefined };
    case 'typewriter':
    case 'highlight': return { opacity: exit };
    case 'fade':
    default: return { opacity: e * exit };
  }
};

export const transitionStyle = (name: string | null, frame: number, T: number): React.CSSProperties => {
  if (!name) return {};
  const p = clamp(frame / T);
  const e = 1 - Math.pow(1 - p, 3);
  switch (name) {
    case 'fade': return { opacity: e };
    case 'crossBlur': return { opacity: e, filter: p < 1 ? `blur(${(1 - e) * 22}px)` : undefined };
    case 'slide': return { transform: `translateX(${(1 - e) * 100}%)` };
    case 'slideUp': return { transform: `translateY(${(1 - e) * 100}%)` };
    case 'circle': return { clipPath: p < 1 ? `circle(${e * 75}% at 50% 50%)` : undefined };
    case 'pageTurn': return { transformOrigin: 'left center', opacity: Math.min(1, e * 2.5), transform: `perspective(1400px) rotateY(${(1 - e) * -80}deg)` };
    case 'flash': return {
      opacity: Math.min(1, e * 2),
      filter: p < 1 ? `brightness(${1 + (1 - e) * 4}) saturate(${1 - (1 - e) * 0.6})` : undefined,
    };
    case 'wipe': return { clipPath: `inset(0 ${(1 - e) * 100}% 0 0)` };
    case 'zoom': return { opacity: e, transform: `scale(${1 + (1 - e) * 0.5})` };
    case 'whip': return { transform: `translateX(${(1 - e) * 100}%)`, filter: p < 1 ? `blur(${(1 - e) * 18}px)` : undefined };
    case 'filmBurn': return {
      opacity: Math.min(1, e * 1.6),
      filter: p < 1 ? `brightness(${1 + (1 - e) * 2.2}) sepia(${(1 - e) * 0.8}) saturate(${1 + (1 - e)})` : undefined,
    };
    case 'glitch': {
      if (p >= 1) return {};
      const r = random(`g${frame}`);
      return {
        transform: `translateX(${(r - 0.5) * 60}px) skewX(${(r - 0.5) * 8}deg)`,
        filter: `hue-rotate(${r * 90}deg) saturate(1.6)`,
        clipPath: r > 0.6 ? `inset(${r * 30}% 0 ${(1 - r) * 20}% 0)` : undefined,
        opacity: r > 0.85 ? 0.5 : 1,
      };
    }
    default: return {};
  }
};