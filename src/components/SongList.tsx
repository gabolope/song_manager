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
    <>
      <div className="list-group songListContainer">
        <h4>Librería de canciones</h4>
        {items.map((item, index) => (
          <>
            <div className="row justify-content-between">
              <a
                href="#"
                aria-current="true"
                key={index}
                className={
                  selectedSong === index
                    ? "list-group-item list-group-item-action d-flex justify-content-between list-group-item-primary"
                    : "list-group-item list-group-item-action d-flex justify-content-between"
                }
                onClick={() => onClick(index)}
              >
                <div className="col-4">{item.title}</div>
                <div className="col-4">
                  {selectedSong === index ? (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onAdd()}
                    >
                      Agregar a lista
                    </button>
                  ) : null}
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
