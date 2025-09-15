import type { Song } from "chordsheetjs";

interface Props {
  items: Song[];
  onClick: (id: number) => void;
  onDelete: () => void;
  selectedSong: number | null;
}
const BookList = ({ items, onClick, onDelete, selectedSong }: Props) => {
  return (
    <div className="list-group">
      <h4>Lista de canciones</h4>
      {items.map((item, index) => (
        <a
          href="#"
          aria-current="true"
          key={index}
          className={
            selectedSong === index
              ? "row justify-content-between list-group-item list-group-item-action d-flex justify-content-between list-group-item-success"
              : "row justify-content-between list-group-item list-group-item-action d-flex justify-content-between"
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
      ))}
    </div>
  );
};

export default BookList;
