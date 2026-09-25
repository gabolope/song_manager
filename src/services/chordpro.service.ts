import ChordSheetJS, { Key } from "chordsheetjs";
import DOMPurify from "dompurify";

const parser = new ChordSheetJS.ChordProParser();
const formatter = new ChordSheetJS.HtmlDivFormatter();

// chordsheetjs descarta cualquier tramo de letra que termine siendo
// puramente espacios en blanco: tanto al tokenizar (cada "palabra" nueva
// arranca sin el espacio que la precede) como al renderizar el HTML (su
// template colapsa con una regex interna cualquier <div class="lyrics">
// cuyo contenido sea solo whitespace). Eso afecta a los acordes que no
// tienen letra debajo (instrumentales, o acordes después de la última
// palabra de una línea): la separación real que tienen en el ChordPro
// original se pierde por completo y quedan pegados al renderizar, sin
// importar cuántos espacios haya entre corchetes.
//
// Para evitarlo insertamos un caracter de ancho cero (U+200B) justo
// después de cada "]" que precede a un tramo de espacios seguido de un
// nuevo acorde "[": al no ser el tramo puramente whitespace, ni el
// tokenizer ni el template lo tocan, así que los espacios reales
// sobreviven y el ancho visual refleja la separación real del origen.
const ZERO_WIDTH_MARKER = "\u200B";

function preserveChordSpacing(content: string): string {
  return content.replace(
    /(^|\])( +)(?=\[)/gm,
    (_match, prefix: string, spaces: string) => `${prefix}${ZERO_WIDTH_MARKER}${spaces}`,
  );
}

export function parseChordPro(content: string) {
  return parser.parse(content);
}

// Letra "limpia" para buscar: saca directivas ({title:...}) y acordes
// ([Bb]) para que una palabra partida por un acorde en medio (ej. "Ere[Bb]s")
// siga siendo encontrable como "Eres".
export function stripChordProMarkup(content: string): string {
  return content.replace(/\{[^}]*\}/g, " ").replace(/\[[^\]]*\]/g, "");
}

// Secciones sin etiqueta ({soc}, {sob}, {sop}...) muestran su tipo como
// título, con el mismo markup que chordsheetjs usa para {soc:Etiqueta}.
const DEFAULT_LABEL: Record<string, string> = {
  verse: "Estrofa",
  part: "Estrofa",
  chorus: "Coro",
  bridge: "Puente",
};
const UNLABELED_SECTION_RE =
  /<div class="paragraph (verse|part|chorus|bridge)">(?!\s*<div class="row">\s*<h3 class="label">)/g;

// `transpose` es un desplazamiento en semitonos aplicado solo al render: no
// modifica `content`, así que nunca se persiste en el repertorio.
export function formatSong(content: string, transpose = 0): string {
  try {
    let song = parser.parse(preserveChordSpacing(content));
    if (transpose) song = song.transpose(transpose);
    const html = formatter.format(song);
    const cleaned = html
      .replace(/<div class="paragraph[^"]*">\s*<\/div>/g, "")
      .replace(UNLABELED_SECTION_RE, (match, kind: string) =>
        `${match}<div class="row"><h3 class="label">${DEFAULT_LABEL[kind]}</h3></div>`,
      );
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
