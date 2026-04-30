import parse from "html-react-parser";
import { useEffect, useMemo, useRef, useState } from "react";
import "./SongViewer.css";
import { formatSong } from "../services/chordpro.service";
import type { SongDTO } from "../types/song";

interface Props {
  onLeft: () => void;
  onRight: () => void;
  displayedSong?: SongDTO | null;
}

const SongViewer = ({ onLeft, onRight, displayedSong }: Props) => {
  const html = useMemo(() => {
    if (!displayedSong) return "";
    return formatSong(displayedSong.content);
  }, [displayedSong]);

  const [isFullScreen, setFullScreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const goFullScreen = () => {
    viewerRef.current?.requestFullscreen();
  };

  const exitFullScreen = () => {
    document.exitFullscreen();
  };

  if (!displayedSong) {
    return (
      <div className="card songViewerContainer">Seleccioná una canción</div>
    );
  }

  return (
    <div className="card songViewerContainer" ref={viewerRef}>
      {isFullScreen ? (
        <div className="btn-group">
          <button onClick={onLeft}>&lt;&lt;&lt;</button>
          <button onClick={exitFullScreen}>Salir</button>
          <button onClick={onRight}>&gt;&gt;&gt;</button>
        </div>
      ) : (
        <div className="btn-group barra">
          <button onClick={onLeft}>&lt;&lt;&lt;</button>
          <button onClick={goFullScreen}>Pantalla completa</button>
          <button onClick={onRight}>&gt;&gt;&gt;</button>
        </div>
      )}

      <div className="songTitle">{displayedSong.title}</div>
      <div className="tono">Tono: {displayedSong.key ?? "-"}</div>
      <div>{parse(html)}</div>
    </div>
  );
};

export default SongViewer;
