import { Grid, GridItem, Splitter } from "@chakra-ui/react";
import { useState } from "react";
import BookList from "../components/BookList";
import SongList from "../components/SongList";
import SongUploader from "../components/SongUploader";
import SongViewer from "../components/SongViewer";
import DirectorContext from "../contexts/DirectorContext";
import { useSession } from "../contexts/SessionContext";
import { useBookMutations } from "../hooks/useBookMutations";
import { useBookNavigation } from "../hooks/useBookNavigation";
import useSongs from "../hooks/useSongs";
import ViewerBar from "./ViewerBar";

const DirectorPage = () => {
  const { data: songs, error, isLoading } = useSongs();
  const {
    book,
    setLiveSong,
    clearLiveSong,
    selectedBookSong,
    setSelectedBookSong,
    isLive,
    setIsLive,
  } = useSession();

  const { addToBook, removeFromBook } = useBookMutations(book);

  const [selectedListSong, setSelectedListSong] = useState<number | null>(null);

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

  const { onLeft, onRight } = useBookNavigation(
    book,
    true, // siempre es director
    currentSong,
    (index) => {
      setSelectedBookSong(index);
      setSelectedListSong(null);
    },
    isLive,
  );

  if (error) return <p>{error.message}</p>;

  return (
    <DirectorContext.Provider
      value={{
        currentSong,
        selectedListSong,
        listClick,
        bookClick,
        onLeft,
        onRight,
      }}
    >
      <Grid
        templateAreas={{ base: `"viewer"`, lg: `"aside viewer"` }}
        templateColumns={{ base: "1fr", lg: "400px 1fr" }}
        paddingTop="10px"
        h="100vh"
        w="100vw"
      >
        <GridItem
          area="aside"
          padding="10px"
          h="100%"
          display="flex"
          flexDirection="column"
          hideBelow="lg"
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
                  onClick={listClick}
                  selected={selectedListSong}
                />
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
          <ViewerBar
            isLive={isLive}
            goLive={() => {
              const next = !isLive;
              setIsLive(next);
              if (next) {
                // Entrando en vivo: publica la canción actual.
                if (currentSong) setLiveSong.mutate(currentSong);
              } else {
                // Saliendo: termina la sesión en vivo en vez de re-publicarla.
                clearLiveSong.mutate();
              }
            }}
          />
          <SongViewer />
        </GridItem>
      </Grid>
      <SongUploader />
    </DirectorContext.Provider>
  );
};

export default DirectorPage;
