import { ActionBar, Button, Portal } from "@chakra-ui/react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { IoIosExit } from "react-icons/io";
import { MdOutlineSensors } from "react-icons/md";

interface Props {
  songId: string;
  isLive: boolean;
  viewerRef: React.RefObject<HTMLDivElement | null>;
  onLiveChange: (value: boolean) => void;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
  isCurrentLive: boolean;
  onBackToLive: () => void;
  hasLiveSession: boolean;
  // El director es quien publica el vivo: nunca necesita "volver" a él.
  isDirector: boolean;
}

const LiveBar = ({
  songId,
  isLive,
  viewerRef,
  onLiveChange,
  onLeft,
  onRight,
  isCurrentLive,
  onBackToLive,
  hasLiveSession,
  isDirector,
}: Props) => {
  return (
    <ActionBar.Root open={isLive}>
      <Portal container={viewerRef}>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <Button variant="outline" size="sm" onClick={() => onLeft(songId)}>
              <FaAngleDoubleLeft />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLiveChange(false)}
            >
              <IoIosExit />
              Salir
            </Button>
            <Button variant="outline" size="sm" onClick={() => onRight(songId)}>
              <FaAngleDoubleRight />
            </Button>
            {/* Solo se renderiza cuando realmente hace falta: con
            visibility:hidden quedaba un hueco vacío del tamaño del botón en
            la barra todo el tiempo, como si faltara algo. */}
            {!isDirector && !isCurrentLive && isLive && hasLiveSession && (
              <Button onClick={onBackToLive} colorPalette="red" size="sm">
                <MdOutlineSensors />
                Volver al Vivo
              </Button>
            )}
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
};

export default LiveBar;
