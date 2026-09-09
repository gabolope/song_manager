import type { SongDTO } from "@/types/song";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ListSkeleton from "./ListSkeleton";
import { formatSongMeta } from "@/utils/song";
import "./SongList.css";

interface Props {
  items?: SongDTO[];
  onClick: (index: number) => void;
  onDelete?: (id: string) => void;
  selected: number | null;
  title?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}
const BookList = ({
  items,
  onClick,
  onDelete,
  selected,
  title = "Sesión",
  emptyMessage = "Agregá canciones desde el repertorio para armar la sesión.",
  isLoading,
  isExpanded,
  onToggleExpand,
}: Props) => {
  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="panelHeaderTitle">
          <h2>{title}</h2>
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
            {isExpanded ? <IoIosArrowDown /> : <IoIosArrowUp />}
          </button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : !items?.length ? (
        <div className="panelEmpty">{emptyMessage}</div>
      ) : (
        <div className="songList">
          {items.map((song, index) => (
            <div key={song.id} onClick={() => onClick?.(index)}>
              <div className={selected === index ? "song selected" : "song"}>
                <div className="songInfo">
                  <div className="songRowTitle">{song.title}</div>
                  {formatSongMeta(song) && (
                    <div className="songRowMeta">{formatSongMeta(song)}</div>
                  )}
                </div>
                <div>
                  {selected === index && onDelete && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(song.id);
                      }}
                      colorPalette={"red"}
                      size="sm"
                      borderRadius={"md"}
                    >
                      <MdDeleteOutline />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
