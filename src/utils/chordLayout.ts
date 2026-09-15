// Cada acorde y su letra comparten el ancho de su ".column" (el más ancho de
// los dos manda), así que normalmente el acorde queda separado del
// siguiente por el resto de ancho que deja la letra debajo. Pero como la
// fuente es proporcional (no monoespaciada), a veces el nombre del acorde
// mide casi lo mismo en píxeles que el fragmento de letra que tiene debajo
// (ej. "F#m" sobre "ación"), y ese resto da ~0px: dos acordes distintos
// terminan pegados aunque en el ChordPro no haya ninguna razón "de espacio"
// para que lo estén. Acá sólo se corrige eso: se mide el hueco real entre
// acordes consecutivos y, si queda por debajo del mínimo legible, se
// agranda la columna anterior lo justo para separarlos. No toca los casos
// donde ya hay espacio de sobra (la inmensa mayoría), así que no afecta la
// separación de las palabras partidas por un acorde en medio.
const MIN_CHORD_GAP_PX = 3;

export function fixChordCollisions(container: HTMLElement): void {
  const rows = container.querySelectorAll<HTMLElement>(".row");
  rows.forEach((row) => {
    const columns = Array.from(row.querySelectorAll<HTMLElement>(":scope > .column"));
    columns.forEach((column) => {
      column.style.paddingRight = "";
    });

    for (let i = 0; i < columns.length - 1; i++) {
      const chordA = columns[i].querySelector<HTMLElement>(".chord");
      const chordB = columns[i + 1].querySelector<HTMLElement>(".chord");
      if (!chordA?.textContent || !chordB?.textContent) continue;

      const gap = chordB.getBoundingClientRect().left - chordA.getBoundingClientRect().right;
      if (gap < MIN_CHORD_GAP_PX) {
        columns[i].style.paddingRight = `${MIN_CHORD_GAP_PX - gap}px`;
      }
    }
  });
}
