import { ActionBar, Button, Portal } from "@chakra-ui/react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { IoIosExit } from "react-icons/io";

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
            <Button
              onClick={onBackToLive}
              colorPalette="red"
              className="backToLive"
              visibility={
                !isCurrentLive && isLive && hasLiveSession
                  ? "visible"
                  : "hidden"
              }
            >
              Volver al Vivo
            </Button>
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
};

export default LiveBar;
