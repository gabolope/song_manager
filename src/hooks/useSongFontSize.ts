import { useCallback, useState } from "react";

const MIN_SCALE = 0.7;
const MAX_SCALE = 2;
const STEP = 0.1;
const DEFAULT_SCALE = 1;

function clamp(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function storageKey(uid?: string) {
  return `songViewerFontScale:${uid ?? "anon"}`;
}

function readStoredScale(uid?: string) {
  const stored = window.localStorage.getItem(storageKey(uid));
  const parsed = stored ? Number.parseFloat(stored) : NaN;
  return Number.isFinite(parsed) ? clamp(parsed) : DEFAULT_SCALE;
}

// Tamaño de letra/acordes del SongViewer: es una preferencia de lectura por
// dispositivo, no algo que deba sincronizarse por Firestore ni compartirse
// entre usuarios (a diferencia del resto del estado de la sesión).
export function useSongFontSize(uid?: string) {
  const [scale, setScale] = useState(() => readStoredScale(uid));

  const changeBy = useCallback(
    (delta: number) => {
      setScale((prev) => {
        const next = clamp(Math.round((prev + delta) * 10) / 10);
        window.localStorage.setItem(storageKey(uid), String(next));
        return next;
      });
    },
    [uid],
  );

  const increase = useCallback(() => changeBy(STEP), [changeBy]);
  const decrease = useCallback(() => changeBy(-STEP), [changeBy]);

  return {
    scale,
    increase,
    decrease,
    canIncrease: scale < MAX_SCALE,
    canDecrease: scale > MIN_SCALE,
  };
}
