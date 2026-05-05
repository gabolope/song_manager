import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";

const LIVE_SONG_DOC = "current"; // documento fijo, siempre el mismo

export function useLiveSong() {
  const queryClient = useQueryClient();

  const setLiveSong = useMutation({
    mutationFn: async (song: SongDTO) => {
      const ref = doc(db, "liveSong", LIVE_SONG_DOC);
      await setDoc(ref, song); // sobreescribe, no acumula
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveSong"] });
    },
  });

  return { setLiveSong };
}
