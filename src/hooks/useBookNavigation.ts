import type { SongDTO } from "../types/song";
import { useCallback, useEffect } from "react";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function useBookNavigation(
  book?: SongDTO[],
  isDirector?: boolean,
  displayedSong?: SongDTO | null,
  onNavigate?: (index: number) => void,
  isLive?: boolean,
  // Se recibe en vez de llamar a useLiveSong() acá adentro: así no se abre
  // una segunda suscripción a "liveSong" en paralelo a la de SessionContext,
  // y el hook funciona igual con el "liveSong" real o el del modo demo.
  setLiveSongMutate?: (song: SongDTO) => void,
) {
  const navigate = useCallback(
    (id: string, direction: 1 | -1) => {
      if (!book) return;
      const currentIndex = book.findIndex((song) => song.id === id);
      if (currentIndex === -1) return; // la canción mostrada no pertenece al book
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= book.length) return;

      onNavigate?.(nextIndex);
      // Solo se retransmite a los viewers si el Director está efectivamente "en vivo".
      if (isDirector && isLive) setLiveSongMutate?.(book[nextIndex]);
    },
    [book, isDirector, isLive, onNavigate, setLiveSongMutate],
  );

  const onLeft = useCallback((id: string) => navigate(id, -1), [navigate]);
  const onRight = useCallback((id: string) => navigate(id, 1), [navigate]);

  // Teclado
  useEffect(() => {
    if (!displayedSong) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return; // no interferir con inputs de texto
      if (e.key === "ArrowLeft") onLeft(displayedSong.id);
      if (e.key === "ArrowRight") onRight(displayedSong.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayedSong, onLeft, onRight]); // ← agregás onLeft y onRight

  // Swipe táctil
  useEffect(() => {
    if (!displayedSong) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (isEditableTarget(e.target)) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isEditableTarget(e.target)) return;
      const diffX = startX - e.changedTouches[0].clientX;
      const diffY = startY - e.changedTouches[0].clientY;

      // Si el movimiento vertical es mayor que el horizontal, es scroll → ignorar
      if (Math.abs(diffY) > Math.abs(diffX)) return;

      if (Math.abs(diffX) < 50) return;
      if (diffX > 0) onRight(displayedSong.id);
      else onLeft(displayedSong.id);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [displayedSong, onLeft, onRight]); // ← agregás onLeft y onRight

  return { onLeft, onRight };
}
