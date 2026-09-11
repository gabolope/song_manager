import {
  Box,
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useEditSong } from "@/hooks/useEditSong";
import { useUsers } from "@/hooks/useUsers";
import type { SongDTO, SongTipo } from "@/types/song";
import {
  parseChordProBody,
  serializeChordProBody,
  type EditorSection,
} from "@/utils/chordProBody";
import { TIPO_COLOR, TIPO_LABEL } from "@/utils/song";
import SongBodyEditor from "./SongBodyEditor";

interface Props {
  song: SongDTO | null;
  onOpenChange: (open: boolean) => void;
}

const TIPOS = Object.keys(TIPO_LABEL) as SongTipo[];

const EditSongDialog = ({ song, onOpenChange }: Props) => {
  const { editSong, isPending } = useEditSong();
  // Directores: son quienes pueden tener un tono propio para leer la
  // canción (ver DirectorPage/ProtectedRoute, que reservan esa vista a
  // role === "admin").
  const { data: users } = useUsers();
  const directors = useMemo(
    () => users?.filter((u) => u.role === "admin"),
    [users],
  );

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [tipo, setTipo] = useState<SongTipo | "">("");
  const [tempo, setTempo] = useState("");
  const [keysByDirector, setKeysByDirector] = useState<Record<string, string>>(
    {},
  );
  const [header, setHeader] = useState("");
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState("");

  // El diálogo se reutiliza para editar canciones distintas: cada vez que
  // cambia la canción (o se abre) se recarga el formulario con sus datos.
  // El contenido ChordPro se descompone en secciones/líneas/acordes editables
  // para que se pueda editar en el mismo formato visual del SongViewer.
  useEffect(() => {
    if (!song) return;
    const nextTitle = song.title ?? "";
    const nextArtist = song.artist ?? "";
    const nextKey = song.key ?? "";
    const nextTipo = song.tipo ?? "";
    const nextTempo = song.tempo !== undefined ? String(song.tempo) : "";
    const nextKeysByDirector = song.keysByDirector ?? {};
    const { header: nextHeader, sections: nextSections } = parseChordProBody(
      song.content ?? "",
    );
    setTitle(nextTitle);
    setArtist(nextArtist);
    setKey(nextKey);
    setTipo(nextTipo);
    setTempo(nextTempo);
    setKeysByDirector(nextKeysByDirector);
    setHeader(nextHeader);
    setSections(nextSections);
    setInitialSnapshot(
      JSON.stringify({
        title: nextTitle,
        artist: nextArtist,
        key: nextKey,
        tipo: nextTipo,
        tempo: nextTempo,
        keysByDirector: nextKeysByDirector,
        header: nextHeader,
        sections: nextSections,
      }),
    );
  }, [song]);

  const hasChanges = useMemo(
    () =>
      JSON.stringify({
        title,
        artist,
        key,
        tipo,
        tempo,
        keysByDirector,
        header,
        sections,
      }) !== initialSnapshot,
    [
      title,
      artist,
      key,
      tipo,
      tempo,
      keysByDirector,
      header,
      sections,
      initialSnapshot,
    ],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;

    const parsedTempo = tempo.trim() ? Number(tempo) : undefined;
    const cleanedKeysByDirector = Object.fromEntries(
      Object.entries(keysByDirector)
        .map(([uid, k]) => [uid, k.trim()] as const)
        .filter(([, k]) => k !== ""),
    );

    editSong({
      id: song.id,
      data: {
        title: title.trim(),
        artist: artist.trim() || undefined,
        key: key.trim() || undefined,
        tipo: tipo || undefined,
        tempo:
          parsedTempo !== undefined && !Number.isNaN(parsedTempo)
            ? parsedTempo
            : undefined,
        keysByDirector: cleanedKeysByDirector,
        content: serializeChordProBody(header, sections),
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={!!song}
      onOpenChange={(e) => onOpenChange(e.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxHeight={{ base: "85vh", md: "95vh" }}
            height={{ md: "95vh" }}
            overflowY="auto"
            minW={{ base: "auto", md: "560px" }}
            width={{ md: "95vw" }}
            maxWidth={{ md: "95vw" }}
          >
            <Dialog.Header>
              <Dialog.Title>Editar canción</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="edit-song-form" onSubmit={handleSubmit}>
                <Flex gap={6} align="stretch" direction={{ base: "column", md: "row" }}>
                  <Stack gap={3} width={{ md: "25%" }} flexShrink={0}>
                    <Field.Root required>
                      <Field.Label>Título</Field.Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Artista</Field.Label>
                      <Input
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Tono original</Field.Label>
                      <Input
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                      />
                    </Field.Root>
                    {!!directors?.length && (
                      <Stack gap={2}>
                        <Text fontSize="sm" fontWeight="500">
                          Tono por director
                        </Text>
                        {directors.map((director) => (
                          <Field.Root key={director.uid}>
                            <Field.Label fontSize="xs" fontWeight="normal">
                              {director.displayName}
                            </Field.Label>
                            <Input
                              size="sm"
                              placeholder={key || "Tono original"}
                              value={keysByDirector[director.uid] ?? ""}
                              onChange={(e) =>
                                setKeysByDirector((prev) => ({
                                  ...prev,
                                  [director.uid]: e.target.value,
                                }))
                              }
                            />
                          </Field.Root>
                        ))}
                      </Stack>
                    )}
                    <Field.Root>
                      <Field.Label>Tipo</Field.Label>
                      <ButtonGroup attached>
                        {TIPOS.map((t) => (
                          <Button
                            key={t}
                            type="button"
                            size="sm"
                            colorPalette={TIPO_COLOR[t]}
                            variant={tipo === t ? "solid" : "outline"}
                            onClick={() => setTipo(tipo === t ? "" : t)}
                          >
                            {TIPO_LABEL[t]}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Tempo (BPM)</Field.Label>
                      <Input
                        type="number"
                        value={tempo}
                        onChange={(e) => setTempo(e.target.value)}
                      />
                    </Field.Root>
                  </Stack>
                  <Box flex={1} minW={0}>
                    <Field.Root>
                      <Field.Label>Letra y acordes</Field.Label>
                      <SongBodyEditor sections={sections} onChange={setSections} />
                    </Field.Root>
                  </Box>
                </Flex>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                type="submit"
                form="edit-song-form"
                loading={isPending}
                disabled={!hasChanges}
                bg="var(--accent)"
                color="var(--accent-contrast)"
                _hover={{ bg: "var(--accent-hover)" }}
              >
                {hasChanges ? "Guardar cambios" : "Sin cambios"}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default EditSongDialog;
