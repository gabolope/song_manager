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
import SongViewer from "@/components/SongViewer/SongViewer";
import UserBadge from "@/components/UserBadge";
import PlayerContext from "@/contexts/PlayerContext";
import { useSession } from "@/contexts/SessionContext";
import { useBookNavigation } from "@/hooks/useBookNavigation";

const PlayerPage = () => {
  const {
    book,
    liveSong,
    selectedBookSong,
    setSelectedBookSong,
    localSong,
    setLocalSong,
  } = useSession();

  // Pantalla completa es local a esta pestaña, no se comparte con Director.
  const [fullscreen, setFullscreen] = useState(false);
  // En mobile, el book se accede desde un Drawer en vez de un panel fijo.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayedSong = localSong ?? liveSong.data;

  const onBookNavigate = useCallback(
    (index: number) => {
      setSelectedBookSong(index);
      if (book) setLocalSong(book[index]);
      setMobileMenuOpen(false);
    },
    [book, setSelectedBookSong, setLocalSong],
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
    () => ({ displayedSong, onLeft, onRight, fullscreen, setFullscreen }),
    [displayedSong, onLeft, onRight, fullscreen],
  );

  return (
    <PlayerContext.Provider value={playerContextValue}>
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
            paddingY="10px"
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
              <Text fontWeight="700" fontSize="1.05rem" className="hideOnNarrow">
                Song Manager
              </Text>
              <Badge colorPalette="green" variant="subtle">
                Músico
              </Badge>
              <Badge
                colorPalette={liveSong.data ? "red" : "gray"}
                variant={liveSong.data ? "solid" : "subtle"}
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
              <Configuration height={10} />
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
          <BookList
            items={book}
            isLoading={book === undefined}
            selected={selectedBookSong}
            onClick={onBookNavigate}
          />
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
                <BookList
                  items={book}
                  isLoading={book === undefined}
                  selected={selectedBookSong}
                  onClick={onBookNavigate}
                />
              </div>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </PlayerContext.Provider>
  );
};

export default PlayerPage;
