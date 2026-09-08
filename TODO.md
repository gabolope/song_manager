# TODO

Menores:

- [x] Indicador de "Sesión en vivo" que muestre que el director está en vivo a los músicos. El botón volver al vivo debe estar disponible solo cuando hay una sesión en vivo
- [x] Reubicar botón "Volver al vivo", debe estar en el livebar de los músicos
- [x] Buscador: debe buscar en título y letra
- [x] Slitter resize trigger: barra debe ser más ancha para ser más facil de tomar y arrastrar.
- [x] Botón "volver al vivo" no debe aparecer para director
- [x] Cambiar: "Canciones" por "Repertorio", y "Book" por "Sesión"
- [x] Agregar skelletons en listas de repertorio y sesión
- [x] Mover "Go Live" al centro
- [x] "Crear usuario" debe cerrar el Dialog actual y abrir otro dialog independiente
- [x] Buscador debe ignorar caracteres especiales y no ser case sensitive, tomar ñ como n, tomar á como a, etc.
- [ ] Buscador debe ignorar comas y puntos

Intermedios:

- [ ] Agregar selector de acordes
- [ ] Mover páginas y componentes a carpetas separadas.
- [ ] Agregar habilidad de editar y borrar usuarios sólo para admins.
- [ ] Indicador de si la canción que se está viendo es del repertorio o de la sesión
- [ ] Canciones vistas del repertorio no deben tener indicador de siguiente en la lista.
- [ ] Optimizar DB para subir canciones de formato chordle. Debe seguir las siguientes reglas: eliminar las notaciones manuales (A1, B2, C3). Y debe clasificarlas en rápidas (\_1), intermedias (\_2) y lentas (\_3)

Mayores:

- [x] Implementar auth. Que hayan usuarios admin (director) y musicos. Los admin pueden crear nuevos usuarios. Los usuarios entran con email y contraseña, y tienen un avatar que pueden elegir de un listado de íconos (distintos instrumentos digitales). No habrá una sección de crear cuenta de manera pública, es todo interno. Los admin podrán editar canciones y crear listas, subir canciones, además de iniciar el vivo. Aplicar este enfoque tanto en el cliente como en reglas de Firestore.
- [x] Agregar modo demo. Para que personas interesadas o recruiters puedan entrar a la app sin auth. Debe haber un botón en la página de login que diga algo como "Probar aplicación sin credenciales" o algo de ese estilo que sea mejor UX. Dentro del modo demo deben haber 6 canciones populares.
- [ ] Agregar habilidad de editar canciones.
- [ ] Agregar habilidad de crear distintas listas (sesiones)
- [ ] Agregar botones de aumentar tamaño de letra
- [ ] Agregar habilidad de subir y bajar tono en vivo para directores
