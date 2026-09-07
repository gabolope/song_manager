import { CiSettings } from "react-icons/ci";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Separator,
  Stack,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SongUploader from "./SongUploader";
import UserManager from "./UserManager";

interface Props {
  height: number;
}

const Configuration = ({ height }: Props) => {
  const location = useLocation();
  const { isAdmin, isDemo, logout } = useAuth();

  const isDirector = location.pathname === "/director";
  // Subir canciones y gestionar usuarios escriben en Firestore de verdad:
  // en modo demo no hay cuenta real detrás, así que se ocultan.
  const isRealAdmin = isAdmin && !isDemo;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" h={height}>
          <CiSettings />
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxHeight="85vh" overflowY="auto">
            <Dialog.Header>
              <Dialog.Title>Opciones</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={3} align="flex-start">
                {isDirector && isRealAdmin && <SongUploader />}
                <Button variant="outline" onClick={() => logout()}>
                  {isDemo ? "Salir del modo demo" : "Cerrar sesión"}
                </Button>
                {isRealAdmin && (
                  <>
                    <Separator width="100%" />
                    <UserManager />
                  </>
                )}
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

export default Configuration;
