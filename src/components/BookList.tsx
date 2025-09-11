import type { Song } from "chordsheetjs";

interface Props {
  items: Song[];
  onClick: (id: number) => void;
  onDelete: () => void;
  selectedSong: number;
}
const BookList = ({ items, onClick, onDelete, selectedSong }: Props) => {
  return (
    <div className="list-group songListContainer">
      <h4>Lista de canciones</h4>
      {items.map((item, index) => (
        <>
          <div className="row justify-content-between">
            <a
              href="#"
              aria-current="true"
              key={index}
              className={
                selectedSong === index
                  ? "list-group-item list-group-item-action list-group-item-success"
                  : "list-group-item list-group-item-action"
              }
              onClick={() => onClick(index)}
            >
              <div className="col-4">{item.title}</div>
              <div className="col-4">
                {selectedSong === index ? (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onDelete()}
                  >
                    Eliminar
                  </button>
                ) : null}
              </div>
            </a>
          </div>
        </>
      ))}
    </div>
  );
};

export default BookList;
