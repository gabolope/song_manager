import type { SongDTO } from "@/types/song";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline } from "react-icons/md";
import "./SongList.css";

interface Props {
  items?: SongDTO[];
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
            <div>{song.title}</div>
            <div>
              {selected === index && (
                <Button
                  onClick={() => onDelete(song.id)}
                  colorPalette={"red"}
                  h={"60px"}
                  borderRadius={"0"}
                >
                  <MdDeleteOutline />
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
