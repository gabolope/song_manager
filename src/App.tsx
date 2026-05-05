import { useState } from "react";
import useSongs from "./hooks/useSongs";
import SongList from "./components/SongList";
import BookList from "./components/BookList";
import SongViewer from "./components/SongViewer";
import { Grid, GridItem, Splitter } from "@chakra-ui/react";
import useBook from "./hooks/useBook";
import { useBookMutations } from "./hooks/useBookMutations";

const App = () => {
  const { data: songs, error, isLoading } = useSongs();
  const { data: book } = useBook();
  const { addToBook, removeFromBook } = useBookMutations(book);

  const [selectedListSong, setSelectedListSong] = useState<number | null>(null);
  const [selectedBookSong, setSelectedBookSong] = useState<number | null>(null);

  // Manejo de selección de list y book
  const listClick = (index: number) => {
    setSelectedListSong(index);
    setSelectedBookSong(null);
  };
  const bookClick = (index: number) => {
    setSelectedBookSong(index);
    setSelectedListSong(null);
  };

  const currentSong =
    selectedListSong !== null
      ? songs?.[selectedListSong]
      : selectedBookSong !== null
        ? book?.[selectedBookSong]
        : null;

  if (error) return <p>{error.message}</p>;

  return (
    <Grid
      templateAreas={{
        base: `"viewer"`,
        lg: `"aside viewer"`,
      }}
      templateColumns={{
        base: "1fr",
        lg: "400px 1fr",
      }}
      paddingTop={"10px"}
      h="100vh"
      w="100vw"
    >
      <GridItem
        area="aside"
        padding="10px"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <div style={{ height: "100%", width: "100%" }}>
          <Splitter.Root
            panels={[{ id: "a" }, { id: "b" }]}
            orientation="vertical"
            borderWidth="1px"
            minH="60"
            style={{ height: "100%" }}
          >
            <Splitter.Panel id="a">
              <SongList
                items={songs}
                isLoading={isLoading}
                onClick={(index) => listClick(index)}
                selected={selectedListSong}
                addToBook={(song) => addToBook.mutate(song)}
              ></SongList>
            </Splitter.Panel>
            <Splitter.ResizeTrigger id="a:b" />
            <Splitter.Panel id="b">
              <BookList
                items={book}
                selected={selectedBookSong}
                onClick={bookClick}
                onDelete={(id) => removeFromBook.mutate(id)}
              />
            </Splitter.Panel>
          </Splitter.Root>
        </div>
      </GridItem>
      <GridItem area="viewer" h="100%" overflow="hidden">
        <SongViewer
          displayedSong={currentSong}
          onLeft={() => {}}
          onRight={() => {}}
        />
      </GridItem>
    </Grid>
  );
};

export default App;
