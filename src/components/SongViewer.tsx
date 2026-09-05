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
  const { setIsLive, isCurrentLive, backToLive, nextSong, clearLiveSong } =
    useSession();

  const directorCtx = useContext(DirectorContext);
  const playerCtx = useContext(PlayerContext);

  const displayedSong = directorCtx?.currentSong ?? playerCtx?.displayedSong;
  const onLeft = directorCtx?.onLeft ?? playerCtx?.onLeft ?? (() => {});
  const onRight = directorCtx?.onRight ?? playerCtx?.onRight ?? (() => {});
  // Pantalla completa es un estado por pestaña (Director y Player pueden estar
  // en dispositivos distintos), lo aporta el contexto de cada página.
  const fullscreen = directorCtx?.fullscreen ?? playerCtx?.fullscreen ?? false;

  // Cuando quien sale de pantalla completa es el Director (por el botón Salir
  // o por salir con Escape), también se termina la sesión en vivo para que
  // los viewers no se queden viendo la última canción para siempre.
  const exitFullscreen = useCallback(
    (value: boolean) => {
      (directorCtx?.setFullscreen ?? playerCtx?.setFullscreen ?? (() => {}))(
        value,
      );
      if (!value && directorCtx) {
        setIsLive(false);
        clearLiveSong.mutate();
      }
    },
    [directorCtx, playerCtx, setIsLive, clearLiveSong],
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
    return <div className="songViewerContainer">Seleccioná una canción</div>;
  }

  return (
    <>
      <div
        className={
          isCurrentLive() ? "songViewerContainer isLive" : "songViewerContainer"
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
          isCurrentLive={isCurrentLive()}
          onBackToLive={backToLive}
        />
      </div>
    </>
  );
};

export default SongViewer;
