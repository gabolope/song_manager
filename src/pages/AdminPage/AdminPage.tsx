import {
  Badge,
  Button,
  Container,
  HStack,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { teamIdFromName, useCreateTeam, useTeams } from "@/hooks/useTeam";
import { useUpdateUser, useUsers } from "@/hooks/useUsers";
import CreateUserDialog from "@/components/Configuration/CreateUserDialog";
import { getAvatar } from "@/types/user";

// Solo superadmin: alta de equipos y gestión de miembros de cualquier equipo.
// Borrar usuarios no está: la cuenta de Auth no se puede borrar desde el
// cliente (ver TODO.md).
const AdminPage = () => {
  const navigate = useNavigate();
  const { teamId: myTeamId, profile } = useAuth();
  const { data: teams } = useTeams();
  const { mutate: createTeam, isPending: creatingTeam } = useCreateTeam();
  const { mutate: updateUser } = useUpdateUser();

  const [newTeamName, setNewTeamName] = useState("");
  const [selected, setSelected] = useState(myTeamId ?? "");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const { data: members, isLoading } = useUsers(selected || undefined);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    createTeam(newTeamName, {
      onSuccess: (id) => {
        setNewTeamName("");
        setSelected(id);
      },
    });
  };

  return (
    <Container maxW="2xl" py={6}>
      <Stack gap={6}>
        <HStack justify="space-between">
          <Heading size="lg">Equipos</Heading>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Volver a la app
          </Button>
        </HStack>

        <form onSubmit={handleCreateTeam}>
          <Stack gap={1}>
            <HStack>
              <Input
                placeholder="Nombre del equipo nuevo"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
              <Button type="submit" loading={creatingTeam}>
                Crear equipo
              </Button>
            </HStack>
            {newTeamName && (
              <Text fontSize="xs" color="var(--text-muted)">
                id: {teamIdFromName(newTeamName) || "—"} (no se puede cambiar después)
              </Text>
            )}
          </Stack>
        </form>

        <Stack gap={3}>
          <HStack wrap="wrap" gap={2}>
            {teams?.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={t.id === selected ? "solid" : "outline"}
                onClick={() => setSelected(t.id)}
              >
                {t.name}
              </Button>
            ))}
          </HStack>

          {selected && (
            <>
              {isLoading && <Text fontSize="sm">Cargando...</Text>}
              {members?.length === 0 && (
                <Text fontSize="sm" color="var(--text-muted)">
                  Sin miembros. Creá el primer director del equipo.
                </Text>
              )}
              {members?.map((u) => {
                const { Icon } = getAvatar(u.avatar);
                const isMe = u.uid === profile?.uid;
                return (
                  <HStack key={u.uid} gap={3} wrap="wrap">
                    <Icon size={20} />
                    <Stack gap={0} flex="1" minW="160px">
                      <Text fontSize="sm">
                        {u.displayName || u.email} {isMe && <Badge>vos</Badge>}
                      </Text>
                      <Text fontSize="xs" color="var(--text-muted)">
                        {u.email}
                      </Text>
                    </Stack>
                    <Button
                      size="xs"
                      variant="outline"
                      colorPalette={u.role === "admin" ? "blue" : "gray"}
                      onClick={() =>
                        updateUser({ uid: u.uid, role: u.role === "admin" ? "musico" : "admin" })
                      }
                    >
                      {u.role === "admin" ? "Director" : "Músico"}
                    </Button>
                    <NativeSelect.Root size="xs" width="140px">
                      <NativeSelect.Field
                        aria-label="Mover a otro equipo"
                        value={u.teamId}
                        onChange={(e) => updateUser({ uid: u.uid, teamId: e.target.value })}
                      >
                        {teams?.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </HStack>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setCreateUserOpen(true)}>
                Crear usuario en este equipo
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        teamId={selected}
      />
    </Container>
  );
};

export default AdminPage;
