import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserAccount, fetchAllUsers } from "../services/auth.service";
import { toaster } from "../components/ui/toaster";
import type { UserProfile, UserRole } from "../types/user";

export function useUsers() {
  return useQuery<UserProfile[], Error>({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
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

  return useMutation({
    mutationFn: (input: NewUserInput) => createUserAccount(input),
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
