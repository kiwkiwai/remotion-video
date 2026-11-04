import { loadFont as poppins } from '@remotion/google-fonts/Poppins';
import { loadFont as inter } from '@remotion/google-fonts/Inter';
import { loadFont as montserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as bebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as anton } from '@remotion/google-fonts/Anton';
import { loadFont as oswald } from '@remotion/google-fonts/Oswald';
import { loadFont as playfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as spaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';

const loaders: Record<string, () => { fontFamily: string }> = {
  Poppins: poppins, Inter: inter, Montserrat: montserrat,
  BebasNeue: bebas, Anton: anton, Oswald: oswald,
  PlayfairDisplay: playfair, SpaceGrotesk: spaceGrotesk,
};

export const loadFontByName = (name?: string) => {
  const l = (name && loaders[name]) || loaders.Poppins;
  return l().fontFamily;
};
