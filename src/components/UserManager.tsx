import { Badge, Button, HStack, Stack, Text } from "@chakra-ui/react";
import ContentLoader from "react-content-loader";
import { useUsers } from "../hooks/useUsers";
import { getAvatar } from "../types/user";

interface Props {
  onRequestCreateUser: () => void;
}

const ROW_HEIGHT = 20;

const UserRowSkeleton = () => (
  <ContentLoader
    speed={1.5}
    width="100%"
    height={ROW_HEIGHT}
    viewBox={`0 0 300 ${ROW_HEIGHT}`}
    preserveAspectRatio="none"
    backgroundColor="var(--bg-hover)"
    foregroundColor="var(--border)"
    title="Cargando..."
  >
    <circle cx="10" cy="10" r="10" />
    <rect x="30" y="4" rx="4" ry="4" width="160" height="12" />
    <rect x="240" y="2" rx="6" ry="6" width="60" height="16" />
  </ContentLoader>
);

const UserManager = ({ onRequestCreateUser }: Props) => {
  const { data: users, isLoading } = useUsers();

  return (
    <Stack gap={3} align="stretch" width="100%">
      <Text fontWeight="600">Usuarios</Text>

      <Stack gap={2}>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <UserRowSkeleton key={i} />)}
        {users?.map((u) => {
          const { Icon } = getAvatar(u.avatar);
          return (
            <HStack key={u.uid} gap={3}>
              <Icon size={20} />
              <Text fontSize="sm" flex="1">
                {u.displayName || u.email}
              </Text>
              <Badge colorPalette={u.role === "admin" ? "blue" : "gray"}>
                {u.role === "admin" ? "Director" : "Músico"}
              </Badge>
            </HStack>
          );
        })}
      </Stack>

      <Button variant="outline" size="sm" onClick={onRequestCreateUser}>
        Crear usuario
      </Button>
    </Stack>
  );
};

export default UserManager;
