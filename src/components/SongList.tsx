import type { Song } from "chordsheetjs";
import "./SongList.css";

interface Props {
  selectedSong: number;
  items: Song[];
  onClick: (id: number) => void;
}

const SongList = ({ items, selectedSong = 0, onClick }: Props) => {
  return (
    <>
      <div className="list-group songListContainer">
        {items.map((item, index) => (
          <a
            href="#"
            aria-current="true"
            key={index}
            className={
              selectedSong === index
                ? "list-group-item list-group-item-action active"
                : "list-group-item list-group-item-action"
            }
            onClick={() => onClick(index)}
          >
            {item.title}
          </a>
        ))}
      </div>
    </>
  );
};

export default SongList;
