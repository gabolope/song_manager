# Song Manager

App web para equipos de alabanza: el **director** arma la lista de la sesión, elige la canción en vivo y la transpone; los **músicos** la ven sincronizada en su dispositivo, con acordes (ChordPro) o solo la letra.

Varios equipos usan la misma app en paralelo: cada uno tiene su propio repertorio, sesión, canción en vivo y usuarios, y no ve los datos de los demás.

## Funcionalidades

- Repertorio de canciones en formato ChordPro, con búsqueda, tono y tipo (rápida / intermedia / lenta).
- Lista de la sesión ("book") reordenable con drag & drop.
- Canción en vivo sincronizada en tiempo real, con transposición y marca de sección ("vamos para acá").
- Tono preferido por director.
- Mensajes del director a los músicos.
- Vista de letras a pantalla completa con fondos animados (`/lyrics`).
- Editor de canciones y subida masiva de archivos `.cho` / `.chordpro`.
- Usuarios con rol `admin` o `musico`, administrados desde la app.
- Multi-equipo, con una página `/admin` para dar de alta equipos y organizar sus miembros.
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

La configuración de Firebase está en `src/services/firebase.ts`. Hay dos proyectos: `npm run dev` usa el de desarrollo (`song-manager-dev-a7fd4`) y el build de producción usa `song-manager-5b3bb`, así que probar en local nunca toca los datos reales.

## Deploy

- **App:** Vercel publica cada push a `main` (`vercel.json` redirige todas las rutas a `index.html`).
- **Reglas de Firestore:** `firebase deploy --only firestore:rules --project dev` (o `--project prod`). Si un cambio de código depende de reglas nuevas, desplegá primero las reglas y después el código: con código nuevo y reglas viejas, la app queda sin datos.

## Roles

| Rol | Acceso |
|-----|--------|
| superadmin | `/admin`: crea equipos y gestiona los miembros de cualquier equipo. No es un rol de `users`; ver abajo. |
| `admin` | `/director`, edita canciones, la lista y los usuarios **de su equipo**. Puede elegir no dirigir y entrar como músico. |
| `musico` | `/player` y `/lyrics` de su equipo, solo lectura. |

Los permisos también se aplican en el servidor, en `firestore.rules`.

## Equipos

Cada usuario pertenece a un solo equipo (`users/{uid}.teamId`). Los datos de cada equipo viven en `teams/{teamId}/songs|book|liveSong|broadcast`.

### Alta de un equipo nuevo

Desde la app, con la cuenta de superadmin:

1. Configuración → Cuenta → **Administrar equipos** (`/admin`).
2. Escribí el nombre del equipo y tocá **Crear equipo**. El id se arma solo a partir del nombre (por ejemplo, "Iglesia Betesda" → `iglesia-betesda`) y no se puede cambiar después.
3. Con el equipo seleccionado, **Crear usuario en este equipo** → rol **Director**. Ese es el primer admin del equipo.
4. Pasale el email y la contraseña al director. Con esa cuenta se crean los músicos desde Configuración. El repertorio arranca vacío y se carga con la subida masiva de archivos `.cho` / `.chordpro`.

En `/admin` también se puede cambiar el rol de cualquier miembro y moverlo a otro equipo. Si se mueve a alguien que tiene la app abierta, el cambio se ve cuando recarga.

Lo que todavía no se puede hacer desde la app: borrar usuarios (la cuenta de Auth no se puede borrar desde el cliente) y renombrar equipos. Las dos cosas se hacen desde la consola de Firebase.

### Superadmin

Es quien tiene un documento `superadmins/{uid}` en Firestore, con `uid` igual al UID de su cuenta (Authentication → Usuarios, o el id de su doc en `users`). Se crea a mano desde la consola, una vez por proyecto (dev y prod tienen UIDs distintos), y no necesita campos. La app no puede crearlo ni modificarlo. El flag se lee al iniciar sesión, así que después de crearlo hay que recargar la app.
