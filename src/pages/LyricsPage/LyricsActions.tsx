import {
  Box,
  Grid,
  HStack,
  IconButton,
  Menu,
  NativeSelect,
  Portal,
} from "@chakra-ui/react";
import { IoMdCheckmark } from "react-icons/io";
import {
  MdAnimation,
  MdFontDownload,
  MdFullscreen,
  MdFullscreenExit,
  MdOutlineTextDecrease,
  MdOutlineTextIncrease,
  MdPalette,
  MdWallpaper,
} from "react-icons/md";
import { BACKGROUNDS } from "@/components/LyricViewer/backgrounds";
import type {
  LyricMode,
  LyricTransition,
} from "@/components/LyricViewer/LyricViewer";
import {
  BACKGROUND_COLORS,
  DEFAULT_BACKGROUND_COLORS,
  LYRIC_FONTS,
  LYRIC_MODES,
  LYRIC_TRANSITIONS,
} from "./lyricsPageConstants";

interface Props {
  mode: {
    value: LyricMode;
    setValue: (value: LyricMode) => void;
  };
  transition: {
    value: LyricTransition;
    setValue: (value: LyricTransition) => void;
  };
  fullscreen: {
    value: boolean;
    setValue: (value: boolean) => void;
  };
  font: {
    increase: () => void;
    decrease: () => void;
    canIncrease: boolean;
    canDecrease: boolean;
    family: string;
    setFamily: (value: string) => void;
  };
  background: {
    type: string;
    setType: (value: string) => void;
    color: string;
    setColor: (value: string) => void;
  };
}

const LyricsActions = ({
  mode,
  transition,
  fullscreen,
  font,
  background,
}: Props) => (
  // Columnas laterales 1fr: con ancho por contenido quedan iguales, así el
  // botón de pantalla completa cae justo en el centro.
  <Grid templateColumns="1fr auto 1fr" gap="8px" justifySelf="center">
    <HStack gap="8px" justifySelf="end">
      <NativeSelect.Root size="sm" width="auto">
        <NativeSelect.Field
          aria-label="Modo de letra"
          value={mode.value}
          onChange={(e) => mode.setValue(e.target.value as LyricMode)}
        >
          {LYRIC_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <IconButton
        aria-label="Disminuir tamaño de letra"
        variant="outline"
        size="sm"
        onClick={font.decrease}
        disabled={!font.canDecrease}
      >
        <MdOutlineTextDecrease />
      </IconButton>
      <IconButton
        aria-label="Aumentar tamaño de letra"
        variant="outline"
        size="sm"
        onClick={font.increase}
        disabled={!font.canIncrease}
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
                value={font.family}
                onValueChange={(e) => font.setFamily(e.value)}
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
          <IconButton aria-label="Transición" variant="outline" size="sm">
            <MdAnimation />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.RadioItemGroup
                value={transition.value}
                onValueChange={(e) =>
                  transition.setValue(e.value as LyricTransition)
                }
              >
                {LYRIC_TRANSITIONS.map((t) => (
                  <Menu.RadioItem key={t.value} value={t.value}>
                    {t.label}
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
    <IconButton
      aria-label={
        fullscreen.value ? "Salir de pantalla completa" : "Pantalla completa"
      }
      variant="outline"
      // !important: si no, el hover del navbar lo pisa
      css={{ borderColor: "var(--danger) !important" }}
      size="sm"
      onClick={() => fullscreen.setValue(!fullscreen.value)}
    >
      {fullscreen.value ? <MdFullscreenExit /> : <MdFullscreen />}
    </IconButton>
    <HStack gap="8px" justifySelf="start">
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
                value={background.type}
                onValueChange={(e) => {
                  background.setType(e.value);
                  background.setColor(
                    DEFAULT_BACKGROUND_COLORS[e.value] ??
                      BACKGROUND_COLORS[0].value,
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
          <IconButton
            aria-label="Color del fondo"
            variant="outline"
            size="sm"
            disabled={
              !BACKGROUNDS.find((b) => b.value === background.type)?.usesColor
            }
          >
            <MdPalette />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.RadioItemGroup
                value={background.color}
                onValueChange={(e) => background.setColor(e.value)}
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
  </Grid>
);

export default LyricsActions;
