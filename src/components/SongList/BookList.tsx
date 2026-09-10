import type { SongDTO } from "@/types/song";
import { Button } from "@chakra-ui/react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDeleteOutline, MdDragIndicator } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ListSkeleton from "./ListSkeleton";
import SongTipoTag from "./SongTipoTag";
import { formatSongMeta } from "@/utils/song";
import "./SongList.css";

interface Props {
  items?: SongDTO[];
  onClick: (index: number) => void;
  onDelete?: (id: string) => void;
  onReorder?: (items: SongDTO[]) => void;
  selected: number | null;
  title?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface RowProps {
  song: SongDTO;
  selected: boolean;
  draggable: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

// Fila individual de la sesión. Cuando `draggable` es true (solo en la vista
// del director) toda la fila es agarrable: es el área más grande y fácil de
// tomar con el dedo en mobile. Para no pisar el scroll de la lista, el drag
// se activa recién tras mantener presionado un instante (delay + tolerance)
// en vez de con el primer píxel de movimiento, así un swipe corto sigue
// scrolleando y solo una pulsación sostenida arranca el reordenamiento. El
// ícono de arrastre es solo una señal visual de que la fila es agarrable:
// no tiene listeners propios, hereda el gesto de la fila por bubbling. El
// botón de borrar corta la propagación del pointerdown para quedar afuera
// de ese gesto.
const BookRow = ({ song, selected, draggable, onClick, onDelete }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id, disabled: !draggable });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : "auto",
        position: "relative",
        cursor: draggable ? (isDragging ? "grabbing" : "grab") : undefined,
      }}
      onClick={onClick}
      {...(draggable ? { ...attributes, ...listeners } : {})}
    >
      <div className={selected ? "song bookSong selected" : "song bookSong"}>
        <div className="songMain">
          {draggable && (
            <span className="songDragHandle" aria-hidden="true">
              <MdDragIndicator />
            </span>
          )}
          <div className="songInfo">
            <div className="songRowTitle">{song.title}</div>
            {(formatSongMeta(song) || song.tipo) && (
              <div className="songRowMeta">
                {formatSongMeta(song) && (
                  <span className="songRowMetaKey">{formatSongMeta(song)}</span>
                )}
                {song.tipo && <SongTipoTag tipo={song.tipo} />}
              </div>
            )}
          </div>
        </div>
        <div>
          {selected && onDelete && (
            <Button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(song.id);
              }}
              colorPalette={"red"}
              size="xs"
              borderRadius={"md"}
            >
              <MdDeleteOutline />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const BookList = ({
  items,
  onClick,
  onDelete,
  onReorder,
  selected,
  title = "Sesión",
  emptyMessage = "Agregá canciones desde el repertorio para armar la sesión.",
  isLoading,
  isExpanded,
  onToggleExpand,
}: Props) => {
  // Delay + tolerance en vez de distance: como ahora toda la fila es
  // agarrable, un umbral de distancia dispararía el drag apenas el dedo se
  // mueve un poco, compitiendo con el scroll vertical de la lista. Con un
  // delay, un swipe corto sigue siendo scroll y solo una pulsación sostenida
  // (con poco movimiento) arranca el reordenamiento.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!items || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder?.(arrayMove(items, oldIndex, newIndex));
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="songList">
              {items.map((song, index) => (
                <BookRow
                  key={song.id}
                  song={song}
                  selected={selected === index}
                  draggable={!!onReorder}
                  onClick={() => onClick?.(index)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default BookList;
