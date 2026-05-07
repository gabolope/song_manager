import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";

export function useBookMutations(book?: SongDTO[]) {
  const queryClient = useQueryClient();

  const addToBook = useMutation({
    mutationFn: async (song: SongDTO) => {
      if (book?.some((s) => s.id === song.id)) return;

      const ref = doc(db, "book", song.id);
      await setDoc(ref, { ...song, createdAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  const removeFromBook = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "book", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });

  return { addToBook, removeFromBook };
}
