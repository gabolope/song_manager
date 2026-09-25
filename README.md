# Song Manager

App web para equipos de alabanza: el **director** arma la lista de la sesión, elige la canción en vivo y la transpone; los **músicos** la ven sincronizada en su dispositivo, con acordes (ChordPro) o solo la letra.

## Funcionalidades

- Repertorio de canciones en formato ChordPro, con búsqueda, tono y tipo (rápida / intermedia / lenta).
- Lista de la sesión ("book") reordenable con drag & drop.
- Canción en vivo sincronizada en tiempo real, con transposición y marca de sección ("vamos para acá").
- Tono preferido por director.
- Mensajes del director a los músicos.
- Vista de letras a pantalla completa con fondos animados (`/lyrics`).
- Editor de canciones y subida masiva de archivos `.cho` / `.chordpro`.
- Usuarios con rol `admin` o `musico`, administrados desde la app.
- Modo demo para probar sin cuenta.

## Stack

React 19, TypeScript, Vite, Chakra UI v3, TanStack Query, Firebase (Auth + Firestore), chordsheetjs, dnd-kit.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # chequeo de tipos + build de producción
npm run lint
```

La configuración de Firebase está en `src/services/firebase.ts`.

## Deploy

- **App:** Vercel (`vercel.json` redirige todas las rutas a `index.html`).
- **Reglas de Firestore:** `firebase deploy --only firestore:rules`.

## Roles

| Rol | Acceso |
|-----|--------|
| `admin` | `/director`, edita canciones, la lista y los usuarios. Puede elegir no dirigir y entrar como músico. |
| `musico` | `/player` y `/lyrics`, solo lectura. |

Los permisos también se aplican en el servidor, en `firestore.rules`.
