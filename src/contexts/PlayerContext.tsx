import type { SongDTO } from "@/types/song";
import React, { useContext } from "react";

interface PlayerContextType {
  displayedSong: SongDTO | null | undefined;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
}

const PlayerContext = React.createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer debe usarse dentro de PlayerPage");
  return ctx;
}

export default PlayerContext;
