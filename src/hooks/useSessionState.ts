import { useCallback, useEffect, useState } from "react";
import type { SongDTO } from "../types/song";
import useBook from "./useBook";
import { useLiveSong } from "./useLiveSong";

export function useSessionState() {
  const { data: book } = useBook();
  const { liveSong, setLiveSong, clearLiveSong } = useLiveSong();

  const [selectedBookSong, setSelectedBookSong] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [localSongState, setLocalSongState] = useState<SongDTO | null>(null);
  // Mientras es true, la vista sigue automáticamente a la canción en vivo.
  // Se apaga apenas el usuario navega manualmente (mirar adelante/atrás) y
  // se reactiva al presionar "Volver al Vivo", para no pisarle la navegación.
  const [followingLive, setFollowingLive] = useState(true);

  const isCurrentLive = (displayedSong?: SongDTO | null) =>
    displayedSong?.id === liveSong.data?.id;

  useEffect(() => {
    if (!followingLive || !liveSong.data) return;
    const index = book?.findIndex((s) => s.id === liveSong.data!.id) ?? -1;
    if (index !== -1) {
      setSelectedBookSong(index);
      setLocalSongState(liveSong.data);
    }
  }, [liveSong.data, book, followingLive]);

  const setLocalSong = useCallback((song: SongDTO | null) => {
    setFollowingLive(false);
    setLocalSongState(song);
  }, []);

  const backToLive = () => {
    setFollowingLive(true);
    if (!liveSong.data || !book) return;
    const index = book.findIndex((s) => s.id === liveSong.data!.id);
    if (index !== -1) {
      setSelectedBookSong(index);
      setLocalSongState(liveSong.data);
    }
  };

  const nextSong =
    selectedBookSong !== null ? book?.[selectedBookSong + 1] : undefined;

  return {
    book,
    liveSong,
    setLiveSong,
    clearLiveSong,
    selectedBookSong,
    setSelectedBookSong,
    isLive,
    setIsLive,
    localSong: localSongState,
    setLocalSong,
    isCurrentLive,
    backToLive,
    nextSong,
  };
}
