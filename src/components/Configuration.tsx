import { CiSettings } from "react-icons/ci";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

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
              <Button
                variant="outline"
                onClick={() => navigate(isDirector ? "/player" : "/director")}
              >
                Cambiar a Modo {isDirector ? "Músico" : "Director"}
              </Button>
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
