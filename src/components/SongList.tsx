import type { Song } from "chordsheetjs";
import "./SongList.css";

interface Props {
  items: Song[];
  onAdd: () => void;
  onClick: (id: number) => void;
  selectedSong: number | null;
}

const SongList = ({ items, selectedSong = 0, onAdd, onClick }: Props) => {
  return (
    <div className="list-group songListContainer">
      {items.map((item, index) => (
        <div
          key={index}
          className={
            selectedSong === index
              ? "listItem list-group-item list-group-item-action active"
              : " listItem list-group-item list-group-item-action"
          }
          onClick={() => onClick(index)}
        >
          <div className="songName">
            <div className="songTitle">{item.title}</div>
            <div className="songKey"> Tono: <span>{item.tone}</span></div>
          </div>
          <div>
            {selectedSong === index ? (
              <button className="btn btn-outline-light" onClick={() => onAdd()}>
                Agregar
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;
