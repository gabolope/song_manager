import {
  Badge,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  MdFullscreen,
  MdFullscreenExit,
  MdOutlineSensors,
} from "react-icons/md";
import LyricViewer, {
  type LyricMode,
} from "@/components/LyricViewer/LyricViewer";
import { BACKGROUNDS } from "@/components/LyricViewer/backgrounds";
import Configuration from "@/components/Configuration/Configuration";
import UserBadge from "@/components/UserBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useSongFontSize } from "@/hooks/useSongFontSize";
import {
  BACKGROUND_COLORS,
  DEFAULT_BACKGROUND_COLORS,
  LYRIC_FONTS,
} from "./lyricsPageConstants";
import LyricsActions from "./LyricsActions";

const noop = () => {};

const LyricsPage = () => {
  const { liveSong } = useSession();
  const { user } = useAuth();
  const song = liveSong.data;

  // Preferencia de lectura por dispositivo, separada del tamaño de letra del
  // SongViewer (namespace propio en localStorage) porque acá la base de
  // tamaño es otra (una sola línea gigante, no un cuerpo de canción).
  const fontSize = useSongFontSize(user ? `${user.uid}-lyrics` : undefined);
  // La letra se ajusta sola al espacio: si ya se achicó, agrandar no hace nada.
  const [lyricsShrunk, setLyricsShrunk] = useState(false);
  const [mode, setMode] = useState<LyricMode>("line");
  const [fontFamily, setFontFamily] = useState(LYRIC_FONTS[0].value);
  const [backgroundType, setBackgroundType] = useState(BACKGROUNDS[0].value);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLORS[BACKGROUNDS[0].value] ??
      BACKGROUND_COLORS[0].value,
  );
  const ActiveBackground = BACKGROUNDS.find(
    (b) => b.value === backgroundType,
  )?.Component;

  const [fullscreen, setFullscreen] = useState(false);
  const { viewerRef, usesFullscreenFallback } = useFullscreen(
    fullscreen,
    setFullscreen,
    false,
    noop,
    noop,
  );

  // En pantalla completa la navbar se oculta y solo reaparece acercando el
  // mouse al borde superior, como un overlay de reproductor de video.
  const [navbarVisible, setNavbarVisible] = useState(true);
  useEffect(() => {
    if (!fullscreen) {
      setNavbarVisible(true);
      return;
    }
    setNavbarVisible(false);
    const onMouseMove = (e: MouseEvent) => setNavbarVisible(e.clientY < 60);
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [fullscreen]);

  return (
    <Grid
      ref={viewerRef}
      templateRows="auto 1fr"
      h="100vh"
      w="100vw"
      overflow="hidden"
      background="var(--bg)"
      position={usesFullscreenFallback ? "fixed" : "relative"}
      inset={usesFullscreenFallback ? 0 : undefined}
    >
      {ActiveBackground && <ActiveBackground color={backgroundColor} />}
      <GridItem
        gridRow={1}
        position={fullscreen ? "fixed" : "static"}
        top={0}
        left={0}
        right={0}
        zIndex={10}
        transform={
          fullscreen && !navbarVisible ? "translateY(-100%)" : "translateY(0)"
        }
        opacity={fullscreen && !navbarVisible ? 0 : 1}
        pointerEvents={fullscreen && !navbarVisible ? "none" : "auto"}
        transition="transform 0.2s ease, opacity 0.2s ease"
      >
        <Grid
          templateColumns="1fr auto 1fr"
          alignItems="center"
          paddingX={{ base: "8px", sm: "16px" }}
          paddingY="6px"
          borderBottom="1px solid var(--border)"
          background="var(--bg-panel)"
          gap="6px"
        >
          <HStack gap="10px">
            <Badge
              colorPalette={song ? "red" : "gray"}
              variant={song ? "solid" : "subtle"}
            >
              <MdOutlineSensors />
              {song ? "Sesión en vivo" : "Sin sesión en vivo"}
            </Badge>
          </HStack>
          <LyricsActions
            mode={{ value: mode, setValue: setMode }}
            font={{
              ...fontSize,
              canIncrease: fontSize.canIncrease && !(song && lyricsShrunk),
              family: fontFamily,
              setFamily: setFontFamily,
            }}
            background={{
              type: backgroundType,
              setType: setBackgroundType,
              color: backgroundColor,
              setColor: setBackgroundColor,
            }}
          />
          <HStack gap="8px" justifySelf="end">
            <UserBadge />
            <IconButton
              aria-label={
                fullscreen ? "Salir de pantalla completa" : "Pantalla completa"
              }
              variant="outline"
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
            </IconButton>
            {!fullscreen && <Configuration height={8} />}
          </HStack>
        </Grid>
      </GridItem>
      <GridItem gridRow={2} overflow="hidden" position="relative" zIndex={1}>
        {song ? (
          <LyricViewer
            song={song}
            fontScale={fontSize.scale}
            fontFamily={fontFamily}
            mode={mode}
            onShrinkChange={setLyricsShrunk}
          />
        ) : (
          <HStack h="100%" justify="center" color="var(--text-muted)">
            <Text>Sin sesión en vivo</Text>
          </HStack>
        )}
      </GridItem>
    </Grid>
  );
};

export default LyricsPage;
