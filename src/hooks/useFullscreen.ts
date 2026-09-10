import { useCallback, useEffect, useRef } from "react";

// Safari en iPhone (a diferencia de iPad) no implementa la Fullscreen API
// para elementos arbitrarios, sólo para <video> vía webkitEnterFullscreen.
// Ahí viewerRef.current.requestFullscreen es undefined: llamarlo revienta
// con un TypeError síncrono que ni cae en el .catch() de la promesa, así
// que "pantalla completa" no hacía nada (o rompía el efecto). Se detecta el
// soporte una sola vez y, si falta, se cae a un fallback por CSS (position:
// fixed cubriendo el viewport) en vez de pedírsela al navegador.
const supportsFullscreenApi =
  typeof document !== "undefined" &&
  typeof document.exitFullscreen === "function" &&
  typeof HTMLElement.prototype.requestFullscreen === "function";

// Encapsula el manejo de pantalla completa del SongViewer: pedirla/salir
// según el estado de la sesión (Director/Player), y reaccionar cuando el
// usuario sale a mano (Escape, gesto del navegador).
export function useFullscreen(
  fullscreen: boolean,
  setFullscreenFn: ((value: boolean) => void) | undefined,
  isDirector: boolean,
  setIsLive: (value: boolean) => void,
  clearLiveSongMutate: () => void,
) {
  const viewerRef = useRef<HTMLDivElement>(null);

  // Cuando quien sale de pantalla completa es el Director (por el botón Salir
  // o por salir con Escape), también se termina la sesión en vivo para que
  // los viewers no se queden viendo la última canción para siempre.
  const exitFullscreen = useCallback(
    (value: boolean) => {
      setFullscreenFn?.(value);
      if (!value && isDirector) {
        setIsLive(false);
        clearLiveSongMutate();
      }
    },
    [setFullscreenFn, isDirector, setIsLive, clearLiveSongMutate],
  );

  useEffect(() => {
    if (!supportsFullscreenApi) return;
    if (fullscreen) {
      viewerRef.current?.requestFullscreen().catch((error) => {
        // El navegador puede rechazar el pedido (falta de gesto de usuario,
        // permisos, etc.); si pasa, no dejar el estado como si sí lo estuviera.
        console.error("No se pudo entrar en pantalla completa:", error);
        exitFullscreen(false);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [fullscreen, exitFullscreen]);

  // Manejo de salida manual del fullscreen
  useEffect(() => {
    if (!supportsFullscreenApi) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        exitFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [exitFullscreen]);

  // Sin soporte nativo (iPhone Safari), "pantalla completa" se simula con
  // CSS: el contenedor se fija cubriendo el viewport. La salida sigue
  // siendo manual (botón "Salir" de LiveBar), ya que no hay evento nativo
  // del que enterarse.
  const usesFullscreenFallback = fullscreen && !supportsFullscreenApi;

  return { viewerRef, exitFullscreen, usesFullscreenFallback };
}
