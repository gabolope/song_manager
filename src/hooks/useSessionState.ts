import { useEffect, useState } from "react";
import type { SongDTO } from "../types/song";
import useBook from "./useBook";
import { useLiveSong } from "./useLiveSong";

export function useSessionState() {
  const { data: book } = useBook();
  const { liveSong, setLiveSong } = useLiveSong();

  const [selectedBookSong, setSelectedBookSong] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [localSong, setLocalSong] = useState<SongDTO | null>(null);

  const isCurrentLive = (displayedSong?: SongDTO | null) =>
    displayedSong?.id === liveSong.data?.id;

  useEffect(() => {
    if (!liveSong.data) return;
    const index = book?.findIndex((s) => s.id === liveSong.data!.id) ?? -1;
    if (index !== -1) {
      setSelectedBookSong(index);
      setLocalSong(liveSong.data);
    }
  }, [liveSong.data, book]);

  const backToLive = () => {
    if (!liveSong.data || !book) return;
    const index = book.findIndex((s) => s.id === liveSong.data!.id);
    if (index !== -1) {
      setSelectedBookSong(index);
      setLocalSong(liveSong.data);
    }
  };

  const nextSong =
    selectedBookSong !== null ? book?.[selectedBookSong + 1] : undefined;

  return {
    book,
    liveSong,
    setLiveSong,
    selectedBookSong,
    setSelectedBookSong,
    isLive,
    setIsLive,
    localSong,
    setLocalSong,
    isCurrentLive,
    backToLive,
    nextSong,
  };
}
