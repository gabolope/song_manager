import type { Timestamp } from "firebase/firestore";

export type SongTipo = "rapida" | "intermedia" | "lenta";

export interface SongDTO {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  // Clasificación de velocidad, derivada del sufijo numérico (1/2/3) de la
  // notación manual vieja (A1, B2, C3...) al momento de subir la canción.
  tipo?: SongTipo;
  // BPM real, solo cuando el archivo chordpro trae la directiva {tempo:}.
  // Es independiente de `tipo`: no todas las canciones con tipo tienen tempo.
  tempo?: number;
  content: string;
  // Solo presente en canciones del "book": Firestore lo resuelve a null hasta
  // que el servidor confirma el serverTimestamp() con el que se escribió.
  createdAt?: Timestamp | null;
}
