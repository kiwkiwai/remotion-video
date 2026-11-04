import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Word, Config, hasEffect } from './data';
import { getTheme, withThemeDefaults } from './theme';
import { loadFontByName } from './fonts';
import { Scenes } from './components/Scenes';
import { PaperBg, Vignette, Grain, Dust, ColorGrade, Fx, RgbSplit, CameraFx } from './components/Effects';
import { Overlays, ExtraTexts, Hook } from './components/Extras';
import { Subtitle } from './components/Subtitle';
import { Outro, Logo, ProgressBar } from './components/Outro';
import { AudioMix } from './components/AudioMix';

export type VideoProps = { video: string; words: Word[]; config: Config };

export const MyVideo: React.FC<VideoProps> = ({ video, words, config: rawConfig }) => {
  const theme = getTheme(rawConfig);
  const config = withThemeDefaults(rawConfig, theme);
  const fontFamily = loadFontByName(theme.font);

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily, color: theme.text }}>
      <PaperBg theme={theme} />
      <CameraFx config={config}>
        <RgbSplit config={config}>
          <Scenes video={video} config={config} theme={theme} />
        </RgbSplit>
      </CameraFx>
      {hasEffect(config, 'colorGrade') && <ColorGrade name={config.grade} intensity={config.gradeIntensity} />}
      {hasEffect(config, 'dust') && <Dust />}
      {hasEffect(config, 'vignette') && <Vignette theme={theme} />}
      {hasEffect(config, 'grain') && <Grain amount={config.grainAmount} blend={theme.paper === false ? 'overlay' : 'multiply'} />}
      <Fx config={config} theme={theme} />
      <Overlays video={video} config={config} theme={theme} />
      <ExtraTexts config={config} theme={theme} />
      <Hook config={config} theme={theme} />
      <Subtitle words={words} config={config} theme={theme} />
      <Logo video={video} config={config} />
      <Outro config={config} theme={theme} />
      <ProgressBar config={config} theme={theme} />
      <AudioMix video={video} config={config} words={words} />
    </AbsoluteFill>
  );
};