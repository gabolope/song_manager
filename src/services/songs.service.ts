import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
    };
  });
}
