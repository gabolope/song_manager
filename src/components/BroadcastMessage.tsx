import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/firebase";

interface Message {
  id: string;
  text: string;
  sentBy: string;
  senderName?: string;
}

// Muestra en un diálogo los mensajes que un director manda a todos los
// conectados (documento fijo broadcast/current, ver SendMessageDialog).
// Cerrar el diálogo descarta el mensaje solo para este usuario.
const BroadcastMessage = () => {
  const { user, isDemo } = useAuth();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (isDemo || !user) return;
    // El primer snapshot es el último mensaje guardado, que pudo haberse
    // mandado hace horas: solo se muestran los que llegan estando conectado.
    let first = true;
    const unsubscribe = onSnapshot(
      doc(db, "broadcast", "current"),
      (snapshot) => {
        if (first) {
          first = false;
          return;
        }
        const data = snapshot.data() as Message | undefined;
        if (data && data.sentBy !== user.uid) setMessage(data);
      },
      (error) => console.error("Error escuchando mensajes:", error),
    );
    return () => unsubscribe();
  }, [isDemo, user]);

  return (
    <Dialog.Root
      open={!!message}
      onOpenChange={(e) => !e.open && setMessage(null)}
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                Mensaje de {message?.senderName || "el director"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text whiteSpace="pre-wrap" fontSize="lg">
                {message?.text}
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setMessage(null)}>Entendido</Button>
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

export default BroadcastMessage;
