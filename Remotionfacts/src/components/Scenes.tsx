import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { resolveAsset, hasEffect } from '../data';
import { transitionStyle } from '../anim';
import { ParallaxView } from './Parallax';

const isVideo = (f: string) => /\.(mp4|mov|webm|mkv)$/i.test(f);

const SceneBody: React.FC<{ s: any; idx: number; T: number; video: string; config: any; theme: any }> = ({ s, idx, T, video, config, theme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const tr = idx === 0 ? null : (s.transition ?? theme.transition);
  const style = transitionStyle(tr, frame, T);

  // slowZoom: nambah zoom pelan buat video & parallax (gambar statis sudah punya zoom sendiri)
  const zoomOn = hasEffect(config, 'slowZoom') && (s.animation === 'parallax' || isVideo(s.file));
  const zoom = zoomOn ? 1 + 0.08 * (frame / Math.max(1, durationInFrames)) : 1;

  let content: React.ReactNode;

  if (s.animation === 'parallax') {
    content = <ParallaxView video={video} cfg={s.parallax ?? config.parallax} theme={theme} />;
  } else if (isVideo(s.file)) {
    content = (
      <OffthreadVideo
        src={staticFile(resolveAsset(video, s.file))}
        muted
        startFrom={Math.round((s.trimStart ?? 0) * fps)}
        style={{ width: '100%', height: '100%', objectFit: s.fit ?? 'cover' }}
      />
    );
  } else {
    const p = frame / Math.max(1, durationInFrames);
    const dir = idx % 2 ? -1 : 1;
    content = (
      <Img
        src={staticFile(resolveAsset(video, s.file))}
        style={{
          width: '100%', height: '100%', objectFit: s.fit ?? 'cover',
          transform: `scale(${1.04 + 0.1 * p}) translateX(${dir * (p - 0.5) * 60}px)`,
        }}
      />
    );
  }
  return (
    <AbsoluteFill style={style}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{content}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Scenes: React.FC<{ video: string; config: any; theme: any }> = ({ video, config, theme }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const scenes = [...(config.scenes ?? [])].sort((a: any, b: any) => a.start - b.start);
  const T = config.transitionFrames ?? 10;
  return (
    <AbsoluteFill style={{ filter: theme.sceneFilter }}>
      {scenes.map((s: any, i: number) => {
        const from = Math.round(s.start * fps);
        const last = i === scenes.length - 1;
        const end = last ? durationInFrames : Math.round(scenes[i + 1].start * fps) + T;
        const dur = Math.max(1, Math.min(durationInFrames - from, end - from));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneBody s={s} idx={i} T={T} video={video} config={config} theme={theme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};