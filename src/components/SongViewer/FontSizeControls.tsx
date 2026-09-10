import { IconButton, VStack } from "@chakra-ui/react";
import { MdOutlineTextDecrease, MdOutlineTextIncrease } from "react-icons/md";

interface Props {
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const FontSizeControls = ({
  onIncrease,
  onDecrease,
  canIncrease,
  canDecrease,
}: Props) => (
  <VStack className="fontSizeControls" gap="4px">
    <IconButton
      variant="solid"
      size="md"
      borderRadius="md"
      bg="var(--viewer-text)"
      color="var(--bg-panel)"
      _hover={{ bg: "var(--viewer-text)", opacity: 0.85 }}
      onClick={onDecrease}
      disabled={!canDecrease}
      aria-label="Disminuir tamaño de letra"
    >
      <MdOutlineTextDecrease />
    </IconButton>
    <IconButton
      variant="solid"
      size="md"
      borderRadius="md"
      bg="var(--viewer-text)"
      color="var(--bg-panel)"
      _hover={{ bg: "var(--viewer-text)", opacity: 0.85 }}
      onClick={onIncrease}
      disabled={!canIncrease}
      aria-label="Aumentar tamaño de letra"
    >
      <MdOutlineTextIncrease />
    </IconButton>
  </VStack>
);

export default FontSizeControls;
