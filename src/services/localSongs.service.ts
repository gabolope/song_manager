import ChordSheetJS from "chordsheetjs";

const rawSongs = import.meta.glob("./songs/*.chordpro", {
  eager: true,
  as: "raw",
});

type MySong = any;

export function getLocalSongs(): MySong[] {
  const parser = new ChordSheetJS.ChordProParser();

  return Object.values(rawSongs).map((song: any, i) => {
    const parsed = parser.parse(song);
    return { ...parsed, id: i };
  });
}
