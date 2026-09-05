# TODO

Menores:

- [x] Indicador de "Sesión en vivo" que muestre que el director está en vivo a los músicos. El botón volver al vivo debe estar disponible solo cuando hay una sesión en vivo
- [ ] Reubicar botón "Volver al vivo"
- [ ] Buscador: debe buscar en título y letra
- [ ] Slitter resize trigger: barra debe ser más ancha para ser más facil de tomar y arrastrar.
- [ ] Botón "volver al vivo" no debe aparecer para director
- [ ] Cambiar: "Canciones" por "Repertorio", y "Book" por "Sesión"
- [ ] Agregar selector de acordes

Mayores:

- [ ] **Control de acceso al modo Director.** Hoy no hay autenticación: cualquiera que
      entre a `/director` (o toque "Cambiar a Modo Director" en Configuration) puede
      controlar la sesión en vivo, subir canciones y editar el book para todos los
      conectados. No hay `firestore.rules` en el repo que lo restrinja.
      Definir un enfoque (por ejemplo, un PIN/contraseña compartida entre directores,
      o Firebase Auth con roles) y aplicarlo tanto en el cliente como en reglas de
      Firestore.
