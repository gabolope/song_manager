import { Button, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { SongDTO } from "../types/song";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import "./SongList.css";

interface Props {
  addToBook: (song: SongDTO) => void;
  book?: SongDTO[];
  items: SongDTO[] | undefined;
  isLoading: boolean;
  onClick?: (index: number) => void;
  selected?: number | null;
  isAdding?: boolean;
}

const SongList = ({
  book,
  isLoading,
  items,
  onClick,
  selected,
  addToBook,
  isAdding,
}: Props) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!items) return items;
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((song) => (song.title ?? "").toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="panel">
      <div className="panelHeader">
        <h2>Canciones</h2>
        <span className="panelCount">{items?.length ?? 0}</span>
      </div>
      <div className="panelSearch">
        <div style={{ position: "relative" }}>
          <IoSearch
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canción..."
            style={{ paddingLeft: 28 }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="panelEmpty">Cargando...</div>
      ) : !filtered?.length ? (
        <div className="panelEmpty">
          {query ? "Sin resultados." : "No hay canciones cargadas."}
        </div>
      ) : (
        <div className="songList">
          {filtered.map((song) => {
            const index = items?.indexOf(song) ?? -1;
            const isInBook = book?.some((i) => i.id === song.id) ?? false;

            return (
              <div key={song.id} onClick={() => onClick?.(index)}>
                <div
                  className={selected === index ? "song selected" : "song"}
                >
                  <div>
                    {song.title || <Text opacity={0.6}>Sin título</Text>}
                  </div>
                  <div>
                    {selected === index && !isInBook && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToBook(song);
                        }}
                        colorPalette={"blue"}
                        size="sm"
                        borderRadius={"md"}
                        loading={isAdding}
                        disabled={isAdding}
                      >
                        <IoAddCircleOutline />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongList;
