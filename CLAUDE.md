# CLAUDE.md

App web para que un equipo de alabanza comparta canciones (ChordPro) en vivo: un **director** elige/transpone la canción y los **músicos** la ven sincronizada en su dispositivo.

## Comandos

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (es el único chequeo de tipos)
- `npm run lint` — ESLint
- No hay tests.

Deploy: Vercel (SPA, `vercel.json` reescribe todo a `index.html`). Reglas de Firestore en `firestore.rules` (se despliegan con `firebase deploy --only firestore:rules`).

## Stack

React 19 + TypeScript + Vite, Chakra UI v3 (`src/components/ui/` es el snippet generado por Chakra), TanStack Query v5, Firebase (Auth + Firestore), `chordsheetjs` para parsear/renderizar ChordPro, `@dnd-kit` para reordenar. Alias `@/` → `src/`.

## Arquitectura

**Rutas** (`src/routes.tsx`): `/` (login/redirección), `/director` (solo admin), `/player` y `/lyrics` (cualquier usuario logueado). Director y Player comparten un único `SessionProvider` para no perder estado al cambiar de vista. `/lyrics` fuerza tema oscuro (`main.tsx`).

**Colecciones de Firestore:**
- `songs` — repertorio completo (el catálogo).
- `book` — la lista de la sesión actual. Guarda **copias** de las canciones, no referencias. Orden: campo `order`, con fallback a `createdAt` (`utils/book.ts`, `sortBook`).
- `liveSong/current` — documento único con la canción en vivo (+ `transpose`, `cueSection`). Efímero.
- `broadcast` — mensajes del director a los músicos.
- `users` — perfil (`role: "admin" | "musico"`, `avatar`).

Como `book` y `liveSong` son copias, editar/borrar una canción tiene que propagarse a mano a las tres colecciones (ver `services/songs.service.ts`, `updateSong`/`deleteSong`).

**Datos en tiempo real:** `useBook` y `useLiveSong` abren `onSnapshot` y escriben directo en el cache de React Query (`setQueryData`); el `useQuery` solo lee del cache (`enabled: false`). Las mutaciones sobre listas usan `hooks/useOptimisticMutation.ts` (optimistic update + rollback + toast).

**Contexts:**
- `AuthContext` — `user`, `profile`, `isAdmin`, `isDemo`, `wantsToDirect` (un admin puede elegir no dirigir y usar `/player`; se guarda por uid en localStorage).
- `SessionContext` — book, liveSong, selección, `isLive`, transposición por canción (solo en memoria, nunca se persiste).
- `DirectorContext` / `PlayerContext` — estado propio de cada página (pantalla completa, navegación, transponer).

**Modo demo** (`isDemo`): sin cuenta ni escrituras a Firestore; `book`/`liveSong` viven solo en el cache de React Query y las canciones salen de `data/demoSongs.ts`. Todo hook que escribe o escucha Firestore debe respetar `isDemo`.

**Crear usuarios:** `services/auth.service.ts` usa una app Firebase secundaria para que `createUserWithEmailAndPassword` no desloguee al admin.

## ChordPro

- Render/transposición: `services/chordpro.service.ts` (`formatSong`, `transposeKeyLabel`).
- Editor visual de secciones: `utils/chordProBody.ts` (parse/serialize) + `SongViewer/SongBodyEditor.tsx`.
- Subida masiva: `hooks/onSongUpload.ts`. Extrae `tipo` (rápida/intermedia/lenta) del prefijo viejo de Chordle en el título (`A1 `, `Am3 `…) y lo quita del título.
- `src/songs/*.chordpro` y `repertorio/*.cho` (gitignored) son archivos fuente para subir; el código no los importa.

## Convenciones

- UI, comentarios y mensajes en **español** (rioplatense: "recargá", "elegí").
- Los comentarios explican el *por qué* (decisiones, casos borde de Firestore); mantener esa densidad.
- Firestore se inicializa con `ignoreUndefinedProperties: true`; para *borrar* un campo opcional en un update usar `deleteField()`.
- `transpose` se persiste en `book` y `liveSong` (nunca en `songs`); `cueSection` solo en `liveSong`; `keysByDirector` sí es parte del repertorio (`songs`). El comentario de `transpose` en `types/song.ts` está desactualizado.
- Pendientes en `TODO.md`.
