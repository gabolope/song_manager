import { useOptimisticMutation } from "./useOptimisticMutation";
import { deleteSong } from "../services/songs.service";
import { useAuth } from "../contexts/AuthContext";

export function useDeleteSong() {
  const { isDemo } = useAuth();

  const { run: removeSong, ...mutation } = useOptimisticMutation<string>({
    queryKey: ["songs", isDemo ? "demo" : "real"],
    mutationFn: (id) => deleteSong(id),
    updater: (old, id) => old?.filter((song) => song.id !== id),
    invalidateKeys: [["songs"], ["book"]],
    toastMessages: {
      loading: "Eliminando canción...",
      success: "Canción eliminada",
      error: "No se pudo eliminar la canción",
    },
  });

  return { ...mutation, removeSong };
}
