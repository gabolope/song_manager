import { ActionBar, Button, Portal } from "@chakra-ui/react";
import { IoIosExit } from "react-icons/io";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface Props {
  isLive: boolean;
  goLive: () => void;
}

const LiveBar = ({ isLive, goLive }: Props) => {
  return (
    <>
      <Button colorPalette="red" variant="outline" onClick={() => goLive()}>
        Go Live
      </Button>
      <ActionBar.Root open={isLive}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <Button variant="outline" size="sm">
                <FaAngleDoubleLeft />
              </Button>

              <Button variant="outline" size="sm" onClick={() => goLive()}>
                <IoIosExit />
                Salir
              </Button>

              <Button variant="outline" size="sm">
                <FaAngleDoubleRight />
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
};
export default LiveBar;
