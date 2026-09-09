import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  doc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";
import { useAuth } from "../contexts/AuthContext";
import { nextBookOrder } from "../utils/book";

export function useBookMutations(book?: SongDTO[]) {
  const queryClient = useQueryClient();
  const { isDemo } = useAuth();

  const addToBook = useMutation({
    mutationFn: async (song: SongDTO) => {
      if (book?.some((s) => s.id === song.id)) return;
      const order = nextBookOrder(book);

      if (isDemo) {
        queryClient.setQueryData<SongDTO[]>(["book"], (prev = []) => [
          ...prev,
          { ...song, order },
        ]);
        return;
      }

      const ref = doc(db, "book", song.id);
      await setDoc(ref, { ...song, order, createdAt: serverTimestamp() });
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  const removeFromBook = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        queryClient.setQueryData<SongDTO[]>(["book"], (prev = []) =>
          prev.filter((s) => s.id !== id),
        );
        return;
      }
      await deleteDoc(doc(db, "book", id));
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  // Reordena el book completo (drag & drop en la sesión). Aplica el nuevo
  // orden al cache al toque (optimista) para que el arrastre se sienta
  // instantáneo, y si la escritura a Firestore falla, vuelve al orden
  // anterior.
  const reorderBook = useMutation({
    mutationFn: async (orderedSongs: SongDTO[]) => {
      if (isDemo) return;

      const batch = writeBatch(db);
      orderedSongs.forEach((song, index) => {
        batch.update(doc(db, "book", song.id), { order: index });
      });
      await batch.commit();
    },
    onMutate: async (orderedSongs: SongDTO[]) => {
      await queryClient.cancelQueries({ queryKey: ["book"] });
      const previousBook = queryClient.getQueryData<SongDTO[]>(["book"]);
      queryClient.setQueryData<SongDTO[]>(
        ["book"],
        orderedSongs.map((song, index) => ({ ...song, order: index })),
      );
      return { previousBook };
    },
    onError: (_err, _orderedSongs, context) => {
      if (context?.previousBook) {
        queryClient.setQueryData(["book"], context.previousBook);
      }
    },
    onSettled: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  return { addToBook, removeFromBook, reorderBook };
}
