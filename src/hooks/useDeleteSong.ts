import { useOptimisticMutation } from "./useOptimisticMutation";
import { deleteSong } from "../services/songs.service";
import { useAuth } from "../contexts/AuthContext";

export function useDeleteSong() {
  const { teamId } = useAuth();

  const { run: removeSong, ...mutation } = useOptimisticMutation<string>({
    queryKey: ["songs", teamId],
    mutationFn: (id) => deleteSong(teamId, id),
    updater: (old, id) => old?.filter((song) => song.id !== id),
    invalidateKeys: [["songs", teamId], ["book", teamId]],
    toastMessages: {
      loading: "Eliminando canción...",
      success: "Canción eliminada",
      error: "No se pudo eliminar la canción",
    },
  });

  return { ...mutation, removeSong };
}
