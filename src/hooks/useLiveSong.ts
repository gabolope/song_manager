import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SongDTO } from "../types/song";
import { useEffect } from "react";
import { toaster } from "../components/ui/toaster";
import { useAuth } from "../contexts/AuthContext";

const LIVE_SONG_DOC = "current"; // documento fijo, siempre el mismo

export function useLiveSong() {
  const queryClient = useQueryClient();
  const { isDemo } = useAuth();

  // Listener en tiempo real
  useEffect(() => {
    // En demo no hay viewers en otro dispositivo escuchando: alcanza con el
    // cache local, que actualizan setLiveSong/clearLiveSong más abajo. Se
    // resetea siempre a null para no arrastrar la sesión en vivo real que
    // haya quedado cacheada de una sesión anterior.
    if (isDemo) {
      queryClient.setQueryData<SongDTO | null>(["liveSong"], null);
      return;
    }

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
  }, [queryClient, isDemo]);

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
      if (isDemo) {
        queryClient.setQueryData(["liveSong"], song);
        return;
      }
      const ref = doc(db, "liveSong", LIVE_SONG_DOC);
      await setDoc(ref, song); // sobreescribe, no acumula
    },
  });

  // Termina la sesión en vivo: borra el documento para que los viewers
  // dejen de ver la última canción publicada.
  const clearLiveSong = useMutation({
    mutationFn: async () => {
      if (isDemo) {
        queryClient.setQueryData(["liveSong"], null);
        return;
      }
      const ref = doc(db, "liveSong", LIVE_SONG_DOC);
      await deleteDoc(ref);
    },
  });

  return { liveSong, setLiveSong, clearLiveSong };
}
