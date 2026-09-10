// Convierte el cuerpo de una canción en ChordPro hacia/desde un modelo de
// edición estructurado (secciones -> líneas -> par acordes/letra) para que
// se pueda editar como una tablatura de texto plano: una línea de acordes
// alineada carácter a carácter sobre su línea de letra correspondiente, tal
// como se ve en SongViewer, en vez de como texto ChordPro crudo con [acorde].
//
// El modelo cubre lo que efectivamente genera el uploader y lo que traen los
// archivos reales: directivas de metadata al inicio ({t:}/{artist:}/{key:}),
// secciones delimitadas por {sop:Label}/{eop} (estrofa) y {soc}/{eoc} (coro),
// y líneas de letra con acordes entre corchetes ([G]letra). Cualquier otra
// directiva dentro del cuerpo se preserva tal cual como línea "raw" para no
// perder información, aunque no se pueda editar visualmente.

export type EditorLine = { id: string } & (
  | { type: "pair"; chords: string; lyric: string }
  | { type: "raw"; text: string }
);

export type SectionKind = "verse" | "chorus";

export interface EditorSection {
  id: string;
  kind: SectionKind;
  label: string;
  lines: EditorLine[];
}

let idCounter = 0;
export function nextEditorId(): string {
  idCounter += 1;
  return `id${idCounter}`;
}

function newPairLine(chords: string, lyric: string): EditorLine {
  return { id: nextEditorId(), type: "pair", chords, lyric };
}

const SOP_RE =
  /^\{\s*(?:sop|start_of_part|sov|start_of_verse)\s*(?::\s*(?:label\s*=\s*)?"?([^"}]*?)"?\s*)?\}\s*$/i;
const EOP_RE = /^\{\s*(?:eop|end_of_part|eov|end_of_verse)\s*\}\s*$/i;
const SOC_RE =
  /^\{\s*(?:soc|start_of_chorus)\s*(?::\s*(?:label\s*=\s*)?"?([^"}]*?)"?\s*)?\}\s*$/i;
const EOC_RE = /^\{\s*(?:eoc|end_of_chorus)\s*\}\s*$/i;
const DIRECTIVE_RE = /^\{.*\}\s*$/;

// Separa una línea de letra en su línea de acordes y su línea de letra,
// alineadas carácter a carácter, ej.
// "[G]Amazing grace, how [C]sweet" ->
// { chords: "G                   C", lyric: "Amazing grace, how sweet" }
// El acorde en la posición i de "chords" corresponde a la letra que empieza
// en la posición i de "lyric".
export function lineToChordsLyricPair(line: string): {
  chords: string;
  lyric: string;
} {
  if (!line.includes("[")) return { chords: "", lyric: line };

  let lyric = "";
  let chords = "";

  for (const part of line.split(/(\[[^\]]*\])/)) {
    if (part === "") continue;
    const bracketMatch = part.match(/^\[([^\]]*)\]$/);
    if (bracketMatch) {
      const chord = bracketMatch[1];
      if (!chord) continue;
      const insertAt = Math.max(chords.length, lyric.length);
      chords += " ".repeat(insertAt - chords.length) + chord;
    } else {
      lyric += part;
    }
  }

  return { chords: chords.trimEnd(), lyric };
}

export function parseChordProBody(content: string): {
  header: string;
  sections: EditorSection[];
} {
  const rawLines = content.split(/\r\n|\r|\n/);

  // El header es cualquier bloque inicial de directivas de metadata
  // ({title:}, {key:}, {x_chordle_*:}, etc.), sean o no reconocidas: se
  // preservan tal cual sin exponerlas en el editor visual. Termina apenas
  // aparece la primera línea de letra o un marcador de sección explícito.
  const headerLines: string[] = [];
  let i = 0;
  while (i < rawLines.length) {
    const trimmed = rawLines[i].trim();
    const isSectionMarker =
      SOP_RE.test(trimmed) ||
      SOC_RE.test(trimmed) ||
      EOP_RE.test(trimmed) ||
      EOC_RE.test(trimmed);
    if (trimmed === "" || (DIRECTIVE_RE.test(trimmed) && !isSectionMarker)) {
      headerLines.push(rawLines[i]);
      i++;
    } else break;
  }
  while (headerLines.length && headerLines[headerLines.length - 1].trim() === "") {
    headerLines.pop();
  }

  const sections: EditorSection[] = [];
  let current: EditorSection | null = null;
  let currentExplicit = false;

  const closeCurrent = () => {
    if (current && current.lines.length > 0) sections.push(current);
    current = null;
    currentExplicit = false;
  };

  for (; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      if (current && currentExplicit) {
        current.lines.push(newPairLine("", ""));
      } else if (current) {
        closeCurrent();
      }
      continue;
    }

    const sopMatch = trimmed.match(SOP_RE);
    const socMatch = !sopMatch ? trimmed.match(SOC_RE) : null;
    if (sopMatch || socMatch) {
      closeCurrent();
      current = {
        id: nextEditorId(),
        kind: socMatch ? "chorus" : "verse",
        label: ((sopMatch ?? socMatch)?.[1] ?? "").trim(),
        lines: [],
      };
      currentExplicit = true;
      continue;
    }
    if (EOP_RE.test(trimmed) || EOC_RE.test(trimmed)) {
      closeCurrent();
      continue;
    }

    if (!current) {
      current = { id: nextEditorId(), kind: "verse", label: "", lines: [] };
      currentExplicit = false;
    }

    if (DIRECTIVE_RE.test(trimmed)) {
      current.lines.push({ id: nextEditorId(), type: "raw", text: line });
    } else {
      const { chords, lyric } = lineToChordsLyricPair(line);
      current.lines.push(newPairLine(chords, lyric));
    }
  }
  closeCurrent();

  if (sections.length === 0) {
    sections.push({
      id: nextEditorId(),
      kind: "verse",
      label: "",
      lines: [newPairLine("", "")],
    });
  }

  return { header: headerLines.join("\n"), sections };
}

export function newEditorLine(): EditorLine {
  return newPairLine("", "");
}

export function newEditorSection(kind: SectionKind): EditorSection {
  return { id: nextEditorId(), kind, label: "", lines: [newEditorLine()] };
}

// Inversa de lineToChordsLyricPair: reconstruye "[G]Amazing grace, how [C]sweet"
// a partir de una línea de acordes y una de letra alineadas por posición.
export function chordsLyricPairToLine(chords: string, lyric: string): string {
  const tokens: { index: number; chord: string }[] = [];
  let i = 0;
  while (i < chords.length) {
    if (chords[i] === " ") {
      i++;
      continue;
    }
    let j = i + 1;
    while (j < chords.length && chords[j] !== " ") j++;
    tokens.push({ index: i, chord: chords.slice(i, j) });
    i = j;
  }
  if (tokens.length === 0) return lyric;

  let result = "";
  let pos = 0;
  for (const { index, chord } of tokens) {
    const at = Math.min(Math.max(index, pos), lyric.length);
    result += lyric.slice(pos, at) + `[${chord}]`;
    pos = at;
  }
  result += lyric.slice(pos);
  return result;
}

export function serializeChordProBody(
  header: string,
  sections: EditorSection[],
): string {
  const body = sections
    .map((section) => {
      const open =
        section.kind === "chorus"
          ? section.label
            ? `{soc:${section.label}}`
            : "{soc}"
          : section.label
            ? `{sop:${section.label}}`
            : "{sop}";
      const close = section.kind === "chorus" ? "{eoc}" : "{eop}";
      const lines = section.lines.map((line) =>
        line.type === "raw"
          ? line.text
          : chordsLyricPairToLine(line.chords, line.lyric),
      );
      return [open, ...lines, close].join("\n");
    })
    .join("\n\n");

  return header ? `${header}\n\n${body}\n` : `${body}\n`;
}
