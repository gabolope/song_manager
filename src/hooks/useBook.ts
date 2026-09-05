import type { SongDTO } from "../types/song";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { useEffect } from "react";
import { toaster } from "../components/ui/toaster";

const useBook = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const q = query(collection(db, "book"), orderBy("createdAt"));

    // Utilizo onSnapshot para abrir una conexión persistente con Firestore, cada vez que el book cambia Firestore pushea el cambio
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const songs = snapshot.docs.map((doc) => ({
          id: doc.id,
          // "estimate" evita que una escritura recién hecha (createdAt aún
          // no confirmado por el servidor) se lea como null y salte al
          // principio del orden hasta que se resuelva.
          ...doc.data({ serverTimestamps: "estimate" }),
        })) as SongDTO[];

        // Actualizo el cache directamente, sin hacer un fetch
        queryClient.setQueryData(["book"], songs);
      },
      (error) => {
        // Si el listener falla (permisos, desconexión), avisar en vez de
        // quedar desactualizado en silencio para siempre.
        console.error("Error escuchando el repertorio:", error);
        toaster.create({
          type: "error",
          title: "Se perdió la conexión con el repertorio",
          description: "Recargá la página para volver a sincronizarlo.",
        });
      },
    );
    return () => unsubscribe();
  }, [queryClient]);

  // Ahora uso useQuery solo para leer del cache, sin queryFn que haga fetch
  return useQuery<SongDTO[], Error>({
    queryKey: ["book"],
    queryFn: () => [], // nunca se ejecuta, solo silencia el error
    staleTime: Infinity,
    enabled: false,
  });
};

export default useBook;
