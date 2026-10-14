import {
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Flex,
  HStack,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoAdd } from "react-icons/io5";
import SongUploader from "@/components/Configuration/SongUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useSongUpload } from "@/hooks/onSongUpload";
import { chordsOverWordsToChordPro } from "@/services/chordpro.service";
import type { SongIdioma, SongTipo } from "@/types/song";
import { IDIOMA_LABEL, TIPO_COLOR, TIPO_LABEL } from "@/utils/song";

type Mode = "chords" | "chordpro" | "file";

const TIPOS = Object.keys(TIPO_LABEL) as SongTipo[];
const IDIOMAS = Object.keys(IDIOMA_LABEL) as SongIdioma[];

// Alta de una canción al repertorio desde el panel. Lo pegado se convierte a
// un archivo y pasa por la misma subida que los .chordpro (useSongUpload),
// así comparte la extracción de metadatos y el chequeo de títulos repetidos.
const AddSongDialog = () => {
  const { isAdmin, isDemo } = useAuth();
  const { mutate: uploadSongs, isPending } = useSongUpload();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chords");
  const [title, setTitle] = useState("");
  const [key, setKey] = useState("");
  const [text, setText] = useState("");
  const [artist, setArtist] = useState("");
  const [tipo, setTipo] = useState<SongTipo | "">("");
  const [tempo, setTempo] = useState("");
  // Vacío = se detecta de la letra al subir (detectIdioma).
  const [idioma, setIdioma] = useState<SongIdioma | "">("");
  const [genero, setGenero] = useState("");

  if (!isAdmin || isDemo) return null;

  // Título y tono del formulario solo se agregan si el ChordPro no los trae.
  const hasTitle = mode === "chordpro" && /\{(title|t):/i.test(text);
  const hasKey = mode === "chordpro" && /\{(key|k):/i.test(text);
  const canSave = !!text.trim() && (hasTitle || !!title.trim());

  const save = () => {
    const body = mode === "chords" ? chordsOverWordsToChordPro(text) : text;
    const directives = [
      !hasTitle && `{title: ${title.trim()}}`,
      !hasKey && key.trim() && `{key: ${key.trim()}}`,
    ].filter(Boolean);
    const content = [...directives, body].join("\n");
    const parsedTempo = tempo.trim() ? Number(tempo) : undefined;
    uploadSongs(
      {
        files: [new File([content], "nueva.chordpro")],
        extra: {
          artist: artist.trim() || undefined,
          tipo: tipo || undefined,
          tempo:
            parsedTempo !== undefined && !Number.isNaN(parsedTempo)
              ? parsedTempo
              : undefined,
          idioma: idioma || undefined,
          genero: genero.trim() || undefined,
        },
      },
      {
        // Título repetido: no se agrega (lo avisa el toast) y se deja el texto
        // para que se pueda corregir el título sin volver a pegarlo.
        onSuccess: ({ added }) => {
          if (!added) return;
          setTitle("");
          setKey("");
          setText("");
          setArtist("");
          setTipo("");
          setTempo("");
          setIdioma("");
          setGenero("");
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="panelExpandBtn"
          aria-label="Agregar canción"
          title="Agregar canción"
        >
          <IoAdd />
        </button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            width={{ md: "90vw" }}
            maxWidth={{ md: "1100px" }}
            maxHeight="90vh"
            overflowY="auto"
          >
            <Dialog.Header>
              <Dialog.Title>Agregar canción</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Tabs.Root
                value={mode}
                onValueChange={(e) => setMode(e.value as Mode)}
                size="sm"
              >
                <Tabs.List>
                  <Tabs.Trigger value="chords">Acordes</Tabs.Trigger>
                  <Tabs.Trigger value="chordpro">ChordPro</Tabs.Trigger>
                  <Tabs.Trigger value="file">Subir archivo</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="file">
                  <Stack gap={3} align="start">
                    <Text fontSize="sm" color="var(--text-muted)">
                      Archivos .chordpro o .cho (podés elegir varios).
                    </Text>
                    <SongUploader />
                  </Stack>
                </Tabs.Content>
              </Tabs.Root>
              {mode !== "file" && (
                <Flex
                  gap={6}
                  mt={4}
                  align="stretch"
                  direction={{ base: "column", md: "row" }}
                >
                  <Stack gap={3} width={{ md: "300px" }} flexShrink={0}>
                    <Field.Root required={!hasTitle}>
                      <Field.Label>Título</Field.Label>
                      <Input
                        size="sm"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={hasTitle ? "Lo toma del {title:}" : ""}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Artista</Field.Label>
                      <Input
                        size="sm"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                      />
                    </Field.Root>
                    <HStack gap={3} align="start">
                      <Field.Root flex={1}>
                        <Field.Label>Tempo (BPM)</Field.Label>
                        <Input
                          size="sm"
                          type="number"
                          value={tempo}
                          onChange={(e) => setTempo(e.target.value)}
                        />
                      </Field.Root>
                      <Field.Root flex={1}>
                        <Field.Label>Tono</Field.Label>
                        <Input
                          size="sm"
                          value={key}
                          onChange={(e) => setKey(e.target.value)}
                          placeholder={hasKey ? "{key:}" : "Ej: G"}
                        />
                      </Field.Root>
                    </HStack>
                    <Field.Root>
                      <Field.Label>Género</Field.Label>
                      <Input
                        size="sm"
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Idioma</Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field
                          value={idioma}
                          onChange={(e) =>
                            setIdioma(e.target.value as SongIdioma | "")
                          }
                        >
                          <option value="">Detectar de la letra</option>
                          {IDIOMAS.map((i) => (
                            <option key={i} value={i}>
                              {IDIOMA_LABEL[i]}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Tipo</Field.Label>
                      <ButtonGroup attached width="full">
                        {TIPOS.map((t) => (
                          <Button
                            key={t}
                            type="button"
                            size="sm"
                            flex={1}
                            colorPalette={TIPO_COLOR[t]}
                            variant={tipo === t ? "solid" : "outline"}
                            onClick={() => setTipo(tipo === t ? "" : t)}
                          >
                            {TIPO_LABEL[t]}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </Field.Root>
                  </Stack>
                  <Textarea
                    flex={1}
                    minW={0}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={22}
                    fontFamily="mono"
                    fontSize="sm"
                    placeholder={
                      mode === "chords"
                        ? "G              D\nOíd, mortales, el grito sagrado:\nC        D         G\n¡libertad, libertad, libertad!"
                        : "{title: Himno Nacional Argentino}\n{key: G}\n\n[G]Oíd, mortales, el [D]grito sagrado:\n¡[C]libertad, liber[D]tad, liber[G]tad!"
                    }
                  />
                </Flex>
              )}
            </Dialog.Body>
            {mode !== "file" && (
              <Dialog.Footer>
                <Button
                  onClick={save}
                  loading={isPending}
                  disabled={!canSave}
                  bg="var(--accent)"
                  color="var(--accent-contrast)"
                  _hover={{ bg: "var(--accent-hover)" }}
                >
                  Guardar
                </Button>
              </Dialog.Footer>
            )}
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AddSongDialog;
