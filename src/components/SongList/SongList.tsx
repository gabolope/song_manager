import { IconButton, Popover, Portal, Text } from "@chakra-ui/react";
import { Fragment, useMemo, useState } from "react";
import type { SongDTO, SongIdioma, SongTipo } from "@/types/song";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoClose, IoFilter, IoSearch } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { stripChordProMarkup } from "@/services/chordpro.service";
import { normalizeForSearch } from "@/utils/text";
import ListSkeleton from "./ListSkeleton";
import SongTipoTag from "./SongTipoTag";
import AddSongDialog from "./AddSongDialog";
import {
  IDIOMA_LABEL,
  TIPO_LABEL,
  compareByKeyThenTipo,
  formatSongMeta,
} from "@/utils/song";
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
  const [idiomaFilter, setIdiomaFilter] = useState<SongIdioma | "">("");
  const [generoFilter, setGeneroFilter] = useState("");

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

  const availableIdiomas = useMemo(
    () =>
      (Object.keys(IDIOMA_LABEL) as SongIdioma[]).filter((idioma) =>
        items?.some((s) => s.idioma === idioma),
      ),
    [items],
  );

  const availableGeneros = useMemo(
    () =>
      Array.from(
        new Set(items?.flatMap((s) => (s.genero ? [s.genero] : []))),
      ).sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const filtered = useMemo(() => {
    if (!searchable) return undefined;
    const q = normalizeForSearch(query.trim());
    return searchable
      .filter((s) => !q || s.text.includes(q))
      .filter((s) => !keyFilter || s.song.key === keyFilter)
      .filter((s) => !tipoFilter || s.song.tipo === tipoFilter)
      .filter((s) => !idiomaFilter || s.song.idioma === idiomaFilter)
      .filter((s) => !generoFilter || s.song.genero === generoFilter)
      .map((s) => s.song)
      .sort(compareByKeyThenTipo);
  }, [searchable, query, keyFilter, tipoFilter, idiomaFilter, generoFilter]);

  const hasFilters =
    availableKeys.length > 0 ||
    availableTipos.length > 0 ||
    availableIdiomas.length > 0 ||
    availableGeneros.length > 0;
  const activeFilters = [
    keyFilter,
    tipoFilter,
    idiomaFilter,
    generoFilter,
  ].filter(Boolean).length;

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="panelHeaderTitle">
          <h2>Repertorio</h2>
          <span className="panelCount">{filtered?.length ?? 0}</span>
          {hasFilters && (
            <Popover.Root positioning={{ placement: "bottom-start" }}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={
                    activeFilters ? "panelExpandBtn active" : "panelExpandBtn"
                  }
                  aria-label="Filtros"
                  title="Filtros"
                >
                  <IoFilter />
                </button>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content width="200px">
                    <Popover.Body p={2}>
                      <div className="filterSelectRow">
                        {availableKeys.length > 0 && (
                          <div className="filterSelectWrap">
                            <select
                              className="filterSelect"
                              value={keyFilter}
                              onChange={(e) => setKeyFilter(e.target.value)}
                              aria-label="Filtrar por tono"
                            >
                              <option value="">Tono</option>
                              {availableKeys.map(({ key }) => (
                                <option key={key} value={key}>
                                  {key}
                                </option>
                              ))}
                            </select>
                            <span
                              className="filterSelectIcon"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        {availableTipos.length > 0 && (
                          <div className="filterSelectWrap">
                            <select
                              className="filterSelect"
                              value={tipoFilter}
                              onChange={(e) =>
                                setTipoFilter(e.target.value as SongTipo | "")
                              }
                              aria-label="Filtrar por tipo"
                            >
                              <option value="">Tipo</option>
                              {availableTipos.map(({ tipo }) => (
                                <option key={tipo} value={tipo}>
                                  {TIPO_LABEL[tipo]}
                                </option>
                              ))}
                            </select>
                            <span
                              className="filterSelectIcon"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        {availableIdiomas.length > 0 && (
                          <div className="filterSelectWrap">
                            <select
                              className="filterSelect"
                              value={idiomaFilter}
                              onChange={(e) =>
                                setIdiomaFilter(
                                  e.target.value as SongIdioma | "",
                                )
                              }
                              aria-label="Filtrar por idioma"
                            >
                              <option value="">Idioma</option>
                              {availableIdiomas.map((idioma) => (
                                <option key={idioma} value={idioma}>
                                  {IDIOMA_LABEL[idioma]}
                                </option>
                              ))}
                            </select>
                            <span
                              className="filterSelectIcon"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        {availableGeneros.length > 0 && (
                          <div className="filterSelectWrap">
                            <select
                              className="filterSelect"
                              value={generoFilter}
                              onChange={(e) => setGeneroFilter(e.target.value)}
                              aria-label="Filtrar por género"
                            >
                              <option value="">Género</option>
                              {availableGeneros.map((genero) => (
                                <option key={genero} value={genero}>
                                  {genero}
                                </option>
                              ))}
                            </select>
                            <span
                              className="filterSelectIcon"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          )}
          <AddSongDialog />
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
            style={{ paddingLeft: 28, paddingRight: query ? 28 : undefined }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Borrar búsqueda"
              title="Borrar búsqueda"
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                padding: 2,
                background: "none",
                border: "none",
                color: "inherit",
                opacity: 0.6,
                cursor: "pointer",
              }}
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : !filtered?.length ? (
        <div className="panelEmpty">
          {query || keyFilter || tipoFilter || idiomaFilter || generoFilter
            ? "Sin resultados."
            : "Agregá canciones a tu repertorio."}
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
                      {(formatSongMeta(song) || song.tipo) && (
                        <div className="songRowMeta">
                          {formatSongMeta(song) && (
                            <span className="songRowMetaKey">
                              {formatSongMeta(song)}
                            </span>
                          )}
                          {song.tipo && <SongTipoTag tipo={song.tipo} />}
                        </div>
                      )}
                    </div>
                    <div>
                      {selected === index && (
                        <IconButton
                          aria-label="Agregar a la sesión"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToBook(song);
                          }}
                          colorPalette={isInBook ? "gray" : "blue"}
                          size="sm"
                          borderRadius={"md"}
                          loading={isAdding}
                          disabled={isAdding || isInBook}
                          css={
                            isInBook
                              ? { _disabled: { opacity: 1, bg: "gray.600" } }
                              : undefined
                          }
                        >
                          <IoAddCircleOutline />
                        </IconButton>
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
