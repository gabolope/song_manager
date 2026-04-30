import { Button, Stack, List, Text } from "@chakra-ui/react";
import type { SongDTO } from "../types/song";
import { IoIosAddCircleOutline } from "react-icons/io";

interface Props {
  items: SongDTO[];
  isLoading: boolean;
  onClick?: (index: number) => void;
  selectedIndex?: number | null;
  addToBook: (song: SongDTO) => void;
}

const SongList = ({
  isLoading,
  items,
  onClick,
  selectedIndex,
  addToBook,
}: Props) => {
  if (isLoading) return "Cargando...";

  return (
    <List.Root gap={2}>
      {items.map((song, index) => (
        <List.Item key={song.id}>
          <Button
            width="400px"
            justifyContent="flex-start"
            variant={selectedIndex === index ? "solid" : "ghost"}
            colorPalette={selectedIndex === index ? "white" : "gray"}
            onClick={() => onClick?.(index)}
            whiteSpace={"normal"}
            textAlign={"left"}
          >
            {song.title || <Text opacity={0.6}>Sin título</Text>}
            {selectedIndex === index && (
              <IoIosAddCircleOutline
                onClick={() => addToBook(items[selectedIndex!])}
              />
            )}
          </Button>
        </List.Item>
      ))}
    </List.Root>
  );
};

export default SongList;
