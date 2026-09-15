import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toaster } from "../components/ui/toaster";
import type { SongDTO } from "../types/song";

interface OptimisticMutationOptions<TVars> {
  queryKey: QueryKey;
  mutationFn: (vars: TVars) => Promise<unknown>;
  updater: (old: SongDTO[] | undefined, vars: TVars) => SongDTO[] | undefined;
  invalidateKeys?: QueryKey[];
  toastMessages?: { loading: string; success: string; error: string };
}

// Patrón repetido en useEditSong/useDeleteSong/useBookMutations: optimistic
// update sobre una lista de SongDTO con rollback si la mutación falla.
export function useOptimisticMutation<TVars>({
  queryKey,
  mutationFn,
  updater,
  invalidateKeys = [queryKey],
  toastMessages,
}: OptimisticMutationOptions<TVars>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SongDTO[]>(queryKey);
      queryClient.setQueryData<SongDTO[]>(queryKey, (old) => updater(old, vars));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });

  const run = (vars: TVars) => {
    const promise = mutation.mutateAsync(vars);
    if (!toastMessages) return promise;
    return toaster.promise(promise, {
      loading: { title: toastMessages.loading },
      success: { title: toastMessages.success },
      error: (err) => ({
        title: err instanceof Error ? err.message : toastMessages.error,
      }),
    });
  };

  return { ...mutation, run };
}
