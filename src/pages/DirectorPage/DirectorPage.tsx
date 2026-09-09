import { CloseButton, Drawer, Grid, GridItem, Portal } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import SongViewer from "@/components/SongViewer/SongViewer";
import DirectorContext from "@/contexts/DirectorContext";
import { useSession } from "@/contexts/SessionContext";
import { useBookMutations } from "@/hooks/useBookMutations";
import { useBookNavigation } from "@/hooks/useBookNavigation";
import useSongs from "@/hooks/useSongs";
import DemoWelcomeDialog from "./DemoWelcomeDialog";
import DirectorSidePanels from "./DirectorSidePanels";
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
  // En mobile, la lista/book viven en un Drawer en vez del aside fijo.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const listClick = useCallback(
    (index: number) => {
      setSelectedListSong(index);
      setSelectedBookSong(null);
      setMobileMenuOpen(false);
    },
    [setSelectedBookSong],
  );
  const bookClick = useCallback(
    (index: number) => {
      setSelectedBookSong(index);
      setSelectedListSong(null);
      setMobileMenuOpen(false);
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
    setLiveSong.mutate,
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

  if (error)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--danger)",
        }}
      >
        <p>{error.message}</p>
      </div>
    );

  return (
    <DirectorContext.Provider value={directorContextValue}>
      <DemoWelcomeDialog />
      <Grid
        templateAreas={{
          base: `"header" "viewer"`,
          lg: `"header header" "aside viewer"`,
        }}
        templateColumns={{ base: "1fr", lg: "340px 1fr" }}
        templateRows="auto 1fr"
        h="100vh"
        w="100vw"
        overflow="hidden"
      >
        <GridItem area="header">
          <ViewerBar
            isLive={isLive}
            songId={currentSong?.id}
            onLeft={onLeft}
            onRight={onRight}
            onMenuClick={() => setMobileMenuOpen(true)}
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
        </GridItem>
        <GridItem
          area="aside"
          padding="10px"
          h="100%"
          display="flex"
          flexDirection="column"
          hideBelow="lg"
        >
          <div style={{ height: "100%", width: "100%" }}>
            <DirectorSidePanels
              songs={songs}
              book={book}
              isLoading={isLoading}
              isBookLoading={book === undefined}
              isAdding={addToBook.isPending}
              selectedListSong={selectedListSong}
              selectedBookSong={selectedBookSong}
              onListClick={listClick}
              onBookClick={bookClick}
              onAddToBook={(song) => {
                // Evita duplicar la escritura si el click llega dos veces
                // antes de que se refleje el book actualizado.
                if (!addToBook.isPending) addToBook.mutate(song);
              }}
              onRemoveFromBook={(id) => removeFromBook.mutate(id)}
            />
          </div>
        </GridItem>
        <GridItem area="viewer" h="100%" overflow="hidden" padding="10px">
          <SongViewer />
        </GridItem>
      </Grid>

      <Drawer.Root
        open={mobileMenuOpen}
        placement="start"
        size="xs"
        onOpenChange={(e) => setMobileMenuOpen(e.open)}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content height="100%" background="var(--bg-panel)">
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
              <div style={{ height: "100%", padding: "60px 10px 10px" }}>
                <DirectorSidePanels
                  songs={songs}
                  book={book}
                  isLoading={isLoading}
                  isBookLoading={book === undefined}
                  isAdding={addToBook.isPending}
                  selectedListSong={selectedListSong}
                  selectedBookSong={selectedBookSong}
                  onListClick={listClick}
                  onBookClick={bookClick}
                  onAddToBook={(song) => {
                    if (!addToBook.isPending) addToBook.mutate(song);
                  }}
                  onRemoveFromBook={(id) => removeFromBook.mutate(id)}
                />
              </div>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </DirectorContext.Provider>
  );
};

export default DirectorPage;
