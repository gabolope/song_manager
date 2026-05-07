import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

function extractMetadata(content: string) {
  const titleMatch = content.match(/{t:(.*?)}/);
  const artistMatch = content.match(/{artist:(.*?)}/);
  const keyMatch = content.match(/{key:(.*?)}/);

  return {
    title: titleMatch?.[1]?.trim() ?? "Sin título",
    artist: artistMatch?.[1]?.trim() ?? "",
    key: keyMatch?.[1]?.trim() ?? "",
  };
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function useSongUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      // traigo todos los títulos existentes una sola vez
      const snapshot = await getDocs(collection(db, "songs"));
      const existingTitles = new Set(snapshot.docs.map((d) => d.data().title));

      const batch = writeBatch(db);
      let count = 0;

      for (const file of files) {
        const content = await readFileAsText(file);
        const { title, artist, key } = extractMetadata(content);

        if (existingTitles.has(title)) continue; // ya existe, la saltea

        const ref = doc(collection(db, "songs"));
        batch.set(ref, { title, artist, key, content });
        count++;
      }

      if (count === 0) return; // nada para subir
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}
