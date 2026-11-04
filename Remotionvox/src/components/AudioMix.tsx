import React from 'react';
import { Audio, Sequence, interpolate, staticFile, useVideoConfig } from 'remotion';
import { Word, resolveAsset } from '../data';

const duckFactor = (t: number, words: Word[], level: number) => {
  let dist = Infinity;
  for (const w of words) {
    const a = w.start - 0.15;
    const b = w.end + 0.4;
    if (t >= a && t <= b) return level;
    dist = Math.min(dist, t < a ? a - t : t - b);
  }
  return level + (1 - level) * Math.min(1, dist / 0.6);
};

export const AudioMix: React.FC<{ video: string; config: any; words: Word[] }> = ({ video, config, words }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const a = config.audio ?? {};
  const src = (f: string) => staticFile(resolveAsset(video, f));
  const duckLevel = a.duck === false ? 1 : typeof a.duck === 'number' ? a.duck : 0.3;
  const bgmBase = a.bgmVolume ?? 0.35;
  const scenes = [...(config.scenes ?? [])].sort((x: any, y: any) => x.start - y.start);

  return (
    <>
      {config.voiceover && <Audio src={src(config.voiceover)} volume={a.voiceVolume ?? 1} />}
      {config.bgm && (
        <Audio
          src={src(config.bgm)}
          loop
          volume={(f) => {
            const fadeIn = interpolate(f, [0, (a.fadeIn ?? 1) * fps], [0, 1], { extrapolateRight: 'clamp' });
            const fadeOut = interpolate(f, [durationInFrames - (a.fadeOut ?? 2) * fps, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return bgmBase * fadeIn * fadeOut * duckFactor(f / fps, words, duckLevel);
          }}
        />
      )}
      {(config.sfx ?? []).map((s: any, i: number) => (
        <Sequence key={`s${i}`} from={Math.round(s.start * fps)}>
          <Audio src={src(s.file)} volume={s.volume ?? 0.7} />
        </Sequence>
      ))}
      {config.sfxOnTransition &&
        scenes.slice(1).map((s: any, i: number) => (
          <Sequence key={`t${i}`} from={Math.round(s.start * fps)}>
            <Audio src={src(config.sfxOnTransition)} volume={config.sfxOnTransitionVolume ?? 0.5} />
          </Sequence>
        ))}
    </>
  );
};
