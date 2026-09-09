// Convierte el cuerpo de una canción en ChordPro hacia/desde un modelo de
// edición estructurado (secciones -> líneas -> pares acorde/letra) para que
// se pueda editar en el mismo formato visual que muestra SongViewer, en vez
// de como texto ChordPro crudo.
//
// El modelo cubre lo que efectivamente genera el uploader y lo que traen los
// archivos reales: directivas de metadata al inicio ({t:}/{artist:}/{key:}),
// secciones delimitadas por {sop:Label}/{eop} (estrofa) y {soc}/{eoc} (coro),
// y líneas de letra con acordes entre corchetes ([G]letra). Cualquier otra
// directiva dentro del cuerpo se preserva tal cual como línea "raw" para no
// perder información, aunque no se pueda editar visualmente.

export interface Segment {
  id: string;
  chord: string;
  lyric: string;
}

export type EditorLine = { id: string } & (
  | { type: "segments"; segments: Segment[] }
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

function newSegment(chord: string, lyric: string): Segment {
  return { id: nextEditorId(), chord, lyric };
}

const SOP_RE =
  /^\{\s*(?:sop|start_of_part|sov|start_of_verse)\s*(?::\s*(?:label\s*=\s*)?"?([^"}]*?)"?\s*)?\}\s*$/i;
const EOP_RE = /^\{\s*(?:eop|end_of_part|eov|end_of_verse)\s*\}\s*$/i;
const SOC_RE =
  /^\{\s*(?:soc|start_of_chorus)\s*(?::\s*(?:label\s*=\s*)?"?([^"}]*?)"?\s*)?\}\s*$/i;
const EOC_RE = /^\{\s*(?:eoc|end_of_chorus)\s*\}\s*$/i;
const DIRECTIVE_RE = /^\{.*\}\s*$/;

// Separa una línea de letra en segmentos acorde+letra, ej.
// "[G]Amazing grace, how [C]sweet" ->
// [{chord:"G", lyric:"Amazing grace, how "}, {chord:"C", lyric:"sweet"}]
export function parseLineSegments(line: string): Segment[] {
  if (!line.includes("[")) return [newSegment("", line)];

  const segments: Segment[] = [];
  const parts = line.split(/(\[[^\]]*\])/);
  let pendingChord = "";

  for (const part of parts) {
    if (part === "") continue;
    const bracketMatch = part.match(/^\[([^\]]*)\]$/);
    if (bracketMatch) {
      if (pendingChord) segments.push(newSegment(pendingChord, ""));
      pendingChord = bracketMatch[1];
    } else {
      segments.push(newSegment(pendingChord, part));
      pendingChord = "";
    }
  }
  if (pendingChord) segments.push(newSegment(pendingChord, ""));

  return segments;
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
        current.lines.push({ id: nextEditorId(), type: "segments", segments: [] });
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
      current.lines.push({
        id: nextEditorId(),
        type: "segments",
        segments: parseLineSegments(line),
      });
    }
  }
  closeCurrent();

  if (sections.length === 0) {
    sections.push({
      id: nextEditorId(),
      kind: "verse",
      label: "",
      lines: [
        { id: nextEditorId(), type: "segments", segments: [newSegment("", "")] },
      ],
    });
  }

  return { header: headerLines.join("\n"), sections };
}

export function newEditorSegment(chord = "", lyric = ""): Segment {
  return newSegment(chord, lyric);
}

export function newEditorLine(): EditorLine {
  return { id: nextEditorId(), type: "segments", segments: [newSegment("", "")] };
}

export function newEditorSection(kind: SectionKind): EditorSection {
  return { id: nextEditorId(), kind, label: "", lines: [newEditorLine()] };
}

function serializeSegments(segments: Segment[]): string {
  return segments.map((s) => (s.chord ? `[${s.chord}]` : "") + s.lyric).join("");
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
        line.type === "raw" ? line.text : serializeSegments(line.segments),
      );
      return [open, ...lines, close].join("\n");
    })
    .join("\n\n");

  return header ? `${header}\n\n${body}\n` : `${body}\n`;
}
