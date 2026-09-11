import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  writeBatch,
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
      keysByDirector: data.keysByDirector,
    };
  });
}

export type SongEditInput = Pick<
  SongDTO,
  "title" | "artist" | "key" | "tipo" | "tempo" | "content" | "keysByDirector"
>;

const LIVE_SONG_DOC = "current"; // documento fijo, siempre el mismo (ver useLiveSong)

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
    keysByDirector:
      data.keysByDirector && Object.keys(data.keysByDirector).length > 0
        ? data.keysByDirector
        : deleteField(),
  };

  const batch = writeBatch(db);
  batch.update(doc(db, "songs", id), payload);

  // El repertorio ("book") y la canción en vivo guardan una copia propia de
  // la canción (no una referencia), así que hay que propagarles la edición
  // a mano para que no queden mostrando la versión vieja.
  const bookRef = doc(db, "book", id);
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    batch.update(bookRef, payload);
  }

  const liveSongRef = doc(db, "liveSong", LIVE_SONG_DOC);
  const liveSongSnap = await getDoc(liveSongRef);
  if (liveSongSnap.exists() && liveSongSnap.data()?.id === id) {
    batch.update(liveSongRef, payload);
  }

  await batch.commit();
}
