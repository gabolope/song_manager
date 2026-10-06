import {
  deleteField,
  getDoc,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db, teamCol, teamDoc } from "./firebase";
import type { SongDTO } from "../types/song";

export async function fetchSongs(teamId: string | null): Promise<SongDTO[]> {
  const q = query(teamCol(teamId, "songs"), orderBy("title"));
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
  teamId: string | null,
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
  batch.update(teamDoc(teamId, "songs", id), payload);

  // El repertorio ("book") y la canción en vivo guardan una copia propia de
  // la canción (no una referencia), así que hay que propagarles la edición
  // a mano para que no queden mostrando la versión vieja.
  const bookRef = teamDoc(teamId, "book", id);
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    batch.update(bookRef, payload);
  }

  const liveSongRef = teamDoc(teamId, "liveSong", LIVE_SONG_DOC);
  const liveSongSnap = await getDoc(liveSongRef);
  if (liveSongSnap.exists() && liveSongSnap.data()?.id === id) {
    batch.update(liveSongRef, payload);
  }

  await batch.commit();
}

export async function deleteSong(
  teamId: string | null,
  id: string,
): Promise<void> {
  // Igual que updateSong: "book" y "liveSong" guardan copias propias de la
  // canción, así que hay que borrarlas a mano para no dejar referencias a
  // una canción que ya no existe en "songs".
  const batch = writeBatch(db);
  batch.delete(teamDoc(teamId, "songs", id));

  const bookRef = teamDoc(teamId, "book", id);
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    batch.delete(bookRef);
  }

  const liveSongRef = teamDoc(teamId, "liveSong", LIVE_SONG_DOC);
  const liveSongSnap = await getDoc(liveSongRef);
  if (liveSongSnap.exists() && liveSongSnap.data()?.id === id) {
    batch.delete(liveSongRef);
  }

  await batch.commit();
}
