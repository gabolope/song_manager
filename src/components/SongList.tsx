import { Button, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { SongDTO } from "../types/song";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { stripChordProMarkup } from "../services/chordpro.service";
import { normalizeForSearch } from "../utils/text";
import ListSkeleton from "./ListSkeleton";
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

  // Se precalcula una sola vez por lista (no en cada tecleo) el texto sobre
  // el que se busca: título + letra sin acordes ni directivas, para que
  // "Eres" encuentre "Ere[Bb]s" igual.
  const searchable = useMemo(
    () =>
      items?.map((song) => ({
        song,
        text: normalizeForSearch(
          `${song.title ?? ""} ${stripChordProMarkup(song.content ?? "")}`,
        ),
      })),
    [items],
  );

  const filtered = useMemo(() => {
    if (!searchable) return undefined;
    const q = normalizeForSearch(query.trim());
    if (!q) return searchable.map((s) => s.song);
    return searchable.filter((s) => s.text.includes(q)).map((s) => s.song);
  }, [searchable, query]);

  return (
    <div className="panel">
      <div className="panelHeader">
        <h2>Repertorio</h2>
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
        <ListSkeleton />
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
