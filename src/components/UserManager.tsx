import { Badge, Button, HStack, Stack, Text } from "@chakra-ui/react";
import { useUsers } from "../hooks/useUsers";
import { getAvatar } from "../types/user";

interface Props {
  onRequestCreateUser: () => void;
}

const UserManager = ({ onRequestCreateUser }: Props) => {
  const { data: users, isLoading } = useUsers();

  return (
    <Stack gap={3} align="stretch" width="100%">
      <Text fontWeight="600">Usuarios</Text>

      <Stack gap={2}>
        {isLoading && <Text fontSize="sm">Cargando...</Text>}
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
