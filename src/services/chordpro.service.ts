import ChordSheetJS, { Key } from "chordsheetjs";
import DOMPurify from "dompurify";

const parser = new ChordSheetJS.ChordProParser();
const formatter = new ChordSheetJS.HtmlDivFormatter();

export function parseChordPro(content: string) {
  return parser.parse(content);
}

// Letra "limpia" para buscar: saca directivas ({title:...}) y acordes
// ([Bb]) para que una palabra partida por un acorde en medio (ej. "Ere[Bb]s")
// siga siendo encontrable como "Eres".
export function stripChordProMarkup(content: string): string {
  return content.replace(/\{[^}]*\}/g, " ").replace(/\[[^\]]*\]/g, "");
}

// `transpose` es un desplazamiento en semitonos aplicado solo al render: no
// modifica `content`, así que nunca se persiste en el repertorio.
export function formatSong(content: string, transpose = 0): string {
  try {
    let song = parser.parse(content);
    if (transpose) song = song.transpose(transpose);
    const html = formatter.format(song);
    const cleaned = html.replace(/<div class="paragraph[^"]*">\s*<\/div>/g, "");
    return DOMPurify.sanitize(cleaned);
  } catch (error) {
    console.error("Error al interpretar el archivo ChordPro:", error);
    return `<div class="chordProError">No se pudo mostrar esta canción: el archivo parece estar dañado o mal formateado.</div>`;
  }
}

// Traspone únicamente la etiqueta de tono mostrada (ej. "Tono: Bb") para que
// coincida con lo que hace formatSong sobre los acordes, sin tocar el campo
// `key` original de la canción (ese es el del repertorio).
export function transposeKeyLabel(
  key: string | undefined,
  transpose: number,
): string | undefined {
  if (!key || !transpose) return key;
  const parsed = Key.parse(key);
  if (!parsed) return key;
  return parsed.transpose(transpose).toString();
}
