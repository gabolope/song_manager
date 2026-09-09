import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateSong, type SongEditInput } from "../services/songs.service";
import type { SongDTO } from "../types/song";
import { useAuth } from "../contexts/AuthContext";

interface EditSongVars {
  id: string;
  data: SongEditInput;
}

export function useEditSong() {
  const queryClient = useQueryClient();
  const { isDemo } = useAuth();
  const queryKey = ["songs", isDemo ? "demo" : "real"];

  const mutation = useMutation({
    mutationFn: ({ id, data }: EditSongVars) => updateSong(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSongs = queryClient.getQueryData<SongDTO[]>(queryKey);

      queryClient.setQueryData<SongDTO[]>(queryKey, (old) =>
        old?.map((song) => (song.id === id ? { ...song, ...data } : song)),
      );

      return { previousSongs };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(queryKey, context.previousSongs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const editSong = (vars: EditSongVars) =>
    toast.promise(mutation.mutateAsync(vars), {
      pending: "Guardando canción...",
      success: "Canción actualizada",
      error: {
        render: ({ data }) =>
          data instanceof Error ? data.message : "No se pudo actualizar la canción",
      },
    });

  return { ...mutation, editSong };
}
