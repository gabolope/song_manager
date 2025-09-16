import type { Song } from "chordsheetjs";
import "./BookList.css";

interface Props {
  items: Song[];
  onClick: (id: number) => void;
  onDelete: () => void;
  selectedSong: number | null;
}
const BookList = ({ items, onClick, onDelete, selectedSong }: Props) => {
  return (
    <div className="list-group songListContainer resizable">
      {items.map((item, index) => (
        <a
          href="#"
          aria-current="true"
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
              <button className="btn btn-secondary" onClick={() => onDelete()}>
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
