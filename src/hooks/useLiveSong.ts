import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";
import { useEffect } from "react";
import { toaster } from "../components/ui/toaster";

const LIVE_SONG_DOC = "current"; // documento fijo, siempre el mismo

export function useLiveSong() {
  const queryClient = useQueryClient();
  // Listener en tiempo real
  useEffect(() => {
    const ref = doc(db, "liveSong", LIVE_SONG_DOC);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          queryClient.setQueryData(["liveSong"], snapshot.data() as SongDTO);
        } else {
          queryClient.setQueryData(["liveSong"], null);
        }
      },
      (error) => {
        // Si el listener falla (permisos, desconexión), avisar en vez de
        // quedar desactualizado en silencio para siempre.
        console.error("Error escuchando la canción en vivo:", error);
        toaster.create({
          type: "error",
          title: "Se perdió la conexión en vivo",
          description: "Recargá la página para volver a sincronizarte.",
        });
      },
    );

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

  // Termina la sesión en vivo: borra el documento para que los viewers
  // dejen de ver la última canción publicada.
  const clearLiveSong = useMutation({
    mutationFn: async () => {
      const ref = doc(db, "liveSong", LIVE_SONG_DOC);
      await deleteDoc(ref);
    },
  });

  return { liveSong, setLiveSong, clearLiveSong };
}
