import {
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateUser } from "../hooks/useUsers";
import type { UserRole } from "../types/user";
import AvatarPicker from "./AvatarPicker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateUserDialog = ({ open, onOpenChange }: Props) => {
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
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        onOpenChange(e.open);
        // Que no queden datos de un usuario a medio crear la próxima vez
        // que se abra el diálogo.
        if (!e.open) resetForm();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Crear usuario</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="create-user-form" onSubmit={handleSubmit}>
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
                </Stack>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                type="submit"
                form="create-user-form"
                loading={isPending}
              >
                Crear usuario
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CreateUserDialog;
