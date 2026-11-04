// Preset tema per "vibe" game. Pilih lewat config.json -> "theme": "neon"
// effects/grade di sini = default; kalau config punya effects/grade sendiri, yang config yang menang.
export const THEMES: Record<string, any> = {
  cinematic: {
    bg: '#06060b', text: '#ffffff', primary: '#8A2BE2', accent: '#FFD400', highlight: '#FFD400',
    transition: 'fade', sceneFilter: 'contrast(1.12) saturate(1.05) brightness(0.9)',
    font: 'Poppins', subtitleY: 72, subtitleSize: 78, textAnimation: 'pop',
  },
  // Futuristik / shooter (Valorant, CS, Apex)
  neon: {
    bg: '#05010f', text: '#ffffff', primary: '#00E5FF', accent: '#FF2BD6', highlight: '#00E5FF',
    transition: 'glitch', sceneFilter: 'contrast(1.15) saturate(1.25) brightness(0.92)',
    font: 'Montserrat', subtitleY: 72, subtitleSize: 76, textAnimation: 'bounce',
    effects: ['colorGrade', 'grain', 'slowZoom'], grade: 'purple', gradeIntensity: 0.9,
  },
  // Action / battle royale (Free Fire, PUBG, Warzone)
  fire: {
    bg: '#0b0402', text: '#ffffff', primary: '#FF4D00', accent: '#FFB800', highlight: '#FFB800',
    transition: 'zoom', sceneFilter: 'contrast(1.2) saturate(1.15) brightness(0.9)',
    font: 'Anton', subtitleY: 72, subtitleSize: 92, textAnimation: 'drop',
    effects: ['colorGrade', 'grain', 'slowZoom', 'dust'], grade: 'fire', gradeIntensity: 1,
  },
  // RPG / fantasy / open world (Genshin lore, Elden Ring, Zelda)
  ice: {
    bg: '#030a14', text: '#f2fbff', primary: '#5CC8FF', accent: '#B8F0FF', highlight: '#8FE3FF',
    transition: 'crossBlur', sceneFilter: 'contrast(1.08) saturate(1.05) brightness(0.95)',
    font: 'Poppins', subtitleY: 72, subtitleSize: 76, textAnimation: 'blur',
    effects: ['colorGrade', 'slowZoom', 'dust'], grade: 'cold', gradeIntensity: 0.9,
  },
  // Gacha / premium (Honkai, Genshin banner, skin mahal)
  gold: {
    bg: '#0a0703', text: '#fff8e6', primary: '#FFC83D', accent: '#FFE08A', highlight: '#FFC83D',
    transition: 'filmBurn', sceneFilter: 'contrast(1.1) saturate(1.1) brightness(0.92)',
    font: 'Montserrat', subtitleY: 72, subtitleSize: 76, textAnimation: 'pop',
    effects: ['colorGrade', 'grain', 'slowZoom', 'dust'], grade: 'gold', gradeIntensity: 0.9,
  },
  // Latar putih / gambar stickman flat: teks gelap, tanpa vignette & partikel
  light: {
    bg: '#ffffff', text: '#111111', primary: '#2563EB', accent: '#E11D48', highlight: '#FDE047',
    transition: 'fade', sceneFilter: 'none',
    font: 'Poppins', subtitleY: 72, subtitleSize: 76, textAnimation: 'pop',
    effects: [], light: true, vignette: false, particles: false,
  },
  // Horror / survival (Dead by Daylight, Resident Evil, Phasmophobia)
  dark: {
    bg: '#020204', text: '#e8e8ee', primary: '#C21B2B', accent: '#FF4A4A', highlight: '#FF4A4A',
    transition: 'fade', sceneFilter: 'contrast(1.25) saturate(0.8) brightness(0.8)',
    font: 'Oswald', subtitleY: 72, subtitleSize: 84, textAnimation: 'fade',
    effects: ['colorGrade', 'grain', 'dust'], grade: 'green', gradeIntensity: 0.8, grainAmount: 0.2,
  },
};

export const THEME_NAMES = Object.keys(THEMES);

export const getTheme = (config: Record<string, any>) => {
  const name = THEMES[config.theme] ? config.theme : 'cinematic';
  const base = THEMES[name];
  return { ...base, ...(config.palette ?? {}), name, font: config.font ?? base.font };
};

// Isi effects/grade dari tema kalau config tidak mengaturnya
export const withThemeDefaults = (config: Record<string, any>, theme: Record<string, any>): Record<string, any> => ({
  ...config,
  effects: config.effects ?? theme.effects,
  grade: config.grade ?? theme.grade,
  gradeIntensity: config.gradeIntensity ?? theme.gradeIntensity,
  grainAmount: config.grainAmount ?? theme.grainAmount,
});
