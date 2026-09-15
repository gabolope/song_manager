import { useOptimisticMutation } from "./useOptimisticMutation";
import { updateSong, type SongEditInput } from "../services/songs.service";
import { useAuth } from "../contexts/AuthContext";

interface EditSongVars {
  id: string;
  data: SongEditInput;
}

export function useEditSong() {
  const { isDemo } = useAuth();

  const { run: editSong, ...mutation } = useOptimisticMutation<EditSongVars>({
    queryKey: ["songs", isDemo ? "demo" : "real"],
    mutationFn: ({ id, data }) => updateSong(id, data),
    updater: (old, { id, data }) =>
      old?.map((song) => (song.id === id ? { ...song, ...data } : song)),
    invalidateKeys: [["songs"]],
    toastMessages: {
      loading: "Guardando canción...",
      success: "Canción actualizada",
      error: "No se pudo actualizar la canción",
    },
  });

  return { ...mutation, editSong };
}
