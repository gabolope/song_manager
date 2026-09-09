import { IconButton } from "@chakra-ui/react";
import { Fragment } from "react";
import { IoAdd, IoClose, IoTrash } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import {
  newEditorLine,
  newEditorSection,
  newEditorSegment,
  type EditorLine,
  type EditorSection,
  type SectionKind,
  type Segment,
} from "@/utils/chordProBody";
import "./SongBodyEditor.css";

interface Props {
  sections: EditorSection[];
  onChange: (sections: EditorSection[]) => void;
}

const SECTION_LABEL: Record<SectionKind, string> = {
  verse: "Estrofa",
  chorus: "Coro",
};

// Ancho aproximado del input según lo tecleado, para que el editor se vea
// como el pentagrama de acordes/letra real en vez de una grilla de inputs.
function chWidth(value: string, min: number): string {
  return `${Math.max(min, value.length + 1)}ch`;
}

const SongBodyEditor = ({ sections, onChange }: Props) => {
  const updateSection = (id: string, patch: Partial<EditorSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const addSection = (kind: SectionKind) => {
    onChange([...sections, newEditorSection(kind)]);
  };

  const updateLine = (sectionId: string, lineId: string, line: EditorLine) => {
    updateSection(sectionId, {
      lines: sections
        .find((s) => s.id === sectionId)!
        .lines.map((l) => (l.id === lineId ? line : l)),
    });
  };

  const addLine = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)!;
    updateSection(sectionId, { lines: [...section.lines, newEditorLine()] });
  };

  const removeLine = (sectionId: string, lineId: string) => {
    const section = sections.find((s) => s.id === sectionId)!;
    updateSection(sectionId, {
      lines: section.lines.filter((l) => l.id !== lineId),
    });
  };

  const updateSegment = (
    sectionId: string,
    lineId: string,
    segmentId: string,
    patch: Partial<Segment>,
  ) => {
    const section = sections.find((s) => s.id === sectionId)!;
    const line = section.lines.find((l) => l.id === lineId)!;
    if (line.type !== "segments") return;
    updateLine(sectionId, lineId, {
      ...line,
      segments: line.segments.map((seg) =>
        seg.id === segmentId ? { ...seg, ...patch } : seg,
      ),
    });
  };

  const addSegment = (sectionId: string, lineId: string) => {
    const section = sections.find((s) => s.id === sectionId)!;
    const line = section.lines.find((l) => l.id === lineId)!;
    if (line.type !== "segments") return;
    updateLine(sectionId, lineId, {
      ...line,
      segments: [...line.segments, newEditorSegment()],
    });
  };

  const removeSegment = (sectionId: string, lineId: string, segmentId: string) => {
    const section = sections.find((s) => s.id === sectionId)!;
    const line = section.lines.find((l) => l.id === lineId)!;
    if (line.type !== "segments") return;
    const segments = line.segments.filter((seg) => seg.id !== segmentId);
    updateLine(sectionId, lineId, {
      ...line,
      segments: segments.length ? segments : [newEditorSegment()],
    });
  };

  return (
    <div className="bodyEditor">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={
            section.kind === "chorus" ? "bodySection isChorus" : "bodySection"
          }
        >
          <div className="bodySectionHeader">
            <select
              className="bodySectionKind"
              value={section.kind}
              onChange={(e) =>
                updateSection(section.id, {
                  kind: e.target.value as SectionKind,
                })
              }
            >
              <option value="verse">{SECTION_LABEL.verse}</option>
              <option value="chorus">{SECTION_LABEL.chorus}</option>
            </select>
            <input
              className="bodySectionLabel"
              placeholder="Etiqueta (ej. Estrofa 1)"
              value={section.label}
              onChange={(e) =>
                updateSection(section.id, { label: e.target.value })
              }
            />
            <div className="bodySectionActions">
              <IconButton
                aria-label="Mover sección arriba"
                size="xs"
                variant="ghost"
                disabled={index === 0}
                onClick={() => moveSection(index, -1)}
              >
                <IoIosArrowUp />
              </IconButton>
              <IconButton
                aria-label="Mover sección abajo"
                size="xs"
                variant="ghost"
                disabled={index === sections.length - 1}
                onClick={() => moveSection(index, 1)}
              >
                <IoIosArrowDown />
              </IconButton>
              <IconButton
                aria-label="Eliminar sección"
                size="xs"
                variant="ghost"
                colorPalette="red"
                disabled={sections.length === 1}
                onClick={() => removeSection(section.id)}
              >
                <IoTrash />
              </IconButton>
            </div>
          </div>

          <div className="bodySectionLines">
            {section.lines.map((line) => (
              <div key={line.id} className="bodyLine">
                {line.type === "raw" ? (
                  <input
                    className="bodyRawInput"
                    value={line.text}
                    onChange={(e) =>
                      updateLine(section.id, line.id, {
                        ...line,
                        text: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="bodyLineSegments">
                    {line.segments.map((seg) => (
                      <Fragment key={seg.id}>
                        <div className="bodySegment">
                          <input
                            className="bodyChordInput"
                            value={seg.chord}
                            placeholder="·"
                            style={{ width: chWidth(seg.chord, 2) }}
                            onChange={(e) =>
                              updateSegment(section.id, line.id, seg.id, {
                                chord: e.target.value,
                              })
                            }
                          />
                          <input
                            className="bodyLyricInput"
                            value={seg.lyric}
                            placeholder="letra"
                            style={{ width: chWidth(seg.lyric, 4) }}
                            onChange={(e) =>
                              updateSegment(section.id, line.id, seg.id, {
                                lyric: e.target.value,
                              })
                            }
                          />
                        </div>
                        <IconButton
                          aria-label="Quitar acorde"
                          size="2xs"
                          variant="ghost"
                          className="bodySegmentRemove"
                          onClick={() =>
                            removeSegment(section.id, line.id, seg.id)
                          }
                        >
                          <IoClose />
                        </IconButton>
                      </Fragment>
                    ))}
                    <IconButton
                      aria-label="Agregar acorde"
                      size="2xs"
                      variant="outline"
                      onClick={() => addSegment(section.id, line.id)}
                    >
                      <IoAdd />
                    </IconButton>
                  </div>
                )}
                <IconButton
                  aria-label="Eliminar línea"
                  size="2xs"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => removeLine(section.id, line.id)}
                >
                  <IoTrash />
                </IconButton>
              </div>
            ))}
            <button
              type="button"
              className="bodyAddLineBtn"
              onClick={() => addLine(section.id)}
            >
              <IoAdd /> Línea
            </button>
          </div>
        </div>
      ))}

      <div className="bodyAddSectionRow">
        <button
          type="button"
          className="bodyAddSectionBtn"
          onClick={() => addSection("verse")}
        >
          <IoAdd /> Estrofa
        </button>
        <button
          type="button"
          className="bodyAddSectionBtn"
          onClick={() => addSection("chorus")}
        >
          <IoAdd /> Coro
        </button>
      </div>
    </div>
  );
};

export default SongBodyEditor;
