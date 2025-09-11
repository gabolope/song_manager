import ChordSheetJS from "chordsheetjs";
import parse from "html-react-parser";
import type { Song } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";
import "./SongViewer.css";

import chordpro1 from "../songs/alquemecine.chordpro?raw";

const parser = new ChordSheetJS.ChordProParser();
const placeholder = parser.parse(chordpro1);

interface Props {
  displayedSong?: Song;
}

const SongViewer = ({ displayedSong = placeholder }: Props) => {
  const formatter = new ChordSheetJS.HtmlTableFormatter();
  const html = formatter.format(displayedSong);

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

  function exitFullscreen() {
    document.exitFullscreen();
  }

  return (
    <>
      <div className="card songViewerContainer" ref={viewerRef}>
        {isFullScreen ? (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={exitFullscreen}
          >
            Salir
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={goFullScreen}
          >
            Pantalla Completa
          </button>
        )}
        <div>{parse(html)}</div>
      </div>
    </>
  );
};

export default SongViewer;
