import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";
import { useEffect } from "react";

const LIVE_SONG_DOC = "current"; // documento fijo, siempre el mismo

export function useLiveSong() {
  const queryClient = useQueryClient();
  // Listener en tiempo real
  useEffect(() => {
    const ref = doc(db, "liveSong", LIVE_SONG_DOC);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.setQueryData(["liveSong"], snapshot.data() as SongDTO);
      } else {
        queryClient.setQueryData(["liveSong"], null);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Lectura del cache
  const liveSong = useQuery<SongDTO | null>({
    queryKey: ["liveSong"],
    queryFn: () => null,
    staleTime: Infinity,
    enabled: false,
  });

  // Escritura del cache
  const setLiveSong = useMutation({
    mutationFn: async (song: SongDTO) => {
      const ref = doc(db, "liveSong", LIVE_SONG_DOC);
      await setDoc(ref, song); // sobreescribe, no acumula
    },
  });

  return { liveSong, setLiveSong };
}
