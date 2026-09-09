import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Se abre solo una vez, al entrar a modo demo (DirectorPage monta este
// componente una única vez por sesión demo). Si el usuario cierra el diálogo
// no vuelve a aparecer salvo que reinicie la demo.
const DemoWelcomeDialog = () => {
  const { isDemo } = useAuth();
  // Arranca cerrado y se abre en un efecto (no useState(isDemo)): si nace ya
  // abierto, el doble-montaje de efectos de StrictMode en dev corrompe el
  // lock de scroll/pointer-events que Ark UI aplica al resto de la página
  // mientras el diálogo está abierto, y queda "pointer-events: none" pegado
  // en <body> para siempre después de cerrarlo (nada se puede clickear).
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isDemo) setOpen(true);
  }, [isDemo]);

  if (!isDemo) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>¡Estás en modo demo!</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={3}>
                <Text>
                  Podés explorar toda la experiencia de director sin
                  necesidad de una cuenta real:
                </Text>
                <Stack
                  as="ul"
                  gap={2}
                  paddingLeft="1.1rem"
                  style={{ listStyle: "disc" }}
                >
                  <Text as="li">
                    Elegí una canción del <b>Repertorio</b> para verla, con
                    letra y acordes.
                  </Text>
                  <Text as="li">
                    Agregala a la <b>Sesión</b> para armar tu lista.
                  </Text>
                  <Text as="li">
                    Usá <b>Go Live</b> para simular una transmisión en vivo a
                    los músicos.
                  </Text>
                  <Text as="li">
                    Nada de lo que hagas acá se guarda: es todo local a esta
                    pestaña.
                  </Text>
                </Stack>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setOpen(false)}>Entendido</Button>
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

export default DemoWelcomeDialog;
