import { Splitter } from "@chakra-ui/react";
import { useState } from "react";
import type { SongDTO } from "@/types/song";
import BookList from "@/components/SongList/BookList";
import SongList from "@/components/SongList/SongList";

const DEFAULT_SIZE = [50, 50];

interface Props {
  songs: SongDTO[] | undefined;
  book: SongDTO[] | undefined;
  isLoading: boolean;
  isBookLoading?: boolean;
  isAdding: boolean;
  selectedListSong: number | null;
  selectedBookSong: number | null;
  onListClick: (index: number) => void;
  onBookClick: (index: number) => void;
  onAddToBook: (song: SongDTO) => void;
  onRemoveFromBook: (id: string) => void;
}

const DirectorSidePanels = ({
  songs,
  book,
  isLoading,
  isBookLoading,
  isAdding,
  selectedListSong,
  selectedBookSong,
  onListClick,
  onBookClick,
  onAddToBook,
  onRemoveFromBook,
}: Props) => {
  const [size, setSize] = useState<number[]>(DEFAULT_SIZE);

  const toggleExpand = (panel: "a" | "b") => {
    setSize((prev) => {
      const isExpanded = panel === "a" ? prev[0] === 100 : prev[1] === 100;
      if (isExpanded) return DEFAULT_SIZE;
      return panel === "a" ? [100, 0] : [0, 100];
    });
  };

  return (
    <Splitter.Root
      panels={[{ id: "a" }, { id: "b" }]}
      orientation="vertical"
      borderWidth="1px"
      minH="60"
      size={size}
      onResize={(details) => setSize(details.size)}
      style={{
        height: "100%",
        borderRadius: "12px",
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <Splitter.Panel id="a">
        <SongList
          addToBook={onAddToBook}
          isAdding={isAdding}
          book={book}
          items={songs}
          isLoading={isLoading}
          onClick={onListClick}
          selected={selectedListSong}
          isExpanded={size[0] === 100}
          onToggleExpand={() => toggleExpand("a")}
        />
      </Splitter.Panel>
      <Splitter.ResizeTrigger
        id="a:b"
        height="14px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="row-resize"
        _hover={{ background: "var(--bg-hover)" }}
      />
      <Splitter.Panel id="b">
        <BookList
          items={book}
          isLoading={isBookLoading}
          selected={selectedBookSong}
          onClick={onBookClick}
          onDelete={onRemoveFromBook}
          isExpanded={size[1] === 100}
          onToggleExpand={() => toggleExpand("b")}
        />
      </Splitter.Panel>
    </Splitter.Root>
  );
};

export default DirectorSidePanels;
