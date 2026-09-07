import { Badge, HStack, Text } from "@chakra-ui/react";
import { GiSpyglass } from "react-icons/gi";
import { useAuth } from "../contexts/AuthContext";
import { getAvatar } from "../types/user";

const UserBadge = () => {
  const { profile, isDemo } = useAuth();

  if (isDemo) {
    return (
      <HStack gap="6px" className="hideOnNarrow">
        <GiSpyglass size={20} />
        <Badge colorPalette="purple" variant="subtle">
          Modo Demo
        </Badge>
      </HStack>
    );
  }

  if (!profile) return null;

  const { Icon } = getAvatar(profile.avatar);

  return (
    <HStack gap="6px" className="hideOnNarrow">
      <Icon size={20} />
      <Text fontSize="0.9rem" fontWeight="600">
        {profile.displayName}
      </Text>
    </HStack>
  );
};

export default UserBadge;
