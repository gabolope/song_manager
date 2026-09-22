import { Box } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SongDTO } from "@/types/song";
import { parseChordProBody } from "@/utils/chordProBody";
import "./LyricViewer.css";

export type LyricMode = "line" | "section" | "song";
export type LyricTransition =
  "none" | "fade" | "slide" | "rise" | "zoom" | "blur";

// Tamaño base por modo: cuanto más texto entra en pantalla, más chica la letra.
const BASE_FONT_SIZE: Record<LyricMode, string> = {
  line: "clamp(0.9rem, 9vw, 8rem)",
  section: "clamp(0.8rem, 4vw, 4rem)",
  song: "clamp(0.7rem, 2vw, 2rem)",
};

interface Props {
  song: SongDTO;
  fontScale?: number;
  fontFamily?: string;
  mode?: LyricMode;
  transition?: LyricTransition;
  // Avisa si la letra se tuvo que achicar para entrar (no hay más lugar).
  onShrinkChange?: (shrunk: boolean) => void;
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

// Reduce las secciones de parseChordProBody a solo texto de letra, sin
// acordes ni directivas: descarta líneas "raw" (directivas sueltas) y pares
// sin letra (separadores en blanco dentro de una sección explícita).
function lyricSections(content: string): string[][] {
  return parseChordProBody(content)
    .sections.map((section) =>
      section.lines
        .flatMap((line) =>
          line.type === "pair" ? [normalizeLyric(line.lyric)] : [],
        )
        .filter((lyric) => lyric !== ""),
    )
    .filter((lines) => lines.length > 0);
}

// Agrupa la letra en "páginas" según el modo: cada una se muestra entera.
function lyricPages(content: string, mode: LyricMode): string[] {
  const sections = lyricSections(content);
  if (mode === "line") return sections.flat();
  const pages = sections.map((lines) => lines.join("\n"));
  return mode === "section" ? pages : [pages.join("\n\n")];
}

const LyricViewer = ({
  song,
  fontScale = 1,
  fontFamily,
  mode = "line",
  transition = "fade",
  onShrinkChange,
}: Props) => {
  const lines = useMemo(
    () => lyricPages(song.content, mode),
    [song.content, mode],
  );
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const baseFontSize = `calc(${BASE_FONT_SIZE[mode]} * ${fontScale})`;

  // Achica la letra hasta el tamaño máximo que entra entero en pantalla (sin
  // scroll). Búsqueda binaria para quedar pegado al máximo: con pasos fijos el
  // tamaño ajustado podía quedar más chico que el del paso anterior.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const overflows = () =>
      el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
    const fit = () => {
      el.style.fontSize = baseFontSize;
      const shrunk = overflows();
      if (shrunk) {
        let lo = 6;
        let hi = parseFloat(getComputedStyle(el).fontSize);
        while (hi - lo > 0.5) {
          const mid = (lo + hi) / 2;
          el.style.fontSize = `${mid}px`;
          if (overflows()) hi = mid;
          else lo = mid;
        }
        el.style.fontSize = `${lo}px`;
      }
      onShrinkChange?.(shrunk);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseFontSize, fontFamily, lines, current, onShrinkChange]);

  useEffect(() => setCurrent(0), [song.id, mode]);

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
      <Box className="lyricViewerEmpty">
        Esta canción no tiene letra cargada
      </Box>
    );
  }

  // Click en la mitad izquierda/derecha de la pantalla navega prev/next,
  // como un teleprompter: no hace falta lista de líneas ni botones propios.
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const isRightHalf = e.clientX - left > width / 2;
    setCurrent((i) =>
      isRightHalf ? Math.min(i + 1, lines.length - 1) : Math.max(i - 1, 0),
    );
  };

  return (
    <Box
      // key: remonta en cada cambio de línea para reiniciar la animación CSS.
      // La animación va sobre el propio contenedor medido: su transform no
      // altera scrollHeight/clientHeight, así que no interfiere con el ajuste.
      key={current}
      ref={ref}
      className={`lyricViewer lyricTransition-${transition}`}
      onClick={onClick}
      style={{ fontFamily }}
    >
      {lines[current]}
    </Box>
  );
};

export default LyricViewer;
