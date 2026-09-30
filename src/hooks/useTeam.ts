import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Team } from "../types/user";

// Doc `teams/{teamId}` del usuario (por ahora solo para mostrar el nombre).
// Cambia solo por script, así que no hace falta escucharlo en tiempo real.
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
