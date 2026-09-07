# TODO

Menores:

- [x] Indicador de "Sesión en vivo" que muestre que el director está en vivo a los músicos. El botón volver al vivo debe estar disponible solo cuando hay una sesión en vivo
- [ ] Reubicar botón "Volver al vivo"
- [ ] Buscador: debe buscar en título y letra
- [ ] Slitter resize trigger: barra debe ser más ancha para ser más facil de tomar y arrastrar.
- [ ] Botón "volver al vivo" no debe aparecer para director
- [ ] Cambiar: "Canciones" por "Repertorio", y "Book" por "Sesión"
- [ ] Agregar selector de acordes
- [ ] Agregar skelletons
- [ ] Mover "Go Live" al centro

Intermedios:

- [ ] Mover páginas y componentes a carpetas separadas.
- [ ] Agregar habilidad de editar y borrar usuarios sólo para admins.
- [ ] Indicador de si la canción que se está viendo es del repertorio o de la sesión
- [ ] Canciones vistas del repertorio no deben tener indicador de siguiente en la lista.

Mayores:

- [x] Implementar auth. Que hayan usuarios admin (director) y musicos. Los admin pueden crear nuevos usuarios. Los usuarios entran con email y contraseña, y tienen un avatar que pueden elegir de un listado de íconos (distintos instrumentos digitales). No habrá una sección de crear cuenta de manera pública, es todo interno. Los admin podrán editar canciones y crear listas, subir canciones, además de iniciar el vivo. Aplicar este enfoque tanto en el cliente como en reglas de Firestore.
- [x] Agregar modo demo. Para que personas interesadas o recruiters puedan entrar a la app sin auth. Debe haber un botón en la página de login que diga algo como "Probar aplicación sin credenciales" o algo de ese estilo que sea mejor UX. Dentro del modo demo deben haber 6 canciones populares.
