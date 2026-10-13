# TODO

Menores:

- [ ] Al terminar de editar una canción, mostrar la que se acaba de editar (hoy vuelve a la canción en vivo si hay una)
- [ ] Opción de ver el ChordPro puro
- [ ] Agregar tipo de sección pre-coro

Intermedios:

- [ ] Agregar habilidad de editar y borrar usuarios sólo para admins.
- [ ] Indicador de si la canción que se está viendo es del repertorio o de la sesión
- [ ] Botón en la sesión que abra un dialog para ordenar las canciones con botones (subir/bajar), borrar una canción y vaciar la sesión (con confirmación)
- [ ] En líneas de acordes, el texto entre `*...*` son indicaciones: no se transponen y se muestran con menos peso y otro color
- [ ] Modo lyrics: desacoplar los botones en una ventana aparte

Mayores:

- [ ] Agregar habilidad de crear distintas listas (sesiones)
- [ ] Preferencias de visualización (color de letra y acordes, fuente, color de fondo) guardadas en el perfil del usuario
- [ ] Que cualquiera (sin cuenta) se conecte a la sesión con un link o QR y vea solo la canción en vivo

## Multi-equipo

Modelo: subcolecciones por equipo (`teams/{teamId}/songs|book|liveSong|broadcast`) y `teamId` en `users/{uid}`. Un usuario = un equipo por ahora. Ya está en prod (equipo `betesda`).

Limpieza:

- [ ] Borrar las colecciones globales viejas: `--delete-old` (sin `--team-name`; dry run y después `--write`). Solo borra si las cantidades coinciden con las del equipo: si Betesda ya agregó/borró canciones o cambió el book, va a frenar (ajustar el script o borrar a mano desde la consola). Esperar unos usos reales: son el backup. Después sacar de `firestore.rules` los bloques `match /songs|book|liveSong|broadcast` globales y la mención de backup en CLAUDE.md
- [ ] Revocar las claves de `keys/` cuando ya no se use el script (Google Cloud Console → IAM → Cuentas de servicio → `firebase-adminsdk-…` → Claves)

Más adelante (solo si hace falta):

- [ ] Custom claims (`teamId`, `role`) para no pagar un `get()` por regla
- [ ] Usuario en varios equipos: `teams/{t}/members/{uid}` + selector de equipo
- [ ] Varias sesiones por equipo: `teams/{t}/sessions/{s}/book|liveSong`
- [ ] Registro/invitaciones self-service
- [ ] Importar canciones de otro equipo
