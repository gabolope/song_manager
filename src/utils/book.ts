import type { SongDTO } from "../types/song";

// Orden efectivo de una canción del book: su "order" manual si existe, o su
// posición en `list` (que ya viene ordenada por createdAt vía Firestore/el
// snapshot original) para las canciones que nunca se reordenaron a mano.
const effectiveOrder = (song: SongDTO, index: number) => song.order ?? index;

// Ordena el book: las canciones sin "order" (nunca reordenadas manualmente)
// mantienen su orden de llegada (por createdAt) y quedan antes que cualquier
// canción con "order" explícito, ya que ese campo solo se asigna al mover
// algo con drag & drop (ver reorderBook) o al agregar una canción nueva
// (siempre al final). Una vez que se reordena una vez, `reorderBook` asigna
// "order" a todo el book y este caso mixto deja de darse.
export function sortBook(songs: SongDTO[]): SongDTO[] {
  const byCreatedAt = [...songs].sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return at - bt;
  });

  return byCreatedAt
    .map((song, index) => ({ song, order: effectiveOrder(song, index) }))
    .sort((a, b) => {
      const aHasOrder = a.song.order !== undefined;
      const bHasOrder = b.song.order !== undefined;
      if (aHasOrder !== bHasOrder) return aHasOrder ? 1 : -1;
      return a.order - b.order;
    })
    .map(({ song }) => song);
}

// Próximo valor de "order" para agregar una canción al final del book,
// aunque haya canciones sin "order" explícito (fallback a su índice) o
// huecos en la numeración por canciones borradas.
export function nextBookOrder(book: SongDTO[] | undefined): number {
  if (!book || book.length === 0) return 0;
  const max = book.reduce(
    (m, song, index) => Math.max(m, effectiveOrder(song, index)),
    -1,
  );
  return max + 1;
}
