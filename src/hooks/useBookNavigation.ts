import { useLiveSong } from "./useLiveSong";
import type { SongDTO } from "../types/song";
import { useEffect } from "react";

export function useBookNavigation(
  book?: SongDTO[],
  isDirector?: boolean,
  currentSong?: SongDTO | null,
  onNavigate?: (index: number) => void,
) {
  const { setLiveSong } = useLiveSong();

  const navigate = (id: string, direction: 1 | -1) => {
    if (!book) return;
    const currentIndex = book.findIndex((song) => song.id === id);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= book.length) return;

    onNavigate?.(nextIndex);
    if (isDirector) setLiveSong.mutate(book[nextIndex]);
  };

  const onLeft = (id: string) => navigate(id, -1);
  const onRight = (id: string) => navigate(id, 1);

  // Teclado
  useEffect(() => {
    if (!currentSong) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onLeft(currentSong.id);
      if (e.key === "ArrowRight") onRight(currentSong.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSong]);

  // Swipe táctil
  useEffect(() => {
    if (!currentSong) return;

    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 50) return;
      if (diff > 0) onRight(currentSong.id);
      else onLeft(currentSong.id);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSong]);

  return { onLeft, onRight };
}
