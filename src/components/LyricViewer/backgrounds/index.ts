import type { ComponentType } from "react";

export interface BackgroundProps {
  color?: string;
}

interface BackgroundModule {
  default: ComponentType<BackgroundProps>;
  label: string;
  usesColor?: boolean;
}

// Cada archivo de esta carpeta es un fondo: exporta un componente default
// (color?: string) y un `label` (y `usesColor = false` si ignora el color). Se listan solos acá, sin tocar este archivo
// al agregar uno nuevo.
const modules = import.meta.glob<BackgroundModule>("./*.tsx", { eager: true });

export const BACKGROUNDS = Object.entries(modules).map(([path, mod]) => ({
  value: path.replace("./", "").replace(".tsx", ""),
  label: mod.label,
  Component: mod.default,
  usesColor: mod.usesColor ?? true,
}));
