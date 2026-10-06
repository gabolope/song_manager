import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { toaster } from "../components/ui/toaster";
import type { Team } from "../types/user";

// Doc `teams/{teamId}` del usuario (por ahora solo para mostrar el nombre).
// Cambia solo desde /admin, así que no hace falta escucharlo en tiempo real.
export function useTeam() {
  const { teamId } = useAuth();
  return useQuery<Team | null, Error>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const snapshot = await getDoc(doc(db, "teams", teamId!));
      return snapshot.exists()
        ? ({ id: snapshot.id, ...snapshot.data() } as Team)
        : null;
    },
    enabled: !!teamId,
    staleTime: Infinity,
  });
}

// Todos los equipos: solo el superadmin puede listarlos (/admin).
export function useTeams() {
  const { isSuperAdmin } = useAuth();
  return useQuery<Team[], Error>({
    queryKey: ["teams"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "teams"));
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Team)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: isSuperAdmin,
  });
}

// "Iglesia Betesda" → "iglesia-betesda". El id queda en todas las rutas del
// equipo, así que conviene legible y sin acentos.
export function teamIdFromName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const id = teamIdFromName(name);
      if (!id) throw new Error("El nombre no sirve como id");
      // Las reglas igual rechazan pisar un equipo (solo create), esto es
      // para dar un mensaje claro en vez de "permission denied".
      const ref = doc(db, "teams", id);
      if ((await getDoc(ref)).exists()) throw new Error(`Ya existe el equipo "${id}"`);
      await setDoc(ref, { name: name.trim(), createdAt: serverTimestamp() });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toaster.create({ type: "success", title: "Equipo creado" });
    },
    onError: (error) => {
      toaster.create({
        type: "error",
        title: "No se pudo crear el equipo",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    },
  });
}
