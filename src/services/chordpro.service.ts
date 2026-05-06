import ChordSheetJS from "chordsheetjs";

const parser = new ChordSheetJS.ChordProParser();
const formatter = new ChordSheetJS.HtmlDivFormatter();

export function parseChordPro(content: string) {
  return parser.parse(content);
}

export function formatSong(content: string): string {
  const song = parser.parse(content);
  return formatter.format(song);
}
