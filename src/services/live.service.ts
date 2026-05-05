import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export async function uploadBook(list: any[]) {
  await setDoc(doc(db, "live", "book"), {
    songs: list.map((song) => ({
      title: song.title,
      tone: song.key,
      id: song.id,
    })),
  });
}

export async function changeSharedSong(song: any) {
  await setDoc(doc(db, "live", "current"), {
    song: song.title,
    tone: song.key,
    id: song.id,
  });
}
