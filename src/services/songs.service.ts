import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { SongDTO } from "../types/song";

export async function fetchSongs(): Promise<SongDTO[]> {
  const querySnapshot = await getDocs(collection(db, "songs"));

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title ?? "",
      content: data.content ?? "",
      key: data.key ?? "",
    };
  });
}
