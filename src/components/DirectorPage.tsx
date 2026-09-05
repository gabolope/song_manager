import { Grid, GridItem, Splitter } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
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
  // Pantalla completa es local a esta pestaña, no se comparte con Player.
  const [fullscreen, setFullscreen] = useState(false);

  const listClick = useCallback(
    (index: number) => {
      setSelectedListSong(index);
      setSelectedBookSong(null);
    },
    [setSelectedBookSong],
  );
  const bookClick = useCallback(
    (index: number) => {
      setSelectedBookSong(index);
      setSelectedListSong(null);
    },
    [setSelectedBookSong],
  );

  const currentSong =
    selectedListSong !== null
      ? songs?.[selectedListSong]
      : selectedBookSong !== null
        ? book?.[selectedBookSong]
        : null;

  const onBookNavigate = useCallback(
    (index: number) => {
      setSelectedBookSong(index);
      setSelectedListSong(null);
    },
    [setSelectedBookSong],
  );

  const { onLeft, onRight } = useBookNavigation(
    book,
    true, // siempre es director
    currentSong,
    onBookNavigate,
    isLive,
  );

  // Memoizado: si este objeto fuera nuevo en cada render, exitFullscreen en
  // SongViewer cambiaría de identidad y volvería a disparar requestFullscreen()
  // sin gesto de usuario, provocando que el navegador lo rechace y se salga
  // de pantalla completa apenas se entra ("Go Live" parpadeando).
  const directorContextValue = useMemo(
    () => ({
      currentSong,
      selectedListSong,
      listClick,
      bookClick,
      onLeft,
      onRight,
      fullscreen,
      setFullscreen,
    }),
    [
      currentSong,
      selectedListSong,
      listClick,
      bookClick,
      onLeft,
      onRight,
      fullscreen,
    ],
  );

  if (error) return <p>{error.message}</p>;

  return (
    <DirectorContext.Provider value={directorContextValue}>
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
                  addToBook={(song) => {
                    // Evita duplicar la escritura si el click llega dos
                    // veces antes de que se refleje el book actualizado.
                    if (!addToBook.isPending) addToBook.mutate(song);
                  }}
                  isAdding={addToBook.isPending}
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
            songId={currentSong?.id}
            onLeft={onLeft}
            onRight={onRight}
            goLive={() => {
              const next = !isLive;
              setIsLive(next);
              setFullscreen(next);
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
