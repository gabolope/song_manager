import { useCallback, useEffect, useRef } from "react";

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
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        exitFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [exitFullscreen]);

  return { viewerRef, exitFullscreen };
}
