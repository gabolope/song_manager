import { IconButton, Text, VStack } from "@chakra-ui/react";
import { MdAdd, MdRemove } from "react-icons/md";

interface Props {
  transpose: number;
  onChange: (delta: number) => void;
}

const MIN_TRANSPOSE = -11;
const MAX_TRANSPOSE = 11;

const TransposeControls = ({ transpose, onChange }: Props) => (
  <VStack className="transposeControls" gap="4px">
    <IconButton
      variant="solid"
      size="md"
      borderRadius="md"
      bg="var(--viewer-text)"
      color="var(--bg-panel)"
      _hover={{ bg: "var(--viewer-text)", opacity: 0.85 }}
      onClick={() => onChange(1)}
      disabled={transpose >= MAX_TRANSPOSE}
      aria-label="Subir tono"
    >
      <MdAdd />
    </IconButton>
    <Text
      fontSize="0.8rem"
      fontWeight="600"
      color="var(--viewer-text)"
      minW="1.6em"
      textAlign="center"
      cursor={transpose !== 0 ? "pointer" : "default"}
      onClick={() => transpose !== 0 && onChange(-transpose)}
      title={transpose !== 0 ? "Volver al tono original" : undefined}
    >
      {transpose > 0 ? `+${transpose}` : transpose}
    </Text>
    <IconButton
      variant="solid"
      size="md"
      borderRadius="md"
      bg="var(--viewer-text)"
      color="var(--bg-panel)"
      _hover={{ bg: "var(--viewer-text)", opacity: 0.85 }}
      onClick={() => onChange(-1)}
      disabled={transpose <= MIN_TRANSPOSE}
      aria-label="Bajar tono"
    >
      <MdRemove />
    </IconButton>
  </VStack>
);

export default TransposeControls;
