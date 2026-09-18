import { Box } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import type { SongDTO } from "@/types/song";
import { parseChordProBody } from "@/utils/chordProBody";
import "./LyricViewer.css";

interface Props {
  song: SongDTO;
  fontScale?: number;
  fontFamily?: string;
}

const ACCENTS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  Á: "A",
  É: "E",
  Í: "I",
  Ó: "O",
  Ú: "U",
  Ü: "U",
};

// Saca tildes de las vocales (deja la ñ intacta) y descarta marcadores de
// repetición sueltos en la letra (ej. "//") que quedan del formato original,
// no de acordes.
function normalizeLyric(text: string): string {
  return text
    .replace(/[áéíóúüÁÉÍÓÚÜ]/g, (c) => ACCENTS[c])
    .replace(/[/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/,\s*/g, ",\n"); // salto de línea después de cada coma
}

// Aplana las secciones de parseChordProBody a solo texto de letra, sin
// acordes ni directivas: descarta líneas "raw" (directivas sueltas) y pares
// sin letra (separadores en blanco dentro de una sección explícita).
function flattenLyricLines(content: string): string[] {
  const { sections } = parseChordProBody(content);
  const lines: string[] = [];
  for (const section of sections) {
    for (const line of section.lines) {
      if (line.type === "pair") {
        const lyric = normalizeLyric(line.lyric);
        if (lyric !== "") lines.push(lyric);
      }
    }
  }
  return lines;
}

const LyricViewer = ({ song, fontScale = 1, fontFamily }: Props) => {
  const lines = useMemo(() => flattenLyricLines(song.content), [song.content]);
  const [current, setCurrent] = useState(0);

  useEffect(() => setCurrent(0), [song.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setCurrent((i) => Math.min(i + 1, lines.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrent((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lines.length]);

  if (lines.length === 0) {
    return (
      <Box className="lyricViewerEmpty">Esta canción no tiene letra cargada</Box>
    );
  }

  // Click en la mitad izquierda/derecha de la pantalla navega prev/next,
  // como un teleprompter: no hace falta lista de líneas ni botones propios.
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const isRightHalf = e.clientX - left > width / 2;
    setCurrent((i) =>
      isRightHalf
        ? Math.min(i + 1, lines.length - 1)
        : Math.max(i - 1, 0),
    );
  };

  return (
    <Box
      className="lyricViewer"
      onClick={onClick}
      style={{
        fontSize: `calc(clamp(0.9rem, 9vw, 8rem) * ${fontScale})`,
        fontFamily,
      }}
    >
      {lines[current]}
    </Box>
  );
};

export default LyricViewer;
