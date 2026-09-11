import type { SongDTO } from "@/types/song";
import React, { useContext } from "react";

interface DirectorContextType {
  currentSong: SongDTO | null | undefined;
  selectedListSong: number | null;
  listClick: (index: number) => void;
  bookClick: (index: number) => void;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
  // Pantalla completa es un concepto por pestaña/dispositivo, no de la sesión
  // compartida (Director y Player pueden estar en pantallas distintas).
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  // Transposición (en semitonos) de la canción actual. La cambia solo el
  // Director; si está en vivo se retransmite a los músicos vía liveSong.
  onTransposeChange: (delta: number) => void;
}

const DirectorContext = React.createContext<DirectorContextType | null>(null);

export function useDirector() {
  const ctx = useContext(DirectorContext);
  if (!ctx) throw new Error("useDirector debe usarse dentro de DirectorPage");
  return ctx;
}

export default DirectorContext;
