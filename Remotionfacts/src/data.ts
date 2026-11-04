import { staticFile } from 'remotion';
import { THEME_NAMES } from './theme';

export type Word = { word: string; start: number; end: number };
export type Config = Record<string, any>;

export const TRANSITIONS = ['fade', 'zoom', 'whip', 'slide', 'slideUp', 'wipe', 'circle', 'spin', 'flash', 'glitch', 'filmBurn', 'crossBlur'];
export const EFFECTS = ['colorGrade', 'grain', 'slowZoom', 'dust'];
export const FX_TYPES = [
  'lightLeak', 'bokeh', 'blurIn', 'letterbox', 'glowPulse', 'rgbSplit',
  'shake', 'zoomPunch', 'flash', 'shockwave', 'speedLines', 'sparks', 'vhs',
];

// Durasi default (detik) kalau fx tidak punya field "end"
const FX_DURATION: Record<string, number> = {
  blurIn: 0.6, rgbSplit: 0.4, shake: 0.5, zoomPunch: 0.35, flash: 0.25, shockwave: 0.8, speedLines: 1, sparks: 1.2,
};
export const fxEnd = (f: any): number => f.end ?? f.start + (FX_DURATION[f.type] ?? 1.5);

export const hasEffect = (config: Config, name: string) =>
  Array.isArray(config.effects) && config.effects.includes(name);

// "sfx/whoosh.mp3" -> public/sfx/whoosh.mp3 (dipakai bareng). Selain itu -> public/[video]/file
export const resolveAsset = (video: string, file: string) =>
  file.startsWith('sfx/') ? file : `${video}/${file}`;

const getJson = async (video: string, name: string) => {
  const res = await fetch(staticFile(`${video}/${name}`));
  if (!res.ok) throw new Error(`File tidak ketemu: public/${video}/${name}`);
  try {
    return await res.json();
  } catch {
    throw new Error(`public/${video}/${name} bukan JSON valid (cek koma dan tanda kutip)`);
  }
};

const exists = async (path: string) => {
  try {
    const r = await fetch(staticFile(path), { method: 'HEAD' });
    return r.status !== 404;
  } catch {
    return true;
  }
};

const normalizeWords = (raw: any, video: string): Word[] => {
  const arr = Array.isArray(raw) ? raw : raw?.words;
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`public/${video}/words.json harus berupa array kata, tiap item punya word/text, start, end (detik)`);
  }
  return arr
    .map((w: any, i: number) => {
      const word = String(w.word ?? w.text ?? w.w ?? '');
      const start = Number(w.start ?? w.s);
      const end = Number(w.end ?? w.e);
      if (!word || isNaN(start) || isNaN(end)) {
        throw new Error(`words.json item ke-${i + 1}: butuh word/text, start, end. Ketemu: ${JSON.stringify(w)}`);
      }
      return { word: word.trim(), start, end };
    })
    .sort((a: Word, b: Word) => a.start - b.start);
};

// words.json OPSIONAL (subtitle sudah dihapus). Kalau tidak ada, config.json wajib punya "duration" (detik).
const getWords = async (video: string): Promise<Word[]> => {
  const res = await fetch(staticFile(`${video}/words.json`));
  if (!res.ok) return [];
  let raw: any;
  try {
    raw = await res.json();
  } catch {
    throw new Error(`public/${video}/words.json bukan JSON valid (cek koma dan tanda kutip)`);
  }
  return normalizeWords(raw, video);
};

export const loadVideoData = async (video: string) => {
  const config: Config = await getJson(video, 'config.json');
  const words = await getWords(video);
  const problems: string[] = [];
  if (words.length === 0 && typeof config.duration !== 'number') {
    problems.push('tidak ada words.json, jadi field duration (detik, angka) wajib di config.json');
  }

  if (config.theme && !THEME_NAMES.includes(config.theme)) problems.push(`theme "${config.theme}" tidak dikenal (${THEME_NAMES.join(' | ')})`);
  if (!config.voiceover) problems.push('field voiceover wajib');
  if (!Array.isArray(config.scenes) || config.scenes.length === 0) problems.push('scenes kosong, minimal 1 scene');

  (config.effects ?? []).forEach((e: string) => {
    if (!EFFECTS.includes(e)) problems.push(`effects "${e}" tidak dikenal (${EFFECTS.join(', ')})`);
  });
  (config.fx ?? []).forEach((f: any, i: number) => {
    if (!FX_TYPES.includes(f.type)) problems.push(`fx[${i}]: type "${f.type}" tidak dikenal (${FX_TYPES.join(', ')})`);
    if (typeof f.start !== 'number') problems.push(`fx[${i}]: field start (detik) wajib`);
  });

  const files = new Set<string>();
  const add = (f?: string) => f && files.add(f);
  add(config.voiceover);
  add(config.bgm);
  add(config.logo?.file);
  add(config.sfxOnTransition);
  (config.sfx ?? []).forEach((s: any) => add(s.file));
  (config.overlays ?? []).forEach((o: any) => add(o.file));
  const parLayers = (p: any) => (p?.layers ?? []).forEach((l: any) => l.type !== 'text' && add(l.file));
  parLayers(config.parallax);

  (config.scenes ?? []).forEach((s: any, i: number) => {
    if (typeof s.start !== 'number') problems.push(`scenes[${i}]: field start (detik) wajib`);
    if (s.transition && !TRANSITIONS.includes(s.transition)) problems.push(`scenes[${i}]: transition "${s.transition}" tidak dikenal (${TRANSITIONS.join(', ')})`);
    if (s.animation === 'parallax') {
      if (!s.parallax && !config.parallax) problems.push(`scenes[${i}]: animation parallax tapi tidak ada parallax.layers`);
      parLayers(s.parallax);
    } else if (!s.file) problems.push(`scenes[${i}]: field file wajib`);
    else add(s.file);
  });

  for (const f of files) {
    if (!(await exists(resolveAsset(video, f)))) problems.push(`File tidak ketemu: public/${resolveAsset(video, f)}`);
  }
  if (problems.length) throw new Error(`Config "${video}" bermasalah:\n- ${problems.join('\n- ')}`);
  return { config, words };
};