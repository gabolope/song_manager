import type { SongDTO } from "@/types/song";
import React, { useContext } from "react";

interface PlayerContextType {
  displayedSong: SongDTO | null | undefined;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
  // Pantalla completa es un concepto por pestaña/dispositivo, no de la sesión
  // compartida (Director y Player pueden estar en pantallas distintas).
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
}

const PlayerContext = React.createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer debe usarse dentro de PlayerPage");
  return ctx;
}

export default PlayerContext;
