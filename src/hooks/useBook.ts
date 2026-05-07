import type { SongDTO } from "../types/song";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { useEffect } from "react";

const useBook = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const q = query(collection(db, "book"), orderBy("createdAt"));

    // Utilizo onSnapshot para abrir una conexión persistente con Firestore, cada vez que el book cambia Firestore pushea el cambio
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SongDTO[];

      // Actualizo el cache directamente, sin hacer un fetch
      queryClient.setQueryData(["book"], songs);
    });
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
