import {
  Badge,
  Button,
  CloseButton,
  Drawer,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { MdFullscreen, MdOutlineSensors } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import BookList from "@/components/SongList/BookList";
import Configuration from "@/components/Configuration/Configuration";
import BroadcastMessage from "@/components/BroadcastMessage";
import SongViewer from "@/components/SongViewer/SongViewer";
import UserBadge from "@/components/UserBadge";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useAuth } from "@/contexts/AuthContext";
import PlayerContext from "@/contexts/PlayerContext";
import { useSession } from "@/contexts/SessionContext";
import { useBookMutations } from "@/hooks/useBookMutations";
import { useBookNavigation } from "@/hooks/useBookNavigation";
import useSongs from "@/hooks/useSongs";
import DirectorSidePanels from "@/pages/DirectorPage/DirectorSidePanels";

const PlayerPage = () => {
  const {
    book,
    liveSong,
    selectedBookSong,
    setSelectedBookSong,
    localSong,
    setLocalSong,
    getTranspose,
    setSongTranspose,
  } = useSession();

  // Pantalla completa es local a esta pestaña, no se comparte con Director.
  const [fullscreen, setFullscreen] = useState(false);
  // En mobile, el book se accede desde un Drawer en vez de un panel fijo.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAdmin } = useAuth();
  // Un admin que eligió no dirigir conserva todo lo del Director (repertorio,
  // armar la sesión, editar, transportar) salvo publicar el vivo. A los
  // músicos no les hace falta el repertorio: no se pide.
  const { data: songs, isLoading: isSongsLoading } = useSongs(isAdmin);
  const { addToBook, removeFromBook, reorderBook, setTranspose } =
    useBookMutations(book);

  // localSong es una copia tomada al navegar: se resuelve contra el book
  // (que escucha Firestore) para que una edición o un cambio de tono se vea
  // al instante. Si no está en el book es una vista previa del repertorio:
  // igual que en DirectorPage, su tono vive solo en memoria de la sesión.
  const bookSong = localSong && book?.find((s) => s.id === localSong.id);
  const previewTranspose = getTranspose(localSong?.id);
  const displayedSong = useMemo(() => {
    if (bookSong) return bookSong;
    if (localSong) return { ...localSong, transpose: previewTranspose };
    return liveSong.data;
  }, [bookSong, localSong, previewTranspose, liveSong.data]);

  const selectedListSong =
    localSong && !bookSong
      ? (songs?.findIndex((s) => s.id === localSong.id) ?? -1)
      : -1;

  // Se persiste en el book, así que llega a todos (los Players leen del
  // book). No se re-publica liveSong: eso queda reservado a quien dirige.
  const onTransposeChange = useCallback(
    (delta: number) => {
      if (!displayedSong) return;
      const next = Math.max(
        -11,
        Math.min(11, (displayedSong.transpose ?? 0) + delta),
      );
      if (bookSong) setTranspose.mutate({ id: displayedSong.id, value: next });
      else setSongTranspose(displayedSong.id, next);
    },
    [displayedSong, bookSong, setTranspose, setSongTranspose],
  );
  const logoSrc = useColorModeValue("/logo_black.svg", "/logo_white.svg");

  const onBookNavigate = useCallback(
    (index: number) => {
      setSelectedBookSong(index);
      if (book) setLocalSong(book[index]);
      setMobileMenuOpen(false);
    },
    [book, setSelectedBookSong, setLocalSong],
  );

  const onListClick = useCallback(
    (index: number) => {
      setSelectedBookSong(null);
      if (songs) setLocalSong(songs[index]);
      setMobileMenuOpen(false);
    },
    [songs, setSelectedBookSong, setLocalSong],
  );

  const renderSidePanel = () =>
    isAdmin ? (
      <DirectorSidePanels
        songs={songs}
        book={book}
        isLoading={isSongsLoading}
        isBookLoading={book === undefined}
        isAdding={addToBook.isPending}
        selectedListSong={selectedListSong === -1 ? null : selectedListSong}
        selectedBookSong={selectedBookSong}
        onListClick={onListClick}
        onBookClick={onBookNavigate}
        onAddToBook={(song) => {
          if (!addToBook.isPending) addToBook.mutate(song);
        }}
        onRemoveFromBook={(id) => removeFromBook.mutate(id)}
        onReorderBook={(items) => reorderBook.mutate(items)}
      />
    ) : (
      <BookList
        items={book}
        isLoading={book === undefined}
        selected={selectedBookSong}
        onClick={onBookNavigate}
      />
    );

  const { onLeft, onRight } = useBookNavigation(
    book,
    false,
    displayedSong,
    onBookNavigate,
  );

  // Memoizado por la misma razón que en DirectorPage: un objeto nuevo en
  // cada render rompe la estabilidad de exitFullscreen en SongViewer y hace
  // que el pedido de pantalla completa se repita sin gesto de usuario.
  const playerContextValue = useMemo(
    () => ({
      displayedSong,
      onLeft,
      onRight,
      fullscreen,
      setFullscreen,
      onTransposeChange: isAdmin ? onTransposeChange : undefined,
    }),
    [displayedSong, onLeft, onRight, fullscreen, isAdmin, onTransposeChange],
  );

  return (
    <PlayerContext.Provider value={playerContextValue}>
      <BroadcastMessage />
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
          <HStack
            justify="space-between"
            paddingX={{ base: "8px", sm: "16px" }}
            paddingY="6px"
            borderBottom="1px solid var(--border)"
            background="var(--bg-panel)"
            gap="6px"
          >
            <HStack gap="10px">
              <IconButton
                aria-label="Abrir sesión"
                variant="outline"
                size="sm"
                hideFrom="lg"
                onClick={() => setMobileMenuOpen(true)}
              >
                <RxHamburgerMenu />
              </IconButton>
              <img
                src={logoSrc}
                alt=""
                className="hideBelowDesktop"
                style={{ height: 24, width: 24 }}
              />
              <Text
                fontWeight="700"
                fontSize="1.05rem"
                className="hideBelowDesktop"
              >
                Song Manager
              </Text>
              <Badge colorPalette="green" variant="subtle">
                Músico
              </Badge>
              <Badge
                colorPalette={liveSong.data ? "red" : "gray"}
                variant={liveSong.data ? "solid" : "subtle"}
                onClick={() => setFullscreen(!fullscreen)}
              >
                <MdOutlineSensors />
                {liveSong.data ? "Sesión en vivo" : "Sin sesión en vivo"}
              </Badge>
            </HStack>
            <HStack gap="8px">
              <UserBadge />
              <Button
                onClick={() => setFullscreen(!fullscreen)}
                variant="outline"
                size="sm"
              >
                <MdFullscreen />
                <span className="hideOnNarrow">Pantalla completa</span>
              </Button>
              <Configuration />
            </HStack>
          </HStack>
        </GridItem>
        <GridItem
          area="aside"
          padding="10px"
          h="100%"
          display="flex"
          flexDirection="column"
          hideBelow="lg"
        >
          {renderSidePanel()}
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
        lazyMount={false}
        unmountOnExit={false}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content height="100%" background="var(--bg-panel)">
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
              <div style={{ height: "100%", padding: "60px 10px 10px" }}>
                {renderSidePanel()}
              </div>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </PlayerContext.Provider>
  );
};

export default PlayerPage;
