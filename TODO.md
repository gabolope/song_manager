# TODO

Menores:

Intermedios:

- [ ] Agregar habilidad de editar y borrar usuarios sólo para admins.
- [ ] Indicador de si la canción que se está viendo es del repertorio o de la sesión

Mayores:

- [ ] Agregar habilidad de crear distintas listas (sesiones)
- [ ] Multi-equipo: que otros equipos usen la app con su propio repertorio, usuarios y sesión en paralelo (ver abajo)

## Multi-equipo

Modelo: subcolecciones por equipo (`teams/{teamId}/songs|book|liveSong|broadcast`) y `teamId` en `users/{uid}`. Un usuario = un equipo por ahora.

1. Modelo y reglas
   - [ ] Definir `teams/{teamId}` (`name`, `createdAt`) y agregar `teamId` a `UserProfile` (`types/user.ts`)
   - [ ] Reescribir `firestore.rules`: helpers `myTeam()`, `isMember(t)`, `isTeamAdmin(t)`; `match /teams/{teamId}/{col}/{docId}` lectura para miembros, escritura para admins del equipo
   - [ ] `users`: lectura solo de usuarios del mismo equipo (hoy cualquier logueado lee todos)
   - [ ] `users`: create/update solo si `request.resource.data.teamId == myTeam()` (evitar que un admin se pase o cree admins en otro equipo)
   - [ ] Evitar que un admin cambie su propio `teamId`
2. Código
   - [ ] Helper de rutas `teamCol(teamId, name)` / `teamDoc(teamId, name, id)` en `services/firebase.ts`
   - [ ] Exponer `teamId` desde `AuthContext` (sale de `profile.teamId`)
   - [ ] Migrar rutas en `services/songs.service.ts` (fetch/update/delete + propagación a book y liveSong)
   - [ ] Migrar rutas en `hooks/onSongUpload.ts`
   - [ ] Migrar rutas en `hooks/useBook.ts` y `hooks/useBookMutations.ts`
   - [ ] Migrar rutas en `hooks/useLiveSong.ts`
   - [ ] Migrar rutas en `components/BroadcastMessage.tsx` y `pages/DirectorPage/SendMessageDialog.tsx`
   - [ ] `services/auth.service.ts`: `fetchUsers` filtrado por equipo; `createUserAccount` guarda el `teamId` del admin creador
   - [ ] Incluir `teamId` en las query keys (`["book", teamId]`, `["songs", teamId]`, `["liveSong", teamId]`, `["users", teamId]`) para no mezclar cache al cambiar de cuenta
   - [ ] Verificar que el modo demo sigue funcionando (no tiene `teamId`)
   - [ ] Mostrar el nombre del equipo en la UI (ej. `UserBadge` o `Layout`)
3. Migración de datos
   - [ ] Script único con `firebase-admin`: crear `teams/{equipoActual}` y copiar `songs`, `book`, `liveSong`, `broadcast`
   - [ ] Setear `teamId` en todos los docs de `users`
   - [ ] Deploy en orden: script → código → reglas
   - [ ] Probar con dos equipos y dos cuentas en paralelo (sesiones en vivo independientes, sin ver datos del otro)
   - [ ] Borrar las colecciones globales viejas
4. Alta de equipos
   - [ ] Script/manual: crear equipo + primer admin (después el admin crea sus músicos desde la app)
   - [ ] Documentar el proceso en README.md y actualizar CLAUDE.md con el nuevo modelo
5. Más adelante (solo si hace falta)
   - [ ] Custom claims (`teamId`, `role`) para no pagar un `get()` por regla
   - [ ] Usuario en varios equipos: `teams/{t}/members/{uid}` + selector de equipo
   - [ ] Varias sesiones por equipo: `teams/{t}/sessions/{s}/book|liveSong`
   - [ ] Registro/invitaciones self-service
   - [ ] Importar canciones de otro equipo
