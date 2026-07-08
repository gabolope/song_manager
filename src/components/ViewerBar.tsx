import { ActionBar, Button, HStack, Portal } from "@chakra-ui/react";
import { IoIosExit } from "react-icons/io";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import Configuration from "./Configuration";

interface Props {
  isLive: boolean;
  goLive: () => void;
}

const ViewerBar = ({ isLive, goLive }: Props) => {
  return (
    <>
      <HStack>
        <Button
          colorPalette="red"
          variant="outline"
          onClick={() => goLive()}
          h={10}
        >
          Go Live
        </Button>
        <Configuration height={10} />
      </HStack>
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
export default ViewerBar;
