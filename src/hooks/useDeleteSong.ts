import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toaster } from "../components/ui/toaster";
import { deleteSong } from "../services/songs.service";
import type { SongDTO } from "../types/song";
import { useAuth } from "../contexts/AuthContext";

export function useDeleteSong() {
  const queryClient = useQueryClient();
  const { isDemo } = useAuth();
  const queryKey = ["songs", isDemo ? "demo" : "real"];

  const mutation = useMutation({
    mutationFn: (id: string) => deleteSong(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSongs = queryClient.getQueryData<SongDTO[]>(queryKey);

      queryClient.setQueryData<SongDTO[]>(queryKey, (old) =>
        old?.filter((song) => song.id !== id),
      );

      return { previousSongs };
    },
    onError: (_error, _id, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(queryKey, context.previousSongs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  const removeSong = (id: string) =>
    toaster.promise(mutation.mutateAsync(id), {
      loading: { title: "Eliminando canción..." },
      success: { title: "Canción eliminada" },
      error: (err) => ({
        title: err instanceof Error ? err.message : "No se pudo eliminar la canción",
      }),
    });

  return { ...mutation, removeSong };
}
