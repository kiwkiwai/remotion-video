import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Timed, Pos } from './Timed';
import { resolveAsset } from '../data';

const TypeText: React.FC<{ text: string; animation?: string; color: string }> = ({ text, animation, color }) => {
  const frame = useCurrentFrame();
  if (animation === 'typewriter') return <>{text.slice(0, Math.floor(frame / 1.5))}</>;
  if (animation === 'highlight') {
    const p = Math.min(1, frame / 14);
    return (
      <span style={{
        backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat',
        backgroundSize: `${p * 100}% 70%`, backgroundPosition: '0 80%', padding: '0 10px',
      }}>{text}</span>
    );
  }
  return <>{text}</>;
};

// Angka hitung naik: countTo (wajib), countFrom, countDuration (detik), prefix, suffix, separator
const CountText: React.FC<{ e: any }> = ({ e }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = e.countFrom ?? 0;
  const p = Math.min(1, frame / Math.max(1, fps * (e.countDuration ?? 1.5)));
  const eased = 1 - Math.pow(1 - p, 3);
  const v = Math.round(from + (e.countTo - from) * eased);
  const sep = e.separator ?? '';
  const digits = String(Math.abs(v));
  const body = sep ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : digits;
  return <>{e.prefix ?? ''}{v < 0 ? '-' : ''}{body}{e.suffix ?? ''}</>;
};

export const Hook: React.FC<{ config: any; theme: any }> = ({ config, theme }) => {
  const h = config.hook;
  if (!h?.text) return null;
  const { text, start, end, ...pos } = h;
  const hookBg = theme.hookBg === 'highlight' ? theme.highlight : theme.hookBg === undefined ? theme.highlight : theme.hookBg;
  return (
    <Timed start={start ?? 0} end={end ?? 3} pos={pos} def={{ y: 18, animation: theme.textAnimation }}>
      <div style={{
        fontSize: pos.size ?? 90, fontWeight: 900, lineHeight: 1.1, color: theme.hookColor ?? '#16161A',
        background: hookBg, padding: hookBg ? '12px 28px' : undefined,
        textShadow: hookBg ? 'none' : '0 6px 0 rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)',
      }}>
        <TypeText text={text} animation={pos.animation} color={theme.highlight} />
      </div>
    </Timed>
  );
};

const Label: React.FC<{ e: any; theme: any }> = ({ e, theme }) => {
  const line = e.line ?? {};
  const lc = line.color ?? e.color ?? theme.accent;
  const th = line.thickness ?? 4;
  const len = line.length ?? 100;
  const pos = line.position ?? 'top';
  const end = line.end ?? 'none';
  const side = pos === 'right' ? 'right' : 'left';
  const marker = end === 'dot' ? (
    <div style={{ position: 'absolute', top: '50%', [side]: -th * 1.5, width: th * 3, height: th * 3, borderRadius: '50%', background: lc, transform: 'translateY(-50%)' }} />
  ) : end === 'arrow' ? (
    <div style={{
      position: 'absolute', top: '50%', [side]: -th * 3.5, transform: 'translateY(-50%)', width: 0, height: 0,
      borderTop: `${th * 2}px solid transparent`, borderBottom: `${th * 2}px solid transparent`,
      [pos === 'right' ? 'borderLeft' : 'borderRight']: `${th * 4}px solid ${lc}`,
    } as React.CSSProperties} />
  ) : null;
  const lineEl = <div style={{ position: 'relative', width: len, height: th, background: lc, flexShrink: 0 }}>{marker}</div>;
  const textEl = (
    <div style={{ fontSize: e.size ?? 30, fontWeight: 700, color: e.color ?? theme.text }}>
      <TypeText text={e.text} animation={e.animation} color={theme.highlight} />
    </div>
  );
  const horiz = pos === 'left' || pos === 'right';
  const ai = e.align === 'left' ? 'flex-start' : e.align === 'right' ? 'flex-end' : 'center';
  return (
    <div style={{ display: 'flex', flexDirection: horiz ? 'row' : 'column', alignItems: horiz ? 'center' : ai, gap: 14 }}>
      {(pos === 'top' || pos === 'left') && lineEl}
      {textEl}
      {(pos === 'bottom' || pos === 'right') && lineEl}
    </div>
  );
};

export const ExtraTexts: React.FC<{ config: any; theme: any }> = ({ config, theme }) => (
  <>
    {(config.extraText ?? []).map((e: any, i: number) => {
      const pos: Pos = { ...e };
      const def: Pos = { animation: theme.textAnimation };
      let body: React.ReactNode;
      if (e.type === 'label') {
        body = <Label e={e} theme={theme} />;
        def.y = 12;
      } else if (e.type === 'bigNumber') {
        def.y = 45;
        body = (
          <div style={{ fontSize: e.size ?? 200, fontWeight: 900, lineHeight: 1, color: e.color ?? theme.accent }}>
            {typeof e.countTo === 'number'
              ? <CountText e={e} />
              : <TypeText text={e.text} animation={e.animation} color={theme.highlight} />}
          </div>
        );
      } else if (e.type === 'title') {
        def.y = 30;
        body = (
          <div style={{ fontSize: e.size ?? 110, fontWeight: 900, lineHeight: 1.05, color: e.color ?? theme.text }}>
            <TypeText text={e.text} animation={e.animation} color={theme.highlight} />
          </div>
        );
      } else {
        def.y = 82;
        body = (
          <div style={{
            fontSize: e.size ?? 44, fontWeight: 700, padding: '14px 28px', borderLeft: `10px solid ${theme.accent}`,
            background: theme.captionBg ?? '#fff', color: e.color ?? theme.text,
          }}>
            <TypeText text={e.text} animation={e.animation} color={theme.highlight} />
          </div>
        );
      }
      return <Timed key={i} start={e.start} end={e.end} pos={pos} def={def}>{body}</Timed>;
    })}
  </>
);

// Gambar overlay diberi tepi tebal ala cutout editorial (warna tepi dari tema)
const cutout = (c: string) =>
  `drop-shadow(6px 0 0 ${c}) drop-shadow(-6px 0 0 ${c}) drop-shadow(0 6px 0 ${c}) drop-shadow(0 -6px 0 ${c}) drop-shadow(0 14px 16px rgba(0,0,0,0.25))`;

export const Overlays: React.FC<{ video: string; config: any; theme: any }> = ({ video, config, theme }) => (
  <>
    {(config.overlays ?? []).map((o: any, i: number) => (
      <Timed key={i} start={o.start} end={o.end} pos={o} def={{ width: 40, animation: 'pop' }}>
        <Img src={staticFile(resolveAsset(video, o.file))} style={{ width: '100%', filter: cutout(theme.cutout ?? '#fff') }} />
      </Timed>
    ))}
  </>
);