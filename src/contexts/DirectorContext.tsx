import type { SongDTO } from "@/types/song";
import React, { useContext } from "react";

interface DirectorContextType {
  currentSong: SongDTO | null | undefined;
  selectedListSong: number | null;
  listClick: (index: number) => void;
  bookClick: (index: number) => void;
  onLeft: (id: string) => void;
  onRight: (id: string) => void;
}

const DirectorContext = React.createContext<DirectorContextType | null>(null);

export function useDirector() {
  const ctx = useContext(DirectorContext);
  if (!ctx) throw new Error("useDirector debe usarse dentro de DirectorPage");
  return ctx;
}

export default DirectorContext;
