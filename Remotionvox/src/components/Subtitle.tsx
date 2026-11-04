import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Word } from '../data';

type Chunk = { words: Word[]; start: number; end: number };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

const makeChunks = (words: Word[], max = 4): Chunk[] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const gap = next ? next.start - w.end : 99;
    const punct = /[.!?,;:]$/.test(w.word);
    if (cur.length >= max || gap > 0.5 || (punct && cur.length >= 2)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out.map((ws) => ({ words: ws, start: ws[0].start, end: ws[ws.length - 1].end }));
};

export const Subtitle: React.FC<{ words: Word[]; config: any; theme: any }> = ({ words, config, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const style0 = config.subtitle?.style ?? 'pop';
  const perChunk = style0 === 'kinetic' ? (config.subtitle?.perChunk ?? 1) : 4;
  const chunks = React.useMemo(() => makeChunks(words, perChunk), [words, perChunk]);

  const hl: Record<string, string> = {};
  (config.highlight ?? []).forEach((h: any) => {
    const word = typeof h === 'string' ? h : h.word;
    const type = typeof h === 'string' ? 'stabilo' : (h.type ?? 'stabilo');
    hl[norm(word)] = type;
  });

  const idx = chunks.findIndex((c, i) => {
    const nxt = chunks[i + 1];
    const until = nxt ? Math.min(nxt.start - 0.05, c.end + 0.5) : c.end + 0.5;
    return t >= c.start - 0.05 && t < until;
  });
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const kinetic = style0 === 'kinetic';
  const karaoke = style0 === 'karaoke';
  const size = config.subtitle?.size ?? (kinetic ? 120 : theme.subtitleSize);
  const y = config.subtitle?.y ?? theme.subtitleY;
  const typing = style0 === 'typewriter';
  const box = style0 === 'box' || karaoke || !!config.subtitle?.boxed; // typewriter + boxed: true = digabung
  const light = !box && (kinetic || !!config.subtitle?.light); // teks putih + bayangan (khusus tanpa box)
  const plain = !light;

  const cardPop = spring({ frame: frame - Math.round(chunk.start * fps), fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 14 });

  const inner: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.28}px`,
    fontSize: size, fontWeight: 900, lineHeight: 1.25,
  };
  if (box) {
    Object.assign(inner, {
      background: config.subtitle?.boxColor ?? '#fff', padding: `${size * 0.22}px ${size * 0.42}px`, borderRadius: size * 0.3,
      border: `4px solid ${config.subtitle?.borderColor ?? theme.text}`, boxShadow: `8px 8px 0 ${config.subtitle?.borderColor ?? theme.text}`,
      transform: `scale(${0.92 + 0.08 * cardPop})`, opacity: Math.min(1, cardPop * 2),
    });
  }

  return (
    <div style={{
      position: 'absolute', left: '50%', top: `${y}%`, width: '88%', transform: 'translate(-50%, -50%)',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={inner}>
        {chunk.words.map((w, i) => {
          const shown = karaoke ? true : t >= w.start - 0.02;
          const pop = spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 12, stiffness: 200 }, durationInFrames: 12 });
          const type = hl[norm(w.word)];
          const clean = w.word.replace(/[.,;:]/g, '');
          const s: React.CSSProperties = {
            opacity: shown ? 1 : 0, display: 'inline-block', color: config.subtitle?.textColor ?? (light ? '#fff' : theme.text),
          };
          let text: React.ReactNode = clean;

          if (typing) {
            // huruf muncul satu-satu selama durasi kata; sisa huruf disembunyikan supaya layout stabil
            const dur = Math.max(0.15, (w.end - w.start) * 0.85);
            const n = Math.min(clean.length, Math.max(0, Math.ceil(((t - w.start) / dur) * clean.length)));
            text = (
              <>
                {clean.slice(0, n)}
                <span style={{ opacity: 0 }}>{clean.slice(n)}</span>
              </>
            );
          } else {
            if (kinetic) { s.transform = `scale(${0.4 + 0.6 * pop}) rotate(${(1 - pop) * -5}deg)`; s.textTransform = 'uppercase'; }
            else if (karaoke) { s.transform = 'scale(1)'; }
            else { s.transform = `scale(${0.7 + 0.3 * pop})`; }
          }

          if (!plain) s.textShadow = '0 4px 0 rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.8)';
          if (type === 'glow') {
            s.color = theme.highlight;
            s.textShadow = `0 4px 0 rgba(0,0,0,0.9), 0 0 28px ${theme.highlight}`;
          }
          if (type === 'stabilo') {
            s.backgroundImage = `linear-gradient(${theme.highlight}, ${theme.highlight})`;
            s.backgroundRepeat = 'no-repeat';
            s.backgroundSize = `${(typing ? 1 : pop) * 100}% 70%`;
            s.backgroundPosition = '0 80%';
            s.padding = '0 10px';
            if (!plain) s.color = '#111';
            s.textShadow = 'none';
          }
          if (type === 'garis bawah') {
            s.borderBottom = `10px solid ${theme.accent}`;
            s.textShadow = plain ? 'none' : s.textShadow;
          }
          if (type === 'lingkaran') {
            s.border = `6px solid ${theme.accent}`;
            s.borderRadius = 999;
            s.padding = '0 24px';
            s.textShadow = plain ? 'none' : s.textShadow;
          }
          if (karaoke && !type) {
            const nx = chunk.words[i + 1];
            const active = t >= w.start - 0.02 && t < (nx ? nx.start - 0.02 : w.end + 0.3);
            s.padding = '0 14px'; s.borderRadius = 12;
            if (active) s.backgroundColor = theme.highlight;
          }
          return <span key={i} style={s}>{text}</span>;
        })}
      </div>
    </div>
  );
};