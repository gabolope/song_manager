import type { SongDTO, SongTipo } from "../types/song";

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

export function formatSongMeta(song: SongDTO): string {
  return song.key ?? "";
}
