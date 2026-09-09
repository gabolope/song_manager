import {
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useEditSong } from "@/hooks/useEditSong";
import type { SongDTO, SongTipo } from "@/types/song";
import {
  parseChordProBody,
  serializeChordProBody,
  type EditorSection,
} from "@/utils/chordProBody";
import { TIPO_LABEL } from "@/utils/song";
import SongBodyEditor from "./SongBodyEditor";

interface Props {
  song: SongDTO | null;
  onOpenChange: (open: boolean) => void;
}

const TIPOS = Object.keys(TIPO_LABEL) as SongTipo[];

const EditSongDialog = ({ song, onOpenChange }: Props) => {
  const { editSong, isPending } = useEditSong();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [tipo, setTipo] = useState<SongTipo | "">("");
  const [tempo, setTempo] = useState("");
  const [header, setHeader] = useState("");
  const [sections, setSections] = useState<EditorSection[]>([]);

  // El diálogo se reutiliza para editar canciones distintas: cada vez que
  // cambia la canción (o se abre) se recarga el formulario con sus datos.
  // El contenido ChordPro se descompone en secciones/líneas/acordes editables
  // para que se pueda editar en el mismo formato visual del SongViewer.
  useEffect(() => {
    if (!song) return;
    setTitle(song.title ?? "");
    setArtist(song.artist ?? "");
    setKey(song.key ?? "");
    setTipo(song.tipo ?? "");
    setTempo(song.tempo !== undefined ? String(song.tempo) : "");
    const { header, sections } = parseChordProBody(song.content ?? "");
    setHeader(header);
    setSections(sections);
  }, [song]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;

    const parsedTempo = tempo.trim() ? Number(tempo) : undefined;

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
            maxHeight="85vh"
            overflowY="auto"
            minW={{ base: "auto", md: "560px" }}
          >
            <Dialog.Header>
              <Dialog.Title>Editar canción</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="edit-song-form" onSubmit={handleSubmit}>
                <Stack gap={3} align="stretch">
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
                    <Field.Label>Tono</Field.Label>
                    <Input value={key} onChange={(e) => setKey(e.target.value)} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Tipo</Field.Label>
                    <ButtonGroup attached>
                      {TIPOS.map((t) => (
                        <Button
                          key={t}
                          type="button"
                          size="sm"
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
                  <Field.Root>
                    <Field.Label>Letra y acordes</Field.Label>
                    <SongBodyEditor sections={sections} onChange={setSections} />
                  </Field.Root>
                </Stack>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button type="submit" form="edit-song-form" loading={isPending}>
                Guardar cambios
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
