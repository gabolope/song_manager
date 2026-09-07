import { fetchSongs } from "../services/songs.service";
import type { SongDTO } from "../types/song";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { DEMO_SONGS } from "../data/demoSongs";

const useSongs = () => {
  const { isDemo } = useAuth();

  return useQuery<SongDTO[], Error>({
    queryKey: ["songs", isDemo ? "demo" : "real"],
    queryFn: () => (isDemo ? Promise.resolve(DEMO_SONGS) : fetchSongs()),
    staleTime: isDemo ? Infinity : 10 * 1000, //10 segundos para que songList sea stale
  });
};

export default useSongs;
