import type { SongDTO } from "@/types/song";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline } from "react-icons/md";
import "./SongList.css";

interface Props {
  items?: SongDTO[];
  onClick: (index: number) => void;
  onDelete?: (id: string) => void;
  selected: number | null;
  title?: string;
  emptyMessage?: string;
}
const BookList = ({
  items,
  onClick,
  onDelete,
  selected,
  title = "Book",
  emptyMessage = "Agregá canciones desde la lista para armar el book.",
}: Props) => {
  return (
    <div className="panel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <span className="panelCount">{items?.length ?? 0}</span>
      </div>

      {!items?.length ? (
        <div className="panelEmpty">{emptyMessage}</div>
      ) : (
        <div className="songList">
          {items.map((song, index) => (
            <div key={song.id} onClick={() => onClick?.(index)}>
              <div className={selected === index ? "song selected" : "song"}>
                <div>{song.title}</div>
                <div>
                  {selected === index && onDelete && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(song.id);
                      }}
                      colorPalette={"red"}
                      size="sm"
                      borderRadius={"md"}
                    >
                      <MdDeleteOutline />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
