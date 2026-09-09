import { Button, Text } from "@chakra-ui/react";
import { Fragment, useMemo, useState } from "react";
import type { SongDTO, SongTipo } from "@/types/song";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { stripChordProMarkup } from "@/services/chordpro.service";
import { normalizeForSearch } from "@/utils/text";
import ListSkeleton from "./ListSkeleton";
import { TIPO_LABEL, compareByKeyThenTipo, formatSongMeta } from "@/utils/song";
import "./SongList.css";

interface Props {
  addToBook: (song: SongDTO) => void;
  book?: SongDTO[];
  items: SongDTO[] | undefined;
  isLoading: boolean;
  onClick?: (index: number) => void;
  selected?: number | null;
  isAdding?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const SongList = ({
  book,
  isLoading,
  items,
  onClick,
  selected,
  addToBook,
  isAdding,
  isExpanded,
  onToggleExpand,
}: Props) => {
  const [query, setQuery] = useState("");
  const [keyFilter, setKeyFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState<SongTipo | "">("");

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

  const availableKeys = useMemo(() => {
    const counts = new Map<string, number>();
    items?.forEach((song) => {
      if (song.key) counts.set(song.key, (counts.get(song.key) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, count]) => ({ key, count }));
  }, [items]);

  const availableTipos = useMemo(() => {
    const counts = new Map<SongTipo, number>();
    items?.forEach((song) => {
      if (song.tipo) counts.set(song.tipo, (counts.get(song.tipo) ?? 0) + 1);
    });
    return (Object.keys(TIPO_LABEL) as SongTipo[])
      .filter((tipo) => counts.has(tipo))
      .map((tipo) => ({ tipo, count: counts.get(tipo)! }));
  }, [items]);

  const filtered = useMemo(() => {
    if (!searchable) return undefined;
    const q = normalizeForSearch(query.trim());
    return searchable
      .filter((s) => !q || s.text.includes(q))
      .filter((s) => !keyFilter || s.song.key === keyFilter)
      .filter((s) => !tipoFilter || s.song.tipo === tipoFilter)
      .map((s) => s.song)
      .sort(compareByKeyThenTipo);
  }, [searchable, query, keyFilter, tipoFilter]);

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="panelHeaderTitle">
          <h2>Repertorio</h2>
          <span className="panelCount">{items?.length ?? 0}</span>
        </div>
        {onToggleExpand && (
          <button
            type="button"
            className="panelExpandBtn"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Restaurar tamaño" : "Expandir panel"}
            title={isExpanded ? "Restaurar tamaño" : "Expandir panel"}
          >
            {isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        )}
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
        {(availableKeys.length > 0 || availableTipos.length > 0) && (
          <div className="filterSelectRow">
            {availableKeys.length > 0 && (
              <select
                className="filterSelect"
                value={keyFilter}
                onChange={(e) => setKeyFilter(e.target.value)}
                aria-label="Filtrar por tono"
              >
                <option value="">Todos los tonos</option>
                {availableKeys.map(({ key, count }) => (
                  <option key={key} value={key}>
                    {key} ({count})
                  </option>
                ))}
              </select>
            )}
            {availableTipos.length > 0 && (
              <select
                className="filterSelect"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value as SongTipo | "")}
                aria-label="Filtrar por tipo"
              >
                <option value="">Todos los tipos</option>
                {availableTipos.map(({ tipo, count }) => (
                  <option key={tipo} value={tipo}>
                    {TIPO_LABEL[tipo]} ({count})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : !filtered?.length ? (
        <div className="panelEmpty">
          {query || keyFilter || tipoFilter
            ? "Sin resultados."
            : "No hay canciones cargadas."}
        </div>
      ) : (
        <div className="songList">
          {filtered.map((song, i) => {
            const index = items?.indexOf(song) ?? -1;
            const isInBook = book?.some((i) => i.id === song.id) ?? false;
            const showDivider = i === 0 || filtered[i - 1].key !== song.key;

            return (
              <Fragment key={song.id}>
                {showDivider && (
                  <div className="songGroupDivider">
                    <span>{song.key || "Sin tono"}</span>
                    <hr />
                  </div>
                )}
                <div onClick={() => onClick?.(index)}>
                  <div
                    className={selected === index ? "song selected" : "song"}
                  >
                    <div className="songInfo">
                      <div className="songRowTitle">
                        {song.title || <Text opacity={0.6}>Sin título</Text>}
                      </div>
                      {formatSongMeta(song) && (
                        <div className="songRowMeta">
                          {formatSongMeta(song)}
                        </div>
                      )}
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
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongList;
