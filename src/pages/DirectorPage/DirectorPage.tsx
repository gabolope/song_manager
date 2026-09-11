import { Drawer, Grid, GridItem, Portal } from "@chakra-ui/react";
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
    liveSong,
    setLiveSong,
    clearLiveSong,
    selectedBookSong,
    setSelectedBookSong,
    isLive,
    setIsLive,
    getTranspose,
    setSongTranspose,
  } = useSession();

  const { addToBook, removeFromBook, reorderBook, setTranspose } =
    useBookMutations(book);

  const [selectedListSong, setSelectedListSong] = useState<number | null>(null);
  // Pantalla completa es local a esta pestaña, no se comparte con Player.
  const [fullscreen, setFullscreen] = useState(false);
  // En mobile, la lista/book viven en un Drawer en vez del aside fijo.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const baseSong =
    selectedListSong !== null
      ? songs?.[selectedListSong]
      : selectedBookSong !== null
        ? book?.[selectedBookSong]
        : null;

  // Si la canción viene del book, su transposición ya viaja persistida en su
  // propio documento de Firestore (ver useBookMutations.setTranspose), así
  // que dura para toda la sesión (sobrevive recargas) sin tocar "songs". Si
  // es una vista previa del repertorio (todavía no está en el book), no hay
  // dónde persistirla: se usa el mapa en memoria de la sesión nada más para
  // ese caso. Memoizado por la misma razón que directorContextValue más
  // abajo: un objeto nuevo en cada render rompería la estabilidad de
  // exitFullscreen en SongViewer.
  const isBookSong = selectedBookSong !== null;
  const localTranspose = getTranspose(baseSong?.id);
  const currentSong = useMemo(() => {
    if (!baseSong) return baseSong;
    if (isBookSong) return baseSong;
    return { ...baseSong, transpose: localTranspose };
  }, [baseSong, isBookSong, localTranspose]);

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

  // Cambia la transposición de la canción actual: se persiste en el book si
  // la canción pertenece a la sesión, o solo en memoria si es una vista
  // previa del repertorio. Si además está en vivo, se retransmite de
  // inmediato para que los músicos vean el mismo tono sin esperar a la
  // próxima navegación.
  const onTransposeChange = useCallback(
    (delta: number) => {
      if (!currentSong) return;
      const next = Math.max(
        -11,
        Math.min(11, (currentSong.transpose ?? 0) + delta),
      );
      if (isBookSong) {
        setTranspose.mutate({ id: currentSong.id, value: next });
      } else {
        setSongTranspose(currentSong.id, next);
      }
      if (isLive && liveSong.data?.id === currentSong.id) {
        setLiveSong.mutate({ ...currentSong, transpose: next });
      }
    },
    [
      currentSong,
      isBookSong,
      setTranspose,
      setSongTranspose,
      isLive,
      liveSong.data,
      setLiveSong,
    ],
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
      onTransposeChange,
    }),
    [
      currentSong,
      selectedListSong,
      listClick,
      bookClick,
      onLeft,
      onRight,
      fullscreen,
      onTransposeChange,
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
              onReorderBook={(items) => reorderBook.mutate(items)}
            />
          </div>
        </GridItem>
        <GridItem area="viewer" h="100%" overflow="hidden" paddingTop="10px">
          <SongViewer />
        </GridItem>
      </Grid>

      <Drawer.Root
        open={mobileMenuOpen}
        placement="start"
        size="xs"
        onOpenChange={(e) => setMobileMenuOpen(e.open)}
        lazyMount={false}
        unmountOnExit={false}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content height="100%" background="var(--bg-panel)">
              <div style={{ height: "100%", padding: "10px" }}>
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
                  onReorderBook={(items) => reorderBook.mutate(items)}
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
