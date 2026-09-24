import {
  Button,
  CloseButton,
  Dialog,
  IconButton,
  Portal,
  Textarea,
} from "@chakra-ui/react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { MdOutlineMessage } from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";

// El director manda un aviso a todos los conectados. Documento fijo que se
// sobreescribe en cada envío (mismo patrón que liveSong/current); lo muestra
// BroadcastMessage en cada cliente.
const SendMessageDialog = () => {
  const { user, profile, isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // En demo no hay otros dispositivos a los que mandarles nada.
  if (isDemo || !user) return null;

  const send = async () => {
    setSending(true);
    try {
      await setDoc(doc(db, "broadcast", "current"), {
        id: crypto.randomUUID(),
        text: text.trim(),
        sentBy: user.uid,
        senderName: profile?.displayName ?? user.email ?? "",
        sentAt: serverTimestamp(),
      });
      toaster.create({ type: "success", title: "Mensaje enviado" });
      setText("");
      setOpen(false);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toaster.create({ type: "error", title: "No se pudo enviar el mensaje" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <IconButton aria-label="Enviar mensaje" variant="outline" size="sm">
          <MdOutlineMessage />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Mensaje a todos</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej: repetimos el coro"
                rows={3}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={send}
                loading={sending}
                disabled={!text.trim()}
              >
                Enviar
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

export default SendMessageDialog;
