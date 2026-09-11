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
  // Solo presente en canciones del "book": posición manual dentro de la
  // sesión. Ausente en canciones que nunca se reordenaron (se ordenan por
  // createdAt como fallback, ver useBook.ts).
  order?: number;
  // Desplazamiento en semitonos aplicado en vivo dentro de la sesión actual
  // (ver useSessionState.ts). Nunca se persiste en las colecciones "songs" ni
  // "book": solo viaja en el documento efímero "liveSong" para sincronizar a
  // los músicos, y no debe escribirse al editar la canción del repertorio.
  transpose?: number;
  // Tono preferido por director (uid -> tono), para que cada uno pueda leer
  // esta canción en un tono distinto sin afectar a los demás. A diferencia
  // de `transpose`, esto sí es parte del repertorio: se edita desde
  // EditSongDialog y persiste en la colección "songs".
  keysByDirector?: Record<string, string>;
}
