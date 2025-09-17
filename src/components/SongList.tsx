import type { Song } from "chordsheetjs";
import "./SongList.css";
import SongListFilter from "./SongListFilter";

interface Props {
  items: Song[];
  onAdd: () => void;
  onClick: (id: number) => void;
  selectedSong: number | null;
}

const SongList = ({ items, selectedSong = 0, onAdd, onClick }: Props) => {
  return (
    <div className="list-group songListContainer">
      <SongListFilter />
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
          <div>{item.title}</div>
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
