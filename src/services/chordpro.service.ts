import ChordSheetJS from "chordsheetjs";
import DOMPurify from "dompurify";

const parser = new ChordSheetJS.ChordProParser();
const formatter = new ChordSheetJS.HtmlDivFormatter();

export function parseChordPro(content: string) {
  return parser.parse(content);
}

export function formatSong(content: string): string {
  try {
    const song = parser.parse(content);
    const html = formatter.format(song);
    const cleaned = html.replace(/<div class="paragraph[^"]*">\s*<\/div>/g, "");
    return DOMPurify.sanitize(cleaned);
  } catch (error) {
    console.error("Error al interpretar el archivo ChordPro:", error);
    return `<div class="chordProError">No se pudo mostrar esta canción: el archivo parece estar dañado o mal formateado.</div>`;
  }
}
