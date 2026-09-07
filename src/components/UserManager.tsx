import {
  Badge,
  Button,
  ButtonGroup,
  Field,
  HStack,
  Input,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateUser, useUsers } from "../hooks/useUsers";
import { getAvatar } from "../types/user";
import type { UserRole } from "../types/user";
import AvatarPicker from "./AvatarPicker";

const UserManager = () => {
  const { data: users, isLoading } = useUsers();
  const { mutate: createUser, isPending } = useCreateUser();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("musico");
  const [avatar, setAvatar] = useState("guitar");

  const resetForm = () => {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setRole("musico");
    setAvatar("guitar");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(
      { displayName, email, password, role, avatar },
      { onSuccess: resetForm },
    );
  };

  return (
    <Stack gap={4} align="stretch" width="100%">
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

      <Separator />

      <Text fontWeight="600">Crear usuario</Text>
      <form onSubmit={handleSubmit}>
        <Stack gap={3} align="stretch">
          <Field.Root required>
            <Field.Label>Nombre</Field.Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Contraseña</Field.Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Rol</Field.Label>
            <ButtonGroup attached>
              <Button
                type="button"
                size="sm"
                variant={role === "musico" ? "solid" : "outline"}
                onClick={() => setRole("musico")}
              >
                Músico
              </Button>
              <Button
                type="button"
                size="sm"
                variant={role === "admin" ? "solid" : "outline"}
                onClick={() => setRole("admin")}
              >
                Director
              </Button>
            </ButtonGroup>
          </Field.Root>
          <Field.Root>
            <Field.Label>Avatar</Field.Label>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </Field.Root>
          <Button type="submit" loading={isPending} size="sm">
            Crear usuario
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default UserManager;
