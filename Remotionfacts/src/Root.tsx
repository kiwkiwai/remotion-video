import React from 'react';
import { Composition } from 'remotion';
import { MyVideo, VideoProps } from './MyVideo';
import { loadVideoData } from './data';

// Tiap bab = 1 composition = 1 folder di public/ (bab1, bab2, ...).
// Render per bab: composition "bab1", "bab2", dst. Kalau babnya lebih dari 15, naikin angka CHAPTERS.
const CHAPTERS = 15;
const VIDEOS = Array.from({ length: CHAPTERS }, (_, i) => `bab${i + 1}`);
const FPS = 30;

export const Root: React.FC = () => (
  <>
    {VIDEOS.map((id) => (
      <Composition
        key={id}
        id={id}
        component={MyVideo}
        width={1920}
        height={1080}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={{ video: id, words: [], config: {} } as VideoProps}
        calculateMetadata={async ({ props }) => {
          const { words, config } = await loadVideoData(props.video);
          // config.duration (detik) = durasi total persis. Kalau tidak ada: akhir kata terakhir + tail.
          const total =
            typeof config.duration === 'number'
              ? config.duration
              : words[words.length - 1].end + (config.tail ?? 1);
          return {
            durationInFrames: Math.ceil(total * FPS),
            props: { ...props, words, config },
          };
        }}
      />
    ))}
  </>
);
