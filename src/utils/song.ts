import {
  stripChordProMarkup,
  transposeKeyLabel,
} from "../services/chordpro.service";
import type { SongDTO, SongIdioma, SongTipo } from "../types/song";
import { normalizeForSearch } from "./text";

export const TIPO_LABEL: Record<SongTipo, string> = {
  rapida: "Rápida",
  intermedia: "Intermedia",
  lenta: "Lenta",
};

export const TIPO_COLOR: Record<SongTipo, "blue" | "green" | "red"> = {
  rapida: "blue",
  intermedia: "green",
  lenta: "red",
};

const TIPO_ORDER: Record<SongTipo, number> = {
  rapida: 0,
  intermedia: 1,
  lenta: 2,
};

export function compareByKeyThenTipo(a: SongDTO, b: SongDTO): number {
  if (!a.key !== !b.key) return a.key ? -1 : 1;
  const keyCompare = (a.key ?? "").localeCompare(b.key ?? "");
  if (keyCompare !== 0) return keyCompare;
  const tipoA = a.tipo ? TIPO_ORDER[a.tipo] : Infinity;
  const tipoB = b.tipo ? TIPO_ORDER[b.tipo] : Infinity;
  return tipoA - tipoB;
}

// El asterisco marca que el tono mostrado no es el original de la canción,
// sino el transportado para esta sesión (ver DirectorPage/useBookMutations).
export function formatSongMeta(song: SongDTO): string {
  if (!song.transpose) return song.key ?? "";
  const transposed = transposeKeyLabel(song.key, song.transpose);
  return transposed ? `${transposed}*` : "";
}

export const IDIOMA_LABEL: Record<SongIdioma, string> = {
  es: "Español",
  en: "Inglés",
};

// Palabras muy frecuentes que no existen en el otro idioma (se dejan afuera
// las ambiguas como "a", "no", "me", "he").
// ponytail: solo español/inglés por conteo de palabras; si aparece otro
// idioma, sumar su lista acá y a SongIdioma.
const IDIOMA_WORDS: Record<SongIdioma, Set<string>> = {
  es: new Set(
    "el la los las de del que y en un una es por con para mi tu te tus mis su sus se nos yo eres soy esta estas como mas pero cuando quien donde todo dios senor jesus".split(" "),
  ),
  en: new Set(
    "the and you your of to is in i my it that for with on be all we our will are love lord god his this there".split(" "),
  ),
};

// Detecta el idioma de la letra (sin acordes ni directivas). Devuelve
// undefined si no hay palabras reconocibles o empatan.
export function detectIdioma(content: string): SongIdioma | undefined {
  const words = normalizeForSearch(stripChordProMarkup(content)).match(
    /[a-z]+/g,
  );
  let es = 0;
  let en = 0;
  words?.forEach((w) => {
    if (IDIOMA_WORDS.es.has(w)) es++;
    if (IDIOMA_WORDS.en.has(w)) en++;
  });
  if (es === en) return undefined;
  return es > en ? "es" : "en";
}
