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
// del director) expone un handle de arrastre dedicado: así el resto de la
// fila sigue funcionando para seleccionar/tocar sin pisar el gesto de drag,
// y en mobile el scroll de la lista no se confunde con un reordenamiento.
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
      }}
      onClick={onClick}
    >
      <div className={selected ? "song selected" : "song"}>
        <div className="songMain">
          {draggable && (
            <button
              type="button"
              className="songDragHandle"
              aria-label={`Mover "${song.title}"`}
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              <MdDragIndicator />
            </button>
          )}
          <div className="songInfo">
            <div className="songRowTitle">{song.title}</div>
            {formatSongMeta(song) && (
              <div className="songRowMeta">{formatSongMeta(song)}</div>
            )}
          </div>
        </div>
        <div>
          {selected && onDelete && (
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
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
