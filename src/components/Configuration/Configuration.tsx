import { CiSettings } from "react-icons/ci";
import { LuMoon, LuSun } from "react-icons/lu";
import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Separator,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useColorMode } from "@/components/ui/color-mode";
import CreateUserDialog from "./CreateUserDialog";
import SongUploader from "./SongUploader";
import UserManager from "./UserManager";

interface Props {
  height: number;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    fontSize="xs"
    fontWeight="600"
    textTransform="uppercase"
    letterSpacing="0.04em"
    color="var(--text-muted)"
  >
    {children}
  </Text>
);

const Configuration = ({ height }: Props) => {
  const location = useLocation();
  const { isAdmin, isDemo, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const [open, setOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const isDirector = location.pathname === "/director";
  // Subir canciones y gestionar usuarios escriben en Firestore de verdad:
  // en modo demo no hay cuenta real detrás, así que se ocultan.
  const isRealAdmin = isAdmin && !isDemo;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Trigger asChild>
          <Button variant="outline" h={height} aria-label="Configuración">
            <CiSettings />
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxHeight="85vh" overflowY="auto" minW={{ base: "auto", sm: "380px" }}>
              <Dialog.Header>
                <Dialog.Title>Configuración</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={5} align="stretch">
                  <Stack gap={2} align="stretch">
                    <SectionLabel>Apariencia</SectionLabel>
                    <HStack
                      justify="space-between"
                      padding="10px 12px"
                      borderRadius="8px"
                      background="var(--bg-hover)"
                    >
                      <HStack gap="8px">
                        {colorMode === "dark" ? <LuMoon /> : <LuSun />}
                        <Text fontSize="sm">Modo oscuro</Text>
                      </HStack>
                      <Switch.Root
                        checked={colorMode === "dark"}
                        onCheckedChange={() => toggleColorMode()}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </HStack>
                  </Stack>

                  {isDirector && isRealAdmin && (
                    <>
                      <Separator />
                      <Stack gap={2} align="stretch">
                        <SectionLabel>Canciones</SectionLabel>
                        <SongUploader />
                      </Stack>
                    </>
                  )}

                  {isRealAdmin && (
                    <>
                      <Separator />
                      <UserManager
                        onRequestCreateUser={() => {
                          // Se cierra este diálogo antes de abrir el de
                          // creación: son dos diálogos independientes, no
                          // uno anidado dentro del otro.
                          setOpen(false);
                          setCreateUserOpen(true);
                        }}
                      />
                    </>
                  )}

                  <Separator />
                  <Stack gap={2} align="stretch">
                    <SectionLabel>Cuenta</SectionLabel>
                    <Button variant="outline" colorPalette="red" onClick={() => logout()}>
                      {isDemo ? "Salir del modo demo" : "Cerrar sesión"}
                    </Button>
                  </Stack>
                </Stack>
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      {isRealAdmin && (
        <CreateUserDialog
          open={createUserOpen}
          onOpenChange={setCreateUserOpen}
        />
      )}
    </>
  );
};

export default Configuration;
