import { fetchSongs } from "../services/songs.service";
import type { SongDTO } from "../types/song";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { DEMO_SONGS } from "../data/demoSongs";

const useSongs = (enabled = true) => {
  const { isDemo, teamId } = useAuth();

  return useQuery<SongDTO[], Error>({
    // En demo teamId es null: la key ["songs", null] no choca con ninguna real.
    queryKey: ["songs", teamId],
    queryFn: () => (isDemo ? Promise.resolve(DEMO_SONGS) : fetchSongs(teamId)),
    // Un usuario sin equipo no tiene repertorio que pedir.
    enabled: enabled && (isDemo || !!teamId),
    staleTime: isDemo ? Infinity : 10 * 1000, //10 segundos para que songList sea stale
  });
};

export default useSongs;
