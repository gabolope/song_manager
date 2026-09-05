import parse from "html-react-parser";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import DirectorContext from "../contexts/DirectorContext";
import PlayerContext from "../contexts/PlayerContext";
import { useSession } from "../contexts/SessionContext";
import { formatSong } from "../services/chordpro.service";
import LiveBar from "./LiveBar";
import NextSong from "./NextSong";
import "./SongViewer.css";

const SongViewer = () => {
  const {
    setIsLive,
    isCurrentLive,
    backToLive,
    nextSong,
    clearLiveSong,
    liveSong,
  } = useSession();

  const directorCtx = useContext(DirectorContext);
  const playerCtx = useContext(PlayerContext);
  // useMutation devuelve un objeto nuevo en cada render aunque nada haya
  // cambiado; sólo `.mutate` es estable. Depender del objeto completo hacía
  // que exitFullscreen (y por lo tanto el efecto de pantalla completa) se
  // recreara en cada snapshot de Firestore, disparando un segundo
  // requestFullscreen() sin gesto de usuario que el navegador rechaza y
  // termina saliendo de pantalla completa apenas se entra.
  const clearLiveSongMutate = clearLiveSong.mutate;

  const displayedSong = directorCtx?.currentSong ?? playerCtx?.displayedSong;
  const onLeft = directorCtx?.onLeft ?? playerCtx?.onLeft ?? (() => {});
  const onRight = directorCtx?.onRight ?? playerCtx?.onRight ?? (() => {});
  // Pantalla completa es un estado por pestaña (Director y Player pueden estar
  // en dispositivos distintos), lo aporta el contexto de cada página.
  const fullscreen = directorCtx?.fullscreen ?? playerCtx?.fullscreen ?? false;
  // exitFullscreen sólo necesita estas dos piezas de directorCtx/playerCtx,
  // ambas estables (setFullscreen es un setter de useState, isDirector no
  // cambia en la vida de la página). Depender de los objetos de contexto
  // completos hacía que exitFullscreen se recreara cada vez que cambiaba
  // cualquier otro campo (p. ej. currentSong al navegar de canción), lo que
  // volvía a disparar requestFullscreen() sin gesto de usuario y el
  // navegador lo rechazaba, saliendo de pantalla completa apenas se entraba.
  const setFullscreenFn = directorCtx?.setFullscreen ?? playerCtx?.setFullscreen;
  const isDirector = !!directorCtx;

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

  const html = useMemo(() => {
    if (!displayedSong) return "";
    return formatSong(displayedSong.content);
  }, [displayedSong]);

  // Manejo de fullscreen
  const viewerRef = useRef<HTMLDivElement>(null);

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

  if (!displayedSong) {
    return (
      <div className="songViewerContainer songViewerEmpty">
        Seleccioná una canción para empezar
      </div>
    );
  }

  return (
    <>
      <div
        className={
          isCurrentLive(displayedSong)
            ? "songViewerContainer isLive"
            : "songViewerContainer"
        }
        ref={viewerRef}
      >
        <div className="songTitle">{displayedSong.title}</div>
        <div className="tono">Tono: {displayedSong.key ?? "-"}</div>
        <div>{parse(html)}</div>
        <NextSong nextSong={nextSong} />
        <LiveBar
          songId={displayedSong.id}
          isLive={fullscreen}
          viewerRef={viewerRef}
          onLiveChange={exitFullscreen}
          onLeft={onLeft}
          onRight={onRight}
          isCurrentLive={isCurrentLive(displayedSong)}
          onBackToLive={backToLive}
          hasLiveSession={!!liveSong.data}
        />
      </div>
    </>
  );
};

export default SongViewer;
