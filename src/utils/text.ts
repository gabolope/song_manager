// Normaliza texto para comparar en búsquedas: minúsculas y sin tildes ni
// diéresis (usa NFD + saca las marcas diacríticas combinantes U+0300-U+036F),
// así "cancion" encuentra "canción" y "nino" encuentra "niño" (la ñ se
// descompone en "n" + tilde combinante bajo NFD).
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase();
}
