import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { db, teamDoc } from "../services/firebase";
import type { SongDTO } from "../types/song";
import { useAuth } from "../contexts/AuthContext";
import { nextBookOrder } from "../utils/book";
import { useOptimisticMutation } from "./useOptimisticMutation";

export function useBookMutations(book?: SongDTO[]) {
  const queryClient = useQueryClient();
  const { isDemo, teamId } = useAuth();
  const bookKey = ["book", teamId];

  const addToBook = useMutation({
    mutationFn: async (song: SongDTO) => {
      if (book?.some((s) => s.id === song.id)) return;
      const order = nextBookOrder(book);

      if (isDemo) {
        queryClient.setQueryData<SongDTO[]>(bookKey, (prev = []) => [
          ...prev,
          { ...song, order },
        ]);
        return;
      }

      const ref = teamDoc(teamId, "book", song.id);
      await setDoc(ref, { ...song, order, createdAt: serverTimestamp() });
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: bookKey });
    },
  });

  const removeFromBook = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        queryClient.setQueryData<SongDTO[]>(bookKey, (prev = []) =>
          prev.filter((s) => s.id !== id),
        );
        return;
      }
      await deleteDoc(teamDoc(teamId, "book", id));
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: bookKey });
    },
  });

  // Reordena el book completo (drag & drop en la sesión). Aplica el nuevo
  // orden al cache al toque (optimista) para que el arrastre se sienta
  // instantáneo, y si la escritura a Firestore falla, vuelve al orden
  // anterior.
  const reorderBook = useOptimisticMutation<SongDTO[]>({
    queryKey: bookKey,
    mutationFn: async (orderedSongs) => {
      if (isDemo) return;

      const batch = writeBatch(db);
      orderedSongs.forEach((song, index) => {
        batch.update(teamDoc(teamId, "book", song.id), { order: index });
      });
      await batch.commit();
    },
    updater: (_old, orderedSongs) =>
      orderedSongs.map((song, index) => ({ ...song, order: index })),
    invalidateKeys: isDemo ? [] : [bookKey],
  });

  // Transposición de una canción del book: se guarda en su documento (no en
  // "songs"), así que dura mientras dure la sesión/book actual pero nunca
  // toca el repertorio. Optimista igual que reorderBook: los clics de
  // subir/bajar tono deben sentirse instantáneos, no esperar el viaje a
  // Firestore.
  const setTranspose = useOptimisticMutation<{ id: string; value: number }>({
    queryKey: bookKey,
    mutationFn: async ({ id, value }) => {
      if (isDemo) return;
      await updateDoc(teamDoc(teamId, "book", id), { transpose: value });
    },
    updater: (old = [], { id, value }) =>
      old.map((s) => (s.id === id ? { ...s, transpose: value } : s)),
    invalidateKeys: isDemo ? [] : [bookKey],
  });

  return { addToBook, removeFromBook, reorderBook, setTranspose };
}
