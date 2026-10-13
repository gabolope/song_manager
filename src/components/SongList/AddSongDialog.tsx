import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
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

type Mode = "chords" | "chordpro" | "file";

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
    uploadSongs([new File([content], "nueva.chordpro")], {
      // Título repetido: no se agrega (lo avisa el toast) y se deja el texto
      // para que se pueda corregir el título sin volver a pegarlo.
      onSuccess: ({ added }) => {
        if (!added) return;
        setTitle("");
        setKey("");
        setText("");
        setOpen(false);
      },
    });
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
          <Dialog.Content minW={{ md: "560px" }}>
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
                <Stack gap={3} mt={4}>
                  <HStack gap={3} align="start">
                    <Field.Root required={!hasTitle} flex={1}>
                      <Field.Label>Título</Field.Label>
                      <Input
                        size="sm"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={hasTitle ? "Lo toma del {title:}" : ""}
                      />
                    </Field.Root>
                    <Field.Root width="90px">
                      <Field.Label>Tono</Field.Label>
                      <Input
                        size="sm"
                        textAlign="center"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder={hasKey ? "{key:}" : "Ej: G"}
                      />
                    </Field.Root>
                  </HStack>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={14}
                    fontFamily="mono"
                    fontSize="sm"
                    placeholder={
                      mode === "chords"
                        ? "G              D\nOíd, mortales, el grito sagrado:\nC        D         G\n¡libertad, libertad, libertad!"
                        : "{title: Himno Nacional Argentino}\n{key: G}\n\n[G]Oíd, mortales, el [D]grito sagrado:\n¡[C]libertad, liber[D]tad, liber[G]tad!"
                    }
                  />
                </Stack>
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
