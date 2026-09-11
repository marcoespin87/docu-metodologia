# Spec: Auth (login y RBAC)

**Estado:** desplegado · **Última revisión:** 2026-09-11

## Propósito

Identificar quién hace cada solicitud al sistema y qué puede hacer, sin
implementar un sistema de identidad real: es una simulación suficiente
para que el resto de las capacidades puedan aplicar control de acceso
basado en roles (RBAC).

## Comportamiento

- Hay un conjunto fijo de usuarios seed (sin registro): dos con rol
  `cliente` (`ana`, `beto`) y uno con rol `administrador` (`carla`).
- `POST /auth/login` con `usuario`/`password` correctos devuelve `200`
  con `{ token, rol }`. Credenciales incorrectas o usuario inexistente
  devuelven `401` sin distinguir cuál de las dos causas fue.
- El token es opaco (no es un JWT decodificable) y solo tiene sentido
  para este proceso: se resuelve contra un mapa de sesiones en memoria.
- Cualquier endpoint protegido exige el header `Authorization: Bearer
  <token>`. Sin ese header, o con un token que no existe en el mapa de
  sesiones, la solicitud se rechaza con `401` antes de llegar al handler.
- Los endpoints que además restringen por rol (`requireRole(...roles)`)
  devuelven `403` si el usuario autenticado no tiene uno de los roles
  permitidos.
- El usuario resuelto por el token queda disponible como `req.usuario`
  para el resto del pipeline de Express.

## Invariantes (no negociables)

- **El rol y el id de usuario siempre se derivan del token, nunca de un
  parámetro que mande el cliente.** Por qué: es la base de todo el RBAC
  del sistema — si una capacidad confiara en un `clienteId` del body o
  la query, cualquier cliente podría leer o modificar pedidos ajenos.
- **Los tokens son estado de proceso, no se persisten a disco.** Por
  qué: son sesiones efímeras; persistirlas obligaría a resolver
  expiración y limpieza, complejidad no justificada por el alcance del
  ejercicio (YAGNI). Reiniciar el servidor invalida todas las sesiones.
- **Login no distingue "usuario inexistente" de "password incorrecta"
  en la respuesta.** Por qué: evitar que la API sirva como oráculo para
  enumerar usuarios válidos.

## Decisiones

- 2026-09-11: usuarios seed fijos, sin endpoint de registro — el alcance
  del ejercicio es demostrar RBAC, no un sistema de altas de usuario.
- 2026-09-11: token opaco generado con `crypto.randomBytes`, no JWT —
  no hay necesidad de que el token sea autocontenido ni verificable sin
  estado para este ejercicio.

## Fuera de alcance

- Registro de usuarios, recuperación de contraseña, expiración de
  tokens, refresh tokens.
- Cualquier forma de hashing de contraseñas (las contraseñas seed están
  en texto plano en el código): inaceptable en un sistema real, aceptado
  acá porque no son credenciales reales y el objetivo es la metodología.

## Referencias

- Código: `src/auth/auth.service.js`, `src/auth/auth.middleware.js`,
  `src/auth/auth.routes.js`.
- Tests: `test/auth.service.test.js`, `test/auth.middleware.test.js`,
  `test/auth.routes.test.js`.
- Plan de origen: `docs/plan-sistema-pedidos-2026-09-11.md` (fase F0).
