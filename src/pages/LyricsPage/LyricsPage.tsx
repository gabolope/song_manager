import { Badge, Box, Grid, GridItem, HStack, IconButton, Menu, Portal, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import {
  MdFontDownload,
  MdFullscreen,
  MdFullscreenExit,
  MdOutlineSensors,
  MdOutlineTextDecrease,
  MdOutlineTextIncrease,
  MdPalette,
  MdWallpaper,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import LyricViewer from "@/components/LyricViewer/LyricViewer";
import { BACKGROUNDS } from "@/components/LyricViewer/backgrounds";
import Configuration from "@/components/Configuration/Configuration";
import UserBadge from "@/components/UserBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useSongFontSize } from "@/hooks/useSongFontSize";
import { BACKGROUND_COLORS, DEFAULT_BACKGROUND_COLORS, LYRIC_FONTS } from "./lyricsPageConstants";

const noop = () => {};

const LyricsPage = () => {
  const { liveSong } = useSession();
  const navigate = useNavigate();
  const { user } = useAuth();
  const song = liveSong.data;

  // Preferencia de lectura por dispositivo, separada del tamaño de letra del
  // SongViewer (namespace propio en localStorage) porque acá la base de
  // tamaño es otra (una sola línea gigante, no un cuerpo de canción).
  const {
    scale: fontScale,
    increase: increaseFontSize,
    decrease: decreaseFontSize,
    canIncrease: canIncreaseFontSize,
    canDecrease: canDecreaseFontSize,
  } = useSongFontSize(user ? `${user.uid}-lyrics` : undefined);
  const [fontFamily, setFontFamily] = useState(LYRIC_FONTS[0].value);
  const [backgroundType, setBackgroundType] = useState(BACKGROUNDS[0].value);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLORS[BACKGROUNDS[0].value] ?? BACKGROUND_COLORS[0].value,
  );
  const ActiveBackground = BACKGROUNDS.find((b) => b.value === backgroundType)?.Component;

  // Pantalla completa es local a esta pestaña, igual que en Player/Director;
  // acá no hay noción de "director" ni de terminar la sesión en vivo, así
  // que esos dos parámetros del hook son no-ops.
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
        transform={fullscreen && !navbarVisible ? "translateY(-100%)" : "translateY(0)"}
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
            <IconButton
              aria-label="Volver"
              variant="outline"
              size="sm"
              onClick={() => navigate("/player")}
            >
              <IoArrowBack />
            </IconButton>
            <Text fontWeight="700" fontSize="1.05rem" className="hideOnNarrow">
              Modo Lyrics
            </Text>
            <Badge
              colorPalette={song ? "red" : "gray"}
              variant={song ? "solid" : "subtle"}
            >
              <MdOutlineSensors />
              {song ? "Sesión en vivo" : "Sin sesión en vivo"}
            </Badge>
          </HStack>
          <HStack gap="8px" justifySelf="center">
            <IconButton
              aria-label="Disminuir tamaño de letra"
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={!canDecreaseFontSize}
            >
              <MdOutlineTextDecrease />
            </IconButton>
            <IconButton
              aria-label="Aumentar tamaño de letra"
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={!canIncreaseFontSize}
            >
              <MdOutlineTextIncrease />
            </IconButton>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton aria-label="Cambiar fuente" variant="outline" size="sm">
                  <MdFontDownload />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content maxHeight="60vh" overflowY="auto">
                    <Menu.RadioItemGroup
                      value={fontFamily}
                      onValueChange={(e) => setFontFamily(e.value)}
                    >
                      {LYRIC_FONTS.map((f) => (
                        <Menu.RadioItem
                          key={f.value}
                          value={f.value}
                          style={{ fontFamily: f.value }}
                        >
                          {f.label}
                          <Menu.ItemIndicator>
                            <IoMdCheckmark />
                          </Menu.ItemIndicator>
                        </Menu.RadioItem>
                      ))}
                    </Menu.RadioItemGroup>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton aria-label="Cambiar fondo" variant="outline" size="sm">
                  <MdWallpaper />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.RadioItemGroup
                      value={backgroundType}
                      onValueChange={(e) => {
                        setBackgroundType(e.value);
                        setBackgroundColor(
                          DEFAULT_BACKGROUND_COLORS[e.value] ?? BACKGROUND_COLORS[0].value,
                        );
                      }}
                    >
                      {BACKGROUNDS.map((b) => (
                        <Menu.RadioItem key={b.value} value={b.value}>
                          {b.label}
                          <Menu.ItemIndicator>
                            <IoMdCheckmark />
                          </Menu.ItemIndicator>
                        </Menu.RadioItem>
                      ))}
                    </Menu.RadioItemGroup>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton aria-label="Color del fondo" variant="outline" size="sm">
                  <MdPalette />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.RadioItemGroup
                      value={backgroundColor}
                      onValueChange={(e) => setBackgroundColor(e.value)}
                    >
                      {BACKGROUND_COLORS.map((c) => (
                        <Menu.RadioItem key={c.value} value={c.value}>
                          <HStack gap="8px">
                            <Box
                              w="14px"
                              h="14px"
                              borderRadius="full"
                              background={c.value}
                              border="1px solid var(--border-strong)"
                            />
                            {c.label}
                          </HStack>
                          <Menu.ItemIndicator>
                            <IoMdCheckmark />
                          </Menu.ItemIndicator>
                        </Menu.RadioItem>
                      ))}
                    </Menu.RadioItemGroup>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>
          <HStack gap="8px" justifySelf="end">
            <UserBadge />
            <IconButton
              aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
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
          <LyricViewer song={song} fontScale={fontScale} fontFamily={fontFamily} />
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
