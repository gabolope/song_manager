import {
  Badge,
  Button,
  CloseButton,
  Drawer,
  HStack,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { MdFullscreen } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import BookList from "../components/BookList";
import Configuration from "../components/Configuration";
import SongViewer from "../components/SongViewer";
import { ColorModeButton } from "../components/ui/color-mode";
import PlayerContext from "../contexts/PlayerContext";
import { useSession } from "../contexts/SessionContext";
import { useBookNavigation } from "../hooks/useBookNavigation";

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
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
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
              aria-label="Abrir book"
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
          </HStack>
          <HStack gap="8px">
            <Button
              onClick={() => setFullscreen(!fullscreen)}
              variant="outline"
              size="sm"
            >
              <MdFullscreen />
              <span className="hideOnNarrow">Pantalla completa</span>
            </Button>
            <Configuration height={10} />
            <ColorModeButton />
          </HStack>
        </HStack>
        <div style={{ flex: 1, padding: "10px", minHeight: 0, display: "flex" }}>
          <SongViewer />
        </div>
      </div>

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
                <BookList
                  items={book}
                  selected={selectedBookSong}
                  onClick={onBookNavigate}
                  title="Book"
                  emptyMessage="El director todavía no armó el book."
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
