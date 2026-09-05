import { useCallback, useEffect, useState } from "react";
import type { SongDTO } from "../types/song";
import useBook from "./useBook";
import { useLiveSong } from "./useLiveSong";

export function useSessionState() {
  const { data: book } = useBook();
  const { liveSong, setLiveSong, clearLiveSong } = useLiveSong();

  // Se guarda el id de la canción seleccionada (no su índice) para que la
  // selección no se desincronice cuando el book cambia: si se borra una
  // canción anterior a la seleccionada, el índice ya no apuntaría a la misma
  // canción.
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [localSongState, setLocalSongState] = useState<SongDTO | null>(null);
  // Mientras es true, la vista sigue automáticamente a la canción en vivo.
  // Se apaga apenas el usuario navega manualmente (mirar adelante/atrás) y
  // se reactiva al presionar "Volver al Vivo", para no pisarle la navegación.
  const [followingLive, setFollowingLive] = useState(true);

  const rawIndex =
    selectedSongId !== null
      ? (book?.findIndex((s) => s.id === selectedSongId) ?? -1)
      : -1;
  // -1 significa que la canción seleccionada ya no está en el book (se borró).
  const selectedBookSong = rawIndex !== -1 ? rawIndex : null;

  const setSelectedBookSong = useCallback(
    (index: number | null) => {
      setSelectedSongId(index !== null ? (book?.[index]?.id ?? null) : null);
    },
    [book],
  );

  const isCurrentLive = (displayedSong?: SongDTO | null) =>
    displayedSong?.id === liveSong.data?.id;

  useEffect(() => {
    if (!followingLive || !liveSong.data) return;
    const index = book?.findIndex((s) => s.id === liveSong.data!.id) ?? -1;
    if (index !== -1) {
      setSelectedSongId(liveSong.data.id);
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
      setSelectedSongId(liveSong.data.id);
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
