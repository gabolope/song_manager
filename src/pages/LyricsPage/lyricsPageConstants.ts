import type {
  LyricMode,
  LyricTransition,
} from "@/components/LyricViewer/LyricViewer";

// Fuentes web-safe (instaladas en prácticamente cualquier SO) más los
// genéricos nativos de CSS: cubren estilos bien distintos sin depender de
// una fuente externa que pueda fallar por wifi durante una sesión en vivo.
export const LYRIC_FONTS = [
  {
    label: "Sistema",
    value: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  { label: "Martel Sans", value: '"Martel Sans", sans-serif' },
  { label: "Castoro Titling", value: '"Castoro Titling", serif' },
  {
    label: "Noto Sans Old North Arabian",
    value: '"Noto Sans Old North Arabian", sans-serif',
  },
  { label: "Montserrat", value: '"Montserrat", sans-serif' },
  { label: "Roboto", value: '"Roboto", sans-serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: 'Georgia, "Times New Roman", serif' },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
  { label: "Idiqlat", value: '"Idiqlat", sans-serif' },

  { label: "Cinzel", value: '"Cinzel", serif' },
];

export const BACKGROUND_COLORS = [
  { label: "Acento", value: "var(--accent)" },
  { label: "Verde", value: "#4ade80" },
  { label: "Azul", value: "#4973ff" },
  { label: "Otoño", value: "#e08a3c" },
  { label: "Rojo", value: "#ef4444" },
  { label: "Violeta", value: "#a78bfa" },
  { label: "Amarillo", value: "#facc15" },
  { label: "Rosa", value: "#f472b6" },
  { label: "Blanco", value: "#f5f5f5" },
];

// Color por defecto según el fondo elegido (hojas verdes, luciérnagas amarillas).
export const DEFAULT_BACKGROUND_COLORS: Record<string, string> = {
  Leaves: "#4ade80",
  Fireflies: "#facc15",
  Waves: "#4973ff",
};

export const LYRIC_MODES: { label: string; value: LyricMode }[] = [
  { label: "Línea a línea", value: "line" },
  { label: "Sección a sección", value: "section" },
  { label: "Canción entera", value: "song" },
];

export const LYRIC_TRANSITIONS: { label: string; value: LyricTransition }[] = [
  { label: "Fundido", value: "fade" },
  { label: "Deslizar", value: "slide" },
  { label: "Subir", value: "rise" },
  { label: "Zoom", value: "zoom" },
  { label: "Desenfoque", value: "blur" },
  { label: "Sin transición", value: "none" },
];
