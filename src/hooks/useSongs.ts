import { useEffect, useState } from "react";
import { fetchSongs } from "../services/songs.service";
import type { SongDTO } from "../types/song";

export function useSongs() {
  const [songs, setSongs] = useState<SongDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { songs, loading, error };
}
