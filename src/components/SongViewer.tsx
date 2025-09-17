import ChordSheetJS from "chordsheetjs";
import parse from "html-react-parser";
import type { Song } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";
import "./SongViewer.css";

// Defino un placeholder:
import chordpro1 from "../songs/E1 Eres mi amigo fiel.chordpro?raw";
const parser = new ChordSheetJS.ChordProParser();
const placeholder = parser.parse(chordpro1);

interface Props {
  onLeft: () => void;
  onRight: () => void;
  displayedSong?: Song;
}

const SongViewer = ({
  onLeft,
  onRight,
  displayedSong = placeholder,
}: Props) => {
  // Formateo de song:
  const formatter = new ChordSheetJS.HtmlTableFormatter();
  const html = formatter.format(displayedSong);

  // Manejo de FullScreen:
  const [isFullScreen, setFullScreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const goFullScreen = () => {
    if (viewerRef.current) viewerRef.current.requestFullscreen();
  };

  function exitFullScreen() {
    document.exitFullscreen();
  }

  return (
    <>
      <div className="card songViewerContainer" ref={viewerRef}>
        {isFullScreen ? (
          <div
            className="btn-group"
            role="group"
            aria-label="Default button group"
          >
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={onLeft}
            >
              &lt;&lt;&lt;
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={exitFullScreen}
            >
              Salir
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={onRight}
            >
              &gt;&gt;&gt;
            </button>
          </div>
        ) : (
          <div
            className="btn-group"
            role="group"
            aria-label="Default button group"
          >
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={onLeft}
            >
              &lt;&lt;&lt;
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={goFullScreen}
            >
              Pantalla completa
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={onRight}
            >
              &gt;&gt;&gt;
            </button>
          </div>
        )}
        <div className="songTitle">{displayedSong.title}</div>
        <div className="tono">Tono: {displayedSong.key}</div>
        <div>{parse(html)}</div>
      </div>
    </>
  );
};

export default SongViewer;
