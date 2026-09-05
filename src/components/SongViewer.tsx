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
    isLive,
    setIsLive,
    isCurrentLive,
    backToLive,
    nextSong,
    clearLiveSong,
  } = useSession();

  const directorCtx = useContext(DirectorContext);
  const playerCtx = useContext(PlayerContext);

  const displayedSong = directorCtx?.currentSong ?? playerCtx?.displayedSong;
  const onLeft = directorCtx?.onLeft ?? playerCtx?.onLeft ?? (() => {});
  const onRight = directorCtx?.onRight ?? playerCtx?.onRight ?? (() => {});

  // Cuando quien sale de "vivo" es el Director (por el botón Salir o por salir
  // de pantalla completa con Escape), también se termina la sesión en vivo
  // para que los viewers no se queden viendo la última canción para siempre.
  const onLiveChange = useCallback(
    (value: boolean) => {
      setIsLive(value);
      if (!value && directorCtx) {
        clearLiveSong.mutate();
      }
    },
    [setIsLive, directorCtx, clearLiveSong],
  );

  const html = useMemo(() => {
    if (!displayedSong) return "";
    return formatSong(displayedSong.content);
  }, [displayedSong]);

  // Manejo de fullscreen
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLive) {
      viewerRef.current?.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [isLive]);

  // Manejo de salida manual del fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onLiveChange(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onLiveChange]);

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
          isLive={isLive}
          viewerRef={viewerRef}
          onLiveChange={onLiveChange}
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
