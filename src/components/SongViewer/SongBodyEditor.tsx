import { IconButton } from "@chakra-ui/react";
import { IoAdd, IoTrash } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import {
  newEditorLine,
  newEditorSection,
  type EditorLine,
  type EditorSection,
  type SectionKind,
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
                  <div className="bodyLinePair">
                    <input
                      className="bodyChordsRow"
                      value={line.chords}
                      placeholder=" "
                      spellCheck={false}
                      onChange={(e) =>
                        updateLine(section.id, line.id, {
                          ...line,
                          chords: e.target.value,
                        })
                      }
                    />
                    <input
                      className="bodyLyricRow"
                      value={line.lyric}
                      placeholder="letra"
                      spellCheck={false}
                      onChange={(e) =>
                        updateLine(section.id, line.id, {
                          ...line,
                          lyric: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <IconButton
                  aria-label="Eliminar línea"
                  size="2xs"
                  variant="ghost"
                  colorPalette="red"
                  className="bodyLineRemove"
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
