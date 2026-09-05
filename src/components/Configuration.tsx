import { CiSettings } from "react-icons/ci";
import { Button, CloseButton, Dialog, Portal, Stack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import SongUploader from "./SongUploader";

interface Props {
  height: number;
}

const Configuration = ({ height }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDirector = location.pathname === "/director";

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
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Opciones</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={3} align="flex-start">
                <Button
                  variant="outline"
                  onClick={() => navigate(isDirector ? "/player" : "/director")}
                >
                  Cambiar a Modo {isDirector ? "Músico" : "Director"}
                </Button>
                {isDirector && <SongUploader />}
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
