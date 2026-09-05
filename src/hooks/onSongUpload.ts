import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { toaster } from "../components/ui/toaster";

// Soporta tanto la forma abreviada ({t:}, {k:}) como la forma completa
// ({title:}, {key:}) del estándar ChordPro.
function matchDirective(
  content: string,
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const match = content.match(new RegExp(`\\{${name}:(.*?)\\}`, "i"));
    if (match?.[1] !== undefined) return match[1].trim();
  }
  return undefined;
}

function extractMetadata(content: string) {
  return {
    title: matchDirective(content, "title", "t") ?? "Sin título",
    artist: matchDirective(content, "artist") ?? "",
    key: matchDirective(content, "key", "k") ?? "",
  };
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error(`No se pudo leer el archivo "${file.name}"`));
    reader.readAsText(file);
  });
}

interface UploadSummary {
  added: number;
  duplicates: string[];
  failed: { file: string; error: string }[];
}

export function useSongUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]): Promise<UploadSummary> => {
      const snapshot = await getDocs(collection(db, "songs"));
      const existingTitles = new Set(snapshot.docs.map((d) => d.data().title));

      const batch = writeBatch(db);
      const duplicates: string[] = [];
      const failed: { file: string; error: string }[] = [];
      let count = 0;

      for (const file of files) {
        try {
          const content = await readFileAsText(file);
          const { title, artist, key } = extractMetadata(content);

          if (existingTitles.has(title)) {
            duplicates.push(file.name);
            continue;
          }

          // Se agrega de inmediato para detectar duplicados dentro del mismo lote.
          existingTitles.add(title);
          const ref = doc(collection(db, "songs"));
          batch.set(ref, { title, artist, key, content });
          count++;
        } catch (error) {
          failed.push({
            file: file.name,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }

      if (count > 0) await batch.commit();

      return { added: count, duplicates, failed };
    },
    onSuccess: (summary) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });

      const parts = [`${summary.added} canción(es) subida(s)`];
      if (summary.duplicates.length)
        parts.push(
          `${summary.duplicates.length} omitida(s) por título duplicado`,
        );
      if (summary.failed.length)
        parts.push(`${summary.failed.length} fallaron`);

      toaster.create({
        type: summary.failed.length > 0 ? "warning" : "success",
        title: "Subida de canciones",
        description: parts.join(" · "),
      });
    },
    onError: (error) => {
      toaster.create({
        type: "error",
        title: "No se pudieron subir las canciones",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    },
  });
}
