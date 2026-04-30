import type { SongDTO } from "@/types/song";

interface Props {
  items: SongDTO[];
  selectedIndex: number | null;
  onClick: (index: number) => void;
  onDelete: (id: string) => void;
}
const BookList = ({ items, selectedIndex, onClick, onDelete }: Props) => {
  return (
    <div>
      {items.map((song, index) => (
        <div key={song.id}>
          <button onClick={() => onClick(index)}>{song.title}</button>
          <button onClick={() => onDelete(song.id)}>X</button>
        </div>
      ))}
    </div>
  );
};

export default BookList;
