import { Button, Text } from "@chakra-ui/react";
import type { SongDTO } from "../types/song";
import "./SongList.css";

interface Props {
  addToBook: (song: SongDTO) => void;
  items: SongDTO[] | undefined;
  isLoading: boolean;
  onClick?: (index: number) => void;
  selected?: number | null;
}

const SongList = ({
  isLoading,
  items,
  onClick,
  selected,
  addToBook,
}: Props) => {
  if (isLoading) return "Cargando...";

  return (
    <div className="songList">
      {items?.map((song, index) => (
        <div key={index} onClick={() => onClick?.(index)}>
          <div className={selected === index ? "song selected" : "song"}>
            <div className="title">
              {song.title || <Text opacity={0.6}>Sin título</Text>}
            </div>
            <div>
              {selected === index && (
                <Button
                  onClick={() => addToBook(items[selected!])}
                  colorPalette={"blue"}
                  h={"50px"}
                  borderRadius={"0"}
                >
                  Agregar
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;
