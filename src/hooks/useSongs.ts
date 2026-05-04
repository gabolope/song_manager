import { fetchSongs } from "../services/songs.service";
import type { SongDTO } from "../types/song";
import { useQuery } from "@tanstack/react-query";

const useSongs = () => {
  return useQuery<SongDTO[], Error>({
    queryKey: ["songs"],
    queryFn: fetchSongs,
    staleTime: 10 * 1000, //10 segundos para que songList sea stale
  });
};

export default useSongs;
