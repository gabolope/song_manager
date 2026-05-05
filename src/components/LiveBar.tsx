import { ActionBar, Button, Portal, Switch } from "@chakra-ui/react";
import { IoIosExit } from "react-icons/io";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface Props {
  isLive: boolean;
  isDirector: boolean;
  goLive: () => void;
  setDirector: () => void;
}

const LiveBar = ({ isLive, isDirector, goLive, setDirector }: Props) => {
  return (
    <>
      <Switch.Root
        paddingX={"10px"}
        colorPalette={"blue"}
        onChange={() => setDirector()}
      >
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label>Modo Director</Switch.Label>
      </Switch.Root>
      <Button colorPalette="red" variant="outline" onClick={() => goLive()}>
        Go Live
      </Button>
      <ActionBar.Root open={isLive}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              {isDirector && (
                <Button variant="outline" size="sm">
                  <FaAngleDoubleLeft />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => goLive()}>
                <IoIosExit />
                Salir
              </Button>
              {isDirector && (
                <Button variant="outline" size="sm">
                  <FaAngleDoubleRight />
                </Button>
              )}
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
};
export default LiveBar;
