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
    <div className="songListContainer">
      {items.map((item, index) => (
        <div
          key={index}
          className={selectedSong === index ? "listItem active" : "listItem"}
          onClick={() => onClick(index)}
        >
          <div className="">{item.title}</div>
          <div className="">
            {selectedSong === index ? (
              <button className="" onClick={() => onAdd()}>
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
