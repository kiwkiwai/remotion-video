// Preset tema per topik konten. Pilih lewat config.json -> "theme": "misteri"
// Kolom effects/grade/gradeIntensity/grainAmount = default tema; kalau config punya sendiri, config yang menang.
// Kolom paper..cutout dipakai komponen supaya tema terang & gelap sama-sama tampil benar.
//   paper: titik kertas   blend: blend mode coretan/stamp (multiply = terang, screen = gelap)
//   vignette/vignetteBlend: warna & blend vignette   track: warna jalur bar chart
//   captionBg: latar caption   hookColor/hookBg: gaya hook ('highlight' = pakai warna highlight, null = tanpa latar)
//   cutout: warna tepi gambar overlay
export const THEMES: Record<string, any> = {
  // Kertas editorial (asli)
  vox: {
    bg: '#F5F0E6', text: '#16161A', primary: '#2B59FF', accent: '#FF5A36', highlight: '#FFD400',
    transition: 'slide', sceneFilter: 'none',
    font: 'Inter', subtitleY: 76, subtitleSize: 66, textAnimation: 'slideUp',
    paper: true, blend: 'multiply', vignette: 'rgba(40,25,10,0.55)', vignetteBlend: 'multiply',
    track: 'rgba(0,0,0,0.12)', captionBg: '#fff', hookColor: '#16161A', hookBg: 'highlight', cutout: '#fff',
  },
  // Sejarah: perkamen, serif, halaman dibalik
  sejarah: {
    bg: '#EAD9B8', text: '#2B1B0E', primary: '#7A4A21', accent: '#B3261E', highlight: '#E8B04A',
    transition: 'pageTurn', sceneFilter: 'none',
    font: 'PlayfairDisplay', subtitleY: 76, subtitleSize: 64, textAnimation: 'slideUp',
    paper: true, paperDot: 'rgba(90,55,20,0.10)', blend: 'multiply', vignette: 'rgba(60,35,10,0.6)', vignetteBlend: 'multiply',
    track: 'rgba(60,35,10,0.15)', captionBg: '#FFF6E0', hookColor: '#2B1B0E', hookBg: 'highlight', cutout: '#FFF6E0',
    effects: ['vintage', 'grain', 'vignette', 'slowZoom'], grainAmount: 0.14,
  },
  // Misteri: gelap, hijau redup, aksen merah
  misteri: {
    bg: '#07090B', text: '#E6ECE8', primary: '#2F6F5E', accent: '#D1342F', highlight: '#F2D14B',
    transition: 'crossBlur', sceneFilter: 'contrast(1.2) saturate(0.7) brightness(0.85)',
    font: 'Oswald', subtitleY: 74, subtitleSize: 72, textAnimation: 'blur',
    paper: false, blend: 'screen', vignette: 'rgba(0,0,0,0.85)', vignetteBlend: 'normal',
    track: 'rgba(255,255,255,0.15)', captionBg: 'rgba(0,0,0,0.72)', hookColor: '#fff', hookBg: null, cutout: '#E6ECE8',
    effects: ['colorGrade', 'grain', 'dust', 'vignette'], grade: 'green', gradeIntensity: 0.8, grainAmount: 0.2,
  },
  // Sains: kertas grafik, biru bersih
  sains: {
    bg: '#EEF4FA', text: '#0B1B2E', primary: '#0A6CFF', accent: '#00B8D9', highlight: '#BFE9FF',
    transition: 'slide', sceneFilter: 'none',
    font: 'SpaceGrotesk', subtitleY: 76, subtitleSize: 66, textAnimation: 'pop',
    paper: true, paperDot: 'rgba(10,60,120,0.09)', blend: 'multiply', vignette: 'rgba(10,40,80,0.35)', vignetteBlend: 'multiply',
    track: 'rgba(10,40,80,0.12)', captionBg: '#fff', hookColor: '#0B1B2E', hookBg: 'highlight', cutout: '#fff',
    effects: ['grain', 'vignette'], grainAmount: 0.06,
  },
  // Alam: krem hangat, hijau hutan
  alam: {
    bg: '#F1EBDD', text: '#1E2A1B', primary: '#2E7D4F', accent: '#E07A1F', highlight: '#F4D35E',
    transition: 'crossBlur', sceneFilter: 'none',
    font: 'Montserrat', subtitleY: 76, subtitleSize: 64, textAnimation: 'slideUp',
    paper: true, paperDot: 'rgba(30,60,30,0.07)', blend: 'multiply', vignette: 'rgba(20,40,20,0.45)', vignetteBlend: 'multiply',
    track: 'rgba(30,50,30,0.12)', captionBg: '#fff', hookColor: '#1E2A1B', hookBg: 'highlight', cutout: '#fff',
    effects: ['colorGrade', 'slowZoom', 'grain', 'dust'], grade: 'forest', gradeIntensity: 0.6, grainAmount: 0.08,
  },
};

export const THEME_NAMES = Object.keys(THEMES);

// Lapisan warna untuk efek "colorGrade" (config.grade)
export const GRADES: Record<string, { top: string; bottom: string }> = {
  purple: { top: 'rgba(255,150,80,0.30)', bottom: 'rgba(90,40,160,0.70)' },
  teal: { top: 'rgba(255,140,60,0.35)', bottom: 'rgba(0,110,130,0.70)' },
  cold: { top: 'rgba(120,200,255,0.25)', bottom: 'rgba(30,70,150,0.70)' },
  warm: { top: 'rgba(255,200,120,0.30)', bottom: 'rgba(160,80,20,0.55)' },
  green: { top: 'rgba(120,200,160,0.20)', bottom: 'rgba(10,60,40,0.75)' },
  forest: { top: 'rgba(255,230,150,0.30)', bottom: 'rgba(20,90,50,0.60)' },
  sepia: { top: 'rgba(255,210,150,0.30)', bottom: 'rgba(110,60,20,0.60)' },
};
export const GRADE_NAMES = Object.keys(GRADES);

export const getTheme = (config: Record<string, any>) => {
  const name = THEMES[config.theme] ? config.theme : 'vox';
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
