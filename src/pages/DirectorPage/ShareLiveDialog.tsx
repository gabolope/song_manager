import {
  Button,
  CloseButton,
  Dialog,
  IconButton,
  Input,
  Portal,
  QrCode,
  Stack,
} from "@chakra-ui/react";
import { MdQrCode2 } from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

// Link público a la canción en vivo del equipo (ver LivePage). Es fijo por
// equipo: se puede imprimir el QR una vez y dejarlo pegado.
const ShareLiveDialog = () => {
  const { isDemo, teamId } = useAuth();

  // En demo no hay nada en Firestore que un invitado pueda leer.
  if (isDemo || !teamId) return null;

  const url = `${window.location.origin}/live/${teamId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toaster.create({ type: "success", title: "Link copiado" });
    } catch {
      toaster.create({ type: "error", title: "No se pudo copiar el link" });
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <IconButton aria-label="Compartir en vivo" variant="outline" size="sm">
          <MdQrCode2 />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Compartir canción en vivo</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4} align="center">
                <QrCode.Root value={url} size="2xl">
                  <QrCode.Frame>
                    <QrCode.Pattern />
                  </QrCode.Frame>
                </QrCode.Root>
                <Input value={url} readOnly onFocus={(e) => e.target.select()} />
                <Button onClick={copy} alignSelf="stretch">
                  Copiar link
                </Button>
              </Stack>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ShareLiveDialog;
