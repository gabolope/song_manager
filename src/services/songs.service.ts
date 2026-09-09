import {
  collection,
  deleteField,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { SongDTO } from "../types/song";

export async function fetchSongs(): Promise<SongDTO[]> {
  const q = query(collection(db, "songs"), orderBy("title"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title ?? "",
      content: data.content ?? "",
      key: data.key ?? "",
      tipo: data.tipo,
      tempo: data.tempo,
    };
  });
}

export type SongEditInput = Pick<
  SongDTO,
  "title" | "artist" | "key" | "tipo" | "tempo" | "content"
>;

export async function updateSong(
  id: string,
  data: SongEditInput,
): Promise<void> {
  // Firestore rechaza `undefined`; los campos opcionales que el usuario
  // vació se borran del documento en vez de omitirse (si se omitieran,
  // updateDoc dejaría el valor viejo).
  const payload = {
    title: data.title,
    artist: data.artist ?? deleteField(),
    key: data.key ?? deleteField(),
    tipo: data.tipo ?? deleteField(),
    tempo: data.tempo ?? deleteField(),
    content: data.content,
  };
  await updateDoc(doc(db, "songs", id), payload);
}
