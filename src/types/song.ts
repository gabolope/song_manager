import type { Timestamp } from "firebase/firestore";

export interface SongDTO {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  content: string;
  // Solo presente en canciones del "book": Firestore lo resuelve a null hasta
  // que el servidor confirma el serverTimestamp() con el que se escribió.
  createdAt?: Timestamp | null;
}
