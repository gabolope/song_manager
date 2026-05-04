import { Grid, GridItem } from "@chakra-ui/react";
import SongList from "./components/SongList";
import useSongs from "./hooks/useSongs";
import { useState } from "react";
import SongViewer from "./components/SongViewer";
import type { SongDTO } from "./types/song";
import BookList from "./components/BookList";

const App = () => {
  const { data: songs, error, isLoading } = useSongs();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [book, setBook] = useState<SongDTO[]>([]);
  const [bookIndex, setBookIndex] = useState<number | null>(null);

  const addToBook = (song: SongDTO) => {
    if (book.some((s) => s.id === song.id)) return;
    setBook([...book, song]);
  };

  const removeFromBook = (id: string) => {
    setBook(book.filter((s) => s.id !== id));
    setBookIndex(null);
  };

  const currentSong =
    bookIndex !== null
      ? book[bookIndex]
      : selectedIndex !== null
        ? songs?.[selectedIndex]
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
      <GridItem area="aside" paddingX="10px">
        <Grid templateRows="1fr 1fr" h="100%">
          <GridItem>
            <SongList
              items={songs}
              isLoading={isLoading}
              onClick={(index) => setSelectedIndex(index)}
              selectedIndex={selectedIndex}
              addToBook={addToBook}
            ></SongList>
          </GridItem>
          <GridItem>
            <BookList
              items={book}
              selectedIndex={selectedIndex}
              onClick={(i) => {
                setBookIndex(i);
                setSelectedIndex(null);
              }}
              onDelete={removeFromBook}
            />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem area="viewer">
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
