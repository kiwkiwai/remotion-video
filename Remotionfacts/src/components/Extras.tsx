import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { Timed, Pos } from './Timed';
import { resolveAsset } from '../data';

// Tema terang (latar putih): teks gelap tanpa bayangan tebal
const shadowBig = (theme: any) => (theme.light ? 'none' : '0 6px 0 rgba(0,0,0,0.85)');

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

export const Hook: React.FC<{ config: any; theme: any }> = ({ config, theme }) => {
  const h = config.hook;
  if (!h?.text) return null;
  const { text, start, end, ...pos } = h;
  return (
    <Timed start={start ?? 0} end={end ?? 3} pos={pos} def={{ y: 18, animation: theme.textAnimation }}>
      <div style={{
        fontSize: pos.size ?? 72, fontWeight: 900, lineHeight: 1.1, color: theme.light ? theme.text : '#fff',
        textShadow: theme.light ? 'none' : '0 6px 0 rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)',
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
    <div style={{ fontSize: e.size ?? 34, fontWeight: 700, color: e.color ?? theme.text, textShadow: theme.light ? 'none' : '0 2px 8px rgba(0,0,0,0.8)' }}>
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

export const ExtraTexts: React.FC<{ config: any; theme: any }> = ({ config, theme }) => {
  return (
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
            <div style={{ fontSize: e.size ?? 170, fontWeight: 900, lineHeight: 1, color: e.color ?? theme.accent, textShadow: theme.light ? 'none' : '0 8px 0 rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.7)' }}>
              <TypeText text={e.text} animation={e.animation} color={theme.highlight} />
            </div>
          );
        } else if (e.type === 'title') {
          def.y = 30;
          body = (
            <div style={{ fontSize: e.size ?? 92, fontWeight: 900, lineHeight: 1.05, color: e.color ?? theme.text, textShadow: shadowBig(theme) }}>
              <TypeText text={e.text} animation={e.animation} color={theme.highlight} />
            </div>
          );
        } else {
          def.y = 84;
          body = (
            <div style={{
              fontSize: e.size ?? 40, fontWeight: 700, padding: '14px 28px', borderLeft: `10px solid ${theme.accent}`,
              background: theme.light ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)', color: e.color ?? theme.text,
              boxShadow: theme.light ? '0 4px 18px rgba(0,0,0,0.15)' : undefined,
            }}>
              <TypeText text={e.text} animation={e.animation} color={theme.highlight} />
            </div>
          );
        }
        return <Timed key={i} start={e.start} end={e.end} pos={pos} def={def}>{body}</Timed>;
      })}
    </>
  );
};

export const Overlays: React.FC<{ video: string; config: any; theme: any }> = ({ video, config, theme }) => {
  const filter = `drop-shadow(0 0 24px ${theme.primary})`;
  return (
    <>
      {(config.overlays ?? []).map((o: any, i: number) => (
        <Timed key={i} start={o.start} end={o.end} pos={o} def={{ width: 40, animation: 'pop' }}>
          <Img src={staticFile(resolveAsset(video, o.file))} style={{ width: '100%', filter }} />
        </Timed>
      ))}
    </>
  );
};
