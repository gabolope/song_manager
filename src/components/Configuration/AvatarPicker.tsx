import { SimpleGrid, Text } from "@chakra-ui/react";
import { AVATARS } from "@/types/user";

interface Props {
  value: string;
  onChange: (key: string) => void;
}

const AvatarPicker = ({ value, onChange }: Props) => {
  return (
    <SimpleGrid columns={{ base: 5, sm: 7 }} gap={2}>
      {AVATARS.map(({ key, label, Icon }) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "8px",
              borderRadius: "var(--radius-lg)",
              border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <Icon size={24} />
            <Text fontSize="10px" color="var(--text-muted)">
              {label}
            </Text>
          </button>
        );
      })}
    </SimpleGrid>
  );
};

export default AvatarPicker;
