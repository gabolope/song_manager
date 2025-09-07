import ChordSheetJS from "chordsheetjs";
import type { Song } from "chordsheetjs";
import parse from "html-react-parser";
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

  return (
    <>
      <div className="card songViewerContainer">
        <div>{parse(html)}</div>
      </div>
    </>
  );
};

export default SongViewer;
