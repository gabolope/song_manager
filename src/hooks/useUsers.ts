import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserAccount, fetchTeamUsers } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";
import { toaster } from "../components/ui/toaster";
import type { UserProfile, UserRole } from "../types/user";

export function useUsers() {
  const teamId = useAuth().profile?.teamId;
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

export function useCreateUser() {
  const queryClient = useQueryClient();
  const teamId = useAuth().profile?.teamId;

  return useMutation({
    mutationFn: (input: NewUserInput) => {
      if (!teamId) throw new Error("Tu usuario no tiene equipo asignado");
      return createUserAccount({ ...input, teamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
