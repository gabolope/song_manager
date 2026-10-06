import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserAccount, fetchTeamUsers, updateUser } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";
import { toaster } from "../components/ui/toaster";
import type { UserProfile, UserRole } from "../types/user";

// `teamIdOverride`: el superadmin (/admin) mira equipos que no son el suyo.
export function useUsers(teamIdOverride?: string) {
  const auth = useAuth();
  const teamId = teamIdOverride ?? auth.teamId;
  return useQuery<UserProfile[], Error>({
    queryKey: ["users", teamId],
    queryFn: () => fetchTeamUsers(teamId!),
    // Sin teamId (modo demo o usuario sin migrar) no hay equipo que listar.
    enabled: !!teamId,
  });
}

interface NewUserInput {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  avatar: string;
}

export function useCreateUser(teamIdOverride?: string) {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const teamId = teamIdOverride ?? auth.teamId;

  return useMutation({
    mutationFn: (input: NewUserInput) => {
      if (!teamId) throw new Error("Tu usuario no tiene equipo asignado");
      return createUserAccount({ ...input, teamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", teamId] });
      toaster.create({ type: "success", title: "Usuario creado" });
    },
    onError: (error) => {
      toaster.create({
        type: "error",
        title: "No se pudo crear el usuario",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    },
  });
}

// Solo superadmin. Se invalidan todos los ["users", …]: al mover a alguien
// cambian dos equipos a la vez.
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, ...data }: { uid: string } & Parameters<typeof updateUser>[1]) =>
      updateUser(uid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (error) => {
      toaster.create({
        type: "error",
        title: "No se pudo actualizar el usuario",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    },
  });
}
