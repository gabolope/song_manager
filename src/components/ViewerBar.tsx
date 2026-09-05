import {
  ActionBar,
  Badge,
  Button,
  HStack,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import { IoIosExit } from "react-icons/io";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { MdOutlineSensors } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import Configuration from "./Configuration";
import { ColorModeButton } from "./ui/color-mode";

interface Props {
  isLive: boolean;
  goLive: () => void;
  songId?: string;
  onLeft?: (id: string) => void;
  onRight?: (id: string) => void;
  onMenuClick?: () => void;
}

const ViewerBar = ({
  isLive,
  goLive,
  songId,
  onLeft,
  onRight,
  onMenuClick,
}: Props) => {
  return (
    <>
      <HStack
        justify="space-between"
        paddingX={{ base: "8px", sm: "16px" }}
        paddingY="10px"
        borderBottom="1px solid var(--border)"
        background="var(--bg-panel)"
        gap="6px"
      >
        <HStack gap="10px">
          {onMenuClick && (
            <IconButton
              aria-label="Abrir canciones"
              variant="outline"
              size="sm"
              hideFrom="lg"
              onClick={onMenuClick}
            >
              <RxHamburgerMenu />
            </IconButton>
          )}
          <Text fontWeight="700" fontSize="1.05rem" className="hideOnNarrow">
            Song Manager
          </Text>
          <Badge colorPalette="blue" variant="subtle">
            Director
          </Badge>
        </HStack>
        <HStack gap="8px">
          <Button
            colorPalette="red"
            variant={isLive ? "solid" : "outline"}
            onClick={() => goLive()}
            h={10}
          >
            <MdOutlineSensors />
            <span className="hideOnNarrow">
              {isLive ? "En vivo" : "Go Live"}
            </span>
          </Button>
          <Configuration height={10} />
          <ColorModeButton />
        </HStack>
      </HStack>
      <ActionBar.Root open={isLive}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <Button
                variant="outline"
                size="sm"
                onClick={() => songId && onLeft?.(songId)}
                disabled={!songId}
              >
                <FaAngleDoubleLeft />
              </Button>

              <Button variant="outline" size="sm" onClick={() => goLive()}>
                <IoIosExit />
                Salir
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => songId && onRight?.(songId)}
                disabled={!songId}
              >
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
