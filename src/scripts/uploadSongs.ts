import { collection, writeBatch, doc } from "firebase/firestore";
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

export async function uploadSongsFromFiles() {
  const rawSongs = import.meta.glob("../songs/*.chordpro", {
    eager: true,
    as: "raw",
  });

  const batch = writeBatch(db);

  Object.values(rawSongs).forEach((content: any) => {
    const { title, artist, key } = extractMetadata(content);

    const ref = doc(collection(db, "songs"));

    batch.set(ref, {
      title,
      artist,
      key,
      content,
    });
  });

  await batch.commit();
}
