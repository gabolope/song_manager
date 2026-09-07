import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";
import { useAuth } from "../contexts/AuthContext";

export function useBookMutations(book?: SongDTO[]) {
  const queryClient = useQueryClient();
  const { isDemo } = useAuth();

  const addToBook = useMutation({
    mutationFn: async (song: SongDTO) => {
      if (book?.some((s) => s.id === song.id)) return;

      if (isDemo) {
        queryClient.setQueryData<SongDTO[]>(["book"], (prev = []) => [
          ...prev,
          song,
        ]);
        return;
      }

      const ref = doc(db, "book", song.id);
      await setDoc(ref, { ...song, createdAt: serverTimestamp() });
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

  return { addToBook, removeFromBook };
}
