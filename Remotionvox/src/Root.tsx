import React from 'react';
import { Composition } from 'remotion';
import { MyVideo, VideoProps } from './MyVideo';
import { loadVideoData } from './data';

// Daftarin video baru di sini. Nama = nama folder di public/
const VIDEOS = ['vox'];
const FPS = 30;

export const Root: React.FC = () => (
  <>
    {VIDEOS.map((id) => (
      <Composition
        key={id}
        id={id}
        component={MyVideo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={{ video: id, words: [], config: {} } as VideoProps}
        calculateMetadata={async ({ props }) => {
          const { words, config } = await loadVideoData(props.video);
          const last = words[words.length - 1];
          const tail = config.tail ?? 1;
          return {
            durationInFrames: Math.ceil((last.end + tail) * FPS),
            props: { ...props, words, config },
          };
        }}
      />
    ))}
  </>
);