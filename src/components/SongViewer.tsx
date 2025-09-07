import ChordSheetJS from "chordsheetjs";
import parse from "html-react-parser";
import type { Song } from "chordsheetjs";

interface Props {
  currentSong: Song;
}

const SongViewer = ({ currentSong }: Props) => {
  
  const formatter = new ChordSheetJS.HtmlTableFormatter();
  const html = formatter.format(currentSong);
  return (
    <>
      <div className="chord-sheet-container">
        {parse(html)}
      </div>
    </>
  );
};

export default SongViewer;
