import { useState } from "react";
import useSongs from "./hooks/useSongs";
import useBook from "./hooks/useBook";
import { useBookMutations } from "./hooks/useBookMutations";
import { useBookNavigation } from "./hooks/useBookNavigation";
import { useLiveSong } from "./hooks/useLiveSong";
import SongList from "./components/SongList";
import BookList from "./components/BookList";
import LiveBar from "./components/LiveBar";
import SongViewer from "./components/SongViewer";
import { Grid, GridItem, Splitter } from "@chakra-ui/react";
import SongUploader from "./components/SongUploader";

const App = () => {
  // Hooks de fetching data
  const { data: songs, error, isLoading } = useSongs();
  const { data: book } = useBook();
  const { addToBook, removeFromBook } = useBookMutations(book);
  const { liveSong, setLiveSong } = useLiveSong();

  // Estados de selección de canción
  const [selectedListSong, setSelectedListSong] = useState<number | null>(null);
  const [selectedBookSong, setSelectedBookSong] = useState<number | null>(null);

  // Estados de modo director y canción en vivo
  const [isLive, setIsLive] = useState(false);
  const [isDirector, setIsDirector] = useState(false);

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

  // Manejo de left y right
  const { onLeft, onRight } = useBookNavigation(
    book,
    isDirector,
    currentSong,
    (index) => {
      setSelectedBookSong(index);
      setSelectedListSong(null);
    },
  );

  if (error) return <p>{error.message}</p>;

  return (
    <>
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
          hideBelow={"lg"}
        >
          <div style={{ height: "100%", width: "100%" }}>
            <Splitter.Root
              panels={[{ id: "a" }, { id: "b" }]}
              orientation="vertical"
              borderWidth="1px"
              minH="60"
              style={{ height: "100%", borderRadius: "10px" }}
            >
              <Splitter.Panel id="a">
                <SongList
                  addToBook={(song) => addToBook.mutate(song)}
                  book={book}
                  items={songs}
                  isLoading={isLoading}
                  onClick={(index) => listClick(index)}
                  selected={selectedListSong}
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
        <GridItem area="viewer" h="100%" overflow="hidden" padding="10px">
          <LiveBar
            isLive={isLive}
            isDirector={isDirector}
            goLive={() => {
              setIsLive(!isLive);
              if (isDirector && currentSong) setLiveSong.mutate(currentSong); // hace que cuando el director apreta goLive cambie la cancion
            }}
            setDirector={() => setIsDirector(!isDirector)}
          />
          <SongViewer
            displayedSong={isDirector ? currentSong : liveSong.data}
            isLive={isLive}
            isDirector={isDirector}
            onLiveChange={setIsLive}
            onLeft={(i) => onLeft(i)}
            onRight={(i) => onRight(i)}
          />
        </GridItem>
      </Grid>
      <SongUploader />
    </>
  );
};

export default App;
