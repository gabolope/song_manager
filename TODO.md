# TODO

- [ ] **Control de acceso al modo Director.** Hoy no hay autenticación: cualquiera que
      entre a `/director` (o toque "Cambiar a Modo Director" en Configuration) puede
      controlar la sesión en vivo, subir canciones y editar el book para todos los
      conectados. No hay `firestore.rules` en el repo que lo restrinja.
      Definir un enfoque (por ejemplo, un PIN/contraseña compartida entre directores,
      o Firebase Auth con roles) y aplicarlo tanto en el cliente como en reglas de
      Firestore.
