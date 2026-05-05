import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { SongDTO } from "../types/song";

export async function fetchBook(): Promise<SongDTO[]> {
  const querySnapshot = await getDocs(collection(db, "book"));

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      docId: doc.id, //esto puede volar?
      id: data.id,
      title: data.title ?? "",
      content: data.content ?? "",
      key: data.key ?? "",
    };
  });
}
