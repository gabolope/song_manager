import ChordSheetJS from "chordsheetjs";
import parse from "html-react-parser";

interface Props {
  song: string;
  onClick: () => void;
}

const SongViewer = ({ song, onClick }: Props) => {
  // Display a parsed sheet
  const parser = new ChordSheetJS.ChordProParser();
  const displaySong = parser.parse(song);

  const formatter = new ChordSheetJS.HtmlTableFormatter();
  const html = formatter.format(displaySong);
  return (
    <>
      <div className="chord-sheet-container">
        <button onClick={() => onClick()}>Cambiar canción</button>
        {parse(html)}
      </div>
    </>
  );
};

export default SongViewer;
