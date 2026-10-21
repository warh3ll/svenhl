import { useI18n } from '@/i18n';
import { usePlayerIndex } from './useNHLData';

/** Link target for a player page in the current language: playerPath('8480012') -> '/player/elias-pettersson-1998' */
export const usePlayerPath = () => {
  const { path } = useI18n();
  const { data: index } = usePlayerIndex();
  // Until the index has loaded (or for a player missing from it) the NHL ID works too: the page redirects
  return (playerId: string) => path(`/player/${index?.slugById.get(playerId) ?? playerId}`);
};
