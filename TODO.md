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

Rama: `teams_implementation`.

0. Entorno de pruebas (antes de tocar nada)
   - [x] Proyecto Firebase de desarrollo (`song-manager-dev-a7fd4`); `firebase.ts` lo usa si `import.meta.env.DEV`
   - [x] Alias en `.firebaserc`: `default`/`dev` → desarrollo, `prod` → producción
   - [x] Reglas actuales desplegadas en dev (`firebase deploy --only firestore:rules`)
   - [x] Primer admin creado en dev (Auth + doc `users/{uid}` con `role: "admin"`); alta de músicos desde la app verificada
   - [ ] No desplegar `firestore.rules` a `prod` desde la rama: las reglas nuevas rompen la app publicada; se despliegan recién al mergear a `main`

1. Modelo y reglas
   - [x] Definir `teams/{teamId}` (`name`, `createdAt`) y agregar `teamId` a `UserProfile` (`types/user.ts`)
   - [x] Reescribir `firestore.rules`: helpers `myTeam()`, `isMember(t)`, `isTeamAdmin(t)`; `match /teams/{teamId}/{col}/{docId}` lectura para miembros, escritura para admins del equipo
   - [x] `users`: lectura solo de usuarios del mismo equipo (hoy cualquier logueado lee todos)
   - [x] `users`: create/update solo si `request.resource.data.teamId == myTeam()` (evitar que un admin se pase o cree admins en otro equipo)
   - [x] Evitar que un admin cambie su propio `teamId` (cubierto por la regla de update)
2. Código
   - [x] Helper de rutas `teamCol(teamId, name)` / `teamDoc(teamId, name, id)` en `services/firebase.ts`
   - [x] Exponer `teamId` desde `AuthContext` (sale de `profile.teamId`)
   - [x] Migrar rutas en `services/songs.service.ts` (fetch/update/delete + propagación a book y liveSong)
   - [x] Migrar rutas en `hooks/onSongUpload.ts`
   - [x] Migrar rutas en `hooks/useBook.ts` y `hooks/useBookMutations.ts`
   - [x] Migrar rutas en `hooks/useLiveSong.ts`
   - [x] Migrar rutas en `components/BroadcastMessage.tsx` y `pages/DirectorPage/SendMessageDialog.tsx`
   - [x] `services/auth.service.ts`: `fetchUsers` filtrado por equipo; `createUserAccount` guarda el `teamId` del admin creador
   - [x] Incluir `teamId` en las query keys (`["book", teamId]`, `["songs", teamId]`, `["liveSong", teamId]`, `["users", teamId]`) para no mezclar cache al cambiar de cuenta
   - [x] Verificar que el modo demo sigue funcionando (no tiene `teamId`)
   - [x] Mostrar el nombre del equipo en la UI (ej. `UserBadge` o `Layout`)
3. Migración de datos
   - [x] Script único con `firebase-admin` (`scripts/migrate-to-teams.mjs`, dry run por defecto): crear `teams/{equipoActual}` y copiar `songs`, `book`, `liveSong`, `broadcast`; setea `teamId` en los `users` que no tienen; `--delete-old` borra las globales
   - [x] Descargar claves de cuenta de servicio (Firebase Console → ⚙ Configuración del proyecto → Cuentas de servicio → "Generar nueva clave privada") y guardarlas como `keys/dev.json` y `keys/prod.json` (`keys/` está en .gitignore; nunca compartirlas)
   - [x] Probar el script en dev leyendo los datos reales de prod (a prod solo se le lee). Reemplaza al emulador: pide Java 21 y acá hay Java 8. Usar el mismo `teamId` que ya tiene el admin de dev: (hecho con `--team-id test --team-name "Betesda"`; hizo falta desplegar las reglas nuevas a dev)
     1. Dry run: `node scripts/migrate-to-teams.mjs --key keys/dev.json --source-key keys/prod.json --team-id <id> --team-name "<nombre>"`
     2. Si los números cierran, repetir con `--write` y revisar en la app (`npm run dev`) repertorio, book, en vivo y mensajes
   - [x] Setear `teamId` en todos los docs de `users` (lo hace el script; hecho en dev y prod)
   - [x] Antes de prod, terminar de revisar en dev: mensaje de broadcast, que editar una canción del book se propague, y login de un músico en `/player`
   - [x] Deploy en orden: script → reglas → código. Al revés no: el código nuevo con reglas viejas deja la app vacía (no hay `match /teams`; pasó en dev). Las reglas nuevas mantienen las globales, así que la app vieja sigue andando; en ese rato solo falla la lista/alta de usuarios (piden `teamId`)
     1. Script en prod: `node scripts/migrate-to-teams.mjs --key keys/prod.json --team-id betesda --team-name "Betesda"` (dry run y después `--write`)
     2. `firebase deploy --only firestore:rules --project prod`
     3. Merge a `main` (deploy del código en Vercel), enseguida después de las reglas
   - [x] Probar con dos equipos y dos cuentas en paralelo (en dev, con un equipo creado desde `/admin`)
   - [ ] Borrar las colecciones globales viejas: `--delete-old` (sin `--team-name`; dry run y después `--write`). Solo borra si las cantidades coinciden con las del equipo: si Betesda ya agregó/borró canciones o cambió el book, va a frenar (ajustar el script o borrar a mano desde la consola). Esperar unos usos reales: son el backup. Después sacar de `firestore.rules` los bloques `match /songs|book|liveSong|broadcast` globales y la mención de backup en CLAUDE.md
   - [ ] Revocar las claves de `keys/` cuando ya no se use el script (Google Cloud Console → IAM → Cuentas de servicio → `firebase-adminsdk-…` → Claves)
4. Alta de equipos
   - [x] Página `/admin` (solo superadmin, doc `superadmins/{uid}`): crear equipos, crear usuarios en cualquier equipo, cambiar rol y mover entre equipos
   - [x] Crear `superadmins/{uid}` a mano en dev y en prod
   - [x] Desplegar reglas a dev y probar `/admin` (crear equipo + director; el equipo nuevo no ve nada de Betesda)
   - [x] Prod: crear `superadmins/{uid}`, `firebase deploy --only firestore:rules --project prod` y merge a `main`
   - [x] Documentar el proceso en README.md y actualizar CLAUDE.md con el nuevo modelo
5. Más adelante (solo si hace falta)
   - [ ] Custom claims (`teamId`, `role`) para no pagar un `get()` por regla
   - [ ] Usuario en varios equipos: `teams/{t}/members/{uid}` + selector de equipo
   - [ ] Varias sesiones por equipo: `teams/{t}/sessions/{s}/book|liveSong`
   - [ ] Registro/invitaciones self-service
   - [ ] Importar canciones de otro equipo
