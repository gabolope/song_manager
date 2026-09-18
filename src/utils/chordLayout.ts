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

// Cuando dos acordes quedan seguidos sin letra en el medio (instrumental,
// ej. "[Am7]     [D]"), preserveChordSpacing (chordpro.service.ts) evita que
// chordsheetjs descarte esos espacios, así que sobreviven como texto real en
// el ".lyrics" del acorde anterior. Pero como la fuente es proporcional, el
// ancho de N espacios sueltos no guarda relación con el ancho de N
// caracteres cualquiera (un espacio mide bastante menos que, por ejemplo,
// las letras de "Am7"): el hueco visual termina siendo más chico que la
// separación que el usuario puso en el ChordPro, a veces casi nula. Para que
// el hueco sea proporcional a esa cantidad de espacios, se le fuerza un
// ancho mínimo en "ch" (ancho del carácter "0" en la fuente actual), que
// funciona como una aproximación de ancho de carácter fijo.
const ZERO_WIDTH_MARKER = /​/g;
const ONLY_SPACES_RE = /^ +$/;

export function fixChordCollisions(container: HTMLElement): void {
  const rows = container.querySelectorAll<HTMLElement>(".row");
  rows.forEach((row) => {
    const columns = Array.from(row.querySelectorAll<HTMLElement>(":scope > .column"));
    columns.forEach((column) => {
      column.style.paddingRight = "";
      const lyrics = column.querySelector<HTMLElement>(".lyrics");
      if (lyrics) lyrics.style.minWidth = "";
    });

    for (let i = 0; i < columns.length - 1; i++) {
      const chordA = columns[i].querySelector<HTMLElement>(".chord");
      const chordB = columns[i + 1].querySelector<HTMLElement>(".chord");
      if (!chordA?.textContent || !chordB?.textContent) continue;

      const gapLyrics = columns[i].querySelector<HTMLElement>(".lyrics");
      const gapText = gapLyrics?.textContent?.replace(ZERO_WIDTH_MARKER, "") ?? "";
      if (gapLyrics && ONLY_SPACES_RE.test(gapText)) {
        gapLyrics.style.minWidth = `${gapText.length}ch`;
      }

      // Si la letra de esta columna no termina en un separador de palabra,
      // el siguiente acorde cae en medio de la misma palabra (ej. "escati"
      // con acorde y luego "mó"): agrandar el hueco acá metería un espacio
      // visual en medio de la palabra. Se prefiere dejar que los acordes
      // queden más pegados antes que partir la palabra.
      if (gapText && !/[\s-]$/.test(gapText)) continue;

      const gap = chordB.getBoundingClientRect().left - chordA.getBoundingClientRect().right;
      if (gap < MIN_CHORD_GAP_PX) {
        columns[i].style.paddingRight = `${MIN_CHORD_GAP_PX - gap}px`;
      }
    }
  });
}
