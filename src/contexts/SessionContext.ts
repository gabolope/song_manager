import type { SongDTO } from "@/types/song";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import React, { useContext } from "react";

interface SessionContextType {
  book: SongDTO[] | undefined;
  liveSong: UseQueryResult<SongDTO | null, Error>;
  setLiveSong: UseMutationResult<void, Error, SongDTO, unknown>;
  clearLiveSong: UseMutationResult<void, Error, void, unknown>;
  selectedBookSong: number | null;
  setSelectedBookSong: (index: number | null) => void;
  isLive: boolean;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
  localSong: SongDTO | null;
  setLocalSong: (song: SongDTO | null) => void;
  isCurrentLive: (displayedSong?: SongDTO | null | undefined) => boolean;
  backToLive: () => void;
  nextSong: SongDTO | undefined;
  getTranspose: (songId?: string | null) => number;
  setSongTranspose: (songId: string, value: number) => void;
}

const SessionContext = React.createContext<SessionContextType | null>(null);

// hook para consumir el context con error claro
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}

export default SessionContext;
