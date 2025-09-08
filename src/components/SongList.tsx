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
          <>
            <div className="row justify-content-between">
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
                  <div className="col-4">
                    {item.title}
                  </div>
                  <div className="col-4">
                    {selectedSong === index ? <button className="btn btn-outline-light addButton">Agregar a lista</button> :null}
                  </div>
                </a>
            </div>
          </>
        ))}
      </div>
    </>
  );
};

export default SongList;
