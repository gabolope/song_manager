import { Button, Text } from "@chakra-ui/react";
import type { SongDTO } from "../types/song";
import { IoAddCircleOutline } from "react-icons/io5";
import "./SongList.css";

interface Props {
  addToBook: (song: SongDTO) => void;
  book?: SongDTO[];
  items: SongDTO[] | undefined;
  isLoading: boolean;
  onClick?: (index: number) => void;
  selected?: number | null;
  isAdding?: boolean;
}

const SongList = ({
  book,
  isLoading,
  items,
  onClick,
  selected,
  addToBook,
  isAdding,
}: Props) => {
  if (isLoading) return "Cargando...";

  return (
    <div className="songList">
      {items?.map((song, index) => {
        const isInBook = book?.some((i) => i.id === song.id) ?? false;

        return (
          <div key={song.id} onClick={() => onClick?.(index)}>
            <div className={selected === index ? "song selected" : "song"}>
              <div>{song.title || <Text opacity={0.6}>Sin título</Text>}</div>
              <div>
                {selected === index && !isInBook && (
                  <Button
                    onClick={() => addToBook(song)}
                    colorPalette={"blue"}
                    h={"60px"}
                    borderRadius={"0"}
                    loading={isAdding}
                    disabled={isAdding}
                  >
                    <IoAddCircleOutline />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;
