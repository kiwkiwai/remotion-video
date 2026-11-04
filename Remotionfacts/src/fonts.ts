import { loadFont as poppins } from '@remotion/google-fonts/Poppins';
import { loadFont as inter } from '@remotion/google-fonts/Inter';
import { loadFont as montserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as bebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as anton } from '@remotion/google-fonts/Anton';
import { loadFont as oswald } from '@remotion/google-fonts/Oswald';

const loaders: Record<string, () => { fontFamily: string }> = {
  Poppins: poppins, Inter: inter, Montserrat: montserrat,
  BebasNeue: bebas, Anton: anton, Oswald: oswald,
};

export const loadFontByName = (name?: string) => {
  const l = (name && loaders[name]) || loaders.Poppins;
  return l().fontFamily;
};
