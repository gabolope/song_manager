import type { SongDTO } from "@/types/song";
import { Button } from "@chakra-ui/react";
import "./SongList.css";

interface Props {
  items: SongDTO[];
  onClick: (index: number) => void;
  onDelete: (id: string) => void;
  selected: number | null;
}
const BookList = ({ items, onClick, onDelete, selected }: Props) => {
  return (
    <div className="songList">
      {items?.map((song, index) => (
        <div key={index} onClick={() => onClick?.(index)}>
          <div className={selected === index ? "song selected" : "song"}>
            <div className="title">{song.title}</div>
            <div>
              {selected === index && (
                <Button
                  onClick={() => console.log(song.id)}
                  colorPalette={"red"}
                  h={"50px"}
                  borderRadius={"0"}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
